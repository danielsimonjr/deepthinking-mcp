/**
 * Stochastic Reasoning Module
 * Phase 12 Sprint 5 - Monte Carlo & Stochastic Reasoning
 *
 * Provides Monte Carlo simulation, probability distributions,
 * and stochastic reasoning capabilities.
 */

// Export types
export * from './types.js';

// Phase 12 Sprint 5: Distribution samplers
export {
  createSampler,
  NormalSampler,
  UniformSampler,
  ExponentialSampler,
  PoissonSampler,
  BinomialSampler,
  CategoricalSampler,
  BetaSampler,
  GammaSampler,
  sampleWithStatistics,
  type DistributionSampler,
} from './models/distribution.js';

// Phase 12 Sprint 5: Monte Carlo engine
export {
  MonteCarloEngine,
  createMonteCarloEngine,
  runMonteCarloSimulation,
  type ProgressCallback,
  type ModelEvaluator,
} from './models/monte-carlo.js';

// Phase 12 Sprint 5: Seeded RNG
export {
  SeededRNG,
  createRNG,
  createParallelRNGs,
  generateSeed,
} from './sampling/rng.js';

// Phase 12 Sprint 5: Analysis
export * from './analysis/index.js';
