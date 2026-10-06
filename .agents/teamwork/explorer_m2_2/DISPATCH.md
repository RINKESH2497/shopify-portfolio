# Dispatch: Explorer M2-2 (Theme, Search & Store Engine Architecture)

## Context & Assignment
- Project: Shopify Portfolio Multi-Store E-Commerce Platform
- Working Directory: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m2_2
- Project Root: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio
- Authoritative User Request: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
- Scope Document: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/PROJECT.md
- Resume Guide: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/CONTINUE_FROM_HERE.md
- Test Infra: C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/TEST_INFRA.md

## Objective
Investigate and design the exact technical blueprint for:
1. `ThemeContext` (`src/engine/ThemeContext.tsx`):
   - Dynamic CSS Custom Property injection into `:root` (document.documentElement.style.setProperty) based on active store `ThemeTokens` (`src/types/theme.ts`).
   - Injected variables: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--font-heading`, `--font-body`, `--radius-card`, `--radius-button`, etc.
   - Clean cleanup / switching when store changes.
2. `SearchContext` (`src/engine/SearchContext.tsx`):
   - Instant client-side index over store catalog (`Product[]`: title, description, tags, category).
   - Diacritic-insensitive searching using NFD Unicode normalization from `src/utils/formatters.ts` (`normalizeForSearch`).
   - Recent search query history persisted via `src/utils/storage.ts`.
   - Search overlay modal state management (`isOpen`, `setIsOpen`, `query`, `setQuery`, `results`, `isSearching`, `hasSearched`).
   - No-results feedback and suggested queries.
3. `StoreContext` (`src/engine/StoreContext.tsx`):
   - Active store configuration (`StoreConfig` from `src/types/store.ts`).
   - Active store product catalog (`Product[]`).
   - Helpers: `getProductByHandle(handle)`, `getProductsByCategory(category)`, `getRelatedProducts(productId, category)`.
   - Store switching logic and route sync.

## Guidelines
- Do NOT implement or edit source files. You are a read-only explorer.
- Inspect `src/types/theme.ts`, `src/types/store.ts`, `src/types/product.ts`, `src/utils/formatters.ts`, `src/utils/storage.ts`.
- Deliver a comprehensive technical handoff report at `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m2_2/handoff.md` with complete interface definitions, CSS variable mapping tables, search indexing logic, and exact implementation recommendations for the Worker.


## 2026-10-06T04:05:50Z
You are explorer_m2_2, a read-only exploration agent (teamwork_preview_explorer).
Your dedicated working directory is:
C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m2_2

MANDATORY FIRST STEP:
Read the authoritative user request at:
C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/ORIGINAL_REQUEST.md
Also read:
- C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/PROJECT.md
- C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/CONTINUE_FROM_HERE.md
- C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/TEST_INFRA.md
- C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m2_2/DISPATCH.md

Your mission:
Investigate and produce a complete technical blueprint for ThemeContext, SearchContext, and StoreContext.
Examine existing contracts in src/types/ (theme.ts, store.ts, product.ts) and utilities in src/utils/formatters.ts, src/utils/storage.ts.
Design dynamic CSS Custom Property injection into :root based on active store ThemeTokens, instant client-side search index with NFD Unicode diacritic folding and recent search history, and StoreContext catalog and route synchronization.
You are strictly read-only: do NOT modify source files.
Write your complete handoff report to:
C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m2_2/handoff.md
Send a completion message back to the orchestrator once your handoff is written.
