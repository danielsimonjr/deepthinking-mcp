/**
 * Large-sample behaviour of the Monte Carlo engine.
 *
 * `sampleWithStatistics` used `Math.min(...samples)`, which passes every
 * element as a separate argument. That exceeds the engine's argument limit
 * somewhere above 100,000 and throws `RangeError: Maximum call stack size
 * exceeded` -- at a sample count Monte Carlo reaches routinely, and which the
 * handler itself encourages ("use at least 1000 iterations").
 *
 * The exact threshold is engine-dependent, so these tests assert the property
 * that matters (it completes and the values are right), not a magic number.
 */
import { describe, it, expect } from 'vitest';
import { sampleWithStatistics } from '../../../../src/modes/stochastic/models/distribution.js';
import { SeededRNG } from '../../../../src/modes/stochastic/sampling/rng.js';

describe('sampleWithStatistics at Monte Carlo scale', () => {
  it('does not throw for a 250,000-sample run', () => {
    const rng = new SeededRNG(4242);
    const rngFn = () => rng.next();

    expect(() =>
      sampleWithStatistics({ type: 'uniform', min: 0, max: 1 }, 250_000, rngFn),
    ).not.toThrow();
  });

  it('reports the true min and max of a large sample, not a truncated one', () => {
    const rng = new SeededRNG(99);
    const rngFn = () => rng.next();

    const result = sampleWithStatistics(
      { type: 'uniform', min: 0, max: 1 },
      250_000,
      rngFn,
    );

    // Compare against the same array reduced iteratively: whatever the
    // implementation does internally, it must agree with the samples it
    // returned. This fails if min/max are computed over a subset.
    let expectedMin = Infinity;
    let expectedMax = -Infinity;
    for (const v of result.samples) {
      if (v < expectedMin) expectedMin = v;
      if (v > expectedMax) expectedMax = v;
    }

    expect(result.samples).toHaveLength(250_000);
    expect(result.statistics.min).toBe(expectedMin);
    expect(result.statistics.max).toBe(expectedMax);
  });
});
