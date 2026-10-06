import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CatalogFilterEngine } from '../../harness/reference-engine';

describe('Tier 1: Feature 04 - Collection Sorting (R1, AC-EC-07)', () => {
  const products = STORE_FIXTURES.jewelry.products;

  it('sort by price-asc orders catalog from lowest to highest price', () => {
    const sorted = CatalogFilterEngine.sort(products, 'price-asc');
    expect(sorted).toHaveLength(products.length);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price);
    }
  });

  it('sort by price-desc orders catalog from highest to lowest price', () => {
    const sorted = CatalogFilterEngine.sort(products, 'price-desc');
    expect(sorted).toHaveLength(products.length);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i + 1].price);
    }
  });

  it('sort by rating orders catalog with highest average star rating first', () => {
    const sorted = CatalogFilterEngine.sort(products, 'rating');
    expect(sorted).toHaveLength(products.length);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].rating.average).toBeGreaterThanOrEqual(sorted[i + 1].rating.average);
    }
  });

  it('sort by newest orders catalog by createdAt descending', () => {
    const sorted = CatalogFilterEngine.sort(products, 'newest');
    expect(sorted).toHaveLength(products.length);
    for (let i = 0; i < sorted.length - 1; i++) {
      const timeA = new Date(sorted[i].createdAt!).getTime();
      const timeB = new Date(sorted[i + 1].createdAt!).getTime();
      expect(timeA).toBeGreaterThanOrEqual(timeB);
    }
  });

  it('sort by bestselling orders catalog by highest review count first', () => {
    const sorted = CatalogFilterEngine.sort(products, 'bestselling');
    expect(sorted).toHaveLength(products.length);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].rating.count).toBeGreaterThanOrEqual(sorted[i + 1].rating.count);
    }
  });

  it('sorting preserves active collection category filter', () => {
    const filtered = CatalogFilterEngine.filter(products, { category: 'Rings' });
    const sorted = CatalogFilterEngine.sort(filtered, 'price-asc');
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].category.toLowerCase()).toBe('rings');
      expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price);
    }
  });
});
