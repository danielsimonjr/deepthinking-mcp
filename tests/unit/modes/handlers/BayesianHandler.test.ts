/**
 * BayesianHandler Unit Tests - Phase 10 Sprint 2
 *
 * Tests for the specialized BayesianHandler:
 * - Thought creation
 * - Automatic posterior calculation
 * - Probability validation
 * - Evidence validation
 * - Bayes factor computation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BayesianHandler } from '../../../../src/modes/handlers/BayesianHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('BayesianHandler', () => {
  let handler: BayesianHandler;

  beforeEach(() => {
    handler = new BayesianHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.BAYESIAN);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Bayesian Inference');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description).toContain('Bayes');
    });
  });

  describe('createThought', () => {
    it('should create a basic Bayesian thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing probability',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.BAYESIAN);
      expect(thought.content).toBe('Analyzing probability');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should create thought with prior and likelihood', () => {
      const input: ThinkingToolInput = {
        thought: 'Updating beliefs',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0.3,
        likelihood: 0.8,
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.prior.probability).toBe(0.3);
      expect(thought.likelihood.probability).toBe(0.8);
      expect(thought.posterior).toBeDefined();
    });

    it('should automatically calculate posterior', () => {
      const input: ThinkingToolInput = {
        thought: 'Calculating posterior',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0.5,
        likelihood: 0.9,
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      // Posterior should be calculated
      expect(thought.posterior.probability).toBeDefined();
      expect(thought.posterior.probability).toBeGreaterThan(0);
      expect(thought.posterior.probability).toBeLessThan(1);
    });

    it('should calculate posterior with evidence', () => {
      const input: ThinkingToolInput = {
        thought: 'Updating with evidence',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0.5,
        evidence: [
          {
            id: 'e1',
            description: 'Strong evidence',
            likelihoodGivenHypothesis: 0.9,
            likelihoodGivenNotHypothesis: 0.1,
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      // With strong evidence, posterior should be higher than prior
      expect(thought.posterior.probability).toBeGreaterThan(0.5);
    });

    it('should calculate Bayes factor', () => {
      const input: ThinkingToolInput = {
        thought: 'Computing Bayes factor',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        evidence: [
          {
            id: 'e1',
            description: 'Evidence',
            likelihoodGivenHypothesis: 0.8,
            likelihoodGivenNotHypothesis: 0.2,
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      // Bayes factor = 0.8 / 0.2 = 4
      expect(thought.bayesFactor).toBeCloseTo(4, 2);
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid Bayesian reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail for probability out of range (negative)', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: -0.1,
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PROBABILITY_OUT_OF_RANGE')).toBe(true);
    });

    it('should fail for probability out of range (>1)', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 1.5,
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'PROBABILITY_OUT_OF_RANGE')).toBe(true);
    });

    it('should warn for extreme probability (0)', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0,
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('Extreme probability'))).toBe(true);
    });

    it('should warn for extreme probability (1)', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        likelihood: 1,
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('Extreme probability'))).toBe(true);
    });

    it('should validate evidence likelihoods', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        evidence: [
          {
            id: 'e1',
            description: 'Bad evidence',
            likelihoodGivenHypothesis: 1.5, // Invalid
            likelihoodGivenNotHypothesis: 0.2,
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'LIKELIHOOD_OUT_OF_RANGE')).toBe(true);
    });

    it('should warn for low diagnostic evidence', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        evidence: [
          {
            id: 'e1',
            description: 'Low diagnostic evidence',
            likelihoodGivenHypothesis: 0.5,
            likelihoodGivenNotHypothesis: 0.48, // Very similar - low diagnostic value
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('diagnostic value'))).toBe(true);
    });

    it('should warn when no evidence provided', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'evidence')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.relatedModes).toContain(ThinkingMode.CAUSAL);
      expect(enhancements.relatedModes).toContain(ThinkingMode.EVIDENTIAL);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.mentalModels).toContain('Bayes Theorem');
      expect(enhancements.mentalModels).toContain('Likelihood Ratio');
    });

    it('should provide probability metrics', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0.3,
        likelihood: 0.8,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics).toBeDefined();
      expect(enhancements.metrics!.priorProbability).toBe(0.3);
      expect(enhancements.metrics!.likelihoodProbability).toBe(0.8);
      expect(enhancements.metrics!.posteriorProbability).toBeDefined();
    });

    it('should interpret Bayes factor strength', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        evidence: [
          {
            id: 'e1',
            description: 'Strong evidence',
            likelihoodGivenHypothesis: 0.95,
            likelihoodGivenNotHypothesis: 0.05,
          },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      // Strong evidence (BF = 19) should be noted
      expect(enhancements.suggestions!.some(s => s.includes('Strong evidence'))).toBe(true);
    });

    it('should suggest more evidence for small prior-posterior shift', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0.5,
        likelihood: 0.52, // Very similar - small update
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s => s.includes('diagnostic evidence'))).toBe(true);
    });

    it('should ask about disconfirming evidence for high posterior', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        posteriorProbability: 0.95,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.guidingQuestions!.some(q => q.includes('disconfirm'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support prior_elicitation', () => {
      expect(handler.supportsThoughtType!('prior_elicitation')).toBe(true);
    });

    it('should support posterior_update', () => {
      expect(handler.supportsThoughtType!('posterior_update')).toBe(true);
    });

    it('should support evidence_evaluation', () => {
      expect(handler.supportsThoughtType!('evidence_evaluation')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType!('unknown_type')).toBe(false);
    });
  });

  describe('posterior calculation accuracy', () => {
    it('should correctly apply Bayes theorem', () => {
      // P(H) = 0.5, P(E|H) = 0.8, P(E|~H) = 0.2
      // P(E) = 0.8 * 0.5 + 0.2 * 0.5 = 0.5
      // P(H|E) = (0.8 * 0.5) / 0.5 = 0.8
      const input: ThinkingToolInput = {
        thought: 'Test Bayes theorem',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0.5,
        evidence: [
          {
            id: 'e1',
            description: 'Test evidence',
            likelihoodGivenHypothesis: 0.8,
            likelihoodGivenNotHypothesis: 0.2,
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.posterior.probability).toBeCloseTo(0.8, 2);
    });

    it('should handle multiple evidence items', () => {
      const input: ThinkingToolInput = {
        thought: 'Multiple evidence',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'bayesian',
        priorProbability: 0.5,
        evidence: [
          {
            id: 'e1',
            description: 'Evidence 1',
            likelihoodGivenHypothesis: 0.8,
            likelihoodGivenNotHypothesis: 0.2,
          },
          {
            id: 'e2',
            description: 'Evidence 2',
            likelihoodGivenHypothesis: 0.9,
            likelihoodGivenNotHypothesis: 0.3,
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      // Multiple strong evidence should push posterior higher
      expect(thought.posterior.probability).toBeGreaterThan(0.9);
    });
  });
});
