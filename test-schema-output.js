#!/usr/bin/env node

import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

// Create a simple test schema
const TestSchema = z.object({
  sessionId: z.string().uuid(),
  title: z.string().optional(),
  mode: z.enum(['sequential', 'shannon']),
  thoughts: z.array(z.object({
    thought: z.string(),
    nextThoughtNeeded: z.boolean()
  }))
});

// Generate with jsonSchema2019-09
const schema2019 = zodToJsonSchema(TestSchema, {
  target: 'jsonSchema2019-09',
  $refStrategy: 'none'
});

// Remove $schema property
const { $schema, ...cleanSchema } = schema2019;

console.log('=== Schema with $schema removed ===');
console.log(JSON.stringify(cleanSchema, null, 2));

console.log('\n=== Original schema with $schema ===');
console.log(JSON.stringify(schema2019, null, 2));
