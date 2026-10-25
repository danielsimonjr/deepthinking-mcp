# DeepThinking MCP — Codebase Overview

## Project Summary

DeepThinking MCP is a TypeScript Model Context Protocol (MCP) server. It gives an LLM client
34 structured reasoning modes through 13 focused MCP tools. Each mode has typed thought
records, validation, session tracking, and multi-format export (Markdown, JSON, Mermaid, DOT,
SVG, and more).

The server runs as an ESM Node process (Node >=20) over stdio. It has one entry point:
`src/index.ts`. It has zero runtime circular dependencies. It publishes to npm as
`deepthinking-mcp`.

## Key Metrics

Numbers below are given at two scopes, because the repository is much larger than the shipped
package. **Whole repo** counts every source file in the repository (`src/`, `tests/`, `tools/`,
`templates/`, `cli/`, `scripts/`, `docs/` and the root configuration files); **`src/` only**
counts what ships. A metric quoted at the wrong scope looks like a contradiction, so each row
names its scope and its origin.

For per-file and per-module detail, see [`DEPENDENCY_GRAPH.md`](DEPENDENCY_GRAPH.md) — this
document does not repeat it.

| Metric | Value | Scope | Source |
|---|---|---|---|
| Source files, whole repo | 509 | repo-wide | `repo-tools map` (506 are TypeScript; 3 are `.mjs` and `.cjs` scripts) |
| TypeScript files, `src/` | 243 | src only | `repo-tools map`, files under `src/` |
| Lines of code, whole repo | 232,992 | repo-wide | `repo-tools map` |
| Lines of code, `src/` | 120,509 | src only | `repo-tools map`, files under `src/` |
| Total exports, whole repo | 2,169 | repo-wide | `repo-tools map` |
| Total exports, `src/` | 1,191 (487 re-exports) | src only | `DEPENDENCY_GRAPH.md` |
| Entry roots | 1 (`src/index.ts`) | repo-wide | `repo-tools map` |
| Runtime circular dependencies | 0 | repo-wide | `repo-tools map`, confirmed by direct edge inspection |
| Type-only circular dependencies | 95 | repo-wide | `repo-tools map` |
| Files with no static importer | 12 (6 barrel files, 5 scaffolding templates, 1 launcher script) | repo-wide | `repo-tools map`, checked with `repo-tools query dependents` — see below |
| Duplicate symbol names | 64 (32 guard pairs, 4 identical type declarations) | src | `repo-tools map` (its own `duplicate-symbols.json`) — see below |
| Reasoning modes | 34, plus `custom` (35 `ThinkingMode` members) | src | `src/types/core.ts` `ThinkingMode` enum |
| Reasoning types defined | 69 | src | `src/taxonomy/reasoning-types.ts` (surfaced by `recommend_mode`) |
| MCP tools | 13 | src | `src/index.ts` tool registrations, live-checked below |
| Specialized mode handlers | 35 | src | `src/modes/index.ts` registers them; `src/modes/handlers/` holds 38 files (the 35 handlers, `GenericModeHandler.ts`, `ModeHandler.ts` and the helper `input-warnings.ts`) |
| Mode validators | 35 files (34 mode validators and `meta.ts`) | src | `src/validation/validators/modes/` |
| Visual exporters | 44 files (24 in `modes/`, 14 in `utils/`, 6 at the root) | src | `src/export/visual/` |
| Fluent builder classes | 14 | src | `src/export/visual/utils/` |

The whole-repo and `src`-only export counts (2,169 vs 1,191) are not a contradiction. They
come from two tools and count different file sets: `repo-tools map` reads all 509 files, and
`tools/create-dependency-graph` reads the 243 files of `src/`.

## Project Structure

```
deepthinking-mcp/
├── src/                # 243 files, 119,551 LOC — the package
│   ├── index.ts        # entry point, all 13 tool handlers
│   ├── types/           # ThinkingMode enum, Thought union, per-mode types
│   ├── modes/            # mode handlers, registry, combinations, stochastic
│   ├── services/       # ThoughtFactory, ExportService
│   ├── session/         # SessionManager, storage, metrics
│   ├── validation/       # per-mode thought validators, advisory wrapper
│   ├── export/           # document + visual exporters
│   ├── proof/             # proof decomposition engine
│   ├── taxonomy/         # reasoning-type definitions, surfaced by recommend_mode
│   ├── cache/             # LRU cache
│   ├── config/            # environment-variable configuration
│   ├── interfaces/       # DI interfaces
│   └── utils/             # errors, logger, sanitization
├── tests/               # 238 files, 103,683 LOC
├── tools/                # 15 files, 4,718 LOC — standalone CLI utilities
├── cli/                  # mcp-server-wrapper.mjs — launcher script for the Claude Code plugin
├── templates/mode-scaffolding/  # 5 copy-paste templates for authoring a new mode
└── docs/architecture/   # this document set + generated reports
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
(`summarize`, `export`, `export_all`, `get_session`, `switch_mode`, `recommend_mode` and `delete_session`). `deepthinking_analyze` runs multi-mode
analysis. See `DATAFLOW.md` for the full tool-to-mode mapping and the request path.

## How code gets loaded

Three mechanisms bring code in besides a plain `import` statement. Each is deliberate, and
together they account for most of what looks unreferenced at a glance:

- **Mode validators load on the first thought of their mode.** `loadValidator` in
  `validators/registry.ts` loads all 34 registered mode validators through a table of `load`
  functions. Each `load` function calls `import()` with a literal specifier, so the bundler
  puts every validator into the single-file build (`dist/index.js`). Ten of them
  (`algorithmic`, `analysis`, `argumentation`, `critique`, `engineering`, `firstprinciples`,
  `formallogic`, `scientificmethod`, `synthesis`, `systemsthinking`) have no other importer. The
  other 24 are also exported by the static `validators/index.ts` barrel, which exports 25
  classes: those 24 and `MetaValidator`, which is not a registered mode.
- **Multi-mode analysis loads on demand.** `handleAnalyze` in `src/index.ts` pulls in
  `src/modes/combinations/` only when a combination request arrives.
- **Scaffolding templates are never imported.** The 5 files under
  `templates/mode-scaffolding/` are copy-paste starting points for authoring a new mode.

## Unused code

Six files under `src/` have no importer anywhere — not in `src/`, not in `tests/`. Each one is a
barrel file. Consumers import the concrete modules directly.

- `cache/index.ts`, `export/index.ts`, `proof/index.ts`, `validation/index.ts`
- `tools/schemas/index.ts`, `tools/schemas/modes/index.ts`

Two more files are reached only by tests: `modes/stochastic/models/distribution.ts` and
`modes/stochastic/sampling/rng.ts`.

`repo-tools map` lists 231 exports that have no importer. 78 of them have no reference at all — not
even inside their own file. The other 153 are referenced only in the file that defines them. This
split is a text match, so a name that also appears in a string or a comment counts as referenced.
The reports that `tools/create-dependency-graph` generates count 479 unused exports under their
own rules.

> **Before deleting any of it:** this package publishes to npm, so an export nothing uses
> in-repo may still be public API that an external caller depends on. Removing one from
> `src/index.ts` or a barrel is a breaking change. The methodology behind these numbers, and
> the two cases where it is known to be wrong, are in
> [`DRIFT_REPORT.md`](DRIFT_REPORT.md#analysis-limitations).

## Verification

Generated 2026-10-23 by `repo-tools map`.
Regenerate the generated reports: `npm run docs:deps` · Check: `repo-tools check . --docs=docs/architecture`

The claims below come from `repo-tools map .`, which reads the whole repository. The generated reports in this
directory come from `tools/create-dependency-graph`, which counts files and exports with its own rules. Their
counts differ for that reason.

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 509 | repo-tools map (whole repository) |
| totalLinesOfCode | 232992 | repo-tools map (whole repository) |
| totalExports | 2169 | repo-tools map (whole repository) |
| totalModules | 5 | repo-tools map (whole repository) |
| entryRoots | 1 | repo-tools map (whole repository) |
| reachableFiles | 235 | repo-tools map (whole repository) |
| dormantFiles | 14 | repo-tools map (whole repository) |
| orphanedFiles | 12 | repo-tools map (whole repository) |
| testOnlyFiles | 2 | repo-tools map (whole repository) |
| runtimeCircularDeps | 0 | repo-tools map (whole repository) |
| typeOnlyCircularDeps | 95 | repo-tools map (whole repository) |
| noImporterFileCount | 12 | repo-tools map (whole repository) |
| unusedExportsCount | 231 | repo-tools map (whole repository) |

Note on `totalModules`: `repo-tools map` counts 5 top-level project areas (`docs`, `config`, `src`,
`tools`, `tests`), not `src/` subdirectories. DEPENDENCY_GRAPH.md's "14 modules" counts `src/`
subdirectories only — a different unit, not a disagreement.
