import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { MockStorage, NamespacedStorage } from '../../harness/environment';
import { CartEngine, WishlistEngine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 11 - Cross-Store Isolation & Namespace Boundary Checks', () => {
  it('products in different stores with identical ID do not collide in storage', () => {
    const rawStorage = new MockStorage();
    const coffeeStorage = new NamespacedStorage('coffee', rawStorage);
    const fashionStorage = new NamespacedStorage('fashion', rawStorage);

    const sharedIdProductCoffee = { ...STORE_FIXTURES.coffee.products[0], id: 'shared-id-1' };
    const sharedIdProductFashion = { ...STORE_FIXTURES.fashion.products[0], id: 'shared-id-1' };

    const coffeeCart = new CartEngine(STORE_FIXTURES.coffee.config, coffeeStorage);
    const fashionCart = new CartEngine(STORE_FIXTURES.fashion.config, fashionStorage);

    coffeeCart.addItem(sharedIdProductCoffee, undefined, 1);
    fashionCart.addItem(sharedIdProductFashion, undefined, 3);

    expect(coffeeCart.items[0].quantity).toBe(1);
    expect(fashionCart.items[0].quantity).toBe(3);
    expect(coffeeCart.items[0].title).not.toBe(fashionCart.items[0].title);
  });

  it('store IDs containing hyphens, underscores and numbers namespace properly', () => {
    const rawStorage = new MockStorage();
    const storeA = new NamespacedStorage('store-v2_01', rawStorage);
    const storeB = new NamespacedStorage('store-v2_02', rawStorage);

    storeA.set('cart', [{ item: 'A' }]);
    storeB.set('cart', [{ item: 'B' }]);

    expect(storeA.get('cart', [])).toEqual([{ item: 'A' }]);
    expect(storeB.get('cart', [])).toEqual([{ item: 'B' }]);
  });

  it('clearing cart in Coffee store preserves Fashion, Jewelry, and Electronics carts', () => {
    const rawStorage = new MockStorage();
    const stores = ['coffee', 'fashion', 'jewelry', 'electronics'] as const;
    const carts: Record<string, CartEngine> = {};

    for (const s of stores) {
      const ns = new NamespacedStorage(s, rawStorage);
      const cart = new CartEngine(STORE_FIXTURES[s].config, ns);
      cart.addItem(STORE_FIXTURES[s].products[0], undefined, 1);
      carts[s] = cart;
    }

    // Clear coffee only
    carts['coffee'].clear();

    expect(carts['coffee'].items).toHaveLength(0);
    expect(carts['fashion'].items).toHaveLength(1);
    expect(carts['jewelry'].items).toHaveLength(1);
    expect(carts['electronics'].items).toHaveLength(1);
  });

  it('switching active store context isolates wishlist items per store', () => {
    const rawStorage = new MockStorage();
    const coffeeWishlist = new WishlistEngine('coffee', new NamespacedStorage('coffee', rawStorage));
    const fashionWishlist = new WishlistEngine('fashion', new NamespacedStorage('fashion', rawStorage));

    coffeeWishlist.add('prod-coffee-1');
    expect(coffeeWishlist.has('prod-coffee-1')).toBe(true);
    expect(fashionWishlist.has('prod-coffee-1')).toBe(false);
  });

  it('multi-tab storage sync ignores events belonging to other store IDs', () => {
    const rawStorage = new MockStorage();
    let coffeeTabSyncFired = false;

    rawStorage.addListener((evt) => {
      if (evt.key?.startsWith('shopify_portfolio:coffee:')) {
        coffeeTabSyncFired = true;
      }
    });

    const fashionStorage = new NamespacedStorage('fashion', rawStorage);
    fashionStorage.set('cart_items', [{ id: 'f-1' }]);

    expect(coffeeTabSyncFired).toBe(false);

    const coffeeStorage = new NamespacedStorage('coffee', rawStorage);
    coffeeStorage.set('cart_items', [{ id: 'c-1' }]);

    expect(coffeeTabSyncFired).toBe(true);
  });

  it('corrupted storage in Store A does not affect Store B', () => {
    const rawStorage = new MockStorage();
    rawStorage.setItem('shopify_portfolio:coffee:cart_items', '{corrupted');

    const fashionCart = new CartEngine(STORE_FIXTURES.fashion.config, new NamespacedStorage('fashion', rawStorage));
    fashionCart.addItem(STORE_FIXTURES.fashion.products[0], undefined, 2);

    expect(fashionCart.items).toHaveLength(1);
    expect(fashionCart.items[0].quantity).toBe(2);
  });
});
