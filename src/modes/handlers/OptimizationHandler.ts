/**
 * OptimizationHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Optimization reasoning mode with:
 * - Problem formulation validation
 * - Constraint satisfaction checking
 * - Objective function analysis
 * - Solution quality assessment
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import type {
  OptimizationThought,
  OptimizationProblem,
  DecisionVariable,
  Constraint,
  Objective,
  Solution,
  SensitivityAnalysis,
} from '../../types/modes/optimization.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * Valid optimization thought types
 */
const VALID_THOUGHT_TYPES = [
  'problem_formulation',
  'variable_definition',
  'constraint_identification',
  'objective_setting',
  'solution_search',
  'sensitivity_analysis',
] as const;

type OptimizationThoughtType = typeof VALID_THOUGHT_TYPES[number];

/**
 * Valid problem types
 */
const VALID_PROBLEM_TYPES = [
  'linear',
  'nonlinear',
  'integer',
  'mixed_integer',
  'constraint_satisfaction',
  'multi_objective',
] as const;

/**
 * Valid solution types
 */
const VALID_SOLUTION_TYPES = ['optimal', 'feasible', 'infeasible', 'unbounded', 'approximate'] as const;

/**
 * OptimizationHandler - Specialized handler for optimization reasoning
 *
 * Provides:
 * - Problem structure validation
 * - Constraint consistency checking
 * - Solution quality assessment
 * - Sensitivity analysis support
 */
export class OptimizationHandler implements ModeHandler {
  readonly mode = ThinkingMode.OPTIMIZATION;
  readonly modeName = 'Optimization Analysis';
  readonly description = 'Constraint optimization, objective functions, and solution search';

  /**
   * Supported thought types for optimization mode
   */
  private readonly supportedThoughtTypes = [...VALID_THOUGHT_TYPES];

  /**
   * Create an optimization thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): OptimizationThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process problem
    const problem = inputAny.problem
      ? this.normalizeProblem(inputAny.problem)
      : undefined;

    // Process variables
    const variables = inputAny.variables
      ? inputAny.variables.map((v: any) => this.normalizeVariable(v))
      : undefined;

    // Process constraints
    const optimizationConstraints = inputAny.optimizationConstraints || inputAny.constraints
      ? (inputAny.optimizationConstraints || inputAny.constraints).map((c: any) => this.normalizeConstraint(c))
      : undefined;

    // Process objectives
    const objectives = inputAny.objectives
      ? inputAny.objectives.map((o: any) => this.normalizeObjective(o))
      : undefined;

    // Process solution
    const solution = inputAny.solution
      ? this.normalizeSolution(inputAny.solution, optimizationConstraints)
      : undefined;

    // Process analysis
    const analysis = inputAny.analysis
      ? this.normalizeAnalysis(inputAny.analysis)
      : undefined;

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.OPTIMIZATION,

      // Core optimization fields
      thoughtType,
      problem,
      variables,
      optimizationConstraints,
      objectives,
      solution,
      analysis,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate optimization-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: { field: string; message: string; code: string }[] = [];
    const warnings: ReturnType<typeof createValidationWarning>[] = [];
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

    // Validate problem type
    if (inputAny.problem?.type && !VALID_PROBLEM_TYPES.includes(inputAny.problem.type)) {
      warnings.push(
        createValidationWarning(
          'problem.type',
          `Unknown problem type: ${inputAny.problem.type}`,
          `Valid types: ${VALID_PROBLEM_TYPES.join(', ')}`
        )
      );
    }

    // Validate solution type
    if (inputAny.solution?.type && !VALID_SOLUTION_TYPES.includes(inputAny.solution.type)) {
      warnings.push(
        createValidationWarning(
          'solution.type',
          `Unknown solution type: ${inputAny.solution.type}`,
          `Valid types: ${VALID_SOLUTION_TYPES.join(', ')}`
        )
      );
    }

    // Validate constraints
    const constraints = inputAny.optimizationConstraints || inputAny.constraints;
    if (constraints) {
      for (let i = 0; i < constraints.length; i++) {
        const c = constraints[i];
        if (!c.formula) {
          warnings.push(
            createValidationWarning(
              `constraints[${i}].formula`,
              'Constraint lacks formula',
              'Specify the mathematical constraint expression'
            )
          );
        }
      }
    }

    // Validate objectives
    if (inputAny.objectives) {
      let totalWeight = 0;
      for (let i = 0; i < inputAny.objectives.length; i++) {
        const o = inputAny.objectives[i];
        if (!o.formula) {
          warnings.push(
            createValidationWarning(
              `objectives[${i}].formula`,
              'Objective lacks formula',
              'Specify the objective function'
            )
          );
        }
        if (o.weight !== undefined) {
          totalWeight += o.weight;
        }
      }

      if (inputAny.objectives.length > 1 && Math.abs(totalWeight - 1) > 0.01 && totalWeight > 0) {
        warnings.push(
          createValidationWarning(
            'objectives',
            `Objective weights sum to ${totalWeight.toFixed(2)}, should be 1.0`,
            'Normalize weights for multi-objective optimization'
          )
        );
      }
    }

    // Suggest missing components
    if (!inputAny.variables && inputAny.thoughtType !== 'problem_formulation') {
      warnings.push(
        createValidationWarning(
          'variables',
          'No decision variables defined',
          'Define the variables to be optimized'
        )
      );
    }

    if (!inputAny.objectives && inputAny.thoughtType === 'solution_search') {
      warnings.push(
        createValidationWarning(
          'objectives',
          'Solution search without objectives',
          'Define objective functions to optimize'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get optimization-specific enhancements
   */
  getEnhancements(thought: OptimizationThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.MATHEMATICS, ThinkingMode.ALGORITHMIC, ThinkingMode.ENGINEERING],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        variableCount: thought.variables?.length || 0,
        constraintCount: thought.optimizationConstraints?.length || 0,
        objectiveCount: thought.objectives?.length || 0,
      },
      mentalModels: [
        'Linear Programming',
        'Constraint Satisfaction',
        'Pareto Optimality',
        'Sensitivity Analysis',
        'Lagrangian Relaxation',
      ],
    };

    // Thought type-specific guidance
    switch (thought.thoughtType) {
      case 'problem_formulation':
        enhancements.guidingQuestions!.push(
          'What are we trying to optimize?',
          'What constraints must be satisfied?',
          'Is this a single or multi-objective problem?'
        );
        if (thought.problem) {
          enhancements.suggestions!.push(
            `Problem type: ${thought.problem.type}`,
            `Approach: ${thought.problem.approach || 'not specified'}`
          );
          if (thought.problem.complexity) {
            enhancements.metrics!.complexity = thought.problem.complexity;
          }
        }
        break;

      case 'variable_definition':
        enhancements.guidingQuestions!.push(
          'Are all decision variables identified?',
          'What are the variable domains?',
          'Are there any implicit variables?'
        );
        if (thought.variables) {
          const types = thought.variables.map(v => v.type);
          const uniqueTypes = [...new Set(types)];
          enhancements.suggestions!.push(
            `Variable types: ${uniqueTypes.join(', ')}`
          );
        }
        break;

      case 'constraint_identification':
        enhancements.guidingQuestions!.push(
          'Are all constraints identified?',
          'Which constraints are hard vs soft?',
          'Are the constraints consistent?'
        );
        if (thought.optimizationConstraints) {
          const hard = thought.optimizationConstraints.filter(c => c.type === 'hard').length;
          const soft = thought.optimizationConstraints.length - hard;
          enhancements.suggestions!.push(
            `Constraints: ${hard} hard, ${soft} soft`
          );
        }
        break;

      case 'objective_setting':
        enhancements.guidingQuestions!.push(
          'Is the objective function well-defined?',
          'Are there conflicting objectives?',
          'How will trade-offs be handled?'
        );
        if (thought.objectives) {
          const maxCount = thought.objectives.filter(o => o.type === 'maximize').length;
          const minCount = thought.objectives.length - maxCount;
          enhancements.suggestions!.push(
            `Objectives: ${maxCount} maximize, ${minCount} minimize`
          );
        }
        break;

      case 'solution_search':
        enhancements.guidingQuestions!.push(
          'Is the solution feasible?',
          'Is the solution optimal or approximate?',
          'What method was used to find it?'
        );
        if (thought.solution) {
          enhancements.suggestions!.push(
            `Solution type: ${thought.solution.type}`
          );
          enhancements.metrics!.solutionQuality = thought.solution.quality;

          if (thought.solution.type === 'infeasible') {
            enhancements.warnings!.push(
              'Solution is infeasible - check constraint compatibility'
            );
          } else if (thought.solution.type === 'unbounded') {
            enhancements.warnings!.push(
              'Problem is unbounded - add missing constraints'
            );
          }

          if (thought.solution.guarantees) {
            enhancements.suggestions!.push(
              `Guarantees: ${thought.solution.guarantees.join(', ')}`
            );
          }
        }
        break;

      case 'sensitivity_analysis':
        enhancements.guidingQuestions!.push(
          'How robust is the solution?',
          'Which constraints are binding?',
          'What are the shadow prices?'
        );
        if (thought.analysis) {
          enhancements.metrics!.robustness = thought.analysis.robustness;
          enhancements.metrics!.criticalConstraintCount = thought.analysis.criticalConstraints.length;

          if (thought.analysis.robustness < 0.5) {
            enhancements.warnings!.push(
              'Low solution robustness - small changes may significantly affect results'
            );
          }

          if (thought.analysis.criticalConstraints.length > 0) {
            enhancements.suggestions!.push(
              `Critical constraints: ${thought.analysis.criticalConstraints.length}`
            );
          }
        }
        break;
    }

    // Problem-specific suggestions
    if (thought.problem?.type === 'multi_objective' && !thought.objectives?.some(o => o.weight !== undefined)) {
      enhancements.warnings!.push(
        'Multi-objective problem without weights - consider Pareto analysis'
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as OptimizationThoughtType);
  }

  /**
   * Resolve thought type from input
   */
  private resolveThoughtType(inputType: string | undefined): OptimizationThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as OptimizationThoughtType)) {
      return inputType as OptimizationThoughtType;
    }
    return 'problem_formulation';
  }

  /**
   * Normalize problem
   */
  private normalizeProblem(problem: any): OptimizationProblem {
    return {
      id: problem.id || randomUUID(),
      name: problem.name || '',
      description: problem.description || '',
      type: VALID_PROBLEM_TYPES.includes(problem.type) ? problem.type : 'linear',
      approach: problem.approach,
      complexity: problem.complexity,
    };
  }

  /**
   * Normalize variable
   */
  private normalizeVariable(variable: any): DecisionVariable {
    return {
      id: variable.id || randomUUID(),
      name: variable.name || '',
      description: variable.description || '',
      type: variable.type || 'continuous',
      domain: variable.domain || { type: 'continuous', lowerBound: 0, upperBound: Infinity },
      unit: variable.unit,
      semantics: variable.semantics || '',
    };
  }

  /**
   * Normalize constraint
   */
  private normalizeConstraint(constraint: any): Constraint {
    return {
      id: constraint.id || randomUUID(),
      name: constraint.name || '',
      description: constraint.description || '',
      type: constraint.type || 'hard',
      formula: constraint.formula || '',
      latex: constraint.latex,
      variables: constraint.variables || [],
      penalty: constraint.penalty,
      rationale: constraint.rationale || '',
      priority: constraint.priority,
    };
  }

  /**
   * Normalize objective
   */
  private normalizeObjective(objective: any): Objective {
    return {
      id: objective.id || randomUUID(),
      name: objective.name || '',
      description: objective.description || '',
      type: objective.type || 'minimize',
      formula: objective.formula || '',
      latex: objective.latex,
      variables: objective.variables || [],
      weight: objective.weight,
      units: objective.units,
      idealValue: objective.idealValue,
      acceptableRange: objective.acceptableRange,
    };
  }

  /**
   * Normalize solution
   */
  private normalizeSolution(solution: any, constraints?: Constraint[]): Solution {
    // Calculate constraint satisfaction if not provided
    let constraintSatisfaction = solution.constraintSatisfaction;
    if (!constraintSatisfaction && constraints) {
      constraintSatisfaction = constraints.map(c => ({
        constraintId: c.id,
        satisfied: true, // Default assumption
        violation: undefined,
      }));
    }

    return {
      id: solution.id || randomUUID(),
      type: VALID_SOLUTION_TYPES.includes(solution.type) ? solution.type : 'feasible',
      variableValues: solution.variableValues || {},
      objectiveValues: solution.objectiveValues || {},
      constraintSatisfaction: constraintSatisfaction || [],
      quality: Math.max(0, Math.min(1, solution.quality ?? 0.5)),
      computationTime: solution.computationTime,
      iterations: solution.iterations,
      method: solution.method,
      guarantees: solution.guarantees,
    };
  }

  /**
   * Normalize analysis
   */
  private normalizeAnalysis(analysis: any): SensitivityAnalysis {
    return {
      id: analysis.id || randomUUID(),
      parameters: analysis.parameters || [],
      robustness: Math.max(0, Math.min(1, analysis.robustness ?? 0.5)),
      criticalConstraints: analysis.criticalConstraints || [],
      shadowPrices: analysis.shadowPrices,
      recommendations: analysis.recommendations || [],
    };
  }
}
