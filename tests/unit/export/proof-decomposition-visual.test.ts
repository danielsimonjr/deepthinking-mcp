/**
 * Tests for Proof Decomposition Visual Export - Phase 8 Sprint 4
 */

import { describe, it, expect } from 'vitest';
import { exportProofDecomposition } from '../../../src/export/visual/proof-decomposition.js';
import type { ProofDecomposition, AtomicStatement, DependencyGraph } from '../../../src/types/modes/mathematics.js';

describe('Proof Decomposition Visual Export', () => {
  /**
   * Helper to create a mock ProofDecomposition
   */
  function createMockDecomposition(): ProofDecomposition {
    const atoms: AtomicStatement[] = [
      { id: 'a1', statement: 'Let n be an even integer', type: 'hypothesis', confidence: 1, isExplicit: true },
      { id: 'a2', statement: 'By definition, n = 2k for some integer k', type: 'derived', confidence: 1, derivedFrom: ['a1'], isExplicit: true },
      { id: 'a3', statement: 'Then n² = 4k² = 2(2k²)', type: 'derived', confidence: 1, derivedFrom: ['a2'], usedInferenceRule: 'algebraic_manipulation', isExplicit: true },
      { id: 'a4', statement: 'Therefore n² is even', type: 'conclusion', confidence: 1, derivedFrom: ['a3'], isExplicit: true },
    ];

    const nodes = new Map<string, AtomicStatement>();
    for (const atom of atoms) {
      nodes.set(atom.id, atom);
    }

    const dependencies: DependencyGraph = {
      nodes,
      edges: [
        { from: 'a1', to: 'a2', type: 'logical', strength: 1 },
        { from: 'a2', to: 'a3', type: 'computational', strength: 1 },
        { from: 'a3', to: 'a4', type: 'logical', strength: 1 },
      ],
      roots: ['a1'],
      leaves: ['a4'],
      hasCycles: false,
    };

    return {
      id: 'proof-1',
      originalProof: 'Let n be even. Then n = 2k. So n² = 4k² = 2(2k²). Thus n² is even.',
      theorem: 'If n is even, then n² is even',
      atoms,
      dependencies,
      assumptionChains: [],
      gaps: [],
      implicitAssumptions: [],
      completeness: 0.95,
      rigorLevel: 'textbook',
      atomCount: 4,
      maxDependencyDepth: 3,
    };
  }

  describe('Mermaid Export', () => {
    it('should export to Mermaid format', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'mermaid' });

      expect(result).toContain('graph TD');
      expect(result).toContain('Hypotheses');
      expect(result).toContain('Conclusions');
    });

    it('should include theorem in title', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'mermaid' });

      expect(result).toContain('Proof:');
    });

    it('should include edges with labels', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'mermaid', includeLabels: true });

      expect(result).toContain('-->');
    });

    it('should include metrics when requested', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'mermaid', includeMetrics: true });

      expect(result).toContain('Metrics');
      expect(result).toContain('Completeness');
    });

    it('should apply color scheme', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'mermaid', colorScheme: 'default' });

      expect(result).toContain('style');
      expect(result).toContain('fill:');
    });

    it('should handle monochrome color scheme', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'mermaid', colorScheme: 'monochrome' });

      // Should not have colored styles
      expect(result).not.toContain('#81c784'); // green
    });
  });

  describe('DOT Export', () => {
    it('should export to DOT format', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'dot' });

      expect(result).toContain('digraph ProofDecomposition');
      expect(result).toContain('rankdir=TB');
      expect(result).toContain('}');
    });

    it('should include clusters for statement types', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'dot' });

      expect(result).toContain('cluster_hypotheses');
      expect(result).toContain('cluster_conclusions');
    });

    it('should include edges', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'dot' });

      expect(result).toContain('->');
    });

    it('should include node shapes', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'dot' });

      expect(result).toContain('shape=');
    });

    it('should include metrics when requested', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'dot', includeMetrics: true });

      expect(result).toContain('cluster_metrics');
      expect(result).toContain('Completeness');
    });
  });

  describe('ASCII Export', () => {
    it('should export to ASCII format', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'ascii' });

      expect(result).toContain('PROOF DECOMPOSITION');
      expect(result).toContain('METRICS');
    });

    it('should include section markers', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'ascii' });

      expect(result).toContain('HYPOTHESES');
      expect(result).toContain('CONCLUSIONS');
    });

    it('should include statement markers', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'ascii' });

      // Should contain markers like ◆ for hypothesis, ★ for conclusion
      expect(result).toMatch(/[◆◉○★]/);
    });

    it('should show derivation chain', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'ascii' });

      expect(result).toContain('DERIVATION CHAIN');
    });

    it('should show dependency tree', () => {
      const decomposition = createMockDecomposition();
      const result = exportProofDecomposition(decomposition, { format: 'ascii' });

      expect(result).toContain('DEPENDENCY TREE');
    });
  });

  describe('With Gaps', () => {
    it('should show gaps in Mermaid format', () => {
      const decomposition = createMockDecomposition();
      decomposition.gaps = [
        {
          id: 'gap1',
          type: 'missing_step',
          location: { from: 'a2', to: 'a3' },
          description: 'Missing justification for squaring',
          severity: 'minor',
        },
      ];

      const result = exportProofDecomposition(decomposition, { format: 'mermaid' });

      expect(result).toContain('Gaps');
      expect(result).toContain('Missing');
    });

    it('should show gaps in DOT format', () => {
      const decomposition = createMockDecomposition();
      decomposition.gaps = [
        {
          id: 'gap1',
          type: 'unjustified_leap',
          location: { from: 'a2', to: 'a3' },
          description: 'Jump in logic',
          severity: 'significant',
        },
      ];

      const result = exportProofDecomposition(decomposition, { format: 'dot' });

      expect(result).toContain('dashed');
      expect(result).toContain('red');
    });

    it('should show gaps in ASCII format', () => {
      const decomposition = createMockDecomposition();
      decomposition.gaps = [
        {
          id: 'gap1',
          type: 'implicit_assumption',
          location: { from: 'a1', to: 'a2' },
          description: 'Implicit domain assumption',
          severity: 'critical',
          suggestedFix: 'State that k is an integer explicitly',
        },
      ];

      const result = exportProofDecomposition(decomposition, { format: 'ascii' });

      expect(result).toContain('GAPS');
      expect(result).toContain('Fix:');
    });
  });

  describe('With Implicit Assumptions', () => {
    it('should show implicit assumptions in ASCII', () => {
      const decomposition = createMockDecomposition();
      decomposition.implicitAssumptions = [
        {
          id: 'imp1',
          statement: 'k is an integer',
          type: 'existence_assumption',
          usedInStep: 'a2',
          shouldBeExplicit: true,
          suggestedFormulation: 'Let k be an integer such that n = 2k',
        },
      ];

      const result = exportProofDecomposition(decomposition, { format: 'ascii' });

      expect(result).toContain('IMPLICIT ASSUMPTIONS');
      expect(result).toContain('existence_assumption');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty atoms array', () => {
      const decomposition = createMockDecomposition();
      decomposition.atoms = [];
      decomposition.dependencies.nodes = new Map();
      decomposition.dependencies.edges = [];

      const result = exportProofDecomposition(decomposition, { format: 'mermaid' });

      expect(result).toContain('graph TD');
    });

    it('should handle missing theorem', () => {
      const decomposition = createMockDecomposition();
      decomposition.theorem = undefined;

      const result = exportProofDecomposition(decomposition, { format: 'mermaid' });

      expect(result).not.toContain('undefined');
    });

    it('should handle unsupported format', () => {
      const decomposition = createMockDecomposition();

      expect(() => {
        exportProofDecomposition(decomposition, { format: 'invalid' as any });
      }).toThrow('Unsupported format');
    });
  });
});
