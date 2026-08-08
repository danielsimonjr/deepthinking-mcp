/**
 * The two census reports: FILE_INVENTORY.md and duplicate-symbols.md.
 *
 * Both are part of the canonical architecture doc set (see memoryjs and MathTS,
 * which are the standard). They are generated, so they carry the do-not-edit
 * banner emitted by the entry point — never hand-edit them.
 */
import { GENERATED_REPORT_BANNER } from "../config.js";
import type { DuplicateReport } from "../duplicates.js";
import type { FileInventory } from "../inventory.js";

/**
 * Render the complete file census.
 *
 * The "not a deletion list" warning is repeated where the counts appear rather
 * than left in a footnote: an `orphan` tag is a static-analysis result, and a
 * file reached only through a dynamic `import()` earns it while being perfectly
 * live.
 */
export function generateFileInventoryMarkdown(inventory: FileInventory): string {
  const { summary, files } = inventory;
  const lines: string[] = [];

  lines.push(GENERATED_REPORT_BANNER);
  lines.push("# Complete File Inventory");
  lines.push("");
  lines.push(
    `Every tracked TypeScript file in the repository — **${summary.totalFiles} files** — not just ` +
      "the ones under `src/`. Built by walking the repo rather than an enumerated list of " +
      "directories, so a file in a directory nobody thought of still appears (tagged `other`) " +
      "instead of silently vanishing.",
  );
  lines.push("");
  lines.push(
    "> **Disposition is not a deletion list.** `orphan` means no static import path was found " +
      "from an entry root. A file reached only through a dynamic `import()` is invisible to a " +
      "static parser and will read as `orphan` while being entirely live. Verify before deleting " +
      "anything. This package also publishes to npm, so an export nothing uses in-repo may still " +
      "be public API for an external caller.",
  );
  lines.push("");

  lines.push("## Disposition counts");
  lines.push("");
  lines.push("| Disposition | Files |");
  lines.push("|---|---|");
  for (const [k, v] of Object.entries(summary.byDisposition).sort()) {
    lines.push(`| ${k} | ${v} |`);
  }
  lines.push("");

  lines.push("## Per-area counts");
  lines.push("");
  lines.push("| Area | Files | Lines |");
  lines.push("|---|---|---|");
  for (const [k, v] of Object.entries(summary.byArea).sort()) {
    lines.push(`| ${k} | ${v.files} | ${v.loc.toLocaleString("en-US")} |`);
  }
  lines.push("");

  lines.push("## All files");
  lines.push("");
  lines.push("| File | Area | Lines | Disposition |");
  lines.push("|---|---|---|---|");
  for (const f of files) {
    lines.push(`| \`${f.path}\` | ${f.area} | ${f.loc} | ${f.disposition} |`);
  }
  lines.push("");

  return lines.join("\n");
}

/**
 * Render the duplicate-symbol report.
 *
 * Ordered drift-risk first, because that is the actionable half: two
 * definitions meant to agree, able to diverge silently. `escapeLatex` did
 * exactly that here — three copies, two of them wrong for a long time, no test
 * comparing their output.
 */
export function generateDuplicateSymbolsMarkdown(report: DuplicateReport): string {
  const { summary, duplicates } = report;
  const lines: string[] = [];

  lines.push(GENERATED_REPORT_BANNER);
  lines.push("# Duplicate Symbols");
  lines.push("");
  lines.push(
    `**${summary.duplicateSymbolCount}** symbol names are defined in more than one file: ` +
      `**${summary.driftRiskCount}** drift-risk, **${summary.nameCollisionCount}** name collisions. ` +
      "Re-exports are excluded — a barrel re-exporting a symbol has not defined a second one.",
  );
  lines.push("");
  lines.push(
    "> **Do not collapse a duplicate before proving the copies behave identically.** Two " +
      "functions differing by one escaped character are not duplicates; pin the difference with " +
      "a test so a later 'unification' fails loudly. Conversely, `DRIFT_RISK` is where real bugs " +
      "hide: this repo shipped three copies of `escapeLatex`, two of which re-escaped their own " +
      "braces so every backslash rendered as `\\{}`, and no test compared them.",
  );
  lines.push("");

  const drift = duplicates.filter((d) => d.category === "DRIFT_RISK");
  const collide = duplicates.filter((d) => d.category === "NAME_COLLISION");

  lines.push("## Drift risk — same name, same kind, more than one definition");
  lines.push("");
  if (drift.length === 0) {
    lines.push("_None._");
  } else {
    lines.push("| Symbol | Kind | Defined in |");
    lines.push("|---|---|---|");
    for (const d of drift) {
      lines.push(
        `| \`${d.name}\` | ${d.definitions[0].kind} | ${d.definitions.map((x) => `\`${x.file}\``).join("<br>")} |`,
      );
    }
  }
  lines.push("");

  lines.push("## Name collisions — same name, different kinds");
  lines.push("");
  if (collide.length === 0) {
    lines.push("_None._");
  } else {
    lines.push("| Symbol | Defined in |");
    lines.push("|---|---|");
    for (const d of collide) {
      lines.push(
        `| \`${d.name}\` | ${d.definitions.map((x) => `\`${x.file}\` (${x.kind})`).join("<br>")} |`,
      );
    }
  }
  lines.push("");

  return lines.join("\n");
}
