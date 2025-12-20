/**
 * HybridHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Hybrid reasoning mode with:
 * - Multi-mode combination based on recommendation engine
 * - Convergent validation across reasoning approaches
 * - 97% confidence target through multi-modal synthesis
 * - Dynamic mode switching based on problem evolution
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import type { HybridThought as BaseHybridThought } from '../../types/modes/hybrid.js';
import { ModeRecommender, ProblemCharacteristics, ModeRecommendation } from '../../types/modes/recommendations.js';
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
 * Mode contribution tracking
 */
interface ModeContribution {
  mode: ThinkingMode;
  confidence: number;
  insights: string[];
  evidence: string[];
  agreementWithOthers: number; // 0-1 correlation with other modes
}

/**
 * Convergence status for multi-modal synthesis
 */
interface ConvergenceStatus {
  achieved: boolean;
  targetConfidence: number;
  currentConfidence: number;
  modesAgreeing: number;
  totalModes: number;
  convergenceScore: number; // 0-1 measure of agreement
}

/**
 * Extended Hybrid thought with recommendation engine integration
 */
export interface HybridThought extends BaseHybridThought {
  // Multi-mode combination
  activeModes: ThinkingMode[];
  modeContributions: ModeContribution[];
  convergenceStatus: ConvergenceStatus;

  // Recommendation-based selection
  problemCharacteristics?: ProblemCharacteristics;
  selectedRecommendations?: ModeRecommendation[];

  // Synthesis tracking
  synthesisStrategy: 'parallel' | 'sequential' | 'weighted';
  overallConfidence: number;
}

/**
 * Valid thought types for hybrid mode
 */
const VALID_THOUGHT_TYPES = [
  'mode_selection',
  'parallel_analysis',
  'sequential_analysis',
  'convergence_check',
  'synthesis',
  'confidence_assessment',
  'mode_switching',
] as const;

type HybridThoughtType = (typeof VALID_THOUGHT_TYPES)[number];

/**
 * Valid synthesis strategies
 */
const VALID_STRATEGIES = ['parallel', 'sequential', 'weighted'] as const;

/**
 * Target confidence for hybrid mode
 */
const TARGET_CONFIDENCE = 0.97;

/**
 * HybridHandler - Specialized handler for hybrid multi-mode reasoning
 *
 * Combines multiple reasoning modes based on the recommendation engine
 * to achieve high confidence through convergent validation. The hybrid
 * mode synthesizes insights from the top 3 recommended modes.
 *
 * Key features:
 * - Uses ModeRecommender to select optimal mode combinations
 * - Tracks confidence contributions from each active mode
 * - Monitors convergence across different reasoning approaches
 * - Targets 97% confidence through multi-modal synthesis
 */
export class HybridHandler implements ModeHandler {
  readonly mode = ThinkingMode.HYBRID;
  readonly modeName = 'Hybrid Multi-Mode Reasoning';
  readonly description =
    'Combines top 3 recommended modes for 97% confidence through multi-modal synthesis';

  private recommender: ModeRecommender;

  /**
   * Supported thought types for hybrid mode
   */
  private readonly supportedThoughtTypes = [...VALID_THOUGHT_TYPES];

  constructor() {
    this.recommender = new ModeRecommender();
  }

  /**
   * Create a hybrid thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): HybridThought {
    const inputAny = input as any;

    // Get problem characteristics
    const problemCharacteristics = inputAny.problemCharacteristics
      ? this.normalizeProblemCharacteristics(inputAny.problemCharacteristics)
      : this.inferCharacteristics(input);

    // Get mode recommendations
    const recommendations = this.recommender.recommendModes(problemCharacteristics);
    const topModes = recommendations.slice(0, 3);

    // Determine active modes
    const activeModes = inputAny.activeModes
      ? inputAny.activeModes.map((m: string) => this.resolveMode(m))
      : topModes.map((r) => r.mode);

    // Process mode contributions
    const modeContributions = inputAny.modeContributions
      ? inputAny.modeContributions.map((c: any) => this.normalizeContribution(c))
      : this.initializeContributions(activeModes);

    // Calculate convergence status
    const convergenceStatus = this.calculateConvergence(modeContributions, inputAny.convergenceStatus);

    // Determine synthesis strategy
    const synthesisStrategy = this.resolveSynthesisStrategy(inputAny.synthesisStrategy);

    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(
      modeContributions,
      convergenceStatus,
      inputAny.overallConfidence
    );

    // Resolve primary mode (highest contribution)
    const primaryMode = this.resolvePrimaryMode(modeContributions, activeModes);

    // Extract secondary features
    const secondaryFeatures = inputAny.secondaryFeatures ||
      activeModes
        .filter((m: ThinkingMode) => m !== primaryMode)
        .map((m: ThinkingMode) => `${m} reasoning`);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.HYBRID,

      // Base hybrid fields
      primaryMode: this.mapToPrimaryMode(primaryMode),
      secondaryFeatures,
      switchReason: inputAny.switchReason,
      thoughtType: inputAny.thoughtType,
      stage: inputAny.stage,
      uncertainty: inputAny.uncertainty ?? (1 - overallConfidence),
      dependencies: inputAny.dependencies,
      assumptions: inputAny.assumptions,
      mathematicalModel: inputAny.mathematicalModel,
      tensorProperties: inputAny.tensorProperties,
      physicalInterpretation: inputAny.physicalInterpretation,

      // Extended hybrid fields
      activeModes,
      modeContributions,
      convergenceStatus,
      problemCharacteristics,
      selectedRecommendations: topModes,
      synthesisStrategy,
      overallConfidence,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate hybrid-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: { field: string; message: string; code: string }[] = [];
    const warnings: ReturnType<typeof createValidationWarning>[] = [];
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

    // Validate synthesis strategy
    if (inputAny.synthesisStrategy && !VALID_STRATEGIES.includes(inputAny.synthesisStrategy)) {
      warnings.push(
        createValidationWarning(
          'synthesisStrategy',
          `Unknown strategy: ${inputAny.synthesisStrategy}`,
          `Valid strategies: ${VALID_STRATEGIES.join(', ')}`
        )
      );
    }

    // Validate active modes
    if (inputAny.activeModes) {
      if (inputAny.activeModes.length < 2) {
        warnings.push(
          createValidationWarning(
            'activeModes',
            'Hybrid mode typically uses 2+ modes',
            'Add more modes for multi-modal synthesis'
          )
        );
      }
      if (inputAny.activeModes.length > 5) {
        warnings.push(
          createValidationWarning(
            'activeModes',
            `Many active modes (${inputAny.activeModes.length})`,
            'Consider focusing on 3-4 most relevant modes'
          )
        );
      }
    }

    // Validate mode contributions
    if (inputAny.modeContributions) {
      for (let i = 0; i < inputAny.modeContributions.length; i++) {
        const c = inputAny.modeContributions[i];
        if (c.confidence !== undefined && (c.confidence < 0 || c.confidence > 1)) {
          warnings.push(
            createValidationWarning(
              `modeContributions[${i}].confidence`,
              `Confidence ${c.confidence} out of range`,
              'Confidence should be between 0 and 1'
            )
          );
        }
      }
    }

    // Check for convergence
    if (inputAny.convergenceStatus) {
      if (inputAny.convergenceStatus.currentConfidence < TARGET_CONFIDENCE &&
          inputAny.convergenceStatus.modesAgreeing < 2) {
        warnings.push(
          createValidationWarning(
            'convergenceStatus',
            'Low convergence - modes are not agreeing',
            'Review insights from each mode for consistency'
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
   * Get hybrid-specific enhancements
   */
  getEnhancements(thought: HybridThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: thought.activeModes.filter((m) => m !== ThinkingMode.HYBRID),
      guidingQuestions: [],
      warnings: [],
      metrics: {
        activeModeCount: thought.activeModes.length,
        overallConfidence: thought.overallConfidence,
        targetConfidence: TARGET_CONFIDENCE,
        convergenceScore: thought.convergenceStatus.convergenceScore,
        modesAgreeing: thought.convergenceStatus.modesAgreeing,
      },
      mentalModels: [
        'Convergent Validation',
        'Multi-Modal Synthesis',
        'Triangulation',
        'Complementary Reasoning',
        'Confidence Aggregation',
      ],
    };

    // Active modes info
    enhancements.suggestions!.push(
      `Active modes: ${thought.activeModes.join(', ')}`
    );
    enhancements.suggestions!.push(
      `Strategy: ${thought.synthesisStrategy}`
    );

    // Confidence progress
    const confidencePercent = (thought.overallConfidence * 100).toFixed(1);
    const targetPercent = (TARGET_CONFIDENCE * 100).toFixed(0);
    enhancements.suggestions!.push(
      `Confidence: ${confidencePercent}% / ${targetPercent}% target`
    );

    // Convergence status
    if (thought.convergenceStatus.achieved) {
      enhancements.suggestions!.push(
        `Convergence achieved (${thought.convergenceStatus.modesAgreeing}/${thought.convergenceStatus.totalModes} modes agree)`
      );
    } else {
      enhancements.warnings!.push(
        `Convergence not yet achieved (${thought.convergenceStatus.modesAgreeing}/${thought.convergenceStatus.totalModes} modes agree)`
      );
    }

    // Mode contribution insights
    for (const contrib of thought.modeContributions) {
      if (contrib.confidence > 0.7) {
        enhancements.suggestions!.push(
          `${contrib.mode}: high confidence (${(contrib.confidence * 100).toFixed(0)}%)`
        );
      } else if (contrib.confidence < 0.4) {
        enhancements.warnings!.push(
          `${contrib.mode}: low confidence (${(contrib.confidence * 100).toFixed(0)}%)`
        );
      }
    }

    // Thought type-specific guidance
    switch (thought.thoughtType) {
      case 'mode_selection':
        enhancements.guidingQuestions!.push(
          'Which modes are most relevant for this problem?',
          'Are there complementary reasoning approaches to combine?',
          'What are the problem characteristics?'
        );
        if (thought.selectedRecommendations) {
          for (const rec of thought.selectedRecommendations.slice(0, 3)) {
            enhancements.suggestions!.push(
              `Recommended: ${rec.mode} (score: ${(rec.score * 100).toFixed(0)}%)`
            );
          }
        }
        break;

      case 'parallel_analysis':
        enhancements.guidingQuestions!.push(
          'What does each mode contribute?',
          'Are there conflicting conclusions?',
          'Which mode has the strongest evidence?'
        );
        break;

      case 'sequential_analysis':
        enhancements.guidingQuestions!.push(
          'What order should modes be applied?',
          'How does each mode build on previous insights?',
          'Are there dependencies between modes?'
        );
        break;

      case 'convergence_check':
        enhancements.guidingQuestions!.push(
          'Do multiple modes reach the same conclusion?',
          'Where do the modes disagree?',
          'What would increase confidence?'
        );
        break;

      case 'synthesis':
        enhancements.guidingQuestions!.push(
          'How can insights be combined?',
          'What is the synthesized conclusion?',
          'Does the synthesis preserve key insights from each mode?'
        );
        break;

      case 'confidence_assessment':
        enhancements.guidingQuestions!.push(
          'What is the overall confidence level?',
          'Which mode contributes most to confidence?',
          'Are there gaps that reduce confidence?'
        );
        break;

      case 'mode_switching':
        enhancements.guidingQuestions!.push(
          'Should we add or remove a mode?',
          'Is the current combination optimal?',
          'What would improve the analysis?'
        );
        break;
    }

    // Strategy-specific guidance
    if (thought.synthesisStrategy === 'parallel') {
      enhancements.mentalModels!.push('Independence', 'Ensemble Methods');
    } else if (thought.synthesisStrategy === 'sequential') {
      enhancements.mentalModels!.push('Bayesian Updating', 'Evidence Chain');
    } else if (thought.synthesisStrategy === 'weighted') {
      enhancements.mentalModels!.push('Expert Aggregation', 'Delphi Method');
    }

    // Recommendations for improving confidence
    if (thought.overallConfidence < TARGET_CONFIDENCE) {
      const gap = TARGET_CONFIDENCE - thought.overallConfidence;
      if (gap > 0.2) {
        enhancements.suggestions!.push('Consider adding another complementary mode');
      } else if (gap > 0.1) {
        enhancements.suggestions!.push('Focus on resolving mode disagreements');
      } else {
        enhancements.suggestions!.push('Strengthen evidence in highest-contributing mode');
      }
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as HybridThoughtType);
  }

  /**
   * Normalize problem characteristics
   */
  private normalizeProblemCharacteristics(chars: any): ProblemCharacteristics {
    return {
      domain: chars.domain || 'general',
      complexity: chars.complexity || 'medium',
      uncertainty: chars.uncertainty || 'medium',
      timeDependent: chars.timeDependent ?? false,
      multiAgent: chars.multiAgent ?? false,
      requiresProof: chars.requiresProof ?? false,
      requiresQuantification: chars.requiresQuantification ?? false,
      hasIncompleteInfo: chars.hasIncompleteInfo ?? false,
      requiresExplanation: chars.requiresExplanation ?? true,
      hasAlternatives: chars.hasAlternatives ?? true,
    };
  }

  /**
   * Infer problem characteristics from input
   */
  private inferCharacteristics(input: ThinkingToolInput): ProblemCharacteristics {
    const content = input.thought.toLowerCase();

    return {
      domain: 'general',
      complexity: input.totalThoughts > 5 ? 'high' : 'medium',
      uncertainty: 'medium',
      timeDependent: content.includes('time') || content.includes('sequence'),
      multiAgent: content.includes('agent') || content.includes('player'),
      requiresProof: content.includes('proof') || content.includes('prove'),
      requiresQuantification: content.includes('number') || content.includes('calculate'),
      hasIncompleteInfo: content.includes('unknown') || content.includes('unclear'),
      requiresExplanation: true,
      hasAlternatives: true,
    };
  }

  /**
   * Resolve mode from string
   */
  private resolveMode(mode: string): ThinkingMode {
    const modeMap: Record<string, ThinkingMode> = {
      sequential: ThinkingMode.SEQUENTIAL,
      shannon: ThinkingMode.SHANNON,
      mathematics: ThinkingMode.MATHEMATICS,
      physics: ThinkingMode.PHYSICS,
      hybrid: ThinkingMode.HYBRID,
      inductive: ThinkingMode.INDUCTIVE,
      deductive: ThinkingMode.DEDUCTIVE,
      abductive: ThinkingMode.ABDUCTIVE,
      causal: ThinkingMode.CAUSAL,
      bayesian: ThinkingMode.BAYESIAN,
      counterfactual: ThinkingMode.COUNTERFACTUAL,
      temporal: ThinkingMode.TEMPORAL,
      gametheory: ThinkingMode.GAMETHEORY,
      evidential: ThinkingMode.EVIDENTIAL,
      analogical: ThinkingMode.ANALOGICAL,
      firstprinciples: ThinkingMode.FIRSTPRINCIPLES,
      systemsthinking: ThinkingMode.SYSTEMSTHINKING,
      scientificmethod: ThinkingMode.SCIENTIFICMETHOD,
      formallogic: ThinkingMode.FORMALLOGIC,
      metareasoning: ThinkingMode.METAREASONING,
      optimization: ThinkingMode.OPTIMIZATION,
      engineering: ThinkingMode.ENGINEERING,
      algorithmic: ThinkingMode.ALGORITHMIC,
      computability: ThinkingMode.COMPUTABILITY,
      cryptanalytic: ThinkingMode.CRYPTANALYTIC,
      synthesis: ThinkingMode.SYNTHESIS,
      argumentation: ThinkingMode.ARGUMENTATION,
      critique: ThinkingMode.CRITIQUE,
      analysis: ThinkingMode.ANALYSIS,
    };

    return modeMap[mode.toLowerCase()] || ThinkingMode.SEQUENTIAL;
  }

  /**
   * Normalize mode contribution
   */
  private normalizeContribution(contrib: any): ModeContribution {
    return {
      mode: this.resolveMode(contrib.mode || 'sequential'),
      confidence: Math.max(0, Math.min(1, contrib.confidence ?? 0.5)),
      insights: contrib.insights || [],
      evidence: contrib.evidence || [],
      agreementWithOthers: Math.max(0, Math.min(1, contrib.agreementWithOthers ?? 0.5)),
    };
  }

  /**
   * Initialize contributions for active modes
   */
  private initializeContributions(activeModes: ThinkingMode[]): ModeContribution[] {
    return activeModes.map((mode) => ({
      mode,
      confidence: 0.5,
      insights: [],
      evidence: [],
      agreementWithOthers: 0.5,
    }));
  }

  /**
   * Calculate convergence status
   */
  private calculateConvergence(
    contributions: ModeContribution[],
    explicit?: Partial<ConvergenceStatus>
  ): ConvergenceStatus {
    // Calculate agreement between modes
    const agreementScores = contributions.map((c) => c.agreementWithOthers);
    const avgAgreement = agreementScores.length > 0
      ? agreementScores.reduce((a, b) => a + b, 0) / agreementScores.length
      : 0;

    // Count modes with high agreement
    const modesAgreeing = contributions.filter((c) => c.agreementWithOthers > 0.7).length;

    // Calculate current confidence from convergence
    const confidenceFromAgreement = Math.min(
      avgAgreement * 0.5 + (modesAgreeing / contributions.length) * 0.5,
      1
    );

    // Combine with individual mode confidences
    const avgConfidence = contributions.length > 0
      ? contributions.reduce((a, b) => a + b.confidence, 0) / contributions.length
      : 0;

    const currentConfidence = explicit?.currentConfidence ??
      Math.min(confidenceFromAgreement * 0.6 + avgConfidence * 0.4, 1);

    return {
      achieved: currentConfidence >= TARGET_CONFIDENCE,
      targetConfidence: TARGET_CONFIDENCE,
      currentConfidence,
      modesAgreeing: explicit?.modesAgreeing ?? modesAgreeing,
      totalModes: contributions.length,
      convergenceScore: explicit?.convergenceScore ?? avgAgreement,
    };
  }

  /**
   * Calculate overall confidence from contributions and convergence
   */
  private calculateOverallConfidence(
    contributions: ModeContribution[],
    convergence: ConvergenceStatus,
    explicit?: number
  ): number {
    if (explicit !== undefined) {
      return Math.max(0, Math.min(1, explicit));
    }

    // Base confidence from individual modes (weighted by agreement)
    let weightedSum = 0;
    let weightTotal = 0;

    for (const contrib of contributions) {
      const weight = 0.5 + contrib.agreementWithOthers * 0.5;
      weightedSum += contrib.confidence * weight;
      weightTotal += weight;
    }

    const baseConfidence = weightTotal > 0 ? weightedSum / weightTotal : 0.5;

    // Boost for convergence
    const convergenceBoost = convergence.convergenceScore * 0.2;

    // Multi-mode bonus (diminishing returns)
    const modeBonus = Math.min(0.1, (contributions.length - 1) * 0.03);

    return Math.min(1, baseConfidence + convergenceBoost + modeBonus);
  }

  /**
   * Resolve primary mode from contributions
   */
  private resolvePrimaryMode(
    contributions: ModeContribution[],
    activeModes: ThinkingMode[]
  ): ThinkingMode {
    if (contributions.length === 0) {
      return activeModes[0] || ThinkingMode.SEQUENTIAL;
    }

    // Find mode with highest weighted score
    let bestMode = contributions[0].mode;
    let bestScore = 0;

    for (const contrib of contributions) {
      const score = contrib.confidence * (0.5 + contrib.agreementWithOthers * 0.5);
      if (score > bestScore) {
        bestScore = score;
        bestMode = contrib.mode;
      }
    }

    return bestMode;
  }

  /**
   * Map to base hybrid primary mode type
   */
  private mapToPrimaryMode(
    mode: ThinkingMode
  ): 'sequential' | 'shannon' | 'mathematics' | 'physics' {
    switch (mode) {
      case ThinkingMode.SHANNON:
        return 'shannon';
      case ThinkingMode.MATHEMATICS:
        return 'mathematics';
      case ThinkingMode.PHYSICS:
        return 'physics';
      default:
        return 'sequential';
    }
  }

  /**
   * Resolve synthesis strategy
   */
  private resolveSynthesisStrategy(
    strategy: string | undefined
  ): 'parallel' | 'sequential' | 'weighted' {
    if (strategy && VALID_STRATEGIES.includes(strategy as any)) {
      return strategy as 'parallel' | 'sequential' | 'weighted';
    }
    return 'parallel';
  }
}
