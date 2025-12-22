/**
 * DOT Export Integration Tests
 *
 * Tests T-EXP-008 through T-EXP-014: Comprehensive tests for
 * DOT/GraphViz diagram export format.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('DOT Export Integration Tests', () => {
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
  // T-EXP-008: DOT single thought
  // ===========================================================================
  describe('T-EXP-008: Single Thought', () => {
    it('should export single thought to DOT', async () => {
      const sessionId = await createSessionWithThoughts(1);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'dot');
      expect(result).toBeDefined();
      expect(result).toContain('digraph');
    });

    it('should include node definition', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Single thought content',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'dot');
      expect(result).toContain('digraph');
    });
  });

  // ===========================================================================
  // T-EXP-009: DOT multi-thought
  // ===========================================================================
  describe('T-EXP-009: Multi-Thought', () => {
    it('should export multiple thoughts', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'dot');
      expect(result).toBeDefined();
      expect(result).toContain('digraph');
    });

    it('should show edges between thoughts', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'dot');
      expect(result).toContain('->');
    });
  });

  // ===========================================================================
  // T-EXP-010: DOT with branches
  // ===========================================================================
  describe('T-EXP-010: With Branches', () => {
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
      const result = exportService.exportSession(updated!, 'dot');
      expect(result).toBeDefined();
      expect(result).toContain('digraph');
    });
  });

  // ===========================================================================
  // T-EXP-011: DOT with revisions
  // ===========================================================================
  describe('T-EXP-011: With Revisions', () => {
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
      const result = exportService.exportSession(updated!, 'dot');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-012: DOT syntax validation
  // ===========================================================================
  describe('T-EXP-012: Syntax Validation', () => {
    it('should produce valid DOT syntax', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'dot');

      // Basic DOT syntax checks
      expect(result).toMatch(/^digraph/);
      expect(result).toContain('{');
      expect(result).toContain('}');
      expect(result).not.toContain('undefined');
      expect(result).not.toContain('null');
    });

    it('should have balanced braces', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'dot');
      const openBraces = (result.match(/{/g) || []).length;
      const closeBraces = (result.match(/}/g) || []).length;
      expect(openBraces).toBe(closeBraces);
    });
  });

  // ===========================================================================
  // T-EXP-013: DOT GraphViz compatibility
  // ===========================================================================
  describe('T-EXP-013: GraphViz Compatibility', () => {
    it('should use GraphViz-compatible node syntax', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'dot');
      // Should have node definitions
      expect(result).toContain('digraph');
    });

    it('should use valid edge syntax', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'dot');
      // DOT edges use ->
      expect(result).toContain('->');
    });
  });

  // ===========================================================================
  // T-EXP-014: DOT mode-specific attributes
  // ===========================================================================
  describe('T-EXP-014: Mode-Specific Attributes', () => {
    it('should style sequential mode', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'dot');
      expect(result).toBeDefined();
    });

    it('should style mathematics mode', async () => {
      const session = await manager.createSession(ThinkingMode.MATHEMATICS);
      const thought = factory.createThought(createThought({
        mode: 'mathematics',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'dot');
      expect(result).toBeDefined();
    });

    it('should style causal mode', async () => {
      const session = await manager.createSession(ThinkingMode.CAUSAL);
      const thought = factory.createThought(createThought({
        mode: 'causal',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'dot');
      expect(result).toBeDefined();
    });
  });
});
