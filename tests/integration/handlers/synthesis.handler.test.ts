/**
 * SynthesisHandler Integration Tests
 *
 * Tests T-HDL-021 through T-HDL-025: Comprehensive tests for
 * SynthesisHandler source coverage and theme extraction.
 *
 * Phase 11 Sprint 9: ModeHandler Specialized Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SynthesisHandler } from '../../../src/modes/handlers/SynthesisHandler.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('SynthesisHandler Integration Tests', () => {
  let handler: SynthesisHandler;

  beforeEach(() => {
    handler = new SynthesisHandler();
  });

  function createInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Literature synthesis',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'synthesis',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-HDL-021: Source coverage tracking
  // ===========================================================================
  describe('T-HDL-021: Source Coverage Tracking', () => {
    it('should track sources in synthesis', () => {
      const input = createInput({
        sources: [
          { id: 'src1', title: 'Paper A', type: 'journal', year: 2023, relevance: 0.9 },
          { id: 'src2', title: 'Paper B', type: 'conference', year: 2022, relevance: 0.85 },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.sources).toHaveLength(2);
    });

    it('should validate source structure', () => {
      const input = createInput({
        sources: [
          { id: 'src1', title: 'Valid Source', type: 'paper', relevance: 0.8 },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should provide source coverage metrics', () => {
      const input = createInput({
        sources: [
          { id: 'src1', title: 'Source 1', type: 'journal', year: 2023, relevance: 0.9 },
          { id: 'src2', title: 'Source 2', type: 'book', year: 2021, relevance: 0.7 },
          { id: 'src3', title: 'Source 3', type: 'paper', year: 2022, relevance: 0.8 },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.sourceCount).toBe(3);
    });

    it('should warn about low source count', () => {
      const input = createInput({
        sources: [
          { id: 'src1', title: 'Only Source', type: 'paper', relevance: 0.9 },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions?.some(s =>
        s.toLowerCase().includes('source') || s.toLowerCase().includes('additional')
      )).toBe(true);
    });
  });

  // ===========================================================================
  // T-HDL-022: Theme extraction
  // ===========================================================================
  describe('T-HDL-022: Theme Extraction', () => {
    it('should extract themes from sources', () => {
      const input = createInput({
        sources: [
          { id: 'src1', title: 'Source 1', type: 'paper', relevance: 0.9 },
          { id: 'src2', title: 'Source 2', type: 'paper', relevance: 0.8 },
        ],
        themes: [
          { id: 'theme1', name: 'Main Theme', strength: 0.85, sourceIds: ['src1', 'src2'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.themes).toHaveLength(1);
      expect(thought.themes?.[0].sourceIds).toHaveLength(2);
    });

    it('should track theme strength', () => {
      const input = createInput({
        themes: [
          { id: 'theme1', name: 'Strong Theme', strength: 0.9 },
          { id: 'theme2', name: 'Weak Theme', strength: 0.4 },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.themes).toHaveLength(2);
    });

    it('should provide theme-related metrics', () => {
      const input = createInput({
        themes: [
          { id: 't1', name: 'Theme 1', strength: 0.8 },
          { id: 't2', name: 'Theme 2', strength: 0.6 },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.themeCount).toBe(2);
    });
  });

  // ===========================================================================
  // T-HDL-023: Gap identification
  // ===========================================================================
  describe('T-HDL-023: Gap Identification', () => {
    it('should identify research gaps', () => {
      const input = createInput({
        gaps: [
          { id: 'gap1', description: 'Missing empirical data', type: 'empirical', importance: 'significant' },
          { id: 'gap2', description: 'Theoretical framework needed', type: 'theoretical', importance: 'critical' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.gaps).toHaveLength(2);
    });

    it('should categorize gap types', () => {
      const input = createInput({
        gaps: [
          { id: 'gap1', description: 'Gap 1', type: 'methodological', importance: 'moderate' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.gaps?.[0].type).toBe('methodological');
    });

    it('should provide gap metrics', () => {
      const input = createInput({
        gaps: [
          { id: 'gap1', description: 'Gap 1', type: 'empirical', importance: 'critical' },
          { id: 'gap2', description: 'Gap 2', type: 'theoretical', importance: 'significant' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.gapCount).toBe(2);
    });
  });

  // ===========================================================================
  // T-HDL-024: Consensus detection
  // ===========================================================================
  describe('T-HDL-024: Consensus Detection', () => {
    it('should detect consensus across themes', () => {
      const input = createInput({
        themes: [
          { id: 't1', name: 'Consensus Theme', strength: 0.9, consensus: 'strong' },
          { id: 't2', name: 'Contested Theme', strength: 0.5, consensus: 'contested' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.themes?.find(t => t.consensus === 'strong')).toBeDefined();
    });

    it('should provide consensus analysis', () => {
      const input = createInput({
        themes: [
          { id: 't1', name: 'Theme 1', strength: 0.8, consensus: 'moderate' },
          { id: 't2', name: 'Theme 2', strength: 0.7, consensus: 'strong' },
        ],
        // Need 2+ themes and no gaps for guiding questions to be added
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Guiding questions added when themeCount >= 2 and no gaps
      expect(enhancements.guidingQuestions?.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // T-HDL-025: Source-theme mapping
  // ===========================================================================
  describe('T-HDL-025: Source-Theme Mapping', () => {
    it('should map sources to themes', () => {
      const input = createInput({
        sources: [
          { id: 'src1', title: 'Source 1', type: 'paper', relevance: 0.9 },
          { id: 'src2', title: 'Source 2', type: 'paper', relevance: 0.8 },
          { id: 'src3', title: 'Source 3', type: 'paper', relevance: 0.7 },
        ],
        themes: [
          { id: 't1', name: 'Theme 1', strength: 0.85, sourceIds: ['src1', 'src2'] },
          { id: 't2', name: 'Theme 2', strength: 0.7, sourceIds: ['src2', 'src3'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.themes?.[0].sourceIds).toContain('src1');
      expect(thought.themes?.[0].sourceIds).toContain('src2');
    });

    it('should track theme coverage across sources', () => {
      const input = createInput({
        sources: [
          { id: 'src1', title: 'Source 1', type: 'paper', relevance: 0.9 },
        ],
        themes: [
          { id: 't1', name: 'Theme 1', strength: 0.9, sourceIds: ['src1'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.sourceCount).toBe(1);
      expect(enhancements.metrics?.themeCount).toBe(1);
    });

    it('should suggest related academic modes', () => {
      const input = createInput({
        sources: [{ id: 'src1', title: 'Source', type: 'paper', relevance: 0.9 }],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.ARGUMENTATION);
    });
  });
});
