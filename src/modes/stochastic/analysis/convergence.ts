/**
 * Convergence Diagnostics Module - Phase 12 Sprint 5
 *
 * Provides convergence diagnostics for Monte Carlo simulations including
 * Geweke statistic, R-hat, effective sample size, and autocorrelation analysis.
 */

import type { ConvergenceDiagnostics } from '../types.js';
import { mean, variance, stdDev } from './statistics.js';

// ============================================================================
// AUTOCORRELATION ANALYSIS
// ============================================================================

/**
 * Compute autocorrelation function at specified lags
 */
export function autocorrelation(values: number[], maxLag?: number): number[] {
  if (values.length < 2) return [1];

  const n = values.length;
  const effectiveMaxLag = maxLag ?? Math.min(n - 1, Math.floor(n / 2));
  const m = mean(values);
  const v = variance(values, m);

  if (v === 0) {
    return new Array(effectiveMaxLag + 1).fill(1);
  }

  const acf: number[] = [1]; // Lag 0 is always 1

  for (let lag = 1; lag <= effectiveMaxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += (values[i] - m) * (values[i + lag] - m);
    }
    acf.push(sum / ((n - lag) * v));
  }

  return acf;
}

/**
 * Compute integrated autocorrelation time (IAT)
 * Uses the initial monotone sequence estimator
 */
export function integratedAutocorrelationTime(values: number[]): number {
  const acf = autocorrelation(values);
  if (acf.length < 2) return 1;

  // Sum pairs of consecutive ACF values until they become negative
  let tau = 0;
  for (let i = 0; i < Math.floor(acf.length / 2); i++) {
    const pair = acf[2 * i] + (acf[2 * i + 1] ?? 0);
    if (pair <= 0) break;
    tau += pair;
  }

  // IAT = 1 + 2 * sum of ACF
  return Math.max(1, 1 + 2 * tau);
}

// ============================================================================
// EFFECTIVE SAMPLE SIZE
// ============================================================================

/**
 * Compute effective sample size (ESS) accounting for autocorrelation
 */
export function effectiveSampleSize(values: number[]): number {
  if (values.length < 3) return values.length;

  const iat = integratedAutocorrelationTime(values);
  return Math.max(1, Math.floor(values.length / iat));
}

/**
 * Compute ESS for multiple variables
 */
export function effectiveSampleSizeMultiple(samples: number[][]): number[] {
  if (samples.length === 0) return [];
  const numVars = samples[0].length;
  const essValues: number[] = [];

  for (let j = 0; j < numVars; j++) {
    const values = samples.map((row) => row[j]);
    essValues.push(effectiveSampleSize(values));
  }

  return essValues;
}

/**
 * Compute minimum ESS across all variables
 */
export function minEffectiveSampleSize(samples: number[][]): number {
  const essValues = effectiveSampleSizeMultiple(samples);
  return essValues.length > 0 ? Math.min(...essValues) : 0;
}

// ============================================================================
// GEWEKE DIAGNOSTIC
// ============================================================================

/**
 * Compute Geweke statistic (z-score)
 * Compares means of first portion (default 10%) and last portion (default 50%)
 */
export function gewekeStatistic(
  values: number[],
  firstPortion = 0.1,
  lastPortion = 0.5
): number {
  const n = values.length;
  if (n < 20) return 0;

  const firstEnd = Math.floor(n * firstPortion);
  const lastStart = Math.floor(n * (1 - lastPortion));

  if (firstEnd <= 0 || lastStart >= n || firstEnd >= lastStart) {
    return 0;
  }

  const firstSamples = values.slice(0, firstEnd);
  const lastSamples = values.slice(lastStart);

  const meanFirst = mean(firstSamples);
  const meanLast = mean(lastSamples);

  // Compute spectral density estimates at frequency 0
  // Use simple variance estimate (could use spectral density for more accuracy)
  const varFirst = variance(firstSamples, meanFirst);
  const varLast = variance(lastSamples, meanLast);

  const se = Math.sqrt(varFirst / firstSamples.length + varLast / lastSamples.length);
  if (se === 0) return 0;

  return (meanFirst - meanLast) / se;
}

/**
 * Compute Geweke statistics for multiple variables
 */
export function gewekeStatisticMultiple(samples: number[][]): number[] {
  if (samples.length === 0) return [];
  const numVars = samples[0].length;
  const stats: number[] = [];

  for (let j = 0; j < numVars; j++) {
    const values = samples.map((row) => row[j]);
    stats.push(gewekeStatistic(values));
  }

  return stats;
}

/**
 * Aggregate Geweke statistic across variables
 */
export function aggregateGewekeStatistic(samples: number[][]): number {
  const stats = gewekeStatisticMultiple(samples);
  if (stats.length === 0) return 0;

  // Use root mean square of individual statistics
  const sumSquares = stats.reduce((sum, s) => sum + s * s, 0);
  return Math.sqrt(sumSquares / stats.length);
}

// ============================================================================
// R-HAT (GELMAN-RUBIN) DIAGNOSTIC
// ============================================================================

/**
 * Compute R-hat (potential scale reduction factor) for single chain
 * Uses split-chain method for single chain case
 */
export function rHatSingleChain(values: number[]): number {
  const n = values.length;
  if (n < 4) return 1;

  // Split chain in half
  const mid = Math.floor(n / 2);
  const chain1 = values.slice(0, mid);
  const chain2 = values.slice(mid);

  return rHatMultipleChains([chain1, chain2]);
}

/**
 * Compute R-hat for multiple chains
 */
export function rHatMultipleChains(chains: number[][]): number {
  const m = chains.length;
  if (m < 2) return 1;

  const n = Math.min(...chains.map((c) => c.length));
  if (n < 2) return 1;

  // Truncate chains to same length
  const truncatedChains = chains.map((c) => c.slice(0, n));

  // Compute within-chain variance
  const withinVars = truncatedChains.map((c) => variance(c));
  const W = mean(withinVars);

  // Compute between-chain variance
  const chainMeans = truncatedChains.map((c) => mean(c));
  const grandMean = mean(chainMeans);
  const B = (n / (m - 1)) * chainMeans.reduce((sum, cm) => sum + (cm - grandMean) ** 2, 0);

  if (W === 0) return 1;

  // Compute pooled variance estimate
  const varPlus = ((n - 1) / n) * W + (1 / n) * B;

  // R-hat
  return Math.sqrt(varPlus / W);
}

// ============================================================================
// MONTE CARLO STANDARD ERROR
// ============================================================================

/**
 * Compute Monte Carlo standard error (MCSE)
 */
export function mcse(values: number[]): number {
  const ess = effectiveSampleSize(values);
  if (ess <= 0) return 0;
  return stdDev(values) / Math.sqrt(ess);
}

/**
 * Compute MCSE for multiple variables
 */
export function mcseMultiple(samples: number[][]): number[] {
  if (samples.length === 0) return [];
  const numVars = samples[0].length;
  const mcseValues: number[] = [];

  for (let j = 0; j < numVars; j++) {
    const values = samples.map((row) => row[j]);
    mcseValues.push(mcse(values));
  }

  return mcseValues;
}

// ============================================================================
// CONVERGENCE ASSESSMENT
// ============================================================================

/**
 * Convergence result
 */
export interface ConvergenceResult {
  /** Has the chain converged? */
  converged: boolean;
  /** Reason for convergence/non-convergence */
  reason: string;
  /** Confidence in the assessment (0-1) */
  confidence: number;
}

/**
 * Assess convergence based on multiple diagnostics
 */
export function assessConvergence(
  samples: number[][],
  thresholds = {
    geweke: 2.0, // |z| < 2
    rHat: 1.1, // R-hat < 1.1
    essRatio: 0.1, // ESS > 10% of samples
  }
): ConvergenceResult {
  if (samples.length < 100) {
    return {
      converged: false,
      reason: 'Insufficient samples for convergence assessment',
      confidence: 0,
    };
  }

  const n = samples.length;
  const geweke = aggregateGewekeStatistic(samples);
  const ess = minEffectiveSampleSize(samples);
  const essRatio = ess / n;

  // For single chain, use split-chain R-hat
  const firstVar = samples.map((row) => row[0]);
  const rHat = rHatSingleChain(firstVar);

  const issues: string[] = [];

  if (Math.abs(geweke) > thresholds.geweke) {
    issues.push(`Geweke statistic (${geweke.toFixed(2)}) exceeds threshold`);
  }

  if (rHat > thresholds.rHat) {
    issues.push(`R-hat (${rHat.toFixed(3)}) exceeds threshold`);
  }

  if (essRatio < thresholds.essRatio) {
    issues.push(`ESS ratio (${(essRatio * 100).toFixed(1)}%) below threshold`);
  }

  if (issues.length === 0) {
    return {
      converged: true,
      reason: 'All diagnostics within acceptable thresholds',
      confidence: 0.95,
    };
  }

  return {
    converged: false,
    reason: issues.join('; '),
    confidence: 1 - issues.length / 3,
  };
}

// ============================================================================
// COMPLETE CONVERGENCE DIAGNOSTICS
// ============================================================================

/**
 * Compute complete convergence diagnostics
 */
export function computeConvergenceDiagnostics(
  samples: number[][],
  maxAutocorrLag = 50
): ConvergenceDiagnostics {
  if (samples.length < 10) {
    return {
      gewekeStatistic: 0,
      effectiveSampleSize: samples.length,
      rHat: 1,
      hasConverged: false,
    };
  }

  // Aggregate Geweke statistic
  const geweke = aggregateGewekeStatistic(samples);

  // Minimum ESS across variables
  const ess = minEffectiveSampleSize(samples);

  // R-hat (using first variable with split chain)
  const firstVar = samples.map((row) => row[0]);
  const rHat = rHatSingleChain(firstVar);

  // Autocorrelation (first variable)
  const autocorr = autocorrelation(firstVar, maxAutocorrLag);

  // MCSE
  const mcseValues = mcseMultiple(samples);

  // Assess convergence
  const assessment = assessConvergence(samples);

  return {
    gewekeStatistic: geweke,
    effectiveSampleSize: ess,
    rHat,
    hasConverged: assessment.converged,
    autocorrelation: autocorr,
    mcse: mcseValues,
  };
}

// ============================================================================
// TRACE DIAGNOSTICS
// ============================================================================

/**
 * Trace statistics for a single variable
 */
export interface TraceStats {
  /** Variable name */
  name: string;
  /** Running mean at each point */
  runningMean: number[];
  /** Running variance at each point */
  runningVariance: number[];
  /** Has trace stabilized? */
  stabilized: boolean;
  /** Point at which trace stabilized (-1 if not) */
  stabilizationPoint: number;
}

/**
 * Compute trace statistics
 */
export function traceStatistics(values: number[], name: string): TraceStats {
  if (values.length === 0) {
    return {
      name,
      runningMean: [],
      runningVariance: [],
      stabilized: false,
      stabilizationPoint: -1,
    };
  }

  const n = values.length;
  const runningMean: number[] = [];
  const runningVariance: number[] = [];

  let sum = 0;
  let sumSquares = 0;

  for (let i = 0; i < n; i++) {
    sum += values[i];
    sumSquares += values[i] ** 2;
    const m = sum / (i + 1);
    runningMean.push(m);
    runningVariance.push(i > 0 ? (sumSquares - sum ** 2 / (i + 1)) / i : 0);
  }

  // Check stabilization (mean changes less than 1% in last 20% of samples)
  let stabilized = false;
  let stabilizationPoint = -1;

  if (n >= 100) {
    const checkStart = Math.floor(n * 0.8);
    const finalMean = runningMean[n - 1];

    for (let i = checkStart; i < n; i++) {
      const relChange = Math.abs((runningMean[i] - finalMean) / (finalMean || 1));
      if (relChange < 0.01) {
        stabilized = true;
        stabilizationPoint = i;
        break;
      }
    }
  }

  return {
    name,
    runningMean,
    runningVariance,
    stabilized,
    stabilizationPoint,
  };
}

// ============================================================================
// DIAGNOSTIC SUMMARY
// ============================================================================

/**
 * Comprehensive diagnostic summary
 */
export interface DiagnosticSummary {
  /** Number of samples */
  totalSamples: number;
  /** Effective sample size (minimum across variables) */
  effectiveSampleSize: number;
  /** ESS ratio (ESS / total samples) */
  essRatio: number;
  /** Aggregate Geweke statistic */
  gewekeStatistic: number;
  /** R-hat value */
  rHat: number;
  /** Has converged */
  converged: boolean;
  /** Convergence confidence */
  confidence: number;
  /** Issues found */
  issues: string[];
  /** Recommendations */
  recommendations: string[];
}

/**
 * Generate comprehensive diagnostic summary
 */
export function generateDiagnosticSummary(samples: number[][]): DiagnosticSummary {
  const n = samples.length;
  const ess = minEffectiveSampleSize(samples);
  const essRatio = n > 0 ? ess / n : 0;
  const geweke = aggregateGewekeStatistic(samples);
  const firstVar = samples.length > 0 ? samples.map((row) => row[0]) : [];
  const rHat = firstVar.length > 0 ? rHatSingleChain(firstVar) : 1;
  const assessment = assessConvergence(samples);

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (n < 1000) {
    issues.push('Low sample count');
    recommendations.push(`Consider increasing to at least 1000 iterations (currently ${n})`);
  }

  if (essRatio < 0.1) {
    issues.push('Low effective sample size ratio');
    recommendations.push('Increase thinning interval or run more iterations');
  }

  if (Math.abs(geweke) > 2) {
    issues.push('Chain not stationary');
    recommendations.push('Increase burn-in period');
  }

  if (rHat > 1.1) {
    issues.push('Chain not mixed well');
    recommendations.push('Run longer or use better initial values');
  }

  return {
    totalSamples: n,
    effectiveSampleSize: ess,
    essRatio,
    gewekeStatistic: geweke,
    rHat,
    converged: assessment.converged,
    confidence: assessment.confidence,
    issues,
    recommendations,
  };
}
