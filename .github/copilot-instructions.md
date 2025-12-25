# DeepThinking MCP - AI Agent Guidelines

**Version**: 8.4.0 | **Framework**: TypeScript MCP Server | **Node**: >=18.0.0

## Architecture Overview

This is a **Model Context Protocol (MCP) server** providing 33 reasoning modes (29 with dedicated thought types) for complex problem-solving. The v8.x architecture uses:

- **Strategy Pattern**: `ModeHandlerRegistry` dispatches to 36 handlers (7 specialized + 29 generic) in [src/modes/](src/modes/)
- **Service Layer**: Business logic extracted into `ThoughtFactory`, `ExportService`, `ModeRouter`, `MetaMonitor` in [src/services/](src/services/)
- **Repository Pattern**: `SessionManager` with pluggable `SessionStorage` (in-memory or file-based) in [src/session/](src/session/)
- **Tool Definitions**: 13 focused MCP tools defined in [src/tools/](src/tools/) - hand-written JSON schemas with Zod runtime validation

### Key Directories

```
src/
├── index.ts              # MCP server entry point, tool handlers
├── types/                # 33 mode type definitions (one file per mode)
├── services/             # ThoughtFactory, ExportService, ModeRouter, MetaMonitor
├── modes/                # ModeHandlerRegistry + handlers/ subdirectory
├── session/              # SessionManager, storage/, metrics
├── tools/                # Tool definitions, JSON schemas, Zod validators
├── export/visual/        # 25 modular exporters (Mermaid, DOT, ASCII, SVG)
└── taxonomy/             # 69 reasoning types, classifier (110 planned)
```

### Path Aliases (tsconfig.json)

- `@/*` → `src/*` | `@types/*` → `src/types/*` | `@utils/*` → `src/utils/*`
- `@modes/*`, `@session/*`, `@search/*`, `@cache/*`, `@export/*`, `@taxonomy/*`

## The 33 Reasoning Modes

| Category              | Modes                                                                               |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Core (5)**          | Sequential, Shannon, Mathematics, Physics, Hybrid                                   |
| **Engineering (1)**   | Engineering (Requirements, Trade Studies, FMEA, ADRs)                               |
| **Historical (2)**    | Computability (Turing), Cryptanalytic (Decibans)                                    |
| **Algorithmic (1)**   | Algorithmic (CLRS coverage)                                                         |
| **Academic (4)**      | Synthesis, Argumentation, Critique, Analysis                                        |
| **Advanced (6)**      | MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization               |
| **Fundamental (2)**   | Inductive, Deductive                                                                |
| **Experimental (12)** | Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, GameTheory, etc. |

## Development Workflows

### Build & Test Commands

```bash
npm run build              # tsup → dist/ (ESM only)
npm test                   # Vitest watch mode (3539 tests)
npm run test:run           # CI mode, single pass
npm run test:publish       # Pre-publish (skips benchmarks)
npm run typecheck          # tsc --noEmit for type checking
npm run lint               # ESLint on src/
```

**Test Organization**: `tests/unit/`, `tests/integration/`, `tests/performance/`, `tests/edge-cases/`

### Build & Publish Workflow (CRITICAL)

1. `npm run typecheck` (Catch errors early)
2. `npm run test:publish` (Verify before building)
3. `npm run build` (Build verified code)
4. `git add -A && git commit` (Commit source + dist)
5. `npm publish`

## Critical Conventions

### 1. Mode Handler Pattern (v8.x)

When adding mode-specific logic, **extend or create a handler** in [src/modes/handlers/](src/modes/handlers/), not the `ThoughtFactory` switch statement. Register in [src/modes/index.ts](src/modes/index.ts).

### 2. Tool Schema Alignment

Tools use **hand-written JSON schemas** ([src/tools/json-schemas.ts](src/tools/json-schemas.ts)) for MCP, with Zod schemas ([src/tools/schemas/](src/tools/schemas/)) for runtime validation. **Sync both** when modifying parameters.

### 3. Adding New Features

1. **New Mode**: Type in `src/types/modes/`, add to `ThinkingMode` enum, create handler in `src/modes/handlers/`, add Zod validator, create visual exporter.
2. **New Export**: Create in `src/export/`, register in `ExportService`.
3. **New Tool**: Define schema in `src/tools/schemas/`, add handler in `src/index.ts`.

### 4. Visual Export System

**Modular exporters** (25 files) in [src/export/visual/](src/export/visual/) generate Mermaid, DOT, ASCII, and **native SVG**. Edit mode-specific files, not the monolithic `VisualExporter`.

### 5. Lazy Service Initialization

Services in [src/index.ts](src/index.ts) are **lazily loaded** via getter functions (e.g., `getSessionManager()`) to reduce startup time.

## Standalone Tools (Bun-compiled)

- **chunker.exe**: Split/merge large files (Markdown, JSON, TS) for editing.
- **compress-for-context.exe**: CTON compression for LLM context windows.
- **create-dependency-graph.exe**: Generates module dependency docs.

## Common Pitfalls

1. **Don't bypass ModeHandlerRegistry**: Use `registry.createThought()`.
2. **Don't modify `src/index.ts` for mode logic**: Extract to handlers or services.
3. **Cleanup Before Commit**: Remove `test-*.js`, `debug-*.js`, `.error.txt`.
4. **Circular dependencies**: 55 type-only cycles exist but are safe. Avoid runtime cycles.
5. **Type safety**: 100% TypeScript, only 1 `@ts-expect-error` allowed.

## Quick Reference

| Task               | Command / Location                                 |
| ------------------ | -------------------------------------------------- |
| Add new mode       | `src/types/modes/` + `src/modes/handlers/`         |
| Add tool parameter | `src/tools/json-schemas.ts` + `src/tools/schemas/` |
| Debug test         | `npm test -- tests/unit/my-file.test.ts`           |
| Generate docs      | `npm run docs:deps`                                |
| Split large file   | `tools/chunker/chunker.exe split <file>`           |
