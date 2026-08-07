/**
 * Closed-form mean and variance for the distributions this codebase accepts.
 *
 * This is the single place that knows a distribution's analytic moments.
 * `StochasticHandler` previously carried a private copy covering 5
 * distributions, so a client naming `beta`, `gamma`, `lognormal`, `triangular`,
 * `bernoulli` or `geometric` silently got `expectedValue: undefined` with no
 * indication that the mode does not know that distribution.
 *
 * Two rules the callers depend on:
 *
 * 1. **An unknown distribution returns `{}`, never a guess.** The mode reports
 *    these numbers to a client as properties of their model; inventing one is
 *    worse than admitting ignorance.
 * 2. **Out-of-domain parameters return `{}`, never `NaN` or `Infinity`.**
 *    `1/0` is `Infinity` in JavaScript and `0/0` is `NaN`; either would be
 *    formatted and shown as though it had been computed. Every branch below
 *    checks its domain first.
 *
 * Parameter aliases are accepted because the tool schema, the handler's older
 * private table, and `stochastic/types.ts` each name them differently
 * (`mu`/`mean`, `lambda`/`rate`, `a`/`min`).
 */

/** Analytic moments. Either both fields are present and finite, or neither is. */
export interface DistributionMoments {
  mean?: number;
  variance?: number;
}

/** Pick the first alias that is present and finite. */
function param(
  params: Record<string, number>,
  ...names: string[]
): number | undefined {
  for (const name of names) {
    const value = params[name];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

/**
 * Compute the analytic mean and variance of `distribution` under `parameters`.
 *
 * Returns `{}` when the distribution is unknown, a required parameter is
 * missing, or the parameters fall outside the distribution's domain.
 */
export function analyticMoments(
  distribution: string,
  parameters: Record<string, number>,
): DistributionMoments {
  const params = parameters ?? {};

  switch (distribution) {
    case "normal":
    case "gaussian": {
      const mean = param(params, "mu", "mean");
      // Accept a variance directly, or a standard deviation to square.
      const varianceDirect = param(params, "variance", "sigma2");
      const sd = param(params, "stdDev", "sigma", "standardDeviation");
      const variance =
        varianceDirect ?? (sd !== undefined ? sd * sd : undefined);
      if (mean === undefined || variance === undefined || variance < 0)
        return {};
      return { mean, variance };
    }

    case "uniform": {
      const a = param(params, "a", "min");
      const b = param(params, "b", "max");
      if (a === undefined || b === undefined || a >= b) return {};
      return { mean: (a + b) / 2, variance: (b - a) ** 2 / 12 };
    }

    case "exponential": {
      const rate = param(params, "lambda", "rate");
      if (rate === undefined || rate <= 0) return {};
      return { mean: 1 / rate, variance: 1 / (rate * rate) };
    }

    case "poisson": {
      const lambda = param(params, "lambda", "rate");
      if (lambda === undefined || lambda < 0) return {};
      return { mean: lambda, variance: lambda };
    }

    case "binomial": {
      const n = param(params, "n", "trials");
      const p = param(params, "p", "probability");
      if (n === undefined || p === undefined) return {};
      if (n < 0 || p < 0 || p > 1) return {};
      return { mean: n * p, variance: n * p * (1 - p) };
    }

    case "bernoulli": {
      const p = param(params, "p", "probability");
      if (p === undefined || p < 0 || p > 1) return {};
      return { mean: p, variance: p * (1 - p) };
    }

    case "geometric": {
      // Trials-until-first-success (support 1, 2, 3, ...), matching the
      // "expected number of steps to reach a target state" framing the
      // handler already uses for hitting-time analysis.
      const p = param(params, "p", "probability");
      if (p === undefined || p <= 0 || p > 1) return {};
      return { mean: 1 / p, variance: (1 - p) / (p * p) };
    }

    case "beta": {
      const alpha = param(params, "alpha", "a");
      const beta = param(params, "beta", "b");
      if (alpha === undefined || beta === undefined) return {};
      if (alpha <= 0 || beta <= 0) return {};
      const sum = alpha + beta;
      return {
        mean: alpha / sum,
        variance: (alpha * beta) / (sum * sum * (sum + 1)),
      };
    }

    case "gamma": {
      // Shape-scale parameterisation, matching GammaSampler.
      const shape = param(params, "shape", "k", "alpha");
      const scale = param(params, "scale", "theta");
      if (shape === undefined || scale === undefined) return {};
      if (shape <= 0 || scale <= 0) return {};
      return { mean: shape * scale, variance: shape * scale * scale };
    }

    case "lognormal": {
      // mu and sigma are the moments of the UNDERLYING normal, not of the
      // lognormal itself -- the reason this one is easy to get wrong.
      const mu = param(params, "mu", "mean");
      const sigma = param(params, "sigma", "stdDev");
      if (mu === undefined || sigma === undefined || sigma <= 0) return {};
      const s2 = sigma * sigma;
      const mean = Math.exp(mu + s2 / 2);
      const variance = (Math.exp(s2) - 1) * Math.exp(2 * mu + s2);
      if (!Number.isFinite(mean) || !Number.isFinite(variance)) return {};
      return { mean, variance };
    }

    case "triangular": {
      const min = param(params, "min", "a");
      const mode = param(params, "mode", "c");
      const max = param(params, "max", "b");
      if (min === undefined || mode === undefined || max === undefined)
        return {};
      if (!(min < max) || mode < min || mode > max) return {};
      return {
        mean: (min + mode + max) / 3,
        variance:
          (min * min +
            max * max +
            mode * mode -
            min * max -
            min * mode -
            max * mode) /
          18,
      };
    }

    default:
      // Includes "custom" and "categorical": no closed form applies without
      // knowing the caller's sampler or category values.
      return {};
  }
}
