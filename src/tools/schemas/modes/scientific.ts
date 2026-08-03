/**
 * Scientific Mode Schemas (v8.4.0)
 * Sprint 5: Scientific Method, Systems Thinking, Formal Logic
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import { IdSchema, NameSchema, TextSchema, IdArraySchema } from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

/**
 * Experiment schema for scientific method
 */
const ExperimentSchema = z.object({
  id: IdSchema,
  description: TextSchema,
  result: TextSchema.optional(),
});

/**
 * System component schema for systems thinking
 */
const SystemComponentSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  role: TextSchema.optional(),
});

/**
 * Interaction schema for systems thinking
 */
const InteractionSchema = z.object({
  from: IdSchema,
  to: IdSchema,
  type: IdSchema,
});

/**
 * Feedback loop schema for systems thinking
 */
const FeedbackLoopSchema = z.object({
  type: z.enum(["positive", "negative", "neutral"]),
  components: IdArraySchema,
});

/**
 * Scientific reasoning schema
 */
export const ScientificSchema = BaseThoughtSchema.extend({
  mode: z.enum(["scientificmethod", "systemsthinking", "formallogic"]),

  // Scientific method
  hypothesis: TextSchema.optional(),
  predictions: IdArraySchema.optional(),
  experiments: z.array(ExperimentSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),

  // Systems thinking
  systemComponents: z.array(SystemComponentSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  interactions: z.array(InteractionSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  feedbackLoops: z.array(FeedbackLoopSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),

  // Formal logic
  premises: IdArraySchema.optional(),
  conclusion: TextSchema.optional(),
  inference: TextSchema.optional(),
});

export type ScientificInput = z.infer<typeof ScientificSchema>;
