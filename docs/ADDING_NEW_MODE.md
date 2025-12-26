# Adding a New Reasoning Mode

**Version**: v8.5.0 | **Architecture**: ModeHandler Pattern (Strategy)

This guide walks you through adding a new reasoning mode to DeepThinking MCP. Follow these steps to ensure consistency, quality, and full integration with the v8.x architecture.

---

## Overview

Adding a new mode requires touching **12 locations** across the codebase:

| # | Component | Required | File(s) |
|---|-----------|----------|---------|
| 1 | Type Definition | ✅ | `src/types/modes/yourmode.ts` |
| 2 | Core Enum | ✅ | `src/types/core.ts` |
| 3 | Zod Schema | ✅ | `src/validation/schemas.ts` |
| 4 | Validator | ✅ | `src/validation/validators/modes/yourmode.ts` |
| 5 | **ModeHandler** | ✅ | `src/modes/handlers/YourModeHandler.ts` |
| 6 | **Handler Registration** | ✅ | `src/modes/index.ts` |
| 7 | ThoughtFactory | ✅ | `src/services/ThoughtFactory.ts` |
| 8 | MCP Tool Schema | ✅ | `src/tools/json-schemas.ts` |
| 9 | Visual Exporter | ⚠️ Optional | `src/export/visual/modes/yourmode.ts` |
| 10 | Export Support | ⚠️ Optional | `src/services/ExportService.ts` |
| 11 | Mode Documentation | ✅ | `docs/modes/YOURMODE.md` |
| 12 | Tests | ✅ | `tests/unit/modes/yourmode.test.ts` |

**Estimated Time**: 2-4 hours for basic mode, 6-12 hours for complex mode with visual exports

---

## Architecture Background

### v8.x ModeHandler Architecture (Strategy Pattern)

DeepThinking MCP v8.x uses a **Strategy Pattern** for mode handling:

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  MCP Tool Call  │ ──► │  ModeHandlerRegistry │ ──► │   YourModeHandler   │
│  (13 tools)     │     │    (Singleton)       │     │ implements ModeHandler
└─────────────────┘     └──────────────────────┘     └─────────────────────┘
                                  │
                                  ▼
                        ┌──────────────────────┐
                        │    ThoughtFactory    │
                        │ (delegates to handler)│
                        └──────────────────────┘
```

Key concepts:
- **ModeHandler Interface**: Contract for mode-specific thought creation and validation
- **ModeHandlerRegistry**: Singleton that manages all 33+ handlers
- **registerAllHandlers()**: Function that registers all handlers at startup
- **Grouped MCP Tools**: 13 tools group related modes (not one tool per mode)

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
- Medium: `src/types/modes/causal.ts`
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

**2b. Add to appropriate category array**:
```typescript
// For fully implemented modes (29 modes with dedicated types):
export const FULLY_IMPLEMENTED_MODES: ReadonlyArray<ThinkingMode> = [
  // ... existing modes ...
  ThinkingMode.YOURMODE,
];

// For experimental/runtime-only modes (4 modes):
export const EXPERIMENTAL_MODES: ReadonlyArray<ThinkingMode> = [
  // ... existing modes ...
  ThinkingMode.YOURMODE,
];
```

**2c. Import your type**:
```typescript
import type { YourModeThought } from './modes/yourmode.js';
```

**2d. Add to Thought union type**:
```typescript
export type Thought =
  | SequentialThought
  | ShannonThought
  // ... other modes ...
  | YourModeThought;
```

**2e. Re-export your type and type guard**:
```typescript
export type { YourModeThought } from './modes/yourmode.js';
export { isYourModeThought } from './modes/yourmode.js';
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

**Validation Categories**: `structural`, `logical`, `semantic`, `reference`

**Severity Levels**: `error`, `warning`, `info`

---

### Step 5: Create ModeHandler (v8.x CRITICAL)

**File**: `src/modes/handlers/YourModeHandler.ts`

This is the **core of v8.x architecture**. Each mode has a specialized handler.

```typescript
/**
 * YourModeHandler - Phase 10 (v8.x)
 *
 * Specialized handler for YourMode reasoning with:
 * - Mode-specific thought creation
 * - Semantic validation beyond schema validation
 * - Contextual enhancements and suggestions
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, YourModeThought } from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';
import { toExtendedThoughtType } from '../../utils/type-guards.js';

/**
 * YourModeHandler - Specialized handler for yourmode reasoning
 */
export class YourModeHandler implements ModeHandler {
  readonly mode = ThinkingMode.YOURMODE;
  readonly modeName = 'Your Mode Name';
  readonly description = 'Brief description of what this mode does';

  /**
   * Supported thought types for this mode
   */
  private readonly supportedThoughtTypes = [
    'analysis',
    'synthesis',
    'evaluation',
  ];

  /**
   * Create a thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): YourModeThought {
    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      mode: ThinkingMode.YOURMODE,
      thoughtType: toExtendedThoughtType(input.thoughtType, 'analysis'),
      // Map mode-specific properties from input
      // hypotheses: input.hypotheses || [],
    } as YourModeThought;
  }

  /**
   * Validate mode-specific input
   *
   * Performs semantic validation beyond schema validation.
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const warnings = [];

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Add mode-specific validation
    // Example: Check for required fields when certain thought types are used

    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: YourModeThought): ModeEnhancements {
    return {
      suggestions: [
        // Context-aware suggestions based on thought content
      ],
      relatedModes: [
        // Suggest complementary modes
        // ThinkingMode.CAUSAL, ThinkingMode.BAYESIAN
      ],
      guidingQuestions: [
        // Questions to prompt deeper thinking
      ],
      warnings: [],
      mentalModels: [
        // Relevant mental models for this mode
      ],
    };
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }
}
```

**Reference Examples**:
- Simple: `src/modes/handlers/SequentialHandler.ts`
- Medium: `src/modes/handlers/CausalHandler.ts` (636 lines, full validation)
- Complex: `src/modes/handlers/SystemsThinkingHandler.ts` (8 archetypes detection)

---

### Step 6: Register Handler

**File**: `src/modes/index.ts`

**6a. Import your handler** (at bottom with other imports):
```typescript
// Your category handlers
import { YourModeHandler } from './handlers/YourModeHandler.js';
```

**6b. Register in `registerAllHandlers()`** (add to appropriate category):
```typescript
export function registerAllHandlers(): void {
  const registry = getRegistry();

  // ... existing registrations ...

  // ===== YOUR CATEGORY HANDLERS =====
  registry.replace(new YourModeHandler());
}
```

**Important**: Use `registry.replace()` not `registry.register()` to allow re-registration.

---

### Step 7: Update ThoughtFactory

**File**: `src/services/ThoughtFactory.ts`

The ThoughtFactory now delegates to ModeHandlers, but you may need to update fallback logic:

**7a. Import your type** (if not auto-exported via core.ts):
```typescript
import type { YourModeThought } from '../types/index.js';
```

**7b. Verify handler delegation works**:
```typescript
// ThoughtFactory.createThought() delegates to:
// this.registry.createThought(input, sessionId)
// which calls YourModeHandler.createThought()
```

The handler-based approach means minimal changes to ThoughtFactory itself.

---

### Step 8: Add to MCP Tool Schema

**File**: `src/tools/json-schemas.ts`

**Important**: v8.x uses **13 grouped tools**, not individual tools per mode.

Find the appropriate existing tool group or create a new one:

```typescript
// Example: Add to deepthinking_analytical tool
{
  name: 'deepthinking_analytical',
  description: 'Analytical reasoning modes: analogical, firstprinciples, metareasoning, cryptanalytic, yourmode. ' +
    'Use for cross-domain mapping, fundamental principles, and pattern analysis.',
  inputSchema: {
    type: 'object',
    properties: {
      ...baseProperties,
      mode: {
        type: 'string',
        enum: ['analogical', 'firstprinciples', 'metareasoning', 'cryptanalytic', 'yourmode'],
        description: 'The analytical reasoning mode to use',
      },
      // Add yourmode-specific properties here
      // hypotheses: { ... },
    },
    required: ['thought', 'thoughtNumber', 'totalThoughts', 'nextThoughtNeeded', 'mode'],
  },
}
```

**Tool Groups** (13 total):
| Tool | Modes |
|------|-------|
| `deepthinking_core` | inductive, deductive, abductive |
| `deepthinking_standard` | sequential, shannon, hybrid |
| `deepthinking_mathematics` | mathematics, physics, computability |
| `deepthinking_temporal` | temporal |
| `deepthinking_probabilistic` | bayesian, evidential |
| `deepthinking_causal` | causal, counterfactual |
| `deepthinking_strategic` | gametheory, optimization |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning, cryptanalytic |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic |
| `deepthinking_engineering` | engineering, algorithmic |
| `deepthinking_academic` | synthesis, argumentation, critique, analysis |
| `deepthinking_session` | Session management functions |
| `deepthinking_analyze` | Multi-mode analysis |

---

### Step 9: Create Visual Exporter (Optional but Recommended)

**File**: `src/export/visual/modes/yourmode.ts`

Visual exporters generate diagrams in multiple formats (Mermaid, DOT, ASCII, SVG, etc.).

```typescript
/**
 * YourMode Visual Exporter (v8.5.0)
 * Phase 13: Uses fluent builder classes
 */

import type { YourModeThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { DOTGraphBuilder } from '../utils/dot.js';
import { MermaidGraphBuilder } from '../utils/mermaid.js';
import { ASCIIDocBuilder } from '../utils/ascii.js';

/**
 * Export yourmode thought to visual format
 */
export function exportYourModeGraph(
  thought: YourModeThought,
  options: VisualExportOptions
): string {
  const { format } = options;

  switch (format) {
    case 'mermaid':
      return toMermaid(thought);
    case 'dot':
      return toDOT(thought);
    case 'ascii':
      return toASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function toMermaid(thought: YourModeThought): string {
  const builder = new MermaidGraphBuilder()
    .setDirection('TB')
    .setTitle('YourMode Analysis');

  // Add nodes and edges based on thought content
  // builder.addNode({ id: 'node1', label: 'Step 1' });

  return builder.render();
}

function toDOT(thought: YourModeThought): string {
  const builder = new DOTGraphBuilder()
    .setRankDir('TB')
    .setGraphAttribute('label', 'YourMode Analysis');

  // Add nodes and edges
  // builder.addNode({ id: 'node1', label: 'Step 1' });

  return builder.render();
}

function toASCII(thought: YourModeThought): string {
  const builder = new ASCIIDocBuilder()
    .setTitle('YourMode Analysis')
    .addSection('Content', thought.content);

  return builder.render();
}
```

**Register in**: `src/export/visual/modes/index.ts`

**Builder Classes** (14 total, Phase 13):
- `DOTGraphBuilder` - Graphviz DOT format
- `MermaidGraphBuilder` - Mermaid flowcharts
- `MermaidGanttBuilder` - Mermaid Gantt charts
- `MermaidStateDiagramBuilder` - Mermaid state diagrams
- `GraphMLBuilder` - GraphML XML format
- `ASCIIDocBuilder` - ASCII art diagrams
- `SVGBuilder`, `SVGGroupBuilder` - Native SVG
- `TikZBuilder` - LaTeX TikZ
- `UMLBuilder` - PlantUML
- `HTMLDocBuilder` - HTML documents
- `MarkdownBuilder` - Markdown documents
- `ModelicaBuilder` - Modelica models
- `JSONExportBuilder` - Structured JSON

---

### Step 10: Update Export Service (Optional)

**File**: `src/services/ExportService.ts`

If your mode needs custom export formatting beyond visual exports:

```typescript
// In exportToMarkdown() or other export methods:
if (thought.mode === 'yourmode') {
  const ymThought = thought as YourModeThought;
  sections.push(`**Mode**: YourMode Reasoning`);

  // Add mode-specific formatting
}
```

---

### Step 11: Create Mode Documentation

**File**: `docs/modes/YOURMODE.md`

```markdown
# YourMode Reasoning

Brief description of the reasoning approach and when to use it.

## Tool

**MCP Tool**: `deepthinking_analytical` (or appropriate tool group)

**Handler**: v8.5.0 (Specialized)

## Key Concepts

Explain the theoretical foundation and key concepts.

## Use Cases

- Use case 1
- Use case 2
- Use case 3

## Thought Types

| Type | Description |
|------|-------------|
| `analysis` | Description of this thought type |
| `synthesis` | Description of this thought type |
| `evaluation` | Description of this thought type |

## Mode-Specific Properties

| Property | Type | Description |
|----------|------|-------------|
| `hypotheses` | `Hypothesis[]` | List of hypotheses to evaluate |

## Example

\`\`\`json
{
  "mode": "yourmode",
  "thought": "Analyzing the hypothesis...",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "thoughtType": "analysis",
  "hypotheses": [
    {
      "id": "h1",
      "description": "Primary hypothesis",
      "plausibility": 0.7
    }
  ]
}
\`\`\`

## Related Modes

- **Causal**: For cause-effect relationships
- **Bayesian**: For probability updates

## References

- Academic reference 1
- Academic reference 2
```

---

### Step 12: Create Tests

**File**: `tests/unit/modes/handlers/yourmode.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { YourModeHandler } from '../../../../src/modes/handlers/YourModeHandler.js';
import { ThinkingMode } from '../../../../src/types/index.js';

describe('YourModeHandler', () => {
  let handler: YourModeHandler;

  beforeEach(() => {
    handler = new YourModeHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.YOURMODE);
    });

    it('should have modeName', () => {
      expect(handler.modeName).toBeTruthy();
    });

    it('should have description', () => {
      expect(handler.description).toBeTruthy();
    });
  });

  describe('createThought', () => {
    it('should create valid thought from input', () => {
      const input = {
        thought: 'Test thought content',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'yourmode',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.YOURMODE);
      expect(thought.content).toBe('Test thought content');
      expect(thought.sessionId).toBe('session-123');
      expect(thought.id).toBeTruthy();
    });
  });

  describe('validate', () => {
    it('should pass valid input', () => {
      const input = {
        thought: 'Valid thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail on empty thought', () => {
      const input = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail when thoughtNumber exceeds totalThoughts', () => {
      const input = {
        thought: 'Valid thought',
        thoughtNumber: 5,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
    });
  });

  describe('getEnhancements', () => {
    it('should return enhancements object', () => {
      const thought = {
        id: 'test-id',
        sessionId: 'session-123',
        mode: ThinkingMode.YOURMODE,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Test content',
        timestamp: new Date(),
        nextThoughtNeeded: true,
      };

      const enhancements = handler.getEnhancements(thought);
      expect(enhancements).toBeDefined();
      expect(enhancements.relatedModes).toBeDefined();
    });
  });

  describe('supportsThoughtType', () => {
    it('should support defined thought types', () => {
      expect(handler.supportsThoughtType('analysis')).toBe(true);
    });

    it('should not support undefined thought types', () => {
      expect(handler.supportsThoughtType('undefined_type')).toBe(false);
    });
  });
});
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

### 3. Run Tests
```bash
npm run test:run
```
All tests should pass.

### 4. Manual Testing via MCP
Test your mode through an MCP client to verify end-to-end functionality.

---

## Common Pitfalls

### ❌ Mistake 1: Missing ModeHandler
**Symptom**: Mode uses GenericModeHandler, no specialized validation
**Fix**: Create handler in `src/modes/handlers/` and register in `registerAllHandlers()`

### ❌ Mistake 2: Forgetting to add to Thought union type
**Symptom**: Type errors when using the thought
**Fix**: Add `YourModeThought` to union in `src/types/core.ts`

### ❌ Mistake 3: Handler not registered
**Symptom**: `registry.hasSpecializedHandler()` returns false
**Fix**: Add `registry.replace(new YourModeHandler())` to `registerAllHandlers()`

### ❌ Mistake 4: Wrong tool group
**Symptom**: Mode not accessible via expected tool
**Fix**: Add mode to correct tool's `mode` enum in `src/tools/json-schemas.ts`

### ❌ Mistake 5: Wrong mode string casing
**Symptom**: Mode not recognized
**Fix**: Use lowercase in string literals: `'yourmode'` not `'YourMode'`

### ❌ Mistake 6: Missing mode documentation
**Symptom**: Users don't know how to use the mode
**Fix**: Create `docs/modes/YOURMODE.md` with examples

---

## Checklist

Before submitting your new mode, verify:

**Type System**
- [ ] Type definition created in `src/types/modes/yourmode.ts`
- [ ] Added to `ThinkingMode` enum in `src/types/core.ts`
- [ ] Added to `Thought` union type in `src/types/core.ts`
- [ ] Added to `FULLY_IMPLEMENTED_MODES` or `EXPERIMENTAL_MODES`
- [ ] Type guard created and exported

**Validation**
- [ ] Zod schema created in `src/validation/schemas.ts`
- [ ] Validator created in `src/validation/validators/modes/yourmode.ts`

**ModeHandler (v8.x)**
- [ ] Handler created in `src/modes/handlers/YourModeHandler.ts`
- [ ] Handler implements `ModeHandler` interface
- [ ] Handler registered in `src/modes/index.ts` via `registerAllHandlers()`
- [ ] Handler has `createThought()`, `validate()`, and `getEnhancements()` methods

**MCP Integration**
- [ ] Mode added to appropriate tool group in `src/tools/json-schemas.ts`
- [ ] Mode-specific properties defined in tool schema

**Exports (Optional)**
- [ ] Visual exporter created in `src/export/visual/modes/yourmode.ts`
- [ ] Exporter registered in `src/export/visual/modes/index.ts`
- [ ] ExportService updated if custom formatting needed

**Documentation**
- [ ] Mode documentation created at `docs/modes/YOURMODE.md`
- [ ] CHANGELOG.md updated with new mode
- [ ] README.md updated if appropriate

**Testing**
- [ ] Unit tests created in `tests/unit/modes/handlers/yourmode.test.ts`
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] `npm run test:run` passes (all tests)
- [ ] Manual MCP testing completed

---

## Reference Files

Study these examples for patterns:

**Simple Mode** (good starting point):
- Types: `src/types/modes/sequential.ts`
- Handler: `src/modes/handlers/SequentialHandler.ts`
- Exporter: `src/export/visual/modes/sequential.ts`

**Medium Complexity**:
- Types: `src/types/modes/causal.ts`
- Handler: `src/modes/handlers/CausalHandler.ts` (636 lines, graph validation)
- Exporter: `src/export/visual/modes/causal.ts`

**Complex Mode** (full features):
- Types: `src/types/modes/temporal.ts` or `src/types/modes/gametheory.ts`
- Handler: `src/modes/handlers/SystemsThinkingHandler.ts` (8 archetypes)
- Exporter: `src/export/visual/modes/systems-thinking.ts`

---

## Architecture Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/types/core.ts` | ThinkingMode enum, Thought union, mode arrays |
| `src/modes/handlers/ModeHandler.ts` | ModeHandler interface definition |
| `src/modes/registry.ts` | ModeHandlerRegistry singleton |
| `src/modes/index.ts` | Handler imports and `registerAllHandlers()` |
| `src/services/ThoughtFactory.ts` | Thought creation orchestration |
| `src/tools/json-schemas.ts` | MCP tool JSON schemas |

### Handler Interface

```typescript
interface ModeHandler {
  readonly mode: ThinkingMode;
  readonly modeName: string;
  readonly description: string;

  createThought(input: ThinkingToolInput, sessionId: string): Thought;
  validate(input: ThinkingToolInput): ValidationResult;
  getEnhancements?(thought: Thought): ModeEnhancements;
  supportsThoughtType?(thoughtType: string): boolean;
}
```

---

## Questions?

- Check existing handler implementations for patterns
- Review `src/modes/handlers/CausalHandler.ts` for a complete example
- See `CLAUDE.md` for development guidelines
- Refer to mode documentation in `docs/modes/` for examples
