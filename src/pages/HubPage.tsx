import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Layers,
  Palette,
  ShieldCheck,
  Cpu,
  Coffee,
  Shirt,
  Gem,
  Monitor,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { getAllStores } from '../stores/registry';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const STORE_MEDIA: Record<string, { icon: React.ReactNode; coverImage: string; badge: string; accentColor: string }> = {
  coffee: {
    icon: <Coffee className="w-5 h-5 text-amber-700" />,
    coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    badge: 'Warm Organic Roast',
    accentColor: '#D4A373',
  },
  fashion: {
    icon: <Shirt className="w-5 h-5 text-neutral-900" />,
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    badge: 'Minimalist Editorial',
    accentColor: '#0A0A0A',
  },
  jewelry: {
    icon: <Gem className="w-5 h-5 text-amber-400" />,
    coverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    badge: 'Haute Joaillerie Paris',
    accentColor: '#C5A059',
  },
  electronics: {
    icon: <Monitor className="w-5 h-5 text-cyan-400" />,
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    badge: 'Cyber Tech & Telemetry',
    accentColor: '#00E5FF',
  },
};

export const HubPage: React.FC = () => {
  const stores = getAllStores();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Portfolio Nav */}
      <nav className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 via-amber-300 to-rose-400 p-0.5">
              <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-white block">
                Shopify Architecture Portfolio
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Single Engine • 4 Multi-Store Views
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" size="sm" dot>
              188/188 E2E Verified
            </Badge>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Modular Headless E-Commerce System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            One Shared Engine. <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-amber-200 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Four Visually Distinct Brands.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            A production-grade Shopify portfolio built with React 18, TypeScript, and Tailwind CSS.
            Demonstrating multi-store dynamic theming, faceted filtering, variant calculations, and responsive layouts across 4 curated industries.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#store-grid"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-black hover:bg-neutral-200 transition-all shadow-lg shadow-white/5"
            >
              <span>Explore Demo Stores</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-neutral-700 hover:bg-neutral-900 text-neutral-300 transition-colors"
            >
              <span>Architecture Specs</span>
            </a>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 4 Stores Gallery Grid */}
      <section id="store-grid" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Live Demo Stores
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Select any store to enter its customized visual theme and product catalog.
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            4 / 4 STORES DEPLOYED & TESTED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stores.map((store) => {
            const meta = STORE_MEDIA[store.id] || STORE_MEDIA.coffee;
            const theme = store.theme;

            return (
              <div
                key={store.id}
                className="group relative rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all duration-300 flex flex-col"
              >
                {/* Visual Cover Banner */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={meta.coverImage}
                    alt={`${store.name} hero preview`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

                  {/* Top Industry Pill */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900/90 text-white backdrop-blur-md border border-white/10">
                      {meta.icon}
                      <span className="capitalize">{store.industry}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-900/80 text-neutral-300 backdrop-blur-md border border-white/10">
                      {meta.badge}
                    </span>
                  </div>

                  {/* Header Style Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/60 text-neutral-300 border border-white/10 backdrop-blur-md">
                      Header: {theme.layout.headerStyle}
                    </span>
                  </div>

                  {/* Title & Tagline overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 line-clamp-1 mt-1">
                      {store.tagline}
                    </p>
                  </div>
                </div>

                {/* Theme Specification & Color Swatches */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/60">
                      <span className="text-[10px] uppercase text-neutral-500 font-semibold block">
                        Font Pairing
                      </span>
                      <span className="font-medium text-neutral-200 truncate block mt-0.5">
                        {theme.typography.headingFont.split(',')[0]}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/60">
                      <span className="text-[10px] uppercase text-neutral-500 font-semibold block">
                        Border Shape
                      </span>
                      <span className="font-medium text-neutral-200 capitalize block mt-0.5">
                        {theme.shape.borderRadius} ({theme.shape.cardStyle})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase text-neutral-500 font-semibold block">
                        Hero Style
                      </span>
                      <span className="font-medium text-neutral-200 capitalize block mt-0.5">
                        {theme.layout.heroVariant}
                      </span>
                    </div>
                  </div>

                  {/* Color Palette Swatches */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-400 font-medium mr-2">
                      Palette:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: theme.colors.primary }}
                        title={`Primary: ${theme.colors.primary}`}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: theme.colors.secondary }}
                        title={`Secondary: ${theme.colors.secondary}`}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: theme.colors.accent }}
                        title={`Accent: ${theme.colors.accent}`}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: theme.colors.background }}
                        title={`Background: ${theme.colors.background}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 ml-auto">
                      {store.sections.length} Sections
                    </span>
                  </div>

                  {/* CTA Actions */}
                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      to={`/${store.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all"
                    >
                      <span>Enter Store</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/${store.id}/collections/all`}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
                    >
                      Collections
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture & Engineering Highlights */}
      <section id="architecture" className="py-16 sm:py-24 border-t border-neutral-800 bg-neutral-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Architectural Highlights
            </h2>
            <p className="mt-3 text-neutral-400 text-sm sm:text-base">
              Engineered according to strict software craftsmanship principles: universal TypeScript contracts, float-safe financial mathematics, and zero-engine-change extensibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Unified Engine Core
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                7 composed React context providers (`StoreContext`, `ThemeContext`, `CartContext`, `WishlistContext`, `SearchContext`, `AccountContext`, `CheckoutContext`) powering all 4 stores with cross-tab local storage synchronization.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Dynamic Theme Tokens
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automated CSS custom property injection into `:root` dynamically re-skins typography, colors, radii, content density, and animations with zero CSS file duplication.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Zero-Code Extensibility
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                New stores can be added in 3 steps (theme config file, product catalog file, and 1 registry entry). Zero modifications required in the shared engine or section components.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 text-center text-xs text-neutral-500">
        <p>&copy; 2026 Shopify Portfolio Multi-Store Platform. Single-engine architecture benchmark.</p>
      </footer>
    </div>
  );
};

export default HubPage;
