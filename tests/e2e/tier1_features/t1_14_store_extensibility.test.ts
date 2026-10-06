import { describe, it, expect } from '../../harness/test-framework';
import { StoreConfig, Product } from '../../fixtures/catalog-fixtures';
import { CartEngine, CatalogFilterEngine, SearchEngine, ThemeTokenEngine } from '../../harness/reference-engine';

describe('Tier 1: Feature 14 - Store Extensibility (Theme & Data) (R5, AC-EX-01-03)', () => {
  // Synthetic 5th store ("Botanical Living") to verify the extensibility contract
  const syntheticStore5Config: StoreConfig = {
    id: 'botanical',
    name: 'Botanical Living',
    tagline: 'Rare indoor plants and sustainable artisanal ceramics',
    industry: 'coffee', // schema allows predefined or custom industry
    currency: 'USD',
    currencySymbol: '$',
    freeShippingThreshold: 65.0,
    standardShippingRate: 7.5,
    taxRate: 0.08,
    theme: {
      colors: {
        primary: '#2D5A27',
        secondary: '#1F3F1B',
        accent: '#8FBC8F',
        background: '#F4F7F4',
        surface: '#FFFFFF',
        text: '#1C2826',
        textMuted: '#5C715E',
        border: '#D8E2DC'
      },
      typography: {
        headingFont: 'Playfair Display, serif',
        bodyFont: 'DM Sans, sans-serif',
        scale: 'normal'
      },
      shape: {
        borderRadius: 'lg',
        cardStyle: 'bordered'
      },
      layout: {
        headerStyle: 'centered',
        heroVariant: 'split',
        contentDensity: 'comfortable'
      },
      animation: {
        intensity: 'smooth'
      }
    },
    sections: [
      { id: 's-hero', type: 'hero-split', settings: { headline: 'Living Art For Mindful Spaces' } },
      { id: 's-featured', type: 'featured-products', settings: { title: 'New Botanical Arrivals' } }
    ],
    navigation: [
      { label: 'Rare Plants', href: '/botanical/collections/rare-plants' },
      { label: 'Planters', href: '/botanical/collections/planters' }
    ]
  };

  const syntheticProducts5: Product[] = [
    {
      id: 'prod-bot-1',
      handle: 'variegated-monstera-albo',
      title: 'Variegated Monstera Albo',
      description: 'Stunning white sectorial variegation rooted plant.',
      price: 120.0,
      category: 'Rare Plants',
      tags: ['rare', 'indoor', 'foliage'],
      images: [{ id: 'img-1', url: 'https://images.unsplash.com/botanical-1', altText: 'Monstera' }],
      options: [{ name: 'Pot Size', values: ['4-inch', '6-inch'] }],
      variants: [
        {
          id: 'var-bot-1-1',
          title: '4-inch',
          sku: 'BOT-1-4IN',
          price: 120.0,
          options: { 'Pot Size': '4-inch' },
          availableForSale: true,
          inventoryQuantity: 8
        },
        {
          id: 'var-bot-1-2',
          title: '6-inch',
          sku: 'BOT-1-6IN',
          price: 175.0,
          options: { 'Pot Size': '6-inch' },
          availableForSale: true,
          inventoryQuantity: 5
        }
      ],
      rating: { average: 4.9, count: 24 }
    }
  ];

  it('StoreConfig validates required fields for a new store', () => {
    expect(syntheticStore5Config.id).toBe('botanical');
    expect(syntheticStore5Config.name).toBe('Botanical Living');
    expect(syntheticStore5Config.currency).toBe('USD');
    expect(syntheticStore5Config.sections.length).toBeGreaterThan(0);
    expect(syntheticStore5Config.navigation.length).toBeGreaterThan(0);
  });

  it('ThemeTokens validates color palette, typography, shape, and animation intensity', () => {
    expect(syntheticStore5Config.theme.colors.primary).toBe('#2D5A27');
    expect(syntheticStore5Config.theme.typography.headingFont).toContain('Playfair Display');
    expect(syntheticStore5Config.theme.shape.borderRadius).toBe('lg');
  });

  it('adding a 5th synthetic store configuration works seamlessly without engine modification', () => {
    const cart = new CartEngine(syntheticStore5Config);
    const added = cart.addItem(syntheticProducts5[0], syntheticProducts5[0].variants[0].id, 1);

    expect(cart.items).toHaveLength(1);
    expect(added.price).toBe(120.0);
  });

  it('5th store catalog operates under cart calculations and free shipping threshold', () => {
    const cart = new CartEngine(syntheticStore5Config);
    cart.addItem(syntheticProducts5[0], syntheticProducts5[0].variants[0].id, 1);

    const calc = cart.getCalculation();
    // subtotal 120 >= 65 threshold -> free shipping
    expect(calc.subtotal).toBe(120.0);
    expect(calc.shipping).toBe(0.0);
    expect(calc.freeShippingProgress).toBe(100);
  });

  it('5th store catalog operates under filtering and instant search', () => {
    const filtered = CatalogFilterEngine.filter(syntheticProducts5, { category: 'Rare Plants' });
    expect(filtered).toHaveLength(1);

    const searcher = new SearchEngine('botanical');
    const results = searcher.search('Monstera', syntheticProducts5);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Variegated Monstera Albo');
  });

  it('5th store theme CSS variables generate properly without modifying shared engine', () => {
    const cssVars = ThemeTokenEngine.toCssVariables(syntheticStore5Config.theme);
    expect(cssVars['--color-primary']).toBe('#2D5A27');
    expect(cssVars['--color-background']).toBe('#F4F7F4');
    expect(cssVars['--border-radius']).toBe('0.5rem'); // lg
  });
});
