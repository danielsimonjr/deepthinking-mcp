/**
 * ExampleMode Zod Schema Template
 *
 * INSTRUCTIONS:
 * 1. Add this schema to: src/validation/schemas.ts
 * 2. Replace "ExampleMode" with your mode name (PascalCase)
 * 3. Replace "examplemode" with your mode name (lowercase)
 * 4. Import shared schemas from src/tools/schemas/shared.ts
 * 5. Define your mode-specific validation rules
 * 6. Remove this instruction block
 *
 * LOCATION: Add near similar mode schemas in src/validation/schemas.ts
 */

import { z } from 'zod';
import { BaseThoughtSchema } from './base.js';  // If needed
// Import shared schemas - CUSTOMIZE based on your needs
// import {
//   ConfidenceSchema,      // 0-1 range for probabilities/confidence
//   PositiveIntSchema,     // Positive integers (1+)
//   LevelEnum,             // 'low' | 'medium' | 'high'
//   TimeUnitEnum,          // Time units
//   ProofTypeEnum,         // Proof strategy types
// } from '../tools/schemas/shared.js';

/**
 * ExampleMode Zod Schema
 *
 * CUSTOMIZE: Add description of what this schema validates
 */
export const ExampleModeSchema = BaseThoughtSchema.extend({
  // Mode identifier - CUSTOMIZE: Replace 'examplemode' with your mode name
  mode: z.literal('examplemode'),

  // Optional thought type - CUSTOMIZE or remove if not needed
  thoughtType: z.enum(['step_type_1', 'step_type_2', 'step_type_3']).optional(),

  // ============================================================
  // MODE-SPECIFIC FIELDS
  // ============================================================
  // CUSTOMIZE: Define your mode's validation schema
  //
  // Common patterns:
  //
  // 1. Simple optional fields:
  //    hypothesis: z.string().min(1).max(1000).optional(),
  //    confidence: ConfidenceSchema.optional(),  // 0-1 range
  //
  // 2. Arrays of objects:
  //    entities: z.array(z.object({
  //      id: z.string(),
  //      name: z.string().min(1).max(200),
  //      type: z.string(),
  //      properties: z.record(z.string(), z.unknown()).optional(),
  //    })).optional(),
  //
  // 3. Nested structures:
  //    analysis: z.object({
  //      findings: z.array(z.string()),
  //      confidence: ConfidenceSchema,
  //      recommendations: z.array(z.string()).optional(),
  //    }).optional(),
  //
  // 4. Enums (use shared or define custom):
  //    priority: LevelEnum.optional(),  // From shared schemas
  //    customEnum: z.enum(['option1', 'option2', 'option3']).optional(),
  //
  // 5. Numbers with constraints:
  //    count: z.number().int().min(0).max(100).optional(),
  //    percentage: z.number().min(0).max(100).optional(),
  //
  // 6. Complex validation with refinement:
  //    startTime: z.number().optional(),
  //    endTime: z.number().optional(),
  // }).refine(
  //   (data) => {
  //     if (data.startTime !== undefined && data.endTime !== undefined) {
  //       return data.startTime < data.endTime;
  //     }
  //     return true;
  //   },
  //   { message: 'startTime must be before endTime' }
  // );
  //
  // USE SHARED SCHEMAS from src/tools/schemas/shared.ts:
  // - ConfidenceSchema - For probabilities, confidence, strength (0-1)
  // - PositiveIntSchema - For counts, indices (1+)
  // - LevelEnum - For low/medium/high scales
  // - TimeUnitEnum - For time units
  // - ProofTypeEnum - For proof strategies
  // - ImpactEnum - For impact assessment (positive/negative/neutral)
  // - ExportFormatEnum - For export formats
  //
  // EXAMPLES from existing modes:
  //
  // Mathematics:
  //   mathematicalModel: z.object({
  //     latex: z.string(),
  //     symbolic: z.string(),
  //     ascii: z.string().optional(),
  //   }).optional(),
  //   proofStrategy: z.object({
  //     type: ProofTypeEnum,
  //     steps: z.array(z.string()),
  //   }).optional(),
  //
  // Temporal:
  //   timeline: z.object({
  //     id: z.string(),
  //     name: z.string(),
  //     timeUnit: TimeUnitEnum,
  //     startTime: z.number().optional(),
  //     endTime: z.number().optional(),
  //     events: z.array(z.string()),
  //   }).optional(),
  //   events: z.array(z.object({
  //     id: z.string(),
  //     name: z.string(),
  //     timestamp: z.number(),
  //     type: z.enum(['instant', 'interval']),
  //   })).optional(),
  //
  // Bayesian:
  //   priorProbability: ConfidenceSchema.optional(),
  //   posteriorProbability: ConfidenceSchema.optional(),
  //   evidence: z.array(z.string()).optional(),
  //   likelihoodRatio: z.number().min(0).optional(),
  //
  // REPLACE THIS COMMENT BLOCK WITH YOUR SCHEMA DEFINITION
});

/**
 * TypeScript type inferred from schema
 * CUSTOMIZE: This provides type safety for inputs
 */
export type ExampleModeInput = z.infer<typeof ExampleModeSchema>;
