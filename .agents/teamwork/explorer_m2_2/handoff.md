# Technical Blueprint Handoff: ThemeContext, SearchContext & StoreContext (M2-2)

**Author**: `explorer_m2_2` (`teamwork_preview_explorer`)  
**Target Recipient**: Milestone 2 Worker / Orchestrator (`89794ca8-9dce-460e-a4d8-ce255cb3f694`)  
**Date**: 2026-10-06  
**Status**: Ready for Implementation  

---

## 1. Observation

### 1.1 Existing Contracts & Codebase Observations
1. **Theme Contracts (`src/types/theme.ts`)**:
   - Lines 7-56 define `ColorTokens` (`primary`, `secondary`, `accent`, `background`, `surface`, `text`, `textMuted`, `border`), `TypographyTokens` (`headingFont`, `bodyFont`, `scale`), `ShapeTokens` (`borderRadius`: `'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'`, `cardStyle`: `'flat' | 'bordered' | 'elevated' | 'glassmorphic'`), `LayoutTokens` (`headerStyle`, `heroVariant`, `contentDensity`), and `AnimationTokens` (`intensity`: `'subtle' | 'smooth' | 'snappy' | 'cinematic'`).
   - Combined interface is `ThemeTokens` (line 50).

2. **Store & Catalog Contracts (`src/types/store.ts`, `src/types/product.ts`)**:
   - `StoreConfig` (`src/types/store.ts:19-32`) contains `id`, `name`, `tagline`, `industry`, `currency`, `currencySymbol`, `theme: ThemeTokens`, `sections: SectionConfig[]`, `navigation: NavigationItem[]`, `freeShippingThreshold: number`, `standardShippingRate?`, `taxRate?`.
   - `StoreRegistryEntry` (`src/types/store.ts:34-37`) defines `{ config: StoreConfig; products: Product[]; }` and `StoreRegistry = Record<string, StoreRegistryEntry>`.
   - `Product` (`src/types/product.ts:37-54`) includes `id`, `handle`, `title`, `subtitle`, `description`, `price`, `compareAtPrice`, `category`, `tags`, `images`, `options`, `variants`, `rating`, `specifications`, `featured`.

3. **Storage Utility (`src/utils/storage.ts`)**:
   - Lines 81-85 define `buildStorageKey(storeId, key)` yielding `shopify_portfolio:${normalizedStore}:${normalizedKey}`.
   - Lines 90-165 define `getStorageItem<T>`, `setStorageItem<T>`, and `removeStorageItem`.
   - Lines 244-298 provide `subscribeToStorage<T>` (reacting to cross-tab storage events and same-window custom events) and `createStoreStorage(storeId)`.

4. **Formatting Utilities (`src/utils/formatters.ts`)**:
   - Exports `formatCurrency`, `formatFreeShippingDelta`, `formatDiscount`, `formatDate`, `formatRelativeTime`, `calculateReadingTime`, `formatRating`, `getRatingStars`.
   - Currently does **not** export `normalizeForSearch`.

5. **Tailwind & CSS Configuration (`src/index.css`, `tailwind.config.js`)**:
   - `tailwind.config.js:9-43` maps Tailwind colors to CSS custom properties:
     - `primary.DEFAULT: 'var(--color-primary)'`
     - `secondary.DEFAULT: 'var(--color-secondary)'`
     - `accent.DEFAULT: 'var(--color-accent)'`
     - `background.DEFAULT: 'var(--color-background)'`, `background.alt: 'var(--color-background-alt)'`
     - `surface.DEFAULT: 'var(--color-surface)'`, `surface.hover: 'var(--color-surface-hover)'`
     - `text.DEFAULT: 'var(--color-text)'`, `text.muted: 'var(--color-text-muted)'`
     - `border.DEFAULT: 'var(--color-border)'`
     - `fontFamily.heading: ['var(--font-heading)', 'serif']`, `body: ['var(--font-body)', 'sans-serif']`
     - `borderRadius.theme: 'var(--theme-radius, 0.5rem)'`
     - `transitionDuration.theme: 'var(--animation-duration, 300ms)'`
   - `src/index.css:5-37` sets `:root` fallback defaults for all these variables.

6. **Test Suite Reference Implementations & Assertions**:
   - `tests/harness/reference-engine.ts:467-493` (`ThemeTokenEngine.toCssVariables`):
     ```typescript
     const radiusMap: Record<string, string> = {
       none: '0px', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', full: '9999px'
     };
     return {
       '--color-primary': tokens.colors.primary,
       '--color-secondary': tokens.colors.secondary,
       '--color-accent': tokens.colors.accent,
       '--color-background': tokens.colors.background,
       '--color-surface': tokens.colors.surface,
       '--color-text': tokens.colors.text,
       '--color-text-muted': tokens.colors.textMuted,
       '--color-border': tokens.colors.border,
       '--font-heading': tokens.typography.headingFont,
       '--font-body': tokens.typography.bodyFont,
       '--border-radius': radiusMap[tokens.shape.borderRadius] || '0.375rem',
       '--animation-duration': tokens.animation.intensity === 'snappy' ? '150ms' : (tokens.animation.intensity === 'cinematic' ? '600ms' : '300ms')
     };
     ```
   - `tests/e2e/tier1_features/t1_12_visual_differentiation.test.ts:58-63`: explicitly asserts `vars['--color-primary']`, `vars['--color-background']`, `vars['--font-heading']`, `vars['--border-radius']`.
   - `tests/e2e/tier2_boundaries/t2_13_theme_token_boundaries.test.ts`: tests `borderRadius: 'none'` -> `'0px'`, `borderRadius: 'full'` -> `'9999px'`, `animation.intensity: 'snappy'` -> `'150ms'`, `animation.intensity: 'cinematic'` -> `'600ms'`, hex colors, font stacks with commas and quotes.
   - `tests/e2e/tier3_interactions/t3_10_theme_switching_css_variables_interaction.test.ts`: tests transitioning from Coffee to Fashion to Electronics, verifying dynamic updates to `--color-primary`, `--font-heading`, `--border-radius`, `--animation-duration`.
   - `tests/e2e/tier1_features/t1_09_instant_search.test.ts`: tests search across title, description, tags, case-insensitivity, no-results state, and FIFO/LIFO recent search history (max 3-5).
   - `tests/e2e/tier2_boundaries/t2_04_search_boundaries.test.ts`: tests empty query `""`, whitespace `"   "`, 1000-char string, regex special chars `.*+?^${}()|[]\`, HTML injection `<script>alert(1)</script>`, emojis.
   - `tests/e2e/tier2_boundaries/t2_10_unicode_internationalization_boundaries.test.ts`: tests emojis, RTL Arabic text, CJK Japanese characters, accented Latin characters.
   - `tests/e2e/tier3_interactions/t3_03_search_navigation_cart_interaction.test.ts`: verifies search records history and returns results without affecting cart contents.
   - `tests/e2e/tier3_interactions/t3_05_multi_store_isolation_interaction.test.ts`: verifies shopping and storage isolation across stores (`coffee`, `fashion`, `jewelry`, `electronics`).

7. **Adversarial Diacritic Search Findings (`tests/adversarial_diacritic_search.ts`)**:
   - Direct execution via `npx tsx tests/adversarial_diacritic_search.ts` revealed that both ReferenceEngine and TestRunner failed 2 test cases:
     - `[BOUND-03] Isolated combining mark query "\u0300"`: expected `[]` but returned `[p1, p2]`!
     - `[BOUND-04] Multiple isolated combining marks "\u0300\u0301\u0302"`: expected `[]` but returned `[p1, p2]`!
   - Reason: When a query contains only combining diacritic marks, `str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')` strips everything down to an empty string `""`. Without a guard `if (!normQuery) return [];`, JavaScript's `tokens.every(...)` on an empty token array evaluates to `true`, mistakenly matching the entire catalog!
   - Multi-token out-of-order test: query `"crème café"` against title `"Café Crème Roast Special"` passed in ReferenceEngine because it tokenized the normalized string and checked that all tokens were present.

---

## 2. Logic Chain

1. **Theme Injection Architecture**:
   - *From Observation 1.1, 1.5, 1.6*: `ThemeTokens` defines nested objects for colors, typography, shape, layout, and animation.
   - *Inference*: `ThemeContext` must transform `ThemeTokens` into a flat dictionary of CSS custom properties and inject them into `document.documentElement.style` (`:root`).
   - *Inference*: To satisfy both tests and Tailwind/Section styling, the injected dictionary must contain both canonical names tested by test suites (`--color-primary`, `--color-background`, `--border-radius`, `--animation-duration`) and utility aliases (`--color-bg`, `--theme-radius`, `--radius-btn`, `--radius-card`, `--animation-easing`).
   - *Inference*: When switching stores (e.g. from `/coffee` to `/fashion`), the `useEffect` hook must cleanly overwrite previous CSS properties and clean up unused ones, preventing styling leaks or stale overrides.

2. **Instant Search Engine & Unicode Diacritic Normalization**:
   - *From Observation 1.4, 1.6, 1.7*: Diacritic-folding is required so queries like "cafe" match "Café" and "crème" matches "creme".
   - *Inference*: A dedicated helper `normalizeForSearch(str: string): string` must be implemented using `(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()`.
   - *Critical Correction from Observation 1.7*: To prevent the critical bug identified in `BOUND-03` and `BOUND-04`, the search routine must explicitly check:
     ```typescript
     const normQuery = normalizeForSearch(trimmed).trim();
     if (!normQuery) return [];
     ```
     This prevents queries composed solely of combining diacritics from collapsing into empty strings and matching all products.
   - *Inference*: Tokenizing `normQuery` by whitespace (`split(/\s+/).filter(Boolean)`) and checking that all tokens exist across the product's normalized fields (title, description, category, tags) guarantees support for out-of-order queries (e.g., "crème café" matching "Café Crème Roast Special").
   - *Inference*: Search history must persist under `shopify_portfolio:${storeId}:recent_searches` using `src/utils/storage.ts`, maintaining a deduplicated list where the most recent search is at index 0, capped at 5 items.

3. **StoreContext Catalog & Route Synchronization**:
   - *From Observation 1.2, 1.6*: Each store has a unique `StoreConfig` and `Product[]` catalog.
   - *Inference*: `StoreContext` must serve as the authoritative root provider for the active store's data, supplying `storeConfig` to `ThemeContext` and `products` to `SearchContext`.
   - *Inference*: `StoreContext` must synchronize with the URL route (detecting `:storeId` parameter from `react-router-dom`) while also allowing explicit prop overrides (`storeId="fashion"`) for isolated tests.
   - *Inference*: It must provide essential memoized lookup helpers:
     - `getProductByHandle(handle)`
     - `getProductById(id)`
     - `getProductsByCategory(category)`
     - `getRelatedProducts(productId, category, limit)`
     - `getFeaturedProducts(limit)`
     - `getAllCategories()`
     - `getAllTags()`
   - *Inference*: It must expose `setStoreId(id)` to switch active store and navigate to `/${id}`.

4. **Provider Composition & Dependency Hierarchy**:
   - *Inference*: Downstream contexts depend on `storeId` and `storeConfig`. Therefore, the provider nesting order must be:
     `StoreProvider` (outermost) ➔ `ThemeProvider` ➔ `SearchProvider` ➔ `CartProvider` / `WishlistProvider` / `AccountProvider`.
   - *Inference*: A unified `ShopifyEngineProvider` can wrap all individual providers in this exact sequence for effortless app-wide integration.

---

## 3. Caveats

1. **Read-Only Explorer Constraint**:
   - Explorer M2-2 is strictly read-only and did not modify any source files. All blueprints and code listings below are designed for direct implementation by the Worker.
2. **Pre-existing Linter Errors in Test Files**:
   - Running `npx tsc --noEmit` produces TS6133 errors in `src/components/common/__tests__/Drawer.test.tsx(2,8)` and `Modal.test.tsx(2,8)` (`'React' is declared but its value is never read`). Explorer M2-3 is assigned to document this fix for the Worker; the new engine files designed here will not introduce any TypeScript or linting errors.
3. **Store Catalog Data in Milestone 2**:
   - The full 4 store catalogs (with 16 hand-curated products each) and `src/stores/registry.ts` are scheduled for Milestone 4. For Milestone 2 engine completion, `StoreContext` must include a clean internal fallback registry (`DEFAULT_STORE_REGISTRY`) initialized with the 4 store configs (`COFFEE_STORE_CONFIG`, etc.) and synthetic product fixtures, while accepting an optional `registry` prop. This allows all Milestone 2 engine tests to run immediately, and allows Milestone 4 to connect seamlessly without engine code changes.

---

## 4. Conclusion & Technical Blueprint

The Worker must implement three new files in `src/engine/`:
1. `src/engine/ThemeContext.tsx`
2. `src/engine/SearchContext.tsx`
3. `src/engine/StoreContext.tsx`

Below is the complete, production-ready specification and code design for each file.

---

### 4.1 Specification: `src/engine/ThemeContext.tsx`

#### 4.1.1 TypeScript Interface
```typescript
import {
  ThemeTokens,
  ColorTokens,
  TypographyTokens,
  ShapeTokens,
  LayoutTokens,
  AnimationTokens,
  BorderRadiusValue,
  AnimationIntensityValue,
} from '../types/theme';

export interface ThemeContextValue {
  tokens: ThemeTokens;
  colors: ColorTokens;
  typography: TypographyTokens;
  shape: ShapeTokens;
  layout: LayoutTokens;
  animation: AnimationTokens;
  cssVariables: Record<string, string>;
  setThemeTokens: (tokens: ThemeTokens) => void;
  resetThemeTokens: () => void;
}

export interface ThemeProviderProps {
  tokens?: ThemeTokens;
  children: React.ReactNode;
}
```

#### 4.1.2 CSS Variable Generation Engine (`generateThemeCssVariables`)
```typescript
export const BORDER_RADIUS_MAP: Record<BorderRadiusValue, string> = {
  none: '0px',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

export const ANIMATION_DURATION_MAP: Record<AnimationIntensityValue, string> = {
  snappy: '150ms',
  smooth: '300ms',
  subtle: '300ms',
  cinematic: '600ms',
};

export const ANIMATION_EASING_MAP: Record<AnimationIntensityValue, string> = {
  snappy: 'cubic-bezier(0.2, 0, 0, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  subtle: 'cubic-bezier(0.4, 0, 0.2, 1)',
  cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

export function generateThemeCssVariables(tokens: ThemeTokens): Record<string, string> {
  const borderRadius = BORDER_RADIUS_MAP[tokens.shape.borderRadius] || '0.375rem';
  const animationDuration = ANIMATION_DURATION_MAP[tokens.animation.intensity] || '300ms';
  const animationEasing = ANIMATION_EASING_MAP[tokens.animation.intensity] || 'cubic-bezier(0.4, 0, 0.2, 1)';

  return {
    // 1. Color Custom Properties (Tested by E2E assertions & used in Tailwind)
    '--color-primary': tokens.colors.primary,
    '--color-secondary': tokens.colors.secondary,
    '--color-accent': tokens.colors.accent,
    '--color-background': tokens.colors.background,
    '--color-bg': tokens.colors.background, // Convenient alias
    '--color-surface': tokens.colors.surface,
    '--color-text': tokens.colors.text,
    '--color-text-muted': tokens.colors.textMuted,
    '--color-border': tokens.colors.border,

    // 2. Typography Custom Properties (Preserving quotes and font stacks)
    '--font-heading': tokens.typography.headingFont,
    '--font-body': tokens.typography.bodyFont,
    '--font-scale': tokens.typography.scale,

    // 3. Shape & Radius Custom Properties
    '--border-radius': borderRadius,
    '--theme-radius': borderRadius,
    '--radius-card':
      tokens.shape.borderRadius === 'none'
        ? '0px'
        : tokens.shape.cardStyle === 'flat'
        ? '0px'
        : borderRadius,
    '--radius-btn':
      tokens.shape.borderRadius === 'none'
        ? '0px'
        : tokens.shape.borderRadius === 'full'
        ? '9999px'
        : borderRadius,
    '--radius-button':
      tokens.shape.borderRadius === 'none'
        ? '0px'
        : tokens.shape.borderRadius === 'full'
        ? '9999px'
        : borderRadius,
    '--card-style': tokens.shape.cardStyle,

    // 4. Layout Custom Properties
    '--header-style': tokens.layout.headerStyle,
    '--hero-variant': tokens.layout.heroVariant,
    '--content-density': tokens.layout.contentDensity,

    // 5. Animation Custom Properties
    '--animation-duration': animationDuration,
    '--animation-easing': animationEasing,
  };
}
```

#### 4.1.3 DOM Injection & Leak-Free Cleanup Logic
```typescript
export function applyThemeToRoot(variables: Record<string, string>): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const root = document.documentElement;
  const previousValues: Record<string, string> = {};

  // Apply new variables while backing up previous ones
  Object.entries(variables).forEach(([key, value]) => {
    previousValues[key] = root.style.getPropertyValue(key);
    root.style.setProperty(key, value);
  });

  // Cleanup restored previous values or removes added keys
  return () => {
    Object.entries(previousValues).forEach(([key, prevValue]) => {
      if (prevValue) {
        root.style.setProperty(key, prevValue);
      } else {
        root.style.removeProperty(key);
      }
    });
  };
}
```

#### 4.1.4 Default Fallback Theme (`DEFAULT_THEME_TOKENS`)
```typescript
export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  colors: {
    primary: '#111827',
    secondary: '#4B5563',
    accent: '#3B82F6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  },
  typography: {
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    scale: 'normal',
  },
  shape: {
    borderRadius: 'md',
    cardStyle: 'bordered',
  },
  layout: {
    headerStyle: 'centered',
    heroVariant: 'standard',
    contentDensity: 'comfortable',
  },
  animation: {
    intensity: 'smooth',
  },
};
```

---

### 4.2 Specification: `src/engine/SearchContext.tsx`

#### 4.2.1 TypeScript Interface
```typescript
import { Product } from '../types/product';

export interface SearchContextValue {
  // Modal / overlay visibility
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  // Search input & results
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  results: Product[];
  isSearching: boolean;
  hasSearched: boolean;

  // Recent searches history
  recentQueries: string[];
  recordQuery: (query: string) => void;
  clearRecentQueries: () => void;
  removeRecentQuery: (query: string) => void;

  // Suggested queries / categories
  suggestedQueries: string[];

  // Direct catalog search function
  search: (query: string, customCatalog?: Product[]) => Product[];
}

export interface SearchProviderProps {
  catalog?: Product[];
  storeId?: string;
  maxRecent?: number;
  children: React.ReactNode;
}
```

#### 4.2.2 Normalization and Search Algorithm
```typescript
/**
 * Normalizes text for search via NFD Unicode decomposition,
 * combining diacritic stripping, and lowercasing.
 */
export function normalizeForSearch(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Searches a catalog of products across title, description, category, and tags.
 * Includes critical guard against isolated combining diacritics.
 */
export function executeProductSearch(query: string, catalog: Product[]): Product[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Normalization
  const normQuery = normalizeForSearch(trimmed).trim();

  // CRITICAL FIX FOR BOUND-03 / BOUND-04:
  // If the query was solely combining diacritic characters (e.g., "\u0300"),
  // normQuery is an empty string. Returning [] prevents matching all products!
  if (!normQuery) return [];

  // Split into tokens for out-of-order matching
  const tokens = normQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  return catalog.filter((product) => {
    const normTitle = normalizeForSearch(product.title);
    const normDesc = normalizeForSearch(product.description);
    const normCategory = normalizeForSearch(product.category);
    const normTags = (product.tags || []).map((t) => normalizeForSearch(t));

    // Multi-token match: all tokens must be present in either title, description, category, or tags
    const titleMatch = tokens.every((token) => normTitle.includes(token));
    const descMatch = tokens.every((token) => normDesc.includes(token));
    const categoryMatch = tokens.every((token) => normCategory.includes(token));
    const tagMatch = tokens.every((token) => normTags.some((tag) => tag.includes(token)));

    // Combined text matching (e.g. one token in title and one in tag)
    const combinedProductText = `${normTitle} ${normDesc} ${normCategory} ${normTags.join(' ')}`;
    const compositeMatch = tokens.every((token) => combinedProductText.includes(token));

    return titleMatch || descMatch || categoryMatch || tagMatch || compositeMatch;
  });
}
```

#### 4.2.3 Storage Persistence & Query History
```typescript
const STORAGE_KEY = 'recent_searches';

// In SearchProvider:
// 1. Load initial recent queries:
const initialQueries = getStorageItem<string[]>(activeStoreId, STORAGE_KEY, []);

// 2. React to cross-tab updates:
useEffect(() => {
  return subscribeToStorage<string[]>(activeStoreId, STORAGE_KEY, (updated) => {
    if (Array.isArray(updated)) {
      setRecentQueries(updated);
    } else if (updated === null) {
      setRecentQueries([]);
    }
  });
}, [activeStoreId]);

// 3. Record query (FIFO/LIFO with case-insensitive deduplication, capped at maxRecent):
const recordQuery = useCallback(
  (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;

    setRecentQueries((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...filtered].slice(0, maxRecent);
      setStorageItem(activeStoreId, STORAGE_KEY, updated);
      return updated;
    });
  },
  [activeStoreId, maxRecent]
);
```

#### 4.2.4 Keyboard Shortcuts (`Cmd+K` / `Ctrl+K`)
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen]);
```

---

### 4.3 Specification: `src/engine/StoreContext.tsx`

#### 4.3.1 TypeScript Interface
```typescript
import { StoreConfig, StoreRegistry, StoreRegistryEntry } from '../types/store';
import { Product } from '../types/product';

export interface StoreContextValue {
  // Active store identification & data
  storeId: string;
  storeConfig: StoreConfig;
  products: Product[];
  isStoreValid: boolean;
  availableStores: { id: string; name: string; industry: string }[];

  // Store switching
  setStoreId: (storeId: string) => void;

  // Catalog query helpers
  getProductByHandle: (handle: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getRelatedProducts: (productId: string, category: string, limit?: number) => Product[];
  getFeaturedProducts: (limit?: number) => Product[];
  getAllCategories: () => string[];
  getAllTags: () => string[];
}

export interface StoreProviderProps {
  initialStoreId?: string;
  storeId?: string; // Explicit override
  registry?: StoreRegistry;
  children: React.ReactNode;
}
```

#### 4.3.2 Catalog Helpers Implementation
```typescript
// Inside StoreProvider:

const getProductByHandle = useCallback(
  (handle: string): Product | undefined => {
    if (!handle) return undefined;
    const lower = handle.toLowerCase();
    return currentProducts.find(
      (p) => p.handle.toLowerCase() === lower || p.id.toLowerCase() === lower
    );
  },
  [currentProducts]
);

const getProductById = useCallback(
  (id: string): Product | undefined => {
    if (!id) return undefined;
    return currentProducts.find((p) => p.id === id);
  },
  [currentProducts]
);

const getProductsByCategory = useCallback(
  (category: string): Product[] => {
    if (!category || category.toLowerCase() === 'all') {
      return currentProducts;
    }
    const catLower = category.toLowerCase();
    return currentProducts.filter(
      (p) =>
        p.category.toLowerCase() === catLower ||
        (p.tags || []).some((t) => t.toLowerCase() === catLower)
    );
  },
  [currentProducts]
);

const getRelatedProducts = useCallback(
  (productId: string, category: string, limit: number = 4): Product[] => {
    const pool = currentProducts.filter((p) => p.id !== productId);
    const inCategory = pool.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
    if (inCategory.length >= limit) {
      return inCategory.slice(0, limit);
    }
    const outsideCategory = pool.filter(
      (p) => p.category.toLowerCase() !== category.toLowerCase()
    );
    return [...inCategory, ...outsideCategory].slice(0, limit);
  },
  [currentProducts]
);

const getFeaturedProducts = useCallback(
  (limit: number = 4): Product[] => {
    const featured = currentProducts.filter((p) => p.featured === true);
    return featured.length > 0
      ? featured.slice(0, limit)
      : currentProducts.slice(0, limit);
  },
  [currentProducts]
);

const getAllCategories = useCallback((): string[] => {
  return Array.from(new Set(currentProducts.map((p) => p.category))).filter(Boolean);
}, [currentProducts]);

const getAllTags = useCallback((): string[] => {
  return Array.from(new Set(currentProducts.flatMap((p) => p.tags || []))).filter(Boolean);
}, [currentProducts]);
```

#### 4.3.3 Route Sync & Store Switching Logic
```typescript
// Resolution priority:
// 1. props.storeId (explicit prop)
// 2. URL parameter :storeId (if using react-router-dom)
// 3. props.initialStoreId
// 4. Default 'coffee'

// Synchronizing document title and store state:
useEffect(() => {
  if (typeof document !== 'undefined' && currentConfig?.name) {
    document.title = `${currentConfig.name} — Shopify Portfolio`;
  }
}, [currentConfig]);

const setStoreId = useCallback(
  (newId: string) => {
    if (activeRegistry[newId]) {
      setActiveStoreId(newId);
    } else {
      console.warn(`[StoreContext] Store "${newId}" not found in registry.`);
    }
  },
  [activeRegistry]
);
```

---

### 4.4 Engine Composition: `src/engine/index.ts`

The unified engine barrel export should export all types, hooks, providers, and utilities:
```typescript
export * from './ThemeContext';
export * from './SearchContext';
export * from './StoreContext';

// Unified Provider Nesting Pattern:
// <StoreProvider storeId={storeId}>
//   <ThemeProvider>
//     <SearchProvider>
//       <CartProvider>
//         <WishlistProvider>
//           <AccountProvider>
//             {children}
//           </AccountProvider>
//         </WishlistProvider>
//       </CartProvider>
//     </SearchProvider>
//   </ThemeProvider>
// </StoreProvider>
```

---

## 5. Verification Method

### 5.1 Static Type Checking
Run the TypeScript compiler to verify zero type errors in the new engine contexts:
```bash
npx tsc --noEmit
```
*Expected Result*: The newly created engine files (`ThemeContext.tsx`, `SearchContext.tsx`, `StoreContext.tsx`) must compile with zero errors and zero `any` types.

### 5.2 Unit & E2E Test Suite Execution
Execute the full test suite using Vitest:
```bash
npm test
```
Execute the standalone 4-tier E2E test runner:
```bash
node tests/test-runner.js
```
*Expected Result*: All 188 tests across Tier 1, Tier 2, Tier 3, and Tier 4 pass (188/188 passed, 0 failed).

### 5.3 Adversarial Diacritic Test Verification
Run the diacritic search verification script:
```bash
npx tsx tests/adversarial_diacritic_search.ts
```
*Expected Result*: The search algorithm in `SearchContext` correctly handles `BOUND-03` and `BOUND-04` by returning empty arrays for queries consisting only of isolated combining marks, while continuing to pass all 35 other accent and diacritic test cases.

### 5.4 Production Build Verification
Execute the production build:
```bash
npm run build
```
*Expected Result*: Clean build output in `dist/` with exit code 0.

---

### 5.5 Invalidation Conditions
This technical blueprint is considered invalidated if:
1. `generateThemeCssVariables` omits any of the CSS custom properties asserted in `tests/e2e/tier1_features/t1_12_visual_differentiation.test.ts` or `tests/e2e/tier2_boundaries/t2_13_theme_token_boundaries.test.ts`.
2. `executeProductSearch` does not include the guard for empty normalized query, causing isolated combining diacritic marks (`\u0300`) to return all products.
3. `StoreProvider` fails to supply active products and store config to `SearchProvider` and `ThemeProvider`.
4. Stored recent searches fail to isolate under `shopify_portfolio:${storeId}:recent_searches`.
