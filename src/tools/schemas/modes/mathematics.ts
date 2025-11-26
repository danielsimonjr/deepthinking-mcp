/**
 * Mathematics Mode Schemas (v4.0.0)
 * Sprint 5 Task 5.3: Mathematics, Physics modes
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Proof strategy types
 */
const ProofStrategySchema = z.object({
  type: z.enum(['direct', 'contradiction', 'induction', 'construction', 'contrapositive']),
  steps: z.array(z.string()),
});

/**
 * Mathematical model representation
 */
const MathematicalModelSchema = z.object({
  latex: z.string(),
  symbolic: z.string(),
  ascii: z.string().optional(),
});

/**
 * Tensor properties for physics mode
 */
const TensorPropertiesSchema = z.object({
  rank: z.tuple([z.number(), z.number()]),
  components: z.string(),
  latex: z.string(),
  symmetries: z.array(z.string()),
  invariants: z.array(z.string()),
  transformation: z.enum(['covariant', 'contravariant', 'mixed']),
});

/**
 * Physical interpretation
 */
const PhysicalInterpretationSchema = z.object({
  quantity: z.string(),
  units: z.string(),
  conservationLaws: z.array(z.string()),
});

/**
 * Mathematics and Physics modes schema
 */
export const MathSchema = BaseThoughtSchema.extend({
  mode: z.enum(['mathematics', 'physics']),

  // Mathematics-specific
  thoughtType: z.string().optional(),
  proofStrategy: ProofStrategySchema.optional(),
  mathematicalModel: MathematicalModelSchema.optional(),

  // Physics-specific
  tensorProperties: TensorPropertiesSchema.optional(),
  physicalInterpretation: PhysicalInterpretationSchema.optional(),
});

export type MathInput = z.infer<typeof MathSchema>;
