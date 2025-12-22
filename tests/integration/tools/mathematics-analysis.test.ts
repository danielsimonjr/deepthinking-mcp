/**
 * Mathematics Mode Integration Tests - Analysis
 *
 * Tests T-MTH-018 through T-MTH-027: Comprehensive integration tests
 * for the deepthinking_mathematics tool with proof analysis features.
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
// MATHEMATICS ANALYSIS THOUGHT FACTORIES
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
 * Create a mathematics thought with specific thoughtType
 */
function createMathematicsWithThoughtType(
  thoughtType: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createMathematicsThought({
    thoughtType,
    ...overrides,
  });
}

/**
 * Create a mathematics thought with analysis depth
 */
function createMathematicsWithAnalysisDepth(
  analysisDepth: 'shallow' | 'standard' | 'deep',
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createMathematicsThought({
    analysisDepth,
    ...overrides,
  });
}

/**
 * Create a mathematics thought with consistency check flag
 */
function createMathematicsWithConsistencyCheck(
  includeConsistencyCheck: boolean,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createMathematicsThought({
    includeConsistencyCheck,
    ...overrides,
  });
}

/**
 * Create a mathematics thought with trace assumptions flag
 */
function createMathematicsWithTraceAssumptions(
  traceAssumptions: boolean,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createMathematicsThought({
    traceAssumptions,
    ...overrides,
  });
}

describe('Mathematics Mode Integration - Analysis', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-MTH-018: Mathematics with thoughtType = proof_decomposition
   */
  describe('T-MTH-018: Proof Decomposition ThoughtType', () => {
    it('should create thought with proof_decomposition thoughtType', () => {
      const input = createMathematicsWithThoughtType('proof_decomposition', {
        thought: 'Decomposing the proof into atomic statements',
        theorem: 'Pythagorean theorem: a^2 + b^2 = c^2',
      });

      const thought = factory.createThought(input, 'session-mth-018') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.thoughtType).toBe('proof_decomposition');
    });

    it('should handle proof decomposition with theorem context', () => {
      const input = createMathematicsWithThoughtType('proof_decomposition', {
        thought: 'Breaking down Fermat\'s Last Theorem proof',
        proofStrategy: {
          type: 'direct',
          steps: [
            'Identify main claims',
            'Extract atomic statements',
            'Map dependencies',
          ],
          completeness: 0.5,
        },
      });

      const thought = factory.createThought(input, 'session-mth-018') as MathematicsThought;

      expect(thought.proofStrategy!.steps).toHaveLength(3);
    });
  });

  /**
   * T-MTH-019: Mathematics with thoughtType = dependency_analysis
   */
  describe('T-MTH-019: Dependency Analysis ThoughtType', () => {
    it('should create thought with dependency_analysis thoughtType', () => {
      const input = createMathematicsWithThoughtType('dependency_analysis', {
        thought: 'Analyzing the logical dependencies between proof steps',
        dependencies: ['axiom_1', 'lemma_2', 'theorem_3'],
      });

      const thought = factory.createThought(input, 'session-mth-019') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.thoughtType).toBe('dependency_analysis');
      expect(thought.dependencies).toContain('axiom_1');
    });

    it('should handle complex dependency chains', () => {
      const input = createMathematicsWithThoughtType('dependency_analysis', {
        thought: 'Tracing dependency chain for conclusion',
        dependencies: [
          'zorn_lemma',
          'axiom_of_choice',
          'well_ordering_theorem',
          'intermediate_value_theorem',
        ],
      });

      const thought = factory.createThought(input, 'session-mth-019') as MathematicsThought;

      expect(thought.dependencies).toHaveLength(4);
    });
  });

  /**
   * T-MTH-020: Mathematics with thoughtType = consistency_check
   */
  describe('T-MTH-020: Consistency Check ThoughtType', () => {
    it('should create thought with consistency_check thoughtType', () => {
      const input = createMathematicsWithThoughtType('consistency_check', {
        thought: 'Checking for logical inconsistencies in the proof',
        assumptions: [
          'x > 0',
          'x < 0',
        ],
      });

      const thought = factory.createThought(input, 'session-mth-020') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.thoughtType).toBe('consistency_check');
    });

    it('should detect potential inconsistency indicators', () => {
      const input = createMathematicsWithThoughtType('consistency_check', {
        thought: 'Verifying axiom set is consistent',
        assumptions: [
          'Axiom 1: For all x, P(x)',
          'Axiom 2: There exists x such that not P(x)',
        ],
        uncertainty: 0.8,
      });

      const thought = factory.createThought(input, 'session-mth-020') as MathematicsThought;

      expect(thought.uncertainty).toBe(0.8);
    });
  });

  /**
   * T-MTH-021: Mathematics with thoughtType = gap_identification
   */
  describe('T-MTH-021: Gap Identification ThoughtType', () => {
    it('should create thought with gap_identification thoughtType', () => {
      const input = createMathematicsWithThoughtType('gap_identification', {
        thought: 'Identifying missing steps in the proof',
      });

      const thought = factory.createThought(input, 'session-mth-021') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.thoughtType).toBe('gap_identification');
    });

    it('should handle gap identification with proof steps', () => {
      const input = createMathematicsWithThoughtType('gap_identification', {
        thought: 'Found gap between step 3 and step 4',
        proofSteps: [
          { stepNumber: 1, statement: 'Given: n is even' },
          { stepNumber: 2, statement: 'n = 2k for some integer k' },
          { stepNumber: 3, statement: 'n^2 = 4k^2' },
          { stepNumber: 4, statement: 'n^2 is divisible by 4' },
        ],
      });

      const thought = factory.createThought(input, 'session-mth-021') as MathematicsThought;

      expect(thought.content).toContain('gap');
    });
  });

  /**
   * T-MTH-022: Mathematics with thoughtType = assumption_trace
   */
  describe('T-MTH-022: Assumption Trace ThoughtType', () => {
    it('should create thought with assumption_trace thoughtType', () => {
      const input = createMathematicsWithThoughtType('assumption_trace', {
        thought: 'Tracing back to foundational axioms',
        assumptions: [
          'Peano axioms',
          'Axiom of infinity',
          'Axiom of replacement',
        ],
      });

      const thought = factory.createThought(input, 'session-mth-022') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.thoughtType).toBe('assumption_trace');
      expect(thought.assumptions).toHaveLength(3);
    });

    it('should handle hierarchical assumption tracing', () => {
      const input = createMathematicsWithThoughtType('assumption_trace', {
        thought: 'Building assumption chain from conclusion to axioms',
        assumptions: [
          'ZFC1: Extensionality',
          'ZFC2: Regularity',
          'ZFC3: Schema of specification',
          'ZFC4: Pairing',
          'ZFC5: Union',
          'ZFC6: Schema of replacement',
          'ZFC7: Infinity',
          'ZFC8: Power set',
          'ZFC9: Choice',
        ],
        dependencies: ['fundamental_theorem_of_arithmetic', 'well_ordering'],
      });

      const thought = factory.createThought(input, 'session-mth-022') as MathematicsThought;

      expect(thought.assumptions).toHaveLength(9);
      expect(thought.dependencies).toHaveLength(2);
    });
  });

  /**
   * T-MTH-023: Mathematics with analysisDepth = shallow
   */
  describe('T-MTH-023: Shallow Analysis Depth', () => {
    it('should create thought with shallow analysis depth', () => {
      const input = createMathematicsWithAnalysisDepth('shallow', {
        thought: 'Quick surface-level analysis of the proof structure',
      });

      const thought = factory.createThought(input, 'session-mth-023') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      assertValidBaseThought(thought);
    });

    it('should handle shallow analysis with minimal processing', () => {
      const input = createMathematicsWithAnalysisDepth('shallow', {
        thought: 'Identifying main claims without deep verification',
        uncertainty: 0.6,
      });

      const thought = factory.createThought(input, 'session-mth-023') as MathematicsThought;

      expect(thought.uncertainty).toBe(0.6);
    });
  });

  /**
   * T-MTH-024: Mathematics with analysisDepth = standard
   */
  describe('T-MTH-024: Standard Analysis Depth', () => {
    it('should create thought with standard analysis depth', () => {
      const input = createMathematicsWithAnalysisDepth('standard', {
        thought: 'Standard analysis with step-by-step verification',
        proofStrategy: {
          type: 'direct',
          steps: ['Verify each step', 'Check logical flow', 'Validate conclusion'],
          completeness: 0.7,
        },
      });

      const thought = factory.createThought(input, 'session-mth-024') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.proofStrategy!.completeness).toBe(0.7);
    });
  });

  /**
   * T-MTH-025: Mathematics with analysisDepth = deep
   */
  describe('T-MTH-025: Deep Analysis Depth', () => {
    it('should create thought with deep analysis depth', () => {
      const input = createMathematicsWithAnalysisDepth('deep', {
        thought: 'Comprehensive deep analysis with all checks enabled',
        includeConsistencyCheck: true,
        traceAssumptions: true,
      });

      const thought = factory.createThought(input, 'session-mth-025') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      assertValidBaseThought(thought);
    });

    it('should handle deep analysis with full decomposition', () => {
      const input = createMathematicsWithAnalysisDepth('deep', {
        thought: 'Deep analysis of Euclid\'s proof of infinite primes',
        thoughtType: 'proof_decomposition',
        proofStrategy: {
          type: 'contradiction',
          steps: [
            'Assume finite set of primes p1...pn',
            'Construct N = p1*p2*...*pn + 1',
            'N is not divisible by any prime in the set',
            'N must have a prime factor not in the set',
            'Contradiction: our set was not complete',
          ],
          completeness: 1.0,
        },
        assumptions: ['Every integer greater than 1 has a prime factorization'],
        uncertainty: 0.1,
      });

      const thought = factory.createThought(input, 'session-mth-025') as MathematicsThought;

      expect(thought.proofStrategy!.type).toBe('contradiction');
      expect(thought.proofStrategy!.completeness).toBe(1.0);
      expect(thought.uncertainty).toBe(0.1);
    });
  });

  /**
   * T-MTH-026: Mathematics with includeConsistencyCheck = true
   */
  describe('T-MTH-026: Include Consistency Check', () => {
    it('should create thought with consistency check enabled', () => {
      const input = createMathematicsWithConsistencyCheck(true, {
        thought: 'Verifying consistency of axiom system',
        assumptions: [
          'Axiom 1',
          'Axiom 2',
          'Axiom 3',
        ],
      });

      const thought = factory.createThought(input, 'session-mth-026') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.assumptions).toHaveLength(3);
    });

    it('should handle consistency check with contradictory assumptions', () => {
      const input = createMathematicsWithConsistencyCheck(true, {
        thought: 'Checking for contradictions',
        assumptions: [
          'The set S is finite',
          'The set S has no maximum element',
        ],
        uncertainty: 0.9,
      });

      const thought = factory.createThought(input, 'session-mth-026') as MathematicsThought;

      expect(thought.uncertainty).toBe(0.9);
    });
  });

  /**
   * T-MTH-027: Mathematics with traceAssumptions = true
   */
  describe('T-MTH-027: Trace Assumptions', () => {
    it('should create thought with assumption tracing enabled', () => {
      const input = createMathematicsWithTraceAssumptions(true, {
        thought: 'Tracing all implicit and explicit assumptions',
        assumptions: [
          'Continuity of f on [a,b]',
          'f(a) < 0',
          'f(b) > 0',
        ],
      });

      const thought = factory.createThought(input, 'session-mth-027') as MathematicsThought;

      expect(thought.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(thought.assumptions).toHaveLength(3);
    });

    it('should handle assumption tracing with dependency chain', () => {
      const input = createMathematicsWithTraceAssumptions(true, {
        thought: 'Building complete assumption dependency graph',
        thoughtType: 'assumption_trace',
        assumptions: [
          'Real numbers are complete',
          'Continuous functions preserve connectedness',
          'Bounded monotone sequences converge',
        ],
        dependencies: ['bolzano_weierstrass', 'intermediate_value_theorem'],
      });

      const thought = factory.createThought(input, 'session-mth-027') as MathematicsThought;

      expect(thought.thoughtType).toBe('assumption_trace');
      expect(thought.dependencies).toHaveLength(2);
    });

    it('should validate mathematics analysis input correctly', () => {
      const input = createMathematicsWithThoughtType('proof_decomposition', {
        thought: 'Valid proof decomposition',
        traceAssumptions: true,
        includeConsistencyCheck: true,
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });
  });
});
