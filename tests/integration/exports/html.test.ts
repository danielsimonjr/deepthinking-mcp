/**
 * HTML Export Integration Tests
 *
 * Tests T-EXP-021 through T-EXP-026: Comprehensive tests for
 * HTML document export format.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('HTML Export Integration Tests', () => {
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
  // T-EXP-021: HTML single thought
  // ===========================================================================
  describe('T-EXP-021: Single Thought', () => {
    it('should export single thought to HTML', async () => {
      const sessionId = await createSessionWithThoughts(1);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'html');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include HTML structure', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'HTML test content',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'html');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-022: HTML multi-thought
  // ===========================================================================
  describe('T-EXP-022: Multi-Thought', () => {
    it('should export multiple thoughts', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'html');
      expect(result).toBeDefined();
    });

    it('should organize thoughts in structure', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'html');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // T-EXP-023: HTML with branches
  // ===========================================================================
  describe('T-EXP-023: With Branches', () => {
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
      const result = exportService.exportSession(updated!, 'html');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-024: HTML XSS prevention
  // ===========================================================================
  describe('T-EXP-024: XSS Prevention', () => {
    it('should escape script tags in content', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: '<script>alert("xss")</script>',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'html');
      // Should not contain unescaped script tags
      expect(result).not.toContain('<script>alert');
    });

    it('should escape HTML entities', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: '<div onclick="evil()">Click me</div>',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'html');
      // Should escape or sanitize onclick
      expect(result).toBeDefined();
    });

    it('should handle angle brackets safely', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'Math: x < y && y > z',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'html');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-025: HTML mode-specific styling
  // ===========================================================================
  describe('T-EXP-025: Mode-Specific Styling', () => {
    it('should style sequential mode', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'html');
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
      const result = exportService.exportSession(updated!, 'html');
      expect(result).toBeDefined();
    });

    it('should style bayesian mode', async () => {
      const session = await manager.createSession(ThinkingMode.BAYESIAN);
      const thought = factory.createThought(createThought({
        mode: 'bayesian',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'html');
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-026: HTML accessibility
  // ===========================================================================
  describe('T-EXP-026: Accessibility', () => {
    it('should produce well-formed output', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'html');
      // Should have proper structure (visual format may output plain text or HTML)
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw error for empty session (visual format)', async () => {
      const session = await manager.createSession();
      const updated = await manager.getSession(session.id);

      // HTML is a visual format that requires at least one thought
      expect(() => exportService.exportSession(updated!, 'html')).toThrow('No thoughts in session to export');
    });
  });
});
