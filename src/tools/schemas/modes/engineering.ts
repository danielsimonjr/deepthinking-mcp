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
  TextArraySchema,
  ConfidenceSchema,
} from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

// ============================================================
// ENGINEERING ANALYSIS (what EngineeringHandler reads)
// ============================================================
//
// EngineeringHandler reads `analysisType`, `designChallenge`, `requirements`,
// `tradeStudy`, `fmea`, `designDecisions` and `assessment`. Zod strips a key
// that its schema does not declare, so until these were declared the handler
// never saw them. Rules for what is declared:
//   - A field the handler reads, or keeps on the stored thought, is declared.
//   - A field the handler computes (`rpn`, `summary`, `weightedScore`) is not:
//     the handler replaces what a client sends.
//   - Vocabulary fields (`analysisType`, `source`, `priority`, `status`, ...) are
//     bounded strings, NOT enums: the handler resolves an unrecognised value or
//     keeps it as sent, and a Zod enum would turn that into a hard rejection.
//   - Every field is optional except where the handler dereferences it
//     (`coverage`, `assessment`): it defaults the rest.

/** One requirement of a traceability matrix. */
const RequirementSchema = z.object({
  id: IdSchema.optional(),
  title: NameSchema.optional(),
  description: TextSchema.optional(),
  /** stakeholder, regulatory, standard, derived, assumption or constraint. */
  source: IdSchema.optional(),
  /** must, should, could or wont. */
  priority: IdSchema.optional(),
  /** draft, approved, implemented, verified, deferred or rejected. */
  status: IdSchema.optional(),
  rationale: TextSchema.optional(),
  /** inspection, analysis, demonstration or test. */
  verificationMethod: IdSchema.optional(),
  verificationCriteria: TextArraySchema.optional(),
  tracesTo: IdArraySchema.optional(),
  satisfiedBy: IdArraySchema.optional(),
  relatedTo: IdArraySchema.optional(),
});

/** Requirements traceability matrix; the handler computes `coverage` when it is omitted. */
const RequirementsSchema = z.object({
  requirements: z
    .array(RequirementSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  coverage: z
    .object({
      total: z.number().int().min(0),
      verified: z.number().int().min(0),
      tracedToSource: z.number().int().min(0),
      allocatedToDesign: z.number().int().min(0),
    })
    .optional(),
});

/** An alternative that a trade study compares. */
const TradeAlternativeSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  pros: TextArraySchema.optional(),
  cons: TextArraySchema.optional(),
  estimatedCost: z.number().optional(),
  /** low, medium or high. */
  riskLevel: IdSchema.optional(),
});

/**
 * A criterion with a weight. A criterion can also be sent as a bare string, which
 * the handler keeps as sent and weighs at 0: see `TradeStudySchema.criteria`.
 */
const TradeCriterionSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  /** 0 to 1; the weights of a study should sum to 1. */
  weight: z.number().optional(),
  unit: IdSchema.optional(),
  higherIsBetter: z.boolean().optional(),
});

/** The score of one alternative on one criterion. */
const TradeScoreSchema = z.object({
  alternativeId: IdSchema.optional(),
  criteriaId: IdSchema.optional(),
  score: z.number().optional(),
  rationale: TextSchema.optional(),
});

/**
 * Trade study.
 *
 * `criteria` takes a string or an object. Before this schema declared the
 * objects, `criteria` was a list of strings, and the handler read it as a list of
 * objects: a string criterion has no `id` and no `weight`, so it weighs 0. The
 * string form stays accepted, and the handler says in `validation.issues` that a
 * string has no weight.
 */
const TradeStudySchema = z.object({
  title: NameSchema.optional(),
  objective: TextSchema.optional(),
  alternatives: z
    .array(TradeAlternativeSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  criteria: z
    .array(z.union([IdSchema, TradeCriterionSchema]))
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  scores: z
    .array(TradeScoreSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  /** Id of the recommended alternative. */
  recommendation: IdSchema.optional(),
  justification: TextSchema.optional(),
  sensitivityNotes: TextSchema.optional(),
});

/** Ratings stay bounded 1-10 when supplied; the handler defaults each one to 1. */
const RatingSchema = z.number().int().min(1).max(10);

/** One failure mode; the handler computes `rpn` as severity x occurrence x detection. */
const FailureModeSchema = z.object({
  id: IdSchema.optional(),
  component: NameSchema.optional(),
  function: TextSchema.optional(),
  failureMode: TextSchema.optional(),
  cause: TextSchema.optional(),
  effect: TextSchema.optional(),
  systemEffect: TextSchema.optional(),
  severity: RatingSchema.optional(),
  occurrence: RatingSchema.optional(),
  detection: RatingSchema.optional(),
  currentControls: TextSchema.optional(),
  mitigation: TextSchema.optional(),
  responsible: NameSchema.optional(),
  targetDate: IdSchema.optional(),
  /** open, in-progress, completed or verified. */
  mitigationStatus: IdSchema.optional(),
});

/** Failure mode and effects analysis; the handler computes `summary`. */
const FmeaSchema = z.object({
  title: NameSchema.optional(),
  system: NameSchema.optional(),
  failureModes: z
    .array(FailureModeSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  /** RPN at or above which action is required; the handler defaults it to 100. */
  rpnThreshold: z.number().optional(),
});

/** An option that a design decision weighed. */
const DecisionAlternativeSchema = z.object({
  option: NameSchema.optional(),
  description: TextSchema.optional(),
  pros: TextArraySchema.optional(),
  cons: TextArraySchema.optional(),
});

/** One design decision record. */
const DesignDecisionSchema = z.object({
  id: IdSchema.optional(),
  title: NameSchema.optional(),
  date: IdSchema.optional(),
  /** proposed, accepted, rejected, deprecated or superseded. */
  status: IdSchema.optional(),
  context: TextSchema.optional(),
  decision: TextSchema.optional(),
  alternatives: z
    .array(DecisionAlternativeSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  rationale: TextSchema.optional(),
  consequences: TextArraySchema.optional(),
  supersededBy: IdSchema.optional(),
  relatedDecisions: IdArraySchema.optional(),
  stakeholders: TextArraySchema.optional(),
});

/** Design decision log. */
const DesignDecisionsSchema = z.object({
  decisions: z
    .array(DesignDecisionSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  projectName: NameSchema.optional(),
});

/** Overall assessment; the handler stores it as sent and reads all four fields. */
const AssessmentSchema = z.object({
  confidence: ConfidenceSchema,
  keyRisks: TextArraySchema,
  nextSteps: TextArraySchema,
  openIssues: TextArraySchema,
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

  // Engineering mode. `analysisType` is a bounded string: an unrecognised value
  // falls back to "comprehensive" and a warning says so.
  analysisType: IdSchema.optional(),
  designChallenge: TextSchema.optional(),
  requirements: RequirementsSchema.optional(),
  tradeStudy: TradeStudySchema.optional(),
  fmea: FmeaSchema.optional(),
  designDecisions: DesignDecisionsSchema.optional(),
  assessment: AssessmentSchema.optional(),

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
