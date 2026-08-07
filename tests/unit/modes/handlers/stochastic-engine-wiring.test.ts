/**
 * StochasticHandler must actually use the Monte Carlo engine in
 * `src/modes/stochastic/`.
 *
 * That engine -- 1,554 lines of samplers, seeded RNG and posterior statistics
 * -- had no importer in `src/` at all. The handler carried a private
 * 5-distribution moment table instead, and dropped client-supplied `samples`
 * on the floor. These tests pin the wiring: if someone removes it, the mode
 * goes back to reporting zeros and undefineds and these fail.
 *
 * The hard constraint, same as the validation/proof/taxonomy wirings: the
 * handler is ADVISORY. It may warn about a model, never reject it.
 */
import { describe, it, expect } from 'vitest';
import { StochasticHandler } from '../../../../src/modes/handlers/StochasticHandler.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

const handler = new StochasticHandler();

function input(extra: Record<string, unknown>): ThinkingToolInput {
  return {
    thought: 'Modelling the queue.',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    ...extra,
  } as unknown as ThinkingToolInput;
}

describe('StochasticHandler uses the stochastic engine', () => {
  describe('random variables', () => {
    it('computes moments for a distribution the old private table did not know', () => {
      // beta(2,3): mean 0.4, variance 0.04. Before wiring, both were undefined.
      const thought = handler.createThought(
        input({
          thoughtType: 'random_variable_definition',
          randomVariables: [
            { name: 'conversion', distribution: 'beta', parameters: { alpha: 2, beta: 3 } },
          ],
        }),
        'session-1',
      );

      const rv = (thought as any).randomVariables[0];
      expect(rv.expectedValue).toBeCloseTo(0.4, 10);
      expect(rv.variance).toBeCloseTo(0.04, 10);
    });

    it('still handles the distributions the old table did know', () => {
      const thought = handler.createThought(
        input({
          randomVariables: [
            { name: 'wait', distribution: 'exponential', parameters: { lambda: 4 } },
          ],
        }),
        'session-1',
      );

      const rv = (thought as any).randomVariables[0];
      expect(rv.expectedValue).toBeCloseTo(0.25, 10);
      expect(rv.variance).toBeCloseTo(0.0625, 10);
    });

    it('prefers the client samples over the analytic form, and keeps them', () => {
      // Samples were previously discarded entirely: the handler's private
      // RandomVariable interface had no `samples` field.
      const thought = handler.createThought(
        input({
          randomVariables: [
            {
              name: 'measured',
              distribution: 'normal',
              parameters: { mu: 999, variance: 999 },
              samples: [1, 2, 3, 4, 5],
            },
          ],
        }),
        'session-1',
      );

      const rv = (thought as any).randomVariables[0];
      expect(rv.samples).toEqual([1, 2, 3, 4, 5]);
      expect(rv.expectedValue).toBeCloseTo(3, 10);
      // Unbiased sample variance: 10/4 = 2.5, NOT the declared 999.
      expect(rv.variance).toBeCloseTo(2.5, 10);
    });

    it('leaves moments undefined for a distribution with no closed form', () => {
      const thought = handler.createThought(
        input({
          randomVariables: [{ name: 'weird', distribution: 'custom', parameters: {} }],
        }),
        'session-1',
      );

      const rv = (thought as any).randomVariables[0];
      expect(rv.expectedValue).toBeUndefined();
      expect(rv.variance).toBeUndefined();
    });
  });

  describe('simulation results', () => {
    it('computes mean and variance from samples instead of reporting zero', () => {
      // Previously `mean: sr.mean || 0` -- samples present, mean absent, so a
      // client got a confident 0.
      const thought = handler.createThought(
        input({
          thoughtType: 'monte_carlo_simulation',
          simulations: [{ iterations: 5, samples: [2, 4, 4, 4, 6] }],
        }),
        'session-1',
      );

      const sim = (thought as any).simulations[0];
      expect(sim.mean).toBeCloseTo(4, 10);
      expect(sim.variance).toBeCloseTo(2, 10); // unbiased: 8/4
    });

    it('derives a 95% interval from samples when none was supplied', () => {
      const samples = Array.from({ length: 1000 }, (_, i) => i / 1000);
      const thought = handler.createThought(
        input({ simulations: [{ iterations: 1000, samples }] }),
        'session-1',
      );

      const sim = (thought as any).simulations[0];
      expect(sim.confidenceInterval).toBeDefined();
      const [lo, hi] = sim.confidenceInterval;
      expect(lo).toBeLessThan(hi);
      expect(lo).toBeGreaterThanOrEqual(0);
      expect(hi).toBeLessThanOrEqual(1);
    });

    it('does not overwrite statistics the client supplied', () => {
      const thought = handler.createThought(
        input({
          simulations: [
            { iterations: 5, samples: [2, 4, 4, 4, 6], mean: 42, variance: 7 },
          ],
        }),
        'session-1',
      );

      const sim = (thought as any).simulations[0];
      expect(sim.mean).toBe(42);
      expect(sim.variance).toBe(7);
    });

    it('reports zero-sample simulations without inventing statistics', () => {
      const thought = handler.createThought(
        input({ simulations: [{ iterations: 0 }] }),
        'session-1',
      );

      const sim = (thought as any).simulations[0];
      expect(Number.isFinite(sim.mean)).toBe(true);
      expect(Number.isFinite(sim.variance)).toBe(true);
    });
  });

  describe('validation stays advisory', () => {
    it('warns about out-of-domain beta parameters but does not reject', () => {
      const result = handler.validate(
        input({
          randomVariables: [
            { name: 'bad', distribution: 'beta', parameters: { alpha: -1, beta: 3 } },
          ],
        }),
      );

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('warns about a non-positive gamma scale but does not reject', () => {
      const result = handler.validate(
        input({
          randomVariables: [
            { name: 'bad', distribution: 'gamma', parameters: { shape: 2, scale: 0 } },
          ],
        }),
      );

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('accepts a well-formed model with no warnings about its distribution', () => {
      const result = handler.validate(
        input({
          randomVariables: [
            { name: 'ok', distribution: 'gamma', parameters: { shape: 2, scale: 3 } },
          ],
        }),
      );

      expect(result.valid).toBe(true);
      const distributionWarnings = result.warnings.filter((w) =>
        w.field.startsWith('randomVariables'),
      );
      expect(distributionWarnings).toEqual([]);
    });
  });
});
