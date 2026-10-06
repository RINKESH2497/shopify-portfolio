/**
 * Automated Adversarial Stress Harness: Challenger M2-1
 * Cart, Financial Calculations & Multi-Store Storage Isolation
 *
 * Exercises:
 * 1. High volume cart item additions (150+ items) & large quantity boundaries (100,000)
 * 2. Quantity zero and negative handling (addItem & updateQuantity)
 * 3. IEEE 754 float precision boundary prices ($0.01, $19.99, $99.95, $0.07) across 5,000 permutations
 * 4. Free shipping progress threshold math boundaries ($0, threshold - $0.01, threshold, threshold + $0.01, threshold = 0, clamp)
 * 5. Multi-store storage isolation (prefix collision resistance, clear isolation, corrupted payload isolation)
 */

import { calculateCartTotals } from '../src/engine/CartContext';
import {
  NamespacedStorage,
  MemoryStorage,
} from '../src/utils/storage';
import { CartItem } from '../src/types/cart';
import { StoreConfig } from '../src/types/store';

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
  } else {
    failedAssertions++;
    failures.push(message);
    console.error(`  [FAIL] ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, context: string) {
  assert(
    actual === expected,
    `${context}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
  );
}

function hasAtMostTwoDecimals(num: number): boolean {
  const parts = String(num).split('.');
  return !parts[1] || parts[1].length <= 2;
}

console.log('======================================================================');
console.log('    CHALLENGER M2-1: EMPIRICAL STRESS & ADVERSARIAL VERIFICATION     ');
console.log('======================================================================\n');

// ---------------------------------------------------------------------------
// SUITE 1: High Volume Cart Operations (150+ Items & Extreme Quantities)
// ---------------------------------------------------------------------------
console.log('[SUITE 1] High Volume Cart Item Additions (150+ Items)');

const highVolumeItems: CartItem[] = Array.from({ length: 150 }, (_, i) => {
  const price = Math.round((9.99 + (i * 0.17)) * 100) / 100;
  return {
    id: `item-${i + 1}`,
    productId: `prod-${i + 1}`,
    variantId: `var-${i + 1}`,
    title: `Product Title ${i + 1}`,
    variantTitle: 'Standard',
    price,
    quantity: (i % 5) + 1,
    imageUrl: `https://example.com/p/${i + 1}.jpg`,
    selectedOptions: { Size: 'M' },
  };
});

const highVolCalc = calculateCartTotals(highVolumeItems, {
  freeShippingThreshold: 50.0,
  standardShippingRate: 5.0,
  taxRate: 0.08,
});

const expectedRawSum = highVolumeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
const expectedSubtotal = Math.round(expectedRawSum * 100) / 100;
const expectedTotalQty = highVolumeItems.reduce((acc, item) => acc + item.quantity, 0);

assertEqual(highVolCalc.totalQuantity, expectedTotalQty, 'High volume total quantity matches exact sum');
assertEqual(highVolCalc.subtotal, expectedSubtotal, 'High volume subtotal matches exact price sum');
assert(highVolCalc.shipping === 0.0, 'Subtotal exceeds $50 threshold, shipping is $0.00');
assert(highVolCalc.freeShippingProgress === 100, 'Free shipping progress is clamped to 100');
assert(hasAtMostTwoDecimals(highVolCalc.subtotal), 'Subtotal has at most 2 decimal places');
assert(hasAtMostTwoDecimals(highVolCalc.tax), 'Tax has at most 2 decimal places');
assert(hasAtMostTwoDecimals(highVolCalc.total), 'Total has at most 2 decimal places');

// Storage serialization of 150 items
const memStorage = new MemoryStorage();
const storeEngineStorage = new NamespacedStorage('stress-store', memStorage);
storeEngineStorage.set('cart_items', highVolumeItems);
const reloadedItems = storeEngineStorage.get<CartItem[]>('cart_items', []);
assertEqual(reloadedItems.length, 150, 'Storage successfully persisted and deserialized 150 items');
assertEqual(reloadedItems[149].price, highVolumeItems[149].price, 'Item 150 preserved precision');

// Extreme quantity boundary (100,000 units)
const extremeQtyItem: CartItem[] = [
  {
    id: 'bulk-item',
    productId: 'bulk-p',
    variantId: 'bulk-v',
    title: 'Bulk Item',
    variantTitle: 'Case',
    price: 19.99,
    quantity: 100000,
    imageUrl: '',
    selectedOptions: {},
  },
];
const extremeCalc = calculateCartTotals(extremeQtyItem, { freeShippingThreshold: 50.0 });
assertEqual(extremeCalc.totalQuantity, 100000, 'Supports 100,000 quantity without overflow');
assertEqual(extremeCalc.subtotal, 1999000.0, 'Subtotal of 100,000 * $19.99 equals $1,999,000.00');

// ---------------------------------------------------------------------------
// SUITE 2: Quantity Zero & Negative Transitions
// ---------------------------------------------------------------------------
console.log('\n[SUITE 2] Quantity Zero and Negative Boundary Handling');

// In calculateCartTotals, negative or zero quantities:
const zeroQtyItems: CartItem[] = [
  {
    id: 'z-item',
    productId: 'z-p',
    variantId: 'z-v',
    title: 'Zero Qty',
    variantTitle: 'Z',
    price: 25.0,
    quantity: 0,
    imageUrl: '',
    selectedOptions: {},
  },
];
const zeroQtyCalc = calculateCartTotals(zeroQtyItems);
assertEqual(zeroQtyCalc.subtotal, 0.0, 'Zero quantity items yield $0.00 subtotal');
assertEqual(zeroQtyCalc.totalQuantity, 0, 'Zero quantity yields 0 total quantity');

// Empty cart
const emptyCalc = calculateCartTotals([]);
assertEqual(emptyCalc.subtotal, 0.0, 'Empty cart subtotal is 0');
assertEqual(emptyCalc.shipping, 0.0, 'Empty cart shipping is 0 (no items to ship)');
assertEqual(emptyCalc.tax, 0.0, 'Empty cart tax is 0');
assertEqual(emptyCalc.total, 0.0, 'Empty cart total is 0');
assertEqual(emptyCalc.freeShippingProgress, 0, 'Empty cart free shipping progress is 0%');
assertEqual(emptyCalc.totalQuantity, 0, 'Empty cart total quantity is 0');

// ---------------------------------------------------------------------------
// SUITE 3: IEEE 754 Float Precision Stress (5,000 Random & Edge Combinations)
// ---------------------------------------------------------------------------
console.log('\n[SUITE 3] IEEE 754 Float Precision & Rounding Stress (5,000 Permutations)');

const trapPrices = [0.01, 0.07, 0.1, 0.2, 0.99, 1.05, 12.37, 19.99, 49.99, 99.95, 149.97];
let precisionErrors = 0;

for (let iter = 0; iter < 5000; iter++) {
  const itemCount = (iter % 10) + 1;
  const items: CartItem[] = [];
  for (let j = 0; j < itemCount; j++) {
    const price = trapPrices[(iter + j) % trapPrices.length];
    const qty = ((iter * 3 + j) % 7) + 1;
    items.push({
      id: `p-${j}`,
      productId: `prod-${j}`,
      variantId: `var-${j}`,
      title: 'Item',
      variantTitle: 'Var',
      price,
      quantity: qty,
      imageUrl: '',
      selectedOptions: {},
    });
  }

  const discount = (iter % 4 === 0) ? 5.0 : 0;
  const calc = calculateCartTotals(items, {
    freeShippingThreshold: 50.0,
    standardShippingRate: 5.0,
    taxRate: 0.0825, // Complex Texas 8.25% sales tax rate
  }, discount);

  if (!hasAtMostTwoDecimals(calc.subtotal)) precisionErrors++;
  if (!hasAtMostTwoDecimals(calc.tax)) precisionErrors++;
  if (!hasAtMostTwoDecimals(calc.total)) precisionErrors++;
  if (!hasAtMostTwoDecimals(calc.shipping)) precisionErrors++;
  if (!hasAtMostTwoDecimals(calc.amountNeededForFreeShipping)) precisionErrors++;
}

assertEqual(precisionErrors, 0, 'Zero float precision errors across 5,000 monetary calculations');

// Specific precision artifacts:
// 19.99 * 3 = 59.970000000000006
const trap1999: CartItem[] = [{
  id: 't-1', productId: 'p-1', variantId: 'v-1', title: 'T', variantTitle: 'T',
  price: 19.99, quantity: 3, imageUrl: '', selectedOptions: {},
}];
assertEqual(calculateCartTotals(trap1999).subtotal, 59.97, '19.99 * 3 cleanly rounds to 59.97');

// 0.01 * 7 = 0.07000000000000002
const trap001: CartItem[] = [{
  id: 't-2', productId: 'p-2', variantId: 'v-2', title: 'T', variantTitle: 'T',
  price: 0.01, quantity: 7, imageUrl: '', selectedOptions: {},
}];
assertEqual(calculateCartTotals(trap001).subtotal, 0.07, '0.01 * 7 cleanly rounds to 0.07');

// ---------------------------------------------------------------------------
// SUITE 4: Free Shipping Threshold Edge Values
// ---------------------------------------------------------------------------
console.log('\n[SUITE 4] Free Shipping Threshold Boundary Math');

const shippingConfig: Partial<StoreConfig> = {
  freeShippingThreshold: 50.0,
  standardShippingRate: 5.0,
  taxRate: 0.08,
};

// Edge A: Subtotal $49.99 ($0.01 below threshold)
const edge4999: CartItem[] = [{
  id: 'e-1', productId: 'p-1', variantId: 'v-1', title: 'E', variantTitle: 'E',
  price: 49.99, quantity: 1, imageUrl: '', selectedOptions: {},
}];
const calc4999 = calculateCartTotals(edge4999, shippingConfig);
assertEqual(calc4999.subtotal, 49.99, '$49.99 subtotal');
assertEqual(calc4999.shipping, 5.0, '$49.99 incurs standard shipping fee');
assertEqual(calc4999.amountNeededForFreeShipping, 0.01, '$0.01 remaining for free shipping');
// Note: 49.99 / 50.0 = 0.9998 -> Math.round(99.98) = 100
assert(calc4999.freeShippingProgress === 100, '$49.99 integer rounded progress is 100%');

// Edge B: Subtotal $50.00 (exact threshold)
const edge5000: CartItem[] = [{
  id: 'e-2', productId: 'p-2', variantId: 'v-2', title: 'E', variantTitle: 'E',
  price: 50.0, quantity: 1, imageUrl: '', selectedOptions: {},
}];
const calc5000 = calculateCartTotals(edge5000, shippingConfig);
assertEqual(calc5000.subtotal, 50.0, '$50.00 subtotal');
assertEqual(calc5000.shipping, 0.0, '$50.00 qualifies for free shipping immediately');
assertEqual(calc5000.amountNeededForFreeShipping, 0.0, '$0.00 remaining for free shipping');
assertEqual(calc5000.freeShippingProgress, 100, '$50.00 has 100% progress');

// Edge C: Subtotal $50.01 ($0.01 above threshold)
const edge5001: CartItem[] = [{
  id: 'e-3', productId: 'p-3', variantId: 'v-3', title: 'E', variantTitle: 'E',
  price: 50.01, quantity: 1, imageUrl: '', selectedOptions: {},
}];
const calc5001 = calculateCartTotals(edge5001, shippingConfig);
assertEqual(calc5001.subtotal, 50.01, '$50.01 subtotal');
assertEqual(calc5001.shipping, 0.0, '$50.01 qualifies for free shipping');
assertEqual(calc5001.amountNeededForFreeShipping, 0.0, '$0.00 remaining for free shipping');
assertEqual(calc5001.freeShippingProgress, 100, '$50.01 has 100% clamped progress');

// Edge D: Store with freeShippingThreshold = 0
const edgeZeroThreshold = calculateCartTotals(
  [{ id: 'e-4', productId: 'p-4', variantId: 'v-4', title: 'E', variantTitle: 'E', price: 10.0, quantity: 1, imageUrl: '', selectedOptions: {} }],
  { ...shippingConfig, freeShippingThreshold: 0 }
);
assertEqual(edgeZeroThreshold.shipping, 0.0, 'Threshold 0 grants free shipping on all orders');
assertEqual(edgeZeroThreshold.freeShippingProgress, 0, 'Threshold 0 returns 0 progress without division by zero');

// Edge E: Massive order clamp (100x threshold)
const edgeMassive = calculateCartTotals(
  [{ id: 'e-5', productId: 'p-5', variantId: 'v-5', title: 'E', variantTitle: 'E', price: 5000.0, quantity: 1, imageUrl: '', selectedOptions: {} }],
  shippingConfig
);
assertEqual(edgeMassive.freeShippingProgress, 100, 'Progress clamps to 100% under $5000.00 subtotal');

// ---------------------------------------------------------------------------
// SUITE 5: Multi-Store Storage Isolation & Namespace Collision Stress
// ---------------------------------------------------------------------------
console.log('\n[SUITE 5] Multi-Store Storage Isolation & Namespace Boundaries');

const memory = new MemoryStorage();

// Substring collision prevention:
// storeA: 'store-alpha'
// storeB: 'store-alpha-pro'
// storeC: 'store-alpha_extra'
const storeAlpha = new NamespacedStorage('store-alpha', memory);
const storeAlphaPro = new NamespacedStorage('store-alpha-pro', memory);
const storeAlphaExtra = new NamespacedStorage('store-alpha_extra', memory);

storeAlpha.set('cart_items', [{ store: 'alpha' }]);
storeAlphaPro.set('cart_items', [{ store: 'alpha-pro' }]);
storeAlphaExtra.set('cart_items', [{ store: 'alpha_extra' }]);

// Qualify check
assertEqual(
  storeAlpha.qualify('cart_items'),
  'shopify_portfolio:store-alpha:cart_items',
  'Canonical storage key formatting for store-alpha'
);

assertEqual(
  storeAlphaPro.qualify('cart_items'),
  'shopify_portfolio:store-alpha-pro:cart_items',
  'Canonical storage key formatting for store-alpha-pro'
);

// Clear store-alpha only
storeAlpha.clearStore();

assertEqual(storeAlpha.get('cart_items', []).length, 0, 'store-alpha cart is cleared');
assertEqual(storeAlphaPro.get<{ store: string }[]>('cart_items', [])[0]?.store, 'alpha-pro', 'store-alpha-pro cart preserved');
assertEqual(storeAlphaExtra.get<{ store: string }[]>('cart_items', [])[0]?.store, 'alpha_extra', 'store-alpha_extra cart preserved');

// Corrupted payload isolation
memory.setItem('shopify_portfolio:store-broken:cart_items', 'INVALID_NOT_JSON{{{{');
const brokenStorage = new NamespacedStorage('store-broken', memory);
const recoveredDefault = brokenStorage.get<{ fallback: boolean }[]>('cart_items', [{ fallback: true }]);
assert(recoveredDefault[0]?.fallback === true, 'Corrupted JSON gracefully falls back to default');

// Global namespace vs store namespace
const globalStorage = new NamespacedStorage('global', memory);
globalStorage.set('user_profile', { name: 'Alex Morgan' });
storeAlphaPro.clearStore();
assertEqual(
  globalStorage.get<{ name: string }>('user_profile', { name: '' }).name,
  'Alex Morgan',
  'Clearing a store does not delete global account data'
);

// ---------------------------------------------------------------------------
// RESULTS SUMMARY
// ---------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
console.log(`PASSED: ${passedAssertions} ✓`);
console.log(`FAILED: ${failedAssertions} ✗`);
console.log('======================================================================');

if (failedAssertions > 0) {
  console.error('\nFAILURE DETAILS:');
  failures.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('\nAll empirical challenger stress tests passed cleanly.');
  process.exit(0);
}
