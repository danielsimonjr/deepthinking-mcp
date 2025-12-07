/**
 * Unit tests for Abductive reasoning mode
 */

import { describe, it, expect } from 'vitest';
import {
  ThinkingMode,
  isAbductiveThought,
  type AbductiveThought,
  type Observation,
  type Hypothesis,
  type Evidence,
  type EvaluationCriteria,
} from '../../src/types/core.js';
import { ThoughtValidator } from '../../src/validation/validator.js';

describe('Abductive Reasoning', () => {
  const validator = new ThoughtValidator();

  describe('isAbductiveThought type guard', () => {
    it('should identify abductive thoughts correctly', () => {
      const thought: AbductiveThought = {
        id: 'abd-1',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Analyzing observations to find best explanation',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        observations: [
          {
            id: 'obs-1',
            description: 'System crashed at 3 AM',
            confidence: 0.9,
          },
        ],
        hypotheses: [
          {
            id: 'hyp-1',
            explanation: 'Memory leak caused crash',
            assumptions: ['System has memory management'],
            predictions: ['Crash will recur if not fixed'],
            score: 0.8,
          },
        ],
        evaluationCriteria: {
          parsimony: 0.7,
          explanatoryPower: 0.8,
          plausibility: 0.75,
          testability: true,
        },
        evidence: [],
      };

      expect(isAbductiveThought(thought)).toBe(true);
    });
  });

  describe('Observation validation', () => {
    it('should require at least one observation', async () => {
      const thought: AbductiveThought = {
        id: 'abd-2',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        observations: [],
        hypotheses: [],
        evaluationCriteria: {
          parsimony: 0.5,
          explanatoryPower: 0.5,
          plausibility: 0.5,
          testability: true,
        },
        evidence: [],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      // Check for observations validation error - matches both old and new message formats
      expect(result.issues.some(i => i.description.toLowerCase().includes('observation') &&
        (i.description.includes('at least') || i.description.includes('empty')))).toBe(true);
    });

    it('should validate observation confidence range', async () => {
      const thought: AbductiveThought = {
        id: 'abd-3',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        observations: [
          {
            id: 'obs-1',
            description: 'Invalid observation',
            confidence: 1.5, // Invalid
          },
        ],
        hypotheses: [],
        evaluationCriteria: {
          parsimony: 0.5,
          explanatoryPower: 0.5,
          plausibility: 0.5,
          testability: true,
        },
        evidence: [],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      // Check for confidence validation error - matches both old and new message formats
      expect(result.issues.some(i => i.description.toLowerCase().includes('confidence') &&
        (i.description.includes('0') || i.description.includes('1') || i.description.includes('invalid')))).toBe(true);
    });
  });

  describe('Hypothesis validation', () => {
    it('should enforce unique hypothesis IDs', async () => {
      const thought: AbductiveThought = {
        id: 'abd-4',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        observations: [
          {
            id: 'obs-1',
            description: 'Test observation',
            confidence: 0.8,
          },
        ],
        hypotheses: [
          {
            id: 'hyp-1',
            explanation: 'First hypothesis',
            assumptions: [],
            predictions: [],
            score: 0.7,
          },
          {
            id: 'hyp-1', // Duplicate ID
            explanation: 'Second hypothesis',
            assumptions: [],
            predictions: [],
            score: 0.6,
          },
        ],
        evaluationCriteria: {
          parsimony: 0.5,
          explanatoryPower: 0.5,
          plausibility: 0.5,
          testability: true,
        },
        evidence: [],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Duplicate hypothesis ID'))).toBe(true);
    });

    it('should accept valid hypotheses with unique IDs', async () => {
      const thought: AbductiveThought = {
        id: 'abd-5',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        observations: [
          {
            id: 'obs-1',
            description: 'Test observation',
            confidence: 0.8,
          },
        ],
        hypotheses: [
          {
            id: 'hyp-1',
            explanation: 'First hypothesis',
            assumptions: ['Assumption 1'],
            predictions: ['Prediction 1'],
            score: 0.7,
          },
          {
            id: 'hyp-2',
            explanation: 'Second hypothesis',
            assumptions: ['Assumption 2'],
            predictions: ['Prediction 2'],
            score: 0.6,
          },
        ],
        evaluationCriteria: {
          parsimony: 0.5,
          explanatoryPower: 0.5,
          plausibility: 0.5,
          testability: true,
        },
        evidence: [],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });

  describe('Evaluation criteria validation', () => {
    it('should validate parsimony range', async () => {
      const thought: AbductiveThought = {
        id: 'abd-6',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        observations: [{ id: 'obs-1', description: 'Test', confidence: 0.8 }],
        hypotheses: [],
        evaluationCriteria: {
          parsimony: 1.5, // Invalid
          explanatoryPower: 0.5,
          plausibility: 0.5,
          testability: true,
        },
        evidence: [],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Parsimony'))).toBe(true);
    });

    it('should validate explanatory power range', async () => {
      const thought: AbductiveThought = {
        id: 'abd-7',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        observations: [{ id: 'obs-1', description: 'Test', confidence: 0.8 }],
        hypotheses: [],
        evaluationCriteria: {
          parsimony: 0.5,
          explanatoryPower: -0.1, // Invalid
          plausibility: 0.5,
          testability: true,
        },
        evidence: [],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Explanatory power'))).toBe(true);
    });

    it('should validate plausibility range', async () => {
      const thought: AbductiveThought = {
        id: 'abd-8',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        observations: [{ id: 'obs-1', description: 'Test', confidence: 0.8 }],
        hypotheses: [],
        evaluationCriteria: {
          parsimony: 0.5,
          explanatoryPower: 0.5,
          plausibility: 2.0, // Invalid
          testability: true,
        },
        evidence: [],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Plausibility'))).toBe(true);
    });
  });

  describe('Best explanation validation', () => {
    it('should validate best explanation references existing hypothesis', async () => {
      const thought: AbductiveThought = {
        id: 'abd-9',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        observations: [{ id: 'obs-1', description: 'Test', confidence: 0.8 }],
        hypotheses: [
          {
            id: 'hyp-1',
            explanation: 'Valid hypothesis',
            assumptions: [],
            predictions: [],
            score: 0.7,
          },
        ],
        evaluationCriteria: {
          parsimony: 0.5,
          explanatoryPower: 0.5,
          plausibility: 0.5,
          testability: true,
        },
        evidence: [],
        bestExplanation: {
          id: 'hyp-999', // Non-existent
          explanation: 'Invalid',
          assumptions: [],
          predictions: [],
          score: 0.9,
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Best explanation must be from the hypotheses list'))).toBe(true);
    });

    it('should accept valid best explanation', async () => {
      const hypothesis: Hypothesis = {
        id: 'hyp-1',
        explanation: 'Most likely explanation',
        assumptions: ['Key assumption'],
        predictions: ['Expected outcome'],
        score: 0.9,
      };

      const thought: AbductiveThought = {
        id: 'abd-10',
        sessionId: 'session-1',
        mode: ThinkingMode.ABDUCTIVE,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Selected best explanation',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        observations: [{ id: 'obs-1', description: 'Test', confidence: 0.8 }],
        hypotheses: [hypothesis],
        evaluationCriteria: {
          parsimony: 0.8,
          explanatoryPower: 0.9,
          plausibility: 0.85,
          testability: true,
        },
        evidence: [],
        bestExplanation: hypothesis, // Same reference
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });
});
