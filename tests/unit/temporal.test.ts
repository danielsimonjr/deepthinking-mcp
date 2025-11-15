/**
 * Unit tests for Temporal reasoning mode
 */

import { describe, it, expect } from 'vitest';
import {
  ThinkingMode,
  type BaseThought,
} from '../../src/types/core.js';
import {
  isTemporalThought,
  type TemporalThought,
  type Timeline,
  type TemporalEvent,
  type TimeInterval,
  type TemporalConstraint,
  type TemporalRelation,
} from '../../src/types/modes/temporal.js';
import { ThoughtValidator } from '../../src/validation/validator.js';

describe('Temporal Reasoning', () => {
  const validator = new ThoughtValidator();

  describe('isTemporalThought type guard', () => {
    it('should identify temporal thoughts correctly', () => {
      const thought: TemporalThought = {
        id: 'temp-1',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Building temporal model',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        thoughtType: 'event_definition',
        timeline: {
          id: 'tl-1',
          name: 'Project Timeline',
          timeUnit: 'days',
          events: [],
        },
        events: [],
      };

      expect(isTemporalThought(thought)).toBe(true);
    });

    it('should reject non-temporal thoughts', () => {
      const thought: BaseThought = {
        id: 'seq-1',
        sessionId: 'session-1',
        mode: ThinkingMode.SEQUENTIAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Not temporal',
        timestamp: new Date(),
        nextThoughtNeeded: false,
      };

      expect(isTemporalThought(thought)).toBe(false);
    });
  });

  describe('Timeline validation', () => {
    it('should require timeUnit for timeline', async () => {
      const thought: TemporalThought = {
        id: 'temp-2',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'event_definition',
        timeline: {
          id: 'tl-1',
          name: 'Timeline',
          timeUnit: undefined as any, // Invalid
          events: [],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('timeUnit'))).toBe(true);
    });

    it('should validate timeline chronological order', async () => {
      const thought: TemporalThought = {
        id: 'temp-3',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'sequence_construction',
        timeline: {
          id: 'tl-1',
          name: 'Timeline',
          timeUnit: 'hours',
          startTime: 100,
          endTime: 50, // Invalid: end before start
          events: [],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('startTime must be before endTime'))).toBe(true);
    });

    it('should accept valid timeline with proper time range', async () => {
      const thought: TemporalThought = {
        id: 'temp-4',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Valid timeline',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'sequence_construction',
        timeline: {
          id: 'tl-1',
          name: 'Valid Timeline',
          timeUnit: 'days',
          startTime: 0,
          endTime: 100,
          events: ['e1', 'e2'],
        },
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });

  describe('Event validation', () => {
    it('should validate interval events have duration', async () => {
      const thought: TemporalThought = {
        id: 'temp-5',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'event_definition',
        events: [
          {
            id: 'e1',
            name: 'Interval Event',
            description: 'Should have duration',
            timestamp: 10,
            type: 'interval',
            properties: {},
            // Missing duration
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('must have duration'))).toBe(true);
    });

    it('should validate event timestamps are non-negative', async () => {
      const thought: TemporalThought = {
        id: 'temp-6',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'event_definition',
        events: [
          {
            id: 'e1',
            name: 'Event',
            description: 'Invalid timestamp',
            timestamp: -10, // Invalid
            type: 'instant',
            properties: {},
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('negative timestamp'))).toBe(true);
    });

    it('should accept valid instant events', async () => {
      const thought: TemporalThought = {
        id: 'temp-7',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Valid events',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'event_definition',
        events: [
          {
            id: 'e1',
            name: 'Instant Event',
            description: 'A moment in time',
            timestamp: 42,
            type: 'instant',
            properties: { importance: 'high' },
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('should accept valid interval events with duration', async () => {
      const thought: TemporalThought = {
        id: 'temp-8',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Valid interval event',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'event_definition',
        events: [
          {
            id: 'e1',
            name: 'Interval Event',
            description: 'A period of time',
            timestamp: 10,
            duration: 5,
            type: 'interval',
            properties: { category: 'development' },
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });

  describe('Interval validation', () => {
    it('should validate interval start < end', async () => {
      const thought: TemporalThought = {
        id: 'temp-9',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'interval_analysis',
        intervals: [
          {
            id: 'i1',
            name: 'Invalid Interval',
            start: 100,
            end: 50, // Invalid: end before start
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('start must be before end'))).toBe(true);
    });

    it('should accept valid intervals', async () => {
      const thought: TemporalThought = {
        id: 'temp-10',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Valid intervals',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'interval_analysis',
        intervals: [
          {
            id: 'i1',
            name: 'Interval 1',
            start: 0,
            end: 10,
            overlaps: ['i2'],
          },
          {
            id: 'i2',
            name: 'Interval 2',
            start: 5,
            end: 15,
            overlaps: ['i1'],
            contains: [],
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });

  describe('Temporal constraint validation', () => {
    it('should validate constraint references exist', async () => {
      const thought: TemporalThought = {
        id: 'temp-11',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'temporal_constraint',
        events: [
          { id: 'e1', name: 'Event 1', description: 'Test', timestamp: 0, type: 'instant', properties: {} },
        ],
        constraints: [
          {
            id: 'c1',
            type: 'before',
            subject: 'e1',
            object: 'e999', // Non-existent
            confidence: 0.9,
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('not found in events or intervals'))).toBe(true);
    });

    it('should validate constraint confidence range', async () => {
      const thought: TemporalThought = {
        id: 'temp-12',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'temporal_constraint',
        events: [
          { id: 'e1', name: 'Event 1', description: 'Test', timestamp: 0, type: 'instant', properties: {} },
          { id: 'e2', name: 'Event 2', description: 'Test', timestamp: 10, type: 'instant', properties: {} },
        ],
        constraints: [
          {
            id: 'c1',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 1.5, // Invalid
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('confidence must be 0-1'))).toBe(true);
    });

    it('should accept valid temporal constraints', async () => {
      const thought: TemporalThought = {
        id: 'temp-13',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Valid constraints',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'temporal_constraint',
        events: [
          { id: 'e1', name: 'Event 1', description: 'First', timestamp: 0, type: 'instant', properties: {} },
          { id: 'e2', name: 'Event 2', description: 'Second', timestamp: 10, type: 'instant', properties: {} },
        ],
        constraints: [
          {
            id: 'c1',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 0.95,
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });

  describe('Temporal relation validation', () => {
    it('should validate relation references existing events', async () => {
      const thought: TemporalThought = {
        id: 'temp-14',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'causality_timeline',
        events: [
          { id: 'e1', name: 'Event 1', description: 'Test', timestamp: 0, type: 'instant', properties: {} },
        ],
        relations: [
          {
            id: 'r1',
            from: 'e1',
            to: 'e999', // Non-existent
            relationType: 'causes',
            strength: 0.8,
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('not found'))).toBe(true);
    });

    it('should validate relation strength range', async () => {
      const thought: TemporalThought = {
        id: 'temp-15',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'causality_timeline',
        events: [
          { id: 'e1', name: 'Event 1', description: 'Test', timestamp: 0, type: 'instant', properties: {} },
          { id: 'e2', name: 'Event 2', description: 'Test', timestamp: 10, type: 'instant', properties: {} },
        ],
        relations: [
          {
            id: 'r1',
            from: 'e1',
            to: 'e2',
            relationType: 'causes',
            strength: 1.5, // Invalid
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('strength must be 0-1'))).toBe(true);
    });

    it('should validate relation delay is non-negative', async () => {
      const thought: TemporalThought = {
        id: 'temp-16',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'causality_timeline',
        events: [
          { id: 'e1', name: 'Event 1', description: 'Test', timestamp: 0, type: 'instant', properties: {} },
          { id: 'e2', name: 'Event 2', description: 'Test', timestamp: 10, type: 'instant', properties: {} },
        ],
        relations: [
          {
            id: 'r1',
            from: 'e1',
            to: 'e2',
            relationType: 'causes',
            strength: 0.8,
            delay: -5, // Invalid
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('delay cannot be negative'))).toBe(true);
    });

    it('should accept valid temporal relations', async () => {
      const thought: TemporalThought = {
        id: 'temp-17',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Valid causal relations',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'causality_timeline',
        events: [
          { id: 'e1', name: 'Cause', description: 'Initial event', timestamp: 0, type: 'instant', properties: {} },
          { id: 'e2', name: 'Effect', description: 'Result event', timestamp: 10, type: 'instant', properties: {} },
        ],
        relations: [
          {
            id: 'r1',
            from: 'e1',
            to: 'e2',
            relationType: 'causes',
            strength: 0.85,
            delay: 10,
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });

  describe('Complete temporal thought validation', () => {
    it('should accept comprehensive temporal thought with all features', async () => {
      const thought: TemporalThought = {
        id: 'temp-18',
        sessionId: 'session-1',
        mode: 'temporal',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Complete temporal analysis of software development lifecycle',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'causality_timeline',
        timeline: {
          id: 'tl-1',
          name: 'Development Lifecycle',
          timeUnit: 'days',
          startTime: 0,
          endTime: 90,
          events: ['e1', 'e2', 'e3', 'e4'],
        },
        events: [
          {
            id: 'e1',
            name: 'Requirements Gathering',
            description: 'Collect and document requirements',
            timestamp: 0,
            duration: 10,
            type: 'interval',
            properties: { phase: 'planning' },
          },
          {
            id: 'e2',
            name: 'Design Complete',
            description: 'Design finalized',
            timestamp: 15,
            type: 'instant',
            properties: { milestone: true },
          },
          {
            id: 'e3',
            name: 'Development Phase',
            description: 'Implementation period',
            timestamp: 20,
            duration: 50,
            type: 'interval',
            properties: { phase: 'development' },
          },
          {
            id: 'e4',
            name: 'Deployment',
            description: 'Release to production',
            timestamp: 85,
            type: 'instant',
            properties: { milestone: true },
          },
        ],
        intervals: [
          {
            id: 'i1',
            name: 'Planning Phase',
            start: 0,
            end: 20,
            contains: [],
          },
          {
            id: 'i2',
            name: 'Execution Phase',
            start: 20,
            end: 85,
            contains: [],
          },
        ],
        constraints: [
          {
            id: 'c1',
            type: 'before',
            subject: 'e1',
            object: 'e2',
            confidence: 1.0,
          },
          {
            id: 'c2',
            type: 'before',
            subject: 'e2',
            object: 'e3',
            confidence: 0.95,
          },
        ],
        relations: [
          {
            id: 'r1',
            from: 'e1',
            to: 'e2',
            relationType: 'enables',
            strength: 0.9,
            delay: 5,
          },
          {
            id: 'r2',
            from: 'e2',
            to: 'e3',
            relationType: 'enables',
            strength: 0.95,
            delay: 5,
          },
          {
            id: 'r3',
            from: 'e3',
            to: 'e4',
            relationType: 'causes',
            strength: 1.0,
            delay: 15,
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
      expect(result.isValid).toBe(true);
    });
  });
});
