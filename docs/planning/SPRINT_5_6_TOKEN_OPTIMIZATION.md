# Sprint 5, 6 & 7: Token Optimization - Tool Splitting & Schema Refactor

**Source**: Token/context analysis comparing memory-mcp vs deepthinking-mcp
**Goal**: Reduce context/token usage by ~70% through architectural improvements
**Total Items**: 25 tasks organized into 3 sprints
**Estimated Duration**: 4 weeks

---

## Problem Statement

### Current State
- **1 monolithic tool** with ~1,136 lines of schema code
- **Duplicate definitions**: Zod schema + JSON Schema (both manually maintained)
- **~8,000-10,000 tokens** for tool definition in context
- **All 18 mode schemas** loaded regardless of which mode is used
- **Comparison**: memory-mcp uses 45+ small tools with only ~3-4K tokens total

### Target State
- **9 focused tools** with lean, mode-specific schemas
- **Single source of truth**: Zod schemas with auto-generated JSON Schema
- **~3,000-4,000 tokens** total (60% reduction)
- **Lazy schema loading** based on requested mode

---

## Sprint 5: Tool Splitting & Schema Refactor (2 weeks)

### Task 5.1: Install and Configure zod-to-json-schema
**Priority**: CRITICAL | **Complexity**: ⭐ Simple | **ETA**: 30 minutes

**Problem**: Manual duplication of schemas in both Zod and JSON format

**Files**: `package.json`, `src/tools/schema-generator.ts`

**Solution**:
```bash
npm install zod-to-json-schema
```

**Create**: `src/tools/schema-generator.ts`
```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

export function generateToolSchema(zodSchema: z.ZodType, name: string, description: string) {
  return {
    name,
    description,
    inputSchema: zodToJsonSchema(zodSchema, { target: 'openApi3' })
  };
}
```

**Testing**:
- Verify generated JSON matches expected structure
- Run `npm run typecheck`

---

### Task 5.2: Create Base Thought Schema (Shared Properties)
**Priority**: CRITICAL | **Complexity**: ⭐⭐ Moderate | **ETA**: 1 hour

**Problem**: All mode schemas repeat common properties (thought, thoughtNumber, etc.)

**File**: `src/tools/schemas/base.ts`

**Solution**: Extract shared properties into base schema
```typescript
import { z } from 'zod';

export const BaseThoughtSchema = z.object({
  sessionId: z.string().optional().describe('Session ID (creates new if omitted)'),
  thought: z.string().describe('The thought content'),
  thoughtNumber: z.number().int().min(1).describe('Position in sequence'),
  totalThoughts: z.number().int().min(1).describe('Estimated total thoughts'),
  nextThoughtNeeded: z.boolean().describe('Should thinking continue?'),
  isRevision: z.boolean().optional(),
  revisesThought: z.string().optional(),
  branchFrom: z.string().optional(),
  branchId: z.string().optional(),
  uncertainty: z.number().min(0).max(1).optional(),
  dependencies: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
});

export type BaseThoughtInput = z.infer<typeof BaseThoughtSchema>;
```

---

### Task 5.3: Create Mode-Specific Schemas (Split by Category)
**Priority**: CRITICAL | **Complexity**: ⭐⭐⭐ Complex | **ETA**: 4 hours

**Problem**: Single schema handles all 18 modes with massive property list

**Files**: `src/tools/schemas/modes/*.ts`

**New Structure**:
```
src/tools/schemas/
├── base.ts                 # Shared properties
├── index.ts               # Exports all schemas
├── modes/
│   ├── core.ts            # sequential, shannon, hybrid
│   ├── mathematics.ts     # mathematics, physics
│   ├── probabilistic.ts   # bayesian, evidential
│   ├── causal.ts          # causal, counterfactual, abductive
│   ├── temporal.ts        # temporal
│   ├── strategic.ts       # gametheory, optimization
│   ├── analytical.ts      # analogical, firstprinciples
│   └── scientific.ts      # scientificmethod, systemsthinking, formallogic
```

**Example**: `src/tools/schemas/modes/temporal.ts`
```typescript
import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

export const TemporalSchema = BaseThoughtSchema.extend({
  mode: z.literal('temporal'),
  timeline: z.object({
    id: z.string(),
    name: z.string(),
    timeUnit: z.enum(['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'months', 'years']),
    events: z.array(z.string()),
  }).optional(),
  events: z.array(z.object({
    id: z.string(),
    name: z.string(),
    timestamp: z.number(),
    type: z.enum(['instant', 'interval']),
  })).optional(),
  constraints: z.array(z.object({
    id: z.string(),
    type: z.enum(['before', 'after', 'during', 'overlaps', 'meets', 'starts', 'finishes', 'equals']),
    subject: z.string(),
    object: z.string(),
    confidence: z.number().min(0).max(1),
  })).optional(),
});

export type TemporalInput = z.infer<typeof TemporalSchema>;
```

---

### Task 5.4: Create Focused Tool Definitions
**Priority**: CRITICAL | **Complexity**: ⭐⭐⭐ Complex | **ETA**: 4 hours

**Problem**: Single tool with massive schema containing all 18 modes

**File**: `src/tools/definitions.ts`

**Solution**: Create 9 focused tools
```typescript
import { generateToolSchema } from './schema-generator.js';
import { CoreSchema } from './schemas/modes/core.js';
// ... other imports

export const tools = {
  // Core thinking (sequential, shannon, hybrid)
  deepthinking_core: generateToolSchema(CoreSchema, 'deepthinking_core',
    `Core reasoning modes:
- sequential: Iterative refinement and exploration
- shannon: Systematic 5-stage problem-solving
- hybrid: Combines multiple approaches`),

  // Mathematics & Physics
  deepthinking_math: generateToolSchema(MathSchema, 'deepthinking_math',
    `Math/physics reasoning:
- mathematics: Theorem proving, symbolic reasoning, LaTeX
- physics: Tensor math, field theory, conservation laws`),

  // Temporal reasoning
  deepthinking_temporal: generateToolSchema(TemporalSchema, 'deepthinking_temporal',
    `Temporal reasoning with Allen's interval algebra:
- Event timelines and sequencing
- Temporal constraints and causal relations over time`),

  // Probabilistic reasoning
  deepthinking_probabilistic: generateToolSchema(ProbabilisticSchema, 'deepthinking_probabilistic',
    `Probabilistic/evidential reasoning:
- bayesian: Prior/posterior probability, evidence updates
- evidential: Dempster-Shafer theory, belief functions`),

  // Causal reasoning
  deepthinking_causal: generateToolSchema(CausalSchema, 'deepthinking_causal',
    `Causal and explanatory reasoning:
- causal: Cause-effect graphs, interventions
- counterfactual: What-if scenario analysis
- abductive: Inference to best explanation`),

  // Strategic reasoning
  deepthinking_strategic: generateToolSchema(StrategicSchema, 'deepthinking_strategic',
    `Strategic/optimization reasoning:
- gametheory: Nash equilibria, payoff matrices
- optimization: Constraint satisfaction, objectives`),

  // Analytical reasoning
  deepthinking_analytical: generateToolSchema(AnalyticalSchema, 'deepthinking_analytical',
    `Analytical reasoning:
- analogical: Cross-domain pattern matching
- firstprinciples: Axiomatic deduction`),

  // Scientific reasoning
  deepthinking_scientific: generateToolSchema(ScientificSchema, 'deepthinking_scientific',
    `Scientific method and formal logic:
- scientificmethod: Hypothesis testing, experiments
- systemsthinking: Feedback loops, leverage points
- formallogic: Propositional logic, proofs`),

  // Session management (lightweight)
  deepthinking_session: generateToolSchema(SessionSchema, 'deepthinking_session',
    `Session operations:
- summarize, export, get_session, switch_mode, recommend_mode`),
};

export const toolList = Object.values(tools);
```

---

### Task 5.5: Implement Lazy Schema Loading
**Priority**: HIGH | **Complexity**: ⭐⭐⭐ Complex | **ETA**: 3 hours

**Problem**: All schemas loaded at startup even if unused

**File**: `src/tools/lazy-loader.ts`

**Solution**: Load schemas on-demand
```typescript
import { z } from 'zod';

type SchemaLoader = () => Promise<{ schema: z.ZodType; tool: object }>;

const schemaLoaders: Record<string, SchemaLoader> = {
  deepthinking_core: async () => {
    const { CoreSchema } = await import('./schemas/modes/core.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: CoreSchema,
      tool: generateToolSchema(CoreSchema, 'deepthinking_core', '...')
    };
  },
  deepthinking_temporal: async () => {
    const { TemporalSchema } = await import('./schemas/modes/temporal.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: TemporalSchema,
      tool: generateToolSchema(TemporalSchema, 'deepthinking_temporal', '...')
    };
  },
  // ... other loaders
};

const loadedSchemas = new Map<string, { schema: z.ZodType; tool: object }>();

export async function getSchema(toolName: string) {
  if (!loadedSchemas.has(toolName)) {
    const loader = schemaLoaders[toolName];
    if (!loader) throw new Error(`Unknown tool: ${toolName}`);
    loadedSchemas.set(toolName, await loader());
  }
  return loadedSchemas.get(toolName)!;
}

export async function getToolDefinition(toolName: string) {
  const { tool } = await getSchema(toolName);
  return tool;
}

export function getLoadedTools(): string[] {
  return Array.from(loadedSchemas.keys());
}
```

---

### Task 5.6: Update Server to Register Multiple Tools
**Priority**: CRITICAL | **Complexity**: ⭐⭐⭐ Complex | **ETA**: 2 hours

**Problem**: Server registers single monolithic tool

**File**: `src/index.ts`

**Solution**: Register all focused tools
```typescript
import { toolList } from './tools/definitions.js';

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: toolList };
});

// Update call handler to route to correct tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name.startsWith('deepthinking_')) {
    const toolType = name.replace('deepthinking_', '');
    return await handleDeepThinkingTool(toolType, args);
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function handleDeepThinkingTool(toolType: string, args: unknown) {
  const { schema } = await getSchema(`deepthinking_${toolType}`);
  const validated = schema.parse(args);

  switch (toolType) {
    case 'core':
    case 'math':
    case 'temporal':
    case 'probabilistic':
    case 'causal':
    case 'strategic':
    case 'analytical':
    case 'scientific':
      return await handleAddThought(validated);
    case 'session':
      return await handleSessionAction(validated);
    default:
      throw new Error(`Unknown tool type: ${toolType}`);
  }
}
```

---

### Task 5.7: Remove Duplicate JSON Schema from thinking.ts
**Priority**: HIGH | **Complexity**: ⭐⭐ Moderate | **ETA**: 2 hours

**Problem**: ~400 lines of manually maintained JSON Schema duplicating Zod schema

**File**: `src/tools/thinking.ts`

**Solution**: Delete inputSchema object, use auto-generated schema
```typescript
// BEFORE: 1136 lines
export const thinkingTool = {
  name: 'deepthinking',
  description: '...',
  inputSchema: {
    type: "object",
    properties: {
      // 400+ lines of JSON Schema...
    }
  }
};

// AFTER: ~20 lines
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ThinkingToolSchema } from './schemas/index.js';

export const thinkingTool = {
  name: 'deepthinking',
  description: '...',
  inputSchema: zodToJsonSchema(ThinkingToolSchema, { target: 'openApi3' })
};

export { ThinkingToolSchema };
export type ThinkingToolInput = z.infer<typeof ThinkingToolSchema>;
```

---

### Task 5.8: Optimize Schema Descriptions
**Priority**: MEDIUM | **Complexity**: ⭐⭐ Moderate | **ETA**: 2 hours

**Problem**: Verbose descriptions increase token count

**Files**: `src/tools/schemas/modes/*.ts`

**Guidelines**:
- Remove descriptions for self-explanatory fields (id, name)
- Use abbreviations: `ms/s/min/hr/day/mo/yr`
- Keep descriptions under 50 chars

```typescript
// BEFORE (verbose)
timeline: z.object({
  id: z.string().describe('Unique identifier for the timeline'),
  name: z.string().describe('Human-readable name for the timeline'),
  timeUnit: z.enum([...]).describe('The unit of time measurement used'),
});

// AFTER (concise)
timeline: z.object({
  id: z.string(),
  name: z.string(),
  timeUnit: z.enum([...]).describe('Time unit: ms/s/min/hr/day/mo/yr'),
});
```

---

### Task 5.9: Add Schema Versioning
**Priority**: MEDIUM | **Complexity**: ⭐⭐ Moderate | **ETA**: 1 hour

**File**: `src/tools/schemas/version.ts`

**Solution**:
```typescript
export const SCHEMA_VERSION = '2.0.0';

export const schemaMetadata = {
  version: SCHEMA_VERSION,
  breakingChanges: [
    { version: '2.0.0', description: 'Split monolithic tool into 9 focused tools' },
  ],
  deprecated: [
    { tool: 'deepthinking', replacement: 'deepthinking_*', removeIn: '5.0.0' },
  ],
};
```

---

### Task 5.10: Create Migration Guide
**Priority**: MEDIUM | **Complexity**: ⭐ Simple | **ETA**: 1 hour

**File**: `docs/migration/v4.0-tool-splitting.md`

**Content**:
- Breaking changes summary
- Old tool → New tool mapping table
- Code examples for each new tool
- Backward compatibility notes

---

## Sprint 5 Checklist

- [ ] 5.1: zod-to-json-schema configured
- [ ] 5.2: Base thought schema created
- [ ] 5.3: 8 mode-specific schemas created
- [ ] 5.4: 9 focused tools defined
- [ ] 5.5: Lazy schema loading implemented
- [ ] 5.6: Server updated for multiple tools
- [ ] 5.7: Duplicate JSON Schema removed
- [ ] 5.8: Schema descriptions optimized
- [ ] 5.9: Schema versioning added
- [ ] 5.10: Migration guide created
- [ ] Token reduction verified: ~8K → ~3K (60%+)
- [ ] `npm run typecheck`: 0 errors
- [ ] `npm test`: All tests passing

---

## Sprint 6: Testing & Migration (1 week)

### Task 6.1: Add Unit Tests for All New Schemas
**Priority**: CRITICAL | **Complexity**: ⭐⭐⭐ Complex | **ETA**: 4 hours

**Files**: `tests/unit/tools/schemas/*.test.ts`

**Test coverage**:
- Base schema validation
- Each mode schema validation
- Schema generation (Zod → JSON)
- Edge cases and error handling

```typescript
// tests/unit/tools/schemas/temporal.test.ts
import { describe, it, expect } from 'vitest';
import { TemporalSchema } from '@/tools/schemas/modes/temporal.js';

describe('TemporalSchema', () => {
  it('should validate valid temporal input', () => {
    const input = {
      thought: 'Analyzing event timeline',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'temporal',
      timeline: {
        id: 'timeline-1',
        name: 'Project Timeline',
        timeUnit: 'days',
        events: ['event-1', 'event-2'],
      },
    };
    expect(() => TemporalSchema.parse(input)).not.toThrow();
  });

  it('should reject invalid timeline timeUnit', () => {
    const input = {
      thought: 'Test',
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: false,
      mode: 'temporal',
      timeline: {
        id: 'timeline-1',
        name: 'Test',
        timeUnit: 'invalid',
        events: [],
      },
    };
    expect(() => TemporalSchema.parse(input)).toThrow();
  });
});
```

---

### Task 6.2: Add Integration Tests for Tool Routing
**Priority**: CRITICAL | **Complexity**: ⭐⭐⭐ Complex | **ETA**: 4 hours

**File**: `tests/integration/tool-routing.test.ts`

**Test scenarios**:
- Each tool receives correct requests
- Validation errors handled properly
- Session management across tools
- Mode switching between tools

---

### Task 6.3: Create Backward Compatibility Layer
**Priority**: HIGH | **Complexity**: ⭐⭐⭐ Complex | **ETA**: 3 hours

**File**: `src/tools/legacy.ts`

**Solution**: Keep old `deepthinking` tool as deprecated alias
```typescript
export const legacyTool = {
  name: 'deepthinking',
  description: '[DEPRECATED] Use deepthinking_* tools. Routes to appropriate new tool.',
  inputSchema: {/* minimal schema */},
};

export async function handleLegacyTool(args: unknown) {
  console.warn('DEPRECATED: deepthinking tool. Use deepthinking_* tools.');

  const mode = (args as any).mode || 'hybrid';
  const newTool = modeToToolMap[mode];
  return await handleDeepThinkingTool(newTool, args);
}

const modeToToolMap: Record<string, string> = {
  sequential: 'core',
  shannon: 'core',
  hybrid: 'core',
  mathematics: 'math',
  physics: 'math',
  temporal: 'temporal',
  bayesian: 'probabilistic',
  evidential: 'probabilistic',
  causal: 'causal',
  counterfactual: 'causal',
  abductive: 'causal',
  gametheory: 'strategic',
  optimization: 'strategic',
  analogical: 'analytical',
  firstprinciples: 'analytical',
  scientificmethod: 'scientific',
  systemsthinking: 'scientific',
  formallogic: 'scientific',
};
```

---

### Task 6.4: Benchmark Token Usage
**Priority**: HIGH | **Complexity**: ⭐⭐ Moderate | **ETA**: 2 hours

**File**: `scripts/benchmark-tokens.ts`

**Solution**:
```typescript
import { encode } from 'gpt-tokenizer';
import { toolList as newTools } from '../src/tools/definitions.js';
import { thinkingTool as oldTool } from '../src/tools/thinking-legacy.js';

function countTokens(obj: object): number {
  return encode(JSON.stringify(obj)).length;
}

console.log('=== Token Usage Comparison ===\n');

const oldTokens = countTokens(oldTool);
console.log(`Old deepthinking tool: ${oldTokens} tokens`);

let totalNewTokens = 0;
for (const tool of newTools) {
  const tokens = countTokens(tool);
  totalNewTokens += tokens;
  console.log(`  ${tool.name}: ${tokens} tokens`);
}

console.log(`\nNew tools total: ${totalNewTokens} tokens`);
console.log(`Reduction: ${oldTokens - totalNewTokens} tokens (${((1 - totalNewTokens/oldTokens) * 100).toFixed(1)}%)`);
```

---

### Task 6.5: Update Documentation
**Priority**: MEDIUM | **Complexity**: ⭐⭐ Moderate | **ETA**: 2 hours

**Files**: `README.md`, `CLAUDE.md`, `docs/API.md`

**Updates**:
- Document new tool structure
- Update usage examples
- Add migration section
- Update MCP configuration examples

---

### Task 6.6: Performance Testing
**Priority**: MEDIUM | **Complexity**: ⭐⭐ Moderate | **ETA**: 2 hours

**File**: `tests/performance/schema-loading.test.ts`

**Test scenarios**:
- Cold start time (all schemas)
- Lazy loading time (single schema)
- Validation throughput
- Memory usage comparison

---

### Task 6.7: Update CHANGELOG and Version
**Priority**: HIGH | **Complexity**: ⭐ Simple | **ETA**: 30 minutes

**Files**: `CHANGELOG.md`, `package.json`

**Version bump**: 3.5.0 → 4.0.0 (breaking change)

**Changelog entry**:
```markdown
## [4.0.0] - 2025-XX-XX

### Breaking Changes
- Split monolithic `deepthinking` tool into 9 focused tools
- Old `deepthinking` tool deprecated (still works, routes to new tools)

### Added
- `deepthinking_core` - Sequential, Shannon, Hybrid modes
- `deepthinking_math` - Mathematics, Physics modes
- `deepthinking_temporal` - Temporal reasoning
- `deepthinking_probabilistic` - Bayesian, Evidential modes
- `deepthinking_causal` - Causal, Counterfactual, Abductive modes
- `deepthinking_strategic` - Game Theory, Optimization modes
- `deepthinking_analytical` - Analogical, First Principles modes
- `deepthinking_scientific` - Scientific Method, Systems Thinking, Formal Logic
- `deepthinking_session` - Session management operations
- Lazy schema loading for reduced memory footprint
- Schema versioning for future migrations

### Changed
- Schemas now use zod-to-json-schema (single source of truth)
- Token usage reduced by ~60% (8K → 3K tokens)

### Deprecated
- `deepthinking` tool (use `deepthinking_*` tools instead)
```

---

## Sprint 6 Checklist

- [ ] 6.1: Unit tests for all schemas (100% coverage)
- [ ] 6.2: Integration tests for tool routing
- [ ] 6.3: Backward compatibility layer working
- [ ] 6.4: Token benchmark shows 60%+ reduction
- [ ] 6.5: Documentation updated
- [ ] 6.6: Performance tests passing
- [ ] 6.7: Version bumped to 4.0.0
- [ ] `npm run typecheck`: 0 errors
- [ ] `npm test`: All tests passing

---

## Token Optimization Summary

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Tools | 1 | 9 | Focused tools |
| Schema lines | 1,136 | ~400 | 65% reduction |
| Token usage | ~8-10K | ~3-4K | 60% reduction |
| Schema sources | 2 (Zod + JSON) | 1 (Zod only) | Single source |
| Load strategy | Eager | Lazy | On-demand |

---

## Tool Mapping Reference

| Old Mode | New Tool |
|----------|----------|
| sequential, shannon, hybrid | `deepthinking_core` |
| mathematics, physics | `deepthinking_math` |
| temporal | `deepthinking_temporal` |
| bayesian, evidential | `deepthinking_probabilistic` |
| causal, counterfactual, abductive | `deepthinking_causal` |
| gametheory, optimization | `deepthinking_strategic` |
| analogical, firstprinciples | `deepthinking_analytical` |
| scientificmethod, systemsthinking, formallogic | `deepthinking_scientific` |
| (session actions) | `deepthinking_session` |

---

## Sprint 7: Description & Verbosity Optimization (1 week)

**Goal**: Further reduce token usage by 20-30% through systematic removal of redundant descriptions, verbose text, and unnecessary schema metadata.

### Current Verbosity Issues

1. **Redundant field descriptions**: Fields like `id`, `name`, `type` have obvious meanings
2. **Overly verbose tool descriptions**: Multi-line descriptions when single line suffices
3. **Repeated enum documentation**: Same enums described in multiple places
4. **Unnecessary nested object descriptions**: Parent description covers child fields
5. **Boilerplate text**: "This field represents...", "Used to specify...", etc.

---

### Task 7.1: Audit Current Description Token Usage
**Priority**: HIGH | **Complexity**: ⭐⭐ Moderate | **ETA**: 2 hours

**File**: `scripts/audit-descriptions.ts`

**Create audit script to identify verbosity hotspots**:
```typescript
import { toolList } from '../src/tools/definitions.js';

interface DescriptionAudit {
  field: string;
  description: string;
  tokens: number;
  recommendation: 'keep' | 'shorten' | 'remove';
}

function auditDescriptions(schema: object, path = ''): DescriptionAudit[] {
  const audits: DescriptionAudit[] = [];
  for (const [key, value] of Object.entries(schema)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (key === 'description' && typeof value === 'string') {
      const tokens = countTokens(value);
      audits.push({
        field: path,
        description: value,
        tokens,
        recommendation: getRecommendation(path, value, tokens),
      });
    }
    if (typeof value === 'object' && value !== null) {
      audits.push(...auditDescriptions(value, currentPath));
    }
  }
  return audits;
}

function getRecommendation(field: string, desc: string, tokens: number): 'keep' | 'shorten' | 'remove' {
  const fieldName = field.split('.').pop()!;
  if (['id', 'name', 'type', 'value', 'data'].includes(fieldName)) return 'remove';
  if (tokens > 20 || desc.includes('This field') || desc.includes('Used to')) return 'shorten';
  return 'keep';
}
```

**Output**: Report showing potential token savings per tool

---

### Task 7.2: Remove Self-Explanatory Field Descriptions
**Priority**: HIGH | **Complexity**: ⭐⭐ Moderate | **ETA**: 3 hours

**Files**: `src/tools/schemas/modes/*.ts`, `src/tools/schemas/base.ts`

**Problem**: Common fields have unnecessary descriptions
```typescript
// BEFORE (wasteful)
id: z.string().describe('Unique identifier'),
name: z.string().describe('Human-readable name'),
type: z.string().describe('The type of this item'),
value: z.number().describe('The numeric value'),
description: z.string().describe('A description of this item'),
timestamp: z.number().describe('Unix timestamp'),
```

**Solution**: Remove descriptions from self-documenting fields
```typescript
// AFTER (lean)
id: z.string(),
name: z.string(),
type: z.string(),
value: z.number(),
description: z.string(),
timestamp: z.number(),
```

**Fields to strip descriptions from**:
- `id`, `ids`, `entityId`, `sessionId`, `thoughtId`
- `name`, `title`, `label`
- `type`, `kind`, `category`
- `value`, `values`, `data`
- `description`, `content`, `text`
- `timestamp`, `createdAt`, `updatedAt`
- `enabled`, `active`, `valid`
- `count`, `total`, `length`, `size`

**Estimated savings**: ~500-800 tokens

---

### Task 7.3: Shorten Tool Descriptions to Single Line
**Priority**: HIGH | **Complexity**: ⭐⭐ Moderate | **ETA**: 2 hours

**File**: `src/tools/definitions.ts`

**Problem**: Multi-line verbose descriptions (~150 tokens each)

**Solution**: Single-line concise descriptions (~30 tokens each)
```typescript
export const tools = {
  deepthinking_core: generateToolSchema(CoreSchema, 'deepthinking_core',
    'Core modes: sequential, shannon (5-stage), hybrid'),

  deepthinking_math: generateToolSchema(MathSchema, 'deepthinking_math',
    'Math/physics: proofs, tensors, LaTeX, conservation laws'),

  deepthinking_temporal: generateToolSchema(TemporalSchema, 'deepthinking_temporal',
    'Temporal: timelines, Allen intervals, event sequencing'),

  deepthinking_probabilistic: generateToolSchema(ProbabilisticSchema, 'deepthinking_probabilistic',
    'Probabilistic: Bayesian updates, Dempster-Shafer belief'),

  deepthinking_causal: generateToolSchema(CausalSchema, 'deepthinking_causal',
    'Causal: graphs, counterfactuals, abductive inference'),

  deepthinking_strategic: generateToolSchema(StrategicSchema, 'deepthinking_strategic',
    'Strategic: game theory, Nash equilibria, optimization'),

  deepthinking_analytical: generateToolSchema(AnalyticalSchema, 'deepthinking_analytical',
    'Analytical: analogical mapping, first principles'),

  deepthinking_scientific: generateToolSchema(ScientificSchema, 'deepthinking_scientific',
    'Scientific: hypothesis testing, systems thinking, formal logic'),

  deepthinking_session: generateToolSchema(SessionSchema, 'deepthinking_session',
    'Session: summarize, export, get, switch_mode, recommend'),
};
```

**Estimated savings**: ~400-600 tokens

---

### Task 7.4: Use Abbreviations in Enum Descriptions
**Priority**: MEDIUM | **Complexity**: ⭐ Simple | **ETA**: 1 hour

**Files**: `src/tools/schemas/modes/*.ts`

**Problem**: Verbose enum descriptions
```typescript
// BEFORE
timeUnit: z.enum([...]).describe('The unit of time measurement for timestamps in this timeline'),
```

**Solution**: Terse descriptions with abbreviations
```typescript
// AFTER
timeUnit: z.enum([...]).describe('ms|s|min|hr|day|mo|yr'),
// Or remove entirely - enum values are self-documenting
```

**Standard abbreviations**:
- Time: `ms`, `s`, `min`, `hr`, `day`, `mo`, `yr`
- Ranges: `0-1` not "between zero and one"
- IDs: `ID` not "identifier"

**Estimated savings**: ~200-300 tokens

---

### Task 7.5: Consolidate Repeated Enum Definitions
**Priority**: MEDIUM | **Complexity**: ⭐⭐ Moderate | **ETA**: 2 hours

**File**: `src/tools/schemas/shared-enums.ts`

**Problem**: Same enums defined in multiple schema files

**Solution**: Create shared enum definitions
```typescript
// src/tools/schemas/shared-enums.ts
import { z } from 'zod';

export const TimeUnitEnum = z.enum([
  'milliseconds', 'seconds', 'minutes', 'hours', 'days', 'months', 'years'
]);
export const ConfidenceSchema = z.number().min(0).max(1);
export const PriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const ImpactEnum = z.enum(['positive', 'negative', 'neutral']);
```

**Estimated savings**: ~100-200 tokens

---

### Task 7.6: Remove Redundant Nested Object Descriptions
**Priority**: MEDIUM | **Complexity**: ⭐⭐ Moderate | **ETA**: 2 hours

**Files**: `src/tools/schemas/modes/*.ts`

**Problem**: Descriptions at multiple nesting levels
```typescript
// BEFORE (redundant - 3 levels of descriptions)
causalGraph: z.object({
  nodes: z.array(z.object({
    id: z.string().describe('Unique identifier for the node'),
    name: z.string().describe('Display name of the node'),
    type: z.enum([...]).describe('The role of this node'),
  })).describe('Array of nodes in the causal graph'),
  edges: z.array(z.object({...})).describe('Array of edges'),
}).describe('Causal graph structure with nodes and edges'),
```

**Solution**: Single description at appropriate level
```typescript
// AFTER (one description)
causalGraph: z.object({
  nodes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['cause', 'effect', 'mediator', 'confounder']),
  })),
  edges: z.array(z.object({
    from: z.string(),
    to: z.string(),
    strength: z.number().min(0).max(1),
  })),
}).describe('Causal DAG: nodes + weighted edges'),
```

**Estimated savings**: ~300-500 tokens

---

### Task 7.7: Create Description Style Guide
**Priority**: MEDIUM | **Complexity**: ⭐ Simple | **ETA**: 1 hour

**File**: `docs/development/DESCRIPTION_STYLE_GUIDE.md`

**Key rules**:
- Field descriptions: max 50 chars
- Tool descriptions: max 100 chars (single line)
- Never describe: id, name, type, value, description, timestamp
- Use abbreviations: ms, s, min, hr, 0-1, ID
- Avoid: "This field...", "Used to...", "The value of..."
- One description per object hierarchy level

---

### Task 7.8: Apply Style Guide to All Schemas
**Priority**: HIGH | **Complexity**: ⭐⭐⭐ Complex | **ETA**: 4 hours

**Files**: All `src/tools/schemas/**/*.ts`

**Process**:
1. Run audit script (7.1)
2. Apply removals (7.2)
3. Apply shortenings (7.3-7.6)
4. Verify against style guide (7.7)

**Checklist per schema file**:
- [ ] Self-explanatory descriptions removed
- [ ] Verbose descriptions shortened to <50 chars
- [ ] Abbreviations used consistently
- [ ] One description per nested hierarchy
- [ ] Tool description single line <100 chars

---

## Sprint 7 Checklist

- [ ] 7.1: Audit script created and run
- [ ] 7.2: Self-explanatory descriptions removed
- [ ] 7.3: Tool descriptions shortened to single line
- [ ] 7.4: Enum descriptions use abbreviations
- [ ] 7.5: Shared enums consolidated
- [ ] 7.6: Nested object descriptions deduplicated
- [ ] 7.7: Style guide documented
- [ ] 7.8: All schemas updated per style guide
- [ ] Additional token reduction: 20-30%
- [ ] `npm run typecheck`: 0 errors
- [ ] `npm test`: All tests passing

---

## Final Token Optimization Summary (All Sprints)

| Metric | Baseline | After 5-6 | After 7 | Total |
|--------|----------|-----------|---------|-------|
| Tools | 1 | 9 | 9 | Focused |
| Schema lines | 1,136 | ~400 | ~300 | **74% ↓** |
| Token usage | ~8-10K | ~3-4K | ~2-3K | **70-75% ↓** |
| Schema sources | 2 | 1 | 1 | Single |
| Load strategy | Eager | Lazy | Lazy | On-demand |
| Descriptions | Verbose | Moderate | Minimal | Lean |

---

## Sprint 7 Task Summary

| Task | Description | Priority | ETA |
|------|-------------|----------|-----|
| 7.1 | Audit description token usage | HIGH | 2h |
| 7.2 | Remove self-explanatory descriptions | HIGH | 3h |
| 7.3 | Shorten tool descriptions | HIGH | 2h |
| 7.4 | Use abbreviations in enums | MEDIUM | 1h |
| 7.5 | Consolidate shared enums | MEDIUM | 2h |
| 7.6 | Remove redundant nested descriptions | MEDIUM | 2h |
| 7.7 | Create description style guide | MEDIUM | 1h |
| 7.8 | Apply style guide to all schemas | HIGH | 4h |

**Sprint 7 Total ETA**: ~17 hours (1 week)
