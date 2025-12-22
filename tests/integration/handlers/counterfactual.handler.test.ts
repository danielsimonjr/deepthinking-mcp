/**
 * CounterfactualHandler Integration Tests
 *
 * Tests T-HDL-017 through T-HDL-020: Comprehensive tests for
 * CounterfactualHandler world state tracking and consequence analysis.
 *
 * Phase 11 Sprint 9: ModeHandler Specialized Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CounterfactualHandler } from '../../../src/modes/handlers/CounterfactualHandler.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('CounterfactualHandler Integration Tests', () => {
  let handler: CounterfactualHandler;

  beforeEach(() => {
    handler = new CounterfactualHandler();
  });

  function createInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Counterfactual analysis',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'counterfactual',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-HDL-017: World state tracking
  // ===========================================================================
  describe('T-HDL-017: World State Tracking', () => {
    it('should create thought with counterfactual scenario', () => {
      const input = createInput({
        actual: {
          id: 'actual-1',
          name: 'Delayed project',
          description: 'The project was delayed',
          conditions: [{ factor: 'start_date', value: 'late' }],
          outcomes: [],
        },
        counterfactuals: [{
          id: 'cf-1',
          name: 'On-time project',
          description: 'The project started on time',
          conditions: [{ factor: 'start_date', value: 'on_time', isIntervention: true }],
          outcomes: [{ description: 'Met deadline' }],
        }],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.actual).toBeDefined();
      expect(thought.actual?.description).toBe('The project was delayed');
    });

    it('should validate counterfactual structure', () => {
      const input = createInput({
        actual: {
          id: 'actual-1',
          name: 'Actual state',
          description: 'Actual state description',
          conditions: [],
          outcomes: [],
        },
        counterfactuals: [{
          id: 'cf-1',
          name: 'Hypothetical state',
          description: 'Hypothetical state description',
          conditions: [{ factor: 'change', value: 'new', isIntervention: true }],
          outcomes: [{ description: 'Expected consequence' }],
        }],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should handle missing counterfactual gracefully', () => {
      const input = createInput({});

      const thought = handler.createThought(input, 'session-1');
      expect(thought.mode).toBe(ThinkingMode.COUNTERFACTUAL);
    });
  });

  // ===========================================================================
  // T-HDL-018: Consequence analysis
  // ===========================================================================
  describe('T-HDL-018: Consequence Analysis', () => {
    it('should analyze counterfactual consequences', () => {
      const input = createInput({
        actual: {
          id: 'actual-1',
          name: 'Option A',
          description: 'We chose option A',
          conditions: [],
          outcomes: [{ description: 'Current outcome' }],
        },
        counterfactuals: [{
          id: 'cf-1',
          name: 'Option B',
          description: 'We chose option B',
          conditions: [{ factor: 'choice', value: 'B', isIntervention: true }],
          outcomes: [{ description: 'The outcome would have been different' }],
        }],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.counterfactuals?.[0]?.outcomes?.[0]?.description).toBeDefined();
    });

    it('should provide enhancements for counterfactual analysis', () => {
      const input = createInput({
        actual: {
          id: 'actual-1',
          name: 'Decision made',
          description: 'Decision made',
          conditions: [],
          outcomes: [{ description: 'Current result' }],
        },
        counterfactuals: [{
          id: 'cf-1',
          name: 'Alternative decision',
          description: 'Alternative decision',
          conditions: [{ factor: 'decision', value: 'alt', isIntervention: true }],
          outcomes: [{ description: 'Different outcome' }],
        }],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements).toBeDefined();
      expect(enhancements.relatedModes).toContain(ThinkingMode.CAUSAL);
    });

    it('should include guiding questions about alternatives', () => {
      const input = createInput({
        actual: {
          id: 'actual-1',
          name: 'Current state',
          description: 'Current state',
          conditions: [],
          outcomes: [{ description: 'Impact' }],
        },
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions?.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // T-HDL-019: Alternative comparison
  // ===========================================================================
  describe('T-HDL-019: Alternative Comparison', () => {
    it('should handle multiple alternative counterfactuals', () => {
      const input = createInput({
        actual: {
          id: 'actual-1',
          name: 'Current',
          description: 'Current scenario',
          conditions: [],
          outcomes: [],
        },
        counterfactuals: [
          { id: 'cf-1', name: 'Alt A', description: 'Alternative A', conditions: [], outcomes: [], likelihood: 0.7 },
          { id: 'cf-2', name: 'Alt B', description: 'Alternative B', conditions: [], outcomes: [], likelihood: 0.5 },
          { id: 'cf-3', name: 'Alt C', description: 'Alternative C', conditions: [], outcomes: [], likelihood: 0.3 },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.counterfactuals).toBeDefined();
      expect(thought.counterfactuals?.length).toBe(3);
    });

    it('should validate scenario likelihood range', () => {
      const input = createInput({
        counterfactuals: [
          { id: 'cf-1', name: 'Valid scenario', description: 'Valid', conditions: [], outcomes: [], likelihood: 0.8 },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should compare actual vs hypothetical scenarios', () => {
      const input = createInput({
        actual: {
          id: 'actual-1',
          name: 'Technology A',
          description: 'We used technology A',
          conditions: [],
          outcomes: [],
        },
        counterfactuals: [{
          id: 'cf-1',
          name: 'Technology B',
          description: 'We used technology B',
          conditions: [{ factor: 'technology', value: 'B', isIntervention: true }],
          outcomes: [{ description: 'Performance would have improved 20%' }],
        }],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.actual?.description).not.toBe(thought.counterfactuals?.[0]?.description);
    });
  });

  // ===========================================================================
  // T-HDL-020: Causal graph integration
  // ===========================================================================
  describe('T-HDL-020: Causal Graph Integration', () => {
    it('should integrate with causal nodes and edges', () => {
      const input = createInput({
        nodes: [
          { id: 'cause', name: 'Root Cause' },
          { id: 'effect', name: 'Final Effect' },
        ],
        edges: [
          { from: 'cause', to: 'effect' },
        ],
        counterfactual: {
          actual: 'Cause occurred',
          hypothetical: 'Cause prevented',
          consequence: 'Effect would not occur',
        },
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.mode).toBe(ThinkingMode.COUNTERFACTUAL);
    });

    it('should suggest causal mode for complex analysis', () => {
      const input = createInput({
        counterfactual: {
          actual: 'Complex scenario actual',
          hypothetical: 'Complex scenario hypothetical',
          consequence: 'Complex consequence',
        },
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.CAUSAL);
    });

    it('should support causal chains for reasoning', () => {
      const input = createInput({
        causalChains: [
          {
            id: 'chain-1',
            events: ['Event 1', 'Event 2', 'Event 3'],
            branchingPoint: 'Event 2',
          },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.causalChains).toBeDefined();
      expect(thought.causalChains?.length).toBe(1);
    });

    it('should validate causal chains array', () => {
      const input = createInput({
        causalChains: [{
          id: 'chain-1',
          events: ['Event A', 'Event B'],
          branchingPoint: 'Event A',
        }],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });
  });
});
