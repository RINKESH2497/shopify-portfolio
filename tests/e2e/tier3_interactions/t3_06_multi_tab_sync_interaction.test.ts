import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { MockStorage, NamespacedStorage } from '../../harness/environment';
import { CartEngine } from '../../harness/reference-engine';

describe('Tier 3: Interaction 06 - Multi-Tab Storage Event Synchronization', () => {
  const store = STORE_FIXTURES.coffee;

  it('storage event emitted on Tab 1 updates cart state in Tab 2 without page reload', () => {
    const sharedStorage = new MockStorage();

    // Tab 1 setup
    const tab1Storage = new NamespacedStorage(store.config.id, sharedStorage);
    const cartTab1 = new CartEngine(store.config, tab1Storage);

    // Tab 2 setup with storage listener
    const tab2Storage = new NamespacedStorage(store.config.id, sharedStorage);
    const cartTab2 = new CartEngine(store.config, tab2Storage);

    sharedStorage.addListener((evt) => {
      if (evt.key === `shopify_portfolio:${store.config.id}:cart_items`) {
        cartTab2.items = evt.newValue ? JSON.parse(evt.newValue) : [];
      }
    });

    // Tab 1 adds an item
    cartTab1.addItem(store.products[0], undefined, 3);

    // Tab 2 should automatically reflect the updated cart
    expect(cartTab2.items).toHaveLength(1);
    expect(cartTab2.items[0].quantity).toBe(3);
    expect(cartTab2.getCalculation().totalQuantity).toBe(3);
  });

  it('storage clear on Tab 1 updates Tab 2 to empty cart state immediately', () => {
    const sharedStorage = new MockStorage();
    const tab1Storage = new NamespacedStorage(store.config.id, sharedStorage);
    const cartTab1 = new CartEngine(store.config, tab1Storage);

    const tab2Storage = new NamespacedStorage(store.config.id, sharedStorage);
    const cartTab2 = new CartEngine(store.config, tab2Storage);

    sharedStorage.addListener((evt) => {
      if (evt.key === `shopify_portfolio:${store.config.id}:cart_items`) {
        cartTab2.items = evt.newValue ? JSON.parse(evt.newValue) : [];
      }
    });

    cartTab1.addItem(store.products[0], undefined, 2);
    expect(cartTab2.items).toHaveLength(1);

    cartTab1.clear();
    expect(cartTab2.items).toHaveLength(0);
    expect(cartTab2.getCalculation().totalQuantity).toBe(0);
  });
});
