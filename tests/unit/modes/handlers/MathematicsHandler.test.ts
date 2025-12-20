/**
 * MathematicsHandler Unit Tests - Phase 10 Sprint 3
 *
 * Tests for the specialized MathematicsHandler:
 * - Proof strategy validation and tracking
 * - Mathematical model validation
 * - Proof decomposition support
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MathematicsHandler } from '../../../../src/modes/handlers/MathematicsHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('MathematicsHandler', () => {
  let handler: MathematicsHandler;

  beforeEach(() => {
    handler = new MathematicsHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.MATHEMATICS);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Mathematical Reasoning');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description.toLowerCase()).toContain('proof');
    });
  });

  describe('createThought', () => {
    it('should create a basic mathematics thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Proving theorem',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.content).toBe('Proving theorem');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should default to axiom_definition thought type', () => {
      const input: ThinkingToolInput = {
        thought: 'Starting proof',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.thoughtType).toBe('axiom_definition');
    });

    it('should accept valid thought types', () => {
      const thoughtTypes = [
        'axiom_definition', 'theorem_statement', 'proof_construction',
        'lemma_derivation', 'corollary', 'counterexample',
      ];

      for (const type of thoughtTypes) {
        const input: ThinkingToolInput = {
          thought: `Testing ${type}`,
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'mathematics',
          thoughtType: type,
        } as any;

        const thought = handler.createThought(input, 'session-1');
        expect(thought.thoughtType).toBe(type);
      }
    });

    it('should include mathematical model', () => {
      const input: ThinkingToolInput = {
        thought: 'Model representation',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        mathematicalModel: {
          latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
          symbolic: 'sum(i, i=1..n) = n*(n+1)/2',
        },
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mathematicalModel).toBeDefined();
      expect(thought.mathematicalModel!.latex).toContain('sum');
    });

    it('should include proof strategy', () => {
      const input: ThinkingToolInput = {
        thought: 'Proof by induction',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        proofStrategy: {
          type: 'induction',
          steps: ['Base case', 'Inductive hypothesis', 'Inductive step'],
          baseCase: 'n=1: 1 = 1(1+1)/2 = 1 ✓',
          inductiveStep: 'If true for k, then true for k+1',
          completeness: 0.8,
        },
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.proofStrategy).toBeDefined();
      expect(thought.proofStrategy!.type).toBe('induction');
      expect(thought.proofStrategy!.baseCase).toBeDefined();
    });

    it('should include assumptions and dependencies', () => {
      const input: ThinkingToolInput = {
        thought: 'Dependent theorem',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        assumptions: ['x > 0', 'f is continuous'],
        dependencies: ['lemma-1', 'axiom-3'],
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.assumptions).toContain('x > 0');
      expect(thought.dependencies).toContain('lemma-1');
    });

    it('should set default uncertainty to 0.5', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.uncertainty).toBe(0.5);
    });

    it('should include theorems list', () => {
      const input: ThinkingToolInput = {
        thought: 'Referencing theorems',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        theorems: ['Fundamental Theorem of Calculus', 'Mean Value Theorem'],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.theorems).toContain('Fundamental Theorem of Calculus');
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid mathematics reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'theorem_statement',
        assumptions: ['n is a natural number'],
      } as any;

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
        mode: 'mathematics',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail for uncertainty out of range', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        uncertainty: 1.5,
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNCERTAINTY_OUT_OF_RANGE')).toBe(true);
    });

    it('should warn for unknown thought type', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'unknown_type',
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'thoughtType')).toBe(true);
    });

    it('should warn for theorem without assumptions', () => {
      const input: ThinkingToolInput = {
        thought: 'Theorem: All primes > 2 are odd',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'theorem_statement',
        // No assumptions
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'assumptions')).toBe(true);
    });

    it('should warn for proof without strategy', () => {
      const input: ThinkingToolInput = {
        thought: 'Constructing proof',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'proof_construction',
        // No proofStrategy
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'proofStrategy')).toBe(true);
    });

    it('should fail for invalid proof type', () => {
      const input: ThinkingToolInput = {
        thought: 'Bad proof',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        proofStrategy: {
          type: 'invalid_type',
          steps: [],
        },
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_PROOF_TYPE')).toBe(true);
    });

    it('should warn for induction without base case', () => {
      const input: ThinkingToolInput = {
        thought: 'Induction proof',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        proofStrategy: {
          type: 'induction',
          steps: ['Step 1'],
          // Missing baseCase
        },
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'proofStrategy.baseCase')).toBe(true);
    });

    it('should warn for model without LaTeX or symbolic', () => {
      const input: ThinkingToolInput = {
        thought: 'Model without representation',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        mathematicalModel: {
          ascii: 'sum = n*(n+1)/2',
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'mathematicalModel')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.PHYSICS);
      expect(enhancements.relatedModes).toContain(ThinkingMode.FORMALLOGIC);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Proof by Induction');
      expect(enhancements.mentalModels).toContain('Axiomatic Reasoning');
    });

    it('should provide axiom-specific guidance', () => {
      const thought = handler.createThought({
        thought: 'Axiom: For all x, x = x',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'axiom_definition',
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some(q => q.includes('consistent'))).toBe(true);
    });

    it('should provide theorem-specific guidance', () => {
      const thought = handler.createThought({
        thought: 'Theorem: Prime numbers are infinite',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'theorem_statement',
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some(q => q.includes('simplest'))).toBe(true);
    });

    it('should track proof completeness', () => {
      const thought = handler.createThought({
        thought: 'Partial proof',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'proof_construction',
        proofStrategy: {
          type: 'direct',
          steps: ['Step 1'],
          completeness: 0.3,
        },
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('50% complete'))).toBe(true);
    });

    it('should warn about induction missing base case', () => {
      const thought = handler.createThought({
        thought: 'Induction without base',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        proofStrategy: {
          type: 'induction',
          steps: ['Assume true for k'],
        },
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('base case'))).toBe(true);
    });

    it('should include metrics', () => {
      const thought = handler.createThought({
        thought: 'Metrics test',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        assumptions: ['a1', 'a2'],
        dependencies: ['d1'],
        uncertainty: 0.3,
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.assumptionCount).toBe(2);
      expect(enhancements.metrics!.dependencyCount).toBe(1);
      expect(enhancements.metrics!.uncertainty).toBe(0.3);
    });

    it('should warn about inconsistency report', () => {
      const thought = handler.createThought({
        thought: 'Inconsistent proof',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        consistencyReport: {
          isConsistent: false,
          inconsistencies: ['Contradiction found'],
          overallScore: 0.3,
        },
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('Inconsistency'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support all valid thought types', () => {
      const validTypes = [
        'axiom_definition', 'theorem_statement', 'proof_construction',
        'lemma_derivation', 'corollary', 'counterexample',
        'algebraic_manipulation', 'symbolic_computation', 'numerical_analysis',
        'proof_decomposition', 'dependency_analysis', 'consistency_check',
        'gap_identification', 'assumption_trace',
      ];

      for (const type of validTypes) {
        expect(handler.supportsThoughtType(type)).toBe(true);
      }
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete mathematical proof by induction', () => {
      // Step 1: State the theorem
      const step1 = handler.createThought({
        thought: 'Theorem: 1 + 2 + 3 + ... + n = n(n+1)/2 for all n ≥ 1',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'theorem_statement',
        assumptions: ['n is a positive integer'],
        mathematicalModel: {
          latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
          symbolic: 'sum(i,i=1..n) = n*(n+1)/2',
        },
      } as any, 'session-1');

      expect(step1.thoughtType).toBe('theorem_statement');

      // Step 2: Base case
      const step2 = handler.createThought({
        thought: 'Base case (n=1): LHS = 1, RHS = 1(2)/2 = 1. ✓',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'proof_construction',
        proofStrategy: {
          type: 'induction',
          steps: ['Base case verified'],
          baseCase: 'n=1: 1 = 1(1+1)/2 = 1',
          completeness: 0.3,
        },
        dependencies: [step1.id],
      } as any, 'session-1');

      expect(step2.proofStrategy!.type).toBe('induction');

      // Step 3: Inductive step
      const step3 = handler.createThought({
        thought: 'Inductive step: Assume true for k, prove for k+1',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'mathematics',
        thoughtType: 'proof_construction',
        proofStrategy: {
          type: 'induction',
          steps: ['Base case', 'Assume for k', 'Prove for k+1'],
          baseCase: step2.proofStrategy!.baseCase,
          inductiveStep: '1+2+...+k+(k+1) = k(k+1)/2 + (k+1) = (k+1)(k+2)/2',
          completeness: 0.9,
        },
        dependencies: [step1.id, step2.id],
      } as any, 'session-1');

      expect(step3.proofStrategy!.inductiveStep).toBeDefined();

      // Step 4: Conclusion
      const step4 = handler.createThought({
        thought: 'QED. By mathematical induction, the theorem holds for all n ≥ 1.',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'mathematics',
        thoughtType: 'proof_construction',
        proofStrategy: {
          type: 'induction',
          steps: ['Base case', 'Inductive hypothesis', 'Inductive step', 'Conclusion'],
          baseCase: step2.proofStrategy!.baseCase,
          inductiveStep: step3.proofStrategy!.inductiveStep,
          completeness: 1.0,
        },
        dependencies: [step1.id, step2.id, step3.id],
      } as any, 'session-1');

      expect(step4.proofStrategy!.completeness).toBe(1.0);
      expect(step4.nextThoughtNeeded).toBe(false);
    });
  });
});
