# Technical Architecture Survey Report: Reusable E-Commerce Engine & Multi-Store System

**Author**: Explorer Survey 2 (`teamwork_preview_explorer`)  
**Project**: Shopify-Focused Multi-Store Portfolio  
**Target Root**: `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio`  
**Date**: October 5, 2026  
**Status**: Completed Technical Specification  

---

## 1. Executive Summary & Architectural Vision

The objective of this project is to build a production-grade, highly performant, accessible Shopify-focused frontend portfolio comprising:
1. **One reusable, headless-inspired e-commerce engine** written in React and TypeScript.
2. **A modular section and UI component library** (12+ section types, full responsive support).
3. **Four visually distinct demo stores** (Coffee, Fashion, Jewelry, Electronics), each featuring distinct color palettes, typography pairings, section arrangements, hero types, card designs, and 15–20 realistic products with full variants.
4. **An extensible architecture (Requirement R5)** allowing 6 additional stores to be added seamlessly by authoring store configuration files and product datasets without modifying the core engine code.
5. **Zero backend requirement**: Fully client-side with simulated checkout, demo account management, instant search, collection filtering/sorting, and multi-store isolated `localStorage` persistence.

This report establishes the technical blueprint, module hierarchy, state management topology, routing specification, exact TypeScript interfaces, and testing framework for the system.

---

## 2. Engine Architecture

### 2.1 Project Tooling & Dependencies Matrix

The application must run as a high-speed Single Page Application (SPA) with zero compile bottlenecks and minimal runtime overhead:

| Category | Recommended Technology | Justification |
| :--- | :--- | :--- |
| **Bundler & Dev Server** | **Vite 5.x** (`@vitejs/plugin-react`) | Sub-second HMR, native ES module compilation, optimized Rollup production bundling, built-in asset hashing. |
| **UI Framework** | **React 18.3+** with **TypeScript 5.x** | Concurrent rendering, strict type-safety across store configs, predictable context propagation. |
| **Routing** | **React Router v6.x** (`react-router-dom`) | Declarative nested routing, parameterized store dispatch (`/:storeId/*`), deep-link query parameter parsing. |
| **Styling & Theming** | **Tailwind CSS v3.4+** + **CSS Custom Properties** | Pure utility-first styling with runtime CSS custom property variables (`var(--theme-*)`), avoiding the runtime JavaScript overhead of CSS-in-JS (e.g. styled-components) while supporting complete dynamic theme switching. |
| **Icons** | **Lucide React** (`lucide-react`) | Consistent, tree-shakeable SVG icon library with comprehensive e-commerce primitives (`ShoppingBag`, `Heart`, `Search`, `Menu`, `X`, `SlidersHorizontal`, etc.). |
| **Animation (Micro-interactions)** | **Tailwind Transitions + Framer Motion (Optional/Lightweight)** | Hardware-accelerated CSS transitions for drawers, modals, carousels, and page reveals. |
| **Testing** | **Playwright** + **Vitest** + **@testing-library/react** | Dual-track testing: Vitest for sub-second component/context unit tests, Playwright for end-to-end opaque-box multi-viewport verification. |

---

### 2.2 Complete Directory & Module Layout

The codebase strictly decouples the shared engine, the section library, and the per-store configuration files:

```
shopify_portfolio/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── playwright.config.ts
├── vitest.config.ts
├── src/
│   ├── main.tsx                         # SPA bootstrap & global font injection
│   ├── index.css                        # Tailwind directives & theme CSS variable fallbacks
│   ├── types/                           # Central TypeScript contracts
│   │   ├── index.ts                     # Barrel export
│   │   ├── store.ts                     # StoreConfig, Navigation, FooterConfig
│   │   ├── theme.ts                     # ThemeConfig, ColorTokens, TypographyTokens, LayoutTokens
│   │   ├── product.ts                   # Product, Variant, Option, SpecItem, Review
│   │   ├── collection.ts                # Collection, FilterGroup, SortOption
│   │   ├── section.ts                   # Discriminated union of all 12+ SectionConfig types
│   │   ├── cart.ts                      # CartItem, CartState, DiscountCode
│   │   ├── checkout.ts                  # CheckoutFormData, ShippingMethod, Order, PaymentDetails
│   │   └── account.ts                   # CustomerProfile, CustomerAddress, OrderHistory
│   │
│   ├── engine/                          # REUSABLE E-COMMERCE CORE ENGINE
│   │   ├── contexts/                    # State providers with localStorage sync
│   │   │   ├── StoreContext.tsx         # Active store metadata & catalog lookup
│   │   │   ├── ThemeContext.tsx         # Injects CSS variables and theme classes
│   │   │   ├── CartContext.tsx          # Store-isolated cart state & drawer controls
│   │   │   ├── WishlistContext.tsx      # Store-isolated wishlist management
│   │   │   ├── SearchContext.tsx        # Instant search index & modal visibility
│   │   │   └── AccountContext.tsx       # Demo account profile & orders
│   │   ├── hooks/                       # Custom ergonomics hooks
│   │   │   ├── useCart.ts               # Consumes CartContext
│   │   │   ├── useWishlist.ts           # Consumes WishlistContext
│   │   │   ├── useStore.ts              # Consumes StoreContext
│   │   │   ├── useTheme.ts              # Consumes ThemeContext
│   │   │   ├── useSearch.ts             # Consumes SearchContext
│   │   │   ├── useAccount.ts            # Consumes AccountContext
│   │   │   ├── useRecentlyViewed.ts     # Tracks viewed products in localStorage
│   │   │   ├── useCollectionFilter.ts   # URL-synchronized filtering & sorting logic
│   │   │   ├── useDebounce.ts           # Debounce utility for instant search input
│   │   │   └── useMediaQuery.ts         # Breakpoint listener for responsive UI
│   │   ├── layouts/                     # High-level shell components
│   │   │   ├── StoreLayout.tsx          # Persistent Header, Navigation, CartDrawer, SearchModal, Footer
│   │   │   ├── CheckoutLayout.tsx       # Distraction-free checkout header & security badges
│   │   │   └── HubLayout.tsx             # Root portfolio showcase shell
│   │   ├── router/                      # Routing setup & guards
│   │   │   ├── AppRouter.tsx            # Main BrowserRouter definition
│   │   │   ├── StoreRouteGuard.tsx      # Validates :storeId, sets active store context
│   │   │   └── ScrollToTop.tsx          # Restores window scroll on route change
│   │   └── utils/                       # Core computation utilities
│   │       ├── currency.ts              # Format currency (e.g., $12.00, €10.50)
│   │       ├── storage.ts               # Safe, namespaced localStorage wrapper
│   │       ├── searchIndex.ts           # Client-side weighted scoring search
│   │       ├── filterEngine.ts          # Multi-faceted collection filtering & sorting
│   │       └── fontLoader.ts            # Dynamic Google Fonts stylesheet injector
│   │
│   ├── sections/                        # REUSABLE SECTION COMPONENT LIBRARY
│   │   ├── SectionRenderer.tsx          # Polymorphic section dispatcher
│   │   ├── hero/
│   │   │   ├── HeroStandard.tsx         # Editorial classic hero with headline & CTA
│   │   │   ├── HeroSplit.tsx            # 50/50 image and copy split hero
│   │   │   └── HeroFullscreen.tsx       # Fullscreen immersive hero with overlay & badge
│   │   ├── products/
│   │   │   ├── FeaturedProducts.tsx     # Curated grid with tabbed or single collection
│   │   │   └── ProductCarousel.tsx      # Smooth horizontal scrollable carousel with controls
│   │   ├── collections/
│   │   │   └── CollectionCards.tsx      # Visual collection banner cards with hover zoom
│   │   ├── content/
│   │   │   ├── ImageWithText.tsx        # Storytelling alternating image + text block
│   │   │   ├── EditorialGrid.tsx        # Asymmetric magazine-style masonry or collage
│   │   │   ├── Marquee.tsx              # Continuous sliding ticker announcement banner
│   │   │   ├── LogoCloud.tsx            # Press/partner brand logos with monochrome styling
│   │   │   └── FaqAccordion.tsx         # Expandable collapsible FAQ accordion
│   │   ├── social/
│   │   │   ├── Testimonials.tsx         # Customer quote cards with avatars & stars
│   │   │   └── ReviewsList.tsx          # Customer review breakdown & score histogram
│   │   └── conversion/
│   │       └── Newsletter.tsx           # Inline or boxed newsletter signup with incentive
│   │
│   ├── components/                      # SHARED ATOMS, MOLECULES & DRAWERS
│   │   ├── common/
│   │   │   ├── Button.tsx               # Theme-styled button (solid, outline, ghost)
│   │   │   ├── Badge.tsx                # Tag, sale, new, stock badges
│   │   │   ├── StarRating.tsx           # Accessible 1-5 star visualizer
│   │   │   ├── ImageWithFallback.tsx    # Progressive blur-up / graceful image fallback
│   │   │   ├── Modal.tsx                # Accessible dialog with trap-focus & backdrop
│   │   │   ├── Drawer.tsx               # Slide-over panel (Cart & Mobile Nav)
│   │   │   ├── Toast.tsx                # Notification popup ("Added to cart!")
│   │   │   └── Skeleton.tsx             # Loading placeholders
│   │   ├── navigation/
│   │   │   ├── Header.tsx               # Store-configured header (centered, left, transparent)
│   │   │   ├── DesktopNav.tsx           # Mega menu or direct link list
│   │   │   ├── MobileNavDrawer.tsx      # Hamburger slide-out navigation
│   │   │   └── Footer.tsx               # Columnar footer with newsletter & copyright
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx           # Slide-out cart with line items, free shipping bar, checkout CTA
│   │   │   ├── CartItemRow.tsx          # Quantity selector, variant details, delete action
│   │   │   └── FreeShippingBar.tsx      # Dynamic threshold progress calculation
│   │   ├── product/
│   │   │   ├── ProductCard.tsx          # Reusable card honoring theme card style & aspect ratio
│   │   │   ├── ProductGallery.tsx       # Main image + thumbnail strip with zoom preview
│   │   │   ├── VariantSelector.tsx      # Pill buttons, color swatches, dropdowns
│   │   │   ├── QuantitySelector.tsx     # Increment/decrement input with min/max caps
│   │   │   ├── StickyAddToCart.tsx      # Mobile sticky bottom purchase bar
│   │   │   └── ProductSpecsTable.tsx    # Technical specifications comparison table
│   │   ├── collection/
│   │   │   ├── FilterSidebar.tsx        # Desktop filter accordions (price, tags, options)
│   │   │   ├── FilterDrawer.tsx         # Mobile slide-out filter panel
│   │   │   ├── SortDropdown.tsx         # Sort select (Price Low/High, Rating, Best Selling)
│   │   │   ├── ActiveFilterTags.tsx     # Removable chip filters
│   │   │   └── Pagination.tsx           # Page numbers or "Load More" button
│   │   └── search/
│   │       ├── SearchModal.tsx          # Instant search overlay with live results & recent queries
│   │       └── SearchResultItem.tsx     # Compact result preview row
│   │
│   ├── pages/                           # ROUTED PAGE VIEWS
│   │   ├── HubPage.tsx                  # Root "/" portfolio selector & architectural showcase
│   │   ├── StoreHomePage.tsx            # Dynamic section-driven homepage
│   │   ├── CollectionPage.tsx           # Full collection page with faceted navigation
│   │   ├── ProductDetailPage.tsx        # Comprehensive PDP with gallery, variants, tabs, related items
│   │   ├── CartPage.tsx                 # Full standalone cart view
│   │   ├── CheckoutPage.tsx             # 4-step simulated checkout (Info, Shipping, Payment, Success)
│   │   ├── AccountPage.tsx              # Demo customer dashboard (Orders, Addresses, Profile, Wishlist)
│   │   └── NotFoundPage.tsx             # 404 store or general not-found page
│   │
│   └── stores/                          # EXTENSIBLE STORE DEFINITIONS
│       ├── registry.ts                  # Central store catalog registry (O(1) lookup & enumeration)
│       ├── coffee/                      # Store 1: Coffee & Roastery
│       │   ├── config.ts                # Store metadata, navigation, homepage sections
│       │   ├── theme.ts                 # Earthy palette, serif typography, soft radii
│       │   ├── products.ts              # 15-20 coffee beans, equipment, cold brews
│       │   └── collections.ts           # Whole Bean, Filter, Cold Brew, Gear
│       ├── fashion/                     # Store 2: Minimalist Fashion
│       │   ├── config.ts                # Editorial nav, fullscreen hero, masonry layout
│       │   ├── theme.ts                 # High contrast monochrome, sharp modern typography
│       │   ├── products.ts              # 15-20 apparel items with size & color variants
│       │   └── collections.ts           # Outerwear, Essentials, Footwear, Accessories
│       ├── jewelry/                     # Store 3: Luxury Jewelry
│       │   ├── config.ts                # Luxury storytelling, centered logo, gold accents
│       │   ├── theme.ts                 # Midnight & champagne palette, elegant serifs
│       │   ├── products.ts              # 15-20 rings, necklaces, gemstones with carats & metal finishes
│       │   └── collections.ts           # Rings, Necklaces, Fine Gold, Diamond Atelier
│       └── electronics/                 # Store 4: High-Tech Electronics
│           ├── config.ts                # Tech navigation, spec matrices, split hero
│           ├── theme.ts                 # Cyber/slate accents, monospace/sans-serif, geometric corners
│           ├── products.ts              # 15-20 audio, peripherals, keyboards with technical specs
│           └── collections.ts           # Audio, Mechanical Keyboards, Monitors, Accessories
```

---

### 2.3 Dynamic Theming Engine (Tailwind CSS + CSS Custom Properties)

To satisfy Requirement R2 and R3 without compiling separate stylesheets per store, the engine employs a **CSS Custom Properties Runtime Architecture**.

#### How it works:
1. `tailwind.config.js` maps utility classes directly to semantic CSS variables:
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: ["./index.html", "./src/**/*.{ts,tsx}"],
     theme: {
       extend: {
         colors: {
           theme: {
             primary: 'var(--color-primary)',
             'primary-hover': 'var(--color-primary-hover)',
             'primary-text': 'var(--color-primary-text)',
             secondary: 'var(--color-secondary)',
             accent: 'var(--color-accent)',
             background: 'var(--color-background)',
             surface: 'var(--color-surface)',
             'surface-subtle': 'var(--color-surface-subtle)',
             text: 'var(--color-text)',
             'text-muted': 'var(--color-text-muted)',
             border: 'var(--color-border)',
           }
         },
         fontFamily: {
           heading: ['var(--font-heading)', 'serif'],
           body: ['var(--font-body)', 'sans-serif'],
           accent: ['var(--font-accent)', 'sans-serif'],
         },
         borderRadius: {
           'theme-sm': 'var(--radius-sm)',
           'theme-md': 'var(--radius-md)',
           'theme-lg': 'var(--radius-lg)',
           'theme-full': 'var(--radius-full)',
         },
         boxShadow: {
           'theme-card': 'var(--shadow-card)',
           'theme-elevated': 'var(--shadow-elevated)',
         }
       }
     }
   };
   ```

2. When the user visits `/:storeId/*`, `StoreRouteGuard` activates `ThemeContext`.
3. `ThemeContext` updates the CSS custom properties dynamically on the container element (or document root):
   ```typescript
   // In ThemeContext.tsx
   useEffect(() => {
     const root = document.documentElement;
     const theme = storeConfig.theme;
     
     // Color tokens
     root.style.setProperty('--color-primary', theme.colors.primary);
     root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
     root.style.setProperty('--color-primary-text', theme.colors.primaryText);
     root.style.setProperty('--color-secondary', theme.colors.secondary);
     root.style.setProperty('--color-accent', theme.colors.accent);
     root.style.setProperty('--color-background', theme.colors.background);
     root.style.setProperty('--color-surface', theme.colors.surface);
     root.style.setProperty('--color-surface-subtle', theme.colors.surfaceSubtle);
     root.style.setProperty('--color-text', theme.colors.text);
     root.style.setProperty('--color-text-muted', theme.colors.textMuted);
     root.style.setProperty('--color-border', theme.colors.border);
     
     // Typography tokens
     root.style.setProperty('--font-heading', theme.typography.headingFontFamily);
     root.style.setProperty('--font-body', theme.typography.bodyFontFamily);
     
     // Geometry tokens
     root.style.setProperty('--radius-sm', theme.geometry.radiusSm);
     root.style.setProperty('--radius-md', theme.geometry.radiusMd);
     root.style.setProperty('--radius-lg', theme.geometry.radiusLg);
     root.style.setProperty('--shadow-card', theme.geometry.shadowCard);
     
     // Dynamic font loading
     loadStoreFonts(theme.typography.googleFontsUrl);
   }, [storeConfig]);
   ```

4. Every shared component (buttons, cards, headers, drawers, hero banners) uses semantic Tailwind utility classes like `bg-theme-primary`, `text-theme-text`, `font-heading`, `rounded-theme-md`, `border-theme-border`.
5. This allows 100% code reuse while achieving total visual distinction across stores without CSS conflicts.

---

### 2.4 State Management Architecture

State is managed cleanly via React Contexts and custom hooks with isolated `localStorage` persistence.

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Window                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     AppRouter                         │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │           StoreRouteGuard (:storeId)            │  │  │
│  │  │                                                 │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │             StoreProvider                 │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │  │
│  │  │  │  │          ThemeProvider              │  │  │  │  │
│  │  │  │  │  ┌───────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │         CartProvider          │  │  │  │  │  │
│  │  │  │  │  │  ┌─────────────────────────┐  │  │  │  │  │  │
│  │  │  │  │  │  │     WishlistProvider    │  │  │  │  │  │  │
│  │  │  │  │  │  │  ┌───────────────────┐  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │   SearchProvider  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  ┌─────────────┐  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │ AccountProv │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │             │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │ StoreLayout │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │ (Header,    │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  Pages,     │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  Drawers,   │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  Footer)    │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  └─────────────┘  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  └───────────────────┘  │  │  │  │  │  │  │
│  │  │  │  │  │  └─────────────────────────┘  │  │  │  │  │  │
│  │  │  │  │  └───────────────────────────────┘  │  │  │  │  │
│  │  │  │  └─────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│       Isolated LocalStorage Layer (Keyed by storeId):       │
│  [shopify:coffee:cart]        [shopify:fashion:cart]        │
│  [shopify:coffee:wishlist]    [shopify:fashion:wishlist]    │
│  [shopify:coffee:recent]      [shopify:fashion:recent]      │
│  [shopify:coffee:orders]      [shopify:fashion:orders]      │
└─────────────────────────────────────────────────────────────┘
```

#### Detailed Context Specifications:

1. **`CartContext`**:
   - **Isolation**: Keyed as `shopify_portfolio:${storeId}:cart`. Adding coffee beans does NOT contaminate the jewelry cart.
   - **State**:
     - `items: CartItem[]`
     - `isOpen: boolean` (controls slide-out drawer)
     - `discountCode: string | null`
     - `discountPercent: number`
   - **Derived Computations**:
     - `itemCount: number` (sum of all quantities)
     - `subtotal: number` (sum of `price * quantity`)
     - `discountAmount: number` (`subtotal * (discountPercent / 100)`)
     - `shippingFee: number` (`subtotal >= freeShippingThreshold ? 0 : standardShippingRate`)
     - `freeShippingThreshold: number` (configured per store, e.g., $50 for coffee, $150 for jewelry)
     - `freeShippingProgress: number` (`Math.min(100, (subtotal / threshold) * 100)`)
     - `total: number` (`subtotal - discountAmount + shippingFee`)
   - **Actions**:
     - `addItem(product: Product, variant: Variant, quantity?: number)`
     - `removeItem(cartItemId: string)`
     - `updateQuantity(cartItemId: string, newQuantity: number)`
     - `clearCart()`
     - `applyDiscount(code: string): boolean`
     - `openCart()` / `closeCart()` / `toggleCart()`

2. **`WishlistContext`**:
   - **Isolation**: Keyed as `shopify_portfolio:${storeId}:wishlist`.
   - **State**: `items: WishlistItem[]`
   - **Actions**:
     - `addToWishlist(productId: string, variantId?: string)`
     - `removeFromWishlist(productId: string)`
     - `toggleWishlist(productId: string, variantId?: string)`
     - `isInWishlist(productId: string): boolean`
     - `moveToCart(productId: string, variantId?: string)`: Automatically removes from wishlist and executes `cart.addItem()`.

3. **`SearchContext`**:
   - **State**:
     - `isSearchOpen: boolean`
     - `query: string`
     - `results: Product[]`
     - `recentSearches: string[]` (stored per store)
     - `isSearching: boolean`
   - **Scoring Engine**: Client-side multi-attribute search across:
     - Title match: weight 10
     - Tags match: weight 7
     - Collection / Category match: weight 5
     - Description match: weight 2
   - **Debouncing**: 250ms debounced input to prevent UI lag.

4. **`AccountContext`**:
   - **Mock Profile**: Name, email, order list, saved shipping addresses.
   - **Simulated Checkout Bridge**: Completing a checkout creates an immutable `Order` object with a generated order number (`#COF-1082`, `#JWL-4921`), saving it into the active store's demo order history.

5. **Safe LocalStorage Utility**:
   - Encapsulates all read/write operations with `try-catch` to handle private browsing mode quotas or storage disabling.
   - Storage event listener (`window.addEventListener('storage', ...)`), ensuring multiple tabs stay synchronised in real time.

---

### 2.5 Section Rendering Engine (Dynamic Component Dispatch)

Store homepages are composed dynamically using a **Section Registry & Polymorphic Dispatcher**.

```typescript
// src/sections/SectionRenderer.tsx
interface SectionRendererProps {
  sections: SectionConfig[];
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ sections }) => {
  return (
    <div className="flex flex-col w-full">
      {sections.map((section) => {
        switch (section.type) {
          case 'hero-standard':
            return <HeroStandard key={section.id} config={section} />;
          case 'hero-split':
            return <HeroSplit key={section.id} config={section} />;
          case 'hero-fullscreen':
            return <HeroFullscreen key={section.id} config={section} />;
          case 'featured-products':
            return <FeaturedProducts key={section.id} config={section} />;
          case 'product-carousel':
            return <ProductCarousel key={section.id} config={section} />;
          case 'collection-cards':
            return <CollectionCards key={section.id} config={section} />;
          case 'image-with-text':
            return <ImageWithText key={section.id} config={section} />;
          case 'editorial-grid':
            return <EditorialGrid key={section.id} config={section} />;
          case 'testimonials':
            return <Testimonials key={section.id} config={section} />;
          case 'reviews-list':
            return <ReviewsList key={section.id} config={section} />;
          case 'logo-cloud':
            return <LogoCloud key={section.id} config={section} />;
          case 'marquee':
            return <Marquee key={section.id} config={section} />;
          case 'newsletter':
            return <Newsletter key={section.id} config={section} />;
          case 'faq-accordion':
            return <FaqAccordion key={section.id} config={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
};
```

This pattern guarantees:
- Stores can arrange sections in any arbitrary sequence.
- Sections can be repeated (e.g. two `featured-products` sections with different collection IDs).
- Stores can omit sections entirely without breaking the layout.

---

## 3. Routing & Multi-Store Architecture

### 3.1 Route Hierarchy & URL Taxonomy

```
Route Path                           Component Rendered           Purpose
─────────────────────────────────────────────────────────────────────────────────────────────
/                                    HubPage                      Portfolio landing & store selector
/:storeId                            StoreHomePage                Active store homepage
/:storeId/collections/:handle        CollectionPage               Collection browsing, filters, sorting
/:storeId/products/:handle           ProductDetailPage            Full PDP, gallery, variants, tabs
/:storeId/cart                       CartPage                     Full-page standalone shopping cart
/:storeId/checkout                   CheckoutPage                 4-step simulated checkout
/:storeId/account                    AccountPage                  Profile, orders, addresses, wishlist
/:storeId/search                     SearchPage                   Dedicated full search results view
*                                    NotFoundPage                 Graceful 404 handler
```

---

### 3.2 Store Route Guard & Dynamic Context Resolution

The `StoreRouteGuard` extracts the `:storeId` URL parameter and matches it against `storeRegistry`:

```typescript
// src/engine/router/StoreRouteGuard.tsx
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { storeRegistry } from '../../stores/registry';
import { StoreProvider } from '../contexts/StoreContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import { SearchProvider } from '../contexts/SearchContext';
import { AccountProvider } from '../contexts/AccountContext';
import { StoreLayout } from '../layouts/StoreLayout';

export const StoreRouteGuard = () => {
  const { storeId } = useParams<{ storeId: string }>();
  
  if (!storeId || !storeRegistry.has(storeId)) {
    return <Navigate to="/404" replace />;
  }

  const storeConfig = storeRegistry.get(storeId)!;

  return (
    <StoreProvider storeConfig={storeConfig}>
      <ThemeProvider themeConfig={storeConfig.theme}>
        <CartProvider storeId={storeConfig.id} threshold={storeConfig.freeShippingThreshold}>
          <WishlistProvider storeId={storeConfig.id}>
            <SearchProvider storeId={storeConfig.id}>
              <AccountProvider storeId={storeConfig.id}>
                <StoreLayout>
                  <Outlet />
                </StoreLayout>
              </AccountProvider>
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};
```

#### Key Architecture Benefits:
1. **Zero Flash of Incorrect Content/Theme**: The theme and store contexts are initialized before the route children render.
2. **Deep-linking capability**: Users or automated tests can directly request `http://localhost:5173/jewelry/products/eternity-diamond-band` and the application resolves the Jewelry catalog, initializes the Jewelry theme variables, and renders the exact product instantly.
3. **True multi-tenancy**: Browsing between `/coffee` and `/fashion` cleanly unmounts and remounts the store providers with their respective datasets.

---

### 3.3 Deep Linking & URL State Synchronization (Filters, Sorting, Pagination)

Faceted collection filtering must keep the URL parameters in sync so that back/forward navigation and shareable links work as expected:

- Example URL: `/fashion/collections/outerwear?category=jackets&color=black&priceMax=200&sort=price-asc&page=1`
- The `useCollectionFilter` hook parses `useSearchParams()`.
- Filter actions use `setSearchParams({ ...params }, { replace: true })`, preventing history pollution while preserving exact navigation history across page jumps.

---

### 3.4 Browser History & Scroll Management

- **ScrollToTop**: A dedicated hook that listens to `location.pathname` and executes `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` on new page navigations, while allowing the browser's native scroll restoration to handle Back/Forward gestures.
- **Drawer History Safety**: When a modal or drawer (CartDrawer, SearchModal, MobileNavDrawer) is open, pressing the browser Back button or Esc key closes the drawer without unexpectedly navigating the user away from the store.

---

## 4. Extensibility Architecture (Requirement R5)

The architecture adheres strictly to the **Open-Closed Principle (OCP)**: *Open for extension, closed for modification.*

### 4.1 Decoupling Engine from Store Themes & Catalogs

To add a new store (e.g. `skincare`, `sneakers`, `home-decor`, `gourmet-tea`), a developer performs **4 isolated file creations and 1 registry registration**, requiring **ZERO edits to engine components, routers, layouts, or section code**:

```
Step 1: Create src/stores/<new-store>/theme.ts       (Implements ThemeConfig)
Step 2: Create src/stores/<new-store>/products.ts    (Implements Product[])
Step 3: Create src/stores/<new-store>/collections.ts (Implements Collection[])
Step 4: Create src/stores/<new-store>/config.ts      (Implements StoreConfig)
Step 5: Add store to src/stores/registry.ts          (registerStore(newStoreConfig))
```

---

### 4.2 Standard Store Contract

Every store provides a single `StoreConfig` object that satisfies the engine contract:

```typescript
// src/stores/registry.ts
import { StoreConfig } from '../types/store';
import { coffeeStoreConfig } from './coffee/config';
import { fashionStoreConfig } from './fashion/config';
import { jewelryStoreConfig } from './jewelry/config';
import { electronicsStoreConfig } from './electronics/config';

class StoreRegistry {
  private stores: Map<string, StoreConfig> = new Map();

  constructor() {
    this.register(coffeeStoreConfig);
    this.register(fashionStoreConfig);
    this.register(jewelryStoreConfig);
    this.register(electronicsStoreConfig);
  }

  register(store: StoreConfig): void {
    this.stores.set(store.id, store);
  }

  get(id: string): StoreConfig | undefined {
    return this.stores.get(id);
  }

  has(id: string): boolean {
    return this.stores.has(id);
  }

  getAll(): StoreConfig[] {
    return Array.from(this.stores.values());
  }
}

export const storeRegistry = new StoreRegistry();
```

---

### 4.3 Concrete TypeScript Type Definitions

Below are the exact, comprehensive TypeScript interfaces for the entire system:

```typescript
// ============================================================================
// 1. THEME CONFIGURATION (src/types/theme.ts)
// ============================================================================

export interface ColorTokens {
  primary: string;           // Main brand color (buttons, active states)
  primaryHover: string;      // Hover state for primary actions
  primaryText: string;       // Text color on primary background
  secondary: string;         // Secondary accent color
  accent: string;            // Highlights, callout badges, star ratings
  background: string;        // Main page background
  surface: string;           // Cards, drawers, modals background
  surfaceSubtle: string;     // Input fills, table striping, inactive pills
  text: string;              // Primary body text
  textMuted: string;         // Secondary/subdued text, captions
  border: string;            // Default container borders and dividers
}

export interface TypographyTokens {
  headingFontFamily: string; // e.g., "'Playfair Display', serif"
  bodyFontFamily: string;    // e.g., "'Inter', sans-serif"
  accentFontFamily?: string; // e.g., "'JetBrains Mono', monospace"
  googleFontsUrl: string;    // Google fonts stylesheet link for auto-injection
  headingWeight: string;     // e.g., "700" or "600"
  bodyWeight: string;        // e.g., "400"
  baseSizeRem: number;       // Base rem scaling
}

export interface GeometryTokens {
  radiusSm: string;          // e.g., "0px" (sharp tech), "6px", "12px" (coffee)
  radiusMd: string;          // e.g., "0px", "12px", "20px"
  radiusLg: string;          // e.g., "0px", "20px", "32px"
  shadowCard: string;        // e.g., "none" or "0 10px 30px rgba(0,0,0,0.06)"
  borderWidth: string;       // e.g., "1px" or "2px"
}

export type HeaderStyle = 'left-logo' | 'centered-logo' | 'split-nav' | 'minimal-transparent';
export type CardStyle = 'border-subtle' | 'elevated-shadow' | 'flat-minimal' | 'bordered-bold';
export type AnimationPersonality = 'subtle' | 'cinematic' | 'sharp-fast' | 'playful';

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  geometry: GeometryTokens;
  headerStyle: HeaderStyle;
  cardStyle: CardStyle;
  productImageAspectRatio: '1:1' | '3:4' | '4:5' | '16:9';
  animationPersonality: AnimationPersonality;
}

// ============================================================================
// 2. PRODUCT & CATALOG TYPES (src/types/product.ts)
// ============================================================================

export interface ProductOptionValue {
  id: string;
  name: string;              // e.g., "Small", "Black", "250g", "Gold"
  visualValue?: string;      // Hex color (e.g., "#000000") or image preview URL
}

export interface ProductOption {
  id: string;
  name: string;              // e.g., "Size", "Color", "Grind", "Material"
  values: ProductOptionValue[];
}

export interface Variant {
  id: string;
  title: string;             // e.g., "Whole Bean / 250g" or "Black / M"
  sku: string;
  price: number;             // Standard price in dollars
  compareAtPrice?: number;   // Original price for discount display
  inventoryQuantity: number; // For stock status calculation
  available: boolean;
  selectedOptions: Record<string, string>; // e.g. { "Color": "Black", "Size": "M" }
  image?: string;            // Variant-specific image
}

export interface SpecItem {
  label: string;             // e.g., "Origin", "Material", "Battery Life"
  value: string;             // e.g., "Yirgacheffe, Ethiopia", "18k Solid Gold", "40 Hours"
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;            // 1 to 5
  date: string;
  title: string;
  content: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  handle: string;            // URL slug: "ethiopia-yirgacheffe-single-origin"
  title: string;
  subtitle?: string;
  description: string;
  vendor: string;
  category: string;
  tags: string[];
  images: string[];          // Array of high-res image URLs
  options: ProductOption[];
  variants: Variant[];
  priceRange: {
    min: number;
    max: number;
  };
  compareAtPriceRange?: {
    min: number;
    max: number;
  };
  rating: number;            // Aggregate rating (e.g. 4.8)
  reviewCount: number;
  reviews: ProductReview[];
  specs?: SpecItem[];        // Technical or origin details
  badge?: 'new' | 'bestseller' | 'sale' | 'limited';
  relatedProductHandles?: string[];
  isAvailable: boolean;
}

// ============================================================================
// 3. COLLECTION & FILTER TYPES (src/types/collection.ts)
// ============================================================================

export interface Collection {
  id: string;
  handle: string;            // e.g., "whole-bean", "outerwear", "rings"
  title: string;
  description: string;
  image: string;
  bannerImage?: string;
  productHandles: string[];  // Handles of products belonging to this collection
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest' | 'bestselling';

export interface FilterState {
  category?: string[];
  priceRange: [number, number];
  options: Record<string, string[]>; // e.g., { "Size": ["M", "L"], "Color": ["Black"] }
  ratingMin?: number;
  inStockOnly?: boolean;
}

// ============================================================================
// 4. SECTION CONFIGURATION DISCRIMINATED UNIONS (src/types/section.ts)
// ============================================================================

export interface BaseSectionConfig {
  id: string;
  type: string;
  paddingTop?: 'none' | 'small' | 'medium' | 'large';
  paddingBottom?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: 'default' | 'surface' | 'accent' | 'contrast';
}

export interface HeroStandardConfig extends BaseSectionConfig {
  type: 'hero-standard';
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage: string;
  textAlignment: 'left' | 'center' | 'right';
}

export interface HeroSplitConfig extends BaseSectionConfig {
  type: 'hero-split';
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  imagePosition: 'left' | 'right';
  badge?: string;
}

export interface HeroFullscreenConfig extends BaseSectionConfig {
  type: 'hero-fullscreen';
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  mediaUrl: string;
  overlayOpacity: number;    // 0.0 to 1.0
  tagline?: string;
}

export interface FeaturedProductsConfig extends BaseSectionConfig {
  type: 'featured-products';
  title: string;
  subtitle?: string;
  collectionHandle: string;
  limit: number;
  viewAllLink?: string;
  columnsDesktop: 3 | 4;
}

export interface ProductCarouselConfig extends BaseSectionConfig {
  type: 'product-carousel';
  title: string;
  subtitle?: string;
  collectionHandle: string;
  limit: number;
}

export interface CollectionCardsConfig extends BaseSectionConfig {
  type: 'collection-cards';
  title: string;
  collectionHandles: string[];
  layout: 'grid' | 'carousel';
}

export interface ImageWithTextConfig extends BaseSectionConfig {
  type: 'image-with-text';
  headline: string;
  body: string;
  image: string;
  imagePosition: 'left' | 'right';
  ctaText?: string;
  ctaLink?: string;
}

export interface EditorialGridConfig extends BaseSectionConfig {
  type: 'editorial-grid';
  headline?: string;
  items: Array<{
    title: string;
    description: string;
    image: string;
    link: string;
    colSpanDesktop: 1 | 2;
  }>;
}

export interface TestimonialsConfig extends BaseSectionConfig {
  type: 'testimonials';
  title: string;
  testimonials: Array<{
    quote: string;
    author: string;
    roleOrLocation: string;
    avatarUrl?: string;
    rating: number;
  }>;
}

export interface ReviewsListConfig extends BaseSectionConfig {
  type: 'reviews-list';
  title: string;
  productHandle?: string;
}

export interface LogoCloudConfig extends BaseSectionConfig {
  type: 'logo-cloud';
  title?: string;
  logos: Array<{
    name: string;
    imageUrl: string;
  }>;
}

export interface MarqueeConfig extends BaseSectionConfig {
  type: 'marquee';
  items: string[];
  speedSeconds?: number;
  direction?: 'left' | 'right';
}

export interface NewsletterConfig extends BaseSectionConfig {
  type: 'newsletter';
  headline: string;
  subheadline: string;
  disclaimer?: string;
  buttonText: string;
}

export interface FaqAccordionConfig extends BaseSectionConfig {
  type: 'faq-accordion';
  title: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export type SectionConfig =
  | HeroStandardConfig
  | HeroSplitConfig
  | HeroFullscreenConfig
  | FeaturedProductsConfig
  | ProductCarouselConfig
  | CollectionCardsConfig
  | ImageWithTextConfig
  | EditorialGridConfig
  | TestimonialsConfig
  | ReviewsListConfig
  | LogoCloudConfig
  | MarqueeConfig
  | NewsletterConfig
  | FaqAccordionConfig;

// ============================================================================
// 5. STORE CONFIGURATION & NAVIGATION (src/types/store.ts)
// ============================================================================

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
  isBadge?: boolean;
}

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface FooterConfig {
  brandDescription: string;
  columns: FooterColumn[];
  socialLinks: Array<{ platform: 'instagram' | 'twitter' | 'youtube' | 'facebook'; url: string }>;
  copyright: string;
}

export interface StoreConfig {
  id: string;                        // "coffee", "fashion", "jewelry", "electronics"
  name: string;                      // Display name: "Artisan Roast Co."
  tagline: string;
  currency: {
    symbol: string;                  // "$"
    code: string;                    // "USD"
  };
  freeShippingThreshold: number;     // e.g. 50
  standardShippingRate: number;      // e.g. 5.00
  theme: ThemeConfig;
  navigation: NavigationItem[];
  footer: FooterConfig;
  sections: SectionConfig[];         // Homepage section layout
  collections: Collection[];
  products: Product[];
}

// ============================================================================
// 6. CART, CHECKOUT & ACCOUNT (src/types/cart.ts, checkout.ts, account.ts)
// ============================================================================

export interface CartItem {
  id: string;                        // `${productId}_${variantId}`
  productId: string;
  productHandle: string;
  variantId: string;
  title: string;
  variantTitle: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  quantity: number;
  selectedOptions: Record<string, string>;
}

export interface CheckoutCustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;               // e.g., "#COF-9021"
  storeId: string;
  createdAt: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  customer: CheckoutCustomerInfo;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;             // e.g., "Demo Credit Card (ending in 4242)"
}
```

---

## 5. Testing Architecture & Quality Assurance

To guarantee bulletproof stability across all 4 demo stores and arbitrary future stores, we prescribe a **Dual-Track Testing Architecture**:
1. **Track 1: Component & Unit Testing** with **Vitest + React Testing Library + JSDOM** (fast feedback, high branch coverage on business logic).
2. **Track 2: Opaque-Box E2E Testing** with **Playwright** (real browser execution across 6 responsive viewports, black-box user interactions).

---

### 5.1 Opaque-Box E2E Testing Strategy (Playwright)

Opaque-box testing treats the application strictly as an external user sees it:
- **No private state hacking**: Tests inspect the DOM via user-visible text, ARIA roles (`role="button"`, `role="dialog"`), and form inputs.
- **Viewport matrix testing**: Automated verification at all required breakpoints:
  - Mobile: `320px`, `375px`, `390px`
  - Tablet/Laptop: `1024px`
  - Desktop: `1280px`, `1440px`

#### 5-Tier Verification Matrix:

| Tier | Name | Target Coverage & Acceptance Assertions |
| :--- | :--- | :--- |
| **Tier 1** | **Smoke & Route Matrix** | - `/` portfolio hub loads cleanly.<br>- `/:storeId` for coffee, fashion, jewelry, electronics loads without console errors or blank screens.<br>- Deep links (`/coffee/collections/beans`, `/fashion/products/linen-shirt`, `/jewelry/cart`, `/electronics/account`) resolve correct store config & title.<br>- Invalid route `/unknown-store` redirects to 404. |
| **Tier 2** | **Core E-Commerce Flows** | - Add to cart from PDP updates header badge count & opens CartDrawer.<br>- Cart drawer reflects variant title, price, and thumbnail.<br>- Quantity increment recalculates subtotal and free shipping progress.<br>- Item removal updates totals; removing last item renders empty cart state.<br>- Page refresh preserves cart contents (localStorage persistence verification).<br>- Simulated checkout flow navigates: Info → Shipping → Payment → Order Confirmation. |
| **Tier 3** | **Discovery, Filters & State** | - Instant search modal opens, user types query, relevant products appear.<br>- Gibberish search returns "No products found" state.<br>- Collection filter narrows product count (e.g. category filter or price slider).<br>- Collection sort reorders products correctly (Price Low→High produces ascending prices).<br>- Wishlist toggle adds/removes item and persists across refresh.<br>- "Move to Cart" button removes product from wishlist and adds to cart. |
| **Tier 4** | **Responsive & Visual Distinction** | - At 375px: Hamburger menu button exists; clicking opens MobileNavDrawer.<br>- At 375px: Sticky Add-to-Cart bar appears on PDP.<br>- At 375px: Page width has zero horizontal overflow (`scrollWidth <= innerWidth`).<br>- At 1440px: Desktop navigation visible; product grids display 3–4 columns.<br>- Visual Distinction: Verify computed CSS primary colors, typography families, and hero variants differ across all 4 stores. |
| **Tier 5** | **Adversarial Edge Cases** | - Malformed localStorage payload (`localStorage.setItem('shopify_portfolio:coffee:cart', 'INVALID_JSON')`) is safely sanitized without crash.<br>- Rapid double-click on Add-to-Cart does not corrupt cart state.<br>- Zero stock variant disables button and shows "Sold Out". |

---

### 5.2 Unit & Integration Testing Strategy (Vitest)

Vitest will execute unit tests directly inside the Vite environment:
- `currency.test.ts`: Formats currency with commas, decimals, and custom symbols.
- `filterEngine.test.ts`: Tests multi-criteria filtering, multi-value tag filters, price range clipping, and sort comparators.
- `searchIndex.test.ts`: Verifies search ranking weights and fuzzy/partial matching.
- `CartContext.test.tsx`: Tests line-item merging for identical variants vs separate lines for distinct variants.
- `FreeShippingBar.test.tsx`: Validates 0%, 50%, and 100% (unlocked) threshold state.

---

### 5.3 Proposed `package.json` Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:responsive": "playwright test tests/e2e/responsive.spec.ts",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

## 6. Architectural Risk Assessment & Mitigation

| Potential Risk | Root Cause | Architectural Mitigation |
| :--- | :--- | :--- |
| **Cross-Store Data Leakage** | Shared `localStorage` keys causing Coffee cart items to appear in the Jewelry store. | Explicitly namespace every storage key with the active `storeId`: `shopify_portfolio:${storeId}:${feature}`. |
| **Style Clashes across Stores** | Using hardcoded Tailwind colors or conflicting CSS classes. | Rely strictly on semantic CSS Custom Properties (`--color-primary`, `--font-heading`) mapped via `tailwind.config.js`. |
| **FOUC (Flash of Unstyled Content)** | Google fonts or CSS variables loading after React renders components. | `StoreRouteGuard` applies CSS variables synchronously before rendering the layout; font `<link>` tags are injected immediately. |
| **Excessive Bundle Size** | 4 stores × 20 products = 80 product objects and multiple high-res image imports. | Product catalogs are pure data JSON/TS files; images use external Unsplash CDN URLs with optimal image sizing parameters (`&w=800&q=80`). |
| **Mobile Horizontal Overflow** | Unconstrained hero images, large tables, or long flex marquees. | Enforce `overflow-x-hidden` on main layout wrapper, `max-w-full` on all images, and strict Playwright viewport overflow assertions in Tier 4 tests. |

---

## 7. Conclusion & Next Steps for Teamwork

This architectural survey provides the complete structural blueprint for:
1. Setting up the Vite + React + Tailwind foundation.
2. Building the isolated Context and LocalStorage persistence layer.
3. Implementing the polymorphic SectionRenderer and 12+ reusable sections.
4. Implementing the 4 demo stores without code duplication.
5. Preparing the Playwright and Vitest test harnesses for 100% acceptance test verification.
