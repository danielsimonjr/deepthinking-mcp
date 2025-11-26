/**
 * Strategic Mode Schemas (v4.0.0)
 * Sprint 5 Task 5.3: Game Theory, Optimization modes
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Game theory player
 */
const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  isRational: z.boolean(),
  availableStrategies: z.array(z.string()),
  role: z.string().optional(),
});

/**
 * Strategy definition
 */
const StrategySchema = z.object({
  id: z.string(),
  playerId: z.string(),
  name: z.string(),
  description: z.string(),
  isPure: z.boolean(),
  probability: z.number().min(0).max(1).optional(),
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
 * Strategic reasoning schema (Game Theory + Optimization)
 */
export const StrategicSchema = BaseThoughtSchema.extend({
  mode: z.enum(['gametheory', 'optimization']),

  // Game theory specific
  players: z.array(PlayerSchema).optional(),
  strategies: z.array(StrategySchema).optional(),
  payoffMatrix: PayoffMatrixSchema.optional(),
});

export type StrategicInput = z.infer<typeof StrategicSchema>;
