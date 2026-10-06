# Technical Blueprint: Master TypeScript Interfaces (`src/types/`)

**Author**: Explorer M1-2 (`teamwork_preview_explorer`)  
**Date**: 2026-10-05  
**Milestone**: M1 (Core Foundation & Types)  
**Status**: COMPLETE / READY FOR IMPLEMENTATION  

---

## 1. Executive Summary

This blueprint defines the complete TypeScript type system for the Shopify Portfolio Multi-Store E-Commerce Platform under `src/types/`. It strictly conforms to `PROJECT.md § Interface Contracts`, guarantees **zero `any`**, replaces loose `Record<string, any>` dictionaries with rigorous **discriminated unions** across all 14 section configurations, and establishes a unified type foundation powering:
- The 4 initial demo stores (*Coffee*, *Fashion*, *Jewelry*, *Electronics*)
- The 6 planned future stores (zero engine modifications required)
- All shared engine contexts (`CartContext`, `WishlistContext`, `ThemeContext`, `SearchContext`, `AccountContext`, `CheckoutFlow`)
- The 14 data-driven layout sections rendered dynamically via `SectionRenderer`

The types are partitioned across 6 modular domain files plus 1 central barrel export:
1. `src/types/product.ts` — Products, Variants, Options, Ratings, Images, Collections, and Filter/Sort parameters.
2. `src/types/theme.ts` — Theme token contracts: Color, Typography, Shape, Layout, and Animation tokens.
3. `src/types/store.ts` — Store configurations, navigation models, and the global StoreRegistry.
4. `src/types/section.ts` — Discriminated union of 14 section configurations with strongly-typed settings per section.
5. `src/types/cart.ts` — Line items, CartContext values, 4-step simulated Checkout state, and Shipping methods.
6. `src/types/order.ts` — Simulated Order models, Addresses, OrderItems, and UserProfile structures.
7. `src/types/index.ts` — Unified barrel re-export.

---

## 2. File-by-File Interface Specifications

### 2.1. `src/types/product.ts`

```typescript
/**
 * Product & Catalog Type Definitions
 * Exact alignment with PROJECT.md lines 115-143.
 * Zero `any` — full static type safety.
 */

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  width?: number;
  height?: number;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  options: Record<string, string>; // e.g. { Size: "M", Color: "Black" } or { Grind: "Espresso", Weight: "12oz" }
  availableForSale: boolean;
  inventoryQuantity: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  tags: string[];
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  rating: ProductRating;
  specifications?: Record<string, string>;
  featured?: boolean;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

export type ProductSortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'newest'
  | 'bestselling';

export interface ProductFilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  rating?: number;
  inStockOnly?: boolean;
  tags?: string[];
}
```

---

### 2.2. `src/types/theme.ts`

```typescript
/**
 * Theme & Token Type Definitions
 * Exact alignment with PROJECT.md lines 177-205.
 * Decomposes theme tokens into reusable sub-interfaces for colors, typography, shapes, layout, and animation.
 */

export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export type TypographyScale = 'compact' | 'normal' | 'expressive';

export interface TypographyTokens {
  headingFont: string;
  bodyFont: string;
  scale: TypographyScale;
}

export type BorderRadiusValue = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type CardStyleValue = 'flat' | 'bordered' | 'elevated' | 'glassmorphic';

export interface ShapeTokens {
  borderRadius: BorderRadiusValue;
  cardStyle: CardStyleValue;
}

export type HeaderStyleValue = 'centered' | 'left-aligned' | 'transparent-overlay' | 'tech-hud';
export type HeroVariantValue = 'standard' | 'split' | 'fullscreen';
export type ContentDensityValue = 'spacious' | 'comfortable' | 'dense';

export interface LayoutTokens {
  headerStyle: HeaderStyleValue;
  heroVariant: HeroVariantValue;
  contentDensity: ContentDensityValue;
}

export type AnimationIntensityValue = 'subtle' | 'smooth' | 'snappy' | 'cinematic';

export interface AnimationTokens {
  intensity: AnimationIntensityValue;
}

export interface ThemeTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  shape: ShapeTokens;
  layout: LayoutTokens;
  animation: AnimationTokens;
}
```

---

### 2.3. `src/types/store.ts`

```typescript
/**
 * Store Configuration & Registry Type Definitions
 * Exact alignment with PROJECT.md lines 227-237.
 */

import { Product } from './product';
import { SectionConfig } from './section';
import { ThemeTokens } from './theme';

export type StoreIndustry = 'coffee' | 'fashion' | 'jewelry' | 'electronics' | string;

export interface NavigationItem {
  label: string;
  href: string;
  badge?: string;
  children?: NavigationItem[];
}

export interface StoreConfig {
  id: string; // e.g. 'coffee', 'fashion', 'jewelry', 'electronics'
  name: string;
  tagline: string;
  industry: 'coffee' | 'fashion' | 'jewelry' | 'electronics' | string;
  currency: string;
  theme: ThemeTokens;
  sections: SectionConfig[];
  navigation: NavigationItem[];
  freeShippingThreshold: number;
}

export interface StoreRegistryEntry {
  config: StoreConfig;
  products: Product[];
}

export type StoreRegistry = Record<string, StoreRegistryEntry>;
```

---

### 2.4. `src/types/section.ts`

```typescript
/**
 * Data-Driven Section Configuration System
 * Replaces loose `Record<string, any>` with a strict discriminated union across all 14 section variants.
 * Zero `any` — provides automatic type narrowing in SectionRenderer via `switch (section.type)`.
 */

// 1. Hero Standard (Centered luxury / crest layout)
export interface HeroStandardSettings {
  heading: string;
  subheading?: string;
  eyebrow?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number; // 0.0 to 1.0
  textAlignment?: 'left' | 'center' | 'right';
  crestImageUrl?: string;
  badgeText?: string;
}

// 2. Hero Split (50-50 storytelling & featured product layout)
export interface HeroSplitSettings {
  heading: string;
  subheading?: string;
  tagline?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  featuredProductId?: string;
  stats?: Array<{ label: string; value: string }>;
}

// 3. Hero Fullscreen (100vh cinematic banner)
export interface HeroFullscreenSettings {
  heading: string;
  subheading?: string;
  eyebrow?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  overlayOpacity?: number; // 0.0 to 1.0
  textPosition?: 'bottom-left' | 'center' | 'bottom-center';
  scrollIndicator?: boolean;
}

// 4. Featured Products (Card grid with dynamic skinning)
export interface FeaturedProductsSettings {
  heading: string;
  subheading?: string;
  productHandles?: string[];
  collectionHandle?: string;
  limit?: number;
  columns?: 2 | 3 | 4;
  viewAllLink?: string;
  viewAllText?: string;
}

// 5. Product Carousel (Touch/swipe slider with navigation controls)
export interface ProductCarouselSettings {
  heading: string;
  subheading?: string;
  productHandles?: string[];
  collectionHandle?: string;
  autoplay?: boolean;
  autoplayIntervalMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

// 6. Collection Cards (Banner grid of categories)
export interface CollectionCardItem {
  handle: string;
  title: string;
  imageUrl: string;
  itemCountText?: string;
  description?: string;
}

export interface CollectionCardsSettings {
  heading?: string;
  subheading?: string;
  collections: CollectionCardItem[];
  columns?: 2 | 3 | 4;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

// 7. Image With Text (Alternating editorial storytelling block)
export interface ImageWithTextSettings {
  heading: string;
  content: string;
  eyebrow?: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  ctaText?: string;
  ctaLink?: string;
  statHighlight?: { value: string; label: string };
}

// 8. Testimonials (Customer quotes, ratings, and avatars)
export interface TestimonialItem {
  id: string;
  author: string;
  roleOrLocation?: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  productReferenced?: string;
}

export interface TestimonialsSettings {
  heading?: string;
  subheading?: string;
  testimonials: TestimonialItem[];
  layout?: 'grid' | 'carousel';
}

// 9. Reviews Breakdown (Star ratings and review distribution)
export interface StarRatingBucket {
  stars: number;
  count: number;
  percentage: number;
}

export interface FeaturedReview {
  author: string;
  title: string;
  content: string;
  rating: number;
  verifiedBuyer: boolean;
  date?: string;
}

export interface ReviewsBreakdownSettings {
  heading?: string;
  averageRating: number;
  totalReviews: number;
  recommendedPercentage?: number;
  distribution?: StarRatingBucket[];
  featuredReview?: FeaturedReview;
}

// 10. Logo Cloud (Partner brands and press logos)
export interface LogoItem {
  name: string;
  logoUrl?: string;
  quote?: string;
  externalUrl?: string;
}

export interface LogoCloudSettings {
  heading?: string;
  logos: LogoItem[];
  grayscale?: boolean;
  layout?: 'row' | 'grid';
}

// 11. Marquee (Infinite announcement ticker)
export interface MarqueeSettings {
  items: string[];
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  separator?: string;
  backgroundColor?: string;
  textColor?: string;
}

// 12. Newsletter Signup (Interactive newsletter subscription form)
export interface NewsletterSignupSettings {
  heading: string;
  subheading?: string;
  placeholder?: string;
  buttonText?: string;
  disclaimerText?: string;
  successMessage?: string;
}

// 13. FAQ Accordion (Collapsible accessible questions & answers)
export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FaqAccordionSettings {
  heading: string;
  subheading?: string;
  items: FaqItem[];
  allowMultipleOpen?: boolean;
}

// 14. Editorial Grid (Asymmetrical magazine-style image & content grid)
export interface EditorialGridItem {
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  span?: 'col-span-1' | 'col-span-2' | 'col-span-3' | 'row-span-2';
}

export interface EditorialGridSettings {
  heading?: string;
  subheading?: string;
  items: EditorialGridItem[];
}

// Base Generic Section Definition
export interface BaseSectionConfig<TType extends string, TSettings> {
  id: string;
  type: TType;
  settings: TSettings;
}

// Individual Strongly-Typed Section Configs
export type HeroStandardSectionConfig = BaseSectionConfig<'hero-standard', HeroStandardSettings>;
export type HeroSplitSectionConfig = BaseSectionConfig<'hero-split', HeroSplitSettings>;
export type HeroFullscreenSectionConfig = BaseSectionConfig<'hero-fullscreen', HeroFullscreenSettings>;
export type FeaturedProductsSectionConfig = BaseSectionConfig<'featured-products', FeaturedProductsSettings>;
export type ProductCarouselSectionConfig = BaseSectionConfig<'product-carousel', ProductCarouselSettings>;
export type CollectionCardsSectionConfig = BaseSectionConfig<'collection-cards', CollectionCardsSettings>;
export type ImageWithTextSectionConfig = BaseSectionConfig<'image-with-text', ImageWithTextSettings>;
export type TestimonialsSectionConfig = BaseSectionConfig<'testimonials', TestimonialsSettings>;
export type ReviewsBreakdownSectionConfig = BaseSectionConfig<'reviews-breakdown', ReviewsBreakdownSettings>;
export type LogoCloudSectionConfig = BaseSectionConfig<'logo-cloud', LogoCloudSettings>;
export type MarqueeSectionConfig = BaseSectionConfig<'marquee', MarqueeSettings>;
export type NewsletterSignupSectionConfig = BaseSectionConfig<'newsletter-signup', NewsletterSignupSettings>;
export type FaqAccordionSectionConfig = BaseSectionConfig<'faq-accordion', FaqAccordionSettings>;
export type EditorialGridSectionConfig = BaseSectionConfig<'editorial-grid', EditorialGridSettings>;

// Master Discriminated Union
export type SectionConfig =
  | HeroStandardSectionConfig
  | HeroSplitSectionConfig
  | HeroFullscreenSectionConfig
  | FeaturedProductsSectionConfig
  | ProductCarouselSectionConfig
  | CollectionCardsSectionConfig
  | ImageWithTextSectionConfig
  | TestimonialsSectionConfig
  | ReviewsBreakdownSectionConfig
  | LogoCloudSectionConfig
  | MarqueeSectionConfig
  | NewsletterSignupSectionConfig
  | FaqAccordionSectionConfig
  | EditorialGridSectionConfig;

// Helper Union Types
export type SectionType = SectionConfig['type'];
export type SectionSettings = SectionConfig['settings'];

// Utility type to extract section config by discriminator
export type ExtractSectionConfig<T extends SectionType> = Extract<SectionConfig, { type: T }>;
```

---

### 2.5. `src/types/cart.ts`

```typescript
/**
 * Cart & Checkout Type Definitions
 * Exact alignment with PROJECT.md lines 145-173.
 * Zero `any` — models line items, financial totals, 4-step checkout states, and shipping tiers.
 */

import { Product } from './product';

export interface CartItem {
  id: string; // unique item line id: `${productId}-${variantId}`
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selectedOptions: Record<string, string>;
}

export type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation';

export interface ShippingMethod {
  id: string;
  name: string; // e.g. "Standard Delivery", "Express Courier"
  price: number; // 0 for free shipping
  estimatedDelivery: string; // e.g. "3-5 business days"
  description?: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  saveInformation?: boolean;
}

export interface PaymentDetails {
  method: 'card' | 'apple-pay' | 'google-pay' | 'demo';
  cardNumberMasked?: string;
  expiryDate?: string;
}

export interface CheckoutState {
  currentStep: CheckoutStep;
  formData: CheckoutFormData;
  shippingMethod?: ShippingMethod;
  paymentDetails?: PaymentDetails;
  isSubmitting: boolean;
  error?: string | null;
  completedOrderId?: string | null;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, variantId?: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingProgress: number; // 0 to 100
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedDiscountCode?: string | null;
  discountAmount?: number;
  applyDiscount?: (code: string) => boolean;
  removeDiscount?: () => void;
}
```

---

### 2.6. `src/types/order.ts`

```typescript
/**
 * Order, Address & User Profile Type Definitions
 * Models simulated customer profile, order history, and address books.
 * Zero `any` — full support for Demo Account UI state and Checkout order creation.
 */

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  selectedOptions?: Record<string, string>;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface OrderShippingInfo {
  name: string;
  price: number;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface Order {
  id: string; // e.g. "ORD-84920"
  orderNumber: string; // e.g. "#1001"
  storeId: string; // e.g. "coffee", "fashion", "jewelry", "electronics"
  createdAt: string; // ISO 8601 date string e.g. "2026-10-05T10:00:00Z"
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod: OrderShippingInfo;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  savedAddresses: Address[];
  orderHistory: Order[];
  wishlistProductIds: string[];
}
```

---

### 2.7. `src/types/index.ts`

```typescript
/**
 * Central Barrel Export for all Domain Types
 */

export * from './product';
export * from './theme';
export * from './store';
export * from './section';
export * from './cart';
export * from './order';
```

---

## 3. Architectural Design Rationale

### 3.1. Zero `any` & The Discriminated Union Advantage
In `PROJECT.md`, `SectionConfig.settings` was originally sketched as `Record<string, any>` (lines 207-225). While acceptable for rapid prototyping, this introduces significant type safety risks:
- Section components cannot rely on compile-time autocompletion for their settings.
- Typos in section configuration files (`src/stores/<storeId>/index.ts`) would not be caught by `tsc`.
- Refactoring settings would require brittle manual code searches.

By upgrading `SectionConfig` to a **discriminated union on `type`**, each section receives its own strict settings interface. When writing `SectionRenderer`:
```typescript
export const SectionRenderer: React.FC<{ section: SectionConfig }> = ({ section }) => {
  switch (section.type) {
    case 'hero-standard':
      // section.settings is strictly HeroStandardSettings!
      return <HeroStandard {...section.settings} />;
    case 'marquee':
      // section.settings is strictly MarqueeSettings!
      return <Marquee {...section.settings} />;
    // TypeScript produces compile-time error if an unhandled section type is omitted
    default:
      const _exhaustiveCheck: never = section;
      return null;
  }
};
```
This guarantees exhaustive pattern matching with zero type casting or assertions.

### 3.2. Preserving Strict Alignment with `PROJECT.md § Interface Contracts`
Every property, identifier name, and optionality flag specified in `PROJECT.md` lines 114-237 is preserved identically:
- `ProductVariant.options` is `Record<string, string>`.
- `CartItem.id` is the composite line ID `${productId}-${variantId}`.
- `CartContextValue` retains all 12 core methods and properties (`items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `totalQuantity`, `subtotal`, `shipping`, `total`, `freeShippingThreshold`, `freeShippingProgress`, `isCartOpen`, `setIsCartOpen`).
- `ThemeTokens` decomposes cleanly into `colors`, `typography`, `shape`, `layout`, and `animation` with matching literal string unions.

### 3.3. Store Extensibility Contract (R5)
The platform requires that 6 additional stores can be added without engine modifications.
By defining `industry: 'coffee' | 'fashion' | 'jewelry' | 'electronics' | string;` on `StoreConfig`, and providing open `StoreRegistry = Record<string, StoreRegistryEntry>`, any new store (e.g. `wellness`, `art`, `automotive`) can define its config and products, register in `registry.ts`, and satisfy TypeScript checks immediately.

---

## 4. Implementation Guidance for Builder / Implementer Agent

When creating the actual source files in `src/types/`:
1. Create `src/types/` directory if not present.
2. Place the exact code specified in Section 2 into each corresponding file:
   - `src/types/product.ts`
   - `src/types/theme.ts`
   - `src/types/store.ts`
   - `src/types/section.ts`
   - `src/types/cart.ts`
   - `src/types/order.ts`
   - `src/types/index.ts`
3. Verify that `npm run build` or `npx tsc --noEmit` checks all types without error once `tsconfig.json` is initialized.
4. Downstream agents (M2 State Contexts, M3 Sections, M4 Store Catalogs) should import types cleanly from `@/types` or `src/types`.
