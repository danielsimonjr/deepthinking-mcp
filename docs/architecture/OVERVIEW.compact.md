# DeepThinking MCP — Compact Overview

TypeScript MCP server. 34 reasoning modes, 13 focused MCP tools, session tracking, multi-format
export. ESM, Node >=18, stdio transport. Entry point: `src/index.ts`. Publishes to npm as
`deepthinking-mcp`. Full detail: `OVERVIEW.md`.

## Metrics (repo-wide unless marked src-only; measured 2026-08-05)

| Metric | Value |
|---|---|
| Version | 9.3.3 |
| TS files, whole repo / `src/` only | 436 / 221 |
| LOC, whole repo / `src/` only | 213,993 / 110,537 |
| Exports, whole repo / `src/` only | 2,195 / 1,276 (571 re-exports) |
| Runtime circular deps | 0 |
| Type-only circular deps | 57 |
| Files with no static importer | 24 (17 loaded dynamically or by design, 7 unused) |
| Duplicate symbol names | 63 (32 drift-risk, 29 benign, 2 real duplicates) |
| Reasoning modes | 34 (30 dedicated types + 4 advanced-runtime) |
| MCP tools | 13 |
| Mode handlers | 37 |
| Mode validators | 35 |

## Structure

```
src/            221 files — index.ts, types/, modes/, services/, session/,
                 validation/, export/, proof/, taxonomy/, cache/, config/,
                 interfaces/, utils/
tests/          146 files, mirrors src/
tools/          64 files — standalone CLI utilities
templates/mode-scaffolding/  5 copy-paste files, by-design unimported
docs/Architecture/  this doc set + generated reports
```

## MCP tools (13, confirmed live from `src/index.ts`)

`deepthinking_core`, `_standard`, `_mathematics`, `_temporal`, `_probabilistic`, `_causal`,
`_strategic`, `_analytical`, `_scientific`, `_engineering`, `_academic` (10 mode-grouping
tools, 2-4 modes each), `_session` (create/list/delete/export/switch_mode/recommend_mode as one
tool's actions), `_analyze` (multi-mode analysis).

## Files with no static importer — 24, each checked

- **17 are live.** 10 mode validators and `combinations/{index,analyzer}.ts` load through a
  dynamic `import()`; 5 `templates/mode-scaffolding/` files are copy-paste starting points and
  are never meant to be imported.
- **7 are unused.** 4 barrels (`cache/`, `export/`, `proof/`, `validation/index.ts`),
  `validation/{schema-utils,schemas}.ts`, and `taxonomy/classifier.ts`.

## Known issues worth tracking

- `isXThought` type guards defined twice (`core.ts` vs. each mode file) — 32 pairs, silent
  precedence via barrel export order.
- `escapeLatex` duplicated logic (`tikz.ts` vs. `sanitization.ts`).
- `ValidationError` means two different things (interface in `ModeHandler.ts`, class in
  `errors.ts`).
- `MCP_ENABLE_PERSISTENCE`/`MCP_PERSISTENCE_DIR` are dead code — read into config, consumed
  nowhere. Live equivalent is `SESSION_DIR`.
- The per-edge `typeOnly` cycle flag is syntax-based, not usage-based — a false negative on the
  reverse edge doesn't mean the cycle is unsafe; see `ARCHITECTURE.md`.
- `src/search/` is an empty stray directory, safe to `rmdir`.

Full detail and sourcing for every claim above: `OVERVIEW.md`, `ARCHITECTURE.md`,
`COMPONENTS.md`, `DATA_FLOW.md`, `DIRECTORY_STRUCTURE.md`.

## Verification
Generated 2026-08-05 by `repo_map.py map`.
Check: `python repo_map.py check <repo> --docs docs/Architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 436 | dependency-graph.json |
| typeOnlyCircularDeps | 57 | dependency-graph.json |
| runtimeCircularDeps | 0 | dependency-graph.json |
