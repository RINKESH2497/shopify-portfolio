// Demonstration of the proposed fix for getStorageItem and NamespacedStorage
import { buildStorageKey, NAMESPACE_PREFIX } from '../../../src/utils/storage';

class MemoryStorage {
  private memoryMap = new Map<string, string>();
  get length(): number { return this.memoryMap.size; }
  getItem(key: string): string | null { return this.memoryMap.get(key) ?? null; }
  setItem(key: string, value: string): void { this.memoryMap.set(key, String(value)); }
  removeItem(key: string): void { this.memoryMap.delete(key); }
  clear(): void { this.memoryMap.clear(); }
  keys(): string[] { return Array.from(this.memoryMap.keys()); }
}

const memoryStorageFallback = new MemoryStorage();

class MockSelectiveStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number { return this.map.size; }
  clear(): void { this.map.clear(); }
  getItem(key: string): string | null { return this.map.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.map.keys())[index] ?? null; }
  removeItem(key: string): void { this.map.delete(key); }
  setItem(key: string, value: string): void {
    if (key.includes('__probe_')) {
      this.map.set(key, value);
      return;
    }
    if (value.includes('item2')) {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.map.set(key, value);
  }
}

const nativeStorage = new MockSelectiveStorage();

function fixedSetStorageItem<T>(storeId: string, key: string, value: T): boolean {
  const fullKey = buildStorageKey(storeId, key);
  const serialized = JSON.stringify(value);
  try {
    nativeStorage.setItem(fullKey, serialized);
    memoryStorageFallback.removeItem(fullKey);
  } catch (quotaError) {
    try {
      nativeStorage.removeItem(fullKey);
    } catch {}
    memoryStorageFallback.setItem(fullKey, serialized);
  }
  return true;
}

function fixedGetStorageItem<T>(storeId: string, key: string, defaultValue: T): T {
  const fullKey = buildStorageKey(storeId, key);
  try {
    // 1. Check memoryStorageFallback first (if written under quota)
    let rawValue: string | null = memoryStorageFallback.getItem(fullKey);
    // 2. If not in memory fallback, query native storage
    if (rawValue === null || rawValue === undefined) {
      rawValue = nativeStorage.getItem(fullKey);
    }
    if (rawValue === null || rawValue === undefined) {
      return defaultValue;
    }
    return JSON.parse(rawValue) as T;
  } catch {
    return defaultValue;
  }
}

// Verification steps:
console.log('--- Verifying Proposed Fix ---');
// Step 1: initial write
fixedSetStorageItem('coffee', 'cart', [{ id: 'item1', qty: 1 }]);
console.log('1. Read after initial write:', fixedGetStorageItem('coffee', 'cart', []));

// Step 2: update with quota exceeded
fixedSetStorageItem('coffee', 'cart', [{ id: 'item1', qty: 1 }, { id: 'item2', qty: 1 }]);
console.log('2. In native storage after quota write:', nativeStorage.getItem('shopify_portfolio:coffee:cart'));
console.log('2. In memory fallback after quota write:', memoryStorageFallback.getItem('shopify_portfolio:coffee:cart'));
const readAfterQuota = fixedGetStorageItem('coffee', 'cart', []);
console.log('2. Read back with proposed fix:', readAfterQuota);

// Step 3: successful write later removes memory fallback and updates native
fixedSetStorageItem('coffee', 'cart', [{ id: 'item3', qty: 5 }]);
console.log('3. In native storage after success write:', nativeStorage.getItem('shopify_portfolio:coffee:cart'));
console.log('3. In memory fallback after success write:', memoryStorageFallback.getItem('shopify_portfolio:coffee:cart'));
console.log('3. Read back after success write:', fixedGetStorageItem('coffee', 'cart', []));
