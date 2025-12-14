/**
 * SystemsThinkingHandler Unit Tests - Phase 10 Sprint 2B
 *
 * Tests for the specialized SystemsThinkingHandler:
 * - Thought creation
 * - Component validation
 * - Feedback loop validation
 * - Archetype detection
 * - Enhancements
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SystemsThinkingHandler } from '../../../../src/modes/handlers/SystemsThinkingHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('SystemsThinkingHandler', () => {
  let handler: SystemsThinkingHandler;

  beforeEach(() => {
    handler = new SystemsThinkingHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.SYSTEMSTHINKING);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Systems Thinking');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description.toLowerCase()).toContain('archetype');
    });
  });

  describe('createThought', () => {
    it('should create a basic systems thinking thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing system dynamics',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.SYSTEMSTHINKING);
      expect(thought.content).toBe('Analyzing system dynamics');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should create thought with system definition', () => {
      const input: ThinkingToolInput = {
        thought: 'Defining system',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        system: {
          id: 'sys-1',
          name: 'Market System',
          description: 'A market ecosystem',
          boundary: 'Within country borders',
          purpose: 'Economic exchange',
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.system).toBeDefined();
      expect(thought.system.name).toBe('Market System');
    });

    it('should create thought with components', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing components',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        components: [
          { id: 'comp-1', name: 'Supply', type: 'stock', description: 'Available supply' },
          { id: 'comp-2', name: 'Demand', type: 'stock', description: 'Market demand' },
          { id: 'comp-3', name: 'Price', type: 'variable', description: 'Market price' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.components).toHaveLength(3);
    });

    it('should create thought with feedback loops', () => {
      const input: ThinkingToolInput = {
        thought: 'Identifying feedback',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        feedbackLoops: [
          {
            id: 'loop-1',
            name: 'Price Adjustment',
            type: 'balancing',
            description: 'Price balances supply and demand',
            components: ['comp-1', 'comp-2', 'comp-3'],
            polarity: '-',
            strength: 0.8,
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.feedbackLoops).toHaveLength(1);
      expect(thought.feedbackLoops[0].type).toBe('balancing');
    });

    it('should create thought with leverage points', () => {
      const input: ThinkingToolInput = {
        thought: 'Finding leverage',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        leveragePoints: [
          {
            id: 'lp-1',
            name: 'Information Flow',
            location: 'comp-3',
            description: 'Improve price information',
            effectiveness: 0.7,
            difficulty: 0.3,
            type: 'feedback',
            interventionExamples: ['Transparent pricing'],
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.leveragePoints).toHaveLength(1);
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid systems thinking',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
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
        mode: 'systemsthinking',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should warn when feedback loop references non-existent component', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        components: [
          { id: 'comp-1', name: 'Supply', type: 'stock', description: 'Test' },
        ],
        feedbackLoops: [
          {
            id: 'loop-1',
            name: 'Test Loop',
            type: 'balancing',
            description: 'Test',
            components: ['comp-1', 'comp-2'], // comp-2 doesn't exist
            polarity: '-',
            strength: 0.8,
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('non-existent component'))).toBe(true);
    });

    it('should warn when feedback loop has fewer than 2 components', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        components: [
          { id: 'comp-1', name: 'Supply', type: 'stock', description: 'Test' },
        ],
        feedbackLoops: [
          {
            id: 'loop-1',
            name: 'Test Loop',
            type: 'balancing',
            description: 'Test',
            components: ['comp-1'], // Only one component
            polarity: '-',
            strength: 0.8,
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('fewer than 2'))).toBe(true);
    });

    it('should validate loop strength range', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        feedbackLoops: [
          {
            id: 'loop-1',
            name: 'Test Loop',
            type: 'reinforcing',
            description: 'Test',
            components: ['comp-1', 'comp-2'],
            polarity: '+',
            strength: 1.5, // Invalid
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('strength'))).toBe(true);
    });

    it('should validate leverage point effectiveness range', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        components: [{ id: 'comp-1', name: 'Test', type: 'stock', description: 'Test' }],
        leveragePoints: [
          {
            id: 'lp-1',
            name: 'Test LP',
            location: 'comp-1',
            description: 'Test',
            effectiveness: 2.0, // Invalid
            difficulty: 0.5,
            type: 'parameter',
            interventionExamples: [],
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('Effectiveness'))).toBe(true);
    });

    it('should warn when system has no boundary defined', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        system: {
          id: 'sys-1',
          name: 'Test System',
          description: 'A test',
          boundary: '', // Empty
          purpose: 'Testing',
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('boundary'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.relatedModes).toContain(ThinkingMode.CAUSAL);
      expect(enhancements.relatedModes).toContain(ThinkingMode.OPTIMIZATION);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.mentalModels).toContain('Feedback Loops');
      expect(enhancements.mentalModels).toContain('Systems Archetypes');
    });

    it('should detect Limits to Growth archetype', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        feedbackLoops: [
          { id: 'loop-1', name: 'Growth', type: 'reinforcing', description: 'Test', components: ['a', 'b'], polarity: '+', strength: 0.8 },
          { id: 'loop-2', name: 'Limit', type: 'balancing', description: 'Test', components: ['b', 'c'], polarity: '-', strength: 0.6 },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.detectedArchetypes).toBeDefined();
      expect(enhancements.detectedArchetypes!.some(a => a.name === 'Limits to Growth')).toBe(true);
    });

    it('should detect Success to the Successful archetype', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        feedbackLoops: [
          { id: 'loop-1', name: 'Winner', type: 'reinforcing', description: 'Test', components: ['a', 'b'], polarity: '+', strength: 0.8 },
          { id: 'loop-2', name: 'Loser', type: 'reinforcing', description: 'Test', components: ['c', 'd'], polarity: '+', strength: 0.6 },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.detectedArchetypes).toBeDefined();
      expect(enhancements.detectedArchetypes!.some(a => a.name === 'Success to the Successful')).toBe(true);
    });

    it('should warn when only reinforcing loops detected', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        feedbackLoops: [
          { id: 'loop-1', name: 'Growth', type: 'reinforcing', description: 'Test', components: ['a', 'b'], polarity: '+', strength: 0.8 },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.warnings!.some(w => w.includes('reinforcing'))).toBe(true);
    });

    it('should calculate feedback loop metrics', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        components: [
          { id: 'comp-1', name: 'A', type: 'stock', description: 'Test' },
          { id: 'comp-2', name: 'B', type: 'flow', description: 'Test' },
        ],
        feedbackLoops: [
          { id: 'loop-1', name: 'L1', type: 'reinforcing', description: 'Test', components: ['comp-1', 'comp-2'], polarity: '+', strength: 0.8 },
          { id: 'loop-2', name: 'L2', type: 'balancing', description: 'Test', components: ['comp-1', 'comp-2'], polarity: '-', strength: 0.6 },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics).toBeDefined();
      expect(enhancements.metrics!.componentCount).toBe(2);
      expect(enhancements.metrics!.feedbackLoopCount).toBe(2);
      expect(enhancements.metrics!.reinforcingLoops).toBe(1);
      expect(enhancements.metrics!.balancingLoops).toBe(1);
    });

    it('should suggest identifying feedback loops when components but no loops', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'systemsthinking',
        components: [
          { id: 'comp-1', name: 'A', type: 'stock', description: 'Test' },
          { id: 'comp-2', name: 'B', type: 'flow', description: 'Test' },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s => s.includes('feedback loop'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support system_definition', () => {
      expect(handler.supportsThoughtType!('system_definition')).toBe(true);
    });

    it('should support feedback_identification', () => {
      expect(handler.supportsThoughtType!('feedback_identification')).toBe(true);
    });

    it('should support leverage_analysis', () => {
      expect(handler.supportsThoughtType!('leverage_analysis')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType!('unknown_type')).toBe(false);
    });
  });
});
