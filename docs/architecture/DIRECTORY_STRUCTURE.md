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
The MCP server entry point. All 13 tool handlers. No mode-specific logic — that lives in
`src/modes/` and `src/services/` by convention.

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
storage (`SESSION_DIR`). `locks/` implements cross-process file locking for the multi-instance
case. See `DATA_FLOW.md` for the live/dead distinction between this and the separate,
non-functional `MCP_ENABLE_PERSISTENCE` config field.

### `validation/`
Zod schemas and validation logic. `validators/index.ts` is a static barrel covering most mode
validators; `validators/registry.ts` is a separate lazy-loading table that dynamically imports
the remaining mode validators by name at runtime. Both paths are live; only the loading
mechanism differs. `schemas.ts` and `schema-utils.ts` are unused (see `COMPONENTS.md`).

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
`classifier.ts` is unused — the only occurrence of its name in `src/index.ts` is a JSDoc
comment, not an import.

### `cache/`
Caching strategies (LRU, LFU, FIFO). `cache/index.ts` is unused — consumers import the
concrete strategy files directly.

### `config/`
Centralized environment-variable configuration. See `DATA_FLOW.md`'s "Data Persistence"
section for a specific example of a config field that is read here but consumed nowhere else.

### `interfaces/`
Dependency-injection interfaces.

### `tools/`
MCP tool definitions and schemas: `schemas/` (per-tool and per-mode JSON schemas) and
`validators/` (tool-level input validators, distinct from the per-mode validators in
`src/validation/`).

### `utils/`
`errors.ts` (the `DeepThinkingError` hierarchy and its subclasses), `logger.ts`, and
`sanitization.ts` (includes the canonical `escapeLatex` — see `ARCHITECTURE.md` for the
duplicate in `export/visual/utils/tikz.ts`).

## `templates/mode-scaffolding/`

Five copy-paste template files (`example-mode.handler.ts`, `.json-schema.ts`, `.schema.ts`,
`.type.ts`, `.validator.ts`) for authoring a new reasoning mode. Intentionally never imported
by `src/` — a human copies these to start a new mode, following the procedure documented in
the repo's README and `CLAUDE.md`. Do not report these as dead code; there is no way for a
static import scanner to represent "reachable via human copy-paste."

## `tests/`

Mirrors the `src/` directory structure under `tests/{unit,integration,edge-cases,performance}/`.

## `tools/`

Standalone CLI utilities, compiled to executables separately from the main package: a
markdown-file chunker/merger, a context-compression tool, and the dependency-graph generator
(`create-dependency-graph`) that produces `DEPENDENCY_GRAPH.md`.

## `docs/Architecture/`

This document set, plus the machine-generated reports it points to
(`DEPENDENCY_GRAPH.md`, `unused-analysis.md`, and their JSON/YAML equivalents).

## An empty stray directory

`src/search/` exists on disk as an empty directory (0 files) after commit `5857f90` deleted its
contents ("refactor: delete the dead src/search/ subsystem"). Nothing references it. It was
most likely never `rmdir`'d after the file deletions. It is safe to remove; it is not part of
the current module structure and no generated report lists it, because it contains nothing to
list.
