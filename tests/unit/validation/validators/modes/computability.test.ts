/**
 * Computability Validator Tests (Phase 14 Sprint 1)
 * Tests for src/validation/validators/modes/computability.ts
 *
 * Target: >90% branch coverage for 531 lines of validation logic
 * Error paths: ~25, Warning paths: ~3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComputabilityValidator } from '../../../../../src/validation/validators/modes/computability.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { ComputabilityThought, TuringMachine, Reduction, DecidabilityProof, DiagonalizationArgument, ComputationTrace, ComplexityAnalysis } from '../../../../../src/types/modes/computability.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('ComputabilityValidator', () => {
  let validator: ComputabilityValidator;
  let context: ValidationContext;

  // Helper to create a minimal valid thought
  const createBaseThought = (overrides?: Partial<ComputabilityThought>): ComputabilityThought => ({
    id: 'thought-1',
    mode: ThinkingMode.COMPUTABILITY,
    thoughtType: 'machine_definition',
    thought: 'Test thought',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    dependencies: [],
    assumptions: [],
    uncertainty: 0.2,
    ...overrides,
  });

  // Helper to create a valid Turing machine
  const createValidTuringMachine = (overrides?: Partial<TuringMachine>): TuringMachine => ({
    id: 'tm-1',
    name: 'TestMachine',
    states: ['q0', 'q1', 'qAccept', 'qReject'],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    transitions: [
      { fromState: 'q0', readSymbol: '0', toState: 'q1', writeSymbol: '1', direction: 'R' },
      { fromState: 'q1', readSymbol: '1', toState: 'qAccept', writeSymbol: '0', direction: 'L' },
    ],
    initialState: 'q0',
    acceptStates: ['qAccept'],
    rejectStates: ['qReject'],
    type: 'deterministic',
    ...overrides,
  });

  // Helper to create a valid reduction
  const createValidReduction = (overrides?: Partial<Reduction>): Reduction => ({
    id: 'red-1',
    fromProblem: 'HALTING',
    toProblem: 'ATM',
    type: 'many_one',
    reductionFunction: {
      description: 'Maps halting instances to ATM',
      inputTransformation: 'Given (M, w), construct (M\', w\')',
      outputInterpretation: 'M halts on w iff M\' accepts w\'',
      preserves: 'decidability',
    },
    correctnessProof: {
      forwardDirection: 'If M halts on w, then M\' accepts w\'',
      backwardDirection: 'If M\' accepts w\', then M halts on w',
    },
    ...overrides,
  });

  // Helper to create a valid decidability proof
  const createValidDecidabilityProof = (overrides?: Partial<DecidabilityProof>): DecidabilityProof => ({
    id: 'proof-1',
    problem: 'HALTING',
    conclusion: 'undecidable',
    method: 'diagonalization',
    proofSteps: ['Step 1', 'Step 2'],
    keyInsights: ['Key insight'],
    ...overrides,
  });

  // Helper to create a valid diagonalization argument
  const createValidDiagonalization = (): DiagonalizationArgument => ({
    id: 'diag-1',
    enumeration: {
      description: 'Enumerate all Turing machines',
      indexSet: 'Natural numbers',
      enumeratedObjects: 'Turing machines',
    },
    diagonalConstruction: {
      description: 'Construct D that differs from each Mi on input i',
      rule: 'D(i) = 1 - Mi(i)',
      resultingObject: 'Diagonalizing machine D',
    },
    contradiction: {
      assumption: 'Assume D is in the enumeration',
      consequence: 'Then D = Mk for some k',
      impossibility: 'D(k) ≠ Mk(k) by construction, contradiction',
    },
    pattern: 'turing',
  });

  beforeEach(() => {
    validator = new ComputabilityValidator();
    context = {
      sessionId: 'test-session',
      existingThoughts: new Map(),
    };
  });

  describe('getMode', () => {
    it('should return computability', () => {
      expect(validator.getMode()).toBe('computability');
    });
  });

  describe('validate - main entry point', () => {
    it('should accept valid thought with all fields', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine()],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should reject invalid thoughtType', () => {
      const thought = createBaseThought({
        thoughtType: 'invalid_type' as any,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid computability thought type'))).toBe(true);
    });

    it('should accept all valid thought types', () => {
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
        const thought = createBaseThought({ thoughtType: type as any });
        const issues = validator.validate(thought, context);
        expect(issues.some(i => i.description.includes('Invalid computability thought type'))).toBe(false);
      }
    });
  });

  describe('validateTuringMachine', () => {
    it('should accept valid Turing machine', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine()],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should reject machine with empty states array', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({ states: [] })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('has no states'))).toBe(true);
    });

    it('should reject machine with initial state not in states', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({ initialState: 'qMissing' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Initial state') && i.description.includes('not in state set'))).toBe(true);
    });

    it('should reject machine with accept state not in states', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({ acceptStates: ['qMissing'] })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Accept state') && i.description.includes('not in state set'))).toBe(true);
    });

    it('should reject machine with reject state not in states', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({ rejectStates: ['qMissing'] })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Reject state') && i.description.includes('not in state set'))).toBe(true);
    });

    it('should reject machine with state in both accept and reject', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({
          acceptStates: ['qAccept'],
          rejectStates: ['qAccept'],
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('both accept and reject'))).toBe(true);
    });

    it('should reject machine with blank symbol not in tape alphabet', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({ blankSymbol: 'X' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Blank symbol') && i.description.includes('not in tape alphabet'))).toBe(true);
    });

    it('should reject machine with input symbol not in tape alphabet', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({ inputAlphabet: ['0', '1', 'X'] })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Input symbol') && i.description.includes('not in tape alphabet'))).toBe(true);
    });

    it('should reject transition from unknown state', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({
          transitions: [
            { fromState: 'qUnknown', readSymbol: '0', toState: 'q1', writeSymbol: '1', direction: 'R' },
          ],
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Transition from unknown state'))).toBe(true);
    });

    it('should reject transition to unknown state', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({
          transitions: [
            { fromState: 'q0', readSymbol: '0', toState: 'qUnknown', writeSymbol: '1', direction: 'R' },
          ],
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Transition to unknown state'))).toBe(true);
    });

    it('should reject transition reading unknown symbol', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({
          transitions: [
            { fromState: 'q0', readSymbol: 'X', toState: 'q1', writeSymbol: '1', direction: 'R' },
          ],
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Transition reads unknown symbol'))).toBe(true);
    });

    it('should reject transition writing unknown symbol', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({
          transitions: [
            { fromState: 'q0', readSymbol: '0', toState: 'q1', writeSymbol: 'X', direction: 'R' },
          ],
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Transition writes unknown symbol'))).toBe(true);
    });

    it('should reject non-deterministic transition in DTM', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({
          type: 'deterministic',
          transitions: [
            { fromState: 'q0', readSymbol: '0', toState: 'q1', writeSymbol: '1', direction: 'R' },
            { fromState: 'q0', readSymbol: '0', toState: 'qAccept', writeSymbol: '0', direction: 'L' },
          ],
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Non-deterministic transition'))).toBe(true);
    });

    it('should allow multiple transitions from same state/symbol in NTM', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({
          type: 'nondeterministic',
          transitions: [
            { fromState: 'q0', readSymbol: '0', toState: 'q1', writeSymbol: '1', direction: 'R' },
            { fromState: 'q0', readSymbol: '0', toState: 'qAccept', writeSymbol: '0', direction: 'L' },
          ],
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Non-deterministic transition'))).toBe(false);
    });

    it('should warn on empty transitions', () => {
      const thought = createBaseThought({
        machines: [createValidTuringMachine({ transitions: [] })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('has no transitions'))).toBe(true);
    });

    it('should validate currentMachine field', () => {
      const thought = createBaseThought({
        currentMachine: createValidTuringMachine({ states: [] }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('has no states'))).toBe(true);
    });
  });

  describe('validateReduction', () => {
    it('should accept valid reduction', () => {
      const thought = createBaseThought({
        thoughtType: 'reduction_construction',
        reductions: [createValidReduction()],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should reject reduction without input transformation', () => {
      const thought = createBaseThought({
        reductions: [createValidReduction({
          reductionFunction: {
            description: 'Test',
            inputTransformation: '',
            outputInterpretation: 'Test',
            preserves: 'decidability',
          },
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('lacks input transformation'))).toBe(true);
    });

    it('should reject reduction without forward direction proof', () => {
      const thought = createBaseThought({
        reductions: [createValidReduction({
          correctnessProof: {
            forwardDirection: '',
            backwardDirection: 'Test',
          },
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('lacks forward direction proof'))).toBe(true);
    });

    it('should reject reduction without backward direction proof', () => {
      const thought = createBaseThought({
        reductions: [createValidReduction({
          correctnessProof: {
            forwardDirection: 'Test',
            backwardDirection: '',
          },
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('lacks backward direction proof'))).toBe(true);
    });

    it('should reject invalid reduction type', () => {
      const thought = createBaseThought({
        reductions: [createValidReduction({ type: 'invalid_type' as any })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid reduction type'))).toBe(true);
    });

    it('should accept all valid reduction types', () => {
      const validTypes = ['many_one', 'turing', 'polynomial_time', 'log_space'];
      for (const type of validTypes) {
        const thought = createBaseThought({
          reductions: [createValidReduction({ type: type as any })],
        });
        const issues = validator.validate(thought, context);
        expect(issues.some(i => i.description.includes('Invalid reduction type'))).toBe(false);
      }
    });
  });

  describe('validateDecidabilityProof', () => {
    it('should accept valid decidability proof', () => {
      const thought = createBaseThought({
        thoughtType: 'decidability_proof',
        decidabilityProof: createValidDecidabilityProof({
          diagonalization: createValidDiagonalization(),
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should reject invalid proof method', () => {
      const thought = createBaseThought({
        decidabilityProof: createValidDecidabilityProof({ method: 'invalid' as any }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid proof method'))).toBe(true);
    });

    it('should accept all valid proof methods', () => {
      const validMethods = ['direct_machine', 'reduction', 'diagonalization', 'rice_theorem', 'oracle'];
      for (const method of validMethods) {
        const thought = createBaseThought({
          decidabilityProof: createValidDecidabilityProof({ method: method as any }),
        });
        const issues = validator.validate(thought, context);
        expect(issues.some(i => i.description.includes('Invalid proof method'))).toBe(false);
      }
    });

    it('should reject direct decidability proof without deciding machine', () => {
      const thought = createBaseThought({
        decidabilityProof: createValidDecidabilityProof({
          conclusion: 'decidable',
          method: 'direct_machine',
          decidingMachine: undefined,
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Direct decidability proof requires a deciding machine'))).toBe(true);
    });

    it('should reject reduction undecidability proof without reduction', () => {
      const thought = createBaseThought({
        decidabilityProof: createValidDecidabilityProof({
          conclusion: 'undecidable',
          method: 'reduction',
          reduction: undefined,
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Reduction-based undecidability proof requires a reduction'))).toBe(true);
    });

    it('should warn on reduction proof without known undecidable problem', () => {
      const thought = createBaseThought({
        decidabilityProof: createValidDecidabilityProof({
          conclusion: 'undecidable',
          method: 'reduction',
          reduction: createValidReduction(),
          knownUndecidableProblem: undefined,
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('should specify the known undecidable problem'))).toBe(true);
    });

    it('should reject diagonalization proof without diagonalization argument', () => {
      const thought = createBaseThought({
        decidabilityProof: createValidDecidabilityProof({
          method: 'diagonalization',
          diagonalization: undefined,
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Diagonalization proof requires diagonalization argument'))).toBe(true);
    });

    it('should reject Rice theorem application with trivial property', () => {
      const thought = createBaseThought({
        decidabilityProof: createValidDecidabilityProof({
          method: 'rice_theorem',
          riceApplication: {
            property: 'Test property',
            isNontrivial: false,
            isSemantic: true,
          },
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Rice\'s theorem only applies to non-trivial properties'))).toBe(true);
    });

    it('should reject Rice theorem application with non-semantic property', () => {
      const thought = createBaseThought({
        decidabilityProof: createValidDecidabilityProof({
          method: 'rice_theorem',
          riceApplication: {
            property: 'Test property',
            isNontrivial: true,
            isSemantic: false,
          },
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Rice\'s theorem only applies to semantic'))).toBe(true);
    });

    it('should warn on empty proof steps', () => {
      const thought = createBaseThought({
        decidabilityProof: createValidDecidabilityProof({ proofSteps: [] }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('proof has no steps'))).toBe(true);
    });
  });

  describe('validateDiagonalization', () => {
    it('should accept valid diagonalization argument', () => {
      const thought = createBaseThought({
        thoughtType: 'diagonalization',
        diagonalization: createValidDiagonalization(),
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should reject diagonalization without enumeration description', () => {
      const diag = createValidDiagonalization();
      diag.enumeration.description = '';
      const thought = createBaseThought({ diagonalization: diag });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('lacks enumeration description'))).toBe(true);
    });

    it('should reject diagonalization without diagonal construction rule', () => {
      const diag = createValidDiagonalization();
      diag.diagonalConstruction.rule = '';
      const thought = createBaseThought({ diagonalization: diag });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('lacks diagonal construction rule'))).toBe(true);
    });

    it('should reject diagonalization without contradiction assumption', () => {
      const diag = createValidDiagonalization();
      diag.contradiction.assumption = '';
      const thought = createBaseThought({ diagonalization: diag });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('lacks initial assumption'))).toBe(true);
    });

    it('should reject diagonalization without impossibility statement', () => {
      const diag = createValidDiagonalization();
      diag.contradiction.impossibility = '';
      const thought = createBaseThought({ diagonalization: diag });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('lacks impossibility statement'))).toBe(true);
    });

    it('should warn on unknown diagonalization pattern', () => {
      const diag = createValidDiagonalization();
      diag.pattern = 'unknown' as any;
      const thought = createBaseThought({ diagonalization: diag });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Unknown diagonalization pattern'))).toBe(true);
    });

    it('should accept all valid diagonalization patterns', () => {
      const validPatterns = ['cantor', 'turing', 'godel', 'rice', 'custom'];
      for (const pattern of validPatterns) {
        const diag = createValidDiagonalization();
        diag.pattern = pattern as any;
        const thought = createBaseThought({ diagonalization: diag });
        const issues = validator.validate(thought, context);
        expect(issues.some(i => i.description.includes('Unknown diagonalization pattern'))).toBe(false);
      }
    });
  });

  describe('validateComputationTrace', () => {
    const createValidTrace = (): ComputationTrace => ({
      machine: 'tm-1',
      input: '01',
      steps: [
        { stepNumber: 0, state: 'q0', tapeContents: '01_', headPosition: 0 },
        { stepNumber: 1, state: 'q1', tapeContents: '11_', headPosition: 1 },
        { stepNumber: 2, state: 'qAccept', tapeContents: '10_', headPosition: 0 },
      ],
      result: 'accept',
      totalSteps: 3,
      spaceUsed: 3,
      isTerminating: true,
    });

    it('should accept valid computation trace', () => {
      const thought = createBaseThought({
        thoughtType: 'computation_trace',
        computationTrace: createValidTrace(),
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should warn on inconsistent step numbering', () => {
      const trace = createValidTrace();
      trace.steps[1].stepNumber = 5; // Should be 1
      const thought = createBaseThought({ computationTrace: trace });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('step numbering inconsistent'))).toBe(true);
    });

    it('should warn on totalSteps mismatch', () => {
      const trace = createValidTrace();
      trace.totalSteps = 10; // Should be 3
      const thought = createBaseThought({ computationTrace: trace });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('does not match actual steps'))).toBe(true);
    });

    it('should reject invalid computation result', () => {
      const trace = createValidTrace();
      trace.result = 'invalid' as any;
      const thought = createBaseThought({ computationTrace: trace });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid computation result'))).toBe(true);
    });

    it('should accept all valid computation results', () => {
      const validResults = ['accept', 'reject', 'loop', 'running'];
      for (const result of validResults) {
        const trace = createValidTrace();
        trace.result = result as any;
        if (result === 'loop' || result === 'running') {
          trace.isTerminating = false;
        }
        const thought = createBaseThought({ computationTrace: trace });
        const issues = validator.validate(thought, context);
        expect(issues.some(i => i.description.includes('Invalid computation result'))).toBe(false);
      }
    });

    it('should reject accept/reject result with isTerminating false', () => {
      const trace = createValidTrace();
      trace.result = 'accept';
      trace.isTerminating = false;
      const thought = createBaseThought({ computationTrace: trace });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should be marked as terminating'))).toBe(true);
    });
  });

  describe('validateComplexityAnalysis', () => {
    const createValidComplexityAnalysis = (): ComplexityAnalysis => ({
      id: 'analysis-1',
      problem: 'SAT',
      complexityClass: 'NP',
      classJustification: 'Certificate verification in polynomial time',
      hardnessResults: {
        hardFor: 'NP',
        completeFor: 'NP',
      },
    });

    it('should accept valid complexity analysis', () => {
      const thought = createBaseThought({
        thoughtType: 'complexity_analysis',
        complexityAnalysis: createValidComplexityAnalysis(),
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should warn on missing complexity class', () => {
      const analysis = createValidComplexityAnalysis();
      analysis.complexityClass = '';
      const thought = createBaseThought({ complexityAnalysis: analysis });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('lacks complexity class'))).toBe(true);
    });

    it('should warn on missing class justification', () => {
      const analysis = createValidComplexityAnalysis();
      analysis.classJustification = '';
      const thought = createBaseThought({ complexityAnalysis: analysis });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('lacks justification'))).toBe(true);
    });

    it('should reject complete without hard', () => {
      const analysis = createValidComplexityAnalysis();
      analysis.hardnessResults = {
        hardFor: '',
        completeFor: 'NP',
      };
      const thought = createBaseThought({ complexityAnalysis: analysis });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('marked complete but not hard'))).toBe(true);
    });
  });

  describe('validateCommon (inherited)', () => {
    it('should reject negative thoughtNumber', () => {
      const thought = createBaseThought({ thoughtNumber: -1 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Thought number must be positive'))).toBe(true);
    });

    it('should reject zero thoughtNumber', () => {
      const thought = createBaseThought({ thoughtNumber: 0 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Thought number must be positive'))).toBe(true);
    });

    it('should reject negative totalThoughts', () => {
      const thought = createBaseThought({ totalThoughts: -1 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Total thoughts must be positive'))).toBe(true);
    });

    it('should reject thoughtNumber exceeding totalThoughts', () => {
      const thought = createBaseThought({ thoughtNumber: 10, totalThoughts: 5 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('exceeds total'))).toBe(true);
    });
  });
});
