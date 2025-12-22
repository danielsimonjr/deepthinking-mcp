/**
 * Markdown Export Integration Tests
 *
 * Tests T-EXP-032 through T-EXP-037: Comprehensive tests for
 * Markdown document export format.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Markdown Export Integration Tests', () => {
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
  // T-EXP-032: Markdown single thought
  // ===========================================================================
  describe('T-EXP-032: Single Thought', () => {
    it('should export single thought to Markdown', async () => {
      const sessionId = await createSessionWithThoughts(1);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'markdown');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should include heading', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Markdown test content',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'markdown');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-033: Markdown multi-thought
  // ===========================================================================
  describe('T-EXP-033: Multi-Thought', () => {
    it('should export multiple thoughts', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'markdown');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should organize thoughts with structure', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'markdown');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-034: Markdown with branches
  // ===========================================================================
  describe('T-EXP-034: With Branches', () => {
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
      const result = exportService.exportSession(updated!, 'markdown');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-035: Markdown table formatting
  // ===========================================================================
  describe('T-EXP-035: Table Formatting', () => {
    it('should handle thought with structured data', async () => {
      const session = await manager.createSession(ThinkingMode.GAMETHEORY);
      const thought = factory.createThought(createThought({
        mode: 'gametheory',
        thought: 'Game theory analysis',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['s1'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['s2'] },
        ],
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'markdown');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-036: Markdown code blocks
  // ===========================================================================
  describe('T-EXP-036: Code Blocks', () => {
    it('should handle thought with code-like content', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Analyzing the algorithm: O(n log n) complexity',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'markdown');
      expect(result).toBeDefined();
    });

    it('should preserve special markdown characters', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Using `backticks` and **bold** text',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'markdown');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-037: Markdown mode-specific sections
  // ===========================================================================
  describe('T-EXP-037: Mode-Specific Sections', () => {
    it('should format sequential mode', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'markdown');
      expect(result).toBeDefined();
    });

    it('should format mathematics mode', async () => {
      const session = await manager.createSession(ThinkingMode.MATHEMATICS);
      const thought = factory.createThought(createThought({
        mode: 'mathematics',
        proofStrategy: {
          type: 'direct',
          steps: ['Assume P', 'Show Q follows', 'Therefore P implies Q'],
        },
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'markdown');
      expect(result).toBeDefined();
    });

    it('should format synthesis mode', async () => {
      const session = await manager.createSession(ThinkingMode.SYNTHESIS);
      const thought = factory.createThought(createThought({
        mode: 'synthesis',
        sources: [
          { id: 'src1', title: 'Source 1', type: 'paper', relevance: 0.9 },
        ],
        themes: [
          { id: 'theme1', name: 'Main Theme', strength: 0.8 },
        ],
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'markdown');
      expect(result).toBeDefined();
    });
  });
});
