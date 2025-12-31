<!-- §: §0="/path/to/deepthinking-mcp/dist/index.js" | §1= Mathematical/physical/computability  | §2= **MathematicsReasoningEngine**  | §3=`deepthinking_probabilistic` | §4= Strategic decision-making  | §5= **InconsistencyDetector**  | §6=deepthinking_mathematics` | | §7=`deepthinking_mathematics` | §8=`deepthinking_engineering` | §9=deepthinking_analytical` | | §a=deepthinking_scientific` | | §b=`deepthinking_analytical` | §c=`deepthinking_scientific` | §d= Engineering/algorithmic  | §e=deepthinking_strategic`  | §f=deepthinking_academic` | | §g= **Causal/Probabilistic  | §h=`deepthinking_academic` | §i=`deepthinking_standard` | §j=`deepthinking_temporal` | §k=deepthinking_causal`  | §l=|------|---------| | §m=|---------|------| | §n= Turing machines, | §o= implementation | | §p= Counterfactual, | §q= Argumentation, | §r= Documentation  | §s= decomposition  | §t=(runtime only) | §u= Algorithmic  | §v= validation  | §w= tests
│    | §x= Sequential, | §y= Analogical, | §z= Stochastic, | §10= Constraint, | §11=| Strategic  | §12= reasoning  | §13= analysis | | §14=|
|------ | §15=---

##  | §16= Purpose  | §17=|

### | §18=│   ├──  | §19=`

### | §1a= Mode  | §1b= Tool  | §1c= File  | §1d=.ts`  -->
# DeepThinking MCP - Codebase Overview

## Project Summary

DeepThinking MCP is a TypeScript-based **Model Context Protocol (MCP) server** that provides advanced§12capabilities through 33 specialized thinking modes (29 with dedicated thought types). The system enables AI assistants to perform structured, multi-step§12with taxonomy-based classification, meta-reasoning for strategic oversight, enterprise security features, proof§sfor mathematical reasoning, and comprehensive export capabilities including native SVG generation.

**Version**: 8.5.0 | **Node**: >=18.0.0 | **License**: MIT

§15Key Metrics

| Metric | Value §14--|-------|
| Total Lines of Code | ~105,000 |
| TypeScript Files | 255 |
| Test Files | 170 |
| Passing Tests | 4,686 |
| Type Suppressions | 0 |
| Thinking Modes | 33 (29 with thought types) |
| Specialized Handlers | 36 (all modes covered) |
| MCP Tools | 13 focused |
| Export Formats | 8 + native SVG |
| Visual Exporters | 41 files (23 mode-specific) |
| Builder Classes | 14 fluent APIs |
| Reasoning Types | 69 (110 planned) |
| Total Exports | 1,431 (684 re-exports) |
| Modules | 16 |
| Circular Dependencies | 55 (all type-only, 0 runtime) |
|§1aValidators | 28 |

§15Project Structure

```
deepthinking-mcp/
├── src/                    # Source code (~48,800 lines)
§18index.ts            # MCP server entry point
§18types/              # Type definitions (18 modes)
§18services/           # Business logic layer
§18session/            # Session management
§18validation/         # Zod schemas & validators
§18export/             # Export system (8 formats)
§18taxonomy/           # 110+§12types
§18search/             # Full-text search engine
§18batch/              # Batch processing
§18backup/             # Backup & recovery
§18cache/              # Caching strategies
§18rate-limit/         # Rate limiting
§18repositories/       # Storage abstraction
§18modes/              #§1aimplementations
│   └── tools/              # MCP tool definitions
├── tests/                  # Test suite (170 files, 4,686 tests)
§18unit/               # Unit§w└── integration/        # Integration tests
├── docs/                   # Documentation
│   └── architecture/       # Architecture docs
├── dist/                   # Compiled output
└── package.json            # Project configuration
```

§15Core Source Directories

### `src/types/` - Type System

Comprehensive TypeScript definitions for 33§12modes (29 with dedicated thought types):

```
src/types/
├── core.ts                 # ThinkingMode enum (33 modes), Thought union type (29 types)
├── config.ts               # Configuration types
├── session.ts              # Session &§vtypes
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
    ├── computability.ts    #§n decidability (v7.2.0)
    ├── cryptanalytic.ts    # Turing's deciban system (v7.2.0)
    ├── algorithmic.ts      # Algorithm design & analysis - CLRS (v7.3.0)
    ├── synthesis.ts        # Literature synthesis (v7.4.0)
    ├── argumentation.ts    # Academic argumentation (v7.4.0)
    ├── critique.ts         # Critical analysis (v7.4.0)
    ├── analysis.ts         # Qualitative analysis (v7.4.0)
    └── [8 more modes]
``§19 `src/services/` - Business Logic Layer

Core services extracted from the entry point:

| Service |§1c| Responsibility |
§m----------------|
| **ThoughtFactory** | `ThoughtFactory§1d| Mode-specific thought creation for all 33 modes with handler integration (v8.x) |
| **ExportService** | `ExportService§1d| Multi-format export (8 formats) |
| **ModeRouter** | `ModeRouter§1d|§1aswitching, recommendations, and adaptive switching |
| **MetaMonitor** | `MetaMonitor§1d| Session tracking, strategy evaluation, meta-reasoning insights §17 `src/modes/handlers/` - Specialized§1aHandlers (v8.4.0)

**36 specialized handlers** implementing the ModeHandler pattern (all 33 modes covered):

| Category | Handlers | Key Features §14----|----------|--------------|
| **Core (5)** |§x Shannon, Mathematics, Physics, Hybrid | Mode-specific§vand thought creation |
| **Fundamental (3)** | Inductive, Deductive, Abductive | Reasoning triad§o
|§g(6)** | Causal, Bayesian,§p Temporal, GameTheory, Evidential | Auto computation (posteriors, equilibria),§v|
| **Analogical (2)** |§y FirstPrinciples | Mapping and§slogic |
| **Systems/Scientific (3)** | SystemsThinking, ScientificMethod, FormalLogic | 8 Archetypes detection, proof logic |
| **Academic (4)** | Synthesis,§q Critique, Analysis | Coverage tracking, Socratic questions |
| **Engineering (4)** | Engineering, Computability, Cryptanalytic,§u| CLRS coverage,§n Decibans |
| **Advanced Runtime (6)** | MetaReasoning, Recursive, Modal,§z§10 Optimization §11oversight, constraint solving |
| **Fallback (3)** | GenericModeHandler, CustomHandler, utility | Default behavior, user-defined modes §17 `src/session/` - Session Management

```
src/session/
├── manager.ts                    # SessionManager - lifecycle management
├── SessionMetricsCalculator.ts   # O(1) incremental metrics
├── storage.ts                    # Storage abstraction
└── persistence.ts                # Persistence layer
``§19 `src/validation/` - Validation System (v4.3.0)

```
src/validation/
├── index.ts              # Public exports
├── constants.ts          # IssueSeverity, IssueCategory, ValidationThresholds
├── validator.ts          # Main§vorchestrator
├── schemas.ts            # Zod schemas
└── validators/
    ├── base.ts           # BaseValidator with reusable methods
    ├── registry.ts       # Lazy-loading ValidatorRegistry
    └── modes/            # 25+ mode-specific validators
``§19 `src/export/` - Export System

```
src/export/
├── index.ts              # Unified ExportService
├── visual/               # Visual exporters (22 files)
§18index.ts          # VisualExporter class
§18types.ts          # VisualFormat, VisualExportOptions
§18utils.ts          # sanitizeId utility
│   └── [19 mode-specific exporters]
└── formats/              # Document format exporters
    ├── markdown.ts
    ├── latex.ts
    ├── html.ts
    ├── jupyter.ts
    └── json.ts
``§19 `src/taxonomy/` - Taxonomy System

```
src/taxonomy/
├── reasoning-types.ts       # 69§12type definitions (110 planned)
├── navigator.ts             # Hierarchy navigation (TaxonomyNavigator)
├── suggestion-engine.ts     #§1arecommendations
├── adaptive-mode.ts         # Intelligent mode selection
└── multi-modal.ts           # Combined§12analysis
```

§15The 33 Thinking Modes

The server supports 33§12modes organized into categories:
- **Core Modes (5)**:§x Shannon, Mathematics, Physics, Hybrid
- **Historical Computing (2)**: Computability (Turing), Cryptanalytic (Turing) - *v7.2.0*
- **Algorithmic (1)**:§u(CLRS) - *v7.3.0*
- **Academic Research (4)**: Synthesis,§q Critique, Analysis - *v7.4.0*
- **Advanced Runtime Modes (6)**: Metareasoning, Recursive, Modal,§z§10 Optimization
- **Fundamental Modes (2)**: Inductive, Deductive
- **Experimental Modes (13)**: Abductive, Causal, Bayesian,§p§y Temporal, Game Theory (+ von Neumann extensions), Evidential, First Principles, Systems Thinking, Scientific Method, Formal Logic, Engineering

### Core Reasoning Modes (Fundamental) - v5.0.0+
|§1a|§16|§1b|
§l------|
| **Inductive** | Specific observations → general principles | `deepthinking_core` |
| **Deductive** | General principles → specific conclusions | `deepthinking_core` |
| **Abductive** | Inference to best explanation | `deepthinking_core` §17 Standard Workflow Modes (Full Runtime)
|§1a|§16|§1b|
§l------|
| **Sequential** | Step-by-step linear§12| §i |
| **Shannon** | Information theory, entropy§13 §i |
| **Hybrid** | Multi-approach combination | §i §17 Math/Physics Modes
|§1a|§16|§1b|
§l------|
| **Mathematics** | Formal proofs, theorems | `§6
| **Physics** | Physical models, conservation laws | `§6

### Advanced Runtime Modes (Full Runtime)
|§1a|§16|§1b|
§l------|
| **Metareasoning** §11oversight of§12(v6.0.0) | `§9
| **Recursive** | Divide-and-conquer, subproblem§s| §t |
| **Modal** | Possibility/necessity logic | §t |
| **Stochastic** | Probabilistic state transitions | §t |
| **Constraint** | Constraint satisfaction problems | §t |
| **Optimization** | Objective function optimization | `§e§17 Analytical & Causal Modes
|§1a|§16|§1b|
§l------|
| **Causal** | Cause-effect relationships | `§k|
| **Counterfactual** | "What-if" scenarios | `§k|
| **Bayesian** | Probability updates | §3 |
| **Evidential** | Dempster-Shafer theory | §3 |
| **Temporal** | Time-based§12| §j §17 Scientific & Systematic Modes
|§1a|§16|§1b|
§l------|
| **Analogical** | Reasoning by analogy | `§9
| **First Principles** | Fundamental§s| `§9
| **Game Theory** |§4+ von Neumann extensions | `§e|
| **Systems Thinking** | Holistic system§13 `§a
| **Scientific Method** | Hypothesis → experiment → conclusion | `§a
| **Formal Logic** | Formal logical proofs | `§a

### Historical Computing Modes (v7.2.0) - Turing & von Neumann
|§1a|§16|§1b|
§l------|
| **Computability** |§n decidability, reductions, diagonalization | `§6
| **Cryptanalytic** | Deciban evidence system, Banburismus, frequency§13 `§9

### Engineering &§uModes (v7.1.0, v7.3.0)
|§1a|§16|§1b|
§l------|
| **Engineering** | Requirements, trade studies, FMEA, ADRs | §8 |
| **Algorithmic** | Algorithm design, complexity analysis, CLRS algorithms | §8 §17 Academic Research Modes (v7.4.0) - PhD Students & Scientific Writing
|§1a|§16|§1b|
§l------|
| **Synthesis** | Literature review, knowledge integration, theme extraction | `§f
| **Argumentation** | Toulmin model, dialectics, rhetorical structures | `§f
| **Critique** | Critical analysis, peer review, methodology evaluation | `§f
| **Analysis** | Qualitative analysis (thematic, grounded theory, discourse) | `§f

§15Key Files Reference

### Entry Points
|§1c|§16|
§l
| `src/index§1d| MCP server entry, tool handlers |
| `dist/index.js` | Compiled output (runtime entry) §17 Core Types
|§1c|§16|
§l
| `src/types/core§1d| ThinkingMode enum, Thought union type, type guards |
| `src/types/session§1d| Session, ValidationIssue types §17 Services
|§1c|§16|
§l
| `src/services/ThoughtFactory§1d| Thought creation for all 27 modes |
| `src/services/ExportService§1d| Export orchestration |
| `src/services/ModeRouter§1d|§1aswitching logic §17 Session
|§1c|§16|
§l
| `src/session/manager§1d| SessionManager class |
| `src/session/SessionMetricsCalculator§1d| Metrics calculation §17 Validation
|§1c|§16|
§l
| `src/validation/constants§1d| Centralized§vconstants |
| `src/validation/validators/base§1d| Reusable§vmethods |
| `src/validation/validators/registry§1d| Lazy-loading validator registry §17 Search & Batch
|§1c|§16|
§l
| `src/search/engine§1d| Full-text search with TF-IDF |
| `src/batch/processor§1d| Batch job execution §17 Storage
|§1c|§16|
§l
| `src/repositories/session§1d| ISessionRepository interface |
| `src/repositories/file-session§1d| File-based§o
| `src/repositories/memory-session§1d| In-memory§o

§15Architecture Patterns

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

§15Build & Development

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
``§19 Configuration Files
|§1c|§16|
§l
| `tsconfig.json` | TypeScript configuration with path aliases |
| `tsup.config§1d| Build configuration (tree-shaking enabled) |
| `vitest.config§1d| Test configuration |
| `.eslintrc.json` | Linting rules |
| `.prettierrc` | Formatting rules §17 Path Aliases
Configured in `tsconfig.json`:
- `@/*` → `src/*`
- `@types/*` → `src/types/*`
- `@validation/*` → `src/validation/*`
- `@session/*`, `@search/*`, `@batch/*`, `@export/*`, `@taxonomy/*`

§15MCP Integration

### The 13 Focused Tools (v8.5.0)

|§1b| Description | Modes Supported §14|-------------|-----------------|
| `deepthinking_core` | Fundamental§12| inductive, deductive, abductive |
| §i | Standard workflows | sequential, shannon, hybrid |
| `§6§1| mathematics, physics, computability |
| §j | Time-based§12| temporal |
| §3 | Probability§12| bayesian, evidential |
| `§k| Causal§13 causal, counterfactual |
| `§e|§4| gametheory, optimization |
| `§9 Analytical§12| analogical, firstprinciples, metareasoning, cryptanalytic |
| `§a Scientific methods | scientificmethod, systemsthinking, formallogic |
| §8 |§d| engineering, algorithmic |
| `§f Academic research | synthesis, argumentation, critique,§13
| `deepthinking_session` | Session management | All (create, list, delete, export) §17 Configuration
```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "node",
      "args": [§0]
    }
  }
}
```

§15Export Capabilities

### Document Formats
| Format | Extension | Use Case §14--|-----------|----------|
| JSON | `.json` | API integration, backup |
| Markdown | `.md` |§r|
| LaTeX | `.tex` | Academic papers |
| HTML | `.html` | Web display |
| Jupyter | `.ipynb` | Interactive§13

### Visual Formats (v7.0.0)
| Format | Output | Use Case §14--|--------|----------|
| Mermaid | Flowcharts |§r|
| DOT | GraphViz graphs | Visualization tools |
| ASCII | Text diagrams | Terminal display |
| **SVG** | Native vector graphics | Direct rendering without external tools |

§15Proof Decomposition (v7.0.0)

| Component |§16§14-----|---------|
| **ProofDecomposer** | Breaks proofs into atomic statements |
| **GapAnalyzer** | Detects gaps and implicit assumptions |
| **AssumptionTracker** | Traces conclusions to assumptions |
|§2| Advanced mathematical§13
|§5| Detects logical inconsistencies |

§15Testing

### Test Structure (Phase 11 Complete)
```
tests/
├── unit/                       # Unit tests (50+ files)
§18session/                # Session management§w├── validation/             # Validator§w├── services/               # Service layer§w├── modes/handlers/         # ModeHandler§w└── proof/                  # Proof§stests
├── integration/                # Integration§w├── handlers/               # 7 handler integration§w├── tools/                  # 37 MCP tool§w├── exports/                # 9 export format§w└── scenarios/              # 4 real-world workflow tests
├── edge-cases/                 # 6 edge case test files
├── performance/                # 4 performance/stress tests
└── utils/                      # 5 test utility files
``§19 Coverage (v8.5.0)
- **Test Files**: 170 total
- **Passing Tests**: 4,686
- **Test Categories**: 19 (COR, STD, PAR, MTH, TMP, PRB, CSL, STR, ANL, SCI, ENG, ACD, SES, EXP, HDL, EDG, REG, INT, PRF)
- **Phase 11**: Comprehensive coverage across all tools, modes, handlers, and exports

§15Further Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture
- **[COMPONENTS.md](COMPONENTS.md)** - Component deep-dive
- **[DATA_FLOW.md](DATA_FLOW.md)** - Data flow diagrams
- **[DEPENDENCY_GRAPH.md](DEPENDENCY_GRAPH.md)** - Module dependency analysis
- **[docs/modes/METAREASONING.md](../modes/METAREASONING.md)** - Meta-reasoning mode guide (v6.0.0)
- **[CHANGELOG.md](../../CHANGELOG.md)** - Version history

---

*Last Updated*: 2025-12-26
*Version*: 8.5.0
