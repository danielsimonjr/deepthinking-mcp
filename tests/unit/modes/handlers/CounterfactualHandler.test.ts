/**
 * CounterfactualHandler Unit Tests - Phase 10 Sprint 2B
 *
 * Tests for the specialized CounterfactualHandler:
 * - Thought creation
 * - World state validation
 * - Divergence point tracking
 * - Intervention validation
 * - Enhancements
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CounterfactualHandler } from '../../../../src/modes/handlers/CounterfactualHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('CounterfactualHandler', () => {
  let handler: CounterfactualHandler;

  beforeEach(() => {
    handler = new CounterfactualHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.COUNTERFACTUAL);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Counterfactual Analysis');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description.toLowerCase()).toContain('what-if');
    });
  });

  describe('createThought', () => {
    it('should create a basic counterfactual thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing what-if scenario',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.COUNTERFACTUAL);
      expect(thought.content).toBe('Analyzing what-if scenario');
      expect(thought.sessionId).toBe('session-1');
      expect(thought.thoughtNumber).toBe(1);
    });

    it('should create thought with actual scenario', () => {
      const input: ThinkingToolInput = {
        thought: 'Building scenarios',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
        actual: {
          name: 'Actual Scenario',
          conditions: [
            { factor: 'Weather', value: 'Sunny' },
            { factor: 'Traffic', value: 'Heavy' },
          ],
          outcome: { description: 'Arrived late', impact: 'negative' },
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.actual).toBeDefined();
      expect(thought.actual.name).toBe('Actual Scenario');
      expect(thought.actual.conditions).toHaveLength(2);
    });

    it('should create thought with counterfactual scenarios', () => {
      const input: ThinkingToolInput = {
        thought: 'Exploring alternatives',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
        counterfactuals: [
          {
            name: 'Alternative 1',
            conditions: [
              { factor: 'Weather', value: 'Sunny' },
              { factor: 'Traffic', value: 'Light', isIntervention: true },
            ],
            outcome: { description: 'Arrived on time', impact: 'positive' },
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.counterfactuals).toHaveLength(1);
      expect(thought.counterfactuals[0].conditions[1].isIntervention).toBe(true);
    });

    it('should create thought with intervention point', () => {
      const input: ThinkingToolInput = {
        thought: 'Identifying intervention',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
        interventionPoint: {
          description: 'Leave earlier',
          timing: '30 minutes before',
          feasibility: 0.9,
          expectedImpact: 0.8,
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.interventionPoint).toBeDefined();
      expect(thought.interventionPoint.feasibility).toBe(0.9);
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid counterfactual reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail validation for invalid thought number', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 10,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_THOUGHT_NUMBER')).toBe(true);
    });

    it('should warn when counterfactual has no intervention markers', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
        counterfactuals: [
          {
            name: 'Alternative',
            conditions: [
              { factor: 'Weather', value: 'Rainy' }, // No isIntervention
            ],
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('intervention'))).toBe(true);
    });

    it('should warn when no counterfactuals provided', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
        actual: {
          name: 'Actual',
          conditions: [],
        },
        counterfactuals: [],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'counterfactuals')).toBe(true);
    });

    it('should warn for out-of-range likelihood', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
        actual: {
          name: 'Actual',
          conditions: [],
          likelihood: 1.5, // Invalid
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('likelihood'))).toBe(true);
    });

    it('should validate intervention point ranges', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
        interventionPoint: {
          description: 'Test',
          timing: 'Now',
          feasibility: 2.0, // Invalid
          expectedImpact: -0.5, // Invalid
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.filter(w => w.field?.includes('interventionPoint'))).toHaveLength(2);
    });

    it('should validate causal chains', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
        causalChains: [
          {
            id: 'chain-1',
            events: ['A'], // Only one event
            branchingPoint: '',
            divergence: 'test',
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('one event'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.relatedModes).toContain(ThinkingMode.CAUSAL);
      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.mentalModels).toContain('Possible Worlds');
    });

    it('should provide metrics', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
        actual: {
          name: 'Actual',
          conditions: [{ factor: 'A', value: '1' }],
        },
        counterfactuals: [
          { name: 'CF1', conditions: [{ factor: 'A', value: '2', isIntervention: true }] },
          { name: 'CF2', conditions: [{ factor: 'A', value: '3', isIntervention: true }] },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics).toBeDefined();
      expect(enhancements.metrics!.counterfactualCount).toBe(2);
      expect(enhancements.metrics!.totalInterventions).toBe(2);
    });

    it('should suggest adding counterfactuals when none present', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'counterfactual',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s => s.includes('counterfactual'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support problem_definition', () => {
      expect(handler.supportsThoughtType!('problem_definition')).toBe(true);
    });

    it('should support scenario_construction', () => {
      expect(handler.supportsThoughtType!('scenario_construction')).toBe(true);
    });

    it('should support divergence_analysis', () => {
      expect(handler.supportsThoughtType!('divergence_analysis')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType!('unknown_type')).toBe(false);
    });
  });
});
