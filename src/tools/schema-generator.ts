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
  const jsonSchema = zodToJsonSchema(zodSchema, {
    target: 'jsonSchema2019-09',
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
 */
export function generateJsonSchema(zodSchema: z.ZodType) {
  const jsonSchema = zodToJsonSchema(zodSchema, {
    target: 'jsonSchema2019-09',
    $refStrategy: 'none',
  });

  // Remove $schema property as MCP doesn't support it
  if (jsonSchema && typeof jsonSchema === 'object') {
    const { $schema, ...rest } = jsonSchema as any;
    return rest;
  }

  return jsonSchema;
}
