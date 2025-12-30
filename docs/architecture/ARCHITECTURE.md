# DeepThinking MCP - System Architecture

## System Architecture

DeepThinking MCP is a Model Context Protocol (MCP) server that provides advanced reasoning capabilities through 33 thinking modes (29 with dedicated thought types) with meta-reasoning for strategic oversight. The architecture follows a modular, service-oriented design with clear separation of concerns.

**Version**: 9.0.0 | **Node**: >=18.0.0

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Client (Claude)                    │
└───────────────────┬─────────────────────────────────────────┘
                    │ MCP Protocol (JSON-RPC)
┌───────────────────┴─────────────────────────────────────────┐
│                   MCP Server (index.ts)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              13 Focused Tool Handlers (v9.0.0)         │ │
│  │  • deepthinking_core         • deepthinking_standard   │ │
│  │  • deepthinking_mathematics  • deepthinking_temporal   │ │
│  │  • deepthinking_probabilistic • deepthinking_causal    │ │
│  │  • deepthinking_strategic    • deepthinking_analytical │ │
│  │  • deepthinking_scientific   • deepthinking_engineering│ │
│  │  • deepthinking_academic     • deepthinking_session    │ │
│  │  • deepthinking_analyze                                │ │
│  └────────────────────────────────────────────────────────┘ │
└───────┬──────────┬──────────────────────┬───────────────────┘
        │          │                      │
   ┌────▼────┐ ┌───▼──────┐          ┌────▼─────────┐
   │ Thought │ │  Export  │          │   Session    │
   │ Factory │ │ Service  │          │   Manager    │
   └────┬────┘ └────┬─────┘          └─────┬────────┘
        │           │                      │
        │      ┌────▼─────────────────┐    │
        │      │ Visual Exporters     │    │
        │      │ (22 mode-specific)   │    │
        │      │ 14 Builder Classes   │    │
        │      └──────────────────────┘    │
        │                                  │
        └──────────────┬───────────────────┘
                       │
        ┌──────────────┼───────────────┐
        │              │               │
   ┌────▼──────┐  ┌────▼──────┐  ┌────▼─────────┐
   │  Search   │  │ Validation │  │  Type System │
   │   Index   │  │   Layer    │  │  (33 Modes)  │
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
  - Visual diagram generation (Mermaid, DOT, ASCII, SVG)
  - Format-specific transformations
- **Formats**: JSON, Markdown, LaTeX, HTML, Jupyter, Mermaid, DOT, ASCII

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

### 6. Search System (`src/search/`)

#### SearchIndex (`src/search/index.ts`)
- **Role**: In-memory search index with TF-IDF scoring
- **Capabilities**:
  - Text search with tokenization
  - Multi-dimensional filtering (mode, author, domain, taxonomy, dates)
  - Taxonomy-based classification
  - Relevance scoring with TF-IDF
- **Components**:
  - `SearchIndex`: Main index class
  - `Tokenizer`: Text tokenization and frequency analysis

### 7. Tools & Schema System (`src/tools/`)

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

### 8. Taxonomy System (`src/taxonomy/`)

#### Components:
- **TaxonomyClassifier**: Classify thoughts by reasoning type
- **TaxonomyNavigator**: Navigate reasoning type hierarchy
- **SuggestionEngine**: Problem-based mode recommendations
- **MultiModalAnalyzer**: Combined reasoning analysis

Provides 69 reasoning types (110 planned) organized across 12 categories.

### 9. Type System (`src/types/`)

#### Organized by Domain:
- **core.ts**: Base types, ThinkingMode enum (33 modes), Thought union type (29 types)
- **modes/*.ts**: Mode-specific thought types (26 files)
- **config.ts**: Configuration types
- **session.ts**: Session and validation types
- **events.ts**: Event system types

#### Mode Categories (v8.5.0):
- **Core Modes** (5): Sequential, Shannon, Mathematics, Physics, Hybrid
- **Fundamental** (3): Inductive, Deductive, Abductive
- **Causal/Probabilistic** (6): Causal, Bayesian, Counterfactual, Temporal, GameTheory, Evidential
- **Analogical** (2): Analogical, FirstPrinciples
- **Systems/Scientific** (3): SystemsThinking, ScientificMethod, FormalLogic
- **Academic** (4): Synthesis, Argumentation, Critique, Analysis
- **Engineering** (4): Engineering, Computability, Cryptanalytic, Algorithmic
- **Advanced Runtime** (6): MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization

## Architectural Patterns

### 1. Service-Oriented Architecture
- Business logic extracted into focused service classes
- Each service has a single, well-defined responsibility
- Services are reusable and testable in isolation

### 2. Factory Pattern
- ThoughtFactory centralizes thought creation
- Encapsulates mode-specific logic
- Ensures consistency across thought types

### 3. Strategy Pattern (ModeHandler - v8.x)
- Different thinking modes as interchangeable handlers
- ModeHandlerRegistry manages 36 specialized handlers
- Pluggable reasoning algorithms via `ModeHandler` interface

### 4. Lazy Loading Pattern (v4.3.0)
- Validators loaded on-demand via dynamic imports
- Schemas loaded when first accessed
- Visual exporters loaded per-mode
- Reduces initial bundle execution time

### 5. Observer Pattern
- Progress callbacks for long-running operations
- Event handlers for visualization
- Metrics updates on state changes

### 6. Registry Pattern (v8.x)
- ModeHandlerRegistry singleton manages all 36 handlers
- `hasSpecializedHandler(mode)` for implementation checking
- `getHandler(mode)` for handler retrieval with fallback

## Data Flow

### Typical Request Flow:

1. **Client Request** → MCP Protocol (JSON-RPC)
2. **Server Handler** → Input validation (Zod schemas)
3. **Service Layer** → Business logic execution (ThoughtFactory, ExportService)
4. **Session Manager** → State management
5. **Response** → Formatted result back to client

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
- **Search**: TF-IDF scoring with O(n) complexity
- **Filtering**: Multi-dimensional filtering by mode, taxonomy, dates

## Scalability Considerations

### Current Limitations
- In-memory session cache (limited by RAM)
- In-memory search index
- Single-process architecture

### Future Enhancements
- Database backend (PostgreSQL, MongoDB)
- Distributed caching (Redis)
- File-based session persistence
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
- Comprehensive type definitions for all 33 modes

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

### Coverage (v9.0.0)
- **Test Files**: 177 total
- **Passing Tests**: 5,011
- **Test Categories**: 19 (COR, STD, PAR, MTH, TMP, PRB, CSL, STR, ANL, SCI, ENG, ACD, SES, EXP, HDL, EDG, REG, INT, PRF)
- **TypeScript**: 100% type coverage (0 errors)

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~100,600 |
| TypeScript Files | 233 |
| Type Suppressions | 0 |
| Test Files | 177 |
| Passing Tests | 5,011 |
| Thinking Modes | 33 (29 with thought types) |
| Specialized Handlers | 36 (all modes covered) |
| MCP Tools | 13 focused |
| Export Formats | 8 (including native SVG) |
| Visual Exporters | 41 files (22 mode-specific) |
| Builder Classes | 14 fluent APIs |
| Reasoning Types | 69 (110 planned) |
| Mode Validators | 35 |
| Modules | 15 |
| Total Exports | 1,267 (568 re-exports) |
| Circular Dependencies | 55 (all type-only, 0 runtime) |

## Version History

- **v9.0.0** (Current): Phase 15 Radical Simplification - removed ModeRouter, MetaMonitor, backup, batch processing; dead code cleanup
- **v8.5.0**: Phase 13 Visual Exporter Refactoring - 14 fluent builder classes
- **v8.4.0**: Phase 10 Sprint 3 - All 33 modes with specialized handlers
- **v8.3.2**: Phase 11 complete, mode recommendation fix, export improvements
- **v8.0.0**: Phase 10 Sprint 1 - ModeHandler infrastructure and registry
- **v7.5.0**: Phase 14 accessible reasoning modes - 12 focused MCP tools
- **v7.4.0**: Phase 13 academic research modes (Synthesis, Argumentation, Critique, Analysis)
- **v7.3.0**: Phase 12 algorithmic reasoning mode with CLRS coverage
- **v7.2.0**: Phase 11 historical computing (Computability, Cryptanalytic, von Neumann Game Theory)
- **v7.0.0**: Phase 8 proof decomposition system, native SVG export
- **v6.0.0**: Meta-reasoning mode (later simplified in v9.0.0)
- **v5.0.0**: Fundamental reasoning modes (Inductive, Deductive)
- **v4.3.0**: Visual export modularization, lazy validator loading
- **v3.0.0**: MCP integration

---

*Last Updated*: 2025-12-30
*Architecture Version*: 9.0.0
