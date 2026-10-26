/**
 * Gamma variate agreement tests.
 *
 * BetaSampler builds a Beta(a, b) draw from two Gamma variates, and GammaSampler draws one.
 * Both must use the same gamma algorithm, so the same seed gives the same variates.
 */

import { describe, it, expect } from 'vitest';
import { BetaSampler, GammaSampler } from '../../../../src/modes/stochastic/models/distribution.js';
import { SeededRNG } from '../../../../src/modes/stochastic/sampling/rng.js';

function rngFrom(seed: number): () => number {
  const rng = new SeededRNG(seed);
  return () => rng.next();
}

describe('gamma variates shared by BetaSampler and GammaSampler', () => {
  // shape < 1 takes the boost branch, shape >= 1 the Marsaglia-Tsang branch
  const shapePairs: Array<[number, number]> = [
    [0.5, 0.7],
    [1, 1],
    [2, 5],
    [8.5, 0.3],
  ];

  it.each(shapePairs)('Beta(%d, %d) equals x / (x + y) for two Gamma(shape, 1) draws', (a, b) => {
    const gammaRng = rngFrom(2026);
    const x = new GammaSampler(a, 1, gammaRng).sample();
    const y = new GammaSampler(b, 1, gammaRng).sample();

    const beta = new BetaSampler(a, b, rngFrom(2026)).sample();

    expect(beta).toBeCloseTo(x / (x + y), 12);
  });

  it('GammaSampler scales one unit-scale variate', () => {
    const unit = new GammaSampler(3, 1, rngFrom(7)).sample();
    const scaled = new GammaSampler(3, 4, rngFrom(7)).sample();

    expect(scaled).toBeCloseTo(unit * 4, 12);
  });

  it('GammaSampler is deterministic for a fixed seed', () => {
    const first = new GammaSampler(2.5, 1, rngFrom(99)).sample();
    const second = new GammaSampler(2.5, 1, rngFrom(99)).sample();

    expect(first).toBe(second);
  });
});
