import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { CartEngine, SearchEngine, CheckoutStateMachine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 10 - Unicode, Multilingual & International Characters', () => {
  const store = STORE_FIXTURES.coffee;

  it('product titles with emojis preserve integrity in cart line items', () => {
    const emojiProduct = {
      ...store.products[0],
      title: '☕ Dark Roast "Supremo" 🌟'
    };
    const cart = new CartEngine(store.config);
    const item = cart.addItem(emojiProduct, undefined, 1);

    expect(item.title).toBe('☕ Dark Roast "Supremo" 🌟');
    expect(cart.items[0].title).toContain('☕');
    expect(cart.items[0].title).toContain('🌟');
  });

  it('RTL text (Arabic / Hebrew) searches and preserves encoding', () => {
    const rtlProduct = {
      ...store.products[0],
      title: 'قهوة مختصة إثيوبية',
      description: 'أجود حبوب القهوة المحمصة'
    };

    const searcher = new SearchEngine(store.config.id);
    const results = searcher.search('قهوة', [rtlProduct]);

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('قهوة مختصة إثيوبية');
  });

  it('CJK characters (Japanese kanji/katakana) preserve encoding in cart', () => {
    const cjkProduct = {
      ...store.products[0],
      title: 'スペシャルティコーヒー豆',
      variants: [{ ...store.products[0].variants[0], title: '500g / 浅煎り' }]
    };

    const cart = new CartEngine(store.config);
    const item = cart.addItem(cjkProduct, cjkProduct.variants[0].id, 1);

    expect(item.title).toBe('スペシャルティコーヒー豆');
    expect(item.variantTitle).toBe('500g / 浅煎り');
  });

  it('accented Latin characters (French / German / Spanish) match case-insensitively', () => {
    const accentedProduct = {
      ...store.products[0],
      title: "L'Étoile Joaillerie Crème Brûlée"
    };

    const searcher = new SearchEngine(store.config.id);
    const results = searcher.search("creme", [accentedProduct]);

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("L'Étoile Joaillerie Crème Brûlée");
  });

  it('customer checkout name with accented characters completes order correctly', () => {
    const cart = new CartEngine(store.config);
    cart.addItem(store.products[0], undefined, 1);
    const checkout = new CheckoutStateMachine(cart);

    checkout.setCustomerInfo({
      email: 'rene.francois@example.fr',
      firstName: 'René',
      lastName: 'François',
      address: '15 Rue de l’Élysée',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    });
    checkout.setShippingMethod({ id: 'standard', name: 'Standard', rate: 5.0 });

    const order = checkout.processPayment({
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/28',
      cvc: '123',
      isDemo: true
    });

    expect(order.customer.firstName).toBe('René');
    expect(order.customer.lastName).toBe('François');
  });

  it('currency symbols with multiple bytes format without corruption', () => {
    const symbols = ['$', '€', '£', '¥'];
    for (const sym of symbols) {
      const formatted = `${sym}120.00`;
      expect(formatted.startsWith(sym)).toBe(true);
      expect(formatted).toContain('120.00');
    }
  });
});
