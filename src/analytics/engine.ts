/**
 * Analytics Engine (v3.4.0)
 * Phase 4 Task 9.2: Real-time analytics computation
 */

import type { ThinkingSession, ThinkingMode } from '../types/index.js';
import type {
  AnalyticsDashboard,
  OverviewStats,
  ModeDistribution,
  TaxonomyDistribution,
  TimeSeriesData,
  SessionMetrics,
  QualityMetrics,
  AnalyticsQuery,
  TimeSeriesPoint,
  Distribution,
  ReasoningPattern,
} from './types.js';
import { TaxonomyClassifier } from '../taxonomy/classifier.js';
import { SuggestionEngine } from '../taxonomy/suggestion-engine.js';

/**
 * Analytics engine for computing real-time metrics
 */
export class AnalyticsEngine {
  private sessions: Map<string, ThinkingSession>;
  private classifier: TaxonomyClassifier;
  private suggestionEngine: SuggestionEngine;
  private lastUpdate: Date;

  constructor() {
    this.sessions = new Map();
    this.classifier = new TaxonomyClassifier();
    this.suggestionEngine = new SuggestionEngine();
    this.lastUpdate = new Date();
  }

  /**
   * Add/update a session
   */
  trackSession(session: ThinkingSession): void {
    this.sessions.set(session.id, session);
    this.lastUpdate = new Date();
  }

  /**
   * Remove a session
   */
  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.lastUpdate = new Date();
  }

  /**
   * Generate analytics dashboard
   */
  generateDashboard(query?: AnalyticsQuery): AnalyticsDashboard {
    const filteredSessions = this.filterSessions(query);

    return {
      overview: this.computeOverview(filteredSessions, query),
      modeDistribution: this.computeModeDistribution(filteredSessions),
      taxonomyDistribution: this.computeTaxonomyDistribution(filteredSessions),
      timeSeries: this.computeTimeSeries(filteredSessions, query),
      sessionMetrics: this.computeSessionMetrics(filteredSessions),
      qualityMetrics: this.computeQualityMetrics(filteredSessions),
      lastUpdated: this.lastUpdate,
    };
  }

  /**
   * Filter sessions by query
   */
  private filterSessions(query?: AnalyticsQuery): ThinkingSession[] {
    let sessions = Array.from(this.sessions.values());

    if (!query) {
      return sessions;
    }

    // Filter by date range
    if (query.dateRange) {
      sessions = sessions.filter(s => {
        const created = new Date(s.createdAt);
        if (query.dateRange!.from && created < query.dateRange!.from) {
          return false;
        }
        if (query.dateRange!.to && created > query.dateRange!.to) {
          return false;
        }
        return true;
      });
    }

    // Filter by modes
    if (query.modes && query.modes.length > 0) {
      const modeSet = new Set(query.modes);
      sessions = sessions.filter(s => modeSet.has(s.mode));
    }

    // Filter by users
    if (query.users && query.users.length > 0) {
      const userSet = new Set(query.users);
      sessions = sessions.filter(s => s.author && userSet.has(s.author));
    }

    return sessions;
  }

  /**
   * Compute overview statistics
   */
  private computeOverview(sessions: ThinkingSession[], query?: AnalyticsQuery): OverviewStats {
    const totalSessions = sessions.length;
    const totalThoughts = sessions.reduce((sum, s) => sum + s.thoughts.length, 0);
    const uniqueAuthors = new Set(sessions.map(s => s.author).filter(Boolean));

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaySessions = sessions.filter(s => new Date(s.createdAt) >= todayStart).length;
    const weekSessions = sessions.filter(s => new Date(s.createdAt) >= weekStart).length;
    const monthSessions = sessions.filter(s => new Date(s.createdAt) >= monthStart).length;

    const completedSessions = sessions.filter(s =>
      s.thoughts.length > 0 && !s.thoughts[s.thoughts.length - 1].nextThoughtNeeded
    ).length;

    const sessionsWithDuration = sessions.filter(s => s.thoughts.length > 0);
    const avgDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => {
          const duration = (new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime()) / 60000;
          return sum + duration;
        }, 0) / sessionsWithDuration.length
      : 0;

    return {
      totalSessions,
      totalThoughts,
      activeUsers: uniqueAuthors.size,
      averageThoughtsPerSession: totalSessions > 0 ? totalThoughts / totalSessions : 0,
      averageSessionDuration: avgDuration,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      todaySessions,
      weekSessions,
      monthSessions,
    };
  }

  /**
   * Compute mode distribution
   */
  private computeModeDistribution(sessions: ThinkingSession[]): ModeDistribution {
    const counts = new Map<ThinkingMode, number>();
    const thoughtCounts = new Map<ThinkingMode, number>();
    const confidenceSum = new Map<ThinkingMode, number>();
    const confidenceCounts = new Map<ThinkingMode, number>();

    for (const session of sessions) {
      counts.set(session.mode, (counts.get(session.mode) || 0) + 1);
      thoughtCounts.set(session.mode, (thoughtCounts.get(session.mode) || 0) + session.thoughts.length);

      if (session.confidence !== undefined) {
        confidenceSum.set(session.mode, (confidenceSum.get(session.mode) || 0) + session.confidence);
        confidenceCounts.set(session.mode, (confidenceCounts.get(session.mode) || 0) + 1);
      }
    }

    const percentages = new Map<ThinkingMode, number>();
    const total = sessions.length;

    for (const [mode, count] of counts) {
      percentages.set(mode, (count / total) * 100);
    }

    const averageThoughts = new Map<ThinkingMode, number>();
    for (const [mode, count] of counts) {
      const thoughts = thoughtCounts.get(mode) || 0;
      averageThoughts.set(mode, thoughts / count);
    }

    const averageConfidence = new Map<ThinkingMode, number>();
    for (const [mode, sum] of confidenceSum) {
      const count = confidenceCounts.get(mode) || 1;
      averageConfidence.set(mode, sum / count);
    }

    // Find most popular
    let mostPopular: ThinkingMode = 'sequential' as ThinkingMode;
    let maxCount = 0;
    for (const [mode, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        mostPopular = mode;
      }
    }

    // Trending is simplified (would need historical data)
    const trending: ThinkingMode[] = [];

    return {
      counts,
      percentages,
      averageThoughts,
      averageConfidence,
      mostPopular,
      trending,
    };
  }

  /**
   * Compute taxonomy distribution
   */
  private computeTaxonomyDistribution(sessions: ThinkingSession[]): TaxonomyDistribution {
    const categories = new Map<string, number>();
    const types = new Map<string, number>();
    const cognitiveLoad = new Map<string, number>();
    const dualProcess = new Map<string, number>();

    const patternMap = new Map<string, { sum: number; count: number }>();

    for (const session of sessions) {
      for (const thought of session.thoughts) {
        const classification = this.classifier.classifyThought(thought);

        // Count categories
        categories.set(
          classification.primaryCategory,
          (categories.get(classification.primaryCategory) || 0) + 1
        );

        // Count types
        types.set(
          classification.primaryType.id,
          (types.get(classification.primaryType.id) || 0) + 1
        );

        // Get metadata
        const metadata = this.suggestionEngine.getMetadata(classification.primaryType.id);

        if (metadata) {
          // Cognitive load
          cognitiveLoad.set(
            metadata.cognitiveLoad,
            (cognitiveLoad.get(metadata.cognitiveLoad) || 0) + 1
          );

          // Dual process
          dualProcess.set(
            metadata.dualProcess,
            (dualProcess.get(metadata.dualProcess) || 0) + 1
          );

          // Pattern tracking
          if (!patternMap.has(classification.primaryType.id)) {
            patternMap.set(classification.primaryType.id, { sum: 0, count: 0 });
          }
          const pattern = patternMap.get(classification.primaryType.id)!;
          pattern.sum += metadata.qualityMetrics.rigor;
          pattern.count += 1;
        }
      }
    }

    // Build top patterns
    const topPatterns: ReasoningPattern[] = [];
    const sortedTypes = Array.from(types.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    for (const [typeId, frequency] of sortedTypes) {
      const pattern = patternMap.get(typeId);
      const metadata = this.suggestionEngine.getMetadata(typeId);

      if (metadata) {
        topPatterns.push({
          id: typeId,
          name: metadata.name || typeId,
          category: metadata.category || 'unknown',
          frequency,
          avgQuality: pattern ? pattern.sum / pattern.count : 0,
        });
      }
    }

    return {
      categories,
      types: new Map(sortedTypes),
      topPatterns,
      cognitiveLoad,
      dualProcess,
    };
  }

  /**
   * Compute time series data
   */
  private computeTimeSeries(sessions: ThinkingSession[], query?: AnalyticsQuery): TimeSeriesData {
    const granularity = query?.granularity || 'day';
    const buckets = this.createTimeBuckets(sessions, granularity);

    const sessionsOverTime: TimeSeriesPoint[] = [];
    const thoughtsOverTime: TimeSeriesPoint[] = [];

    for (const [timestamp, bucketSessions] of buckets) {
      sessionsOverTime.push({
        timestamp,
        value: bucketSessions.length,
      });

      const thoughtCount = bucketSessions.reduce((sum, s) => sum + s.thoughts.length, 0);
      thoughtsOverTime.push({
        timestamp,
        value: thoughtCount,
      });
    }

    return {
      sessionsOverTime,
      thoughtsOverTime,
      modesOverTime: [],
      qualityOverTime: [],
      granularity,
    };
  }

  /**
   * Create time buckets
   */
  private createTimeBuckets(
    sessions: ThinkingSession[],
    granularity: 'hour' | 'day' | 'week' | 'month'
  ): Map<Date, ThinkingSession[]> {
    const buckets = new Map<string, ThinkingSession[]>();

    for (const session of sessions) {
      const date = new Date(session.createdAt);
      const key = this.getBucketKey(date, granularity);

      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key)!.push(session);
    }

    // Convert to Map with Date keys
    const result = new Map<Date, ThinkingSession[]>();
    for (const [key, sessions] of buckets) {
      result.set(new Date(key), sessions);
    }

    return result;
  }

  /**
   * Get bucket key for time granularity
   */
  private getBucketKey(date: Date, granularity: 'hour' | 'day' | 'week' | 'month'): string {
    switch (granularity) {
      case 'hour':
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      case 'day':
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `${weekStart.getFullYear()}-W${this.getWeekNumber(weekStart)}`;
      }
      case 'month':
        return `${date.getFullYear()}-${date.getMonth()}`;
    }
  }

  /**
   * Get week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Compute session metrics
   */
  private computeSessionMetrics(sessions: ThinkingSession[]): SessionMetrics {
    const lengths = sessions.map(s => s.thoughts.length);
    const avgLength = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;

    const lengthDistribution = this.createDistribution(lengths);
    const completionByMode = new Map<ThinkingMode, number>();
    const productiveHours = new Array(24).fill(0);

    return {
      averageLength: avgLength,
      lengthDistribution,
      completionByMode,
      durationDistribution: this.createDistribution([]),
      productiveHours,
    };
  }

  /**
   * Create distribution from values
   */
  private createDistribution(values: number[]): Distribution {
    if (values.length === 0) {
      return {
        buckets: [],
        mean: 0,
        median: 0,
        stddev: 0,
        min: 0,
        max: 0,
      };
    }

    const sorted = values.slice().sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stddev = Math.sqrt(variance);

    return {
      buckets: [],
      mean,
      median,
      stddev,
      min: sorted[0],
      max: sorted[sorted.length - 1],
    };
  }

  /**
   * Compute quality metrics
   */
  private computeQualityMetrics(sessions: ThinkingSession[]): QualityMetrics {
    const confidences = sessions
      .map(s => s.confidence)
      .filter((c): c is number => c !== undefined);

    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

    const highQuality = confidences.filter(c => c > 0.8).length;
    const lowQuality = confidences.filter(c => c < 0.4).length;

    return {
      averageConfidence: avgConfidence,
      averageQualityMetrics: {
        rigor: avgConfidence,
        clarity: avgConfidence,
        novelty: avgConfidence * 0.8,
        practicality: avgConfidence * 0.9,
      },
      highQualitySessions: highQuality,
      lowQualitySessions: lowQuality,
      qualityTrend: 'stable',
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.sessions.clear();
    this.lastUpdate = new Date();
  }
}
