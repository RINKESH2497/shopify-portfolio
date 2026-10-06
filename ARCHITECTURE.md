# Architecture & Store Extensibility Contract

This document specifies the architectural foundation of the **Shopify Portfolio Multi-Store E-Commerce Platform**, the contract between the shared engine and modular store instances, and the step-by-step guide for adding new stores with zero engine modifications.

---

## 1. System Overview

The platform is designed as a **modular headless e-commerce engine** powering visually and structurally distinct store experiences through configuration rather than duplicated code.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Views & Routing Layer                          │
│   (/) Portfolio Hub | (/:storeId) Homepage | (/:storeId/collections)    │
│   (/:storeId/products/:handle) PDP | Cart | Checkout | Account          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    Reusable Section Library (14 types)                  │
│   HeroStandard | HeroSplit | HeroFullscreen | FeaturedProducts          │
│   ProductCarousel | CollectionCards | ImageWithText | EditorialGrid     │
│   Testimonials | ReviewsBreakdown | LogoCloud | Marquee | FAQ | Form    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                  Shared E-Commerce Engine & Contexts                    │
│   StoreContext | ThemeContext | CartContext | WishlistContext           │
│   SearchContext | AccountContext | CheckoutContext                      │
│   Namespaced LocalStorage (shopify_portfolio:${storeId}:${key})         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         StoreRegistry & Catalogs                        │
│   Coffee (Terroir & Roast)        Fashion (Atelier Noir)                │
│   Jewelry (L'Étoile Joaillerie)   Electronics (Nexus Tech)              │
│   + Custom Stores (Extensible via 3-step contract)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### A. Shared Engine State (`src/engine/`)
The engine manages state independently of any specific visual theme:
- **`StoreContext`**: Resolves active store from route parameters or props, loads catalog and store metadata.
- **`ThemeContext`**: Transforms active store `ThemeTokens` into CSS Custom Properties injected dynamically into `:root` (colors, typography, radii, animation speeds, card styles).
- **`CartContext`**: Variant-aware item tracking, float-safe pricing, shipping calculations, and free-shipping threshold progress bars.
- **`WishlistContext`**: Persistent wishlist management with seamless move-to-cart workflow.
- **`SearchContext`**: Instant in-memory search across product titles, descriptions, categories, and tags with Unicode diacritic normalization.
- **`AccountContext` & `CheckoutContext`**: Demo user profiles, addresses, and a 4-step simulated checkout experience.

### B. Dynamic Section Library (`src/sections/`)
Stores define their homepage layout via an ordered array of `SectionConfig` objects. `SectionRenderer` dynamically resolves and renders each section:
- **Discriminated Union Safety**: Each section type has strict TypeScript validation (`src/types/section.ts`) with zero `any` types.
- **Visual Isolation**: Sections inherit typography, colors, and border radii dynamically through CSS variables rather than hardcoded styles.

### C. Store Catalog & Token Registry (`src/stores/`)
Each store is completely self-contained within its own directory:
- `theme.ts`: Store metadata, navigation links, free shipping threshold, theme tokens, and homepage section configuration.
- `products.ts`: 16+ curated products with realistic variants, pricing, options, descriptions, and placeholder images.
- `index.ts`: Barrel export providing a typed `StoreRegistryEntry`.

---

## 3. Store Extensibility Contract: 3-Step Store Addition Guide

New stores (e.g., *Botanical Living*, *Home Decor*, *Vintage Watches*) can be added seamlessly without touching any engine, section, or core component code.

### Step 1: Create the Store Theme Configuration (`src/stores/<id>/theme.ts`)

Create a new file defining your store metadata, theme tokens, homepage section sequence, and navigation:

```typescript
import { StoreConfig } from '../../types/store';

export const botanicalThemeConfig: StoreConfig = {
  id: 'botanical',
  name: 'Botanical Living',
  tagline: 'Rare indoor plants and sustainable artisanal ceramics',
  industry: 'botanical',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 65.0,
  standardShippingRate: 7.5,
  taxRate: 0.08,
  theme: {
    colors: {
      primary: '#2D5A27',
      secondary: '#1F3F1B',
      accent: '#8FBC8F',
      background: '#F4F7F4',
      surface: '#FFFFFF',
      text: '#1C2826',
      textMuted: '#5C715E',
      border: '#D8E2DC',
    },
    typography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'DM Sans, sans-serif',
      scale: 'normal',
    },
    shape: {
      borderRadius: 'lg',
      cardStyle: 'bordered',
    },
    layout: {
      headerStyle: 'centered',
      heroVariant: 'split',
      contentDensity: 'comfortable',
    },
    animation: {
      intensity: 'smooth',
    },
  },
  sections: [
    {
      id: 'botanical-hero',
      type: 'hero-split',
      settings: {
        heading: 'Living Art For Mindful Spaces',
        subheading: 'Ethically cultivated indoor botanical specimens and handcrafted pottery.',
        primaryCtaText: 'Shop Plants',
        primaryCtaLink: '/botanical/collections/rare-plants',
        imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
        imageAlt: 'Monstera and ceramic planters in sunlit studio',
      },
    },
    {
      id: 'botanical-featured',
      type: 'featured-products',
      settings: {
        heading: 'New Botanical Arrivals',
        limit: 4,
      },
    },
  ],
  navigation: [
    { label: 'Rare Plants', href: '/botanical/collections/rare-plants' },
    { label: 'Planters', href: '/botanical/collections/planters' },
  ],
};

export default botanicalThemeConfig;
```

### Step 2: Create the Product Catalog (`src/stores/<id>/products.ts`)

Create a catalog file containing 16 realistic demo products conforming to the `Product` interface:

```typescript
import { Product } from '../../types/product';

export const botanicalProducts: Product[] = [
  {
    id: 'prod-bot-1',
    handle: 'variegated-monstera-albo',
    title: 'Variegated Monstera Albo',
    subtitle: 'Rooted rare specimen with striking sectoral variegation',
    description: 'A prized tropical specimen featuring bold pure-white sectoral variegation on fenestrated foliage.',
    price: 120.0,
    compareAtPrice: 145.0,
    category: 'Rare Plants',
    tags: ['rare', 'foliage', 'indoor', 'bestseller'],
    images: [
      {
        id: 'img-bot-1-1',
        url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b',
        altText: 'Variegated Monstera Albo leaf with crisp white sectoral patch',
      },
    ],
    options: [
      { name: 'Pot Size', values: ['4-inch Nursery Pot', '6-inch Ceramic Planter'] },
    ],
    variants: [
      {
        id: 'var-bot-1-1',
        title: '4-inch Nursery Pot',
        sku: 'BOT-MON-4IN',
        price: 120.0,
        compareAtPrice: 145.0,
        options: { 'Pot Size': '4-inch Nursery Pot' },
        availableForSale: true,
        inventoryQuantity: 8,
      },
      {
        id: 'var-bot-1-2',
        title: '6-inch Ceramic Planter',
        sku: 'BOT-MON-6IN',
        price: 165.0,
        compareAtPrice: 195.0,
        options: { 'Pot Size': '6-inch Ceramic Planter' },
        availableForSale: true,
        inventoryQuantity: 5,
      },
    ],
    rating: { average: 4.9, count: 28 },
    specifications: {
      LightRequirements: 'Bright Indirect Light (No direct noon sun)',
      Watering: 'Allow top 50% soil to dry between waterings',
      Humidity: '60%+ Preferred',
    },
    featured: true,
    createdAt: '2026-02-01T08:00:00Z',
  },
  // ... (15 additional products)
];

export default botanicalProducts;
```

Export the combined store entry in `src/stores/<id>/index.ts`:

```typescript
import { StoreRegistryEntry } from '../../types/store';
import { botanicalThemeConfig } from './theme';
import { botanicalProducts } from './products';

export const botanicalStore: StoreRegistryEntry = {
  config: botanicalThemeConfig,
  products: botanicalProducts,
};

export default botanicalStore;
```

### Step 3: Register the Store in `src/stores/registry.ts`

Import and add your store entry to the `INITIAL_STORE_REGISTRY` in `src/stores/registry.ts`:

```typescript
import { botanicalStore } from './botanical';

const INITIAL_STORE_REGISTRY: StoreRegistry = {
  coffee: coffeeStore,
  fashion: fashionStore,
  jewelry: jewelryStore,
  electronics: electronicsStore,
  botanical: botanicalStore, // <-- Add this 1 line
};
```

Alternatively, register stores dynamically at runtime without restarting the application:

```typescript
import { registerStore } from './stores/registry';
import { botanicalStore } from './stores/botanical';

registerStore(botanicalStore);
```

Once registered:
- The store is immediately accessible at `/:storeId` (e.g., `/botanical`)
- Route guards validate the store ID automatically via `isValidStoreId('botanical')`
- The Portfolio Hub (`/`) discovers and renders the new store card via `getAllStores()`
- Dynamic CSS tokens, custom fonts, radii, and animations apply on store navigation
- Cart, wishlist, search, and checkout function automatically with full isolation

---

## 4. Visual Distinction Checklist

Every store implementation must satisfy strict visual and structural divergence:

| Attribute | Coffee ("Terroir & Roast") | Fashion ("Atelier Noir") | Jewelry ("L'Étoile Joaillerie") | Electronics ("Nexus Tech") |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Color** | Warm Earthy `#2C1810` | Stark Monochrome `#0A0A0A` | Champagne Gold `#C5A059` | Cyber Cyan `#00E5FF` |
| **Background** | Cream Sand `#FAEDCD` | Pure White `#FFFFFF` | Obsidian `#0D0C0A` | Deep Space Navy `#0B0F19` |
| **Heading Font** | Fraunces (Serif) | Syne (Geometric Sans) | Cormorant Garamond (Fine Serif) | Space Grotesk (Tech Sans) |
| **Body Font** | Plus Jakarta Sans | Inter | Montserrat | Inter |
| **Border Radius** | `2xl` (1rem / 16px) | `none` (0px) | `md` (0.375rem / 6px) | `sm` (0.125rem / 2px) |
| **Card Style** | `flat` | `bordered` | `elevated` | `glassmorphic` |
| **Header Style** | `centered` | `left-aligned` | `transparent-overlay` | `tech-hud` |
| **Hero Variant** | `split` (story & coffee) | `fullscreen` (100vh banner) | `standard` (centered crest) | `split` (spec stats) |
| **Animation Personality** | Smooth (300ms) | Cinematic (600ms) | Smooth (300ms) | Snappy (150ms) |
| **Content Density** | Comfortable | Spacious | Spacious | Dense |
| **Product Variants** | Grind & Weight | Size & Color | Metal & Ring Size | Finish, Storage & Specs |

---

## 5. Verification Commands

Run the full verification suite after implementing or modifying stores:

```bash
# Type check with zero errors
npx tsc --noEmit

# Production build check
npm run build

# Unit test suite execution
npm test

# Automated E2E verification
npm run test:e2e
```
