/**
 * Simulated Browser Environment & Storage Primitives for E2E Testing
 * Supports multi-tab storage synchronization and responsive viewport mocking.
 */

export interface StorageEventDetail {
  key: string | null;
  oldValue: string | null;
  newValue: string | null;
  url: string;
  storageArea: MockStorage;
}

export type StorageListener = (event: StorageEventDetail) => void;

export class MockStorage implements Storage {
  private data: Map<string, string> = new Map();
  private listeners: Set<StorageListener> = new Set();
  public maxQuotaBytes: number = 5 * 1024 * 1024; // 5MB simulated quota
  public quotaExceeded: boolean = false;

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    const oldEntries = Array.from(this.data.entries());
    this.data.clear();
    for (const [key, val] of oldEntries) {
      this.dispatch({
        key,
        oldValue: val,
        newValue: null,
        url: 'http://localhost/',
        storageArea: this
      });
    }
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys());
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  removeItem(key: string): void {
    if (this.data.has(key)) {
      const oldValue = this.data.get(key)!;
      this.data.delete(key);
      this.dispatch({
        key,
        oldValue,
        newValue: null,
        url: 'http://localhost/',
        storageArea: this
      });
    }
  }

  setItem(key: string, value: string): void {
    if (this.quotaExceeded) {
      const err = new Error('QuotaExceededError: The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      throw err;
    }

    const strVal = String(value);
    const oldValue = this.data.has(key) ? this.data.get(key)! : null;

    // Check size limit simulation
    let currentBytes = 0;
    for (const [k, v] of this.data.entries()) {
      currentBytes += (k.length + v.length) * 2;
    }
    const newBytes = (key.length + strVal.length) * 2;
    if (currentBytes + newBytes > this.maxQuotaBytes) {
      const err = new Error('QuotaExceededError: The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      throw err;
    }

    this.data.set(key, strVal);
    this.dispatch({
      key,
      oldValue,
      newValue: strVal,
      url: 'http://localhost/',
      storageArea: this
    });
  }

  addListener(listener: StorageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private dispatch(evt: StorageEventDetail) {
    for (const listener of this.listeners) {
      try {
        listener(evt);
      } catch (err) {
        // ignore listener errors
      }
    }
  }

  dump(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of this.data.entries()) {
      out[k] = v;
    }
    return out;
  }
}

/**
 * Namespaced LocalStorage wrapper complying with PROJECT.md
 * Key format: `shopify_portfolio:${storeId}:${key}`
 */
export class NamespacedStorage {
  constructor(public storeId: string, public storage: MockStorage) {}

  private qualifyKey(key: string): string {
    return `shopify_portfolio:${this.storeId}:${key}`;
  }

  get<T>(key: string, fallback: T): T {
    const raw = this.storage.getItem(this.qualifyKey(key));
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    this.storage.setItem(this.qualifyKey(key), JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage.removeItem(this.qualifyKey(key));
  }

  clearStore(): void {
    const prefix = `shopify_portfolio:${this.storeId}:`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i);
      if (k && k.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      this.storage.removeItem(k);
    }
  }
}

export interface ViewportConfig {
  width: number;
  height: number;
}

export class MockWindow {
  public innerWidth: number;
  public innerHeight: number;
  public localStorage: MockStorage;
  public sessionStorage: MockStorage;
  public location: {
    pathname: string;
    search: string;
    hash: string;
    href: string;
    assign: (url: string) => void;
  };

  constructor(viewport: ViewportConfig = { width: 1440, height: 900 }, storage?: MockStorage) {
    this.innerWidth = viewport.width;
    this.innerHeight = viewport.height;
    this.localStorage = storage || new MockStorage();
    this.sessionStorage = new MockStorage();
    this.location = {
      pathname: '/',
      search: '',
      hash: '',
      href: 'http://localhost/',
      assign: (url: string) => {
        this.location.href = url;
        try {
          const parsed = new URL(url, 'http://localhost');
          this.location.pathname = parsed.pathname;
          this.location.search = parsed.search;
          this.location.hash = parsed.hash;
        } catch {
          this.location.pathname = url;
        }
      }
    };
  }

  setViewport(width: number, height: number = 800) {
    this.innerWidth = width;
    this.innerHeight = height;
  }

  matchMedia(query: string): { matches: boolean; media: string } {
    let matches = false;
    const maxMatch = query.match(/\(max-width:\s*(\d+)px\)/);
    const minMatch = query.match(/\(min-width:\s*(\d+)px\)/);

    if (maxMatch) {
      matches = this.innerWidth <= parseInt(maxMatch[1], 10);
    } else if (minMatch) {
      matches = this.innerWidth >= parseInt(minMatch[1], 10);
    }
    return { matches, media: query };
  }
}
