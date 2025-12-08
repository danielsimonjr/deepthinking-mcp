/**
 * Analytical Mode Schemas (v6.0.0)
 * Sprint 5 Task 5.3: Analogical, First Principles modes
 * Phase 6: Added Meta-Reasoning mode
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

export const AnalyticalSchema = BaseThoughtSchema.extend({
  mode: z.enum(['analogical', 'firstprinciples', 'metareasoning', 'cryptanalytic', 'synthesis', 'argumentation', 'critique', 'analysis']),
});

export type AnalyticalInput = z.infer<typeof AnalyticalSchema>;
