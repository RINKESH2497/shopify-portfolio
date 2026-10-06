/**
 * Opaque-Box Reference Engine
 * Encapsulates the algorithmic and behavioral contracts specified in
 * ORIGINAL_REQUEST.md and PROJECT.md.
 */

import { Product, ProductVariant, StoreConfig, ThemeTokens } from '../fixtures/catalog-fixtures';
import { NamespacedStorage } from './environment';

export interface CartLineItem {
  id: string; // `${productId}-${variantId}`
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selectedOptions: Record<string, string>;
}

export interface CartCalculation {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingProgress: number; // 0 - 100
  amountNeededForFreeShipping: number;
  totalQuantity: number;
}

export class CartEngine {
  public items: CartLineItem[] = [];
  public isCartOpen: boolean = false;

  constructor(
    public storeConfig: StoreConfig,
    public storage?: NamespacedStorage
  ) {
    if (this.storage) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    if (!this.storage) return;
    const parsed = this.storage.get<CartLineItem[]>('cart_items', []);
    this.items = Array.isArray(parsed) ? parsed : [];
  }

  private saveToStorage() {
    if (!this.storage) return;
    this.storage.set('cart_items', this.items);
  }

  addItem(product: Product, variantId?: string, quantity: number = 1): CartLineItem {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const targetVariant: ProductVariant = variantId
      ? product.variants.find(v => v.id === variantId) || product.variants[0]
      : product.variants[0];

    if (!targetVariant) {
      throw new Error(`Variant not found on product ${product.id}`);
    }

    const lineItemId = `${product.id}-${targetVariant.id}`;
    const existingIndex = this.items.findIndex(item => item.id === lineItemId);

    let resultItem: CartLineItem;
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
      resultItem = this.items[existingIndex];
    } else {
      resultItem = {
        id: lineItemId,
        productId: product.id,
        variantId: targetVariant.id,
        title: product.title,
        variantTitle: targetVariant.title,
        price: targetVariant.price,
        quantity,
        imageUrl: targetVariant.imageUrl || (product.images[0]?.url ?? ''),
        selectedOptions: targetVariant.options
      };
      this.items.push(resultItem);
    }

    this.saveToStorage();
    return resultItem;
  }

  removeItem(lineItemId: string): void {
    this.items = this.items.filter(item => item.id !== lineItemId);
    this.saveToStorage();
  }

  updateQuantity(lineItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(lineItemId);
      return;
    }
    const target = this.items.find(item => item.id === lineItemId);
    if (target) {
      target.quantity = quantity;
      this.saveToStorage();
    }
  }

  clear(): void {
    this.items = [];
    this.saveToStorage();
  }

  getCalculation(): CartCalculation {
    const rawSubtotal = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const subtotal = Math.round(rawSubtotal * 100) / 100;
    const totalQuantity = this.items.reduce((acc, item) => acc + item.quantity, 0);

    const threshold = this.storeConfig.freeShippingThreshold;
    const qualifiesForFreeShipping = subtotal >= threshold && subtotal > 0;
    const shipping = (qualifiesForFreeShipping || this.items.length === 0)
      ? 0.0
      : this.storeConfig.standardShippingRate;

    const tax = Math.round((subtotal * this.storeConfig.taxRate) * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    let freeShippingProgress = 0;
    let amountNeededForFreeShipping = 0;

    if (threshold > 0) {
      freeShippingProgress = Math.min(100, Math.round((subtotal / threshold) * 100));
      amountNeededForFreeShipping = Math.max(0, Math.round((threshold - subtotal) * 100) / 100);
    }

    return {
      subtotal,
      shipping,
      tax,
      total,
      freeShippingThreshold: threshold,
      freeShippingProgress,
      amountNeededForFreeShipping,
      totalQuantity
    };
  }
}

// -------------------------------------------------------------
// WISHLIST ENGINE
// -------------------------------------------------------------

export class WishlistEngine {
  public productIds: Set<string> = new Set();

  constructor(
    public storeId: string,
    public storage?: NamespacedStorage
  ) {
    if (this.storage) {
      this.load();
    }
  }

  private load() {
    if (!this.storage) return;
    const ids = this.storage.get<string[]>('wishlist', []);
    this.productIds = new Set(ids);
  }

  private save() {
    if (!this.storage) return;
    this.storage.set('wishlist', Array.from(this.productIds));
  }

  add(productId: string): void {
    this.productIds.add(productId);
    this.save();
  }

  remove(productId: string): void {
    this.productIds.delete(productId);
    this.save();
  }

  toggle(productId: string): boolean {
    if (this.productIds.has(productId)) {
      this.remove(productId);
      return false;
    } else {
      this.add(productId);
      return true;
    }
  }

  has(productId: string): boolean {
    return this.productIds.has(productId);
  }

  moveToCart(product: Product, cartEngine: CartEngine, variantId?: string): void {
    this.remove(product.id);
    cartEngine.addItem(product, variantId, 1);
  }

  clear(): void {
    this.productIds.clear();
    this.save();
  }
}

// -------------------------------------------------------------
// FILTER & SORT ENGINE
// -------------------------------------------------------------

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  minRating?: number;
}

export type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'bestselling';

export class CatalogFilterEngine {
  static filter(products: Product[], filters: ProductFilters): Product[] {
    return products.filter(product => {
      // Category filter
      if (filters.category && filters.category !== 'all') {
        const catNorm = filters.category.toLowerCase();
        if (product.category.toLowerCase() !== catNorm && !product.tags.some(t => t.toLowerCase() === catNorm)) {
          return false;
        }
      }

      // Price range
      if (typeof filters.minPrice === 'number' && product.price < filters.minPrice) {
        return false;
      }
      if (typeof filters.maxPrice === 'number' && product.price > filters.maxPrice) {
        return false;
      }

      // Rating filter
      if (typeof filters.minRating === 'number' && product.rating.average < filters.minRating) {
        return false;
      }

      // Option filter (e.g. Color, Size, Grind, Metal)
      if (filters.color) {
        const hasColor = product.variants.some(v =>
          Object.entries(v.options).some(([k, val]) =>
            k.toLowerCase() === 'color' && val.toLowerCase() === filters.color?.toLowerCase()
          )
        );
        if (!hasColor) return false;
      }

      if (filters.size) {
        const hasSize = product.variants.some(v =>
          Object.entries(v.options).some(([k, val]) =>
            k.toLowerCase() === 'size' && val.toLowerCase() === filters.size?.toLowerCase()
          )
        );
        if (!hasSize) return false;
      }

      return true;
    });
  }

  static sort(products: Product[], sortOption: SortOption): Product[] {
    const copy = [...products];
    switch (sortOption) {
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'rating':
        return copy.sort((a, b) => b.rating.average - a.rating.average);
      case 'newest':
        return copy.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'bestselling':
        return copy.sort((a, b) => b.rating.count - a.rating.count);
      default:
        return copy;
    }
  }
}

// -------------------------------------------------------------
// SEARCH ENGINE
// -------------------------------------------------------------

export class SearchEngine {
  private recentSearches: string[] = [];

  constructor(
    public storeId: string,
    public storage?: NamespacedStorage,
    public maxRecent: number = 5
  ) {
    if (this.storage) {
      this.recentSearches = this.storage.get<string[]>('recent_searches', []);
    }
  }

  search(query: string, catalog: Product[]): Product[] {
    const normalize = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const trimmed = query.trim();
    if (!trimmed) return [];

    const normQuery = normalize(trimmed);
    const tokens = normQuery.split(/\s+/).filter(Boolean);

    return catalog.filter(product => {
      const normTitle = normalize(product.title);
      const normDesc = normalize(product.description);
      const titleMatch = tokens.every(token => normTitle.includes(token));
      const descMatch = tokens.every(token => normDesc.includes(token));
      const catMatch = normalize(product.category).includes(normQuery);
      const tagMatch = product.tags.some(tag => normalize(tag).includes(normQuery));

      return titleMatch || descMatch || catMatch || tagMatch;
    });
  }

  recordQuery(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) return;

    this.recentSearches = [trimmed, ...this.recentSearches.filter(q => q.toLowerCase() !== trimmed.toLowerCase())]
      .slice(0, this.maxRecent);

    if (this.storage) {
      this.storage.set('recent_searches', this.recentSearches);
    }
  }

  getRecentQueries(): string[] {
    return [...this.recentSearches];
  }

  clearRecentQueries(): void {
    this.recentSearches = [];
    if (this.storage) {
      this.storage.remove('recent_searches');
    }
  }
}

// -------------------------------------------------------------
// CHECKOUT ENGINE
// -------------------------------------------------------------

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ShippingMethod {
  id: 'standard' | 'express' | 'free';
  name: string;
  rate: number;
}

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvc: string;
  isDemo: boolean;
}

export interface CompletedOrder {
  orderId: string;
  storeId: string;
  customer: CustomerInfo;
  shippingMethod: ShippingMethod;
  items: CartLineItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  createdAt: string;
  status: 'confirmed' | 'processing';
}

export class CheckoutStateMachine {
  public step: 'information' | 'shipping' | 'payment' | 'confirmation' = 'information';
  public customerInfo?: CustomerInfo;
  public shippingMethod?: ShippingMethod;
  public paymentDetails?: PaymentDetails;
  public completedOrder?: CompletedOrder;

  constructor(public cartEngine: CartEngine) {}

  setCustomerInfo(info: CustomerInfo): void {
    if (!info.email || !info.email.includes('@')) throw new Error('Invalid email address');
    if (!info.firstName.trim() || !info.lastName.trim()) throw new Error('First and last name are required');
    if (!info.address.trim() || !info.city.trim() || !info.postalCode.trim()) {
      throw new Error('Complete shipping address required');
    }
    this.customerInfo = info;
    this.step = 'shipping';
  }

  setShippingMethod(method: ShippingMethod): void {
    if (this.step !== 'shipping') throw new Error('Cannot set shipping before information step');
    this.shippingMethod = method;
    this.step = 'payment';
  }

  processPayment(payment: PaymentDetails): CompletedOrder {
    if (this.step !== 'payment') throw new Error('Cannot process payment before shipping step');
    if (!payment.cardNumber || payment.cardNumber.replace(/\s/g, '').length < 13) {
      throw new Error('Valid credit card number required');
    }
    if (!payment.isDemo) {
      throw new Error('Demo transaction confirmation required');
    }

    this.paymentDetails = payment;

    const calc = this.cartEngine.getCalculation();
    const orderId = `DEMO-ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const order: CompletedOrder = {
      orderId,
      storeId: this.cartEngine.storeConfig.id,
      customer: this.customerInfo!,
      shippingMethod: this.shippingMethod!,
      items: [...this.cartEngine.items],
      subtotal: calc.subtotal,
      shippingFee: this.shippingMethod!.rate,
      tax: calc.tax,
      total: Math.round((calc.subtotal + this.shippingMethod!.rate + calc.tax) * 100) / 100,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    this.completedOrder = order;
    this.step = 'confirmation';
    this.cartEngine.clear(); // Clear cart on completion
    return order;
  }
}

// -------------------------------------------------------------
// THEME TOKEN ENGINE
// -------------------------------------------------------------

export class ThemeTokenEngine {
  static toCssVariables(tokens: ThemeTokens): Record<string, string> {
    const radiusMap: Record<string, string> = {
      none: '0px',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px'
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
  }
}

// -------------------------------------------------------------
// RESPONSIVE LAYOUT ENGINE
// -------------------------------------------------------------

export class ResponsiveLayoutEngine {
  static evaluate(viewportWidth: number) {
    const isMobile = viewportWidth < 1024;
    const isExtraSmall = viewportWidth <= 375;
    const isDesktop = viewportWidth >= 1024;
    const isLargeDesktop = viewportWidth >= 1440;

    return {
      viewportWidth,
      isMobile,
      isExtraSmall,
      isDesktop,
      isLargeDesktop,
      hasHamburgerNav: isMobile,
      hasFullDesktopMenu: isDesktop,
      hasStickyAddToCart: isMobile,
      gridColumns: isLargeDesktop ? 4 : (viewportWidth >= 1024 ? 3 : (viewportWidth >= 640 ? 2 : 1)),
      canFit375pxWithoutOverflow: viewportWidth >= 320
    };
  }
}
