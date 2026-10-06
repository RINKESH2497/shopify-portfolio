import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CatalogFilterEngine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 05 - Catalog Filtering Edge Cases & Inverted Ranges', () => {
  const products = STORE_FIXTURES.fashion.products;

  it('filter combination resulting in 0 matches returns empty array without error', () => {
    const results = CatalogFilterEngine.filter(products, {
      category: 'Outerwear',
      minPrice: 99999.0 // impossible price
    });
    expect(results).toHaveLength(0);
  });

  it('filter combination with all or empty filters returns full catalog', () => {
    const results = CatalogFilterEngine.filter(products, {});
    expect(results).toHaveLength(products.length);

    const resultsAll = CatalogFilterEngine.filter(products, { category: 'all' });
    expect(resultsAll).toHaveLength(products.length);
  });

  it('inverted price filter (minPrice > maxPrice) returns 0 products safely', () => {
    const results = CatalogFilterEngine.filter(products, {
      minPrice: 300,
      maxPrice: 50
    });
    expect(results).toHaveLength(0);
  });

  it('negative minPrice does not filter out valid products with positive price', () => {
    const results = CatalogFilterEngine.filter(products, { minPrice: -100 });
    expect(results).toHaveLength(products.length);
  });

  it('non-existent category filter returns empty array', () => {
    const results = CatalogFilterEngine.filter(products, { category: 'CategoryDoesNotExist123' });
    expect(results).toHaveLength(0);
  });

  it('rating filter with minRating 5.0 filters strictly to only perfect rated items', () => {
    const results = CatalogFilterEngine.filter(products, { minRating: 5.0 });
    for (const p of results) {
      expect(p.rating.average).toBe(5.0);
    }
  });
});
