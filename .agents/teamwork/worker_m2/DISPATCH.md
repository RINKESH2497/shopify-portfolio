# Dispatch: Worker M2 (E-Commerce Engine & State Implementation)

## Context & Assignment
- Project: Shopify Portfolio Multi-Store E-Commerce Platform
- Working Directory: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/worker_m2
- Project Root: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio
- Authoritative User Request: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
- Scope Document: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/PROJECT.md
- Resume Guide: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/CONTINUE_FROM_HERE.md
- Test Infra: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/TEST_INFRA.md

## Technical Blueprints from Explorers (Read these carefully):
1. `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m2_1/handoff.md` (CartContext, WishlistContext, CheckoutContext)
2. `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m2_2/handoff.md` (ThemeContext, SearchContext, StoreContext)
3. `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m2_3/handoff.md` (AccountContext, ShopifyEngineProvider, TS6133 fix instructions)

## Mandatory Tasks
1. **Fix TS6133 Unused React Imports in Common Component Tests**:
   - In `src/components/common/__tests__/Drawer.test.tsx` line 2 and `src/components/common/__tests__/Modal.test.tsx` line 2, change:
     `import React, { act, useState } from 'react';` -> `import { act, useState } from 'react';`
2. **Implement `src/engine/StoreContext.tsx`**:
   - Provide `StoreContext`, `StoreProvider`, `useStore()`.
   - Manage active `storeId`, active `storeConfig`, catalog lookup (`products`, `collections`).
   - Query helpers: `getProductByHandle(handle)`, `getProductsByCategory(category)`, `getRelatedProducts(productId, category)`.
3. **Implement `src/engine/ThemeContext.tsx`**:
   - Provide `ThemeContext`, `ThemeProvider`, `useTheme()`.
   - Dynamic injection of CSS custom properties into `:root` (`--color-primary`, `--color-background`, `--border-radius`, etc.) with cleanup on unmount/change.
4. **Implement `src/engine/CartContext.tsx`**:
   - Provide `CartContext`, `CartProvider`, `useCart()`.
   - Line items keyed by `${productId}-${variantId}`.
   - Operations: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
   - Float-safe financial calculations (`subtotal`, `shipping`, `freeShippingThreshold`, `freeShippingProgress` [0-100], `total`).
   - Namespaced LocalStorage persistence via `createStoreStorage(storeId)` and cross-tab sync.
   - Drawer toggle: `isCartOpen`, `setIsCartOpen`.
5. **Implement `src/engine/WishlistContext.tsx`**:
   - Provide `WishlistContext`, `WishlistProvider`, `useWishlist()`.
   - Add/remove/toggle/has operations, persistence via `createStoreStorage(storeId)`, and `moveToCart` workflow.
6. **Implement `src/engine/SearchContext.tsx`**:
   - Provide `SearchContext`, `SearchProvider`, `useSearch()`.
   - Diacritic-insensitive search via `normalizeForSearch` from `src/utils/formatters.ts`.
   - Handling isolated combining marks safely.
   - Recent searches persistence via `createStoreStorage(storeId)`.
   - Modal controls: `isOpen`, `setIsOpen`, query, results, no-results state.
7. **Implement `src/engine/AccountContext.tsx`**:
   - Provide `AccountContext`, `AccountProvider`, `useAccount()`.
   - Demo profile, saved addresses with single-default invariant, simulated order history, demo notice state.
8. **Implement `src/engine/CheckoutContext.tsx`**:
   - 4-step state machine (`information` -> `shipping` -> `payment` -> `confirmation`).
   - Demo banner and indicators, validation, order generation (`DEMO-ORD-...`), cart clearing on complete.
9. **Implement `src/engine/index.ts`**:
   - Export all contexts, hooks, types, and the composite `ShopifyEngineProvider`.
10. **Add Unit/Integration Tests for Engine**:
    - Add comprehensive tests in `src/engine/__tests__/engine.test.tsx`.
11. **Verification**:
    - Run `npx tsc --noEmit` and `npm run build` to verify exit code 0.
    - Run `npm test` and `npm run test:e2e` (`node tests/test-runner.js`) to verify all tests pass.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-10-06T04:15:02Z
Worker M2 dispatched to implement Milestone 2: E-Commerce Engine State.
Write boundaries:
- src/components/common/__tests__/Drawer.test.tsx
- src/components/common/__tests__/Modal.test.tsx
- src/engine/StoreContext.tsx
- src/engine/ThemeContext.tsx
- src/engine/CartContext.tsx
- src/engine/WishlistContext.tsx
- src/engine/SearchContext.tsx
- src/engine/AccountContext.tsx
- src/engine/CheckoutContext.tsx
- src/engine/index.ts
- src/engine/__tests__/engine.test.tsx
