/**
 * Mode Router Service (v6.0.0)
 * Sprint 3 Task 3.3: Extract mode management logic from index.ts
 * Sprint 3 Task 3.2: Added dependency injection support
 * Phase 6 Sprint 2: Integrated with MetaMonitor for adaptive mode switching
 *
 * Handles thinking mode operations including mode switching and recommendations.
 * Provides intelligent mode selection based on problem characteristics.
 * Uses meta-reasoning insights to suggest optimal mode transitions.
 *
 * RESPONSIBILITY:
 * - Switch sessions between thinking modes with meta-reasoning evaluation
 * - Recommend optimal modes for problem types
 * - Provide adaptive mode switching suggestions based on session performance
 * - Format mode recommendation responses
 *
 * EXTRACTED FROM: src/index.ts (handleSwitchMode, handleRecommendMode)
 */

import { ThinkingMode, ModeRecommender, ProblemCharacteristics } from '../types/index.js';
import { SessionManager } from '../session/index.js';
import { ILogger } from '../interfaces/ILogger.js';
import { createLogger, LogLevel } from '../utils/logger.js';
import { metaMonitor, MetaMonitor } from './MetaMonitor.js';

/**
 * Mode recommendation result for formatting
 */
export interface ModeRecommendation {
  mode: string;
  score: number;
  reasoning: string;
  strengths: string[];
  limitations: string[];
  examples: string[];
}

/**
 * Mode combination recommendation
 */
export interface ModeCombinationRecommendation {
  modes: string[];
  sequence: string;
  rationale: string;
  benefits: string[];
  synergies: string[];
}

/**
 * Mode Router - Manages thinking mode operations
 *
 * Centralizes mode-related functionality including switching between
 * modes within a session and providing intelligent recommendations
 * based on problem characteristics.
 *
 * @example
 * ```typescript
 * const router = new ModeRouter(sessionManager);
 *
 * // Switch mode
 * await router.switchMode('session-123', ThinkingMode.MATHEMATICS, 'Better for this problem');
 *
 * // Get recommendations
 * const recommendations = router.recommendModes({ requiresProof: true, hasQuantities: true });
 * ```
 */
export class ModeRouter {
  private sessionManager: SessionManager;
  private recommender: ModeRecommender;
  private logger: ILogger;
  private monitor: MetaMonitor;

  /**
   * Create a new ModeRouter
   *
   * @param sessionManager - Session manager instance for mode switching
   * @param logger - Optional logger for dependency injection
   * @param monitor - Optional MetaMonitor instance for dependency injection
   *
   * @example
   * ```typescript
   * const router = new ModeRouter(sessionManager);
   * // Or with DI:
   * const router = new ModeRouter(sessionManager, customLogger, customMonitor);
   * ```
   */
  constructor(sessionManager: SessionManager, logger?: ILogger, monitor?: MetaMonitor) {
    this.sessionManager = sessionManager;
    this.recommender = new ModeRecommender();
    this.logger = logger || createLogger({ minLevel: LogLevel.INFO, enableConsole: true });
    this.monitor = monitor || metaMonitor;
  }

  /**
   * Switch a session to a new thinking mode
   *
   * Changes the thinking mode of an active session while preserving
   * existing thoughts. Useful when the problem characteristics change
   * or initial mode selection was suboptimal.
   *
   * @param sessionId - ID of the session to switch
   * @param newMode - The new thinking mode to use
   * @param reason - Reason for the mode switch (for logging)
   * @returns The updated session
   * @throws {Error} If session not found
   *
   * @example
   * ```typescript
   * const session = await router.switchMode(
   *   'session-123',
   *   ThinkingMode.MATHEMATICS,
   *   'Problem requires mathematical proof'
   * );
   * ```
   */
  async switchMode(
    sessionId: string,
    newMode: ThinkingMode,
    reason: string
  ) {
    this.logger.info('Switching mode', {
      sessionId,
      newMode,
      reason,
    });
    const session = await this.sessionManager.switchMode(sessionId, newMode, reason);
    this.logger.debug('Mode switch completed', {
      sessionId,
      newMode,
      thoughtCount: session.thoughts.length,
    });
    return session;
  }

  /**
   * Get quick mode recommendation based on problem type
   *
   * Provides a fast, single-mode recommendation based on a simple
   * problem type string. Useful for quick suggestions without detailed
   * problem analysis.
   *
   * @param problemType - Simple problem type description
   * @returns Recommended thinking mode
   *
   * @example
   * ```typescript
   * const mode = router.quickRecommend('mathematical proof');
   * // Returns: ThinkingMode.MATHEMATICS
   * ```
   */
  quickRecommend(problemType: string): ThinkingMode {
    this.logger.debug('Quick recommend requested', { problemType });
    const mode = this.recommender.quickRecommend(problemType);
    this.logger.debug('Quick recommend result', { problemType, recommendedMode: mode });
    return mode;
  }

  /**
   * Get comprehensive mode recommendations
   *
   * Analyzes problem characteristics and returns ranked recommendations
   * for individual modes and optionally mode combinations.
   *
   * @param characteristics - Detailed problem characteristics
   * @param includeCombinations - Whether to include mode combinations
   * @returns Formatted recommendation response
   *
   * @example
   * ```typescript
   * const response = router.getRecommendations({
   *   requiresProof: true,
   *   hasQuantities: true,
   *   hasUncertainty: false
   * }, true);
   * ```
   */
  getRecommendations(
    characteristics: ProblemCharacteristics,
    includeCombinations: boolean = false
  ): string {
    this.logger.debug('Getting mode recommendations', {
      characteristics,
      includeCombinations,
    });

    const modeRecs = this.recommender.recommendModes(characteristics);
    const combinationRecs = includeCombinations
      ? this.recommender.recommendCombinations(characteristics)
      : [];

    this.logger.debug('Recommendations generated', {
      modeCount: modeRecs.length,
      combinationCount: combinationRecs.length,
      topMode: modeRecs[0]?.mode,
      topScore: modeRecs[0]?.score,
    });

    let response = '# Mode Recommendations\n\n';

    // Single mode recommendations
    response += '## Individual Modes\n\n';
    for (const rec of modeRecs) {
      response += `### ${rec.mode} (Score: ${rec.score})\n`;
      response += `**Reasoning**: ${rec.reasoning}\n\n`;
      response += `**Strengths**:\n`;
      for (const strength of rec.strengths) {
        response += `- ${strength}\n`;
      }
      response += `\n**Limitations**:\n`;
      for (const limitation of rec.limitations) {
        response += `- ${limitation}\n`;
      }
      response += `\n**Examples**: ${rec.examples.join(', ')}\n\n`;
      response += '---\n\n';
    }

    // Mode combinations
    if (combinationRecs.length > 0) {
      response += '## Recommended Mode Combinations\n\n';
      for (const combo of combinationRecs) {
        response += `### ${combo.modes.join(' + ')} (${combo.sequence})\n`;
        response += `**Rationale**: ${combo.rationale}\n\n`;
        response += `**Benefits**:\n`;
        for (const benefit of combo.benefits) {
          response += `- ${benefit}\n`;
        }
        response += `\n**Synergies**:\n`;
        for (const synergy of combo.synergies) {
          response += `- ${synergy}\n`;
        }
        response += '\n---\n\n';
      }
    }

    return response;
  }

  /**
   * Format a quick recommendation response
   *
   * Creates a formatted response for quick recommendations.
   *
   * @param problemType - The problem type that was analyzed
   * @param recommendedMode - The recommended mode
   * @returns Formatted response string
   */
  formatQuickRecommendation(problemType: string, recommendedMode: ThinkingMode): string {
    return `Quick recommendation for "${problemType}":\n\n**Recommended Mode**: ${recommendedMode}\n\nFor more detailed recommendations, provide problemCharacteristics.`;
  }

  /**
   * Evaluate current session and suggest mode switch if beneficial
   *
   * Uses meta-reasoning to evaluate the current strategy effectiveness
   * and suggest alternative modes if the current approach is suboptimal.
   *
   * @param sessionId - Session to evaluate
   * @param problemType - Optional problem type for context
   * @returns Evaluation result with switch recommendation
   *
   * @example
   * ```typescript
   * const evaluation = await router.evaluateAndSuggestSwitch('session-123', 'debugging');
   * if (evaluation.shouldSwitch) {
   *   await router.switchMode(sessionId, evaluation.suggestedMode!, evaluation.reasoning);
   * }
   * ```
   */
  async evaluateAndSuggestSwitch(sessionId: string, problemType: string = 'general'): Promise<{
    currentEvaluation: ReturnType<MetaMonitor['evaluateStrategy']>;
    shouldSwitch: boolean;
    suggestedMode?: ThinkingMode;
    reasoning: string;
    alternatives: ReturnType<MetaMonitor['suggestAlternatives']>;
  }> {
    this.logger.debug('Evaluating session for potential mode switch', { sessionId, problemType });

    // Get current strategy evaluation
    const evaluation = this.monitor.evaluateStrategy(sessionId);

    // Get alternative strategies
    const session = await this.sessionManager.getSession(sessionId);
    const currentMode = session?.mode || ThinkingMode.SEQUENTIAL;
    const alternatives = this.monitor.suggestAlternatives(sessionId, currentMode);

    // Determine if switch is beneficial
    // Switch if effectiveness < 0.4 OR (effectiveness < 0.6 AND alternatives score > 0.75)
    const shouldSwitch =
      evaluation.effectiveness < 0.4 ||
      (evaluation.effectiveness < 0.6 && alternatives.length > 0 && alternatives[0].recommendationScore > 0.75);

    const suggestedMode = shouldSwitch && alternatives.length > 0
      ? alternatives[0].mode
      : undefined;

    const reasoning = shouldSwitch
      ? `Current strategy effectiveness: ${(evaluation.effectiveness * 100).toFixed(1)}%. ${alternatives[0]?.reasoning || 'Consider switching modes.'}`
      : `Current strategy performing adequately (effectiveness: ${(evaluation.effectiveness * 100).toFixed(1)}%). Continue with current mode.`;

    this.logger.debug('Mode switch evaluation completed', {
      sessionId,
      shouldSwitch,
      suggestedMode,
      currentEffectiveness: evaluation.effectiveness,
    });

    return {
      currentEvaluation: evaluation,
      shouldSwitch,
      suggestedMode,
      reasoning,
      alternatives,
    };
  }

  /**
   * Auto-switch mode if current strategy is failing
   *
   * Automatically evaluates and switches modes if the current approach
   * is demonstrably ineffective (effectiveness < 0.3).
   *
   * @param sessionId - Session to evaluate
   * @param problemType - Optional problem type for context
   * @returns Switch result with details
   *
   * @example
   * ```typescript
   * const result = await router.autoSwitchIfNeeded('session-123', 'complex-problem');
   * console.log(result.switched ? 'Switched to' + result.newMode : 'No switch needed');
   * ```
   */
  async autoSwitchIfNeeded(sessionId: string, problemType: string = 'general'): Promise<{
    switched: boolean;
    oldMode?: ThinkingMode;
    newMode?: ThinkingMode;
    reasoning: string;
    evaluation: ReturnType<MetaMonitor['evaluateStrategy']>;
  }> {
    this.logger.debug('Auto-switch evaluation', { sessionId, problemType });

    const evaluation = await this.evaluateAndSuggestSwitch(sessionId, problemType);

    // Only auto-switch if effectiveness is very low (< 0.3) to avoid thrashing
    const autoSwitchThreshold = 0.3;
    if (evaluation.currentEvaluation.effectiveness < autoSwitchThreshold && evaluation.suggestedMode) {
      const session = await this.sessionManager.getSession(sessionId);
      const oldMode = session?.mode || ThinkingMode.SEQUENTIAL;

      await this.switchMode(sessionId, evaluation.suggestedMode, evaluation.reasoning);

      this.logger.info('Auto-switched mode due to low effectiveness', {
        sessionId,
        oldMode,
        newMode: evaluation.suggestedMode,
        effectiveness: evaluation.currentEvaluation.effectiveness,
      });

      return {
        switched: true,
        oldMode,
        newMode: evaluation.suggestedMode,
        reasoning: evaluation.reasoning,
        evaluation: evaluation.currentEvaluation,
      };
    }

    this.logger.debug('Auto-switch not needed', {
      sessionId,
      effectiveness: evaluation.currentEvaluation.effectiveness,
      threshold: autoSwitchThreshold,
    });

    return {
      switched: false,
      reasoning: evaluation.reasoning,
      evaluation: evaluation.currentEvaluation,
    };
  }
}
