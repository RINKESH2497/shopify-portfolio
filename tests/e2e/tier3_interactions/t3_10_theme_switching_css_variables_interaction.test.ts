import { describe, it, expect } from '../../harness/test-framework';
import { COFFEE_STORE_CONFIG, FASHION_STORE_CONFIG, ELECTRONICS_STORE_CONFIG } from '../../fixtures/catalog-fixtures';
import { ThemeTokenEngine } from '../../harness/reference-engine';

describe('Tier 3: Interaction 10 - Dynamic Theme Switching & CSS Custom Properties', () => {
  it('navigating from Coffee store to Fashion store swaps all CSS Custom Properties on :root', () => {
    const coffeeVars = ThemeTokenEngine.toCssVariables(COFFEE_STORE_CONFIG.theme);
    const fashionVars = ThemeTokenEngine.toCssVariables(FASHION_STORE_CONFIG.theme);

    // Primary color changes from earthy brown to jet black
    expect(coffeeVars['--color-primary']).toBe('#2C1810');
    expect(fashionVars['--color-primary']).toBe('#0A0A0A');

    // Font heading changes from Fraunces serif to Syne sans
    expect(coffeeVars['--font-heading']).toContain('Fraunces');
    expect(fashionVars['--font-heading']).toContain('Syne');

    // Border radius changes from 1rem to 0px
    expect(coffeeVars['--border-radius']).toBe('1rem');
    expect(fashionVars['--border-radius']).toBe('0px');

    // Animation duration changes
    expect(coffeeVars['--animation-duration']).toBe('300ms');
    expect(fashionVars['--animation-duration']).toBe('600ms');
  });

  it('switching to Electronics store loads cyber cyan palette and snappy animation', () => {
    const electronicsVars = ThemeTokenEngine.toCssVariables(ELECTRONICS_STORE_CONFIG.theme);

    expect(electronicsVars['--color-primary']).toBe('#00E5FF');
    expect(electronicsVars['--font-heading']).toContain('Space Grotesk');
    expect(electronicsVars['--animation-duration']).toBe('150ms');
    expect(electronicsVars['--border-radius']).toBe('0.125rem'); // sm
  });
});
