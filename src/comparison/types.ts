/**
 * Session Comparison Types (v3.4.0)
 * Phase 4 Task 9.9: Session comparison and diff tools
 */

import type { ThinkingMode } from '../types/core.js';

/**
 * Comparison result
 */
export interface ComparisonResult {
  sessionA: string;
  sessionB: string;
  comparedAt: Date;
  similarity: number;
  differences: Difference[];
  summary: ComparisonSummary;
  metrics: ComparisonMetrics;
}

/**
 * Difference types
 */
export type DifferenceType =
  | 'mode'
  | 'thought_count'
  | 'thought_content'
  | 'structure'
  | 'metadata'
  | 'quality'
  | 'taxonomy'
  | 'completion';

/**
 * Difference record
 */
export interface Difference {
  type: DifferenceType;
  path: string;
  valueA: any;
  valueB: any;
  severity: 'critical' | 'major' | 'minor' | 'info';
  description: string;
}

/**
 * Comparison summary
 */
export interface ComparisonSummary {
  identical: boolean;
  majorDifferences: number;
  minorDifferences: number;
  structuralSimilarity: number;
  contentSimilarity: number;
  recommendations: string[];
}

/**
 * Comparison metrics
 */
export interface ComparisonMetrics {
  thoughtCountDiff: number;
  thoughtCountSimilarity?: number;
  modesSame: boolean;
  completionDiff: number;
  averageConfidenceDiff: number;
  taxonomySimilarity: number;
  qualityScoreDiff: number;
  durationDiff: number;
}

/**
 * Diff options
 */
export interface DiffOptions {
  compareContent: boolean;
  compareMetadata: boolean;
  compareTaxonomy: boolean;
  compareQuality: boolean;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  contextLines: number;
}

/**
 * Similarity metrics
 */
export interface SimilarityMetrics {
  structural: number;
  content: number;
  taxonomic: number;
  overall: number;
  components: {
    mode: number;
    thoughtCount: number;
    thoughtContent: number;
    taxonomy: number;
    quality: number;
  };
}

/**
 * Text diff result
 */
export interface TextDiff {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  lineNumber: number;
  content: string;
  context?: string[];
}

/**
 * Thought comparison
 */
export interface ThoughtComparison {
  thoughtIndexA: number;
  thoughtIndexB: number;
  similarity: number;
  differences: Difference[];
  contentDiff: TextDiff[];
}

/**
 * Multi-session comparison
 */
export interface MultiSessionComparison {
  sessions: string[];
  comparedAt: Date;
  pairwiseComparisons: Map<string, ComparisonResult>;
  clustering: SessionCluster[];
  outliers: string[];
  averageSimilarity: number;
}

/**
 * Session cluster
 */
export interface SessionCluster {
  id: string;
  sessions: string[];
  centroid: string;
  averageIntraClusterSimilarity: number;
  characteristics: {
    commonMode?: ThinkingMode;
    averageThoughtCount: number;
    commonTaxonomy: string[];
    averageQuality: number;
  };
}

/**
 * Comparison timeline
 */
export interface ComparisonTimeline {
  sessionA: string;
  sessionB: string;
  events: TimelineEvent[];
  divergencePoints: DivergencePoint[];
  convergencePoints: ConvergencePoint[];
}

/**
 * Timeline event
 */
export interface TimelineEvent {
  timestamp: number;
  sessionAThought?: number;
  sessionBThought?: number;
  eventType: 'thought_added' | 'revision' | 'branch' | 'mode_switch';
  description: string;
}

/**
 * Divergence point
 */
export interface DivergencePoint {
  thoughtIndex: number;
  divergenceType: 'content' | 'approach' | 'conclusion';
  severity: number;
  description: string;
}

/**
 * Convergence point
 */
export interface ConvergencePoint {
  thoughtIndexA: number;
  thoughtIndexB: number;
  similarity: number;
  description: string;
}

/**
 * Evolution comparison
 */
export interface EvolutionComparison {
  sessionA: string;
  sessionB: string;
  evolutionSimilarity: number;
  thoughtProgressionSimilarity: number;
  branchingSimilarity: number;
  revisionPatternSimilarity: number;
  insights: string[];
}

/**
 * Comparison report
 */
export interface ComparisonReport {
  comparison: ComparisonResult;
  visualizations: {
    similarityChart: string;
    differenceHeatmap: string;
    timelineChart: string;
  };
  insights: string[];
  recommendations: string[];
  generatedAt: Date;
}
