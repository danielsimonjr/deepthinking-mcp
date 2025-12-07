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
