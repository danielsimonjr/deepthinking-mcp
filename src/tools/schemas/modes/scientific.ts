/**
 * Scientific Mode Schemas (v4.0.0)
 * Sprint 5 Task 5.3: Scientific Method, Systems Thinking, Formal Logic modes
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Scientific reasoning schema
 */
export const ScientificSchema = BaseThoughtSchema.extend({
  mode: z.enum(['scientificmethod', 'systemsthinking', 'formallogic']),

  // Mode-specific properties handled by runtime
});

export type ScientificInput = z.infer<typeof ScientificSchema>;
