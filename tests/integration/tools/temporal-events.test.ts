/**
 * Temporal Mode Integration Tests - Events, Intervals, and Timestamps
 *
 * Tests T-TMP-001 through T-TMP-012: Comprehensive integration tests
 * for the deepthinking_temporal tool focusing on events, intervals,
 * timestamps, and durations.
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
    thought: 'Analyzing temporal events',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'temporal',
    ...overrides,
  } as ThinkingToolInput;
}

describe('Temporal Mode Integration - Events, Intervals, Timestamps', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-TMP-001: Basic temporal thought
   */
  describe('T-TMP-001: Basic Temporal Thought Creation', () => {
    it('should create a basic temporal thought with minimal params', () => {
      const input = createTemporalThought({
        thought: 'Basic temporal reasoning step',
      });

      const thought = factory.createThought(input, 'session-001');

      expect(thought.mode).toBe(ThinkingMode.TEMPORAL);
      expect(thought.content).toBe('Basic temporal reasoning step');
      expect(thought.sessionId).toBe('session-001');
    });

    it('should assign unique IDs to temporal thoughts', () => {
      const input1 = createTemporalThought({ thought: 'First thought' });
      const input2 = createTemporalThought({ thought: 'Second thought' });

      const thought1 = factory.createThought(input1, 'session-001');
      const thought2 = factory.createThought(input2, 'session-001');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-TMP-002: Temporal with events array (2 events)
   */
  describe('T-TMP-002: Temporal with 2 Events', () => {
    it('should include 2 events in thought', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'e1',
            name: 'Event 1',
            description: 'First event',
            timestamp: 1000,
            type: 'instant',
            properties: {},
          },
          {
            id: 'e2',
            name: 'Event 2',
            description: 'Second event',
            timestamp: 2000,
            type: 'instant',
            properties: {},
          },
        ],
      });

      const thought = factory.createThought(input, 'session-002') as TemporalThought;

      expect(thought.events).toHaveLength(2);
      expect(thought.events![0].id).toBe('e1');
      expect(thought.events![1].id).toBe('e2');
    });
  });

  /**
   * T-TMP-003: Temporal with events array (10+ events)
   */
  describe('T-TMP-003: Temporal with 10+ Events', () => {
    it('should handle 10+ events correctly', () => {
      const events = Array.from({ length: 12 }, (_, i) => ({
        id: `e${i + 1}`,
        name: `Event ${i + 1}`,
        description: `Description for event ${i + 1}`,
        timestamp: (i + 1) * 1000,
        type: 'instant' as const,
        properties: { index: i },
      }));

      const input = createTemporalThought({ events });

      const thought = factory.createThought(input, 'session-003') as TemporalThought;

      expect(thought.events).toHaveLength(12);
      expect(thought.events![11].id).toBe('e12');
      expect(thought.events![11].timestamp).toBe(12000);
    });
  });

  /**
   * T-TMP-004: Temporal with events[].type = instant
   */
  describe('T-TMP-004: Instant Event Type', () => {
    it('should correctly handle instant event type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'instant-event',
            name: 'Instant Event',
            description: 'An instantaneous event',
            timestamp: 5000,
            type: 'instant',
            properties: { priority: 'high' },
          },
        ],
      });

      const thought = factory.createThought(input, 'session-004') as TemporalThought;

      expect(thought.events![0].type).toBe('instant');
      expect(thought.events![0].duration).toBeUndefined();
    });
  });

  /**
   * T-TMP-005: Temporal with events[].type = interval
   */
  describe('T-TMP-005: Interval Event Type', () => {
    it('should correctly handle interval event type', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'interval-event',
            name: 'Interval Event',
            description: 'An event with duration',
            timestamp: 5000,
            duration: 3000,
            type: 'interval',
            properties: { category: 'process' },
          },
        ],
      });

      const thought = factory.createThought(input, 'session-005') as TemporalThought;

      expect(thought.events![0].type).toBe('interval');
      expect(thought.events![0].duration).toBe(3000);
    });
  });

  /**
   * T-TMP-006: Temporal with events[].duration
   */
  describe('T-TMP-006: Event Duration', () => {
    it('should correctly store event durations', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'short-event',
            name: 'Short Event',
            description: 'Short duration',
            timestamp: 0,
            duration: 100,
            type: 'interval',
            properties: {},
          },
          {
            id: 'long-event',
            name: 'Long Event',
            description: 'Long duration',
            timestamp: 500,
            duration: 5000,
            type: 'interval',
            properties: {},
          },
        ],
      });

      const thought = factory.createThought(input, 'session-006') as TemporalThought;

      expect(thought.events![0].duration).toBe(100);
      expect(thought.events![1].duration).toBe(5000);
    });
  });

  /**
   * T-TMP-007: Temporal with events[].timestamp
   */
  describe('T-TMP-007: Event Timestamps', () => {
    it('should correctly store event timestamps', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'e1',
            name: 'First',
            description: 'First event',
            timestamp: 0,
            type: 'instant',
            properties: {},
          },
          {
            id: 'e2',
            name: 'Second',
            description: 'Second event',
            timestamp: 1609459200000, // 2021-01-01
            type: 'instant',
            properties: {},
          },
          {
            id: 'e3',
            name: 'Third',
            description: 'Third event',
            timestamp: -86400000, // Negative timestamp (before epoch)
            type: 'instant',
            properties: {},
          },
        ],
      });

      const thought = factory.createThought(input, 'session-007') as TemporalThought;

      expect(thought.events![0].timestamp).toBe(0);
      expect(thought.events![1].timestamp).toBe(1609459200000);
      expect(thought.events![2].timestamp).toBe(-86400000);
    });
  });

  /**
   * T-TMP-008: Temporal with events[].properties
   */
  describe('T-TMP-008: Event Properties', () => {
    it('should correctly store arbitrary event properties', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'complex-event',
            name: 'Complex Event',
            description: 'Event with complex properties',
            timestamp: 1000,
            type: 'instant',
            properties: {
              priority: 'high',
              count: 42,
              tags: ['important', 'urgent'],
              metadata: { author: 'test', version: 1 },
            },
          },
        ],
      });

      const thought = factory.createThought(input, 'session-008') as TemporalThought;

      expect(thought.events![0].properties.priority).toBe('high');
      expect(thought.events![0].properties.count).toBe(42);
      expect(thought.events![0].properties.tags).toEqual(['important', 'urgent']);
      expect(thought.events![0].properties.metadata).toEqual({ author: 'test', version: 1 });
    });
  });

  /**
   * T-TMP-009: Temporal with intervals array
   */
  describe('T-TMP-009: Temporal Intervals Array', () => {
    it('should correctly store intervals array', () => {
      const input = createTemporalThought({
        intervals: [
          {
            id: 'i1',
            name: 'Interval 1',
            start: 0,
            end: 100,
          },
          {
            id: 'i2',
            name: 'Interval 2',
            start: 50,
            end: 150,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-009') as TemporalThought;

      expect(thought.intervals).toHaveLength(2);
      expect(thought.intervals![0].id).toBe('i1');
      expect(thought.intervals![1].id).toBe('i2');
    });
  });

  /**
   * T-TMP-010: Temporal with intervals[].start and .end
   */
  describe('T-TMP-010: Interval Start and End', () => {
    it('should correctly store interval boundaries', () => {
      const input = createTemporalThought({
        intervals: [
          {
            id: 'morning',
            name: 'Morning Shift',
            start: 8 * 3600000, // 8 AM in milliseconds
            end: 12 * 3600000, // 12 PM
          },
          {
            id: 'afternoon',
            name: 'Afternoon Shift',
            start: 12 * 3600000,
            end: 17 * 3600000, // 5 PM
          },
        ],
      });

      const thought = factory.createThought(input, 'session-010') as TemporalThought;

      expect(thought.intervals![0].start).toBe(8 * 3600000);
      expect(thought.intervals![0].end).toBe(12 * 3600000);
      expect(thought.intervals![1].start).toBe(12 * 3600000);
      expect(thought.intervals![1].end).toBe(17 * 3600000);
    });
  });

  /**
   * T-TMP-011: Temporal with intervals[].contains (event references)
   */
  describe('T-TMP-011: Interval Contains Events', () => {
    it('should correctly store event containment references', () => {
      const input = createTemporalThought({
        events: [
          {
            id: 'e1',
            name: 'Event 1',
            description: 'First event',
            timestamp: 100,
            type: 'instant',
            properties: {},
          },
          {
            id: 'e2',
            name: 'Event 2',
            description: 'Second event',
            timestamp: 200,
            type: 'instant',
            properties: {},
          },
        ],
        intervals: [
          {
            id: 'container',
            name: 'Container Interval',
            start: 0,
            end: 500,
            contains: ['e1', 'e2'],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-011') as TemporalThought;

      expect(thought.intervals![0].contains).toEqual(['e1', 'e2']);
    });
  });

  /**
   * T-TMP-012: Temporal with intervals[].overlaps (interval references)
   */
  describe('T-TMP-012: Interval Overlaps', () => {
    it('should correctly store interval overlap references', () => {
      const input = createTemporalThought({
        intervals: [
          {
            id: 'i1',
            name: 'Interval 1',
            start: 0,
            end: 100,
            overlaps: ['i2'],
          },
          {
            id: 'i2',
            name: 'Interval 2',
            start: 50,
            end: 150,
            overlaps: ['i1', 'i3'],
          },
          {
            id: 'i3',
            name: 'Interval 3',
            start: 100,
            end: 200,
            overlaps: ['i2'],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-012') as TemporalThought;

      expect(thought.intervals![0].overlaps).toEqual(['i2']);
      expect(thought.intervals![1].overlaps).toEqual(['i1', 'i3']);
      expect(thought.intervals![2].overlaps).toEqual(['i2']);
    });
  });
});
