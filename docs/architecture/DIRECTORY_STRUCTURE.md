<!-- repo-map:no-verification -->
<!-- This guide deliberately makes no numeric claims: hand-maintained per-directory
     file counts self-contradicted in the previous version. Counts live in the
     generated file-inventory data and in docs with Verification blocks. -->
# Directory Structure Guide

This document explains what each directory is for. It does not list per-directory file
counts. A prior revision hand-maintained those counts in two places (an overview tree and a
per-directory prose line) and the two disagreed with each other in several directories, and
both disagreed with the codebase. For a current, single-source count of any directory, read
`DEPENDENCY_GRAPH.md`'s module table or `file-inventory.json` directly — do not hand-copy a
count into this file again.

## `src/` — the package

### `index.ts`
The MCP server entry point. `buildServer()` registers the `tools/list` and `tools/call` handlers,
and the `tools/call` handler dispatches all 13 tools. The module starts the stdio server only
when it is the process entry point. No mode-specific logic — that lives in `src/modes/` and
`src/services/` by convention.

### `types/`
Type definitions for all reasoning modes. `core.ts` holds the `ThinkingMode` enum and the
`Thought` discriminated union. `modes/` holds one file per mode with a dedicated thought type.

### `modes/`
Reasoning-mode implementations. `handlers/` holds one Strategy-pattern handler per mode
family. `registry.ts` is the `ModeHandlerRegistry` singleton. `combinations/` implements
multi-mode analysis and is loaded on demand by a dynamic import from `src/index.ts`.
`stochastic/` holds stochastic-mode sampling and distribution models.

### `services/`
Business logic extracted out of `index.ts`: `ThoughtFactory.ts` (thought creation) and
`ExportService.ts` (export orchestration).

### `session/`
`SessionManager` and its lifecycle. `storage/` abstracts in-memory vs. file-based session
storage (`SESSION_DIR`). The cross-process file locking for the multi-instance case is in
`src/utils/file-lock.ts`. See `DATAFLOW.md` for the live/dead distinction between this and the
separate, non-functional `MCP_ENABLE_PERSISTENCE` config field.

### `validation/`
Thought validation: `ThoughtValidator`, the per-mode validators and the advisory wrapper.
`validators/registry.ts` lists all 34 registered mode validators and imports each one by name at
runtime. `validators/index.ts` is a static barrel that exports 25 validator classes: 24 of the
registered ones and `MetaValidator`, which is not a registered mode. The Zod schemas for
tool-call arguments are in `src/tools/`. `validation/index.ts` is unused.

### `export/`
Document exporters at the top level. `visual/` holds diagram-format exporters:
`visual/modes/` (one file per mode) and `visual/utils/` (shared builder classes — DOT,
Mermaid, SVG, TikZ, and others). `export/index.ts` is unused — consumers import the
concrete exporter files directly.

### `proof/`
Proof decomposition: decomposition, gap analysis, assumption tracking, inconsistency
detection, circular-reasoning detection, hierarchical proof structures, and a strategy
recommender. `proof/index.ts` is unused, for the same reason as `export/index.ts`.

### `taxonomy/`
Reasoning-type classification. `reasoning-types.ts` defines all 69 reasoning types.
`advisory.ts` is the entry point that the live request path uses. It wraps the classifier and
the suggestion engine.

### `cache/`
The LRU cache (`lru.ts`) and its types (`types.ts`). The `CacheStrategy` type in `types.ts` also
names `lfu` and `fifo`, but no file implements them. `cache/index.ts` is unused — consumers import
`lru.ts` and `types.ts` directly.

### `config/`
Centralized environment-variable configuration. See `DATAFLOW.md`'s "Data Persistence"
section for a specific example of a config field that is read here but consumed nowhere else.

### `interfaces/`
Dependency-injection interfaces.

### `tools/`
MCP tool definitions and schemas. `definitions.ts` lists the tools and maps each tool name to its
Zod schema (`toolSchemas`). `schemas/` holds the Zod schemas themselves: `shared.ts` holds the
shared field schemas and enums, `base.ts` holds `BaseThoughtSchema` and `SessionActionSchema` (the
schema of the session tool), `analyze.ts` holds the schema of the analyze tool, and the ten
`modes/<group>.ts` files hold the 11 schemas of the mode-grouping tools (`modes/core.ts` holds two:
the core tool and the standard tool).
`json-schemas.ts` holds the JSON Schemas that `tools/list` advertises. `thinking.ts` holds the
schema of the legacy `deepthinking` tool.

### `utils/`
`errors.ts` (the `DeepThinkingError` hierarchy and its subclasses), `logger.ts`, and
`sanitization.ts` (includes the canonical `escapeLatex`, which `export/visual/utils/tikz.ts`,
`export/visual/utils/latex.ts` and `services/ExportService.ts` use), and
`file-lock.ts` (the cross-process file locks).

## `templates/mode-scaffolding/`

Five copy-paste template files (`example-mode.handler.ts`, `.json-schema.ts`, `.schema.ts`,
`.type.ts`, `.validator.ts`) for authoring a new reasoning mode. Intentionally never imported
by `src/` — a human copies these to start a new mode, following the procedure documented in
the repo's README and `CLAUDE.md`. Do not report these as dead code; there is no way for a
static import scanner to represent "reachable via human copy-paste."

## `tests/`

Mirrors the `src/` directory structure under `tests/{unit,integration,edge-cases,performance}/`.

## `tools/`

Standalone CLI utilities, built separately from the main package: a markdown-file
chunker/merger, a context-compression tool, a field extractor for the schema-parity check
(`schema-parity`), and the dependency-graph generator (`create-dependency-graph`) that produces
`DEPENDENCY_GRAPH.md`.

`create-dependency-graph/` keeps orchestration in its entry file and the work in `src/`, layered
so the module graph stays acyclic: `types.ts` and `paths.ts` are leaves, `config.ts` resolves the
project root and output paths, `scanner.ts` is the only layer that reads source text, `analysis.ts`
derives the graph, and `reporters/` render it without re-reading source. Run the generator from
source with `npm run docs:deps`. The chunker and the context-compression tool are committed as
`.exe` files that are built from their sources. A committed `.exe` **goes stale silently**, so
rebuild it whenever its tool changes.

## `docs/architecture/`

This document set, plus the machine-generated reports it points to
(`DEPENDENCY_GRAPH.md`, `unused-analysis.md`, and their JSON/YAML equivalents).
