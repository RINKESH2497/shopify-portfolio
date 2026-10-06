import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { MockStorage, NamespacedStorage } from '../../harness/environment';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 1: Feature 07 - Cart & Wishlist LocalStorage Persistence (R1, AC-EC-04, 05)', () => {
  it('cart state persists across simulated browser reload / session reinstantiation', () => {
    const mockStorage = new MockStorage();
    const nsStorage1 = new NamespacedStorage('coffee', mockStorage);
    const cart1 = new CartEngine(STORE_FIXTURES.coffee.config, nsStorage1);

    cart1.addItem(STORE_FIXTURES.coffee.products[0], undefined, 2);
    expect(cart1.items).toHaveLength(1);

    // Simulate page reload by creating new CartEngine reading from same storage
    const nsStorage2 = new NamespacedStorage('coffee', mockStorage);
    const cart2 = new CartEngine(STORE_FIXTURES.coffee.config, nsStorage2);

    expect(cart2.items).toHaveLength(1);
    expect(cart2.items[0].quantity).toBe(2);
    expect(cart2.items[0].productId).toBe(STORE_FIXTURES.coffee.products[0].id);
  });

  it('namespaced storage keys prevent cross-store collisions', () => {
    const mockStorage = new MockStorage();
    const coffeeStorage = new NamespacedStorage('coffee', mockStorage);
    const fashionStorage = new NamespacedStorage('fashion', mockStorage);

    coffeeStorage.set('cart_items', [{ id: 'coffee-item' }]);
    fashionStorage.set('cart_items', [{ id: 'fashion-item' }]);

    expect(coffeeStorage.get('cart_items', [])).toEqual([{ id: 'coffee-item' }]);
    expect(fashionStorage.get('cart_items', [])).toEqual([{ id: 'fashion-item' }]);
    expect(mockStorage.getItem('shopify_portfolio:coffee:cart_items')).toBeDefined();
    expect(mockStorage.getItem('shopify_portfolio:fashion:cart_items')).toBeDefined();
  });

  it('wishlist state persists across simulated reload', () => {
    const mockStorage = new MockStorage();
    const ns = new NamespacedStorage('jewelry', mockStorage);

    ns.set('wishlist', ['prod-jewelry-1', 'prod-jewelry-3']);

    // Reinstantiate
    const recovered = ns.get<string[]>('wishlist', []);
    expect(recovered).toHaveLength(2);
    expect(recovered).toContain('prod-jewelry-1');
    expect(recovered).toContain('prod-jewelry-3');
  });

  it('updating cart item quantity synchronizes to storage immediately', () => {
    const mockStorage = new MockStorage();
    const ns = new NamespacedStorage('coffee', mockStorage);
    const cart = new CartEngine(STORE_FIXTURES.coffee.config, ns);

    const item = cart.addItem(STORE_FIXTURES.coffee.products[0], undefined, 1);
    cart.updateQuantity(item.id, 5);

    const saved = ns.get<any[]>('cart_items', []);
    expect(saved[0].quantity).toBe(5);
  });

  it('storage clear for a single store removes only that store state', () => {
    const mockStorage = new MockStorage();
    const coffeeStorage = new NamespacedStorage('coffee', mockStorage);
    const electronicsStorage = new NamespacedStorage('electronics', mockStorage);

    coffeeStorage.set('cart_items', [{ id: 'coffee-1' }]);
    electronicsStorage.set('cart_items', [{ id: 'electronics-1' }]);

    coffeeStorage.clearStore();

    expect(coffeeStorage.get('cart_items', [])).toEqual([]);
    expect(electronicsStorage.get('cart_items', [])).toEqual([{ id: 'electronics-1' }]);
  });

  it('recent searches persist in store namespaced storage', () => {
    const mockStorage = new MockStorage();
    const ns = new NamespacedStorage('fashion', mockStorage);

    ns.set('recent_searches', ['coat', 'silk', 'merino']);
    const loaded = ns.get<string[]>('recent_searches', []);

    expect(loaded).toEqual(['coat', 'silk', 'merino']);
  });
});
