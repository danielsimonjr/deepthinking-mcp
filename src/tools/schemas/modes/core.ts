/**
 * Core Mode Schemas (v4.1.0)
 * Sprint 5 Task 5.3: Sequential, Shannon, Hybrid modes
 * Sprint 7 Task 7.5: Use shared enums
 */

import { z } from 'zod/v3';
import { BaseThoughtSchema } from '../base.js';
import { ShannonStageEnum } from '../shared.js';

export const CoreSchema = BaseThoughtSchema.extend({
  mode: z.enum(['sequential', 'shannon', 'hybrid']),
  stage: ShannonStageEnum.optional(),
  activeModes: z.array(z.string()).optional(),
});

export type CoreInput = z.infer<typeof CoreSchema>;
