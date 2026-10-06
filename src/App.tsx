import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ShopifyEngineProvider } from './engine';
import { StoreLayout } from './components/layout';
import {
  HubPage,
  HomePage,
  CollectionPage,
  ProductPage,
  CartPage,
  CheckoutPage,
  AccountPage,
} from './pages';

/**
 * Scroll restoration component that scrolls window to top on route transitions
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

/**
 * Core application routes definition
 */
export const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Hub Landing Page */}
        <Route path="/" element={<HubPage />} />

        {/* Dynamic Multi-Store Views */}
        <Route path="/:storeId" element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="collections" element={<CollectionPage />} />
          <Route path="collections/:handle" element={<CollectionPage />} />
          <Route path="products" element={<CollectionPage />} />
          <Route path="products/:handle" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>

        {/* Catch-all fallback to Portfolio Hub */}
        <Route path="*" element={<HubPage />} />
      </Routes>
    </>
  );
};

/**
 * Root Application Component
 * Configures top-level router and shared e-commerce engine context
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ShopifyEngineProvider>
        <AppRoutes />
      </ShopifyEngineProvider>
    </BrowserRouter>
  );
};

export default App;
