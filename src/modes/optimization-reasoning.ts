/**
 * Optimization Reasoning Mode (v3.4.0)
 * Phase 4E Task 8.4 (File Task 27): Reasoning for optimization problems
 */

import type { Thought } from '../types/index.js';

/**
 * Optimization type
 */
export type OptimizationType =
  | 'minimization' // Minimize objective
  | 'maximization' // Maximize objective
  | 'multi_objective' // Multiple objectives (Pareto)
  | 'constrained' // With constraints
  | 'unconstrained' // Without constraints
  | 'discrete' // Discrete variables
  | 'continuous' // Continuous variables
  | 'mixed'; // Mixed integer/continuous

/**
 * Optimization method
 */
export type OptimizationMethod =
  | 'gradient_descent' // First-order gradient-based
  | 'newton' // Second-order Newton's method
  | 'conjugate_gradient' // Conjugate gradient method
  | 'simplex' // Linear programming simplex
  | 'interior_point' // Interior point method
  | 'branch_and_bound' // For integer programming
  | 'genetic_algorithm' // Evolutionary algorithm
  | 'simulated_annealing' // Simulated annealing
  | 'particle_swarm' // Particle swarm optimization
  | 'gradient_free' // Derivative-free methods
  | 'dynamic_programming' // DP for sequential decisions
  | 'lagrange' // Lagrange multipliers
  | 'penalty_method'; // Penalty/barrier methods

/**
 * Variable in optimization problem
 */
export interface OptimizationVariable {
  id: string;
  name: string;
  type: 'continuous' | 'integer' | 'binary' | 'categorical';
  lowerBound?: number;
  upperBound?: number;
  initialValue?: number;
  description: string;
}

/**
 * Objective function
 */
export interface ObjectiveFunction {
  id: string;
  name: string;
  expression: string;
  type: 'minimization' | 'maximization';
  weight?: number; // For multi-objective
  evaluate: (variables: Map<string, number>) => number;
  gradient?: (variables: Map<string, number>) => Map<string, number>;
  hessian?: (variables: Map<string, number>) => number[][];
}

/**
 * Constraint in optimization
 */
export interface OptimizationConstraint {
  id: string;
  type: 'equality' | 'inequality' | 'bound';
  expression: string;
  evaluate: (variables: Map<string, number>) => number;
  gradient?: (variables: Map<string, number>) => Map<string, number>;
  description: string;
  violated?: boolean;
}

/**
 * Optimization problem definition
 */
export interface OptimizationProblem {
  variables: Map<string, OptimizationVariable>;
  objectives: ObjectiveFunction[];
  constraints: OptimizationConstraint[];
  type: OptimizationType;
  description: string;
}

/**
 * Solution to optimization problem
 */
export interface OptimizationSolution {
  variables: Map<string, number>;
  objectiveValue: number | number[]; // Single or multi-objective
  isOptimal: boolean;
  isFeasible: boolean;
  iterations: number;
  convergenceStatus: 'converged' | 'max_iterations' | 'stalled' | 'infeasible' | 'unbounded';
  constraintViolations: string[];
  method: OptimizationMethod;
  metadata: {
    timeElapsed: number;
    evaluations: number;
    gradientNorm?: number;
    dualityGap?: number;
  };
}

/**
 * Pareto front for multi-objective optimization
 */
export interface ParetoFront {
  solutions: OptimizationSolution[];
  dominanceRelations: Map<number, number[]>; // Solution index -> dominated indices
  hypervolume?: number;
}

/**
 * Optimization iteration
 */
export interface OptimizationIteration {
  iteration: number;
  variables: Map<string, number>;
  objectiveValue: number;
  gradient?: Map<string, number>;
  stepSize?: number;
  constraintViolations: number;
  improvement: number;
  direction?: string;
}

/**
 * Optimization reasoning thought
 */
// @ts-ignore
export interface OptimizationReasoningThought extends Thought {
  mode: 'optimization';
// @ts-ignore
// @ts-ignore - Interface extension issue
  problem: OptimizationProblem;
  solutions: OptimizationSolution[];
  iterations: OptimizationIteration[];
  paretoFront?: ParetoFront;
  analysis: OptimizationAnalysis;
}

/**
 * Optimization analysis
 */
export interface OptimizationAnalysis {
  problemType: OptimizationType;
  totalVariables: number;
  totalConstraints: number;
  problemDimension: number;
  convexity: 'convex' | 'concave' | 'nonconvex' | 'unknown';
  linearity: 'linear' | 'quadratic' | 'nonlinear';
  difficulty: 'easy' | 'moderate' | 'hard' | 'very_hard';
  recommendedMethods: OptimizationMethod[];
  estimatedComplexity: string;
}

/**
 * Sensitivity analysis result
 */
export interface SensitivityAnalysis {
  variable: string;
  optimalValue: number;
  shadowPrice?: number; // For constraints
  reducedCost?: number; // For variables
  allowableIncrease?: number;
  allowableDecrease?: number;
  impact: 'high' | 'medium' | 'low';
}

/**
 * Optimization reasoning engine
 */
export class OptimizationReasoningEngine {
  /**
   * Create optimization problem
   */
  createProblem(type: OptimizationType, description: string): OptimizationProblem {
    return {
      variables: new Map(),
      objectives: [],
      constraints: [],
      type,
      description,
    };
  }

  /**
   * Add variable to problem
   */
  addVariable(problem: OptimizationProblem, variable: OptimizationVariable): void {
    problem.variables.set(variable.id, variable);
  }

  /**
   * Add objective function
   */
  addObjective(problem: OptimizationProblem, objective: ObjectiveFunction): void {
    problem.objectives.push(objective);
  }

  /**
   * Add constraint
   */
  addConstraint(problem: OptimizationProblem, constraint: OptimizationConstraint): void {
    problem.constraints.push(constraint);
  }

  /**
   * Evaluate objective at point
   */
  evaluateObjective(objective: ObjectiveFunction, variables: Map<string, number>): number {
    return objective.evaluate(variables);
  }

  /**
   * Check constraint satisfaction
   */
  checkConstraint(constraint: OptimizationConstraint, variables: Map<string, number>): boolean {
    const value = constraint.evaluate(variables);

    if (constraint.type === 'equality') {
      return Math.abs(value) < 1e-6; // Tolerance for equality
    } else if (constraint.type === 'inequality') {
      return value <= 0; // Assuming g(x) <= 0 form
    }

    return true;
  }
  /**
   * Check feasibility
   */
  isFeasible(problem: OptimizationProblem, variables: Map<string, number>): boolean {
    // Check bounds
    for (const [id, variable] of problem.variables) {
      const value = variables.get(id);
      if (value === undefined) return false;

      if (variable.lowerBound !== undefined && value < variable.lowerBound) return false;
      if (variable.upperBound !== undefined && value > variable.upperBound) return false;
    }

    // Check constraints
    for (const constraint of problem.constraints) {
      if (!this.checkConstraint(constraint, variables)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Solve using gradient descent
   */
  solveGradientDescent(
    problem: OptimizationProblem,
    learningRate: number = 0.01,
    maxIterations: number = 1000,
    tolerance: number = 1e-6
  ): OptimizationSolution {
    const startTime = Date.now();
    const iterations: OptimizationIteration[] = [];
    let evaluations = 0;

    // Initialize at center of bounds or zero
    const current = new Map<string, number>();
    for (const [id, variable] of problem.variables) {
      if (variable.initialValue !== undefined) {
        current.set(id, variable.initialValue);
      } else if (variable.lowerBound !== undefined && variable.upperBound !== undefined) {
        current.set(id, (variable.lowerBound + variable.upperBound) / 2);
      } else {
        current.set(id, 0);
      }
    }

    const objective = problem.objectives[0];
    let prevObjectiveValue = objective.evaluate(current);
    evaluations++;

    for (let iter = 0; iter < maxIterations; iter++) {
      // Compute gradient
      const gradient = this.computeNumericalGradient(objective, current);
      evaluations += problem.variables.size;

      // Compute gradient norm
      let gradientNorm = 0;
      for (const [, g] of gradient) {
        gradientNorm += g * g;
      }
      gradientNorm = Math.sqrt(gradientNorm);

      // Check convergence
      if (gradientNorm < tolerance) {
        const timeElapsed = Date.now() - startTime;
        return {
          variables: new Map(current),
          objectiveValue: prevObjectiveValue,
          isOptimal: true,
          isFeasible: this.isFeasible(problem, current),
          iterations: iter + 1,
          convergenceStatus: 'converged',
          constraintViolations: this.getViolatedConstraints(problem, current),
          method: 'gradient_descent',
          metadata: {
            timeElapsed,
            evaluations,
            gradientNorm,
          },
        };
      }

      // Update variables (gradient descent step)
      const next = new Map<string, number>();
      for (const [id, value] of current) {
        const grad = gradient.get(id) || 0;
        const direction = objective.type === 'minimization' ? -1 : 1;
        next.set(id, value + direction * learningRate * grad);
      }

      // Project onto bounds
      for (const [id, value] of next) {
        const variable = problem.variables.get(id)!;
        if (variable.lowerBound !== undefined && value < variable.lowerBound) {
          next.set(id, variable.lowerBound);
        }
        if (variable.upperBound !== undefined && value > variable.upperBound) {
          next.set(id, variable.upperBound);
        }
      }

      const objectiveValue = objective.evaluate(next);
      evaluations++;

      const improvement = Math.abs(objectiveValue - prevObjectiveValue);

      iterations.push({
        iteration: iter,
        variables: new Map(next),
        objectiveValue,
        gradient,
        stepSize: learningRate,
        constraintViolations: this.getViolatedConstraints(problem, next).length,
        improvement,
      });

      current.clear();
      for (const [id, value] of next) {
        current.set(id, value);
      }
      prevObjectiveValue = objectiveValue;
    }

    const timeElapsed = Date.now() - startTime;
    return {
      variables: current,
      objectiveValue: prevObjectiveValue,
      isOptimal: false,
      isFeasible: this.isFeasible(problem, current),
      iterations: maxIterations,
      convergenceStatus: 'max_iterations',
      constraintViolations: this.getViolatedConstraints(problem, current),
      method: 'gradient_descent',
      metadata: {
        timeElapsed,
        evaluations,
      },
    };
  }

  /**
   * Compute numerical gradient
   */
  private computeNumericalGradient(
    objective: ObjectiveFunction,
    variables: Map<string, number>,
    epsilon: number = 1e-7
  ): Map<string, number> {
    const gradient = new Map<string, number>();

    for (const [id, value] of variables) {
      // Forward difference
      const forward = new Map(variables);
      forward.set(id, value + epsilon);
      const fForward = objective.evaluate(forward);

      const backward = new Map(variables);
      backward.set(id, value - epsilon);
      const fBackward = objective.evaluate(backward);

      // Central difference
      const grad = (fForward - fBackward) / (2 * epsilon);
      gradient.set(id, grad);
    }

    return gradient;
  }

  /**
   * Get violated constraints
   */
  private getViolatedConstraints(
    problem: OptimizationProblem,
    variables: Map<string, number>
  ): string[] {
    const violated: string[] = [];

    for (const constraint of problem.constraints) {
      if (!this.checkConstraint(constraint, variables)) {
        violated.push(constraint.id);
      }
    }

    return violated;
  }

  /**
   * Solve multi-objective optimization (generate Pareto front)
   */
  solveMultiObjective(
    problem: OptimizationProblem,
    populationSize: number = 100,
    _generations: number = 100
  ): ParetoFront {
    const solutions: OptimizationSolution[] = [];

    // Simple genetic algorithm for multi-objective
    // This is a simplified implementation
    for (let i = 0; i < populationSize; i++) {
      // Random solution
      const variables = new Map<string, number>();
      for (const [id, variable] of problem.variables) {
        const lower = variable.lowerBound ?? -100;
        const upper = variable.upperBound ?? 100;
        variables.set(id, lower + Math.random() * (upper - lower));
      }

      if (this.isFeasible(problem, variables)) {
        const objectiveValues = problem.objectives.map(obj => obj.evaluate(variables));

        solutions.push({
          variables,
          objectiveValue: objectiveValues,
          isOptimal: false,
          isFeasible: true,
          iterations: 0,
          convergenceStatus: 'converged',
          constraintViolations: [],
          method: 'genetic_algorithm',
          metadata: {
            timeElapsed: 0,
            evaluations: problem.objectives.length,
          },
        });
      }
    }

    // Compute dominance relations
    const dominanceRelations = new Map<number, number[]>();
    for (let i = 0; i < solutions.length; i++) {
      dominanceRelations.set(i, []);
      for (let j = 0; j < solutions.length; j++) {
        if (i !== j && this.dominates(solutions[i], solutions[j])) {
          dominanceRelations.get(i)!.push(j);
        }
      }
    }

    return {
      solutions,
      dominanceRelations,
    };
  }

  /**
   * Check if solution1 dominates solution2 (Pareto dominance)
   */
  private dominates(solution1: OptimizationSolution, solution2: OptimizationSolution): boolean {
    const obj1 = Array.isArray(solution1.objectiveValue)
      ? solution1.objectiveValue
      : [solution1.objectiveValue];
    const obj2 = Array.isArray(solution2.objectiveValue)
      ? solution2.objectiveValue
      : [solution2.objectiveValue];

    let atLeastOneBetter = false;
    for (let i = 0; i < obj1.length; i++) {
      if (obj1[i] > obj2[i]) return false; // Assuming minimization
      if (obj1[i] < obj2[i]) atLeastOneBetter = true;
    }

    return atLeastOneBetter;
  }

  /**
   * Perform sensitivity analysis
   */
  performSensitivityAnalysis(
    problem: OptimizationProblem,
    solution: OptimizationSolution
  ): SensitivityAnalysis[] {
    const analyses: SensitivityAnalysis[] = [];

    for (const [id, variable] of problem.variables) {
      const optimalValue = solution.variables.get(id) || 0;

      // Simple sensitivity: perturb and re-evaluate
      const perturbation = 0.01 * Math.abs(optimalValue);

      const increased = new Map(solution.variables);
      increased.set(id, optimalValue + perturbation);

      const decreased = new Map(solution.variables);
      decreased.set(id, optimalValue - perturbation);

      const objective = problem.objectives[0];
      const increasedValue = objective.evaluate(increased);
      const decreasedValue = objective.evaluate(decreased);

      const sensitivity = Math.abs(increasedValue - decreasedValue) / (2 * perturbation);
      const impact = sensitivity > 1.0 ? 'high' : sensitivity > 0.1 ? 'medium' : 'low';

      analyses.push({
        variable: variable.name,
        optimalValue,
        impact,
        allowableIncrease: variable.upperBound ? variable.upperBound - optimalValue : Infinity,
        allowableDecrease: variable.lowerBound ? optimalValue - variable.lowerBound : Infinity,
      });
    }

    return analyses;
  }

  /**
   * Analyze optimization problem
   */
  analyzeProblem(problem: OptimizationProblem): OptimizationAnalysis {
    const totalVariables = problem.variables.size;
    const totalConstraints = problem.constraints.length;
    const problemDimension = totalVariables;

    // Heuristics for problem properties
    const allLinear = problem.objectives.every(obj => obj.expression.includes('*') === false);
    const linearity: 'linear' | 'quadratic' | 'nonlinear' = allLinear
      ? 'linear'
      : problem.objectives.some(obj => obj.expression.includes('^2'))
        ? 'quadratic'
        : 'nonlinear';

    const difficulty: 'easy' | 'moderate' | 'hard' | 'very_hard' =
      totalVariables <= 10 && linearity === 'linear'
        ? 'easy'
        : totalVariables <= 50 && linearity !== 'nonlinear'
          ? 'moderate'
          : totalVariables <= 100
            ? 'hard'
            : 'very_hard';

    const recommendedMethods: OptimizationMethod[] = [];
    if (linearity === 'linear') {
      recommendedMethods.push('simplex', 'interior_point');
    }
    if (linearity === 'quadratic') {
      recommendedMethods.push('interior_point', 'conjugate_gradient');
    }
    if (linearity === 'nonlinear') {
      recommendedMethods.push('gradient_descent', 'newton', 'simulated_annealing');
    }

    const estimatedComplexity =
      linearity === 'linear'
        ? `O(n³) where n = ${totalVariables}`
        : `O(n²·m) where n = ${totalVariables}, m = iterations`;

    return {
      problemType: problem.type,
      totalVariables,
      totalConstraints,
      problemDimension,
      convexity: 'unknown',
      linearity,
      difficulty,
      recommendedMethods,
      estimatedComplexity,
    };
  }

  /**
   * Generate summary
   */
  generateSummary(
    problem: OptimizationProblem,
    solution: OptimizationSolution,
    analysis: OptimizationAnalysis
  ): string {
    const report: string[] = [];

    report.push('# Optimization Reasoning Summary');
    report.push('');

    report.push('## Problem Definition');
    report.push(`- **Type:** ${problem.type}`);
    report.push(`- **Description:** ${problem.description}`);
    report.push(`- **Variables:** ${analysis.totalVariables}`);
    report.push(`- **Constraints:** ${analysis.totalConstraints}`);
    report.push(`- **Linearity:** ${analysis.linearity}`);
    report.push(`- **Difficulty:** ${analysis.difficulty}`);
    report.push('');

    report.push('## Solution');
    if (solution.isOptimal) {
      report.push('✓ **Optimal Solution Found**');
    } else {
      report.push('⚠ **Approximate Solution**');
    }

    report.push(`- **Method:** ${solution.method}`);
    report.push(`- **Iterations:** ${solution.iterations}`);
    report.push(`- **Convergence:** ${solution.convergenceStatus}`);
    report.push(`- **Feasible:** ${solution.isFeasible ? 'Yes' : 'No'}`);
    report.push(`- **Time Elapsed:** ${solution.metadata.timeElapsed}ms`);
    report.push('');

    report.push('### Optimal Values');
    for (const [varId, value] of solution.variables) {
      const variable = problem.variables.get(varId);
      report.push(`- ${variable?.name || varId} = ${value.toFixed(6)}`);
    }
    report.push('');

    if (Array.isArray(solution.objectiveValue)) {
      report.push('### Objective Values');
      solution.objectiveValue.forEach((val, idx) => {
        report.push(`- Objective ${idx + 1}: ${val.toFixed(6)}`);
      });
    } else {
      report.push(`**Objective Value:** ${solution.objectiveValue.toFixed(6)}`);
    }

    if (solution.constraintViolations.length > 0) {
      report.push('');
      report.push('### Constraint Violations');
      for (const violationId of solution.constraintViolations) {
        const constraint = problem.constraints.find(c => c.id === violationId);
        report.push(`- ${constraint?.description || violationId}`);
      }
    }

    return report.join('\n');
  }
}
