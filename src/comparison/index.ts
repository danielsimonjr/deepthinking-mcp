/**
 * Session Comparison Exports (v3.4.0)
 * Phase 4 Task 9.9: Session comparison and diff tools
 */

export { SessionComparator } from './comparator.js';
export { MultiSessionComparator } from './multi-comparator.js';
export { DiffGenerator } from './diff-generator.js';

export type {
  ComparisonResult,
  Difference,
  DifferenceType,
  ComparisonSummary,
  ComparisonMetrics,
  DiffOptions,
  SimilarityMetrics,
  ThoughtComparison,
  MultiSessionComparison,
  SessionCluster,
  ComparisonTimeline,
  TimelineEvent,
  DivergencePoint,
  ConvergencePoint,
  EvolutionComparison,
  ComparisonReport,
  TextDiff,
} from './types.js';
