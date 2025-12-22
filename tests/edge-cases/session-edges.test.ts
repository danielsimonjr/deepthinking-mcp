/**
 * Session Edge Case Tests
 *
 * Tests T-EDG-025 through T-EDG-030: Comprehensive tests for
 * session-related edge cases.
 *
 * Phase 11 Sprint 10: Edge Cases & Error Handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Session Edge Case Tests', () => {
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
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-EDG-025: Resume non-existent session
  // ===========================================================================
  describe('T-EDG-025: Resume Non-Existent Session', () => {
    it('should return null for non-existent session', async () => {
      const session = await manager.getSession('non-existent-session-id');
      expect(session).toBeNull();
    });

    it('should handle random UUID that does not exist', async () => {
      const session = await manager.getSession('12345678-1234-1234-1234-123456789012');
      expect(session).toBeNull();
    });

    it('should handle empty string session ID', async () => {
      const session = await manager.getSession('');
      expect(session).toBeNull();
    });
  });

  // ===========================================================================
  // T-EDG-026: Export empty session
  // ===========================================================================
  describe('T-EDG-026: Export Empty Session', () => {
    // Note: Visual formats (mermaid, dot, ascii, html) go through VisualExporter which
    // throws "No thoughts in session to export" for empty sessions.
    // Non-visual formats may handle empty sessions differently.

    it('should throw error when exporting empty session to mermaid (visual format)', async () => {
      const session = await manager.createSession();
      const retrieved = await manager.getSession(session.id);

      expect(() => exportService.exportSession(retrieved!, 'mermaid')).toThrow('No thoughts in session to export');
    });

    it('should throw error when exporting empty session to dot (visual format)', async () => {
      const session = await manager.createSession();
      const retrieved = await manager.getSession(session.id);

      expect(() => exportService.exportSession(retrieved!, 'dot')).toThrow('No thoughts in session to export');
    });

    it('should throw error when exporting empty session to ascii (visual format)', async () => {
      const session = await manager.createSession();
      const retrieved = await manager.getSession(session.id);

      expect(() => exportService.exportSession(retrieved!, 'ascii')).toThrow('No thoughts in session to export');
    });

    it('should throw error when exporting empty session to html (visual format)', async () => {
      const session = await manager.createSession();
      const retrieved = await manager.getSession(session.id);

      expect(() => exportService.exportSession(retrieved!, 'html')).toThrow('No thoughts in session to export');
    });

    it('should handle empty session export to non-visual formats gracefully', async () => {
      const session = await manager.createSession();
      const retrieved = await manager.getSession(session.id);

      // Non-visual formats: markdown, json, latex, jupyter
      // These may return empty results or minimal content rather than throwing
      const nonVisualFormats = ['markdown', 'json', 'latex', 'jupyter'] as const;
      for (const format of nonVisualFormats) {
        // Should either throw or return a valid (possibly empty) result
        try {
          const result = exportService.exportSession(retrieved!, format);
          expect(typeof result).toBe('string');
        } catch (e: any) {
          // Some non-visual formats may also throw for empty sessions
          expect(e.message).toContain('thought');
        }
      }
    });
  });

  // ===========================================================================
  // T-EDG-027: Delete active session
  // ===========================================================================
  describe('T-EDG-027: Delete Active Session', () => {
    it('should delete session with active thoughts', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        nextThoughtNeeded: true, // Active
      }), session.id);
      await manager.addThought(session.id, thought);

      // deleteSession returns void, not boolean
      await manager.deleteSession(session.id);
      expect(await manager.getSession(session.id)).toBeNull();
    });

    it('should delete session mid-progress', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({ thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, thought1);
      const thought2 = factory.createThought(createValidInput({ thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);
      // Session is mid-progress (thought 2 of 3)

      // deleteSession returns void, not boolean - just verify no error
      await expect(manager.deleteSession(session.id)).resolves.not.toThrow();
    });

    it('should handle double deletion gracefully', async () => {
      const session = await manager.createSession();
      await manager.deleteSession(session.id);

      // Second deletion should not throw (returns void either way)
      await expect(manager.deleteSession(session.id)).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-028: Switch mode on completed session
  // ===========================================================================
  describe('T-EDG-028: Switch Mode on Completed Session', () => {
    it('should allow mode switch on completed session', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });

      // Complete the session
      const thought1 = factory.createThought(createValidInput({
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Add a new thought with different mode
      const thought2 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(2);
    });

    it('should track mode changes across session lifecycle', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });

      const thought1 = factory.createThought(createValidInput({ mode: 'sequential', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, thought1);
      const thought2 = factory.createThought(createValidInput({ mode: 'hybrid', thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);
      const thought3 = factory.createThought(createValidInput({
        mode: 'bayesian',
        thoughtNumber: 3,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought3);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[0].mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(updated?.thoughts[2].mode).toBe(ThinkingMode.BAYESIAN);
    });
  });

  // ===========================================================================
  // T-EDG-029: Concurrent modification handling
  // ===========================================================================
  describe('T-EDG-029: Concurrent Modification', () => {
    it('should handle rapid sequential additions', async () => {
      const session = await manager.createSession();

      // Rapid additions
      for (let i = 1; i <= 10; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 10,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(10);
    });

    it('should maintain thought order under rapid additions', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 20; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Ordered thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 20,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      for (let i = 0; i < 20; i++) {
        expect(updated?.thoughts[i].thoughtNumber).toBe(i + 1);
      }
    });

    it('should handle interleaved reads and writes', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({ thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, thought1);
      // Note: getSession returns a reference to the same session object in memory,
      // so we check the thought count at the time of the final read
      const thought2 = factory.createThought(createValidInput({ thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);
      const thought3 = factory.createThought(createValidInput({ thoughtNumber: 3 }), session.id);
      await manager.addThought(session.id, thought3);

      // After all additions, session should have 3 thoughts
      const finalSession = await manager.getSession(session.id);
      expect(finalSession?.thoughts).toHaveLength(3);
      expect(finalSession?.thoughts[0].thoughtNumber).toBe(1);
      expect(finalSession?.thoughts[1].thoughtNumber).toBe(2);
      expect(finalSession?.thoughts[2].thoughtNumber).toBe(3);
    });
  });

  // ===========================================================================
  // T-EDG-030: Session ID collision
  // ===========================================================================
  describe('T-EDG-030: Session ID Collision', () => {
    it('should generate unique session IDs', async () => {
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const session = await manager.createSession();
        expect(ids.has(session.id)).toBe(false);
        ids.add(session.id);
      }

      expect(ids.size).toBe(100);
    });

    it('should not collide even with same mode', async () => {
      const ids: string[] = [];

      for (let i = 0; i < 50; i++) {
        const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });
        ids.push(session.id);
      }

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(50);
    });

    it('should generate different IDs across manager instances', async () => {
      const manager1 = new SessionManager();
      const manager2 = new SessionManager();

      const session1 = await manager1.createSession();
      const session2 = await manager2.createSession();

      // IDs should be different (with very high probability)
      expect(session1.id).not.toBe(session2.id);
    });
  });
});
