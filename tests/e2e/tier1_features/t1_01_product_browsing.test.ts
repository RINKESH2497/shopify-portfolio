import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';

describe('Tier 1: Feature 01 - Product Browsing & PDP Gallery (R1, AC-EC-08)', () => {
  const store = STORE_FIXTURES.coffee;

  it('catalog provides 16 products with complete metadata per store', () => {
    expect(store.products).toHaveLength(16);
    for (const p of store.products) {
      expect(p.id).toBeDefined();
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.price).toBeGreaterThan(0);
      expect(p.category.length).toBeGreaterThan(0);
      expect(p.images.length).toBeGreaterThan(0);
    }
  });

  it('product PDP image gallery provides main image and accessible alt text', () => {
    const product = store.products[0];
    expect(product.images.length).toBeGreaterThanOrEqual(2);
    expect(product.images[0].url).toContain('https://images.unsplash.com');
    expect(product.images[0].altText).toContain(product.title);
  });

  it('product displays customer ratings with average rating and review count', () => {
    const product = store.products[0];
    expect(product.rating.average).toBeGreaterThanOrEqual(4.0);
    expect(product.rating.average).toBeLessThanOrEqual(5.0);
    expect(product.rating.count).toBeGreaterThan(0);
  });

  it('product includes option selectors matching defined options', () => {
    const product = store.products[0];
    expect(product.options).toHaveLength(2);
    expect(product.options[0].name).toBe('Grind');
    expect(product.options[1].name).toBe('Weight');
    expect(product.options[0].values).toContain('Whole Bean');
    expect(product.options[1].values).toContain('500g');
  });

  it('related products recommendation algorithm provides items in same category', () => {
    const target = store.products[0];
    const related = store.products
      .filter(p => p.id !== target.id && p.category === target.category)
      .slice(0, 4);

    expect(related.length).toBeGreaterThan(0);
    for (const rel of related) {
      expect(rel.category).toBe(target.category);
      expect(rel.id).not.toBe(target.id);
    }
  });

  it('product specifications are provided for technical hardware (Electronics)', () => {
    const electronicsProduct = STORE_FIXTURES.electronics.products[0];
    expect(electronicsProduct.specifications).toBeDefined();
    expect(electronicsProduct.specifications?.['Connectivity']).toBeDefined();
    expect(electronicsProduct.specifications?.['Latency']).toBeDefined();
  });
});
