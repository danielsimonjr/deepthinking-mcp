/**
 * TemporalHandler - Phase 15 (v8.4.0)
 *
 * Specialized handler for Temporal reasoning:
 * - Timeline validation and consistency checking
 * - Allen's interval algebra relations
 * - Event ordering and sequencing
 * - Duration and overlap analysis
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, TemporalThought } from '../../types/core.js';
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

type TemporalThoughtType = 'event_definition' | 'interval_analysis' | 'temporal_constraint' | 'sequence_construction' | 'causality_timeline';

/**
 * TemporalHandler - Specialized handler for temporal reasoning
 *
 * Provides semantic validation and enhancement:
 * - Validates timeline consistency (no contradictory orderings)
 * - Detects temporal constraint violations
 * - Infers implicit temporal relations
 * - Suggests missing constraints
 */
export class TemporalHandler implements ModeHandler {
  readonly mode = ThinkingMode.TEMPORAL;
  readonly modeName = 'Temporal Reasoning';
  readonly description = "Timeline analysis with Allen's interval algebra and event sequencing";

  private readonly supportedThoughtTypes: TemporalThoughtType[] = [
    'event_definition',
    'interval_analysis',
    'temporal_constraint',
    'sequence_construction',
    'causality_timeline',
  ];

  /**
   * Create a temporal thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): TemporalThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

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
      mode: ThinkingMode.TEMPORAL,
      thoughtType,
      timeline: inputAny.timeline,
      events: inputAny.events || [],
      intervals: inputAny.intervals || [],
      constraints: inputAny.constraints || [],
      relations: inputAny.relations || [],
    };
  }

  /**
   * Validate temporal-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Check for event reference integrity
    if (inputAny.relations && inputAny.events) {
      const eventIds = new Set((inputAny.events || []).map((e: any) => e.id));
      for (const rel of inputAny.relations) {
        if (!eventIds.has(rel.from)) {
          errors.push(
            createValidationError(
              'relations',
              `Relation references unknown event: ${rel.from}`,
              'INVALID_EVENT_REF'
            )
          );
        }
        if (!eventIds.has(rel.to)) {
          errors.push(
            createValidationError(
              'relations',
              `Relation references unknown event: ${rel.to}`,
              'INVALID_EVENT_REF'
            )
          );
        }
      }
    }

    // Check for temporal consistency
    const inconsistencies = this.detectInconsistencies(inputAny.relations || []);
    for (const inc of inconsistencies) {
      warnings.push(
        createValidationWarning(
          'relations',
          `Potential temporal inconsistency: ${inc}`,
          'Review temporal constraints for contradictions'
        )
      );
    }

    // Warn if no events
    if (!inputAny.events || inputAny.events.length === 0) {
      warnings.push(
        createValidationWarning(
          'events',
          'No events defined',
          'Add events to construct a timeline'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }
    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: TemporalThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.CAUSAL, ThinkingMode.SEQUENTIAL, ThinkingMode.COUNTERFACTUAL],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        "Allen's Interval Algebra",
        'Timeline Visualization',
        'Temporal Constraint Propagation',
        'Event Calculus',
        'Point vs. Interval Semantics',
      ],
    };

    const events = thought.events || [];
    const relations = thought.relations || [];

    // Calculate metrics
    enhancements.metrics = {
      eventCount: events.length,
      relationCount: relations.length,
      constraintDensity: events.length > 1 ? relations.length / ((events.length * (events.length - 1)) / 2) : 0,
      instantEvents: events.filter((e) => e.type === 'instant').length,
      intervalEvents: events.filter((e) => e.type === 'interval').length,
    };

    // Suggest missing relations
    if (events.length > 1 && relations.length === 0) {
      enhancements.suggestions!.push('Define temporal relations between events');
    }

    // Check for under-constrained timeline
    const expectedRelations = (events.length * (events.length - 1)) / 2;
    if (relations.length < expectedRelations * 0.3 && events.length > 2) {
      enhancements.suggestions!.push('Timeline may be under-constrained - consider adding more relations');
    }

    // Guiding questions
    enhancements.guidingQuestions = [
      'Which events must occur before others?',
      'Are there events that can overlap or must be disjoint?',
      'What are the duration constraints on intervals?',
      'Are there causal dependencies implied by the temporal order?',
      'What happens if the timeline constraints are violated?',
    ];

    return enhancements;
  }

  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as TemporalThoughtType);
  }

  /**
   * Resolve thought type to valid TemporalThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): TemporalThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as TemporalThoughtType)) {
      return inputType as TemporalThoughtType;
    }
    return 'event_definition';
  }

  /**
   * Detect temporal inconsistencies
   */
  private detectInconsistencies(relations: any[]): string[] {
    const inconsistencies: string[] = [];

    // Check for A before B and B before A
    const beforeSet = new Map<string, Set<string>>();
    for (const r of relations) {
      if (r.relationType === 'precedes' || r.relationType === 'causes') {
        if (!beforeSet.has(r.from)) beforeSet.set(r.from, new Set());
        beforeSet.get(r.from)!.add(r.to);
      }
    }

    for (const [from, toSet] of beforeSet) {
      for (const to of toSet) {
        if (beforeSet.get(to)?.has(from)) {
          inconsistencies.push(`${from} precedes ${to} and ${to} precedes ${from}`);
        }
      }
    }

    return inconsistencies;
  }
}
