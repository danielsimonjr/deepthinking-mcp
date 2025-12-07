/**
 * Proof Analysis Module (Phase 8 - v7.0.0)
 *
 * Provides proof decomposition, dependency analysis, and inconsistency detection
 * for the Mathematics reasoning mode.
 */

// Core graph builder
export { DependencyGraphBuilder } from './dependency-graph.js';

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
