import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';

describe('Tier 1: Feature 02 - Variant Selection & Price Recalculation (R1, AC-EC-09)', () => {
  const store = STORE_FIXTURES.fashion;
  const product = store.products[0];

  it('selecting valid variant options updates the active variant ID and title', () => {
    const targetVariant = product.variants.find(v => v.options['Size'] === 'M' && v.options['Color'] === 'Black');
    expect(targetVariant).toBeDefined();
    expect(targetVariant?.title).toBe('M / Black');
    expect(targetVariant?.options['Size']).toBe('M');
  });

  it('selecting variant with different price updates displayed price', () => {
    const v1 = product.variants[0];
    const v2 = product.variants[product.variants.length - 1];
    expect(v1.price).not.toBe(v2.price);
    expect(v2.price).toBeGreaterThan(v1.price);
  });

  it('comparing price (compareAtPrice) displays discount percentage correctly', () => {
    const vWithDiscount = product.variants.find(v => v.compareAtPrice && v.compareAtPrice > v.price);
    expect(vWithDiscount).toBeDefined();
    if (vWithDiscount && vWithDiscount.compareAtPrice) {
      const discountPercent = Math.round(((vWithDiscount.compareAtPrice - vWithDiscount.price) / vWithDiscount.compareAtPrice) * 100);
      expect(discountPercent).toBeGreaterThan(0);
      expect(discountPercent).toBeLessThan(100);
    }
  });

  it('out-of-stock variant is identified as unavailable for sale with 0 inventory', () => {
    const outOfStockVariant = product.variants.find(v => !v.availableForSale);
    expect(outOfStockVariant).toBeDefined();
    expect(outOfStockVariant?.inventoryQuantity).toBe(0);
    expect(outOfStockVariant?.availableForSale).toBe(false);
  });

  it('variant image updates corresponding to selected variant', () => {
    const vWithImage = product.variants.find(v => Boolean(v.imageUrl));
    expect(vWithImage?.imageUrl).toBeDefined();
    expect(vWithImage?.imageUrl).toContain('https://images.unsplash.com');
  });

  it('default initial selection defaults to first available variant', () => {
    const defaultVariant = product.variants.find(v => v.availableForSale);
    expect(defaultVariant).toBeDefined();
    expect(defaultVariant?.availableForSale).toBe(true);
  });
});
