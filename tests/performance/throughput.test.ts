/**
 * Throughput Performance Tests
 *
 * Tests T-PRF-006 through T-PRF-010: sustained throughput and concurrent
 * operations.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 *
 * 2026-08-07 — every assertion in this file used to be a wall-clock rate
 * (`expect(thoughtsPerSecond).toBeGreaterThanOrEqual(100)`,
 * `expect(createDuration).toBeLessThan(100)`). Those measure machine
 * availability, not the code: T-PRF-007 passed when this file ran alone and
 * failed on the same commit when the suite ran alongside other work. They are
 * replaced by counted work — exact session-cache operation ledgers and
 * property-read counters — which give the same regression coverage with a
 * signal that does not move with load. See `helpers/work-probe.ts` for the
 * full rationale and for what still covers catastrophic slowness.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';
import { cacheLedger, probeReads, type ReadProbe } from './helpers/work-probe.js';
import type { Thought } from '../../src/types/core.js';

describe('Throughput Performance Tests', () => {
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

  /** Create a thought and add it, returning a read-counter around the stored object. */
  async function addProbedThought(
    sessionId: string,
    overrides: Partial<ThinkingToolInput> = {},
  ): Promise<ReadProbe<Thought>> {
    const probe = probeReads(factory.createThought(createValidInput(overrides), sessionId));
    await manager.addThought(sessionId, probe.value);
    return probe;
  }

  // ===========================================================================
  // T-PRF-006: Sustained thought ingestion
  //
  // Was: `thoughtsPerSecond >= 100`. Now: ingesting N thoughts costs exactly N
  // session lookups and no rework, and the cost of thought #k does not depend
  // on how many thoughts precede it.
  // ===========================================================================
  describe('T-PRF-006: Sustained Thought Ingestion', () => {
    it('should cost exactly one session lookup per thought, with no rework', async () => {
      const targetCount = 100;
      const ledger = cacheLedger(manager);
      const session = await manager.createSession();

      for (let i = 1; i <= targetCount; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: targetCount,
          nextThoughtNeeded: i < targetCount,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      // One cache write for the session itself, one lookup per thought, and
      // nothing else. A regression that re-reads or re-writes the session per
      // thought shows up here as a doubled count; one that reloads the session
      // shows up as a non-zero `misses`.
      expect(ledger()).toEqual({
        sets: 1,
        hits: targetCount,
        misses: 0,
        deletes: 0,
        evictions: 0,
        size: 1,
      });

      const stored = await manager.getSession(session.id);
      expect(stored?.thoughts).toHaveLength(targetCount);
    });

    it('should keep per-thought work constant as the session grows', async () => {
      const session = await manager.createSession();

      // Probe the first and the fiftieth thought. Once stored, neither may be
      // read again: `addThought()` is documented as O(1) per thought
      // ("uses O(1) incremental calculation"). A regression that recomputes
      // metrics across `session.thoughts` reads every earlier thought on every
      // insertion — 0 becomes ~200 on the loop below.
      const first = await addProbedThought(session.id, { thought: 'First', thoughtNumber: 1 });
      const readsAfterFirstInsert = first.reads;

      let middle: ReadProbe<Thought> | undefined;
      let readsAfterMiddleInsert = 0;

      for (let i = 2; i <= 200; i++) {
        if (i === 50) {
          middle = await addProbedThought(session.id, { thought: `Thought ${i}`, thoughtNumber: i });
          readsAfterMiddleInsert = middle.reads;
        } else {
          const thought = factory.createThought(createValidInput({
            thought: `Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 200,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      expect(readsAfterFirstInsert).toBeGreaterThan(0);
      expect(first.reads - readsAfterFirstInsert).toBe(0);
      expect(middle!.reads - readsAfterMiddleInsert).toBe(0);
    });

    it('should keep per-thought work independent of content size', async () => {
      const session = await manager.createSession();
      const readsPerInsert: number[] = [];

      // Content sizes 50..950 characters. Sanitizing the string is inherently
      // O(content), but the number of times the pipeline touches the thought
      // must not depend on how big it is — that would mean a size-dependent
      // code path, which is what "throughput collapses on large thoughts"
      // actually looks like.
      for (let i = 1; i <= 50; i++) {
        const contentSize = (i % 10) * 100 + 50;
        const before = manager.getSessionCacheStats().hits;
        const probe = await addProbedThought(session.id, {
          thought: 'X'.repeat(contentSize),
          thoughtNumber: i,
          totalThoughts: 50,
          nextThoughtNeeded: i < 50,
        });
        expect(manager.getSessionCacheStats().hits - before).toBe(1);
        readsPerInsert.push(probe.reads);
      }

      expect(readsPerInsert[0]).toBeGreaterThan(0);
      expect(new Set(readsPerInsert).size).toBe(1);
    });
  });

  // ===========================================================================
  // T-PRF-007: 10 concurrent sessions
  //
  // Was: `createDuration < 100` and `throughput >= 50`. Now: creating a
  // session is O(1) in the number of existing sessions, and interleaving work
  // across sessions costs exactly one lookup per operation.
  // ===========================================================================
  describe('T-PRF-007: 10 Concurrent Sessions', () => {
    it('should create 10 sessions without touching the ones already created', async () => {
      const ledger = cacheLedger(manager);
      const sessions: { id: string }[] = [];

      for (let i = 0; i < 10; i++) {
        sessions.push(await manager.createSession());
      }

      // Exactly one cache write per session and zero lookups. This is the
      // assertion that replaces `createDuration < 100`: if session creation
      // ever starts scanning what already exists (a uniqueness check, an
      // eviction sweep), `hits` goes 0 -> 45 for these ten creations and grows
      // quadratically from there. The timing bound only noticed that once the
      // scan got slow enough to cross 100 ms.
      expect(ledger()).toEqual({
        sets: 10,
        hits: 0,
        misses: 0,
        deletes: 0,
        evictions: 0,
        size: 10,
      });
      expect(new Set(sessions.map((s) => s.id)).size).toBe(10);
    });

    it('should interleave thoughts across 10 sessions at one lookup each', async () => {
      const sessions: { id: string }[] = [];
      for (let i = 0; i < 10; i++) {
        sessions.push(await manager.createSession());
      }

      const ledger = cacheLedger(manager);

      // Probe the first thought written to the first session; 49 further
      // writes spread over 10 sessions must never read it again.
      const firstProbe = await addProbedThought(sessions[0].id, {
        thought: 'Round 1 thought',
        thoughtNumber: 1,
        totalThoughts: 5,
      });
      const readsAfterInsert = firstProbe.reads;

      for (let round = 1; round <= 5; round++) {
        for (const session of sessions) {
          if (round === 1 && session.id === sessions[0].id) continue;
          const thought = factory.createThought(createValidInput({
            thought: `Round ${round} thought`,
            thoughtNumber: round,
            totalThoughts: 5,
            nextThoughtNeeded: round < 5,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      // 50 thoughts total (10 sessions * 5 thoughts each), one lookup each.
      expect(ledger()).toMatchObject({ hits: 50, misses: 0, sets: 0, evictions: 0 });
      expect(firstProbe.reads - readsAfterInsert).toBe(0);

      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        expect(updated?.thoughts).toHaveLength(5);
      }
    });

    it('should maintain isolation between concurrent sessions', async () => {
      const session1 = await manager.createSession();
      const session2 = await manager.createSession();

      // Add different content to each
      const thought1 = factory.createThought(createValidInput({
        thought: 'Session 1 content',
        thoughtNumber: 1,
      }), session1.id);
      await manager.addThought(session1.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        thought: 'Session 2 different content',
        thoughtNumber: 1,
      }), session2.id);
      await manager.addThought(session2.id, thought2);

      const s1 = await manager.getSession(session1.id);
      const s2 = await manager.getSession(session2.id);

      expect(s1?.thoughts[0].content).toBe('Session 1 content');
      expect(s2?.thoughts[0].content).toBe('Session 2 different content');
    });
  });

  // ===========================================================================
  // T-PRF-008: 50 concurrent sessions
  //
  // Was: `createDuration < 500`, `throughput >= 50`, `exportsPerSecond >= 25`.
  // ===========================================================================
  describe('T-PRF-008: 50 Concurrent Sessions', () => {
    it('should scale session creation linearly to 50 sessions', async () => {
      const ledger = cacheLedger(manager);
      const sessions: { id: string }[] = [];

      for (let i = 0; i < 50; i++) {
        sessions.push(await manager.createSession());
      }

      expect(ledger()).toEqual({
        sets: 50,
        hits: 0,
        misses: 0,
        deletes: 0,
        evictions: 0,
        size: 50,
      });
    });

    it('should add 150 thoughts across 50 sessions at one lookup each', async () => {
      const sessions: { id: string }[] = [];
      for (let i = 0; i < 50; i++) {
        sessions.push(await manager.createSession());
      }

      const ledger = cacheLedger(manager);

      for (const session of sessions) {
        for (let i = 1; i <= 3; i++) {
          const thought = factory.createThought(createValidInput({
            thought: `Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 3,
            nextThoughtNeeded: i < 3,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      expect(ledger()).toMatchObject({ hits: 150, misses: 0, sets: 0, evictions: 0 });
    });

    it('should export each of 50 sessions at the same cost', async () => {
      const probes: ReadProbe<Thought>[] = [];
      const sessions: { id: string }[] = [];

      for (let i = 0; i < 50; i++) {
        const session = await manager.createSession();
        sessions.push(session);
        probes.push(await addProbedThought(session.id, {
          thought: `Session ${i} thought`,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
        }));
      }

      const before = probes.map((p) => p.reads);

      const exports: string[] = [];
      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        exports.push(exportService.exportSession(updated!, 'json'));
      }

      // Exporting the 50th session must cost exactly what exporting the 1st
      // cost. A regression that accumulates per-export state (rebuilding an
      // index over everything exported so far) makes the later sessions read
      // more than the earlier ones. This replaces `exportsPerSecond >= 25`.
      const perExportReads = probes.map((p, i) => p.reads - before[i]);
      expect(perExportReads[0]).toBeGreaterThan(0);
      expect(new Set(perExportReads).size).toBe(1);
      expect(exports).toHaveLength(50);
      expect(exports.every((e) => e.length > 0)).toBe(true);
    });
  });

  // ===========================================================================
  // T-PRF-009: Rapid mode switching
  //
  // Was: `switchesPerSecond >= 50`.
  // ===========================================================================
  describe('T-PRF-009: Rapid Mode Switching', () => {
    it('should not re-read the session when the mode changes', async () => {
      const session = await manager.createSession();
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal',
        'inductive', 'deductive', 'abductive', 'temporal', 'gametheory'] as const;

      const switchCount = 100;
      const ledger = cacheLedger(manager);

      // Probe the first thought. Every subsequent thought uses a different
      // mode from its predecessor, so if a mode change triggers any kind of
      // re-derivation over the stored thoughts, this counter moves.
      const first = await addProbedThought(session.id, {
        mode: modes[0],
        thought: `Mode ${modes[0]} thought`,
        thoughtNumber: 1,
        totalThoughts: switchCount,
      });
      const readsAfterInsert = first.reads;

      for (let i = 1; i < switchCount; i++) {
        const mode = modes[i % modes.length];
        const thought = factory.createThought(createValidInput({
          mode,
          thought: `Mode ${mode} thought`,
          thoughtNumber: i + 1,
          totalThoughts: switchCount,
          nextThoughtNeeded: i < switchCount - 1,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      expect(readsAfterInsert).toBeGreaterThan(0);
      expect(first.reads - readsAfterInsert).toBe(0);
      // A mode switch must not evict, reload, or re-write the session.
      expect(ledger()).toMatchObject({
        hits: switchCount,
        misses: 0,
        sets: 0,
        evictions: 0,
      });
    });

    it('should maintain correctness during rapid switching', async () => {
      const session = await manager.createSession();
      const modes = ['sequential', 'mathematics', 'bayesian'] as const;

      for (let i = 0; i < 30; i++) {
        const mode = modes[i % modes.length];
        const thought = factory.createThought(createValidInput({
          mode,
          thought: `Thought ${i} in ${mode}`,
          thoughtNumber: i + 1,
          totalThoughts: 30,
          nextThoughtNeeded: i < 29,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(30);

      // Verify modes alternate correctly
      for (let i = 0; i < 30; i++) {
        const expectedMode = modes[i % modes.length];
        expect(updated?.thoughts[i].mode.toLowerCase()).toBe(expectedMode);
      }
    });
  });

  // ===========================================================================
  // T-PRF-010: Bulk export operations
  //
  // Was: `duration < 2000` for six formats and `duration < 1000` for a batch.
  // Now: export work is linear in the number of thoughts, and independent of
  // how many sessions were exported before it.
  // ===========================================================================
  describe('T-PRF-010: Bulk Export Operations', () => {
    const formats = ['markdown', 'json', 'html', 'mermaid', 'dot', 'ascii'] as const;

    async function readsToExportSession(thoughtCount: number): Promise<number> {
      const session = await manager.createSession();
      const probes: ReadProbe<Thought>[] = [];

      for (let i = 1; i <= thoughtCount; i++) {
        probes.push(await addProbedThought(session.id, {
          thought: `Thought ${i} with sufficient content for meaningful export`,
          thoughtNumber: i,
          totalThoughts: thoughtCount,
          nextThoughtNeeded: i < thoughtCount,
        }));
      }

      const stored = await manager.getSession(session.id);
      const before = probes.reduce((sum, p) => sum + p.reads, 0);
      for (const format of formats) {
        exportService.exportSession(stored!, format);
      }
      return probes.reduce((sum, p) => sum + p.reads, 0) - before;
    }

    it('should export in work linear in the number of thoughts', async () => {
      const small = await readsToExportSession(50);
      const large = await readsToExportSession(100);

      // Doubling the thought count must roughly double the work, not
      // quadruple it. A quadratic exporter (re-walking the thought list per
      // thought, e.g. to resolve `revisesThought` references) lands at ~4.0.
      const ratio = large / small;
      expect(small).toBeGreaterThan(0);
      expect(ratio, `50 thoughts -> ${small} reads, 100 thoughts -> ${large} reads`)
        .toBeLessThan(2.5);
      expect(ratio).toBeGreaterThan(1.5);
    });

    it('should handle batch exports across sessions at constant cost each', async () => {
      const sessions: { id: string }[] = [];
      const firstThoughtProbes: ReadProbe<Thought>[] = [];

      // Create 20 sessions with 10 thoughts each
      for (let s = 0; s < 20; s++) {
        const session = await manager.createSession();
        sessions.push(session);

        for (let i = 1; i <= 10; i++) {
          const probe = await addProbedThought(session.id, {
            thought: `Session ${s} Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 10,
            nextThoughtNeeded: i < 10,
          });
          if (i === 1) firstThoughtProbes.push(probe);
        }
      }

      const before = firstThoughtProbes.map((p) => p.reads);

      const exports: string[] = [];
      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        exports.push(exportService.exportSession(updated!, 'json'));
      }

      const perExportReads = firstThoughtProbes.map((p, i) => p.reads - before[i]);
      expect(perExportReads[0]).toBeGreaterThan(0);
      expect(new Set(perExportReads).size).toBe(1);

      expect(exports).toHaveLength(20);
      exports.forEach((json, s) => {
        expect(json).toContain(`Session ${s} Thought 1`);
      });
    });
  });
});
