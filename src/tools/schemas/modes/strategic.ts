/**
 * Strategic Mode Schemas (v4.1.0)
 * Sprint 5 Task 5.3: Game Theory, Optimization modes
 * Sprint 7 Task 7.5: Use shared schemas
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
 * Strategic reasoning schema (Game Theory + Optimization)
 */
export const StrategicSchema = BaseThoughtSchema.extend({
  mode: z.enum(['gametheory', 'optimization', 'algorithmic']),

  // Game theory specific
  players: z.array(PlayerSchema).optional(),
  strategies: z.array(StrategySchema).optional(),
  payoffMatrix: PayoffMatrixSchema.optional(),
});

export type StrategicInput = z.infer<typeof StrategicSchema>;
