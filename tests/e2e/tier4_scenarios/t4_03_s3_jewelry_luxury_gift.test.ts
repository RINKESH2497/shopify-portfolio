import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { MockStorage, NamespacedStorage } from '../../harness/environment';
import { CartEngine, CheckoutStateMachine } from '../../harness/reference-engine';

describe('Tier 4: Scenario S3 - Luxury Jewelry Multi-Item Gift Selection', () => {
  it('executes luxury jewelry shopping, variant selection, full cart page and threshold unlock', () => {
    const rawStorage = new MockStorage();
    const store = STORE_FIXTURES.jewelry;
    const jewelryStorage = new NamespacedStorage('jewelry', rawStorage);

    // 1. Verify Standard Crest Hero & Gold palette
    expect(store.config.theme.layout.heroVariant).toBe('standard');
    expect(store.config.theme.colors.primary).toBe('#C5A059');

    // 2. Select item 1: Solitaire Diamond Ring with 18K White Gold variant
    const p1 = store.products.find(p => p.title.includes('Solitaire Diamond')) || store.products[0];
    const v1 = p1.variants[1]; // White gold variant

    // 3. Select item 2: Pearl Earrings with matching metal
    const p2 = store.products.find(p => p.title.includes('Pearl')) || store.products[3];
    const v2 = p2.variants[0];

    const cart = new CartEngine(store.config, jewelryStorage);
    cart.addItem(p1, v1.id, 1);
    cart.addItem(p2, v2.id, 1);

    // 4. Verify Dedicated Cart Page calculations ($200 threshold)
    const calc = cart.getCalculation();
    expect(cart.items).toHaveLength(2);
    expect(calc.subtotal).toBeGreaterThanOrEqual(store.config.freeShippingThreshold);
    expect(calc.freeShippingProgress).toBe(100);
    expect(calc.shipping).toBe(0.0);

    const expectedTotal = Math.round((calc.subtotal + calc.tax) * 100) / 100;
    expect(calc.total).toBe(expectedTotal);

    // 5. Checkout with concierge address entry
    const checkout = new CheckoutStateMachine(cart);
    checkout.setCustomerInfo({
      email: 'contessa.elena@luxurydemo.com',
      firstName: 'Elena',
      lastName: 'Montague',
      address: '10 Place Vendôme',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    });
    checkout.setShippingMethod({
      id: 'free',
      name: 'White Glove Armored Delivery',
      rate: 0.0
    });

    const order = checkout.processPayment({
      cardNumber: '4242 4242 4242 4242',
      expiry: '05/29',
      cvc: '999',
      isDemo: true
    });

    expect(order.status).toBe('confirmed');
    expect(order.items).toHaveLength(2);
    expect(order.shippingFee).toBe(0.0);
  });
});
