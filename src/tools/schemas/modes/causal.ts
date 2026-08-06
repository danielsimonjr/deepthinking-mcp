/**
 * Causal Mode Schemas (v4.1.0)
 * Sprint 5 Task 5.3: Causal, Counterfactual, Abductive modes
 * v6.1.2: Added nodes/edges for causal graph support
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import { IdSchema, NameSchema, TextSchema, IdArraySchema } from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

/**
 * Causal node schema
 */
const CausalNodeSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  description: TextSchema.optional(),
  type: z.enum(["cause", "effect", "mediator", "confounder"]).optional(),
});

/**
 * Causal edge schema
 */
const CausalEdgeSchema = z.object({
  from: IdSchema,
  to: IdSchema,
  type: IdSchema.optional(),
  strength: z.number().min(0).max(1).optional(),
});

/**
 * Counterfactual scenario schema
 */
const CounterfactualSchema = z.object({
  actual: TextSchema.optional(),
  hypothetical: TextSchema.optional(),
  consequence: TextSchema.optional(),
});

/**
 * Intervention schema
 */
const InterventionSchema = z.object({
  node: IdSchema,
  value: IdSchema.optional(),
  effect: TextSchema.optional(),
});

export const CausalSchema = BaseThoughtSchema.extend({
  // "abductive" migrated to deepthinking_core; this tool advertises only these two.
  mode: z.enum(["causal", "counterfactual"]),
  // Causal graph properties (top-level for JSON schema compatibility)
  nodes: z
    .array(CausalNodeSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  edges: z
    .array(CausalEdgeSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  // Nested causalGraph for backwards compatibility
  causalGraph: z
    .object({
      nodes: z.array(CausalNodeSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS),
      edges: z.array(CausalEdgeSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS),
    })
    .optional(),
  // Counterfactual properties
  counterfactual: CounterfactualSchema.optional(),
  // Intervention properties
  interventions: z
    .array(InterventionSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  // Observations for abductive reasoning
  observations: IdArraySchema.optional(),
  explanations: z
    .array(
      z.object({
        hypothesis: TextSchema,
        plausibility: z.number().min(0).max(1).optional(),
      }),
    )
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
});

export type CausalInput = z.infer<typeof CausalSchema>;
