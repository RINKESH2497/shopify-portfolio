import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 1: Feature 06 - Free Shipping Threshold & Progress Bar (R1, AC-EC-02)', () => {
  const store = STORE_FIXTURES.coffee; // freeShippingThreshold = 50.0

  it('cart subtotal under threshold calculates correct progress percentage', () => {
    const cart = new CartEngine(store.config);
    // Add product with price ~ 20.0
    const product = store.products[0];
    cart.addItem(product, product.variants[0].id, 1);

    const calc = cart.getCalculation();
    expect(calc.subtotal).toBeLessThan(50.0);
    const expectedProgress = Math.round((calc.subtotal / 50.0) * 100);
    expect(calc.freeShippingProgress).toBe(expectedProgress);
    expect(calc.freeShippingProgress).toBeLessThan(100);
  });

  it('progress percentage clamps to 100% when subtotal reaches or exceeds threshold', () => {
    const cart = new CartEngine(store.config);
    const product = store.products[0];
    cart.addItem(product, product.variants[0].id, 4); // ~80 > 50

    const calc = cart.getCalculation();
    expect(calc.subtotal).toBeGreaterThanOrEqual(50.0);
    expect(calc.freeShippingProgress).toBe(100);
  });

  it('amount needed for free shipping calculates precisely', () => {
    const cart = new CartEngine(store.config);
    const product = store.products[0];
    cart.addItem(product, product.variants[0].id, 1);

    const calc = cart.getCalculation();
    const expectedRemaining = Math.round((50.0 - calc.subtotal) * 100) / 100;
    expect(calc.amountNeededForFreeShipping).toBe(expectedRemaining);
  });

  it('shipping fee drops from standard rate to $0.00 when threshold is met', () => {
    const cart = new CartEngine(store.config);
    const product = store.products[0];

    // Under threshold: standard shipping applied
    cart.addItem(product, product.variants[0].id, 1);
    expect(cart.getCalculation().shipping).toBe(store.config.standardShippingRate);

    // Over threshold: shipping free
    cart.addItem(product, product.variants[0].id, 3);
    expect(cart.getCalculation().shipping).toBe(0.0);
  });

  it('empty cart has 0% progress and does not charge shipping fee', () => {
    const cart = new CartEngine(store.config);
    const calc = cart.getCalculation();
    expect(calc.freeShippingProgress).toBe(0);
    expect(calc.shipping).toBe(0);
    expect(calc.subtotal).toBe(0);
  });

  it('removing item drops progress bar below 100% and reinstates shipping charge', () => {
    const cart = new CartEngine(store.config);
    const p1 = store.products[0];
    const p2 = store.products[1];

    cart.addItem(p1, p1.variants[0].id, 2);
    const item2 = cart.addItem(p2, p2.variants[0].id, 2);

    expect(cart.getCalculation().freeShippingProgress).toBe(100);
    expect(cart.getCalculation().shipping).toBe(0);

    cart.removeItem(item2.id);

    const calcAfter = cart.getCalculation();
    expect(calcAfter.freeShippingProgress).toBeLessThan(100);
    expect(calcAfter.shipping).toBe(store.config.standardShippingRate);
  });
});
