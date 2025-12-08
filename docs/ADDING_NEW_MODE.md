# Adding a New Reasoning Mode

This guide walks you through adding a new reasoning mode to DeepThinking MCP. Follow these steps to ensure consistency, quality, and full integration.

---

## Overview

Adding a new mode requires touching **8 locations** across the codebase:

1. ✅ **Type Definition** - Define the thought interface
2. ✅ **Core Enum** - Add to ThinkingMode enum
3. ✅ **Zod Schema** - Runtime validation schema
4. ✅ **Validator** - Mode-specific validation logic
5. ✅ **JSON Schema** - MCP tool schema
6. ✅ **Factory Logic** - Thought creation in ThoughtFactory
7. ✅ **Export Support** - (Optional) Custom export formatting
8. ✅ **Documentation** - README and examples

**Estimated Time**: 1-2 hours for basic mode, 4-8 hours for complex mode

---

## Step-by-Step Guide

### Step 1: Create Type Definition

**File**: `src/types/modes/yourmode.ts`

```typescript
/**
 * YourMode Reasoning - Type Definitions
 * Brief description of what this mode does
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * YourMode thought extends base thought with mode-specific properties
 */
export interface YourModeThought extends BaseThought {
  mode: ThinkingMode.YOURMODE;

  // Optional: Specific thought sub-types for this mode
  thoughtType?:
    | 'analysis'
    | 'synthesis'
    | 'evaluation';

  // Add mode-specific properties here
  // Example:
  // hypotheses?: Hypothesis[];
  // evidence?: Evidence[];
  // conclusions?: string[];
}

// Define supporting interfaces if needed
// export interface Hypothesis { ... }
// export interface Evidence { ... }

/**
 * Type guard for YourMode thoughts
 */
export function isYourModeThought(thought: BaseThought): thought is YourModeThought {
  return thought.mode === 'yourmode';
}
```

**Reference Examples**:
- Simple: `src/types/modes/sequential.ts`
- Complex: `src/types/modes/temporal.ts`, `src/types/modes/gametheory.ts`

---

### Step 2: Add to Core Enum

**File**: `src/types/core.ts`

**2a. Add to ThinkingMode enum**:
```typescript
export enum ThinkingMode {
  // ... existing modes ...

  YOURMODE = 'yourmode', // Brief description
}
```

**2b. Add to appropriate category**:
```typescript
// For fully implemented modes:
export const FULLY_IMPLEMENTED_MODES: ReadonlyArray<ThinkingMode> = [
  // ... existing modes ...
  ThinkingMode.YOURMODE,
];

// For experimental modes:
export const EXPERIMENTAL_MODES: ReadonlyArray<ThinkingMode> = [
  // ... existing modes ...
  ThinkingMode.YOURMODE,
];
```

**2c. Import your type**:
```typescript
import type { YourModeThought } from './modes/yourmode.js';
```

**2d. Add to Thought union type** (around line 150-200):
```typescript
export type Thought =
  | SequentialThought
  | ShannonThought
  // ... other modes ...
  | YourModeThought;
```

---

### Step 3: Create Zod Schema

**File**: `src/validation/schemas.ts`

Add your schema near similar mode schemas:

```typescript
/**
 * YourMode Schema
 */
export const YourModeSchema = BaseThoughtSchema.extend({
  mode: z.literal('yourmode'),

  // Optional thought type
  thoughtType: z.enum(['analysis', 'synthesis', 'evaluation']).optional(),

  // Add mode-specific fields with validation
  // Use shared schemas from src/tools/schemas/shared.ts where possible

  // Example:
  // hypotheses: z.array(z.object({
  //   id: z.string(),
  //   description: z.string(),
  //   plausibility: ConfidenceSchema, // 0-1 range
  // })).optional(),
});

export type YourModeInput = z.infer<typeof YourModeSchema>;
```

**Use Shared Schemas** (`src/tools/schemas/shared.ts`):
- `ConfidenceSchema` - 0-1 range (probability, confidence, strength)
- `PositiveIntSchema` - Positive integers
- `LevelEnum` - 'low' | 'medium' | 'high'
- `TimeUnitEnum` - Time units
- Many more...

**Reference Examples**:
- Simple: `SequentialSchema`
- Medium: `MathematicsSchema`
- Complex: `TemporalSchema`

---

### Step 4: Create Validator

**File**: `src/validation/validators/modes/yourmode.ts`

```typescript
/**
 * YourMode Validator
 */

import { YourModeThought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class YourModeValidator extends BaseValidator<YourModeThought> {
  getMode(): string {
    return 'yourmode';
  }

  validate(thought: YourModeThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Always include common validation
    issues.push(...this.validateCommon(thought));

    // Add mode-specific validation logic
    // Example:
    // if (thought.hypotheses && thought.hypotheses.length === 0) {
    //   issues.push({
    //     severity: 'warning',
    //     thoughtNumber: thought.thoughtNumber,
    //     description: 'No hypotheses provided',
    //     suggestion: 'Add at least one hypothesis to analyze',
    //     category: 'structural',
    //   });
    // }

    return issues;
  }
}
```

**Validation Categories**:
- `structural` - Missing required fields, invalid structure
- `logical` - Logical inconsistencies (e.g., start > end)
- `semantic` - Meaning issues (e.g., empty arrays where content expected)
- `reference` - Broken references (e.g., ID not found)

**Severity Levels**: `error`, `warning`, `info`

**Reference Example**: `src/validation/validators/modes/temporal.ts`

---

### Step 5: Register Validator

**File**: `src/validation/validator.ts`

Import and register your validator:

```typescript
// Import your validator
import { YourModeValidator } from './validators/modes/yourmode.js';

// In ValidatorFactory.getValidator(), add case:
case 'yourmode':
  return new YourModeValidator();
```

---

### Step 6: Create JSON Schema for MCP

**File**: `src/tools/json-schemas.ts`

Add your tool schema to the array. Use the base properties and extend:

```typescript
// YourMode tool
{
  name: 'deepthinking_yourmode',
  description: 'Brief description of what this mode does and when to use it. ' +
    'Example use cases: ... ' +
    'Best for: ...',
  inputSchema: {
    type: 'object',
    properties: {
      ...baseProperties, // Includes: thought, thoughtNumber, totalThoughts, nextThoughtNeeded, etc.

      // Add mode-specific properties
      thoughtType: {
        type: 'string',
        enum: ['analysis', 'synthesis', 'evaluation'],
        description: 'Type of reasoning step',
      },

      // Example complex property:
      // hypotheses: {
      //   type: 'array',
      //   items: {
      //     type: 'object',
      //     properties: {
      //       id: { type: 'string' },
      //       description: { type: 'string' },
      //       plausibility: { type: 'number', minimum: 0, maximum: 1 },
      //     },
      //     required: ['id', 'description'],
      //   },
      // },
    },
    required: ['thought', 'thoughtNumber', 'totalThoughts', 'nextThoughtNeeded'],
    additionalProperties: false,
  },
},
```

**Best Practices**:
- Clear, actionable description
- Include use cases and examples
- Use shared patterns for consistency
- Set `additionalProperties: false` for strict validation

**Reference Examples** in `src/tools/json-schemas.ts`:
- Simple: `deepthinking_core`
- Medium: `deepthinking_analytical`
- Complex: `deepthinking_temporal`, `deepthinking_strategic`

---

### Step 7: Update Tool Definitions

**File**: `src/tools/definitions.ts`

Export your new tool:

```typescript
import { jsonSchemas } from './json-schemas.js';

export const tools = {
  // ... existing tools ...
  deepthinking_yourmode: jsonSchemas[X], // Replace X with correct index
};
```

**Important**: Count the array index carefully in `json-schemas.ts`!

---

### Step 8: Add Factory Logic

**File**: `src/services/ThoughtFactory.ts`

**8a. Import your type** (top of file):
```typescript
import {
  // ... existing imports ...
  YourModeThought,
} from '../types/index.js';
```

**8b. Add case to createThought()** (around line 95+):
```typescript
case 'yourmode':
  return {
    ...baseThought,
    mode: ThinkingMode.YOURMODE,
    thoughtType: toExtendedThoughtType(input.thoughtType, 'analysis'),
    // Map input properties to thought properties
    // hypotheses: input.hypotheses || [],
    // evidence: input.evidence || [],
  } as YourModeThought;
```

**Tips**:
- Use `toExtendedThoughtType()` helper for optional thoughtType with defaults
- Provide sensible defaults for optional fields
- Use type assertion `as YourModeThought` at the end

**Reference**: See existing cases in `src/services/ThoughtFactory.ts:95-250`

---

### Step 9: Add Export Support (Optional)

**File**: `src/services/ExportService.ts`

If your mode needs custom export formatting:

```typescript
// In exportToMarkdown() method:
if (thought.mode === 'yourmode') {
  const ymThought = thought as YourModeThought;
  sections.push(`**Mode**: YourMode Reasoning`);

  // Add mode-specific formatting
  // if (ymThought.hypotheses) {
  //   sections.push(`**Hypotheses**: ${ymThought.hypotheses.length}`);
  //   ymThought.hypotheses.forEach(h => {
  //     sections.push(`- ${h.description} (plausibility: ${h.plausibility})`);
  //   });
  // }
}
```

Repeat for other export formats if needed:
- `exportToLatex()`
- `exportToMermaid()` (for diagrams)
- `exportToDOT()` (for graphs)

---

### Step 10: Update Documentation

**10a. README.md** - Add mode description:

```markdown
#### YourMode
Brief description of the reasoning approach.

\`\`\`typescript
mode: 'yourmode'
// Use for: Specific use cases...
\`\`\`
```

**10b. Create examples** (optional):

Add usage example in README.md under "Usage Examples":

```markdown
### Example X: [Use Case] with YourMode Reasoning

\`\`\`typescript
const session = await server.startThinking({
  mode: 'yourmode',
  problem: 'Example problem statement'
});

await server.addThought(session.id, {
  content: 'First reasoning step',
  thoughtType: 'analysis'
});
\`\`\`
```

---

## Testing Your New Mode

### 1. Type Checking
```bash
npm run typecheck
```
Should have 0 errors.

### 2. Build
```bash
npm run build
```
Should compile without errors.

### 3. Unit Tests (Recommended)

Create `tests/unit/validation/validators/yourmode.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { YourModeValidator } from '../../../../src/validation/validators/modes/yourmode.js';
import { ThinkingMode } from '../../../../src/types/index.js';

describe('YourModeValidator', () => {
  const validator = new YourModeValidator();

  it('should validate valid thought', () => {
    const thought = {
      id: 'test-id',
      sessionId: 'session-123',
      mode: ThinkingMode.YOURMODE,
      thoughtNumber: 1,
      totalThoughts: 5,
      content: 'Test thought',
      timestamp: new Date(),
      nextThoughtNeeded: true,
    };

    const issues = validator.validate(thought, { sessionId: 'session-123' });
    expect(issues).toHaveLength(0);
  });

  // Add more test cases for validation rules
});
```

### 4. Integration Test

Test via MCP client or add to `tests/integration/production-features.test.ts`:

```typescript
it('should create YourMode thought', async () => {
  const session = await manager.createSession({
    title: 'Test YourMode',
    mode: ThinkingMode.YOURMODE,
  });

  const thought = await manager.addThought(session.id, {
    mode: 'yourmode',
    thought: 'Testing YourMode reasoning',
    thoughtNumber: 1,
    totalThoughts: 1,
    nextThoughtNeeded: false,
  });

  expect(thought.mode).toBe('yourmode');
  expect(isYourModeThought(thought)).toBe(true);
});
```

### 5. Run All Tests
```bash
npm run test:run
```

All tests should pass.

---

## Common Pitfalls

### ❌ Mistake 1: Forgetting to add to Thought union type
**Symptom**: Type errors when using the thought
**Fix**: Add `YourModeThought` to union in `src/types/core.ts`

### ❌ Mistake 2: Mismatched JSON schema index
**Symptom**: Wrong tool schema returned
**Fix**: Count carefully in `json-schemas.ts` array, verify in `definitions.ts`

### ❌ Mistake 3: Missing validator registration
**Symptom**: No validation runs for your mode
**Fix**: Register in `src/validation/validator.ts` ValidatorFactory

### ❌ Mistake 4: Wrong mode string casing
**Symptom**: Mode not recognized
**Fix**: Use lowercase in string literals: `'yourmode'` not `'YourMode'`

### ❌ Mistake 5: Not using shared schemas
**Symptom**: Inconsistent validation patterns
**Fix**: Import from `src/tools/schemas/shared.ts` for common patterns

---

## Checklist

Before submitting your new mode, verify:

- [ ] Type definition created in `src/types/modes/yourmode.ts`
- [ ] Added to `ThinkingMode` enum in `src/types/core.ts`
- [ ] Added to `Thought` union type in `src/types/core.ts`
- [ ] Categorized in `FULLY_IMPLEMENTED_MODES` or `EXPERIMENTAL_MODES`
- [ ] Zod schema created in `src/validation/schemas.ts`
- [ ] Validator created in `src/validation/validators/modes/yourmode.ts`
- [ ] Validator registered in `src/validation/validator.ts`
- [ ] JSON schema added to `src/tools/json-schemas.ts`
- [ ] Tool exported in `src/tools/definitions.ts` with correct index
- [ ] Factory logic added to `src/services/ThoughtFactory.ts`
- [ ] Export formatting added (if needed) in `src/services/ExportService.ts`
- [ ] Documentation added to README.md
- [ ] Examples provided (optional but recommended)
- [ ] Unit tests created and passing
- [ ] Integration test added
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] `npm run test:run` passes (all tests)
- [ ] Tested manually via MCP client

---

## Reference Files

Study these examples for patterns:

**Simple Mode**:
- Types: `src/types/modes/sequential.ts`
- Validator: `src/validation/validators/modes/sequential.ts`
- Schema: Search for `SequentialSchema` in `src/validation/schemas.ts`

**Medium Complexity**:
- Types: `src/types/modes/mathematics.ts`
- Validator: `src/validation/validators/modes/mathematics.ts`
- JSON Schema: `deepthinking_mathematics` in `src/tools/json-schemas.ts`

**Complex Mode**:
- Types: `src/types/modes/temporal.ts` or `src/types/modes/gametheory.ts`
- Validator: `src/validation/validators/modes/temporal.ts`
- JSON Schema: `deepthinking_temporal` or `deepthinking_strategic`

---

## Next Steps

After adding your mode:

1. **Test thoroughly** - Both automated tests and manual testing
2. **Update CHANGELOG.md** - Document your new feature
3. **Consider contributing** - If useful for others, submit a PR
4. **Get feedback** - Share with users for real-world testing

---

## Questions?

- Check existing mode implementations for patterns
- Review `src/types/core.ts` for architecture overview
- See `CLAUDE.md` for development guidelines
- Refer to `README.md` for mode descriptions

Happy coding! 🚀
