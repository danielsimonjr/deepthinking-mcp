/**
 * Evidential Reasoning Mode - Type Definitions
 * Phase 3C (v2.3) - Dempster-Shafer theory, belief functions, evidence combination
 */

import { BaseThought, ThinkingMode } from "../core.js";

/**
 * A thought in evidential mode.
 * The thoughtType field names the kind of evidential step.
 */
export interface EvidentialThought extends BaseThought {
  mode: ThinkingMode.EVIDENTIAL;
  thoughtType:
    | "hypothesis_definition"
    | "evidence_collection"
    | "belief_assignment"
    | "evidence_combination"
    | "decision_analysis";

  frameOfDiscernment?: string[]; // All possible hypotheses
  hypotheses?: Hypothesis[];
  evidence?: Evidence[];
  beliefFunctions?: BeliefFunction[];
  combinedBelief?: BeliefFunction;
  plausibility?: PlausibilityFunction;
  decisions?: Decision[];
}

/**
 * A hypothesis that evidence can support or contradict.
 * A composite hypothesis lists the ids of its subsets in subsets.
 */
export interface Hypothesis {
  id: string;
  name: string;
  description: string;
  mutuallyExclusive: boolean;
  subsets?: string[]; // For composite hypotheses
}

/**
 * A piece of evidence with a source.
 * The reliability field is a number from 0 to 1.
 */
export interface Evidence {
  id: string;
  description: string;
  source: string;
  reliability: number; // 0-1
  timestamp: number;
  supports: string[]; // Hypothesis IDs or subsets
  contradicts?: string[]; // Hypothesis IDs or subsets
}

/**
 * A belief function built from one source.
 * The source field holds an evidence id or the word combined.
 */
export interface BeliefFunction {
  id: string;
  source: string; // Evidence ID or 'combined'
  massAssignments: MassAssignment[];
  conflictMass?: number; // Normalization factor
}

/**
 * A basic probability assignment to one set of hypotheses.
 * The mass field is a number from 0 to 1.
 */
export interface MassAssignment {
  hypothesisSet: string[]; // Hypothesis IDs (singleton or composite)
  mass: number; // 0-1, basic probability assignment
  justification: string;
}

/**
 * A plausibility function.
 * It holds the plausibility assignments of the analysis.
 */
export interface PlausibilityFunction {
  id: string;
  assignments: PlausibilityAssignment[];
}

/**
 * The plausibility and belief of one set of hypotheses.
 * The uncertaintyInterval field holds the belief, then the plausibility.
 */
export interface PlausibilityAssignment {
  hypothesisSet: string[];
  plausibility: number; // 0-1
  belief: number; // 0-1
  uncertaintyInterval: [number, number]; // [belief, plausibility]
}

/**
 * A decision that the analysis makes from the hypotheses.
 * The confidence field reflects the belief and plausibility of the choice.
 */
export interface Decision {
  id: string;
  name: string;
  selectedHypothesis: string[];
  confidence: number; // Based on belief/plausibility
  reasoning: string;
  alternatives: Alternative[];
}

/**
 * An option that a decision compares with other options.
 * It has an expected utility and a risk.
 */
export interface Alternative {
  hypothesis: string[];
  expectedUtility: number;
  risk: number;
}

/**
 * Check whether a thought is in evidential mode.
 * Returns true when the mode field is evidential.
 */
export function isEvidentialThought(
  thought: BaseThought,
): thought is EvidentialThought {
  return thought.mode === "evidential";
}
