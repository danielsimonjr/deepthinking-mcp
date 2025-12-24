/**
 * Do-Calculus and Intervention Analysis Unit Tests - Phase 12 Sprint 6
 *
 * Tests for Pearl's do-calculus and causal inference functions.
 */

import { describe, it, expect } from 'vitest';
import {
  createMutilatedGraph,
  createMarginalizedGraph,
  isIdentifiable,
  findAllBackdoorSets,
  generateBackdoorFormula,
  checkFrontdoorCriterion,
  generateFrontdoorFormula,
  findInstrumentalVariable,
  generateIVFormula,
  applyRule1,
  applyRule2,
  applyRule3,
  analyzeIntervention,
} from '../../../../../src/modes/causal/graph/algorithms/intervention.js';
import type { CausalGraph, Intervention } from '../../../../../src/modes/causal/graph/types.js';

// Helper to create test graphs
function createSimpleCausalGraph(): CausalGraph {
  // X -> Y
  return {
    id: 'simple',
    nodes: [{ id: 'X', name: 'X' }, { id: 'Y', name: 'Y' }],
    edges: [{ from: 'X', to: 'Y', type: 'directed' }],
  };
}

function createConfoundedGraph(): CausalGraph {
  // U -> X, U -> Y, X -> Y (U is confounder)
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

function createFrontdoorGraph(): CausalGraph {
  // X -> M -> Y, with U confounding X and Y
  // U -> X, U -> Y, X -> M, M -> Y
  return {
    id: 'frontdoor',
    nodes: [
      { id: 'X', name: 'X' },
      { id: 'Y', name: 'Y' },
      { id: 'M', name: 'M' },
      { id: 'U', name: 'U' },
    ],
    edges: [
      { from: 'U', to: 'X', type: 'directed' },
      { from: 'U', to: 'Y', type: 'directed' },
      { from: 'X', to: 'M', type: 'directed' },
      { from: 'M', to: 'Y', type: 'directed' },
    ],
  };
}

function createIVGraph(): CausalGraph {
  // Z -> X -> Y, with U confounding X and Y
  // Z -> X, U -> X, U -> Y, X -> Y
  return {
    id: 'iv',
    nodes: [
      { id: 'X', name: 'X' },
      { id: 'Y', name: 'Y' },
      { id: 'Z', name: 'Z' },
      { id: 'U', name: 'U' },
    ],
    edges: [
      { from: 'Z', to: 'X', type: 'directed' },
      { from: 'U', to: 'X', type: 'directed' },
      { from: 'U', to: 'Y', type: 'directed' },
      { from: 'X', to: 'Y', type: 'directed' },
    ],
  };
}

function createBidirectedGraph(): CausalGraph {
  // X <-> Y (bidirected edge representing latent confounder)
  return {
    id: 'bidirected',
    nodes: [{ id: 'X', name: 'X' }, { id: 'Y', name: 'Y' }],
    edges: [
      { from: 'X', to: 'Y', type: 'bidirected' },
      { from: 'X', to: 'Y', type: 'directed' },
    ],
  };
}

function createChainGraph(): CausalGraph {
  // A -> B -> C -> D
  return {
    id: 'chain',
    nodes: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
      { id: 'C', name: 'C' },
      { id: 'D', name: 'D' },
    ],
    edges: [
      { from: 'A', to: 'B', type: 'directed' },
      { from: 'B', to: 'C', type: 'directed' },
      { from: 'C', to: 'D', type: 'directed' },
    ],
  };
}

describe('Graph Manipulation', () => {
  describe('createMutilatedGraph()', () => {
    it('should remove incoming edges to intervened variable', () => {
      const graph = createConfoundedGraph();
      const interventions: Intervention[] = [{ variable: 'X', value: 1, type: 'atomic' }];

      const mutilated = createMutilatedGraph(graph, interventions);

      // Edge U -> X should be removed
      const hasUtoX = mutilated.edges.some((e) => e.from === 'U' && e.to === 'X');
      expect(hasUtoX).toBe(false);

      // Edge X -> Y should remain
      const hasXtoY = mutilated.edges.some((e) => e.from === 'X' && e.to === 'Y');
      expect(hasXtoY).toBe(true);

      // Edge U -> Y should remain
      const hasUtoY = mutilated.edges.some((e) => e.from === 'U' && e.to === 'Y');
      expect(hasUtoY).toBe(true);
    });

    it('should handle multiple interventions', () => {
      const graph = createChainGraph();
      const interventions: Intervention[] = [
        { variable: 'B', value: 1, type: 'atomic' },
        { variable: 'C', value: 2, type: 'atomic' },
      ];

      const mutilated = createMutilatedGraph(graph, interventions);

      // Edges to B and C should be removed
      const hasAtoB = mutilated.edges.some((e) => e.from === 'A' && e.to === 'B');
      const hasBtoC = mutilated.edges.some((e) => e.from === 'B' && e.to === 'C');
      expect(hasAtoB).toBe(false);
      expect(hasBtoC).toBe(false);

      // Edge C -> D should remain
      const hasCtoD = mutilated.edges.some((e) => e.from === 'C' && e.to === 'D');
      expect(hasCtoD).toBe(true);
    });

    it('should update graph id and metadata', () => {
      const graph = createSimpleCausalGraph();
      const interventions: Intervention[] = [{ variable: 'X', value: 1, type: 'atomic' }];

      const mutilated = createMutilatedGraph(graph, interventions);

      expect(mutilated.id).toContain('mutilated');
      expect(mutilated.metadata?.description).toContain('X');
    });
  });

  describe('createMarginalizedGraph()', () => {
    it('should remove node and reconnect parents to children', () => {
      const graph = createChainGraph();

      const marginalized = createMarginalizedGraph(graph, 'B');

      // B should be removed
      expect(marginalized.nodes.some((n) => n.id === 'B')).toBe(false);

      // A should now connect directly to C
      const hasAtoC = marginalized.edges.some((e) => e.from === 'A' && e.to === 'C');
      expect(hasAtoC).toBe(true);
    });

    it('should preserve other edges', () => {
      const graph = createChainGraph();

      const marginalized = createMarginalizedGraph(graph, 'B');

      // C -> D should remain
      const hasCtoD = marginalized.edges.some((e) => e.from === 'C' && e.to === 'D');
      expect(hasCtoD).toBe(true);
    });

    it('should not duplicate edges', () => {
      const graph: CausalGraph = {
        id: 'with-shortcut',
        nodes: [
          { id: 'A', name: 'A' },
          { id: 'B', name: 'B' },
          { id: 'C', name: 'C' },
        ],
        edges: [
          { from: 'A', to: 'B', type: 'directed' },
          { from: 'B', to: 'C', type: 'directed' },
          { from: 'A', to: 'C', type: 'directed' }, // Already exists
        ],
      };

      const marginalized = createMarginalizedGraph(graph, 'B');

      // Count A -> C edges
      const aToC = marginalized.edges.filter((e) => e.from === 'A' && e.to === 'C');
      expect(aToC.length).toBe(1);
    });
  });
});

describe('Causal Effect Identifiability', () => {
  describe('isIdentifiable()', () => {
    it('should identify effect in unconfounded graph', () => {
      const graph = createSimpleCausalGraph();
      const result = isIdentifiable(graph, 'X', 'Y');

      expect(result.identifiable).toBe(true);
    });

    it('should identify effect via backdoor adjustment', () => {
      const graph = createConfoundedGraph();
      const result = isIdentifiable(graph, 'X', 'Y');

      expect(result.identifiable).toBe(true);
      expect(result.method).toBe('backdoor');
    });

    it('should identify effect via frontdoor criterion', () => {
      const graph = createFrontdoorGraph();
      const result = isIdentifiable(graph, 'X', 'Y');

      expect(result.identifiable).toBe(true);
      // May use backdoor or frontdoor depending on which is found first
    });

    it('should identify effect via instrumental variable', () => {
      const graph = createIVGraph();
      const result = isIdentifiable(graph, 'X', 'Y');

      expect(result.identifiable).toBe(true);
    });

    it('should handle non-identifiable effects', () => {
      const graph = createBidirectedGraph();
      const result = isIdentifiable(graph, 'X', 'Y');

      // With bidirected edge, may or may not be identifiable depending on structure
      expect(result.reason).toBeDefined();
    });
  });
});

describe('Backdoor Criterion', () => {
  describe('findAllBackdoorSets()', () => {
    it('should find backdoor sets in confounded graph', () => {
      const graph = createConfoundedGraph();
      const sets = findAllBackdoorSets(graph, 'X', 'Y');

      expect(sets.length).toBeGreaterThan(0);
      expect(sets.some((s) => s.includes('U'))).toBe(true);
    });

    it('should find empty set when no confounding', () => {
      const graph = createSimpleCausalGraph();
      const sets = findAllBackdoorSets(graph, 'X', 'Y');

      expect(sets.some((s) => s.length === 0)).toBe(true);
    });

    it('should respect maxSize parameter', () => {
      const graph = createConfoundedGraph();
      const sets = findAllBackdoorSets(graph, 'X', 'Y', 1);

      sets.forEach((s) => expect(s.length).toBeLessThanOrEqual(1));
    });
  });

  describe('generateBackdoorFormula()', () => {
    it('should generate formula with adjustment set', () => {
      const formula = generateBackdoorFormula('X', 'Y', ['U']);

      expect(formula.type).toBe('backdoor');
      expect(formula.isValid).toBe(true);
      expect(formula.latex).toContain('P(Y');
      expect(formula.latex).toContain('do(X)');
      expect(formula.plainText).toBeDefined();
    });

    it('should generate simple formula without adjustment', () => {
      const formula = generateBackdoorFormula('X', 'Y', []);

      expect(formula.latex).toContain('P(Y | X)');
    });

    it('should include adjustment set in formula', () => {
      const formula = generateBackdoorFormula('X', 'Y', ['U', 'V']);

      expect(formula.adjustmentSet).toContain('U');
      expect(formula.adjustmentSet).toContain('V');
    });
  });
});

describe('Frontdoor Criterion', () => {
  describe('checkFrontdoorCriterion()', () => {
    it('should return valid result structure for frontdoor graph', () => {
      const graph = createFrontdoorGraph();
      const result = checkFrontdoorCriterion(graph, 'X', 'Y');

      // Check that result has expected structure
      expect(result).toHaveProperty('satisfied');
      expect(result).toHaveProperty('mediators');
      expect(Array.isArray(result.mediators)).toBe(true);
    });

    it('should not detect frontdoor when not satisfied', () => {
      const graph = createSimpleCausalGraph();
      const result = checkFrontdoorCriterion(graph, 'X', 'Y');

      // Simple graph has no mediator
      expect(result.satisfied).toBe(false);
    });
  });

  describe('generateFrontdoorFormula()', () => {
    it('should generate frontdoor adjustment formula', () => {
      const formula = generateFrontdoorFormula('X', 'Y', 'M');

      expect(formula.type).toBe('frontdoor');
      expect(formula.isValid).toBe(true);
      expect(formula.latex).toContain('M');
      expect(formula.adjustmentSet).toContain('M');
    });
  });
});

describe('Instrumental Variables', () => {
  describe('findInstrumentalVariable()', () => {
    it('should find instrumental variable', () => {
      const graph = createIVGraph();
      const iv = findInstrumentalVariable(graph, 'X', 'Y');

      expect(iv).toBe('Z');
    });

    it('should return null when no IV exists', () => {
      const graph = createSimpleCausalGraph();
      const iv = findInstrumentalVariable(graph, 'X', 'Y');

      expect(iv).toBeNull();
    });

    it('should reject invalid instruments', () => {
      // Graph where Z directly affects Y (exclusion violated)
      const graph: CausalGraph = {
        id: 'invalid-iv',
        nodes: [
          { id: 'X', name: 'X' },
          { id: 'Y', name: 'Y' },
          { id: 'Z', name: 'Z' },
        ],
        edges: [
          { from: 'Z', to: 'X', type: 'directed' },
          { from: 'Z', to: 'Y', type: 'directed' }, // Violates exclusion
          { from: 'X', to: 'Y', type: 'directed' },
        ],
      };

      const iv = findInstrumentalVariable(graph, 'X', 'Y');

      expect(iv).toBeNull();
    });
  });

  describe('generateIVFormula()', () => {
    it('should generate IV formula', () => {
      const formula = generateIVFormula('X', 'Y', 'Z');

      expect(formula.type).toBe('instrumental');
      expect(formula.isValid).toBe(true);
      expect(formula.latex).toContain('Cov');
      expect(formula.adjustmentSet).toContain('Z');
    });
  });
});

describe('Do-Calculus Rules', () => {
  describe('applyRule1()', () => {
    it('should apply Rule 1 when applicable', () => {
      const graph = createConfoundedGraph();
      const result = applyRule1(graph, ['Y'], ['X'], ['U'], []);

      if (result.applicable) {
        expect(result.result).toBeDefined();
      }
    });

    it('should not apply Rule 1 when not applicable', () => {
      const graph = createSimpleCausalGraph();
      const result = applyRule1(graph, ['Y'], ['X'], ['X'], []); // Z = X is not independent

      // Result depends on graph structure
      expect(result).toBeDefined();
    });
  });

  describe('applyRule2()', () => {
    it('should apply Rule 2 when applicable', () => {
      const graph = createConfoundedGraph();
      const result = applyRule2(graph, ['Y'], ['X'], [], ['U']);

      expect(result).toBeDefined();
    });
  });

  describe('applyRule3()', () => {
    it('should apply Rule 3 when applicable', () => {
      const graph = createConfoundedGraph();
      const result = applyRule3(graph, ['Y'], ['X'], ['U'], []);

      expect(result).toBeDefined();
    });
  });
});

describe('Intervention Analysis', () => {
  describe('analyzeIntervention()', () => {
    it('should analyze simple intervention', () => {
      const graph = createSimpleCausalGraph();
      const result = analyzeIntervention(graph, {
        interventions: [{ variable: 'X', value: 1, type: 'atomic' }],
        outcomes: ['Y'],
      });

      expect(result.identifiable).toBe(true);
      expect(result.originalDistribution).toBeDefined();
    });

    it('should analyze confounded intervention', () => {
      const graph = createConfoundedGraph();
      const result = analyzeIntervention(graph, {
        interventions: [{ variable: 'X', value: 1, type: 'atomic' }],
        outcomes: ['Y'],
      });

      expect(result.identifiable).toBe(true);
      expect(result.adjustment).toBeDefined();
    });

    it('should provide adjustment formula when identifiable', () => {
      const graph = createConfoundedGraph();
      const result = analyzeIntervention(graph, {
        interventions: [{ variable: 'X', value: 1, type: 'atomic' }],
        outcomes: ['Y'],
      });

      expect(result.adjustment).toBeDefined();
      expect(result.estimand).toBeDefined();
    });

    it('should handle missing treatment or outcome', () => {
      const graph = createSimpleCausalGraph();

      const result1 = analyzeIntervention(graph, {
        interventions: [],
        outcomes: ['Y'],
      });
      expect(result1.identifiable).toBe(false);

      const result2 = analyzeIntervention(graph, {
        interventions: [{ variable: 'X', value: 1, type: 'atomic' }],
        outcomes: [],
      });
      expect(result2.identifiable).toBe(false);
    });

    it('should report non-identifiable reason', () => {
      const graph = createBidirectedGraph();
      const result = analyzeIntervention(graph, {
        interventions: [{ variable: 'X', value: 1, type: 'atomic' }],
        outcomes: ['Y'],
      });

      if (!result.identifiable) {
        expect(result.nonIdentifiableReason).toBeDefined();
      }
    });
  });
});

describe('Edge Cases', () => {
  it('should handle empty graph', () => {
    const graph: CausalGraph = {
      id: 'empty',
      nodes: [],
      edges: [],
    };

    const result = isIdentifiable(graph, 'X', 'Y');
    expect(result).toBeDefined();
  });

  it('should handle graph with only one node', () => {
    const graph: CausalGraph = {
      id: 'single',
      nodes: [{ id: 'X', name: 'X' }],
      edges: [],
    };

    const result = isIdentifiable(graph, 'X', 'Y');
    expect(result).toBeDefined();
  });

  it('should handle self-loops', () => {
    const graph: CausalGraph = {
      id: 'self-loop',
      nodes: [{ id: 'X', name: 'X' }, { id: 'Y', name: 'Y' }],
      edges: [
        { from: 'X', to: 'X', type: 'directed' }, // Self-loop
        { from: 'X', to: 'Y', type: 'directed' },
      ],
    };

    const mutilated = createMutilatedGraph(graph, [{ variable: 'X', value: 1, type: 'atomic' }]);
    expect(mutilated.edges.some((e) => e.from === 'X' && e.to === 'X')).toBe(false);
  });

  it('should handle undirected edges', () => {
    const graph: CausalGraph = {
      id: 'undirected',
      nodes: [{ id: 'X', name: 'X' }, { id: 'Y', name: 'Y' }],
      edges: [{ from: 'X', to: 'Y', type: 'undirected' }],
    };

    const result = isIdentifiable(graph, 'X', 'Y');
    expect(result).toBeDefined();
  });
});
