/**
 * Regression tests for 2026-08-03 audit remediations (M-1, M-2, H-3)
 * scoped to src/session/manager.ts and src/config/index.ts.
 *
 * See docs/audits/2026-08-03-audit.md for the original findings.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';
import { getConfig, updateConfig, resetConfig } from '../../src/config/index.js';
import { ResourceLimitError } from '../../src/utils/errors.js';

function createValidInput(
  overrides: Partial<ThinkingToolInput> = {},
): ThinkingToolInput {
  return {
    thought: 'Valid thought content',
    thoughtNumber: 1,
    totalThoughts: 1,
    nextThoughtNeeded: false,
    mode: 'sequential',
    ...overrides,
  } as ThinkingToolInput;
}

describe('SessionManager audit remediations', () => {
  afterEach(() => {
    resetConfig();
    vi.useRealTimers();
  });

  // ===========================================================================
  // M-2: deleteSession() must clear meta-monitoring state
  // ===========================================================================
  describe('M-2: deleteSession() clears meta-monitoring state', () => {
    it('removes the session from meta-monitoring tracking on explicit delete', async () => {
      const manager = new SessionManager();
      const factory = new ThoughtFactory();

      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });
      const thought = factory.createThought(createValidInput(), session.id);
      await manager.addThought(session.id, thought);

      // Sanity check: meta-monitoring state was actually populated.
      expect(manager.getActiveMetaSessions()).toContain(session.id);

      await manager.deleteSession(session.id);

      // This is the bug: without the fix, deleteSession() never calls
      // clearMetaSession(), so the id lingers here forever.
      expect(manager.getActiveMetaSessions()).not.toContain(session.id);
    });

    it('quality metrics reset to neutral defaults after delete (history actually cleared)', async () => {
      const manager = new SessionManager();
      const factory = new ThoughtFactory();

      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });
      const thought = factory.createThought(createValidInput(), session.id);
      await manager.addThought(session.id, thought);

      await manager.deleteSession(session.id);

      const metrics = manager.calculateQualityMetrics(session.id);
      // calculateQualityMetrics() returns the neutral 0.5 baseline only when
      // sessionHistory has no entry for this id.
      expect(metrics.overallQuality).toBe(0.5);
      expect(metrics.logicalConsistency).toBe(0.5);
    });
  });

  // ===========================================================================
  // M-1: maxActiveSessions and sessionTimeoutMs must actually be wired up
  // ===========================================================================
  describe('M-1: maxActiveSessions is threaded from config into the LRU cache', () => {
    it('uses the documented default (100) as the real LRU cap, not the old hardcoded 1000', () => {
      resetConfig();
      const manager = new SessionManager();
      const stats = manager.getSessionCacheStats();
      expect(stats.maxSize).toBe(100);
      expect(stats.maxSize).toBe(getConfig().maxActiveSessions);
    });

    it('honors MCP_MAX_SESSIONS (via updateConfig) as the real cap', () => {
      updateConfig({ maxActiveSessions: 7 });
      const manager = new SessionManager();
      const stats = manager.getSessionCacheStats();
      expect(stats.maxSize).toBe(7);
    });
  });

  describe('M-1: sessionTimeoutMs actually expires sessions', () => {
    it('does nothing when sessionTimeoutMs is 0 (default / disabled)', async () => {
      resetConfig();
      expect(getConfig().sessionTimeoutMs).toBe(0);

      const manager = new SessionManager();
      const session = await manager.createSession();

      // Backdate updatedAt far into the past; with timeout disabled this must
      // have no effect at all.
      session.updatedAt = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

      const retrieved = await manager.getSession(session.id);
      expect(retrieved).not.toBeNull();
    });

    it('evicts a session from getSession() once it is older than sessionTimeoutMs', async () => {
      updateConfig({ sessionTimeoutMs: 50 });
      const manager = new SessionManager();

      const session = await manager.createSession();
      expect(await manager.getSession(session.id)).not.toBeNull();

      // Backdate updatedAt past the timeout window (equivalent to waiting,
      // without an actual sleep).
      session.updatedAt = new Date(Date.now() - 1000);

      const retrieved = await manager.getSession(session.id);
      expect(retrieved).toBeNull();

      // The expiry must also have evicted associated meta-monitoring state
      // (consistent with M-2's contract for any session removal).
      expect(manager.getActiveMetaSessions()).not.toContain(session.id);
    });

    it('treats an expired session as not-found for addThought() (SessionNotFoundError)', async () => {
      updateConfig({ sessionTimeoutMs: 50 });
      const manager = new SessionManager();
      const factory = new ThoughtFactory();

      const session = await manager.createSession();
      session.updatedAt = new Date(Date.now() - 1000);

      const thought = factory.createThought(createValidInput(), session.id);
      await expect(manager.addThought(session.id, thought)).rejects.toThrow(
        'Session not found',
      );
    });

    it('does not expire a session that was recently touched', async () => {
      updateConfig({ sessionTimeoutMs: 100_000 });
      const manager = new SessionManager();

      const session = await manager.createSession();
      const retrieved = await manager.getSession(session.id);
      expect(retrieved).not.toBeNull();
    });
  });

  // ===========================================================================
  // H-3: maxThoughtsInMemory must actually be enforced, not merely logged.
  // Real enforcement (reject once the configured per-session cap is reached)
  // rather than dropping/summarizing the oldest thoughts, because dropping
  // would corrupt id/thoughtNumber-based cross-references (revisesThought,
  // buildUpon, dependencies) that many downstream consumers (metrics,
  // exporters, proof decomposition) assume are stable — out of scope to
  // audit exhaustively within src/session/**. Rejecting new thoughts once
  // the cap is hit changes nothing about thoughts already stored.
  //
  // tests/performance/stress.test.ts's "10,000 thoughts" test now
  // explicitly declares config: { maxThoughtsInMemory: 10000 } to state its
  // precondition instead of relying on the previous absence of any limit.
  // ===========================================================================
  describe('H-3: maxThoughtsInMemory is enforced for real', () => {
    it('rejects a thought once the session is at its configured maxThoughtsInMemory', async () => {
      const manager = new SessionManager();
      const factory = new ThoughtFactory();
      const session = await manager.createSession({
        config: { maxThoughtsInMemory: 3 },
      });

      for (let i = 1; i <= 3; i++) {
        const thought = factory.createThought(
          createValidInput({
            thoughtNumber: i,
            totalThoughts: 3,
            nextThoughtNeeded: i < 3,
          }),
          session.id,
        );
        await manager.addThought(session.id, thought);
      }

      // The 4th thought must be rejected instead of silently accepted.
      const fourth = factory.createThought(
        createValidInput({ thoughtNumber: 4, totalThoughts: 4 }),
        session.id,
      );
      await expect(manager.addThought(session.id, fourth)).rejects.toThrow(
        ResourceLimitError,
      );

      // The 3 thoughts already stored must be untouched (not dropped).
      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(3);
      expect(updated?.thoughts[0].thoughtNumber).toBe(1);
      expect(updated?.thoughts[2].thoughtNumber).toBe(3);
    });

    it('enforces the documented default (1000) when a session does not override it', async () => {
      const manager = new SessionManager();
      const factory = new ThoughtFactory();
      const session = await manager.createSession();
      expect(session.config.maxThoughtsInMemory).toBe(1000);

      // Directly exercise the boundary without going through 1000 real
      // addThought() calls: seed session.thoughts with 1000 well-formed
      // thoughts (built via the same factory addThought() uses), then
      // verify the 1001st addThought() call is rejected.
      for (let i = 0; i < 1000; i++) {
        const seed = factory.createThought(
          createValidInput({ thoughtNumber: i + 1, totalThoughts: 1001 }),
          session.id,
        );
        session.thoughts.push(seed);
      }

      const overflow = factory.createThought(
        createValidInput({ thoughtNumber: 1001, totalThoughts: 1001 }),
        session.id,
      );
      await expect(manager.addThought(session.id, overflow)).rejects.toThrow(
        ResourceLimitError,
      );
    });

    it('allows a thought that brings the session exactly to its cap', async () => {
      const manager = new SessionManager();
      const factory = new ThoughtFactory();
      const session = await manager.createSession({
        config: { maxThoughtsInMemory: 2 },
      });

      const first = factory.createThought(
        createValidInput({ thoughtNumber: 1, totalThoughts: 2 }),
        session.id,
      );
      await manager.addThought(session.id, first);

      const second = factory.createThought(
        createValidInput({ thoughtNumber: 2, totalThoughts: 2 }),
        session.id,
      );
      await expect(
        manager.addThought(session.id, second),
      ).resolves.toBeDefined();

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(2);
    });
  });
});
