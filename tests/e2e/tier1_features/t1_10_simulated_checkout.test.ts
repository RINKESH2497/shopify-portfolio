import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine, CheckoutStateMachine } from '../../harness/reference-engine';

describe('Tier 1: Feature 10 - Simulated 4-Step Checkout Flow (R1, AC-BN-04)', () => {
  const store = STORE_FIXTURES.coffee;

  it('Step 1: Customer information validation succeeds with valid contact info', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    expect(checkout.step).toBe('information');
    checkout.setCustomerInfo({
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Mercer',
      address: '123 Market St',
      city: 'Seattle',
      postalCode: '98101',
      country: 'United States'
    });

    expect(checkout.step).toBe('shipping');
    expect(checkout.customerInfo?.email).toBe('alex@example.com');
  });

  it('Step 1: Incomplete or invalid email throws validation error', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    expect(() => {
      checkout.setCustomerInfo({
        email: 'invalid-email-string',
        firstName: 'Alex',
        lastName: 'Mercer',
        address: '123 Market St',
        city: 'Seattle',
        postalCode: '98101',
        country: 'United States'
      });
    }).toThrow('Invalid email address');
  });

  it('Step 2: Shipping method selection calculates shipping fee correctly', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    checkout.setCustomerInfo({
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Mercer',
      address: '123 Market St',
      city: 'Seattle',
      postalCode: '98101',
      country: 'United States'
    });

    checkout.setShippingMethod({
      id: 'express',
      name: 'Express Courier',
      rate: 15.0
    });

    expect(checkout.step).toBe('payment');
    expect(checkout.shippingMethod?.rate).toBe(15.0);
  });

  it('Step 3: Payment details require explicit demo mode acknowledgement', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    checkout.setCustomerInfo({
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Mercer',
      address: '123 Market St',
      city: 'Seattle',
      postalCode: '98101',
      country: 'United States'
    });
    checkout.setShippingMethod({ id: 'standard', name: 'Standard', rate: 5.0 });

    expect(() => {
      checkout.processPayment({
        cardNumber: '4242 4242 4242 4242',
        expiry: '12/28',
        cvc: '123',
        isDemo: false
      });
    }).toThrow('Demo transaction confirmation required');
  });

  it('Step 4: Completing checkout generates unique order ID and confirmation order', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 2);
    const checkout = new CheckoutStateMachine(cart);

    checkout.setCustomerInfo({
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Mercer',
      address: '123 Market St',
      city: 'Seattle',
      postalCode: '98101',
      country: 'United States'
    });
    checkout.setShippingMethod({ id: 'standard', name: 'Standard', rate: 5.0 });

    const order = checkout.processPayment({
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/28',
      cvc: '123',
      isDemo: true
    });

    expect(checkout.step).toBe('confirmation');
    expect(order.orderId).toContain('DEMO-ORD-');
    expect(order.status).toBe('confirmed');
    expect(order.total).toBeGreaterThan(0);
  });

  it('completing checkout automatically clears the active cart', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 2);
    const checkout = new CheckoutStateMachine(cart);

    checkout.setCustomerInfo({
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Mercer',
      address: '123 Market St',
      city: 'Seattle',
      postalCode: '98101',
      country: 'United States'
    });
    checkout.setShippingMethod({ id: 'standard', name: 'Standard', rate: 5.0 });
    checkout.processPayment({
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/28',
      cvc: '123',
      isDemo: true
    });

    expect(cart.items).toHaveLength(0);
    expect(cart.getCalculation().totalQuantity).toBe(0);
  });
});
