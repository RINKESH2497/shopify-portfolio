/**
 * Store Registry & Lookup Service
 *
 * Provides central registration and lookup for all demo stores:
 * - Coffee ("Terroir & Roast")
 * - Fashion ("Atelier Noir")
 * - Jewelry ("L'Étoile Joaillerie")
 * - Electronics ("Nexus Tech")
 *
 * Implements the store extensibility contract: new stores are added
 * with zero engine modification by registering a StoreRegistryEntry.
 */

import { StoreConfig, StoreRegistry, StoreRegistryEntry } from '../types/store';
import { Product } from '../types/product';

import { coffeeStore } from './coffee';
import { fashionStore } from './fashion';
import { jewelryStore } from './jewelry';
import { electronicsStore } from './electronics';

export const DEFAULT_STORE_ID = 'coffee';

/**
 * Initial immutable baseline registry containing the 4 primary demo stores.
 */
export const INITIAL_STORE_REGISTRY: StoreRegistry = {
  coffee: coffeeStore,
  fashion: fashionStore,
  jewelry: jewelryStore,
  electronics: electronicsStore,
};

/**
 * Active mutable registry allowing dynamic runtime registration.
 */
let activeStoreRegistry: StoreRegistry = { ...INITIAL_STORE_REGISTRY };

/**
 * Returns the complete dictionary of registered stores.
 */
export function getStoreRegistry(): StoreRegistry {
  return { ...activeStoreRegistry };
}

/**
 * Returns an array of configurations for all currently registered stores.
 */
export function getAllStores(): StoreConfig[] {
  return Object.values(activeStoreRegistry).map((entry) => entry.config);
}

/**
 * Returns an array of all registered store entries (config + products).
 */
export function getAllStoreEntries(): StoreRegistryEntry[] {
  return Object.values(activeStoreRegistry);
}

/**
 * Retrieves the StoreConfig for a specific store ID.
 * Returns undefined if store does not exist.
 */
export function getStoreConfig(storeId: string): StoreConfig | undefined {
  if (!storeId) return undefined;
  const entry = activeStoreRegistry[storeId.toLowerCase()];
  return entry ? entry.config : undefined;
}

/**
 * Retrieves the catalog products for a specific store ID.
 * Returns an empty array if store does not exist.
 */
export function getStoreProducts(storeId: string): Product[] {
  if (!storeId) return [];
  const entry = activeStoreRegistry[storeId.toLowerCase()];
  return entry ? entry.products : [];
}

/**
 * Checks whether a given store ID is registered.
 */
export function isValidStoreId(storeId: string): boolean {
  if (!storeId) return false;
  return Boolean(activeStoreRegistry[storeId.toLowerCase()]);
}

/**
 * Extensibility API: Registers a new store dynamically into the runtime registry.
 */
export function registerStore(entry: StoreRegistryEntry): void {
  if (!entry || !entry.config || !entry.config.id) {
    throw new Error('[StoreRegistry] Cannot register invalid store entry: missing config.id');
  }
  const id = entry.config.id.toLowerCase();
  activeStoreRegistry[id] = entry;
}

/**
 * Resets the runtime registry back to the default 4 demo stores.
 */
export function resetStoreRegistry(): void {
  activeStoreRegistry = { ...INITIAL_STORE_REGISTRY };
}

export { INITIAL_STORE_REGISTRY as STORE_REGISTRY };
