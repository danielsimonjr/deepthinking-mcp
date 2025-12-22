# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DeepThinking MCP is a TypeScript-based Model Context Protocol server featuring **33 reasoning modes** (29 with dedicated thought types) with taxonomy-based classification (69 reasoning types across 12 categories, 110 planned), enterprise security, proof decomposition, ModeHandler architecture, and visual export capabilities including native SVG.

**Version**: 8.3.2 | **Node**: >=18.0.0 | **Entry Point**: `dist/index.js`

## Project Metrics

| Metric | Value |
|--------|-------|
| TypeScript Files | 221 |
| Lines of Code | ~89,490 |
| Total Exports | 1134 (519 re-exports) |
| Passing Tests | 3539 (143 test files) |
| Reasoning Modes | 33 (21 fully implemented + 12 experimental) |
| MCP Tools | 12 focused + 1 legacy |
| Export Formats | 8 + native SVG |
| Visual Exporters | 35+ mode-specific files |
| Specialized Handlers | 7 ModeHandlers (v8.x architecture) |
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

The Strategy Pattern-based ModeHandler system in `src/modes/handlers/`:

| Handler | Features |
|---------|----------|
| **CausalHandler** | Graph validation, cycle detection, intervention tracking |
| **BayesianHandler** | Auto posterior calculation, evidence tracking |
| **GameTheoryHandler** | Payoff matrix validation, Nash equilibria detection |
| **CounterfactualHandler** | World state tracking, consequence analysis |
| **SynthesisHandler** | Source coverage tracking, theme extraction |
| **SystemsThinkingHandler** | 8 Systems Archetypes detection (Senge patterns) |
| **CritiqueHandler** | 6 Socratic question categories (Paul framework) |

Handler registration via `ModeHandlerRegistry` singleton with `GenericModeHandler` fallback.

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

### Fully Implemented (21 modes)

| Category | Modes |
|----------|-------|
| **Core (5)** | Sequential, Shannon, Mathematics, Physics, Hybrid |
| **Engineering (1)** | Engineering - Requirements, Trade Studies, FMEA, ADRs |
| **Historical Computing (2)** | Computability, Cryptanalytic |
| **Algorithmic (1)** | Algorithmic - CLRS coverage |
| **Academic Research (4)** | Synthesis, Argumentation, Critique, Analysis |
| **Advanced Runtime (6)** | MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization |
| **Fundamental (2)** | Inductive, Deductive |

### Experimental (12 modes)

Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, GameTheory, Evidential, FirstPrinciples, SystemsThinking, ScientificMethod, FormalLogic

Note: 29 modes have dedicated thought types. 4 modes (Recursive, Modal, Stochastic, Constraint) are runtime-only.

## Recent Version History

| Version | Phase | Key Features |
|---------|-------|--------------|
| **v8.2.1** | Phase 10 Sprint 2B | ThoughtFactory handler integration fix, documentation updates |
| **v8.2.0** | Phase 10 Sprint 2B | Advanced ModeHandlers: Synthesis, SystemsThinking (8 archetypes), Critique (6 Socratic categories) |
| **v8.1.0** | Phase 10 Sprint 2 | Core ModeHandlers: Causal, Bayesian, GameTheory, Counterfactual |
| **v8.0.0** | Phase 10 Sprint 1 | ModeHandler Infrastructure - Strategy Pattern architecture, Registry singleton |
| **v7.5.2** | Phase 14 | Bug fix: All 11 experimental modes now return correct mode type |
| **v7.5.0** | Phase 14 | Accessible Reasoning Modes - 12 focused MCP tools |
| **v7.4.0** | Phase 13 | Academic Research modes - Synthesis, Argumentation, Critique, Analysis |
| **v7.3.0** | Phase 12 | ALGORITHMIC mode - CLRS algorithms, DP formulations |
| **v7.0.0** | Phase 8 | Proof Decomposition, Native SVG export |

## MCP Tools

The server provides 12 focused tools + 1 legacy tool:

| Tool | Modes |
|------|-------|
| `deepthinking_core` | inductive, deductive, abductive |
| `deepthinking_standard` | sequential, shannon, hybrid |
| `deepthinking_mathematics` | mathematics, physics, computability |
| `deepthinking_temporal` | temporal |
| `deepthinking_probabilistic` | bayesian, evidential |
| `deepthinking_causal` | causal, counterfactual |
| `deepthinking_strategic` | gametheory, optimization |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning, cryptanalytic |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic |
| `deepthinking_engineering` | engineering, algorithmic |
| `deepthinking_academic` | synthesis, argumentation, critique, analysis |
| `deepthinking_session` | Session management (create, list, delete, export) |

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

## Phase 11: Comprehensive Test Coverage Initiative

Phase 11 is a dedicated testing phase targeting 95%+ coverage across all deepthinking-mcp tools, modes, and features.

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

### Usage

```bash
# Split a large markdown file into editable chunks
tools/chunker/chunker.exe split docs/ARCHITECTURE.md
# Edit individual chunk files in the _chunks directory
# Check status of edited chunks
tools/chunker/chunker.exe status docs/ARCHITECTURE_chunks/manifest.json
# Merge chunks back into the original file
tools/chunker/chunker.exe merge docs/ARCHITECTURE_chunks/manifest.json

# Compress files for LLM context
tools/compress-for-context/compress-for-context.exe README.md -l aggressive
tools/compress-for-context/compress-for-context.exe -b -r -p "*.md" ./docs

# Generate dependency graph (run from any TypeScript project)
tools/create-dependency-graph/create-dependency-graph.exe C:\path\to\project
```

All tools are self-contained (~114MB each, includes Bun runtime) and require no Node.js installation.
