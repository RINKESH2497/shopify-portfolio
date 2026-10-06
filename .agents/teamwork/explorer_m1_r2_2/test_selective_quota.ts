import { getStorageItem, setStorageItem, memoryStorageFallback } from '../../../src/utils/storage';

class MockStorageSelectiveQuota implements Storage {
  private map = new Map<string, string>();

  get length(): number { return this.map.size; }
  clear(): void { this.map.clear(); }
  getItem(key: string): string | null { return this.map.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.map.keys())[index] ?? null; }
  removeItem(key: string): void { this.map.delete(key); }
  setItem(key: string, value: string): void {
    // Probe key succeeds (small)
    if (key.includes('__probe_')) {
      this.map.set(key, value);
      return;
    }
    // Cart updates fail with quota exceeded
    if (key.includes('cart') && value.includes('item2')) {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.map.set(key, value);
  }
}

const selectiveStorage = new MockStorageSelectiveQuota();
(global as any).window = {
  localStorage: selectiveStorage,
  dispatchEvent: () => {},
};

// 1. Initial cart write succeeds
setStorageItem('coffee', 'cart', [{ id: 'item1', qty: 1 }]);
console.log('1. Initial write in localStorage:', selectiveStorage.getItem('shopify_portfolio:coffee:cart'));
console.log('1. Read back:', getStorageItem('coffee', 'cart', []));

// 2. Second cart update throws QuotaExceededError because it contains item2
console.log('\n2. Updating cart with item2 (will throw quota on setItem, but probe still succeeds)...');
setStorageItem('coffee', 'cart', [{ id: 'item1', qty: 1 }, { id: 'item2', qty: 1 }]);

console.log('In selectiveStorage:', selectiveStorage.getItem('shopify_portfolio:coffee:cart'));
console.log('In memoryFallback:', memoryStorageFallback.getItem('shopify_portfolio:coffee:cart'));

const readCart = getStorageItem('coffee', 'cart', []);
console.log('Read back from getStorageItem:', readCart);
