/**
 * Base Thought Schema (v4.1.0)
 * Sprint 5 Task 5.2: Shared properties for all thinking modes
 * Sprint 7 Task 7.5: Use shared enums
 */

import { z } from 'zod/v3';
import {
  ConfidenceSchema,
  PositiveIntSchema,
  SessionActionEnum,
  ExportFormatEnum,
  LevelEnum,
} from './shared.js';

/**
 * Base schema with properties common to all thought types
 */
export const BaseThoughtSchema = z.object({
  sessionId: z.string().optional(),
  thought: z.string().min(1),
  thoughtNumber: PositiveIntSchema,
  totalThoughts: PositiveIntSchema,
  nextThoughtNeeded: z.boolean(),
  isRevision: z.boolean().optional(),
  revisesThought: z.string().optional(),
  revisionReason: z.string().optional(),
  branchFrom: z.string().optional(),
  branchId: z.string().optional(),
  uncertainty: ConfidenceSchema.optional(),
  dependencies: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
});

export type BaseThoughtInput = z.infer<typeof BaseThoughtSchema>;

/**
 * Session action schema for non-thought operations
 */
export const SessionActionSchema = z.object({
  sessionId: z.string().optional(),
  action: SessionActionEnum,
  exportFormat: ExportFormatEnum.optional(),
  newMode: z.string().optional(),
  problemType: z.string().optional(),
  problemCharacteristics: z.object({
    domain: z.string(),
    complexity: LevelEnum,
    uncertainty: LevelEnum,
    timeDependent: z.boolean(),
    multiAgent: z.boolean(),
    requiresProof: z.boolean(),
    requiresQuantification: z.boolean(),
    hasIncompleteInfo: z.boolean(),
    requiresExplanation: z.boolean(),
    hasAlternatives: z.boolean(),
  }).optional(),
  includeCombinations: z.boolean().optional(),
});

export type SessionActionInput = z.infer<typeof SessionActionSchema>;
