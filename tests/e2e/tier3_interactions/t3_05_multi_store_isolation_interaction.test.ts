import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { MockStorage, NamespacedStorage } from '../../harness/environment';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 3: Interaction 05 - Cross-Store Cart & Data Isolation', () => {
  it('shopping across Coffee, Fashion, and Jewelry stores maintains strict cart isolation', () => {
    const rawStorage = new MockStorage();

    // 1. User shops Coffee
    const coffeeStorage = new NamespacedStorage('coffee', rawStorage);
    const coffeeCart = new CartEngine(STORE_FIXTURES.coffee.config, coffeeStorage);
    coffeeCart.addItem(STORE_FIXTURES.coffee.products[0], undefined, 2);

    // 2. User shops Fashion
    const fashionStorage = new NamespacedStorage('fashion', rawStorage);
    const fashionCart = new CartEngine(STORE_FIXTURES.fashion.config, fashionStorage);
    expect(fashionCart.items).toHaveLength(0); // Cart is initially empty
    fashionCart.addItem(STORE_FIXTURES.fashion.products[0], undefined, 1);

    // 3. User shops Jewelry
    const jewelryStorage = new NamespacedStorage('jewelry', rawStorage);
    const jewelryCart = new CartEngine(STORE_FIXTURES.jewelry.config, jewelryStorage);
    expect(jewelryCart.items).toHaveLength(0);
    jewelryCart.addItem(STORE_FIXTURES.jewelry.products[0], undefined, 1);

    // 4. Return to Coffee and verify Coffee cart is untouched
    const reloadCoffee = new CartEngine(STORE_FIXTURES.coffee.config, coffeeStorage);
    expect(reloadCoffee.items).toHaveLength(1);
    expect(reloadCoffee.items[0].quantity).toBe(2);
    expect(reloadCoffee.items[0].productId).toBe(STORE_FIXTURES.coffee.products[0].id);

    // 5. Total counts verify no cross-store leakage
    expect(coffeeCart.getCalculation().totalQuantity).toBe(2);
    expect(fashionCart.getCalculation().totalQuantity).toBe(1);
    expect(jewelryCart.getCalculation().totalQuantity).toBe(1);
  });

  it('clearing cart in Coffee store preserves Fashion and Jewelry cart contents completely', () => {
    const rawStorage = new MockStorage();
    const coffeeCart = new CartEngine(STORE_FIXTURES.coffee.config, new NamespacedStorage('coffee', rawStorage));
    const fashionCart = new CartEngine(STORE_FIXTURES.fashion.config, new NamespacedStorage('fashion', rawStorage));

    coffeeCart.addItem(STORE_FIXTURES.coffee.products[0], undefined, 2);
    fashionCart.addItem(STORE_FIXTURES.fashion.products[0], undefined, 3);

    coffeeCart.clear();

    expect(coffeeCart.items).toHaveLength(0);
    expect(fashionCart.items).toHaveLength(1);
    expect(fashionCart.items[0].quantity).toBe(3);
  });
});
