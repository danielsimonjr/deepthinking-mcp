/**
 * BayesianHandler Integration Tests
 *
 * Tests T-HDL-007 through T-HDL-011: Comprehensive tests for
 * BayesianHandler auto posterior calculation and evidence accumulation.
 *
 * Phase 11 Sprint 9: ModeHandler Specialized Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BayesianHandler } from '../../../src/modes/handlers/BayesianHandler.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('BayesianHandler Integration Tests', () => {
  let handler: BayesianHandler;

  beforeEach(() => {
    handler = new BayesianHandler();
  });

  function createInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Bayesian analysis thought',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'bayesian',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-HDL-007: Auto posterior calculation
  // ===========================================================================
  describe('T-HDL-007: Auto Posterior Calculation', () => {
    it('should calculate posterior from prior and likelihood', () => {
      const input = createInput({
        priorProbability: 0.3,
        likelihood: 0.8,
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.posterior).toBeDefined();
      expect(thought.posterior.probability).toBeGreaterThan(0);
      expect(thought.posterior.probability).toBeLessThan(1);
    });

    it('should use provided posterior if explicit', () => {
      const input = createInput({
        priorProbability: 0.3,
        likelihood: 0.8,
        posteriorProbability: 0.75,
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.posterior.probability).toBe(0.75);
    });

    it('should calculate reasonable posterior for high likelihood', () => {
      const input = createInput({
        priorProbability: 0.5,
        likelihood: 0.9,
      });

      const thought = handler.createThought(input, 'session-1');
      // With high likelihood, posterior should be > prior
      expect(thought.posterior.probability).toBeGreaterThan(0.5);
    });

    it('should calculate reasonable posterior for low likelihood', () => {
      const input = createInput({
        priorProbability: 0.5,
        likelihood: 0.1,
      });

      const thought = handler.createThought(input, 'session-1');
      // With low likelihood, posterior should be < prior
      expect(thought.posterior.probability).toBeLessThan(0.5);
    });
  });

  // ===========================================================================
  // T-HDL-008: Evidence accumulation
  // ===========================================================================
  describe('T-HDL-008: Evidence Accumulation', () => {
    it('should accumulate evidence for posterior update', () => {
      const input = createInput({
        priorProbability: 0.5,
        evidence: [
          {
            id: 'ev1',
            description: 'First evidence',
            likelihoodGivenHypothesis: 0.9,
            likelihoodGivenNotHypothesis: 0.2,
          },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.evidence).toHaveLength(1);
      expect(thought.posterior.probability).toBeGreaterThan(0.5);
    });

    it('should calculate Bayes factor from evidence', () => {
      const input = createInput({
        priorProbability: 0.5,
        evidence: [
          {
            id: 'ev1',
            description: 'Strong evidence',
            likelihoodGivenHypothesis: 0.9,
            likelihoodGivenNotHypothesis: 0.1,
          },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.bayesFactor).toBeDefined();
      expect(thought.bayesFactor).toBe(9); // 0.9 / 0.1 = 9
    });

    it('should handle multiple evidence items', () => {
      const input = createInput({
        priorProbability: 0.5,
        evidence: [
          {
            id: 'ev1',
            description: 'First evidence',
            likelihoodGivenHypothesis: 0.8,
            likelihoodGivenNotHypothesis: 0.3,
          },
          {
            id: 'ev2',
            description: 'Second evidence',
            likelihoodGivenHypothesis: 0.7,
            likelihoodGivenNotHypothesis: 0.4,
          },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.evidence).toHaveLength(2);
      expect(thought.bayesFactor).toBeDefined();
    });
  });

  // ===========================================================================
  // T-HDL-009: Prior update sequence
  // ===========================================================================
  describe('T-HDL-009: Prior Update Sequence', () => {
    it('should default prior to 0.5 if not provided', () => {
      const input = createInput({
        likelihood: 0.7,
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.prior.probability).toBe(0.5);
    });

    it('should use specified prior', () => {
      const input = createInput({
        priorProbability: 0.2,
        likelihood: 0.7,
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.prior.probability).toBe(0.2);
    });

    it('should validate prior in [0, 1] range', () => {
      const input = createInput({
        priorProbability: 1.5, // Invalid
        likelihood: 0.7,
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0].code).toBe('PROBABILITY_OUT_OF_RANGE');
    });

    it('should warn about extreme priors', () => {
      const input = createInput({
        priorProbability: 1.0, // Extreme
        likelihood: 0.7,
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings?.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // T-HDL-010: Likelihood computation
  // ===========================================================================
  describe('T-HDL-010: Likelihood Computation', () => {
    it('should default likelihood to 0.5 if not provided', () => {
      const input = createInput({
        priorProbability: 0.3,
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.likelihood.probability).toBe(0.5);
    });

    it('should use specified likelihood', () => {
      const input = createInput({
        priorProbability: 0.3,
        likelihood: 0.9,
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.likelihood.probability).toBe(0.9);
    });

    it('should validate likelihood in [0, 1] range', () => {
      const input = createInput({
        priorProbability: 0.5,
        likelihood: -0.1, // Invalid
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
    });

    it('should validate evidence likelihood ratios', () => {
      const input = createInput({
        priorProbability: 0.5,
        evidence: [
          {
            id: 'ev1',
            description: 'Invalid evidence',
            likelihoodGivenHypothesis: 1.5, // Invalid
            likelihoodGivenNotHypothesis: 0.3,
          },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
    });
  });

  // ===========================================================================
  // T-HDL-011: Normalization verification
  // ===========================================================================
  describe('T-HDL-011: Normalization Verification', () => {
    it('should clamp posterior to [0, 1]', () => {
      const input = createInput({
        priorProbability: 0.99,
        evidence: [
          {
            id: 'ev1',
            description: 'Very strong evidence',
            likelihoodGivenHypothesis: 0.999,
            likelihoodGivenNotHypothesis: 0.001,
          },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.posterior.probability).toBeLessThanOrEqual(1);
      expect(thought.posterior.probability).toBeGreaterThanOrEqual(0);
    });

    it('should handle near-zero denominator gracefully', () => {
      const input = createInput({
        priorProbability: 0.5,
        evidence: [
          {
            id: 'ev1',
            description: 'Extreme evidence',
            likelihoodGivenHypothesis: 0.001,
            likelihoodGivenNotHypothesis: 0.001,
          },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.posterior.probability).toBeGreaterThanOrEqual(0);
      expect(thought.posterior.probability).toBeLessThanOrEqual(1);
    });

    it('should provide enhancements with probability metrics', () => {
      const input = createInput({
        priorProbability: 0.3,
        likelihood: 0.8,
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.priorProbability).toBe(0.3);
      expect(enhancements.metrics?.posteriorProbability).toBeDefined();
    });

    it('should warn about low diagnostic evidence', () => {
      const input = createInput({
        priorProbability: 0.5,
        evidence: [
          {
            id: 'ev1',
            description: 'Low diagnostic value',
            likelihoodGivenHypothesis: 0.5,
            likelihoodGivenNotHypothesis: 0.48, // Very similar
          },
        ],
      });

      const result = handler.validate(input);
      expect(result.warnings?.some(w => w.message.includes('diagnostic'))).toBe(true);
    });
  });
});
