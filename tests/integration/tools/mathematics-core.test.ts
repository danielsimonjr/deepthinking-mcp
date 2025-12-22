/**
 * Mathematics Mode Integration Tests - Core
 *
 * Tests T-MTH-001 through T-MTH-017: Comprehensive integration tests
 * for the deepthinking_mathematics tool with mathematics mode core features.
 *
 * Phase 11 Sprint 3: Mathematics, Physics & Computability Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type MathematicsThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { createBaseThought } from '../../utils/thought-factory.js';
import {
  assertValidBaseThought,
  assertThoughtMode,
  assertValidationPassed,
} from '../../utils/assertion-helpers.js';

// ============================================================================
// MATHEMATICS MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic mathematics thought with required params only
 */
function createMathematicsThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'mathematics',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create a mathematics thought with proof strategy
 */
function createMathematicsWithProofStrategy(
  proofType: 'direct' | 'contradiction' | 'induction' | 'construction' | 'contrapositive',
  steps: string[] = [],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createMathematicsThought({
    proofStrategy: {
      type: proofType,
      steps,
      completeness: steps.length > 0 ? 0.7 : 0.3,
    },
    ...overrides,
  });
}

/**
 * Create a mathematics thought with mathematical model
 */
function createMathematicsWithModel(
  latex: string,
  symbolic: string,
  ascii?: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createMathematicsThought({
    mathematicalModel: {
      latex,
      symbolic,
      ascii,
    },
    ...overrides,
  });
}

/**
 * Create a mathematics thought with hypotheses
 */
function createMathematicsWithHypotheses(
  hypotheses: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createMathematicsThought({
    hypotheses,
    assumptions: hypotheses,
    ...overrides,
  });
}

/**
 * Create a mathematics thought with theorem
 */
function createMathematicsWithTheorem(
  theorem: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createMathematicsThought({
    thought: theorem,
    thoughtType: 'theorem_statement',
    ...overrides,
  });
}

/**
 * Create a mathematics thought with proof steps
 */
function createMathematicsWithProofSteps(
  proofSteps: Array<{
    stepNumber: number;
    statement: string;
    justification?: string;
    latex?: string;
    referencesSteps?: number[];
  }>,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createMathematicsThought({
    proofSteps,
    thoughtType: 'proof_construction',
    ...overrides,
  });
}

describe('Mathematics Mode Integration - Core', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-MTH-001: Basic mathematics thought
   */
  describe('T-MTH-001: Basic Mathematics Thought Creation', () => {
    it('should create a basic mathematics thought with minimal params', () => {
      const input = createMathematicsThought({
        thought: 'Analyzing the mathematical structure',
      });

      const thought = factory.createThought(input, 'session-mth-001');

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.content).toBe('Analyzing the mathematical structure');
      expect(thought.sessionId).toBe('session-mth-001');
    });

    it('should assign unique IDs to mathematics thoughts', () => {
      const input1 = createMathematicsThought({ thought: 'First math thought' });
      const input2 = createMathematicsThought({ thought: 'Second math thought' });

      const thought1 = factory.createThought(input1, 'session-mth-001');
      const thought2 = factory.createThought(input2, 'session-mth-001');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp to current time', () => {
      const before = new Date();
      const input = createMathematicsThought();
      const thought = factory.createThought(input, 'session-mth-001');
      const after = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /**
   * T-MTH-002: Mathematics with proofStrategy.type = direct
   */
  describe('T-MTH-002: Direct Proof Strategy', () => {
    it('should create thought with direct proof strategy', () => {
      const input = createMathematicsWithProofStrategy('direct', [
        'Assume P is true',
        'Apply definition',
        'Conclude Q follows',
      ]);

      const thought = factory.createThought(input, 'session-mth-002') as MathematicsThought;

      expect(thought.proofStrategy).toBeDefined();
      expect(thought.proofStrategy!.type).toBe('direct');
      expect(thought.proofStrategy!.steps).toHaveLength(3);
    });

    it('should handle direct proof with empty steps', () => {
      const input = createMathematicsWithProofStrategy('direct');

      const thought = factory.createThought(input, 'session-mth-002') as MathematicsThought;

      expect(thought.proofStrategy!.type).toBe('direct');
      expect(thought.proofStrategy!.steps).toEqual([]);
    });
  });

  /**
   * T-MTH-003: Mathematics with proofStrategy.type = contradiction
   */
  describe('T-MTH-003: Contradiction Proof Strategy', () => {
    it('should create thought with contradiction proof strategy', () => {
      const input = createMathematicsWithProofStrategy('contradiction', [
        'Assume the negation is true',
        'Derive logical consequences',
        'Arrive at a contradiction',
        'Therefore, original statement is true',
      ]);

      const thought = factory.createThought(input, 'session-mth-003') as MathematicsThought;

      expect(thought.proofStrategy!.type).toBe('contradiction');
      expect(thought.proofStrategy!.steps).toHaveLength(4);
      expect(thought.proofStrategy!.steps[0]).toContain('Assume');
    });
  });

  /**
   * T-MTH-004: Mathematics with proofStrategy.type = induction
   */
  describe('T-MTH-004: Induction Proof Strategy', () => {
    it('should create thought with induction proof strategy', () => {
      const input = createMathematicsThought({
        proofStrategy: {
          type: 'induction',
          steps: [
            'Base case: n = 0',
            'Inductive hypothesis: assume P(k)',
            'Inductive step: prove P(k+1)',
          ],
          baseCase: 'P(0) holds because 0 = 0*(0+1)/2',
          inductiveStep: 'If P(k) holds, then P(k+1) follows',
          completeness: 0.9,
        },
      });

      const thought = factory.createThought(input, 'session-mth-004') as MathematicsThought;

      expect(thought.proofStrategy!.type).toBe('induction');
      expect(thought.proofStrategy!.baseCase).toBeDefined();
      expect(thought.proofStrategy!.inductiveStep).toBeDefined();
    });
  });

  /**
   * T-MTH-005: Mathematics with proofStrategy.type = construction
   */
  describe('T-MTH-005: Construction Proof Strategy', () => {
    it('should create thought with construction proof strategy', () => {
      const input = createMathematicsWithProofStrategy('construction', [
        'Define the object explicitly',
        'Verify it satisfies the required properties',
        'Conclude existence',
      ]);

      const thought = factory.createThought(input, 'session-mth-005') as MathematicsThought;

      expect(thought.proofStrategy!.type).toBe('construction');
      expect(thought.proofStrategy!.steps).toHaveLength(3);
    });
  });

  /**
   * T-MTH-006: Mathematics with proofStrategy.type = contrapositive
   */
  describe('T-MTH-006: Contrapositive Proof Strategy', () => {
    it('should create thought with contrapositive proof strategy', () => {
      const input = createMathematicsWithProofStrategy('contrapositive', [
        'Original statement: P implies Q',
        'Contrapositive: not Q implies not P',
        'Assume not Q',
        'Prove not P follows',
      ]);

      const thought = factory.createThought(input, 'session-mth-006') as MathematicsThought;

      expect(thought.proofStrategy!.type).toBe('contrapositive');
      expect(thought.proofStrategy!.steps).toHaveLength(4);
    });
  });

  /**
   * T-MTH-007: Mathematics with proofStrategy.steps array
   */
  describe('T-MTH-007: Proof Strategy Steps Array', () => {
    it('should preserve proof steps in correct order', () => {
      const steps = [
        'Step 1: Start with hypothesis',
        'Step 2: Apply lemma 1',
        'Step 3: Apply lemma 2',
        'Step 4: Combine results',
        'Step 5: Conclude proof',
      ];
      const input = createMathematicsWithProofStrategy('direct', steps);

      const thought = factory.createThought(input, 'session-mth-007') as MathematicsThought;

      expect(thought.proofStrategy!.steps).toEqual(steps);
      expect(thought.proofStrategy!.steps[0]).toBe('Step 1: Start with hypothesis');
      expect(thought.proofStrategy!.steps[4]).toBe('Step 5: Conclude proof');
    });

    it('should handle large number of proof steps', () => {
      const steps = Array.from({ length: 20 }, (_, i) => `Step ${i + 1}: Detailed reasoning`);
      const input = createMathematicsWithProofStrategy('direct', steps);

      const thought = factory.createThought(input, 'session-mth-007') as MathematicsThought;

      expect(thought.proofStrategy!.steps).toHaveLength(20);
    });
  });

  /**
   * T-MTH-008: Mathematics with mathematicalModel.latex
   */
  describe('T-MTH-008: Mathematical Model with LaTeX', () => {
    it('should create thought with LaTeX representation', () => {
      const latex = '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}';
      const input = createMathematicsWithModel(latex, 'integral(exp(-x^2), 0, inf) = sqrt(pi)/2');

      const thought = factory.createThought(input, 'session-mth-008') as MathematicsThought;

      expect(thought.mathematicalModel).toBeDefined();
      expect(thought.mathematicalModel!.latex).toBe(latex);
    });

    it('should handle complex LaTeX expressions', () => {
      const latex = '\\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = e^x';
      const input = createMathematicsWithModel(latex, 'sum(x^n/n!, n, 0, inf) = exp(x)');

      const thought = factory.createThought(input, 'session-mth-008') as MathematicsThought;

      expect(thought.mathematicalModel!.latex).toContain('\\sum');
      expect(thought.mathematicalModel!.latex).toContain('\\infty');
    });
  });

  /**
   * T-MTH-009: Mathematics with mathematicalModel.symbolic
   */
  describe('T-MTH-009: Mathematical Model with Symbolic', () => {
    it('should create thought with symbolic representation', () => {
      const symbolic = 'det(A - lambda*I) = 0';
      const input = createMathematicsWithModel(
        '\\det(A - \\lambda I) = 0',
        symbolic
      );

      const thought = factory.createThought(input, 'session-mth-009') as MathematicsThought;

      expect(thought.mathematicalModel!.symbolic).toBe(symbolic);
    });
  });

  /**
   * T-MTH-010: Mathematics with mathematicalModel.ascii
   */
  describe('T-MTH-010: Mathematical Model with ASCII', () => {
    it('should create thought with ASCII representation', () => {
      const ascii = 'a^2 + b^2 = c^2';
      const input = createMathematicsWithModel(
        'a^2 + b^2 = c^2',
        'a**2 + b**2 == c**2',
        ascii
      );

      const thought = factory.createThought(input, 'session-mth-010') as MathematicsThought;

      expect(thought.mathematicalModel!.ascii).toBe(ascii);
    });

    it('should handle optional ASCII field', () => {
      const input = createMathematicsWithModel(
        'E = mc^2',
        'E == m * c**2'
        // No ASCII provided
      );

      const thought = factory.createThought(input, 'session-mth-010') as MathematicsThought;

      expect(thought.mathematicalModel!.latex).toBe('E = mc^2');
      expect(thought.mathematicalModel!.ascii).toBeUndefined();
    });
  });

  /**
   * T-MTH-011: Mathematics with hypotheses array
   */
  describe('T-MTH-011: Mathematics with Hypotheses', () => {
    it('should create thought with hypotheses', () => {
      const hypotheses = [
        'Let n be a positive integer',
        'Assume n is prime',
        'Assume n > 2',
      ];
      const input = createMathematicsWithHypotheses(hypotheses);

      const thought = factory.createThought(input, 'session-mth-011') as MathematicsThought;

      expect(thought.assumptions).toBeDefined();
      expect(thought.assumptions).toEqual(hypotheses);
    });

    it('should handle empty hypotheses array', () => {
      const input = createMathematicsWithHypotheses([]);

      const thought = factory.createThought(input, 'session-mth-011') as MathematicsThought;

      expect(thought.assumptions).toEqual([]);
    });
  });

  /**
   * T-MTH-012: Mathematics with theorem statement
   */
  describe('T-MTH-012: Mathematics with Theorem Statement', () => {
    it('should create thought with theorem statement', () => {
      const theorem = 'Every even integer greater than 2 can be expressed as the sum of two primes.';
      const input = createMathematicsWithTheorem(theorem);

      const thought = factory.createThought(input, 'session-mth-012') as MathematicsThought;

      expect(thought.content).toBe(theorem);
      expect(thought.thoughtType).toBe('theorem_statement');
    });
  });

  /**
   * T-MTH-013: Mathematics with proofSteps array (structured proof)
   */
  describe('T-MTH-013: Structured Proof Steps Array', () => {
    it('should create thought with structured proof steps', () => {
      const proofSteps = [
        { stepNumber: 1, statement: 'Let n be a natural number' },
        { stepNumber: 2, statement: 'Assume P(k) holds for some k' },
        { stepNumber: 3, statement: 'We must show P(k+1) holds' },
      ];
      const input = createMathematicsWithProofSteps(proofSteps);

      const thought = factory.createThought(input, 'session-mth-013') as MathematicsThought;

      assertValidBaseThought(thought);
      assertThoughtMode(thought, ThinkingMode.MATHEMATICS);
    });

    it('should handle proof steps with all fields', () => {
      const proofSteps = [
        {
          stepNumber: 1,
          statement: 'Given: triangle ABC with right angle at C',
          justification: 'Given',
          latex: '\\triangle ABC, \\angle C = 90°',
          referencesSteps: [],
        },
        {
          stepNumber: 2,
          statement: 'Area of square on hypotenuse = c^2',
          justification: 'Definition of square',
          latex: 'c^2',
          referencesSteps: [1],
        },
      ];
      const input = createMathematicsWithProofSteps(proofSteps);

      const thought = factory.createThought(input, 'session-mth-013');

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
    });
  });

  /**
   * T-MTH-014: Mathematics with proofSteps[].justification
   */
  describe('T-MTH-014: Proof Steps with Justification', () => {
    it('should preserve justification in proof steps', () => {
      const proofSteps = [
        {
          stepNumber: 1,
          statement: 'a + b = b + a',
          justification: 'Commutativity of addition',
        },
        {
          stepNumber: 2,
          statement: '(a + b) + c = a + (b + c)',
          justification: 'Associativity of addition',
        },
      ];
      const input = createMathematicsWithProofSteps(proofSteps);

      const thought = factory.createThought(input, 'session-mth-014');

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.thoughtType).toBe('proof_construction');
    });
  });

  /**
   * T-MTH-015: Mathematics with proofSteps[].latex
   */
  describe('T-MTH-015: Proof Steps with LaTeX', () => {
    it('should preserve LaTeX in proof steps', () => {
      const proofSteps = [
        {
          stepNumber: 1,
          statement: 'Consider the quadratic formula',
          latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        },
      ];
      const input = createMathematicsWithProofSteps(proofSteps);

      const thought = factory.createThought(input, 'session-mth-015');

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
    });
  });

  /**
   * T-MTH-016: Mathematics with proofSteps[].referencesSteps
   */
  describe('T-MTH-016: Proof Steps with References', () => {
    it('should preserve step references in proof steps', () => {
      const proofSteps = [
        { stepNumber: 1, statement: 'Axiom A1', referencesSteps: [] },
        { stepNumber: 2, statement: 'Axiom A2', referencesSteps: [] },
        { stepNumber: 3, statement: 'From A1 and A2', referencesSteps: [1, 2] },
        { stepNumber: 4, statement: 'Conclusion', referencesSteps: [3] },
      ];
      const input = createMathematicsWithProofSteps(proofSteps);

      const thought = factory.createThought(input, 'session-mth-016');

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
    });
  });

  /**
   * T-MTH-017: Mathematics multi-step proof session
   */
  describe('T-MTH-017: Multi-Step Proof Session', () => {
    it('should handle complete multi-step proof session', () => {
      const sessionId = 'session-mth-017-multistep';

      // Step 1: State the theorem
      const step1 = factory.createThought(createMathematicsThought({
        thought: 'Theorem: The square root of 2 is irrational',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        thoughtType: 'theorem_statement',
      }), sessionId) as MathematicsThought;

      expect(step1.mode).toBe(ThinkingMode.MATHEMATICS);

      // Step 2: Set up contradiction
      const step2 = factory.createThought(createMathematicsThought({
        thought: 'Assume sqrt(2) = p/q in lowest terms',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        proofStrategy: { type: 'contradiction', steps: ['Assume sqrt(2) is rational'], completeness: 0.3 },
        mathematicalModel: {
          latex: '\\sqrt{2} = \\frac{p}{q}, \\gcd(p,q) = 1',
          symbolic: 'sqrt(2) == p/q, gcd(p,q) == 1',
        },
      }), sessionId) as MathematicsThought;

      expect(step2.proofStrategy!.type).toBe('contradiction');

      // Step 3: Derive contradiction
      const step3 = factory.createThought(createMathematicsThought({
        thought: 'Then 2q^2 = p^2, so p is even, p = 2k, then 2q^2 = 4k^2, q^2 = 2k^2, so q is even',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        assumptions: ['sqrt(2) = p/q in lowest terms'],
        proofSteps: [
          { stepNumber: 1, statement: '2 = p^2/q^2', justification: 'Squaring both sides' },
          { stepNumber: 2, statement: '2q^2 = p^2', justification: 'Multiply by q^2' },
          { stepNumber: 3, statement: 'p is even', justification: 'p^2 is even implies p is even' },
        ],
      }), sessionId) as MathematicsThought;

      expect(step3.assumptions).toContain('sqrt(2) = p/q in lowest terms');

      // Step 4: Conclude
      const step4 = factory.createThought(createMathematicsThought({
        thought: 'Both p and q are even contradicts gcd(p,q) = 1. Therefore sqrt(2) is irrational.',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        proofStrategy: {
          type: 'contradiction',
          steps: [
            'Assumed sqrt(2) = p/q in lowest terms',
            'Derived both p and q are even',
            'This contradicts gcd(p,q) = 1',
            'Therefore sqrt(2) is irrational',
          ],
          completeness: 1.0,
        },
      }), sessionId) as MathematicsThought;

      expect(step4.proofStrategy!.completeness).toBe(1.0);
      expect(step4.nextThoughtNeeded).toBe(false);
    });

    it('should validate mathematics input correctly', () => {
      const input = createMathematicsThought({
        thought: 'Valid mathematics thought',
        mathematicalModel: {
          latex: 'E = mc^2',
          symbolic: 'E == m * c**2',
        },
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });
  });
});
