/**
 * Distribution Samplers Unit Tests - Phase 12 Sprint 5
 *
 * Tests for all distribution sampler classes.
 */

import { describe, it, expect } from 'vitest';
import {
  NormalSampler,
  UniformSampler,
  ExponentialSampler,
  PoissonSampler,
  BinomialSampler,
  CategoricalSampler,
  BetaSampler,
  GammaSampler,
  createSampler,
  sampleWithStatistics,
} from '../../../../src/modes/stochastic/models/distribution.js';
import { SeededRNG } from '../../../../src/modes/stochastic/sampling/rng.js';

describe('NormalSampler', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should create sampler with mean and stdDev', () => {
    const sampler = new NormalSampler(10, 2, rngFn);
    expect(sampler.getType()).toBe('normal');
    expect(sampler.getParameters()).toEqual({ mean: 10, stdDev: 2 });
  });

  it('should throw for non-positive stdDev', () => {
    expect(() => new NormalSampler(0, 0, rngFn)).toThrow('Standard deviation must be positive');
    expect(() => new NormalSampler(0, -1, rngFn)).toThrow('Standard deviation must be positive');
  });

  it('should sample values around mean', () => {
    const sampler = new NormalSampler(50, 5, rngFn);
    const samples = sampler.sampleMany(1000);

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(50, 0);
  });

  it('should use Box-Muller spare value', () => {
    const sampler = new NormalSampler(0, 1, rngFn);
    // First call generates two values, second uses the spare
    sampler.sample();
    sampler.sample();
    expect(sampler.sample()).toBeDefined();
  });
});

describe('UniformSampler', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should create sampler with min and max', () => {
    const sampler = new UniformSampler(0, 10, rngFn);
    expect(sampler.getType()).toBe('uniform');
    expect(sampler.getParameters()).toEqual({ min: 0, max: 10 });
  });

  it('should throw when min >= max', () => {
    expect(() => new UniformSampler(10, 5, rngFn)).toThrow('min must be less than max');
    expect(() => new UniformSampler(5, 5, rngFn)).toThrow('min must be less than max');
  });

  it('should sample values in range', () => {
    const sampler = new UniformSampler(5, 15, rngFn);
    const samples = sampler.sampleMany(1000);

    samples.forEach((s) => {
      expect(s).toBeGreaterThanOrEqual(5);
      expect(s).toBeLessThan(15);
    });
  });

  it('should have correct mean', () => {
    const sampler = new UniformSampler(0, 100, rngFn);
    const samples = sampler.sampleMany(10000);

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(50, 0);
  });
});

describe('ExponentialSampler', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should create sampler with rate', () => {
    const sampler = new ExponentialSampler(2, rngFn);
    expect(sampler.getType()).toBe('exponential');
    expect(sampler.getParameters()).toEqual({ rate: 2 });
  });

  it('should throw for non-positive rate', () => {
    expect(() => new ExponentialSampler(0, rngFn)).toThrow('Rate must be positive');
    expect(() => new ExponentialSampler(-1, rngFn)).toThrow('Rate must be positive');
  });

  it('should sample non-negative values', () => {
    const sampler = new ExponentialSampler(1, rngFn);
    const samples = sampler.sampleMany(1000);

    samples.forEach((s) => expect(s).toBeGreaterThanOrEqual(0));
  });

  it('should have correct mean (1/rate)', () => {
    const rate = 0.5;
    const sampler = new ExponentialSampler(rate, rngFn);
    const samples = sampler.sampleMany(10000);

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(1 / rate, 0);
  });
});

describe('PoissonSampler', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should create sampler with lambda', () => {
    const sampler = new PoissonSampler(5, rngFn);
    expect(sampler.getType()).toBe('poisson');
    expect(sampler.getParameters()).toEqual({ lambda: 5 });
  });

  it('should throw for non-positive lambda', () => {
    expect(() => new PoissonSampler(0, rngFn)).toThrow('Lambda must be positive');
  });

  it('should sample non-negative integers', () => {
    const sampler = new PoissonSampler(10, rngFn);
    const samples = sampler.sampleMany(1000);

    samples.forEach((s) => {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(s)).toBe(true);
    });
  });

  it('should use Knuth algorithm for small lambda', () => {
    const sampler = new PoissonSampler(5, rngFn); // lambda < 30
    const samples = sampler.sampleMany(1000);
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(5, 0);
  });

  it('should use normal approximation for large lambda', () => {
    const sampler = new PoissonSampler(50, rngFn); // lambda >= 30
    const samples = sampler.sampleMany(1000);
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    // Allow variance of 1 (for Poisson, variance = lambda)
    expect(mean).toBeCloseTo(50, 0);
  });
});

describe('BinomialSampler', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should create sampler with n and p', () => {
    const sampler = new BinomialSampler(10, 0.5, rngFn);
    expect(sampler.getType()).toBe('binomial');
    expect(sampler.getParameters()).toEqual({ n: 10, p: 0.5 });
  });

  it('should throw for invalid n', () => {
    expect(() => new BinomialSampler(0, 0.5, rngFn)).toThrow('n must be a positive integer');
    expect(() => new BinomialSampler(5.5, 0.5, rngFn)).toThrow('n must be a positive integer');
  });

  it('should throw for invalid p', () => {
    expect(() => new BinomialSampler(10, -0.1, rngFn)).toThrow('p must be between 0 and 1');
    expect(() => new BinomialSampler(10, 1.5, rngFn)).toThrow('p must be between 0 and 1');
  });

  it('should sample integers between 0 and n', () => {
    const n = 20;
    const sampler = new BinomialSampler(n, 0.5, rngFn);
    const samples = sampler.sampleMany(1000);

    samples.forEach((s) => {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(n);
      expect(Number.isInteger(s)).toBe(true);
    });
  });

  it('should have correct mean (n*p)', () => {
    const n = 100;
    const p = 0.3;
    const sampler = new BinomialSampler(n, p, rngFn);
    const samples = sampler.sampleMany(5000);

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(n * p, 0);
  });
});

describe('CategoricalSampler', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should create sampler with probabilities', () => {
    const probs = { a: 0.3, b: 0.3, c: 0.4 };
    const sampler = new CategoricalSampler(probs, rngFn);
    expect(sampler.getType()).toBe('categorical');
    expect(sampler.getParameters()).toEqual(probs);
  });

  it('should throw if probabilities do not sum to 1', () => {
    expect(() => new CategoricalSampler({ a: 0.3, b: 0.3 }, rngFn)).toThrow(
      'Probabilities must sum to 1'
    );
  });

  it('should return category indices', () => {
    const sampler = new CategoricalSampler({ a: 0.5, b: 0.5 }, rngFn);
    const samples = sampler.sampleMany(100);

    samples.forEach((s) => {
      expect([0, 1]).toContain(s);
    });
  });

  it('should return category names with sampleCategory', () => {
    const sampler = new CategoricalSampler({ heads: 0.5, tails: 0.5 }, rngFn);

    for (let i = 0; i < 100; i++) {
      expect(['heads', 'tails']).toContain(sampler.sampleCategory());
    }
  });

  it('should respect probability distribution', () => {
    const sampler = new CategoricalSampler({ rare: 0.1, common: 0.9 }, rngFn);
    const categories = sampler.sampleManyCategories(10000);

    const rareFraction = categories.filter((c) => c === 'rare').length / 10000;
    expect(rareFraction).toBeCloseTo(0.1, 1);
  });
});

describe('BetaSampler', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should create sampler with alpha and beta', () => {
    const sampler = new BetaSampler(2, 5, rngFn);
    expect(sampler.getType()).toBe('beta');
    expect(sampler.getParameters()).toEqual({ alpha: 2, beta: 5 });
  });

  it('should throw for non-positive parameters', () => {
    expect(() => new BetaSampler(0, 1, rngFn)).toThrow('Alpha and beta must be positive');
    expect(() => new BetaSampler(1, 0, rngFn)).toThrow('Alpha and beta must be positive');
  });

  it('should sample values in (0, 1)', () => {
    const sampler = new BetaSampler(2, 2, rngFn);
    const samples = sampler.sampleMany(1000);

    samples.forEach((s) => {
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThan(1);
    });
  });

  it('should have correct mean (alpha / (alpha + beta))', () => {
    const alpha = 2;
    const beta = 5;
    const sampler = new BetaSampler(alpha, beta, rngFn);
    const samples = sampler.sampleMany(10000);

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(alpha / (alpha + beta), 1);
  });
});

describe('GammaSampler', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should create sampler with shape and scale', () => {
    const sampler = new GammaSampler(2, 3, rngFn);
    expect(sampler.getType()).toBe('gamma');
    expect(sampler.getParameters()).toEqual({ shape: 2, scale: 3 });
  });

  it('should throw for non-positive parameters', () => {
    expect(() => new GammaSampler(0, 1, rngFn)).toThrow('Shape and scale must be positive');
    expect(() => new GammaSampler(1, 0, rngFn)).toThrow('Shape and scale must be positive');
  });

  it('should sample non-negative values', () => {
    const sampler = new GammaSampler(2, 2, rngFn);
    const samples = sampler.sampleMany(1000);

    samples.forEach((s) => expect(s).toBeGreaterThanOrEqual(0));
  });

  it('should have correct mean (shape * scale)', () => {
    const shape = 3;
    const scale = 2;
    const sampler = new GammaSampler(shape, scale, rngFn);
    const samples = sampler.sampleMany(10000);

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(shape * scale, 0);
  });
});

describe('createSampler factory', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should create normal sampler', () => {
    const sampler = createSampler({ type: 'normal', mean: 0, stdDev: 1 }, rngFn);
    expect(sampler.getType()).toBe('normal');
  });

  it('should create uniform sampler', () => {
    const sampler = createSampler({ type: 'uniform', min: 0, max: 1 }, rngFn);
    expect(sampler.getType()).toBe('uniform');
  });

  it('should create exponential sampler', () => {
    const sampler = createSampler({ type: 'exponential', rate: 1 }, rngFn);
    expect(sampler.getType()).toBe('exponential');
  });

  it('should create poisson sampler', () => {
    const sampler = createSampler({ type: 'poisson', lambda: 5 }, rngFn);
    expect(sampler.getType()).toBe('poisson');
  });

  it('should create binomial sampler', () => {
    const sampler = createSampler({ type: 'binomial', n: 10, p: 0.5 }, rngFn);
    expect(sampler.getType()).toBe('binomial');
  });

  it('should create categorical sampler', () => {
    const sampler = createSampler({ type: 'categorical', probabilities: { a: 1 } }, rngFn);
    expect(sampler.getType()).toBe('categorical');
  });

  it('should create beta sampler', () => {
    const sampler = createSampler({ type: 'beta', alpha: 2, beta: 3 }, rngFn);
    expect(sampler.getType()).toBe('beta');
  });

  it('should create gamma sampler', () => {
    const sampler = createSampler({ type: 'gamma', shape: 2, scale: 1 }, rngFn);
    expect(sampler.getType()).toBe('gamma');
  });

  it('should create lognormal sampler', () => {
    const sampler = createSampler({ type: 'lognormal', mu: 0, sigma: 1 }, rngFn);
    expect(sampler.getType()).toBe('lognormal');
    expect(sampler.sample()).toBeGreaterThan(0);
  });

  it('should create triangular sampler', () => {
    const sampler = createSampler({ type: 'triangular', min: 0, mode: 0.5, max: 1 }, rngFn);
    expect(sampler.getType()).toBe('triangular');
    const value = sampler.sample();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  it('should create custom sampler', () => {
    const sampler = createSampler({ type: 'custom', sampler: () => 42 }, rngFn);
    expect(sampler.getType()).toBe('custom');
    expect(sampler.sample()).toBe(42);
  });

  it('should throw for unknown distribution type', () => {
    expect(() => createSampler({ type: 'unknown' } as any, rngFn)).toThrow('Unknown distribution');
  });
});

describe('sampleWithStatistics', () => {
  const rng = new SeededRNG(12345);
  const rngFn = () => rng.next();

  it('should return samples and statistics', () => {
    const result = sampleWithStatistics({ type: 'normal', mean: 100, stdDev: 10 }, 1000, rngFn);

    expect(result.samples).toHaveLength(1000);
    expect(result.statistics.mean).toBeCloseTo(100, 0);
    expect(result.statistics.variance).toBeGreaterThan(0);
    expect(result.statistics.min).toBeLessThan(result.statistics.max);
    expect(result.time).toBeGreaterThanOrEqual(0);
  });
});
