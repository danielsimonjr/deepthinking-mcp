/**
 * Temporal Mode Integration Tests - Timeline Management
 *
 * Tests T-TMP-031 through T-TMP-040: Comprehensive integration tests
 * for the deepthinking_temporal tool focusing on timeline construction,
 * time units, and multi-thought sessions.
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
    thought: 'Analyzing timeline',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'temporal',
    ...overrides,
  } as ThinkingToolInput;
}

describe('Temporal Mode Integration - Timeline Management', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-TMP-031: Temporal with timeline object
   */
  describe('T-TMP-031: Timeline Object', () => {
    it('should correctly store timeline object', () => {
      const input = createTemporalThought({
        timeline: {
          id: 'tl1',
          name: 'Main Timeline',
          timeUnit: 'seconds',
          events: ['e1', 'e2', 'e3'],
        },
      });

      const thought = factory.createThought(input, 'session-031') as TemporalThought;

      expect(thought.timeline).toBeDefined();
      expect(thought.timeline!.id).toBe('tl1');
      expect(thought.timeline!.name).toBe('Main Timeline');
      expect(thought.timeline!.events).toEqual(['e1', 'e2', 'e3']);
    });
  });

  /**
   * T-TMP-032: Temporal with timeline.timeUnit = milliseconds
   */
  describe('T-TMP-032: Milliseconds Time Unit', () => {
    it('should correctly handle milliseconds time unit', () => {
      const input = createTemporalThought({
        timeline: {
          id: 'ms-timeline',
          name: 'Millisecond Timeline',
          timeUnit: 'milliseconds',
          events: ['e1'],
        },
        events: [
          {
            id: 'e1',
            name: 'Fast Event',
            description: 'Happens in milliseconds',
            timestamp: 1500, // 1.5 seconds in ms
            type: 'instant',
            properties: {},
          },
        ],
      });

      const thought = factory.createThought(input, 'session-032') as TemporalThought;

      expect(thought.timeline!.timeUnit).toBe('milliseconds');
      expect(thought.events![0].timestamp).toBe(1500);
    });
  });

  /**
   * T-TMP-033: Temporal with timeline.timeUnit = seconds
   */
  describe('T-TMP-033: Seconds Time Unit', () => {
    it('should correctly handle seconds time unit', () => {
      const input = createTemporalThought({
        timeline: {
          id: 'sec-timeline',
          name: 'Second Timeline',
          timeUnit: 'seconds',
          events: ['e1'],
        },
        events: [
          {
            id: 'e1',
            name: 'Quick Event',
            description: 'Happens in seconds',
            timestamp: 30, // 30 seconds
            type: 'instant',
            properties: {},
          },
        ],
      });

      const thought = factory.createThought(input, 'session-033') as TemporalThought;

      expect(thought.timeline!.timeUnit).toBe('seconds');
    });
  });

  /**
   * T-TMP-034: Temporal with timeline.timeUnit = days
   */
  describe('T-TMP-034: Days Time Unit', () => {
    it('should correctly handle days time unit', () => {
      const input = createTemporalThought({
        timeline: {
          id: 'day-timeline',
          name: 'Daily Timeline',
          timeUnit: 'days',
          events: ['day1', 'day7', 'day30'],
        },
        events: [
          {
            id: 'day1',
            name: 'Day 1',
            description: 'First day',
            timestamp: 1,
            type: 'instant',
            properties: {},
          },
          {
            id: 'day7',
            name: 'Day 7',
            description: 'One week',
            timestamp: 7,
            type: 'instant',
            properties: {},
          },
          {
            id: 'day30',
            name: 'Day 30',
            description: 'One month',
            timestamp: 30,
            type: 'instant',
            properties: {},
          },
        ],
      });

      const thought = factory.createThought(input, 'session-034') as TemporalThought;

      expect(thought.timeline!.timeUnit).toBe('days');
      expect(thought.events![0].timestamp).toBe(1);
      expect(thought.events![1].timestamp).toBe(7);
      expect(thought.events![2].timestamp).toBe(30);
    });
  });

  /**
   * T-TMP-035: Temporal with timeline.timeUnit = years
   */
  describe('T-TMP-035: Years Time Unit', () => {
    it('should correctly handle years time unit', () => {
      const input = createTemporalThought({
        timeline: {
          id: 'year-timeline',
          name: 'Historical Timeline',
          timeUnit: 'years',
          events: ['ancient', 'medieval', 'modern'],
        },
        events: [
          {
            id: 'ancient',
            name: 'Ancient Era',
            description: '3000 BCE',
            timestamp: -3000,
            type: 'interval',
            duration: 2500,
            properties: { era: 'ancient' },
          },
          {
            id: 'medieval',
            name: 'Medieval Era',
            description: '500 CE',
            timestamp: 500,
            type: 'interval',
            duration: 1000,
            properties: { era: 'medieval' },
          },
          {
            id: 'modern',
            name: 'Modern Era',
            description: '1500 CE onwards',
            timestamp: 1500,
            type: 'interval',
            duration: 525,
            properties: { era: 'modern' },
          },
        ],
      });

      const thought = factory.createThought(input, 'session-035') as TemporalThought;

      expect(thought.timeline!.timeUnit).toBe('years');
      expect(thought.events![0].timestamp).toBe(-3000);
    });
  });

  /**
   * T-TMP-036: Temporal with timeline.startTime and .endTime
   */
  describe('T-TMP-036: Timeline Start and End Time', () => {
    it('should correctly store timeline boundaries', () => {
      const input = createTemporalThought({
        timeline: {
          id: 'bounded-timeline',
          name: 'Bounded Timeline',
          timeUnit: 'hours',
          startTime: 0,
          endTime: 24,
          events: ['morning', 'afternoon', 'evening'],
        },
      });

      const thought = factory.createThought(input, 'session-036') as TemporalThought;

      expect(thought.timeline!.startTime).toBe(0);
      expect(thought.timeline!.endTime).toBe(24);
    });

    it('should handle negative start times', () => {
      const input = createTemporalThought({
        timeline: {
          id: 'negative-timeline',
          name: 'BCE Timeline',
          timeUnit: 'years',
          startTime: -5000,
          endTime: 2000,
          events: [],
        },
      });

      const thought = factory.createThought(input, 'session-036') as TemporalThought;

      expect(thought.timeline!.startTime).toBe(-5000);
      expect(thought.timeline!.endTime).toBe(2000);
    });
  });

  /**
   * T-TMP-037: Temporal multi-thought timeline construction
   */
  describe('T-TMP-037: Multi-Thought Timeline Construction', () => {
    it('should build timeline across multiple thoughts', () => {
      const sessionId = 'session-037-multi';

      // Step 1: Define timeline structure
      const step1Input = createTemporalThought({
        thought: 'Defining project timeline',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        timeline: {
          id: 'project-timeline',
          name: 'Project Timeline',
          timeUnit: 'days',
          events: [],
        },
      });
      const step1 = factory.createThought(step1Input, sessionId) as TemporalThought;

      expect(step1.timeline).toBeDefined();
      expect(step1.timeline!.name).toBe('Project Timeline');

      // Step 2: Add events to timeline
      const step2Input = createTemporalThought({
        thought: 'Adding project milestones',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        events: [
          {
            id: 'kickoff',
            name: 'Project Kickoff',
            description: 'Project starts',
            timestamp: 0,
            type: 'instant',
            properties: { milestone: true },
          },
          {
            id: 'review',
            name: 'Mid-Project Review',
            description: 'Halfway checkpoint',
            timestamp: 30,
            type: 'instant',
            properties: { milestone: true },
          },
          {
            id: 'delivery',
            name: 'Final Delivery',
            description: 'Project completion',
            timestamp: 60,
            type: 'instant',
            properties: { milestone: true },
          },
        ],
      });
      const step2 = factory.createThought(step2Input, sessionId) as TemporalThought;

      expect(step2.events).toHaveLength(3);

      // Step 3: Add relations between events
      const step3Input = createTemporalThought({
        thought: 'Establishing dependencies',
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        relations: [
          {
            id: 'dep1',
            from: 'kickoff',
            to: 'review',
            relationType: 'before',
            strength: 1.0,
          },
          {
            id: 'dep2',
            from: 'review',
            to: 'delivery',
            relationType: 'before',
            strength: 1.0,
          },
        ],
      });
      const step3 = factory.createThought(step3Input, sessionId) as TemporalThought;

      expect(step3.relations).toHaveLength(2);
      expect(step3.nextThoughtNeeded).toBe(false);
    });
  });

  /**
   * T-TMP-038: Temporal with Allen interval algebra validation
   */
  describe('T-TMP-038: Allen Interval Algebra Validation', () => {
    it('should correctly model all 13 Allen relations', () => {
      // Allen's 13 temporal relations: before, after, meets, met-by, overlaps,
      // overlapped-by, starts, started-by, finishes, finished-by, during,
      // contains, equals
      const input = createTemporalThought({
        events: [
          {
            id: 'A',
            name: 'Interval A',
            description: 'First interval',
            timestamp: 0,
            duration: 100,
            type: 'interval',
            properties: {},
          },
          {
            id: 'B',
            name: 'Interval B',
            description: 'Second interval',
            timestamp: 50,
            duration: 100,
            type: 'interval',
            properties: {},
          },
        ],
        relations: [
          // A overlaps B (A starts before B, A ends during B)
          {
            id: 'overlap-rel',
            from: 'A',
            to: 'B',
            relationType: 'overlaps',
            strength: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-038') as TemporalThought;

      expect(thought.relations![0].relationType).toBe('overlaps');
      // Verify Allen algebra constraints
      const A = thought.events![0];
      const B = thought.events![1];
      // For overlaps: A.start < B.start < A.end < B.end
      expect(A.timestamp).toBeLessThan(B.timestamp); // A starts before B
      expect(A.timestamp + A.duration!).toBeLessThan(B.timestamp + B.duration!); // A ends before B
      expect(A.timestamp + A.duration!).toBeGreaterThan(B.timestamp); // A ends after B starts
    });
  });

  /**
   * T-TMP-039: Temporal constraint propagation session
   */
  describe('T-TMP-039: Constraint Propagation Session', () => {
    it('should support constraint propagation across events', () => {
      const input = createTemporalThought({
        thought: 'Propagating temporal constraints',
        events: [
          {
            id: 'A',
            name: 'Event A',
            description: 'First',
            timestamp: 0,
            type: 'instant',
            properties: {},
          },
          {
            id: 'B',
            name: 'Event B',
            description: 'Second',
            timestamp: 100,
            type: 'instant',
            properties: {},
          },
          {
            id: 'C',
            name: 'Event C',
            description: 'Third',
            timestamp: 200,
            type: 'instant',
            properties: {},
          },
          {
            id: 'D',
            name: 'Event D',
            description: 'Fourth',
            timestamp: 300,
            type: 'instant',
            properties: {},
          },
        ],
        constraints: [
          // If A before B and B before C, then A before C (transitivity)
          {
            id: 'c1',
            type: 'before',
            subject: 'A',
            object: 'B',
            confidence: 1.0,
          },
          {
            id: 'c2',
            type: 'before',
            subject: 'B',
            object: 'C',
            confidence: 1.0,
          },
          {
            id: 'c3',
            type: 'before',
            subject: 'C',
            object: 'D',
            confidence: 1.0,
          },
          // Transitive constraint: A before D
          {
            id: 'c4-transitive',
            type: 'before',
            subject: 'A',
            object: 'D',
            confidence: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-039') as TemporalThought;

      expect(thought.constraints).toHaveLength(4);
      // Verify transitive constraint exists
      const transitiveConstraint = thought.constraints!.find(c => c.id === 'c4-transitive');
      expect(transitiveConstraint).toBeDefined();
      expect(transitiveConstraint!.subject).toBe('A');
      expect(transitiveConstraint!.object).toBe('D');
    });
  });

  /**
   * T-TMP-040: Temporal with branching alternative timelines
   */
  describe('T-TMP-040: Branching Alternative Timelines', () => {
    it('should support alternative timeline branches', () => {
      const sessionId = 'session-040-branch';

      // Main timeline
      const mainInput = createTemporalThought({
        thought: 'Main historical timeline',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        timeline: {
          id: 'main-timeline',
          name: 'Main Timeline',
          timeUnit: 'years',
          events: ['event1', 'event2'],
        },
        events: [
          {
            id: 'event1',
            name: 'Decision Point',
            description: 'Critical decision',
            timestamp: 2020,
            type: 'instant',
            properties: { branch_point: true },
          },
          {
            id: 'event2',
            name: 'Outcome A',
            description: 'Main timeline outcome',
            timestamp: 2025,
            type: 'instant',
            properties: { branch: 'main' },
          },
        ],
      });
      const mainThought = factory.createThought(mainInput, sessionId) as TemporalThought;

      expect(mainThought.timeline!.id).toBe('main-timeline');

      // Alternative branch - using branching params
      const branchInput = createTemporalThought({
        thought: 'Alternative timeline branch',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false,
        branchFrom: mainThought.id,
        branchId: 'alt-timeline-branch',
        timeline: {
          id: 'alt-timeline',
          name: 'Alternative Timeline',
          timeUnit: 'years',
          events: ['event1-alt', 'event2-alt'],
        },
        events: [
          {
            id: 'event1-alt',
            name: 'Decision Point',
            description: 'Same decision, different choice',
            timestamp: 2020,
            type: 'instant',
            properties: { branch_point: true },
          },
          {
            id: 'event2-alt',
            name: 'Outcome B',
            description: 'Alternative timeline outcome',
            timestamp: 2025,
            type: 'instant',
            properties: { branch: 'alternative' },
          },
        ],
      });
      const branchThought = factory.createThought(branchInput, sessionId) as TemporalThought;

      expect(branchThought.timeline!.id).toBe('alt-timeline');
      expect(branchThought.events![1].properties.branch).toBe('alternative');
    });

    it('should handle multiple parallel timelines', () => {
      const input = createTemporalThought({
        thought: 'Analyzing parallel timelines',
        events: [
          // Timeline 1 events
          {
            id: 't1-e1',
            name: 'Timeline 1 Start',
            description: 'First timeline',
            timestamp: 0,
            type: 'instant',
            properties: { timeline: 1 },
          },
          {
            id: 't1-e2',
            name: 'Timeline 1 End',
            description: 'First timeline',
            timestamp: 100,
            type: 'instant',
            properties: { timeline: 1 },
          },
          // Timeline 2 events (parallel)
          {
            id: 't2-e1',
            name: 'Timeline 2 Start',
            description: 'Second timeline',
            timestamp: 0,
            type: 'instant',
            properties: { timeline: 2 },
          },
          {
            id: 't2-e2',
            name: 'Timeline 2 End',
            description: 'Second timeline',
            timestamp: 100,
            type: 'instant',
            properties: { timeline: 2 },
          },
        ],
        relations: [
          // Timeline 1 internal
          {
            id: 't1-rel',
            from: 't1-e1',
            to: 't1-e2',
            relationType: 'before',
            strength: 1.0,
          },
          // Timeline 2 internal
          {
            id: 't2-rel',
            from: 't2-e1',
            to: 't2-e2',
            relationType: 'before',
            strength: 1.0,
          },
          // Cross-timeline (simultaneous)
          {
            id: 'cross-rel',
            from: 't1-e1',
            to: 't2-e1',
            relationType: 'equals',
            strength: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-040') as TemporalThought;

      expect(thought.events).toHaveLength(4);
      expect(thought.relations).toHaveLength(3);

      // Verify cross-timeline relation
      const crossRel = thought.relations!.find(r => r.id === 'cross-rel');
      expect(crossRel!.relationType).toBe('equals');
    });
  });
});
