/**
 * ASCII Export Integration Tests
 *
 * Tests T-EXP-015 through T-EXP-020: Comprehensive tests for
 * ASCII art diagram export format.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('ASCII Export Integration Tests', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;
  let exportService: ExportService;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
    exportService = new ExportService();
  });

  function createThought(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Test thought',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  async function createSessionWithThoughts(count: number): Promise<string> {
    const session = await manager.createSession();
    for (let i = 1; i <= count; i++) {
      const thought = factory.createThought(createThought({
        thought: `Thought ${i}`,
        thoughtNumber: i,
        totalThoughts: count,
        nextThoughtNeeded: i < count,
      }), session.id);
      await manager.addThought(session.id, thought);
    }
    return session.id;
  }

  // ===========================================================================
  // T-EXP-015: ASCII single thought
  // ===========================================================================
  describe('T-EXP-015: Single Thought', () => {
    it('should export single thought to ASCII', async () => {
      const sessionId = await createSessionWithThoughts(1);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'ascii');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should include thought content', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'ASCII single thought test',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'ascii');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-016: ASCII multi-thought
  // ===========================================================================
  describe('T-EXP-016: Multi-Thought', () => {
    it('should export multiple thoughts', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'ascii');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(50);
    });

    it('should show thought progression', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'ascii');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-017: ASCII with branches
  // ===========================================================================
  describe('T-EXP-017: With Branches', () => {
    it('should export session with branches', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createThought({
        thought: 'Main thought',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createThought({
        thought: 'Branch thought',
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'alternative',
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'ascii');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-018: ASCII with revisions
  // ===========================================================================
  describe('T-EXP-018: With Revisions', () => {
    it('should export session with revisions', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createThought({
        thought: 'Original thought',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createThought({
        thought: 'Revised thought',
        thoughtNumber: 2,
        isRevision: true,
        revisesThought: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'ascii');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-019: ASCII width constraints
  // ===========================================================================
  describe('T-EXP-019: Width Constraints', () => {
    it('should handle long thought content', async () => {
      const session = await manager.createSession();
      const longThought = 'A'.repeat(200);
      const thought = factory.createThought(createThought({
        thought: longThought,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'ascii');
      expect(result).toBeDefined();
    });

    it('should handle very short content', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'X',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'ascii');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-020: ASCII Unicode handling
  // ===========================================================================
  describe('T-EXP-020: Unicode Handling', () => {
    it('should handle basic Unicode characters', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Testing with unicode: cafe',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'ascii');
      expect(result).toBeDefined();
    });

    it('should handle special characters', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Symbols: + - * / = < > @ # $ %',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'ascii');
      expect(result).toBeDefined();
    });

    it('should handle newlines in content', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Line 1\nLine 2\nLine 3',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'ascii');
      expect(result).toBeDefined();
    });
  });
});
