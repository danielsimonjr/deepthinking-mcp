/**
 * Type definitions index (v8.0.0)
 * Exports all types for the DeepThinking MCP server
 *
 * Note: All thought types are exported from core.ts to avoid duplicate exports.
 * Mode-specific types are imported by core.ts and re-exported from there.
 */

export * from './core.js';
export * from './session.js';

// Export ModeHandler types (Phase 10 v8.0.0)
export {
  type ModeHandler,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ModeEnhancements,
  type ModeStatus,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from '../modes/handlers/ModeHandler.js';

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

// Export synthesis-specific types (Phase 13 v7.4.0 - Academic Research)
export {
  type SynthesisThoughtType,
  type SourceType,
  type SourceQuality,
  type Source,
  type Concept,
  type Theme,
  type Finding,
  type Pattern,
  type ConceptRelation,
  type LiteratureGap,
  type Contradiction,
  type ConceptualFramework,
  type SynthesisConclusion,
  type ReviewMetadata,
  isSynthesisThought,
} from './modes/synthesis.js';

// Export argumentation-specific types (Phase 13 v7.4.0 - Academic Research)
export {
  type ArgumentationThoughtType,
  type Claim,
  type Grounds,
  type Warrant,
  type Backing,
  type Qualifier,
  type Rebuttal,
  type RebuttalResponse,
  type ToulminArgument,
  type ArgumentChain,
  type DialecticPosition,
  type DialecticAnalysis,
  type RhetoricalAppeal,
  type RhetoricalStrategy,
  type AudienceConsideration,
  type LogicalFallacy,
  isArgumentationThought,
} from './modes/argumentation.js';

// Export critique-specific types (Phase 13 v7.4.0 - Academic Research)
export {
  type CritiqueThoughtType,
  type WorkType,
  type CritiquedWork,
  type DesignAssessment,
  type SampleAssessment,
  type AnalysisAssessment,
  type MethodologyEvaluation,
  type ValidityAssessment,
  type LogicalStructure,
  type ArgumentCritique,
  type EvidenceQuality,
  type EvidenceUseCritique,
  type NoveltyAssessment,
  type ImpactAssessment,
  type ContributionEvaluation,
  type CritiquePoint,
  type ImprovementSuggestion,
  type CritiqueVerdict,
  isCritiqueThought,
} from './modes/critique.js';

// Export analysis-specific types (Phase 13 v7.4.0 - Academic Research)
export {
  type AnalysisThoughtType,
  type AnalysisMethodology,
  type DataSource,
  type DataSegment,
  type CodeType,
  type Code,
  type CodeCooccurrence,
  type Codebook,
  type ThemeLevel,
  type QualitativeTheme,
  type ThematicMap,
  type MemoType,
  type AnalyticalMemo,
  type GTCategory,
  type TheoreticalSampling,
  type DiscoursePattern,
  type QualitativeRigor,
  isAnalysisThought,
} from './modes/analysis.js';

// Export recursive-specific types (Phase 10 Sprint 3 v8.4.0)
export {
  type RecursiveStrategy,
  type Subproblem,
  type BaseCase,
  type RecurrenceRelation,
  type RecursiveCall,
  type MemoizationState,
  isRecursiveThought,
} from './modes/recursive.js';

// Export modal-specific types (Phase 10 Sprint 3 v8.4.0)
export {
  type ModalLogicSystem,
  type ModalDomain,
  type PossibleWorld,
  type AccessibilityRelation,
  type ModalProposition,
  type ModalOperator,
  type KripkeFrame,
  type KripkeProperty,
  isModalThought,
} from './modes/modal.js';

// Export stochastic-specific types (Phase 10 Sprint 3 v8.4.0)
export {
  type StochasticProcessType,
  type StochasticState,
  type StateTransition,
  type MarkovChain,
  type RandomVariable,
  type DistributionType,
  type SimulationResult,
  type SimulationStatistics,
  isStochasticThought,
} from './modes/stochastic.js';

// Export constraint-specific types (Phase 10 Sprint 3 v8.4.0)
export {
  type CSPVariable,
  type CSPConstraint,
  type ConstraintType,
  type Arc,
  type PropagationMethod,
  type SearchStrategy,
  type ConsistencyLevel,
  type Assignment,
  isConstraintThought,
} from './modes/constraint.js';

// Export custom-specific types (Phase 10 Sprint 3 v8.4.0)
export {
  type CustomField,
  type CustomFieldType,
  type CustomStage,
  type CustomValidationRule,
  isCustomThought,
} from './modes/custom.js';

// Export handler types (Phase 15 Type Safety Initiative)
export {
  type MCPTextContent,
  type MCPResponse,
  type AddThoughtInput,
  type SummarizeInput,
  type ExportInput,
  type ExportAllInput,
  type SwitchModeInput,
  type GetSessionInput,
  type RecommendModeInput,
  type DeleteSessionInput,
  type ModeStatus as HandlerModeStatus,
  type AddThoughtResponse,
  type AnalyzeResponse,
  isAddThoughtInput,
  isSessionActionInput,
  isAnalyzeInput,
} from './handlers.js';
