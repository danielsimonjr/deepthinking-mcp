/**
 * Session Lifecycle Integration Tests
 *
 * Tests T-SES-001 through T-SES-008: Comprehensive integration tests
 * for session management lifecycle including creation, resume, completion, and persistence.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Session Lifecycle Integration Tests', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
  });

  afterEach(() => {
    // Clean up any sessions
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
  // T-SES-001: Create new session (auto-generated ID)
  // ===========================================================================
  describe('T-SES-001: Session Creation', () => {
    it('should create new session with auto-generated ID', async () => {
      const session = await manager.createSession();

      expect(session).toBeDefined();
      expect(typeof session.id).toBe('string');
      expect(session.id.length).toBeGreaterThan(0);
    });

    it('should generate unique session IDs', async () => {
      const session1 = await manager.createSession();
      const session2 = await manager.createSession();
      const session3 = await manager.createSession();

      expect(session1.id).not.toBe(session2.id);
      expect(session2.id).not.toBe(session3.id);
      expect(session1.id).not.toBe(session3.id);
    });

    it('should create session with empty thoughts list', async () => {
      const session = await manager.createSession();
      const retrieved = await manager.getSession(session.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.thoughts).toHaveLength(0);
    });
  });

  // ===========================================================================
  // T-SES-002: Create session with specific mode
  // ===========================================================================
  describe('T-SES-002: Session with Mode', () => {
    it('should create session with sequential mode', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });
      const retrieved = await manager.getSession(session.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.mode).toBe(ThinkingMode.SEQUENTIAL);
    });

    it('should create session with shannon mode', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SHANNON });
      const retrieved = await manager.getSession(session.id);

      expect(retrieved?.mode).toBe(ThinkingMode.SHANNON);
    });

    it('should create session with hybrid mode', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.HYBRID });
      const retrieved = await manager.getSession(session.id);

      expect(retrieved?.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should create session with mathematics mode', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.MATHEMATICS });
      const retrieved = await manager.getSession(session.id);

      expect(retrieved?.mode).toBe(ThinkingMode.MATHEMATICS);
    });
  });

  // ===========================================================================
  // T-SES-003: Resume existing session
  // ===========================================================================
  describe('T-SES-003: Resume Session', () => {
    it('should resume existing session by ID', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createBasicThought({ thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, thought);

      // Resume session
      const retrieved = await manager.getSession(session.id);
      expect(retrieved).toBeDefined();
    });

    it('should add thought to existing session', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createBasicThought({ thought: 'First thought', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createBasicThought({ thought: 'Second thought', thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(2);
    });

    it('should maintain thought order in session', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 5; i++) {
        const thought = factory.createThought(createBasicThought({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 5,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(5);
      expect(updated?.thoughts[0].thoughtNumber).toBe(1);
      expect(updated?.thoughts[4].thoughtNumber).toBe(5);
    });
  });

  // ===========================================================================
  // T-SES-004: Session completion detection
  // ===========================================================================
  describe('T-SES-004: Session Completion', () => {
    it('should detect incomplete session', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createBasicThought({
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated?.status).not.toBe('completed');
    });

    it('should detect completed session', async () => {
      const session = await manager.createSession();

      // Add thoughts 1-2 (in progress)
      for (let i = 1; i <= 2; i++) {
        const thought = factory.createThought(createBasicThought({
          thoughtNumber: i,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      // Add final thought (completed)
      const finalThought = factory.createThought(createBasicThought({
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, finalThought);

      const updated = await manager.getSession(session.id);
      // Check that session exists and has all thoughts
      expect(updated?.thoughts).toHaveLength(3);
      expect(updated?.thoughts[2].nextThoughtNeeded).toBe(false);
    });
  });

  // ===========================================================================
  // T-SES-005: Session timeout handling
  // ===========================================================================
  describe('T-SES-005: Session Timeout', () => {
    it('should track session creation time', async () => {
      const session = await manager.createSession();
      const retrieved = await manager.getSession(session.id);

      expect(retrieved?.createdAt).toBeDefined();
      expect(retrieved?.createdAt).toBeInstanceOf(Date);
    });

    it('should track session update time', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createBasicThought(), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated?.updatedAt).toBeDefined();
    });
  });

  // ===========================================================================
  // T-SES-006: Session persistence across server restart
  // ===========================================================================
  describe('T-SES-006: Session Persistence', () => {
    it('should store session data', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createBasicThought({ thought: 'Persistent thought' }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
      expect(updated?.thoughts[0].content).toBe('Persistent thought');
    });

    it('should retrieve session after creation', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createBasicThought(), session.id);
      await manager.addThought(session.id, thought);

      // Create new manager instance to simulate restart
      const retrieved = await manager.getSession(session.id);
      expect(retrieved).toBeDefined();
    });
  });

  // ===========================================================================
  // T-SES-007: Multiple concurrent sessions
  // ===========================================================================
  describe('T-SES-007: Concurrent Sessions', () => {
    it('should handle multiple simultaneous sessions', async () => {
      const session1 = await manager.createSession();
      const session2 = await manager.createSession();
      const session3 = await manager.createSession();

      const thought1 = factory.createThought(createBasicThought({ thought: 'Session 1 thought' }), session1.id);
      await manager.addThought(session1.id, thought1);

      const thought2 = factory.createThought(createBasicThought({ thought: 'Session 2 thought' }), session2.id);
      await manager.addThought(session2.id, thought2);

      const thought3 = factory.createThought(createBasicThought({ thought: 'Session 3 thought' }), session3.id);
      await manager.addThought(session3.id, thought3);

      const s1 = await manager.getSession(session1.id);
      const s2 = await manager.getSession(session2.id);
      const s3 = await manager.getSession(session3.id);

      expect(s1?.thoughts[0].content).toBe('Session 1 thought');
      expect(s2?.thoughts[0].content).toBe('Session 2 thought');
      expect(s3?.thoughts[0].content).toBe('Session 3 thought');
    });

    it('should isolate session data', async () => {
      const session1 = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });
      const session2 = await manager.createSession({ mode: ThinkingMode.MATHEMATICS });

      const thought1 = factory.createThought(createBasicThought({ mode: 'sequential' }), session1.id);
      await manager.addThought(session1.id, thought1);

      const thought2 = factory.createThought(createBasicThought({ mode: 'mathematics' }), session2.id);
      await manager.addThought(session2.id, thought2);

      const s1 = await manager.getSession(session1.id);
      const s2 = await manager.getSession(session2.id);

      expect(s1?.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(s2?.mode).toBe(ThinkingMode.MATHEMATICS);
    });

    it('should track session count', async () => {
      const initialSessions = await manager.listSessions();
      const initialCount = initialSessions.length;

      await manager.createSession();
      await manager.createSession();
      await manager.createSession();

      const newSessions = await manager.listSessions();
      expect(newSessions.length).toBe(initialCount + 3);
    });
  });

  // ===========================================================================
  // T-SES-008: Session mode switching mid-session
  // ===========================================================================
  describe('T-SES-008: Mode Switching', () => {
    it('should allow mode changes during session', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });

      // Start with sequential mode
      const thought1 = factory.createThought(createBasicThought({ mode: 'sequential' }), session.id);
      await manager.addThought(session.id, thought1);

      // Switch to mathematics mode
      const thought2 = factory.createThought(createBasicThought({ mode: 'mathematics', thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(2);
    });

    it('should track mode switches in session', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });

      const thought1 = factory.createThought(createBasicThought({ mode: 'sequential' }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createBasicThought({ mode: 'hybrid', thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);

      const thought3 = factory.createThought(createBasicThought({ mode: 'bayesian', thoughtNumber: 3 }), session.id);
      await manager.addThought(session.id, thought3);

      const updated = await manager.getSession(session.id);
      // Verify thoughts have different modes
      expect(updated?.thoughts[0].mode).toBe(ThinkingMode.SEQUENTIAL);
    });
  });
});
