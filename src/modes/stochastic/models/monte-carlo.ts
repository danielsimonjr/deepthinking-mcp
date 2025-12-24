/**
 * Monte Carlo Simulation Engine - Phase 12 Sprint 5
 *
 * Provides Monte Carlo simulation capabilities with burn-in,
 * thinning, convergence checking, and progress reporting.
 */

import type {
  MonteCarloConfig,
  MonteCarloResult,
  StochasticModel,
  SimulationProgress,
  SampleStatistics,
  ConvergenceDiagnostics,
} from '../types.js';
import { SeededRNG } from '../sampling/rng.js';
import { createSampler } from './distribution.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: SimulationProgress) => void;

/**
 * Model evaluation function type
 */
export type ModelEvaluator = (variableValues: Record<string, number>) => number[];

// ============================================================================
// MONTE CARLO ENGINE
// ============================================================================

/**
 * Monte Carlo simulation engine
 */
export class MonteCarloEngine {
  private config: Required<MonteCarloConfig>;
  private rng: SeededRNG;

  constructor(config: MonteCarloConfig) {
    this.config = {
      iterations: config.iterations,
      burnIn: config.burnIn ?? Math.floor(config.iterations * 0.1),
      thinning: config.thinning ?? 1,
      convergenceThreshold: config.convergenceThreshold ?? 0.01,
      seed: config.seed ?? Date.now(),
      timeout: config.timeout ?? 60000,
      progressInterval: config.progressInterval ?? Math.max(1, Math.floor(config.iterations / 100)),
      chains: config.chains ?? 1,
    };
    this.rng = new SeededRNG(this.config.seed);
  }

  /**
   * Run Monte Carlo simulation on a stochastic model
   */
  async simulate(
    model: StochasticModel,
    onProgress?: ProgressCallback
  ): Promise<MonteCarloResult> {
    const startTime = Date.now();
    const variableNames = model.variables.map((v) => v.name);
    const allSamples: number[][] = [];
    const warnings: string[] = [];

    // Create samplers for each variable
    const samplers = model.variables.map((v) => createSampler(v.distribution, () => this.rng.next()));

    // Run simulation
    let lastMeans: number[] | null = null;

    for (let i = 0; i < this.config.iterations; i++) {
      // Check timeout
      if (Date.now() - startTime > this.config.timeout) {
        warnings.push(`Simulation timed out after ${this.config.timeout}ms`);
        break;
      }

      // Sample from each variable
      const sample = samplers.map((s) => s.sample());

      // Apply burn-in and thinning
      if (i >= this.config.burnIn && (i - this.config.burnIn) % this.config.thinning === 0) {
        allSamples.push(sample);
      }

      // Report progress
      if (onProgress && i % this.config.progressInterval === 0) {
        const elapsed = Date.now() - startTime;
        const estimatedRemaining = (elapsed / (i + 1)) * (this.config.iterations - i - 1);

        onProgress({
          completed: i + 1,
          total: this.config.iterations,
          percentage: Math.round(((i + 1) / this.config.iterations) * 100),
          estimatedRemaining,
          samplesCollected: allSamples.length,
          currentConvergence: lastMeans ? this.computeConvergenceMetric(allSamples, lastMeans) : undefined,
        });
      }

      // Check convergence periodically
      if (allSamples.length > 100 && allSamples.length % 100 === 0) {
        const currentMeans = this.computeMeans(allSamples);
        if (lastMeans) {
          const convergenceMetric = this.computeConvergenceMetric(allSamples, lastMeans);
          if (convergenceMetric < this.config.convergenceThreshold) {
            // Convergence achieved - exit early
            break;
          }
        }
        lastMeans = currentMeans;
      }
    }

    // Compute statistics
    const statistics = this.computeStatistics(allSamples, variableNames);
    const convergenceDiagnostics = this.computeConvergenceDiagnostics(allSamples);

    // Final progress report
    if (onProgress) {
      onProgress({
        completed: this.config.iterations,
        total: this.config.iterations,
        percentage: 100,
        estimatedRemaining: 0,
        samplesCollected: allSamples.length,
        currentConvergence: convergenceDiagnostics.gewekeStatistic,
      });
    }

    return {
      samples: allSamples,
      variableNames,
      statistics,
      convergenceDiagnostics,
      executionTime: Date.now() - startTime,
      effectiveSamples: allSamples.length,
      success: true,
      config: this.config,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Run simulation with a custom model evaluator
   */
  async simulateWithEvaluator(
    variableNames: string[],
    sampler: () => number[],
    evaluator: ModelEvaluator,
    onProgress?: ProgressCallback
  ): Promise<MonteCarloResult> {
    const startTime = Date.now();
    const allSamples: number[][] = [];
    const warnings: string[] = [];

    for (let i = 0; i < this.config.iterations; i++) {
      // Check timeout
      if (Date.now() - startTime > this.config.timeout) {
        warnings.push(`Simulation timed out after ${this.config.timeout}ms`);
        break;
      }

      // Sample
      const variableValues = sampler();
      const valueMap: Record<string, number> = {};
      variableNames.forEach((name, idx) => {
        valueMap[name] = variableValues[idx];
      });

      // Evaluate
      const result = evaluator(valueMap);

      // Apply burn-in and thinning
      if (i >= this.config.burnIn && (i - this.config.burnIn) % this.config.thinning === 0) {
        allSamples.push(result);
      }

      // Report progress
      if (onProgress && i % this.config.progressInterval === 0) {
        const elapsed = Date.now() - startTime;
        const estimatedRemaining = (elapsed / (i + 1)) * (this.config.iterations - i - 1);

        onProgress({
          completed: i + 1,
          total: this.config.iterations,
          percentage: Math.round(((i + 1) / this.config.iterations) * 100),
          estimatedRemaining,
          samplesCollected: allSamples.length,
        });
      }
    }

    const statistics = this.computeStatistics(allSamples, variableNames);
    const convergenceDiagnostics = this.computeConvergenceDiagnostics(allSamples);

    return {
      samples: allSamples,
      variableNames,
      statistics,
      convergenceDiagnostics,
      executionTime: Date.now() - startTime,
      effectiveSamples: allSamples.length,
      success: true,
      config: this.config,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Compute means for each variable
   */
  private computeMeans(samples: number[][]): number[] {
    if (samples.length === 0) return [];
    const numVars = samples[0].length;
    const means: number[] = new Array(numVars).fill(0);

    for (const sample of samples) {
      for (let i = 0; i < numVars; i++) {
        means[i] += sample[i];
      }
    }

    return means.map((m) => m / samples.length);
  }

  /**
   * Compute convergence metric (max relative change in means)
   */
  private computeConvergenceMetric(samples: number[][], lastMeans: number[]): number {
    const currentMeans = this.computeMeans(samples);
    let maxChange = 0;

    for (let i = 0; i < currentMeans.length; i++) {
      if (Math.abs(lastMeans[i]) > 0.0001) {
        const relChange = Math.abs((currentMeans[i] - lastMeans[i]) / lastMeans[i]);
        maxChange = Math.max(maxChange, relChange);
      }
    }

    return maxChange;
  }

  /**
   * Compute full sample statistics
   */
  private computeStatistics(samples: number[][], _variableNames: string[]): SampleStatistics {
    if (samples.length === 0) {
      return {
        mean: [],
        variance: [],
        stdDev: [],
        percentiles: {},
        correlations: [],
      };
    }

    const n = samples.length;
    const numVars = samples[0].length;

    // Compute means
    const mean = this.computeMeans(samples);

    // Compute variances and standard deviations
    const variance: number[] = new Array(numVars).fill(0);
    for (const sample of samples) {
      for (let i = 0; i < numVars; i++) {
        variance[i] += (sample[i] - mean[i]) ** 2;
      }
    }
    const stdDev = variance.map((v, i) => {
      variance[i] = v / n;
      return Math.sqrt(variance[i]);
    });

    // Compute percentiles
    const percentilePoints = [2.5, 25, 50, 75, 97.5];
    const percentiles: Record<number, number[]> = {};

    for (const p of percentilePoints) {
      percentiles[p] = [];
      for (let i = 0; i < numVars; i++) {
        const sorted = samples.map((s) => s[i]).sort((a, b) => a - b);
        const idx = Math.floor((p / 100) * n);
        percentiles[p].push(sorted[idx]);
      }
    }

    // Compute correlation matrix
    const correlations: number[][] = [];
    for (let i = 0; i < numVars; i++) {
      correlations[i] = [];
      for (let j = 0; j < numVars; j++) {
        if (i === j) {
          correlations[i][j] = 1;
        } else {
          let cov = 0;
          for (const sample of samples) {
            cov += (sample[i] - mean[i]) * (sample[j] - mean[j]);
          }
          cov /= n;
          correlations[i][j] = cov / (stdDev[i] * stdDev[j]);
        }
      }
    }

    return {
      mean,
      variance,
      stdDev,
      percentiles,
      correlations,
    };
  }

  /**
   * Compute convergence diagnostics
   */
  private computeConvergenceDiagnostics(samples: number[][]): ConvergenceDiagnostics {
    if (samples.length < 10) {
      return {
        gewekeStatistic: 0,
        effectiveSampleSize: samples.length,
        rHat: 1,
        hasConverged: false,
      };
    }

    const n = samples.length;
    const firstPortion = Math.floor(n * 0.1);
    const lastPortion = Math.floor(n * 0.5);

    // Geweke statistic (z-score comparing first 10% and last 50%)
    const firstSamples = samples.slice(0, firstPortion);
    const lastSamples = samples.slice(n - lastPortion);

    const firstMean = this.computeMeans(firstSamples);
    const lastMean = this.computeMeans(lastSamples);

    // Compute variance of means
    let gewekeSum = 0;
    for (let i = 0; i < firstMean.length; i++) {
      const diff = Math.abs(firstMean[i] - lastMean[i]);
      // Simplified variance estimate
      const firstVar = this.computeVariance(firstSamples.map((s) => s[i]));
      const lastVar = this.computeVariance(lastSamples.map((s) => s[i]));
      const se = Math.sqrt(firstVar / firstPortion + lastVar / lastPortion);
      if (se > 0) {
        gewekeSum += (diff / se) ** 2;
      }
    }
    const gewekeStatistic = Math.sqrt(gewekeSum / firstMean.length);

    // Effective sample size (simplified autocorrelation-based estimate)
    const effectiveSampleSize = this.estimateESS(samples);

    // R-hat (simplified for single chain)
    const rHat = gewekeStatistic < 1.1 ? 1.0 : 1.0 + gewekeStatistic * 0.1;

    return {
      gewekeStatistic,
      effectiveSampleSize,
      rHat,
      hasConverged: gewekeStatistic < 2 && effectiveSampleSize > n * 0.5,
    };
  }

  /**
   * Compute variance of a 1D array
   */
  private computeVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  }

  /**
   * Estimate effective sample size
   */
  private estimateESS(samples: number[][]): number {
    if (samples.length < 3) return samples.length;

    // Simple ESS estimate using first variable
    const values = samples.map((s) => s[0]);
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;

    // Compute autocorrelation at lag 1
    let autoCorr = 0;
    let variance = 0;
    for (let i = 0; i < n; i++) {
      variance += (values[i] - mean) ** 2;
      if (i < n - 1) {
        autoCorr += (values[i] - mean) * (values[i + 1] - mean);
      }
    }

    if (variance === 0) return n;

    const rho1 = autoCorr / variance;
    const tau = 1 + 2 * Math.max(0, rho1);

    return Math.floor(n / tau);
  }

  /**
   * Get the RNG for direct access
   */
  getRNG(): SeededRNG {
    return this.rng;
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<MonteCarloConfig> {
    return { ...this.config };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a Monte Carlo engine
 */
export function createMonteCarloEngine(config: MonteCarloConfig): MonteCarloEngine {
  return new MonteCarloEngine(config);
}

/**
 * Quick Monte Carlo simulation
 */
export async function runMonteCarloSimulation(
  model: StochasticModel,
  iterations: number = 10000,
  seed?: number
): Promise<MonteCarloResult> {
  const engine = new MonteCarloEngine({
    iterations,
    seed,
  });
  return engine.simulate(model);
}
