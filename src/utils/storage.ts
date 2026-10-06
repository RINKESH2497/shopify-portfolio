/**
 * Namespaced LocalStorage Persistence Layer
 *
 * Implements:
 * - Key namespacing: `shopify_portfolio:${storeId}:${key}`
 * - Transparent in-memory fallback for SSR, disabled storage, and QuotaExceededError
 * - Corrupted JSON recovery and sanitization
 * - Same-window and cross-tab reactive synchronization
 * - Store-level isolation for clearing data
 */

export interface StorageChangeEventDetail<T = unknown> {
  storeId: string;
  key: string;
  value: T | null;
  timestamp: number;
}

export const STORAGE_EVENT_NAME = 'shopify_portfolio:storage_change';
export const NAMESPACE_PREFIX = 'shopify_portfolio';

/**
 * In-memory storage fallback for SSR, private browsing, quota limits,
 * or mock testing environments.
 */
export class MemoryStorage implements Storage {
  private memoryMap = new Map<string, string>();

  get length(): number {
    return this.memoryMap.size;
  }

  getItem(key: string): string | null {
    return this.memoryMap.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.memoryMap.set(key, String(value));
  }

  removeItem(key: string): void {
    this.memoryMap.delete(key);
  }

  clear(): void {
    this.memoryMap.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.memoryMap.keys());
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  keys(): string[] {
    return Array.from(this.memoryMap.keys());
  }
}

export const memoryStorageFallback = new MemoryStorage();

/**
 * Safely tests if native window.localStorage is accessible and writable.
 */
export function isNativeStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const probeKey = `__probe_${NAMESPACE_PREFIX}__`;
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds the canonical storage key.
 */
export function buildStorageKey(storeId: string, key: string): string {
  const normalizedStore = encodeURIComponent(storeId.trim()) || 'global';
  const normalizedKey = key.trim();
  return `${NAMESPACE_PREFIX}:${normalizedStore}:${normalizedKey}`;
}

/**
 * Retrieves and deserializes a value from storage with safe fallback.
 */
export function getStorageItem<T>(storeId: string, key: string, defaultValue: T): T {
  const fullKey = buildStorageKey(storeId, key);
  const nativeAvailable = isNativeStorageAvailable();

  try {
    // 1. Check in-memory fallback first (takes precedence if written during quota exhaustion)
    let rawValue: string | null = memoryStorageFallback.getItem(fullKey);

    // 2. If not found in memory fallback and native storage is available, query localStorage
    if ((rawValue === null || rawValue === undefined) && nativeAvailable) {
      try {
        rawValue = window.localStorage.getItem(fullKey);
      } catch {
        rawValue = null;
      }
    }

    if (rawValue === null || rawValue === undefined) {
      return defaultValue;
    }

    return JSON.parse(rawValue) as T;
  } catch (error) {
    // Graceful recovery: corrupted data -> purge corrupted key and return defaultValue
    console.warn(`[storage] Failed to parse item "${fullKey}". Resetting to default.`, error);
    removeStorageItem(storeId, key);
    return defaultValue;
  }
}

/**
 * Serializes and writes a value to storage. Falls back to memory if quota is exceeded.
 */
export function setStorageItem<T>(storeId: string, key: string, value: T): boolean {
  const fullKey = buildStorageKey(storeId, key);
  const nativeAvailable = isNativeStorageAvailable();

  try {
    const serialized = JSON.stringify(value);

    if (nativeAvailable) {
      try {
        window.localStorage.setItem(fullKey, serialized);
        memoryStorageFallback.removeItem(fullKey);
      } catch (quotaError) {
        console.warn(
          `[storage] LocalStorage quota exceeded or restricted. Falling back to memory for "${fullKey}".`,
          quotaError
        );
        try {
          window.localStorage.removeItem(fullKey);
        } catch {
          // Ignore removal errors
        }
        memoryStorageFallback.setItem(fullKey, serialized);
      }
    } else {
      memoryStorageFallback.setItem(fullKey, serialized);
    }

    // Dispatch same-window synchronization event
    if (typeof window !== 'undefined') {
      const detail: StorageChangeEventDetail<T> = {
        storeId,
        key,
        value,
        timestamp: Date.now(),
      };
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail }));
    }

    return true;
  } catch (serializationError) {
    console.error(`[storage] Failed to serialize item "${fullKey}".`, serializationError);
    return false;
  }
}

/**
 * Removes a specific item from storage.
 */
export function removeStorageItem(storeId: string, key: string): void {
  const fullKey = buildStorageKey(storeId, key);
  const nativeAvailable = isNativeStorageAvailable();

  try {
    if (nativeAvailable) {
      window.localStorage.removeItem(fullKey);
    }
    memoryStorageFallback.removeItem(fullKey);

    if (typeof window !== 'undefined') {
      const detail: StorageChangeEventDetail<null> = {
        storeId,
        key,
        value: null,
        timestamp: Date.now(),
      };
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail }));
    }
  } catch (error) {
    console.error(`[storage] Failed to remove item "${fullKey}".`, error);
  }
}

/**
 * Clears all stored keys belonging exclusively to the given storeId.
 * Never deletes keys belonging to other stores or global config.
 */
export function clearStoreStorage(storeId: string): void {
  const normalizedStore = encodeURIComponent(storeId.trim()) || 'global';
  const prefix = `${NAMESPACE_PREFIX}:${normalizedStore}:`;
  const nativeAvailable = isNativeStorageAvailable();

  try {
    if (nativeAvailable) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const currentKey = window.localStorage.key(i);
        if (currentKey && currentKey.startsWith(prefix)) {
          keysToRemove.push(currentKey);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    }

    // Clear from in-memory fallback
    memoryStorageFallback.keys().forEach((k) => {
      if (k.startsWith(prefix)) {
        memoryStorageFallback.removeItem(k);
      }
    });

    // Notify same-window subscribers
    if (typeof window !== 'undefined') {
      const detail: StorageChangeEventDetail<null> = {
        storeId,
        key: '*',
        value: null,
        timestamp: Date.now(),
      };
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail }));
    }
  } catch (error) {
    console.error(`[storage] Failed to clear storage for store "${storeId}".`, error);
  }
}

/**
 * Subscribes to storage changes for a specific store and key.
 * Triggers on both cross-tab native storage events AND same-window custom events.
 *
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToStorage<T>(
  storeId: string,
  key: string,
  callback: (newValue: T | null) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const targetFullKey = buildStorageKey(storeId, key);

  // Cross-tab listener (fires in other browser tabs)
  const handleNativeStorage = (event: StorageEvent) => {
    if (event.key === targetFullKey) {
      try {
        const parsed = event.newValue !== null ? (JSON.parse(event.newValue) as T) : null;
        callback(parsed);
      } catch {
        callback(null);
      }
    }
  };

  // Same-window listener (fires in current tab)
  const handleLocalCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<StorageChangeEventDetail<T>>;
    if (customEvent.detail) {
      const { storeId: eventStore, key: eventKey, value } = customEvent.detail;
      if (eventStore === storeId && (eventKey === key || eventKey === '*')) {
        callback(value);
      }
    }
  };

  window.addEventListener('storage', handleNativeStorage);
  window.addEventListener(STORAGE_EVENT_NAME, handleLocalCustomEvent);

  return () => {
    window.removeEventListener('storage', handleNativeStorage);
    window.removeEventListener(STORAGE_EVENT_NAME, handleLocalCustomEvent);
  };
}

/**
 * Factory creating a scoped storage interface for a given storeId.
 */
export function createStoreStorage(storeId: string) {
  return {
    get: <T>(key: string, defaultValue: T): T => getStorageItem<T>(storeId, key, defaultValue),
    set: <T>(key: string, value: T): boolean => setStorageItem<T>(storeId, key, value),
    remove: (key: string): void => removeStorageItem(storeId, key),
    clear: (): void => clearStoreStorage(storeId),
    subscribe: <T>(key: string, callback: (newValue: T | null) => void): (() => void) =>
      subscribeToStorage<T>(storeId, key, callback),
  };
}

/**
 * Object-oriented wrapper for namespaced store storage.
 * Compatible with test harness and reference engines.
 */
export class NamespacedStorage {
  constructor(public storeId: string, public storage?: Storage) {}

  private qualifyKey(key: string): string {
    return buildStorageKey(this.storeId, key);
  }

  qualify(key: string): string {
    return this.qualifyKey(key);
  }

  get<T>(key: string, fallback: T): T {
    if (this.storage) {
      const qualified = this.qualifyKey(key);
      // Check memory fallback first
      let raw: string | null = memoryStorageFallback.getItem(qualified);
      if (raw === null || raw === undefined) {
        try {
          raw = this.storage.getItem(qualified);
        } catch {
          raw = null;
        }
      }
      if (raw === null || raw === undefined) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    }
    return getStorageItem<T>(this.storeId, key, fallback);
  }

  set<T>(key: string, value: T): void {
    if (this.storage) {
      const qualified = this.qualifyKey(key);
      const serialized = JSON.stringify(value);
      try {
        this.storage.setItem(qualified, serialized);
        memoryStorageFallback.removeItem(qualified);
      } catch (quotaError) {
        console.warn(
          `[storage] Storage quota exceeded for "${qualified}". Falling back to memory.`,
          quotaError
        );
        try {
          this.storage.removeItem(qualified);
        } catch {
          // Ignore removal errors
        }
        memoryStorageFallback.setItem(qualified, serialized);
      }
      return;
    }
    setStorageItem<T>(this.storeId, key, value);
  }

  remove(key: string): void {
    if (this.storage) {
      const qualified = this.qualifyKey(key);
      try {
        this.storage.removeItem(qualified);
      } catch {}
      memoryStorageFallback.removeItem(qualified);
      return;
    }
    removeStorageItem(this.storeId, key);
  }

  clearStore(): void {
    if (this.storage) {
      const normalizedStore = encodeURIComponent(this.storeId.trim()) || 'global';
      const prefix = `${NAMESPACE_PREFIX}:${normalizedStore}:`;
      const keysToRemove: string[] = [];
      try {
        for (let i = 0; i < this.storage.length; i++) {
          const k = this.storage.key(i);
          if (k && k.startsWith(prefix)) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          this.storage.removeItem(k);
        }
      } catch (err) {
        console.warn('[storage] Error during wrapped storage clearStore', err);
      }
      memoryStorageFallback.keys().forEach((k) => {
        if (k.startsWith(prefix)) {
          memoryStorageFallback.removeItem(k);
        }
      });
      return;
    }
    clearStoreStorage(this.storeId);
  }
}
