import { describe, it, expect } from '../../harness/test-framework';
import { ResponsiveLayoutEngine } from '../../harness/reference-engine';

describe('Tier 1: Feature 13 - Responsive Breakpoints (320px–1440px) (R4, AC-RD-01-06)', () => {
  it('at 375px mobile viewport, mobile hamburger navigation is enabled', () => {
    const layout = ResponsiveLayoutEngine.evaluate(375);
    expect(layout.isMobile).toBe(true);
    expect(layout.hasHamburgerNav).toBe(true);
    expect(layout.hasFullDesktopMenu).toBe(false);
  });

  it('at 375px mobile viewport, sticky add-to-cart bar is enabled for PDP', () => {
    const layout = ResponsiveLayoutEngine.evaluate(375);
    expect(layout.hasStickyAddToCart).toBe(true);
  });

  it('at 375px mobile viewport, single column grid layout is utilized', () => {
    const layout = ResponsiveLayoutEngine.evaluate(375);
    expect(layout.gridColumns).toBe(1);
    expect(layout.canFit375pxWithoutOverflow).toBe(true);
  });

  it('at 1024px desktop viewport, desktop navigation menu is rendered', () => {
    const layout = ResponsiveLayoutEngine.evaluate(1024);
    expect(layout.isDesktop).toBe(true);
    expect(layout.hasFullDesktopMenu).toBe(true);
    expect(layout.hasHamburgerNav).toBe(false);
    expect(layout.gridColumns).toBe(3);
  });

  it('at 1440px large desktop viewport, product grid displays 4 columns', () => {
    const layout = ResponsiveLayoutEngine.evaluate(1440);
    expect(layout.isLargeDesktop).toBe(true);
    expect(layout.gridColumns).toBe(4);
    expect(layout.hasStickyAddToCart).toBe(false);
  });

  it('minimum mobile breakpoint (320px) renders without layout collapse', () => {
    const layout = ResponsiveLayoutEngine.evaluate(320);
    expect(layout.canFit375pxWithoutOverflow).toBe(true);
    expect(layout.isMobile).toBe(true);
    expect(layout.gridColumns).toBe(1);
  });
});
