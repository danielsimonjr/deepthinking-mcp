# Phase 13: Visual Exporter Refactoring Plan

## Overview

This document outlines the refactoring of the visual exporter module to reduce file sizes below 1000 lines and adopt existing utility modules. The refactoring addresses architectural debt where 21 out of 22 mode exporters ignore the comprehensive DOT, Mermaid, and ASCII utility modules.

**Status**: Planned
**Priority**: Medium
**Estimated Effort**: ~28-42 hours across 3 sprints

---

## Feature Summary

| Feature | Priority | Complexity | Estimated Hours |
|---------|----------|------------|-----------------|
| R-1: DOT Utility Adoption | High | Medium | 12-16 |
| R-2: Mermaid Utility Adoption | Medium | Low | 6-8 |
| R-3: ASCII Utility Adoption | Low | Low | 4-6 |
| R-4: File Splitting (if needed) | Medium | Medium | 6-12 |

---

## Current State Analysis

### File Size Distribution

| Category | Files | Lines Range | Target |
|----------|-------|-------------|--------|
| Critical (>1000 lines) | 12 | 1,023 - 1,781 | <1000 |
| OK (<1000 lines) | 11 | 42 - 909 | ✅ |

**12 out of 23 mode files exceed the 1000 line target.**

### Top 12 Largest Files

| File | Lines | Functions | Primary Issue |
|------|-------|-----------|---------------|
| physics.ts | 1,781 | 11 | Inline DOT/Mermaid/ASCII |
| engineering.ts | 1,691 | 13 | Inline DOT/Mermaid/ASCII |
| metareasoning.ts | 1,628 | 11 | Inline DOT/Mermaid/ASCII |
| proof-decomposition.ts | 1,624 | 18 | Inline DOT/Mermaid/ASCII |
| hybrid.ts | 1,450 | 11 | Inline DOT/Mermaid/ASCII |
| formal-logic.ts | 1,290 | 11 | Inline DOT/Mermaid/ASCII |
| scientific-method.ts | 1,257 | 11 | Inline DOT/Mermaid/ASCII |
| optimization.ts | 1,234 | 11 | Inline DOT/Mermaid/ASCII |
| first-principles.ts | 1,224 | 11 | Inline DOT/Mermaid/ASCII |
| mathematics.ts | 1,211 | 11 | Inline DOT/Mermaid/ASCII |
| game-theory.ts | 1,028 | 11 | Inline DOT/Mermaid/ASCII |
| evidential.ts | 1,023 | 11 | Inline DOT/Mermaid/ASCII |

### Utility Adoption Status

| Utility Module | Lines | Adoption Rate | Status |
|----------------|-------|---------------|--------|
| `utils/dot.ts` | 593 | 1/22 (4.5%) | **Critical Gap** |
| `utils/mermaid.ts` | 540 | 1/22 (4.5%) | **Critical Gap** |
| `utils/ascii.ts` | 721 | 1/22 (4.5%) | **Critical Gap** |
| `utils/svg.ts` | 548 | 21/22 (95%) | ✅ Excellent |
| `utils/graphml.ts` | 269 | 21/22 (95%) | ✅ Excellent |
| `utils/tikz.ts` | 446 | 22/22 (100%) | ✅ Excellent |
| `utils/json.ts` | 521 | 22/22 (100%) | ✅ Excellent |
| `utils/html.ts` | 365 | 21/22 (95%) | ✅ Excellent |

**Key Finding**: Phase 9 utilities (SVG, GraphML, TikZ) show 95%+ adoption, proving the modular utility pattern works. The DOT/Mermaid/ASCII utilities existed earlier but were never adopted beyond `sequential.ts`.

---

## Evidence: Utility Adoption Reduces File Size

| File | Uses All Utilities | Lines | Functions |
|------|-------------------|-------|-----------|
| sequential.ts | ✅ Yes | 805 | 11 |
| physics.ts | ❌ No | 1,781 | 11 |
| **Difference** | | **-976 (55%)** | Same |

Both files have 11 export functions. The only difference is utility usage. This demonstrates **55% size reduction** is achievable.

---

## R-1: DOT Utility Adoption

### Current State

The `utils/dot.ts` module (593 lines) provides comprehensive DOT generation infrastructure:

```typescript
// Existing types in utils/dot.ts
export interface DotNode {
  id: string;
  label: string;
  shape?: DotNodeShape;
  style?: DotNodeStyle | DotNodeStyle[];
  fillColor?: string;
  fontColor?: string;
  // ... more properties
}

export interface DotEdge {
  source: string;
  target: string;
  label?: string;
  style?: DotEdgeStyle;
  arrowHead?: DotArrowHead;
  // ... more properties
}

// Existing helper functions
export function generateDotGraph(nodes: DotNode[], edges: DotEdge[], options?: DotOptions): string;
export function renderDotNode(node: DotNode): string;
export function renderDotEdge(edge: DotEdge, directed?: boolean): string;
export function sanitizeDotId(id: string): string;
export function escapeDotString(str: string): string;
export function getDotColor(colorName: string, scheme?: string): string;
```

**Problem**: 21 files build DOT strings inline instead of using these helpers.

### Proposed Enhancement

Add a `DOTGraphBuilder` class to the existing `utils/dot.ts`:

```typescript
// Add to src/export/visual/utils/dot.ts
export class DOTGraphBuilder {
  private nodes: DotNode[] = [];
  private edges: DotEdge[] = [];
  private subgraphs: DotSubgraph[] = [];
  private options: DotOptions = {};

  addNode(node: DotNode): this {
    this.nodes.push(node);
    return this;
  }

  addEdge(edge: DotEdge): this {
    this.edges.push(edge);
    return this;
  }

  addSubgraph(subgraph: DotSubgraph): this {
    this.subgraphs.push(subgraph);
    return this;
  }

  setOptions(options: DotOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

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

  const typeId = sanitizeId(`type_${thought.thoughtType}`);
  dot += `  ${typeId} [label="${typeLabel}", shape=doubleoctagon];\n`;
  // ... 80+ more lines of string concatenation

  dot += '}\n';
  return dot;
}
```

**After** (using utilities):

```typescript
function physicsToDOT(thought: PhysicsThought): string {
  const builder = new DOTGraphBuilder()
    .setOptions({ rankDir: 'TB' });

  // Domain-specific node creation
  builder.addNode({
    id: `type_${thought.thoughtType}`,
    label: thought.thoughtType || 'Physics',
    shape: 'doubleoctagon',
  });

  if (thought.tensorProperties) {
    addTensorNodes(builder, thought.tensorProperties);
  }

  if (thought.fieldTheoryContext) {
    addFieldTheoryNodes(builder, thought.fieldTheoryContext);
  }

  return builder.render();
}

function addTensorNodes(builder: DOTGraphBuilder, tensor: TensorProperties): void {
  builder
    .addNode({ id: 'tensor', label: `Rank (${tensor.rank})`, shape: 'ellipse' })
    .addEdge({ source: 'type_physics', target: 'tensor' });
}
```

### Files to Refactor

| Priority | File | Current Lines | Target Lines |
|----------|------|---------------|--------------|
| 1 | physics.ts | 1,781 | <1000 |
| 2 | engineering.ts | 1,691 | <1000 |
| 3 | metareasoning.ts | 1,628 | <1000 |
| 4 | proof-decomposition.ts | 1,624 | <1000 |
| 5 | hybrid.ts | 1,450 | <1000 |
| 6-12 | 7 more files | 1,023-1,290 | <1000 |

---

## R-2: Mermaid Utility Adoption

### Current State

The `utils/mermaid.ts` module (540 lines) provides:

```typescript
// Existing types
export interface MermaidNode {
  id: string;
  label: string;
  shape?: MermaidNodeShape;
  style?: { fill?: string; stroke?: string; };
}

export interface MermaidEdge {
  source: string;
  target: string;
  style?: MermaidEdgeStyle;
  label?: string;
}

// Existing functions
export function generateMermaidFlowchart(nodes: MermaidNode[], edges: MermaidEdge[], options?: MermaidOptions): string;
export function truncateLabel(label: string, maxLength?: number): string;
export function getMermaidColor(colorName: string): string;
export function sanitizeMermaidId(id: string): string;
```

### Proposed Pattern

Follow `sequential.ts` pattern:

```typescript
function physicsToMermaid(thought: PhysicsThought): string {
  const nodes: MermaidNode[] = [];
  const edges: MermaidEdge[] = [];

  nodes.push({
    id: 'physics_main',
    label: truncateLabel(thought.thoughtType || 'Physics'),
    shape: 'stadium',
  });

  // Domain-specific node creation...

  return generateMermaidFlowchart(nodes, edges, { direction: 'TD' });
}
```

---

## R-3: ASCII Utility Adoption

### Current State

The `utils/ascii.ts` module (721 lines) provides:

```typescript
export function generateAsciiHeader(title: string, style?: 'equals' | 'dashes' | 'stars'): string;
export function generateAsciiSectionHeader(title: string): string;
export function generateAsciiBulletList(items: string[]): string;
export function generateAsciiBox(content: string, width?: number): string;
export function generateAsciiTree(root: TreeNode): string;
```

### Proposed Pattern

```typescript
function physicsToASCII(thought: PhysicsThought): string {
  const lines: string[] = [];

  lines.push(generateAsciiHeader('Physics Analysis', 'equals'));
  lines.push('');

  lines.push(generateAsciiSectionHeader('Tensor Properties'));
  if (thought.tensorProperties) {
    lines.push(generateAsciiBulletList([
      `Rank: (${thought.tensorProperties.rank})`,
      `Components: ${thought.tensorProperties.components}`,
    ]));
  }

  return lines.join('\n');
}
```

---

## R-4: File Splitting (If Needed)

If files still exceed 1000 lines after utility adoption, split by format category:

```
src/export/visual/modes/physics/
├── index.ts              # Main export (re-exports all) ~50 lines
├── visual.ts             # DOT, Mermaid, ASCII, SVG ~200 lines
├── structured.ts         # GraphML, TikZ, UML ~150 lines
└── document.ts           # JSON, Markdown, HTML, Modelica ~200 lines
```

---

## Implementation Phases

### Sprint 1: Infrastructure (4-6 hours)

**Objective**: Add builder classes to utility modules

1. Add `DOTGraphBuilder` class to `utils/dot.ts`
2. Add `MermaidGraphBuilder` class to `utils/mermaid.ts` (optional)
3. Write unit tests for new builder classes
4. Update utility module documentation

**Deliverables**:
- Enhanced `src/export/visual/utils/dot.ts`
- Tests in `tests/unit/export/visual/utils/`

### Sprint 2: Critical Files (16-24 hours)

**Objective**: Refactor 12 files exceeding 1,000 lines to <1000

1. physics.ts (1,781 → <1000 lines)
2. engineering.ts (1,691 → <1000 lines)
3. metareasoning.ts (1,628 → <1000 lines)
4. proof-decomposition.ts (1,624 → <1000 lines)
5. hybrid.ts (1,450 → <1000 lines)
6. formal-logic.ts (1,290 → <1000 lines)
7. scientific-method.ts (1,257 → <1000 lines)
8. optimization.ts (1,234 → <1000 lines)
9. first-principles.ts (1,224 → <1000 lines)
10. mathematics.ts (1,211 → <1000 lines)
11. game-theory.ts (1,028 → <1000 lines)
12. evidential.ts (1,023 → <1000 lines)

**Deliverables**:
- 12 refactored mode files
- All tests passing
- Visual output unchanged (verified by comparison tests)

### Sprint 3: File Splitting & Cleanup (8-12 hours)

**Objective**: Split any files still exceeding 1000 lines after utility adoption

1. Identify files still >1000 lines after utility adoption
2. Split into format-category subdirectories
3. Update imports throughout codebase
4. Final integration testing

**Deliverables**:
- All mode files <1000 lines
- Clean directory structure
- Updated import paths

---

## Testing Strategy

### Unit Tests

```
tests/unit/export/visual/
├── utils/
│   ├── dot-builder.test.ts          # DOTGraphBuilder tests
│   ├── mermaid-builder.test.ts      # MermaidGraphBuilder tests
│   └── ascii-helpers.test.ts        # ASCII utility tests
└── modes/
    ├── physics.test.ts              # Physics exporter tests
    ├── engineering.test.ts          # Engineering exporter tests
    └── ... (all mode files)
```

### Visual Comparison Tests

For each refactored file, verify output is identical:

```typescript
describe('physics.ts refactoring', () => {
  it('DOT output unchanged', () => {
    const thought = createTestPhysicsThought();
    const newOutput = exportPhysicsVisualization(thought, { format: 'dot' });
    expect(newOutput).toMatchSnapshot();
  });

  it('Mermaid output unchanged', () => {
    const thought = createTestPhysicsThought();
    const newOutput = exportPhysicsVisualization(thought, { format: 'mermaid' });
    expect(newOutput).toMatchSnapshot();
  });
});
```

---

## Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Files >1000 lines | 12 | 0 |
| Total mode file lines | 24,046 | <15,000 |
| DOT utility adoption | 1/22 (4.5%) | 22/22 (100%) |
| Mermaid utility adoption | 1/22 (4.5%) | 22/22 (100%) |
| ASCII utility adoption | 1/22 (4.5%) | 22/22 (100%) |
| Tests passing | 3,539 | 3,539+ |
| Visual output | N/A | Identical before/after |

---

## Dependencies

- No new external dependencies
- Builds on existing `src/export/visual/utils/` infrastructure
- Reference implementation: `sequential.ts` (Phase 11 refactor)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking visual output | HIGH | Snapshot tests for all formats before/after |
| Regression in specific modes | MEDIUM | Per-mode integration tests |
| Builder pattern overhead | LOW | Benchmark performance (expected: negligible) |
| Scope creep | MEDIUM | Strictly limit to utility adoption, no new features |

---

## Note: Chunker Tool Bug

During analysis, a bug was discovered in `tools/chunking-for-files/`:

- The TypeScript parser fails on `{{` and `}}` (Mermaid hexagon syntax)
- This caused incorrect function size reporting in original analysis documents
- **File sizes are accurate; function size claims were inflated by the bug**

| File | Chunker Claimed | Actual |
|------|-----------------|--------|
| physics.ts `physicsToDOT()` | 1,562 lines | ~84 lines |
| metareasoning.ts `metaReasoningToDOT()` | 1,418 lines | ~75 lines |

The refactoring focus is correctly on **file size** (>1000 lines) and **utility adoption** (1/22), not individual function sizes.

---

## Future Considerations

- **Phase 14**: Apply similar refactoring to other large modules
- **Utility Enhancement**: Add more specialized graph patterns to utilities
- **Code Generation**: Consider generating boilerplate exporter code from templates
- **Performance**: Benchmark and optimize builder pattern if needed

---

## References

- `docs/analysis/Comprehensive_Codebase_Review.md` - Full codebase review
- `docs/analysis/file-splitting-analysis.md` - File size analysis
- `docs/analysis/export-utility-usage-analysis.md` - Utility adoption matrix
- `src/export/visual/modes/sequential.ts` - Reference implementation
- `src/export/visual/utils/dot.ts` - DOT utility module (593 lines)
- `src/export/visual/utils/mermaid.ts` - Mermaid utility module (540 lines)
- `src/export/visual/utils/ascii.ts` - ASCII utility module (721 lines)

---

*Generated: December 25, 2025*
*Verified: File sizes via `wc -l`, utility imports via `grep`, function boundaries via source inspection*
