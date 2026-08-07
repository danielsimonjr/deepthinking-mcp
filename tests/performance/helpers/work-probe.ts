/**
 * Deterministic work probes for the performance suite.
 *
 * WHY THIS EXISTS
 * ---------------
 * Every test under `tests/performance/` used to assert a wall-clock bound
 * (`expect(duration).toBeLessThan(100)`, `expect(thoughtsPerSecond)
 * .toBeGreaterThanOrEqual(100)`). Those assertions measure how busy the
 * machine was, not what the code did: the same commit passes when the file is
 * run alone and fails when the full suite runs in parallel with anything else.
 * Observed 2026-08-07 on both `throughput.test.ts` T-PRF-007 and
 * `stress.test.ts` T-PRF-016 with no code change between the two runs.
 *
 * A wall-clock bound is also a bad regression detector even when it is stable.
 * It fires late (only once a regression is slow enough to cross an arbitrary
 * millisecond line), and the tempting repair when it fires spuriously is to
 * widen the bound -- which is how a real regression gets hidden.
 *
 * So these tests assert on COUNTED work instead. Two counters cover
 * everything the timing bounds were reaching for:
 *
 *   1. `cacheLedger()` - the exact number of session-cache operations
 *      (`sets`/`hits`/`misses`/`deletes`/`evictions`) that a block of work
 *      performed, read from `SessionManager.getSessionCacheStats()`. Creating
 *      10 sessions must cost exactly 10 `sets` and 0 `hits`; if session
 *      creation ever starts scanning the existing sessions, `hits` goes
 *      0 -> 45 and the assertion fails immediately and by a wide margin.
 *
 *   2. `probeReads()` - a property-read counter around a single stored
 *      object. `SessionManager.addThought()` is documented as O(1) per
 *      thought ("uses O(1) incremental calculation"). That claim is directly
 *      observable: after thought #1 is stored, adding thoughts #2..#N must
 *      never read a property of thought #1 again. The counter reads 0 on
 *      correct code and N-1 on a regression that recomputes over the whole
 *      session -- a signal that does not depend on machine load at all.
 *
 * WHAT COVERS CATASTROPHIC SLOWNESS NOW
 * -------------------------------------
 * Vitest's per-test timeout. It is a real wall-clock backstop, it is already
 * generous enough not to be load-sensitive, and unlike a hand-tuned
 * `toBeLessThan(100)` nobody is tempted to nudge it upward to silence a flake.
 */

import type { SessionManager } from '../../../src/session/manager.js';

/**
 * A counted view of one object's property reads.
 *
 * `value` is a transparent Proxy: pass it wherever the real object would go
 * (writes pass straight through, so `addThought()`'s `thought.sessionId = ...`
 * stamping still works). `reads` is the number of property GETs performed on
 * it so far.
 */
export interface ReadProbe<T extends object> {
  /** The instrumented stand-in. Use this in place of `target`. */
  readonly value: T;
  /** Property reads observed on `value` since it was created. */
  readonly reads: number;
}

/**
 * Wrap an object in a property-read counter.
 *
 * Used to prove that per-item work is O(1): snapshot `probe.reads` right after
 * the item is stored, do more work, and assert the count has not moved.
 */
export function probeReads<T extends object>(target: T): ReadProbe<T> {
  let reads = 0;
  const value = new Proxy(target, {
    get(t, property, receiver) {
      reads += 1;
      return Reflect.get(t, property, receiver);
    },
  }) as T;

  return {
    value,
    get reads() {
      return reads;
    },
  };
}

/** Session-cache operations performed during a measured block of work. */
export interface CacheWork {
  /** Sessions written into the active-session cache (one per creation). */
  sets: number;
  /** Cache lookups that found a live session. */
  hits: number;
  /** Cache lookups that found nothing. */
  misses: number;
  /** Explicit removals (one per `deleteSession()`). */
  deletes: number;
  /** Sessions pushed out by the LRU cap. */
  evictions: number;
  /** Sessions resident in the cache at the time of the reading. */
  size: number;
}

/**
 * Start counting session-cache work on `manager`.
 *
 * Returns a function that reports the operations performed since this call.
 * Call it as many times as needed; every reading is relative to the same
 * baseline, so a test can measure nested or successive phases.
 */
export function cacheLedger(manager: SessionManager): () => CacheWork {
  const base = manager.getSessionCacheStats();

  return () => {
    const now = manager.getSessionCacheStats();
    return {
      sets: now.sets - base.sets,
      hits: now.hits - base.hits,
      misses: now.misses - base.misses,
      deletes: now.deletes - base.deletes,
      evictions: now.evictions - base.evictions,
      size: now.size,
    };
  };
}
