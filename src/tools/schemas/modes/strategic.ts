/**
 * Strategic Mode Schemas (v8.4.0)
 * Sprint 5 Task 5.3: Game Theory, Optimization modes
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';
import { ConfidenceSchema } from '../shared.js';

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  isRational: z.boolean(),
  availableStrategies: z.array(z.string()),
  role: z.string().optional(),
});

const StrategySchema = z.object({
  id: z.string(),
  playerId: z.string(),
  name: z.string(),
  description: z.string(),
  isPure: z.boolean(),
  probability: ConfidenceSchema.optional(),
});

/**
 * Payoff entry
 */
const PayoffEntrySchema = z.object({
  strategyProfile: z.array(z.string()),
  payoffs: z.array(z.number()),
});

/**
 * Payoff matrix
 */
const PayoffMatrixSchema = z.object({
  players: z.array(z.string()),
  dimensions: z.array(z.number()),
  payoffs: z.array(PayoffEntrySchema),
});

/**
 * Solution schema for optimization
 */
const SolutionSchema = z.object({
  value: z.string(),
  variables: z.record(z.string(), z.number()).optional(),
});

/**
 * Strategic reasoning schema (Game Theory + Optimization)
 */
export const StrategicSchema = BaseThoughtSchema.extend({
  mode: z.enum(['gametheory', 'optimization']),

  // Game theory specific
  players: z.array(PlayerSchema).optional(),
  strategies: z.array(StrategySchema).optional(),
  payoffMatrix: PayoffMatrixSchema.optional(),

  // Optimization specific
  objectiveFunction: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  optimizationMethod: z.string().optional(),
  solution: SolutionSchema.optional(),
});

export type StrategicInput = z.infer<typeof StrategicSchema>;
