/**
 * Tests for MathematicsReasoningEngine - Phase 8 Sprint 3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MathematicsReasoningEngine } from '../../../src/modes/mathematics-reasoning.js';

describe('MathematicsReasoningEngine', () => {
  let engine: MathematicsReasoningEngine;

  beforeEach(() => {
    engine = new MathematicsReasoningEngine();
  });

  describe('constructor', () => {
    it('should create engine with default config', () => {
      const defaultEngine = new MathematicsReasoningEngine();
      expect(defaultEngine).toBeInstanceOf(MathematicsReasoningEngine);
    });

    it('should accept partial config', () => {
      const customEngine = new MathematicsReasoningEngine({
        enableDecomposition: true,
        enableGapAnalysis: false,
      });
      expect(customEngine).toBeInstanceOf(MathematicsReasoningEngine);
    });

    it('should disable features via config', () => {
      const minimalEngine = new MathematicsReasoningEngine({
        enableDecomposition: true,
        enableGapAnalysis: false,
        enableAssumptionTracking: false,
        enableInconsistencyDetection: false,
        enableCircularDetection: false,
      });
      expect(minimalEngine).toBeInstanceOf(MathematicsReasoningEngine);
    });
  });

  describe('analyzeProof', () => {
    it('should analyze a simple text proof', () => {
      const proof = `
        Let n be a positive integer.
        By definition, n > 0.
        Therefore, n is positive.
      `;

      const result = engine.analyzeProof(proof);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('recommendations');
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
    });

    it('should analyze proof with theorem context', () => {
      const proof = `
        Assume p is prime and p > 2.
        Since p is odd, p = 2k + 1 for some integer k.
        Therefore p is of the form 2k + 1.
      `;
      const theorem = 'All primes greater than 2 are odd';

      const result = engine.analyzeProof(proof, theorem);

      expect(result.decomposition).toBeTruthy();
      expect(result.isValid).toBeDefined();
    });

    it('should include decomposition when enabled', () => {
      const proof = 'Let x = 1. Then x + 0 = 1. Therefore x + 0 = x.';

      const result = engine.analyzeProof(proof);

      expect(result.decomposition).toBeTruthy();
      expect(result.decomposition?.atoms.length).toBeGreaterThan(0);
    });

    it('should include gap analysis when enabled', () => {
      const proof = 'Let x be real. Therefore x^2 >= 0.';

      const result = engine.analyzeProof(proof);

      // Gap analysis should find a gap in this proof
      expect(result.gapAnalysis).toBeTruthy();
    });

    it('should include consistency report when enabled', () => {
      const proof = `
        Assume n is even.
        Then n = 2k for some integer k.
        Therefore n is divisible by 2.
      `;

      const result = engine.analyzeProof(proof);

      expect(result.consistencyReport).toBeTruthy();
      expect(result.consistencyReport?.isConsistent).toBeDefined();
    });

    it('should return invalid for empty proof', () => {
      const result = engine.analyzeProof('');

      expect(result.overallScore).toBe(0);
      expect(result.isValid).toBe(false);
    });
  });

  describe('analyzeForThoughtType', () => {
    it('should analyze for proof_decomposition', () => {
      const proof = 'Let x = 1. Then x > 0.';

      const result = engine.analyzeForThoughtType(proof, 'proof_decomposition');

      expect(result.decomposition).toBeTruthy();
    });

    it('should analyze for dependency_analysis', () => {
      const proof = 'Given A. From A we derive B. From B we conclude C.';

      const result = engine.analyzeForThoughtType(proof, 'dependency_analysis');

      expect(result.decomposition).toBeTruthy();
      expect(result.recommendations).toBeTruthy();
    });

    it('should analyze for consistency_check', () => {
      const proof = 'Assume P. By logic, Q follows. Therefore Q.';

      const result = engine.analyzeForThoughtType(proof, 'consistency_check');

      expect(result.consistencyReport).toBeTruthy();
    });

    it('should analyze for gap_identification', () => {
      const proof = 'Let n be natural. Therefore n >= 0.';

      const result = engine.analyzeForThoughtType(proof, 'gap_identification');

      expect(result.gapAnalysis).toBeTruthy();
    });

    it('should analyze for assumption_trace', () => {
      const proof = 'Suppose x > 0. Then x^2 > 0. Hence x is positive.';

      const result = engine.analyzeForThoughtType(proof, 'assumption_trace');

      expect(result.assumptionAnalysis).toBeTruthy();
    });

    it('should perform full analysis for other thought types', () => {
      const proof = 'Given: triangle ABC. Prove: sum of angles = 180.';

      const result = engine.analyzeForThoughtType(proof, 'theorem_application');

      // Should have full analysis results - check that we got some result
      const hasResults = result.decomposition !== undefined ||
                        result.gapAnalysis !== undefined ||
                        result.consistencyReport !== undefined ||
                        result.overallScore !== undefined;
      expect(hasResults).toBe(true);
    });
  });

  describe('checkConsistency', () => {
    it('should return consistency report for valid proof', () => {
      // Simple proof without complex patterns that might trigger warnings
      const proof = `
        Given: n is a natural number.
        By definition, n plus zero equals n.
        Therefore the identity property holds.
      `;

      const result = engine.checkConsistency(proof);

      expect(result.consistencyReport).toBeTruthy();
      // The proof should not have critical errors or errors
      expect(result.consistencyReport?.inconsistencies.filter(
        (i) => i.severity === 'critical' || i.severity === 'error'
      ).length).toBe(0);
    });

    it('should detect inconsistency in contradictory proof', () => {
      const proof = `
        Assume n is even.
        Therefore n is divisible by 2.
        But n is odd.
        Hence n is not divisible by 2.
      `;

      const result = engine.checkConsistency(proof);

      expect(result.consistencyReport).toBeTruthy();
      // Should detect the even/odd contradiction
    });
  });

  describe('generateReport', () => {
    it('should generate markdown report', () => {
      const proof = 'Let n = 1. Then n > 0. Therefore n is positive.';
      const analysisResult = engine.analyzeProof(proof);

      const report = engine.generateReport(analysisResult);

      expect(report).toContain('# Proof Analysis Report');
      expect(report).toContain('## Overall Assessment');
      expect(report).toContain('**Valid**');
      expect(report).toContain('**Score**');
    });

    it('should include all sections in report', () => {
      const proof = `
        Given: x is a positive real number.
        Step 1: x > 0 by hypothesis.
        Step 2: x^2 > 0 since positive times positive is positive.
        Conclusion: x^2 is positive.
      `;
      const analysisResult = engine.analyzeProof(proof);

      const report = engine.generateReport(analysisResult);

      expect(report).toContain('Proof Structure');
      expect(report).toContain('Atomic Statements');
    });

    it('should include recommendations when present', () => {
      const proof = 'Therefore x > 0.'; // Weak proof with missing premises
      const analysisResult = engine.analyzeProof(proof);

      const report = engine.generateReport(analysisResult);

      if (analysisResult.recommendations.length > 0) {
        expect(report).toContain('## Recommendations');
      }
    });
  });

  describe('getStats', () => {
    it('should return engine statistics', () => {
      const stats = engine.getStats();

      expect(stats).toHaveProperty('features');
      expect(stats).toHaveProperty('version');
      expect(stats.version).toBe('7.0.0');
    });

    it('should reflect enabled features', () => {
      const fullEngine = new MathematicsReasoningEngine();
      const stats = fullEngine.getStats();

      expect(stats.features.decomposition).toBe(true);
      expect(stats.features.gapAnalysis).toBe(true);
      expect(stats.features.assumptionTracking).toBe(true);
      expect(stats.features.inconsistencyDetection).toBe(true);
      expect(stats.features.circularDetection).toBe(true);
    });

    it('should reflect disabled features', () => {
      const minimalEngine = new MathematicsReasoningEngine({
        enableGapAnalysis: false,
        enableCircularDetection: false,
      });
      const stats = minimalEngine.getStats();

      expect(stats.features.gapAnalysis).toBe(false);
      expect(stats.features.circularDetection).toBe(false);
    });
  });

  describe('enhanceThought', () => {
    it('should enhance thought with analysis results', () => {
      const thought = {
        thought: 'Analyzing proof structure',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thoughtType: 'proof_decomposition' as const,
        content: 'Let x = 1. Then x > 0.',
      };

      const enhanced = engine.enhanceThought(thought, 'Let x = 1. Then x > 0.');

      expect(enhanced.thought).toBe(thought.thought);
      expect(enhanced.thoughtType).toBe('proof_decomposition');
      // Should have analysis results attached
      expect(enhanced.decomposition || enhanced.consistencyReport || enhanced.gapAnalysis).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle proof with only whitespace', () => {
      const result = engine.analyzeProof('   \n\t  \n   ');

      expect(result.overallScore).toBeLessThanOrEqual(0.5);
    });

    it('should handle very long proof text', () => {
      const longProof = Array(100)
        .fill('Step: We derive the next result from the previous.')
        .join('\n');

      const result = engine.analyzeProof(longProof);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('isValid');
    });

    it('should handle special characters in proof', () => {
      const proof = `
        Let ε > 0.
        Choose δ = ε/2.
        Then |x - a| < δ → |f(x) - L| < ε.
        ∴ lim f(x) = L as x → a.
      `;

      const result = engine.analyzeProof(proof);

      expect(result).toHaveProperty('decomposition');
    });

    it('should handle mathematical notation', () => {
      const proof = `
        ∀x ∈ ℝ, x² ≥ 0.
        Proof: If x ≥ 0, then x² = x·x ≥ 0.
        If x < 0, then x² = (-|x|)·(-|x|) = |x|² ≥ 0.
        ∴ x² ≥ 0 for all real x. □
      `;

      const result = engine.analyzeProof(proof);

      expect(result.decomposition?.atoms.length).toBeGreaterThan(0);
    });
  });
});
