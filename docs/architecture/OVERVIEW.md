# DeepThinking MCP - Codebase Overview

## Project Summary

DeepThinking MCP is a TypeScript-based **Model Context Protocol (MCP) server** that provides advanced reasoning capabilities through 33 specialized thinking modes (29 with dedicated thought types). The system enables AI assistants to perform structured, multi-step reasoning with taxonomy-based classification, meta-reasoning for strategic oversight, enterprise security features, proof decomposition for mathematical reasoning, and comprehensive export capabilities including native SVG generation.

**Version**: 8.3.2 | **Node**: >=18.0.0 | **License**: MIT

---

## What's New in v8.3.x

- **Bug Fixes**: Mode recommendation logic now uses substring matching with prioritized keywords
- **Export Improvements**: Markdown/LaTeX/Jupyter exports include mode-specific structured data (causal graphs, probabilities, temporal events)
- **Phase 11 Complete**: Comprehensive test coverage - 143 test files, 3539 passing tests
- **Version Alignment**: All visual exporters updated to v8.3.1

## What's New in v8.2.x

- **Phase 10: ModeHandler Architecture** - Strategy pattern with 7 specialized handlers
- **Specialized Handlers**: CausalHandler, BayesianHandler, GameTheoryHandler, CounterfactualHandler, SynthesisHandler, SystemsThinkingHandler, CritiqueHandler
- **Handler Enhancements**: Systems Archetypes detection (8 patterns), Socratic Questions (6 categories), auto Bayesian posteriors, Nash equilibria computation
- **ModeHandlerRegistry**: Centralized handler management with `hasSpecializedHandler()` API
- **ThoughtFactory Integration**: Handlers integrated directly into ThoughtFactory for seamless processing

## What's New in v7.5.0

- **Phase 14: Accessible Reasoning Modes** - All 29 modes with dedicated thought types accessible via 12 MCP tools
- **12 Focused Tools**: Including `deepthinking_engineering` and `deepthinking_academic`

## What's New in v7.4.0

- **Phase 13: Academic Research Modes** - Synthesis, Argumentation, Critique, Analysis for PhD students

## What's New in v7.3.0

- **Phase 12: Algorithmic Reasoning Mode** - Comprehensive CLRS coverage with 100+ algorithms

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~89,490 |
| TypeScript Files | 221 |
| Test Files | 143 |
| Passing Tests | 3539 |
| Type Suppressions | 0 |
| Thinking Modes | 33 (29 with thought types) |
| Specialized Handlers | 7 |
| MCP Tools | 12 focused + 1 legacy |
| Export Formats | 8 (including native SVG) |
| Visual Exporters | 35+ mode-specific |
| Reasoning Types | 69 (110 planned) |
| Total Exports | 1117 (515 re-exports) |
| Modules | 16 |
| Circular Dependencies | 55 (all type-only, 0 runtime) |

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

Comprehensive TypeScript definitions for 33 reasoning modes (29 with dedicated thought types):

```
src/types/
├── core.ts                 # ThinkingMode enum (33 modes), Thought union type (29 types)
├── config.ts               # Configuration types
├── session.ts              # Session & validation types
├── events.ts               # Event system types
└── modes/                  # Mode-specific types (23 files)
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
    ├── algorithmic.ts      # Algorithm design & analysis - CLRS (v7.3.0)
    ├── synthesis.ts        # Literature synthesis (v7.4.0)
    ├── argumentation.ts    # Academic argumentation (v7.4.0)
    ├── critique.ts         # Critical analysis (v7.4.0)
    ├── analysis.ts         # Qualitative analysis (v7.4.0)
    └── [8 more modes]
```

### `src/services/` - Business Logic Layer

Core services extracted from the entry point:

| Service | File | Responsibility |
|---------|------|----------------|
| **ThoughtFactory** | `ThoughtFactory.ts` | Mode-specific thought creation with handler integration (v8.x) |
| **ExportService** | `ExportService.ts` | Multi-format export (8 formats) |
| **ModeRouter** | `ModeRouter.ts` | Mode switching, recommendations, and adaptive switching |
| **MetaMonitor** | `MetaMonitor.ts` | Session tracking, strategy evaluation, meta-reasoning insights |

### `src/modes/handlers/` - Specialized Mode Handlers (v8.x)

7 specialized handlers implementing the ModeHandler pattern:

| Handler | Mode | Key Enhancements |
|---------|------|------------------|
| **CausalHandler** | causal | Graph validation, cycle detection, intervention propagation |
| **BayesianHandler** | bayesian | Auto posterior calculation, probability sum validation |
| **GameTheoryHandler** | gametheory | Payoff matrix validation, Nash equilibria computation |
| **CounterfactualHandler** | counterfactual | World state tracking, divergence validation |
| **SynthesisHandler** | synthesis | Source coverage, theme extraction, contradiction detection |
| **SystemsThinkingHandler** | systemsthinking | 8 Systems Archetypes detection (Peter Senge) |
| **CritiqueHandler** | critique | 6 Socratic question categories (Richard Paul) |

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

## The 33 Thinking Modes

The server supports 33 reasoning modes organized into categories:
- **Core Modes (5)**: Sequential, Shannon, Mathematics, Physics, Hybrid
- **Historical Computing (2)**: Computability (Turing), Cryptanalytic (Turing) - *v7.2.0*
- **Algorithmic (1)**: Algorithmic (CLRS) - *v7.3.0*
- **Academic Research (4)**: Synthesis, Argumentation, Critique, Analysis - *v7.4.0*
- **Advanced Runtime Modes (6)**: Metareasoning, Recursive, Modal, Stochastic, Constraint, Optimization
- **Fundamental Modes (2)**: Inductive, Deductive
- **Experimental Modes (13)**: Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, Game Theory (+ von Neumann extensions), Evidential, First Principles, Systems Thinking, Scientific Method, Formal Logic, Engineering

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
| **Mathematics** | Formal proofs, theorems | `deepthinking_mathematics` |
| **Physics** | Physical models, conservation laws | `deepthinking_mathematics` |

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
| **Computability** | Turing machines, decidability, reductions, diagonalization | `deepthinking_mathematics` |
| **Cryptanalytic** | Deciban evidence system, Banburismus, frequency analysis | `deepthinking_analytical` |

### Engineering & Algorithmic Modes (v7.1.0, v7.3.0)
| Mode | Purpose | Tool |
|------|---------|------|
| **Engineering** | Requirements, trade studies, FMEA, ADRs | `deepthinking_engineering` |
| **Algorithmic** | Algorithm design, complexity analysis, CLRS algorithms | `deepthinking_engineering` |

### Academic Research Modes (v7.4.0) - PhD Students & Scientific Writing
| Mode | Purpose | Tool |
|------|---------|------|
| **Synthesis** | Literature review, knowledge integration, theme extraction | `deepthinking_academic` |
| **Argumentation** | Toulmin model, dialectics, rhetorical structures | `deepthinking_academic` |
| **Critique** | Critical analysis, peer review, methodology evaluation | `deepthinking_academic` |
| **Analysis** | Qualitative analysis (thematic, grounded theory, discourse) | `deepthinking_academic` |

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
`ThoughtFactory` centralizes mode-specific thought creation with handler delegation.

### 4. Strategy Pattern (ModeHandler - v8.x)
Different thinking modes implemented as interchangeable handlers via `ModeHandler` interface:
- `validate()` - Mode-specific input validation
- `enhance()` - Automatic thought enhancements (posteriors, equilibria, archetypes)
- `getSuggestions()` - Context-aware suggestions and warnings

### 5. Lazy Loading Pattern (v4.3.0)
- Validators loaded on-demand via dynamic imports
- Schemas loaded when first accessed
- Visual exporters loaded per-mode

### 6. Observer Pattern
Progress callbacks and event handlers for async operations.

### 7. Registry Pattern (v8.x)
`ModeHandlerRegistry` manages specialized handlers with singleton access.

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

### The 12 Focused Tools (v7.5.0)

| Tool | Description | Modes Supported |
|------|-------------|-----------------|
| `deepthinking_core` | Fundamental reasoning | inductive, deductive, abductive |
| `deepthinking_standard` | Standard workflows | sequential, shannon, hybrid |
| `deepthinking_mathematics` | Mathematical/physical/computability | mathematics, physics, computability |
| `deepthinking_temporal` | Time-based reasoning | temporal |
| `deepthinking_probabilistic` | Probability reasoning | bayesian, evidential |
| `deepthinking_causal` | Causal analysis | causal, counterfactual |
| `deepthinking_strategic` | Strategic decision-making | gametheory, optimization |
| `deepthinking_analytical` | Analytical reasoning | analogical, firstprinciples, metareasoning, cryptanalytic |
| `deepthinking_scientific` | Scientific methods | scientificmethod, systemsthinking, formallogic |
| `deepthinking_engineering` | Engineering/algorithmic | engineering, algorithmic |
| `deepthinking_academic` | Academic research | synthesis, argumentation, critique, analysis |
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

### Test Structure (Phase 11 Complete)
```
tests/
├── unit/                       # Unit tests (50+ files)
│   ├── session/                # Session management tests
│   ├── validation/             # Validator tests
│   ├── services/               # Service layer tests
│   ├── modes/handlers/         # ModeHandler tests
│   └── proof/                  # Proof decomposition tests
├── integration/                # Integration tests
│   ├── handlers/               # 7 handler integration tests
│   ├── tools/                  # 37 MCP tool tests
│   ├── exports/                # 9 export format tests
│   └── scenarios/              # 4 real-world workflow tests
├── edge-cases/                 # 6 edge case test files
├── performance/                # 4 performance/stress tests
└── utils/                      # 5 test utility files
```

### Coverage (v8.3.2)
- **Test Files**: 143 total
- **Passing Tests**: 3539
- **Test Categories**: 19 (COR, STD, PAR, MTH, TMP, PRB, CSL, STR, ANL, SCI, ENG, ACD, SES, EXP, HDL, EDG, REG, INT, PRF)
- **Phase 11**: Comprehensive coverage across all tools, modes, handlers, and exports

---

## Further Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture
- **[COMPONENTS.md](COMPONENTS.md)** - Component deep-dive
- **[DATA_FLOW.md](DATA_FLOW.md)** - Data flow diagrams
- **[DEPENDENCY_GRAPH.md](DEPENDENCY_GRAPH.md)** - Module dependency analysis
- **[docs/modes/METAREASONING.md](../modes/METAREASONING.md)** - Meta-reasoning mode guide (v6.0.0)
- **[CHANGELOG.md](../../CHANGELOG.md)** - Version history

---

*Last Updated*: 2025-12-22
*Version*: 8.3.2
