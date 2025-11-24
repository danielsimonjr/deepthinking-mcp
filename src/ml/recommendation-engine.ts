/**
 * Recommendation Engine (v3.4.0)
 * Phase 4 Task 12: Intelligent recommendations combining patterns and success metrics
 */

import type { ThinkingSession } from '../types/session.js';
import type { ThinkingMode } from '../types/core.js';
import { PatternRecognizer } from './pattern-recognition.js';
import { SuccessMetricsAnalyzer, type SuccessAnalysis, type SuccessFactor } from './success-metrics.js';

/**
 * Recommendation types
 */
export type RecommendationType =
  | 'mode'           // Suggest a thinking mode
  | 'structure'      // Suggest reasoning structure
  | 'behavior'       // Suggest behavioral changes
  | 'template'       // Suggest using a template
  | 'continuation'   // Suggest how to continue
  | 'improvement';   // Suggest improvements

/**
 * Recommendation confidence levels
 */
export type RecommendationConfidence = 'high' | 'medium' | 'low';

/**
 * Recommendation
 */
export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  rationale: string;
  confidence: RecommendationConfidence;
  confidenceScore: number; // 0-1
  actionable: boolean;
  actions?: string[];
  expectedImprovement?: number; // 0-1, predicted improvement in success score
  basedOn: {
    patterns?: string[]; // Pattern IDs
    metrics?: string[];  // Metric IDs
    successFactors?: string[]; // Factor IDs
    similarSessions?: string[]; // Similar session IDs
  };
}

/**
 * Recommendation request
 */
export interface RecommendationRequest {
  session?: ThinkingSession;
  context?: {
    domain?: string;
    goal?: string;
    constraints?: string[];
    preferences?: {
      favorModes?: ThinkingMode[];
      avoidModes?: ThinkingMode[];
      maxTime?: number;
      maxThoughts?: number;
    };
  };
  types?: RecommendationType[];
  limit?: number;
}

/**
 * Recommendation result
 */
export interface RecommendationResult {
  recommendations: Recommendation[];
  totalRecommendations: number;
  highConfidenceCount: number;
  summary: string;
}

/**
 * Recommendation engine
 */
export class RecommendationEngine {
  private patternRecognizer: PatternRecognizer;
  private successAnalyzer: SuccessMetricsAnalyzer;
  private trainedSessions: ThinkingSession[];

  constructor() {
    this.patternRecognizer = new PatternRecognizer();
    this.successAnalyzer = new SuccessMetricsAnalyzer();
    this.trainedSessions = [];
  }

  /**
   * Train the recommendation engine on historical sessions
   */
  train(sessions: ThinkingSession[]): void {
    this.trainedSessions = sessions;

    // Train pattern recognizer
    sessions.forEach(s => this.patternRecognizer.addSession(s));
    this.patternRecognizer.train();

    // Train success analyzer
    sessions.forEach(s => this.successAnalyzer.addSession(s));
    this.successAnalyzer.analyzeAll();
  }

  /**
   * Get recommendations for a session
   */
  getRecommendations(request: RecommendationRequest): RecommendationResult {
    const recommendations: Recommendation[] = [];

    // Generate different types of recommendations
    if (!request.types || request.types.includes('mode')) {
      recommendations.push(...this.generateModeRecommendations(request));
    }

    if (!request.types || request.types.includes('structure')) {
      recommendations.push(...this.generateStructureRecommendations(request));
    }

    if (!request.types || request.types.includes('behavior')) {
      recommendations.push(...this.generateBehaviorRecommendations(request));
    }

    if (!request.types || request.types.includes('template')) {
      recommendations.push(...this.generateTemplateRecommendations(request));
    }

    if (request.session && (!request.types || request.types.includes('continuation'))) {
      recommendations.push(...this.generateContinuationRecommendations(request));
    }

    if (request.session && (!request.types || request.types.includes('improvement'))) {
      recommendations.push(...this.generateImprovementRecommendations(request));
    }

    // Sort by confidence and limit
    const sorted = recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
    const limited = request.limit ? sorted.slice(0, request.limit) : sorted;

    const highConfidenceCount = limited.filter(r => r.confidence === 'high').length;
    const summary = this.generateSummary(limited, highConfidenceCount);

    return {
      recommendations: limited,
      totalRecommendations: limited.length,
      highConfidenceCount,
      summary,
    };
  }

  /**
   * Generate mode recommendations
   */
  private generateModeRecommendations(request: RecommendationRequest): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const insights = this.successAnalyzer.getAllAnalyses();

    if (insights.length === 0) {
      return recommendations;
    }

    // Get mode performance from success insights
    const allInsights = this.successAnalyzer.analyzeAll?.();
    if (!allInsights || allInsights.modePerformance.size === 0) {
      return recommendations;
    }

    // Sort modes by performance
    const sortedModes = Array.from(allInsights.modePerformance.entries())
      .sort((a, b) => b[1].averageScore - a[1].averageScore)
      .filter(([, perf]) => perf.sessionCount >= 3); // Require minimum data

    // Apply preferences
    const filtered = sortedModes.filter(([mode]) => {
      if (request.context?.preferences?.avoidModes?.includes(mode)) {
        return false;
      }
      return true;
    });

    // Recommend top performing mode
    if (filtered.length > 0) {
      const [bestMode, bestPerf] = filtered[0];
      const confidence = bestPerf.averageScore >= 0.8 ? 'high' : bestPerf.averageScore >= 0.6 ? 'medium' : 'low';

      recommendations.push({
        id: `mode-${bestMode}`,
        type: 'mode',
        title: `Use ${bestMode} mode`,
        description: `${bestMode} mode has shown the best performance`,
        rationale: `Based on ${bestPerf.sessionCount} sessions, ${bestMode} achieves ${(bestPerf.averageScore * 100).toFixed(0)}% average success rate`,
        confidence,
        confidenceScore: bestPerf.averageScore,
        actionable: true,
        actions: [`Set mode to '${bestMode}' when starting the session`],
        expectedImprovement: Math.max(0, bestPerf.averageScore - 0.5),
        basedOn: {
          successFactors: ['mode'],
        },
      });
    }

    // Recommend domain-specific mode
    if (request.context?.domain) {
      const domainMode = this.suggestModeForDomain(request.context.domain);
      if (domainMode) {
        recommendations.push(domainMode);
      }
    }

    return recommendations;
  }

  /**
   * Generate structure recommendations
   */
  private generateStructureRecommendations(_request: RecommendationRequest): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const factors = this.successAnalyzer.getSuccessFactors();

    // Find structure-related success factors
    const structureFactors = factors.filter(f => f.category === 'structure');

    for (const factor of structureFactors) {
      if (Math.abs(factor.correlation) >= 0.5 && factor.significance >= 0.6) {
        const isPositive = factor.correlation > 0;
        const confidence = factor.significance >= 0.8 ? 'high' : factor.significance >= 0.6 ? 'medium' : 'low';

        recommendations.push({
          id: `structure-${factor.id}`,
          type: 'structure',
          title: `${isPositive ? 'Increase' : 'Reduce'} ${factor.name.toLowerCase()}`,
          description: factor.description,
          rationale: `${factor.name} ${isPositive ? 'positively' : 'negatively'} correlates with success (r=${factor.correlation.toFixed(2)})`,
          confidence,
          confidenceScore: factor.significance,
          actionable: true,
          actions: this.getStructureActions(factor, isPositive),
          expectedImprovement: Math.abs(factor.correlation) * factor.significance,
          basedOn: {
            successFactors: [factor.id],
          },
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate behavior recommendations
   */
  private generateBehaviorRecommendations(_request: RecommendationRequest): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const factors = this.successAnalyzer.getSuccessFactors();

    // Find behavior-related success factors
    const behaviorFactors = factors.filter(f => f.category === 'behavior');

    for (const factor of behaviorFactors) {
      if (Math.abs(factor.correlation) >= 0.4 && factor.significance >= 0.5) {
        const isPositive = factor.correlation > 0;
        const confidence = factor.significance >= 0.7 ? 'high' : factor.significance >= 0.5 ? 'medium' : 'low';

        recommendations.push({
          id: `behavior-${factor.id}`,
          type: 'behavior',
          title: `${isPositive ? 'Continue' : 'Reduce'} ${factor.name.toLowerCase()}`,
          description: factor.description,
          rationale: `${factor.name} shows ${Math.abs(factor.correlation).toFixed(0)}% correlation with success`,
          confidence,
          confidenceScore: factor.significance,
          actionable: true,
          actions: this.getBehaviorActions(factor, isPositive),
          expectedImprovement: Math.abs(factor.correlation) * 0.7,
          basedOn: {
            successFactors: [factor.id],
          },
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate template recommendations
   */
  private generateTemplateRecommendations(_request: RecommendationRequest): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Suggest templates based on patterns
    const patterns = this.patternRecognizer.getPatterns();
    const highConfidencePatterns = patterns.filter(
      p => p.confidence >= 0.7 && p.frequency >= 5
    );

    for (const pattern of highConfidencePatterns.slice(0, 2)) {
      if (pattern.type === 'sequence' || pattern.type === 'structure') {
        recommendations.push({
          id: `template-${pattern.id}`,
          type: 'template',
          title: `Use proven ${pattern.type} pattern`,
          description: pattern.description,
          rationale: `This ${pattern.type} pattern appears in ${pattern.frequency} successful sessions with ${(pattern.confidence * 100).toFixed(0)}% confidence`,
          confidence: pattern.confidence >= 0.8 ? 'high' : 'medium',
          confidenceScore: pattern.confidence,
          actionable: true,
          actions: [
            `Follow the ${pattern.name} pattern`,
            'Structure your reasoning similarly to successful examples',
          ],
          expectedImprovement: pattern.confidence * 0.3,
          basedOn: {
            patterns: [pattern.id],
          },
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate continuation recommendations
   */
  private generateContinuationRecommendations(request: RecommendationRequest): Recommendation[] {
    if (!request.session) return [];

    const recommendations: Recommendation[] = [];
    const session = request.session;

    // Analyze current session
    const analysis = this.successAnalyzer.analyzeSession(session);

    // Recognize patterns in current session
    const recognizedPatterns = this.patternRecognizer.recognize(session);

    // Check if session is on track
    if (analysis.overallScore < 0.5) {
      recommendations.push({
        id: 'continuation-course-correct',
        type: 'continuation',
        title: 'Course correction suggested',
        description: 'Current approach may not lead to optimal results',
        rationale: `Session score is ${(analysis.overallScore * 100).toFixed(0)}%, below the 50% threshold`,
        confidence: 'high',
        confidenceScore: 0.8,
        actionable: true,
        actions: analysis.recommendations,
        expectedImprovement: 0.3,
        basedOn: {
          metrics: analysis.metrics.map(m => m.id),
        },
      });
    }

    // Suggest continuing with recognized successful patterns
    for (const pattern of recognizedPatterns.slice(0, 1)) {
      if (pattern.confidence >= 0.7) {
        recommendations.push({
          id: 'continuation-pattern',
          type: 'continuation',
          title: `Continue with ${pattern.name}`,
          description: pattern.description,
          rationale: `You're following a successful pattern seen in ${pattern.frequency} sessions`,
          confidence: 'high',
          confidenceScore: pattern.confidence,
          actionable: true,
          actions: [
            'Maintain current reasoning approach',
            'Continue building on established foundations',
          ],
          expectedImprovement: 0.15,
          basedOn: {
            patterns: [pattern.id],
          },
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate improvement recommendations
   */
  private generateImprovementRecommendations(request: RecommendationRequest): Recommendation[] {
    if (!request.session) return [];

    const recommendations: Recommendation[] = [];
    const session = request.session;

    // Analyze current session
    const analysis = this.successAnalyzer.analyzeSession(session);

    // Find similar successful sessions
    const similar = this.successAnalyzer.findSimilarSuccessful(session.id, 3);

    if (similar.length > 0) {
      const similarAnalyses = similar
        .map(s => this.successAnalyzer.getAnalysis(s.id))
        .filter(a => a !== undefined) as SuccessAnalysis[];

      const avgScore = similarAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / similarAnalyses.length;

      recommendations.push({
        id: 'improvement-learn-from-similar',
        type: 'improvement',
        title: 'Learn from similar successful sessions',
        description: `${similar.length} similar sessions achieved higher success`,
        rationale: `Similar sessions average ${(avgScore * 100).toFixed(0)}% vs your current ${(analysis.overallScore * 100).toFixed(0)}%`,
        confidence: 'medium',
        confidenceScore: 0.7,
        actionable: true,
        actions: [
          'Review similar successful sessions',
          'Adopt their successful strategies',
        ],
        expectedImprovement: Math.max(0, avgScore - analysis.overallScore),
        basedOn: {
          similarSessions: similar.map(s => s.id),
        },
      });
    }

    // Address weaknesses
    for (const weakness of analysis.weaknesses.slice(0, 2)) {
      const metricName = weakness.split(':')[0].replace('Low ', '');

      recommendations.push({
        id: `improvement-${metricName.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'improvement',
        title: `Improve ${metricName.toLowerCase()}`,
        description: weakness,
        rationale: 'Addressing this weakness will improve overall success',
        confidence: 'medium',
        confidenceScore: 0.6,
        actionable: true,
        actions: analysis.recommendations.filter(r =>
          r.toLowerCase().includes(metricName.toLowerCase())
        ).slice(0, 2),
        expectedImprovement: 0.2,
        basedOn: {
          metrics: [metricName.toLowerCase().replace(/\s+/g, '_')],
        },
      });
    }

    return recommendations;
  }

  /**
   * Suggest mode for domain
   */
  private suggestModeForDomain(domain: string): Recommendation | null {
    const domainLower = domain.toLowerCase();

    // Domain-to-mode mapping
    const modeMap: Record<string, { mode: string; rationale: string }> = {
      'mathematics': { mode: 'mathematics', rationale: 'Formal mathematical reasoning' },
      'math': { mode: 'mathematics', rationale: 'Formal mathematical reasoning' },
      'physics': { mode: 'physics', rationale: 'Tensor-based physical reasoning' },
      'science': { mode: 'scientific', rationale: 'Hypothesis-driven scientific method' },
      'engineering': { mode: 'shannon', rationale: 'Systematic problem-solving approach' },
      'logic': { mode: 'formallogic', rationale: 'Rigorous logical analysis' },
      'systems': { mode: 'systemsthinking', rationale: 'Holistic systems analysis' },
      'optimization': { mode: 'optimization', rationale: 'Constraint satisfaction and optimization' },
      'probability': { mode: 'bayesian', rationale: 'Probabilistic reasoning with evidence' },
      'causality': { mode: 'causal', rationale: 'Cause-effect relationship analysis' },
      'game': { mode: 'gametheory', rationale: 'Strategic game-theoretic analysis' },
    };

    for (const [key, value] of Object.entries(modeMap)) {
      if (domainLower.includes(key)) {
        return {
          id: `mode-domain-${value.mode}`,
          type: 'mode',
          title: `Use ${value.mode} mode for ${domain}`,
          description: value.rationale,
          rationale: `${value.mode} mode is optimized for ${domain} problems`,
          confidence: 'high',
          confidenceScore: 0.85,
          actionable: true,
          actions: [`Set mode to '${value.mode}'`],
          expectedImprovement: 0.25,
          basedOn: {},
        };
      }
    }

    return null;
  }

  /**
   * Get structure-related actions
   */
  private getStructureActions(factor: SuccessFactor, increase: boolean): string[] {
    const actions: string[] = [];

    if (factor.id === 'thought_count') {
      if (increase) {
        actions.push('Explore the problem more thoroughly');
        actions.push('Break down complex ideas into smaller thoughts');
      } else {
        actions.push('Be more concise in your reasoning');
        actions.push('Combine related thoughts');
      }
    } else if (factor.id === 'dependency_depth') {
      if (increase) {
        actions.push('Build deeper chains of reasoning');
        actions.push('Reference previous thoughts more often');
      } else {
        actions.push('Simplify reasoning chains');
        actions.push('Reduce unnecessary dependencies');
      }
    }

    return actions;
  }

  /**
   * Get behavior-related actions
   */
  private getBehaviorActions(factor: SuccessFactor, continue_: boolean): string[] {
    const actions: string[] = [];

    if (factor.id === 'revision_count') {
      if (continue_) {
        actions.push('Continue revising and refining ideas');
        actions.push('Question initial assumptions');
      } else {
        actions.push('Reduce excessive revisions');
        actions.push('Plan more before executing');
      }
    } else if (factor.id === 'time_spent') {
      if (continue_) {
        actions.push('Take time for thorough analysis');
        actions.push('Don\'t rush to conclusions');
      } else {
        actions.push('Be more efficient in reasoning');
        actions.push('Focus on key insights');
      }
    }

    return actions;
  }

  /**
   * Generate summary of recommendations
   */
  private generateSummary(recommendations: Recommendation[], highConfidenceCount: number): string {
    if (recommendations.length === 0) {
      return 'No recommendations available. Train the engine with more session data.';
    }

    const byType = new Map<RecommendationType, number>();
    for (const rec of recommendations) {
      byType.set(rec.type, (byType.get(rec.type) || 0) + 1);
    }

    const parts: string[] = [];
    parts.push(`${recommendations.length} recommendation${recommendations.length !== 1 ? 's' : ''} generated`);

    if (highConfidenceCount > 0) {
      parts.push(`${highConfidenceCount} with high confidence`);
    }

    const topType = Array.from(byType.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topType) {
      parts.push(`focusing on ${topType[0]} improvements`);
    }

    return parts.join(', ') + '.';
  }

  /**
   * Get training statistics
   */
  getTrainingStats(): {
    sessionCount: number;
    patternCount: number;
    analysisCount: number;
    successFactorCount: number;
  } {
    return {
      sessionCount: this.trainedSessions.length,
      patternCount: this.patternRecognizer.getPatterns().length,
      analysisCount: this.successAnalyzer.getAllAnalyses().length,
      successFactorCount: this.successAnalyzer.getSuccessFactors().length,
    };
  }
}
