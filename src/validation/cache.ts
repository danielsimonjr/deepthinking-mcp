/**
 * Validation result caching for performance optimization
 *
 * Caches validation results to avoid redundant validation of unchanging content.
 * Uses content-based hashing for cache keys to ensure correctness.
 */

import { getConfig } from '../config/index.js';
import { ValidationResult } from '../types/session.js';
import { createHash } from 'crypto';

/**
 * Validation result entry
 */
export interface ValidationCacheEntry {
  /** Cached validation result */
  result: ValidationResult;

  /** Timestamp of validation */
  timestamp: number;

  /** Number of times this cache entry was hit */
  hitCount: number;
}

/**
 * LRU Cache for validation results
 */
export class ValidationCache {
  private cache: Map<string, ValidationCacheEntry>;
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxSize?: number) {
    const config = getConfig();
    this.maxSize = maxSize || config.validationCacheMaxSize;
    this.cache = new Map();
  }

  /**
   * Generate a cache key from thought content
   *
   * Uses SHA-256 hash of JSON-serialized content for reliable cache keys
   *
   * @param content - Content to hash
   * @returns Cache key
   */
  private generateKey(content: unknown): string {
    const json = JSON.stringify(content);
    return createHash('sha256').update(json).digest('hex');
  }

  /**
   * Get validation result from cache
   *
   * @param content - Content to look up
   * @returns Cached result or undefined if not found
   */
  get(content: unknown): ValidationCacheEntry | undefined {
    const key = this.generateKey(content);
    const entry = this.cache.get(key);

    if (entry) {
      this.hits++;
      entry.hitCount++;

      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, entry);

      return entry;
    }

    this.misses++;
    return undefined;
  }

  /**
   * Store validation result in cache
   *
   * @param content - Content that was validated
   * @param result - Validation result to cache
   */
  set(content: unknown, result: ValidationResult): void {
    const key = this.generateKey(content);

    // If cache is full, remove least recently used (first entry)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    const entry: ValidationCacheEntry = {
      result,
      timestamp: Date.now(),
      hitCount: 0,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if content is in cache
   *
   * @param content - Content to check
   * @returns true if cached
   */
  has(content: unknown): boolean {
    const key = this.generateKey(content);
    return this.cache.has(key);
  }

  /**
   * Clear all cached validation results
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * Resize the cache
   *
   * @param newSize - New maximum cache size
   */
  resize(newSize: number): void {
    this.maxSize = newSize;

    // If cache is now too large, trim it
    if (this.cache.size > newSize) {
      const keysToDelete = this.cache.size - newSize;
      const keys = Array.from(this.cache.keys());

      for (let i = 0; i < keysToDelete; i++) {
        this.cache.delete(keys[i]);
      }
    }
  }

  /**
   * Get entries sorted by hit count (most used first)
   */
  getTopEntries(limit: number = 10): Array<{ key: string; entry: ValidationCacheEntry }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => b.entry.hitCount - a.entry.hitCount);

    return entries.slice(0, limit);
  }

  /**
   * Remove entries older than a certain age
   *
   * @param maxAgeMs - Maximum age in milliseconds
   * @returns Number of entries removed
   */
  evictOld(maxAgeMs: number): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAgeMs) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Global validation cache instance
 */
export const validationCache = new ValidationCache();
