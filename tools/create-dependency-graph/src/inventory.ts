/**
 * Complete file census — every tracked TypeScript file in the repo, not just
 * the ones under `src/`.
 *
 * The dependency graph deliberately censuses `src/` alone, which makes it blind
 * to whole categories of file. The inventory walks the repo instead, on the
 * principle of **inclusion over exclusion**: a file in a directory nobody
 * thought of still appears, tagged `other`, rather than silently vanishing.
 * That is the failure mode a narrower walk produces — a scoping gap reads
 * identically to "nothing there."
 *
 * Disposition is NOT a deletion list. A file reached only through a dynamic
 * `import()` is invisible to a static parser and will read as `orphan`. The
 * generated report repeats that warning where the counts appear.
 */
import { readdirSync, readFileSync } from "fs";
import { join, relative, sep } from "path";

export type FileArea = "src" | "tests" | "tools" | "templates" | "config" | "docs" | "other";
export type FileDisposition = "reachable" | "orphan" | "test" | "tool" | "config" | "template" | "other";

export interface InventoryEntry {
  path: string;
  area: FileArea;
  loc: number;
  disposition: FileDisposition;
}

export interface FileInventory {
  summary: {
    totalFiles: number;
    byArea: Record<string, { files: number; loc: number }>;
    byDisposition: Record<string, number>;
  };
  files: InventoryEntry[];
}

/** Directories that hold no authored source and would only add noise. */
const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "coverage",
  "build",
  ".git",
  ".turbo",
  "test-results",
]);

function walk(dir: string, root: string, out: string[]): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // Unreadable directory: skip it rather than abort the census.
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, root, out);
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
      out.push(relative(root, full).split(sep).join("/"));
    }
  }
}

function areaOf(path: string): FileArea {
  if (path.startsWith("src/")) return "src";
  if (path.startsWith("tests/")) return "tests";
  if (path.startsWith("tools/")) return "tools";
  if (path.startsWith("templates/")) return "templates";
  if (path.startsWith("docs/")) return "docs";
  // A root-level *.config.ts, or anything else at the top level.
  if (!path.includes("/")) return "config";
  return "other";
}

/**
 * Build the census.
 *
 * `reachableSrcFiles` is the set of `src/` paths the dependency graph proved
 * reachable from an entry root; anything under `src/` outside it is `orphan`.
 * Files outside `src/` get a disposition from their area — they are not part of
 * the shipped graph and calling them orphans would be wrong.
 */
export function buildFileInventory(
  root: string,
  reachableSrcFiles: ReadonlySet<string>,
): FileInventory {
  const paths: string[] = [];
  walk(root, root, paths);
  paths.sort();

  const files: InventoryEntry[] = paths.map((path) => {
    const area = areaOf(path);
    let loc = 0;
    try {
      loc = readFileSync(join(root, path), "utf-8").split("\n").length;
    } catch {
      loc = 0;
    }

    let disposition: FileDisposition;
    switch (area) {
      case "src":
        disposition = reachableSrcFiles.has(path) ? "reachable" : "orphan";
        break;
      case "tests":
        disposition = "test";
        break;
      case "tools":
        disposition = "tool";
        break;
      case "templates":
        disposition = "template";
        break;
      case "config":
        disposition = "config";
        break;
      default:
        disposition = "other";
    }

    return { path, area, loc, disposition };
  });

  const byArea: Record<string, { files: number; loc: number }> = {};
  const byDisposition: Record<string, number> = {};
  for (const f of files) {
    byArea[f.area] ??= { files: 0, loc: 0 };
    byArea[f.area].files += 1;
    byArea[f.area].loc += f.loc;
    byDisposition[f.disposition] = (byDisposition[f.disposition] ?? 0) + 1;
  }

  return { summary: { totalFiles: files.length, byArea, byDisposition }, files };
}
