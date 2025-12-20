/**
 * StochasticHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for the Stochastic reasoning handler:
 * - Markov chain analysis
 * - Random process modeling
 * - Probabilistic state transitions
 * - Monte Carlo methods support
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StochasticHandler } from '../../../../src/modes/handlers/StochasticHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('StochasticHandler', () => {
  let handler: StochasticHandler;

  beforeEach(() => {
    handler = new StochasticHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.STOCHASTIC);
    });

    it('should have correct modeName', () => {
      expect(handler.modeName).toBe('Stochastic Reasoning');
    });

    it('should have descriptive description', () => {
      expect(handler.description).toContain('Markov');
      expect(handler.description).toContain('Monte Carlo');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Analyzing stochastic process',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'stochastic',
    };

    it('should create thought with default thought type', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.STOCHASTIC);
      expect(thought.thoughtType).toBe('process_definition');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with specified thought type', () => {
      const input = { ...baseInput, thoughtType: 'steady_state_analysis' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.thoughtType).toBe('steady_state_analysis');
    });

    it('should use default process type', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.processType).toBe('discrete_time');
    });

    it('should use specified process type', () => {
      const input = { ...baseInput, processType: 'queueing' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.processType).toBe('queueing');
    });

    it('should process Markov chain', () => {
      const input = {
        ...baseInput,
        markovChain: {
          name: 'Weather Model',
          states: [
            { id: 'sunny', name: 'Sunny' },
            { id: 'rainy', name: 'Rainy' },
          ],
          transitions: [
            { fromState: 'sunny', toState: 'sunny', probability: 0.8 },
            { fromState: 'sunny', toState: 'rainy', probability: 0.2 },
            { fromState: 'rainy', toState: 'sunny', probability: 0.4 },
            { fromState: 'rainy', toState: 'rainy', probability: 0.6 },
          ],
          initialDistribution: { sunny: 0.5, rainy: 0.5 },
        },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.markovChain).toBeDefined();
      expect(thought.markovChain.states).toHaveLength(2);
      expect(thought.markovChain.transitions).toHaveLength(4);
    });

    it('should process random variables', () => {
      const input = {
        ...baseInput,
        randomVariables: [
          { name: 'X', distribution: 'normal', parameters: { mu: 0, variance: 1 } },
          { name: 'Y', distribution: 'exponential', parameters: { lambda: 2 } },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.randomVariables).toHaveLength(2);
      expect(thought.randomVariables[0].expectedValue).toBe(0);
      expect(thought.randomVariables[1].expectedValue).toBe(0.5); // 1/lambda
    });

    it('should process simulation results', () => {
      const input = {
        ...baseInput,
        simulationResults: [
          { iterations: 10000, mean: 0.501, variance: 0.998, confidenceInterval: [0.49, 0.51] },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.simulations).toHaveLength(1);
      expect(thought.simulations![0].iterations).toBe(10000);
    });

    it('should calculate distribution statistics', () => {
      const input = {
        ...baseInput,
        randomVariables: [
          { name: 'Uniform', distribution: 'uniform', parameters: { a: 0, b: 10 } },
          { name: 'Poisson', distribution: 'poisson', parameters: { lambda: 5 } },
          { name: 'Binomial', distribution: 'binomial', parameters: { n: 10, p: 0.3 } },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      // Uniform: E[X] = (a+b)/2 = 5, Var = (b-a)^2/12 = 8.33
      expect(thought.randomVariables[0].expectedValue).toBe(5);
      expect(thought.randomVariables[0].variance).toBeCloseTo(8.33, 1);

      // Poisson: E[X] = Var = lambda = 5
      expect(thought.randomVariables[1].expectedValue).toBe(5);
      expect(thought.randomVariables[1].variance).toBe(5);

      // Binomial: E[X] = np = 3, Var = np(1-p) = 2.1
      expect(thought.randomVariables[2].expectedValue).toBe(3);
      expect(thought.randomVariables[2].variance).toBeCloseTo(2.1, 1);
    });
  });

  describe('validate', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Stochastic analysis',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'stochastic',
    };

    it('should return valid for well-formed input', () => {
      const result = handler.validate(baseInput);
      expect(result.valid).toBe(true);
    });

    it('should fail for empty thought', () => {
      const input = { ...baseInput, thought: '' };
      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should warn for unknown thought type', () => {
      const input = { ...baseInput, thoughtType: 'invalid' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'thoughtType')).toBe(true);
    });

    it('should warn for unknown process type', () => {
      const input = { ...baseInput, processType: 'invalid_process' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'processType')).toBe(true);
    });

    it('should warn when transition probabilities do not sum to 1', () => {
      const input = {
        ...baseInput,
        markovChain: {
          states: [{ id: 's1' }, { id: 's2' }],
          transitions: [
            { fromState: 's1', toState: 's1', probability: 0.5 },
            { fromState: 's1', toState: 's2', probability: 0.3 }, // Sum = 0.8
          ],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('sum to'))).toBe(true);
    });

    it('should warn when initial distribution does not sum to 1', () => {
      const input = {
        ...baseInput,
        markovChain: {
          states: [{ id: 's1' }, { id: 's2' }],
          transitions: [],
          initialDistribution: { s1: 0.3, s2: 0.3 }, // Sum = 0.6
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Initial distribution'))).toBe(true);
    });

    it('should warn about invalid distribution parameters', () => {
      const input = {
        ...baseInput,
        randomVariables: [
          { name: 'Bad Normal', distribution: 'normal', parameters: { variance: -1 } },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('non-negative'))).toBe(true);
    });

    it('should warn about low simulation iteration count', () => {
      const input = {
        ...baseInput,
        simulationResults: [{ iterations: 50, mean: 0.5, variance: 0.25 }],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Low iteration count'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    const createThought = (overrides: any = {}) => {
      const baseInput: ThinkingToolInput = {
        thought: 'Stochastic reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'stochastic',
        ...overrides,
      };
      return handler.createThought(baseInput, 'session-123');
    };

    it('should include related modes', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
      expect(enhancements.relatedModes).toContain(ThinkingMode.OPTIMIZATION);
      expect(enhancements.relatedModes).toContain(ThinkingMode.TEMPORAL);
    });

    it('should include mental models', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Markov Property');
      expect(enhancements.mentalModels).toContain('Law of Large Numbers');
      expect(enhancements.mentalModels).toContain('Central Limit Theorem');
    });

    it('should provide process definition guidance', () => {
      const thought = createThought({ thoughtType: 'process_definition' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('states of the process'))).toBe(true);
    });

    it('should provide steady state analysis guidance', () => {
      const thought = createThought({
        thoughtType: 'steady_state_analysis',
        markovChain: {
          states: [{ id: 's1' }],
          transitions: [],
          isErgodic: true,
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('stationary distribution'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('ergodic'))).toBe(true);
    });

    it('should warn about periodic chains', () => {
      const thought = createThought({
        thoughtType: 'steady_state_analysis',
        markovChain: {
          states: [{ id: 's1' }, { id: 's2' }],
          transitions: [],
          period: 2,
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('periodic'))).toBe(true);
    });

    it('should provide Monte Carlo guidance', () => {
      const thought = createThought({
        thoughtType: 'monte_carlo_simulation',
      });

      const enhancements = handler.getEnhancements(thought);

      // Monte Carlo mode provides guiding questions about iterations and confidence intervals
      expect(enhancements.guidingQuestions!.some((q) => q.includes('iterations'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('confidence interval'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('converged'))).toBe(true);
    });

    it('should provide queueing-specific guidance', () => {
      const thought = createThought({ processType: 'queueing' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain("Little's Law");
      expect(enhancements.suggestions!.some((s) => s.includes('arrival rate'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support process_definition', () => {
      expect(handler.supportsThoughtType('process_definition')).toBe(true);
    });

    it('should support transition_analysis', () => {
      expect(handler.supportsThoughtType('transition_analysis')).toBe(true);
    });

    it('should support steady_state_analysis', () => {
      expect(handler.supportsThoughtType('steady_state_analysis')).toBe(true);
    });

    it('should support random_variable_definition', () => {
      expect(handler.supportsThoughtType('random_variable_definition')).toBe(true);
    });

    it('should support monte_carlo_simulation', () => {
      expect(handler.supportsThoughtType('monte_carlo_simulation')).toBe(true);
    });

    it('should support convergence_analysis', () => {
      expect(handler.supportsThoughtType('convergence_analysis')).toBe(true);
    });

    it('should support hitting_time_analysis', () => {
      expect(handler.supportsThoughtType('hitting_time_analysis')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle weather Markov chain analysis', () => {
      const sessionId = 'weather-session';

      const input = {
        thought: 'Modeling weather transitions as a Markov chain',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'stochastic',
        thoughtType: 'process_definition',
        processType: 'discrete_time',
        markovChain: {
          name: 'Weather',
          states: [
            { id: 'sunny', name: 'Sunny', probability: 0.67 },
            { id: 'rainy', name: 'Rainy', probability: 0.33 },
          ],
          transitions: [
            { fromState: 'sunny', toState: 'sunny', probability: 0.8 },
            { fromState: 'sunny', toState: 'rainy', probability: 0.2 },
            { fromState: 'rainy', toState: 'sunny', probability: 0.4 },
            { fromState: 'rainy', toState: 'rainy', probability: 0.6 },
          ],
          initialDistribution: { sunny: 1.0, rainy: 0.0 },
          isIrreducible: true,
          isErgodic: true,
        },
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.markovChain.states).toHaveLength(2);
      expect(validation.valid).toBe(true);
      expect(enhancements.metrics!.stateCount).toBe(2);
      expect(enhancements.metrics!.transitionCount).toBe(4);
    });

    it('should handle Monte Carlo estimation', () => {
      const sessionId = 'mc-session';

      const input = {
        thought: 'Estimating π using Monte Carlo simulation',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'stochastic',
        thoughtType: 'monte_carlo_simulation',
        processType: 'discrete_time',
        randomVariables: [
          { name: 'X', distribution: 'uniform', parameters: { a: -1, b: 1 } },
          { name: 'Y', distribution: 'uniform', parameters: { a: -1, b: 1 } },
        ],
        simulationResults: [
          {
            iterations: 100000,
            mean: 3.14159,
            variance: 0.001,
            confidenceInterval: [3.140, 3.143],
          },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.randomVariables).toHaveLength(2);
      expect(thought.simulations).toHaveLength(1);
      // Monte Carlo thought type provides guiding questions about simulation methodology
      expect(enhancements.guidingQuestions!.some((q) => q.includes('iterations'))).toBe(true);
    });
  });
});
