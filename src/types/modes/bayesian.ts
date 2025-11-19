/**
 * Bayesian Reasoning Mode - Type Definitions
 * Probabilistic reasoning with evidence updates and Bayes' theorem
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Hypothesis for Bayesian analysis
 */
export interface BayesianHypothesis {
  id: string;
  statement: string;
  alternatives?: string[];
}

/**
 * Prior probability
 */
export interface PriorProbability {
  probability: number; // 0-1
  justification: string;
}

/**
 * Likelihood of evidence
 */
export interface Likelihood {
  probability: number; // 0-1
  description: string;
}

/**
 * Evidence for Bayesian update
 */
export interface BayesianEvidence {
  id: string;
  description: string;
  likelihoodGivenHypothesis: number; // P(E|H)
  likelihoodGivenNotHypothesis: number; // P(E|¬H)
  timestamp?: string;
}

/**
 * Posterior probability (updated belief)
 */
export interface PosteriorProbability {
  probability: number; // 0-1
  calculation: string;
  confidence: number; // 0-1
}

/**
 * Sensitivity analysis for Bayesian reasoning
 */
export interface SensitivityAnalysis {
  priorRange: [number, number];
  posteriorRange: [number, number];
}

export interface BayesianThought extends BaseThought {
  mode: ThinkingMode.BAYESIAN;
  hypothesis: BayesianHypothesis;
  prior: PriorProbability;
  likelihood: Likelihood;
  evidence: BayesianEvidence[];
  posterior: PosteriorProbability;
  bayesFactor?: number; // Strength of evidence
  sensitivity?: SensitivityAnalysis;
}

export function isBayesianThought(thought: BaseThought): thought is BayesianThought {
  return thought.mode === 'bayesian';
}
