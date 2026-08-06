/**
 * LRU Cache Tests
 * Tests for src/cache/lru.ts
 *
 * The standalone `src/cache/` module is a different implementation from the
 * cache built into `src/validation/cache.ts`. It backs `SessionManager` and
 * `SessionMetricsCalculator`, and had no dedicated test file before this one.
 *
 * These tests pin what LRUCache actually does, including the places where it
 * deviates from a textbook LRU (noted inline), not what a generic LRU would do.
 */

import { describe, it, expect, vi } from 'vitest';
import { LRUCache } from '../../../src/cache/lru.js';

/** JSON.stringify(value).length * 2 -- the estimator LRUCache uses internally. */
const estimatedSize = (value: unknown): number =>
  JSON.stringify(value).length * 2;

describe('LRUCache', () => {
  describe('construction and defaults', () => {
    it('defaults to a maximum of 100 entries', () => {
      const cache = new LRUCache<number>();

      for (let i = 0; i < 150; i++) {
        cache.set(`k${i}`, i);
      }

      expect(cache.size()).toBe(100);
      expect(cache.getStats().maxSize).toBe(100);
      expect(cache.getStats().evictions).toBe(50);
    });

    it('treats maxSize 0 as "unset" and falls back to 100', () => {
      // `config.maxSize || 100` cannot distinguish 0 from absent. Pinned
      // deliberately: a 0-capacity cache is not reachable through this API.
      const cache = new LRUCache<number>({ maxSize: 0 });

      cache.set('a', 1);

      expect(cache.getStats().maxSize).toBe(100);
      expect(cache.get('a')).toBe(1);
    });

    it('starts with zeroed statistics', () => {
      const stats = new LRUCache<number>({ maxSize: 5 }).getStats();

      expect(stats).toEqual({
        size: 0,
        maxSize: 5,
        hits: 0,
        misses: 0,
        hitRate: 0,
        evictions: 0,
        sets: 0,
        deletes: 0,
        memoryUsage: 0,
        avgAccessTime: 0,
      });
    });

    it('ignores a requested strategy -- this class is always LRU', () => {
      // CacheConfig carries a `strategy` field, but the constructor hardcodes
      // "lru". A caller asking for LFU silently gets LRU eviction.
      const cache = new LRUCache<string>({ maxSize: 2, strategy: 'lfu' });

      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.get('a'); // most-frequently used under LFU, and now most-recent
      cache.get('a');
      cache.get('b'); // makes 'b' most-recent; LFU would still favour 'a'
      cache.set('c', 'C');

      // LRU evicted 'a' (least recently used) despite its higher access count.
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('c')).toBe(true);
    });
  });

  describe('basic get/set/has/delete', () => {
    it('stores and retrieves a value', () => {
      const cache = new LRUCache<{ n: number }>({ maxSize: 3 });
      const value = { n: 42 };

      cache.set('a', value);

      expect(cache.get('a')).toBe(value);
      expect(cache.has('a')).toBe(true);
      expect(cache.size()).toBe(1);
    });

    it('returns undefined for a key that was never set', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });

      expect(cache.get('missing')).toBeUndefined();
      expect(cache.has('missing')).toBe(false);
    });

    it('overwrites an existing key without changing the entry count', () => {
      const cache = new LRUCache<string>({ maxSize: 3 });

      cache.set('a', 'first');
      cache.set('a', 'second');

      expect(cache.get('a')).toBe('second');
      expect(cache.size()).toBe(1);
      expect(cache.getStats().sets).toBe(2);
      expect(cache.getStats().evictions).toBe(0);
    });

    it('delete removes the entry and reports whether it existed', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);

      expect(cache.delete('a')).toBe(true);
      expect(cache.delete('a')).toBe(false);
      expect(cache.size()).toBe(0);
      expect(cache.getStats().deletes).toBe(1);
    });

    it('clear empties the cache and zeroes size and memory usage', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.get('a');

      cache.clear();
      const stats = cache.getStats();

      expect(cache.size()).toBe(0);
      expect(cache.keys()).toEqual([]);
      expect(stats.size).toBe(0);
      expect(stats.memoryUsage).toBe(0);
      // clear() resets contents, not the lifetime counters.
      expect(stats.sets).toBe(2);
      expect(stats.hits).toBe(1);
    });

    it('exposes keys, values and entries in recency order (oldest first)', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.get('a'); // promotes 'a' to most-recent

      expect(cache.keys()).toEqual(['b', 'c', 'a']);
      expect(cache.values()).toEqual([2, 3, 1]);
      expect(cache.entries()).toEqual([
        ['b', 2],
        ['c', 3],
        ['a', 1],
      ]);
    });
  });

  describe('eviction policy at capacity', () => {
    it('evicts the least recently used entry when full', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.set('d', 4);

      expect(cache.has('a')).toBe(false);
      expect(cache.keys()).toEqual(['b', 'c', 'd']);
      expect(cache.size()).toBe(3);
      expect(cache.getStats().evictions).toBe(1);
    });

    it('a get() promotes an entry and saves it from the next eviction', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.get('a'); // 'b' is now least recently used
      cache.set('d', 4);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it('an overwrite promotes the key -- it is not evicted next', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.set('a', 10); // re-inserted at the most-recent end
      cache.set('d', 4);

      expect(cache.get('a')).toBe(10);
      expect(cache.has('b')).toBe(false);
    });

    it('a failed get() does not promote anything', () => {
      const cache = new LRUCache<number>({ maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);

      cache.get('nonexistent');
      cache.set('c', 3);

      expect(cache.has('a')).toBe(false);
      expect(cache.keys()).toEqual(['b', 'c']);
    });

    it('calls onEvict with the evicted key and value', () => {
      const onEvict = vi.fn();
      const cache = new LRUCache<string>({ maxSize: 2, onEvict });

      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('c', 'C');

      expect(onEvict).toHaveBeenCalledTimes(1);
      expect(onEvict).toHaveBeenCalledWith('a', 'A');
    });

    it('does not call onEvict for a plain delete or an overwrite', () => {
      const onEvict = vi.fn();
      const cache = new LRUCache<string>({ maxSize: 2, onEvict });

      cache.set('a', 'A');
      cache.set('a', 'A2');
      cache.delete('a');

      expect(onEvict).not.toHaveBeenCalled();
    });

    it('evicts an empty-string key like any other', () => {
      // Regression guard: evictLRU() picks the first key from the Map
      // iterator, and an empty-string key is falsy. A truthiness check there
      // silently skips the eviction and lets the cache exceed maxSize.
      const cache = new LRUCache<number>({ maxSize: 2 });

      cache.set('', 0);
      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.size()).toBe(2);
      expect(cache.has('')).toBe(false);
      expect(cache.getStats().evictions).toBe(1);
    });

    it('evicts repeatedly under sustained insertion, holding capacity', () => {
      const cache = new LRUCache<number>({ maxSize: 10 });

      for (let i = 0; i < 1000; i++) {
        cache.set(`k${i}`, i);
      }

      expect(cache.size()).toBe(10);
      expect(cache.getStats().evictions).toBe(990);
      expect(cache.keys()).toEqual([
        'k990', 'k991', 'k992', 'k993', 'k994',
        'k995', 'k996', 'k997', 'k998', 'k999',
      ]);
    });
  });

  describe('TTL expiry', () => {
    it('expires an entry once its TTL has elapsed', () => {
      vi.useFakeTimers();
      try {
        const cache = new LRUCache<number>({ maxSize: 3, ttl: 1000 });
        cache.set('a', 1);

        vi.advanceTimersByTime(999);
        expect(cache.get('a')).toBe(1);

        vi.advanceTimersByTime(2);
        expect(cache.get('a')).toBeUndefined();
        expect(cache.size()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('a per-entry TTL overrides the cache-wide TTL', () => {
      vi.useFakeTimers();
      try {
        const cache = new LRUCache<number>({ maxSize: 3, ttl: 10_000 });
        cache.set('short', 1, 500);
        cache.set('long', 2);

        vi.advanceTimersByTime(501);

        expect(cache.get('short')).toBeUndefined();
        expect(cache.get('long')).toBe(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it('treats TTL 0 as "never expires"', () => {
      vi.useFakeTimers();
      try {
        const cache = new LRUCache<number>({ maxSize: 3, ttl: 0 });
        cache.set('a', 1);

        vi.advanceTimersByTime(10_000_000);

        expect(cache.get('a')).toBe(1);
        expect(cache.has('a')).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it('has() reports an expired entry as absent and drops it', () => {
      vi.useFakeTimers();
      try {
        const cache = new LRUCache<number>({ maxSize: 3, ttl: 1000 });
        cache.set('a', 1);

        vi.advanceTimersByTime(1001);

        expect(cache.has('a')).toBe(false);
        expect(cache.size()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('counts an expired read as a miss, not a hit', () => {
      vi.useFakeTimers();
      try {
        const cache = new LRUCache<number>({ maxSize: 3, ttl: 1000 });
        cache.set('a', 1);

        vi.advanceTimersByTime(1001);
        cache.get('a');

        const stats = cache.getStats();
        expect(stats.misses).toBe(1);
        expect(stats.hits).toBe(0);
        // The expiry path routes through delete(), so it is counted as one.
        expect(stats.deletes).toBe(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('cleanExpired removes only expired entries and returns the count', () => {
      vi.useFakeTimers();
      try {
        const cache = new LRUCache<number>({ maxSize: 5 });
        cache.set('a', 1, 500);
        cache.set('b', 2, 500);
        cache.set('c', 3, 5000);
        cache.set('d', 4); // no TTL

        vi.advanceTimersByTime(1000);
        const cleaned = cache.cleanExpired();

        expect(cleaned).toBe(2);
        expect(cache.keys()).toEqual(['c', 'd']);
      } finally {
        vi.useRealTimers();
      }
    });

    it('cleanExpired returns 0 when nothing has expired', () => {
      const cache = new LRUCache<number>({ maxSize: 5 });
      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.cleanExpired()).toBe(0);
      expect(cache.size()).toBe(2);
    });
  });

  describe('hit/miss accounting and CacheStats', () => {
    it('counts hits and misses and derives the hit rate', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);

      cache.get('a');
      cache.get('a');
      cache.get('a');
      cache.get('missing');

      const stats = cache.getStats();
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.75, 10);
    });

    it('reports a hit rate of 0 before any read', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);

      expect(cache.getStats().hitRate).toBe(0);
    });

    it('hitRate is a ratio in [0,1], not a percentage', () => {
      // CacheStats documents hitRate as a "percentage"; the implementation
      // stores hits/total. Pinned so a reader trusts the value, not the doc.
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);
      cache.get('a');

      expect(cache.getStats().hitRate).toBe(1);
    });

    it('keeps stats.size in step with the live entry count', () => {
      const cache = new LRUCache<number>({ maxSize: 2 });

      cache.set('a', 1);
      expect(cache.getStats().size).toBe(1);

      cache.set('b', 2);
      cache.set('c', 3); // evicts 'a'
      expect(cache.getStats().size).toBe(2);
      expect(cache.getStats().size).toBe(cache.size());

      cache.delete('b');
      expect(cache.getStats().size).toBe(cache.size());
    });

    it('tracks memoryUsage from the size estimator', () => {
      const cache = new LRUCache<string>({ maxSize: 3 });

      cache.set('a', 'hello');
      expect(cache.getStats().memoryUsage).toBe(estimatedSize('hello'));

      cache.set('b', 'world!');
      expect(cache.getStats().memoryUsage).toBe(
        estimatedSize('hello') + estimatedSize('world!'),
      );

      cache.delete('a');
      expect(cache.getStats().memoryUsage).toBe(estimatedSize('world!'));
    });

    it('does not double-count memoryUsage when a key is overwritten', () => {
      // Regression guard: set() on an existing key must release the old
      // entry's estimated size, or memoryUsage climbs without bound while the
      // entry count stays flat.
      const cache = new LRUCache<string>({ maxSize: 3 });

      cache.set('a', 'first-value');
      for (let i = 0; i < 20; i++) {
        cache.set('a', 'x');
      }

      expect(cache.size()).toBe(1);
      expect(cache.getStats().memoryUsage).toBe(estimatedSize('x'));
    });

    it('releases memoryUsage when an entry is evicted', () => {
      const cache = new LRUCache<string>({ maxSize: 2 });

      cache.set('a', 'aaaa');
      cache.set('b', 'bb');
      cache.set('c', 'cc'); // evicts 'a'

      expect(cache.getStats().memoryUsage).toBe(
        estimatedSize('bb') + estimatedSize('cc'),
      );
    });

    it('falls back to a fixed size for values JSON cannot serialize', () => {
      const cache = new LRUCache<Record<string, unknown>>({ maxSize: 3 });
      const circular: Record<string, unknown> = { name: 'loop' };
      circular.self = circular;

      cache.set('a', circular);

      expect(cache.getStats().memoryUsage).toBe(100);
      expect(cache.get('a')).toBe(circular);
    });

    it('getStats returns a copy that cannot mutate internal state', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);
      cache.get('a');

      const stats = cache.getStats();
      stats.hits = 9999;
      stats.size = 9999;

      expect(cache.getStats().hits).toBe(1);
      expect(cache.getStats().size).toBe(1);
    });

    it('stops counting when statistics are disabled', () => {
      const cache = new LRUCache<number>({ maxSize: 2, enableStats: false });

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // evicts 'a'
      cache.get('b');
      cache.get('missing');
      cache.delete('b');

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.sets).toBe(0);
      expect(stats.deletes).toBe(0);
      expect(stats.evictions).toBe(0);
      expect(stats.memoryUsage).toBe(0);
      // Eviction itself still happens -- only the bookkeeping is off.
      expect(cache.has('a')).toBe(false);
      expect(cache.size()).toBe(1);
    });
  });

  describe('entry metadata', () => {
    it('an overwrite resets the access count for that key', () => {
      const cache = new LRUCache<number>({ maxSize: 3 });
      cache.set('a', 1);
      cache.get('a');
      cache.get('a');

      cache.set('a', 2); // fresh entry, accessCount back to 0

      expect(cache.get('a')).toBe(2);
      expect(cache.getStats().hits).toBe(3);
    });

    it('stores values by reference rather than cloning them', () => {
      const cache = new LRUCache<{ items: number[] }>({ maxSize: 3 });
      const value = { items: [1, 2, 3] };

      cache.set('a', value);
      value.items.push(4);

      expect(cache.get('a')?.items).toEqual([1, 2, 3, 4]);
    });
  });
});
