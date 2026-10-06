/**
 * Empirical Adversarial Challenger & Stress Test Suite: Milestone 1 Remediation (M1-R3-1)
 *
 * Targets:
 * 1. CatalogFilterEngine (tests/harness/reference-engine.ts & tests/test-runner.js)
 * 2. Variant selection & options matching
 * 3. compareAtPrice discount calculations & boundary prices (src/utils/formatters.ts formatDiscount)
 * 4. Cross-engine behavioral parity & error handling resilience
 */

import { CatalogFilterEngine as TsCatalogFilterEngine } from './harness/reference-engine';
import { STORE_FIXTURES, Product, ProductVariant } from './fixtures/catalog-fixtures';
import { formatDiscount } from '../src/utils/formatters';

interface StressTestResult {
  suite: string;
  id: string;
  name: string;
  passed: boolean;
  actual?: any;
  expected?: any;
  error?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
}

const results: StressTestResult[] = [];

function recordTest(
  suite: string,
  id: string,
  name: string,
  fn: () => void,
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' = 'HIGH'
) {
  try {
    fn();
    results.push({ suite, id, name, passed: true, severity });
  } catch (err: any) {
    results.push({
      suite,
      id,
      name,
      passed: false,
      error: err.message || String(err),
      severity,
    });
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

function assertEquals<T>(actual: T, expected: T, msg: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${msg} -> Expected: ${expectedStr}, Got: ${actualStr}`);
  }
}

// ---------------------------------------------------------------------------
// SYNTHETIC FIXTURE GENERATORS
// ---------------------------------------------------------------------------

function createTestProduct(
  id: string,
  price: number,
  compareAtPrice: number | undefined,
  variantsData: Array<{
    id: string;
    price: number;
    compareAtPrice?: number;
    options: Record<string, string>;
    available?: boolean;
  }>
): Product {
  const variants: ProductVariant[] = variantsData.map(v => ({
    id: v.id,
    title: Object.values(v.options).join(' / ') || 'Default',
    sku: `SKU-${v.id}`,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    options: v.options,
    availableForSale: v.available !== false,
    inventoryQuantity: v.available !== false ? 10 : 0,
    imageUrl: `https://images.unsplash.com/photo-${v.id}`,
  }));

  return {
    id,
    handle: `handle-${id}`,
    title: `Product ${id}`,
    description: `Description for ${id}`,
    price,
    compareAtPrice,
    category: 'Apparel',
    tags: ['test', 'fashion'],
    images: [{ id: `img-${id}`, url: 'https://images.unsplash.com/1', altText: 'view' }],
    options: [{ name: 'Color', values: ['Black', 'White'] }],
    variants,
    rating: { average: 4.5, count: 12 },
  };
}

// ===========================================================================
// SUITE 1: COLOR FILTERING MIXED CASING STRESS TESTS
// ===========================================================================

const pBlack = createTestProduct('p-black', 50, 75, [
  { id: 'v-b1', price: 50, compareAtPrice: 75, options: { Color: 'Black', Size: 'M' } },
]);
const pWhite = createTestProduct('p-white', 40, 60, [
  { id: 'v-w1', price: 40, compareAtPrice: 60, options: { Color: 'White', Size: 'L' } },
]);
const pCharcoal = createTestProduct('p-charcoal', 60, 90, [
  { id: 'v-c1', price: 60, compareAtPrice: 90, options: { Color: 'Charcoal', Size: 'S' } },
]);

const colorCatalog = [pBlack, pWhite, pCharcoal];

recordTest('Color Filtering Casing', 'C1.1', 'Lower-case filter query "black" matches Title-case variant { Color: "Black" }', () => {
  const matches = TsCatalogFilterEngine.filter(colorCatalog, { color: 'black' });
  assertEquals(matches.length, 1, 'Should find exactly 1 product');
  assertEquals(matches[0].id, 'p-black', 'Must match product p-black');
});

recordTest('Color Filtering Casing', 'C1.2', 'Upper-case filter query "BLACK" matches Title-case variant { Color: "Black" }', () => {
  const matches = TsCatalogFilterEngine.filter(colorCatalog, { color: 'BLACK' });
  assertEquals(matches.length, 1, 'Should find exactly 1 product');
  assertEquals(matches[0].id, 'p-black', 'Must match product p-black');
});

recordTest('Color Filtering Casing', 'C1.3', 'Mixed-case filter query "bLaCk" matches Title-case variant { Color: "Black" }', () => {
  const matches = TsCatalogFilterEngine.filter(colorCatalog, { color: 'bLaCk' });
  assertEquals(matches.length, 1, 'Should find exactly 1 product');
  assertEquals(matches[0].id, 'p-black', 'Must match product p-black');
});

const pLowerVariant = createTestProduct('p-lower', 50, 75, [
  { id: 'v-l1', price: 50, compareAtPrice: 75, options: { Color: 'black' } },
]);
recordTest('Color Filtering Casing', 'C1.4', 'Title-case query "Black" matches lower-case variant value { Color: "black" }', () => {
  const matches = TsCatalogFilterEngine.filter([pLowerVariant, pWhite], { color: 'Black' });
  assertEquals(matches.length, 1, 'Should find 1 product');
  assertEquals(matches[0].id, 'p-lower', 'Must match lower-case variant product');
});

const pUpperVariant = createTestProduct('p-upper', 50, 75, [
  { id: 'v-u1', price: 50, compareAtPrice: 75, options: { Color: 'BLACK' } },
]);
recordTest('Color Filtering Casing', 'C1.5', 'Lower-case query "black" matches UPPER-case variant value { Color: "BLACK" }', () => {
  const matches = TsCatalogFilterEngine.filter([pUpperVariant, pWhite], { color: 'black' });
  assertEquals(matches.length, 1, 'Should find 1 product');
  assertEquals(matches[0].id, 'p-upper', 'Must match UPPER-case variant product');
});

const pOptionKeyVariations = [
  createTestProduct('p-key-lower', 50, 75, [
    { id: 'v-k1', price: 50, compareAtPrice: 75, options: { color: 'Black' } },
  ]),
  createTestProduct('p-key-upper', 50, 75, [
    { id: 'v-k2', price: 50, compareAtPrice: 75, options: { COLOR: 'Black' } },
  ]),
  createTestProduct('p-key-mixed', 50, 75, [
    { id: 'v-k3', price: 50, compareAtPrice: 75, options: { CoLoR: 'Black' } },
  ]),
];

recordTest('Color Filtering Casing', 'C1.6', 'CatalogFilterEngine matches variant with lower-case key { color: "Black" }', () => {
  const matches = TsCatalogFilterEngine.filter([pOptionKeyVariations[0]], { color: 'Black' });
  assertEquals(matches.length, 1, 'Must match lower-case key "color"');
});

recordTest('Color Filtering Casing', 'C1.7', 'CatalogFilterEngine matches variant with upper-case key { COLOR: "Black" }', () => {
  const matches = TsCatalogFilterEngine.filter([pOptionKeyVariations[1]], { color: 'Black' });
  assertEquals(matches.length, 1, 'Must match UPPER-case key "COLOR"');
});

recordTest('Color Filtering Casing', 'C1.8', 'CatalogFilterEngine matches variant with mixed-case key { CoLoR: "Black" }', () => {
  const matches = TsCatalogFilterEngine.filter([pOptionKeyVariations[2]], { color: 'Black' });
  assertEquals(matches.length, 1, 'Must match mixed-case key "CoLoR"');
});

// ===========================================================================
// SUITE 2: NON-EXISTENT COLORS, EMPTY FILTERS & DEFENSIVE BOUNDARIES
// ===========================================================================

recordTest('Non-Existent Colors', 'C2.1', 'Filtering for non-existent color returns empty array', () => {
  const matches = TsCatalogFilterEngine.filter(colorCatalog, { color: 'NonExistentNeonYellow999' });
  assertEquals(matches.length, 0, 'Must return 0 products');
});

recordTest('Non-Existent Colors', 'C2.2', 'Filtering empty catalog returns empty array without error', () => {
  const matches = TsCatalogFilterEngine.filter([], { color: 'Black' });
  assertEquals(matches.length, 0, 'Must return empty array');
});

recordTest('Non-Existent Colors', 'C2.3', 'Filtering for empty string color "" returns full catalog (falsy filter bypassed)', () => {
  const matches = TsCatalogFilterEngine.filter(colorCatalog, { color: '' });
  assertEquals(matches.length, colorCatalog.length, 'Empty filter string should return full catalog');
});

recordTest('Non-Existent Colors', 'C2.4', 'Filtering for whitespace-only "   " returns 0 products safely', () => {
  const matches = TsCatalogFilterEngine.filter(colorCatalog, { color: '   ' });
  assertEquals(matches.length, 0, 'Whitespace color should match nothing');
});

recordTest('Non-Existent Colors', 'C2.5', 'Regex special characters in color query are treated as literals', () => {
  const matches = TsCatalogFilterEngine.filter(colorCatalog, { color: 'Black.*' });
  assertEquals(matches.length, 0, 'Regex syntax must not accidentally match');
});

recordTest('Non-Existent Colors', 'C2.6', 'Product with variant options empty object {} does not throw and returns false for color', () => {
  const pNoOptions = createTestProduct('p-no-options', 50, 75, [
    { id: 'v-no-opt', price: 50, compareAtPrice: 75, options: {} },
  ]);
  const matches = TsCatalogFilterEngine.filter([pNoOptions], { color: 'Black' });
  assertEquals(matches.length, 0, 'Empty options should not match color filter');
});

recordTest('Non-Existent Colors', 'C2.7', 'Product with variant options null/undefined handling resilience', () => {
  const pUnsafe: any = {
    id: 'p-unsafe',
    title: 'Unsafe Product',
    price: 30,
    category: 'Apparel',
    tags: [],
    rating: { average: 4, count: 2 },
    variants: [
      { id: 'v-unsafe-1', price: 30, options: null },
      { id: 'v-unsafe-2', price: 30 },
    ],
  };
  try {
    TsCatalogFilterEngine.filter([pUnsafe], { color: 'Black' });
    // If it doesn't crash, great
  } catch (err: any) {
    throw new Error(`Engine crashed when variant options is null/undefined: ${err.message}`);
  }
}, 'MEDIUM');

// ===========================================================================
// SUITE 3: MULTI-COLOR COMBINATIONS & MULTI-FACETED CONJUNCTION
// ===========================================================================

const pMultiVariantColors = createTestProduct('p-rainbow', 100, 150, [
  { id: 'v-r1', price: 100, compareAtPrice: 150, options: { Color: 'Black', Size: 'M' } },
  { id: 'v-r2', price: 100, compareAtPrice: 150, options: { Color: 'White', Size: 'L' } },
  { id: 'v-r3', price: 100, compareAtPrice: 150, options: { Color: 'Gold', Size: 'S' } },
]);

recordTest('Multi-Color Combinations', 'C3.1', 'Product with multiple variant colors matches on Color "Black"', () => {
  const matches = TsCatalogFilterEngine.filter([pMultiVariantColors], { color: 'Black' });
  assertEquals(matches.length, 1, 'Should find product by variant 1');
});

recordTest('Multi-Color Combinations', 'C3.2', 'Product with multiple variant colors matches on Color "White"', () => {
  const matches = TsCatalogFilterEngine.filter([pMultiVariantColors], { color: 'White' });
  assertEquals(matches.length, 1, 'Should find product by variant 2');
});

recordTest('Multi-Color Combinations', 'C3.3', 'Product with multiple variant colors matches on Color "Gold"', () => {
  const matches = TsCatalogFilterEngine.filter([pMultiVariantColors], { color: 'Gold' });
  assertEquals(matches.length, 1, 'Should find product by variant 3');
});

recordTest('Multi-Color Combinations', 'C3.4', 'Product with multiple variant colors rejects unrepresented color "Silver"', () => {
  const matches = TsCatalogFilterEngine.filter([pMultiVariantColors], { color: 'Silver' });
  assertEquals(matches.length, 0, 'Silver is not among variants');
});

// Compound color variant value
const pCompoundColor = createTestProduct('p-duo', 80, 120, [
  { id: 'v-duo', price: 80, compareAtPrice: 120, options: { Color: 'Black / White' } },
]);

recordTest('Multi-Color Combinations', 'C3.5', 'Exact match for compound color "Black / White"', () => {
  const matches = TsCatalogFilterEngine.filter([pCompoundColor], { color: 'Black / White' });
  assertEquals(matches.length, 1, 'Matches exact compound color string');
});

recordTest('Multi-Color Combinations', 'C3.6', 'Case-insensitive match for compound color "black / white"', () => {
  const matches = TsCatalogFilterEngine.filter([pCompoundColor], { color: 'black / white' });
  assertEquals(matches.length, 1, 'Matches compound color case-insensitively');
});

// Variant conjunction stress test
const pDisjointVariants = createTestProduct('p-disjoint', 70, 100, [
  { id: 'v-d1', price: 70, compareAtPrice: 100, options: { Color: 'Black', Size: 'S' } },
  { id: 'v-d2', price: 70, compareAtPrice: 100, options: { Color: 'White', Size: 'XL' } },
]);

recordTest('Multi-Color Combinations', 'C3.7', 'Disjoint options conjunction: Color "Black" and Size "XL" behavior observation', () => {
  // Product has a Black variant (S) and an XL variant (White), but NO (Black, XL) variant
  const matches = TsCatalogFilterEngine.filter([pDisjointVariants], { color: 'Black', size: 'XL' });
  // In reference-engine, filters are applied at product level: does product have Black variant? Yes. Does it have XL variant? Yes.
  // We document this behavior:
  assert(matches.length === 1 || matches.length === 0, 'Engine returned a valid array');
}, 'INFO');

// Real store catalog test: fashion store
recordTest('Multi-Color Combinations', 'C3.8', 'Fashion store catalog filtering by "Black" returns correct subset', () => {
  const fashionProducts = STORE_FIXTURES.fashion.products;
  const filtered = TsCatalogFilterEngine.filter(fashionProducts, { color: 'Black' });
  assert(filtered.length > 0, 'Must find black fashion products');
  for (const p of filtered) {
    const hasBlack = p.variants.some(v =>
      Object.entries(v.options).some(([k, val]) => k.toLowerCase() === 'color' && val.toLowerCase() === 'black')
    );
    assert(hasBlack, `Product ${p.id} must contain a Black variant`);
  }
});

// ===========================================================================
// SUITE 4: compareAtPrice DISCOUNT CALCULATION BOUNDARY PRICES
// ===========================================================================

recordTest('Discount Boundaries', 'C4.1', 'compareAtPrice equal to price (50 vs 50) returns null (no discount)', () => {
  const res = formatDiscount(50, 50, 'USD');
  assertEquals(res, null, 'Equal price must return null');
});

recordTest('Discount Boundaries', 'C4.2', 'compareAtPrice strictly lower than price (40 vs 50) returns null (no negative discount)', () => {
  const res = formatDiscount(50, 40, 'USD');
  assertEquals(res, null, 'Price increase must return null');
});

recordTest('Discount Boundaries', 'C4.3', 'compareAtPrice equal to 0 returns null', () => {
  const res = formatDiscount(50, 0, 'USD');
  assertEquals(res, null, '0 compareAtPrice must return null');
});

recordTest('Discount Boundaries', 'C4.4', 'compareAtPrice negative (-20) returns null', () => {
  const res = formatDiscount(50, -20, 'USD');
  assertEquals(res, null, 'Negative compareAtPrice must return null');
});

recordTest('Discount Boundaries', 'C4.5', 'compareAtPrice null returns null', () => {
  const res = formatDiscount(50, null, 'USD');
  assertEquals(res, null, 'Null compareAtPrice must return null');
});

recordTest('Discount Boundaries', 'C4.6', 'compareAtPrice undefined returns null', () => {
  const res = formatDiscount(50, undefined, 'USD');
  assertEquals(res, null, 'Undefined compareAtPrice must return null');
});

recordTest('Discount Boundaries', 'C4.7', 'compareAtPrice NaN returns null', () => {
  const res = formatDiscount(50, NaN, 'USD');
  assertEquals(res, null, 'NaN compareAtPrice must return null');
});

recordTest('Discount Boundaries', 'C4.8', 'Extreme discount (price 0.01, compareAtPrice 1000): 100% discount, correct savings', () => {
  const res = formatDiscount(0.01, 1000, 'USD');
  assert(res !== null, 'Must calculate discount');
  if (res) {
    assertEquals(res.percentage, 100, 'Rounded percentage should be 100%');
    assertEquals(res.label, '-100%', 'Label should be -100%');
    assert(res.savingsText.includes('999.99'), 'Savings should be $999.99');
  }
});

recordTest('Discount Boundaries', 'C4.9', 'Sub-cent minuscule discount (price 99.99, compareAtPrice 100.00)', () => {
  const res = formatDiscount(99.99, 100.00, 'USD');
  assert(res !== null, 'Must not return null when compareAtPrice > price');
  if (res) {
    assertEquals(res.percentage, 0, '0.01/100 rounds to 0%');
    assertEquals(res.label, '-0%', 'Label is -0%');
    assert(res.savingsText.includes('0.01'), 'Savings should be $0.01');
  }
});

recordTest('Discount Boundaries', 'C4.10', 'Free item with compareAtPrice (price 0, compareAtPrice 50)', () => {
  const res = formatDiscount(0, 50, 'USD');
  assert(res !== null, 'Must calculate discount for free item');
  if (res) {
    assertEquals(res.percentage, 100, 'Free item has 100% discount');
    assertEquals(res.label, '-100%', 'Label is -100%');
    assert(res.savingsText.includes('50.00'), 'Savings is $50.00');
  }
});

recordTest('Discount Boundaries', 'C4.11', 'Zero price and zero compareAtPrice (0 vs 0) returns null', () => {
  const res = formatDiscount(0, 0, 'USD');
  assertEquals(res, null, '0 vs 0 returns null');
});

recordTest('Discount Boundaries', 'C4.12', 'Standard 20% discount (price 80, compareAtPrice 100)', () => {
  const res = formatDiscount(80, 100, 'USD');
  assert(res !== null, 'Must calculate');
  if (res) {
    assertEquals(res.percentage, 20, '20% discount');
    assertEquals(res.label, '-20%', 'Label is -20%');
    assertEquals(res.savingsText, 'Save $20.00', 'Savings is Save $20.00');
  }
});

recordTest('Discount Boundaries', 'C4.13', 'Floating point arithmetic boundary: price 19.99, compareAtPrice 29.99', () => {
  const res = formatDiscount(19.99, 29.99, 'USD');
  assert(res !== null, 'Must calculate');
  if (res) {
    // 10 / 29.99 = 33.3444...% -> 33%
    assertEquals(res.percentage, 33, '33% discount');
    assertEquals(res.label, '-33%', 'Label is -33%');
    assertEquals(res.savingsText, 'Save $10.00', 'Must format clean $10.00 without floating point tail');
  }
});

recordTest('Discount Boundaries', 'C4.14', 'Multi-currency formatDiscount: EUR currency formatting', () => {
  const res = formatDiscount(75, 100, 'EUR');
  assert(res !== null, 'Must calculate');
  if (res) {
    assertEquals(res.percentage, 25, '25% discount');
    assert(res.savingsText.includes('€25.00'), 'Savings text must use € symbol');
  }
});

// ===========================================================================
// SUITE 5: CROSS-ENGINE COMPARISON & DEFENSIVE DISCREPANCIES
// ===========================================================================

recordTest('Cross-Engine Parity', 'C5.1', 'CatalogFilterEngine vs test-runner option key casing check', () => {
  // Test if CatalogFilterEngine in reference-engine supports case-insensitive option keys
  const testProd = createTestProduct('p-test-casing', 100, 120, [
    { id: 'v-tc1', price: 100, compareAtPrice: 120, options: { COLOR: 'Navy' } },
  ]);
  const res = TsCatalogFilterEngine.filter([testProd], { color: 'navy' });
  assertEquals(res.length, 1, 'TypeScript Reference engine handles uppercase option key COLOR');
});

recordTest('Cross-Engine Parity', 'C5.2', 'CatalogFilterEngine handles size filtering with mixed casing', () => {
  const testProd = createTestProduct('p-test-size', 100, 120, [
    { id: 'v-ts1', price: 100, compareAtPrice: 120, options: { SIZE: 'xl' } },
  ]);
  const res = TsCatalogFilterEngine.filter([testProd], { size: 'XL' });
  assertEquals(res.length, 1, 'TypeScript Reference engine handles uppercase option key SIZE and lowercase value xl');
});

// ===========================================================================
// SUMMARY EXECUTION & REPORTING
// ===========================================================================

console.log('======================================================================');
console.log('    CHALLENGER M1-R3-1 EMPIRICAL ADVERSARIAL STRESS SUITE RESULTS    ');
console.log('======================================================================\n');

const passedCount = results.filter(r => r.passed).length;
const failedCount = results.filter(r => !r.passed).length;

const grouped: Record<string, StressTestResult[]> = {};
for (const r of results) {
  grouped[r.suite] = grouped[r.suite] || [];
  grouped[r.suite].push(r);
}

for (const [suite, tests] of Object.entries(grouped)) {
  const suitePassed = tests.filter(t => t.passed).length;
  console.log(`[${suitePassed === tests.length ? 'PASS' : 'FAIL'}] ${suite} (${suitePassed}/${tests.length} passed)`);
  for (const t of tests) {
    if (t.passed) {
      console.log(`  ✓ [${t.id}] ${t.name}`);
    } else {
      console.log(`  ✗ [${t.id}] ${t.name} (${t.severity})`);
      console.log(`      Error: ${t.error}`);
    }
  }
  console.log('');
}

console.log('----------------------------------------------------------------------');
console.log(`TOTAL ADVERSARIAL STRESS TESTS: ${results.length}`);
console.log(`PASSED: ${passedCount}`);
console.log(`FAILED: ${failedCount}`);
console.log('======================================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
