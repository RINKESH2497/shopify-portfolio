import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { MockStorage, NamespacedStorage } from '../../harness/environment';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 4: Scenario S5 - Multi-Store Shopping Isolation Check', () => {
  it('navigates through Coffee -> Fashion -> Jewelry and back, verifying zero cart leakage', () => {
    const rawStorage = new MockStorage();

    // 1. Browse Coffee: Add $35 Ethiopian blend
    const coffeeStorage = new NamespacedStorage('coffee', rawStorage);
    const coffeeCart = new CartEngine(STORE_FIXTURES.coffee.config, coffeeStorage);
    const coffeeProduct = {
      ...STORE_FIXTURES.coffee.products[0],
      variants: [{ ...STORE_FIXTURES.coffee.products[0].variants[0], price: 35.0 }]
    };
    coffeeCart.addItem(coffeeProduct, coffeeProduct.variants[0].id, 1);
    expect(coffeeCart.getCalculation().subtotal).toBe(35.0);

    // 2. Switch to Fashion: verify cart is 0 items, then add $120 coat
    const fashionStorage = new NamespacedStorage('fashion', rawStorage);
    const fashionCart = new CartEngine(STORE_FIXTURES.fashion.config, fashionStorage);
    expect(fashionCart.items).toHaveLength(0);
    expect(fashionCart.getCalculation().subtotal).toBe(0.0);

    const fashionProduct = {
      ...STORE_FIXTURES.fashion.products[0],
      variants: [{ ...STORE_FIXTURES.fashion.products[0].variants[0], price: 120.0 }]
    };
    fashionCart.addItem(fashionProduct, fashionProduct.variants[0].id, 1);
    expect(fashionCart.getCalculation().subtotal).toBe(120.0);

    // 3. Switch to Jewelry: verify cart is 0 items
    const jewelryStorage = new NamespacedStorage('jewelry', rawStorage);
    const jewelryCart = new CartEngine(STORE_FIXTURES.jewelry.config, jewelryStorage);
    expect(jewelryCart.items).toHaveLength(0);
    expect(jewelryCart.getCalculation().subtotal).toBe(0.0);

    // 4. Return to Coffee: verify quantity and subtotal are still exactly $35.0
    const reloadedCoffeeCart = new CartEngine(STORE_FIXTURES.coffee.config, coffeeStorage);
    expect(reloadedCoffeeCart.items).toHaveLength(1);
    expect(reloadedCoffeeCart.items[0].quantity).toBe(1);
    expect(reloadedCoffeeCart.getCalculation().subtotal).toBe(35.0);

    // 5. Verify Fashion cart still contains the $120 coat
    const reloadedFashionCart = new CartEngine(STORE_FIXTURES.fashion.config, fashionStorage);
    expect(reloadedFashionCart.items).toHaveLength(1);
    expect(reloadedFashionCart.getCalculation().subtotal).toBe(120.0);
  });
});
