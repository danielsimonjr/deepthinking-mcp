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

Two different tools measured this codebase, at different scopes. Keep them separate:

- **repo_map** (`python repo_map.py map`, 2026-08-05) scans the whole repository: `src/`,
  `tests/`, `tools/`, `config/`, and `docs/` — 436 TypeScript files total.
- **DEPENDENCY_GRAPH.md** (`npm run docs:deps`, 2026-08-03) scans `src/` only — 234 files,
  14 module directories. Use it for per-file, per-module detail; this document does not
  repeat that detail.

| Metric | Value | Scope | Source |
|---|---|---|---|
| Version | 9.3.3 | package | `package.json` |
| TypeScript files, whole repo | 436 | repo-wide | repo_map |
| TypeScript files, `src/` | 221 | src only | repo_map (`file-inventory.json`, area=src) |
| Lines of code, whole repo | 213,625 | repo-wide | repo_map |
| Lines of code, `src/` | 110,538 | src only | repo_map |
| Total exports, whole repo | 2,195 | repo-wide | repo_map |
| Total exports, `src/` | 1,276 (571 re-exports) | src only | DEPENDENCY_GRAPH.md |
| Entry roots | 1 (`src/index.ts`) | src | repo_map |
| Runtime circular dependencies | 0 | src | repo_map, confirmed by direct edge inspection |
| Type-only circular dependencies | 57 | src | repo_map |
| Orphan-flagged files | 24 (17 live, 7 dead-candidate) | src | repo_map, hand-verified — see below |
| Duplicate symbol names | 63 (32 drift-risk, 29 benign, 2 real duplicates) | src | repo_map, hand-verified — see below |
| Reasoning modes | 34 (30 with dedicated thought types, 4 advanced-runtime) | src | `src/types/core.ts` `ThinkingMode` enum |
| Reasoning types (taxonomy) | 69 | src | `src/taxonomy/reasoning-types.ts` |
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
├── src/                # 221 files, 110,538 LOC — the package
│   ├── index.ts        # entry point, all 13 tool handlers
│   ├── types/           # ThinkingMode enum, Thought union, per-mode types
│   ├── modes/            # mode handlers, registry, combinations, stochastic
│   ├── services/       # ThoughtFactory, ExportService
│   ├── session/         # SessionManager, storage, locks
│   ├── validation/       # Zod schemas + per-mode validators
│   ├── export/           # document + visual exporters
│   ├── proof/             # proof decomposition engine
│   ├── taxonomy/         # reasoning-type classification
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
"Reading the generated reports" below).

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

## Reading the generated reports

Two automated reports live alongside this document: `DEPENDENCY_GRAPH.md` (dependency graph,
cycles, per-module detail) and `unused-analysis.md` (candidate dead code). Both are useful and
both have known blind spots. Read a flagged file before deleting it — do not treat either
report as a deletion queue.

**Orphan files are not automatically dead.** repo_map flags 24 `src/` files as having no
static importer. A file-by-file check found:

- **17 are live**, reached only through mechanisms static analysis cannot see:
  - 10 mode validators (`algorithmic.ts`, `analysis.ts`, `argumentation.ts`, `critique.ts`,
    `engineering.ts`, `firstprinciples.ts`, `formallogic.ts`, `scientificmethod.ts`,
    `synthesis.ts`, `systemsthinking.ts` under `src/validation/validators/modes/`) — loaded by
    a string-keyed dynamic `import()` in `src/validation/validators/registry.ts:186`.
  - `src/modes/combinations/index.ts` and `analyzer.ts` — loaded by a dynamic `import()` in
    `src/index.ts:918`.
  - 5 files under `templates/mode-scaffolding/` — intentionally never imported; they are
    copy-paste starting points for a new mode, documented in the repo's own README and
    CLAUDE.md.
- **7 are genuine dead-candidates**, with no importer of any kind found: the barrel files
  `src/cache/index.ts`, `src/export/index.ts`, `src/proof/index.ts`,
  `src/validation/index.ts`; `src/validation/schema-utils.ts` and `schemas.ts` (imported only
  by the dead `validation/index.ts` barrel); and `src/taxonomy/classifier.ts` (its only hit
  anywhere is a JSDoc comment, not an import).

**A static scanner cannot see a dynamic `import()`.** That is the root cause behind both
findings above and a documented, narrow gap in `unused-analysis.json`'s own methodology
(the export `resolveSandboxedOutputDir` in `src/export/file-exporter.ts` is reported
unreferenced, but it is called twice from `src/index.ts:407-409` and `:591-593` via a
multi-line destructured dynamic import — a formatting-sensitive miss, not a general blind
spot; single-line destructured dynamic imports elsewhere in the same file are correctly
excluded).

**`unusedExportsCount` (195) and `unreferencedAnywhereCount` (69) are different buckets**, not
the same number reported twice. `unreferencedAnywhereCount` is the stricter one: exports with
zero references anywhere in the repo, including their own defining file. A 23-export sample
against that stricter bucket found 22 true dead code (96%) and the 1 false positive above.

**This package publishes to npm.** An export unused inside the repo may still be public API
consumed by an external caller. Do not delete an "unused" export from `src/index.ts` or a
barrel file without checking whether removing it is a breaking change.

## Verification

Generated 2026-08-05 by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/Architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 436 | dependency-graph.json |
| totalLinesOfCode | 213625 | dependency-graph.json |
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
