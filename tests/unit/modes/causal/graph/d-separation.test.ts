/**
 * D-Separation Analyzer Unit Tests - Phase 12 Sprint 6
 *
 * Tests for d-separation analysis and related functions.
 */

import { describe, it, expect } from 'vitest';
import {
  findVStructures,
  findAllPaths,
  isPathBlocked,
  checkDSeparation,
  findMinimalSeparator,
  isValidBackdoorAdjustment,
  computeMarkovBlanket,
  getImpliedIndependencies,
  getAncestors,
} from '../../../../../src/modes/causal/graph/algorithms/d-separation.js';
import type { CausalGraph, Path } from '../../../../../src/modes/causal/graph/types.js';

// Helper to create test graphs
function createForkGraph(): CausalGraph {
  // A <- C -> B (C is a common cause)
  return {
    id: 'fork',
    nodes: [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }],
    edges: [
      { from: 'C', to: 'A', type: 'directed' },
      { from: 'C', to: 'B', type: 'directed' },
    ],
  };
}

function createChainGraph(): CausalGraph {
  // A -> C -> B (C is a mediator)
  return {
    id: 'chain',
    nodes: [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }],
    edges: [
      { from: 'A', to: 'C', type: 'directed' },
      { from: 'C', to: 'B', type: 'directed' },
    ],
  };
}

function createColliderGraph(): CausalGraph {
  // A -> C <- B (C is a collider)
  return {
    id: 'collider',
    nodes: [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }],
    edges: [
      { from: 'A', to: 'C', type: 'directed' },
      { from: 'B', to: 'C', type: 'directed' },
    ],
  };
}

function createColliderWithDescendant(): CausalGraph {
  // A -> C <- B, C -> D (D is descendant of collider)
  return {
    id: 'collider-descendant',
    nodes: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
      { id: 'C', name: 'C' },
      { id: 'D', name: 'D' },
    ],
    edges: [
      { from: 'A', to: 'C', type: 'directed' },
      { from: 'B', to: 'C', type: 'directed' },
      { from: 'C', to: 'D', type: 'directed' },
    ],
  };
}

function createConfoundedGraph(): CausalGraph {
  // X -> Y with U as common cause (confounder)
  // U -> X, U -> Y, X -> Y
  return {
    id: 'confounded',
    nodes: [
      { id: 'X', name: 'X' },
      { id: 'Y', name: 'Y' },
      { id: 'U', name: 'U' },
    ],
    edges: [
      { from: 'U', to: 'X', type: 'directed' },
      { from: 'U', to: 'Y', type: 'directed' },
      { from: 'X', to: 'Y', type: 'directed' },
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

function createDisconnectedGraph(): CausalGraph {
  return {
    id: 'disconnected',
    nodes: [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }],
    edges: [],
  };
}

describe('V-Structure Detection', () => {
  describe('findVStructures()', () => {
    it('should find v-structure (collider)', () => {
      const graph = createColliderGraph();
      const vStructures = findVStructures(graph);

      expect(vStructures.length).toBe(1);
      expect(vStructures[0].collider).toBe('C');
      expect(vStructures[0].activatedWhenConditioned).toBe(true);
    });

    it('should not find v-structure in fork', () => {
      const graph = createForkGraph();
      const vStructures = findVStructures(graph);

      expect(vStructures.length).toBe(0);
    });

    it('should not find v-structure in chain', () => {
      const graph = createChainGraph();
      const vStructures = findVStructures(graph);

      expect(vStructures.length).toBe(0);
    });

    it('should find v-structure with multiple parents', () => {
      const graph: CausalGraph = {
        id: 'multi-parent',
        nodes: [
          { id: 'A', name: 'A' },
          { id: 'B', name: 'B' },
          { id: 'C', name: 'C' },
          { id: 'D', name: 'D' },
        ],
        edges: [
          { from: 'A', to: 'D', type: 'directed' },
          { from: 'B', to: 'D', type: 'directed' },
          { from: 'C', to: 'D', type: 'directed' },
        ],
      };

      const vStructures = findVStructures(graph);

      // Should find multiple v-structures (A-D-B, A-D-C, B-D-C)
      expect(vStructures.length).toBe(3);
    });

    it('should handle empty graph', () => {
      const graph = createEmptyGraph();
      const vStructures = findVStructures(graph);

      expect(vStructures.length).toBe(0);
    });
  });
});

describe('Path Finding', () => {
  describe('findAllPaths()', () => {
    it('should find paths in chain graph', () => {
      const graph = createChainGraph();
      const paths = findAllPaths(graph, ['A'], ['B']);

      expect(paths.length).toBe(1);
      expect(paths[0].nodes).toEqual(['A', 'C', 'B']);
      expect(paths[0].length).toBe(2);
    });

    it('should find paths in fork graph', () => {
      const graph = createForkGraph();
      const paths = findAllPaths(graph, ['A'], ['B']);

      expect(paths.length).toBe(1);
      expect(paths[0].nodes).toContain('C');
    });

    it('should find paths in collider graph', () => {
      const graph = createColliderGraph();
      const paths = findAllPaths(graph, ['A'], ['B']);

      expect(paths.length).toBe(1);
      expect(paths[0].nodes).toContain('C');
    });

    it('should return empty for disconnected nodes', () => {
      const graph = createDisconnectedGraph();
      const paths = findAllPaths(graph, ['A'], ['B']);

      expect(paths.length).toBe(0);
    });

    it('should respect max length', () => {
      const graph = createChainGraph();
      const paths = findAllPaths(graph, ['A'], ['B'], 1);

      // Path A->C->B has length 2, should not be found with maxLength=1
      expect(paths.length).toBe(0);
    });

    it('should find multiple paths', () => {
      const graph: CausalGraph = {
        id: 'diamond',
        nodes: [
          { id: 'A', name: 'A' },
          { id: 'B', name: 'B' },
          { id: 'C', name: 'C' },
          { id: 'D', name: 'D' },
        ],
        edges: [
          { from: 'A', to: 'B', type: 'directed' },
          { from: 'A', to: 'C', type: 'directed' },
          { from: 'B', to: 'D', type: 'directed' },
          { from: 'C', to: 'D', type: 'directed' },
        ],
      };

      const paths = findAllPaths(graph, ['A'], ['D']);

      expect(paths.length).toBe(2);
    });
  });
});

describe('Path Blocking', () => {
  describe('isPathBlocked()', () => {
    it('should block fork when common cause is conditioned', () => {
      const graph = createForkGraph();
      const paths = findAllPaths(graph, ['A'], ['B']);
      const conditioningSet = new Set(['C']);

      const result = isPathBlocked(graph, paths[0], conditioningSet);

      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('conditioned');
    });

    it('should block chain when mediator is conditioned', () => {
      const graph = createChainGraph();
      const paths = findAllPaths(graph, ['A'], ['B']);
      const conditioningSet = new Set(['C']);

      const result = isPathBlocked(graph, paths[0], conditioningSet);

      expect(result.blocked).toBe(true);
    });

    it('should not block collider when not conditioned', () => {
      const graph = createColliderGraph();
      const paths = findAllPaths(graph, ['A'], ['B']);
      const conditioningSet = new Set<string>();

      const result = isPathBlocked(graph, paths[0], conditioningSet);

      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('Collider');
    });

    it('should open collider when conditioned', () => {
      const graph = createColliderGraph();
      const paths = findAllPaths(graph, ['A'], ['B']);
      const conditioningSet = new Set(['C']);

      const result = isPathBlocked(graph, paths[0], conditioningSet);

      expect(result.blocked).toBe(false);
    });

    it('should open collider when descendant is conditioned', () => {
      const graph = createColliderWithDescendant();
      const paths = findAllPaths(graph, ['A'], ['B']);
      const conditioningSet = new Set(['D']);

      const result = isPathBlocked(graph, paths[0], conditioningSet);

      expect(result.blocked).toBe(false);
    });
  });
});

describe('D-Separation Analysis', () => {
  describe('checkDSeparation()', () => {
    it('should find d-separation in fork when conditioning on common cause', () => {
      const graph = createForkGraph();
      const result = checkDSeparation(graph, { x: ['A'], y: ['B'], z: ['C'] });

      expect(result.separated).toBe(true);
      expect(result.conditioningSet).toContain('C');
    });

    it('should find d-separation in chain when conditioning on mediator', () => {
      const graph = createChainGraph();
      const result = checkDSeparation(graph, { x: ['A'], y: ['B'], z: ['C'] });

      expect(result.separated).toBe(true);
    });

    it('should find d-separation in collider without conditioning', () => {
      const graph = createColliderGraph();
      const result = checkDSeparation(graph, { x: ['A'], y: ['B'], z: [] });

      expect(result.separated).toBe(true);
    });

    it('should not find d-separation when collider is conditioned', () => {
      const graph = createColliderGraph();
      const result = checkDSeparation(graph, { x: ['A'], y: ['B'], z: ['C'] });

      expect(result.separated).toBe(false);
    });

    it('should find d-separation for disconnected nodes', () => {
      const graph = createDisconnectedGraph();
      const result = checkDSeparation(graph, { x: ['A'], y: ['B'], z: [] });

      expect(result.separated).toBe(true);
    });

    it('should include path details when requested', () => {
      const graph = createChainGraph();
      const result = checkDSeparation(graph, { x: ['A'], y: ['B'], z: ['C'] }, { includePathDetails: true });

      expect(result.blockingPaths.length).toBeGreaterThan(0);
    });

    it('should provide explanation', () => {
      const graph = createChainGraph();
      const result = checkDSeparation(graph, { x: ['A'], y: ['B'], z: ['C'] });

      expect(result.explanation).toBeDefined();
      expect(result.explanation.length).toBeGreaterThan(0);
    });
  });
});

describe('Minimal Separator Finding', () => {
  describe('findMinimalSeparator()', () => {
    it('should find minimal separator in fork graph', () => {
      const graph = createForkGraph();
      const separator = findMinimalSeparator(graph, ['A'], ['B']);

      expect(separator).toContain('C');
    });

    it('should find empty separator for disconnected nodes', () => {
      const graph = createDisconnectedGraph();
      const separator = findMinimalSeparator(graph, ['A'], ['B']);

      expect(separator).toEqual([]);
    });

    it('should find empty separator for collider', () => {
      const graph = createColliderGraph();
      const separator = findMinimalSeparator(graph, ['A'], ['B']);

      // Already d-separated without conditioning
      expect(separator).toEqual([]);
    });

    it('should return null when no separator exists', () => {
      // In a fully connected graph, might not find separator
      const graph: CausalGraph = {
        id: 'complete',
        nodes: [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }],
        edges: [
          { from: 'A', to: 'B', type: 'directed' },
        ],
      };

      const separator = findMinimalSeparator(graph, ['A'], ['B']);

      // When no separator can block the direct edge, returns null
      expect(separator).toBeNull();
    });
  });
});

describe('Backdoor Adjustment', () => {
  describe('isValidBackdoorAdjustment()', () => {
    it('should validate backdoor adjustment in confounded graph', () => {
      const graph = createConfoundedGraph();

      // Adjusting for U should block backdoor path
      const isValid = isValidBackdoorAdjustment(graph, 'X', 'Y', ['U']);

      expect(isValid).toBe(true);
    });

    it('should reject adjustment including descendants', () => {
      // X -> M -> Y (M is descendant of X)
      const graph: CausalGraph = {
        id: 'mediator',
        nodes: [
          { id: 'X', name: 'X' },
          { id: 'M', name: 'M' },
          { id: 'Y', name: 'Y' },
        ],
        edges: [
          { from: 'X', to: 'M', type: 'directed' },
          { from: 'M', to: 'Y', type: 'directed' },
        ],
      };

      const isValid = isValidBackdoorAdjustment(graph, 'X', 'Y', ['M']);

      expect(isValid).toBe(false);
    });

    it('should accept empty adjustment set when no confounding', () => {
      const graph: CausalGraph = {
        id: 'simple',
        nodes: [{ id: 'X', name: 'X' }, { id: 'Y', name: 'Y' }],
        edges: [{ from: 'X', to: 'Y', type: 'directed' }],
      };

      const isValid = isValidBackdoorAdjustment(graph, 'X', 'Y', []);

      expect(isValid).toBe(true);
    });
  });
});

describe('Markov Blanket', () => {
  describe('computeMarkovBlanket()', () => {
    it('should compute Markov blanket (parents + children + parents of children)', () => {
      const graph: CausalGraph = {
        id: 'mb-test',
        nodes: [
          { id: 'P1', name: 'Parent 1' },
          { id: 'P2', name: 'Parent 2' },
          { id: 'X', name: 'X' },
          { id: 'C1', name: 'Child 1' },
          { id: 'C2', name: 'Child 2' },
          { id: 'PC', name: 'Parent of Child' },
        ],
        edges: [
          { from: 'P1', to: 'X', type: 'directed' },
          { from: 'P2', to: 'X', type: 'directed' },
          { from: 'X', to: 'C1', type: 'directed' },
          { from: 'X', to: 'C2', type: 'directed' },
          { from: 'PC', to: 'C1', type: 'directed' },
        ],
      };

      const blanket = computeMarkovBlanket(graph, 'X');

      expect(blanket).toContain('P1');
      expect(blanket).toContain('P2');
      expect(blanket).toContain('C1');
      expect(blanket).toContain('C2');
      expect(blanket).toContain('PC');
      expect(blanket).not.toContain('X');
    });

    it('should return empty blanket for isolated node', () => {
      const graph: CausalGraph = {
        id: 'isolated',
        nodes: [{ id: 'X', name: 'X' }],
        edges: [],
      };

      const blanket = computeMarkovBlanket(graph, 'X');

      expect(blanket).toEqual([]);
    });
  });
});

describe('Implied Independencies', () => {
  describe('getImpliedIndependencies()', () => {
    it('should find unconditional independence in collider', () => {
      const graph = createColliderGraph();
      const independencies = getImpliedIndependencies(graph, 0);

      // A and B are unconditionally independent
      const unconditional = independencies.find((i) => i.z.length === 0);
      expect(unconditional).toBeDefined();
      expect(unconditional?.separated).toBe(true);
    });

    it('should find conditional independence in fork', () => {
      const graph = createForkGraph();
      const independencies = getImpliedIndependencies(graph, 1);

      // A and B are conditionally independent given C
      const conditional = independencies.find(
        (i) => i.z.includes('C') && i.z.length === 1
      );
      expect(conditional).toBeDefined();
      expect(conditional?.separated).toBe(true);
    });

    it('should respect max conditioning size', () => {
      const graph = createConfoundedGraph();
      const independencies = getImpliedIndependencies(graph, 1);

      // All conditioning sets should have size <= 1
      independencies.forEach((i) => {
        expect(i.z.length).toBeLessThanOrEqual(1);
      });
    });

    it('should handle empty graph', () => {
      const graph = createEmptyGraph();
      const independencies = getImpliedIndependencies(graph);

      expect(independencies).toEqual([]);
    });
  });
});

describe('Ancestor Finding', () => {
  describe('getAncestors()', () => {
    it('should find all ancestors', () => {
      const graph = createChainGraph();
      const ancestors = getAncestors(graph, 'B');

      expect(ancestors.has('C')).toBe(true);
      expect(ancestors.has('A')).toBe(true);
    });

    it('should return empty set for root node', () => {
      const graph = createChainGraph();
      const ancestors = getAncestors(graph, 'A');

      expect(ancestors.size).toBe(0);
    });

    it('should handle complex ancestry', () => {
      const graph = createConfoundedGraph();
      const ancestors = getAncestors(graph, 'Y');

      expect(ancestors.has('X')).toBe(true);
      expect(ancestors.has('U')).toBe(true);
    });
  });
});
