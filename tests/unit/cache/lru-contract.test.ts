/**
 * `LRUCache` stats contract — the "looks right, reports wrong" kind of defect.
 *
 * `CacheStats.hitRate` was documented as a **percentage** while the
 * implementation stores a **ratio** (`hits / total`). A consumer trusting the
 * doc renders a 0.85 hit rate as "0.85%" instead of "85%" — wrong by two orders
 * of magnitude, and entirely plausible-looking. Callers depend on the ratio, so
 * the DOCUMENTATION was the thing that was wrong; these tests pin the real
 * contract so the two cannot drift apart again.
 *
 * `maxSize: 0` was ALSO investigated here and deliberately left alone: it falls
 * back to 100, but a 0-capacity cache is unreachable (the only construction
 * site passes a config value that `validateConfig` throws on below 1, and
 * `LRUCache` is not exported from the package entry). `tests/unit/cache/
 * lru.test.ts` pins that decision; changing it would break a correct test to
 * alter a path nothing can take.
 */
import { describe, it, expect } from 'vitest';
import { LRUCache } from '../../../src/cache/lru.js';

describe('LRUCache stats contract', () => {
  it('reports hitRate as a RATIO in [0,1], not a percentage', () => {
    const cache = new LRUCache<string>({ maxSize: 10 });
    cache.set('a', 'A');

    cache.get('a'); // hit
    cache.get('a'); // hit
    cache.get('b'); // miss
    cache.get('c'); // miss

    const { hitRate } = cache.getStats();
    expect(hitRate).toBeGreaterThanOrEqual(0);
    expect(hitRate).toBeLessThanOrEqual(1);
    expect(hitRate).toBeCloseTo(0.5, 10); // 2 hits of 4 lookups
  });

  it('reports hitRate 0 before any lookup rather than NaN', () => {
    // 0/0 is NaN in JavaScript, and a NaN formatted into a response reads as
    // a computed value.
    const cache = new LRUCache<string>({ maxSize: 10 });
    expect(cache.getStats().hitRate).toBe(0);
  });
});
