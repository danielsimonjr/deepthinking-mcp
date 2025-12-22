/**
 * Strategic Mode Integration Tests - Optimization
 *
 * Tests T-STR-021 through T-STR-030: Comprehensive integration tests
 * for the deepthinking_strategic tool with optimization mode.
 *
 * Phase 11 Sprint 5: Causal & Strategic Modes Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type OptimizationThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { assertInRange } from '../../utils/assertion-helpers.js';

// ============================================================================
// OPTIMIZATION MODE MOCK DATA
// ============================================================================

const SAMPLE_PROBLEM_LINEAR = {
  id: 'problem-1',
  name: 'Production Planning',
  description: 'Maximize profit from production',
  type: 'linear' as const,
  approach: 'exact' as const,
  complexity: 'P',
};

const SAMPLE_PROBLEM_QUADRATIC = {
  id: 'problem-2',
  name: 'Portfolio Optimization',
  description: 'Minimize risk while achieving target return',
  type: 'nonlinear' as const,
  approach: 'exact' as const,
  complexity: 'P',
};

const SAMPLE_PROBLEM_INTEGER = {
  id: 'problem-3',
  name: 'Facility Location',
  description: 'Select optimal facility locations',
  type: 'integer' as const,
  approach: 'exact' as const,
  complexity: 'NP-hard',
};

const SAMPLE_PROBLEM_MULTI = {
  id: 'problem-4',
  name: 'Multi-Objective Design',
  description: 'Balance cost, performance, and reliability',
  type: 'multi_objective' as const,
  approach: 'heuristic' as const,
  complexity: 'NP-hard',
};

const SAMPLE_VARIABLES = [
  {
    id: 'x1',
    name: 'Product A quantity',
    description: 'Units of Product A to produce',
    type: 'continuous' as const,
    domain: { type: 'continuous' as const, lowerBound: 0, upperBound: 100 },
    unit: 'units',
    semantics: 'Quantity of Product A in production plan',
  },
  {
    id: 'x2',
    name: 'Product B quantity',
    description: 'Units of Product B to produce',
    type: 'continuous' as const,
    domain: { type: 'continuous' as const, lowerBound: 0, upperBound: 80 },
    unit: 'units',
    semantics: 'Quantity of Product B in production plan',
  },
];

const SAMPLE_CONSTRAINTS = [
  {
    id: 'c1',
    name: 'Labor constraint',
    description: 'Total labor hours cannot exceed capacity',
    type: 'hard' as const,
    formula: '2*x1 + 3*x2 <= 120',
    latex: '2x_1 + 3x_2 \\leq 120',
    variables: ['x1', 'x2'],
    rationale: 'Limited workforce availability',
  },
  {
    id: 'c2',
    name: 'Material constraint',
    description: 'Total material usage cannot exceed supply',
    type: 'hard' as const,
    formula: '4*x1 + 2*x2 <= 200',
    latex: '4x_1 + 2x_2 \\leq 200',
    variables: ['x1', 'x2'],
    rationale: 'Limited raw material supply',
  },
  {
    id: 'c3',
    name: 'Minimum production',
    description: 'Must produce at least some of each product',
    type: 'soft' as const,
    formula: 'x1 >= 10',
    latex: 'x_1 \\geq 10',
    variables: ['x1'],
    penalty: 50,
    rationale: 'Contractual obligation',
    priority: 2,
  },
];

const SAMPLE_OBJECTIVES = [
  {
    id: 'obj1',
    name: 'Maximize Profit',
    description: 'Maximize total profit from production',
    type: 'maximize' as const,
    formula: '50*x1 + 40*x2',
    latex: '50x_1 + 40x_2',
    variables: ['x1', 'x2'],
    units: 'dollars',
  },
];

const SAMPLE_OBJECTIVES_MULTI = [
  {
    id: 'obj1',
    name: 'Maximize Profit',
    description: 'Maximize total profit',
    type: 'maximize' as const,
    formula: '50*x1 + 40*x2',
    variables: ['x1', 'x2'],
    weight: 0.6,
    units: 'dollars',
  },
  {
    id: 'obj2',
    name: 'Minimize Risk',
    description: 'Minimize production risk',
    type: 'minimize' as const,
    formula: '0.1*x1^2 + 0.2*x2^2',
    variables: ['x1', 'x2'],
    weight: 0.4,
    units: 'risk units',
  },
];

const SAMPLE_SOLUTION = {
  id: 'sol-1',
  type: 'optimal' as const,
  variableValues: { x1: 30, x2: 20 },
  objectiveValues: { obj1: 2300 },
  constraintSatisfaction: [
    { constraintId: 'c1', satisfied: true },
    { constraintId: 'c2', satisfied: true },
    { constraintId: 'c3', satisfied: true },
  ],
  quality: 1.0,
  computationTime: 15,
  iterations: 25,
  method: 'Simplex',
  guarantees: ['proven optimal'],
};

const SAMPLE_SENSITIVITY = {
  id: 'sens-1',
  parameters: [
    {
      parameterId: 'c1',
      type: 'constraint' as const,
      currentValue: 120,
      allowableIncrease: 20,
      allowableDecrease: 10,
      impact: 'high' as const,
      analysis: 'Labor constraint is binding',
    },
  ],
  robustness: 0.85,
  criticalConstraints: ['c1', 'c2'],
  shadowPrices: { c1: 12.5, c2: 7.5 },
  recommendations: ['Consider overtime to relax labor constraint'],
};

// ============================================================================
// OPTIMIZATION THOUGHT FACTORIES
// ============================================================================

function createBaseOptimizationInput(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Formulating optimization problem',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'optimization',
    ...overrides,
  } as ThinkingToolInput;
}

function createOptimizationWithProblem(
  problem: typeof SAMPLE_PROBLEM_LINEAR,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createBaseOptimizationInput({
    problem,
    ...overrides,
  });
}

function createLinearProgramSetup(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createBaseOptimizationInput({
    problem: SAMPLE_PROBLEM_LINEAR,
    variables: SAMPLE_VARIABLES,
    optimizationConstraints: SAMPLE_CONSTRAINTS,
    objectives: SAMPLE_OBJECTIVES,
    ...overrides,
  });
}

// ============================================================================
// TESTS
// ============================================================================

describe('Strategic Mode Integration Tests - Optimization', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-STR-021: Basic optimization thought
   */
  describe('T-STR-021: Basic Optimization Thought', () => {
    it('should create a basic optimization thought with minimal params', () => {
      const input = createBaseOptimizationInput({
        thought: 'Defining optimization problem',
      });

      const thought = factory.createThought(input, 'session-opt-021');

      expect(thought.mode).toBe(ThinkingMode.OPTIMIZATION);
      expect(thought.content).toBe('Defining optimization problem');
      expect(thought.sessionId).toBe('session-opt-021');
    });

    it('should assign unique IDs to optimization thoughts', () => {
      const input1 = createBaseOptimizationInput({ thought: 'First optimization' });
      const input2 = createBaseOptimizationInput({ thought: 'Second optimization' });

      const thought1 = factory.createThought(input1, 'session-opt-021');
      const thought2 = factory.createThought(input2, 'session-opt-021');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-STR-022: Optimization with objectiveFunction
   */
  describe('T-STR-022: Optimization with Objective Function', () => {
    it('should include objective function in thought', () => {
      const input = createLinearProgramSetup();

      const thought = factory.createThought(input, 'session-opt-022') as OptimizationThought;

      expect(thought.objectives).toHaveLength(1);
      expect(thought.objectives![0].formula).toBe('50*x1 + 40*x2');
      expect(thought.objectives![0].type).toBe('maximize');
    });

    it('should preserve objective metadata', () => {
      const input = createLinearProgramSetup();

      const thought = factory.createThought(input, 'session-opt-022') as OptimizationThought;

      expect(thought.objectives![0].name).toBe('Maximize Profit');
      expect(thought.objectives![0].units).toBe('dollars');
      expect(thought.objectives![0].variables).toContain('x1');
      expect(thought.objectives![0].variables).toContain('x2');
    });
  });

  /**
   * T-STR-023: Optimization with constraints array
   */
  describe('T-STR-023: Optimization with Constraints Array', () => {
    it('should include constraints in thought', () => {
      const input = createLinearProgramSetup();

      const thought = factory.createThought(input, 'session-opt-023') as OptimizationThought;

      expect(thought.optimizationConstraints).toHaveLength(3);
    });

    it('should distinguish hard and soft constraints', () => {
      const input = createLinearProgramSetup();

      const thought = factory.createThought(input, 'session-opt-023') as OptimizationThought;

      const hardConstraints = thought.optimizationConstraints!.filter(c => c.type === 'hard');
      const softConstraints = thought.optimizationConstraints!.filter(c => c.type === 'soft');

      expect(hardConstraints).toHaveLength(2);
      expect(softConstraints).toHaveLength(1);
    });

    it('should include constraint formulas', () => {
      const input = createLinearProgramSetup();

      const thought = factory.createThought(input, 'session-opt-023') as OptimizationThought;

      expect(thought.optimizationConstraints![0].formula).toBe('2*x1 + 3*x2 <= 120');
      expect(thought.optimizationConstraints![0].latex).toBe('2x_1 + 3x_2 \\leq 120');
    });
  });

  /**
   * T-STR-024: Optimization with optimizationMethod
   */
  describe('T-STR-024: Optimization with Method', () => {
    it('should specify problem approach', () => {
      const input = createOptimizationWithProblem(SAMPLE_PROBLEM_LINEAR);

      const thought = factory.createThought(input, 'session-opt-024') as OptimizationThought;

      expect(thought.problem?.approach).toBe('exact');
    });

    it('should track problem complexity', () => {
      const input = createOptimizationWithProblem(SAMPLE_PROBLEM_INTEGER);

      const thought = factory.createThought(input, 'session-opt-024') as OptimizationThought;

      expect(thought.problem?.complexity).toBe('NP-hard');
    });
  });

  /**
   * T-STR-025: Optimization with solution.variables
   */
  describe('T-STR-025: Optimization with Solution Variables', () => {
    it('should include variable values in solution', () => {
      const input = createLinearProgramSetup({
        solution: SAMPLE_SOLUTION,
      });

      const thought = factory.createThought(input, 'session-opt-025') as OptimizationThought;

      expect(thought.solution?.variableValues).toBeDefined();
      expect(thought.solution!.variableValues['x1']).toBe(30);
      expect(thought.solution!.variableValues['x2']).toBe(20);
    });
  });

  /**
   * T-STR-026: Optimization with solution.value
   */
  describe('T-STR-026: Optimization with Solution Value', () => {
    it('should include objective values in solution', () => {
      const input = createLinearProgramSetup({
        solution: SAMPLE_SOLUTION,
      });

      const thought = factory.createThought(input, 'session-opt-026') as OptimizationThought;

      expect(thought.solution?.objectiveValues).toBeDefined();
      expect(thought.solution!.objectiveValues['obj1']).toBe(2300);
    });

    it('should track solution quality', () => {
      const input = createLinearProgramSetup({
        solution: SAMPLE_SOLUTION,
      });

      const thought = factory.createThought(input, 'session-opt-026') as OptimizationThought;

      expect(thought.solution?.quality).toBe(1.0);
      expect(thought.solution?.type).toBe('optimal');
    });

    it('should track solution method and guarantees', () => {
      const input = createLinearProgramSetup({
        solution: SAMPLE_SOLUTION,
      });

      const thought = factory.createThought(input, 'session-opt-026') as OptimizationThought;

      expect(thought.solution?.method).toBe('Simplex');
      expect(thought.solution?.guarantees).toContain('proven optimal');
    });
  });

  /**
   * T-STR-027: Optimization linear programming
   */
  describe('T-STR-027: Optimization Linear Programming', () => {
    it('should model linear programming problem', () => {
      const input = createLinearProgramSetup();

      const thought = factory.createThought(input, 'session-opt-027') as OptimizationThought;

      expect(thought.problem?.type).toBe('linear');
      expect(thought.variables).toHaveLength(2);
      expect(thought.optimizationConstraints).toHaveLength(3);
      expect(thought.objectives).toHaveLength(1);
    });

    it('should handle LP solution with constraint satisfaction', () => {
      const input = createLinearProgramSetup({
        solution: SAMPLE_SOLUTION,
      });

      const thought = factory.createThought(input, 'session-opt-027') as OptimizationThought;

      const allSatisfied = thought.solution!.constraintSatisfaction.every(c => c.satisfied);
      expect(allSatisfied).toBe(true);
    });
  });

  /**
   * T-STR-028: Optimization quadratic programming
   */
  describe('T-STR-028: Optimization Quadratic Programming', () => {
    it('should model quadratic programming problem', () => {
      const input = createOptimizationWithProblem(SAMPLE_PROBLEM_QUADRATIC, {
        variables: SAMPLE_VARIABLES,
        objectives: [{
          id: 'obj-qp',
          name: 'Minimize Variance',
          description: 'Minimize portfolio variance',
          type: 'minimize' as const,
          formula: 'x1^2 + 2*x1*x2 + x2^2',
          variables: ['x1', 'x2'],
        }],
      });

      const thought = factory.createThought(input, 'session-opt-028') as OptimizationThought;

      expect(thought.problem?.type).toBe('nonlinear');
      expect(thought.objectives![0].formula).toContain('^2');
    });
  });

  /**
   * T-STR-029: Optimization integer programming
   */
  describe('T-STR-029: Optimization Integer Programming', () => {
    it('should model integer programming problem', () => {
      const integerVariables = [
        {
          id: 'y1',
          name: 'Facility 1',
          description: 'Whether to build facility 1',
          type: 'binary' as const,
          domain: { type: 'binary' as const },
          semantics: 'Binary decision for facility 1',
        },
        {
          id: 'y2',
          name: 'Facility 2',
          description: 'Whether to build facility 2',
          type: 'binary' as const,
          domain: { type: 'binary' as const },
          semantics: 'Binary decision for facility 2',
        },
      ];

      const input = createOptimizationWithProblem(SAMPLE_PROBLEM_INTEGER, {
        variables: integerVariables,
      });

      const thought = factory.createThought(input, 'session-opt-029') as OptimizationThought;

      expect(thought.problem?.type).toBe('integer');
      expect(thought.variables![0].type).toBe('binary');
      expect(thought.variables![1].type).toBe('binary');
    });

    it('should handle IP complexity', () => {
      const input = createOptimizationWithProblem(SAMPLE_PROBLEM_INTEGER);

      const thought = factory.createThought(input, 'session-opt-029') as OptimizationThought;

      expect(thought.problem?.complexity).toBe('NP-hard');
    });
  });

  /**
   * T-STR-030: Optimization multi-objective
   */
  describe('T-STR-030: Optimization Multi-Objective', () => {
    it('should model multi-objective optimization problem', () => {
      const input = createOptimizationWithProblem(SAMPLE_PROBLEM_MULTI, {
        variables: SAMPLE_VARIABLES,
        objectives: SAMPLE_OBJECTIVES_MULTI,
      });

      const thought = factory.createThought(input, 'session-opt-030') as OptimizationThought;

      expect(thought.problem?.type).toBe('multi_objective');
      expect(thought.objectives).toHaveLength(2);
    });

    it('should include objective weights', () => {
      const input = createOptimizationWithProblem(SAMPLE_PROBLEM_MULTI, {
        objectives: SAMPLE_OBJECTIVES_MULTI,
      });

      const thought = factory.createThought(input, 'session-opt-030') as OptimizationThought;

      expect(thought.objectives![0].weight).toBe(0.6);
      expect(thought.objectives![1].weight).toBe(0.4);
    });

    it('should support conflicting objectives', () => {
      const input = createOptimizationWithProblem(SAMPLE_PROBLEM_MULTI, {
        objectives: SAMPLE_OBJECTIVES_MULTI,
      });

      const thought = factory.createThought(input, 'session-opt-030') as OptimizationThought;

      const maxObjective = thought.objectives!.find(o => o.type === 'maximize');
      const minObjective = thought.objectives!.find(o => o.type === 'minimize');

      expect(maxObjective).toBeDefined();
      expect(minObjective).toBeDefined();
    });

    it('should support sensitivity analysis for multi-objective', () => {
      const input = createLinearProgramSetup({
        analysis: SAMPLE_SENSITIVITY,
      });

      const thought = factory.createThought(input, 'session-opt-030') as OptimizationThought;

      expect(thought.analysis).toBeDefined();
      expect(thought.analysis!.robustness).toBe(0.85);
      assertInRange(thought.analysis!.robustness, 0, 1);
      expect(thought.analysis!.criticalConstraints).toContain('c1');
    });
  });
});
