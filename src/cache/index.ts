/**
 * Cache Module Exports (v9.0.0)
 * Phase 15A Sprint 2: Simplified to LRU only (removed unused LFU/FIFO/factory)
 */

export { LRUCache } from './lru.js';

export type {
  Cache,
  CacheConfig,
  CacheEntry,
  CacheStats,
  CacheStrategy,
} from './types.js';
