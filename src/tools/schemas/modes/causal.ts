/**
 * Causal Mode Schemas (v4.1.0)
 * Sprint 5 Task 5.3: Causal, Counterfactual, Abductive modes
 * v6.1.2: Added nodes/edges for causal graph support
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Causal node schema
 */
const CausalNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['cause', 'effect', 'mediator', 'confounder']).optional(),
});

/**
 * Causal edge schema
 */
const CausalEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string().optional(),
  strength: z.number().min(0).max(1).optional(),
});

/**
 * Counterfactual scenario schema
 */
const CounterfactualSchema = z.object({
  actual: z.string().optional(),
  hypothetical: z.string().optional(),
  consequence: z.string().optional(),
});

/**
 * Intervention schema
 */
const InterventionSchema = z.object({
  node: z.string(),
  value: z.string().optional(),
  effect: z.string().optional(),
});

export const CausalSchema = BaseThoughtSchema.extend({
  mode: z.enum(['causal', 'counterfactual', 'abductive']),
  // Causal graph properties (top-level for JSON schema compatibility)
  nodes: z.array(CausalNodeSchema).optional(),
  edges: z.array(CausalEdgeSchema).optional(),
  // Nested causalGraph for backwards compatibility
  causalGraph: z.object({
    nodes: z.array(CausalNodeSchema),
    edges: z.array(CausalEdgeSchema),
  }).optional(),
  // Counterfactual properties
  counterfactual: CounterfactualSchema.optional(),
  // Intervention properties
  interventions: z.array(InterventionSchema).optional(),
  // Observations for abductive reasoning
  observations: z.array(z.string()).optional(),
  explanations: z.array(z.object({
    hypothesis: z.string(),
    plausibility: z.number().min(0).max(1).optional(),
  })).optional(),
});

export type CausalInput = z.infer<typeof CausalSchema>;
