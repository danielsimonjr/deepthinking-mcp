/**
 * Latency Performance Tests
 *
 * Tests T-PRF-001 through T-PRF-005: response-time characteristics of the
 * single-operation paths.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 *
 * 2026-08-07 — this file was entirely wall-clock (`expect(duration)
 * .toBeLessThan(100)` and friends). A millisecond budget on a single
 * `addThought()` call is the most load-sensitive assertion in the repo: the
 * operation takes microseconds, so the bound is almost pure scheduler noise,
 * and it fails whenever the machine is busy rather than when the code is
 * wrong. Each test now asserts the counted work behind the latency claim —
 * how many session-cache operations an operation performs, and how many times
 * it touches the data. See `helpers/work-probe.ts` for the rationale.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';
import type { Thought } from '../../src/types/core.js';
import { cacheLedger, probeReads, type ReadProbe } from './helpers/work-probe.js';

describe('Latency Performance Tests', () => {
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
      thought: 'Valid thought content for performance testing',
      thoughtNumber: 1,
      totalThoughts: 10,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  async function addProbedThought(
    sessionId: string,
    overrides: Partial<ThinkingToolInput> = {},
  ): Promise<ReadProbe<Thought>> {
    const probe = probeReads(factory.createThought(createValidInput(overrides), sessionId));
    await manager.addThought(sessionId, probe.value);
    return probe;
  }

  // ===========================================================================
  // T-PRF-001: Single thought cost
  //
  // Was: `duration < 100`.
  // ===========================================================================
  describe('T-PRF-001: Single Thought Cost', () => {
    it('should store a thought with exactly one session lookup', async () => {
      const session = await manager.createSession();
      const ledger = cacheLedger(manager);

      const thought = factory.createThought(createValidInput(), session.id);
      await manager.addThought(session.id, thought);

      // One lookup, no reload, no re-write. The path is a cache hit and an
      // array push; anything that adds a second lookup or a `miss` here has
      // changed the cost model of every thought the server ever stores.
      expect(ledger()).toEqual({
        sets: 0,
        hits: 1,
        misses: 0,
        deletes: 0,
        evictions: 0,
        size: 1,
      });
    });

    it('should store a thought with rich mode payload at the same cost', async () => {
      const session = await manager.createSession();
      const ledger = cacheLedger(manager);

      const thought = factory.createThought(createValidInput({
        mode: 'bayesian',
        thought: 'Complex Bayesian analysis with multiple factors',
        // Fields that the bayesian tool schema actually declares. The previous
        // version sent `priorProbability`/`posteriorProbability` (no such
        // fields) and bare strings for `evidence` (an array of objects). `tsc`
        // rejects all three, but `tsconfig.json` excludes `tests/` and vitest
        // transpiles without type-checking, so the "rich payload" this test
        // claims to exercise was silently malformed and the handler saw an
        // essentially empty bayesian thought.
        prior: { probability: 0.5, justification: 'Base rate' },
        evidence: [
          { id: 'e1', description: 'Evidence 1' },
          { id: 'e2', description: 'Evidence 2' },
          { id: 'e3', description: 'Evidence 3' },
        ],
        posterior: { probability: 0.75, calculation: 'Bayes rule' },
      }), session.id);
      await manager.addThought(session.id, thought);

      expect(ledger()).toMatchObject({ hits: 1, misses: 0, sets: 0 });

      const stored = await manager.getSession(session.id);
      expect(stored?.thoughts).toHaveLength(1);
    });

    it('should cost one lookup per thought in every mode', async () => {
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal'] as const;

      for (const mode of modes) {
        const session = await manager.createSession();
        const ledger = cacheLedger(manager);

        const thought = factory.createThought(createValidInput({ mode }), session.id);
        await manager.addThought(session.id, thought);

        expect(ledger(), `mode ${mode}`).toMatchObject({ hits: 1, misses: 0 });
      }
    });
  });

  // ===========================================================================
  // T-PRF-002: 10-thought session
  //
  // Was: `duration < 500`.
  // ===========================================================================
  describe('T-PRF-002: 10-Thought Session', () => {
    it('should cost exactly ten lookups for ten thoughts', async () => {
      const session = await manager.createSession();
      const ledger = cacheLedger(manager);
      const readsPerInsert: number[] = [];
      let firstProbe: ReadProbe<Thought> | undefined;

      for (let i = 1; i <= 10; i++) {
        const probe = await addProbedThought(session.id, {
          thought: `Thought ${i}`,
          thoughtNumber: i,
          nextThoughtNeeded: i < 10,
        });
        if (i === 1) firstProbe = probe;
        readsPerInsert.push(probe.reads);
      }

      expect(ledger()).toMatchObject({ hits: 10, misses: 0, sets: 0 });

      // Every insertion costs the same number of touches on the thought being
      // inserted...
      expect(readsPerInsert[0]).toBeGreaterThan(0);
      expect(new Set(readsPerInsert).size).toBe(1);

      // ...and, separately, an insertion must not touch what is already
      // stored. These are different failures: a regression that re-reads the
      // whole session on every insert leaves `readsPerInsert` perfectly flat
      // (each probe is sampled right after its own insert) and is only visible
      // as growth on the earlier probes.
      expect(firstProbe!.reads).toBe(readsPerInsert[0]);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(10);
    });

    it('should cost the same whether or not the mode changes', async () => {
      const alternating = await manager.createSession();
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal',
        'sequential', 'hybrid', 'mathematics', 'bayesian', 'causal'] as const;

      const alternatingLedger = cacheLedger(manager);
      for (let i = 0; i < modes.length; i++) {
        const thought = factory.createThought(createValidInput({
          mode: modes[i],
          thought: `${modes[i]} thought`,
          thoughtNumber: i + 1,
          nextThoughtNeeded: i < 9,
        }), alternating.id);
        await manager.addThought(alternating.id, thought);
      }
      const alternatingWork = alternatingLedger();

      const steady = await manager.createSession();
      const steadyLedger = cacheLedger(manager);
      for (let i = 0; i < modes.length; i++) {
        const thought = factory.createThought(createValidInput({
          mode: 'sequential',
          thought: 'sequential thought',
          thoughtNumber: i + 1,
          nextThoughtNeeded: i < 9,
        }), steady.id);
        await manager.addThought(steady.id, thought);
      }
      const steadyWork = steadyLedger();

      // Switching mode on every thought must not cost extra session work.
      expect(alternatingWork.hits).toBe(steadyWork.hits);
      expect(alternatingWork.misses).toBe(0);
      expect(steadyWork.misses).toBe(0);
    });
  });

  // ===========================================================================
  // T-PRF-003: Export cost
  //
  // Was: `duration < 200` per export.
  // ===========================================================================
  describe('T-PRF-003: Export Cost', () => {
    async function probedSession(thoughtCount: number): Promise<{
      id: string;
      probes: ReadProbe<Thought>[];
    }> {
      const session = await manager.createSession();
      const probes: ReadProbe<Thought>[] = [];
      for (let i = 1; i <= thoughtCount; i++) {
        probes.push(await addProbedThought(session.id, {
          thought: `Thought ${i} with some content for testing export performance`,
          thoughtNumber: i,
          totalThoughts: thoughtCount,
          nextThoughtNeeded: i < thoughtCount,
        }));
      }
      return { id: session.id, probes };
    }

    const formats = ['markdown', 'json', 'html', 'mermaid', 'dot', 'ascii'] as const;

    /**
     * Export a freshly built session of `thoughtCount` thoughts and report how
     * many times the exporter read each stored thought.
     *
     * Two things are worth asserting about that distribution, and they catch
     * different regressions:
     *  - the SPREAD across positions (does thought #20 cost more than #1?)
     *    catches an exporter that resolves cross-references by walking back
     *    over what came before;
     *  - the INVARIANCE with `thoughtCount` (does thought #1 cost more in a
     *    60-thought session than in a 20-thought one?) catches a uniform
     *    quadratic, which leaves the spread perfectly flat and so is invisible
     *    to the first check alone.
     */
    async function exportReadProfile(
      thoughtCount: number,
      format: (typeof formats)[number],
    ): Promise<{ perThought: number[]; min: number; max: number; output: string }> {
      const { id, probes } = await probedSession(thoughtCount);
      const stored = await manager.getSession(id);
      const before = probes.map((p) => p.reads);
      const output = exportService.exportSession(stored!, format);
      const perThought = probes.map((p, i) => p.reads - before[i]);
      return {
        perThought,
        min: Math.min(...perThought),
        max: Math.max(...perThought),
        output,
      };
    }

    it('should read every thought the same number of times when exporting JSON', async () => {
      const small = await exportReadProfile(20, 'json');
      const large = await exportReadProfile(60, 'json');

      expect(small.min).toBeGreaterThan(0);
      // Flat across positions...
      expect(new Set(small.perThought).size).toBe(1);
      // ...and unchanged when the session triples in size.
      expect({ min: large.min, max: large.max }).toEqual({ min: small.min, max: small.max });
      expect(small.output.length).toBeGreaterThan(0);
    });

    it('should read every thought the same number of times when exporting markdown', async () => {
      const small = await exportReadProfile(20, 'markdown');
      const large = await exportReadProfile(60, 'markdown');

      expect(small.min).toBeGreaterThan(0);
      expect(new Set(small.perThought).size).toBe(1);
      expect({ min: large.min, max: large.max }).toEqual({ min: small.min, max: small.max });
      expect(small.output.length).toBeGreaterThan(0);
    });

    it('should read each thought a bounded number of times in every format', async () => {
      // Not every format reads every thought identically — `mermaid` touches
      // the final thought once more than the rest, because the last node in a
      // chain is drawn without an outgoing edge. That is a legitimate constant
      // per-position difference, so this test asserts only the invariance:
      // quadrupling the session must not change what any single thought costs.
      for (const format of formats) {
        const small = await exportReadProfile(10, format);
        const large = await exportReadProfile(40, format);

        expect(small.min, `format ${format}`).toBeGreaterThan(0);
        expect(
          { min: large.min, max: large.max },
          `format ${format}: 10 thoughts [${small.min}..${small.max}], 40 thoughts [${large.min}..${large.max}]`,
        ).toEqual({ min: small.min, max: small.max });
      }
    });
  });

  // ===========================================================================
  // T-PRF-004: Mode switch cost
  //
  // Was: `duration < 50`.
  // ===========================================================================
  describe('T-PRF-004: Mode Switch Cost', () => {
    it('should not re-read stored thoughts when the mode changes', async () => {
      const session = await manager.createSession();

      const first = await addProbedThought(session.id, {
        mode: 'sequential',
        thought: 'Sequential',
        thoughtNumber: 1,
      });
      const readsAfterInsert = first.reads;

      const ledger = cacheLedger(manager);
      const thought2 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Mathematics',
        thoughtNumber: 2,
      }), session.id);
      await manager.addThought(session.id, thought2);

      expect(ledger()).toMatchObject({ hits: 1, misses: 0, sets: 0 });
      expect(readsAfterInsert).toBeGreaterThan(0);
      expect(first.reads - readsAfterInsert).toBe(0);
    });

    it('should cost one lookup per switch across five modes', async () => {
      const session = await manager.createSession();
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal'] as const;

      const warmup = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Initial',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, warmup);

      const ledger = cacheLedger(manager);
      for (let i = 0; i < modes.length; i++) {
        const thought = factory.createThought(createValidInput({
          mode: modes[i],
          thought: `Switch to ${modes[i]}`,
          thoughtNumber: i + 2,
          totalThoughts: modes.length + 1,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      expect(ledger()).toMatchObject({ hits: modes.length, misses: 0, sets: 0 });
    });
  });

  // ===========================================================================
  // T-PRF-005: Session resume cost
  //
  // Was: `duration < 100`.
  // ===========================================================================
  describe('T-PRF-005: Session Resume Cost', () => {
    it('should retrieve a session in a single cache hit', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 10; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 10,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const ledger = cacheLedger(manager);
      const retrieved = await manager.getSession(session.id);

      // Resume is one cache hit and no reconstruction. `misses: 0` is the
      // load-bearing half: a miss means the session fell out of memory and
      // was rebuilt, which is what a slow resume actually is.
      expect(ledger()).toMatchObject({ hits: 1, misses: 0, sets: 0 });
      expect(retrieved?.thoughts).toHaveLength(10);
    });

    it('should add to an existing session at the same cost as the first thought', async () => {
      const session = await manager.createSession();

      const firstProbe = await addProbedThought(session.id, {
        thought: 'Thought 1',
        thoughtNumber: 1,
        totalThoughts: 15,
      });
      const firstInsertReads = firstProbe.reads;

      for (let i = 2; i <= 10; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 15,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const ledger = cacheLedger(manager);
      const resumed = await addProbedThought(session.id, {
        thought: 'Resumed thought',
        thoughtNumber: 11,
        totalThoughts: 15,
      });

      expect(ledger()).toMatchObject({ hits: 1, misses: 0, sets: 0 });
      // The eleventh thought costs exactly what the first one cost.
      expect(resumed.reads).toBe(firstInsertReads);
      expect(firstProbe.reads).toBe(firstInsertReads);
    });

    it('should look a session up in constant work regardless of how many exist', async () => {
      // Create multiple sessions
      const sessions: { id: string }[] = [];
      for (let i = 0; i < 50; i++) {
        sessions.push(await manager.createSession());
      }

      const target = sessions[25];
      for (let i = 1; i <= 5; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 5,
        }), target.id);
        await manager.addThought(target.id, thought);
      }

      const ledger = cacheLedger(manager);
      const retrieved = await manager.getSession(target.id);

      // One hit whether the cache holds 1 session or 50. A linear scan would
      // still be "fast" in milliseconds at this size, which is exactly why the
      // old 100 ms bound could not see it.
      expect(ledger()).toMatchObject({ hits: 1, misses: 0, sets: 0 });
      expect(retrieved?.thoughts).toHaveLength(5);
    });
  });
});
