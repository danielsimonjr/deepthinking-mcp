/**
 * AnalysisHandler - Phase 15 (v8.4.0)
 *
 * Specialized handler for Qualitative Analysis reasoning:
 * - Codebook validation and inter-rater reliability
 * - Theme saturation assessment
 * - Methodology rigor checking
 * - Data coverage analysis
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, AnalysisThought } from '../../types/core.js';
import type {
  AnalysisThoughtType,
  AnalysisMethodology,
  Codebook,
  QualitativeTheme,
  QualitativeRigor,
} from '../../types/modes/analysis.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * Methodology-specific guidance
 */
const METHODOLOGY_GUIDANCE: Record<AnalysisMethodology, { description: string; keySteps: string[] }> = {
  thematic_analysis: {
    description: 'Braun & Clarke\'s reflexive thematic analysis',
    keySteps: ['Data familiarization', 'Initial coding', 'Theme development', 'Theme refinement', 'Final analysis'],
  },
  grounded_theory: {
    description: 'Glaser & Strauss, Charmaz grounded theory approach',
    keySteps: ['Open coding', 'Axial coding', 'Selective coding', 'Theoretical sampling', 'Saturation'],
  },
  discourse_analysis: {
    description: 'Foucauldian or Critical discourse analysis',
    keySteps: ['Text selection', 'Identify patterns', 'Analyze power relations', 'Interpret social functions'],
  },
  content_analysis: {
    description: 'Qualitative content analysis',
    keySteps: ['Define categories', 'Create coding scheme', 'Code systematically', 'Analyze patterns'],
  },
  phenomenological: {
    description: 'IPA or Descriptive phenomenological analysis',
    keySteps: ['Bracket assumptions', 'Describe experience', 'Identify essences', 'Synthesize meanings'],
  },
  narrative_analysis: {
    description: 'Narrative inquiry approach',
    keySteps: ['Collect stories', 'Analyze structure', 'Identify themes', 'Interpret meanings'],
  },
  framework_analysis: {
    description: 'Ritchie & Spencer framework analysis',
    keySteps: ['Familiarization', 'Framework identification', 'Indexing', 'Charting', 'Interpretation'],
  },
  template_analysis: {
    description: 'King\'s template analysis',
    keySteps: ['Initial template', 'Apply to data', 'Modify template', 'Final template'],
  },
  mixed_qualitative: {
    description: 'Combined qualitative approaches',
    keySteps: ['Justify combination', 'Apply methods', 'Integrate findings', 'Ensure coherence'],
  },
};

/**
 * AnalysisHandler - Specialized handler for qualitative analysis
 *
 * Provides semantic validation and enhancement:
 * - Validates codebook structure and consistency
 * - Assesses theoretical saturation
 * - Checks qualitative rigor criteria
 * - Suggests methodology improvements
 */
export class AnalysisHandler implements ModeHandler {
  readonly mode = ThinkingMode.ANALYSIS;
  readonly modeName = 'Qualitative Analysis';
  readonly description = 'Rigorous qualitative analysis with codebook validation and saturation assessment';

  private readonly supportedThoughtTypes: AnalysisThoughtType[] = [
    'data_familiarization',
    'initial_coding',
    'focused_coding',
    'theme_development',
    'theme_refinement',
    'theoretical_integration',
    'memo_writing',
    'saturation_assessment',
  ];

  /**
   * Create an analysis thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): AnalysisThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process codebook
    const codebook = this.processCodebook(inputAny.codebook);

    // Calculate coding progress
    const codingProgress = this.calculateCodingProgress(inputAny.dataSegments, codebook);

    // Assess rigor
    const rigorAssessment = inputAny.rigorAssessment || this.assessRigor(inputAny);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      mode: ThinkingMode.ANALYSIS,
      thoughtType,
      methodology: inputAny.methodology || 'thematic_analysis',
      dataSources: inputAny.dataSources || [],
      dataSegments: inputAny.dataSegments,
      totalSegments: inputAny.dataSegments?.length || inputAny.totalSegments || 0,
      codebook,
      currentCodes: inputAny.currentCodes || codebook?.codes,
      codingProgress,
      themes: inputAny.themes,
      thematicMap: inputAny.thematicMap,
      memos: inputAny.memos || [],
      gtCategories: inputAny.gtCategories,
      theoreticalSampling: inputAny.theoreticalSampling,
      discoursePatterns: inputAny.discoursePatterns,
      rigorAssessment,
      dependencies: inputAny.dependencies || [],
      assumptions: input.assumptions || [],
      uncertainty: inputAny.uncertainty ?? 0.5,
      keyInsight: inputAny.keyInsight,
    } as AnalysisThought;
  }

  /**
   * Validate analysis-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Check data sources
    if (!inputAny.dataSources || inputAny.dataSources.length === 0) {
      warnings.push(
        createValidationWarning(
          'dataSources',
          'No data sources specified',
          'Define the data sources for your qualitative analysis'
        )
      );
    }

    // Check methodology
    if (inputAny.methodology && !Object.keys(METHODOLOGY_GUIDANCE).includes(inputAny.methodology)) {
      warnings.push(
        createValidationWarning(
          'methodology',
          `Unknown methodology: ${inputAny.methodology}`,
          'Use a recognized qualitative methodology'
        )
      );
    }

    // Validate codebook
    if (inputAny.codebook) {
      const codebookValidation = this.validateCodebook(inputAny.codebook);
      errors.push(...codebookValidation.errors);
      warnings.push(...codebookValidation.warnings);
    }

    // Check for inter-rater reliability
    if (inputAny.codebook && inputAny.codebook.codes?.length > 5) {
      if (inputAny.codebook.intercoderReliability === undefined) {
        warnings.push(
          createValidationWarning(
            'codebook.intercoderReliability',
            'No inter-coder reliability reported',
            'For rigor, consider having multiple coders and reporting agreement'
          )
        );
      } else if (inputAny.codebook.intercoderReliability < 0.7) {
        warnings.push(
          createValidationWarning(
            'codebook.intercoderReliability',
            `Inter-coder reliability is low (${(inputAny.codebook.intercoderReliability * 100).toFixed(1)}%)`,
            'Consider reconciling coding differences or refining code definitions'
          )
        );
      }
    }

    // Check themes for saturation
    if (inputAny.themes && inputAny.themes.length > 0) {
      const saturatedThemes = inputAny.themes.filter((t: QualitativeTheme) => t.prevalence > 0.7);
      const sparseThemes = inputAny.themes.filter((t: QualitativeTheme) => t.prevalence < 0.2);

      if (sparseThemes.length > saturatedThemes.length) {
        warnings.push(
          createValidationWarning(
            'themes',
            'Many themes have low prevalence',
            'Consider whether sparse themes represent meaningful patterns or should be merged'
          )
        );
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }
    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: AnalysisThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.SYNTHESIS, ThinkingMode.CRITIQUE, ThinkingMode.INDUCTIVE],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        'Qualitative Rigor (Guba & Lincoln)',
        'Theoretical Saturation',
        'Constant Comparative Method',
        'Thick Description',
        'Reflexivity',
      ],
    };

    const codebook = thought.codebook;
    const themes = thought.themes || [];
    const methodology = thought.methodology;

    // Calculate metrics
    const codeCount = codebook?.codes?.length || 0;
    const themeCount = themes.length;
    const dataSourceCount = thought.dataSources?.length || 0;
    const segmentsCoded = thought.codingProgress?.segmentsCoded || 0;
    const totalSegments = thought.codingProgress?.totalSegments || 0;

    enhancements.metrics = {
      codeCount,
      themeCount,
      dataSourceCount,
      segmentsCoded,
      codingProgress: totalSegments > 0 ? segmentsCoded / totalSegments : 0,
      intercoderReliability: codebook?.intercoderReliability || 0,
      avgThemePrevalence: themes.length > 0 ? themes.reduce((sum, t) => sum + t.prevalence, 0) / themes.length : 0,
    };

    // Methodology-specific guidance
    if (methodology && METHODOLOGY_GUIDANCE[methodology]) {
      const guide = METHODOLOGY_GUIDANCE[methodology];
      enhancements.suggestions!.push(`Using ${guide.description}`);
      enhancements.guidingQuestions!.push(`Have you completed: ${guide.keySteps.join(' → ')}?`);
    }

    // Stage-specific suggestions
    const thoughtType = thought.thoughtType;
    if (thoughtType === 'initial_coding' && codeCount < 10) {
      enhancements.suggestions!.push('Continue generating initial codes - aim for breadth');
    }

    if (thoughtType === 'focused_coding' && codeCount > 50) {
      enhancements.suggestions!.push('Consider consolidating codes into higher-level categories');
    }

    if (thoughtType === 'theme_development' && themeCount === 0) {
      enhancements.suggestions!.push('Group related codes into candidate themes');
    }

    if (thoughtType === 'saturation_assessment') {
      const rigor = thought.rigorAssessment;
      if (rigor?.saturation?.newCodesLastN !== undefined && rigor.saturation.newCodesLastN > 3) {
        enhancements.suggestions!.push('New codes still emerging - saturation not yet achieved');
      } else if (rigor?.saturation?.achieved) {
        enhancements.suggestions!.push('Theoretical saturation achieved - ready for final analysis');
      }
    }

    // Rigor assessment warnings
    if (thought.rigorAssessment) {
      const rigor = thought.rigorAssessment;
      if (rigor.credibility.rating < 0.5) {
        enhancements.warnings = enhancements.warnings || [];
        enhancements.warnings.push('Low credibility rating - consider member checking or triangulation');
      }
      if (!rigor.confirmability.reflexivity) {
        enhancements.suggestions!.push('Document researcher reflexivity for confirmability');
      }
    }

    // Guiding questions
    enhancements.guidingQuestions!.push(
      'Are the codes consistently applied across all data?',
      'Do the themes capture the full meaning of the data?',
      'What alternative interpretations have been considered?',
      'How does researcher positionality affect the analysis?'
    );

    return enhancements;
  }

  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as AnalysisThoughtType);
  }

  /**
   * Resolve thought type to valid AnalysisThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): AnalysisThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as AnalysisThoughtType)) {
      return inputType as AnalysisThoughtType;
    }
    return 'initial_coding';
  }

  /**
   * Process and validate codebook
   */
  private processCodebook(codebook: Codebook | undefined): Codebook | undefined {
    if (!codebook) return undefined;

    return {
      id: codebook.id || randomUUID(),
      name: codebook.name || 'Analysis Codebook',
      version: codebook.version || 1,
      codes: (codebook.codes || []).map((code) => ({
        id: code.id || randomUUID(),
        label: code.label || '',
        definition: code.definition || '',
        type: code.type || 'descriptive',
        examples: code.examples || [],
        dataSegmentIds: code.dataSegmentIds || [],
        frequency: code.frequency || 0,
        parentCodeId: code.parentCodeId,
        childCodeIds: code.childCodeIds || [],
        relatedCodeIds: code.relatedCodeIds || [],
        createdAt: code.createdAt || new Date(),
        modifiedAt: code.modifiedAt,
        memoIds: code.memoIds || [],
      })),
      codeHierarchy: codebook.codeHierarchy || {
        rootCodeIds: [],
        parentChildMap: {},
      },
      cooccurrences: codebook.cooccurrences || [],
      intercoderReliability: codebook.intercoderReliability,
      lastUpdated: codebook.lastUpdated || new Date(),
    };
  }

  /**
   * Calculate coding progress
   */
  private calculateCodingProgress(
    dataSegments: any[] | undefined,
    _codebook: Codebook | undefined
  ): { segmentsCoded: number; totalSegments: number; percentComplete: number } {
    if (!dataSegments) return { segmentsCoded: 0, totalSegments: 0, percentComplete: 0 };

    const totalSegments = dataSegments.length;
    const segmentsCoded = dataSegments.filter((seg) => seg.codes && seg.codes.length > 0).length;
    const percentComplete = totalSegments > 0 ? (segmentsCoded / totalSegments) * 100 : 0;

    return { segmentsCoded, totalSegments, percentComplete };
  }

  /**
   * Assess qualitative rigor
   */
  private assessRigor(input: any): QualitativeRigor {
    const hasMultipleCoders = input.codebook?.intercoderReliability !== undefined;
    const hasThickDescription = input.themes?.some((t: QualitativeTheme) => t.keyQuotes?.length > 2);
    const hasMemos = input.memos && input.memos.length > 0;
    const hasReflexiveMemos = input.memos?.some((m: any) => m.type === 'reflective_memo');

    return {
      credibility: {
        rating: hasMultipleCoders ? 0.7 : 0.5,
        strategies: hasMultipleCoders ? ['Multiple coders'] : [],
      },
      transferability: {
        rating: hasThickDescription ? 0.7 : 0.4,
        thickDescription: hasThickDescription || false,
        contextProvided: true,
      },
      dependability: {
        rating: hasMemos ? 0.6 : 0.4,
        auditTrail: hasMemos || false,
        codebookStability: input.codebook?.version > 1 ? 0.7 : 0.5,
      },
      confirmability: {
        rating: hasReflexiveMemos ? 0.7 : 0.4,
        reflexivity: hasReflexiveMemos || false,
        peerDebriefing: false,
      },
      saturation: {
        achieved: false,
        evidence: '',
        newCodesLastN: 0,
      },
    };
  }

  /**
   * Validate codebook structure
   */
  private validateCodebook(codebook: Codebook): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for codes without definitions
    const codesWithoutDefinitions = (codebook.codes || []).filter(
      (code) => !code.definition || code.definition.trim().length === 0
    );

    if (codesWithoutDefinitions.length > 0) {
      warnings.push(
        createValidationWarning(
          'codebook.codes',
          `${codesWithoutDefinitions.length} codes lack definitions`,
          'All codes should have clear definitions for consistency'
        )
      );
    }

    // Check for orphan codes (no examples)
    const codesWithoutExamples = (codebook.codes || []).filter(
      (code) => !code.examples || code.examples.length === 0
    );

    if (codesWithoutExamples.length > codebook.codes.length * 0.5) {
      warnings.push(
        createValidationWarning(
          'codebook.codes',
          'Many codes lack example quotes',
          'Add exemplar quotes to improve codebook reliability'
        )
      );
    }

    // Check hierarchy consistency
    if (codebook.codeHierarchy) {
      const allCodeIds = new Set((codebook.codes || []).map((c) => c.id));
      for (const [parentId, childIds] of Object.entries(codebook.codeHierarchy.parentChildMap || {})) {
        if (!allCodeIds.has(parentId)) {
          warnings.push(
            createValidationWarning(
              'codebook.codeHierarchy',
              `Parent code ${parentId} not found in codes`,
              'Ensure hierarchy references valid codes'
            )
          );
        }
        for (const childId of childIds) {
          if (!allCodeIds.has(childId)) {
            warnings.push(
              createValidationWarning(
                'codebook.codeHierarchy',
                `Child code ${childId} not found in codes`,
                'Ensure hierarchy references valid codes'
              )
            );
          }
        }
      }
    }

    return errors.length > 0 ? validationFailure(errors, warnings) : validationSuccess(warnings);
  }
}
