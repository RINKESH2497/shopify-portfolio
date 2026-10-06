/**
 * Adversarial Stress & Verification Harness for Milestone 1 Persistence & Formatting
 * Challenger M1-R2-1
 *
 * Targets:
 * 1. src/utils/storage.ts
 * 2. src/utils/formatters.ts
 */

import {
  isNativeStorageAvailable,
  buildStorageKey,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStoreStorage,
  subscribeToStorage,
  createStoreStorage,
  NamespacedStorage,
  MemoryStorage,
  memoryStorageFallback,
  STORAGE_EVENT_NAME,
  NAMESPACE_PREFIX,
} from '../src/utils/storage';

import {
  formatCurrency,
  formatFreeShippingDelta,
  formatDiscount,
  formatDate,
  formatRelativeTime,
  calculateReadingTime,
  formatRating,
  getRatingStars,
} from '../src/utils/formatters';

interface TestRecord {
  suite: string;
  id: string;
  description: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const records: TestRecord[] = [];

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

function runAdversarialTest(suite: string, id: string, description: string, fn: () => void) {
  try {
    fn();
    records.push({ suite, id, description, passed: true });
    console.log(`[PASS] ${id}: ${description}`);
  } catch (err: any) {
    records.push({
      suite,
      id,
      description,
      passed: false,
      error: err?.message || String(err),
      details: err?.stack,
    });
    console.error(`[FAIL] ${id}: ${description}`);
    console.error(`       Error: ${err?.message}`);
  }
}

// Custom Mock Storage that allows fine-grained error injection
class ControllableMockStorage implements Storage {
  private map = new Map<string, string>();
  public throwOnSetItem: boolean = false;
  public throwOnGetItem: boolean = false;
  public throwOnRemoveItem: boolean = false;
  public errorType: string = 'QuotaExceededError';
  public setItemCallCount = 0;
  public removeItemCallCount = 0;

  get length(): number {
    return this.map.size;
  }

  getItem(key: string): string | null {
    if (this.throwOnGetItem) {
      const err = new Error('Simulated Read Error');
      throw err;
    }
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.setItemCallCount++;
    if (this.throwOnSetItem) {
      const err = new Error(`${this.errorType}: Storage quota exceeded`);
      err.name = this.errorType;
      throw err;
    }
    this.map.set(key, String(value));
  }

  removeItem(key: string): void {
    this.removeItemCallCount++;
    if (this.throwOnRemoveItem) {
      throw new Error('Simulated Remove Error');
    }
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.map.keys());
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  keys(): string[] {
    return Array.from(this.map.keys());
  }

  // Direct backdoor inspection
  peek(key: string): string | undefined {
    return this.map.get(key);
  }

  seed(key: string, value: string): void {
    this.map.set(key, value);
  }
}

console.log('======================================================================');
console.log('     CHALLENGER M1-R2-1: ADVERSARIAL STRESS & VERIFICATION SUITE      ');
console.log('======================================================================\n');

// ============================================================================
// SUITE 1: QuotaExceededError Read-After-Write Consistency
// ============================================================================
const S1 = 'Storage: QuotaExceeded & Consistency';

runAdversarialTest(
  S1,
  'ADV-STR-01',
  'NamespacedStorage: QuotaExceededError when updating an existing native key must return newly updated value on subsequent get',
  () => {
    const mockNative = new ControllableMockStorage();
    const store = new NamespacedStorage('coffee', mockNative);

    // 1. Initial successful native write
    store.set('cart_items', [{ id: 'item-1', qty: 1 }]);
    const initialRead = store.get('cart_items', []);
    assertEquals(initialRead, [{ id: 'item-1', qty: 1 }], 'Initial native write should be readable');
    assert(mockNative.peek('shopify_portfolio:coffee:cart_items') !== undefined, 'Native storage must hold initial item');

    // 2. Arm mock to throw QuotaExceededError on next setItem
    mockNative.throwOnSetItem = true;
    mockNative.errorType = 'QuotaExceededError';

    // 3. Update existing key while quota is exceeded
    store.set('cart_items', [{ id: 'item-1', qty: 2 }, { id: 'item-2', qty: 1 }]);

    // 4. CRITICAL: Read-after-write must return the newly updated value, NOT the stale native value
    const postQuotaRead = store.get('cart_items', []);
    assertEquals(
      postQuotaRead,
      [{ id: 'item-1', qty: 2 }, { id: 'item-2', qty: 1 }],
      'Read-after-write under QuotaExceededError must return newly updated value'
    );

    // 5. Verify memoryStorageFallback holds the updated value
    const fallbackVal = memoryStorageFallback.getItem('shopify_portfolio:coffee:cart_items');
    assert(fallbackVal !== null, 'memoryStorageFallback must contain the updated value');
    assert(JSON.parse(fallbackVal!)[0].qty === 2, 'memoryStorageFallback value must match updated item qty');

    // 6. Cleanup memory storage
    memoryStorageFallback.removeItem('shopify_portfolio:coffee:cart_items');
  }
);

runAdversarialTest(
  S1,
  'ADV-STR-02',
  'Global setStorageItem / getStorageItem with window.localStorage QuotaExceededError read-after-write consistency',
  () => {
    const mockWindowStorage = new ControllableMockStorage();

    // Setup global window and localStorage
    const originalWindow = (global as any).window;
    (global as any).window = {
      localStorage: mockWindowStorage,
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    try {
      // 1. Write initial value
      setStorageItem('fashion', 'user_session', { token: 'token-v1', active: true });
      const read1 = getStorageItem('fashion', 'user_session', null as any);
      assertEquals(read1, { token: 'token-v1', active: true }, 'Initial token should be read correctly');

      // 2. Trigger QuotaExceededError
      mockWindowStorage.throwOnSetItem = true;
      mockWindowStorage.errorType = 'QuotaExceededError';

      // 3. Write updated value
      setStorageItem('fashion', 'user_session', { token: 'token-v2-quota', active: true });

      // 4. Read after write
      const read2 = getStorageItem('fashion', 'user_session', null as any);
      assertEquals(
        read2,
        { token: 'token-v2-quota', active: true },
        'Global getStorageItem must return token-v2-quota despite native quota exhaustion'
      );

      // 5. Recover: quota cleared, write token-v3
      mockWindowStorage.throwOnSetItem = false;
      setStorageItem('fashion', 'user_session', { token: 'token-v3-recovered', active: false });

      // 6. Memory storage fallback must now be purged of that key
      const memFallback = memoryStorageFallback.getItem('shopify_portfolio:fashion:user_session');
      assert(memFallback === null, 'memoryStorageFallback must be purged once native write succeeds');

      const read3 = getStorageItem('fashion', 'user_session', null as any);
      assertEquals(
        read3,
        { token: 'token-v3-recovered', active: false },
        'Post-recovery read should return token-v3 from native storage'
      );
    } finally {
      (global as any).window = originalWindow;
      memoryStorageFallback.clear();
    }
  }
);

runAdversarialTest(
  S1,
  'ADV-STR-03',
  'QuotaExceeded fallback eviction when native removeItem also throws (hostile restricted storage)',
  () => {
    const mockNative = new ControllableMockStorage();
    const store = new NamespacedStorage('jewelry', mockNative);

    // Pre-seed native storage directly
    mockNative.seed('shopify_portfolio:jewelry:cart', JSON.stringify([{ id: 'ring-1' }]));

    // Both setItem and removeItem fail (e.g. strict Safari private browsing lock)
    mockNative.throwOnSetItem = true;
    mockNative.throwOnRemoveItem = true;

    // Write new value
    store.set('cart', [{ id: 'ring-2-new' }]);

    // Read should still return ring-2-new because memoryStorageFallback takes precedence
    const read = store.get('cart', []);
    assertEquals(read, [{ id: 'ring-2-new' }], 'Memory fallback must take precedence even if native removeItem threw');

    memoryStorageFallback.clear();
  }
);

// ============================================================================
// SUITE 2: Corrupted JSON, Empty Strings, Null Array Items, Proto Pollution
// ============================================================================
const S2 = 'Storage: Corruptions & Injections';

runAdversarialTest(
  S2,
  'ADV-STR-04',
  'Corrupted JSON strings in storage: syntax error recovery, self-healing key eviction, and fallback',
  () => {
    const mockNative = new ControllableMockStorage();
    const originalWindow = (global as any).window;
    (global as any).window = {
      localStorage: mockNative,
      dispatchEvent: () => true,
    };

    try {
      const corruptedKey = 'shopify_portfolio:coffee:corrupted_cart';
      mockNative.seed(corruptedKey, '{"invalid_json": true, incomplete');

      // getStorageItem should catch JSON error, self-heal by removing corrupted key, and return fallback
      const result = getStorageItem('coffee', 'corrupted_cart', ['default_cart']);
      assertEquals(result, ['default_cart'], 'Must return default_cart on JSON parse error');
      assert(mockNative.peek(corruptedKey) === undefined, 'Corrupted key must be evicted from native storage');

      // Test with NamespacedStorage
      mockNative.seed('shopify_portfolio:coffee:broken2', '{broken:');
      const ns = new NamespacedStorage('coffee', mockNative);
      const nsResult = ns.get('broken2', { fallback: true });
      assertEquals(nsResult, { fallback: true }, 'NamespacedStorage must return fallback on syntax error');
    } finally {
      (global as any).window = originalWindow;
    }
  }
);

runAdversarialTest(
  S2,
  'ADV-STR-05',
  'Empty string handling: raw empty string in storage vs stored empty string value',
  () => {
    const mockNative = new ControllableMockStorage();
    const originalWindow = (global as any).window;
    (global as any).window = {
      localStorage: mockNative,
      dispatchEvent: () => true,
    };

    try {
      // 1. Raw empty string stored natively (invalid JSON)
      mockNative.seed('shopify_portfolio:fashion:empty_raw', '');
      const rawResult = getStorageItem('fashion', 'empty_raw', 'fallback_for_empty');
      assertEquals(rawResult, 'fallback_for_empty', 'Raw empty string in storage should trigger fallback');

      // 2. Properly stored empty string value via setStorageItem
      setStorageItem('fashion', 'legit_empty_str', '');
      const legitResult = getStorageItem('fashion', 'legit_empty_str', 'fallback_not_used');
      assertEquals(legitResult, '', 'Legitimate empty string value must be preserved and returned as ""');
    } finally {
      (global as any).window = originalWindow;
    }
  }
);

runAdversarialTest(
  S2,
  'ADV-STR-06',
  'Null array items and null values in storage parsed safely',
  () => {
    const mockNative = new ControllableMockStorage();
    const ns = new NamespacedStorage('electronics', mockNative);

    // Stored array with null elements
    mockNative.seed(
      'shopify_portfolio:electronics:mixed_list',
      JSON.stringify([null, { id: 'tv-1' }, null, 'text', null, undefined])
    );

    const list = ns.get<any[]>('mixed_list', []);
    assert(Array.isArray(list), 'List must be parsed as an array');
    assertEquals(list.length, 6, 'Parsed array length must be preserved');
    assertEquals(list[1], { id: 'tv-1' }, 'Object element must be preserved');
    assertEquals(list[0], null, 'Null element must be preserved without crash');

    // Stored string "null"
    mockNative.seed('shopify_portfolio:electronics:null_val', 'null');
    const nullRead = ns.get<any>('null_val', 'fallback_default');
    assertEquals(nullRead, null, 'Stored JSON null must parse to null');
  }
);

runAdversarialTest(
  S2,
  'ADV-STR-07',
  'Prototype pollution attack vectors: __proto__, constructor, prototype injection keys and payloads',
  () => {
    const mockNative = new ControllableMockStorage();
    const ns = new NamespacedStorage('coffee', mockNative);

    // 1. Storage key named "__proto__"
    ns.set('__proto__', { evil: 'polluted_prop' });
    const readProto = ns.get('__proto__', {});
    assertEquals(readProto, { evil: 'polluted_prop' }, 'Namespaced value should be stored and retrieved');
    assert((Object.prototype as any).evil === undefined, 'Object.prototype must NOT be polluted');

    // 2. Storage key named "constructor"
    ns.set('constructor', { evilConstructor: true });
    const readConstructor = ns.get('constructor', {});
    assertEquals(readConstructor, { evilConstructor: true }, 'constructor key should be scoped');
    assert((Object.prototype as any).evilConstructor === undefined, 'Object.prototype must NOT have evilConstructor');

    // 3. Payload with nested __proto__ property
    mockNative.seed(
      'shopify_portfolio:coffee:nested_proto',
      '{"__proto__": {"injected": "dangerous"}, "legit": "safe"}'
    );
    const parsedObj = ns.get<any>('nested_proto', {});
    assertEquals(parsedObj.legit, 'safe', 'Legit property must parse');
    assert((Object.prototype as any).injected === undefined, 'Object.prototype.injected must NOT exist');

    // 4. storeId itself as "__proto__"
    const evilStore = new NamespacedStorage('__proto__', mockNative);
    evilStore.set('hacked', { val: 123 });
    assert(mockNative.peek('shopify_portfolio:__proto__:hacked') !== undefined, 'Namespaced key must be qualified');
    assert((Object.prototype as any).hacked === undefined, 'Object.prototype must NOT have hacked property');
  }
);

// ============================================================================
// SUITE 3: Multi-Store Namespace Isolation & Boundaries
// ============================================================================
const S3 = 'Storage: Multi-Store Isolation';

runAdversarialTest(
  S3,
  'ADV-STR-08',
  'Strict namespace isolation between coffee, fashion, jewelry, and electronics',
  () => {
    const mockNative = new ControllableMockStorage();
    const coffeeStore = new NamespacedStorage('coffee', mockNative);
    const fashionStore = new NamespacedStorage('fashion', mockNative);
    const jewelryStore = new NamespacedStorage('jewelry', mockNative);
    const electronicsStore = new NamespacedStorage('electronics', mockNative);

    // Populate identical keys across all 4 stores with distinct values
    coffeeStore.set('cart', [{ item: 'Espresso Blend', price: 18 }]);
    fashionStore.set('cart', [{ item: 'Silk Blouse', price: 120 }]);
    jewelryStore.set('cart', [{ item: 'Gold Ring', price: 450 }]);
    electronicsStore.set('cart', [{ item: 'Wireless Headphones', price: 299 }]);

    // Also populate an external unrelated key
    mockNative.seed('external_app:user_token', 'secret_token_123');
    mockNative.seed('shopify_portfolio_legacy', 'legacy_data');

    // Verify independent reads
    assertEquals(coffeeStore.get('cart', []), [{ item: 'Espresso Blend', price: 18 }], 'Coffee cart match');
    assertEquals(fashionStore.get('cart', []), [{ item: 'Silk Blouse', price: 120 }], 'Fashion cart match');
    assertEquals(jewelryStore.get('cart', []), [{ item: 'Gold Ring', price: 450 }], 'Jewelry cart match');
    assertEquals(electronicsStore.get('cart', []), [{ item: 'Wireless Headphones', price: 299 }], 'Electronics cart match');

    // Clear ONLY fashionStore
    fashionStore.clearStore();

    // Verify fashion is cleared
    assertEquals(fashionStore.get('cart', []), [], 'Fashion cart must be empty after clearStore');

    // Verify coffee, jewelry, electronics, and external keys are completely intact
    assertEquals(coffeeStore.get('cart', []), [{ item: 'Espresso Blend', price: 18 }], 'Coffee cart must NOT be touched');
    assertEquals(jewelryStore.get('cart', []), [{ item: 'Gold Ring', price: 450 }], 'Jewelry cart must NOT be touched');
    assertEquals(electronicsStore.get('cart', []), [{ item: 'Wireless Headphones', price: 299 }], 'Electronics cart must NOT be touched');
    assertEquals(mockNative.peek('external_app:user_token'), 'secret_token_123', 'External key must NOT be touched');
    assertEquals(mockNative.peek('shopify_portfolio_legacy'), 'legacy_data', 'Legacy key must NOT be touched');
  }
);

runAdversarialTest(
  S3,
  'ADV-STR-09',
  'Prefix boundary defense: "coffee" must not collide with "coffee_beans" or "coffee2"',
  () => {
    const mockNative = new ControllableMockStorage();
    const coffeeStore = new NamespacedStorage('coffee', mockNative);
    const coffeeBeansStore = new NamespacedStorage('coffee_beans', mockNative);
    const coffee2Store = new NamespacedStorage('coffee2', mockNative);

    coffeeStore.set('cart', 'coffee_original');
    coffeeBeansStore.set('cart', 'coffee_beans_store');
    coffee2Store.set('cart', 'coffee2_store');

    // Clear only coffeeStore
    coffeeStore.clearStore();

    assertEquals(coffeeStore.get('cart', 'none'), 'none', 'coffeeStore cart must be cleared');
    assertEquals(coffeeBeansStore.get('cart', 'none'), 'coffee_beans_store', 'coffee_beans must survive coffee clear');
    assertEquals(coffee2Store.get('cart', 'none'), 'coffee2_store', 'coffee2 must survive coffee clear');
  }
);

runAdversarialTest(
  S3,
  'ADV-STR-10',
  'StoreId encoding & sanitization with special characters, colons, and spaces',
  () => {
    const keyWithColon = buildStorageKey('coffee:special', 'cart');
    assertEquals(
      keyWithColon,
      'shopify_portfolio:coffee%3Aspecial:cart',
      'Colons in storeId must be URL encoded to prevent namespace injection'
    );

    const keyWithSpace = buildStorageKey('  fashion boutique  ', 'wishlist');
    assertEquals(
      keyWithSpace,
      'shopify_portfolio:fashion%20boutique:wishlist',
      'Spaces in storeId must be trimmed and URL encoded'
    );

    const emptyStoreKey = buildStorageKey('', 'cart');
    assertEquals(
      emptyStoreKey,
      'shopify_portfolio:global:cart',
      'Empty storeId must fallback to global'
    );
  }
);

// ============================================================================
// SUITE 4: Formatters - Negative Zero (-0) Formatting
// ============================================================================
const S4 = 'Formatters: Negative Zero (-0)';

runAdversarialTest(
  S4,
  'ADV-FMT-01',
  'formatCurrency with -0 must format as "$0.00" / "¥0" without negative sign',
  () => {
    const negZero = -0;
    assert(Object.is(negZero, -0), 'Sanity check: negZero is indeed -0');

    // 1. USD
    const usd = formatCurrency(negZero, 'USD');
    assertEquals(usd, '$0.00', '-0 in USD must produce "$0.00" without minus');

    // 2. JPY (zero-decimal)
    const jpy = formatCurrency(negZero, 'JPY');
    assertEquals(jpy, '¥0', '-0 in JPY must produce "¥0" without minus');

    // 3. EUR
    const eur = formatCurrency(negZero, 'EUR');
    assertEquals(eur, '€0.00', '-0 in EUR must produce "€0.00" without minus');

    // 4. KRW (zero-decimal)
    const krw = formatCurrency(negZero, 'KRW');
    assertEquals(krw, '₩0', '-0 in KRW must produce "₩0" without minus');

    // 5. USD with stripZeroCents
    const usdStripped = formatCurrency(negZero, 'USD', { stripZeroCents: true });
    assertEquals(usdStripped, '$0', '-0 in USD with stripZeroCents must produce "$0"');

    // 6. -0 with showCurrencyCode: true
    const usdCode = formatCurrency(negZero, 'USD', { showCurrencyCode: true });
    assert(usdCode.includes('USD') && !usdCode.includes('-'), '-0 with showCurrencyCode must not contain minus');
  }
);

// ============================================================================
// SUITE 5: Formatters - Null, Undefined, NaN, Extreme Numbers, Zero-Decimal
// ============================================================================
const S5 = 'Formatters: Edge-Case Numbers & Currencies';

runAdversarialTest(
  S5,
  'ADV-FMT-02',
  'formatCurrency with null, undefined, NaN produces valid default currency strings',
  () => {
    // null
    assertEquals(formatCurrency(null, 'USD'), '$0.00', 'null amount in USD -> $0.00');
    assertEquals(formatCurrency(null, 'JPY'), '¥0', 'null amount in JPY -> ¥0');
    assertEquals(formatCurrency(null, 'KRW'), '₩0', 'null amount in KRW -> ₩0');

    // undefined
    assertEquals(formatCurrency(undefined, 'USD'), '$0.00', 'undefined amount in USD -> $0.00');
    assertEquals(formatCurrency(undefined, 'JPY'), '¥0', 'undefined amount in JPY -> ¥0');
    assertEquals(formatCurrency(undefined, 'KRW'), '₩0', 'undefined amount in KRW -> ₩0');

    // NaN
    assertEquals(formatCurrency(NaN, 'USD'), '$0.00', 'NaN amount in USD -> $0.00');
    assertEquals(formatCurrency(NaN, 'JPY'), '¥0', 'NaN amount in JPY -> ¥0');
    assertEquals(formatCurrency(NaN, 'KRW'), '₩0', 'NaN amount in KRW -> ₩0');

    // Non-number input cast
    assertEquals(formatCurrency('100' as any, 'USD'), '$0.00', 'String input treated as 0');
  }
);

runAdversarialTest(
  S5,
  'ADV-FMT-03',
  'formatCurrency with zero-decimal currencies (JPY, KRW, VND) formats integer only',
  () => {
    // JPY
    assertEquals(formatCurrency(1500, 'JPY'), '¥1,500', '1500 JPY should format as ¥1,500');
    assertEquals(formatCurrency(0, 'JPY'), '¥0', '0 JPY should format as ¥0');
    assertEquals(formatCurrency(1234567, 'JPY'), '¥1,234,567', 'Large JPY integer');

    // KRW
    assertEquals(formatCurrency(50000, 'KRW'), '₩50,000', '50000 KRW should format as ₩50,000');
    assertEquals(formatCurrency(0, 'KRW'), '₩0', '0 KRW should format as ₩0');

    // VND
    assertEquals(formatCurrency(250000, 'VND'), '₫250,000', '250000 VND should format with dong symbol');
  }
);

runAdversarialTest(
  S5,
  'ADV-FMT-04',
  'formatCurrency with extreme numbers, float rounding, and sub-cent precision',
  () => {
    // MAX_SAFE_INTEGER
    const maxSafe = formatCurrency(Number.MAX_SAFE_INTEGER, 'USD');
    assert(maxSafe.startsWith('$'), 'MAX_SAFE_INTEGER must format without throwing');
    assert(maxSafe.includes('9,007,199,254,740,991'), 'MAX_SAFE_INTEGER value intact');

    // MIN_SAFE_INTEGER
    const minSafe = formatCurrency(Number.MIN_SAFE_INTEGER, 'USD');
    assert(minSafe.startsWith('-$') || minSafe.includes('-'), 'MIN_SAFE_INTEGER has negative prefix');

    // Sub-cent float rounding: 19.994 -> $19.99, 19.995 -> $20.00
    assertEquals(formatCurrency(19.994, 'USD'), '$19.99', '19.994 rounds to $19.99');
    assertEquals(formatCurrency(19.995, 'USD'), '$20.00', '19.995 rounds to $20.00');
    assertEquals(formatCurrency(0.001, 'USD'), '$0.00', '0.001 rounds to $0.00');

    // Negative normal number
    const negVal = formatCurrency(-45.5, 'USD');
    assert(negVal.includes('45.50') && negVal.includes('-'), '-45.5 formats with negative sign');

    // Infinity does not crash
    const infVal = formatCurrency(Infinity, 'USD');
    assert(typeof infVal === 'string' && infVal.length > 0, 'Infinity does not crash');
  }
);

runAdversarialTest(
  S5,
  'ADV-FMT-05',
  'formatCurrency with invalid currency code safely degrades to fallback',
  () => {
    // Invalid currency code triggers catch block
    const fallbackVal = formatCurrency(42, 'INVALID_CURRENCY');
    assertEquals(fallbackVal, '$42.00', 'Invalid currency must degrade gracefully to "$42.00"');

    const fallbackNull = formatCurrency(null, 'INVALID_CURRENCY');
    assertEquals(fallbackNull, '$0.00', 'Invalid currency with null must degrade to "$0.00"');
  }
);

runAdversarialTest(
  S5,
  'ADV-FMT-06',
  'formatFreeShippingDelta boundary stress test: subtotal > threshold, subtotal == threshold, negative, NaN',
  () => {
    // Exact threshold
    const exact = formatFreeShippingDelta(100, 100, 'USD');
    assert(exact.eligible === true, 'Exact match must be eligible');
    assertEquals(exact.remainingAmount, 0, 'Remaining amount must be 0');
    assertEquals(exact.message, 'You have unlocked Free Shipping!', 'Unlock message check');

    // Surpassing threshold
    const over = formatFreeShippingDelta(125.5, 100, 'USD');
    assert(over.eligible === true, 'Over threshold must be eligible');
    assertEquals(over.remainingAmount, 0, 'Remaining amount is 0');

    // Negative subtotal treated as 0
    const neg = formatFreeShippingDelta(-50, 75, 'USD');
    assert(neg.eligible === false, 'Negative subtotal is not eligible');
    assertEquals(neg.remainingAmount, 75, 'Remaining amount is full threshold');
    assertEquals(neg.message, 'Add $75.00 more for Free Shipping', 'Delta message');

    // NaN subtotal
    const nanSub = formatFreeShippingDelta(NaN, 50, 'USD');
    assert(nanSub.eligible === false, 'NaN subtotal is not eligible');
    assertEquals(nanSub.remainingAmount, 50, 'Remaining is 50');

    // Zero-decimal currency in shipping delta
    const jpyDelta = formatFreeShippingDelta(3000, 5000, 'JPY');
    assert(jpyDelta.eligible === false, 'JPY below threshold not eligible');
    assertEquals(jpyDelta.remainingAmount, 2000, 'Remaining JPY is 2000');
    assertEquals(jpyDelta.message, 'Add ¥2,000 more for Free Shipping', 'JPY delta formatting');
  }
);

runAdversarialTest(
  S5,
  'ADV-FMT-07',
  'formatDiscount boundary stress test: compareAtPrice <= price, 0, null, negative, decimal rounding',
  () => {
    // Normal valid discount
    const valid = formatDiscount(80, 100, 'USD');
    assert(valid !== null, 'Valid discount must not be null');
    assertEquals(valid!.percentage, 20, '20% discount');
    assertEquals(valid!.label, '-20%', 'Label format');
    assertEquals(valid!.savingsText, 'Save $20.00', 'Savings text');

    // Equal price and compareAtPrice
    const equal = formatDiscount(100, 100, 'USD');
    assertEquals(equal, null, 'Equal price must return null');

    // compareAtPrice < price
    const inverted = formatDiscount(120, 100, 'USD');
    assertEquals(inverted, null, 'compareAtPrice < price must return null');

    // compareAtPrice null or undefined
    assertEquals(formatDiscount(50, null, 'USD'), null, 'Null compareAtPrice returns null');
    assertEquals(formatDiscount(50, undefined, 'USD'), null, 'Undefined compareAtPrice returns null');
    assertEquals(formatDiscount(50, 0, 'USD'), null, 'Zero compareAtPrice returns null');
    assertEquals(formatDiscount(50, -10, 'USD'), null, 'Negative compareAtPrice returns null');
  }
);

runAdversarialTest(
  S5,
  'ADV-FMT-08',
  'formatDate, formatRelativeTime, calculateReadingTime, formatRating, getRatingStars edge cases',
  () => {
    // formatDate invalid inputs
    assertEquals(formatDate(null), '', 'Null date -> empty string');
    assertEquals(formatDate(undefined), '', 'Undefined date -> empty string');
    assertEquals(formatDate('invalid-date-string'), '', 'Invalid date string -> empty string');

    // formatRelativeTime invalid inputs
    assertEquals(formatRelativeTime(null), '', 'Null date -> empty string');
    assertEquals(formatRelativeTime('not-a-date'), '', 'Invalid date -> empty string');

    // calculateReadingTime
    assertEquals(calculateReadingTime(null), { minutes: 1, text: '1 min read', wordCount: 0 }, 'Null text reading time');
    assertEquals(calculateReadingTime(''), { minutes: 1, text: '1 min read', wordCount: 0 }, 'Empty text reading time');
    const longText = Array(450).fill('coffee').join(' ');
    const readLong = calculateReadingTime(longText, 200);
    assertEquals(readLong.minutes, 3, '450 words at 200 wpm -> 3 min read');

    // formatRating clamping
    const clampedLow = formatRating(-2, -5);
    assertEquals(clampedLow.formattedAverage, '0.0', 'Negative rating clamped to 0.0');
    assertEquals(clampedLow.countLabel, '0 reviews', 'Negative review count clamped to 0');

    const clampedHigh = formatRating(9.9, 1);
    assertEquals(clampedHigh.formattedAverage, '5.0', 'Rating > 5 clamped to 5.0');
    assertEquals(clampedHigh.countLabel, '1 review', 'Single review singular label');

    const nanRating = formatRating(NaN, NaN);
    assertEquals(nanRating.formattedAverage, '0.0', 'NaN rating clamped to 0.0');

    // getRatingStars breakdown
    const zeroStars = getRatingStars(0);
    assertEquals(zeroStars, { full: 0, half: 0, empty: 5 }, '0 rating -> 5 empty');

    const halfStar = getRatingStars(4.5);
    assertEquals(halfStar, { full: 4, half: 1, empty: 0 }, '4.5 rating -> 4 full, 1 half');

    const fiveStars = getRatingStars(5.0);
    assertEquals(fiveStars, { full: 5, half: 0, empty: 0 }, '5.0 rating -> 5 full');

    const overStars = getRatingStars(10);
    assertEquals(overStars, { full: 5, half: 0, empty: 0 }, '> 5 clamped to 5 full');

    const negStars = getRatingStars(-3);
    assertEquals(negStars, { full: 0, half: 0, empty: 5 }, '< 0 clamped to 5 empty');
  }
);

runAdversarialTest(
  S3,
  'ADV-STR-11',
  'subscribeToStorage reactive synchronization: same-window CustomEvent and cross-tab StorageEvent with unsubscribe cleanup',
  () => {
    let lastLocalVal: any = undefined;
    let localCalls = 0;

    const originalWindow = (global as any).window;
    const listeners: Record<string, EventListener[]> = {};

    (global as any).window = {
      localStorage: new ControllableMockStorage(),
      addEventListener: (type: string, listener: EventListener) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(listener);
      },
      removeEventListener: (type: string, listener: EventListener) => {
        if (listeners[type]) {
          listeners[type] = listeners[type].filter((l) => l !== listener);
        }
      },
      dispatchEvent: (event: Event) => {
        const list = listeners[event.type] || [];
        for (const l of list) l(event);
        return true;
      },
    };

    try {
      // 1. Subscribe to 'cart' on store 'coffee'
      const unsubscribe = subscribeToStorage<any>('coffee', 'cart', (val) => {
        localCalls++;
        lastLocalVal = val;
      });

      // 2. Set storage item triggers same-window event
      setStorageItem('coffee', 'cart', [{ id: 'coffee-1', qty: 3 }]);
      assertEquals(localCalls, 1, 'Local listener should be invoked once on set');
      assertEquals(lastLocalVal, [{ id: 'coffee-1', qty: 3 }], 'Listener receives new value');

      // 3. Different store write does NOT trigger listener
      setStorageItem('fashion', 'cart', [{ id: 'fashion-dress' }]);
      assertEquals(localCalls, 1, 'Different store write must not trigger coffee listener');

      // 4. Wildcard clearStoreStorage triggers listener with null
      clearStoreStorage('coffee');
      assertEquals(localCalls, 2, 'clearStoreStorage must trigger listener via wildcard');
      assertEquals(lastLocalVal, null, 'Listener receives null on clear');

      // 5. Cross-tab native StorageEvent
      const crossTabListeners = listeners['storage'] || [];
      for (const l of crossTabListeners) {
        l({
          key: 'shopify_portfolio:coffee:cart',
          newValue: JSON.stringify([{ id: 'crosstab-item' }]),
        } as any);
      }
      assertEquals(localCalls, 3, 'Cross-tab event should trigger listener');
      assertEquals(lastLocalVal, [{ id: 'crosstab-item' }], 'Cross-tab value parsed');

      // 6. Unsubscribe cleanup
      unsubscribe();
      setStorageItem('coffee', 'cart', [{ id: 'after-unsub' }]);
      assertEquals(localCalls, 3, 'Listener must NOT be invoked after unsubscribe');
    } finally {
      (global as any).window = originalWindow;
    }
  }
);

runAdversarialTest(
  S3,
  'ADV-STR-12',
  'createStoreStorage factory API returns fully functional scoped operations',
  () => {
    const originalWindow = (global as any).window;
    (global as any).window = {
      localStorage: new ControllableMockStorage(),
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    try {
      const storeStorage = createStoreStorage('electronics');
      storeStorage.set('specs', { ram: '16GB', cpu: 'M3' });
      assertEquals(storeStorage.get('specs', null), { ram: '16GB', cpu: 'M3' }, 'Factory get');

      storeStorage.remove('specs');
      assertEquals(storeStorage.get('specs', 'fallback'), 'fallback', 'Factory remove');

      storeStorage.set('temp', 123);
      storeStorage.clear();
      assertEquals(storeStorage.get('temp', 0), 0, 'Factory clear');
    } finally {
      (global as any).window = originalWindow;
    }
  }
);

runAdversarialTest(
  S3,
  'ADV-STR-13',
  'Storage utility constants, isNativeStorageAvailable probe resilience, and direct MemoryStorage API',
  () => {
    // 1. Constants
    assertEquals(NAMESPACE_PREFIX, 'shopify_portfolio', 'NAMESPACE_PREFIX constant check');
    assertEquals(STORAGE_EVENT_NAME, 'shopify_portfolio:storage_change', 'STORAGE_EVENT_NAME check');

    // 2. removeStorageItem
    const origWin = (global as any).window;
    const mockStore = new ControllableMockStorage();
    (global as any).window = {
      localStorage: mockStore,
      dispatchEvent: () => true,
    };
    try {
      setStorageItem('coffee', 'temp_del', 'value_to_remove');
      assert(getStorageItem('coffee', 'temp_del', null) === 'value_to_remove', 'Item exists before remove');
      removeStorageItem('coffee', 'temp_del');
      assert(getStorageItem('coffee', 'temp_del', null) === null, 'Item removed via removeStorageItem');

      // 3. isNativeStorageAvailable
      assert(isNativeStorageAvailable() === true, 'Native storage probe passes on working storage');
      mockStore.throwOnSetItem = true;
      assert(isNativeStorageAvailable() === false, 'Native storage probe returns false when setItem throws');
    } finally {
      (global as any).window = origWin;
    }

    // 4. MemoryStorage standalone
    const mem = new MemoryStorage();
    assertEquals(mem.length, 0, 'Initial length 0');
    mem.setItem('k1', 'v1');
    mem.setItem('k2', 'v2');
    assertEquals(mem.length, 2, 'Length after 2 inserts');
    assertEquals(mem.getItem('k1'), 'v1', 'getItem k1');
    assertEquals(mem.key(0), 'k1', 'key(0)');
    assertEquals(mem.keys(), ['k1', 'k2'], 'keys() list');
    mem.removeItem('k1');
    assertEquals(mem.length, 1, 'Length after removeItem');
    mem.clear();
    assertEquals(mem.length, 0, 'Length after clear');
  }
);

runAdversarialTest(
  S5,
  'ADV-FMT-09',
  'formatCurrency multi-locale and format options (stripZeroCents, showCurrencyCode, European locales)',
  () => {
    // de-DE locale (comma as decimal separator)
    const deFormat = formatCurrency(1250.5, 'EUR', { locale: 'de-DE' });
    assert(deFormat.includes('1.250,50') || deFormat.includes('1250,50'), 'German locale formats with comma');

    // stripZeroCents: true with non-zero cents (e.g. $24.50) must NOT strip .50
    const centsKept = formatCurrency(24.5, 'USD', { stripZeroCents: true });
    assertEquals(centsKept, '$24.50', 'Non-zero cents are never stripped');

    // stripZeroCents: true with zero cents ($24.00 -> $24)
    const centsStripped = formatCurrency(24.0, 'USD', { stripZeroCents: true });
    assertEquals(centsStripped, '$24', 'Zero cents .00 stripped to $24');

    // showCurrencyCode: true
    const codeUsd = formatCurrency(50, 'USD', { showCurrencyCode: true });
    assert(codeUsd.includes('USD'), 'showCurrencyCode includes USD');
  }
);

// ============================================================================
// SUMMARY & EXIT CODE
// ============================================================================
console.log('\n----------------------------------------------------------------------');
console.log(' SUMMARY OF ADVERSARIAL CHALLENGE RUN:');
console.log('----------------------------------------------------------------------');

const passedCount = records.filter((r) => r.passed).length;
const failedCount = records.filter((r) => !r.passed).length;

console.log(` TOTAL TESTS: ${records.length}`);
console.log(` PASSED:      ${passedCount}`);
console.log(` FAILED:      ${failedCount}`);
console.log('----------------------------------------------------------------------\n');

if (failedCount > 0) {
  console.error('FAILURES DETECTED:');
  for (const r of records.filter((r) => !r.passed)) {
    console.error(` - [${r.id}] ${r.description}: ${r.error}`);
  }
  process.exit(1);
} else {
  console.log('ALL ADVERSARIAL CHALLENGES PASSED EMPIRICALLY! VERDICT: APPROVE');
  process.exit(0);
}
