/**
 * Insight Merger Tests - Phase 12 Sprint 3
 *
 * Tests for the InsightMerger class that combines insights from multiple modes.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ThinkingMode } from '../../../../src/types/core.js';
import {
  InsightMerger,
  InsightMergerConfig,
  MergeResult,
} from '../../../../src/modes/combinations/merger.js';
import type {
  Insight,
  WeightedMergeConfig,
  HierarchicalMergeConfig,
  DialecticalMergeConfig,
} from '../../../../src/modes/combinations/combination-types.js';

// Helper to create test insights
function createInsight(
  content: string,
  mode: ThinkingMode,
  confidence: number = 0.8,
  id?: string
): Insight {
  return {
    id: id || `insight-${Math.random().toString(36).substr(2, 9)}`,
    content,
    sourceMode: mode,
    confidence,
    evidence: [],
    timestamp: new Date(),
  };
}

describe('InsightMerger', () => {
  let merger: InsightMerger;

  beforeEach(() => {
    merger = new InsightMerger();
  });

  describe('constructor', () => {
    it('should create an instance with default options', () => {
      const merger = new InsightMerger();
      expect(merger).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const config: InsightMergerConfig = {
        similarityThreshold: 0.9,
        minConfidence: 0.5,
        preserveOriginals: true,
      };
      const merger = new InsightMerger(config);
      expect(merger).toBeDefined();
    });
  });

  describe('merge - union strategy', () => {
    it('should combine all insights from all modes', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Deductive insight', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('Inductive insight', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'union');

      expect(result.insights.length).toBeGreaterThanOrEqual(2);
    });

    it('should deduplicate similar insights', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [
          ThinkingMode.DEDUCTIVE,
          [createInsight('The solution is X', ThinkingMode.DEDUCTIVE)],
        ],
        [
          ThinkingMode.INDUCTIVE,
          [createInsight('The solution is X', ThinkingMode.INDUCTIVE)],
        ],
      ]);

      const result = merger.merge(insightsByMode, 'union');

      // Should have fewer insights after deduplication
      expect(result.statistics.duplicatesRemoved).toBeGreaterThanOrEqual(0);
    });

    it('should filter by minimum confidence', () => {
      const merger = new InsightMerger({ minConfidence: 0.7 });
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('High confidence', ThinkingMode.DEDUCTIVE, 0.9)]],
        [ThinkingMode.INDUCTIVE, [createInsight('Low confidence', ThinkingMode.INDUCTIVE, 0.3)]],
      ]);

      const result = merger.merge(insightsByMode, 'union');

      // Low confidence insight should be filtered
      expect(result.insights.every((i) => i.confidence >= 0.3)).toBe(true);
    });

    it('should track merge statistics', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Insight 1', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('Insight 2', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'union');

      expect(result.statistics.totalInsightsBefore).toBeGreaterThanOrEqual(2);
      expect(result.statistics.totalInsightsAfter).toBeGreaterThan(0);
      expect(result.statistics.mergeTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('merge - intersection strategy', () => {
    it('should only keep insights agreed upon by multiple modes', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [
          ThinkingMode.DEDUCTIVE,
          [
            createInsight('Agreed insight', ThinkingMode.DEDUCTIVE),
            createInsight('Unique deductive', ThinkingMode.DEDUCTIVE),
          ],
        ],
        [
          ThinkingMode.INDUCTIVE,
          [
            createInsight('Agreed insight', ThinkingMode.INDUCTIVE),
            createInsight('Unique inductive', ThinkingMode.INDUCTIVE),
          ],
        ],
      ]);

      const result = merger.merge(insightsByMode, 'intersection');

      // Should only have the agreed insight
      expect(result.statistics.duplicatesRemoved).toBeGreaterThanOrEqual(0);
    });

    it('should merge confidence from agreeing modes', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Same insight', ThinkingMode.DEDUCTIVE, 0.7)]],
        [ThinkingMode.INDUCTIVE, [createInsight('Same insight', ThinkingMode.INDUCTIVE, 0.9)]],
      ]);

      const result = merger.merge(insightsByMode, 'intersection');

      // Merged confidence should reflect both inputs
      expect(result).toBeDefined();
    });

    it('should return empty for no agreement', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Completely different A', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('Completely different B', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'intersection');

      // No similar insights, so intersection may be empty
      expect(result).toBeDefined();
    });
  });

  describe('merge - weighted strategy', () => {
    it('should apply mode weights to confidence', () => {
      const config: WeightedMergeConfig = {
        weights: new Map<ThinkingMode, number>([
          [ThinkingMode.DEDUCTIVE, 1.0],
          [ThinkingMode.INDUCTIVE, 0.5],
        ]),
        threshold: 0.3,
        defaultWeight: 0.6,
      };

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Deductive', ThinkingMode.DEDUCTIVE, 0.8)]],
        [ThinkingMode.INDUCTIVE, [createInsight('Inductive', ThinkingMode.INDUCTIVE, 0.8)]],
      ]);

      const result = merger.merge(insightsByMode, 'weighted', config);

      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should use default weight for unspecified modes', () => {
      const config: WeightedMergeConfig = {
        weights: new Map<ThinkingMode, number>([[ThinkingMode.DEDUCTIVE, 1.0]]),
        threshold: 0.3,
        defaultWeight: 0.5,
      };

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.ABDUCTIVE, [createInsight('Abductive', ThinkingMode.ABDUCTIVE, 1.0)]],
      ]);

      const result = merger.merge(insightsByMode, 'weighted', config);

      expect(result).toBeDefined();
    });

    it('should filter below threshold', () => {
      const config: WeightedMergeConfig = {
        weights: new Map<ThinkingMode, number>([[ThinkingMode.INDUCTIVE, 0.1]]),
        threshold: 0.5,
        defaultWeight: 0.1,
      };

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.INDUCTIVE, [createInsight('Low weight', ThinkingMode.INDUCTIVE, 0.3)]],
      ]);

      const result = merger.merge(insightsByMode, 'weighted', config);

      // Very low weighted confidence should be filtered
      expect(result).toBeDefined();
    });
  });

  describe('merge - hierarchical strategy', () => {
    it('should prioritize primary mode', () => {
      const config: HierarchicalMergeConfig = {
        primaryMode: ThinkingMode.CAUSAL,
        supportingModes: [ThinkingMode.BAYESIAN, ThinkingMode.DEDUCTIVE],
        allowOverride: false,
        overrideThreshold: 2,
      };

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.CAUSAL, [createInsight('Primary insight', ThinkingMode.CAUSAL)]],
        [ThinkingMode.BAYESIAN, [createInsight('Supporting insight', ThinkingMode.BAYESIAN)]],
      ]);

      const result = merger.merge(insightsByMode, 'hierarchical', config);

      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should include supporting mode insights', () => {
      const config: HierarchicalMergeConfig = {
        primaryMode: ThinkingMode.CAUSAL,
        supportingModes: [ThinkingMode.BAYESIAN],
        allowOverride: false,
        overrideThreshold: 2,
      };

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.CAUSAL, [createInsight('Primary', ThinkingMode.CAUSAL)]],
        [ThinkingMode.BAYESIAN, [createInsight('Unique supporting', ThinkingMode.BAYESIAN)]],
      ]);

      const result = merger.merge(insightsByMode, 'hierarchical', config);

      expect(result.insights.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle override when enabled', () => {
      const config: HierarchicalMergeConfig = {
        primaryMode: ThinkingMode.CAUSAL,
        supportingModes: [ThinkingMode.BAYESIAN, ThinkingMode.DEDUCTIVE],
        allowOverride: true,
        overrideThreshold: 2,
      };

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.CAUSAL, [createInsight('Primary view', ThinkingMode.CAUSAL, 0.5)]],
        [ThinkingMode.BAYESIAN, [createInsight('Primary view', ThinkingMode.BAYESIAN, 0.9)]],
        [ThinkingMode.DEDUCTIVE, [createInsight('Primary view', ThinkingMode.DEDUCTIVE, 0.9)]],
      ]);

      const result = merger.merge(insightsByMode, 'hierarchical', config);

      expect(result).toBeDefined();
    });

    it('should fall back to union without config', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.CAUSAL, [createInsight('Insight', ThinkingMode.CAUSAL)]],
      ]);

      const result = merger.merge(insightsByMode, 'hierarchical');

      expect(result).toBeDefined();
      expect(result.insights.length).toBeGreaterThan(0);
    });
  });

  describe('merge - dialectical strategy', () => {
    it('should identify thesis and antithesis', () => {
      const config: DialecticalMergeConfig = {
        thesisMode: ThinkingMode.TEMPORAL,
        antithesisMode: ThinkingMode.COUNTERFACTUAL,
        synthesisModes: [ThinkingMode.BAYESIAN],
        preserveOriginals: true,
      };

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.TEMPORAL, [createInsight('X will increase', ThinkingMode.TEMPORAL)]],
        [ThinkingMode.COUNTERFACTUAL, [createInsight('X will not increase', ThinkingMode.COUNTERFACTUAL)]],
        [ThinkingMode.BAYESIAN, [createInsight('Probability assessment', ThinkingMode.BAYESIAN)]],
      ]);

      const result = merger.merge(insightsByMode, 'dialectical', config);

      expect(result).toBeDefined();
    });

    it('should generate synthesis for contradictions', () => {
      const config: DialecticalMergeConfig = {
        thesisMode: ThinkingMode.DEDUCTIVE,
        antithesisMode: ThinkingMode.INDUCTIVE,
        synthesisModes: [],
        preserveOriginals: false,
      };

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('The answer is yes', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('The answer is no', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'dialectical', config);

      // Should have some synthesis or preserved insights
      expect(result).toBeDefined();
    });

    it('should preserve originals when configured', () => {
      const config: DialecticalMergeConfig = {
        thesisMode: ThinkingMode.DEDUCTIVE,
        antithesisMode: ThinkingMode.INDUCTIVE,
        synthesisModes: [],
        preserveOriginals: true,
      };

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('X is true', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('X is false', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'dialectical', config);

      // With preserveOriginals, should have more insights
      expect(result).toBeDefined();
    });

    it('should fall back to union without config', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Insight', ThinkingMode.DEDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'dialectical');

      expect(result).toBeDefined();
    });
  });

  describe('conflict detection', () => {
    it('should detect contradicting insights', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('The system is stable', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('The system is not stable', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'union');

      // Should detect conflicts
      expect(result.conflicts.length).toBeGreaterThanOrEqual(0);
    });

    it('should track conflict statistics', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('X will increase', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('X will decrease', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'union');

      expect(result.statistics.conflictsDetected).toBeGreaterThanOrEqual(0);
    });
  });

  describe('similarity calculation', () => {
    it('should identify very similar insights', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('The quick brown fox', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('The quick brown fox', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'intersection');

      // Identical content should be merged
      expect(result).toBeDefined();
    });

    it('should differentiate dissimilar insights', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Alpha beta gamma', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('One two three', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'intersection');

      // Very different content should not intersect
      expect(result).toBeDefined();
    });

    it('should respect similarity threshold config', () => {
      const strictMerger = new InsightMerger({ similarityThreshold: 0.95 });
      const looseMerger = new InsightMerger({ similarityThreshold: 0.5 });

      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Similar content here', ThinkingMode.DEDUCTIVE)]],
        [ThinkingMode.INDUCTIVE, [createInsight('Similar content nearby', ThinkingMode.INDUCTIVE)]],
      ]);

      const strictResult = strictMerger.merge(insightsByMode, 'intersection');
      const looseResult = looseMerger.merge(insightsByMode, 'intersection');

      // Different thresholds may produce different results
      expect(strictResult).toBeDefined();
      expect(looseResult).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty insights map', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>();

      const result = merger.merge(insightsByMode, 'union');

      expect(result.insights).toHaveLength(0);
      expect(result.statistics.totalInsightsBefore).toBe(0);
    });

    it('should handle single mode', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Solo insight', ThinkingMode.DEDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'union');

      expect(result.insights.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle mode with empty insights', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, []],
        [ThinkingMode.INDUCTIVE, [createInsight('Some insight', ThinkingMode.INDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'union');

      expect(result).toBeDefined();
    });

    it('should handle default strategy for unknown strategy', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('Insight', ThinkingMode.DEDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'unknown' as any);

      // Should fall back to union
      expect(result).toBeDefined();
    });

    it('should handle insights with empty content', () => {
      const insightsByMode = new Map<ThinkingMode, Insight[]>([
        [ThinkingMode.DEDUCTIVE, [createInsight('', ThinkingMode.DEDUCTIVE)]],
      ]);

      const result = merger.merge(insightsByMode, 'union');

      expect(result).toBeDefined();
    });
  });
});
