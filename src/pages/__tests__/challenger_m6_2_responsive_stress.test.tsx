import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ShopifyEngineProvider } from '../../engine';
import { StoreLayout } from '../../components/layout/StoreLayout';
import { Header } from '../../components/layout/Header';
import { MobileNav } from '../../components/layout/MobileNav';
import { HomePage } from '../HomePage';
import { CollectionPage } from '../CollectionPage';
import { ProductPage } from '../ProductPage';
import { AppRoutes } from '../../App';
import { STORE_REGISTRY, getAllStores } from '../../stores/registry';
import { coffeeThemeConfig } from '../../stores/coffee/theme';
import { fashionThemeConfig } from '../../stores/fashion/theme';
import { jewelryThemeConfig } from '../../stores/jewelry/theme';
import { electronicsThemeConfig } from '../../stores/electronics/theme';

describe('Adversarial Stress Verification: Responsive UX, Mobile Interactions & Store Differentiation (Challenger M6-2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // 1. Responsive Breakpoints Verification (320px, 375px, 768px, 1024px, 1440px)
  // =========================================================================
  describe('1. Responsive Layout & Breakpoints Verification', () => {
    it('enforces overflow-x-hidden and w-full on top-level layout container preventing horizontal scroll', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/coffee']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <StoreLayout />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const rootDiv = container.firstElementChild as HTMLElement;
      expect(rootDiv).not.toBeNull();
      expect(rootDiv.className).toContain('overflow-x-hidden');
      expect(rootDiv.className).toContain('w-full');
    });

    it('verifies mobile hamburger menu button triggers < 1024px (lg:hidden) across all 4 store header layouts', () => {
      const storeIds = ['coffee', 'fashion', 'jewelry', 'electronics'] as const;

      for (const storeId of storeIds) {
        let mobileNavOpened = false;
        const { unmount } = render(
          <MemoryRouter initialEntries={[`/${storeId}`]}>
            <ShopifyEngineProvider initialStoreId={storeId}>
              <Header onOpenMobileNav={() => { mobileNavOpened = true; }} />
            </ShopifyEngineProvider>
          </MemoryRouter>
        );

        // Find hamburger toggle button with lg:hidden
        const menuBtn = screen.getByRole('button', { name: /open navigation menu/i });
        expect(menuBtn).toBeInTheDocument();
        expect(menuBtn.className).toContain('lg:hidden');

        // Trigger mobile nav toggle
        fireEvent.click(menuBtn);
        expect(mobileNavOpened).toBe(true);

        unmount();
      }
    });

    it('verifies mobile filter drawer trigger < 1024px (lg:hidden) and desktop sidebar visibility on CollectionPage', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/coffee/collections/all']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CollectionPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      // Mobile filter button must have lg:hidden
      const mobileFilterBtn = screen.getByRole('button', { name: /filters/i });
      expect(mobileFilterBtn).toBeInTheDocument();
      expect(mobileFilterBtn.className).toContain('lg:hidden');

      // Desktop filter sidebar must have hidden lg:block
      const desktopSidebar = container.querySelector('aside');
      expect(desktopSidebar).not.toBeNull();
      expect(desktopSidebar?.className).toContain('hidden');
      expect(desktopSidebar?.className).toContain('lg:block');

      // Clicking mobile filter button opens drawer
      fireEvent.click(mobileFilterBtn);
      expect(screen.getByRole('heading', { level: 2, name: /filter & sort/i })).toBeInTheDocument();
    });

    it('verifies sticky add-to-cart bar triggers < 768px (md:hidden) on ProductPage', () => {
      const product = STORE_REGISTRY.coffee.products[0];

      const { container } = render(
        <MemoryRouter initialEntries={[`/coffee/products/${product.handle}`]}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <Routes>
              <Route path="/:storeId/products/:handle" element={<ProductPage />} />
            </Routes>
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      // Locate sticky mobile add-to-cart bar container
      const stickyBar = container.querySelector('.fixed.bottom-0');
      expect(stickyBar).not.toBeNull();
      expect(stickyBar?.className).toContain('md:hidden');
      expect(stickyBar?.className).toContain('z-30');

      // Verifies product title and formatted price are rendered inside sticky bar
      expect(stickyBar?.textContent).toContain(product.title);
      expect(stickyBar?.textContent).toContain('$22.00');

      // Verifies Add to Cart button is present inside sticky bar
      const stickyAddBtn = stickyBar?.querySelector('button');
      expect(stickyAddBtn).not.toBeNull();
      expect(stickyAddBtn?.textContent).toContain('Add to Cart');
    });

    it('verifies product grid column responsiveness (1 col mobile, 2 col tablet, 3-4 col desktop) on CollectionPage & ProductPage', () => {
      const { container: collectionContainer } = render(
        <MemoryRouter initialEntries={['/coffee/collections/all']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CollectionPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      // CollectionPage product grid: grid-cols-1 sm:grid-cols-2 md:grid-cols-3
      const collectionGrid = collectionContainer.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.md\\:grid-cols-3');
      expect(collectionGrid).not.toBeNull();

      // ProductPage related products grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
      const product = STORE_REGISTRY.coffee.products[0];
      const { container: productContainer } = render(
        <MemoryRouter initialEntries={[`/coffee/products/${product.handle}`]}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <Routes>
              <Route path="/:storeId/products/:handle" element={<ProductPage />} />
            </Routes>
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const relatedGrid = productContainer.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
      expect(relatedGrid).not.toBeNull();
    });
  });

  // =========================================================================
  // 2. Visual Store Differentiation Verification
  // =========================================================================
  describe('2. Four Visually Distinct Demo Stores Verification', () => {
    it('verifies Coffee ("Terroir & Roast") theme specification & catalog options', () => {
      const theme = coffeeThemeConfig.theme;

      // 1. Primary color #2C1810
      expect(theme.colors.primary.toUpperCase()).toBe('#2C1810');

      // 2. Typography: Fraunces + Plus Jakarta Sans
      expect(theme.typography.headingFont).toContain('Fraunces');
      expect(theme.typography.bodyFont).toContain('Plus Jakarta Sans');

      // 3. Shape: rounded-2xl
      expect(theme.shape.borderRadius).toBe('2xl');

      // 4. Hero: Split Hero
      expect(theme.layout.heroVariant).toBe('split');
      expect(coffeeThemeConfig.sections[0].type).toBe('hero-split');

      // 5. Header: Centered header
      expect(theme.layout.headerStyle).toBe('centered');

      // 6. Products: exactly 16 products with Grind and Weight options
      const products = STORE_REGISTRY.coffee.products;
      expect(products.length).toBe(16);

      const coffeeOptionNames = new Set(
        products.flatMap((p) => (p.options || []).map((o) => o.name))
      );
      expect(coffeeOptionNames.has('Grind')).toBe(true);
      expect(coffeeOptionNames.has('Weight')).toBe(true);
    });

    it('verifies Fashion ("Atelier Noir") theme specification & catalog options', () => {
      const theme = fashionThemeConfig.theme;

      // 1. Primary color #0A0A0A
      expect(theme.colors.primary.toUpperCase()).toBe('#0A0A0A');

      // 2. Typography: Syne + Inter
      expect(theme.typography.headingFont).toContain('Syne');
      expect(theme.typography.bodyFont).toContain('Inter');

      // 3. Shape: rounded-none
      expect(theme.shape.borderRadius).toBe('none');

      // 4. Hero: Fullscreen Hero
      expect(theme.layout.heroVariant).toBe('fullscreen');
      expect(fashionThemeConfig.sections[0].type).toBe('hero-fullscreen');

      // 5. Header: Left-aligned header
      expect(theme.layout.headerStyle).toBe('left-aligned');

      // 6. Products: exactly 16 products with Size and Color options
      const products = STORE_REGISTRY.fashion.products;
      expect(products.length).toBe(16);

      const fashionOptionNames = new Set(
        products.flatMap((p) => (p.options || []).map((o) => o.name))
      );
      expect(fashionOptionNames.has('Size')).toBe(true);
      expect(fashionOptionNames.has('Color')).toBe(true);
    });

    it('verifies Jewelry ("L\'Étoile Joaillerie") theme specification & catalog options', () => {
      const theme = jewelryThemeConfig.theme;

      // 1. Primary color #C5A059
      expect(theme.colors.primary.toUpperCase()).toBe('#C5A059');

      // 2. Typography: Cormorant Garamond + Montserrat
      expect(theme.typography.headingFont).toContain('Cormorant Garamond');
      expect(theme.typography.bodyFont).toContain('Montserrat');

      // 3. Shape: rounded-md
      expect(theme.shape.borderRadius).toBe('md');

      // 4. Hero: Standard Hero
      expect(theme.layout.heroVariant).toBe('standard');
      expect(jewelryThemeConfig.sections[0].type).toBe('hero-standard');

      // 5. Header: Transparent-overlay header
      expect(theme.layout.headerStyle).toBe('transparent-overlay');

      // 6. Products: exactly 16 products with Metal, Size or Gemstone options
      const products = STORE_REGISTRY.jewelry.products;
      expect(products.length).toBe(16);

      const jewelryOptionNames = new Set(
        products.flatMap((p) => (p.options || []).map((o) => o.name))
      );
      expect(jewelryOptionNames.has('Metal')).toBe(true);
      expect(jewelryOptionNames.has('Size')).toBe(true);
    });

    it('verifies Electronics ("Nexus Tech") theme specification & catalog options', () => {
      const theme = electronicsThemeConfig.theme;

      // 1. Primary color #00E5FF
      expect(theme.colors.primary.toUpperCase()).toBe('#00E5FF');

      // 2. Typography: Space Grotesk + Inter
      expect(theme.typography.headingFont).toContain('Space Grotesk');
      expect(theme.typography.bodyFont).toContain('Inter');

      // 3. Shape: rounded-sm
      expect(theme.shape.borderRadius).toBe('sm');

      // 4. Hero: Tech HUD Split Hero with telemetry stats
      expect(theme.layout.heroVariant).toBe('split');
      expect(electronicsThemeConfig.sections[0].type).toBe('hero-split');
      const heroStats = (electronicsThemeConfig.sections[0].settings as { stats?: unknown[] }).stats;
      expect(heroStats).toBeDefined();
      expect(heroStats?.length).toBeGreaterThanOrEqual(3);

      // 5. Header: Tech-HUD header
      expect(theme.layout.headerStyle).toBe('tech-hud');

      // 6. Products: exactly 16 products with Storage / Finish options and specifications
      const products = STORE_REGISTRY.electronics.products;
      expect(products.length).toBe(16);

      const elecOptionNames = new Set(
        products.flatMap((p) => (p.options || []).map((o) => o.name))
      );
      expect(elecOptionNames.has('Storage') || elecOptionNames.has('Finish')).toBe(true);

      const hasSpecs = products.some((p) => p.specifications && Object.keys(p.specifications).length > 0);
      expect(hasSpecs).toBe(true);
    });

    it('verifies strict cross-store uniqueness across all visual differentiation dimensions', () => {
      const allStores = getAllStores();
      expect(allStores.length).toBe(4);

      // 1. No two stores share a primary color
      const primaryColors = allStores.map((s) => s.theme.colors.primary.toLowerCase());
      expect(new Set(primaryColors).size).toBe(4);

      // 2. No two stores share a font pairing
      const fontPairings = allStores.map((s) => `${s.theme.typography.headingFont}+${s.theme.typography.bodyFont}`);
      expect(new Set(fontPairings).size).toBe(4);

      // 3. No two stores share a border-radius setting
      const borderRadii = allStores.map((s) => s.theme.shape.borderRadius);
      expect(new Set(borderRadii).size).toBe(4);

      // 4. No two stores share a header style
      const headerStyles = allStores.map((s) => s.theme.layout.headerStyle);
      expect(new Set(headerStyles).size).toBe(4);

      // 5. No two stores share homepage section ordering
      const sectionOrders = allStores.map((s) => s.sections.map((sec) => sec.type).join('->'));
      expect(new Set(sectionOrders).size).toBe(4);

      // 6. Each store contains exactly 16 products (total 64 products)
      const totalProducts = Object.values(STORE_REGISTRY).reduce(
        (sum, entry) => sum + entry.products.length,
        0
      );
      expect(totalProducts).toBe(64);
    });
  });

  // =========================================================================
  // 3. Mobile Interactions & Drawer Workflows
  // =========================================================================
  describe('3. Mobile Interactions & Drawer Usability', () => {
    it('opens MobileNav drawer and allows switching demo stores', () => {
      let closed = false;
      render(
        <MemoryRouter initialEntries={['/coffee']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <MobileNav isOpen={true} onClose={() => { closed = true; }} />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Shop Terroir & Roast/i)).toBeInTheDocument();
      expect(screen.getByText(/Switch Demo Store/i)).toBeInTheDocument();

      // Click fashion store switch button inside mobile nav
      const fashionBtn = screen.getByRole('button', { name: /atelier noir/i });
      fireEvent.click(fashionBtn);
      expect(closed).toBe(true);
    });

    it('handles CollectionPage filter reset and multiple filter toggling in mobile drawer', () => {
      render(
        <MemoryRouter initialEntries={['/coffee/collections/all']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CollectionPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      // Open mobile filter drawer
      const filterBtn = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterBtn);

      // Toggle In Stock filter
      const inStockCheckbox = screen.getByLabelText(/in stock items only/i);
      fireEvent.click(inStockCheckbox);
      expect(inStockCheckbox).toBeChecked();

      // Click Clear all filters
      const clearBtn = screen.getAllByRole('button', { name: /clear all filters/i })[0];
      fireEvent.click(clearBtn);
      expect(inStockCheckbox).not.toBeChecked();
    });

    it('sticky mobile add-to-cart bar triggers cart drawer and quantity update', () => {
      const product = STORE_REGISTRY.coffee.products[0];

      const { container } = render(
        <MemoryRouter initialEntries={[`/coffee/products/${product.handle}`]}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <AppRoutes />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      // Click Add to Cart in the sticky mobile bar
      const stickyBar = container.querySelector('.fixed.bottom-0');
      const stickyAddBtn = stickyBar?.querySelector('button');
      expect(stickyAddBtn).not.toBeNull();
      if (stickyAddBtn) fireEvent.click(stickyAddBtn);

      // Cart Drawer should be displayed with product in cart
      expect(screen.getByText(/Your Cart \(1\)/i)).toBeInTheDocument();
      expect(screen.getAllByText(product.title)[0]).toBeInTheDocument();
    });
  });
});
