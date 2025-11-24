/**
 * Cache Factory (v3.4.0)
 * Phase 4 Task 9.6: Factory for creating cache instances
 */

import type { Cache, CacheConfig } from './types.js';
import { LRUCache } from './lru.js';
import { LFUCache } from './lfu.js';
import { FIFOCache } from './fifo.js';

/**
 * Create cache instance based on strategy
 */
export function createCache<T>(config: Partial<CacheConfig> = {}): Cache<T> {
  const strategy = config.strategy || 'lru';

  switch (strategy) {
    case 'lru':
      return new LRUCache<T>(config);

    case 'lfu':
      return new LFUCache<T>(config);

    case 'fifo':
      return new FIFOCache<T>(config);

    default:
      throw new Error(`Unknown cache strategy: ${strategy}`);
  }
}

/**
 * Cache factory class with static methods
 */
export class CacheFactory {
  /**
   * Create cache instance (static method)
   */
  static create<T>(strategy: string, config?: Partial<CacheConfig>): Cache<T> {
    return createCache<T>({ ...config, strategy: strategy as 'lru' | 'lfu' | 'fifo' });
  }
}

/**
 * Cache manager for multiple named caches
 */
export class CacheManager {
  private caches: Map<string, Cache<any>>;

  constructor() {
    this.caches = new Map();
  }

  /**
   * Create or get cache
   */
  getCache<T>(name: string, config?: Partial<CacheConfig>): Cache<T> {
    if (!this.caches.has(name)) {
      this.caches.set(name, createCache<T>(config));
    }
    return this.caches.get(name)!;
  }

  /**
   * Delete cache
   */
  deleteCache(name: string): boolean {
    return this.caches.delete(name);
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Get all cache names
   */
  getCacheNames(): string[] {
    return Array.from(this.caches.keys());
  }

  /**
   * Get combined statistics
   */
  getCombinedStats() {
    const stats = {
      totalCaches: this.caches.size,
      totalSize: 0,
      totalHits: 0,
      totalMisses: 0,
      totalEvictions: 0,
      totalMemoryUsage: 0,
    };

    for (const cache of this.caches.values()) {
      const cacheStats = cache.getStats();
      stats.totalSize += cacheStats.size;
      stats.totalHits += cacheStats.hits;
      stats.totalMisses += cacheStats.misses;
      stats.totalEvictions += cacheStats.evictions;
      stats.totalMemoryUsage += cacheStats.memoryUsage;
    }

    return stats;
  }
}
