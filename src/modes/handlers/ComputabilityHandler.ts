/**
 * ComputabilityHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Computability Theory reasoning with:
 * - Turing machine definition and validation
 * - Decidability proof structure
 * - Reduction construction tracking
 * - Diagonalization argument support
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import type {
  ComputabilityThought,
  ComputabilityThoughtType,
  TuringMachine,
  DecidabilityProof,
  Reduction,
  DiagonalizationArgument,
} from '../../types/modes/computability.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * Valid computability thought types
 */
const VALID_THOUGHT_TYPES: ComputabilityThoughtType[] = [
  'machine_definition',
  'computation_trace',
  'decidability_proof',
  'reduction_construction',
  'complexity_analysis',
  'oracle_reasoning',
  'diagonalization',
];

// Classic undecidable problems for reference:
// halting_problem, acceptance_problem, emptiness_problem, equivalence_problem,
// regularity_problem, ambiguity_problem, post_correspondence, hilberts_tenth

/**
 * ComputabilityHandler - Specialized handler for computability theory
 *
 * Provides:
 * - Turing machine specification validation
 * - Decidability proof structure
 * - Reduction chain tracking
 * - Diagonalization argument patterns
 */
export class ComputabilityHandler implements ModeHandler {
  readonly mode = ThinkingMode.COMPUTABILITY;
  readonly modeName = 'Computability Theory';
  readonly description = 'Turing machine analysis, decidability proofs, and reductions';

  /**
   * Supported thought types for computability mode
   */
  private readonly supportedThoughtTypes = [
    'machine_definition',
    'computation_trace',
    'decidability_proof',
    'reduction_construction',
    'complexity_analysis',
    'oracle_reasoning',
    'diagonalization',
  ];

  /**
   * Create a computability thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): ComputabilityThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process Turing machines
    const machines = inputAny.machines
      ? inputAny.machines.map((m: any) => this.normalizeMachine(m))
      : undefined;

    // Process decidability proof
    const decidabilityProof = inputAny.decidabilityProof
      ? this.normalizeDecidabilityProof(inputAny.decidabilityProof)
      : undefined;

    // Process reductions
    const reductions = inputAny.reductions
      ? inputAny.reductions.map((r: any) => this.normalizeReduction(r))
      : undefined;

    // Process diagonalization
    const diagonalization = inputAny.diagonalization
      ? this.normalizeDiagonalization(inputAny.diagonalization)
      : undefined;

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.COMPUTABILITY,

      // Core computability fields
      thoughtType,
      machines,
      currentMachine: machines?.[0],
      computationTrace: inputAny.computationTrace,
      problems: inputAny.problems,
      currentProblem: inputAny.currentProblem,
      reductions,
      reductionChain: inputAny.reductionChain,
      decidabilityProof,
      diagonalization,
      complexityAnalysis: inputAny.complexityAnalysis,
      oracleAnalysis: inputAny.oracleAnalysis,
      classicProblems: inputAny.classicProblems,
      keyInsight: inputAny.keyInsight,

      // Dependencies and assumptions
      dependencies: input.dependencies || [],
      assumptions: input.assumptions || [],
      uncertainty: input.uncertainty ?? 0.5,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate computability-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate thought type
    if (inputAny.thoughtType && !VALID_THOUGHT_TYPES.includes(inputAny.thoughtType)) {
      warnings.push(
        createValidationWarning(
          'thoughtType',
          `Unknown thought type: ${inputAny.thoughtType}`,
          `Valid types: ${VALID_THOUGHT_TYPES.join(', ')}`
        )
      );
    }

    // Validate uncertainty
    if (input.uncertainty !== undefined) {
      if (input.uncertainty < 0 || input.uncertainty > 1) {
        errors.push(
          createValidationError(
            'uncertainty',
            `Uncertainty (${input.uncertainty}) must be between 0 and 1`,
            'UNCERTAINTY_OUT_OF_RANGE'
          )
        );
      }
    }

    // Validate Turing machines
    if (inputAny.machines) {
      for (let i = 0; i < inputAny.machines.length; i++) {
        const machineWarnings = this.validateMachine(inputAny.machines[i], i);
        warnings.push(...machineWarnings);
      }
    }

    // Validate decidability proof
    if (inputAny.decidabilityProof) {
      const proofWarnings = this.validateDecidabilityProof(inputAny.decidabilityProof);
      warnings.push(...proofWarnings);
    }

    // Validate reductions
    if (inputAny.reductions) {
      for (let i = 0; i < inputAny.reductions.length; i++) {
        const reductionWarnings = this.validateReduction(inputAny.reductions[i], i);
        warnings.push(...reductionWarnings);
      }
    }

    // Suggest machine definition for certain thought types
    if (inputAny.thoughtType === 'machine_definition' && !inputAny.machines) {
      warnings.push(
        createValidationWarning(
          'machines',
          'Machine definition thought without machines specified',
          'Include Turing machine specification'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get computability-specific enhancements
   */
  getEnhancements(thought: ComputabilityThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.MATHEMATICS, ThinkingMode.ALGORITHMIC, ThinkingMode.FORMALLOGIC],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        machineCount: thought.machines?.length || 0,
        problemCount: thought.problems?.length || 0,
        reductionCount: thought.reductions?.length || 0,
        uncertainty: thought.uncertainty,
      },
      mentalModels: [
        'Turing Machine Model',
        'Church-Turing Thesis',
        'Halting Problem',
        'Diagonalization',
        'Reduction Technique',
        "Rice's Theorem",
      ],
    };

    // Thought type-specific guidance
    switch (thought.thoughtType) {
      case 'machine_definition':
        enhancements.guidingQuestions!.push(
          'Is the transition function fully specified?',
          'Are accept and reject states properly defined?',
          'What language does this machine recognize?'
        );
        if (thought.currentMachine) {
          enhancements.metrics!.stateCount = thought.currentMachine.states.length;
          enhancements.metrics!.transitionCount = thought.currentMachine.transitions.length;
          enhancements.suggestions!.push(
            `Machine type: ${thought.currentMachine.type}`
          );
        }
        break;

      case 'computation_trace':
        enhancements.guidingQuestions!.push(
          'Does the computation terminate?',
          'How many steps are required?',
          'What is the space usage?'
        );
        if (thought.computationTrace) {
          enhancements.metrics!.totalSteps = thought.computationTrace.totalSteps;
          enhancements.metrics!.spaceUsed = thought.computationTrace.spaceUsed;
          enhancements.suggestions!.push(
            `Result: ${thought.computationTrace.result}`
          );
        }
        break;

      case 'decidability_proof':
        enhancements.guidingQuestions!.push(
          'What is the proof method?',
          'Is the reduction valid?',
          'Are all cases covered?'
        );
        if (thought.decidabilityProof) {
          enhancements.suggestions!.push(
            `Conclusion: ${thought.decidabilityProof.conclusion}`,
            `Method: ${thought.decidabilityProof.method}`
          );
        }
        break;

      case 'reduction_construction':
        enhancements.guidingQuestions!.push(
          'Is the reduction computable?',
          'Does it preserve membership?',
          'What is the reduction complexity?'
        );
        if (thought.reductions && thought.reductions.length > 0) {
          const r = thought.reductions[0];
          enhancements.suggestions!.push(
            `Reduction type: ${r.type}`,
            `${r.fromProblem} ≤ ${r.toProblem}`
          );
        }
        break;

      case 'complexity_analysis':
        enhancements.guidingQuestions!.push(
          'What complexity class does this belong to?',
          'Is it complete for its class?',
          'Are there known lower bounds?'
        );
        if (thought.complexityAnalysis) {
          enhancements.metrics!.complexityClass = thought.complexityAnalysis.complexityClass;
        }
        break;

      case 'oracle_reasoning':
        enhancements.guidingQuestions!.push(
          'What oracle is being used?',
          'Does the result relativize?',
          'What are the implications for P vs NP?'
        );
        enhancements.suggestions!.push(
          'Consider Baker-Gill-Solovay relativization barriers'
        );
        break;

      case 'diagonalization':
        enhancements.guidingQuestions!.push(
          'What is being enumerated?',
          'How is the diagonal element constructed?',
          'What contradiction arises?'
        );
        if (thought.diagonalization) {
          enhancements.suggestions!.push(
            `Pattern: ${thought.diagonalization.pattern}`
          );
        }
        break;
    }

    // Classic problem references
    if (thought.classicProblems && thought.classicProblems.length > 0) {
      enhancements.suggestions!.push(
        `References: ${thought.classicProblems.join(', ')}`
      );
    }

    // Key insight
    if (thought.keyInsight) {
      enhancements.suggestions!.push(`Key insight: ${thought.keyInsight}`);
    }

    // High uncertainty warning
    if (thought.uncertainty > 0.7) {
      enhancements.warnings!.push(
        'High uncertainty - verify proof steps carefully'
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }

  /**
   * Resolve thought type from input
   */
  private resolveThoughtType(inputType: string | undefined): ComputabilityThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as ComputabilityThoughtType)) {
      return inputType as ComputabilityThoughtType;
    }
    return 'machine_definition';
  }

  /**
   * Normalize Turing machine specification
   */
  private normalizeMachine(machine: any): TuringMachine {
    return {
      id: machine.id || randomUUID(),
      name: machine.name || 'Unnamed Machine',
      description: machine.description,
      states: machine.states || [],
      inputAlphabet: machine.inputAlphabet || ['0', '1'],
      tapeAlphabet: machine.tapeAlphabet || ['0', '1', '_'],
      blankSymbol: machine.blankSymbol || '_',
      transitions: machine.transitions || [],
      initialState: machine.initialState || machine.states?.[0] || 'q0',
      acceptStates: machine.acceptStates || [],
      rejectStates: machine.rejectStates || [],
      type: machine.type || 'deterministic',
      oracle: machine.oracle,
    };
  }

  /**
   * Normalize decidability proof
   */
  private normalizeDecidabilityProof(proof: any): DecidabilityProof {
    return {
      id: proof.id || randomUUID(),
      problem: proof.problem || '',
      conclusion: proof.conclusion || 'unknown',
      method: proof.method || 'direct_machine',
      decidingMachine: proof.decidingMachine,
      reduction: proof.reduction,
      knownUndecidableProblem: proof.knownUndecidableProblem,
      diagonalization: proof.diagonalization,
      riceApplication: proof.riceApplication,
      proofSteps: proof.proofSteps || [],
      keyInsights: proof.keyInsights || [],
    };
  }

  /**
   * Normalize reduction
   */
  private normalizeReduction(reduction: any): Reduction {
    return {
      id: reduction.id || randomUUID(),
      fromProblem: reduction.fromProblem || '',
      toProblem: reduction.toProblem || '',
      type: reduction.type || 'many_one',
      reductionFunction: reduction.reductionFunction || {
        description: '',
        inputTransformation: '',
        outputInterpretation: '',
        preserves: '',
      },
      correctnessProof: reduction.correctnessProof || {
        forwardDirection: '',
        backwardDirection: '',
      },
      reductionComplexity: reduction.reductionComplexity,
    };
  }

  /**
   * Normalize diagonalization argument
   */
  private normalizeDiagonalization(diag: any): DiagonalizationArgument {
    return {
      id: diag.id || randomUUID(),
      enumeration: diag.enumeration || {
        description: '',
        indexSet: 'natural numbers',
        enumeratedObjects: '',
      },
      diagonalConstruction: diag.diagonalConstruction || {
        description: '',
        rule: '',
        resultingObject: '',
      },
      contradiction: diag.contradiction || {
        assumption: '',
        consequence: '',
        impossibility: '',
      },
      pattern: diag.pattern || 'custom',
      historicalNote: diag.historicalNote,
    };
  }

  /**
   * Validate Turing machine specification
   */
  private validateMachine(machine: any, index: number): any[] {
    const warnings = [];

    if (!machine.states || machine.states.length === 0) {
      warnings.push(
        createValidationWarning(
          `machines[${index}].states`,
          'No states defined',
          'A Turing machine requires at least one state'
        )
      );
    }

    if (!machine.transitions || machine.transitions.length === 0) {
      warnings.push(
        createValidationWarning(
          `machines[${index}].transitions`,
          'No transitions defined',
          'Define the transition function'
        )
      );
    }

    if (!machine.acceptStates || machine.acceptStates.length === 0) {
      warnings.push(
        createValidationWarning(
          `machines[${index}].acceptStates`,
          'No accept states defined',
          'Define at least one accept state'
        )
      );
    }

    return warnings;
  }

  /**
   * Validate decidability proof
   */
  private validateDecidabilityProof(proof: any): any[] {
    const warnings = [];

    if (!proof.problem) {
      warnings.push(
        createValidationWarning(
          'decidabilityProof.problem',
          'No problem specified',
          'Identify the decision problem being analyzed'
        )
      );
    }

    if (!proof.proofSteps || proof.proofSteps.length === 0) {
      warnings.push(
        createValidationWarning(
          'decidabilityProof.proofSteps',
          'No proof steps provided',
          'Document the proof steps'
        )
      );
    }

    // Method-specific validation
    if (proof.method === 'reduction' && !proof.reduction && !proof.knownUndecidableProblem) {
      warnings.push(
        createValidationWarning(
          'decidabilityProof',
          'Reduction proof without reduction details',
          'Specify the reduction and known undecidable problem'
        )
      );
    }

    return warnings;
  }

  /**
   * Validate reduction
   */
  private validateReduction(reduction: any, index: number): any[] {
    const warnings = [];

    if (!reduction.fromProblem || !reduction.toProblem) {
      warnings.push(
        createValidationWarning(
          `reductions[${index}]`,
          'Reduction missing source or target problem',
          'Specify both fromProblem and toProblem'
        )
      );
    }

    if (!reduction.correctnessProof) {
      warnings.push(
        createValidationWarning(
          `reductions[${index}].correctnessProof`,
          'No correctness proof provided',
          'Prove both directions of the reduction'
        )
      );
    }

    return warnings;
  }
}
