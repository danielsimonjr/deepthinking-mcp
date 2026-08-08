/**
 * Cache Types (v3.4.0)
 * Phase 4 Task 9.6: Caching layer types
 */

/**
 * Cache strategy
 */
export type CacheStrategy = "lru" | "lfu" | "fifo";

/**
 * Cache configuration
 */
export interface CacheConfig {
  /**
   * Maximum number of entries
   */
  maxSize: number;

  /**
   * Cache strategy
   */
  strategy: CacheStrategy;

  /**
   * Time-to-live in milliseconds (0 = no expiration)
   */
  ttl?: number;

  /**
   * Enable statistics tracking
   */
  enableStats?: boolean;

  /**
   * Eviction callback
   */
  onEvict?: (key: string, value: any) => void;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  /**
   * Entry key
   */
  key: string;

  /**
   * Entry value
   */
  value: T;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last access timestamp
   */
  lastAccessedAt: Date;

  /**
   * Access count (for LFU)
   */
  accessCount: number;

  /**
   * Expiration time
   */
  expiresAt?: Date;

  /**
   * Entry size (bytes)
   */
  size?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /**
   * Total entries
   */
  size: number;

  /**
   * Maximum size
   */
  maxSize: number;

  /**
   * Total hits
   */
  hits: number;

  /**
   * Total misses
   */
  misses: number;

  /**
   * Hit rate as a RATIO in [0, 1] — `hits / (hits + misses)`, not a percentage.
   *
   * This was documented as a percentage while the implementation always stored
   * a ratio, so a consumer trusting the doc rendered a 0.85 hit rate as
   * "0.85%" — wrong by two orders of magnitude and entirely plausible-looking.
   * Callers depend on the ratio, so the documentation was the thing that was
   * wrong. Multiply by 100 at the display edge if you want a percentage.
   *
   * `0` before any lookup, never `NaN` (0/0).
   */
  hitRate: number;

  /**
   * Total evictions
   */
  evictions: number;

  /**
   * Total sets
   */
  sets: number;

  /**
   * Total deletes
   */
  deletes: number;

  /**
   * Memory usage (bytes)
   */
  memoryUsage: number;

  /**
   * Average access time (ms)
   */
  avgAccessTime: number;
}

/**
 * Cache interface
 */
export interface Cache<T> {
  /**
   * Get value by key
   */
  get(key: string): T | undefined;

  /**
   * Set value for key
   */
  set(key: string, value: T, ttl?: number): void;

  /**
   * Check if key exists
   */
  has(key: string): boolean;

  /**
   * Delete entry by key
   */
  delete(key: string): boolean;

  /**
   * Clear all entries
   */
  clear(): void;

  /**
   * Get cache size
   */
  size(): number;

  /**
   * Get cache statistics
   */
  getStats(): CacheStats;

  /**
   * Get all keys
   */
  keys(): string[];

  /**
   * Get all values
   */
  values(): T[];

  /**
   * Get all entries
   */
  entries(): Array<[string, T]>;
}
