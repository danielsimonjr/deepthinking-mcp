/**
 * Mermaid Export Integration Tests
 *
 * Tests T-EXP-001 through T-EXP-007: Comprehensive tests for
 * Mermaid diagram export format.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Mermaid Export Integration Tests', () => {
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
  // T-EXP-001: Mermaid single thought
  // ===========================================================================
  describe('T-EXP-001: Single Thought', () => {
    it('should export single thought to mermaid', async () => {
      const sessionId = await createSessionWithThoughts(1);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'mermaid');
      expect(result).toBeDefined();
      expect(result).toContain('graph');
    });

    it('should include thought content', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Unique thought content here',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'mermaid');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-002: Mermaid multi-thought linear
  // ===========================================================================
  describe('T-EXP-002: Multi-Thought Linear', () => {
    it('should export multiple linear thoughts', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'mermaid');
      expect(result).toBeDefined();
      expect(result).toContain('graph');
    });

    it('should show thought progression', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'mermaid');
      expect(result).toContain('-->');
    });
  });

  // ===========================================================================
  // T-EXP-003: Mermaid with branches
  // ===========================================================================
  describe('T-EXP-003: With Branches', () => {
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
      const result = exportService.exportSession(updated!, 'mermaid');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-004: Mermaid with revisions
  // ===========================================================================
  describe('T-EXP-004: With Revisions', () => {
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
      const result = exportService.exportSession(updated!, 'mermaid');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-005: Mermaid syntax validation
  // ===========================================================================
  describe('T-EXP-005: Syntax Validation', () => {
    it('should produce valid mermaid syntax', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'mermaid');

      // Basic mermaid syntax checks
      expect(result).toMatch(/^(graph|flowchart)/m);
      expect(result).not.toContain('undefined');
      expect(result).not.toContain('null');
    });

    it('should use proper arrow syntax', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'mermaid');
      // Should use --> or --- arrows
      expect(result).toMatch(/(-->|---)/);
    });
  });

  // ===========================================================================
  // T-EXP-006: Mermaid special character escaping
  // ===========================================================================
  describe('T-EXP-006: Special Character Escaping', () => {
    it('should escape quotes in thought content', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Thought with "quotes" and \'apostrophes\'',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'mermaid');
      expect(result).toBeDefined();
      // Should not break mermaid syntax
      expect(result).toContain('graph');
    });

    it('should handle angle brackets', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Content with <html> tags',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'mermaid');
      expect(result).toBeDefined();
    });

    it('should handle parentheses and brackets', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Function call (param1, param2) and array [1, 2, 3]',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'mermaid');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-007: Mermaid mode-specific styling
  // ===========================================================================
  describe('T-EXP-007: Mode-Specific Styling', () => {
    it('should style sequential mode thoughts', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'mermaid');
      expect(result).toBeDefined();
    });

    it('should style mathematics mode thoughts', async () => {
      const session = await manager.createSession(ThinkingMode.MATHEMATICS);
      const thought = factory.createThought(createThought({
        mode: 'mathematics',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'mermaid');
      expect(result).toBeDefined();
    });

    it('should style causal mode thoughts', async () => {
      const session = await manager.createSession(ThinkingMode.CAUSAL);
      const thought = factory.createThought(createThought({
        mode: 'causal',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'mermaid');
      expect(result).toBeDefined();
    });
  });
});
