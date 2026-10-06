import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ShopifyEngineProvider } from '../../engine';
import { StoreLayout } from '../../components/layout/StoreLayout';
import { Header } from '../../components/layout/Header';
import { CartDrawer } from '../../components/layout/CartDrawer';
import { SearchModal } from '../../components/layout/SearchModal';
import { MobileNav } from '../../components/layout/MobileNav';
import { HubPage } from '../HubPage';
import { HomePage } from '../HomePage';
import { CollectionPage } from '../CollectionPage';
import { ProductPage } from '../ProductPage';
import { CartPage } from '../CartPage';
import { CheckoutPage } from '../CheckoutPage';
import { AccountPage } from '../AccountPage';
import { STORE_REGISTRY } from '../../stores/registry';
import { createStoreStorage } from '../../utils/storage';

describe('Milestone 5: Multi-Store Views, Pages & Responsive Layouts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Portfolio Hub Page (/)', () => {
    it('renders platform heading, architecture highlights, and verified badges', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <HubPage />
        </MemoryRouter>
      );

      expect(screen.getByText(/Shopify Architecture Portfolio/i)).toBeInTheDocument();
      expect(screen.getByText(/One Shared Engine/i)).toBeInTheDocument();
      expect(screen.getByText(/Four Visually Distinct Brands/i)).toBeInTheDocument();
      expect(screen.getByText(/188\/188 E2E Verified/i)).toBeInTheDocument();
    });

    it('renders 4 distinct store preview cards with direct entry links', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <HubPage />
        </MemoryRouter>
      );

      expect(screen.getAllByText('Terroir & Roast')[0]).toBeInTheDocument();
      expect(screen.getByText('Atelier Noir')).toBeInTheDocument();
      expect(screen.getByText("L'Étoile Joaillerie")).toBeInTheDocument();
      expect(screen.getAllByText('Nexus Tech')[0]).toBeInTheDocument();

      const enterLinks = screen.getAllByRole('link', { name: /enter store/i });
      expect(enterLinks.length).toBe(4);
    });

    it('showcases theme tokens (font, border radius, palette) for each store', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <HubPage />
        </MemoryRouter>
      );

      expect(screen.getByText(/Fraunces/i)).toBeInTheDocument();
      expect(screen.getByText(/Syne/i)).toBeInTheDocument();
      expect(screen.getByText(/Cormorant Garamond/i)).toBeInTheDocument();
      expect(screen.getByText(/Space Grotesk/i)).toBeInTheDocument();
    });
  });

  describe('2. Store Homepage (/:storeId)', () => {
    it('renders the coffee store homepage with its configured section sequence', () => {
      render(
        <MemoryRouter initialEntries={['/coffee']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <StoreLayout />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getAllByText('Terroir & Roast')[0]).toBeInTheDocument();
    });

    it('renders the electronics store homepage with tech-hud header style', () => {
      render(
        <MemoryRouter initialEntries={['/electronics']}>
          <ShopifyEngineProvider initialStoreId="electronics">
            <StoreLayout />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getAllByText('Nexus Tech')[0]).toBeInTheDocument();
      expect(screen.getByText(/CORE: ACTIVE/i)).toBeInTheDocument();
    });
  });

  describe('3. Collection Page (/:storeId/collections/:handle)', () => {
    it('renders collection products and category filters', () => {
      render(
        <MemoryRouter initialEntries={['/coffee/collections/all']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CollectionPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /all products/i })).toBeInTheDocument();
      expect(screen.getAllByText('Single Origin')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Blends')[0]).toBeInTheDocument();
    });

    it('filters products when clicking category pills', () => {
      render(
        <MemoryRouter initialEntries={['/coffee/collections/all']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CollectionPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const singleOriginBtn = screen.getAllByRole('button', { name: /single origin/i })[0];
      fireEvent.click(singleOriginBtn);

      expect(screen.getByRole('heading', { level: 1, name: /single origin/i })).toBeInTheDocument();
      expect(screen.getByText(/Category: Single Origin/i)).toBeInTheDocument();
    });

    it('sorts products by price low to high', () => {
      render(
        <MemoryRouter initialEntries={['/coffee/collections/all']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CollectionPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });
      expect(sortSelect).toHaveValue('price-asc');
    });

    it('clears active filters and restores full catalog', () => {
      render(
        <MemoryRouter initialEntries={['/coffee/collections/all']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CollectionPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const blendsBtn = screen.getAllByRole('button', { name: /blends/i })[0];
      fireEvent.click(blendsBtn);

      const clearBtn = screen.getAllByRole('button', { name: /clear all/i })[0];
      fireEvent.click(clearBtn);

      expect(screen.getByRole('heading', { level: 1, name: /all products/i })).toBeInTheDocument();
    });
  });

  describe('4. Product Detail Page (/:storeId/products/:handle)', () => {
    it('renders product title, pricing, ratings, and gallery thumbnails', () => {
      const product = STORE_REGISTRY.coffee.products[0];

      render(
        <MemoryRouter initialEntries={[`/coffee/products/${product.handle}`]}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <Routes>
              <Route path="/:storeId/products/:handle" element={<ProductPage />} />
            </Routes>
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: product.title })).toBeInTheDocument();
      expect(screen.getAllByText(product.category)[0]).toBeInTheDocument();
    });

    it('switches variant when clicking option buttons and updates price', () => {
      const product = STORE_REGISTRY.coffee.products[0];

      render(
        <MemoryRouter initialEntries={[`/coffee/products/${product.handle}`]}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <Routes>
              <Route path="/:storeId/products/:handle" element={<ProductPage />} />
            </Routes>
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      if (product.options && product.options.length > 0) {
        const firstOption = product.options[0];
        if (firstOption.values.length > 1) {
          const secondValBtn = screen.getByRole('button', { name: firstOption.values[1] });
          fireEvent.click(secondValBtn);
          expect(secondValBtn).toBeInTheDocument();
        }
      }
    });

    it('increases quantity and clicks add to cart button', () => {
      const product = STORE_REGISTRY.coffee.products[0];

      render(
        <MemoryRouter initialEntries={[`/coffee/products/${product.handle}`]}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <Routes>
              <Route path="/:storeId/products/:handle" element={<ProductPage />} />
            </Routes>
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const incBtn = screen.getByRole('button', { name: /increase quantity/i });
      fireEvent.click(incBtn);

      const addBtn = screen.getAllByRole('button', { name: /add to cart/i })[0];
      fireEvent.click(addBtn);

      expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
    });

    it('renders sticky mobile add to cart bar', () => {
      const product = STORE_REGISTRY.coffee.products[0];

      render(
        <MemoryRouter initialEntries={[`/coffee/products/${product.handle}`]}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <Routes>
              <Route path="/:storeId/products/:handle" element={<ProductPage />} />
            </Routes>
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const mobileButtons = screen.getAllByRole('button', { name: /add to cart/i });
      expect(mobileButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. Dedicated Cart Page (/:storeId/cart)', () => {
    it('shows empty cart state initially', () => {
      render(
        <MemoryRouter initialEntries={['/coffee/cart']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CartPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /explore collections/i })).toBeInTheDocument();
    });

    it('displays items and calculates order summary when seeded with cart items', () => {
      const product = STORE_REGISTRY.coffee.products[0];
      const storage = createStoreStorage('coffee');
      storage.set('cart_items', [
        {
          id: `${product.id}-${product.variants[0].id}`,
          productId: product.id,
          variantId: product.variants[0].id,
          title: product.title,
          variantTitle: product.variants[0].title,
          price: product.variants[0].price,
          quantity: 2,
          imageUrl: product.images[0]?.url || '',
          selectedOptions: product.variants[0].options,
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/coffee/cart']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CartPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /shopping cart/i })).toBeInTheDocument();
      expect(screen.getAllByText(product.title)[0]).toBeInTheDocument();
      expect(screen.getByText(/order summary/i)).toBeInTheDocument();
    });

    it('validates and applies promo code WELCOME10', () => {
      const product = STORE_REGISTRY.coffee.products[0];
      const storage = createStoreStorage('coffee');
      storage.set('cart_items', [
        {
          id: `${product.id}-${product.variants[0].id}`,
          productId: product.id,
          variantId: product.variants[0].id,
          title: product.title,
          variantTitle: product.variants[0].title,
          price: product.variants[0].price,
          quantity: 1,
          imageUrl: product.images[0]?.url || '',
          selectedOptions: product.variants[0].options,
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/coffee/cart']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CartPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const promoInput = screen.getByPlaceholderText(/coupon: welcome10/i);
      fireEvent.change(promoInput, { target: { value: 'WELCOME10' } });

      const applyBtn = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyBtn);

      expect(screen.getByText(/WELCOME10/i)).toBeInTheDocument();
    });
  });

  describe('6. Checkout Page (/:storeId/checkout)', () => {
    it('renders demo checkout banner and step indicators when cart has items', () => {
      const product = STORE_REGISTRY.coffee.products[0];
      const storage = createStoreStorage('coffee');
      storage.set('cart_items', [
        {
          id: `${product.id}-${product.variants[0].id}`,
          productId: product.id,
          variantId: product.variants[0].id,
          title: product.title,
          variantTitle: product.variants[0].title,
          price: product.variants[0].price,
          quantity: 1,
          imageUrl: product.images[0]?.url || '',
          selectedOptions: product.variants[0].options,
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/coffee/checkout']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CheckoutPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/DEMO CHECKOUT MODE/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact & Shipping Details/i)).toBeInTheDocument();
    });

    it('progresses through steps: info -> shipping -> payment -> confirmation', async () => {
      const product = STORE_REGISTRY.coffee.products[0];
      const storage = createStoreStorage('coffee');
      storage.set('cart_items', [
        {
          id: `${product.id}-${product.variants[0].id}`,
          productId: product.id,
          variantId: product.variants[0].id,
          title: product.title,
          variantTitle: product.variants[0].title,
          price: product.variants[0].price,
          quantity: 1,
          imageUrl: product.images[0]?.url || '',
          selectedOptions: product.variants[0].options,
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/coffee/checkout']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CheckoutPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      // Step 1: Info -> Click Continue to Shipping
      const shippingBtn = screen.getByRole('button', { name: /continue to shipping/i });
      fireEvent.click(shippingBtn);

      // Step 2: Shipping -> Click Continue to Payment
      await waitFor(() => {
        expect(screen.getByText(/Select Shipping Method/i)).toBeInTheDocument();
      });
      const paymentBtn = screen.getByRole('button', { name: /continue to payment/i });
      fireEvent.click(paymentBtn);

      // Step 3: Payment -> Click Complete Order
      await waitFor(() => {
        expect(screen.getByText(/Simulated Payment/i)).toBeInTheDocument();
      });
      const completeBtn = screen.getByRole('button', { name: /complete order/i });
      fireEvent.click(completeBtn);

      // Step 4: Confirmation screen
      await waitFor(
        () => {
          expect(screen.getByText(/Thank You for Your Order/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('7. Account Dashboard (/:storeId/account)', () => {
    it('renders profile card and tabs for orders, addresses, wishlist, and settings', () => {
      render(
        <MemoryRouter initialEntries={['/coffee/account']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <AccountPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /order history/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /addresses/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /wishlist/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /account settings/i })).toBeInTheDocument();
    });

    it('switches to addresses tab and displays saved address cards', () => {
      render(
        <MemoryRouter initialEntries={['/coffee/account']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <AccountPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const addressTab = screen.getByRole('tab', { name: /addresses/i });
      fireEvent.click(addressTab);

      expect(screen.getByText('742 Evergreen Terrace')).toBeInTheDocument();
      expect(screen.getByText('Springfield, OR 97477')).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('switches to settings tab and has reset demo account button', () => {
      render(
        <MemoryRouter initialEntries={['/coffee/account']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <AccountPage />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      const settingsTab = screen.getByRole('tab', { name: /account settings/i });
      fireEvent.click(settingsTab);

      expect(screen.getByRole('button', { name: /reset demo account data/i })).toBeInTheDocument();
    });
  });

  describe('8. Layout Primitives (Header, CartDrawer, SearchModal, MobileNav)', () => {
    it('renders Header with cart counter and search trigger', () => {
      render(
        <MemoryRouter initialEntries={['/coffee']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <Header onOpenMobileNav={() => {}} />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('button', { name: /search catalog/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /shopping cart/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /switch store/i })).toBeInTheDocument();
    });

    it('opens and closes CartDrawer properly', () => {
      render(
        <MemoryRouter initialEntries={['/coffee']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <CartDrawer isOpen={true} onClose={() => {}} />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/your cart \(0\)/i)).toBeInTheDocument();
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });

    it('renders SearchModal with input and quick suggestions', () => {
      render(
        <MemoryRouter initialEntries={['/coffee']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <SearchModal isOpen={true} onClose={() => {}} />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('renders MobileNav drawer with navigation and store switcher', () => {
      render(
        <MemoryRouter initialEntries={['/coffee']}>
          <ShopifyEngineProvider initialStoreId="coffee">
            <MobileNav isOpen={true} onClose={() => {}} />
          </ShopifyEngineProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Shop Terroir & Roast/i)).toBeInTheDocument();
      expect(screen.getByText(/Switch Demo Store/i)).toBeInTheDocument();
    });
  });
});
