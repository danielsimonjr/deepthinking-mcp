/**
 * Multi-Mode Analysis & Synthesis Types
 * Phase 12 Sprint 1 - Foundation & Infrastructure
 *
 * Provides types for combining multiple reasoning modes,
 * merging insights, and resolving conflicts.
 */

import type { ThinkingMode } from "../../types/core.js";

// ============================================================================
// MERGE STRATEGY TYPES
// ============================================================================

/**
 * Available strategies for merging insights from multiple modes
 */
export type MergeStrategy =
  | "union" // Combine all insights, deduplicate
  | "intersection" // Only insights agreed by all modes
  | "weighted" // Weight insights by mode confidence
  | "hierarchical" // Primary mode with supporting modes
  | "dialectical"; // Thesis/antithesis/synthesis approach

/**
 * Configuration for weighted merge strategy
 */
export interface WeightedMergeConfig {
  /** Weight per mode (mode -> weight, 0-1) */
  weights: Map<ThinkingMode, number>;

  /** Minimum combined weight to include an insight */
  threshold: number;

  /** How to handle insights from modes not in weights map */
  defaultWeight: number;
}

/**
 * Configuration for hierarchical merge strategy
 */
export interface HierarchicalMergeConfig {
  /** The primary mode whose insights take precedence */
  primaryMode: ThinkingMode;

  /** Supporting modes that provide additional evidence */
  supportingModes: ThinkingMode[];

  /** Whether supporting insights can override primary */
  allowOverride: boolean;

  /** Minimum support count to override primary */
  overrideThreshold: number;
}

/**
 * Configuration for dialectical merge strategy
 */
export interface DialecticalMergeConfig {
  /** Mode providing the thesis */
  thesisMode: ThinkingMode;

  /** Mode providing the antithesis */
  antithesisMode: ThinkingMode;

  /** Mode(s) for synthesis (optional, can be auto-generated) */
  synthesisModes?: ThinkingMode[];

  /** Whether to preserve original thesis/antithesis in output */
  preserveOriginals: boolean;
}

// ============================================================================
// MODE COMBINATION TYPES
// ============================================================================

/**
 * Defines a combination of reasoning modes for multi-mode analysis
 */
export interface ModeCombination {
  /** Unique identifier for this combination */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description of what this combination is for */
  description: string;

  /** The modes included in this combination */
  modes: ThinkingMode[];

  /** Strategy for merging insights from these modes */
  mergeStrategy: MergeStrategy;

  /** Recommended use case for this combination */
  useCase: string;

  /** Optional configuration for the merge strategy */
  mergeConfig?:
    WeightedMergeConfig | HierarchicalMergeConfig | DialecticalMergeConfig;

  /** Tags for categorization */
  tags?: string[];
}

// ============================================================================
// INSIGHT TYPES
// ============================================================================

/**
 * Where a `confidence` number came from.
 *
 * - `derived` — computed from a value the mode's handler actually calculated
 *   for this input.
 * - `unavailable` — nothing computed one. The accompanying `confidence` is
 *   {@link UNSCORED_INSIGHT_WEIGHT}, a neutral ordering weight, and **must not
 *   be presented to a caller as a confidence**. `confidenceNote` says why.
 *
 * This distinction exists because the analyzer used to emit
 * `0.8 x <a per-mode literal>` as a confidence. It looked computed, varied by
 * mode, and was identical for two completely different problems.
 */
export type ConfidenceBasis = "derived" | "unavailable";

/**
 * The weight carried by an insight with no derived confidence.
 *
 * Deliberately a single constant for every such insight, so an average of them
 * is exactly this value — a visible tell — rather than a plausible-looking
 * number like 0.76. It orders nothing and means nothing.
 */
export const UNSCORED_INSIGHT_WEIGHT = 0.5;

/**
 * Why a synthesized insight carries no confidence of its own.
 *
 * Both synthesis paths (dialectical merge, conflict resolution by synthesis)
 * average their two parents' `confidence` values. The mean of two claims'
 * confidences is not a measurement of the third, different claim built from
 * them — it is only a weight for ordering the result among its peers.
 */
export const SYNTHESIS_CONFIDENCE_NOTE =
  "Synthesized from two insights. The value shown is the mean of their " +
  "weights, which is not a measured confidence in the synthesis itself.";

/**
 * An insight derived from a reasoning mode
 */
export interface Insight {
  /** Unique identifier */
  id: string;

  /** The content of the insight */
  content: string;

  /** The mode that produced this insight */
  sourceMode: ThinkingMode;

  /**
   * Confidence score (0-1).
   *
   * Read `confidenceBasis` before using this. When the basis is
   * `unavailable` this is {@link UNSCORED_INSIGHT_WEIGHT}, not a confidence.
   */
  confidence: number;

  /** Where `confidence` came from. Never omit — a bare number is not a claim. */
  confidenceBasis: ConfidenceBasis;

  /** Why no confidence was derived. Present iff `confidenceBasis` is `unavailable`. */
  confidenceNote?: string;

  /** Evidence or reasoning supporting this insight */
  evidence?: string[];

  /** Related insight IDs */
  relatedInsights?: string[];

  /** Timestamp when insight was generated */
  timestamp: Date;

  /** Optional category/type of insight */
  category?: string;

  /** Priority or importance (1-10) */
  priority?: number;
}

/**
 * Types of conflicts between insights
 */
export type ConflictType =
  | "direct_contradiction" // Insights directly contradict each other
  | "partial_overlap" // Insights overlap but have differences
  | "scope_difference" // Same topic, different scope/granularity
  | "confidence_mismatch" // Same conclusion, very different confidence
  | "evidence_conflict"; // Different evidence for same conclusion

/**
 * Represents a conflict between insights from different modes
 */
export interface ConflictingInsight {
  /** First conflicting insight */
  insight1: {
    mode: ThinkingMode;
    content: string;
    confidence: number;
    insightId: string;
  };

  /** Second conflicting insight */
  insight2: {
    mode: ThinkingMode;
    content: string;
    confidence: number;
    insightId: string;
  };

  /** Type of conflict */
  conflictType: ConflictType;

  /** Severity of the conflict (0-1, higher = more severe) */
  severity: number;

  /** Optional resolution if one has been determined */
  resolution?: ConflictResolution;
}

/**
 * Resolution of a conflict between insights
 */
export interface ConflictResolution {
  /** The resolved insight content */
  resolvedInsight: string;

  /** Explanation of how the conflict was resolved */
  explanation: string;

  /** Which original insights contributed to resolution */
  preservedFrom: ThinkingMode[];

  /** Strategy used to resolve */
  resolutionStrategy:
    "favor_higher_confidence" | "synthesize" | "preserve_both" | "defer";

  /** Confidence in the resolution */
  confidence: number;
}

// ============================================================================
// MERGED ANALYSIS TYPES
// ============================================================================

/**
 * Result of merging insights from multiple modes
 */
export interface MergedAnalysis {
  /** ID of the analysis */
  id: string;

  /** Primary insights from the merged analysis */
  primaryInsights: Insight[];

  /** Map of insight to the modes that support it */
  supportingEvidence: Map<string, ThinkingMode[]>;

  /** Conflicts detected between modes */
  conflicts: ConflictingInsight[];

  /** Synthesized conclusion from all modes */
  synthesizedConclusion: string;

  /**
   * Overall confidence score for the analysis.
   *
   * Read `confidenceBasis` before using this. It is the mean of the
   * contributing insights' `confidence` values, so when no insight has a
   * derived confidence it is exactly {@link UNSCORED_INSIGHT_WEIGHT} and means
   * nothing.
   */
  confidenceScore: number;

  /** Where `confidenceScore` came from. `derived` iff any insight's basis is. */
  confidenceBasis: ConfidenceBasis;

  /** Why no confidence was derived. Present iff `confidenceBasis` is `unavailable`. */
  confidenceNote?: string;

  /** The modes that contributed to this analysis */
  contributingModes: ThinkingMode[];

  /** Strategy used for merging */
  mergeStrategy: MergeStrategy;

  /** Statistics about the merge */
  statistics: MergeStatistics;

  /** Timestamp of the analysis */
  timestamp: Date;
}

/**
 * Statistics about a merge operation
 */
export interface MergeStatistics {
  /** Total insights before merging */
  totalInsightsBefore: number;

  /** Total insights after merging */
  totalInsightsAfter: number;

  /** Number of duplicates removed */
  duplicatesRemoved: number;

  /** Number of conflicts detected */
  conflictsDetected: number;

  /** Number of conflicts resolved */
  conflictsResolved: number;

  /** Average confidence across modes */
  averageConfidence: number;

  /** Time taken to merge (ms) */
  mergeTime: number;
}

// ============================================================================
// ANALYSIS REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request for multi-mode analysis
 */
export interface MultiModeAnalysisRequest {
  /** The thought or problem to analyze */
  thought: string;

  /** Preset combination to use (optional) */
  preset?: string;

  /** Custom modes to use (overrides preset) */
  customModes?: ThinkingMode[];

  /** Merge strategy to use */
  mergeStrategy?: MergeStrategy;

  /** Session ID for tracking */
  sessionId?: string;

  /** Maximum time per mode (ms) */
  timeoutPerMode?: number;

  /** Additional context for the analysis */
  context?: string;
}

/**
 * Response from multi-mode analysis
 */
export interface MultiModeAnalysisResponse {
  /** The merged analysis result */
  analysis: MergedAnalysis;

  /** Individual results from each mode */
  modeResults: Map<ThinkingMode, ModeAnalysisResult>;

  /** Overall success status */
  success: boolean;

  /** Any errors encountered */
  errors?: ModeError[];

  /** Total execution time (ms) */
  executionTime: number;
}

/**
 * Result from a single mode's analysis
 */
export interface ModeAnalysisResult {
  /** The mode that produced this result */
  mode: ThinkingMode;

  /** Insights from this mode */
  insights: Insight[];

  /** Whether this mode completed successfully */
  success: boolean;

  /** Error if mode failed */
  error?: string;

  /** Execution time for this mode (ms) */
  executionTime: number;
}

/**
 * Error from a mode during analysis
 */
export interface ModeError {
  /** The mode that failed */
  mode: ThinkingMode;

  /** Error message */
  message: string;

  /** Error code if available */
  code?: string;

  /** Whether analysis continued despite this error */
  recoverable: boolean;
}
