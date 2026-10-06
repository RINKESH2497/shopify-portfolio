import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import { MobileNav } from './MobileNav';
import { useStore } from '../../engine/StoreContext';
import { isValidStoreId, DEFAULT_STORE_ID } from '../../stores/registry';

export const StoreLayout: React.FC = () => {
  const { storeId: urlStoreId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { storeId, setStoreId } = useStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Sync route storeId parameter with StoreContext
  useEffect(() => {
    if (urlStoreId) {
      if (isValidStoreId(urlStoreId)) {
        if (urlStoreId !== storeId) {
          setStoreId(urlStoreId);
        }
      } else {
        // Fallback to default store if invalid storeId supplied
        navigate(`/${DEFAULT_STORE_ID}`, { replace: true });
      }
    }
  }, [urlStoreId, storeId, setStoreId, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background,#ffffff)] text-[var(--color-text,#111827)] font-body antialiased selection:bg-[var(--color-primary,#111827)] selection:text-[var(--color-surface,#ffffff)] overflow-x-hidden w-full">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[var(--color-primary,#111827)] focus:text-[var(--color-surface,#ffffff)]"
      >
        Skip to main content
      </a>

      {/* Dynamic Header */}
      <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />

      {/* Main Page Content Outlet */}
      <main id="main-content" className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Dynamic Footer */}
      <Footer />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Instant Search Overlay Modal */}
      <SearchModal />

      {/* Slide-out Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </div>
  );
};

export default StoreLayout;
