/**
 * Derives the graph from parsed files: module grouping, the import matrix,
 * circular-dependency detection, unused-code detection, and summary statistics.
 *
 * Reads no source text -- it operates only on what the scanner produced.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { ROOT_DIR } from './config.js';
import { resolvePath } from './paths.js';
import type {
  CircularDependencyResult,
  DependencyMatrix,
  ModuleMap,
  ParsedFile,
  Statistics,
  UnusedAnalysis,
  UnusedExport,
} from './types.js';

/**
 * Dynamically discover and categorize files into modules based on directory structure
 */
export function categorizeFiles(files: ParsedFile[]): ModuleMap {
  const modules: ModuleMap = {};

  for (const file of files) {
    const relativePath = file.path;

    // Handle entry point (src/index.ts)
    if (relativePath === 'src/index.ts') {
      if (!modules.entry) modules.entry = {};
      modules.entry[relativePath] = file;
      continue;
    }

    // Extract the module name from path (first directory after src/)
    const parts = relativePath.split('/');
    if (parts.length >= 2 && parts[0] === 'src') {
      const moduleName = parts[1].replace('.ts', '');

      // If it's a file directly in src/, categorize by filename
      if (parts.length === 2) {
        if (!modules.root) modules.root = {};
        modules.root[relativePath] = file;
      } else {
        // It's in a subdirectory
        if (!modules[moduleName]) modules[moduleName] = {};
        modules[moduleName][relativePath] = file;
      }
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
export function buildDependencyMatrix(files: ParsedFile[]): DependencyMatrix {
  const matrix: DependencyMatrix = {};

  for (const file of files) {
    const importedFrom = new Set<string>();
    const exportsTo = new Set<string>();

    // Find what this file imports from
    for (const dep of file.internalDependencies) {
      importedFrom.add(dep.file);
    }

    // Find what files export to this file
    for (const other of files) {
      if (other.path === file.path) continue;
      for (const dep of other.internalDependencies) {
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
 * Detect circular dependencies, distinguishing runtime from type-only cycles
 */
export function detectCircularDependencies(files: ParsedFile[]): CircularDependencyResult {
  const filePaths = new Set(files.map(f => f.path));

  // Build both runtime-only and all-dependencies graphs
  const runtimeGraph = new Map<string, string[]>();
  const allGraph = new Map<string, string[]>();

  for (const file of files) {
    const runtimeDeps: string[] = [];
    const allDeps: string[] = [];

    for (const d of file.internalDependencies) {
      const resolved = resolvePath(file.path, d.file);
      if (filePaths.has(resolved)) {
        allDeps.push(resolved);
        // Only add to runtime graph if NOT type-only
        if (!d.typeOnly) {
          runtimeDeps.push(resolved);
        }
      }
    }
    runtimeGraph.set(file.path, runtimeDeps);
    allGraph.set(file.path, allDeps);
  }

  function findCycles(graph: Map<string, string[]>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const inStack = new Set<string>();

    function dfs(node: string, path: string[]): void {
      if (inStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart);
          cycle.push(node);
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

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }

  const allCycles = findCycles(allGraph);
  const runtimeCycles = findCycles(runtimeGraph);

  // Type-only cycles = cycles in all but not in runtime
  const runtimeCycleKeys = new Set(runtimeCycles.map(c => [...c].sort().join('->')));
  const typeOnlyCycles = allCycles.filter(c => !runtimeCycleKeys.has([...c].sort().join('->')));

  return {
    all: allCycles,
    runtime: runtimeCycles,
    typeOnly: typeOnlyCycles
  };
}

/**
 * Detect unused files and exports
 */
export function detectUnused(files: ParsedFile[]): UnusedAnalysis {
  const filePaths = new Set(files.map(f => f.path));

  // Build a set of all imported files
  const importedFiles = new Set<string>();
  // Build a map of all imported symbols per file
  const importedSymbols = new Map<string, Set<string>>();

  for (const file of files) {
    for (const dep of file.internalDependencies) {
      const resolved = resolvePath(file.path, dep.file);
      if (filePaths.has(resolved)) {
        importedFiles.add(resolved);

        // Track which symbols are imported
        if (!importedSymbols.has(resolved)) {
          importedSymbols.set(resolved, new Set());
        }
        const symbols = importedSymbols.get(resolved)!;
        for (const imp of dep.imports) {
          if (imp === '*') {
            // Wildcard import - mark all exports as used
            symbols.add('*');
          } else {
            symbols.add(imp.replace(/^\* as /, ''));
          }
        }
      }
    }
  }

  // Find unused files (excluding entry point and index files which are re-export hubs)
  const unusedFiles: string[] = [];
  for (const file of files) {
    if (file.path === 'src/index.ts') continue; // Entry point is always "used"
    if (file.name === 'index' && file.exports.reExported.length > 0) continue; // Re-export hubs
    if (!importedFiles.has(file.path)) {
      unusedFiles.push(file.path);
    }
  }

  // Find unused exports
  const unusedExports: UnusedExport[] = [];
  for (const file of files) {
    const usedSymbols = importedSymbols.get(file.path);
    const isWildcardImported = usedSymbols?.has('*');

    // Skip if file is not imported at all (already reported as unused file)
    // or if it's wildcard imported (all exports considered used)
    if (!usedSymbols || isWildcardImported) continue;

    // Check each export
    for (const fn of file.exports.functions) {
      if (!usedSymbols.has(fn)) {
        unusedExports.push({ file: file.path, name: fn, type: 'function' });
      }
    }
    for (const cls of file.exports.classes) {
      if (!usedSymbols.has(cls)) {
        unusedExports.push({ file: file.path, name: cls, type: 'class' });
      }
    }
    for (const iface of file.exports.interfaces) {
      if (!usedSymbols.has(iface)) {
        unusedExports.push({ file: file.path, name: iface, type: 'interface' });
      }
    }
    for (const type of file.exports.types) {
      if (!usedSymbols.has(type) && !file.exports.interfaces.includes(type)) {
        unusedExports.push({ file: file.path, name: type, type: 'type' });
      }
    }
    for (const en of file.exports.enums) {
      if (!usedSymbols.has(en)) {
        unusedExports.push({ file: file.path, name: en, type: 'enum' });
      }
    }
    for (const constant of file.exports.constants) {
      if (!usedSymbols.has(constant)) {
        unusedExports.push({ file: file.path, name: constant, type: 'constant' });
      }
    }
  }

  return { unusedFiles, unusedExports };
}

/**
 * Generate statistics from parsed files
 */
export function generateStatistics(files: ParsedFile[], modules: ModuleMap, circularDeps: CircularDependencyResult, unusedAnalysis: UnusedAnalysis): Statistics {
  let totalExports = 0;
  let totalClasses = 0;
  let totalInterfaces = 0;
  let totalFunctions = 0;
  let totalTypeGuards = 0;
  let totalEnums = 0;
  let totalConstants = 0;
  let totalLines = 0;
  let totalReExports = 0;
  let totalTypeOnlyImports = 0;

  for (const file of files) {
    totalExports += file.exports.named.length;
    totalClasses += file.exports.classes.length;
    totalInterfaces += file.exports.interfaces.length;
    totalFunctions += file.exports.functions.length;
    totalEnums += file.exports.enums.length;
    totalConstants += file.exports.constants.length;
    totalReExports += file.exports.reExported.length;

    // Count type-only imports
    totalTypeOnlyImports += file.internalDependencies.filter(d => d.typeOnly).length;

    // Count type guards (functions starting with 'is')
    totalTypeGuards += file.exports.functions.filter(f => f.startsWith('is')).length;

    // Count lines
    try {
      const content = readFileSync(join(ROOT_DIR, file.path), 'utf-8');
      totalLines += content.split('\n').length;
    } catch {
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
    totalConstants,
    totalReExports,
    totalTypeOnlyImports,
    runtimeCircularDeps: circularDeps.runtime.length,
    typeOnlyCircularDeps: circularDeps.typeOnly.length,
    unusedFilesCount: unusedAnalysis.unusedFiles.length,
    unusedExportsCount: unusedAnalysis.unusedExports.length
  };
}
