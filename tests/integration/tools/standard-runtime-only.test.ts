/**
 * Standard Workflows Integration Tests - Runtime-Only Modes
 *
 * Tests T-STD-031 through T-STD-038: Integration tests for runtime-only modes
 * that are activated via Hybrid mode: Recursive, Modal, Stochastic, Constraint.
 *
 * These modes have dedicated thought types but are typically accessed through
 * the hybrid mode system or directly through their specialized handlers.
 *
 * Phase 11 Sprint 2: Standard Workflows & Common Parameters
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { RecursiveThought } from '../../../src/types/modes/recursive.js';
import type { ModalThought } from '../../../src/types/modes/modal.js';
import type { StochasticThought } from '../../../src/types/modes/stochastic.js';
import type { ConstraintThought } from '../../../src/types/modes/constraint.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

/**
 * Create a basic Hybrid thought that activates a runtime-only mode
 */
function createHybridWithMode(
  runtimeMode: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: `${runtimeMode} reasoning step`,
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'hybrid',
    activeModes: [runtimeMode],
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create a direct mode thought (not via hybrid)
 */
function createDirectModeThought(
  mode: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: `Direct ${mode} reasoning`,
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: mode as any,
    ...overrides,
  } as ThinkingToolInput;
}

describe('Standard Workflows Integration - Runtime-Only Modes', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-STD-031: Recursive mode basic activation via hybrid
   */
  describe('T-STD-031: Recursive Mode Basic Activation', () => {
    it('should activate recursive mode via hybrid', () => {
      const input = createHybridWithMode('recursive', {
        thought: 'Activating recursive reasoning',
      });

      const thought = factory.createThought(input, 'session-std-031');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
      expect(thought.content).toContain('recursive');
    });

    it('should create direct recursive mode thought', () => {
      const input = createDirectModeThought('recursive', {
        thought: 'Direct recursive problem decomposition',
        thoughtType: 'problem_decomposition',
      });

      const thought = factory.createThought(input, 'session-std-031') as RecursiveThought;

      expect(thought.mode).toBe(ThinkingMode.RECURSIVE);
    });

    it('should handle basic recursive thought properties', () => {
      const input = createDirectModeThought('recursive', {
        thought: 'Identifying base case',
        thoughtType: 'base_case_identification',
      });

      const thought = factory.createThought(input, 'session-std-031') as RecursiveThought;

      expect(thought.mode).toBe(ThinkingMode.RECURSIVE);
      expect(thought.thoughtType).toBe('base_case_identification');
    });
  });

  /**
   * T-STD-032: Recursive mode multi-level reasoning session
   */
  describe('T-STD-032: Recursive Multi-Level Reasoning', () => {
    it('should handle recursive problem decomposition session', () => {
      const sessionId = 'session-std-032';

      const inputs: ThinkingToolInput[] = [
        createDirectModeThought('recursive', {
          thought: 'Decomposing problem into subproblems',
          thoughtNumber: 1,
          totalThoughts: 4,
          thoughtType: 'problem_decomposition',
        }),
        createDirectModeThought('recursive', {
          thought: 'Identifying base case conditions',
          thoughtNumber: 2,
          totalThoughts: 4,
          thoughtType: 'base_case_identification',
        }),
        createDirectModeThought('recursive', {
          thought: 'Defining recursive case',
          thoughtNumber: 3,
          totalThoughts: 4,
          thoughtType: 'recursive_case_definition',
        }),
        createDirectModeThought('recursive', {
          thought: 'Combining subproblem solutions',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
          thoughtType: 'solution_combination',
        }),
      ];

      const thoughts = inputs.map((input) =>
        factory.createThought(input, sessionId)
      ) as RecursiveThought[];

      expect(thoughts).toHaveLength(4);
      thoughts.forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.RECURSIVE);
      });
    });

    it('should track depth in recursive reasoning', () => {
      const input = createDirectModeThought('recursive', {
        thought: 'Processing at recursion depth 3',
        thoughtType: 'recursive_step',
      });

      const thought = factory.createThought(input, 'session-std-032b') as RecursiveThought;

      expect(thought.mode).toBe(ThinkingMode.RECURSIVE);
      // The handler should set default values for recursive properties
      expect(thought.currentDepth).toBeDefined();
      expect(thought.maxDepth).toBeDefined();
    });
  });

  /**
   * T-STD-033: Modal mode basic activation via hybrid
   */
  describe('T-STD-033: Modal Mode Basic Activation', () => {
    it('should activate modal mode via hybrid', () => {
      const input = createHybridWithMode('modal', {
        thought: 'Activating modal logic reasoning',
      });

      const thought = factory.createThought(input, 'session-std-033');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should create direct modal mode thought', () => {
      const input = createDirectModeThought('modal', {
        thought: 'Defining possible worlds',
        thoughtType: 'world_definition',
      });

      const thought = factory.createThought(input, 'session-std-033') as ModalThought;

      expect(thought.mode).toBe(ThinkingMode.MODAL);
    });

    it('should handle modal domain specification', () => {
      const input = createDirectModeThought('modal', {
        thought: 'Epistemic modal analysis',
        thoughtType: 'proposition_analysis',
        modalDomain: 'epistemic',
      });

      const thought = factory.createThought(input, 'session-std-033') as ModalThought;

      expect(thought.mode).toBe(ThinkingMode.MODAL);
      expect(thought.modalDomain).toBeDefined();
    });
  });

  /**
   * T-STD-034: Modal mode with possibility/necessity analysis
   * Note: Modal handler valid thoughtTypes are:
   * world_definition, proposition_analysis, accessibility_analysis,
   * necessity_proof, possibility_proof, modal_inference, countermodel
   */
  describe('T-STD-034: Modal Possibility/Necessity Analysis', () => {
    it('should handle necessity proof', () => {
      const input = createDirectModeThought('modal', {
        thought: 'Proving if proposition is necessarily true',
        thoughtType: 'necessity_proof',
      });

      const thought = factory.createThought(input, 'session-std-034') as ModalThought;

      expect(thought.mode).toBe(ThinkingMode.MODAL);
      expect(thought.thoughtType).toBe('necessity_proof');
    });

    it('should handle possibility proof', () => {
      const input = createDirectModeThought('modal', {
        thought: 'Proving if proposition is possibly true',
        thoughtType: 'possibility_proof',
      });

      const thought = factory.createThought(input, 'session-std-034') as ModalThought;

      expect(thought.mode).toBe(ThinkingMode.MODAL);
      expect(thought.thoughtType).toBe('possibility_proof');
    });

    it('should create complete modal analysis session', () => {
      const sessionId = 'session-std-034b';

      const inputs: ThinkingToolInput[] = [
        createDirectModeThought('modal', {
          thought: 'Defining possible worlds for analysis',
          thoughtNumber: 1,
          totalThoughts: 3,
          thoughtType: 'world_definition',
        }),
        createDirectModeThought('modal', {
          thought: 'Establishing accessibility relations',
          thoughtNumber: 2,
          totalThoughts: 3,
          thoughtType: 'accessibility_analysis',
        }),
        createDirectModeThought('modal', {
          thought: 'Proving necessity of proposition',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
          thoughtType: 'necessity_proof',
        }),
      ];

      const thoughts = inputs.map((input) =>
        factory.createThought(input, sessionId)
      ) as ModalThought[];

      expect(thoughts).toHaveLength(3);
      thoughts.forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.MODAL);
      });
    });
  });

  /**
   * T-STD-035: Stochastic mode basic activation via hybrid
   */
  describe('T-STD-035: Stochastic Mode Basic Activation', () => {
    it('should activate stochastic mode via hybrid', () => {
      const input = createHybridWithMode('stochastic', {
        thought: 'Activating stochastic reasoning',
      });

      const thought = factory.createThought(input, 'session-std-035');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should create direct stochastic mode thought', () => {
      const input = createDirectModeThought('stochastic', {
        thought: 'Defining stochastic process',
        thoughtType: 'process_definition',
      });

      const thought = factory.createThought(input, 'session-std-035') as StochasticThought;

      expect(thought.mode).toBe(ThinkingMode.STOCHASTIC);
    });

    it('should handle process type specification', () => {
      const input = createDirectModeThought('stochastic', {
        thought: 'Modeling as Markov chain',
        thoughtType: 'process_definition',
        processType: 'discrete_time',
      });

      const thought = factory.createThought(input, 'session-std-035') as StochasticThought;

      expect(thought.mode).toBe(ThinkingMode.STOCHASTIC);
      expect(thought.processType).toBeDefined();
    });
  });

  /**
   * T-STD-036: Stochastic mode probability sampling session
   * Note: Stochastic handler valid thoughtTypes are:
   * process_definition, transition_analysis, steady_state_analysis,
   * random_variable_definition, monte_carlo_simulation, convergence_analysis,
   * hitting_time_analysis
   */
  describe('T-STD-036: Stochastic Probability Sampling', () => {
    it('should handle steady state analysis', () => {
      const input = createDirectModeThought('stochastic', {
        thought: 'Analyzing steady state probabilities',
        thoughtType: 'steady_state_analysis',
      });

      const thought = factory.createThought(input, 'session-std-036') as StochasticThought;

      expect(thought.mode).toBe(ThinkingMode.STOCHASTIC);
      expect(thought.thoughtType).toBe('steady_state_analysis');
    });

    it('should handle Monte Carlo simulation step', () => {
      const input = createDirectModeThought('stochastic', {
        thought: 'Running Monte Carlo simulation',
        thoughtType: 'monte_carlo_simulation',
      });

      const thought = factory.createThought(input, 'session-std-036') as StochasticThought;

      expect(thought.mode).toBe(ThinkingMode.STOCHASTIC);
      expect(thought.thoughtType).toBe('monte_carlo_simulation');
    });

    it('should create stochastic analysis session', () => {
      const sessionId = 'session-std-036b';

      const inputs: ThinkingToolInput[] = [
        createDirectModeThought('stochastic', {
          thought: 'Defining the stochastic process',
          thoughtNumber: 1,
          totalThoughts: 4,
          thoughtType: 'process_definition',
        }),
        createDirectModeThought('stochastic', {
          thought: 'Modeling state transitions',
          thoughtNumber: 2,
          totalThoughts: 4,
          thoughtType: 'transition_analysis',
        }),
        createDirectModeThought('stochastic', {
          thought: 'Running Monte Carlo simulation',
          thoughtNumber: 3,
          totalThoughts: 4,
          thoughtType: 'monte_carlo_simulation',
        }),
        createDirectModeThought('stochastic', {
          thought: 'Checking convergence',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
          thoughtType: 'convergence_analysis',
        }),
      ];

      const thoughts = inputs.map((input) =>
        factory.createThought(input, sessionId)
      ) as StochasticThought[];

      expect(thoughts).toHaveLength(4);
      thoughts.forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.STOCHASTIC);
      });
    });
  });

  /**
   * T-STD-037: Constraint mode basic activation via hybrid
   */
  describe('T-STD-037: Constraint Mode Basic Activation', () => {
    it('should activate constraint mode via hybrid', () => {
      const input = createHybridWithMode('constraint', {
        thought: 'Activating constraint satisfaction reasoning',
      });

      const thought = factory.createThought(input, 'session-std-037');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should create direct constraint mode thought', () => {
      const input = createDirectModeThought('constraint', {
        thought: 'Formulating constraint satisfaction problem',
        thoughtType: 'problem_formulation',
      });

      const thought = factory.createThought(input, 'session-std-037') as ConstraintThought;

      expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
    });

    it('should handle variable definition', () => {
      const input = createDirectModeThought('constraint', {
        thought: 'Defining problem variables',
        thoughtType: 'variable_definition',
      });

      const thought = factory.createThought(input, 'session-std-037') as ConstraintThought;

      expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
      expect(thought.thoughtType).toBe('variable_definition');
    });
  });

  /**
   * T-STD-038: Constraint mode satisfaction solving session
   */
  describe('T-STD-038: Constraint Satisfaction Solving', () => {
    it('should handle constraint definition', () => {
      const input = createDirectModeThought('constraint', {
        thought: 'Defining constraints between variables',
        thoughtType: 'constraint_definition',
      });

      const thought = factory.createThought(input, 'session-std-038') as ConstraintThought;

      expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
      expect(thought.thoughtType).toBe('constraint_definition');
    });

    it('should handle arc consistency check', () => {
      const input = createDirectModeThought('constraint', {
        thought: 'Checking arc consistency',
        thoughtType: 'arc_consistency',
      });

      const thought = factory.createThought(input, 'session-std-038') as ConstraintThought;

      expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
    });

    it('should handle solution search', () => {
      const input = createDirectModeThought('constraint', {
        thought: 'Searching for solution',
        thoughtType: 'solution_search',
      });

      const thought = factory.createThought(input, 'session-std-038') as ConstraintThought;

      expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
      expect(thought.thoughtType).toBe('solution_search');
    });

    it('should handle backtracking', () => {
      const input = createDirectModeThought('constraint', {
        thought: 'Backtracking from failed assignment',
        thoughtType: 'backtracking',
      });

      const thought = factory.createThought(input, 'session-std-038') as ConstraintThought;

      expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
      expect(thought.thoughtType).toBe('backtracking');
    });

    it('should create complete CSP solving session', () => {
      const sessionId = 'session-std-038b';

      const inputs: ThinkingToolInput[] = [
        createDirectModeThought('constraint', {
          thought: 'Formulating the CSP',
          thoughtNumber: 1,
          totalThoughts: 5,
          thoughtType: 'problem_formulation',
        }),
        createDirectModeThought('constraint', {
          thought: 'Defining variables and domains',
          thoughtNumber: 2,
          totalThoughts: 5,
          thoughtType: 'variable_definition',
        }),
        createDirectModeThought('constraint', {
          thought: 'Establishing constraints',
          thoughtNumber: 3,
          totalThoughts: 5,
          thoughtType: 'constraint_definition',
        }),
        createDirectModeThought('constraint', {
          thought: 'Running domain reduction',
          thoughtNumber: 4,
          totalThoughts: 5,
          thoughtType: 'domain_reduction',
        }),
        createDirectModeThought('constraint', {
          thought: 'Finding satisfying assignment',
          thoughtNumber: 5,
          totalThoughts: 5,
          nextThoughtNeeded: false,
          thoughtType: 'solution_search',
        }),
      ];

      const thoughts = inputs.map((input) =>
        factory.createThought(input, sessionId)
      ) as ConstraintThought[];

      expect(thoughts).toHaveLength(5);
      thoughts.forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
      });
    });
  });
});
