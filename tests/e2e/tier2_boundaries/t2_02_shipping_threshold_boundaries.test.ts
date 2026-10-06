import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 02 - Free Shipping Threshold Edge Values', () => {
  const store = STORE_FIXTURES.coffee; // threshold = 50.0

  it('subtotal $0.01 under threshold ($49.99): shipping is still charged and amount needed is $0.01', () => {
    const cart = new CartEngine(store.config);
    const prod = {
      ...store.products[0],
      variants: [{ ...store.products[0].variants[0], price: 49.99 }]
    };
    cart.addItem(prod, prod.variants[0].id, 1);

    const calc = cart.getCalculation();
    expect(calc.subtotal).toBe(49.99);
    expect(calc.shipping).toBe(store.config.standardShippingRate);
    expect(calc.amountNeededForFreeShipping).toBe(0.01);
    expect(calc.freeShippingProgress).toBeLessThanOrEqual(100);
  });

  it('subtotal exact threshold ($50.00): qualifies for free shipping immediately', () => {
    const cart = new CartEngine(store.config);
    const prod = {
      ...store.products[0],
      variants: [{ ...store.products[0].variants[0], price: 50.0 }]
    };
    cart.addItem(prod, prod.variants[0].id, 1);

    const calc = cart.getCalculation();
    expect(calc.subtotal).toBe(50.0);
    expect(calc.shipping).toBe(0.0);
    expect(calc.amountNeededForFreeShipping).toBe(0.0);
    expect(calc.freeShippingProgress).toBe(100);
  });

  it('subtotal $0.01 above threshold ($50.01): qualifies for free shipping', () => {
    const cart = new CartEngine(store.config);
    const prod = {
      ...store.products[0],
      variants: [{ ...store.products[0].variants[0], price: 50.01 }]
    };
    cart.addItem(prod, prod.variants[0].id, 1);

    const calc = cart.getCalculation();
    expect(calc.subtotal).toBe(50.01);
    expect(calc.shipping).toBe(0.0);
    expect(calc.amountNeededForFreeShipping).toBe(0.0);
    expect(calc.freeShippingProgress).toBe(100);
  });

  it('store configured with $0.00 free shipping threshold gives free shipping to all purchases', () => {
    const zeroThresholdConfig = { ...store.config, freeShippingThreshold: 0 };
    const cart = new CartEngine(zeroThresholdConfig);
    cart.addItem(store.products[0], undefined, 1);

    const calc = cart.getCalculation();
    expect(calc.shipping).toBe(0.0);
    expect(calc.freeShippingProgress).toBe(0);
  });

  it('extreme high threshold calculates clean small percentage without NaN', () => {
    const highThresholdConfig = { ...store.config, freeShippingThreshold: 10000.0 };
    const cart = new CartEngine(highThresholdConfig);
    const prod = {
      ...store.products[0],
      variants: [{ ...store.products[0].variants[0], price: 20.0 }]
    };
    cart.addItem(prod, prod.variants[0].id, 1);

    const calc = cart.getCalculation();
    expect(calc.subtotal).toBe(20.0);
    expect(calc.freeShippingProgress).toBe(0); // 20 / 10000 = 0.2% -> rounds to 0%
    expect(calc.amountNeededForFreeShipping).toBe(9980.0);
  });

  it('free shipping progress clamps to 100% even if subtotal is 10x the threshold', () => {
    const cart = new CartEngine(store.config);
    const prod = {
      ...store.products[0],
      variants: [{ ...store.products[0].variants[0], price: 500.0 }]
    };
    cart.addItem(prod, prod.variants[0].id, 1);

    const calc = cart.getCalculation();
    expect(calc.subtotal).toBe(500.0);
    expect(calc.freeShippingProgress).toBe(100); // Clamped, not 1000%
  });
});
