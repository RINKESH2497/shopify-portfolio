import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 3: Interaction 02 - Cart Modifications & Dynamic Free Shipping Progress', () => {
  const store = STORE_FIXTURES.coffee; // threshold = 50.0

  it('sequential additions and removals transition progress bar across 0% -> 40% -> 100% -> 40%', () => {
    const cart = new CartEngine(store.config);
    const p1 = { ...store.products[0], variants: [{ ...store.products[0].variants[0], price: 20.0 }] };
    const p2 = { ...store.products[1], variants: [{ ...store.products[1].variants[0], price: 35.0 }] };

    // Initial state: 0%
    expect(cart.getCalculation().freeShippingProgress).toBe(0);

    // Add p1: $20 / $50 = 40%
    cart.addItem(p1, p1.variants[0].id, 1);
    expect(cart.getCalculation().freeShippingProgress).toBe(40);
    expect(cart.getCalculation().shipping).toBe(store.config.standardShippingRate);

    // Add p2: $20 + $35 = $55 (>= $50) -> 100%, shipping = $0
    const item2 = cart.addItem(p2, p2.variants[0].id, 1);
    expect(cart.getCalculation().freeShippingProgress).toBe(100);
    expect(cart.getCalculation().shipping).toBe(0.0);

    // Remove p2: back to $20 -> 40%, shipping reinstated
    cart.removeItem(item2.id);
    expect(cart.getCalculation().freeShippingProgress).toBe(40);
    expect(cart.getCalculation().shipping).toBe(store.config.standardShippingRate);
  });

  it('hitting exactly the free shipping threshold eliminates shipping while updating order total correctly', () => {
    const cart = new CartEngine(store.config);
    const exactProduct = {
      ...store.products[0],
      variants: [{ ...store.products[0].variants[0], price: 25.0 }]
    };

    // 1 item: $25 subtotal + $5 shipping + $2 tax = $32
    const item = cart.addItem(exactProduct, exactProduct.variants[0].id, 1);
    let calc = cart.getCalculation();
    expect(calc.shipping).toBe(5.0);
    expect(calc.total).toBe(32.0);

    // 2 items: $50 subtotal + $0 shipping + $4 tax = $54
    cart.updateQuantity(item.id, 2);
    calc = cart.getCalculation();
    expect(calc.subtotal).toBe(50.0);
    expect(calc.shipping).toBe(0.0);
    expect(calc.freeShippingProgress).toBe(100);
    expect(calc.total).toBe(54.0);
  });
});
