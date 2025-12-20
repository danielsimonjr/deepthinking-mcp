/**
 * OptimizationHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for the Optimization reasoning handler:
 * - Problem formulation validation
 * - Constraint satisfaction checking
 * - Objective function analysis
 * - Solution quality assessment
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OptimizationHandler } from '../../../../src/modes/handlers/OptimizationHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('OptimizationHandler', () => {
  let handler: OptimizationHandler;

  beforeEach(() => {
    handler = new OptimizationHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.OPTIMIZATION);
    });

    it('should have correct modeName', () => {
      expect(handler.modeName).toBe('Optimization Analysis');
    });

    it('should have descriptive description', () => {
      expect(handler.description).toContain('optimization');
      expect(handler.description).toContain('objective');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Formulating optimization problem',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'optimization',
    };

    it('should create thought with default thought type', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.OPTIMIZATION);
      expect(thought.thoughtType).toBe('problem_formulation');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with specified thought type', () => {
      const input = { ...baseInput, thoughtType: 'solution_search' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.thoughtType).toBe('solution_search');
    });

    it('should process problem definition', () => {
      const input = {
        ...baseInput,
        problem: {
          name: 'Linear Program',
          description: 'Maximize profit',
          type: 'linear',
          approach: 'simplex',
          complexity: 'polynomial',
        },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.problem).toBeDefined();
      expect(thought.problem!.type).toBe('linear');
      expect(thought.problem!.approach).toBe('simplex');
    });

    it('should process decision variables', () => {
      const input = {
        ...baseInput,
        variables: [
          { name: 'x1', type: 'continuous', domain: { type: 'continuous', lowerBound: 0, upperBound: 100 } },
          { name: 'x2', type: 'integer', domain: { type: 'discrete', values: [0, 1, 2, 3] } },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.variables).toHaveLength(2);
      expect(thought.variables![0].type).toBe('continuous');
      expect(thought.variables![1].type).toBe('integer');
    });

    it('should process constraints', () => {
      const input = {
        ...baseInput,
        constraints: [
          { name: 'Resource A', formula: 'x1 + 2*x2 <= 100', type: 'hard', variables: ['x1', 'x2'] },
          { name: 'Resource B', formula: '3*x1 + x2 <= 150', type: 'soft', penalty: 10 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.optimizationConstraints).toHaveLength(2);
      expect(thought.optimizationConstraints![0].type).toBe('hard');
      expect(thought.optimizationConstraints![1].penalty).toBe(10);
    });

    it('should process objectives', () => {
      const input = {
        ...baseInput,
        objectives: [
          { name: 'Profit', formula: '5*x1 + 3*x2', type: 'maximize', weight: 0.7 },
          { name: 'Cost', formula: 'x1 + x2', type: 'minimize', weight: 0.3 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.objectives).toHaveLength(2);
      expect(thought.objectives![0].type).toBe('maximize');
      expect(thought.objectives![1].weight).toBe(0.3);
    });

    it('should process solution', () => {
      const input = {
        ...baseInput,
        solution: {
          type: 'optimal',
          variableValues: { x1: 30, x2: 35 },
          objectiveValues: { profit: 255 },
          quality: 0.95,
          method: 'simplex',
          guarantees: ['global optimum'],
        },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.solution).toBeDefined();
      expect(thought.solution!.type).toBe('optimal');
      expect(thought.solution!.quality).toBe(0.95);
    });

    it('should process sensitivity analysis', () => {
      const input = {
        ...baseInput,
        analysis: {
          robustness: 0.8,
          criticalConstraints: ['Resource A'],
          shadowPrices: { 'Resource A': 2.5 },
          recommendations: ['Increase Resource A'],
        },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.analysis).toBeDefined();
      expect(thought.analysis!.robustness).toBe(0.8);
      expect(thought.analysis!.criticalConstraints).toContain('Resource A');
    });
  });

  describe('validate', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Optimization analysis',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'optimization',
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

    it('should warn for unknown problem type', () => {
      const input = { ...baseInput, problem: { type: 'unknown_type' } } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'problem.type')).toBe(true);
    });

    it('should warn for unknown solution type', () => {
      const input = { ...baseInput, solution: { type: 'unknown_solution' } } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'solution.type')).toBe(true);
    });

    it('should warn about constraints without formulas', () => {
      const input = {
        ...baseInput,
        constraints: [{ name: 'Constraint 1' }], // No formula
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('lacks formula'))).toBe(true);
    });

    it('should warn about objectives without formulas', () => {
      const input = {
        ...baseInput,
        objectives: [{ name: 'Objective 1' }], // No formula
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Objective lacks formula'))).toBe(true);
    });

    it('should warn about objective weights not summing to 1', () => {
      const input = {
        ...baseInput,
        objectives: [
          { name: 'Obj1', formula: 'x1', weight: 0.5 },
          { name: 'Obj2', formula: 'x2', weight: 0.3 }, // Sum = 0.8
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('weights sum to'))).toBe(true);
    });

    it('should warn about missing variables', () => {
      const input = { ...baseInput, thoughtType: 'constraint_identification' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('No decision variables'))).toBe(true);
    });

    it('should warn about solution search without objectives', () => {
      const input = { ...baseInput, thoughtType: 'solution_search' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('without objectives'))).toBe(true);
    });

    it('should accept all valid problem types', () => {
      const types = ['linear', 'nonlinear', 'integer', 'mixed_integer', 'constraint_satisfaction', 'multi_objective'];

      for (const type of types) {
        const input = { ...baseInput, problem: { type } } as any;
        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.field === 'problem.type')).toBe(false);
      }
    });
  });

  describe('getEnhancements', () => {
    const createThought = (overrides: any = {}) => {
      const baseInput: ThinkingToolInput = {
        thought: 'Optimization reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'optimization',
        ...overrides,
      };
      return handler.createThought(baseInput, 'session-123');
    };

    it('should include related modes', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
      expect(enhancements.relatedModes).toContain(ThinkingMode.ALGORITHMIC);
      expect(enhancements.relatedModes).toContain(ThinkingMode.ENGINEERING);
    });

    it('should include mental models', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Linear Programming');
      expect(enhancements.mentalModels).toContain('Pareto Optimality');
      expect(enhancements.mentalModels).toContain('Sensitivity Analysis');
    });

    it('should calculate metrics', () => {
      const thought = createThought({
        variables: [{ name: 'x1' }, { name: 'x2' }],
        constraints: [{ formula: 'x1 + x2 <= 10' }],
        objectives: [{ formula: 'x1 + x2', type: 'maximize' }],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.variableCount).toBe(2);
      expect(enhancements.metrics!.constraintCount).toBe(1);
      expect(enhancements.metrics!.objectiveCount).toBe(1);
    });

    it('should provide problem formulation guidance', () => {
      const thought = createThought({
        thoughtType: 'problem_formulation',
        problem: { type: 'linear', approach: 'simplex' },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('optimize'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('linear'))).toBe(true);
    });

    it('should provide solution search feedback', () => {
      const thought = createThought({
        thoughtType: 'solution_search',
        solution: {
          type: 'optimal',
          quality: 0.95,
          guarantees: ['global optimum'],
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('optimal'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Guarantees'))).toBe(true);
    });

    it('should warn about infeasible solutions', () => {
      const thought = createThought({
        thoughtType: 'solution_search',
        solution: { type: 'infeasible' },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('infeasible'))).toBe(true);
    });

    it('should warn about unbounded problems', () => {
      const thought = createThought({
        thoughtType: 'solution_search',
        solution: { type: 'unbounded' },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('unbounded'))).toBe(true);
    });

    it('should provide sensitivity analysis feedback', () => {
      const thought = createThought({
        thoughtType: 'sensitivity_analysis',
        analysis: {
          robustness: 0.3,
          criticalConstraints: ['Resource A', 'Resource B'],
        },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('Low solution robustness'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Critical constraints'))).toBe(true);
    });

    it('should warn about multi-objective without weights', () => {
      const thought = createThought({
        problem: { type: 'multi_objective' },
        objectives: [
          { formula: 'x1', type: 'maximize' },
          { formula: 'x2', type: 'minimize' },
        ],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('Pareto'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support problem_formulation', () => {
      expect(handler.supportsThoughtType('problem_formulation')).toBe(true);
    });

    it('should support variable_definition', () => {
      expect(handler.supportsThoughtType('variable_definition')).toBe(true);
    });

    it('should support constraint_identification', () => {
      expect(handler.supportsThoughtType('constraint_identification')).toBe(true);
    });

    it('should support objective_setting', () => {
      expect(handler.supportsThoughtType('objective_setting')).toBe(true);
    });

    it('should support solution_search', () => {
      expect(handler.supportsThoughtType('solution_search')).toBe(true);
    });

    it('should support sensitivity_analysis', () => {
      expect(handler.supportsThoughtType('sensitivity_analysis')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle linear programming problem', () => {
      const sessionId = 'lp-session';

      const input = {
        thought: 'Solving production mix optimization using linear programming',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'optimization',
        thoughtType: 'solution_search',
        problem: {
          name: 'Production Mix',
          type: 'linear',
          approach: 'simplex',
        },
        variables: [
          { name: 'product_A', type: 'continuous', domain: { type: 'continuous', lowerBound: 0 } },
          { name: 'product_B', type: 'continuous', domain: { type: 'continuous', lowerBound: 0 } },
        ],
        constraints: [
          { name: 'Labor', formula: '2*A + 3*B <= 120', type: 'hard' },
          { name: 'Material', formula: 'A + B <= 50', type: 'hard' },
        ],
        objectives: [
          { name: 'Profit', formula: '30*A + 50*B', type: 'maximize', weight: 1.0 },
        ],
        solution: {
          type: 'optimal',
          variableValues: { product_A: 30, product_B: 20 },
          objectiveValues: { Profit: 1900 },
          quality: 1.0,
          method: 'simplex',
          guarantees: ['global optimum', 'primal feasible'],
        },
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.problem!.type).toBe('linear');
      expect(thought.solution!.type).toBe('optimal');
      expect(validation.valid).toBe(true);
      expect(enhancements.metrics!.variableCount).toBe(2);
      expect(enhancements.metrics!.constraintCount).toBe(2);
    });

    it('should handle multi-objective optimization', () => {
      const sessionId = 'moo-session';

      const input = {
        thought: 'Multi-objective portfolio optimization',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'optimization',
        thoughtType: 'objective_setting',
        problem: {
          name: 'Portfolio',
          type: 'multi_objective',
        },
        variables: [
          { name: 'stock_A', type: 'continuous' },
          { name: 'stock_B', type: 'continuous' },
          { name: 'bonds', type: 'continuous' },
        ],
        objectives: [
          { name: 'Return', formula: '0.12*A + 0.08*B + 0.04*C', type: 'maximize', weight: 0.6 },
          { name: 'Risk', formula: 'sqrt(0.04*A^2 + 0.02*B^2 + 0.01*C^2)', type: 'minimize', weight: 0.4 },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.problem!.type).toBe('multi_objective');
      expect(thought.objectives).toHaveLength(2);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('conflicting objectives'))).toBe(true);
    });
  });
});
