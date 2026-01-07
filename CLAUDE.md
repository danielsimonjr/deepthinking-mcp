# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DeepThinking MCP is a TypeScript-based Model Context Protocol server featuring **34 reasoning modes** (30 with dedicated thought types + 4 advanced runtime) with taxonomy-based classification (69 implemented reasoning types across 12 categories), enterprise security, proof decomposition, ModeHandler architecture, and visual export capabilities including native SVG.

**Version**: 9.1.2 | **Node**: >=18.0.0 | **Entry Point**: `dist/index.js`

## Project Metrics

| Metric | Value |
|--------|-------|
| TypeScript Files | 250 |
| Lines of Code | ~105,000 |
| Total Exports | 1,426 (684 re-exports) |
| Passing Tests | 5,148 (181 test files) |
| Reasoning Modes | 34 (30 with dedicated types + 4 advanced runtime) |
| MCP Tools | 13 focused (includes deepthinking_analyze) |
| Export Formats | 8 + native SVG + file export |
| Visual Exporters | 42 files (24 mode-specific, 14 utils, 4 root) |
| Specialized Handlers | 37 (34 modes + GenericModeHandler + CustomHandler + utility) |
| Builder Classes | 14 fluent APIs |
| Circular Dependencies | 55 (all type-only, 0 runtime) |

## Build & Development Commands

```bash
npm run build        # Compile with tsup → dist/
npm run dev          # Watch mode compilation
npm run typecheck    # Type check without emitting
npm run lint         # ESLint checks on src/
npm run format       # Prettier auto-format
npm run format:check # Check formatting
npm run docs:deps    # Generate dependency graph documentation
```

## Testing

```bash
npm test             # Run tests in watch mode
npm run test:run     # Run all tests once with coverage (summary mode)
npm run test:debug   # Run tests with coverage (failed files with details)
npm run test:all     # Run tests with coverage (all files - audit mode)
npm run test:publish # Run tests for publishing (skips benchmarks)
npm run test:coverage # Generate coverage reports only

# Run a single test file
npm test -- tests/unit/session/manager.test.ts

# Run tests matching a pattern
npm test -- -t "SessionManager"
```

Test framework: Vitest with V8 coverage provider.

**Test Reports:** Generated in `tests/test-results/` with JSON and HTML formats. Reports include code coverage percentage and list of untested files.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_DIR` | Shared session storage for multi-instance | `` (in-memory) |
| `MCP_EXPORT_PATH` | Default directory for file exports | `` (returns content) |
| `MCP_EXPORT_OVERWRITE` | Overwrite existing files | `false` |
| `MCP_LOG_LEVEL` | Log level (debug/info/warn/error) | `info` |
| `MCP_MAX_SESSIONS` | Maximum active sessions | `100` |
| `MCP_SESSION_TIMEOUT_MS` | Session timeout (0 = none) | `0` |

## Architecture

### Service Layer Pattern

Business logic extracted from `src/index.ts` into focused services:

| Service | File | Purpose |
|---------|------|---------|
| **ThoughtFactory** | `src/services/ThoughtFactory.ts` | Mode-specific thought creation for all 34 modes |
| **ExportService** | `src/services/ExportService.ts` | Multi-format export orchestration |
| **SessionManager** | `src/session/manager.ts` | Session lifecycle + meta-monitoring |

### ModeHandler Architecture

The Strategy Pattern-based ModeHandler system in `src/modes/handlers/` provides 37 total handlers:

| Category | Handlers | Key Features |
|----------|----------|--------------|
| **Core (5)** | Sequential, Shannon, Mathematics, Physics, Hybrid | Mode-specific validation and thought creation |
| **Fundamental (3)** | Inductive, Deductive, Abductive | Reasoning triad implementation |
| **Causal/Probabilistic (7)** | Causal, Bayesian, Counterfactual, Temporal, Historical, GameTheory, Evidential | Auto computation (posteriors, equilibria), source reliability, validation |
| **Analogical (2)** | Analogical, FirstPrinciples | Mapping and decomposition logic |
| **Systems/Scientific (3)** | SystemsThinking, ScientificMethod, FormalLogic | 8 Archetypes detection, proof logic |
| **Academic (4)** | Synthesis, Argumentation, Critique, Analysis | Coverage tracking, Socratic questions |
| **Engineering (4)** | Engineering, Computability, Cryptanalytic, Algorithmic | CLRS coverage, Turing machines, Decibans |
| **Advanced Runtime (4)** | MetaReasoning, Recursive, Modal, Stochastic | Strategic oversight, constraint solving |
| **Fallback (2)** | GenericModeHandler, CustomHandler | Default behavior, user-defined modes |

**Note**: Constraint and Optimization modes use validators + generic handler support.

**ModeHandlerRegistry** singleton manages all handlers via Strategy pattern:

- `hasSpecializedHandler(mode)` - Check implementation status
- `getHandler(mode)` - Get handler (specialized or generic fallback)
- `createThought(input, sessionId)` - Delegate to appropriate handler
- `registerAllHandlers()` - Initialize all handlers at startup

### Key Directories

```
src/
├── index.ts           # MCP server entry point (tool handlers)
├── types/             # Type definitions for 34 modes
│   ├── core.ts        # ThinkingMode enum, Thought union type
│   └── modes/         # One file per reasoning mode
├── services/          # Business logic layer
│   ├── ThoughtFactory.ts
│   └── ExportService.ts
├── session/           # SessionManager, persistence, storage abstraction
│   ├── manager.ts
│   ├── storage/
│   └── locks/
├── taxonomy/          # 69 reasoning types, classifier
├── export/            # Visual and document exporters
│   ├── visual/        # Per-mode visual exporters (Mermaid, DOT, ASCII, SVG)
│   └── utilities
├── proof/             # Proof decomposition system (6 modules)
│   ├── decomposer.ts
│   ├── gap-analyzer.ts
│   ├── assumption-tracker.ts
│   ├── inconsistency-detector.ts
│   ├── circular-detector.ts
│   └── dependency-graph.ts
├── search/            # Full-text search engine with faceted filtering
├── cache/             # LRU/LFU/FIFO caching strategies
├── modes/             # Advanced reasoning mode implementations
│   ├── handlers/      # Strategy pattern handlers (37 total)
│   ├── combinations/  # Mode combination logic
│   ├── causal/        # Causal reasoning implementations
│   ├── stochastic/    # Stochastic reasoning implementations
│   ├── registry.ts    # Handler registry
│   └── index.ts
├── tools/             # MCP tool definitions and schemas
│   ├── schemas/       # Tool schemas (JSON)
│   └── validators/    # Tool validators
├── validation/        # Zod schemas and validators for input validation
│   ├── validators/    # Per-mode and cross-mode validators
│   └── index.ts
├── interfaces/        # TypeScript interfaces
├── config/            # Configuration management
├── utils/             # Utility functions (errors, logger, sanitization)
└── repositories/      # Repository pattern implementations (ISessionRepository)
```

### Type System

All 34 reasoning modes defined in `src/types/core.ts`:

- `ThinkingMode` enum - Mode identifiers
- `Thought` union type - Discriminated union of all thought types
- `FULLY_IMPLEMENTED_MODES` - Modes with complete runtime logic
- `EXPERIMENTAL_MODES` - Modes with validators but limited runtime
- Type guards: `isSequentialThought()`, `isAlgorithmicThought()`, `isSynthesisThought()`, etc.

Mode-specific types in `src/types/modes/` (one file per mode).

### Path Aliases

Configured in `tsconfig.json`:

- `@/*` → `src/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`
- `@validation/*` → `src/validation/*`
- `@modes/*`, `@session/*`, `@search/*`, `@cache/*`, `@export/*`, `@taxonomy/*`

## The 34 Reasoning Modes

| Category | Modes | Description |
|----------|-------|-------------|
| **Core (5)** | Sequential, Shannon, Mathematics, Physics, Hybrid | Standard workflows, math/physics reasoning |
| **Fundamental (3)** | Inductive, Deductive, Abductive | Basic reasoning triad |
| **Causal/Probabilistic (7)** | Causal, Bayesian, Counterfactual, Temporal, Historical, GameTheory, Evidential | Cause-effect, probability, time, strategy |
| **Analogical (2)** | Analogical, FirstPrinciples | Knowledge transfer, axiom derivation |
| **Systems/Scientific (3)** | SystemsThinking, ScientificMethod, FormalLogic | Holistic analysis, experimentation, proofs |
| **Academic (4)** | Synthesis, Argumentation, Critique, Analysis | Literature review, Toulmin model, peer review |
| **Engineering (4)** | Engineering, Computability, Cryptanalytic, Algorithmic | CLRS algorithms, Turing machines, Decibans |
| **Advanced Runtime (6)** | MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization | Strategic oversight, recursive decomposition |

**Note**: 30 modes have dedicated thought types. 4 advanced runtime modes (Constraint, Optimization, Recursive, Modal) have validators and handler support but limited dedicated business logic.

## MCP Tools

The server provides 13 focused tools:

| Tool | Modes/Functions |
|------|-----------------|
| `deepthinking_core` | inductive, deductive, abductive |
| `deepthinking_standard` | sequential, shannon, hybrid |
| `deepthinking_mathematics` | mathematics, physics, computability |
| `deepthinking_temporal` | temporal, historical |
| `deepthinking_probabilistic` | bayesian, evidential |
| `deepthinking_causal` | causal, counterfactual |
| `deepthinking_strategic` | gametheory, optimization |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning, cryptanalytic |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic |
| `deepthinking_engineering` | engineering, algorithmic |
| `deepthinking_academic` | synthesis, argumentation, critique, analysis |
| `deepthinking_session` | Session management (create, list, delete, export, get_session, switch_mode, recommend_mode) |
| `deepthinking_analyze` | Multi-mode analysis with presets and merge strategies |

## Adding New Features

### New Reasoning Mode

1. Create type definition: `src/types/modes/newmode.ts`
2. Add to `ThinkingMode` enum in `src/types/core.ts`
3. Add to `Thought` union type and appropriate mode array
4. Create handler: `src/modes/handlers/NewModeHandler.ts`
5. Register in `src/modes/handlers/ModeHandlerRegistry.ts`
6. Update `ThoughtFactory` to handle the mode
7. Add Zod validator in `src/validation/validators/modes/`
8. Create visual exporter in `src/export/visual/`

See `docs/ADDING_NEW_MODE.md` for complete guide with templates.

### New Export Format

1. Create exporter: `src/export/newformat.ts`
2. Register in `src/services/ExportService.ts`
3. Add to export format enum/list

### New MCP Tool

1. Define schema in `src/tools/schemas/`
2. Add handler in `src/index.ts`
3. Implement logic in appropriate service

## MCP Configuration

```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "node",
      "args": ["C:/path/to/deepthinking-mcp/dist/index.js"]
    }
  }
}
```

### Multi-Instance Configuration

For parallel reasoning or handling multiple concurrent sessions:

```json
{
  "mcpServers": {
    "deepthinking-1": {
      "command": "node",
      "args": ["C:/path/to/deepthinking-mcp/dist/index.js"],
      "env": { "SESSION_DIR": "C:/shared/deepthinking-sessions" }
    },
    "deepthinking-2": {
      "command": "node",
      "args": ["C:/path/to/deepthinking-mcp/dist/index.js"],
      "env": { "SESSION_DIR": "C:/shared/deepthinking-sessions" }
    }
  }
}
```

**Features:**
- **Shared Sessions**: All instances share sessions via file-based storage
- **File Locking**: Automatic cross-process file locking prevents race conditions
- **Concurrent Reads**: Multiple instances can read sessions simultaneously
- **Safe Writes**: Exclusive locks ensure atomic writes

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | MCP server entry, all tool handlers |
| `src/types/core.ts` | Core types, mode enums, thought union |
| `src/session/manager.ts` | SessionManager lifecycle management |
| `src/services/ThoughtFactory.ts` | Thought creation and validation |
| `src/taxonomy/reasoning-types.ts` | All 69 reasoning type definitions |
| `src/search/engine.ts` | Full-text search implementation |
| `src/proof/decomposer.ts` | Proof decomposition engine |
| `src/modes/handlers/ModeHandler.ts` | Handler interface definition |
| `src/modes/handlers/ModeHandlerRegistry.ts` | Singleton registry for handlers |
| `src/modes/handlers/HistoricalHandler.ts` | Historical source evaluation, pattern detection |
| `src/modes/handlers/SystemsThinkingHandler.ts` | 8 Systems Archetypes detection |
| `src/modes/handlers/BayesianHandler.ts` | Auto posterior calculation |
| `src/modes/handlers/GameTheoryHandler.ts` | Nash equilibria detection |

## Development Best Practices

### Build & Publish Workflow

**CRITICAL**: Always follow this exact order - typecheck and test BEFORE building:

```bash
# Correct workflow
1. Make source changes in src/
2. npm run typecheck          # Type check FIRST
3. npm run test:publish       # Test BEFORE building
4. npm run build              # Build AFTER typecheck and tests pass
5. git add -A && git commit   # Commit source + dist
6. npm publish                # Publish to npm
7. git push origin master     # Push to GitHub
```

### Cleanup Before Committing

**CRITICAL**: Remove temporary debug/test artifacts before committing:

```bash
# Before git commit - check for junk files
git status

# Common temporary files to remove:
rm test-*.mjs test-*.js debug-*.js temp-*.js .error.txt

# Verify only intended files are staged
git diff --cached
```

### Key Conventions

1. **No mode logic in index.ts** → Use handlers in `src/modes/handlers/`
2. **Use ModeHandlerRegistry** → For all mode-specific operations
3. **Lazy service initialization** → Use getter functions in `src/index.ts`
4. **Sync schemas** → Update both hand-written JSON and Zod schemas in `src/tools/`
5. **Type safety first** → Run `typecheck` before building

## Memory Usage Reminder

**IMPORTANT**: Use the `memory-mcp` tools periodically during sessions to:

1. **At session start**: Search for existing context with `mcp__memory-mcp__search_nodes` using query "deepthinking-mcp"
2. **During work**: Add observations for significant changes with `mcp__memory-mcp__add_observations`
3. **At session end**: Update memory with session summary and any new findings

## Documentation

| Location | Contents |
|----------|----------|
| `docs/architecture/` | OVERVIEW.md, ARCHITECTURE.md, COMPONENTS.md, DATA_FLOW.md, DEPENDENCY_GRAPH.md |
| `docs/modes/` | SYNTHESIS.md, ARGUMENTATION.md, CRITIQUE.md, ANALYSIS.md |
| `docs/planning/` | TEST_PLAN.md, PHASE_11-16 sprint documents |
| `docs/reference/` | Types of Thinking and Reasonings.md (110 reasoning types taxonomy) |
| `docs/analysis/` | REASONING_TYPES_GAP_ANALYSIS.md |

Generate dependency docs: `npm run docs:deps`

## Standalone Tools

The `tools/` directory contains standalone utilities compiled to executables with Bun:

| Tool | Purpose |
|------|---------|
| `tools/chunking-for-files/chunking-for-files.exe` | Split large files into editable sections, merge back |
| `tools/compress-for-context/compress-for-context.exe` | CTON context compression for LLM context windows |
| `tools/create-dependency-graph/create-dependency-graph.exe` | Generates dependency graph documentation |

### Usage

```bash
# Split markdown by ## headings
tools/chunking-for-files/chunking-for-files.exe split docs/ARCHITECTURE.md -l 2

# Check status and merge
tools/chunking-for-files/chunking-for-files.exe status docs/ARCHITECTURE_chunks/manifest.json
tools/chunking-for-files/chunking-for-files.exe merge docs/ARCHITECTURE_chunks/manifest.json

# Compress files for LLM context
tools/compress-for-context/compress-for-context.exe README.md -l aggressive

# Generate dependency graph
tools/create-dependency-graph/create-dependency-graph.exe C:\path\to\project
```

### Recommended Workflow for Large Files

| Phase | Tool | Purpose |
|-------|------|---------|
| **Reading** | compress-for-context | Reduce large file to fit context window |
| **Editing** | chunking-for-files | Split into sections, edit, merge back |

## Visual Builder APIs

14 fluent builder classes for visual/document export:

| Builder | Format | Location |
|---------|--------|----------|
| DOTGraphBuilder | GraphViz DOT | `src/export/visual/utils/dot.ts` |
| MermaidGraphBuilder | Mermaid diagrams | `src/export/visual/utils/mermaid.ts` |
| MermaidGanttBuilder | Mermaid Gantt | `src/export/visual/utils/mermaid.ts` |
| MermaidStateDiagramBuilder | Mermaid state | `src/export/visual/utils/mermaid.ts` |
| GraphMLBuilder | GraphML | `src/export/visual/utils/graphml.ts` |
| ASCIIDocBuilder | ASCII art | `src/export/visual/utils/ascii.ts` |
| SVGBuilder | Native SVG | `src/export/visual/utils/svg.ts` |
| TikZBuilder | LaTeX TikZ | `src/export/visual/utils/tikz.ts` |
| UMLBuilder | UML diagrams | `src/export/visual/utils/uml.ts` |
| HTMLDocBuilder | HTML docs | `src/export/visual/utils/html.ts` |
| MarkdownBuilder | Markdown | `src/export/visual/utils/markdown.ts` |
| ModelicaBuilder | Modelica | `src/export/visual/utils/modelica.ts` |
| JSONExportBuilder | JSON export | `src/export/visual/utils/json.ts` |

**Usage Pattern:**
```typescript
const dot = new DOTGraphBuilder()
  .setRankDir('TB')
  .addNode({ id: 'n1', label: 'Node 1' })
  .addEdge({ from: 'n1', to: 'n2' })
  .render();
```
