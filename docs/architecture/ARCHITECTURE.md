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
  → 35 handlers          storage + locks      exporters (src/export/)
  (src/modes/)
```

A tool call validates against a Zod schema (`src/tools/schemas/`), is turned into a typed thought
by `ThoughtFactory`, is handled by the mode's specialized handler (or a generic fallback), and
is stored by `SessionManager`. Export follows a parallel path from `ExportService` into
format-specific exporters. See `DATAFLOW.md` for the full sequence.

## Core Layers

| Layer | Location | Role |
|---|---|---|
| MCP server | `src/index.ts` | Registers 13 tools, routes requests, owns lazy service init |
| Service layer | `src/services/` | `ThoughtFactory` (thought creation), `ExportService` (export orchestration) |
| Mode layer | `src/modes/` | `ModeHandlerRegistry` (Strategy pattern) + 35 handlers, one per mode |
| Session layer | `src/session/` | `SessionManager`, storage backends, cross-process file locks |
| Validation layer | `src/validation/` | `ThoughtValidator`, 35 per-mode validators, a lazy dynamic-import registry |
| Export layer | `src/export/` | Document exporters + `src/export/visual/` (23 mode-specific visual exporters) |
| Type layer | `src/types/` | `ThinkingMode` enum, `Thought` discriminated union, per-mode type files |
| Taxonomy layer | `src/taxonomy/` | 69 reasoning-type definitions, classifier, navigator |
| Proof layer | `src/proof/` | Proof decomposition, gap/inconsistency/circularity analysis |

## Architectural Patterns in Use

- **Service-oriented**: business logic lives in `src/services/`, not in `src/index.ts`.
- **Factory**: `ThoughtFactory` builds the correct typed thought for any of the 34 modes.
- **Strategy**: `ModeHandlerRegistry` dispatches to one of 35 handlers by mode; a mode string with
  no handler falls back to a generic handler.
- **Registry**: both `ModeHandlerRegistry` and the validator registry
  (`src/validation/validators/registry.ts`) are lookup tables keyed by mode name.
- **Lazy initialization**: `SessionManager` and other services init on first use via a cached
  promise, not at module load.

## Circular Dependencies — the honest story

`src/` has **95 circular dependencies, all type-only, and 0 runtime cycles**. That is safe —
type-only edges erase at compile time — but the claim rests on how the edges were classified,
so it is worth knowing the shape before relying on it.

**The shape.** `repo-tools query cycles` lists 95 simple cycles. They fall into three groups:

- **32 two-file cycles.** `src/types/core.ts` imports from a `src/types/modes/<mode>.ts` file,
  and that file imports back from `core.ts`. For example, `core.ts <-> types/modes/sequential.ts`
  and `core.ts <-> types/modes/engineering.ts` are two of the 32.
- **59 validator cycles.** Each cycle starts at `src/validation/validator.ts`, which imports
  `validators/index.ts`, and ends at a `validators/modes/<mode>.ts` file, which imports
  `ValidationContext` back from `validator.ts` with `import type`. Two routes join the two ends.
  In 25 cycles, `index.ts` re-exports the validator class straight from the mode file. The other
  34 cycles, one for each registered mode, run through the registry. `index.ts` re-exports the
  registry API from `validators/registry.ts`. `registry.ts` loads the mode file with a dynamic
  `import()`.
- **4 other cycles.** All four run through `src/types/session.ts`. One is the two-file cycle
  `core.ts <-> session.ts`, one adds `types/modes/mathematics.ts`, and two reach `src/proof/`.
  The tool classifies each of them as type-only. Their edges were not read by hand.

**The caveat.** The type-only classification is made syntactically — by the presence of the
`type` keyword on the import — not by how the imported name is used. Reading three of the 32
two-file cycles directly found:

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

**Why "0 runtime cycles" still holds.** Every one of the 32 two-file cycles breaks at compile
time regardless of the reverse edge's flag, because `core.ts`'s outbound half of the pair is
always genuinely type-only. Every one of the 59 validator cycles breaks at the `import type` in
the mode validator. The safety conclusion is correct. The per-edge `typeOnly` flag is not
proof of that conclusion on its own — it is evidence of whether an author wrote the `type`
keyword, which is a weaker claim than "this import is never used as a value." Do not cite a
single edge's `typeOnly: false` as evidence of a real runtime cycle without reading the file.

## Key Findings for Maintainers

Four findings worth tracking. None is causing a bug today; two are drift risks that will
bite a future change.

**1. `isXThought` type guards are defined twice, with silent, inconsistent precedence.**
`src/types/core.ts` and each `src/types/modes/<mode>.ts` file both independently define a
guard like `isSequentialThought()` — 32 such pairs. The copies differ in small ways. The
`core.ts` copy takes a `Thought` and compares `thought.mode` with the `ThinkingMode` enum
member. The mode-file copy takes a `BaseThought`, and many of them compare with a string
literal instead. The two agree on `mode` only because each mode's enum value equals its
lowercase string. The mode-file `isEngineeringThought` is stricter: it takes `unknown` and also
requires the `analysisType` and `designChallenge` fields. The public barrel `src/types/index.ts`
(`export * from "./core.js"`) re-exports 12 of the 32 guards by name straight from the mode
file instead of from `core.ts` (e.g. `isEngineeringThought` from `./modes/engineering.js`),
so those 12 guards' public behavior comes from the mode file while the other 20 come from
`core.ts`. This is a real drift risk: editing one copy of a guard without the other changes
behavior invisibly, and which copy actually wins depends on export order, not on which file a
reader expects.

**2. `escapeLatex` was implemented three times, and two copies were wrong.** *(Fixed.)* The
copies in `tikz.ts` and `latex.ts` chained `.replace()` calls, so the braces each inserted for
`\textbackslash{}` were re-escaped by its own later brace passes. Any backslash in a node label,
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
`src/types/session.ts:530` already defines it for a third shape.)

**4. Six files have no importer anywhere.** The barrels `src/cache/index.ts`,
`src/export/index.ts`, `src/proof/index.ts`, `src/validation/index.ts`,
`src/tools/schemas/index.ts` and `src/tools/schemas/modes/index.ts`. Nothing in `src/` or
`tests/` imports any of them. `OVERVIEW.md` lists them, and explains why the other files that
lack a static importer are nonetheless live.

`repo-tools map` lists 64 names (`duplicateCount`) that two or more files of `src/` export, and
its classified lists hold 65: 32 runtime names and 33 type names. The 65th name is
`HybridThought`: `modes/handlers/HybridHandler.ts` declares an interface of that name that
extends the one in `types/modes/hybrid.ts`, and the tool leaves it out of the 64. The 32
runtime names are the `isXThought` guard pairs of finding 1. Four type declarations are
identical in both files, when
comments and whitespace are removed: `CustomThought` (`modes/handlers/CustomHandler.ts` and
`types/modes/custom.ts`), and `MathematicalModel`, `PhysicalInterpretation` and
`TensorProperties` (`types/modes/hybrid.ts` and the mathematics or physics type file). The other
type names are different declarations. Some name the same concept twice with different fields
(for example `ModeStatus`, `RecommendModeInput` and `ProblemCharacteristics`). Some name
unrelated concepts that share a word (for example `Constraint` and `Domain`).

## Verification

Generated 2026-10-23 by `repo-tools map`.
Regenerate the generated reports: `npm run docs:deps` · Check: `repo-tools check . --docs=docs/architecture`

The claims below come from `repo-tools map .`, which reads the whole repository. The generated reports in this
directory come from `tools/create-dependency-graph`, which counts files and exports with its own rules. Their
counts differ for that reason.

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 527 | repo-tools map (whole repository) |
| totalModules | 5 | repo-tools map (whole repository) |
| runtimeCircularDeps | 0 | repo-tools map (whole repository) |
| typeOnlyCircularDeps | 95 | repo-tools map (whole repository) |
| orphanedFiles | 12 | repo-tools map (whole repository) |
| noImporterFileCount | 12 | repo-tools map (whole repository) |

Duplicate-symbol counts come from the `duplicate-symbols.json` that `repo-tools map` writes
(`duplicateCount: 64`, `totalSymbols: 1348`), not from the file of that name in this directory.
That file comes from `tools/create-dependency-graph` and counts 65 names (`duplicateSymbolCount`:
61 drift-risk and 4 name collisions) under its own rules. The identical-declaration check compares the
declarations of each duplicated type name with comments and whitespace removed. The cycle groups
come from `repo-tools query cycles`. They are not graph metrics, so they do not appear in the
table above.
