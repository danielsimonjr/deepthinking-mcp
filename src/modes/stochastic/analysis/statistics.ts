/**
 * Statistical Analysis Module - Phase 12 Sprint 5
 *
 * Provides statistical analysis utilities for Monte Carlo simulation results.
 * Includes descriptive statistics, credible intervals, and posterior analysis.
 */

import type { SampleStatistics } from '../types.js';

// ============================================================================
// DESCRIPTIVE STATISTICS
// ============================================================================

/**
 * Compute sample mean
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Compute sample variance (unbiased)
 */
export function variance(values: number[], sampleMean?: number): number {
  if (values.length < 2) return 0;
  const m = sampleMean ?? mean(values);
  const sumSquares = values.reduce((sum, v) => sum + (v - m) ** 2, 0);
  return sumSquares / (values.length - 1);
}

/**
 * Compute sample standard deviation
 */
export function stdDev(values: number[], sampleMean?: number): number {
  return Math.sqrt(variance(values, sampleMean));
}

/**
 * Compute sample median
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Compute sample percentile
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  if (p < 0 || p > 100) throw new Error('Percentile must be between 0 and 100');

  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);

  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

/**
 * Compute multiple percentiles
 */
export function percentiles(values: number[], ps: number[]): Record<number, number> {
  const result: Record<number, number> = {};
  for (const p of ps) {
    result[p] = percentile(values, p);
  }
  return result;
}

/**
 * Compute sample skewness
 */
export function skewness(values: number[]): number {
  if (values.length < 3) return 0;
  const n = values.length;
  const m = mean(values);
  const s = stdDev(values, m);
  if (s === 0) return 0;

  const sum = values.reduce((acc, v) => acc + ((v - m) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sum;
}

/**
 * Compute sample kurtosis (excess kurtosis)
 */
export function kurtosis(values: number[]): number {
  if (values.length < 4) return 0;
  const n = values.length;
  const m = mean(values);
  const s = stdDev(values, m);
  if (s === 0) return 0;

  const sum = values.reduce((acc, v) => acc + ((v - m) / s) ** 4, 0);
  const rawKurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sum;
  const correction = (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  return rawKurtosis - correction;
}

/**
 * Compute sample mode (most frequent value in discretized bins)
 */
export function mode(values: number[], numBins = 20): number {
  if (values.length === 0) return 0;

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return min;

  const binWidth = (max - min) / numBins;
  const bins = new Array(numBins).fill(0);

  for (const v of values) {
    const binIdx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
    bins[binIdx]++;
  }

  const maxBin = bins.indexOf(Math.max(...bins));
  return min + (maxBin + 0.5) * binWidth;
}

// ============================================================================
// CORRELATION AND COVARIANCE
// ============================================================================

/**
 * Compute covariance between two variables
 */
export function covariance(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += (x[i] - meanX) * (y[i] - meanY);
  }
  return sum / (n - 1);
}

/**
 * Compute Pearson correlation coefficient
 */
export function correlation(x: number[], y: number[]): number {
  const cov = covariance(x, y);
  const sdX = stdDev(x);
  const sdY = stdDev(y);
  if (sdX === 0 || sdY === 0) return 0;
  return cov / (sdX * sdY);
}

/**
 * Compute correlation matrix for multiple variables
 */
export function correlationMatrix(samples: number[][]): number[][] {
  if (samples.length === 0) return [];
  const numVars = samples[0].length;
  const matrix: number[][] = [];

  // Extract columns
  const columns: number[][] = [];
  for (let j = 0; j < numVars; j++) {
    columns.push(samples.map((row) => row[j]));
  }

  // Compute correlations
  for (let i = 0; i < numVars; i++) {
    matrix[i] = [];
    for (let j = 0; j < numVars; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else if (j < i) {
        matrix[i][j] = matrix[j][i]; // Use symmetry
      } else {
        matrix[i][j] = correlation(columns[i], columns[j]);
      }
    }
  }

  return matrix;
}

/**
 * Compute covariance matrix for multiple variables
 */
export function covarianceMatrix(samples: number[][]): number[][] {
  if (samples.length === 0) return [];
  const numVars = samples[0].length;
  const matrix: number[][] = [];

  // Extract columns
  const columns: number[][] = [];
  for (let j = 0; j < numVars; j++) {
    columns.push(samples.map((row) => row[j]));
  }

  // Compute covariances
  for (let i = 0; i < numVars; i++) {
    matrix[i] = [];
    for (let j = 0; j < numVars; j++) {
      if (j < i) {
        matrix[i][j] = matrix[j][i]; // Use symmetry
      } else {
        matrix[i][j] = covariance(columns[i], columns[j]);
      }
    }
  }

  return matrix;
}

// ============================================================================
// CREDIBLE INTERVALS
// ============================================================================

/**
 * Credible interval type
 */
export interface CredibleInterval {
  /** Lower bound */
  lower: number;
  /** Upper bound */
  upper: number;
  /** Probability mass */
  probability: number;
  /** Interval type */
  type: 'equal-tailed' | 'hpd';
}

/**
 * Compute equal-tailed credible interval
 */
export function equalTailedInterval(values: number[], probability = 0.95): CredibleInterval {
  const alpha = 1 - probability;
  const lower = percentile(values, (alpha / 2) * 100);
  const upper = percentile(values, (1 - alpha / 2) * 100);
  return { lower, upper, probability, type: 'equal-tailed' };
}

/**
 * Compute highest posterior density (HPD) interval
 * Uses a simple algorithm that finds the narrowest interval
 */
export function hpdInterval(values: number[], probability = 0.95): CredibleInterval {
  if (values.length === 0) {
    return { lower: 0, upper: 0, probability, type: 'hpd' };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const credibleSize = Math.ceil(probability * n);

  let minWidth = Infinity;
  let bestLower = sorted[0];
  let bestUpper = sorted[credibleSize - 1];

  for (let i = 0; i <= n - credibleSize; i++) {
    const lower = sorted[i];
    const upper = sorted[i + credibleSize - 1];
    const width = upper - lower;
    if (width < minWidth) {
      minWidth = width;
      bestLower = lower;
      bestUpper = upper;
    }
  }

  return { lower: bestLower, upper: bestUpper, probability, type: 'hpd' };
}

// ============================================================================
// SAMPLE STATISTICS COMPUTATION
// ============================================================================

/**
 * Compute comprehensive sample statistics for Monte Carlo samples
 */
export function computeSampleStatistics(
  samples: number[][],
  percentilePoints: number[] = [2.5, 25, 50, 75, 97.5]
): SampleStatistics {
  if (samples.length === 0) {
    return {
      mean: [],
      variance: [],
      stdDev: [],
      percentiles: {},
      correlations: [],
    };
  }

  const numVars = samples[0].length;

  // Extract columns
  const columns: number[][] = [];
  for (let j = 0; j < numVars; j++) {
    columns.push(samples.map((row) => row[j]));
  }

  // Compute statistics for each variable
  const means = columns.map((col) => mean(col));
  const variances = columns.map((col, i) => variance(col, means[i]));
  const stdDevs = variances.map((v) => Math.sqrt(v));
  const skewnesses = columns.map((col) => skewness(col));
  const kurtoses = columns.map((col) => kurtosis(col));

  // Compute percentiles
  const percentilesResult: Record<number, number[]> = {};
  for (const p of percentilePoints) {
    percentilesResult[p] = columns.map((col) => percentile(col, p));
  }

  // Compute correlation matrix
  const correlations = correlationMatrix(samples);

  return {
    mean: means,
    variance: variances,
    stdDev: stdDevs,
    percentiles: percentilesResult,
    correlations,
    skewness: skewnesses,
    kurtosis: kurtoses,
  };
}

// ============================================================================
// POSTERIOR ANALYSIS
// ============================================================================

/**
 * Summary of a posterior distribution
 */
export interface PosteriorSummary {
  /** Variable name */
  name: string;
  /** Posterior mean */
  mean: number;
  /** Posterior standard deviation */
  stdDev: number;
  /** Posterior median */
  median: number;
  /** 95% credible interval (equal-tailed) */
  ci95: CredibleInterval;
  /** 95% HPD interval */
  hpd95: CredibleInterval;
  /** Monte Carlo standard error */
  mcse: number;
  /** Effective sample size */
  ess: number;
}

/**
 * Compute Monte Carlo standard error
 */
export function mcse(values: number[], ess: number): number {
  if (ess <= 0) return 0;
  return stdDev(values) / Math.sqrt(ess);
}

/**
 * Estimate effective sample size using autocorrelation
 */
export function estimateESS(values: number[]): number {
  if (values.length < 3) return values.length;

  const n = values.length;
  const m = mean(values);
  const v = variance(values, m);
  if (v === 0) return n;

  // Compute autocorrelation at lag 1
  let autoCorr = 0;
  for (let i = 0; i < n - 1; i++) {
    autoCorr += (values[i] - m) * (values[i + 1] - m);
  }
  autoCorr /= (n - 1) * v;

  // Estimate integrated autocorrelation time
  const tau = 1 + 2 * Math.max(0, autoCorr);

  return Math.max(1, Math.floor(n / tau));
}

/**
 * Summarize a posterior distribution from samples
 */
export function summarizePosterior(values: number[], name: string): PosteriorSummary {
  const ess = estimateESS(values);
  const m = mean(values);
  const sd = stdDev(values, m);

  return {
    name,
    mean: m,
    stdDev: sd,
    median: median(values),
    ci95: equalTailedInterval(values, 0.95),
    hpd95: hpdInterval(values, 0.95),
    mcse: mcse(values, ess),
    ess,
  };
}

/**
 * Summarize all posteriors from Monte Carlo samples
 */
export function summarizeAllPosteriors(
  samples: number[][],
  variableNames: string[]
): PosteriorSummary[] {
  if (samples.length === 0) return [];

  const summaries: PosteriorSummary[] = [];
  const numVars = samples[0].length;

  for (let j = 0; j < numVars; j++) {
    const values = samples.map((row) => row[j]);
    const name = variableNames[j] ?? `var_${j}`;
    summaries.push(summarizePosterior(values, name));
  }

  return summaries;
}

// ============================================================================
// PROBABILITY CALCULATIONS
// ============================================================================

/**
 * Estimate probability that a variable exceeds a threshold
 */
export function probExceedsThreshold(values: number[], threshold: number): number {
  if (values.length === 0) return 0;
  const count = values.filter((v) => v > threshold).length;
  return count / values.length;
}

/**
 * Estimate probability that a variable is in a range
 */
export function probInRange(values: number[], lower: number, upper: number): number {
  if (values.length === 0) return 0;
  const count = values.filter((v) => v >= lower && v <= upper).length;
  return count / values.length;
}

/**
 * Estimate probability that one variable exceeds another
 */
export function probAExceedsB(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) count++;
  }
  return count / a.length;
}

// ============================================================================
// DENSITY ESTIMATION
// ============================================================================

/**
 * Histogram bin
 */
export interface HistogramBin {
  /** Bin center */
  center: number;
  /** Bin count */
  count: number;
  /** Density (normalized count) */
  density: number;
}

/**
 * Compute histogram from samples
 */
export function histogram(values: number[], numBins = 30): HistogramBin[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return [{ center: min, count: values.length, density: 1 }];
  }

  const binWidth = (max - min) / numBins;
  const bins: HistogramBin[] = [];

  // Initialize bins
  for (let i = 0; i < numBins; i++) {
    bins.push({
      center: min + (i + 0.5) * binWidth,
      count: 0,
      density: 0,
    });
  }

  // Count values in each bin
  for (const v of values) {
    const binIdx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
    bins[binIdx].count++;
  }

  // Compute densities
  const n = values.length;
  for (const bin of bins) {
    bin.density = bin.count / (n * binWidth);
  }

  return bins;
}

/**
 * Kernel density estimate using Gaussian kernel
 */
export function kde(values: number[], numPoints = 100, bandwidth?: number): Array<{ x: number; density: number }> {
  if (values.length === 0) return [];

  const n = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Silverman's rule of thumb for bandwidth
  const h = bandwidth ?? 1.06 * stdDev(values) * Math.pow(n, -0.2);
  if (h === 0) {
    return [{ x: min, density: 1 }];
  }

  const result: Array<{ x: number; density: number }> = [];
  const step = (max - min) / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const x = min + i * step;
    let density = 0;

    for (const v of values) {
      const u = (x - v) / h;
      density += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
    }
    density /= n * h;

    result.push({ x, density });
  }

  return result;
}
