# Phase 15: Radical Simplification Plan

## Executive Summary

**Goal**: Transform DeepThinking MCP from a 106K-line over-engineered codebase into a lean, maintainable ~35K-line system with actual algorithmic substance.

**Source**: This plan addresses findings from `docs/analysis/Comprehensive_Codebase_Review_2.md` - a brutally honest assessment channeling Linus Torvalds and John Carmack's engineering philosophies.

**Current State** (v8.5.0):
| Metric | Current | Problem |
|--------|---------|---------|
| Lines of Code | 105,942 | 5-7x more than needed |
| TypeScript Files | 250 | Excessive fragmentation |
| Type Definitions | 374 | 3-4x more than needed |
| Classes | 197 | 10x more than needed |
| Interfaces | 587 | Way too many (most with 1 impl) |
| Handler Files | 36 | Could be 1 function |
| Design Pattern refs | 840 | Pattern addiction |
| Actual Algorithms | 0 | The real problem |
| Indirection depth | 12+ calls | For simple data copy |

**Target State** (v9.0.0):
| Metric | Target | Reduction |
|--------|--------|-----------|
| Lines of Code | ~35,000 | 67% reduction |
| Type Definitions | ~100 | 73% reduction |
| Classes | ~20 | 90% reduction |
| Handler Files | 1 + exports | 97% reduction (36→1) |
| Design Pattern refs | ~100 | 88% reduction |
| Actual Algorithms | 5+ | Real computation |
| Indirection depth | 3-4 calls | 75% reduction |

**Approach**: 12 sprints organized into 4 phases over 8-10 weeks
- **Phase 15A** (Sprints 1-3): Architecture Simplification - Remove unnecessary abstractions
- **Phase 15B** (Sprints 4-6): Handler Consolidation - 36 files → 1 function
- **Phase 15C** (Sprints 7-9): Type System Simplification - 374 types → ~100
- **Phase 15D** (Sprints 10-12): Real Algorithm Implementation - Add actual computation

**Total Effort**: 60-75 developer hours across 12 sprints

---

## Risk Assessment

### Critical Risk: Breaking Changes
**Impact**: MCP clients may fail after refactoring
**Mitigation**:
- Maintain exact API contract in `src/index.ts`
- Create `DEPRECATED_LAYER.ts` for backward compatibility
- Integration tests before/after each sprint
- Version bump to v9.0.0 signals breaking internal changes

### Medium Risk: Test Breakage
**Impact**: 5,148 tests may break during refactoring
**Mitigation**:
- Keep API behavior identical
- Update test imports as files move
- Run full test suite after each task

### Low Risk: Performance Regression
**Impact**: Simplified code might be slower
**Mitigation**:
- Current code is so slow due to indirection that simplification will be faster
- Benchmark key paths before/after

---

## Phase 15A: Architecture Simplification

### Sprint 1: Remove Unnecessary Abstractions
**Effort**: 6-7 hours | **Week**: 1 | **Agent**: Claude Sonnet

**Goal**: Eliminate Factory/Builder/Strategy pattern overhead for simple operations.

#### Task 15A.1.1: Inline ModeHandlerRegistry
**Priority**: HIGH | **Effort**: 1.5 hours | **Agent**: Haiku

**Current Problem**:
```typescript
// 12+ call chain for creating a thought
index.ts → getSessionManager() → getThoughtFactory() →
ThoughtFactory.createThought() → ModeHandlerRegistry.getInstance() →
ModeHandlerRegistry.getHandler() → SpecificHandler.createThought() → ...
```

**Solution**: Replace singleton registry with simple Map literal.

**Files**:
- MODIFY: `src/modes/registry.ts` - simplify or inline into ThoughtFactory
- MODIFY: `src/services/ThoughtFactory.ts` - inline handler lookup
- MODIFY: `src/index.ts` - remove registry imports

**Instructions**:
1. Read `src/modes/registry.ts` to understand ModeHandlerRegistry API
2. Create handler Map in ThoughtFactory: `const handlers: Map<ThinkingMode, ModeHandler>`
3. Replace `registry.getHandler(mode)` with `handlers.get(mode)`
4. Remove registry import and instantiation
5. Run `npm run test:run` to verify no breakage

**Success Criteria**:
- Registry class simplified or eliminated
- All 5,148 tests pass
- No change to MCP API behavior

---

#### Task 15A.1.2: Eliminate Lazy Service Initialization
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Haiku

**Current Problem**:
```typescript
let _sessionManager: SessionManager | null = null;
async function getSessionManager(): Promise<SessionManager> {
  if (!_sessionManager) {
    const { SessionManager } = await import('./session/index.js');
    // ... 15 more lines
  }
  return _sessionManager;
}
// Repeated 4 times for: SessionManager, ThoughtFactory, ExportService, ModeRouter
```

**Solution**: Direct instantiation at module level for CLI tool.

**Files**:
- MODIFY: `src/index.ts` - replace async getters with direct imports
- DELETE: 4 lazy getter functions

**Instructions**:
1. Read lines 40-120 of `src/index.ts` to find lazy getters
2. Replace with direct imports at top of file
3. Change all `await getSessionManager()` to just `sessionManager`
4. Remove `async` from handlers that only awaited these getters
5. Run `npm run test:run`

**Success Criteria**:
- No lazy initialization for core services
- All 5,148 tests pass
- Startup time unchanged or faster

---

#### Task 15A.1.3: Remove Interface Segregation Overkill
**Priority**: MEDIUM | **Effort**: 1.0 hours | **Agent**: Haiku

**Current Problem**:
```typescript
// 4 interfaces, each with exactly 1 implementation
interface ILogger { ... } // implemented only by Logger
interface ISessionRepository { ... } // implemented only by MemorySessionRepository
interface SessionStorage { ... } // implemented only by FileSessionStore
interface ModeHandler { ... } // implemented generically
```

**Solution**: Replace interfaces with concrete types where only 1 impl exists.

**Files**:
- MODIFY: `src/interfaces/ILogger.ts` - convert to class
- MODIFY: `src/repositories/ISessionRepository.ts` - merge with implementation
- MODIFY: `src/session/storage/interface.ts` - merge SessionStorage interface with FileSessionStore
- UPDATE: All import sites

**Instructions**:
1. For each interface, verify only 1 implementation exists
2. Merge interface into implementation class
3. Update imports throughout codebase
4. Run `npm run typecheck` and `npm run test:run`

**Success Criteria**:
- 4 interfaces eliminated
- Type safety maintained
- All tests pass

---

#### Task 15A.1.4: Simplify ThoughtFactoryConfig
**Priority**: LOW | **Effort**: 0.5 hours | **Agent**: Haiku

**Current Problem**:
```typescript
interface ThoughtFactoryConfig {
  useRegistryForAll?: boolean;  // never changed from default
  autoRegisterHandlers?: boolean;  // never changed from default
  logger?: ILogger;  // never injected externally
}
```

**Solution**: Remove unused configuration options.

**Files**:
- MODIFY: `src/services/ThoughtFactory.ts` - remove config object

**Instructions**:
1. Search codebase for ThoughtFactoryConfig instantiation
2. Verify defaults are always used
3. Remove config parameter and interface
4. Hardcode previously default values
5. Run `npm run test:run`

**Success Criteria**:
- Configuration complexity removed
- All tests pass

---

#### Task 15A.1.5: Remove Barrel File Indirection
**Priority**: LOW | **Effort**: 1.5 hours | **Agent**: Haiku

**Current Problem**:
```typescript
// 25 barrel files (index.ts) that just re-export
// Causes unnecessary import chains and larger bundles
export * from './manager.js';
export * from './types.js';
export * from './storage/index.js';
```

**Solution**: Direct imports instead of barrel re-exports.

**Files**:
- MODIFY: All files importing from `./session/index.js`, `./types/index.js`, etc.
- DELETE: Unnecessary barrel files (keep only for public API)

**Instructions**:
1. Identify all 25 barrel files with `find src -name "index.ts"`
2. For each internal barrel, change imports to direct file paths
3. Keep only `src/index.ts` and `src/types/index.ts` for public API
4. Delete or simplify other barrel files
5. Run `npm run typecheck` and `npm run test:run`

**Success Criteria**:
- 15+ barrel files eliminated or simplified
- Import paths are direct
- All tests pass

---

#### Task 15A.1.6: Sprint 1 Verification
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Sonnet

**Files**:
- VERIFY: All modified files compile
- RUN: Full test suite
- UPDATE: `docs/planning/PHASE_15_SPRINT_1_TODO.json` with completion status

**Instructions**:
1. Run `npm run typecheck` - must pass with 0 errors
2. Run `npm run test:run` - all 5,148 tests must pass
3. Run `npm run build` - must complete successfully
4. Create git commit: "refactor(v9.0.0): Phase 15A Sprint 1 - Remove Unnecessary Abstractions"
5. Update sprint TODO with actual hours and notes

**Success Criteria**:
- All tasks 15A.1.1-15A.1.5 complete
- Build passes
- All tests pass
- Git commit created

---

### Sprint 2: Simplify Service Layer
**Effort**: 5-6 hours | **Week**: 2 | **Agent**: Claude Sonnet

**Goal**: Reduce service layer from 4 classes to 2 essential services.

#### Task 15A.2.1: Merge MetaMonitor into SessionManager
**Priority**: HIGH | **Effort**: 1.5 hours | **Agent**: Sonnet

**Current Problem**:
- `MetaMonitor.ts` (9KB) only tracks session metrics
- `SessionManager.ts` already manages sessions
- Unnecessary separation of concerns for a CLI tool

**Solution**: Move MetaMonitor functionality into SessionManager.

**Files**:
- MODIFY: `src/session/manager.ts` - add monitoring methods
- DELETE: `src/services/MetaMonitor.ts`
- MODIFY: `src/index.ts` - remove MetaMonitor imports

**Instructions**:
1. Read `src/services/MetaMonitor.ts` to understand its API
2. Add monitoring methods to SessionManager
3. Move metric tracking to session-level instead of separate service
4. Update all imports and usages
5. Run `npm run test:run`

---

#### Task 15A.2.2: Merge ModeRouter into ThoughtFactory
**Priority**: HIGH | **Effort**: 1.5 hours | **Agent**: Sonnet

**Current Problem**:
- `ModeRouter.ts` (12KB) only recommends modes based on input
- `ThoughtFactory.ts` already handles mode-specific logic
- Unnecessary separation for simple routing

**Solution**: Move routing logic into ThoughtFactory.

**Files**:
- MODIFY: `src/services/ThoughtFactory.ts` - add routing methods
- DELETE: `src/services/ModeRouter.ts`
- MODIFY: `src/index.ts` - remove ModeRouter imports

**Instructions**:
1. Read `src/services/ModeRouter.ts` to understand its API
2. Add `recommendMode()` and `quickRecommend()` to ThoughtFactory
3. Inline the routing logic (it's just keyword matching)
4. Update all imports
5. Run `npm run test:run`

---

#### Task 15A.2.3: Inline ExportService Dispatch Logic
**Priority**: MEDIUM | **Effort**: 1.0 hours | **Agent**: Haiku

**Current Problem**:
- `ExportService.ts` (48KB, 1,317 lines) is mostly dispatch logic to format-specific exporters
- The dispatch is just a switch statement

**Solution**: Move dispatch to index.ts handler, keep format-specific exporters.

**Files**:
- MODIFY: `src/index.ts` - inline export format dispatch
- MODIFY: `src/services/ExportService.ts` - keep only format exporters
- RENAME: `ExportService.ts` → `export/formats.ts`

**Instructions**:
1. Read `src/services/ExportService.ts` to identify dispatch logic
2. Move format switch to `deepthinking_session` handler in index.ts
3. Export individual format functions from `export/formats.ts`
4. Run `npm run test:run`

---

#### Task 15A.2.4: Remove Unused Cache Strategies
**Priority**: LOW | **Effort**: 0.5 hours | **Agent**: Haiku

**Current Problem**:
```typescript
// 6 files for 3 cache strategies - overkill for in-memory thought storage
src/cache/
├── factory.ts
├── lru.ts
├── lfu.ts
├── fifo.ts
├── types.ts
└── index.ts
```

**Solution**: Keep only LRU cache (most practical), inline to session.

**Files**:
- MODIFY: `src/session/manager.ts` - use inline LRU cache
- DELETE: `src/cache/factory.ts`
- DELETE: `src/cache/lfu.ts`
- DELETE: `src/cache/fifo.ts`
- MOVE: `src/cache/lru.ts` → `src/utils/lru-cache.ts`

---

#### Task 15A.2.5: Sprint 2 Verification
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Sonnet

Same verification steps as Sprint 1.

---

### Sprint 3: Clean Up Validation Layer
**Effort**: 5-6 hours | **Week**: 3 | **Agent**: Claude Sonnet

**Goal**: Consolidate 50 validator files into unified validation approach.

#### Task 15A.3.1: Create Unified Validator
**Priority**: HIGH | **Effort**: 2.0 hours | **Agent**: Sonnet

**Current Problem**:
```
src/validation/
├── validators/
│   ├── modes/          # 35 validator files, similar patterns
│   │   ├── computability.ts (531 lines)
│   │   ├── metareasoning.ts (370 lines)
│   │   └── ... 33 more
│   └── base.ts         # BaseValidator abstract class
├── cache.ts
├── constants.ts
├── schemas.ts
├── schema-utils.ts
├── validator.ts
└── index.ts            # barrel exports (44 total files)
```

**Solution**: Create single validator with mode-specific rules.

**Files**:
- CREATE: `src/validation/unified-validator.ts`
- Keep mode-specific validation rules as config objects, not classes

**Instructions**:
1. Read all 10 mode validators to identify common patterns
2. Create `ValidationRule` type for mode-specific checks
3. Create `UnifiedValidator` that applies rules based on mode
4. Move complex mode logic (Turing machine validation) to helper functions
5. Run `npm run test:run`

---

#### Task 15A.3.2: Remove BaseValidator Hierarchy
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Haiku

**Current Problem**:
- `BaseValidator` abstract class in `src/validation/validators/base.ts` with minimal actual reuse
- Each mode validator extends it but overrides everything

**Solution**: Replace inheritance with composition.

**Files**:
- MODIFY: `src/validation/validators/base.ts` - convert to utility functions
- MODIFY: Mode validators to use composition instead of inheritance

---

#### Task 15A.3.3: Inline Zod Schema Validation
**Priority**: MEDIUM | **Effort**: 1.0 hours | **Agent**: Haiku

**Current Problem**:
- Zod schemas defined separately from usage
- Runtime validation duplicates Zod checks

**Solution**: Use Zod `.parse()` as the only validation, remove manual checks.

**Files**:
- MODIFY: All mode validators
- REMOVE: Duplicate manual validation logic

---

#### Task 15A.3.4: Sprint 3 Verification
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Sonnet

Same verification steps as previous sprints.

---

## Phase 15B: Handler Consolidation

### Sprint 4: Create Unified Handler Function
**Effort**: 6-7 hours | **Week**: 4 | **Agent**: Claude Sonnet

**Goal**: Replace 36 handler files with single `createThought` function.

#### Task 15B.4.1: Create createThought Function
**Priority**: CRITICAL | **Effort**: 2.0 hours | **Agent**: Sonnet

**Current Problem**:
```typescript
// 36 handler files × ~400 lines each = 14,400 lines
src/modes/handlers/
├── SequentialHandler.ts
├── BayesianHandler.ts
├── CausalHandler.ts
└── ... 34 more
```

**What each handler actually does**:
```typescript
// Just copies input properties to output with mode field
return {
  id: randomUUID(),
  ...input,
  mode: ThinkingMode.SEQUENTIAL,
  timestamp: new Date(),
};
```

**Solution**:
```typescript
// src/modes/createThought.ts - ~400 lines total
export function createThought(input: ThoughtInput, mode: ThinkingMode): Thought {
  const base = {
    id: randomUUID(),
    timestamp: new Date(),
    mode,
    ...commonFields(input),
  };

  switch (mode) {
    case 'bayesian':
      return { ...base, ...bayesianFields(input) };
    case 'causal':
      return { ...base, ...causalFields(input) };
    // ... other modes
    default:
      return base;
  }
}

function bayesianFields(input: any) {
  return {
    priorProbability: input.priorProbability,
    posteriorProbability: input.posteriorProbability ?? computePosterior(input),
    // Mode-specific fields only
  };
}
```

**Files**:
- CREATE: `src/modes/createThought.ts`
- Keep complex mode logic as helper functions

**Instructions**:
1. Analyze all 36 handlers to extract common pattern
2. Create `createThought()` function with switch statement
3. Create helper functions for mode-specific field extraction
4. Verify all mode types are handled
5. Run `npm run test:run`

---

#### Task 15B.4.2: Migrate Sequential/Shannon/Hybrid Handlers
**Priority**: HIGH | **Effort**: 0.75 hours | **Agent**: Haiku

**Files**:
- READ: `src/modes/handlers/SequentialHandler.ts`
- READ: `src/modes/handlers/ShannonHandler.ts`
- READ: `src/modes/handlers/HybridHandler.ts`
- MODIFY: `src/modes/createThought.ts` - add cases

**Instructions**:
1. Extract mode-specific fields from each handler
2. Add switch cases to createThought
3. Verify behavior matches original handlers
4. Run tests for these modes

---

#### Task 15B.4.3: Migrate Causal/Bayesian/GameTheory Handlers
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Haiku

Same pattern as 15B.4.2 for these more complex handlers.

---

#### Task 15B.4.4: Migrate Remaining 31 Handlers
**Priority**: HIGH | **Effort**: 2.0 hours | **Agent**: Sonnet

**Instructions**:
1. Systematically migrate each remaining handler
2. Group similar handlers (Academic modes, Engineering modes, etc.)
3. Extract any real computation into utility functions
4. Verify all modes work

---

#### Task 15B.4.5: Delete Original Handler Files
**Priority**: HIGH | **Effort**: 0.5 hours | **Agent**: Haiku

**Files**:
- DELETE: All 36 files in `src/modes/handlers/` except `index.ts` and `ModeHandler.ts`
- MODIFY: `src/modes/handlers/index.ts` - export new function

---

### Sprint 5: Clean Up Handler Dependencies
**Effort**: 5-6 hours | **Week**: 5 | **Agent**: Claude Sonnet

**Goal**: Remove handler-related infrastructure.

#### Task 15B.5.1: Remove ModeHandler Interface
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Haiku

**Files**:
- DELETE: `src/modes/handlers/ModeHandler.ts`
- MODIFY: All files importing ModeHandler interface

---

#### Task 15B.5.2: Remove Handler Registration
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Haiku

**Files**:
- DELETE: `src/modes/handlers/registerAllHandlers.ts` (if exists)
- MODIFY: `src/services/ThoughtFactory.ts` - use createThought directly

---

#### Task 15B.5.3: Simplify ThoughtFactory
**Priority**: HIGH | **Effort**: 2.0 hours | **Agent**: Sonnet

**Current**: 873 lines with switch statement and registry integration
**Target**: ~100 lines calling createThought

**Files**:
- MODIFY: `src/services/ThoughtFactory.ts` - drastic simplification

---

#### Task 15B.5.4: Sprint 5 Verification
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Sonnet

---

### Sprint 6: Handler Test Migration
**Effort**: 4-5 hours | **Week**: 6 | **Agent**: Claude Sonnet

**Goal**: Update tests to use new unified handler.

#### Task 15B.6.1: Update Unit Tests
**Priority**: HIGH | **Effort**: 2.0 hours | **Agent**: Sonnet

**Files**:
- MODIFY: All files in `tests/unit/modes/handlers/`
- Update imports and test targets

---

#### Task 15B.6.2: Update Integration Tests
**Priority**: HIGH | **Effort**: 1.5 hours | **Agent**: Haiku

---

#### Task 15B.6.3: Sprint 6 Verification
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Sonnet

---

## Phase 15C: Type System Simplification

### Sprint 7: Consolidate Mode Types
**Effort**: 6-7 hours | **Week**: 7 | **Agent**: Claude Sonnet

**Goal**: Reduce 374 types to ~100.

#### Task 15C.7.1: Create Unified Thought Type
**Priority**: CRITICAL | **Effort**: 2.0 hours | **Agent**: Sonnet

**Current Problem**:
```typescript
// 32 separate type files in src/types/modes/
// Each with 5-15 types = 374 total
```

**Solution**:
```typescript
// src/types/thought.ts
type ThinkingMode = 'sequential' | 'bayesian' | /* ... 31 more */;

interface BaseThought {
  id: string;
  mode: ThinkingMode;
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  timestamp: Date;
  // ... common fields
}

// Discriminated union with mode-specific extensions
type Thought = BaseThought & (
  | { mode: 'bayesian'; priorProbability?: number; posteriorProbability?: number }
  | { mode: 'causal'; nodes?: CausalNode[]; edges?: CausalEdge[] }
  | { mode: 'sequential' } // No extra fields
  // ... other modes with their specific fields
);
```

**Files**:
- CREATE: `src/types/thought.ts` - unified type definition
- KEEP: Mode-specific field types as needed

---

#### Task 15C.7.2: Merge Mode Type Files
**Priority**: HIGH | **Effort**: 2.0 hours | **Agent**: Sonnet

**Files**:
- DELETE: 32 files in `src/types/modes/`
- CREATE: `src/types/mode-fields.ts` - mode-specific field definitions

---

#### Task 15C.7.3: Update Type Imports
**Priority**: HIGH | **Effort**: 1.5 hours | **Agent**: Haiku

**Files**:
- MODIFY: All files importing from `src/types/modes/*`

---

#### Task 15C.7.4: Sprint 7 Verification
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Sonnet

---

### Sprint 8: Remove Unused Types
**Effort**: 5-6 hours | **Week**: 8 | **Agent**: Claude Sonnet

#### Task 15C.8.1: Identify Dead Types
**Priority**: HIGH | **Effort**: 1.5 hours | **Agent**: Haiku

**Instructions**:
1. Run TypeScript compiler with `--noUnusedLocals`
2. Identify types that are exported but never imported
3. Create list for removal

---

#### Task 15C.8.2: Remove Dead Types
**Priority**: HIGH | **Effort**: 2.0 hours | **Agent**: Haiku

---

#### Task 15C.8.3: Consolidate Type Guards
**Priority**: MEDIUM | **Effort**: 1.0 hours | **Agent**: Haiku

**Current**: 85+ type guards scattered across files
**Solution**: Single `src/types/guards.ts` with essential guards only

---

#### Task 15C.8.4: Sprint 8 Verification
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Sonnet

---

### Sprint 9: Type Test Updates
**Effort**: 4-5 hours | **Week**: 9 | **Agent**: Claude Sonnet

Similar structure to Sprint 6.

---

## Phase 15D: Real Algorithm Implementation

### Sprint 10: Add Bayesian Computation
**Effort**: 6-7 hours | **Week**: 10 | **Agent**: Claude Sonnet

**Goal**: Make "Bayesian reasoning" actually compute Bayes' theorem.

#### Task 15D.10.1: Implement Bayes' Theorem
**Priority**: HIGH | **Effort**: 2.0 hours | **Agent**: Sonnet

**Current Problem**:
```typescript
// BayesianHandler just copies input to output
return {
  ...base,
  mode: ThinkingMode.BAYESIAN,
  priorProbability: input.priorProbability, // Just copied!
  posteriorProbability: input.posteriorProbability, // Just copied!
};
```

**Solution**:
```typescript
// src/algorithms/bayesian.ts
export function computePosterior(prior: number, likelihood: number, evidence: number): number {
  // Bayes: P(H|E) = P(E|H) * P(H) / P(E)
  return (likelihood * prior) / evidence;
}

export function updateBeliefs(hypotheses: Hypothesis[], evidence: Evidence): Hypothesis[] {
  // Multi-hypothesis Bayesian update
  const totalEvidence = hypotheses.reduce((sum, h) =>
    sum + h.likelihood * h.prior, 0);

  return hypotheses.map(h => ({
    ...h,
    posterior: (h.likelihood * h.prior) / totalEvidence
  }));
}
```

**Files**:
- CREATE: `src/algorithms/bayesian.ts`
- MODIFY: `src/modes/createThought.ts` - use real computation

---

#### Task 15D.10.2: Add Probability Validation
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Haiku

Validate that probabilities sum to 1, are in [0,1] range, etc.

---

#### Task 15D.10.3: Implement Bayesian Network Support
**Priority**: MEDIUM | **Effort**: 2.0 hours | **Agent**: Sonnet

Basic conditional probability propagation through a DAG.

---

#### Task 15D.10.4: Sprint 10 Verification
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Sonnet

---

### Sprint 11: Add Game Theory Computation
**Effort**: 6-7 hours | **Week**: 11 | **Agent**: Claude Sonnet

**Goal**: Make "Game Theory mode" actually solve games.

#### Task 15D.11.1: Implement Nash Equilibrium Finder
**Priority**: HIGH | **Effort**: 3.0 hours | **Agent**: Sonnet

**Solution**:
```typescript
// src/algorithms/game-theory.ts
export function findNashEquilibria(payoffMatrix: number[][][]): StrategyProfile[] {
  // For 2-player games: Support enumeration algorithm
  // For small games: Lemke-Howson algorithm
  // Returns all pure and mixed strategy Nash equilibria
}

export function findDominantStrategies(payoffMatrix: number[][][]): {
  player: number;
  strategy: number;
  type: 'strictly' | 'weakly';
}[] {
  // Iterative elimination of dominated strategies
}
```

**Files**:
- CREATE: `src/algorithms/game-theory.ts`

---

#### Task 15D.11.2: Implement Payoff Matrix Validation
**Priority**: HIGH | **Effort**: 1.0 hours | **Agent**: Haiku

---

#### Task 15D.11.3: Add Simple Game Solvers
**Priority**: MEDIUM | **Effort**: 2.0 hours | **Agent**: Sonnet

- Prisoner's Dilemma detection and analysis
- Zero-sum game minimax
- Cooperative game solutions

---

### Sprint 12: Add Proof Validation & Finalization
**Effort**: 6-7 hours | **Week**: 12 | **Agent**: Claude Sonnet

#### Task 15D.12.1: Implement Basic Proof Checker
**Priority**: HIGH | **Effort**: 2.5 hours | **Agent**: Sonnet

```typescript
// src/algorithms/proof.ts
export function validateProofStep(
  step: ProofStep,
  previousSteps: ProofStep[],
  rules: InferenceRule[]
): { valid: boolean; errors: string[] } {
  // Check if step follows from previous steps via given rules
}

export function checkProofCompleteness(
  premises: string[],
  conclusion: string,
  steps: ProofStep[]
): { complete: boolean; gaps: string[] } {
  // Verify proof reaches conclusion from premises
}
```

---

#### Task 15D.12.2: Implement Proof Decomposition
**Priority**: MEDIUM | **Effort**: 2.0 hours | **Agent**: Sonnet

Real traversal and decomposition of proof trees.

---

#### Task 15D.12.3: Final Verification & Documentation
**Priority**: CRITICAL | **Effort**: 2.0 hours | **Agent**: Sonnet

**Instructions**:
1. Run full test suite - must pass
2. Run `npm run build`
3. Update CLAUDE.md with new architecture
4. Update CHANGELOG.md for v9.0.0
5. Create migration guide for v8→v9
6. Bump version to 9.0.0

---

## Sprint TODO Files

Create individual JSON files for each sprint:
- `PHASE_15A_SPRINT_1_TODO.json` through `PHASE_15A_SPRINT_3_TODO.json`
- `PHASE_15B_SPRINT_4_TODO.json` through `PHASE_15B_SPRINT_6_TODO.json`
- `PHASE_15C_SPRINT_7_TODO.json` through `PHASE_15C_SPRINT_9_TODO.json`
- `PHASE_15D_SPRINT_10_TODO.json` through `PHASE_15D_SPRINT_12_TODO.json`

---

## Success Metrics

### Quantitative
| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Source Lines | 105,942 | ~35,000 | 67% |
| TypeScript Files | 250 | ~80 | 68% |
| Type Definitions | 374 | ~100 | 73% |
| Classes | 197 | ~20 | 90% |
| Handler Files | 36 | 1 | 97% |
| Design Pattern refs | 840 | ~100 | 88% |
| Test Count | 5,148 | 5,000+ | Maintained |
| Algorithms | 0 | 5+ | New capability |

### Qualitative
- Code is understandable in 30 minutes, not 3 hours
- New developer can contribute in first day
- "Reasoning" modes actually reason
- Cognitive load reduced from 9+ concepts to 3-4

---

## Appendix A: Files to Delete

```
# Handler files (36 total)
src/modes/handlers/*.ts (except index.ts)

# Unused cache strategies
src/cache/lfu.ts
src/cache/fifo.ts
src/cache/factory.ts

# Redundant services
src/services/MetaMonitor.ts
src/services/ModeRouter.ts

# Excessive type files (33 total)
src/types/modes/*.ts

# Barrel files (10+)
Various index.ts files
```

---

## Appendix B: Agent Assignment Guidelines

### Claude Haiku (Faster, Cheaper)
Use for:
- File deletions
- Simple search/replace refactoring
- Import updates
- Moving code between files
- Running verification commands

### Claude Sonnet (More Capable)
Use for:
- Creating new algorithms
- Complex refactoring with logic changes
- Writing unified functions that replace multiple files
- Integration work
- Documentation updates

---

## References

- `docs/analysis/Comprehensive_Codebase_Review_2.md` - Source analysis
- `docs/analysis/Comprehensive_Codebase_Review_1.md` - Previous review
- `docs/planning/archive/PHASE_10_IMPROVEMENT_PLAN.md` - ModeHandler introduction
- `docs/planning/archive/PHASE_5_REFACTORING_PLAN.md` - Token optimization

---

*Plan created: December 28, 2025*
*Based on: Comprehensive Codebase Review 2.0*
*Target version: v9.0.0*
*Estimated effort: 60-75 developer hours*
