/**
 * E-Commerce Formatting Utilities
 *
 * Provides:
 * - Localized multi-currency formatting with zero-decimal awareness and zero-cents trimming
 * - Free shipping delta status messages
 * - Compare-at price discounts and savings
 * - Date and relative time formatting
 * - Reading time estimation
 * - Star rating breakdown calculation
 */

export interface FormatCurrencyOptions {
  locale?: string;
  stripZeroCents?: boolean; // When true, renders "$24.00" as "$24"
  showCurrencyCode?: boolean; // When true, renders "USD $24.00" or "$24.00 USD"
}

/**
 * Formats a monetary number into a localized currency string.
 * Gracefully handles null, undefined, NaN, and negative values.
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD',
  options: FormatCurrencyOptions = {}
): string {
  const { locale = 'en-US', stripZeroCents = false, showCurrencyCode = false } = options;

  const rawAmount = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
  const validAmount = rawAmount === 0 ? 0 : rawAmount;
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
  const half = remainder >= 0.25 && remainder < 0.75 ? 1 : 0;
  const adjustedFull = remainder >= 0.75 ? full + 1 : full;
  const empty = Math.max(0, 5 - adjustedFull - half);

  return { full: adjustedFull, half, empty };
}
