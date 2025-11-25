/**
 * LRU Cache (v3.4.0)
 * Phase 4 Task 9.6: Least Recently Used cache implementation
 */

import type { Cache, CacheConfig, CacheEntry, CacheStats } from './types.js';

/**
 * LRU (Least Recently Used) cache
 */
export class LRUCache<T> implements Cache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: Required<CacheConfig>;
  private stats: CacheStats;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      /**
       * Default max cache size: 100 entries
       * Reasoning:
       * - Validation cache typically stores session/thought validation results
       * - Average entry size: ~1-2KB (validation result + metadata)
       * - 100 entries = ~100-200KB memory usage
       * - Sufficient for most use cases (covers recent validations)
       * - Prevents unbounded memory growth in long-running processes
       * - Can be overridden via config parameter for high-traffic scenarios
       */
      maxSize: config.maxSize || 100,
      strategy: 'lru',
      ttl: config.ttl || 0,
      enableStats: config.enableStats !== false,
      onEvict: config.onEvict || (() => {}),
    };

    this.stats = {
      size: 0,
      maxSize: this.config.maxSize,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
      sets: 0,
      deletes: 0,
      memoryUsage: 0,
      avgAccessTime: 0,
    };
  }

  /**
   * Get value by key
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return undefined;
    }

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.delete(key);
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return undefined;
    }

    // Update access time (LRU behavior)
    entry.lastAccessedAt = new Date();
    entry.accessCount++;

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    if (this.config.enableStats) {
      this.stats.hits++;
      this.updateHitRate();
    }

    return entry.value;
  }

  /**
   * Set value for key
   */
  set(key: string, value: T, ttl?: number): void {
    // Check if key exists
    const existing = this.cache.get(key);
    if (existing) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.config.maxSize) {
      // Evict least recently used (first entry)
      this.evictLRU();
    }

    // Create entry
    const now = new Date();
    const effectiveTtl = ttl ?? this.config.ttl;
    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 0,
      expiresAt: effectiveTtl ? new Date(now.getTime() + effectiveTtl) : undefined,
      size: this.estimateSize(value),
    };

    this.cache.set(key, entry);

    if (this.config.enableStats) {
      this.stats.sets++;
      this.stats.size = this.cache.size;
      this.stats.memoryUsage += entry.size || 0;
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete entry by key
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);

    if (this.config.enableStats) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
      this.stats.memoryUsage -= entry.size || 0;
    }

    return true;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();

    if (this.config.enableStats) {
      this.stats.size = 0;
      this.stats.memoryUsage = 0;
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(e => e.value);
  }

  /**
   * Get all entries
   */
  entries(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([k, v]) => [k, v.value]);
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    // First entry is least recently used
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      const entry = this.cache.get(firstKey);
      this.cache.delete(firstKey);

      if (this.config.onEvict && entry) {
        this.config.onEvict(firstKey, entry.value);
      }

      if (this.config.enableStats) {
        this.stats.evictions++;
        this.stats.size = this.cache.size;
        if (entry) {
          this.stats.memoryUsage -= entry.size || 0;
        }
      }
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Estimate entry size
   */
  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 0;
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    let cleaned = 0;
    const now = new Date();

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}
