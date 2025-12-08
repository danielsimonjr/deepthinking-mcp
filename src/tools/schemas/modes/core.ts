/**
 * Core Mode Schemas (v5.0.0)
 * Phase 5 Sprint 2: Renamed to reflect restructuring
 * - StandardSchema: Sequential, Shannon, Hybrid modes (was CoreSchema)
 * - CoreModeSchema: Inductive, Deductive, Abductive modes (NEW)
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';
import { ShannonStageEnum } from '../shared.js';

/**
 * Standard workflow modes (sequential, shannon, hybrid)
 * Renamed from CoreSchema in v5.0.0
 */
export const StandardSchema = BaseThoughtSchema.extend({
  mode: z.enum(['sequential', 'shannon', 'hybrid']),
  stage: ShannonStageEnum.optional(),
  activeModes: z.array(z.string()).optional(),
});

/**
 * Core reasoning modes (inductive, deductive, abductive)
 * NEW in v5.0.0
 */
export const CoreModeSchema = BaseThoughtSchema.extend({
  mode: z.enum(['inductive', 'deductive', 'abductive']),
  // Inductive properties
  observations: z.array(z.string()).optional(),
  pattern: z.string().optional(),
  generalization: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  counterexamples: z.array(z.string()).optional(),
  sampleSize: z.number().int().min(1).optional(),
  // Deductive properties
  premises: z.array(z.string()).optional(),
  conclusion: z.string().optional(),
  logicForm: z.string().optional(),
  validityCheck: z.boolean().optional(),
  soundnessCheck: z.boolean().optional(),
  // Abductive properties
  hypotheses: z.array(z.object({
    id: z.string(),
    explanation: z.string(),
    score: z.number().optional(),
  })).optional(),
  bestExplanation: z.object({
    id: z.string(),
    explanation: z.string(),
    score: z.number().optional(),
  }).optional(),
});

// Backward compatibility export
export const CoreSchema = StandardSchema;

export type StandardInput = z.infer<typeof StandardSchema>;
export type CoreModeInput = z.infer<typeof CoreModeSchema>;
export type CoreInput = z.infer<typeof CoreSchema>;
