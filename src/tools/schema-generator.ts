/**
 * Schema Generator (v4.0.0)
 * Sprint 5 Task 5.1: Auto-generate JSON Schema from Zod schemas
 *
 * Updated in v4.3.3 to use zod/v3 with zod-to-json-schema (draft 2020-12)
 * Note: Zod v4's native toJSONSchema has compatibility issues with complex types
 */

import { z } from 'zod/v3';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Generate MCP tool definition from Zod schema
 * Uses zod-to-json-schema with draft 2020-12 target
 */
export function generateToolSchema(
  zodSchema: z.ZodType,
  name: string,
  description: string
) {
  const jsonSchema = zodToJsonSchema(zodSchema, {
    target: 'jsonSchema2020-12',
    $refStrategy: 'none',
  });

  // Remove $schema property as MCP doesn't support it
  if (jsonSchema && typeof jsonSchema === 'object') {
    const { $schema, ...rest } = jsonSchema as any;
    return {
      name,
      description,
      inputSchema: rest,
    };
  }

  return {
    name,
    description,
    inputSchema: jsonSchema,
  };
}

/**
 * Generate just the JSON schema without tool wrapper
 * Uses zod-to-json-schema with draft 2020-12 target
 */
export function generateJsonSchema(zodSchema: z.ZodType) {
  const jsonSchema = zodToJsonSchema(zodSchema, {
    target: 'jsonSchema2020-12',
    $refStrategy: 'none',
  });

  // Remove $schema property as MCP doesn't support it
  if (jsonSchema && typeof jsonSchema === 'object') {
    const { $schema, ...rest } = jsonSchema as any;
    return rest;
  }

  return jsonSchema;
}
