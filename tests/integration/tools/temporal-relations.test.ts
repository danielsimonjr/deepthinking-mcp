/**
 * Temporal Mode Integration Tests - Relations and Constraints
 *
 * Tests T-TMP-013 through T-TMP-030: Comprehensive integration tests
 * for the deepthinking_temporal tool focusing on Allen interval algebra
 * relations and temporal constraints.
 *
 * Phase 11 Sprint 4: Temporal & Probabilistic Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { TemporalThought } from '../../../src/types/modes/temporal.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

// Helper to create base temporal thought input
function createTemporalThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Analyzing temporal relations',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'temporal',
    ...overrides,
  } as ThinkingToolInput;
}

// Standard events for relation testing
const STANDARD_EVENTS = [
  {
    id: 'e1',
    name: 'Event A',
    description: 'First event',
    timestamp: 1000,
    type: 'instant' as const,
    properties: {},
  },
  {
    id: 'e2',
    name: 'Event B',
    description: 'Second event',
    timestamp: 2000,
    type: 'instant' as const,
    properties: {},
  },
];

describe('Temporal Mode Integration - Relations and Constraints', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-TMP-013: Temporal with relations array
   */
  describe('T-TMP-013: Temporal Relations Array', () => {
    it('should correctly store relations array', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        relations: [
          {
            id: 'r1',
            from: 'e1',
            to: 'e2',
            relationType: 'before',
            strength: 0.9,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-013') as TemporalThought;

      expect(thought.relations).toHaveLength(1);
      expect(thought.relations![0].from).toBe('e1');
      expect(thought.relations![0].to).toBe('e2');
    });
  });

  /**
   * T-TMP-014: Temporal with relations[].relationType = before
   */
  describe('T-TMP-014: Before Relation Type', () => {
    it('should correctly handle before relation type', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        relations: [
          {
            id: 'before-rel',
            from: 'e1',
            to: 'e2',
            relationType: 'before',
            strength: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-014') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('before');
    });
  });

  /**
   * T-TMP-015: Temporal with relations[].relationType = after
   */
  describe('T-TMP-015: After Relation Type', () => {
    it('should correctly handle after relation type', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        relations: [
          {
            id: 'after-rel',
            from: 'e2',
            to: 'e1',
            relationType: 'after',
            strength: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-015') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('after');
    });
  });

  /**
   * T-TMP-016: Temporal with relations[].relationType = during
   */
  describe('T-TMP-016: During Relation Type', () => {
    it('should correctly handle during relation type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'container',
            name: 'Container Event',
            description: 'Long event',
            timestamp: 0,
            duration: 1000,
            type: 'interval',
            properties: {},
          },
          {
            id: 'contained',
            name: 'Contained Event',
            description: 'Short event within container',
            timestamp: 500,
            type: 'instant',
            properties: {},
          },
        ],
        relations: [
          {
            id: 'during-rel',
            from: 'contained',
            to: 'container',
            relationType: 'during',
            strength: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-016') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('during');
    });
  });

  /**
   * T-TMP-017: Temporal with relations[].relationType = overlaps
   */
  describe('T-TMP-017: Overlaps Relation Type', () => {
    it('should correctly handle overlaps relation type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'early',
            name: 'Early Event',
            description: 'Starts first',
            timestamp: 0,
            duration: 100,
            type: 'interval',
            properties: {},
          },
          {
            id: 'late',
            name: 'Late Event',
            description: 'Starts during early',
            timestamp: 50,
            duration: 100,
            type: 'interval',
            properties: {},
          },
        ],
        relations: [
          {
            id: 'overlaps-rel',
            from: 'early',
            to: 'late',
            relationType: 'overlaps',
            strength: 0.8,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-017') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('overlaps');
    });
  });

  /**
   * T-TMP-018: Temporal with relations[].relationType = meets
   */
  describe('T-TMP-018: Meets Relation Type', () => {
    it('should correctly handle meets relation type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'first',
            name: 'First Event',
            description: 'Ends at t=100',
            timestamp: 0,
            duration: 100,
            type: 'interval',
            properties: {},
          },
          {
            id: 'second',
            name: 'Second Event',
            description: 'Starts at t=100',
            timestamp: 100,
            duration: 100,
            type: 'interval',
            properties: {},
          },
        ],
        relations: [
          {
            id: 'meets-rel',
            from: 'first',
            to: 'second',
            relationType: 'meets',
            strength: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-018') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('meets');
    });
  });

  /**
   * T-TMP-019: Temporal with relations[].relationType = starts
   */
  describe('T-TMP-019: Starts Relation Type', () => {
    it('should correctly handle starts relation type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'short',
            name: 'Short Event',
            description: 'Shorter duration',
            timestamp: 0,
            duration: 50,
            type: 'interval',
            properties: {},
          },
          {
            id: 'long',
            name: 'Long Event',
            description: 'Longer duration',
            timestamp: 0,
            duration: 100,
            type: 'interval',
            properties: {},
          },
        ],
        relations: [
          {
            id: 'starts-rel',
            from: 'short',
            to: 'long',
            relationType: 'starts',
            strength: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-019') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('starts');
    });
  });

  /**
   * T-TMP-020: Temporal with relations[].relationType = finishes
   */
  describe('T-TMP-020: Finishes Relation Type', () => {
    it('should correctly handle finishes relation type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'late-start',
            name: 'Late Start Event',
            description: 'Starts later but ends at same time',
            timestamp: 50,
            duration: 50,
            type: 'interval',
            properties: {},
          },
          {
            id: 'early-start',
            name: 'Early Start Event',
            description: 'Starts earlier',
            timestamp: 0,
            duration: 100,
            type: 'interval',
            properties: {},
          },
        ],
        relations: [
          {
            id: 'finishes-rel',
            from: 'late-start',
            to: 'early-start',
            relationType: 'finishes',
            strength: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-020') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('finishes');
    });
  });

  /**
   * T-TMP-021: Temporal with relations[].relationType = equals
   */
  describe('T-TMP-021: Equals Relation Type', () => {
    it('should correctly handle equals relation type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'event-a',
            name: 'Event A',
            description: 'Same timing as B',
            timestamp: 0,
            duration: 100,
            type: 'interval',
            properties: {},
          },
          {
            id: 'event-b',
            name: 'Event B',
            description: 'Same timing as A',
            timestamp: 0,
            duration: 100,
            type: 'interval',
            properties: {},
          },
        ],
        relations: [
          {
            id: 'equals-rel',
            from: 'event-a',
            to: 'event-b',
            relationType: 'equals',
            strength: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-021') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('equals');
    });
  });

  /**
   * T-TMP-022: Temporal with relations[].relationType = causes
   */
  describe('T-TMP-022: Causes Relation Type', () => {
    it('should correctly handle causes relation type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'cause',
            name: 'Cause Event',
            description: 'The triggering event',
            timestamp: 0,
            type: 'instant',
            properties: {},
          },
          {
            id: 'effect',
            name: 'Effect Event',
            description: 'The resulting event',
            timestamp: 100,
            type: 'instant',
            properties: {},
          },
        ],
        relations: [
          {
            id: 'causes-rel',
            from: 'cause',
            to: 'effect',
            relationType: 'causes',
            strength: 0.95,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-022') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('causes');
    });
  });

  /**
   * T-TMP-023: Temporal with relations[].delay
   */
  describe('T-TMP-023: Relation Delay', () => {
    it('should correctly store relation delay', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        relations: [
          {
            id: 'delayed-rel',
            from: 'e1',
            to: 'e2',
            relationType: 'before',
            strength: 0.9,
            delay: 500,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-023') as TemporalThought;

      expect(thought.relations![0].delay).toBe(500);
    });

    it('should handle zero delay', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        relations: [
          {
            id: 'no-delay-rel',
            from: 'e1',
            to: 'e2',
            relationType: 'meets',
            strength: 1.0,
            delay: 0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-023') as TemporalThought;

      expect(thought.relations![0].delay).toBe(0);
    });
  });

  /**
   * T-TMP-024: Temporal with relations[].strength
   */
  describe('T-TMP-024: Relation Strength', () => {
    it('should correctly store relation strength values', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        relations: [
          {
            id: 'strong-rel',
            from: 'e1',
            to: 'e2',
            relationType: 'before',
            strength: 1.0,
          },
          {
            id: 'weak-rel',
            from: 'e2',
            to: 'e1',
            relationType: 'after',
            strength: 0.3,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-024') as TemporalThought;

      expect(thought.relations![0].strength).toBe(1.0);
      expect(thought.relations![1].strength).toBe(0.3);
    });
  });

  /**
   * T-TMP-025: Temporal with constraints array
   */
  describe('T-TMP-025: Temporal Constraints Array', () => {
    it('should correctly store constraints array', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        constraints: [
          {
            id: 'c1',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 0.9,
          },
          {
            id: 'c2',
            type: 'after',
            subject: 'e2',
            object: 'e1',
            confidence: 0.9,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-025') as TemporalThought;

      expect(thought.constraints).toHaveLength(2);
      expect(thought.constraints![0].id).toBe('c1');
      expect(thought.constraints![1].id).toBe('c2');
    });
  });

  /**
   * T-TMP-026: Temporal with constraints[].type = before
   */
  describe('T-TMP-026: Before Constraint Type', () => {
    it('should correctly handle before constraint type', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        constraints: [
          {
            id: 'before-constraint',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 0.95,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-026') as TemporalThought;

      expect(thought.constraints![0].type).toBe('before');
    });
  });

  /**
   * T-TMP-027: Temporal with constraints[].type = after
   */
  describe('T-TMP-027: After Constraint Type', () => {
    it('should correctly handle after constraint type', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        constraints: [
          {
            id: 'after-constraint',
            type: 'after',
            subject: 'e2',
            object: 'e1',
            confidence: 0.95,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-027') as TemporalThought;

      expect(thought.constraints![0].type).toBe('after');
    });
  });

  /**
   * T-TMP-028: Temporal with constraints[].type = during
   */
  describe('T-TMP-028: During Constraint Type', () => {
    it('should correctly handle during constraint type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'outer',
            name: 'Outer Event',
            description: 'Contains inner',
            timestamp: 0,
            duration: 1000,
            type: 'interval',
            properties: {},
          },
          {
            id: 'inner',
            name: 'Inner Event',
            description: 'Within outer',
            timestamp: 200,
            duration: 300,
            type: 'interval',
            properties: {},
          },
        ],
        constraints: [
          {
            id: 'during-constraint',
            type: 'during',
            subject: 'inner',
            object: 'outer',
            confidence: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-028') as TemporalThought;

      expect(thought.constraints![0].type).toBe('during');
    });
  });

  /**
   * T-TMP-029: Temporal with constraints[].type = simultaneous
   */
  describe('T-TMP-029: Simultaneous Constraint Type', () => {
    it('should correctly handle simultaneous constraint type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'concurrent-a',
            name: 'Concurrent A',
            description: 'Happens at same time as B',
            timestamp: 1000,
            type: 'instant',
            properties: {},
          },
          {
            id: 'concurrent-b',
            name: 'Concurrent B',
            description: 'Happens at same time as A',
            timestamp: 1000,
            type: 'instant',
            properties: {},
          },
        ],
        constraints: [
          {
            id: 'simultaneous-constraint',
            type: 'simultaneous',
            subject: 'concurrent-a',
            object: 'concurrent-b',
            confidence: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-029') as TemporalThought;

      expect(thought.constraints![0].type).toBe('simultaneous');
    });
  });

  /**
   * T-TMP-030: Temporal with constraints[].confidence
   */
  describe('T-TMP-030: Constraint Confidence', () => {
    it('should correctly store constraint confidence values', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        constraints: [
          {
            id: 'high-confidence',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 0.99,
          },
          {
            id: 'medium-confidence',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 0.5,
          },
          {
            id: 'low-confidence',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 0.1,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-030') as TemporalThought;

      expect(thought.constraints![0].confidence).toBe(0.99);
      expect(thought.constraints![1].confidence).toBe(0.5);
      expect(thought.constraints![2].confidence).toBe(0.1);
    });

    it('should handle boundary confidence values', () => {
      const input = createTemporalThought({
        events: STANDARD_EVENTS,
        constraints: [
          {
            id: 'zero-confidence',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 0,
          },
          {
            id: 'full-confidence',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-030') as TemporalThought;

      expect(thought.constraints![0].confidence).toBe(0);
      expect(thought.constraints![1].confidence).toBe(1.0);
    });
  });
});
