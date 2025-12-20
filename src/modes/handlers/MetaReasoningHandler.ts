/**
 * MetaReasoningHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Meta-Reasoning mode with:
 * - Strategy evaluation and monitoring
 * - Mode switching recommendations
 * - Resource allocation assessment
 * - Quality metrics tracking
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import type {
  MetaReasoningThought,
  CurrentStrategy,
  StrategyEvaluation,
  AlternativeStrategy,
  StrategyRecommendation,
  ResourceAllocation,
  QualityMetrics,
  SessionContext,
  MetaAction,
} from '../../types/modes/metareasoning.js';
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
 * Valid meta actions
 */
const VALID_META_ACTIONS: MetaAction[] = ['CONTINUE', 'SWITCH', 'REFINE', 'COMBINE'];

/**
 * MetaReasoningHandler - Specialized handler for meta-reasoning
 *
 * Provides:
 * - Reasoning about reasoning strategy
 * - Mode effectiveness evaluation
 * - Alternative strategy suggestion
 * - Resource allocation guidance
 */
export class MetaReasoningHandler implements ModeHandler {
  readonly mode = ThinkingMode.METAREASONING;
  readonly modeName = 'Meta-Reasoning';
  readonly description = 'Reasoning about reasoning itself - strategy monitoring and optimization';

  /**
   * Supported thought types for meta-reasoning mode
   */
  private readonly supportedThoughtTypes = [
    'strategy_evaluation',
    'mode_switch',
    'resource_allocation',
    'quality_assessment',
    'progress_monitoring',
    'strategy_recommendation',
  ];

  /**
   * Create a meta-reasoning thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): MetaReasoningThought {
    const inputAny = input as any;

    // Process current strategy
    const currentStrategy = this.normalizeCurrentStrategy(inputAny.currentStrategy, sessionId);

    // Process strategy evaluation
    const strategyEvaluation = this.normalizeStrategyEvaluation(inputAny.strategyEvaluation);

    // Process alternative strategies
    const alternativeStrategies = (inputAny.alternativeStrategies || []).map(
      (s: any) => this.normalizeAlternativeStrategy(s)
    );

    // Generate recommendation if not provided
    const recommendation = inputAny.recommendation
      ? this.normalizeRecommendation(inputAny.recommendation)
      : this.generateRecommendation(strategyEvaluation, alternativeStrategies);

    // Process resource allocation
    const resourceAllocation = this.normalizeResourceAllocation(inputAny.resourceAllocation, input);

    // Process quality metrics
    const qualityMetrics = this.normalizeQualityMetrics(inputAny.qualityMetrics);

    // Process session context
    const sessionContext = this.normalizeSessionContext(inputAny.sessionContext, sessionId);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.METAREASONING,

      // Core meta-reasoning fields
      currentStrategy,
      strategyEvaluation,
      alternativeStrategies,
      recommendation,
      resourceAllocation,
      qualityMetrics,
      sessionContext,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate meta-reasoning-specific input
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

    // Validate current strategy
    if (!inputAny.currentStrategy) {
      warnings.push(
        createValidationWarning(
          'currentStrategy',
          'No current strategy specified',
          'Describe the current reasoning strategy being evaluated'
        )
      );
    }

    // Validate strategy evaluation scores
    if (inputAny.strategyEvaluation) {
      const se = inputAny.strategyEvaluation;
      const scoreFields = ['effectiveness', 'efficiency', 'confidence', 'qualityScore'];
      for (const field of scoreFields) {
        if (se[field] !== undefined && (se[field] < 0 || se[field] > 1)) {
          warnings.push(
            createValidationWarning(
              `strategyEvaluation.${field}`,
              `${field} (${se[field]}) should be between 0 and 1`,
              'Normalize scores to [0, 1] range'
            )
          );
        }
      }
    }

    // Validate recommendation action
    if (inputAny.recommendation?.action && !VALID_META_ACTIONS.includes(inputAny.recommendation.action)) {
      warnings.push(
        createValidationWarning(
          'recommendation.action',
          `Unknown action: ${inputAny.recommendation.action}`,
          `Valid actions: ${VALID_META_ACTIONS.join(', ')}`
        )
      );
    }

    // Suggest alternatives for SWITCH recommendation
    if (inputAny.recommendation?.action === 'SWITCH' &&
        (!inputAny.alternativeStrategies || inputAny.alternativeStrategies.length === 0)) {
      warnings.push(
        createValidationWarning(
          'alternativeStrategies',
          'SWITCH recommended but no alternatives provided',
          'Include alternative strategies to switch to'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get meta-reasoning-specific enhancements
   */
  getEnhancements(thought: MetaReasoningThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.HYBRID, ThinkingMode.SEQUENTIAL],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        effectiveness: thought.strategyEvaluation.effectiveness,
        efficiency: thought.strategyEvaluation.efficiency,
        confidence: thought.strategyEvaluation.confidence,
        qualityScore: thought.strategyEvaluation.qualityScore,
        alternativeCount: thought.alternativeStrategies.length,
      },
      mentalModels: [
        'Metacognition',
        'Strategy Selection',
        'Resource Allocation',
        'Progress Monitoring',
        'Cognitive Load Management',
      ],
    };

    // Current strategy analysis
    enhancements.suggestions!.push(
      `Current strategy: ${thought.currentStrategy.mode} (${thought.currentStrategy.approach})`
    );
    enhancements.metrics!.thoughtsSpent = thought.currentStrategy.thoughtsSpent;

    // Strategy evaluation feedback
    if (thought.strategyEvaluation.effectiveness < 0.4) {
      enhancements.warnings!.push(
        'Low effectiveness - consider switching strategies'
      );
    } else if (thought.strategyEvaluation.effectiveness > 0.8) {
      enhancements.suggestions!.push(
        '✓ Current strategy is highly effective'
      );
    }

    if (thought.strategyEvaluation.efficiency < 0.4) {
      enhancements.warnings!.push(
        'Low efficiency - consider more direct approaches'
      );
    }

    if (thought.strategyEvaluation.issues.length > 0) {
      enhancements.warnings!.push(
        `Issues identified: ${thought.strategyEvaluation.issues.slice(0, 2).join(', ')}`
      );
    }

    if (thought.strategyEvaluation.strengths.length > 0) {
      enhancements.suggestions!.push(
        `Strengths: ${thought.strategyEvaluation.strengths.slice(0, 2).join(', ')}`
      );
    }

    // Recommendation analysis
    enhancements.suggestions!.push(
      `Recommendation: ${thought.recommendation.action} (confidence: ${(thought.recommendation.confidence * 100).toFixed(0)}%)`
    );

    if (thought.recommendation.action === 'SWITCH' && thought.recommendation.targetMode) {
      enhancements.suggestions!.push(
        `Switch to: ${thought.recommendation.targetMode}`
      );
    }

    // Alternative strategies
    if (thought.alternativeStrategies.length > 0) {
      const bestAlt = thought.alternativeStrategies.reduce(
        (a, b) => (a.recommendationScore > b.recommendationScore ? a : b)
      );
      enhancements.suggestions!.push(
        `Best alternative: ${bestAlt.mode} (score: ${(bestAlt.recommendationScore * 100).toFixed(0)}%)`
      );
    }

    // Resource allocation
    enhancements.metrics!.complexityLevel = thought.resourceAllocation.complexityLevel;
    enhancements.metrics!.urgency = thought.resourceAllocation.urgency;
    enhancements.metrics!.thoughtsRemaining = thought.resourceAllocation.thoughtsRemaining;

    if (thought.resourceAllocation.thoughtsRemaining < 3) {
      enhancements.warnings!.push(
        'Few thoughts remaining - focus on conclusions'
      );
    }

    // Quality metrics
    enhancements.metrics!.overallQuality = thought.qualityMetrics.overallQuality;

    if (thought.qualityMetrics.logicalConsistency < 0.6) {
      enhancements.warnings!.push(
        'Low logical consistency - review reasoning chain'
      );
    }

    if (thought.qualityMetrics.completeness < 0.5) {
      enhancements.warnings!.push(
        'Low completeness - ensure all aspects are addressed'
      );
    }

    // Guiding questions
    enhancements.guidingQuestions = [
      'Is the current strategy making progress toward the goal?',
      'Would a different reasoning mode be more effective here?',
      'Are we allocating cognitive effort optimally?',
      'What are the key insights so far?',
      'What remains to be addressed?',
    ];

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }

  /**
   * Normalize current strategy
   */
  private normalizeCurrentStrategy(strategy: any, _sessionId: string): CurrentStrategy {
    return {
      mode: strategy?.mode || ThinkingMode.SEQUENTIAL,
      approach: strategy?.approach || 'default',
      startedAt: strategy?.startedAt ? new Date(strategy.startedAt) : new Date(),
      thoughtsSpent: strategy?.thoughtsSpent || 0,
      progressIndicators: strategy?.progressIndicators || [],
    };
  }

  /**
   * Normalize strategy evaluation
   */
  private normalizeStrategyEvaluation(evaluation: any): StrategyEvaluation {
    return {
      effectiveness: this.clamp(evaluation?.effectiveness ?? 0.5),
      efficiency: this.clamp(evaluation?.efficiency ?? 0.5),
      confidence: this.clamp(evaluation?.confidence ?? 0.5),
      progressRate: evaluation?.progressRate ?? 0,
      qualityScore: this.clamp(evaluation?.qualityScore ?? 0.5),
      issues: evaluation?.issues || [],
      strengths: evaluation?.strengths || [],
    };
  }

  /**
   * Normalize alternative strategy
   */
  private normalizeAlternativeStrategy(alt: any): AlternativeStrategy {
    return {
      mode: alt.mode || ThinkingMode.SEQUENTIAL,
      reasoning: alt.reasoning || '',
      expectedBenefit: alt.expectedBenefit || '',
      switchingCost: this.clamp(alt.switchingCost ?? 0.3),
      recommendationScore: this.clamp(alt.recommendationScore ?? 0.5),
    };
  }

  /**
   * Normalize recommendation
   */
  private normalizeRecommendation(rec: any): StrategyRecommendation {
    return {
      action: VALID_META_ACTIONS.includes(rec.action) ? rec.action : 'CONTINUE',
      targetMode: rec.targetMode,
      justification: rec.justification || '',
      confidence: this.clamp(rec.confidence ?? 0.5),
      expectedImprovement: rec.expectedImprovement || '',
    };
  }

  /**
   * Generate recommendation from evaluation
   */
  private generateRecommendation(
    evaluation: StrategyEvaluation,
    alternatives: AlternativeStrategy[]
  ): StrategyRecommendation {
    // If current strategy is effective, continue
    if (evaluation.effectiveness > 0.7 && evaluation.efficiency > 0.5) {
      return {
        action: 'CONTINUE',
        justification: 'Current strategy is effective and efficient',
        confidence: evaluation.effectiveness,
        expectedImprovement: 'Maintain current progress',
      };
    }

    // If there's a better alternative, suggest switch
    const bestAlt = alternatives.reduce(
      (a, b) => ((a?.recommendationScore || 0) > (b?.recommendationScore || 0) ? a : b),
      null as AlternativeStrategy | null
    );

    if (bestAlt && bestAlt.recommendationScore > evaluation.effectiveness + 0.2) {
      return {
        action: 'SWITCH',
        targetMode: bestAlt.mode,
        justification: `${bestAlt.mode} offers higher expected benefit`,
        confidence: bestAlt.recommendationScore,
        expectedImprovement: bestAlt.expectedBenefit,
      };
    }

    // If effectiveness is low but no clear alternative, suggest refine
    if (evaluation.effectiveness < 0.5) {
      return {
        action: 'REFINE',
        justification: 'Current strategy needs adjustment',
        confidence: 0.6,
        expectedImprovement: 'Address identified issues',
      };
    }

    return {
      action: 'CONTINUE',
      justification: 'No clear reason to change strategy',
      confidence: 0.5,
      expectedImprovement: 'Gradual progress expected',
    };
  }

  /**
   * Normalize resource allocation
   */
  private normalizeResourceAllocation(alloc: any, input: ThinkingToolInput): ResourceAllocation {
    return {
      timeSpent: alloc?.timeSpent ?? 0,
      thoughtsRemaining: alloc?.thoughtsRemaining ?? (input.totalThoughts - input.thoughtNumber),
      complexityLevel: alloc?.complexityLevel || 'medium',
      urgency: alloc?.urgency || 'medium',
      recommendation: alloc?.recommendation || 'Maintain balanced effort allocation',
    };
  }

  /**
   * Normalize quality metrics
   */
  private normalizeQualityMetrics(metrics: any): QualityMetrics {
    return {
      logicalConsistency: this.clamp(metrics?.logicalConsistency ?? 0.7),
      evidenceQuality: this.clamp(metrics?.evidenceQuality ?? 0.6),
      completeness: this.clamp(metrics?.completeness ?? 0.5),
      originality: this.clamp(metrics?.originality ?? 0.5),
      clarity: this.clamp(metrics?.clarity ?? 0.7),
      overallQuality: this.clamp(metrics?.overallQuality ??
        ((metrics?.logicalConsistency || 0.7) +
         (metrics?.evidenceQuality || 0.6) +
         (metrics?.completeness || 0.5) +
         (metrics?.clarity || 0.7)) / 4),
    };
  }

  /**
   * Normalize session context
   */
  private normalizeSessionContext(context: any, sessionId: string): SessionContext {
    return {
      sessionId: context?.sessionId || sessionId,
      totalThoughts: context?.totalThoughts || 0,
      modesUsed: context?.modesUsed || [],
      modeSwitches: context?.modeSwitches || 0,
      problemType: context?.problemType || 'unknown',
      historicalEffectiveness: context?.historicalEffectiveness,
    };
  }

  /**
   * Clamp value to [0, 1] range
   */
  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
