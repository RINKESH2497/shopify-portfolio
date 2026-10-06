import { describe, it, expect } from '../../harness/test-framework';
import { ThemeTokens } from '../../fixtures/catalog-fixtures';
import { ThemeTokenEngine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 13 - Theme Tokens & CSS Injection Extremes', () => {
  it('theme tokens with none border radius output exact 0px', () => {
    const tokens: ThemeTokens = {
      colors: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff', surface: '#eee', text: '#000', textMuted: '#555', border: '#ccc' },
      typography: { headingFont: 'Syne', bodyFont: 'Inter', scale: 'expressive' },
      shape: { borderRadius: 'none', cardStyle: 'flat' },
      layout: { headerStyle: 'left-aligned', heroVariant: 'fullscreen', contentDensity: 'spacious' },
      animation: { intensity: 'cinematic' }
    };

    const vars = ThemeTokenEngine.toCssVariables(tokens);
    expect(vars['--border-radius']).toBe('0px');
  });

  it('theme tokens with full border radius output pill 9999px', () => {
    const tokens: ThemeTokens = {
      colors: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff', surface: '#eee', text: '#000', textMuted: '#555', border: '#ccc' },
      typography: { headingFont: 'Syne', bodyFont: 'Inter', scale: 'expressive' },
      shape: { borderRadius: 'full', cardStyle: 'elevated' },
      layout: { headerStyle: 'centered', heroVariant: 'standard', contentDensity: 'comfortable' },
      animation: { intensity: 'smooth' }
    };

    const vars = ThemeTokenEngine.toCssVariables(tokens);
    expect(vars['--border-radius']).toBe('9999px');
  });

  it('theme animation intensity snappy outputs fast duration 150ms', () => {
    const tokens: ThemeTokens = {
      colors: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff', surface: '#eee', text: '#000', textMuted: '#555', border: '#ccc' },
      typography: { headingFont: 'Space Grotesk', bodyFont: 'Inter', scale: 'compact' },
      shape: { borderRadius: 'sm', cardStyle: 'flat' },
      layout: { headerStyle: 'tech-hud', heroVariant: 'standard', contentDensity: 'dense' },
      animation: { intensity: 'snappy' }
    };

    const vars = ThemeTokenEngine.toCssVariables(tokens);
    expect(vars['--animation-duration']).toBe('150ms');
  });

  it('theme animation intensity cinematic outputs slower duration 600ms', () => {
    const tokens: ThemeTokens = {
      colors: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff', surface: '#eee', text: '#000', textMuted: '#555', border: '#ccc' },
      typography: { headingFont: 'Syne', bodyFont: 'Inter', scale: 'expressive' },
      shape: { borderRadius: 'none', cardStyle: 'flat' },
      layout: { headerStyle: 'left-aligned', heroVariant: 'fullscreen', contentDensity: 'spacious' },
      animation: { intensity: 'cinematic' }
    };

    const vars = ThemeTokenEngine.toCssVariables(tokens);
    expect(vars['--animation-duration']).toBe('600ms');
  });

  it('3-digit hex colors are correctly passed to CSS custom properties', () => {
    const tokens: ThemeTokens = {
      colors: { primary: '#0af', secondary: '#333', accent: '#f05', background: '#fff', surface: '#eee', text: '#111', textMuted: '#666', border: '#ddd' },
      typography: { headingFont: 'Fraunces', bodyFont: 'Inter', scale: 'normal' },
      shape: { borderRadius: 'md', cardStyle: 'bordered' },
      layout: { headerStyle: 'centered', heroVariant: 'split', contentDensity: 'comfortable' },
      animation: { intensity: 'smooth' }
    };

    const vars = ThemeTokenEngine.toCssVariables(tokens);
    expect(vars['--color-primary']).toBe('#0af');
    expect(vars['--color-accent']).toBe('#f05');
  });

  it('custom fallback font stacks with commas are preserved in font variables', () => {
    const tokens: ThemeTokens = {
      colors: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff', surface: '#eee', text: '#000', textMuted: '#555', border: '#ccc' },
      typography: { headingFont: '"Fraunces", Georgia, serif', bodyFont: 'system-ui, -apple-system, sans-serif', scale: 'normal' },
      shape: { borderRadius: '2xl', cardStyle: 'bordered' },
      layout: { headerStyle: 'centered', heroVariant: 'split', contentDensity: 'comfortable' },
      animation: { intensity: 'smooth' }
    };

    const vars = ThemeTokenEngine.toCssVariables(tokens);
    expect(vars['--font-heading']).toBe('"Fraunces", Georgia, serif');
    expect(vars['--font-body']).toBe('system-ui, -apple-system, sans-serif');
  });
});
