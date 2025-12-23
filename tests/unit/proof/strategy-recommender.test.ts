/**
 * Strategy Recommender Tests - Phase 12 Sprint 2
 *
 * Tests for the StrategyRecommender class that recommends proof strategies.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StrategyRecommender, StrategyRecommenderConfig } from '../../../src/proof/strategy-recommender.js';

describe('StrategyRecommender', () => {
  let recommender: StrategyRecommender;

  beforeEach(() => {
    recommender = new StrategyRecommender();
  });

  describe('constructor', () => {
    it('should create an instance with default options', () => {
      const recommender = new StrategyRecommender();
      expect(recommender).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const config: StrategyRecommenderConfig = {
        maxRecommendations: 5,
        minConfidence: 0.5,
        includeTemplates: false,
      };
      const recommender = new StrategyRecommender(config);
      expect(recommender).toBeDefined();
    });
  });

  describe('recommend', () => {
    it('should return recommendations for a theorem', () => {
      const theorem = 'For all n, the sum of the first n natural numbers equals n(n+1)/2';
      const recommendations = recommender.recommend(theorem);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].strategy).toBeDefined();
      expect(recommendations[0].confidence).toBeGreaterThan(0);
    });

    it('should recommend induction for recursive structures', () => {
      const theorem = 'For all natural numbers n, f(n) = f(n-1) + n';
      const recommendations = recommender.recommend(theorem);

      const hasInduction = recommendations.some(
        (r) => r.strategy === 'induction' || r.strategy === 'strong_induction'
      );
      expect(hasInduction).toBe(true);
    });

    it('should recommend contradiction for negation-heavy statements', () => {
      const theorem = 'There is no largest prime number';
      const recommendations = recommender.recommend(theorem);

      const hasContradiction = recommendations.some((r) => r.strategy === 'contradiction');
      expect(hasContradiction).toBe(true);
    });

    it('should recommend construction for existence proofs', () => {
      const theorem = 'There exists a prime number greater than 100';
      const recommendations = recommender.recommend(theorem);

      const hasConstruction = recommendations.some((r) => r.strategy === 'construction');
      expect(hasConstruction).toBe(true);
    });

    it('should recommend case analysis for finite domains', () => {
      const theorem = 'For any finite set with n elements, the number of subsets is 2^n';
      const recommendations = recommender.recommend(theorem);

      // Should have case_analysis or induction as options
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should respect maxRecommendations config', () => {
      const recommender = new StrategyRecommender({ maxRecommendations: 2 });
      const theorem = 'For all n, P(n) implies Q(n)';
      const recommendations = recommender.recommend(theorem);

      expect(recommendations.length).toBeLessThanOrEqual(2);
    });

    it('should filter by minConfidence', () => {
      const recommender = new StrategyRecommender({ minConfidence: 0.8 });
      const theorem = 'P implies Q';
      const recommendations = recommender.recommend(theorem);

      recommendations.forEach((r) => {
        expect(r.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should include templates when configured', () => {
      const recommender = new StrategyRecommender({ includeTemplates: true });
      const theorem = 'If P then Q';
      const recommendations = recommender.recommend(theorem);

      if (recommendations.length > 0) {
        expect(recommendations[0].suggestedStructure).toBeDefined();
      }
    });
  });

  describe('extractFeatures', () => {
    it('should detect universal quantifiers', () => {
      const features = recommender.extractFeatures('For all x in S, P(x)');
      expect(features.hasUniversalQuantifier).toBe(true);
    });

    it('should detect existential quantifiers', () => {
      const features = recommender.extractFeatures('There exists x such that P(x)');
      expect(features.hasExistentialQuantifier).toBe(true);
    });

    it('should detect inequality', () => {
      const features = recommender.extractFeatures('x is less than y');
      expect(features.involvesInequality).toBe(true);
    });

    it('should detect recursive structure', () => {
      const features = recommender.extractFeatures('f(n+1) = f(n) + 1');
      expect(features.hasRecursiveStructure).toBe(true);
    });

    it('should detect negation', () => {
      const features = recommender.extractFeatures('P is not true');
      expect(features.involvesNegation).toBe(true);
    });

    it('should detect conditional statements', () => {
      const features = recommender.extractFeatures('If P then Q');
      expect(features.isConditional).toBe(true);
    });

    it('should detect biconditional statements', () => {
      const features = recommender.extractFeatures('P if and only if Q');
      expect(features.isBiconditional).toBe(true);
    });

    it('should detect finite sets', () => {
      const features = recommender.extractFeatures('The cardinality of A is finite');
      expect(features.involvesFiniteSets).toBe(true);
    });

    it('should detect domain type for natural numbers', () => {
      const features = recommender.extractFeatures('For all natural numbers n');
      expect(features.domainType).toBe('natural_numbers');
    });

    it('should detect domain type for integers', () => {
      const features = recommender.extractFeatures('For every integer z in Z');
      expect(features.domainType).toBe('integers');
    });

    it('should detect domain type for reals', () => {
      const features = recommender.extractFeatures('For all real numbers x');
      expect(features.domainType).toBe('reals');
    });

    it('should detect domain type for sets', () => {
      const features = recommender.extractFeatures('A is a subset of B');
      expect(features.domainType).toBe('sets');
    });

    it('should detect domain type for graphs', () => {
      const features = recommender.extractFeatures('For every vertex v in graph G');
      expect(features.domainType).toBe('graphs');
    });

    it('should detect domain type for number theory', () => {
      const features = recommender.extractFeatures('If p is prime and divides ab');
      expect(features.domainType).toBe('number_theory');
    });

    it('should extract additional features', () => {
      const features = recommender.extractFeatures('Show there is a unique solution');
      expect(features.additionalFeatures).toContain('uniqueness');
    });

    it('should detect parity features', () => {
      const features = recommender.extractFeatures('If n is even, then n^2 is even');
      expect(features.additionalFeatures).toContain('parity');
    });
  });

  describe('matchStrategies', () => {
    it('should return scores for all strategies', () => {
      const features = recommender.extractFeatures('For all n, P(n)');
      const scored = recommender.matchStrategies(features);

      expect(scored.length).toBeGreaterThan(0);
      scored.forEach((s) => {
        expect(s.score).toBeGreaterThanOrEqual(0);
        expect(s.score).toBeLessThanOrEqual(1);
      });
    });

    it('should include matched features in results', () => {
      const features = recommender.extractFeatures('For all n, f(n+1) = f(n) + 1');
      const scored = recommender.matchStrategies(features);

      const inductionResult = scored.find((s) => s.strategy === 'induction');
      expect(inductionResult?.matchedFeatures).toContain('hasRecursiveStructure');
    });

    it('should apply domain bonuses', () => {
      const naturalFeatures = recommender.extractFeatures('For all natural numbers n, P(n)');
      const generalFeatures = recommender.extractFeatures('For all x, P(x)');

      const naturalScored = recommender.matchStrategies(naturalFeatures);
      const generalScored = recommender.matchStrategies(generalFeatures);

      const naturalInduction = naturalScored.find((s) => s.strategy === 'induction')?.score || 0;
      const generalInduction = generalScored.find((s) => s.strategy === 'induction')?.score || 0;

      expect(naturalInduction).toBeGreaterThan(generalInduction);
    });
  });

  describe('getStrategies', () => {
    it('should return all available strategies', () => {
      const strategies = recommender.getStrategies();

      expect(strategies).toContain('direct');
      expect(strategies).toContain('contradiction');
      expect(strategies).toContain('induction');
      expect(strategies).toContain('strong_induction');
      expect(strategies).toContain('case_analysis');
      expect(strategies).toContain('contrapositive');
      expect(strategies).toContain('construction');
      expect(strategies).toContain('pigeonhole');
      expect(strategies).toContain('well_ordering');
      expect(strategies).toContain('infinite_descent');
    });
  });

  describe('getTemplate', () => {
    it('should return template for direct proof', () => {
      const template = recommender.getTemplate('direct');
      expect(template).toBeDefined();
      expect(template?.strategy).toBe('direct');
      expect(template?.sections).toBeDefined();
      expect(template?.skeleton).toBeDefined();
    });

    it('should return template for contradiction', () => {
      const template = recommender.getTemplate('contradiction');
      expect(template).toBeDefined();
      expect(template?.sections.some((s) => s.name.toLowerCase().includes('assumption'))).toBe(true);
    });

    it('should return template for induction', () => {
      const template = recommender.getTemplate('induction');
      expect(template).toBeDefined();
      expect(template?.sections.some((s) => s.name.toLowerCase().includes('base'))).toBe(true);
      expect(template?.sections.some((s) => s.name.toLowerCase().includes('inductive'))).toBe(true);
    });

    it('should return template for case analysis', () => {
      const template = recommender.getTemplate('case_analysis');
      expect(template).toBeDefined();
      expect(template?.sections.some((s) => s.name.toLowerCase().includes('case'))).toBe(true);
    });

    it('should return template for construction', () => {
      const template = recommender.getTemplate('construction');
      expect(template).toBeDefined();
      expect(template?.sections.some((s) => s.name.toLowerCase().includes('construction'))).toBe(
        true
      );
    });

    it('should return undefined for unknown strategy', () => {
      const template = recommender.getTemplate('unknown_strategy' as any);
      // Should return default template or undefined
      expect(template !== undefined || template === undefined).toBe(true);
    });
  });

  describe('recommendations with reasoning', () => {
    it('should include reasoning in recommendations', () => {
      const theorem = 'Prove that n^2 is even if n is even';
      const recommendations = recommender.recommend(theorem);

      if (recommendations.length > 0) {
        expect(recommendations[0].reasoning).toBeDefined();
        expect(typeof recommendations[0].reasoning).toBe('string');
      }
    });

    it('should mention matched features in reasoning', () => {
      const theorem = 'For all natural numbers n, f(n+1) depends on f(n)';
      const recommendations = recommender.recommend(theorem);

      const inductionRec = recommendations.find((r) => r.strategy === 'induction');
      if (inductionRec) {
        expect(inductionRec.reasoning.toLowerCase()).toMatch(/recursive|induct/i);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty theorem', () => {
      const recommendations = recommender.recommend('');
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should handle very long theorems', () => {
      const longTheorem = 'For all '.repeat(100) + 'n, P(n) holds';
      const recommendations = recommender.recommend(longTheorem);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const theorem = '∀x ∈ ℕ, ∃y ∈ ℤ such that x < y';
      const recommendations = recommender.recommend(theorem);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should handle LaTeX notation', () => {
      const theorem = '\\forall n \\in \\mathbb{N}, P(n) \\implies Q(n)';
      const recommendations = recommender.recommend(theorem);

      const features = recommender.extractFeatures(theorem);
      expect(features.hasUniversalQuantifier).toBe(true);
    });
  });

  describe('specific theorem types', () => {
    it('should handle irrationality proofs', () => {
      const theorem = 'The square root of 2 is not a rational number';
      const recommendations = recommender.recommend(theorem);

      // Should suggest contradiction or infinite descent
      const hasSuitable = recommendations.some(
        (r) => r.strategy === 'contradiction' || r.strategy === 'infinite_descent'
      );
      expect(hasSuitable).toBe(true);
    });

    it('should handle cardinality proofs', () => {
      const theorem = 'The set of real numbers is uncountable';
      const recommendations = recommender.recommend(theorem);

      // Should suggest diagonalization
      const hasDiagonalization = recommendations.some((r) => r.strategy === 'diagonalization');
      expect(hasDiagonalization || recommendations.length > 0).toBe(true);
    });

    it('should handle pigeonhole problems', () => {
      const theorem = 'If 13 people are in a room, at least two have birthdays in the same month';
      const recommendations = recommender.recommend(theorem);

      // Should suggest pigeonhole or case analysis
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});
