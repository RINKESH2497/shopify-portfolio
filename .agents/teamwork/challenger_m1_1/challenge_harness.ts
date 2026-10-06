/**
 * Challenger M1-1 Stress Test Harness
 * Empirically tests src/utils/storage.ts and src/utils/formatters.ts
 * Self-contained zero-dependency browser mock environment
 */

// -------------------------------------------------------------
// BROWSER & DOM ENVIRONMENT MOCK
// -------------------------------------------------------------

class MockStorage implements Storage {
  private data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }
}

class MockCustomEvent {
  constructor(public type: string, public init?: { detail?: any }) {}
  get detail() {
    return this.init?.detail;
  }
}

class MockStorageEvent {
  public key: string | null;
  public oldValue: string | null;
  public newValue: string | null;
  constructor(public type: string, init?: any) {
    this.key = init?.key ?? null;
    this.oldValue = init?.oldValue ?? null;
    this.newValue = init?.newValue ?? null;
  }
}

const eventListeners = new Map<string, Set<(evt: any) => void>>();

const mockLocalStorage = new MockStorage();

const mockWindow = {
  localStorage: mockLocalStorage,
  addEventListener(type: string, listener: (evt: any) => void) {
    if (!eventListeners.has(type)) {
      eventListeners.set(type, new Set());
    }
    eventListeners.get(type)!.add(listener);
  },
  removeEventListener(type: string, listener: (evt: any) => void) {
    eventListeners.get(type)?.delete(listener);
  },
  dispatchEvent(event: any) {
    const list = eventListeners.get(event.type);
    if (list) {
      Array.from(list).forEach((l) => l(event));
    }
    return true;
  },
};

(global as any).window = mockWindow;
(global as any).CustomEvent = MockCustomEvent;
(global as any).StorageEvent = MockStorageEvent;
(global as any).localStorage = mockLocalStorage;

// -------------------------------------------------------------
// IMPORT MODULES UNDER TEST
// -------------------------------------------------------------

import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStoreStorage,
  subscribeToStorage,
  NamespacedStorage,
  buildStorageKey,
  isNativeStorageAvailable,
  memoryStorageFallback,
  createStoreStorage,
} from '../../../src/utils/storage';

import {
  formatCurrency,
  formatFreeShippingDelta,
  formatDiscount,
  formatDate,
  formatRelativeTime,
  calculateReadingTime,
  formatRating,
  getRatingStars,
} from '../../../src/utils/formatters';

interface TestResult {
  id: string;
  name: string;
  category: 'storage' | 'formatters';
  passed: boolean;
  expected: any;
  actual: any;
  error?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const results: TestResult[] = [];

function assert(
  id: string,
  category: 'storage' | 'formatters',
  name: string,
  passed: boolean,
  expected: any,
  actual: any,
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM',
  error?: string
) {
  results.push({
    id,
    category,
    name,
    passed,
    expected,
    actual,
    severity: passed ? undefined : severity,
    error,
  });
}

// -------------------------------------------------------------
// SECTION 1: STORAGE STRESS TESTS
// -------------------------------------------------------------

console.log('=== RUNNING SECTION 1: STORAGE CHALLENGES ===\n');

// Reset state
mockLocalStorage.clear();
memoryStorageFallback.clear();
eventListeners.clear();

// TEST S1: Basic Cross-Store Isolation
{
  setStorageItem('coffee', 'cart', [{ id: 'coffee-1', qty: 2 }]);
  setStorageItem('fashion', 'cart', [{ id: 'fashion-1', qty: 1 }]);

  const coffeeCart = getStorageItem('coffee', 'cart', []);
  const fashionCart = getStorageItem('fashion', 'cart', []);

  assert(
    'S1.1',
    'storage',
    'Cross-store isolation between distinct stores',
    coffeeCart.length === 1 &&
      coffeeCart[0].id === 'coffee-1' &&
      fashionCart.length === 1 &&
      fashionCart[0].id === 'fashion-1',
    'coffee-1 and fashion-1 isolated',
    { coffeeCart, fashionCart },
    'HIGH'
  );

  // Clear coffee store
  clearStoreStorage('coffee');
  const coffeeAfterClear = getStorageItem('coffee', 'cart', []);
  const fashionAfterClear = getStorageItem('fashion', 'cart', []);

  assert(
    'S1.2',
    'storage',
    'clearStoreStorage only wipes target store',
    coffeeAfterClear.length === 0 && fashionAfterClear.length === 1,
    'coffee cleared, fashion intact',
    { coffeeAfterClear, fashionAfterClear },
    'CRITICAL'
  );
}

// TEST S2: Cross-Store Isolation with Prefix Collisions
{
  mockLocalStorage.clear();
  setStorageItem('coffee', 'item', 'coffee-data');
  setStorageItem('coffee_roast', 'item', 'roast-data');
  setStorageItem('coffee:special', 'item', 'special-data');

  clearStoreStorage('coffee');

  const coffeeItem = getStorageItem('coffee', 'item', null);
  const roastItem = getStorageItem('coffee_roast', 'item', null);
  const specialItem = getStorageItem('coffee:special', 'item', null);

  assert(
    'S2.1',
    'storage',
    'clearStoreStorage does not wipe store with prefix name ("coffee_roast")',
    roastItem === 'roast-data' && coffeeItem === null,
    'roast-data preserved, coffee cleared',
    { coffeeItem, roastItem },
    'HIGH'
  );

  // StoreId containing delimiter ":"
  // Note: if storeId is 'coffee:special', clearStoreStorage('coffee') uses prefix 'shopify_portfolio:coffee:'
  // Which ACCIDENTALLY matches 'shopify_portfolio:coffee:special:item'!
  assert(
    'S2.2',
    'storage',
    'Store IDs with colon delimiter sub-scoping collision check',
    specialItem === 'special-data',
    'special-data preserved',
    { specialItem },
    'MEDIUM',
    specialItem === null ? 'Collision: storeId with colons ("coffee:special") wiped by clearing "coffee"' : undefined
  );
}

// TEST S3: Quota Exceeded & In-Memory Fallback Consistency
{
  mockLocalStorage.clear();
  memoryStorageFallback.clear();

  // Simulate quota exceeded on native localStorage.setItem
  const originalSetItem = mockLocalStorage.setItem.bind(mockLocalStorage);

  let quotaTriggered = false;
  mockLocalStorage.setItem = (k: string, v: string) => {
    // If it's the probe key, let it pass so isNativeStorageAvailable() remains true
    if (k.startsWith('__probe_')) {
      return originalSetItem(k, v);
    }
    quotaTriggered = true;
    const err = new Error('QuotaExceededError: Domestic quota exceeded');
    err.name = 'QuotaExceededError';
    throw err;
  };

  try {
    const writeResult = setStorageItem('coffee', 'large_cart', { items: [1, 2, 3] });
    assert(
      'S3.1',
      'storage',
      'setStorageItem handles QuotaExceededError and returns true fallback',
      writeResult === true && quotaTriggered,
      'true with quotaTriggered',
      { writeResult, quotaTriggered },
      'HIGH'
    );

    // CRITICAL: Now read the item back!
    // Since nativeStorage is still "available" (probe works), does getStorageItem check memoryStorageFallback?
    const readBack = getStorageItem('coffee', 'large_cart', null);
    assert(
      'S3.2',
      'storage',
      'getStorageItem retrieves data from memoryStorageFallback when native setItem failed due to quota',
      readBack !== null && (readBack as any)?.items?.length === 3,
      { items: [1, 2, 3] },
      readBack,
      'CRITICAL',
      readBack === null
        ? 'BUG CONFIRMED: getStorageItem fails to read from memory fallback if isNativeStorageAvailable() is true! Quota fallback write is unreadable!'
        : undefined
    );
  } finally {
    mockLocalStorage.setItem = originalSetItem;
  }
}

// TEST S4: NamespacedStorage with throwing Storage instance
{
  class QuotaExceededMockStorage implements Storage {
    private map = new Map<string, string>();
    get length() {
      return this.map.size;
    }
    clear() {
      this.map.clear();
    }
    getItem(key: string) {
      return this.map.get(key) ?? null;
    }
    key(index: number) {
      return Array.from(this.map.keys())[index] ?? null;
    }
    removeItem(key: string) {
      this.map.delete(key);
    }
    setItem(_key: string, _value: string) {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    }
  }

  const failingStorage = new QuotaExceededMockStorage();
  const ns = new NamespacedStorage('jewelry', failingStorage);

  let setThrew = false;
  let thrownError: any = null;
  try {
    ns.set('wishlist', ['ring-1']);
  } catch (e) {
    setThrew = true;
    thrownError = e;
  }

  assert(
    'S4.1',
    'storage',
    'NamespacedStorage.set does not crash caller when wrapped storage throws QuotaExceededError',
    !setThrew,
    'handled gracefully without uncaught crash',
    { setThrew, thrownError: thrownError?.message },
    'HIGH',
    setThrew ? 'NamespacedStorage.set directly delegates to this.storage.setItem without try/catch, crashing on quota error' : undefined
  );
}

// TEST S5: Prototype Pollution Resilience
{
  mockLocalStorage.clear();
  const testPayloads = [
    '{"__proto__": {"polluted_prop": "danger"}}',
    '{"constructor": {"prototype": {"polluted_prop_2": "danger"}}}',
  ];

  for (const payload of testPayloads) {
    mockLocalStorage.setItem('shopify_portfolio:coffee:exploit', payload);
    const read = getStorageItem('coffee', 'exploit', {});
    assert(
      'S5.1',
      'storage',
      'Prototype pollution via payload deserialization',
      (Object.prototype as any).polluted_prop === undefined &&
        (Object.prototype as any).polluted_prop_2 === undefined,
      'Object.prototype not polluted',
      {
        polluted_prop: (Object.prototype as any).polluted_prop,
        polluted_prop_2: (Object.prototype as any).polluted_prop_2,
        read,
      },
      'CRITICAL'
    );
  }

  // Key as '__proto__'
  setStorageItem('coffee', '__proto__', { test: 123 });
  assert(
    'S5.2',
    'storage',
    'Prototype pollution via key="__proto__"',
    (Object.prototype as any).test === undefined,
    'Object.prototype not polluted',
    { protoTest: (Object.prototype as any).test },
    'CRITICAL'
  );
}

// TEST S6: JSON Recovery & Self-Healing
{
  mockLocalStorage.clear();

  // Put broken JSON in storage
  const corruptedKey = buildStorageKey('coffee', 'corrupted_cart');
  mockLocalStorage.setItem(corruptedKey, '{unclosed json object:');

  const fallbackValue = [{ id: 'fallback-1' }];
  const recovered = getStorageItem('coffee', 'corrupted_cart', fallbackValue);

  assert(
    'S6.1',
    'storage',
    'getStorageItem returns defaultValue on malformed JSON',
    JSON.stringify(recovered) === JSON.stringify(fallbackValue),
    fallbackValue,
    recovered,
    'HIGH'
  );

  // Check self-healing: corrupted key should have been removed
  const keyAfterPurge = mockLocalStorage.getItem(corruptedKey);
  assert(
    'S6.2',
    'storage',
    'getStorageItem self-heals by removing corrupted key',
    keyAfterPurge === null,
    null,
    keyAfterPurge,
    'MEDIUM'
  );

  // Non-JSON string value: raw unquoted string
  mockLocalStorage.setItem(corruptedKey, 'raw-unquoted-string');
  const recoveredRaw = getStorageItem('coffee', 'corrupted_cart', 'default-str');
  assert(
    'S6.3',
    'storage',
    'getStorageItem recovers from raw unquoted string',
    recoveredRaw === 'default-str',
    'default-str',
    recoveredRaw,
    'MEDIUM'
  );
}

// TEST S7: Same-Window Event Subscription
{
  mockLocalStorage.clear();
  let receivedVal: any = null;
  let receivedWildcard: any = null;

  const unsub = subscribeToStorage('coffee', 'cart', (val) => {
    receivedVal = val;
  });

  const unsubWildcard = subscribeToStorage('coffee', 'cart', (val) => {
    receivedWildcard = val;
  });

  setStorageItem('coffee', 'cart', ['item-A']);

  assert(
    'S7.1',
    'storage',
    'subscribeToStorage receives update on setStorageItem in same window',
    Array.isArray(receivedVal) && receivedVal[0] === 'item-A',
    ['item-A'],
    receivedVal,
    'HIGH'
  );

  // Test wildcard clear notification
  clearStoreStorage('coffee');
  assert(
    'S7.2',
    'storage',
    'subscribeToStorage receives null when store is cleared (wildcard *)',
    receivedWildcard === null,
    null,
    receivedWildcard,
    'HIGH'
  );

  unsub();
  unsubWildcard();
}

// -------------------------------------------------------------
// SECTION 2: FORMATTER STRESS TESTS
// -------------------------------------------------------------

console.log('=== RUNNING SECTION 2: FORMATTER CHALLENGES ===\n');

// TEST F1: Boundary Numbers in formatCurrency
{
  // 0
  assert(
    'F1.1',
    'formatters',
    'formatCurrency(0, "USD")',
    formatCurrency(0, 'USD') === '$0.00',
    '$0.00',
    formatCurrency(0, 'USD')
  );

  // -0
  assert(
    'F1.2',
    'formatters',
    'formatCurrency(-0, "USD")',
    formatCurrency(-0, 'USD') === '$0.00',
    '$0.00',
    formatCurrency(-0, 'USD')
  );

  // NaN
  assert(
    'F1.3',
    'formatters',
    'formatCurrency(NaN, "USD")',
    formatCurrency(NaN, 'USD') === '$0.00',
    '$0.00',
    formatCurrency(NaN, 'USD')
  );

  // null & undefined
  assert(
    'F1.4',
    'formatters',
    'formatCurrency(null, "USD")',
    formatCurrency(null, 'USD') === '$0.00',
    '$0.00',
    formatCurrency(null, 'USD')
  );
  assert(
    'F1.5',
    'formatters',
    'formatCurrency(undefined, "USD")',
    formatCurrency(undefined, 'USD') === '$0.00',
    '$0.00',
    formatCurrency(undefined, 'USD')
  );

  // Infinity and -Infinity
  const inf = formatCurrency(Infinity, 'USD');
  const negInf = formatCurrency(-Infinity, 'USD');
  assert(
    'F1.6',
    'formatters',
    'formatCurrency(Infinity, "USD") handles gracefully',
    typeof inf === 'string' && inf.length > 0,
    'valid string',
    inf,
    'LOW'
  );
  assert(
    'F1.7',
    'formatters',
    'formatCurrency(-Infinity, "USD") handles gracefully',
    typeof negInf === 'string' && negInf.length > 0,
    'valid string',
    negInf,
    'LOW'
  );

  // Number.MAX_SAFE_INTEGER
  const maxSafe = formatCurrency(Number.MAX_SAFE_INTEGER, 'USD');
  assert(
    'F1.8',
    'formatters',
    'formatCurrency(Number.MAX_SAFE_INTEGER, "USD")',
    typeof maxSafe === 'string' && maxSafe.includes('9,007,199,254,740,991.00'),
    '$9,007,199,254,740,991.00',
    maxSafe,
    'MEDIUM'
  );

  // Number.EPSILON
  const eps = formatCurrency(Number.EPSILON, 'USD');
  assert(
    'F1.9',
    'formatters',
    'formatCurrency(Number.EPSILON, "USD") rounds to $0.00',
    eps === '$0.00',
    '$0.00',
    eps,
    'LOW'
  );
}

// TEST F2: Negative Values & stripZeroCents
{
  const neg24 = formatCurrency(-24, 'USD');
  assert(
    'F2.1',
    'formatters',
    'formatCurrency(-24, "USD")',
    neg24 === '-$24.00' || neg24 === '($24.00)',
    '-$24.00',
    neg24,
    'MEDIUM'
  );

  const neg24Strip = formatCurrency(-24, 'USD', { stripZeroCents: true });
  assert(
    'F2.2',
    'formatters',
    'formatCurrency(-24, "USD", { stripZeroCents: true })',
    neg24Strip === '-$24' || neg24Strip === '($24)',
    '-$24',
    neg24Strip,
    'HIGH',
    neg24Strip === '-$24.00' ? 'stripZeroCents regex failed on negative currency string' : undefined
  );

  const negCent = formatCurrency(-0.01, 'USD');
  assert(
    'F2.3',
    'formatters',
    'formatCurrency(-0.01, "USD")',
    negCent === '-$0.01' || negCent === '($0.01)',
    '-$0.01',
    negCent,
    'LOW'
  );
}

// TEST F3: Zero-Decimal Currencies (JPY, KRW, VND)
{
  const jpy = formatCurrency(1500, 'JPY');
  assert(
    'F3.1',
    'formatters',
    'formatCurrency(1500, "JPY") renders 0 fraction digits',
    jpy.includes('1,500') && !jpy.includes('.'),
    '¥1,500 without decimal dot',
    jpy,
    'HIGH'
  );

  const jpyFraction = formatCurrency(1500.75, 'JPY');
  assert(
    'F3.2',
    'formatters',
    'formatCurrency(1500.75, "JPY") rounds fraction to integer',
    jpyFraction.includes('1,501') && !jpyFraction.includes('.'),
    '¥1,501 without decimal dot',
    jpyFraction,
    'MEDIUM'
  );

  const krw = formatCurrency(50000, 'KRW');
  assert(
    'F3.3',
    'formatters',
    'formatCurrency(50000, "KRW") renders 0 fraction digits',
    krw.includes('50,000') && !krw.includes('.'),
    '₩50,000 without decimal dot',
    krw,
    'HIGH'
  );

  const vnd = formatCurrency(250000, 'VND');
  assert(
    'F3.4',
    'formatters',
    'formatCurrency(250000, "VND") renders 0 fraction digits',
    vnd.includes('250,000') && !vnd.includes('.00'),
    '250,000 without decimal fraction',
    vnd,
    'MEDIUM'
  );

  // stripZeroCents on JPY should not mangle
  const jpyStrip = formatCurrency(10000, 'JPY', { stripZeroCents: true });
  assert(
    'F3.5',
    'formatters',
    'formatCurrency(10000, "JPY", { stripZeroCents: true }) intact',
    jpyStrip.includes('10,000'),
    '¥10,000',
    jpyStrip,
    'MEDIUM'
  );
}

// TEST F4: Precision & Floating Point Math
{
  const fpAdd = formatCurrency(0.1 + 0.2, 'USD');
  assert(
    'F4.1',
    'formatters',
    'formatCurrency(0.1 + 0.2, "USD") evaluates to $0.30',
    fpAdd === '$0.30',
    '$0.30',
    fpAdd,
    'HIGH'
  );

  const threeDec = formatCurrency(19.999, 'USD');
  assert(
    'F4.2',
    'formatters',
    'formatCurrency(19.999, "USD") rounds to $20.00',
    threeDec === '$20.00',
    '$20.00',
    threeDec,
    'MEDIUM'
  );

  const halfCent = formatCurrency(0.005, 'USD');
  assert(
    'F4.3',
    'formatters',
    'formatCurrency(0.005, "USD") standard banker/half-up rounding',
    halfCent === '$0.01' || halfCent === '$0.00',
    '$0.01 or $0.00',
    halfCent,
    'LOW'
  );
}

// TEST F5: Free Shipping Delta Stress Testing
{
  // Exact boundary
  const exact = formatFreeShippingDelta(100, 100, 'USD');
  assert(
    'F5.1',
    'formatters',
    'formatFreeShippingDelta exact threshold reached',
    exact.eligible === true && exact.remainingAmount === 0,
    { eligible: true, remainingAmount: 0 },
    exact,
    'HIGH'
  );

  // Exceeded
  const exceeded = formatFreeShippingDelta(125.5, 100, 'USD');
  assert(
    'F5.2',
    'formatters',
    'formatFreeShippingDelta surpassed threshold',
    exceeded.eligible === true && exceeded.remainingAmount === 0,
    { eligible: true, remainingAmount: 0 },
    exceeded,
    'HIGH'
  );

  // 1 cent away
  const oneCent = formatFreeShippingDelta(99.99, 100, 'USD');
  assert(
    'F5.3',
    'formatters',
    'formatFreeShippingDelta 1 cent away',
    oneCent.eligible === false &&
      Math.abs(oneCent.remainingAmount - 0.01) < 0.0001 &&
      oneCent.message.includes('$0.01'),
    'Add $0.01 more for Free Shipping',
    oneCent,
    'HIGH'
  );

  // Floating point delta
  const fpDelta = formatFreeShippingDelta(75.1, 100, 'USD');
  assert(
    'F5.4',
    'formatters',
    'formatFreeShippingDelta floating point clean message',
    fpDelta.message.includes('$24.90'),
    'Add $24.90 more for Free Shipping',
    fpDelta.message,
    'HIGH'
  );

  // Negative subtotal
  const negSub = formatFreeShippingDelta(-20, 100, 'USD');
  assert(
    'F5.5',
    'formatters',
    'formatFreeShippingDelta negative subtotal clamped to 0',
    negSub.remainingAmount === 100,
    100,
    negSub.remainingAmount,
    'MEDIUM'
  );

  // JPY Free shipping
  const jpyShip = formatFreeShippingDelta(3500, 5000, 'JPY');
  assert(
    'F5.6',
    'formatters',
    'formatFreeShippingDelta with JPY zero-decimal currency',
    jpyShip.message.includes('1,500') && !jpyShip.message.includes('.00'),
    'Add ¥1,500 more for Free Shipping',
    jpyShip.message,
    'HIGH'
  );
}

// TEST F6: formatDiscount Edge Cases
{
  // Normal discount
  const normal = formatDiscount(80, 100, 'USD');
  assert(
    'F6.1',
    'formatters',
    'formatDiscount(80, 100) -> 20%',
    normal !== null && normal.percentage === 20 && normal.label === '-20%',
    { percentage: 20, label: '-20%' },
    normal,
    'HIGH'
  );

  // Equal price (no discount)
  const equal = formatDiscount(100, 100, 'USD');
  assert(
    'F6.2',
    'formatters',
    'formatDiscount(100, 100) returns null',
    equal === null,
    null,
    equal,
    'MEDIUM'
  );

  // CompareAtPrice lower than price (invalid)
  const inverted = formatDiscount(120, 100, 'USD');
  assert(
    'F6.3',
    'formatters',
    'formatDiscount(120, 100) returns null',
    inverted === null,
    null,
    inverted,
    'MEDIUM'
  );

  // Null/undefined compareAtPrice
  assert(
    'F6.4',
    'formatters',
    'formatDiscount(100, null) returns null',
    formatDiscount(100, null) === null,
    null,
    formatDiscount(100, null),
    'MEDIUM'
  );

  // 1 cent difference ($19.99 vs $20.00)
  const tinyDiff = formatDiscount(19.99, 20.0, 'USD');
  assert(
    'F6.5',
    'formatters',
    'formatDiscount(19.99, 20.00) handling of tiny percentage',
    tinyDiff !== null,
    'valid object or null',
    tinyDiff,
    'LOW'
  );
}

// TEST F7: formatRating & getRatingStars
{
  // Rating bounds clamping
  const rNeg = formatRating(-5, 10);
  assert(
    'F7.1',
    'formatters',
    'formatRating(-5, 10) clamped to 0.0',
    rNeg.formattedAverage === '0.0',
    '0.0',
    rNeg.formattedAverage,
    'MEDIUM'
  );

  const rOver = formatRating(10, 5);
  assert(
    'F7.2',
    'formatters',
    'formatRating(10, 5) clamped to 5.0',
    rOver.formattedAverage === '5.0',
    '5.0',
    rOver.formattedAverage,
    'MEDIUM'
  );

  const rSingular = formatRating(4.5, 1);
  assert(
    'F7.3',
    'formatters',
    'formatRating review count singular "1 review"',
    rSingular.countLabel === '1 review',
    '1 review',
    rSingular.countLabel,
    'LOW'
  );

  const rPlural = formatRating(4.5, 1420);
  assert(
    'F7.4',
    'formatters',
    'formatRating review count formatted plural "1,420 reviews"',
    rPlural.countLabel === '1,420 reviews',
    '1,420 reviews',
    rPlural.countLabel,
    'LOW'
  );

  // Star breakdown exhaustive thresholds:
  const stars4_0 = getRatingStars(4.0);
  assert(
    'F7.5',
    'formatters',
    'getRatingStars(4.0) -> 4 full, 0 half, 1 empty',
    stars4_0.full === 4 && stars4_0.half === 0 && stars4_0.empty === 1,
    { full: 4, half: 0, empty: 1 },
    stars4_0,
    'HIGH'
  );

  const stars4_2 = getRatingStars(4.2);
  assert(
    'F7.6',
    'formatters',
    'getRatingStars(4.2) -> 4 full, 0 half, 1 empty (remainder < 0.25)',
    stars4_2.full === 4 && stars4_2.half === 0 && stars4_2.empty === 1,
    { full: 4, half: 0, empty: 1 },
    stars4_2,
    'HIGH'
  );

  const stars4_3 = getRatingStars(4.3);
  assert(
    'F7.7',
    'formatters',
    'getRatingStars(4.3) -> 4 full, 1 half, 0 empty (0.25 <= remainder < 0.75)',
    stars4_3.full === 4 && stars4_3.half === 1 && stars4_3.empty === 0,
    { full: 4, half: 1, empty: 0 },
    stars4_3,
    'HIGH'
  );

  const stars4_8 = getRatingStars(4.8);
  assert(
    'F7.8',
    'formatters',
    'getRatingStars(4.8) -> 5 full, 0 half, 0 empty (remainder >= 0.75)',
    stars4_8.full === 5 && stars4_8.half === 0 && stars4_8.empty === 0,
    { full: 5, half: 0, empty: 0 },
    stars4_8,
    'HIGH'
  );

  const stars5_0 = getRatingStars(5.0);
  assert(
    'F7.9',
    'formatters',
    'getRatingStars(5.0) -> 5 full, 0 half, 0 empty',
    stars5_0.full === 5 && stars5_0.half === 0 && stars5_0.empty === 0,
    { full: 5, half: 0, empty: 0 },
    stars5_0,
    'HIGH'
  );
}

// -------------------------------------------------------------
// SUMMARY & HARNESS OUTPUT
// -------------------------------------------------------------

console.log('\n=============================================================');
console.log('                 CHALLENGE HARNESS RESULTS                  ');
console.log('=============================================================\n');

let passCount = 0;
let failCount = 0;
const criticalFails: TestResult[] = [];
const highFails: TestResult[] = [];
const mediumFails: TestResult[] = [];
const lowFails: TestResult[] = [];

for (const r of results) {
  if (r.passed) {
    passCount++;
    console.log(`[PASS] [${r.id}] ${r.name}`);
  } else {
    failCount++;
    console.error(`[FAIL] [${r.id}] [${r.severity}] ${r.name}`);
    console.error(`       Expected: ${JSON.stringify(r.expected)}`);
    console.error(`       Actual:   ${JSON.stringify(r.actual)}`);
    if (r.error) console.error(`       Details:  ${r.error}`);

    if (r.severity === 'CRITICAL') criticalFails.push(r);
    else if (r.severity === 'HIGH') highFails.push(r);
    else if (r.severity === 'MEDIUM') mediumFails.push(r);
    else lowFails.push(r);
  }
}

console.log('\n-------------------------------------------------------------');
console.log(`Total: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);
console.log(`Critical Failures: ${criticalFails.length}`);
console.log(`High Failures:     ${highFails.length}`);
console.log(`Medium Failures:   ${mediumFails.length}`);
console.log(`Low Failures:      ${lowFails.length}`);
console.log('-------------------------------------------------------------\n');

if (criticalFails.length > 0 || highFails.length > 0) {
  console.log('VERDICT: REQUEST_CHANGES');
} else {
  console.log('VERDICT: APPROVE');
}
