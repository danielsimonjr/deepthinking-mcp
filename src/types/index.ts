/**
 * Type definitions index (v7.1.0)
 * Exports all types for the DeepThinking MCP server
 *
 * Note: All thought types are exported from core.ts to avoid duplicate exports.
 * Mode-specific types are imported by core.ts and re-exported from there.
 */

export * from './core.js';
export * from './session.js';

// Export mode recommendation types (doesn't conflict with core exports)
export * from './modes/recommendations.js';

// Export engineering-specific types (sub-interfaces not in core)
export {
  type Requirement,
  type RequirementPriority,
  type RequirementSource,
  type RequirementStatus,
  type RequirementsTraceability,
  type TradeAlternative,
  type TradeCriterion,
  type TradeScore,
  type TradeStudy,
  type FailureMode,
  type FailureModeAnalysis,
  type SeverityRating,
  type OccurrenceRating,
  type DetectionRating,
  type DesignDecision,
  type DecisionStatus,
  type DecisionAlternative,
  type DesignDecisionLog,
  type EngineeringAnalysisType,
  isEngineeringThought,
} from './modes/engineering.js';

// Export computability-specific types (Phase 11 v7.2.0 - Turing's legacy)
export {
  type ComputabilityThoughtType,
  type TuringTransition,
  type TuringMachine,
  type ComputationStep,
  type ComputationTrace,
  type DecisionProblem,
  type Reduction,
  type DiagonalizationArgument,
  type DecidabilityProof,
  type ComplexityAnalysis,
  type OracleAnalysis,
  type ClassicUndecidableProblem,
  isComputabilityThought,
  createSimpleMachine,
  reductionPreservesDecidability,
  isPolynomialReduction,
} from './modes/computability.js';

// Export game theory extensions (Phase 11 v7.2.0 - von Neumann's legacy)
export {
  type MinimaxAnalysis,
  type CooperativeGame,
  type CoalitionValue,
  type CoreAllocation,
  type CoalitionAnalysis,
  type ShapleyValueDetails,
  createCharacteristicFunction,
  checkSuperadditivity,
  calculateShapleyValue,
} from './modes/gametheory.js';

// Export cryptanalytic-specific types (Phase 11 v7.2.0 - Turing's Bletchley Park work)
export {
  type CryptanalyticThoughtType,
  type DecibanEvidence,
  type EvidenceChain,
  type KeySpaceAnalysis,
  type FrequencyAnalysis,
  type BanburismusAnalysis,
  type CribAnalysis,
  type CipherType,
  type CryptographicHypothesis,
  type IsomorphismPattern,
  isCryptanalyticThought,
  toDecibans,
  fromDecibans,
  decibansToOdds,
  decibansToProbability,
  accumulateEvidence,
  calculateIndexOfCoincidence,
  LANGUAGE_IC,
  ENGLISH_FREQUENCIES,
} from './modes/cryptanalytic.js';
