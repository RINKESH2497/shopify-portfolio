import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { MockStorage, NamespacedStorage } from '../../harness/environment';
import { CartEngine, CheckoutStateMachine } from '../../harness/reference-engine';

describe('Tier 4: Scenario S1 - Coffee Connoisseur Complete Purchase', () => {
  it('executes full coffee connoisseur purchase flow from split hero to confirmed order', () => {
    const rawStorage = new MockStorage();
    const coffeeStorage = new NamespacedStorage('coffee', rawStorage);
    const store = STORE_FIXTURES.coffee;

    // 1. Verify store theme and split hero
    expect(store.config.theme.layout.heroVariant).toBe('split');
    expect(store.config.sections[0].type).toBe('hero-split');

    // 2. Select product "Yirgacheffe Ethiopian Floral"
    const product = store.products.find(p => p.title.includes('Yirgacheffe'));
    expect(product).toBeDefined();

    // 3. Select variant: Whole Bean / 1kg
    const targetVariant = product!.variants.find(v =>
      v.options['Grind'] === 'Whole Bean' && v.options['Weight'] === '1kg'
    );
    expect(targetVariant).toBeDefined();

    // 4. Add 2 units to cart
    const cart = new CartEngine(store.config, coffeeStorage);
    cart.addItem(product!, targetVariant!.id, 2);

    // 5. Verify subtotal and free shipping threshold (threshold = 50.0)
    const calc = cart.getCalculation();
    expect(calc.totalQuantity).toBe(2);
    expect(calc.subtotal).toBeCloseTo(targetVariant!.price * 2, 2);
    expect(calc.subtotal).toBeGreaterThanOrEqual(store.config.freeShippingThreshold);
    expect(calc.freeShippingProgress).toBe(100);
    expect(calc.shipping).toBe(0.0);

    // 6. Proceed to simulated checkout
    const checkout = new CheckoutStateMachine(cart);

    // Information step
    checkout.setCustomerInfo({
      email: 'coffee.lover@artisanroast.com',
      firstName: 'Oliver',
      lastName: 'Vance',
      address: '88 Barista Lane',
      city: 'Portland',
      postalCode: '97205',
      country: 'United States'
    });
    expect(checkout.step).toBe('shipping');

    // Shipping step (qualified for free shipping)
    checkout.setShippingMethod({
      id: 'free',
      name: 'Complimentary Roaster Shipping',
      rate: 0.0
    });
    expect(checkout.step).toBe('payment');

    // Payment step (demo transaction)
    const order = checkout.processPayment({
      cardNumber: '4242 4242 4242 4242',
      expiry: '09/28',
      cvc: '888',
      isDemo: true
    });

    // 7. Verify confirmation and state cleanup
    expect(checkout.step).toBe('confirmation');
    expect(order.orderId).toContain('DEMO-ORD-');
    expect(order.status).toBe('confirmed');
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(2);
    expect(order.shippingFee).toBe(0.0);

    // Cart is cleared after order
    expect(cart.items).toHaveLength(0);
    expect(coffeeStorage.get('cart_items', [])).toHaveLength(0);
  });
});
