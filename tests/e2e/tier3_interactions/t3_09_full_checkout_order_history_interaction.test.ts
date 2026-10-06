import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine, CheckoutStateMachine, CompletedOrder } from '../../harness/reference-engine';

describe('Tier 3: Interaction 09 - Full Checkout Completion & Account History Sync', () => {
  const store = STORE_FIXTURES.coffee;

  it('cart with multiple items transitions through all 4 steps, clears cart, and records completed order', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 2);
    cart.addItem(store.products[1], undefined, 1);
    expect(cart.items).toHaveLength(2);

    const initialCalc = cart.getCalculation();
    const checkout = new CheckoutStateMachine(cart);

    // Step 1: Info
    checkout.setCustomerInfo({
      email: 'customer@espresso.com',
      firstName: 'Jordan',
      lastName: 'Smith',
      address: '456 Bean Ave',
      city: 'Portland',
      postalCode: '97201',
      country: 'USA'
    });

    // Step 2: Shipping
    checkout.setShippingMethod({
      id: 'standard',
      name: 'Standard Ground',
      rate: initialCalc.shipping
    });

    // Step 3: Payment
    const completedOrder: CompletedOrder = checkout.processPayment({
      cardNumber: '4242 4242 4242 4242',
      expiry: '11/27',
      cvc: '321',
      isDemo: true
    });

    // Step 4: Confirmation checks
    expect(checkout.step).toBe('confirmation');
    expect(completedOrder.orderId).toContain('DEMO-ORD-');
    expect(completedOrder.items).toHaveLength(2);
    expect(completedOrder.subtotal).toBe(initialCalc.subtotal);

    // Cart is automatically cleared upon completion
    expect(cart.items).toHaveLength(0);
    expect(cart.getCalculation().totalQuantity).toBe(0);
  });

  it('re-browsing store after checkout starts with empty cart while order remains verified', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);

    const checkout = new CheckoutStateMachine(cart);
    checkout.setCustomerInfo({
      email: 'customer@espresso.com',
      firstName: 'Jordan',
      lastName: 'Smith',
      address: '456 Bean Ave',
      city: 'Portland',
      postalCode: '97201',
      country: 'USA'
    });
    checkout.setShippingMethod({ id: 'standard', name: 'Std', rate: 5.0 });
    const order = checkout.processPayment({
      cardNumber: '4242 4242 4242 4242',
      expiry: '11/27',
      cvc: '321',
      isDemo: true
    });

    expect(cart.items).toHaveLength(0);
    expect(order.status).toBe('confirmed');

    // Add new item in new session
    cart.addItem(store.products[2], undefined, 1);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe(store.products[2].id);
  });
});
