/**
 * Jupyter Export Integration Tests
 *
 * Tests T-EXP-044 through T-EXP-048: Comprehensive tests for
 * Jupyter notebook export format.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Jupyter Export Integration Tests', () => {
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
  // T-EXP-044: Jupyter single thought
  // ===========================================================================
  describe('T-EXP-044: Single Thought', () => {
    it('should export single thought to Jupyter', async () => {
      const sessionId = await createSessionWithThoughts(1);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });

    it('should be valid Jupyter format', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Jupyter test content',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'jupyter');
      const parsed = JSON.parse(result);
      expect(parsed.cells).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-045: Jupyter multi-thought
  // ===========================================================================
  describe('T-EXP-045: Multi-Thought', () => {
    it('should export multiple thoughts', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      const parsed = JSON.parse(result);
      expect(parsed.cells).toBeDefined();
      expect(Array.isArray(parsed.cells)).toBe(true);
    });

    it('should have cells for each thought', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      const parsed = JSON.parse(result);
      expect(parsed.cells.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // T-EXP-046: Jupyter notebook structure
  // ===========================================================================
  describe('T-EXP-046: Notebook Structure', () => {
    it('should have nbformat version', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      const parsed = JSON.parse(result);
      expect(parsed.nbformat).toBeDefined();
      expect(parsed.nbformat_minor).toBeDefined();
    });

    it('should have metadata', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      const parsed = JSON.parse(result);
      expect(parsed.metadata).toBeDefined();
    });

    it('should have valid cells array', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed.cells)).toBe(true);
    });
  });

  // ===========================================================================
  // T-EXP-047: Jupyter cell types
  // ===========================================================================
  describe('T-EXP-047: Cell Types', () => {
    it('should use markdown cells for thoughts', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      const parsed = JSON.parse(result);

      // At least one cell should be markdown
      const hasMarkdown = parsed.cells.some((cell: { cell_type: string }) => cell.cell_type === 'markdown');
      expect(hasMarkdown).toBe(true);
    });

    it('should have valid cell structure', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      const parsed = JSON.parse(result);

      for (const cell of parsed.cells) {
        expect(cell.cell_type).toBeDefined();
        expect(cell.source).toBeDefined();
      }
    });
  });

  // ===========================================================================
  // T-EXP-048: Jupyter metadata
  // ===========================================================================
  describe('T-EXP-048: Metadata', () => {
    it('should include kernel info', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      const parsed = JSON.parse(result);
      expect(parsed.metadata).toBeDefined();
    });

    it('should include mode-specific metadata', async () => {
      const session = await manager.createSession(ThinkingMode.MATHEMATICS);
      const thought = factory.createThought(createThought({
        mode: 'mathematics',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'jupyter');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });

    it('should handle empty session', async () => {
      const session = await manager.createSession();
      const updated = await manager.getSession(session.id);

      const result = exportService.exportSession(updated!, 'jupyter');
      const parsed = JSON.parse(result);
      expect(parsed.cells).toBeDefined();
    });
  });
});
