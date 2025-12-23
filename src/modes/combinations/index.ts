/**
 * Multi-Mode Analysis & Synthesis Module
 * Phase 12 Sprint 3
 *
 * This module provides tools for combining multiple reasoning modes,
 * merging insights, resolving conflicts, and performing comprehensive
 * multi-perspective analysis.
 *
 * @example
 * ```typescript
 * import {
 *   MultiModeAnalyzer,
 *   analyzeMultiMode,
 *   getPreset,
 *   InsightMerger,
 *   ConflictResolver,
 * } from './modes/combinations';
 *
 * // Quick analysis using preset
 * const result = await analyzeMultiMode({
 *   thought: "Analyze the implications of this decision",
 *   preset: "decision_making"
 * });
 *
 * // Custom analysis with specific modes
 * const analyzer = new MultiModeAnalyzer();
 * const result = await analyzer.analyze({
 *   thought: "Complex problem requiring multiple perspectives",
 *   customModes: [ThinkingMode.Deductive, ThinkingMode.Bayesian, ThinkingMode.Causal],
 *   mergeStrategy: "weighted"
 * });
 * ```
 */

// Types
export type {
  // Merge strategy types
  MergeStrategy,
  WeightedMergeConfig,
  HierarchicalMergeConfig,
  DialecticalMergeConfig,

  // Mode combination types
  ModeCombination,

  // Insight types
  Insight,
  ConflictType,
  ConflictingInsight,
  ConflictResolution,

  // Merged analysis types
  MergedAnalysis,
  MergeStatistics,

  // Request/response types
  MultiModeAnalysisRequest,
  MultiModeAnalysisResponse,
  ModeAnalysisResult,
  ModeError,
} from './combination-types.js';

// Presets
export {
  type PresetId,
  PRESETS,
  getPreset,
  getAllPresets,
  getPresetsByTag,
  getPresetsWithMode,
  getPresetsByStrategy,
  combinePresets,
  isValidPresetId,
  getPresetMetadata,
  listPresetIds,
} from './presets.js';

// Merger
export {
  InsightMerger,
  type MergeResult,
  type InsightMergerConfig,
} from './merger.js';

// Conflict Resolver
export {
  ConflictResolver,
  type ResolutionResult,
  type ConflictResolverConfig,
} from './conflict-resolver.js';

// Analyzer
export {
  MultiModeAnalyzer,
  analyzeMultiMode,
  type MultiModeAnalyzerConfig,
  type ProgressCallback,
  type AnalysisProgress,
} from './analyzer.js';
