/**
 * The human-readable DEPENDENCY_GRAPH.md report and its Mermaid diagram.
 */
import { basename } from 'path';
import { GENERATED_REPORT_BANNER, packageJson } from '../config.js';
import { resolvePath } from '../paths.js';
import type {
  CircularDependencyResult,
  DependencyMatrix,
  ModuleMap,
  ParsedFile,
  Statistics,
} from '../types.js';

/**
 * Generate a dynamic Mermaid diagram from actual dependencies
 */
export function generateMermaidDiagram(modules: ModuleMap, files: ParsedFile[]): string {
  const lines: string[] = [];
  lines.push('```mermaid');
  lines.push('graph TD');

  // Create subgraphs for each module
  const moduleNames = Object.keys(modules);
  const nodeIds = new Map<string, string>();
  let nodeCounter = 0;

  for (const moduleName of moduleNames) {
    const title = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    lines.push(`    subgraph ${title}`);

    const moduleFiles = Object.keys(modules[moduleName]);
    for (const filePath of moduleFiles.slice(0, 5)) { // Limit to 5 files per module for readability
      const name = basename(filePath, '.ts');
      const nodeId = `N${nodeCounter++}`;
      nodeIds.set(filePath, nodeId);
      lines.push(`        ${nodeId}[${name}]`);
    }

    if (moduleFiles.length > 5) {
      const nodeId = `N${nodeCounter++}`;
      lines.push(`        ${nodeId}[...${moduleFiles.length - 5} more]`);
    }

    lines.push('    end');
    lines.push('');
  }

  // Add edges for dependencies (limited for readability)
  const addedEdges = new Set<string>();
  let edgeCount = 0;
  const maxEdges = 30;

  for (const file of files) {
    const sourceId = nodeIds.get(file.path);
    if (!sourceId) continue;

    for (const dep of file.internalDependencies) {
      if (edgeCount >= maxEdges) break;

      const resolved = resolvePath(file.path, dep.file);
      const targetId = nodeIds.get(resolved);

      if (targetId && sourceId !== targetId) {
        const edgeKey = `${sourceId}-${targetId}`;
        if (!addedEdges.has(edgeKey)) {
          lines.push(`    ${sourceId} --> ${targetId}`);
          addedEdges.add(edgeKey);
          edgeCount++;
        }
      }
    }
  }

  lines.push('```');
  return lines.join('\n');
}

/**
 * Generate Markdown output
 */
export function generateMarkdown(files: ParsedFile[], modules: ModuleMap, stats: Statistics, circularDeps: CircularDependencyResult, matrix: DependencyMatrix): string {
  const today = new Date().toISOString().split('T')[0];
  const lines: string[] = [];
  const projectName = packageJson.name || 'Project';

  lines.push(GENERATED_REPORT_BANNER);
  lines.push(`# ${projectName} - Dependency Graph`);
  lines.push('');
  lines.push(`**Version**: ${packageJson.version} | **Last Updated**: ${today}`);
  lines.push('');
  lines.push('This document provides a comprehensive dependency graph of all files, components, imports, functions, and variables in the codebase.');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Table of Contents
  lines.push('## Table of Contents');
  lines.push('');
  lines.push('1. [Overview](#overview)');
  let tocIndex = 2;
  for (const category of Object.keys(modules)) {
    const title = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
    lines.push(`${tocIndex}. [${title} Dependencies](#${category.toLowerCase().replace(/\s+/g, '-')}-dependencies)`);
    tocIndex++;
  }
  lines.push(`${tocIndex}. [Dependency Matrix](#dependency-matrix)`);
  lines.push(`${tocIndex + 1}. [Circular Dependency Analysis](#circular-dependency-analysis)`);
  lines.push(`${tocIndex + 2}. [Visual Dependency Graph](#visual-dependency-graph)`);
  lines.push(`${tocIndex + 3}. [Summary Statistics](#summary-statistics)`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Overview
  lines.push('## Overview');
  lines.push('');
  lines.push('The codebase is organized into the following modules:');
  lines.push('');
  for (const [moduleName, moduleFiles] of Object.entries(modules)) {
    const fileCount = Object.keys(moduleFiles).length;
    lines.push(`- **${moduleName}**: ${fileCount} file${fileCount !== 1 ? 's' : ''}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Generate sections for each module category
  for (const [category, categoryFiles] of Object.entries(modules)) {
    const title = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
    lines.push(`## ${title} Dependencies`);
    lines.push('');

    for (const [path, file] of Object.entries(categoryFiles)) {
      const fileName = basename(path, '.ts');
      lines.push(`### \`${path}\` - ${file.description || `${fileName} module`}`);
      lines.push('');

      // External dependencies
      if (file.externalDependencies.length > 0) {
        lines.push('**External Dependencies:**');
        lines.push('| Package | Import |');
        lines.push('|---------|--------|');
        for (const dep of file.externalDependencies) {
          lines.push(`| \`${dep.package}\` | \`${dep.imports.join(', ')}\` |`);
        }
        lines.push('');
      }

      // Node dependencies
      if (file.nodeDependencies.length > 0) {
        lines.push('**Node.js Built-in Dependencies:**');
        lines.push('| Module | Import |');
        lines.push('|--------|--------|');
        for (const dep of file.nodeDependencies) {
          lines.push(`| \`${dep.module}\` | \`${dep.imports.join(', ')}\` |`);
        }
        lines.push('');
      }

      // Internal dependencies
      if (file.internalDependencies.length > 0) {
        lines.push('**Internal Dependencies:**');
        lines.push('| File | Imports | Type |');
        lines.push('|------|---------|------|');
        for (const dep of file.internalDependencies) {
          let usage = dep.reExport ? 'Re-export' : 'Import';
          if (dep.typeOnly) usage += ' (type-only)';
          lines.push(`| \`${dep.file}\` | \`${dep.imports.join(', ')}\` | ${usage} |`);
        }
        lines.push('');
      }

      // Exports
      if (file.exports.named.length > 0 || file.exports.default || file.exports.reExported.length > 0) {
        lines.push('**Exports:**');
        if (file.exports.classes.length > 0) {
          lines.push(`- Classes: \`${file.exports.classes.join('`, `')}\``);
        }
        if (file.exports.interfaces.length > 0) {
          lines.push(`- Interfaces: \`${file.exports.interfaces.join('`, `')}\``);
        }
        if (file.exports.enums.length > 0) {
          lines.push(`- Enums: \`${file.exports.enums.join('`, `')}\``);
        }
        if (file.exports.functions.length > 0) {
          lines.push(`- Functions: \`${file.exports.functions.join('`, `')}\``);
        }
        if (file.exports.constants.length > 0) {
          lines.push(`- Constants: \`${file.exports.constants.join('`, `')}\``);
        }
        if (file.exports.reExported.length > 0) {
          lines.push(`- Re-exports: \`${file.exports.reExported.join('`, `')}\``);
        }
        if (file.exports.default) {
          lines.push(`- Default: \`${file.exports.default}\``);
        }
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }
  }

  // Dependency Matrix
  lines.push('## Dependency Matrix');
  lines.push('');
  lines.push('### File Import/Export Matrix');
  lines.push('');
  lines.push('| File | Imports From | Exports To |');
  lines.push('|------|--------------|------------|');

  const matrixEntries = Object.entries(matrix).slice(0, 30); // Limit for readability
  for (const [path, deps] of matrixEntries) {
    const shortPath = basename(path, '.ts');
    const importsCount = deps.importsFrom.length;
    const exportsCount = deps.exportsTo.length;
    lines.push(`| \`${shortPath}\` | ${importsCount} files | ${exportsCount} files |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Circular Dependencies
  lines.push('## Circular Dependency Analysis');
  lines.push('');
  if (circularDeps.all.length === 0) {
    lines.push('**No circular dependencies detected.**');
  } else {
    lines.push(`**${circularDeps.all.length} circular dependencies detected:**`);
    lines.push('');
    lines.push(`- **Runtime cycles**: ${circularDeps.runtime.length} (require attention)`);
    lines.push(`- **Type-only cycles**: ${circularDeps.typeOnly.length} (safe, no runtime impact)`);
    lines.push('');

    if (circularDeps.runtime.length > 0) {
      lines.push('### Runtime Circular Dependencies');
      lines.push('');
      lines.push('These cycles involve runtime imports and may cause issues:');
      lines.push('');
      for (const cycle of circularDeps.runtime.slice(0, 10)) {
        lines.push(`- ${cycle.join(' -> ')}`);
      }
      if (circularDeps.runtime.length > 10) {
        lines.push(`- ... and ${circularDeps.runtime.length - 10} more`);
      }
      lines.push('');
    }

    if (circularDeps.typeOnly.length > 0) {
      lines.push('### Type-Only Circular Dependencies');
      lines.push('');
      lines.push('These cycles only involve type imports and are safe (erased at runtime):');
      lines.push('');
      for (const cycle of circularDeps.typeOnly.slice(0, 10)) {
        lines.push(`- ${cycle.join(' -> ')}`);
      }
      if (circularDeps.typeOnly.length > 10) {
        lines.push(`- ... and ${circularDeps.typeOnly.length - 10} more`);
      }
      lines.push('');
    }
  }
  lines.push('---');
  lines.push('');

  // Visual Dependency Graph
  lines.push('## Visual Dependency Graph');
  lines.push('');
  lines.push(generateMermaidDiagram(modules, files));
  lines.push('');
  lines.push('---');
  lines.push('');

  // Summary Statistics
  lines.push('## Summary Statistics');
  lines.push('');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  lines.push(`| Total TypeScript Files | ${stats.totalTypeScriptFiles} |`);
  lines.push(`| Total Modules | ${stats.totalModules} |`);
  lines.push(`| Total Lines of Code | ${stats.totalLinesOfCode} |`);
  lines.push(`| Total Exports | ${stats.totalExports} |`);
  lines.push(`| Total Re-exports | ${stats.totalReExports} |`);
  lines.push(`| Total Classes | ${stats.totalClasses} |`);
  lines.push(`| Total Interfaces | ${stats.totalInterfaces} |`);
  lines.push(`| Total Functions | ${stats.totalFunctions} |`);
  lines.push(`| Total Type Guards | ${stats.totalTypeGuards} |`);
  lines.push(`| Total Enums | ${stats.totalEnums} |`);
  lines.push(`| Type-only Imports | ${stats.totalTypeOnlyImports} |`);
  lines.push(`| Runtime Circular Deps | ${stats.runtimeCircularDeps} |`);
  lines.push(`| Type-only Circular Deps | ${stats.typeOnlyCircularDeps} |`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`*Last Updated*: ${today}`);
  lines.push(`*Version*: ${packageJson.version}`);
  lines.push('');

  return lines.join('\n');
}
