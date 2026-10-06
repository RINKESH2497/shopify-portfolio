# Dispatch: Explorer M3-2 (Product and Collection Section Architect)

## Context & Assignment
- Project: Shopify Portfolio Multi-Store E-Commerce Platform
- Working Directory: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_2
- Project Root: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio
- Authoritative User Request: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
- Scope Document: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/PROJECT.md
- Resume Guide: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/CONTINUE_FROM_HERE.md
- Section Types: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/src/types/section.ts

## Objective
Investigate and design technical blueprints for Product and Collection sections:
1. `FeaturedProducts` (`src/sections/products/FeaturedProducts.tsx`):
   - Grid layout conforming to `FeaturedProductsSettings` (columns: 2, 3, or 4; limit, view all link).
   - Fetching products from `useStore()` catalog or filtering by handles/collection.
   - Dynamic product card skinning based on store theme tokens (`cardStyle`: flat, bordered, elevated, glassmorphic; `borderRadius`).
   - Quick Add to Cart button triggering `useCart().addItem()` and opening drawer.
   - Wishlist toggle button triggering `useWishlist().toggleItem()`.
   - Badges (Sale, New, Sold Out) and price formatting via `formatPrice`.
2. `ProductCarousel` (`src/sections/products/ProductCarousel.tsx`):
   - Touch/swipe enabled horizontal product slider conforming to `ProductCarouselSettings`.
   - Navigation arrows, optional dot indicators, optional autoplay with interval, pause on hover.
   - Full keyboard accessibility (left/right arrow navigation) and responsive card widths.
3. `CollectionCards` (`src/sections/media/CollectionCards.tsx`):
   - Visual category grid conforming to `CollectionCardsSettings`.
   - Responsive 2, 3, or 4 columns, aspect ratio control (square, portrait, landscape).
   - Image overlay, hover zoom effects, item count badges, and links to collection pages (`/:storeId/collections/:handle`).

## Requirements
- Full responsiveness from 320px to 1440px.
- Use `useStore()`, `useCart()`, and `useWishlist()` from `src/engine/`.
- Strictly zero `any` types.
- Deliver comprehensive handoff report to `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_2/handoff.md`.

## 2026-10-06T04:53:48Z
You are explorer_m3_2, a read-only exploration agent (teamwork_preview_explorer).
Your dedicated working directory is:
C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_2

MANDATORY FIRST STEP:
Read the authoritative user request at:
C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
Also read:
- C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/PROJECT.md
- C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/CONTINUE_FROM_HERE.md
- C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/src/types/section.ts
- C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_2/DISPATCH.md

Your mission:
Investigate and produce a complete technical blueprint for Product and Collection sections:
1. FeaturedProducts (src/sections/products/FeaturedProducts.tsx)
2. ProductCarousel (src/sections/products/ProductCarousel.tsx)
3. CollectionCards (src/sections/media/CollectionCards.tsx)
Integrate with useStore(), useCart(), and useWishlist() from src/engine/, apply dynamic card styles (flat, bordered, elevated, glassmorphic), support touch/swipe and arrow navigation on carousel, ensure zero any types, and support full responsiveness from 320px to 1440px.
You are strictly read-only: do NOT modify source files.
Write your complete handoff report to:
C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_2/handoff.md
Send a completion message back to the orchestrator once your report is written.
