import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { SearchEngine, CartEngine } from '../../harness/reference-engine';

describe('Tier 3: Interaction 03 - Search Query, PDP Navigation & Cart Addition', () => {
  const store = STORE_FIXTURES.electronics;
  const products = store.products;

  it('instant search query matches product, navigates to PDP, selects variant and adds to cart', () => {
    const searcher = new SearchEngine(store.config.id);
    const cart = new CartEngine(store.config);

    // User searches for headphones
    const results = searcher.search('headphones', products);
    expect(results.length).toBeGreaterThan(0);

    const foundProduct = results[0];
    searcher.recordQuery('headphones');

    // User navigates to PDP and selects 2nd variant
    const selectedVariant = foundProduct.variants[1];
    const addedItem = cart.addItem(foundProduct, selectedVariant.id, 1);

    expect(addedItem.productId).toBe(foundProduct.id);
    expect(addedItem.variantId).toBe(selectedVariant.id);
    expect(cart.items).toHaveLength(1);
    expect(cart.getCalculation().totalQuantity).toBe(1);
  });

  it('searching after cart operations preserves cart contents and records search history', () => {
    const searcher = new SearchEngine(store.config.id);
    const cart = new CartEngine(store.config);

    cart.addItem(products[0], undefined, 2);
    expect(cart.items).toHaveLength(1);

    // Search query executed
    searcher.recordQuery('dac');
    const searchResults = searcher.search('dac', products);
    expect(searchResults.length).toBeGreaterThan(0);

    // Cart remains completely unchanged
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(searcher.getRecentQueries()).toContain('dac');
  });
});
