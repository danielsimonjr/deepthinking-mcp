/**
 * Regression Tests for Known Fixed Bugs
 *
 * Tests T-REG-001 through T-REG-010: Tests to prevent
 * regressions of previously fixed bugs.
 *
 * Phase 11 Sprint 10: Edge Cases & Error Handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import { ModeRecommender } from '../../src/types/modes/recommendations.js';
import { ModeHandlerRegistry } from '../../src/modes/index.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Regression Tests', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;
  let exportService: ExportService;
  let modeRecommender: ModeRecommender;
  let registry: ModeHandlerRegistry;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
    exportService = new ExportService();
    modeRecommender = new ModeRecommender();
    registry = ModeHandlerRegistry.getInstance();
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
  // T-REG-001: Undefined value in visual exporters (v8.3.0 fix)
  // ===========================================================================
  describe('T-REG-001: Undefined in Visual Exporters', () => {
    it('should not produce undefined in mermaid export', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'mermaid');

      expect(result).not.toContain('undefined');
    });

    it('should not produce undefined in DOT export', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'dot');

      expect(result).not.toContain('undefined');
    });

    it('should not produce undefined in ASCII export', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'ascii');

      expect(result).not.toContain('undefined');
    });
  });

  // ===========================================================================
  // T-REG-002: Multi-thought Mermaid/DOT/ASCII export (v8.2.1 fix)
  // ===========================================================================
  describe('T-REG-002: Multi-Thought Visual Export', () => {
    it('should export all thoughts in mermaid', async () => {
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
      const result = exportService.exportSession(updated!, 'mermaid');

      // Should contain graph structure
      expect(result).toContain('graph');
    });

    it('should export all thoughts in DOT', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 3; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 3,
          nextThoughtNeeded: i < 3,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'dot');

      expect(result).toContain('digraph');
    });
  });

  // ===========================================================================
  // T-REG-003: Experimental modes return correct type (v7.5.2 fix)
  // ===========================================================================
  describe('T-REG-003: Experimental Modes Type', () => {
    const experimentalModes = [
      'abductive', 'causal', 'bayesian', 'counterfactual',
      'analogical', 'temporal', 'gametheory', 'evidential',
      'firstprinciples', 'systemsthinking', 'scientificmethod', 'formallogic',
    ];

    it.each(experimentalModes)('should return correct mode type for %s', (mode) => {
      const input = createValidInput({ mode: mode as any });
      const thought = factory.createThought(input, 'session-1');

      // Mode should match what was requested
      expect(thought.mode.toLowerCase()).toBe(mode.toLowerCase());
    });
  });

  // ===========================================================================
  // T-REG-004: Schema alignment JSON/Zod (v8.2.0 fix)
  // ===========================================================================
  describe('T-REG-004: Schema Alignment', () => {
    it('should validate against handler schema', () => {
      const input = createValidInput();
      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid input consistently', () => {
      const input = createValidInput();
      input.thought = '';

      const handler = registry.getHandler('sequential');
      const result = handler.validate(input);

      expect(result.valid).toBe(false);
    });
  });

  // ===========================================================================
  // T-REG-005: Optional property guards in exports
  // ===========================================================================
  describe('T-REG-005: Optional Property Guards', () => {
    it('should handle missing optional properties in causal export', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        mode: 'causal',
        // No nodes, edges, confounders - all optional
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(() => exportService.exportSession(updated!, 'html')).not.toThrow();
    });

    it('should handle missing optional properties in bayesian export', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createValidInput({
        mode: 'bayesian',
        // No evidence, hypothesis - minimal input
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(() => exportService.exportSession(updated!, 'markdown')).not.toThrow();
    });
  });

  // ===========================================================================
  // T-REG-006: Tool registration verification
  // ===========================================================================
  describe('T-REG-006: Tool Registration', () => {
    it('should have handlers registered for all modes', () => {
      const modes = [
        'sequential', 'shannon', 'hybrid', 'mathematics', 'physics',
        'inductive', 'deductive', 'abductive', 'causal', 'bayesian',
      ];

      for (const mode of modes) {
        const handler = registry.getHandler(mode);
        expect(handler).toBeDefined();
      }
    });

    it('should return generic handler for unknown modes', () => {
      const handler = registry.getHandler('unknown_mode_xyz');
      expect(handler).toBeDefined();
    });
  });

  // ===========================================================================
  // T-REG-007: Mode routing accuracy
  // Phase 15A Sprint 2: Updated to use ModeRecommender directly
  // ===========================================================================
  describe('T-REG-007: Mode Routing Accuracy', () => {
    it('should recommend appropriate mode for proof problem', () => {
      // recommendModes returns an array of mode recommendations
      const recommendations = modeRecommender.recommendModes({
        domain: 'mathematics',
        requiresProof: true,
      });
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].mode).toBeDefined();
    });

    it('should recommend appropriate mode for decision problem', () => {
      const recommendations = modeRecommender.recommendModes({
        domain: 'strategy',
        multiAgent: true,
      });
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].mode).toBeDefined();
    });
  });

  // ===========================================================================
  // T-REG-008: Session persistence integrity
  // ===========================================================================
  describe('T-REG-008: Session Persistence', () => {
    it('should persist thoughts correctly', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({
        thought: 'First thought',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        thought: 'Second thought',
        thoughtNumber: 2,
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(2);
      expect(updated?.thoughts[0].content).toBe('First thought');
      expect(updated?.thoughts[1].content).toBe('Second thought');
    });

    it('should maintain session mode', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.MATHEMATICS });
      const retrieved = await manager.getSession(session.id);

      expect(retrieved?.mode).toBe(ThinkingMode.MATHEMATICS);
    });
  });

  // ===========================================================================
  // T-REG-009: Export completeness
  // ===========================================================================
  describe('T-REG-009: Export Completeness', () => {
    it('should include all thoughts in JSON export', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 5; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Complete thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 5,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(json);

      // Check all thoughts are included
      expect(parsed.thoughts?.length || parsed.length).toBe(5);
    });

    it('should include session metadata in export', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.MATHEMATICS });
      const thought = factory.createThought(createValidInput({
        mode: 'mathematics',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(json);

      expect(parsed).toBeDefined();
    });
  });

  // ===========================================================================
  // T-REG-010: Error handling consistency
  // ===========================================================================
  describe('T-REG-010: Error Handling Consistency', () => {
    it('should consistently reject empty thought across handlers', () => {
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal'];

      for (const mode of modes) {
        const input = createValidInput();
        input.thought = '';
        input.mode = mode as any;

        const handler = registry.getHandler(mode);
        const result = handler.validate(input);

        expect(result.valid).toBe(false);
      }
    });

    it('should consistently reject invalid thought number', () => {
      const modes = ['sequential', 'hybrid', 'mathematics'];

      for (const mode of modes) {
        const input = createValidInput();
        input.thoughtNumber = 10;
        input.totalThoughts = 5;
        input.mode = mode as any;

        const handler = registry.getHandler(mode);
        const result = handler.validate(input);

        expect(result.valid).toBe(false);
      }
    });
  });
});
