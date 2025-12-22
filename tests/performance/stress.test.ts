/**
 * Stress Tests
 *
 * Tests T-PRF-016 through T-PRF-020: Stress tests for
 * system stability under extreme load.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

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

  // ===========================================================================
  // T-PRF-016: 10,000 thoughts total
  // ===========================================================================
  describe('T-PRF-016: 10,000 Thoughts Total', () => {
    it('should handle 10,000 thoughts across sessions', async () => {
      const sessionCount = 100;
      const thoughtsPerSession = 100;
      const totalExpected = sessionCount * thoughtsPerSession;

      const sessions: { id: string }[] = [];
      let totalCreated = 0;

      const start = performance.now();

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

      const duration = performance.now() - start;

      expect(totalCreated).toBe(totalExpected);

      // Should complete in reasonable time (less than 30 seconds)
      expect(duration).toBeLessThan(30000);

      // Verify sample sessions
      const sampleSession = await manager.getSession(sessions[50].id);
      expect(sampleSession?.thoughts).toHaveLength(thoughtsPerSession);
    });

    it('should maintain data integrity with 10,000 thoughts', async () => {
      const session = await manager.createSession();

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
    });
  });

  // ===========================================================================
  // T-PRF-017: 100 concurrent sessions
  // ===========================================================================
  describe('T-PRF-017: 100 Concurrent Sessions', () => {
    it('should handle 100 concurrent sessions', async () => {
      const sessions: { id: string }[] = [];

      const start = performance.now();

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

      const duration = performance.now() - start;

      expect(sessions).toHaveLength(100);

      // Should complete in reasonable time
      expect(duration).toBeLessThan(10000);

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
      expect(exports.every(e => e.length > 0)).toBe(true);
    });
  });

  // ===========================================================================
  // T-PRF-018: Rapid create/delete cycles
  // ===========================================================================
  describe('T-PRF-018: Rapid Create/Delete Cycles', () => {
    it('should handle rapid create/delete cycles', async () => {
      const cycles = 1000;

      const start = performance.now();

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

      const duration = performance.now() - start;

      // Should complete quickly
      expect(duration).toBeLessThan(10000);
    });

    it('should not leak sessions during create/delete cycles', async () => {
      const cycles = 100;
      const keptSessions: { id: string }[] = [];

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

      // Verify kept sessions still exist
      expect(keptSessions).toHaveLength(10);
      for (const session of keptSessions) {
        expect(await manager.getSession(session.id)).not.toBeNull();
      }
    });

    it('should handle interleaved creates and deletes', async () => {
      const active: { id: string }[] = [];

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

      // All active sessions should be valid
      for (const session of active) {
        expect(await manager.getSession(session.id)).not.toBeNull();
      }
    });
  });

  // ===========================================================================
  // T-PRF-019: Extended runtime (24h - manual, simplified for automated)
  // ===========================================================================
  describe('T-PRF-019: Extended Runtime Simulation', () => {
    it('should handle simulated extended operations', async () => {
      // Simulate extended operation with many small operations
      const operationCount = 5000;

      const start = performance.now();

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
        } else {
          // Just create and delete
          await manager.deleteSession(session.id);
        }
      }

      const duration = performance.now() - start;

      // Should complete without errors
      expect(duration).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for 5000 operations

    it('should maintain stability over many operations', async () => {
      const iterations = 100;
      let errorCount = 0;

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
        } catch {
          errorCount++;
        }
      }

      expect(errorCount).toBe(0);
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
    });

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
      // Various edge cases
      const testCases = [
        { thought: '', expectValid: true }, // Empty might be handled
        { thought: 'Normal', expectValid: true },
        { thought: '🎉'.repeat(1000), expectValid: true }, // Unicode
        { thought: '\n'.repeat(1000), expectValid: true }, // Newlines
        { thought: '\t\t\t', expectValid: true }, // Tabs
      ];

      for (const tc of testCases) {
        const session = await manager.createSession();

        try {
          const thought = factory.createThought(createValidInput({
            thought: tc.thought || 'fallback',
            thoughtNumber: 1,
            totalThoughts: 1,
          }), session.id);
          await manager.addThought(session.id, thought);
        } catch {
          // Some edge cases may throw, that's OK
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
        expect(updated?.thoughts[0].content).toBe('After edge case');
      }
    });
  });
});
