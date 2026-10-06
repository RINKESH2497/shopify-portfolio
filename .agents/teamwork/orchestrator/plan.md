# Orchestration Plan: Shopify Portfolio Project

## Objective
Build a production-grade, highly performant, accessible Shopify-focused portfolio project featuring:
1. Reusable E-Commerce Engine (browsing, cart, wishlist, search, simulated checkout, demo account, localStorage persistence).
2. Reusable Section Library (3 hero variants, carousels, cards, grids, reviews, FAQ, etc.).
3. 4 Visually Distinct Demo Stores (Coffee, Fashion, Jewelry, Electronics) with distinct identities, palettes, typography, section orderings, and realistic 15-20 products per store.
4. Fully responsive design (320px, 375px, 390px, 1024px, 1280px, 1440px).
5. Extensible architecture documented via ARCHITECTURE.md/README.md.
6. Comprehensive opaque-box E2E testing suite (Tiers 1-4) passing 100%, followed by adversarial coverage hardening (Tier 5).

## Methodology & Pattern
Project Pattern with Dual Track:
- **Track 1: Implementation Track** (Project milestones decomposed by architectural boundary).
- **Track 2: E2E Testing Track** (Derived independently from ORIGINAL_REQUEST.md, opaque-box, 4-tier test cases + test runner).

## Phases
- **Phase 0: Survey & Scope Mapping**
  - Dispatch 3 parallel Explorers / Spec Miners to analyze requirements, extract feature inventory, data models, section specs, and responsive requirements.
  - Synthesize reports into `PROJECT.md` at project root.
- **Phase 1: Decomposition & Track Dispatch**
  - Launch E2E Testing Track Orchestrator.
  - Launch Implementation Track Sub-Orchestrators sequentially/in parallel based on module dependencies.
- **Phase 2: Milestone Execution & Verification**
  - Monitor sub-orchestrators.
  - Enforce strict iteration loops (Explorer -> Worker -> Reviewers -> Challengers -> Auditor).
- **Phase 3: Integration & Final E2E Test Suite Pass**
  - Wait for `TEST_READY.md` from E2E Testing Track.
  - Execute 100% pass of Tiers 1-4 tests on integrated application.
- **Phase 4: Adversarial Coverage Hardening (Tier 5)**
  - Challenger-driven white-box edge-case and robustness hardening.
- **Phase 5: Final Delivery & Human Reporting**
  - Verify build (`npm install && npm run build`), test suite pass, dev server startup, report to parent.
