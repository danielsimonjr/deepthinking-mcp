/**
 * Input Validation Schemas (v3.4.5)
 * Sprint 2 Task 2.3: Zod-based input validation
 *
 * Provides type-safe validation for all MCP tool inputs using Zod.
 * Ensures data integrity and prevents invalid inputs from reaching core logic.
 */

import { z } from 'zod';
import { ThinkingMode } from '../types/index.js';

/**
 * UUID v4 validation pattern
 */
const uuidSchema = z
  .string()
  .uuid('Invalid UUID format')
  .describe('UUID v4 identifier');

/**
 * Session ID validation (UUID v4)
 */
export const SessionIdSchema = uuidSchema;

/**
 * Thinking mode validation
 */
export const ThinkingModeSchema = z
  .nativeEnum(ThinkingMode)
  .describe('Valid thinking mode from ThinkingMode enum');

/**
 * Create Session Input Schema
 * Validates inputs for create_session MCP tool
 */
export const CreateSessionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be 200 characters or less')
    .describe('Session title'),
  mode: ThinkingModeSchema,
  author: z
    .string()
    .max(100, 'Author name must be 100 characters or less')
    .optional()
    .describe('Optional author name'),
  domain: z
    .string()
    .max(100, 'Domain must be 100 characters or less')
    .optional()
    .describe('Optional problem domain'),
  tags: z
    .array(z.string().max(50, 'Tag must be 50 characters or less'))
    .max(20, 'Maximum 20 tags allowed')
    .optional()
    .describe('Optional tags for categorization'),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

/**
 * Add Thought Input Schema
 * Validates inputs for add_thought MCP tool
 */
export const AddThoughtSchema = z.object({
  sessionId: SessionIdSchema.optional().describe(
    'Session ID (optional - creates new session if not provided)'
  ),
  thought: z
    .string()
    .min(1, 'Thought cannot be empty')
    .max(10000, 'Thought must be 10000 characters or less')
    .describe('Thought content'),
  thoughtNumber: z
    .number()
    .int('Thought number must be an integer')
    .min(1, 'Thought number must be at least 1')
    .max(1000, 'Thought number cannot exceed 1000')
    .describe('Current thought number in sequence'),
  totalThoughts: z
    .number()
    .int('Total thoughts must be an integer')
    .min(1, 'Total thoughts must be at least 1')
    .max(1000, 'Total thoughts cannot exceed 1000')
    .describe('Expected total number of thoughts'),
  mode: ThinkingModeSchema,
  nextThoughtNeeded: z
    .boolean()
    .describe('Whether another thought is needed'),
});

export type AddThoughtInput = z.infer<typeof AddThoughtSchema>;

/**
 * Complete Session Input Schema
 * Validates inputs for complete_session MCP tool
 */
export const CompleteSessionSchema = z.object({
  sessionId: SessionIdSchema,
  summary: z
    .string()
    .max(1000, 'Summary must be 1000 characters or less')
    .optional()
    .describe('Optional session summary'),
});

export type CompleteSessionInput = z.infer<typeof CompleteSessionSchema>;

/**
 * Get Session Input Schema
 * Validates inputs for get_session MCP tool
 */
export const GetSessionSchema = z.object({
  sessionId: SessionIdSchema,
});

export type GetSessionInput = z.infer<typeof GetSessionSchema>;

/**
 * List Sessions Input Schema
 * Validates inputs for list_sessions MCP tool
 */
export const ListSessionsSchema = z.object({
  mode: ThinkingModeSchema.optional().describe('Filter by thinking mode'),
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(1000, 'Limit cannot exceed 1000')
    .default(50)
    .describe('Maximum number of sessions to return'),
  offset: z
    .number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .default(0)
    .describe('Number of sessions to skip'),
});

export type ListSessionsInput = z.infer<typeof ListSessionsSchema>;

/**
 * Export Session Input Schema
 * Validates inputs for export_session MCP tool
 */
export const ExportSessionSchema = z.object({
  sessionId: SessionIdSchema,
  format: z
    .enum(['json', 'markdown', 'latex'], {
      errorMap: () => ({ message: 'Format must be json, markdown, or latex' }),
    })
    .describe('Export format'),
});

export type ExportSessionInput = z.infer<typeof ExportSessionSchema>;

/**
 * Search Sessions Input Schema
 * Validates inputs for search_sessions MCP tool
 */
export const SearchSessionsSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query cannot be empty')
    .max(500, 'Search query must be 500 characters or less')
    .describe('Search query string'),
  mode: ThinkingModeSchema.optional().describe('Filter by thinking mode'),
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20)
    .describe('Maximum number of results'),
});

export type SearchSessionsInput = z.infer<typeof SearchSessionsSchema>;

/**
 * Batch Operation Input Schema
 * Validates inputs for batch operations
 */
export const BatchOperationSchema = z.object({
  type: z.enum(['export', 'import', 'analyze', 'validate', 'transform', 'index', 'backup', 'cleanup']),
  params: z.record(z.unknown()).describe('Operation-specific parameters'),
});

export type BatchOperationInput = z.infer<typeof BatchOperationSchema>;

/**
 * Helper function to validate input against a schema
 * Returns validated data or throws ZodError with detailed error messages
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  return schema.parse(input);
}

/**
 * Helper function to safely validate input
 * Returns { success: true, data } or { success: false, error }
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(input);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}
