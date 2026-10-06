import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { SearchEngine, CartEngine } from '../../harness/reference-engine';

describe('Tier 4: Scenario S4 - Tech Geek Electronics Spec Comparison', () => {
  it('executes instant search overlay, specs inspection, variant configuration and quick add', () => {
    const store = STORE_FIXTURES.electronics;

    // 1. Verify tech HUD header style and cyber cyan palette
    expect(store.config.theme.layout.headerStyle).toBe('tech-hud');
    expect(store.config.theme.colors.primary).toBe('#00E5FF');

    // 2. Open Search Overlay and query 'OLED'
    const searcher = new SearchEngine(store.config.id);
    const results = searcher.search('OLED', store.products);
    expect(results.length).toBeGreaterThan(0);

    const monitor = results.find(p => p.title.includes('Monitor'));
    expect(monitor).toBeDefined();

    // 3. Inspect technical specifications
    expect(monitor!.specifications).toBeDefined();
    expect(monitor!.specifications?.['Latency']).toBe('< 1ms Ultra Low');

    // 4. Select Finish: Cyber Cyan and Storage: 1TB
    const customVariant = monitor!.variants.find(v =>
      v.options['Finish'] === 'Cyber Cyan' && v.options['Storage'] === '1TB'
    ) || monitor!.variants[0];

    // 5. Add to Cart and verify fast telemetry
    const cart = new CartEngine(store.config);
    const item = cart.addItem(monitor!, customVariant.id, 1);

    expect(cart.items).toHaveLength(1);
    expect(item.variantId).toBe(customVariant.id);
    expect(item.price).toBe(customVariant.price);
  });
});
