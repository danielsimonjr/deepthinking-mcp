<!-- repo-map:no-verification -->
<!-- Historical record of the 2026-08-05 refresh. Numbers below describe the OLD
     docs' stale claims, not the current codebase; checking them against a fresh
     parse would be a category error. Current-state claims live in the sibling
     docs' Verification blocks. -->
# Architecture Docs — 2026-08-05 Refresh Record

This document records why `OVERVIEW.md`, `ARCHITECTURE.md`, `COMPONENTS.md`, `DATA_FLOW.md`,
`DIRECTORY_STRUCTURE.md`, and `OVERVIEW.compact.md` were rewritten, what was wrong in the prior
versions, and two analyzer gaps found while verifying this rewrite. It replaces no other file
in this directory — `DEPENDENCY_GRAPH.md` and `unused-analysis.md` are separately-generated and
were not touched.

## Why: every hand-authored doc was stale

An audit dated the six docs above against fresh `repo_map.py` output (2026-08-05) and the
repo's own regenerated metrics table in `CLAUDE.md` (2026-08-03). Per-document tally:

| Document | Claims checked | Correct | Stale | Verdict |
|---|---|---|---|---|
| OVERVIEW.md | 19 | 3 | 15 (+1 borderline) | Regenerate |
| ARCHITECTURE.md | 16 | 3 | 12 (+1 never-true) | Regenerate |
| COMPONENTS.md | 14 | 1 | 12 (+1 flagged) | Regenerate |
| DATA_FLOW.md | 5 | 0 | 3 severe, 2 uncheckable | Regenerate |
| DIRECTORY_STRUCTURE.md | 9 rows | 0 clean | 9, several self-contradictory | Regenerate |
| OVERVIEW.compact.md | 8 | 0 | 8, and disagreed with OVERVIEW.md too | Regenerate |

All six were frozen at version 9.0.0 / dated 2025-12-30 — roughly 7 months and 3+ point
releases behind the current 9.3.3. `DEPENDENCY_GRAPH.md` and `unused-analysis.md`, by contrast,
were regenerated 2026-08-03 (2 days before the audit) and needed no rewrite, only a mention
that they are the fresher source of truth for the numbers the other docs used to duplicate.

## The 5 worst examples

1. **DATA_FLOW.md described tool names that no longer exist.** Its request-routing diagram
   listed `add_thought`, `create_session`, `export_session`, `switch_mode`, `get_summary`, and
   `get_recommendations` as if they were top-level MCP tools. They are not tools — `add_thought`
   is one `action` value inside the legacy single `deepthinking` tool's input schema. The
   current surface is 13 `deepthinking_*` tools; `deepthinking_session` bundles what this
   section described as six separate tools into one tool's actions.
2. **DATA_FLOW.md documented a dead feature as if it were live.** Its "Data Persistence"
   section described atomic writes, crash recovery, and a `.deepthinking-sessions/sessions/*.json`
   file format for `MCP_ENABLE_PERSISTENCE`/`MCP_PERSISTENCE_DIR`. Both env vars are read into
   config and consumed nowhere else in `src/` — confirmed by grep, and independently by
   `CLAUDE.md` marking both "Not enforced." The doc also conflated this dead path with the
   separately real, live `SESSION_DIR` file-storage mechanism, which made the dead feature read
   as more credible than it was.
3. **The visual-exporter mode-specific file count had 6+ different values across the doc set,
   and none were correct.** OVERVIEW.md said 23; ARCHITECTURE.md's own diagram said 22 while its
   own table said 22 and its own body text said 21; COMPONENTS.md said 20;
   DIRECTORY_STRUCTURE.md said 22. Actual count: 24. This was drift compounding drift — each doc
   had apparently been hand-edited independently after its last generation.
4. **ARCHITECTURE.md's security section claimed "0 type suppressions (down from 231)."** This
   was false at time of audit, not just stale: one suppression exists,
   `src/services/ExportService.ts:1043` (`@ts-expect-error`, "unused method kept for future use").
5. **DIRECTORY_STRUCTURE.md self-contradicted within one document.** Its overview tree and its
   own per-directory prose gave two different file counts for the same directory: `export/`
   (44 vs. 27, actual 45), `types/` (36 vs. 21, actual 37), `validation/` (44 vs. 35, actual 45).
   A reader would hit the disagreement without ever comparing the doc to the codebase.

Also notable: circular-dependency count was reported as 55 in four separate docs; the ground
truth (matching `DEPENDENCY_GRAPH.md`, which none of the four had been reconciled against) is
57 type-only, 0 runtime.

## What this refresh corrected

The six regenerated docs now carry only claims verified against `dependency-graph.json`,
`file-inventory.json`, `duplicate-symbols.json`, and `unused-analysis.json` (all generated
2026-08-05), cross-checked against `CLAUDE.md`'s independently-regenerated metrics table and,
for several claims, a direct source grep. Each doc ends with a Verification block naming the
exact metric and its source file, so a future drift audit can re-check mechanically instead of
re-deriving every number by hand. `DIRECTORY_STRUCTURE.md` now carries no hand-maintained
per-directory file counts at all — the self-contradiction that caused finding #5 above cannot
recur if the number is never copied into prose in the first place.

## Findings for maintainers: unused code and real duplication

**7 dead-candidate files**, no importer found anywhere in `src/` or `tests/`:
`src/cache/index.ts`, `src/export/index.ts`, `src/proof/index.ts`, `src/validation/index.ts`
(4 barrels), `src/validation/schema-utils.ts`, `src/validation/schemas.ts` (imported only by
the dead `validation/index.ts`), and `src/taxonomy/classifier.ts` (only hit anywhere is a JSDoc
comment).

**2 real duplication findings**, of the 63 duplicate-name pairs total:
- `escapeLatex` — independently written, functionally identical, in
  `src/export/visual/utils/tikz.ts:124` and `src/utils/sanitization.ts:195`. Consolidation
  candidate.
- `ValidationError` — an interface in `src/modes/handlers/ModeHandler.ts:31`, an unrelated
  throwable class in `src/utils/errors.ts:103`. Same name, two concepts; worth a rename.

**32 `isXThought` guard pairs** (`src/types/core.ts` vs. each `src/types/modes/<mode>.ts`) are
a drift risk, not a current bug: 12 of the 32 have their public behavior determined by the mode
file (via `types/index.ts`'s named re-export), the other 20 by `core.ts` — a silent,
inconsistent precedence that `CLAUDE.md` currently documents as if `core.ts` were the single
source for all of them.

## Analysis limitations

Two blind spots in the static analysis, found while writing this refresh:

1. **`unused-analysis.json`'s multi-line destructured dynamic import is invisible to it.**
   `resolveSandboxedOutputDir` (`src/export/file-exporter.ts:46`) is flagged unreferenced, but
   is called twice from `src/index.ts` via
   ```
   const { resolveSandboxedOutputDir } =
     await import("./export/file-exporter.js");
   ```
   Single-line destructured dynamic imports elsewhere in the same file (`getConfig`,
   `createFileExporter`, `getExportProfile`, and others) are correctly excluded from the
   unreferenced list. Only the multi-line form was missed — a narrow, formatting-sensitive gap
   in what is almost certainly a line-based text scan, not a general "can't see dynamic
   imports" limitation.
2. **The per-edge `typeOnly` circular-dependency flag is syntax-based, not usage-based.** It is
   set by checking for the literal `type` keyword in an import statement, not by checking
   whether the imported name is ever used as a value. `types/modes/sequential.ts`'s reverse
   edge to `core.ts` is flagged `typeOnly: false` because it imports `ThinkingMode` without the
   `type` keyword — but the import is used only in a type position
   (`mode: ThinkingMode.SEQUENTIAL;`), so it erases at compile time regardless of the flag. The
   "0 runtime circular dependencies" conclusion is still correct in every case checked, because
   `core.ts`'s outbound half of each cycle is always genuinely type-only — but the reverse
   edge's flag alone is not proof of that, and should not be cited as such without reading the
   file.

## Housekeeping: the empty `src/search/` directory

`src/search/` exists on disk with 0 files. Its contents were deleted in commit `5857f90`
("refactor: delete the dead src/search/ subsystem (L-4)"); the empty directory itself was never
`rmdir`'d. Nothing references it, and no generated report lists it, because there is nothing in
it to list. Safe to remove; not otherwise consequential.
