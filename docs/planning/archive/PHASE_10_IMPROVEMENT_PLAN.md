# Phase 10: Framework-Aligned Improvements Plan (v8.0.0)

## Executive Summary

**Goal**: Transform DeepThinking MCP from a sophisticated reasoning server into a more intelligent, user-friendly, and framework-aligned system by implementing the improvements identified in the code-level analysis and the "How to Understand Anything" framework mapping.

**Current State** (v7.5.2):
- 33 reasoning modes (21 fully implemented, 12 experimental)
- 185 TypeScript files, 74,443 lines of code
- 791 passing tests across 39 test files
- 12 MCP tools + 1 legacy tool
- ThoughtFactory contains 538-line switch statement handling all modes

**Target State** (v8.0.0):
- ModeHandler pattern replacing ThoughtFactory switch statement
- Autopilot mode selection from natural language problem descriptions
- 3 new reasoning modes (Inversion, Reference Class, Abstraction Ladder)
- Framework-aligned features (Systems Archetypes, Guiding Questions, Bias Warnings, Stuck Detection)
- Enhanced mode-specific logic (Socratic Critique, Calibration Tracking)
- Implementation status transparency in API responses

**Value Proposition**:
1. **Reduced Technical Debt**: Replace 538-line switch with Strategy Pattern
2. **Better UX**: Natural language problem description → intelligent mode selection
3. **More Capable**: 3 new high-value reasoning modes from framework analysis
4. **Self-Aware**: System detects stuck states and provides emergency protocols
5. **Transparent**: Users know which modes are experimental vs fully implemented
6. **Framework-Aligned**: Implements the Seven Pillars thinking approach

**Approach**: Seven-sprint implementation over 6-7 weeks
- **Sprint 1**: Foundation - ModeHandler infrastructure + API transparency
- **Sprint 2**: ModeHandler migration - Core modes (Causal, Bayesian, GameTheory)
- **Sprint 2B**: ModeHandler migration - Additional modes with enhancements (Counterfactual, Synthesis, SystemsThinking, Critique)
- **Sprint 3**: Autopilot implementation with natural language processing
- **Sprint 4**: New reasoning modes (Inversion, Reference Class, Abstraction)
- **Sprint 5**: Framework integration (Archetypes, Questions, Bias, Stuck Detection, Mental Models)
- **Sprint 6**: Visual Export Refactoring, Feynman Technique, Testing & Documentation

**Total Effort**: 40-50 developer hours across 7 sprints

---

## Source Documents

This plan synthesizes findings from:
1. `docs/planning/Improvement/deepthinking-mcp-code-analysis.md` - Code-level examination
2. `docs/planning/Improvement/framework-mapping.md` - Framework → MCP mapping
3. `docs/planning/Improvement/framework-aligned-implementation.ts` - Reference implementation
4. `docs/planning/Improvement/PACKAGE_SUMMARY.md` - Deliverables overview

---

## Phase 10 Architecture Changes

### 1. ModeHandler Pattern (Sprint 1-2)

**Current**: ThoughtFactory.ts has a 538-line switch statement
```typescript
// Current - monolithic switch
switch (mode) {
  case 'causal':
    const causalInput = input as any;
    return { ...baseThought, mode: ThinkingMode.CAUSAL, ... };
  case 'bayesian':
    // ... 20 more lines
  // ... 27 more cases
}
```

**Target**: Strategy Pattern with ModeHandlerRegistry
```typescript
// New - modular handlers
interface ModeHandler<TInput, TThought> {
  readonly mode: ThinkingMode;
  createThought(input: TInput, base: BaseThought): TThought;
  validate(input: unknown): TInput;
  getDefaults(): Partial<TInput>;
}

class ModeHandlerRegistry {
  private handlers = new Map<ThinkingMode, ModeHandler>();
  register(handler: ModeHandler): void;
  createThought(mode: ThinkingMode, input: any, base: BaseThought): Thought;
}
```

### 2. Autopilot Architecture (Sprint 3)

**New Service**: ProblemAnalyzer + AutopilotSelector
```typescript
// Analyzes natural language problem descriptions
class ProblemAnalyzer {
  analyzeFromDescription(problem: string): ProblemCharacteristics;
}

// Selects optimal mode(s) based on analysis
class AutopilotSelector {
  selectMode(problem: string): {
    primaryMode: ThinkingMode;
    modeChain: ThinkingMode[];
    reasoning: string;
    biasWarnings: BiasWarning[];
  };
}
```

### 3. New Reasoning Modes (Sprint 4)

| Mode | Type Interface | Purpose |
|------|----------------|---------|
| `inversion` | `InversionThought` | Failure mode analysis, "What could go wrong?" |
| `referenceclass` | `ReferenceClassThought` | Base rate forecasting, outside view |
| `abstraction` | `AbstractionLadderThought` | Climb/descend abstraction hierarchy |

### 4. Framework Features (Sprint 5)

| Feature | Integration Point | Purpose |
|---------|-------------------|---------|
| Systems Archetypes | SystemsThinking mode | Detect 12 system patterns with interventions |
| Guiding Questions | All modes | Context-aware prompts during session |
| Bias Warnings | Validation phases | Alert users to cognitive bias risks |
| Stuck Detection | MetaMonitor | Detect repetition/overwhelm, suggest emergency protocols |

---

## Sprint Structure

### Sprint 1: Foundation - ModeHandler Infrastructure & API Transparency
**Effort**: 5-6 hours | **Week**: 1

**Tasks**:

1. **Create ModeHandler Interface & Registry** (1.5 hours)
   - Create `src/modes/handlers/ModeHandler.ts` with generic interface
   - Create `src/modes/handlers/registry.ts` with ModeHandlerRegistry class
   - Create `src/modes/handlers/index.ts` for exports
   - Files: 3 new files in `src/modes/handlers/`

2. **Create GenericModeHandler for fallback** (1 hour)
   - Implement GenericModeHandler that replicates current ThoughtFactory behavior
   - Handles modes without specialized logic
   - File: `src/modes/handlers/GenericModeHandler.ts`

3. **Add Implementation Status to API Responses** (0.5 hours)
   - Add `modeStatus` field to handleAddThought response in index.ts
   - Include: isFullyImplemented, hasSpecializedHandler, note for experimental
   - File: `src/index.ts`

4. **Create RefactoredThoughtFactory wrapper** (1 hour)
   - Wrapper that delegates to registry when handler exists, else uses current switch
   - Enables incremental migration
   - File: `src/services/RefactoredThoughtFactory.ts`

5. **Add ModeHandler Tests** (1 hour)
   - Unit tests for registry, interface contracts
   - Integration test for factory delegation
   - Files: `tests/unit/modes/handlers/*.test.ts`

6. **Update Type Definitions** (0.5 hours)
   - Add `ModeStatus` interface to types
   - Export new handler types
   - Files: `src/types/core.ts`, `src/types/index.ts`

**Success Criteria**:
- ModeHandlerRegistry functional with register/createThought methods
- GenericModeHandler passes same tests as current ThoughtFactory
- API responses include modeStatus field
- All existing tests pass

---

### Sprint 2: ModeHandler Migration - Core Modes
**Effort**: 5-6 hours | **Week**: 2

**Tasks**:

1. **Migrate CausalHandler** (1.5 hours)
   - Full ModeHandler implementation with semantic validation
   - Validates causal graph structure, detects cycles, propagates interventions
   - Files: `src/modes/handlers/CausalHandler.ts`, tests

2. **Migrate BayesianHandler** (1.5 hours)
   - Implements automatic posterior calculation from prior and likelihood
   - Validates probability values sum to 1
   - Files: `src/modes/handlers/BayesianHandler.ts`, tests

3. **Migrate GameTheoryHandler** (1 hour)
   - Validates payoff matrix dimensions
   - Checks player/strategy consistency, computes basic Nash equilibria
   - Files: `src/modes/handlers/GameTheoryHandler.ts`, tests

4. **Update ThoughtFactory to Use Registry** (1 hour)
   - Wire RefactoredThoughtFactory into index.ts
   - Register migrated handlers
   - Verify incremental migration works
   - Files: `src/index.ts`, `src/services/ThoughtFactory.ts`

5. **Add Handler Integration Tests** (0.5 hours)
   - Test factory delegates to handlers correctly
   - Test fallback to GenericModeHandler for non-migrated modes
   - Files: `tests/integration/mode-handler-delegation.test.ts`

**Success Criteria**:
- 3 modes migrated to handler pattern (Causal, Bayesian, GameTheory)
- Each handler has specialized validation logic that adds value
- Factory delegates to handlers for migrated modes
- All 791+ tests pass

---

### Sprint 2B: ModeHandler Migration - Additional Modes with Enhancements
**Effort**: 4-5 hours | **Week**: 2-3

**Tasks**:

1. **Migrate CounterfactualHandler** (1 hour)
   - Maintains world state tracking
   - Validates divergence points, compares outcomes between actual and hypothetical
   - Files: `src/modes/handlers/CounterfactualHandler.ts`, tests

2. **Migrate SynthesisHandler** (1 hour)
   - Tracks source coverage
   - Validates theme extraction, detects contradictions between sources
   - Files: `src/modes/handlers/SynthesisHandler.ts`, tests

3. **Migrate SystemsThinkingHandler** (1.5 hours)
   - Integrates Systems Archetypes detection (12 archetypes)
   - Adds warning signs and intervention suggestions
   - Files: `src/modes/handlers/SystemsThinkingHandler.ts`, tests

4. **Migrate CritiqueHandler** (1 hour)
   - Adds Socratic question categories (clarification, assumptions, evidence, perspectives, implications, meta)
   - Files: `src/modes/handlers/CritiqueHandler.ts`, tests

5. **Verify All Handler Migrations** (0.5 hours)
   - Run full test suite
   - Verify all migrated handlers produce identical output to original switch cases
   - Files: `tests/integration/handler-parity.test.ts`

**Success Criteria**:
- 4 additional modes migrated (Counterfactual, Synthesis, SystemsThinking, Critique)
- SystemsThinkingHandler includes archetype detection
- CritiqueHandler includes Socratic question framework
- All handlers produce identical results to original ThoughtFactory

---

### Sprint 3: Autopilot Implementation
**Effort**: 6-7 hours | **Week**: 3

**Tasks**:

1. **Create PatternDetector Service** (1.5 hours)
   - 11 specialized detectors for problem characteristics
   - Detects: proofs, quantities, causality, competition, uncertainty, etc.
   - File: `src/services/PatternDetector.ts`

2. **Create ProblemAnalyzer Service** (1.5 hours)
   - Combines pattern detection with TaxonomyClassifier
   - Extracts ProblemCharacteristics from natural language
   - File: `src/services/ProblemAnalyzer.ts`

3. **Create AutopilotSelector Service** (1 hour)
   - Maps characteristics to mode recommendations
   - Generates mode chains for complex problems
   - File: `src/services/AutopilotSelector.ts`

4. **Implement Decision Tree Logic** (1 hour)
   - Implement `walkDecisionTree()` from framework mapping
   - Node types: IS_FAMILIAR, DECOMPOSITION, HYPOTHESIZE, FALSIFY, etc.
   - File: `src/framework/decision-tree.ts`

5. **Add `deepthinking_auto` MCP Tool** (1 hour)
   - JSON schema for autopilot tool
   - Handler in index.ts
   - File: `src/tools/schemas/autopilot.ts`, `src/index.ts`

6. **Add Autopilot Tests** (1 hour)
   - Test pattern detection accuracy
   - Test mode selection quality
   - Files: `tests/unit/services/autopilot.test.ts`

**Success Criteria**:
- `deepthinking_auto` tool accepts natural language problem descriptions
- Returns primary mode, mode chain, reasoning, and bias warnings
- Accurately maps problem types to appropriate modes

---

### Sprint 4: New Reasoning Modes
**Effort**: 6-7 hours | **Week**: 4

**Tasks**:

1. **Implement Inversion Mode** (1.5 hours)
   - Type: `InversionThought` with goal, failureModes, mitigations, derivedActions
   - Handler: `InversionHandler.ts` with failure mode analysis
   - Validator: Zod schema in validation/validators/modes/
   - Files: `src/types/modes/inversion.ts`, `src/modes/handlers/InversionHandler.ts`

2. **Implement Reference Class Mode** (1.5 hours)
   - Type: `ReferenceClassThought` with referenceClasses, baseRate, adjustedForecast
   - Handler: `ReferenceClassHandler.ts` with base rate calculations
   - Files: `src/types/modes/referenceclass.ts`, `src/modes/handlers/ReferenceClassHandler.ts`

3. **Implement Abstraction Ladder Mode** (1.5 hours)
   - Type: `AbstractionLadderThought` with ladder levels, transferApplications
   - Handler: `AbstractionHandler.ts` with level validation
   - Files: `src/types/modes/abstraction.ts`, `src/modes/handlers/AbstractionHandler.ts`

4. **Add Visual Exporters for New Modes** (1 hour)
   - Mermaid, DOT, ASCII exporters for each new mode
   - Files: `src/export/visual/inversion.ts`, etc.

5. **Add New Modes to MCP Tools** (0.5 hours)
   - Add to `deepthinking_analytical` or create new tool group
   - Update json-schemas.ts
   - Files: `src/tools/json-schemas.ts`, `src/tools/definitions.ts`

6. **Add New Mode Tests** (1 hour)
   - Unit tests for each new mode handler
   - Integration tests for MCP tool access
   - Files: `tests/unit/modes/handlers/inversion.test.ts`, etc.

**Success Criteria**:
- 3 new modes (inversion, referenceclass, abstraction) fully implemented
- Each mode accessible via MCP tools
- Visual exports working for all formats
- 36 reasoning modes total (33 + 3)

---

### Sprint 5: Framework Integration Features
**Effort**: 6-7 hours | **Week**: 5

**Tasks**:

1. **Create Systems Archetypes Module** (1 hour)
   - Add SYSTEMS_ARCHETYPES constant with 12 archetypes (Limits to Growth, Shifting the Burden, Escalation, etc.)
   - Add `detectSystemArchetype()` function with keyword matching
   - Files: `src/framework/systems-archetypes.ts`, tests
   - Note: Integration with SystemsThinkingHandler done in Sprint 2B

2. **Implement Guiding Questions Feature** (1 hour)
   - Add QUICK_FIRE_QUESTIONS by category (decomposition, pattern, challenge, synthesis, validation)
   - Add `getGuidingQuestions(mode, thoughtNumber, totalThoughts)` function
   - Include in handleAddThought response
   - Files: `src/framework/guiding-questions.ts`, `src/index.ts`

3. **Implement Bias Warnings Feature** (1 hour)
   - Add COGNITIVE_BIASES constant with 10 biases (Confirmation, Planning Fallacy, Survivorship, etc.) and counter-questions
   - Add `getBiasWarnings(problemDescription)` function
   - Include in autopilot and validation phase responses
   - Files: `src/framework/bias-warnings.ts`

4. **Implement Stuck Detection** (1.5 hours)
   - Add EMERGENCY_PROTOCOLS (WHEN_STUCK, WHEN_WRONG, WHEN_OVERWHELMED) with steps and suggested modes
   - Add `detectStuckState(sessionThoughts, currentThought)` using content similarity
   - Integrate into MetaMonitor for automatic detection
   - Files: `src/framework/stuck-detection.ts`, `src/services/MetaMonitor.ts`

5. **Add Seven Pillars Organization** (1 hour)
   - Add SEVEN_PILLARS constant mapping modes to 7 pillars (Foundations, Patterns, Questions, Synthesis, Validation, Tools, Mindset)
   - Add pillar-based mode discovery endpoint
   - Files: `src/framework/seven-pillars.ts`, `src/framework/index.ts`

6. **Add Mental Model Prompts to Handlers** (1 hour)
   - Add `relevantMentalModels` property to ModeHandler interface
   - Populate for key modes (Economics for GameTheory, Psychology for Critique, Systems for SystemsThinking, Math for Bayesian)
   - Files: `src/modes/handlers/ModeHandler.ts`, `src/framework/mental-models.ts`

**Success Criteria**:
- detectSystemArchetype identifies 12 archetypes with interventions
- Session responses include relevant guiding questions based on mode and progress
- Bias warnings appear for high-risk contexts (planning, attribution, success stories)
- Stuck detection triggers emergency protocols when repetition or overwhelm detected
- Mental models surfaced for relevant modes

---

### Sprint 6: Visual Export Refactoring, Enhancements & Documentation
**Effort**: 7-8 hours | **Week**: 6-7

**Tasks**:

1. **Visual Export Template System** (2 hours)
   - Create ExportTemplate interface for mode-specific data extraction
   - Create generic renderers per format (MermaidRenderer, DOTRenderer, ASCIIRenderer, SVGRenderer)
   - Reduce 35 visual export files to ~15 with shared logic
   - Files: `src/export/visual/templates/ExportTemplate.ts`, `src/export/visual/renderers/*.ts`

2. **Add Feynman Technique Session Type** (1 hour)
   - FEYNMAN_STEPS constant with 6 steps (Choose, Explain Simply, Identify Gaps, Return to Source, Analogize, Review)
   - Add Feynman session workflow that chains appropriate modes
   - Files: `src/framework/feynman-technique.ts`, `src/session/feynman-session.ts`

3. **Integrate Taxonomy Classifier with Mode Selection** (1 hour)
   - Use classifier for pre-session mode recommendation
   - Add confidence tracking during sessions via ModeRouter
   - Enhance quickRecommend with classification context
   - Files: `src/services/ModeRouter.ts`, `src/taxonomy/classifier.ts`

4. **Add Calibration Tracking** (1 hour)
   - Add CalibrationMetrics interface with bucket scoring (90%, 70%, 50%)
   - Track predictions and outcomes across sessions
   - Files: `src/session/calibration.ts`, `src/types/session.ts`

5. **Add Integration Tests** (1 hour)
   - Test mode chaining context preservation
   - Test autopilot-to-execution flow
   - Test Feynman session workflow
   - Files: `tests/integration/mode-chaining.test.ts`, `tests/integration/feynman-session.test.ts`

6. **Update Documentation** (1.5 hours)
   - Update CLAUDE.md with new architecture (ModeHandler, framework/, handlers)
   - Update CHANGELOG.md for v8.0.0
   - Create docs/modes/ documentation for new modes (Inversion, Reference Class, Abstraction)
   - Update README with autopilot examples
   - Files: `CLAUDE.md`, `CHANGELOG.md`, `README.md`, `docs/modes/*.md`, `docs/architecture/MODEHANDLER.md`

7. **Final Verification & Version Bump** (0.5 hours)
   - Run full test suite (850+ expected)
   - Verify all 36 modes accessible
   - Verify visual export refactoring works
   - Bump version to v8.0.0
   - Files: `package.json`

**Success Criteria**:
- Visual export files reduced from 35 to ~15 with template-based architecture
- Feynman technique session type available for understanding validation
- Mode selection leverages TaxonomyClassifier for better recommendations
- Calibration metrics tracked across sessions with bucket scoring
- All documentation updated for v8.0.0
- All tests passing (850+ expected)
- Ready for npm publish

---

## Risk Assessment

### Medium Risk: ModeHandler Migration Complexity

**Impact**: Incremental migration could introduce subtle behavior differences
**Mitigation**:
- GenericModeHandler replicates exact current behavior
- Comprehensive test coverage per mode
- Feature flag to toggle new vs old factory
- Rollback capability by reverting to ThoughtFactory

### Low Risk: Autopilot Mode Selection Accuracy

**Impact**: Poor mode recommendations frustrate users
**Mitigation**:
- Fall back to HYBRID mode when uncertain
- Include reasoning in response for transparency
- Allow user override of recommendations
- Iteratively improve pattern detection

### Low Risk: New Mode Type Safety

**Impact**: New modes might have gaps in type definitions
**Mitigation**:
- Follow established patterns from existing modes
- Comprehensive Zod validation
- Visual export tests for each format

---

## Success Metrics

### Quantitative
- Mode count: 33 → 36 (+3 new modes)
- ThoughtFactory switch lines: 538 → ~50 (registry delegation)
- Test count: 791 → 850+ (new mode and feature tests)
- Handler migration: 7+ modes using ModeHandler pattern (Causal, Bayesian, GameTheory, Counterfactual, Synthesis, SystemsThinking, Critique)
- Visual export files: 35 → ~15 (template-based consolidation)

### Qualitative
- Users can describe problems in natural language
- System suggests appropriate reasoning modes
- Experimental mode status clearly communicated
- Framework-aligned features enhance reasoning quality

---

## New Directory Structure (Post Phase 10)

```
src/
├── framework/              # NEW: Framework-aligned features
│   ├── decision-tree.ts
│   ├── seven-pillars.ts
│   ├── systems-archetypes.ts
│   ├── guiding-questions.ts
│   ├── bias-warnings.ts
│   ├── stuck-detection.ts
│   ├── mental-models.ts
│   ├── feynman-technique.ts
│   └── index.ts
├── modes/
│   ├── handlers/           # NEW: ModeHandler implementations
│   │   ├── ModeHandler.ts
│   │   ├── registry.ts
│   │   ├── GenericModeHandler.ts
│   │   ├── CausalHandler.ts
│   │   ├── BayesianHandler.ts
│   │   ├── GameTheoryHandler.ts
│   │   ├── CounterfactualHandler.ts
│   │   ├── SynthesisHandler.ts
│   │   ├── SystemsThinkingHandler.ts
│   │   ├── CritiqueHandler.ts
│   │   ├── InversionHandler.ts
│   │   ├── ReferenceClassHandler.ts
│   │   ├── AbstractionHandler.ts
│   │   └── index.ts
│   └── ... (existing mode implementations)
├── export/
│   └── visual/
│       ├── templates/       # NEW: Template-based export
│       │   └── ExportTemplate.ts
│       ├── renderers/       # NEW: Format-specific renderers
│       │   ├── MermaidRenderer.ts
│       │   ├── DOTRenderer.ts
│       │   ├── ASCIIRenderer.ts
│       │   └── index.ts
│       └── ... (consolidated mode exporters)
├── services/
│   ├── PatternDetector.ts   # NEW
│   ├── ProblemAnalyzer.ts   # NEW
│   ├── AutopilotSelector.ts # NEW
│   └── ... (existing services)
├── session/
│   ├── calibration.ts       # NEW
│   ├── feynman-session.ts   # NEW
│   └── ... (existing session files)
├── types/
│   └── modes/
│       ├── inversion.ts     # NEW
│       ├── referenceclass.ts # NEW
│       ├── abstraction.ts   # NEW
│       └── ... (existing mode types)
└── ... (rest of existing structure)
```

---

## Implementation Checklist

### Pre-Sprint Verification
- [ ] Run `npm run typecheck` - baseline passing
- [ ] Run `npm run test:run` - all 791 tests passing
- [ ] Create git branch `phase-10-improvements`
- [ ] Review improvement documents thoroughly

### Sprint 1 Checklist ✅ (v8.0.0 - Completed 2025-12-13)
- [x] Create ModeHandler interface and registry
- [x] Create GenericModeHandler
- [x] Add modeStatus to API responses
- [x] Create RefactoredThoughtFactory
- [x] Add handler tests
- [x] Update type definitions
- [x] Commit: "feat(v8.0.0): Phase 10 Sprint 1 - ModeHandler Infrastructure" (17fa6b2)

### Sprint 2 Checklist ✅ (v8.1.0 - Completed 2025-12-13)
- [x] Migrate CausalHandler
- [x] Migrate BayesianHandler
- [x] Migrate GameTheoryHandler
- [x] Wire factory to registry
- [x] Add handler integration tests
- [x] Commit: "feat(v8.1.0): Phase 10 Sprint 2 - ModeHandler Migration - Core Modes" (11f5a1a)

### Sprint 2B Checklist ✅ (v8.2.0/v8.2.1 - Completed 2025-12-14)
- [x] Migrate CounterfactualHandler
- [x] Migrate SynthesisHandler
- [x] Migrate SystemsThinkingHandler (with archetypes)
- [x] Migrate CritiqueHandler (with Socratic questions)
- [x] Verify all handler migrations
- [x] Commit: "feat(v8.2.0): Phase 10 Sprint 2B - ModeHandler Migration - Advanced Modes" (6a14b1a)
- [x] Fix: "fix(v8.2.1): Integrate ModeHandlers into ThoughtFactory for MCP server usage" (35c98af)

### Sprint 3 Checklist
- [ ] Create PatternDetector
- [ ] Create ProblemAnalyzer
- [ ] Create AutopilotSelector
- [ ] Implement decision tree logic
- [ ] Add deepthinking_auto tool
- [ ] Add autopilot tests
- [ ] Commit: "feat: Add autopilot mode selection"

### Sprint 4 Checklist
- [ ] Implement Inversion mode
- [ ] Implement Reference Class mode
- [ ] Implement Abstraction Ladder mode
- [ ] Add visual exporters
- [ ] Add to MCP tools
- [ ] Add mode tests
- [ ] Commit: "feat: Add 3 new reasoning modes"

### Sprint 5 Checklist
- [ ] Create Systems Archetypes module
- [ ] Implement Guiding Questions
- [ ] Implement Bias Warnings
- [ ] Implement Stuck Detection
- [ ] Add Seven Pillars organization
- [ ] Add Mental Model Prompts
- [ ] Add framework tests
- [ ] Commit: "feat: Add framework-aligned features"

### Sprint 6 Checklist
- [ ] Create Visual Export Template System
- [ ] Add Feynman Technique session type
- [ ] Integrate Taxonomy with mode selection
- [ ] Add Calibration tracking
- [ ] Add integration tests (mode chaining, Feynman)
- [ ] Update all documentation
- [ ] Bump version to v8.0.0
- [ ] Final test verification
- [ ] Commit: "chore: v8.0.0 release preparation"

---

## References

- `docs/planning/Improvement/deepthinking-mcp-code-analysis.md`
- `docs/planning/Improvement/framework-mapping.md`
- `docs/planning/Improvement/framework-aligned-implementation.ts`
- `docs/planning/Improvement/PACKAGE_SUMMARY.md`
- HOW_TO_UNDERSTAND_ANYTHING.md (source framework)
- HOW_TO_UNDERSTAND_ANYTHING___TOOLKIT.md (source toolkit)

---

## Appendix: ModeHandler Interface Reference

```typescript
// src/modes/handlers/ModeHandler.ts
export interface ModeHandler<TInput, TThought extends BaseThought> {
  readonly mode: ThinkingMode;

  /**
   * Create a mode-specific thought from input.
   */
  createThought(input: TInput, base: Omit<BaseThought, 'mode'>): TThought;

  /**
   * Validate input and return typed version.
   */
  validate(input: unknown): TInput;

  /**
   * Get default values for optional fields.
   */
  getDefaults(): Partial<TInput>;

  /**
   * Optional: Get mental models relevant to this mode.
   */
  getMentalModels?(): string[];

  /**
   * Optional: Get guiding questions for this mode.
   */
  getGuidingQuestions?(thoughtNumber: number): string[];
}

// src/modes/handlers/registry.ts
export class ModeHandlerRegistry {
  private handlers = new Map<ThinkingMode, ModeHandler<any, any>>();

  register(handler: ModeHandler<any, any>): void {
    this.handlers.set(handler.mode, handler);
  }

  get(mode: ThinkingMode): ModeHandler<any, any> | undefined {
    return this.handlers.get(mode);
  }

  has(mode: ThinkingMode): boolean {
    return this.handlers.has(mode);
  }

  createThought(
    mode: ThinkingMode,
    input: any,
    base: Omit<BaseThought, 'mode'>
  ): Thought {
    const handler = this.handlers.get(mode);
    if (!handler) {
      throw new Error(`No handler registered for mode: ${mode}`);
    }
    return handler.createThought(input, base);
  }
}
```
