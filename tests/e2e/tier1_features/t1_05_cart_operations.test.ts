import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 1: Feature 05 - Cart Add/Remove/Quantity Operations (R1, AC-EC-01, 02, 03)', () => {
  const store = STORE_FIXTURES.coffee;

  it('adding product to cart adds item and updates cart count', () => {
    const cart = new CartEngine(store.config);
    const product = store.products[0];
    const lineItem = cart.addItem(product, product.variants[0].id, 1);

    expect(cart.items).toHaveLength(1);
    expect(lineItem.productId).toBe(product.id);
    expect(lineItem.quantity).toBe(1);
    expect(cart.getCalculation().totalQuantity).toBe(1);
  });

  it('adding same product variant increments quantity instead of duplicate line item', () => {
    const cart = new CartEngine(store.config);
    const product = store.products[0];
    const variantId = product.variants[0].id;

    cart.addItem(product, variantId, 1);
    cart.addItem(product, variantId, 2);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
    expect(cart.getCalculation().totalQuantity).toBe(3);
  });

  it('adding different variant of same product creates distinct line item', () => {
    const cart = new CartEngine(store.config);
    const product = store.products[0];

    cart.addItem(product, product.variants[0].id, 1);
    cart.addItem(product, product.variants[1].id, 1);

    expect(cart.items).toHaveLength(2);
    expect(cart.items[0].variantId).not.toBe(cart.items[1].variantId);
    expect(cart.getCalculation().totalQuantity).toBe(2);
  });

  it('updating item quantity recalculates line item subtotal and totals', () => {
    const cart = new CartEngine(store.config);
    const product = store.products[0];
    const item = cart.addItem(product, product.variants[0].id, 1);

    cart.updateQuantity(item.id, 4);

    expect(cart.items[0].quantity).toBe(4);
    const calc = cart.getCalculation();
    expect(calc.totalQuantity).toBe(4);
    expect(calc.subtotal).toBeCloseTo(product.variants[0].price * 4, 2);
  });

  it('removing item drops total quantity and removes line item from cart', () => {
    const cart = new CartEngine(store.config);
    const p1 = store.products[0];
    const p2 = store.products[1];

    const item1 = cart.addItem(p1, p1.variants[0].id, 1);
    cart.addItem(p2, p2.variants[0].id, 1);

    expect(cart.items).toHaveLength(2);
    cart.removeItem(item1.id);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe(p2.id);
  });

  it('clearing all items returns cart to clean empty state', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 2);
    cart.addItem(store.products[1], undefined, 3);

    expect(cart.items.length).toBeGreaterThan(0);
    cart.clear();

    expect(cart.items).toHaveLength(0);
    const calc = cart.getCalculation();
    expect(calc.subtotal).toBe(0);
    expect(calc.totalQuantity).toBe(0);
  });
});
