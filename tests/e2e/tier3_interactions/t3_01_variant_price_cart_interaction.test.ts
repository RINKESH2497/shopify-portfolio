import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 3: Interaction 01 - Variant Selection, Price Recalculation & Cart Integration', () => {
  const store = STORE_FIXTURES.fashion;
  const product = store.products[0];

  it('variant option change updates displayed price and adds item to cart with variant-specific price', () => {
    const cart = new CartEngine(store.config);
    const standardVariant = product.variants[0];
    const premiumVariant = product.variants[product.variants.length - 1];

    expect(premiumVariant.price).toBeGreaterThan(standardVariant.price);

    // Add standard variant
    const item1 = cart.addItem(product, standardVariant.id, 1);
    expect(item1.price).toBe(standardVariant.price);

    // Add premium variant
    const item2 = cart.addItem(product, premiumVariant.id, 1);
    expect(item2.price).toBe(premiumVariant.price);

    expect(cart.items).toHaveLength(2);
    expect(cart.getCalculation().subtotal).toBeCloseTo(standardVariant.price + premiumVariant.price, 2);
  });

  it('adding two different variants of same product preserves distinct line items and quantity counts', () => {
    const cart = new CartEngine(store.config);
    const v1 = product.variants[0];
    const v2 = product.variants[1];

    cart.addItem(product, v1.id, 2);
    cart.addItem(product, v2.id, 3);

    expect(cart.items).toHaveLength(2);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.items[1].quantity).toBe(3);
    expect(cart.getCalculation().totalQuantity).toBe(5);
  });
});
