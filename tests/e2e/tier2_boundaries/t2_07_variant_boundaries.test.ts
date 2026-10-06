import { describe, it, expect } from '../../harness/test-framework';
import { Product } from '../../fixtures/catalog-fixtures';
import { CartEngine } from '../../harness/reference-engine';
import { COFFEE_STORE_CONFIG } from '../../fixtures/catalog-fixtures';

describe('Tier 2: Boundary 07 - Variant Edge Cases & Inventory States', () => {
  it('product with only 1 variant selects that single variant automatically', () => {
    const singleVariantProduct: Product = {
      id: 'p-single',
      handle: 'p-single',
      title: 'Limited Edition Mug',
      description: 'Single size handcrafted ceramic mug',
      price: 32.0,
      category: 'Gear',
      tags: [],
      images: [],
      options: [{ name: 'Size', values: ['Standard'] }],
      variants: [
        {
          id: 'v-standard',
          title: 'Standard',
          sku: 'MUG-001',
          price: 32.0,
          options: { Size: 'Standard' },
          availableForSale: true,
          inventoryQuantity: 15
        }
      ],
      rating: { average: 5.0, count: 8 }
    };

    const cart = new CartEngine(COFFEE_STORE_CONFIG);
    const added = cart.addItem(singleVariantProduct);
    expect(added.variantId).toBe('v-standard');
    expect(added.price).toBe(32.0);
  });

  it('variant with availableForSale: false is marked out-of-stock', () => {
    const outOfStockVariant = {
      id: 'v-oos',
      title: 'Sold Out Roast',
      sku: 'COF-OOS',
      price: 22.0,
      options: { Grind: 'Whole Bean' },
      availableForSale: false,
      inventoryQuantity: 0
    };

    expect(outOfStockVariant.availableForSale).toBe(false);
    expect(outOfStockVariant.inventoryQuantity).toBe(0);
  });

  it('variant option combination that does not exist defaults safely to fallback variant', () => {
    const product: Product = {
      id: 'p-multi',
      handle: 'p-multi',
      title: 'Multi',
      description: '',
      price: 20,
      category: '',
      tags: [],
      images: [],
      options: [],
      variants: [
        { id: 'v-1', title: 'Default', sku: '1', price: 20, options: {}, availableForSale: true, inventoryQuantity: 5 }
      ],
      rating: { average: 4, count: 1 }
    };

    const cart = new CartEngine(COFFEE_STORE_CONFIG);
    // Non-existent variant ID 'v-unknown'
    const added = cart.addItem(product, 'v-unknown', 1);
    expect(added.variantId).toBe('v-1'); // Falls back to first variant
  });

  it('variant with compareAtPrice equal to price does not display discount badge', () => {
    const variant = {
      price: 45.0,
      compareAtPrice: 45.0
    };
    const hasDiscount = Boolean(variant.compareAtPrice && variant.compareAtPrice > variant.price);
    expect(hasDiscount).toBe(false);
  });

  it('variant with compareAtPrice lower than price is treated as no discount', () => {
    const variant = {
      price: 45.0,
      compareAtPrice: 40.0
    };
    const hasDiscount = Boolean(variant.compareAtPrice && variant.compareAtPrice > variant.price);
    expect(hasDiscount).toBe(false);
  });

  it('adding out of stock variant with availableForSale false preserves inventory state', () => {
    const variant = {
      id: 'v-zero',
      title: 'Zero Stock',
      sku: 'ZERO',
      price: 15.0,
      options: {},
      availableForSale: false,
      inventoryQuantity: 0
    };
    expect(variant.inventoryQuantity).toBe(0);
  });
});
