/**
 * ExampleMode JSON Schema Template (for MCP Tool Definition)
 *
 * INSTRUCTIONS:
 * This is a CODE SNIPPET to add to src/tools/json-schemas.ts
 * It is NOT a standalone file.
 *
 * 1. Open src/tools/json-schemas.ts
 * 2. Add this object to the jsonSchemas array
 * 3. Replace "ExampleMode" with your mode name (PascalCase)
 * 4. Replace "examplemode" with your mode name (lowercase)
 * 5. Update src/tools/definitions.ts with the correct array index
 * 6. Add mode to modeToToolMap in definitions.ts
 *
 * REFERENCE: See existing schemas in src/tools/json-schemas.ts
 */

// ============================================================
// ADD THIS OBJECT TO THE jsonSchemas ARRAY IN src/tools/json-schemas.ts
// ============================================================

// The file already defines:
// const baseThoughtProperties = { sessionId, thought, thoughtNumber, totalThoughts, nextThoughtNeeded, ... }
// const baseThoughtRequired = ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]

{
  name: 'deepthinking_examplemode',

  // Clear description with use cases (keep under 500 chars)
  description: 'ExampleMode reasoning for [brief description]. ' +
    'Use cases: [use case 1], [use case 2]. ' +
    'Best for: [when to use this mode].',

  inputSchema: {
    type: 'object',
    properties: {
      // REQUIRED: Spread base properties (defined at top of json-schemas.ts)
      ...baseThoughtProperties,

      // Mode identifier
      mode: {
        type: 'string',
        enum: ['examplemode'],
        description: 'ExampleMode reasoning mode',
      },

      // Optional thought type (if your mode has sub-types)
      thoughtType: {
        type: 'string',
        enum: ['step_type_1', 'step_type_2', 'step_type_3'],
        description: 'Type of reasoning step',
      },

      // ============================================================
      // MODE-SPECIFIC PROPERTIES
      // ============================================================
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
      //    observations: {
      //      type: 'array',
      //      items: { type: 'string' },
      //      description: 'Observed cases',
      //    },
      //
      // 5. Array of objects:
      //    entities: {
      //      type: 'array',
      //      items: {
      //        type: 'object',
      //        properties: {
      //          id: { type: 'string', description: 'Unique ID' },
      //          name: { type: 'string', description: 'Entity name' },
      //          type: { type: 'string', description: 'Entity type' },
      //        },
      //        required: ['id', 'name'],
      //      },
      //      description: 'Entities involved',
      //    },
      //
      // 6. Nested object:
      //    analysis: {
      //      type: 'object',
      //      properties: {
      //        findings: {
      //          type: 'array',
      //          items: { type: 'string' },
      //        },
      //        confidence: {
      //          type: 'number',
      //          minimum: 0,
      //          maximum: 1,
      //        },
      //      },
      //      description: 'Analysis results',
      //    },
      //
      // REPLACE THIS COMMENT BLOCK WITH YOUR PROPERTIES
    },

    // Required fields (base + any mode-specific required fields)
    required: [...baseThoughtRequired],

    // Strict validation
    additionalProperties: false,
  },
}

// ============================================================
// AFTER ADDING TO json-schemas.ts:
// ============================================================
//
// 1. Note the array index of your schema (0-based)
//    Example: If it's the 13th item, index is 12
//
// 2. Update src/tools/definitions.ts:
//
//    export const tools = {
//      // ... existing tools ...
//      deepthinking_examplemode: jsonSchemas[12],  // Your index
//    };
//
// 3. Add to modeToToolMap in definitions.ts:
//
//    export const modeToToolMap: Record<string, string> = {
//      // ... existing mappings ...
//      examplemode: 'deepthinking_examplemode',
//    };
//
// 4. If adding a NEW tool (not adding mode to existing tool):
//    - Add Zod schema to src/tools/schemas/modes/yourmode.ts
//    - Import and add to toolSchemas in definitions.ts
//
// 5. Verify:
//    npm run build
//    npm run typecheck
