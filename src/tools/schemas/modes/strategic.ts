/**
 * Strategic Mode Schemas (v8.4.0)
 * Sprint 5 Task 5.3: Game Theory, Optimization modes
 * Phase 15: Aligned with JSON schema for complete validation
 * v9.3.4: Added constraint mode (was unreachable through any MCP tool)
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import {
  ConfidenceSchema,
  IdSchema,
  NameSchema,
  TextSchema,
  IdArraySchema,
  boundedRecord,
} from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

const PlayerSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  isRational: z.boolean(),
  availableStrategies: IdArraySchema,
  role: TextSchema.optional(),
});

const StrategySchema = z.object({
  id: IdSchema,
  playerId: IdSchema,
  name: NameSchema,
  description: TextSchema,
  isPure: z.boolean(),
  probability: ConfidenceSchema.optional(),
});

/**
 * Payoff entry
 */
const PayoffEntrySchema = z.object({
  strategyProfile: IdArraySchema,
  payoffs: z.array(z.number()).max(MAX_LENGTHS.ARRAY_ITEMS),
});

/**
 * Payoff matrix
 */
const PayoffMatrixSchema = z.object({
  players: IdArraySchema,
  dimensions: z.array(z.number()).max(MAX_LENGTHS.ARRAY_ITEMS),
  payoffs: z.array(PayoffEntrySchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS),
});

/**
 * Solution schema for optimization
 */
const SolutionSchema = z.object({
  value: TextSchema.optional(),
  variables: boundedRecord(IdSchema, z.number()).optional(),
});

// ============================================================
// CONSTRAINT SATISFACTION (v9.3.4)
// ============================================================
//
// `constraint` had a full handler (ConstraintHandler), a registered validator
// and a place in FULLY_IMPLEMENTED_MODES, but no tool accepted the value, so no
// MCP client could ever select it. It belongs here because a CSP is the
// feasibility half of the search problem `optimization` already owns -- same
// decision variables, same constraint set, different question ("is there a
// consistent assignment?" rather than "which assignment is best?").
//
// NAMING: the CSP constraint objects are advertised as `cspConstraints`, NOT
// `constraints`. `constraints` already exists on this tool as an array of
// strings for optimization; redefining it as an array of objects would silently
// break every existing optimization caller. ConstraintHandler already reads
// `input.constraints || input.cspConstraints`, so the alias needs no handler
// change.
//
// Vocabulary fields (`thoughtType`, `strategy`-like values, constraint `type`
// and `priority`, `solutionStatus`) are bounded strings, NOT enums:
// ConstraintHandler warns on or silently defaults an unrecognised value. A Zod
// enum would turn that into a hard rejection.

/** A CSP decision variable and its (possibly reduced) domain. */
const CSPVariableSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  domain: z
    .array(z.union([IdSchema, z.number()]))
    .max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  currentValue: z.union([IdSchema, z.number()]).optional(),
  domainReduced: z.boolean().optional(),
  assignedAt: z.number().int().min(0).optional(),
});

/** A constraint over one or more CSP variables. */
const CSPConstraintSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  type: IdSchema.optional(),
  variables: IdArraySchema.optional(),
  expression: TextSchema.optional(),
  satisfied: z.boolean().optional(),
  priority: IdSchema.optional(),
  weight: z.number().optional(),
});

/** A directed arc in the constraint graph, used for arc consistency. */
const ArcSchema = z.object({
  from: IdSchema.optional(),
  to: IdSchema.optional(),
  constraintId: IdSchema.optional(),
});

/** One step of the search: a value assigned to a variable, or a backtrack. */
const AssignmentHistoryEntrySchema = z.object({
  variableId: IdSchema.optional(),
  value: z.union([IdSchema, z.number()]).optional(),
  step: z.number().int().min(0).optional(),
  backtracked: z.boolean().optional(),
});

/**
 * Strategic reasoning schema (Game Theory + Optimization + Constraint)
 */
export const StrategicSchema = BaseThoughtSchema.extend({
  mode: z.enum(["gametheory", "optimization", "constraint"]),

  /** Mode-specific step label; every handler here resolves it leniently. */
  thoughtType: IdSchema.optional(),

  // Game theory specific
  players: z.array(PlayerSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  strategies: z
    .array(StrategySchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  payoffMatrix: PayoffMatrixSchema.optional(),

  // Optimization specific
  objectiveFunction: TextSchema.optional(),
  constraints: IdArraySchema.optional(),
  optimizationMethod: IdSchema.optional(),
  solution: SolutionSchema.optional(),

  // Constraint satisfaction specific
  variables: z
    .array(CSPVariableSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  cspConstraints: z
    .array(CSPConstraintSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  currentAssignments: boundedRecord(
    IdSchema,
    z.union([IdSchema, z.number()]),
  ).optional(),
  assignmentHistory: z
    .array(AssignmentHistoryEntrySchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  arcs: z.array(ArcSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  backtracks: z.number().int().min(0).optional(),
  searchStep: z.number().int().min(0).optional(),
  isArcConsistent: z.boolean().optional(),
  solutionStatus: IdSchema.optional(),
  solutionCount: z.number().int().min(0).optional(),
});

export type StrategicInput = z.infer<typeof StrategicSchema>;
