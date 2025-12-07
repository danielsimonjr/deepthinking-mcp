/**
 * Unit tests for Bayesian reasoning mode
 */

import { describe, it, expect } from 'vitest';
import {
  ThinkingMode,
  isBayesianThought,
  type BayesianThought,
  type BayesianHypothesis,
  type BayesianEvidence,
} from '../../src/types/core.js';
import { ThoughtValidator } from '../../src/validation/validator.js';

describe('Bayesian Reasoning', () => {
  const validator = new ThoughtValidator();

  describe('isBayesianThought type guard', () => {
    it('should identify Bayesian thoughts correctly', () => {
      const thought: BayesianThought = {
        id: 'bayes-1',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Updating beliefs with evidence',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        hypothesis: {
          id: 'h1',
          statement: 'The system is compromised',
        },
        prior: {
          probability: 0.1,
          justification: 'Low base rate of compromises',
        },
        likelihood: {
          probability: 0.8,
          description: 'P(Evidence|Hypothesis)',
        },
        evidence: [],
        posterior: {
          probability: 0.45,
          calculation: 'P(H|E) = P(E|H) * P(H) / P(E)',
        },
      };

      expect(isBayesianThought(thought)).toBe(true);
    });
  });

  describe('Probability validation', () => {
    it('should validate prior probability range', async () => {
      const thought: BayesianThought = {
        id: 'bayes-2',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 1.5, // Invalid
          justification: 'Test',
        },
        likelihood: {
          probability: 0.5,
          description: 'Test',
        },
        evidence: [],
        posterior: {
          probability: 0.5,
          calculation: 'Test',
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Prior probability'))).toBe(true);
    });

    it('should validate likelihood probability range', async () => {
      const thought: BayesianThought = {
        id: 'bayes-3',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 0.3,
          justification: 'Test',
        },
        likelihood: {
          probability: -0.1, // Invalid
          description: 'Test',
        },
        evidence: [],
        posterior: {
          probability: 0.5,
          calculation: 'Test',
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Likelihood probability'))).toBe(true);
    });

    it('should validate posterior probability range', async () => {
      const thought: BayesianThought = {
        id: 'bayes-4',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 0.3,
          justification: 'Test',
        },
        likelihood: {
          probability: 0.7,
          description: 'Test',
        },
        evidence: [],
        posterior: {
          probability: 1.2, // Invalid
          calculation: 'Test',
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Posterior probability'))).toBe(true);
    });

    it('should warn if posterior calculation is missing', async () => {
      const thought: BayesianThought = {
        id: 'bayes-5',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 0.3,
          justification: 'Test',
        },
        likelihood: {
          probability: 0.7,
          description: 'Test',
        },
        evidence: [],
        posterior: {
          probability: 0.5,
          calculation: '', // Empty
        },
      };

      const result = await validator.validate(thought);
      expect(result.issues.some(i => i.description.includes('Posterior calculation should be shown'))).toBe(true);
    });
  });

  describe('Evidence validation', () => {
    it('should validate evidence likelihood given hypothesis', async () => {
      const thought: BayesianThought = {
        id: 'bayes-6',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 0.3,
          justification: 'Test',
        },
        likelihood: {
          probability: 0.7,
          description: 'Test',
        },
        evidence: [
          {
            id: 'e1',
            description: 'Test evidence',
            likelihoodGivenHypothesis: 1.5, // Invalid
            likelihoodGivenNotHypothesis: 0.2,
          },
        ],
        posterior: {
          probability: 0.5,
          calculation: 'Test',
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('P(E|H)'))).toBe(true);
    });

    it('should validate evidence likelihood given not hypothesis', async () => {
      const thought: BayesianThought = {
        id: 'bayes-7',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 0.3,
          justification: 'Test',
        },
        likelihood: {
          probability: 0.7,
          description: 'Test',
        },
        evidence: [
          {
            id: 'e1',
            description: 'Test evidence',
            likelihoodGivenHypothesis: 0.8,
            likelihoodGivenNotHypothesis: -0.1, // Invalid
          },
        ],
        posterior: {
          probability: 0.5,
          calculation: 'Test',
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('P(E|¬H)'))).toBe(true);
    });
  });

  describe('Bayes factor validation', () => {
    it('should validate Bayes factor is non-negative', async () => {
      const thought: BayesianThought = {
        id: 'bayes-8',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 0.3,
          justification: 'Test',
        },
        likelihood: {
          probability: 0.7,
          description: 'Test',
        },
        evidence: [],
        posterior: {
          probability: 0.5,
          calculation: 'Test',
        },
        bayesFactor: -1.0, // Invalid
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      // Check for Bayes factor validation error - matches both old and new message formats
      expect(result.issues.some(i => i.description.toLowerCase().includes('bayes factor') &&
        (i.description.includes('non-negative') || i.description.includes('0')))).toBe(true);
    });

    it('should provide info when Bayes factor > 1 (supports hypothesis)', async () => {
      const thought: BayesianThought = {
        id: 'bayes-9',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 0.3,
          justification: 'Test',
        },
        likelihood: {
          probability: 0.7,
          description: 'Test',
        },
        evidence: [],
        posterior: {
          probability: 0.6,
          calculation: 'Bayesian update',
        },
        bayesFactor: 3.5, // Supports hypothesis
      };

      const result = await validator.validate(thought);
      expect(result.issues.some(i => i.description.includes('evidence supports hypothesis'))).toBe(true);
    });

    it('should provide info when Bayes factor < 1 (contradicts hypothesis)', async () => {
      const thought: BayesianThought = {
        id: 'bayes-10',
        sessionId: 'session-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        hypothesis: {
          id: 'h1',
          statement: 'Test hypothesis',
        },
        prior: {
          probability: 0.5,
          justification: 'Test',
        },
        likelihood: {
          probability: 0.3,
          description: 'Test',
        },
        evidence: [],
        posterior: {
          probability: 0.2,
          calculation: 'Bayesian update',
        },
        bayesFactor: 0.4, // Contradicts hypothesis
      };

      const result = await validator.validate(thought);
      expect(result.issues.some(i => i.description.includes('evidence contradicts hypothesis'))).toBe(true);
    });
  });
});
