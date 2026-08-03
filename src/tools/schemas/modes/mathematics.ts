/**
 * Mathematics Mode Schemas (v7.0.0)
 * Sprint 5 Task 5.3: Mathematics, Physics modes
 * Sprint 7 Task 7.5: Use shared enums
 * Phase 8 Sprint 4: Proof decomposition fields
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import {
  ProofTypeEnum,
  TransformationEnum,
  IdSchema,
  TextSchema,
  IdArraySchema,
} from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

const ProofStrategySchema = z.object({
  type: ProofTypeEnum,
  steps: IdArraySchema,
});

const MathematicalModelSchema = z.object({
  latex: TextSchema,
  symbolic: TextSchema,
  ascii: TextSchema.optional(),
});

const TensorPropertiesSchema = z.object({
  rank: z.tuple([z.number(), z.number()]),
  components: TextSchema,
  latex: TextSchema,
  symmetries: IdArraySchema,
  invariants: IdArraySchema,
  transformation: TransformationEnum,
});

const PhysicalInterpretationSchema = z.object({
  quantity: IdSchema,
  units: IdSchema,
  conservationLaws: IdArraySchema,
});

/**
 * Phase 8: Proof step input for decomposition
 */
const ProofStepInputSchema = z.object({
  stepNumber: z.number().int().positive(),
  statement: TextSchema,
  justification: TextSchema.optional(),
  latex: TextSchema.optional(),
  referencesSteps: z.array(z.number()).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
});

export const MathSchema = BaseThoughtSchema.extend({
  mode: z.enum(["mathematics", "physics", "computability"]),
  thoughtType: IdSchema.optional(),
  proofStrategy: ProofStrategySchema.optional(),
  mathematicalModel: MathematicalModelSchema.optional(),
  tensorProperties: TensorPropertiesSchema.optional(),
  physicalInterpretation: PhysicalInterpretationSchema.optional(),

  // Phase 8: Proof decomposition fields
  proofSteps: z.array(ProofStepInputSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  theorem: TextSchema.optional(),
  hypotheses: IdArraySchema.optional(),
  analysisDepth: z.enum(["shallow", "standard", "deep"]).optional(),
  includeConsistencyCheck: z.boolean().optional(),
  traceAssumptions: z.boolean().optional(),
});

export type MathInput = z.infer<typeof MathSchema>;
