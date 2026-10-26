/**
 * Graph utilities shared by the d-separation and intervention analyzers.
 */

import type { CausalGraph } from "../types.js";

/**
 * Get all descendants of a node
 */
export function getDescendants(
  graph: CausalGraph,
  nodeId: string,
): Set<string> {
  const descendants = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const edge of graph.edges) {
      if (edge.from === current && !descendants.has(edge.to)) {
        descendants.add(edge.to);
        stack.push(edge.to);
      }
    }
  }

  return descendants;
}

/**
 * Get all ancestors of a node
 */
export function getAncestors(graph: CausalGraph, nodeId: string): Set<string> {
  const ancestors = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const edge of graph.edges) {
      if (edge.to === current && !ancestors.has(edge.from)) {
        ancestors.add(edge.from);
        stack.push(edge.from);
      }
    }
  }

  return ancestors;
}

/**
 * Generate the k-element subsets of an array, in input order
 */
export function* combinations(arr: string[], k: number): Generator<string[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = 0; i <= arr.length - k; i++) {
    for (const rest of combinations(arr.slice(i + 1), k - 1)) {
      yield [arr[i], ...rest];
    }
  }
}
