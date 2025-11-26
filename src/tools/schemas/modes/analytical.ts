/**
 * Analytical Mode Schemas (v4.0.0)
 * Sprint 5 Task 5.3: Analogical, First Principles modes
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Analytical reasoning schema
 */
export const AnalyticalSchema = BaseThoughtSchema.extend({
  mode: z.enum(['analogical', 'firstprinciples']),

  // Mode-specific properties handled by runtime
});

export type AnalyticalInput = z.infer<typeof AnalyticalSchema>;
