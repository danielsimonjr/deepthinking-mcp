/**
 * Cache Module Exports (v3.4.0)
 * Phase 4 Task 9.6: Caching layer with LRU/LFU/FIFO strategies
 */

export { LRUCache } from './lru.js';
export { LFUCache } from './lfu.js';
export { FIFOCache } from './fifo.js';
export { createCache, CacheManager } from './factory.js';

export type {
  Cache,
  CacheConfig,
  CacheEntry,
  CacheStats,
  CacheStrategy,
} from './types.js';
