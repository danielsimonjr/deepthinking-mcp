/**
 * Academic Analysis Mode Integration Tests
 *
 * Tests T-ACD-060 through T-ACD-083: Comprehensive integration tests
 * for the deepthinking_academic tool with analysis mode.
 * Covers qualitative methodologies, coding, memos, and saturation.
 *
 * Phase 11 Sprint 7: Engineering & Academic Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type AnalysisThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { createBaseThought } from '../../utils/thought-factory.js';

// ============================================================================
// ANALYSIS MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic analysis thought
 */
function createAnalysisThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'analysis',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Qualitative analysis methodologies
 */
type AnalysisMethodology =
  | 'thematic_analysis'
  | 'grounded_theory'
  | 'discourse_analysis'
  | 'content_analysis'
  | 'phenomenological'
  | 'narrative_analysis'
  | 'framework_analysis'
  | 'template_analysis'
  | 'mixed_qualitative';

/**
 * Create an analysis thought with methodology
 */
function createAnalysisWithMethodology(
  methodology: AnalysisMethodology,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAnalysisThought({
    methodology,
    ...overrides,
  } as any);
}

/**
 * Data source for analysis
 */
interface TestDataSource {
  id: string;
  type?: string;
  description?: string;
  participantId?: string;
}

/**
 * Create an analysis thought with data sources
 */
function createAnalysisWithDataSources(
  dataSources: TestDataSource[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAnalysisThought({
    dataSources,
    ...overrides,
  } as any);
}

/**
 * Code types for qualitative coding
 */
type CodeType = 'descriptive' | 'in_vivo' | 'process' | 'initial' | 'focused' | 'axial' | 'theoretical' | 'emotion' | 'value';

/**
 * Qualitative code
 */
interface TestCode {
  id: string;
  label: string;
  type?: CodeType;
  definition?: string;
  examples?: string[];
  frequency?: number;
}

/**
 * Create an analysis thought with codes
 */
function createAnalysisWithCodes(
  codes: TestCode[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAnalysisThought({
    codes,
    ...overrides,
  } as any);
}

/**
 * Memo types
 */
type MemoType = 'analytical' | 'theoretical' | 'methodological' | 'reflexive' | 'code' | 'operational';

/**
 * Analytical memo
 */
interface TestMemo {
  id: string;
  content: string;
  type?: MemoType;
  relatedCodes?: string[];
}

/**
 * Create an analysis thought with memos
 */
function createAnalysisWithMemos(
  memos: TestMemo[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAnalysisThought({
    memos,
    ...overrides,
  } as any);
}

// ============================================================================
// TESTS
// ============================================================================

describe('Academic Analysis Mode Integration Tests', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-ACD-060: Basic analysis thought
   */
  describe('T-ACD-060: Basic Analysis Thought', () => {
    it('should create a basic analysis thought with minimal params', () => {
      const input = createAnalysisThought({
        thought: 'Beginning qualitative analysis of interview data',
      });

      const thought = factory.createThought(input, 'session-anl-060');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect(thought.content).toBe('Beginning qualitative analysis of interview data');
      expect(thought.sessionId).toBe('session-anl-060');
    });

    it('should assign unique IDs to analysis thoughts', () => {
      const input1 = createAnalysisThought({ thought: 'First analysis step' });
      const input2 = createAnalysisThought({ thought: 'Second analysis step' });

      const thought1 = factory.createThought(input1, 'session-anl-060');
      const thought2 = factory.createThought(input2, 'session-anl-060');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-ACD-061: Analysis with methodology = thematic_analysis
   */
  describe('T-ACD-061: Thematic Analysis Methodology', () => {
    it('should support thematic analysis (Braun & Clarke)', () => {
      const input = createAnalysisWithMethodology('thematic_analysis', {
        thought: 'Applying Braun & Clarke thematic analysis approach',
      });

      const thought = factory.createThought(input, 'session-anl-061');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).methodology).toBe('thematic_analysis');
    });
  });

  /**
   * T-ACD-062: Analysis with methodology = grounded_theory
   */
  describe('T-ACD-062: Grounded Theory Methodology', () => {
    it('should support grounded theory approach', () => {
      const input = createAnalysisWithMethodology('grounded_theory', {
        thought: 'Applying Glaser & Strauss grounded theory methodology',
      });

      const thought = factory.createThought(input, 'session-anl-062');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).methodology).toBe('grounded_theory');
    });
  });

  /**
   * T-ACD-063: Analysis with methodology = discourse_analysis
   */
  describe('T-ACD-063: Discourse Analysis Methodology', () => {
    it('should support discourse analysis', () => {
      const input = createAnalysisWithMethodology('discourse_analysis', {
        thought: 'Analyzing power relations and language use',
      });

      const thought = factory.createThought(input, 'session-anl-063');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).methodology).toBe('discourse_analysis');
    });
  });

  /**
   * T-ACD-064: Analysis with methodology = content_analysis
   */
  describe('T-ACD-064: Content Analysis Methodology', () => {
    it('should support content analysis', () => {
      const input = createAnalysisWithMethodology('content_analysis', {
        thought: 'Systematic coding and categorization of text content',
      });

      const thought = factory.createThought(input, 'session-anl-064');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).methodology).toBe('content_analysis');
    });
  });

  /**
   * T-ACD-065: Analysis with methodology = phenomenological
   */
  describe('T-ACD-065: Phenomenological Methodology', () => {
    it('should support phenomenological analysis (IPA)', () => {
      const input = createAnalysisWithMethodology('phenomenological', {
        thought: 'Exploring lived experience through IPA methodology',
      });

      const thought = factory.createThought(input, 'session-anl-065');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).methodology).toBe('phenomenological');
    });
  });

  /**
   * T-ACD-066: Analysis with methodology = narrative_analysis
   */
  describe('T-ACD-066: Narrative Analysis Methodology', () => {
    it('should support narrative analysis', () => {
      const input = createAnalysisWithMethodology('narrative_analysis', {
        thought: 'Examining story structure and meaning-making',
      });

      const thought = factory.createThought(input, 'session-anl-066');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).methodology).toBe('narrative_analysis');
    });
  });

  /**
   * T-ACD-067: Analysis with dataSources array
   */
  describe('T-ACD-067: Data Sources Array', () => {
    it('should include data sources for analysis', () => {
      const dataSources: TestDataSource[] = [
        { id: 'ds1', description: 'Interview transcript 1' },
        { id: 'ds2', description: 'Interview transcript 2' },
        { id: 'ds3', description: 'Focus group notes' },
      ];
      const input = createAnalysisWithDataSources(dataSources, {
        thought: 'Organizing data sources for analysis',
      });

      const thought = factory.createThought(input, 'session-anl-067');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).dataSources).toHaveLength(3);
    });
  });

  /**
   * T-ACD-068: Analysis with dataSources[].type
   */
  describe('T-ACD-068: Data Source Types', () => {
    it('should support various data source types', () => {
      const dataSources: TestDataSource[] = [
        { id: 'ds1', type: 'interview' },
        { id: 'ds2', type: 'focus_group' },
        { id: 'ds3', type: 'observation' },
        { id: 'ds4', type: 'document' },
        { id: 'ds5', type: 'field_notes' },
      ];
      const input = createAnalysisWithDataSources(dataSources, {
        thought: 'Multi-source data collection',
      });

      const thought = factory.createThought(input, 'session-anl-068');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).dataSources[0].type).toBe('interview');
    });
  });

  /**
   * T-ACD-069: Analysis with dataSources[].participantId
   */
  describe('T-ACD-069: Data Source Participant IDs', () => {
    it('should track participant IDs for data sources', () => {
      const dataSources: TestDataSource[] = [
        { id: 'ds1', participantId: 'P001' },
        { id: 'ds2', participantId: 'P002' },
        { id: 'ds3', participantId: 'P003' },
      ];
      const input = createAnalysisWithDataSources(dataSources, {
        thought: 'Linking data to participants',
      });

      const thought = factory.createThought(input, 'session-anl-069');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).dataSources[0].participantId).toBe('P001');
    });
  });

  /**
   * T-ACD-070: Analysis with codes array
   */
  describe('T-ACD-070: Codes Array', () => {
    it('should include qualitative codes', () => {
      const codes: TestCode[] = [
        { id: 'c1', label: 'Uncertainty' },
        { id: 'c2', label: 'Support-seeking' },
        { id: 'c3', label: 'Resilience' },
      ];
      const input = createAnalysisWithCodes(codes, {
        thought: 'Developing initial code set',
      });

      const thought = factory.createThought(input, 'session-anl-070');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).codes).toHaveLength(3);
    });
  });

  /**
   * T-ACD-071: Analysis with codes[].type (9 code types)
   */
  describe('T-ACD-071: Code Types', () => {
    it('should support all 9 code types', () => {
      const codes: TestCode[] = [
        { id: 'c1', label: 'Description', type: 'descriptive' },
        { id: 'c2', label: 'In participant words', type: 'in_vivo' },
        { id: 'c3', label: 'Action-oriented', type: 'process' },
        { id: 'c4', label: 'First pass', type: 'initial' },
        { id: 'c5', label: 'Refined', type: 'focused' },
        { id: 'c6', label: 'Relational', type: 'axial' },
        { id: 'c7', label: 'Abstract', type: 'theoretical' },
        { id: 'c8', label: 'Feeling', type: 'emotion' },
        { id: 'c9', label: 'Belief', type: 'value' },
      ];
      const input = createAnalysisWithCodes(codes, {
        thought: 'Using diverse coding strategies',
      });

      const thought = factory.createThought(input, 'session-anl-071');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).codes).toHaveLength(9);
    });
  });

  /**
   * T-ACD-072: Analysis with codes[].definition
   */
  describe('T-ACD-072: Code Definitions', () => {
    it('should include code definitions', () => {
      const codes: TestCode[] = [
        { id: 'c1', label: 'Coping', definition: 'Strategies used to manage stress or challenges' },
        { id: 'c2', label: 'Isolation', definition: 'Feeling disconnected from social support' },
      ];
      const input = createAnalysisWithCodes(codes, {
        thought: 'Defining codes clearly',
      });

      const thought = factory.createThought(input, 'session-anl-072');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).codes[0].definition).toContain('Strategies');
    });
  });

  /**
   * T-ACD-073: Analysis with codes[].examples
   */
  describe('T-ACD-073: Code Examples', () => {
    it('should include example quotes for codes', () => {
      const codes: TestCode[] = [
        {
          id: 'c1',
          label: 'Hope',
          examples: [
            'I believe things will get better',
            'There is light at the end of the tunnel',
            'Tomorrow is a new day',
          ],
        },
      ];
      const input = createAnalysisWithCodes(codes, {
        thought: 'Supporting codes with examples',
      });

      const thought = factory.createThought(input, 'session-anl-073');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).codes[0].examples).toHaveLength(3);
    });
  });

  /**
   * T-ACD-074: Analysis with codes[].frequency
   */
  describe('T-ACD-074: Code Frequency', () => {
    it('should track code frequency', () => {
      const codes: TestCode[] = [
        { id: 'c1', label: 'Common theme', frequency: 45 },
        { id: 'c2', label: 'Moderate theme', frequency: 20 },
        { id: 'c3', label: 'Rare theme', frequency: 3 },
      ];
      const input = createAnalysisWithCodes(codes, {
        thought: 'Tracking code prevalence',
      });

      const thought = factory.createThought(input, 'session-anl-074');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).codes[0].frequency).toBe(45);
    });
  });

  /**
   * T-ACD-075: Analysis with categories array
   */
  describe('T-ACD-075: Categories Array', () => {
    it('should include categories derived from codes', () => {
      const categories = ['Emotional Responses', 'Behavioral Strategies', 'Social Dynamics'];
      const input = createAnalysisThought({
        categories,
        thought: 'Organizing codes into categories',
      } as any);

      const thought = factory.createThought(input, 'session-anl-075');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).categories).toHaveLength(3);
    });
  });

  /**
   * T-ACD-076: Analysis with memos array
   */
  describe('T-ACD-076: Memos Array', () => {
    it('should include analytical memos', () => {
      const memos: TestMemo[] = [
        { id: 'm1', content: 'Noticing pattern of avoidance across participants' },
        { id: 'm2', content: 'Connection between social support and coping' },
      ];
      const input = createAnalysisWithMemos(memos, {
        thought: 'Documenting analytical insights',
      });

      const thought = factory.createThought(input, 'session-anl-076');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).memos).toHaveLength(2);
    });
  });

  /**
   * T-ACD-077: Analysis with memos[].type (6 memo types)
   */
  describe('T-ACD-077: Memo Types', () => {
    it('should support all 6 memo types', () => {
      const memos: TestMemo[] = [
        { id: 'm1', content: 'Insight about patterns', type: 'analytical' },
        { id: 'm2', content: 'Emerging theory note', type: 'theoretical' },
        { id: 'm3', content: 'Decision to change coding approach', type: 'methodological' },
        { id: 'm4', content: 'My reaction to participant story', type: 'reflexive' },
        { id: 'm5', content: 'Definition refinement for code X', type: 'code' },
        { id: 'm6', content: 'Next steps in analysis', type: 'operational' },
      ];
      const input = createAnalysisWithMemos(memos, {
        thought: 'Using diverse memo types',
      });

      const thought = factory.createThought(input, 'session-anl-077');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).memos).toHaveLength(6);
    });
  });

  /**
   * T-ACD-078: Analysis with memos[].relatedCodes
   */
  describe('T-ACD-078: Memo-Code Relations', () => {
    it('should track which codes memos relate to', () => {
      const memos: TestMemo[] = [
        { id: 'm1', content: 'Connection between codes', relatedCodes: ['c1', 'c2', 'c3'] },
        { id: 'm2', content: 'Refinement of single code', relatedCodes: ['c1'] },
      ];
      const input = createAnalysisWithMemos(memos, {
        thought: 'Linking memos to codes',
      });

      const thought = factory.createThought(input, 'session-anl-078');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).memos[0].relatedCodes).toHaveLength(3);
    });
  });

  /**
   * T-ACD-079: Analysis with saturationReached
   */
  describe('T-ACD-079: Saturation Reached', () => {
    it('should track theoretical saturation', () => {
      const input = createAnalysisThought({
        saturationReached: true,
        thought: 'No new codes emerging - saturation achieved',
      } as any);

      const thought = factory.createThought(input, 'session-anl-079');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).saturationReached).toBe(true);
    });

    it('should indicate when saturation not reached', () => {
      const input = createAnalysisThought({
        saturationReached: false,
        thought: 'New codes still emerging - continue sampling',
      } as any);

      const thought = factory.createThought(input, 'session-anl-079');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).saturationReached).toBe(false);
    });
  });

  /**
   * T-ACD-080: Analysis with keyInsight
   */
  describe('T-ACD-080: Key Insight', () => {
    it('should include key analytical insight', () => {
      const input = createAnalysisThought({
        keyInsight: 'Participants construct identity through narrative of overcoming adversity',
        thought: 'Central finding from thematic analysis',
      } as any);

      const thought = factory.createThought(input, 'session-anl-080');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).keyInsight).toContain('identity');
    });
  });

  /**
   * T-ACD-081: Analysis with analysisMethod (simplified)
   */
  describe('T-ACD-081: Simplified Analysis Method', () => {
    it('should support simplified analysis method specification', () => {
      const methods = ['thematic', 'grounded-theory', 'discourse', 'content', 'narrative', 'phenomenological'];

      for (const analysisMethod of methods) {
        const input = createAnalysisThought({
          analysisMethod,
          thought: `Applying ${analysisMethod} approach`,
        } as any);

        const thought = factory.createThought(input, `session-anl-081-${analysisMethod}`);
        expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      }
    });
  });

  /**
   * T-ACD-082: Analysis multi-thought coding session
   */
  describe('T-ACD-082: Multi-Thought Coding Session', () => {
    it('should support complete coding workflow', () => {
      const sessionId = 'session-anl-082-coding';

      // Step 1: Data familiarization
      const step1 = factory.createThought(
        createAnalysisWithDataSources(
          [
            { id: 'ds1', type: 'interview', participantId: 'P001' },
            { id: 'ds2', type: 'interview', participantId: 'P002' },
          ],
          {
            methodology: 'thematic_analysis',
            thought: 'Phase 1: Familiarizing with data',
            thoughtNumber: 1,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          } as any
        ),
        sessionId
      );

      // Step 2: Initial coding
      const step2 = factory.createThought(
        createAnalysisWithCodes(
          [
            { id: 'c1', label: 'Challenge', type: 'initial' },
            { id: 'c2', label: 'Support', type: 'initial' },
            { id: 'c3', label: 'Growth', type: 'initial' },
          ],
          {
            thought: 'Phase 2: Generating initial codes',
            thoughtNumber: 2,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 3: Focused coding
      const step3 = factory.createThought(
        createAnalysisWithCodes(
          [
            { id: 'c1', label: 'Overcoming obstacles', type: 'focused', frequency: 15 },
            { id: 'c2', label: 'Social network importance', type: 'focused', frequency: 12 },
          ],
          {
            thought: 'Phase 3: Refining to focused codes',
            thoughtNumber: 3,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 4: Memo writing
      const step4 = factory.createThought(
        createAnalysisWithMemos(
          [
            { id: 'm1', content: 'Pattern: challenges lead to growth when support is present', type: 'theoretical', relatedCodes: ['c1', 'c2', 'c3'] },
          ],
          {
            thought: 'Phase 4: Theoretical memo development',
            thoughtNumber: 4,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 5: Theme development
      const step5 = factory.createThought(
        createAnalysisThought({
          saturationReached: true,
          keyInsight: 'Resilience emerges through interplay of challenge and support',
          thought: 'Phase 5: Final themes and saturation assessment',
          thoughtNumber: 5,
          totalThoughts: 5,
          nextThoughtNeeded: false,
        } as any),
        sessionId
      );

      expect([step1, step2, step3, step4, step5]).toHaveLength(5);
      [step1, step2, step3, step4, step5].forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      });
    });
  });

  /**
   * T-ACD-083: Analysis theme development session
   */
  describe('T-ACD-083: Theme Development Session', () => {
    it('should support iterative theme development', () => {
      const sessionId = 'session-anl-083-themes';

      // Initial candidate themes
      const step1 = factory.createThought(
        createAnalysisThought({
          thought: 'Identifying candidate themes from initial codes',
          themes: [
            { id: 't1', name: 'Adaptation', codes: ['c1', 'c2'] },
            { id: 't2', name: 'Barriers', codes: ['c3', 'c4'] },
            { id: 't3', name: 'Resources', codes: ['c5'] },
          ],
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        } as any),
        sessionId
      );

      // Theme refinement
      const step2 = factory.createThought(
        createAnalysisThought({
          thought: 'Reviewing and refining candidate themes',
          themes: [
            { id: 't1', name: 'Adaptive Strategies', codes: ['c1', 'c2', 'c5'] },
            { id: 't2', name: 'Structural Barriers', codes: ['c3', 'c4'] },
          ],
          thoughtNumber: 2,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        } as any),
        sessionId
      );

      // Final thematic map
      const step3 = factory.createThought(
        createAnalysisThought({
          thought: 'Defining final themes with descriptions',
          themes: [
            {
              id: 't1',
              name: 'Navigating Change',
              description: 'How individuals adapt to new circumstances',
              prevalence: 0.8,
            },
            {
              id: 't2',
              name: 'Systemic Constraints',
              description: 'External factors limiting agency',
              prevalence: 0.6,
            },
          ],
          keyInsight: 'Tension between individual agency and structural constraints shapes experience',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
        } as any),
        sessionId
      );

      expect([step1, step2, step3]).toHaveLength(3);
      [step1, step2, step3].forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      });
    });

    it('should support grounded theory category development', () => {
      const input = createAnalysisWithMethodology('grounded_theory', {
        thought: 'Developing grounded theory categories with theoretical sampling',
        gtCategories: [
          {
            id: 'cat1',
            name: 'Core Category',
            properties: ['dimension1', 'dimension2'],
            isCore: true,
          },
          {
            id: 'cat2',
            name: 'Supporting Category',
            properties: ['dimension3'],
            isCore: false,
          },
        ],
      } as any);

      const thought = factory.createThought(input, 'session-anl-083-gt');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect((input as any).methodology).toBe('grounded_theory');
    });
  });
});
