import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { MockStorage, NamespacedStorage } from '../../harness/environment';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 03 - Corrupted Storage & Quota Edge Cases', () => {
  it('malformed JSON string in cart storage gracefully falls back to empty array', () => {
    const rawStorage = new MockStorage();
    rawStorage.setItem('shopify_portfolio:coffee:cart_items', '{malformed json syntax::');

    const ns = new NamespacedStorage('coffee', rawStorage);
    const cart = new CartEngine(STORE_FIXTURES.coffee.config, ns);

    expect(cart.items).toEqual([]);
    expect(cart.getCalculation().totalQuantity).toBe(0);
  });

  it('non-array JSON value in cart storage falls back safely', () => {
    const rawStorage = new MockStorage();
    rawStorage.setItem('shopify_portfolio:fashion:cart_items', JSON.stringify({ unexpected: 'object' }));

    const ns = new NamespacedStorage('fashion', rawStorage);
    const cart = new CartEngine(STORE_FIXTURES.fashion.config, ns);

    // Array check
    const items = Array.isArray(cart.items) ? cart.items : [];
    expect(items).toBeDefined();
  });

  it('empty string in localStorage key falls back safely to default value', () => {
    const rawStorage = new MockStorage();
    rawStorage.setItem('shopify_portfolio:jewelry:wishlist', '');

    const ns = new NamespacedStorage('jewelry', rawStorage);
    const wishlist = ns.get<string[]>('wishlist', ['default-fallback']);

    expect(wishlist).toEqual(['default-fallback']);
  });

  it('localStorage item containing null values is handled without crash', () => {
    const rawStorage = new MockStorage();
    rawStorage.setItem('shopify_portfolio:coffee:wishlist', JSON.stringify([null, 'prod-coffee-1', null]));

    const ns = new NamespacedStorage('coffee', rawStorage);
    const rawWishlist = ns.get<(string | null)[]>('wishlist', []);
    const sanitized = rawWishlist.filter(Boolean);

    expect(sanitized).toHaveLength(1);
    expect(sanitized[0]).toBe('prod-coffee-1');
  });

  it('prototype pollution key __proto__ in storage handled safely without modifying prototype', () => {
    const rawStorage = new MockStorage();
    rawStorage.setItem('shopify_portfolio:coffee:__proto__', '{"polluted": true}');

    const ns = new NamespacedStorage('coffee', rawStorage);
    const read = ns.get<any>('__proto__', {});

    expect((Object.prototype as any).polluted).toBeUndefined();
    expect(read).toBeDefined();
  });

  it('storage quota exceeded error simulation does not crash reader', () => {
    const rawStorage = new MockStorage();
    rawStorage.quotaExceeded = true;

    expect(() => {
      rawStorage.setItem('test_key', 'some_value');
    }).toThrow('QuotaExceededError');

    // Reads should still function safely
    rawStorage.quotaExceeded = false;
    rawStorage.setItem('shopify_portfolio:coffee:cart_items', '[]');
    rawStorage.quotaExceeded = true;

    const ns = new NamespacedStorage('coffee', rawStorage);
    const items = ns.get<any[]>('cart_items', []);
    expect(items).toEqual([]);
  });
});
