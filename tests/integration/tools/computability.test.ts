/**
 * Computability Mode Integration Tests
 *
 * Tests T-MTH-046 through T-MTH-054: Comprehensive integration tests
 * for the deepthinking_mathematics tool with computability mode.
 *
 * Phase 11 Sprint 3: Mathematics, Physics & Computability Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type ComputabilityThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { createBaseThought } from '../../utils/thought-factory.js';
import {
  assertValidBaseThought,
  assertThoughtMode,
  assertValidationPassed,
} from '../../utils/assertion-helpers.js';

// ============================================================================
// COMPUTABILITY MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic computability thought with required params only
 */
function createComputabilityThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'computability',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create a computability thought with Turing machine
 */
function createComputabilityWithMachine(
  machine: {
    id: string;
    name: string;
    states: string[];
    inputAlphabet: string[];
    tapeAlphabet: string[];
    blankSymbol: string;
    transitions: Array<{
      fromState: string;
      readSymbol: string;
      toState: string;
      writeSymbol: string;
      direction: 'L' | 'R' | 'S';
    }>;
    initialState: string;
    acceptStates: string[];
    rejectStates: string[];
    type: 'deterministic' | 'nondeterministic' | 'multi_tape' | 'oracle';
  },
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createComputabilityThought({
    currentMachine: machine,
    machines: [machine],
    thoughtType: 'machine_definition',
    ...overrides,
  });
}

/**
 * Create a computability thought with decidability analysis
 */
function createComputabilityWithDecidability(
  problem: {
    id: string;
    name: string;
    description: string;
    inputFormat: string;
    question: string;
    decidabilityStatus: 'decidable' | 'semi_decidable' | 'undecidable' | 'unknown';
  },
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createComputabilityThought({
    currentProblem: problem,
    problems: [problem],
    thoughtType: 'decidability_proof',
    ...overrides,
  });
}

/**
 * Create a computability thought with reduction
 */
function createComputabilityWithReduction(
  reduction: {
    id: string;
    fromProblem: string;
    toProblem: string;
    type: 'many_one' | 'turing' | 'polynomial_time' | 'log_space';
    reductionFunction: {
      description: string;
      inputTransformation: string;
      outputInterpretation: string;
      preserves: string;
    };
    correctnessProof: {
      forwardDirection: string;
      backwardDirection: string;
    };
  },
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createComputabilityThought({
    reductions: [reduction],
    thoughtType: 'reduction_construction',
    ...overrides,
  });
}

describe('Computability Mode Integration', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-MTH-046: Basic computability thought
   */
  describe('T-MTH-046: Basic Computability Thought Creation', () => {
    it('should create a basic computability thought with minimal params', () => {
      const input = createComputabilityThought({
        thought: 'Analyzing the decidability of language recognition',
      });

      const thought = factory.createThought(input, 'session-cmp-046');

      expect(thought.mode).toBe(ThinkingMode.COMPUTABILITY);
      expect(thought.content).toBe('Analyzing the decidability of language recognition');
      expect(thought.sessionId).toBe('session-cmp-046');
    });

    it('should assign unique IDs to computability thoughts', () => {
      const input1 = createComputabilityThought({ thought: 'First computability thought' });
      const input2 = createComputabilityThought({ thought: 'Second computability thought' });

      const thought1 = factory.createThought(input1, 'session-cmp-046');
      const thought2 = factory.createThought(input2, 'session-cmp-046');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp correctly', () => {
      const before = new Date();
      const input = createComputabilityThought();
      const thought = factory.createThought(input, 'session-cmp-046');
      const after = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /**
   * T-MTH-047: Computability Turing machine definition
   */
  describe('T-MTH-047: Turing Machine Definition', () => {
    it('should create thought with complete Turing machine', () => {
      const machine = {
        id: 'tm-001',
        name: 'Binary Increment',
        states: ['q0', 'q1', 'q2', 'qaccept', 'qreject'],
        inputAlphabet: ['0', '1'],
        tapeAlphabet: ['0', '1', '_'],
        blankSymbol: '_',
        transitions: [
          { fromState: 'q0', readSymbol: '0', toState: 'q0', writeSymbol: '0', direction: 'R' as const },
          { fromState: 'q0', readSymbol: '1', toState: 'q0', writeSymbol: '1', direction: 'R' as const },
          { fromState: 'q0', readSymbol: '_', toState: 'q1', writeSymbol: '_', direction: 'L' as const },
          { fromState: 'q1', readSymbol: '0', toState: 'qaccept', writeSymbol: '1', direction: 'S' as const },
          { fromState: 'q1', readSymbol: '1', toState: 'q1', writeSymbol: '0', direction: 'L' as const },
          { fromState: 'q1', readSymbol: '_', toState: 'qaccept', writeSymbol: '1', direction: 'S' as const },
        ],
        initialState: 'q0',
        acceptStates: ['qaccept'],
        rejectStates: ['qreject'],
        type: 'deterministic' as const,
      };

      const input = createComputabilityWithMachine(machine, {
        thought: 'Defining a Turing machine that increments binary numbers',
      });

      const thought = factory.createThought(input, 'session-cmp-047') as ComputabilityThought;

      expect(thought.mode).toBe(ThinkingMode.COMPUTABILITY);
      expect(thought.currentMachine).toBeDefined();
      expect(thought.currentMachine!.name).toBe('Binary Increment');
      expect(thought.currentMachine!.states).toContain('q0');
      expect(thought.currentMachine!.type).toBe('deterministic');
    });

    it('should handle nondeterministic Turing machine', () => {
      const machine = {
        id: 'ntm-001',
        name: 'NTM for SAT',
        states: ['q0', 'qguess', 'qverify', 'qaccept', 'qreject'],
        inputAlphabet: ['0', '1', '(', ')', '&', '|', '!'],
        tapeAlphabet: ['0', '1', '(', ')', '&', '|', '!', '_'],
        blankSymbol: '_',
        transitions: [
          { fromState: 'q0', readSymbol: '0', toState: 'qguess', writeSymbol: '0', direction: 'R' as const },
          { fromState: 'qguess', readSymbol: '_', toState: 'qverify', writeSymbol: '_', direction: 'L' as const },
        ],
        initialState: 'q0',
        acceptStates: ['qaccept'],
        rejectStates: ['qreject'],
        type: 'nondeterministic' as const,
      };

      const input = createComputabilityWithMachine(machine, {
        thought: 'NTM that nondeterministically guesses a satisfying assignment',
      });

      const thought = factory.createThought(input, 'session-cmp-047') as ComputabilityThought;

      expect(thought.currentMachine!.type).toBe('nondeterministic');
    });
  });

  /**
   * T-MTH-048: Computability decidability analysis
   */
  describe('T-MTH-048: Decidability Analysis', () => {
    it('should create thought with decidability analysis', () => {
      const problem = {
        id: 'prob-001',
        name: 'FINITE_TM',
        description: 'Given a TM M, is L(M) finite?',
        inputFormat: 'Encoding of a Turing machine M',
        question: 'Is the language recognized by M finite?',
        decidabilityStatus: 'undecidable' as const,
      };

      const input = createComputabilityWithDecidability(problem, {
        thought: 'Analyzing the decidability of FINITE_TM problem',
      });

      const thought = factory.createThought(input, 'session-cmp-048') as ComputabilityThought;

      expect(thought.currentProblem).toBeDefined();
      expect(thought.currentProblem!.name).toBe('FINITE_TM');
      expect(thought.currentProblem!.decidabilityStatus).toBe('undecidable');
    });

    it('should handle semi-decidable problem', () => {
      const problem = {
        id: 'prob-002',
        name: 'A_TM',
        description: 'Given a TM M and input w, does M accept w?',
        inputFormat: 'Encoding <M, w>',
        question: 'Does M accept w?',
        decidabilityStatus: 'semi_decidable' as const,
      };

      const input = createComputabilityWithDecidability(problem, {
        thought: 'The acceptance problem is semi-decidable but not decidable',
      });

      const thought = factory.createThought(input, 'session-cmp-048') as ComputabilityThought;

      expect(thought.currentProblem!.decidabilityStatus).toBe('semi_decidable');
    });
  });

  /**
   * T-MTH-049: Computability halting problem reference
   */
  describe('T-MTH-049: Halting Problem Reference', () => {
    it('should create thought referencing halting problem', () => {
      const input = createComputabilityThought({
        thought: 'The halting problem is undecidable - proved by Turing in 1936',
        classicProblems: ['halting_problem'],
        keyInsight: 'Diagonalization argument shows no TM can decide HALT',
      });

      const thought = factory.createThought(input, 'session-cmp-049') as ComputabilityThought;

      expect(thought.classicProblems).toContain('halting_problem');
      expect(thought.keyInsight).toContain('Diagonalization');
    });

    it('should reference multiple classic undecidable problems', () => {
      const input = createComputabilityThought({
        thought: 'Many problems reduce to the halting problem',
        classicProblems: [
          'halting_problem',
          'acceptance_problem',
          'emptiness_problem',
          'equivalence_problem',
        ],
      });

      const thought = factory.createThought(input, 'session-cmp-049') as ComputabilityThought;

      expect(thought.classicProblems).toHaveLength(4);
    });
  });

  /**
   * T-MTH-050: Computability reduction proof
   */
  describe('T-MTH-050: Reduction Proof', () => {
    it('should create thought with many-one reduction', () => {
      const reduction = {
        id: 'red-001',
        fromProblem: 'A_TM',
        toProblem: 'HALT_TM',
        type: 'many_one' as const,
        reductionFunction: {
          description: 'Transform acceptance to halting',
          inputTransformation: 'Given <M, w>, construct <M\', w> where M\' modifies M to halt on accept/reject',
          outputInterpretation: 'M accepts w iff M\' halts on w',
          preserves: 'Yes/No answer',
        },
        correctnessProof: {
          forwardDirection: 'If M accepts w, then M\' halts on w (in accept state)',
          backwardDirection: 'If M\' halts on w, then M either accepts or rejects, so we can determine acceptance',
        },
      };

      const input = createComputabilityWithReduction(reduction, {
        thought: 'Reducing A_TM to HALT_TM via many-one reduction',
      });

      const thought = factory.createThought(input, 'session-cmp-050') as ComputabilityThought;

      expect(thought.reductions).toHaveLength(1);
      expect(thought.reductions![0].type).toBe('many_one');
      expect(thought.reductions![0].fromProblem).toBe('A_TM');
      expect(thought.reductions![0].toProblem).toBe('HALT_TM');
    });
  });

  /**
   * T-MTH-051: Computability complexity class analysis
   */
  describe('T-MTH-051: Complexity Class Analysis', () => {
    it('should create thought with complexity analysis', () => {
      const input = createComputabilityThought({
        thought: 'Analyzing the complexity of SAT',
        complexityAnalysis: {
          id: 'cx-001',
          problem: 'SAT',
          timeComplexity: {
            upperBound: 'O(2^n)',
            worstCase: 'O(2^n)',
          },
          spaceComplexity: {
            upperBound: 'O(n)',
          },
          complexityClass: 'NP-complete',
          classJustification: 'Cook-Levin theorem proves SAT is NP-complete',
          hardnessResults: {
            hardFor: 'NP',
            completeFor: 'NP',
            reductionUsed: 'Polynomial-time reduction from any NP problem',
          },
        },
      });

      const thought = factory.createThought(input, 'session-cmp-051') as ComputabilityThought;

      expect(thought.complexityAnalysis).toBeDefined();
      expect(thought.complexityAnalysis!.complexityClass).toBe('NP-complete');
      expect(thought.complexityAnalysis!.hardnessResults!.completeFor).toBe('NP');
    });
  });

  /**
   * T-MTH-052: Computability multi-thought session
   */
  describe('T-MTH-052: Multi-Thought Session', () => {
    it('should handle complete undecidability proof session', () => {
      const sessionId = 'session-cmp-052-multistep';

      // Step 1: State the problem
      const step1 = factory.createThought(createComputabilityThought({
        thought: 'Prove that E_TM (is L(M) empty?) is undecidable',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        thoughtType: 'decidability_proof',
        currentProblem: {
          id: 'E_TM',
          name: 'E_TM',
          description: 'Given TM M, is L(M) = empty?',
          inputFormat: '<M>',
          question: 'Is L(M) empty?',
          decidabilityStatus: 'unknown' as any,
          yesInstances: [],
          noInstances: [],
        },
      }), sessionId) as ComputabilityThought;

      expect(step1.mode).toBe(ThinkingMode.COMPUTABILITY);

      // Step 2: Set up the reduction
      const step2 = factory.createThought(createComputabilityThought({
        thought: 'Reduce A_TM to complement of E_TM',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        thoughtType: 'reduction_construction',
        classicProblems: ['acceptance_problem'],
      }), sessionId) as ComputabilityThought;

      expect(step2.classicProblems).toContain('acceptance_problem');

      // Step 3: Construct the reduction
      const step3 = factory.createThought(createComputabilityThought({
        thought: 'Given <M,w>, construct M\' that accepts all inputs iff M accepts w',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        reductions: [{
          id: 'red-E_TM',
          fromProblem: 'A_TM',
          toProblem: 'NOT_E_TM',
          type: 'many_one' as const,
          reductionFunction: {
            description: 'Construct M\' from <M,w>',
            inputTransformation: 'M\'(x) = simulate M on w, if accepts then accept x',
            outputInterpretation: 'L(M\') is nonempty iff M accepts w',
            preserves: 'membership',
          },
          correctnessProof: {
            forwardDirection: 'If M accepts w, M\' accepts all inputs, so L(M\') is nonempty',
            backwardDirection: 'If L(M\') is nonempty, M\' accepted some input, so M accepted w',
          },
        }],
      }), sessionId) as ComputabilityThought;

      expect(step3.reductions).toHaveLength(1);

      // Step 4: Conclude
      const step4 = factory.createThought(createComputabilityThought({
        thought: 'E_TM is undecidable because A_TM reduces to its complement',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        keyInsight: 'E_TM is not even semi-decidable (co-semi-decidable)',
        decidabilityProof: {
          id: 'proof-E_TM',
          problem: 'E_TM',
          conclusion: 'undecidable',
          method: 'reduction',
          knownUndecidableProblem: 'A_TM',
          proofSteps: [
            'Assume E_TM is decidable',
            'Use decider for E_TM to decide A_TM',
            'Contradiction: A_TM is undecidable',
          ],
          keyInsights: ['E_TM is not semi-decidable either'],
        },
      }), sessionId) as ComputabilityThought;

      expect(step4.decidabilityProof).toBeDefined();
      expect(step4.decidabilityProof!.conclusion).toBe('undecidable');
      expect(step4.nextThoughtNeeded).toBe(false);
    });
  });

  /**
   * T-MTH-053: Computability with proofStrategy
   */
  describe('T-MTH-053: Computability with Proof Strategy', () => {
    it('should create computability thought with proof strategy', () => {
      const input = createComputabilityThought({
        thought: 'Using diagonalization to prove HALT is undecidable',
        proofStrategy: {
          type: 'contradiction',
          steps: [
            'Assume HALT is decidable by some TM H',
            'Construct D that runs H on <M,M> and does opposite',
            'Ask: Does D halt on <D>?',
            'If yes, D loops (contradiction). If no, D halts (contradiction)',
          ],
          completeness: 1.0,
        },
        diagonalization: {
          id: 'diag-halt',
          enumeration: {
            description: 'Enumerate all Turing machines',
            indexSet: 'Natural numbers',
            enumeratedObjects: 'Turing machines',
          },
          diagonalConstruction: {
            description: 'Construct D that differs from M_i on input i',
            rule: 'D(i) = opposite of H(<M_i, i>)',
            resultingObject: 'A machine D not in the enumeration',
          },
          contradiction: {
            assumption: 'HALT is decidable',
            consequence: 'D must be in the enumeration as some M_k',
            impossibility: 'D(k) cannot equal M_k(k) by construction',
          },
          pattern: 'turing',
        },
      });

      const thought = factory.createThought(input, 'session-cmp-053') as ComputabilityThought;

      expect(thought.diagonalization).toBeDefined();
      expect(thought.diagonalization!.pattern).toBe('turing');
    });
  });

  /**
   * T-MTH-054: Computability with mathematicalModel
   */
  describe('T-MTH-054: Computability with Mathematical Model', () => {
    it('should create computability thought with mathematical model', () => {
      const input = createComputabilityThought({
        thought: 'Formal definition of computation',
        mathematicalModel: {
          latex: 'M = (Q, \\Sigma, \\Gamma, \\delta, q_0, q_{accept}, q_{reject})',
          symbolic: 'TM = (States, InputAlphabet, TapeAlphabet, Transition, Start, Accept, Reject)',
          ascii: 'M = (Q, Sigma, Gamma, delta, q0, qa, qr)',
        },
      });

      const thought = factory.createThought(input, 'session-cmp-054') as ComputabilityThought;

      assertValidBaseThought(thought);
      assertThoughtMode(thought, ThinkingMode.COMPUTABILITY);
    });

    it('should validate computability input correctly', () => {
      const input = createComputabilityThought({
        thought: 'Valid computability thought',
        classicProblems: ['halting_problem'],
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });
  });
});
