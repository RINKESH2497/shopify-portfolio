# Dispatch: Explorer M3-1 (Hero and Layout Section Architect)

## Context & Assignment
- Project: Shopify Portfolio Multi-Store E-Commerce Platform
- Working Directory: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_1
- Project Root: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio
- Authoritative User Request: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
- Scope Document: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/PROJECT.md
- Resume Guide: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/CONTINUE_FROM_HERE.md
- Section Types: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/src/types/section.ts

## Objective
Investigate and design technical blueprints for the Hero and Layout sections:
1. `HeroStandard` (`src/sections/hero/HeroStandard.tsx`):
   - Centered luxury / crest layout conforming to `HeroStandardSettings`.
   - Heading, subheading, eyebrow, primary & secondary CTAs, background image with overlay opacity (0.0-1.0), text alignment (left, center, right), optional crest image and badge.
   - Dynamic theme styling using CSS custom properties (`--font-heading`, `--font-body`, `--color-primary`, etc.).
2. `HeroSplit` (`src/sections/hero/HeroSplit.tsx`):
   - 50-50 storytelling & featured product layout conforming to `HeroSplitSettings`.
   - Image on left or right, copy, CTAs, optional statistics display, and featured product badge/link.
3. `HeroFullscreen` (`src/sections/hero/HeroFullscreen.tsx`):
   - 100vh cinematic image or video banner conforming to `HeroFullscreenSettings`.
   - Overlay opacity, text position (bottom-left, center, bottom-center), scroll indicator.
4. `ImageWithText` (`src/sections/media/ImageWithText.tsx`):
   - Alternating storytelling block conforming to `ImageWithTextSettings`.
   - Image left/right, eyebrow, heading, body, CTA, stat highlight.
5. `EditorialGrid` (`src/sections/media/EditorialGrid.tsx`):
   - Asymmetrical magazine-style image and content grid conforming to `EditorialGridSettings`.
   - Responsive multi-column layout with varying item spans (`col-span-1`, `col-span-2`, `col-span-3`, `row-span-2`).

## Requirements
- Full responsiveness from 320px to 1440px.
- Use `ImageWithFallback` from `src/components/common/ImageWithFallback.tsx`.
- Use `Button` from `src/components/common/Button.tsx`.
- Strictly zero `any` types.
- Deliver comprehensive handoff report to `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_1/handoff.md`.


## 2026-10-06T04:53:48Z
Received dispatch from parent orchestrator (89794ca8-9dce-460e-a4d8-ce255cb3f694).
Task: Investigate and produce a complete technical blueprint for Hero and Layout sections (HeroStandard, HeroSplit, HeroFullscreen, ImageWithText, EditorialGrid).
Handoff destination: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m3_1/handoff.md
