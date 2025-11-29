/**
 * Scientific Mode Schemas (v4.1.0)
 * Sprint 5 Task 5.3: Scientific Method, Systems Thinking, Formal Logic modes
 */

import { z } from 'zod/v3';
import { BaseThoughtSchema } from '../base.js';

export const ScientificSchema = BaseThoughtSchema.extend({
  mode: z.enum(['scientificmethod', 'systemsthinking', 'formallogic']),
});

export type ScientificInput = z.infer<typeof ScientificSchema>;
