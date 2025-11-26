/**
 * Core Mode Schemas (v4.0.0)
 * Sprint 5 Task 5.3: Sequential, Shannon, Hybrid modes
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Shannon methodology stages
 */
const ShannonStageEnum = z.enum([
  'problem_definition',
  'constraints',
  'model',
  'proof',
  'implementation',
]);

/**
 * Core thinking modes schema
 */
export const CoreSchema = BaseThoughtSchema.extend({
  mode: z.enum(['sequential', 'shannon', 'hybrid']),

  // Shannon-specific
  stage: ShannonStageEnum.optional(),

  // Hybrid-specific: tracks which modes are combined
  activeModes: z.array(z.string()).optional(),
});

export type CoreInput = z.infer<typeof CoreSchema>;
