/**
 * Schema Generator (v4.0.0)
 * Sprint 5 Task 5.1: Auto-generate JSON Schema from Zod schemas
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

/**
 * Generate MCP tool definition from Zod schema
 */
export function generateToolSchema(
  zodSchema: z.ZodType,
  name: string,
  description: string
) {
  return {
    name,
    description,
    inputSchema: zodToJsonSchema(zodSchema, {
      target: 'openApi3',
      $refStrategy: 'none',
    }),
  };
}

/**
 * Generate just the JSON schema without tool wrapper
 */
export function generateJsonSchema(zodSchema: z.ZodType) {
  return zodToJsonSchema(zodSchema, {
    target: 'openApi3',
    $refStrategy: 'none',
  });
}
