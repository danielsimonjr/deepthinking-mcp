/**
 * Strategic Mode Schemas (v8.4.0)
 * Sprint 5 Task 5.3: Game Theory, Optimization modes
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import { ConfidenceSchema, IdSchema, NameSchema, TextSchema, IdArraySchema , boundedRecord} from "../shared.js";
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
  value: TextSchema,
  variables: boundedRecord(IdSchema, z.number()).optional(),
});

/**
 * Strategic reasoning schema (Game Theory + Optimization)
 */
export const StrategicSchema = BaseThoughtSchema.extend({
  mode: z.enum(["gametheory", "optimization"]),

  // Game theory specific
  players: z.array(PlayerSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  strategies: z.array(StrategySchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  payoffMatrix: PayoffMatrixSchema.optional(),

  // Optimization specific
  objectiveFunction: TextSchema.optional(),
  constraints: IdArraySchema.optional(),
  optimizationMethod: IdSchema.optional(),
  solution: SolutionSchema.optional(),
});

export type StrategicInput = z.infer<typeof StrategicSchema>;
