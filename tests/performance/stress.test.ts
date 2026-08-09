/**
 * Stress Tests
 *
 * Tests T-PRF-016 through T-PRF-020: system stability under extreme load.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 *
 * 2026-08-07 — the stability assertions here used to be wall-clock budgets
 * (`expect(duration).toBeLessThan(30000)`), plus one that could not fail at
 * all (`expect(duration).toBeGreaterThan(0)` — `performance.now()` deltas are
 * always positive, so T-PRF-019 asserted nothing for its 5,000 operations).
 * They are replaced by exact session-cache operation ledgers and property-read
 * counters. See `helpers/work-probe.ts` for the rationale.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';
import type { Thought } from '../../src/types/core.js';
import { cacheLedger, probeReads, type ReadProbe } from './helpers/work-probe.js';

describe('Stress Tests', () => {
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

  async function addProbedThought(
    sessionId: string,
    overrides: Partial<ThinkingToolInput> = {},
  ): Promise<ReadProbe<Thought>> {
    const probe = probeReads(factory.createThought(createValidInput(overrides), sessionId));
    await manager.addThought(sessionId, probe.value);
    return probe;
  }

  // ===========================================================================
  // T-PRF-016: 10,000 thoughts total
  //
  // Was: `duration < 30000`. Now: 10,000 thoughts cost exactly 10,000 session
  // lookups and nothing else, and per-thought work never grows with the size
  // of the session.
  // ===========================================================================
  describe('T-PRF-016: 10,000 Thoughts Total', () => {
    it('should handle 10,000 thoughts across sessions at one lookup each', async () => {
      const sessionCount = 100;
      const thoughtsPerSession = 100;
      const totalExpected = sessionCount * thoughtsPerSession;

      const sessions: { id: string }[] = [];
      let totalCreated = 0;

      const ledger = cacheLedger(manager);

      for (let s = 0; s < sessionCount; s++) {
        const session = await manager.createSession();
        sessions.push(session);

        for (let i = 1; i <= thoughtsPerSession; i++) {
          const thought = factory.createThought(createValidInput({
            thought: `S${s}-T${i}`,
            thoughtNumber: i,
            totalThoughts: thoughtsPerSession,
            nextThoughtNeeded: i < thoughtsPerSession,
          }), session.id);
          await manager.addThought(session.id, thought);
          totalCreated++;
        }
      }

      expect(totalCreated).toBe(totalExpected);

      // 100 cache writes (one per session), 10,000 lookups (one per thought),
      // nothing reloaded and nothing evicted. This is the whole cost model of
      // the run, stated exactly, and it does not move with machine load the
      // way the previous 30-second budget did.
      expect(ledger()).toEqual({
        sets: sessionCount,
        hits: totalExpected,
        misses: 0,
        deletes: 0,
        evictions: 0,
        size: sessionCount,
      });

      // Verify sample sessions
      const sampleSession = await manager.getSession(sessions[50].id);
      expect(sampleSession?.thoughts).toHaveLength(thoughtsPerSession);
    }, 60000); // 10,000 thoughts across 100 sessions — the default 5s cap is a runtime limit, not a correctness one

    it('should keep per-thought work flat across 10,000 thoughts in one session', async () => {
      const session = await manager.createSession({
        config: { maxThoughtsInMemory: 10000 },
      });

      // Probe thoughts at the start and the middle of the session. Neither may
      // be read again once stored. A regression that walks `session.thoughts`
      // on each insertion turns the first probe's delta from 0 into ~9,999 —
      // and it does so on the very first run, on any machine, rather than only
      // once it is slow enough to blow a 30-second budget.
      const first = await addProbedThought(session.id, {
        thought: 'Thought-1-Content',
        thoughtNumber: 1,
        totalThoughts: 10000,
      });
      const readsAfterFirstInsert = first.reads;

      let middle: ReadProbe<Thought> | undefined;
      let readsAfterMiddleInsert = 0;

      for (let i = 2; i <= 10000; i++) {
        if (i === 5000) {
          middle = await addProbedThought(session.id, {
            thought: `Thought-${i}-Content`,
            thoughtNumber: i,
            totalThoughts: 10000,
          });
          readsAfterMiddleInsert = middle.reads;
        } else {
          const thought = factory.createThought(createValidInput({
            thought: `Thought-${i}-Content`,
            thoughtNumber: i,
            totalThoughts: 10000,
            nextThoughtNeeded: i < 10000,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      expect(readsAfterFirstInsert).toBeGreaterThan(0);
      expect(first.reads - readsAfterFirstInsert).toBe(0);
      expect(middle!.reads - readsAfterMiddleInsert).toBe(0);
    }, 60000); // 10,000 thoughts in one session — the default 5s cap is a runtime limit, not a correctness one

    it('should maintain data integrity with 10,000 thoughts', async () => {
      // Audit 2026-08-03 H-3: SessionManager now enforces maxThoughtsInMemory
      // (default 1000) for real, rejecting once a session is at capacity.
      // This test's intent — "the system can hold and retrieve 10,000
      // thoughts" — is unchanged; it now declares that precondition
      // explicitly instead of relying on the previous absence of any limit.
      const session = await manager.createSession({
        config: { maxThoughtsInMemory: 10000 },
      });

      for (let i = 1; i <= 10000; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought-${i}-Content`,
          thoughtNumber: i,
          totalThoughts: 10000,
          nextThoughtNeeded: i < 10000,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(10000);

      // Verify sample thoughts
      expect(updated?.thoughts[0].content).toContain('Thought-1-Content');
      expect(updated?.thoughts[999].content).toContain('Thought-1000-Content');
      expect(updated?.thoughts[9999].content).toContain('Thought-10000-Content');
    }, 60000); // 10,000 thoughts — the default 5s cap is a runtime limit, not a correctness one
  });

  // ===========================================================================
  // T-PRF-017: 100 concurrent sessions
  //
  // Was: `duration < 10000`.
  // ===========================================================================
  describe('T-PRF-017: 100 Concurrent Sessions', () => {
    it('should handle 100 concurrent sessions with no rework or eviction', async () => {
      const sessions: { id: string }[] = [];
      const ledger = cacheLedger(manager);

      // Create 100 sessions
      for (let i = 0; i < 100; i++) {
        sessions.push(await manager.createSession());
      }

      // Add thoughts to all sessions
      for (const session of sessions) {
        for (let i = 1; i <= 10; i++) {
          const thought = factory.createThought(createValidInput({
            thought: `Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 10,
            nextThoughtNeeded: i < 10,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      expect(sessions).toHaveLength(100);

      // 100 sessions is exactly the default `maxActiveSessions` cap, so all of
      // them must still be resident: zero evictions and zero misses. If the
      // cap or the eviction rule regresses, sessions start being dropped
      // mid-run and this fails immediately.
      expect(ledger()).toEqual({
        sets: 100,
        hits: 1000,
        misses: 0,
        deletes: 0,
        evictions: 0,
        size: 100,
      });

      // Verify all sessions
      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        expect(updated?.thoughts).toHaveLength(10);
      }
    });

    it('should support operations on all 100 sessions', async () => {
      const sessions: { id: string }[] = [];

      // Create and populate
      for (let i = 0; i < 100; i++) {
        const session = await manager.createSession();
        sessions.push(session);

        const thought = factory.createThought(createValidInput({
          thought: `Session ${i}`,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      // Export all
      const exports: string[] = [];
      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        exports.push(exportService.exportSession(updated!, 'json'));
      }

      expect(exports).toHaveLength(100);
      exports.forEach((json, i) => {
        expect(json).toContain(`Session ${i}`);
      });
    });
  });

  // ===========================================================================
  // T-PRF-018: Rapid create/delete cycles
  //
  // Was: `duration < 10000`. Now: the create/delete ledger balances exactly,
  // which is a far more direct statement of "nothing leaks" than elapsed time
  // ever was.
  // ===========================================================================
  describe('T-PRF-018: Rapid Create/Delete Cycles', () => {
    it('should balance the ledger over 1000 create/delete cycles', async () => {
      const cycles = 1000;
      const ledger = cacheLedger(manager);

      for (let i = 0; i < cycles; i++) {
        const session = await manager.createSession();

        const thought = factory.createThought(createValidInput({
          thought: `Cycle ${i}`,
          thoughtNumber: 1,
          totalThoughts: 1,
        }), session.id);
        await manager.addThought(session.id, thought);

        await manager.deleteSession(session.id);
      }

      // Per cycle: 1 set (create), 2 hits (addThought + the lookup inside
      // deleteSession), 1 delete. Nothing is evicted because at most one
      // session is ever resident, and the cache is empty at the end.
      expect(ledger()).toEqual({
        sets: cycles,
        hits: cycles * 2,
        misses: 0,
        deletes: cycles,
        evictions: 0,
        size: 0,
      });
    });

    it('should not leak sessions during create/delete cycles', async () => {
      const cycles = 100;
      const keptSessions: { id: string }[] = [];
      const ledger = cacheLedger(manager);

      for (let i = 0; i < cycles; i++) {
        const session = await manager.createSession();

        const thought = factory.createThought(createValidInput({
          thought: `Cycle ${i}`,
          thoughtNumber: 1,
          totalThoughts: 1,
        }), session.id);
        await manager.addThought(session.id, thought);

        if (i % 10 === 0) {
          // Keep every 10th session
          keptSessions.push(session);
        } else {
          await manager.deleteSession(session.id);
        }
      }

      // 100 created, 90 deleted, exactly 10 left resident — the deleted ones
      // are gone from the cache rather than merely unreferenced.
      expect(ledger()).toEqual({
        sets: 100,
        hits: 190,
        misses: 0,
        deletes: 90,
        evictions: 0,
        size: 10,
      });

      // Verify kept sessions still exist
      expect(keptSessions).toHaveLength(10);
      for (const session of keptSessions) {
        expect(await manager.getSession(session.id)).not.toBeNull();
      }
    });

    it('should handle interleaved creates and deletes', async () => {
      const active: { id: string }[] = [];
      const ledger = cacheLedger(manager);

      for (let i = 0; i < 500; i++) {
        // Create
        const session = await manager.createSession();
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: 1,
          totalThoughts: 1,
        }), session.id);
        await manager.addThought(session.id, thought);
        active.push(session);

        // Delete oldest if too many
        if (active.length > 50) {
          const oldest = active.shift()!;
          await manager.deleteSession(oldest.id);
        }
      }

      // Should have ~50 active sessions
      expect(active.length).toBeLessThanOrEqual(50);

      // 500 created, 450 explicitly deleted, 50 resident. The working set
      // never approaches the 100-session cap, so nothing may be evicted:
      // an eviction here would mean sessions the caller still holds were
      // silently discarded.
      expect(ledger()).toEqual({
        sets: 500,
        hits: 950,
        misses: 0,
        deletes: 450,
        evictions: 0,
        size: 50,
      });

      // All active sessions should be valid
      for (const session of active) {
        expect(await manager.getSession(session.id)).not.toBeNull();
      }
    });
  });

  // ===========================================================================
  // T-PRF-019: Extended runtime (24h - manual, simplified for automated)
  //
  // Was: `expect(duration).toBeGreaterThan(0)` — an assertion that cannot
  // fail. `performance.now()` is monotonic, so any completed run satisfies it;
  // 5,000 operations were exercised and nothing about them was checked.
  // ===========================================================================
  describe('T-PRF-019: Extended Runtime Simulation', () => {
    it('should account for every session over 5000 mixed operations', async () => {
      // Simulate extended operation with many small operations
      const operationCount = 5000;
      const ledger = cacheLedger(manager);

      let kept = 0;
      let exported = 0;
      let discarded = 0;

      for (let i = 0; i < operationCount; i++) {
        const session = await manager.createSession();

        // Mix of operations
        if (i % 3 === 0) {
          // Create and keep
          const thought = factory.createThought(createValidInput({
            thought: `Keep ${i}`,
            thoughtNumber: 1,
            totalThoughts: 1,
          }), session.id);
          await manager.addThought(session.id, thought);
          kept++;
        } else if (i % 3 === 1) {
          // Create, use, delete
          const thought = factory.createThought(createValidInput({
            thought: `Temp ${i}`,
            thoughtNumber: 1,
            totalThoughts: 1,
          }), session.id);
          await manager.addThought(session.id, thought);
          const updated = await manager.getSession(session.id);
          exportService.exportSession(updated!, 'json');
          await manager.deleteSession(session.id);
          exported++;
        } else {
          // Just create and delete
          await manager.deleteSession(session.id);
          discarded++;
        }
      }

      expect([kept, exported, discarded]).toEqual([1667, 1667, 1666]);

      const work = ledger();

      // Derived from the branch counts above, not from observation:
      //   sets   = one per created session                        = 5000
      //   hits   = kept (1 addThought)                            = 1667
      //          + exported (addThought + getSession + delete's
      //            internal lookup, 3 each)                       = 5001
      //          + discarded (delete's internal lookup, 1 each)   = 1666
      //   deletes = exported + discarded                          = 3333
      //   misses  = 0 — nothing is ever looked up after it is gone
      expect(work).toMatchObject({
        sets: 5000,
        hits: 8334,
        misses: 0,
        deletes: 3333,
      });

      // Conservation: every session written into the cache is now either
      // still resident, explicitly deleted, or evicted by the LRU cap. No
      // session may go missing from that accounting, and none may be counted
      // twice. This is what "ran 5,000 operations without losing anything"
      // means, and it is what the old `duration > 0` failed to say.
      expect(work.evictions + work.deletes + work.size).toBe(work.sets);
      expect(work.evictions).toBe(kept - work.size);
    }, 30000); // 30 second timeout for 5000 operations

    it('should maintain stability over many operations', async () => {
      const iterations = 100;
      const failures: string[] = [];

      for (let iter = 0; iter < iterations; iter++) {
        try {
          const session = await manager.createSession();

          for (let i = 1; i <= 10; i++) {
            const thought = factory.createThought(createValidInput({
              thought: `Iter ${iter} Thought ${i}`,
              thoughtNumber: i,
              totalThoughts: 10,
            }), session.id);
            await manager.addThought(session.id, thought);
          }

          const updated = await manager.getSession(session.id);
          exportService.exportSession(updated!, 'json');
          exportService.exportSession(updated!, 'markdown');

          await manager.deleteSession(session.id);
        } catch (error) {
          // Record what actually went wrong. The previous version counted
          // errors into a bare integer and asserted it was 0, so a failure
          // reported "expected 1 to be 0" and discarded the only diagnostic
          // information it had.
          failures.push(`iteration ${iter}: ${(error as Error).message}`);
        }
      }

      expect(failures).toEqual([]);
    });
  });

  // ===========================================================================
  // T-PRF-020: Recovery from resource exhaustion
  // ===========================================================================
  describe('T-PRF-020: Resource Exhaustion Recovery', () => {
    it('should recover after high load', async () => {
      // Create high load
      const sessions: { id: string }[] = [];

      for (let i = 0; i < 200; i++) {
        const session = await manager.createSession();
        sessions.push(session);

        for (let j = 1; j <= 50; j++) {
          const thought = factory.createThought(createValidInput({
            thought: 'X'.repeat(500),
            thoughtNumber: j,
            totalThoughts: 50,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      // Clean up
      for (const session of sessions) {
        await manager.deleteSession(session.id);
      }

      // Every session is gone: the 100 still resident were deleted, the
      // earlier 100 had already been evicted by the cap.
      expect(manager.getSessionCacheStats().size).toBe(0);

      // System should recover and work normally
      const newSession = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        thought: 'Recovery test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), newSession.id);
      await manager.addThought(newSession.id, thought);

      const updated = await manager.getSession(newSession.id);
      expect(updated?.thoughts).toHaveLength(1);
      expect(updated?.thoughts[0].content).toBe('Recovery test');
    }, 30000); // high-load recovery — the default 5s cap is a runtime limit, not a correctness one

    it('should handle large content gracefully', async () => {
      const session = await manager.createSession();

      // Test with content within the 100KB limit
      const largeContent = 'A'.repeat(90000); // 90KB - within limit

      const thought = factory.createThought(createValidInput({
        thought: largeContent,
        thoughtNumber: 1,
        totalThoughts: 1,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(1);
      expect(updated?.thoughts[0].content).toHaveLength(90000);
    });

    it('should reject content exceeding max length', async () => {
      const session = await manager.createSession();

      // Content exceeding 100KB limit should be rejected
      const oversizedContent = 'A'.repeat(150000); // 150KB - over limit

      await expect(async () => {
        const thought = factory.createThought(createValidInput({
          thought: oversizedContent,
          thoughtNumber: 1,
          totalThoughts: 1,
        }), session.id);
        await manager.addThought(session.id, thought);
      }).rejects.toThrow();
    });

    it('should continue operating after edge cases', async () => {
      // Various edge cases. The previous version carried an `expectValid`
      // field on each case that nothing ever read, and swallowed every error
      // without recording it — so a case that started throwing would have
      // changed nothing observable. Each case now states what it expects.
      const testCases: { label: string; thought: string }[] = [
        { label: 'empty', thought: '' },
        { label: 'normal', thought: 'Normal' },
        { label: 'unicode', thought: '🎉'.repeat(1000) },
        { label: 'newlines', thought: '\n'.repeat(1000) },
        { label: 'tabs', thought: '\t\t\t' },
      ];
      const accepted: string[] = [];

      for (const tc of testCases) {
        const session = await manager.createSession();

        try {
          const thought = factory.createThought(createValidInput({
            thought: tc.thought,
            thoughtNumber: 1,
            totalThoughts: 1,
          }), session.id);
          await manager.addThought(session.id, thought);
          accepted.push(tc.label);
        } catch {
          // Recorded below rather than discarded, so a case that starts or
          // stops throwing is visible instead of silently absorbed.
        }

        // System should still work after
        const newSession = await manager.createSession();
        const thought = factory.createThought(createValidInput({
          thought: 'After edge case',
          thoughtNumber: 1,
          totalThoughts: 1,
        }), newSession.id);
        await manager.addThought(newSession.id, thought);

        const updated = await manager.getSession(newSession.id);
        expect(updated?.thoughts[0].content, `recovery after ${tc.label}`).toBe('After edge case');
      }

      // Which inputs the pipeline accepts is pinned rather than swallowed, so
      // a change in acceptance has to update this line instead of passing
      // unnoticed.
      //
      // NOTE the asymmetry this exposed, which the old swallow-everything
      // version hid: an EMPTY thought is accepted, but a whitespace-only one
      // ('\n' x 1000, '\t\t\t') is rejected. Both carry the same amount of
      // information. The old test could not have found this — it substituted
      // `tc.thought || 'fallback'`, so the empty case never ran at all, and
      // it discarded every rejection. Reported, not fixed here: the fix
      // belongs in the content validator, which this agent does not own.
      expect(accepted).toEqual(['empty', 'normal', 'unicode']);
    });
  });
});
