/**
 * Seeded RNG Unit Tests - Phase 12 Sprint 5
 *
 * Tests for the SeededRNG class and related functions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SeededRNG,
  createRNG,
  createParallelRNGs,
  generateSeed,
} from '../../../../src/modes/stochastic/sampling/rng.js';

describe('SeededRNG', () => {
  let rng: SeededRNG;

  beforeEach(() => {
    rng = new SeededRNG(12345);
  });

  describe('constructor', () => {
    it('should create RNG with provided seed', () => {
      const seededRng = new SeededRNG(42);
      expect(seededRng.getSeed()).toBe(42);
    });

    it('should create RNG with default seed when none provided', () => {
      const defaultRng = new SeededRNG();
      expect(defaultRng.getSeed()).toBeDefined();
    });
  });

  describe('next()', () => {
    it('should return values in [0, 1) range', () => {
      for (let i = 0; i < 1000; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should be reproducible with same seed', () => {
      const rng1 = new SeededRNG(99);
      const rng2 = new SeededRNG(99);

      for (let i = 0; i < 100; i++) {
        expect(rng1.next()).toBe(rng2.next());
      }
    });

    it('should produce different values with different seeds', () => {
      const rng1 = new SeededRNG(1);
      const rng2 = new SeededRNG(2);

      // At least some values should differ
      let different = false;
      for (let i = 0; i < 10; i++) {
        if (rng1.next() !== rng2.next()) {
          different = true;
          break;
        }
      }
      expect(different).toBe(true);
    });
  });

  describe('uniform()', () => {
    it('should return values in [min, max) range', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.uniform(5, 10);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThan(10);
      }
    });

    it('should handle negative ranges', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.uniform(-10, -5);
        expect(value).toBeGreaterThanOrEqual(-10);
        expect(value).toBeLessThan(-5);
      }
    });
  });

  describe('normal()', () => {
    it('should generate values around mean', () => {
      const values: number[] = [];
      for (let i = 0; i < 10000; i++) {
        values.push(rng.normal(100, 10));
      }

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      expect(mean).toBeCloseTo(100, 0);
    });

    it('should respect standard deviation', () => {
      const values: number[] = [];
      for (let i = 0; i < 10000; i++) {
        values.push(rng.normal(0, 1));
      }

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
      const stdDev = Math.sqrt(variance);

      expect(stdDev).toBeCloseTo(1, 0);
    });
  });

  describe('exponential()', () => {
    it('should return non-negative values', () => {
      for (let i = 0; i < 100; i++) {
        expect(rng.exponential(1)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have correct mean for given rate', () => {
      const values: number[] = [];
      const rate = 2;
      for (let i = 0; i < 10000; i++) {
        values.push(rng.exponential(rate));
      }

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      // Mean of exponential distribution is 1/rate
      expect(mean).toBeCloseTo(1 / rate, 1);
    });
  });

  describe('poisson()', () => {
    it('should return non-negative integers', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.poisson(5);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should have correct mean for given lambda', () => {
      const values: number[] = [];
      const lambda = 10;
      for (let i = 0; i < 5000; i++) {
        values.push(rng.poisson(lambda));
      }

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      expect(mean).toBeCloseTo(lambda, 0);
    });
  });

  describe('binomial()', () => {
    it('should return values between 0 and n', () => {
      const n = 20;
      for (let i = 0; i < 100; i++) {
        const value = rng.binomial(n, 0.5);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(n);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should have correct mean for n*p', () => {
      const values: number[] = [];
      const n = 100;
      const p = 0.3;
      for (let i = 0; i < 5000; i++) {
        values.push(rng.binomial(n, p));
      }

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      expect(mean).toBeCloseTo(n * p, 0);
    });
  });

  describe('categorical()', () => {
    it('should return one of the categories', () => {
      const probabilities = { a: 0.2, b: 0.3, c: 0.5 };
      const validCategories = Object.keys(probabilities);

      for (let i = 0; i < 100; i++) {
        const result = rng.categorical(probabilities);
        expect(validCategories).toContain(result);
      }
    });

    it('should respect probability distribution', () => {
      const probabilities = { heads: 0.5, tails: 0.5 };
      const counts: Record<string, number> = { heads: 0, tails: 0 };

      for (let i = 0; i < 10000; i++) {
        counts[rng.categorical(probabilities)]++;
      }

      // Should be roughly 50-50
      expect(counts.heads / 10000).toBeCloseTo(0.5, 1);
    });
  });

  describe('int()', () => {
    it('should return integers in [min, max] inclusive', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.int(1, 6);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(6);
        expect(Number.isInteger(value)).toBe(true);
      }
    });
  });

  describe('shuffle()', () => {
    it('should return same elements in different order', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = rng.shuffle([...original]);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should produce different orderings', () => {
      const rng1 = new SeededRNG(1);
      const rng2 = new SeededRNG(2);

      const arr1 = rng1.shuffle([1, 2, 3, 4, 5]);
      const arr2 = rng2.shuffle([1, 2, 3, 4, 5]);

      // Should be different (with very high probability)
      expect(arr1.join(',')).not.toBe(arr2.join(','));
    });
  });

  describe('pick()', () => {
    it('should return an element from the array', () => {
      const array = ['a', 'b', 'c', 'd'];
      for (let i = 0; i < 100; i++) {
        expect(array).toContain(rng.pick(array));
      }
    });
  });

  describe('sample()', () => {
    it('should return n elements without replacement', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const sampled = rng.sample(array, 3);

      expect(sampled).toHaveLength(3);
      expect(new Set(sampled).size).toBe(3); // All unique
      sampled.forEach((s) => expect(array).toContain(s));
    });
  });

  describe('state management', () => {
    it('should save and restore state correctly', () => {
      rng.next();
      rng.next();
      const state = rng.saveState();

      const values1: number[] = [];
      for (let i = 0; i < 10; i++) {
        values1.push(rng.next());
      }

      rng.restoreState(state);

      const values2: number[] = [];
      for (let i = 0; i < 10; i++) {
        values2.push(rng.next());
      }

      expect(values1).toEqual(values2);
    });

    it('should reset to initial state', () => {
      const initial1: number[] = [];
      for (let i = 0; i < 5; i++) {
        initial1.push(rng.next());
      }

      rng.reset();

      const initial2: number[] = [];
      for (let i = 0; i < 5; i++) {
        initial2.push(rng.next());
      }

      expect(initial1).toEqual(initial2);
    });

    it('should track count of random values generated', () => {
      expect(rng.getCount()).toBe(0);
      rng.next();
      rng.next();
      rng.next();
      expect(rng.getCount()).toBeGreaterThan(0);
    });
  });

  describe('clone()', () => {
    it('should create independent copy with same state', () => {
      rng.next();
      rng.next();

      const clone = rng.clone();

      // Both should produce same sequence
      const original: number[] = [];
      const cloned: number[] = [];

      for (let i = 0; i < 10; i++) {
        original.push(rng.next());
        cloned.push(clone.next());
      }

      expect(original).toEqual(cloned);
    });
  });

  describe('fork()', () => {
    it('should create new RNG seeded from current state', () => {
      const forked = rng.fork();

      // Forked should produce different sequence
      const originalValues: number[] = [];
      const forkedValues: number[] = [];

      for (let i = 0; i < 10; i++) {
        originalValues.push(rng.next());
        forkedValues.push(forked.next());
      }

      // Should be different
      expect(originalValues).not.toEqual(forkedValues);
    });
  });
});

describe('convenience functions', () => {
  describe('createRNG()', () => {
    it('should create SeededRNG with seed', () => {
      const rng = createRNG(42);
      expect(rng).toBeInstanceOf(SeededRNG);
      expect(rng.getSeed()).toBe(42);
    });
  });

  describe('createParallelRNGs()', () => {
    it('should create multiple independent RNGs', () => {
      const rngs = createParallelRNGs(5, 12345);
      expect(rngs).toHaveLength(5);

      // Each should produce different sequences
      const firstValues = rngs.map((r) => r.next());
      const uniqueValues = new Set(firstValues);
      expect(uniqueValues.size).toBe(5);
    });
  });

  describe('generateSeed()', () => {
    it('should return positive integer', () => {
      const seed = generateSeed();
      expect(seed).toBeGreaterThan(0);
      expect(Number.isInteger(seed)).toBe(true);
    });
  });
});
