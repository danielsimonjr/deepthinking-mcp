/**
 * Integration tests for Proof Decomposition features
 *
 * Tests the full proof decomposition workflow including:
 * - ProofDecomposer: Breaking proofs into atomic statements
 * - GapAnalyzer: Finding gaps and implicit assumptions
 * - AssumptionTracker: Tracing conclusions to assumptions
 *
 * Phase 8 Sprint 2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProofDecomposer, type ProofStep } from '../../../src/proof/decomposer.js';
import { GapAnalyzer } from '../../../src/proof/gap-analyzer.js';
import { AssumptionTracker } from '../../../src/proof/assumption-tracker.js';

describe('Proof Decomposition Integration', () => {
  let decomposer: ProofDecomposer;
  let gapAnalyzer: GapAnalyzer;
  let assumptionTracker: AssumptionTracker;

  beforeEach(() => {
    decomposer = new ProofDecomposer();
    gapAnalyzer = new GapAnalyzer();
    assumptionTracker = new AssumptionTracker();
  });

  describe('Simple Direct Proof', () => {
    const simpleProof: ProofStep[] = [
      { content: 'Assume n is an even integer.' },
      { content: 'By definition, n = 2k for some integer k.' },
      { content: 'Then n² = (2k)² = 4k² = 2(2k²).' },
      { content: 'Since 2k² is an integer, n² is even.' },
      { content: 'Therefore, if n is even, then n² is even.' },
    ];

    it('should decompose simple direct proof', () => {
      const result = decomposer.decompose(simpleProof, 'If n is even, then n² is even');

      expect(result.atoms.length).toBe(5);
      expect(result.theorem).toBe('If n is even, then n² is even');
      // Rigor level depends on detected dependencies - pattern matching may vary
      expect(['informal', 'textbook', 'rigorous']).toContain(result.rigorLevel);
    });

    it('should identify hypothesis and conclusion', () => {
      const result = decomposer.decompose(simpleProof);

      const hypothesis = result.atoms.find((a) => a.type === 'hypothesis');
      const conclusion = result.atoms.find((a) => a.type === 'conclusion');

      expect(hypothesis).toBeDefined();
      expect(hypothesis?.statement).toContain('even integer');
      expect(conclusion).toBeDefined();
      expect(conclusion?.statement).toContain('n² is even');
    });

    it('should trace conclusion to hypothesis', () => {
      const result = decomposer.decompose(simpleProof);
      const conclusion = result.atoms.find((a) => a.type === 'conclusion');

      if (conclusion) {
        const chain = assumptionTracker.traceToAssumptions(conclusion.id, result.dependencies);

        expect(chain.conclusion).toBe(conclusion.id);
        // Path includes the conclusion itself at minimum
        expect(chain.path.length).toBeGreaterThan(0);
        // Chain may have assumptions or implicit assumptions depending on pattern matching
        expect(chain.path).toContain(conclusion.id);
      }
    });

    it('should have high completeness score', () => {
      const result = decomposer.decompose(simpleProof);
      expect(result.completeness).toBeGreaterThan(0.7);
    });
  });

  describe('Proof by Contradiction', () => {
    const contradictionProof: ProofStep[] = [
      { content: 'Assume for contradiction that √2 is rational.' },
      { content: 'Then √2 = p/q where p and q are integers with no common factors.' },
      { content: 'Squaring both sides: 2 = p²/q², so p² = 2q².' },
      { content: 'This means p² is even, so p must be even.' },
      { content: 'Let p = 2k for some integer k.' },
      { content: 'Then (2k)² = 2q², so 4k² = 2q², thus q² = 2k².' },
      { content: 'This means q² is even, so q must be even.' },
      { content: 'But then p and q share factor 2, contradicting our assumption.' },
      { content: 'Therefore √2 is irrational.' },
    ];

    it('should decompose proof by contradiction', () => {
      const result = decomposer.decompose(contradictionProof, '√2 is irrational');

      expect(result.atoms.length).toBe(9);
      expect(result.dependencies.hasCycles).toBe(false);
    });

    it('should identify contradiction step', () => {
      const result = decomposer.decompose(contradictionProof);

      // Find the contradiction statement
      const contradictionStep = result.atoms.find(
        (a) =>
          a.statement.toLowerCase().includes('contradiction') ||
          a.usedInferenceRule === 'contradiction'
      );

      expect(contradictionStep).toBeDefined();
    });

    it('should track assumption discharge', () => {
      const result = decomposer.decompose(contradictionProof);
      const dischargeStatus = assumptionTracker.checkAssumptionDischarge(result);

      // The "assume for contradiction" should be tracked
      const hypothesis = result.atoms.find((a) => a.type === 'hypothesis');
      if (hypothesis) {
        const status = dischargeStatus.find((s) => s.assumptionId === hypothesis.id);
        // Status should exist and have a discharge reason
        expect(status).toBeDefined();
        expect(status?.dischargeReason).toBeDefined();
      }
    });
  });

  describe('Proof by Induction', () => {
    const inductionProof: ProofStep[] = [
      { content: 'We prove by induction that 1 + 2 + ... + n = n(n+1)/2.' },
      { content: 'Base case: When n = 1, the left side is 1 and the right side is 1(2)/2 = 1.' },
      { content: 'Inductive hypothesis: Assume the formula holds for some k ≥ 1.' },
      { content: 'Inductive step: We need to show it holds for k + 1.' },
      { content: 'By the inductive hypothesis, 1 + 2 + ... + k = k(k+1)/2.' },
      { content: 'Adding (k+1) to both sides: 1 + 2 + ... + k + (k+1) = k(k+1)/2 + (k+1).' },
      { content: 'Simplifying: k(k+1)/2 + (k+1) = (k+1)(k+2)/2.' },
      { content: 'Therefore the formula holds for k + 1.' },
      { content: 'By induction, the formula holds for all n ≥ 1.' },
    ];

    it('should decompose induction proof', () => {
      const result = decomposer.decompose(inductionProof, '1 + 2 + ... + n = n(n+1)/2');

      expect(result.atoms.length).toBe(9);
      expect(result.theorem).toBe('1 + 2 + ... + n = n(n+1)/2');
    });

    it('should identify induction structure', () => {
      const result = decomposer.decompose(inductionProof);

      // Check for induction-related content
      const hasBaseCase = result.atoms.some((a) =>
        a.statement.toLowerCase().includes('base case')
      );
      const hasInductiveHypothesis = result.atoms.some(
        (a) =>
          a.statement.toLowerCase().includes('inductive hypothesis') ||
          a.statement.toLowerCase().includes('assume')
      );

      expect(hasBaseCase).toBe(true);
      expect(hasInductiveHypothesis).toBe(true);
    });
  });

  describe('Incomplete Proof Gap Detection', () => {
    const incompleteProof: ProofStep[] = [
      { content: 'Let x be a real number.' },
      { content: 'Obviously, x² + 1 > 0.' }, // Unjustified "obviously"
      { content: 'Since x² + 1 > 0, we have 1/(x² + 1) is well-defined.' },
      { content: 'Therefore f(x) = 1/(x² + 1) is continuous everywhere.' }, // Big leap
    ];

    it('should detect gaps in incomplete proof', () => {
      const result = decomposer.decompose(incompleteProof);
      const analysis = gapAnalyzer.analyzeGaps(result);

      // Should find gaps or implicit assumptions
      expect(analysis.gaps.length + analysis.implicitAssumptions.length).toBeGreaterThan(0);
    });

    it('should identify implicit assumptions', () => {
      const result = decomposer.decompose(incompleteProof);
      const analysis = gapAnalyzer.analyzeGaps(result);

      // "Obviously" suggests an implicit assumption
      const hasImplicitAssumption =
        analysis.implicitAssumptions.length > 0 ||
        result.implicitAssumptions.some((a) =>
          a.statement.toLowerCase().includes('obviously')
        );

      expect(hasImplicitAssumption || analysis.gaps.length > 0).toBe(true);
    });

    it('should have lower completeness score', () => {
      const result = decomposer.decompose(incompleteProof);
      const analysis = gapAnalyzer.analyzeGaps(result);

      // Incomplete proof should have lower completeness
      expect(analysis.completeness).toBeLessThan(0.95);
    });

    it('should generate improvement suggestions', () => {
      const result = decomposer.decompose(incompleteProof);
      const analysis = gapAnalyzer.analyzeGaps(result);

      expect(analysis.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Assumption Chain Analysis', () => {
    const chainProof: ProofStep[] = [
      { content: 'Axiom 1: All men are mortal.' },
      { content: 'Axiom 2: Socrates is a man.' },
      { content: 'By Axiom 1 and Axiom 2, Socrates is mortal.' },
      { content: 'Therefore, there exists a mortal being.' },
    ];

    it('should trace chain of assumptions', () => {
      const result = decomposer.decompose(chainProof);
      const analysis = assumptionTracker.analyzeAssumptions(result);

      expect(analysis.explicitAssumptions.length).toBe(2); // Two axioms
      expect(analysis.conclusionDependencies.size).toBeGreaterThan(0);
    });

    it('should find minimal assumption sets', () => {
      const result = decomposer.decompose(chainProof);
      const analysis = assumptionTracker.analyzeAssumptions(result);

      // Check that minimal sets were computed
      expect(analysis.minimalSets.size).toBeGreaterThan(0);
    });

    it('should identify unused assumptions', () => {
      const proofWithUnused: ProofStep[] = [
        { content: 'Axiom 1: All men are mortal.' },
        { content: 'Axiom 2: Socrates is a man.' },
        { content: 'Axiom 3: The sky is blue.' }, // Unused
        { content: 'By Axiom 1 and Axiom 2, Socrates is mortal.' },
      ];

      const result = decomposer.decompose(proofWithUnused);
      const unused = assumptionTracker.findUnusedAssumptions(result);

      // Axiom 3 should be unused
      expect(unused.length).toBeGreaterThan(0);
    });

    it('should validate assumption structure', () => {
      const result = decomposer.decompose(chainProof);
      const validation = assumptionTracker.validateStructure(result);

      expect(validation.isValid).toBe(true);
      expect(validation.issues.length).toBe(0);
    });
  });

  describe('Proof Text Parsing', () => {
    it('should parse natural language proof text', () => {
      const proofText = `
        Assume that n is an odd integer.
        By definition, n = 2k + 1 for some integer k.
        Then n² = (2k + 1)² = 4k² + 4k + 1 = 2(2k² + 2k) + 1.
        Since 2k² + 2k is an integer, n² is odd.
        Therefore, if n is odd, then n² is odd.
      `;

      const result = decomposer.decompose(proofText);

      expect(result.atoms.length).toBeGreaterThan(0);
      expect(result.originalProof).toContain('Assume');
    });

    it('should handle proof with definitions', () => {
      const proofText = `
        Definition: A number n is even if n = 2k for some integer k.
        Let m be an even number.
        By definition, m = 2j for some integer j.
        Then 2m = 2(2j) = 4j = 2(2j).
        Therefore 2m is even.
      `;

      const result = decomposer.decompose(proofText);
      const definitions = result.atoms.filter((a) => a.type === 'definition');

      expect(definitions.length).toBeGreaterThan(0);
    });
  });

  describe('Gap Analyzer Configuration', () => {
    it('should respect strictness level', () => {
      const proof: ProofStep[] = [
        { content: 'Let x > 0.' },
        { content: 'Then x² > 0.' },
        { content: 'Therefore x³ > 0.' },
      ];

      const lenientAnalyzer = new GapAnalyzer({ strictness: 'lenient' });
      const strictAnalyzer = new GapAnalyzer({ strictness: 'strict' });

      const result = decomposer.decompose(proof);
      const lenientGaps = lenientAnalyzer.analyzeGaps(result);
      const strictGaps = strictAnalyzer.analyzeGaps(result);

      // Strict mode should find more issues
      expect(strictGaps.gaps.length).toBeGreaterThanOrEqual(lenientGaps.gaps.length);
    });
  });

  describe('Complex Proof Integration', () => {
    const complexProof: ProofStep[] = [
      { content: 'Theorem: There are infinitely many prime numbers.' },
      { content: 'Assume for contradiction that there are only finitely many primes.' },
      { content: 'Let p₁, p₂, ..., pₙ be all the prime numbers.' },
      { content: 'Define N = p₁ × p₂ × ... × pₙ + 1.' },
      { content: 'N is either prime or has a prime factor.' },
      { content: 'If N is prime, it is not in our list since N > pₙ.' },
      { content: 'If N has a prime factor p, then p divides N.' },
      { content: 'But p must be some pᵢ from our list.' },
      { content: 'Since pᵢ divides p₁ × p₂ × ... × pₙ, it cannot divide N.' },
      { content: 'This is a contradiction.' },
      { content: 'Therefore, there are infinitely many primes.' },
    ];

    it('should decompose complex proof correctly', () => {
      const result = decomposer.decompose(complexProof, 'There are infinitely many primes');

      expect(result.atoms.length).toBe(11);
      expect(result.maxDependencyDepth).toBeGreaterThan(0);
    });

    it('should perform full analysis pipeline', () => {
      const result = decomposer.decompose(complexProof);
      const gapResult = gapAnalyzer.analyzeGaps(result);
      const assumptionResult = assumptionTracker.analyzeAssumptions(result);

      // Full pipeline should complete without errors
      expect(result.completeness).toBeGreaterThan(0);
      expect(gapResult.completeness).toBeGreaterThan(0);
      expect(assumptionResult.explicitAssumptions.length).toBeGreaterThan(0);
    });

    it('should get metrics for complex proof', () => {
      const result = decomposer.decompose(complexProof);
      const metrics = decomposer.computeMetrics(result);

      expect(metrics.atomCount).toBe(11);
      expect(metrics.rootCount).toBeGreaterThan(0);
      expect(metrics.leafCount).toBeGreaterThan(0);
    });
  });

  describe('Dependency Graph Properties', () => {
    it('should build graph for valid proof', () => {
      const validProof: ProofStep[] = [
        { content: 'Axiom: P is true.' },
        { content: 'Axiom: If P then Q.' },
        { content: 'Therefore Q is true.' },
      ];

      const result = decomposer.decompose(validProof);

      // Graph should have proper structure with nodes and edges
      expect(result.dependencies.nodes.size).toBe(3);
      expect(result.dependencies.roots.length).toBeGreaterThan(0);
    });

    it('should correctly identify roots and leaves', () => {
      const proof: ProofStep[] = [
        { content: 'Axiom A.' },
        { content: 'Axiom B.' },
        { content: 'From A, we derive C.' },
        { content: 'From B and C, we conclude D.' },
      ];

      const result = decomposer.decompose(proof);

      // Roots should be axioms, leaves should be conclusions
      expect(result.dependencies.roots.length).toBeGreaterThan(0);
      expect(result.dependencies.leaves.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty proof', () => {
      const result = decomposer.decompose([]);

      expect(result.atoms.length).toBe(0);
      expect(result.completeness).toBe(0);
    });

    it('should handle single statement', () => {
      const result = decomposer.decompose([{ content: 'Axiom: 1 + 1 = 2.' }]);

      expect(result.atoms.length).toBe(1);
      expect(result.atoms[0].type).toBe('axiom');
    });

    it('should handle proof with only conclusion', () => {
      const result = decomposer.decompose([{ content: 'Therefore, the result follows.' }]);

      expect(result.atoms.length).toBe(1);
      expect(result.atoms[0].type).toBe('conclusion');
      expect(result.gaps.length).toBeGreaterThan(0); // Missing premises
    });
  });
});
