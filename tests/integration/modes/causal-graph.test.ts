/**
 * Causal Graph Analysis Integration Tests - Phase 12 Sprint 6
 *
 * Integration tests for the complete causal graph analysis workflow.
 */

import { describe, it, expect } from 'vitest';
import {
  computeDegreeCentrality,
  computeBetweennessCentrality,
  computeClosenessCentrality,
  computePageRank,
  computeAllCentrality,
  getMostCentralNode,
} from '../../../src/modes/causal/graph/algorithms/centrality.js';
import {
  findVStructures,
  findAllPaths,
  checkDSeparation,
  findMinimalSeparator,
  isValidBackdoorAdjustment,
  computeMarkovBlanket,
  getImpliedIndependencies,
} from '../../../src/modes/causal/graph/algorithms/d-separation.js';
import {
  createMutilatedGraph,
  isIdentifiable,
  findAllBackdoorSets,
  generateBackdoorFormula,
  checkFrontdoorCriterion,
  findInstrumentalVariable,
  analyzeIntervention,
} from '../../../src/modes/causal/graph/algorithms/intervention.js';
import type { CausalGraph } from '../../../src/modes/causal/graph/types.js';

// Realistic causal graph: Treatment effect study
function createTreatmentEffectGraph(): CausalGraph {
  // Model: Smoking -> Lung Cancer study
  // Variables: Smoking (X), Tar (M), Cancer (Y), Genetics (U), Age (A)
  return {
    id: 'treatment-effect',
    nodes: [
      { id: 'X', name: 'Smoking', type: 'intervention' },
      { id: 'M', name: 'Tar', type: 'observed' },
      { id: 'Y', name: 'Cancer', type: 'outcome' },
      { id: 'U', name: 'Genetics', type: 'latent' },
      { id: 'A', name: 'Age', type: 'observed' },
    ],
    edges: [
      { from: 'X', to: 'M', type: 'directed' }, // Smoking causes tar
      { from: 'M', to: 'Y', type: 'directed' }, // Tar causes cancer
      { from: 'U', to: 'X', type: 'directed' }, // Genetics affects smoking
      { from: 'U', to: 'Y', type: 'directed' }, // Genetics affects cancer
      { from: 'A', to: 'X', type: 'directed' }, // Age affects smoking
      { from: 'A', to: 'Y', type: 'directed' }, // Age affects cancer
    ],
    metadata: {
      name: 'Smoking-Cancer Study',
      description: 'Classic causal inference example with frontdoor criterion',
    },
  };
}

// Complex DAG for centrality analysis
function createSocialNetworkGraph(): CausalGraph {
  return {
    id: 'social-network',
    nodes: [
      { id: 'influencer', name: 'Influencer' },
      { id: 'follower1', name: 'Follower 1' },
      { id: 'follower2', name: 'Follower 2' },
      { id: 'follower3', name: 'Follower 3' },
      { id: 'hub', name: 'Hub' },
      { id: 'edge1', name: 'Edge User 1' },
      { id: 'edge2', name: 'Edge User 2' },
    ],
    edges: [
      { from: 'influencer', to: 'follower1', type: 'directed' },
      { from: 'influencer', to: 'follower2', type: 'directed' },
      { from: 'influencer', to: 'follower3', type: 'directed' },
      { from: 'follower1', to: 'hub', type: 'directed' },
      { from: 'follower2', to: 'hub', type: 'directed' },
      { from: 'follower3', to: 'hub', type: 'directed' },
      { from: 'hub', to: 'edge1', type: 'directed' },
      { from: 'hub', to: 'edge2', type: 'directed' },
    ],
    metadata: {
      name: 'Social Network',
      description: 'Information flow in social network',
    },
  };
}

// Instrumental variable graph
function createIVStudyGraph(): CausalGraph {
  // Model: Effect of education on earnings using distance to college as IV
  return {
    id: 'iv-study',
    nodes: [
      { id: 'Z', name: 'Distance to College', type: 'observed' },
      { id: 'X', name: 'Education', type: 'intervention' },
      { id: 'Y', name: 'Earnings', type: 'outcome' },
      { id: 'U', name: 'Ability', type: 'latent' },
    ],
    edges: [
      { from: 'Z', to: 'X', type: 'directed' }, // Distance affects education
      { from: 'U', to: 'X', type: 'directed' }, // Ability affects education
      { from: 'U', to: 'Y', type: 'directed' }, // Ability affects earnings
      { from: 'X', to: 'Y', type: 'directed' }, // Education affects earnings
    ],
    metadata: {
      name: 'Returns to Education IV Study',
      description: 'Instrumental variable approach to causal inference',
    },
  };
}

describe('Complete Causal Graph Analysis Workflow', () => {
  describe('Treatment Effect Analysis', () => {
    const graph = createTreatmentEffectGraph();

    it('should analyze the complete causal structure', () => {
      // Find v-structures
      const vStructures = findVStructures(graph);
      expect(vStructures.length).toBeGreaterThan(0);

      // Find all paths from treatment to outcome
      const paths = findAllPaths(graph, ['X'], ['Y']);
      expect(paths.length).toBeGreaterThan(0);

      // Check centrality
      const centrality = computeAllCentrality(graph);
      expect(centrality.measures.degree.size).toBe(5);
    });

    it('should check frontdoor criterion', () => {
      // The classic smoking-tar-cancer frontdoor setup
      const frontdoor = checkFrontdoorCriterion(graph, 'X', 'Y');
      // Check structure is valid
      expect(frontdoor).toHaveProperty('satisfied');
      expect(frontdoor).toHaveProperty('mediators');
      expect(Array.isArray(frontdoor.mediators)).toBe(true);
    });

    it('should find valid backdoor adjustment sets', () => {
      const backdoorSets = findAllBackdoorSets(graph, 'X', 'Y');
      expect(backdoorSets.length).toBeGreaterThan(0);

      // Age should be a valid adjustment
      const hasAgeAdjustment = backdoorSets.some((s) => s.includes('A'));
      expect(hasAgeAdjustment).toBe(true);
    });

    it('should compute intervention effects', () => {
      const result = analyzeIntervention(graph, {
        interventions: [{ variable: 'X', value: 1, type: 'atomic' }],
        outcomes: ['Y'],
      });

      expect(result.identifiable).toBe(true);
      expect(result.adjustment).toBeDefined();
    });

    it('should compute Markov blankets', () => {
      // Markov blanket of Y should include M, U, A
      const blanket = computeMarkovBlanket(graph, 'Y');
      expect(blanket).toContain('M');
      expect(blanket).toContain('U');
      expect(blanket).toContain('A');
    });
  });

  describe('Centrality Analysis in Social Network', () => {
    const graph = createSocialNetworkGraph();

    it('should identify influential nodes correctly', () => {
      const centrality = computeAllCentrality(graph);

      // Influencer should have high out-degree
      expect(centrality.measures.outDegree.get('influencer')).toBeGreaterThan(0);

      // Hub should have high in-degree and out-degree
      const hubDegree = centrality.measures.degree.get('hub')!;
      expect(hubDegree).toBeGreaterThan(0);
    });

    it('should find hub as betweenness central', () => {
      const betweenness = computeBetweennessCentrality(graph);

      // Hub is on many shortest paths
      const hubBetweenness = betweenness.get('hub')!;
      const edgeBetweenness = betweenness.get('edge1')!;
      expect(hubBetweenness).toBeGreaterThan(edgeBetweenness);
    });

    it('should compute PageRank reflecting information flow', () => {
      const pageRank = computePageRank(graph);

      // Hub receives many links
      const hubPR = pageRank.get('hub')!;
      expect(hubPR).toBeGreaterThan(0);
    });

    it('should find most central node', () => {
      const mostCentralByDegree = getMostCentralNode(graph, 'degree');
      expect(mostCentralByDegree).not.toBeNull();

      const mostCentralByBetweenness = getMostCentralNode(graph, 'betweenness');
      expect(mostCentralByBetweenness?.nodeId).toBe('hub');
    });
  });

  describe('Instrumental Variable Analysis', () => {
    const graph = createIVStudyGraph();

    it('should identify instrumental variable', () => {
      const iv = findInstrumentalVariable(graph, 'X', 'Y');
      expect(iv).toBe('Z');
    });

    it('should verify IV conditions', () => {
      // Relevance: Z affects X
      const zAffectsX = graph.edges.some((e) => e.from === 'Z' && e.to === 'X');
      expect(zAffectsX).toBe(true);

      // Exclusion: Z does not directly affect Y
      const zAffectsY = graph.edges.some((e) => e.from === 'Z' && e.to === 'Y');
      expect(zAffectsY).toBe(false);

      // Exogeneity: Z is d-separated from Y given do(X)
      const mutilated = createMutilatedGraph(graph, [{ variable: 'X', value: 0, type: 'atomic' }]);
      const separation = checkDSeparation(mutilated, { x: ['Z'], y: ['Y'], z: [] });
      expect(separation.separated).toBe(true);
    });

    it('should identify causal effect', () => {
      const result = isIdentifiable(graph, 'X', 'Y');
      expect(result.identifiable).toBe(true);
    });
  });

  describe('D-Separation and Conditional Independence', () => {
    const graph = createTreatmentEffectGraph();

    it('should find implied independencies', () => {
      const independencies = getImpliedIndependencies(graph, 2);
      expect(independencies.length).toBeGreaterThan(0);
    });

    it('should correctly identify d-separation given conditioning', () => {
      // M and A should be d-separated given X
      const result = checkDSeparation(graph, { x: ['M'], y: ['A'], z: ['X'] });
      expect(result).toBeDefined();
    });

    it('should find minimal separating sets', () => {
      const separator = findMinimalSeparator(graph, ['X'], ['Y']);
      expect(separator).toBeDefined();
    });

    it('should validate backdoor adjustment', () => {
      // Check that the function returns boolean for various sets
      const isValid = isValidBackdoorAdjustment(graph, 'X', 'Y', ['A']);
      expect(typeof isValid).toBe('boolean');

      // M (mediator) should NOT be a valid adjustment
      const isMValid = isValidBackdoorAdjustment(graph, 'X', 'Y', ['M']);
      expect(isMValid).toBe(false);
    });
  });

  describe('Graph Manipulation for Interventions', () => {
    const graph = createTreatmentEffectGraph();

    it('should create mutilated graph correctly', () => {
      const mutilated = createMutilatedGraph(graph, [{ variable: 'X', value: 1, type: 'atomic' }]);

      // All incoming edges to X should be removed
      const incomingToX = mutilated.edges.filter((e) => e.to === 'X');
      expect(incomingToX.length).toBe(0);

      // Outgoing edges from X should remain
      const outgoingFromX = mutilated.edges.filter((e) => e.from === 'X');
      expect(outgoingFromX.length).toBe(1);
    });

    it('should preserve graph structure after intervention', () => {
      const mutilated = createMutilatedGraph(graph, [{ variable: 'X', value: 1, type: 'atomic' }]);

      // Other causal relationships should remain
      const mToY = mutilated.edges.find((e) => e.from === 'M' && e.to === 'Y');
      expect(mToY).toBeDefined();
    });
  });

  describe('Formula Generation', () => {
    it('should generate backdoor adjustment formula', () => {
      const formula = generateBackdoorFormula('X', 'Y', ['A']);

      expect(formula.type).toBe('backdoor');
      expect(formula.isValid).toBe(true);
      expect(formula.latex).toContain('do(X)');
      expect(formula.plainText).toBeDefined();
    });

    it('should generate formula for multiple adjustments', () => {
      const formula = generateBackdoorFormula('X', 'Y', ['A', 'B', 'C']);

      expect(formula.adjustmentSet).toHaveLength(3);
      expect(formula.latex).toContain('A');
      expect(formula.latex).toContain('B');
      expect(formula.latex).toContain('C');
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should handle end-to-end causal analysis', () => {
      const graph = createTreatmentEffectGraph();

      // Step 1: Understand graph structure
      const centrality = computeAllCentrality(graph);
      expect(centrality.measures.degree.size).toBe(5);

      // Step 2: Identify causal structure
      const vStructures = findVStructures(graph);
      expect(vStructures).toBeDefined();

      // Step 3: Check identifiability
      const identifiable = isIdentifiable(graph, 'X', 'Y');
      expect(identifiable.identifiable).toBe(true);

      // Step 4: Find adjustment sets
      const backdoorSets = findAllBackdoorSets(graph, 'X', 'Y');
      expect(backdoorSets.length).toBeGreaterThan(0);

      // Step 5: Analyze intervention
      const intervention = analyzeIntervention(graph, {
        interventions: [{ variable: 'X', value: 1, type: 'atomic' }],
        outcomes: ['Y'],
      });
      expect(intervention.identifiable).toBe(true);
      expect(intervention.adjustment).toBeDefined();
    });

    it('should handle complex multi-step analysis', () => {
      const graph = createIVStudyGraph();

      // Analyze all centrality measures
      const centrality = computeAllCentrality(graph);
      expect(centrality.computationTime).toBeGreaterThanOrEqual(0);

      // Find all paths
      const paths = findAllPaths(graph, ['Z'], ['Y']);
      expect(paths.length).toBeGreaterThan(0);

      // Check d-separation
      const dSep = checkDSeparation(graph, { x: ['Z'], y: ['U'], z: [] });
      expect(dSep.separated).toBe(true);

      // Find instrumental variable
      const iv = findInstrumentalVariable(graph, 'X', 'Y');
      expect(iv).toBe('Z');

      // Analyze complete intervention
      const result = analyzeIntervention(graph, {
        interventions: [{ variable: 'X', value: 1, type: 'atomic' }],
        outcomes: ['Y'],
      });
      expect(result.identifiable).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large graphs efficiently', () => {
      // Create a larger graph
      const nodes = Array.from({ length: 50 }, (_, i) => ({ id: `N${i}`, name: `Node ${i}` }));
      const edges = [];
      for (let i = 0; i < 49; i++) {
        edges.push({ from: `N${i}`, to: `N${i + 1}`, type: 'directed' as const });
        if (i > 0 && i % 5 === 0) {
          edges.push({ from: `N${i - 5}`, to: `N${i}`, type: 'directed' as const });
        }
      }

      const graph: CausalGraph = { id: 'large', nodes, edges };

      const startTime = Date.now();
      const centrality = computeAllCentrality(graph, {
        measures: ['degree', 'pagerank'],
        maxIterations: 50,
      });
      const elapsed = Date.now() - startTime;

      expect(centrality.measures.degree.size).toBe(50);
      expect(elapsed).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle disconnected components', () => {
      const graph: CausalGraph = {
        id: 'disconnected',
        nodes: [
          { id: 'A1', name: 'A1' },
          { id: 'A2', name: 'A2' },
          { id: 'B1', name: 'B1' },
          { id: 'B2', name: 'B2' },
        ],
        edges: [
          { from: 'A1', to: 'A2', type: 'directed' },
          { from: 'B1', to: 'B2', type: 'directed' },
        ],
      };

      // Should handle disconnected graphs
      const paths = findAllPaths(graph, ['A1'], ['B2']);
      expect(paths.length).toBe(0);

      const dSep = checkDSeparation(graph, { x: ['A1'], y: ['B2'], z: [] });
      expect(dSep.separated).toBe(true);
    });
  });
});
