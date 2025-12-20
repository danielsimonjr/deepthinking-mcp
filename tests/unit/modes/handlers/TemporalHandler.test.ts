/**
 * TemporalHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for Temporal reasoning handler including:
 * - Timeline validation and consistency checking
 * - Allen's interval algebra relations
 * - Event ordering and sequencing
 * - Duration and overlap analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TemporalHandler } from '../../../../src/modes/handlers/TemporalHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('TemporalHandler', () => {
  let handler: TemporalHandler;

  beforeEach(() => {
    handler = new TemporalHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.TEMPORAL);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Temporal Reasoning');
    });

    it('should have a description', () => {
      expect(handler.description).toBeDefined();
      expect(handler.description).toContain('Allen');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Analyzing timeline of events',
      thoughtNumber: 1,
      totalThoughts: 4,
      nextThoughtNeeded: true,
      mode: 'temporal',
    };
    const sessionId = 'test-session-temporal';

    it('should create a temporal thought with default thought type', () => {
      const thought = handler.createThought(baseInput, sessionId);

      expect(thought.id).toBeDefined();
      expect(thought.sessionId).toBe(sessionId);
      expect(thought.mode).toBe(ThinkingMode.TEMPORAL);
      expect(thought.thoughtType).toBe('event_definition');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with event_definition type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'event_definition',
        events: [
          { id: 'E1', name: 'Start', description: 'Project start', timestamp: 0, type: 'instant' },
          { id: 'E2', name: 'End', description: 'Project end', timestamp: 100, type: 'instant' },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('event_definition');
      expect(thought.events).toHaveLength(2);
      expect(thought.events![0].type).toBe('instant');
    });

    it('should create thought with interval_analysis type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'interval_analysis',
        events: [
          { id: 'E1', name: 'Meeting', description: 'Team meeting', timestamp: 10, type: 'interval', duration: 60 },
        ],
        intervals: [
          { id: 'I1', name: 'Work hours', start: 9, end: 17, contains: ['E1'] },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('interval_analysis');
      expect(thought.intervals).toHaveLength(1);
      expect(thought.intervals![0].contains).toContain('E1');
    });

    it('should create thought with temporal_constraint type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'temporal_constraint',
        events: [
          { id: 'E1', name: 'A', timestamp: 0, type: 'instant' },
          { id: 'E2', name: 'B', timestamp: 10, type: 'instant' },
        ],
        constraints: [
          { id: 'C1', type: 'before', subject: 'E1', object: 'E2', confidence: 1.0 },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('temporal_constraint');
      expect(thought.constraints).toHaveLength(1);
    });

    it('should create thought with sequence_construction type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'sequence_construction',
        events: [
          { id: 'E1', name: 'Step 1', timestamp: 0, type: 'instant' },
          { id: 'E2', name: 'Step 2', timestamp: 1, type: 'instant' },
          { id: 'E3', name: 'Step 3', timestamp: 2, type: 'instant' },
        ],
        relations: [
          { id: 'R1', from: 'E1', to: 'E2', relationType: 'precedes', strength: 1 },
          { id: 'R2', from: 'E2', to: 'E3', relationType: 'precedes', strength: 1 },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('sequence_construction');
      expect(thought.relations).toHaveLength(2);
    });

    it('should create thought with causality_timeline type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'causality_timeline',
        events: [
          { id: 'E1', name: 'Cause', timestamp: 0, type: 'instant' },
          { id: 'E2', name: 'Effect', timestamp: 5, type: 'instant' },
        ],
        relations: [
          { id: 'R1', from: 'E1', to: 'E2', relationType: 'causes', strength: 0.9 },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('causality_timeline');
      expect(thought.relations![0].relationType).toBe('causes');
    });

    it('should create thought with timeline definition', () => {
      const input = {
        ...baseInput,
        thoughtType: 'event_definition',
        timeline: {
          id: 'T1',
          name: 'Project Timeline',
          timeUnit: 'days',
          startTime: 0,
          endTime: 100,
          events: ['E1', 'E2', 'E3'],
        },
        events: [
          { id: 'E1', name: 'Start', timestamp: 0, type: 'instant' },
          { id: 'E2', name: 'Milestone', timestamp: 50, type: 'instant' },
          { id: 'E3', name: 'End', timestamp: 100, type: 'instant' },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.timeline).toBeDefined();
      expect(thought.timeline!.timeUnit).toBe('days');
      expect(thought.timeline!.events).toHaveLength(3);
    });

    it('should default to event_definition for invalid thought type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'invalid_type',
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('event_definition');
    });
  });

  describe('validate', () => {
    it('should warn when no events are defined', () => {
      const input: ThinkingToolInput = {
        thought: 'Starting temporal analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'temporal',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'events')).toBe(true);
    });

    it('should error when relation references unknown event', () => {
      const input = {
        thought: 'Invalid relation',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'temporal',
        events: [
          { id: 'E1', name: 'Event 1', timestamp: 0, type: 'instant' },
        ],
        relations: [
          { id: 'R1', from: 'E1', to: 'E_UNKNOWN', relationType: 'precedes', strength: 1 },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('E_UNKNOWN'))).toBe(true);
    });

    it('should error when relation from event is unknown', () => {
      const input = {
        thought: 'Invalid relation',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'temporal',
        events: [
          { id: 'E2', name: 'Event 2', timestamp: 10, type: 'instant' },
        ],
        relations: [
          { id: 'R1', from: 'E_UNKNOWN', to: 'E2', relationType: 'precedes', strength: 1 },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('E_UNKNOWN'))).toBe(true);
    });

    it('should warn about temporal inconsistencies (A before B and B before A)', () => {
      const input = {
        thought: 'Inconsistent timeline',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'temporal',
        events: [
          { id: 'E1', name: 'Event 1', timestamp: 0, type: 'instant' },
          { id: 'E2', name: 'Event 2', timestamp: 10, type: 'instant' },
        ],
        relations: [
          { id: 'R1', from: 'E1', to: 'E2', relationType: 'precedes', strength: 1 },
          { id: 'R2', from: 'E2', to: 'E1', relationType: 'precedes', strength: 1 },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true); // Still valid, but with warnings
      expect(result.warnings.some((w) => w.message.includes('inconsistency'))).toBe(true);
    });

    it('should detect causal loop inconsistencies', () => {
      const input = {
        thought: 'Causal loop',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'temporal',
        events: [
          { id: 'E1', name: 'Cause', timestamp: 0, type: 'instant' },
          { id: 'E2', name: 'Effect', timestamp: 10, type: 'instant' },
        ],
        relations: [
          { id: 'R1', from: 'E1', to: 'E2', relationType: 'causes', strength: 1 },
          { id: 'R2', from: 'E2', to: 'E1', relationType: 'causes', strength: 1 },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.warnings.some((w) => w.message.includes('inconsistency'))).toBe(true);
    });

    it('should pass validation with consistent timeline', () => {
      const input = {
        thought: 'Consistent timeline',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'temporal',
        events: [
          { id: 'E1', name: 'Start', timestamp: 0, type: 'instant' },
          { id: 'E2', name: 'Middle', timestamp: 50, type: 'instant' },
          { id: 'E3', name: 'End', timestamp: 100, type: 'instant' },
        ],
        relations: [
          { id: 'R1', from: 'E1', to: 'E2', relationType: 'precedes', strength: 1 },
          { id: 'R2', from: 'E2', to: 'E3', relationType: 'precedes', strength: 1 },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      // No inconsistency warnings for this valid sequence
      expect(result.warnings.filter((w) => w.message.includes('inconsistency')).length).toBe(0);
    });
  });

  describe('getEnhancements', () => {
    it('should suggest defining relations when events exist but no relations', () => {
      const thought = handler.createThought(
        {
          thought: 'Events defined',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'temporal',
          events: [
            { id: 'E1', name: 'A', timestamp: 0, type: 'instant' },
            { id: 'E2', name: 'B', timestamp: 10, type: 'instant' },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.toLowerCase().includes('relation'))).toBe(true);
    });

    it('should suggest more relations for under-constrained timeline', () => {
      const thought = handler.createThought(
        {
          thought: 'Sparse timeline',
          thoughtNumber: 3,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'temporal',
          events: [
            { id: 'E1', name: 'A', timestamp: 0, type: 'instant' },
            { id: 'E2', name: 'B', timestamp: 10, type: 'instant' },
            { id: 'E3', name: 'C', timestamp: 20, type: 'instant' },
            { id: 'E4', name: 'D', timestamp: 30, type: 'instant' },
          ],
          relations: [
            { id: 'R1', from: 'E1', to: 'E2', relationType: 'precedes', strength: 1 },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('under-constrained'))).toBe(true);
    });

    it('should include Allen interval algebra mental models', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'temporal',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toBeDefined();
      expect(enhancements.mentalModels!.some((m) => m.includes('Allen'))).toBe(true);
      expect(enhancements.mentalModels!.some((m) => m.includes('Event Calculus'))).toBe(true);
    });

    it('should include guiding questions about temporal ordering', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'temporal',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('before'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('overlap'))).toBe(true);
    });

    it('should suggest related modes', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'temporal',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.CAUSAL);
      expect(enhancements.relatedModes).toContain(ThinkingMode.SEQUENTIAL);
    });

    it('should calculate metrics correctly', () => {
      const thought = handler.createThought(
        {
          thought: 'Full timeline',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
          mode: 'temporal',
          events: [
            { id: 'E1', name: 'Instant 1', timestamp: 0, type: 'instant' },
            { id: 'E2', name: 'Instant 2', timestamp: 10, type: 'instant' },
            { id: 'E3', name: 'Interval 1', timestamp: 5, type: 'interval', duration: 10 },
          ],
          relations: [
            { id: 'R1', from: 'E1', to: 'E2', relationType: 'precedes', strength: 1 },
            { id: 'R2', from: 'E1', to: 'E3', relationType: 'starts', strength: 0.8 },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.eventCount).toBe(3);
      expect(enhancements.metrics!.relationCount).toBe(2);
      expect(enhancements.metrics!.instantEvents).toBe(2);
      expect(enhancements.metrics!.intervalEvents).toBe(1);
      expect(enhancements.metrics!.constraintDensity).toBeGreaterThan(0);
    });

    it('should calculate constraint density correctly', () => {
      const thought = handler.createThought(
        {
          thought: 'Fully constrained',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
          mode: 'temporal',
          events: [
            { id: 'E1', name: 'A', timestamp: 0, type: 'instant' },
            { id: 'E2', name: 'B', timestamp: 10, type: 'instant' },
            { id: 'E3', name: 'C', timestamp: 20, type: 'instant' },
          ],
          relations: [
            { id: 'R1', from: 'E1', to: 'E2', relationType: 'precedes', strength: 1 },
            { id: 'R2', from: 'E2', to: 'E3', relationType: 'precedes', strength: 1 },
            { id: 'R3', from: 'E1', to: 'E3', relationType: 'precedes', strength: 1 },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      // 3 events = 3 possible pairs, 3 relations = density of 1.0
      expect(enhancements.metrics!.constraintDensity).toBe(1);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support event_definition', () => {
      expect(handler.supportsThoughtType('event_definition')).toBe(true);
    });

    it('should support interval_analysis', () => {
      expect(handler.supportsThoughtType('interval_analysis')).toBe(true);
    });

    it('should support temporal_constraint', () => {
      expect(handler.supportsThoughtType('temporal_constraint')).toBe(true);
    });

    it('should support sequence_construction', () => {
      expect(handler.supportsThoughtType('sequence_construction')).toBe(true);
    });

    it('should support causality_timeline', () => {
      expect(handler.supportsThoughtType('causality_timeline')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
      expect(handler.supportsThoughtType('proof_construction')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete temporal reasoning workflow', () => {
      const sessionId = 'e2e-temporal';

      // Step 1: Define events
      const step1 = handler.createThought(
        {
          thought: 'Defining events for software deployment pipeline',
          thoughtNumber: 1,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'temporal',
          thoughtType: 'event_definition',
          timeline: {
            id: 'T1',
            name: 'Deployment Pipeline',
            timeUnit: 'minutes',
            events: ['E1', 'E2', 'E3', 'E4', 'E5'],
          },
          events: [
            { id: 'E1', name: 'Code Commit', timestamp: 0, type: 'instant', description: 'Developer commits code' },
            { id: 'E2', name: 'Build', timestamp: 5, type: 'interval', description: 'CI build process', duration: 10 },
            { id: 'E3', name: 'Test', timestamp: 15, type: 'interval', description: 'Automated tests', duration: 20 },
            { id: 'E4', name: 'Deploy', timestamp: 35, type: 'interval', description: 'Deployment', duration: 5 },
            { id: 'E5', name: 'Live', timestamp: 40, type: 'instant', description: 'System live' },
          ],
        } as any,
        sessionId
      );
      expect(step1.thoughtType).toBe('event_definition');
      expect(step1.events).toHaveLength(5);
      expect(step1.timeline).toBeDefined();

      // Step 2: Define temporal relations
      const step2Input = {
        thought: 'Defining sequential dependencies',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'temporal',
        thoughtType: 'sequence_construction',
        events: step1.events,
        relations: [
          { id: 'R1', from: 'E1', to: 'E2', relationType: 'precedes', strength: 1 },
          { id: 'R2', from: 'E2', to: 'E3', relationType: 'meets', strength: 1 },
          { id: 'R3', from: 'E3', to: 'E4', relationType: 'meets', strength: 1 },
          { id: 'R4', from: 'E4', to: 'E5', relationType: 'finishes', strength: 1 },
        ],
      };
      const step2 = handler.createThought(step2Input as any, sessionId);
      const validation2 = handler.validate(step2Input as any);
      expect(validation2.valid).toBe(true);
      expect(step2.relations).toHaveLength(4);

      // Step 3: Add constraints
      const step3Input = {
        thought: 'Adding temporal constraints',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'temporal',
        thoughtType: 'temporal_constraint',
        events: step1.events,
        relations: step2.relations,
        constraints: [
          { id: 'C1', type: 'before', subject: 'E1', object: 'E5', confidence: 1.0 },
          { id: 'C2', type: 'during', subject: 'E3', object: 'E2', confidence: 0 }, // Tests can't run during build
        ],
      };
      const step3 = handler.createThought(step3Input as any, sessionId);
      const validation3 = handler.validate(step3Input as any);
      expect(validation3.valid).toBe(true);

      // Step 4: Analyze intervals and overlaps
      const step4Input = {
        thought: 'Analyzing interval relationships',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'temporal',
        thoughtType: 'interval_analysis',
        events: step1.events,
        relations: step2.relations,
        intervals: [
          { id: 'I1', name: 'CI/CD Window', start: 5, end: 40, contains: ['E2', 'E3', 'E4'] },
        ],
      };
      const step4 = handler.createThought(step4Input as any, sessionId);

      expect(step4.thoughtType).toBe('interval_analysis');
      expect(step4.intervals![0].contains).toContain('E2');

      // Final enhancements should show well-constrained timeline
      const finalEnhancements = handler.getEnhancements(step4);
      expect(finalEnhancements.metrics!.eventCount).toBe(5);
      expect(finalEnhancements.metrics!.relationCount).toBe(4);
    });

    it('should detect and warn about inconsistent timelines', () => {
      const sessionId = 'e2e-inconsistent';

      // Create timeline with direct temporal paradox (A causes B and B causes A)
      const input = {
        thought: 'Timeline with paradox',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        mode: 'temporal',
        thoughtType: 'causality_timeline',
        events: [
          { id: 'E1', name: 'Event A', timestamp: 0, type: 'instant' },
          { id: 'E2', name: 'Event B', timestamp: 10, type: 'instant' },
        ],
        relations: [
          { id: 'R1', from: 'E1', to: 'E2', relationType: 'causes', strength: 1 },
          { id: 'R2', from: 'E2', to: 'E1', relationType: 'causes', strength: 1 }, // Direct paradox!
        ],
      };

      const thought = handler.createThought(input as any, sessionId);
      const validation = handler.validate(input as any);

      // Should detect the direct causal loop (A->B and B->A)
      expect(validation.warnings.some((w) => w.message.includes('inconsistency'))).toBe(true);
      expect(thought.relations).toHaveLength(2);
    });

    it('should handle Allen interval algebra relations', () => {
      const sessionId = 'e2e-allen';

      // Test Allen's 13 interval relations
      const input = {
        thought: 'Testing Allen interval relations',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'temporal',
        thoughtType: 'interval_analysis',
        events: [
          { id: 'I1', name: 'Interval 1', timestamp: 0, type: 'interval', duration: 10 },
          { id: 'I2', name: 'Interval 2', timestamp: 5, type: 'interval', duration: 10 },
        ],
        relations: [
          { id: 'R1', from: 'I1', to: 'I2', relationType: 'overlaps', strength: 1 },
        ],
      };

      const thought = handler.createThought(input as any, sessionId);
      const validation = handler.validate(input as any);

      expect(validation.valid).toBe(true);
      expect(thought.relations![0].relationType).toBe('overlaps');

      const enhancements = handler.getEnhancements(thought);
      expect(enhancements.mentalModels!.some((m) => m.includes('Allen'))).toBe(true);
    });
  });
});
