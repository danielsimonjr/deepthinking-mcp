/**
 * Scientific Mode Schemas (v8.4.0)
 * Sprint 5: Scientific Method, Systems Thinking, Formal Logic
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Experiment schema for scientific method
 */
const ExperimentSchema = z.object({
  id: z.string(),
  description: z.string(),
  result: z.string().optional(),
});

/**
 * System component schema for systems thinking
 */
const SystemComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().optional(),
});

/**
 * Interaction schema for systems thinking
 */
const InteractionSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string(),
});

/**
 * Feedback loop schema for systems thinking
 */
const FeedbackLoopSchema = z.object({
  type: z.enum(['positive', 'negative', 'neutral']),
  components: z.array(z.string()),
});

/**
 * Scientific reasoning schema
 */
export const ScientificSchema = BaseThoughtSchema.extend({
  mode: z.enum(['scientificmethod', 'systemsthinking', 'formallogic']),

  // Scientific method
  hypothesis: z.string().optional(),
  predictions: z.array(z.string()).optional(),
  experiments: z.array(ExperimentSchema).optional(),

  // Systems thinking
  systemComponents: z.array(SystemComponentSchema).optional(),
  interactions: z.array(InteractionSchema).optional(),
  feedbackLoops: z.array(FeedbackLoopSchema).optional(),

  // Formal logic
  premises: z.array(z.string()).optional(),
  conclusion: z.string().optional(),
  inference: z.string().optional(),
});

export type ScientificInput = z.infer<typeof ScientificSchema>;
