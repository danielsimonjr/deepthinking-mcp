/**
 * Proof Analysis Module (Phase 8 - v7.0.0, Phase 12 - v8.4.0)
 *
 * Provides proof decomposition, dependency analysis, inconsistency detection,
 * branch analysis, strategy recommendations, verification, and hierarchical proofs
 * for the Mathematics reasoning mode.
 */

// Core infrastructure
export { DependencyGraphBuilder } from './dependency-graph.js';

// Phase 8 Sprint 2: Decomposition engine and gap analysis
export { ProofDecomposer, type ProofStep } from './decomposer.js';
export { GapAnalyzer, type GapAnalyzerConfig } from './gap-analyzer.js';
export { AssumptionTracker } from './assumption-tracker.js';

// Phase 8 Sprint 3: Inconsistency and circular reasoning detection
export { InconsistencyDetector, type InconsistencyDetectorConfig } from './inconsistency-detector.js';
export { CircularReasoningDetector, type CircularReasoningResult } from './circular-detector.js';

// Phase 8 Sprint 3: Warning patterns
export {
  type WarningPattern,
  type WarningCategory,
  ALL_WARNING_PATTERNS,
  getPatternsByCategory,
  getPatternsBySeverity,
  checkStatement,
  checkProof,
} from './patterns/warnings.js';

// Phase 12 Sprint 1: Branch types
export type {
  ProofBranch,
  BranchAnalysisResult,
  HierarchicalProof,
  HierarchicalProofType,
  ProofTree,
  ProofStrategyType,
  ProofTemplate,
  ProofTemplateSection,
  StrategyRecommendation,
  TheoremFeatures,
  VerificationSeverity,
  VerificationErrorType,
  VerificationError,
  VerificationWarning,
  VerificationCoverage,
  VerificationResult,
  JustificationType,
  StepJustification,
} from './branch-types.js';

// Phase 12 Sprint 2: Branch analysis
export { BranchAnalyzer, type BranchAnalyzerOptions } from './branch-analyzer.js';

// Phase 12 Sprint 2: Strategy recommendations
export { StrategyRecommender, type StrategyRecommenderConfig } from './strategy-recommender.js';

// Phase 12 Sprint 2: Proof verification
export { ProofVerifier, type ProofVerifierConfig } from './verifier.js';

// Phase 12 Sprint 2: Hierarchical proofs
export {
  HierarchicalProofManager,
  type HierarchicalProofOptions,
  type ProofElementInput,
} from './hierarchical-proof.js';

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
