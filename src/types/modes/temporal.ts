/**
 * Temporal Reasoning Mode - Type Definitions
 * Phase 3 (v2.1) - Temporal reasoning with events, intervals, constraints, and causal relations
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Temporal thought extends base thought with time-dependent reasoning
 */
export interface TemporalThought extends BaseThought {
  mode: ThinkingMode.TEMPORAL;
  thoughtType:
    | 'event_definition'
    | 'interval_analysis'
    | 'temporal_constraint'
    | 'sequence_construction'
    | 'causality_timeline';

  timeline?: Timeline;
  events?: TemporalEvent[];
  intervals?: TimeInterval[];
  constraints?: TemporalConstraint[];
  relations?: TemporalRelation[];
}

/**
 * Timeline structure organizing temporal events
 */
export interface Timeline {
  id: string;
  name: string;
  timeUnit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';
  startTime?: number;
  endTime?: number;
  events: string[]; // Event IDs
}

/**
 * Temporal event - either instant or interval
 */
export interface TemporalEvent {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  duration?: number; // For interval events
  type: 'instant' | 'interval';
  properties: Record<string, any>;
}

/**
 * Time interval with Allen's algebra relationships
 */
export interface TimeInterval {
  id: string;
  name: string;
  start: number;
  end: number;
  overlaps?: string[]; // IDs of overlapping intervals
  contains?: string[]; // IDs of contained intervals
}

/**
 * Temporal constraint using Allen's interval algebra
 */
export interface TemporalConstraint {
  id: string;
  type: 'before' | 'after' | 'during' | 'overlaps' | 'meets' | 'starts' | 'finishes' | 'equals';
  subject: string; // Event/Interval ID
  object: string; // Event/Interval ID
  confidence: number; // 0-1
  formula?: string; // LaTeX formula for temporal logic constraint
}

/**
 * Temporal relation showing causal/enabling relationships over time
 */
export interface TemporalRelation {
  id: string;
  from: string; // Event ID
  to: string; // Event ID
  relationType: 'causes' | 'enables' | 'prevents' | 'precedes' | 'follows';
  strength: number; // 0-1
  delay?: number; // Time delay between events
  formula?: string; // LaTeX formula for relationship dynamics
}

/**
 * Type guard for temporal thoughts
 */
export function isTemporalThought(thought: BaseThought): thought is TemporalThought {
  return thought.mode === 'temporal';
}
