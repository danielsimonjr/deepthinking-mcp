/**
 * Counterfactual Reasoning Mode - Type Definitions
 * What-if analysis and alternative scenario exploration
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Condition in a scenario
 */
export interface Condition {
  factor: string;
  value: string;
  isIntervention?: boolean; // Was this changed from actual?
}

/**
 * Outcome of a scenario
 */
export interface Outcome {
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude?: number; // 0-1
}

/**
 * Scenario (actual or counterfactual)
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  conditions: Condition[];
  outcomes: Outcome[];
  likelihood?: number; // 0-1 probability of this scenario
}

/**
 * Difference between actual and counterfactual scenarios
 */
export interface ScenarioDifference {
  aspect: string;
  actual?: string;
  counterfactual?: string;
}

/**
 * Comparison between scenarios
 */
export interface CounterfactualComparison {
  differences: ScenarioDifference[];
  insights: string[];
  lessons: string[];
}

/**
 * Point where intervention could change outcome
 */
export interface InterventionPoint {
  description: string;
  timing: string;
  feasibility: number; // 0-1
  expectedImpact: number; // 0-1
}

/**
 * Causal chain in counterfactual analysis
 */
export interface CausalChain {
  id: string;
  events: string[];
  branchingPoint: string;
  divergence: string;
}

export interface CounterfactualThought extends BaseThought {
  mode: ThinkingMode.COUNTERFACTUAL;
  actual: Scenario;
  counterfactuals: Scenario[];
  comparison: CounterfactualComparison;
  interventionPoint: InterventionPoint;
  causalChains?: CausalChain[];
}

export function isCounterfactualThought(thought: BaseThought): thought is CounterfactualThought {
  return thought.mode === 'counterfactual';
}
