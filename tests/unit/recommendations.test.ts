/**
 * Unit tests for Mode Recommendation System (v2.4)
 */

import { describe, it, expect } from 'vitest';
import {
  ModeRecommender,
  type ProblemCharacteristics,
  type ModeRecommendation,
  type CombinationRecommendation,
} from '../../src/types/modes/recommendations.js';
import { ThinkingMode } from '../../src/types/core.js';

describe('Mode Recommendation System', () => {
  const recommender = new ModeRecommender();

  describe('Single Mode Recommendations', () => {
    it('should recommend temporal mode for time-dependent problems', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'debugging',
        complexity: 'medium',
        uncertainty: 'medium',
        timeDependent: true,
        multiAgent: false,
        requiresProof: false,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: false,
        hasAlternatives: false,
      };

      const recommendations = recommender.recommendModes(characteristics);

      expect(recommendations.length).toBeGreaterThan(0);
      const temporalRec = recommendations.find(r => r.mode === ThinkingMode.TEMPORAL);
      expect(temporalRec).toBeDefined();
      expect(temporalRec?.score).toBe(0.9);
      expect(temporalRec?.reasoning).toContain('time-dependent');
      expect(temporalRec?.strengths).toContain('Event sequencing');
    });

    it('should recommend game theory mode for multi-agent problems', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'business',
        complexity: 'high',
        uncertainty: 'medium',
        timeDependent: false,
        multiAgent: true,
        requiresProof: false,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: false,
        hasAlternatives: false,
      };

      const recommendations = recommender.recommendModes(characteristics);

      expect(recommendations.length).toBeGreaterThan(0);
      const gameTheoryRec = recommendations.find(r => r.mode === ThinkingMode.GAMETHEORY);
      expect(gameTheoryRec).toBeDefined();
      expect(gameTheoryRec?.score).toBe(0.85);
      expect(gameTheoryRec?.reasoning).toContain('strategic interactions');
      expect(gameTheoryRec?.strengths).toContain('Equilibrium analysis');
      expect(gameTheoryRec?.examples).toContain('Competitive analysis');
    });

    it('should recommend evidential mode for incomplete info with high uncertainty', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'sensors',
        complexity: 'high',
        uncertainty: 'high',
        timeDependent: false,
        multiAgent: false,
        requiresProof: false,
        requiresQuantification: false,
        hasIncompleteInfo: true,
        requiresExplanation: false,
        hasAlternatives: false,
      };

      const recommendations = recommender.recommendModes(characteristics);

      expect(recommendations.length).toBeGreaterThan(0);
      const evidentialRec = recommendations.find(r => r.mode === ThinkingMode.EVIDENTIAL);
      expect(evidentialRec).toBeDefined();
      expect(evidentialRec?.score).toBe(0.82);
      expect(evidentialRec?.reasoning).toContain('incomplete information');
      expect(evidentialRec?.strengths).toContain('Handles ignorance');
      expect(evidentialRec?.examples).toContain('Sensor fusion');
    });

    it('should recommend abductive mode when explanation is needed', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'debugging',
        complexity: 'medium',
        uncertainty: 'medium',
        timeDependent: false,
        multiAgent: false,
        requiresProof: false,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: true,
        hasAlternatives: false,
      };

      const recommendations = recommender.recommendModes(characteristics);

      expect(recommendations.length).toBeGreaterThan(0);
      const abductiveRec = recommendations.find(r => r.mode === ThinkingMode.ABDUCTIVE);
      expect(abductiveRec).toBeDefined();
      expect(abductiveRec?.score).toBe(0.87);
      expect(abductiveRec?.reasoning).toContain('best explanations');
      expect(abductiveRec?.strengths).toContain('Hypothesis generation');
      expect(abductiveRec?.examples).toContain('Debugging');
    });
  });

  describe('Mode Combinations', () => {
    it('should recommend temporal + causal combination for time-dependent problems requiring explanation', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'system-analysis',
        complexity: 'high',
        uncertainty: 'medium',
        timeDependent: true,
        multiAgent: false,
        requiresProof: false,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: true,
        hasAlternatives: false,
      };

      const combinations = recommender.recommendCombinations(characteristics);

      expect(combinations.length).toBeGreaterThan(0);
      const temporalCausalCombo = combinations.find(
        c => c.modes.includes(ThinkingMode.TEMPORAL) && c.modes.includes(ThinkingMode.CAUSAL)
      );
      expect(temporalCausalCombo).toBeDefined();
      expect(temporalCausalCombo?.sequence).toBe('sequential');
      expect(temporalCausalCombo?.rationale).toContain('timeline');
      expect(temporalCausalCombo?.rationale).toContain('causal');
      expect(temporalCausalCombo?.synergies).toContain('Temporal events inform causal nodes');
    });

    it('should recommend abductive + bayesian combination for explanation with quantification', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'diagnosis',
        complexity: 'high',
        uncertainty: 'medium',
        timeDependent: false,
        multiAgent: false,
        requiresProof: false,
        requiresQuantification: true,
        hasIncompleteInfo: false,
        requiresExplanation: true,
        hasAlternatives: false,
      };

      const combinations = recommender.recommendCombinations(characteristics);

      expect(combinations.length).toBeGreaterThan(0);
      const abductiveBayesianCombo = combinations.find(
        c => c.modes.includes(ThinkingMode.ABDUCTIVE) && c.modes.includes(ThinkingMode.BAYESIAN)
      );
      expect(abductiveBayesianCombo).toBeDefined();
      expect(abductiveBayesianCombo?.sequence).toBe('sequential');
      expect(abductiveBayesianCombo?.rationale).toContain('hypotheses');
      expect(abductiveBayesianCombo?.rationale).toContain('probabilities');
      expect(abductiveBayesianCombo?.benefits).toContain('Systematic hypothesis generation');
      expect(abductiveBayesianCombo?.synergies).toContain('Abductive hypotheses become Bayesian hypotheses');
    });
  });

  describe('Mode Scoring', () => {
    it('should score modes correctly and rank by score', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'mathematics',
        complexity: 'high',
        uncertainty: 'low',
        timeDependent: false,
        multiAgent: false,
        requiresProof: true,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: false,
        hasAlternatives: false,
      };

      const recommendations = recommender.recommendModes(characteristics);

      // Should have mathematics and shannon recommendations
      expect(recommendations.length).toBeGreaterThan(0);

      // Mathematics should have higher score than Shannon
      const mathRec = recommendations.find(r => r.mode === ThinkingMode.MATHEMATICS);
      const shannonRec = recommendations.find(r => r.mode === ThinkingMode.SHANNON);

      expect(mathRec).toBeDefined();
      expect(shannonRec).toBeDefined();
      expect(mathRec!.score).toBeGreaterThan(shannonRec!.score);

      // Recommendations should be sorted by score (descending)
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].score).toBeGreaterThanOrEqual(recommendations[i + 1].score);
      }

      // All scores should be between 0 and 1
      for (const rec of recommendations) {
        expect(rec.score).toBeGreaterThanOrEqual(0);
        expect(rec.score).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Quick Recommendation', () => {
    it('should provide quick recommendations based on problem type strings', () => {
      expect(recommender.quickRecommend('debugging')).toBe(ThinkingMode.ABDUCTIVE);
      expect(recommender.quickRecommend('proof')).toBe(ThinkingMode.DEDUCTIVE);
      expect(recommender.quickRecommend('mathematical')).toBe(ThinkingMode.MATHEMATICS);
      expect(recommender.quickRecommend('timeline')).toBe(ThinkingMode.TEMPORAL);
      expect(recommender.quickRecommend('strategy')).toBe(ThinkingMode.GAMETHEORY);
      expect(recommender.quickRecommend('uncertainty')).toBe(ThinkingMode.EVIDENTIAL);
      expect(recommender.quickRecommend('causality')).toBe(ThinkingMode.CAUSAL);
      expect(recommender.quickRecommend('probability')).toBe(ThinkingMode.BAYESIAN);
      expect(recommender.quickRecommend('what-if')).toBe(ThinkingMode.COUNTERFACTUAL);
      expect(recommender.quickRecommend('analogy')).toBe(ThinkingMode.ANALOGICAL);
      expect(recommender.quickRecommend('physics')).toBe(ThinkingMode.PHYSICS);
      expect(recommender.quickRecommend('systematic')).toBe(ThinkingMode.SHANNON);
      expect(recommender.quickRecommend('philosophical')).toBe(ThinkingMode.HYBRID);
      expect(recommender.quickRecommend('pattern')).toBe(ThinkingMode.INDUCTIVE);
      expect(recommender.quickRecommend('logic')).toBe(ThinkingMode.DEDUCTIVE);

      // Should fallback to SEQUENTIAL for unknown types
      expect(recommender.quickRecommend('unknown-type')).toBe(ThinkingMode.SEQUENTIAL);
    });

    it('should be case-insensitive for problem types', () => {
      expect(recommender.quickRecommend('DEBUGGING')).toBe(ThinkingMode.ABDUCTIVE);
      expect(recommender.quickRecommend('Proof')).toBe(ThinkingMode.DEDUCTIVE);
      expect(recommender.quickRecommend('Mathematical')).toBe(ThinkingMode.MATHEMATICS);
      expect(recommender.quickRecommend('TimeLine')).toBe(ThinkingMode.TEMPORAL);
    });
  });

  describe('Recommendation Quality', () => {
    it('should provide comprehensive information in recommendations', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'general',
        complexity: 'high',
        uncertainty: 'high',
        timeDependent: true,
        multiAgent: true,
        requiresProof: false,
        requiresQuantification: true,
        hasIncompleteInfo: true,
        requiresExplanation: true,
        hasAlternatives: true,
      };

      const recommendations = recommender.recommendModes(characteristics);

      // Should have multiple recommendations for complex problem
      expect(recommendations.length).toBeGreaterThan(3);

      // Each recommendation should have all required fields
      for (const rec of recommendations) {
        expect(rec.mode).toBeDefined();
        expect(rec.score).toBeGreaterThan(0);
        expect(rec.reasoning).toBeTruthy();
        expect(rec.strengths.length).toBeGreaterThan(0);
        expect(rec.limitations.length).toBeGreaterThan(0);
        expect(rec.examples.length).toBeGreaterThan(0);
      }
    });

    it('should provide fallback sequential recommendation when no modes match', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'general',
        complexity: 'low',
        uncertainty: 'low',
        timeDependent: false,
        multiAgent: false,
        requiresProof: false,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: false,
        hasAlternatives: false,
      };

      const recommendations = recommender.recommendModes(characteristics);

      // Should have at least sequential mode
      expect(recommendations.length).toBeGreaterThan(0);
      const sequentialRec = recommendations.find(r => r.mode === ThinkingMode.SEQUENTIAL);
      expect(sequentialRec).toBeDefined();
      expect(sequentialRec?.reasoning).toContain('General-purpose');
    });
  });

  describe('Combination Synergies', () => {
    it('should identify meaningful synergies between modes', () => {
      const characteristics: ProblemCharacteristics = {
        domain: 'complex-system',
        complexity: 'high',
        uncertainty: 'high',
        timeDependent: true,
        multiAgent: true,
        requiresProof: false,
        requiresQuantification: true,
        hasIncompleteInfo: true,
        requiresExplanation: true,
        hasAlternatives: true,
      };

      const combinations = recommender.recommendCombinations(characteristics);

      // Should have multiple combination recommendations
      expect(combinations.length).toBeGreaterThan(0);

      // Each combination should have clear synergies
      for (const combo of combinations) {
        expect(combo.modes.length).toBeGreaterThanOrEqual(2);
        expect(combo.sequence).toMatch(/^(parallel|sequential|hybrid)$/);
        expect(combo.rationale).toBeTruthy();
        expect(combo.benefits.length).toBeGreaterThan(0);
        expect(combo.synergies.length).toBeGreaterThan(0);
      }
    });

    it('should recommend appropriate sequence types for combinations', () => {
      const sequentialChar: ProblemCharacteristics = {
        domain: 'analysis',
        complexity: 'medium',
        uncertainty: 'medium',
        timeDependent: true,
        multiAgent: false,
        requiresProof: false,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: true,
        hasAlternatives: false,
      };

      const combinations = recommender.recommendCombinations(sequentialChar);
      const temporalCausal = combinations.find(
        c => c.modes.includes(ThinkingMode.TEMPORAL) && c.modes.includes(ThinkingMode.CAUSAL)
      );

      // Temporal + Causal should be sequential (timeline first, then analysis)
      expect(temporalCausal?.sequence).toBe('sequential');
    });
  });

  describe('Edge Cases', () => {
    it('should handle domain-specific recommendations correctly', () => {
      const physicsChar: ProblemCharacteristics = {
        domain: 'physics',
        complexity: 'high',
        uncertainty: 'low',
        timeDependent: false,
        multiAgent: false,
        requiresProof: false,
        requiresQuantification: true,
        hasIncompleteInfo: false,
        requiresExplanation: false,
        hasAlternatives: false,
      };

      const recommendations = recommender.recommendModes(physicsChar);

      const physicsRec = recommendations.find(r => r.mode === ThinkingMode.PHYSICS);
      expect(physicsRec).toBeDefined();
      expect(physicsRec?.score).toBe(0.90);
      expect(physicsRec?.strengths).toContain('Field theory');
    });

    it('should handle engineering domain similar to physics', () => {
      const engineeringChar: ProblemCharacteristics = {
        domain: 'engineering',
        complexity: 'medium',
        uncertainty: 'low',
        timeDependent: false,
        multiAgent: false,
        requiresProof: false,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: false,
        hasAlternatives: false,
      };

      const recommendations = recommender.recommendModes(engineeringChar);

      const physicsRec = recommendations.find(r => r.mode === ThinkingMode.PHYSICS);
      expect(physicsRec).toBeDefined();
      expect(physicsRec?.examples).toContain('Engineering analysis');
    });
  });
});
