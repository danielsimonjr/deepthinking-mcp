# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DeepThinking MCP is a TypeScript-based Model Context Protocol server featuring **33 reasoning modes** (29 with dedicated thought types) with taxonomy-based classification (69 reasoning types across 12 categories, 110 planned), enterprise security, proof decomposition, and visual export capabilities including native SVG.

**Version**: 7.4.0 | **Node**: >=18.0.0 | **Entry Point**: `dist/index.js`

## Project Metrics

| Metric | Value |
|--------|-------|
| TypeScript Files | 179 |
| Total Exports | 893 (340 re-exports) |
| Passing Tests | 792 |
| Reasoning Modes | 33 (21 fully implemented + 12 experimental) |
| MCP Tools | 10 focused + 1 legacy |
| Export Formats | 8 + native SVG |
| Circular Dependencies | 37 (all type-only, 0 runtime) |

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

- **ThoughtFactory** (`src/services/ThoughtFactory.ts`) - Creates mode-specific thoughts with validation
- **ExportService** (`src/services/ExportService.ts`) - Multi-format export (Markdown, LaTeX, Mermaid, DOT, ASCII, SVG)
- **ModeRouter** (`src/services/ModeRouter.ts`) - Mode switching and recommendations
- **MetaMonitor** (`src/services/MetaMonitor.ts`) - Session tracking and meta-reasoning insights

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
├── proof/             # Proof decomposition, gap analysis, assumption tracking
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
| **v7.4.0** | Phase 13 | Academic Research modes - Synthesis, Argumentation, Critique, Analysis (PhD/scientific writing) |
| **v7.3.0** | Phase 12 | ALGORITHMIC mode - CLRS algorithms, DP formulations, correctness proofs, amortized analysis |
| **v7.2.0** | Phase 11 | COMPUTABILITY (Turing machines), CRYPTANALYTIC (deciban system), von Neumann Game Theory |
| **v7.1.0** | Phase 10 | ENGINEERING mode - Requirements traceability, Trade studies, FMEA, Design decisions |
| **v7.0.0** | Phase 8 | Proof Decomposition, Native SVG export, MathematicsReasoningEngine |
| **v6.1.x** | Phase 7 | Visual export integration, circular dependency fixes |

## MCP Tools

The server provides 10 focused tools + 1 legacy tool:

| Tool | Modes |
|------|-------|
| `deepthinking_core` | inductive, deductive, abductive |
| `deepthinking_standard` | sequential, shannon, hybrid |
| `deepthinking_math` | mathematics, physics, computability |
| `deepthinking_temporal` | temporal |
| `deepthinking_probabilistic` | bayesian, evidential |
| `deepthinking_causal` | causal, counterfactual |
| `deepthinking_strategic` | gametheory, optimization |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning, cryptanalytic |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic |
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
