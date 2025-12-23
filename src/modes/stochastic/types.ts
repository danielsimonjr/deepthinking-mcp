/**
 * Monte Carlo Extension Types for Stochastic Reasoning
 * Phase 12 Sprint 1 - Foundation & Infrastructure
 *
 * These types EXTEND the existing StochasticThought types in src/types/modes/stochastic.ts.
 * They provide Monte Carlo simulation, distribution sampling, and convergence diagnostics.
 *
 * Existing types in src/types/modes/stochastic.ts:
 * - StochasticThought, StochasticProcessType, StochasticState
 * - StateTransition, MarkovChain, RandomVariable, DistributionType
 * - SimulationResult, SimulationStatistics
 */

// ============================================================================
// MONTE CARLO DISTRIBUTION TYPES
// ============================================================================

/**
 * Extended distribution specification for Monte Carlo sampling.
 * More detailed than the base DistributionType to support actual sampling.
 */
export type Distribution =
  | { type: 'normal'; mean: number; stdDev: number }
  | { type: 'uniform'; min: number; max: number }
  | { type: 'exponential'; rate: number }
  | { type: 'poisson'; lambda: number }
  | { type: 'binomial'; n: number; p: number }
  | { type: 'categorical'; probabilities: Record<string, number> }
  | { type: 'beta'; alpha: number; beta: number }
  | { type: 'gamma'; shape: number; scale: number }
  | { type: 'lognormal'; mu: number; sigma: number }
  | { type: 'triangular'; min: number; mode: number; max: number }
  | { type: 'custom'; sampler: () => number };

/**
 * Domain specification for a stochastic variable
 */
export type Domain =
  | { type: 'continuous'; min?: number; max?: number }
  | { type: 'discrete'; values: number[] }
  | { type: 'integer'; min: number; max: number }
  | { type: 'categorical'; categories: string[] };

/**
 * A stochastic variable with distribution and domain
 */
export interface StochasticVariable {
  /** Variable name */
  name: string;

  /** Probability distribution */
  distribution: Distribution;

  /** Domain of the variable */
  domain: Domain;

  /** Optional description */
  description?: string;

  /** Whether this variable is observable */
  observable?: boolean;
}

/**
 * Dependency between stochastic variables
 */
export interface Dependency {
  /** Source variable */
  from: string;

  /** Target variable */
  to: string;

  /** Type of dependency */
  type: 'causal' | 'correlation' | 'conditional';

  /** Strength of dependency (-1 to 1) */
  strength?: number;
}

/**
 * Constraint on stochastic model
 */
export interface Constraint {
  /** Constraint type */
  type: 'equality' | 'inequality' | 'range' | 'sum_to_one';

  /** Variables involved */
  variables: string[];

  /** Constraint expression */
  expression: string;

  /** Target value if applicable */
  target?: number;
}

/**
 * Complete stochastic model for Monte Carlo simulation
 */
export interface StochasticModel {
  /** Model identifier */
  id: string;

  /** Model type */
  type: 'discrete' | 'continuous' | 'mixed';

  /** Variables in the model */
  variables: StochasticVariable[];

  /** Dependencies between variables */
  dependencies: Dependency[];

  /** Constraints on the model */
  constraints?: Constraint[];

  /** Model description */
  description?: string;
}

// ============================================================================
// MONTE CARLO CONFIGURATION TYPES
// ============================================================================

/**
 * Configuration for Monte Carlo simulation
 */
export interface MonteCarloConfig {
  /** Number of iterations to run */
  iterations: number;

  /** Number of initial samples to discard (burn-in period) */
  burnIn?: number;

  /** Keep every Nth sample (thinning) */
  thinning?: number;

  /** Stop early if converged below this threshold */
  convergenceThreshold?: number;

  /** Random seed for reproducibility */
  seed?: number;

  /** Maximum time allowed (ms) */
  timeout?: number;

  /** Report progress every N iterations */
  progressInterval?: number;

  /** Number of parallel chains for convergence diagnostics */
  chains?: number;
}

/**
 * Progress update during simulation
 */
export interface SimulationProgress {
  /** Iterations completed */
  completed: number;

  /** Total iterations planned */
  total: number;

  /** Percentage complete */
  percentage: number;

  /** Estimated time remaining (ms) */
  estimatedRemaining: number;

  /** Current samples collected */
  samplesCollected: number;

  /** Current convergence metric if available */
  currentConvergence?: number;
}

// ============================================================================
// MONTE CARLO RESULT TYPES
// ============================================================================

/**
 * Basic statistics from Monte Carlo samples
 */
export interface SampleStatistics {
  /** Sample mean for each variable */
  mean: number[];

  /** Sample variance for each variable */
  variance: number[];

  /** Standard deviation for each variable */
  stdDev: number[];

  /** Percentiles (e.g., 2.5, 25, 50, 75, 97.5) */
  percentiles: Record<number, number[]>;

  /** Correlation matrix between variables */
  correlations: number[][];

  /** Skewness for each variable */
  skewness?: number[];

  /** Kurtosis for each variable */
  kurtosis?: number[];
}

/**
 * Convergence diagnostics for Monte Carlo simulation
 */
export interface ConvergenceDiagnostics {
  /** Geweke statistic (z-score comparing first and last portions) */
  gewekeStatistic: number;

  /** Effective sample size (accounting for autocorrelation) */
  effectiveSampleSize: number;

  /** R-hat statistic (potential scale reduction factor) */
  rHat: number;

  /** Whether the chain has converged */
  hasConverged: boolean;

  /** Autocorrelation at various lags */
  autocorrelation?: number[];

  /** Monte Carlo standard error */
  mcse?: number[];
}

/**
 * Complete result from Monte Carlo simulation
 */
export interface MonteCarloResult {
  /** Raw samples (rows = iterations, cols = variables) */
  samples: number[][];

  /** Variable names corresponding to columns */
  variableNames: string[];

  /** Computed statistics */
  statistics: SampleStatistics;

  /** Convergence diagnostics */
  convergenceDiagnostics: ConvergenceDiagnostics;

  /** Total execution time (ms) */
  executionTime: number;

  /** Number of samples after burn-in and thinning */
  effectiveSamples: number;

  /** Whether simulation completed successfully */
  success: boolean;

  /** Configuration used */
  config: MonteCarloConfig;

  /** Any warnings generated */
  warnings?: string[];
}

// ============================================================================
// SEEDED RNG TYPES
// ============================================================================

/**
 * State of a seeded random number generator (for checkpointing)
 */
export interface RNGState {
  /** Internal state array */
  state: number[];

  /** Current position in state */
  position: number;

  /** Original seed */
  seed: number;

  /** Number of values generated */
  count: number;
}

/**
 * Interface for a seeded random number generator
 */
export interface SeededRNGInterface {
  /** Get next uniform random number [0, 1) */
  next(): number;

  /** Get uniform random number in range */
  uniform(min: number, max: number): number;

  /** Get normally distributed random number */
  normal(mean: number, stdDev: number): number;

  /** Get exponentially distributed random number */
  exponential(rate: number): number;

  /** Get Poisson distributed random number */
  poisson(lambda: number): number;

  /** Get binomially distributed random number */
  binomial(n: number, p: number): number;

  /** Get sample from categorical distribution */
  categorical(probabilities: Record<string, number>): string;

  /** Save current state for checkpointing */
  saveState(): RNGState;

  /** Restore from saved state */
  restoreState(state: RNGState): void;

  /** Reset to initial seed */
  reset(): void;
}

// ============================================================================
// SAMPLING TYPES
// ============================================================================

/**
 * Configuration for a sampler
 */
export interface SamplerConfig {
  /** Distribution to sample from */
  distribution: Distribution;

  /** Number of samples to generate */
  count: number;

  /** Random seed */
  seed?: number;
}

/**
 * Result of sampling operation
 */
export interface SamplingResult {
  /** Generated samples */
  samples: number[];

  /** Statistics of the samples */
  statistics: {
    mean: number;
    variance: number;
    min: number;
    max: number;
  };

  /** Time taken (ms) */
  time: number;
}
