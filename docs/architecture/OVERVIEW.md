# DeepThinking MCP - Codebase Overview

## Project Summary

DeepThinking MCP is a TypeScript-based **Model Context Protocol (MCP) server** that provides advanced reasoning capabilities through 27 specialized thinking modes (23 with dedicated thought types). The system enables AI assistants to perform structured, multi-step reasoning with taxonomy-based classification, meta-reasoning for strategic oversight, enterprise security features, proof decomposition for mathematical reasoning, and comprehensive export capabilities including native SVG generation.

**Version**: 7.2.0 | **Node**: >=18.0.0 | **License**: MIT

---

## What's New in v7.2.0

- **Phase 11: Historical Computing Extensions** - Tributes to Turing & von Neumann
- **Computability Mode** - Turing machines, decidability proofs, reductions, diagonalization arguments
- **Cryptanalytic Mode** - Turing's deciban system, Banburismus analysis, frequency analysis, key space elimination
- **Extended Game Theory** - von Neumann's minimax theorem, cooperative games, Shapley value calculations

## What's New in v7.0.0

- **Phase 8: Proof Decomposition System** - Break proofs into atomic statements, detect gaps, track assumptions
- **Native SVG Export** - Direct SVG generation without external tools
- **MathematicsReasoningEngine** - Advanced mathematical analysis
- **InconsistencyDetector** - Logical inconsistency detection

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~58,000 |
| TypeScript Files | 178 |
| Test Files | 40 |
| Passing Tests | 792+ |
| Type Suppressions | 0 |
| Thinking Modes | 27 (23 with thought types) |
| MCP Tools | 10 focused + 1 legacy |
| Export Formats | 8 (+ native SVG) |
| Visual Formats | 4 (mermaid, dot, ascii, svg) |
| Reasoning Types | 69 (110 planned) |
| Visual Exporters | 21 mode-specific |
| Total Exports | 888 |
| Modules | 16 |

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

Comprehensive TypeScript definitions for 27 reasoning modes (23 with dedicated thought types):

```
src/types/
├── core.ts                 # ThinkingMode enum (27 modes), Thought union type (23 types)
├── config.ts               # Configuration types
├── session.ts              # Session & validation types
├── events.ts               # Event system types
└── modes/                  # Mode-specific types (19 files)
    ├── sequential.ts       # Sequential thinking
    ├── shannon.ts          # Information theory
    ├── mathematics.ts      # Mathematical reasoning
    ├── physics.ts          # Physical modeling
    ├── causal.ts           # Causal inference
    ├── bayesian.ts         # Bayesian reasoning
    ├── gametheory.ts       # Game theoretic analysis + von Neumann extensions (v7.2.0)
    ├── metareasoning.ts    # Meta-reasoning (v6.0.0)
    ├── computability.ts    # Turing machines, decidability (v7.2.0)
    ├── cryptanalytic.ts    # Turing's deciban system (v7.2.0)
    └── [9 more modes]
```

### `src/services/` - Business Logic Layer

Core services extracted from the entry point:

| Service | File | Responsibility |
|---------|------|----------------|
| **ThoughtFactory** | `ThoughtFactory.ts` | Mode-specific thought creation and validation |
| **ExportService** | `ExportService.ts` | Multi-format export (8 formats) |
| **ModeRouter** | `ModeRouter.ts` | Mode switching, recommendations, and adaptive switching |
| **MetaMonitor** | `MetaMonitor.ts` | Session tracking, strategy evaluation, meta-reasoning insights (v6.0.0) |

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
    └── modes/            # 25+ mode-specific validators
```

### `src/export/` - Export System

```
src/export/
├── index.ts              # Unified ExportService
├── visual/               # Visual exporters (22 files)
│   ├── index.ts          # VisualExporter class
│   ├── types.ts          # VisualFormat, VisualExportOptions
│   ├── utils.ts          # sanitizeId utility
│   └── [19 mode-specific exporters]
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
├── reasoning-types.ts       # 69 reasoning type definitions (110 planned)
├── navigator.ts             # Hierarchy navigation (TaxonomyNavigator)
├── suggestion-engine.ts     # Mode recommendations
├── adaptive-mode.ts         # Intelligent mode selection
└── multi-modal.ts           # Combined reasoning analysis
```

---

## The 27 Thinking Modes

The server supports 27 reasoning modes organized into categories:
- **Core Modes (5)**: Sequential, Shannon, Mathematics, Physics, Hybrid
- **Historical Computing (2)**: Computability (Turing), Cryptanalytic (Turing) - *v7.2.0*
- **Advanced Runtime Modes (6)**: Metareasoning, Recursive, Modal, Stochastic, Constraint, Optimization
- **Fundamental Modes (2)**: Inductive, Deductive
- **Experimental Modes (12)**: Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, Game Theory (+ von Neumann extensions), Evidential, First Principles, Systems Thinking, Scientific Method, Formal Logic

### Core Reasoning Modes (Fundamental) - v5.0.0+
| Mode | Purpose | Tool |
|------|---------|------|
| **Inductive** | Specific observations → general principles | `deepthinking_core` |
| **Deductive** | General principles → specific conclusions | `deepthinking_core` |
| **Abductive** | Inference to best explanation | `deepthinking_core` |

### Standard Workflow Modes (Full Runtime)
| Mode | Purpose | Tool |
|------|---------|------|
| **Sequential** | Step-by-step linear reasoning | `deepthinking_standard` |
| **Shannon** | Information theory, entropy analysis | `deepthinking_standard` |
| **Hybrid** | Multi-approach combination | `deepthinking_standard` |

### Math/Physics Modes
| Mode | Purpose | Tool |
|------|---------|------|
| **Mathematics** | Formal proofs, theorems | `deepthinking_math` |
| **Physics** | Physical models, conservation laws | `deepthinking_math` |

### Advanced Runtime Modes (Full Runtime)
| Mode | Purpose | Tool |
|------|---------|------|
| **Metareasoning** | Strategic oversight of reasoning (v6.0.0) | `deepthinking_analytical` |
| **Recursive** | Divide-and-conquer, subproblem decomposition | (runtime only) |
| **Modal** | Possibility/necessity logic | (runtime only) |
| **Stochastic** | Probabilistic state transitions | (runtime only) |
| **Constraint** | Constraint satisfaction problems | (runtime only) |
| **Optimization** | Objective function optimization | `deepthinking_strategic` |

### Analytical & Causal Modes
| Mode | Purpose | Tool |
|------|---------|------|
| **Causal** | Cause-effect relationships | `deepthinking_causal` |
| **Counterfactual** | "What-if" scenarios | `deepthinking_causal` |
| **Bayesian** | Probability updates | `deepthinking_probabilistic` |
| **Evidential** | Dempster-Shafer theory | `deepthinking_probabilistic` |
| **Temporal** | Time-based reasoning | `deepthinking_temporal` |

### Scientific & Systematic Modes
| Mode | Purpose | Tool |
|------|---------|------|
| **Analogical** | Reasoning by analogy | `deepthinking_analytical` |
| **First Principles** | Fundamental decomposition | `deepthinking_analytical` |
| **Game Theory** | Strategic decision-making + von Neumann extensions | `deepthinking_strategic` |
| **Systems Thinking** | Holistic system analysis | `deepthinking_scientific` |
| **Scientific Method** | Hypothesis → experiment → conclusion | `deepthinking_scientific` |
| **Formal Logic** | Formal logical proofs | `deepthinking_scientific` |

### Historical Computing Modes (v7.2.0) - Turing & von Neumann
| Mode | Purpose | Tool |
|------|---------|------|
| **Computability** | Turing machines, decidability, reductions, diagonalization | `deepthinking_math` |
| **Cryptanalytic** | Deciban evidence system, Banburismus, frequency analysis | `deepthinking_analytical` |

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
| `src/services/ThoughtFactory.ts` | Thought creation for all 27 modes |
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

### The 10 Focused Tools (v5.0.0+)

| Tool | Description | Modes Supported |
|------|-------------|-----------------|
| `deepthinking_core` | Fundamental reasoning | inductive, deductive, abductive |
| `deepthinking_standard` | Standard workflows | sequential, shannon, hybrid |
| `deepthinking_math` | Mathematical/physical | mathematics, physics |
| `deepthinking_temporal` | Time-based reasoning | temporal |
| `deepthinking_probabilistic` | Probability reasoning | bayesian, evidential |
| `deepthinking_causal` | Causal analysis | causal, counterfactual |
| `deepthinking_strategic` | Strategic decision-making | gametheory, optimization |
| `deepthinking_analytical` | Analytical reasoning | analogical, firstprinciples, metareasoning |
| `deepthinking_scientific` | Scientific methods | scientificmethod, systemsthinking, formallogic |
| `deepthinking_session` | Session management | All (create, list, delete, export) |

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

### Visual Formats (v7.0.0)
| Format | Output | Use Case |
|--------|--------|----------|
| Mermaid | Flowcharts | Documentation |
| DOT | GraphViz graphs | Visualization tools |
| ASCII | Text diagrams | Terminal display |
| **SVG** | Native vector graphics | Direct rendering without external tools |

---

## Proof Decomposition (v7.0.0)

| Component | Purpose |
|-----------|---------|
| **ProofDecomposer** | Breaks proofs into atomic statements |
| **GapAnalyzer** | Detects gaps and implicit assumptions |
| **AssumptionTracker** | Traces conclusions to assumptions |
| **MathematicsReasoningEngine** | Advanced mathematical analysis |
| **InconsistencyDetector** | Detects logical inconsistencies |

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
- **Unit Tests**: 40 files
- **Integration Tests**: 8 files (including proof decomposition)
- **Total Tests**: 972 passing
- **Critical Paths**: 80%+ coverage
- **Phase 8**: Full coverage for proof decomposition components

---

## Further Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture
- **[COMPONENTS.md](COMPONENTS.md)** - Component deep-dive
- **[DATA_FLOW.md](DATA_FLOW.md)** - Data flow diagrams
- **[DEPENDENCY_GRAPH.md](DEPENDENCY_GRAPH.md)** - Module dependency analysis
- **[docs/modes/METAREASONING.md](../modes/METAREASONING.md)** - Meta-reasoning mode guide (v6.0.0)
- **[CHANGELOG.md](../../CHANGELOG.md)** - Version history

---

*Last Updated*: 2025-12-07
*Version*: 7.2.0
