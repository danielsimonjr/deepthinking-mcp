/**
 * Cross-file duplicate-symbol detection.
 *
 * A symbol name defined in more than one file is not automatically a defect —
 * most are benign — so the report classifies rather than just counting. The
 * distinction that matters is **drift risk**: two definitions that are supposed
 * to agree and can silently diverge.
 *
 * This repo has already paid for that. `escapeLatex` existed in three places;
 * two of them re-escaped their own braces, so every backslash rendered as
 * `\{}` in TikZ and LaTeX output, and had done for a long time. No test
 * compared the copies. That is the class this report exists to surface.
 *
 * Re-exports are excluded deliberately: a barrel re-exporting a symbol is not a
 * second definition, and counting it would bury the real findings in noise.
 */
import type { ParsedFile } from "./types.js";

export type DuplicateCategory =
  /** Same name, same kind, in unrelated modules — supposed to agree. */
  | "DRIFT_RISK"
  /** Same name, different kinds (e.g. an interface and a class). */
  | "NAME_COLLISION";

export interface DuplicateSymbol {
  name: string;
  category: DuplicateCategory;
  /** Every file that DEFINES the symbol (re-exports excluded). */
  definitions: Array<{ file: string; kind: string }>;
}

export interface DuplicateReport {
  summary: {
    duplicateSymbolCount: number;
    driftRiskCount: number;
    nameCollisionCount: number;
  };
  duplicates: DuplicateSymbol[];
}

/** The kind buckets on FileExports, mapped to the label used in the report. */
const KIND_FIELDS = [
  ["classes", "class"],
  ["functions", "function"],
  ["interfaces", "interface"],
  ["types", "type"],
  ["enums", "enum"],
  ["constants", "constant"],
] as const;

export function detectDuplicateSymbols(files: ParsedFile[]): DuplicateReport {
  // name -> definitions. Re-exported names are skipped: a barrel that
  // re-exports `foo` has not defined a second `foo`.
  const byName = new Map<string, Array<{ file: string; kind: string }>>();

  for (const file of files) {
    const reExported = new Set(file.exports.reExported);
    for (const [field, kind] of KIND_FIELDS) {
      for (const name of file.exports[field]) {
        if (reExported.has(name)) continue;
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name)!.push({ file: file.path, kind });
      }
    }
  }

  const duplicates: DuplicateSymbol[] = [];
  for (const [name, rawDefinitions] of byName) {
    // A duplicate needs more than one distinct FILE. The scanner records a
    // symbol under every kind bucket that matches, so a single declaration can
    // appear twice for one file -- `AbductiveThought` in `src/types/core.ts` is
    // listed as both `interface` and `type`. Counting those produced 508 false
    // "duplicates" out of 573 on the first run: a report that looked
    // authoritative while measuring the parser rather than the codebase.
    const byFile = new Map<string, string>();
    for (const d of rawDefinitions) {
      if (!byFile.has(d.file)) byFile.set(d.file, d.kind);
    }
    if (byFile.size < 2) continue;

    const definitions = [...byFile].map(([file, kind]) => ({ file, kind }));
    const kinds = new Set(definitions.map((d) => d.kind));
    duplicates.push({
      name,
      // Same kind in several files = two things meant to be the same, which is
      // what can drift. Different kinds = the same word used for two concepts;
      // worth a rename, but nothing silently diverges.
      category: kinds.size === 1 ? "DRIFT_RISK" : "NAME_COLLISION",
      definitions: definitions.slice().sort((a, b) => a.file.localeCompare(b.file)),
    });
  }

  duplicates.sort((a, b) => a.name.localeCompare(b.name));

  return {
    summary: {
      duplicateSymbolCount: duplicates.length,
      driftRiskCount: duplicates.filter((d) => d.category === "DRIFT_RISK").length,
      nameCollisionCount: duplicates.filter((d) => d.category === "NAME_COLLISION").length,
    },
    duplicates,
  };
}
