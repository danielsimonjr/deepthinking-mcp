/**
 * Source discovery and per-file parsing: the only layer that reads source text.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { basename, join, relative } from 'path';
import { ROOT_DIR } from './config.js';
import type { ParsedFile } from './types.js';

/**
 * Recursively get all TypeScript files in a directory
 */
export function getAllTsFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) {
    return files;
  }

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
export function parseFile(filePath: string): ParsedFile {
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = relative(ROOT_DIR, filePath).replace(/\\/g, '/');

  const result: ParsedFile = {
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
      constants: [],
      reExported: []
    },
    description: extractDescription(content)
  };

  // Parse imports - enhanced to detect type-only imports
  // Matches: import type { ... }, import { type X, Y }, import X from, import * as X from
  const importRegex = /import\s+(type\s+)?(?:(?:{([^}]+)}|(\w+)|\*\s+as\s+(\w+))(?:\s*,\s*(?:{([^}]+)}|(\w+)))?)\s+from\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  const nodeBuiltins = ['fs', 'path', 'url', 'crypto', 'util', 'stream', 'events', 'buffer', 'os', 'child_process', 'http', 'https', 'net', 'dns', 'tls', 'zlib', 'readline', 'assert', 'cluster', 'dgram', 'domain', 'inspector', 'module', 'perf_hooks', 'process', 'punycode', 'querystring', 'repl', 'string_decoder', 'timers', 'tty', 'v8', 'vm', 'worker_threads'];

  while ((match = importRegex.exec(content)) !== null) {
    const isTypeOnlyImport = !!match[1]; // "import type" prefix
    const namedImports = match[2] || match[5] || '';
    const defaultImport = match[3] || match[6] || '';
    const namespaceImport = match[4] || '';
    const source = match[7];

    const imports: string[] = [];
    let hasRuntimeImport = !isTypeOnlyImport;

    if (namedImports) {
      const importItems = namedImports.split(',').map(s => s.trim());
      for (const item of importItems) {
        // Check for inline type imports: import { type Foo, Bar }
        const isInlineType = item.startsWith('type ');
        const name = item.replace(/^type\s+/, '').split(' as ')[0].trim();
        if (name) {
          imports.push(name);
          // If any import is NOT a type, it's a runtime import
          if (!isInlineType && !isTypeOnlyImport) {
            hasRuntimeImport = true;
          }
        }
      }
    }
    if (defaultImport) imports.push(defaultImport);
    if (namespaceImport) imports.push(`* as ${namespaceImport}`);

    const typeOnly = isTypeOnlyImport || !hasRuntimeImport;

    if (source.startsWith('.')) {
      result.internalDependencies.push({
        file: source,
        imports: imports,
        typeOnly: typeOnly
      });
    } else if (source.startsWith('node:') || nodeBuiltins.includes(source.split('/')[0])) {
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
    result.exports.reExported.push(`* from ${match[1]}`);
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
    result.exports.reExported.push(...exports);
  }

  // Re-exports: export type * from (type-only re-exports)
  const reExportTypeAllRegex = /export\s+type\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = reExportTypeAllRegex.exec(content)) !== null) {
    result.internalDependencies.push({
      file: match[1],
      imports: ['*'],
      reExport: true,
      typeOnly: true
    });
    result.exports.reExported.push(`type * from ${match[1]}`);
  }

  // Dedupe exports
  result.exports.named = [...new Set(result.exports.named)];
  result.exports.types = [...new Set(result.exports.types)];
  result.exports.reExported = [...new Set(result.exports.reExported)];

  return result;
}

/**
 * Extract file description from comments
 */
export function extractDescription(content: string): string | null {
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
