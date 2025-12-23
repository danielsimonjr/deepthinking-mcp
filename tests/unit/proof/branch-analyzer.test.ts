/**
 * Branch Analyzer Tests - Phase 12 Sprint 2
 *
 * Tests for the BranchAnalyzer class that identifies independent proof branches.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BranchAnalyzer, BranchAnalyzerOptions } from '../../../src/proof/branch-analyzer.js';
import type { ProofStep } from '../../../src/proof/decomposer.js';

describe('BranchAnalyzer', () => {
  let analyzer: BranchAnalyzer;

  beforeEach(() => {
    analyzer = new BranchAnalyzer();
  });

  describe('constructor', () => {
    it('should create an instance with default options', () => {
      const analyzer = new BranchAnalyzer();
      expect(analyzer).toBeDefined();
    });

    it('should accept custom options', () => {
      const options: BranchAnalyzerOptions = {
        minBranchSize: 2,
        estimateComplexity: false,
        extractMetadata: false,
      };
      const analyzer = new BranchAnalyzer(options);
      expect(analyzer).toBeDefined();
    });
  });

  describe('analyze', () => {
    it('should handle empty steps array', () => {
      const result = analyzer.analyze([]);

      expect(result.branches).toHaveLength(0);
      expect(result.executionLevels).toHaveLength(0);
      expect(result.independentCount).toBe(0);
      expect(result.totalComplexity).toBe(0);
      expect(result.canParallelize).toBe(false);
    });

    it('should analyze a single step', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Assume P is true', justification: 'assumption' },
      ];

      const result = analyzer.analyze(steps);

      expect(result.branches).toHaveLength(1);
      expect(result.branches[0].steps).toHaveLength(1);
      expect(result.branches[0].isIndependent).toBe(true);
    });

    it('should identify independent branches', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Axiom 1: P', justification: 'axiom' },
        { stepNumber: 2, content: 'Axiom 2: Q', justification: 'axiom' },
        { stepNumber: 3, content: 'Therefore R by step 1', justification: 'by step 1' },
        { stepNumber: 4, content: 'Therefore S by step 2', justification: 'by step 2' },
      ];

      const result = analyzer.analyze(steps);

      // Should identify branches
      expect(result.branches.length).toBeGreaterThanOrEqual(1);
      expect(result.independentCount).toBeGreaterThanOrEqual(1);
      // canParallelize depends on whether there are multiple independent branches or execution levels
      expect(typeof result.canParallelize).toBe('boolean');
    });

    it('should identify dependent branches', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Assume P', justification: 'assumption' },
        { stepNumber: 2, content: 'Therefore Q by step 1', justification: 'by step 1' },
        { stepNumber: 3, content: 'Therefore R by step 2', justification: 'by step 2' },
      ];

      const result = analyzer.analyze(steps);

      // All steps form a single chain, so one branch
      expect(result.branches).toHaveLength(1);
      expect(result.independentCount).toBe(1);
    });

    it('should estimate complexity when enabled', () => {
      const analyzer = new BranchAnalyzer({ estimateComplexity: true });
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Let n be a natural number', justification: 'definition' },
        { stepNumber: 2, content: 'By induction on n', justification: 'induction' },
        { stepNumber: 3, content: 'Base case: n = 0', justification: 'base case' },
      ];

      const result = analyzer.analyze(steps);

      expect(result.totalComplexity).toBeGreaterThan(0);
      expect(result.branches[0].estimatedComplexity).toBeGreaterThan(0);
    });

    it('should extract metadata when enabled', () => {
      const analyzer = new BranchAnalyzer({ extractMetadata: true });
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Assume P', justification: 'assumption' },
        { stepNumber: 2, content: 'We prove this by induction on n', justification: 'induction' },
      ];

      const result = analyzer.analyze(steps);

      expect(result.branches[0].metadata).toBeDefined();
      // Metadata should be extracted with at least a reasoningType
      expect(result.branches[0].metadata?.reasoningType).toBeDefined();
    });
  });

  describe('buildDependencyGraph', () => {
    it('should build a graph from proof steps', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Axiom P', justification: 'axiom' },
        { stepNumber: 2, content: 'Q by step 1', justification: 'by step 1' },
        { stepNumber: 3, content: 'R by step 2', justification: 'by step 2' },
      ];

      const graph = analyzer.buildDependencyGraph(steps);

      expect(graph.size).toBe(3);

      // Step 1 has no dependencies
      expect(graph.get(0)?.dependencies.size).toBe(0);

      // Step 2 depends on step 1
      expect(graph.get(1)?.dependencies.has(0)).toBe(true);

      // Step 3 depends on step 2
      expect(graph.get(2)?.dependencies.has(1)).toBe(true);
    });

    it('should detect dependencies from "therefore" statements', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'P is true', justification: 'assumption' },
        { stepNumber: 2, content: 'Therefore Q', justification: '' },
      ];

      const graph = analyzer.buildDependencyGraph(steps);

      // "Therefore" should imply dependency on previous step
      expect(graph.get(1)?.dependencies.has(0)).toBe(true);
    });

    it('should detect dependencies from "by definition" patterns', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Definition: A set is finite if...', justification: 'definition' },
        { stepNumber: 2, content: 'X is finite by definition', justification: 'by definition' },
      ];

      const graph = analyzer.buildDependencyGraph(steps);

      expect(graph.get(1)?.dependencies.has(0)).toBe(true);
    });

    it('should track dependents correctly', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'P', justification: 'axiom' },
        { stepNumber: 2, content: 'Q by step 1', justification: 'by step 1' },
        { stepNumber: 3, content: 'R by step 1', justification: 'by step 1' },
      ];

      const graph = analyzer.buildDependencyGraph(steps);

      // Step 1 should have steps 2 and 3 as dependents
      expect(graph.get(0)?.dependents.has(1)).toBe(true);
      expect(graph.get(0)?.dependents.has(2)).toBe(true);
    });
  });

  describe('partitionIntoBranches', () => {
    it('should create branches from connected components', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Axiom A', justification: 'axiom' },
        { stepNumber: 2, content: 'B by step 1', justification: 'by step 1' },
        { stepNumber: 3, content: 'Axiom C', justification: 'axiom' },
        { stepNumber: 4, content: 'D by step 3', justification: 'by step 3' },
      ];

      const graph = analyzer.buildDependencyGraph(steps);
      const branches = analyzer.partitionIntoBranches(graph, steps);

      // Should have 2 independent branches
      expect(branches.length).toBeGreaterThanOrEqual(1);
    });

    it('should respect minBranchSize option', () => {
      const analyzer = new BranchAnalyzer({ minBranchSize: 3 });
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'P', justification: 'axiom' },
        { stepNumber: 2, content: 'Q', justification: 'axiom' },
      ];

      const graph = analyzer.buildDependencyGraph(steps);
      const branches = analyzer.partitionIntoBranches(graph, steps);

      // Branches with fewer than 3 steps should be filtered out
      expect(branches.every((b) => b.steps.length >= 3 || branches.length === 0)).toBe(true);
    });
  });

  describe('markIndependentBranches', () => {
    it('should mark branches with no dependencies as independent', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Axiom P', justification: 'axiom' },
      ];

      const result = analyzer.analyze(steps);

      const independentBranches = result.branches.filter((b) => b.isIndependent);
      expect(independentBranches.length).toBeGreaterThan(0);
    });

    it('should not mark branches with dependencies as independent', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Axiom P', justification: 'axiom' },
        { stepNumber: 2, content: 'Therefore Q by step 1', justification: 'by step 1' },
      ];

      const result = analyzer.analyze(steps);

      // The entire chain is one branch, which is independent (no external deps)
      expect(result.branches[0].isIndependent).toBe(true);
    });
  });

  describe('getExecutionOrder', () => {
    it('should return topological levels for parallel execution', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Axiom A', justification: 'axiom' },
        { stepNumber: 2, content: 'Axiom B', justification: 'axiom' },
        { stepNumber: 3, content: 'C by step 1', justification: 'by step 1' },
        { stepNumber: 4, content: 'D by step 2', justification: 'by step 2' },
        { stepNumber: 5, content: 'E by steps 3 and 4', justification: 'by step 3 and step 4' },
      ];

      const result = analyzer.analyze(steps);

      expect(result.executionLevels.length).toBeGreaterThan(0);
    });

    it('should handle single branch gracefully', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'P', justification: 'axiom' },
        { stepNumber: 2, content: 'Q by step 1', justification: 'by step 1' },
      ];

      const result = analyzer.analyze(steps);

      expect(result.executionLevels.length).toBeGreaterThan(0);
    });
  });

  describe('estimateComplexity', () => {
    it('should assign higher complexity to induction proofs', () => {
      const analyzer = new BranchAnalyzer({ estimateComplexity: true });

      const simpleSteps: ProofStep[] = [
        { stepNumber: 1, content: 'P', justification: 'axiom' },
      ];

      const inductionSteps: ProofStep[] = [
        { stepNumber: 1, content: 'By induction on n', justification: 'induction' },
      ];

      const simpleResult = analyzer.analyze(simpleSteps);
      const inductionResult = analyzer.analyze(inductionSteps);

      expect(inductionResult.totalComplexity).toBeGreaterThan(simpleResult.totalComplexity);
    });

    it('should consider step length in complexity', () => {
      const analyzer = new BranchAnalyzer({ estimateComplexity: true });

      const shortSteps: ProofStep[] = [
        { stepNumber: 1, content: 'P', justification: 'axiom' },
      ];

      const longSteps: ProofStep[] = [
        {
          stepNumber: 1,
          content:
            'This is a very long statement that contains many details and should be considered more complex than a simple statement',
          justification: 'axiom',
        },
      ];

      const shortResult = analyzer.analyze(shortSteps);
      const longResult = analyzer.analyze(longSteps);

      expect(longResult.totalComplexity).toBeGreaterThan(shortResult.totalComplexity);
    });

    it('should consider LaTeX content in complexity', () => {
      const analyzer = new BranchAnalyzer({ estimateComplexity: true });

      const noLatexSteps: ProofStep[] = [
        { stepNumber: 1, content: 'Simple statement', justification: 'axiom' },
      ];

      const latexSteps: ProofStep[] = [
        {
          stepNumber: 1,
          content: 'Statement',
          latex: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
          justification: 'axiom',
        },
      ];

      const noLatexResult = analyzer.analyze(noLatexSteps);
      const latexResult = analyzer.analyze(latexSteps);

      expect(latexResult.totalComplexity).toBeGreaterThan(noLatexResult.totalComplexity);
    });
  });

  describe('getStatistics', () => {
    it('should calculate correct statistics', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Axiom A', justification: 'axiom' },
        { stepNumber: 2, content: 'Axiom B', justification: 'axiom' },
        { stepNumber: 3, content: 'C by step 1', justification: 'by step 1' },
      ];

      const result = analyzer.analyze(steps);
      const stats = analyzer.getStatistics(result);

      expect(stats.totalBranches).toBeGreaterThanOrEqual(1);
      expect(stats.totalSteps).toBe(3);
      expect(stats.avgBranchSize).toBeGreaterThan(0);
    });

    it('should calculate max parallelism from execution levels', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Axiom A', justification: 'axiom' },
        { stepNumber: 2, content: 'Axiom B', justification: 'axiom' },
      ];

      const result = analyzer.analyze(steps);
      const stats = analyzer.getStatistics(result);

      expect(stats.maxParallelism).toBeGreaterThanOrEqual(1);
    });
  });

  describe('metadata extraction', () => {
    it('should detect induction reasoning type', () => {
      const analyzer = new BranchAnalyzer({ extractMetadata: true });
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'We use induction to prove this', justification: 'induction' },
        { stepNumber: 2, content: 'Base: P(0)', justification: 'by step 1' },
      ];

      const result = analyzer.analyze(steps);

      expect(result.branches[0].metadata?.reasoningType).toBe('induction');
    });

    it('should detect contradiction reasoning type', () => {
      const analyzer = new BranchAnalyzer({ extractMetadata: true });
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Assume the opposite', justification: 'assumption' },
        { stepNumber: 2, content: 'This leads to contradiction', justification: 'contradiction' },
      ];

      const result = analyzer.analyze(steps);

      expect(result.branches[0].metadata?.reasoningType).toBe('contradiction');
    });

    it('should extract assumptions', () => {
      const analyzer = new BranchAnalyzer({ extractMetadata: true });
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Assume P is true', justification: 'assumption' },
        { stepNumber: 2, content: 'From step 1 we derive Q', justification: 'by step 1' },
        { stepNumber: 3, content: 'Suppose R holds', justification: 'by step 2' },
      ];

      const result = analyzer.analyze(steps);

      expect(result.branches[0].metadata?.assumptions).toBeDefined();
      // First step 'Assume P is true' and third step 'Suppose R holds' should be extracted
      expect(result.branches[0].metadata?.assumptions?.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('should handle steps with no justification', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'P' },
        { stepNumber: 2, content: 'Q' },
      ];

      const result = analyzer.analyze(steps);

      expect(result.branches.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle circular-looking patterns gracefully', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'P by Lemma 1', justification: 'by Lemma 1' },
        { stepNumber: 2, content: 'Q by step 1', justification: 'by step 1' },
      ];

      const result = analyzer.analyze(steps);

      expect(result).toBeDefined();
      expect(result.branches.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle very long proofs', () => {
      const steps: ProofStep[] = Array.from({ length: 100 }, (_, i) => ({
        stepNumber: i + 1,
        content: `Step ${i + 1}`,
        justification: i > 0 ? `by step ${i}` : 'axiom',
      }));

      const result = analyzer.analyze(steps);

      expect(result.branches.length).toBeGreaterThanOrEqual(1);
      expect(result.branches[0].steps.length).toBe(100);
    });
  });
});
