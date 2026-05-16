export interface CacheOptions {
  maxAge?: number;
  maxSize?: number;
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
}

class CacheManager<T = any> {
  private cache: Map<string, CacheItem<T>>;
  private maxAge: number;
  private maxSize: number;
  private storage: 'localStorage' | 'sessionStorage' | 'memory';
  private storageKey: string;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxAge = options.maxAge || 1000 * 60 * 60;
    this.maxSize = options.maxSize || 100;
    this.storage = options.storage || 'memory';
    this.storageKey = `cache_manager_${this.storage}`;
    
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (this.storage === 'memory') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
        this.prune();
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
      this.cache = new Map();
    }
  }

  private saveToStorage(): void {
    if (this.storage === 'memory') {
      return;
    }

    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() - item.timestamp > this.maxAge) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      this.prune();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    this.saveToStorage();
  }

  has(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  prune(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > this.maxAge) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (this.cache.size > this.maxSize) {
      const items = Array.from(this.cache.entries());
      items.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const itemsToRemove = items.slice(0, this.cache.size - this.maxSize);
      itemsToRemove.forEach(([key]) => this.cache.delete(key));
    }

    this.saveToStorage();
  }

  getStats(): {
    size: number;
    maxSize: number;
    maxAge: number;
    oldestItem: number | null;
    newestItem: number | null;
  } {
    const timestamps = Array.from(this.cache.values()).map(item => item.timestamp);
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
      oldestItem: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestItem: timestamps.length > 0 ? Math.max(...timestamps) : null
    };
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values()).map(item => item.value);
  }

  entries(): [string, T][] {
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
  }

  getRemainingTTL(key: string): number {
    const item = this.cache.get(key);
    if (!item) {
      return 0;
    }

    const elapsed = Date.now() - item.timestamp;
    const remaining = this.maxAge - elapsed;
    return Math.max(0, remaining);
  }

  refresh(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    item.timestamp = Date.now();
    this.saveToStorage();
    return true;
  }

  async getOrSet(
    key: string,
    factory: () => T | Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    
    if (options) {
      const tempCache = new CacheManager<T>({ ...options });
      tempCache.set(key, value);
      this.set(key, value);
    } else {
      this.set(key, value);
    }

    return value;
  }

  setMaxSize(size: number): void {
    this.maxSize = size;
    if (this.cache.size > this.maxSize) {
      this.prune();
    }
  }

  setMaxAge(age: number): void {
    this.maxAge = age;
    this.prune();
  }
}

const defaultCache = new CacheManager();
const questionCache = new CacheManager({ maxAge: 1000 * 60 * 30, maxSize: 200 });
const userDataCache = new CacheManager({ maxAge: 1000 * 60 * 60, maxSize: 50 });
const apiResponseCache = new CacheManager({ maxAge: 1000 * 60 * 5, maxSize: 100 });

export const createCacheManager = <T = any>(options?: CacheOptions) => {
  return new CacheManager<T>(options);
};

export {
  defaultCache,
  questionCache,
  userDataCache,
  apiResponseCache,
  CacheManager
};

export default CacheManager;
