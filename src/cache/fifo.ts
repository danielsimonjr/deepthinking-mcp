/**
 * FIFO Cache (v3.4.0)
 * Phase 4 Task 9.6: First In First Out cache implementation
 */

import type { Cache, CacheConfig, CacheEntry, CacheStats } from './types.js';

/**
 * FIFO (First In First Out) cache
 */
export class FIFOCache<T> implements Cache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private insertionOrder: string[];
  private config: Required<CacheConfig>;
  private stats: CacheStats;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.insertionOrder = [];
    this.config = {
      maxSize: config.maxSize || 100,
      strategy: 'fifo',
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

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return undefined;
    }

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.delete(key);
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return undefined;
    }

    // Update access (but don't affect eviction order)
    entry.lastAccessedAt = new Date();
    entry.accessCount++;

    if (this.config.enableStats) {
      this.stats.hits++;
      this.updateHitRate();
    }

    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    const existing = this.cache.get(key);
    if (existing) {
      // Update existing without changing order
      this.cache.delete(key);
      const idx = this.insertionOrder.indexOf(key);
      if (idx >= 0) {
        this.insertionOrder.splice(idx, 1);
      }
    } else if (this.cache.size >= this.config.maxSize) {
      this.evictFIFO();
    }

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
    this.insertionOrder.push(key);

    if (this.config.enableStats) {
      this.stats.sets++;
      this.stats.size = this.cache.size;
      this.stats.memoryUsage += entry.size || 0;
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    const idx = this.insertionOrder.indexOf(key);
    if (idx >= 0) {
      this.insertionOrder.splice(idx, 1);
    }

    if (this.config.enableStats) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
      this.stats.memoryUsage -= entry.size || 0;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
    this.insertionOrder = [];
    if (this.config.enableStats) {
      this.stats.size = 0;
      this.stats.memoryUsage = 0;
    }
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values()).map(e => e.value);
  }

  entries(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([k, v]) => [k, v.value]);
  }

  /**
   * Evict first in (oldest) entry
   */
  private evictFIFO(): void {
    const firstKey = this.insertionOrder[0];
    if (firstKey) {
      const entry = this.cache.get(firstKey);
      this.cache.delete(firstKey);
      this.insertionOrder.shift();

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

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 0;
    }
  }

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
