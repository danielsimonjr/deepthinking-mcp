/**
 * AnalysisHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for the Qualitative Analysis handler:
 * - Codebook validation and inter-coder reliability
 * - Theme saturation assessment
 * - Methodology rigor checking
 * - Data coverage analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnalysisHandler } from '../../../../src/modes/handlers/AnalysisHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('AnalysisHandler', () => {
  let handler: AnalysisHandler;

  beforeEach(() => {
    handler = new AnalysisHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.ANALYSIS);
    });

    it('should have correct modeName', () => {
      expect(handler.modeName).toBe('Qualitative Analysis');
    });

    it('should have descriptive description', () => {
      expect(handler.description).toContain('qualitative analysis');
      expect(handler.description).toContain('codebook');
      expect(handler.description).toContain('saturation');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Analyzing interview transcripts for emerging themes',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'analysis',
    };

    it('should create thought with default thought type', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.ANALYSIS);
      expect(thought.thoughtType).toBe('initial_coding');
      expect(thought.content).toBe(baseInput.thought);
      expect(thought.sessionId).toBe('session-123');
    });

    it('should create thought with specified thought type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'theme_development',
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.thoughtType).toBe('theme_development');
    });

    it('should create thought with default methodology', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.methodology).toBe('thematic_analysis');
    });

    it('should create thought with specified methodology', () => {
      const input = {
        ...baseInput,
        methodology: 'grounded_theory',
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.methodology).toBe('grounded_theory');
    });

    it('should process codebook correctly', () => {
      const input = {
        ...baseInput,
        codebook: {
          name: 'Interview Analysis Codebook',
          codes: [
            {
              label: 'participant-experience',
              definition: 'Descriptions of personal experiences',
              type: 'descriptive',
              examples: ['I felt overwhelmed'],
            },
            {
              label: 'coping-strategy',
              definition: 'Methods used to cope',
              type: 'in_vivo',
              examples: ['Taking breaks helped'],
            },
          ],
        },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.codebook).toBeDefined();
      expect(thought.codebook!.name).toBe('Interview Analysis Codebook');
      expect(thought.codebook!.codes).toHaveLength(2);
      expect(thought.codebook!.codes[0].label).toBe('participant-experience');
      expect(thought.codebook!.codes[0].id).toBeDefined();
    });

    it('should calculate coding progress from data segments', () => {
      const input = {
        ...baseInput,
        dataSegments: [
          { id: 'seg1', text: 'Some text', codes: ['code1'] },
          { id: 'seg2', text: 'More text', codes: ['code2', 'code3'] },
          { id: 'seg3', text: 'Uncoded text', codes: [] },
          { id: 'seg4', text: 'Also uncoded' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.codingProgress).toBeDefined();
      expect(thought.codingProgress!.totalSegments).toBe(4);
      expect(thought.codingProgress!.segmentsCoded).toBe(2);
      expect(thought.codingProgress!.percentComplete).toBe(50);
    });

    it('should assess rigor automatically', () => {
      const input = {
        ...baseInput,
        codebook: {
          intercoderReliability: 0.85,
          codes: [],
        },
        themes: [
          { name: 'Theme 1', prevalence: 0.6, keyQuotes: ['q1', 'q2', 'q3'] },
        ],
        memos: [{ type: 'reflective_memo', content: 'My reflections' }],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.rigorAssessment).toBeDefined();
      expect(thought.rigorAssessment!.credibility.rating).toBe(0.7);
      expect(thought.rigorAssessment!.credibility.strategies).toContain('Multiple coders');
      expect(thought.rigorAssessment!.transferability.thickDescription).toBe(true);
      expect(thought.rigorAssessment!.confirmability.reflexivity).toBe(true);
    });

    it('should preserve data sources', () => {
      const input = {
        ...baseInput,
        dataSources: ['Interview transcripts', 'Focus group recordings', 'Field notes'],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.dataSources).toEqual(['Interview transcripts', 'Focus group recordings', 'Field notes']);
    });

    it('should handle themes input', () => {
      const input = {
        ...baseInput,
        themes: [
          {
            id: 'theme-1',
            name: 'Resilience',
            description: 'Patterns of resilience',
            prevalence: 0.75,
            codeIds: ['code1', 'code2'],
            keyQuotes: ['Quote 1', 'Quote 2'],
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.themes).toHaveLength(1);
      expect(thought.themes![0].name).toBe('Resilience');
      expect(thought.themes![0].prevalence).toBe(0.75);
    });

    it('should handle memos input', () => {
      const input = {
        ...baseInput,
        memos: [
          { id: 'memo-1', type: 'analytical_memo', content: 'Analytical observation' },
          { id: 'memo-2', type: 'reflective_memo', content: 'Reflection on bias' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.memos).toHaveLength(2);
    });

    it('should handle grounded theory categories', () => {
      const input = {
        ...baseInput,
        methodology: 'grounded_theory',
        gtCategories: {
          core: 'Adaptive Coping',
          axial: ['Resource Seeking', 'Support Networks'],
          selective: ['Primary Strategy'],
        },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.gtCategories).toBeDefined();
      expect(thought.gtCategories!.core).toBe('Adaptive Coping');
    });
  });

  describe('validate', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Coding interview data',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'analysis',
    };

    it('should return valid for well-formed input', () => {
      const input = {
        ...baseInput,
        dataSources: ['Interview transcripts'],
        methodology: 'thematic_analysis',
        codebook: {
          codes: [
            { label: 'code1', definition: 'First code definition', examples: ['example1'] },
          ],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
    });

    it('should warn when data sources are missing', () => {
      const result = handler.validate(baseInput);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'dataSources')).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('No data sources'))).toBe(true);
    });

    it('should warn for unknown methodology', () => {
      const input = {
        ...baseInput,
        dataSources: ['transcripts'],
        methodology: 'invalid_method',
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'methodology')).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Unknown methodology'))).toBe(true);
    });

    it('should accept all valid methodologies', () => {
      const methodologies = [
        'thematic_analysis',
        'grounded_theory',
        'discourse_analysis',
        'content_analysis',
        'phenomenological',
        'narrative_analysis',
        'framework_analysis',
        'template_analysis',
        'mixed_qualitative',
      ];

      for (const methodology of methodologies) {
        const input = {
          ...baseInput,
          dataSources: ['transcripts'],
          methodology,
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.field === 'methodology')).toBe(false);
      }
    });

    it('should warn when codebook has codes without definitions', () => {
      const input = {
        ...baseInput,
        dataSources: ['transcripts'],
        codebook: {
          codes: [
            { label: 'defined-code', definition: 'Has a definition', examples: [] },
            { label: 'undefined-code', definition: '', examples: [] },
            { label: 'null-def-code', examples: [] },
          ],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('codes lack definitions'))).toBe(true);
    });

    it('should warn when many codes lack examples', () => {
      const input = {
        ...baseInput,
        dataSources: ['transcripts'],
        codebook: {
          codes: [
            { label: 'code1', definition: 'def1', examples: [] },
            { label: 'code2', definition: 'def2', examples: [] },
            { label: 'code3', definition: 'def3', examples: [] },
            { label: 'code4', definition: 'def4', examples: ['example'] },
          ],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('lack example quotes'))).toBe(true);
    });

    it('should warn about missing inter-coder reliability for large codebooks', () => {
      const codes = Array.from({ length: 6 }, (_, i) => ({
        label: `code${i}`,
        definition: `def${i}`,
        examples: [`example${i}`],
      }));

      const input = {
        ...baseInput,
        dataSources: ['transcripts'],
        codebook: {
          codes,
          // No intercoderReliability
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('inter-coder reliability'))).toBe(true);
    });

    it('should warn about low inter-coder reliability', () => {
      const codes = Array.from({ length: 6 }, (_, i) => ({
        label: `code${i}`,
        definition: `def${i}`,
        examples: [`example${i}`],
      }));

      const input = {
        ...baseInput,
        dataSources: ['transcripts'],
        codebook: {
          codes,
          intercoderReliability: 0.5,
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('reliability is low'))).toBe(true);
    });

    it('should not warn about high inter-coder reliability', () => {
      const codes = Array.from({ length: 6 }, (_, i) => ({
        label: `code${i}`,
        definition: `def${i}`,
        examples: [`example${i}`],
      }));

      const input = {
        ...baseInput,
        dataSources: ['transcripts'],
        codebook: {
          codes,
          intercoderReliability: 0.85,
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('reliability is low'))).toBe(false);
    });

    it('should warn when many themes have low prevalence', () => {
      const input = {
        ...baseInput,
        dataSources: ['transcripts'],
        themes: [
          { name: 'Theme 1', prevalence: 0.1 }, // sparse
          { name: 'Theme 2', prevalence: 0.15 }, // sparse
          { name: 'Theme 3', prevalence: 0.1 }, // sparse
          { name: 'Theme 4', prevalence: 0.8 }, // saturated
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('low prevalence'))).toBe(true);
    });

    it('should validate code hierarchy references', () => {
      const input = {
        ...baseInput,
        dataSources: ['transcripts'],
        codebook: {
          codes: [
            { id: 'code1', label: 'Code 1', definition: 'def', examples: ['ex'] },
            { id: 'code2', label: 'Code 2', definition: 'def', examples: ['ex'] },
          ],
          codeHierarchy: {
            rootCodeIds: ['code1'],
            parentChildMap: {
              code1: ['code2', 'nonexistent-code'],
            },
          },
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('nonexistent-code'))).toBe(true);
    });

    it('should warn about invalid parent in hierarchy', () => {
      const input = {
        ...baseInput,
        dataSources: ['transcripts'],
        codebook: {
          codes: [{ id: 'code1', label: 'Code 1', definition: 'def', examples: ['ex'] }],
          codeHierarchy: {
            rootCodeIds: [],
            parentChildMap: {
              'nonexistent-parent': ['code1'],
            },
          },
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Parent code'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    const createThought = (overrides: any = {}) => {
      const baseInput: ThinkingToolInput = {
        thought: 'Analyzing data',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'analysis',
        ...overrides,
      };
      return handler.createThought(baseInput, 'session-123');
    };

    it('should include related modes', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.SYNTHESIS);
      expect(enhancements.relatedModes).toContain(ThinkingMode.CRITIQUE);
      expect(enhancements.relatedModes).toContain(ThinkingMode.INDUCTIVE);
    });

    it('should include qualitative mental models', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Qualitative Rigor (Guba & Lincoln)');
      expect(enhancements.mentalModels).toContain('Theoretical Saturation');
      expect(enhancements.mentalModels).toContain('Constant Comparative Method');
      expect(enhancements.mentalModels).toContain('Thick Description');
      expect(enhancements.mentalModels).toContain('Reflexivity');
    });

    it('should calculate correct metrics', () => {
      const thought = createThought({
        dataSources: ['Interview 1', 'Interview 2', 'Interview 3'],
        codebook: {
          codes: Array.from({ length: 15 }, (_, i) => ({
            label: `code${i}`,
            definition: `def${i}`,
          })),
          intercoderReliability: 0.82,
        },
        themes: [
          { name: 'Theme 1', prevalence: 0.6 },
          { name: 'Theme 2', prevalence: 0.8 },
          { name: 'Theme 3', prevalence: 0.5 },
        ],
        dataSegments: [
          { id: 'seg1', codes: ['code1'] },
          { id: 'seg2', codes: ['code2'] },
          { id: 'seg3', codes: [] },
          { id: 'seg4', codes: ['code1', 'code3'] },
        ],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.codeCount).toBe(15);
      expect(enhancements.metrics!.themeCount).toBe(3);
      expect(enhancements.metrics!.dataSourceCount).toBe(3);
      expect(enhancements.metrics!.segmentsCoded).toBe(3);
      expect(enhancements.metrics!.codingProgress).toBeCloseTo(0.75);
      expect(enhancements.metrics!.intercoderReliability).toBe(0.82);
      expect(enhancements.metrics!.avgThemePrevalence).toBeCloseTo(0.633, 2);
    });

    it('should provide methodology-specific guidance for thematic analysis', () => {
      const thought = createThought({ methodology: 'thematic_analysis' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Braun & Clarke'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('Theme refinement'))).toBe(true);
    });

    it('should provide methodology-specific guidance for grounded theory', () => {
      const thought = createThought({ methodology: 'grounded_theory' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Glaser & Strauss'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('Saturation'))).toBe(true);
    });

    it('should provide methodology-specific guidance for phenomenological', () => {
      const thought = createThought({ methodology: 'phenomenological' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('phenomenological'))).toBe(true);
    });

    it('should suggest generating more codes during initial coding', () => {
      const thought = createThought({
        thoughtType: 'initial_coding',
        codebook: {
          codes: Array.from({ length: 5 }, (_, i) => ({
            label: `code${i}`,
            definition: `def${i}`,
          })),
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Continue generating'))).toBe(true);
    });

    it('should suggest consolidating codes during focused coding with many codes', () => {
      const thought = createThought({
        thoughtType: 'focused_coding',
        codebook: {
          codes: Array.from({ length: 55 }, (_, i) => ({
            label: `code${i}`,
            definition: `def${i}`,
          })),
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('consolidating codes'))).toBe(true);
    });

    it('should suggest grouping codes during theme development with no themes', () => {
      const thought = createThought({
        thoughtType: 'theme_development',
        themes: [],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Group related codes'))).toBe(true);
    });

    it('should indicate saturation not achieved when new codes emerging', () => {
      const thought = createThought({
        thoughtType: 'saturation_assessment',
        rigorAssessment: {
          credibility: { rating: 0.7, strategies: [] },
          transferability: { rating: 0.7, thickDescription: true, contextProvided: true },
          dependability: { rating: 0.6, auditTrail: true, codebookStability: 0.7 },
          confirmability: { rating: 0.7, reflexivity: true, peerDebriefing: false },
          saturation: {
            achieved: false,
            evidence: 'Still finding new patterns',
            newCodesLastN: 5,
          },
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('New codes still emerging'))).toBe(true);
    });

    it('should indicate saturation achieved when appropriate', () => {
      const thought = createThought({
        thoughtType: 'saturation_assessment',
        rigorAssessment: {
          credibility: { rating: 0.8, strategies: ['Member checking'] },
          transferability: { rating: 0.7, thickDescription: true, contextProvided: true },
          dependability: { rating: 0.7, auditTrail: true, codebookStability: 0.8 },
          confirmability: { rating: 0.7, reflexivity: true, peerDebriefing: true },
          saturation: {
            achieved: true,
            evidence: 'No new codes in last 3 interviews',
            newCodesLastN: 0,
          },
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('saturation achieved'))).toBe(true);
    });

    it('should warn about low credibility rating', () => {
      const thought = createThought({
        rigorAssessment: {
          credibility: { rating: 0.4, strategies: [] },
          transferability: { rating: 0.5, thickDescription: false, contextProvided: true },
          dependability: { rating: 0.5, auditTrail: false, codebookStability: 0.5 },
          confirmability: { rating: 0.5, reflexivity: false, peerDebriefing: false },
          saturation: { achieved: false, evidence: '', newCodesLastN: 0 },
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toBeDefined();
      expect(enhancements.warnings!.some((w) => w.includes('Low credibility'))).toBe(true);
    });

    it('should suggest documenting reflexivity when missing', () => {
      const thought = createThought({
        rigorAssessment: {
          credibility: { rating: 0.6, strategies: [] },
          transferability: { rating: 0.5, thickDescription: false, contextProvided: true },
          dependability: { rating: 0.5, auditTrail: false, codebookStability: 0.5 },
          confirmability: { rating: 0.4, reflexivity: false, peerDebriefing: false },
          saturation: { achieved: false, evidence: '', newCodesLastN: 0 },
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('reflexivity'))).toBe(true);
    });

    it('should include standard guiding questions', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('consistently applied'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('full meaning'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('alternative interpretations'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('researcher positionality'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support data_familiarization', () => {
      expect(handler.supportsThoughtType('data_familiarization')).toBe(true);
    });

    it('should support initial_coding', () => {
      expect(handler.supportsThoughtType('initial_coding')).toBe(true);
    });

    it('should support focused_coding', () => {
      expect(handler.supportsThoughtType('focused_coding')).toBe(true);
    });

    it('should support theme_development', () => {
      expect(handler.supportsThoughtType('theme_development')).toBe(true);
    });

    it('should support theme_refinement', () => {
      expect(handler.supportsThoughtType('theme_refinement')).toBe(true);
    });

    it('should support theoretical_integration', () => {
      expect(handler.supportsThoughtType('theoretical_integration')).toBe(true);
    });

    it('should support memo_writing', () => {
      expect(handler.supportsThoughtType('memo_writing')).toBe(true);
    });

    it('should support saturation_assessment', () => {
      expect(handler.supportsThoughtType('saturation_assessment')).toBe(true);
    });

    it('should not support unknown thought types', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
      expect(handler.supportsThoughtType('coding')).toBe(false);
      expect(handler.supportsThoughtType('analysis')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete thematic analysis workflow', () => {
      const sessionId = 'thematic-session';

      // Step 1: Data familiarization
      const step1Input = {
        thought: 'Reading through all interview transcripts to gain familiarity',
        thoughtNumber: 1,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'analysis',
        thoughtType: 'data_familiarization',
        methodology: 'thematic_analysis',
        dataSources: ['Interview 1', 'Interview 2', 'Interview 3', 'Interview 4', 'Interview 5'],
      } as any;

      const thought1 = handler.createThought(step1Input, sessionId);
      expect(thought1.thoughtType).toBe('data_familiarization');
      expect(thought1.dataSources).toHaveLength(5);

      // Step 2: Initial coding
      const step2Input = {
        thought: 'Generating initial codes from the data',
        thoughtNumber: 2,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'analysis',
        thoughtType: 'initial_coding',
        methodology: 'thematic_analysis',
        codebook: {
          name: 'Initial Codebook',
          codes: [
            { label: 'stress', definition: 'Expression of stress', examples: ['I felt overwhelmed'] },
            { label: 'support', definition: 'Social support', examples: ['My family helped'] },
            { label: 'coping', definition: 'Coping mechanisms', examples: ['Taking breaks'] },
          ],
        },
        dataSegments: [
          { id: 'seg1', text: 'I felt overwhelmed by the workload', codes: ['stress'] },
          { id: 'seg2', text: 'My family was very supportive', codes: ['support'] },
        ],
      } as any;

      const thought2 = handler.createThought(step2Input, sessionId);
      expect(thought2.thoughtType).toBe('initial_coding');
      expect(thought2.codebook!.codes).toHaveLength(3);
      expect(thought2.codingProgress!.segmentsCoded).toBe(2);

      // Step 3: Theme development
      const step3Input = {
        thought: 'Grouping codes into candidate themes',
        thoughtNumber: 3,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'analysis',
        thoughtType: 'theme_development',
        methodology: 'thematic_analysis',
        themes: [
          {
            id: 'theme1',
            name: 'Work-Life Balance Challenges',
            description: 'Themes related to balancing work and personal life',
            prevalence: 0.6,
            codeIds: ['stress', 'coping'],
            keyQuotes: ['I felt overwhelmed by the workload'],
          },
          {
            id: 'theme2',
            name: 'Support Systems',
            description: 'The role of support networks',
            prevalence: 0.5,
            codeIds: ['support'],
            keyQuotes: ['My family was very supportive'],
          },
        ],
      } as any;

      const thought3 = handler.createThought(step3Input, sessionId);
      expect(thought3.thoughtType).toBe('theme_development');
      expect(thought3.themes).toHaveLength(2);

      // Validate the workflow
      const validation = handler.validate(step3Input);
      expect(validation.valid).toBe(true);

      // Get enhancements
      const enhancements = handler.getEnhancements(thought3);
      expect(enhancements.metrics!.themeCount).toBe(2);
      expect(enhancements.suggestions!.some((s) => s.includes('Braun & Clarke'))).toBe(true);
    });

    it('should handle grounded theory workflow', () => {
      const sessionId = 'gt-session';

      const input = {
        thought: 'Developing grounded theory from interview data',
        thoughtNumber: 4,
        totalThoughts: 8,
        nextThoughtNeeded: true,
        mode: 'analysis',
        thoughtType: 'theoretical_integration',
        methodology: 'grounded_theory',
        dataSources: ['Interview transcripts (n=20)'],
        codebook: {
          name: 'GT Codebook v3',
          version: 3,
          codes: Array.from({ length: 25 }, (_, i) => ({
            label: `gt-code-${i}`,
            definition: `Grounded theory code ${i}`,
            examples: [`Example for code ${i}`],
          })),
          intercoderReliability: 0.88,
        },
        gtCategories: {
          core: 'Adaptive Navigation',
          axial: ['Resource Mobilization', 'Network Building', 'Identity Negotiation'],
          selective: ['Primary coping strategy'],
        },
        themes: [
          { name: 'Resource Mobilization', prevalence: 0.85, keyQuotes: ['q1', 'q2', 'q3'] },
          { name: 'Network Building', prevalence: 0.75, keyQuotes: ['q4', 'q5', 'q6'] },
        ],
        memos: [
          { type: 'theoretical_memo', content: 'Core category emerged...' },
          { type: 'reflective_memo', content: 'My assumptions about...' },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.methodology).toBe('grounded_theory');
      expect(thought.gtCategories!.core).toBe('Adaptive Navigation');
      expect(validation.valid).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Glaser & Strauss'))).toBe(true);
      expect(enhancements.metrics!.intercoderReliability).toBe(0.88);
    });

    it('should assess saturation correctly', () => {
      const sessionId = 'saturation-session';

      // Not saturated - new codes emerging
      const unsaturatedInput = {
        thought: 'Assessing theoretical saturation - still finding new codes',
        thoughtNumber: 10,
        totalThoughts: 12,
        nextThoughtNeeded: true,
        mode: 'analysis',
        thoughtType: 'saturation_assessment',
        methodology: 'grounded_theory',
        rigorAssessment: {
          credibility: { rating: 0.7, strategies: ['Member checking'] },
          transferability: { rating: 0.6, thickDescription: true, contextProvided: true },
          dependability: { rating: 0.7, auditTrail: true, codebookStability: 0.75 },
          confirmability: { rating: 0.6, reflexivity: true, peerDebriefing: false },
          saturation: {
            achieved: false,
            evidence: 'Found 4 new codes in last interview',
            newCodesLastN: 4,
          },
        },
      } as any;

      const unsaturatedThought = handler.createThought(unsaturatedInput, sessionId);
      const unsaturatedEnhancements = handler.getEnhancements(unsaturatedThought);

      expect(unsaturatedEnhancements.suggestions!.some((s) => s.includes('New codes still emerging'))).toBe(true);

      // Saturated
      const saturatedInput = {
        ...unsaturatedInput,
        thought: 'Assessing theoretical saturation - no new codes',
        rigorAssessment: {
          credibility: { rating: 0.8, strategies: ['Member checking', 'Peer debriefing'] },
          transferability: { rating: 0.75, thickDescription: true, contextProvided: true },
          dependability: { rating: 0.8, auditTrail: true, codebookStability: 0.85 },
          confirmability: { rating: 0.75, reflexivity: true, peerDebriefing: true },
          saturation: {
            achieved: true,
            evidence: 'No new codes in last 3 interviews',
            newCodesLastN: 0,
          },
        },
      };

      const saturatedThought = handler.createThought(saturatedInput, sessionId);
      const saturatedEnhancements = handler.getEnhancements(saturatedThought);

      expect(saturatedEnhancements.suggestions!.some((s) => s.includes('saturation achieved'))).toBe(true);
    });

    it('should handle phenomenological analysis', () => {
      const sessionId = 'phenom-session';

      const input = {
        thought: 'Bracketing assumptions and describing lived experience',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'analysis',
        thoughtType: 'data_familiarization',
        methodology: 'phenomenological',
        dataSources: ['Participant narratives (n=8)'],
        memos: [
          { type: 'reflective_memo', content: 'Bracketing my preconceptions about...' },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.methodology).toBe('phenomenological');
      expect(validation.valid).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('phenomenological'))).toBe(true);
    });

    it('should handle content analysis with codebook hierarchy', () => {
      const sessionId = 'content-session';

      const input = {
        thought: 'Applying structured coding scheme to documents',
        thoughtNumber: 3,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'analysis',
        thoughtType: 'focused_coding',
        methodology: 'content_analysis',
        dataSources: ['Policy documents', 'Meeting minutes', 'Reports'],
        codebook: {
          name: 'Content Analysis Codebook',
          codes: [
            { id: 'cat1', label: 'Category 1', definition: 'Main category 1', examples: ['ex1'] },
            { id: 'cat1a', label: 'Subcategory 1a', definition: 'Sub of cat1', examples: ['ex2'] },
            { id: 'cat1b', label: 'Subcategory 1b', definition: 'Sub of cat1', examples: ['ex3'] },
            { id: 'cat2', label: 'Category 2', definition: 'Main category 2', examples: ['ex4'] },
          ],
          codeHierarchy: {
            rootCodeIds: ['cat1', 'cat2'],
            parentChildMap: {
              cat1: ['cat1a', 'cat1b'],
            },
          },
          intercoderReliability: 0.91,
        },
        dataSegments: [
          { id: 'doc1-p1', text: 'Policy text...', codes: ['cat1', 'cat1a'] },
          { id: 'doc1-p2', text: 'More policy...', codes: ['cat2'] },
          { id: 'doc2-p1', text: 'Minutes text...', codes: ['cat1b'] },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.methodology).toBe('content_analysis');
      expect(thought.codebook!.codeHierarchy).toBeDefined();
      expect(validation.valid).toBe(true);
      expect(enhancements.metrics!.codeCount).toBe(4);
      expect(enhancements.metrics!.intercoderReliability).toBe(0.91);
    });
  });
});
