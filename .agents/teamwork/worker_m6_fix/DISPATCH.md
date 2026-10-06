# Dispatch: Worker M6-Fix (Full Forensic Remediation & Production Build Engineer)

## Context & Assignment
- Project: Shopify Portfolio Multi-Store E-Commerce Platform
- Working Directory: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/worker_m6_fix
- Project Root: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio
- Authoritative User Request: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
- Scope Document: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/PROJECT.md
- Forensic Auditor Report: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/auditor_m6_1/handoff.md
- Explorer M6-Fix-1 Blueprint: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m6_fix_1/handoff.md
- Explorer M6-Fix-2 Blueprint: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m6_fix_2/handoff.md
- Explorer M6-Fix-3 Blueprint: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m6_fix_3/handoff.md

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership Boundaries
- `src/pages/CheckoutPage.tsx`
- `src/stores/registry.ts`
- `src/stores/index.ts`
- `src/engine/StoreContext.tsx`
- `src/engine/index.ts`
- `src/sections/__tests__/sections.test.tsx`
- `src/components/layout/SearchModal.tsx`
- `src/pages/ProductPage.tsx`
- `src/test-setup.ts` (or test configuration files if required)
- `README.md` (ensure project documentation is complete)

## Implementation Tasks
Execute the comprehensive remediation blueprints authored by the three Explorers:

1. **Eliminate All `any` Types in Production**:
   - In `src/pages/CheckoutPage.tsx` (lines 78 and 99), refactor `catch (err: any)` to `catch (err: unknown)` with safe error message extraction:
     `setError(err instanceof Error ? err.message : String(err));`
   - Verify that zero `any` types exist anywhere in `src/`.

2. **Bridge StoreRegistry to StoreContext (Extensibility Contract Fulfillment)**:
   - In `src/stores/registry.ts` and `src/stores/index.ts`, export `INITIAL_STORE_REGISTRY`.
   - In `src/engine/StoreContext.tsx`, import `INITIAL_STORE_REGISTRY`, `getStoreRegistry()`, `DEFAULT_STORE_ID` from `../stores/registry`. Replace hardcoded duplicate mock configs so that `INITIAL_STORE_REGISTRY` is the canonical source of truth for `DEFAULT_STORE_REGISTRY`.
   - In `src/engine/StoreContext.tsx`, implement dynamic registry resolution in `StoreProvider`: `const activeRegistry = useMemo(() => registry || getStoreRegistry(), [registry]);`.
   - In `src/engine/index.ts`, accept optional `registry?: StoreRegistry` in `ShopifyEngineProvider` and pass it to `StoreProvider`.

3. **Fix Section Unit Test Query Collisions**:
   - In `src/sections/__tests__/sections.test.tsx`:
     - Line 282: `expect(screen.getAllByText('Sold Out').length).toBeGreaterThan(0);`
     - Line 296: `expect(screen.getAllByText('Added').length).toBeGreaterThan(0);`
     - Line 374: `const carouselTrack = screen.getAllByRole('region', { name: 'Bestselling Reserves' })[1];`
   - If test matchers require `@testing-library/jest-dom`, import `'@testing-library/jest-dom/vitest'` or verify all assertions use standard Vitest/RTL matchers.

4. **Lifecycle Timer Cleanups (Zero Memory Leaks)**:
   - In `src/components/layout/SearchModal.tsx`, remove unused `import { cn }` and add `return () => clearTimeout(focusTimer)` in `useEffect([isOpen])`.
   - In `src/pages/ProductPage.tsx`, import `useRef`, track `addedTimeoutRef`, clear prior timer before scheduling in `handleAddToCart`, and add unmount cleanup effect.

5. **Clean Production Build & Verification**:
   - Pre-clean `dist/` directory.
   - Run verification commands:
     - `npx tsc --noEmit` (0 errors)
     - `npm run build` (clean Vite production bundle in `dist/assets/`, >350 KB JS)
     - `npm test` (all unit test suites passing)
     - `npm run test:e2e` (all 188 E2E test suites passing)
   - Ensure the compiled bundle in `dist/` contains all 4 store brand titles ("Terroir & Roast", "Atelier Noir", "L'Étoile Joaillerie", "Nexus Tech") and zero Milestone 1 placeholder scaffolding.

6. **Documentation**:
   - Ensure `README.md` and `ARCHITECTURE.md` are completely accurate and up to date.

Deliver your complete handoff report to `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/worker_m6_fix/handoff.md`.


## 2026-10-06T11:25:08Z
[Message] timestamp=2026-10-06T11:25:08Z sender=89794ca8-9dce-460e-a4d8-ce255cb3f694 priority=MESSAGE_PRIORITY_HIGH content=You are worker_m6_fix, an implementation worker agent (teamwork_preview_worker).
Your dedicated working directory is:
C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/worker_m6_fix
MANDATORY FIRST STEP:
Read the authoritative user request at:
C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
Also read PROJECT.md, ARCHITECTURE.md, auditor_m6_1/handoff.md, reviewer_m6_1/handoff.md, explorer_m6_fix_1/handoff.md, explorer_m6_fix_2/handoff.md, explorer_m6_fix_3/handoff.md, DISPATCH.md.
MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine.
Write boundaries:
- src/pages/CheckoutPage.tsx
- src/stores/registry.ts
- src/stores/index.ts
- src/engine/StoreContext.tsx
- src/engine/index.ts
- src/sections/__tests__/sections.test.tsx
- src/components/layout/SearchModal.tsx
- src/pages/ProductPage.tsx
- src/test-setup.ts
- README.md
