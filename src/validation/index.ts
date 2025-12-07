/**
 * Validation module exports (v7.1.0)
 * Sprint 9.2: Explicit exports for tree-shaking
 * Sprint 10: Added validation constants
 * Phase 11: Added schema utilities
 */

// Constants (Sprint 10)
export {
  IssueSeverity,
  IssueCategory,
  ValidationThresholds,
  ValidationMessages,
  isInRange,
  isValidProbability,
  isValidConfidence,
} from './constants.js';

// Validator exports
export { ThoughtValidator, type ValidationContext } from './validator.js';

// Schema exports
export {
  SessionIdSchema,
  ThinkingModeSchema,
  CreateSessionSchema,
  type CreateSessionInput,
  AddThoughtSchema,
  type AddThoughtInput,
  CompleteSessionSchema,
  type CompleteSessionInput,
  GetSessionSchema,
  type GetSessionInput,
  ListSessionsSchema,
  type ListSessionsInput,
  ExportSessionSchema,
  type ExportSessionInput,
  SearchSessionsSchema,
  type SearchSessionsInput,
  BatchOperationSchema,
  type BatchOperationInput,
  validateInput,
  safeValidateInput,
} from './schemas.js';

// Schema utilities (Phase 11)
export {
  // Primitive schemas
  probabilitySchema,
  confidenceSchema,
  progressSchema,
  weightSchema,
  nonNegativeSchema,
  positiveSchema,
  nonEmptyStringSchema,
  uuidSchema,
  timestampSchema,
  // Composite schemas - Hypothesis & Evidence
  hypothesisSchema,
  probabilityWithJustificationSchema,
  probabilityWithCalculationSchema,
  evidenceSchema,
  evidenceWithSupportSchema,
  type HypothesisInput,
  type ProbabilityWithJustification,
  type ProbabilityWithCalculation,
  type EvidenceInput,
  type EvidenceWithSupport,
  // Graph schemas
  createNodeSchema,
  createEdgeSchema,
  nodeSchema,
  weightedNodeSchema,
  edgeSchema,
  weightedEdgeSchema,
  causalEdgeSchema,
  type NodeInput,
  type WeightedNodeInput,
  type EdgeInput,
  type WeightedEdgeInput,
  type CausalEdgeInput,
  // Temporal schemas
  timePointSchema,
  timeIntervalSchema,
  temporalEventSchema,
  type TimePointInput,
  type TimeIntervalInput,
  type TemporalEventInput,
  // Mathematical schemas
  mathExpressionSchema,
  valueWithUnitSchema,
  measurementSchema,
  type MathExpressionInput,
  type ValueWithUnitInput,
  type MeasurementInput,
  // Game Theory schemas
  playerSchema,
  strategySchema,
  payoffSchema,
  type PlayerInput,
  type StrategyInput,
  type PayoffInput,
  // Reasoning schemas
  reasoningStepSchema,
  propositionSchema,
  inferenceRuleSchema,
  type ReasoningStepInput,
  type PropositionInput,
  type InferenceRuleInput,
  // Optimization schemas
  constraintSchema,
  objectiveSchema,
  solutionSchema,
  type ConstraintInput,
  type ObjectiveInput,
  type SolutionInput,
  // Base schemas
  baseThoughtSchema,
  sequentialThoughtExtensionSchema,
  bayesianThoughtExtensionSchema,
  type BaseThoughtInput,
  // Helpers
  createRangeSchema,
  createEnumSchema,
  createOptionalStringWithDefault,
  createOptionalNumberWithDefault,
  createOptionalBooleanWithDefault,
  uniqueIdArraySchema,
  createGraphSchema,
  // Namespace export
  SchemaUtils,
} from './schema-utils.js';
