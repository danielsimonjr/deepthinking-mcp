/**
 * Convergence Diagnostics Unit Tests - Phase 12 Sprint 5
 *
 * Tests for convergence analysis functions.
 */

import { describe, it, expect } from 'vitest';
import {
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
  mcse,
  mcseMultiple,
  assessConvergence,
  computeConvergenceDiagnostics,
  traceStatistics,
  generateDiagnosticSummary,
} from '../../../../src/modes/stochastic/analysis/convergence.js';

describe('Autocorrelation Analysis', () => {
  describe('autocorrelation()', () => {
    it('should return [1] for single-element array', () => {
      expect(autocorrelation([5])).toEqual([1]);
    });

    it('should have lag-0 autocorrelation of 1', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const acf = autocorrelation(values);
      expect(acf[0]).toBe(1);
    });

    it('should decrease for random data', () => {
      const values = Array.from({ length: 100 }, () => Math.random());
      const acf = autocorrelation(values, 10);

      // ACF should generally decrease for random data
      expect(Math.abs(acf[5])).toBeLessThan(Math.abs(acf[0]));
    });

    it('should respect maxLag parameter', () => {
      const values = Array.from({ length: 100 }, (_, i) => i);
      const acf = autocorrelation(values, 5);
      expect(acf.length).toBe(6); // 0 through 5
    });
  });

  describe('integratedAutocorrelationTime()', () => {
    it('should be at least 1', () => {
      const values = Array.from({ length: 100 }, () => Math.random());
      expect(integratedAutocorrelationTime(values)).toBeGreaterThanOrEqual(1);
    });

    it('should be higher for correlated data', () => {
      // Create highly correlated data
      const correlated = [1];
      for (let i = 1; i < 100; i++) {
        correlated.push(correlated[i - 1] + 0.1 * Math.random());
      }

      const random = Array.from({ length: 100 }, () => Math.random());

      expect(integratedAutocorrelationTime(correlated)).toBeGreaterThan(
        integratedAutocorrelationTime(random)
      );
    });
  });
});

describe('Effective Sample Size', () => {
  describe('effectiveSampleSize()', () => {
    it('should be at most the sample size', () => {
      const values = Array.from({ length: 100 }, () => Math.random());
      expect(effectiveSampleSize(values)).toBeLessThanOrEqual(100);
    });

    it('should return length for very short arrays', () => {
      expect(effectiveSampleSize([1, 2])).toBe(2);
    });
  });

  describe('effectiveSampleSizeMultiple()', () => {
    it('should compute ESS for each variable', () => {
      const samples = Array.from({ length: 100 }, () => [Math.random(), Math.random()]);
      const ess = effectiveSampleSizeMultiple(samples);

      expect(ess).toHaveLength(2);
      ess.forEach((e) => expect(e).toBeGreaterThan(0));
    });

    it('should return empty for empty input', () => {
      expect(effectiveSampleSizeMultiple([])).toEqual([]);
    });
  });

  describe('minEffectiveSampleSize()', () => {
    it('should return minimum ESS across variables', () => {
      const samples = Array.from({ length: 100 }, () => [Math.random(), Math.random()]);
      const minESS = minEffectiveSampleSize(samples);
      const allESS = effectiveSampleSizeMultiple(samples);

      expect(minESS).toBe(Math.min(...allESS));
    });

    it('should return 0 for empty input', () => {
      expect(minEffectiveSampleSize([])).toBe(0);
    });
  });
});

describe('Geweke Diagnostic', () => {
  describe('gewekeStatistic()', () => {
    it('should return 0 for short arrays', () => {
      expect(gewekeStatistic(Array.from({ length: 10 }, () => Math.random()))).toBe(0);
    });

    it('should be near 0 for stationary data', () => {
      const stationary = Array.from({ length: 1000 }, () => Math.random());
      const stat = gewekeStatistic(stationary);
      expect(Math.abs(stat)).toBeLessThan(3); // z-score should be small
    });

    it('should detect non-stationarity', () => {
      // Create trending data
      const trending = Array.from({ length: 1000 }, (_, i) => i / 100);
      const stat = gewekeStatistic(trending);
      expect(Math.abs(stat)).toBeGreaterThan(1);
    });
  });

  describe('gewekeStatisticMultiple()', () => {
    it('should compute Geweke for each variable', () => {
      const samples = Array.from({ length: 1000 }, () => [Math.random(), Math.random()]);
      const stats = gewekeStatisticMultiple(samples);

      expect(stats).toHaveLength(2);
    });
  });

  describe('aggregateGewekeStatistic()', () => {
    it('should aggregate across variables', () => {
      const samples = Array.from({ length: 1000 }, () => [Math.random(), Math.random()]);
      const aggregate = aggregateGewekeStatistic(samples);

      expect(aggregate).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for empty input', () => {
      expect(aggregateGewekeStatistic([])).toBe(0);
    });
  });
});

describe('R-hat Diagnostic', () => {
  describe('rHatSingleChain()', () => {
    it('should return 1 for short chains', () => {
      expect(rHatSingleChain([1, 2, 3])).toBe(1);
    });

    it('should be near 1 for well-mixed chain', () => {
      const wellMixed = Array.from({ length: 1000 }, () => Math.random());
      expect(rHatSingleChain(wellMixed)).toBeCloseTo(1, 0);
    });
  });

  describe('rHatMultipleChains()', () => {
    it('should return 1 for single chain', () => {
      expect(rHatMultipleChains([[1, 2, 3]])).toBe(1);
    });

    it('should be near 1 for similar chains', () => {
      const chain1 = Array.from({ length: 500 }, () => Math.random());
      const chain2 = Array.from({ length: 500 }, () => Math.random());
      expect(rHatMultipleChains([chain1, chain2])).toBeCloseTo(1, 0);
    });

    it('should be higher for dissimilar chains', () => {
      const chain1 = Array.from({ length: 500 }, () => Math.random());
      const chain2 = Array.from({ length: 500 }, () => Math.random() + 10); // Different mean
      expect(rHatMultipleChains([chain1, chain2])).toBeGreaterThan(1.1);
    });
  });
});

describe('Monte Carlo Standard Error', () => {
  describe('mcse()', () => {
    it('should return non-negative value', () => {
      // Small sample should still return non-negative MCSE
      expect(mcse([1, 2, 3])).toBeGreaterThanOrEqual(0);
    });

    it('should compute MCSE correctly', () => {
      const values = Array.from({ length: 1000 }, () => Math.random());
      const error = mcse(values);
      expect(error).toBeGreaterThan(0);
    });
  });

  describe('mcseMultiple()', () => {
    it('should compute MCSE for each variable', () => {
      const samples = Array.from({ length: 1000 }, () => [Math.random(), Math.random()]);
      const errors = mcseMultiple(samples);

      expect(errors).toHaveLength(2);
      errors.forEach((e) => expect(e).toBeGreaterThanOrEqual(0));
    });
  });
});

describe('Convergence Assessment', () => {
  describe('assessConvergence()', () => {
    it('should report non-convergence for insufficient samples', () => {
      const samples = Array.from({ length: 50 }, () => [Math.random()]);
      const result = assessConvergence(samples);

      expect(result.converged).toBe(false);
      expect(result.reason).toContain('Insufficient');
    });

    it('should return valid result structure for good chains', () => {
      const samples = Array.from({ length: 2000 }, () => [Math.random()]);
      const result = assessConvergence(samples);

      // Check result has expected structure
      expect(result).toHaveProperty('converged');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should accept custom thresholds', () => {
      const samples = Array.from({ length: 500 }, () => [Math.random()]);
      const result = assessConvergence(samples, {
        geweke: 10,
        rHat: 2,
        essRatio: 0.01,
      });

      expect(result).toBeDefined();
    });
  });
});

describe('Complete Diagnostics', () => {
  describe('computeConvergenceDiagnostics()', () => {
    it('should handle small samples', () => {
      const samples = Array.from({ length: 5 }, () => [Math.random()]);
      const diagnostics = computeConvergenceDiagnostics(samples);

      expect(diagnostics.gewekeStatistic).toBe(0);
      expect(diagnostics.effectiveSampleSize).toBe(5);
      expect(diagnostics.hasConverged).toBe(false);
    });

    it('should compute all diagnostics for adequate samples', () => {
      const samples = Array.from({ length: 1000 }, () => [Math.random()]);
      const diagnostics = computeConvergenceDiagnostics(samples);

      expect(diagnostics.gewekeStatistic).toBeDefined();
      expect(diagnostics.effectiveSampleSize).toBeGreaterThan(0);
      expect(diagnostics.rHat).toBeDefined();
      expect(diagnostics.autocorrelation).toBeDefined();
      expect(diagnostics.mcse).toBeDefined();
    });
  });
});

describe('Trace Diagnostics', () => {
  describe('traceStatistics()', () => {
    it('should compute running statistics', () => {
      const values = Array.from({ length: 200 }, (_, i) => i + Math.random());
      const trace = traceStatistics(values, 'test');

      expect(trace.name).toBe('test');
      expect(trace.runningMean).toHaveLength(200);
      expect(trace.runningVariance).toHaveLength(200);
    });

    it('should handle empty array', () => {
      const trace = traceStatistics([], 'empty');
      expect(trace.runningMean).toEqual([]);
      expect(trace.stabilized).toBe(false);
    });

    it('should detect stabilization', () => {
      const stable = Array.from({ length: 200 }, () => 5 + 0.01 * Math.random());
      const trace = traceStatistics(stable, 'stable');

      // Should stabilize around 5
      expect(trace.runningMean[trace.runningMean.length - 1]).toBeCloseTo(5, 0);
    });
  });
});

describe('Diagnostic Summary', () => {
  describe('generateDiagnosticSummary()', () => {
    it('should generate comprehensive summary', () => {
      const samples = Array.from({ length: 1000 }, () => [Math.random()]);
      const summary = generateDiagnosticSummary(samples);

      expect(summary.totalSamples).toBe(1000);
      expect(summary.effectiveSampleSize).toBeGreaterThan(0);
      expect(summary.essRatio).toBeGreaterThan(0);
      expect(summary.gewekeStatistic).toBeDefined();
      expect(summary.rHat).toBeDefined();
      expect(summary.converged).toBeDefined();
      expect(summary.confidence).toBeDefined();
      expect(Array.isArray(summary.issues)).toBe(true);
      expect(Array.isArray(summary.recommendations)).toBe(true);
    });

    it('should flag low sample count', () => {
      const samples = Array.from({ length: 100 }, () => [Math.random()]);
      const summary = generateDiagnosticSummary(samples);

      expect(summary.issues).toContain('Low sample count');
    });
  });
});
