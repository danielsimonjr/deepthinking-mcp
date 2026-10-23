# DeepThinking MCP — Compact Overview

TypeScript MCP server. 34 reasoning modes, 13 focused MCP tools, session tracking, multi-format
export. ESM, Node >=20, stdio transport. Entry point: `src/index.ts`. Publishes to npm as
`deepthinking-mcp`. Full detail: `OVERVIEW.md`.

## Metrics (repo-wide unless marked src-only)

| Metric | Value |
|---|---|
| Source files, whole repo / `src/` only | 494 / 241 |
| LOC, whole repo / `src/` only | 227,673 / 118,774 |
| Exports, whole repo / `src/` only | 2,158 / 1,186 (487 re-exports) |
| Runtime circular deps | 0 |
| Type-only circular deps | 95 |
| Files with no static importer | 12 (6 barrels, 5 templates, 1 launcher script) |
| Duplicate symbol names | 64 (32 guard pairs, 4 identical type declarations) |
| Reasoning modes | 34, plus `custom` |
| MCP tools | 13 |
| Mode handlers | 35 |
| Mode validators | 35 files (34 mode validators and `meta.ts`) |

## Structure

```
src/            241 files — index.ts, types/, modes/, services/, session/,
                 validation/, export/, proof/, taxonomy/, cache/, config/,
                 interfaces/, utils/
tests/          227 files, mirrors src/
tools/          15 files — standalone CLI utilities
cli/            mcp-server-wrapper.mjs — launcher script for the Claude Code plugin
templates/mode-scaffolding/  5 copy-paste files, by-design unimported
docs/architecture/  this doc set + generated reports
```

## MCP tools (13, confirmed live from `src/index.ts`)

`deepthinking_core`, `_standard`, `_mathematics`, `_temporal`, `_probabilistic`, `_causal`,
`_strategic`, `_analytical`, `_scientific`, `_engineering`, `_academic` (11 mode-grouping
tools, 2-4 modes each), `_session` (7 actions: summarize, export, export_all, get_session,
switch_mode, recommend_mode, delete_session), `_analyze` (multi-mode analysis).

## Files with no static importer — 12

- **6 are live or by design.** 5 `templates/mode-scaffolding/` files are copy-paste starting
  points and are never meant to be imported; `cli/mcp-server-wrapper.mjs` is started by the
  plugin, not imported.
- **6 are unused barrels.** `index.ts` in `cache/`, `export/`, `proof/`, `validation/`,
  `tools/schemas/` and `tools/schemas/modes/`.

## Known issues worth tracking

- `isXThought` type guards defined twice (`core.ts` vs. each mode file) — 32 pairs, silent
  precedence via barrel export order.
- `CustomThought`, `MathematicalModel`, `PhysicalInterpretation` and `TensorProperties` are each
  declared twice with an identical body (see `ARCHITECTURE.md`).
- `MCP_ENABLE_PERSISTENCE`/`MCP_PERSISTENCE_DIR` are dead code — read into config, consumed
  nowhere. Live equivalent is `SESSION_DIR`.
- The per-edge `typeOnly` cycle flag is syntax-based, not usage-based — a false negative on the
  reverse edge doesn't mean the cycle is unsafe; see `ARCHITECTURE.md`.

Full detail and sourcing for every claim above: `OVERVIEW.md`, `ARCHITECTURE.md`,
`COMPONENTS.md`, `DATAFLOW.md`, `DIRECTORY_STRUCTURE.md`.

## Verification

Generated 2026-10-23 by `repo-tools map`.
Regenerate the generated reports: `npm run docs:deps` · Check: `repo-tools check . --docs=docs/architecture`

The claims below come from `repo-tools map .`, which reads the whole repository. The generated reports in this
directory come from `tools/create-dependency-graph`, which counts files and exports with its own rules. Their
counts differ for that reason.

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 494 | repo-tools map (whole repository) |
| typeOnlyCircularDeps | 95 | repo-tools map (whole repository) |
| runtimeCircularDeps | 0 | repo-tools map (whole repository) |
