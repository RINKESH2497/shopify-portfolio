import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CatalogFilterEngine } from '../../harness/reference-engine';

describe('Tier 1: Feature 03 - Collection Filtering (R1, AC-EC-06)', () => {
  const products = STORE_FIXTURES.fashion.products;

  it('filtering by category narrows product list to only matching products', () => {
    const filtered = CatalogFilterEngine.filter(products, { category: 'Outerwear' });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(products.length);
    for (const p of filtered) {
      expect(p.category.toLowerCase()).toBe('outerwear');
    }
  });

  it('price range filtering includes products between min and max price', () => {
    const min = 90;
    const max = 150;
    const filtered = CatalogFilterEngine.filter(products, { minPrice: min, maxPrice: max });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(p.price).toBeGreaterThanOrEqual(min);
      expect(p.price).toBeLessThanOrEqual(max);
    }
  });

  it('color option filter narrows products to variants containing specified color', () => {
    const filtered = CatalogFilterEngine.filter(products, { color: 'Black' });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      const hasBlackVariant = p.variants.some(v => v.options['Color'] === 'Black');
      expect(hasBlackVariant).toBe(true);
    }
  });

  it('size option filter narrows products to variants containing specified size', () => {
    const filtered = CatalogFilterEngine.filter(products, { size: 'M' });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      const hasSizeM = p.variants.some(v => v.options['Size'] === 'M');
      expect(hasSizeM).toBe(true);
    }
  });

  it('rating filter displays only products with average rating >= minimum rating', () => {
    const minRating = 4.5;
    const filtered = CatalogFilterEngine.filter(products, { minRating });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(p.rating.average).toBeGreaterThanOrEqual(minRating);
    }
  });

  it('combining category filter with price range filter narrows correctly', () => {
    const filtered = CatalogFilterEngine.filter(products, {
      category: 'Outerwear',
      minPrice: 80,
      maxPrice: 200
    });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(p.category.toLowerCase()).toBe('outerwear');
      expect(p.price).toBeGreaterThanOrEqual(80);
      expect(p.price).toBeLessThanOrEqual(200);
    }
  });
});
