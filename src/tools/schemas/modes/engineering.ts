/**
 * Engineering Mode Schemas (v8.4.0)
 * Phase 12: ALGORITHMIC mode with CLRS coverage
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Trade study schema
 */
const TradeStudySchema = z.object({
  options: z.array(z.string()),
  criteria: z.array(z.string()),
  weights: z.record(z.string(), z.number()).optional(),
});

/**
 * FMEA entry schema
 */
const FmeaEntrySchema = z.object({
  failureMode: z.string(),
  severity: z.number().int().min(1).max(10),
  occurrence: z.number().int().min(1).max(10),
  detection: z.number().int().min(1).max(10),
  rpn: z.number().int().optional(),
});

/**
 * Complexity analysis schema
 */
const ComplexityAnalysisSchema = z.object({
  timeComplexity: z.string(),
  spaceComplexity: z.string().optional(),
  bestCase: z.string().optional(),
  averageCase: z.string().optional(),
  worstCase: z.string().optional(),
});

/**
 * Correctness proof schema
 */
const CorrectnessProofSchema = z.object({
  invariant: z.string(),
  termination: z.string(),
  correctness: z.string(),
});

/**
 * Design pattern enum
 */
const DesignPatternEnum = z.enum([
  'divide-and-conquer',
  'dynamic-programming',
  'greedy',
  'backtracking',
  'branch-and-bound',
  'randomized',
  'approximation',
]);

/**
 * Engineering reasoning schema
 */
export const EngineeringSchema = BaseThoughtSchema.extend({
  mode: z.enum(['engineering', 'algorithmic']),

  // Engineering mode
  requirementId: z.string().optional(),
  tradeStudy: TradeStudySchema.optional(),
  fmeaEntry: FmeaEntrySchema.optional(),

  // Algorithmic mode (CLRS)
  algorithmName: z.string().optional(),
  designPattern: DesignPatternEnum.optional(),
  complexityAnalysis: ComplexityAnalysisSchema.optional(),
  correctnessProof: CorrectnessProofSchema.optional(),
});

export type EngineeringInput = z.infer<typeof EngineeringSchema>;
