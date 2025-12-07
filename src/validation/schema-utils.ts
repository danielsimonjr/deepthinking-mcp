/**
 * Schema Utilities (v7.1.0)
 * Shared Zod schemas and schema factories for thought validation
 *
 * Provides reusable schema components that can be composed to build
 * mode-specific validators, reducing duplication and ensuring consistency.
 */

import { z } from 'zod';
import { ValidationThresholds, ValidationMessages } from './constants.js';

// =============================================================================
// Primitive Schemas
// =============================================================================

/**
 * Probability schema (0-1 range)
 * Use for: prior, posterior, likelihood, confidence, weight
 */
export const probabilitySchema = z
  .number()
  .min(ValidationThresholds.MIN_PROBABILITY, ValidationMessages.INVALID_RANGE('Probability', 0, 1))
  .max(ValidationThresholds.MAX_PROBABILITY, ValidationMessages.INVALID_RANGE('Probability', 0, 1));

/**
 * Confidence schema (0-1 range)
 * Alias for probability with better semantic naming
 */
export const confidenceSchema = z
  .number()
  .min(ValidationThresholds.MIN_CONFIDENCE, ValidationMessages.INVALID_RANGE('Confidence', 0, 1))
  .max(ValidationThresholds.MAX_CONFIDENCE, ValidationMessages.INVALID_RANGE('Confidence', 0, 1));

/**
 * Progress schema (0-100 range)
 */
export const progressSchema = z
  .number()
  .min(ValidationThresholds.MIN_PROGRESS, ValidationMessages.INVALID_RANGE('Progress', 0, 100))
  .max(ValidationThresholds.MAX_PROGRESS, ValidationMessages.INVALID_RANGE('Progress', 0, 100));

/**
 * Weight schema (0-1 range for edge weights, strengths, etc.)
 */
export const weightSchema = z
  .number()
  .min(ValidationThresholds.MIN_WEIGHT, ValidationMessages.INVALID_RANGE('Weight', 0, 1))
  .max(ValidationThresholds.MAX_WEIGHT, ValidationMessages.INVALID_RANGE('Weight', 0, 1));

/**
 * Non-negative number schema
 */
export const nonNegativeSchema = z
  .number()
  .min(0, 'Value must be non-negative');

/**
 * Positive number schema
 */
export const positiveSchema = z
  .number()
  .positive('Value must be positive');

/**
 * Non-empty string schema
 */
export const nonEmptyStringSchema = z
  .string()
  .min(1, 'Value cannot be empty');

/**
 * UUID schema
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format');

/**
 * ISO timestamp schema
 */
export const timestampSchema = z
  .string()
  .datetime({ message: 'Invalid ISO datetime format' });

// =============================================================================
// Composite Schemas - Hypothesis & Evidence
// =============================================================================

/**
 * Hypothesis schema - used in Bayesian, Abductive, Scientific Method
 */
export const hypothesisSchema = z.object({
  statement: nonEmptyStringSchema.describe('The hypothesis statement'),
  confidence: confidenceSchema.optional().describe('Confidence in the hypothesis'),
  alternatives: z.array(z.string()).optional().describe('Alternative hypotheses'),
});

export type HypothesisInput = z.infer<typeof hypothesisSchema>;

/**
 * Probability with justification schema - used in Bayesian
 */
export const probabilityWithJustificationSchema = z.object({
  probability: probabilitySchema,
  justification: nonEmptyStringSchema.describe('Justification for the probability'),
});

export type ProbabilityWithJustification = z.infer<typeof probabilityWithJustificationSchema>;

/**
 * Probability with calculation schema - used for posterior probabilities
 */
export const probabilityWithCalculationSchema = z.object({
  probability: probabilitySchema,
  calculation: nonEmptyStringSchema.describe('Calculation showing how probability was derived'),
});

export type ProbabilityWithCalculation = z.infer<typeof probabilityWithCalculationSchema>;

/**
 * Evidence schema - used in Bayesian, Evidential
 */
export const evidenceSchema = z.object({
  description: nonEmptyStringSchema.describe('Description of the evidence'),
  likelihoodGivenHypothesis: probabilitySchema.describe('P(E|H) - probability of evidence given hypothesis'),
  likelihoodGivenNotHypothesis: probabilitySchema.describe('P(E|¬H) - probability of evidence given not hypothesis'),
});

export type EvidenceInput = z.infer<typeof evidenceSchema>;

/**
 * Extended evidence schema with support level
 */
export const evidenceWithSupportSchema = evidenceSchema.extend({
  supportLevel: z.enum(['strong', 'moderate', 'weak']).optional(),
  source: z.string().optional(),
});

export type EvidenceWithSupport = z.infer<typeof evidenceWithSupportSchema>;

// =============================================================================
// Composite Schemas - Graph Elements
// =============================================================================

/**
 * Factory for creating node schemas
 * Use for: causal graphs, game trees, dependency graphs
 */
export function createNodeSchema<T extends z.ZodRawShape>(extraFields?: T) {
  const base = z.object({
    id: nonEmptyStringSchema.describe('Unique node identifier'),
    label: nonEmptyStringSchema.describe('Display label for the node'),
  });

  return extraFields ? base.extend(extraFields) : base;
}

/**
 * Factory for creating edge schemas
 * Use for: causal relationships, dependencies, transitions
 */
export function createEdgeSchema<T extends z.ZodRawShape>(extraFields?: T) {
  const base = z.object({
    source: nonEmptyStringSchema.describe('Source node ID'),
    target: nonEmptyStringSchema.describe('Target node ID'),
  });

  return extraFields ? base.extend(extraFields) : base;
}

/**
 * Basic node schema
 */
export const nodeSchema = createNodeSchema();
export type NodeInput = z.infer<typeof nodeSchema>;

/**
 * Weighted node schema - with optional weight/value
 */
export const weightedNodeSchema = createNodeSchema({
  weight: weightSchema.optional(),
  value: z.number().optional(),
});
export type WeightedNodeInput = z.infer<typeof weightedNodeSchema>;

/**
 * Basic edge schema
 */
export const edgeSchema = createEdgeSchema();
export type EdgeInput = z.infer<typeof edgeSchema>;

/**
 * Weighted edge schema - with strength/weight
 */
export const weightedEdgeSchema = createEdgeSchema({
  weight: weightSchema.optional(),
  label: z.string().optional(),
});
export type WeightedEdgeInput = z.infer<typeof weightedEdgeSchema>;

/**
 * Causal edge schema - with relationship type and strength
 */
export const causalEdgeSchema = createEdgeSchema({
  relationship: z.enum(['causes', 'correlates', 'prevents', 'enables', 'inhibits']),
  strength: weightSchema.optional(),
  confidence: confidenceSchema.optional(),
});
export type CausalEdgeInput = z.infer<typeof causalEdgeSchema>;

// =============================================================================
// Composite Schemas - Temporal
// =============================================================================

/**
 * Time point schema
 */
export const timePointSchema = z.object({
  timestamp: z.union([timestampSchema, z.number()]).describe('Time point (ISO string or epoch)'),
  label: z.string().optional().describe('Label for the time point'),
});

export type TimePointInput = z.infer<typeof timePointSchema>;

/**
 * Time interval schema
 */
export const timeIntervalSchema = z.object({
  start: z.union([timestampSchema, z.number()]),
  end: z.union([timestampSchema, z.number()]),
  label: z.string().optional(),
});

export type TimeIntervalInput = z.infer<typeof timeIntervalSchema>;

/**
 * Temporal event schema
 */
export const temporalEventSchema = z.object({
  id: nonEmptyStringSchema,
  description: nonEmptyStringSchema,
  timestamp: z.union([timestampSchema, z.number()]).optional(),
  duration: z.number().optional(),
  precedents: z.array(z.string()).optional().describe('IDs of events that must happen before'),
  consequences: z.array(z.string()).optional().describe('IDs of events that happen after'),
});

export type TemporalEventInput = z.infer<typeof temporalEventSchema>;

// =============================================================================
// Composite Schemas - Mathematical & Scientific
// =============================================================================

/**
 * Mathematical expression schema
 */
export const mathExpressionSchema = z.object({
  expression: nonEmptyStringSchema.describe('Mathematical expression (LaTeX or plain text)'),
  format: z.enum(['latex', 'plaintext', 'mathml']).default('latex'),
  variables: z.record(z.string(), z.number()).optional().describe('Variable bindings'),
});

export type MathExpressionInput = z.infer<typeof mathExpressionSchema>;

/**
 * Unit with value schema - for physics
 */
export const valueWithUnitSchema = z.object({
  value: z.number(),
  unit: nonEmptyStringSchema,
  uncertainty: nonNegativeSchema.optional().describe('Measurement uncertainty'),
});

export type ValueWithUnitInput = z.infer<typeof valueWithUnitSchema>;

/**
 * Scientific measurement schema
 */
export const measurementSchema = z.object({
  quantity: nonEmptyStringSchema.describe('Physical quantity being measured'),
  value: z.number(),
  unit: nonEmptyStringSchema,
  uncertainty: nonNegativeSchema.optional(),
  method: z.string().optional().describe('Measurement method'),
});

export type MeasurementInput = z.infer<typeof measurementSchema>;

// =============================================================================
// Composite Schemas - Game Theory
// =============================================================================

/**
 * Player schema
 */
export const playerSchema = z.object({
  id: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  type: z.enum(['human', 'ai', 'nature']).optional(),
});

export type PlayerInput = z.infer<typeof playerSchema>;

/**
 * Strategy schema
 */
export const strategySchema = z.object({
  id: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  description: z.string().optional(),
  probability: probabilitySchema.optional().describe('Probability of playing this strategy'),
});

export type StrategyInput = z.infer<typeof strategySchema>;

/**
 * Payoff schema
 */
export const payoffSchema = z.object({
  playerId: nonEmptyStringSchema,
  value: z.number(),
  utility: z.number().optional().describe('Utility value if different from raw payoff'),
});

export type PayoffInput = z.infer<typeof payoffSchema>;

// =============================================================================
// Composite Schemas - Reasoning Steps
// =============================================================================

/**
 * Reasoning step schema - for sequential/deductive/inductive
 */
export const reasoningStepSchema = z.object({
  id: nonEmptyStringSchema,
  description: nonEmptyStringSchema,
  type: z.enum(['premise', 'inference', 'conclusion', 'assumption', 'observation']).optional(),
  confidence: confidenceSchema.optional(),
  dependencies: z.array(z.string()).optional().describe('IDs of steps this depends on'),
});

export type ReasoningStepInput = z.infer<typeof reasoningStepSchema>;

/**
 * Logical proposition schema - for formal logic
 */
export const propositionSchema = z.object({
  id: nonEmptyStringSchema,
  statement: nonEmptyStringSchema,
  truthValue: z.boolean().optional(),
  type: z.enum(['axiom', 'premise', 'theorem', 'lemma', 'corollary', 'hypothesis']).optional(),
});

export type PropositionInput = z.infer<typeof propositionSchema>;

/**
 * Inference rule schema
 */
export const inferenceRuleSchema = z.object({
  name: nonEmptyStringSchema,
  premises: z.array(z.string()).describe('Required premise patterns'),
  conclusion: nonEmptyStringSchema.describe('Conclusion pattern'),
  type: z.enum(['deductive', 'inductive', 'abductive']).optional(),
});

export type InferenceRuleInput = z.infer<typeof inferenceRuleSchema>;

// =============================================================================
// Composite Schemas - Constraints & Optimization
// =============================================================================

/**
 * Constraint schema
 */
export const constraintSchema = z.object({
  id: nonEmptyStringSchema,
  description: nonEmptyStringSchema,
  type: z.enum(['hard', 'soft']),
  priority: z.number().optional().describe('Priority for soft constraints'),
  expression: z.string().optional().describe('Mathematical expression'),
});

export type ConstraintInput = z.infer<typeof constraintSchema>;

/**
 * Objective function schema
 */
export const objectiveSchema = z.object({
  description: nonEmptyStringSchema,
  type: z.enum(['minimize', 'maximize']),
  expression: z.string().optional(),
  weight: weightSchema.optional().describe('Weight in multi-objective optimization'),
});

export type ObjectiveInput = z.infer<typeof objectiveSchema>;

/**
 * Solution schema
 */
export const solutionSchema = z.object({
  id: nonEmptyStringSchema,
  values: z.record(z.string(), z.number()).describe('Variable values'),
  objectiveValue: z.number().optional(),
  feasible: z.boolean().optional(),
});

export type SolutionInput = z.infer<typeof solutionSchema>;

// =============================================================================
// Base Thought Schemas
// =============================================================================

/**
 * Base thought fields - common to all thought types
 */
export const baseThoughtSchema = z.object({
  thoughtNumber: z.number().int().positive('Thought number must be positive'),
  totalThoughts: z.number().int().positive('Total thoughts must be positive'),
  nextThoughtNeeded: z.boolean(),
});

export type BaseThoughtInput = z.infer<typeof baseThoughtSchema>;

/**
 * Sequential thought extension
 */
export const sequentialThoughtExtensionSchema = z.object({
  content: nonEmptyStringSchema,
  buildUpon: z.array(z.string()).optional(),
  branchFrom: z.string().optional(),
  branchId: z.string().optional(),
  revisesThought: z.string().optional(),
  revisionReason: z.string().optional(),
  isRevision: z.boolean().optional(),
});

/**
 * Bayesian thought extension
 */
export const bayesianThoughtExtensionSchema = z.object({
  hypothesis: hypothesisSchema,
  prior: probabilityWithJustificationSchema,
  likelihood: probabilityWithJustificationSchema.optional(),
  posterior: probabilityWithCalculationSchema,
  evidence: z.array(evidenceSchema).optional(),
  bayesFactor: nonNegativeSchema.optional(),
});

// =============================================================================
// Schema Helpers
// =============================================================================

/**
 * Create a range schema with custom min/max
 */
export function createRangeSchema(min: number, max: number, fieldName: string = 'Value') {
  return z
    .number()
    .min(min, ValidationMessages.INVALID_RANGE(fieldName, min, max))
    .max(max, ValidationMessages.INVALID_RANGE(fieldName, min, max));
}

/**
 * Create an enum schema from string array
 */
export function createEnumSchema<T extends string>(values: readonly T[], fieldName: string = 'Value') {
  return z.enum(values as [T, ...T[]], {
    message: `${fieldName} must be one of: ${values.join(', ')}`,
  });
}

/**
 * Create an optional string with default
 */
export function createOptionalStringWithDefault(defaultValue: string) {
  return z.string().optional().default(defaultValue);
}

/**
 * Create an optional number with default
 */
export function createOptionalNumberWithDefault(defaultValue: number) {
  return z.number().optional().default(defaultValue);
}

/**
 * Create an optional boolean with default
 */
export function createOptionalBooleanWithDefault(defaultValue: boolean) {
  return z.boolean().optional().default(defaultValue);
}

/**
 * Validate array has unique IDs
 */
export function uniqueIdArraySchema<T extends z.ZodRawShape>(itemSchema: z.ZodObject<T>) {
  return z.array(itemSchema).refine(
    (items) => {
      const ids = items.map((item) => (item as { id: string }).id);
      return new Set(ids).size === ids.length;
    },
    { message: 'Array must contain unique IDs' }
  );
}

/**
 * Validate graph edges reference existing nodes
 */
export function createGraphSchema<N extends z.ZodRawShape, E extends z.ZodRawShape>(
  nodeSchema: z.ZodObject<N>,
  edgeSchema: z.ZodObject<E>
) {
  return z.object({
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema),
  }).refine(
    (graph) => {
      const nodeIds = new Set(graph.nodes.map((n) => (n as { id: string }).id));
      return graph.edges.every((e) => {
        const edge = e as { source: string; target: string };
        return nodeIds.has(edge.source) && nodeIds.has(edge.target);
      });
    },
    { message: 'All edge sources and targets must reference existing nodes' }
  );
}

// =============================================================================
// Export All
// =============================================================================

export const SchemaUtils = {
  // Primitives
  probability: probabilitySchema,
  confidence: confidenceSchema,
  progress: progressSchema,
  weight: weightSchema,
  nonNegative: nonNegativeSchema,
  positive: positiveSchema,
  nonEmptyString: nonEmptyStringSchema,
  uuid: uuidSchema,
  timestamp: timestampSchema,

  // Composites
  hypothesis: hypothesisSchema,
  evidence: evidenceSchema,
  evidenceWithSupport: evidenceWithSupportSchema,
  probabilityWithJustification: probabilityWithJustificationSchema,
  probabilityWithCalculation: probabilityWithCalculationSchema,

  // Graph
  node: nodeSchema,
  weightedNode: weightedNodeSchema,
  edge: edgeSchema,
  weightedEdge: weightedEdgeSchema,
  causalEdge: causalEdgeSchema,

  // Temporal
  timePoint: timePointSchema,
  timeInterval: timeIntervalSchema,
  temporalEvent: temporalEventSchema,

  // Mathematical
  mathExpression: mathExpressionSchema,
  valueWithUnit: valueWithUnitSchema,
  measurement: measurementSchema,

  // Game Theory
  player: playerSchema,
  strategy: strategySchema,
  payoff: payoffSchema,

  // Reasoning
  reasoningStep: reasoningStepSchema,
  proposition: propositionSchema,
  inferenceRule: inferenceRuleSchema,

  // Optimization
  constraint: constraintSchema,
  objective: objectiveSchema,
  solution: solutionSchema,

  // Base
  baseThought: baseThoughtSchema,

  // Factories
  createNodeSchema,
  createEdgeSchema,
  createRangeSchema,
  createEnumSchema,
  createOptionalStringWithDefault,
  createOptionalNumberWithDefault,
  createOptionalBooleanWithDefault,
  uniqueIdArraySchema,
  createGraphSchema,
};
