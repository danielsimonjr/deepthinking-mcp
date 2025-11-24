/**
 * Stochastic Reasoning Mode (v3.4.0)
 * Phase 4E Task 8.5 (File Task 28): Reasoning with randomness and uncertainty
 */

import type { BaseThought, ThinkingMode } from '../types/index.js';

/**
 * Stochastic process type
 */
export type StochasticProcessType =
  | 'random_walk' // Random walk
  | 'markov_chain' // Markov chain
  | 'poisson' // Poisson process
  | 'brownian_motion' // Brownian motion / Wiener process
  | 'levy_process' // Lévy process
  | 'martingale' // Martingale
  | 'renewal' // Renewal process
  | 'birth_death' // Birth-death process
  | 'queueing' // Queueing process
  | 'diffusion'; // Diffusion process

/**
 * Random variable
 */
export interface RandomVariable {
  id: string;
  name: string;
  distribution: ProbabilityDistribution;
  support: [number, number] | 'discrete' | 'unbounded';
  description: string;
}

/**
 * Probability distribution
 */
export interface ProbabilityDistribution {
  type:
    | 'uniform'
    | 'normal'
    | 'exponential'
    | 'poisson'
    | 'binomial'
    | 'bernoulli'
    | 'geometric'
    | 'gamma'
    | 'beta'
    | 'lognormal'
    | 'chi_squared'
    | 'student_t'
    | 'weibull'
    | 'pareto'
    | 'custom';
  parameters: Map<string, number>; // e.g., {mean: 0, std: 1}
  pdf?: (x: number) => number; // Probability density function
  cdf?: (x: number) => number; // Cumulative distribution function
  sample?: () => number; // Sample generation
}

/**
 * Stochastic process
 */
export interface StochasticProcess {
  id: string;
  name: string;
  type: StochasticProcessType;
  states: string[];
  initialState: string | Map<string, number>; // Single state or distribution
  transitionMatrix?: number[][]; // For Markov chains
  transitionRate?: number[][]; // For continuous-time processes
  timeHorizon: number;
  discreteTime: boolean;
  description: string;
}

/**
 * Simulation result
 */
export interface SimulationResult {
  trajectories: Trajectory[];
  statistics: SimulationStatistics;
  convergence: ConvergenceInfo;
  method: 'monte_carlo' | 'quasi_monte_carlo' | 'importance_sampling' | 'rejection_sampling';
}

/**
 * Trajectory (sample path)
 */
export interface Trajectory {
  id: number;
  timePoints: number[];
  stateValues: (string | number)[];
  events: StochasticEvent[];
}

/**
 * Stochastic event
 */
export interface StochasticEvent {
  time: number;
  type: string;
  fromState?: string | number;
  toState?: string | number;
  probability: number;
  description: string;
}

/**
 * Simulation statistics
 */
export interface SimulationStatistics {
  numTrajectories: number;
  meanValue: number;
  variance: number;
  standardError: number;
  confidenceInterval: [number, number];
  confidenceLevel: number;
  quantiles: Map<number, number>; // e.g., {0.25: x, 0.5: x, 0.75: x}
  moments: {
    mean: number;
    variance: number;
    skewness: number;
    kurtosis: number;
  };
}

/**
 * Convergence information
 */
export interface ConvergenceInfo {
  converged: boolean;
  iterations: number;
  finalError: number;
  convergenceRate: number;
  stoppingCriterion: string;
}

/**
 * Markov chain analysis
 */
export interface MarkovChainAnalysis {
  isIrreducible: boolean;
  isAperiodic: boolean;
  isErgodic: boolean;
  stationaryDistribution?: number[];
  communicatingClasses: string[][];
  transientStates: string[];
  recurrentStates: string[];
  absorptionProbabilities?: Map<string, number>;
  meanFirstPassageTime?: Map<string, Map<string, number>>;
}

/**
 * Stochastic reasoning thought
 */
export interface StochasticReasoningThought extends BaseThought {
  mode: ThinkingMode.STOCHASTIC;
  randomVariables: RandomVariable[];
  processes: StochasticProcess[];
  simulations: SimulationResult[];
  markovAnalysis?: MarkovChainAnalysis;
  analysis: StochasticAnalysis;
}

/**
 * Stochastic analysis
 */
export interface StochasticAnalysis {
  processType: StochasticProcessType;
  timeHorizon: number;
  numStates: number;
  memoryless: boolean; // Markov property
  stationarity: 'stationary' | 'non_stationary' | 'unknown';
  expectedBehavior: string;
  keyProperties: string[];
  limitations: string[];
}

/**
 * Stochastic reasoning engine
 */
export class StochasticReasoningEngine {
  private rng: () => number;

  constructor(seed?: number) {
    // Simple seeded PRNG for reproducibility
    if (seed !== undefined) {
      let state = seed;
      this.rng = () => {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
      };
    } else {
      this.rng = Math.random;
    }
  }

  /**
   * Create random variable
   */
  createRandomVariable(
    name: string,
    distribution: ProbabilityDistribution,
    description: string
  ): RandomVariable {
    let support: [number, number] | 'discrete' | 'unbounded';

    if (distribution.type === 'uniform') {
      const a = distribution.parameters.get('a') || 0;
      const b = distribution.parameters.get('b') || 1;
      support = [a, b];
    } else if (['poisson', 'binomial', 'bernoulli', 'geometric'].includes(distribution.type)) {
      support = 'discrete';
    } else {
      support = 'unbounded';
    }

    return {
      id: `rv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name,
      distribution,
      support,
      description,
    };
  }

  /**
   * Sample from distribution
   */
  sampleDistribution(distribution: ProbabilityDistribution): number {
    if (distribution.sample) {
      return distribution.sample();
    }

    const { type, parameters } = distribution;

    switch (type) {
      case 'uniform': {
        const a = parameters.get('a') || 0;
        const b = parameters.get('b') || 1;
        return a + this.rng() * (b - a);
      }

      case 'normal': {
        const mean = parameters.get('mean') || 0;
        const std = parameters.get('std') || 1;
        // Box-Muller transform
        const u1 = this.rng();
        const u2 = this.rng();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + std * z;
      }

      case 'exponential': {
        const lambda = parameters.get('lambda') || 1;
        return -Math.log(1 - this.rng()) / lambda;
      }

      case 'poisson': {
        const lambda = parameters.get('lambda') || 1;
        let L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
          k++;
          p *= this.rng();
        } while (p > L);
        return k - 1;
      }

      case 'binomial': {
        const n = parameters.get('n') || 1;
        const p = parameters.get('p') || 0.5;
        let sum = 0;
        for (let i = 0; i < n; i++) {
          if (this.rng() < p) sum++;
        }
        return sum;
      }

      case 'bernoulli': {
        const p = parameters.get('p') || 0.5;
        return this.rng() < p ? 1 : 0;
      }

      case 'geometric': {
        const p = parameters.get('p') || 0.5;
        return Math.floor(Math.log(1 - this.rng()) / Math.log(1 - p)) + 1;
      }

      case 'gamma': {
        const shape = parameters.get('shape') || 1;
        const scale = parameters.get('scale') || 1;
        // Simple approximation for shape >= 1
        if (shape < 1) return 0;
        let sum = 0;
        for (let i = 0; i < Math.floor(shape); i++) {
          sum += -Math.log(this.rng());
        }
        return sum * scale;
      }

      default:
        return this.rng();
    }
  }

  /**
   * Create Markov chain
   */
  createMarkovChain(
    states: string[],
    transitionMatrix: number[][],
    initialState: string | Map<string, number>,
    description: string
  ): StochasticProcess {
    return {
      id: `mc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: 'Markov Chain',
      type: 'markov_chain',
      states,
      initialState,
      transitionMatrix,
      timeHorizon: 100,
      discreteTime: true,
      description,
    };
  }

  /**
   * Simulate Markov chain
   */
  simulateMarkovChain(
    process: StochasticProcess,
    numSteps: number,
    numTrajectories: number = 1000
  ): SimulationResult {
    const trajectories: Trajectory[] = [];

    for (let traj = 0; traj < numTrajectories; traj++) {
      const timePoints: number[] = [];
      const stateValues: string[] = [];
      const events: StochasticEvent[] = [];

      // Initialize
      let currentStateIndex: number;
      if (typeof process.initialState === 'string') {
        currentStateIndex = process.states.indexOf(process.initialState);
      } else {
        // Sample from initial distribution
        const rand = this.rng();
        let cumProb = 0;
        currentStateIndex = 0;
        for (const [state, prob] of process.initialState) {
          cumProb += prob;
          if (rand < cumProb) {
            currentStateIndex = process.states.indexOf(state);
            break;
          }
        }
      }

      timePoints.push(0);
      stateValues.push(process.states[currentStateIndex]);

      // Simulate transitions
      for (let step = 1; step <= numSteps; step++) {
        const transitionProbs = process.transitionMatrix![currentStateIndex];
        const rand = this.rng();
        let cumProb = 0;
        let nextStateIndex = currentStateIndex;

        for (let i = 0; i < transitionProbs.length; i++) {
          cumProb += transitionProbs[i];
          if (rand < cumProb) {
            nextStateIndex = i;
            break;
          }
        }

        timePoints.push(step);
        stateValues.push(process.states[nextStateIndex]);

        if (nextStateIndex !== currentStateIndex) {
          events.push({
            time: step,
            type: 'transition',
            fromState: process.states[currentStateIndex],
            toState: process.states[nextStateIndex],
            probability: transitionProbs[nextStateIndex],
            description: `Transition from ${process.states[currentStateIndex]} to ${process.states[nextStateIndex]}`,
          });
        }

        currentStateIndex = nextStateIndex;
      }

      trajectories.push({
        id: traj,
        timePoints,
        stateValues,
        events,
      });
    }

    // Compute statistics (simplified - just final state distribution)
    const finalStateCounts = new Map<string, number>();
    for (const traj of trajectories) {
      const finalState = traj.stateValues[traj.stateValues.length - 1];
      const finalStateKey = String(finalState);
      finalStateCounts.set(finalStateKey, (finalStateCounts.get(finalStateKey) || 0) + 1);
    }

    const meanValue = Array.from(finalStateCounts.values()).reduce((a, b) => a + b, 0) / numTrajectories;
    const variance = 0; // Simplified

    const statistics: SimulationStatistics = {
      numTrajectories,
      meanValue,
      variance,
      standardError: Math.sqrt(variance / numTrajectories),
      confidenceInterval: [meanValue - 1.96 * Math.sqrt(variance / numTrajectories), meanValue + 1.96 * Math.sqrt(variance / numTrajectories)],
      confidenceLevel: 0.95,
      quantiles: new Map(),
      moments: {
        mean: meanValue,
        variance,
        skewness: 0,
        kurtosis: 0,
      },
    };

    return {
      trajectories,
      statistics,
      convergence: {
        converged: true,
        iterations: numTrajectories,
        finalError: 0,
        convergenceRate: 1.0,
        stoppingCriterion: 'max_iterations',
      },
      method: 'monte_carlo',
    };
  }

  /**
   * Analyze Markov chain
   */
  analyzeMarkovChain(process: StochasticProcess): MarkovChainAnalysis {
    const n = process.states.length;
    const P = process.transitionMatrix!;

    // Check irreducibility (simplified: check if all states communicate)
    const isIrreducible = this.checkIrreducible(P, n);

    // Check aperiodicity (simplified: check for self-loops)
    const isAperiodic = P.some((row, i) => row[i] > 0);

    const isErgodic = isIrreducible && isAperiodic;

    // Compute stationary distribution (if ergodic)
    let stationaryDistribution: number[] | undefined;
    if (isErgodic) {
      stationaryDistribution = this.computeStationaryDistribution(P, n);
    }

    // Identify communicating classes (simplified)
    const communicatingClasses: string[][] = [[...process.states]]; // Assume all communicate

    return {
      isIrreducible,
      isAperiodic,
      isErgodic,
      stationaryDistribution,
      communicatingClasses,
      transientStates: [],
      recurrentStates: [...process.states],
    };
  }

  /**
   * Check if Markov chain is irreducible
   */
  private checkIrreducible(P: number[][], n: number): boolean {
    // Simplified: check if P^n has all positive entries
    let Pn = P;
    for (let k = 1; k < n; k++) {
      Pn = this.multiplyMatrices(Pn, P, n);
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (Pn[i][j] === 0) return false;
      }
    }
    return true;
  }

  /**
   * Multiply two matrices
   */
  private multiplyMatrices(A: number[][], B: number[][], n: number): number[][] {
    const result: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }

    return result;
  }

  /**
   * Compute stationary distribution using power method
   */
  private computeStationaryDistribution(P: number[][], n: number): number[] {
    // Initialize uniform distribution
    let pi = Array(n).fill(1 / n);

    // Power method: π = π * P
    for (let iter = 0; iter < 1000; iter++) {
      const nextPi = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          nextPi[j] += pi[i] * P[i][j];
        }
      }

      // Check convergence
      const diff = nextPi.reduce((sum, val, i) => sum + Math.abs(val - pi[i]), 0);
      if (diff < 1e-6) {
        return nextPi;
      }

      pi = nextPi;
    }

    return pi;
  }

  /**
   * Monte Carlo estimation
   */
  monteCarloEstimate(
    estimand: () => number,
    numSamples: number = 10000
  ): { estimate: number; standardError: number; confidenceInterval: [number, number] } {
    const samples: number[] = [];

    for (let i = 0; i < numSamples; i++) {
      samples.push(estimand());
    }

    const mean = samples.reduce((a, b) => a + b, 0) / numSamples;
    const variance = samples.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (numSamples - 1);
    const standardError = Math.sqrt(variance / numSamples);
    const margin = 1.96 * standardError;

    return {
      estimate: mean,
      standardError,
      confidenceInterval: [mean - margin, mean + margin],
    };
  }

  /**
   * Perform stochastic analysis
   */
  analyzeProcess(process: StochasticProcess): StochasticAnalysis {
    const memoryless = process.type === 'markov_chain' || process.type === 'poisson';
    const stationarity: 'stationary' | 'non_stationary' | 'unknown' = 'unknown';

    const keyProperties: string[] = [];
    if (memoryless) {
      keyProperties.push('Memoryless (Markov property)');
    }
    if (process.type === 'markov_chain') {
      keyProperties.push('Discrete state space');
      keyProperties.push('Discrete time');
    }

    return {
      processType: process.type,
      timeHorizon: process.timeHorizon,
      numStates: process.states.length,
      memoryless,
      stationarity,
      expectedBehavior: `Process evolves according to ${process.type} dynamics`,
      keyProperties,
      limitations: ['Simplified model', 'Assumes time-homogeneity'],
    };
  }

  /**
   * Generate summary
   */
  generateSummary(
    process: StochasticProcess,
    simulation: SimulationResult,
    analysis: StochasticAnalysis,
    markovAnalysis?: MarkovChainAnalysis
  ): string {
    const report: string[] = [];

    report.push('# Stochastic Reasoning Summary');
    report.push('');

    report.push('## Process Definition');
    report.push(`- **Type:** ${process.type}`);
    report.push(`- **Description:** ${process.description}`);
    report.push(`- **States:** ${process.states.join(', ')}`);
    report.push(`- **Time Horizon:** ${process.timeHorizon}`);
    report.push(`- **Discrete Time:** ${process.discreteTime ? 'Yes' : 'No'}`);
    report.push('');

    report.push('## Key Properties');
    for (const prop of analysis.keyProperties) {
      report.push(`- ${prop}`);
    }
    report.push('');

    if (markovAnalysis) {
      report.push('## Markov Chain Analysis');
      report.push(`- **Irreducible:** ${markovAnalysis.isIrreducible ? 'Yes' : 'No'}`);
      report.push(`- **Aperiodic:** ${markovAnalysis.isAperiodic ? 'Yes' : 'No'}`);
      report.push(`- **Ergodic:** ${markovAnalysis.isErgodic ? 'Yes' : 'No'}`);

      if (markovAnalysis.stationaryDistribution) {
        report.push('');
        report.push('### Stationary Distribution');
        markovAnalysis.stationaryDistribution.forEach((prob, idx) => {
          report.push(`- π(${process.states[idx]}) = ${prob.toFixed(4)}`);
        });
      }
      report.push('');
    }

    report.push('## Simulation Results');
    report.push(`- **Method:** ${simulation.method}`);
    report.push(`- **Trajectories:** ${simulation.statistics.numTrajectories}`);
    report.push(`- **Mean Value:** ${simulation.statistics.meanValue.toFixed(4)}`);
    report.push(
      `- **95% CI:** [${simulation.statistics.confidenceInterval[0].toFixed(4)}, ${simulation.statistics.confidenceInterval[1].toFixed(4)}]`
    );
    report.push(`- **Standard Error:** ${simulation.statistics.standardError.toFixed(6)}`);
    report.push('');

    return report.join('\n');
  }
}
