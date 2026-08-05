# DeepThinking MCP — System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│  MCP Client (Claude Code, Claude Desktop, etc.)          │
└───────────────────────────┬───────────────────────────────┘
                              │ stdio (JSON-RPC)
┌───────────────────────────▼───────────────────────────────┐
│  src/index.ts — MCP server, 13 tool handlers               │
└───────────────────────────┬───────────────────────────────┘
                              │
        ┌────────────────────┼────────────────────┐
        ▼                     ▼                     ▼
  ThoughtFactory       SessionManager        ExportService
  (src/services/)      (src/session/)        (src/services/)
        │                     │                     │
        ▼                     ▼                     ▼
  ModeHandlerRegistry   in-memory or file    format-specific
  → 37 handlers          storage + locks      exporters (src/export/)
  (src/modes/)
```

A tool call validates against a Zod schema (`src/validation/`), is turned into a typed thought
by `ThoughtFactory`, is handled by the mode's specialized handler (or a generic fallback), and
is stored by `SessionManager`. Export follows a parallel path from `ExportService` into
format-specific exporters. See `DATA_FLOW.md` for the full sequence.

## Core Layers

| Layer | Location | Role |
|---|---|---|
| MCP server | `src/index.ts` | Registers 13 tools, routes requests, owns lazy service init |
| Service layer | `src/services/` | `ThoughtFactory` (thought creation), `ExportService` (export orchestration) |
| Mode layer | `src/modes/` | `ModeHandlerRegistry` (Strategy pattern) + 37 handlers, one per mode family |
| Session layer | `src/session/` | `SessionManager`, storage backends, cross-process file locks |
| Validation layer | `src/validation/` | Zod schemas, 35 per-mode validators, a lazy dynamic-import registry |
| Export layer | `src/export/` | Document exporters + `src/export/visual/` (24 mode-specific visual exporters) |
| Type layer | `src/types/` | `ThinkingMode` enum, `Thought` discriminated union, per-mode type files |
| Taxonomy layer | `src/taxonomy/` | 69 reasoning-type definitions, classifier, navigator |
| Proof layer | `src/proof/` | Proof decomposition, gap/inconsistency/circularity analysis |

## Architectural Patterns in Use

- **Service-oriented**: business logic lives in `src/services/`, not in `src/index.ts`.
- **Factory**: `ThoughtFactory` builds the correct typed thought for any of the 34 modes.
- **Strategy**: `ModeHandlerRegistry` dispatches to one of 37 handlers by mode; unhandled modes
  fall back to a generic handler.
- **Registry**: both `ModeHandlerRegistry` and the validator registry
  (`src/validation/validators/registry.ts`) are lookup tables keyed by mode name.
- **Lazy initialization**: `SessionManager` and other services init on first use via a cached
  promise, not at module load.

## Circular Dependencies — the honest story

repo_map reports **57 type-only circular dependencies and 0 runtime circular dependencies** in
`src/`. Both numbers are real, but the "type-only" label needs a caveat before you trust it as
proof of safety.

**The shape.** All 57 cycles have the same two-file form: `src/types/core.ts` importing from a
`src/types/modes/<mode>.ts` file, and that file importing back from `core.ts`. For example,
`core.ts <-> types/modes/sequential.ts` and `core.ts <-> types/modes/engineering.ts` are two of
the 57.

**The nuance.** repo_map's `typeOnly` flag is set per edge by looking for the literal `type`
keyword in the import statement — it does not check how the imported name is actually used.
Spot-checking 3 of the 57 cycles by reading both files directly found:

- `core.ts`'s outbound edge to a mode file is **always** `typeOnly: true` — it only ever
  imports the mode's `Thought` interface as a type.
- The mode file's edge back to `core.ts` is **not always flagged `typeOnly`**, and the flag is
  not reliable either way:
  - `engineering.ts` imports `ThinkingMode` without the `type` keyword, and genuinely uses it
    at runtime (`(thought as EngineeringThought).mode === ThinkingMode.ENGINEERING`,
    `engineering.ts:391`) — a correct `typeOnly: false`.
  - `sequential.ts` also imports `ThinkingMode` without the `type` keyword, but uses it only in
    a type position (`mode: ThinkingMode.SEQUENTIAL;` as a property type, `sequential.ts:9`) —
    a **false negative**. The import erases at compile time; the flag says it doesn't.

**Why "0 runtime cycles" still holds.** Every one of the 57 cycles breaks at compile time
regardless of the reverse edge's flag, because `core.ts`'s outbound half of the pair is always
genuinely type-only. The safety conclusion is correct. The per-edge `typeOnly` flag is not
proof of that conclusion on its own — it is evidence of whether an author wrote the `type`
keyword, which is a weaker claim than "this import is never used as a value." Do not cite a
single edge's `typeOnly: false` as evidence of a real runtime cycle without reading the file.

## Key Findings for Maintainers

Two automated scans (repo_map's duplicate-symbol detector and orphan-file detector) surfaced
four findings worth tracking. None are currently causing a bug; two are drift risks.

**1. `isXThought` type guards are defined twice, with silent, inconsistent precedence.**
`src/types/core.ts` and each `src/types/modes/<mode>.ts` file both independently define a
guard like `isSequentialThought()` — 32 such pairs. They agree today only because each mode's
enum value equals its lowercase string. The public barrel `src/types/index.ts`
(`export * from "./core.js"`) re-exports 12 of the 32 guards by name straight from the mode
file instead of from `core.ts` (e.g. `isEngineeringThought` from `./modes/engineering.js`),
so those 12 guards' public behavior comes from the mode file while the other 20 come from
`core.ts`. This is a real drift risk: editing one copy of a guard without the other changes
behavior invisibly, and which copy actually wins depends on export order, not on which file a
reader expects.

**2. `escapeLatex` is duplicated logic**, not a naming collision. Defined independently in
`src/export/visual/utils/tikz.ts:124` and `src/utils/sanitization.ts:195` — same character set,
same replacements, different implementation style. Not currently drifted, but a consolidation
candidate; `sanitization.ts`'s version is the one whose docstring states an injection-prevention
purpose.

**3. `ValidationError` means two different things depending on the import.**
`src/modes/handlers/ModeHandler.ts:31` declares it as a plain data interface
(`{field, message, code}`). `src/utils/errors.ts:103` declares it as a throwable class
extending `DeepThinkingError`. TypeScript's type/value namespace split means these do not
collide at compile time, but `import { ValidationError }` resolves to one or the other
depending on the source module — a landmine for a future reader.

**4. Four barrel files and two files behind them are dead-candidates.**
`src/cache/index.ts`, `src/export/index.ts`, `src/proof/index.ts`, `src/validation/index.ts`,
plus `src/validation/schema-utils.ts` and `schemas.ts` (imported only by the dead
`validation/index.ts`), and `src/taxonomy/classifier.ts`, have no importer anywhere in `src/`
or `tests/` — confirmed by grep, not just the analyzer. See `OVERVIEW.md`'s "Reading the
generated reports" section for the 17 orphan-flagged files that are live despite having no
static importer, and why they were not included here.

The other 29 of the 63 total duplicate-name pairs are benign: unrelated types in different
mode files that happen to share an English word (e.g. `Constraint` in `stochastic/types.ts`
vs. `optimization.ts`), already disambiguated by the hand-curated `types/index.ts` barrel.

## Verification

Generated 2026-08-05 by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/Architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 436 | dependency-graph.json |
| totalModules | 5 | dependency-graph.json |
| runtimeCircularDeps | 0 | dependency-graph.json |
| typeOnlyCircularDeps | 57 | dependency-graph.json |
| orphanedFiles | 24 | dependency-graph.json |
| noImporterFileCount | 21 | unused-analysis.json (summary) |

Duplicate-symbol counts (63 total = 32 drift-risk + 29 benign + 2 real duplicates) come from
`duplicate-symbols.json` (`duplicateCount: 63`, `totalSymbols: 1257`), hand-classified by
reading each pair's declarations; not a repo_map-computed classification.
