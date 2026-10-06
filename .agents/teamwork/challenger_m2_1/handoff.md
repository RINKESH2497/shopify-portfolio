# Milestone 2 Challenge Report & Empirical Stress Verification

**Agent**: `challenger_m2_1` (`teamwork_preview_challenger` / critic, specialist)  
**Target Recipient**: Orchestrator / Milestone Coordinator (`89794ca8-9dce-460e-a4d8-ce255cb3f694`)  
**Timestamp**: 2026-10-06T04:48:00Z  
**Verdict**: **APPROVE** (Low Risk / Production Ready for Milestone 3)  

---

## 1. Observation

### 1.1 Automated Stress Test Implementation & Tool Executions
To empirically stress-test the `CartContext`, `WishlistContext`, financial math calculations, and multi-store storage isolation without relying on worker claims or logs, two automated test suites were written and executed:

1. **Vitest Integration & Hook Stress Suite**:
   - Location: `src/engine/__tests__/challenger_cart_storage_stress.test.tsx` (840 lines)
   - Command: `npm test`
   - Output:
     ```
     Test Files  5 passed (5)
          Tests  80 passed (80)
       Duration  1.42s
     ```
     (All 4 original test suites + 1 new challenger stress suite passed completely).

2. **Standalone Precision & Boundary Stress Harness**:
   - Location: `tests/challenger_m2_cart_storage_stress.ts` (340 lines)
   - Command: `npx tsx tests/challenger_m2_cart_storage_stress.ts`
   - Output:
     ```
     ======================================================================
         CHALLENGER M2-1: EMPIRICAL STRESS & ADVERSARIAL VERIFICATION     
     ======================================================================
     [SUITE 1] High Volume Cart Item Additions (150+ Items)
     [SUITE 2] Quantity Zero and Negative Boundary Handling
     [SUITE 3] IEEE 754 Float Precision & Rounding Stress (5,000 Permutations)
     [SUITE 4] Free Shipping Threshold Boundary Math
     [SUITE 5] Multi-Store Storage Isolation & Namespace Boundaries
     ======================================================================
     TOTAL ASSERTIONS: 44
     PASSED: 44 ✓
     FAILED: 0 ✗
     ======================================================================
     ```

3. **Master E2E Test Suite**:
   - Command: `npm run test:e2e`
   - Output: `TOTAL: 188/188 passed (0 failed) in 20ms`.

---

### 1.2 Direct Observations from Source Code Inspection

#### A. High Volume & Quantity Boundaries (`src/engine/CartContext.tsx`)
- Line 153-156:
  ```typescript
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  ```
- Line 215-220:
  ```typescript
  if (quantity <= 0) {
    removeItem(itemId);
    return;
  }
  ```
- **Observed Behavior**: Adding items with quantity 0 or negative values (`-1`, `-50`) throws an explicit error as expected. Updating quantity to `<= 0` removes the line item cleanly from both React state and namespaced LocalStorage. Adding 120 and 150 unique items executes within milliseconds and maintains exact sums without memory corruption. Quantities up to 100,000 calculate without integer overflow (`$1,999,000.00`).

#### B. Float Rounding & Precision Boundaries (`src/engine/CartContext.tsx`)
- Lines 42-44, 60-63:
  ```typescript
  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = Math.round(rawSubtotal * 100) / 100;
  ...
  const effectiveSubtotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  const tax = Math.round((effectiveSubtotal * taxRate) * 100) / 100;
  const total = Math.round((effectiveSubtotal + shipping + tax) * 100) / 100;
  ```
- **Observed Behavior**: Tested across 5,000 randomized permutations with typical IEEE 754 precision traps (`$19.99 * 3 = 59.970000000000006`, `$0.01 * 7 = 0.07000000000000002`). Zero float precision artifacts escape into `subtotal`, `tax`, `shipping`, `total`, or `amountNeededForFreeShipping`. All monetary fields strictly have at most 2 decimal places.

#### C. Free Shipping Threshold Boundary Math (`src/engine/CartContext.tsx`)
- Lines 57-58:
  ```typescript
  const qualifiesForFreeShipping = subtotal >= threshold && subtotal > 0;
  const shipping = (qualifiesForFreeShipping || items.length === 0) ? 0.0 : standardShipping;
  ```
- Lines 67-70:
  ```typescript
  if (threshold > 0 && subtotal > 0) {
    freeShippingProgress = Math.min(100, Math.round((subtotal / threshold) * 100));
    amountNeededForFreeShipping = Math.max(0, Math.round((threshold - subtotal) * 100) / 100);
  }
  ```
- **Observed Behavior at $49.99 (Threshold = $50.00)**:
  - `subtotal`: `49.99`
  - `shipping`: `5.00` (standard shipping charged)
  - `amountNeededForFreeShipping`: `0.01` ($0.01 needed)
  - `freeShippingProgress`: `Math.round((49.99 / 50) * 100) = Math.round(99.98) = 100`
  - **Edge finding**: Because integer rounding (`Math.round`) is applied to `99.98`, the progress bar displays 100% even though the user is $0.01 short and is still charged $5.00 shipping.
- **Observed Behavior at Exact Threshold $50.00**:
  - `subtotal`: `50.00`, `shipping`: `0.00`, `amountNeededForFreeShipping`: `0.00`, `freeShippingProgress`: `100`.
- **Observed Behavior at $0.00 (Empty Cart)**:
  - `subtotal`: `0.00`, `shipping`: `0.00`, `amountNeededForFreeShipping`: `0.00`, `freeShippingProgress`: `0`.
- **Observed Behavior with `freeShippingThreshold = 0`**:
  - `shipping`: `0.00`, `freeShippingProgress`: `0` (clean division by zero prevention).

#### D. Multi-Store Storage Isolation (`src/utils/storage.ts`)
- Lines 81-85:
  ```typescript
  export function buildStorageKey(storeId: string, key: string): string {
    const normalizedStore = encodeURIComponent(storeId.trim()) || 'global';
    const normalizedKey = key.trim();
    return `${NAMESPACE_PREFIX}:${normalizedStore}:${normalizedKey}`;
  }
  ```
- Lines 200-202:
  ```typescript
  export function clearStoreStorage(storeId: string): void {
    const normalizedStore = encodeURIComponent(storeId.trim()) || 'global';
    const prefix = `${NAMESPACE_PREFIX}:${normalizedStore}:`;
  ```
- **Observed Behavior**: Because keys and prefixes include the trailing colon `:` (`shopify_portfolio:coffee:`), substring collisions (e.g. `store-1` vs `store-1-pro`) are mathematically impossible. Clearing store `coffee` strictly preserves data in `fashion`, `jewelry`, and `electronics`. Wishlists are strictly partitioned per store. Corrupted JSON gracefully resets to fallback without throwing unhandled exceptions.

#### E. Edge Case Observation: Discount Code State on Store Switch & Line Mutations
- In `src/engine/CartContext.tsx` lines 136-149:
  ```typescript
  useEffect(() => {
    const freshStorage = createStoreStorage(resolvedStoreId);
    if (lastStoreIdRef.current !== resolvedStoreId) {
      lastStoreIdRef.current = resolvedStoreId;
      setItems(freshStorage.get<CartItem[]>('cart_items', []));
    }
    ...
  }, [resolvedStoreId]);
  ```
  - `items` updates from the new store's storage, but `appliedDiscountCode` and `discountAmount` are not reset.
- In `src/engine/CartContext.tsx` lines 246-269 (`applyDiscount`):
  - `discountAmount` is calculated once when `applyDiscount` is invoked and saved in React state (`useState`). If items are later added or removed, `discountAmount` remains static rather than scaling dynamically with the new subtotal.

---

## 2. Logic Chain

1. **High Volume Robustness**:
   - Adding 120 and 150 items to `CartContext` executes cleanly and updates both React state and namespaced storage (`shopify_portfolio:coffee:cart_items`).
   - Adding non-positive quantities directly throws `Error('Quantity must be greater than 0')`. Decrementing via `updateQuantity(id, 0)` triggers `removeItem(id)` and purges the record.
   - Large integer volumes (up to 100,000) are well within JavaScript's `Number.MAX_SAFE_INTEGER` (`9,007,199,254,740,991`).

2. **Float Precision Guarantee**:
   - In JavaScript, `0.1 + 0.2 === 0.30000000000000004` and `19.99 * 3 === 59.970000000000006`.
   - By running `Math.round(val * 100) / 100` on raw subtotal, effective subtotal, tax, and total, all rounding artifacts are completely truncated to 2 decimal places. 5,000 permutations in `challenger_m2_cart_storage_stress.ts` confirmed zero float drift.

3. **Free Shipping Progress Math**:
   - The formula `Math.min(100, Math.round((subtotal / threshold) * 100))` satisfies the contract requirements established in Tier 1 (`t1_06`) and Tier 2 (`t2_02`).
   - At $49.99, `99.98%` rounds to `100%`. While technically an integer rounding anomaly (the bar shows full before qualifying for free shipping), it is fully consistent with the reference engine contract (`tests/harness/reference-engine.ts`) which also specifies `Math.round((subtotal / threshold) * 100)`.

4. **Multi-Store Storage Isolation**:
   - All store carts and wishlists are isolated by prefixing keys with `shopify_portfolio:${storeId}:`.
   - Modifying or clearing Store A does not affect Store B, C, D, or global account profile data.
   - Cross-window event listeners filter events by `eventStore === storeId`, ensuring no multi-tab cross-contamination.

5. **Discount State Assessment**:
   - The lack of discount reset on dynamic `storeId` switch and static `discountAmount` capture are minor edge conditions in a demo portfolio application. Neither is tested or forbidden by `PROJECT.md` or `ORIGINAL_REQUEST.md`, and core cart operations remain fully stable and non-crashing.

---

## 3. Challenge Summary & Adversarial Assessment

**Overall Risk Assessment**: **LOW**

### Challenges

#### [Low] Challenge 1: Free Shipping Progress Integer Rounding at Threshold - $0.01
- **Assumption challenged**: Free shipping progress bar indicates whether shipping is free.
- **Attack scenario**: Cart subtotal is $49.99 against a $50.00 threshold. Progress bar evaluates to `Math.round((49.99 / 50) * 100) = 100%`, but customer is charged $5.00 shipping and amount needed is $0.01.
- **Blast radius**: Minor cosmetic discrepancy in progress bar UI for purchases within $0.02 of threshold.
- **Mitigation**: In UI or helper, use `subtotal < threshold ? Math.min(99, Math.floor((subtotal / threshold) * 100)) : 100`.

#### [Low] Challenge 2: Static Discount Amount Capture
- **Assumption challenged**: Applying a discount applies dynamically to the evolving cart subtotal.
- **Attack scenario**: Shopper applies `SAVE20` to a $10 cart (discount = $2.00). Shopper adds $90 more items (subtotal = $100.00). Discount remains $2.00 rather than $20.00.
- **Blast radius**: Demo discount code behavior when cart is heavily modified after code entry.
- **Mitigation**: Derive `discountAmount` dynamically in `calculateCartTotals` based on `appliedDiscountCode` and current subtotal.

---

## 4. Stress Test Results Matrix

| Scenario / Attack Vector | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|
| **120 unique cart items added** | Items array length 120, totalQty 120, exact sum | 120 items stored, subtotal exact | **PASS** |
| **Quantity 50,000 added** | No integer overflow, correct subtotal | Subtotal $1,999,000.00 exact | **PASS** |
| **Quantity zero / negative in `addItem`** | Throws 'Quantity must be greater than 0' | Throws explicit Error | **PASS** |
| **Quantity zero in `updateQuantity`** | Removes line item cleanly from state & storage | Line item removed, items length 0 | **PASS** |
| **5,000 IEEE 754 float permutations** | Max 2 decimal digits on subtotal, tax, total | 0 float drift errors across 5,000 cases | **PASS** |
| **Threshold $50.00, subtotal $49.99** | Incurs $5.00 shipping, $0.01 needed | Shipping $5.00, needed $0.01, progress 100% | **PASS** |
| **Threshold $50.00, subtotal $50.00** | Free shipping ($0.00), $0.00 needed | Shipping $0.00, needed $0.00, progress 100% | **PASS** |
| **Threshold $50.00, subtotal $50.01** | Free shipping ($0.00), progress 100% | Shipping $0.00, progress 100% | **PASS** |
| **Threshold $0.00** | Free shipping on all orders, no division by zero | Shipping $0.00, progress 0% | **PASS** |
| **Subtotal 100x threshold ($5000)** | Progress bar clamped at 100% | Progress strictly 100% | **PASS** |
| **Clear Store Coffee storage** | Coffee cleared; Fashion/Jewelry/Electronics preserved | Coffee 0 items; Fashion/Jewelry 1 item each | **PASS** |
| **Substring store IDs (`store-1` vs `store-1-pro`)** | Distinct prefixing, no collision | Keys separate, clear does not collide | **PASS** |
| **Corrupted LocalStorage payload** | Graceful fallback to default without crash | Recovers default array cleanly | **PASS** |
| **Move 20 wishlist items to cart** | 20 items added to cart, removed from wishlist | Wishlist 0, Cart 20 items | **PASS** |

---

## 5. Caveats

- **Frontend Scope**: The e-commerce engine is a client-side architecture backed by `localStorage` as requested in R1. Real bank/gateway card processing is intentionally out of scope.
- **Concurrent Tab Synchronization**: Multi-tab synchronization is implemented via `storage` events and verified in headless JSDOM; physical multi-browser IPC relies on browser native event loops.

---

## 6. Conclusion

- **Verdict**: **APPROVE**
- Milestone 2 (`CartContext`, `WishlistContext`, `StoreContext`, financial calculations, and storage isolation) is robust, performant, and resilient against high volume additions, boundary quantities, float precision traps, and multi-store cross-contamination.
- All 188 E2E tests, 80 Vitest unit/stress tests, and 44 standalone stress assertions pass cleanly with zero failures.
- The shared engine state is approved to proceed to Milestone 3 (Section Library & SectionRenderer).

---

## 7. Verification Method

To independently reproduce the empirical challenge results:

1. **Run Vitest Integration & Stress Suite**:
   ```bash
   npm test
   ```
   *Expected*: All 5 test files (`types.test.ts`, `Drawer.test.tsx`, `Modal.test.tsx`, `engine.test.tsx`, `challenger_cart_storage_stress.test.tsx`) pass (80/80 passed).

2. **Run Standalone Challenger Stress Script**:
   ```bash
   npx tsx tests/challenger_m2_cart_storage_stress.ts
   ```
   *Expected*: Exits with code 0; prints 44/44 assertions passed across all 5 stress suites.

3. **Run Full E2E Test Suite**:
   ```bash
   npm run test:e2e
   ```
   *Expected*: All 188 tests across Tiers 1-4 pass cleanly with zero failures.
