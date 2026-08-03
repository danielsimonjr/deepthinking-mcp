/**
 * Engineering Mode Schemas (v8.4.0)
 * Phase 12: ALGORITHMIC mode with CLRS coverage
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import { IdSchema, NameSchema, TextSchema, IdArraySchema } from "../shared.js";

/**
 * Trade study schema
 */
const TradeStudySchema = z.object({
  options: IdArraySchema,
  criteria: IdArraySchema,
  weights: z.record(IdSchema, z.number()).optional(),
});

/**
 * FMEA entry schema
 */
const FmeaEntrySchema = z.object({
  failureMode: TextSchema,
  severity: z.number().int().min(1).max(10),
  occurrence: z.number().int().min(1).max(10),
  detection: z.number().int().min(1).max(10),
  rpn: z.number().int().optional(),
});

/**
 * Complexity analysis schema
 */
const ComplexityAnalysisSchema = z.object({
  timeComplexity: IdSchema,
  spaceComplexity: IdSchema.optional(),
  bestCase: IdSchema.optional(),
  averageCase: IdSchema.optional(),
  worstCase: IdSchema.optional(),
});

/**
 * Correctness proof schema
 */
const CorrectnessProofSchema = z.object({
  invariant: TextSchema,
  termination: TextSchema,
  correctness: TextSchema,
});

/**
 * Design pattern enum
 */
const DesignPatternEnum = z.enum([
  "divide-and-conquer",
  "dynamic-programming",
  "greedy",
  "backtracking",
  "branch-and-bound",
  "randomized",
  "approximation",
]);

/**
 * Engineering reasoning schema
 */
export const EngineeringSchema = BaseThoughtSchema.extend({
  mode: z.enum(["engineering", "algorithmic"]),

  // Engineering mode
  requirementId: IdSchema.optional(),
  tradeStudy: TradeStudySchema.optional(),
  fmeaEntry: FmeaEntrySchema.optional(),

  // Algorithmic mode (CLRS)
  algorithmName: NameSchema.optional(),
  designPattern: DesignPatternEnum.optional(),
  complexityAnalysis: ComplexityAnalysisSchema.optional(),
  correctnessProof: CorrectnessProofSchema.optional(),
});

export type EngineeringInput = z.infer<typeof EngineeringSchema>;
