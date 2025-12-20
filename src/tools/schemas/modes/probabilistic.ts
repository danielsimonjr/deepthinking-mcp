/**
 * Probabilistic Mode Schemas (v8.4.0)
 * Sprint 5 Task 5.3: Bayesian, Evidential modes
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';
import { ConfidenceSchema } from '../shared.js';

/**
 * Hypothesis schema for Bayesian reasoning
 */
const HypothesisSchema = z.object({
  id: z.string(),
  description: z.string(),
  probability: ConfidenceSchema.optional(),
});

/**
 * Belief mass schema for Dempster-Shafer
 */
const BeliefMassSchema = z.object({
  hypothesisSet: z.array(z.string()),
  mass: ConfidenceSchema,
  justification: z.string(),
});

/**
 * Probabilistic reasoning schema (Bayesian + Evidential)
 */
export const ProbabilisticSchema = BaseThoughtSchema.extend({
  mode: z.enum(['bayesian', 'evidential']),

  // Bayesian reasoning
  hypotheses: z.array(HypothesisSchema).optional(),
  priorProbability: ConfidenceSchema.optional(),
  likelihood: ConfidenceSchema.optional(),
  posteriorProbability: ConfidenceSchema.optional(),
  evidence: z.array(z.string()).optional(),

  // Evidential (Dempster-Shafer) reasoning
  frameOfDiscernment: z.array(z.string()).optional(),
  beliefMasses: z.array(BeliefMassSchema).optional(),
  massFunction: z.record(z.string(), ConfidenceSchema).optional(),
  beliefFunction: z.record(z.string(), ConfidenceSchema).optional(),
  plausibilityFunction: z.record(z.string(), ConfidenceSchema).optional(),
});

export type ProbabilisticInput = z.infer<typeof ProbabilisticSchema>;
