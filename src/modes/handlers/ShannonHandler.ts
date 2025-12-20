/**
 * ShannonHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Shannon methodology mode with:
 * - 5-stage problem-solving process validation
 * - Stage progression tracking
 * - Uncertainty and confidence assessment
 * - Alternative approach suggestions
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, ShannonStage, ShannonThought } from '../../types/core.js';
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
 * Stage order for validation and progression tracking
 */
const STAGE_ORDER: ShannonStage[] = [
  ShannonStage.PROBLEM_DEFINITION,
  ShannonStage.CONSTRAINTS,
  ShannonStage.MODEL,
  ShannonStage.PROOF,
  ShannonStage.IMPLEMENTATION,
];

/**
 * ShannonHandler - Specialized handler for Shannon's problem-solving methodology
 *
 * Implements Claude Shannon's systematic approach:
 * 1. Problem Definition - Clearly state the problem
 * 2. Constraints - Identify all constraints and boundaries
 * 3. Model - Create a formal model of the solution
 * 4. Proof - Prove the model is correct
 * 5. Implementation - Translate to practical implementation
 */
export class ShannonHandler implements ModeHandler {
  readonly mode = ThinkingMode.SHANNON;
  readonly modeName = 'Shannon Problem-Solving';
  readonly description = "Claude Shannon's 5-stage systematic problem-solving methodology";

  /**
   * Supported thought types for Shannon mode
   */
  private readonly supportedThoughtTypes = [
    'problem_definition',
    'constraint_identification',
    'model_construction',
    'proof_development',
    'implementation_planning',
    'recheck',
    'refinement',
  ];

  /**
   * Create a Shannon thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): ShannonThought {
    const inputAny = input as any;

    // Resolve stage
    const stage = this.resolveStage(input.stage);

    // Calculate confidence if factors provided
    const confidenceFactors = inputAny.confidenceFactors || this.calculateConfidenceFactors(inputAny);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.SHANNON,

      // Core Shannon fields
      stage,
      uncertainty: input.uncertainty ?? 0.5,
      dependencies: input.dependencies || [],
      assumptions: input.assumptions || [],

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,

      // Extended Shannon fields
      recheckStep: inputAny.recheckStep,
      confidenceFactors,
      alternativeApproaches: inputAny.alternativeApproaches || [],
      knownLimitations: inputAny.knownLimitations || [],
    };
  }

  /**
   * Validate Shannon-specific input
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

    // Validate stage
    if (input.stage) {
      if (!STAGE_ORDER.includes(input.stage as ShannonStage)) {
        errors.push(
          createValidationError(
            'stage',
            `Invalid Shannon stage: ${input.stage}. Valid stages: ${STAGE_ORDER.join(', ')}`,
            'INVALID_SHANNON_STAGE'
          )
        );
      }
    } else {
      warnings.push(
        createValidationWarning(
          'stage',
          'No stage specified - defaulting to problem_definition',
          'Specify a stage to track methodology progression'
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

    // Validate confidence factors if provided
    if (inputAny.confidenceFactors) {
      const cf = inputAny.confidenceFactors;
      const cfFields = ['dataQuality', 'methodologyRobustness', 'assumptionValidity'];
      for (const field of cfFields) {
        if (cf[field] !== undefined && (cf[field] < 0 || cf[field] > 1)) {
          warnings.push(
            createValidationWarning(
              `confidenceFactors.${field}`,
              `${field} (${cf[field]}) should be between 0 and 1`,
              'Normalize confidence factors to [0, 1] range'
            )
          );
        }
      }
    }

    // Suggest assumptions for early stages
    if (!input.assumptions || input.assumptions.length === 0) {
      const stage = input.stage as ShannonStage;
      if (stage === ShannonStage.PROBLEM_DEFINITION || stage === ShannonStage.CONSTRAINTS) {
        warnings.push(
          createValidationWarning(
            'assumptions',
            'No assumptions stated in early stage',
            'Document assumptions early to improve clarity and validation'
          )
        );
      }
    }

    // Validate recheck step if provided
    if (inputAny.recheckStep) {
      if (!inputAny.recheckStep.stepToRecheck || !inputAny.recheckStep.reason) {
        warnings.push(
          createValidationWarning(
            'recheckStep',
            'Recheck step missing required fields',
            'Include stepToRecheck and reason for proper tracking'
          )
        );
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get Shannon-specific enhancements
   */
  getEnhancements(thought: ShannonThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.SEQUENTIAL, ThinkingMode.MATHEMATICS, ThinkingMode.ENGINEERING],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        stageIndex: STAGE_ORDER.indexOf(thought.stage),
        uncertainty: thought.uncertainty,
        dependencyCount: thought.dependencies?.length || 0,
        assumptionCount: thought.assumptions?.length || 0,
      },
      mentalModels: [
        "Shannon's Problem-Solving",
        'Systematic Decomposition',
        'Constraint-Based Design',
        'Proof-First Development',
      ],
    };

    // Stage-specific guidance
    switch (thought.stage) {
      case ShannonStage.PROBLEM_DEFINITION:
        enhancements.guidingQuestions!.push(
          'What is the essential problem we are trying to solve?',
          'What would a solution look like?',
          'What are the inputs and outputs?'
        );
        enhancements.suggestions!.push(
          'Focus on clearly stating what success looks like before moving to constraints'
        );
        break;

      case ShannonStage.CONSTRAINTS:
        enhancements.guidingQuestions!.push(
          'What are the hard constraints that cannot be violated?',
          'What are the soft constraints we should optimize for?',
          'Are there any hidden constraints we might be missing?'
        );
        enhancements.suggestions!.push(
          'Document all constraints explicitly - implicit constraints often cause problems later'
        );
        break;

      case ShannonStage.MODEL:
        enhancements.guidingQuestions!.push(
          'Does the model capture all essential aspects of the problem?',
          'Is the model simple enough to reason about formally?',
          'What assumptions does the model make?'
        );
        enhancements.suggestions!.push(
          'Consider creating multiple models and comparing their trade-offs'
        );
        break;

      case ShannonStage.PROOF:
        enhancements.guidingQuestions!.push(
          'What property are we trying to prove?',
          'What technique is most appropriate for this proof?',
          'Are there edge cases we need to handle?'
        );
        enhancements.suggestions!.push(
          'Start with the simplest case and build up to the general proof'
        );
        enhancements.relatedModes = [ThinkingMode.MATHEMATICS, ThinkingMode.FORMALLOGIC, ThinkingMode.DEDUCTIVE];
        break;

      case ShannonStage.IMPLEMENTATION:
        enhancements.guidingQuestions!.push(
          'How does the implementation map to the formal model?',
          'What practical constraints affect the implementation?',
          'How will we verify the implementation matches the proof?'
        );
        enhancements.suggestions!.push(
          'Create a clear mapping between model elements and implementation components'
        );
        enhancements.relatedModes = [ThinkingMode.ENGINEERING, ThinkingMode.ALGORITHMIC];
        break;
    }

    // Uncertainty-based suggestions
    if (thought.uncertainty > 0.7) {
      enhancements.warnings!.push(
        'High uncertainty detected - consider revisiting assumptions or gathering more information'
      );
    } else if (thought.uncertainty < 0.2) {
      enhancements.suggestions!.push(
        'Low uncertainty suggests good progress - consider moving to the next stage'
      );
    }

    // Confidence factors analysis
    if (thought.confidenceFactors) {
      const cf = thought.confidenceFactors;
      enhancements.metrics!.dataQuality = cf.dataQuality;
      enhancements.metrics!.methodologyRobustness = cf.methodologyRobustness;
      enhancements.metrics!.assumptionValidity = cf.assumptionValidity;

      const avgConfidence = (cf.dataQuality + cf.methodologyRobustness + cf.assumptionValidity) / 3;
      enhancements.metrics!.overallConfidence = avgConfidence;

      if (cf.assumptionValidity < 0.5) {
        enhancements.warnings!.push(
          'Low assumption validity - validate assumptions before proceeding'
        );
      }
    }

    // Alternative approaches
    if (thought.alternativeApproaches && thought.alternativeApproaches.length > 0) {
      enhancements.metrics!.alternativeCount = thought.alternativeApproaches.length;
    } else if (thought.stage !== ShannonStage.IMPLEMENTATION) {
      enhancements.suggestions!.push(
        'Consider documenting alternative approaches for comparison'
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
   * Resolve stage from input
   */
  private resolveStage(stage: string | undefined): ShannonStage {
    if (!stage) {
      return ShannonStage.PROBLEM_DEFINITION;
    }

    const stageMap: Record<string, ShannonStage> = {
      problem_definition: ShannonStage.PROBLEM_DEFINITION,
      constraints: ShannonStage.CONSTRAINTS,
      model: ShannonStage.MODEL,
      proof: ShannonStage.PROOF,
      implementation: ShannonStage.IMPLEMENTATION,
    };

    return stageMap[stage.toLowerCase()] || ShannonStage.PROBLEM_DEFINITION;
  }

  /**
   * Calculate confidence factors from input if not provided
   */
  private calculateConfidenceFactors(input: any): { dataQuality: number; methodologyRobustness: number; assumptionValidity: number } | undefined {
    // Only calculate if we have relevant data
    if (!input.assumptions && !input.dependencies) {
      return undefined;
    }

    // Heuristic calculation
    const assumptionCount = input.assumptions?.length || 0;
    const dependencyCount = input.dependencies?.length || 0;

    return {
      dataQuality: Math.max(0.3, 1 - (input.uncertainty || 0.5)),
      methodologyRobustness: Math.min(0.9, 0.5 + (dependencyCount * 0.1)),
      assumptionValidity: assumptionCount > 0 ? 0.7 : 0.5,
    };
  }
}
