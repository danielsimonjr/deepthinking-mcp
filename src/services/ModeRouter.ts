/**
 * Mode Router Service (v3.4.5)
 * Sprint 3 Task 3.3: Extract mode management logic from index.ts
 *
 * Handles thinking mode operations including mode switching and recommendations.
 * Provides intelligent mode selection based on problem characteristics.
 *
 * RESPONSIBILITY:
 * - Switch sessions between thinking modes
 * - Recommend optimal modes for problem types
 * - Format mode recommendation responses
 *
 * EXTRACTED FROM: src/index.ts (handleSwitchMode, handleRecommendMode)
 */

import { ThinkingMode, ModeRecommender, ProblemCharacteristics } from '../types/index.js';
import { SessionManager } from '../session/index.js';

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

  /**
   * Create a new ModeRouter
   *
   * @param sessionManager - Session manager instance for mode switching
   *
   * @example
   * ```typescript
   * const router = new ModeRouter(sessionManager);
   * ```
   */
  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
    this.recommender = new ModeRecommender();
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
    return await this.sessionManager.switchMode(sessionId, newMode, reason);
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
    return this.recommender.quickRecommend(problemType);
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
    const modeRecs = this.recommender.recommendModes(characteristics);
    const combinationRecs = includeCombinations
      ? this.recommender.recommendCombinations(characteristics)
      : [];

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
}
