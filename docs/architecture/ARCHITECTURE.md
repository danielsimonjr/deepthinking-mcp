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

`src/` has **57 circular dependencies, all type-only, and 0 runtime cycles**. That is safe —
type-only edges erase at compile time — but the claim rests on how the edges were classified,
so it is worth knowing the shape before relying on it.

**The shape.** All 57 cycles have the same two-file form: `src/types/core.ts` importing from a
`src/types/modes/<mode>.ts` file, and that file importing back from `core.ts`. For example,
`core.ts <-> types/modes/sequential.ts` and `core.ts <-> types/modes/engineering.ts` are two of
the 57.

**The caveat.** The type-only classification is made syntactically — by the presence of the
`type` keyword on the import — not by how the imported name is used. Reading three of the 57
cycles directly found:

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

Four findings worth tracking. None is causing a bug today; two are drift risks that will
bite a future change.

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

**2. `escapeLatex` was implemented three times, and two copies were wrong.** *(Fixed.)* The
copies in `tikz.ts` and `latex.ts` chained `.replace()` calls, so the braces each inserted for
`	extbackslash{}` were re-escaped by its own later brace passes. Any backslash in a node label,
edge label, title or metric typeset as `\{}` instead of `\` — Windows paths, LaTeX commands and
escape sequences were all corrupted, in TikZ output and in every LaTeX export. `sanitization.ts`
held the correct single-pass implementation. Both export paths now import it.

The lesson is worth keeping: duplication did not cause this bug, it **hid** it. Three
implementations, two wrong, and no test comparing their output.

**3. `ValidationError` named two unrelated things.** *(Fixed.)* A plain data interface in
`ModeHandler.ts` and a throwable class in `utils/errors.ts`. TypeScript's type/value namespace
split kept them from colliding at compile time, so `import { ValidationError }` silently resolved
to whichever the source module meant. The interface is now `HandlerValidationError`; the class
keeps the conventional name. (`ValidationIssue` was not available as a rename target —
`src/types/session.ts:166` already uses it for a third shape.)

**4. Seven files have no importer anywhere.** The barrels `src/cache/index.ts`,
`src/export/index.ts`, `src/proof/index.ts` and `src/validation/index.ts`; behind them
`src/validation/schema-utils.ts` and `schemas.ts`; and `src/taxonomy/classifier.ts`. Nothing in
`src/` or `tests/` imports any of them. `OVERVIEW.md` lists them with the reason for each, and
explains why the other files that lack a static importer are nonetheless live.

The other 29 of the 63 total duplicate-name pairs are benign: unrelated types in different
mode files that happen to share an English word (e.g. `Constraint` in `stochastic/types.ts`
vs. `optimization.ts`), already disambiguated by the hand-curated `types/index.ts` barrel.

## Verification

Generated 2026-08-05 by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 485 | dependency-graph.json |
| totalModules | 5 | dependency-graph.json |
| runtimeCircularDeps | 0 | dependency-graph.json |
| typeOnlyCircularDeps | 61 | dependency-graph.json |
| orphanedFiles | 20 | dependency-graph.json |
| noImporterFileCount | 20 | unused-analysis.json (summary) |

Duplicate-symbol counts (63 total = 32 drift-risk + 29 benign + 2 real duplicates) come from
`duplicate-symbols.json` (`duplicateCount: 63`, `totalSymbols: 1257`), hand-classified by
reading each pair's declarations; not a repo_map-computed classification.
