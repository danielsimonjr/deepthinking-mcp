# DeepThinking MCP - Architecture Overview

## System Architecture

DeepThinking MCP is a Model Context Protocol (MCP) server that provides advanced reasoning capabilities through multiple thinking modes. The architecture follows a modular, service-oriented design with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Client (Claude)                     │
└───────────────────┬─────────────────────────────────────────┘
                    │ MCP Protocol (JSON-RPC)
┌───────────────────┴─────────────────────────────────────────┐
│                   MCP Server (index.ts)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Tool Request Handlers                      │ │
│  │  • add_thought  • create_session  • export_session     │ │
│  │  • get_summary  • switch_mode     • get_recommendations│ │
│  └────────────────────────────────────────────────────────┘ │
└───────┬───────────┬────────────┬──────────┬─────────────────┘
        │           │            │          │
   ┌────▼────┐ ┌───▼──────┐ ┌──▼─────┐ ┌──▼──────────┐
   │ Thought │ │  Export  │ │  Mode  │ │   Session   │
   │ Factory │ │ Service  │ │ Router │ │   Manager   │
   └────┬────┘ └────┬─────┘ └───┬────┘ └──────┬──────┘
        │           │            │             │
        └───────────┴────────────┴─────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
   ┌────▼──────┐              ┌────────▼──────┐
   │  Storage  │              │  Type System  │
   │   Layer   │              │  (18 Modes)   │
   └───────────┘              └───────────────┘
```

## Core Components

### 1. MCP Server (`src/index.ts`)
- **Role**: Entry point and request orchestration
- **Responsibilities**:
  - Handles MCP protocol communication
  - Routes tool requests to appropriate services
  - Validates inputs using Zod schemas
  - Manages server lifecycle

- **Key Reduction**: Reduced from 796 to 311 lines (61%) through service extraction

### 2. Service Layer

#### ThoughtFactory (`src/services/ThoughtFactory.ts`)
- **Role**: Centralized thought creation for all 18 thinking modes
- **Responsibilities**:
  - Creates mode-specific thought objects
  - Applies mode-specific validation
  - Handles thought revisions and dependencies
- **Size**: 243 lines
- **Modes Supported**: Sequential, Shannon, Mathematics, Physics, Hybrid, Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, Game Theory, Evidential, First Principles, Systems Thinking, Scientific Method, Optimization, Formal Logic

#### ExportService (`src/services/ExportService.ts`)
- **Role**: Unified export logic for multiple formats
- **Responsibilities**:
  - Session export in 6+ formats
  - Visual diagram generation (Mermaid, DOT, ASCII)
  - Format-specific transformations
- **Size**: 360 lines
- **Formats**: JSON, Markdown, LaTeX, HTML, Jupyter, Mermaid, DOT, ASCII

#### ModeRouter (`src/services/ModeRouter.ts`)
- **Role**: Mode switching and intelligent recommendations
- **Responsibilities**:
  - Switches thinking modes mid-session
  - Provides mode recommendations based on problem characteristics
  - Integrates with taxonomy system
- **Size**: 195 lines

### 3. Session Management (`src/session/`)

#### SessionManager (`src/session/manager.ts`)
- **Role**: Core session lifecycle management
- **Responsibilities**:
  - Create, retrieve, update, delete sessions
  - Manage session state and metadata
  - Handle thought additions
  - LRU cache for active sessions
- **Size**: 542 lines (reduced from ~700 through metrics extraction)

#### SessionMetricsCalculator (`src/session/SessionMetricsCalculator.ts`)
- **Role**: Session metrics calculation
- **Responsibilities**:
  - Initialize metrics with O(1) operations
  - Update metrics incrementally (O(1) instead of O(n))
  - Track mode-specific metrics
  - Calculate cache statistics
- **Size**: 241 lines

### 4. Storage Layer

#### Repository Pattern (`src/repository/`)
- **ISessionRepository**: Domain-oriented interface
- **FileSessionRepository**: Persistent storage implementation
- **MemorySessionRepository**: In-memory storage for testing

Benefits:
- Testability through interface abstraction
- Flexibility to swap storage backends
- Query methods (findByMode, listMetadata)

### 5. Search & Discovery (`src/search/`)

#### SearchEngine (`src/search/engine.ts`)
- **Role**: Full-text search and filtering
- **Capabilities**:
  - Text search with tokenization
  - Multi-dimensional filtering (mode, author, domain, taxonomy, dates)
  - Sorting (relevance, date, title)
  - Pagination
  - Faceted results
- **Index**: In-memory inverted index with TF-IDF scoring

### 6. Batch Processing (`src/batch/`)

#### BatchProcessor (`src/batch/processor.ts`)
- **Role**: Asynchronous batch job execution
- **Features**:
  - Job types: export, import, analyze, validate
  - Concurrency control (configurable max concurrent jobs)
  - Progress tracking
  - Retry logic for failed items
  - Job queue management

### 7. Backup & Recovery (`src/backup/`)

#### BackupManager (`src/backup/backup-manager.ts`)
- **Role**: Data backup and restoration
- **Features**:
  - Multiple providers (Local, S3, GCS, Azure)
  - Compression (gzip, brotli)
  - Encryption support
  - Backup types (full, incremental, differential)
  - Checksum validation (SHA256)

### 8. Taxonomy System (`src/taxonomy/`)

#### Components:
- **TaxonomyNavigator**: Navigate reasoning type hierarchy
- **SuggestionEngine**: Problem-based mode recommendations
- **AdaptiveModeSelector**: Intelligent mode selection
- **MultiModalAnalyzer**: Combined reasoning analysis

Provides 30+ reasoning types organized in a hierarchical taxonomy.

### 9. Visualization (`src/visualization/`)

#### Generators:
- **MermaidGenerator**: Flowcharts, sequence diagrams, mindmaps
- **VisualExporter**: DOT graphs, ASCII trees
- **InteractiveMermaid**: Animations and event handlers

### 10. Type System (`src/types/`)

#### Organized by Domain:
- **core.ts**: Base types, ThinkingMode enum, Thought union type
- **modes/*.ts**: Mode-specific thought types (18 modes)
- **config.ts**: Configuration types
- **events.ts**: Event system types

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

### 5. Observer Pattern (Partial)
- Progress callbacks for long-running operations
- Event handlers for visualization
- Metrics updates on state changes

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
- 0 type errors, 2 suppressions (down from 231)
- Comprehensive type definitions for all 18 modes

## Testing Architecture

### Test Pyramid
```
┌────────────────────┐
│  Integration (7)   │  ← Full workflow tests
├────────────────────┤
│  Unit Tests (34)   │  ← Component tests
├────────────────────┤
│ Critical Path (3)  │  ← SearchEngine, BatchProcessor, BackupManager
└────────────────────┘
```

### Coverage
- **Overall**: 93.5% (608/650 tests passing)
- **Critical Paths**: 80%+ coverage
- **TypeScript**: 100% type coverage (0 errors)

## Key Metrics

- **Total Lines of Code**: ~25,000+ lines
- **Type Suppressions**: 2 (down from 231, 99.1% reduction)
- **Test Files**: 34
- **Thinking Modes**: 18
- **Export Formats**: 8
- **Backup Providers**: 4
- **Service Classes**: 6 major services

## Version History

- **v3.4.5** (Current): Architecture refactoring, test expansion, type suppression cleanup
- **v3.4.0**: Taxonomy system, backup management
- **v3.3.0**: Visualization, interactive features
- **v3.2.0**: Advanced reasoning modes
- **v3.1.0**: Search and batch processing
- **v3.0.0**: MCP integration

---

*Last Updated*: 2025-11-25
*Architecture Version*: 3.4.5
