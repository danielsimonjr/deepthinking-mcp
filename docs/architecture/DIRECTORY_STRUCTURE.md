# Directory Structure Guide

**Version**: 8.2.1 | **Last Updated**: 2025-12-15

This document describes the purpose and organization of each directory in the DeepThinking MCP codebase.

---

## Overview

The codebase is organized into **16 modules** with **197 TypeScript files** totaling approximately **80,336 lines of code**.

```
src/
├── cache/             # Caching strategies (6 files)
├── config/            # Centralized configuration (1 file)
├── export/            # Export services (27 files)
│   └── visual/        # Per-mode visual exporters
├── interfaces/        # Dependency injection interfaces (2 files)
├── modes/             # Advanced reasoning implementations (7 files)
├── proof/             # Proof decomposition & analysis (8 files)
├── repositories/      # Data access layer (4 files)
├── search/            # Full-text search engine (5 files)
├── services/          # Business logic layer (5 files)
├── session/           # Session management (7 files)
│   └── storage/       # Storage adapters
├── taxonomy/          # Reasoning type classification (7 files)
├── tools/             # MCP tool definitions (16 files)
│   └── schemas/       # Zod validation schemas
├── types/             # Type definitions (21 files)
│   └── modes/         # Per-mode type definitions
├── utils/             # Utility functions (6 files)
├── validation/        # Input validation (35 files)
│   └── validators/    # Mode-specific validators
└── index.ts           # Entry point
```

---

## Directory Descriptions

### `cache/` - Caching Strategies
**Files**: 6 | **Purpose**: In-memory caching with multiple eviction strategies

- `lru.ts` - Least Recently Used cache implementation
- `lfu.ts` - Least Frequently Used cache implementation
- `fifo.ts` - First-In-First-Out cache implementation
- `types.ts` - Cache interfaces and configuration types
- `index.ts` - Barrel export

**Used by**: Session management, validation caching

---

### `config/` - Centralized Configuration
**Files**: 1 | **Purpose**: Environment-based configuration management

- `index.ts` - Server configuration with environment variable support

**Key exports**: `getConfig()`, `updateConfig()`, `ServerConfig`

---

### `export/` - Export Services
**Files**: 27 | **Purpose**: Multi-format export for thinking sessions

#### Root Files
- `latex.ts` - LaTeX document generation
- `latex-mermaid-integration.ts` - LaTeX with embedded diagrams
- `visual.ts` - Core visual export coordinator

#### `export/visual/` - Per-Mode Visual Exporters
One file per reasoning mode providing Mermaid, DOT, and ASCII diagram generation:
- `sequential.ts`, `shannon.ts`, `mathematics.ts`, `physics.ts`, etc.
- `index.ts` - VisualExporter class coordinating all exporters
- `utils.ts` - Shared utilities for diagram generation
- `proof-decomposition.ts` - Proof structure visualization

**Pattern**: Each mode has its own exporter file to:
- Enable tree-shaking (unused modes aren't bundled)
- Simplify mode-specific customization
- Reduce merge conflicts

---

### `interfaces/` - Dependency Injection
**Files**: 2 | **Purpose**: Interface definitions for loose coupling

- `ILogger.ts` - Logger interface for DI
- `index.ts` - Barrel export with cache interface re-export

---

### `modes/` - Advanced Reasoning Implementations
**Files**: 18+ | **Purpose**: Runtime logic for complex reasoning modes and specialized handlers

#### Reasoning Engines
- `meta-reasoning.ts` - Self-reflection and strategy selection
- `recursive-reasoning.ts` - Recursive problem decomposition
- `modal-reasoning.ts` - Possibility and necessity reasoning
- `stochastic-reasoning.ts` - Probabilistic state transitions
- `constraint-reasoning.ts` - Constraint satisfaction
- `optimization-reasoning.ts` - Optimization strategies
- `mathematics-reasoning.ts` - Mathematical proof analysis

#### `modes/handlers/` - Specialized Mode Handlers (v8.x)
7 handlers implementing the ModeHandler pattern:
- `ModeHandler.ts` - Handler interface definition
- `ModeHandlerRegistry.ts` - Singleton registry for handler management
- `GenericModeHandler.ts` - Fallback handler for non-specialized modes
- `CausalHandler.ts` - Causal graph validation, cycle detection
- `BayesianHandler.ts` - Auto posterior calculation
- `GameTheoryHandler.ts` - Payoff matrix validation, Nash equilibria
- `CounterfactualHandler.ts` - World state tracking
- `SynthesisHandler.ts` - Source coverage, theme extraction
- `SystemsThinkingHandler.ts` - 8 Systems Archetypes detection
- `CritiqueHandler.ts` - 6 Socratic question categories

---

### `proof/` - Proof Decomposition
**Files**: 8 | **Purpose**: Mathematical proof analysis and validation

- `decomposer.ts` - Breaks proofs into atomic statements
- `dependency-graph.ts` - Builds statement dependency DAGs
- `gap-analyzer.ts` - Identifies missing proof steps
- `assumption-tracker.ts` - Tracks explicit/implicit assumptions
- `inconsistency-detector.ts` - Finds logical contradictions
- `circular-detector.ts` - Detects circular reasoning
- `patterns/warnings.ts` - Common proof anti-patterns

---

### `repositories/` - Data Access Layer
**Files**: 4 | **Purpose**: Repository pattern for session storage

- `ISessionRepository.ts` - Repository interface
- `MemorySessionRepository.ts` - In-memory implementation
- `FileSessionRepository.ts` - File system implementation
- `index.ts` - Barrel export

---

### `search/` - Full-Text Search
**Files**: 5 | **Purpose**: Session and thought search with faceted filtering

- `engine.ts` - Main search engine implementation
- `tokenizer.ts` - Text tokenization and normalization
- `types.ts` - Search query and result types
- `index.ts` - Barrel export
- `index.export.ts` - Public API exports

---

### `services/` - Business Logic Layer
**Files**: 5 | **Purpose**: Core application services

- `ThoughtFactory.ts` - Creates mode-specific thought objects
- `ExportService.ts` - Coordinates all export formats
- `ModeRouter.ts` - Mode switching and recommendations
- `MetaMonitor.ts` - Performance monitoring
- `SessionMetricsCalculator.ts` - Session analytics

---

### `session/` - Session Management
**Files**: 7 | **Purpose**: Thinking session lifecycle management

- `manager.ts` - SessionManager class (main API)
- `persistence.ts` - Session save/load operations
- `types.ts` - Session-specific types

#### `session/storage/` - Storage Adapters
- `interface.ts` - Storage interface
- `file-store.ts` - File system storage

---

### `taxonomy/` - Reasoning Classification
**Files**: 7 | **Purpose**: 69 reasoning types across 12 categories

- `reasoning-types.ts` - All reasoning type definitions
- `classifier.ts` - Classifies thoughts by reasoning type
- `suggestion-engine.ts` - Suggests appropriate reasoning types
- `adaptive-selector.ts` - Context-aware type selection
- `navigator.ts` - Taxonomy navigation utilities
- `multi-modal-analyzer.ts` - Cross-mode analysis

---

### `tools/` - MCP Tool Definitions
**Files**: 16 | **Purpose**: Model Context Protocol tool schemas

- `thinking.ts` - Legacy deepthinking tool (deprecated)
- `definitions.ts` - New focused tool definitions
- `json-schemas.ts` - JSON Schema exports

#### `tools/schemas/` - Zod Validation Schemas
- `base.ts` - Shared base schemas
- `shared.ts` - Common field schemas
- `version.ts` - Version information

#### `tools/schemas/modes/` - Per-Category Schemas
- `core.ts` - Core modes (sequential, shannon, hybrid)
- `analytical.ts` - Analytical modes
- `causal.ts` - Causal reasoning modes
- `probabilistic.ts` - Probabilistic modes
- `scientific.ts` - Scientific method modes
- `strategic.ts` - Strategic reasoning modes
- `temporal.ts` - Temporal reasoning modes

---

### `types/` - Type Definitions
**Files**: 21 | **Purpose**: TypeScript type definitions

- `core.ts` - ThinkingMode enum, Thought union type, base interfaces
- `session.ts` - Session-related types
- `index.ts` - Barrel export

#### `types/modes/` - Per-Mode Types
One file per reasoning mode with specific thought interfaces:
- `sequential.ts`, `shannon.ts`, `mathematics.ts`, etc.
- `recommendations.ts` - Mode recommendation types

**Pattern**: Separating mode types:
- Enables type-only imports (erased at runtime)
- Prevents circular dependency issues
- Allows independent mode type evolution

---

### `utils/` - Utility Functions
**Files**: 6 | **Purpose**: Shared utility functions

- `errors.ts` - Custom error classes (ValidationError, etc.)
- `logger.ts` - Logging implementation
- `logger-types.ts` - Logger type definitions
- `log-sanitizer.ts` - Sensitive data redaction
- `sanitization.ts` - Input sanitization and escaping
- `type-guards.ts` - Runtime type checking utilities

---

### `validation/` - Input Validation
**Files**: 35 | **Purpose**: Zod-based input validation

- `validator.ts` - Main validator class
- `schemas.ts` - Core validation schemas
- `cache.ts` - Validation result caching
- `constants.ts` - Validation constants

#### `validation/validators/modes/` - Per-Mode Validators
One file per reasoning mode with specific validation rules:
- 27 mode validator files
- Complex modes have extensive validation (e.g., `formallogic.ts`: 500+ lines)

---

## Per-Mode File Pattern Rationale

Several directories have many files following a "one file per mode" pattern:

| Directory | Files | Reason |
|-----------|-------|--------|
| `types/modes/` | 18 | Type-only imports prevent runtime overhead |
| `export/visual/` | 23 | Tree-shakeable mode-specific exporters |
| `validation/validators/modes/` | 27 | Mode-specific validation complexity |
| `tools/schemas/modes/` | 9 | Grouped by reasoning category |

**Benefits**:
1. **Easy navigation**: Find mode → find file
2. **Focused diffs**: PRs touch only relevant files
3. **Reduced conflicts**: Parallel mode development
4. **Tree-shaking**: Unused modes excluded from bundle

---

## Dependency Flow

```mermaid
graph TD
    subgraph "Entry"
        INDEX[index.ts]
    end

    subgraph "Tools"
        TOOLS[tools/]
    end

    subgraph "Services"
        SERVICES[services/]
        SESSION[session/]
    end

    subgraph "Core"
        TYPES[types/]
        VALIDATION[validation/]
    end

    subgraph "Features"
        EXPORT[export/]
        SEARCH[search/]
        TAXONOMY[taxonomy/]
        PROOF[proof/]
        MODES[modes/]
    end

    subgraph "Infrastructure"
        REPOS[repositories/]
        CACHE[cache/]
        UTILS[utils/]
        CONFIG[config/]
    end

    INDEX --> TOOLS
    INDEX --> SERVICES
    INDEX --> TYPES

    TOOLS --> VALIDATION
    TOOLS --> TYPES

    SERVICES --> SESSION
    SERVICES --> EXPORT
    SERVICES --> MODES

    SESSION --> REPOS
    SESSION --> CACHE

    EXPORT --> TYPES
    SEARCH --> TYPES
    TAXONOMY --> TYPES
    PROOF --> TYPES
    MODES --> TYPES

    VALIDATION --> TYPES
    REPOS --> TYPES
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Total TypeScript files | 197 |
| Total modules | 16 |
| Lines of code | ~80,336 |
| Reasoning modes | 33 |
| Specialized handlers | 7 |
| Visual exporters | 35+ |
| Mode validators | 31+ |
| Runtime circular deps | 0 |
| Type-only circular deps | 41 (safe) |

---

*Updated for Phase 10 ModeHandler Architecture (v8.2.1)*
