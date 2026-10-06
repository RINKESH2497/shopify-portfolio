# Dispatch: Worker M4 (Store Catalogs, Themes & StoreRegistry Implementation)

## Context & Assignment
- Project: Shopify Portfolio Multi-Store E-Commerce Platform
- Working Directory: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/worker_m4
- Project Root: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio
- Authoritative User Request: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
- Scope Document: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/PROJECT.md
- Resume Guide: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/CONTINUE_FROM_HERE.md
- Types: `src/types/store.ts`, `src/types/theme.ts`, `src/types/product.ts`, `src/types/section.ts`

## Mandatory Tasks
Implement the complete Milestone 4 in `src/stores/`:
1. **Coffee Store (`src/stores/coffee/`)**:
   - `theme.ts`: "Terroir & Roast" theme config. Palette: Warm earthy `#2C1810` primary, Fraunces heading, Plus Jakarta Sans body, `rounded-2xl`, cardStyle: `flat`, headerStyle: `centered`, heroVariant: `split`.
   - `products.ts`: Exactly 16 curated realistic coffee products with variants (grind, weight), compareAtPrice on select items, tags, descriptions, ratings, Unsplash coffee image URLs with descriptive altText.
   - `index.ts`: Store export.
2. **Fashion Store (`src/stores/fashion/`)**:
   - `theme.ts`: "Atelier Noir" theme config. Palette: Monochrome `#0A0A0A` primary, Syne heading, Inter body, `rounded-none`, cardStyle: `bordered`, headerStyle: `left-aligned`, heroVariant: `fullscreen`.
   - `products.ts`: Exactly 16 curated realistic fashion apparel products with variants (size, color), compareAtPrice, tags, descriptions, ratings, Unsplash fashion image URLs with descriptive altText.
   - `index.ts`: Store export.
3. **Jewelry Store (`src/stores/jewelry/`)**:
   - `theme.ts`: "L'Étoile Joaillerie" theme config. Palette: Champagne gold `#C5A059` primary, Cormorant Garamond heading, Montserrat body, `rounded-md`, cardStyle: `elevated`, headerStyle: `transparent-overlay`, heroVariant: `standard`.
   - `products.ts`: Exactly 16 curated realistic jewelry products with variants (metal, ring size, gem), compareAtPrice, tags, descriptions, ratings, Unsplash jewelry image URLs with descriptive altText.
   - `index.ts`: Store export.
4. **Electronics Store (`src/stores/electronics/`)**:
   - `theme.ts`: "Nexus Tech" theme config. Palette: Cyber cyan `#00E5FF` primary, Space Grotesk heading, Inter/JetBrains Mono body, `rounded-sm`, cardStyle: `glassmorphic`, headerStyle: `tech-hud`, heroVariant: `split`.
   - `products.ts`: Exactly 16 curated realistic gadget products with variants (storage, finish), specifications, compareAtPrice, tags, descriptions, ratings, Unsplash tech image URLs with descriptive altText.
   - `index.ts`: Store export.
5. **StoreRegistry & Master Exports (`src/stores/registry.ts`, `src/stores/index.ts`)**:
   - Registry providing `getAllStores()`, `getStoreConfig(id)`, `getStoreProducts(id)`, `isValidStoreId(id)`, `DEFAULT_STORE_ID = 'coffee'`.
6. **Documentation (`ARCHITECTURE.md`)**:
   - Create `ARCHITECTURE.md` at project root documenting architecture and the 3-step store addition guide.
7. **Verification**:
   - Run `npx tsc --noEmit` -> verify 0 errors, exit code 0.
   - Run `npm run build` -> verify exit code 0.
   - Run `npm test` -> verify exit code 0.
   - Run `npm run test:e2e` -> verify exit code 0.
8. Deliver handoff report to `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/worker_m4/handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A forensic auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
