/**
 * Unit tests for Counterfactual reasoning mode
 */

import { describe, it, expect } from 'vitest';
import {
  ThinkingMode,
  isCounterfactualThought,
  type CounterfactualThought,
  type Scenario,
} from '../../src/types/core.js';
import { ThoughtValidator } from '../../src/validation/validator.js';

describe('Counterfactual Reasoning', () => {
  const validator = new ThoughtValidator();

  describe('isCounterfactualThought type guard', () => {
    it('should identify counterfactual thoughts correctly', () => {
      const thought: CounterfactualThought = {
        id: 'cf-1',
        sessionId: 'session-1',
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Analyzing what-if scenarios',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        actual: {
          id: 'actual-1',
          name: 'What happened',
          description: 'The actual outcome',
          conditions: [],
          outcomes: [],
        },
        counterfactuals: [
          {
            id: 'cf-scenario-1',
            name: 'Alternative',
            description: 'What could have happened',
            conditions: [],
            outcomes: [],
          },
        ],
        comparison: {
          differences: [],
          insights: [],
          lessons: [],
        },
        interventionPoint: {
          description: 'Decision point at time T',
          alternatives: ['Choice A', 'Choice B'],
        },
      };

      expect(isCounterfactualThought(thought)).toBe(true);
    });
  });

  describe('Scenario validation', () => {
    it('should require actual scenario', async () => {
      const thought: CounterfactualThought = {
        id: 'cf-2',
        sessionId: 'session-1',
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        actual: undefined as any, // Missing
        counterfactuals: [
          {
            id: 'cf1',
            name: 'Alt',
            description: 'Test',
            conditions: [],
            outcomes: [],
          },
        ],
        comparison: {
          differences: [],
          insights: [],
          lessons: [],
        },
        interventionPoint: {
          description: 'Test',
          alternatives: [],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      // Check for actual scenario validation error - matches both old and new message formats
      expect(result.issues.some(i => i.description.toLowerCase().includes('actual') &&
        (i.description.includes('scenario') || i.description.includes('required')))).toBe(true);
    });

    it('should require at least one counterfactual scenario', async () => {
      const thought: CounterfactualThought = {
        id: 'cf-3',
        sessionId: 'session-1',
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        actual: {
          id: 'actual',
          name: 'Actual',
          description: 'Test',
          conditions: [],
          outcomes: [],
        },
        counterfactuals: [], // Empty
        comparison: {
          differences: [],
          insights: [],
          lessons: [],
        },
        interventionPoint: {
          description: 'Test',
          alternatives: [],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      // Check for counterfactual scenario validation error - matches both old and new message formats
      expect(result.issues.some(i => i.description.toLowerCase().includes('counterfactual') &&
        (i.description.includes('at least') || i.description.includes('empty')))).toBe(true);
    });

    it('should require intervention point', async () => {
      const thought: CounterfactualThought = {
        id: 'cf-4',
        sessionId: 'session-1',
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        actual: {
          id: 'actual',
          name: 'Actual',
          description: 'Test',
          conditions: [],
          outcomes: [],
        },
        counterfactuals: [
          {
            id: 'cf1',
            name: 'Alt',
            description: 'Test',
            conditions: [],
            outcomes: [],
          },
        ],
        comparison: {
          differences: [],
          insights: [],
          lessons: [],
        },
        interventionPoint: {
          description: '', // Empty
          alternatives: [],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Intervention point must be specified'))).toBe(true);
    });

    it('should validate scenario likelihood range', async () => {
      const thought: CounterfactualThought = {
        id: 'cf-5',
        sessionId: 'session-1',
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        actual: {
          id: 'actual',
          name: 'Actual',
          description: 'Test',
          conditions: [],
          outcomes: [],
          likelihood: 1.5, // Invalid
        },
        counterfactuals: [
          {
            id: 'cf1',
            name: 'Alt',
            description: 'Test',
            conditions: [],
            outcomes: [],
          },
        ],
        comparison: {
          differences: [],
          insights: [],
          lessons: [],
        },
        interventionPoint: {
          description: 'Test point',
          alternatives: [],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      // Check for likelihood validation error - matches both old and new message formats
      expect(result.issues.some(i => i.description.toLowerCase().includes('likelihood') &&
        (i.description.includes('0') || i.description.includes('1') || i.description.includes('invalid')))).toBe(true);
    });
  });

  describe('Comparison validation', () => {
    it('should warn if differences do not reference both actual and counterfactual', async () => {
      const thought: CounterfactualThought = {
        id: 'cf-6',
        sessionId: 'session-1',
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        actual: {
          id: 'actual',
          name: 'Actual',
          description: 'Test',
          conditions: [],
          outcomes: [],
        },
        counterfactuals: [
          {
            id: 'cf1',
            name: 'Alt',
            description: 'Test',
            conditions: [],
            outcomes: [],
          },
        ],
        comparison: {
          differences: [
            {
              aspect: 'Outcome',
              actual: 'Bad',
              counterfactual: '', // Missing
              significance: 'high',
            },
          ],
          insights: [],
          lessons: [],
        },
        interventionPoint: {
          description: 'Test point',
          alternatives: [],
        },
      };

      const result = await validator.validate(thought);
      expect(result.issues.some(i =>
        i.description.includes('should reference both actual and counterfactual')
      )).toBe(true);
    });

    it('should accept valid counterfactual analysis', async () => {
      const thought: CounterfactualThought = {
        id: 'cf-7',
        sessionId: 'session-1',
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Complete counterfactual analysis',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        actual: {
          id: 'actual',
          name: 'Actual scenario',
          description: 'What actually happened',
          conditions: [
            { factor: 'Decision', value: 'Choice A', isIntervention: false },
          ],
          outcomes: [
            { description: 'Project failed', impact: 'negative', magnitude: 0.8 },
          ],
          likelihood: 1.0,
        },
        counterfactuals: [
          {
            id: 'cf1',
            name: 'Alternative scenario',
            description: 'What if we chose B',
            conditions: [
              { factor: 'Decision', value: 'Choice B', isIntervention: true },
            ],
            outcomes: [
              { description: 'Project succeeded', impact: 'positive', magnitude: 0.7 },
            ],
            likelihood: 0.6,
          },
        ],
        comparison: {
          differences: [
            {
              aspect: 'Outcome',
              actual: 'Failure',
              counterfactual: 'Success',
              significance: 'high',
            },
          ],
          insights: ['Choice B would have been better'],
          lessons: ['Need better decision framework'],
        },
        interventionPoint: {
          description: 'Decision point at project kickoff',
          alternatives: ['Choice A', 'Choice B'],
          timestamp: '2024-01-01',
        },
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('should handle multiple counterfactual scenarios', async () => {
      const thought: CounterfactualThought = {
        id: 'cf-8',
        sessionId: 'session-1',
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Multiple scenarios',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        actual: {
          id: 'actual',
          name: 'Actual',
          description: 'What happened',
          conditions: [],
          outcomes: [],
        },
        counterfactuals: [
          {
            id: 'cf1',
            name: 'Scenario 1',
            description: 'First alternative',
            conditions: [],
            outcomes: [],
          },
          {
            id: 'cf2',
            name: 'Scenario 2',
            description: 'Second alternative',
            conditions: [],
            outcomes: [],
          },
          {
            id: 'cf3',
            name: 'Scenario 3',
            description: 'Third alternative',
            conditions: [],
            outcomes: [],
          },
        ],
        comparison: {
          differences: [],
          insights: ['Multiple paths were possible'],
          lessons: ['Need to explore alternatives'],
        },
        interventionPoint: {
          description: 'Key decision point',
          alternatives: ['Option A', 'Option B', 'Option C'],
        },
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });
});
