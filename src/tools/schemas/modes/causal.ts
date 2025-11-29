/**
 * Causal Mode Schemas (v4.1.0)
 * Sprint 5 Task 5.3: Causal, Counterfactual, Abductive modes
 */

import { z } from 'zod/v3';
import { BaseThoughtSchema } from '../base.js';

export const CausalSchema = BaseThoughtSchema.extend({
  mode: z.enum(['causal', 'counterfactual', 'abductive']),
});

export type CausalInput = z.infer<typeof CausalSchema>;
