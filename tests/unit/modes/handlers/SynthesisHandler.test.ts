/**
 * SynthesisHandler Unit Tests - Phase 10 Sprint 2B
 *
 * Tests for the specialized SynthesisHandler:
 * - Thought creation
 * - Source coverage tracking
 * - Theme validation
 * - Contradiction detection
 * - Enhancements
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SynthesisHandler } from '../../../../src/modes/handlers/SynthesisHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('SynthesisHandler', () => {
  let handler: SynthesisHandler;

  beforeEach(() => {
    handler = new SynthesisHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.SYNTHESIS);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Literature Synthesis');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description.toLowerCase()).toContain('synthesis');
    });
  });

  describe('createThought', () => {
    it('should create a basic synthesis thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Synthesizing literature',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect(thought.content).toBe('Synthesizing literature');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should create thought with sources', () => {
      const input: ThinkingToolInput = {
        thought: 'Reviewing sources',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [
          {
            id: 'source-1',
            type: 'journal_article',
            title: 'Test Article',
            authors: ['Author A'],
            year: 2024,
            quality: {
              peerReviewed: true,
              methodologicalRigor: 0.8,
              relevance: 0.9,
              recency: 0.7,
              authorCredibility: 0.8,
              overallQuality: 0.8,
            },
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.sources).toHaveLength(1);
      expect(thought.sources[0].title).toBe('Test Article');
    });

    it('should create thought with themes', () => {
      const input: ThinkingToolInput = {
        thought: 'Extracting themes',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        themes: [
          {
            id: 'theme-1',
            name: 'Main Theme',
            description: 'A key theme',
            sourceIds: ['source-1'],
            concepts: [],
            strength: 0.8,
            consensus: 'strong',
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.themes).toHaveLength(1);
      expect(thought.themes[0].consensus).toBe('strong');
    });

    it('should create thought with contradictions', () => {
      const input: ThinkingToolInput = {
        thought: 'Finding contradictions',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        contradictions: [
          {
            id: 'contradiction-1',
            description: 'Sources disagree on X',
            position1: {
              statement: 'X is true',
              sourceIds: ['source-1'],
              reasoning: 'Based on study A',
            },
            position2: {
              statement: 'X is false',
              sourceIds: ['source-2'],
              reasoning: 'Based on study B',
            },
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.contradictions).toHaveLength(1);
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid synthesis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should detect duplicate source IDs', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [
          { id: 'source-1', title: 'Title 1', authors: [], year: 2024, type: 'journal_article', quality: {} },
          { id: 'source-1', title: 'Title 2', authors: [], year: 2024, type: 'journal_article', quality: {} },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'DUPLICATE_SOURCE_IDS')).toBe(true);
    });

    it('should warn when theme references non-existent source', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [
          { id: 'source-1', title: 'Title', authors: [], year: 2024, type: 'journal_article', quality: {} },
        ],
        themes: [
          {
            id: 'theme-1',
            name: 'Theme',
            description: 'Desc',
            sourceIds: ['source-2'], // Does not exist
            concepts: [],
            strength: 0.8,
            consensus: 'strong',
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('non-existent source'))).toBe(true);
    });

    it('should warn for only one source', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [
          { id: 'source-1', title: 'Title', authors: [], year: 2024, type: 'journal_article', quality: {} },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('one source'))).toBe(true);
    });

    it('should validate quality metrics ranges', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [
          {
            id: 'source-1',
            title: 'Title',
            authors: [],
            year: 2024,
            type: 'journal_article',
            quality: {
              peerReviewed: true,
              methodologicalRigor: 1.5, // Invalid
              relevance: 0.9,
              recency: 0.7,
              authorCredibility: 0.8,
              overallQuality: 0.8,
            },
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('methodologicalRigor'))).toBe(true);
    });

    it('should validate theme strength range', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [
          { id: 'source-1', title: 'Title', authors: [], year: 2024, type: 'journal_article', quality: {} },
        ],
        themes: [
          {
            id: 'theme-1',
            name: 'Theme',
            description: 'Desc',
            sourceIds: ['source-1'],
            concepts: [],
            strength: 2.0, // Invalid
            consensus: 'strong',
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('strength'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.relatedModes).toContain(ThinkingMode.CRITIQUE);
      expect(enhancements.relatedModes).toContain(ThinkingMode.ARGUMENTATION);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.mentalModels).toContain('Thematic Analysis');
      expect(enhancements.mentalModels).toContain('Systematic Review');
    });

    it('should calculate source coverage metrics', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [
          { id: 'source-1', title: 'T1', authors: [], year: 2024, type: 'journal_article', quality: {} },
          { id: 'source-2', title: 'T2', authors: [], year: 2024, type: 'journal_article', quality: {} },
        ],
        themes: [
          { id: 'theme-1', name: 'Theme', description: 'D', sourceIds: ['source-1'], concepts: [], strength: 0.8, consensus: 'strong' },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics).toBeDefined();
      expect(enhancements.metrics!.sourceCount).toBe(2);
      expect(enhancements.metrics!.themeCount).toBe(1);
      expect(enhancements.metrics!.uncoveredSources).toBe(1);
    });

    it('should suggest extracting themes when sources but no themes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [
          { id: 'source-1', title: 'T1', authors: [], year: 2024, type: 'journal_article', quality: {} },
          { id: 'source-2', title: 'T2', authors: [], year: 2024, type: 'journal_article', quality: {} },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s => s.includes('theme'))).toBe(true);
    });

    it('should warn about uncovered sources', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [
          { id: 'source-1', title: 'T1', authors: [], year: 2024, type: 'journal_article', quality: {} },
          { id: 'source-2', title: 'T2', authors: [], year: 2024, type: 'journal_article', quality: {} },
        ],
        themes: [
          { id: 'theme-1', name: 'Theme', description: 'D', sourceIds: ['source-1'], concepts: [], strength: 0.8, consensus: 'strong' },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.warnings!.some(w => w.includes('not referenced'))).toBe(true);
    });

    it('should warn about weak consensus themes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        themes: [
          { id: 'theme-1', name: 'Theme', description: 'D', sourceIds: [], concepts: [], strength: 0.8, consensus: 'contested' },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.warnings!.some(w => w.includes('consensus'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support source_identification', () => {
      expect(handler.supportsThoughtType!('source_identification')).toBe(true);
    });

    it('should support theme_extraction', () => {
      expect(handler.supportsThoughtType!('theme_extraction')).toBe(true);
    });

    it('should support gap_identification', () => {
      expect(handler.supportsThoughtType!('gap_identification')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType!('unknown_type')).toBe(false);
    });
  });
});
