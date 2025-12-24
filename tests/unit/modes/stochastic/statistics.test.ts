/**
 * Statistics Module Unit Tests - Phase 12 Sprint 5
 *
 * Tests for statistical analysis functions.
 */

import { describe, it, expect } from 'vitest';
import {
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
  summarizePosterior,
  summarizeAllPosteriors,
  probExceedsThreshold,
  probInRange,
  probAExceedsB,
  histogram,
  kde,
  estimateESS,
  mcse,
} from '../../../../src/modes/stochastic/analysis/statistics.js';

describe('Descriptive Statistics', () => {
  describe('mean()', () => {
    it('should compute mean correctly', () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
      expect(mean([10])).toBe(10);
      expect(mean([0, 0, 0])).toBe(0);
    });

    it('should return 0 for empty array', () => {
      expect(mean([])).toBe(0);
    });
  });

  describe('variance()', () => {
    it('should compute unbiased variance', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const v = variance(values);
      expect(v).toBeCloseTo(4.571, 2);
    });

    it('should return 0 for single element', () => {
      expect(variance([5])).toBe(0);
    });

    it('should accept precomputed mean', () => {
      const values = [1, 2, 3, 4, 5];
      const m = mean(values);
      expect(variance(values, m)).toBe(variance(values));
    });
  });

  describe('stdDev()', () => {
    it('should be square root of variance', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      expect(stdDev(values)).toBeCloseTo(Math.sqrt(variance(values)), 10);
    });
  });

  describe('median()', () => {
    it('should find median of odd-length array', () => {
      expect(median([1, 3, 5])).toBe(3);
      expect(median([5, 1, 3])).toBe(3);
    });

    it('should find median of even-length array', () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });

    it('should return 0 for empty array', () => {
      expect(median([])).toBe(0);
    });
  });

  describe('percentile()', () => {
    it('should compute percentiles correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(percentile(values, 0)).toBe(1);
      expect(percentile(values, 50)).toBeCloseTo(5.5, 1);
      expect(percentile(values, 100)).toBe(10);
    });

    it('should throw for invalid percentile', () => {
      expect(() => percentile([1, 2, 3], -10)).toThrow();
      expect(() => percentile([1, 2, 3], 110)).toThrow();
    });
  });

  describe('percentiles()', () => {
    it('should compute multiple percentiles', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = percentiles(values, [25, 50, 75]);

      expect(result[25]).toBeDefined();
      expect(result[50]).toBeDefined();
      expect(result[75]).toBeDefined();
    });
  });

  describe('skewness()', () => {
    it('should return 0 for symmetric data', () => {
      const symmetric = [-2, -1, 0, 1, 2];
      expect(skewness(symmetric)).toBeCloseTo(0, 5);
    });

    it('should return 0 for insufficient data', () => {
      expect(skewness([1, 2])).toBe(0);
    });
  });

  describe('kurtosis()', () => {
    it('should return 0 for insufficient data', () => {
      expect(kurtosis([1, 2, 3])).toBe(0);
    });

    it('should compute kurtosis for normal-ish data', () => {
      const values = Array.from({ length: 1000 }, (_, i) => Math.sin(i));
      const k = kurtosis(values);
      expect(k).toBeDefined();
    });
  });

  describe('mode()', () => {
    it('should find most frequent bin', () => {
      // Many values clustered around 5
      const values = [5, 5, 5, 5, 5, 1, 10, 15, 20];
      const m = mode(values, 10);
      // Mode returns bin center, not exact value
      expect(m).toBeGreaterThan(0);
      expect(m).toBeLessThan(10);
    });

    it('should return single value for single element', () => {
      expect(mode([42])).toBe(42);
    });
  });
});

describe('Correlation and Covariance', () => {
  describe('covariance()', () => {
    it('should compute covariance', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      expect(covariance(x, y)).toBeCloseTo(5, 1);
    });

    it('should return 0 for different length arrays', () => {
      expect(covariance([1, 2], [1, 2, 3])).toBe(0);
    });
  });

  describe('correlation()', () => {
    it('should compute Pearson correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      expect(correlation(x, y)).toBeCloseTo(1, 5);
    });

    it('should return 0 for uncorrelated data', () => {
      // Sine and cosine at different phases
      const x = [1, 0, -1, 0];
      const y = [0, 1, 0, -1];
      expect(correlation(x, y)).toBeCloseTo(0, 5);
    });

    it('should return -1 for perfectly negative correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [5, 4, 3, 2, 1];
      expect(correlation(x, y)).toBeCloseTo(-1, 5);
    });
  });

  describe('correlationMatrix()', () => {
    it('should compute correlation matrix', () => {
      const samples = [
        [1, 2],
        [2, 4],
        [3, 6],
        [4, 8],
      ];
      const matrix = correlationMatrix(samples);

      expect(matrix).toHaveLength(2);
      expect(matrix[0][0]).toBe(1);
      expect(matrix[1][1]).toBe(1);
      expect(matrix[0][1]).toBeCloseTo(1, 5);
    });

    it('should return empty for empty input', () => {
      expect(correlationMatrix([])).toEqual([]);
    });
  });

  describe('covarianceMatrix()', () => {
    it('should compute covariance matrix', () => {
      const samples = [
        [1, 2],
        [2, 4],
        [3, 6],
        [4, 8],
      ];
      const matrix = covarianceMatrix(samples);

      expect(matrix).toHaveLength(2);
      expect(matrix[0][0]).toBeGreaterThan(0);
    });
  });
});

describe('Credible Intervals', () => {
  describe('equalTailedInterval()', () => {
    it('should compute 95% equal-tailed interval', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i / 1000);
      const interval = equalTailedInterval(values, 0.95);

      expect(interval.type).toBe('equal-tailed');
      expect(interval.probability).toBe(0.95);
      expect(interval.lower).toBeLessThan(interval.upper);
      expect(interval.lower).toBeCloseTo(0.025, 1);
      expect(interval.upper).toBeCloseTo(0.975, 1);
    });
  });

  describe('hpdInterval()', () => {
    it('should compute HPD interval', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i / 1000);
      const interval = hpdInterval(values, 0.95);

      expect(interval.type).toBe('hpd');
      expect(interval.probability).toBe(0.95);
      expect(interval.lower).toBeLessThan(interval.upper);
    });

    it('should return 0-0 for empty array', () => {
      const interval = hpdInterval([]);
      expect(interval.lower).toBe(0);
      expect(interval.upper).toBe(0);
    });
  });
});

describe('Sample Statistics', () => {
  describe('computeSampleStatistics()', () => {
    it('should compute comprehensive statistics', () => {
      const samples = Array.from({ length: 100 }, () => [Math.random(), Math.random()]);
      const stats = computeSampleStatistics(samples);

      expect(stats.mean).toHaveLength(2);
      expect(stats.variance).toHaveLength(2);
      expect(stats.stdDev).toHaveLength(2);
      expect(stats.percentiles[50]).toHaveLength(2);
      expect(stats.correlations).toHaveLength(2);
    });

    it('should return empty stats for empty input', () => {
      const stats = computeSampleStatistics([]);
      expect(stats.mean).toEqual([]);
      expect(stats.variance).toEqual([]);
    });
  });
});

describe('Posterior Analysis', () => {
  describe('summarizePosterior()', () => {
    it('should produce posterior summary', () => {
      const values = Array.from({ length: 1000 }, () => Math.random() * 10);
      const summary = summarizePosterior(values, 'test_var');

      expect(summary.name).toBe('test_var');
      expect(summary.mean).toBeGreaterThan(0);
      expect(summary.stdDev).toBeGreaterThan(0);
      expect(summary.median).toBeGreaterThan(0);
      expect(summary.ci95).toBeDefined();
      expect(summary.hpd95).toBeDefined();
      expect(summary.ess).toBeGreaterThan(0);
    });
  });

  describe('summarizeAllPosteriors()', () => {
    it('should summarize multiple variables', () => {
      const samples = Array.from({ length: 100 }, () => [Math.random(), Math.random() * 10]);
      const summaries = summarizeAllPosteriors(samples, ['var1', 'var2']);

      expect(summaries).toHaveLength(2);
      expect(summaries[0].name).toBe('var1');
      expect(summaries[1].name).toBe('var2');
    });
  });

  describe('estimateESS()', () => {
    it('should estimate effective sample size', () => {
      const values = Array.from({ length: 1000 }, () => Math.random());
      const ess = estimateESS(values);

      expect(ess).toBeGreaterThan(0);
      expect(ess).toBeLessThanOrEqual(values.length);
    });

    it('should return length for very short arrays', () => {
      expect(estimateESS([1, 2])).toBe(2);
    });
  });

  describe('mcse()', () => {
    it('should compute Monte Carlo standard error', () => {
      const values = Array.from({ length: 1000 }, () => Math.random());
      const ess = estimateESS(values);
      const error = mcse(values, ess);

      expect(error).toBeGreaterThan(0);
    });
  });
});

describe('Probability Calculations', () => {
  describe('probExceedsThreshold()', () => {
    it('should estimate probability of exceeding threshold', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(probExceedsThreshold(values, 5)).toBe(0.5);
      expect(probExceedsThreshold(values, 0)).toBe(1);
      expect(probExceedsThreshold(values, 10)).toBe(0);
    });

    it('should return 0 for empty array', () => {
      expect(probExceedsThreshold([], 5)).toBe(0);
    });
  });

  describe('probInRange()', () => {
    it('should estimate probability of being in range', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(probInRange(values, 3, 7)).toBe(0.5);
    });
  });

  describe('probAExceedsB()', () => {
    it('should estimate probability A > B', () => {
      const a = [5, 6, 7, 8, 9];
      const b = [1, 2, 3, 4, 5];
      expect(probAExceedsB(a, b)).toBe(1);
    });

    it('should return 0 for different length arrays', () => {
      expect(probAExceedsB([1, 2], [1])).toBe(0);
    });
  });
});

describe('Density Estimation', () => {
  describe('histogram()', () => {
    it('should create histogram bins', () => {
      const values = Array.from({ length: 1000 }, () => Math.random());
      const bins = histogram(values, 10);

      expect(bins).toHaveLength(10);
      bins.forEach((bin) => {
        expect(bin.center).toBeDefined();
        expect(bin.count).toBeGreaterThanOrEqual(0);
        expect(bin.density).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return empty for empty input', () => {
      expect(histogram([])).toEqual([]);
    });

    it('should handle single value', () => {
      const bins = histogram([5]);
      expect(bins).toHaveLength(1);
      expect(bins[0].count).toBe(1);
    });
  });

  describe('kde()', () => {
    it('should compute kernel density estimate', () => {
      const values = Array.from({ length: 100 }, () => Math.random());
      const result = kde(values, 50);

      expect(result).toHaveLength(50);
      result.forEach((point) => {
        expect(point.x).toBeDefined();
        expect(point.density).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return empty for empty input', () => {
      expect(kde([])).toEqual([]);
    });
  });
});
