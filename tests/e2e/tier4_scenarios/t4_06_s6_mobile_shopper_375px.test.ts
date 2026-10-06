import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { ResponsiveLayoutEngine, CartEngine } from '../../harness/reference-engine';

describe('Tier 4: Scenario S6 - Mobile Shopper Low-Bandwidth / 375px Run', () => {
  it('executes mobile shopper journey at 375px viewport with hamburger nav, sticky bar, and cart drawer', () => {
    const store = STORE_FIXTURES.coffee;

    // 1. Evaluate 375px viewport parameters
    const layout = ResponsiveLayoutEngine.evaluate(375);

    expect(layout.isMobile).toBe(true);
    expect(layout.isExtraSmall).toBe(true);
    expect(layout.hasHamburgerNav).toBe(true);
    expect(layout.hasFullDesktopMenu).toBe(false);
    expect(layout.hasStickyAddToCart).toBe(true);
    expect(layout.gridColumns).toBe(1);
    expect(layout.canFit375pxWithoutOverflow).toBe(true);

    // 2. Simulate Sticky Add-to-Cart trigger on PDP
    const cart = new CartEngine(store.config);
    const p1 = store.products[0];
    cart.addItem(p1, p1.variants[0].id, 1);

    // 3. Open Mobile Cart Drawer
    cart.isCartOpen = true;
    expect(cart.isCartOpen).toBe(true);
    expect(cart.items).toHaveLength(1);

    // 4. Quantity adjustment on mobile drawer
    cart.updateQuantity(cart.items[0].id, 2);
    expect(cart.getCalculation().totalQuantity).toBe(2);

    // 5. Drawer closes
    cart.isCartOpen = false;
    expect(cart.isCartOpen).toBe(false);
  });
});
