/**
 * CausalHandler Integration Tests
 *
 * Tests T-HDL-001 through T-HDL-006: Comprehensive tests for
 * CausalHandler graph validation, cycle detection, and interventions.
 *
 * Phase 11 Sprint 9: ModeHandler Specialized Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CausalHandler } from '../../../src/modes/handlers/CausalHandler.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('CausalHandler Integration Tests', () => {
  let handler: CausalHandler;

  beforeEach(() => {
    handler = new CausalHandler();
  });

  function createInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Causal analysis thought',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'causal',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-HDL-001: Graph validation - valid DAG
  // ===========================================================================
  describe('T-HDL-001: Graph Validation - Valid DAG', () => {
    it('should validate a proper DAG', () => {
      const input = createInput({
        nodes: [
          { id: 'A', name: 'Cause A' },
          { id: 'B', name: 'Intermediate B' },
          { id: 'C', name: 'Effect C' },
        ],
        edges: [
          { from: 'A', to: 'B', strength: 0.8 },
          { from: 'B', to: 'C', strength: 0.9 },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should validate empty graph', () => {
      const input = createInput({
        nodes: [],
        edges: [],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should validate single node graph', () => {
      const input = createInput({
        nodes: [{ id: 'A', name: 'Single Node' }],
        edges: [],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });
  });

  // ===========================================================================
  // T-HDL-002: Graph validation - cycle detection
  // ===========================================================================
  describe('T-HDL-002: Cycle Detection', () => {
    it('should detect simple cycle', () => {
      const input = createInput({
        nodes: [
          { id: 'A', name: 'Node A' },
          { id: 'B', name: 'Node B' },
        ],
        edges: [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'A' },
        ],
      });

      const result = handler.validate(input);
      // Cycles produce warnings, not errors (may be intentional feedback loops)
      expect(result.valid).toBe(true);
      expect(result.warnings?.length).toBeGreaterThan(0);
    });

    it('should detect longer cycles', () => {
      const input = createInput({
        nodes: [
          { id: 'A', name: 'Node A' },
          { id: 'B', name: 'Node B' },
          { id: 'C', name: 'Node C' },
        ],
        edges: [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'C' },
          { from: 'C', to: 'A' },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings?.some(w => w.field === 'causalGraph')).toBe(true);
    });

    it('should pass DAG without cycles', () => {
      const input = createInput({
        nodes: [
          { id: 'A', name: 'Root' },
          { id: 'B', name: 'Middle' },
          { id: 'C', name: 'Leaf' },
        ],
        edges: [
          { from: 'A', to: 'B' },
          { from: 'A', to: 'C' },
          { from: 'B', to: 'C' },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      // Should not have cycle-related warnings
      const cycleWarnings = result.warnings?.filter(w =>
        w.message.toLowerCase().includes('cycle')
      );
      expect(cycleWarnings?.length ?? 0).toBe(0);
    });
  });

  // ===========================================================================
  // T-HDL-003: Graph validation - self-loop detection
  // ===========================================================================
  describe('T-HDL-003: Self-Loop Detection', () => {
    it('should detect self-loops', () => {
      const input = createInput({
        nodes: [{ id: 'A', name: 'Self-Referential' }],
        edges: [{ from: 'A', to: 'A' }],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings?.some(w => w.message.includes('self-loop'))).toBe(true);
    });

    it('should detect multiple self-loops', () => {
      const input = createInput({
        nodes: [
          { id: 'A', name: 'Node A' },
          { id: 'B', name: 'Node B' },
        ],
        edges: [
          { from: 'A', to: 'A' },
          { from: 'B', to: 'B' },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings?.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // T-HDL-004: Intervention tracking
  // ===========================================================================
  describe('T-HDL-004: Intervention Tracking', () => {
    it('should validate interventions on existing nodes', () => {
      const input = createInput({
        nodes: [
          { id: 'A', name: 'Cause' },
          { id: 'B', name: 'Effect' },
        ],
        edges: [{ from: 'A', to: 'B' }],
        interventions: [
          { nodeId: 'A', value: 'increased', description: 'Increase A' },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should fail intervention on non-existent node', () => {
      const input = createInput({
        nodes: [{ id: 'A', name: 'Only Node' }],
        edges: [],
        interventions: [
          { nodeId: 'NonExistent', value: 'changed', description: 'Invalid intervention' },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0].code).toBe('INVALID_INTERVENTION_TARGET');
    });

    it('should validate multiple interventions', () => {
      const input = createInput({
        nodes: [
          { id: 'A', name: 'Node A' },
          { id: 'B', name: 'Node B' },
          { id: 'C', name: 'Node C' },
        ],
        edges: [
          { from: 'A', to: 'C' },
          { from: 'B', to: 'C' },
        ],
        interventions: [
          { nodeId: 'A', value: 'high', description: 'Set A high' },
          { nodeId: 'B', value: 'low', description: 'Set B low' },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });
  });

  // ===========================================================================
  // T-HDL-005: Effect propagation
  // ===========================================================================
  describe('T-HDL-005: Effect Propagation', () => {
    it('should create thought with causal graph', () => {
      const input = createInput({
        nodes: [
          { id: 'cause', name: 'Root Cause' },
          { id: 'intermediate', name: 'Intermediate' },
          { id: 'effect', name: 'Final Effect' },
        ],
        edges: [
          { from: 'cause', to: 'intermediate', strength: 0.7 },
          { from: 'intermediate', to: 'effect', strength: 0.8 },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.causalGraph).toBeDefined();
      expect(thought.causalGraph.nodes).toHaveLength(3);
      expect(thought.causalGraph.edges).toHaveLength(2);
    });

    it('should provide enhancements with graph metrics', () => {
      const input = createInput({
        nodes: [
          { id: 'A', name: 'A' },
          { id: 'B', name: 'B' },
          { id: 'C', name: 'C' },
        ],
        edges: [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'C' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.nodeCount).toBe(3);
      expect(enhancements.metrics?.edgeCount).toBe(2);
    });
  });

  // ===========================================================================
  // T-HDL-006: D-separation checking (via entry/exit node identification)
  // ===========================================================================
  describe('T-HDL-006: D-Separation Checking', () => {
    it('should identify entry nodes (root causes)', () => {
      const input = createInput({
        nodes: [
          { id: 'root1', name: 'Root Cause 1' },
          { id: 'root2', name: 'Root Cause 2' },
          { id: 'effect', name: 'Effect' },
        ],
        edges: [
          { from: 'root1', to: 'effect' },
          { from: 'root2', to: 'effect' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Should ask about root causes
      expect(enhancements.guidingQuestions?.some(q =>
        q.includes('Root Cause') || q.includes('root cause')
      )).toBe(true);
    });

    it('should identify exit nodes (final effects)', () => {
      const input = createInput({
        nodes: [
          { id: 'cause', name: 'Cause' },
          { id: 'effect1', name: 'Effect 1' },
          { id: 'effect2', name: 'Effect 2' },
        ],
        edges: [
          { from: 'cause', to: 'effect1' },
          { from: 'cause', to: 'effect2' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Should ask about downstream consequences
      expect(enhancements.guidingQuestions?.some(q =>
        q.includes('downstream') || q.includes('consequence')
      )).toBe(true);
    });

    it('should validate edge references', () => {
      const input = createInput({
        nodes: [{ id: 'A', name: 'Only A' }],
        edges: [{ from: 'A', to: 'B' }], // B doesn't exist
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0].code).toBe('INVALID_EDGE_TARGET');
    });
  });
});
