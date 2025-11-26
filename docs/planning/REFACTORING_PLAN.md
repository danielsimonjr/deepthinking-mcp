# Refactoring Plan: Context/Token Optimization

**Version**: 1.1.0
**Created**: 2025-11-26
**Updated**: 2025-11-26
**Status**: Active
**Total Sprints**: 6 (Sprints 5-10)
**Total Tasks**: 48 tasks organized into sprints of 5-10 items

---

## Executive Summary

This plan consolidates all refactoring efforts to reduce context/token usage in the DeepThinking MCP codebase. It merges completed work from Sprints 5-7 with new optimization opportunities discovered during codebase analysis.

### Key Metrics

| Metric | Before (v3.x) | v4.0.0 | v4.1.0 | Target | Status |
|--------|---------------|--------|--------|--------|--------|
| Tool Count | 1 monolithic | 9 focused | 9 focused | 9 | ✅ Complete |
| Schema Sources | 2 (Zod + JSON) | 2 (partial) | 1 (Zod only) | 1 | ✅ Complete |
| Token Usage | ~8-10K | ~4-5K | ~3-4K | ~2-3K | 🔄 70% |
| Largest File | 2546 lines | 2546 lines | 2546 lines | <500 lines | ❌ Pending |
| Eager Imports | All | All | Lazy Services | Lazy | 🔄 Partial |
| Total Source Lines | 38,655 | 38,655 | ~38,200 | ~30,000 | 🔄 In Progress |

---

## Sprint 5: Tool Splitting & Schema Refactor ✅ COMPLETE

**Status**: 100% Complete (v4.1.0)
**Duration**: Completed

### Task 5.1: Install and Configure zod-to-json-schema ✅
**Status**: COMPLETE
**Files**: `package.json`, `src/tools/schema-generator.ts`

The `zod-to-json-schema` package is installed and configured. The `generateToolSchema()` function auto-generates JSON schemas from Zod schemas.

### Task 5.2: Create Base Thought Schema ✅
**Status**: COMPLETE
**File**: `src/tools/schemas/base.ts`

Shared properties extracted into `BaseThoughtSchema`:
- Session management (sessionId)
- Core properties (thought, thoughtNumber, totalThoughts, nextThoughtNeeded)
- Revision tracking (isRevision, revisesThought, revisionReason)
- Branching (branchFrom, branchId)
- Uncertainty and dependencies

### Task 5.3: Create Mode-Specific Schemas ✅
**Status**: COMPLETE
**Files**: `src/tools/schemas/modes/*.ts`

8 mode-specific schemas created:
- `core.ts` - sequential, shannon, hybrid
- `mathematics.ts` - mathematics, physics
- `temporal.ts` - temporal reasoning
- `probabilistic.ts` - bayesian, evidential
- `causal.ts` - causal, counterfactual, abductive
- `strategic.ts` - gametheory, optimization
- `analytical.ts` - analogical, firstprinciples
- `scientific.ts` - scientificmethod, systemsthinking, formallogic

### Task 5.4: Create Focused Tool Definitions ✅
**Status**: COMPLETE
**File**: `src/tools/definitions.ts`

9 focused tools defined with optimized single-line descriptions:
- `deepthinking_core` - "Core modes: sequential, shannon (5-stage), hybrid"
- `deepthinking_math` - "Math/physics: proofs, tensors, LaTeX, conservation laws"
- `deepthinking_temporal` - "Temporal: timelines, Allen intervals, event sequencing"
- `deepthinking_probabilistic` - "Probabilistic: Bayesian updates, Dempster-Shafer belief"
- `deepthinking_causal` - "Causal: graphs, counterfactuals, abductive inference"
- `deepthinking_strategic` - "Strategic: game theory, Nash equilibria, optimization"
- `deepthinking_analytical` - "Analytical: analogical mapping, first principles"
- `deepthinking_scientific` - "Scientific: hypothesis testing, systems thinking, formal logic"
- `deepthinking_session` - "Session: summarize, export, get, switch_mode, recommend"

### Task 5.5: Implement Lazy Schema Loading ✅
**Status**: COMPLETE (v4.1.0)
**Priority**: HIGH
**File**: `src/tools/lazy-loader.ts` (to create)

**Problem**: All 8 mode schemas are imported at startup even if unused.

**Current** (`definitions.ts` lines 8-17):
```typescript
import { CoreSchema } from './schemas/modes/core.js';
import { MathSchema } from './schemas/modes/mathematics.js';
import { TemporalSchema } from './schemas/modes/temporal.js';
// ... all loaded immediately
```

**Solution**: Create lazy loading with dynamic imports
```typescript
const schemaLoaders = {
  deepthinking_core: () => import('./schemas/modes/core.js'),
  deepthinking_math: () => import('./schemas/modes/mathematics.js'),
  // ...
};

export async function getSchema(toolName: string) {
  if (!loadedSchemas.has(toolName)) {
    const module = await schemaLoaders[toolName]();
    loadedSchemas.set(toolName, module.default || module);
  }
  return loadedSchemas.get(toolName);
}
```

### Task 5.6: Update Server to Register Multiple Tools ✅
**Status**: COMPLETE
**File**: `src/index.ts`

Server now registers all 9 focused tools plus legacy tool for backward compatibility.

### Task 5.7: Remove Duplicate JSON Schema from thinking.ts ✅
**Status**: COMPLETE (v4.1.0)
**File**: `src/tools/thinking.ts`

**Achieved**:
- Removed 414 lines of manually maintained JSON Schema
- File reduced from 1,136 → 722 lines (36% reduction)
- Now uses `zodToJsonSchema()` for auto-generation
- Single source of truth: Zod schemas only

### Task 5.8: Optimize Schema Descriptions ✅
**Status**: COMPLETE
**Files**: `src/tools/definitions.ts`

Tool descriptions shortened to single-line format (<100 chars each).

### Task 5.9: Add Schema Versioning ⚠️
**Status**: PARTIAL
**File**: `src/tools/schemas/version.ts` (to verify)

Schema version tracking for migration support.

### Task 5.10: Create Migration Guide ✅
**Status**: COMPLETE
**File**: `docs/migration/v4.0-tool-splitting.md`

---

## Sprint 6: Testing & Validation 🔄 IN PROGRESS

**Status**: 60% Complete
**Duration**: 1 week estimated

### Task 6.1: Add Unit Tests for New Schemas
**Status**: NEEDS VERIFICATION
**Files**: `tests/unit/tools/schemas/*.test.ts`

Verify test coverage for:
- Base schema validation
- Each mode schema validation
- Schema generation (Zod → JSON)
- Edge cases and error handling

### Task 6.2: Add Integration Tests for Tool Routing
**Status**: NEEDS VERIFICATION
**File**: `tests/integration/tool-routing.test.ts`

Test scenarios:
- Each tool receives correct requests
- Validation errors handled properly
- Session management across tools
- Mode switching between tools

### Task 6.3: Create Backward Compatibility Layer ✅
**Status**: COMPLETE
**File**: `src/index.ts` (lines 92-118)

Legacy `deepthinking` tool routes to appropriate new tools with deprecation warning.

### Task 6.4: Benchmark Token Usage
**Status**: NOT STARTED
**Priority**: HIGH
**File**: `scripts/benchmark-tokens.ts` (to create)

**Instructions**:
1. Create benchmark script using `gpt-tokenizer` or `tiktoken`
2. Count tokens for old monolithic tool vs new focused tools
3. Generate comparison report
4. Target: Verify 60%+ reduction

### Task 6.5: Update Documentation
**Status**: PARTIAL
**Files**: `README.md`, `CLAUDE.md`

Update usage examples to use new tool names.

### Task 6.6: Performance Testing
**Status**: NOT STARTED
**File**: `tests/performance/schema-loading.test.ts`

Test scenarios:
- Cold start time comparison
- Lazy vs eager loading
- Validation throughput

### Task 6.7: Update CHANGELOG and Version ✅
**Status**: COMPLETE
**Files**: `CHANGELOG.md`, `package.json`

Version 4.0.0 released with breaking changes documented.

---

## Sprint 7: Description & Verbosity Optimization 🔄 IN PROGRESS

**Status**: 40% Complete
**Goal**: Further reduce token usage by 20-30%

### Task 7.1: Audit Current Description Token Usage
**Status**: NOT STARTED
**Priority**: HIGH
**File**: `scripts/audit-descriptions.ts` (to create)

**Instructions**:
1. Create script to scan all schema files
2. Count tokens in each description
3. Identify fields with unnecessary descriptions (id, name, type, value)
4. Generate report with recommendations
5. Target: Identify 500+ tokens that can be removed

### Task 7.2: Remove Self-Explanatory Field Descriptions
**Status**: NOT STARTED
**Priority**: HIGH
**Files**: `src/tools/schemas/**/*.ts`

**Fields to strip descriptions from**:
- `id`, `ids`, `entityId`, `sessionId`, `thoughtId`
- `name`, `title`, `label`
- `type`, `kind`, `category`
- `value`, `values`, `data`
- `description`, `content`, `text`
- `timestamp`, `createdAt`, `updatedAt`
- `enabled`, `active`, `valid`
- `count`, `total`, `length`, `size`

### Task 7.3: Shorten Tool Descriptions ✅
**Status**: COMPLETE
**File**: `src/tools/definitions.ts`

All tool descriptions now single-line, <100 chars.

### Task 7.4: Use Abbreviations in Enum Descriptions
**Status**: NOT STARTED
**Files**: `src/tools/schemas/modes/*.ts`

Replace verbose descriptions with abbreviations:
- `"Time unit: ms|s|min|hr|day|mo|yr"` instead of full words
- `"0-1"` instead of "between zero and one"
- `"ID"` instead of "identifier"

### Task 7.5: Consolidate Shared Enums
**Status**: NOT STARTED
**File**: `src/tools/schemas/shared-enums.ts` (to create)

**Instructions**:
1. Create shared enum file for common enums
2. Export: TimeUnitEnum, ConfidenceSchema, PriorityEnum, ImpactEnum
3. Import in mode-specific schemas
4. Reduces duplication across 8 schema files

### Task 7.6: Remove Redundant Nested Object Descriptions
**Status**: NOT STARTED
**Files**: `src/tools/schemas/modes/*.ts`

One description per nested hierarchy level, not multiple.

### Task 7.7: Create Description Style Guide
**Status**: NOT STARTED
**File**: `docs/development/DESCRIPTION_STYLE_GUIDE.md` (to create)

### Task 7.8: Apply Style Guide to All Schemas
**Status**: NOT STARTED
**Files**: All `src/tools/schemas/**/*.ts`

---

## Sprint 8: Large File Refactoring 🆕 NEW

**Status**: NOT STARTED
**Goal**: Split monolithic files for maintainability and lazy loading
**Priority**: HIGH

### Task 8.1: Split visual.ts (2546 lines) into Mode-Specific Exporters
**Priority**: CRITICAL
**Current File**: `src/export/visual.ts`
**Target Structure**:
```
src/export/visual/
├── index.ts              # Re-exports, ~50 lines
├── base.ts               # VisualExporter base class, ~100 lines
├── causal.ts             # Causal graph export, ~200 lines
├── temporal.ts           # Timeline export, ~200 lines
├── game-theory.ts        # Game tree export, ~200 lines
├── bayesian.ts           # Bayesian network export, ~200 lines
├── sequential.ts         # Thought flow export, ~150 lines
├── systems-thinking.ts   # Feedback loop export, ~200 lines
├── optimization.ts       # Solution space export, ~150 lines
├── formal-logic.ts       # Proof tree export, ~200 lines
└── utils.ts              # Shared utilities, ~100 lines
```

**Instructions**:
1. Create `src/export/visual/` directory
2. Extract each `exportXxxGraph` method group to separate file
3. Create base class with shared formatting utilities
4. Update imports in `src/services/ExportService.ts`
5. Add lazy loading for mode-specific exporters

**Estimated Reduction**: 2546 lines → 10 files averaging ~160 lines each

### Task 8.2: Split latex.ts (1284 lines) into Mode-Specific Exporters
**Priority**: HIGH
**Current File**: `src/export/latex.ts`
**Target Structure**:
```
src/export/latex/
├── index.ts              # Re-exports
├── base.ts               # Document structure, preamble
├── modes/
│   ├── mathematics.ts    # Math-specific LaTeX
│   ├── temporal.ts       # Timeline diagrams
│   ├── causal.ts         # TikZ causal graphs
│   └── ...
└── formatters.ts         # Equation formatting utilities
```

### Task 8.3: Modularize batch/processor.ts (1073 lines)
**Priority**: MEDIUM
**Current File**: `src/batch/processor.ts`
**Target Structure**:
```
src/batch/
├── processor.ts          # Core processor, ~200 lines
├── operations/
│   ├── validate.ts       # Batch validation
│   ├── export.ts         # Batch export
│   ├── analyze.ts        # Batch analysis
│   ├── migrate.ts        # Batch migration
│   └── backup.ts         # Batch backup
├── queue.ts              # Job queue management
└── progress.ts           # Progress tracking
```

### Task 8.4: Extract Static Data from reasoning-types.ts (1293 lines)
**Priority**: MEDIUM
**Current File**: `src/taxonomy/reasoning-types.ts`
**Solution**: Move to JSON data file with type-safe loader

**Instructions**:
1. Create `src/taxonomy/data/reasoning-types.json`
2. Create `src/taxonomy/loader.ts` for type-safe loading
3. Load data lazily on first use
4. Cache after first load

### Task 8.5: Split visualization/ Files (~3000 lines total)
**Priority**: MEDIUM
**Files**:
- `mindmap.ts` (693 lines)
- `mermaid.ts` (666 lines)
- `interactive.ts` (601 lines)
- `thought-flow.ts` (567 lines)
- `state-charts.ts` (543 lines)

**Solution**: Create modular visualization system with shared base

### Task 8.6: Create Lazy Export Service Factory
**Priority**: HIGH
**File**: `src/services/ExportFactory.ts` (to create)

**Instructions**:
1. Create factory that lazily loads exporters
2. Only load visual.ts when visual format requested
3. Only load latex.ts when LaTeX format requested
4. Reduce initial load by ~4000 lines

---

## Sprint 9: Import Optimization & Lazy Loading 🔄 IN PROGRESS

**Status**: 20% Complete (Task 9.1 done)
**Goal**: Implement comprehensive lazy loading throughout codebase
**Priority**: HIGH

### Task 9.1: Implement Service Lazy Loading in index.ts ✅
**Status**: COMPLETE (v4.1.0)
**File**: `src/index.ts`

**Achieved**:
- Converted all services to lazy loading with async getters
- Dynamic imports for SessionManager, ThoughtFactory, ExportService, ModeRouter
- Services instantiated on first use instead of startup
- Benefits: Reduced startup time, lower initial memory footprint

### Task 9.2: Create Barrel Export Optimization
**Priority**: HIGH
**Files**: All `index.ts` barrel files

**Problem**: Barrel files re-export everything, causing eager loading.

**Solution**: Use explicit exports instead of `export * from`
```typescript
// BAD: export * from './visual.js';
// GOOD: export { VisualExporter } from './visual.js';
```

### Task 9.3: Implement Dynamic Mode Handler Loading
**Priority**: HIGH
**File**: `src/modes/index.ts` (to create)

**Instructions**:
1. Create mode handler registry
2. Load mode handlers dynamically based on requested mode
3. Cache loaded handlers
4. Only 1 mode file loaded instead of all 11

### Task 9.4: Add Tree-Shaking Optimization Hints
**Priority**: MEDIUM
**File**: `package.json`, `tsconfig.json`

**Instructions**:
1. Add `"sideEffects": false` to package.json
2. Ensure all exports are ES modules
3. Verify tsup config preserves tree-shaking

### Task 9.5: Implement Schema Loader with Caching
**Priority**: HIGH
**File**: `src/tools/schema-loader.ts` (to create)

**Instructions**:
1. Create schema loader with LRU cache
2. Lazy load schemas on first use
3. Evict least-used schemas under memory pressure
4. Track schema usage statistics

### Task 9.6: Reduce Import Depth
**Priority**: MEDIUM
**Files**: Various

**Problem**: Deep import chains cause more code to load.

**Current**:
```typescript
import { SessionManager } from '../session/index.js'; // loads all of session/
```

**Solution**:
```typescript
import { SessionManager } from '../session/manager.js'; // loads only manager
```

### Task 9.7: Create Lightweight Type-Only Imports
**Priority**: MEDIUM
**Files**: Various

Ensure type-only imports don't cause runtime loading:
```typescript
import type { ThinkingSession } from '../types/session.js';
```

---

## Sprint 10: Code Redundancy Elimination 🆕 NEW

**Status**: NOT STARTED
**Goal**: Remove duplicate code and consolidate patterns
**Priority**: MEDIUM

### Task 10.1: Remove Legacy thinking.ts After Deprecation Period
**Priority**: HIGH (after deprecation)
**File**: `src/tools/thinking.ts` (1136 lines)

**Timeline**:
- v4.0.0: Deprecation warning added ✅
- v5.0.0: Remove legacy tool entirely
- Saves: 1136 lines

### Task 10.2: Consolidate Visualization Patterns
**Priority**: MEDIUM
**Files**: `src/visualization/*.ts`, `src/export/visual.ts`

**Problem**: Similar Mermaid generation code in multiple files.

**Solution**: Create shared Mermaid builder utility

### Task 10.3: Unify Error Handling Patterns
**Priority**: LOW
**Files**: Various

Create centralized error factory instead of inline error creation.

### Task 10.4: Consolidate Type Guards
**Priority**: LOW
**Files**: `src/types/core.ts`, `src/utils/type-guards.ts`

Merge type guards into single location.

### Task 10.5: Remove Duplicate Utility Functions
**Priority**: LOW
**Files**: `src/utils/*.ts`

Identify and consolidate duplicate utilities:
- `sanitize.ts` vs `sanitization.ts`
- UUID generation in multiple places
- Date formatting utilities

### Task 10.6: Create Shared Validation Utilities
**Priority**: MEDIUM
**File**: `src/validation/shared.ts` (to create)

Consolidate common validation patterns:
- Confidence (0-1 range)
- UUID format
- Non-empty strings
- Array length limits

---

## Implementation Priority Matrix

| Sprint | Priority | Effort | Token Savings | Files Affected |
|--------|----------|--------|---------------|----------------|
| 5 (Complete) | CRITICAL | 2 weeks | 60% | 15 files |
| 6 (Testing) | HIGH | 1 week | - | 10 files |
| 7 (Verbosity) | HIGH | 1 week | 15% | 12 files |
| 8 (Large Files) | HIGH | 2 weeks | 10% | 8 files |
| 9 (Lazy Loading) | HIGH | 1.5 weeks | 20% | 20 files |
| 10 (Redundancy) | MEDIUM | 1 week | 5% | 15 files |

**Recommended Order**: 5.5, 5.7 → 7.1-7.8 → 8.1, 8.4 → 9.1-9.5 → 10.1

---

## Quick Wins (Can Be Done Immediately)

### 1. Remove Manual JSON Schema in thinking.ts
**Effort**: 30 minutes
**Savings**: ~430 lines, ~500 tokens

Replace lines 705-1135 with:
```typescript
inputSchema: zodToJsonSchema(ThinkingToolSchema, { target: 'openApi3' })
```

### 2. Remove Self-Explanatory Descriptions
**Effort**: 2 hours
**Savings**: ~200 tokens

Remove `.describe()` from id, name, type, value fields across schema files.

### 3. Create Shared Enum File
**Effort**: 1 hour
**Savings**: ~100 tokens, better maintainability

### 4. Add Tree-Shaking Config
**Effort**: 15 minutes
**Savings**: Smaller bundles for consumers

---

## Verification Checklist

After each sprint, verify:

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run test:run` passes all tests
- [ ] `npm run build` succeeds
- [ ] Token usage benchmark shows expected reduction
- [ ] No runtime errors in MCP client testing
- [ ] Documentation updated

---

## Related Documents

- [Sprint 5-6-7 Original Plan](./SPRINT_5_6_TOKEN_OPTIMIZATION.md)
- [Phase 4 Implementation Plan](./PHASE_4_IMPLEMENTATION_PLAN.md)
- [v4.0 Migration Guide](../migration/v4.0-tool-splitting.md)
- [Architecture Overview](../architecture/OVERVIEW.md)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-26 | 1.0.0 | Initial consolidated refactoring plan |
