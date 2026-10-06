import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { MockStorage, NamespacedStorage } from '../../harness/environment';
import { CatalogFilterEngine, CartEngine, WishlistEngine } from '../../harness/reference-engine';

describe('Tier 4: Scenario S2 - High-Fashion Minimalist Browsing & Filtering', () => {
  it('executes high-fashion filtering, sorting, wishlist addition and move-to-cart', () => {
    const rawStorage = new MockStorage();
    const store = STORE_FIXTURES.fashion;
    const fashionStorage = new NamespacedStorage('fashion', rawStorage);

    // 1. Verify Fullscreen Hero configuration and monochrome palette
    expect(store.config.theme.layout.heroVariant).toBe('fullscreen');
    expect(store.config.theme.colors.primary).toBe('#0A0A0A');

    // 2. Navigate to collection and apply Category: 'Outerwear', Size: 'M'
    const filteredProducts = CatalogFilterEngine.filter(store.products, {
      category: 'Outerwear',
      size: 'M'
    });
    expect(filteredProducts.length).toBeGreaterThan(0);

    // 3. Sort by 'newest'
    const sortedProducts = CatalogFilterEngine.sort(filteredProducts, 'newest');
    expect(sortedProducts.length).toBe(filteredProducts.length);

    // 4. Select top item and add to Wishlist
    const topItem = sortedProducts[0];
    const wishlist = new WishlistEngine('fashion', fashionStorage);
    wishlist.add(topItem.id);

    expect(wishlist.has(topItem.id)).toBe(true);
    expect(fashionStorage.get<string[]>('wishlist', [])).toContain(topItem.id);

    // 5. User opens wishlist and moves item to Cart Drawer
    const cart = new CartEngine(store.config, fashionStorage);
    const targetVariant = topItem.variants.find(v => v.options['Size'] === 'M') || topItem.variants[0];

    wishlist.moveToCart(topItem, cart, targetVariant.id);

    // 6. Assert item removed from wishlist and active in Cart
    expect(wishlist.has(topItem.id)).toBe(false);
    expect(wishlist.productIds.size).toBe(0);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe(topItem.id);
    expect(cart.items[0].variantId).toBe(targetVariant.id);
    expect(cart.items[0].price).toBe(targetVariant.price);
  });
});
