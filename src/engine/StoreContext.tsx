/**
 * StoreContext - Multi-Store Catalog & Configuration Engine
 *
 * Provides:
 * - Active store resolution & runtime switching
 * - Active store configuration (branding, theme tokens, navigation, sections)
 * - Product catalog lookups (by handle, by id, by category)
 * - Recommendation & related product queries
 * - Extensible store registry allowing zero-engine-change additions
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { StoreConfig, StoreRegistry } from '../types/store';
import { Product } from '../types/product';
import { ThemeTokens } from '../types/theme';
import {
  INITIAL_STORE_REGISTRY,
  getStoreRegistry,
  DEFAULT_STORE_ID,
} from '../stores/registry';

// ---------------------------------------------------------------------------
// Default Store Configurations (Coffee, Fashion, Jewelry, Electronics)
// ---------------------------------------------------------------------------

export const DEFAULT_COFFEE_THEME: ThemeTokens = {
  colors: {
    primary: '#2C1810',
    secondary: '#8B5A2B',
    accent: '#D4A373',
    background: '#FAEDCD',
    surface: '#FEFAE0',
    text: '#2C1810',
    textMuted: '#6B4423',
    border: '#E9D8A6',
  },
  typography: {
    headingFont: 'Fraunces, serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    scale: 'expressive',
  },
  shape: {
    borderRadius: '2xl',
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
};

export const DEFAULT_FASHION_THEME: ThemeTokens = {
  colors: {
    primary: '#0A0A0A',
    secondary: '#262626',
    accent: '#E5E5E5',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#0A0A0A',
    textMuted: '#737373',
    border: '#E5E5E5',
  },
  typography: {
    headingFont: 'Syne, sans-serif',
    bodyFont: 'Inter, sans-serif',
    scale: 'expressive',
  },
  shape: {
    borderRadius: 'none',
    cardStyle: 'flat',
  },
  layout: {
    headerStyle: 'left-aligned',
    heroVariant: 'fullscreen',
    contentDensity: 'spacious',
  },
  animation: {
    intensity: 'cinematic',
  },
};

export const DEFAULT_JEWELRY_THEME: ThemeTokens = {
  colors: {
    primary: '#C5A059',
    secondary: '#1A1815',
    accent: '#DFBD78',
    background: '#0D0C0A',
    surface: '#1E1C18',
    text: '#FAF7F2',
    textMuted: '#A39988',
    border: '#3D372E',
  },
  typography: {
    headingFont: 'Cormorant Garamond, serif',
    bodyFont: 'Montserrat, sans-serif',
    scale: 'normal',
  },
  shape: {
    borderRadius: 'md',
    cardStyle: 'bordered',
  },
  layout: {
    headerStyle: 'transparent-overlay',
    heroVariant: 'standard',
    contentDensity: 'spacious',
  },
  animation: {
    intensity: 'smooth',
  },
};

export const DEFAULT_ELECTRONICS_THEME: ThemeTokens = {
  colors: {
    primary: '#00E5FF',
    secondary: '#7C4DFF',
    accent: '#FF0055',
    background: '#0B0F19',
    surface: '#131B2E',
    text: '#E2E8F0',
    textMuted: '#94A3B8',
    border: '#1E293B',
  },
  typography: {
    headingFont: 'Space Grotesk, sans-serif',
    bodyFont: 'Inter, sans-serif',
    scale: 'compact',
  },
  shape: {
    borderRadius: 'sm',
    cardStyle: 'elevated',
  },
  layout: {
    headerStyle: 'tech-hud',
    heroVariant: 'standard',
    contentDensity: 'dense',
  },
  animation: {
    intensity: 'snappy',
  },
};

export const DEFAULT_COFFEE_CONFIG: StoreConfig = {
  id: 'coffee',
  name: 'Terroir & Roast',
  tagline: 'Single-origin beans roasted to perfection in small batches',
  industry: 'coffee',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 50.0,
  standardShippingRate: 5.0,
  taxRate: 0.08,
  theme: DEFAULT_COFFEE_THEME,
  sections: [
    {
      id: 's-hero',
      type: 'hero-split',
      settings: {
        heading: 'Craft Roasted In Small Batches',
        imageUrl: 'https://images.unsplash.com/photo-coffee-hero',
        imageAlt: 'Artisan Coffee Roasting',
        primaryCtaText: 'Shop Harvest',
        primaryCtaLink: '/coffee/collections/single-origin',
      },
    },
    {
      id: 's-marquee',
      type: 'marquee',
      settings: {
        items: ['Free Shipping Over $50', 'Ethically Sourced', 'Direct Trade', 'Small-Batch Roasted'],
      },
    },
    {
      id: 's-featured',
      type: 'featured-products',
      settings: {
        heading: 'Seasonal Harvest',
        limit: 4,
      },
    },
    {
      id: 's-story',
      type: 'image-with-text',
      settings: {
        heading: 'From Soil to Cup',
        content: 'We partner directly with sustainable micro-lot farmers.',
        imageUrl: 'https://images.unsplash.com/photo-coffee-story',
        imageAlt: 'Coffee Farm Harvest',
      },
    },
    {
      id: 's-carousel',
      type: 'product-carousel',
      settings: {
        heading: 'Barista Favorites',
      },
    },
    {
      id: 's-testimonials',
      type: 'testimonials',
      settings: {
        heading: 'What Coffee Lovers Say',
        testimonials: [
          {
            id: 'test-1',
            author: 'Marcus Vance',
            quote: 'The cleanest Ethiopian cup I have ever had.',
            rating: 5,
          },
        ],
      },
    },
    {
      id: 's-newsletter',
      type: 'newsletter-signup',
      settings: {
        heading: 'Subscribe for 10% off',
        placeholder: 'Enter your email for 10% off',
      },
    },
  ],
  navigation: [
    { label: 'Single Origin', href: '/coffee/collections/single-origin' },
    { label: 'Blends', href: '/coffee/collections/blends' },
    { label: 'Brew Gear', href: '/coffee/collections/brew-gear' },
    { label: 'Subscriptions', href: '/coffee/collections/subscriptions' },
  ],
};

export const DEFAULT_FASHION_CONFIG: StoreConfig = {
  id: 'fashion',
  name: 'Atelier Noir',
  tagline: 'Minimalist silhouettes crafted with architectural precision',
  industry: 'fashion',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 100.0,
  standardShippingRate: 10.0,
  taxRate: 0.08,
  theme: DEFAULT_FASHION_THEME,
  sections: [
    {
      id: 's-hero',
      type: 'hero-fullscreen',
      settings: {
        heading: 'AUTUMN / WINTER 2026',
        mediaUrl: 'https://images.unsplash.com/photo-fashion-hero',
        primaryCtaText: 'Explore Collection',
        primaryCtaLink: '/fashion/collections/outerwear',
      },
    },
    {
      id: 's-editorial',
      type: 'editorial-grid',
      settings: {
        heading: 'The Monochrome Edit',
        items: [
          {
            title: 'Structured Virgin Wool',
            imageUrl: 'https://images.unsplash.com/photo-fashion-ed1',
          },
        ],
      },
    },
    {
      id: 's-featured',
      type: 'featured-products',
      settings: {
        heading: 'Key Pieces',
        limit: 4,
      },
    },
    {
      id: 's-collections',
      type: 'collection-cards',
      settings: {
        heading: 'Curated Categories',
        collections: [
          {
            handle: 'outerwear',
            title: 'Outerwear',
            imageUrl: 'https://images.unsplash.com/photo-fashion-cat1',
          },
        ],
      },
    },
    {
      id: 's-marquee',
      type: 'marquee',
      settings: {
        items: ['COMPLIMENTARY GLOBAL SHIPPING OVER $100', 'EXPRESS COURIER', 'PRIVATE CLIENT SALON'],
      },
    },
    {
      id: 's-newsletter',
      type: 'newsletter-signup',
      settings: {
        heading: 'Join the private atelier list',
        placeholder: 'Enter your email',
      },
    },
  ],
  navigation: [
    { label: 'Outerwear', href: '/fashion/collections/outerwear' },
    { label: 'Tailoring', href: '/fashion/collections/tailoring' },
    { label: 'Knitwear', href: '/fashion/collections/knitwear' },
    { label: 'Footwear', href: '/fashion/collections/footwear' },
  ],
};

export const DEFAULT_JEWELRY_CONFIG: StoreConfig = {
  id: 'jewelry',
  name: "L'Étoile Joaillerie",
  tagline: 'Haute horlogerie and timeless fine jewelry handcrafted in Paris',
  industry: 'jewelry',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 200.0,
  standardShippingRate: 15.0,
  taxRate: 0.08,
  theme: DEFAULT_JEWELRY_THEME,
  sections: [
    {
      id: 's-hero',
      type: 'hero-standard',
      settings: {
        heading: 'The High Jewelry Collection',
        primaryCtaText: 'Discover Masterpieces',
        primaryCtaLink: '/jewelry/collections/high-jewelry',
      },
    },
    {
      id: 's-featured',
      type: 'featured-products',
      settings: {
        heading: 'Masterpiece Creations',
      },
    },
    {
      id: 's-story',
      type: 'image-with-text',
      settings: {
        heading: 'Generations of Craftsmanship',
        content: 'Handcrafted in Paris using ethically sourced natural stones and 18k solid gold.',
        imageUrl: 'https://images.unsplash.com/photo-jewelry-story',
        imageAlt: 'Artisan crafting gold ring',
      },
    },
    {
      id: 's-reviews',
      type: 'reviews-breakdown',
      settings: {
        heading: 'Client Testimonials & Ratings',
        averageRating: 4.9,
        totalReviews: 128,
      },
    },
    {
      id: 's-faq',
      type: 'faq-accordion',
      settings: {
        heading: 'Bespoke Inquiries & Diamond Certification',
        items: [
          {
            question: 'Are diamonds GIA certified?',
            answer: 'All diamonds over 0.50 carats are independently certified by GIA.',
          },
        ],
      },
    },
    {
      id: 's-newsletter',
      type: 'newsletter-signup',
      settings: {
        heading: 'Subscribe for private salon invitations',
        placeholder: 'Your email address',
      },
    },
  ],
  navigation: [
    { label: 'Necklaces', href: '/jewelry/collections/necklaces' },
    { label: 'Rings', href: '/jewelry/collections/rings' },
    { label: 'Earrings', href: '/jewelry/collections/earrings' },
    { label: 'High Jewelry', href: '/jewelry/collections/high-jewelry' },
  ],
};

export const DEFAULT_ELECTRONICS_CONFIG: StoreConfig = {
  id: 'electronics',
  name: 'Nexus Tech',
  tagline: 'Next-generation computing hardware, audio engineering & robotics',
  industry: 'electronics',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 75.0,
  standardShippingRate: 8.0,
  taxRate: 0.08,
  theme: DEFAULT_ELECTRONICS_THEME,
  sections: [
    {
      id: 's-hero',
      type: 'hero-standard',
      settings: {
        heading: 'QUANTUM SPEED. ZERO LATENCY.',
        primaryCtaText: 'Shop Hardware',
        primaryCtaLink: '/electronics/collections/keyboards',
      },
    },
    {
      id: 's-marquee',
      type: 'marquee',
      settings: {
        items: ['WIFI 7 CERTIFIED', '240HZ OLED DISPLAYS', 'NEXT-GEN SILICON', '< 1MS LATENCY'],
      },
    },
    {
      id: 's-featured',
      type: 'featured-products',
      settings: {
        heading: 'Flagship Hardware',
      },
    },
    {
      id: 's-carousel',
      type: 'product-carousel',
      settings: {
        heading: 'Audio & Acoustics',
      },
    },
    {
      id: 's-logo-cloud',
      type: 'logo-cloud',
      settings: {
        heading: 'Industry Partners',
        logos: [{ name: 'Nvidia' }, { name: 'Intel' }, { name: 'AMD' }],
      },
    },
    {
      id: 's-faq',
      type: 'faq-accordion',
      settings: {
        heading: 'Technical Specifications & Warranty',
        items: [
          {
            question: 'What is the standard warranty?',
            answer: 'All hardware is backed by our 2-Year Limited Global Warranty.',
          },
        ],
      },
    },
    {
      id: 's-newsletter',
      type: 'newsletter-signup',
      settings: {
        heading: 'Get dev telemetry updates',
        placeholder: 'Enter developer email',
      },
    },
  ],
  navigation: [
    { label: 'Keyboards', href: '/electronics/collections/keyboards' },
    { label: 'Audio', href: '/electronics/collections/audio' },
    { label: 'Displays', href: '/electronics/collections/displays' },
    { label: 'Components', href: '/electronics/collections/components' },
  ],
};

// Helper to generate realistic starter demo products per industry
function createDefaultStoreProducts(storeId: string): Product[] {
  const configs: Record<string, { titles: string[]; categories: string[]; basePrice: number; optName: string; optValues: string[] }> = {
    coffee: {
      titles: [
        'Ethiopian Yirgacheffe Single Origin',
        'Guatemala Antigua Mountain Roast',
        'Colombian Supremo Reserve',
        'Sumatra Mandheling Dark Roast',
        'Kenyan AA Highland Harvest',
        'Costa Rica Tarrazu Honey Process',
        'Signature Espresso Bar Blend',
        'Cold Brew Slow Drip Blend',
        'Ceramic V60 Dripper Set',
        'Precision Burr Hand Grinder',
        'Double-Walled Glass Server',
        'Gooseneck Temperature Kettle',
        'French Press Copper Edition',
        'AeroPress Travel Kit',
        'Coffee Canister Vacuum Sealed',
        'Monthly Roaster Subscription Box',
      ],
      categories: ['Single Origin', 'Blends', 'Brew Gear', 'Subscriptions'],
      basePrice: 18.0,
      optName: 'Grind',
      optValues: ['Whole Bean', 'Filter Grind', 'Espresso Grind'],
    },
    fashion: {
      titles: [
        'Structured Virgin Wool Blazer',
        'Oversized Cashmere Turtleneck',
        'Tailored High-Waist Trousers',
        'Minimalist Poplin Shirt',
        'Double-Breasted Trench Coat',
        'Pleated Crepe Midi Skirt',
        'Boxy Heavyweight Tee',
        'Brushed Mohair Cardigan',
        'Monochrome Leather Derby Shoes',
        'Architectural Heeled Boots',
        'Structured Leather Tote',
        'Silk Chiffon Evening Scarf',
        'Wide Brim Wool Fedora',
        'Calfskin Minimal Belt',
        'Geometric Acetate Sunglasses',
        'Modular Canvas Weekend Duffle',
      ],
      categories: ['Outerwear', 'Tailoring', 'Knitwear', 'Footwear'],
      basePrice: 120.0,
      optName: 'Size',
      optValues: ['XS', 'S', 'M', 'L', 'XL'],
    },
    jewelry: {
      titles: [
        'Étoile Solitaire Diamond Ring',
        'Aura Pavé Diamond Band',
        'Cascade Tahitian Pearl Necklace',
        'Lumière Sapphire Drop Earrings',
        'Constellation Gold Bangle',
        'Heritage Emerald Pendant',
        'Celeste Diamond Tennis Bracelet',
        'Nova Moonstone Cocktail Ring',
        'Solstice Yellow Gold Hoops',
        'Opulence Ruby Choker',
        'Astral Platinum Stud Earrings',
        'Vermeil Statement Cuff',
        'Signature Chain Link Necklace',
        'Bespoke Signet Ring',
        'Diamond Bar Stacking Ring',
        'Celestial Starburst Brooch',
      ],
      categories: ['Rings', 'Necklaces', 'Earrings', 'High Jewelry'],
      basePrice: 350.0,
      optName: 'Metal',
      optValues: ['18k Yellow Gold', '18k Rose Gold', 'Platinum'],
    },
    electronics: {
      titles: [
        'Apex Pro 75% Mechanical Keyboard',
        'CyberPulse Wireless ANC Headphones',
        'QuantumView 27" 240Hz OLED Monitor',
        'Flux Ultra Wireless Gaming Mouse',
        'StudioLink Audio Interface 24-Bit',
        'Titanium Ergonomic Monitor Arm',
        'AeroStream High-Flow Desktop Chassis',
        'Vortex 360mm Liquid CPU Cooler',
        'OmniCharge 140W GaN Fast Charger',
        'Thunderbolt 4 Multiport Dock',
        'Acoustic Studio Desk Speakers',
        'Condenser XLR Broadcast Microphone',
        'Precision Aluminum Mouse Pad',
        'Modular Cable Management Spine',
        'Programmable Macro Pad 9-Key',
        'Ultra-Wide Curved 49" Display',
      ],
      categories: ['Keyboards', 'Audio', 'Displays', 'Components'],
      basePrice: 149.0,
      optName: 'Color',
      optValues: ['Cyber Cyan', 'Matte Black', 'Lunar White'],
    },
  };

  const info = configs[storeId] || configs.coffee;

  return info.titles.map((title, i) => {
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const price = Math.round((info.basePrice + (i * 12.5)) * 100) / 100;
    const category = info.categories[i % info.categories.length];
    const tags = [storeId, category.toLowerCase(), i % 2 === 0 ? 'new-arrival' : 'bestseller'];

    const variants = info.optValues.map((optVal, vIdx) => ({
      id: `var-${storeId}-${i + 1}-${vIdx + 1}`,
      title: `${optVal}`,
      sku: `${storeId.toUpperCase()}-${i + 1}-${optVal.substring(0, 2).toUpperCase()}`,
      price: Math.round((price + (vIdx * 5)) * 100) / 100,
      compareAtPrice: i % 3 === 0 ? Math.round((price * 1.25) * 100) / 100 : undefined,
      options: { [info.optName]: optVal },
      availableForSale: true,
      inventoryQuantity: 25 - (vIdx * 3),
      imageUrl: `https://images.unsplash.com/photo-${storeId}-${i + 1}`,
    }));

    return {
      id: `${storeId}-prod-${i + 1}`,
      handle,
      title,
      subtitle: `Curated craftsmanship by ${storeId.toUpperCase()}`,
      description: `Experience exceptional quality with our ${title}. Designed specifically for connoisseurs of ${category.toLowerCase()}.`,
      price: variants[0].price,
      compareAtPrice: variants[0].compareAtPrice,
      category,
      tags,
      images: [
        {
          id: `img-${storeId}-${i + 1}-1`,
          url: `https://images.unsplash.com/photo-${storeId}-${i + 1}-1`,
          altText: `${title} primary view`,
        },
        {
          id: `img-${storeId}-${i + 1}-2`,
          url: `https://images.unsplash.com/photo-${storeId}-${i + 1}-2`,
          altText: `${title} detail perspective`,
        },
      ],
      options: [
        {
          name: info.optName,
          values: info.optValues,
        },
      ],
      variants,
      rating: {
        average: Math.round((4.2 + ((i % 8) * 0.1)) * 10) / 10,
        count: 14 + (i * 9),
      },
      specifications: storeId === 'electronics' ? {
        Connectivity: 'USB-C / BT 5.4 / 2.4GHz',
        Latency: '< 1ms Ultra Low',
        Warranty: '2-Year Limited Global',
      } : undefined,
      featured: i < 4,
      createdAt: new Date(2026, 0, 1 + i).toISOString(),
    };
  });
}

export const DEFAULT_STORE_REGISTRY: StoreRegistry = {
  coffee: {
    config: DEFAULT_COFFEE_CONFIG,
    products: createDefaultStoreProducts('coffee'),
  },
  fashion: {
    config: DEFAULT_FASHION_CONFIG,
    products: createDefaultStoreProducts('fashion'),
  },
  jewelry: {
    config: DEFAULT_JEWELRY_CONFIG,
    products: createDefaultStoreProducts('jewelry'),
  },
  electronics: {
    config: DEFAULT_ELECTRONICS_CONFIG,
    products: createDefaultStoreProducts('electronics'),
  },
};

// ---------------------------------------------------------------------------
// StoreContext Interface
// ---------------------------------------------------------------------------

export interface StoreContextValue {
  // Active store identification & data
  storeId: string;
  storeConfig: StoreConfig;
  products: Product[];
  isStoreValid: boolean;
  availableStores: { id: string; name: string; industry: string }[];

  // Store switching
  setStoreId: (storeId: string) => void;

  // Catalog query helpers
  getProductByHandle: (handle: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getRelatedProducts: (productId: string, category: string, limit?: number) => Product[];
  getFeaturedProducts: (limit?: number) => Product[];
  getAllCategories: () => string[];
  getAllTags: () => string[];
}

export const StoreContext = createContext<StoreContextValue | null>(null);

export interface StoreProviderProps {
  initialStoreId?: string;
  storeId?: string; // Explicit override
  registry?: StoreRegistry;
  children?: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({
  initialStoreId = 'coffee',
  storeId: explicitStoreId,
  registry = DEFAULT_STORE_REGISTRY,
  children,
}) => {
  const [activeStoreId, setActiveStoreId] = useState<string>(explicitStoreId || initialStoreId);

  // Sync if explicitStoreId prop changes
  useEffect(() => {
    if (explicitStoreId && explicitStoreId !== activeStoreId) {
      setActiveStoreId(explicitStoreId);
    }
  }, [explicitStoreId, activeStoreId]);

  const activeRegistry = registry || DEFAULT_STORE_REGISTRY;
  const isStoreValid = Boolean(activeRegistry[activeStoreId]);

  // Fallback to coffee or first available store if storeId not found
  const resolvedStoreId = isStoreValid
    ? activeStoreId
    : Object.keys(activeRegistry)[0] || 'coffee';

  const currentEntry = activeRegistry[resolvedStoreId] || DEFAULT_STORE_REGISTRY.coffee;
  const currentConfig = currentEntry.config;
  const currentProducts = currentEntry.products;

  // Available stores summary
  const availableStores = useMemo(() => {
    return Object.entries(activeRegistry).map(([id, entry]) => ({
      id,
      name: entry.config.name,
      industry: entry.config.industry,
    }));
  }, [activeRegistry]);

  // Document title sync
  useEffect(() => {
    if (typeof document !== 'undefined' && currentConfig?.name) {
      document.title = `${currentConfig.name} — Shopify Portfolio`;
    }
  }, [currentConfig]);

  const setStoreId = useCallback(
    (newId: string) => {
      if (activeRegistry[newId]) {
        setActiveStoreId(newId);
      } else {
        console.warn(`[StoreContext] Store "${newId}" not found in registry.`);
      }
    },
    [activeRegistry]
  );

  const getProductByHandle = useCallback(
    (handle: string): Product | undefined => {
      if (!handle) return undefined;
      const lower = handle.toLowerCase();
      return currentProducts.find(
        (p) => p.handle.toLowerCase() === lower || p.id.toLowerCase() === lower
      );
    },
    [currentProducts]
  );

  const getProductById = useCallback(
    (id: string): Product | undefined => {
      if (!id) return undefined;
      return currentProducts.find((p) => p.id === id);
    },
    [currentProducts]
  );

  const getProductsByCategory = useCallback(
    (category: string): Product[] => {
      if (!category || category.toLowerCase() === 'all') {
        return currentProducts;
      }
      const catLower = category.toLowerCase();
      return currentProducts.filter(
        (p) =>
          p.category.toLowerCase() === catLower ||
          (p.tags || []).some((t) => t.toLowerCase() === catLower)
      );
    },
    [currentProducts]
  );

  const getRelatedProducts = useCallback(
    (productId: string, category: string, limit: number = 4): Product[] => {
      const pool = currentProducts.filter((p) => p.id !== productId);
      const inCategory = pool.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
      if (inCategory.length >= limit) {
        return inCategory.slice(0, limit);
      }
      const outsideCategory = pool.filter(
        (p) => p.category.toLowerCase() !== category.toLowerCase()
      );
      return [...inCategory, ...outsideCategory].slice(0, limit);
    },
    [currentProducts]
  );

  const getFeaturedProducts = useCallback(
    (limit: number = 4): Product[] => {
      const featured = currentProducts.filter((p) => p.featured === true);
      return featured.length > 0
        ? featured.slice(0, limit)
        : currentProducts.slice(0, limit);
    },
    [currentProducts]
  );

  const getAllCategories = useCallback((): string[] => {
    return Array.from(new Set(currentProducts.map((p) => p.category))).filter(Boolean);
  }, [currentProducts]);

  const getAllTags = useCallback((): string[] => {
    return Array.from(new Set(currentProducts.flatMap((p) => p.tags || []))).filter(Boolean);
  }, [currentProducts]);

  const value = useMemo<StoreContextValue>(
    () => ({
      storeId: resolvedStoreId,
      storeConfig: currentConfig,
      products: currentProducts,
      isStoreValid,
      availableStores,
      setStoreId,
      getProductByHandle,
      getProductById,
      getProductsByCategory,
      getRelatedProducts,
      getFeaturedProducts,
      getAllCategories,
      getAllTags,
    }),
    [
      resolvedStoreId,
      currentConfig,
      currentProducts,
      isStoreValid,
      availableStores,
      setStoreId,
      getProductByHandle,
      getProductById,
      getProductsByCategory,
      getRelatedProducts,
      getFeaturedProducts,
      getAllCategories,
      getAllTags,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): StoreContextValue => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
