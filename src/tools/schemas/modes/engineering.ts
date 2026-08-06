/**
 * Engineering Mode Schemas (v8.4.0)
 * Phase 12: ALGORITHMIC mode with CLRS coverage
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import {
  IdSchema,
  NameSchema,
  TextSchema,
  IdArraySchema,
  boundedRecord,
} from "../shared.js";

/**
 * Trade study schema
 */
const TradeStudySchema = z.object({
  options: IdArraySchema.optional(),
  criteria: IdArraySchema.optional(),
  weights: boundedRecord(IdSchema, z.number()).optional(),
});

/**
 * FMEA entry schema
 *
 * Ratings stay bounded 1-10 when supplied, but none is mandatory: the advertised
 * JSON Schema declares no `required` list, and EngineeringHandler defaults every
 * rating when computing RPN.
 */
const FmeaEntrySchema = z.object({
  failureMode: TextSchema.optional(),
  severity: z.number().int().min(1).max(10).optional(),
  occurrence: z.number().int().min(1).max(10).optional(),
  detection: z.number().int().min(1).max(10).optional(),
  rpn: z.number().int().optional(),
});

/**
 * Complexity analysis schema
 */
const ComplexityAnalysisSchema = z.object({
  timeComplexity: IdSchema.optional(),
  spaceComplexity: IdSchema.optional(),
  bestCase: IdSchema.optional(),
  averageCase: IdSchema.optional(),
  worstCase: IdSchema.optional(),
});

/**
 * Correctness proof schema
 */
const CorrectnessProofSchema = z.object({
  invariant: TextSchema.optional(),
  termination: TextSchema.optional(),
  correctness: TextSchema.optional(),
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
