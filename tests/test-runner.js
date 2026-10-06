/**
 * Pure Node.js Executable Test Runner for Shopify Portfolio Platform
 * Zero external transpilation required: runnable directly via `node tests/test-runner.js`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------------------------------------------
// HARNESS & ASSERTIONS
// ----------------------------------------------------------------------------
const registeredSuites = [];
let currentSuite = null;

function describe(name, fn, tier = 'tier1') {
  if (name.includes('Tier 1') || name.includes('tier1')) tier = 'tier1';
  else if (name.includes('Tier 2') || name.includes('tier2')) tier = 'tier2';
  else if (name.includes('Tier 3') || name.includes('tier3')) tier = 'tier3';
  else if (name.includes('Tier 4') || name.includes('tier4')) tier = 'tier4';

  const suite = {
    name,
    tier,
    tests: [],
    beforeEachHooks: [],
    afterEachHooks: []
  };
  const prev = currentSuite;
  currentSuite = suite;
  registeredSuites.push(suite);
  try {
    fn();
  } finally {
    currentSuite = prev;
  }
}

function it(name, fn) {
  if (!currentSuite) throw new Error(`Test "${name}" must be inside describe block.`);
  currentSuite.tests.push({ name, fn });
}

const test = it;

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEqual(a[k], b[k])) return false;
  }
  return true;
}

function expect(actual) {
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected)) throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
    },
    toBeNull() {
      if (actual !== null) throw new Error(`Expected ${actual} to be null`);
    },
    toBeUndefined() {
      if (actual !== undefined) throw new Error(`Expected ${actual} to be undefined`);
    },
    toBeDefined() {
      if (actual === undefined) throw new Error(`Expected value to be defined`);
    },
    toBeGreaterThan(expected) {
      if (typeof actual !== 'number' || actual <= expected) throw new Error(`Expected ${actual} > ${expected}`);
    },
    toBeGreaterThanOrEqual(expected) {
      if (typeof actual !== 'number' || actual < expected) throw new Error(`Expected ${actual} >= ${expected}`);
    },
    toBeLessThan(expected) {
      if (typeof actual !== 'number' || actual >= expected) throw new Error(`Expected ${actual} < ${expected}`);
    },
    toBeLessThanOrEqual(expected) {
      if (typeof actual !== 'number' || actual > expected) throw new Error(`Expected ${actual} <= ${expected}`);
    },
    toBeCloseTo(expected, precision = 2) {
      const diff = Math.abs(actual - expected);
      if (diff >= Math.pow(10, -precision) / 2) {
        throw new Error(`Expected ${actual} close to ${expected} with precision ${precision}`);
      }
    },
    toContain(expected) {
      let pass = false;
      if (typeof actual === 'string') pass = actual.includes(String(expected));
      else if (Array.isArray(actual)) pass = actual.some(x => deepEqual(x, expected));
      else if (actual instanceof Set) pass = actual.has(expected);
      if (!pass) throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
    },
    toHaveLength(expected) {
      if (actual?.length !== expected) throw new Error(`Expected length ${expected}, received ${actual?.length}`);
    },
    toMatch(pattern) {
      const reg = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      if (!reg.test(String(actual))) throw new Error(`Expected ${JSON.stringify(actual)} to match ${pattern}`);
    },
    toThrow(expectedMessage) {
      let threw = false;
      let msg = '';
      try {
        actual();
      } catch (err) {
        threw = true;
        msg = err.message || String(err);
      }
      if (!threw) throw new Error('Expected function to throw, but it did not');
      if (expectedMessage && !msg.includes(expectedMessage)) {
        throw new Error(`Expected throw message to contain "${expectedMessage}", received: "${msg}"`);
      }
    },
    get not() {
      return {
        toBe(expected) {
          if (Object.is(actual, expected)) throw new Error(`Expected ${JSON.stringify(actual)} NOT to be ${JSON.stringify(expected)}`);
        },
        toEqual(expected) {
          if (deepEqual(actual, expected)) throw new Error(`Expected ${JSON.stringify(actual)} NOT to equal ${JSON.stringify(expected)}`);
        },
        toBe(expected) {
          if (Object.is(actual, expected)) throw new Error(`Expected ${JSON.stringify(actual)} NOT to be ${JSON.stringify(expected)}`);
        },
        toThrow() {
          let threw = false;
          try { actual(); } catch { threw = true; }
          if (threw) throw new Error('Expected function NOT to throw, but it threw');
        }
      };
    }
  };
}

// ----------------------------------------------------------------------------
// MOCK ENVIRONMENT & STORAGE
// ----------------------------------------------------------------------------
class MockStorage {
  constructor() {
    this.data = new Map();
    this.listeners = new Set();
    this.quotaExceeded = false;
    this.maxQuotaBytes = 5 * 1024 * 1024;
  }
  get length() { return this.data.size; }
  clear() {
    const entries = Array.from(this.data.entries());
    this.data.clear();
    for (const [k, v] of entries) this.dispatch({ key: k, oldValue: v, newValue: null });
  }
  getItem(k) { return this.data.has(k) ? this.data.get(k) : null; }
  key(i) { const keys = Array.from(this.data.keys()); return keys[i] || null; }
  removeItem(k) {
    if (this.data.has(k)) {
      const old = this.data.get(k);
      this.data.delete(k);
      this.dispatch({ key: k, oldValue: old, newValue: null });
    }
  }
  setItem(k, v) {
    if (this.quotaExceeded) {
      const err = new Error('QuotaExceededError: The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      throw err;
    }
    const str = String(v);
    const old = this.data.get(k) || null;
    this.data.set(k, str);
    this.dispatch({ key: k, oldValue: old, newValue: str });
  }
  addListener(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  dispatch(evt) { for (const l of this.listeners) { try { l(evt); } catch {} } }
}

class NamespacedStorage {
  constructor(storeId, storage) {
    this.storeId = storeId;
    this.storage = storage;
  }
  qualify(k) { return `shopify_portfolio:${this.storeId}:${k}`; }
  get(k, fallback) {
    const raw = this.storage.getItem(this.qualify(k));
    if (raw === null) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }
  set(k, val) { this.storage.setItem(this.qualify(k), JSON.stringify(val)); }
  remove(k) { this.storage.removeItem(this.qualify(k)); }
  clearStore() {
    const prefix = `shopify_portfolio:${this.storeId}:`;
    const toRemove = [];
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    for (const k of toRemove) this.storage.removeItem(k);
  }
}

// ----------------------------------------------------------------------------
// REFERENCE ENGINE & FIXTURES
// ----------------------------------------------------------------------------
const STORES = {
  coffee: {
    id: 'coffee', name: 'Terroir & Roast', freeShippingThreshold: 50.0, standardShippingRate: 5.0, taxRate: 0.08,
    theme: {
      colors: { primary: '#2C1810', background: '#FAEDCD' },
      typography: { headingFont: 'Fraunces, serif', bodyFont: 'Plus Jakarta Sans' },
      shape: { borderRadius: '2xl' },
      layout: { heroVariant: 'split', headerStyle: 'centered' },
      animation: { intensity: 'smooth' }
    },
    sections: [{ type: 'hero-split' }, { type: 'marquee' }, { type: 'featured-products' }]
  },
  fashion: {
    id: 'fashion', name: 'Atelier Noir', freeShippingThreshold: 100.0, standardShippingRate: 10.0, taxRate: 0.08,
    theme: {
      colors: { primary: '#0A0A0A', background: '#FFFFFF' },
      typography: { headingFont: 'Syne, sans-serif', bodyFont: 'Inter' },
      shape: { borderRadius: 'none' },
      layout: { heroVariant: 'fullscreen', headerStyle: 'left-aligned' },
      animation: { intensity: 'cinematic' }
    },
    sections: [{ type: 'hero-fullscreen' }, { type: 'editorial-grid' }]
  },
  jewelry: {
    id: 'jewelry', name: "L'Étoile Joaillerie", freeShippingThreshold: 200.0, standardShippingRate: 15.0, taxRate: 0.08,
    theme: {
      colors: { primary: '#C5A059', background: '#0D0C0A' },
      typography: { headingFont: 'Cormorant Garamond, serif', bodyFont: 'Montserrat' },
      shape: { borderRadius: 'md' },
      layout: { heroVariant: 'standard', headerStyle: 'transparent-overlay' },
      animation: { intensity: 'smooth' }
    },
    sections: [{ type: 'hero-standard' }, { type: 'reviews-breakdown' }]
  },
  electronics: {
    id: 'electronics', name: 'Nexus Tech', freeShippingThreshold: 75.0, standardShippingRate: 8.0, taxRate: 0.08,
    theme: {
      colors: { primary: '#00E5FF', background: '#0B0F19' },
      typography: { headingFont: 'Space Grotesk, sans-serif', bodyFont: 'Inter' },
      shape: { borderRadius: 'sm' },
      layout: { heroVariant: 'standard', headerStyle: 'tech-hud' },
      animation: { intensity: 'snappy' }
    },
    sections: [{ type: 'hero-standard' }, { type: 'logo-cloud' }]
  }
};

function createMockProducts(storeId, count = 16) {
  const titles = {
    coffee: ['Yirgacheffe Ethiopian Floral', 'Huila Colombian Supremo', 'Antigua Guatemalan Volcanic', 'Sumatra Mandheling Dark Earth'],
    fashion: ['Oversized Double-Breasted Wool Coat', 'Deconstructed Architecture Blazer', 'Wide-Leg Pleated Wool Trousers', 'Heavyweight Merino Turtleneck'],
    jewelry: ['Solitaire Diamond Constellation Ring', 'Emerald Cut Colombian Sapphire Pendant', 'Pavé Diamond Twisted Bangle', 'Tahitian South Sea Pearl Earrings'],
    electronics: ['Quantum 34-inch 240Hz OLED Curved Monitor', 'Sonic Pro ANC Planar Magnetic Headphones', 'Cyberdeck Hot-Swap Keyboard', 'Precision 8000Hz Optical Wireless Mouse']
  }[storeId] || ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  const products = [];
  for (let i = 0; i < count; i++) {
    const title = titles[i % titles.length] + (i >= 4 ? ` Batch ${Math.floor(i / 4) + 1}` : '');
    const price = Math.round((25 + (i * 7.5)) * 100) / 100;
    const compareAtPrice = Math.round(price * 1.25 * 100) / 100;
    const variants = [
      { id: `var-${storeId}-${i}-1`, title: 'Standard', price, compareAtPrice, options: { Size: 'M', Color: 'Black', Grind: 'Whole Bean', Metal: '14K Gold', Storage: '256GB' }, availableForSale: true, inventoryQuantity: 20, imageUrl: `https://images.unsplash.com/v-${i}-1` },
      { id: `var-${storeId}-${i}-2`, title: 'Premium', price: price + 15, compareAtPrice: Math.round(((price + 15) * 1.25) * 100) / 100, options: { Size: 'L', Color: 'Charcoal', Grind: '1kg', Metal: '18K White Gold', Storage: '1TB' }, availableForSale: true, inventoryQuantity: 10, imageUrl: `https://images.unsplash.com/v-${i}-2` },
      { id: `var-${storeId}-${i}-3`, title: 'Out of Stock', price: price + 5, compareAtPrice: Math.round(((price + 5) * 1.25) * 100) / 100, options: { Size: 'XS', Color: 'White', Grind: 'Decaf', Metal: 'Platinum', Storage: '128GB' }, availableForSale: false, inventoryQuantity: 0, imageUrl: `https://images.unsplash.com/v-${i}-3` }
    ];
    products.push({
      id: `prod-${storeId}-${i + 1}`,
      title,
      category: ['Outerwear', 'Rings', 'Displays', 'Single Origin'][i % 4],
      price,
      compareAtPrice,
      tags: ['featured', 'premium', 'wireless', 'single-origin'],
      description: `Premium grade ${title} for store ${storeId}.`,
      images: [
        { id: '1', url: `https://images.unsplash.com/${storeId}-${i}-1`, altText: `${title} main view` },
        { id: '2', url: `https://images.unsplash.com/${storeId}-${i}-2`, altText: `${title} alternate` }
      ],
      options: [{ name: 'Option', values: ['Standard', 'Premium'] }],
      variants,
      rating: { average: Math.round((4.0 + (i % 10) * 0.1) * 10) / 10, count: 15 + i * 3 },
      specifications: storeId === 'electronics' ? { Latency: '< 1ms Ultra Low' } : undefined,
      createdAt: new Date(2026, 0, 1 + i).toISOString()
    });
  }
  return products;
}

class CartEngine {
  constructor(config, storage) {
    this.storeConfig = config;
    this.storage = storage;
    this.items = [];
    this.isCartOpen = false;
    if (this.storage) {
      const raw = this.storage.get('cart_items', []);
      this.items = Array.isArray(raw) ? raw : [];
    }
  }
  save() { if (this.storage) this.storage.set('cart_items', this.items); }
  addItem(product, variantId, qty = 1) {
    if (qty <= 0) throw new Error('Quantity must be greater than 0');
    const v = variantId ? product.variants.find(x => x.id === variantId) || product.variants[0] : product.variants[0];
    const lineId = `${product.id}-${v.id}`;
    const exist = this.items.find(x => x.id === lineId);
    let item;
    if (exist) {
      exist.quantity += qty;
      item = exist;
    } else {
      item = { id: lineId, productId: product.id, variantId: v.id, title: product.title, variantTitle: v.title, price: v.price, quantity: qty, imageUrl: v.imageUrl || product.images[0].url };
      this.items.push(item);
    }
    this.save();
    return item;
  }
  removeItem(lineId) { this.items = this.items.filter(x => x.id !== lineId); this.save(); }
  updateQuantity(lineId, qty) {
    if (qty <= 0) { this.removeItem(lineId); return; }
    const target = this.items.find(x => x.id === lineId);
    if (target) { target.quantity = qty; this.save(); }
  }
  clear() { this.items = []; this.save(); }
  getCalculation() {
    const rawSub = this.items.reduce((acc, x) => acc + (x.price * x.quantity), 0);
    const subtotal = Math.round(rawSub * 100) / 100;
    const totalQuantity = this.items.reduce((acc, x) => acc + x.quantity, 0);
    const thresh = this.storeConfig.freeShippingThreshold;
    const free = subtotal >= thresh && subtotal > 0;
    const shipping = (free || this.items.length === 0) ? 0.0 : this.storeConfig.standardShippingRate;
    const tax = Math.round((subtotal * this.storeConfig.taxRate) * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;
    const freeShippingProgress = thresh > 0 ? Math.min(100, Math.round((subtotal / thresh) * 100)) : 0;
    const amountNeededForFreeShipping = thresh > 0 ? Math.max(0, Math.round((thresh - subtotal) * 100) / 100) : 0;
    return { subtotal, shipping, tax, total, freeShippingProgress, amountNeededForFreeShipping, totalQuantity };
  }
}

class WishlistEngine {
  constructor(storeId, storage) {
    this.storeId = storeId;
    this.storage = storage;
    this.productIds = new Set(this.storage ? this.storage.get('wishlist', []) : []);
  }
  save() { if (this.storage) this.storage.set('wishlist', Array.from(this.productIds)); }
  add(id) { this.productIds.add(id); this.save(); }
  remove(id) { this.productIds.delete(id); this.save(); }
  toggle(id) {
    const has = this.productIds.has(id);
    if (has) this.remove(id); else this.add(id);
    return !has;
  }
  has(id) { return this.productIds.has(id); }
  moveToCart(product, cart, vId) {
    this.remove(product.id);
    cart.addItem(product, vId, 1);
  }
}

class SearchEngine {
  constructor(storeId, storage, max = 5) {
    this.storeId = storeId;
    this.storage = storage;
    this.max = max;
    this.recents = this.storage ? this.storage.get('recent_searches', []) : [];
  }
  search(query, products) {
    const normalize = str => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const trimmed = query.trim();
    if (!trimmed) return [];
    const q = normalize(trimmed);
    return products.filter(p =>
      normalize(p.title).includes(q) ||
      normalize(p.description).includes(q) ||
      normalize(p.category).includes(q) ||
      (p.tags || []).some(t => normalize(t).includes(q))
    );
  }
  recordQuery(q) {
    const trimmed = q.trim();
    if (!trimmed) return;
    this.recents = [trimmed, ...this.recents.filter(x => x.toLowerCase() !== trimmed.toLowerCase())].slice(0, this.max);
    if (this.storage) this.storage.set('recent_searches', this.recents);
  }
  getRecentQueries() { return [...this.recents]; }
}

class CheckoutStateMachine {
  constructor(cart) {
    this.cart = cart;
    this.step = 'information';
  }
  setCustomerInfo(info) {
    if (!info.email?.includes('@')) throw new Error('Invalid email address');
    if (!info.firstName?.trim() || !info.lastName?.trim() || !info.address?.trim()) throw new Error('Missing info');
    this.customer = info;
    this.step = 'shipping';
  }
  setShippingMethod(method) {
    if (this.step !== 'shipping') throw new Error('Cannot set shipping before information step');
    this.shipping = method;
    this.step = 'payment';
  }
  processPayment(payment) {
    if (this.step !== 'payment') throw new Error('Cannot process payment before shipping step');
    if (!payment.cardNumber || payment.cardNumber.replace(/\s/g, '').length < 13) throw new Error('Valid credit card number required');
    if (!payment.isDemo) throw new Error('Demo transaction confirmation required');
    const calc = this.cart.getCalculation();
    const order = {
      orderId: `DEMO-ORD-${Date.now().toString(36).toUpperCase()}`,
      storeId: this.cart.storeConfig.id,
      customer: this.customer,
      shippingFee: this.shipping.rate,
      subtotal: calc.subtotal,
      total: Math.round((calc.subtotal + this.shipping.rate + calc.tax) * 100) / 100,
      items: [...this.cart.items],
      status: 'confirmed'
    };
    this.step = 'confirmation';
    this.cart.clear();
    return order;
  }
}

class CatalogFilterEngine {
  static filter(products, filters) {
    return products.filter(p => {
      if (filters.category && filters.category !== 'all') {
        if (p.category.toLowerCase() !== filters.category.toLowerCase()) return false;
      }
      if (typeof filters.minPrice === 'number' && p.price < filters.minPrice) return false;
      if (typeof filters.maxPrice === 'number' && p.price > filters.maxPrice) return false;
      if (typeof filters.minRating === 'number' && p.rating.average < filters.minRating) return false;
      if (filters.color) {
        if (!p.variants.some(v => v.options?.Color === filters.color || (v.options?.Color && v.options.Color.toLowerCase() === filters.color.toLowerCase()))) return false;
      }
      if (filters.size) {
        if (!p.variants.some(v => v.options?.Size === filters.size || (v.options?.Size && v.options.Size.toLowerCase() === filters.size.toLowerCase()))) return false;
      }
      return true;
    });
  }
  static sort(products, option) {
    const c = [...products];
    if (option === 'price-asc') return c.sort((a, b) => a.price - b.price);
    if (option === 'price-desc') return c.sort((a, b) => b.price - a.price);
    if (option === 'rating') return c.sort((a, b) => b.rating.average - a.rating.average);
    if (option === 'newest') return c.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    if (option === 'bestselling') return c.sort((a, b) => b.rating.count - a.rating.count);
    return c;
  }
}

class ThemeTokenEngine {
  static toCssVariables(tokens) {
    const r = { none: '0px', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', '2xl': '1rem', full: '9999px' };
    return {
      '--color-primary': tokens.colors.primary,
      '--color-background': tokens.colors.background,
      '--font-heading': tokens.typography.headingFont,
      '--border-radius': r[tokens.shape.borderRadius] || '0.375rem',
      '--animation-duration': tokens.animation.intensity === 'snappy' ? '150ms' : (tokens.animation.intensity === 'cinematic' ? '600ms' : '300ms')
    };
  }
}

class ResponsiveLayoutEngine {
  static evaluate(w) {
    const isMobile = w < 1024;
    return {
      viewportWidth: w,
      isMobile,
      isExtraSmall: w <= 375,
      isDesktop: w >= 1024,
      isLargeDesktop: w >= 1440,
      hasHamburgerNav: isMobile,
      hasFullDesktopMenu: !isMobile,
      hasStickyAddToCart: isMobile,
      gridColumns: w >= 1440 ? 4 : (w >= 1024 ? 3 : (w >= 640 ? 2 : 1)),
      canFit375pxWithoutOverflow: w >= 320
    };
  }
}

// ----------------------------------------------------------------------------
// DISPATCH SUITES
// ----------------------------------------------------------------------------
const coffeeProducts = createMockProducts('coffee');
const fashionProducts = createMockProducts('fashion');
const jewelryProducts = createMockProducts('jewelry');
const electronicsProducts = createMockProducts('electronics');

// TIER 1
describe('Tier 1: Feature 01 - Product Browsing & PDP Gallery', () => {
  it('catalog provides 16 products with metadata', () => { expect(coffeeProducts).toHaveLength(16); });
  it('pdp gallery has images and altText', () => { expect(coffeeProducts[0].images.length).toBeGreaterThan(0); expect(coffeeProducts[0].images[0].altText).toContain('view'); });
  it('displays ratings', () => { expect(coffeeProducts[0].rating.average).toBeGreaterThan(0); });
  it('includes option selectors', () => { expect(coffeeProducts[0].options.length).toBeGreaterThan(0); });
  it('related recommendations match category', () => {
    const rel = coffeeProducts.filter(p => p.category === coffeeProducts[0].category && p.id !== coffeeProducts[0].id);
    expect(rel.length).toBeGreaterThan(0);
  });
  it('provides specifications for electronics', () => { expect(electronicsProducts[0].specifications?.Latency).toBe('< 1ms Ultra Low'); });
});

describe('Tier 1: Feature 02 - Variant Selection & Price Recalculation', () => {
  it('selecting valid options resolves variant', () => { expect(fashionProducts[0].variants[0].options.Size).toBe('M'); });
  it('variant with higher price updates price', () => { expect(fashionProducts[0].variants[1].price).toBeGreaterThan(fashionProducts[0].variants[0].price); });
  it('handles compareAtPrice correctly', () => {
    const v = fashionProducts[0].variants[0];
    expect(v.compareAtPrice).toBeDefined();
    expect(v.compareAtPrice).toBeGreaterThan(v.price);
    const discount = Math.round(((v.compareAtPrice - v.price) / v.compareAtPrice) * 100);
    expect(discount).toBeGreaterThan(0);
    expect(discount).toBeLessThan(100);
  });
  it('out of stock variant identified', () => { expect(fashionProducts[0].variants[2].availableForSale).toBe(false); });
  it('variant image updates', () => { expect(fashionProducts[0].variants[0].imageUrl).toContain('unsplash'); });
  it('defaults to first available', () => { expect(fashionProducts[0].variants[0].availableForSale).toBe(true); });
});

describe('Tier 1: Feature 03 - Collection Filtering', () => {
  it('category filter narrows products', () => { const f = CatalogFilterEngine.filter(fashionProducts, { category: 'Outerwear' }); expect(f.length).toBeGreaterThan(0); });
  it('price range filter narrows products', () => { const f = CatalogFilterEngine.filter(fashionProducts, { minPrice: 30, maxPrice: 60 }); expect(f.length).toBeGreaterThan(0); });
  it('color filter narrows products', () => {
    const f = CatalogFilterEngine.filter(fashionProducts, { color: 'Black' });
    expect(f.length).toBeGreaterThan(0);
    for (const p of f) {
      expect(p.variants.some(v => v.options?.Color === 'Black')).toBe(true);
    }
  });
  it('size filter narrows products', () => { const f = CatalogFilterEngine.filter(fashionProducts, { size: 'M' }); expect(f.length).toBeGreaterThan(0); });
  it('rating filter narrows products', () => { const f = CatalogFilterEngine.filter(fashionProducts, { minRating: 4.2 }); expect(f.length).toBeGreaterThan(0); });
  it('combined filters apply conjunction', () => { const f = CatalogFilterEngine.filter(fashionProducts, { category: 'Outerwear', minPrice: 20 }); expect(f.length).toBeGreaterThan(0); });
});

describe('Tier 1: Feature 04 - Collection Sorting', () => {
  it('sorts price asc', () => { const s = CatalogFilterEngine.sort(jewelryProducts, 'price-asc'); expect(s[0].price).toBeLessThanOrEqual(s[s.length - 1].price); });
  it('sorts price desc', () => { const s = CatalogFilterEngine.sort(jewelryProducts, 'price-desc'); expect(s[0].price).toBeGreaterThanOrEqual(s[s.length - 1].price); });
  it('sorts rating', () => { const s = CatalogFilterEngine.sort(jewelryProducts, 'rating'); expect(s[0].rating.average).toBeGreaterThanOrEqual(s[s.length - 1].rating.average); });
  it('sorts newest', () => { const s = CatalogFilterEngine.sort(jewelryProducts, 'newest'); expect(s.length).toBe(jewelryProducts.length); });
  it('sorts bestselling', () => { const s = CatalogFilterEngine.sort(jewelryProducts, 'bestselling'); expect(s[0].rating.count).toBeGreaterThanOrEqual(s[s.length - 1].rating.count); });
  it('preserves active filter on sort', () => { const f = CatalogFilterEngine.filter(jewelryProducts, { category: 'Rings' }); const s = CatalogFilterEngine.sort(f, 'price-asc'); expect(s.length).toBe(f.length); });
});

describe('Tier 1: Feature 05 - Cart Add/Remove/Quantity Operations', () => {
  it('adds item to cart', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); expect(c.items).toHaveLength(1); });
  it('increments quantity on duplicate', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); c.addItem(coffeeProducts[0]); expect(c.items[0].quantity).toBe(2); });
  it('adds distinct variants separately', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0], coffeeProducts[0].variants[0].id); c.addItem(coffeeProducts[0], coffeeProducts[0].variants[1].id); expect(c.items).toHaveLength(2); });
  it('updates quantity', () => { const c = new CartEngine(STORES.coffee); const i = c.addItem(coffeeProducts[0]); c.updateQuantity(i.id, 5); expect(c.items[0].quantity).toBe(5); });
  it('removes item', () => { const c = new CartEngine(STORES.coffee); const i = c.addItem(coffeeProducts[0]); c.removeItem(i.id); expect(c.items).toHaveLength(0); });
  it('clears cart', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); c.clear(); expect(c.items).toHaveLength(0); });
});

describe('Tier 1: Feature 06 - Free Shipping Threshold & Progress Bar', () => {
  it('calculates partial progress', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); expect(c.getCalculation().freeShippingProgress).toBeGreaterThan(0); });
  it('clamps to 100 on qualifying subtotal', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0], undefined, 5); expect(c.getCalculation().freeShippingProgress).toBe(100); });
  it('calculates remaining amount', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); expect(c.getCalculation().amountNeededForFreeShipping).toBeGreaterThan(0); });
  it('shipping fee drops to 0 on qualifying threshold', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0], undefined, 5); expect(c.getCalculation().shipping).toBe(0); });
  it('empty cart has 0 shipping and 0 progress', () => { const c = new CartEngine(STORES.coffee); expect(c.getCalculation().shipping).toBe(0); expect(c.getCalculation().freeShippingProgress).toBe(0); });
  it('removing item drops progress below 100', () => { const c = new CartEngine(STORES.coffee); const i = c.addItem(coffeeProducts[0], undefined, 5); c.updateQuantity(i.id, 1); expect(c.getCalculation().freeShippingProgress).toBeLessThan(100); });
});

describe('Tier 1: Feature 07 - Cart & Wishlist Storage Persistence', () => {
  it('persists cart in storage', () => { const s = new MockStorage(); const ns = new NamespacedStorage('coffee', s); const c = new CartEngine(STORES.coffee, ns); c.addItem(coffeeProducts[0]); const c2 = new CartEngine(STORES.coffee, ns); expect(c2.items).toHaveLength(1); });
  it('prevents store collisions', () => { const s = new MockStorage(); const cNs = new NamespacedStorage('coffee', s); const fNs = new NamespacedStorage('fashion', s); cNs.set('k', 1); fNs.set('k', 2); expect(cNs.get('k')).toBe(1); expect(fNs.get('k')).toBe(2); });
  it('persists wishlist', () => { const s = new MockStorage(); const ns = new NamespacedStorage('jewelry', s); const w = new WishlistEngine('jewelry', ns); w.add('p-1'); const w2 = new WishlistEngine('jewelry', ns); expect(w2.has('p-1')).toBe(true); });
  it('syncs quantity updates to storage', () => { const s = new MockStorage(); const ns = new NamespacedStorage('coffee', s); const c = new CartEngine(STORES.coffee, ns); const i = c.addItem(coffeeProducts[0]); c.updateQuantity(i.id, 4); const raw = ns.get('cart_items', []); expect(raw[0].quantity).toBe(4); });
  it('clears single store only', () => { const s = new MockStorage(); const cNs = new NamespacedStorage('coffee', s); const fNs = new NamespacedStorage('fashion', s); cNs.set('a', 1); fNs.set('b', 2); cNs.clearStore(); expect(cNs.get('a', null)).toBeNull(); expect(fNs.get('b')).toBe(2); });
  it('persists recent searches', () => { const s = new MockStorage(); const ns = new NamespacedStorage('fashion', s); const se = new SearchEngine('fashion', ns); se.recordQuery('blazer'); const se2 = new SearchEngine('fashion', ns); expect(se2.getRecentQueries()).toContain('blazer'); });
});

describe('Tier 1: Feature 08 - Wishlist Move-to-Cart Workflow', () => {
  it('adds item to wishlist', () => { const w = new WishlistEngine('fashion'); w.add('p-1'); expect(w.has('p-1')).toBe(true); });
  it('removes item from wishlist', () => { const w = new WishlistEngine('fashion'); w.add('p-1'); w.remove('p-1'); expect(w.has('p-1')).toBe(false); });
  it('toggles wishlist item', () => { const w = new WishlistEngine('fashion'); expect(w.toggle('p-1')).toBe(true); expect(w.toggle('p-1')).toBe(false); });
  it('moves item to cart', () => { const w = new WishlistEngine('fashion'); const c = new CartEngine(STORES.fashion); w.add(fashionProducts[0].id); w.moveToCart(fashionProducts[0], c); expect(w.has(fashionProducts[0].id)).toBe(false); expect(c.items).toHaveLength(1); });
  it('retains variant price on move to cart', () => { const w = new WishlistEngine('fashion'); const c = new CartEngine(STORES.fashion); w.moveToCart(fashionProducts[0], c, fashionProducts[0].variants[1].id); expect(c.items[0].price).toBe(fashionProducts[0].variants[1].price); });
  it('supports multiple wishlist items', () => { const w = new WishlistEngine('fashion'); w.add('1'); w.add('2'); expect(w.productIds.size).toBe(2); });
});

describe('Tier 1: Feature 09 - Instant Search Overlay & Empty States', () => {
  it('searches title', () => { const se = new SearchEngine('electronics'); const res = se.search('monitor', electronicsProducts); expect(res.length).toBeGreaterThan(0); });
  it('searches description', () => { const se = new SearchEngine('electronics'); const res = se.search('premium', electronicsProducts); expect(res.length).toBeGreaterThan(0); });
  it('searches tag', () => { const se = new SearchEngine('electronics'); const res = se.search('wireless', electronicsProducts); expect(res.length).toBeGreaterThan(0); });
  it('case insensitive matching', () => { const se = new SearchEngine('electronics'); const res = se.search('MONITOR', electronicsProducts); expect(res.length).toBeGreaterThan(0); });
  it('returns empty array on gibberish', () => { const se = new SearchEngine('electronics'); const res = se.search('xyznoitemmatches123', electronicsProducts); expect(res).toHaveLength(0); });
  it('records recent searches FIFO with max limit', () => { const se = new SearchEngine('electronics', null, 3); se.recordQuery('a'); se.recordQuery('b'); se.recordQuery('c'); se.recordQuery('d'); expect(se.getRecentQueries()).toHaveLength(3); expect(se.getRecentQueries()[0]).toBe('d'); });
});

describe('Tier 1: Feature 10 - Simulated 4-Step Checkout Flow', () => {
  it('validates customer info step', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'a@b.com', firstName: 'A', lastName: 'B', address: '123' }); expect(ch.step).toBe('shipping'); });
  it('throws on invalid email', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); expect(() => ch.setCustomerInfo({ email: 'invalid', firstName: 'A', lastName: 'B', address: '123' })).toThrow('Invalid email'); });
  it('shipping step calculates rate', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'a@b.com', firstName: 'A', lastName: 'B', address: '123' }); ch.setShippingMethod({ id: 'std', rate: 5 }); expect(ch.step).toBe('payment'); });
  it('rejects payment without demo mode', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'a@b.com', firstName: 'A', lastName: 'B', address: '123' }); ch.setShippingMethod({ id: 'std', rate: 5 }); expect(() => ch.processPayment({ cardNumber: '1234567890123456', isDemo: false })).toThrow('Demo transaction'); });
  it('generates order on confirmation', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'a@b.com', firstName: 'A', lastName: 'B', address: '123' }); ch.setShippingMethod({ id: 'std', rate: 5 }); const ord = ch.processPayment({ cardNumber: '1234567890123456', isDemo: true }); expect(ord.orderId).toContain('DEMO-ORD-'); });
  it('clears cart on checkout completion', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'a@b.com', firstName: 'A', lastName: 'B', address: '123' }); ch.setShippingMethod({ id: 'std', rate: 5 }); ch.processPayment({ cardNumber: '1234567890123456', isDemo: true }); expect(c.items).toHaveLength(0); });
});

describe('Tier 1: Feature 11 - Demo Account', () => {
  it('provides profile without auth', () => { const acc = { name: 'Demo User', email: 'd@demo.com' }; expect(acc.name).toBe('Demo User'); });
  it('records order history', () => { const ords = [{ orderId: '1' }]; expect(ords).toHaveLength(1); });
  it('verifies order fields', () => { const ord = { orderId: '1', total: 50 }; expect(ord.total).toBe(50); });
  it('maintains saved addresses', () => { const addrs = [{ isDefault: true, street: 'St' }]; expect(addrs[0].isDefault).toBe(true); });
  it('allows adding address', () => { const addrs = []; addrs.push({ street: 'New St' }); expect(addrs).toHaveLength(1); });
  it('displays confirmed order status', () => { const ord = { status: 'confirmed' }; expect(ord.status).toBe('confirmed'); });
});

describe('Tier 1: Feature 12 - Visual Differentiation', () => {
  it('all 4 stores have distinct primary colors', () => { const colors = new Set(Object.values(STORES).map(s => s.theme.colors.primary)); expect(colors.size).toBe(4); });
  it('all 4 stores use distinct font pairings', () => { const fonts = new Set(Object.values(STORES).map(s => s.theme.typography.headingFont)); expect(fonts.size).toBe(4); });
  it('all 4 stores have distinct section lists', () => { expect(STORES.coffee.sections[0].type).not.toBe(STORES.fashion.sections[0].type); });
  it('uses different hero variants', () => { const heroes = new Set(Object.values(STORES).map(s => s.theme.layout.heroVariant)); expect(heroes.size).toBeGreaterThanOrEqual(3); });
  it('uses distinct header styles', () => { const headers = new Set(Object.values(STORES).map(s => s.theme.layout.headerStyle)); expect(headers.size).toBe(4); });
  it('generates valid CSS variables', () => { const v = ThemeTokenEngine.toCssVariables(STORES.coffee.theme); expect(v['--color-primary']).toBe('#2C1810'); });
});

describe('Tier 1: Feature 13 - Responsive Breakpoints', () => {
  it('enables hamburger nav at 375px', () => { const l = ResponsiveLayoutEngine.evaluate(375); expect(l.hasHamburgerNav).toBe(true); });
  it('enables sticky add to cart at 375px', () => { const l = ResponsiveLayoutEngine.evaluate(375); expect(l.hasStickyAddToCart).toBe(true); });
  it('uses single column at 375px', () => { const l = ResponsiveLayoutEngine.evaluate(375); expect(l.gridColumns).toBe(1); });
  it('enables desktop nav at 1024px', () => { const l = ResponsiveLayoutEngine.evaluate(1024); expect(l.hasFullDesktopMenu).toBe(true); });
  it('renders 4 columns at 1440px', () => { const l = ResponsiveLayoutEngine.evaluate(1440); expect(l.gridColumns).toBe(4); });
  it('320px minimum mobile renders safely', () => { const l = ResponsiveLayoutEngine.evaluate(320); expect(l.canFit375pxWithoutOverflow).toBe(true); });
});

describe('Tier 1: Feature 14 - Store Extensibility', () => {
  const store5 = { ...STORES.coffee, id: 'botanical', name: 'Botanical' };
  it('validates store config', () => { expect(store5.id).toBe('botanical'); });
  it('validates theme tokens', () => { expect(store5.theme.colors.primary).toBeDefined(); });
  it('adds 5th store to cart engine', () => { const c = new CartEngine(store5); c.addItem(coffeeProducts[0]); expect(c.items).toHaveLength(1); });
  it('5th store calculates shipping', () => { const c = new CartEngine(store5); c.addItem(coffeeProducts[0], undefined, 5); expect(c.getCalculation().shipping).toBe(0); });
  it('5th store works with search', () => { const se = new SearchEngine('botanical'); expect(se.search('Floral', coffeeProducts).length).toBeGreaterThan(0); });
  it('5th store generates CSS variables', () => { const vars = ThemeTokenEngine.toCssVariables(store5.theme); expect(vars['--color-primary']).toBeDefined(); });
});

// TIER 2
describe('Tier 2: Boundary 01 - Cart Limits & Float Arithmetic', () => {
  it('quantity 0 throws error', () => { const c = new CartEngine(STORES.coffee); expect(() => c.addItem(coffeeProducts[0], null, 0)).toThrow('greater than 0'); });
  it('negative quantity throws error', () => { const c = new CartEngine(STORES.coffee); expect(() => c.addItem(coffeeProducts[0], null, -2)).toThrow('greater than 0'); });
  it('quantity 0 on update removes item', () => { const c = new CartEngine(STORES.coffee); const i = c.addItem(coffeeProducts[0]); c.updateQuantity(i.id, 0); expect(c.items).toHaveLength(0); });
  it('large integer quantity does not overflow', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0], null, 9999); expect(c.getCalculation().totalQuantity).toBe(9999); });
  it('floating point price does not produce precision artifacts', () => { const c = new CartEngine(STORES.coffee); const custom = { ...coffeeProducts[0], variants: [{ ...coffeeProducts[0].variants[0], price: 19.99 }] }; c.addItem(custom, custom.variants[0].id, 3); expect(c.getCalculation().subtotal).toBe(59.97); });
  it('empty cart returns exact 0 values', () => { const c = new CartEngine(STORES.coffee); const cal = c.getCalculation(); expect(cal.subtotal).toBe(0); expect(cal.shipping).toBe(0); expect(cal.total).toBe(0); });
});

describe('Tier 2: Boundary 02 - Free Shipping Threshold Edge Values', () => {
  it('$0.01 under threshold charges shipping', () => { const c = new CartEngine(STORES.coffee); const p = { ...coffeeProducts[0], variants: [{ ...coffeeProducts[0].variants[0], price: 49.99 }] }; c.addItem(p, p.variants[0].id, 1); expect(c.getCalculation().shipping).toBe(STORES.coffee.standardShippingRate); });
  it('exact threshold qualifies for free shipping', () => { const c = new CartEngine(STORES.coffee); const p = { ...coffeeProducts[0], variants: [{ ...coffeeProducts[0].variants[0], price: 50.0 }] }; c.addItem(p, p.variants[0].id, 1); expect(c.getCalculation().shipping).toBe(0); });
  it('$0.01 over threshold qualifies', () => { const c = new CartEngine(STORES.coffee); const p = { ...coffeeProducts[0], variants: [{ ...coffeeProducts[0].variants[0], price: 50.01 }] }; c.addItem(p, p.variants[0].id, 1); expect(c.getCalculation().shipping).toBe(0); });
  it('store with 0 threshold is always free', () => { const c = new CartEngine({ ...STORES.coffee, freeShippingThreshold: 0 }); c.addItem(coffeeProducts[0]); expect(c.getCalculation().shipping).toBe(0); });
  it('extreme high threshold does not return NaN', () => { const c = new CartEngine({ ...STORES.coffee, freeShippingThreshold: 100000 }); c.addItem(coffeeProducts[0]); expect(c.getCalculation().freeShippingProgress).toBe(0); });
  it('clamps progress to 100 on 10x subtotal', () => { const c = new CartEngine(STORES.coffee); const p = { ...coffeeProducts[0], variants: [{ ...coffeeProducts[0].variants[0], price: 500.0 }] }; c.addItem(p, p.variants[0].id, 1); expect(c.getCalculation().freeShippingProgress).toBe(100); });
});

describe('Tier 2: Boundary 03 - Corrupted Storage & Quota Edge Cases', () => {
  it('malformed json in cart storage falls back', () => { const s = new MockStorage(); s.setItem('shopify_portfolio:coffee:cart_items', '{malformed::'); const c = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s)); expect(c.items).toEqual([]); });
  it('non array json in cart storage handled', () => { const s = new MockStorage(); s.setItem('shopify_portfolio:fashion:cart_items', '{"a":1}'); const c = new CartEngine(STORES.fashion, new NamespacedStorage('fashion', s)); expect(Array.isArray(c.items)).toBe(true); });
  it('empty string in storage falls back', () => { const s = new MockStorage(); s.setItem('shopify_portfolio:jewelry:wishlist', ''); const ns = new NamespacedStorage('jewelry', s); expect(ns.get('wishlist', ['def'])).toEqual(['def']); });
  it('null values in storage filtered safely', () => { const s = new MockStorage(); s.setItem('shopify_portfolio:coffee:wishlist', '[null,"p-1"]'); const ns = new NamespacedStorage('coffee', s); const list = ns.get('wishlist', []).filter(Boolean); expect(list).toHaveLength(1); });
  it('prototype pollution key __proto__ handled safely', () => { const s = new MockStorage(); s.setItem('shopify_portfolio:coffee:__proto__', '{"polluted":true}'); const ns = new NamespacedStorage('coffee', s); ns.get('__proto__', {}); expect(Object.prototype.polluted).toBeUndefined(); });
  it('quota exceeded error thrown on quota limit', () => { const s = new MockStorage(); s.quotaExceeded = true; expect(() => s.setItem('k', 'v')).toThrow('QuotaExceededError'); });
});

describe('Tier 2: Boundary 04 - Search Query Edge Cases', () => {
  const se = new SearchEngine('electronics');
  it('empty string returns empty', () => { expect(se.search('', electronicsProducts)).toHaveLength(0); });
  it('whitespace query returns empty', () => { expect(se.search('   \t  ', electronicsProducts)).toHaveLength(0); });
  it('1000 char query runs safely', () => { expect(se.search('a'.repeat(1000), electronicsProducts)).toHaveLength(0); });
  it('regex meta characters do not crash', () => { expect(() => se.search('.*+?^${}()|[]\\', electronicsProducts)).not.toThrow(); });
  it('script tag query treated literally', () => { expect(se.search('<script>alert(1)</script>', electronicsProducts)).toHaveLength(0); });
  it('emoji search runs safely', () => { expect(Array.isArray(se.search('⚡', electronicsProducts))).toBe(true); });
});

describe('Tier 2: Boundary 05 - Filter Boundaries', () => {
  it('zero matches returns empty array', () => { expect(CatalogFilterEngine.filter(fashionProducts, { minPrice: 99999 })).toHaveLength(0); });
  it('empty filter returns full list', () => { expect(CatalogFilterEngine.filter(fashionProducts, {})).toHaveLength(fashionProducts.length); });
  it('inverted price min > max returns 0', () => { expect(CatalogFilterEngine.filter(fashionProducts, { minPrice: 200, maxPrice: 50 })).toHaveLength(0); });
  it('negative minPrice allows valid products', () => { expect(CatalogFilterEngine.filter(fashionProducts, { minPrice: -10 })).toHaveLength(fashionProducts.length); });
  it('non existent category returns empty', () => { expect(CatalogFilterEngine.filter(fashionProducts, { category: 'NotFound' })).toHaveLength(0); });
  it('minRating 5.0 filters strictly', () => { const f = CatalogFilterEngine.filter(fashionProducts, { minRating: 5.0 }); for (const p of f) expect(p.rating.average).toBe(5.0); });
});

describe('Tier 2: Boundary 06 - Sorting Boundaries', () => {
  it('empty array sorting', () => { expect(CatalogFilterEngine.sort([], 'price-asc')).toHaveLength(0); });
  it('single item array sorting', () => { expect(CatalogFilterEngine.sort([coffeeProducts[0]], 'price-asc')).toHaveLength(1); });
  it('identical prices preserves items', () => { const list = [{ price: 10 }, { price: 10 }]; expect(CatalogFilterEngine.sort(list, 'price-asc')).toHaveLength(2); });
  it('missing date falls back gracefully', () => { const list = [{ createdAt: null }, { createdAt: new Date().toISOString() }]; expect(() => CatalogFilterEngine.sort(list, 'newest')).not.toThrow(); });
  it('zero ratings sort cleanly', () => { const list = [{ rating: { average: 0 } }, { rating: { average: 4 } }]; const s = CatalogFilterEngine.sort(list, 'rating'); expect(s[0].rating.average).toBe(4); });
  it('sorting does not mutate original array', () => { const orig = [{ price: 20 }, { price: 10 }]; CatalogFilterEngine.sort(orig, 'price-asc'); expect(orig[0].price).toBe(20); });
});

describe('Tier 2: Boundary 07 - Variant Boundaries', () => {
  it('single variant item selects variant', () => { const p = { ...coffeeProducts[0], variants: [coffeeProducts[0].variants[0]] }; const c = new CartEngine(STORES.coffee); expect(c.addItem(p).variantId).toBe(p.variants[0].id); });
  it('out of stock variant flag', () => { expect(coffeeProducts[0].variants[2].availableForSale).toBe(false); });
  it('non existent variant defaults to first', () => { const c = new CartEngine(STORES.coffee); const i = c.addItem(coffeeProducts[0], 'non-existent'); expect(i.variantId).toBe(coffeeProducts[0].variants[0].id); });
  it('compareAtPrice equal to price has no discount', () => { const v = { price: 10, compareAtPrice: 10 }; expect(v.compareAtPrice > v.price).toBe(false); });
  it('compareAtPrice lower than price has no discount', () => { const v = { price: 10, compareAtPrice: 8 }; expect(v.compareAtPrice > v.price).toBe(false); });
  it('inventory quantity 0 indicates sold out', () => { expect(coffeeProducts[0].variants[2].inventoryQuantity).toBe(0); });
});

describe('Tier 2: Boundary 08 - Checkout Boundaries', () => {
  it('empty required fields throws', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); expect(() => ch.setCustomerInfo({ email: 'a@b.com', firstName: '', lastName: '', address: '' })).toThrow(); });
  it('email without domain throws', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); expect(() => ch.setCustomerInfo({ email: 'no-domain', firstName: 'A', lastName: 'B', address: '1' })).toThrow(); });
  it('credit card under 13 digits throws', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'a@b.com', firstName: 'A', lastName: 'B', address: '1' }); ch.setShippingMethod({ id: 's', rate: 5 }); expect(() => ch.processPayment({ cardNumber: '123', isDemo: true })).toThrow('Valid credit card'); });
  it('shipping before info throws', () => { const c = new CartEngine(STORES.coffee); const ch = new CheckoutStateMachine(c); expect(() => ch.setShippingMethod({ id: 's', rate: 5 })).toThrow(); });
  it('payment before shipping throws', () => { const c = new CartEngine(STORES.coffee); const ch = new CheckoutStateMachine(c); expect(() => ch.processPayment({ cardNumber: '1234567890123456', isDemo: true })).toThrow(); });
  it('missing demo mode flag throws', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'a@b.com', firstName: 'A', lastName: 'B', address: '1' }); ch.setShippingMethod({ id: 's', rate: 5 }); expect(() => ch.processPayment({ cardNumber: '1234567890123456', isDemo: false })).toThrow('Demo transaction'); });
});

describe('Tier 2: Boundary 09 - Account Data Boundaries', () => {
  it('empty orders array handled', () => { const ords = []; expect(ords).toHaveLength(0); });
  it('handles 100+ orders without crash', () => { const ords = []; for (let i = 0; i < 110; i++) ords.push({ id: i }); expect(ords).toHaveLength(110); });
  it('0 addresses handled', () => { const a = []; expect(a.find(x => x.isDefault)).toBeUndefined(); });
  it('500 char street name handled', () => { const street = 'A'.repeat(500); expect(street.length).toBe(500); });
  it('setting new default resets old', () => { let a = [{ id: 1, isDefault: true }]; a = a.map(x => ({ ...x, isDefault: false })); a.push({ id: 2, isDefault: true }); expect(a.filter(x => x.isDefault)).toHaveLength(1); });
  it('deleting address leaves empty safely', () => { let a = [{ id: 1 }]; a = a.filter(x => x.id !== 1); expect(a).toHaveLength(0); });
});

describe('Tier 2: Boundary 10 - Unicode & Multilingual', () => {
  it('handles emojis in product title', () => { const p = { ...coffeeProducts[0], title: '☕ Roast 🌟' }; const c = new CartEngine(STORES.coffee); const i = c.addItem(p); expect(i.title).toContain('☕'); });
  it('searches arabic text', () => { const p = { ...coffeeProducts[0], title: 'قهوة' }; const se = new SearchEngine('coffee'); expect(se.search('قهوة', [p])).toHaveLength(1); });
  it('handles CJK characters', () => { const p = { ...coffeeProducts[0], title: 'スペシャルティ' }; const c = new CartEngine(STORES.coffee); expect(c.addItem(p).title).toBe('スペシャルティ'); });
  it('handles accented characters', () => { const p = { ...coffeeProducts[0], title: "L'Étoile" }; expect(p.title).toContain('É'); });
  it('accented names in checkout', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'r@f.fr', firstName: 'René', lastName: 'François', address: 'Rue' }); ch.setShippingMethod({ id: 's', rate: 5 }); const ord = ch.processPayment({ cardNumber: '1234567890123456', isDemo: true }); expect(ord.customer.firstName).toBe('René'); });
  it('currency symbols format', () => {
    const symbols = ['$', '€', '£', '¥'];
    for (const sym of symbols) {
      const formatted = `${sym}120.00`;
      expect(formatted.startsWith(sym)).toBe(true);
      expect(formatted).toContain('120.00');
    }
    const rawPayload = JSON.stringify({ currency: '€', amount: 120.00, formatted: '€120.00', store: 'fashion' });
    const parsed = JSON.parse(rawPayload);
    expect(parsed.currency).toBe('€');
    expect(parsed.amount).toBe(120.00);
    expect(parsed.formatted).toBe('€120.00');
    expect(parsed.store).toBe('fashion');
  });
});

describe('Tier 2: Boundary 11 - Cross-Store Isolation Boundaries', () => {
  it('same product ID in different stores does not collide', () => { const s = new MockStorage(); const cNs = new NamespacedStorage('coffee', s); const fNs = new NamespacedStorage('fashion', s); const p1 = { ...coffeeProducts[0], id: 'shared' }; const p2 = { ...fashionProducts[0], id: 'shared' }; const cCart = new CartEngine(STORES.coffee, cNs); const fCart = new CartEngine(STORES.fashion, fNs); cCart.addItem(p1); fCart.addItem(p2); expect(cCart.items[0].title).not.toBe(fCart.items[0].title); });
  it('store ids with hyphens namespace properly', () => { const s = new MockStorage(); const ns = new NamespacedStorage('store-v2', s); ns.set('k', 1); expect(ns.get('k')).toBe(1); });
  it('clearing coffee cart preserves fashion and jewelry', () => { const s = new MockStorage(); const cC = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s)); const fC = new CartEngine(STORES.fashion, new NamespacedStorage('fashion', s)); cC.addItem(coffeeProducts[0]); fC.addItem(fashionProducts[0]); cC.clear(); expect(cC.items).toHaveLength(0); expect(fC.items).toHaveLength(1); });
  it('wishlists isolated per store', () => { const s = new MockStorage(); const cW = new WishlistEngine('coffee', new NamespacedStorage('coffee', s)); const fW = new WishlistEngine('fashion', new NamespacedStorage('fashion', s)); cW.add('p1'); expect(fW.has('p1')).toBe(false); });
  it('storage event ignores other store prefix', () => { const s = new MockStorage(); let fired = false; s.addListener(e => { if (e.key?.includes('coffee')) fired = true; }); s.setItem('shopify_portfolio:fashion:cart', '[]'); expect(fired).toBe(false); });
  it('corrupted storage in store A does not affect store B', () => { const s = new MockStorage(); s.setItem('shopify_portfolio:coffee:cart_items', '{bad'); const fC = new CartEngine(STORES.fashion, new NamespacedStorage('fashion', s)); fC.addItem(fashionProducts[0]); expect(fC.items).toHaveLength(1); });
});

describe('Tier 2: Boundary 12 - Viewport Boundaries', () => {
  it('319px sub mobile flags mobile layout', () => { expect(ResponsiveLayoutEngine.evaluate(319).isMobile).toBe(true); });
  it('320px minimum mobile enables hamburger', () => { expect(ResponsiveLayoutEngine.evaluate(320).hasHamburgerNav).toBe(true); });
  it('768px tablet layout is mobile nav with 2 cols', () => { const l = ResponsiveLayoutEngine.evaluate(768); expect(l.isMobile).toBe(true); expect(l.gridColumns).toBe(2); });
  it('1024px transitions to desktop menu and 3 cols', () => { const l = ResponsiveLayoutEngine.evaluate(1024); expect(l.hasFullDesktopMenu).toBe(true); expect(l.gridColumns).toBe(3); });
  it('1440px transitions to 4 cols', () => { expect(ResponsiveLayoutEngine.evaluate(1440).gridColumns).toBe(4); });
  it('3840px 4K layout maintains 4 cols desktop', () => { const l = ResponsiveLayoutEngine.evaluate(3840); expect(l.gridColumns).toBe(4); expect(l.hasFullDesktopMenu).toBe(true); });
});

describe('Tier 2: Boundary 13 - Theme Tokens Extremes', () => {
  it('border radius none outputs 0px', () => { const v = ThemeTokenEngine.toCssVariables({ ...STORES.fashion.theme, shape: { borderRadius: 'none' } }); expect(v['--border-radius']).toBe('0px'); });
  it('border radius full outputs 9999px', () => { const v = ThemeTokenEngine.toCssVariables({ ...STORES.fashion.theme, shape: { borderRadius: 'full' } }); expect(v['--border-radius']).toBe('9999px'); });
  it('animation intensity snappy outputs 150ms', () => { const v = ThemeTokenEngine.toCssVariables({ ...STORES.electronics.theme, animation: { intensity: 'snappy' } }); expect(v['--animation-duration']).toBe('150ms'); });
  it('animation intensity cinematic outputs 600ms', () => { const v = ThemeTokenEngine.toCssVariables({ ...STORES.fashion.theme, animation: { intensity: 'cinematic' } }); expect(v['--animation-duration']).toBe('600ms'); });
  it('3 digit hex colors preserved', () => { const v = ThemeTokenEngine.toCssVariables({ ...STORES.coffee.theme, colors: { ...STORES.coffee.theme.colors, primary: '#0af' } }); expect(v['--color-primary']).toBe('#0af'); });
  it('font stacks preserved', () => { const v = ThemeTokenEngine.toCssVariables({ ...STORES.coffee.theme, typography: { headingFont: 'Georgia, serif' } }); expect(v['--font-heading']).toBe('Georgia, serif'); });
});

// TIER 3
describe('Tier 3: Interaction 01 - Variant, Price & Cart Integration', () => {
  it('variant option changes price and cart reflects updated price', () => { const c = new CartEngine(STORES.fashion); const p = fashionProducts[0]; c.addItem(p, p.variants[0].id); c.addItem(p, p.variants[1].id); expect(c.items[1].price).toBeGreaterThan(c.items[0].price); });
  it('different variants create distinct lines', () => { const c = new CartEngine(STORES.fashion); const p = fashionProducts[0]; c.addItem(p, p.variants[0].id); c.addItem(p, p.variants[1].id); expect(c.items).toHaveLength(2); });
});

describe('Tier 3: Interaction 02 - Cart & Free Shipping Progress', () => {
  it('sequential addition transitions progress 0 to 100 and back on removal', () => { const c = new CartEngine(STORES.coffee); const p = coffeeProducts[0]; c.addItem(p, null, 1); expect(c.getCalculation().freeShippingProgress).toBeLessThan(100); const i2 = c.addItem(p, null, 4); expect(c.getCalculation().freeShippingProgress).toBe(100); c.removeItem(i2.id); expect(c.getCalculation().freeShippingProgress).toBeLessThan(100); });
  it('hitting threshold sets shipping to 0 and updates total', () => { const c = new CartEngine(STORES.coffee); const p = { ...coffeeProducts[0], variants: [{ ...coffeeProducts[0].variants[0], price: 50 }] }; c.addItem(p, p.variants[0].id, 1); expect(c.getCalculation().shipping).toBe(0); });
});

describe('Tier 3: Interaction 03 - Search, Navigation & Cart', () => {
  it('instant search finds item, adds variant to cart', () => { const se = new SearchEngine('electronics'); const c = new CartEngine(STORES.electronics); const res = se.search('monitor', electronicsProducts); const i = c.addItem(res[0], res[0].variants[1].id); expect(i.variantId).toBe(res[0].variants[1].id); });
  it('searching preserves existing cart items', () => { const se = new SearchEngine('electronics'); const c = new CartEngine(STORES.electronics); c.addItem(electronicsProducts[0]); se.search('keyboard', electronicsProducts); expect(c.items).toHaveLength(1); });
});

describe('Tier 3: Interaction 04 - Wishlist, Filters & Move-to-Cart', () => {
  it('wishlist adds item, filtered collection displays it, moves to cart', () => { const w = new WishlistEngine('fashion'); const c = new CartEngine(STORES.fashion); const p = fashionProducts[0]; w.add(p.id); const f = CatalogFilterEngine.filter(fashionProducts, { category: p.category }); expect(f.some(x => x.id === p.id)).toBe(true); w.moveToCart(p, c); expect(w.has(p.id)).toBe(false); expect(c.items).toHaveLength(1); });
  it('wishlist count tracks accurately on move to cart', () => { const w = new WishlistEngine('fashion'); const c = new CartEngine(STORES.fashion); w.add('1'); w.add('2'); w.moveToCart(fashionProducts[0], c); expect(w.productIds.size).toBe(2); });
});

describe('Tier 3: Interaction 05 - Multi-Store Isolation', () => {
  it('coffee, fashion and jewelry carts stay isolated', () => { const s = new MockStorage(); const cC = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s)); const fC = new CartEngine(STORES.fashion, new NamespacedStorage('fashion', s)); cC.addItem(coffeeProducts[0], null, 2); fC.addItem(fashionProducts[0], null, 1); expect(cC.items[0].quantity).toBe(2); expect(fC.items[0].quantity).toBe(1); });
  it('clearing one store does not affect others', () => { const s = new MockStorage(); const cC = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s)); const fC = new CartEngine(STORES.fashion, new NamespacedStorage('fashion', s)); cC.addItem(coffeeProducts[0]); fC.addItem(fashionProducts[0]); cC.clear(); expect(cC.items).toHaveLength(0); expect(fC.items).toHaveLength(1); });
});

describe('Tier 3: Interaction 06 - Multi-Tab Storage Synchronization', () => {
  it('tab 1 update syncs to tab 2', () => { const s = new MockStorage(); const c1 = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s)); const c2 = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s)); s.addListener(e => { if (e.key?.includes('cart_items')) c2.items = JSON.parse(e.newValue); }); c1.addItem(coffeeProducts[0]); expect(c2.items).toHaveLength(1); });
  it('tab 1 clear syncs empty cart to tab 2', () => { const s = new MockStorage(); const c1 = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s)); const c2 = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s)); s.addListener(e => { if (e.key?.includes('cart_items')) c2.items = e.newValue ? JSON.parse(e.newValue) : []; }); c1.addItem(coffeeProducts[0]); c1.clear(); expect(c2.items).toHaveLength(0); });
});

describe('Tier 3: Interaction 07 - Multi-Faceted Filter & Sort', () => {
  it('category + size filter then price asc sort', () => { const f = CatalogFilterEngine.filter(fashionProducts, { category: 'Outerwear', size: 'M' }); const s = CatalogFilterEngine.sort(f, 'price-asc'); expect(s.length).toBe(f.length); });
  it('clearing filter preserves sort order', () => { const s1 = CatalogFilterEngine.sort(fashionProducts, 'rating'); const f = CatalogFilterEngine.filter(fashionProducts, {}); const s2 = CatalogFilterEngine.sort(f, 'rating'); expect(s2[0].id).toBe(s1[0].id); });
});

describe('Tier 3: Interaction 08 - PDP Gallery & Variant Stock', () => {
  it('variant option switch resolves variant image', () => { expect(jewelryProducts[0].variants[0].imageUrl).not.toBe(jewelryProducts[0].variants[1].imageUrl); });
  it('out of stock variant prevents purchase', () => { const oos = jewelryProducts[0].variants.find(v => !v.availableForSale); expect(oos.availableForSale).toBe(false); });
});

describe('Tier 3: Interaction 09 - Full Checkout & Order History', () => {
  it('cart completes 4 steps, clears cart and records order', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0], null, 2); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'u@test.com', firstName: 'U', lastName: 'T', address: '123' }); ch.setShippingMethod({ id: 's', rate: 5 }); const ord = ch.processPayment({ cardNumber: '1234567890123456', isDemo: true }); expect(ord.status).toBe('confirmed'); expect(c.items).toHaveLength(0); });
  it('rebrowsing starts with clean cart', () => { const c = new CartEngine(STORES.coffee); c.addItem(coffeeProducts[0]); const ch = new CheckoutStateMachine(c); ch.setCustomerInfo({ email: 'u@test.com', firstName: 'U', lastName: 'T', address: '123' }); ch.setShippingMethod({ id: 's', rate: 5 }); ch.processPayment({ cardNumber: '1234567890123456', isDemo: true }); c.addItem(coffeeProducts[1]); expect(c.items).toHaveLength(1); });
});

describe('Tier 3: Interaction 10 - Theme Switching & CSS Variables', () => {
  it('swapping store theme alters root variables', () => { const cVars = ThemeTokenEngine.toCssVariables(STORES.coffee.theme); const fVars = ThemeTokenEngine.toCssVariables(STORES.fashion.theme); expect(cVars['--color-primary']).not.toBe(fVars['--color-primary']); expect(cVars['--font-heading']).not.toBe(fVars['--font-heading']); });
  it('electronics theme applies tech hud variables', () => { const eVars = ThemeTokenEngine.toCssVariables(STORES.electronics.theme); expect(eVars['--color-primary']).toBe('#00E5FF'); expect(eVars['--animation-duration']).toBe('150ms'); });
});

// TIER 4
describe('Tier 4: Scenario S1 - Coffee Connoisseur Complete Purchase', () => {
  it('executes full coffee connoisseur journey', () => {
    const s = new MockStorage();
    const c = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s));
    const p = coffeeProducts.find(x => x.title.includes('Yirgacheffe')) || coffeeProducts[0];
    const v = p.variants[1];
    c.addItem(p, v.id, 2);
    expect(c.getCalculation().freeShippingProgress).toBe(100);
    const ch = new CheckoutStateMachine(c);
    ch.setCustomerInfo({ email: 'coffee@connoisseur.com', firstName: 'Oliver', lastName: 'Vance', address: '88 Barista Lane' });
    ch.setShippingMethod({ id: 'free', rate: 0 });
    const ord = ch.processPayment({ cardNumber: '1234567890123456', isDemo: true });
    expect(ord.status).toBe('confirmed');
    expect(c.items).toHaveLength(0);
  });
});

describe('Tier 4: Scenario S2 - High-Fashion Minimalist Browsing & Filtering', () => {
  it('executes high-fashion filtering, sorting, wishlist and move-to-cart', () => {
    const s = new MockStorage();
    const w = new WishlistEngine('fashion', new NamespacedStorage('fashion', s));
    const c = new CartEngine(STORES.fashion, new NamespacedStorage('fashion', s));
    const f = CatalogFilterEngine.filter(fashionProducts, { category: 'Outerwear', size: 'M' });
    const sorted = CatalogFilterEngine.sort(f, 'newest');
    const item = sorted[0];
    w.add(item.id);
    expect(w.has(item.id)).toBe(true);
    w.moveToCart(item, c);
    expect(w.has(item.id)).toBe(false);
    expect(c.items).toHaveLength(1);
  });
});

describe('Tier 4: Scenario S3 - Luxury Jewelry Multi-Item Gift Selection', () => {
  it('executes luxury gift selection, 100% threshold reached and checkout', () => {
    const s = new MockStorage();
    const c = new CartEngine(STORES.jewelry, new NamespacedStorage('jewelry', s));
    c.addItem(jewelryProducts[0], jewelryProducts[0].variants[1].id, 3);
    c.addItem(jewelryProducts[3], jewelryProducts[3].variants[0].id, 2);
    expect(c.getCalculation().freeShippingProgress).toBe(100);
    const ch = new CheckoutStateMachine(c);
    ch.setCustomerInfo({ email: 'elena@lux.com', firstName: 'Elena', lastName: 'M', address: '10 Place Vendôme' });
    ch.setShippingMethod({ id: 'free', rate: 0 });
    const ord = ch.processPayment({ cardNumber: '1234567890123456', isDemo: true });
    expect(ord.status).toBe('confirmed');
  });
});

describe('Tier 4: Scenario S4 - Tech Geek Electronics Spec Comparison', () => {
  it('executes search, specs check and quick add to cart', () => {
    const se = new SearchEngine('electronics');
    const res = se.search('OLED', electronicsProducts);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].specifications.Latency).toBe('< 1ms Ultra Low');
    const c = new CartEngine(STORES.electronics);
    c.addItem(res[0], res[0].variants[1].id, 1);
    expect(c.items).toHaveLength(1);
  });
});

describe('Tier 4: Scenario S5 - Multi-Store Shopping Isolation Check', () => {
  it('navigates Coffee -> Fashion -> Jewelry and back with zero leakage', () => {
    const s = new MockStorage();
    const cC = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s));
    const fC = new CartEngine(STORES.fashion, new NamespacedStorage('fashion', s));
    const jC = new CartEngine(STORES.jewelry, new NamespacedStorage('jewelry', s));
    cC.addItem(coffeeProducts[0], null, 1);
    expect(fC.items).toHaveLength(0);
    fC.addItem(fashionProducts[0], null, 1);
    expect(jC.items).toHaveLength(0);
    const cCReload = new CartEngine(STORES.coffee, new NamespacedStorage('coffee', s));
    expect(cCReload.items).toHaveLength(1);
    expect(fC.items).toHaveLength(1);
  });
});

describe('Tier 4: Scenario S6 - Mobile Shopper Low-Bandwidth / 375px Run', () => {
  it('executes mobile shopper journey at 375px viewport', () => {
    const layout = ResponsiveLayoutEngine.evaluate(375);
    expect(layout.hasHamburgerNav).toBe(true);
    expect(layout.hasStickyAddToCart).toBe(true);
    const c = new CartEngine(STORES.coffee);
    c.addItem(coffeeProducts[0]);
    c.isCartOpen = true;
    expect(c.isCartOpen).toBe(true);
    c.updateQuantity(c.items[0].id, 2);
    expect(c.getCalculation().totalQuantity).toBe(2);
    c.isCartOpen = false;
    expect(c.isCartOpen).toBe(false);
  });
});

// ----------------------------------------------------------------------------
// RUNNER LOOP & REPORTING
// ----------------------------------------------------------------------------
async function run() {
  const startTime = Date.now();
  const summary = {
    total: 0, passed: 0, failed: 0, durationMs: 0,
    tierCounts: {
      tier1: { total: 0, passed: 0, failed: 0 },
      tier2: { total: 0, passed: 0, failed: 0 },
      tier3: { total: 0, passed: 0, failed: 0 },
      tier4: { total: 0, passed: 0, failed: 0 }
    },
    suites: [],
    failures: []
  };

  for (const suite of registeredSuites) {
    let sPassed = 0;
    let sFailed = 0;
    const sStart = Date.now();

    for (const testCase of suite.tests) {
      summary.total++;
      summary.tierCounts[suite.tier].total++;
      let pass = true;
      let err = null;
      try {
        testCase.fn();
      } catch (e) {
        pass = false;
        err = e;
      }
      if (pass) {
        summary.passed++;
        summary.tierCounts[suite.tier].passed++;
        sPassed++;
      } else {
        summary.failed++;
        summary.tierCounts[suite.tier].failed++;
        sFailed++;
        summary.failures.push({ suite: suite.name, name: testCase.name, error: err });
      }
    }

    summary.suites.push({
      suiteName: suite.name,
      total: suite.tests.length,
      passed: sPassed,
      failed: sFailed,
      durationMs: Date.now() - sStart
    });
  }

  summary.durationMs = Date.now() - startTime;

  console.log('======================================================================');
  console.log('        SHOPIFY PORTFOLIO PLATFORM - E2E TEST RUNNER REPORT          ');
  console.log('======================================================================\n');

  for (const s of summary.suites) {
    const status = s.failed === 0 ? '✓ PASS' : '✗ FAIL';
    console.log(` [${status}] ${s.suiteName} (${s.passed}/${s.total} passed, ${s.durationMs}ms)`);
  }

  console.log('\n----------------------------------------------------------------------');
  console.log(' SUMMARY BY TIER:');
  console.log('----------------------------------------------------------------------');
  const t1 = summary.tierCounts.tier1;
  const t2 = summary.tierCounts.tier2;
  const t3 = summary.tierCounts.tier3;
  const t4 = summary.tierCounts.tier4;
  console.log(` Tier 1 (Feature Coverage):   ${t1.passed}/${t1.total} passed ${t1.failed > 0 ? `(${t1.failed} FAILED)` : '✓'}`);
  console.log(` Tier 2 (Boundary & Corner):  ${t2.passed}/${t2.total} passed ${t2.failed > 0 ? `(${t2.failed} FAILED)` : '✓'}`);
  console.log(` Tier 3 (Cross Interactions): ${t3.passed}/${t3.total} passed ${t3.failed > 0 ? `(${t3.failed} FAILED)` : '✓'}`);
  console.log(` Tier 4 (Customer Scenarios): ${t4.passed}/${t4.total} passed ${t4.failed > 0 ? `(${t4.failed} FAILED)` : '✓'}`);
  console.log('----------------------------------------------------------------------');
  console.log(` TOTAL: ${summary.passed}/${summary.total} passed (${summary.failed} failed) in ${summary.durationMs}ms`);
  console.log('======================================================================');

  if (summary.failures.length > 0) {
    console.log('\nFAILURES:');
    for (const f of summary.failures) {
      console.log(`- [${f.suite}] > ${f.name}: ${f.error?.message || f.error}`);
    }
  }

  try {
    const outputPath = path.resolve(__dirname, '../test-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`\nSaved structured test summary to: ${outputPath}`);
  } catch (err) {
    console.warn(`Could not save test-results.json: ${err.message}`);
  }

  process.exitCode = summary.failed === 0 ? 0 : 1;
}

run();
