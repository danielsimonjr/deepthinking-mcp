/**
 * Probabilistic Mode Schemas (v4.1.0)
 * Sprint 5 Task 5.3: Bayesian, Evidential modes
 * Sprint 7 Task 7.5: Use shared schemas
 */

import { z } from 'zod/v3';
import { BaseThoughtSchema } from '../base.js';
import { ConfidenceSchema } from '../shared.js';

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

  // Evidential (Dempster-Shafer) specific
  frameOfDiscernment: z.array(z.string()).optional(),
  beliefMasses: z.array(BeliefMassSchema).optional(),
});

export type ProbabilisticInput = z.infer<typeof ProbabilisticSchema>;
