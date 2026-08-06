/**
 * Analytical Mode Schemas (v8.4.0)
 * Sprint 5 Task 5.3: Analogical, First Principles modes
 * Phase 6: Added Meta-Reasoning mode
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import { ConfidenceSchema, IdSchema, IdArraySchema } from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

/**
 * Domain schema for analogical reasoning
 */
const DomainSchema = z.object({
  domain: IdSchema.optional(),
  elements: IdArraySchema.optional(),
  relations: IdArraySchema.optional(),
});

/**
 * Mapping schema for analogical reasoning
 */
const MappingSchema = z.object({
  source: IdSchema,
  target: IdSchema,
  confidence: ConfidenceSchema.optional(),
});

/**
 * Analytical reasoning schema
 */
export const AnalyticalSchema = BaseThoughtSchema.extend({
  mode: z.enum([
    "analogical",
    "firstprinciples",
    "metareasoning",
    "cryptanalytic",
  ]),

  // Analogical reasoning
  sourceAnalogy: DomainSchema.optional(),
  targetAnalogy: DomainSchema.optional(),
  mappings: z
    .array(MappingSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),

  // First principles reasoning
  fundamentals: IdArraySchema.optional(),
  derivedInsights: IdArraySchema.optional(),
});

export type AnalyticalInput = z.infer<typeof AnalyticalSchema>;
