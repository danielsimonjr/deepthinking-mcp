/**
 * Probabilistic Mode Schemas (v4.0.0)
 * Sprint 5 Task 5.3: Bayesian, Evidential modes
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Belief mass assignment for Dempster-Shafer
 */
const BeliefMassSchema = z.object({
  hypothesisSet: z.array(z.string()),
  mass: z.number().min(0).max(1),
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
