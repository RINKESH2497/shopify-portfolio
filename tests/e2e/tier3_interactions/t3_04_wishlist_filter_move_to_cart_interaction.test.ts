import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { WishlistEngine, CartEngine, CatalogFilterEngine } from '../../harness/reference-engine';

describe('Tier 3: Interaction 04 - Wishlist Filtering, Collection Browsing & Move-to-Cart', () => {
  const store = STORE_FIXTURES.fashion;
  const products = store.products;

  it('adding items to wishlist, filtering collection, and moving item to cart updates all states', () => {
    const wishlist = new WishlistEngine(store.config.id);
    const cart = new CartEngine(store.config);

    // 1. Add 2 items to wishlist
    const p1 = products[0];
    const p2 = products[1];
    wishlist.add(p1.id);
    wishlist.add(p2.id);
    expect(wishlist.productIds.size).toBe(2);

    // 2. Filter collection by category
    const filtered = CatalogFilterEngine.filter(products, { category: p1.category });
    expect(filtered.some(p => p.id === p1.id)).toBe(true);

    // 3. Move p1 from wishlist to cart
    wishlist.moveToCart(p1, cart, p1.variants[0].id);

    // 4. Assert wishlist reduced and cart updated
    expect(wishlist.has(p1.id)).toBe(false);
    expect(wishlist.has(p2.id)).toBe(true);
    expect(wishlist.productIds.size).toBe(1);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe(p1.id);
  });

  it('wishlist count tracks accurately as multiple items are transferred to cart', () => {
    const wishlist = new WishlistEngine(store.config.id);
    const cart = new CartEngine(store.config);

    const itemsToTransfer = products.slice(0, 3);
    for (const p of itemsToTransfer) {
      wishlist.add(p.id);
    }
    expect(wishlist.productIds.size).toBe(3);

    for (const p of itemsToTransfer) {
      wishlist.moveToCart(p, cart, p.variants[0].id);
    }

    expect(wishlist.productIds.size).toBe(0);
    expect(cart.items).toHaveLength(3);
    expect(cart.getCalculation().totalQuantity).toBe(3);
  });
});
