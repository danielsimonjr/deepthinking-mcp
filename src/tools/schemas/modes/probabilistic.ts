/**
 * Probabilistic Mode Schemas (v8.4.0)
 * Sprint 5 Task 5.3: Bayesian, Evidential modes
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import {
  ConfidenceSchema,
  IdSchema,
  TextSchema,
  IdArraySchema,
  boundedRecord,
} from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

/**
 * Hypothesis schema for Bayesian reasoning
 */
const HypothesisSchema = z.object({
  id: IdSchema,
  description: TextSchema,
  probability: ConfidenceSchema.optional(),
});

/**
 * Belief mass schema for Dempster-Shafer
 */
const BeliefMassSchema = z.object({
  hypothesisSet: IdArraySchema,
  mass: ConfidenceSchema,
  justification: TextSchema,
});

/**
 * Probabilistic reasoning schema (Bayesian + Evidential)
 */
export const ProbabilisticSchema = BaseThoughtSchema.extend({
  mode: z.enum(["bayesian", "evidential"]),

  // Bayesian reasoning
  hypotheses: z
    .array(HypothesisSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  priorProbability: ConfidenceSchema.optional(),
  likelihood: ConfidenceSchema.optional(),
  posteriorProbability: ConfidenceSchema.optional(),
  evidence: IdArraySchema.optional(),

  // Evidential (Dempster-Shafer) reasoning
  frameOfDiscernment: IdArraySchema.optional(),
  beliefMasses: z
    .array(BeliefMassSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  massFunction: boundedRecord(IdSchema, ConfidenceSchema).optional(),
  beliefFunction: boundedRecord(IdSchema, ConfidenceSchema).optional(),
  plausibilityFunction: boundedRecord(IdSchema, ConfidenceSchema).optional(),
});

export type ProbabilisticInput = z.infer<typeof ProbabilisticSchema>;
