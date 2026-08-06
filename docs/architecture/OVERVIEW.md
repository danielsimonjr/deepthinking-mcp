# DeepThinking MCP — Codebase Overview

## Project Summary

DeepThinking MCP is a TypeScript Model Context Protocol (MCP) server. It gives an LLM client
34 structured reasoning modes through 13 focused MCP tools. Each mode has typed thought
records, validation, session tracking, and multi-format export (Markdown, JSON, Mermaid, DOT,
SVG, and more).

The server runs as an ESM Node process (Node >=18) over stdio. It has one entry point:
`src/index.ts`. It has zero runtime circular dependencies. It publishes to npm as
`deepthinking-mcp`.

## Key Metrics

Numbers below are given at two scopes, because the repository is much larger than the shipped
package. **Whole repo** counts `src/`, `tests/`, `tools/`, `config/`, and `docs/`; **`src/`
only** counts what ships. A metric quoted at the wrong scope looks like a contradiction, so
each row names its scope and its origin.

For per-file and per-module detail, see [`DEPENDENCY_GRAPH.md`](DEPENDENCY_GRAPH.md) — this
document does not repeat it.

| Metric | Value | Scope | Source |
|---|---|---|---|
| Version | 9.3.3 | package | `package.json` |
| TypeScript files, whole repo | 436 | repo-wide | repo_map |
| TypeScript files, `src/` | 221 | src only | repo_map (`file-inventory.json`, area=src) |
| Lines of code, whole repo | 213,993 | repo-wide | repo_map |
| Lines of code, `src/` | 110,537 | src only | repo_map |
| Total exports, whole repo | 2,195 | repo-wide | repo_map |
| Total exports, `src/` | 1,276 (571 re-exports) | src only | DEPENDENCY_GRAPH.md |
| Entry roots | 1 (`src/index.ts`) | src | repo_map |
| Runtime circular dependencies | 0 | src | repo_map, confirmed by direct edge inspection |
| Type-only circular dependencies | 57 | src | repo_map |
| Files with no static importer | 24 (17 loaded dynamically or by design, 7 unused) | src | repo_map, hand-verified — see below |
| Duplicate symbol names | 63 (32 drift-risk, 29 benign, 2 real duplicates) | src | repo_map, hand-verified — see below |
| Reasoning modes | 34 (30 with dedicated thought types, 4 advanced-runtime) | src | `src/types/core.ts` `ThinkingMode` enum |
| Reasoning types defined | 69 | src | `src/taxonomy/reasoning-types.ts` (unwired — see Unused code) |
| MCP tools | 13 | src | `src/index.ts` tool registrations, live-checked below |
| Specialized mode handlers | 37 | src | `src/modes/handlers/` |
| Mode validators | 35 | src | `src/validation/validators/modes/` |
| Visual exporters | 42 files (24 mode-specific, 15 utils, 3 root) | src | `src/export/visual/` |
| Fluent builder classes | 14 | src | `src/export/visual/utils/` |

The whole-repo and `src`-only export counts (2,195 vs 1,276) are not a contradiction. They
count different file sets — the gap is `tests/` (146 files) and `tools/` (64 files), which
also export symbols.

## Project Structure

```
deepthinking-mcp/
├── src/                # 221 files, 110,537 LOC — the package
│   ├── index.ts        # entry point, all 13 tool handlers
│   ├── types/           # ThinkingMode enum, Thought union, per-mode types
│   ├── modes/            # mode handlers, registry, combinations, stochastic
│   ├── services/       # ThoughtFactory, ExportService
│   ├── session/         # SessionManager, storage, locks
│   ├── validation/       # Zod schemas + per-mode validators
│   ├── export/           # document + visual exporters
│   ├── proof/             # proof decomposition engine
│   ├── taxonomy/         # reasoning-type definitions (not wired to production)
│   ├── cache/             # LRU/LFU/FIFO strategies
│   ├── config/            # environment-variable configuration
│   ├── interfaces/       # DI interfaces
│   └── utils/             # errors, logger, sanitization
├── tests/               # 146 files, 67,958 LOC
├── tools/                # 64 files, 33,222 LOC — standalone CLI utilities
├── templates/mode-scaffolding/  # 5 copy-paste templates for authoring a new mode
└── docs/Architecture/   # this document set + generated reports
```

Do not treat `templates/mode-scaffolding/*.ts` as source code that runs. Those 5 files are
scaffolding a human copies to start a new mode. No code imports them — that is by design (see
"How code gets loaded" below).

## MCP Tools

The server lists exactly 13 tools. Confirmed live from `src/index.ts`:

`deepthinking_core`, `deepthinking_standard`, `deepthinking_mathematics`,
`deepthinking_temporal`, `deepthinking_probabilistic`, `deepthinking_causal`,
`deepthinking_strategic`, `deepthinking_analytical`, `deepthinking_scientific`,
`deepthinking_engineering`, `deepthinking_academic`, `deepthinking_session`,
`deepthinking_analyze`.

Each mode-grouping tool (`deepthinking_core` through `deepthinking_academic`) carries 2-4
related reasoning modes. `deepthinking_session` bundles session-lifecycle actions
(create/list/delete/export/switch_mode/recommend_mode). `deepthinking_analyze` runs multi-mode
analysis. See `DATA_FLOW.md` for the full tool-to-mode mapping and the request path.

## How code gets loaded

Three mechanisms bring code in besides a plain `import` statement. Each is deliberate, and
together they account for most of what looks unreferenced at a glance:

- **Mode validators load by name.** Ten of the 34 (`algorithmic`, `analysis`, `argumentation`,
  `critique`, `engineering`, `firstprinciples`, `formallogic`, `scientificmethod`, `synthesis`,
  `systemsthinking`) are resolved at runtime by `validators/registry.ts:186` from a
  module-path table; the other 24 come through the static `validators/index.ts` barrel.
- **Multi-mode analysis loads on demand.** `src/index.ts:918` pulls in
  `src/modes/combinations/` only when a combination request arrives.
- **Scaffolding templates are never imported.** The 5 files under
  `templates/mode-scaffolding/` are copy-paste starting points for authoring a new mode.

## Unused code

Seven files under `src/` have no importer anywhere — not in `src/`, not in `tests/`:

| File | Why it is unused |
|---|---|
| `cache/index.ts`, `export/index.ts`, `proof/index.ts`, `validation/index.ts` | Barrel files. Consumers import the concrete modules directly. |
| `validation/schema-utils.ts`, `validation/schemas.ts` | Imported only by `validation/index.ts`, itself unused. |
| `taxonomy/` (all 5 files) | Nothing outside the directory imports any of them. `recommend_mode` uses `ModeRecommender`, not the taxonomy. |

Roughly 195 exports have no importer, of which 69 have no reference at all — not even inside
their own file. A 23-export sample of that stricter set was 96% genuinely dead.

> **Before deleting any of it:** this package publishes to npm, so an export nothing uses
> in-repo may still be public API that an external caller depends on. Removing one from
> `src/index.ts` or a barrel is a breaking change. The methodology behind these numbers, and
> the two cases where it is known to be wrong, are in
> [`DRIFT_REPORT.md`](DRIFT_REPORT.md#analysis-limitations).

## Verification

Generated 2026-08-05 by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/Architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 436 | dependency-graph.json |
| totalLinesOfCode | 213993 | dependency-graph.json |
| totalExports | 2195 | dependency-graph.json |
| totalModules | 5 | dependency-graph.json |
| entryRoots | 1 | dependency-graph.json |
| reachableFiles | 140 | dependency-graph.json |
| dormantFiles | 81 | dependency-graph.json |
| orphanedFiles | 24 | dependency-graph.json |
| testOnlyFiles | 57 | dependency-graph.json |
| runtimeCircularDeps | 0 | dependency-graph.json |
| typeOnlyCircularDeps | 57 | dependency-graph.json |
| noImporterFileCount | 21 | unused-analysis.json (summary) |
| unusedExportsCount | 195 | dependency-graph.json |

Note on `totalModules`: repo_map counts 5 top-level project areas (`docs`, `config`, `src`,
`tools`, `tests`), not `src/` subdirectories. DEPENDENCY_GRAPH.md's "14 modules" counts `src/`
subdirectories only — a different unit, not a disagreement.
