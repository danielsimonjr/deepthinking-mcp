/**
 * Shared shapes for the dependency-graph generator.
 *
 * Pure type declarations only -- this module is the graph's leaf, so every
 * other module may import it without creating a cycle.
 */

// Types
export interface Dependency {
  file: string;
  imports: string[];
  reExport?: boolean;
  typeOnly?: boolean;  // Track type-only imports
}

export interface ExternalDependency {
  package: string;
  imports: string[];
}

export interface NodeDependency {
  module: string;
  imports: string[];
}

export interface FileExports {
  named: string[];
  default: string | null;
  types: string[];
  interfaces: string[];
  enums: string[];
  classes: string[];
  functions: string[];
  constants: string[];
  reExported: string[];  // Track re-exported symbols
}

export interface ParsedFile {
  path: string;
  name: string;
  externalDependencies: ExternalDependency[];
  nodeDependencies: NodeDependency[];
  internalDependencies: Dependency[];
  exports: FileExports;
  description: string | null;
}

export interface DependencyMatrix {
  [path: string]: {
    importsFrom: string[];
    exportsTo: string[];
  };
}

export interface Statistics {
  totalTypeScriptFiles: number;
  totalModules: number;
  totalLinesOfCode: number;
  totalExports: number;
  totalClasses: number;
  totalInterfaces: number;
  totalFunctions: number;
  totalTypeGuards: number;
  totalEnums: number;
  totalConstants: number;
  totalReExports: number;
  totalTypeOnlyImports: number;
  runtimeCircularDeps: number;  // Excludes type-only cycles
  typeOnlyCircularDeps: number; // Type-only cycles (not runtime issues)
  unusedFilesCount: number;
  unusedExportsCount: number;
}

export interface UnusedExport {
  file: string;
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'constant' | 'enum' | 'other';
}

export interface UnusedAnalysis {
  unusedFiles: string[];
  unusedExports: UnusedExport[];
}

export interface ModuleMap {
  [moduleName: string]: {
    [filePath: string]: ParsedFile;
  };
}

export interface PackageJson {
  name: string;
  version: string;
}

export interface CircularDependencyResult {
  all: string[][];
  runtime: string[][];   // Non-type-only cycles (real runtime issues)
  typeOnly: string[][];  // Type-only cycles (safe, no runtime impact)
}
