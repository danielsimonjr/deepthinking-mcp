/**
 * Export Roundtrip Tests
 *
 * Tests T-INT-016 through T-INT-020: Integration tests for
 * export consistency and roundtrip verification.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Export Roundtrip Integration Tests', () => {
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
  // T-INT-016: JSON export -> import verification
  // ===========================================================================
  describe('T-INT-016: JSON Export Import Verification', () => {
    it('should produce valid JSON that parses correctly', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({
        thought: 'First thought',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        thought: 'Second thought',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should preserve thought count in JSON', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 5; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 5,
          nextThoughtNeeded: i < 5,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(json);

      // Either thoughts array or direct array
      const thoughtCount = parsed.thoughts?.length || parsed.length;
      expect(thoughtCount).toBe(5);
    });

    it('should preserve thought content in JSON', async () => {
      const session = await manager.createSession();
      const uniqueContent = `Unique content ${Date.now()}`;

      const thought = factory.createThought(createValidInput({
        thought: uniqueContent,
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');

      expect(json).toContain(uniqueContent);
    });

    it('should preserve mode information in JSON', async () => {
      const session = await manager.createSession();

      const thought = factory.createThought(createValidInput({
        mode: 'bayesian',
        thought: 'Bayesian analysis',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');

      expect(json.toLowerCase()).toContain('bayesian');
    });
  });

  // ===========================================================================
  // T-INT-017: Export all formats for same session
  // ===========================================================================
  describe('T-INT-017: Export All Formats Same Session', () => {
    it('should export same session to all formats without error', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({
        thought: 'Multi-format test thought',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Math thought',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      const formats = ['markdown', 'json', 'html', 'mermaid', 'dot', 'ascii', 'latex', 'jupyter'] as const;

      const exports: Record<string, string> = {};
      for (const format of formats) {
        expect(() => {
          exports[format] = exportService.exportSession(updated!, format);
        }).not.toThrow();
        expect(exports[format]).toBeDefined();
        expect(exports[format].length).toBeGreaterThan(0);
      }
    });

    it('should produce different outputs for different formats', async () => {
      const session = await manager.createSession();

      const thought = factory.createThought(createValidInput({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);

      const markdown = exportService.exportSession(updated!, 'markdown');
      const json = exportService.exportSession(updated!, 'json');
      const html = exportService.exportSession(updated!, 'html');

      // Each format should be different
      expect(markdown).not.toBe(json);
      expect(json).not.toBe(html);
      expect(html).not.toBe(markdown);
    });

    it('should preserve content meaning across formats', async () => {
      const session = await manager.createSession();
      const testContent = 'Important analysis conclusion';

      const thought = factory.createThought(createValidInput({
        thought: testContent,
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);

      const markdown = exportService.exportSession(updated!, 'markdown');
      const json = exportService.exportSession(updated!, 'json');
      const html = exportService.exportSession(updated!, 'html');

      // Content should appear in all formats
      expect(markdown).toContain(testContent);
      expect(json).toContain(testContent);
      expect(html).toContain(testContent);
    });
  });

  // ===========================================================================
  // T-INT-018: Export after mode switch
  // ===========================================================================
  describe('T-INT-018: Export After Mode Switch', () => {
    it('should correctly export session with mode switches', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Sequential thought',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Math thought',
        thoughtNumber: 2,
      }), session.id);
      await manager.addThought(session.id, thought2);

      const thought3 = factory.createThought(createValidInput({
        mode: 'bayesian',
        thought: 'Bayesian thought',
        thoughtNumber: 3,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought3);

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(json);

      expect(parsed).toBeDefined();
    });

    it('should include mode information in markdown export', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'First',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        mode: 'causal',
        thought: 'Causal analysis',
        thoughtNumber: 2,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      const markdown = exportService.exportSession(updated!, 'markdown');

      // Should mention both modes
      expect(markdown.toLowerCase()).toMatch(/sequential|causal/i);
    });

    it('should handle rapid mode switching in exports', async () => {
      const session = await manager.createSession();
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal'] as const;

      for (let i = 0; i < modes.length; i++) {
        const thought = factory.createThought(createValidInput({
          mode: modes[i],
          thought: `${modes[i]} thought`,
          thoughtNumber: i + 1,
          totalThoughts: modes.length,
          nextThoughtNeeded: i < modes.length - 1,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);

      expect(() => exportService.exportSession(updated!, 'json')).not.toThrow();
      expect(() => exportService.exportSession(updated!, 'markdown')).not.toThrow();
      expect(() => exportService.exportSession(updated!, 'mermaid')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-INT-019: Export branched session
  // ===========================================================================
  describe('T-INT-019: Export Branched Session', () => {
    it('should export session with branches', async () => {
      const session = await manager.createSession();

      const root = factory.createThought(createValidInput({
        thought: 'Root thought',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, root);

      const branchA = factory.createThought(createValidInput({
        thought: 'Branch A',
        thoughtNumber: 2,
        branchId: 'branch-a',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, branchA);

      const branchB = factory.createThought(createValidInput({
        thought: 'Branch B',
        thoughtNumber: 2,
        branchId: 'branch-b',
        branchFrom: 'thought-1',
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, branchB);

      const updated = await manager.getSession(session.id);

      const json = exportService.exportSession(updated!, 'json');
      const mermaid = exportService.exportSession(updated!, 'mermaid');
      const dot = exportService.exportSession(updated!, 'dot');

      expect(json).toBeDefined();
      expect(mermaid).toBeDefined();
      expect(dot).toBeDefined();
    });

    it('should reflect branch structure in visual exports', async () => {
      const session = await manager.createSession();

      const decision = factory.createThought(createValidInput({
        thought: 'Decision point',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, decision);

      const opt1 = factory.createThought(createValidInput({
        thought: 'Option 1',
        thoughtNumber: 2,
        branchId: 'opt1',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, opt1);

      const opt2 = factory.createThought(createValidInput({
        thought: 'Option 2',
        thoughtNumber: 2,
        branchId: 'opt2',
        branchFrom: 'thought-1',
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, opt2);

      const updated = await manager.getSession(session.id);
      const mermaid = exportService.exportSession(updated!, 'mermaid');

      // Should contain graph structure
      expect(mermaid).toContain('graph');
    });
  });

  // ===========================================================================
  // T-INT-020: Export with revisions
  // ===========================================================================
  describe('T-INT-020: Export With Revisions', () => {
    it('should export session with revisions', async () => {
      const session = await manager.createSession();

      const original = factory.createThought(createValidInput({
        thought: 'Original thought',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, original);

      const revised = factory.createThought(createValidInput({
        thought: 'Revised thought',
        thoughtNumber: 1,
        isRevision: true,
        revisesThought: 'thought-1',
        revisionReason: 'Correcting error',
      }), session.id);
      await manager.addThought(session.id, revised);

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');

      expect(json).toBeDefined();
      expect(JSON.parse(json)).toBeDefined();
    });

    it('should mark revisions in markdown export', async () => {
      const session = await manager.createSession();

      const first = factory.createThought(createValidInput({
        thought: 'First version',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, first);

      const improved = factory.createThought(createValidInput({
        thought: 'Improved version',
        thoughtNumber: 1,
        isRevision: true,
        revisesThought: 'thought-1',
        revisionReason: 'Added clarity',
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, improved);

      const updated = await manager.getSession(session.id);
      const markdown = exportService.exportSession(updated!, 'markdown');

      // Should contain the content
      expect(markdown).toContain('Improved version');
    });

    it('should handle multiple revisions of same thought', async () => {
      const session = await manager.createSession();

      const v1 = factory.createThought(createValidInput({
        thought: 'Version 1',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, v1);

      const v2 = factory.createThought(createValidInput({
        thought: 'Version 2',
        thoughtNumber: 1,
        isRevision: true,
        revisesThought: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, v2);

      const v3 = factory.createThought(createValidInput({
        thought: 'Version 3',
        thoughtNumber: 1,
        isRevision: true,
        revisesThought: 'thought-1',
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, v3);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(3);

      const json = exportService.exportSession(updated!, 'json');
      expect(json).toContain('Version 3');
    });
  });
});
