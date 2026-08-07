/**
 * Dependency Graph Generator
 *
 * Scans a project's `src/` tree and emits the dependency documentation under
 * `docs/architecture/`: the full JSON/YAML graph, a compact LLM summary, the
 * human-readable DEPENDENCY_GRAPH.md, and the unused-code analysis.
 *
 * This file is the entry point and orchestration only. The work lives in
 * `src/`, layered so the graph stays acyclic:
 *
 *   types.ts / paths.ts   leaves -- shapes and relative-import resolution
 *   config.ts             project root, output paths, generated-file banner
 *   scanner.ts            the only layer that reads source text
 *   analysis.ts           derives modules, matrix, cycles, unused, statistics
 *   reporters/*           render the analysis; they never re-read source
 *
 * Run with `npm run docs:deps` (tsx). The committed `.exe` is built from these
 * same sources with `npm run build` in this directory -- rebuild it whenever
 * this tool changes, or it silently generates stale output.
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as yamlNs from 'js-yaml';

import { OUTPUT_DIR, SRC_DIR } from './src/config.js';
import { getAllTsFiles, parseFile } from './src/scanner.js';
import {
  buildDependencyMatrix,
  categorizeFiles,
  detectCircularDependencies,
  detectUnused,
  generateStatistics,
} from './src/analysis.js';
import { generateCompactSummary, generateJSON } from './src/reporters/json-reports.js';
import { generateMarkdown } from './src/reporters/markdown-report.js';
import { buildUnusedReport, logUnusedSummary } from './src/reporters/unused-report.js';

// The two runtimes resolve js-yaml differently and take different branches
// here: under Node/tsx it resolves to the CJS build, where the namespace
// import carries a `default`; Bun's bundler picks js-yaml.mjs, which has none,
// so the fallback applies (bun build warns about exactly this). Both land on
// the same module object -- verified by generating with `npm run docs:deps`
// and with the compiled .exe and diffing all five outputs by SHA256.
const yaml = (yamlNs as any).default ?? yamlNs;

async function main(): Promise<void> {
  console.log('Scanning codebase for dependencies...');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  // Get all TypeScript files
  const tsFiles = getAllTsFiles(SRC_DIR);
  console.log(`Found ${tsFiles.length} TypeScript files`);

  if (tsFiles.length === 0) {
    console.error('No TypeScript files found in src/');
    process.exit(1);
  }

  // Parse all files
  const parsedFiles = tsFiles.map(parseFile);
  console.log('Parsed all files');

  // Categorize into modules
  const modules = categorizeFiles(parsedFiles);
  console.log(`Categorized into ${Object.keys(modules).length} modules`);

  // Detect circular dependencies
  const circularDeps = detectCircularDependencies(parsedFiles);
  console.log(`Found ${circularDeps.all.length} circular dependencies (${circularDeps.runtime.length} runtime, ${circularDeps.typeOnly.length} type-only)`);

  // Detect unused files and exports
  const unusedAnalysis = detectUnused(parsedFiles);

  // Generate statistics
  const stats = generateStatistics(parsedFiles, modules, circularDeps, unusedAnalysis);
  console.log('Generated statistics');

  // Build dependency matrix
  const matrix = buildDependencyMatrix(parsedFiles);
  console.log('Built dependency matrix');

  // Generate outputs
  const json = generateJSON(parsedFiles, modules, stats, circularDeps);
  const markdown = generateMarkdown(parsedFiles, modules, stats, circularDeps, matrix);

  // Write outputs
  writeFileSync(join(OUTPUT_DIR, 'dependency-graph.json'), JSON.stringify(json, null, 2));
  console.log('Written: docs/architecture/dependency-graph.json');

  // Write YAML output (more compact, ~40% smaller than JSON)
  const yamlOutput = yaml.dump(json, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  });
  writeFileSync(join(OUTPUT_DIR, 'dependency-graph.yaml'), yamlOutput);
  console.log('Written: docs/architecture/dependency-graph.yaml');

  writeFileSync(join(OUTPUT_DIR, 'DEPENDENCY_GRAPH.md'), markdown);
  console.log('Written: docs/architecture/DEPENDENCY_GRAPH.md');

  // Write compact summary for LLM consumption (CTON-style, ~10KB)
  const compactSummary = generateCompactSummary(parsedFiles, modules, stats, circularDeps);
  writeFileSync(join(OUTPUT_DIR, 'dependency-summary.compact.json'), compactSummary);
  const compactSize = Buffer.byteLength(compactSummary, 'utf8');
  console.log(`Written: docs/architecture/dependency-summary.compact.json (${(compactSize / 1024).toFixed(1)}KB)`);

  console.log('\nDependency graph generation complete!');
  console.log(`  - ${stats.totalTypeScriptFiles} files analyzed`);
  console.log(`  - ${stats.totalExports} exports found (${stats.totalReExports} re-exports)`);
  console.log(`  - ${stats.totalTypeOnlyImports} type-only imports detected`);
  console.log(`  - ${circularDeps.all.length} circular dependencies:`);
  console.log(`      ${circularDeps.runtime.length} runtime (require attention)`);
  console.log(`      ${circularDeps.typeOnly.length} type-only (safe)`);
  console.log(`  - ${unusedAnalysis.unusedFiles.length} potentially unused files`);
  console.log(`  - ${unusedAnalysis.unusedExports.length} potentially unused exports`);

  logUnusedSummary(unusedAnalysis);

  // Write full unused analysis to a separate file
  const unusedReportPath = join(OUTPUT_DIR, 'unused-analysis.md');
  writeFileSync(unusedReportPath, buildUnusedReport(unusedAnalysis));
  console.log(`\nWritten: ${unusedReportPath}`);
}

main().catch(console.error);
