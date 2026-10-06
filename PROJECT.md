# Project: Shopify Portfolio Multi-Store E-Commerce Platform

## Architecture
The platform is a single-page React application powered by a modular, extensible architecture consisting of:
1. **Core Foundation & Types (`src/types/`, `src/utils/`)**:
   - Master contracts: `Product`, `ProductVariant`, `ProductOption`, `Collection`, `ThemeConfig`, `StoreConfig`, `SectionConfig`, `CartItem`, `Order`.
   - Namespaced LocalStorage persistence (`shopify_portfolio:${storeId}:${key}`) with JSON serialization and multi-tab sync.
   - Price formatting, responsive hooks, and image fallback utilities.
2. **Reusable E-Commerce Engine (`src/engine/`)**:
   - `CartContext`: Variant-aware line items, quantity management, subtotal, shipping calculation, free-shipping threshold progress, drawer toggle.
   - `WishlistContext`: Add/remove wishlist items, persistence, move-to-cart workflow.
   - `ThemeContext`: Dynamic CSS custom property injection into `:root` based on the active store configuration.
   - `SearchContext`: Instant search index over product catalog (title, description, tags, category), recent search history, no-results state.
   - `AccountContext`: Demo user profile, saved shipping addresses, simulated order history.
   - `CheckoutFlow`: 4-step simulated checkout (Information → Shipping → Payment UI → Confirmation) with demo banners.
3. **Reusable Section Library (`src/sections/`)**:
   - 13 Data-driven sections: `HeroStandard`, `HeroSplit`, `HeroFullscreen`, `FeaturedProducts`, `ProductCarousel`, `CollectionCards`, `ImageWithText`, `Testimonials`, `ReviewsBreakdown`, `LogoCloud`, `Marquee`, `NewsletterSignup`, `FaqAccordion`, `EditorialGrid`.
   - `SectionRenderer`: Dynamic component registry mapping section type keys to React components.
4. **4 Visually Distinct Demo Stores (`src/stores/`)**:
   - **Coffee** ("Terroir & Roast"): `#2C1810`, Fraunces + Plus Jakarta Sans, rounded-2xl, Split Hero, storytelling layout, 16 coffee products.
   - **Fashion** ("Atelier Noir"): `#0A0A0A`, Syne + Inter, rounded-none, Fullscreen Hero, minimalist editorial, 16 apparel products.
   - **Jewelry** ("L'Étoile Joaillerie"): `#C5A059`, Cormorant Garamond + Montserrat, rounded-md, Standard Luxury Crest Hero, 16 jewelry products.
   - **Electronics** ("Nexus Tech"): `#00E5FF`, Space Grotesk + Inter / JetBrains Mono, rounded-sm, Tech Spec Hero with live telemetry, 16 gadget products.
   - `StoreRegistry`: Central lookup matching store slugs (`coffee`, `fashion`, `jewelry`, `electronics`) to config and catalog.
5. **Views & Routing Layer (`src/pages/`, `src/components/layout/`)**:
   - `StoreRouteGuard`: Validates `/:storeId`, initializes Store and Theme context.
   - Portfolio Hub (`/`): Visual landing gallery showcasing the 4 stores.
   - Store Layout: Dynamic Header (4 navigation layouts), Footer, Cart Drawer, Search Modal, Wishlist Drawer.
   - Store Pages: Homepage (`/:storeId`), Collections (`/:storeId/collections/:handle`), Product Detail (`/:storeId/products/:handle`), Cart (`/:storeId/cart`), Checkout (`/:storeId/checkout`), Account (`/:storeId/account`).
6. **Extensibility Contract**:
   - 6 additional stores can be added with 0 engine modifications by adding:
     1. `src/stores/<id>/theme.ts`
     2. `src/stores/<id>/products.ts`
     3. `src/stores/<id>/index.ts`
     4. 1 line in `src/stores/registry.ts`
   - Documented in `ARCHITECTURE.md` and `README.md`.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | FEAT-BASE-01 | React + Vite + TypeScript + Tailwind CSS project scaffolding & configuration | M1 | Survey |
| 2 | FEAT-BASE-02 | Universal TypeScript interfaces (Product, Variant, Collection, Theme, Store, Section, Cart, Order) | M1 | Survey |
| 3 | FEAT-BASE-03 | Namespaced LocalStorage utility with error handling & multi-tab synchronization | M1 | Survey |
| 4 | FEAT-BASE-04 | Base UI primitives (Button, Modal, Drawer, Tabs, Badge, Toast, ImageWithFallback) | M1 | Survey |
| 5 | FEAT-ENG-01 | CartContext with variant-aware item tracking, add/remove, quantity adjustment | M2 | R1 |
| 6 | FEAT-ENG-02 | Real-time financial calculations (subtotal, shipping threshold, free shipping progress bar, total) | M2 | R1 |
| 7 | FEAT-ENG-03 | Cart persistence in LocalStorage across page refreshes and multi-tab synchronization | M2 | R1 |
| 8 | FEAT-ENG-04 | WishlistContext with add/remove, LocalStorage persistence, and move-to-cart workflow | M2 | R1 |
| 9 | FEAT-ENG-05 | ThemeContext with dynamic CSS Custom Property injection into `:root` | M2 | R2 |
| 10 | FEAT-ENG-06 | SearchContext with instant client-side index (title, description, tags, category) & recent searches | M2 | R1 |
| 11 | FEAT-ENG-07 | Simulated 4-step Checkout flow (Information → Shipping → Payment → Confirmation) with demo badge | M2 | R1 |
| 12 | FEAT-ENG-08 | Demo Account UI state (Profile, Addresses, Order History, Wishlist) | M2 | R1 |
| 13 | FEAT-SEC-01 | Hero Variant 1: HeroStandard (centered luxury/crest layout) | M3 | R2 |
| 14 | FEAT-SEC-02 | Hero Variant 2: HeroSplit (50-50 storytelling & featured product layout) | M3 | R2 |
| 15 | FEAT-SEC-03 | Hero Variant 3: HeroFullscreen (100vh cinematic image/video banner) | M3 | R2 |
| 16 | FEAT-SEC-04 | Featured Products grid section with dynamic card skinning | M3 | R2 |
| 17 | FEAT-SEC-05 | Product Carousel section with touch/swipe & navigation arrows | M3 | R2 |
| 18 | FEAT-SEC-06 | Collection Cards / Banners grid section | M3 | R2 |
| 19 | FEAT-SEC-07 | Image + Text storytelling section with alternating layout support | M3 | R2 |
| 20 | FEAT-SEC-08 | Testimonials section with customer avatars and quotes | M3 | R2 |
| 21 | FEAT-SEC-09 | Reviews Breakdown section with star distributions and ratings | M3 | R2 |
| 22 | FEAT-SEC-10 | Logo Cloud / Partner Brands section | M3 | R2 |
| 23 | FEAT-SEC-11 | Infinite Marquee / Announcement ticker section | M3 | R2 |
| 24 | FEAT-SEC-12 | Newsletter Signup section with form validation & confirmation state | M3 | R2 |
| 25 | FEAT-SEC-13 | FAQ Accordion section with accessible expandable items | M3 | R2 |
| 26 | FEAT-SEC-14 | Asymmetrical Editorial Grid section | M3 | R2 |
| 27 | FEAT-SEC-15 | Dynamic SectionRenderer mapping schema arrays to section components | M3 | R2 |
| 28 | FEAT-STR-01 | Coffee Store: "Terroir & Roast" theme config, warm earthy palette, Fraunces font, rounded-2xl | M4 | R3 |
| 29 | FEAT-STR-02 | Coffee Store: 16 curated products with coffee variants (grind, weight) & realistic data | M4 | R3 |
| 30 | FEAT-STR-03 | Fashion Store: "Atelier Noir" theme config, monochrome palette, Syne font, rounded-none | M4 | R3 |
| 31 | FEAT-STR-04 | Fashion Store: 16 curated products with fashion variants (size, color) & realistic data | M4 | R3 |
| 32 | FEAT-STR-05 | Jewelry Store: "L'Étoile Joaillerie" theme config, champagne gold palette, Cormorant font, rounded-md | M4 | R3 |
| 33 | FEAT-STR-06 | Jewelry Store: 16 curated products with jewelry variants (metal, size, gem) & realistic data | M4 | R3 |
| 34 | FEAT-STR-07 | Electronics Store: "Nexus Tech" theme config, cyber cyan palette, Space Grotesk font, rounded-sm | M4 | R3 |
| 35 | FEAT-STR-08 | Electronics Store: 16 curated products with tech variants (storage, finish), specs tables | M4 | R3 |
| 36 | FEAT-STR-09 | StoreRegistry connecting all store configurations and catalog exports | M4 | R5 |
| 37 | FEAT-STR-10 | ARCHITECTURE.md and README.md documenting the 3-step store addition guide | M4 | R5 |
| 38 | FEAT-UI-01 | Portfolio Hub landing page (`/`) showcasing the 4 stores with preview cards & direct entry | M5 | R3 |
| 39 | FEAT-UI-02 | Dynamic Header with 4 distinct navigation styles (Centered, Left, Translucent, Tech HUD) | M5 | R3 |
| 40 | FEAT-UI-03 | Store Homepage rendering unique section sequences per store | M5 | R3 |
| 41 | FEAT-UI-04 | Collection Page with multi-faceted filtering (category, price, color, size, rating) & sorting | M5 | R1 |
| 42 | FEAT-UI-05 | Product Detail Page (PDP) with image gallery, variant selectors, dynamic price recalculation | M5 | R1 |
| 43 | FEAT-UI-06 | PDP related products carousel and customer reviews breakdown | M5 | R1 |
| 44 | FEAT-UI-07 | Interactive Cart Drawer with quantity controls, empty state, and free shipping progress bar | M5 | R1 |
| 45 | FEAT-UI-08 | Dedicated Full Cart Page (`/:storeId/cart`) | M5 | R1 |
| 46 | FEAT-UI-09 | Search Overlay modal with instant results and no-results feedback | M5 | R1 |
| 47 | FEAT-UI-10 | Simulated Checkout views (`/:storeId/checkout`) | M5 | R1 |
| 48 | FEAT-UI-11 | Demo Account pages (`/:storeId/account`) | M5 | R1 |
| 49 | FEAT-RESP-01 | Responsive layouts verified at 320px, 375px, 390px, 1024px, 1280px, 1440px | M5 | R4 |
| 50 | FEAT-RESP-02 | Mobile navigation drawer, filter drawer, and sticky mobile add-to-cart bar on PDP | M5 | R4 |
| 51 | FEAT-VERIF-01 | Phase 1: 100% E2E test suite pass against TEST_READY.md (Tiers 1-4) | M6 | Acceptance |
| 52 | FEAT-VERIF-02 | Phase 2: Adversarial coverage hardening (Tier 5) with Challenger stress testing | M6 | Quality |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Foundation & Types | Scaffolding, TypeScript definitions, base primitives, localStorage engine | none | PLANNED |
| M2 | E-Commerce Engine & State | Cart, Wishlist, Theme, Search, Account, Checkout flows & state logic | M1 | PLANNED |
| M3 | Section Library & Renderer | 13 Reusable sections + SectionRenderer registry | M1, M2 | PLANNED |
| M4 | Store Catalogs & Themes | 4 distinct theme configs, 64 products, StoreRegistry, Extensibility docs | M1, M2, M3 | PLANNED |
| M5 | Multi-Store Views & Responsive | Hub, Store Shells, PDP, PLP, Filters, Cart Drawer, Search, Checkout, Mobile UX | M1, M2, M3, M4 | PLANNED |
| M6 | Final E2E Pass & Hardening | 100% E2E test pass (Tiers 1-4) + Tier 5 Adversarial Coverage Hardening | M5, TEST_READY.md | PLANNED |

---

## Interface Contracts

### M1/M2 ↔ M3/M4/M5: Types & State Contract
```typescript
// Product & Variants
export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  options: Record<string, string>; // e.g. { Size: "M", Color: "Black" }
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
  images: { id: string; url: string; altText: string; width?: number; height?: number }[];
  options: { name: string; values: string[] }[];
  variants: ProductVariant[];
  rating: { average: number; count: number };
  specifications?: Record<string, string>;
  featured?: boolean;
}

// Cart State Contract
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
}
```

### M2/M4 ↔ M3/M5: Theme & Section Contract
```typescript
export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    scale: 'compact' | 'normal' | 'expressive';
  };
  shape: {
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    cardStyle: 'flat' | 'bordered' | 'elevated' | 'glassmorphic';
  };
  layout: {
    headerStyle: 'centered' | 'left-aligned' | 'transparent-overlay' | 'tech-hud';
    heroVariant: 'standard' | 'split' | 'fullscreen';
    contentDensity: 'spacious' | 'comfortable' | 'dense';
  };
  animation: {
    intensity: 'subtle' | 'smooth' | 'snappy' | 'cinematic';
  };
}

export interface SectionConfig {
  id: string;
  type:
    | 'hero-standard'
    | 'hero-split'
    | 'hero-fullscreen'
    | 'featured-products'
    | 'product-carousel'
    | 'collection-cards'
    | 'image-with-text'
    | 'testimonials'
    | 'reviews-breakdown'
    | 'logo-cloud'
    | 'marquee'
    | 'newsletter-signup'
    | 'faq-accordion'
    | 'editorial-grid';
  settings: Record<string, any>;
}

export interface StoreConfig {
  id: string;
  name: string;
  tagline: string;
  industry: 'coffee' | 'fashion' | 'jewelry' | 'electronics';
  currency: string;
  theme: ThemeTokens;
  sections: SectionConfig[];
  navigation: { label: string; href: string }[];
  freeShippingThreshold: number;
}
```

---

## Code Layout
```
C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── ARCHITECTURE.md
├── README.md
├── tests/
│   ├── e2e/                     # Opaque-box E2E test suite (Tiers 1-4)
│   │   ├── tier1_features/
│   │   ├── tier2_boundaries/
│   │   ├── tier3_interactions/
│   │   └── tier4_scenarios/
│   ├── test-runner.ts           # Standalone automated test runner
│   └── fixtures/                # Synthetic test fixtures
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   ├── product.ts
    │   ├── theme.ts
    │   ├── store.ts
    │   ├── cart.ts
    │   ├── order.ts
    │   └── section.ts
    ├── utils/
    │   ├── storage.ts
    │   ├── formatters.ts
    │   └── cn.ts
    ├── components/
    │   ├── common/              # Buttons, Modals, Drawers, Badges, Toast
    │   └── layout/              # Header, Footer, StoreLayout, MobileNav
    ├── engine/
    │   ├── CartContext.tsx
    │   ├── WishlistContext.tsx
    │   ├── ThemeContext.tsx
    │   ├── SearchContext.tsx
    │   ├── AccountContext.tsx
    │   └── StoreContext.tsx
    ├── sections/
    │   ├── SectionRenderer.tsx
    │   ├── hero/
    │   ├── products/
    │   ├── media/
    │   └── social/
    ├── stores/
    │   ├── registry.ts          # StoreRegistry exporting all active stores
    │   ├── coffee/
    │   ├── fashion/
    │   ├── jewelry/
    │   └── electronics/
    └── pages/
        ├── HubPage.tsx
        ├── HomePage.tsx
        ├── CollectionPage.tsx
        ├── ProductPage.tsx
        ├── CartPage.tsx
        ├── CheckoutPage.tsx
        └── AccountPage.tsx
```
