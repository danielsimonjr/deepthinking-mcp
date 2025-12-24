/**
 * Seeded Random Number Generator - Phase 12 Sprint 5
 *
 * Implements a high-quality seeded PRNG using xorshift128+ algorithm.
 * Provides reproducible random sequences for Monte Carlo simulation.
 */

import type { RNGState, SeededRNGInterface } from '../types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum 32-bit signed integer (2^31 - 1), used for seed generation */
const MAX_INT32 = 2147483647;

// ============================================================================
// XORSHIFT128+ IMPLEMENTATION
// ============================================================================

/**
 * Seeded random number generator using xorshift128+ algorithm.
 * Provides high-quality random numbers with reproducibility.
 */
export class SeededRNG implements SeededRNGInterface {
  private state: [number, number, number, number];
  private initialSeed: number;
  private count: number = 0;

  constructor(seed: number = Date.now()) {
    this.initialSeed = seed;
    this.state = this.initializeState(seed);
  }

  /**
   * Initialize state from seed using SplitMix64-like algorithm
   */
  private initializeState(seed: number): [number, number, number, number] {
    // Use multiple rounds of hashing to spread the seed across state
    let s = seed >>> 0;
    const state: [number, number, number, number] = [0, 0, 0, 0];

    for (let i = 0; i < 4; i++) {
      s = (s + 0x9e3779b9) >>> 0;
      let z = s;
      z = (z ^ (z >>> 16)) >>> 0;
      z = Math.imul(z, 0x85ebca6b) >>> 0;
      z = (z ^ (z >>> 13)) >>> 0;
      z = Math.imul(z, 0xc2b2ae35) >>> 0;
      z = (z ^ (z >>> 16)) >>> 0;
      state[i] = z;
    }

    // Ensure at least one bit is set
    if (state[0] === 0 && state[1] === 0 && state[2] === 0 && state[3] === 0) {
      state[0] = 1;
    }

    return state;
  }

  /**
   * Generate next 32-bit unsigned integer
   */
  private nextUint32(): number {
    this.count++;

    // xorshift128+
    let s1 = this.state[0];
    const s0 = this.state[1];
    const t1 = this.state[2];
    const t0 = this.state[3];

    this.state[0] = t0;
    this.state[1] = t1;

    s1 ^= (s1 << 23) >>> 0;
    s1 ^= s1 >>> 17;
    s1 ^= t0;
    s1 ^= t0 >>> 26;

    this.state[2] = s0;
    this.state[3] = s1;

    return (t0 + t1) >>> 0;
  }

  /**
   * Get next uniform random number in [0, 1)
   */
  next(): number {
    // Use two 32-bit values for better precision
    const hi = this.nextUint32() >>> 5;
    const lo = this.nextUint32() >>> 6;
    return (hi * 67108864 + lo) / 9007199254740992;
  }

  /**
   * Get uniform random number in [min, max)
   */
  uniform(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Get normally distributed random number using Box-Muller transform
   */
  normal(mean: number = 0, stdDev: number = 1): number {
    let u: number, v: number, s: number;
    do {
      u = this.next() * 2 - 1;
      v = this.next() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);

    const mul = Math.sqrt(-2 * Math.log(s) / s);
    return mean + stdDev * u * mul;
  }

  /**
   * Get exponentially distributed random number
   */
  exponential(rate: number): number {
    return -Math.log(1 - this.next()) / rate;
  }

  /**
   * Get Poisson distributed random number
   */
  poisson(lambda: number): number {
    if (lambda < 30) {
      // Knuth's algorithm
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1;

      do {
        k++;
        p *= this.next();
      } while (p > L);

      return k - 1;
    } else {
      // Normal approximation
      return Math.max(0, Math.round(this.normal(lambda, Math.sqrt(lambda))));
    }
  }

  /**
   * Get binomially distributed random number
   */
  binomial(n: number, p: number): number {
    if (n < 25) {
      // Direct simulation
      let successes = 0;
      for (let i = 0; i < n; i++) {
        if (this.next() < p) {
          successes++;
        }
      }
      return successes;
    } else {
      // Normal approximation
      const mean = n * p;
      const stdDev = Math.sqrt(n * p * (1 - p));
      return Math.max(0, Math.min(n, Math.round(this.normal(mean, stdDev))));
    }
  }

  /**
   * Sample from categorical distribution
   */
  categorical(probabilities: Record<string, number>): string {
    const entries = Object.entries(probabilities);
    const u = this.next();
    let cumSum = 0;

    for (const [category, prob] of entries) {
      cumSum += prob;
      if (u <= cumSum) {
        return category;
      }
    }

    // Return last category as fallback
    return entries[entries.length - 1][0];
  }

  /**
   * Get random integer in [min, max] (inclusive)
   */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Shuffle array in place using Fisher-Yates
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Pick random element from array
   */
  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  /**
   * Pick n random elements from array without replacement
   */
  sample<T>(array: T[], n: number): T[] {
    const shuffled = [...array];
    this.shuffle(shuffled);
    return shuffled.slice(0, n);
  }

  /**
   * Save current state for checkpointing
   */
  saveState(): RNGState {
    return {
      state: [...this.state],
      position: 0, // Not used in xorshift but kept for interface
      seed: this.initialSeed,
      count: this.count,
    };
  }

  /**
   * Restore from saved state
   */
  restoreState(state: RNGState): void {
    if (state.state.length !== 4) {
      throw new Error('Invalid state: must have 4 elements');
    }
    this.state = state.state as [number, number, number, number];
    this.initialSeed = state.seed;
    this.count = state.count;
  }

  /**
   * Reset to initial seed
   */
  reset(): void {
    this.state = this.initializeState(this.initialSeed);
    this.count = 0;
  }

  /**
   * Get the number of random values generated
   */
  getCount(): number {
    return this.count;
  }

  /**
   * Get the original seed
   */
  getSeed(): number {
    return this.initialSeed;
  }

  /**
   * Create a new RNG with the same seed
   */
  clone(): SeededRNG {
    const clone = new SeededRNG(this.initialSeed);
    clone.restoreState(this.saveState());
    return clone;
  }

  /**
   * Fork the RNG: create a new RNG seeded from current state
   * Useful for parallel simulations
   */
  fork(): SeededRNG {
    const newSeed = this.nextUint32();
    return new SeededRNG(newSeed);
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a seeded RNG
 */
export function createRNG(seed?: number): SeededRNG {
  return new SeededRNG(seed);
}

/**
 * Create multiple independent RNGs for parallel simulations
 */
export function createParallelRNGs(count: number, baseSeed: number = Date.now()): SeededRNG[] {
  const rngs: SeededRNG[] = [];
  const baseRNG = new SeededRNG(baseSeed);

  for (let i = 0; i < count; i++) {
    rngs.push(baseRNG.fork());
  }

  return rngs;
}

/**
 * Generate a random seed using system entropy
 * Note: Uses Math.random() intentionally for initial seed generation
 * when no seed is provided - subsequent values use deterministic PRNG
 */
export function generateSeed(): number {
  return Math.floor(Math.random() * MAX_INT32);
}
