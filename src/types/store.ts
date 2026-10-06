/**
 * Store Configuration & Registry Type Definitions
 * Exact alignment with PROJECT.md lines 227-237 and test fixture requirements.
 */

import { Product } from './product';
import { SectionConfig } from './section';
import { ThemeTokens } from './theme';

export type StoreIndustry = 'coffee' | 'fashion' | 'jewelry' | 'electronics' | string;

export interface NavigationItem {
  label: string;
  href: string;
  badge?: string;
  children?: NavigationItem[];
}

export interface StoreConfig {
  id: string; // e.g. 'coffee', 'fashion', 'jewelry', 'electronics'
  name: string;
  tagline: string;
  industry: 'coffee' | 'fashion' | 'jewelry' | 'electronics' | string;
  currency: string;
  currencySymbol?: string;
  theme: ThemeTokens;
  sections: SectionConfig[];
  navigation: NavigationItem[];
  freeShippingThreshold: number;
  standardShippingRate?: number;
  taxRate?: number;
}

export interface StoreRegistryEntry {
  config: StoreConfig;
  products: Product[];
}

export type StoreRegistry = Record<string, StoreRegistryEntry>;
