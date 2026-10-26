/**
 * Graph utilities shared by the d-separation and intervention analyzers.
 */

import type { CausalGraph } from "../types.js";

/**
 * Collect every node that a walk from `nodeId` reaches. The walk leaves a node by each edge whose
 * `near` end is that node, and arrives at the `far` end of the edge. The set lists the nodes in
 * the order of the walk.
 */
function collectReachable(
  graph: CausalGraph,
  nodeId: string,
  near: "from" | "to",
  far: "from" | "to",
): Set<string> {
  const reached = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const edge of graph.edges) {
      if (edge[near] === current && !reached.has(edge[far])) {
        reached.add(edge[far]);
        stack.push(edge[far]);
      }
    }
  }

  return reached;
}

/**
 * Get all descendants of a node
 */
export function getDescendants(
  graph: CausalGraph,
  nodeId: string,
): Set<string> {
  return collectReachable(graph, nodeId, "from", "to");
}

/**
 * Get all ancestors of a node
 */
export function getAncestors(graph: CausalGraph, nodeId: string): Set<string> {
  return collectReachable(graph, nodeId, "to", "from");
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
