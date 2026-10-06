import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine, WishlistEngine } from '../../harness/reference-engine';

describe('Tier 1: Feature 08 - Wishlist Move-to-Cart Workflow (R1, AC-EC-06)', () => {
  const store = STORE_FIXTURES.fashion;

  it('adding product to wishlist adds ID and sets active state', () => {
    const wishlist = new WishlistEngine(store.config.id);
    const product = store.products[0];

    wishlist.add(product.id);
    expect(wishlist.has(product.id)).toBe(true);
    expect(wishlist.productIds.size).toBe(1);
  });

  it('removing product from wishlist updates wishlist state', () => {
    const wishlist = new WishlistEngine(store.config.id);
    const product = store.products[0];

    wishlist.add(product.id);
    wishlist.remove(product.id);

    expect(wishlist.has(product.id)).toBe(false);
    expect(wishlist.productIds.size).toBe(0);
  });

  it('toggle wishlist item adds when absent and removes when present', () => {
    const wishlist = new WishlistEngine(store.config.id);
    const product = store.products[0];

    const added = wishlist.toggle(product.id);
    expect(added).toBe(true);
    expect(wishlist.has(product.id)).toBe(true);

    const removed = wishlist.toggle(product.id);
    expect(removed).toBe(false);
    expect(wishlist.has(product.id)).toBe(false);
  });

  it('move-to-cart removes product from wishlist and adds it to cart line items', () => {
    const wishlist = new WishlistEngine(store.config.id);
    const cart = new CartEngine(store.config);
    const product = store.products[0];

    wishlist.add(product.id);
    expect(wishlist.has(product.id)).toBe(true);
    expect(cart.items).toHaveLength(0);

    wishlist.moveToCart(product, cart, product.variants[0].id);

    expect(wishlist.has(product.id)).toBe(false);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe(product.id);
  });

  it('move-to-cart retains selected variant pricing in cart', () => {
    const wishlist = new WishlistEngine(store.config.id);
    const cart = new CartEngine(store.config);
    const product = store.products[0];
    const targetVariant = product.variants[1];

    wishlist.add(product.id);
    wishlist.moveToCart(product, cart, targetVariant.id);

    expect(cart.items[0].variantId).toBe(targetVariant.id);
    expect(cart.items[0].price).toBe(targetVariant.price);
  });

  it('wishlist supports multiple distinct products simultaneously', () => {
    const wishlist = new WishlistEngine(store.config.id);
    for (let i = 0; i < 5; i++) {
      wishlist.add(store.products[i].id);
    }

    expect(wishlist.productIds.size).toBe(5);
    for (let i = 0; i < 5; i++) {
      expect(wishlist.has(store.products[i].id)).toBe(true);
    }
  });
});
