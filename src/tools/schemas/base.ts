/**
 * Base Thought Schema (v4.1.0)
 * Sprint 5 Task 5.2: Shared properties for all thinking modes
 * Sprint 7 Task 7.5: Use shared enums
 */

import { z } from "zod";
import {
  ConfidenceSchema,
  PositiveIntSchema,
  SessionActionEnum,
  ExportFormatEnum,
  ExportProfileEnum,
  LevelEnum,
  IdSchema,
  SessionIdSchema,
  TextSchema,
  ThoughtTextSchema,
  IdArraySchema,
} from "./shared.js";

/**
 * Base schema with properties common to all thought types
 */
export const BaseThoughtSchema = z.object({
  sessionId: SessionIdSchema.optional(),
  thought: ThoughtTextSchema.min(1),
  thoughtNumber: PositiveIntSchema,
  totalThoughts: PositiveIntSchema,
  nextThoughtNeeded: z.boolean(),
  isRevision: z.boolean().optional(),
  revisesThought: IdSchema.optional(),
  revisionReason: TextSchema.optional(),
  branchFrom: IdSchema.optional(),
  branchId: IdSchema.optional(),
  uncertainty: ConfidenceSchema.optional(),
  dependencies: IdArraySchema.optional(),
  assumptions: IdArraySchema.optional(),
});

export type BaseThoughtInput = z.infer<typeof BaseThoughtSchema>;

/**
 * Session action schema for non-thought operations
 */
export const SessionActionSchema = z.object({
  sessionId: SessionIdSchema.optional(),
  action: SessionActionEnum,
  exportFormat: ExportFormatEnum.optional(),
  exportProfile: ExportProfileEnum.optional(), // Phase 12: Pre-configured export bundles
  includeContent: z.boolean().optional(), // For export_all action
  outputDir: IdSchema.optional(), // Phase 16: File export - when provided, exports write to files instead of returning content
  overwrite: z.boolean().optional(), // Phase 16: File export - overwrite existing files (default: false)
  newMode: IdSchema.optional(),
  problemType: IdSchema.optional(),
  problemCharacteristics: z
    .object({
      domain: IdSchema,
      complexity: LevelEnum,
      uncertainty: LevelEnum,
      timeDependent: z.boolean(),
      multiAgent: z.boolean(),
      requiresProof: z.boolean(),
      requiresQuantification: z.boolean(),
      hasIncompleteInfo: z.boolean(),
      requiresExplanation: z.boolean(),
      hasAlternatives: z.boolean(),
    })
    .optional(),
  includeCombinations: z.boolean().optional(),
});

export type SessionActionInput = z.infer<typeof SessionActionSchema>;
