# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DeepThinking MCP is a TypeScript-based Model Context Protocol server featuring **33 reasoning modes** (29 with dedicated thought types) with taxonomy-based classification (69 reasoning types across 12 categories, 110 planned), enterprise security, proof decomposition, ModeHandler architecture, and visual export capabilities including native SVG.

**Version**: 8.5.0 | **Node**: >=18.0.0 | **Entry Point**: `dist/index.js`

## Project Metrics

| Metric | Value |
|--------|-------|
| TypeScript Files | 222 |
| Lines of Code | ~92,000 |
| Total Exports | 1150 (525 re-exports) |
| Passing Tests | 4573 (168 test files) |
| Reasoning Modes | 33 (29 with dedicated types + 4 advanced runtime) |
| MCP Tools | 13 focused (includes deepthinking_analyze) |
| Export Formats | 8 + native SVG + file export |
| Visual Exporters | 25+ mode-specific files |
| Specialized Handlers | 36 (33 modes + GenericModeHandler + CustomHandler) |
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
npm run test:run     # Run all tests once (CI mode)
npm run test:publish # Run tests for publishing (skips benchmarks)
npm run test:coverage # Generate coverage reports

# Run a single test file
npm test -- tests/unit/session/manager.test.ts

# Run tests matching a pattern
npm test -- -t "SessionManager"
```

Test framework: Vitest with V8 coverage provider.

## Architecture

### Service Layer Pattern

Business logic extracted from `src/index.ts` into focused services:

| Service | File | Size | Purpose |
|---------|------|------|---------|
| **ThoughtFactory** | `src/services/ThoughtFactory.ts` | 25KB | Mode-specific thought creation for all 33 modes |
| **ExportService** | `src/services/ExportService.ts` | 21KB | Multi-format export orchestration |
| **ModeRouter** | `src/services/ModeRouter.ts` | 12KB | Mode switching and recommendations |
| **MetaMonitor** | `src/services/MetaMonitor.ts` | 9KB | Session tracking and meta-reasoning insights |

### ModeHandler Architecture (v8.x)

**Phase 10 Sprint 3 (v8.4.0)**: All 33 reasoning modes now have fully implemented specialized handlers.

The Strategy Pattern-based ModeHandler system in `src/modes/handlers/` provides 36 total handlers:

| Category | Handlers | Key Features |
|----------|----------|--------------|
| **Core (5)** | Sequential, Shannon, Mathematics, Physics, Hybrid | Mode-specific validation and thought creation |
| **Fundamental (3)** | Inductive, Deductive, Abductive | Reasoning triad implementation |
| **Causal/Probabilistic (6)** | Causal, Bayesian, Counterfactual, Temporal, GameTheory, Evidential | Auto computation (posteriors, equilibria), validation |
| **Analogical (2)** | Analogical, FirstPrinciples | Mapping and decomposition logic |
| **Systems/Scientific (3)** | SystemsThinking, ScientificMethod, FormalLogic | 8 Archetypes detection, proof logic |
| **Academic (4)** | Synthesis, Argumentation, Critique, Analysis | Coverage tracking, Socratic questions |
| **Engineering (4)** | Engineering, Computability, Cryptanalytic, Algorithmic | CLRS coverage, Turing machines, Decibans |
| **Advanced Runtime (6)** | MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization | Strategic oversight, constraint solving |
| **Fallback (2)** | GenericModeHandler, CustomHandler | Default behavior, user-defined modes |

**ModeHandlerRegistry** singleton manages all handlers via Strategy pattern:

- `hasSpecializedHandler(mode)` - Check implementation status
- `getHandler(mode)` - Get handler (specialized or generic fallback)
- `createThought(input, sessionId)` - Delegate to appropriate handler
- `registerAllHandlers()` - Initialize all 33 handlers at startup

### Key Directories

```
src/
├── index.ts           # MCP server entry point (tool handlers)
├── types/             # Type definitions for 33 modes
│   ├── core.ts        # ThinkingMode enum, Thought union type
│   └── modes/         # One file per reasoning mode (26 files)
├── services/          # Business logic layer
├── session/           # SessionManager, persistence, storage abstraction
├── taxonomy/          # 69 reasoning types (110 planned), classifier
├── export/            # Visual and document exporters
│   └── visual/        # Per-mode visual exporters (Mermaid, DOT, ASCII, SVG)
├── proof/             # Proof decomposition system (6 modules: decomposer, gap-analyzer, assumption-tracker, inconsistency-detector, circular-detector, dependency-graph)
├── search/            # Full-text search engine with faceted filtering
├── cache/             # LRU/LFU/FIFO caching strategies
├── repositories/      # Repository pattern (ISessionRepository interface)
├── modes/             # Advanced reasoning mode implementations
├── tools/             # MCP tool definitions and schemas
├── utils/             # Utility functions (errors, logger, sanitization)
└── validation/        # Zod schemas for input validation
```

### Type System

All 33 reasoning modes defined in `src/types/core.ts`:

- `ThinkingMode` enum - Mode identifiers
- `Thought` union type - Discriminated union of all thought types
- `FULLY_IMPLEMENTED_MODES` - 21 modes with complete runtime logic
- `EXPERIMENTAL_MODES` - 12 modes with validators but limited runtime
- Type guards: `isSequentialThought()`, `isAlgorithmicThought()`, `isSynthesisThought()`, etc.

Mode-specific types in `src/types/modes/` (one file per mode).

### Path Aliases

Configured in `tsconfig.json`:

- `@/*` → `src/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`
- `@validation/*` → `src/validation/*`
- `@modes/*`, `@session/*`, `@search/*`, `@cache/*`, `@export/*`, `@taxonomy/*`

## The 33 Reasoning Modes

### Fully Implemented (29 modes with dedicated thought types)

| Category | Modes | Status |
|----------|-------|--------|
| **Core (5)** | Sequential, Shannon, Mathematics, Physics, Hybrid | ✅ Full implementation |
| **Fundamental (3)** | Inductive, Deductive, Abductive | ✅ Full implementation |
| **Causal/Probabilistic (6)** | Causal, Bayesian, Counterfactual, Temporal, GameTheory, Evidential | ✅ Full implementation |
| **Analogical (2)** | Analogical, FirstPrinciples | ✅ Full implementation |
| **Systems/Scientific (3)** | SystemsThinking, ScientificMethod, FormalLogic | ✅ Full implementation |
| **Academic (4)** | Synthesis, Argumentation, Critique, Analysis | ✅ Full implementation |
| **Engineering (4)** | Engineering, Computability, Cryptanalytic, Algorithmic | ✅ Full implementation |

### Advanced Runtime Modes (4 modes - validators + handlers)

| Mode | Status | Purpose |
|------|--------|---------|
| **MetaReasoning** | ✅ Handler v8.4.0 | Strategic oversight of reasoning |
| **Recursive** | ✅ Handler v8.4.0 | Self-referential analysis |
| **Modal** | ✅ Handler v8.4.0 | Possibility/necessity logic |
| **Stochastic** | ✅ Handler v8.4.0 | Probabilistic state transitions |
| **Constraint** | ⚠️ Validator only | Constraint satisfaction |
| **Optimization** | ✅ Handler v8.4.0 | Constraint optimization |

**Note**: All 33 modes have specialized handlers as of v8.4.0. Advanced runtime modes have limited business logic but full ModeHandler support.

## Recent Version History

| Version | Phase | Key Features |
|---------|-------|--------------|
| **v8.5.0** | Phase 13 Sprint 1-2 | **FLUENT BUILDERS**: DOTGraphBuilder, MermaidGraphBuilder, GraphMLBuilder + ASCIIDocBuilder, SVGBuilder, TikZBuilder fluent APIs |
| **v8.4.0** | Phase 10 Sprint 3 | **ALL 33 MODES SPECIALIZED**: Complete ModeHandler coverage, 36 total handlers, registerAllHandlers() function |
| **v8.3.2** | Phase 15 | Code quality: Type safety, error handling docs, magic number extraction, deterministic logic |
| **v8.3.1** | Phase 15 | Version synchronization in visual exporters, Phase 11 documentation |
| **v8.3.0** | Phase 15 | Mode scaffolding templates for v8+ architecture, chunker utility for file management |
| **v8.2.1** | Phase 10 Sprint 2B | ThoughtFactory handler integration fix, documentation updates |
| **v8.2.0** | Phase 10 Sprint 2B | Advanced ModeHandlers: Synthesis, SystemsThinking (8 archetypes), Critique (6 Socratic categories) |
| **v8.1.0** | Phase 10 Sprint 2 | Core ModeHandlers: Causal, Bayesian, GameTheory, Counterfactual |
| **v8.0.0** | Phase 10 Sprint 1 | ModeHandler Infrastructure - Strategy Pattern architecture, Registry singleton |
| **v7.5.2** | Phase 14 | Bug fix: All 11 experimental modes now return correct mode type |
| **v7.5.0** | Phase 14 | Accessible Reasoning Modes - 12 focused MCP tools |

## MCP Tools (v8.4.0)

The server provides 13 focused tools + 1 legacy tool with hand-written JSON schemas:

| Tool | Modes/Functions | Version |
|------|--------|---------|
| `deepthinking_core` | inductive, deductive, abductive | ✅ v8.4.0 |
| `deepthinking_standard` | sequential, shannon, hybrid | ✅ v8.4.0 |
| `deepthinking_mathematics` | mathematics, physics, computability | ✅ v8.4.0 |
| `deepthinking_temporal` | temporal | ✅ v8.4.0 |
| `deepthinking_probabilistic` | bayesian, evidential | ✅ v8.4.0 |
| `deepthinking_causal` | causal, counterfactual | ✅ v8.4.0 |
| `deepthinking_strategic` | gametheory, optimization | ✅ v8.4.0 |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning, cryptanalytic | ✅ v8.4.0 |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic | ✅ v8.4.0 |
| `deepthinking_engineering` | engineering, algorithmic | ✅ v8.4.0 |
| `deepthinking_academic` | synthesis, argumentation, critique, analysis | ✅ v8.4.0 |
| `deepthinking_session` | Session management (create, list, delete, export, get_session, switch_mode, recommend_mode) | ✅ v8.4.0 |
| `deepthinking_analyze` | Multi-mode analysis with presets and merge strategies | ✅ Phase 12 Sprint 3 |

## Adding New Features

### New Reasoning Mode

1. Create type definition: `src/types/modes/newmode.ts`
2. Add to `ThinkingMode` enum in `src/types/core.ts`
3. Add to `Thought` union type and appropriate mode array
4. Create handler: `src/modes/newmode-reasoning.ts`
5. Update `ThoughtFactory` to handle the mode
6. Add Zod validator in `src/validation/validators/modes/`
7. Create visual exporter in `src/export/visual/`

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

For parallel reasoning or handling multiple concurrent sessions, you can run multiple instances that share a common session directory:

```json
{
  "mcpServers": {
    "deepthinking-1": {
      "command": "node",
      "args": ["C:/path/to/deepthinking-mcp/dist/index.js"],
      "env": {
        "SESSION_DIR": "C:/shared/deepthinking-sessions"
      }
    },
    "deepthinking-2": {
      "command": "node",
      "args": ["C:/path/to/deepthinking-mcp/dist/index.js"],
      "env": {
        "SESSION_DIR": "C:/shared/deepthinking-sessions"
      }
    },
    "deepthinking-3": {
      "command": "node",
      "args": ["C:/path/to/deepthinking-mcp/dist/index.js"],
      "env": {
        "SESSION_DIR": "C:/shared/deepthinking-sessions"
      }
    }
  }
}
```

**Features:**

- **Shared Sessions**: All instances share sessions via file-based storage
- **File Locking**: Automatic cross-process file locking prevents race conditions
- **Concurrent Reads**: Multiple instances can read sessions simultaneously (shared locks)
- **Safe Writes**: Exclusive locks ensure atomic writes
- **Stale Lock Detection**: Automatic cleanup of locks from crashed processes

**Environment Variables:**

- `SESSION_DIR` - Path to shared session directory (enables file-based storage)
  - If not set: Uses in-memory storage (single instance mode)
  - If set: Uses FileSessionStore with cross-process file locking

**Use Cases:**

- Run different reasoning modes in parallel
- Handle multiple conversations simultaneously
- Distribute complex analysis across multiple instances

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
| `src/types/modes/algorithmic.ts` | CLRS algorithm analysis types |
| `src/types/modes/computability.ts` | Turing machine types |
| `src/types/modes/cryptanalytic.ts` | Deciban evidence system types |
| `src/types/modes/synthesis.ts` | Literature synthesis types |
| `src/types/modes/argumentation.ts` | Toulmin model argumentation types |
| `src/types/modes/critique.ts` | Critical analysis types |
| `src/types/modes/analysis.ts` | Qualitative analysis types |
| `src/modes/handlers/ModeHandler.ts` | Handler interface definition |
| `src/modes/handlers/ModeHandlerRegistry.ts` | Singleton registry for handlers |
| `src/modes/handlers/SystemsThinkingHandler.ts` | 8 Systems Archetypes detection |

## Development Best Practices

### Cleanup Before Committing/Publishing

**CRITICAL**: Always remove temporary debug/test artifacts before committing or publishing:

```bash
# Before git commit - check for junk files
git status

# Common temporary files to remove:
rm test-*.mjs test-*.js debug-*.js temp-*.js .error.txt

# Verify only intended files are staged
git diff --cached
```

**Cleanup Checklist:**

- Remove temporary test scripts (e.g., `test-mcp-server.mjs`, `test-schema-output.js`)
- Delete debug files created during troubleshooting
- Check for `.error.txt` or other runtime artifacts
- Review `git status` output before committing
- Verify `dist/` doesn't contain test artifacts before publishing
- Run tests to ensure nothing broke after cleanup

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

**Why This Order Matters:**

- Typecheck catches errors before wasting time on builds
- Tests verify correctness before building
- Building only when code is verified saves time
- Never commit broken code

**Common Mistakes:**

- Building before typechecking (wastes time if types are wrong)
- Building before testing (wastes time if tests fail)
- Committing source without rebuilding dist/
- Publishing with outdated dist/ files

## Memory Usage Reminder

**IMPORTANT**: Use the `memory-mcp` tools periodically during sessions to:

1. **At session start**: Search for existing context with `mcp__memory-mcp__search_nodes` using query "deepthinking-mcp"
2. **During work**: Add observations for significant changes with `mcp__memory-mcp__add_observations`
3. **At session end**: Update memory with session summary and any new findings

This ensures continuity across sessions and prevents loss of important project context.

## Documentation

Additional documentation in `docs/architecture/`:

- `OVERVIEW.md` - Comprehensive project overview
- `ARCHITECTURE.md` - Detailed system architecture
- `COMPONENTS.md` - Component deep-dive
- `DATA_FLOW.md` - Data flow diagrams
- `DEPENDENCY_GRAPH.md` - Module dependency analysis (auto-generated)

Mode-specific documentation in `docs/modes/`:

- `SYNTHESIS.md` - Literature synthesis mode guide
- `ARGUMENTATION.md` - Academic argumentation documentation
- `CRITIQUE.md` - Critical analysis mode guide
- `ANALYSIS.md` - Qualitative analysis documentation

Generate dependency docs: `npm run docs:deps`

## Phase 13: Visual Exporter Refactoring

**Goal**: Adopt shared utility modules (DOT, Mermaid, ASCII) across all 22 visual mode exporters to reduce code duplication and file sizes.

**Sprint 1 (v8.5.0)**: Core Graph Builders

- Added `DOTGraphBuilder` fluent API class to `src/export/visual/utils/dot.ts`
- Added `MermaidGraphBuilder` fluent API class to `src/export/visual/utils/mermaid.ts`
- Added `GraphMLBuilder` fluent API class to `src/export/visual/utils/graphml.ts`
- Created 64 unit tests in `tests/unit/export/visual/utils/graph-builders.test.ts`

**Sprint 2 (v8.5.0)**: Visual Format Builders

- Added `ASCIIDocBuilder` fluent API class to `src/export/visual/utils/ascii.ts`
- Added `SVGBuilder` and `SVGGroupBuilder` fluent API classes to `src/export/visual/utils/svg.ts`
- Added `TikZBuilder` fluent API class to `src/export/visual/utils/tikz.ts`
- Created 89 unit tests in `tests/unit/export/visual/utils/visual-builders.test.ts`

**Sprint 3 (v8.5.0)**: Document Format Builders

- Added `UMLBuilder` fluent API class to `src/export/visual/utils/uml.ts`
- Added `HTMLDocBuilder` fluent API class to `src/export/visual/utils/html.ts`
- Added `MarkdownBuilder` fluent API class to `src/export/visual/utils/markdown.ts`
- Added `ModelicaBuilder` fluent API class to `src/export/visual/utils/modelica.ts`
- Added `JSONExportBuilder` fluent API class to `src/export/visual/utils/json.ts`
- Created 115 unit tests in `tests/unit/export/visual/utils/document-builders.test.ts`

**Sprint 4 (v8.5.0)**: Integration Tests & Documentation

- Created `tests/integration/export/visual/builders-integration.test.ts` with 18 real-world usage tests
- Created `tests/integration/export/visual/mode-exporters-snapshot.test.ts` with 15 snapshot tests
- Tests cover all 11 builder classes: DOTGraphBuilder, MermaidGraphBuilder, GraphMLBuilder, ASCIIDocBuilder, SVGBuilder, SVGGroupBuilder, TikZBuilder, UMLBuilder, HTMLDocBuilder, MarkdownBuilder, ModelicaBuilder, JSONExportBuilder

**Builder Pattern Benefits**:

```typescript
// Before: Inline string building (duplicated in 21 files)
let dot = 'digraph G {\n';
dot += '  rankdir=TB;\n';
dot += `  ${id} [label="${label}"];\n`;
dot += '}\n';

// After: Fluent API builder
const dot = new DOTGraphBuilder()
  .setRankDir('TB')
  .addNode({ id, label })
  .render();
```

**Remaining Sprints** (6 more planned):

| Sprint | Focus |
|--------|-------|
| 5-7 | Refactor 12 critical files (>1000 lines) |
| 8-9 | Refactor remaining 9 modes for consistency |
| 10 | File splitting if needed, final verification |

See `docs/planning/PHASE_13_*.json` for detailed sprint breakdowns.

## Phase 15: Code Quality & Tooling

**Type Safety Initiative (v8.3.2)**

- Added proper TypeScript types to all 10 MCP handler functions in `src/index.ts`
- Created handler input types: `ThoughtInput`, `SessionInput`, `AnalyzeInputType`
- Made `MCPResponse` interface extensible with index signature for SDK compatibility
- Fixed type assertions for Zod schema compatibility

**Error Handling Documentation**
Improved 16 empty catch blocks across 7 files with explanatory comments:

- Cache modules (LRU, LFU, FIFO) - Non-serializable value handling in estimateSize()
- CausalHandler - Optional centrality computation failures
- CustomHandler - Validation rule evaluation errors
- FileSessionStore (5 blocks) - File access and existence checks
- FileLock (3 blocks) - Lock file operations and cleanup
- ValidatorRegistry - Module loading failures

**Magic Number Extraction**

- Created `ANALYZER_CONSTANTS` object in `src/modes/combinations/analyzer.ts`:
  - `DEFAULT_TIMEOUT_MS: 30000`
  - `MAX_PARALLEL_MODES: 5`
  - `MIN_CONFIDENCE_THRESHOLD: 0.3`
  - `BASE_INSIGHT_CONFIDENCE: 0.8`
- Added `MAX_INT32` constant (2^31 - 1) in stochastic RNG
- Replaced `Math.random()` with deterministic `BASE_INSIGHT_CONFIDENCE` where appropriate

**Phase 16: File Export System (Unreleased)**

- **Environment Configuration**
  - `MCP_EXPORT_PATH` - Set default export directory
  - `MCP_EXPORT_OVERWRITE` - Control file overwrite (default: false)
- **Export Profiles**: academic, presentation, documentation, archive, minimal
- **File Organization**: `{exportDir}/{sessionId}/{sessionId}_{mode}_{format}.{ext}`

## Phase 11: Comprehensive Test Coverage Initiative

Phase 11 is a dedicated testing phase targeting 95%+ coverage (700 tests across 19 categories) for all deepthinking-mcp tools, modes, and features.

**Planning Documents** in `docs/planning/`:

- `TEST_PLAN.md` - Master test plan with 700 enumerated test cases
- `PHASE_11_INDEX.json` - Sprint index and category breakdown
- `PHASE_11_SPRINT_1_TODO.json` through `PHASE_11_SPRINT_11_TODO.json` - Individual sprint tasks

**Test Categories (19 total, 700 tests)**:

| Category | Tests | Focus |
|----------|-------|-------|
| COR | 45 | Core reasoning (inductive, deductive, abductive) |
| STD | 38 | Standard workflows + runtime-only modes |
| PAR | 32 | Common parameters validation |
| MTH | 54 | Mathematics, physics, computability |
| TMP | 40 | Temporal reasoning |
| PRB | 25 | Probabilistic (Bayesian, evidential) |
| CSL | 30 | Causal and counterfactual |
| STR | 30 | Strategic (game theory, optimization) |
| ANL | 34 | Analytical modes |
| SCI | 38 | Scientific modes |
| ENG | 36 | Engineering and algorithmic |
| ACD | 83 | Academic research modes |
| SES | 26 | Session management |
| EXP | 61 | Export formats |
| HDL | 43 | ModeHandler specialized tests |
| EDG | 35 | Edge cases |
| REG | 10 | Regression tests |
| INT | 20 | Integration scenarios |
| PRF | 20 | Performance tests |

**Sprint Overview** (66.5 hours total):

1. Test Infrastructure & Core (45 tests)
2. Standard Workflows & Parameters (70 tests)
3. Mathematics/Physics/Computability (54 tests)
4. Temporal & Probabilistic (65 tests)
5. Causal & Strategic (60 tests)
6. Analytical & Scientific (72 tests)
7. Engineering & Academic (119 tests) - largest sprint
8. Session & Exports (87 tests)
9. ModeHandler Specialized (43 tests)
10. Edge Cases & Regression (45 tests)
11. Integration & Performance (40 tests)

## Standalone Tools

The `tools/` directory contains standalone utilities compiled to executables with Bun:

| Tool | Location | Purpose |
|------|----------|---------|
| **chunker.exe** | `tools/chunker/` | Split large files into editable sections, then merge back |
| **compress-for-context.exe** | `tools/compress-for-context/` | CTON context compression for LLM context windows |
| **create-dependency-graph.exe** | `tools/create-dependency-graph/` | Generates dependency graph documentation |

### Chunker - Supported File Types

| File Type | Extensions | Split Strategy |
|-----------|------------|----------------|
| **Markdown** | `.md` | By heading levels (`##`, `###`, etc.) |
| **JSON** | `.json` | By top-level object keys |
| **TypeScript** | `.ts`, `.tsx`, `.js`, `.jsx` | By declarations (imports, functions, classes, types) |

### Usage

```bash
# Split markdown by ## headings
tools/chunker/chunker.exe split docs/ARCHITECTURE.md

# Split TypeScript by declarations (functions, classes, types)
tools/chunker/chunker.exe split src/index.ts

# Split JSON by top-level keys
tools/chunker/chunker.exe split package.json

# Check status and merge
tools/chunker/chunker.exe status docs/ARCHITECTURE_chunks/manifest.json
tools/chunker/chunker.exe merge docs/ARCHITECTURE_chunks/manifest.json

# Compress files for LLM context
tools/compress-for-context/compress-for-context.exe README.md -l aggressive
tools/compress-for-context/compress-for-context.exe -b -r -p "*.md" ./docs

# Generate dependency graph (run from any TypeScript project)
tools/create-dependency-graph/create-dependency-graph.exe C:\path\to\project
```

All tools are self-contained (~114MB each, includes Bun runtime) and require no Node.js installation.

### Recommended Workflow for Large Files

When working with large documentation files that exceed context limits:

| Phase | Tool | Purpose |
|-------|------|---------|
| **Reading/Understanding** | compress-for-context | Reduce large file to fit context window |
| **Editing** | chunker | Split into sections, edit, merge back |

**Step-by-step workflow:**

```
1. Encounter large file (e.g., ARCHITECTURE.md - 500+ lines)
     ↓
2. compress-for-context → Read compressed version to understand structure
     ↓
3. Identify which sections need editing
     ↓
4. chunker split → Creates individual section files
     ↓
5. Edit only the relevant chunk files (smaller context per edit)
     ↓
6. chunker status → Verify what changed
     ↓
7. chunker merge → Reassemble with automatic backup
```

**Example session:**

```bash
# 1. Understand the large file structure
tools/compress-for-context/compress-for-context.exe docs/ARCHITECTURE.md -l moderate

# 2. Split into editable chunks
tools/chunker/chunker.exe split docs/ARCHITECTURE.md

# 3. Edit specific sections (e.g., 008-core-components.md)
# ... make edits to individual chunk files ...

# 4. Check what changed
tools/chunker/chunker.exe status docs/ARCHITECTURE_chunks/manifest.json

# 5. Merge back with backup
tools/chunker/chunker.exe merge docs/ARCHITECTURE_chunks/manifest.json
```
