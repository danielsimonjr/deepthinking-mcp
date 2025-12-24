/**
 * D-Separation Analyzer - Phase 12 Sprint 6
 *
 * Implements d-separation analysis for causal graphs:
 * - Path finding between variables
 * - Collider (v-structure) detection
 * - Blocking path analysis
 * - Minimal separator finding
 */

import type {
  CausalGraph,
  GraphEdge,
  Path,
  PathEdge,
  DSeparationResult,
  DSeparationRequest,
  DSeparationConfig,
  VStructure,
} from '../types.js';

// ============================================================================
// GRAPH UTILITIES
// ============================================================================

/**
 * Build bidirectional adjacency map from graph
 */
function buildBidirectionalAdjacency(
  graph: CausalGraph
): Map<string, Array<{ neighbor: string; edge: GraphEdge; direction: 'forward' | 'backward' }>> {
  const adj = new Map<string, Array<{ neighbor: string; edge: GraphEdge; direction: 'forward' | 'backward' }>>();

  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of graph.edges) {
    // Forward direction
    adj.get(edge.from)?.push({ neighbor: edge.to, edge, direction: 'forward' });

    // Backward direction (for path finding, not causality)
    adj.get(edge.to)?.push({ neighbor: edge.from, edge, direction: 'backward' });
  }

  return adj;
}

/**
 * Get parents of a node (incoming directed edges)
 */
function getParents(graph: CausalGraph, nodeId: string): string[] {
  return graph.edges
    .filter((e) => e.to === nodeId && e.type !== 'bidirected')
    .map((e) => e.from);
}

/**
 * Get all descendants of a node
 */
function getDescendants(graph: CausalGraph, nodeId: string): Set<string> {
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

// ============================================================================
// V-STRUCTURE (COLLIDER) DETECTION
// ============================================================================

/**
 * Find all v-structures (colliders) in the graph
 */
export function findVStructures(graph: CausalGraph): VStructure[] {
  const vStructures: VStructure[] = [];

  for (const node of graph.nodes) {
    const parents = getParents(graph, node.id);

    // A collider needs at least 2 parents
    if (parents.length >= 2) {
      // Check each pair of parents
      for (let i = 0; i < parents.length; i++) {
        for (let j = i + 1; j < parents.length; j++) {
          // Check if parents are not directly connected
          const connected = graph.edges.some(
            (e) =>
              (e.from === parents[i] && e.to === parents[j]) ||
              (e.from === parents[j] && e.to === parents[i])
          );

          if (!connected) {
            vStructures.push({
              parent1: parents[i],
              collider: node.id,
              parent2: parents[j],
              activatedWhenConditioned: true,
            });
          }
        }
      }
    }
  }

  return vStructures;
}

/**
 * Check if a node is a collider on a specific path
 */
function isColliderOnPath(pathEdges: PathEdge[], nodeIndex: number): boolean {
  if (nodeIndex <= 0 || nodeIndex >= pathEdges.length) {
    return false;
  }

  // A node is a collider if both adjacent edges point INTO it
  const incomingEdge = pathEdges[nodeIndex - 1];
  const outgoingEdge = pathEdges[nodeIndex];

  // Check if both edges point to this node (the node is at the "head" of both arrows)
  return incomingEdge.direction === 'forward' && outgoingEdge.direction === 'backward';
}

// ============================================================================
// PATH FINDING
// ============================================================================

/**
 * Find all paths between two sets of nodes
 */
export function findAllPaths(
  graph: CausalGraph,
  sourceNodes: string[],
  targetNodes: string[],
  maxLength = 10
): Path[] {
  const adj = buildBidirectionalAdjacency(graph);
  const targetSet = new Set(targetNodes);
  const allPaths: Path[] = [];

  function dfs(
    current: string,
    visited: Set<string>,
    pathNodes: string[],
    pathEdges: PathEdge[]
  ): void {
    if (pathNodes.length > maxLength) return;

    if (targetSet.has(current) && pathNodes.length > 1) {
      allPaths.push({
        nodes: [...pathNodes],
        edges: [...pathEdges],
        length: pathNodes.length - 1,
      });
      return; // Don't continue past target
    }

    for (const { neighbor, edge, direction } of adj.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        pathNodes.push(neighbor);
        pathEdges.push({
          from: direction === 'forward' ? edge.from : edge.to,
          to: direction === 'forward' ? edge.to : edge.from,
          direction,
          edgeType: edge.type || 'directed',
        });

        dfs(neighbor, visited, pathNodes, pathEdges);

        pathNodes.pop();
        pathEdges.pop();
        visited.delete(neighbor);
      }
    }
  }

  for (const source of sourceNodes) {
    const visited = new Set<string>([source]);
    dfs(source, visited, [source], []);
  }

  return allPaths;
}

// ============================================================================
// D-SEPARATION ANALYSIS
// ============================================================================

/**
 * Check if a path is blocked by a conditioning set
 */
export function isPathBlocked(
  graph: CausalGraph,
  path: Path,
  conditioningSet: Set<string>
): { blocked: boolean; reason: string } {
  const nodes = path.nodes;
  const edges = path.edges;

  if (nodes.length < 3) {
    // Path with only 2 nodes is blocked if either is conditioned
    if (conditioningSet.has(nodes[0]) || conditioningSet.has(nodes[nodes.length - 1])) {
      return { blocked: true, reason: 'Source or target is conditioned' };
    }
    return { blocked: false, reason: '' };
  }

  // Check each intermediate node
  for (let i = 1; i < nodes.length - 1; i++) {
    const node = nodes[i];
    const isCollider = isColliderOnPath(edges, i);

    if (isCollider) {
      // For a collider: path is blocked unless collider or descendant is conditioned
      const descendants = getDescendants(graph, node);
      const colliderOrDescendantConditioned =
        conditioningSet.has(node) ||
        Array.from(descendants).some((d) => conditioningSet.has(d));

      if (!colliderOrDescendantConditioned) {
        return { blocked: true, reason: `Collider ${node} not conditioned` };
      }
    } else {
      // For a non-collider (chain or fork): path is blocked if node is conditioned
      if (conditioningSet.has(node)) {
        return { blocked: true, reason: `Non-collider ${node} is conditioned` };
      }
    }
  }

  return { blocked: false, reason: '' };
}

/**
 * Check d-separation between X and Y given Z
 */
export function checkDSeparation(
  graph: CausalGraph,
  request: DSeparationRequest,
  config: DSeparationConfig = {}
): DSeparationResult {
  const maxPathLength = config.maxPathLength ?? 10;
  const conditioningSet = new Set(request.z);

  // Find all paths between X and Y
  const allPaths = findAllPaths(graph, request.x, request.y, maxPathLength);

  const blockingPaths: Path[] = [];
  const openPaths: Path[] = [];

  for (const path of allPaths) {
    const { blocked, reason } = isPathBlocked(graph, path, conditioningSet);
    if (blocked) {
      path.isBlocked = true;
      path.blockingReason = reason;
      blockingPaths.push(path);
    } else {
      path.isBlocked = false;
      openPaths.push(path);
    }
  }

  const separated = openPaths.length === 0;

  let explanation: string;
  if (separated) {
    if (allPaths.length === 0) {
      explanation = `No paths exist between {${request.x.join(', ')}} and {${request.y.join(', ')}}`;
    } else {
      explanation = `All ${allPaths.length} path(s) are blocked by conditioning on {${request.z.join(', ')}}`;
    }
  } else {
    explanation = `${openPaths.length} of ${allPaths.length} path(s) remain open after conditioning on {${request.z.join(', ')}}`;
  }

  return {
    separated,
    blockingPaths: config.includePathDetails ? blockingPaths : [],
    openPaths: config.includePathDetails ? openPaths : [],
    conditioningSet: request.z,
    explanation,
  };
}

// ============================================================================
// MINIMAL SEPARATOR FINDING
// ============================================================================

/**
 * Find a minimal set that d-separates X from Y
 */
export function findMinimalSeparator(
  graph: CausalGraph,
  x: string[],
  y: string[],
  maxSetSize = 5
): string[] | null {
  const nodeIds = graph.nodes
    .map((n) => n.id)
    .filter((id) => !x.includes(id) && !y.includes(id));

  // Try increasingly larger sets
  for (let size = 0; size <= Math.min(maxSetSize, nodeIds.length); size++) {
    const result = findSeparatorOfSize(graph, x, y, nodeIds, size);
    if (result !== null) {
      return result;
    }
  }

  return null;
}

/**
 * Find a separator of a specific size using backtracking
 */
function findSeparatorOfSize(
  graph: CausalGraph,
  x: string[],
  y: string[],
  candidates: string[],
  size: number
): string[] | null {
  if (size === 0) {
    const result = checkDSeparation(graph, { x, y, z: [] });
    return result.separated ? [] : null;
  }

  function* combinations(arr: string[], k: number): Generator<string[]> {
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

  for (const subset of combinations(candidates, size)) {
    const result = checkDSeparation(graph, { x, y, z: subset });
    if (result.separated) {
      return subset;
    }
  }

  return null;
}

// ============================================================================
// ADJUSTMENT SET ANALYSIS
// ============================================================================

/**
 * Check if a set is a valid backdoor adjustment set
 */
export function isValidBackdoorAdjustment(
  graph: CausalGraph,
  treatment: string,
  outcome: string,
  adjustmentSet: string[]
): boolean {
  // 1. No node in Z is a descendant of treatment
  const treatmentDescendants = getDescendants(graph, treatment);
  for (const z of adjustmentSet) {
    if (treatmentDescendants.has(z)) {
      return false;
    }
  }

  // 2. Z blocks all backdoor paths from treatment to outcome
  // (paths that start with an arrow into treatment)
  const backdoorPaths = findBackdoorPaths(graph, treatment, outcome);
  const conditioningSet = new Set(adjustmentSet);

  for (const path of backdoorPaths) {
    const { blocked } = isPathBlocked(graph, path, conditioningSet);
    if (!blocked) {
      return false;
    }
  }

  return true;
}

/**
 * Find all backdoor paths from treatment to outcome
 */
function findBackdoorPaths(
  graph: CausalGraph,
  treatment: string,
  outcome: string,
  maxLength = 10
): Path[] {
  const adj = buildBidirectionalAdjacency(graph);
  const paths: Path[] = [];

  function dfs(
    current: string,
    visited: Set<string>,
    pathNodes: string[],
    pathEdges: PathEdge[],
    _startedBackward: boolean
  ): void {
    if (pathNodes.length > maxLength) return;

    if (current === outcome && pathNodes.length > 1) {
      paths.push({
        nodes: [...pathNodes],
        edges: [...pathEdges],
        length: pathNodes.length - 1,
      });
      return;
    }

    for (const { neighbor, edge, direction } of adj.get(current) || []) {
      if (!visited.has(neighbor)) {
        // For backdoor paths, first step must be backward (into treatment)
        if (pathNodes.length === 1 && direction !== 'backward') {
          continue;
        }

        visited.add(neighbor);
        pathNodes.push(neighbor);
        pathEdges.push({
          from: direction === 'forward' ? edge.from : edge.to,
          to: direction === 'forward' ? edge.to : edge.from,
          direction,
          edgeType: edge.type || 'directed',
        });

        dfs(neighbor, visited, pathNodes, pathEdges, true);

        pathNodes.pop();
        pathEdges.pop();
        visited.delete(neighbor);
      }
    }
  }

  const visited = new Set<string>([treatment]);
  dfs(treatment, visited, [treatment], [], false);

  return paths;
}

/**
 * Find a valid backdoor adjustment set
 */
export function findBackdoorAdjustmentSet(
  graph: CausalGraph,
  treatment: string,
  outcome: string
): string[] | null {
  // Get candidates: non-descendants of treatment, not treatment or outcome
  const treatmentDescendants = getDescendants(graph, treatment);
  const candidates = graph.nodes
    .map((n) => n.id)
    .filter((id) => id !== treatment && id !== outcome && !treatmentDescendants.has(id));

  // Try to find minimal set
  for (let size = 0; size <= candidates.length; size++) {
    const result = findBackdoorSetOfSize(graph, treatment, outcome, candidates, size);
    if (result !== null) {
      return result;
    }
  }

  return null;
}

/**
 * Find backdoor set of specific size
 */
function findBackdoorSetOfSize(
  graph: CausalGraph,
  treatment: string,
  outcome: string,
  candidates: string[],
  size: number
): string[] | null {
  function* combinations(arr: string[], k: number): Generator<string[]> {
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

  for (const subset of combinations(candidates, size)) {
    if (isValidBackdoorAdjustment(graph, treatment, outcome, subset)) {
      return subset;
    }
  }

  return null;
}

// ============================================================================
// MARKOV BLANKET
// ============================================================================

/**
 * Compute the Markov blanket of a node
 * (parents + children + parents of children)
 */
export function computeMarkovBlanket(graph: CausalGraph, nodeId: string): string[] {
  const parents = new Set<string>();
  const children = new Set<string>();
  const parentsOfChildren = new Set<string>();

  for (const edge of graph.edges) {
    if (edge.to === nodeId && edge.type !== 'bidirected') {
      parents.add(edge.from);
    }
    if (edge.from === nodeId && edge.type !== 'bidirected') {
      children.add(edge.to);
    }
  }

  for (const child of children) {
    for (const edge of graph.edges) {
      if (edge.to === child && edge.from !== nodeId && edge.type !== 'bidirected') {
        parentsOfChildren.add(edge.from);
      }
    }
  }

  return Array.from(new Set([...parents, ...children, ...parentsOfChildren]));
}

// ============================================================================
// INDEPENDENCE TESTING
// ============================================================================

/**
 * Get all conditional independence relations implied by the graph
 */
export function getImpliedIndependencies(
  graph: CausalGraph,
  maxConditioningSize = 3
): Array<{ x: string; y: string; z: string[]; separated: boolean }> {
  const independencies: Array<{ x: string; y: string; z: string[]; separated: boolean }> = [];
  const nodeIds = graph.nodes.map((n) => n.id);

  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      const x = nodeIds[i];
      const y = nodeIds[j];
      const others = nodeIds.filter((id) => id !== x && id !== y);

      // Check unconditional independence
      const unconditional = checkDSeparation(graph, { x: [x], y: [y], z: [] });
      if (unconditional.separated) {
        independencies.push({ x, y, z: [], separated: true });
      }

      // Check conditional independence for various conditioning sets
      for (let size = 1; size <= Math.min(maxConditioningSize, others.length); size++) {
        for (const z of getCombinations(others, size)) {
          const result = checkDSeparation(graph, { x: [x], y: [y], z });
          if (result.separated) {
            independencies.push({ x, y, z, separated: true });
          }
        }
      }
    }
  }

  return independencies;
}

/**
 * Generate combinations helper
 */
function* getCombinations(arr: string[], k: number): Generator<string[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = 0; i <= arr.length - k; i++) {
    for (const rest of getCombinations(arr.slice(i + 1), k - 1)) {
      yield [arr[i], ...rest];
    }
  }
}
