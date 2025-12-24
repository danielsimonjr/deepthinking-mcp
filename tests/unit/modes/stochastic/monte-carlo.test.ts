/**
 * Monte Carlo Engine Unit Tests - Phase 12 Sprint 5
 *
 * Tests for the Monte Carlo simulation engine.
 */

import { describe, it, expect } from 'vitest';
import {
  MonteCarloEngine,
  createMonteCarloEngine,
  runMonteCarloSimulation,
} from '../../../../src/modes/stochastic/models/monte-carlo.js';
import type {
  StochasticModel,
  SimulationProgress,
  MonteCarloConfig,
} from '../../../../src/modes/stochastic/types.js';

describe('MonteCarloEngine', () => {
  describe('constructor', () => {
    it('should create engine with basic config', () => {
      const engine = new MonteCarloEngine({ iterations: 1000 });
      const config = engine.getConfig();

      expect(config.iterations).toBe(1000);
    });

    it('should set default values for optional config', () => {
      const engine = new MonteCarloEngine({ iterations: 1000 });
      const config = engine.getConfig();

      expect(config.burnIn).toBe(100); // 10% of iterations
      expect(config.thinning).toBe(1);
      expect(config.convergenceThreshold).toBe(0.01);
      expect(config.chains).toBe(1);
    });

    it('should accept custom configuration', () => {
      const engine = new MonteCarloEngine({
        iterations: 5000,
        burnIn: 500,
        thinning: 10,
        convergenceThreshold: 0.001,
        seed: 42,
        timeout: 30000,
      });
      const config = engine.getConfig();

      expect(config.iterations).toBe(5000);
      expect(config.burnIn).toBe(500);
      expect(config.thinning).toBe(10);
      expect(config.convergenceThreshold).toBe(0.001);
      expect(config.seed).toBe(42);
      expect(config.timeout).toBe(30000);
    });
  });

  describe('simulate()', () => {
    const createTestModel = (): StochasticModel => ({
      id: 'test-model',
      name: 'Test Model',
      variables: [
        { name: 'x', distribution: { type: 'normal', mean: 0, stdDev: 1 } },
        { name: 'y', distribution: { type: 'uniform', min: 0, max: 10 } },
      ],
    });

    it('should run simulation and return results', async () => {
      const engine = new MonteCarloEngine({
        iterations: 500,
        burnIn: 50,
        seed: 12345,
      });

      const result = await engine.simulate(createTestModel());

      expect(result.success).toBe(true);
      expect(result.samples.length).toBeGreaterThan(0);
      expect(result.variableNames).toEqual(['x', 'y']);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should apply burn-in correctly', async () => {
      const engine = new MonteCarloEngine({
        iterations: 100,
        burnIn: 20,
        seed: 12345,
      });

      const result = await engine.simulate(createTestModel());

      // With burn-in of 20, we should have 80 samples
      expect(result.effectiveSamples).toBe(80);
    });

    it('should apply thinning correctly', async () => {
      const engine = new MonteCarloEngine({
        iterations: 100,
        burnIn: 0,
        thinning: 5,
        seed: 12345,
      });

      const result = await engine.simulate(createTestModel());

      // With thinning of 5, we should have 20 samples
      expect(result.effectiveSamples).toBe(20);
    });

    it('should track progress via callback', async () => {
      const engine = new MonteCarloEngine({
        iterations: 100,
        progressInterval: 10,
        seed: 12345,
      });

      const progressUpdates: SimulationProgress[] = [];
      const result = await engine.simulate(createTestModel(), (progress) => {
        progressUpdates.push({ ...progress });
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].completed).toBeGreaterThan(0);
      expect(progressUpdates[0].total).toBe(100);
      expect(progressUpdates[progressUpdates.length - 1].percentage).toBe(100);
    });

    it('should compute statistics', async () => {
      const engine = new MonteCarloEngine({
        iterations: 1000,
        burnIn: 100,
        seed: 12345,
      });

      const result = await engine.simulate(createTestModel());

      expect(result.statistics).toBeDefined();
      expect(result.statistics.mean).toHaveLength(2);
      expect(result.statistics.variance).toHaveLength(2);
      expect(result.statistics.stdDev).toHaveLength(2);
      expect(result.statistics.percentiles).toBeDefined();
      expect(result.statistics.correlations).toBeDefined();
    });

    it('should compute convergence diagnostics', async () => {
      const engine = new MonteCarloEngine({
        iterations: 1000,
        seed: 12345,
      });

      const result = await engine.simulate(createTestModel());

      expect(result.convergenceDiagnostics).toBeDefined();
      expect(result.convergenceDiagnostics.effectiveSampleSize).toBeGreaterThan(0);
      expect(result.convergenceDiagnostics.rHat).toBeDefined();
    });

    it('should be reproducible with same seed', async () => {
      const model = createTestModel();

      const engine1 = new MonteCarloEngine({ iterations: 100, seed: 42 });
      const engine2 = new MonteCarloEngine({ iterations: 100, seed: 42 });

      const result1 = await engine1.simulate(model);
      const result2 = await engine2.simulate(model);

      expect(result1.samples[0]).toEqual(result2.samples[0]);
      expect(result1.samples[10]).toEqual(result2.samples[10]);
    });

    it('should complete with timeout option', async () => {
      // Create a model that would take a long time
      const slowModel: StochasticModel = {
        id: 'slow-model',
        name: 'Slow Model',
        variables: Array.from({ length: 100 }, (_, i) => ({
          name: `var_${i}`,
          distribution: { type: 'normal' as const, mean: 0, stdDev: 1 },
        })),
      };

      const engine = new MonteCarloEngine({
        iterations: 1000000, // Very high
        timeout: 100, // Very short
        seed: 12345,
      });

      const result = await engine.simulate(slowModel);

      // Should complete (either with timeout warning or early termination)
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });

  describe('simulateWithEvaluator()', () => {
    it('should run simulation with custom evaluator', async () => {
      const engine = new MonteCarloEngine({
        iterations: 500,
        burnIn: 50,
        seed: 12345,
      });

      const sampler = () => [Math.random(), Math.random()];
      const evaluator = (values: Record<string, number>) => [
        values.x + values.y,
        values.x * values.y,
      ];

      const result = await engine.simulateWithEvaluator(['x', 'y'], sampler, evaluator);

      expect(result.success).toBe(true);
      expect(result.samples.length).toBeGreaterThan(0);
    });

    it('should track progress with evaluator', async () => {
      const engine = new MonteCarloEngine({
        iterations: 100,
        progressInterval: 20,
        seed: 12345,
      });

      const sampler = () => [Math.random()];
      const evaluator = (values: Record<string, number>) => [values.x];

      const progressUpdates: SimulationProgress[] = [];
      await engine.simulateWithEvaluator(['x'], sampler, evaluator, (progress) => {
        progressUpdates.push({ ...progress });
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
    });
  });

  describe('getRNG()', () => {
    it('should return the internal RNG', () => {
      const engine = new MonteCarloEngine({ iterations: 100, seed: 42 });
      const rng = engine.getRNG();

      expect(rng).toBeDefined();
      expect(rng.getSeed()).toBe(42);
    });
  });
});

describe('Convenience Functions', () => {
  describe('createMonteCarloEngine()', () => {
    it('should create engine instance', () => {
      const engine = createMonteCarloEngine({ iterations: 1000 });
      expect(engine).toBeInstanceOf(MonteCarloEngine);
    });
  });

  describe('runMonteCarloSimulation()', () => {
    it('should run quick simulation', async () => {
      const model: StochasticModel = {
        id: 'quick-model',
        name: 'Quick Model',
        variables: [{ name: 'x', distribution: { type: 'normal', mean: 5, stdDev: 1 } }],
      };

      const result = await runMonteCarloSimulation(model, 1000, 12345);

      expect(result.success).toBe(true);
      expect(result.samples.length).toBeGreaterThan(0);
      expect(result.statistics.mean[0]).toBeCloseTo(5, 0);
    });

    it('should use default iterations when not specified', async () => {
      const model: StochasticModel = {
        id: 'default-model',
        name: 'Default Model',
        variables: [{ name: 'x', distribution: { type: 'uniform', min: 0, max: 1 } }],
      };

      const result = await runMonteCarloSimulation(model);

      expect(result.success).toBe(true);
      expect(result.config.iterations).toBe(10000);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle model with single variable', async () => {
    const model: StochasticModel = {
      id: 'single-var',
      name: 'Single Variable',
      variables: [{ name: 'x', distribution: { type: 'exponential', rate: 2 } }],
    };

    const engine = new MonteCarloEngine({ iterations: 500, seed: 12345 });
    const result = await engine.simulate(model);

    expect(result.success).toBe(true);
    expect(result.statistics.mean[0]).toBeCloseTo(0.5, 0); // Mean of exp(2) is 0.5
  });

  it('should handle model with many variables', async () => {
    const model: StochasticModel = {
      id: 'many-vars',
      name: 'Many Variables',
      variables: Array.from({ length: 20 }, (_, i) => ({
        name: `var_${i}`,
        distribution: { type: 'normal' as const, mean: i, stdDev: 1 },
      })),
    };

    const engine = new MonteCarloEngine({ iterations: 200, seed: 12345 });
    const result = await engine.simulate(model);

    expect(result.success).toBe(true);
    expect(result.variableNames).toHaveLength(20);
  });

  it('should handle categorical distributions', async () => {
    const model: StochasticModel = {
      id: 'categorical',
      name: 'Categorical Model',
      variables: [
        {
          name: 'category',
          distribution: {
            type: 'categorical',
            probabilities: { a: 0.3, b: 0.3, c: 0.4 },
          },
        },
      ],
    };

    const engine = new MonteCarloEngine({ iterations: 500, seed: 12345 });
    const result = await engine.simulate(model);

    expect(result.success).toBe(true);
  });

  it('should include config in results', async () => {
    const config: MonteCarloConfig = {
      iterations: 500,
      burnIn: 100,
      thinning: 2,
      seed: 42,
    };

    const model: StochasticModel = {
      id: 'config-test',
      name: 'Config Test',
      variables: [{ name: 'x', distribution: { type: 'uniform', min: 0, max: 1 } }],
    };

    const engine = new MonteCarloEngine(config);
    const result = await engine.simulate(model);

    expect(result.config.iterations).toBe(500);
    expect(result.config.burnIn).toBe(100);
    expect(result.config.thinning).toBe(2);
    expect(result.config.seed).toBe(42);
  });
});
