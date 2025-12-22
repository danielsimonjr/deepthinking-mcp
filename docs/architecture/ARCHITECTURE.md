# DeepThinking MCP - System Architecture

## System Architecture

DeepThinking MCP is a Model Context Protocol (MCP) server that provides advanced reasoning capabilities through 33 thinking modes (29 with dedicated thought types) with meta-reasoning for strategic oversight. The architecture follows a modular, service-oriented design with clear separation of concerns.

**Version**: 8.3.2 | **Node**: >=18.0.0

## What's New in v8.3.x

### Phase 11: Comprehensive Test Coverage + Bug Fixes

- **Mode Recommendation Fix**: `quickRecommend()` now uses substring matching with 10 new Bayesian keywords
- **Export Improvements**: Markdown/LaTeX/Jupyter exports include mode-specific structured data via `extractModeSpecificMarkdown()` and `extractModeSpecificLatex()` helpers
- **Test Coverage**: 143 test files, 3539 passing tests (up from 74 files, 2161 tests)
- **Version Alignment**: All visual exporters updated to v8.3.1

## What's New in v8.2.x

### Phase 10: ModeHandler Architecture

This release introduces the ModeHandler pattern for mode-specific processing:

- **ModeHandler Interface** (`src/modes/handlers/ModeHandler.ts`): Strategy pattern for mode-specific validation and enhancement
- **ModeHandlerRegistry** (`src/modes/handlers/ModeHandlerRegistry.ts`): Singleton registry managing all specialized handlers
- **7 Specialized Handlers**: CausalHandler, BayesianHandler, GameTheoryHandler, CounterfactualHandler, SynthesisHandler, SystemsThinkingHandler, CritiqueHandler
- **ThoughtFactory Integration**: Handlers integrated directly for seamless thought creation

### Key Handler Enhancements (v8.2.x)
- **CausalHandler**: Validates graph structure, detects cycles, propagates interventions
- **BayesianHandler**: Auto-calculates posteriors from prior × likelihood, validates probability sums
- **GameTheoryHandler**: Validates payoff matrix dimensions, computes Nash equilibria
- **CounterfactualHandler**: Tracks world states, validates divergence points, compares outcomes
- **SynthesisHandler**: Tracks source coverage, validates theme extraction, detects contradictions
- **SystemsThinkingHandler**: Detects 8 Systems Archetypes (Peter Senge) with warning signs and interventions
- **CritiqueHandler**: Applies 6 Socratic question categories (Richard Paul) for rigorous analysis

## What's New in v7.5.0

- **Phase 14: Accessible Reasoning Modes** - All 29 modes accessible via 12 focused MCP tools

## What's New in v7.0.0

### Phase 8: Proof Decomposition & Mathematical Reasoning Engine

- **ProofDecomposer**: Breaks proofs into atomic statements with dependency graphs
- **GapAnalyzer**: Detects gaps, missing steps, implicit assumptions
- **Native SVG Export**: Direct SVG generation without external tools

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Client (Claude)                    │
└───────────────────┬─────────────────────────────────────────┘
                    │ MCP Protocol (JSON-RPC)
┌───────────────────┴─────────────────────────────────────────┐
│                   MCP Server (index.ts)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              12 Focused Tool Handlers (v7.5.0+)        │ │
│  │  • deepthinking_core         • deepthinking_standard   │ │
│  │  • deepthinking_mathematics  • deepthinking_temporal   │ │
│  │  • deepthinking_probabilistic • deepthinking_causal    │ │
│  │  • deepthinking_strategic    • deepthinking_analytical │ │
│  │  • deepthinking_scientific   • deepthinking_engineering│ │
│  │  • deepthinking_academic     • deepthinking_session    │ │
│  └────────────────────────────────────────────────────────┘ │
└───────┬──────────┬──────────┬───────────┬───────────────────┘
        │          │          │           │
   ┌────▼────┐ ┌───▼──────┐ ┌─▼──────┐ ┌──▼─────────┐
   │ Thought │ │  Export  │ │  Mode  │ │   Session  │
   │ Factory │ │ Service  │ │ Router │ │   Manager  │
   └────┬────┘ └────┬─────┘ └───┬────┘ └─────┬──────┘
        │           │           │            │
        │      ┌────▼───────────▼────┐       │
        │      │ Visual Exporters    │       │
        │      │ (21 mode-specific)  │       │
        │      └─────────────────────┘       │
        │                  │                 │
        │           ┌──────▼──────┐          │
        │           │ MetaMonitor │◄─────────┤
        │           │  (v6.0.0)   │          │
        │           └─────────────┘          │
        │                                    │
        └──────────────┬─────────────────────┘
                       │
        ┌──────────────┼───────────────┐
        │              │               │
   ┌────▼──────┐  ┌────▼──────┐  ┌────▼─────────┐
   │  Storage  │  │ Validation │  │  Type System │
   │   Layer   │  │   Layer    │  │  (27 Modes)  │
   └───────────┘  │ (Lazy Load)│  └──────────────┘
                  └────────────┘
```

## Core Components

### 1. MCP Server (`src/index.ts`)
- **Role**: Entry point and request orchestration
- **Responsibilities**:
  - Handles MCP protocol communication
  - Routes tool requests to appropriate services
  - Validates inputs using Zod schemas
  - Manages server lifecycle

### 2. Service Layer

#### ThoughtFactory (`src/services/ThoughtFactory.ts`)
- **Role**: Centralized thought creation for all 33 thinking modes with handler integration (v8.x)
- **Responsibilities**:
  - Creates mode-specific thought objects
  - Delegates to specialized handlers via ModeHandlerRegistry (v8.x)
  - Applies mode-specific validation and enhancements
  - Handles thought revisions and dependencies
- **Handler Integration (v8.x)**: Checks `registry.hasSpecializedHandler(mode)` before falling back to switch statement
- **Modes Supported**: 33 modes including Sequential, Shannon, Mathematics, Physics, Hybrid, Inductive, Deductive, Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, Game Theory, Evidential, First Principles, Systems Thinking, Scientific Method, Optimization, Formal Logic, Metareasoning, Recursive, Modal, Stochastic, Constraint, Computability, Cryptanalytic, Algorithmic, Synthesis, Argumentation, Critique, Analysis, Engineering

#### ExportService (`src/services/ExportService.ts`)
- **Role**: Unified export logic for multiple formats
- **Responsibilities**:
  - Session export in 8 formats
  - Visual diagram generation (Mermaid, DOT, ASCII)
  - Format-specific transformations
- **Formats**: JSON, Markdown, LaTeX, HTML, Jupyter, Mermaid, DOT, ASCII

#### ModeRouter (`src/services/ModeRouter.ts`)
- **Role**: Mode switching, recommendations, and adaptive switching (v6.0.0)
- **Responsibilities**:
  - Switches thinking modes mid-session
  - Provides mode recommendations based on problem characteristics
  - Integrates with taxonomy system
  - **Adaptive mode switching** via `evaluateAndSuggestSwitch()` (v6.0.0)
  - **Auto-switching** at low effectiveness via `autoSwitchIfNeeded()` (v6.0.0)

#### MetaMonitor (`src/services/MetaMonitor.ts`) - v6.0.0
- **Role**: Session tracking and strategy evaluation for meta-reasoning
- **Responsibilities**:
  - Records thoughts in session history for meta-level analysis
  - Tracks mode transitions across sessions
  - Evaluates strategy effectiveness (effectiveness, efficiency, confidence, quality)
  - Suggests alternative strategies when current approach is failing
  - Calculates quality metrics (logical consistency, evidence quality, completeness)
  - Provides session context for meta-reasoning insights

### 3. Visual Export System (`src/export/visual/`) - v7.0.0

**Modularized from monolithic visual.ts (2,546 lines) into 25 focused files:**

```
src/export/visual/
├── index.ts              # Unified VisualExporter class
├── types.ts              # VisualFormat ('mermaid' | 'dot' | 'ascii' | 'svg'), VisualExportOptions
├── utils.ts              # sanitizeId utility
├── proof-decomposition.ts # Proof decomposition export (v7.0.0) - Mermaid, DOT, ASCII, SVG
└── [21 mode-specific exporters]
    ├── causal.ts         # Causal graph export
    ├── temporal.ts       # Timeline export
    ├── game-theory.ts    # Game tree export
    ├── bayesian.ts       # Bayesian network export
    ├── sequential.ts     # Sequential flow export
    ├── shannon.ts        # Information flow export
    ├── abductive.ts      # Hypothesis graph export
    ├── counterfactual.ts # Counterfactual tree export
    ├── analogical.ts     # Analogy mapping export
    ├── evidential.ts     # Evidence graph export
    ├── first-principles.ts   # Decomposition tree export
    ├── systems-thinking.ts   # System diagram export
    ├── scientific-method.ts  # Experiment flow export
    ├── optimization.ts       # Optimization space export
    ├── formal-logic.ts       # Proof tree export
    ├── mathematics.ts        # Math derivation export (v6.1.0)
    ├── physics.ts            # Physics diagram export (v6.1.0)
    ├── hybrid.ts             # Hybrid mode export (v6.1.0)
    ├── metareasoning.ts      # Meta-reasoning export (v6.1.0)
    └── computability.ts      # Turing machine diagrams (v7.2.0)
```

**Native SVG Export (v7.0.0)**:
- Direct SVG generation without external tools (mermaid-cli, Graphviz)
- Layered graph layout (axioms/hypotheses → derived → conclusions)
- Color schemes: default, pastel, monochrome
- Gap visualization with dashed red lines
- Metrics panel and legend support
- Configurable dimensions (svgWidth, svgHeight, nodeSpacing)

**Benefits**:
- Lazy loading: Only load exporters when specific mode is needed
- Tree-shaking: Unused exporters eliminated during bundling
- Maintainability: Smaller, focused files (~100-150 lines each)
- Backward compatibility: Unified VisualExporter class preserved

### 4. Session Management (`src/session/`)

#### SessionManager (`src/session/manager.ts`)
- **Role**: Core session lifecycle management
- **Responsibilities**:
  - Create, retrieve, update, delete sessions
  - Manage session state and metadata
  - Handle thought additions
  - LRU cache for active sessions

#### SessionMetricsCalculator (`src/session/SessionMetricsCalculator.ts`)
- **Role**: Session metrics calculation
- **Responsibilities**:
  - Initialize metrics with O(1) operations
  - Update metrics incrementally (O(1) instead of O(n))
  - Track mode-specific metrics
  - Calculate cache statistics

### 5. Validation System (`src/validation/`) - v4.3.0

#### Validation Constants (`src/validation/constants.ts`)
Centralized validation enums and helpers:
- `IssueSeverity`: error, warning, info
- `IssueCategory`: structural, logical, mathematical, physical
- `ValidationThresholds`: probability, confidence, weight ranges
- `ValidationMessages`: Factory functions for consistent messages
- Helper functions: `isInRange()`, `isValidProbability()`, `isValidConfidence()`

#### ValidatorRegistry (`src/validation/validators/registry.ts`)
**Lazy-loading validator system** (v4.3.0):
- Validators loaded on-demand via dynamic imports
- `getAsync()` for async lazy loading
- `preload()` for selective preloading
- Consolidated `VALIDATOR_REGISTRY` mapping

#### BaseValidator (`src/validation/validators/base.ts`)
**Reusable validation methods** (v4.3.0):
- `validateNumberRange()` - Consolidates 56+ range checks
- `validateProbability()` - Probability range validation
- `validateConfidence()` - Confidence range validation
- `validateRequired()` - Required field validation
- `validateNonEmptyArray()` - Array validation

### 6. Storage Layer

#### Repository Pattern (`src/repositories/`)
- **ISessionRepository**: Domain-oriented interface
- **FileSessionRepository**: Persistent storage implementation
- **MemorySessionRepository**: In-memory storage for testing

Benefits:
- Testability through interface abstraction
- Flexibility to swap storage backends
- Query methods (findByMode, listMetadata)

### 7. Search & Discovery (`src/search/`)

#### SearchEngine (`src/search/engine.ts`)
- **Role**: Full-text search and filtering
- **Capabilities**:
  - Text search with tokenization
  - Multi-dimensional filtering (mode, author, domain, taxonomy, dates)
  - Sorting (relevance, date, title)
  - Pagination
  - Faceted results
- **Index**: In-memory inverted index with TF-IDF scoring

### 8. Batch Processing (`src/batch/`)

#### BatchProcessor (`src/batch/processor.ts`)
- **Role**: Asynchronous batch job execution
- **Features**:
  - Job types: export, import, analyze, validate, transform, index, backup, cleanup
  - Concurrency control (configurable max concurrent jobs)
  - Progress tracking
  - Retry logic for failed items
  - Job queue management

### 9. Backup & Recovery (`src/backup/`)

#### BackupManager (`src/backup/backup-manager.ts`)
- **Role**: Data backup and restoration
- **Features**:
  - Multiple providers (Local, S3, GCS, Azure)
  - Compression (gzip, brotli)
  - Encryption support
  - Backup types (full, incremental, differential)
  - Checksum validation (SHA256)

### 10. Tools & Schema System (`src/tools/`)

#### Lazy Schema Loader (`src/tools/lazy-loader.ts`)
- On-demand schema loading
- `getAllToolDefinitions()` for MCP ListTools
- `validateInput()` for lazy schema validation
- `getSchemaStats()` for cache monitoring

#### Schema Organization (`src/tools/schemas/`)
```
src/tools/schemas/
├── index.ts      # Explicit exports (tree-shaking optimized)
├── base.ts       # BaseThoughtSchema, SessionActionSchema
├── shared.ts     # ConfidenceSchema, LevelEnum, etc.
├── version.ts    # Version schema
└── modes/        # Mode-specific schemas (8 files)
```

### 11. Taxonomy System (`src/taxonomy/`)

#### Components:
- **TaxonomyNavigator**: Navigate reasoning type hierarchy
- **SuggestionEngine**: Problem-based mode recommendations
- **AdaptiveModeSelector**: Intelligent mode selection
- **MultiModalAnalyzer**: Combined reasoning analysis

Provides 69 reasoning types (110 planned) organized across 12 categories.

### 12. Type System (`src/types/`)

#### Organized by Domain:
- **core.ts**: Base types, ThinkingMode enum (27 modes), Thought union type (23 types)
- **modes/*.ts**: Mode-specific thought types (19 files)
- **config.ts**: Configuration types
- **session.ts**: Session and validation types
- **events.ts**: Event system types

#### Mode Categories (v7.2.0):
- **Core Modes** (5): Sequential, Shannon, Mathematics, Physics, Hybrid
- **Historical Computing** (2): Computability (Turing), Cryptanalytic (Turing) - *v7.2.0*
- **Advanced Runtime** (6): Metareasoning, Recursive, Modal, Stochastic, Constraint, Optimization
- **Fundamental** (2): Inductive, Deductive
- **Experimental** (12): Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, GameTheory (+ von Neumann extensions), Evidential, FirstPrinciples, SystemsThinking, ScientificMethod, FormalLogic

## Architectural Patterns

### 1. Service-Oriented Architecture
- Business logic extracted into focused service classes
- Each service has a single, well-defined responsibility
- Services are reusable and testable in isolation

### 2. Repository Pattern
- Storage abstraction through interfaces
- Domain-oriented API
- Easy to test and swap implementations

### 3. Factory Pattern
- ThoughtFactory centralizes thought creation
- Encapsulates mode-specific logic
- Ensures consistency across thought types

### 4. Strategy Pattern
- Different thinking modes as strategies
- Pluggable reasoning algorithms
- Mode switching without system restart

### 5. Lazy Loading Pattern (v4.3.0)
- Validators loaded on-demand
- Schemas loaded when first accessed
- Visual exporters loaded per-mode
- Reduces initial bundle execution time

### 6. Observer Pattern (Partial)
- Progress callbacks for long-running operations
- Event handlers for visualization
- Metrics updates on state changes

### 7. Meta-Reasoning Pattern (v6.0.0)
- **MetaMonitor** tracks session-level strategy performance
- **ModeRouter** uses meta-reasoning insights for adaptive switching
- **SessionManager** integrates with MetaMonitor for thought recording
- Automatic mode switching when effectiveness < 0.3 to prevent thrashing

## Data Flow

### Typical Request Flow:

1. **Client Request** → MCP Protocol (JSON-RPC)
2. **Server Handler** → Input validation (Zod schemas)
3. **Service Layer** → Business logic execution
4. **Session Manager** → State management
5. **Storage Layer** → Persistence
6. **Response** → Formatted result back to client

### Thought Addition Flow:

```
Client
  ↓
add_thought handler
  ↓
ThoughtFactory.createThought()
  ↓
SessionManager.addThought()
  ↓
ThoughtValidator.validate() [async - lazy loads validator]
  ↓
SessionMetricsCalculator.updateMetrics()
  ↓
Repository.save()
  ↓
Response with updated session
```

## Performance Characteristics

### Session Management
- **LRU Cache**: O(1) access for active sessions
- **Metrics Updates**: O(1) incremental calculations
- **Session Limit**: Configurable (default: 100 active sessions)

### Validation (v4.3.0)
- **Lazy Loading**: Validators loaded only when needed
- **Caching**: Loaded validators cached for reuse
- **Preloading**: Optional preload for known high-use modes

### Search
- **Indexing**: O(n) where n = number of thoughts
- **Search**: O(log n) with inverted index
- **Pagination**: O(1) offset-based

### Batch Processing
- **Concurrency**: Configurable (default: 3 concurrent jobs)
- **Queue**: FIFO with priority support
- **Retry**: Exponential backoff

## Scalability Considerations

### Current Limitations
- In-memory session cache (limited by RAM)
- File-based storage (not suitable for millions of sessions)
- Single-process architecture

### Future Enhancements
- Database backend (PostgreSQL, MongoDB)
- Distributed caching (Redis)
- Horizontal scaling with job queues
- WebSocket support for real-time updates

## Security

### Input Validation
- Zod schemas for all MCP tool inputs
- UUID v4 validation for session IDs
- String length limits
- Path traversal prevention

### Data Sanitization
- File operation sanitization
- PII redaction in logs (GDPR-friendly)
- Safe path construction

### Type Safety
- TypeScript strict mode enabled
- **0 type suppressions** (down from 231)
- Comprehensive type definitions for all 27 modes

## Testing Architecture (Phase 11 Complete)

### Test Structure
```
tests/
├── unit/                       # 50+ unit test files
│   ├── session/                # Session management
│   ├── validation/             # Validators
│   ├── services/               # Service layer
│   ├── modes/handlers/         # ModeHandler tests
│   └── proof/                  # Proof decomposition
├── integration/                # Integration tests
│   ├── handlers/               # 7 handler tests
│   ├── tools/                  # 37 MCP tool tests
│   ├── exports/                # 9 export format tests
│   └── scenarios/              # 4 workflow tests
├── edge-cases/                 # 6 edge case files
├── performance/                # 4 stress/perf tests
└── utils/                      # 5 test utilities
```

### Coverage (v8.3.2)
- **Test Files**: 143 total
- **Passing Tests**: 3539
- **Test Categories**: 19 (COR, STD, PAR, MTH, TMP, PRB, CSL, STR, ANL, SCI, ENG, ACD, SES, EXP, HDL, EDG, REG, INT, PRF)
- **TypeScript**: 100% type coverage (0 errors)

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~89,490 |
| TypeScript Files | 221 |
| Type Suppressions | 0 |
| Test Files | 143 |
| Passing Tests | 3539 |
| Thinking Modes | 33 (29 with thought types) |
| Specialized Handlers | 7 |
| MCP Tools | 12 focused + 1 legacy |
| Export Formats | 8 (including native SVG) |
| Visual Exporters | 35+ mode-specific |
| Backup Providers | 4 |
| Reasoning Types | 69 (110 planned) |
| Modules | 16 |
| Total Exports | 1117 (515 re-exports) |
| Circular Dependencies | 55 (all type-only, 0 runtime) |

## Version History

- **v8.3.2** (Current): Phase 11 complete, mode recommendation fix, export improvements
- **v8.3.1**: Codebase cleanup, dependency graph enhancements
- **v8.2.1**: Phase 10 ModeHandler integration fix in ThoughtFactory
- **v8.2.0**: Phase 10 Sprint 2B - Additional mode handlers (Counterfactual, Synthesis, SystemsThinking, Critique)
- **v8.1.0**: Phase 10 Sprint 2 - Core mode handlers (Causal, Bayesian, GameTheory)
- **v8.0.0**: Phase 10 Sprint 1 - ModeHandler infrastructure and registry
- **v7.5.0**: Phase 14 accessible reasoning modes - 12 focused MCP tools
- **v7.4.0**: Phase 13 academic research modes (Synthesis, Argumentation, Critique, Analysis)
- **v7.3.0**: Phase 12 algorithmic reasoning mode with CLRS coverage
- **v7.2.0**: Phase 11 historical computing (Computability, Cryptanalytic, von Neumann Game Theory)
- **v7.0.0**: Phase 8 proof decomposition system, native SVG export
- **v6.0.0**: Meta-reasoning mode, MetaMonitor service, adaptive mode switching
- **v5.0.0**: Fundamental reasoning modes (Inductive, Deductive)
- **v4.3.0**: Visual export modularization, lazy validator loading
- **v3.0.0**: MCP integration

---

*Last Updated*: 2025-12-22
*Architecture Version*: 8.3.2
