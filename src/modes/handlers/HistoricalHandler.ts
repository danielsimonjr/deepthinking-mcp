/**
 * HistoricalHandler - v9.1.0
 *
 * Specialized handler for Historical reasoning:
 * - Historical event analysis and context
 * - Source evaluation and reliability assessment
 * - Pattern identification across time periods
 * - Causal chain analysis
 * - Periodization and historiographical analysis
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import type { HistoricalThought, HistoricalThoughtType, HistoricalEvent, HistoricalSource, HistoricalPattern } from '../../types/modes/historical.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * HistoricalHandler - Specialized handler for historical reasoning
 *
 * Provides semantic validation and enhancement:
 * - Validates source reliability and cross-references
 * - Detects causal chain discontinuities
 * - Calculates aggregate source reliability
 * - Suggests missing evidence and patterns
 * - Identifies historiographical approaches
 */
export class HistoricalHandler implements ModeHandler {
  readonly mode = ThinkingMode.HISTORICAL;
  readonly modeName = 'Historical Reasoning';
  readonly description = 'Historical analysis with source evaluation, pattern recognition, and causal chain analysis';

  private readonly supportedThoughtTypes: HistoricalThoughtType[] = [
    'event_analysis',
    'source_evaluation',
    'pattern_identification',
    'causal_chain',
    'periodization',
  ];

  /**
   * Create a historical thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): HistoricalThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Build base thought
    const thought: HistoricalThought = {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      mode: ThinkingMode.HISTORICAL,
      thoughtType,
      events: inputAny.historicalEvents || inputAny.events || [],
      sources: inputAny.historicalSources || inputAny.sources || [],
      periods: inputAny.periods || [],
      causalChains: inputAny.causalChains || [],
      actors: inputAny.actors || [],
      patterns: inputAny.patterns || [],
      interpretations: inputAny.interpretations || [],
      historiographicalSchool: inputAny.historiographicalSchool,
      methodology: inputAny.methodology,
    };

    // Calculate aggregate reliability from sources
    if (thought.sources && thought.sources.length > 0) {
      thought.aggregateReliability = this.calculateAggregateReliability(thought.sources);
    }

    // Calculate temporal span from events
    if (thought.events && thought.events.length > 0) {
      thought.temporalSpan = this.calculateTemporalSpan(thought.events);
    }

    // Auto-detect patterns if not provided
    if (thought.events && thought.events.length >= 3 && (!thought.patterns || thought.patterns.length === 0)) {
      thought.patterns = this.detectPatterns(thought.events);
    }

    return thought;
  }

  /**
   * Validate historical-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Collect IDs for reference validation
    const events = inputAny.historicalEvents || inputAny.events || [];
    const sources = inputAny.historicalSources || inputAny.sources || [];
    const eventIds = new Set(events.map((e: any) => e.id));
    const sourceIds = new Set(sources.map((s: any) => s.id));
    const actorIds = new Set((inputAny.actors || []).map((a: any) => a.id));

    // Validate event references
    if (events.length > 0) {
      for (const event of events) {
        // Check cause references
        if (event.causes) {
          for (const causeId of event.causes) {
            if (!eventIds.has(causeId)) {
              errors.push(
                createValidationError(
                  'events',
                  `Event ${event.id} references unknown cause: ${causeId}`,
                  'INVALID_CAUSE_REF'
                )
              );
            }
          }
        }

        // Check source references
        if (event.sources) {
          for (const srcId of event.sources) {
            if (!sourceIds.has(srcId)) {
              warnings.push(
                createValidationWarning(
                  'events',
                  `Event ${event.id} references unknown source: ${srcId}`,
                  'Add the source or remove the reference'
                )
              );
            }
          }
        }

        // Check actor references
        if (event.actors) {
          for (const actorId of event.actors) {
            if (!actorIds.has(actorId)) {
              warnings.push(
                createValidationWarning(
                  'events',
                  `Event ${event.id} references unknown actor: ${actorId}`,
                  'Add the actor or remove the reference'
                )
              );
            }
          }
        }
      }
    }

    // Validate causal chain continuity
    if (inputAny.causalChains) {
      for (const chain of inputAny.causalChains) {
        if (chain.links && chain.links.length > 1) {
          for (let i = 0; i < chain.links.length - 1; i++) {
            if (chain.links[i].effect !== chain.links[i + 1].cause) {
              warnings.push(
                createValidationWarning(
                  'causalChains',
                  `Chain ${chain.id} has discontinuity between links ${i} and ${i + 1}`,
                  'Ensure each link effect is the cause of the next link'
                )
              );
            }
          }
        }

        // Validate chain event references
        if (chain.links) {
          for (const link of chain.links) {
            if (!eventIds.has(link.cause)) {
              errors.push(
                createValidationError(
                  'causalChains',
                  `Chain ${chain.id} references unknown cause event: ${link.cause}`,
                  'INVALID_CHAIN_CAUSE'
                )
              );
            }
            if (!eventIds.has(link.effect)) {
              errors.push(
                createValidationError(
                  'causalChains',
                  `Chain ${chain.id} references unknown effect event: ${link.effect}`,
                  'INVALID_CHAIN_EFFECT'
                )
              );
            }
          }
        }
      }
    }

    // Warn if no sources for events
    if (events.length > 0 && sources.length === 0) {
      warnings.push(
        createValidationWarning(
          'sources',
          'No sources defined for historical analysis',
          'Add primary or secondary sources to support your analysis'
        )
      );
    }

    // Warn about low reliability sources
    if (sources.length > 0) {
      const lowReliabilitySources = sources.filter((s: any) => s.reliability < 0.5);
      if (lowReliabilitySources.length > 0) {
        warnings.push(
          createValidationWarning(
            'sources',
            `${lowReliabilitySources.length} source(s) have low reliability (<0.5)`,
            'Consider corroborating with additional sources'
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
  getEnhancements(thought: HistoricalThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.TEMPORAL, ThinkingMode.CAUSAL, ThinkingMode.SYNTHESIS],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        'Source Criticism',
        'Historiographical Schools',
        'Causal Analysis',
        'Periodization',
        'Counterfactual History',
        'Longue Durée',
        'Microhistory',
      ],
    };

    const events = thought.events || [];
    const sources = thought.sources || [];
    const periods = thought.periods || [];
    const causalChains = thought.causalChains || [];
    const actors = thought.actors || [];

    // Calculate metrics
    enhancements.metrics = {
      eventCount: events.length,
      sourceCount: sources.length,
      periodCount: periods.length,
      causalChainCount: causalChains.length,
      actorCount: actors.length,
      primarySourceRatio: sources.length > 0
        ? sources.filter(s => s.type === 'primary').length / sources.length
        : 0,
      averageSourceReliability: thought.aggregateReliability || 0,
      transformativeEventCount: events.filter(e => e.significance === 'transformative').length,
    };

    // Generate suggestions
    if (sources.length === 0) {
      enhancements.suggestions!.push('Add historical sources to support your analysis');
    }

    if (sources.length > 0 && sources.filter(s => s.type === 'primary').length === 0) {
      enhancements.suggestions!.push('Consider adding primary sources for more direct evidence');
    }

    if (events.length > 3 && causalChains.length === 0) {
      enhancements.suggestions!.push('Consider tracing causal chains between major events');
    }

    if (events.length > 5 && periods.length === 0) {
      enhancements.suggestions!.push('Consider organizing events into historical periods');
    }

    if (actors.length === 0 && events.length > 0) {
      enhancements.suggestions!.push('Identify key historical actors involved in these events');
    }

    // Source corroboration check
    const uncorroboratedSources = sources.filter(
      s => (!s.corroboratedBy || s.corroboratedBy.length === 0) && s.type === 'primary'
    );
    if (uncorroboratedSources.length > 0) {
      enhancements.suggestions!.push(`${uncorroboratedSources.length} primary source(s) lack corroboration`);
    }

    // Guiding questions based on thought type
    enhancements.guidingQuestions = this.getGuidingQuestions(thought.thoughtType);

    return enhancements;
  }

  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as HistoricalThoughtType);
  }

  /**
   * Resolve thought type to valid HistoricalThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): HistoricalThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as HistoricalThoughtType)) {
      return inputType as HistoricalThoughtType;
    }
    return 'event_analysis';
  }

  /**
   * Calculate aggregate reliability from sources
   */
  private calculateAggregateReliability(sources: HistoricalSource[]): number {
    if (sources.length === 0) return 0;

    // Weight primary sources higher
    let totalWeight = 0;
    let weightedSum = 0;

    for (const source of sources) {
      const weight = source.type === 'primary' ? 2 : source.type === 'secondary' ? 1.5 : 1;
      weightedSum += source.reliability * weight;
      totalWeight += weight;
    }

    // Bonus for corroboration
    const corroboratedCount = sources.filter(
      s => s.corroboratedBy && s.corroboratedBy.length > 0
    ).length;
    const corroborationBonus = Math.min(0.1, (corroboratedCount / sources.length) * 0.1);

    return Math.min(1, (weightedSum / totalWeight) + corroborationBonus);
  }

  /**
   * Calculate temporal span from events
   */
  private calculateTemporalSpan(events: HistoricalEvent[]): { start: string; end: string } | undefined {
    if (events.length === 0) return undefined;

    const dates: string[] = [];
    for (const event of events) {
      if (typeof event.date === 'string') {
        dates.push(event.date);
      } else if (event.date) {
        dates.push(event.date.start);
        dates.push(event.date.end);
      }
    }

    if (dates.length === 0) return undefined;

    dates.sort();
    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  }

  /**
   * Auto-detect patterns from events
   */
  private detectPatterns(events: HistoricalEvent[]): HistoricalPattern[] {
    const patterns: HistoricalPattern[] = [];

    // Detect recurring significance patterns
    const significanceCounts: Record<string, string[]> = {
      minor: [],
      moderate: [],
      major: [],
      transformative: [],
    };

    for (const event of events) {
      significanceCounts[event.significance].push(event.id);
    }

    // If most events are transformative, note revolutionary period
    if (significanceCounts.transformative.length >= events.length * 0.4) {
      patterns.push({
        id: randomUUID(),
        name: 'Revolutionary Period',
        type: 'structural',
        instances: significanceCounts.transformative,
        description: 'High concentration of transformative events indicates a period of significant change',
        confidence: 0.7,
      });
    }

    // Detect causal clusters (events with many causes/effects)
    const highlyConnected = events.filter(
      e => ((e.causes?.length || 0) + (e.effects?.length || 0)) > 3
    );
    if (highlyConnected.length >= 2) {
      patterns.push({
        id: randomUUID(),
        name: 'Causal Nexus',
        type: 'contingent',
        instances: highlyConnected.map(e => e.id),
        description: 'Events with multiple causal connections form a nexus of historical change',
        confidence: 0.6,
      });
    }

    return patterns;
  }

  /**
   * Get guiding questions based on thought type
   */
  private getGuidingQuestions(thoughtType?: HistoricalThoughtType): string[] {
    switch (thoughtType) {
      case 'event_analysis':
        return [
          'What were the immediate causes of this event?',
          'What were the long-term consequences?',
          'Who were the key actors involved?',
          'How does this event fit into broader historical trends?',
          'What sources document this event?',
        ];
      case 'source_evaluation':
        return [
          'Is this a primary or secondary source?',
          'What biases might the author have?',
          'Can this source be corroborated by others?',
          'What is the provenance of this source?',
          'What limitations does this source have?',
        ];
      case 'pattern_identification':
        return [
          'What recurring patterns emerge across events?',
          'Are these patterns cyclical, linear, or dialectical?',
          'What exceptions exist to the identified patterns?',
          'How do structural factors influence these patterns?',
          'What contingent factors disrupted expected patterns?',
        ];
      case 'causal_chain':
        return [
          'What evidence supports this causal link?',
          'Are there alternative explanations?',
          'What mechanisms connect cause to effect?',
          'What counterfactuals help test this causal claim?',
          'How confident are we in this causal chain?',
        ];
      case 'periodization':
        return [
          'What characteristics define this period?',
          'What events mark the beginning and end?',
          'How does this periodization compare to others?',
          'What continuities span period boundaries?',
          'Is this periodization Eurocentric or universal?',
        ];
      default:
        return [
          'What sources support this historical claim?',
          'What alternative interpretations exist?',
          'How does context shape our understanding?',
          'What biases might affect this analysis?',
          'What further evidence is needed?',
        ];
    }
  }
}
