/**
 * The unused-files/unused-exports report, and its console summary.
 *
 * Both views are deliberately built from the same `UnusedAnalysis` and kept in
 * one module: the console output is a truncated preview of the file (top 20
 * files, top 10 files' exports), and when the two drifted apart a reader could
 * not tell a truncated console listing from a complete one.
 */
import { GENERATED_REPORT_BANNER } from '../config.js';
import type { UnusedAnalysis, UnusedExport } from '../types.js';

/** Group unused exports by the file that declares them. */
function groupByFile(exports: UnusedExport[]): Map<string, UnusedExport[]> {
  const byFile = new Map<string, UnusedExport[]>();
  for (const exp of exports) {
    if (!byFile.has(exp.file)) byFile.set(exp.file, []);
    byFile.get(exp.file)!.push(exp);
  }
  return byFile;
}

/**
 * Print a truncated preview to the console. Every truncation states how much
 * it dropped -- a silently capped listing reads as a complete one.
 */
export function logUnusedSummary(unusedAnalysis: UnusedAnalysis): void {
  // Print unused files if any
  if (unusedAnalysis.unusedFiles.length > 0) {
    console.log('\nPotentially unused files:');
    for (const file of unusedAnalysis.unusedFiles.slice(0, 20)) {
      console.log(`  - ${file}`);
    }
    if (unusedAnalysis.unusedFiles.length > 20) {
      console.log(`  ... and ${unusedAnalysis.unusedFiles.length - 20} more`);
    }
  }

  // Print unused exports if any (grouped by file)
  if (unusedAnalysis.unusedExports.length > 0) {
    console.log('\nPotentially unused exports:');
    const byFile = groupByFile(unusedAnalysis.unusedExports);
    let shown = 0;
    for (const [file, exports] of byFile) {
      if (shown >= 10) {
        console.log(`  ... and ${byFile.size - 10} more files with unused exports`);
        break;
      }
      console.log(`  ${file}:`);
      for (const exp of exports.slice(0, 5)) {
        console.log(`    - ${exp.name} (${exp.type})`);
      }
      if (exports.length > 5) {
        console.log(`    ... and ${exports.length - 5} more`);
      }
      shown++;
    }
  }
}

/** Build the complete (untruncated) unused-analysis Markdown report. */
export function buildUnusedReport(unusedAnalysis: UnusedAnalysis): string {
  let unusedReport = `${GENERATED_REPORT_BANNER}\n# Unused Files and Exports Analysis\n\n`;
  unusedReport += `**Generated**: ${new Date().toISOString().split('T')[0]}\n\n`;
  unusedReport += `## Summary\n\n`;
  unusedReport += `- **Potentially unused files**: ${unusedAnalysis.unusedFiles.length}\n`;
  unusedReport += `- **Potentially unused exports**: ${unusedAnalysis.unusedExports.length}\n\n`;

  unusedReport += `## Potentially Unused Files\n\n`;
  unusedReport += `These files are not imported by any other file in the codebase:\n\n`;
  for (const file of unusedAnalysis.unusedFiles) {
    unusedReport += `- \`${file}\`\n`;
  }

  unusedReport += `\n## Potentially Unused Exports\n\n`;
  unusedReport += `These exports are not imported by any other file in the codebase:\n\n`;
  const byFileForReport = groupByFile(unusedAnalysis.unusedExports);
  for (const [file, exports] of byFileForReport) {
    unusedReport += `### \`${file}\`\n\n`;
    for (const exp of exports) {
      unusedReport += `- \`${exp.name}\` (${exp.type})\n`;
    }
    unusedReport += '\n';
  }

  return unusedReport;
}
