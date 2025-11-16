/**
 * Evidential Reasoning Mode - Type Definitions
 * Phase 3C (v2.3) - Dempster-Shafer theory, belief functions, evidence combination
 */

import { BaseThought } from '../core.js';

export interface EvidentialThought extends BaseThought {
  mode: 'evidential';
  thoughtType:
    | 'hypothesis_definition'
    | 'evidence_collection'
    | 'belief_assignment'
    | 'evidence_combination'
    | 'decision_analysis';

  frameOfDiscernment?: string[]; // All possible hypotheses
  hypotheses?: Hypothesis[];
  evidence?: Evidence[];
  beliefFunctions?: BeliefFunction[];
  combinedBelief?: BeliefFunction;
  plausibility?: PlausibilityFunction;
  decisions?: Decision[];
}

export interface Hypothesis {
  id: string;
  name: string;
  description: string;
  mutuallyExclusive: boolean;
  subsets?: string[]; // For composite hypotheses
}

export interface Evidence {
  id: string;
  description: string;
  source: string;
  reliability: number; // 0-1
  timestamp: number;
  supports: string[]; // Hypothesis IDs or subsets
  contradicts?: string[]; // Hypothesis IDs or subsets
}

export interface BeliefFunction {
  id: string;
  source: string; // Evidence ID or 'combined'
  massAssignments: MassAssignment[];
  conflictMass?: number; // Normalization factor
}

export interface MassAssignment {
  hypothesisSet: string[]; // Hypothesis IDs (singleton or composite)
  mass: number; // 0-1, basic probability assignment
  justification: string;
}

export interface PlausibilityFunction {
  id: string;
  assignments: PlausibilityAssignment[];
}

export interface PlausibilityAssignment {
  hypothesisSet: string[];
  plausibility: number; // 0-1
  belief: number; // 0-1
  uncertaintyInterval: [number, number]; // [belief, plausibility]
}

export interface Decision {
  id: string;
  name: string;
  selectedHypothesis: string[];
  confidence: number; // Based on belief/plausibility
  reasoning: string;
  alternatives: Alternative[];
}

export interface Alternative {
  hypothesis: string[];
  expectedUtility: number;
  risk: number;
}

export function isEvidentialThought(thought: BaseThought): thought is EvidentialThought {
  return thought.mode === 'evidential';
}
