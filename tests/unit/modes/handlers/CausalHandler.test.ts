/**
 * CausalHandler Unit Tests - Phase 10 Sprint 2
 *
 * Tests for the specialized CausalHandler:
 * - Thought creation
 * - Causal graph validation
 * - Cycle detection
 * - Intervention validation
 * - Enhancements
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CausalHandler } from '../../../../src/modes/handlers/CausalHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('CausalHandler', () => {
  let handler: CausalHandler;

  beforeEach(() => {
    handler = new CausalHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.CAUSAL);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Causal Analysis');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description.toLowerCase()).toContain('causal');
    });
  });

  describe('createThought', () => {
    it('should create a basic causal thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing causal relationships',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.CAUSAL);
      expect(thought.content).toBe('Analyzing causal relationships');
      expect(thought.sessionId).toBe('session-1');
      expect(thought.thoughtNumber).toBe(1);
    });

    it('should create thought with causal graph', () => {
      const input: ThinkingToolInput = {
        thought: 'Building causal model',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Cause', type: 'cause', description: 'Root cause' },
            { id: 'B', name: 'Effect', type: 'effect', description: 'Primary effect' },
          ],
          edges: [
            { from: 'A', to: 'B', strength: 0.8, confidence: 0.9 },
          ],
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.causalGraph).toBeDefined();
      expect(thought.causalGraph.nodes).toHaveLength(2);
      expect(thought.causalGraph.edges).toHaveLength(1);
    });

    it('should create thought with interventions', () => {
      const input: ThinkingToolInput = {
        thought: 'Testing intervention',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        interventions: [
          {
            nodeId: 'A',
            action: 'Set to high',
            expectedEffects: [
              { nodeId: 'B', expectedChange: 'Increase', confidence: 0.8 },
            ],
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.interventions).toHaveLength(1);
      expect(thought.interventions[0].nodeId).toBe('A');
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid causal reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
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
        mode: 'causal',
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
        mode: 'causal',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_THOUGHT_NUMBER')).toBe(true);
    });

    it('should detect duplicate node IDs', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Node 1', type: 'cause', description: 'Test' },
            { id: 'A', name: 'Node 2', type: 'effect', description: 'Duplicate ID' },
          ],
          edges: [],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'DUPLICATE_NODE_IDS')).toBe(true);
    });

    it('should detect invalid edge references', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Node 1', type: 'cause', description: 'Test' },
          ],
          edges: [
            { from: 'A', to: 'B', strength: 0.8, confidence: 0.9 },
          ],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_EDGE_TARGET')).toBe(true);
    });

    it('should detect cycles in causal graph', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Node A', type: 'cause', description: 'Test' },
            { id: 'B', name: 'Node B', type: 'effect', description: 'Test' },
            { id: 'C', name: 'Node C', type: 'mediator', description: 'Test' },
          ],
          edges: [
            { from: 'A', to: 'B', strength: 0.8, confidence: 0.9 },
            { from: 'B', to: 'C', strength: 0.7, confidence: 0.8 },
            { from: 'C', to: 'A', strength: 0.6, confidence: 0.7 },
          ],
        },
      } as any;

      const result = handler.validate(input);

      // Cycles should produce warnings, not errors
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('cycle'))).toBe(true);
    });

    it('should detect self-loops', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Node A', type: 'cause', description: 'Test' },
          ],
          edges: [
            { from: 'A', to: 'A', strength: 0.5, confidence: 0.9 },
          ],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('self-loop'))).toBe(true);
    });

    it('should validate intervention targets', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Node A', type: 'cause', description: 'Test' },
          ],
          edges: [],
        },
        interventions: [
          {
            nodeId: 'B', // Invalid - not in graph
            action: 'Test',
            expectedEffects: [],
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_INTERVENTION_TARGET')).toBe(true);
    });

    it('should warn when no confounders specified', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Node A', type: 'cause', description: 'Test' },
            { id: 'B', name: 'Node B', type: 'mediator', description: 'Test' },
            { id: 'C', name: 'Node C', type: 'effect', description: 'Test' },
          ],
          edges: [
            { from: 'A', to: 'B', strength: 0.8, confidence: 0.9 },
            { from: 'B', to: 'C', strength: 0.7, confidence: 0.8 },
          ],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'confounders')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
      expect(enhancements.relatedModes).toContain(ThinkingMode.COUNTERFACTUAL);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.mentalModels).toContain('Causal Diagrams');
      expect(enhancements.mentalModels).toContain('Do-Calculus');
    });

    it('should provide graph metrics', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Node A', type: 'cause', description: 'Test' },
            { id: 'B', name: 'Node B', type: 'effect', description: 'Test' },
          ],
          edges: [
            { from: 'A', to: 'B', strength: 0.8, confidence: 0.9 },
          ],
        },
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics).toBeDefined();
      expect(enhancements.metrics!.nodeCount).toBe(2);
      expect(enhancements.metrics!.edgeCount).toBe(1);
    });

    it('should suggest adding edges when graph has none', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'causal',
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Node A', type: 'cause', description: 'Test' },
            { id: 'B', name: 'Node B', type: 'effect', description: 'Test' },
          ],
          edges: [],
        },
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s => s.includes('edge'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support problem_definition', () => {
      expect(handler.supportsThoughtType!('problem_definition')).toBe(true);
    });

    it('should support causal_graph_construction', () => {
      expect(handler.supportsThoughtType!('causal_graph_construction')).toBe(true);
    });

    it('should support intervention_analysis', () => {
      expect(handler.supportsThoughtType!('intervention_analysis')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType!('unknown_type')).toBe(false);
    });
  });
});
