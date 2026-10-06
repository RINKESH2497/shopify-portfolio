import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine, CheckoutStateMachine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 08 - Checkout Validation Edge Cases & Incomplete Steps', () => {
  const store = STORE_FIXTURES.coffee;

  it('empty required fields (firstName, lastName, address, city, postalCode) reject submission', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    expect(() => {
      checkout.setCustomerInfo({
        email: 'test@example.com',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'US'
      });
    }).toThrow();
  });

  it('invalid email without @ or domain rejects submission', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    expect(() => {
      checkout.setCustomerInfo({
        email: 'invalid-email-address',
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Town',
        postalCode: '12345',
        country: 'US'
      });
    }).toThrow('Invalid email address');
  });

  it('credit card number with fewer than 13 digits rejects payment', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    checkout.setCustomerInfo({
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Town',
      postalCode: '12345',
      country: 'US'
    });
    checkout.setShippingMethod({ id: 'standard', name: 'Standard', rate: 5.0 });

    expect(() => {
      checkout.processPayment({
        cardNumber: '12345678', // only 8 digits
        expiry: '12/28',
        cvc: '123',
        isDemo: true
      });
    }).toThrow('Valid credit card number required');
  });

  it('stepping to shipping before information step throws error', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    expect(checkout.step).toBe('information');
    expect(() => {
      checkout.setShippingMethod({ id: 'standard', name: 'Standard', rate: 5.0 });
    }).toThrow('Cannot set shipping before information step');
  });

  it('stepping to payment before shipping step throws error', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    expect(() => {
      checkout.processPayment({
        cardNumber: '4242 4242 4242 4242',
        expiry: '12/28',
        cvc: '123',
        isDemo: true
      });
    }).toThrow('Cannot process payment before shipping step');
  });

  it('missing demo mode acknowledgement in payment rejects transaction', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    checkout.setCustomerInfo({
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Town',
      postalCode: '12345',
      country: 'US'
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
});
