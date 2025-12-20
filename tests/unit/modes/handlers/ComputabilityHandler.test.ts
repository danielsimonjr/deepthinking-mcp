/**
 * ComputabilityHandler Unit Tests
 *
 * Tests for Computability Theory reasoning mode handler including:
 * - Turing machine definition and validation
 * - Decidability proof structure
 * - Reduction construction tracking
 * - Diagonalization argument support
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComputabilityHandler } from '../../../../src/modes/handlers/ComputabilityHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('ComputabilityHandler', () => {
  let handler: ComputabilityHandler;

  beforeEach(() => {
    handler = new ComputabilityHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.COMPUTABILITY);
    });

    it('should have descriptive mode name', () => {
      expect(handler.modeName).toBe('Computability Theory');
    });

    it('should have meaningful description', () => {
      expect(handler.description).toContain('Turing');
      expect(handler.description).toContain('decidability');
    });
  });

  describe('createThought', () => {
    it('should create basic computability thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing decidability of the halting problem',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'computability',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.COMPUTABILITY);
      expect(thought.content).toBe('Analyzing decidability of the halting problem');
      expect(thought.sessionId).toBe('session-123');
      expect(thought.thoughtType).toBe('machine_definition'); // Default
    });

    it('should include Turing machine definitions', () => {
      const input: any = {
        thought: 'Defining a Turing machine for string reversal',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'machine_definition',
        machines: [
          {
            name: 'StringReverser',
            states: ['q0', 'q1', 'q2', 'qaccept', 'qreject'],
            inputAlphabet: ['0', '1'],
            tapeAlphabet: ['0', '1', 'X', '_'],
            blankSymbol: '_',
            transitions: [
              { from: 'q0', read: '0', to: 'q1', write: 'X', move: 'R' },
            ],
            initialState: 'q0',
            acceptStates: ['qaccept'],
            rejectStates: ['qreject'],
            type: 'deterministic',
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.machines).toBeDefined();
      expect(thought.machines?.length).toBe(1);
      expect(thought.machines?.[0].name).toBe('StringReverser');
      expect(thought.machines?.[0].type).toBe('deterministic');
      expect(thought.currentMachine).toBeDefined();
    });

    it('should include decidability proof', () => {
      const input: any = {
        thought: 'Proving undecidability via reduction',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'decidability_proof',
        decidabilityProof: {
          problem: 'A_TM (acceptance problem)',
          conclusion: 'undecidable',
          method: 'reduction',
          knownUndecidableProblem: 'HALT_TM',
          proofSteps: [
            'Assume A_TM is decidable',
            'Construct decider for HALT_TM using A_TM',
            'This contradicts undecidability of HALT_TM',
          ],
          keyInsights: ['Reduction preserves undecidability'],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.decidabilityProof).toBeDefined();
      expect(thought.decidabilityProof?.conclusion).toBe('undecidable');
      expect(thought.decidabilityProof?.method).toBe('reduction');
      expect(thought.decidabilityProof?.proofSteps.length).toBe(3);
    });

    it('should include reductions', () => {
      const input: any = {
        thought: 'Constructing many-one reduction',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'reduction_construction',
        reductions: [
          {
            fromProblem: 'HALT_TM',
            toProblem: 'A_TM',
            type: 'many_one',
            reductionFunction: {
              description: 'Map (M, w) to (M\', w\')',
              inputTransformation: 'Construct M\' that simulates M on w',
              outputInterpretation: 'M\' accepts iff M halts on w',
              preserves: 'membership',
            },
            correctnessProof: {
              forwardDirection: 'If M halts on w, then M\' accepts w\'',
              backwardDirection: 'If M\' accepts w\', then M halts on w',
            },
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.reductions).toBeDefined();
      expect(thought.reductions?.length).toBe(1);
      expect(thought.reductions?.[0].type).toBe('many_one');
      expect(thought.reductions?.[0].fromProblem).toBe('HALT_TM');
    });

    it('should include diagonalization argument', () => {
      const input: any = {
        thought: 'Diagonalization proof for halting problem',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'diagonalization',
        diagonalization: {
          enumeration: {
            description: 'Enumeration of all Turing machines',
            indexSet: 'natural numbers',
            enumeratedObjects: 'Turing machines M_0, M_1, M_2, ...',
          },
          diagonalConstruction: {
            description: 'Construct D that disagrees with each M_i on input i',
            rule: 'D(i) = opposite of M_i(i) if M_i(i) halts',
            resultingObject: 'Machine D that differs from all machines in enumeration',
          },
          contradiction: {
            assumption: 'Assume D is in the enumeration as M_k',
            consequence: 'D(k) must equal M_k(k) but also differ from it',
            impossibility: 'Self-reference leads to contradiction',
          },
          pattern: 'turing_halting',
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.diagonalization).toBeDefined();
      expect(thought.diagonalization?.pattern).toBe('turing_halting');
      expect(thought.diagonalization?.contradiction.impossibility).toContain('contradiction');
    });

    it('should handle all valid thought types', () => {
      const thoughtTypes = [
        'machine_definition',
        'computation_trace',
        'decidability_proof',
        'reduction_construction',
        'complexity_analysis',
        'oracle_reasoning',
        'diagonalization',
      ];

      for (const thoughtType of thoughtTypes) {
        const input: any = {
          thought: `Testing ${thoughtType}`,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'computability',
          thoughtType,
        };

        const thought = handler.createThought(input, 'session-123');
        expect(thought.thoughtType).toBe(thoughtType);
      }
    });

    it('should default to machine_definition for unknown thought type', () => {
      const input: any = {
        thought: 'Unknown type',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'computability',
        thoughtType: 'invalid_type',
      };

      const thought = handler.createThought(input, 'session-123');
      expect(thought.thoughtType).toBe('machine_definition');
    });

    it('should handle computation trace', () => {
      const input: any = {
        thought: 'Tracing computation',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'computability',
        thoughtType: 'computation_trace',
        computationTrace: {
          input: '101',
          configurations: ['q0|101', '1q1|01', '10q1|1'],
          totalSteps: 15,
          result: 'accept',
          spaceUsed: 4,
        },
      };

      const thought = handler.createThought(input, 'session-123');
      expect(thought.computationTrace).toBeDefined();
      expect(thought.computationTrace?.totalSteps).toBe(15);
    });

    it('should handle complexity analysis', () => {
      const input: any = {
        thought: 'Complexity class analysis',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'computability',
        thoughtType: 'complexity_analysis',
        complexityAnalysis: {
          complexityClass: 'NP-complete',
          timeComplexity: 'O(2^n)',
          spaceComplexity: 'O(n)',
          completeness: true,
        },
      };

      const thought = handler.createThought(input, 'session-123');
      expect(thought.complexityAnalysis?.complexityClass).toBe('NP-complete');
    });

    it('should handle classic problem references', () => {
      const input: any = {
        thought: 'Relating to classic undecidable problems',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'computability',
        classicProblems: ['halting_problem', 'post_correspondence'],
        keyInsight: "Rice's theorem applies",
      };

      const thought = handler.createThought(input, 'session-123');
      expect(thought.classicProblems).toContain('halting_problem');
      expect(thought.keyInsight).toContain("Rice's theorem");
    });

    it('should track revision information', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised proof',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        isRevision: true,
        revisesThought: 'thought-1',
      };

      const thought = handler.createThought(input, 'session-123');
      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1');
    });
  });

  describe('validate', () => {
    it('should validate basic computability input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid computability thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should reject empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_THOUGHT');
    });

    it('should reject invalid thought number', () => {
      const input: ThinkingToolInput = {
        thought: 'Computability analysis',
        thoughtNumber: 10,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'computability',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_THOUGHT_NUMBER');
    });

    it('should reject uncertainty out of range', () => {
      const input: ThinkingToolInput = {
        thought: 'Computability analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        uncertainty: -0.5,
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('UNCERTAINTY_OUT_OF_RANGE');
    });

    it('should warn about unknown thought type', () => {
      const input: any = {
        thought: 'Computability analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'unknown_type',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'thoughtType')).toBe(true);
    });

    it('should warn about machine without states', () => {
      const input: any = {
        thought: 'Machine definition',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        machines: [
          {
            name: 'EmptyMachine',
            states: [],
            transitions: [],
          },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('states'))).toBe(true);
    });

    it('should warn about machine without transitions', () => {
      const input: any = {
        thought: 'Machine definition',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        machines: [
          {
            name: 'NoTransitions',
            states: ['q0'],
            transitions: [],
          },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('transitions'))).toBe(true);
    });

    it('should warn about machine without accept states', () => {
      const input: any = {
        thought: 'Machine definition',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        machines: [
          {
            name: 'NoAcceptStates',
            states: ['q0', 'q1'],
            transitions: [{ from: 'q0', to: 'q1', read: '0', write: '1', move: 'R' }],
            acceptStates: [],
          },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('acceptStates'))).toBe(true);
    });

    it('should warn about machine_definition without machines', () => {
      const input: any = {
        thought: 'Machine definition thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'machine_definition',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'machines')).toBe(true);
    });

    it('should warn about decidability proof without problem', () => {
      const input: any = {
        thought: 'Decidability proof',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        decidabilityProof: {
          conclusion: 'undecidable',
          method: 'reduction',
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('problem'))).toBe(true);
    });

    it('should warn about decidability proof without steps', () => {
      const input: any = {
        thought: 'Decidability proof',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        decidabilityProof: {
          problem: 'A_TM',
          conclusion: 'undecidable',
          proofSteps: [],
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('proofSteps'))).toBe(true);
    });

    it('should warn about reduction proof without details', () => {
      const input: any = {
        thought: 'Reduction proof',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        decidabilityProof: {
          problem: 'E_TM',
          conclusion: 'undecidable',
          method: 'reduction',
          proofSteps: ['Step 1'],
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.suggestion?.includes('reduction'))).toBe(true);
    });

    it('should warn about reduction without problems specified', () => {
      const input: any = {
        thought: 'Reduction',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        reductions: [
          {
            type: 'many_one',
          },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('reductions'))).toBe(true);
    });

    it('should warn about reduction without correctness proof', () => {
      const input: any = {
        thought: 'Reduction',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        reductions: [
          {
            fromProblem: 'HALT',
            toProblem: 'A_TM',
            type: 'many_one',
          },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('correctnessProof'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide base enhancements', () => {
      const input: ThinkingToolInput = {
        thought: 'Computability analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
      expect(enhancements.relatedModes).toContain(ThinkingMode.ALGORITHMIC);
      expect(enhancements.mentalModels).toContain('Turing Machine Model');
      expect(enhancements.mentalModels).toContain('Diagonalization');
    });

    it('should provide machine definition guidance', () => {
      const input: any = {
        thought: 'Machine definition',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'machine_definition',
        machines: [
          {
            name: 'TestMachine',
            states: ['q0', 'q1', 'qaccept'],
            transitions: [
              { from: 'q0', to: 'q1', read: '0', write: '1', move: 'R' },
            ],
            type: 'deterministic',
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('transition function')
      );
      expect(enhancements.metrics?.stateCount).toBe(3);
      expect(enhancements.metrics?.transitionCount).toBe(1);
    });

    it('should provide computation trace guidance', () => {
      const input: any = {
        thought: 'Computation trace',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'computation_trace',
        computationTrace: {
          input: '101',
          totalSteps: 25,
          spaceUsed: 6,
          result: 'accept',
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('terminate')
      );
      expect(enhancements.metrics?.totalSteps).toBe(25);
      expect(enhancements.metrics?.spaceUsed).toBe(6);
    });

    it('should provide decidability proof guidance', () => {
      const input: any = {
        thought: 'Decidability proof',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'decidability_proof',
        decidabilityProof: {
          problem: 'E_TM',
          conclusion: 'undecidable',
          method: 'reduction',
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('proof method')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('undecidable')
      );
    });

    it('should provide reduction construction guidance', () => {
      const input: any = {
        thought: 'Reduction construction',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'reduction_construction',
        reductions: [
          {
            fromProblem: 'HALT_TM',
            toProblem: 'A_TM',
            type: 'many_one',
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('computable')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('many_one')
      );
    });

    it('should provide complexity analysis guidance', () => {
      const input: any = {
        thought: 'Complexity analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'complexity_analysis',
        complexityAnalysis: {
          complexityClass: 'NP-complete',
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('complexity class')
      );
      expect(enhancements.metrics?.complexityClass).toBe('NP-complete');
    });

    it('should provide oracle reasoning guidance', () => {
      const input: any = {
        thought: 'Oracle reasoning',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'oracle_reasoning',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('oracle')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('Baker-Gill-Solovay')
      );
    });

    it('should provide diagonalization guidance', () => {
      const input: any = {
        thought: 'Diagonalization argument',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'diagonalization',
        diagonalization: {
          pattern: 'cantor_uncountability',
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('enumerated')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('cantor_uncountability')
      );
    });

    it('should include classic problem references', () => {
      const input: any = {
        thought: 'Classic problem analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        classicProblems: ['halting_problem', 'post_correspondence'],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('halting_problem')
      );
    });

    it('should include key insight', () => {
      const input: any = {
        thought: 'Analysis with insight',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        keyInsight: 'Self-reference is the key mechanism',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('Self-reference')
      );
    });

    it('should warn about high uncertainty', () => {
      const input: ThinkingToolInput = {
        thought: 'Uncertain analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        uncertainty: 0.85,
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toContainEqual(
        expect.stringContaining('High uncertainty')
      );
    });

    it('should include metrics', () => {
      const input: any = {
        thought: 'Analysis with multiple elements',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'computability',
        machines: [
          { name: 'M1', states: ['q0'], transitions: [] },
          { name: 'M2', states: ['q0'], transitions: [] },
        ],
        problems: ['HALT_TM', 'A_TM', 'E_TM'],
        reductions: [
          { fromProblem: 'A', toProblem: 'B', type: 'many_one' },
        ],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.machineCount).toBe(2);
      expect(enhancements.metrics?.problemCount).toBe(3);
      expect(enhancements.metrics?.reductionCount).toBe(1);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support all valid computability thought types', () => {
      const validTypes = [
        'machine_definition',
        'computation_trace',
        'decidability_proof',
        'reduction_construction',
        'complexity_analysis',
        'oracle_reasoning',
        'diagonalization',
      ];

      for (const type of validTypes) {
        expect(handler.supportsThoughtType(type)).toBe(true);
      }
    });

    it('should not support invalid thought types', () => {
      expect(handler.supportsThoughtType('invalid_type')).toBe(false);
      expect(handler.supportsThoughtType('physics')).toBe(false);
      expect(handler.supportsThoughtType('')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete halting problem proof session', () => {
      // Step 1: Define the problem
      const step1: any = {
        thought: 'The halting problem: Given a Turing machine M and input w, does M halt on w?',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'machine_definition',
        problems: ['HALT_TM'],
      };

      const thought1 = handler.createThought(step1, 'halt-session');
      expect(thought1.thoughtType).toBe('machine_definition');

      // Step 2: Assume decidability
      const step2: any = {
        thought: 'Assume there exists a decider H that decides HALT_TM',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'decidability_proof',
        machines: [
          {
            name: 'H',
            description: 'Hypothetical halting decider',
            states: ['q0', 'qaccept', 'qreject'],
            type: 'deterministic',
          },
        ],
        decidabilityProof: {
          problem: 'HALT_TM',
          conclusion: 'undecidable',
          method: 'diagonalization',
          proofSteps: ['Assume H decides HALT_TM'],
        },
        dependencies: [thought1.id],
      };

      const thought2 = handler.createThought(step2, 'halt-session');
      expect(thought2.decidabilityProof?.method).toBe('diagonalization');

      // Step 3: Construct contradictory machine
      const step3: any = {
        thought: 'Construct machine D that uses H to contradict itself',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'diagonalization',
        machines: [
          {
            name: 'D',
            description: 'Diagonalization machine',
            states: ['q0', 'qloop', 'qhalt'],
            type: 'deterministic',
          },
        ],
        diagonalization: {
          enumeration: {
            description: 'All Turing machines',
            indexSet: 'natural numbers',
            enumeratedObjects: 'M_0, M_1, M_2, ...',
          },
          diagonalConstruction: {
            description: 'D(M) runs H(M,M) and does opposite',
            rule: 'If H accepts, loop. If H rejects, halt.',
            resultingObject: 'Machine D',
          },
          contradiction: {
            assumption: 'D is a Turing machine, so D = M_k for some k',
            consequence: 'D(D) halts iff H(D,D) rejects iff D(D) does not halt',
            impossibility: 'D(D) halts iff D(D) does not halt - contradiction',
          },
          pattern: 'turing_halting',
        },
        dependencies: [thought1.id, thought2.id],
      };

      const thought3 = handler.createThought(step3, 'halt-session');
      expect(thought3.diagonalization?.pattern).toBe('turing_halting');

      // Step 4: Conclude undecidability
      const step4: any = {
        thought: 'Therefore HALT_TM is undecidable',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'computability',
        thoughtType: 'decidability_proof',
        decidabilityProof: {
          problem: 'HALT_TM',
          conclusion: 'undecidable',
          method: 'diagonalization',
          proofSteps: [
            'Assumed H decides HALT_TM',
            'Constructed D using H',
            'Showed D(D) leads to contradiction',
            'Therefore H cannot exist',
          ],
          keyInsights: ['Self-reference', 'Diagonalization'],
        },
        classicProblems: ['halting_problem'],
        keyInsight: 'Self-reference via diagonalization proves undecidability',
        dependencies: [thought1.id, thought2.id, thought3.id],
        uncertainty: 0.05,
      };

      const thought4 = handler.createThought(step4, 'halt-session');
      expect(thought4.decidabilityProof?.conclusion).toBe('undecidable');
      expect(thought4.nextThoughtNeeded).toBe(false);

      // Validate all steps
      const validations = [step1, step2, step3, step4].map((s) => handler.validate(s));
      for (const v of validations) {
        expect(v.valid).toBe(true);
      }

      // Check final enhancements
      const enhancements = handler.getEnhancements(thought4);
      expect(enhancements.metrics?.uncertainty).toBe(0.05);
    });

    it('should handle reduction proof session', () => {
      // Prove A_TM undecidable via reduction from HALT_TM
      const input: any = {
        thought: 'Reducing HALT_TM to A_TM',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        mode: 'computability',
        thoughtType: 'reduction_construction',
        reductions: [
          {
            fromProblem: 'HALT_TM',
            toProblem: 'A_TM',
            type: 'many_one',
            reductionFunction: {
              description: 'Transform (M, w) to (M\', w)',
              inputTransformation: 'M\' = modify M to always accept if it halts',
              outputInterpretation: 'M\' accepts w iff M halts on w',
              preserves: 'membership',
            },
            correctnessProof: {
              forwardDirection: 'If M halts on w, M\' accepts w',
              backwardDirection: 'If M\' accepts w, M must have halted on w',
            },
            reductionComplexity: 'polynomial',
          },
        ],
        decidabilityProof: {
          problem: 'A_TM',
          conclusion: 'undecidable',
          method: 'reduction',
          knownUndecidableProblem: 'HALT_TM',
          proofSteps: [
            'HALT_TM is known undecidable',
            'Show HALT_TM ≤_m A_TM',
            'Therefore A_TM is undecidable',
          ],
        },
      };

      const validation = handler.validate(input);
      expect(validation.valid).toBe(true);

      const thought = handler.createThought(input, 'reduction-session');
      expect(thought.reductions?.[0].type).toBe('many_one');
      expect(thought.decidabilityProof?.conclusion).toBe('undecidable');

      const enhancements = handler.getEnhancements(thought);
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('HALT_TM')
      );
    });
  });
});
