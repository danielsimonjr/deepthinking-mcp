/**
 * Centrality Algorithms - Phase 12 Sprint 6
 *
 * Implements graph centrality measures for causal analysis:
 * - Degree centrality (in/out/total)
 * - Betweenness centrality
 * - Closeness centrality
 * - PageRank
 * - Eigenvector centrality
 * - Katz centrality
 */

import type {
  CausalGraph,
  CentralityMeasures,
  CentralityConfig,
  CentralityResult,
  CentralityType,
} from '../types.js';

// ============================================================================
// GRAPH UTILITIES
// ============================================================================

/**
 * Build adjacency list from graph
 */
function buildAdjacencyList(
  graph: CausalGraph,
  directed = true
): { outgoing: Map<string, string[]>; incoming: Map<string, string[]> } {
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();

  for (const node of graph.nodes) {
    outgoing.set(node.id, []);
    incoming.set(node.id, []);
  }

  for (const edge of graph.edges) {
    outgoing.get(edge.from)?.push(edge.to);
    incoming.get(edge.to)?.push(edge.from);

    // For undirected/bidirected edges, add both directions
    if (!directed || edge.type === 'undirected' || edge.type === 'bidirected') {
      outgoing.get(edge.to)?.push(edge.from);
      incoming.get(edge.from)?.push(edge.to);
    }
  }

  return { outgoing, incoming };
}

// ============================================================================
// DEGREE CENTRALITY
// ============================================================================

/**
 * Compute degree centrality (total, in, out)
 */
export function computeDegreeCentrality(
  graph: CausalGraph,
  normalize = true
): { degree: Map<string, number>; inDegree: Map<string, number>; outDegree: Map<string, number> } {
  const { outgoing, incoming } = buildAdjacencyList(graph);
  const n = graph.nodes.length;
  const normFactor = normalize && n > 1 ? n - 1 : 1;

  const degree = new Map<string, number>();
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();

  for (const node of graph.nodes) {
    const outDeg = (outgoing.get(node.id) || []).length;
    const inDeg = (incoming.get(node.id) || []).length;

    outDegree.set(node.id, outDeg / normFactor);
    inDegree.set(node.id, inDeg / normFactor);
    degree.set(node.id, (outDeg + inDeg) / normFactor);
  }

  return { degree, inDegree, outDegree };
}

// ============================================================================
// BETWEENNESS CENTRALITY
// ============================================================================

/**
 * Compute betweenness centrality using Brandes' algorithm
 */
export function computeBetweennessCentrality(
  graph: CausalGraph,
  normalize = true
): Map<string, number> {
  const { outgoing } = buildAdjacencyList(graph, false); // Undirected for betweenness
  const n = graph.nodes.length;
  const betweenness = new Map<string, number>();

  // Initialize
  for (const node of graph.nodes) {
    betweenness.set(node.id, 0);
  }

  // Brandes' algorithm
  for (const s of graph.nodes) {
    const stack: string[] = [];
    const pred = new Map<string, string[]>();
    const sigma = new Map<string, number>();
    const dist = new Map<string, number>();
    const delta = new Map<string, number>();

    // Initialize
    for (const v of graph.nodes) {
      pred.set(v.id, []);
      sigma.set(v.id, 0);
      dist.set(v.id, -1);
      delta.set(v.id, 0);
    }

    sigma.set(s.id, 1);
    dist.set(s.id, 0);

    // BFS
    const queue: string[] = [s.id];
    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);

      for (const w of outgoing.get(v) || []) {
        // Path discovery
        if (dist.get(w)! < 0) {
          dist.set(w, dist.get(v)! + 1);
          queue.push(w);
        }

        // Path counting
        if (dist.get(w) === dist.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          pred.get(w)!.push(v);
        }
      }
    }

    // Accumulation
    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred.get(w)!) {
        const contribution = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
        delta.set(v, delta.get(v)! + contribution);
      }
      if (w !== s.id) {
        betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
      }
    }
  }

  // Normalize (undirected: divide by 2, then normalize by (n-1)(n-2)/2)
  if (normalize && n > 2) {
    const normFactor = (n - 1) * (n - 2);
    for (const [node, value] of betweenness) {
      betweenness.set(node, (value * 2) / normFactor);
    }
  }

  return betweenness;
}

// ============================================================================
// CLOSENESS CENTRALITY
// ============================================================================

/**
 * Compute closeness centrality
 */
export function computeClosenessCentrality(
  graph: CausalGraph,
  normalize = true
): Map<string, number> {
  const { outgoing } = buildAdjacencyList(graph, false);
  const n = graph.nodes.length;
  const closeness = new Map<string, number>();

  for (const source of graph.nodes) {
    // BFS to find shortest paths
    const dist = new Map<string, number>();
    for (const node of graph.nodes) {
      dist.set(node.id, Infinity);
    }
    dist.set(source.id, 0);

    const queue: string[] = [source.id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighbor of outgoing.get(current) || []) {
        if (dist.get(neighbor) === Infinity) {
          dist.set(neighbor, dist.get(current)! + 1);
          queue.push(neighbor);
        }
      }
    }

    // Sum of distances
    let totalDist = 0;
    let reachable = 0;
    for (const [_, d] of dist) {
      if (d !== Infinity && d > 0) {
        totalDist += d;
        reachable++;
      }
    }

    // Closeness = 1 / average distance
    if (reachable > 0 && totalDist > 0) {
      const cc = reachable / totalDist;
      closeness.set(source.id, normalize && n > 1 ? cc * (n - 1) / n : cc);
    } else {
      closeness.set(source.id, 0);
    }
  }

  return closeness;
}

// ============================================================================
// PAGERANK
// ============================================================================

/**
 * Compute PageRank
 */
export function computePageRank(
  graph: CausalGraph,
  dampingFactor = 0.85,
  maxIterations = 100,
  tolerance = 1e-6
): Map<string, number> {
  const { outgoing } = buildAdjacencyList(graph);
  const n = graph.nodes.length;
  if (n === 0) return new Map();

  // Initialize PageRank uniformly
  let pageRank = new Map<string, number>();
  for (const node of graph.nodes) {
    pageRank.set(node.id, 1 / n);
  }

  // Power iteration
  for (let iter = 0; iter < maxIterations; iter++) {
    const newPageRank = new Map<string, number>();

    // Initialize with teleportation
    for (const node of graph.nodes) {
      newPageRank.set(node.id, (1 - dampingFactor) / n);
    }

    // Add contributions from incoming links
    for (const node of graph.nodes) {
      const neighbors = outgoing.get(node.id) || [];
      const outDegree = neighbors.length;

      if (outDegree > 0) {
        const contribution = (dampingFactor * pageRank.get(node.id)!) / outDegree;
        for (const neighbor of neighbors) {
          newPageRank.set(neighbor, newPageRank.get(neighbor)! + contribution);
        }
      } else {
        // Dangling node: distribute evenly
        const contribution = (dampingFactor * pageRank.get(node.id)!) / n;
        for (const other of graph.nodes) {
          newPageRank.set(other.id, newPageRank.get(other.id)! + contribution);
        }
      }
    }

    // Check convergence
    let maxDiff = 0;
    for (const node of graph.nodes) {
      maxDiff = Math.max(
        maxDiff,
        Math.abs(newPageRank.get(node.id)! - pageRank.get(node.id)!)
      );
    }

    pageRank = newPageRank;

    if (maxDiff < tolerance) {
      break;
    }
  }

  return pageRank;
}

// ============================================================================
// EIGENVECTOR CENTRALITY
// ============================================================================

/**
 * Compute eigenvector centrality using power iteration
 */
export function computeEigenvectorCentrality(
  graph: CausalGraph,
  maxIterations = 100,
  tolerance = 1e-6
): Map<string, number> {
  const { incoming } = buildAdjacencyList(graph, false);
  const n = graph.nodes.length;
  if (n === 0) return new Map();

  // Initialize uniformly
  let centrality = new Map<string, number>();
  for (const node of graph.nodes) {
    centrality.set(node.id, 1 / Math.sqrt(n));
  }

  // Power iteration
  for (let iter = 0; iter < maxIterations; iter++) {
    const newCentrality = new Map<string, number>();

    for (const node of graph.nodes) {
      let sum = 0;
      for (const neighbor of incoming.get(node.id) || []) {
        sum += centrality.get(neighbor)!;
      }
      newCentrality.set(node.id, sum);
    }

    // Normalize
    let norm = 0;
    for (const value of newCentrality.values()) {
      norm += value * value;
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (const [node, value] of newCentrality) {
        newCentrality.set(node, value / norm);
      }
    }

    // Check convergence
    let maxDiff = 0;
    for (const node of graph.nodes) {
      maxDiff = Math.max(
        maxDiff,
        Math.abs(newCentrality.get(node.id)! - centrality.get(node.id)!)
      );
    }

    centrality = newCentrality;

    if (maxDiff < tolerance) {
      break;
    }
  }

  return centrality;
}

// ============================================================================
// KATZ CENTRALITY
// ============================================================================

/**
 * Compute Katz centrality
 */
export function computeKatzCentrality(
  graph: CausalGraph,
  alpha = 0.1,
  beta = 1.0,
  maxIterations = 100,
  tolerance = 1e-6
): Map<string, number> {
  const { incoming } = buildAdjacencyList(graph);
  const n = graph.nodes.length;
  if (n === 0) return new Map();

  // Initialize
  let centrality = new Map<string, number>();
  for (const node of graph.nodes) {
    centrality.set(node.id, 0);
  }

  // Iterative computation
  for (let iter = 0; iter < maxIterations; iter++) {
    const newCentrality = new Map<string, number>();

    for (const node of graph.nodes) {
      let sum = beta;
      for (const neighbor of incoming.get(node.id) || []) {
        sum += alpha * centrality.get(neighbor)!;
      }
      newCentrality.set(node.id, sum);
    }

    // Check convergence
    let maxDiff = 0;
    for (const node of graph.nodes) {
      maxDiff = Math.max(
        maxDiff,
        Math.abs(newCentrality.get(node.id)! - centrality.get(node.id)!)
      );
    }

    centrality = newCentrality;

    if (maxDiff < tolerance) {
      break;
    }
  }

  // Normalize
  let maxVal = 0;
  for (const value of centrality.values()) {
    maxVal = Math.max(maxVal, value);
  }
  if (maxVal > 0) {
    for (const [node, value] of centrality) {
      centrality.set(node, value / maxVal);
    }
  }

  return centrality;
}

// ============================================================================
// COMBINED CENTRALITY ANALYSIS
// ============================================================================

/**
 * Compute all centrality measures for a graph
 */
export function computeAllCentrality(
  graph: CausalGraph,
  config: CentralityConfig = {}
): CentralityResult {
  const startTime = Date.now();
  const measures = config.measures || [
    'degree',
    'in_degree',
    'out_degree',
    'betweenness',
    'closeness',
    'pagerank',
    'eigenvector',
  ];
  const normalize = config.normalize ?? true;

  const result: CentralityMeasures = {
    degree: new Map(),
    inDegree: new Map(),
    outDegree: new Map(),
    betweenness: new Map(),
    closeness: new Map(),
    pageRank: new Map(),
    eigenvector: new Map(),
  };

  // Compute degree centralities
  if (
    measures.includes('degree') ||
    measures.includes('in_degree') ||
    measures.includes('out_degree')
  ) {
    const { degree, inDegree, outDegree } = computeDegreeCentrality(graph, normalize);
    result.degree = degree;
    result.inDegree = inDegree;
    result.outDegree = outDegree;
  }

  // Compute betweenness
  if (measures.includes('betweenness')) {
    result.betweenness = computeBetweennessCentrality(graph, normalize);
  }

  // Compute closeness
  if (measures.includes('closeness')) {
    result.closeness = computeClosenessCentrality(graph, normalize);
  }

  // Compute PageRank
  if (measures.includes('pagerank')) {
    result.pageRank = computePageRank(
      graph,
      config.dampingFactor,
      config.maxIterations,
      config.tolerance
    );
  }

  // Compute eigenvector
  if (measures.includes('eigenvector')) {
    result.eigenvector = computeEigenvectorCentrality(
      graph,
      config.maxIterations,
      config.tolerance
    );
  }

  // Compute Katz (if requested)
  if (measures.includes('katz')) {
    (result as any).katz = computeKatzCentrality(
      graph,
      undefined,
      undefined,
      config.maxIterations,
      config.tolerance
    );
  }

  // Find top nodes for each measure
  const topNodes = new Map<CentralityType, Array<{ nodeId: string; score: number }>>();
  const topN = 5;

  const measureMaps: [CentralityType, Map<string, number>][] = [
    ['degree', result.degree],
    ['in_degree', result.inDegree],
    ['out_degree', result.outDegree],
    ['betweenness', result.betweenness],
    ['closeness', result.closeness],
    ['pagerank', result.pageRank],
    ['eigenvector', result.eigenvector],
  ];

  for (const [measureType, measureMap] of measureMaps) {
    if (measureMap.size > 0) {
      const sorted = Array.from(measureMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([nodeId, score]) => ({ nodeId, score }));
      topNodes.set(measureType, sorted);
    }
  }

  return {
    measures: result,
    topNodes,
    computationTime: Date.now() - startTime,
  };
}

/**
 * Get the most central node by a specific measure
 */
export function getMostCentralNode(
  graph: CausalGraph,
  measure: CentralityType = 'pagerank'
): { nodeId: string; score: number } | null {
  let centralityMap: Map<string, number>;

  switch (measure) {
    case 'degree':
    case 'in_degree':
    case 'out_degree':
      const { degree, inDegree, outDegree } = computeDegreeCentrality(graph);
      centralityMap = measure === 'in_degree' ? inDegree : measure === 'out_degree' ? outDegree : degree;
      break;
    case 'betweenness':
      centralityMap = computeBetweennessCentrality(graph);
      break;
    case 'closeness':
      centralityMap = computeClosenessCentrality(graph);
      break;
    case 'pagerank':
      centralityMap = computePageRank(graph);
      break;
    case 'eigenvector':
      centralityMap = computeEigenvectorCentrality(graph);
      break;
    case 'katz':
      centralityMap = computeKatzCentrality(graph);
      break;
    default:
      return null;
  }

  if (centralityMap.size === 0) return null;

  let maxNode: string | null = null;
  let maxScore = -Infinity;

  for (const [nodeId, score] of centralityMap) {
    if (score > maxScore) {
      maxScore = score;
      maxNode = nodeId;
    }
  }

  return maxNode ? { nodeId: maxNode, score: maxScore } : null;
}
