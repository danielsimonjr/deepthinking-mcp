/**
 * Mathematics Mode Schemas (v7.0.0)
 * Sprint 5 Task 5.3: Mathematics, Physics modes
 * Sprint 7 Task 7.5: Use shared enums
 * Phase 8 Sprint 4: Proof decomposition fields
 */

import { z } from 'zod';
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

/**
 * Phase 8: Proof step input for decomposition
 */
const ProofStepInputSchema = z.object({
  stepNumber: z.number().int().positive(),
  statement: z.string(),
  justification: z.string().optional(),
  latex: z.string().optional(),
  referencesSteps: z.array(z.number()).optional(),
});

export const MathSchema = BaseThoughtSchema.extend({
  mode: z.enum(['mathematics', 'physics']),
  thoughtType: z.string().optional(),
  proofStrategy: ProofStrategySchema.optional(),
  mathematicalModel: MathematicalModelSchema.optional(),
  tensorProperties: TensorPropertiesSchema.optional(),
  physicalInterpretation: PhysicalInterpretationSchema.optional(),

  // Phase 8: Proof decomposition fields
  proofSteps: z.array(ProofStepInputSchema).optional(),
  theorem: z.string().optional(),
  hypotheses: z.array(z.string()).optional(),
  analysisDepth: z.enum(['shallow', 'standard', 'deep']).optional(),
  includeConsistencyCheck: z.boolean().optional(),
  traceAssumptions: z.boolean().optional(),
});

export type MathInput = z.infer<typeof MathSchema>;
