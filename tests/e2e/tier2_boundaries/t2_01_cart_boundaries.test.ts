import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 01 - Cart Limits, Quantities & Float Arithmetic', () => {
  const store = STORE_FIXTURES.coffee;

  it('adding item with quantity 0 throws error', () => {
    const cart = new CartEngine(store.config);
    expect(() => {
      cart.addItem(store.products[0], undefined, 0);
    }).toThrow('Quantity must be greater than 0');
  });

  it('adding item with negative quantity throws error', () => {
    const cart = new CartEngine(store.config);
    expect(() => {
      cart.addItem(store.products[0], undefined, -5);
    }).toThrow('Quantity must be greater than 0');
  });

  it('updating quantity to 0 removes the item cleanly', () => {
    const cart = new CartEngine(store.config);
    const item = cart.addItem(store.products[0], undefined, 2);
    expect(cart.items).toHaveLength(1);

    cart.updateQuantity(item.id, 0);
    expect(cart.items).toHaveLength(0);
    expect(cart.getCalculation().totalQuantity).toBe(0);
  });

  it('large integer quantity calculates correct subtotal without overflow', () => {
    const cart = new CartEngine(store.config);
    const product = store.products[0];
    const qty = 9999;
    cart.addItem(product, product.variants[0].id, qty);

    const calc = cart.getCalculation();
    expect(calc.totalQuantity).toBe(qty);
    const expectedSubtotal = Math.round((product.variants[0].price * qty) * 100) / 100;
    expect(calc.subtotal).toBe(expectedSubtotal);
  });

  it('floating point price precision does not produce IEEE 754 precision artifacts', () => {
    const cart = new CartEngine(store.config);
    // Custom product with $19.99 price
    const customProduct = {
      ...store.products[0],
      variants: [{ ...store.products[0].variants[0], price: 19.99 }]
    };

    cart.addItem(customProduct, customProduct.variants[0].id, 3);
    const calc = cart.getCalculation();

    // 19.99 * 3 = 59.97 (not 59.970000000000006)
    expect(calc.subtotal).toBe(59.97);
    expect(String(calc.subtotal).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });

  it('empty cart calculation returns exact zeros without NaN', () => {
    const cart = new CartEngine(store.config);
    const calc = cart.getCalculation();

    expect(calc.subtotal).toBe(0);
    expect(calc.shipping).toBe(0);
    expect(calc.tax).toBe(0);
    expect(calc.total).toBe(0);
    expect(calc.freeShippingProgress).toBe(0);
    expect(calc.totalQuantity).toBe(0);
  });
});
