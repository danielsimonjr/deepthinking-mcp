/**
 * Meta-Reasoning Monitor Service (v6.0.0)
 * Phase 6: Session monitoring and strategy evaluation
 *
 * Tracks reasoning sessions, evaluates strategy effectiveness,
 * and provides meta-level insights for adaptive reasoning.
 */

import { Thought, ThinkingMode } from '../types/core.js';
import {
  StrategyEvaluation,
  AlternativeStrategy,
  QualityMetrics,
  SessionContext,
} from '../types/modes/metareasoning.js';

/**
 * Session history entry
 */
interface SessionHistoryEntry {
  thoughtId: string;
  mode: ThinkingMode;
  timestamp: Date;
  content: string;
  uncertainty?: number;
}

/**
 * Strategy performance metrics
 */
interface StrategyPerformance {
  mode: ThinkingMode;
  thoughtsSpent: number;
  startTime: Date;
  endTime?: Date;
  progressIndicators: string[];
  issuesEncountered: string[];
}

/**
 * Meta-Monitoring Service
 * Tracks and evaluates reasoning sessions for meta-reasoning insights
 */
export class MetaMonitor {
  private sessionHistory: Map<string, SessionHistoryEntry[]> = new Map();
  private currentStrategies: Map<string, StrategyPerformance> = new Map();
  private modeTransitions: Map<string, ThinkingMode[]> = new Map();

  /**
   * Record a thought in session history
   */
  recordThought(sessionId: string, thought: Thought): void {
    if (!this.sessionHistory.has(sessionId)) {
      this.sessionHistory.set(sessionId, []);
    }

    const history = this.sessionHistory.get(sessionId)!;
    history.push({
      thoughtId: thought.id,
      mode: thought.mode,
      timestamp: thought.timestamp,
      content: thought.content,
      uncertainty: 'uncertainty' in thought ? (thought as any).uncertainty : undefined,
    });

    // Track mode transitions
    if (!this.modeTransitions.has(sessionId)) {
      this.modeTransitions.set(sessionId, []);
    }
    const transitions = this.modeTransitions.get(sessionId)!;
    if (transitions.length === 0 || transitions[transitions.length - 1] !== thought.mode) {
      transitions.push(thought.mode);
    }
  }

  /**
   * Start tracking a new strategy
   */
  startStrategy(sessionId: string, mode: ThinkingMode): void {
    this.currentStrategies.set(sessionId, {
      mode,
      thoughtsSpent: 0,
      startTime: new Date(),
      progressIndicators: [],
      issuesEncountered: [],
    });
  }

  /**
   * Update current strategy progress
   */
  updateStrategyProgress(sessionId: string, indicator: string): void {
    const strategy = this.currentStrategies.get(sessionId);
    if (strategy) {
      strategy.progressIndicators.push(indicator);
      strategy.thoughtsSpent++;
    }
  }

  /**
   * Record an issue with current strategy
   */
  recordStrategyIssue(sessionId: string, issue: string): void {
    const strategy = this.currentStrategies.get(sessionId);
    if (strategy) {
      strategy.issuesEncountered.push(issue);
    }
  }

  /**
   * Evaluate current strategy effectiveness
   */
  evaluateStrategy(sessionId: string): StrategyEvaluation {
    const strategy = this.currentStrategies.get(sessionId);

    if (!strategy) {
      // No active strategy - return baseline evaluation
      return {
        effectiveness: 0.5,
        efficiency: 0.5,
        confidence: 0.5,
        progressRate: 0,
        qualityScore: 0.5,
        issues: ['No active strategy being tracked'],
        strengths: [],
      };
    }

    // Calculate metrics
    const thoughtsSpent = strategy.thoughtsSpent;
    const progressMade = strategy.progressIndicators.length;
    const issuesCount = strategy.issuesEncountered.length;
    const timeElapsed = new Date().getTime() - strategy.startTime.getTime();

    // Effectiveness: progress relative to effort
    const effectiveness = Math.min(1.0, progressMade / Math.max(1, thoughtsSpent));

    // Efficiency: progress per unit time
    const efficiency = timeElapsed > 0 ? Math.min(1.0, progressMade / (timeElapsed / 60000)) : 0.5;

    // Confidence: based on issues encountered
    const confidence = Math.max(0.1, 1.0 - issuesCount * 0.15);

    // Progress rate: insights per thought
    const progressRate = thoughtsSpent > 0 ? progressMade / thoughtsSpent : 0;

    // Quality score: weighted combination
    const qualityScore = effectiveness * 0.4 + efficiency * 0.2 + confidence * 0.4;

    return {
      effectiveness,
      efficiency,
      confidence,
      progressRate,
      qualityScore,
      issues: [...strategy.issuesEncountered],
      strengths: strategy.progressIndicators.slice(-3), // Recent progress
    };
  }

  /**
   * Suggest alternative strategies based on current performance
   */
  suggestAlternatives(sessionId: string, currentMode: ThinkingMode): AlternativeStrategy[] {
    const evaluation = this.evaluateStrategy(sessionId);
    const alternatives: AlternativeStrategy[] = [];

    // If current strategy is failing, suggest fundamental alternatives
    if (evaluation.effectiveness < 0.4) {
      // Suggest switching to a different core reasoning mode
      if (currentMode !== ThinkingMode.HYBRID) {
        alternatives.push({
          mode: ThinkingMode.HYBRID,
          reasoning: 'Low effectiveness detected - hybrid multi-modal approach may provide better results',
          expectedBenefit: 'Combines multiple reasoning types for comprehensive analysis',
          switchingCost: 0.3,
          recommendationScore: 0.85,
        });
      }

      if (currentMode !== ThinkingMode.INDUCTIVE) {
        alternatives.push({
          mode: ThinkingMode.INDUCTIVE,
          reasoning: 'Consider gathering more empirical observations',
          expectedBenefit: 'Build stronger generalizations from specific cases',
          switchingCost: 0.2,
          recommendationScore: 0.70,
        });
      }
    }

    // If making progress but slowly, suggest refinements
    if (evaluation.effectiveness >= 0.4 && evaluation.efficiency < 0.5) {
      alternatives.push({
        mode: currentMode, // Same mode, but recommend refinement
        reasoning: 'Progress detected but efficiency is low - consider refining current approach',
        expectedBenefit: 'Improved efficiency while maintaining progress',
        switchingCost: 0.1,
        recommendationScore: 0.65,
      });
    }

    return alternatives;
  }

  /**
   * Calculate quality metrics for current session
   */
  calculateQualityMetrics(sessionId: string): QualityMetrics {
    const history = this.sessionHistory.get(sessionId) || [];
    const strategy = this.currentStrategies.get(sessionId);

    if (history.length === 0) {
      // No history - return neutral metrics
      return {
        logicalConsistency: 0.5,
        evidenceQuality: 0.5,
        completeness: 0.5,
        originality: 0.5,
        clarity: 0.5,
        overallQuality: 0.5,
      };
    }

    // Logical consistency: fewer contradictions and issues
    const issuesCount = strategy?.issuesEncountered.length || 0;
    const logicalConsistency = Math.max(0.1, 1.0 - issuesCount * 0.1);

    // Evidence quality: based on uncertainty levels
    const avgUncertainty =
      history.reduce((sum, entry) => sum + (entry.uncertainty || 0.5), 0) / history.length;
    const evidenceQuality = 1.0 - avgUncertainty;

    // Completeness: thoughts addressing multiple aspects
    const completeness = Math.min(1.0, history.length / 5); // Normalize to 5 thoughts

    // Originality: mode diversity
    const uniqueModes = new Set(history.map((h) => h.mode)).size;
    const originality = Math.min(1.0, uniqueModes / 3); // Normalize to 3 unique modes

    // Clarity: based on progress indicators
    const progressCount = strategy?.progressIndicators.length || 0;
    const clarity = Math.min(1.0, progressCount / Math.max(1, history.length));

    // Overall quality: weighted average
    const overallQuality =
      logicalConsistency * 0.25 +
      evidenceQuality * 0.2 +
      completeness * 0.15 +
      originality * 0.15 +
      clarity * 0.25;

    return {
      logicalConsistency,
      evidenceQuality,
      completeness,
      originality,
      clarity,
      overallQuality,
    };
  }

  /**
   * Get session context for meta-reasoning
   */
  getSessionContext(sessionId: string, problemType: string): SessionContext {
    const history = this.sessionHistory.get(sessionId) || [];
    const transitions = this.modeTransitions.get(sessionId) || [];

    return {
      sessionId,
      totalThoughts: history.length,
      modesUsed: transitions,
      modeSwitches: Math.max(0, transitions.length - 1),
      problemType,
      historicalEffectiveness: this.getHistoricalEffectiveness(problemType),
    };
  }

  /**
   * Get historical effectiveness for similar problems (simplified)
   */
  private getHistoricalEffectiveness(_problemType: string): number | undefined {
    // In a full implementation, this would query past sessions
    // For now, return undefined to indicate no historical data
    return undefined;
  }

  /**
   * Clear session data (for cleanup)
   */
  clearSession(sessionId: string): void {
    this.sessionHistory.delete(sessionId);
    this.currentStrategies.delete(sessionId);
    this.modeTransitions.delete(sessionId);
  }

  /**
   * Get all tracked sessions
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessionHistory.keys());
  }
}

/**
 * Global meta-monitor instance
 */
export const metaMonitor = new MetaMonitor();
