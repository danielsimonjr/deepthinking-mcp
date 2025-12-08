/**
 * Proof Analysis Module (Phase 8 - v7.0.0)
 *
 * Provides proof decomposition, dependency analysis, and inconsistency detection
 * for the Mathematics reasoning mode.
 */

// Core infrastructure
export { DependencyGraphBuilder } from './dependency-graph.js';

// Sprint 2: Decomposition engine and gap analysis
export { ProofDecomposer, type ProofStep } from './decomposer.js';
export { GapAnalyzer, type GapAnalyzerConfig } from './gap-analyzer.js';
export { AssumptionTracker } from './assumption-tracker.js';

// Sprint 3: Inconsistency and circular reasoning detection
export { InconsistencyDetector, type InconsistencyDetectorConfig } from './inconsistency-detector.js';
export { CircularReasoningDetector, type CircularReasoningResult } from './circular-detector.js';

// Sprint 3: Warning patterns
export {
  type WarningPattern,
  type WarningCategory,
  ALL_WARNING_PATTERNS,
  getPatternsByCategory,
  getPatternsBySeverity,
  checkStatement,
  checkProof,
} from './patterns/warnings.js';

// Re-export types from mathematics mode
export type {
  AtomicStatement,
  DependencyEdge,
  DependencyGraph,
  InferenceRule,
  ProofDecomposition,
  ProofGap,
  ImplicitAssumption,
  AssumptionChain,
  InconsistencyType,
  Inconsistency,
  CircularPath,
  ConsistencyReport,
  GapAnalysis,
  AssumptionAnalysis,
} from '../types/modes/mathematics.js';
