/**
 * ExampleMode Zod Schema Template
 *
 * INSTRUCTIONS:
 * This is a CODE SNIPPET to add to src/validation/schemas.ts
 * It is NOT a standalone file.
 *
 * 1. Open src/validation/schemas.ts
 * 2. Add the schema below near similar mode schemas
 * 3. Replace "ExampleMode" with your mode name (PascalCase)
 * 4. Replace "examplemode" with your mode name (lowercase)
 * 5. Import shared schemas as needed
 *
 * REFERENCE: Search for "SequentialSchema" in src/validation/schemas.ts
 */

// ============================================================
// ADD THIS TO src/validation/schemas.ts
// ============================================================

import { z } from 'zod';
// BaseThoughtSchema is already defined in schemas.ts
// Import shared schemas if needed:
// import { ConfidenceSchema, LevelEnum } from '../tools/schemas/shared.js';

/**
 * ExampleMode Schema
 *
 * TODO: Add description of what this schema validates
 */
export const ExampleModeSchema = BaseThoughtSchema.extend({
  // Mode identifier - must match ThinkingMode enum value (lowercase)
  mode: z.literal('examplemode'),

  // Optional thought type
  thoughtType: z.enum(['step_type_1', 'step_type_2', 'step_type_3']).optional(),

  // ============================================================
  // MODE-SPECIFIC FIELDS
  // ============================================================
  //
  // Common validation patterns:
  //
  // 1. Simple optional string:
  //    hypothesis: z.string().min(1).max(1000).optional(),
  //
  // 2. Number with range (0-1):
  //    confidence: z.number().min(0).max(1).optional(),
  //    // Or use shared: confidence: ConfidenceSchema.optional(),
  //
  // 3. Enum values:
  //    priority: z.enum(['low', 'medium', 'high']).optional(),
  //    // Or use shared: priority: LevelEnum.optional(),
  //
  // 4. Array of strings:
  //    observations: z.array(z.string()).optional(),
  //
  // 5. Array of objects:
  //    entities: z.array(z.object({
  //      id: z.string(),
  //      name: z.string().min(1).max(200),
  //      type: z.string(),
  //    })).optional(),
  //
  // 6. Nested object:
  //    analysis: z.object({
  //      findings: z.array(z.string()),
  //      confidence: z.number().min(0).max(1),
  //    }).optional(),
  //
  // 7. With refinement (cross-field validation):
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
  // SHARED SCHEMAS (from src/tools/schemas/shared.ts):
  // - ConfidenceSchema: 0-1 range
  // - PositiveIntSchema: 1+ integers
  // - LevelEnum: 'low' | 'medium' | 'high'
  // - TimeUnitEnum: time units
  // - ProofTypeEnum: proof strategies
  //
  // REPLACE THIS COMMENT BLOCK WITH YOUR SCHEMA FIELDS
});

/**
 * TypeScript type inferred from schema
 */
export type ExampleModeInput = z.infer<typeof ExampleModeSchema>;
