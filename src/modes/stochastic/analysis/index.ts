/**
 * Stochastic Analysis Module Exports - Phase 12 Sprint 5
 */

// Statistics
export {
  mean,
  variance,
  stdDev,
  median,
  percentile,
  percentiles,
  skewness,
  kurtosis,
  mode,
  covariance,
  correlation,
  correlationMatrix,
  covarianceMatrix,
  equalTailedInterval,
  hpdInterval,
  computeSampleStatistics,
  mcse,
  estimateESS,
  summarizePosterior,
  summarizeAllPosteriors,
  probExceedsThreshold,
  probInRange,
  probAExceedsB,
  histogram,
  kde,
  type CredibleInterval,
  type PosteriorSummary,
  type HistogramBin,
} from './statistics.js';

// Convergence
export {
  autocorrelation,
  integratedAutocorrelationTime,
  effectiveSampleSize,
  effectiveSampleSizeMultiple,
  minEffectiveSampleSize,
  gewekeStatistic,
  gewekeStatisticMultiple,
  aggregateGewekeStatistic,
  rHatSingleChain,
  rHatMultipleChains,
  mcse as mcseConvergence,
  mcseMultiple,
  assessConvergence,
  computeConvergenceDiagnostics,
  traceStatistics,
  generateDiagnosticSummary,
  type ConvergenceResult,
  type TraceStats,
  type DiagnosticSummary,
} from './convergence.js';
