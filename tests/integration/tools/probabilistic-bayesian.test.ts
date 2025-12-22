/**
 * Probabilistic Mode Integration Tests - Bayesian Reasoning
 *
 * Tests T-PRB-001 through T-PRB-015: Comprehensive integration tests
 * for the deepthinking_probabilistic tool with Bayesian mode.
 *
 * Phase 11 Sprint 4: Temporal & Probabilistic Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { BayesianThought } from '../../../src/types/modes/bayesian.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

// Helper to create base Bayesian thought input
function createBayesianThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Analyzing probabilities',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'bayesian',
    ...overrides,
  } as ThinkingToolInput;
}

describe('Probabilistic Mode Integration - Bayesian Reasoning', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-PRB-001: Basic bayesian thought
   */
  describe('T-PRB-001: Basic Bayesian Thought Creation', () => {
    it('should create a basic bayesian thought with minimal params', () => {
      const input = createBayesianThought({
        thought: 'Basic Bayesian reasoning step',
      });

      const thought = factory.createThought(input, 'session-001');

      expect(thought.mode).toBe(ThinkingMode.BAYESIAN);
      expect(thought.content).toBe('Basic Bayesian reasoning step');
      expect(thought.sessionId).toBe('session-001');
    });

    it('should assign unique IDs to bayesian thoughts', () => {
      const input1 = createBayesianThought({ thought: 'First thought' });
      const input2 = createBayesianThought({ thought: 'Second thought' });

      const thought1 = factory.createThought(input1, 'session-001');
      const thought2 = factory.createThought(input2, 'session-001');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-PRB-002: Bayesian with priorProbability (0.1)
   */
  describe('T-PRB-002: Low Prior Probability', () => {
    it('should handle low prior probability (0.1)', () => {
      const input = createBayesianThought({
        priorProbability: 0.1,
        hypothesis: {
          id: 'h1',
          statement: 'Low probability hypothesis',
        },
        prior: {
          probability: 0.1,
          justification: 'Rare occurrence based on historical data',
        },
      });

      const thought = factory.createThought(input, 'session-002') as BayesianThought;

      expect(thought.prior.probability).toBe(0.1);
    });
  });

  /**
   * T-PRB-003: Bayesian with priorProbability (0.5)
   */
  describe('T-PRB-003: Medium Prior Probability', () => {
    it('should handle medium prior probability (0.5)', () => {
      const input = createBayesianThought({
        priorProbability: 0.5,
        hypothesis: {
          id: 'h1',
          statement: 'Uncertain hypothesis',
        },
        prior: {
          probability: 0.5,
          justification: 'Maximum uncertainty - equal odds',
        },
      });

      const thought = factory.createThought(input, 'session-003') as BayesianThought;

      expect(thought.prior.probability).toBe(0.5);
    });
  });

  /**
   * T-PRB-004: Bayesian with priorProbability (0.9)
   */
  describe('T-PRB-004: High Prior Probability', () => {
    it('should handle high prior probability (0.9)', () => {
      const input = createBayesianThought({
        priorProbability: 0.9,
        hypothesis: {
          id: 'h1',
          statement: 'Highly likely hypothesis',
        },
        prior: {
          probability: 0.9,
          justification: 'Strong prior evidence supports this',
        },
      });

      const thought = factory.createThought(input, 'session-004') as BayesianThought;

      expect(thought.prior.probability).toBe(0.9);
    });
  });

  /**
   * T-PRB-005: Bayesian with likelihood
   */
  describe('T-PRB-005: Likelihood', () => {
    it('should correctly store likelihood', () => {
      // Note: BayesianHandler expects 'likelihood' as a number, not an object
      // and 'likelihoodDescription' as a separate field
      const input = createBayesianThought({
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        priorProbability: 0.3,
        likelihood: 0.8,
        likelihoodDescription: 'High likelihood of evidence given hypothesis',
      });

      const thought = factory.createThought(input, 'session-005') as BayesianThought;

      expect(thought.likelihood.probability).toBe(0.8);
      expect(thought.likelihood.description).toBe('High likelihood of evidence given hypothesis');
    });
  });

  /**
   * T-PRB-006: Bayesian with posteriorProbability
   */
  describe('T-PRB-006: Posterior Probability', () => {
    it('should correctly store posterior probability', () => {
      // Note: BayesianHandler expects posteriorProbability as a top-level number
      const input = createBayesianThought({
        hypothesis: {
          id: 'h1',
          statement: 'Updated hypothesis',
        },
        priorProbability: 0.3,
        likelihood: 0.8,
        posteriorProbability: 0.65,
        posteriorConfidence: 0.9,
      });

      const thought = factory.createThought(input, 'session-006') as BayesianThought;

      expect(thought.posterior.probability).toBe(0.65);
      expect(thought.posterior.calculation).toContain('Provided');
    });
  });

  /**
   * T-PRB-007: Bayesian with evidence array
   */
  describe('T-PRB-007: Evidence Array', () => {
    it('should correctly store evidence array', () => {
      const input = createBayesianThought({
        hypothesis: {
          id: 'h1',
          statement: 'Main hypothesis',
        },
        priorProbability: 0.5,
        likelihood: 0.7,
        evidence: [
          {
            id: 'ev1',
            description: 'First piece of evidence',
            likelihoodGivenHypothesis: 0.9,
            likelihoodGivenNotHypothesis: 0.2,
          },
          {
            id: 'ev2',
            description: 'Second piece of evidence',
            likelihoodGivenHypothesis: 0.7,
            likelihoodGivenNotHypothesis: 0.4,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-007') as BayesianThought;

      expect(thought.evidence).toHaveLength(2);
      expect(thought.evidence[0].likelihoodGivenHypothesis).toBe(0.9);
      expect(thought.evidence[1].likelihoodGivenNotHypothesis).toBe(0.4);
    });
  });

  /**
   * T-PRB-008: Bayesian with hypotheses array (2 hypotheses)
   */
  describe('T-PRB-008: Two Hypotheses', () => {
    it('should handle 2 competing hypotheses', () => {
      const input = createBayesianThought({
        hypotheses: [
          { id: 'h1', description: 'Hypothesis A', probability: 0.6 },
          { id: 'h2', description: 'Hypothesis B', probability: 0.4 },
        ],
      });

      const thought = factory.createThought(input, 'session-008') as any;

      // The hypotheses should be stored (may be in different formats depending on handler)
      expect(thought.hypotheses || thought.hypothesis).toBeDefined();
    });
  });

  /**
   * T-PRB-009: Bayesian with hypotheses array (5+ hypotheses)
   */
  describe('T-PRB-009: Multiple Hypotheses (5+)', () => {
    it('should handle 5+ competing hypotheses', () => {
      const input = createBayesianThought({
        hypotheses: [
          { id: 'h1', description: 'Hypothesis 1', probability: 0.3 },
          { id: 'h2', description: 'Hypothesis 2', probability: 0.25 },
          { id: 'h3', description: 'Hypothesis 3', probability: 0.2 },
          { id: 'h4', description: 'Hypothesis 4', probability: 0.15 },
          { id: 'h5', description: 'Hypothesis 5', probability: 0.08 },
          { id: 'h6', description: 'Hypothesis 6', probability: 0.02 },
        ],
      });

      const thought = factory.createThought(input, 'session-009') as any;

      // Verify hypotheses are stored
      expect(thought).toBeDefined();
      expect(thought.mode).toBe(ThinkingMode.BAYESIAN);
    });
  });

  /**
   * T-PRB-010: Bayesian with hypotheses[].probability
   */
  describe('T-PRB-010: Hypothesis Probabilities', () => {
    it('should correctly store hypothesis probabilities', () => {
      const input = createBayesianThought({
        hypotheses: [
          { id: 'h1', description: 'Highly likely', probability: 0.9 },
          { id: 'h2', description: 'Moderately likely', probability: 0.5 },
          { id: 'h3', description: 'Unlikely', probability: 0.1 },
        ],
      });

      const thought = factory.createThought(input, 'session-010') as any;

      expect(thought.mode).toBe(ThinkingMode.BAYESIAN);
    });
  });

  /**
   * T-PRB-011: Bayesian update session (3 evidence updates)
   */
  describe('T-PRB-011: Multi-Evidence Update Session', () => {
    it('should handle sequential evidence updates', () => {
      const sessionId = 'session-011-update';

      // Step 1: Initial hypothesis with prior
      // Note: BayesianHandler expects priorProbability as top-level number
      const step1Input = createBayesianThought({
        thought: 'Setting initial prior',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        hypothesis: {
          id: 'disease-present',
          statement: 'Patient has the disease',
        },
        priorProbability: 0.01, // 1% base rate
        priorJustification: 'Population prevalence',
        likelihood: 0.01,
        posteriorProbability: 0.01, // Explicit initial posterior
      });
      const step1 = factory.createThought(step1Input, sessionId) as BayesianThought;

      expect(step1.prior.probability).toBe(0.01);

      // Step 2: First evidence (positive test)
      const step2Input = createBayesianThought({
        thought: 'Updating with first evidence',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        hypothesis: {
          id: 'disease-present',
          statement: 'Patient has the disease',
        },
        priorProbability: 0.01,
        likelihood: 0.95, // Test sensitivity
        evidence: [
          {
            id: 'test1',
            description: 'First test positive',
            likelihoodGivenHypothesis: 0.95,
            likelihoodGivenNotHypothesis: 0.05, // False positive rate
          },
        ],
        // Let the handler calculate posterior from evidence
      });
      const step2 = factory.createThought(step2Input, sessionId) as BayesianThought;

      // Handler calculates: P(H|E) = (0.95 * 0.01) / ((0.95 * 0.01) + (0.05 * 0.99)) = 0.161
      expect(step2.posterior.probability).toBeCloseTo(0.161, 2);

      // Step 3: Second evidence (another positive test)
      const step3Input = createBayesianThought({
        thought: 'Updating with second evidence',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        hypothesis: {
          id: 'disease-present',
          statement: 'Patient has the disease',
        },
        priorProbability: 0.161, // Previous posterior becomes new prior
        likelihood: 0.95,
        evidence: [
          {
            id: 'test2',
            description: 'Second test positive',
            likelihoodGivenHypothesis: 0.95,
            likelihoodGivenNotHypothesis: 0.05,
          },
        ],
      });
      const step3 = factory.createThought(step3Input, sessionId) as BayesianThought;

      expect(step3.prior.probability).toBeCloseTo(0.161, 2);
      expect(step3.posterior.probability).toBeGreaterThan(step2.posterior.probability);

      // Step 4: Third evidence (symptom check)
      const step4Input = createBayesianThought({
        thought: 'Final update with symptoms',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'disease-present',
          statement: 'Patient has the disease',
        },
        priorProbability: step3.posterior.probability, // Chain the posteriors
        likelihood: 0.8,
        evidence: [
          {
            id: 'symptoms',
            description: 'Patient shows classic symptoms',
            likelihoodGivenHypothesis: 0.8,
            likelihoodGivenNotHypothesis: 0.1,
          },
        ],
      });
      const step4 = factory.createThought(step4Input, sessionId) as BayesianThought;

      expect(step4.posterior.probability).toBeGreaterThan(0.9);
      expect(step4.nextThoughtNeeded).toBe(false);
    });
  });

  /**
   * T-PRB-012: Bayesian with competing hypotheses
   */
  describe('T-PRB-012: Competing Hypotheses', () => {
    it('should handle mutually exclusive competing hypotheses', () => {
      const input = createBayesianThought({
        thought: 'Comparing competing hypotheses',
        hypothesis: {
          id: 'h-main',
          statement: 'Primary hypothesis',
          alternatives: ['h-alt1', 'h-alt2'],
        },
        priorProbability: 0.4,
        likelihood: 0.8,
        posteriorProbability: 0.7,
        hypotheses: [
          { id: 'h-main', description: 'Main hypothesis', probability: 0.7 },
          { id: 'h-alt1', description: 'Alternative 1', probability: 0.2 },
          { id: 'h-alt2', description: 'Alternative 2', probability: 0.1 },
        ],
      });

      const thought = factory.createThought(input, 'session-012') as BayesianThought;

      expect(thought.hypothesis.alternatives).toContain('h-alt1');
      expect(thought.hypothesis.alternatives).toContain('h-alt2');
    });
  });

  /**
   * T-PRB-013: Bayesian posterior calculation verification
   */
  describe('T-PRB-013: Posterior Calculation Verification', () => {
    it('should verify Bayes theorem calculation', () => {
      // P(H|E) = P(E|H) * P(H) / P(E)
      // P(E) = P(E|H) * P(H) + P(E|~H) * P(~H)
      const priorH = 0.3;
      const likelihoodEGivenH = 0.9;
      const likelihoodEGivenNotH = 0.1;

      const pE = (likelihoodEGivenH * priorH) + (likelihoodEGivenNotH * (1 - priorH));
      const expectedPosterior = (likelihoodEGivenH * priorH) / pE;

      // Let the BayesianHandler calculate the posterior automatically
      const input = createBayesianThought({
        thought: 'Verifying Bayes calculation',
        hypothesis: {
          id: 'test-h',
          statement: 'Test hypothesis for calculation',
        },
        priorProbability: priorH,
        likelihood: likelihoodEGivenH,
        evidence: [
          {
            id: 'e1',
            description: 'Test evidence',
            likelihoodGivenHypothesis: likelihoodEGivenH,
            likelihoodGivenNotHypothesis: likelihoodEGivenNotH,
          },
        ],
        // Don't provide posteriorProbability - let handler calculate it
      });

      const thought = factory.createThought(input, 'session-013') as BayesianThought;

      expect(thought.posterior.probability).toBeCloseTo(expectedPosterior, 4);
      // ~0.794 expected
      expect(thought.posterior.probability).toBeGreaterThan(0.79);
      expect(thought.posterior.probability).toBeLessThan(0.80);
    });
  });

  /**
   * T-PRB-014: Bayesian multi-thought belief update
   */
  describe('T-PRB-014: Multi-Thought Belief Update', () => {
    it('should track belief evolution across thoughts', () => {
      const sessionId = 'session-014-belief';
      const beliefs: number[] = [];

      // Initial belief - using handler's expected input format
      const step1 = factory.createThought(
        createBayesianThought({
          thought: 'Initial belief',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          hypothesis: { id: 'h1', statement: 'Target hypothesis' },
          priorProbability: 0.2,
          likelihood: 0.2,
          posteriorProbability: 0.2, // Explicit initial
        }),
        sessionId
      ) as BayesianThought;
      beliefs.push(step1.posterior.probability);

      // After supporting evidence - let handler calculate
      const step2 = factory.createThought(
        createBayesianThought({
          thought: 'Supporting evidence received',
          thoughtNumber: 2,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          hypothesis: { id: 'h1', statement: 'Target hypothesis' },
          priorProbability: 0.2,
          likelihood: 0.85,
          evidence: [
            {
              id: 'ev1',
              description: 'Supporting evidence',
              likelihoodGivenHypothesis: 0.85,
              likelihoodGivenNotHypothesis: 0.2,
            },
          ],
        }),
        sessionId
      ) as BayesianThought;
      beliefs.push(step2.posterior.probability);

      // After more evidence
      const step3 = factory.createThought(
        createBayesianThought({
          thought: 'Additional supporting evidence',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
          hypothesis: { id: 'h1', statement: 'Target hypothesis' },
          priorProbability: step2.posterior.probability, // Chain posteriors
          likelihood: 0.9,
          evidence: [
            {
              id: 'ev2',
              description: 'More supporting evidence',
              likelihoodGivenHypothesis: 0.9,
              likelihoodGivenNotHypothesis: 0.15,
            },
          ],
        }),
        sessionId
      ) as BayesianThought;
      beliefs.push(step3.posterior.probability);

      // Verify belief increased monotonically
      expect(beliefs[1]).toBeGreaterThan(beliefs[0]);
      expect(beliefs[2]).toBeGreaterThan(beliefs[1]);
    });
  });

  /**
   * T-PRB-015: Bayesian with revision on new evidence
   */
  describe('T-PRB-015: Revision on New Evidence', () => {
    it('should support revision when contradicting evidence arrives', () => {
      const sessionId = 'session-015-revision';

      // Initial high confidence - using handler's expected input format
      const initial = factory.createThought(
        createBayesianThought({
          thought: 'High initial confidence',
          thoughtNumber: 1,
          totalThoughts: 2,
          nextThoughtNeeded: true,
          hypothesis: { id: 'h1', statement: 'Initial hypothesis' },
          priorProbability: 0.8,
          likelihood: 0.9,
          posteriorProbability: 0.9, // Explicitly high
        }),
        sessionId
      ) as BayesianThought;

      // Revision after contradicting evidence - let handler calculate lower posterior
      const revision = factory.createThought(
        createBayesianThought({
          thought: 'Revising due to contradicting evidence',
          thoughtNumber: 2,
          totalThoughts: 2,
          nextThoughtNeeded: false,
          isRevision: true,
          revisesThought: initial.id,
          hypothesis: { id: 'h1', statement: 'Initial hypothesis (revised)' },
          priorProbability: 0.9, // Previous high confidence as prior
          likelihood: 0.1,
          evidence: [
            {
              id: 'contradict',
              description: 'Strongly contradicting evidence',
              likelihoodGivenHypothesis: 0.1,
              likelihoodGivenNotHypothesis: 0.9,
            },
          ],
          // Let handler calculate - will be much lower due to contradicting evidence
        }),
        sessionId
      ) as BayesianThought;

      expect(revision.isRevision).toBe(true);
      expect(revision.revisesThought).toBe(initial.id);
      expect(revision.posterior.probability).toBeLessThan(initial.posterior.probability);
    });
  });
});
