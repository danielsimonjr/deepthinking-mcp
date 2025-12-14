/**
 * SynthesisHandler - Phase 10 Sprint 2B (v8.2.0)
 *
 * Specialized handler for Synthesis reasoning mode with:
 * - Source coverage tracking
 * - Theme extraction validation
 * - Contradiction detection between sources
 * - Research gap identification
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, SynthesisThought } from '../../types/core.js';
import type {
  Source,
  Theme,
  Contradiction,
  LiteratureGap,
  SynthesisThoughtType,
} from '../../types/modes/synthesis.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * SynthesisHandler - Specialized handler for literature synthesis
 *
 * Provides semantic validation beyond schema validation:
 * - Validates source coverage (themes should reference existing sources)
 * - Detects potential contradictions between sources
 * - Identifies gaps in literature coverage
 * - Validates quality metrics are within valid ranges
 */
export class SynthesisHandler implements ModeHandler {
  readonly mode = ThinkingMode.SYNTHESIS;
  readonly modeName = 'Literature Synthesis';
  readonly description = 'Multi-source synthesis with theme extraction, contradiction detection, and gap analysis';

  /**
   * Supported thought types for synthesis mode
   */
  private readonly supportedThoughtTypes: SynthesisThoughtType[] = [
    'source_identification',
    'source_evaluation',
    'theme_extraction',
    'pattern_integration',
    'gap_identification',
    'synthesis_construction',
    'framework_development',
  ];

  /**
   * Create a synthesis thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): SynthesisThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Auto-detect contradictions if not provided
    let contradictions = inputAny.contradictions || [];
    if (contradictions.length === 0 && inputAny.sources && inputAny.sources.length > 1) {
      contradictions = this.detectPotentialContradictions(inputAny.sources, inputAny.themes);
    }

    // Calculate source coverage metrics
    const sourceCoverage = this.calculateSourceCoverage(
      inputAny.sources || [],
      inputAny.themes || []
    );

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
      mode: ThinkingMode.SYNTHESIS,
      thoughtType,
      sources: inputAny.sources || [],
      reviewMetadata: inputAny.reviewMetadata,
      concepts: inputAny.concepts || [],
      themes: inputAny.themes || [],
      findings: inputAny.findings || [],
      patterns: inputAny.patterns || [],
      relations: inputAny.relations || [],
      gaps: inputAny.gaps || [],
      contradictions,
      framework: inputAny.framework,
      conclusions: inputAny.conclusions || [],
      dependencies: inputAny.dependencies || [],
      assumptions: inputAny.assumptions || [],
      uncertainty: inputAny.uncertainty ?? 0.5,
      keyInsight: inputAny.keyInsight,
      // Store calculated metrics in a way accessible to enhancements
      _sourceCoverage: sourceCoverage,
    } as SynthesisThought & { _sourceCoverage?: any };
  }

  /**
   * Validate synthesis-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate sources
    if (inputAny.sources && Array.isArray(inputAny.sources)) {
      const sourceIds = new Set<string>();
      for (let i = 0; i < inputAny.sources.length; i++) {
        const source = inputAny.sources[i];
        const sourceValidation = this.validateSource(source, i, sourceIds);
        errors.push(...sourceValidation.errors);
        warnings.push(...sourceValidation.warnings);
        if (source.id) sourceIds.add(source.id);
      }

      // Check for duplicate source IDs
      if (sourceIds.size !== inputAny.sources.filter((s: Source) => s.id).length) {
        errors.push(
          createValidationError(
            'sources',
            'Duplicate source IDs detected',
            'DUPLICATE_SOURCE_IDS'
          )
        );
      }

      // Validate themes reference existing sources
      if (inputAny.themes && Array.isArray(inputAny.themes)) {
        for (let i = 0; i < inputAny.themes.length; i++) {
          const theme = inputAny.themes[i];
          const themeValidation = this.validateTheme(theme, i, sourceIds);
          errors.push(...themeValidation.errors);
          warnings.push(...themeValidation.warnings);
        }
      }

      // Validate contradictions reference existing sources
      if (inputAny.contradictions && Array.isArray(inputAny.contradictions)) {
        for (let i = 0; i < inputAny.contradictions.length; i++) {
          const contradiction = inputAny.contradictions[i];
          const contValidation = this.validateContradiction(contradiction, i, sourceIds);
          errors.push(...contValidation.errors);
          warnings.push(...contValidation.warnings);
        }
      }

      // Warn if only one source
      if (inputAny.sources.length === 1) {
        warnings.push(
          createValidationWarning(
            'sources',
            'Only one source provided',
            'Synthesis typically requires multiple sources for meaningful integration'
          )
        );
      }
    }

    // Validate gaps reference themes
    if (inputAny.gaps && Array.isArray(inputAny.gaps) && inputAny.themes) {
      const themeIds = new Set((inputAny.themes as Theme[]).map(t => t.id).filter(Boolean));
      for (let i = 0; i < inputAny.gaps.length; i++) {
        const gap = inputAny.gaps[i] as LiteratureGap;
        if (gap.relatedThemes) {
          for (const themeId of gap.relatedThemes) {
            if (!themeIds.has(themeId)) {
              warnings.push(
                createValidationWarning(
                  `gaps[${i}].relatedThemes`,
                  `Gap references non-existent theme: ${themeId}`,
                  'Ensure all gap theme references exist in themes array'
                )
              );
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get synthesis-specific enhancements
   */
  getEnhancements(thought: SynthesisThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.CRITIQUE, ThinkingMode.ARGUMENTATION, ThinkingMode.ANALYSIS],
      guidingQuestions: [],
      warnings: [],
      mentalModels: [
        'Thematic Analysis',
        'Systematic Review',
        'Conceptual Framework',
        'Evidence Synthesis',
      ],
    };

    // Calculate metrics
    const sourceCount = thought.sources?.length || 0;
    const themeCount = thought.themes?.length || 0;
    const contradictionCount = thought.contradictions?.length || 0;
    const gapCount = thought.gaps?.length || 0;

    // Calculate coverage
    const coverage = this.calculateSourceCoverage(
      thought.sources || [],
      thought.themes || []
    );

    enhancements.metrics = {
      sourceCount,
      themeCount,
      contradictionCount,
      gapCount,
      sourceCoverage: coverage.coverageRatio,
      uncoveredSources: coverage.uncoveredSources.length,
    };

    // Suggestions based on content
    if (sourceCount === 0) {
      enhancements.suggestions!.push(
        'Add sources to synthesize. Include bibliographic details and quality assessments.'
      );
    } else if (sourceCount < 5) {
      enhancements.suggestions!.push(
        'Consider adding more sources for comprehensive synthesis (typically 10+ for reviews)'
      );
    }

    if (sourceCount >= 2 && themeCount === 0) {
      enhancements.suggestions!.push(
        'Extract common themes across your sources to begin synthesis'
      );
    }

    if (coverage.uncoveredSources.length > 0) {
      enhancements.warnings!.push(
        `${coverage.uncoveredSources.length} source(s) not referenced in any theme: consider their contribution`
      );
    }

    if (sourceCount >= 3 && contradictionCount === 0) {
      enhancements.guidingQuestions!.push(
        'Are there any disagreements or contradictions between sources?'
      );
    }

    if (themeCount >= 2 && gapCount === 0) {
      enhancements.guidingQuestions!.push(
        'What gaps exist in the current literature? What questions remain unanswered?'
      );
    }

    // Check theme consensus
    const weakConsensus = (thought.themes || []).filter(
      t => t.consensus === 'weak' || t.consensus === 'contested'
    );
    if (weakConsensus.length > 0) {
      enhancements.warnings!.push(
        `${weakConsensus.length} theme(s) have weak/contested consensus. Consider exploring why.`
      );
    }

    // Framework development suggestion
    if (themeCount >= 3 && !thought.framework) {
      enhancements.suggestions!.push(
        'Consider developing a conceptual framework to organize themes and relationships'
      );
    }

    // Conclusions suggestion
    if (themeCount >= 2 && (!thought.conclusions || thought.conclusions.length === 0)) {
      enhancements.guidingQuestions!.push(
        'What synthesized conclusions can you draw from the themes identified?'
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as SynthesisThoughtType);
  }

  /**
   * Resolve thought type to valid SynthesisThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): SynthesisThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as SynthesisThoughtType)) {
      return inputType as SynthesisThoughtType;
    }
    return 'source_identification';
  }

  /**
   * Validate a source
   */
  private validateSource(source: Source, index: number, existingIds: Set<string>): ValidationResult {
    const errors = [];
    const warnings = [];

    if (!source.id || source.id.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `sources[${index}].id`,
          'Source has no ID',
          'Add an ID to reference this source in themes and contradictions'
        )
      );
    } else if (existingIds.has(source.id)) {
      errors.push(
        createValidationError(
          `sources[${index}].id`,
          `Duplicate source ID: ${source.id}`,
          'DUPLICATE_SOURCE_ID'
        )
      );
    }

    if (!source.title || source.title.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `sources[${index}].title`,
          'Source has no title',
          'Add a title to identify the source'
        )
      );
    }

    // Validate quality metrics
    if (source.quality) {
      const qualityFields = [
        'methodologicalRigor',
        'relevance',
        'recency',
        'authorCredibility',
        'overallQuality',
      ];
      for (const field of qualityFields) {
        const value = (source.quality as any)[field];
        if (value !== undefined && (value < 0 || value > 1)) {
          warnings.push(
            createValidationWarning(
              `sources[${index}].quality.${field}`,
              `Quality metric ${field} (${value}) is outside [0, 1] range`,
              'Quality metrics should be normalized to [0, 1]'
            )
          );
        }
      }
    }

    return errors.length > 0 ? validationFailure(errors, warnings) : validationSuccess(warnings);
  }

  /**
   * Validate a theme
   */
  private validateTheme(theme: Theme, index: number, sourceIds: Set<string>): ValidationResult {
    const warnings = [];

    if (!theme.id || theme.id.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `themes[${index}].id`,
          'Theme has no ID',
          'Add an ID to track this theme'
        )
      );
    }

    if (!theme.name || theme.name.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `themes[${index}].name`,
          'Theme has no name',
          'Add a descriptive name for the theme'
        )
      );
    }

    // Validate source references
    if (theme.sourceIds && theme.sourceIds.length > 0) {
      for (const sourceId of theme.sourceIds) {
        if (!sourceIds.has(sourceId)) {
          warnings.push(
            createValidationWarning(
              `themes[${index}].sourceIds`,
              `Theme references non-existent source: ${sourceId}`,
              'Ensure all source references exist in sources array'
            )
          );
        }
      }
    } else {
      warnings.push(
        createValidationWarning(
          `themes[${index}].sourceIds`,
          'Theme has no source references',
          'Link the theme to supporting sources'
        )
      );
    }

    // Validate strength
    if (theme.strength !== undefined && (theme.strength < 0 || theme.strength > 1)) {
      warnings.push(
        createValidationWarning(
          `themes[${index}].strength`,
          `Theme strength (${theme.strength}) is outside [0, 1] range`,
          'Strength should be normalized to [0, 1]'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate a contradiction
   */
  private validateContradiction(
    contradiction: Contradiction,
    index: number,
    sourceIds: Set<string>
  ): ValidationResult {
    const warnings = [];

    // Validate position1 source references
    if (contradiction.position1?.sourceIds) {
      for (const sourceId of contradiction.position1.sourceIds) {
        if (!sourceIds.has(sourceId)) {
          warnings.push(
            createValidationWarning(
              `contradictions[${index}].position1.sourceIds`,
              `Position 1 references non-existent source: ${sourceId}`,
              'Ensure source references exist'
            )
          );
        }
      }
    }

    // Validate position2 source references
    if (contradiction.position2?.sourceIds) {
      for (const sourceId of contradiction.position2.sourceIds) {
        if (!sourceIds.has(sourceId)) {
          warnings.push(
            createValidationWarning(
              `contradictions[${index}].position2.sourceIds`,
              `Position 2 references non-existent source: ${sourceId}`,
              'Ensure source references exist'
            )
          );
        }
      }
    }

    return validationSuccess(warnings);
  }

  /**
   * Calculate source coverage by themes
   */
  private calculateSourceCoverage(
    sources: Source[],
    themes: Theme[]
  ): { coverageRatio: number; uncoveredSources: string[]; coveredSources: string[] } {
    const sourceIds = new Set(sources.map(s => s.id).filter(Boolean));
    const coveredSourceIds = new Set<string>();

    for (const theme of themes) {
      if (theme.sourceIds) {
        for (const sourceId of theme.sourceIds) {
          coveredSourceIds.add(sourceId);
        }
      }
    }

    const coveredSources = Array.from(coveredSourceIds).filter(id => sourceIds.has(id));
    const uncoveredSources = Array.from(sourceIds).filter(id => !coveredSourceIds.has(id));

    return {
      coverageRatio: sourceIds.size > 0 ? coveredSources.length / sourceIds.size : 0,
      uncoveredSources,
      coveredSources,
    };
  }

  /**
   * Detect potential contradictions between sources based on themes
   *
   * Simple heuristic: sources in themes with 'contested' consensus might contradict
   */
  private detectPotentialContradictions(
    _sources: Source[],
    themes?: Theme[]
  ): Contradiction[] {
    const contradictions: Contradiction[] = [];

    if (!themes || themes.length === 0) return contradictions;

    // Find contested themes
    const contestedThemes = themes.filter(t => t.consensus === 'contested');

    for (const theme of contestedThemes) {
      if (theme.sourceIds && theme.sourceIds.length >= 2) {
        // Create a potential contradiction for investigation
        const sourceA = theme.sourceIds[0];
        const sourceB = theme.sourceIds[1];

        contradictions.push({
          id: `auto-${randomUUID().slice(0, 8)}`,
          description: `Potential contradiction in contested theme: ${theme.name}`,
          position1: {
            statement: `View from source ${sourceA}`,
            sourceIds: [sourceA],
            reasoning: 'Auto-detected from contested theme consensus',
          },
          position2: {
            statement: `View from source ${sourceB}`,
            sourceIds: [sourceB],
            reasoning: 'Auto-detected from contested theme consensus',
          },
          possibleResolution: 'Requires further investigation',
        });
      }
    }

    return contradictions;
  }
}
