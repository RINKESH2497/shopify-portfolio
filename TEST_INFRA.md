# E2E Test Infra: Shopify Portfolio Multi-Store Platform

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md` and user-facing specifications.
- Complete independence from internal component architecture. Tests exercise user entry points (DOM interactions, simulated user journeys, URL routing, localStorage state, responsive viewports).
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Scenarios.

## Feature Inventory & Test Mapping
| # | Feature | Source (requirement) | Tier 1 (Isolated) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Scenario) |
|---|---------|---------------------|:-----------------:|:-----------------:|:----------------------:|:-----------------:|
| 1 | Product Browsing & PDP Gallery | R1, AC-EC-08 | 5 | 5 | Pairwise | App Scenario |
| 2 | Variant Selection & Price Recalculation | R1, AC-EC-09 | 5 | 5 | Pairwise | App Scenario |
| 3 | Collection Filtering (Multi-faceted) | R1, AC-EC-06 | 5 | 5 | Pairwise | App Scenario |
| 4 | Collection Sorting (Price/Newest/Rating) | R1, AC-EC-07 | 5 | 5 | Pairwise | App Scenario |
| 5 | Cart Add/Remove/Quantity Adjustments | R1, AC-EC-01, 02, 03 | 5 | 5 | Pairwise | App Scenario |
| 6 | Free Shipping Threshold & Progress Bar | R1, AC-EC-02 | 5 | 5 | Pairwise | App Scenario |
| 7 | Cart & Wishlist LocalStorage Persistence | R1, AC-EC-04, 05 | 5 | 5 | Pairwise | App Scenario |
| 8 | Wishlist Move-to-Cart Workflow | R1, AC-EC-06 | 5 | 5 | Pairwise | App Scenario |
| 9 | Instant Search Overlay & Empty States | R1, AC-EC-07 | 5 | 5 | Pairwise | App Scenario |
| 10 | Simulated 4-Step Checkout Flow | R1, AC-BN-04 | 5 | 5 | Pairwise | App Scenario |
| 11 | Demo Account (Orders, Addresses, Profile) | R1, AC-BN-04 | 5 | 5 | Pairwise | App Scenario |
| 12 | Visual Differentiation (4 Stores) | R3, AC-VD-01-05 | 5 | 5 | Pairwise | App Scenario |
| 13 | Responsive Breakpoints (320px–1440px) | R4, AC-RD-01-06 | 5 | 5 | Pairwise | App Scenario |
| 14 | Store Extensibility (Theme & Data) | R5, AC-EX-01-03 | 5 | 5 | Pairwise | App Scenario |

## Test Architecture
- **Location**: `tests/`
  - `tests/e2e/tier1_features/` (Isolated feature happy-path tests)
  - `tests/e2e/tier2_boundaries/` (Limit, empty, zero, overflow, unicode, corrupted storage)
  - `tests/e2e/tier3_interactions/` (Pairwise feature combinations, cross-tab, cross-store isolation)
  - `tests/e2e/tier4_scenarios/` (End-to-end multi-store shopper journeys)
- **Runner**: Node.js + Vitest / Playwright / Custom automated test runner (`npm run test:e2e`).
- **Pass/Fail Semantics**: All test suites must pass with exit code 0 and zero uncaught exceptions.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Expected Outcome |
|---|----------|--------------------|------------------|
| S1 | Coffee Connoisseur Complete Purchase | Coffee Store, HeroSplit, Variant (Grind/Size), Cart Drawer, Free Shipping Bar, Checkout | Successful simulated order with order ID in Demo Account |
| S2 | High-Fashion Minimalist Browsing & Filtering | Fashion Store, Fullscreen Hero, PLP Category/Size Filter, Sorting, Wishlist | Filter narrows grid, items added to wishlist, moved to cart |
| S3 | Luxury Jewelry Multi-Item Gift Selection | Jewelry Store, Standard Crest Hero, 3 Variants, Cart Page, Address Entry | Correct subtotal, taxes, shipping calculation, persistent state |
| S4 | Tech Geek Electronics Spec Comparison | Electronics Store, Tech HUD Hero, Spec Comparison, Search Overlay, Quick Add | Instant search match, spec sheet displayed, responsive layout |
| S5 | Multi-Store Shopping Isolation Check | Browse Coffee -> Add to Cart -> Switch to Fashion -> Check Cart -> Switch back | Zero cart leakage across stores; independent namespaced storage |
| S6 | Mobile Shopper Low-Bandwidth / 375px Run | 375px viewport, Hamburger Menu, Sticky Add-to-Cart, Filter Drawer, Cart Drawer | Clean touch targets, zero horizontal overflow, seamless drawer interactions |

## Coverage Thresholds
- Tier 1: >= 70 test cases (5+ per feature area)
- Tier 2: >= 70 boundary and corner test cases
- Tier 3: >= 15 pairwise cross-feature interaction suites
- Tier 4: >= 6 realistic end-to-end shopper workload scenarios
- **Total Minimum**: >= 160 test cases
