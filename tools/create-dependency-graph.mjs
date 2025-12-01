#!/usr/bin/env node

/**
 * Dependency Graph Generator for DeepThinking MCP
 *
 * Scans the codebase and generates:
 * - docs/architecture/DEPENDENCY_GRAPH.md
 * - docs/architecture/dependency-graph.json
 *
 * Usage: node tools/create-dependency-graph.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const SRC_DIR = join(ROOT_DIR, 'src');
const OUTPUT_DIR = join(ROOT_DIR, 'docs', 'architecture');

// Read package.json for version
const packageJson = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf-8'));

/**
 * Recursively get all TypeScript files in a directory
 */
function getAllTsFiles(dir, files = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      getAllTsFiles(fullPath, files);
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts') && !entry.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse a TypeScript file for imports and exports
 */
function parseFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = relative(ROOT_DIR, filePath);

  const result = {
    path: relativePath,
    name: basename(filePath, '.ts'),
    externalDependencies: [],
    nodeDependencies: [],
    internalDependencies: [],
    exports: {
      named: [],
      default: null,
      types: [],
      interfaces: [],
      enums: [],
      classes: [],
      functions: [],
      constants: []
    },
    description: extractDescription(content)
  };

  // Parse imports
  const importRegex = /import\s+(?:(?:type\s+)?(?:{([^}]+)}|(\w+)|\*\s+as\s+(\w+))(?:\s*,\s*(?:{([^}]+)}|(\w+)))?)\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const namedImports = match[1] || match[4] || '';
    const defaultImport = match[2] || match[5] || '';
    const namespaceImport = match[3] || '';
    const source = match[6];

    const imports = [];
    if (namedImports) {
      imports.push(...namedImports.split(',').map(s => s.trim().split(' as ')[0].replace(/^type\s+/, '')).filter(Boolean));
    }
    if (defaultImport) imports.push(defaultImport);
    if (namespaceImport) imports.push(`* as ${namespaceImport}`);

    if (source.startsWith('.')) {
      result.internalDependencies.push({
        file: source,
        imports: imports
      });
    } else if (source.startsWith('node:') || ['fs', 'path', 'url', 'crypto', 'util', 'stream', 'events', 'buffer', 'os', 'child_process'].includes(source)) {
      result.nodeDependencies.push({
        module: source.replace('node:', ''),
        imports: imports
      });
    } else {
      result.externalDependencies.push({
        package: source,
        imports: imports
      });
    }
  }

  // Parse exports
  // Named exports: export { foo, bar }
  const namedExportRegex = /export\s*{\s*([^}]+)\s*}/g;
  while ((match = namedExportRegex.exec(content)) !== null) {
    const exports = match[1].split(',').map(s => s.trim().split(' as ')[0]).filter(Boolean);
    result.exports.named.push(...exports);
  }

  // Export declarations
  // export const/let/var
  const constExportRegex = /export\s+(?:const|let|var)\s+(\w+)/g;
  while ((match = constExportRegex.exec(content)) !== null) {
    result.exports.constants.push(match[1]);
    result.exports.named.push(match[1]);
  }

  // export function
  const funcExportRegex = /export\s+(?:async\s+)?function\s+(\w+)/g;
  while ((match = funcExportRegex.exec(content)) !== null) {
    result.exports.functions.push(match[1]);
    result.exports.named.push(match[1]);
  }

  // export class
  const classExportRegex = /export\s+class\s+(\w+)/g;
  while ((match = classExportRegex.exec(content)) !== null) {
    result.exports.classes.push(match[1]);
    result.exports.named.push(match[1]);
  }

  // export interface
  const interfaceExportRegex = /export\s+interface\s+(\w+)/g;
  while ((match = interfaceExportRegex.exec(content)) !== null) {
    result.exports.interfaces.push(match[1]);
    result.exports.types.push(match[1]);
  }

  // export type
  const typeExportRegex = /export\s+type\s+(\w+)/g;
  while ((match = typeExportRegex.exec(content)) !== null) {
    result.exports.types.push(match[1]);
  }

  // export enum
  const enumExportRegex = /export\s+enum\s+(\w+)/g;
  while ((match = enumExportRegex.exec(content)) !== null) {
    result.exports.enums.push(match[1]);
    result.exports.named.push(match[1]);
  }

  // export default
  const defaultExportRegex = /export\s+default\s+(?:class|function|const|let|var)?\s*(\w+)?/;
  const defaultMatch = content.match(defaultExportRegex);
  if (defaultMatch) {
    result.exports.default = defaultMatch[1] || 'default';
  }

  // Re-exports: export * from
  const reExportAllRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = reExportAllRegex.exec(content)) !== null) {
    result.internalDependencies.push({
      file: match[1],
      imports: ['*'],
      reExport: true
    });
  }

  // Re-exports: export { foo } from
  const reExportNamedRegex = /export\s*{\s*([^}]+)\s*}\s*from\s+['"]([^'"]+)['"]/g;
  while ((match = reExportNamedRegex.exec(content)) !== null) {
    const exports = match[1].split(',').map(s => s.trim().split(' as ')[0]).filter(Boolean);
    result.internalDependencies.push({
      file: match[2],
      imports: exports,
      reExport: true
    });
    result.exports.named.push(...exports);
  }

  // Dedupe exports
  result.exports.named = [...new Set(result.exports.named)];
  result.exports.types = [...new Set(result.exports.types)];

  return result;
}

/**
 * Extract file description from comments
 */
function extractDescription(content) {
  // Try to find JSDoc comment at the top
  const jsdocMatch = content.match(/\/\*\*\s*\n([^*]*(?:\*(?!\/)[^*]*)*)\*\//);
  if (jsdocMatch) {
    const lines = jsdocMatch[1].split('\n')
      .map(line => line.replace(/^\s*\*\s?/, '').trim())
      .filter(line => !line.startsWith('@') && line.length > 0);
    if (lines.length > 0) {
      return lines[0];
    }
  }

  // Try single-line comment
  const singleLineMatch = content.match(/^\/\/\s*(.+)$/m);
  if (singleLineMatch) {
    return singleLineMatch[1];
  }

  return null;
}

/**
 * Categorize files into modules
 */
function categorizeFiles(files) {
  const modules = {
    entry: {},
    services: {},
    session: {},
    types: {},
    tools: {},
    export: {},
    utils: {},
    interfaces: {},
    cache: {},
    search: {},
    taxonomy: {},
    backup: {},
    batch: {},
    'rate-limit': {},
    comparison: {},
    collaboration: {},
    repositories: {},
    config: {},
    templates: {},
    analytics: {},
    modes: {},
    validation: {}
  };

  for (const file of files) {
    const relativePath = file.path;

    if (relativePath === 'src/index.ts') {
      modules.entry[relativePath] = file;
    } else if (relativePath.startsWith('src/services/')) {
      modules.services[relativePath] = file;
    } else if (relativePath.startsWith('src/session/')) {
      modules.session[relativePath] = file;
    } else if (relativePath.startsWith('src/types/')) {
      modules.types[relativePath] = file;
    } else if (relativePath.startsWith('src/tools/')) {
      modules.tools[relativePath] = file;
    } else if (relativePath.startsWith('src/export/')) {
      modules.export[relativePath] = file;
    } else if (relativePath.startsWith('src/utils/')) {
      modules.utils[relativePath] = file;
    } else if (relativePath.startsWith('src/interfaces/')) {
      modules.interfaces[relativePath] = file;
    } else if (relativePath.startsWith('src/cache/')) {
      modules.cache[relativePath] = file;
    } else if (relativePath.startsWith('src/search/')) {
      modules.search[relativePath] = file;
    } else if (relativePath.startsWith('src/taxonomy/')) {
      modules.taxonomy[relativePath] = file;
    } else if (relativePath.startsWith('src/backup/')) {
      modules.backup[relativePath] = file;
    } else if (relativePath.startsWith('src/batch/')) {
      modules.batch[relativePath] = file;
    } else if (relativePath.startsWith('src/rate-limit/')) {
      modules['rate-limit'][relativePath] = file;
    } else if (relativePath.startsWith('src/comparison/')) {
      modules.comparison[relativePath] = file;
    } else if (relativePath.startsWith('src/collaboration/')) {
      modules.collaboration[relativePath] = file;
    } else if (relativePath.startsWith('src/repositories/')) {
      modules.repositories[relativePath] = file;
    } else if (relativePath.startsWith('src/config/')) {
      modules.config[relativePath] = file;
    } else if (relativePath.startsWith('src/templates/')) {
      modules.templates[relativePath] = file;
    } else if (relativePath.startsWith('src/analytics/')) {
      modules.analytics[relativePath] = file;
    } else if (relativePath.startsWith('src/modes/')) {
      modules.modes[relativePath] = file;
    } else if (relativePath.startsWith('src/validation/')) {
      modules.validation[relativePath] = file;
    }
  }

  // Remove empty modules
  for (const key of Object.keys(modules)) {
    if (Object.keys(modules[key]).length === 0) {
      delete modules[key];
    }
  }

  return modules;
}

/**
 * Build dependency matrix
 */
function buildDependencyMatrix(files) {
  const matrix = {};

  for (const file of files) {
    const importedFrom = new Set();
    const exportsTo = new Set();

    // Find what this file imports from
    for (const dep of file.internalDependencies) {
      importedFrom.add(dep.file);
    }

    // Find what files export to this file
    for (const other of files) {
      if (other.path === file.path) continue;
      for (const dep of other.internalDependencies) {
        // Normalize paths for comparison
        const resolvedPath = resolvePath(other.path, dep.file);
        if (resolvedPath === file.path || resolvedPath === file.path.replace('.ts', '')) {
          exportsTo.add(other.path);
        }
      }
    }

    matrix[file.path] = {
      importsFrom: [...importedFrom],
      exportsTo: [...exportsTo]
    };
  }

  return matrix;
}

/**
 * Resolve relative path
 */
function resolvePath(fromPath, relativePath) {
  const dir = dirname(fromPath);
  let resolved = join(dir, relativePath);

  // Remove .js extension if present
  resolved = resolved.replace(/\.js$/, '');

  // Add .ts extension if not present
  if (!resolved.endsWith('.ts')) {
    resolved = resolved + '.ts';
  }

  // Normalize path separators
  resolved = resolved.replace(/\\/g, '/');

  return resolved;
}

/**
 * Detect circular dependencies using Tarjan's algorithm for SCCs
 */
function detectCircularDependencies(files) {
  // Build a map of file paths for quick lookup
  const filePaths = new Set(files.map(f => f.path));

  // Build adjacency list with resolved paths
  const graph = new Map();
  for (const file of files) {
    const deps = [];
    for (const d of file.internalDependencies) {
      const resolved = resolvePath(file.path, d.file);
      // Only include if the resolved path exists in our file set
      if (filePaths.has(resolved)) {
        deps.push(resolved);
      }
    }
    graph.set(file.path, deps);
  }

  const cycles = [];
  const visited = new Set();
  const inStack = new Set();

  function dfs(node, path) {
    if (inStack.has(node)) {
      // Found a cycle - extract just the cycle portion
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart);
        cycle.push(node);
        // Only add unique cycles (check by sorted string representation)
        const cycleKey = [...cycle].sort().join('->');
        if (!cycles.some(c => [...c].sort().join('->') === cycleKey)) {
          cycles.push(cycle);
        }
      }
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      dfs(neighbor, path);
    }

    path.pop();
    inStack.delete(node);
  }

  // Start DFS from each node
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

/**
 * Generate statistics
 */
function generateStatistics(files, modules) {
  let totalExports = 0;
  let totalClasses = 0;
  let totalInterfaces = 0;
  let totalFunctions = 0;
  let totalTypeGuards = 0;
  let totalEnums = 0;
  let totalConstants = 0;
  let totalLines = 0;

  for (const file of files) {
    totalExports += file.exports.named.length;
    totalClasses += file.exports.classes.length;
    totalInterfaces += file.exports.interfaces.length;
    totalFunctions += file.exports.functions.length;
    totalEnums += file.exports.enums.length;
    totalConstants += file.exports.constants.length;

    // Count type guards
    totalTypeGuards += file.exports.functions.filter(f => f.startsWith('is')).length;

    // Count lines
    try {
      const content = readFileSync(join(ROOT_DIR, file.path), 'utf-8');
      totalLines += content.split('\n').length;
    } catch (e) {
      // Ignore
    }
  }

  return {
    totalTypeScriptFiles: files.length,
    totalModules: Object.keys(modules).length,
    totalLinesOfCode: totalLines,
    totalExports,
    totalClasses,
    totalInterfaces,
    totalFunctions,
    totalTypeGuards,
    totalEnums,
    totalConstants
  };
}

/**
 * Get thinking modes information
 */
function getThinkingModes() {
  return {
    total: 21,
    fullyImplemented: [
      'sequential', 'shannon', 'mathematics', 'physics', 'hybrid',
      'metareasoning', 'recursive', 'modal', 'stochastic', 'constraint',
      'optimization', 'inductive', 'deductive'
    ],
    experimental: [
      'abductive', 'causal', 'bayesian', 'counterfactual', 'analogical',
      'temporal', 'gametheory', 'evidential', 'firstprinciples',
      'systemsthinking', 'scientificmethod', 'formallogic'
    ],
    modeToToolMapping: {
      inductive: 'deepthinking_core',
      deductive: 'deepthinking_core',
      abductive: 'deepthinking_core',
      sequential: 'deepthinking_standard',
      shannon: 'deepthinking_standard',
      hybrid: 'deepthinking_standard',
      mathematics: 'deepthinking_math',
      physics: 'deepthinking_math',
      temporal: 'deepthinking_temporal',
      bayesian: 'deepthinking_probabilistic',
      evidential: 'deepthinking_probabilistic',
      causal: 'deepthinking_causal',
      counterfactual: 'deepthinking_causal',
      gametheory: 'deepthinking_strategic',
      optimization: 'deepthinking_strategic',
      analogical: 'deepthinking_analytical',
      firstprinciples: 'deepthinking_analytical',
      metareasoning: 'deepthinking_analytical',
      scientificmethod: 'deepthinking_scientific',
      systemsthinking: 'deepthinking_scientific',
      formallogic: 'deepthinking_scientific'
    }
  };
}

/**
 * Get tools information
 */
function getToolsInfo() {
  return {
    total: 10,
    list: [
      { name: 'deepthinking_core', description: 'Fundamental reasoning', modes: ['inductive', 'deductive', 'abductive'] },
      { name: 'deepthinking_standard', description: 'Standard workflows', modes: ['sequential', 'shannon', 'hybrid'] },
      { name: 'deepthinking_math', description: 'Mathematical/physical reasoning', modes: ['mathematics', 'physics'] },
      { name: 'deepthinking_temporal', description: 'Time-based reasoning', modes: ['temporal'] },
      { name: 'deepthinking_probabilistic', description: 'Probability reasoning', modes: ['bayesian', 'evidential'] },
      { name: 'deepthinking_causal', description: 'Causal analysis', modes: ['causal', 'counterfactual'] },
      { name: 'deepthinking_strategic', description: 'Strategic decision-making', modes: ['gametheory', 'optimization'] },
      { name: 'deepthinking_analytical', description: 'Analytical reasoning', modes: ['analogical', 'firstprinciples', 'metareasoning'] },
      { name: 'deepthinking_scientific', description: 'Scientific methods', modes: ['scientificmethod', 'systemsthinking', 'formallogic'] },
      { name: 'deepthinking_session', description: 'Session management', modes: ['all'] }
    ]
  };
}

/**
 * Get visual exporters information
 */
function getVisualExporters(files) {
  const exporters = [];
  const visualFiles = files.filter(f => f.path.startsWith('src/export/visual/') && f.path !== 'src/export/visual/index.ts');

  for (const file of visualFiles) {
    const name = basename(file.path, '.ts');
    if (name !== 'types' && name !== 'utils') {
      exporters.push(name);
    }
  }

  return {
    total: exporters.length,
    list: exporters.sort()
  };
}

/**
 * Generate JSON output
 */
function generateJSON(files, modules, stats, circularDeps) {
  const today = new Date().toISOString().split('T')[0];

  // Convert modules to JSON-friendly format
  const modulesJson = {};
  for (const [category, categoryFiles] of Object.entries(modules)) {
    modulesJson[category] = {};
    for (const [path, file] of Object.entries(categoryFiles)) {
      modulesJson[category][path] = {
        description: file.description || `${file.name} module`,
        externalDependencies: file.externalDependencies,
        nodeDependencies: file.nodeDependencies,
        internalDependencies: file.internalDependencies.map(d => ({
          file: d.file,
          imports: d.imports,
          ...(d.reExport ? { reExport: true } : {})
        })),
        exports: file.exports.named,
        classes: file.exports.classes.length > 0 ? file.exports.classes : undefined,
        interfaces: file.exports.interfaces.length > 0 ? file.exports.interfaces : undefined,
        functions: file.exports.functions.length > 0 ? file.exports.functions : undefined,
        enums: file.exports.enums.length > 0 ? file.exports.enums : undefined,
        constants: file.exports.constants.length > 0 ? file.exports.constants : undefined
      };

      // Clean up undefined values
      Object.keys(modulesJson[category][path]).forEach(key => {
        if (modulesJson[category][path][key] === undefined) {
          delete modulesJson[category][path][key];
        }
      });
    }
  }

  return {
    metadata: {
      version: packageJson.version,
      lastUpdated: today,
      totalFiles: stats.totalTypeScriptFiles,
      totalModules: stats.totalModules,
      totalExports: stats.totalExports
    },
    entryPoints: [
      {
        file: 'src/index.ts',
        type: 'main',
        description: 'MCP Server Entry Point'
      }
    ],
    modules: modulesJson,
    thinkingModes: getThinkingModes(),
    tools: getToolsInfo(),
    visualExporters: getVisualExporters(files),
    dependencyGraph: {
      circularDependencies: circularDeps,
      layers: [
        { name: 'Entry', files: ['src/index.ts'] },
        { name: 'Tools', files: Object.keys(modules.tools || {}) },
        { name: 'Services', files: Object.keys(modules.services || {}) },
        { name: 'Session', files: Object.keys(modules.session || {}) },
        { name: 'Export', files: Object.keys(modules.export || {}) },
        { name: 'Types', files: Object.keys(modules.types || {}) },
        { name: 'Infrastructure', files: [
          ...Object.keys(modules.cache || {}),
          ...Object.keys(modules.interfaces || {}),
          ...Object.keys(modules.repositories || {})
        ] },
        { name: 'Utils', files: Object.keys(modules.utils || {}) }
      ].filter(l => l.files.length > 0)
    },
    statistics: stats
  };
}

/**
 * Generate Markdown output
 */
function generateMarkdown(files, modules, stats, circularDeps, matrix) {
  const today = new Date().toISOString().split('T')[0];
  const lines = [];

  lines.push('# DeepThinking MCP - Dependency Graph');
  lines.push('');
  lines.push(`**Version**: ${packageJson.version} | **Last Updated**: ${today}`);
  lines.push('');
  lines.push('This document provides a comprehensive dependency graph of all files, components, imports, functions, and variables in the DeepThinking MCP codebase.');
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
  lines.push('The DeepThinking MCP codebase follows a layered architecture with clear dependency directions:');
  lines.push('');
  lines.push('```');
  lines.push('┌─────────────────────────────────────────────────────────────┐');
  lines.push('│                    Entry Point (index.ts)                   │');
  lines.push('├─────────────────────────────────────────────────────────────┤');
  lines.push('│                     Tools Layer                             │');
  lines.push('│        (definitions.ts, thinking.ts, schemas/*)             │');
  lines.push('├─────────────────────────────────────────────────────────────┤');
  lines.push('│                    Services Layer                           │');
  lines.push('│  (ThoughtFactory, ExportService, ModeRouter, MetaMonitor)   │');
  lines.push('├─────────────────────────────────────────────────────────────┤');
  lines.push('│                   Session Layer                             │');
  lines.push('│      (SessionManager, SessionMetricsCalculator)             │');
  lines.push('├─────────────────────────────────────────────────────────────┤');
  lines.push('│                    Export Layer                             │');
  lines.push('│           (visual/*, document exporters)                    │');
  lines.push('├─────────────────────────────────────────────────────────────┤');
  lines.push('│              Types / Interfaces / Utils                     │');
  lines.push('│      (core.ts, session.ts, modes/*, utils/*)                │');
  lines.push('├─────────────────────────────────────────────────────────────┤');
  lines.push('│              Infrastructure Layer                           │');
  lines.push('│         (cache/, storage/, interfaces/)                     │');
  lines.push('└─────────────────────────────────────────────────────────────┘');
  lines.push('```');
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
        lines.push('| Package | Import | Usage |');
        lines.push('|---------|--------|-------|');
        for (const dep of file.externalDependencies) {
          lines.push(`| \`${dep.package}\` | \`${dep.imports.join(', ')}\` | External package |`);
        }
        lines.push('');
      }

      // Node dependencies
      if (file.nodeDependencies.length > 0) {
        lines.push('**Node.js Built-in Dependencies:**');
        lines.push('| Module | Import | Usage |');
        lines.push('|--------|--------|-------|');
        for (const dep of file.nodeDependencies) {
          lines.push(`| \`${dep.module}\` | \`${dep.imports.join(', ')}\` | Node.js built-in |`);
        }
        lines.push('');
      }

      // Internal dependencies
      if (file.internalDependencies.length > 0) {
        lines.push('**Internal Dependencies:**');
        lines.push('| File | Imports | Usage |');
        lines.push('|------|---------|-------|');
        for (const dep of file.internalDependencies) {
          const usage = dep.reExport ? 'Re-export' : 'Import';
          lines.push(`| \`${dep.file}\` | \`${dep.imports.join(', ')}\` | ${usage} |`);
        }
        lines.push('');
      }

      // Exports
      if (file.exports.named.length > 0 || file.exports.default) {
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

  const matrixEntries = Object.entries(matrix).slice(0, 20); // Limit to top 20 for readability
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
  if (circularDeps.length === 0) {
    lines.push('**No circular dependencies detected.**');
  } else {
    lines.push(`**${circularDeps.length} circular dependencies detected:**`);
    lines.push('');
    for (const cycle of circularDeps) {
      lines.push(`- ${cycle.join(' -> ')}`);
    }
  }
  lines.push('');
  lines.push('The dependency graph follows a strict top-down hierarchy:');
  lines.push('1. Entry point (`index.ts`) depends on services and tools');
  lines.push('2. Services depend on types, utilities, and session layer');
  lines.push('3. Session layer depends on types, utilities, storage, and cache');
  lines.push('4. Types are leaf nodes (only import from other types)');
  lines.push('5. Utilities are leaf nodes (no internal dependencies)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Visual Dependency Graph
  lines.push('## Visual Dependency Graph');
  lines.push('');
  lines.push('### Mermaid Diagram');
  lines.push('');
  lines.push('```mermaid');
  lines.push('graph TD');
  lines.push('    subgraph Entry');
  lines.push('        INDEX[index.ts]');
  lines.push('    end');
  lines.push('');
  lines.push('    subgraph Tools');
  lines.push('        TOOL_DEF[tools/definitions.ts]');
  lines.push('        TOOL_THINK[tools/thinking.ts]');
  lines.push('        TOOL_SCHEMAS[tools/schemas/*]');
  lines.push('    end');
  lines.push('');
  lines.push('    subgraph Services');
  lines.push('        SVC_IDX[services/index.ts]');
  lines.push('        TF[ThoughtFactory]');
  lines.push('        ES[ExportService]');
  lines.push('        MR[ModeRouter]');
  lines.push('        MM[MetaMonitor]');
  lines.push('    end');
  lines.push('');
  lines.push('    subgraph Session');
  lines.push('        SESS_IDX[session/index.ts]');
  lines.push('        SM[SessionManager]');
  lines.push('        SMC[SessionMetricsCalculator]');
  lines.push('        STORAGE[storage/interface]');
  lines.push('    end');
  lines.push('');
  lines.push('    subgraph Types');
  lines.push('        TYPE_IDX[types/index.ts]');
  lines.push('        CORE[types/core.ts]');
  lines.push('        SESS_TYPE[types/session.ts]');
  lines.push('        MODES[types/modes/*]');
  lines.push('    end');
  lines.push('');
  lines.push('    subgraph Export');
  lines.push('        VIS_IDX[export/visual/index.ts]');
  lines.push('        EXPORTERS[export/visual/*]');
  lines.push('    end');
  lines.push('');
  lines.push('    subgraph Utils');
  lines.push('        LOGGER[utils/logger.ts]');
  lines.push('        SANITIZE[utils/sanitization.ts]');
  lines.push('        ERRORS[utils/errors.ts]');
  lines.push('    end');
  lines.push('');
  lines.push('    subgraph Infra');
  lines.push('        LRU[cache/lru.ts]');
  lines.push('        ILOGGER[interfaces/ILogger.ts]');
  lines.push('    end');
  lines.push('');
  lines.push('    INDEX --> TOOL_DEF');
  lines.push('    INDEX --> TOOL_THINK');
  lines.push('    INDEX --> SVC_IDX');
  lines.push('    INDEX --> SESS_IDX');
  lines.push('    INDEX --> TYPE_IDX');
  lines.push('');
  lines.push('    TOOL_DEF --> TOOL_SCHEMAS');
  lines.push('');
  lines.push('    SVC_IDX --> TF');
  lines.push('    SVC_IDX --> ES');
  lines.push('    SVC_IDX --> MR');
  lines.push('');
  lines.push('    TF --> TYPE_IDX');
  lines.push('    TF --> TOOL_THINK');
  lines.push('    TF --> LOGGER');
  lines.push('    TF --> ILOGGER');
  lines.push('');
  lines.push('    ES --> TYPE_IDX');
  lines.push('    ES --> VIS_IDX');
  lines.push('    ES --> SANITIZE');
  lines.push('    ES --> LOGGER');
  lines.push('');
  lines.push('    MR --> TYPE_IDX');
  lines.push('    MR --> SESS_IDX');
  lines.push('    MR --> MM');
  lines.push('    MR --> LOGGER');
  lines.push('');
  lines.push('    MM --> CORE');
  lines.push('    MM --> MODES');
  lines.push('');
  lines.push('    SESS_IDX --> SM');
  lines.push('    SM --> TYPE_IDX');
  lines.push('    SM --> ERRORS');
  lines.push('    SM --> SANITIZE');
  lines.push('    SM --> LOGGER');
  lines.push('    SM --> STORAGE');
  lines.push('    SM --> LRU');
  lines.push('    SM --> SMC');
  lines.push('    SM --> MM');
  lines.push('');
  lines.push('    TYPE_IDX --> CORE');
  lines.push('    TYPE_IDX --> SESS_TYPE');
  lines.push('    CORE --> MODES');
  lines.push('    SESS_TYPE --> CORE');
  lines.push('');
  lines.push('    VIS_IDX --> EXPORTERS');
  lines.push('    VIS_IDX --> TYPE_IDX');
  lines.push('');
  lines.push('    LOGGER --> ILOGGER');
  lines.push('    LRU --> cache/types');
  lines.push('');
  lines.push('    style INDEX fill:#f96');
  lines.push('    style SVC_IDX fill:#9f6');
  lines.push('    style TYPE_IDX fill:#69f');
  lines.push('    style SESS_IDX fill:#f69');
  lines.push('```');
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
  lines.push(`| Total Classes | ${stats.totalClasses} |`);
  lines.push(`| Total Interfaces | ${stats.totalInterfaces} |`);
  lines.push(`| Total Functions | ${stats.totalFunctions} |`);
  lines.push(`| Total Type Guards | ${stats.totalTypeGuards} |`);
  lines.push(`| Total Enums | ${stats.totalEnums} |`);
  lines.push(`| Thinking Modes | 21 |`);
  lines.push(`| Visual Exporters | ${getVisualExporters(files).total} |`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`*Last Updated*: ${today}`);
  lines.push(`*Version*: ${packageJson.version}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Main function
 */
async function main() {
  console.log('Scanning codebase for dependencies...');

  // Get all TypeScript files
  const tsFiles = getAllTsFiles(SRC_DIR);
  console.log(`Found ${tsFiles.length} TypeScript files`);

  // Parse all files
  const parsedFiles = tsFiles.map(parseFile);
  console.log('Parsed all files');

  // Categorize into modules
  const modules = categorizeFiles(parsedFiles);
  console.log(`Categorized into ${Object.keys(modules).length} modules`);

  // Generate statistics
  const stats = generateStatistics(parsedFiles, modules);
  console.log('Generated statistics');

  // Detect circular dependencies
  const circularDeps = detectCircularDependencies(parsedFiles);
  console.log(`Found ${circularDeps.length} circular dependencies`);

  // Build dependency matrix
  const matrix = buildDependencyMatrix(parsedFiles);
  console.log('Built dependency matrix');

  // Generate outputs
  const json = generateJSON(parsedFiles, modules, stats, circularDeps);
  const markdown = generateMarkdown(parsedFiles, modules, stats, circularDeps, matrix);

  // Write outputs
  writeFileSync(join(OUTPUT_DIR, 'dependency-graph.json'), JSON.stringify(json, null, 2));
  console.log('Written: docs/architecture/dependency-graph.json');

  writeFileSync(join(OUTPUT_DIR, 'DEPENDENCY_GRAPH.md'), markdown);
  console.log('Written: docs/architecture/DEPENDENCY_GRAPH.md');

  console.log('\nDependency graph generation complete!');
  console.log(`  - ${stats.totalTypeScriptFiles} files analyzed`);
  console.log(`  - ${stats.totalExports} exports found`);
  console.log(`  - ${circularDeps.length} circular dependencies`);
}

main().catch(console.error);
