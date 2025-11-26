/**
 * Base Thought Schema (v4.0.0)
 * Sprint 5 Task 5.2: Shared properties for all thinking modes
 */

import { z } from 'zod';

/**
 * Base schema with properties common to all thought types
 */
export const BaseThoughtSchema = z.object({
  // Session management
  sessionId: z.string().optional(),

  // Core thought properties
  thought: z.string().min(1),
  thoughtNumber: z.number().int().min(1),
  totalThoughts: z.number().int().min(1),
  nextThoughtNeeded: z.boolean(),

  // Revision tracking
  isRevision: z.boolean().optional(),
  revisesThought: z.string().optional(),
  revisionReason: z.string().optional(),

  // Branching
  branchFrom: z.string().optional(),
  branchId: z.string().optional(),

  // Uncertainty and dependencies
  uncertainty: z.number().min(0).max(1).optional(),
  dependencies: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
});

export type BaseThoughtInput = z.infer<typeof BaseThoughtSchema>;

/**
 * Session action schema for non-thought operations
 */
export const SessionActionSchema = z.object({
  sessionId: z.string().optional(),
  action: z.enum(['summarize', 'export', 'get_session', 'switch_mode', 'recommend_mode']),
  exportFormat: z.enum(['markdown', 'latex', 'json', 'html', 'jupyter', 'mermaid', 'dot', 'ascii']).optional(),
  newMode: z.string().optional(),
  problemType: z.string().optional(),
  problemCharacteristics: z.object({
    domain: z.string(),
    complexity: z.enum(['low', 'medium', 'high']),
    uncertainty: z.enum(['low', 'medium', 'high']),
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
