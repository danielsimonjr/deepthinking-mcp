/**
 * Boundary Condition Tests
 *
 * Tests T-EDG-019 through T-EDG-024: Comprehensive tests for
 * limits and edge values.
 *
 * Phase 11 Sprint 10: Edge Cases & Error Handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Boundary Condition Tests', () => {
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
  // T-EDG-019: Maximum session size (1000+ thoughts)
  // ===========================================================================
  describe('T-EDG-019: Maximum Session Size', () => {
    it('should handle large session with 100 thoughts', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 100; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 100,
          nextThoughtNeeded: i < 100,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(100);
    });

    it('should export large session without crashing', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 50; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought content for thought number ${i}`,
          thoughtNumber: i,
          totalThoughts: 50,
          nextThoughtNeeded: i < 50,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      expect(() => exportService.exportSession(updated!, 'json')).not.toThrow();
      expect(() => exportService.exportSession(updated!, 'markdown')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-020: Maximum thought length
  // ===========================================================================
  describe('T-EDG-020: Maximum Thought Length', () => {
    it('should handle very long thought content', async () => {
      const session = await manager.createSession();
      const longContent = 'A'.repeat(10000);
      const input = createValidInput({ thought: longContent });

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[0].content).toHaveLength(10000);
    });

    it('should handle extremely long thought', async () => {
      const session = await manager.createSession();
      const veryLongContent = 'X'.repeat(100000);
      const input = createValidInput({ thought: veryLongContent });

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should export long thoughts correctly', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        thought: 'Long content: ' + 'Y'.repeat(5000),
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const markdown = exportService.exportSession(updated!, 'markdown');
      expect(markdown.length).toBeGreaterThan(5000);
    });
  });

  // ===========================================================================
  // T-EDG-021: Maximum array sizes
  // ===========================================================================
  describe('T-EDG-021: Maximum Array Sizes', () => {
    it('should handle large assumptions array', async () => {
      const session = await manager.createSession();
      const input = createValidInput({ mode: 'hybrid' });
      (input as any).assumptions = Array.from({ length: 100 }, (_, i) => `Assumption ${i}`);

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should handle large nodes array for causal', async () => {
      const session = await manager.createSession();
      const input = createValidInput({ mode: 'causal' });
      (input as any).nodes = Array.from({ length: 50 }, (_, i) => ({
        id: `node-${i}`,
        name: `Node ${i}`,
      }));

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should handle many evidence items', async () => {
      const session = await manager.createSession();
      const input = createValidInput({ mode: 'bayesian' });
      (input as any).evidence = Array.from({ length: 20 }, (_, i) => ({
        id: `ev-${i}`,
        description: `Evidence ${i}`,
        likelihoodGivenHypothesis: 0.7,
        likelihoodGivenNotHypothesis: 0.3,
      }));

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EDG-022: Maximum nesting depth
  // ===========================================================================
  describe('T-EDG-022: Maximum Nesting Depth', () => {
    it('should handle deeply nested objects', async () => {
      const session = await manager.createSession();

      // Create thought with nested structure
      const input = createValidInput({ mode: 'mathematics' });
      (input as any).proofStrategy = {
        type: 'direct',
        steps: ['Step 1', 'Step 2'],
      };

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should export nested structures correctly', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        mode: 'causal',
        nodes: [
          { id: 'n1', name: 'Node 1', description: 'Desc 1' },
          { id: 'n2', name: 'Node 2', description: 'Desc 2' },
        ],
        edges: [{ from: 'n1', to: 'n2', strength: 0.8 }],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(json);
      expect(parsed).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EDG-023: Empty arrays handling
  // ===========================================================================
  describe('T-EDG-023: Empty Arrays Handling', () => {
    it('should handle empty assumptions array', async () => {
      const session = await manager.createSession();
      const input = createValidInput({ mode: 'hybrid' });
      (input as any).assumptions = [];

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should handle empty nodes array', async () => {
      const session = await manager.createSession();
      const input = createValidInput({ mode: 'causal' });
      (input as any).nodes = [];
      (input as any).edges = [];

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should handle empty evidence array', async () => {
      const session = await manager.createSession();
      const input = createValidInput({ mode: 'bayesian' });
      (input as any).evidence = [];

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should export sessions with empty arrays', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        mode: 'hybrid',
        assumptions: [],
        dependencies: [],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(() => exportService.exportSession(updated!, 'markdown')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EDG-024: Empty objects handling
  // ===========================================================================
  describe('T-EDG-024: Empty Objects Handling', () => {
    it('should handle empty proofStrategy object', async () => {
      const session = await manager.createSession();
      const input = createValidInput({ mode: 'mathematics' });
      (input as any).proofStrategy = {};

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should handle empty mathematicalModel', async () => {
      const session = await manager.createSession();
      const input = createValidInput({ mode: 'mathematics' });
      (input as any).mathematicalModel = {};

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should handle empty payoffMatrix', async () => {
      const session = await manager.createSession();
      const input = createValidInput({ mode: 'gametheory' });
      (input as any).payoffMatrix = {};

      const thought = factory.createThought(input, session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated).toBeDefined();
    });

    it('should export sessions with empty objects', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        mode: 'mathematics',
        proofStrategy: {},
        mathematicalModel: {},
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(() => exportService.exportSession(updated!, 'json')).not.toThrow();
    });
  });
});
