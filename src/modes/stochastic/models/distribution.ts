/**
 * Distribution Samplers - Phase 12 Sprint 5
 *
 * Implements probability distribution samplers for Monte Carlo simulation.
 * Uses pure mathematical algorithms without external dependencies.
 */

import type { Distribution, SamplingResult } from '../types.js';

// ============================================================================
// SAMPLER INTERFACE
// ============================================================================

/**
 * Interface for a distribution sampler
 */
export interface DistributionSampler {
  /** Sample a single value */
  sample(): number;

  /** Sample multiple values */
  sampleMany(count: number): number[];

  /** Get the distribution parameters */
  getParameters(): Record<string, number | string>;

  /** Get the distribution type */
  getType(): string;
}

// ============================================================================
// BOX-MULLER NORMAL SAMPLER
// ============================================================================

/**
 * Normal distribution sampler using Box-Muller transform
 */
export class NormalSampler implements DistributionSampler {
  private mean: number;
  private stdDev: number;
  private spare: number | null = null;
  private hasSpare = false;
  private rng: () => number;

  constructor(mean: number, stdDev: number, rng: () => number = Math.random) {
    if (stdDev <= 0) {
      throw new Error('Standard deviation must be positive');
    }
    this.mean = mean;
    this.stdDev = stdDev;
    this.rng = rng;
  }

  sample(): number {
    if (this.hasSpare) {
      this.hasSpare = false;
      return this.spare! * this.stdDev + this.mean;
    }

    // Box-Muller transform
    let u: number, v: number, s: number;
    do {
      u = this.rng() * 2 - 1;
      v = this.rng() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);

    const mul = Math.sqrt(-2 * Math.log(s) / s);
    this.spare = v * mul;
    this.hasSpare = true;

    return u * mul * this.stdDev + this.mean;
  }

  sampleMany(count: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      samples.push(this.sample());
    }
    return samples;
  }

  getParameters(): Record<string, number> {
    return { mean: this.mean, stdDev: this.stdDev };
  }

  getType(): string {
    return 'normal';
  }
}

// ============================================================================
// UNIFORM SAMPLER
// ============================================================================

/**
 * Uniform distribution sampler
 */
export class UniformSampler implements DistributionSampler {
  private min: number;
  private max: number;
  private rng: () => number;

  constructor(min: number, max: number, rng: () => number = Math.random) {
    if (min >= max) {
      throw new Error('min must be less than max');
    }
    this.min = min;
    this.max = max;
    this.rng = rng;
  }

  sample(): number {
    return this.min + this.rng() * (this.max - this.min);
  }

  sampleMany(count: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      samples.push(this.sample());
    }
    return samples;
  }

  getParameters(): Record<string, number> {
    return { min: this.min, max: this.max };
  }

  getType(): string {
    return 'uniform';
  }
}

// ============================================================================
// EXPONENTIAL SAMPLER
// ============================================================================

/**
 * Exponential distribution sampler using inverse transform
 */
export class ExponentialSampler implements DistributionSampler {
  private rate: number;
  private rng: () => number;

  constructor(rate: number, rng: () => number = Math.random) {
    if (rate <= 0) {
      throw new Error('Rate must be positive');
    }
    this.rate = rate;
    this.rng = rng;
  }

  sample(): number {
    // Inverse transform: -ln(U) / rate
    return -Math.log(1 - this.rng()) / this.rate;
  }

  sampleMany(count: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      samples.push(this.sample());
    }
    return samples;
  }

  getParameters(): Record<string, number> {
    return { rate: this.rate };
  }

  getType(): string {
    return 'exponential';
  }
}

// ============================================================================
// POISSON SAMPLER
// ============================================================================

/**
 * Poisson distribution sampler
 * Uses Knuth's algorithm for small lambda, rejection method for large lambda
 */
export class PoissonSampler implements DistributionSampler {
  private lambda: number;
  private rng: () => number;

  constructor(lambda: number, rng: () => number = Math.random) {
    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }
    this.lambda = lambda;
    this.rng = rng;
  }

  sample(): number {
    if (this.lambda < 30) {
      // Knuth's algorithm for small lambda
      return this.sampleKnuth();
    } else {
      // Normal approximation for large lambda
      return this.sampleNormalApprox();
    }
  }

  private sampleKnuth(): number {
    const L = Math.exp(-this.lambda);
    let k = 0;
    let p = 1;

    do {
      k++;
      p *= this.rng();
    } while (p > L);

    return k - 1;
  }

  private sampleNormalApprox(): number {
    // Use normal approximation for large lambda
    const normalSampler = new NormalSampler(this.lambda, Math.sqrt(this.lambda), this.rng);
    return Math.max(0, Math.round(normalSampler.sample()));
  }

  sampleMany(count: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      samples.push(this.sample());
    }
    return samples;
  }

  getParameters(): Record<string, number> {
    return { lambda: this.lambda };
  }

  getType(): string {
    return 'poisson';
  }
}

// ============================================================================
// BINOMIAL SAMPLER
// ============================================================================

/**
 * Binomial distribution sampler
 */
export class BinomialSampler implements DistributionSampler {
  private n: number;
  private p: number;
  private rng: () => number;

  constructor(n: number, p: number, rng: () => number = Math.random) {
    if (n <= 0 || !Number.isInteger(n)) {
      throw new Error('n must be a positive integer');
    }
    if (p < 0 || p > 1) {
      throw new Error('p must be between 0 and 1');
    }
    this.n = n;
    this.p = p;
    this.rng = rng;
  }

  sample(): number {
    // For small n, use direct simulation
    if (this.n < 25) {
      return this.sampleDirect();
    }
    // For large n, use normal approximation
    return this.sampleNormalApprox();
  }

  private sampleDirect(): number {
    let successes = 0;
    for (let i = 0; i < this.n; i++) {
      if (this.rng() < this.p) {
        successes++;
      }
    }
    return successes;
  }

  private sampleNormalApprox(): number {
    const mean = this.n * this.p;
    const stdDev = Math.sqrt(this.n * this.p * (1 - this.p));
    const normalSampler = new NormalSampler(mean, stdDev, this.rng);
    return Math.max(0, Math.min(this.n, Math.round(normalSampler.sample())));
  }

  sampleMany(count: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      samples.push(this.sample());
    }
    return samples;
  }

  getParameters(): Record<string, number> {
    return { n: this.n, p: this.p };
  }

  getType(): string {
    return 'binomial';
  }
}

// ============================================================================
// CATEGORICAL SAMPLER
// ============================================================================

/**
 * Categorical distribution sampler
 */
export class CategoricalSampler implements DistributionSampler {
  private probabilities: Map<string, number>;
  private categories: string[];
  private cumulativeProbs: number[];
  private rng: () => number;

  constructor(probabilities: Record<string, number>, rng: () => number = Math.random) {
    this.probabilities = new Map(Object.entries(probabilities));
    this.categories = Object.keys(probabilities);
    this.rng = rng;

    // Validate probabilities sum to 1
    const sum = Object.values(probabilities).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.001) {
      throw new Error('Probabilities must sum to 1');
    }

    // Compute cumulative probabilities
    this.cumulativeProbs = [];
    let cumSum = 0;
    for (const cat of this.categories) {
      cumSum += probabilities[cat];
      this.cumulativeProbs.push(cumSum);
    }
  }

  sample(): number {
    const u = this.rng();
    for (let i = 0; i < this.cumulativeProbs.length; i++) {
      if (u <= this.cumulativeProbs[i]) {
        return i;
      }
    }
    return this.categories.length - 1;
  }

  sampleCategory(): string {
    return this.categories[this.sample()];
  }

  sampleMany(count: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      samples.push(this.sample());
    }
    return samples;
  }

  sampleManyCategories(count: number): string[] {
    return this.sampleMany(count).map(i => this.categories[i]);
  }

  getParameters(): Record<string, number> {
    return Object.fromEntries(this.probabilities);
  }

  getType(): string {
    return 'categorical';
  }
}

// ============================================================================
// BETA SAMPLER
// ============================================================================

/**
 * Beta distribution sampler using rejection method
 */
export class BetaSampler implements DistributionSampler {
  private alpha: number;
  private beta: number;
  private rng: () => number;

  constructor(alpha: number, beta: number, rng: () => number = Math.random) {
    if (alpha <= 0 || beta <= 0) {
      throw new Error('Alpha and beta must be positive');
    }
    this.alpha = alpha;
    this.beta = beta;
    this.rng = rng;
  }

  sample(): number {
    // Use gamma variates: if X ~ Gamma(a, 1) and Y ~ Gamma(b, 1)
    // then X / (X + Y) ~ Beta(a, b)
    const x = this.sampleGamma(this.alpha);
    const y = this.sampleGamma(this.beta);
    return x / (x + y);
  }

  private sampleGamma(shape: number): number {
    // Marsaglia and Tsang's method for shape >= 1
    if (shape >= 1) {
      const d = shape - 1 / 3;
      const c = 1 / Math.sqrt(9 * d);

      while (true) {
        let x: number, v: number;
        do {
          const normal = new NormalSampler(0, 1, this.rng);
          x = normal.sample();
          v = 1 + c * x;
        } while (v <= 0);

        v = v * v * v;
        const u = this.rng();

        if (u < 1 - 0.0331 * (x * x) * (x * x)) {
          return d * v;
        }

        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
          return d * v;
        }
      }
    } else {
      // For shape < 1, use shape+1 and adjust
      return this.sampleGamma(shape + 1) * Math.pow(this.rng(), 1 / shape);
    }
  }

  sampleMany(count: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      samples.push(this.sample());
    }
    return samples;
  }

  getParameters(): Record<string, number> {
    return { alpha: this.alpha, beta: this.beta };
  }

  getType(): string {
    return 'beta';
  }
}

// ============================================================================
// GAMMA SAMPLER
// ============================================================================

/**
 * Gamma distribution sampler
 */
export class GammaSampler implements DistributionSampler {
  private shape: number;
  private scale: number;
  private rng: () => number;

  constructor(shape: number, scale: number, rng: () => number = Math.random) {
    if (shape <= 0 || scale <= 0) {
      throw new Error('Shape and scale must be positive');
    }
    this.shape = shape;
    this.scale = scale;
    this.rng = rng;
  }

  sample(): number {
    return this.sampleGamma(this.shape) * this.scale;
  }

  private sampleGamma(shape: number): number {
    if (shape >= 1) {
      const d = shape - 1 / 3;
      const c = 1 / Math.sqrt(9 * d);

      while (true) {
        let x: number, v: number;
        do {
          const normal = new NormalSampler(0, 1, this.rng);
          x = normal.sample();
          v = 1 + c * x;
        } while (v <= 0);

        v = v * v * v;
        const u = this.rng();

        if (u < 1 - 0.0331 * (x * x) * (x * x)) {
          return d * v;
        }

        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
          return d * v;
        }
      }
    } else {
      return this.sampleGamma(shape + 1) * Math.pow(this.rng(), 1 / shape);
    }
  }

  sampleMany(count: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      samples.push(this.sample());
    }
    return samples;
  }

  getParameters(): Record<string, number> {
    return { shape: this.shape, scale: this.scale };
  }

  getType(): string {
    return 'gamma';
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a distribution sampler from a distribution specification
 */
export function createSampler(dist: Distribution, rng: () => number = Math.random): DistributionSampler {
  switch (dist.type) {
    case 'normal':
      return new NormalSampler(dist.mean, dist.stdDev, rng);
    case 'uniform':
      return new UniformSampler(dist.min, dist.max, rng);
    case 'exponential':
      return new ExponentialSampler(dist.rate, rng);
    case 'poisson':
      return new PoissonSampler(dist.lambda, rng);
    case 'binomial':
      return new BinomialSampler(dist.n, dist.p, rng);
    case 'categorical':
      return new CategoricalSampler(dist.probabilities, rng);
    case 'beta':
      return new BetaSampler(dist.alpha, dist.beta, rng);
    case 'gamma':
      return new GammaSampler(dist.shape, dist.scale, rng);
    case 'lognormal':
      // LogNormal: exp(Normal(mu, sigma))
      const normalSampler = new NormalSampler(dist.mu, dist.sigma, rng);
      return {
        sample: () => Math.exp(normalSampler.sample()),
        sampleMany: (count: number) => {
          const samples: number[] = [];
          for (let i = 0; i < count; i++) {
            samples.push(Math.exp(normalSampler.sample()));
          }
          return samples;
        },
        getParameters: () => ({ mu: dist.mu, sigma: dist.sigma }),
        getType: () => 'lognormal',
      };
    case 'triangular':
      return {
        sample: () => sampleTriangular(dist.min, dist.mode, dist.max, rng),
        sampleMany: (count: number) => {
          const samples: number[] = [];
          for (let i = 0; i < count; i++) {
            samples.push(sampleTriangular(dist.min, dist.mode, dist.max, rng));
          }
          return samples;
        },
        getParameters: () => ({ min: dist.min, mode: dist.mode, max: dist.max }),
        getType: () => 'triangular',
      };
    case 'custom':
      return {
        sample: dist.sampler,
        sampleMany: (count: number) => {
          const samples: number[] = [];
          for (let i = 0; i < count; i++) {
            samples.push(dist.sampler());
          }
          return samples;
        },
        getParameters: () => ({}),
        getType: () => 'custom',
      };
    default:
      throw new Error(`Unknown distribution type: ${(dist as any).type}`);
  }
}

/**
 * Sample from triangular distribution
 */
function sampleTriangular(min: number, mode: number, max: number, rng: () => number): number {
  const u = rng();
  const fc = (mode - min) / (max - min);

  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

/**
 * Sample from a distribution and compute statistics
 */
export function sampleWithStatistics(
  dist: Distribution,
  count: number,
  rng: () => number = Math.random
): SamplingResult {
  const startTime = Date.now();
  const sampler = createSampler(dist, rng);
  const samples = sampler.sampleMany(count);

  const mean = samples.reduce((a, b) => a + b, 0) / count;
  const variance = samples.reduce((sum, x) => sum + (x - mean) ** 2, 0) / count;
  const min = Math.min(...samples);
  const max = Math.max(...samples);

  return {
    samples,
    statistics: { mean, variance, min, max },
    time: Date.now() - startTime,
  };
}
