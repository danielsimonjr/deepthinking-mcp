/**
 * Analytical Mode Schemas (v8.4.0)
 * Sprint 5 Task 5.3: Analogical, First Principles modes
 * Phase 6: Added Meta-Reasoning mode
 * Phase 15: Aligned with JSON schema for complete validation
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';
import { ConfidenceSchema } from '../shared.js';

/**
 * Domain schema for analogical reasoning
 */
const DomainSchema = z.object({
  domain: z.string(),
  elements: z.array(z.string()).optional(),
  relations: z.array(z.string()).optional(),
});

/**
 * Mapping schema for analogical reasoning
 */
const MappingSchema = z.object({
  source: z.string(),
  target: z.string(),
  confidence: ConfidenceSchema.optional(),
});

/**
 * Analytical reasoning schema
 */
export const AnalyticalSchema = BaseThoughtSchema.extend({
  mode: z.enum(['analogical', 'firstprinciples', 'metareasoning', 'cryptanalytic']),

  // Analogical reasoning
  sourceAnalogy: DomainSchema.optional(),
  targetAnalogy: DomainSchema.optional(),
  mappings: z.array(MappingSchema).optional(),

  // First principles reasoning
  fundamentals: z.array(z.string()).optional(),
  derivedInsights: z.array(z.string()).optional(),
});

export type AnalyticalInput = z.infer<typeof AnalyticalSchema>;
