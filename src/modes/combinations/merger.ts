/**
 * Insight Merger - Phase 12 Sprint 3
 *
 * Merges insights from multiple reasoning modes using various strategies.
 */

import { randomUUID } from 'crypto';
import type { ThinkingMode } from '../../types/core.js';
import type {
  Insight,
  MergeStrategy,
  WeightedMergeConfig,
  HierarchicalMergeConfig,
  DialecticalMergeConfig,
  MergeStatistics,
  ConflictingInsight,
} from './combination-types.js';

/**
 * Configuration for the merger
 */
export interface InsightMergerConfig {
  /** Similarity threshold for deduplication (0-1) */
  similarityThreshold?: number;
  /** Minimum confidence to include insight */
  minConfidence?: number;
  /** Whether to preserve all original insights */
  preserveOriginals?: boolean;
}

/**
 * Result of a merge operation
 */
export interface MergeResult {
  /** Merged insights */
  insights: Insight[];
  /** Detected conflicts (to be resolved by ConflictResolver) */
  conflicts: ConflictingInsight[];
  /** Statistics about the merge */
  statistics: MergeStatistics;
}

/**
 * InsightMerger - Combines insights from multiple modes
 */
export class InsightMerger {
  private config: Required<InsightMergerConfig>;

  constructor(config: InsightMergerConfig = {}) {
    this.config = {
      similarityThreshold: config.similarityThreshold ?? 0.8,
      minConfidence: config.minConfidence ?? 0.3,
      preserveOriginals: config.preserveOriginals ?? false,
    };
  }

  /**
   * Merge insights using the specified strategy
   */
  merge(
    insightsByMode: Map<ThinkingMode, Insight[]>,
    strategy: MergeStrategy,
    strategyConfig?:
      | WeightedMergeConfig
      | HierarchicalMergeConfig
      | DialecticalMergeConfig
  ): MergeResult {
    const startTime = Date.now();
    const allInsights = this.flattenInsights(insightsByMode);

    let result: MergeResult;

    switch (strategy) {
      case 'union':
        result = this.mergeUnion(allInsights);
        break;
      case 'intersection':
        result = this.mergeIntersection(insightsByMode);
        break;
      case 'weighted':
        result = this.mergeWeighted(
          insightsByMode,
          strategyConfig as WeightedMergeConfig
        );
        break;
      case 'hierarchical':
        result = this.mergeHierarchical(
          insightsByMode,
          strategyConfig as HierarchicalMergeConfig
        );
        break;
      case 'dialectical':
        result = this.mergeDialectical(
          insightsByMode,
          strategyConfig as DialecticalMergeConfig
        );
        break;
      default:
        result = this.mergeUnion(allInsights);
    }

    // Update merge time in statistics
    result.statistics.mergeTime = Date.now() - startTime;

    return result;
  }

  /**
   * Union merge: Combine all insights, deduplicate
   */
  private mergeUnion(allInsights: Insight[]): MergeResult {
    const totalBefore = allInsights.length;
    const conflicts: ConflictingInsight[] = [];

    // Deduplicate similar insights
    const { unique, duplicatesRemoved } = this.deduplicateInsights(allInsights);

    // Filter by minimum confidence
    const filtered = unique.filter(
      (i) => i.confidence >= this.config.minConfidence
    );

    // Detect conflicts among remaining insights
    const detectedConflicts = this.detectConflicts(filtered);
    conflicts.push(...detectedConflicts);

    return {
      insights: filtered,
      conflicts,
      statistics: this.createStatistics(
        totalBefore,
        filtered.length,
        duplicatesRemoved,
        conflicts.length
      ),
    };
  }

  /**
   * Intersection merge: Only keep insights agreed upon by multiple modes
   */
  private mergeIntersection(
    insightsByMode: Map<ThinkingMode, Insight[]>
  ): MergeResult {
    const allInsights = this.flattenInsights(insightsByMode);
    const totalBefore = allInsights.length;
    const conflicts: ConflictingInsight[] = [];

    // Group similar insights
    const groups = this.groupSimilarInsights(allInsights);

    // Only keep insights that appear in multiple modes
    const intersected: Insight[] = [];
    let duplicatesRemoved = 0;

    for (const group of groups) {
      const uniqueModes = new Set(group.map((i) => i.sourceMode));
      if (uniqueModes.size >= 2) {
        // Merge the group into a single insight
        const merged = this.mergeInsightGroup(group);
        intersected.push(merged);
        duplicatesRemoved += group.length - 1;
      } else {
        duplicatesRemoved += group.length;
      }
    }

    // Filter by confidence
    const filtered = intersected.filter(
      (i) => i.confidence >= this.config.minConfidence
    );

    return {
      insights: filtered,
      conflicts,
      statistics: this.createStatistics(
        totalBefore,
        filtered.length,
        duplicatesRemoved,
        0
      ),
    };
  }

  /**
   * Weighted merge: Weight insights by mode confidence
   */
  private mergeWeighted(
    insightsByMode: Map<ThinkingMode, Insight[]>,
    config?: WeightedMergeConfig
  ): MergeResult {
    const allInsights = this.flattenInsights(insightsByMode);
    const totalBefore = allInsights.length;
    const conflicts: ConflictingInsight[] = [];

    const defaultWeight = config?.defaultWeight ?? 0.6;
    const threshold = config?.threshold ?? 0.5;

    // Apply weights to insight confidence
    const weightedInsights = allInsights.map((insight) => {
      const weight =
        config?.weights?.get(insight.sourceMode) ?? defaultWeight;
      return {
        ...insight,
        confidence: insight.confidence * weight,
      };
    });

    // Deduplicate and combine
    const groups = this.groupSimilarInsights(weightedInsights);
    const merged: Insight[] = [];
    let duplicatesRemoved = 0;

    for (const group of groups) {
      if (group.length > 1) {
        // Combine weighted confidences
        const combinedConfidence = Math.min(
          1,
          group.reduce((sum, i) => sum + i.confidence, 0) / group.length
        );
        const merged_insight = this.mergeInsightGroup(group);
        merged_insight.confidence = combinedConfidence;
        if (combinedConfidence >= threshold) {
          merged.push(merged_insight);
        }
        duplicatesRemoved += group.length - 1;
      } else if (group[0].confidence >= threshold) {
        merged.push(group[0]);
      }
    }

    // Detect conflicts
    const detectedConflicts = this.detectConflicts(merged);
    conflicts.push(...detectedConflicts);

    return {
      insights: merged,
      conflicts,
      statistics: this.createStatistics(
        totalBefore,
        merged.length,
        duplicatesRemoved,
        conflicts.length
      ),
    };
  }

  /**
   * Hierarchical merge: Primary mode with supporting modes
   */
  private mergeHierarchical(
    insightsByMode: Map<ThinkingMode, Insight[]>,
    config?: HierarchicalMergeConfig
  ): MergeResult {
    const allInsights = this.flattenInsights(insightsByMode);
    const totalBefore = allInsights.length;
    const conflicts: ConflictingInsight[] = [];

    if (!config) {
      // Fall back to union if no config
      return this.mergeUnion(allInsights);
    }

    const primaryInsights = insightsByMode.get(config.primaryMode) || [];
    const supportingInsights: Insight[] = [];

    for (const mode of config.supportingModes) {
      const modeInsights = insightsByMode.get(mode) || [];
      supportingInsights.push(...modeInsights);
    }

    // Start with primary insights
    const result = [...primaryInsights];
    let duplicatesRemoved = 0;

    // Check supporting insights for additions or overrides
    for (const supporting of supportingInsights) {
      const similar = this.findSimilar(supporting, result);

      if (!similar) {
        // New insight from supporting mode
        result.push({
          ...supporting,
          evidence: [
            ...(supporting.evidence || []),
            `Supporting insight from ${supporting.sourceMode}`,
          ],
        });
      } else if (config.allowOverride) {
        // Check if enough support to override
        const supportCount = supportingInsights.filter((s) =>
          this.areSimilar(s, supporting)
        ).length;

        if (supportCount >= config.overrideThreshold) {
          // Record conflict
          conflicts.push({
            insight1: {
              mode: similar.sourceMode,
              content: similar.content,
              confidence: similar.confidence,
              insightId: similar.id,
            },
            insight2: {
              mode: supporting.sourceMode,
              content: supporting.content,
              confidence: supporting.confidence,
              insightId: supporting.id,
            },
            conflictType: 'confidence_mismatch',
            severity: Math.abs(similar.confidence - supporting.confidence),
          });
        }
        duplicatesRemoved++;
      } else {
        duplicatesRemoved++;
      }
    }

    // Filter by confidence
    const filtered = result.filter(
      (i) => i.confidence >= this.config.minConfidence
    );

    return {
      insights: filtered,
      conflicts,
      statistics: this.createStatistics(
        totalBefore,
        filtered.length,
        duplicatesRemoved,
        conflicts.length
      ),
    };
  }

  /**
   * Dialectical merge: Thesis/antithesis/synthesis
   */
  private mergeDialectical(
    insightsByMode: Map<ThinkingMode, Insight[]>,
    config?: DialecticalMergeConfig
  ): MergeResult {
    const allInsights = this.flattenInsights(insightsByMode);
    const totalBefore = allInsights.length;
    const conflicts: ConflictingInsight[] = [];

    if (!config) {
      return this.mergeUnion(allInsights);
    }

    const thesisInsights = insightsByMode.get(config.thesisMode) || [];
    const antithesisInsights = insightsByMode.get(config.antithesisMode) || [];
    const synthesisInsights: Insight[] = [];

    // Collect synthesis insights if modes specified
    if (config.synthesisModes) {
      for (const mode of config.synthesisModes) {
        synthesisInsights.push(...(insightsByMode.get(mode) || []));
      }
    }

    const result: Insight[] = [];
    let duplicatesRemoved = 0;

    // Process thesis/antithesis pairs
    for (const thesis of thesisInsights) {
      const antithesis = this.findContradicting(thesis, antithesisInsights);

      if (antithesis) {
        // Record conflict
        conflicts.push({
          insight1: {
            mode: thesis.sourceMode,
            content: thesis.content,
            confidence: thesis.confidence,
            insightId: thesis.id,
          },
          insight2: {
            mode: antithesis.sourceMode,
            content: antithesis.content,
            confidence: antithesis.confidence,
            insightId: antithesis.id,
          },
          conflictType: 'direct_contradiction',
          severity: 0.8,
        });

        // Look for synthesis
        const synthesis = this.findSynthesis(thesis, antithesis, synthesisInsights);
        if (synthesis) {
          result.push({
            ...synthesis,
            evidence: [
              `Synthesis of thesis: "${thesis.content.substring(0, 50)}..."`,
              `And antithesis: "${antithesis.content.substring(0, 50)}..."`,
              ...(synthesis.evidence || []),
            ],
            category: 'synthesis',
          });
        } else {
          // Auto-generate synthesis
          result.push({
            id: randomUUID(),
            content: `Considering both "${thesis.content.substring(0, 30)}..." and "${antithesis.content.substring(0, 30)}...", a balanced view suggests examining both perspectives.`,
            sourceMode: config.thesisMode, // Attribute to thesis mode
            confidence: (thesis.confidence + antithesis.confidence) / 2,
            evidence: [
              `Thesis: ${thesis.content}`,
              `Antithesis: ${antithesis.content}`,
            ],
            timestamp: new Date(),
            category: 'auto_synthesis',
          });
        }

        // Preserve originals if configured
        if (config.preserveOriginals) {
          result.push({
            ...thesis,
            category: 'thesis',
          });
          result.push({
            ...antithesis,
            category: 'antithesis',
          });
        }
        duplicatesRemoved += 2;
      } else {
        // No antithesis found, keep thesis as is
        result.push(thesis);
      }
    }

    // Add remaining antithesis insights that didn't have matching thesis
    for (const antithesis of antithesisInsights) {
      const hasMatchingThesis = thesisInsights.some((t) =>
        this.areContradicting(t, antithesis)
      );
      if (!hasMatchingThesis) {
        result.push(antithesis);
      }
    }

    // Filter by confidence
    const filtered = result.filter(
      (i) => i.confidence >= this.config.minConfidence
    );

    return {
      insights: filtered,
      conflicts,
      statistics: this.createStatistics(
        totalBefore,
        filtered.length,
        duplicatesRemoved,
        conflicts.length
      ),
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Flatten insights from all modes into a single array
   */
  private flattenInsights(insightsByMode: Map<ThinkingMode, Insight[]>): Insight[] {
    const all: Insight[] = [];
    for (const insights of insightsByMode.values()) {
      all.push(...insights);
    }
    return all;
  }

  /**
   * Deduplicate similar insights
   */
  private deduplicateInsights(insights: Insight[]): {
    unique: Insight[];
    duplicatesRemoved: number;
  } {
    const groups = this.groupSimilarInsights(insights);
    const unique: Insight[] = [];
    let duplicatesRemoved = 0;

    for (const group of groups) {
      if (group.length > 1) {
        unique.push(this.mergeInsightGroup(group));
        duplicatesRemoved += group.length - 1;
      } else {
        unique.push(group[0]);
      }
    }

    return { unique, duplicatesRemoved };
  }

  /**
   * Group similar insights together
   */
  private groupSimilarInsights(insights: Insight[]): Insight[][] {
    const groups: Insight[][] = [];
    const assigned = new Set<string>();

    for (const insight of insights) {
      if (assigned.has(insight.id)) continue;

      const group = [insight];
      assigned.add(insight.id);

      for (const other of insights) {
        if (assigned.has(other.id)) continue;
        if (this.areSimilar(insight, other)) {
          group.push(other);
          assigned.add(other.id);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Check if two insights are similar
   */
  private areSimilar(a: Insight, b: Insight): boolean {
    return this.calculateSimilarity(a.content, b.content) >= this.config.similarityThreshold;
  }

  /**
   * Calculate text similarity (simplified Jaccard)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Find a similar insight in a list
   */
  private findSimilar(insight: Insight, list: Insight[]): Insight | undefined {
    return list.find((i) => this.areSimilar(insight, i));
  }

  /**
   * Merge a group of similar insights into one
   */
  private mergeInsightGroup(group: Insight[]): Insight {
    // Use the highest confidence insight as base
    const sorted = [...group].sort((a, b) => b.confidence - a.confidence);
    const base = sorted[0];

    // Combine evidence from all
    const allEvidence = new Set<string>();
    const allModes = new Set<ThinkingMode>();

    for (const insight of group) {
      allModes.add(insight.sourceMode);
      insight.evidence?.forEach((e) => allEvidence.add(e));
    }

    return {
      ...base,
      id: randomUUID(),
      evidence: [...allEvidence],
      relatedInsights: group.map((i) => i.id),
      confidence: Math.min(1, base.confidence * (1 + (group.length - 1) * 0.1)),
    };
  }

  /**
   * Detect conflicts between insights
   */
  private detectConflicts(insights: Insight[]): ConflictingInsight[] {
    const conflicts: ConflictingInsight[] = [];

    for (let i = 0; i < insights.length; i++) {
      for (let j = i + 1; j < insights.length; j++) {
        if (this.areContradicting(insights[i], insights[j])) {
          conflicts.push({
            insight1: {
              mode: insights[i].sourceMode,
              content: insights[i].content,
              confidence: insights[i].confidence,
              insightId: insights[i].id,
            },
            insight2: {
              mode: insights[j].sourceMode,
              content: insights[j].content,
              confidence: insights[j].confidence,
              insightId: insights[j].id,
            },
            conflictType: 'direct_contradiction',
            severity: 0.7,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two insights are contradicting
   */
  private areContradicting(a: Insight, b: Insight): boolean {
    const contentA = a.content.toLowerCase();
    const contentB = b.content.toLowerCase();

    // Simple contradiction detection via negation patterns
    const negationPatterns = [
      { pos: /\bis\b/, neg: /\bis not\b|\bisn't\b/ },
      { pos: /\bcan\b/, neg: /\bcannot\b|\bcan't\b/ },
      { pos: /\bwill\b/, neg: /\bwill not\b|\bwon't\b/ },
      { pos: /\bshould\b/, neg: /\bshould not\b|\bshouldn't\b/ },
      { pos: /\btrue\b/, neg: /\bfalse\b/ },
      { pos: /\byes\b/, neg: /\bno\b/ },
      { pos: /\bincrease\b/, neg: /\bdecrease\b/ },
      { pos: /\bhigh\b/, neg: /\blow\b/ },
    ];

    for (const pattern of negationPatterns) {
      if (
        (pattern.pos.test(contentA) && pattern.neg.test(contentB)) ||
        (pattern.neg.test(contentA) && pattern.pos.test(contentB))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find a contradicting insight
   */
  private findContradicting(
    insight: Insight,
    candidates: Insight[]
  ): Insight | undefined {
    return candidates.find((c) => this.areContradicting(insight, c));
  }

  /**
   * Find a synthesis insight that bridges thesis and antithesis
   */
  private findSynthesis(
    thesis: Insight,
    antithesis: Insight,
    candidates: Insight[]
  ): Insight | undefined {
    // Look for an insight that references both or has high similarity to both
    return candidates.find((c) => {
      const simToThesis = this.calculateSimilarity(c.content, thesis.content);
      const simToAntithesis = this.calculateSimilarity(c.content, antithesis.content);
      // A good synthesis should have moderate similarity to both
      return simToThesis > 0.3 && simToAntithesis > 0.3;
    });
  }

  /**
   * Create merge statistics
   */
  private createStatistics(
    totalBefore: number,
    totalAfter: number,
    duplicatesRemoved: number,
    conflictsDetected: number
  ): MergeStatistics {
    return {
      totalInsightsBefore: totalBefore,
      totalInsightsAfter: totalAfter,
      duplicatesRemoved,
      conflictsDetected,
      conflictsResolved: 0, // Will be updated by conflict resolver
      averageConfidence: 0, // Will be calculated after merge
      mergeTime: 0, // Will be set by caller
    };
  }
}
