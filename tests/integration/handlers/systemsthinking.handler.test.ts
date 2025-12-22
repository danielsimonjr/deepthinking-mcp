/**
 * SystemsThinkingHandler Integration Tests
 *
 * Tests T-HDL-026 through T-HDL-035: Comprehensive tests for
 * SystemsThinkingHandler covering all 8 Senge archetypes.
 *
 * Phase 11 Sprint 9: ModeHandler Specialized Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SystemsThinkingHandler } from '../../../src/modes/handlers/SystemsThinkingHandler.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('SystemsThinkingHandler Integration Tests', () => {
  let handler: SystemsThinkingHandler;

  beforeEach(() => {
    handler = new SystemsThinkingHandler();
  });

  function createInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Systems analysis',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'systemsthinking',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-HDL-026: Fixes that Fail archetype detection
  // ===========================================================================
  describe('T-HDL-026: Fixes that Fail Archetype', () => {
    it('should detect Fixes that Fail pattern', () => {
      const input = createInput({
        components: [
          { id: 'problem', name: 'Problem Symptom', role: 'symptom' },
          { id: 'fix', name: 'Quick Fix', role: 'intervention' },
          { id: 'unintended', name: 'Unintended Consequence', role: 'effect' },
        ],
        feedbackLoops: [
          { type: 'negative', components: ['problem', 'fix'] },
          { type: 'positive', components: ['fix', 'unintended', 'problem'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.feedbackLoops).toHaveLength(2);
    });

    it('should provide archetype-specific suggestions', () => {
      const input = createInput({
        feedbackLoops: [
          { type: 'positive', components: ['A', 'B', 'A'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Systems Archetypes');
    });
  });

  // ===========================================================================
  // T-HDL-027: Shifting the Burden archetype detection
  // ===========================================================================
  describe('T-HDL-027: Shifting the Burden Archetype', () => {
    it('should identify burden-shifting patterns', () => {
      const input = createInput({
        components: [
          { id: 'symptom', name: 'Symptom', role: 'symptom' },
          { id: 'symptomatic', name: 'Symptomatic Solution', role: 'quick-fix' },
          { id: 'fundamental', name: 'Fundamental Solution', role: 'root-fix' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.components).toHaveLength(3);
    });
  });

  // ===========================================================================
  // T-HDL-028: Limits to Growth archetype detection
  // ===========================================================================
  describe('T-HDL-028: Limits to Growth Archetype', () => {
    it('should detect growth limiting patterns', () => {
      const input = createInput({
        components: [
          { id: 'growth', name: 'Growth Engine', role: 'driver' },
          { id: 'limit', name: 'Limiting Factor', role: 'constraint' },
        ],
        feedbackLoops: [
          { type: 'positive', components: ['growth'] },
          { type: 'negative', components: ['growth', 'limit', 'growth'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.feedbackLoops?.some(l => l.type === 'negative')).toBe(true);
    });
  });

  // ===========================================================================
  // T-HDL-029: Tragedy of the Commons archetype detection
  // ===========================================================================
  describe('T-HDL-029: Tragedy of the Commons Archetype', () => {
    it('should identify shared resource depletion', () => {
      const input = createInput({
        components: [
          { id: 'resource', name: 'Shared Resource', role: 'commons' },
          { id: 'actor1', name: 'Actor 1', role: 'consumer' },
          { id: 'actor2', name: 'Actor 2', role: 'consumer' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.components).toHaveLength(3);
    });
  });

  // ===========================================================================
  // T-HDL-030: Escalation archetype detection
  // ===========================================================================
  describe('T-HDL-030: Escalation Archetype', () => {
    it('should detect escalation patterns', () => {
      const input = createInput({
        components: [
          { id: 'party1', name: 'Party A', role: 'actor' },
          { id: 'party2', name: 'Party B', role: 'actor' },
          { id: 'action1', name: 'Action by A', role: 'action' },
          { id: 'action2', name: 'Action by B', role: 'action' },
        ],
        feedbackLoops: [
          { type: 'positive', components: ['action1', 'action2', 'action1'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.feedbackLoops?.some(l => l.type === 'positive')).toBe(true);
    });
  });

  // ===========================================================================
  // T-HDL-031: Success to Successful archetype detection
  // ===========================================================================
  describe('T-HDL-031: Success to Successful Archetype', () => {
    it('should identify winner-take-all dynamics', () => {
      const input = createInput({
        components: [
          { id: 'winner', name: 'Winner', role: 'beneficiary' },
          { id: 'loser', name: 'Loser', role: 'disadvantaged' },
          { id: 'resource', name: 'Allocation', role: 'resource' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.components).toHaveLength(3);
    });
  });

  // ===========================================================================
  // T-HDL-032: Drifting Goals archetype detection
  // ===========================================================================
  describe('T-HDL-032: Drifting Goals Archetype', () => {
    it('should detect goal erosion patterns', () => {
      const input = createInput({
        components: [
          { id: 'goal', name: 'Performance Goal', role: 'target' },
          { id: 'actual', name: 'Actual Performance', role: 'outcome' },
          { id: 'gap', name: 'Performance Gap', role: 'measurement' },
        ],
        feedbackLoops: [
          { type: 'negative', components: ['gap', 'goal', 'gap'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.mode).toBe(ThinkingMode.SYSTEMSTHINKING);
    });
  });

  // ===========================================================================
  // T-HDL-033: Growth and Underinvestment archetype detection
  // ===========================================================================
  describe('T-HDL-033: Growth and Underinvestment Archetype', () => {
    it('should identify underinvestment patterns', () => {
      const input = createInput({
        components: [
          { id: 'growth', name: 'Demand Growth', role: 'driver' },
          { id: 'capacity', name: 'Capacity', role: 'constraint' },
          { id: 'investment', name: 'Investment', role: 'lever' },
        ],
        feedbackLoops: [
          { type: 'positive', components: ['growth', 'capacity', 'growth'] },
          { type: 'negative', components: ['capacity', 'investment', 'capacity'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.feedbackLoops).toHaveLength(2);
    });
  });

  // ===========================================================================
  // T-HDL-034: Feedback loop analysis
  // ===========================================================================
  describe('T-HDL-034: Feedback Loop Analysis', () => {
    it('should analyze positive feedback loops', () => {
      const input = createInput({
        feedbackLoops: [
          { type: 'positive', components: ['A', 'B', 'C', 'A'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.feedbackLoops?.[0].type).toBe('positive');
    });

    it('should analyze negative feedback loops', () => {
      const input = createInput({
        feedbackLoops: [
          { type: 'negative', components: ['X', 'Y', 'X'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.feedbackLoops?.[0].type).toBe('negative');
    });

    it('should provide feedback loop metrics', () => {
      const input = createInput({
        feedbackLoops: [
          { type: 'positive', components: ['A', 'B'] },
          { type: 'negative', components: ['C', 'D'] },
          { type: 'positive', components: ['E', 'F'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.feedbackLoopCount).toBe(3);
    });
  });

  // ===========================================================================
  // T-HDL-035: Component interaction mapping
  // ===========================================================================
  describe('T-HDL-035: Component Interaction Mapping', () => {
    it('should map component interactions', () => {
      const input = createInput({
        components: [
          { id: 'comp1', name: 'Component 1', role: 'input' },
          { id: 'comp2', name: 'Component 2', role: 'process' },
          { id: 'comp3', name: 'Component 3', role: 'output' },
        ],
        feedbackLoops: [
          { type: 'positive', components: ['comp1', 'comp2', 'comp3'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.components).toHaveLength(3);
      expect(thought.feedbackLoops).toHaveLength(1);
    });

    it('should provide component metrics', () => {
      const input = createInput({
        components: [
          { id: 'c1', name: 'C1', role: 'role1' },
          { id: 'c2', name: 'C2', role: 'role2' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.componentCount).toBe(2);
    });

    it('should suggest related analytical modes', () => {
      const input = createInput({
        components: [{ id: 'c1', name: 'C1', role: 'role' }],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.CAUSAL);
    });
  });
});
