/**
 * GenericModeHandler Tests - Phase 10 Sprint 1
 *
 * Tests for the fallback/generic mode handler.
 */

import { describe, it, expect } from 'vitest';
import { GenericModeHandler } from '../../../../src/modes/handlers/GenericModeHandler.js';
import { ThinkingMode, ShannonStage } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('GenericModeHandler', () => {
  describe('Construction', () => {
    it('should create handler for any mode', () => {
      const handler = new GenericModeHandler(ThinkingMode.CAUSAL);

      expect(handler.mode).toBe(ThinkingMode.CAUSAL);
      expect(handler.modeName).toBe('Causal Analysis');
      expect(handler.description).toContain('Causal');
    });

    it('should accept custom name and description', () => {
      const handler = new GenericModeHandler(
        ThinkingMode.HYBRID,
        'Custom Name',
        'Custom description'
      );

      expect(handler.modeName).toBe('Custom Name');
      expect(handler.description).toBe('Custom description');
    });
  });

  describe('Thought Creation', () => {
    it('should create sequential thought', () => {
      const handler = new GenericModeHandler(ThinkingMode.SEQUENTIAL);
      const input: ThinkingToolInput = {
        mode: 'sequential',
        thought: 'Step 1: Analyze',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branchFrom: 'thought-0',
        branchId: 'branch-1',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(thought.content).toBe('Step 1: Analyze');
      expect(thought.sessionId).toBe('session-123');
      expect(thought.thoughtNumber).toBe(1);
      expect((thought as any).branchId).toBe('branch-1');
    });

    it('should create shannon thought with stage', () => {
      const handler = new GenericModeHandler(ThinkingMode.SHANNON);
      const input: ThinkingToolInput = {
        mode: 'shannon',
        thought: 'Define the problem',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        stage: 'problem_definition',
        uncertainty: 0.3,
        dependencies: ['dep-1'],
        assumptions: ['assumption-1'],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.SHANNON);
      expect((thought as any).stage).toBe(ShannonStage.PROBLEM_DEFINITION);
      expect((thought as any).uncertainty).toBe(0.3);
      expect((thought as any).dependencies).toContain('dep-1');
    });

    it('should create mathematics thought', () => {
      const handler = new GenericModeHandler(ThinkingMode.MATHEMATICS);
      const input: ThinkingToolInput = {
        mode: 'mathematics',
        thought: 'Prove theorem',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        thoughtType: 'proof',
        mathematicalModel: {
          latex: 'E = mc^2',
          symbolic: 'E = m * c^2',
        },
        proofStrategy: {
          type: 'direct',
          steps: ['Step 1', 'Step 2'],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect((thought as any).thoughtType).toBe('proof');
      expect((thought as any).mathematicalModel?.latex).toBe('E = mc^2');
    });

    it('should create inductive thought', () => {
      const handler = new GenericModeHandler(ThinkingMode.INDUCTIVE);
      const input: ThinkingToolInput = {
        mode: 'inductive',
        thought: 'Pattern observed',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        observations: ['Observation 1', 'Observation 2'],
        pattern: 'Increasing trend',
        generalization: 'All X have property Y',
        confidence: 0.8,
        sampleSize: 100,
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.INDUCTIVE);
      expect((thought as any).observations).toHaveLength(2);
      expect((thought as any).confidence).toBe(0.8);
      expect((thought as any).sampleSize).toBe(100);
    });

    it('should create deductive thought', () => {
      const handler = new GenericModeHandler(ThinkingMode.DEDUCTIVE);
      const input: ThinkingToolInput = {
        mode: 'deductive',
        thought: 'Derive conclusion',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        premises: ['All men are mortal', 'Socrates is a man'],
        conclusion: 'Socrates is mortal',
        logicForm: 'modus ponens',
        validityCheck: true,
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.DEDUCTIVE);
      expect((thought as any).premises).toHaveLength(2);
      expect((thought as any).validityCheck).toBe(true);
    });

    it('should create causal thought with graph', () => {
      const handler = new GenericModeHandler(ThinkingMode.CAUSAL);
      const input: ThinkingToolInput = {
        mode: 'causal',
        thought: 'Analyze causation',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        causalGraph: {
          nodes: [
            { id: 'A', name: 'Cause A', type: 'cause', description: 'Primary cause' },
          ],
          edges: [
            { from: 'A', to: 'B', strength: 0.8, confidence: 0.9 },
          ],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.CAUSAL);
      expect((thought as any).causalGraph.nodes).toHaveLength(1);
      expect((thought as any).causalGraph.edges[0].strength).toBe(0.8);
    });

    it('should default to hybrid mode for unknown modes', () => {
      const handler = new GenericModeHandler(ThinkingMode.HYBRID);
      const input: ThinkingToolInput = {
        mode: 'unknown_mode' as any,
        thought: 'Generic thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should generate unique thought IDs', () => {
      const handler = new GenericModeHandler(ThinkingMode.SEQUENTIAL);
      const input: ThinkingToolInput = {
        mode: 'sequential',
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      };

      const thought1 = handler.createThought(input, 'session-1');
      const thought2 = handler.createThought(input, 'session-1');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  describe('Validation', () => {
    it('should pass validation for valid input', () => {
      const handler = new GenericModeHandler(ThinkingMode.SEQUENTIAL);
      const input: ThinkingToolInput = {
        mode: 'sequential',
        thought: 'Valid thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const handler = new GenericModeHandler(ThinkingMode.SEQUENTIAL);
      const input: ThinkingToolInput = {
        mode: 'sequential',
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_THOUGHT');
    });

    it('should fail validation for whitespace-only thought', () => {
      const handler = new GenericModeHandler(ThinkingMode.SEQUENTIAL);
      const input: ThinkingToolInput = {
        mode: 'sequential',
        thought: '   ',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
    });

    it('should fail validation when thoughtNumber exceeds totalThoughts', () => {
      const handler = new GenericModeHandler(ThinkingMode.SEQUENTIAL);
      const input: ThinkingToolInput = {
        mode: 'sequential',
        thought: 'Test',
        thoughtNumber: 5,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_THOUGHT_NUMBER');
    });

    it('should warn for experimental modes', () => {
      const handler = new GenericModeHandler(ThinkingMode.ABDUCTIVE);
      const input: ThinkingToolInput = {
        mode: 'abductive',
        thought: 'Test hypothesis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('experimental');
    });
  });

  describe('Enhancements', () => {
    it('should return related modes', () => {
      const handler = new GenericModeHandler(ThinkingMode.CAUSAL);
      const input: ThinkingToolInput = {
        mode: 'causal',
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      };

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toBeDefined();
      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
      expect(enhancements.relatedModes).toContain(ThinkingMode.COUNTERFACTUAL);
    });
  });

  describe('Mode Status', () => {
    it('should return mode status for fully implemented mode', () => {
      const handler = new GenericModeHandler(ThinkingMode.SEQUENTIAL);
      const status = handler.getModeStatus();

      expect(status.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(status.isFullyImplemented).toBe(true);
      expect(status.hasSpecializedHandler).toBe(false);
    });

    it('should return mode status for experimental mode', () => {
      const handler = new GenericModeHandler(ThinkingMode.ABDUCTIVE);
      const status = handler.getModeStatus();

      expect(status.mode).toBe(ThinkingMode.ABDUCTIVE);
      expect(status.isFullyImplemented).toBe(false);
      expect(status.note).toContain('experimental');
    });
  });

  describe('Default Values', () => {
    it('should apply default values for optional fields', () => {
      const handler = new GenericModeHandler(ThinkingMode.SHANNON);
      const input: ThinkingToolInput = {
        mode: 'shannon',
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        // No stage, uncertainty, dependencies, or assumptions provided
      };

      const thought = handler.createThought(input, 'session-1');

      expect((thought as any).stage).toBe(ShannonStage.PROBLEM_DEFINITION);
      expect((thought as any).uncertainty).toBe(0.5);
      expect((thought as any).dependencies).toEqual([]);
      expect((thought as any).assumptions).toEqual([]);
    });

    it('should apply default confidence for inductive mode', () => {
      const handler = new GenericModeHandler(ThinkingMode.INDUCTIVE);
      const input: ThinkingToolInput = {
        mode: 'inductive',
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      };

      const thought = handler.createThought(input, 'session-1');

      expect((thought as any).confidence).toBe(0.5);
      expect((thought as any).observations).toEqual([]);
    });
  });
});
