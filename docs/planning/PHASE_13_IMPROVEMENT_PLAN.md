# Phase 13: Visual Exporter Refactoring

## Problem Statement

**22 out of 23 mode exporter files exceed 500 lines.** The target is <500 lines per file.

| Category | Files | Lines Range |
|----------|-------|-------------|
| Critical (>1000 lines) | 12 | 1,023 - 1,781 |
| High (500-1000 lines) | 10 | 558 - 909 |
| OK (<500 lines) | 1 | 42 (index.ts only) |
| **Total** | 24,046 lines across 22 mode files |

---

## Root Cause

**21 out of 22 mode files don't use the existing utility modules** for DOT, Mermaid, and ASCII generation.

### Utility Adoption Status

| Utility | Adoption | Status |
|---------|----------|--------|
| `utils/dot.ts` (593 lines) | 1/22 (sequential.ts only) | **GAP** |
| `utils/mermaid.ts` (540 lines) | 1/22 (sequential.ts only) | **GAP** |
| `utils/ascii.ts` (721 lines) | 1/22 (sequential.ts only) | **GAP** |
| `utils/svg.ts` | 21/22 | Good |
| `utils/graphml.ts` | 21/22 | Good |
| `utils/tikz.ts` | 22/22 | Good |
| `utils/json.ts` | 22/22 | Good |

---

## Evidence: Utility Adoption Reduces File Size by 55%

| File | Uses Utilities | Lines | Functions |
|------|---------------|-------|-----------|
| sequential.ts | ✅ Yes | 805 | 11 |
| physics.ts | ❌ No | 1,781 | 11 |
| **Difference** | | **-976 (55%)** | Same |

Both files have 11 export functions. The only difference is utility usage.

---

## File Size Breakdown

### Critical Priority (>1000 lines) - 12 files

| File | Lines | Potential After Utilities |
|------|-------|---------------------------|
| physics.ts | 1,781 | ~800 |
| engineering.ts | 1,691 | ~760 |
| metareasoning.ts | 1,628 | ~730 |
| proof-decomposition.ts | 1,624 | ~730 |
| hybrid.ts | 1,450 | ~650 |
| formal-logic.ts | 1,290 | ~580 |
| scientific-method.ts | 1,257 | ~565 |
| optimization.ts | 1,234 | ~555 |
| first-principles.ts | 1,224 | ~550 |
| mathematics.ts | 1,211 | ~545 |
| game-theory.ts | 1,028 | ~460 |
| evidential.ts | 1,023 | ~460 |

### High Priority (500-1000 lines) - 10 files

| File | Lines | Potential After Utilities |
|------|-------|---------------------------|
| systems-thinking.ts | 909 | ~410 |
| analogical.ts | 875 | ~395 |
| causal.ts | 866 | ~390 |
| computability.ts | 823 | ~370 |
| counterfactual.ts | 807 | ~365 |
| sequential.ts | 805 | Already uses utilities |
| abductive.ts | 666 | ~300 |
| bayesian.ts | 631 | ~285 |
| temporal.ts | 623 | ~280 |
| shannon.ts | 558 | ~250 |

---

## Refactoring Strategy

### Phase 1: Utility Adoption (Primary)

Convert all mode files to use existing utilities:

```typescript
// BEFORE (physics.ts - inline)
function physicsToDOT(thought: PhysicsThought): string {
  let dot = 'digraph G {\n';
  dot += '  rankdir=TB;\n';
  dot += `  ${id} [label="${label}"];\n`;
  // ... 80+ more lines of string building
  return dot;
}

// AFTER (using utils/dot.ts)
function physicsToDOT(thought: PhysicsThought): string {
  const nodes: DotNode[] = [];
  const edges: DotEdge[] = [];

  nodes.push({ id, label, shape: 'box' });
  // ... domain logic only

  return generateDotGraph(nodes, edges, { rankDir: 'TB' });
}
```

**Expected reduction**: 40-55% per file

### Phase 2: File Splitting (If Still >500)

For files still exceeding 500 lines after utility adoption, split by format category:

```
src/export/visual/modes/physics/
├── index.ts              # Main export (re-exports all)
├── visual.ts             # DOT, Mermaid, ASCII, SVG (~200 lines)
├── structured.ts         # GraphML, TikZ, UML (~150 lines)
└── document.ts           # JSON, Markdown, HTML, Modelica (~200 lines)
```

---

## Implementation Plan

### Sprint 1: Infrastructure (4-6 hours)

1. Add `DOTGraphBuilder` class to `utils/dot.ts`
2. Add `MermaidGraphBuilder` class to `utils/mermaid.ts`
3. Add missing ASCII helpers to `utils/ascii.ts`
4. Write tests for new builder classes

### Sprint 2: Critical Files (16-20 hours)

Refactor 12 files >1000 lines to use utilities:
- physics.ts, engineering.ts, metareasoning.ts, proof-decomposition.ts
- hybrid.ts, formal-logic.ts, scientific-method.ts, optimization.ts
- first-principles.ts, mathematics.ts, game-theory.ts, evidential.ts

### Sprint 3: High Priority Files (12-16 hours)

Refactor 9 remaining files 500-1000 lines:
- systems-thinking.ts, analogical.ts, causal.ts, computability.ts
- counterfactual.ts, abductive.ts, bayesian.ts, temporal.ts, shannon.ts

### Sprint 4: File Splitting (8-12 hours)

Split any files still >500 lines after utility adoption.

**Total Estimated Effort**: 40-54 hours

---

## Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Files >1000 lines | 12 | 0 |
| Files >500 lines | 22 | 0 |
| Total mode file lines | 24,046 | <11,000 |
| DOT utility adoption | 1/22 | 22/22 |
| Mermaid utility adoption | 1/22 | 22/22 |
| ASCII utility adoption | 1/22 | 22/22 |

---

## Reference Implementation

**sequential.ts** demonstrates the target pattern:

```typescript
// Imports all utilities
import { generateMermaidFlowchart, ... } from '../utils/mermaid.js';
import { generateDotGraph, ... } from '../utils/dot.js';
import { generateAsciiHeader, ... } from '../utils/ascii.js';
import { generateSVGHeader, ... } from '../utils/svg.js';
// ... etc

// Uses typed interfaces
function sequentialToDOT(thought: SequentialThought): string {
  const nodes: DotNode[] = [];
  const edges: DotEdge[] = [];

  // Build graph with typed objects
  nodes.push({ id: nodeId, label, shape: 'box', style: ['rounded'] });
  edges.push({ source: depNodeId, target: nodeId });

  // Delegate rendering to utility
  return generateDotGraph(nodes, edges, { rankDir: 'TB' });
}
```

---

## Note on Chunker Tool Bug

During analysis, a bug was discovered in `tools/chunking-for-files/`:
- The TypeScript parser fails on `{{` and `}}` (Mermaid hexagon syntax)
- This caused incorrect function size reporting in original analysis docs
- **The file size problem is real** - the function size claims were not

---

## Dependencies

- Existing utilities: `utils/dot.ts`, `utils/mermaid.ts`, `utils/ascii.ts`
- Reference: `sequential.ts` (Phase 11 refactor)
- No new external packages required

---

*Generated: December 25, 2025*
*Verified: File sizes via `wc -l`, utility imports via `grep`*
