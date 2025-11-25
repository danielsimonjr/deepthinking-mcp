/**
 * Session Metrics Calculator (v3.4.5)
 * Sprint 3 Task 3.4: Extract metrics logic from SessionManager
 *
 * Handles all session metrics calculations including:
 * - Basic metrics (thought counts, revisions, time spent)
 * - Mode-specific metrics (temporal, game theory, evidential)
 * - Incremental calculations for performance (O(1) updates)
 * - Cache statistics tracking
 *
 * RESPONSIBILITY:
 * - Initialize session metrics
 * - Update metrics incrementally as thoughts are added
 * - Calculate mode-specific custom metrics
 * - Track validation cache statistics
 *
 * EXTRACTED FROM: src/session/manager.ts (metrics methods)
 */

import { ThinkingSession, SessionMetrics, Thought } from '../types/index.js';
import { isTemporalThought, isGameTheoryThought, isEvidentialThought } from '../types/core.js';
import { validationCache } from '../validation/cache.js';

/**
 * Session Metrics Calculator - Handles all metrics computations
 *
 * Provides efficient, incremental metrics updates using O(1) algorithms
 * where possible. Tracks both generic and mode-specific metrics.
 *
 * @example
 * ```typescript
 * const calculator = new SessionMetricsCalculator();
 *
 * // Initialize metrics for new session
 * session.metrics = calculator.initializeMetrics();
 *
 * // Update metrics after adding thought
 * calculator.updateMetrics(session, newThought);
 * ```
 */
export class SessionMetricsCalculator {
  /**
   * Initialize metrics for a new session
   *
   * Creates a fresh metrics object with all counters set to zero
   * and cache statistics initialized.
   *
   * @returns Initialized session metrics
   *
   * @example
   * ```typescript
   * const metrics = calculator.initializeMetrics();
   * session.metrics = metrics;
   * ```
   */
  initializeMetrics(): SessionMetrics {
    return {
      totalThoughts: 0,
      thoughtsByType: {},
      averageUncertainty: 0,
      revisionCount: 0,
      timeSpent: 0,
      dependencyDepth: 0,
      customMetrics: new Map(),
      cacheStats: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        maxSize: 0,
      },
    };
  }

  /**
   * Update session metrics after adding a thought
   *
   * Performs incremental updates using O(1) algorithms for performance.
   * Handles mode-specific metrics for temporal, game theory, and evidential modes.
   *
   * **Performance Optimizations**:
   * - Incremental thoughtsByType counter (O(1) vs O(n) recalculation)
   * - Running average for uncertainty (O(1) vs O(n) recalculation)
   * - Max dependency depth tracking (O(1) comparison)
   *
   * @param session - Session to update (modified in-place)
   * @param thought - Newly added thought
   *
   * @example
   * ```typescript
   * calculator.updateMetrics(session, newThought);
   * console.log(session.metrics.totalThoughts); // Incremented
   * ```
   */
  updateMetrics(session: ThinkingSession, thought: Thought): void {
    const metrics = session.metrics;

    // Update total thoughts
    metrics.totalThoughts = session.thoughts.length;

    // Update thoughtsByType incrementally (O(1) instead of recalculating)
    const thoughtType = thought.mode || 'unknown';
    metrics.thoughtsByType[thoughtType] = (metrics.thoughtsByType[thoughtType] || 0) + 1;

    // Update revision count
    if (thought.isRevision) {
      metrics.revisionCount++;
    }

    // Update time spent (in milliseconds)
    metrics.timeSpent = session.updatedAt.getTime() - session.createdAt.getTime();

    // Update average uncertainty incrementally (O(1) instead of O(n))
    if ('uncertainty' in thought && typeof (thought as any).uncertainty === 'number') {
      const uncertaintyValue = (thought as any).uncertainty;
      const currentSum = metrics._uncertaintySum || 0;
      const currentCount = metrics._uncertaintyCount || 0;

      const newSum = currentSum + uncertaintyValue;
      const newCount = currentCount + 1;

      metrics._uncertaintySum = newSum;
      metrics._uncertaintyCount = newCount;
      metrics.averageUncertainty = newSum / newCount;
    }

    // Update dependency depth
    if ('dependencies' in thought && thought.dependencies) {
      const deps = (thought as any).dependencies as string[];
      if (deps && deps.length > metrics.dependencyDepth) {
        metrics.dependencyDepth = deps.length;
      }
    }

    // Update mode-specific metrics
    this.updateModeSpecificMetrics(metrics, thought);

    // Update validation cache statistics
    this.updateCacheStats(session);
  }

  /**
   * Update mode-specific custom metrics
   *
   * Calculates and stores metrics unique to specific thinking modes:
   * - Temporal: events, timeline, relations, constraints, intervals
   * - Game Theory: players, strategies, equilibria, game type
   * - Evidential: hypotheses, evidence, belief functions, decisions
   *
   * @param metrics - Session metrics to update
   * @param thought - Thought to analyze
   */
  private updateModeSpecificMetrics(metrics: SessionMetrics, thought: Thought): void {
    // Temporal-specific metrics (Phase 3, v2.1)
    if (isTemporalThought(thought)) {
      if (thought.events) {
        metrics.customMetrics.set('totalEvents', thought.events.length);
      }
      if (thought.timeline) {
        metrics.customMetrics.set('timelineUnit', thought.timeline.timeUnit);
      }
      if (thought.relations) {
        const causalRelations = thought.relations.filter(r => r.relationType === 'causes');
        metrics.customMetrics.set('causalRelations', causalRelations.length);
      }
      if (thought.constraints) {
        metrics.customMetrics.set('temporalConstraints', thought.constraints.length);
      }
      if (thought.intervals) {
        metrics.customMetrics.set('timeIntervals', thought.intervals.length);
      }
    }

    // Game theory-specific metrics (Phase 3, v2.2)
    if (isGameTheoryThought(thought)) {
      if (thought.players) {
        metrics.customMetrics.set('numPlayers', thought.players.length);
      }
      if (thought.strategies) {
        metrics.customMetrics.set('totalStrategies', thought.strategies.length);
        const mixedStrategies = thought.strategies.filter(s => !s.isPure);
        metrics.customMetrics.set('mixedStrategies', mixedStrategies.length);
      }
      if (thought.nashEquilibria) {
        metrics.customMetrics.set('nashEquilibria', thought.nashEquilibria.length);
        const pureEquilibria = thought.nashEquilibria.filter(e => e.type === 'pure');
        metrics.customMetrics.set('pureNashEquilibria', pureEquilibria.length);
      }
      if (thought.dominantStrategies) {
        metrics.customMetrics.set('dominantStrategies', thought.dominantStrategies.length);
      }
      if (thought.game) {
        metrics.customMetrics.set('gameType', thought.game.type);
        metrics.customMetrics.set('isZeroSum', thought.game.isZeroSum);
      }
    }

    // Evidential-specific metrics (Phase 3, v2.3)
    if (isEvidentialThought(thought)) {
      if (thought.hypotheses) {
        metrics.customMetrics.set('totalHypotheses', thought.hypotheses.length);
      }
      if (thought.evidence) {
        metrics.customMetrics.set('totalEvidence', thought.evidence.length);
        const avgReliability = thought.evidence.reduce((sum, e) => sum + e.reliability, 0) / thought.evidence.length;
        metrics.customMetrics.set('avgEvidenceReliability', avgReliability);
      }
      if (thought.beliefFunctions) {
        metrics.customMetrics.set('beliefFunctions', thought.beliefFunctions.length);
      }
      if (thought.combinedBelief) {
        metrics.customMetrics.set('hasCombinedBelief', true);
        if (thought.combinedBelief.conflictMass !== undefined) {
          metrics.customMetrics.set('conflictMass', thought.combinedBelief.conflictMass);
        }
      }
      if (thought.decisions) {
        metrics.customMetrics.set('decisions', thought.decisions.length);
      }
    }
  }

  /**
   * Update validation cache statistics in session metrics
   *
   * Retrieves current validation cache statistics and updates the
   * session metrics with the latest values.
   *
   * @param session - Session to update
   *
   * @example
   * ```typescript
   * calculator.updateCacheStats(session);
   * console.log(session.metrics.cacheStats.hitRate); // Updated
   * ```
   */
  private updateCacheStats(session: ThinkingSession): void {
    const cacheStats = validationCache.getStats();
    session.metrics.cacheStats = {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: cacheStats.hitRate,
      size: cacheStats.size,
      maxSize: cacheStats.maxSize,
    };
  }
}
