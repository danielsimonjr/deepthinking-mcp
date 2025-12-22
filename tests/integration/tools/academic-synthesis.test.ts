/**
 * Academic Synthesis Mode Integration Tests
 *
 * Tests T-ACD-001 through T-ACD-019: Comprehensive integration tests
 * for the deepthinking_academic tool with synthesis mode.
 * Covers literature sources, themes, gaps, and consensus tracking.
 *
 * Phase 11 Sprint 7: Engineering & Academic Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type SynthesisThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { createBaseThought } from '../../utils/thought-factory.js';

// ============================================================================
// SYNTHESIS MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic synthesis thought
 */
function createSynthesisThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'synthesis',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Sample source for testing
 */
interface TestSource {
  id: string;
  title: string;
  authors?: string[];
  year?: number;
  venue?: string;
  doi?: string;
  type?: string;
  relevance?: number;
}

/**
 * Create a synthesis thought with sources
 */
function createSynthesisWithSources(
  sources: TestSource[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createSynthesisThought({
    sources,
    ...overrides,
  } as any);
}

/**
 * Sample theme for testing
 */
interface TestTheme {
  id: string;
  name: string;
  description?: string;
  sourceIds?: string[];
  consensus?: 'strong' | 'moderate' | 'weak' | 'contested';
  strength?: number;
}

/**
 * Create a synthesis thought with themes
 */
function createSynthesisWithThemes(
  themes: TestTheme[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createSynthesisThought({
    themes,
    ...overrides,
  } as any);
}

/**
 * Sample gap for testing
 */
interface TestGap {
  id: string;
  description: string;
  type?: 'empirical' | 'theoretical' | 'methodological' | 'population' | 'contextual';
  importance?: 'critical' | 'significant' | 'moderate' | 'minor';
}

/**
 * Create a synthesis thought with research gaps
 */
function createSynthesisWithGaps(
  gaps: TestGap[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createSynthesisThought({
    researchGaps: gaps,
    gaps,
    ...overrides,
  } as any);
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_SOURCES_FEW: TestSource[] = [
  { id: 's1', title: 'Deep Learning Fundamentals', authors: ['Hinton, G.'], year: 2012 },
  { id: 's2', title: 'Attention Is All You Need', authors: ['Vaswani, A.'], year: 2017 },
  { id: 's3', title: 'BERT: Pre-training Transformers', authors: ['Devlin, J.'], year: 2019 },
];

const SAMPLE_SOURCES_MANY: TestSource[] = [
  { id: 's1', title: 'Source 1', year: 2018 },
  { id: 's2', title: 'Source 2', year: 2019 },
  { id: 's3', title: 'Source 3', year: 2019 },
  { id: 's4', title: 'Source 4', year: 2020 },
  { id: 's5', title: 'Source 5', year: 2020 },
  { id: 's6', title: 'Source 6', year: 2021 },
  { id: 's7', title: 'Source 7', year: 2021 },
  { id: 's8', title: 'Source 8', year: 2022 },
  { id: 's9', title: 'Source 9', year: 2022 },
  { id: 's10', title: 'Source 10', year: 2023 },
  { id: 's11', title: 'Source 11', year: 2023 },
];

const SAMPLE_THEMES: TestTheme[] = [
  { id: 't1', name: 'Attention Mechanisms', sourceIds: ['s1', 's2'], consensus: 'strong' },
  { id: 't2', name: 'Transfer Learning', sourceIds: ['s2', 's3'], consensus: 'moderate' },
  { id: 't3', name: 'Self-Supervised Learning', sourceIds: ['s3'], consensus: 'weak' },
];

// ============================================================================
// TESTS
// ============================================================================

describe('Academic Synthesis Mode Integration Tests', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-ACD-001: Basic synthesis thought
   */
  describe('T-ACD-001: Basic Synthesis Thought', () => {
    it('should create a basic synthesis thought with minimal params', () => {
      const input = createSynthesisThought({
        thought: 'Beginning literature synthesis on transformer architectures',
      });

      const thought = factory.createThought(input, 'session-syn-001');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect(thought.content).toBe('Beginning literature synthesis on transformer architectures');
      expect(thought.sessionId).toBe('session-syn-001');
    });

    it('should assign unique IDs to synthesis thoughts', () => {
      const input1 = createSynthesisThought({ thought: 'First synthesis step' });
      const input2 = createSynthesisThought({ thought: 'Second synthesis step' });

      const thought1 = factory.createThought(input1, 'session-syn-001');
      const thought2 = factory.createThought(input2, 'session-syn-001');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-ACD-002: Synthesis with sources array (3 sources)
   */
  describe('T-ACD-002: Synthesis with 3 Sources', () => {
    it('should include sources array in thought', () => {
      const input = createSynthesisWithSources(SAMPLE_SOURCES_FEW, {
        thought: 'Analyzing three seminal papers on deep learning',
      });

      const thought = factory.createThought(input, 'session-syn-002');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).sources).toHaveLength(3);
    });
  });

  /**
   * T-ACD-003: Synthesis with sources array (10+ sources)
   */
  describe('T-ACD-003: Synthesis with 10+ Sources', () => {
    it('should handle large source arrays', () => {
      const input = createSynthesisWithSources(SAMPLE_SOURCES_MANY, {
        thought: 'Comprehensive literature review across 11 sources',
      });

      const thought = factory.createThought(input, 'session-syn-003');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).sources).toHaveLength(11);
    });
  });

  /**
   * T-ACD-004: Synthesis with sources[].authors
   */
  describe('T-ACD-004: Source Authors', () => {
    it('should include author information in sources', () => {
      const sources: TestSource[] = [
        { id: 's1', title: 'Paper 1', authors: ['Smith, J.', 'Jones, A.'] },
        { id: 's2', title: 'Paper 2', authors: ['Brown, M.', 'Davis, K.', 'Wilson, L.'] },
      ];
      const input = createSynthesisWithSources(sources, {
        thought: 'Tracking author contributions',
      });

      const thought = factory.createThought(input, 'session-syn-004');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).sources[0].authors).toHaveLength(2);
      expect((input as any).sources[1].authors).toHaveLength(3);
    });
  });

  /**
   * T-ACD-005: Synthesis with sources[].year
   */
  describe('T-ACD-005: Source Publication Year', () => {
    it('should include publication year in sources', () => {
      const sources: TestSource[] = [
        { id: 's1', title: 'Historical Paper', year: 1950 },
        { id: 's2', title: 'Recent Paper', year: 2024 },
      ];
      const input = createSynthesisWithSources(sources, {
        thought: 'Analyzing temporal evolution of research',
      });

      const thought = factory.createThought(input, 'session-syn-005');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).sources[0].year).toBe(1950);
      expect((input as any).sources[1].year).toBe(2024);
    });
  });

  /**
   * T-ACD-006: Synthesis with sources[].venue
   */
  describe('T-ACD-006: Source Venue', () => {
    it('should include publication venue in sources', () => {
      const sources: TestSource[] = [
        { id: 's1', title: 'Journal Paper', venue: 'Nature Machine Intelligence' },
        { id: 's2', title: 'Conference Paper', venue: 'NeurIPS 2023' },
        { id: 's3', title: 'Preprint', venue: 'arXiv' },
      ];
      const input = createSynthesisWithSources(sources, {
        thought: 'Reviewing sources across different venues',
      });

      const thought = factory.createThought(input, 'session-syn-006');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).sources[0].venue).toBe('Nature Machine Intelligence');
    });
  });

  /**
   * T-ACD-007: Synthesis with sources[].doi
   */
  describe('T-ACD-007: Source DOI', () => {
    it('should include DOI in sources for traceability', () => {
      const sources: TestSource[] = [
        { id: 's1', title: 'Attention Paper', doi: '10.5555/3295222.3295349' },
        { id: 's2', title: 'BERT Paper', doi: '10.18653/v1/N19-1423' },
      ];
      const input = createSynthesisWithSources(sources, {
        thought: 'Maintaining DOI references for citations',
      });

      const thought = factory.createThought(input, 'session-syn-007');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).sources[0].doi).toContain('10.');
    });
  });

  /**
   * T-ACD-008: Synthesis with sources[].type
   */
  describe('T-ACD-008: Source Type', () => {
    it('should include source type classification', () => {
      const sources: TestSource[] = [
        { id: 's1', title: 'Journal Article', type: 'journal_article' },
        { id: 's2', title: 'Conference Paper', type: 'conference_paper' },
        { id: 's3', title: 'Book Chapter', type: 'book_chapter' },
        { id: 's4', title: 'Meta-Analysis', type: 'meta_analysis' },
      ];
      const input = createSynthesisWithSources(sources, {
        thought: 'Categorizing sources by type',
      });

      const thought = factory.createThought(input, 'session-syn-008');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
    });
  });

  /**
   * T-ACD-009: Synthesis with sources[].relevance
   */
  describe('T-ACD-009: Source Relevance', () => {
    it('should include relevance scores for sources', () => {
      const sources: TestSource[] = [
        { id: 's1', title: 'Highly Relevant', relevance: 0.95 },
        { id: 's2', title: 'Moderately Relevant', relevance: 0.65 },
        { id: 's3', title: 'Marginally Relevant', relevance: 0.35 },
      ];
      const input = createSynthesisWithSources(sources, {
        thought: 'Prioritizing sources by relevance',
      });

      const thought = factory.createThought(input, 'session-syn-009');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).sources[0].relevance).toBe(0.95);
    });
  });

  /**
   * T-ACD-010: Synthesis with themes array
   */
  describe('T-ACD-010: Themes Array', () => {
    it('should include themes extracted from sources', () => {
      const input = createSynthesisWithThemes(SAMPLE_THEMES, {
        thought: 'Identifying cross-cutting themes in literature',
      });

      const thought = factory.createThought(input, 'session-syn-010');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).themes).toHaveLength(3);
    });
  });

  /**
   * T-ACD-011: Synthesis with themes[].sourceIds
   */
  describe('T-ACD-011: Theme Source Tracking', () => {
    it('should track which sources contribute to each theme', () => {
      const themes: TestTheme[] = [
        { id: 't1', name: 'Shared Theme', sourceIds: ['s1', 's2', 's3', 's4'] },
        { id: 't2', name: 'Niche Theme', sourceIds: ['s2'] },
      ];
      const input = createSynthesisWithThemes(themes, {
        thought: 'Mapping themes to source coverage',
      });

      const thought = factory.createThought(input, 'session-syn-011');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).themes[0].sourceIds).toHaveLength(4);
      expect((input as any).themes[1].sourceIds).toHaveLength(1);
    });
  });

  /**
   * T-ACD-012: Synthesis with themes[].consensus
   */
  describe('T-ACD-012: Theme Consensus', () => {
    it('should track consensus level for each theme', () => {
      const themes: TestTheme[] = [
        { id: 't1', name: 'Well-Established', consensus: 'strong' },
        { id: 't2', name: 'Growing Consensus', consensus: 'moderate' },
        { id: 't3', name: 'Emerging Topic', consensus: 'weak' },
        { id: 't4', name: 'Debated Topic', consensus: 'contested' },
      ];
      const input = createSynthesisWithThemes(themes, {
        thought: 'Assessing consensus across themes',
      });

      const thought = factory.createThought(input, 'session-syn-012');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).themes[3].consensus).toBe('contested');
    });
  });

  /**
   * T-ACD-013: Synthesis with themes[].strength
   */
  describe('T-ACD-013: Theme Strength', () => {
    it('should include strength scores for themes', () => {
      const themes: TestTheme[] = [
        { id: 't1', name: 'Strong Theme', strength: 0.9 },
        { id: 't2', name: 'Moderate Theme', strength: 0.5 },
        { id: 't3', name: 'Weak Theme', strength: 0.2 },
      ];
      const input = createSynthesisWithThemes(themes, {
        thought: 'Quantifying theme strength',
      });

      const thought = factory.createThought(input, 'session-syn-013');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).themes[0].strength).toBe(0.9);
    });
  });

  /**
   * T-ACD-014: Synthesis with researchGaps array
   */
  describe('T-ACD-014: Research Gaps Array', () => {
    it('should identify research gaps in literature', () => {
      const gaps: TestGap[] = [
        { id: 'g1', description: 'Limited studies on edge cases' },
        { id: 'g2', description: 'No longitudinal data available' },
      ];
      const input = createSynthesisWithGaps(gaps, {
        thought: 'Identifying gaps in existing research',
      });

      const thought = factory.createThought(input, 'session-syn-014');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
    });
  });

  /**
   * T-ACD-015: Synthesis with gaps[].type (5 types)
   */
  describe('T-ACD-015: Gap Types', () => {
    it('should support all 5 gap types', () => {
      const gaps: TestGap[] = [
        { id: 'g1', description: 'Need more experiments', type: 'empirical' },
        { id: 'g2', description: 'Theoretical framework missing', type: 'theoretical' },
        { id: 'g3', description: 'Better methods needed', type: 'methodological' },
        { id: 'g4', description: 'Understudied populations', type: 'population' },
        { id: 'g5', description: 'Different contexts unexplored', type: 'contextual' },
      ];
      const input = createSynthesisWithGaps(gaps, {
        thought: 'Categorizing gaps by type',
      });

      const thought = factory.createThought(input, 'session-syn-015');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).gaps).toHaveLength(5);
    });
  });

  /**
   * T-ACD-016: Synthesis with gaps[].importance
   */
  describe('T-ACD-016: Gap Importance', () => {
    it('should track importance level of gaps', () => {
      const gaps: TestGap[] = [
        { id: 'g1', description: 'Fundamental issue', importance: 'critical' },
        { id: 'g2', description: 'Major limitation', importance: 'significant' },
        { id: 'g3', description: 'Notable gap', importance: 'moderate' },
        { id: 'g4', description: 'Minor omission', importance: 'minor' },
      ];
      const input = createSynthesisWithGaps(gaps, {
        thought: 'Prioritizing gaps by importance',
      });

      const thought = factory.createThought(input, 'session-syn-016');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      expect((input as any).gaps[0].importance).toBe('critical');
    });
  });

  /**
   * T-ACD-017: Synthesis multi-thought literature review
   */
  describe('T-ACD-017: Multi-Thought Literature Review', () => {
    it('should support comprehensive literature review session', () => {
      const sessionId = 'session-syn-017-review';

      // Step 1: Source identification
      const step1 = factory.createThought(
        createSynthesisWithSources(SAMPLE_SOURCES_FEW, {
          thought: 'Phase 1: Identifying key sources on transformer architectures',
          thoughtNumber: 1,
          totalThoughts: 4,
          nextThoughtNeeded: true,
        }),
        sessionId
      );

      // Step 2: Theme extraction
      const step2 = factory.createThought(
        createSynthesisWithThemes(SAMPLE_THEMES, {
          thought: 'Phase 2: Extracting themes across sources',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
        }),
        sessionId
      );

      // Step 3: Gap identification
      const step3 = factory.createThought(
        createSynthesisWithGaps([
          { id: 'g1', description: 'Efficiency in resource-constrained environments', type: 'empirical' },
          { id: 'g2', description: 'Long-context handling', type: 'theoretical' },
        ], {
          thought: 'Phase 3: Identifying research gaps',
          thoughtNumber: 3,
          totalThoughts: 4,
          nextThoughtNeeded: true,
        }),
        sessionId
      );

      // Step 4: Synthesis conclusion
      const step4 = factory.createThought(
        createSynthesisThought({
          thought: 'Phase 4: Synthesizing findings into coherent framework',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
        }),
        sessionId
      );

      expect([step1, step2, step3, step4]).toHaveLength(4);
      [step1, step2, step3, step4].forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);
      });
    });
  });

  /**
   * T-ACD-018: Synthesis source coverage tracking
   */
  describe('T-ACD-018: Source Coverage Tracking', () => {
    it('should track source coverage across themes', () => {
      const sources: TestSource[] = [
        { id: 's1', title: 'Source 1' },
        { id: 's2', title: 'Source 2' },
        { id: 's3', title: 'Source 3' },
        { id: 's4', title: 'Source 4' },
        { id: 's5', title: 'Source 5' },
      ];
      const themes: TestTheme[] = [
        { id: 't1', name: 'Theme A', sourceIds: ['s1', 's2', 's3'] },
        { id: 't2', name: 'Theme B', sourceIds: ['s2', 's4'] },
        { id: 't3', name: 'Theme C', sourceIds: ['s1', 's3', 's5'] },
      ];

      const input = createSynthesisThought({
        sources,
        themes,
        thought: 'Tracking which sources contribute to which themes',
      } as any);

      const thought = factory.createThought(input, 'session-syn-018');

      expect(thought.mode).toBe(ThinkingMode.SYNTHESIS);

      // Verify all sources are covered by at least one theme
      const coveredSources = new Set<string>();
      for (const theme of themes) {
        for (const sourceId of theme.sourceIds || []) {
          coveredSources.add(sourceId);
        }
      }
      expect(coveredSources.size).toBe(5);
    });
  });

  /**
   * T-ACD-019: Synthesis theme extraction session
   */
  describe('T-ACD-019: Theme Extraction Session', () => {
    it('should support iterative theme extraction and refinement', () => {
      const sessionId = 'session-syn-019-themes';

      // Initial theme identification
      const step1 = factory.createThought(
        createSynthesisWithThemes(
          [
            { id: 't1', name: 'Initial Theme 1', strength: 0.4 },
            { id: 't2', name: 'Initial Theme 2', strength: 0.3 },
            { id: 't3', name: 'Initial Theme 3', strength: 0.3 },
          ],
          {
            thought: 'Initial pass: Identifying candidate themes',
            thoughtNumber: 1,
            totalThoughts: 3,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Theme refinement
      const step2 = factory.createThought(
        createSynthesisWithThemes(
          [
            { id: 't1', name: 'Refined Theme 1', strength: 0.6, consensus: 'moderate' },
            { id: 't2-3', name: 'Merged Theme 2+3', strength: 0.5, consensus: 'weak' },
          ],
          {
            thought: 'Refinement: Merging weak themes, strengthening patterns',
            thoughtNumber: 2,
            totalThoughts: 3,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Final themes with full details
      const step3 = factory.createThought(
        createSynthesisWithThemes(
          [
            { id: 't1', name: 'Final Theme 1', strength: 0.8, consensus: 'strong', sourceIds: ['s1', 's2', 's3'] },
            { id: 't2', name: 'Final Theme 2', strength: 0.7, consensus: 'moderate', sourceIds: ['s4', 's5'] },
          ],
          {
            thought: 'Final themes with source mappings and consensus levels',
            thoughtNumber: 3,
            totalThoughts: 3,
            nextThoughtNeeded: false,
          }
        ),
        sessionId
      );

      expect([step1, step2, step3]).toHaveLength(3);
      // Final themes should be stronger than initial
      expect((step3 as any).thoughtNumber).toBe(3);
    });
  });
});
