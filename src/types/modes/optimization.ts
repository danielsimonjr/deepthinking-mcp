/**
 * Constraint Optimization Mode - Type Definitions
 * Phase 4 (v3.2.0) - Optimization problems with constraints, objectives, and solution spaces
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Optimization thought extends base thought with constraint satisfaction
 */
export interface OptimizationThought extends BaseThought {
  mode: ThinkingMode.OPTIMIZATION;
  thoughtType:
    | 'problem_formulation'
    | 'variable_definition'
    | 'constraint_identification'
    | 'objective_setting'
    | 'solution_search'
    | 'sensitivity_analysis';

  problem?: OptimizationProblem;
  variables?: DecisionVariable[];
  optimizationConstraints?: Constraint[];
  objectives?: Objective[];
  solution?: Solution;
  analysis?: SensitivityAnalysis;
}

/**
 * Optimization problem definition
 */
export interface OptimizationProblem {
  id: string;
  name: string;
  description: string;
  type: 'linear' | 'nonlinear' | 'integer' | 'mixed_integer' | 'constraint_satisfaction' | 'multi_objective';
  approach?: 'exact' | 'heuristic' | 'metaheuristic' | 'approximation';
  complexity?: string; // e.g., "NP-hard", "P", "polynomial"
}

/**
 * Decision variable in optimization
 */
export interface DecisionVariable {
  id: string;
  name: string;
  description: string;
  type: 'continuous' | 'integer' | 'binary' | 'categorical';
  domain: Domain;
  unit?: string;
  semantics: string; // What this variable represents
}

/**
 * Variable domain
 */
export type Domain =
  | { type: 'continuous'; lowerBound: number; upperBound: number }
  | { type: 'discrete'; values: number[] }
  | { type: 'integer'; lowerBound: number; upperBound: number }
  | { type: 'binary' }
  | { type: 'categorical'; categories: string[] };

/**
 * Constraint type
 */
export type ConstraintType = 'hard' | 'soft';

/**
 * Constraint on variables
 */
export interface Constraint {
  id: string;
  name: string;
  description: string;
  type: ConstraintType;
  formula: string; // Mathematical expression
  latex?: string; // LaTeX representation
  variables: string[]; // Variable IDs involved
  penalty?: number; // For soft constraints
  rationale: string; // Why this constraint exists
  priority?: number; // For constraint relaxation (higher = more important)
}

/**
 * Objective function
 */
export interface Objective {
  id: string;
  name: string;
  description: string;
  type: 'minimize' | 'maximize';
  formula: string;
  latex?: string;
  variables: string[]; // Variable IDs
  weight?: number; // For multi-objective optimization (0-1)
  units?: string;
  idealValue?: number;
  acceptableRange?: [number, number];
}

/**
 * Solution to optimization problem
 */
export interface Solution {
  id: string;
  type: 'optimal' | 'feasible' | 'infeasible' | 'unbounded' | 'approximate';
  variableValues: Record<string, number | string>;
  objectiveValues: Record<string, number>; // Objective ID -> value
  constraintSatisfaction: {
    constraintId: string;
    satisfied: boolean;
    violation?: number;
  }[];
  quality: number; // 0-1, how good is this solution
  computationTime?: number; // milliseconds
  iterations?: number;
  method?: string; // Algorithm used
  guarantees?: string[]; // e.g., "proven optimal", "within 5% of optimal"
}

/**
 * Pareto optimal solution (for multi-objective)
 */
export interface ParetoSolution {
  id: string;
  solution: Solution;
  isDominated: boolean;
  dominates: string[]; // IDs of solutions this dominates
  tradeoffs: {
    objectiveId: string;
    value: number;
    comparison: string;
  }[];
}

/**
 * Feasible region description
 */
export interface FeasibleRegion {
  id: string;
  description: string;
  isEmpty: boolean;
  isConvex?: boolean;
  vertices?: Record<string, number>[]; // For LP problems
  volume?: number;
  boundaryConstraints: string[]; // Constraint IDs
}

/**
 * Sensitivity analysis results
 */
export interface SensitivityAnalysis {
  id: string;
  parameters: ParameterSensitivity[];
  robustness: number; // 0-1, how robust is the solution
  criticalConstraints: string[]; // Constraint IDs that are binding
  shadowPrices?: Record<string, number>; // Constraint ID -> shadow price
  recommendations: string[];
}

/**
 * Sensitivity to parameter changes
 */
export interface ParameterSensitivity {
  parameterId: string; // Variable or constraint ID
  type: 'variable' | 'constraint' | 'objective_coefficient';
  currentValue: number;
  allowableIncrease?: number;
  allowableDecrease?: number;
  impact: 'high' | 'medium' | 'low';
  analysis: string;
}

/**
 * Relaxation of constraints
 */
export interface ConstraintRelaxation {
  constraintId: string;
  originalFormula: string;
  relaxedFormula: string;
  relaxationAmount: number;
  impact: string;
  newSolution?: Solution;
}

/**
 * Trade-off analysis
 */
export interface TradeoffAnalysis {
  id: string;
  objectives: string[]; // Objective IDs
  paretoFrontier?: ParetoSolution[];
  visualizations?: string[];
  recommendations: {
    solution: Solution;
    rationale: string;
    suitableFor: string;
  }[];
}

/**
 * Type guard for Optimization thoughts
 */
export function isOptimizationThought(thought: BaseThought): thought is OptimizationThought {
  return thought.mode === 'optimization';
}
