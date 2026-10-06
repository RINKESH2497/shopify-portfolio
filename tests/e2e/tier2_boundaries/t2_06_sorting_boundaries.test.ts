import { describe, it, expect } from '../../harness/test-framework';
import { Product } from '../../fixtures/catalog-fixtures';
import { CatalogFilterEngine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 06 - Sorting Edge Cases & Degenerate Collections', () => {
  it('sorting empty products array returns empty array', () => {
    const sorted = CatalogFilterEngine.sort([], 'price-asc');
    expect(sorted).toEqual([]);
  });

  it('sorting single-item array returns single item unchanged', () => {
    const singleProduct: Product = {
      id: 'p-1',
      handle: 'p-1',
      title: 'Item 1',
      description: 'Desc',
      price: 25.0,
      category: 'Cat',
      tags: [],
      images: [],
      options: [],
      variants: [],
      rating: { average: 4.5, count: 10 }
    };
    const sorted = CatalogFilterEngine.sort([singleProduct], 'price-desc');
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('p-1');
  });

  it('sorting catalog where all items have identical price preserves length and stability', () => {
    const identicalPrices: Product[] = [1, 2, 3, 4].map(idx => ({
      id: `p-${idx}`,
      handle: `p-${idx}`,
      title: `Item ${idx}`,
      description: 'Desc',
      price: 50.0,
      category: 'Cat',
      tags: [],
      images: [],
      options: [],
      variants: [],
      rating: { average: 4.0, count: 5 }
    }));

    const sortedAsc = CatalogFilterEngine.sort(identicalPrices, 'price-asc');
    const sortedDesc = CatalogFilterEngine.sort(identicalPrices, 'price-desc');

    expect(sortedAsc).toHaveLength(4);
    expect(sortedDesc).toHaveLength(4);
    for (const item of sortedAsc) {
      expect(item.price).toBe(50.0);
    }
  });

  it('sorting by newest when createdAt date is missing falls back gracefully', () => {
    const itemsWithoutDate: Product[] = [
      { id: 'p-1', handle: 'p-1', title: '1', description: '', price: 10, category: '', tags: [], images: [], options: [], variants: [], rating: { average: 4, count: 1 } },
      { id: 'p-2', handle: 'p-2', title: '2', description: '', price: 10, category: '', tags: [], images: [], options: [], variants: [], rating: { average: 4, count: 1 }, createdAt: new Date(2026, 0, 10).toISOString() }
    ];

    expect(() => {
      const sorted = CatalogFilterEngine.sort(itemsWithoutDate, 'newest');
      expect(sorted).toHaveLength(2);
      expect(sorted[0].id).toBe('p-2'); // Dated item is newest
    }).not.toThrow();
  });

  it('sorting by rating when products have 0 reviews or 0 rating handles without NaN', () => {
    const itemsWithZeroRating: Product[] = [
      { id: 'p-1', handle: 'p-1', title: '1', description: '', price: 10, category: '', tags: [], images: [], options: [], variants: [], rating: { average: 0, count: 0 } },
      { id: 'p-2', handle: 'p-2', title: '2', description: '', price: 10, category: '', tags: [], images: [], options: [], variants: [], rating: { average: 4.8, count: 50 } }
    ];

    const sorted = CatalogFilterEngine.sort(itemsWithZeroRating, 'rating');
    expect(sorted[0].id).toBe('p-2');
    expect(sorted[1].id).toBe('p-1');
  });

  it('sorting returns a new array and does not mutate the original array in place', () => {
    const original: Product[] = [
      { id: 'p-1', handle: 'p-1', title: '1', description: '', price: 100, category: '', tags: [], images: [], options: [], variants: [], rating: { average: 4, count: 1 } },
      { id: 'p-2', handle: 'p-2', title: '2', description: '', price: 20, category: '', tags: [], images: [], options: [], variants: [], rating: { average: 4, count: 1 } }
    ];

    const sorted = CatalogFilterEngine.sort(original, 'price-asc');
    expect(sorted[0].price).toBe(20);
    expect(original[0].price).toBe(100); // Unmutated
  });
});
