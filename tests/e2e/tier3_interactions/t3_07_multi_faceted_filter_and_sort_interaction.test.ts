import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CatalogFilterEngine } from '../../harness/reference-engine';

describe('Tier 3: Interaction 07 - Multi-Faceted Filter & Sort Combinations', () => {
  const products = STORE_FIXTURES.fashion.products;

  it('combining category filter + price filter + size filter and then sorting by price-asc', () => {
    // 1. Filter by category Outerwear, maxPrice 250, size 'M'
    const filtered = CatalogFilterEngine.filter(products, {
      category: 'Outerwear',
      maxPrice: 250,
      size: 'M'
    });

    expect(filtered.length).toBeGreaterThan(0);

    // 2. Sort by price-asc
    const sorted = CatalogFilterEngine.sort(filtered, 'price-asc');

    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price);
      expect(sorted[i].category.toLowerCase()).toBe('outerwear');
      expect(sorted[i].price).toBeLessThanOrEqual(250);
      expect(sorted[i].variants.some(v => v.options['Size'] === 'M')).toBe(true);
    }
  });

  it('clearing filters preserves selected sort order on full collection', () => {
    // Sort by rating on all products
    const sortedRatingAll = CatalogFilterEngine.sort(products, 'rating');

    // Filter, then clear filter by requesting empty filter object
    const unFiltered = CatalogFilterEngine.filter(products, {});
    const sortedRatingCleared = CatalogFilterEngine.sort(unFiltered, 'rating');

    expect(sortedRatingCleared).toHaveLength(products.length);
    expect(sortedRatingCleared[0].id).toBe(sortedRatingAll[0].id);
    for (let i = 0; i < sortedRatingCleared.length - 1; i++) {
      expect(sortedRatingCleared[i].rating.average).toBeGreaterThanOrEqual(sortedRatingCleared[i + 1].rating.average);
    }
  });
});
