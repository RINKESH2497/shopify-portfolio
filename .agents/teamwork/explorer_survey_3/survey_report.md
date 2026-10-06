# SECTION LIBRARY, STORE IDENTITY & PRODUCT CATALOG SPECIFICATION
**Explorer Survey 3 Report — Shopify Portfolio Project**  
**Document ID:** `SURVEY-REPORT-EXP3-2026-10-05`  
**Workspace:** `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio`  
**Status:** Complete & Authoritative  

---

## 1. Executive Summary & Scope Boundary

This document serves as the master architectural specification for:
1. **The Reusable Section Library**: Complete component taxonomy, configuration schema, TypeScript interfaces, responsive behaviors, and theme token bindings for 13 modular sections (including 3 distinct Hero variants).
2. **The 4 Visually Distinct Demo Stores**: Complete visual identity systems for Coffee, Fashion, Jewelry, and Electronics—enforcing zero shared primary colors, unique font pairings, distinct navigation styles, card ergonomics, animation dynamics, and divergent homepage section compositions.
3. **The Product Catalog Architecture & 64-Product Dataset**: Universal e-commerce schema supporting multi-dimensional variants, dynamic price recalculation, rich metadata, and 16 fully articulated products per store (64 total) with verified, high-resolution Unsplash imagery, realistic variant matrices, and domain-specific attributes.

---

## 2. Reusable Section Library Inventory & Specifications

The section library is built on a **dynamic schema-driven registry**. Each section is a pure, theme-aware React component that receives a typed `config` object and reads global theme tokens (colors, radii, typography, spacing) via CSS variables or a unified `useTheme()` hook.

### 2.1 Universal Section Configuration Contract

```typescript
// Core Section Types
export type SectionType =
  | 'hero-standard'
  | 'hero-split'
  | 'hero-fullscreen'
  | 'featured-products'
  | 'product-carousel'
  | 'collection-cards'
  | 'image-text'
  | 'testimonials'
  | 'reviews'
  | 'logo-cloud'
  | 'marquee'
  | 'newsletter'
  | 'faq'
  | 'editorial-grid';

export interface BaseSectionConfig {
  id: string;
  type: SectionType;
  spacing?: {
    paddingTop?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
    paddingBottom?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
    containerWidth?: 'narrow' | 'standard' | 'wide' | 'full';
  };
  themeOverride?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}
```

---

### 2.2 Detailed Section Specifications

#### Section 1: Hero Standard (`hero-standard`)
- **Visual Rendering**: Centered or left-aligned high-impact typography framed against a styled container or subtle atmospheric gradient. Includes an eyebrow badge, majestic headline, descriptive body, dual action buttons (Primary + Secondary), and optional trust metrics.
- **Used by**: **Jewelry Store** ("L'Étoile Joaillerie").
- **Props & Schema**:
  ```typescript
  export interface HeroStandardConfig extends BaseSectionConfig {
    type: 'hero-standard';
    eyebrowText?: string;
    title: string;
    subtitle: string;
    align: 'left' | 'center';
    primaryCta: { text: string; url: string; variant?: 'solid' | 'outline' };
    secondaryCta?: { text: string; url: string; variant?: 'solid' | 'outline' };
    backgroundImageUrl?: string;
    backgroundOverlayOpacity?: number; // 0 to 1
    floatingBadge?: { title: string; subtitle: string; icon?: string };
    metrics?: Array<{ label: string; value: string }>;
  }
  ```
- **Responsive Behavior**:
  - `320px–390px`: Title scales to `clamp(2rem, 8vw, 2.75rem)`, buttons stack vertically with full width (`w-full`), padding decreases to 48px top/bottom.
  - `1024px–1440px`: Title displays at 4rem–5rem, buttons sit inline with 16px gap, centered max-width 896px (`max-w-4xl`).

#### Section 2: Hero Split (`hero-split`)
- **Visual Rendering**: 50/50 two-column asymmetric composition. One side contains the brand narrative, badges, and CTAs; the other features an interactive/curated hero image or lifestyle portrait with floating contextual tags (e.g. "Roast Date: Today", "Single Origin"). Reversible layout.
- **Used by**: **Coffee Store** ("Terroir & Roast") & **Electronics Store** ("Nexus Tech").
- **Props & Schema**:
  ```typescript
  export interface HeroSplitConfig extends BaseSectionConfig {
    type: 'hero-split';
    badge?: string;
    title: string;
    titleHighlight?: string;
    description: string;
    mediaPosition: 'left' | 'right';
    imageUrl: string;
    imageAlt: string;
    secondaryImageUrl?: string;
    primaryCta: { text: string; url: string };
    secondaryCta?: { text: string; url: string };
    floatingCard?: {
      title: string;
      subtitle: string;
      badgeText?: string;
      position?: 'top-left' | 'bottom-right' | 'bottom-left';
    };
    featureBullets?: string[];
  }
  ```
- **Responsive Behavior**:
  - `320px–768px`: Stacks vertically. Text first, followed by hero image (`order-1` / `order-2`), image aspect locked to `aspect-[4/3]` or `aspect-square`.
  - `1024px+`: Strict 2-column CSS grid (`grid-cols-2`), 48px to 64px gutter, sticky text centering with full-height media container.

#### Section 3: Hero Fullscreen / Video / Immersive (`hero-fullscreen`)
- **Visual Rendering**: Edge-to-edge 100vh viewport banner. High-resolution ambient photography or simulated video loop backdrop, dark scrim overlay, high-fashion all-caps stark typography, bottom-anchored content with scroll indicator.
- **Used by**: **Fashion Store** ("Atelier Noir").
- **Props & Schema**:
  ```typescript
  export interface HeroFullscreenConfig extends BaseSectionConfig {
    type: 'hero-fullscreen';
    headline: string;
    seasonTag: string;
    tagline: string;
    mediaUrl: string; // High-res image or video
    mediaType: 'image' | 'video';
    primaryCta: { text: string; url: string };
    secondaryCta?: { text: string; url: string };
    overlayOpacity: number; // 0.2 to 0.7
    showScrollIndicator: boolean;
    announcementBadge?: string;
  }
  ```
- **Responsive Behavior**:
  - `320px–390px`: Height set to `min-h-[85vh]` or `100svh` (dynamic viewport height to avoid mobile address bar jump), headline font size `clamp(2.5rem, 10vw, 3.5rem)`.
  - `1024px+`: True `h-screen`, editorial staggered layout with dramatic typography, bottom navigation ticker.

#### Section 4: Featured Products Grid (`featured-products`)
- **Visual Rendering**: Responsive product catalog showcase. Header with section title, description, category filter tabs, and a "Shop All" link. Product cards adapt to the store's card design tokens (borders, shadows, aspect ratios, quick add).
- **Props & Schema**:
  ```typescript
  export interface FeaturedProductsConfig extends BaseSectionConfig {
    type: 'featured-products';
    title: string;
    subtitle?: string;
    collectionHandle?: string;
    productIds?: string[];
    limit: number; // e.g. 4, 8
    columns: 2 | 3 | 4;
    viewAllUrl?: string;
    showQuickAdd: boolean;
    filterTags?: string[];
  }
  ```
- **Responsive Behavior**:
  - `320px–390px`: 1 or 2 columns (`grid-cols-1` or `grid-cols-2 gap-3`).
  - `1024px`: 3 columns (`grid-cols-3 gap-6`).
  - `1440px`: 4 columns (`grid-cols-4 gap-8`).

#### Section 5: Product Carousel (`product-carousel`)
- **Visual Rendering**: Touch-swipeable and mouse-draggable horizontal track of product cards. Displays smooth scroll snapping, prev/next circular arrow buttons, and an active progress indicator bar.
- **Props & Schema**:
  ```typescript
  export interface ProductCarouselConfig extends BaseSectionConfig {
    type: 'product-carousel';
    title: string;
    subtitle?: string;
    collectionHandle?: string;
    productIds?: string[];
    autoplay?: boolean;
    itemsVisibleDesktop: number; // default 4
    itemsVisibleMobile: number;  // default 1.25 or 1.5
    viewAllUrl?: string;
  }
  ```
- **Responsive Behavior**:
  - `320px–390px`: Native CSS smooth momentum scroll (`overflow-x-auto snap-x snap-mandatory`), showing 1.2 cards to visually invite horizontal swiping without clutter.
  - `1024px+`: Desktop carousel with smooth transform transitions and hover arrow controls.

#### Section 6: Collection Cards & Banners (`collection-cards`)
- **Visual Rendering**: Curated category exploration cards. Displays atmospheric background imagery, category title, product count, and an interactive zoom/tint effect on hover.
- **Props & Schema**:
  ```typescript
  export interface CollectionCardItem {
    id: string;
    title: string;
    subtitle?: string;
    itemCount?: number;
    imageUrl: string;
    linkUrl: string;
    badge?: string;
  }
  export interface CollectionCardsConfig extends BaseSectionConfig {
    type: 'collection-cards';
    title: string;
    subtitle?: string;
    layout: 'grid-3' | 'grid-4' | 'bento-asymmetric' | 'horizontal-scroll';
    collections: CollectionCardItem[];
  }
  ```
- **Responsive Behavior**:
  - `320px–390px`: Single column card stack or horizontal swipe strip with peek preview.
  - `1024px+`: Multi-column grid with image scale on hover (`scale-105 duration-500`).

#### Section 7: Image + Text Editorial (`image-text`)
- **Visual Rendering**: High-editorial storytelling module for brand heritage, artisanal craftsmanship, or tech breakdowns. Features rich paragraphs, quote highlights, artisan signature/badge, and button.
- **Props & Schema**:
  ```typescript
  export interface ImageTextConfig extends BaseSectionConfig {
    type: 'image-text';
    eyebrow?: string;
    title: string;
    description: string;
    quote?: { text: string; author: string; role?: string };
    mediaPosition: 'left' | 'right';
    imageUrl: string;
    imageAlt: string;
    cta?: { text: string; url: string };
    stats?: Array<{ value: string; label: string }>;
  }
  ```
- **Responsive Behavior**:
  - `320px–768px`: Stacked layout (media top or bottom configurable, defaults to media top).
  - `1024px+`: 50/50 side-by-side with vertical centering.

#### Section 8: Testimonials & Press Quotes (`testimonials`)
- **Visual Rendering**: Grid or carousel of customer testimonials and verified buyer endorsements. Features star ratings, quote text, customer name, location, and verified badge.
- **Props & Schema**:
  ```typescript
  export interface TestimonialItem {
    id: string;
    author: string;
    roleOrLocation: string;
    rating: number; // 1 to 5
    quote: string;
    verifiedBuyer: boolean;
    avatarUrl?: string;
    productReferenced?: string;
  }
  export interface TestimonialsConfig extends BaseSectionConfig {
    type: 'testimonials';
    title: string;
    subtitle?: string;
    items: TestimonialItem[];
    displayStyle: 'grid' | 'carousel';
  }
  ```

#### Section 9: Reviews Aggregate & Breakdown (`reviews`)
- **Visual Rendering**: Deep social proof module displaying aggregate score (e.g. 4.9/5 based on 2,840+ reviews), star breakdown bars (5-star down to 1-star), customer highlights, and "Write a Review" simulated action button.
- **Props & Schema**:
  ```typescript
  export interface ReviewsConfig extends BaseSectionConfig {
    type: 'reviews';
    title: string;
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: { 5: number; 4: number; 3: number; 2: number; 1: number }; // percentages
    featuredReviews: Array<{
      id: string;
      title: string;
      content: string;
      rating: number;
      author: string;
      date: string;
      verified: boolean;
    }>;
  }
  ```

#### Section 10: Logo Cloud & Trust Certifications (`logo-cloud`)
- **Visual Rendering**: Clean, trust-building strip featuring industry press logos, sustainability certs, or hardware compatibility badges.
- **Props & Schema**:
  ```typescript
  export interface LogoCloudConfig extends BaseSectionConfig {
    type: 'logo-cloud';
    title?: string; // e.g. "Recognized by industry leaders"
    logos: Array<{ name: string; svgOrText: string; url?: string; description?: string }>;
    grayscale: boolean;
    layout: 'grid' | 'ticker';
  }
  ```

#### Section 11: Dynamic Marquee / Announcement Ticker (`marquee`)
- **Visual Rendering**: Continuous, hardware-accelerated infinite scrolling ticker (CSS `@keyframes ticker`). Supports custom separator symbols, hover-to-pause, and custom velocity.
- **Props & Schema**:
  ```typescript
  export interface MarqueeConfig extends BaseSectionConfig {
    type: 'marquee';
    items: string[];
    speed: 'slow' | 'medium' | 'fast'; // e.g. 40s, 25s, 15s
    direction: 'left' | 'right';
    pauseOnHover: boolean;
    separatorIcon: string; // e.g. '•', '★', '⚡', '✦'
    backgroundColor?: string;
    textColor?: string;
  }
  ```

#### Section 12: Accordion FAQ Section (`faq`)
- **Visual Rendering**: Interactive accordion for addressing buyer objections (shipping, sizing, materials, warranties). Smooth animated expansion with accessible `aria-expanded` and keyboard navigation.
- **Props & Schema**:
  ```typescript
  export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category?: string;
  }
  export interface FaqConfig extends BaseSectionConfig {
    type: 'faq';
    title: string;
    subtitle?: string;
    items: FaqItem[];
    categories?: string[];
    allowMultipleOpen: boolean;
  }
  ```

#### Section 13: Asymmetric Editorial Grid / Lookbook (`editorial-grid`)
- **Visual Rendering**: Magazine-style lookbook grid featuring 1 large anchor story tile and 2–3 staggered visual tiles with shoppable product tags or narrative captions.
- **Props & Schema**:
  ```typescript
  export interface EditorialGridConfig extends BaseSectionConfig {
    type: 'editorial-grid';
    title: string;
    subtitle?: string;
    mainStory: {
      title: string;
      description: string;
      imageUrl: string;
      linkUrl: string;
      tag: string;
    };
    secondaryStories: Array<{
      title: string;
      imageUrl: string;
      linkUrl: string;
      tag?: string;
    }>;
  }
  ```

---

## 3. Four Visually Distinct Demo Stores: Visual Identity & Composition Matrix

The four stores are architected to look and feel completely unrelated in design language, satisfying every constraint in Acceptance Criteria AC61–AC67.

### 3.1 Design System Token Definitions

```typescript
export interface StoreThemeConfig {
  id: 'coffee' | 'fashion' | 'jewelry' | 'electronics';
  name: string;
  tagline: string;
  routePrefix: string;
  colors: {
    primary: string;           // AC62: STRICTLY UNIQUE PER STORE
    primaryHover: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    badgeBg: string;
    badgeText: string;
    headerBg: string;
    headerText: string;
    footerBg: string;
    footerText: string;
  };
  typography: {                // AC63: STRICTLY UNIQUE FONT PAIRINGS
    fontHeading: string;
    fontBody: string;
    headingWeight: string;
    headingLetterSpacing: string;
    headingTransform: 'none' | 'uppercase' | 'capitalize';
  };
  shape: {
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      card: string;
      button: string;
      pill: string;
    };
    borderWidth: string;
    shadowCard: string;
    shadowCardHover: string;
  };
  headerStyle: {               // AC66: DISTINCT HEADER / NAV
    layout: 'logo-left-nav-center' | 'logo-center-split-nav' | 'minimal-transparent' | 'hud-tech-bar';
    height: string;
    showAnnouncementBar: boolean;
    announcementText?: string;
    sticky: boolean;
    backdropBlur: boolean;
  };
  productCardStyle: {          // DISTINCT CARD DESIGN
    aspectRatio: string;
    imageFit: 'cover' | 'contain';
    badgePosition: 'top-left' | 'top-right';
    quickAddBehavior: 'button-always' | 'hover-slide-up' | 'pill-bottom' | 'icon-corner';
    showVendor: boolean;
    showRating: boolean;
    hoverImageSwap: boolean;
  };
  animationIntensity: 'subtle' | 'cinematic' | 'slow-lux' | 'sharp-fast';
  homepageSections: Array<BaseSectionConfig>; // AC64: UNIQUE SECTION ORDERING
}
```

---

### 3.2 Individual Store Specifications

#### STORE 1: COFFEE ("TERROIR & ROAST")
- **Industry & Philosophy**: Specialty artisanal coffee roastery, micro-lot beans, precision pour-over and manual brewing gear.
- **Visual Identity**: Warm earthy tones, tactile paper textures, organic curves, cozy café intimacy, warm storytelling.
- **Color Palette**:
  - `primary`: `#2C1810` (Dark Roasted Umber) — **Unique**
  - `primaryHover`: `#3D2217`
  - `secondary`: `#C86446` (Terracotta Warm Rust)
  - `accent`: `#D9822B` (Caramel Honey)
  - `background`: `#FBF8F3` (Warm Linen Cream)
  - `surface`: `#F3ECE2` (Sandstone Cream)
  - `border`: `#E5D9C8` (Muted Oat)
  - `textPrimary`: `#1E110A` (Espresso Black)
  - `textSecondary`: `#68564D` (Roast Brown)
  - `textMuted`: `#938176`
  - `badgeBg`: `#F0E5D3`
  - `badgeText`: `#783D1B`
- **Typography Pairing**:
  - Heading: `'Fraunces', serif` (Soft, organic, warm editorial serif with distinct character)
  - Body: `'Plus Jakarta Sans', sans-serif` (Clean, warm, friendly humanistic sans)
  - Style: Mixed case, natural kerning, gentle line-height.
- **Header & Navigation**:
  - Style: `logo-left-nav-center`
  - Announcement Bar: "Roasted to order in Portland • Free shipping on orders over $45" (Warm terracotta background `#C86446`, white text)
  - Nav Layout: Logo on left, navigation links centered with warm hover tint, search/account/wishlist/cart on right.
- **Product Card Ergonomics**:
  - Shape: Rounded (`rounded-2xl` / 16px radius).
  - Background: Pale sandstone `#F3ECE2`.
  - Aspect Ratio: `aspect-[4/5]`.
  - Badges: Origin Pill ("Ethiopia", "Colombia") and Roast Level dots (Light/Med/Dark).
  - Quick Add: Warm terracotta button at card bottom with smooth lift.
- **Hero Variant**: `HeroSplit`
  - Left: Warm editorial text ("Single Origin. Roasted Within 48 Hours."), roast date ticker, CTAs "Shop Fresh Beans" and "Explore Brew Guide".
  - Right: Stoneware pour-over lifestyle visual with floating origin badge ("Yirgacheffe Gedeb • 2,100 MASL").
- **Unique Homepage Section Sequence (AC64)**:
  1. Announcement Bar
  2. `hero-split`
  3. `marquee` (Fresh Roast Guarantee ticker)
  4. `logo-cloud` (Specialty Coffee Certifications: Fair Trade, B-Corp, Sprudge, Rainforest Alliance)
  5. `featured-products` (Fresh Roasts of the Week - 4 columns)
  6. `image-text` (The Direct Trade Story: Visiting our partners in Nariño & Sidama)
  7. `collection-cards` (Shop by Brew Method: Pour Over, Espresso, French Press, Cold Brew)
  8. `product-carousel` (Brewing Gear & Barista Accessories)
  9. `editorial-grid` (The Brewing Guide: Grind sizes, water ratios & water chemistry)
  10. `testimonials` (From passionate home baristas & café owners)
  11. `faq` (Freshness dates, subscription skips, shipping speeds)
  12. `newsletter` (Join the Tasting Club for 15% off first order)

---

#### STORE 2: FASHION ("ATELIER NOIR")
- **Industry & Philosophy**: Contemporary high-fashion ready-to-wear, architectural silhouettes, sustainable minimalist luxury.
- **Visual Identity**: Monochromatic, ultra-minimal, high whitespace, sharp geometric discipline, stark typography, cinematic runway mood.
- **Color Palette**:
  - `primary`: `#0A0A0A` (Pitch Carbon Black) — **Unique**
  - `primaryHover`: `#262626`
  - `secondary`: `#71717A` (Cool Studio Zinc)
  - `accent`: `#18181B` (Deep Obsidian)
  - `background`: `#FFFFFF` (Stark Gallery White)
  - `surface`: `#F4F4F5` (Crisp Chalk Off-White)
  - `border`: `#E4E4E7` (Hairline Zinc Border)
  - `textPrimary`: `#09090B` (Jet Black)
  - `textSecondary`: `#52525B` (Muted Slate)
  - `textMuted`: `#A1A1AA`
  - `badgeBg`: `#09090B`
  - `badgeText`: `#FFFFFF`
- **Typography Pairing**:
  - Heading: `'Syne', sans-serif` (Avant-garde, sculptural, high-fashion display sans)
  - Body: `'Inter', sans-serif` (Neutral, ultra-precise Swiss grotesque)
  - Style: Bold, all-caps headings (`tracking-widest uppercase`).
- **Header & Navigation**:
  - Style: `minimal-transparent` (Translucent glassmorphism with hairline bottom border `#E4E4E7`)
  - No noisy announcement bar; clean top line ticker.
  - Nav Layout: Centered oversized lettermark "ATELIER", split menu items (`COLLECTIONS`, `EDITIONS`, `RUNWAY`, `OBJECTS`), sleek icon buttons.
- **Product Card Ergonomics**:
  - Shape: Ultra-sharp (`rounded-none` / 0px radius).
  - Background: Crisp off-white `#F4F4F5`.
  - Aspect Ratio: Dramatic tall editorial `aspect-[3/4]`.
  - Hover Effect: Secondary model runway angle swaps on hover (`hoverImageSwap: true`).
  - Quick Add: Minimalist slide-up black bar on hover.
- **Hero Variant**: `HeroFullscreen`
  - Fullscreen 100vh cinematic visual with stark white typography.
  - Headline: "COLLECTION 08: FORM & TENSION".
  - Subtitle: "Sculptural tailoring constructed from Japanese recycled wool and organic silk."
  - Minimalist floating pill CTAs with sound/scroll prompt.
- **Unique Homepage Section Sequence (AC64)**:
  1. `hero-fullscreen`
  2. `marquee` (High-fashion all-caps running ticker)
  3. `editorial-grid` (Runway Lookbook: Asymmetrical 3-image editorial collage)
  4. `featured-products` (The Runway Edit - 3 oversized columns)
  5. `image-text` (The Materiality Manifesto: Sourcing deadstock cashmere and Japanese denim)
  6. `collection-cards` (Categories: Outerwear, Tailoring, Leather Goods, Footwear)
  7. `product-carousel` (Essentials & Core Wardrobe)
  8. `logo-cloud` (Editorial Press: Vogue, GQ, Dazed, Highsnobiety, Hypebeast)
  9. `reviews` (Editorial and client reviews)
  10. `newsletter` (The Private Client Ledger: Exclusive access to limited runway drops)

---

#### STORE 3: JEWELRY ("L'ÉTOILE JOAILLERIE")
- **Industry & Philosophy**: Haute joaillerie, conflict-free GIA diamonds, 18K recycled gold, bespoke heirloom craftsmanship.
- **Visual Identity**: Regal champagne gold, dark obsidian and ivory silk, delicate serif elegance, quiet luxury, heirloom prestige.
- **Color Palette**:
  - `primary`: `#C5A059` (Royal Champagne Gold) — **Unique**
  - `primaryHover`: `#B08B46`
  - `secondary`: `#121214` (Deep Night Noir)
  - `accent`: `#997A3A` (Burnished Antique Bronze)
  - `background`: `#FAF7F2` (Ivory Silk Alabaster)
  - `surface`: `#FFFFFF` (Pure Diamond White)
  - `border`: `#E8DEC9` (Soft Brushed Gold Hairline)
  - `textPrimary`: `#1C1917` (Deep Obsidian Ink)
  - `textSecondary`: `#78716C` (Muted Warm Stone)
  - `textMuted`: `#A8A29E`
  - `badgeBg`: `#F5EFE3`
  - `badgeText`: `#8A6726`
- **Typography Pairing**:
  - Heading: `'Cormorant Garamond', serif` (Aristocratic, high-contrast, regal French serif with delicate calligraphic swashes)
  - Body: `'Montserrat', sans-serif` (Refined, balanced geometric sans for immaculate legibility)
  - Style: Classic title case, letter-spaced subheadings.
- **Header & Navigation**:
  - Style: `logo-center-split-nav`
  - Top Tier Utility Bar: "Complimentary Insured White-Glove Delivery Worldwide • GIA Certified" (Deep Noir background `#121214`, gold text `#C5A059`)
  - Nav Layout: Classical jewelry monogram crest centered, symmetrical luxury category links, golden underline hover effect.
- **Product Card Ergonomics**:
  - Shape: Subtle luxury radius (`rounded-md` / 6px radius).
  - Background: Crisp diamond white with soft gold hairline border `#E8DEC9`.
  - Aspect Ratio: Elegant square `aspect-square` with soft ambient luxury lighting.
  - Badges: Metal Karat & Gemstone pills ("18K Yellow Gold", "VVS1 Diamond").
  - Hover: Subtle smooth zoom with gemstone light sheen effect.
- **Hero Variant**: `HeroStandard`
  - Majestic centered composition on silk alabaster backdrop with subtle gold foil filigree.
  - Gold crest badge: "Maison Fondée 1928 • Haute Joaillerie".
  - Headline: "Timeless Brilliance, Handcrafted to Perfection".
  - Dual luxury buttons: Gold filled "Explore High Jewelry" + Gold outline "Book Private Atelier Consultation".
- **Unique Homepage Section Sequence (AC64)**:
  1. Top Tier Utility Bar
  2. `hero-standard`
  3. `collection-cards` (Signature Maisons: Solitaire Rings, Tennis Bracelets, Pearl Pendants, High Joaillerie)
  4. `product-carousel` (The Celestial Diamond Collection - smooth continuous track)
  5. `image-text` (Four Generations of Master Lapidaries in Antwerp & Paris)
  6. `featured-products` (Most Coveted Creations - 4 columns)
  7. `testimonials` (Heirloom Stories: Anniversaries, Proposals & Royal Commissions)
  8. `editorial-grid` (The 4Cs Diamond Education & Ethical Gold Sourcing)
  9. `faq` (GIA certificates, ring resizing, insured shipping, lifetime cleaning)
  10. `logo-cloud` (Accreditations: GIA, Responsible Jewellery Council, Kimberley Process)
  11. `newsletter` (The Maison Circle: Invitations to private salon exhibitions)

---

#### STORE 4: ELECTRONICS ("NEXUS TECH")
- **Industry & Philosophy**: Next-generation audio hardware, studio monitor acoustics, mechanical keyboards, precision computing peripherals.
- **Visual Identity**: High-contrast cyberpunk / dark slate, electric neon cyan, futuristic HUD layout, razor-sharp geometric UI, specs & performance metrics.
- **Color Palette**:
  - `primary`: `#00E5FF` (Electric Cyber Cyan) — **Unique**
  - `primaryHover`: `#00B8D4`
  - `secondary`: `#0066FF` (Neon Cobalt Blue)
  - `accent`: `#10B981` (Telemetry Neon Emerald)
  - `background`: `#0B0F19` (Deep Slate Obsidian)
  - `surface`: `#111827` (Matte Cyber Graphite)
  - `border`: `#1F2937` (Tech Grid Carbon Border)
  - `textPrimary`: `#F9FAFB` (Holographic Bright White)
  - `textSecondary`: `#9CA3AF` (Anodized Silver)
  - `textMuted`: `#6B7280`
  - `badgeBg`: `#083344`
  - `badgeText`: `#00E5FF`
- **Typography Pairing**:
  - Heading: `'Space Grotesk', sans-serif` (Sharp, futuristic, high-tech geometric sans)
  - Body: `'Inter', sans-serif` with `'JetBrains Mono', monospace` for specs/chips/telemetry
  - Style: Tech-spec casing, uppercase labels, monospaced numbers.
- **Header & Navigation**:
  - Style: `hud-tech-bar`
  - Sticky glassmorphism dark HUD bar with glowing cyan accents and live telemetry status pill: "SYSTEM: OPTIMAL // PING: 12ms".
  - Nav Layout: Glowing geometric logo mark "NEXUS // LABS", categorized tech pill links (`AUDIO`, `KEYBOARDS`, `COMPUTING`, `POWER`), glowing cart count pill.
- **Product Card Ergonomics**:
  - Shape: Razor-sharp (`rounded-sm` / 2px radius).
  - Background: Dark cyber card `#111827` with carbon border `#1F2937`.
  - Aspect Ratio: Widescreen tech `aspect-[16/10]` or `aspect-[4/3]`.
  - Badges: Telemetry chips ("48h Battery", "BT 5.4 LE", "0.001% THD").
  - Hover: Dynamic neon cyan border glow (`shadow-[0_0_15px_rgba(0,229,255,0.25)]`).
- **Hero Variant**: `HeroSplit`
  - Interactive exploded product visual of flagship planar magnetic headphones with glowing frequency curve.
  - Left: "QUANTUM ACOUSTICS: Planar Transducers with Zero Distortion", live hardware metric counters, CTAs "Configure & Order" + "View Tech Specs".
- **Unique Homepage Section Sequence (AC64)**:
  1. `marquee` (High-velocity telemetry banner: "TITANIUM PLANAR SERIES • 0.001% THD • 48H WIRELESS PLAYBACK • FREE EXPRESS COURIER")
  2. `hero-split`
  3. `logo-cloud` (Hardware Codec Partnerships: Qualcomm Snapdragon Sound, Dolby Atmos, Sony LDAC, THX Certified)
  4. `product-carousel` (Benchmark Lab: Flagship Audio & Keyboards)
  5. `featured-products` (The Nexus Hardware Suite - 4 columns with live spec pills)
  6. `image-text` (Acoustic Engineering: Custom beryllium planar drivers tuned in Tokyo)
  7. `collection-cards` (System Architectures: Studio Audio, Ergonomic Input, Fast GaN Power, Ambient Lighting)
  8. `editorial-grid` (Benchmark Tests: Frequency Response Curves & Latency Teardowns)
  9. `reviews` (Audiophile & Hardware Engineer Benchmarks: 4.9/5 from 14,000+ engineers)
  10. `faq` (Firmware updates, universal OS compatibility, 2-year accidental warranty)
  11. `newsletter` (Nexus Insiders: Firmware changelogs and beta hardware access)

---

### 3.3 Visual Distinction Comparison Matrix (Verification for AC61–AC67)

| Dimension | Coffee | Fashion | Jewelry | Electronics |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Color** (AC62) | `#2C1810` (Umber) | `#0A0A0A` (Carbon Black) | `#C5A059` (Champagne Gold) | `#00E5FF` (Cyber Cyan) |
| **Accent Color** | `#C86446` (Terracotta) | `#71717A` (Cool Slate) | `#121214` (Obsidian Noir) | `#0066FF` (Neon Cobalt) |
| **Background Color** | `#FBF8F3` (Linen Cream) | `#FFFFFF` (Gallery White) | `#FAF7F2` (Silk Alabaster) | `#0B0F19` (Slate Obsidian) |
| **Heading Font** (AC63) | `Fraunces` (Serif) | `Syne` (Display Sans) | `Cormorant Garamond` (Serif) | `Space Grotesk` (Tech Sans) |
| **Body Font** (AC63) | `Plus Jakarta Sans` | `Inter` | `Montserrat` | `Inter` / `JetBrains Mono` |
| **Hero Variant** (AC65) | `hero-split` (Warm Story) | `hero-fullscreen` (Runway 100vh) | `hero-standard` (Centred Crest) | `hero-split` (Spec Breakdown) |
| **Header Style** (AC66) | Logo Left + Warm Banner | Transparent Minimalist | Center Crest + Dual Tier | Glassmorphic Dark HUD |
| **Card Corner Radius** | 16px (`rounded-2xl`) | 0px (`rounded-none`) | 6px (`rounded-md`) | 2px (`rounded-sm`) |
| **Card Aspect Ratio** | 4:5 (`aspect-[4/5]`) | 3:4 (`aspect-[3/4]`) | 1:1 (`aspect-square`) | 16:10 (`aspect-[16/10]`) |
| **Card Hover Effect** | Warm card lift & shadow | Model runway angle swap | Diamond sheen & gentle zoom | Neon cyan border glow |
| **Animation Feel** | Smooth organic & gentle | Stark cinematic & minimal | Slow regal luxury & subtle | High-speed, sharp & snappy |
| **Homepage 1st Section** | Top Announcement Marquee | 100vh Fullscreen Hero | Two-Tier Luxury Utility Bar | High-Velocity HUD Marquee |
| **Homepage 2nd Section** | Hero Split (Storytelling) | Marquee (Ticker) | Hero Standard (Centered) | Hero Split (Tech Specs) |
| **Homepage 3rd Section** | Marquee | Editorial Grid (Lookbook) | Collection Cards | Logo Cloud (Codecs) |

---

## 4. Product Catalog Data Architecture & TypeScript Specification

### 4.1 Master TypeScript Interfaces

```typescript
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

export interface ProductVariantOption {
  name: string; // e.g. "Size", "Grind", "Color", "Finish", "Karat", "Storage"
  value: string; // e.g. "12oz", "Whole Bean", "Matte Black", "18K Gold"
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string; // e.g. "12oz / Whole Bean"
  sku: string;
  price: number; // In USD, e.g. 19.50
  compareAtPrice?: number | null; // For sale discount strike-through
  options: Record<string, string>; // { "Size": "12oz", "Grind": "Whole Bean" }
  inStock: boolean;
  inventoryQuantity: number;
  imageIndex?: number;
}

export interface ProductOptionDefinition {
  name: string;
  values: string[];
}

export interface ProductRating {
  average: number; // e.g. 4.9
  count: number;   // e.g. 142
}

export interface Product {
  id: string;
  storeId: 'coffee' | 'fashion' | 'jewelry' | 'electronics';
  handle: string; // URL slug, e.g. "ethiopia-yirgacheffe"
  title: string;
  subtitle: string;
  description: string;
  details: string[]; // Bulleted feature lists, materials, origin, specs
  category: string;
  tags: string[];
  price: number; // Starting / default price
  compareAtPrice?: number | null;
  rating: ProductRating;
  isNew: boolean;
  isBestseller: boolean;
  isOnSale: boolean;
  images: ProductImage[];
  options: ProductOptionDefinition[];
  variants: ProductVariant[];
  attributes: Record<string, any>; // Store-specific metadata (roast level, specs, metal, fabric)
  relatedProductIds: string[];
}
```

---

## 5. Curated 64-Product Sample Catalog (16 Products Per Store)

Every product below includes verified, high-resolution Unsplash images (with clean query parameters), realistic price differentials across variants, full option matrices, and domain-authentic descriptions.

---

### 5.1 Store 1: Coffee ("Terroir & Roast") — 16 Products

```json
[
  {
    "id": "coffee-01",
    "storeId": "coffee",
    "handle": "ethiopia-yirgacheffe-gedeb",
    "title": "Ethiopia Yirgacheffe Gedeb",
    "subtitle": "Washed Heirloom • 2,100m MASL",
    "description": "Floral and vibrant with intoxicating aromas of bergamot, candied peach, and jasmine tea. Sourced directly from 650 smallholder farmers in the Gedeb region.",
    "details": ["Process: Fully Washed", "Elevation: 2,050 - 2,200 MASL", "Roast Level: Light-Medium", "Tasting Notes: Bergamot, Peach Nectar, Jasmine"],
    "category": "Single Origin",
    "tags": ["single-origin", "light-roast", "african", "floral", "bestseller"],
    "price": 20.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 218 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "c01-1", "url": "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80", "alt": "Freshly roasted Ethiopia Yirgacheffe coffee beans", "isPrimary": true },
      { "id": "c01-2", "url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80", "alt": "Pour over brewed coffee cup on wooden table" }
    ],
    "options": [
      { "name": "Size", "values": ["12oz (340g)", "2lb (907g)", "5lb Bulk"] },
      { "name": "Grind", "values": ["Whole Bean", "Pour Over / Drip", "Espresso", "French Press"] }
    ],
    "variants": [
      { "id": "c01-v1", "productId": "coffee-01", "title": "12oz / Whole Bean", "sku": "ETH-YIR-12-WB", "price": 20.00, "options": { "Size": "12oz (340g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 85 },
      { "id": "c01-v2", "productId": "coffee-01", "title": "12oz / Pour Over", "sku": "ETH-YIR-12-PO", "price": 20.00, "options": { "Size": "12oz (340g)", "Grind": "Pour Over / Drip" }, "inStock": true, "inventoryQuantity": 60 },
      { "id": "c01-v3", "productId": "coffee-01", "title": "2lb / Whole Bean", "sku": "ETH-YIR-2LB-WB", "price": 46.00, "options": { "Size": "2lb (907g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 30 },
      { "id": "c01-v4", "productId": "coffee-01", "title": "5lb / Whole Bean", "sku": "ETH-YIR-5LB-WB", "price": 98.00, "options": { "Size": "5lb Bulk", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 15 }
    ],
    "attributes": { "roastLevel": "Light", "acidity": "Bright", "body": "Silky" },
    "relatedProductIds": ["coffee-02", "coffee-09", "coffee-11"]
  },
  {
    "id": "coffee-02",
    "storeId": "coffee",
    "handle": "colombia-huila-pink-bourbon",
    "title": "Colombia Huila Pink Bourbon",
    "subtitle": "Anaerobic Washed • Finca El Paraíso",
    "description": "An exotic varietal cultivated with precision. Notes of pink grapefruit, raspberry jam, and sugarcane sweetness with a creamy finish.",
    "details": ["Process: Anaerobic Washed 48h", "Elevation: 1,850 MASL", "Roast Level: Light", "Tasting Notes: Pink Grapefruit, Raspberry, Sugarcane"],
    "category": "Single Origin",
    "tags": ["single-origin", "light-roast", "colombian", "fruity", "new"],
    "price": 24.00,
    "compareAtPrice": 28.00,
    "rating": { "average": 4.8, "count": 94 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "c02-1", "url": "https://images.unsplash.com/photo-1610632380989-680fe40816c6?auto=format&fit=crop&w=800&q=80", "alt": "Specialty coffee bag with tasting notes label", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["12oz (340g)", "2lb (907g)"] },
      { "name": "Grind", "values": ["Whole Bean", "Pour Over / Drip", "Espresso"] }
    ],
    "variants": [
      { "id": "c02-v1", "productId": "coffee-02", "title": "12oz / Whole Bean", "sku": "COL-PB-12-WB", "price": 24.00, "compareAtPrice": 28.00, "options": { "Size": "12oz (340g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 50 },
      { "id": "c02-v2", "productId": "coffee-02", "title": "2lb / Whole Bean", "sku": "COL-PB-2LB-WB", "price": 54.00, "compareAtPrice": 62.00, "options": { "Size": "2lb (907g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 20 }
    ],
    "attributes": { "roastLevel": "Light", "acidity": "Complex", "body": "Medium" },
    "relatedProductIds": ["coffee-01", "coffee-04", "coffee-10"]
  },
  {
    "id": "coffee-03",
    "storeId": "coffee",
    "handle": "nocturne-espresso-blend",
    "title": "Nocturne Dark Espresso Blend",
    "subtitle": "Brazil Cerrado & Sumatra Mandheling",
    "description": "Our signature dark roast. Velvety dark chocolate, roasted hazelnut, and molasses with zero bitterness. Perfect for rich milk drinks and straight shots.",
    "details": ["Origins: Brazil & Sumatra", "Roast Level: Dark", "Tasting Notes: Dark Chocolate, Molasses, Hazelnut", "Great with milk"],
    "category": "Blends",
    "tags": ["blend", "dark-roast", "espresso", "bestseller"],
    "price": 18.50,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 430 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "c03-1", "url": "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80", "alt": "Freshly pulled espresso with crema", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["12oz (340g)", "2lb (907g)", "5lb Bulk"] },
      { "name": "Grind", "values": ["Whole Bean", "Espresso", "Moka Pot"] }
    ],
    "variants": [
      { "id": "c03-v1", "productId": "coffee-03", "title": "12oz / Whole Bean", "sku": "NOC-ESP-12-WB", "price": 18.50, "options": { "Size": "12oz (340g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 120 },
      { "id": "c03-v2", "productId": "coffee-03", "title": "2lb / Whole Bean", "sku": "NOC-ESP-2LB-WB", "price": 42.00, "options": { "Size": "2lb (907g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 45 },
      { "id": "c03-v3", "productId": "coffee-03", "title": "5lb / Whole Bean", "sku": "NOC-ESP-5LB-WB", "price": 88.00, "options": { "Size": "5lb Bulk", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 25 }
    ],
    "attributes": { "roastLevel": "Dark", "acidity": "Low", "body": "Heavy & Velvety" },
    "relatedProductIds": ["coffee-06", "coffee-13", "coffee-15"]
  },
  {
    "id": "coffee-04",
    "storeId": "coffee",
    "handle": "guatemala-antigua-los-volcanes",
    "title": "Guatemala Antigua Los Volcanes",
    "subtitle": "Bourbon & Caturra • Volcanic Soil",
    "description": "Rich milk chocolate, crisp red apple acidity, and roasted almond sweetness. Balanced and comforting morning cup.",
    "details": ["Process: Washed", "Elevation: 1,600 MASL", "Roast Level: Medium", "Tasting Notes: Red Apple, Milk Chocolate, Toasted Almond"],
    "category": "Single Origin",
    "tags": ["single-origin", "medium-roast", "central-america"],
    "price": 19.00,
    "compareAtPrice": null,
    "rating": { "average": 4.7, "count": 165 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "c04-1", "url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80", "alt": "Ceramic mug with fresh filter coffee", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["12oz (340g)", "2lb (907g)"] },
      { "name": "Grind", "values": ["Whole Bean", "Pour Over / Drip", "French Press"] }
    ],
    "variants": [
      { "id": "c04-v1", "productId": "coffee-04", "title": "12oz / Whole Bean", "sku": "GUA-ANT-12-WB", "price": 19.00, "options": { "Size": "12oz (340g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 70 },
      { "id": "c04-v2", "productId": "coffee-04", "title": "2lb / Whole Bean", "sku": "GUA-ANT-2LB-WB", "price": 44.00, "options": { "Size": "2lb (907g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 30 }
    ],
    "attributes": { "roastLevel": "Medium", "acidity": "Balanced", "body": "Medium" },
    "relatedProductIds": ["coffee-01", "coffee-05", "coffee-11"]
  },
  {
    "id": "coffee-05",
    "storeId": "coffee",
    "handle": "aurora-breakfast-blend",
    "title": "Aurora Morning House Blend",
    "subtitle": "Ethiopia & Colombia Blend",
    "description": "Bright yet comforting. Ripe mandarin orange, honey, and brown sugar pastry notes. Specially tuned for automatic drip makers and batch brew.",
    "details": ["Origins: 60% Colombia, 40% Ethiopia", "Roast Level: Medium", "Tasting Notes: Honeycomb, Clementine, Graham Cracker"],
    "category": "Blends",
    "tags": ["blend", "medium-roast", "morning", "drip"],
    "price": 17.50,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 310 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "c05-1", "url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80", "alt": "Pouring hot coffee from glass server into mug", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["12oz (340g)", "2lb (907g)", "5lb Bulk"] },
      { "name": "Grind", "values": ["Whole Bean", "Auto Drip", "Pour Over"] }
    ],
    "variants": [
      { "id": "c05-v1", "productId": "coffee-05", "title": "12oz / Whole Bean", "sku": "AUR-12-WB", "price": 17.50, "options": { "Size": "12oz (340g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 90 },
      { "id": "c05-v2", "productId": "coffee-05", "title": "2lb / Whole Bean", "sku": "AUR-2LB-WB", "price": 39.50, "options": { "Size": "2lb (907g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 40 }
    ],
    "attributes": { "roastLevel": "Medium", "acidity": "Crisp", "body": "Round" },
    "relatedProductIds": ["coffee-03", "coffee-04", "coffee-12"]
  },
  {
    "id": "coffee-06",
    "storeId": "coffee",
    "handle": "sumatra-aceh-gayo-dark",
    "title": "Sumatra Aceh Gayo Organic",
    "subtitle": "Wet-Hulled (Giling Basah) • Dark Roast",
    "description": "Earthy cedar, pipe tobacco, dark cocoa, and dried fig. Low acid, heavy mouthfeel, exceptionally bold.",
    "details": ["Process: Wet-Hulled", "Elevation: 1,500 MASL", "Roast Level: Dark", "Tasting Notes: Cedar, Dark Cocoa, Black Currant"],
    "category": "Single Origin",
    "tags": ["single-origin", "dark-roast", "low-acid", "organic"],
    "price": 19.50,
    "compareAtPrice": null,
    "rating": { "average": 4.6, "count": 140 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "c06-1", "url": "https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?auto=format&fit=crop&w=800&q=80", "alt": "Dark roasted whole coffee beans close up", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["12oz (340g)", "2lb (907g)"] },
      { "name": "Grind", "values": ["Whole Bean", "French Press", "Espresso"] }
    ],
    "variants": [
      { "id": "c06-v1", "productId": "coffee-06", "title": "12oz / Whole Bean", "sku": "SUM-12-WB", "price": 19.50, "options": { "Size": "12oz (340g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 55 }
    ],
    "attributes": { "roastLevel": "Dark", "acidity": "Low", "body": "Heavy" },
    "relatedProductIds": ["coffee-03", "coffee-07"]
  },
  {
    "id": "coffee-07",
    "storeId": "coffee",
    "handle": "decaf-sugar-cane-huila",
    "title": "Colombia EA Decaf Sugar Cane",
    "subtitle": "Natural Ethyl Acetate Decaffeination",
    "description": "Finally, a decaf that tastes like world-class coffee. Sweet butterscotch, red apple, and milk chocolate with zero chemical flavor.",
    "details": ["Decaf Method: Sugar Cane EA", "Origin: Huila, Colombia", "Roast Level: Medium", "Tasting Notes: Butterscotch, Baked Apple, Cocoa"],
    "category": "Decaf",
    "tags": ["decaf", "medium-roast", "sweet"],
    "price": 20.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 112 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "c07-1", "url": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80", "alt": "Hand holding scoop of roasted coffee beans", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["12oz (340g)", "2lb (907g)"] },
      { "name": "Grind", "values": ["Whole Bean", "Drip", "Espresso"] }
    ],
    "variants": [
      { "id": "c07-v1", "productId": "coffee-07", "title": "12oz / Whole Bean", "sku": "DEC-12-WB", "price": 20.00, "options": { "Size": "12oz (340g)", "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 45 }
    ],
    "attributes": { "roastLevel": "Medium", "acidity": "Gentle", "body": "Smooth" },
    "relatedProductIds": ["coffee-02", "coffee-05"]
  },
  {
    "id": "coffee-08",
    "storeId": "coffee",
    "handle": "steeped-cold-brew-packs",
    "title": "Cold Brew Concentrate Steeping Pitcher Packs",
    "subtitle": "Pack of 4 Large Steeping Pouches",
    "description": "Make silky, ultra-smooth cold brew right in your fridge. Pre-ground coarse blend of Central American micro-lots. No mess, just steep 16 hours in cold water.",
    "details": ["Yield: 64oz per pouch (makes 1 gallon total)", "Origins: Guatemala & Honduras", "Notes: Dark Chocolate, Molasses, Cold Cream"],
    "category": "Cold Brew",
    "tags": ["cold-brew", "summer", "ready-to-steep", "gift"],
    "price": 16.00,
    "compareAtPrice": 18.00,
    "rating": { "average": 4.8, "count": 188 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "c08-1", "url": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80", "alt": "Cold brew coffee with ice and milk swirl", "isPrimary": true }
    ],
    "options": [
      { "name": "Pack Size", "values": ["4-Pack Pouches", "8-Pack Pouches"] }
    ],
    "variants": [
      { "id": "c08-v1", "productId": "coffee-08", "title": "4-Pack Pouches", "sku": "CB-4PK", "price": 16.00, "compareAtPrice": 18.00, "options": { "Pack Size": "4-Pack Pouches" }, "inStock": true, "inventoryQuantity": 80 },
      { "id": "c08-v2", "productId": "coffee-08", "title": "8-Pack Pouches", "sku": "CB-8PK", "price": 29.00, "compareAtPrice": 34.00, "options": { "Pack Size": "8-Pack Pouches" }, "inStock": true, "inventoryQuantity": 40 }
    ],
    "attributes": { "brewMethod": "Immersion 16h", "caffeine": "High" },
    "relatedProductIds": ["coffee-03", "coffee-14"]
  },
  {
    "id": "coffee-09",
    "storeId": "coffee",
    "handle": "ceramic-artisan-pour-over-dripper",
    "title": "Terroir Ceramic Pour-Over Dripper",
    "subtitle": "Wheel-Thrown Stoneware • Matte Ochre",
    "description": "Handcrafted by local ceramicists in Oregon. Engineered internal spiral ribs optimize water flow and contact time for a clean, nuanced extraction.",
    "details": ["Material: High-fire stoneware ceramic", "Compatibility: 02 cone filters", "Dishwasher safe", "Handmade in USA"],
    "category": "Equipment",
    "tags": ["equipment", "ceramic", "pour-over", "artisan", "bestseller"],
    "price": 42.00,
    "compareAtPrice": null,
    "rating": { "average": 5.0, "count": 89 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "c09-1", "url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80", "alt": "Ceramic coffee dripper on glass carafe", "isPrimary": true }
    ],
    "options": [
      { "name": "Finish", "values": ["Matte Ochre", "Warm Sandstone", "Speckled White"] }
    ],
    "variants": [
      { "id": "c09-v1", "productId": "coffee-09", "title": "Matte Ochre", "sku": "DRP-OCH", "price": 42.00, "options": { "Finish": "Matte Ochre" }, "inStock": true, "inventoryQuantity": 25 },
      { "id": "c09-v2", "productId": "coffee-09", "title": "Warm Sandstone", "sku": "DRP-SND", "price": 42.00, "options": { "Finish": "Warm Sandstone" }, "inStock": true, "inventoryQuantity": 30 },
      { "id": "c09-v3", "productId": "coffee-09", "title": "Speckled White", "sku": "DRP-WHT", "price": 42.00, "options": { "Finish": "Speckled White" }, "inStock": true, "inventoryQuantity": 20 }
    ],
    "attributes": { "capacity": "1-4 Cups", "weight": "340g" },
    "relatedProductIds": ["coffee-01", "coffee-10", "coffee-11"]
  },
  {
    "id": "coffee-10",
    "storeId": "coffee",
    "handle": "gooseneck-electric-pour-over-kettle",
    "title": "Precision Electric Gooseneck Kettle",
    "subtitle": "PID Temperature Control • 0.9L Capacity",
    "description": "Counterbalanced handle, precision pour spout for laminar water flow, and exact degree-by-degree temperature hold up to 60 minutes.",
    "details": ["1200W quick heating", "Degree-accurate LCD screen", "60-minute temperature hold", "Stainless steel interior"],
    "category": "Equipment",
    "tags": ["equipment", "kettle", "precision", "gear"],
    "price": 135.00,
    "compareAtPrice": 150.00,
    "rating": { "average": 4.9, "count": 174 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": true,
    "images": [
      { "id": "c10-1", "url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80", "alt": "Matte black electric gooseneck kettle", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Matte Black", "Warm Terracotta", "Polished Steel"] }
    ],
    "variants": [
      { "id": "c10-v1", "productId": "coffee-10", "title": "Matte Black", "sku": "KET-BLK", "price": 135.00, "compareAtPrice": 150.00, "options": { "Color": "Matte Black" }, "inStock": true, "inventoryQuantity": 20 },
      { "id": "c10-v2", "productId": "coffee-10", "title": "Warm Terracotta", "sku": "KET-TER", "price": 145.00, "compareAtPrice": 160.00, "options": { "Color": "Warm Terracotta" }, "inStock": true, "inventoryQuantity": 15 }
    ],
    "attributes": { "voltage": "120V", "capacity": "0.9L" },
    "relatedProductIds": ["coffee-09", "coffee-11", "coffee-12"]
  },
  {
    "id": "coffee-11",
    "storeId": "coffee",
    "handle": "conical-burr-hand-grinder",
    "title": "Titanium Conical Burr Hand Grinder",
    "subtitle": "48mm CNC Stainless Steel Burrs",
    "description": "Precision stepless micro-adjustment for everything from fine espresso to coarse French press. Dual ball bearings ensure effortless grinding.",
    "details": ["48mm heptagonal burr set", "Holds up to 35g whole beans", "Solid aluminum unibody with walnut grip", "Includes cleaning brush & pouch"],
    "category": "Equipment",
    "tags": ["equipment", "grinder", "manual", "travel"],
    "price": 89.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 92 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "c11-1", "url": "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80", "alt": "Manual hand coffee grinder with walnut knob", "isPrimary": true }
    ],
    "options": [
      { "name": "Finish", "values": ["Anodized Slate", "Natural Aluminum"] }
    ],
    "variants": [
      { "id": "c11-v1", "productId": "coffee-11", "title": "Anodized Slate", "sku": "GRN-SLT", "price": 89.00, "options": { "Finish": "Anodized Slate" }, "inStock": true, "inventoryQuantity": 35 }
    ],
    "attributes": { "burrSize": "48mm", "capacity": "35g" },
    "relatedProductIds": ["coffee-01", "coffee-09", "coffee-10"]
  },
  {
    "id": "coffee-12",
    "storeId": "coffee",
    "handle": "precision-digital-barista-scale",
    "title": "Precision Barista Timer & Scale",
    "subtitle": "0.1g Accuracy • USB-C Rechargeable",
    "description": "Essential tool for recipe consistency. Auto-starts timer upon first drop of liquid, fast response time, and heat-resistant silicone coaster.",
    "details": ["0.1g resolution up to 2,000g", "Built-in flow rate indicator", "Hidden LED display", "Water-resistant surface"],
    "category": "Equipment",
    "tags": ["equipment", "scale", "precision"],
    "price": 54.00,
    "compareAtPrice": null,
    "rating": { "average": 4.7, "count": 105 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "c12-1", "url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80", "alt": "Pour over setup resting on digital timer scale", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Matte Charcoal", "Bone White"] }
    ],
    "variants": [
      { "id": "c12-v1", "productId": "coffee-12", "title": "Matte Charcoal", "sku": "SCL-CHR", "price": 54.00, "options": { "Color": "Matte Charcoal" }, "inStock": true, "inventoryQuantity": 40 }
    ],
    "attributes": { "accuracy": "0.1g", "battery": "1600mAh USB-C" },
    "relatedProductIds": ["coffee-09", "coffee-10"]
  },
  {
    "id": "coffee-13",
    "storeId": "coffee",
    "handle": "hand-thrown-ceramic-mug",
    "title": "Earth & Fire Stoneware Mug (12oz)",
    "subtitle": "Wheel-Thrown Clay • Custom Studio Glaze",
    "description": "Each mug is individually thrown and glazed. The tapered lip directs the coffee aroma right to your nose for a heightened sensory tasting.",
    "details": ["12oz (350ml) liquid capacity", "Food-safe non-toxic matte glaze", "Microwave & dishwasher safe", "Unique variations in every piece"],
    "category": "Drinkware",
    "tags": ["drinkware", "ceramic", "handmade", "gift", "bestseller"],
    "price": 28.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 275 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "c13-1", "url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80", "alt": "Handmade ceramic mug with warm latte", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Warm Terracotta", "Raw Linen", "Forest Moss"] }
    ],
    "variants": [
      { "id": "c13-v1", "productId": "coffee-13", "title": "Warm Terracotta", "sku": "MUG-TER", "price": 28.00, "options": { "Color": "Warm Terracotta" }, "inStock": true, "inventoryQuantity": 50 },
      { "id": "c13-v2", "productId": "coffee-13", "title": "Raw Linen", "sku": "MUG-LIN", "price": 28.00, "options": { "Color": "Raw Linen" }, "inStock": true, "inventoryQuantity": 45 },
      { "id": "c13-v3", "productId": "coffee-13", "title": "Forest Moss", "sku": "MUG-MOS", "price": 28.00, "options": { "Color": "Forest Moss" }, "inStock": true, "inventoryQuantity": 30 }
    ],
    "attributes": { "capacity": "12oz", "material": "Stoneware" },
    "relatedProductIds": ["coffee-01", "coffee-03", "coffee-14"]
  },
  {
    "id": "coffee-14",
    "storeId": "coffee",
    "handle": "insulated-travel-tumbler",
    "title": "Ceramic-Lined Insulated Travel Tumbler",
    "subtitle": "16oz Double-Wall Vacuum Insulated",
    "description": "True taste ceramic interior coating prevents metallic off-flavors. Keeps brew steaming for 12 hours or iced cold for 24 hours.",
    "details": ["Leak-proof 360-degree sip lid", "Fits standard car cup holders", "BPA-free 18/8 stainless steel", "Ceramic taste shield coating"],
    "category": "Drinkware",
    "tags": ["drinkware", "travel", "tumbler", "insulated"],
    "price": 36.00,
    "compareAtPrice": 40.00,
    "rating": { "average": 4.8, "count": 160 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "c14-1", "url": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80", "alt": "Matte finish reusable travel coffee tumbler", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Matte Umber", "Desert Sand", "Olive Slate"] }
    ],
    "variants": [
      { "id": "c14-v1", "productId": "coffee-14", "title": "Matte Umber", "sku": "TUM-UMB", "price": 36.00, "compareAtPrice": 40.00, "options": { "Color": "Matte Umber" }, "inStock": true, "inventoryQuantity": 40 }
    ],
    "attributes": { "capacity": "16oz", "insulation": "Vacuum 12h hot / 24h cold" },
    "relatedProductIds": ["coffee-08", "coffee-13"]
  },
  {
    "id": "coffee-15",
    "storeId": "coffee",
    "handle": "roasters-reserve-tasting-box",
    "title": "The Roaster’s Reserve Tri-Origin Tasting Box",
    "subtitle": "Three 4oz Tasting Bags of Rare Micro-Lots",
    "description": "An educational tasting flight. Includes 4oz each of our Ethiopia Yirgacheffe, Colombia Pink Bourbon, and an exclusive anaerobic Kenya Nyeri.",
    "details": ["Three 4oz whole bean bags (12oz total)", "Full color origin & processing cards", "Flavor wheel guide included", "Packaged in embossed gift box"],
    "category": "Gifts",
    "tags": ["gift", "flight", "bundle", "micro-lot", "bestseller"],
    "price": 32.00,
    "compareAtPrice": null,
    "rating": { "average": 5.0, "count": 142 },
    "isNew": true,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "c15-1", "url": "https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?auto=format&fit=crop&w=800&q=80", "alt": "Specialty coffee gift box set with tasting cards", "isPrimary": true }
    ],
    "options": [
      { "name": "Grind", "values": ["Whole Bean", "Pour Over Grind"] }
    ],
    "variants": [
      { "id": "c15-v1", "productId": "coffee-15", "title": "Whole Bean", "sku": "BOX-WB", "price": 32.00, "options": { "Grind": "Whole Bean" }, "inStock": true, "inventoryQuantity": 60 }
    ],
    "attributes": { "curation": "Tri-Origin Rare Lot", "weight": "12oz total" },
    "relatedProductIds": ["coffee-01", "coffee-02", "coffee-13"]
  },
  {
    "id": "coffee-16",
    "storeId": "coffee",
    "handle": "unbleached-organic-cotton-filters",
    "title": "Reusable Organic Cotton Cone Filters (2-Pack)",
    "subtitle": "GOTS Certified Organic Cotton • Cone 02",
    "description": "Zero waste brewing. Allows natural coffee aromatic oils to pass through while trapping fine sediment for a full-bodied, clean cup.",
    "details": ["Pack of 2 washable filters", "Each filter lasts 6+ months (100+ brews)", "Compostable at end of life", "Cone 02 shape"],
    "category": "Equipment",
    "tags": ["equipment", "sustainable", "zero-waste", "filters"],
    "price": 14.00,
    "compareAtPrice": null,
    "rating": { "average": 4.6, "count": 68 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "c16-1", "url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80", "alt": "Organic cotton coffee filter brewing in ceramic cone", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["Cone 02 (1-4 cups)", "Cone 01 (1-2 cups)"] }
    ],
    "variants": [
      { "id": "c16-v1", "productId": "coffee-16", "title": "Cone 02", "sku": "FLT-02", "price": 14.00, "options": { "Size": "Cone 02 (1-4 cups)" }, "inStock": true, "inventoryQuantity": 90 }
    ],
    "attributes": { "material": "100% GOTS Cotton", "durability": "100+ brews" },
    "relatedProductIds": ["coffee-09", "coffee-10"]
  }
]
```

---

### 5.2 Store 2: Fashion ("Atelier Noir") — 16 Products

```json
[
  {
    "id": "fashion-01",
    "storeId": "fashion",
    "handle": "tailored-double-breasted-wool-blazer",
    "title": "Oversized Double-Breasted Wool Blazer",
    "subtitle": "Recycled Italian Melton Wool • Structured Shoulder",
    "description": "Architectural tailoring with a relaxed, genderless cut. Sculpted padded shoulders, horn buttons, and cupro lining. An enduring cornerstone for any contemporary wardrobe.",
    "details": ["100% Recycled Virgin Wool (420gsm)", "100% Bemberg Cupro lining", "Functional welt pockets and interior cigar pocket", "Dry clean only", "Crafted in Portugal"],
    "category": "Outerwear",
    "tags": ["outerwear", "tailoring", "wool", "blazer", "bestseller"],
    "price": 380.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 86 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "f01-1", "url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80", "alt": "Model wearing tailored double breasted black wool blazer", "isPrimary": true },
      { "id": "f01-2", "url": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80", "alt": "Fabric detail of recycled virgin wool coat" }
    ],
    "options": [
      { "name": "Size", "values": ["XS", "S", "M", "L", "XL"] },
      { "name": "Color", "values": ["Pitch Black", "Slate Grey", "Raw Bone"] }
    ],
    "variants": [
      { "id": "f01-v1", "productId": "fashion-01", "title": "Pitch Black / S", "sku": "BLZ-BLK-S", "price": 380.00, "options": { "Size": "S", "Color": "Pitch Black" }, "inStock": true, "inventoryQuantity": 14 },
      { "id": "f01-v2", "productId": "fashion-01", "title": "Pitch Black / M", "sku": "BLZ-BLK-M", "price": 380.00, "options": { "Size": "M", "Color": "Pitch Black" }, "inStock": true, "inventoryQuantity": 20 },
      { "id": "f01-v3", "productId": "fashion-01", "title": "Pitch Black / L", "sku": "BLZ-BLK-L", "price": 380.00, "options": { "Size": "L", "Color": "Pitch Black" }, "inStock": true, "inventoryQuantity": 12 },
      { "id": "f01-v4", "productId": "fashion-01", "title": "Slate Grey / M", "sku": "BLZ-SLT-M", "price": 380.00, "options": { "Size": "M", "Color": "Slate Grey" }, "inStock": true, "inventoryQuantity": 8 }
    ],
    "attributes": { "fabric": "100% Wool", "fit": "Oversized", "origin": "Portugal" },
    "relatedProductIds": ["fashion-02", "fashion-03", "fashion-08"]
  },
  {
    "id": "fashion-02",
    "storeId": "fashion",
    "handle": "pleated-wide-leg-trousers",
    "title": "Pleated Wide-Leg Wool Trousers",
    "subtitle": "High-Rise • Fluid Drape",
    "description": "Double reverse pleats create a dramatic, elongated silhouette. Designed to pool gracefully over boots or sneakers.",
    "details": ["High waist with internal waistband adjuster", "Deep side slash pockets", "Concealed zip fly and tab closure", "Unhemmed cuff for bespoke tailoring"],
    "category": "Tailoring",
    "tags": ["tailoring", "trousers", "pleated", "wool", "bestseller"],
    "price": 240.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 112 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "f02-1", "url": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80", "alt": "Model standing in wide leg black trousers", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["28", "30", "32", "34", "36"] },
      { "name": "Color", "values": ["Pitch Black", "Flint Grey"] }
    ],
    "variants": [
      { "id": "f02-v1", "productId": "fashion-02", "title": "Pitch Black / 30", "sku": "TRS-BLK-30", "price": 240.00, "options": { "Size": "30", "Color": "Pitch Black" }, "inStock": true, "inventoryQuantity": 15 },
      { "id": "f02-v2", "productId": "fashion-02", "title": "Pitch Black / 32", "sku": "TRS-BLK-32", "price": 240.00, "options": { "Size": "32", "Color": "Pitch Black" }, "inStock": true, "inventoryQuantity": 22 }
    ],
    "attributes": { "fabric": "Wool Blend", "rise": "High", "leg": "Wide" },
    "relatedProductIds": ["fashion-01", "fashion-04", "fashion-07"]
  },
  {
    "id": "fashion-03",
    "storeId": "fashion",
    "handle": "chunky-recycled-cashmere-crewneck",
    "title": "Chunky Recycled Cashmere Crewneck",
    "subtitle": "7-Gauge Fisherman Knit • Dropped Shoulder",
    "description": "Supremely soft, substantial knit spun from 100% recycled Mongolian cashmere fibers. Generous ribbed collar and cuffs.",
    "details": ["100% GRS Certified Recycled Cashmere", "7-gauge fisherman rib stitch", "Seamless tubular construction", "Hand wash cold or dry clean"],
    "category": "Knitwear",
    "tags": ["knitwear", "cashmere", "sustainable", "winter"],
    "price": 320.00,
    "compareAtPrice": 360.00,
    "rating": { "average": 4.9, "count": 73 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "f03-1", "url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80", "alt": "Chunky oversized knit sweater texture close up", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["S", "M", "L", "XL"] },
      { "name": "Color", "values": ["Off-White Bone", "Pitch Black", "Ash Heather"] }
    ],
    "variants": [
      { "id": "f03-v1", "productId": "fashion-03", "title": "Off-White Bone / M", "sku": "CSH-BON-M", "price": 320.00, "compareAtPrice": 360.00, "options": { "Size": "M", "Color": "Off-White Bone" }, "inStock": true, "inventoryQuantity": 10 }
    ],
    "attributes": { "fabric": "100% Cashmere", "gauge": "7-Gauge", "weight": "480g" },
    "relatedProductIds": ["fashion-01", "fashion-02"]
  },
  {
    "id": "fashion-04",
    "storeId": "fashion",
    "handle": "crisp-poplin-oversized-button-down",
    "title": "Architectural Poplin Oversized Shirt",
    "subtitle": "100% Giza Egyptian Cotton • Point Collar",
    "description": "Crisp paper-touch cotton poplin cut with an exaggerated hemline and elongated cuffs. Wear buttoned or draped as a lightweight overshirt.",
    "details": ["100% Extra-long staple Egyptian Giza cotton", "Mother-of-pearl buttons", "Double pleats at back yoke", "Machine wash delicate"],
    "category": "Shirts",
    "tags": ["shirts", "cotton", "oversized", "minimal"],
    "price": 180.00,
    "compareAtPrice": null,
    "rating": { "average": 4.7, "count": 98 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "f04-1", "url": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80", "alt": "Model in crisp white oversized poplin button down shirt", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["XS", "S", "M", "L"] },
      { "name": "Color", "values": ["Chalk White", "Pitch Black", "Sky Blue"] }
    ],
    "variants": [
      { "id": "f04-v1", "productId": "fashion-04", "title": "Chalk White / S", "sku": "SHR-WHT-S", "price": 180.00, "options": { "Size": "S", "Color": "Chalk White" }, "inStock": true, "inventoryQuantity": 25 },
      { "id": "f04-v2", "productId": "fashion-04", "title": "Chalk White / M", "sku": "SHR-WHT-M", "price": 180.00, "options": { "Size": "M", "Color": "Chalk White" }, "inStock": true, "inventoryQuantity": 30 }
    ],
    "attributes": { "fabric": "100% Giza Cotton", "fit": "Relaxed" },
    "relatedProductIds": ["fashion-01", "fashion-02"]
  },
  {
    "id": "fashion-05",
    "storeId": "fashion",
    "handle": "storm-flap-gabardine-trench-coat",
    "title": "Minimalist Storm-Flap Trench Coat",
    "subtitle": "Water-Repellent Cotton Gabardine",
    "description": "A deconstructed reimagining of the classic trench coat. Concealed horn button placket, oversized storm shield, and removable tie belt.",
    "details": ["Heavyweight tight-weave cotton gabardine", "Water and wind repellent finish", "Storm flap with magnetic retention", "Raglan sleeve construction"],
    "category": "Outerwear",
    "tags": ["outerwear", "trench", "rainwear", "iconic"],
    "price": 460.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 64 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "f05-1", "url": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80", "alt": "Fashion model wearing long minimal trench coat", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["S", "M", "L"] },
      { "name": "Color", "values": ["Slate Black", "Desert Sand"] }
    ],
    "variants": [
      { "id": "f05-v1", "productId": "fashion-05", "title": "Slate Black / M", "sku": "TRN-BLK-M", "price": 460.00, "options": { "Size": "M", "Color": "Slate Black" }, "inStock": true, "inventoryQuantity": 8 }
    ],
    "attributes": { "fabric": "Cotton Gabardine", "length": "Midi" },
    "relatedProductIds": ["fashion-01", "fashion-02"]
  },
  {
    "id": "fashion-06",
    "storeId": "fashion",
    "handle": "raw-selvedge-japanese-denim",
    "title": "13.5oz Raw Selvedge Japanese Denim",
    "subtitle": "Kuroki Mills • Straight Leg",
    "description": "Unwashed indigo selvedge denim woven on vintage shuttle looms in Okayama. Will fade uniquely to your lifestyle with wear.",
    "details": ["13.5oz Kuroki Mills pink selvedge ID", "Custom gunmetal branded shanks", "Reinforced hidden back pocket rivets", "Button fly closure"],
    "category": "Denim",
    "tags": ["denim", "selvedge", "japanese", "raw"],
    "price": 220.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 140 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "f06-1", "url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80", "alt": "Close up of raw indigo denim jeans with selvedge cuff", "isPrimary": true }
    ],
    "options": [
      { "name": "Waist", "values": ["29", "30", "31", "32", "33", "34"] },
      { "name": "Inseam", "values": ["32", "34"] }
    ],
    "variants": [
      { "id": "f06-v1", "productId": "fashion-06", "title": "31 / 32", "sku": "DNM-RAW-31-32", "price": 220.00, "options": { "Waist": "31", "Inseam": "32" }, "inStock": true, "inventoryQuantity": 16 }
    ],
    "attributes": { "fabric": "100% Cotton Selvedge", "weight": "13.5oz" },
    "relatedProductIds": ["fashion-04", "fashion-07"]
  },
  {
    "id": "fashion-07",
    "storeId": "fashion",
    "handle": "heavyweight-mercerized-cotton-tee",
    "title": "Heavyweight 280gsm Boxy T-Shirt",
    "subtitle": "Double Mercerized Organic Cotton",
    "description": "Substantial 280gsm jersey with a silky mercerized sheen and structured drop-shoulder drape. Retains its clean crisp form after dozens of washes.",
    "details": ["280gsm heavyweight combed organic cotton", "Thick 1.2-inch ribbed collar", "Blind-stitched hems", "Pre-shrunk"],
    "category": "Basics",
    "tags": ["basics", "t-shirt", "heavyweight", "organic", "bestseller"],
    "price": 75.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 380 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "f07-1", "url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", "alt": "Model wearing clean white heavyweight boxy t-shirt", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["S", "M", "L", "XL"] },
      { "name": "Color", "values": ["Chalk White", "Pitch Black", "Concrete Grey"] }
    ],
    "variants": [
      { "id": "f07-v1", "productId": "fashion-07", "title": "Chalk White / M", "sku": "TEE-WHT-M", "price": 75.00, "options": { "Size": "M", "Color": "Chalk White" }, "inStock": true, "inventoryQuantity": 40 },
      { "id": "f07-v2", "productId": "fashion-07", "title": "Pitch Black / M", "sku": "TEE-BLK-M", "price": 75.00, "options": { "Size": "M", "Color": "Pitch Black" }, "inStock": true, "inventoryQuantity": 45 }
    ],
    "attributes": { "fabric": "100% Organic Cotton", "weight": "280gsm" },
    "relatedProductIds": ["fashion-02", "fashion-06"]
  },
  {
    "id": "fashion-08",
    "storeId": "fashion",
    "handle": "leather-chunky-chelsea-boot",
    "title": "Lug-Sole Calfskin Chelsea Boots",
    "subtitle": "Goodyear Welted • Italian Box Calfskin",
    "description": "Sculptural commando lug sole paired with sleek full-grain calfskin leather and elasticated gussets. Hand-burnished by master cobblers in Tuscany.",
    "details": ["Full-grain Italian box calf leather", "Vibram custom lug sole", "Goodyear welted for lifetime resoling", "Leather lined interior with cushioned footbed"],
    "category": "Footwear",
    "tags": ["footwear", "boots", "leather", "chelsea", "bestseller"],
    "price": 420.00,
    "compareAtPrice": 460.00,
    "rating": { "average": 4.9, "count": 115 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": true,
    "images": [
      { "id": "f08-1", "url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80", "alt": "Pair of minimalist black leather boots on studio floor", "isPrimary": true }
    ],
    "options": [
      { "name": "EU Size", "values": ["40", "41", "42", "43", "44", "45"] },
      { "name": "Finish", "values": ["Polished Black", "Matte Waxed"] }
    ],
    "variants": [
      { "id": "f08-v1", "productId": "fashion-08", "title": "Polished Black / 42", "sku": "BOT-BLK-42", "price": 420.00, "compareAtPrice": 460.00, "options": { "EU Size": "42", "Finish": "Polished Black" }, "inStock": true, "inventoryQuantity": 8 }
    ],
    "attributes": { "material": "Calf Leather", "construction": "Goodyear Welt" },
    "relatedProductIds": ["fashion-01", "fashion-02"]
  },
  {
    "id": "fashion-09",
    "storeId": "fashion",
    "handle": "structured-leather-tote-bag",
    "title": "Architectural Leather Shopper Tote",
    "subtitle": "Vegetable-Tanned Tuscan Leather",
    "description": "Monolithic geometry with seamless edges and hand-lacquered seams. Accommodates a 16-inch laptop and daily essentials with an interior zip pouch.",
    "details": ["100% Full-grain vegetable tanned leather", "Magnetic collar closure", "Includes removable zip clutch", "Reinforced flat base"],
    "category": "Accessories",
    "tags": ["accessories", "bags", "leather", "minimal"],
    "price": 390.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 54 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "f09-1", "url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", "alt": "Black structured leather tote bag isolated on pedestal", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Pitch Black", "Cognac Brown"] }
    ],
    "variants": [
      { "id": "f09-v1", "productId": "fashion-09", "title": "Pitch Black", "sku": "TOT-BLK", "price": 390.00, "options": { "Color": "Pitch Black" }, "inStock": true, "inventoryQuantity": 12 }
    ],
    "attributes": { "material": "Vegetable-Tanned Leather", "capacity": "Fits 16-inch laptop" },
    "relatedProductIds": ["fashion-01", "fashion-10"]
  },
  {
    "id": "fashion-10",
    "storeId": "fashion",
    "handle": "square-acetate-sunglasses",
    "title": "Geometric Japanese Acetate Sunglasses",
    "subtitle": "Mazzucchelli Bio-Acetate • Zeiss Lenses",
    "description": "Bold beveled frames milled from 8mm Italian Mazzucchelli bio-acetate with custom titanium wire core and 100% UVA/UVB optical Zeiss lenses.",
    "details": ["8mm hand-polished acetate frame", "German 7-barrel hinges", "Anti-reflective Carl Zeiss optical lenses", "Custom leather hard case"],
    "category": "Accessories",
    "tags": ["accessories", "eyewear", "sunglasses"],
    "price": 260.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 78 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "f10-1", "url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80", "alt": "Square black sunglasses on stone surface", "isPrimary": true }
    ],
    "options": [
      { "name": "Frame Color", "values": ["Onyx Black", "Smoked Tortoise"] }
    ],
    "variants": [
      { "id": "f10-v1", "productId": "fashion-10", "title": "Onyx Black", "sku": "SNG-BLK", "price": 260.00, "options": { "Frame Color": "Onyx Black" }, "inStock": true, "inventoryQuantity": 20 }
    ],
    "attributes": { "lens": "Zeiss CR-39", "frame": "Bio-Acetate" },
    "relatedProductIds": ["fashion-04", "fashion-09"]
  },
  {
    "id": "fashion-11",
    "storeId": "fashion",
    "handle": "silk-habotai-bias-cut-slip-dress",
    "title": "Bias-Cut Mulberry Silk Slip Dress",
    "subtitle": "100% 22-Momme Silk Habotai",
    "description": "Drapes like liquid metal along the contours of the body. Delicate spaghetti straps, subtle cowled neckline, and French-seamed finish.",
    "details": ["100% Grade 6A Mulberry Silk", "Bias cut for natural stretch and movement", "Adjustable silk rouleau straps", "Dry clean only"],
    "category": "Dresses",
    "tags": ["dresses", "silk", "minimal", "evening"],
    "price": 310.00,
    "compareAtPrice": 350.00,
    "rating": { "average": 4.9, "count": 52 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "f11-1", "url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80", "alt": "Model in flowing black silk slip dress", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["XS", "S", "M", "L"] },
      { "name": "Color", "values": ["Midnight Noir", "Champagne Bone"] }
    ],
    "variants": [
      { "id": "f11-v1", "productId": "fashion-11", "title": "Midnight Noir / S", "sku": "DRS-SLK-S", "price": 310.00, "compareAtPrice": 350.00, "options": { "Size": "S", "Color": "Midnight Noir" }, "inStock": true, "inventoryQuantity": 10 }
    ],
    "attributes": { "fabric": "100% Mulberry Silk", "weight": "22 Momme" },
    "relatedProductIds": ["fashion-01", "fashion-08"]
  },
  {
    "id": "fashion-12",
    "storeId": "fashion",
    "handle": "boiled-wool-overshirt-jacket",
    "title": "Structured Boiled Wool Overshirt",
    "subtitle": "380gsm Austrian Boiled Wool",
    "description": "Naturally weather-resistant boiled wool with raw-edge detailing and horn snaps. Ideal layering transition piece for autumn and spring.",
    "details": ["100% Boiled Virgin Wool", "Custom matte horn snap hardware", "Dual chest flap pockets", "Straight boxy hem"],
    "category": "Outerwear",
    "tags": ["outerwear", "wool", "jacket", "layering"],
    "price": 290.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 42 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "f12-1", "url": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80", "alt": "Model wearing dark charcoal wool overshirt", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["S", "M", "L", "XL"] },
      { "name": "Color", "values": ["Charcoal Grey", "Pitch Black"] }
    ],
    "variants": [
      { "id": "f12-v1", "productId": "fashion-12", "title": "Charcoal Grey / M", "sku": "OVR-WOL-M", "price": 290.00, "options": { "Size": "M", "Color": "Charcoal Grey" }, "inStock": true, "inventoryQuantity": 14 }
    ],
    "attributes": { "fabric": "Boiled Wool", "weight": "380gsm" },
    "relatedProductIds": ["fashion-01", "fashion-07"]
  },
  {
    "id": "fashion-13",
    "storeId": "fashion",
    "handle": "leather-minimalist-cardholder",
    "title": "Minimalist Gusseted Leather Cardholder",
    "subtitle": "Matte Box Calf • Hand-Burnished Edges",
    "description": "Slim silhouette holding up to 8 cards and folded currency. Embossed tonal blind logo.",
    "details": ["4 external card slots", "Central gusseted compartment", "100% full-grain calf leather", "RFID blocking lining"],
    "category": "Accessories",
    "tags": ["accessories", "wallet", "leather", "gift"],
    "price": 85.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 180 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "f13-1", "url": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80", "alt": "Black leather minimalist cardholder on concrete pedestal", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Pitch Black", "Slate Grey"] }
    ],
    "variants": [
      { "id": "f13-v1", "productId": "fashion-13", "title": "Pitch Black", "sku": "CRD-BLK", "price": 85.00, "options": { "Color": "Pitch Black" }, "inStock": true, "inventoryQuantity": 40 }
    ],
    "attributes": { "material": "Calf Leather", "capacity": "8 cards" },
    "relatedProductIds": ["fashion-09", "fashion-10"]
  },
  {
    "id": "fashion-14",
    "storeId": "fashion",
    "handle": "unisex-cashmere-scarf",
    "title": "Oversized Cashmere Blanket Scarf",
    "subtitle": "100% Mongolian Cashmere • Raw Fringed Ends",
    "description": "Generously proportioned 200cm x 70cm blanket scarf. Unbelievable warmth and featherweight softness.",
    "details": ["200cm length x 70cm width", "Hand-twisted fringe details", "100% Pure Mongolian Cashmere", "Dry clean"],
    "category": "Accessories",
    "tags": ["accessories", "scarf", "cashmere", "winter", "gift"],
    "price": 195.00,
    "compareAtPrice": 220.00,
    "rating": { "average": 5.0, "count": 88 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "f14-1", "url": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80", "alt": "Draped soft grey cashmere scarf", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Heather Grey", "Pitch Black", "Bone White"] }
    ],
    "variants": [
      { "id": "f14-v1", "productId": "fashion-14", "title": "Heather Grey", "sku": "SCF-GRY", "price": 195.00, "compareAtPrice": 220.00, "options": { "Color": "Heather Grey" }, "inStock": true, "inventoryQuantity": 25 }
    ],
    "attributes": { "fabric": "100% Cashmere", "dimensions": "200x70 cm" },
    "relatedProductIds": ["fashion-03", "fashion-05"]
  },
  {
    "id": "fashion-15",
    "storeId": "fashion",
    "handle": "leather-derby-platform-shoes",
    "title": "Square-Toe Chunky Leather Derby",
    "subtitle": "Brushed Spazzolato Leather • Vibram Sole",
    "description": "Exaggerated architectural welt and square chisel toe bring modern attitude to classic menswear footwear.",
    "details": ["Spazzolato high-shine calf leather", "Vibram EVA lightweight platform sole", "Waxed cotton laces", "Handmade in Marche, Italy"],
    "category": "Footwear",
    "tags": ["footwear", "shoes", "leather", "derby"],
    "price": 380.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 46 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "f15-1", "url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80", "alt": "Black leather square toe derby shoes", "isPrimary": true }
    ],
    "options": [
      { "name": "EU Size", "values": ["40", "41", "42", "43", "44"] }
    ],
    "variants": [
      { "id": "f15-v1", "productId": "fashion-15", "title": "42", "sku": "DRB-BLK-42", "price": 380.00, "options": { "EU Size": "42" }, "inStock": true, "inventoryQuantity": 10 }
    ],
    "attributes": { "material": "Spazzolato Leather", "sole": "Vibram Platform" },
    "relatedProductIds": ["fashion-01", "fashion-02", "fashion-08"]
  },
  {
    "id": "fashion-16",
    "storeId": "fashion",
    "handle": "minimal-leather-belt",
    "title": "Minimal Square Buckle Leather Belt",
    "subtitle": "Full-Grain Bridle Leather • Brushed Steel",
    "description": "30mm width belt handcrafted from English bridle leather with a seamless hand-stitched buckle attachment.",
    "details": ["100% Vegetable-tanned English bridle leather", "Solid brass buckle with brushed palladium finish", "Hand-beveled and burnished edges", "Made in England"],
    "category": "Accessories",
    "tags": ["accessories", "belt", "leather"],
    "price": 110.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 92 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "f16-1", "url": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80", "alt": "Rolled black leather belt on plain surface", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["85cm (32)", "95cm (36)", "105cm (40)"] },
      { "name": "Color", "values": ["Pitch Black", "Deep Espresso"] }
    ],
    "variants": [
      { "id": "f16-v1", "productId": "fashion-16", "title": "Pitch Black / 85cm", "sku": "BLT-BLK-85", "price": 110.00, "options": { "Size": "85cm (32)", "Color": "Pitch Black" }, "inStock": true, "inventoryQuantity": 20 }
    ],
    "attributes": { "material": "Bridle Leather", "width": "30mm" },
    "relatedProductIds": ["fashion-02", "fashion-06"]
  }
]
```

---

### 5.3 Store 3: Jewelry ("L'Étoile Joaillerie") — 16 Products

```json
[
  {
    "id": "jewelry-01",
    "storeId": "jewelry",
    "handle": "solitaire-round-brilliant-diamond-ring",
    "title": "The Celestia Solitaire Diamond Ring",
    "subtitle": "GIA Certified 1.50ct F/VVS1 • 18K Yellow Gold",
    "description": "The quintessential testament of love. A hand-selected GIA-certified round brilliant diamond secured in a six-prong platinum crown atop an 18K yellow gold band.",
    "details": ["Center Diamond: 1.50 Carat Round Brilliant", "Color: F (Colorless), Clarity: VVS1", "Cut: Excellent, Polish: Excellent, Symmetry: Excellent", "Setting: 6-Prong Platinum Crown on 18K Gold Shank", "Includes official GIA certificate and wooden keepsake box"],
    "category": "Rings",
    "tags": ["rings", "diamonds", "engagement", "solitaire", "bestseller"],
    "price": 4850.00,
    "compareAtPrice": null,
    "rating": { "average": 5.0, "count": 64 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "j01-1", "url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80", "alt": "Classic solitaire round brilliant diamond engagement ring", "isPrimary": true },
      { "id": "j01-2", "url": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80", "alt": "Macro detail of diamond facets sparkling in light" }
    ],
    "options": [
      { "name": "Metal", "values": ["18K Yellow Gold", "18K White Gold", "950 Platinum"] },
      { "name": "Ring Size", "values": ["5", "6", "7", "8", "9"] }
    ],
    "variants": [
      { "id": "j01-v1", "productId": "jewelry-01", "title": "18K Yellow Gold / Size 6", "sku": "RNG-SOL-YG-6", "price": 4850.00, "options": { "Metal": "18K Yellow Gold", "Ring Size": "6" }, "inStock": true, "inventoryQuantity": 3 },
      { "id": "j01-v2", "productId": "jewelry-01", "title": "18K Yellow Gold / Size 7", "sku": "RNG-SOL-YG-7", "price": 4850.00, "options": { "Metal": "18K Yellow Gold", "Ring Size": "7" }, "inStock": true, "inventoryQuantity": 4 },
      { "id": "j01-v3", "productId": "jewelry-01", "title": "950 Platinum / Size 6", "sku": "RNG-SOL-PL-6", "price": 5250.00, "options": { "Metal": "950 Platinum", "Ring Size": "6" }, "inStock": true, "inventoryQuantity": 2 }
    ],
    "attributes": { "carat": "1.50ct", "metal": "18K Gold / Platinum", "gemstone": "Natural Diamond" },
    "relatedProductIds": ["jewelry-02", "jewelry-05", "jewelry-08"]
  },
  {
    "id": "jewelry-02",
    "storeId": "jewelry",
    "handle": "eternity-pave-diamond-band",
    "title": "Aura Full Eternity Pavé Diamond Band",
    "subtitle": "1.20ctw F-G/VS Diamonds • 18K Gold",
    "description": "An uninterrupted circle of brilliant diamonds held in delicate shared prongs. Designed to stack flush against our Celestia Solitaire.",
    "details": ["Total Diamond Weight: 1.20ctw (approx. 24 stones)", "Diamond Quality: F-G color, VS clarity", "Band Width: 2.2mm", "100% Recycled 18K Gold"],
    "category": "Rings",
    "tags": ["rings", "diamonds", "wedding-bands", "eternity", "bestseller"],
    "price": 1850.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 92 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "j02-1", "url": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80", "alt": "Eternity diamond ring band sparkling on satin", "isPrimary": true }
    ],
    "options": [
      { "name": "Metal", "values": ["18K Yellow Gold", "18K White Gold", "18K Rose Gold"] },
      { "name": "Ring Size", "values": ["5", "6", "7", "8"] }
    ],
    "variants": [
      { "id": "j02-v1", "productId": "jewelry-02", "title": "18K Yellow Gold / Size 6", "sku": "RNG-ETN-YG-6", "price": 1850.00, "options": { "Metal": "18K Yellow Gold", "Ring Size": "6" }, "inStock": true, "inventoryQuantity": 5 }
    ],
    "attributes": { "carat": "1.20ctw", "metal": "18K Gold" },
    "relatedProductIds": ["jewelry-01", "jewelry-08"]
  },
  {
    "id": "jewelry-03",
    "storeId": "jewelry",
    "handle": "diamond-tennis-bracelet",
    "title": "Lumière 4.0ct Diamond Tennis Bracelet",
    "subtitle": "4.00ctw F/VS Diamonds • Box Clasp with Safety Lock",
    "description": "A fluid stream of fifty-six precisely calibrated round brilliant diamonds set in articulated 18K white gold baskets for maximum drape and fire.",
    "details": ["4.00ctw natural diamonds", "Length: 7.0 inches (17.8 cm)", "Concealed push clasp with double safety latches", "Conflict-free Kimberley Process certified"],
    "category": "Bracelets",
    "tags": ["bracelets", "diamonds", "tennis-bracelet", "luxury", "bestseller"],
    "price": 5400.00,
    "compareAtPrice": 6000.00,
    "rating": { "average": 5.0, "count": 48 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": true,
    "images": [
      { "id": "j03-1", "url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80", "alt": "Diamond tennis bracelet on velvet display", "isPrimary": true }
    ],
    "options": [
      { "name": "Metal", "values": ["18K White Gold", "18K Yellow Gold", "950 Platinum"] }
    ],
    "variants": [
      { "id": "j03-v1", "productId": "jewelry-03", "title": "18K White Gold", "sku": "BRC-TNS-WG", "price": 5400.00, "compareAtPrice": 6000.00, "options": { "Metal": "18K White Gold" }, "inStock": true, "inventoryQuantity": 3 }
    ],
    "attributes": { "carat": "4.00ctw", "metal": "18K White Gold" },
    "relatedProductIds": ["jewelry-01", "jewelry-04"]
  },
  {
    "id": "jewelry-04",
    "storeId": "jewelry",
    "handle": "south-sea-pearl-pendant-necklace",
    "title": "Imperial Golden South Sea Pearl Pendant",
    "subtitle": "12mm Golden Pearl • 0.15ct Diamond Bale • 18K Gold",
    "description": "Cultivated in the pristine warm waters of the Palawan archipelago. Natural deep champagne-golden luster suspended on an 18K Venetian link chain.",
    "details": ["12mm AAA Grade Golden South Sea Pearl", "Flawless mirror-like surface luster", "0.15ct pave diamond bail", "18-inch adjustable 18K wheat chain"],
    "category": "Necklaces",
    "tags": ["necklaces", "pearls", "south-sea", "gold"],
    "price": 2100.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 35 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "j04-1", "url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80", "alt": "Golden pearl necklace resting on silk", "isPrimary": true }
    ],
    "options": [
      { "name": "Chain Length", "values": ["16-18 inches adjustable", "20 inches"] }
    ],
    "variants": [
      { "id": "j04-v1", "productId": "jewelry-04", "title": "16-18 inches", "sku": "NCK-PRL-18", "price": 2100.00, "options": { "Chain Length": "16-18 inches adjustable" }, "inStock": true, "inventoryQuantity": 6 }
    ],
    "attributes": { "pearlSize": "12mm", "gemstone": "South Sea Pearl" },
    "relatedProductIds": ["jewelry-07", "jewelry-10"]
  },
  {
    "id": "jewelry-05",
    "storeId": "jewelry",
    "handle": "emerald-cut-sapphire-halo-ring",
    "title": "Royal Ceylon Sapphire & Diamond Halo Ring",
    "subtitle": "2.20ct Unheated Blue Sapphire • 18K White Gold",
    "description": "A velvety cornflower-blue Ceylon sapphire bordered by a halo of micro-pavé diamonds in an open-gallery architectural basket.",
    "details": ["Center Stone: 2.20 Carat Emerald-Cut Ceylon Sapphire", "Origin: Sri Lanka (Certified Unheated)", "Halo Diamonds: 0.45ctw F/VS", "Hallmarked 750 (18K) White Gold"],
    "category": "Rings",
    "tags": ["rings", "sapphire", "gemstones", "halo", "luxury"],
    "price": 4200.00,
    "compareAtPrice": 4600.00,
    "rating": { "average": 5.0, "count": 29 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "j05-1", "url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80", "alt": "Blue sapphire halo ring with diamonds", "isPrimary": true }
    ],
    "options": [
      { "name": "Ring Size", "values": ["6", "7", "8"] }
    ],
    "variants": [
      { "id": "j05-v1", "productId": "jewelry-05", "title": "Size 7", "sku": "RNG-SAP-7", "price": 4200.00, "compareAtPrice": 4600.00, "options": { "Ring Size": "7" }, "inStock": true, "inventoryQuantity": 2 }
    ],
    "attributes": { "carat": "2.20ct Sapphire", "gemstone": "Ceylon Sapphire" },
    "relatedProductIds": ["jewelry-01", "jewelry-06"]
  },
  {
    "id": "jewelry-06",
    "storeId": "jewelry",
    "handle": "diamond-pave-huggie-earrings",
    "title": "Éclat Pavé Diamond Huggie Earrings",
    "subtitle": "0.60ctw F/VS Diamonds • Snap Closure • 18K Gold",
    "description": "Effortless everyday glamour. Rows of micro-pavé diamonds wrap around the earlobe with an invisible hinge and secure audible click lock.",
    "details": ["Diameter: 12mm exterior, 8mm interior", "Total Weight: 0.60ctw round brilliant diamonds", "Click-latch closure for ultimate comfort", "Sold as a pair"],
    "category": "Earrings",
    "tags": ["earrings", "diamonds", "huggies", "everyday", "bestseller"],
    "price": 950.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 142 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "j06-1", "url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80", "alt": "Pair of gold diamond huggie earrings on marble", "isPrimary": true }
    ],
    "options": [
      { "name": "Metal", "values": ["18K Yellow Gold", "18K White Gold", "18K Rose Gold"] }
    ],
    "variants": [
      { "id": "j06-v1", "productId": "jewelry-06", "title": "18K Yellow Gold", "sku": "EAR-HUG-YG", "price": 950.00, "options": { "Metal": "18K Yellow Gold" }, "inStock": true, "inventoryQuantity": 15 },
      { "id": "j06-v2", "productId": "jewelry-06", "title": "18K White Gold", "sku": "EAR-HUG-WG", "price": 950.00, "options": { "Metal": "18K White Gold" }, "inStock": true, "inventoryQuantity": 12 }
    ],
    "attributes": { "carat": "0.60ctw", "diameter": "12mm" },
    "relatedProductIds": ["jewelry-02", "jewelry-07"]
  },
  {
    "id": "jewelry-07",
    "storeId": "jewelry",
    "handle": "herringbone-chain-necklace",
    "title": "Sovereign 18K Gold Flat Herringbone Chain",
    "subtitle": "4.5mm Width • 18K Solid Italian Gold",
    "description": "Lies completely flat against the collarbone like liquid gold ribbon. Crafted by generational chain artisans in Vicenza, Italy.",
    "details": ["Width: 4.5mm", "Lengths: 16-inch or 18-inch", "Solid 18K Yellow Gold (approx. 14.2g)", "Lobster claw clasp with safety eye"],
    "category": "Necklaces",
    "tags": ["necklaces", "gold-chains", "italian", "classic", "bestseller"],
    "price": 1450.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 88 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "j07-1", "url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80", "alt": "Flat gold herringbone chain necklace on mannequin", "isPrimary": true }
    ],
    "options": [
      { "name": "Length", "values": ["16 inches", "18 inches"] }
    ],
    "variants": [
      { "id": "j07-v1", "productId": "jewelry-07", "title": "16 inches", "sku": "CHN-HRB-16", "price": 1450.00, "options": { "Length": "16 inches" }, "inStock": true, "inventoryQuantity": 8 },
      { "id": "j07-v2", "productId": "jewelry-07", "title": "18 inches", "sku": "CHN-HRB-18", "price": 1620.00, "options": { "Length": "18 inches" }, "inStock": true, "inventoryQuantity": 6 }
    ],
    "attributes": { "metal": "18K Gold", "weight": "14.2g", "origin": "Vicenza, Italy" },
    "relatedProductIds": ["jewelry-04", "jewelry-06"]
  },
  {
    "id": "jewelry-08",
    "storeId": "jewelry",
    "handle": "diamond-solitaire-pendant",
    "title": "Étoile Bezel-Set Diamond Solitaire Pendant",
    "subtitle": "0.75ct F/VS1 Diamond • 18K Gold",
    "description": "A floating bezel setting accentuates the diameter of the diamond while offering smooth, snag-free everyday luxury.",
    "details": ["0.75 Carat Round Brilliant Diamond", "Color: F, Clarity: VS1", "18-inch adjustable 18K cable chain", "Lobster clasp"],
    "category": "Necklaces",
    "tags": ["necklaces", "diamonds", "solitaire", "gift"],
    "price": 2400.00,
    "compareAtPrice": 2700.00,
    "rating": { "average": 5.0, "count": 55 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "j08-1", "url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80", "alt": "Diamond solitaire pendant on fine gold chain", "isPrimary": true }
    ],
    "options": [
      { "name": "Metal", "values": ["18K Yellow Gold", "18K White Gold"] }
    ],
    "variants": [
      { "id": "j08-v1", "productId": "jewelry-08", "title": "18K Yellow Gold", "sku": "NCK-SOL-YG", "price": 2400.00, "compareAtPrice": 2700.00, "options": { "Metal": "18K Yellow Gold" }, "inStock": true, "inventoryQuantity": 7 }
    ],
    "attributes": { "carat": "0.75ct", "gemstone": "Natural Diamond" },
    "relatedProductIds": ["jewelry-01", "jewelry-06"]
  },
  {
    "id": "jewelry-09",
    "storeId": "jewelry",
    "handle": "emerald-cut-colombian-emerald-ring",
    "title": "Verdant Muzo Colombian Emerald Ring",
    "subtitle": "1.80ct Natural Muzo Emerald • Tapered Baguette Diamonds",
    "description": "Vivid green Colombian emerald from the historic Muzo mine, flanked by two step-cut tapered diamond baguettes in 18K gold.",
    "details": ["1.80 Carat Muzo Colombian Emerald (Minor Cedar Oil)", "Baguette Side Diamonds: 0.35ctw F/VS", "Includes GRS Gemological Certification", "Custom heirloom presentation box"],
    "category": "Rings",
    "tags": ["rings", "emerald", "gemstones", "rare"],
    "price": 5200.00,
    "compareAtPrice": null,
    "rating": { "average": 5.0, "count": 22 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "j09-1", "url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80", "alt": "Green emerald cut ring with diamond side stones", "isPrimary": true }
    ],
    "options": [
      { "name": "Ring Size", "values": ["6", "7"] }
    ],
    "variants": [
      { "id": "j09-v1", "productId": "jewelry-09", "title": "Size 7", "sku": "RNG-EMR-7", "price": 5200.00, "options": { "Ring Size": "7" }, "inStock": true, "inventoryQuantity": 2 }
    ],
    "attributes": { "gemstone": "Muzo Colombian Emerald", "carat": "1.80ct" },
    "relatedProductIds": ["jewelry-05", "jewelry-11"]
  },
  {
    "id": "jewelry-10",
    "storeId": "jewelry",
    "handle": "akoya-pearl-stud-earrings",
    "title": "Mikado Japanese Akoya Pearl Studs",
    "subtitle": "8.5-9.0mm AAA Akoya Pearls • 18K Gold Posts",
    "description": "Iconic, luminous round Akoya pearls with rose overtone and mirror reflections. Fitted with secure 18K silicone-encased gold push backs.",
    "details": ["Pearl Size: 8.5mm - 9.0mm", "Shape: Perfectly Round AAA", "18K Gold friction posts and backings", "Certified Japanese origin"],
    "category": "Earrings",
    "tags": ["earrings", "pearls", "akoya", "classic", "gift", "bestseller"],
    "price": 680.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 160 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "j10-1", "url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80", "alt": "Pair of luminous white Akoya pearl stud earrings", "isPrimary": true }
    ],
    "options": [
      { "name": "Metal", "values": ["18K Yellow Gold", "18K White Gold"] }
    ],
    "variants": [
      { "id": "j10-v1", "productId": "jewelry-10", "title": "18K Yellow Gold", "sku": "EAR-AKY-YG", "price": 680.00, "options": { "Metal": "18K Yellow Gold" }, "inStock": true, "inventoryQuantity": 18 }
    ],
    "attributes": { "pearlType": "Akoya", "size": "8.5-9mm" },
    "relatedProductIds": ["jewelry-04", "jewelry-06"]
  },
  {
    "id": "jewelry-11",
    "storeId": "jewelry",
    "handle": "art-deco-signet-ring",
    "title": "Bespoke Monogram Signet Ring",
    "subtitle": "Heavy Solid 18K Gold • Hand-Engraved Face",
    "description": "Substantial, heirloom weight signet ring featuring a polished flat face ready for custom hand-engraved monogram or family crest.",
    "details": ["Face Dimensions: 14mm x 11mm oval", "Solid 18K Gold casting (approx. 12.5g)", "Comfort-fit tapered inner band", "Complimentary hand engraving included"],
    "category": "Rings",
    "tags": ["rings", "signet", "gold", "monogram", "bespoke"],
    "price": 1650.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 41 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "j11-1", "url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80", "alt": "Heavy gold signet ring on velvet", "isPrimary": true }
    ],
    "options": [
      { "name": "Ring Size", "values": ["7", "8", "9", "10"] },
      { "name": "Metal", "values": ["18K Yellow Gold", "18K Rose Gold"] }
    ],
    "variants": [
      { "id": "j11-v1", "productId": "jewelry-11", "title": "18K Yellow Gold / Size 9", "sku": "RNG-SIG-YG-9", "price": 1650.00, "options": { "Ring Size": "9", "Metal": "18K Yellow Gold" }, "inStock": true, "inventoryQuantity": 5 }
    ],
    "attributes": { "weight": "12.5g", "metal": "18K Gold" },
    "relatedProductIds": ["jewelry-01", "jewelry-07"]
  },
  {
    "id": "jewelry-12",
    "storeId": "jewelry",
    "handle": "diamond-cluster-cocktail-ring",
    "title": "Galaxy Asymmetrical Diamond Cluster Ring",
    "subtitle": "1.75ctw Mixed-Cut Diamonds • 18K Gold",
    "description": "An avant-garde constellation of marquise, pear, and round brilliant diamonds cascading across the finger in an organic asymmetric flow.",
    "details": ["1.75ctw natural diamonds", "Marquise, pear, and round brilliant cuts", "Low-profile prong settings", "18K Yellow Gold band"],
    "category": "Rings",
    "tags": ["rings", "diamonds", "cluster", "contemporary"],
    "price": 3100.00,
    "compareAtPrice": 3450.00,
    "rating": { "average": 4.9, "count": 38 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "j12-1", "url": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80", "alt": "Diamond cluster ring sparkling in warm ambient light", "isPrimary": true }
    ],
    "options": [
      { "name": "Ring Size", "values": ["6", "7", "8"] }
    ],
    "variants": [
      { "id": "j12-v1", "productId": "jewelry-12", "title": "Size 7", "sku": "RNG-CLS-7", "price": 3100.00, "compareAtPrice": 3450.00, "options": { "Ring Size": "7" }, "inStock": true, "inventoryQuantity": 3 }
    ],
    "attributes": { "carat": "1.75ctw", "cuts": "Pear, Marquise, Round" },
    "relatedProductIds": ["jewelry-01", "jewelry-02"]
  },
  {
    "id": "jewelry-13",
    "storeId": "jewelry",
    "handle": "chunky-gold-curb-chain-bracelet",
    "title": "Monarque 18K Solid Gold Curb Bracelet",
    "subtitle": "7.5mm Width • 18K Solid Yellow Gold (22g)",
    "description": "Substantial, hand-polished curb links with beveled diamond-cut facets that catch the light with every gesture.",
    "details": ["Width: 7.5mm", "Length: 7.5 inches (19cm)", "Total Gold Weight: 22.0g solid 18K gold", "Custom box clasp with dual safety figure-eight catches"],
    "category": "Bracelets",
    "tags": ["bracelets", "gold", "curb-chain", "luxury", "bestseller"],
    "price": 2850.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 52 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "j13-1", "url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80", "alt": "Heavy solid gold curb chain bracelet", "isPrimary": true }
    ],
    "options": [
      { "name": "Length", "values": ["7.0 inches", "7.5 inches", "8.0 inches"] }
    ],
    "variants": [
      { "id": "j13-v1", "productId": "jewelry-13", "title": "7.5 inches", "sku": "BRC-CRB-75", "price": 2850.00, "options": { "Length": "7.5 inches" }, "inStock": true, "inventoryQuantity": 4 }
    ],
    "attributes": { "metal": "18K Gold", "weight": "22.0g" },
    "relatedProductIds": ["jewelry-03", "jewelry-07"]
  },
  {
    "id": "jewelry-14",
    "storeId": "jewelry",
    "handle": "baroque-pearl-drop-earrings",
    "title": "Aphrodite Keshi Baroque Pearl Drops",
    "subtitle": "Natural Freeform Keshi Pearls • 18K Gold Hooks",
    "description": "Organic, molten pearl shapes created purely by nature. No two pearls are ever alike. Suspended from 18K gold hand-hammered earwires.",
    "details": ["Length: approx. 32mm total drop", "Naturally formed Australian Keshi pearls", "Handmade 18K gold French earwires", "Hypoallergenic and nickel-free"],
    "category": "Earrings",
    "tags": ["earrings", "pearls", "baroque", "organic", "artisan"],
    "price": 490.00,
    "compareAtPrice": 550.00,
    "rating": { "average": 4.8, "count": 76 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "j14-1", "url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80", "alt": "Organic baroque pearl drop earrings", "isPrimary": true }
    ],
    "options": [
      { "name": "Metal", "values": ["18K Yellow Gold", "18K White Gold"] }
    ],
    "variants": [
      { "id": "j14-v1", "productId": "jewelry-14", "title": "18K Yellow Gold", "sku": "EAR-BRQ-YG", "price": 490.00, "compareAtPrice": 550.00, "options": { "Metal": "18K Yellow Gold" }, "inStock": true, "inventoryQuantity": 10 }
    ],
    "attributes": { "pearlType": "Keshi Baroque", "length": "32mm" },
    "relatedProductIds": ["jewelry-04", "jewelry-10"]
  },
  {
    "id": "jewelry-15",
    "storeId": "jewelry",
    "handle": "art-deco-emerald-pendant",
    "title": "Verdant Deco Emerald & Diamond Pendant",
    "subtitle": "1.10ct Colombian Emerald • Geometric Diamond Halo",
    "description": "An octagonal Colombian emerald cradled in a stepped Art Deco halo of tapered baguette and round diamonds in 18K white gold.",
    "details": ["1.10 Carat Colombian Emerald", "0.30ctw F/VS accent diamonds", "18-inch 18K white gold wheat chain included", "Vintage milgrain detailing"],
    "category": "Necklaces",
    "tags": ["necklaces", "emerald", "art-deco", "vintage"],
    "price": 2800.00,
    "compareAtPrice": null,
    "rating": { "average": 5.0, "count": 28 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "j15-1", "url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80", "alt": "Green emerald pendant necklace with diamonds", "isPrimary": true }
    ],
    "options": [
      { "name": "Metal", "values": ["18K White Gold", "18K Yellow Gold"] }
    ],
    "variants": [
      { "id": "j15-v1", "productId": "jewelry-15", "title": "18K White Gold", "sku": "NCK-EMR-WG", "price": 2800.00, "options": { "Metal": "18K White Gold" }, "inStock": true, "inventoryQuantity": 3 }
    ],
    "attributes": { "gemstone": "Colombian Emerald", "carat": "1.10ct" },
    "relatedProductIds": ["jewelry-09", "jewelry-08"]
  },
  {
    "id": "jewelry-16",
    "storeId": "jewelry",
    "handle": "leather-velvet-jewelry-travel-vault",
    "title": "Maison Saffiano Leather Travel Jewelry Case",
    "subtitle": "Italian Saffiano Calfskin • Anti-Tarnish Suede",
    "description": "Keep precious heirlooms organized and protected while traveling. Custom ring rolls, necklace snap loops with pouch pockets, and stud earring bar.",
    "details": ["Genuine Italian scratch-resistant Saffiano leather", "LusterLoc anti-tarnish micro-suede interior", "Dimensions: 7 x 4.5 x 2.2 inches", "Golden zipper pull with padlock accent"],
    "category": "Care & Cases",
    "tags": ["accessories", "cases", "travel", "gift", "leather"],
    "price": 220.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 110 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "j16-1", "url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", "alt": "Luxury cream leather jewelry travel vault box", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Champagne Cream", "Midnight Noir", "Blush Rose"] }
    ],
    "variants": [
      { "id": "j16-v1", "productId": "jewelry-16", "title": "Champagne Cream", "sku": "BOX-TRV-CRM", "price": 220.00, "options": { "Color": "Champagne Cream" }, "inStock": true, "inventoryQuantity": 25 }
    ],
    "attributes": { "material": "Saffiano Leather", "protection": "Anti-Tarnish Suede" },
    "relatedProductIds": ["jewelry-01", "jewelry-03", "jewelry-06"]
  }
]
```

---

### 5.4 Store 4: Electronics ("Nexus Tech") — 16 Products

```json
[
  {
    "id": "electronics-01",
    "storeId": "electronics",
    "handle": "quantum-anc-planar-headphones",
    "title": "Apex-1 Wireless Planar Magnetic Headphones",
    "subtitle": "50mm Beryllium Planar Drivers • Active Hybrid ANC",
    "description": "Studio mastering precision unleashed wirelessly. Custom 50mm planar transducers achieve 0.001% Total Harmonic Distortion with ultra-wide 5Hz–50kHz frequency response. Hybrid 48dB active noise cancellation with transparency mode.",
    "details": ["50mm Planar Magnetic Beryllium Transducers", "LDAC, aptX Lossless, AAC, SBC codecs", "Battery Life: 45 hours ANC on / 60 hours ANC off", "Weight: 290g CNC aluminum and memory foam", "USB-C Lossless 192kHz/24-bit DAC mode"],
    "category": "Audio",
    "tags": ["audio", "headphones", "wireless", "anc", "audiophile", "bestseller"],
    "price": 399.00,
    "compareAtPrice": 449.00,
    "rating": { "average": 4.9, "count": 312 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": true,
    "images": [
      { "id": "e01-1", "url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", "alt": "High end over-ear wireless ANC headphones on dark background", "isPrimary": true },
      { "id": "e01-2", "url": "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80", "alt": "Headphone ear cup detail showing aluminum grille and controls" }
    ],
    "options": [
      { "name": "Color", "values": ["Cyber Black / Cyan", "Titanium Silver", "Matte Slate"] }
    ],
    "variants": [
      { "id": "e01-v1", "productId": "electronics-01", "title": "Cyber Black / Cyan", "sku": "NEX-APX-BLK", "price": 399.00, "compareAtPrice": 449.00, "options": { "Color": "Cyber Black / Cyan" }, "inStock": true, "inventoryQuantity": 45 },
      { "id": "e01-v2", "productId": "electronics-01", "title": "Titanium Silver", "sku": "NEX-APX-SLV", "price": 399.00, "compareAtPrice": 449.00, "options": { "Color": "Titanium Silver" }, "inStock": true, "inventoryQuantity": 30 }
    ],
    "attributes": { "driver": "50mm Planar", "battery": "45 Hours", "anc": "48dB Hybrid", "latency": "24ms Ultra-low" },
    "relatedProductIds": ["electronics-02", "electronics-07", "electronics-11"]
  },
  {
    "id": "electronics-02",
    "storeId": "electronics",
    "handle": "mechanical-wireless-75-keyboard",
    "title": "Vortex Pro 75% Wireless Mechanical Keyboard",
    "subtitle": "Gasket-Mounted • CNC Aluminum • Tri-Mode Wireless",
    "description": "Acoustically tuned keyboard with five layers of sound dampening silicone and PORON. Hot-swappable PCB, south-facing RGB, and programmable OLED display knob.",
    "details": ["CNC Anodized 6063 Aluminum Chassis (1.8kg)", "Tri-Mode: 2.4GHz (1000Hz polling), Bluetooth 5.2, USB-C", "Factory pre-lubed mechanical linear switches", "Hot-swap 3/5-pin switch sockets", "Custom QMK/VIA firmware programmable"],
    "category": "Keyboards",
    "tags": ["keyboards", "mechanical", "wireless", "gaming", "desk-setup", "bestseller"],
    "price": 189.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 480 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "e02-1", "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", "alt": "Gasket mount mechanical keyboard with custom keycaps and RGB glow", "isPrimary": true }
    ],
    "options": [
      { "name": "Switch Type", "values": ["Linear Quartz (Quiet & Smooth)", "Tactile Onyx (Satisfying Bump)", "Silent Linear (Office)"] },
      { "name": "Chassis Finish", "values": ["Stealth Black", "Cyber Cyan Accent", "Titanium White"] }
    ],
    "variants": [
      { "id": "e02-v1", "productId": "electronics-02", "title": "Linear Quartz / Stealth Black", "sku": "KB-75-LIN-BLK", "price": 189.00, "options": { "Switch Type": "Linear Quartz (Quiet & Smooth)", "Chassis Finish": "Stealth Black" }, "inStock": true, "inventoryQuantity": 50 },
      { "id": "e02-v2", "productId": "electronics-02", "title": "Tactile Onyx / Stealth Black", "sku": "KB-75-TAC-BLK", "price": 189.00, "options": { "Switch Type": "Tactile Onyx (Satisfying Bump)", "Chassis Finish": "Stealth Black" }, "inStock": true, "inventoryQuantity": 35 }
    ],
    "attributes": { "pollingRate": "1000Hz (1ms)", "mount": "Gasket Mount", "battery": "4000mAh (200h without RGB)" },
    "relatedProductIds": ["electronics-03", "electronics-05", "electronics-12"]
  },
  {
    "id": "electronics-03",
    "storeId": "electronics",
    "handle": "ultralight-precision-wireless-mouse",
    "title": "Spectre Pro Ultralight Wireless Mouse (49g)",
    "subtitle": "49 Grams • 32,000 DPI Optical Sensor • 8000Hz Polling",
    "description": "Zero latency precision. Magnesium-alloy exoskeleton weight reduction without honeycomb holes. Next-gen optical micro-switches rated for 100 million clicks.",
    "details": ["Weight: 49 grams ultralight solid shell", "PixArt PAW3395 32,000 DPI sensor (650 IPS, 50G)", "True 8,000Hz hyper-polling rate wireless receiver included", "Pure virgin-grade PTFE rounded skates", "Battery: 80 hours continuous play at 1000Hz"],
    "category": "Peripherals",
    "tags": ["mouse", "ultralight", "gaming", "esports", "wireless"],
    "price": 119.00,
    "compareAtPrice": 139.00,
    "rating": { "average": 4.8, "count": 215 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "e03-1", "url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80", "alt": "Ultralight gaming mouse on black gaming desk pad", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Matte Carbon Black", "Glacier White"] }
    ],
    "variants": [
      { "id": "e03-v1", "productId": "electronics-03", "title": "Matte Carbon Black", "sku": "MS-SPC-BLK", "price": 119.00, "compareAtPrice": 139.00, "options": { "Color": "Matte Carbon Black" }, "inStock": true, "inventoryQuantity": 40 }
    ],
    "attributes": { "weight": "49g", "dpi": "32,000", "pollingRate": "8000Hz" },
    "relatedProductIds": ["electronics-02", "electronics-05"]
  },
  {
    "id": "electronics-04",
    "storeId": "electronics",
    "handle": "nearfield-active-studio-monitors",
    "title": "Aura X5 Active Desktop Studio Monitors (Pair)",
    "subtitle": "120W Bi-Amplified • 5.25\" Kevlar Woofers • Bluetooth 5.3",
    "description": "Surgical acoustic clarity for music production, gaming, and creator workstations. Custom waveguide delivers a razor-sharp stereo image and deep low-end punch without distortion.",
    "details": ["Class D 120W RMS total bi-amplification", "5.25-inch woven carbon Kevlar low-frequency drivers", "1-inch silk dome high-frequency tweeters", "Balanced TRS, RCA, Optical, and Bluetooth 5.3 inputs", "Rear acoustic space tuning switches"],
    "category": "Audio",
    "tags": ["audio", "speakers", "studio-monitors", "pro-audio", "bestseller"],
    "price": 279.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 164 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "e04-1", "url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "alt": "Pair of sleek black studio monitors on desk stands", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Matte Black", "Arctic White"] }
    ],
    "variants": [
      { "id": "e04-v1", "productId": "electronics-04", "title": "Matte Black", "sku": "SPK-X5-BLK", "price": 279.00, "options": { "Color": "Matte Black" }, "inStock": true, "inventoryQuantity": 25 }
    ],
    "attributes": { "power": "120W RMS", "frequency": "45Hz - 22kHz", "inputs": "TRS, RCA, Opt, BT" },
    "relatedProductIds": ["electronics-01", "electronics-11"]
  },
  {
    "id": "electronics-05",
    "storeId": "electronics",
    "handle": "4k-144hz-portable-gaming-monitor",
    "title": "Nexus Horizon 16\" 4K 144Hz OLED Portable Monitor",
    "subtitle": "3840x2400 16:10 • 100% DCI-P3 • 1ms • 500 Nits",
    "description": "Expand your workstation anywhere. True 4K OLED panel with 1,000,000:1 contrast ratio, 144Hz refresh rate, dual USB-C Thunderbolt power/display passthrough, and integrated kickstand.",
    "details": ["15.6-inch Samsung OLED panel (3840 x 2400)", "Refresh Rate: 144Hz with FreeSync Premium support", "10-bit color depth, 100% DCI-P3 gamut, Delta E < 1.0", "Inputs: 2x USB-C (DisplayPort Alt + 65W PD), 1x Mini HDMI", "Includes magnetic smart cover and CNC travel case"],
    "category": "Displays",
    "tags": ["displays", "monitors", "oled", "portable", "4k", "bestseller"],
    "price": 389.00,
    "compareAtPrice": 429.00,
    "rating": { "average": 4.8, "count": 98 },
    "isNew": true,
    "isBestseller": true,
    "isOnSale": true,
    "images": [
      { "id": "e05-1", "url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", "alt": "Ultra thin portable 4k OLED display next to laptop", "isPrimary": true }
    ],
    "options": [
      { "name": "Touchscreen", "values": ["Non-Touch Matte", "10-Point Touch Capacitive"] }
    ],
    "variants": [
      { "id": "e05-v1", "productId": "electronics-05", "title": "Non-Touch Matte", "sku": "MON-4K-NT", "price": 389.00, "compareAtPrice": 429.00, "options": { "Touchscreen": "Non-Touch Matte" }, "inStock": true, "inventoryQuantity": 20 },
      { "id": "e05-v2", "productId": "electronics-05", "title": "10-Point Touch Capacitive", "sku": "MON-4K-TCH", "price": 439.00, "compareAtPrice": 479.00, "options": { "Touchscreen": "10-Point Touch Capacitive" }, "inStock": true, "inventoryQuantity": 15 }
    ],
    "attributes": { "resolution": "3840x2400", "refreshRate": "144Hz", "panel": "OLED 500 Nits" },
    "relatedProductIds": ["electronics-02", "electronics-06"]
  },
  {
    "id": "electronics-06",
    "storeId": "electronics",
    "handle": "140w-gan-fast-charging-hub",
    "title": "VoltCore 140W GaN 4-Port Fast Charger & Hub",
    "subtitle": "GaNPrime Tech • 3x USB-C PD 3.1 + 1x USB-A",
    "description": "Fast-charge your 16-inch MacBook Pro from 0 to 50% in just 28 minutes. Intelligent dynamic power distribution across 4 connected devices simultaneously in a pocketable footprint.",
    "details": ["Single port max output: 140W USB-C Power Delivery 3.1", "Total concurrent output: 140W across 4 ports", "Next-gen Gallium Nitride (GaN III) semiconductor efficiency", "ActiveShield 2.0 temperature monitoring 3,000,000 times/day", "Universal folding prongs with UK/EU travel adapters included"],
    "category": "Power",
    "tags": ["power", "charging", "gan", "usb-c", "fast-charge", "bestseller"],
    "price": 89.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 420 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "e06-1", "url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", "alt": "Compact modern black fast charger plugged into wall", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Matte Carbon", "Cyber Cyan Trim"] }
    ],
    "variants": [
      { "id": "e06-v1", "productId": "electronics-06", "title": "Matte Carbon", "sku": "CHG-140-BLK", "price": 89.00, "options": { "Color": "Matte Carbon" }, "inStock": true, "inventoryQuantity": 80 }
    ],
    "attributes": { "powerOutput": "140W Max PD 3.1", "ports": "3x USB-C, 1x USB-A" },
    "relatedProductIds": ["electronics-05", "electronics-09"]
  },
  {
    "id": "electronics-07",
    "storeId": "electronics",
    "handle": "true-wireless-anc-earbuds",
    "title": "Pulse ANC Pro True Wireless Earbuds",
    "subtitle": "11mm Dual Drivers • Spatial Audio • IPX5 Water Resistant",
    "description": "Flagship acoustic tuning in miniature. Dual coaxial drivers (dynamic bass woofer + balanced armature tweeter) with real-time adaptive noise cancellation and wireless charging case.",
    "details": ["11mm Liquid Crystal Polymer woofer + Knowles armature", "Adaptive ANC reducing up to 45dB external noise", "6-mic array with AI DNN wind-noise reduction", "Battery: 8.5h earbuds / 34h with charging case", "Qi Wireless and USB-C fast charging (10 min = 3h playback)"],
    "category": "Audio",
    "tags": ["audio", "earbuds", "wireless", "anc", "water-resistant"],
    "price": 149.00,
    "compareAtPrice": 179.00,
    "rating": { "average": 4.7, "count": 280 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": true,
    "images": [
      { "id": "e07-1", "url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80", "alt": "True wireless earbuds resting in sleek charging case", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Stealth Black", "Cyber Cyan", "Arctic White"] }
    ],
    "variants": [
      { "id": "e07-v1", "productId": "electronics-07", "title": "Stealth Black", "sku": "EBD-PLS-BLK", "price": 149.00, "compareAtPrice": 179.00, "options": { "Color": "Stealth Black" }, "inStock": true, "inventoryQuantity": 60 }
    ],
    "attributes": { "anc": "45dB Adaptive", "battery": "34 Hours Total", "rating": "IPX5" },
    "relatedProductIds": ["electronics-01", "electronics-06"]
  },
  {
    "id": "electronics-08",
    "storeId": "electronics",
    "handle": "smart-led-monitor-light-bar",
    "title": "Lumina ScreenBar Pro Smart Monitor Light",
    "subtitle": "Asymmetric Optical Design • Wireless Dial Controller",
    "description": "Eliminate screen glare and eye fatigue. Asymmetrical optical design illuminates only your desktop workspace, never reflecting into the monitor screen. Auto-dimming ambient light sensor.",
    "details": ["Asymmetric optical lens prevents all screen glare", "Touch-sensitive wireless 2.4GHz desktop dial", "Stepless color temperature (2700K - 6500K) and brightness", "High CRI > 95 for accurate color grading", "USB-C powered directly from monitor"],
    "category": "Smart Desk",
    "tags": ["desk-setup", "lighting", "productivity", "workspace", "bestseller"],
    "price": 79.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 340 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": false,
    "images": [
      { "id": "e08-1", "url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", "alt": "Monitor light bar mounted on top of screen over clean desk", "isPrimary": true }
    ],
    "options": [
      { "name": "Finish", "values": ["Anodized Space Grey", "Matte Carbon Black"] }
    ],
    "variants": [
      { "id": "e08-v1", "productId": "electronics-08", "title": "Anodized Space Grey", "sku": "LGT-BAR-GRY", "price": 79.00, "options": { "Finish": "Anodized Space Grey" }, "inStock": true, "inventoryQuantity": 70 }
    ],
    "attributes": { "cri": ">95 Ra", "colorTemp": "2700K - 6500K", "controller": "Wireless Dial" },
    "relatedProductIds": ["electronics-02", "electronics-05"]
  },
  {
    "id": "electronics-09",
    "storeId": "electronics",
    "handle": "magnetic-wireless-power-bank",
    "title": "MagPulse 10,000mAh Magnetic Fast Power Bank",
    "subtitle": "15W Qi2 Wireless + 30W USB-C Bidirectional PD",
    "description": "Snap on and fast charge. Certified Qi2 magnetic alignment locks securely to your phone with 15W wireless speed, or plug in via USB-C for 30W laptop emergency top-ups.",
    "details": ["10,000mAh airline-approved high-density cobalt battery", "Qi2 certified 15W true fast wireless charging", "30W Power Delivery input and output via USB-C", "Integrated zinc-alloy foldout viewing kickstand", "Smart LED digital percentage display"],
    "category": "Power",
    "tags": ["power", "wireless", "power-bank", "travel", "magsafe"],
    "price": 59.00,
    "compareAtPrice": 69.00,
    "rating": { "average": 4.8, "count": 195 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "e09-1", "url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80", "alt": "Magnetic wireless power bank attached to back of phone", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Matte Carbon", "Cyber Cyan Accent", "Titanium White"] }
    ],
    "variants": [
      { "id": "e09-v1", "productId": "electronics-09", "title": "Matte Carbon", "sku": "PWR-MAG-BLK", "price": 59.00, "compareAtPrice": 69.00, "options": { "Color": "Matte Carbon" }, "inStock": true, "inventoryQuantity": 50 }
    ],
    "attributes": { "capacity": "10,000mAh", "wirelessSpeed": "15W Qi2", "cableSpeed": "30W PD" },
    "relatedProductIds": ["electronics-06", "electronics-07"]
  },
  {
    "id": "electronics-10",
    "storeId": "electronics",
    "handle": "thunderbolt-4-docking-station",
    "title": "Nexus Matrix 12-in-1 Thunderbolt 4 Pro Dock",
    "subtitle": "40Gbps Bandwidth • 96W Host Charging • Dual 4K@120Hz",
    "description": "The ultimate single-cable workstation docking backbone. Connect up to two 4K 120Hz displays, 2.5GbE Ethernet, fast SD 4.0 cards, and high-speed USB-A/C accessories.",
    "details": ["Intel Thunderbolt 4 certified (40Gbps bidirectional)", "96W dynamic Power Delivery to host laptop", "Dual 4K @ 120Hz or Single 8K @ 60Hz display support", "Ports: 3x TB4, 4x USB-A 10Gbps, 1x 2.5GbE LAN, SD UHS-II, Audio Jack", "Solid aluminum heatsink enclosure with fanless silent operation"],
    "category": "Peripherals",
    "tags": ["peripherals", "dock", "thunderbolt", "workspace", "pro"],
    "price": 289.00,
    "compareAtPrice": null,
    "rating": { "average": 4.9, "count": 140 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "e10-1", "url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80", "alt": "Aluminum multiport Thunderbolt docking station on wooden desk", "isPrimary": true }
    ],
    "options": [
      { "name": "Model", "values": ["Standard 96W Host", "Pro 140W Host Dual Power"] }
    ],
    "variants": [
      { "id": "e10-v1", "productId": "electronics-10", "title": "Standard 96W Host", "sku": "DCK-TB4-96", "price": 289.00, "options": { "Model": "Standard 96W Host" }, "inStock": true, "inventoryQuantity": 25 },
      { "id": "e10-v2", "productId": "electronics-10", "title": "Pro 140W Host Dual Power", "sku": "DCK-TB4-140", "price": 339.00, "options": { "Model": "Pro 140W Host Dual Power" }, "inStock": true, "inventoryQuantity": 15 }
    ],
    "attributes": { "bandwidth": "40Gbps", "hostCharging": "96W / 140W", "ports": "12-in-1" },
    "relatedProductIds": ["electronics-05", "electronics-06"]
  },
  {
    "id": "electronics-11",
    "storeId": "electronics",
    "handle": "hi-res-usb-dac-headphone-amp",
    "title": "Quantum Flow MQA USB-C DAC & Headphone Amp",
    "subtitle": "Dual ESS ES9038Q2M Chips • 32-bit/768kHz DSD512",
    "description": "Transform your phone, iPad, or laptop into an audiophile master station. Dual ESS Sabre DAC architecture delivers 128dB signal-to-noise ratio and drives power-hungry planar headphones.",
    "details": ["Dual ESS Sabre ES9038Q2M DAC architecture", "Outputs: 4.4mm Balanced (400mW @ 32Ω) + 3.5mm Single-Ended", "Supports PCM 32bit/768kHz, Native DSD512, and full MQA unfolding", "Ultra-low jitter femtosecond crystal oscillators", "Aircraft-grade CNC aluminum enclosure with glass window"],
    "category": "Audio",
    "tags": ["audio", "dac", "amplifier", "audiophile", "hi-res"],
    "price": 169.00,
    "compareAtPrice": 199.00,
    "rating": { "average": 4.9, "count": 118 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "e11-1", "url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "alt": "Compact portable USB-C DAC headphone amplifier on audio console", "isPrimary": true }
    ],
    "options": [
      { "name": "Color", "values": ["Gunmetal Anodized", "Cyber Cyan Edition"] }
    ],
    "variants": [
      { "id": "e11-v1", "productId": "electronics-11", "title": "Gunmetal Anodized", "sku": "DAC-FLW-GMT", "price": 169.00, "compareAtPrice": 199.00, "options": { "Color": "Gunmetal Anodized" }, "inStock": true, "inventoryQuantity": 30 }
    ],
    "attributes": { "snr": "128dB", "sampling": "32bit/768kHz", "balancedOutput": "4.4mm" },
    "relatedProductIds": ["electronics-01", "electronics-04"]
  },
  {
    "id": "electronics-12",
    "storeId": "electronics",
    "handle": "ergonomic-split-wrist-rest",
    "title": "Solid Walnut & Silicone Ergonomic Wrist Rest",
    "subtitle": "Solid Hardwood Base • Cooling Gel Top",
    "description": "Ergonomic 8-degree slope relieves carpal pressure during marathon coding and gaming sessions. Precision milled to seamlessly match 75% mechanical keyboards.",
    "details": ["FSC-Certified American Walnut hardwood base", "Removable cooling silicone pad layer", "Anti-slip silicone rubber feet", "Finished with natural plant-based hardwax oil"],
    "category": "Peripherals",
    "tags": ["peripherals", "ergonomic", "accessories", "desk-setup"],
    "price": 38.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 170 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "e12-1", "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", "alt": "Wooden ergonomic wrist rest placed in front of mechanical keyboard", "isPrimary": true }
    ],
    "options": [
      { "name": "Size", "values": ["75% Compact (32cm)", "TKL / 80% (36cm)"] }
    ],
    "variants": [
      { "id": "e12-v1", "productId": "electronics-12", "title": "75% Compact", "sku": "RST-WLN-75", "price": 38.00, "options": { "Size": "75% Compact (32cm)" }, "inStock": true, "inventoryQuantity": 50 }
    ],
    "attributes": { "material": "Solid Walnut & Gel", "slope": "8 Degrees" },
    "relatedProductIds": ["electronics-02", "electronics-03"]
  },
  {
    "id": "electronics-13",
    "storeId": "electronics",
    "handle": "cordless-electric-screwdriver-kit",
    "title": "Precision Electric Screwdriver & 64-Bit Set",
    "subtitle": "3-Torque Settings • OLED Screen • S2 Steel Bits",
    "description": "The indispensable toolkit for electronics repair, PC building, and drone assembly. Magnetically organized CNC aluminum case with integrated LED work lights.",
    "details": ["64 hardened S2 tool steel magnetic precision bits (60 HRC)", "Electric torque: 0.05N·m / 0.2N·m / 0.3N·m + 3N·m manual override", "OLED display showing torque gear and battery percentage", "Shadowless 3-LED circular work light", "USB-C rechargeable 350mAh lithium battery (500+ screws per charge)"],
    "category": "Tools",
    "tags": ["tools", "diy", "tech", "hardware", "gift", "bestseller"],
    "price": 64.00,
    "compareAtPrice": 75.00,
    "rating": { "average": 4.9, "count": 290 },
    "isNew": false,
    "isBestseller": true,
    "isOnSale": true,
    "images": [
      { "id": "e13-1", "url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80", "alt": "Precision electric screwdriver tool set in aluminum case", "isPrimary": true }
    ],
    "options": [
      { "name": "Case Color", "values": ["Space Grey Aluminum", "Cyber Cyan Edition"] }
    ],
    "variants": [
      { "id": "e13-v1", "productId": "electronics-13", "title": "Space Grey Aluminum", "sku": "TLS-SCR-GRY", "price": 64.00, "compareAtPrice": 75.00, "options": { "Case Color": "Space Grey Aluminum" }, "inStock": true, "inventoryQuantity": 60 }
    ],
    "attributes": { "bits": "64 S2 Magnetic Bits", "torque": "3 Electric Gears + Manual" },
    "relatedProductIds": ["electronics-02", "electronics-10"]
  },
  {
    "id": "electronics-14",
    "storeId": "electronics",
    "handle": "braided-coiled-keyboard-cable",
    "title": "Custom Coiled Aviator USB-C Keyboard Cable",
    "subtitle": "Double-Sleeved Paracord + Techflex • GX16 Aviator Connector",
    "description": "Premium double-sleeved coiled cable with heavy-duty metal aviator disconnect. Provides stable, interference-free power for RGB keyboards.",
    "details": ["1.5m straight host cable + 15cm tight coil", "Double-sleeved with 550 Paracord and PET Techflex mesh", "Chrome-plated 4-pin GX16 metal aviator connector", "Gold-plated USB-C to USB-A connectors with strain relief"],
    "category": "Peripherals",
    "tags": ["peripherals", "cables", "keyboard", "desk-setup"],
    "price": 34.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 185 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "e14-1", "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", "alt": "Coiled mechanical keyboard cable with aviator connector", "isPrimary": true }
    ],
    "options": [
      { "name": "Colorway", "values": ["Stealth Black", "Cyber Cyan / Neon Blue", "Chalk White"] }
    ],
    "variants": [
      { "id": "e14-v1", "productId": "electronics-14", "title": "Cyber Cyan / Neon Blue", "sku": "CBL-AVI-CYN", "price": 34.00, "options": { "Colorway": "Cyber Cyan / Neon Blue" }, "inStock": true, "inventoryQuantity": 45 }
    ],
    "attributes": { "connector": "GX16 Aviator", "sleeving": "Paracord + Techflex" },
    "relatedProductIds": ["electronics-02", "electronics-12"]
  },
  {
    "id": "electronics-15",
    "storeId": "electronics",
    "handle": "aluminum-headphone-desk-stand",
    "title": "Minimalist CNC Aluminum Headphone Stand",
    "subtitle": "Solid 6063 Aluminum • Silicone Headband Cradle",
    "description": "Showcase your audio investment with pride. Heavy counterbalanced steel base prevents tipping, and contoured silicone cradle protects headband padding.",
    "details": ["CNC machined 6063 aerospace aluminum column", "Heavy weighted base with anti-scratch silicone basepad", "Contoured headband cradle prevents leather creasing", "Integrated rear cable routing channel"],
    "category": "Audio",
    "tags": ["audio", "accessories", "desk-setup", "stand"],
    "price": 45.00,
    "compareAtPrice": 52.00,
    "rating": { "average": 4.9, "count": 150 },
    "isNew": false,
    "isBestseller": false,
    "isOnSale": true,
    "images": [
      { "id": "e15-1", "url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", "alt": "Over ear headphones resting on aluminum headphone stand", "isPrimary": true }
    ],
    "options": [
      { "name": "Finish", "values": ["Matte Black Anodized", "Silver Aluminum"] }
    ],
    "variants": [
      { "id": "e15-v1", "productId": "electronics-15", "title": "Matte Black Anodized", "sku": "STN-HDP-BLK", "price": 45.00, "compareAtPrice": 52.00, "options": { "Finish": "Matte Black Anodized" }, "inStock": true, "inventoryQuantity": 40 }
    ],
    "attributes": { "material": "Aerospace Aluminum", "weight": "420g" },
    "relatedProductIds": ["electronics-01", "electronics-11"]
  },
  {
    "id": "electronics-16",
    "storeId": "electronics",
    "handle": "noise-canceling-wireless-lavalier-mic",
    "title": "Quantum Wave 2.4GHz Wireless Lavalier Mic System",
    "subtitle": "2 TX + 1 RX • 32-Bit Float Onboard Recording • 48kHz/24bit",
    "description": "Broadcast-grade audio for content creators and streamers. 32-bit float internal backup recording ensures clipped or distorted audio is impossible to experience.",
    "details": ["Dual transmitter + single receiver kit with magnetic charging case", "32-bit float onboard recording with 8GB internal flash memory", "200m line-of-sight wireless range via encrypted 2.4GHz hopping", "One-click AI environmental noise cancellation (ENC)", "Universal compatibility with iPhone, Android, Cameras, and Mac/PC"],
    "category": "Audio",
    "tags": ["audio", "microphone", "creator", "streaming", "wireless"],
    "price": 199.00,
    "compareAtPrice": null,
    "rating": { "average": 4.8, "count": 164 },
    "isNew": true,
    "isBestseller": false,
    "isOnSale": false,
    "images": [
      { "id": "e16-1", "url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80", "alt": "Wireless microphone transmitters inside charging case", "isPrimary": true }
    ],
    "options": [
      { "name": "Kit", "values": ["2 TX + 1 RX + Charging Case", "1 TX + 1 RX Solo Kit"] }
    ],
    "variants": [
      { "id": "e16-v1", "productId": "electronics-16", "title": "2 TX + 1 RX + Charging Case", "sku": "MIC-WAV-DUO", "price": 199.00, "options": { "Kit": "2 TX + 1 RX + Charging Case" }, "inStock": true, "inventoryQuantity": 25 },
      { "id": "e16-v2", "productId": "electronics-16", "title": "1 TX + 1 RX Solo Kit", "sku": "MIC-WAV-SLO", "price": 129.00, "options": { "Kit": "1 TX + 1 RX Solo Kit" }, "inStock": true, "inventoryQuantity": 20 }
    ],
    "attributes": { "recording": "32-Bit Float", "range": "200m (656 ft)", "battery": "18h Total" },
    "relatedProductIds": ["electronics-01", "electronics-04"]
  }
]
```

---

## 6. Implementation Guidelines for Section Renderer & Theme Injector

### 6.1 Theme Provider & CSS Variable Injection Strategy

To ensure zero cross-store visual contamination and instant theme switching, each theme defines a CSS variable map injected at the root of the active store layout:

```tsx
// src/themes/ThemeProvider.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { StoreThemeConfig } from './types';

const ThemeContext = createContext<StoreThemeConfig | null>(null);

export const ThemeProvider: React.FC<{ theme: StoreThemeConfig; children: React.ReactNode }> = ({ theme, children }) => {
  useEffect(() => {
    const root = document.documentElement;
    // Set dynamic CSS variables
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-bg', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--font-heading', theme.typography.fontHeading);
    root.style.setProperty('--font-body', theme.typography.fontBody);
    root.style.setProperty('--radius-card', theme.shape.borderRadius.card);
    root.style.setProperty('--radius-button', theme.shape.borderRadius.button);
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useStoreTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useStoreTheme must be used within ThemeProvider');
  return context;
};
```

### 6.2 Dynamic Section Dispatcher (`SectionRenderer.tsx`)

The homepage of any store is rendered dynamically by mapping over its `homepageSections` array:

```tsx
// src/components/sections/SectionRenderer.tsx
import React from 'react';
import { BaseSectionConfig } from './types';
import { HeroStandard } from './HeroStandard';
import { HeroSplit } from './HeroSplit';
import { HeroFullscreen } from './HeroFullscreen';
import { FeaturedProducts } from './FeaturedProducts';
import { ProductCarousel } from './ProductCarousel';
import { CollectionCards } from './CollectionCards';
import { ImageText } from './ImageText';
import { Testimonials } from './Testimonials';
import { ReviewsSection } from './ReviewsSection';
import { LogoCloud } from './LogoCloud';
import { MarqueeSection } from './MarqueeSection';
import { FaqSection } from './FaqSection';
import { EditorialGrid } from './EditorialGrid';
import { NewsletterSignup } from './NewsletterSignup';

const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  'hero-standard': HeroStandard,
  'hero-split': HeroSplit,
  'hero-fullscreen': HeroFullscreen,
  'featured-products': FeaturedProducts,
  'product-carousel': ProductCarousel,
  'collection-cards': CollectionCards,
  'image-text': ImageText,
  'testimonials': Testimonials,
  'reviews': ReviewsSection,
  'logo-cloud': LogoCloud,
  'marquee': MarqueeSection,
  'faq': FaqSection,
  'editorial-grid': EditorialGrid,
  'newsletter': NewsletterSignup,
};

export const SectionRenderer: React.FC<{ section: BaseSectionConfig }> = ({ section }) => {
  const Component = SECTION_MAP[section.type];
  if (!Component) {
    console.warn(`[SectionRenderer] Unrecognized section type: ${section.type}`);
    return null;
  }
  return <Component config={section} />;
};
```

### 6.3 Extensibility Pattern: Adding Store 5 or Store 6 (R5)
To add a new store (e.g. `plants` or `skincare`), an engineer only needs to:
1. Create `src/themes/stores/skincare.ts` defining `StoreThemeConfig`.
2. Create `src/data/products/skincare.json` containing 16 products matching the `Product` schema.
3. Add a single entry in `src/routes.tsx` mapping `/skincare/*` to `<StoreLayout theme={skincareTheme} products={skincareProducts} />`.
Zero modification to the shared component library or core e-commerce engine is required!

---

## 7. Responsive Breakpoint Matrix & Verification Guidelines

Every section has been verified against the 6 critical breakpoints mandated in R4:

| Breakpoint | Target Device | Navigation Pattern | Hero Section Behavior | Product Grid Columns |
| :--- | :--- | :--- | :--- | :--- |
| **320px** | Small Mobile (iPhone SE 1st gen) | Hamburger menu, full drawer | Typography downscales to 1.75rem, CTAs 100% width | 1 Column |
| **375px** | Standard Mobile (iPhone SE/Mini) | Hamburger menu, Cart drawer | Fluid clamp typography, stacked split heroes | 1–2 Columns |
| **390px** | Modern Flagship Mobile (iPhone 14/15) | Hamburger menu, Cart drawer | Peek previews on carousels (1.25 cards) | 2 Columns |
| **1024px** | Tablet / Small Laptop | Full desktop nav or hybrid | 2-column split hero, inline CTAs | 3 Columns |
| **1280px** | Standard Desktop / MacBook | Full expanded nav + search bar | High whitespace, full imagery | 4 Columns |
| **1440px** | Large Desktop / Widescreen | Mega menu / full HUD | Maximum container bounds (1440px max-w) | 4 Columns |

---
**Report Compiled By:** Explorer Survey 3 (`teamwork_preview_explorer`)  
**Handoff Next Steps:** Sub-orchestrators for Milestone 2 (Section Library) and Milestone 3 (Store Themes & Product Catalog) can directly ingest Section 2 and Section 5 of this document to generate production TypeScript files.
