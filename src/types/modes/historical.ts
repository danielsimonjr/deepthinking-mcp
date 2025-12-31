/**
 * Historical Reasoning Mode - Type Definitions
 * v9.1.0 - Historical analysis, source evaluation, pattern recognition, and historiographical reasoning
 */

import { BaseThought, ThinkingMode } from '../core.js';

// ============================================================================
// THOUGHT TYPES
// ============================================================================

/**
 * Historical thought types for different analysis approaches
 */
export type HistoricalThoughtType =
  | 'event_analysis'         // Analyze historical events and their context
  | 'source_evaluation'      // Evaluate primary/secondary sources
  | 'pattern_identification' // Identify patterns across time periods
  | 'causal_chain'           // Trace cause-effect relationships
  | 'periodization';         // Define and analyze historical periods

// ============================================================================
// CORE DATA STRUCTURES
// ============================================================================

/**
 * Date range for events spanning multiple dates
 */
export interface DateRange {
  start: string;
  end: string;
  precision?: 'exact' | 'approximate' | 'century' | 'decade' | 'year' | 'month' | 'day';
}

/**
 * Source bias characterization
 */
export interface SourceBias {
  type: 'political' | 'religious' | 'cultural' | 'economic' | 'nationalistic' | 'ideological' | 'personal';
  direction?: string;
  severity: number; // 0-1 scale
  evidence?: string[];
}

/**
 * Historical event representation
 */
export interface HistoricalEvent {
  id: string;
  name: string;
  date: string | DateRange;
  location?: string;
  description?: string;
  actors?: string[];        // References to HistoricalActor.id
  causes?: string[];        // References to other event IDs
  effects?: string[];       // References to other event IDs
  significance: 'minor' | 'moderate' | 'major' | 'transformative';
  sources?: string[];       // References to HistoricalSource.id
  tags?: string[];
  context?: string;
}

/**
 * Historical source for evaluation
 */
export interface HistoricalSource {
  id: string;
  title: string;
  type: 'primary' | 'secondary' | 'tertiary';
  subtype?: 'document' | 'artifact' | 'oral' | 'visual' | 'archaeological' | 'statistical';
  author?: string;
  date?: string;
  location?: string;
  reliability: number;      // 0-1 scale
  bias?: SourceBias;
  corroboratedBy?: string[]; // Other source IDs
  contradictedBy?: string[];
  provenance?: string;
  limitations?: string[];
}

/**
 * Period transition characteristics
 */
export interface PeriodTransition {
  fromPeriod: string;
  toPeriod: string;
  transitionType: 'gradual' | 'abrupt' | 'revolutionary' | 'evolutionary';
  catalysts?: string[];
  duration?: string;
}

/**
 * Historical period for periodization
 */
export interface HistoricalPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  characteristics: string[];
  keyEvents?: string[];     // Event IDs
  keyActors?: string[];     // Actor IDs
  transitions?: PeriodTransition[];
  themes?: string[];
}

/**
 * Causal link in a chain
 */
export interface CausalLink {
  cause: string;            // Event ID
  effect: string;           // Event ID
  mechanism?: string;
  confidence: number;       // 0-1 scale
  timelag?: string;
  evidence?: string[];      // Source IDs
}

/**
 * Causal chain analysis
 */
export interface CausalChain {
  id: string;
  name: string;
  links: CausalLink[];
  confidence: number;       // 0-1 scale (aggregate)
  alternativeExplanations?: string[];
  historiographicalDebate?: string;
}

/**
 * Actor relationship types
 */
export interface ActorRelationship {
  actorId: string;
  type: 'ally' | 'rival' | 'subordinate' | 'superior' | 'colleague' | 'influenced_by' | 'mentor' | 'successor';
  period?: string;
  description?: string;
}

/**
 * Historical actor representation
 */
export interface HistoricalActor {
  id: string;
  name: string;
  type: 'individual' | 'group' | 'institution' | 'nation' | 'movement' | 'class';
  period?: string;          // Period ID
  dates?: DateRange;
  roles?: string[];
  motivations?: string[];
  relationships?: ActorRelationship[];
  significance?: 'minor' | 'moderate' | 'major' | 'transformative';
}

// ============================================================================
// ANALYSIS RESULTS
// ============================================================================

/**
 * Historical pattern identified across events
 */
export interface HistoricalPattern {
  id: string;
  name: string;
  type: 'cyclical' | 'linear' | 'dialectical' | 'contingent' | 'structural';
  instances: string[];      // Event IDs
  description: string;
  confidence: number;
  counterexamples?: string[];
}

/**
 * Historical interpretation with historiographical context
 */
export interface HistoricalInterpretation {
  id: string;
  claim: string;
  school?: string;          // Historiographical school
  evidence: string[];       // Source IDs
  counterarguments?: string[];
  confidence: number;
  methodology?: string;
}

/**
 * Historiographical methodology approach
 */
export interface HistoricalMethodology {
  approach: 'empiricist' | 'interpretive' | 'critical' | 'postmodern' | 'marxist' | 'annales' | 'microhistory' | 'quantitative';
  techniques: string[];
  limitations: string[];
  strengths: string[];
}

// ============================================================================
// MAIN THOUGHT INTERFACE
// ============================================================================

/**
 * Historical reasoning thought
 * Enables historical analysis, source evaluation, pattern recognition, and historiographical reasoning
 */
export interface HistoricalThought extends BaseThought {
  mode: ThinkingMode.HISTORICAL;
  thoughtType?: HistoricalThoughtType;

  // Core structures
  events?: HistoricalEvent[];
  sources?: HistoricalSource[];
  periods?: HistoricalPeriod[];
  causalChains?: CausalChain[];
  actors?: HistoricalActor[];

  // Analysis results
  patterns?: HistoricalPattern[];
  interpretations?: HistoricalInterpretation[];

  // Historiographical metadata
  historiographicalSchool?: string;
  methodology?: HistoricalMethodology;

  // Aggregate metrics
  aggregateReliability?: number;
  temporalSpan?: DateRange;
}

// ============================================================================
// TYPE GUARD
// ============================================================================

/**
 * Type guard for historical thoughts
 */
export function isHistoricalThought(thought: BaseThought): thought is HistoricalThought {
  return thought.mode === 'historical';
}
