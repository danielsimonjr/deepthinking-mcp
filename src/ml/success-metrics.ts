/**
 * Success Metrics Analyzer (v3.4.0)
 * Phase 4 Task 11: Analyze session outcomes and success factors
 */

import type { ThinkingSession } from '../types/session.js';
import type { ThinkingMode } from '../types/core.js';

/**
 * Success metric definition
 */
export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1, importance of this metric
  value: number; // 0-1, actual metric value
  category: 'completion' | 'quality' | 'efficiency' | 'confidence';
  details?: Record<string, any>;
}

/**
 * Success analysis result
 */
export interface SuccessAnalysis {
  sessionId: string;
  overallScore: number; // 0-1, weighted average of all metrics
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  metrics: SuccessMetric[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  comparisonToAverage?: {
    percentile: number; // 0-100
    averageScore: number;
    sessionCount: number;
  };
}

/**
 * Success factor (correlation between session property and success)
 */
export interface SuccessFactor {
  id: string;
  name: string;
  description: string;
  correlation: number; // -1 to 1
  significance: number; // 0-1, statistical significance
  category: 'mode' | 'structure' | 'behavior' | 'content';
  examples: Array<{
    sessionId: string;
    value: any;
    successScore: number;
  }>;
}

/**
 * Aggregate success insights
 */
export interface SuccessInsights {
  totalSessions: number;
  averageScore: number;
  topFactors: SuccessFactor[];
  modePerformance: Map<ThinkingMode, {
    averageScore: number;
    sessionCount: number;
    successRate: number; // Percentage rated "good" or "excellent"
  }>;
  recommendations: string[];
}

/**
 * Success metrics analyzer
 */
export class SuccessMetricsAnalyzer {
  private sessions: ThinkingSession[];
  private analyses: Map<string, SuccessAnalysis>;
  private factors: SuccessFactor[];

  constructor() {
    this.sessions = [];
    this.analyses = new Map();
    this.factors = [];
  }

  /**
   * Add session for analysis
   */
  addSession(session: ThinkingSession): void {
    this.sessions.push(session);
  }

  /**
   * Analyze a single session
   */
  analyzeSession(session: ThinkingSession): SuccessAnalysis {
    const metrics = this.calculateMetrics(session);
    const overallScore = this.calculateOverallScore(metrics);
    const rating = this.getRating(overallScore);
    const strengths = this.identifyStrengths(metrics);
    const weaknesses = this.identifyWeaknesses(metrics);
    const recommendations = this.generateRecommendations(session, metrics);

    const analysis: SuccessAnalysis = {
      sessionId: session.id,
      overallScore,
      rating,
      metrics,
      strengths,
      weaknesses,
      recommendations,
    };

    // Add comparison if we have enough data
    if (this.sessions.length >= 10) {
      analysis.comparisonToAverage = this.compareToAverage(overallScore);
    }

    this.analyses.set(session.id, analysis);
    return analysis;
  }

  /**
   * Analyze all sessions and identify success factors
   */
  analyzeAll(): SuccessInsights {
    // Analyze each session
    for (const session of this.sessions) {
      this.analyzeSession(session);
    }

    // Identify success factors
    this.identifySuccessFactors();

    // Calculate mode performance
    const modePerformance = this.calculateModePerformance();

    // Generate insights
    const totalSessions = this.sessions.length;
    const averageScore = this.calculateAverageScore();
    const topFactors = this.factors
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 10);
    const recommendations = this.generateGlobalRecommendations();

    return {
      totalSessions,
      averageScore,
      topFactors,
      modePerformance,
      recommendations,
    };
  }

  /**
   * Get analysis for a session
   */
  getAnalysis(sessionId: string): SuccessAnalysis | undefined {
    return this.analyses.get(sessionId);
  }

  /**
   * Get all analyses
   */
  getAllAnalyses(): SuccessAnalysis[] {
    return Array.from(this.analyses.values());
  }

  /**
   * Get success factors
   */
  getSuccessFactors(): SuccessFactor[] {
    return this.factors;
  }

  /**
   * Find sessions similar to a successful session
   */
  findSimilarSuccessful(sessionId: string, count: number = 5): ThinkingSession[] {
    const analysis = this.analyses.get(sessionId);
    if (!analysis || analysis.rating === 'poor') {
      return [];
    }

    // Find sessions with similar high scores
    const similar = Array.from(this.analyses.values())
      .filter(a => a.sessionId !== sessionId && a.overallScore >= 0.7)
      .sort((a, b) => {
        const scoreA = Math.abs(a.overallScore - analysis.overallScore);
        const scoreB = Math.abs(b.overallScore - analysis.overallScore);
        return scoreA - scoreB;
      })
      .slice(0, count)
      .map(a => this.sessions.find(s => s.id === a.sessionId)!)
      .filter(s => s !== undefined);

    return similar;
  }

  /**
   * Calculate all metrics for a session
   */
  private calculateMetrics(session: ThinkingSession): SuccessMetric[] {
    const metrics: SuccessMetric[] = [];

    // Completion metrics
    metrics.push(this.calculateCompletionMetric(session));
    metrics.push(this.calculateGoalAchievementMetric(session));

    // Quality metrics
    metrics.push(this.calculateConfidenceMetric(session));
    metrics.push(this.calculateDepthMetric(session));
    metrics.push(this.calculateCoherenceMetric(session));

    // Efficiency metrics
    metrics.push(this.calculateEfficiencyMetric(session));
    metrics.push(this.calculateRevisionRatioMetric(session));

    return metrics;
  }

  /**
   * Completion metric: Did the session complete?
   */
  private calculateCompletionMetric(session: ThinkingSession): SuccessMetric {
    const value = session.isComplete ? 1.0 : 0.5;

    return {
      id: 'completion',
      name: 'Completion',
      description: 'Whether the session reached a conclusion',
      weight: 0.2,
      value,
      category: 'completion',
      details: {
        isComplete: session.isComplete,
        thoughtCount: session.thoughts.length,
      },
    };
  }

  /**
   * Goal achievement metric: Based on final thought confidence
   */
  private calculateGoalAchievementMetric(session: ThinkingSession): SuccessMetric {
    const lastThought = session.thoughts[session.thoughts.length - 1];
    const uncertainty = (lastThought as any).uncertainty || 0.5;
    const value = 1 - uncertainty; // Lower uncertainty = better achievement

    return {
      id: 'goal_achievement',
      name: 'Goal Achievement',
      description: 'Confidence in the final conclusion',
      weight: 0.2,
      value,
      category: 'completion',
      details: {
        finalUncertainty: uncertainty,
        finalConfidence: value,
      },
    };
  }

  /**
   * Confidence metric: Average confidence across thoughts
   */
  private calculateConfidenceMetric(session: ThinkingSession): SuccessMetric {
    const uncertainties = session.thoughts
      .map(t => (t as any).uncertainty)
      .filter(u => u !== undefined);

    const avgUncertainty = uncertainties.length > 0
      ? uncertainties.reduce((sum, u) => sum + u, 0) / uncertainties.length
      : 0.5;

    const value = 1 - avgUncertainty;

    return {
      id: 'confidence',
      name: 'Average Confidence',
      description: 'Overall confidence throughout the session',
      weight: 0.15,
      value,
      category: 'quality',
      details: {
        averageUncertainty: avgUncertainty,
        averageConfidence: value,
        thoughtsWithConfidence: uncertainties.length,
      },
    };
  }

  /**
   * Depth metric: Based on thought count and dependencies
   */
  private calculateDepthMetric(session: ThinkingSession): SuccessMetric {
    const thoughtCount = session.thoughts.length;
    const dependencies = session.thoughts.filter(
      t => (t as any).dependencies && (t as any).dependencies.length > 0
    ).length;

    // Normalize: 10+ thoughts with dependencies = excellent
    const thoughtScore = Math.min(thoughtCount / 10, 1);
    const dependencyScore = Math.min(dependencies / 5, 1);
    const value = (thoughtScore + dependencyScore) / 2;

    return {
      id: 'depth',
      name: 'Reasoning Depth',
      description: 'Thoroughness of analysis',
      weight: 0.15,
      value,
      category: 'quality',
      details: {
        thoughtCount,
        dependencyCount: dependencies,
        score: value,
      },
    };
  }

  /**
   * Coherence metric: Based on revision pattern and branching
   */
  private calculateCoherenceMetric(session: ThinkingSession): SuccessMetric {
    const revisions = session.thoughts.filter(t => (t as any).isRevision).length;
    const branches = new Set(
      session.thoughts.map(t => (t as any).branchId).filter(b => b !== undefined)
    ).size;

    // Moderate revisions good (exploration), excessive revisions bad (confusion)
    const revisionRatio = revisions / session.thoughts.length;
    const revisionScore = revisionRatio > 0.4 ? 1 - (revisionRatio - 0.4) : 1;

    // Few branches = coherent, many branches = scattered
    const branchScore = branches <= 2 ? 1 : 1 / branches;

    const value = (revisionScore + branchScore) / 2;

    return {
      id: 'coherence',
      name: 'Coherence',
      description: 'Consistency and focus of reasoning',
      weight: 0.1,
      value,
      category: 'quality',
      details: {
        revisions,
        branches,
        revisionRatio,
        score: value,
      },
    };
  }

  /**
   * Efficiency metric: Based on time spent and thought count
   */
  private calculateEfficiencyMetric(session: ThinkingSession): SuccessMetric {
    const timeSpent = session.metrics?.timeSpent || 0;
    const thoughtCount = session.thoughts.length;

    if (timeSpent === 0 || thoughtCount === 0) {
      return {
        id: 'efficiency',
        name: 'Efficiency',
        description: 'Time efficiency of reasoning process',
        weight: 0.1,
        value: 0.5,
        category: 'efficiency',
      };
    }

    // Good range: 30-120 seconds per thought
    const timePerThought = timeSpent / thoughtCount;
    let value: number;

    if (timePerThought >= 30 && timePerThought <= 120) {
      value = 1.0; // Optimal
    } else if (timePerThought < 30) {
      value = Math.max(timePerThought / 30, 0.3); // Too fast
    } else {
      value = Math.max(1 - (timePerThought - 120) / 300, 0.3); // Too slow
    }

    return {
      id: 'efficiency',
      name: 'Efficiency',
      description: 'Time efficiency of reasoning process',
      weight: 0.1,
      value,
      category: 'efficiency',
      details: {
        timeSpent,
        thoughtCount,
        timePerThought,
      },
    };
  }

  /**
   * Revision ratio metric: Balance of exploration vs efficiency
   */
  private calculateRevisionRatioMetric(session: ThinkingSession): SuccessMetric {
    const revisionCount = session.metrics?.revisionCount || 0;
    const thoughtCount = session.thoughts.length;
    const ratio = thoughtCount > 0 ? revisionCount / thoughtCount : 0;

    // Optimal range: 10-30% revisions
    let value: number;
    if (ratio >= 0.1 && ratio <= 0.3) {
      value = 1.0;
    } else if (ratio < 0.1) {
      value = 0.7 + (ratio / 0.1) * 0.3; // Too few revisions
    } else {
      value = Math.max(1 - (ratio - 0.3) / 0.4, 0.3); // Too many revisions
    }

    return {
      id: 'revision_ratio',
      name: 'Revision Balance',
      description: 'Balance between exploration and efficiency',
      weight: 0.1,
      value,
      category: 'efficiency',
      details: {
        revisionCount,
        thoughtCount,
        ratio,
      },
    };
  }

  /**
   * Calculate weighted overall score
   */
  private calculateOverallScore(metrics: SuccessMetric[]): number {
    const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = metrics.reduce((sum, m) => sum + m.value * m.weight, 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Get rating from score
   */
  private getRating(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'fair';
    return 'poor';
  }

  /**
   * Identify strengths from metrics
   */
  private identifyStrengths(metrics: SuccessMetric[]): string[] {
    return metrics
      .filter(m => m.value >= 0.7)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(m => `Strong ${m.name.toLowerCase()}: ${(m.value * 100).toFixed(0)}%`);
  }

  /**
   * Identify weaknesses from metrics
   */
  private identifyWeaknesses(metrics: SuccessMetric[]): string[] {
    return metrics
      .filter(m => m.value < 0.5)
      .sort((a, b) => a.value - b.value)
      .slice(0, 3)
      .map(m => `Low ${m.name.toLowerCase()}: ${(m.value * 100).toFixed(0)}%`);
  }

  /**
   * Generate recommendations for a session
   */
  private generateRecommendations(
    _session: ThinkingSession,
    metrics: SuccessMetric[]
  ): string[] {
    const recommendations: string[] = [];

    // Check completion
    const completion = metrics.find(m => m.id === 'completion');
    if (completion && completion.value < 1.0) {
      recommendations.push('Consider allowing more thoughts to reach a complete conclusion');
    }

    // Check depth
    const depth = metrics.find(m => m.id === 'depth');
    if (depth && depth.value < 0.5) {
      recommendations.push('Explore the problem more deeply with additional thoughts and dependencies');
    }

    // Check efficiency
    const efficiency = metrics.find(m => m.id === 'efficiency');
    if (efficiency && efficiency.value < 0.5) {
      const details = efficiency.details;
      if (details?.timePerThought < 30) {
        recommendations.push('Sessions might benefit from more thorough analysis per thought');
      } else if (details?.timePerThought > 120) {
        recommendations.push('Consider breaking down complex thoughts into simpler steps');
      }
    }

    // Check coherence
    const coherence = metrics.find(m => m.id === 'coherence');
    if (coherence && coherence.value < 0.5) {
      recommendations.push('Focus on maintaining a coherent reasoning path with fewer branches');
    }

    // Check revision ratio
    const revisionRatio = metrics.find(m => m.id === 'revision_ratio');
    if (revisionRatio && revisionRatio.value < 0.7) {
      const details = revisionRatio.details;
      if (details?.ratio < 0.1) {
        recommendations.push('Consider more exploration and revision of initial ideas');
      } else if (details?.ratio > 0.3) {
        recommendations.push('Reduce excessive revisions by planning more carefully');
      }
    }

    return recommendations;
  }

  /**
   * Compare session score to average
   */
  private compareToAverage(score: number): {
    percentile: number;
    averageScore: number;
    sessionCount: number;
  } {
    const scores = Array.from(this.analyses.values()).map(a => a.overallScore);

    if (scores.length === 0) {
      return {
        percentile: 50,
        averageScore: score,
        sessionCount: 0,
      };
    }

    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const percentile = (scores.filter(s => s <= score).length / scores.length) * 100;

    return {
      percentile,
      averageScore,
      sessionCount: scores.length,
    };
  }

  /**
   * Identify success factors across all sessions
   */
  private identifySuccessFactors(): void {
    this.factors = [];

    // Mode factor
    this.factors.push(this.analyzeModeFactor());

    // Thought count factor
    this.factors.push(this.analyzeThoughtCountFactor());

    // Revision count factor
    this.factors.push(this.analyzeRevisionCountFactor());

    // Dependency depth factor
    this.factors.push(this.analyzeDependencyDepthFactor());

    // Time spent factor
    this.factors.push(this.analyzeTimeSpentFactor());
  }

  /**
   * Analyze mode as a success factor
   */
  private analyzeModeFactor(): SuccessFactor {
    const modeScores = new Map<ThinkingMode, number[]>();

    for (const session of this.sessions) {
      const analysis = this.analyses.get(session.id);
      if (analysis) {
        if (!modeScores.has(session.mode)) {
          modeScores.set(session.mode, []);
        }
        modeScores.get(session.mode)!.push(analysis.overallScore);
      }
    }

    // Calculate variance in mode performance
    const modeAverages = Array.from(modeScores.entries()).map(([mode, scores]) => ({
      mode,
      average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }));

    const overallAverage = this.calculateAverageScore();
    const variance = modeAverages.reduce(
      (sum, ma) => sum + Math.pow(ma.average - overallAverage, 2),
      0
    ) / modeAverages.length;

    const correlation = Math.sqrt(variance) * 2; // Normalize to 0-1
    const significance = modeScores.size >= 3 ? 0.8 : 0.5;

    return {
      id: 'mode',
      name: 'Thinking Mode',
      description: 'Impact of thinking mode on success',
      correlation,
      significance,
      category: 'mode',
      examples: modeAverages.slice(0, 5).map(ma => {
        const session = this.sessions.find(s => s.mode === ma.mode)!;
        return {
          sessionId: session.id,
          value: ma.mode,
          successScore: ma.average,
        };
      }),
    };
  }

  /**
   * Analyze thought count as a success factor
   */
  private analyzeThoughtCountFactor(): SuccessFactor {
    const data = this.sessions.map(s => ({
      thoughtCount: s.thoughts.length,
      score: this.analyses.get(s.id)?.overallScore || 0,
    }));

    const correlation = this.calculateCorrelation(
      data.map(d => d.thoughtCount),
      data.map(d => d.score)
    );

    return {
      id: 'thought_count',
      name: 'Thought Count',
      description: 'Impact of number of thoughts on success',
      correlation,
      significance: data.length >= 10 ? 0.7 : 0.5,
      category: 'structure',
      examples: data.slice(0, 5).map(d => {
        const session = this.sessions.find(s => s.thoughts.length === d.thoughtCount)!;
        return {
          sessionId: session.id,
          value: d.thoughtCount,
          successScore: d.score,
        };
      }),
    };
  }

  /**
   * Analyze revision count as a success factor
   */
  private analyzeRevisionCountFactor(): SuccessFactor {
    const data = this.sessions.map(s => ({
      revisionCount: s.metrics?.revisionCount || 0,
      score: this.analyses.get(s.id)?.overallScore || 0,
    }));

    const correlation = this.calculateCorrelation(
      data.map(d => d.revisionCount),
      data.map(d => d.score)
    );

    return {
      id: 'revision_count',
      name: 'Revision Count',
      description: 'Impact of revisions on success',
      correlation,
      significance: data.length >= 10 ? 0.7 : 0.5,
      category: 'behavior',
      examples: data.slice(0, 5).map(d => {
        const session = this.sessions.find(s => s.metrics?.revisionCount === d.revisionCount)!;
        return {
          sessionId: session.id,
          value: d.revisionCount,
          successScore: d.score,
        };
      }),
    };
  }

  /**
   * Analyze dependency depth as a success factor
   */
  private analyzeDependencyDepthFactor(): SuccessFactor {
    const data = this.sessions.map(s => ({
      depth: s.metrics?.dependencyDepth || 0,
      score: this.analyses.get(s.id)?.overallScore || 0,
    }));

    const correlation = this.calculateCorrelation(
      data.map(d => d.depth),
      data.map(d => d.score)
    );

    return {
      id: 'dependency_depth',
      name: 'Dependency Depth',
      description: 'Impact of reasoning depth on success',
      correlation,
      significance: data.length >= 10 ? 0.7 : 0.5,
      category: 'structure',
      examples: data.slice(0, 5).map(d => {
        const session = this.sessions.find(s => s.metrics?.dependencyDepth === d.depth)!;
        return {
          sessionId: session.id,
          value: d.depth,
          successScore: d.score,
        };
      }),
    };
  }

  /**
   * Analyze time spent as a success factor
   */
  private analyzeTimeSpentFactor(): SuccessFactor {
    const data = this.sessions.map(s => ({
      timeSpent: s.metrics?.timeSpent || 0,
      score: this.analyses.get(s.id)?.overallScore || 0,
    }));

    const correlation = this.calculateCorrelation(
      data.map(d => d.timeSpent),
      data.map(d => d.score)
    );

    return {
      id: 'time_spent',
      name: 'Time Spent',
      description: 'Impact of session duration on success',
      correlation,
      significance: data.length >= 10 ? 0.6 : 0.4,
      category: 'behavior',
      examples: data.slice(0, 5).map(d => {
        const session = this.sessions.find(s => s.metrics?.timeSpent === d.timeSpent)!;
        return {
          sessionId: session.id,
          value: d.timeSpent,
          successScore: d.score,
        };
      }),
    };
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0 || n !== y.length) return 0;

    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate mode performance statistics
   */
  private calculateModePerformance(): Map<ThinkingMode, {
    averageScore: number;
    sessionCount: number;
    successRate: number;
  }> {
    const modeStats = new Map<ThinkingMode, {
      averageScore: number;
      sessionCount: number;
      successRate: number;
    }>();

    const modeData = new Map<ThinkingMode, { scores: number[]; successful: number }>();

    for (const session of this.sessions) {
      const analysis = this.analyses.get(session.id);
      if (analysis) {
        if (!modeData.has(session.mode)) {
          modeData.set(session.mode, { scores: [], successful: 0 });
        }

        const data = modeData.get(session.mode)!;
        data.scores.push(analysis.overallScore);

        if (analysis.rating === 'excellent' || analysis.rating === 'good') {
          data.successful++;
        }
      }
    }

    for (const [mode, data] of modeData) {
      modeStats.set(mode, {
        averageScore: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
        sessionCount: data.scores.length,
        successRate: (data.successful / data.scores.length) * 100,
      });
    }

    return modeStats;
  }

  /**
   * Calculate average score across all sessions
   */
  private calculateAverageScore(): number {
    const scores = Array.from(this.analyses.values()).map(a => a.overallScore);
    return scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
  }

  /**
   * Generate global recommendations
   */
  private generateGlobalRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check average score
    const avgScore = this.calculateAverageScore();
    if (avgScore < 0.6) {
      recommendations.push('Overall success rate is below target. Focus on completion and depth.');
    }

    // Check top factors
    const topFactors = this.factors
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 3);

    for (const factor of topFactors) {
      if (factor.correlation > 0.5) {
        recommendations.push(
          `Positive factor: Increasing ${factor.name.toLowerCase()} tends to improve success`
        );
      } else if (factor.correlation < -0.5) {
        recommendations.push(
          `Negative factor: Reducing ${factor.name.toLowerCase()} may improve success`
        );
      }
    }

    // Check mode performance
    const modePerf = this.calculateModePerformance();
    const bestMode = Array.from(modePerf.entries()).sort(
      (a, b) => b[1].averageScore - a[1].averageScore
    )[0];

    if (bestMode && bestMode[1].sessionCount >= 3) {
      recommendations.push(
        `Best performing mode: ${bestMode[0]} (avg score: ${(bestMode[1].averageScore * 100).toFixed(0)}%)`
      );
    }

    return recommendations;
  }
}
