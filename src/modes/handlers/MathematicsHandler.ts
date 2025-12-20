/**
 * MathematicsHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Mathematics reasoning mode with:
 * - Proof strategy validation and tracking
 * - Mathematical model validation
 * - Proof decomposition support
 * - Consistency checking
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, MathematicsThought } from '../../types/core.js';
import type {
  MathematicsThoughtType,
  MathematicalModel,
  ProofStrategy,
} from '../../types/modes/mathematics.js';
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
 * Valid mathematics thought types
 */
const VALID_THOUGHT_TYPES: MathematicsThoughtType[] = [
  'axiom_definition',
  'theorem_statement',
  'proof_construction',
  'lemma_derivation',
  'corollary',
  'counterexample',
  'algebraic_manipulation',
  'symbolic_computation',
  'numerical_analysis',
  'proof_decomposition',
  'dependency_analysis',
  'consistency_check',
  'gap_identification',
  'assumption_trace',
];

/**
 * Valid proof strategy types
 */
const VALID_PROOF_TYPES = ['direct', 'contradiction', 'induction', 'construction', 'contrapositive'];

/**
 * MathematicsHandler - Specialized handler for mathematical reasoning
 *
 * Provides:
 * - Formal proof construction and validation
 * - Mathematical model checking
 * - Proof decomposition analysis
 * - Dependency tracking
 */
export class MathematicsHandler implements ModeHandler {
  readonly mode = ThinkingMode.MATHEMATICS;
  readonly modeName = 'Mathematical Reasoning';
  readonly description = 'Formal mathematical proofs, theorems, and symbolic computation';

  /**
   * Create a mathematics thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): MathematicsThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Validate and normalize mathematical model
    const mathematicalModel = this.normalizeModel(input.mathematicalModel);

    // Validate proof strategy
    const proofStrategy = this.normalizeProofStrategy(input.proofStrategy);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.MATHEMATICS,

      // Core mathematics fields
      thoughtType,
      mathematicalModel,
      proofStrategy,
      dependencies: input.dependencies || [],
      assumptions: input.assumptions || [],
      uncertainty: input.uncertainty ?? 0.5,

      // Extended fields
      theorems: inputAny.theorems || [],
      logicalForm: inputAny.logicalForm,
      references: inputAny.references || [],

      // Proof analysis fields (populated by external engine)
      decomposition: inputAny.decomposition,
      consistencyReport: inputAny.consistencyReport,
      gapAnalysis: inputAny.gapAnalysis,
      assumptionAnalysis: inputAny.assumptionAnalysis,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate mathematics-specific input
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

    // Validate mathematical model
    if (input.mathematicalModel) {
      const modelValidation = this.validateModel(input.mathematicalModel);
      errors.push(...modelValidation.errors);
      warnings.push(...modelValidation.warnings);
    }

    // Validate proof strategy
    if (input.proofStrategy) {
      const strategyValidation = this.validateProofStrategy(input.proofStrategy);
      errors.push(...strategyValidation.errors);
      warnings.push(...strategyValidation.warnings);
    }

    // Suggest assumptions for theorem statements
    if (inputAny.thoughtType === 'theorem_statement' &&
        (!input.assumptions || input.assumptions.length === 0)) {
      warnings.push(
        createValidationWarning(
          'assumptions',
          'Theorem stated without explicit assumptions',
          'Document assumptions to ensure the theorem is well-defined'
        )
      );
    }

    // Suggest proof strategy for proof construction
    if (inputAny.thoughtType === 'proof_construction' && !input.proofStrategy) {
      warnings.push(
        createValidationWarning(
          'proofStrategy',
          'Proof construction without explicit strategy',
          'Specify the proof approach (direct, contradiction, induction, etc.)'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get mathematics-specific enhancements
   */
  getEnhancements(thought: MathematicsThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.PHYSICS, ThinkingMode.FORMALLOGIC, ThinkingMode.DEDUCTIVE],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        dependencyCount: thought.dependencies?.length || 0,
        assumptionCount: thought.assumptions?.length || 0,
        uncertainty: thought.uncertainty,
      },
      mentalModels: [
        'Axiomatic Reasoning',
        'Proof by Induction',
        'Proof by Contradiction',
        'Constructive Proof',
        'Symbolic Manipulation',
      ],
    };

    // Thought type-specific guidance
    switch (thought.thoughtType) {
      case 'axiom_definition':
        enhancements.guidingQuestions!.push(
          'Is this axiom consistent with existing axioms?',
          'Is this axiom independent from other axioms?'
        );
        break;

      case 'theorem_statement':
        enhancements.guidingQuestions!.push(
          'What is the simplest case of this theorem?',
          'Are there known counterexamples to consider?'
        );
        enhancements.suggestions!.push(
          'State the theorem precisely with all quantifiers explicit'
        );
        break;

      case 'proof_construction':
        if (thought.proofStrategy) {
          enhancements.suggestions!.push(
            `Using ${thought.proofStrategy.type} proof strategy`
          );
          if (thought.proofStrategy.completeness < 0.5) {
            enhancements.warnings!.push(
              'Proof is less than 50% complete - continue developing steps'
            );
          }
        }
        enhancements.guidingQuestions!.push(
          'What is the key insight that makes this proof work?'
        );
        break;

      case 'lemma_derivation':
        enhancements.suggestions!.push(
          'Ensure the lemma is general enough to be reusable'
        );
        enhancements.guidingQuestions!.push(
          'Is this lemma necessary, or can it be simplified?'
        );
        break;

      case 'counterexample':
        enhancements.guidingQuestions!.push(
          'Does this counterexample apply to the general case?',
          'What conditions would make the original statement true?'
        );
        break;

      case 'proof_decomposition':
        enhancements.relatedModes = [ThinkingMode.ALGORITHMIC, ThinkingMode.FORMALLOGIC];
        enhancements.suggestions!.push(
          'Break the proof into atomic, independently verifiable steps'
        );
        break;

      case 'consistency_check':
        enhancements.guidingQuestions!.push(
          'Are there any hidden assumptions?',
          'Do all definitions agree with standard usage?'
        );
        break;

      case 'gap_identification':
        enhancements.suggestions!.push(
          'Document each gap with its severity and suggested fix'
        );
        break;
    }

    // Mathematical model analysis
    if (thought.mathematicalModel) {
      enhancements.metrics!.hasModel = 1;
      if (thought.mathematicalModel.validated) {
        enhancements.metrics!.modelValidated = 1;
      } else {
        enhancements.suggestions!.push(
          'Consider validating the mathematical model'
        );
      }
    }

    // Proof strategy analysis
    if (thought.proofStrategy) {
      enhancements.metrics!.proofType = thought.proofStrategy.type;
      enhancements.metrics!.proofCompleteness = thought.proofStrategy.completeness;

      if (thought.proofStrategy.type === 'induction') {
        if (!thought.proofStrategy.baseCase) {
          enhancements.warnings!.push('Induction proof missing base case');
        }
        if (!thought.proofStrategy.inductiveStep) {
          enhancements.warnings!.push('Induction proof missing inductive step');
        }
      }
    }

    // Decomposition analysis
    if (thought.decomposition) {
      enhancements.metrics!.atomCount = thought.decomposition.atomCount;
      enhancements.metrics!.completeness = thought.decomposition.completeness;
      enhancements.metrics!.rigorLevel = thought.decomposition.rigorLevel;
    }

    // Consistency report
    if (thought.consistencyReport) {
      if (!thought.consistencyReport.isConsistent) {
        enhancements.warnings!.push(
          `Inconsistency detected: ${thought.consistencyReport.inconsistencies.length} issue(s)`
        );
      }
      enhancements.metrics!.consistencyScore = thought.consistencyReport.overallScore;
    }

    // Gap analysis
    if (thought.gapAnalysis) {
      if (thought.gapAnalysis.gaps.length > 0) {
        enhancements.warnings!.push(
          `${thought.gapAnalysis.gaps.length} gap(s) identified in reasoning`
        );
      }
      enhancements.metrics!.gapCount = thought.gapAnalysis.gaps.length;
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return VALID_THOUGHT_TYPES.includes(thoughtType as MathematicsThoughtType);
  }

  /**
   * Resolve thought type
   */
  private resolveThoughtType(inputType: string | undefined): MathematicsThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as MathematicsThoughtType)) {
      return inputType as MathematicsThoughtType;
    }
    return 'axiom_definition';
  }

  /**
   * Normalize mathematical model
   */
  private normalizeModel(model: MathematicalModel | undefined): MathematicalModel | undefined {
    if (!model) return undefined;

    return {
      latex: model.latex || '',
      symbolic: model.symbolic || '',
      ascii: model.ascii,
      tensorRank: model.tensorRank,
      dimensions: model.dimensions,
      invariants: model.invariants || [],
      symmetries: model.symmetries || [],
      complexity: model.complexity,
      stabilityNotes: model.stabilityNotes,
      validated: model.validated ?? false,
      validationMethod: model.validationMethod,
    };
  }

  /**
   * Normalize proof strategy
   */
  private normalizeProofStrategy(strategy: Partial<ProofStrategy> | undefined): ProofStrategy | undefined {
    if (!strategy || !strategy.type) return undefined;

    return {
      type: VALID_PROOF_TYPES.includes(strategy.type) ? strategy.type : 'direct',
      steps: strategy.steps || [],
      baseCase: strategy.baseCase,
      inductiveStep: strategy.inductiveStep,
      completeness: strategy.completeness ?? 0,
    };
  }

  /**
   * Validate mathematical model
   */
  private validateModel(model: MathematicalModel): ValidationResult {
    const warnings = [];

    if (!model.latex && !model.symbolic) {
      warnings.push(
        createValidationWarning(
          'mathematicalModel',
          'Model has no LaTeX or symbolic representation',
          'Provide at least one formal representation'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate proof strategy
   */
  private validateProofStrategy(strategy: Partial<ProofStrategy> & { type: string; steps?: string[] }): ValidationResult {
    const errors: ReturnType<typeof createValidationError>[] = [];
    const warnings: ReturnType<typeof createValidationWarning>[] = [];

    if (!VALID_PROOF_TYPES.includes(strategy.type)) {
      errors.push(
        createValidationError(
          'proofStrategy.type',
          `Invalid proof type: ${strategy.type}. Valid types: ${VALID_PROOF_TYPES.join(', ')}`,
          'INVALID_PROOF_TYPE'
        )
      );
    }

    if (strategy.type === 'induction') {
      if (!strategy.baseCase) {
        warnings.push(
          createValidationWarning(
            'proofStrategy.baseCase',
            'Induction proof should specify base case',
            'Add baseCase field for clarity'
          )
        );
      }
      if (!strategy.inductiveStep) {
        warnings.push(
          createValidationWarning(
            'proofStrategy.inductiveStep',
            'Induction proof should specify inductive step',
            'Add inductiveStep field for clarity'
          )
        );
      }
    }

    if (strategy.completeness !== undefined && (strategy.completeness < 0 || strategy.completeness > 1)) {
      warnings.push(
        createValidationWarning(
          'proofStrategy.completeness',
          `Completeness (${strategy.completeness}) should be between 0 and 1`,
          'Normalize completeness to [0, 1] range'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }
}
