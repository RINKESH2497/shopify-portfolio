/**
 * Stores Barrel Export
 *
 * Consolidates all 4 store themes, products, configurations, and StoreRegistry.
 */

// Individual Stores
export * from './coffee';
export * from './fashion';
export * from './jewelry';
export * from './electronics';

// Store Registry & Lookup Utilities
export {
  DEFAULT_STORE_ID,
  INITIAL_STORE_REGISTRY,
  STORE_REGISTRY,
  getStoreRegistry,
  getAllStores,
  getAllStoreEntries,
  getStoreConfig,
  getStoreProducts,
  isValidStoreId,
  registerStore,
  resetStoreRegistry,
} from './registry';
