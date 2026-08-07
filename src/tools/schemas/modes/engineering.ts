/**
 * Engineering Mode Schemas (v8.4.0)
 * Phase 12: ALGORITHMIC mode with CLRS coverage
 * Phase 15: Aligned with JSON schema for complete validation
 * v9.3.4: Added recursive mode (was unreachable through any MCP tool)
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
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

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

// ============================================================
// RECURSIVE DECOMPOSITION (v9.3.4)
// ============================================================
//
// `recursive` had a full handler (RecursiveHandler), a registered validator and
// a place in FULLY_IMPLEMENTED_MODES, but no tool accepted the value, so no MCP
// client could ever select it. It belongs here because recursion IS algorithm
// design: RecursiveHandler's strategies (divide_and_conquer,
// decrease_and_conquer, transform_and_conquer, dynamic_programming) are the
// CLRS design patterns `algorithmic` already advertises, and its `recurrence`
// carries the same time/space complexity that `complexityAnalysis` does.
//
// Vocabulary fields (`thoughtType`, `strategy`, subproblem `status`) are
// bounded strings, NOT enums: RecursiveHandler warns on or silently defaults an
// unrecognised value. A Zod enum would turn that into a hard rejection. Note
// this is why `strategy` is not reused as the existing `designPattern` enum --
// the two vocabularies differ (`divide_and_conquer` vs `divide-and-conquer`).

/** One subproblem produced by the decomposition. */
const SubproblemSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  /** Problem size: numeric (n/2) or symbolic ("n-1"). */
  size: z.union([IdSchema, z.number()]).optional(),
  depth: z.number().int().min(0).optional(),
  parentId: IdSchema.optional(),
  status: IdSchema.optional(),
  result: TextSchema.optional(),
});

/** A terminating case of the recursion. */
const BaseCaseSchema = z.object({
  id: IdSchema.optional(),
  condition: TextSchema.optional(),
  result: TextSchema.optional(),
  verified: z.boolean().optional(),
});

/** The recurrence relation and, if solved, its closed form. */
const RecurrenceRelationSchema = z.object({
  formula: TextSchema.optional(),
  baseCase: TextSchema.optional(),
  closedForm: TextSchema.optional(),
  complexity: IdSchema.optional(),
});

/**
 * Engineering reasoning schema (+ Recursive decomposition)
 */
export const EngineeringSchema = BaseThoughtSchema.extend({
  mode: z.enum(["engineering", "algorithmic", "recursive"]),

  /** Mode-specific step label; every handler here resolves it leniently. */
  thoughtType: IdSchema.optional(),

  // Engineering mode
  requirementId: IdSchema.optional(),
  tradeStudy: TradeStudySchema.optional(),
  fmeaEntry: FmeaEntrySchema.optional(),

  // Algorithmic mode (CLRS)
  algorithmName: NameSchema.optional(),
  designPattern: DesignPatternEnum.optional(),
  complexityAnalysis: ComplexityAnalysisSchema.optional(),
  correctnessProof: CorrectnessProofSchema.optional(),

  // Recursive mode
  subproblems: z
    .array(SubproblemSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  baseCases: z
    .array(BaseCaseSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  baseCaseReached: z.boolean().optional(),
  currentDepth: z.number().int().min(0).optional(),
  maxDepth: z.number().int().min(0).optional(),
  recurrence: RecurrenceRelationSchema.optional(),
  strategy: IdSchema.optional(),
  divisionFactor: z.number().optional(),
});

export type EngineeringInput = z.infer<typeof EngineeringSchema>;
