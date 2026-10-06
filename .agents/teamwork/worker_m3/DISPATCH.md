# Dispatch: Worker M3 (Section Library & SectionRenderer Implementation)

## Context & Assignment
- Project: Shopify Portfolio Multi-Store E-Commerce Platform
- Working Directory: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/worker_m3
- Project Root: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio
- Authoritative User Request: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
- Scope Document: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/PROJECT.md
- Resume Guide: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/CONTINUE_FROM_HERE.md
- Section Types: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/src/types/section.ts

## Technical Blueprints from Explorers (Read these carefully):
1. `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_1/handoff.md` (HeroStandard, HeroSplit, HeroFullscreen, ImageWithText, EditorialGrid)
2. `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_2/handoff.md` (ProductCard, FeaturedProducts, ProductCarousel, CollectionCards)
3. `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_3/handoff.md` (Testimonials, ReviewsBreakdown, LogoCloud, Marquee, NewsletterSignup, FaqAccordion, SectionRenderer, barrel exports)

## Mandatory Tasks
Implement the complete Milestone 3 Section Library & SectionRenderer:
1. **Hero Sections (`src/sections/hero/`)**:
   - `HeroStandard.tsx` (centered luxury / crest layout, background overlay, badges, CTAs)
   - `HeroSplit.tsx` (50-50 storytelling, featured product link, stats, alternating layout)
   - `HeroFullscreen.tsx` (100vh cinematic media, text positioning, scroll indicator)
2. **Product Sections (`src/sections/products/`)**:
   - `ProductCard.tsx` (reusable atom with dynamic theme skinning: flat, bordered, elevated, glassmorphic; quick-add to cart; wishlist toggle; badges)
   - `FeaturedProducts.tsx` (column grids 2/3/4, handle filtering, collection fallback)
   - `ProductCarousel.tsx` (touch/swipe scroll slider, arrow/dot controls, autoplay, keyboard accessible)
3. **Media Sections (`src/sections/media/`)**:
   - `CollectionCards.tsx` (aspect ratios, hover zoom, item count badge, collection links)
   - `ImageWithText.tsx` (alternating image layout, stat highlight, copy, CTAs)
   - `EditorialGrid.tsx` (asymmetrical magazine grid with col/row spans)
4. **Social & Content Sections (`src/sections/social/`, `src/sections/content/`)**:
   - `Testimonials.tsx` (quote cards, star ratings, customer avatars, grid/carousel)
   - `ReviewsBreakdown.tsx` (star distributions, percentages, rating bars, featured review)
   - `LogoCloud.tsx` (partner/press logos with grayscale hover, quotes, links)
   - `Marquee.tsx` (infinite continuous ticker with seamless duplication, speed/direction control)
   - `NewsletterSignup.tsx` (email validation, success/error feedback, persistence)
   - `FaqAccordion.tsx` (WAI-ARIA accessible expand/collapse, single/multi modes)
5. **SectionRenderer & Exports (`src/sections/`)**:
   - `SectionRenderer.tsx` (type-safe discriminated union registry for all 14 section types, error boundary, graceful fallback)
   - `index.ts` (barrel exports for all components and types)
6. **Unit Tests**:
   - Implement thorough tests in `src/sections/__tests__/sections.test.tsx` verifying rendering of all 14 section variants and SectionRenderer fallback.
7. **Verification**:
   - Run `npx tsc --noEmit` -> verify exit code 0.
   - Run `npm run build` -> verify clean production build with exit code 0.
   - Run `npm test` -> verify all unit tests pass with exit code 0.
   - Run `npm run test:e2e` -> verify 188/188 E2E tests pass with exit code 0.
8. Deliver handoff report to `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/worker_m3/handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
