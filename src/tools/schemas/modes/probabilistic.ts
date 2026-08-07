/**
 * Probabilistic Mode Schemas (v8.4.0)
 * Sprint 5 Task 5.3: Bayesian, Evidential modes
 * Phase 15: Aligned with JSON schema for complete validation
 * v9.3.4: Added stochastic mode (was unreachable through any MCP tool)
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

/**
 * Hypothesis schema for Bayesian reasoning
 */
const HypothesisSchema = z.object({
  id: IdSchema,
  description: TextSchema,
  probability: ConfidenceSchema.optional(),
});

// ============================================================
// STOCHASTIC REASONING (v9.3.4)
// ============================================================
//
// `stochastic` had a full handler (StochasticHandler), a registered validator
// and a place in FULLY_IMPLEMENTED_MODES, but no tool accepted the value, so no
// MCP client could ever select it. It belongs here because it is the
// process-over-time member of the same family: bayesian updates a belief,
// evidential combines masses, stochastic evolves a distribution.
// StochasticHandler's own `relatedModes` names BAYESIAN first, and
// `src/types/modes/recommendations.ts` routes monte-carlo / markov / queueing /
// random-walk / random-process problems to it.
//
// Vocabulary fields (`thoughtType`, `processType`, `distribution`) are bounded
// strings, NOT enums, on purpose: StochasticHandler WARNS on an unrecognised
// value and carries on. A Zod enum would turn that advisory warning into a hard
// rejection. The accepted values are listed in the advertised description.
//
// Field names follow what StochasticHandler actually reads, which is not always
// what `src/types/modes/stochastic.ts` declares: the handler's transitions use
// `fromState`/`toState` (the declared type says `from`/`to`), and it accepts
// both `simulations` and `simulationResults`.

/** A state in the stochastic process. */
const StochasticStateSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  probability: ConfidenceSchema.optional(),
  isAbsorbing: z.boolean().optional(),
  isTransient: z.boolean().optional(),
});

/** A probabilistic transition between two states. */
const StateTransitionSchema = z.object({
  id: IdSchema.optional(),
  fromState: IdSchema.optional(),
  toState: IdSchema.optional(),
  probability: ConfidenceSchema.optional(),
  condition: TextSchema.optional(),
});

/** A Markov chain: states, transitions and an initial distribution. */
const MarkovChainSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  states: z
    .array(StochasticStateSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  transitions: z
    .array(StateTransitionSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  initialDistribution: boundedRecord(IdSchema, z.number()).optional(),
  isIrreducible: z.boolean().optional(),
  isErgodic: z.boolean().optional(),
  period: z.number().int().min(1).optional(),
});

/** A random variable with its distribution and (optionally) observed draws. */
const RandomVariableSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  distribution: IdSchema.optional(),
  parameters: boundedRecord(IdSchema, z.number()).optional(),
  samples: z.array(z.number()).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
  expectedValue: z.number().optional(),
  variance: z.number().optional(),
});

/** One Monte Carlo run's summary statistics. */
const SimulationResultSchema = z.object({
  id: IdSchema.optional(),
  iterations: z.number().int().min(0).optional(),
  mean: z.number().optional(),
  variance: z.number().optional(),
  confidenceInterval: z.tuple([z.number(), z.number()]).optional(),
  samples: z.array(z.number()).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
});

/**
 * Probabilistic reasoning schema (Bayesian + Evidential + Stochastic)
 */
export const ProbabilisticSchema = BaseThoughtSchema.extend({
  mode: z.enum(["bayesian", "evidential", "stochastic"]),

  /** Mode-specific step label; every handler here resolves it leniently. */
  thoughtType: IdSchema.optional(),

  // Bayesian reasoning
  hypotheses: z
    .array(HypothesisSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  priorProbability: ConfidenceSchema.optional(),
  likelihood: ConfidenceSchema.optional(),
  posteriorProbability: ConfidenceSchema.optional(),
  evidence: IdArraySchema.optional(),

  // Evidential (Dempster-Shafer) reasoning
  frameOfDiscernment: IdArraySchema.optional(),
  // `beliefMasses` was superseded by `massFunction`, the only form EvidentialHandler reads.
  massFunction: boundedRecord(IdSchema, ConfidenceSchema).optional(),
  beliefFunction: boundedRecord(IdSchema, ConfidenceSchema).optional(),
  plausibilityFunction: boundedRecord(IdSchema, ConfidenceSchema).optional(),

  // Stochastic reasoning
  processType: IdSchema.optional(),
  stepCount: z.number().int().min(0).optional(),
  currentState: IdSchema.optional(),
  stateHistory: IdArraySchema.optional(),
  markovChain: MarkovChainSchema.optional(),
  randomVariables: z
    .array(RandomVariableSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  simulations: z
    .array(SimulationResultSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  // Alias StochasticHandler also reads. Both are advertised because the
  // handler's createThought() accepts either, while its validate() inspects
  // ONLY `simulationResults` for the low-iteration-count warning -- advertising
  // just one of the two would leave half the handler unreachable.
  simulationResults: z
    .array(SimulationResultSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
});

export type ProbabilisticInput = z.infer<typeof ProbabilisticSchema>;
