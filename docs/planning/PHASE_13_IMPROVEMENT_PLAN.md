# Phase 13: Visual Exporter Refactoring Plan

## Overview

This phase addresses the critical architectural debt identified in the comprehensive codebase review: **21 out of 22 visual exporter files ignore existing utility modules**, resulting in ~15,000 lines of duplicated code.

**Status**: Planned
**Priority**: High
**Estimated Effort**: 42-55 hours across 4 sprints
**Key Finding**: Only `sequential.ts` (refactored in Phase 11) uses the modular utility pattern

---

## Executive Summary

### The Problem

| Metric | Current State | Target State |
|--------|---------------|--------------|
| DOT utility adoption | 1/22 (4.5%) | 22/22 (100%) |
| Mermaid utility adoption | 1/22 (4.5%) | 22/22 (100%) |
| ASCII utility adoption | 1/22 (4.5%) | 22/22 (100%) |
| Largest function | 1,562 lines | <300 lines |
| Total exporter lines | ~28,000 | ~16,000-18,000 |
| Duplicated code | ~15,000 lines | ~0 lines |

### Root Cause Analysis

The analysis revealed a **utility adoption gap**:

| Utility Module | Adoption Rate | Status |
|----------------|---------------|--------|
| **json.ts** | 22/22 (100%) | Universal |
| **svg.ts, graphml.ts, tikz.ts, html.ts** | 21/22 (95%) | Excellent (Phase 9 additions) |
| **dot.ts, mermaid.ts, ascii.ts** | 1/22 (4.5%) | **Critical Gap** |

Phase 9 utilities (SVG, GraphML, TikZ) show 95%+ adoption, proving the modular utility pattern **works when consistently applied**. The DOT/Mermaid/ASCII utilities existed earlier but were never adopted beyond `sequential.ts`.

---

## Verified Findings (December 24, 2025)

### Critical Issues Addressed

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| API boundary type safety | CRITICAL | FIXED | Eliminated `as any` cast (commit b43a4c5) |
| File-lock error swallowing | MEDIUM | FIXED | Added conditional logging (commit b43a4c5) |
| Large monolithic files | HIGH | **THIS PHASE** | 4 monster functions, 5,266 lines total |
| Utility non-adoption | HIGH | **THIS PHASE** | 21 files ignore existing utilities |
| Magic number coefficients | MEDIUM | DEFERRED | ~30 hardcoded tuning values |

### Architecture Rating: 8.3/10

The codebase demonstrates exceptional architectural discipline:
- **Zero runtime circular dependencies** (verified by dependency graph tool)
- **Strong type system**: 506 interfaces, 85 type guards
- **Clear module boundaries**: 16 focused modules
- **Excellent test coverage**: 3,539 tests passing

---

## Monster Functions Identified

The chunker tool identified **4 functions containing 5,266 lines total**:

| File | Function | Lines | Issue |
|------|----------|-------|-------|
| `physics.ts` | `physicsToDOT()` | 1,562 | DOT generation in single function |
| `metareasoning.ts` | `metaReasoningToDOT()` | 1,418 | Massive inline DOT string building |
| `proof-decomposition.ts` | `proofDecompositionToDOT()` | 1,332 | No helper functions or modularization |
| `engineering.ts` | `escapeModelicaString()` | 954 | Misleading name, actually full Modelica exporter |

### Why These Functions Are So Large

1. **No Abstraction Layer**: Each exporter builds DOT from scratch instead of using `src/export/visual/utils/dot.ts` (594 lines of comprehensive helpers)
2. **Inline Everything**: Node properties, edge styles, clusters all inline
3. **Domain Complexity**: Physics/Engineering diagrams have many specialized elements
4. **Existing Helpers Unused**: The 594-line `dot.ts` already has `renderDotNode()`, `renderDotEdge()`, `generateDotGraph()` but they're not used

---

## Sequential.ts: The Reference Implementation

`sequential.ts` is the **ONLY file** following the correct modular pattern:

```typescript
// sequential.ts imports (Phase 11 refactor)
import { generateMermaidFlowchart, truncateLabel, getMermaidColor } from '../utils/mermaid.js';
import { generateDotGraph, truncateDotLabel, type DotNode, type DotEdge } from '../utils/dot.js';
import { generateAsciiHeader, generateAsciiSectionHeader, generateAsciiBulletList } from '../utils/ascii.js';
import { generateSVGHeader, renderRectNode, renderEdge } from '../utils/svg.js';
// ... imports from GraphML, TikZ, HTML, Modelica, UML utilities
```

**Result**: `sequential.ts` has no massive functions - all format generation delegated to utilities.

---

## Proposed Solution

### Add DOTGraphBuilder to Existing Utility

Enhance `src/export/visual/utils/dot.ts` (already 594 lines) with a builder pattern:

```typescript
// Add to src/export/visual/utils/dot.ts
export class DOTGraphBuilder {
  private nodes: DotNode[] = [];       // Already defined interface
  private edges: DotEdge[] = [];       // Already defined interface
  private subgraphs: DotSubgraph[] = []; // Already defined interface
  private options: DotOptions = {};    // Already defined interface

  addNode(node: DotNode): this { this.nodes.push(node); return this; }
  addEdge(edge: DotEdge): this { this.edges.push(edge); return this; }
  addSubgraph(sub: DotSubgraph): this { this.subgraphs.push(sub); return this; }
  setOptions(opts: DotOptions): this { this.options = opts; return this; }

  render(): string {
    // Uses existing generateDotGraph() function
    return generateDotGraph(this.nodes, this.edges, this.options);
  }
}
```

### Usage Pattern

**Before** (anti-pattern in 21 files):
```typescript
function physicsToDOT(thought: PhysicsThought): string {
  let dot = 'digraph PhysicsVisualization {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  // 1,562 lines of manual string building
  const typeId = sanitizeId(`type_${thought.thoughtType}`);
  dot += `  ${typeId} [label="${typeLabel}", shape=doubleoctagon];\n`;
  // ... hundreds more lines ...
}
```

**After** (using existing utilities):
```typescript
function physicsToDOT(thought: PhysicsThought): string {
  const builder = new DOTGraphBuilder()
    .setOptions({ rankDir: 'TB' });

  addPhysicsNodes(builder, thought);    // ~100-150 lines
  addPhysicsEdges(builder, thought);    // ~100-150 lines
  addPhysicsClusters(builder, thought); // ~100-150 lines

  return builder.render(); // Uses existing generateDotGraph()
}
```

---

## Import Matrix

Analysis of all 22 mode files showing current utility usage:

| Mode File | mermaid | dot | ascii | svg | graphml | tikz | html | modelica | uml | json |
|-----------|---------|-----|-------|-----|---------|------|------|----------|-----|------|
| **sequential.ts** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| physics.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| engineering.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| metareasoning.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| proof-decomposition.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| hybrid.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| mathematics.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| formal-logic.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| optimization.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| first-principles.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| scientific-method.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| systems-thinking.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| game-theory.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| evidential.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| temporal.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| causal.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| counterfactual.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| analogical.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| abductive.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| bayesian.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| computability.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| shannon.ts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Implementation Sprints

### Sprint 1: Infrastructure (8-10 hours)

**Objective**: Add DOTGraphBuilder to existing utilities

**Tasks**:
1. Add `DOTGraphBuilder` class to `src/export/visual/utils/dot.ts`
2. Add `MermaidGraphBuilder` class to `src/export/visual/utils/mermaid.ts`
3. Add additional ASCII helpers to `src/export/visual/utils/ascii.ts`
4. Write comprehensive tests for new builder classes
5. Update utility module documentation

**Deliverables**:
- Enhanced `utils/dot.ts` with DOTGraphBuilder
- Enhanced `utils/mermaid.ts` with MermaidGraphBuilder
- Tests in `tests/unit/export/visual/utils/`

### Sprint 2: Critical Refactors (12-16 hours)

**Objective**: Refactor the 4 monster functions

**Tasks**:
1. Refactor `physics.ts` - Split `physicsToDOT()` (1,562 lines)
   - Extract `addPhysicsNodes()`, `addPhysicsEdges()`, `addPhysicsClusters()`
   - Use DOTGraphBuilder
   - Target: <300 lines per function

2. Refactor `metareasoning.ts` - Split `metaReasoningToDOT()` (1,418 lines)
   - Extract reasoning graph, insight graph, improvement sections
   - Use DOTGraphBuilder
   - Target: <300 lines per function

3. Refactor `proof-decomposition.ts` - Split `proofDecompositionToDOT()` (1,332 lines)
   - Extract proof tree, strategy, dependency sections
   - Use DOTGraphBuilder
   - Target: <300 lines per function

4. Refactor `engineering.ts` - Fix `escapeModelicaString()` (954 lines)
   - Rename to `engineeringToModelica()`
   - Extract requirements, trade studies, FMEA sections
   - Use existing `utils/modelica.ts` for string escaping

**Deliverables**:
- Refactored 4 files with no function >300 lines
- All visual tests passing
- ~5,266 lines refactored into modular helpers

### Sprint 3: Remaining DOT Exporters (16-20 hours)

**Objective**: Refactor remaining 17 DOT exporters

**Target Files**:
- hybrid.ts (1,450 lines total)
- formal-logic.ts (1,290 lines total)
- optimization.ts (1,234 lines total)
- first-principles.ts (1,224 lines total)
- mathematics.ts (1,211 lines total)
- scientific-method.ts (1,257 lines total)
- game-theory.ts (1,028 lines total)
- evidential.ts (1,023 lines total)
- systems-thinking.ts (909 lines)
- analogical.ts (875 lines)
- causal.ts (866 lines)
- temporal.ts, counterfactual.ts, abductive.ts, bayesian.ts, computability.ts, shannon.ts

**Pattern for Each File**:
1. Replace inline DOT generation with DOTGraphBuilder
2. Extract domain-specific graph construction into focused helpers
3. Ensure no function exceeds 300 lines

**Deliverables**:
- 17 files refactored to use DOTGraphBuilder
- All visual tests passing
- ~10,000 lines of inline DOT code eliminated

### Sprint 4: Mermaid/ASCII Adoption (8-12 hours)

**Objective**: Adopt Mermaid and ASCII utilities across all 21 files

**Tasks**:
1. Replace inline Mermaid generation with `generateMermaidFlowchart()` and helpers
2. Replace inline ASCII generation with utility functions
3. Update all 21 files to import from `utils/mermaid.ts` and `utils/ascii.ts`
4. Final integration testing

**Deliverables**:
- 21 files importing and using Mermaid utilities
- 21 files importing and using ASCII utilities
- Import matrix shows 100% adoption for all utilities

---

## JSON Schemas Refactoring (Optional Sprint 5)

**File**: `src/tools/json-schemas.ts` (1,479 lines)

The chunker identified 16 well-structured sections that could be split:

```
src/tools/schemas/
├── index.ts                      (Aggregator + jsonSchemas export)
├── base.ts                       (baseThoughtProperties, baseThoughtRequired)
├── core.ts                       (deepthinking_core_schema)
├── standard.ts                   (deepthinking_standard_schema)
├── mathematics.ts                (deepthinking_mathematics_schema)
├── temporal.ts                   (deepthinking_temporal_schema)
├── probabilistic.ts              (deepthinking_probabilistic_schema)
├── causal.ts                     (deepthinking_causal_schema)
├── strategic.ts                  (deepthinking_strategic_schema)
├── analytical.ts                 (deepthinking_analytical_schema)
├── scientific.ts                 (deepthinking_scientific_schema)
├── engineering.ts                (deepthinking_engineering_schema)
├── academic.ts                   (deepthinking_academic_schema)
├── session.ts                    (deepthinking_session_schema)
└── analyze.ts                    (deepthinking_analyze_schema)
```

**Estimated Effort**: 2-3 hours
**Priority**: Low (already well-structured, just needs physical splitting)

---

## Success Criteria

| Metric | Baseline | Target | Verification |
|--------|----------|--------|--------------|
| DOT utility adoption | 1/22 | 22/22 | Import analysis |
| Mermaid utility adoption | 1/22 | 22/22 | Import analysis |
| ASCII utility adoption | 1/22 | 22/22 | Import analysis |
| Largest function | 1,562 lines | <300 lines | Chunker analysis |
| Total exporter lines | ~28,000 | ~16,000-18,000 | LOC count |
| TypeScript compile | Pass | Pass | `npm run typecheck` |
| All tests | 3,539 passing | 3,539+ passing | `npm run test:run` |
| Export output | N/A | Identical | Visual comparison tests |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking visual output | HIGH | Comprehensive visual comparison tests before/after |
| Regression in specific modes | MEDIUM | Per-mode integration tests |
| Builder pattern overhead | LOW | Benchmark performance (expected: negligible) |
| Scope creep | MEDIUM | Strictly limit to utility adoption, no new features |

---

## Dependencies

- No new external dependencies
- Builds on existing `src/export/visual/utils/` infrastructure
- Uses patterns proven in `sequential.ts` Phase 11 refactor

---

## Timeline Summary

| Sprint | Focus | Hours | Files |
|--------|-------|-------|-------|
| Sprint 1 | Infrastructure (builders) | 8-10 | 3 utility files |
| Sprint 2 | Critical refactors | 12-16 | 4 monster files |
| Sprint 3 | Remaining DOT | 16-20 | 17 exporter files |
| Sprint 4 | Mermaid/ASCII | 8-12 | 21 exporter files |
| Sprint 5 | JSON schemas (optional) | 2-3 | 1 file → 15 files |
| **Total** | **Complete refactoring** | **42-55** | **22 exporters** |

---

## Business Value

1. **Eliminate 40-50% of visual exporter code** (~10,000-12,000 lines)
2. **Improve maintainability** - Single source of truth for DOT/Mermaid/ASCII
3. **Enable centralized improvements** - Bug fixes apply to all modes
4. **Reduce onboarding complexity** - New contributors follow clear pattern
5. **Improve testability** - Builder pattern enables unit testing of graph construction

---

## References

- `docs/analysis/Comprehensive_Codebase_Review.md` - Full codebase review
- `docs/analysis/file-splitting-analysis.md` - Detailed file analysis
- `docs/analysis/export-utility-usage-analysis.md` - Utility adoption analysis
- `src/export/visual/modes/sequential.ts` - Reference implementation

---

*Generated: December 25, 2025*
*Based on: Comprehensive codebase review and chunker analysis*
*Tools used: create-dependency-graph, chunking-for-files, grep analysis*
