/**
 * GenericModeHandler - Phase 10 Sprint 1 (v8.0.0)
 *
 * Fallback handler that replicates current ThoughtFactory behavior
 * for modes that don't have specialized handlers yet.
 *
 * This handler:
 * - Provides a default implementation for any mode
 * - Delegates to the original ThoughtFactory logic
 * - Serves as a base class for specialized handlers
 */

import { randomUUID } from 'crypto';
import {
  ThinkingMode,
  Thought,
  ShannonStage,
  SequentialThought,
  ShannonThought,
  MathematicsThought,
  PhysicsThought,
  HybridThought,
  InductiveThought,
  DeductiveThought,
  AbductiveThought,
  CausalThought,
  isFullyImplemented,
} from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  ModeStatus,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';
import { toExtendedThoughtType } from '../../utils/type-guards.js';

/**
 * GenericModeHandler - Default implementation for all modes
 *
 * This handler provides the baseline thought creation logic that was
 * previously in ThoughtFactory's switch statement. It can be used:
 *
 * 1. As a fallback for modes without specialized handlers
 * 2. As a base class for specialized handlers to extend
 * 3. During incremental migration from ThoughtFactory
 *
 * @example
 * ```typescript
 * // Use directly for fallback
 * const handler = new GenericModeHandler(ThinkingMode.HYBRID);
 * const thought = handler.createThought(input, sessionId);
 *
 * // Extend for specialized behavior
 * class CausalHandler extends GenericModeHandler {
 *   constructor() {
 *     super(ThinkingMode.CAUSAL);
 *   }
 *
 *   validate(input: ThinkingToolInput): ValidationResult {
 *     // Add specialized validation
 *   }
 * }
 * ```
 */
export class GenericModeHandler implements ModeHandler {
  readonly mode: ThinkingMode;
  readonly modeName: string;
  readonly description: string;

  constructor(mode: ThinkingMode, modeName?: string, description?: string) {
    this.mode = mode;
    this.modeName = modeName || this.getDefaultModeName(mode);
    this.description = description || this.getDefaultDescription(mode);
  }

  /**
   * Create a thought object from input
   *
   * This replicates the logic from ThoughtFactory.createThought()
   * for the mode this handler is configured for.
   */
  createThought(input: ThinkingToolInput, sessionId: string): Thought {
    const baseThought = this.createBaseThought(input, sessionId);
    return this.createModeSpecificThought(input, baseThought);
  }

  /**
   * Create the base thought structure common to all modes
   */
  protected createBaseThought(input: ThinkingToolInput, sessionId: string) {
    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Create mode-specific thought structure
   *
   * Override this method in specialized handlers to add
   * mode-specific logic and validation.
   */
  protected createModeSpecificThought(
    input: ThinkingToolInput,
    baseThought: ReturnType<typeof this.createBaseThought>
  ): Thought {
    const mode = (input.mode as ThinkingMode) || this.mode;

    switch (mode) {
      case ThinkingMode.SEQUENTIAL:
        return {
          ...baseThought,
          mode: ThinkingMode.SEQUENTIAL,
          revisionReason: input.revisionReason,
          branchFrom: input.branchFrom,
          branchId: input.branchId,
        } as SequentialThought;

      case ThinkingMode.SHANNON:
        return {
          ...baseThought,
          mode: ThinkingMode.SHANNON,
          stage: (input.stage as ShannonStage) || ShannonStage.PROBLEM_DEFINITION,
          uncertainty: input.uncertainty || 0.5,
          dependencies: input.dependencies || [],
          assumptions: input.assumptions || [],
        } as ShannonThought;

      case ThinkingMode.MATHEMATICS:
        return {
          ...baseThought,
          mode: ThinkingMode.MATHEMATICS,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'model'),
          mathematicalModel: input.mathematicalModel,
          proofStrategy: input.proofStrategy,
          dependencies: input.dependencies || [],
          assumptions: input.assumptions || [],
          uncertainty: input.uncertainty || 0.5,
        } as MathematicsThought;

      case ThinkingMode.PHYSICS:
        return {
          ...baseThought,
          mode: ThinkingMode.PHYSICS,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'model'),
          tensorProperties: input.tensorProperties,
          physicalInterpretation: input.physicalInterpretation,
          dependencies: input.dependencies || [],
          assumptions: input.assumptions || [],
          uncertainty: input.uncertainty || 0.5,
        } as PhysicsThought;

      case ThinkingMode.INDUCTIVE:
        return {
          ...baseThought,
          mode: ThinkingMode.INDUCTIVE,
          observations: (input.observations as string[]) || [],
          pattern: input.pattern,
          generalization: input.generalization || '',
          confidence: input.confidence ?? 0.5,
          counterexamples: input.counterexamples || [],
          sampleSize: input.sampleSize,
        } as InductiveThought;

      case ThinkingMode.DEDUCTIVE:
        return {
          ...baseThought,
          mode: ThinkingMode.DEDUCTIVE,
          premises: input.premises || [],
          conclusion: (input.conclusion as string) || '',
          logicForm: input.logicForm,
          validityCheck: input.validityCheck ?? false,
          soundnessCheck: input.soundnessCheck,
        } as DeductiveThought;

      case ThinkingMode.ABDUCTIVE:
        return {
          ...baseThought,
          mode: ThinkingMode.ABDUCTIVE,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
          observations: (input.observations as any[]) || [],
          hypotheses: input.hypotheses || [],
          evaluationCriteria: input.evaluationCriteria,
          evidence: input.evidence || [],
          bestExplanation: input.bestExplanation,
        } as AbductiveThought;

      case ThinkingMode.CAUSAL:
        return this.createCausalThought(input, baseThought);

      case ThinkingMode.HYBRID:
      default:
        return this.createHybridThought(input, baseThought);
    }
  }

  /**
   * Create a causal thought with graph handling
   */
  protected createCausalThought(
    input: ThinkingToolInput,
    baseThought: ReturnType<typeof this.createBaseThought>
  ): CausalThought {
    const inputAny = input as any;
    const causalGraph = input.causalGraph || {
      nodes: inputAny.nodes || [],
      edges: inputAny.edges || [],
    };

    return {
      ...baseThought,
      mode: ThinkingMode.CAUSAL,
      thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
      causalGraph,
      interventions: input.interventions || [],
      mechanisms: input.mechanisms || [],
      confounders: input.confounders || [],
    } as CausalThought;
  }

  /**
   * Create a hybrid thought (default fallback)
   */
  protected createHybridThought(
    input: ThinkingToolInput,
    baseThought: ReturnType<typeof this.createBaseThought>
  ): HybridThought {
    return {
      ...baseThought,
      mode: ThinkingMode.HYBRID,
      thoughtType: toExtendedThoughtType(input.thoughtType, 'synthesis'),
      stage: input.stage as ShannonStage,
      uncertainty: input.uncertainty,
      dependencies: input.dependencies,
      assumptions: input.assumptions,
      mathematicalModel: input.mathematicalModel,
      tensorProperties: input.tensorProperties,
      physicalInterpretation: input.physicalInterpretation,
      primaryMode: (input.mode || ThinkingMode.HYBRID) as any,
      secondaryFeatures: [],
    } as HybridThought;
  }

  /**
   * Validate mode-specific input
   *
   * The generic handler performs basic validation.
   * Specialized handlers should override for deeper validation.
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const warnings = [];

    // Basic validation - check thought content
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    // Check thought numbers
    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Warn about experimental modes
    const mode = (input.mode as ThinkingMode) || ThinkingMode.HYBRID;
    if (!isFullyImplemented(mode)) {
      warnings.push(
        createValidationWarning(
          'mode',
          `Mode '${mode}' is experimental with limited runtime implementation`,
          'Consider using a fully implemented mode for production use'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   *
   * The generic handler returns minimal enhancements.
   * Specialized handlers can provide richer context.
   */
  getEnhancements(thought: Thought): ModeEnhancements {
    return {
      suggestions: [],
      relatedModes: this.getRelatedModes(thought.mode),
    };
  }

  /**
   * Get mode status information
   */
  getModeStatus(): ModeStatus {
    return {
      mode: this.mode,
      isFullyImplemented: isFullyImplemented(this.mode),
      hasSpecializedHandler: false, // GenericHandler is not specialized
      note: isFullyImplemented(this.mode)
        ? undefined
        : 'This mode is experimental with limited runtime implementation',
    };
  }

  /**
   * Get related modes for suggestions
   */
  protected getRelatedModes(mode: ThinkingMode): ThinkingMode[] {
    const relatedModes: Record<ThinkingMode, ThinkingMode[]> = {
      [ThinkingMode.SEQUENTIAL]: [ThinkingMode.HYBRID, ThinkingMode.SHANNON],
      [ThinkingMode.SHANNON]: [ThinkingMode.SEQUENTIAL, ThinkingMode.MATHEMATICS],
      [ThinkingMode.MATHEMATICS]: [ThinkingMode.PHYSICS, ThinkingMode.ALGORITHMIC],
      [ThinkingMode.PHYSICS]: [ThinkingMode.MATHEMATICS, ThinkingMode.ENGINEERING],
      [ThinkingMode.HYBRID]: [ThinkingMode.SEQUENTIAL, ThinkingMode.METAREASONING],
      [ThinkingMode.CAUSAL]: [ThinkingMode.BAYESIAN, ThinkingMode.COUNTERFACTUAL],
      [ThinkingMode.BAYESIAN]: [ThinkingMode.CAUSAL, ThinkingMode.EVIDENTIAL],
      [ThinkingMode.INDUCTIVE]: [ThinkingMode.DEDUCTIVE, ThinkingMode.ABDUCTIVE],
      [ThinkingMode.DEDUCTIVE]: [ThinkingMode.INDUCTIVE, ThinkingMode.FORMALLOGIC],
      [ThinkingMode.ABDUCTIVE]: [ThinkingMode.INDUCTIVE, ThinkingMode.CAUSAL],
      [ThinkingMode.COUNTERFACTUAL]: [ThinkingMode.CAUSAL, ThinkingMode.GAMETHEORY],
      [ThinkingMode.ANALOGICAL]: [ThinkingMode.INDUCTIVE, ThinkingMode.FIRSTPRINCIPLES],
      [ThinkingMode.TEMPORAL]: [ThinkingMode.CAUSAL, ThinkingMode.SEQUENTIAL],
      [ThinkingMode.GAMETHEORY]: [ThinkingMode.OPTIMIZATION, ThinkingMode.COUNTERFACTUAL],
      [ThinkingMode.EVIDENTIAL]: [ThinkingMode.BAYESIAN, ThinkingMode.SCIENTIFICMETHOD],
      [ThinkingMode.FIRSTPRINCIPLES]: [ThinkingMode.DEDUCTIVE, ThinkingMode.ANALOGICAL],
      [ThinkingMode.SYSTEMSTHINKING]: [ThinkingMode.CAUSAL, ThinkingMode.OPTIMIZATION],
      [ThinkingMode.SCIENTIFICMETHOD]: [ThinkingMode.EVIDENTIAL, ThinkingMode.SYNTHESIS],
      [ThinkingMode.FORMALLOGIC]: [ThinkingMode.DEDUCTIVE, ThinkingMode.MATHEMATICS],
      [ThinkingMode.METAREASONING]: [ThinkingMode.HYBRID, ThinkingMode.CRITIQUE],
      [ThinkingMode.RECURSIVE]: [ThinkingMode.ALGORITHMIC, ThinkingMode.MATHEMATICS],
      [ThinkingMode.MODAL]: [ThinkingMode.FORMALLOGIC, ThinkingMode.COUNTERFACTUAL],
      [ThinkingMode.STOCHASTIC]: [ThinkingMode.BAYESIAN, ThinkingMode.OPTIMIZATION],
      [ThinkingMode.CONSTRAINT]: [ThinkingMode.OPTIMIZATION, ThinkingMode.FORMALLOGIC],
      [ThinkingMode.OPTIMIZATION]: [ThinkingMode.CONSTRAINT, ThinkingMode.GAMETHEORY],
      [ThinkingMode.ENGINEERING]: [ThinkingMode.OPTIMIZATION, ThinkingMode.SYSTEMSTHINKING],
      [ThinkingMode.COMPUTABILITY]: [ThinkingMode.ALGORITHMIC, ThinkingMode.FORMALLOGIC],
      [ThinkingMode.CRYPTANALYTIC]: [ThinkingMode.BAYESIAN, ThinkingMode.ALGORITHMIC],
      [ThinkingMode.ALGORITHMIC]: [ThinkingMode.MATHEMATICS, ThinkingMode.OPTIMIZATION],
      [ThinkingMode.SYNTHESIS]: [ThinkingMode.CRITIQUE, ThinkingMode.ANALYSIS],
      [ThinkingMode.ARGUMENTATION]: [ThinkingMode.CRITIQUE, ThinkingMode.FORMALLOGIC],
      [ThinkingMode.CRITIQUE]: [ThinkingMode.ARGUMENTATION, ThinkingMode.SYNTHESIS],
      [ThinkingMode.ANALYSIS]: [ThinkingMode.SYNTHESIS, ThinkingMode.SCIENTIFICMETHOD],
      [ThinkingMode.CUSTOM]: [ThinkingMode.HYBRID],
    };

    return relatedModes[mode] || [ThinkingMode.HYBRID];
  }

  /**
   * Get default mode name
   */
  private getDefaultModeName(mode: ThinkingMode): string {
    const names: Record<ThinkingMode, string> = {
      [ThinkingMode.SEQUENTIAL]: 'Sequential Thinking',
      [ThinkingMode.SHANNON]: 'Shannon Problem-Solving',
      [ThinkingMode.MATHEMATICS]: 'Mathematical Reasoning',
      [ThinkingMode.PHYSICS]: 'Physics Modeling',
      [ThinkingMode.HYBRID]: 'Hybrid Mode',
      [ThinkingMode.INDUCTIVE]: 'Inductive Reasoning',
      [ThinkingMode.DEDUCTIVE]: 'Deductive Reasoning',
      [ThinkingMode.ABDUCTIVE]: 'Abductive Reasoning',
      [ThinkingMode.CAUSAL]: 'Causal Analysis',
      [ThinkingMode.BAYESIAN]: 'Bayesian Inference',
      [ThinkingMode.COUNTERFACTUAL]: 'Counterfactual Reasoning',
      [ThinkingMode.ANALOGICAL]: 'Analogical Reasoning',
      [ThinkingMode.TEMPORAL]: 'Temporal Reasoning',
      [ThinkingMode.GAMETHEORY]: 'Game Theory',
      [ThinkingMode.EVIDENTIAL]: 'Evidential Reasoning',
      [ThinkingMode.FIRSTPRINCIPLES]: 'First Principles',
      [ThinkingMode.SYSTEMSTHINKING]: 'Systems Thinking',
      [ThinkingMode.SCIENTIFICMETHOD]: 'Scientific Method',
      [ThinkingMode.FORMALLOGIC]: 'Formal Logic',
      [ThinkingMode.METAREASONING]: 'Meta-Reasoning',
      [ThinkingMode.RECURSIVE]: 'Recursive Reasoning',
      [ThinkingMode.MODAL]: 'Modal Logic',
      [ThinkingMode.STOCHASTIC]: 'Stochastic Reasoning',
      [ThinkingMode.CONSTRAINT]: 'Constraint Satisfaction',
      [ThinkingMode.OPTIMIZATION]: 'Optimization',
      [ThinkingMode.ENGINEERING]: 'Engineering Analysis',
      [ThinkingMode.COMPUTABILITY]: 'Computability Theory',
      [ThinkingMode.CRYPTANALYTIC]: 'Cryptanalysis',
      [ThinkingMode.ALGORITHMIC]: 'Algorithm Design',
      [ThinkingMode.SYNTHESIS]: 'Literature Synthesis',
      [ThinkingMode.ARGUMENTATION]: 'Academic Argumentation',
      [ThinkingMode.CRITIQUE]: 'Critical Analysis',
      [ThinkingMode.ANALYSIS]: 'Qualitative Analysis',
      [ThinkingMode.CUSTOM]: 'Custom Mode',
    };

    return names[mode] || 'Unknown Mode';
  }

  /**
   * Get default mode description
   */
  private getDefaultDescription(mode: ThinkingMode): string {
    const descriptions: Record<ThinkingMode, string> = {
      [ThinkingMode.SEQUENTIAL]: 'Step-by-step logical reasoning',
      [ThinkingMode.SHANNON]: 'Claude Shannon\'s 5-stage problem-solving methodology',
      [ThinkingMode.MATHEMATICS]: 'Mathematical proofs and formal reasoning',
      [ThinkingMode.PHYSICS]: 'Physical modeling with tensors and conservation laws',
      [ThinkingMode.HYBRID]: 'Flexible combination of multiple reasoning modes',
      [ThinkingMode.INDUCTIVE]: 'Reasoning from specific cases to general principles',
      [ThinkingMode.DEDUCTIVE]: 'Reasoning from general principles to specific conclusions',
      [ThinkingMode.ABDUCTIVE]: 'Inference to the best explanation',
      [ThinkingMode.CAUSAL]: 'Causal graph analysis and intervention reasoning',
      [ThinkingMode.BAYESIAN]: 'Probabilistic reasoning with prior updates',
      [ThinkingMode.COUNTERFACTUAL]: 'What-if scenario analysis',
      [ThinkingMode.ANALOGICAL]: 'Reasoning by structural similarity',
      [ThinkingMode.TEMPORAL]: 'Temporal logic and event sequencing',
      [ThinkingMode.GAMETHEORY]: 'Strategic interaction and Nash equilibria',
      [ThinkingMode.EVIDENTIAL]: 'Dempster-Shafer evidence theory',
      [ThinkingMode.FIRSTPRINCIPLES]: 'Reasoning from fundamental truths',
      [ThinkingMode.SYSTEMSTHINKING]: 'Feedback loops and system dynamics',
      [ThinkingMode.SCIENTIFICMETHOD]: 'Hypothesis testing and experimentation',
      [ThinkingMode.FORMALLOGIC]: 'Propositional and predicate logic',
      [ThinkingMode.METAREASONING]: 'Reasoning about reasoning strategies',
      [ThinkingMode.RECURSIVE]: 'Self-similar problem decomposition',
      [ThinkingMode.MODAL]: 'Possibility and necessity reasoning',
      [ThinkingMode.STOCHASTIC]: 'Probabilistic state transitions',
      [ThinkingMode.CONSTRAINT]: 'Constraint satisfaction problems',
      [ThinkingMode.OPTIMIZATION]: 'Objective function optimization',
      [ThinkingMode.ENGINEERING]: 'Requirements, trade studies, and FMEA',
      [ThinkingMode.COMPUTABILITY]: 'Turing machines and decidability',
      [ThinkingMode.CRYPTANALYTIC]: 'Cryptanalysis with deciban evidence',
      [ThinkingMode.ALGORITHMIC]: 'CLRS algorithm design and analysis',
      [ThinkingMode.SYNTHESIS]: 'Literature review and integration',
      [ThinkingMode.ARGUMENTATION]: 'Toulmin model academic arguments',
      [ThinkingMode.CRITIQUE]: 'Critical evaluation of scholarly work',
      [ThinkingMode.ANALYSIS]: 'Qualitative data analysis methods',
      [ThinkingMode.CUSTOM]: 'User-defined reasoning mode',
    };

    return descriptions[mode] || 'Unknown reasoning mode';
  }
}
