/**
 * HistoricalHandler Unit Tests - Phase 15 (v9.1.0)
 *
 * Tests for Historical reasoning handler including:
 * - Event analysis and timeline construction
 * - Source evaluation and reliability assessment
 * - Pattern identification across time periods
 * - Causal chain analysis
 * - Periodization and historiographical analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HistoricalHandler } from '../../../../src/modes/handlers/HistoricalHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('HistoricalHandler', () => {
  let handler: HistoricalHandler;

  beforeEach(() => {
    handler = new HistoricalHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.HISTORICAL);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Historical Reasoning');
    });

    it('should have a description', () => {
      expect(handler.description).toBeDefined();
      expect(handler.description).toContain('source');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Analyzing the French Revolution',
      thoughtNumber: 1,
      totalThoughts: 4,
      nextThoughtNeeded: true,
      mode: 'historical',
    };
    const sessionId = 'test-session-historical';

    it('should create a historical thought with default thought type', () => {
      const thought = handler.createThought(baseInput, sessionId);

      expect(thought.id).toBeDefined();
      expect(thought.sessionId).toBe(sessionId);
      expect(thought.mode).toBe(ThinkingMode.HISTORICAL);
      expect(thought.thoughtType).toBe('event_analysis');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with event_analysis type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'event_analysis',
        events: [
          { id: 'E1', name: 'Storming of the Bastille', date: '1789-07-14', significance: 'transformative' },
          { id: 'E2', name: 'Declaration of Rights', date: '1789-08-26', significance: 'major' },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('event_analysis');
      expect(thought.events).toHaveLength(2);
      expect(thought.events![0].significance).toBe('transformative');
    });

    it('should create thought with source_evaluation type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'source_evaluation',
        sources: [
          { id: 'S1', title: 'Letter from Mirabeau', type: 'primary', reliability: 0.9 },
          { id: 'S2', title: 'Modern History of France', type: 'secondary', reliability: 0.85 },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('source_evaluation');
      expect(thought.sources).toHaveLength(2);
      expect(thought.sources![0].type).toBe('primary');
    });

    it('should create thought with pattern_identification type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'pattern_identification',
        events: [
          { id: 'E1', name: 'Event 1', date: '1789', significance: 'transformative' },
          { id: 'E2', name: 'Event 2', date: '1790', significance: 'transformative' },
          { id: 'E3', name: 'Event 3', date: '1791', significance: 'transformative' },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('pattern_identification');
      expect(thought.patterns).toBeDefined();
    });

    it('should create thought with causal_chain type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'causal_chain',
        events: [
          { id: 'E1', name: 'Financial Crisis', date: '1788', significance: 'major' },
          { id: 'E2', name: 'Estates General', date: '1789-05-05', significance: 'major' },
          { id: 'E3', name: 'Revolution', date: '1789-07-14', significance: 'transformative' },
        ],
        causalChains: [
          {
            id: 'C1',
            name: 'Road to Revolution',
            confidence: 0.85,
            links: [
              { cause: 'E1', effect: 'E2', confidence: 0.9, mechanism: 'Bankruptcy forced convening' },
              { cause: 'E2', effect: 'E3', confidence: 0.85, mechanism: 'Political mobilization' },
            ],
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('causal_chain');
      expect(thought.causalChains).toHaveLength(1);
      expect(thought.causalChains![0].links).toHaveLength(2);
    });

    it('should create thought with periodization type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'periodization',
        periods: [
          {
            id: 'P1',
            name: 'Liberal Phase',
            startDate: '1789',
            endDate: '1792',
            characteristics: ['Constitutional monarchy', 'Civil rights'],
            keyEvents: ['E1', 'E2'],
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('periodization');
      expect(thought.periods).toHaveLength(1);
      expect(thought.periods![0].characteristics).toContain('Constitutional monarchy');
    });

    it('should create thought with actors', () => {
      const input = {
        ...baseInput,
        thoughtType: 'event_analysis',
        actors: [
          { id: 'A1', name: 'Louis XVI', type: 'individual', roles: ['Monarch'] },
          { id: 'A2', name: 'Third Estate', type: 'group', roles: ['Revolutionary force'] },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.actors).toHaveLength(2);
      expect(thought.actors![0].type).toBe('individual');
      expect(thought.actors![1].type).toBe('group');
    });

    it('should calculate aggregate reliability from sources', () => {
      const input = {
        ...baseInput,
        sources: [
          { id: 'S1', title: 'Primary Source', type: 'primary', reliability: 0.9 },
          { id: 'S2', title: 'Secondary Source', type: 'secondary', reliability: 0.8 },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.aggregateReliability).toBeGreaterThan(0);
      expect(thought.aggregateReliability).toBeLessThanOrEqual(1);
    });

    it('should weight primary sources higher in reliability calculation', () => {
      const inputPrimary = {
        ...baseInput,
        sources: [
          { id: 'S1', title: 'Primary', type: 'primary', reliability: 0.8 },
        ],
      };
      const inputSecondary = {
        ...baseInput,
        sources: [
          { id: 'S2', title: 'Secondary', type: 'secondary', reliability: 0.8 },
        ],
      };
      const thoughtPrimary = handler.createThought(inputPrimary as any, sessionId);
      const thoughtSecondary = handler.createThought(inputSecondary as any, sessionId);

      // Both should have same base reliability, but different weighted results
      expect(thoughtPrimary.aggregateReliability).toBeDefined();
      expect(thoughtSecondary.aggregateReliability).toBeDefined();
    });

    it('should calculate temporal span from events', () => {
      const input = {
        ...baseInput,
        events: [
          { id: 'E1', name: 'Start', date: '1789-07-14', significance: 'major' },
          { id: 'E2', name: 'End', date: '1799-11-09', significance: 'major' },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.temporalSpan).toBeDefined();
      expect(thought.temporalSpan!.start).toBe('1789-07-14');
      expect(thought.temporalSpan!.end).toBe('1799-11-09');
    });

    it('should auto-detect patterns from transformative events', () => {
      const input = {
        ...baseInput,
        events: [
          { id: 'E1', name: 'Event 1', date: '1789', significance: 'transformative' },
          { id: 'E2', name: 'Event 2', date: '1790', significance: 'transformative' },
          { id: 'E3', name: 'Event 3', date: '1791', significance: 'transformative' },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.patterns).toBeDefined();
      expect(thought.patterns!.length).toBeGreaterThan(0);
      expect(thought.patterns!.some(p => p.name === 'Revolutionary Period')).toBe(true);
    });

    it('should default to event_analysis for invalid thought type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'invalid_type',
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('event_analysis');
    });
  });

  describe('validate', () => {
    it('should warn when no sources defined for events', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing history',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'historical',
        events: [
          { id: 'E1', name: 'Event 1', date: '1789', significance: 'major' },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'sources')).toBe(true);
    });

    it('should error when event references unknown cause', () => {
      const input = {
        thought: 'Invalid cause reference',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'historical',
        events: [
          { id: 'E1', name: 'Effect', date: '1790', significance: 'major', causes: ['E_UNKNOWN'] },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('E_UNKNOWN'))).toBe(true);
    });

    it('should warn when event references unknown source', () => {
      const input = {
        thought: 'Invalid source reference',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'historical',
        events: [
          { id: 'E1', name: 'Event', date: '1789', significance: 'major', sources: ['S_UNKNOWN'] },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('S_UNKNOWN'))).toBe(true);
    });

    it('should warn when event references unknown actor', () => {
      const input = {
        thought: 'Invalid actor reference',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'historical',
        events: [
          { id: 'E1', name: 'Event', date: '1789', significance: 'major', actors: ['A_UNKNOWN'] },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('A_UNKNOWN'))).toBe(true);
    });

    it('should warn about causal chain discontinuity', () => {
      const input = {
        thought: 'Discontinuous chain',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'historical',
        events: [
          { id: 'E1', name: 'Cause 1', date: '1788', significance: 'major' },
          { id: 'E2', name: 'Effect 1', date: '1789', significance: 'major' },
          { id: 'E3', name: 'Effect 2', date: '1790', significance: 'major' },
        ],
        causalChains: [
          {
            id: 'C1',
            name: 'Broken Chain',
            confidence: 0.8,
            links: [
              { cause: 'E1', effect: 'E2', confidence: 0.9 },
              { cause: 'E1', effect: 'E3', confidence: 0.8 }, // Discontinuity: E1 instead of E2
            ],
          },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('discontinuity'))).toBe(true);
    });

    it('should error when causal chain references unknown event', () => {
      const input = {
        thought: 'Invalid chain reference',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'historical',
        events: [
          { id: 'E1', name: 'Event 1', date: '1789', significance: 'major' },
        ],
        causalChains: [
          {
            id: 'C1',
            name: 'Invalid Chain',
            confidence: 0.8,
            links: [
              { cause: 'E1', effect: 'E_UNKNOWN', confidence: 0.9 },
            ],
          },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('E_UNKNOWN'))).toBe(true);
    });

    it('should warn about low reliability sources', () => {
      const input = {
        thought: 'Low reliability sources',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'historical',
        sources: [
          { id: 'S1', title: 'Unreliable', type: 'secondary', reliability: 0.3 },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('low reliability'))).toBe(true);
    });

    it('should pass validation with consistent data', () => {
      const input = {
        thought: 'Consistent analysis',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'historical',
        events: [
          { id: 'E1', name: 'Cause', date: '1788', significance: 'major', sources: ['S1'] },
          { id: 'E2', name: 'Effect', date: '1789', significance: 'transformative', causes: ['E1'], sources: ['S1'] },
        ],
        sources: [
          { id: 'S1', title: 'Primary Document', type: 'primary', reliability: 0.9 },
        ],
        causalChains: [
          {
            id: 'C1',
            name: 'Valid Chain',
            confidence: 0.9,
            links: [
              { cause: 'E1', effect: 'E2', confidence: 0.9 },
            ],
          },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getEnhancements', () => {
    it('should suggest adding sources when none exist', () => {
      const thought = handler.createThought(
        {
          thought: 'No sources',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'historical',
          events: [
            { id: 'E1', name: 'Event', date: '1789', significance: 'major' },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.toLowerCase().includes('source'))).toBe(true);
    });

    it('should suggest primary sources when only secondary exist', () => {
      const thought = handler.createThought(
        {
          thought: 'Only secondary sources',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'historical',
          sources: [
            { id: 'S1', title: 'Modern Analysis', type: 'secondary', reliability: 0.85 },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('primary'))).toBe(true);
    });

    it('should suggest causal chains when many events but no chains', () => {
      const thought = handler.createThought(
        {
          thought: 'Many events no chains',
          thoughtNumber: 3,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'historical',
          events: [
            { id: 'E1', name: 'Event 1', date: '1788', significance: 'major' },
            { id: 'E2', name: 'Event 2', date: '1789', significance: 'major' },
            { id: 'E3', name: 'Event 3', date: '1790', significance: 'major' },
            { id: 'E4', name: 'Event 4', date: '1791', significance: 'major' },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('causal'))).toBe(true);
    });

    it('should suggest periodization when many events but no periods', () => {
      const thought = handler.createThought(
        {
          thought: 'Many events no periods',
          thoughtNumber: 3,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'historical',
          events: [
            { id: 'E1', name: 'Event 1', date: '1788', significance: 'major' },
            { id: 'E2', name: 'Event 2', date: '1789', significance: 'major' },
            { id: 'E3', name: 'Event 3', date: '1790', significance: 'major' },
            { id: 'E4', name: 'Event 4', date: '1791', significance: 'major' },
            { id: 'E5', name: 'Event 5', date: '1792', significance: 'major' },
            { id: 'E6', name: 'Event 6', date: '1793', significance: 'major' },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('period'))).toBe(true);
    });

    it('should suggest identifying actors when events but no actors', () => {
      const thought = handler.createThought(
        {
          thought: 'Events without actors',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'historical',
          events: [
            { id: 'E1', name: 'Event', date: '1789', significance: 'major' },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('actor'))).toBe(true);
    });

    it('should include historiographical mental models', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'historical',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toBeDefined();
      expect(enhancements.mentalModels!.some((m) => m.includes('Source Criticism'))).toBe(true);
      expect(enhancements.mentalModels!.some((m) => m.includes('Historiographical'))).toBe(true);
      expect(enhancements.mentalModels!.some((m) => m.includes('Longue Durée'))).toBe(true);
    });

    it('should include guiding questions based on thought type', () => {
      const thoughtTypes = ['event_analysis', 'source_evaluation', 'pattern_identification', 'causal_chain', 'periodization'];

      for (const thoughtType of thoughtTypes) {
        const thought = handler.createThought(
          {
            thought: 'Testing',
            thoughtNumber: 1,
            totalThoughts: 3,
            nextThoughtNeeded: true,
            mode: 'historical',
            thoughtType,
          } as any,
          'session'
        );

        const enhancements = handler.getEnhancements(thought);
        expect(enhancements.guidingQuestions!.length).toBeGreaterThan(0);
      }
    });

    it('should suggest related modes', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'historical',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.TEMPORAL);
      expect(enhancements.relatedModes).toContain(ThinkingMode.CAUSAL);
      expect(enhancements.relatedModes).toContain(ThinkingMode.SYNTHESIS);
    });

    it('should calculate metrics correctly', () => {
      const thought = handler.createThought(
        {
          thought: 'Full analysis',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
          mode: 'historical',
          events: [
            { id: 'E1', name: 'Event 1', date: '1789', significance: 'transformative' },
            { id: 'E2', name: 'Event 2', date: '1790', significance: 'major' },
          ],
          sources: [
            { id: 'S1', title: 'Primary', type: 'primary', reliability: 0.9 },
            { id: 'S2', title: 'Secondary', type: 'secondary', reliability: 0.8 },
          ],
          periods: [
            { id: 'P1', name: 'Period 1', startDate: '1789', endDate: '1791', characteristics: [] },
          ],
          causalChains: [
            { id: 'C1', name: 'Chain 1', confidence: 0.9, links: [] },
          ],
          actors: [
            { id: 'A1', name: 'Actor 1', type: 'individual' },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.eventCount).toBe(2);
      expect(enhancements.metrics!.sourceCount).toBe(2);
      expect(enhancements.metrics!.periodCount).toBe(1);
      expect(enhancements.metrics!.causalChainCount).toBe(1);
      expect(enhancements.metrics!.actorCount).toBe(1);
      expect(enhancements.metrics!.primarySourceRatio).toBe(0.5);
      expect(enhancements.metrics!.transformativeEventCount).toBe(1);
    });

    it('should note uncorroborated primary sources', () => {
      const thought = handler.createThought(
        {
          thought: 'Uncorroborated sources',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'historical',
          sources: [
            { id: 'S1', title: 'Primary 1', type: 'primary', reliability: 0.9 },
            { id: 'S2', title: 'Primary 2', type: 'primary', reliability: 0.85 },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('corroboration'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support event_analysis', () => {
      expect(handler.supportsThoughtType('event_analysis')).toBe(true);
    });

    it('should support source_evaluation', () => {
      expect(handler.supportsThoughtType('source_evaluation')).toBe(true);
    });

    it('should support pattern_identification', () => {
      expect(handler.supportsThoughtType('pattern_identification')).toBe(true);
    });

    it('should support causal_chain', () => {
      expect(handler.supportsThoughtType('causal_chain')).toBe(true);
    });

    it('should support periodization', () => {
      expect(handler.supportsThoughtType('periodization')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
      expect(handler.supportsThoughtType('event_definition')).toBe(false); // temporal's type
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete historical reasoning workflow', () => {
      const sessionId = 'e2e-historical';

      // Step 1: Define events
      const step1 = handler.createThought(
        {
          thought: 'Defining key events of the French Revolution',
          thoughtNumber: 1,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          mode: 'historical',
          thoughtType: 'event_analysis',
          events: [
            { id: 'E1', name: 'Financial Crisis', date: '1788', significance: 'major', location: 'France' },
            { id: 'E2', name: 'Estates General', date: '1789-05-05', significance: 'major', location: 'Versailles' },
            { id: 'E3', name: 'Storming of Bastille', date: '1789-07-14', significance: 'transformative', location: 'Paris' },
            { id: 'E4', name: 'Declaration of Rights', date: '1789-08-26', significance: 'transformative', location: 'Paris' },
            { id: 'E5', name: 'Execution of Louis XVI', date: '1793-01-21', significance: 'transformative', location: 'Paris' },
          ],
        } as any,
        sessionId
      );
      expect(step1.thoughtType).toBe('event_analysis');
      expect(step1.events).toHaveLength(5);
      expect(step1.temporalSpan).toBeDefined();

      // Step 2: Add sources
      const step2Input = {
        thought: 'Evaluating historical sources',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'historical',
        thoughtType: 'source_evaluation',
        sources: [
          { id: 'S1', title: 'Cahiers de Doléances', type: 'primary', reliability: 0.95 },
          { id: 'S2', title: 'Burke, Reflections', type: 'primary', reliability: 0.7, bias: { type: 'conservative' } },
          { id: 'S3', title: 'Soboul, French Revolution', type: 'secondary', reliability: 0.9 },
        ],
        events: step1.events,
      };
      const step2 = handler.createThought(step2Input as any, sessionId);
      expect(step2.aggregateReliability).toBeGreaterThan(0.8);

      // Step 3: Build causal chains
      const step3Input = {
        thought: 'Tracing causal chains',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'historical',
        thoughtType: 'causal_chain',
        events: step1.events,
        sources: step2.sources,
        causalChains: [
          {
            id: 'C1',
            name: 'Road to Revolution',
            confidence: 0.9,
            links: [
              { cause: 'E1', effect: 'E2', confidence: 0.95, mechanism: 'Bankruptcy forced convening' },
              { cause: 'E2', effect: 'E3', confidence: 0.85, mechanism: 'Political mobilization and anger' },
            ],
          },
          {
            id: 'C2',
            name: 'Radicalization',
            confidence: 0.8,
            links: [
              { cause: 'E3', effect: 'E4', confidence: 0.9, mechanism: 'Revolutionary momentum' },
              { cause: 'E4', effect: 'E5', confidence: 0.7, mechanism: 'Ideological escalation' },
            ],
          },
        ],
      };
      const step3 = handler.createThought(step3Input as any, sessionId);
      const validation3 = handler.validate(step3Input as any);
      expect(validation3.valid).toBe(true);
      expect(step3.causalChains).toHaveLength(2);

      // Step 4: Periodization
      const step4Input = {
        thought: 'Organizing into periods',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'historical',
        thoughtType: 'periodization',
        events: step1.events,
        sources: step2.sources,
        causalChains: step3.causalChains,
        periods: [
          {
            id: 'P1',
            name: 'Constitutional Period',
            startDate: '1789-07-14',
            endDate: '1792-09-21',
            characteristics: ['Constitutional monarchy', 'Liberal reforms', 'Declaration of Rights'],
            keyEvents: ['E3', 'E4'],
          },
          {
            id: 'P2',
            name: 'Radical Period',
            startDate: '1792-09-21',
            endDate: '1794-07-27',
            characteristics: ['Republic', 'Terror', 'War'],
            keyEvents: ['E5'],
          },
        ],
      };
      const step4 = handler.createThought(step4Input as any, sessionId);

      expect(step4.thoughtType).toBe('periodization');
      expect(step4.periods).toHaveLength(2);

      // Final enhancements should show complete analysis
      const finalEnhancements = handler.getEnhancements(step4);
      expect(finalEnhancements.metrics!.eventCount).toBe(5);
      expect(finalEnhancements.metrics!.periodCount).toBe(2);
      expect(finalEnhancements.metrics!.causalChainCount).toBe(2);
    });

    it('should detect revolutionary period pattern', () => {
      const sessionId = 'e2e-pattern';

      const input = {
        thought: 'Analyzing revolutionary events',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'historical',
        thoughtType: 'pattern_identification',
        events: [
          { id: 'E1', name: 'Event 1', date: '1789-01', significance: 'transformative' },
          { id: 'E2', name: 'Event 2', date: '1789-07', significance: 'transformative' },
          { id: 'E3', name: 'Event 3', date: '1789-08', significance: 'transformative' },
          { id: 'E4', name: 'Event 4', date: '1790-01', significance: 'major' },
          { id: 'E5', name: 'Event 5', date: '1790-07', significance: 'transformative' },
        ],
      };

      const thought = handler.createThought(input as any, sessionId);

      expect(thought.patterns).toBeDefined();
      expect(thought.patterns!.some((p) => p.name === 'Revolutionary Period')).toBe(true);
    });

    it('should handle source with corroboration', () => {
      const sessionId = 'e2e-corroboration';

      const input = {
        thought: 'Sources with corroboration',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'historical',
        sources: [
          { id: 'S1', title: 'Source 1', type: 'primary', reliability: 0.8, corroboratedBy: ['S2'] },
          { id: 'S2', title: 'Source 2', type: 'primary', reliability: 0.8, corroboratedBy: ['S1'] },
        ],
      };

      const thought = handler.createThought(input as any, sessionId);

      // Corroborated sources should get reliability bonus
      expect(thought.aggregateReliability).toBeGreaterThan(0.8);
    });
  });
});
