# DeepThinking MCP - System Architecture

## System Architecture

DeepThinking MCP is a Model Context Protocol (MCP) server that provides advanced reasoning capabilities through 21 thinking modes with meta-reasoning for strategic oversight. The architecture follows a modular, service-oriented design with clear separation of concerns.

**Version**: 6.1.2 | **Node**: >=18.0.0

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Client (Claude)                    │
└───────────────────┬─────────────────────────────────────────┘
                    │ MCP Protocol (JSON-RPC)
┌───────────────────┴─────────────────────────────────────────┐
│                   MCP Server (index.ts)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              10 Focused Tool Handlers (v5.0.0+)        │ │
│  │  • deepthinking_core     • deepthinking_standard       │ │
│  │  • deepthinking_math     • deepthinking_temporal       │ │
│  │  • deepthinking_causal   • deepthinking_strategic      │ │
│  │  • deepthinking_analytical • deepthinking_session      │ │
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
        │      │ (17 modular files)  │       │
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
   │   Layer   │  │   Layer    │  │  (21 Modes)  │
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
- **Role**: Centralized thought creation for all 18 thinking modes
- **Responsibilities**:
  - Creates mode-specific thought objects
  - Applies mode-specific validation
  - Handles thought revisions and dependencies
- **Modes Supported**: Sequential, Shannon, Mathematics, Physics, Hybrid, Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, Game Theory, Evidential, First Principles, Systems Thinking, Scientific Method, Optimization, Formal Logic

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

### 3. Visual Export System (`src/export/visual/`) - v4.3.0

**Modularized from monolithic visual.ts (2,546 lines) into 17 focused files:**

```
src/export/visual/
├── index.ts              # Unified VisualExporter class
├── types.ts              # VisualFormat, VisualExportOptions
├── utils.ts              # sanitizeId utility
└── [15 mode-specific exporters]
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
    └── formal-logic.ts       # Proof tree export
```

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

Provides 110+ reasoning types organized across 12 categories.

### 12. Type System (`src/types/`)

#### Organized by Domain:
- **core.ts**: Base types, ThinkingMode enum, Thought union type (21 modes)
- **modes/*.ts**: Mode-specific thought types (21 modes including metareasoning.ts)
- **config.ts**: Configuration types
- **session.ts**: Session and validation types
- **events.ts**: Event system types

#### Mode Categories (v6.0.0):
- **Fully Implemented** (13): Sequential, Shannon, Mathematics, Physics, Hybrid, Metareasoning, Recursive, Modal, Stochastic, Constraint, Optimization, Inductive, Deductive
- **Experimental** (8): Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, GameTheory, Evidential, FirstPrinciples, SystemsThinking, ScientificMethod, FormalLogic

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
- Comprehensive type definitions for all 18 modes

## Testing Architecture

### Test Pyramid
```
┌────────────────────┐
│  Integration (7)   │  ← Full workflow tests
├────────────────────┤
│  Unit Tests (36)   │  ← Component tests
├────────────────────┤
│ Critical Path (3)  │  ← SearchEngine, BatchProcessor, BackupManager
└────────────────────┘
```

### Coverage
- **Tests**: 763 passing
- **Test Files**: 36
- **Critical Paths**: 80%+ coverage
- **TypeScript**: 100% type coverage (0 errors)

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~50,900 |
| TypeScript Files | 185 |
| Type Suppressions | 0 |
| Test Files | 36 |
| Tests | 745 |
| Thinking Modes | 21 |
| MCP Tools | 10 |
| Export Formats | 8 |
| Backup Providers | 4 |
| Visual Exporters | 15 mode-specific |
| Reasoning Types | 110+ |

## Version History

- **v6.1.2** (Current): Fixed causal graph exports (nodes/edges preserved in Zod validation)
- **v6.1.1**: Eliminated 24 runtime circular dependencies
- **v6.1.0**: Circular dependency fixes, logger-types.ts extraction
- **v6.0.0**: Meta-reasoning mode, MetaMonitor service, adaptive mode switching, quality metrics
- **v5.0.1**: Mode recommendation bugfixes for philosophical domains
- **v5.0.0**: Fundamental reasoning modes (Inductive, Deductive), deepthinking_core tool
- **v4.4.0**: 10 focused tools with hand-written JSON schemas
- **v4.3.0**: Visual export modularization, lazy validator loading, validation constants, tree-shaking optimizations
- **v4.2.0**: Schema consolidation, tree-shaking configuration
- **v4.1.0**: Token optimization, lazy schema loading
- **v4.0.0**: Tool splitting, major refactoring
- **v3.5.0**: Production-ready architecture, enterprise security
- **v3.4.0**: Taxonomy system, backup management
- **v3.3.0**: Visualization, interactive features
- **v3.2.0**: Advanced reasoning modes
- **v3.1.0**: Search and batch processing
- **v3.0.0**: MCP integration

---

*Last Updated*: 2025-12-02
*Architecture Version*: 6.1.2
