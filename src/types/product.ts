/**
 * Product & Catalog Type Definitions
 * Aligned with PROJECT.md and test specifications.
 * Zero `any` — full static type safety.
 */

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  width?: number;
  height?: number;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  options: Record<string, string>; // e.g. { Size: "M", Color: "Black" } or { Grind: "Espresso", Weight: "12oz" }
  availableForSale: boolean;
  inventoryQuantity: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  tags: string[];
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  rating: ProductRating;
  specifications?: Record<string, string>;
  featured?: boolean;
  createdAt?: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

export type ProductSortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'newest'
  | 'bestselling';

export interface ProductFilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  rating?: number;
  inStockOnly?: boolean;
  tags?: string[];
}
