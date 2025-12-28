# Phase 7: Visual Export Integration for All Modes (v6.1.0)

## Executive Summary

**Goal**: Integrate all existing visual export modules with ExportService to provide Mermaid, DOT, and ASCII exports for all 21 reasoning modes.

**What is Visual Export Integration?**
Visual export integration connects the existing visual export modules (Mermaid, DOT, ASCII generators) to the ExportService so users can generate diagrams for all reasoning modes, not just a subset.

**Value Proposition**:
1. **Complete Feature Coverage**: All 21 modes get specialized visual exports
2. **User Experience**: Consistent, high-quality visualizations across all reasoning types
3. **Documentation**: Beautiful diagrams for all reasoning processes
4. **Code Completeness**: Finish what's already 66% built
5. **Zero Breaking Changes**: Purely additive feature completion

**Approach**: Two-sprint implementation
- **Sprint 1**: Integrate 10 existing visual exporters
- **Sprint 2**: Create 6 new visual exporters + integration + testing

**Total Effort**: 28-36 developer hours across 2 sprints

---

## Current State Analysis

**Current State (v6.0.0)**:
- 21 reasoning modes implemented
- 15 visual export modules exist in `src/export/visual/`
- Only 5 modes integrated with ExportService
- 10 modes have exporters but aren't hooked up
- 6 modes need new exporters created

**Problem**: Visual export modules exist for many modes but aren't accessible via the ExportService. Users requesting visual exports (Mermaid/DOT/ASCII) for most modes get generic fallback instead of specialized visualizations.

---

## Sprint Structure

### Sprint 1: Integration of Existing Exporters (Week 1)
**Effort**: 12-16 hours | **Result**: 10 additional modes with visual exports

**Overview**: Hook up all 10 existing visual export modules to ExportService so they're accessible via the export tool.

**Key Features**:
1. **Type Imports**: Add all mode-specific thought type imports
2. **Integration Blocks**: Add type-guarded integration blocks for each mode
3. **Wrapper Methods**: Update VisualExporter class with new methods
4. **Testing**: Create integration tests for all 10 modes

**Tasks**:

#### Type System (1 hour)
1. Update `src/services/ExportService.ts` - Add imports for 10 mode types (Sequential, Shannon, Abductive, Counterfactual, Analogical, Evidential, SystemsThinking, ScientificMethod, Optimization, FormalLogic)

#### Integration Blocks (10 hours)
2. Add Sequential mode integration - mode check + 'buildUpon' field check
3. Add Shannon mode integration - mode check + 'stage' field check
4. Add Abductive mode integration - mode check + 'hypotheses' field check
5. Add Counterfactual mode integration - mode check + 'scenarios' field check
6. Add Analogical mode integration - mode check + 'sourceAnalogy' field check
7. Add Evidential mode integration - mode check + 'frameOfDiscernment' field check
8. Add Systems Thinking mode integration - mode check + 'systemComponents' field check
9. Add Scientific Method mode integration - mode check + 'hypothesis' field check
10. Add Optimization mode integration - mode check + 'objectiveFunction' field check
11. Add Formal Logic mode integration - mode check + 'premises' field check

#### Wrapper Methods (2 hours)
12. Update `src/export/visual/index.ts` - Add 10 wrapper methods to VisualExporter class

#### Testing (3 hours)
13. Create integration tests for all 10 modes
14. Create visual export coverage test for all 15 integrated modes

**Success Criteria**:
- 15/21 modes with visual exports (71% coverage)
- All existing tests passing
- 10+ new tests added
- No TypeScript errors
- Zero breaking changes

**Files Created**:
- `tests/integration/export/sequential-visual.test.ts`
- `tests/integration/export/shannon-visual.test.ts`
- `tests/integration/export/abductive-visual.test.ts`
- `tests/integration/export/counterfactual-visual.test.ts`
- `tests/integration/export/analogical-visual.test.ts`
- `tests/integration/export/evidential-visual.test.ts`
- `tests/integration/export/systems-thinking-visual.test.ts`
- `tests/integration/export/scientific-method-visual.test.ts`
- `tests/integration/export/optimization-visual.test.ts`
- `tests/integration/export/formal-logic-visual.test.ts`
- `tests/integration/export/visual-export-coverage.test.ts`

**Files Modified**:
- `src/services/ExportService.ts`
- `src/export/visual/index.ts`

---

### Sprint 2: New Visual Exporters & Release v6.1.0 (Week 2)
**Effort**: 16-20 hours | **Result**: Production-ready v6.1.0 with 100% visual export coverage

**Overview**: Create 6 new visual export modules for remaining modes, integrate them, and release v6.1.0.

**Key Features**:
1. **New Exporters**: Create Mathematics, Physics, Hybrid, Meta-reasoning, Recursive, Modal exporters
2. **Integration**: Hook up all 6 new exporters to ExportService
3. **Comprehensive Testing**: Full coverage test suite
4. **Documentation**: Visual export guide and release notes

**Tasks**:

#### New Visual Exporters (16 hours)
1. Create `src/export/visual/mathematics.ts` - Equation derivation trees, proof steps
2. Create `src/export/visual/physics.ts` - Tensor diagrams, conservation law flows
3. Create `src/export/visual/hybrid.ts` - Multi-mode orchestration diagrams
4. Create `src/export/visual/metareasoning.ts` - Strategy evaluation flowcharts
5. Create `src/export/visual/recursive.ts` - Recursion trees with base cases
6. Create `src/export/visual/modal.ts` - Possible worlds diagrams

#### Integration (2 hours)
7. Update `src/services/ExportService.ts` - Add 6 integration blocks
8. Update `src/export/visual/index.ts` - Add 6 wrapper methods

#### Testing (3 hours)
9. Create integration tests for all 6 new modes
10. Create comprehensive all-modes visual test
11. Run full test suite 5 times for consistency

#### Documentation & Release (3 hours)
12. Create `docs/VISUAL_EXPORTS.md` - Comprehensive visual export guide
13. Update `README.md` - Document visual export coverage
14. Update `CHANGELOG.md` - Add v6.1.0 entry
15. Run typecheck - verify no TypeScript errors
16. Run npm run build - verify dist/ output is clean
17. Commit changes and tag v6.1.0 release
18. Update memory-mcp with v6.1.0 completion

**Success Criteria**:
- 21/21 modes with visual exports (100% coverage)
- All tests passing (expect 790+ tests)
- Comprehensive documentation
- Zero breaking changes
- Ready for npm publish

**Files Created**:
- `src/export/visual/mathematics.ts`
- `src/export/visual/physics.ts`
- `src/export/visual/hybrid.ts`
- `src/export/visual/metareasoning.ts`
- `src/export/visual/recursive.ts`
- `src/export/visual/modal.ts`
- `tests/integration/export/mathematics-visual.test.ts`
- `tests/integration/export/physics-visual.test.ts`
- `tests/integration/export/hybrid-visual.test.ts`
- `tests/integration/export/metareasoning-visual.test.ts`
- `tests/integration/export/recursive-visual.test.ts`
- `tests/integration/export/modal-visual.test.ts`
- `tests/integration/export/all-modes-visual.test.ts`
- `docs/VISUAL_EXPORTS.md`

**Files Modified**:
- `src/services/ExportService.ts`
- `src/export/visual/index.ts`
- `README.md`
- `CHANGELOG.md`
- `package.json`

---

## Technical Architecture

### Integration Pattern

Each mode needs an integration block in `ExportService.exportVisual()`:

```typescript
// Example: Sequential mode integration
if (lastThought.mode === ThinkingMode.SEQUENTIAL && 'buildUpon' in lastThought) {
  return this.visualExporter.exportSequentialDependencyGraph(
    lastThought as SequentialThought,
    {
      format,
      colorScheme: 'default',
      includeLabels: true,
      includeMetrics: true,
    }
  );
}
```

### Type Guard Strategy

1. **Mode Check**: Verify `thought.mode === ThinkingMode.X`
2. **Field Check**: Verify key fields exist (e.g., `'buildUpon' in thought`)
3. **Type Assertion**: Cast to specific thought type
4. **Call Exporter**: Invoke appropriate visual export method

### Visual Exporter Module Pattern

Each new visual exporter follows this structure:

```typescript
// src/export/visual/modename.ts
import type { ModeNameThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

export function exportModeNameVisualization(
  thought: ModeNameThought,
  options: VisualExportOptions
): string {
  const { format, colorScheme = 'default', includeLabels = true } = options;

  switch (format) {
    case 'mermaid':
      return modeNameToMermaid(thought, colorScheme, includeLabels);
    case 'dot':
      return modeNameToDOT(thought, includeLabels);
    case 'ascii':
      return modeNameToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
```

---

## Visual Export Coverage Analysis

### Fully Integrated (5 modes)
1. **Causal** → `exportCausalGraph()` - Node colors, edge strengths, interventions
2. **Temporal** → `exportTemporalTimeline()` - Events, intervals, relations
3. **Game Theory** → `exportGameTree()` - Players, strategies, payoffs
4. **Bayesian** → `exportBayesianNetwork()` - Hypotheses, priors, posteriors
5. **First Principles** → `exportFirstPrinciplesDerivation()` - Axioms, derivation chain

### Exporters Exist But NOT Integrated (10 modes)
6. **Sequential** - buildUpon dependencies, branches, revisions
7. **Shannon** - 5-stage methodology flow
8. **Abductive** - Hypothesis ranking, observations
9. **Counterfactual** - Scenario comparison, outcomes
10. **Analogical** - Source/target mapping, relationships
11. **Evidential** - Frame of discernment, belief functions
12. **Systems Thinking** - Causal loops, feedback, components
13. **Scientific Method** - Hypothesis, experiments, predictions
14. **Optimization** - Objective function, constraints, solution
15. **Formal Logic** - Premises, inference rules, conclusion

### No Visual Exporters Yet (6 modes)
16. **Mathematics** - Equation derivation trees, proof steps
17. **Physics** - Tensor diagrams, conservation law flows
18. **Hybrid** - Multi-mode orchestration diagrams
19. **Meta-reasoning** - Strategy evaluation flowcharts
20. **Recursive** - Recursion trees with base cases
21. **Modal** - Possible worlds diagrams

---

## Timeline Summary

| Sprint | Week | Effort | Key Deliverable | Tests Added |
|--------|------|--------|----------------|-------------|
| 1 | 1 | 12-16h | Integrate 10 existing exporters | 11 test files |
| 2 | 2 | 16-20h | Create 6 new exporters + v6.1.0 | 8 test files |
| **Total** | **1-2 weeks** | **28-36h** | **v6.1.0 production** | **19 test files** |

---

## Breaking Changes (v6.1.0)

**None!** Visual export integration is a purely additive feature.

### New Capabilities:
- Visual exports for all 21 reasoning modes
- Mermaid, DOT, ASCII formats for every mode
- Specialized visualizations per mode type

### Backward Compatibility:
- All existing modes work exactly as before
- No API changes to existing tools
- Existing sessions compatible

---

## Success Metrics

### Quantitative:
- All 790+ tests passing
- Zero regressions in existing modes
- Visual exports complete in < 500ms per thought
- 100% mode coverage (21/21)

### Qualitative:
- Visual exports provide useful diagrams
- Users can visualize any reasoning process
- Code follows existing architectural patterns
- Documentation is clear and comprehensive

---

## Risk Mitigation

### Medium Risk: Type Compatibility Issues
**Impact**: Type guards may not match actual thought structure
**Mitigation**:
- Verify field names in type definitions before adding checks
- Unit tests for each type guard
- Manual testing with real sessions

### Low Risk: Visual Export Quality
**Impact**: Generated diagrams may be hard to read
**Mitigation**:
- Follow existing exporter patterns
- Manual review of sample outputs
- Consistent styling across modes

### Low Risk: Performance Impact
**Impact**: Large sessions may export slowly
**Mitigation**:
- Lazy-load visual exporters
- Performance benchmarks
- Optimize hot paths if needed

---

## Next Steps

1. Review plan and approve approach
2. Execute Sprint 1: Integration of existing exporters
3. Execute Sprint 2: Create new exporters and release
4. Update sprint JSON todos as tasks complete
5. Commit changes and tag v6.1.0
6. Publish to npm
7. Update memory with completion

---

## Critical Files Reference

### Sprint 1 Must-Read:
1. `src/services/ExportService.ts` - Main integration target
2. `src/export/visual/index.ts` - VisualExporter wrapper class
3. `src/export/visual/*.ts` - Existing exporter patterns
4. `src/types/modes/*.ts` - Mode type definitions

### Sprint 2 Must-Read:
5. `src/export/visual/causal.ts` - Good exporter template
6. `src/export/visual/types.ts` - Visual export options
7. `src/export/visual/utils.ts` - Utility functions

### Documentation Templates:
8. `docs/modes/*.md` - Mode documentation examples
9. `CHANGELOG.md` - Version history format
10. `README.md` - Feature documentation

---

## References

- Phase 6 Implementation (Meta-reasoning mode) - Template for major version changes
- Existing ExportService (`src/services/ExportService.ts`) - Integration target
- Visual exporter modules (`src/export/visual/`) - Pattern reference
