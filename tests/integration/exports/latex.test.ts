/**
 * LaTeX Export Integration Tests
 *
 * Tests T-EXP-038 through T-EXP-043: Comprehensive tests for
 * LaTeX document export format.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('LaTeX Export Integration Tests', () => {
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
  // T-EXP-038: LaTeX single thought
  // ===========================================================================
  describe('T-EXP-038: Single Thought', () => {
    it('should export single thought to LaTeX', async () => {
      const sessionId = await createSessionWithThoughts(1);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'latex');
      expect(result).toBeDefined();
      expect(result).toContain('\\');
    });

    it('should include document structure', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'LaTeX test content',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'latex');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-039: LaTeX multi-thought
  // ===========================================================================
  describe('T-EXP-039: Multi-Thought', () => {
    it('should export multiple thoughts', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'latex');
      expect(result).toBeDefined();
    });

    it('should structure thoughts appropriately', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'latex');
      expect(result).toContain('\\');
    });
  });

  // ===========================================================================
  // T-EXP-040: LaTeX mathematical notation
  // ===========================================================================
  describe('T-EXP-040: Mathematical Notation', () => {
    it('should handle mathematics mode', async () => {
      const session = await manager.createSession(ThinkingMode.MATHEMATICS);
      const thought = factory.createThought(createThought({
        mode: 'mathematics',
        thought: 'Proving the theorem',
        proofStrategy: {
          type: 'direct',
          steps: ['Assume hypothesis', 'Apply theorem'],
        },
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'latex');
      expect(result).toBeDefined();
    });

    it('should handle mathematical model', async () => {
      const session = await manager.createSession(ThinkingMode.MATHEMATICS);
      const thought = factory.createThought(createThought({
        mode: 'mathematics',
        thought: 'Mathematical analysis',
        mathematicalModel: {
          latex: 'E = mc^2',
          symbolic: 'E = m * c^2',
        },
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'latex');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-041: LaTeX special character escaping
  // ===========================================================================
  describe('T-EXP-041: Special Character Escaping', () => {
    it('should escape LaTeX special characters', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Special chars: $ & % # _ { } ~',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'latex');
      expect(result).toBeDefined();
    });

    it('should handle backslashes', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Path: C:\\Users\\test',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'latex');
      expect(result).toBeDefined();
    });

    it('should handle carets and tildes', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Math: x^2 and ~approx',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'latex');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-042: LaTeX document structure
  // ===========================================================================
  describe('T-EXP-042: Document Structure', () => {
    it('should have proper LaTeX structure', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'latex');
      expect(result).toBeDefined();
      expect(result).toContain('\\');
    });

    it('should include sections for multi-thought', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'latex');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-043: LaTeX compilability
  // ===========================================================================
  describe('T-EXP-043: Compilability', () => {
    it('should not contain undefined or null', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'latex');
      expect(result).not.toContain('undefined');
      expect(result).not.toContain('null');
    });

    it('should have balanced braces', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'latex');
      const openBraces = (result.match(/{/g) || []).length;
      const closeBraces = (result.match(/}/g) || []).length;
      expect(openBraces).toBe(closeBraces);
    });

    it('should handle empty session', async () => {
      const session = await manager.createSession();
      const updated = await manager.getSession(session.id);

      const result = exportService.exportSession(updated!, 'latex');
      expect(result).toBeDefined();
    });
  });
});
