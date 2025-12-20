/**
 * Stochastic Reasoning Mode - Type Definitions
 * Phase 10 Sprint 3 (v8.4.0) - Markov chains, random processes, Monte Carlo
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Stochastic thought extends base thought with probabilistic process structures
 */
export interface StochasticThought extends BaseThought {
  mode: ThinkingMode.STOCHASTIC;
  thoughtType:
    | 'process_definition'
    | 'state_analysis'
    | 'transition_modeling'
    | 'simulation_run'
    | 'stationary_analysis'
    | 'convergence_check'
    // Handler-added types
    | 'transition_analysis'
    | 'steady_state_analysis'
    | 'random_variable_definition'
    | 'monte_carlo_simulation'
    | 'convergence_analysis'
    | 'hitting_time_analysis';

  /** Type of stochastic process */
  processType: StochasticProcessType;

  /** Current step in the process */
  stepCount: number;

  /** States in the stochastic process */
  states?: StochasticState[];

  /** Current state identifier */
  currentState?: string;

  /** History of states visited */
  stateHistory?: string[];

  /** State transitions with probabilities */
  transitions?: StateTransition[];

  /** Markov chain if applicable */
  markovChain?: MarkovChain;

  /** Random variables involved */
  randomVariables?: RandomVariable[];

  /** Simulation results */
  simulations?: SimulationResult[];
}

/**
 * Types of stochastic processes
 */
export type StochasticProcessType =
  | 'discrete_time'
  | 'continuous_time'
  | 'random_walk'
  | 'birth_death'
  | 'queueing'
  | 'branching';

/**
 * A state in the stochastic process
 */
export interface StochasticState {
  id: string;
  name: string;
  description: string;
  probability?: number;
  isAbsorbing: boolean;
  isTransient: boolean;
  expectedTime?: number;
}

/**
 * A state transition with probability
 */
export interface StateTransition {
  from: string;
  to: string;
  probability: number;
  rate?: number;
  condition?: string;
}

/**
 * Markov chain definition
 */
export interface MarkovChain {
  id: string;
  states: string[];
  transitionMatrix: number[][];
  initialDistribution: number[];
  stationaryDistribution?: number[];
  isIrreducible: boolean;
  isAperiodic: boolean;
  isErgodic: boolean;
}

/**
 * A random variable
 */
export interface RandomVariable {
  id: string;
  name: string;
  distribution: DistributionType;
  parameters: Record<string, number>;
  samples?: number[];
  mean?: number;
  variance?: number;
}

/**
 * Common distribution types
 */
export type DistributionType =
  | 'uniform'
  | 'normal'
  | 'exponential'
  | 'poisson'
  | 'binomial'
  | 'geometric'
  | 'bernoulli'
  | 'custom';

/**
 * Simulation result
 */
export interface SimulationResult {
  id: string;
  runNumber: number;
  steps: number;
  finalState: string;
  stateHistory: string[];
  statistics: SimulationStatistics;
}

/**
 * Statistics from simulation
 */
export interface SimulationStatistics {
  meanTime: number;
  variance: number;
  confidence95: [number, number];
  convergenceRate?: number;
}

/**
 * Type guard for Stochastic thoughts
 */
export function isStochasticThought(thought: BaseThought): thought is StochasticThought {
  return thought.mode === ThinkingMode.STOCHASTIC;
}
