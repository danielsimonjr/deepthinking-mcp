# Component Guide

This is a subsystem-level guide. For per-file dependency detail (who imports whom, which
exports are used where), see `DEPENDENCY_GRAPH.md` — this document does not repeat its
per-file listings.

## MCP Server Layer — `src/index.ts`

The entry point. Registers 13 tools, holds all `CallToolRequestSchema` handlers, and lazily
initializes the service layer on first use. No mode logic lives here by convention — it
delegates to `src/services/` and `src/modes/`. See `DATA_FLOW.md` for the request sequence and
`OVERVIEW.md` for the full 13-tool list.

## Service Layer — `src/services/`

- **`ThoughtFactory.ts`** — builds the correctly-typed thought object for any of the 34 modes.
  Delegates mode-specific construction to `ModeHandlerRegistry`.
- **`ExportService.ts`** — orchestrates multi-format export, delegating to the format-specific
  exporters in `src/export/`. Contains the codebase's one confirmed type suppression
  (`@ts-expect-error` at `ExportService.ts:1043`, "unused method kept for future use").

## Mode Layer — `src/modes/`

- **`registry.ts`** — `ModeHandlerRegistry`, a Strategy-pattern singleton. `getHandler(mode)`
  returns a specialized handler or a generic fallback; `hasSpecializedHandler(mode)` checks
  coverage.
- **`handlers/`** — 37 handler files. Category breakdown (from `CLAUDE.md`, source-verified):
  Core (5): Sequential, Shannon, Mathematics, Physics, Hybrid. Fundamental (3): Inductive,
  Deductive, Abductive. Causal/Probabilistic (7): Causal, Bayesian, Counterfactual, Temporal,
  Historical, GameTheory, Evidential. Analogical (2): Analogical, FirstPrinciples.
  Systems/Scientific (3): SystemsThinking, ScientificMethod, FormalLogic. Academic (4):
  Synthesis, Argumentation, Critique, Analysis. Engineering (4): Engineering, Computability,
  Cryptanalytic, Algorithmic. Advanced Runtime (4): MetaReasoning, Recursive, Modal,
  Stochastic. Fallback (2): GenericModeHandler, CustomHandler. Constraint and Optimization are
  covered by validators plus the generic handler, not a dedicated handler.
- **`combinations/`** — multi-mode analysis (`MultiModeAnalyzer`). Loaded on demand: the only
  path in is a dynamic `import()` at `src/index.ts:918`, so nothing imports it statically.
- **`stochastic/`** — stochastic-mode types, sampling, and distribution models. No non-test
  `src/` file imports these; the test suite is their only static consumer.

## Validation & Security Components — `src/validation/`

- **`validator.ts`** — top-level entry, imports `getValidatorForMode` from `validators/index.ts`.
- **Mode validators load two different ways, and this is the one thing to know about this
  directory.** `validators/registry.ts` is a lazy-loading table keyed by mode name: each entry
  names a module path and a class name, and `registry.ts:186` resolves it with
  `await import(config.module)`. Ten validators arrive exclusively this way — `algorithmic`,
  `analysis`, `argumentation`, `critique`, `engineering`, `firstprinciples`, `formallogic`,
  `scientificmethod`, `synthesis`, `systemsthinking`. The other 24 are re-exported statically by
  `validators/index.ts`. All 34 are equally live; only the loading mechanism differs. Adding a
  validator means choosing which path it takes, and registering it accordingly.
- **`schemas.ts`, `schema-utils.ts`** — unused. Their only importer is `validation/index.ts`,
  which is itself unused (see "Unused code" below).

## Session Management — `src/session/`

`manager.ts` holds `SessionManager`: lazy async init via a cached promise, in-memory storage by
default, file-based storage under `SESSION_DIR` for multi-instance sharing with cross-process
file locking (`src/session/locks/`). See `DATA_FLOW.md` for the session lifecycle and the
distinction between this live `SESSION_DIR` mechanism and the separate, dead
`MCP_ENABLE_PERSISTENCE` feature.

## Export System — `src/export/`

Two families: document exporters (Markdown, JSON, and other flat formats) at the top level,
and `src/export/visual/` for diagram formats (Mermaid, DOT, ASCII, native SVG, TikZ, and
more) — 24 mode-specific exporter files plus 14 shared utility files, driven by 14 fluent
builder classes (`DOTGraphBuilder`, `MermaidGraphBuilder`, `SVGBuilder`, and 11 others; full
list and file paths in `CLAUDE.md`'s "Visual Builder APIs" table). Consumers import the
concrete exporter files directly, so `src/export/index.ts` sits unused.

## Taxonomy System — `src/taxonomy/`

`reasoning-types.ts` defines all 69 reasoning types and backs `recommend_mode`. `navigator.ts`
and `suggestion-engine.ts` are imported only by tests — no production path reaches them.
`classifier.ts` is unused: the only occurrence of its name in `src/index.ts` is a JSDoc comment,
not an import.

## Proof Decomposition — `src/proof/`

13 files implementing proof decomposition, gap analysis, assumption tracking, inconsistency
detection, and circular-reasoning detection. The test suite is currently its only static
consumer; no path from `src/index.ts` reaches it directly. Its `index.ts` barrel is unused —
consumers import the concrete modules.

## Type System — `src/types/`

- **`core.ts`** — the `ThinkingMode` enum (34 real modes + `CUSTOM`), the `Thought`
  discriminated union, and one `isXThought` guard per mode.
- **`modes/*.ts`** — 33 files, one per mode with a dedicated thought type. Each also defines
  its own `isXThought` guard, duplicating the one in `core.ts`. See `ARCHITECTURE.md`'s "Key
  Findings" section for why this duplication is a drift risk, not just a style choice.

## Duplicate Symbols — what to check before editing a type guard or a shared name

63 names are exported by 2+ files in `src/`. Do not assume a name collision is cosmetic:

- **32 pairs** are the `isXThought` guards above — real drift risk, not cosmetic.
- **29 pairs** are type-only names that collide by English word only (e.g. `Constraint` in
  `stochastic/types.ts` vs. `optimization.ts`) — different concepts, already disambiguated by
  the hand-curated `types/index.ts` barrel, not a defect.
- **2 pairs** are real duplicated logic or a genuine footgun: `escapeLatex` (duplicated logic,
  consolidation candidate) and `ValidationError` (same name, unrelated interface vs. class —
  see `ARCHITECTURE.md`).

## Verification

Generated 2026-08-05 by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/Architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 436 | dependency-graph.json |
| orphanedFiles | 24 | dependency-graph.json |
| noImporterFileCount | 21 | unused-analysis.json (summary) |
| unusedExportsCount | 195 | dependency-graph.json |

Handler count (37), validator count (35), mode count (34), and visual-exporter file counts
(24 mode-specific + 14 utils) are source-verified against `CLAUDE.md`'s regenerated Project
Metrics table and, for validators, an independent `ls src/validation/validators/modes/` count —
not repo_map metric names, so not repeated in the table above.
