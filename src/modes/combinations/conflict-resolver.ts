/**
 * Conflict Resolver - Phase 12 Sprint 3
 *
 * Detects and resolves conflicts between insights from different reasoning modes.
 */

import { randomUUID } from 'crypto';
import type {
  Insight,
  ConflictingInsight,
  ConflictResolution,
  ConflictType,
} from './combination-types.js';

/**
 * Configuration for conflict resolution
 */
export interface ConflictResolverConfig {
  /** Default resolution strategy */
  defaultStrategy?: ConflictResolution['resolutionStrategy'];
  /** Minimum confidence difference to favor one insight */
  confidenceThreshold?: number;
  /** Whether to always preserve both conflicting insights */
  alwaysPreserveBoth?: boolean;
  /** Custom resolution rules by conflict type */
  customRules?: Map<ConflictType, ConflictResolution['resolutionStrategy']>;
}

/**
 * Result of conflict resolution
 */
export interface ResolutionResult {
  /** Original conflict */
  conflict: ConflictingInsight;
  /** Resolution applied */
  resolution: ConflictResolution;
  /** Any new insights created during resolution */
  newInsights: Insight[];
}

/**
 * ConflictResolver - Detects and resolves conflicting insights
 */
export class ConflictResolver {
  private config: Required<ConflictResolverConfig>;

  constructor(config: ConflictResolverConfig = {}) {
    this.config = {
      defaultStrategy: config.defaultStrategy ?? 'favor_higher_confidence',
      confidenceThreshold: config.confidenceThreshold ?? 0.2,
      alwaysPreserveBoth: config.alwaysPreserveBoth ?? false,
      customRules: config.customRules ?? new Map(),
    };
  }

  /**
   * Detect conflicts between a set of insights
   */
  detectConflicts(insights: Insight[]): ConflictingInsight[] {
    const conflicts: ConflictingInsight[] = [];

    for (let i = 0; i < insights.length; i++) {
      for (let j = i + 1; j < insights.length; j++) {
        const conflict = this.analyzeConflict(insights[i], insights[j]);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  /**
   * Analyze two insights for potential conflicts
   */
  analyzeConflict(a: Insight, b: Insight): ConflictingInsight | null {
    // Skip if from same mode
    if (a.sourceMode === b.sourceMode) {
      return null;
    }

    // Check for direct contradiction
    const contradiction = this.checkDirectContradiction(a, b);
    if (contradiction) {
      return this.createConflict(a, b, 'direct_contradiction', 0.9);
    }

    // Check for partial overlap
    const overlap = this.checkPartialOverlap(a, b);
    if (overlap) {
      return this.createConflict(a, b, 'partial_overlap', 0.5);
    }

    // Check for scope difference
    const scopeDiff = this.checkScopeDifference(a, b);
    if (scopeDiff) {
      return this.createConflict(a, b, 'scope_difference', 0.3);
    }

    // Check for confidence mismatch
    const confMismatch = this.checkConfidenceMismatch(a, b);
    if (confMismatch) {
      return this.createConflict(a, b, 'confidence_mismatch', 0.4);
    }

    // Check for evidence conflict
    const evidenceConflict = this.checkEvidenceConflict(a, b);
    if (evidenceConflict) {
      return this.createConflict(a, b, 'evidence_conflict', 0.6);
    }

    return null;
  }

  /**
   * Resolve a single conflict
   */
  resolveConflict(conflict: ConflictingInsight): ResolutionResult {
    // Determine strategy
    const strategy = this.determineStrategy(conflict);

    // Apply resolution
    let resolution: ConflictResolution;
    const newInsights: Insight[] = [];

    switch (strategy) {
      case 'favor_higher_confidence':
        resolution = this.resolveByConfidence(conflict);
        break;
      case 'synthesize':
        const { resolved, synthesized } = this.resolveBySynthesis(conflict);
        resolution = resolved;
        if (synthesized) {
          newInsights.push(synthesized);
        }
        break;
      case 'preserve_both':
        resolution = this.resolveByPreservingBoth(conflict);
        break;
      case 'defer':
        resolution = this.resolveByDefer(conflict);
        break;
      default:
        resolution = this.resolveByConfidence(conflict);
    }

    // Update conflict with resolution
    conflict.resolution = resolution;

    return {
      conflict,
      resolution,
      newInsights,
    };
  }

  /**
   * Resolve all conflicts in a list
   */
  resolveAll(conflicts: ConflictingInsight[]): ResolutionResult[] {
    return conflicts.map((c) => this.resolveConflict(c));
  }

  /**
   * Apply resolutions to update insight list
   */
  applyResolutions(
    insights: Insight[],
    resolutions: ResolutionResult[]
  ): Insight[] {
    const toRemove = new Set<string>();
    const toAdd: Insight[] = [];

    for (const result of resolutions) {
      const strategy = result.resolution.resolutionStrategy;

      if (strategy === 'favor_higher_confidence') {
        // Remove the lower confidence insight
        const conf1 = result.conflict.insight1.confidence;
        const conf2 = result.conflict.insight2.confidence;
        const loser = conf1 < conf2
          ? result.conflict.insight1.insightId
          : result.conflict.insight2.insightId;
        toRemove.add(loser);
      } else if (strategy === 'synthesize') {
        // Remove both, add synthesized
        toRemove.add(result.conflict.insight1.insightId);
        toRemove.add(result.conflict.insight2.insightId);
        toAdd.push(...result.newInsights);
      }
      // preserve_both and defer: no changes needed
    }

    // Apply changes
    const updated = insights.filter((i) => !toRemove.has(i.id));
    updated.push(...toAdd);

    return updated;
  }

  // ============================================================================
  // CONFLICT DETECTION METHODS
  // ============================================================================

  /**
   * Check for direct contradiction between insights
   */
  private checkDirectContradiction(a: Insight, b: Insight): boolean {
    const contentA = a.content.toLowerCase();
    const contentB = b.content.toLowerCase();

    // Negation patterns
    const negationPairs = [
      [/\bis\b/, /\bis not\b|\bisn't\b|\bis never\b/],
      [/\bcan\b/, /\bcannot\b|\bcan't\b|\bcan never\b/],
      [/\bwill\b/, /\bwill not\b|\bwon't\b/],
      [/\bshould\b/, /\bshould not\b|\bshouldn't\b/],
      [/\bmust\b/, /\bmust not\b|\bmustn't\b/],
      [/\btrue\b/, /\bfalse\b|\buntrue\b/],
      [/\bcorrect\b/, /\bincorrect\b|\bwrong\b/],
      [/\byes\b/, /\bno\b/],
      [/\balways\b/, /\bnever\b/],
      [/\bevery\b/, /\bnone\b|\bno\b/],
      [/\bincrease\b|\brise\b|\bgrow\b/, /\bdecrease\b|\bfall\b|\bshrink\b/],
      [/\bhigh\b|\blarge\b/, /\blow\b|\bsmall\b/],
      [/\bpositive\b/, /\bnegative\b/],
      [/\bsuccess\b/, /\bfailure\b|\bfail\b/],
    ];

    for (const [posPattern, negPattern] of negationPairs) {
      // Check if A has positive and B has negative (or vice versa)
      if (
        (posPattern.test(contentA) && negPattern.test(contentB)) ||
        (negPattern.test(contentA) && posPattern.test(contentB))
      ) {
        // Additional check: ensure they're about the same topic
        const similarity = this.calculateSimilarity(contentA, contentB);
        if (similarity > 0.3) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for partial overlap requiring reconciliation
   */
  private checkPartialOverlap(a: Insight, b: Insight): boolean {
    const similarity = this.calculateSimilarity(a.content, b.content);

    // Partial overlap: similar topic but different conclusions
    if (similarity > 0.4 && similarity < 0.8) {
      // Check if conclusions differ
      const conclusionA = this.extractConclusion(a.content);
      const conclusionB = this.extractConclusion(b.content);

      if (conclusionA && conclusionB) {
        const conclusionSim = this.calculateSimilarity(conclusionA, conclusionB);
        return conclusionSim < 0.5;
      }
    }

    return false;
  }

  /**
   * Check for scope difference (same topic, different granularity)
   */
  private checkScopeDifference(a: Insight, b: Insight): boolean {
    const contentA = a.content.toLowerCase();
    const contentB = b.content.toLowerCase();

    // Scope indicators
    const broadIndicators = /\bin general\b|\boverall\b|\btypically\b|\busually\b|\bmost\b|\ball\b/;
    const narrowIndicators = /\bspecifically\b|\bin this case\b|\bfor this\b|\bhere\b|\bsome\b|\bfew\b/;

    const aIsBroad = broadIndicators.test(contentA);
    const aIsNarrow = narrowIndicators.test(contentA);
    const bIsBroad = broadIndicators.test(contentB);
    const bIsNarrow = narrowIndicators.test(contentB);

    // Scope mismatch if one is broad and one is narrow
    if ((aIsBroad && bIsNarrow) || (aIsNarrow && bIsBroad)) {
      // Verify they're about the same topic
      const similarity = this.calculateSimilarity(a.content, b.content);
      return similarity > 0.3;
    }

    return false;
  }

  /**
   * Check for confidence mismatch on similar conclusions
   */
  private checkConfidenceMismatch(a: Insight, b: Insight): boolean {
    const similarity = this.calculateSimilarity(a.content, b.content);

    // Similar content but very different confidence
    if (similarity > 0.7) {
      const confDiff = Math.abs(a.confidence - b.confidence);
      return confDiff > this.config.confidenceThreshold * 2;
    }

    return false;
  }

  /**
   * Check for evidence conflict
   */
  private checkEvidenceConflict(a: Insight, b: Insight): boolean {
    if (!a.evidence?.length || !b.evidence?.length) {
      return false;
    }

    // Check if evidences contradict each other
    for (const evA of a.evidence) {
      for (const evB of b.evidence) {
        const evALower = evA.toLowerCase();
        const evBLower = evB.toLowerCase();

        // Simple contradiction check in evidence
        if (
          (evALower.includes('because') && evBLower.includes('because')) ||
          (evALower.includes('due to') && evBLower.includes('due to'))
        ) {
          // Both have causal explanations - check if they conflict
          if (this.checkDirectContradiction(
            { ...a, content: evA },
            { ...b, content: evB }
          )) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // ============================================================================
  // RESOLUTION METHODS
  // ============================================================================

  /**
   * Determine resolution strategy for a conflict
   */
  private determineStrategy(
    conflict: ConflictingInsight
  ): ConflictResolution['resolutionStrategy'] {
    // Check custom rules first
    const customRule = this.config.customRules.get(conflict.conflictType);
    if (customRule) {
      return customRule;
    }

    // Always preserve both if configured
    if (this.config.alwaysPreserveBoth) {
      return 'preserve_both';
    }

    // Strategy based on conflict type
    switch (conflict.conflictType) {
      case 'direct_contradiction':
        // For direct contradictions, synthesize if possible
        return 'synthesize';

      case 'confidence_mismatch':
        // Favor higher confidence
        return 'favor_higher_confidence';

      case 'partial_overlap':
        // Try to synthesize
        return 'synthesize';

      case 'scope_difference':
        // Preserve both as they cover different aspects
        return 'preserve_both';

      case 'evidence_conflict':
        // Need human review
        return 'defer';

      default:
        return this.config.defaultStrategy;
    }
  }

  /**
   * Resolve by favoring higher confidence
   */
  private resolveByConfidence(conflict: ConflictingInsight): ConflictResolution {
    const conf1 = conflict.insight1.confidence;
    const conf2 = conflict.insight2.confidence;

    const winner = conf1 >= conf2 ? conflict.insight1 : conflict.insight2;
    const loser = conf1 >= conf2 ? conflict.insight2 : conflict.insight1;

    return {
      resolvedInsight: winner.content,
      explanation: `Favored insight from ${winner.mode} (confidence: ${winner.confidence.toFixed(2)}) over ${loser.mode} (confidence: ${loser.confidence.toFixed(2)})`,
      preservedFrom: [winner.mode],
      resolutionStrategy: 'favor_higher_confidence',
      confidence: winner.confidence,
    };
  }

  /**
   * Resolve by synthesizing both insights
   */
  private resolveBySynthesis(conflict: ConflictingInsight): {
    resolved: ConflictResolution;
    synthesized: Insight | null;
  } {
    const synthesis = this.generateSynthesis(
      conflict.insight1.content,
      conflict.insight2.content
    );

    const synthesizedInsight: Insight = {
      id: randomUUID(),
      content: synthesis,
      sourceMode: conflict.insight1.mode, // Primary attribution
      confidence: (conflict.insight1.confidence + conflict.insight2.confidence) / 2,
      evidence: [
        `Synthesized from ${conflict.insight1.mode}: "${conflict.insight1.content.substring(0, 50)}..."`,
        `And ${conflict.insight2.mode}: "${conflict.insight2.content.substring(0, 50)}..."`,
      ],
      timestamp: new Date(),
      category: 'synthesis',
    };

    return {
      resolved: {
        resolvedInsight: synthesis,
        explanation: `Synthesized insights from ${conflict.insight1.mode} and ${conflict.insight2.mode} to create a unified perspective`,
        preservedFrom: [conflict.insight1.mode, conflict.insight2.mode],
        resolutionStrategy: 'synthesize',
        confidence: synthesizedInsight.confidence,
      },
      synthesized: synthesizedInsight,
    };
  }

  /**
   * Generate synthesis of two conflicting insights
   */
  private generateSynthesis(content1: string, content2: string): string {
    // Extract key points from each
    const key1 = this.extractKeyPoint(content1);
    const key2 = this.extractKeyPoint(content2);

    // Create synthesis
    return `While ${key1.toLowerCase()}, it's also important to consider that ${key2.toLowerCase()}. A balanced view incorporates both perspectives.`;
  }

  /**
   * Extract the key point from an insight
   */
  private extractKeyPoint(content: string): string {
    // Try to extract the main clause
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim());
    if (sentences.length > 0) {
      const main = sentences[0].trim();
      return main.length > 100 ? main.substring(0, 100) + '...' : main;
    }
    return content.substring(0, 100);
  }

  /**
   * Resolve by preserving both insights
   */
  private resolveByPreservingBoth(conflict: ConflictingInsight): ConflictResolution {
    return {
      resolvedInsight: `Two perspectives: (1) ${conflict.insight1.content.substring(0, 50)}... (2) ${conflict.insight2.content.substring(0, 50)}...`,
      explanation: `Preserved both insights as they represent different valid perspectives from ${conflict.insight1.mode} and ${conflict.insight2.mode}`,
      preservedFrom: [conflict.insight1.mode, conflict.insight2.mode],
      resolutionStrategy: 'preserve_both',
      confidence: Math.max(conflict.insight1.confidence, conflict.insight2.confidence),
    };
  }

  /**
   * Defer resolution to user/external process
   */
  private resolveByDefer(conflict: ConflictingInsight): ConflictResolution {
    return {
      resolvedInsight: `[UNRESOLVED] Conflict between ${conflict.insight1.mode} and ${conflict.insight2.mode} requires manual review`,
      explanation: `The conflict between these insights requires human judgment to resolve`,
      preservedFrom: [],
      resolutionStrategy: 'defer',
      confidence: 0,
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create a conflict object
   */
  private createConflict(
    a: Insight,
    b: Insight,
    type: ConflictType,
    severity: number
  ): ConflictingInsight {
    return {
      insight1: {
        mode: a.sourceMode,
        content: a.content,
        confidence: a.confidence,
        insightId: a.id,
      },
      insight2: {
        mode: b.sourceMode,
        content: b.content,
        confidence: b.confidence,
        insightId: b.id,
      },
      conflictType: type,
      severity,
    };
  }

  /**
   * Calculate text similarity
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Extract conclusion from content
   */
  private extractConclusion(content: string): string | null {
    const conclusionPatterns = [
      /therefore[,:]?\s*(.+)/i,
      /thus[,:]?\s*(.+)/i,
      /hence[,:]?\s*(.+)/i,
      /consequently[,:]?\s*(.+)/i,
      /as a result[,:]?\s*(.+)/i,
      /this means[,:]?\s*(.+)/i,
      /we conclude[,:]?\s*(.+)/i,
    ];

    for (const pattern of conclusionPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Get conflict statistics
   */
  getStatistics(conflicts: ConflictingInsight[]): {
    total: number;
    byType: Record<ConflictType, number>;
    averageSeverity: number;
    resolved: number;
  } {
    const byType: Record<ConflictType, number> = {
      direct_contradiction: 0,
      partial_overlap: 0,
      scope_difference: 0,
      confidence_mismatch: 0,
      evidence_conflict: 0,
    };

    let totalSeverity = 0;
    let resolved = 0;

    for (const conflict of conflicts) {
      byType[conflict.conflictType]++;
      totalSeverity += conflict.severity;
      if (conflict.resolution) {
        resolved++;
      }
    }

    return {
      total: conflicts.length,
      byType,
      averageSeverity: conflicts.length > 0 ? totalSeverity / conflicts.length : 0,
      resolved,
    };
  }
}
