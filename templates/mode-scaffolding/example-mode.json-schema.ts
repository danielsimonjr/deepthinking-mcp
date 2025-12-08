/**
 * ExampleMode JSON Schema Template (for MCP Tool Definition)
 *
 * INSTRUCTIONS:
 * 1. Add this object to the array in: src/tools/json-schemas.ts
 * 2. Replace "ExampleMode" with your mode name (PascalCase)
 * 3. Replace "examplemode" with your mode name (lowercase)
 * 4. Customize the description with use cases
 * 5. Define mode-specific properties
 * 6. Update src/tools/definitions.ts with the correct array index
 * 7. Remove this instruction block
 *
 * LOCATION: Insert into jsonSchemas array in src/tools/json-schemas.ts
 */

// ADD THIS OBJECT TO THE jsonSchemas ARRAY:
{
  name: 'deepthinking_examplemode',

  // CUSTOMIZE: Clear description with use cases and when to use this mode
  // Best practices:
  // - Start with what the mode does
  // - List 2-3 specific use cases
  // - Mention what it's best for
  // - Keep under 500 characters for readability
  description: 'ExampleMode reasoning for [brief description]. ' +
    'Use cases: [use case 1], [use case 2], [use case 3]. ' +
    'Best for: [when to use this mode]. ' +
    'Supports: [key features of this mode].',

  inputSchema: {
    type: 'object',
    properties: {
      // REQUIRED: Include base properties (all modes need these)
      ...baseProperties,  // Provides: thought, thoughtNumber, totalThoughts, nextThoughtNeeded, etc.

      // OPTIONAL: Thought type (if your mode has sub-types)
      thoughtType: {
        type: 'string',
        enum: ['step_type_1', 'step_type_2', 'step_type_3'],
        description: 'Type of reasoning step in ExampleMode',
      },

      // ============================================================
      // MODE-SPECIFIC PROPERTIES
      // ============================================================
      // CUSTOMIZE: Add your mode's unique properties here
      //
      // JSON Schema patterns:
      //
      // 1. Simple string:
      //    hypothesis: {
      //      type: 'string',
      //      description: 'Hypothesis to test',
      //    },
      //
      // 2. Number with range:
      //    confidence: {
      //      type: 'number',
      //      minimum: 0,
      //      maximum: 1,
      //      description: 'Confidence level (0-1)',
      //    },
      //
      // 3. Enum:
      //    priority: {
      //      type: 'string',
      //      enum: ['low', 'medium', 'high'],
      //      description: 'Priority level',
      //    },
      //
      // 4. Array of strings:
      //    tags: {
      //      type: 'array',
      //      items: { type: 'string' },
      //      description: 'Tags for categorization',
      //    },
      //
      // 5. Array of objects:
      //    entities: {
      //      type: 'array',
      //      items: {
      //        type: 'object',
      //        properties: {
      //          id: { type: 'string', description: 'Unique identifier' },
      //          name: { type: 'string', description: 'Entity name' },
      //          type: { type: 'string', description: 'Entity type' },
      //        },
      //        required: ['id', 'name'],
      //      },
      //      description: 'Entities involved in reasoning',
      //    },
      //
      // 6. Nested object:
      //    analysis: {
      //      type: 'object',
      //      properties: {
      //        findings: {
      //          type: 'array',
      //          items: { type: 'string' },
      //          description: 'Key findings',
      //        },
      //        confidence: {
      //          type: 'number',
      //          minimum: 0,
      //          maximum: 1,
      //          description: 'Overall confidence',
      //        },
      //      },
      //      description: 'Analysis results',
      //    },
      //
      // EXAMPLES from existing modes:
      //
      // Mathematics (deepthinking_mathematics):
      //   mathematicalModel: {
      //     type: 'object',
      //     properties: {
      //       latex: { type: 'string' },
      //       symbolic: { type: 'string' },
      //       ascii: { type: 'string' },
      //     },
      //     required: ['latex', 'symbolic'],
      //   },
      //
      // Temporal (deepthinking_temporal):
      //   timeline: {
      //     type: 'object',
      //     properties: {
      //       id: { type: 'string' },
      //       name: { type: 'string' },
      //       timeUnit: {
      //         type: 'string',
      //         enum: ['milliseconds', 'seconds', 'minutes', 'hours', 'days'],
      //       },
      //     },
      //     required: ['id', 'name', 'timeUnit'],
      //   },
      //
      // Strategic (deepthinking_strategic):
      //   players: {
      //     type: 'array',
      //     items: {
      //       type: 'object',
      //       properties: {
      //         id: { type: 'string' },
      //         name: { type: 'string' },
      //         isRational: { type: 'boolean' },
      //       },
      //       required: ['id', 'name', 'isRational'],
      //     },
      //   },
      //
      // REPLACE THIS COMMENT BLOCK WITH YOUR PROPERTIES
    },

    // REQUIRED: Base properties that all modes need
    required: ['thought', 'thoughtNumber', 'totalThoughts', 'nextThoughtNeeded'],

    // REQUIRED: Strict validation (no additional properties allowed)
    additionalProperties: false,
  },
}

// NEXT STEPS AFTER ADDING TO json-schemas.ts:
//
// 1. Count the index of your schema in the jsonSchemas array (0-based)
//    Example: If it's the 10th item, index is 9
//
// 2. Update src/tools/definitions.ts:
//    export const tools = {
//      // ... existing tools ...
//      deepthinking_examplemode: jsonSchemas[X],  // Replace X with your index
//    };
//
// 3. Verify with:
//    npm run build
//    node -e "const tools = require('./dist/tools/definitions.js'); console.log(tools.tools.deepthinking_examplemode.name);"
//
// 4. Test in MCP client to ensure schema is recognized
