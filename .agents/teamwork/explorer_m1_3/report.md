# Milestone 1: Base UI Primitives & Utility Modules Technical Specification

**Agent**: Explorer M1-3 (`teamwork_preview_explorer`)  
**Milestone**: M1 (Core Foundation & Types)  
**Workspace Root**: `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio`  
**Status**: Ready for Implementation  

---

## 1. Executive Summary & Architectural Scope

This specification provides the production-grade architectural blueprint for the base utility modules and UI primitives required in Milestone 1 of the Shopify Multi-Store Portfolio platform:

1. **`src/utils/cn.ts`**: High-performance class name merger merging `clsx` and `tailwind-merge` for deterministic Tailwind CSS conflict resolution.
2. **`src/utils/storage.ts`**: Hardened namespaced persistence layer (`shopify_portfolio:${storeId}:${key}`) with transparent in-memory quota fallback, corrupted JSON recovery, cross-store isolation, and cross-tab + same-window reactive event synchronization.
3. **`src/utils/formatters.ts`**: Comprehensive formatting suite handling currency (multi-currency, zero-cents trimming), dates (absolute & relative time), editorial reading time, ratings (star breakdown & review count summaries), and discount calculations.
4. **`src/components/common/ImageWithFallback.tsx`**: Resilient image component featuring zero-network inline SVG fallbacks with category-specific visual themes (Coffee, Fashion, Jewelry, Electronics), skeleton transitions, and layout-shift prevention.
5. **Base UI Primitives (`src/components/common/`)**:
   - `Button.tsx`: Theme-reactive button with 6 variants, 4 sizes, loading spinner, and icon slots.
   - `Modal.tsx`: Accessible portal dialog with focus trapping, Escape listener, and body scroll locking.
   - `Drawer.tsx`: Off-canvas slide-out sheet (right, left, bottom) powering the Cart Drawer, Mobile Navigation, and Filter Drawer.
   - `Badge.tsx`: Versatile metadata chip with status dots and theme-aware corner radii.
   - `Tabs.tsx`: Fully accessible WAI-ARIA tab group with keyboard navigation and line/pill/segmented styles.
   - `Toast.tsx`: Non-blocking notification dispatch system with stacking, auto-dismiss timers, and portal rendering.

All components and utilities are designed to integrate seamlessly with the theme system (`ThemeTokens`) defined in `PROJECT.md` and adhere to the strict test requirements outlined in `TEST_INFRA.md`.

---

## 2. Module 1: Class Name Merger (`src/utils/cn.ts`)

### 2.1 Rationale & Architecture
In a dynamic multi-store theme architecture, components receive both standard Tailwind utility classes and theme-injected classes (e.g. conditional radii or colors). Without conflict resolution, conflicting Tailwind classes (such as `p-4` and `p-6`, or `rounded-md` and `rounded-2xl`) produce non-deterministic CSS precedence based on stylesheet order. Combining `clsx` (conditional class aggregation) with `tailwind-merge` (AST-based Tailwind class deduplication) guarantees predictable styling.

### 2.2 Complete TypeScript Implementation
```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines conditional class names using `clsx` and resolves Tailwind CSS class
 * conflicts using `tailwind-merge`.
 *
 * @param inputs - Array of class strings, expressions, objects, or arrays
 * @returns Deduplicated, normalized class string
 *
 * @example
 * cn('px-4 py-2 text-white', isPrimary && 'bg-blue-600', 'px-6');
 * // Returns: 'py-2 text-white bg-blue-600 px-6'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### 2.3 Dependencies & Conflict Test Cases
- Dependencies: `clsx` (^2.1.0), `tailwind-merge` (^2.2.0).
- Key verification cases:
  1. `cn('text-sm', 'text-lg')` -> `'text-lg'`
  2. `cn('rounded-md', isSpecial && 'rounded-full')` -> `'rounded-full'` (when true)
  3. `cn('bg-red-500', undefined, null, false, 'bg-blue-500')` -> `'bg-blue-500'`

---

## 3. Module 2: Namespaced Storage Utility (`src/utils/storage.ts`)

### 3.1 Architectural Principles & Key Namespace
To satisfy **Tier 3 / Scenario S5 (Multi-Store Shopping Isolation Check)** from `TEST_INFRA.md`:
- Every store-specific key MUST be formatted as:
  `shopify_portfolio:${storeId}:${key}`
- Global platform keys (e.g., active store slug or hub settings) use:
  `shopify_portfolio:global:${key}`
- This guarantees that actions performed in the **Coffee** store never contaminate or overwrite data in the **Fashion**, **Jewelry**, or **Electronics** stores.

### 3.2 Resilience Strategies: Quota, Corrupted Storage & SSR
1. **In-Memory Fallback (`MemoryStorage`)**:
   - In private/incognito browsing (Safari, iOS WebKit) or environments where storage is blocked, `localStorage.setItem` throws `QuotaExceededError` or `SecurityError`.
   - Also, in server-side or non-DOM test environments, `window.localStorage` may be undefined.
   - The utility maintains an internal in-memory map fallback. If `localStorage` is inaccessible or fails, operations fallback transparently to memory without throwing unhandled exceptions.
2. **Corrupted Data Protection**:
   - If an entry contains malformed or non-JSON data, `JSON.parse()` throws.
   - The utility intercepts `SyntaxError`, logs a diagnostic warning, removes the corrupted entry from storage, and returns the caller-supplied `defaultValue`.
3. **Cross-Tab & Same-Window Reactivity**:
   - Native `window.addEventListener('storage', ...)` fires **only in other tabs/windows**, not in the tab initiating the modification.
   - To provide instantaneous reactive synchronization across components in the **same tab** AND across **other open tabs**, the storage utility dispatches a custom `CustomEvent('shopify_portfolio:storage', { detail: { storeId, key, value } })`.
   - The `subscribeToStorage` helper registers listeners for both events.

### 3.3 Complete TypeScript Implementation
```typescript
// src/utils/storage.ts

/**
 * Storage change payload dispatched across same-window subscribers.
 */
export interface StorageChangeEventDetail<T = unknown> {
  storeId: string;
  key: string;
  value: T | null;
  timestamp: number;
}

const STORAGE_EVENT_NAME = 'shopify_portfolio:storage_change';
const NAMESPACE_PREFIX = 'shopify_portfolio';

/**
 * Internal in-memory fallback store for SSR, private browsing quota blocks,
 * or environments where localStorage is disabled.
 */
class MemoryStorage {
  private memoryMap = new Map<string, string>();

  getItem(key: string): string | null {
    return this.memoryMap.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.memoryMap.set(key, value);
  }

  removeItem(key: string): void {
    this.memoryMap.delete(key);
  }

  clear(): void {
    this.memoryMap.clear();
  }

  keys(): string[] {
    return Array.from(this.memoryMap.keys());
  }
}

const memoryStorageFallback = new MemoryStorage();

/**
 * Safely determines if native window.localStorage is accessible and writable.
 */
function isNativeStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const probeKey = `__probe_${NAMESPACE_PREFIX}__`;
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isNativeStorageAvailable();

/**
 * Builds the canonical storage key.
 */
export function buildStorageKey(storeId: string, key: string): string {
  const normalizedStore = storeId.trim() || 'global';
  const normalizedKey = key.trim();
  return `${NAMESPACE_PREFIX}:${normalizedStore}:${normalizedKey}`;
}

/**
 * Retrieves and deserializes a value from storage with safe fallback.
 */
export function getStorageItem<T>(storeId: string, key: string, defaultValue: T): T {
  const fullKey = buildStorageKey(storeId, key);

  try {
    let rawValue: string | null = null;
    if (storageAvailable) {
      rawValue = window.localStorage.getItem(fullKey);
    } else {
      rawValue = memoryStorageFallback.getItem(fullKey);
    }

    if (rawValue === null || rawValue === undefined) {
      return defaultValue;
    }

    return JSON.parse(rawValue) as T;
  } catch (error) {
    // Graceful recovery: corrupted data -> purge corrupted key and return defaultValue
    console.warn(`[storage] Failed to parse item "${fullKey}". Resetting to default.`, error);
    removeStorageItem(storeId, key);
    return defaultValue;
  }
}

/**
 * Serializes and writes a value to storage. Falls back to memory if quota is exceeded.
 */
export function setStorageItem<T>(storeId: string, key: string, value: T): boolean {
  const fullKey = buildStorageKey(storeId, key);

  try {
    const serialized = JSON.stringify(value);

    if (storageAvailable) {
      try {
        window.localStorage.setItem(fullKey, serialized);
      } catch (quotaError) {
        console.warn(`[storage] LocalStorage quota exceeded or restricted. Falling back to memory for "${fullKey}".`, quotaError);
        memoryStorageFallback.setItem(fullKey, serialized);
      }
    } else {
      memoryStorageFallback.setItem(fullKey, serialized);
    }

    // Dispatch same-window synchronization event
    if (typeof window !== 'undefined') {
      const detail: StorageChangeEventDetail<T> = {
        storeId,
        key,
        value,
        timestamp: Date.now(),
      };
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail }));
    }

    return true;
  } catch (serializationError) {
    console.error(`[storage] Failed to serialize item "${fullKey}".`, serializationError);
    return false;
  }
}

/**
 * Removes a specific item from storage.
 */
export function removeStorageItem(storeId: string, key: string): void {
  const fullKey = buildStorageKey(storeId, key);

  try {
    if (storageAvailable) {
      window.localStorage.removeItem(fullKey);
    }
    memoryStorageFallback.removeItem(fullKey);

    if (typeof window !== 'undefined') {
      const detail: StorageChangeEventDetail<null> = {
        storeId,
        key,
        value: null,
        timestamp: Date.now(),
      };
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail }));
    }
  } catch (error) {
    console.error(`[storage] Failed to remove item "${fullKey}".`, error);
  }
}

/**
 * Clears all stored keys belonging exclusively to the given storeId.
 * Never deletes keys belonging to other stores or global config.
 */
export function clearStoreStorage(storeId: string): void {
  const prefix = `${NAMESPACE_PREFIX}:${storeId}:`;

  try {
    if (storageAvailable) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const currentKey = window.localStorage.key(i);
        if (currentKey && currentKey.startsWith(prefix)) {
          keysToRemove.push(currentKey);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    }

    // Clear from in-memory fallback
    memoryStorageFallback.keys().forEach((k) => {
      if (k.startsWith(prefix)) {
        memoryStorageFallback.removeItem(k);
      }
    });

    // Notify same-window subscribers
    if (typeof window !== 'undefined') {
      const detail: StorageChangeEventDetail<null> = {
        storeId,
        key: '*',
        value: null,
        timestamp: Date.now(),
      };
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail }));
    }
  } catch (error) {
    console.error(`[storage] Failed to clear storage for store "${storeId}".`, error);
  }
}

/**
 * Subscribes to storage changes for a specific store and key.
 * Triggers on both cross-tab native storage events AND same-window custom events.
 *
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToStorage<T>(
  storeId: string,
  key: string,
  callback: (newValue: T | null) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const targetFullKey = buildStorageKey(storeId, key);

  // Cross-tab listener (fires in other browser tabs)
  const handleNativeStorage = (event: StorageEvent) => {
    if (event.key === targetFullKey) {
      try {
        const parsed = event.newValue !== null ? (JSON.parse(event.newValue) as T) : null;
        callback(parsed);
      } catch {
        callback(null);
      }
    }
  };

  // Same-window listener (fires in current tab)
  const handleLocalCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<StorageChangeEventDetail<T>>;
    if (customEvent.detail) {
      const { storeId: eventStore, key: eventKey, value } = customEvent.detail;
      if (eventStore === storeId && (eventKey === key || eventKey === '*')) {
        callback(value);
      }
    }
  };

  window.addEventListener('storage', handleNativeStorage);
  window.addEventListener(STORAGE_EVENT_NAME, handleLocalCustomEvent);

  return () => {
    window.removeEventListener('storage', handleNativeStorage);
    window.removeEventListener(STORAGE_EVENT_NAME, handleLocalCustomEvent);
  };
}

/**
 * Factory creating a scoped storage interface for a given storeId.
 */
export function createStoreStorage(storeId: string) {
  return {
    get: <T>(key: string, defaultValue: T): T => getStorageItem<T>(storeId, key, defaultValue),
    set: <T>(key: string, value: T): boolean => setStorageItem<T>(storeId, key, value),
    remove: (key: string): void => removeStorageItem(storeId, key),
    clear: (): void => clearStoreStorage(storeId),
    subscribe: <T>(key: string, callback: (newValue: T | null) => void): (() => void) =>
      subscribeToStorage<T>(storeId, key, callback),
  };
}
```

---

## 4. Module 3: Formatting Utilities (`src/utils/formatters.ts`)

### 4.1 Rationale & Scope
E-commerce applications require consistent presentation of prices, discounts, thresholds, dates, reviews, and editorial metadata.
Key requirements:
1. **Currency**: Robust handling of varying currencies (`USD`, `EUR`, `GBP`, `JPY`, `CAD`). Zero-decimal formatting for Yen (`¥2,400`), 2-decimal formatting for standard currencies (`$24.00`), optional zero-cents stripping (`$24`), and delta formatting ("Add $15.00 more for Free Shipping").
2. **Dates & Timestamps**: ISO strings, UNIX timestamps, Date instances, and relative time expressions ("2 hours ago", "Yesterday").
3. **Reading Time**: Editorial articles (e.g., Coffee origin stories, Fashion lookbook editorials) require word count calculation and reading time computation.
4. **Ratings**: Numerical rounding, review count labels, and star icon breakdown calculations (`{ full, half, empty }`).
5. **Discounts**: Percentage calculations and savings amounts.

### 4.2 Complete TypeScript Implementation
```typescript
// src/utils/formatters.ts

/**
 * Options for currency formatting.
 */
export interface FormatCurrencyOptions {
  locale?: string;
  stripZeroCents?: boolean; // When true, renders "$24.00" as "$24"
  showCurrencyCode?: boolean; // When true, renders "USD $24.00" or "$24.00 USD"
}

/**
 * Formats a monetary number into a localized currency string.
 * Gracefully handles null, undefined, NaN, and negative values.
 *
 * @param amount - Numeric price in major currency units (e.g. 24.50)
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @param options - Custom formatting configuration
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD',
  options: FormatCurrencyOptions = {}
): string {
  const { locale = 'en-US', stripZeroCents = false, showCurrencyCode = false } = options;

  const validAmount = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
  const isZeroDecimalCurrency = ['JPY', 'KRW', 'VND'].includes(currency.toUpperCase());

  try {
    const fractionDigits = isZeroDecimalCurrency ? 0 : 2;

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      currencyDisplay: showCurrencyCode ? 'code' : 'symbol',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });

    let formatted = formatter.format(validAmount);

    if (stripZeroCents && !isZeroDecimalCurrency) {
      formatted = formatted.replace(/\.00(?=\D*$)/, '');
    }

    return formatted;
  } catch (error) {
    console.warn(`[formatters] Currency formatting failed for amount ${amount} (${currency})`, error);
    return `$${validAmount.toFixed(2)}`;
  }
}

/**
 * Formats remaining delta needed to reach free shipping threshold.
 *
 * @param currentSubtotal - Current cart subtotal
 * @param threshold - Free shipping target threshold
 * @param currency - Currency code
 * @returns Human-friendly status string
 */
export function formatFreeShippingDelta(
  currentSubtotal: number,
  threshold: number,
  currency: string = 'USD'
): { eligible: boolean; remainingAmount: number; message: string } {
  const subtotal = Math.max(0, currentSubtotal || 0);
  const remaining = Math.max(0, threshold - subtotal);
  const eligible = remaining <= 0;

  if (eligible) {
    return {
      eligible: true,
      remainingAmount: 0,
      message: 'You have unlocked Free Shipping!',
    };
  }

  const formattedRemaining = formatCurrency(remaining, currency);
  return {
    eligible: false,
    remainingAmount: remaining,
    message: `Add ${formattedRemaining} more for Free Shipping`,
  };
}

/**
 * Calculates percentage discount and monetary savings between compareAtPrice and price.
 */
export function formatDiscount(
  price: number,
  compareAtPrice?: number | null,
  currency: string = 'USD'
): { hasDiscount: boolean; percentage: number; label: string; savingsText: string } | null {
  if (!compareAtPrice || compareAtPrice <= price) {
    return null;
  }

  const savings = compareAtPrice - price;
  const percentage = Math.round((savings / compareAtPrice) * 100);

  return {
    hasDiscount: true,
    percentage,
    label: `-${percentage}%`,
    savingsText: `Save ${formatCurrency(savings, currency)}`,
  };
}

/**
 * Formats a Date object, ISO string, or timestamp into a localized date.
 */
export function formatDate(
  dateInput: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
  locale: string = 'en-US'
): string {
  if (!dateInput) return '';

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Formats relative time elapsed (e.g. "Just now", "4 hours ago", "3 days ago").
 */
export function formatRelativeTime(
  dateInput: string | number | Date | null | undefined,
  locale: string = 'en-US'
): string {
  if (!dateInput) return '';

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  const now = Date.now();
  const diffInSeconds = Math.round((date.getTime() - now) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 45) {
    return 'Just now';
  }

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (absDiff < 3600) {
      const minutes = Math.round(diffInSeconds / 60);
      return rtf.format(minutes, 'minute');
    }
    if (absDiff < 86400) {
      const hours = Math.round(diffInSeconds / 3600);
      return rtf.format(hours, 'hour');
    }
    if (absDiff < 2592000) {
      const days = Math.round(diffInSeconds / 86400);
      return rtf.format(days, 'day');
    }
    if (absDiff < 31536000) {
      const months = Math.round(diffInSeconds / 2592000);
      return rtf.format(months, 'month');
    }

    const years = Math.round(diffInSeconds / 31536000);
    return rtf.format(years, 'year');
  } catch {
    return formatDate(date, undefined, locale);
  }
}

/**
 * Computes estimated reading time from a text or markdown string.
 */
export function calculateReadingTime(
  content: string | null | undefined,
  wordsPerMinute: number = 200
): { minutes: number; text: string; wordCount: number } {
  if (!content || typeof content !== 'string') {
    return { minutes: 1, text: '1 min read', wordCount: 0 };
  }

  // Strip HTML tags and markdown symbols
  const cleanText = content.replace(/<[^>]*>/g, '').replace(/[#*_`~-]/g, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / Math.max(1, wordsPerMinute)));

  return {
    minutes,
    text: `${minutes} min read`,
    wordCount,
  };
}

/**
 * Formats a rating value and optional review count.
 * Clamps rating strictly between 0.0 and 5.0.
 */
export function formatRating(
  average: number | null | undefined,
  count?: number | null
): { formattedAverage: string; countLabel: string; fullSummary: string } {
  const safeAvg = typeof average === 'number' && !Number.isNaN(average) ? average : 0;
  const clamped = Math.min(5, Math.max(0, safeAvg));
  const formattedAverage = clamped.toFixed(1);

  const safeCount = typeof count === 'number' && !Number.isNaN(count) ? Math.max(0, count) : 0;
  const countLabel = safeCount === 1 ? '1 review' : `${safeCount.toLocaleString()} reviews`;
  const fullSummary = count !== undefined ? `${formattedAverage} (${countLabel})` : formattedAverage;

  return {
    formattedAverage,
    countLabel,
    fullSummary,
  };
}

/**
 * Returns exact star icon breakdown (full, half, empty) for 5-star visual rendering.
 */
export function getRatingStars(rating: number): { full: number; half: number; empty: number } {
  const safeRating = Math.min(5, Math.max(0, Number.isNaN(rating) ? 0 : rating));
  const full = Math.floor(safeRating);
  const remainder = safeRating - full;
  const half = remainder >= 0.25 && remainder < 0.75 ? 1 : remainder >= 0.75 ? 0 : 0;
  const adjustedFull = remainder >= 0.75 ? full + 1 : full;
  const empty = Math.max(0, 5 - adjustedFull - half);

  return { full: adjustedFull, half, empty };
}
```

---

## 5. Module 4: Resilient Image Component (`src/components/common/ImageWithFallback.tsx`)

### 5.1 Problem Statement & Network Failure Resilience
In portfolio and demo stores:
- Product catalogs load external mock images from Unsplash, Pexels, or Picsum URLs.
- External CDNs may drop connections, rate limit, or fail under offline / low-bandwidth conditions (exercised in **Scenario S6: Mobile Shopper Low-Bandwidth Run**).
- A broken browser `<img>` tag creates layout thrashing and an unpolished appearance.
- **Solution**:
  1. Catch `onError` and transition immediately to a crisp, styled **inline SVG fallback**.
  2. Because the SVG is generated completely in memory as inline vector markup or a data URI, it has **zero external network dependency**.
  3. The fallback reflects the industry theme (Coffee cup, Fashion hanger, Jewelry diamond crest, Electronics circuit/CPU).
  4. Smooth skeleton shimmer while loading (`onLoad` fade-in) prevents Cumulative Layout Shift (CLS).

### 5.2 Category SVG Generators
Inline SVG vectors for each industry category:
- **Coffee**: Stylized steaming espresso cup vector.
- **Fashion**: Minimalist architectural coat hanger / silhouette vector.
- **Jewelry**: Multi-faceted sparkling diamond crest vector.
- **Electronics**: Geometric circuit grid / microprocessor vector.
- **General**: Modern camera / placeholder frame.

### 5.3 Complete TypeScript Implementation
```tsx
// src/components/common/ImageWithFallback.tsx
import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export type ImageCategory = 'coffee' | 'fashion' | 'jewelry' | 'electronics' | 'general';
export type AspectRatioType = 'square' | 'portrait' | 'landscape' | 'wide' | 'auto';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackCategory?: ImageCategory;
  customFallbackSrc?: string;
  aspectRatio?: AspectRatioType;
  containerClassName?: string;
  showSkeleton?: boolean;
}

const ASPECT_RATIO_CLASSES: Record<AspectRatioType, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  auto: '',
};

/**
 * Category-specific inline SVG vector paths and badges.
 */
function renderCategoryVector(category: ImageCategory) {
  switch (category) {
    case 'coffee':
      return (
        <svg viewBox="0 0 64 64" className="w-16 h-16 text-amber-700/60" fill="currentColor">
          <path d="M46 22H14c-1.1 0-2 .9-2 2v18c0 7.7 6.3 14 14 14h8c7.7 0 14-6.3 14-14v-2h2c5.5 0 10-4.5 10-10s-4.5-10-10-10h-4v2zm4 8h2c2.2 0 4 1.8 4 4s-1.8 4-4 4h-2V30zM20 10c0-2.2 1.8-4 4-4s4 1.8 4 4v4h-8v-4zm12 0c0-2.2 1.8-4 4-4s4 1.8 4 4v4h-8v-4z" />
        </svg>
      );
    case 'fashion':
      return (
        <svg viewBox="0 0 64 64" className="w-16 h-16 text-neutral-600/60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="14" r="5" />
          <path d="M32 19v5l-20 12h40L32 24" />
          <path d="M12 36l8 22h24l8-22" />
        </svg>
      );
    case 'jewelry':
      return (
        <svg viewBox="0 0 64 64" className="w-16 h-16 text-amber-500/60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="18,16 46,16 56,28 32,54 8,28" />
          <polyline points="8,28 32,16 56,28" />
          <line x1="32" y1="54" x2="32" y2="16" />
        </svg>
      );
    case 'electronics':
      return (
        <svg viewBox="0 0 64 64" className="w-16 h-16 text-cyan-600/60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="14" width="36" height="36" rx="6" />
          <circle cx="32" cy="32" r="6" />
          <path d="M22 6v8M32 6v8M42 6v8M22 50v8M32 50v8M42 50v8M6 22h8M6 32h8M6 42h8M50 22h8M50 32h8M50 42h8" />
        </svg>
      );
    case 'general':
    default:
      return (
        <svg viewBox="0 0 64 64" className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="12" width="48" height="40" rx="4" />
          <circle cx="22" cy="24" r="4" />
          <path d="M56 42l-14-14-22 22" />
        </svg>
      );
  }
}

/**
 * Resilient image component with loading skeleton and inline SVG fallback.
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackCategory = 'general',
  customFallbackSrc,
  aspectRatio = 'square',
  containerClassName,
  className,
  loading = 'lazy',
  showSkeleton = true,
  ...restProps
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Reset state if src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const ratioClass = ASPECT_RATIO_CLASSES[aspectRatio];

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-100 dark:bg-neutral-900',
        ratioClass,
        containerClassName
      )}
    >
      {/* Loading Skeleton */}
      {isLoading && showSkeleton && !hasError && (
        <div
          className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-800 z-10"
          aria-hidden="true"
        />
      )}

      {/* Fallback View */}
      {hasError ? (
        customFallbackSrc ? (
          <img
            src={customFallbackSrc}
            alt={alt}
            className={cn('w-full h-full object-cover', className)}
            loading={loading}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center w-full h-full p-4 text-center bg-neutral-100 dark:bg-neutral-800/80"
            role="img"
            aria-label={alt}
          >
            {renderCategoryVector(fallbackCategory)}
            <span className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-[85%]">
              {alt || 'Product preview unavailable'}
            </span>
          </div>
        )
      ) : (
        /* Native Image */
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          {...restProps}
        />
      )}
    </div>
  );
};
```

---

## 6. Module 5: Base UI Primitives (`src/components/common/`)

### 6.1 `Button.tsx`
#### Architecture & Theme Integration
The button primitive serves as the primary interactive building block. It consumes dynamic CSS variables injected by `ThemeContext` (`var(--color-primary)`, `var(--radius-btn)`). It handles:
- 6 variants: `primary`, `secondary`, `outline`, `ghost`, `danger`, `link`.
- 4 sizes: `sm`, `md`, `lg`, `icon`.
- Loading spinner with accessible `aria-busy` and `aria-live`.
- Icon slots: `leftIcon` and `rightIcon`.
- Full-width block layout option.

#### Props Interface
```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}
```

#### Complete Implementation
```tsx
// src/components/common/Button.tsx
import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--color-primary,#111)] text-[var(--color-surface,#fff)] hover:opacity-90 active:scale-[0.98] shadow-sm',
  secondary:
    'bg-[var(--color-surface,#f4f4f5)] text-[var(--color-text,#18181b)] hover:bg-neutral-200 dark:hover:bg-neutral-800 active:scale-[0.98]',
  outline:
    'border border-[var(--color-border,#e4e4e7)] bg-transparent text-[var(--color-text,#18181b)] hover:bg-[var(--color-surface,#f4f4f5)] active:scale-[0.98]',
  ghost:
    'bg-transparent text-[var(--color-text,#18181b)] hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-[0.98]',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-sm',
  link:
    'p-0 h-auto bg-transparent text-[var(--color-primary,#111)] underline-offset-4 hover:underline shadow-none',
};

const SIZE_STYLES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  icon: 'h-10 w-10 p-0 justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      type = 'button',
      ...restProps
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400 rounded-[var(--radius-btn,0.5rem)]',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 pointer-events-none cursor-not-allowed',
          className
        )}
        {...restProps}
      >
        {isLoading ? (
          <>
            <svg
              className="w-4 h-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

---

### 6.2 `Modal.tsx`
#### Architecture & Accessibility
Modal is rendered through React `createPortal` to `document.body` so it is never constrained by parent overflow or stacking contexts.
Key accessibility & UX features:
- Focus trap and focus restoration on unmount.
- `Escape` key press listener to close modal.
- Body scroll locking (`document.body.style.overflow = 'hidden'`).
- ARIA semantics: `role="dialog"`, `aria-modal="true"`.
- Backdrop click dismiss with backdrop blur.
- Compound components: `Modal`, `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter`.

#### Complete Implementation
```tsx
// src/components/common/Modal.tsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  children: React.ReactNode;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] h-[90vh]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdropClick = true,
  children,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Lock body scroll & manage focus
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus container
    modalRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => closeOnBackdropClick && onClose()}
        aria-hidden="true"
      />

      {/* Dialog Surface */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full z-10 overflow-hidden bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111111)] rounded-[var(--radius-card,0.75rem)] shadow-2xl border border-[var(--color-border,#e5e7eb)] flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 outline-none',
          SIZE_CLASSES[size],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 border-b border-[var(--color-border,#e5e7eb)]">
            <div>
              {title && (
                <h2 id="modal-title" className="text-xl font-bold tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-[var(--color-text-muted,#71717a)]">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 -mt-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};
```

---

### 6.3 `Drawer.tsx`
#### Architecture & Placement Options
Drawers power three mission-critical components in this project:
1. **Cart Drawer** (`right` slide-in): Opened from the header cart trigger across desktop & mobile.
2. **Mobile Navigation Drawer** (`left` slide-in): Opened from the mobile hamburger menu.
3. **Filter Drawer** (`bottom` or `left`): Opened when filtering products on mobile / tablet.

Key features:
- Placements: `right`, `left`, `bottom`.
- Off-canvas slide animations via CSS transforms.
- Portal rendering into `document.body`.
- Esc key dismiss, backdrop click dismiss, body scroll lock.
- Fixed header, scrollable body, and fixed footer (crucial for Cart drawer checkout button).

#### Complete Implementation
```tsx
// src/components/common/Drawer.tsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

export type DrawerPlacement = 'right' | 'left' | 'bottom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const PLACEMENT_CLASSES: Record<DrawerPlacement, { container: string; panel: string; closed: string; open: string }> = {
  right: {
    container: 'justify-end',
    panel: 'h-full w-full max-w-md border-l',
    closed: 'translate-x-full',
    open: 'translate-x-0',
  },
  left: {
    container: 'justify-start',
    panel: 'h-full w-full max-w-md border-r',
    closed: '-translate-x-full',
    open: 'translate-x-0',
  },
  bottom: {
    container: 'items-end',
    panel: 'w-full max-h-[85vh] rounded-t-2xl border-t',
    closed: 'translate-y-full',
    open: 'translate-y-0',
  },
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = 'right',
  title,
  children,
  footer,
  className,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen && typeof document === 'undefined') return null;

  const placementConfig = PLACEMENT_CLASSES[placement];

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex transition-opacity duration-300',
        placementConfig.container,
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Panel'}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex flex-col bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#18181b)] border-[var(--color-border,#e4e4e7)] shadow-2xl transition-transform duration-300 ease-in-out outline-none',
          placementConfig.panel,
          isOpen ? placementConfig.open : placementConfig.closed,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border,#e4e4e7)]">
          {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : <div />}
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full transition-colors"
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-6 border-t border-[var(--color-border,#e4e4e7)] bg-[var(--color-surface,#ffffff)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
```

---

### 6.4 `Badge.tsx`
#### Architecture & Variants
Used for e-commerce status pills ("Sale", "New", "Sold Out", "25% OFF", inventory counts).
- Variants: `default`, `primary`, `secondary`, `outline`, `success`, `warning`, `danger`, `sale`.
- Sizes: `sm`, `md`.
- Status dot option (`dot?: boolean`) with optional animated pulse.

#### Complete Implementation
```tsx
// src/components/common/Badge.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'sale';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulseDot?: boolean;
  icon?: React.ReactNode;
}

const BADGE_VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  primary: 'bg-[var(--color-primary,#111)] text-[var(--color-surface,#fff)]',
  secondary: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
  outline: 'border border-[var(--color-border,#e5e7eb)] text-[var(--color-text,#111)] bg-transparent',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  sale: 'bg-red-600 text-white font-bold tracking-wide uppercase',
};

const BADGE_SIZES: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  pulseDot = false,
  icon,
  className,
  children,
  ...restProps
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-[var(--radius-badge,9999px)] transition-colors select-none',
        BADGE_VARIANTS[variant],
        BADGE_SIZES[size],
        className
      )}
      {...restProps}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulseDot && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
```

---

### 6.5 `Tabs.tsx`
#### Architecture & WAI-ARIA Accordance
Follows the WAI-ARIA Tabs Design Pattern. Used for:
- Product Page (Description, Specifications, Shipping, Reviews).
- Account Page (Profile, Orders, Addresses, Wishlist).
- Collection filtering tabs.

Features:
- Keyboard navigation: ArrowRight / ArrowLeft / Home / End focus cycling.
- Styles: `line` (active underline), `pill` (pill container), `segmented` (modern tech segment controller).
- Compound component API: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.

#### Complete Implementation
```tsx
// src/components/common/Tabs.tsx
import React, { createContext, useContext, useState, useRef } from 'react';
import { cn } from '../../utils/cn';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: 'line' | 'pill' | 'segmented';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs compound components must be rendered inside a <Tabs> parent.');
  return context;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  variant?: 'line' | 'pill' | 'segmented';
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  variant = 'line',
  children,
  className,
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (val: string) => {
    if (value === undefined) setInternalTab(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={cn('w-full flex flex-col', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className, ...props }) => {
  const { variant } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const triggers = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!triggers || triggers.length === 0) return;

    const list = Array.from(triggers);
    const currentIndex = list.findIndex((btn) => btn === document.activeElement);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % list.length;
      list[nextIndex].focus();
      list[nextIndex].click();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + list.length) % list.length;
      list[prevIndex].focus();
      list[prevIndex].click();
    } else if (e.key === 'Home') {
      list[0].focus();
      list[0].click();
    } else if (e.key === 'End') {
      list[list.length - 1].focus();
      list[list.length - 1].click();
    }
  };

  const variantContainerStyles = {
    line: 'border-b border-[var(--color-border,#e4e4e7)] gap-6',
    pill: 'gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl',
    segmented: 'grid grid-flow-col auto-cols-fr gap-1 bg-neutral-200/60 dark:bg-neutral-800/60 p-1 rounded-lg',
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn('flex items-center', variantContainerStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className, ...props }) => {
  const { activeTab, setActiveTab, variant } = useTabsContext();
  const isSelected = activeTab === value;

  const variantTriggerStyles = {
    line: cn(
      'pb-3 pt-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]',
      isSelected
        ? 'border-[var(--color-primary,#111)] text-[var(--color-text,#111)] font-semibold'
        : 'border-transparent text-[var(--color-text-muted,#71717a)] hover:text-[var(--color-text,#111)]'
    ),
    pill: cn(
      'px-4 py-2 text-sm font-medium rounded-lg transition-all',
      isSelected
        ? 'bg-[var(--color-surface,#fff)] text-[var(--color-text,#111)] shadow-xs'
        : 'text-[var(--color-text-muted,#71717a)] hover:text-[var(--color-text,#111)]'
    ),
    segmented: cn(
      'px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all text-center',
      isSelected
        ? 'bg-[var(--color-surface,#fff)] text-[var(--color-text,#111)] shadow-xs font-semibold'
        : 'text-[var(--color-text-muted,#71717a)] hover:text-[var(--color-text,#111)]'
    ),
  };

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => setActiveTab(value)}
      className={cn(
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 select-none cursor-pointer',
        variantTriggerStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className, ...props }) => {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('mt-6 focus-visible:outline-none animate-in fade-in-50 duration-150', className)}
      {...props}
    >
      {children}
    </div>
  );
};
```

---

### 6.6 `Toast.tsx`
#### Architecture & Context Dispatcher
Provides responsive, non-intrusive notification feedback (e.g., "Added to Cart", "Item Saved to Wishlist", "Discount Applied").
- Features:
  - Context Provider (`ToastProvider`) & hook (`useToast`).
  - Variants: `success`, `error`, `info`, `warning`.
  - Auto-dismiss with configurable timeout (default: 3500ms).
  - Stacking with slide-in & fade animations.
  - Action button support (e.g. "View Cart").
  - ARIA `role="status"` and `aria-live="polite"`.

#### Complete Implementation
```tsx
// src/components/common/Toast.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (options: Omit<ToastItem, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a <ToastProvider>.');
  return context;
}

const TOAST_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'info', duration = 3500, action }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, title, description, variant, duration, action };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, description?: string) => toast({ title, description, variant: 'success' }), [toast]);
  const error = useCallback((title: string, description?: string) => toast({ title, description, variant: 'error' }), [toast]);
  const info = useCallback((title: string, description?: string) => toast({ title, description, variant: 'info' }), [toast]);
  const warning = useCallback((title: string, description?: string) => toast({ title, description, variant: 'warning' }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
            role="status"
            aria-live="polite"
          >
            {toasts.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 p-4 bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#18181b)] border border-[var(--color-border,#e4e4e7)] rounded-xl shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-200'
                )}
              >
                {TOAST_ICONS[item.variant || 'info']}
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{item.title}</p>
                  {item.description && <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{item.description}</p>}
                  {item.action && (
                    <button
                      type="button"
                      onClick={() => {
                        item.action?.onClick();
                        removeToast(item.id);
                      }}
                      className="mt-2 text-xs font-semibold text-[var(--color-primary,#111)] underline"
                    >
                      {item.action.label}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  aria-label="Dismiss toast"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};
```

---

## 7. Dynamic CSS Variable Injection & Theme Integration

The UI primitives consume custom properties injected at `:root` by `ThemeContext` (M2). The mappings align directly with the `ThemeTokens` specification:

| Theme Token Field | CSS Variable Injected into `:root` | Applied by Primitive Component |
|---|---|---|
| `theme.colors.primary` | `--color-primary` | `Button` (primary), `Badge` (primary), `Tabs` (active line) |
| `theme.colors.surface` | `--color-surface` | `Modal`, `Drawer`, `Toast`, `Button` (secondary) |
| `theme.colors.text` | `--color-text` | `Modal`, `Drawer`, `Toast`, `Tabs` |
| `theme.colors.textMuted` | `--color-text-muted` | Descriptions, empty states, subtitles |
| `theme.colors.border` | `--color-border` | `Modal`, `Drawer`, `Badge` (outline), `Tabs` border |
| `theme.shape.borderRadius` | `--radius-btn`, `--radius-card`, `--radius-badge` | Corner rounding per store (`rounded-none` for Fashion, `rounded-2xl` for Coffee) |

---

## 8. Testability & Verification Guide (Tiers 1–4 Integration)

### 8.1 Unit Test Specifications for Utilities
- **`src/utils/cn.ts`**:
  - Test merging conflicting padding (`px-4 px-8` -> `px-8`).
  - Test conditional boolean expressions (`false && 'hidden'`).
  - Test array inputs with falsy items.
- **`src/utils/storage.ts`**:
  - **Namespacing**: Verify `setStorageItem('coffee', 'cart', [1])` writes to key `shopify_portfolio:coffee:cart`. Verify `getStorageItem('fashion', 'cart', [])` returns `[]`.
  - **Quota Exceeded Fallback**: Mock `window.localStorage.setItem` throwing `QuotaExceededError`. Assert `setStorageItem` catches error and falls back to memory, and subsequent `getStorageItem` successfully retrieves the item.
  - **Corrupted JSON**: Write invalid string `{broken` into localStorage. Assert `getStorageItem` returns default value without uncaught exception.
  - **Multi-Tab Sync**: Dispatch synthetic `StorageEvent` and verify subscriber callback fires with parsed payload.
  - **Store Isolation Clear**: Populate keys for both `coffee` and `fashion`. Call `clearStoreStorage('coffee')`. Assert all `coffee` keys are removed, and all `fashion` keys remain intact.
- **`src/utils/formatters.ts`**:
  - `formatCurrency(24.5, 'USD')` -> `"$24.50"`.
  - `formatCurrency(24.0, 'USD', { stripZeroCents: true })` -> `"$24"`.
  - `formatCurrency(1500, 'JPY')` -> `"¥1,500"`.
  - `formatCurrency(null)` -> `"$0.00"`.
  - `formatFreeShippingDelta(35, 50, 'USD')` -> `"Add $15.00 more for Free Shipping"`.
  - `calculateReadingTime("word ".repeat(500))` -> `3 min read`.
  - `getRatingStars(4.5)` -> `{ full: 4, half: 1, empty: 0 }`.

### 8.2 Component Integration Test Specifications
- **`ImageWithFallback`**:
  - Render with broken `src`. Simulate `onError`. Verify inline category SVG appears with correct `alt` attribute.
  - Verify container applies correct aspect ratio class (`aspect-[3/4]`, `aspect-square`).
- **`Modal`**:
  - Render when `isOpen={true}`. Verify dialog portal is mounted in `document.body`.
  - Press `Escape` key. Verify `onClose` callback triggers.
  - Verify `document.body.style.overflow` is set to `'hidden'`.
- **`Drawer`**:
  - Test `placement="right"` (Cart Drawer) and `placement="left"` (Mobile Navigation).
  - Verify slide translation class transitions (`translate-x-full` -> `translate-x-0`).
- **`Tabs`**:
  - Render 3 tabs. Click Tab 2 -> verify Tab 2 content appears and Tab 1 disappears.
  - Press `ArrowRight` on Tab 1 trigger -> verify Tab 2 is focused and active.
- **`Toast`**:
  - Trigger `toast.success("Added to cart")`. Verify toast appears in DOM with success checkmark.
  - Advance timer by 3500ms -> verify toast is unmounted.

---

## 9. Next Steps for Implementation Worker
1. Once Explorer M1-1 (scaffolding) creates `package.json` and installs dependencies (`clsx`, `tailwind-merge`), and Explorer M1-2 finalizes `src/types/`, the implementation worker can write:
   - `src/utils/cn.ts`
   - `src/utils/storage.ts`
   - `src/utils/formatters.ts`
   - `src/components/common/ImageWithFallback.tsx`
   - `src/components/common/Button.tsx`
   - `src/components/common/Modal.tsx`
   - `src/components/common/Drawer.tsx`
   - `src/components/common/Badge.tsx`
   - `src/components/common/Tabs.tsx`
   - `src/components/common/Toast.tsx`
2. Run unit tests (`vitest run src/utils/`) to verify all edge cases before proceeding to Milestone 2 (State Engine).
