/**
 * Optimization Validator Tests (Phase 14 Sprint 1)
 * Tests for src/validation/validators/modes/optimization.ts
 *
 * Target: >90% branch coverage for 351 lines of validation logic
 * Error paths: ~18, Warning paths: ~1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OptimizationValidator } from '../../../../../src/validation/validators/modes/optimization.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { OptimizationThought, DecisionVariable, Constraint, Objective, Solution, SensitivityAnalysis, OptimizationProblem, Domain } from '../../../../../src/types/modes/optimization.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('OptimizationValidator', () => {
  let validator: OptimizationValidator;
  let context: ValidationContext;

  // Helper to create a valid problem
  const createValidProblem = (overrides?: Partial<OptimizationProblem>): OptimizationProblem => ({
    id: 'prob-1',
    name: 'Test Problem',
    description: 'A test optimization problem',
    type: 'linear',
    ...overrides,
  });

  // Helper to create a valid variable
  const createValidVariable = (id: string = 'var-1', overrides?: Partial<DecisionVariable>): DecisionVariable => ({
    id,
    name: 'Variable X',
    description: 'Test variable',
    type: 'continuous',
    domain: { type: 'continuous', lowerBound: 0, upperBound: 100 },
    semantics: 'Units of product',
    ...overrides,
  });

  // Helper to create a valid constraint
  const createValidConstraint = (id: string = 'con-1', overrides?: Partial<Constraint>): Constraint => ({
    id,
    name: 'Test Constraint',
    description: 'Test constraint description',
    type: 'hard',
    formula: 'x + y <= 100',
    variables: ['var-1'],
    rationale: 'Resource limitation',
    ...overrides,
  });

  // Helper to create a valid objective
  const createValidObjective = (id: string = 'obj-1', overrides?: Partial<Objective>): Objective => ({
    id,
    name: 'Profit',
    description: 'Maximize profit',
    type: 'maximize',
    formula: '5x + 3y',
    variables: ['var-1'],
    ...overrides,
  });

  // Helper to create a valid solution
  const createValidSolution = (overrides?: Partial<Solution>): Solution => ({
    id: 'sol-1',
    type: 'optimal',
    variableValues: { 'var-1': 50 },
    objectiveValues: { 'obj-1': 250 },
    constraintSatisfaction: [
      { constraintId: 'con-1', satisfied: true },
    ],
    quality: 0.95,
    ...overrides,
  });

  // Helper to create valid sensitivity analysis
  const createValidAnalysis = (overrides?: Partial<SensitivityAnalysis>): SensitivityAnalysis => ({
    robustness: 0.8,
    parameters: [
      { parameterId: 'param-1', allowableIncrease: 10, allowableDecrease: 5 },
    ],
    ...overrides,
  } as SensitivityAnalysis);

  // Helper to create a minimal valid thought
  const createBaseThought = (overrides?: Partial<OptimizationThought>): OptimizationThought => ({
    id: 'thought-1',
    mode: ThinkingMode.OPTIMIZATION,
    thoughtType: 'problem_formulation',
    thought: 'Optimization analysis',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    problem: createValidProblem(),
    variables: [createValidVariable()],
    optimizationConstraints: [createValidConstraint()],
    objectives: [createValidObjective()],
    ...overrides,
  });

  beforeEach(() => {
    validator = new OptimizationValidator();
    context = {
      sessionId: 'test-session',
      existingThoughts: new Map(),
    };
  });

  describe('getMode', () => {
    it('should return optimization', () => {
      expect(validator.getMode()).toBe('optimization');
    });
  });

  describe('validate - main entry point', () => {
    it('should accept valid thought with all fields', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });
  });

  describe('validateProblem', () => {
    it('should accept valid problem', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.description.includes('problem'))).toHaveLength(0);
    });

    it('should reject problem with empty name', () => {
      const thought = createBaseThought({
        problem: createValidProblem({ name: '' }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('problem must have a name'))).toBe(true);
    });

    it('should reject problem with whitespace-only name', () => {
      const thought = createBaseThought({
        problem: createValidProblem({ name: '   ' }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('problem must have a name'))).toBe(true);
    });

    it('should accept thought without problem field', () => {
      const thought = createBaseThought({ problem: undefined });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('problem must have a name'))).toBe(false);
    });
  });

  describe('validateVariables', () => {
    it('should accept valid variables', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('Variable'))).toHaveLength(0);
    });

    it('should warn on missing variables', () => {
      const thought = createBaseThought({ variables: undefined });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('should define decision variables'))).toBe(true);
    });

    it('should warn on empty variables array', () => {
      const thought = createBaseThought({ variables: [] });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('should define decision variables'))).toBe(true);
    });

    it('should reject duplicate variable IDs', () => {
      const thought = createBaseThought({
        variables: [
          createValidVariable('var-1'),
          createValidVariable('var-1'),
        ],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Duplicate variable ID'))).toBe(true);
    });

    it('should reject variable with empty name', () => {
      const thought = createBaseThought({
        variables: [createValidVariable('var-1', { name: '' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have a name'))).toBe(true);
    });

    it('should reject variable with whitespace-only name', () => {
      const thought = createBaseThought({
        variables: [createValidVariable('var-1', { name: '   ' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have a name'))).toBe(true);
    });

    it('should reject continuous domain with lower >= upper bound', () => {
      const thought = createBaseThought({
        variables: [createValidVariable('var-1', {
          domain: { type: 'continuous', lowerBound: 100, upperBound: 50 },
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('lower bound must be less than upper bound'))).toBe(true);
    });

    it('should reject integer domain with lower >= upper bound', () => {
      const thought = createBaseThought({
        variables: [createValidVariable('var-1', {
          domain: { type: 'integer', lowerBound: 10, upperBound: 10 },
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('lower bound must be less than upper bound'))).toBe(true);
    });

    it('should reject discrete domain with empty values', () => {
      const thought = createBaseThought({
        variables: [createValidVariable('var-1', {
          domain: { type: 'discrete', values: [] } as Domain,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have at least one value'))).toBe(true);
    });

    it('should reject categorical domain with empty categories', () => {
      const thought = createBaseThought({
        variables: [createValidVariable('var-1', {
          domain: { type: 'categorical', categories: [] } as Domain,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have at least one category'))).toBe(true);
    });

    it('should accept binary domain', () => {
      const thought = createBaseThought({
        variables: [createValidVariable('var-1', {
          domain: { type: 'binary' },
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });
  });

  describe('validateConstraints', () => {
    it('should accept valid constraints', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('Constraint'))).toHaveLength(0);
    });

    it('should reject constraint with empty formula', () => {
      const thought = createBaseThought({
        optimizationConstraints: [createValidConstraint('con-1', { formula: '' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have a formula'))).toBe(true);
    });

    it('should reject constraint with whitespace-only formula', () => {
      const thought = createBaseThought({
        optimizationConstraints: [createValidConstraint('con-1', { formula: '   ' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have a formula'))).toBe(true);
    });

    it('should warn on soft constraint without penalty', () => {
      const thought = createBaseThought({
        optimizationConstraints: [createValidConstraint('con-1', { type: 'soft', penalty: undefined })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('should have a penalty'))).toBe(true);
    });

    it('should reject negative penalty', () => {
      const thought = createBaseThought({
        optimizationConstraints: [createValidConstraint('con-1', { penalty: -10 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('penalty cannot be negative'))).toBe(true);
    });

    it('should reject constraint referencing non-existent variable', () => {
      const thought = createBaseThought({
        optimizationConstraints: [createValidConstraint('con-1', { variables: ['unknown-var'] })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('references non-existent variable'))).toBe(true);
    });

    it('should reject negative priority', () => {
      const thought = createBaseThought({
        optimizationConstraints: [createValidConstraint('con-1', { priority: -1 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('priority cannot be negative'))).toBe(true);
    });

    it('should accept constraint with zero penalty and priority', () => {
      const thought = createBaseThought({
        optimizationConstraints: [createValidConstraint('con-1', { penalty: 0, priority: 0 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('penalty cannot be negative'))).toBe(false);
      expect(issues.some(i => i.description.includes('priority cannot be negative'))).toBe(false);
    });
  });

  describe('validateObjectives', () => {
    it('should accept valid objectives', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('Objective'))).toHaveLength(0);
    });

    it('should reject missing objectives', () => {
      const thought = createBaseThought({ objectives: undefined });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have at least one objective'))).toBe(true);
    });

    it('should reject empty objectives array', () => {
      const thought = createBaseThought({ objectives: [] });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have at least one objective'))).toBe(true);
    });

    it('should reject objective with empty formula', () => {
      const thought = createBaseThought({
        objectives: [createValidObjective('obj-1', { formula: '' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have a formula'))).toBe(true);
    });

    it('should reject objective with whitespace-only formula', () => {
      const thought = createBaseThought({
        objectives: [createValidObjective('obj-1', { formula: '   ' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must have a formula'))).toBe(true);
    });

    it('should reject objective referencing non-existent variable', () => {
      const thought = createBaseThought({
        objectives: [createValidObjective('obj-1', { variables: ['unknown-var'] })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('references non-existent variable'))).toBe(true);
    });

    it('should reject weight below 0', () => {
      const thought = createBaseThought({
        objectives: [createValidObjective('obj-1', { weight: -0.1 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('weight must be 0-1'))).toBe(true);
    });

    it('should reject weight above 1', () => {
      const thought = createBaseThought({
        objectives: [createValidObjective('obj-1', { weight: 1.5 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('weight must be 0-1'))).toBe(true);
    });

    it('should warn on multi-objective weights not summing to 1', () => {
      const thought = createBaseThought({
        objectives: [
          createValidObjective('obj-1', { weight: 0.3 }),
          createValidObjective('obj-2', { weight: 0.3 }),
        ],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('weights sum to'))).toBe(true);
    });

    it('should accept multi-objective weights summing to 1', () => {
      const thought = createBaseThought({
        objectives: [
          createValidObjective('obj-1', { weight: 0.6 }),
          createValidObjective('obj-2', { weight: 0.4 }),
        ],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('weights sum to'))).toBe(false);
    });

    it('should not warn on single objective without weight', () => {
      const thought = createBaseThought({
        objectives: [createValidObjective('obj-1', { weight: undefined })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('weights sum to'))).toBe(false);
    });
  });

  describe('validateSolution', () => {
    it('should accept valid solution', () => {
      const thought = createBaseThought({
        solution: createValidSolution(),
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('Solution'))).toHaveLength(0);
    });

    it('should reject quality below 0', () => {
      const thought = createBaseThought({
        solution: createValidSolution({ quality: -0.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Solution quality must be 0-1'))).toBe(true);
    });

    it('should reject quality above 1', () => {
      const thought = createBaseThought({
        solution: createValidSolution({ quality: 1.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Solution quality must be 0-1'))).toBe(true);
    });

    it('should warn on solution not assigning value to all variables', () => {
      const thought = createBaseThought({
        variables: [createValidVariable('var-1'), createValidVariable('var-2')],
        solution: createValidSolution({ variableValues: { 'var-1': 50 } }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('does not assign value to variable'))).toBe(true);
    });

    it('should warn on solution with non-existent objective', () => {
      const thought = createBaseThought({
        solution: createValidSolution({ objectiveValues: { 'unknown-obj': 100 } }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('includes non-existent objective'))).toBe(true);
    });

    it('should warn on solution with non-existent constraint reference', () => {
      const thought = createBaseThought({
        solution: createValidSolution({
          constraintSatisfaction: [{ constraintId: 'unknown-con', satisfied: true }],
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('references non-existent constraint'))).toBe(true);
    });

    it('should reject negative constraint violation', () => {
      const thought = createBaseThought({
        solution: createValidSolution({
          constraintSatisfaction: [{ constraintId: 'con-1', satisfied: false, violation: -5 }],
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('violation cannot be negative'))).toBe(true);
    });

    it('should reject negative computation time', () => {
      const thought = createBaseThought({
        solution: createValidSolution({ computationTime: -100 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Computation time cannot be negative'))).toBe(true);
    });

    it('should accept zero computation time', () => {
      const thought = createBaseThought({
        solution: createValidSolution({ computationTime: 0 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Computation time cannot be negative'))).toBe(false);
    });
  });

  describe('validateAnalysis (Sensitivity Analysis)', () => {
    it('should accept valid analysis', () => {
      const thought = createBaseThought({
        analysis: createValidAnalysis(),
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('robustness'))).toHaveLength(0);
    });

    it('should reject robustness below 0', () => {
      const thought = createBaseThought({
        analysis: createValidAnalysis({ robustness: -0.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('robustness must be 0-1'))).toBe(true);
    });

    it('should reject robustness above 1', () => {
      const thought = createBaseThought({
        analysis: createValidAnalysis({ robustness: 1.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('robustness must be 0-1'))).toBe(true);
    });

    it('should warn on negative allowableIncrease', () => {
      const thought = createBaseThought({
        analysis: createValidAnalysis({
          parameters: [{ parameterId: 'p1', allowableIncrease: -5, allowableDecrease: 10 }],
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('allowable increase should be non-negative'))).toBe(true);
    });

    it('should warn on negative allowableDecrease', () => {
      const thought = createBaseThought({
        analysis: createValidAnalysis({
          parameters: [{ parameterId: 'p1', allowableIncrease: 10, allowableDecrease: -5 }],
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('allowable decrease should be non-negative'))).toBe(true);
    });

    it('should accept zero allowableIncrease and allowableDecrease', () => {
      const thought = createBaseThought({
        analysis: createValidAnalysis({
          parameters: [{ parameterId: 'p1', allowableIncrease: 0, allowableDecrease: 0 }],
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('allowable increase should be non-negative'))).toBe(false);
      expect(issues.some(i => i.description.includes('allowable decrease should be non-negative'))).toBe(false);
    });
  });

  describe('validateCommon (inherited)', () => {
    it('should reject negative thoughtNumber', () => {
      const thought = createBaseThought({ thoughtNumber: -1 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Thought number must be positive'))).toBe(true);
    });

    it('should reject thoughtNumber exceeding totalThoughts', () => {
      const thought = createBaseThought({ thoughtNumber: 10, totalThoughts: 5 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('exceeds total'))).toBe(true);
    });
  });
});
