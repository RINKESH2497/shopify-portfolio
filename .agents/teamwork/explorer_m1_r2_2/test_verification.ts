import { formatCurrency } from '../../../src/utils/formatters';
import { getStorageItem, setStorageItem, removeStorageItem, clearStoreStorage, memoryStorageFallback, NamespacedStorage } from '../../../src/utils/storage';

console.log('--- TESTING formatCurrency ---');
console.log('formatCurrency(-0, "USD"):', formatCurrency(-0, 'USD'));
console.log('formatCurrency(0, "USD"):', formatCurrency(0, 'USD'));
console.log('formatCurrency(-0, "JPY"):', formatCurrency(-0, 'JPY'));
console.log('formatCurrency(-15.5, "USD"):', formatCurrency(-15.5, 'USD'));

console.log('\n--- TESTING storage quota fallback ---');
// Create a MockStorage that simulates quota exceeded
class MockStorageWithQuota implements Storage {
  private map = new Map<string, string>();
  public quotaExceeded = false;

  get length(): number { return this.map.size; }
  clear(): void { this.map.clear(); }
  getItem(key: string): string | null { return this.map.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.map.keys())[index] ?? null; }
  removeItem(key: string): void { this.map.delete(key); }
  setItem(key: string, value: string): void {
    if (this.quotaExceeded) {
      const err = new Error('QuotaExceededError: The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.map.set(key, String(value));
  }
}

// Test 1: NamespacedStorage with quota exceeded
const mockStorage = new MockStorageWithQuota();
mockStorage.quotaExceeded = true;
const ns = new NamespacedStorage('store1', mockStorage);

console.log('Writing with quotaExceeded = true via NamespacedStorage.set...');
try {
  ns.set('cart', { count: 3 });
  console.log('ns.set succeeded without uncaught exception');
} catch (e: any) {
  console.log('ns.set THREW:', e.message);
}

const readBack = ns.get('cart', null);
console.log('Read back from ns.get("cart"):', readBack);

// Test 2: When key had an old value in storage, then quota error happens during update
mockStorage.quotaExceeded = false;
ns.set('items', ['initial_item']);
console.log('\nInitial write success. In storage:', mockStorage.getItem('shopify_portfolio:store1:items'));
console.log('In memory fallback before quota:', memoryStorageFallback.getItem('shopify_portfolio:store1:items'));

console.log('Setting quotaExceeded = true, then updating "items"...');
mockStorage.quotaExceeded = true;
ns.set('items', ['updated_under_quota']);
console.log('In storage after quota set:', mockStorage.getItem('shopify_portfolio:store1:items'));
console.log('In memory fallback after quota set:', memoryStorageFallback.getItem('shopify_portfolio:store1:items'));

const readAfterQuota = ns.get('items', null);
console.log('Read back after quota set from ns.get("items"):', readAfterQuota);

// Test 3: getStorageItem with window.localStorage simulation
console.log('\n--- TESTING getStorageItem with window.localStorage ---');
const globalMock = new MockStorageWithQuota();
(global as any).window = {
  localStorage: globalMock,
  dispatchEvent: () => {},
};

console.log('Writing via setStorageItem with quotaExceeded = false...');
setStorageItem('coffee', 'profile', { name: 'Alice' });
console.log('Read back:', getStorageItem('coffee', 'profile', null));

console.log('Enabling quotaExceeded on window.localStorage...');
globalMock.quotaExceeded = true;
setStorageItem('coffee', 'profile', { name: 'Bob (under quota)' });
console.log('In window.localStorage:', globalMock.getItem('shopify_portfolio:coffee:profile'));
console.log('In memoryStorageFallback:', memoryStorageFallback.getItem('shopify_portfolio:coffee:profile'));
const readProfile = getStorageItem('coffee', 'profile', null);
console.log('Read back profile:', readProfile);

// Test 4: removeStorageItem and clearStoreStorage
console.log('\n--- TESTING remove and clear ---');
removeStorageItem('coffee', 'profile');
console.log('After removeStorageItem - memory fallback:', memoryStorageFallback.getItem('shopify_portfolio:coffee:profile'));
console.log('After removeStorageItem - read back:', getStorageItem('coffee', 'profile', 'DEFAULT'));
