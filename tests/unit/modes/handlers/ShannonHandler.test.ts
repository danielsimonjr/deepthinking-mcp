/**
 * ShannonHandler Unit Tests - Phase 10 Sprint 3
 *
 * Tests for the specialized ShannonHandler:
 * - 5-stage problem-solving process
 * - Stage progression tracking
 * - Uncertainty validation
 * - Confidence factors assessment
 * - Alternative approach suggestions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ShannonHandler } from '../../../../src/modes/handlers/ShannonHandler.js';
import { ThinkingMode, ShannonStage } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('ShannonHandler', () => {
  let handler: ShannonHandler;

  beforeEach(() => {
    handler = new ShannonHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.SHANNON);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Shannon Problem-Solving');
    });

    it('should have a description mentioning 5-stage', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description).toContain('5-stage');
    });
  });

  describe('createThought', () => {
    it('should create a basic Shannon thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Defining the problem',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.SHANNON);
      expect(thought.content).toBe('Defining the problem');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should set stage to PROBLEM_DEFINITION by default', () => {
      const input: ThinkingToolInput = {
        thought: 'Starting analysis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.stage).toBe(ShannonStage.PROBLEM_DEFINITION);
    });

    it('should set specified stage', () => {
      const stages = [
        { input: 'problem_definition', expected: ShannonStage.PROBLEM_DEFINITION },
        { input: 'constraints', expected: ShannonStage.CONSTRAINTS },
        { input: 'model', expected: ShannonStage.MODEL },
        { input: 'proof', expected: ShannonStage.PROOF },
        { input: 'implementation', expected: ShannonStage.IMPLEMENTATION },
      ];

      for (const { input: stageInput, expected } of stages) {
        const input: ThinkingToolInput = {
          thought: 'Test thought',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'shannon',
          stage: stageInput,
        };

        const thought = handler.createThought(input, 'session-1');
        expect(thought.stage).toBe(expected);
      }
    });

    it('should set default uncertainty of 0.5', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.uncertainty).toBe(0.5);
    });

    it('should accept custom uncertainty', () => {
      const input: ThinkingToolInput = {
        thought: 'High uncertainty thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        uncertainty: 0.8,
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.uncertainty).toBe(0.8);
    });

    it('should include dependencies', () => {
      const input: ThinkingToolInput = {
        thought: 'Dependent thought',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        dependencies: ['step-1', 'step-2'],
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.dependencies).toEqual(['step-1', 'step-2']);
    });

    it('should include assumptions', () => {
      const input: ThinkingToolInput = {
        thought: 'Assumption-based thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        assumptions: ['System is deterministic', 'Input is valid'],
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.assumptions).toEqual(['System is deterministic', 'Input is valid']);
    });

    it('should include confidence factors if provided', () => {
      const input: ThinkingToolInput = {
        thought: 'Thought with confidence',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        confidenceFactors: {
          dataQuality: 0.9,
          methodologyRobustness: 0.85,
          assumptionValidity: 0.8,
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.confidenceFactors.dataQuality).toBe(0.9);
      expect(thought.confidenceFactors.methodologyRobustness).toBe(0.85);
      expect(thought.confidenceFactors.assumptionValidity).toBe(0.8);
    });

    it('should include alternative approaches', () => {
      const input: ThinkingToolInput = {
        thought: 'Exploring alternatives',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        alternativeApproaches: ['Approach A', 'Approach B'],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.alternativeApproaches).toEqual(['Approach A', 'Approach B']);
    });

    it('should include known limitations', () => {
      const input: ThinkingToolInput = {
        thought: 'Acknowledging limits',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        knownLimitations: ['Does not scale beyond 1000 items'],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.knownLimitations).toContain('Does not scale beyond 1000 items');
    });

    it('should track revision information', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised analysis',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        isRevision: true,
        revisesThought: 'thought-2',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-2');
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid Shannon reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'problem_definition',
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
        mode: 'shannon',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail when thoughtNumber exceeds totalThoughts', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 10,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_THOUGHT_NUMBER')).toBe(true);
    });

    it('should fail for invalid stage', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'invalid_stage',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_SHANNON_STAGE')).toBe(true);
    });

    it('should warn when no stage specified', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        // No stage specified
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'stage')).toBe(true);
    });

    it('should fail for uncertainty out of range (negative)', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        uncertainty: -0.1,
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNCERTAINTY_OUT_OF_RANGE')).toBe(true);
    });

    it('should fail for uncertainty out of range (>1)', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        uncertainty: 1.5,
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNCERTAINTY_OUT_OF_RANGE')).toBe(true);
    });

    it('should warn for confidence factors out of range', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'model',
        confidenceFactors: {
          dataQuality: 1.5, // Out of range
          methodologyRobustness: 0.8,
          assumptionValidity: 0.7,
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'confidenceFactors.dataQuality')).toBe(true);
    });

    it('should warn when no assumptions in early stages', () => {
      const input: ThinkingToolInput = {
        thought: 'Problem definition',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'problem_definition',
        // No assumptions
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'assumptions')).toBe(true);
    });

    it('should warn for incomplete recheck step', () => {
      const input: ThinkingToolInput = {
        thought: 'Rechecking',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        recheckStep: {
          // Missing stepToRecheck and reason
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'recheckStep')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'problem_definition',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.SEQUENTIAL);
      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain("Shannon's Problem-Solving");
      expect(enhancements.mentalModels).toContain('Constraint-Based Design');
    });

    it('should provide stage-specific guidance for problem_definition', () => {
      const thought = handler.createThought({
        thought: 'Defining the problem',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'problem_definition',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some(q => q.includes('essential problem'))).toBe(true);
    });

    it('should provide stage-specific guidance for constraints', () => {
      const thought = handler.createThought({
        thought: 'Identifying constraints',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'constraints',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some(q => q.includes('constraints'))).toBe(true);
    });

    it('should provide stage-specific guidance for model', () => {
      const thought = handler.createThought({
        thought: 'Building model',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'model',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some(q => q.includes('model'))).toBe(true);
    });

    it('should provide stage-specific guidance for proof', () => {
      const thought = handler.createThought({
        thought: 'Proving correctness',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'proof',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some(q => q.includes('prove'))).toBe(true);
      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
    });

    it('should provide stage-specific guidance for implementation', () => {
      const thought = handler.createThought({
        thought: 'Implementing solution',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        mode: 'shannon',
        stage: 'implementation',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some(q => q.includes('implementation'))).toBe(true);
      expect(enhancements.relatedModes).toContain(ThinkingMode.ENGINEERING);
    });

    it('should warn for high uncertainty', () => {
      const thought = handler.createThought({
        thought: 'Uncertain analysis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        uncertainty: 0.85,
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('uncertainty'))).toBe(true);
    });

    it('should suggest moving to next stage for low uncertainty', () => {
      const thought = handler.createThought({
        thought: 'Confident analysis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        uncertainty: 0.15,
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('next stage'))).toBe(true);
    });

    it('should include metrics', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'constraints',
        uncertainty: 0.4,
        dependencies: ['dep1', 'dep2'],
        assumptions: ['assumption1'],
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.stageIndex).toBe(1); // constraints is index 1
      expect(enhancements.metrics!.uncertainty).toBe(0.4);
      expect(enhancements.metrics!.dependencyCount).toBe(2);
      expect(enhancements.metrics!.assumptionCount).toBe(1);
    });

    it('should warn for low assumption validity', () => {
      const thought = handler.createThought({
        thought: 'Questionable assumptions',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        confidenceFactors: {
          dataQuality: 0.8,
          methodologyRobustness: 0.7,
          assumptionValidity: 0.3, // Low
        },
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.warnings!.some(w => w.includes('assumption validity'))).toBe(true);
    });

    it('should suggest documenting alternatives if none provided', () => {
      const thought = handler.createThought({
        thought: 'Model construction',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'model',
        // No alternativeApproaches
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s => s.includes('alternative'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support problem_definition', () => {
      expect(handler.supportsThoughtType('problem_definition')).toBe(true);
    });

    it('should support constraint_identification', () => {
      expect(handler.supportsThoughtType('constraint_identification')).toBe(true);
    });

    it('should support model_construction', () => {
      expect(handler.supportsThoughtType('model_construction')).toBe(true);
    });

    it('should support proof_development', () => {
      expect(handler.supportsThoughtType('proof_development')).toBe(true);
    });

    it('should support implementation_planning', () => {
      expect(handler.supportsThoughtType('implementation_planning')).toBe(true);
    });

    it('should support recheck', () => {
      expect(handler.supportsThoughtType('recheck')).toBe(true);
    });

    it('should support refinement', () => {
      expect(handler.supportsThoughtType('refinement')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete Shannon 5-stage process', () => {
      // Stage 1: Problem Definition
      const step1 = handler.createThought({
        thought: 'Problem: Optimize query response time for database with 1M records',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'problem_definition',
        assumptions: ['Current response time is 5 seconds', 'Target is under 100ms'],
      }, 'session-1');

      expect(step1.stage).toBe(ShannonStage.PROBLEM_DEFINITION);

      // Stage 2: Constraints
      const step2 = handler.createThought({
        thought: 'Constraints: Must maintain ACID properties, no schema changes allowed',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'constraints',
        dependencies: [step1.id],
        assumptions: ['Cannot add new tables', 'Index maintenance window is nightly'],
      }, 'session-1');

      expect(step2.stage).toBe(ShannonStage.CONSTRAINTS);
      expect(step2.dependencies).toContain(step1.id);

      // Stage 3: Model
      const step3 = handler.createThought({
        thought: 'Model: Use B-tree index on frequently queried columns',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'model',
        dependencies: [step1.id, step2.id],
        alternativeApproaches: ['Covering index', 'Materialized view'],
      } as any, 'session-1') as any;

      expect(step3.stage).toBe(ShannonStage.MODEL);
      expect(step3.alternativeApproaches).toContain('Covering index');

      // Stage 4: Proof
      const step4 = handler.createThought({
        thought: 'Proof: B-tree lookup is O(log n), 1M records = ~20 comparisons',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'proof',
        dependencies: [step3.id],
        uncertainty: 0.2,
      }, 'session-1');

      expect(step4.stage).toBe(ShannonStage.PROOF);
      expect(step4.uncertainty).toBe(0.2);

      // Stage 5: Implementation
      const step5 = handler.createThought({
        thought: 'Implementation: CREATE INDEX idx_users_email ON users(email)',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        mode: 'shannon',
        stage: 'implementation',
        dependencies: [step4.id],
        uncertainty: 0.1,
        knownLimitations: ['Index requires 50MB additional storage'],
      } as any, 'session-1') as any;

      expect(step5.stage).toBe(ShannonStage.IMPLEMENTATION);
      expect(step5.knownLimitations).toContain('Index requires 50MB additional storage');
    });

    it('should handle recheck workflow', () => {
      // Initial thought
      const initial = handler.createThought({
        thought: 'Initial model',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'model',
      }, 'session-1');

      // Recheck with reason
      const recheck = handler.createThought({
        thought: 'Rechecking model assumptions',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'shannon',
        stage: 'model',
        recheckStep: {
          stepToRecheck: initial.id,
          reason: 'Found edge case not covered',
        },
      } as any, 'session-1') as any;

      expect(recheck.recheckStep).toBeDefined();
      expect(recheck.recheckStep.stepToRecheck).toBe(initial.id);
      expect(recheck.recheckStep.reason).toBe('Found edge case not covered');

      // Refined version
      const refined = handler.createThought({
        thought: 'Refined model addressing edge case',
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        mode: 'shannon',
        stage: 'model',
        isRevision: true,
        revisesThought: initial.id,
      }, 'session-1');

      expect(refined.isRevision).toBe(true);
      expect(refined.revisesThought).toBe(initial.id);
    });
  });
});
