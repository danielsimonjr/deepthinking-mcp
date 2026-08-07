/**
 * Machine-readable outputs: the full JSON graph and the compact LLM summary.
 */
import { packageJson } from '../config.js';
import { resolvePath } from '../paths.js';
import type {
  CircularDependencyResult,
  ModuleMap,
  ParsedFile,
  Statistics,
} from '../types.js';

/**
 * Generate JSON output
 */
export function generateJSON(files: ParsedFile[], modules: ModuleMap, stats: Statistics, circularDeps: CircularDependencyResult): object {
  const today = new Date().toISOString().split('T')[0];

  // Convert modules to JSON-friendly format
  const modulesJson: Record<string, Record<string, object>> = {};
  for (const [category, categoryFiles] of Object.entries(modules)) {
    modulesJson[category] = {};
    for (const [path, file] of Object.entries(categoryFiles)) {
      const fileData: Record<string, unknown> = {
        description: file.description || `${file.name} module`,
        externalDependencies: file.externalDependencies,
        nodeDependencies: file.nodeDependencies,
        internalDependencies: file.internalDependencies.map(d => ({
          file: d.file,
          imports: d.imports,
          ...(d.reExport ? { reExport: true } : {}),
          ...(d.typeOnly ? { typeOnly: true } : {})
        })),
        exports: file.exports.named,
        reExported: file.exports.reExported.length > 0 ? file.exports.reExported : undefined,
        classes: file.exports.classes.length > 0 ? file.exports.classes : undefined,
        interfaces: file.exports.interfaces.length > 0 ? file.exports.interfaces : undefined,
        functions: file.exports.functions.length > 0 ? file.exports.functions : undefined,
        enums: file.exports.enums.length > 0 ? file.exports.enums : undefined,
        constants: file.exports.constants.length > 0 ? file.exports.constants : undefined
      };

      // Clean up undefined values
      Object.keys(fileData).forEach(key => {
        if (fileData[key] === undefined) {
          delete fileData[key];
        }
      });

      modulesJson[category][path] = fileData;
    }
  }

  // Build layers from modules
  const layers = Object.keys(modules).map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    files: Object.keys(modules[name])
  })).filter(l => l.files.length > 0);

  return {
    metadata: {
      name: packageJson.name,
      version: packageJson.version,
      lastUpdated: today,
      totalFiles: stats.totalTypeScriptFiles,
      totalModules: stats.totalModules,
      totalExports: stats.totalExports
    },
    entryPoints: files
      .filter(f => f.path === 'src/index.ts')
      .map(f => ({
        file: f.path,
        type: 'main',
        description: f.description || 'Entry Point'
      })),
    modules: modulesJson,
    dependencyGraph: {
      circularDependencies: {
        runtime: circularDeps.runtime,
        typeOnly: circularDeps.typeOnly,
        total: circularDeps.all.length,
        runtimeCount: circularDeps.runtime.length,
        typeOnlyCount: circularDeps.typeOnly.length
      },
      layers
    },
    statistics: stats
  };
}

/**
 * Generate compact summary for LLM consumption (~10KB target)
 * Uses CTON-style compression: no whitespace, abbreviated keys
 */
export function generateCompactSummary(files: ParsedFile[], modules: ModuleMap, stats: Statistics, circularDeps: CircularDependencyResult): string {
  // Abbreviate module names and create compact structure
  const summary = {
    m: { // metadata
      n: packageJson.name,
      v: packageJson.version,
      d: new Date().toISOString().split('T')[0],
      f: stats.totalTypeScriptFiles,
      e: stats.totalExports,
      re: stats.totalReExports
    },
    s: { // statistics
      loc: stats.totalLinesOfCode,
      cls: stats.totalClasses,
      int: stats.totalInterfaces,
      fn: stats.totalFunctions,
      tg: stats.totalTypeGuards,
      en: stats.totalEnums,
      co: stats.totalConstants,
      toi: stats.totalTypeOnlyImports
    },
    c: { // circular deps
      rt: circularDeps.runtime.length,
      to: circularDeps.typeOnly.length,
      // Only include first 5 runtime cycles (if any) for context
      rtp: circularDeps.runtime.slice(0, 5).map(c => c.map(p => p.split('/').pop()?.replace('.ts', '')).join('→'))
    },
    mod: {} as Record<string, { f: number; exp: string[]; cls?: string[]; int?: string[] }>,
    // Hot paths: files with most dependencies
    hp: [] as { p: string; i: number; o: number }[]
  };

  // Compact module summary
  for (const [modName, modFiles] of Object.entries(modules)) {
    const fileList = Object.values(modFiles);
    const exports = fileList.flatMap(f => f.exports.named).slice(0, 20);
    const classes = fileList.flatMap(f => f.exports.classes);
    const interfaces = fileList.flatMap(f => f.exports.interfaces).slice(0, 10);

    summary.mod[modName] = {
      f: Object.keys(modFiles).length,
      exp: [...new Set(exports)]
    };
    if (classes.length > 0) summary.mod[modName].cls = [...new Set(classes)];
    if (interfaces.length > 0) summary.mod[modName].int = [...new Set(interfaces)];
  }

  // Find hot paths (files with highest connectivity)
  const connectivity = files.map(f => ({
    p: f.path.split('/').slice(-2).join('/'),
    i: f.internalDependencies.length,
    o: files.filter(other =>
      other.internalDependencies.some(d => {
        const resolved = resolvePath(other.path, d.file);
        return resolved === f.path;
      })
    ).length
  })).sort((a, b) => (b.i + b.o) - (a.i + a.o));

  summary.hp = connectivity.slice(0, 15);

  // Output as minified JSON (CTON-style: no whitespace)
  return JSON.stringify(summary);
}
