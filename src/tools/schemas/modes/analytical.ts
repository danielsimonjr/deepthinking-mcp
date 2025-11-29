/**
 * Analytical Mode Schemas (v4.1.0)
 * Sprint 5 Task 5.3: Analogical, First Principles modes
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

export const AnalyticalSchema = BaseThoughtSchema.extend({
  mode: z.enum(['analogical', 'firstprinciples']),
});

export type AnalyticalInput = z.infer<typeof AnalyticalSchema>;
