/**
 * Memory Performance Tests
 *
 * Tests T-PRF-011 through T-PRF-015: Performance tests for
 * memory usage and leak detection.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 */

import v8 from 'node:v8';
import vm from 'node:vm';
import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';
import { cacheLedger, probeReads } from './helpers/work-probe.js';

describe('Memory Performance Tests', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;
  let exportService: ExportService;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
    exportService = new ExportService();
  });

  function createValidInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Valid thought content',
      thoughtNumber: 1,
      totalThoughts: 100,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  function getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  function forceGC(): void {
    const g = global as unknown as { gc?: () => void };
    if (!g.gc) {
      // These tests compare heapUsed deltas, which are meaningless without a
      // real collection between samples. This helper used to be guarded by
      // `if (global.gc)` while nothing ever set --expose-gc, so it was a
      // permanent no-op and T-PRF-011 asserted against raw allocator noise --
      // that is why it flaked. Passing --expose-gc through vitest poolOptions
      // does not work either: worker_threads rejects the flag. So acquire gc
      // directly from V8 at runtime.
      try {
        v8.setFlagsFromString('--expose_gc');
        g.gc = vm.runInNewContext('gc') as () => void;
      } finally {
        // Stops NEW contexts from receiving gc. It does not revoke the
        // reference already captured above -- that is intentional and is what
        // makes the helper usable for the rest of the run.
        v8.setFlagsFromString('--no-expose_gc');
      }
    }
    // Enforced here rather than in a single test. Eight other tests in this
    // file call forceGC() and then gate their assertions behind
    // `if (delta > 0)` -- which never skips, because heapUsed is never 0. If
    // acquiring gc ever silently failed (a sandboxed CI, restricted
    // permissions), those tests would quietly go back to asserting against
    // allocator noise, which is the exact flake class this helper exists to
    // remove. Fail loudly instead.
    expect(
      typeof g.gc,
      'global.gc unavailable - forceGC() could not acquire it via v8.setFlagsFromString; memory assertions would be measuring allocator noise',
    ).toBe('function');
    g.gc?.();
  }

  // ===========================================================================
  // T-PRF-011: Memory usage with 100 sessions
  // ===========================================================================
  describe('T-PRF-011: Memory With 100 Sessions', () => {
    it('should handle 100 sessions without excessive memory growth', async () => {
      forceGC();
      const initialMemory = getMemoryUsage();

      const sessions: { id: string }[] = [];

      // Create 100 sessions with 5 thoughts each
      for (let s = 0; s < 100; s++) {
        const session = await manager.createSession();
        sessions.push(session);

        for (let i = 1; i <= 5; i++) {
          const thought = factory.createThought(createValidInput({
            thought: `Session ${s} Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 5,
            nextThoughtNeeded: i < 5,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      forceGC();
      const finalMemory = getMemoryUsage();

      // Verify all sessions exist
      expect(sessions).toHaveLength(100);
      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        expect(updated?.thoughts).toHaveLength(5);
      }

      // Memory should not grow excessively (less than 100MB for 500 thoughts)
      const memoryGrowth = finalMemory - initialMemory;
      if (initialMemory > 0) {
        expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024);
      }
    });

    it('should maintain consistent memory per session', async () => {
      // Regression note: this test used to sample heapUsed before and after
      // each session and require 70% of the ten signed deltas to fall within
      // 5x the MEAN delta. That assertion is degenerate, and it failed and
      // passed on identical code.
      //
      // The band is anchored to a signed mean, and `Math.max(avgSize, 1)`
      // floors that scale at 1 byte. One negative delta -- a gc() call that
      // returns more than the loop allocated, which is ordinary in a worker
      // shared with other test files -- drags the mean toward zero and
      // collapses the band with it. Measured on this machine, nine samples of
      // ~16 KB plus a single -138 KB sample takes the filter from 9/10 inside
      // the band to 0/10, so the assertion does not degrade gradually: it
      // inverts at a cliff. The same loop was observed producing +590 KB and
      // +422 KB single-sample excursions, so excursions of that size plainly
      // occur; nothing bounds them below. The `sessionSizes[0] > 0` guard did
      // not help, since it inspects only the first sample.
      //
      // A per-iteration signed heap delta of ~16 KB cannot be measured
      // reliably in-process: one GC cycle is larger than the signal. Every
      // other memory assertion in this file is therefore a one-sided bound on
      // an AGGREGATE delta, which is robust, and this one now matches them --
      // plus a deterministic proxy for the property the test is named for.
      //
      // The property: ten structurally identical sessions must retain
      // structurally identical amounts of data. A per-session leak (state
      // accumulating in the manager and attaching to each new session) makes
      // the retained payload grow with the session index. v8.serialize()
      // measures that payload exactly and does not depend on GC timing. It
      // measures retained structure, not V8's heap accounting -- which is the
      // trade: determinism for a slightly narrower question.
      const retainedSizes: number[] = [];

      forceGC();
      const beforeAll = getMemoryUsage();

      for (let i = 0; i < 10; i++) {
        const session = await manager.createSession();
        for (let j = 1; j <= 10; j++) {
          const thought = factory.createThought(createValidInput({
            thought: `Thought ${j}`,
            thoughtNumber: j,
            totalThoughts: 10,
          }), session.id);
          await manager.addThought(session.id, thought);
        }

        const stored = await manager.getSession(session.id);
        expect(stored?.thoughts).toHaveLength(10);
        retainedSizes.push(v8.serialize(stored).length);
      }

      forceGC();
      const afterAll = getMemoryUsage();

      // Deterministic: every session must retain the same amount of data.
      // Sessions differ only in their UUIDs and timestamps, so the measured
      // spread is a few bytes; 5% leaves ample room for that while catching
      // any growth trend. A leak of one extra thought per session shows up
      // here as roughly +25%.
      const median = [...retainedSizes].sort((a, b) => a - b)[
        Math.floor(retainedSizes.length / 2)
      ];
      expect(median).toBeGreaterThan(0);
      for (const [index, size] of retainedSizes.entries()) {
        expect(
          Math.abs(size - median) / median,
          `session ${index} retained ${size} bytes against a median of ${median}`,
        ).toBeLessThan(0.05);
      }

      // The retained payload must not trend upward across sessions, which is
      // what a per-session leak looks like even when every step is small.
      expect(retainedSizes[retainedSizes.length - 1]).toBeLessThan(
        retainedSizes[0] * 1.05,
      );

      // One-sided aggregate heap bound, in the style of the other tests here:
      // 10 sessions of 10 thoughts retain ~65 KB of payload, so 20 MB of heap
      // growth would mean something is badly wrong. Robust because it is a
      // single large-scale delta, not ten small signed ones.
      expect(afterAll - beforeAll).toBeLessThan(20 * 1024 * 1024);
    });
  });

  // ===========================================================================
  // T-PRF-012: Memory usage with 1000-thought session
  // ===========================================================================
  describe('T-PRF-012: Memory With 1000-Thought Session', () => {
    it('should handle 1000 thoughts in single session', async () => {
      const session = await manager.createSession();

      forceGC();
      const initialMemory = getMemoryUsage();

      for (let i = 1; i <= 1000; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought number ${i} with some content`,
          thoughtNumber: i,
          totalThoughts: 1000,
          nextThoughtNeeded: i < 1000,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      forceGC();
      const finalMemory = getMemoryUsage();

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(1000);

      // Memory should scale linearly (roughly)
      const memoryGrowth = finalMemory - initialMemory;
      if (initialMemory > 0) {
        // Should be less than 50MB for 1000 thoughts
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
      }
    });

    it('should export 1000-thought session without memory spike', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 1000; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 1000,
          nextThoughtNeeded: i < 1000,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      forceGC();
      const beforeExport = getMemoryUsage();

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');

      forceGC();
      const afterExport = getMemoryUsage();

      expect(json).toBeDefined();
      expect(json.length).toBeGreaterThan(0);

      // Export should not cause large memory spike
      const exportMemory = afterExport - beforeExport;
      if (beforeExport > 0) {
        expect(exportMemory).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });

  // ===========================================================================
  // T-PRF-013: Memory cleanup after session delete
  // ===========================================================================
  describe('T-PRF-013: Memory Cleanup After Delete', () => {
    it('should release memory after session deletion', async () => {
      // Create a large session
      const session = await manager.createSession();
      for (let i = 1; i <= 500; i++) {
        const thought = factory.createThought(createValidInput({
          thought: 'A'.repeat(1000), // 1KB per thought
          thoughtNumber: i,
          totalThoughts: 500,
          nextThoughtNeeded: i < 500,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      forceGC();
      const beforeDelete = getMemoryUsage();

      // Delete the session
      await manager.deleteSession(session.id);

      forceGC();
      const afterDelete = getMemoryUsage();

      // Verify session is gone
      expect(await manager.getSession(session.id)).toBeNull();

      // Memory should not increase significantly after deletion
      // Note: GC may not run immediately, so we allow small increases
      if (beforeDelete > 0) {
        const memoryChange = afterDelete - beforeDelete;
        // Allow up to 1MB increase due to GC timing
        expect(memoryChange).toBeLessThan(1 * 1024 * 1024);
      }
    });

    it('should clean up multiple deleted sessions', async () => {
      const sessions: { id: string }[] = [];

      // Create 50 sessions
      for (let s = 0; s < 50; s++) {
        const session = await manager.createSession();
        sessions.push(session);

        for (let i = 1; i <= 10; i++) {
          const thought = factory.createThought(createValidInput({
            thought: 'Content'.repeat(100),
            thoughtNumber: i,
            totalThoughts: 10,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      forceGC();
      const afterCreate = getMemoryUsage();

      // Delete all sessions
      for (const session of sessions) {
        await manager.deleteSession(session.id);
      }

      forceGC();
      const afterDelete = getMemoryUsage();

      // Verify all sessions are gone
      for (const session of sessions) {
        expect(await manager.getSession(session.id)).toBeNull();
      }

      // Memory should not increase significantly after deletion
      // Note: GC timing is non-deterministic, allow some variance
      if (afterCreate > 0) {
        const memoryChange = afterDelete - afterCreate;
        // Allow up to 2MB increase due to GC timing
        expect(memoryChange).toBeLessThan(2 * 1024 * 1024);
      }
    });
  });

  // ===========================================================================
  // T-PRF-014: LRU cache effectiveness
  // ===========================================================================
  describe('T-PRF-014: Cache Effectiveness', () => {
    it('should reuse cached resources efficiently', async () => {
      // Regression note: this test used to compare average wall-clock
      // duration of a "first pass" vs a "second pass" of addThought()
      // calls and assert the second pass was not much slower than the
      // first. That measures runner load, not code correctness - it is
      // flaky by construction on shared CI runners (observed failure:
      // `expected 0.2533 to be less than or equal to 0.1984`, then a
      // clean pass on an immediate re-run with zero code changes).
      //
      // The actual thing "cache effectiveness" needs to guarantee is
      // that repeated session lookups are served from the in-memory LRU
      // cache (SessionManager.activeSessions) rather than falling back to
      // reloading the session - i.e. every addThought() resolves as a
      // cache hit, never a miss. That is directly observable via
      // SessionManager.getSessionCacheStats(), so assert on that instead
      // of timing.
      const session = await manager.createSession();
      const statsBefore = manager.getSessionCacheStats();

      // Create thoughts that might benefit from caching
      const modes = ['sequential', 'hybrid', 'mathematics'] as const;

      // First pass
      for (let i = 0; i < 30; i++) {
        const mode = modes[i % modes.length];
        const thought = factory.createThought(createValidInput({
          mode,
          thought: `First pass ${i}`,
          thoughtNumber: i + 1,
          totalThoughts: 60,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      // Second pass with same modes
      for (let i = 0; i < 30; i++) {
        const mode = modes[i % modes.length];
        const thought = factory.createThought(createValidInput({
          mode,
          thought: `Second pass ${i}`,
          thoughtNumber: i + 31,
          totalThoughts: 60,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const statsAfter = manager.getSessionCacheStats();
      const hitsDuringTest = statsAfter.hits - statsBefore.hits;
      const missesDuringTest = statsAfter.misses - statsBefore.misses;

      // 60 addThought() calls against the same session => 60 cache
      // lookups, all of which must be served from cache (the session was
      // created once and never evicted: cache maxSize is 1000, well above
      // the single session used here).
      expect(hitsDuringTest).toBe(60);
      expect(missesDuringTest).toBe(0);
    });

    it('should maintain cache under memory pressure', async () => {
      // Regression note: this test used to finish with
      // `expect(duration).toBeLessThan(100)` on a single addThought() after
      // filling the cache. That is a wall-clock bound on a microsecond
      // operation, so it measured scheduler noise; see
      // helpers/work-probe.ts. What "the cache still works under pressure"
      // means is that an operation on a fresh session costs exactly what it
      // costs on an empty manager -- same lookups, same touches -- which is
      // directly countable.
      const baseline = await manager.createSession();
      const baselineProbe = probeReads(factory.createThought(createValidInput({
        thought: 'Baseline before cache pressure',
        thoughtNumber: 1,
        totalThoughts: 1,
      }), baseline.id));
      const baselineLedger = cacheLedger(manager);
      await manager.addThought(baseline.id, baselineProbe.value);
      const baselineWork = baselineLedger();

      // Create many sessions to drive the LRU cache to its cap
      const sessions: { id: string }[] = [];
      for (let s = 0; s < 100; s++) {
        const session = await manager.createSession();
        sessions.push(session);

        const thought = factory.createThought(createValidInput({
          thought: `Session ${s}`,
          thoughtNumber: 1,
          totalThoughts: 1,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const testSession = await manager.createSession();
      const pressuredProbe = probeReads(factory.createThought(createValidInput({
        thought: 'Test after cache pressure',
        thoughtNumber: 1,
        totalThoughts: 1,
      }), testSession.id));
      const pressuredLedger = cacheLedger(manager);
      await manager.addThought(testSession.id, pressuredProbe.value);
      const pressuredWork = pressuredLedger();

      expect(baselineProbe.reads).toBeGreaterThan(0);
      expect(pressuredProbe.reads).toBe(baselineProbe.reads);
      expect(pressuredWork.hits).toBe(baselineWork.hits);
      expect(pressuredWork.misses).toBe(0);
    });
  });

  // ===========================================================================
  // T-PRF-015: No memory leaks over time
  // ===========================================================================
  describe('T-PRF-015: Memory Leak Detection', () => {
    it('should not leak memory over repeated operations', async () => {
      const memoryReadings: number[] = [];

      // Perform 10 cycles of create/use/delete
      for (let cycle = 0; cycle < 10; cycle++) {
        forceGC();
        memoryReadings.push(getMemoryUsage());

        // Create, use, delete pattern
        const session = await manager.createSession();
        for (let i = 1; i <= 50; i++) {
          const thought = factory.createThought(createValidInput({
            thought: `Cycle ${cycle} Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 50,
          }), session.id);
          await manager.addThought(session.id, thought);
        }

        const updated = await manager.getSession(session.id);
        exportService.exportSession(updated!, 'json');
        exportService.exportSession(updated!, 'markdown');

        await manager.deleteSession(session.id);
      }

      forceGC();
      memoryReadings.push(getMemoryUsage());

      if (memoryReadings[0] > 0) {
        // Memory should not grow significantly over cycles
        const initial = memoryReadings[0];
        const final = memoryReadings[memoryReadings.length - 1];
        const growth = final - initial;

        // Allow some growth but not excessive (less than 10MB over 10 cycles)
        expect(growth).toBeLessThan(10 * 1024 * 1024);
      }
    });

    it('should not leak memory with exports', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 20; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 20,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      forceGC();
      const beforeExports = getMemoryUsage();

      // Perform many exports
      const updated = await manager.getSession(session.id);
      for (let i = 0; i < 100; i++) {
        exportService.exportSession(updated!, 'json');
        exportService.exportSession(updated!, 'markdown');
      }

      forceGC();
      const afterExports = getMemoryUsage();

      if (beforeExports > 0) {
        const growth = afterExports - beforeExports;
        // 200 exports should not cause significant memory growth
        expect(growth).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });
});
