/**
 * Unit tests for Causal reasoning mode
 */

import { describe, it, expect } from 'vitest';
import {
  ThinkingMode,
  isCausalThought,
  type CausalThought,
  type CausalNode,
  type CausalEdge,
  type Intervention,
} from '../../src/types/core.js';
import { ThoughtValidator } from '../../src/validation/validator.js';

describe('Causal Reasoning', () => {
  const validator = new ThoughtValidator();

  describe('isCausalThought type guard', () => {
    it('should identify causal thoughts correctly', () => {
      const thought: CausalThought = {
        id: 'caus-1',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Building causal model',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Cause', type: 'cause', description: 'Root cause' },
            { id: 'n2', name: 'Effect', type: 'effect', description: 'Final effect' },
          ],
          edges: [
            { from: 'n1', to: 'n2', strength: 0.8, confidence: 0.9 },
          ],
        },
        mechanisms: [],
      };

      expect(isCausalThought(thought)).toBe(true);
    });
  });

  describe('Causal graph validation', () => {
    it('should validate edge references to existing nodes', async () => {
      const thought: CausalThought = {
        id: 'caus-2',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Node 1', type: 'cause', description: 'Test' },
          ],
          edges: [
            { from: 'n1', to: 'n999', strength: 0.5, confidence: 0.8 }, // Invalid target
          ],
        },
        mechanisms: [],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('non-existent target node'))).toBe(true);
    });

    it('should validate edge strength range (-1 to 1)', async () => {
      const thought: CausalThought = {
        id: 'caus-3',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Node 1', type: 'cause', description: 'Test' },
            { id: 'n2', name: 'Node 2', type: 'effect', description: 'Test' },
          ],
          edges: [
            { from: 'n1', to: 'n2', strength: 1.5, confidence: 0.8 }, // Invalid strength
          ],
        },
        mechanisms: [],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('strength must be between -1 and 1'))).toBe(true);
    });

    it('should validate edge confidence range (0 to 1)', async () => {
      const thought: CausalThought = {
        id: 'caus-4',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Node 1', type: 'cause', description: 'Test' },
            { id: 'n2', name: 'Node 2', type: 'effect', description: 'Test' },
          ],
          edges: [
            { from: 'n1', to: 'n2', strength: 0.8, confidence: 1.2 }, // Invalid confidence
          ],
        },
        mechanisms: [],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('confidence must be between 0 and 1'))).toBe(true);
    });

    it('should detect cycles in causal graph', async () => {
      const thought: CausalThought = {
        id: 'caus-5',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Node 1', type: 'cause', description: 'Test' },
            { id: 'n2', name: 'Node 2', type: 'mediator', description: 'Test' },
            { id: 'n3', name: 'Node 3', type: 'effect', description: 'Test' },
          ],
          edges: [
            { from: 'n1', to: 'n2', strength: 0.8, confidence: 0.9 },
            { from: 'n2', to: 'n3', strength: 0.7, confidence: 0.8 },
            { from: 'n3', to: 'n1', strength: 0.5, confidence: 0.6 }, // Creates cycle
          ],
        },
        mechanisms: [],
      };

      const result = await validator.validate(thought);
      expect(result.issues.some(i => i.description.includes('cycles'))).toBe(true);
    });

    it('should allow cycles when feedback mechanism is marked', async () => {
      const thought: CausalThought = {
        id: 'caus-6',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Node 1', type: 'cause', description: 'Test' },
            { id: 'n2', name: 'Node 2', type: 'effect', description: 'Test' },
          ],
          edges: [
            { from: 'n1', to: 'n2', strength: 0.8, confidence: 0.9 },
            { from: 'n2', to: 'n1', strength: 0.5, confidence: 0.6 },
          ],
        },
        mechanisms: [
          {
            from: 'n2',
            to: 'n1',
            description: 'Feedback loop',
            type: 'feedback',
          },
        ],
      };

      const result = await validator.validate(thought);
      const cycleWarnings = result.issues.filter(i => i.description.includes('cycles'));
      expect(cycleWarnings.length).toBe(0);
    });
  });

  describe('Intervention validation', () => {
    it('should validate intervention references existing nodes', async () => {
      const thought: CausalThought = {
        id: 'caus-7',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Node 1', type: 'cause', description: 'Test' },
          ],
          edges: [],
        },
        mechanisms: [],
        interventions: [
          {
            nodeId: 'n999', // Non-existent
            action: 'Modify variable',
            expectedEffects: [],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Intervention references non-existent node'))).toBe(true);
    });

    it('should validate intervention expected effects reference existing nodes', async () => {
      const thought: CausalThought = {
        id: 'caus-8',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Node 1', type: 'cause', description: 'Test' },
          ],
          edges: [],
        },
        mechanisms: [],
        interventions: [
          {
            nodeId: 'n1',
            action: 'Modify variable',
            expectedEffects: [
              {
                nodeId: 'n999', // Non-existent
                expectedChange: 'Increase',
                confidence: 0.7,
              },
            ],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Intervention effect references non-existent node'))).toBe(true);
    });

    it('should validate intervention effect confidence range', async () => {
      const thought: CausalThought = {
        id: 'caus-9',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Node 1', type: 'cause', description: 'Test' },
            { id: 'n2', name: 'Node 2', type: 'effect', description: 'Test' },
          ],
          edges: [],
        },
        mechanisms: [],
        interventions: [
          {
            nodeId: 'n1',
            action: 'Modify variable',
            expectedEffects: [
              {
                nodeId: 'n2',
                expectedChange: 'Increase',
                confidence: 1.5, // Invalid
              },
            ],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Intervention effect confidence'))).toBe(true);
    });

    it('should accept valid causal graph with interventions', async () => {
      const thought: CausalThought = {
        id: 'caus-10',
        sessionId: 'session-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Complete causal analysis',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Root Cause', type: 'cause', description: 'Initial factor' },
            { id: 'n2', name: 'Mediator', type: 'mediator', description: 'Intermediate' },
            { id: 'n3', name: 'Effect', type: 'effect', description: 'Final outcome' },
          ],
          edges: [
            { from: 'n1', to: 'n2', strength: 0.8, confidence: 0.9 },
            { from: 'n2', to: 'n3', strength: 0.7, confidence: 0.85 },
          ],
        },
        mechanisms: [
          {
            from: 'n1',
            to: 'n2',
            description: 'Direct causal mechanism',
            type: 'direct',
          },
        ],
        interventions: [
          {
            nodeId: 'n1',
            action: 'Increase by 10%',
            expectedEffects: [
              {
                nodeId: 'n3',
                expectedChange: 'Increase by 5.6%',
                confidence: 0.76,
              },
            ],
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });
});
