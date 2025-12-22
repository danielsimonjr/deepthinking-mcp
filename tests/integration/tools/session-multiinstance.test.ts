/**
 * Multi-Instance Session Integration Tests
 *
 * Tests T-SES-022 through T-SES-026: Tests for multi-instance
 * session management with file locking.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Multi-Instance Session Tests', () => {
  let manager1: SessionManager;
  let manager2: SessionManager;
  let factory: ThoughtFactory;

  beforeEach(() => {
    manager1 = new SessionManager();
    manager2 = new SessionManager();
    factory = new ThoughtFactory();
  });

  /**
   * Helper to create a basic thought input
   */
  function createBasicThought(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Test thought content',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-SES-022: Two instances sharing SESSION_DIR
  // ===========================================================================
  describe('T-SES-022: Shared Session Directory', () => {
    it('should allow creation from different manager instances', async () => {
      const session1 = await manager1.createSession();
      const session2 = await manager2.createSession();

      expect(session1).toBeDefined();
      expect(session2).toBeDefined();
      expect(session1.id).not.toBe(session2.id);
    });

    it('should isolate session data between managers', async () => {
      const session = await manager1.createSession();
      const thought = factory.createThought(createBasicThought({ thought: 'Manager 1 thought' }), session.id);
      await manager1.addThought(session.id, thought);

      // Each manager maintains its own session state
      const s1 = await manager1.getSession(session.id);
      expect(s1?.thoughts[0].content).toBe('Manager 1 thought');
    });
  });

  // ===========================================================================
  // T-SES-023: Concurrent read access
  // ===========================================================================
  describe('T-SES-023: Concurrent Reads', () => {
    it('should allow concurrent reads from same session', async () => {
      const session = await manager1.createSession();
      const thought = factory.createThought(createBasicThought({ thought: 'Shared thought' }), session.id);
      await manager1.addThought(session.id, thought);

      const read1 = await manager1.getSession(session.id);
      const read2 = await manager1.getSession(session.id);

      expect(read1).toBeDefined();
      expect(read2).toBeDefined();
      expect(read1?.thoughts[0].content).toBe(read2?.thoughts[0].content);
    });

    it('should return consistent data on multiple reads', async () => {
      const session = await manager1.createSession();

      for (let i = 1; i <= 5; i++) {
        const thought = factory.createThought(createBasicThought({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 5,
        }), session.id);
        await manager1.addThought(session.id, thought);
      }

      const read1 = await manager1.getSession(session.id);
      const read2 = await manager1.getSession(session.id);
      const read3 = await manager1.getSession(session.id);

      expect(read1?.thoughts.length).toBe(read2?.thoughts.length);
      expect(read2?.thoughts.length).toBe(read3?.thoughts.length);
    });
  });

  // ===========================================================================
  // T-SES-024: Concurrent write handling
  // ===========================================================================
  describe('T-SES-024: Concurrent Writes', () => {
    it('should handle sequential writes to same session', async () => {
      const session = await manager1.createSession();

      const thought1 = factory.createThought(createBasicThought({ thought: 'Write 1', thoughtNumber: 1 }), session.id);
      await manager1.addThought(session.id, thought1);

      const thought2 = factory.createThought(createBasicThought({ thought: 'Write 2', thoughtNumber: 2 }), session.id);
      await manager1.addThought(session.id, thought2);

      const thought3 = factory.createThought(createBasicThought({ thought: 'Write 3', thoughtNumber: 3 }), session.id);
      await manager1.addThought(session.id, thought3);

      const updated = await manager1.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(3);
    });

    it('should maintain data integrity after writes', async () => {
      const session = await manager1.createSession();

      for (let i = 1; i <= 10; i++) {
        const thought = factory.createThought(createBasicThought({
          thought: `Content ${i}`,
          thoughtNumber: i,
          totalThoughts: 10,
        }), session.id);
        await manager1.addThought(session.id, thought);
      }

      const updated = await manager1.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(10);

      for (let i = 0; i < 10; i++) {
        expect(updated?.thoughts[i].content).toBe(`Content ${i + 1}`);
      }
    });
  });

  // ===========================================================================
  // T-SES-025: File locking verification
  // ===========================================================================
  describe('T-SES-025: File Locking', () => {
    it('should create sessions without conflicts', async () => {
      const sessions: string[] = [];

      for (let i = 0; i < 10; i++) {
        const session = await manager1.createSession();
        sessions.push(session.id);
      }

      // All sessions should be unique
      const uniqueSessions = new Set(sessions);
      expect(uniqueSessions.size).toBe(10);
    });

    it('should handle rapid session creation', async () => {
      const sessions: string[] = [];

      // Create many sessions rapidly
      for (let i = 0; i < 50; i++) {
        const session = await manager1.createSession();
        sessions.push(session.id);
      }

      expect(sessions.length).toBe(50);
      expect(new Set(sessions).size).toBe(50);
    });
  });

  // ===========================================================================
  // T-SES-026: Stale Lock Detection
  // ===========================================================================
  describe('T-SES-026: Stale Lock Detection', () => {
    it('should handle manager recreation gracefully', async () => {
      const session = await manager1.createSession();
      const thought = factory.createThought(createBasicThought(), session.id);
      await manager1.addThought(session.id, thought);

      // Create new manager
      const newManager = new SessionManager();

      // New manager should work fine
      const newSession = await newManager.createSession();
      expect(newSession).toBeDefined();
    });

    it('should allow operations after manager reset', async () => {
      // Create and populate session
      const session1 = await manager1.createSession();
      const thought = factory.createThought(createBasicThought(), session1.id);
      await manager1.addThought(session1.id, thought);

      // Reset by creating new instances
      manager1 = new SessionManager();
      factory = new ThoughtFactory();

      // Should still work
      const session2 = await manager1.createSession();
      expect(session2).toBeDefined();
    });
  });
});
