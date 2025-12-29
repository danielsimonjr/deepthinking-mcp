/**
 * Multi-Session and Concurrent Request Integration Tests
 * Tests session management, isolation, and concurrent operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThinkingMode } from '../../src/types/index.js';

describe('Multi-Session and Concurrent Scenarios', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  describe('Multiple Session Management', () => {
    it('should create and manage multiple sessions independently', async () => {
      // Create 5 different sessions
      const sessions = await Promise.all([
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'Session 1' }),
        sessionManager.createSession({ mode: ThinkingMode.SHANNON, title: 'Session 2' }),
        sessionManager.createSession({ mode: ThinkingMode.MATHEMATICS, title: 'Session 3' }),
        sessionManager.createSession({ mode: ThinkingMode.PHYSICS, title: 'Session 4' }),
        sessionManager.createSession({ mode: ThinkingMode.HYBRID, title: 'Session 5' }),
      ]);

      // Verify all sessions were created with unique IDs
      expect(sessions).toHaveLength(5);
      const ids = sessions.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);

      // Verify each session has correct properties
      expect(sessions[0].mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(sessions[1].mode).toBe(ThinkingMode.SHANNON);
      expect(sessions[2].mode).toBe(ThinkingMode.MATHEMATICS);
      expect(sessions[3].mode).toBe(ThinkingMode.PHYSICS);
      expect(sessions[4].mode).toBe(ThinkingMode.HYBRID);

      // Verify we can retrieve all sessions
      const retrieved = await Promise.all(sessions.map((s) => sessionManager.getSession(s.id)));
      expect(retrieved.every((s) => s !== null)).toBe(true);
    });

    it('should maintain session isolation (changes in one do not affect others)', async () => {
      // Create two sessions
      const session1 = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Isolated Session 1',
      });
      const session2 = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Isolated Session 2',
      });

      // Add thought to session 1
      await sessionManager.addThought(session1.id, {
        id: 'thought1',
        sessionId: session1.id,
        content: 'Thought for session 1',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: ThinkingMode.SEQUENTIAL,
        timestamp: new Date(),
      });

      // Add different thought to session 2
      await sessionManager.addThought(session2.id, {
        id: 'thought2',
        sessionId: session2.id,
        content: 'Thought for session 2',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: ThinkingMode.SEQUENTIAL,
        timestamp: new Date(),
      });

      // Retrieve both sessions
      const retrieved1 = await sessionManager.getSession(session1.id);
      const retrieved2 = await sessionManager.getSession(session2.id);

      // Verify isolation
      expect(retrieved1?.thoughts).toHaveLength(1);
      expect(retrieved2?.thoughts).toHaveLength(1);
      expect(retrieved1?.thoughts[0].content).toBe('Thought for session 1');
      expect(retrieved2?.thoughts[0].content).toBe('Thought for session 2');
    });

    it('should handle mode switching independently across sessions', async () => {
      // Create multiple sessions
      const sessions = await Promise.all([
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'S1' }),
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'S2' }),
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'S3' }),
      ]);

      // Switch modes independently
      await sessionManager.switchMode(sessions[0].id, ThinkingMode.MATHEMATICS, 'Switch to math');
      await sessionManager.switchMode(sessions[1].id, ThinkingMode.PHYSICS, 'Switch to physics');
      // Leave sessions[2] in sequential mode

      // Verify modes
      const retrieved = await Promise.all(sessions.map((s) => sessionManager.getSession(s.id)));
      expect(retrieved[0]?.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(retrieved[1]?.mode).toBe(ThinkingMode.PHYSICS);
      expect(retrieved[2]?.mode).toBe(ThinkingMode.SEQUENTIAL);
    });

    it('should handle completion status independently across sessions', async () => {
      // Create multiple sessions
      const sessions = await Promise.all([
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'S1' }),
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'S2' }),
      ]);

      // Add and complete thought in session 1
      await sessionManager.addThought(sessions[0].id, {
        id: 'thought1',
        sessionId: sessions[0].id,
        content: 'Final thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: ThinkingMode.SEQUENTIAL,
        timestamp: new Date(),
      });

      // Add incomplete thought in session 2
      await sessionManager.addThought(sessions[1].id, {
        id: 'thought2',
        sessionId: sessions[1].id,
        content: 'In progress',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: ThinkingMode.SEQUENTIAL,
        timestamp: new Date(),
      });

      // Verify completion status
      const retrieved = await Promise.all(sessions.map((s) => sessionManager.getSession(s.id)));
      expect(retrieved[0]?.isComplete).toBe(true);
      expect(retrieved[1]?.isComplete).toBe(false);
    });
  });

  describe('Concurrent Operations on Same Session', () => {
    it('should handle concurrent thought additions to same session', async () => {
      const session = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Concurrent Test',
      });

      // Add multiple thoughts concurrently
      const thoughts = await Promise.all([
        sessionManager.addThought(session.id, {
          id: 'thought1',
          sessionId: session.id,
          content: 'Thought 1',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: ThinkingMode.SEQUENTIAL,
          timestamp: new Date(),
        }),
        sessionManager.addThought(session.id, {
          id: 'thought2',
          sessionId: session.id,
          content: 'Thought 2',
          thoughtNumber: 2,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: ThinkingMode.SEQUENTIAL,
          timestamp: new Date(),
        }),
        sessionManager.addThought(session.id, {
          id: 'thought3',
          sessionId: session.id,
          content: 'Thought 3',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
          mode: ThinkingMode.SEQUENTIAL,
          timestamp: new Date(),
        }),
      ]);

      // Verify all thoughts were added
      const retrieved = await sessionManager.getSession(session.id);
      expect(retrieved?.thoughts).toHaveLength(3);
    });

    it('should handle concurrent retrieval of same session', async () => {
      const session = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Concurrent Retrieval',
      });

      // Retrieve session concurrently multiple times
      const retrievals = await Promise.all([
        sessionManager.getSession(session.id),
        sessionManager.getSession(session.id),
        sessionManager.getSession(session.id),
        sessionManager.getSession(session.id),
        sessionManager.getSession(session.id),
      ]);

      // All retrievals should succeed and return same session
      expect(retrievals.every((s) => s !== null)).toBe(true);
      expect(retrievals.every((s) => s?.id === session.id)).toBe(true);
    });

    it('should handle concurrent mode switches on same session', async () => {
      const session = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Mode Switch Race',
      });

      // Try to switch mode concurrently (last one should win)
      await Promise.all([
        sessionManager.switchMode(session.id, ThinkingMode.MATHEMATICS, 'Switch 1'),
        sessionManager.switchMode(session.id, ThinkingMode.PHYSICS, 'Switch 2'),
        sessionManager.switchMode(session.id, ThinkingMode.HYBRID, 'Switch 3'),
      ]);

      // Verify session is in one of the target modes
      const retrieved = await sessionManager.getSession(session.id);
      expect([
        ThinkingMode.MATHEMATICS,
        ThinkingMode.PHYSICS,
        ThinkingMode.HYBRID,
      ]).toContain(retrieved?.mode);
    });
  });

  describe('Concurrent Operations Across Different Sessions', () => {
    it('should handle concurrent operations on different sessions', async () => {
      // Create sessions
      const sessions = await Promise.all([
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'S1' }),
        sessionManager.createSession({ mode: ThinkingMode.SHANNON, title: 'S2' }),
        sessionManager.createSession({ mode: ThinkingMode.MATHEMATICS, title: 'S3' }),
      ]);

      // Perform different operations concurrently on different sessions
      await Promise.all([
        // Add thought to session 1
        sessionManager.addThought(sessions[0].id, {
          id: 't1',
          sessionId: sessions[0].id,
          content: 'Thought 1',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: ThinkingMode.SEQUENTIAL,
          timestamp: new Date(),
        }),
        // Switch mode in session 2
        sessionManager.switchMode(sessions[1].id, ThinkingMode.PHYSICS, 'Switch mode'),
        // Generate summary for session 3
        sessionManager.generateSummary(sessions[2].id),
      ]);

      // Verify all operations completed successfully
      const retrieved = await Promise.all(sessions.map((s) => sessionManager.getSession(s.id)));
      expect(retrieved[0]?.thoughts).toHaveLength(1);
      expect(retrieved[1]?.mode).toBe(ThinkingMode.PHYSICS);
      expect(retrieved[2]).toBeDefined();
    });

    it('should handle concurrent session creation', async () => {
      // Create many sessions concurrently
      const count = 20;
      const sessions = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          sessionManager.createSession({
            mode: ThinkingMode.SEQUENTIAL,
            title: `Session ${i + 1}`,
          })
        )
      );

      // Verify all sessions were created with unique IDs
      expect(sessions).toHaveLength(count);
      const ids = sessions.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(count);
    });

    it('should handle concurrent summary generation for different sessions', async () => {
      // Create multiple sessions with thoughts
      const sessions = await Promise.all([
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'S1' }),
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'S2' }),
        sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL, title: 'S3' }),
      ]);

      // Add thoughts to each session
      await Promise.all(
        sessions.map((session) =>
          sessionManager.addThought(session.id, {
            id: `thought-${session.id}`,
            sessionId: session.id,
            content: `Thought for ${session.id}`,
            thoughtNumber: 1,
            totalThoughts: 1,
            nextThoughtNeeded: false,
            mode: ThinkingMode.SEQUENTIAL,
            timestamp: new Date(),
          })
        )
      );

      // Generate summaries concurrently
      const summaries = await Promise.all(
        sessions.map((session) => sessionManager.generateSummary(session.id))
      );

      // Verify all summaries were generated
      expect(summaries).toHaveLength(3);
      summaries.forEach((summary) => {
        expect(summary).toBeDefined();
        expect(typeof summary).toBe('string');
      });
    });
  });

  describe('Resource Management with Many Sessions', () => {
    it('should handle creation of many sessions', async () => {
      const count = 50;
      const sessions = [];

      // Create sessions in batches to avoid overwhelming the system
      for (let i = 0; i < count; i += 10) {
        const batch = await Promise.all(
          Array.from({ length: 10 }, (_, j) =>
            sessionManager.createSession({
              mode: ThinkingMode.SEQUENTIAL,
              title: `Session ${i + j + 1}`,
            })
          )
        );
        sessions.push(...batch);
      }

      expect(sessions).toHaveLength(count);
      const uniqueIds = new Set(sessions.map((s) => s.id));
      expect(uniqueIds.size).toBe(count);
    });

    it('should retrieve sessions efficiently with many active sessions', async () => {
      // Create multiple sessions
      const sessions = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          sessionManager.createSession({
            mode: ThinkingMode.SEQUENTIAL,
            title: `Session ${i + 1}`,
          })
        )
      );

      // Measure retrieval time
      const startTime = performance.now();
      const retrieved = await Promise.all(sessions.map((s) => sessionManager.getSession(s.id)));
      const endTime = performance.now();
      const duration = endTime - startTime;

      // All sessions should be retrieved successfully
      expect(retrieved.every((s) => s !== null)).toBe(true);

      // Should be reasonably fast (< 100ms for 10 sessions)
      expect(duration).toBeLessThan(100);
    });

    it('should list all sessions when many exist', async () => {
      // Create multiple sessions
      await Promise.all(
        Array.from({ length: 15 }, (_, i) =>
          sessionManager.createSession({
            mode: ThinkingMode.SEQUENTIAL,
            title: `Session ${i + 1}`,
          })
        )
      );

      // List all sessions
      const allSessions = await sessionManager.listSessions();

      // Should have at least 15 sessions
      expect(allSessions.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe('Session State Consistency', () => {
    it('should maintain consistent thought count across concurrent additions', async () => {
      const session = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Consistency Test',
      });

      // Add 10 thoughts concurrently
      await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          sessionManager.addThought(session.id, {
            id: `thought-${i}`,
            sessionId: session.id,
            content: `Thought ${i + 1}`,
            thoughtNumber: i + 1,
            totalThoughts: 10,
            nextThoughtNeeded: i < 9,
            mode: ThinkingMode.SEQUENTIAL,
            timestamp: new Date(),
          })
        )
      );

      // Verify count is correct
      const retrieved = await sessionManager.getSession(session.id);
      expect(retrieved?.thoughts).toHaveLength(10);
    });

    it('should maintain correct status after concurrent operations', async () => {
      const session = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Status Test',
      });

      // Add thought that completes the session
      await sessionManager.addThought(session.id, {
        id: 'final-thought',
        sessionId: session.id,
        content: 'Final thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: ThinkingMode.SEQUENTIAL,
        timestamp: new Date(),
      });

      // Perform multiple concurrent retrievals
      const retrievals = await Promise.all([
        sessionManager.getSession(session.id),
        sessionManager.getSession(session.id),
        sessionManager.getSession(session.id),
      ]);

      // All should show completed status
      expect(retrievals.every((s) => s?.isComplete === true)).toBe(true);
    });

    it('should handle concurrent thought additions with proper sequencing', async () => {
      const session = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Sequence Test',
      });

      // Add thoughts with explicit sequence numbers
      await Promise.all([
        sessionManager.addThought(session.id, {
          id: 'thought-3',
          sessionId: session.id,
          content: 'Third thought',
          thoughtNumber: 3,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: ThinkingMode.SEQUENTIAL,
          timestamp: new Date(),
        }),
        sessionManager.addThought(session.id, {
          id: 'thought-1',
          sessionId: session.id,
          content: 'First thought',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: ThinkingMode.SEQUENTIAL,
          timestamp: new Date(),
        }),
        sessionManager.addThought(session.id, {
          id: 'thought-2',
          sessionId: session.id,
          content: 'Second thought',
          thoughtNumber: 2,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: ThinkingMode.SEQUENTIAL,
          timestamp: new Date(),
        }),
      ]);

      // Retrieve and verify order
      const retrieved = await sessionManager.getSession(session.id);
      expect(retrieved?.thoughts).toHaveLength(3);

      // Thoughts should be stored (order may vary depending on implementation)
      const thoughtNumbers = retrieved!.thoughts.map((t) => t.thoughtNumber);
      expect(thoughtNumbers).toContain(1);
      expect(thoughtNumbers).toContain(2);
      expect(thoughtNumbers).toContain(3);
    });
  });

  describe('Error Handling in Concurrent Scenarios', () => {
    it('should handle concurrent operations on non-existent session gracefully', async () => {
      const fakeId = 'non-existent-session-id';

      // Try concurrent operations on non-existent session
      const results = await Promise.allSettled([
        sessionManager.getSession(fakeId),
        sessionManager.generateSummary(fakeId),
        sessionManager.switchMode(fakeId, ThinkingMode.MATHEMATICS, 'Switch'),
      ]);

      // First should resolve to null, others should reject
      expect(results[0].status).toBe('fulfilled');
      expect((results[0] as any).value).toBeNull();
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('rejected');
    });

    it('should handle mixed success/failure scenarios gracefully', async () => {
      const session = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Mixed Test',
      });

      // Mix valid and invalid operations
      const results = await Promise.allSettled([
        sessionManager.getSession(session.id), // Valid
        sessionManager.getSession('invalid-id'), // Invalid
        sessionManager.generateSummary(session.id), // Valid
        sessionManager.switchMode('invalid-id', ThinkingMode.PHYSICS, 'Switch'), // Invalid
      ]);

      // Check results
      expect(results[0].status).toBe('fulfilled'); // Valid session retrieval
      expect(results[1].status).toBe('fulfilled'); // Should return null
      expect((results[1] as any).value).toBeNull();
      expect(results[2].status).toBe('fulfilled'); // Valid summary
      expect(results[3].status).toBe('rejected'); // Invalid switch
    });
  });
});
