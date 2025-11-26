/**
 * Causal Mode Schemas (v4.0.0)
 * Sprint 5 Task 5.3: Causal, Counterfactual, Abductive modes
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Causal reasoning schema
 */
export const CausalSchema = BaseThoughtSchema.extend({
  mode: z.enum(['causal', 'counterfactual', 'abductive']),

  // All modes can use causal graphs implicitly
  // Mode-specific properties handled by the runtime
});

export type CausalInput = z.infer<typeof CausalSchema>;
