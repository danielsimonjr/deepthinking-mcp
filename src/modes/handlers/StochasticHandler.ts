/**
 * StochasticHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Stochastic reasoning mode with:
 * - Markov chain analysis
 * - Random process modeling
 * - Probabilistic state transitions
 * - Monte Carlo methods support
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, Thought } from '../../types/core.js';
import type { StochasticThought } from '../../types/modes/stochastic.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

// Re-export for backwards compatibility
export type { StochasticThought };

/**
 * State in a stochastic process
 */
interface StochasticState {
  id: string;
  name: string;
  description?: string;
  probability?: number; // Current probability of being in this state
  isAbsorbing?: boolean;
  isTransient?: boolean;
}

/**
 * Transition between states
 */
interface StateTransition {
  id: string;
  fromState: string;
  toState: string;
  probability: number;
  condition?: string;
}


/**
 * Random variable definition
 */
interface RandomVariable {
  id: string;
  name: string;
  distribution: string; // e.g., 'uniform', 'normal', 'exponential', 'poisson'
  parameters: Record<string, number>;
  expectedValue?: number;
  variance?: number;
}

/**
 * Simulation result
 */
interface SimulationResult {
  id: string;
  iterations: number;
  mean: number;
  variance: number;
  confidenceInterval?: [number, number];
  samples?: number[];
}

/**
 * Internal Markov chain representation for handler processing
 */
interface HandlerMarkovChain {
  id: string;
  name: string;
  states: StochasticState[];
  transitions: StateTransition[];
  initialDistribution: Record<string, number>;
  isErgodic?: boolean;
  isIrreducible?: boolean;
  period?: number;
}

/**
 * Valid thought types for stochastic mode
 */
const VALID_THOUGHT_TYPES = [
  'process_definition',
  'transition_analysis',
  'steady_state_analysis',
  'random_variable_definition',
  'monte_carlo_simulation',
  'convergence_analysis',
  'hitting_time_analysis',
] as const;

type StochasticThoughtType = (typeof VALID_THOUGHT_TYPES)[number];

/**
 * Valid process types
 */
const VALID_PROCESS_TYPES = [
  'discrete_time',
  'continuous_time',
  'random_walk',
  'birth_death',
  'queueing',
] as const;

type ProcessType = (typeof VALID_PROCESS_TYPES)[number];

/**
 * StochasticHandler - Specialized handler for stochastic reasoning
 *
 * Provides:
 * - Markov chain construction and analysis
 * - Random process modeling
 * - Monte Carlo simulation support
 * - Steady state and convergence analysis
 */
export class StochasticHandler implements ModeHandler {
  readonly mode = ThinkingMode.STOCHASTIC;
  readonly modeName = 'Stochastic Reasoning';
  readonly description =
    'Markov chains, random processes, probabilistic state transitions, and Monte Carlo methods';

  /**
   * Supported thought types for stochastic mode
   */
  private readonly supportedThoughtTypes = [...VALID_THOUGHT_TYPES];

  /**
   * Create a stochastic thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): StochasticThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process Markov chain
    const markovChain = inputAny.markovChain
      ? this.normalizeMarkovChain(inputAny.markovChain)
      : undefined;

    // Process random variables
    const randomVariables = inputAny.randomVariables
      ? inputAny.randomVariables.map((rv: any) => this.normalizeRandomVariable(rv))
      : undefined;

    // Process simulation results
    const simulations = inputAny.simulations || inputAny.simulationResults
      ? (inputAny.simulations || inputAny.simulationResults).map((sr: any) => this.normalizeSimulationResult(sr))
      : undefined;

    // Resolve process type
    const processType = this.resolveProcessType(inputAny.processType);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.STOCHASTIC,

      // Core stochastic fields
      thoughtType,
      markovChain: markovChain as any, // Handler's MarkovChain has different shape than types file
      processType,
      randomVariables,
      currentState: inputAny.currentState,
      stateHistory: inputAny.stateHistory,
      stepCount: inputAny.stepCount ?? 0,
      simulations,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate stochastic-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: { field: string; message: string; code: string }[] = [];
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate thought type
    if (inputAny.thoughtType && !VALID_THOUGHT_TYPES.includes(inputAny.thoughtType)) {
      warnings.push(
        createValidationWarning(
          'thoughtType',
          `Unknown thought type: ${inputAny.thoughtType}`,
          `Valid types: ${VALID_THOUGHT_TYPES.join(', ')}`
        )
      );
    }

    // Validate process type
    if (inputAny.processType && !VALID_PROCESS_TYPES.includes(inputAny.processType)) {
      warnings.push(
        createValidationWarning(
          'processType',
          `Unknown process type: ${inputAny.processType}`,
          `Valid types: ${VALID_PROCESS_TYPES.join(', ')}`
        )
      );
    }

    // Validate Markov chain transitions sum to 1
    if (inputAny.markovChain) {
      const mc = inputAny.markovChain;
      if (mc.states && mc.transitions) {
        const transitionSums = new Map<string, number>();

        for (const t of mc.transitions) {
          const current = transitionSums.get(t.fromState) || 0;
          transitionSums.set(t.fromState, current + (t.probability || 0));
        }

        for (const [state, sum] of transitionSums) {
          if (Math.abs(sum - 1) > 0.01) {
            warnings.push(
              createValidationWarning(
                `markovChain.transitions[${state}]`,
                `Transition probabilities from state "${state}" sum to ${sum.toFixed(3)}, should be 1.0`,
                'Ensure outgoing transition probabilities sum to 1'
              )
            );
          }
        }
      }

      // Validate initial distribution sums to 1
      if (mc.initialDistribution) {
        const sum = Object.values(mc.initialDistribution as Record<string, number>).reduce(
          (a: number, b: number) => a + b,
          0
        );
        if (Math.abs(sum - 1) > 0.01) {
          warnings.push(
            createValidationWarning(
              'markovChain.initialDistribution',
              `Initial distribution sums to ${sum.toFixed(3)}, should be 1.0`,
              'Normalize initial state probabilities'
            )
          );
        }
      }
    }

    // Validate random variable parameters
    if (inputAny.randomVariables) {
      for (let i = 0; i < inputAny.randomVariables.length; i++) {
        const rv = inputAny.randomVariables[i];
        const issues = this.validateDistributionParameters(rv.distribution, rv.parameters);
        for (const issue of issues) {
          warnings.push(
            createValidationWarning(`randomVariables[${i}]`, issue, 'Check distribution parameters')
          );
        }
      }
    }

    // Validate simulation results
    if (inputAny.simulationResults) {
      for (let i = 0; i < inputAny.simulationResults.length; i++) {
        const sr = inputAny.simulationResults[i];
        if (sr.iterations !== undefined && sr.iterations < 100) {
          warnings.push(
            createValidationWarning(
              `simulationResults[${i}].iterations`,
              `Low iteration count (${sr.iterations})`,
              'Use at least 1000 iterations for reliable Monte Carlo estimates'
            )
          );
        }
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get stochastic-specific enhancements
   */
  getEnhancements(thought: Thought): ModeEnhancements {
    const stochThought = thought as StochasticThought;
    // Access markov chain from any input structure
    const thoughtAny = thought as any;
    const markovChain = thoughtAny.markovChain as HandlerMarkovChain | undefined;
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.BAYESIAN, ThinkingMode.OPTIMIZATION, ThinkingMode.TEMPORAL],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        stateCount: markovChain?.states.length || 0,
        transitionCount: markovChain?.transitions.length || 0,
        randomVariableCount: thoughtAny.randomVariables?.length || 0,
        stepCount: stochThought.stepCount,
      },
      mentalModels: [
        'Markov Property',
        'Law of Large Numbers',
        'Central Limit Theorem',
        'Ergodic Theory',
        'Queuing Theory',
      ],
    };

    // Process type info
    enhancements.suggestions!.push(`Process type: ${stochThought.processType.replace(/_/g, ' ')}`);

    // Thought type-specific guidance
    switch (stochThought.thoughtType) {
      case 'process_definition':
        enhancements.guidingQuestions!.push(
          'What are the states of the process?',
          'Are transitions time-homogeneous?',
          'Does the process satisfy the Markov property?'
        );
        if (markovChain) {
          enhancements.suggestions!.push(
            `States: ${markovChain.states.length}, Transitions: ${markovChain.transitions.length}`
          );
        }
        break;

      case 'transition_analysis':
        enhancements.guidingQuestions!.push(
          'What is the probability of transitioning from state A to state B?',
          'Are there absorbing states?',
          'What is the expected number of steps to reach a target state?'
        );
        if (markovChain) {
          const absorbingCount = markovChain.states.filter((s) => s.isAbsorbing).length;
          if (absorbingCount > 0) {
            enhancements.suggestions!.push(`Absorbing states: ${absorbingCount}`);
          }
        }
        break;

      case 'steady_state_analysis':
        enhancements.guidingQuestions!.push(
          'Does a stationary distribution exist?',
          'Is the chain irreducible and aperiodic?',
          'What are the long-run probabilities?'
        );
        if (markovChain) {
          if (markovChain.isErgodic) {
            enhancements.suggestions!.push('Chain is ergodic - unique stationary distribution exists');
          } else if (markovChain.isIrreducible === false) {
            enhancements.warnings!.push('Chain is reducible - multiple stationary distributions possible');
          }
          if (markovChain.period && markovChain.period > 1) {
            enhancements.warnings!.push(
              `Chain is periodic (period=${markovChain.period}) - no stationary distribution`
            );
          }
        }
        break;

      case 'random_variable_definition':
        enhancements.guidingQuestions!.push(
          'What is the expected value of the random variable?',
          'What is the variance?',
          'Are there any constraints on the variable?'
        );
        if (thoughtAny.randomVariables) {
          for (const rv of thoughtAny.randomVariables) {
            if (rv.expectedValue !== undefined) {
              enhancements.suggestions!.push(
                `${rv.name}: E[X] = ${rv.expectedValue.toFixed(4)}, Var[X] = ${rv.variance?.toFixed(4) || 'unknown'}`
              );
            }
          }
        }
        break;

      case 'monte_carlo_simulation':
        enhancements.guidingQuestions!.push(
          'How many iterations are sufficient?',
          'What is the confidence interval?',
          'Has the simulation converged?'
        );
        if (thoughtAny.simulationResults) {
          for (const sr of thoughtAny.simulationResults) {
            enhancements.suggestions!.push(
              `Simulation (n=${sr.iterations}): mean=${sr.mean.toFixed(4)}, var=${sr.variance.toFixed(4)}`
            );
            if (sr.confidenceInterval) {
              enhancements.suggestions!.push(
                `95% CI: [${sr.confidenceInterval[0].toFixed(4)}, ${sr.confidenceInterval[1].toFixed(4)}]`
              );
            }
          }
        }
        break;

      case 'convergence_analysis':
        enhancements.guidingQuestions!.push(
          'At what rate does the process converge?',
          'Is convergence guaranteed?',
          'What is the mixing time?'
        );
        if (thoughtAny.convergenceRate !== undefined) {
          enhancements.suggestions!.push(`Convergence rate: ${thoughtAny.convergenceRate.toFixed(4)}`);
        }
        break;

      case 'hitting_time_analysis':
        enhancements.guidingQuestions!.push(
          'What is the expected time to reach a target state?',
          'What is the probability of reaching the target before returning to start?',
          'Are there multiple paths to consider?'
        );
        break;
    }

    // Process-specific suggestions
    switch (stochThought.processType) {
      case 'queueing':
        enhancements.mentalModels!.push("Little's Law", 'M/M/1 Queue', 'Birth-Death Process');
        enhancements.suggestions!.push('Consider arrival rate λ and service rate μ');
        break;
      case 'random_walk':
        enhancements.mentalModels!.push('Gambler\'s Ruin', 'Recurrence', 'Transience');
        break;
      case 'birth_death':
        enhancements.mentalModels!.push('Population Dynamics', 'Balance Equations');
        break;
    }

    // Warn about low step counts
    if (stochThought.stepCount < 10 && stochThought.thoughtType === 'convergence_analysis') {
      enhancements.warnings!.push('Low step count - convergence analysis may be unreliable');
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as StochasticThoughtType);
  }

  /**
   * Resolve thought type from input
   */
  private resolveThoughtType(inputType: string | undefined): StochasticThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as StochasticThoughtType)) {
      return inputType as StochasticThoughtType;
    }
    return 'process_definition';
  }

  /**
   * Resolve process type from input
   */
  private resolveProcessType(inputType: string | undefined): ProcessType {
    if (inputType && VALID_PROCESS_TYPES.includes(inputType as ProcessType)) {
      return inputType as ProcessType;
    }
    return 'discrete_time';
  }

  /**
   * Normalize Markov chain
   */
  private normalizeMarkovChain(mc: any): HandlerMarkovChain {
    const states = (mc.states || []).map((s: any) => this.normalizeState(s));
    const transitions = (mc.transitions || []).map((t: any) => this.normalizeTransition(t));

    // Determine chain properties
    const isIrreducible = mc.isIrreducible ?? this.checkIrreducibility(states, transitions);
    const period = mc.period ?? 1;
    const isErgodic = mc.isErgodic ?? (isIrreducible && period === 1);

    return {
      id: mc.id || randomUUID(),
      name: mc.name || '',
      states,
      transitions,
      initialDistribution: mc.initialDistribution || {},
      isErgodic,
      isIrreducible,
      period,
    };
  }

  /**
   * Normalize state
   */
  private normalizeState(state: any): StochasticState {
    return {
      id: state.id || randomUUID(),
      name: state.name || '',
      description: state.description,
      probability: state.probability,
      isAbsorbing: state.isAbsorbing ?? false,
      isTransient: state.isTransient,
    };
  }

  /**
   * Normalize transition
   */
  private normalizeTransition(transition: any): StateTransition {
    return {
      id: transition.id || randomUUID(),
      fromState: transition.fromState || '',
      toState: transition.toState || '',
      probability: Math.max(0, Math.min(1, transition.probability ?? 0)),
      condition: transition.condition,
    };
  }

  /**
   * Normalize random variable
   */
  private normalizeRandomVariable(rv: any): RandomVariable {
    const normalized: RandomVariable = {
      id: rv.id || randomUUID(),
      name: rv.name || '',
      distribution: rv.distribution || 'uniform',
      parameters: rv.parameters || {},
      expectedValue: rv.expectedValue,
      variance: rv.variance,
    };

    // Calculate expected value and variance if not provided
    if (normalized.expectedValue === undefined || normalized.variance === undefined) {
      const stats = this.calculateDistributionStats(normalized.distribution, normalized.parameters);
      if (normalized.expectedValue === undefined) normalized.expectedValue = stats.mean;
      if (normalized.variance === undefined) normalized.variance = stats.variance;
    }

    return normalized;
  }

  /**
   * Normalize simulation result
   */
  private normalizeSimulationResult(sr: any): SimulationResult {
    return {
      id: sr.id || randomUUID(),
      iterations: sr.iterations || 0,
      mean: sr.mean || 0,
      variance: sr.variance || 0,
      confidenceInterval: sr.confidenceInterval,
      samples: sr.samples,
    };
  }

  /**
   * Check if chain is irreducible (simplified check)
   */
  private checkIrreducibility(states: StochasticState[], transitions: StateTransition[]): boolean {
    if (states.length === 0) return true;
    if (states.length === 1) return true;

    // Build adjacency map
    const adj = new Map<string, Set<string>>();
    for (const s of states) {
      adj.set(s.id, new Set());
    }
    for (const t of transitions) {
      if (t.probability > 0 && adj.has(t.fromState)) {
        adj.get(t.fromState)!.add(t.toState);
      }
    }

    // Check if all states reachable from first state
    const visited = new Set<string>();
    const queue = [states[0].id];
    visited.add(states[0].id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const next of adj.get(current) || []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }

    return visited.size === states.length;
  }

  /**
   * Validate distribution parameters
   */
  private validateDistributionParameters(distribution: string, params: Record<string, number>): string[] {
    const issues: string[] = [];

    switch (distribution) {
      case 'normal':
      case 'gaussian':
        if (params.variance !== undefined && params.variance < 0) {
          issues.push('Normal distribution variance must be non-negative');
        }
        break;
      case 'exponential':
        if (params.lambda !== undefined && params.lambda <= 0) {
          issues.push('Exponential distribution lambda must be positive');
        }
        break;
      case 'poisson':
        if (params.lambda !== undefined && params.lambda < 0) {
          issues.push('Poisson distribution lambda must be non-negative');
        }
        break;
      case 'uniform':
        if (params.a !== undefined && params.b !== undefined && params.a >= params.b) {
          issues.push('Uniform distribution requires a < b');
        }
        break;
      case 'binomial':
        if (params.n !== undefined && params.n < 0) {
          issues.push('Binomial n must be non-negative');
        }
        if (params.p !== undefined && (params.p < 0 || params.p > 1)) {
          issues.push('Binomial p must be in [0, 1]');
        }
        break;
    }

    return issues;
  }

  /**
   * Calculate distribution statistics
   */
  private calculateDistributionStats(
    distribution: string,
    params: Record<string, number>
  ): { mean?: number; variance?: number } {
    switch (distribution) {
      case 'normal':
      case 'gaussian':
        return { mean: params.mu || params.mean || 0, variance: params.variance || params.sigma2 || 1 };
      case 'exponential':
        const lambda = params.lambda || params.rate || 1;
        return { mean: 1 / lambda, variance: 1 / (lambda * lambda) };
      case 'poisson':
        const poissonLambda = params.lambda || 1;
        return { mean: poissonLambda, variance: poissonLambda };
      case 'uniform':
        const a = params.a ?? params.min ?? 0;
        const b = params.b ?? params.max ?? 1;
        return { mean: (a + b) / 2, variance: ((b - a) ** 2) / 12 };
      case 'binomial':
        const n = params.n || 1;
        const p = params.p || 0.5;
        return { mean: n * p, variance: n * p * (1 - p) };
      default:
        return {};
    }
  }
}
