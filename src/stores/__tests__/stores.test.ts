import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_STORE_ID,
  STORE_REGISTRY,
  getStoreRegistry,
  getAllStores,
  getAllStoreEntries,
  getStoreConfig,
  getStoreProducts,
  isValidStoreId,
  registerStore,
  resetStoreRegistry,
  coffeeThemeConfig,
  coffeeProducts,
  fashionThemeConfig,
  fashionProducts,
  jewelryThemeConfig,
  jewelryProducts,
  electronicsThemeConfig,
  electronicsProducts,
} from '../index';
import { StoreRegistryEntry } from '../../types/store';

describe('Milestone 4: Store Catalogs, Themes & StoreRegistry', () => {
  beforeEach(() => {
    resetStoreRegistry();
  });

  // =========================================================================
  // 1. StoreRegistry & Lookups
  // =========================================================================
  describe('StoreRegistry core lookups', () => {
    it('sets default store ID to coffee', () => {
      expect(DEFAULT_STORE_ID).toBe('coffee');
    });

    it('contains all 4 primary demo stores in initial registry', () => {
      const registry = getStoreRegistry();
      const keys = Object.keys(registry);
      expect(keys).toContain('coffee');
      expect(keys).toContain('fashion');
      expect(keys).toContain('jewelry');
      expect(keys).toContain('electronics');
      expect(keys.length).toBe(4);
    });

    it('getAllStores returns 4 store configurations', () => {
      const stores = getAllStores();
      expect(stores.length).toBe(4);
      const ids = stores.map((s) => s.id);
      expect(ids).toEqual(['coffee', 'fashion', 'jewelry', 'electronics']);
    });

    it('getAllStoreEntries returns 4 complete entries with config and products', () => {
      const entries = getAllStoreEntries();
      expect(entries.length).toBe(4);
      entries.forEach((entry) => {
        expect(entry.config).toBeDefined();
        expect(entry.products).toBeDefined();
        expect(Array.isArray(entry.products)).toBe(true);
      });
    });

    it('isValidStoreId validates existing and unknown store IDs with case insensitivity', () => {
      expect(isValidStoreId('coffee')).toBe(true);
      expect(isValidStoreId('COFFEE')).toBe(true);
      expect(isValidStoreId('Fashion')).toBe(true);
      expect(isValidStoreId('JEWELRY')).toBe(true);
      expect(isValidStoreId('electronics')).toBe(true);

      expect(isValidStoreId('non-existent')).toBe(false);
      expect(isValidStoreId('')).toBe(false);
      expect(isValidStoreId('random_store')).toBe(false);
    });

    it('getStoreConfig returns correct configuration or undefined', () => {
      const coffee = getStoreConfig('coffee');
      expect(coffee).toBeDefined();
      expect(coffee?.name).toBe('Terroir & Roast');
      expect(coffee?.industry).toBe('coffee');

      const fashion = getStoreConfig('FASHION');
      expect(fashion).toBeDefined();
      expect(fashion?.name).toBe('Atelier Noir');

      const unknown = getStoreConfig('automotive');
      expect(unknown).toBeUndefined();
    });

    it('getStoreProducts returns catalog array or empty array for unknown store', () => {
      const coffee = getStoreProducts('coffee');
      expect(coffee.length).toBe(16);

      const unknown = getStoreProducts('nonexistent');
      expect(unknown).toEqual([]);
    });
  });

  // =========================================================================
  // 2. Product Catalogs: 16 Products Per Store (64 Products Total)
  // =========================================================================
  describe('Product Catalogs & Data Integrity', () => {
    const storeIds = ['coffee', 'fashion', 'jewelry', 'electronics'] as const;

    it('each of the 4 stores has exactly 16 products (64 products total)', () => {
      let totalProducts = 0;
      storeIds.forEach((id) => {
        const prods = getStoreProducts(id);
        expect(prods.length).toBe(16);
        totalProducts += prods.length;
      });
      expect(totalProducts).toBe(64);
    });

    it('all 64 products have unique IDs and handles within their stores', () => {
      storeIds.forEach((storeId) => {
        const prods = getStoreProducts(storeId);
        const ids = new Set(prods.map((p) => p.id));
        const handles = new Set(prods.map((p) => p.handle));
        expect(ids.size).toBe(16);
        expect(handles.size).toBe(16);
      });
    });

    it('every product satisfies strict Product interface requirements', () => {
      const allEntries = getAllStoreEntries();
      allEntries.forEach(({ config, products }) => {
        products.forEach((product) => {
          // Basic fields
          expect(product.id).toBeTruthy();
          expect(product.handle).toMatch(/^[a-z0-9-]+$/);
          expect(product.title).toBeTruthy();
          expect(product.description).toBeTruthy();
          expect(product.category).toBeTruthy();
          expect(product.price).toBeGreaterThan(0);

          // compareAtPrice sanity
          if (product.compareAtPrice !== undefined) {
            expect(product.compareAtPrice).toBeGreaterThan(product.price);
          }

          // Images
          expect(product.images.length).toBeGreaterThan(0);
          product.images.forEach((img) => {
            expect(img.id).toBeTruthy();
            expect(img.url).toMatch(/^https?:\/\//);
            expect(img.altText).toBeTruthy();
            expect(img.altText.length).toBeGreaterThan(5);
          });

          // Options & Variants
          expect(product.options.length).toBeGreaterThan(0);
          product.options.forEach((opt) => {
            expect(opt.name).toBeTruthy();
            expect(opt.values.length).toBeGreaterThan(0);
          });

          expect(product.variants.length).toBeGreaterThan(0);
          product.variants.forEach((v) => {
            expect(v.id).toBeTruthy();
            expect(v.sku).toBeTruthy();
            expect(v.price).toBeGreaterThan(0);
            expect(v.inventoryQuantity).toBeGreaterThanOrEqual(0);
            expect(typeof v.availableForSale).toBe('boolean');
            expect(v.options).toBeDefined();

            // Options on variant must match defined options
            Object.keys(v.options).forEach((optName) => {
              const matchedOpt = product.options.find((o) => o.name === optName);
              expect(matchedOpt).toBeDefined();
              expect(matchedOpt?.values).toContain(v.options[optName]);
            });
          });

          // Ratings
          expect(product.rating.average).toBeGreaterThanOrEqual(1);
          expect(product.rating.average).toBeLessThanOrEqual(5);
          expect(product.rating.count).toBeGreaterThan(0);
        });
      });
    });

    it('electronics products have structured technical specifications', () => {
      electronicsProducts.forEach((p) => {
        expect(p.specifications).toBeDefined();
        const specKeys = Object.keys(p.specifications || {});
        expect(specKeys.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  // =========================================================================
  // 3. Visual Distinction & Theme Token Divergence
  // =========================================================================
  describe('Visual Distinction Between Stores', () => {
    it('all 4 stores have distinct primary colors (no shared primary color)', () => {
      const stores = getAllStores();
      const primaryColors = stores.map((s) => s.theme.colors.primary.toLowerCase());
      const uniqueColors = new Set(primaryColors);
      expect(uniqueColors.size).toBe(4);

      expect(coffeeThemeConfig.theme.colors.primary.toLowerCase()).toBe('#2c1810');
      expect(fashionThemeConfig.theme.colors.primary.toLowerCase()).toBe('#0a0a0a');
      expect(jewelryThemeConfig.theme.colors.primary.toLowerCase()).toBe('#c5a059');
      expect(electronicsThemeConfig.theme.colors.primary.toLowerCase()).toBe('#00e5ff');
    });

    it('all 4 stores have distinct typography font pairings (heading + body)', () => {
      const stores = getAllStores();
      const pairings = stores.map(
        (s) => `${s.theme.typography.headingFont}|${s.theme.typography.bodyFont}`
      );
      const uniquePairings = new Set(pairings);
      expect(uniquePairings.size).toBe(4);

      expect(coffeeThemeConfig.theme.typography.headingFont).toContain('Fraunces');
      expect(fashionThemeConfig.theme.typography.headingFont).toContain('Syne');
      expect(jewelryThemeConfig.theme.typography.headingFont).toContain('Cormorant Garamond');
      expect(electronicsThemeConfig.theme.typography.headingFont).toContain('Space Grotesk');
    });

    it('all 4 stores have distinct border radius settings', () => {
      expect(coffeeThemeConfig.theme.shape.borderRadius).toBe('2xl');
      expect(fashionThemeConfig.theme.shape.borderRadius).toBe('none');
      expect(jewelryThemeConfig.theme.shape.borderRadius).toBe('md');
      expect(electronicsThemeConfig.theme.shape.borderRadius).toBe('sm');
    });

    it('all 4 stores have distinct card styles', () => {
      const stores = getAllStores();
      const cardStyles = stores.map((s) => s.theme.shape.cardStyle);
      const uniqueCardStyles = new Set(cardStyles);
      expect(uniqueCardStyles.size).toBe(4);

      expect(coffeeThemeConfig.theme.shape.cardStyle).toBe('flat');
      expect(fashionThemeConfig.theme.shape.cardStyle).toBe('bordered');
      expect(jewelryThemeConfig.theme.shape.cardStyle).toBe('elevated');
      expect(electronicsThemeConfig.theme.shape.cardStyle).toBe('glassmorphic');
    });

    it('all 4 stores have distinct header styles', () => {
      const stores = getAllStores();
      const headerStyles = stores.map((s) => s.theme.layout.headerStyle);
      const uniqueHeaderStyles = new Set(headerStyles);
      expect(uniqueHeaderStyles.size).toBe(4);

      expect(coffeeThemeConfig.theme.layout.headerStyle).toBe('centered');
      expect(fashionThemeConfig.theme.layout.headerStyle).toBe('left-aligned');
      expect(jewelryThemeConfig.theme.layout.headerStyle).toBe('transparent-overlay');
      expect(electronicsThemeConfig.theme.layout.headerStyle).toBe('tech-hud');
    });

    it('all 4 stores have unique homepage section sequences', () => {
      const stores = getAllStores();
      const sequences = stores.map((s) => s.sections.map((sec) => sec.type).join(' -> '));
      const uniqueSequences = new Set(sequences);
      expect(uniqueSequences.size).toBe(4);
    });

    it('hero sections match design specifications', () => {
      expect(coffeeThemeConfig.sections[0].type).toBe('hero-split');
      expect(fashionThemeConfig.sections[0].type).toBe('hero-fullscreen');
      expect(jewelryThemeConfig.sections[0].type).toBe('hero-standard');
      expect(electronicsThemeConfig.sections[0].type).toBe('hero-split');
    });

    it('free shipping thresholds vary appropriately by industry', () => {
      expect(coffeeThemeConfig.freeShippingThreshold).toBe(50.0);
      expect(electronicsThemeConfig.freeShippingThreshold).toBe(75.0);
      expect(fashionThemeConfig.freeShippingThreshold).toBe(100.0);
      expect(jewelryThemeConfig.freeShippingThreshold).toBe(200.0);
    });
  });

  // =========================================================================
  // 4. Section Configuration Integrity
  // =========================================================================
  describe('Section Configurations', () => {
    it('every section in every store config has a non-empty ID and valid type', () => {
      const stores = getAllStores();
      stores.forEach((store) => {
        expect(store.sections.length).toBeGreaterThanOrEqual(5);
        const sectionIds = new Set(store.sections.map((s) => s.id));
        expect(sectionIds.size).toBe(store.sections.length);

        store.sections.forEach((sec) => {
          expect(sec.id).toBeTruthy();
          expect(sec.type).toBeTruthy();
          expect(sec.settings).toBeDefined();
        });
      });
    });

    it('every store navigation contains at least 4 collection items with valid links', () => {
      const stores = getAllStores();
      stores.forEach((store) => {
        expect(store.navigation.length).toBeGreaterThanOrEqual(4);
        store.navigation.forEach((nav) => {
          expect(nav.label).toBeTruthy();
          expect(nav.href).toMatch(new RegExp(`^/${store.id}/collections/`));
        });
      });
    });
  });

  // =========================================================================
  // 5. Extensibility Contract: Dynamic Registration of a 5th Store
  // =========================================================================
  describe('Store Extensibility Contract', () => {
    it('registerStore adds a new store to the active registry seamlessly', () => {
      const syntheticEntry: StoreRegistryEntry = {
        config: {
          id: 'botanical',
          name: 'Botanical Living',
          tagline: 'Rare indoor plants and sustainable ceramics',
          industry: 'botanical',
          currency: 'USD',
          currencySymbol: '$',
          freeShippingThreshold: 65.0,
          theme: {
            colors: {
              primary: '#2D5A27',
              secondary: '#1F3F1B',
              accent: '#8FBC8F',
              background: '#F4F7F4',
              surface: '#FFFFFF',
              text: '#1C2826',
              textMuted: '#5C715E',
              border: '#D8E2DC',
            },
            typography: {
              headingFont: 'Playfair Display, serif',
              bodyFont: 'DM Sans, sans-serif',
              scale: 'normal',
            },
            shape: {
              borderRadius: 'lg',
              cardStyle: 'bordered',
            },
            layout: {
              headerStyle: 'centered',
              heroVariant: 'split',
              contentDensity: 'comfortable',
            },
            animation: {
              intensity: 'smooth',
            },
          },
          sections: [
            {
              id: 'bot-hero',
              type: 'hero-split',
              settings: {
                heading: 'Living Art For Mindful Spaces',
                imageUrl: 'https://images.unsplash.com/photo-botanical',
                imageAlt: 'Monstera in ceramic pot',
              },
            },
          ],
          navigation: [
            { label: 'Rare Plants', href: '/botanical/collections/rare-plants' },
          ],
        },
        products: [
          {
            id: 'prod-bot-1',
            handle: 'variegated-monstera-albo',
            title: 'Variegated Monstera Albo',
            description: 'Rare sectoral white variegated plant.',
            price: 120.0,
            category: 'Rare Plants',
            tags: ['rare', 'indoor'],
            images: [
              { id: 'img-bot-1', url: 'https://images.unsplash.com/monstera', altText: 'Variegated Monstera leaf' },
            ],
            options: [{ name: 'Size', values: ['4-inch', '6-inch'] }],
            variants: [
              {
                id: 'var-bot-1',
                title: '4-inch',
                sku: 'BOT-MON-4',
                price: 120.0,
                options: { Size: '4-inch' },
                availableForSale: true,
                inventoryQuantity: 5,
              },
            ],
            rating: { average: 4.9, count: 20 },
          },
        ],
      };

      expect(isValidStoreId('botanical')).toBe(false);
      registerStore(syntheticEntry);

      expect(isValidStoreId('botanical')).toBe(true);
      expect(getStoreConfig('botanical')?.name).toBe('Botanical Living');
      expect(getStoreProducts('botanical').length).toBe(1);
      expect(getAllStores().length).toBe(5);

      // Reset works
      resetStoreRegistry();
      expect(isValidStoreId('botanical')).toBe(false);
      expect(getAllStores().length).toBe(4);
    });

    it('registerStore throws when config or config.id is missing', () => {
      expect(() => {
        registerStore({} as any);
      }).toThrow();
    });
  });
});
