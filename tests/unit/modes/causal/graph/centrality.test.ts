/**
 * Centrality Algorithms Unit Tests - Phase 12 Sprint 6
 *
 * Tests for graph centrality measures.
 */

import { describe, it, expect } from 'vitest';
import {
  computeDegreeCentrality,
  computeBetweennessCentrality,
  computeClosenessCentrality,
  computePageRank,
  computeEigenvectorCentrality,
  computeKatzCentrality,
  computeAllCentrality,
  getMostCentralNode,
} from '../../../../../src/modes/causal/graph/algorithms/centrality.js';
import type { CausalGraph } from '../../../../../src/modes/causal/graph/types.js';

// Helper to create test graphs
function createSimpleChain(): CausalGraph {
  return {
    id: 'chain',
    nodes: [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }],
    edges: [
      { from: 'A', to: 'B', type: 'directed' },
      { from: 'B', to: 'C', type: 'directed' },
    ],
  };
}

function createStarGraph(): CausalGraph {
  return {
    id: 'star',
    nodes: [
      { id: 'center', name: 'Center' },
      { id: 'leaf1', name: 'Leaf 1' },
      { id: 'leaf2', name: 'Leaf 2' },
      { id: 'leaf3', name: 'Leaf 3' },
      { id: 'leaf4', name: 'Leaf 4' },
    ],
    edges: [
      { from: 'center', to: 'leaf1', type: 'directed' },
      { from: 'center', to: 'leaf2', type: 'directed' },
      { from: 'center', to: 'leaf3', type: 'directed' },
      { from: 'center', to: 'leaf4', type: 'directed' },
    ],
  };
}

function createTriangle(): CausalGraph {
  return {
    id: 'triangle',
    nodes: [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }],
    edges: [
      { from: 'A', to: 'B', type: 'directed' },
      { from: 'B', to: 'C', type: 'directed' },
      { from: 'A', to: 'C', type: 'directed' },
    ],
  };
}

function createEmptyGraph(): CausalGraph {
  return {
    id: 'empty',
    nodes: [],
    edges: [],
  };
}

function createSingleNode(): CausalGraph {
  return {
    id: 'single',
    nodes: [{ id: 'A', name: 'A' }],
    edges: [],
  };
}

describe('Degree Centrality', () => {
  describe('computeDegreeCentrality()', () => {
    it('should compute degree centrality for simple chain', () => {
      const graph = createSimpleChain();
      const { degree, inDegree, outDegree } = computeDegreeCentrality(graph, false);

      // A has out:1, in:0, total:1
      expect(outDegree.get('A')).toBe(1);
      expect(inDegree.get('A')).toBe(0);

      // B has out:1, in:1, total:2
      expect(outDegree.get('B')).toBe(1);
      expect(inDegree.get('B')).toBe(1);

      // C has out:0, in:1, total:1
      expect(outDegree.get('C')).toBe(0);
      expect(inDegree.get('C')).toBe(1);
    });

    it('should compute degree centrality for star graph', () => {
      const graph = createStarGraph();
      const { outDegree, inDegree } = computeDegreeCentrality(graph, false);

      expect(outDegree.get('center')).toBe(4);
      expect(inDegree.get('center')).toBe(0);
      expect(outDegree.get('leaf1')).toBe(0);
      expect(inDegree.get('leaf1')).toBe(1);
    });

    it('should normalize degree centrality', () => {
      const graph = createSimpleChain();
      const { degree } = computeDegreeCentrality(graph, true);

      // With 3 nodes, normalization factor is (n-1) = 2
      const values = Array.from(degree.values());
      values.forEach((v) => expect(v).toBeLessThanOrEqual(1));
    });

    it('should handle empty graph', () => {
      const graph = createEmptyGraph();
      const { degree, inDegree, outDegree } = computeDegreeCentrality(graph);

      expect(degree.size).toBe(0);
      expect(inDegree.size).toBe(0);
      expect(outDegree.size).toBe(0);
    });

    it('should handle single node', () => {
      const graph = createSingleNode();
      const { degree, inDegree, outDegree } = computeDegreeCentrality(graph);

      expect(degree.get('A')).toBe(0);
      expect(inDegree.get('A')).toBe(0);
      expect(outDegree.get('A')).toBe(0);
    });
  });
});

describe('Betweenness Centrality', () => {
  describe('computeBetweennessCentrality()', () => {
    it('should compute betweenness for simple chain', () => {
      const graph = createSimpleChain();
      const betweenness = computeBetweennessCentrality(graph, false);

      // B is on the path from A to C
      expect(betweenness.get('B')).toBeGreaterThan(0);

      // A and C are endpoints
      expect(betweenness.get('A')).toBe(0);
      expect(betweenness.get('C')).toBe(0);
    });

    it('should compute high betweenness for star center', () => {
      const graph = createStarGraph();
      const betweenness = computeBetweennessCentrality(graph, false);

      // Center node has highest betweenness
      const centerValue = betweenness.get('center')!;
      expect(centerValue).toBeGreaterThan(0);

      // Leaf nodes should have 0 betweenness
      expect(betweenness.get('leaf1')).toBe(0);
    });

    it('should return finite values when normalized', () => {
      const graph = createSimpleChain();
      const betweenness = computeBetweennessCentrality(graph, true);

      const values = Array.from(betweenness.values());
      values.forEach((v) => expect(Number.isFinite(v)).toBe(true));
    });

    it('should handle empty graph', () => {
      const graph = createEmptyGraph();
      const betweenness = computeBetweennessCentrality(graph);

      expect(betweenness.size).toBe(0);
    });
  });
});

describe('Closeness Centrality', () => {
  describe('computeClosenessCentrality()', () => {
    it('should compute closeness for simple chain', () => {
      const graph = createSimpleChain();
      const closeness = computeClosenessCentrality(graph, false);

      // B is in the middle, should have highest closeness
      const closenessA = closeness.get('A')!;
      const closenessB = closeness.get('B')!;
      const closenessC = closeness.get('C')!;

      expect(closenessB).toBeGreaterThan(closenessA);
      expect(closenessB).toBeGreaterThan(closenessC);
    });

    it('should compute high closeness for star center', () => {
      const graph = createStarGraph();
      const closeness = computeClosenessCentrality(graph, false);

      const centerCloseness = closeness.get('center')!;
      const leafCloseness = closeness.get('leaf1')!;

      expect(centerCloseness).toBeGreaterThan(leafCloseness);
    });

    it('should handle empty graph', () => {
      const graph = createEmptyGraph();
      const closeness = computeClosenessCentrality(graph);

      expect(closeness.size).toBe(0);
    });

    it('should handle single node (no paths)', () => {
      const graph = createSingleNode();
      const closeness = computeClosenessCentrality(graph);

      expect(closeness.get('A')).toBe(0);
    });
  });
});

describe('PageRank', () => {
  describe('computePageRank()', () => {
    it('should compute PageRank for simple chain', () => {
      const graph = createSimpleChain();
      const pageRank = computePageRank(graph);

      // All nodes should have positive PageRank
      expect(pageRank.get('A')).toBeGreaterThan(0);
      expect(pageRank.get('B')).toBeGreaterThan(0);
      expect(pageRank.get('C')).toBeGreaterThan(0);

      // C should have highest PageRank (most links pointing to it via B)
      const prC = pageRank.get('C')!;
      const prA = pageRank.get('A')!;
      expect(prC).toBeGreaterThan(prA);
    });

    it('should compute PageRank for star graph', () => {
      const graph = createStarGraph();
      const pageRank = computePageRank(graph);

      // Leaf nodes receive links from center
      const leafPR = pageRank.get('leaf1')!;
      expect(leafPR).toBeGreaterThan(0);
    });

    it('should respect damping factor', () => {
      const graph = createSimpleChain();

      // Lower damping means more random jumps
      const pr1 = computePageRank(graph, 0.85);
      const pr2 = computePageRank(graph, 0.5);

      // Results should differ
      expect(pr1.get('C')).not.toBe(pr2.get('C'));
    });

    it('should converge within iterations', () => {
      const graph = createTriangle();
      const pageRank = computePageRank(graph, 0.85, 100, 1e-6);

      // Should have values for all nodes
      expect(pageRank.size).toBe(3);
    });

    it('should handle empty graph', () => {
      const graph = createEmptyGraph();
      const pageRank = computePageRank(graph);

      expect(pageRank.size).toBe(0);
    });
  });
});

describe('Eigenvector Centrality', () => {
  describe('computeEigenvectorCentrality()', () => {
    it('should compute eigenvector centrality', () => {
      const graph = createTriangle();
      const eigenvector = computeEigenvectorCentrality(graph);

      expect(eigenvector.size).toBe(3);
      eigenvector.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should normalize eigenvector centrality', () => {
      const graph = createTriangle();
      const eigenvector = computeEigenvectorCentrality(graph);

      // L2 norm should be approximately 1
      let norm = 0;
      for (const value of eigenvector.values()) {
        norm += value * value;
      }
      norm = Math.sqrt(norm);
      expect(norm).toBeCloseTo(1, 5);
    });

    it('should handle empty graph', () => {
      const graph = createEmptyGraph();
      const eigenvector = computeEigenvectorCentrality(graph);

      expect(eigenvector.size).toBe(0);
    });
  });
});

describe('Katz Centrality', () => {
  describe('computeKatzCentrality()', () => {
    it('should compute Katz centrality', () => {
      const graph = createTriangle();
      const katz = computeKatzCentrality(graph);

      expect(katz.size).toBe(3);
      katz.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should accept alpha parameter', () => {
      const graph = createSimpleChain();

      const katz1 = computeKatzCentrality(graph, 0.1);
      const katz2 = computeKatzCentrality(graph, 0.5);

      // Both should return valid centrality maps
      expect(katz1.size).toBe(3);
      expect(katz2.size).toBe(3);
    });

    it('should handle empty graph', () => {
      const graph = createEmptyGraph();
      const katz = computeKatzCentrality(graph);

      expect(katz.size).toBe(0);
    });
  });
});

describe('Combined Centrality Analysis', () => {
  describe('computeAllCentrality()', () => {
    it('should compute all centrality measures', () => {
      const graph = createTriangle();
      const result = computeAllCentrality(graph);

      expect(result.measures.degree.size).toBe(3);
      expect(result.measures.inDegree.size).toBe(3);
      expect(result.measures.outDegree.size).toBe(3);
      expect(result.measures.betweenness.size).toBe(3);
      expect(result.measures.closeness.size).toBe(3);
      expect(result.measures.pageRank.size).toBe(3);
      expect(result.measures.eigenvector.size).toBe(3);
    });

    it('should compute only specified measures', () => {
      const graph = createTriangle();
      const result = computeAllCentrality(graph, {
        measures: ['degree', 'pagerank'],
      });

      expect(result.measures.degree.size).toBe(3);
      expect(result.measures.pageRank.size).toBe(3);
      expect(result.measures.betweenness.size).toBe(0);
    });

    it('should find top nodes', () => {
      const graph = createStarGraph();
      const result = computeAllCentrality(graph);

      const topDegree = result.topNodes.get('degree');
      expect(topDegree).toBeDefined();
      expect(topDegree!.length).toBeGreaterThan(0);
      expect(topDegree![0].nodeId).toBe('center');
    });

    it('should track computation time', () => {
      const graph = createTriangle();
      const result = computeAllCentrality(graph);

      expect(result.computationTime).toBeGreaterThanOrEqual(0);
    });

    it('should respect config options', () => {
      const graph = createTriangle();
      const result = computeAllCentrality(graph, {
        dampingFactor: 0.9,
        maxIterations: 50,
        tolerance: 1e-4,
        normalize: false,
      });

      expect(result.measures).toBeDefined();
    });
  });

  describe('getMostCentralNode()', () => {
    it('should find most central node by degree', () => {
      const graph = createStarGraph();
      const result = getMostCentralNode(graph, 'degree');

      expect(result).not.toBeNull();
      expect(result!.nodeId).toBe('center');
    });

    it('should find most central node by PageRank', () => {
      const graph = createSimpleChain();
      const result = getMostCentralNode(graph, 'pagerank');

      expect(result).not.toBeNull();
      expect(result!.score).toBeGreaterThan(0);
    });

    it('should find most central node by betweenness', () => {
      const graph = createSimpleChain();
      const result = getMostCentralNode(graph, 'betweenness');

      expect(result).not.toBeNull();
      expect(result!.nodeId).toBe('B');
    });

    it('should return null for empty graph', () => {
      const graph = createEmptyGraph();
      const result = getMostCentralNode(graph);

      expect(result).toBeNull();
    });

    it('should handle all centrality types', () => {
      const graph = createTriangle();

      expect(getMostCentralNode(graph, 'degree')).not.toBeNull();
      expect(getMostCentralNode(graph, 'in_degree')).not.toBeNull();
      expect(getMostCentralNode(graph, 'out_degree')).not.toBeNull();
      expect(getMostCentralNode(graph, 'betweenness')).not.toBeNull();
      expect(getMostCentralNode(graph, 'closeness')).not.toBeNull();
      expect(getMostCentralNode(graph, 'pagerank')).not.toBeNull();
      expect(getMostCentralNode(graph, 'eigenvector')).not.toBeNull();
      expect(getMostCentralNode(graph, 'katz')).not.toBeNull();
    });
  });
});
