# File Splitting Analysis Report

**Generated**: December 24, 2025
**Tools Used**: create-dependency-graph, chunking-for-files
**Criteria**: Files >500 lines analyzed for splitting opportunities

## Executive Summary

Found **25 files over 500 lines** (out of 250 total TypeScript files).
**Top 4 files** identified for refactoring are **visual exporters** with massive single functions:

| File | Lines | Critical Issue |
|------|-------|----------------|
| physics.ts | 1,781 | `physicsToDOT()` function: **1,562 lines** |
| engineering.ts | 1,691 | `escapeModelicaString()` function: **954 lines** |
| metareasoning.ts | 1,628 | `metaReasoningToDOT()` function: **1,418 lines** |
| proof-decomposition.ts | 1,624 | `proofDecompositionToDOT()` function: **1,332 lines** |

**Total Bloat**: 5,266 lines contained in just 4 functions across 4 files.

---

## Detailed Analysis

### 1. src/export/visual/modes/physics.ts (1,781 lines)

**Chunker Analysis**:
```
Found 17 section(s):
  15. function:exportPhysicsVisualization        30 lines
  16. function:physicsToMermaid                 115 lines
  17. function:physicsToDOT                   1,562 lines [LARGE] ⚠️
```

**Problem**: The `physicsToDOT()` function is **1,562 lines** - this is essentially an entire module crammed into a single function.

**Recommended Refactoring**:
```
src/export/visual/modes/physics/
├── index.ts              (Main export, 30 lines)
├── mermaid.ts            (Mermaid exporter, 115 lines)
├── dot/
│   ├── index.ts          (DOT orchestrator, ~100 lines)
│   ├── tensor-graph.ts   (Tensor visualization, ~300 lines)
│   ├── conservation.ts   (Conservation law graphs, ~300 lines)
│   ├── field-theory.ts   (Field theory diagrams, ~300 lines)
│   ├── equation-graph.ts (Equation relationships, ~300 lines)
│   └── styles.ts         (DOT styling utilities, ~200 lines)
└── types.ts              (Shared types, ~50 lines)
```

**Estimated Effort**: 4-6 hours
**Priority**: HIGH (largest function in codebase)

---

### 2. src/export/visual/modes/engineering.ts (1,691 lines)

**Chunker Analysis**:
```
Found 20 section(s):
  12. function:exportEngineeringAnalysis         33 lines
  13. function:engineeringToMermaid              83 lines
  14. function:engineeringToDOT                  83 lines
  15. function:engineeringToASCII                92 lines
  16. function:engineeringToSVG                  91 lines
  17. function:engineeringToGraphML             141 lines
  18. function:engineeringToTikZ                 89 lines
  19. function:sanitizeModelicaId                11 lines
  20. function:escapeModelicaString             954 lines [LARGE] ⚠️
```

**Problem**: The `escapeModelicaString()` function is **954 lines**. Name suggests it should be ~50 lines max.

**Recommended Refactoring**:
```
src/export/visual/modes/engineering/
├── index.ts                (Main export, 33 lines)
├── mermaid.ts              (Mermaid exporter, 83 lines)
├── dot.ts                  (DOT exporter, 83 lines)
├── ascii.ts                (ASCII exporter, 92 lines)
├── svg.ts                  (SVG exporter, 91 lines)
├── graphml.ts              (GraphML exporter, 141 lines)
├── tikz.ts                 (TikZ exporter, 89 lines)
├── modelica/
│   ├── index.ts            (Modelica orchestrator, ~100 lines)
│   ├── requirements.ts     (Requirements modeling, ~200 lines)
│   ├── trade-studies.ts    (Trade study models, ~200 lines)
│   ├── fmea.ts             (FMEA modeling, ~200 lines)
│   ├── systems.ts          (System architecture, ~200 lines)
│   └── utils.ts            (sanitizeModelicaId, etc., ~50 lines)
└── types.ts                (Shared types, ~50 lines)
```

**Estimated Effort**: 5-7 hours
**Priority**: HIGH (misleading function name masks complexity)

---

### 3. src/export/visual/modes/metareasoning.ts (1,628 lines)

**Chunker Analysis**:
```
Found 17 section(s):
  15. function:exportMetaReasoningVisualization   30 lines
  16. function:metaReasoningToMermaid           105 lines
  17. function:metaReasoningToDOT              1,418 lines [LARGE] ⚠️
```

**Problem**: The `metaReasoningToDOT()` function is **1,418 lines**.

**Recommended Refactoring**:
```
src/export/visual/modes/metareasoning/
├── index.ts                  (Main export, 30 lines)
├── mermaid.ts                (Mermaid exporter, 105 lines)
├── dot/
│   ├── index.ts              (DOT orchestrator, ~100 lines)
│   ├── reasoning-graph.ts    (Reasoning quality graphs, ~300 lines)
│   ├── meta-analysis.ts      (Meta-analysis visualization, ~300 lines)
│   ├── insight-graph.ts      (Insight relationships, ~300 lines)
│   ├── improvement-graph.ts  (Improvement suggestions, ~300 lines)
│   └── styles.ts             (DOT styling utilities, ~150 lines)
└── types.ts                  (Shared types, ~50 lines)
```

**Estimated Effort**: 4-6 hours
**Priority**: HIGH (second-largest function)

---

### 4. src/export/visual/modes/proof-decomposition.ts (1,624 lines)

**Chunker Analysis**:
```
Found 12 section(s):
   7. function:exportProofDecomposition          37 lines
   8. function:getMermaidShape                   18 lines
   9. function:getNodeColor                      23 lines
  10. function:proofDecompositionToMermaid      124 lines
  11. function:getDOTShape                       18 lines
  12. function:proofDecompositionToDOT         1,332 lines [LARGE] ⚠️
```

**Problem**: The `proofDecompositionToDOT()` function is **1,332 lines**.

**Recommended Refactoring**:
```
src/export/visual/modes/proof-decomposition/
├── index.ts              (Main export, 37 lines)
├── mermaid.ts            (Mermaid exporter, 142 lines)
├── dot/
│   ├── index.ts          (DOT orchestrator, ~100 lines)
│   ├── proof-tree.ts     (Proof tree structure, ~300 lines)
│   ├── strategy-graph.ts (Strategy visualization, ~300 lines)
│   ├── lemma-graph.ts    (Lemma relationships, ~300 lines)
│   ├── step-graph.ts     (Proof step dependencies, ~300 lines)
│   └── styles.ts         (DOT styling utilities, ~150 lines)
└── types.ts              (Shared types, ~50 lines)
```

**Estimated Effort**: 4-6 hours
**Priority**: HIGH (third-largest function)

---

### 5. src/tools/json-schemas.ts (1,479 lines)

**Chunker Analysis**:
```
Found 16 section(s):
   1. const:baseThoughtProperties                61 lines
   2. const:baseThoughtRequired                   1 lines
   3. const:deepthinking_core_schema             95 lines
   4. const:deepthinking_standard_schema         27 lines
   5. const:deepthinking_mathematics_schema     140 lines
   6. const:deepthinking_temporal_schema        131 lines
   7. const:deepthinking_probabilistic_schema    74 lines
   8. const:deepthinking_causal_schema           88 lines
   9. const:deepthinking_strategic_schema       118 lines
  10. const:deepthinking_analytical_schema       73 lines
  11. const:deepthinking_scientific_schema       99 lines
  12. const:deepthinking_engineering_schema      88 lines
  13. const:deepthinking_academic_schema        234 lines
  14. const:deepthinking_session_schema          80 lines
  15. const:deepthinking_analyze_schema          77 lines
  16. const:jsonSchemas                           2 lines
```

**Problem**: 13 tool schemas in one file. Already well-structured with separate constants, but could benefit from splitting for maintainability.

**Recommended Refactoring**:
```
src/tools/schemas/
├── index.ts                      (Main aggregator + jsonSchemas export)
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
**Priority**: MEDIUM (already well-structured, just needs physical splitting)

---

## Additional Files Over 500 Lines

### Medium Priority (500-900 lines)

| File | Lines | Assessment |
|------|-------|------------|
| hybrid.ts | 1,450 | Similar DOT function pattern - refactor with physics.ts |
| recommendations.ts | 1,370 | Type definitions file - consider splitting by category |
| ExportService.ts | 1,317 | Service orchestrator - already well-structured |
| reasoning-types.ts | 1,293 | Type definitions (69 reasoning types) - acceptable |
| formal-logic.ts | 1,290 | Visual exporter - same pattern as physics.ts |
| latex.ts | 1,284 | LaTeX utilities - consider splitting by domain |
| scientific-method.ts | 1,257 | Visual exporter - same pattern |
| optimization.ts | 1,234 | Visual exporter - same pattern |
| first-principles.ts | 1,224 | Visual exporter - same pattern |
| mathematics.ts | 1,211 | Visual exporter - same pattern |
| game-theory.ts | 1,028 | Visual exporter - same pattern |
| evidential.ts | 1,023 | Visual exporter - same pattern |
| systems-thinking.ts | 909 | Visual exporter - borderline acceptable |
| suggestion-engine.ts | 907 | Complex logic engine - already well-structured |
| index.ts (MCP server) | 885 | Entry point - acceptable size |
| analogical.ts | 875 | Visual exporter - borderline acceptable |
| ThoughtFactory.ts | 873 | Service orchestrator - already well-structured |
| causal.ts | 866 | Visual exporter - borderline acceptable |
| adaptive-selector.ts | 850 | Classification logic - acceptable |
| GameTheoryHandler.ts | 843 | Mode handler - acceptable |

---

## Pattern Analysis

### Visual Exporter Anti-Pattern

**15 files** follow the same problematic pattern:
1. Small entry function (~30 lines)
2. Reasonable Mermaid exporter (~100-150 lines)
3. **MASSIVE DOT exporter (900-1,500+ lines)** ⚠️

**Root Cause**: DOT format exporters generate complex graph syntax inline instead of using helper functions.

**Common Structure**:
```typescript
function modeXToDOT(thought: XThought, options: VisualOptions): string {
  // 1,000+ lines of:
  // - String concatenation for DOT syntax
  // - Inline node/edge generation
  // - Inline styling logic
  // - No helper functions
  // - No modularization
}
```

**Recommended Pattern**:
```typescript
// dot/index.ts
export function modeXToDOT(thought: XThought, options: VisualOptions): string {
  const graph = new DOTGraphBuilder();

  addNodes(graph, thought);
  addEdges(graph, thought);
  addClusters(graph, thought);
  applyStyles(graph, options);

  return graph.render();
}

// dot/nodes.ts
export function addNodes(graph: DOTGraphBuilder, thought: XThought): void {
  // 100-200 lines of focused node generation
}

// dot/edges.ts
export function addEdges(graph: DOTGraphBuilder, thought: XThought): void {
  // 100-200 lines of focused edge generation
}

// etc.
```

---

## Recommended Action Plan

### Phase 1: Critical Fixes (Immediate - 2 days)

**Goal**: Fix the 4 largest offenders identified in code review

1. ✅ ~~API boundary type safety~~ (COMPLETED)
2. ✅ ~~File-lock error logging~~ (COMPLETED)
3. **Refactor physics.ts** - Split `physicsToDOT()` (1,562 lines)
4. **Refactor engineering.ts** - Split `escapeModelicaString()` (954 lines)

**Estimated Time**: 8-12 hours
**Impact**: Removes 2,516 lines from single functions

### Phase 2: High Priority (1 week)

5. **Refactor metareasoning.ts** - Split `metaReasoningToDOT()` (1,418 lines)
6. **Refactor proof-decomposition.ts** - Split `proofDecompositionToDOT()` (1,332 lines)
7. **Refactor json-schemas.ts** - Split into 15 focused schema files

**Estimated Time**: 12-16 hours
**Impact**: Removes 2,750 more lines from single functions/files

### Phase 3: Medium Priority (2 weeks)

8. **Refactor remaining visual exporters** - Apply same pattern to 11 more files
9. **Enhance `src/export/visual/utils/dot.ts`** - Add DOTGraphBuilder class to existing 594-line utility module
10. **Extract LaTeX utilities** - Split latex.ts by domain

**Estimated Time**: 16-24 hours
**Impact**: Consistent architecture across all exporters

---

## Metrics & Goals

### Current State
- **Files >1,000 lines**: 16 files
- **Files >500 lines**: 25 files
- **Largest function**: 1,562 lines (physicsToDOT)
- **Total bloat (4 functions)**: 5,266 lines

### Target State (After Phase 1-2)
- **Files >1,000 lines**: 5 files (mostly type definitions - acceptable)
- **Files >500 lines**: 20 files
- **Largest function**: <300 lines
- **Bloat removed**: 5,266 lines refactored into ~26 focused modules

### Success Criteria
- ✅ No single function exceeds 300 lines
- ✅ All visual exporters follow modular pattern
- ✅ DOT generation uses shared utility classes
- ✅ Type checking remains at 100% pass
- ✅ All 4,300 tests continue passing
- ✅ Build time doesn't increase

---

## Technical Notes

### Why DOT Exporters Are So Large

1. **DOT Format Verbosity**: GraphViz DOT syntax requires extensive string formatting
2. **No Abstraction Layer**: Each exporter builds DOT from scratch instead of using existing `src/export/visual/utils/dot.ts`
3. **Inline Everything**: Node properties, edge styles, clusters all inline
4. **Domain Complexity**: Physics/Engineering diagrams have many specialized elements
5. **Existing Helpers Unused**: The 594-line `src/export/visual/utils/dot.ts` already has `renderDotNode()`, `renderDotEdge()`, `generateDotGraph()` but mode exporters don't use them

### Proposed Enhancement to Existing DOT Utility

**Add to `src/export/visual/utils/dot.ts`** (already has comprehensive helpers):

```typescript
// Add builder pattern to existing 594-line dot.ts utility
export class DOTGraphBuilder {
  private nodes: DotNode[] = [];        // Already defined interface
  private edges: DotEdge[] = [];        // Already defined interface
  private subgraphs: DotSubgraph[] = []; // Already defined interface
  private options: DotOptions = {};      // Already defined interface
  
  addNode(node: DotNode): this { this.nodes.push(node); return this; }
  addEdge(edge: DotEdge): this { this.edges.push(edge); return this; }
  addSubgraph(sub: DotSubgraph): this { this.subgraphs.push(sub); return this; }
  setOptions(opts: DotOptions): this { this.options = opts; return this; }
  
  render(): string {
    // Uses existing generateDotGraph() function
    return generateDotGraph(this.nodes, this.edges, this.options);
  }
}

// Usage in physics.ts:
const builder = new DOTGraphBuilder()
  .setOptions({ rankDir: 'TB', fontName: 'Arial' })
  .addNode({ id: 'tensor', label: 'Tensor', shape: 'box' }) // Already typed
  .addEdge({ source: 'tensor', target: 'field' });           // Already typed

return builder.render(); // Uses existing generateDotGraph()
```

**Benefits**:
- Leverages existing 594-line utility with all types, helpers, and color schemes defined
- Reduces DOT code by 60-70% through builder pattern
- Ensures consistent formatting using existing `renderDotNode()`, `renderDotEdge()` functions
- Enables unit testing of graph structure
- Zero new dependencies - extends what already exists

---

## Conclusion

The chunking tool successfully identified the core architectural issue: **massive monolithic DOT export functions** averaging 1,200+ lines each.

**Key Finding**: The top 4 files contain **5,266 lines in just 4 functions** - this is the primary technical debt.

**Recommendation**: Proceed with Phase 1-2 refactoring (physics.ts, engineering.ts, metareasoning.ts, proof-decomposition.ts) as highest priority after completing current critical fixes.

**Time Investment**: ~25-30 hours total for complete cleanup
**Payoff**: Significant improvement in maintainability, testability, and code clarity

---

*Generated by file splitting analysis - December 24, 2025*
