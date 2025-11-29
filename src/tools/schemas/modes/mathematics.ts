/**
 * Mathematics Mode Schemas (v4.1.0)
 * Sprint 5 Task 5.3: Mathematics, Physics modes
 * Sprint 7 Task 7.5: Use shared enums
 */

import { z } from 'zod/v3';
import { BaseThoughtSchema } from '../base.js';
import { ProofTypeEnum, TransformationEnum } from '../shared.js';

const ProofStrategySchema = z.object({
  type: ProofTypeEnum,
  steps: z.array(z.string()),
});

const MathematicalModelSchema = z.object({
  latex: z.string(),
  symbolic: z.string(),
  ascii: z.string().optional(),
});

const TensorPropertiesSchema = z.object({
  rank: z.tuple([z.number(), z.number()]),
  components: z.string(),
  latex: z.string(),
  symmetries: z.array(z.string()),
  invariants: z.array(z.string()),
  transformation: TransformationEnum,
});

const PhysicalInterpretationSchema = z.object({
  quantity: z.string(),
  units: z.string(),
  conservationLaws: z.array(z.string()),
});

export const MathSchema = BaseThoughtSchema.extend({
  mode: z.enum(['mathematics', 'physics']),
  thoughtType: z.string().optional(),
  proofStrategy: ProofStrategySchema.optional(),
  mathematicalModel: MathematicalModelSchema.optional(),
  tensorProperties: TensorPropertiesSchema.optional(),
  physicalInterpretation: PhysicalInterpretationSchema.optional(),
});

export type MathInput = z.infer<typeof MathSchema>;
