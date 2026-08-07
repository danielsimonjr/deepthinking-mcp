/**
 * Relative-import resolution, shared by the analysis and reporting layers.
 *
 * Kept in its own leaf module deliberately: both layers need it, and having
 * the reporters reach into the analysis module for a path helper would put an
 * edge in the graph that the layering does not otherwise require.
 */
import { dirname, join } from 'path';

/**
 * Resolve relative path
 */
export function resolvePath(fromPath: string, relativePath: string): string {
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
