/**
 * Analytic moments for the distributions this codebase accepts.
 *
 * Expected values are derived by hand from the standard closed forms rather
 * than from the implementation, so a wrong formula fails instead of being
 * confirmed by its own output.
 */
import { describe, it, expect } from 'vitest';
import { analyticMoments } from '../../../../src/modes/stochastic/models/moments.js';

describe('analyticMoments', () => {
  it('normal: mean = mu, variance = sigma^2', () => {
    expect(analyticMoments('normal', { mean: 3, variance: 4 })).toEqual({
      mean: 3,
      variance: 4,
    });
    // stdDev is squared, not passed through
    expect(analyticMoments('normal', { mu: 3, stdDev: 2 })).toEqual({
      mean: 3,
      variance: 4,
    });
    expect(analyticMoments('gaussian', { mu: -1, sigma2: 9 })).toEqual({
      mean: -1,
      variance: 9,
    });
  });

  it('uniform(2, 8): mean 5, variance 3', () => {
    // (a+b)/2 = 5 ; (b-a)^2/12 = 36/12 = 3
    expect(analyticMoments('uniform', { a: 2, b: 8 })).toEqual({
      mean: 5,
      variance: 3,
    });
    expect(analyticMoments('uniform', { min: 2, max: 8 })).toEqual({
      mean: 5,
      variance: 3,
    });
  });

  it('exponential(rate 4): mean 0.25, variance 0.0625', () => {
    expect(analyticMoments('exponential', { lambda: 4 })).toEqual({
      mean: 0.25,
      variance: 0.0625,
    });
  });

  it('poisson(lambda 7): mean = variance = 7', () => {
    expect(analyticMoments('poisson', { lambda: 7 })).toEqual({
      mean: 7,
      variance: 7,
    });
  });

  it('binomial(n=10, p=0.3): mean 3, variance 2.1', () => {
    const m = analyticMoments('binomial', { n: 10, p: 0.3 });
    expect(m.mean).toBeCloseTo(3, 10);
    expect(m.variance).toBeCloseTo(2.1, 10);
  });

  it('bernoulli(p=0.25): mean 0.25, variance 0.1875', () => {
    const m = analyticMoments('bernoulli', { p: 0.25 });
    expect(m.mean).toBeCloseTo(0.25, 10);
    expect(m.variance).toBeCloseTo(0.1875, 10);
  });

  it('geometric(p=0.2), trials-until-success: mean 5, variance 20', () => {
    // mean = 1/p = 5 ; var = (1-p)/p^2 = 0.8/0.04 = 20
    const m = analyticMoments('geometric', { p: 0.2 });
    expect(m.mean).toBeCloseTo(5, 10);
    expect(m.variance).toBeCloseTo(20, 10);
  });

  it('beta(2, 3): mean 0.4, variance 0.04', () => {
    // mean = a/(a+b) = 2/5 = 0.4
    // var = ab / ((a+b)^2 (a+b+1)) = 6 / (25*6) = 0.04
    const m = analyticMoments('beta', { alpha: 2, beta: 3 });
    expect(m.mean).toBeCloseTo(0.4, 10);
    expect(m.variance).toBeCloseTo(0.04, 10);
  });

  it('gamma(shape 3, scale 2): mean 6, variance 12', () => {
    const m = analyticMoments('gamma', { shape: 3, scale: 2 });
    expect(m.mean).toBeCloseTo(6, 10);
    expect(m.variance).toBeCloseTo(12, 10);
  });

  it('lognormal(mu=0, sigma=1): mean e^0.5, variance (e-1)e', () => {
    const m = analyticMoments('lognormal', { mu: 0, sigma: 1 });
    expect(m.mean).toBeCloseTo(Math.exp(0.5), 10);
    expect(m.variance).toBeCloseTo((Math.E - 1) * Math.E, 10);
  });

  it('triangular(0, 1, 5): mean 2, variance 4.5', () => {
    // mean = (a+c+b)/3 = 6/3 = 2
    // var = (a^2+b^2+c^2 - ab - ac - bc)/18 = (0+25+1-0-0-5)/18 = 21/18
    const m = analyticMoments('triangular', { min: 0, mode: 1, max: 5 });
    expect(m.mean).toBeCloseTo(2, 10);
    expect(m.variance).toBeCloseTo(21 / 18, 10);
  });

  describe('refuses to invent a number', () => {
    it('returns empty for an unknown distribution rather than guessing', () => {
      expect(analyticMoments('custom', { anything: 1 })).toEqual({});
      expect(analyticMoments('categorical', {})).toEqual({});
      expect(analyticMoments('not-a-distribution', { p: 0.5 })).toEqual({});
    });

    it('returns empty for out-of-domain parameters instead of NaN or Infinity', () => {
      // A silent NaN reaching a client reads as a computed result.
      expect(analyticMoments('exponential', { lambda: 0 })).toEqual({});
      expect(analyticMoments('exponential', { lambda: -1 })).toEqual({});
      expect(analyticMoments('poisson', { lambda: -2 })).toEqual({});
      expect(analyticMoments('uniform', { a: 5, b: 5 })).toEqual({});
      expect(analyticMoments('uniform', { a: 9, b: 2 })).toEqual({});
      expect(analyticMoments('binomial', { n: -1, p: 0.5 })).toEqual({});
      expect(analyticMoments('binomial', { n: 5, p: 1.5 })).toEqual({});
      expect(analyticMoments('beta', { alpha: 0, beta: 3 })).toEqual({});
      expect(analyticMoments('gamma', { shape: 3, scale: -1 })).toEqual({});
      expect(analyticMoments('geometric', { p: 0 })).toEqual({});
      expect(analyticMoments('triangular', { min: 0, mode: 9, max: 5 })).toEqual({});
    });

    it('returns empty when a required parameter is missing', () => {
      expect(analyticMoments('binomial', { n: 10 })).toEqual({});
      expect(analyticMoments('beta', { alpha: 2 })).toEqual({});
      expect(analyticMoments('uniform', {})).toEqual({});
    });

    it('never returns a non-finite number for any input it accepts', () => {
      const cases: Array<[string, Record<string, number>]> = [
        ['normal', { mean: 1, variance: 2 }],
        ['uniform', { a: 0, b: 1 }],
        ['exponential', { lambda: 3 }],
        ['poisson', { lambda: 1 }],
        ['binomial', { n: 4, p: 0.5 }],
        ['bernoulli', { p: 0.5 }],
        ['geometric', { p: 0.5 }],
        ['beta', { alpha: 1, beta: 1 }],
        ['gamma', { shape: 1, scale: 1 }],
        ['lognormal', { mu: 0, sigma: 1 }],
        ['triangular', { min: 0, mode: 1, max: 2 }],
      ];
      for (const [type, params] of cases) {
        const m = analyticMoments(type, params);
        expect(Number.isFinite(m.mean), `${type} mean`).toBe(true);
        expect(Number.isFinite(m.variance), `${type} variance`).toBe(true);
        expect((m.variance as number) >= 0, `${type} variance non-negative`).toBe(true);
      }
    });
  });
});
