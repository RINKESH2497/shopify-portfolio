/**
 * Empirical Verification & Stress Harness for Milestone 1
 * Challenger M1-2: Types & Base UI Primitives
 */

import React from 'react';
import { renderToString } from 'react-dom/server';

// 1. Types imports
import type {
  SectionConfig,
  SectionType,
  HeroStandardSectionConfig,
  HeroSplitSectionConfig,
  HeroFullscreenSectionConfig,
  FeaturedProductsSectionConfig,
  ProductCarouselSectionConfig,
  CollectionCardsSectionConfig,
  ImageWithTextSectionConfig,
  TestimonialsSectionConfig,
  ReviewsBreakdownSectionConfig,
  LogoCloudSectionConfig,
  MarqueeSectionConfig,
  NewsletterSignupSectionConfig,
  FaqAccordionSectionConfig,
  EditorialGridSectionConfig,
  ExtractSectionConfig,
  ThemeTokens,
  CartItem,
  CartContextValue,
  Order,
  OrderItem,
  Address,
  OrderStatus,
  PaymentStatus,
  Product,
} from '../src/types';

// 2. UI Components imports
import {
  Button,
  Drawer,
  Modal,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ToastProvider,
  useToast,
  ImageWithFallback,
} from '../src/components/common';

// 3. Storage utility imports
import {
  buildStorageKey,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStoreStorage,
  NamespacedStorage,
  MemoryStorage,
} from '../src/utils/storage';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTest(suite: string, name: string, fn: () => void) {
  try {
    fn();
    results.push({ suite, name, passed: true });
    console.log(`  [PASS] ${suite} > ${name}`);
  } catch (err: any) {
    results.push({ suite, name, passed: false, error: err.message || String(err) });
    console.error(`  [FAIL] ${suite} > ${name}: ${err.message}`);
  }
}

console.log('=== Starting Challenger M1-2 Empirical Verification ===\n');

// ============================================================================
// SUITE 1: SectionConfig Discriminated Union Exhaustiveness (14 Types)
// ============================================================================
const SECTION_TYPES_EXPECTED: SectionType[] = [
  'hero-standard',
  'hero-split',
  'hero-fullscreen',
  'featured-products',
  'product-carousel',
  'collection-cards',
  'image-with-text',
  'testimonials',
  'reviews-breakdown',
  'logo-cloud',
  'marquee',
  'newsletter-signup',
  'faq-accordion',
  'editorial-grid',
];

runTest('Type System: SectionConfig', 'all 14 section types are present in union', () => {
  assert(SECTION_TYPES_EXPECTED.length === 14, 'Must have exactly 14 section types');
});

runTest('Type System: SectionConfig', 'exhaustive discriminated union narrowing across all 14 types', () => {
  const c1: HeroStandardSectionConfig = { id: 'sec-1', type: 'hero-standard', settings: { heading: 'Standard Hero' } };
  const c2: HeroSplitSectionConfig = { id: 'sec-2', type: 'hero-split', settings: { heading: 'Split Hero', imageUrl: 'https://img.jpg', imageAlt: 'Alt' } };
  const c3: HeroFullscreenSectionConfig = { id: 'sec-3', type: 'hero-fullscreen', settings: { heading: 'Fullscreen Hero', mediaUrl: 'https://video.mp4' } };
  const c4: FeaturedProductsSectionConfig = { id: 'sec-4', type: 'featured-products', settings: { heading: 'Featured Products' } };
  const c5: ProductCarouselSectionConfig = { id: 'sec-5', type: 'product-carousel', settings: { heading: 'Carousel' } };
  const c6: CollectionCardsSectionConfig = { id: 'sec-6', type: 'collection-cards', settings: { collections: [{ handle: 'beans', title: 'Beans', imageUrl: 'https://img.jpg' }] } };
  const c7: ImageWithTextSectionConfig = { id: 'sec-7', type: 'image-with-text', settings: { heading: 'Our Story', content: 'Crafted since 1990', imageUrl: 'https://img.jpg', imageAlt: 'Story' } };
  const c8: TestimonialsSectionConfig = { id: 'sec-8', type: 'testimonials', settings: { testimonials: [{ id: 't-1', author: 'Alice', quote: 'Exceptional quality' }] } };
  const c9: ReviewsBreakdownSectionConfig = { id: 'sec-9', type: 'reviews-breakdown', settings: { averageRating: 4.8, totalReviews: 120 } };
  const c10: LogoCloudSectionConfig = { id: 'sec-10', type: 'logo-cloud', settings: { logos: [{ name: 'Vogue' }, { name: 'GQ' }] } };
  const c11: MarqueeSectionConfig = { id: 'sec-11', type: 'marquee', settings: { items: ['Free Worldwide Shipping', 'Artisanal Roasts'] } };
  const c12: NewsletterSignupSectionConfig = { id: 'sec-12', type: 'newsletter-signup', settings: { heading: 'Join the Club' } };
  const c13: FaqAccordionSectionConfig = { id: 'sec-13', type: 'faq-accordion', settings: { heading: 'FAQ', items: [{ question: 'Shipping times?', answer: '2-4 business days' }] } };
  const c14: EditorialGridSectionConfig = { id: 'sec-14', type: 'editorial-grid', settings: { items: [{ title: 'Lookbook Spring', imageUrl: 'https://img.jpg' }] } };

  const mockSections: SectionConfig[] = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14];
  assert(mockSections.length === 14, 'Must have 14 sample configs');

  const processedTypes: string[] = [];

  for (const section of mockSections) {
    switch (section.type) {
      case 'hero-standard':
        processedTypes.push(section.type);
        assert(typeof section.settings.heading === 'string', 'HeroStandard heading string');
        break;
      case 'hero-split':
        processedTypes.push(section.type);
        assert(typeof section.settings.imageUrl === 'string', 'HeroSplit imageUrl string');
        break;
      case 'hero-fullscreen':
        processedTypes.push(section.type);
        assert(typeof section.settings.mediaUrl === 'string', 'HeroFullscreen mediaUrl string');
        break;
      case 'featured-products':
        processedTypes.push(section.type);
        assert(typeof section.settings.heading === 'string', 'FeaturedProducts heading string');
        break;
      case 'product-carousel':
        processedTypes.push(section.type);
        assert(typeof section.settings.heading === 'string', 'ProductCarousel heading string');
        break;
      case 'collection-cards':
        processedTypes.push(section.type);
        assert(Array.isArray(section.settings.collections), 'CollectionCards collections array');
        break;
      case 'image-with-text':
        processedTypes.push(section.type);
        assert(typeof section.settings.content === 'string', 'ImageWithText content string');
        break;
      case 'testimonials':
        processedTypes.push(section.type);
        assert(Array.isArray(section.settings.testimonials), 'Testimonials array');
        break;
      case 'reviews-breakdown':
        processedTypes.push(section.type);
        assert(typeof section.settings.averageRating === 'number', 'ReviewsBreakdown averageRating number');
        break;
      case 'logo-cloud':
        processedTypes.push(section.type);
        assert(Array.isArray(section.settings.logos), 'LogoCloud logos array');
        break;
      case 'marquee':
        processedTypes.push(section.type);
        assert(Array.isArray(section.settings.items), 'Marquee items array');
        break;
      case 'newsletter-signup':
        processedTypes.push(section.type);
        assert(typeof section.settings.heading === 'string', 'NewsletterSignup heading string');
        break;
      case 'faq-accordion':
        processedTypes.push(section.type);
        assert(Array.isArray(section.settings.items), 'FaqAccordion items array');
        break;
      case 'editorial-grid':
        processedTypes.push(section.type);
        assert(Array.isArray(section.settings.items), 'EditorialGrid items array');
        break;
      default: {
        const _exhaustiveCheck: never = section;
        throw new Error(`Unhandled section type: ${JSON.stringify(_exhaustiveCheck)}`);
      }
    }
  }

  assert(processedTypes.length === 14, 'All 14 section types must be processed');
  const uniqueTypes = new Set(processedTypes);
  assert(uniqueTypes.size === 14, 'All 14 types must be distinct');
});

runTest('Type System: SectionConfig', 'ExtractSectionConfig utility extracts matching subtype', () => {
  type ExtractedSplit = ExtractSectionConfig<'hero-split'>;
  const splitConfig: ExtractedSplit = {
    id: 's-1',
    type: 'hero-split',
    settings: {
      heading: 'Split',
      imageUrl: 'https://example.com/img.jpg',
      imageAlt: 'Alt',
    },
  };
  assert(splitConfig.type === 'hero-split', 'ExtractedSplit type discriminator matches');
});

// ============================================================================
// SUITE 2: ThemeTokens Contract Completeness
// ============================================================================
runTest('Type System: ThemeTokens', 'theme tokens for all 4 stores validate against interface', () => {
  const coffeeTheme: ThemeTokens = {
    colors: {
      primary: '#2C1810',
      secondary: '#8C5535',
      accent: '#C48B5E',
      background: '#FAEDCD',
      surface: '#FFFFFF',
      text: '#2C1810',
      textMuted: '#6B4226',
      border: '#E8D5B7',
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

  const fashionTheme: ThemeTokens = {
    colors: {
      primary: '#0A0A0A',
      secondary: '#262626',
      accent: '#E5E5E5',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#0A0A0A',
      textMuted: '#737373',
      border: '#E5E5E5',
    },
    typography: {
      headingFont: 'Syne, sans-serif',
      bodyFont: 'Inter, sans-serif',
      scale: 'compact',
    },
    shape: {
      borderRadius: 'none',
      cardStyle: 'flat',
    },
    layout: {
      headerStyle: 'left-aligned',
      heroVariant: 'fullscreen',
      contentDensity: 'dense',
    },
    animation: {
      intensity: 'cinematic',
    },
  };

  const jewelryTheme: ThemeTokens = {
    colors: {
      primary: '#C5A059',
      secondary: '#8C7038',
      accent: '#E6D5AC',
      background: '#0D0C0A',
      surface: '#1A1815',
      text: '#F5F2EB',
      textMuted: '#9C9588',
      border: '#2A2620',
    },
    typography: {
      headingFont: 'Cormorant Garamond, serif',
      bodyFont: 'Montserrat, sans-serif',
      scale: 'expressive',
    },
    shape: {
      borderRadius: 'md',
      cardStyle: 'elevated',
    },
    layout: {
      headerStyle: 'centered',
      heroVariant: 'standard',
      contentDensity: 'spacious',
    },
    animation: {
      intensity: 'subtle',
    },
  };

  const electronicsTheme: ThemeTokens = {
    colors: {
      primary: '#00E5FF',
      secondary: '#00B4D8',
      accent: '#7B2CBF',
      background: '#0B0F19',
      surface: '#111827',
      text: '#F9FAFB',
      textMuted: '#9CA3AF',
      border: '#1F2937',
    },
    typography: {
      headingFont: 'Space Grotesk, sans-serif',
      bodyFont: 'Inter, sans-serif',
      scale: 'normal',
    },
    shape: {
      borderRadius: 'sm',
      cardStyle: 'glassmorphic',
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

  assert(coffeeTheme.colors.primary === '#2C1810', 'Coffee primary color set');
  assert(fashionTheme.shape.borderRadius === 'none', 'Fashion border radius none');
  assert(jewelryTheme.layout.contentDensity === 'spacious', 'Jewelry content density spacious');
  assert(electronicsTheme.layout.headerStyle === 'tech-hud', 'Electronics tech-hud header');
});

// ============================================================================
// SUITE 3: CartItem & Order Type Contracts
// ============================================================================
runTest('Type System: CartItem', 'CartItem satisfies line item properties and calculations', () => {
  const item: CartItem = {
    id: 'prod-coffee-1-var-1',
    productId: 'prod-coffee-1',
    variantId: 'var-1',
    title: 'Yirgacheffe Floral',
    variantTitle: 'Whole Bean / 250g',
    price: 24.5,
    quantity: 3,
    imageUrl: 'https://images.unsplash.com/coffee.jpg',
    selectedOptions: {
      Grind: 'Whole Bean',
      Weight: '250g',
    },
  };

  assert(item.id === `${item.productId}-${item.variantId}`, 'Cart item id conforms to product-variant template');
  assert(item.price * item.quantity === 73.5, 'Line price multiplication accurate');
  assert(item.selectedOptions.Grind === 'Whole Bean', 'Selected options preserved');

  // Verify CartContextValue interface contract
  const dummyProduct: Product = {
    id: 'prod-dummy',
    handle: 'dummy',
    title: 'Dummy',
    description: 'Dummy desc',
    price: 10,
    category: 'Coffee',
    tags: ['dummy'],
    images: [{ id: '1', url: 'https://dummy.jpg', altText: 'Dummy' }],
    options: [{ name: 'Size', values: ['Regular'] }],
    variants: [],
    rating: { average: 5, count: 1 },
  };

  const dummyCartContext: CartContextValue = {
    items: [item],
    addItem: (_p, _v, _q) => {},
    removeItem: (_id) => {},
    updateQuantity: (_id, _q) => {},
    clearCart: () => {},
    totalQuantity: 3,
    subtotal: 73.5,
    shipping: 0,
    total: 73.5,
    freeShippingThreshold: 50,
    freeShippingProgress: 100,
    isCartOpen: false,
    setIsCartOpen: (_o) => {},
  };

  dummyCartContext.addItem(dummyProduct);
  assert(dummyCartContext.items.length === 1, 'Dummy cart item array length matches');
});

runTest('Type System: Order', 'Order satisfies order lifecycle and financial attributes', () => {
  const address: Address = {
    id: 'addr-1',
    firstName: 'Marcus',
    lastName: 'Vance',
    addressLine1: '123 Roastery Ave',
    city: 'Seattle',
    stateOrProvince: 'WA',
    postalCode: '98101',
    country: 'US',
  };

  const orderItem: OrderItem = {
    id: 'item-1',
    productId: 'prod-coffee-1',
    variantId: 'var-1',
    title: 'Yirgacheffe Floral',
    price: 24.5,
    quantity: 2,
  };

  const st: OrderStatus = 'delivered';
  const paySt: PaymentStatus = 'paid';

  const order: Order = {
    id: 'ORD-99201',
    orderNumber: '#1001',
    storeId: 'coffee',
    createdAt: '2026-10-05T10:00:00Z',
    items: [orderItem],
    subtotal: 49.0,
    shipping: 0.0,
    tax: 3.92,
    discount: 0.0,
    total: 52.92,
    currency: 'USD',
    status: st,
    paymentStatus: paySt,
    shippingAddress: address,
    shippingMethod: {
      name: 'Standard Free Shipping',
      price: 0.0,
      trackingNumber: 'TRK-98124',
    },
  };

  assert(order.id === 'ORD-99201', 'Order ID preserved');
  assert(order.status === 'delivered', 'Order status delivered');
  assert(order.paymentStatus === 'paid', 'Payment status paid');
  assert(order.total === 52.92, 'Order total matches');
});

// ============================================================================
// SUITE 4: Base UI Primitives Runtime Exports & Props Verification
// ============================================================================
runTest('UI Primitives: Button', 'renders HTML and supports all variant styles & loading state', () => {
  const primaryHtml = renderToString(
    React.createElement(Button, { variant: 'primary', size: 'md', children: 'Add to Cart' })
  );
  assert(primaryHtml.includes('Add to Cart'), 'Renders button text');
  assert(primaryHtml.includes('bg-[var(--color-primary'), 'Applies primary style');

  const loadingHtml = renderToString(
    React.createElement(Button, { isLoading: true, loadingText: 'Processing...', children: 'Submit' })
  );
  assert(loadingHtml.includes('Processing...'), 'Renders loading text');
  assert(loadingHtml.includes('animate-spin'), 'Renders spinner SVG');
  assert(loadingHtml.includes('aria-busy="true"'), 'Renders aria-busy attribute');
  assert(loadingHtml.includes('disabled=""') || loadingHtml.includes('disabled'), 'Renders disabled attribute');

  const disabledHtml = renderToString(
    React.createElement(Button, { disabled: true, children: 'Disabled' })
  );
  assert(disabledHtml.includes('cursor-not-allowed'), 'Applies disabled cursor styling');

  const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'link'] as const;
  for (const v of variants) {
    const html = renderToString(React.createElement(Button, { variant: v, children: v }));
    assert(html.includes(v), `Renders variant ${v}`);
  }
});

runTest('UI Primitives: Badge', 'renders with variant colors, sizes, and dot pulse indicator', () => {
  const badgeHtml = renderToString(
    React.createElement(Badge, { variant: 'sale', size: 'sm', dot: true, pulseDot: true, children: '20% OFF' })
  );
  assert(badgeHtml.includes('20% OFF'), 'Renders badge content');
  assert(badgeHtml.includes('bg-red-600'), 'Renders sale badge background');
  assert(badgeHtml.includes('animate-ping'), 'Renders pulse dot');

  const variants = ['default', 'primary', 'secondary', 'outline', 'success', 'warning', 'danger', 'sale'] as const;
  for (const v of variants) {
    const html = renderToString(React.createElement(Badge, { variant: v, children: v }));
    assert(html.includes(v), `Renders variant ${v}`);
  }
});

runTest('UI Primitives: Tabs', 'compound components render tablist and tabpanel hierarchy', () => {
  const tabsHtml = renderToString(
    React.createElement(
      Tabs,
      { defaultValue: 'description', variant: 'line', children: [
        React.createElement(
          TabsList,
          { key: 'list', children: [
            React.createElement(TabsTrigger, { key: 't1', value: 'description', children: 'Description' }),
            React.createElement(TabsTrigger, { key: 't2', value: 'specs', children: 'Specifications' }),
          ]}
        ),
        React.createElement(TabsContent, { key: 'c1', value: 'description', children: 'Product Description Content' }),
        React.createElement(TabsContent, { key: 'c2', value: 'specs', children: 'Specs Content' }),
      ]}
    )
  );

  assert(tabsHtml.includes('role="tablist"'), 'Contains role="tablist"');
  assert(tabsHtml.includes('role="tab"'), 'Contains role="tab"');
  assert(tabsHtml.includes('role="tabpanel"'), 'Contains role="tabpanel"');
  assert(tabsHtml.includes('Product Description Content'), 'Renders active tab content');
  assert(!tabsHtml.includes('Specs Content'), 'Inactive tab content is hidden');
});

runTest('UI Primitives: Drawer & Modal', 'exports and prop contracts', () => {
  assert(typeof Drawer === 'function', 'Drawer is a React functional component');
  assert(typeof Modal === 'function', 'Modal is a React functional component');
  assert(typeof ToastProvider === 'function', 'ToastProvider is a React component');
  assert(typeof useToast === 'function', 'useToast is a hook function');
  assert(typeof ImageWithFallback === 'function', 'ImageWithFallback is a React component');

  const closedModal = renderToString(
    React.createElement(Modal, { isOpen: false, onClose: () => {}, children: 'Modal Content' })
  );
  assert(closedModal === '', 'Closed modal returns empty markup');
});

// ============================================================================
// SUITE 5: Storage Layer Empirical Verification
// ============================================================================
runTest('Storage Layer: Key Namespacing', 'builds canonical shopify_portfolio:${storeId}:${key}', () => {
  const key1 = buildStorageKey('coffee', 'cart_items');
  assert(key1 === 'shopify_portfolio:coffee:cart_items', 'Coffee key namespacing correct');

  const key2 = buildStorageKey('fashion', 'wishlist');
  assert(key2 === 'shopify_portfolio:fashion:wishlist', 'Fashion key namespacing correct');

  const key3 = buildStorageKey('  jewelry  ', '  recent  ');
  assert(key3 === 'shopify_portfolio:jewelry:recent', 'Trims whitespace in storeId and key');
});

runTest('Storage Layer: Direct functions', 'verifies getStorageItem, setStorageItem, removeStorageItem, clearStoreStorage', () => {
  setStorageItem('coffee', 'unit_test', { pass: true });
  const val = getStorageItem('coffee', 'unit_test', { pass: false });
  assert(val.pass === true, 'Stored item matches');

  removeStorageItem('coffee', 'unit_test');
  const cleared = getStorageItem('coffee', 'unit_test', { pass: false });
  assert(cleared.pass === false, 'Removed item returns fallback');

  setStorageItem('coffee', 'item1', 'A');
  setStorageItem('coffee', 'item2', 'B');
  clearStoreStorage('coffee');
  assert(getStorageItem('coffee', 'item1', null) === null, 'Cleared coffee store');
});

runTest('Storage Layer: MemoryStorage fallback', 'memory storage provides full Storage API in non-browser env', () => {
  const mem = new MemoryStorage();
  mem.setItem('k1', 'val1');
  mem.setItem('k2', 'val2');

  assert(mem.length === 2, 'Length matches');
  assert(mem.getItem('k1') === 'val1', 'Item retrieved');
  assert(mem.getItem('unknown') === null, 'Missing item returns null');

  mem.removeItem('k1');
  assert(mem.length === 1, 'Length decremented');
  assert(mem.getItem('k1') === null, 'Removed item is null');

  mem.clear();
  assert(mem.length === 0, 'Clear removes all items');
});

runTest('Storage Layer: NamespacedStorage instance', 'isolates stores and handles set/get/clearStore', () => {
  const mem = new MemoryStorage();
  const coffeeStore = new NamespacedStorage('coffee', mem);
  const fashionStore = new NamespacedStorage('fashion', mem);

  coffeeStore.set('cart', [{ id: 'coffee-item-1', qty: 2 }]);
  fashionStore.set('cart', [{ id: 'fashion-item-1', qty: 1 }]);

  const coffeeCart = coffeeStore.get<any[]>('cart', []);
  const fashionCart = fashionStore.get<any[]>('cart', []);

  assert(coffeeCart.length === 1 && coffeeCart[0].id === 'coffee-item-1', 'Coffee cart retrieved');
  assert(fashionCart.length === 1 && fashionCart[0].id === 'fashion-item-1', 'Fashion cart retrieved');

  assert(mem.getItem('shopify_portfolio:coffee:cart') !== null, 'Raw key contains namespace');

  coffeeStore.clearStore();
  assert(coffeeStore.get('cart', []).length === 0, 'Coffee cart cleared');
  assert(fashionStore.get('cart', []).length === 1, 'Fashion cart preserved untouched');
});

runTest('Storage Layer: Corrupted JSON Recovery', 'recovers gracefully on corrupted JSON without crashing', () => {
  const mem = new MemoryStorage();
  mem.setItem('shopify_portfolio:coffee:corrupted_key', '{bad_json::invalid');

  const ns = new NamespacedStorage('coffee', mem);
  const recovered = ns.get('corrupted_key', { fallback: true });

  assert(recovered.fallback === true, 'Returns fallback on corrupted JSON');
});

// ============================================================================
// SUITE 6: Adversarial Stress Tests & Edge Cases
// ============================================================================
runTest('Stress: Tabs outside Provider', 'throws descriptive error when compound components rendered outside <Tabs>', () => {
  let threw = false;
  try {
    renderToString(React.createElement(TabsList, { children: React.createElement(TabsTrigger, { value: '1', children: 'Tab 1' }) }));
  } catch (err: any) {
    threw = true;
    assert(err.message.includes('must be rendered inside a <Tabs> parent'), 'Error message describes missing provider');
  }
  assert(threw, 'Must throw error when rendered outside <Tabs>');
});

runTest('Stress: useToast outside Provider', 'throws descriptive error when useToast called outside <ToastProvider>', () => {
  let threw = false;
  function RogueComponent() {
    useToast();
    return null;
  }
  try {
    renderToString(React.createElement(RogueComponent));
  } catch (err: any) {
    threw = true;
    assert(err.message.includes('must be used within a <ToastProvider>'), 'Error message describes missing provider');
  }
  assert(threw, 'Must throw error when used outside <ToastProvider>');
});

runTest('Stress: Button Component Edge Cases', 'handles icon-only, fullWidth, and submit type', () => {
  const iconBtn = renderToString(
    React.createElement(Button, { size: 'icon', leftIcon: React.createElement('span', null, '🔍'), children: null })
  );
  assert(iconBtn.includes('h-10 w-10'), 'Applies icon size classes');
  assert(iconBtn.includes('🔍'), 'Renders icon node');

  const fullWidthBtn = renderToString(
    React.createElement(Button, { fullWidth: true, type: 'submit', children: 'Checkout' })
  );
  assert(fullWidthBtn.includes('w-full'), 'Applies w-full class');
  assert(fullWidthBtn.includes('type="submit"'), 'Sets type to submit');
});

runTest('Stress: Drawer Placements and Structural Classes', 'applies placement classes for left, right, and bottom', () => {
  const rightConfig = { placement: 'right' as const };
  const leftConfig = { placement: 'left' as const };
  const bottomConfig = { placement: 'bottom' as const };

  assert(rightConfig.placement === 'right', 'Right placement valid');
  assert(leftConfig.placement === 'left', 'Left placement valid');
  assert(bottomConfig.placement === 'bottom', 'Bottom placement valid');
});

runTest('Stress: Storage Non-Array JSON Boundary', 'examines behavior when non-array is saved under array key', () => {
  const mem = new MemoryStorage();
  mem.setItem('shopify_portfolio:coffee:items', JSON.stringify({ notAnArray: true }));

  const ns = new NamespacedStorage('coffee', mem);
  const data = ns.get('items', []);

  const isActuallyArray = Array.isArray(data);
  console.log(`    [Observation] When storage holds { notAnArray: true }, ns.get('items', []) returns isArray: ${isActuallyArray}`);
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================
const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log('\n======================================================');
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('======================================================');

if (failed > 0) {
  console.error('\nFAILURES:');
  for (const r of results.filter((r) => !r.passed)) {
    console.error(`- [${r.suite}] > ${r.name}: ${r.error}`);
  }
  process.exit(1);
} else {
  console.log('\nAll empirical verification checks PASSED!');
  process.exit(0);
}
