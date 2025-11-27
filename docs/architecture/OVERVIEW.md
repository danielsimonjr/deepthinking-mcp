# DeepThinking MCP - Codebase Overview

## Project Summary

DeepThinking MCP is a TypeScript-based **Model Context Protocol (MCP) server** that provides advanced reasoning capabilities through 18 specialized thinking modes. The system enables AI assistants to perform structured, multi-step reasoning with taxonomy-based classification, enterprise security features, and comprehensive export capabilities.

**Version**: 4.3.0 | **Node**: >=18.0.0 | **License**: MIT

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~48,800 |
| TypeScript Files | 182 |
| Test Files | 36 |
| Passing Tests | 763 |
| Type Suppressions | 0 |
| Thinking Modes | 18 |
| Export Formats | 8 |
| Reasoning Types | 110+ |
| Visual Exporters | 15 |

---

## Project Structure

```
deepthinking-mcp/
├── src/                    # Source code (~48,800 lines)
│   ├── index.ts            # MCP server entry point
│   ├── types/              # Type definitions (18 modes)
│   ├── services/           # Business logic layer
│   ├── session/            # Session management
│   ├── validation/         # Zod schemas & validators
│   ├── export/             # Export system (8 formats)
│   ├── taxonomy/           # 110+ reasoning types
│   ├── search/             # Full-text search engine
│   ├── batch/              # Batch processing
│   ├── backup/             # Backup & recovery
│   ├── cache/              # Caching strategies
│   ├── rate-limit/         # Rate limiting
│   ├── repositories/       # Storage abstraction
│   ├── modes/              # Mode implementations
│   └── tools/              # MCP tool definitions
├── tests/                  # Test suite (36 files, 763 tests)
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── docs/                   # Documentation
│   └── architecture/       # Architecture docs
├── dist/                   # Compiled output
└── package.json            # Project configuration
```

---

## Core Source Directories

### `src/types/` - Type System

Comprehensive TypeScript definitions for the 18 reasoning modes:

```
src/types/
├── core.ts                 # ThinkingMode enum, Thought union type
├── config.ts               # Configuration types
├── session.ts              # Session & validation types
├── events.ts               # Event system types
└── modes/                  # Mode-specific types
    ├── sequential.ts       # Sequential thinking
    ├── shannon.ts          # Information theory
    ├── mathematics.ts      # Mathematical reasoning
    ├── physics.ts          # Physical modeling
    ├── causal.ts           # Causal inference
    ├── bayesian.ts         # Bayesian reasoning
    ├── game-theory.ts      # Game theoretic analysis
    └── [11 more modes]
```

### `src/services/` - Business Logic Layer

Core services extracted from the entry point:

| Service | File | Responsibility |
|---------|------|----------------|
| **ThoughtFactory** | `ThoughtFactory.ts` | Mode-specific thought creation and validation |
| **ExportService** | `ExportService.ts` | Multi-format export (8 formats) |
| **ModeRouter** | `ModeRouter.ts` | Mode switching and recommendations |

### `src/session/` - Session Management

```
src/session/
├── manager.ts                    # SessionManager - lifecycle management
├── SessionMetricsCalculator.ts   # O(1) incremental metrics
├── storage.ts                    # Storage abstraction
└── persistence.ts                # Persistence layer
```

### `src/validation/` - Validation System (v4.3.0)

```
src/validation/
├── index.ts              # Public exports
├── constants.ts          # IssueSeverity, IssueCategory, ValidationThresholds
├── validator.ts          # Main validation orchestrator
├── schemas.ts            # Zod schemas
└── validators/
    ├── base.ts           # BaseValidator with reusable methods
    ├── registry.ts       # Lazy-loading ValidatorRegistry
    └── modes/            # 18 mode-specific validators
```

### `src/export/` - Export System

```
src/export/
├── index.ts              # Unified ExportService
├── visual/               # Visual exporters (17 modular files)
│   ├── index.ts          # VisualExporter class
│   ├── types.ts          # VisualFormat, VisualExportOptions
│   ├── utils.ts          # sanitizeId utility
│   └── [15 mode-specific exporters]
└── formats/              # Document format exporters
    ├── markdown.ts
    ├── latex.ts
    ├── html.ts
    ├── jupyter.ts
    └── json.ts
```

### `src/taxonomy/` - Taxonomy System

```
src/taxonomy/
├── reasoning-types.ts       # 110+ reasoning type definitions
├── taxonomy-navigator.ts    # Hierarchy navigation
├── suggestion-engine.ts     # Mode recommendations
├── adaptive-mode.ts         # Intelligent mode selection
└── multi-modal.ts           # Combined reasoning analysis
```

---

## The 18 Thinking Modes

### Core Modes (Full Runtime)
| Mode | Purpose |
|------|---------|
| **Sequential** | Step-by-step linear reasoning |
| **Shannon** | Information theory, entropy analysis |
| **Mathematics** | Formal proofs, theorems |
| **Physics** | Physical models, conservation laws |
| **Hybrid** | Multi-approach combination |

### Advanced Modes (Full Runtime)
| Mode | Purpose |
|------|---------|
| **Metareasoning** | Reasoning about reasoning |
| **Recursive** | Self-referential analysis |
| **Modal** | Possibility/necessity logic |
| **Stochastic** | Probabilistic reasoning |
| **Constraint** | Constraint satisfaction |
| **Optimization** | Objective function optimization |

### Analytical Modes
| Mode | Purpose |
|------|---------|
| **Causal** | Cause-effect relationships |
| **Bayesian** | Probability updates |
| **Counterfactual** | "What-if" scenarios |
| **Temporal** | Time-based reasoning |

### Additional Modes
| Mode | Purpose |
|------|---------|
| **Abductive** | Hypothesis generation |
| **Analogical** | Reasoning by analogy |
| **Game Theory** | Strategic decision-making |
| **Evidential** | Dempster-Shafer theory |
| **First Principles** | Fundamental decomposition |
| **Systems Thinking** | Holistic system analysis |
| **Scientific Method** | Hypothesis → experiment → conclusion |
| **Formal Logic** | Formal logical proofs |

---

## Key Files Reference

### Entry Points
| File | Purpose |
|------|---------|
| `src/index.ts` | MCP server entry, tool handlers |
| `dist/index.js` | Compiled output (runtime entry) |

### Core Types
| File | Purpose |
|------|---------|
| `src/types/core.ts` | ThinkingMode enum, Thought union type, type guards |
| `src/types/session.ts` | Session, ValidationIssue types |

### Services
| File | Purpose |
|------|---------|
| `src/services/ThoughtFactory.ts` | Thought creation for all 18 modes |
| `src/services/ExportService.ts` | Export orchestration |
| `src/services/ModeRouter.ts` | Mode switching logic |

### Session
| File | Purpose |
|------|---------|
| `src/session/manager.ts` | SessionManager class |
| `src/session/SessionMetricsCalculator.ts` | Metrics calculation |

### Validation
| File | Purpose |
|------|---------|
| `src/validation/constants.ts` | Centralized validation constants |
| `src/validation/validators/base.ts` | Reusable validation methods |
| `src/validation/validators/registry.ts` | Lazy-loading validator registry |

### Search & Batch
| File | Purpose |
|------|---------|
| `src/search/engine.ts` | Full-text search with TF-IDF |
| `src/batch/processor.ts` | Batch job execution |

### Storage
| File | Purpose |
|------|---------|
| `src/repositories/session.ts` | ISessionRepository interface |
| `src/repositories/file-session.ts` | File-based implementation |
| `src/repositories/memory-session.ts` | In-memory implementation |

---

## Architecture Patterns

### 1. Service-Oriented Architecture
Business logic extracted into focused service classes with single responsibilities.

### 2. Repository Pattern
Storage abstraction through `ISessionRepository` interface enables swappable backends.

### 3. Factory Pattern
`ThoughtFactory` centralizes mode-specific thought creation.

### 4. Strategy Pattern
Different thinking modes implemented as interchangeable strategies.

### 5. Lazy Loading Pattern (v4.3.0)
- Validators loaded on-demand via dynamic imports
- Schemas loaded when first accessed
- Visual exporters loaded per-mode

### 6. Observer Pattern
Progress callbacks and event handlers for async operations.

---

## Build & Development

### Commands
```bash
npm run build        # Compile with tsup → dist/
npm run dev          # Watch mode compilation
npm run typecheck    # Type check without emitting
npm run lint         # ESLint checks
npm run format       # Prettier auto-format
npm test             # Run tests (watch mode)
npm run test:run     # Run tests once (CI)
npm run test:coverage # Coverage reports
```

### Configuration Files
| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration with path aliases |
| `tsup.config.ts` | Build configuration (tree-shaking enabled) |
| `vitest.config.ts` | Test configuration |
| `.eslintrc.json` | Linting rules |
| `.prettierrc` | Formatting rules |

### Path Aliases
Configured in `tsconfig.json`:
- `@/*` → `src/*`
- `@types/*` → `src/types/*`
- `@validation/*` → `src/validation/*`
- `@session/*`, `@search/*`, `@batch/*`, `@export/*`, `@taxonomy/*`

---

## MCP Integration

### Tool Categories

**Session Management**: `create_session`, `add_thought`, `get_session`, `list_sessions`, `delete_session`

**Analysis & Export**: `get_summary`, `export_session`, `get_recommendations`, `switch_mode`

**Search & Discovery**: `search_sessions`

**Batch Operations**: `batch_submit`, `batch_status`

### Configuration
```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "node",
      "args": ["/path/to/deepthinking-mcp/dist/index.js"]
    }
  }
}
```

---

## Export Capabilities

### Document Formats
| Format | Extension | Use Case |
|--------|-----------|----------|
| JSON | `.json` | API integration, backup |
| Markdown | `.md` | Documentation |
| LaTeX | `.tex` | Academic papers |
| HTML | `.html` | Web display |
| Jupyter | `.ipynb` | Interactive analysis |

### Visual Formats
| Format | Output | Use Case |
|--------|--------|----------|
| Mermaid | Flowcharts | Documentation |
| DOT | GraphViz graphs | Visualization tools |
| ASCII | Text diagrams | Terminal display |

---

## Testing

### Test Structure
```
tests/
├── unit/                   # 36 unit test files
│   ├── session/            # Session management tests
│   ├── validation/         # Validator tests
│   ├── services/           # Service layer tests
│   └── modes/              # Mode-specific tests
└── integration/            # 7 integration tests
```

### Coverage
- **Unit Tests**: 36 files
- **Integration Tests**: 7 files
- **Total Tests**: 763 passing
- **Critical Paths**: 80%+ coverage

---

## Further Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture
- **[COMPONENTS.md](COMPONENTS.md)** - Component deep-dive
- **[DATA_FLOW.md](DATA_FLOW.md)** - Data flow diagrams
- **[CHANGELOG.md](../../CHANGELOG.md)** - Version history

---

*Last Updated*: 2025-11-27
*Version*: 4.3.0
