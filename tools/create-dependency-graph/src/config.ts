/**
 * Project-root resolution, output locations, and the generated-file banner.
 *
 * The root is derived from argv/cwd -- never from this file's own location --
 * so moving these sources between directories cannot change where the tool
 * reads or writes.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { PackageJson } from './types.js';

// Constants - support CLI argument or current working directory for portability
export function getProjectRoot(): string {
  // Check for CLI argument: --root=/path/to/project or first positional arg
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith('--root=')) {
      return arg.slice(7);
    }
    if (arg === '--help' || arg === '-h') {
      console.log(`
Dependency Graph Generator

Usage:
  create-dependency-graph [options] [project-root]

Options:
  --root=<path>   Project root directory (default: current directory)
  --help, -h      Show this help

Examples:
  create-dependency-graph                     # Use current directory
  create-dependency-graph ./my-project        # Specify project path
  create-dependency-graph --root=C:/projects/my-app
`);
      process.exit(0);
    }
    // First non-flag argument is the project root
    if (!arg.startsWith('-') && existsSync(arg)) {
      return arg;
    }
  }
  // Fallback to current working directory
  return process.cwd();
}

export const ROOT_DIR = getProjectRoot();

export const SRC_DIR = join(ROOT_DIR, 'src');

export const OUTPUT_DIR = join(ROOT_DIR, 'docs', 'architecture');

/**
 * Opt-out banner emitted at the top of every generated Markdown report.
 *
 * `docs/architecture/` is also checked by repo_map's drift gate, which fails any
 * doc that carries no `## Verification` section rather than skipping it silently.
 * These two reports are generated here, on a different methodology (this tool
 * censuses `src/` only; repo_map counts test imports too), so repo_map cannot
 * meaningfully verify their numbers -- their freshness is governed by re-running
 * `npm run docs:deps`, not by that gate.
 *
 * The marker MUST be emitted by the generator, not hand-added afterwards: it was
 * hand-added once and the next regeneration silently stripped it, which is what
 * made the gate fail. Never hand-edit a generated file.
 */
export const GENERATED_REPORT_BANNER = [
  '<!-- repo-map:no-verification -->',
  '<!-- GENERATED FILE -- do not edit by hand.',
  '     Regenerate with `npm run docs:deps`',
  '     (npx tsx tools/create-dependency-graph/create-dependency-graph.ts). -->',
  '',
].join('\n');

// Read package.json for version and name
export let packageJson: PackageJson = { name: 'unknown', version: '0.0.0' };
try {
  packageJson = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf-8')) as PackageJson;
} catch {
  console.warn('Warning: Could not read package.json, using defaults');
}
