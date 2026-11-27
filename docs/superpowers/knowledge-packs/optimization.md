# Knowledge Pack: optimization

**Mode**: `optimization`
**Category skill**: `think-strategic`
**Source doc**: `docs/modes/OPTIMIZATION.md`

## Overview

Optimization mode provides **constraint satisfaction and optimization** problem modeling. It supports linear, nonlinear, integer, and multi-objective optimization with sensitivity analysis and solution quality assessment.

This mode captures the structure of optimization reasoning - from problem formulation through solution finding to sensitivity analysis.

## When to Use

Use optimization mode when you need to:

- **Formulate optimization problems** - Define variables, constraints, objectives
- **Find optimal solutions** - Linear programming, integer programming, etc.
- **Analyze tradeoffs** - Multi-objective optimization, Pareto fronts
- **Assess sensitivity** - How solutions change with parameters
- **Constraint satisfaction** - Find feasible solutions

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

```typescript
interface OptimizationThought extends BaseThought {
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
```

## Supporting Interfaces

```typescript
interface OptimizationProblem {
id: string;
  name: string;
  description: string;
  type: 'linear' | 'nonlinear' | 'integer' | 'mixed_integer' | 'constraint_satisfaction' | 'multi_objective';
  approach?: 'exact' | 'heuristic' | 'metaheuristic' | 'approximation';
  complexity?: string; // e.g., "NP-hard", "P", "polynomial"
}

interface DecisionVariable {
id: string;
  name: string;
  description: string;
  type: 'continuous' | 'integer' | 'binary' | 'categorical';
  domain: Domain;
  unit?: string;
  semantics: string; // What this variable represents
}

interface Constraint {
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

interface Objective {
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

interface Solution {
id: string;
  type: 'optimal' | 'feasible' | 'infeasible' | 'unbounded' | 'approximate';
  variableValues: Record<string, number | string>;
  objectiveValues: Record<string, number>; // Objective ID -> value
  constraintSatisfaction: {
    constraintId: string;
    satisfied: boolean;
    violation?: number;
}

interface ParetoSolution {
id: string;
  solution: Solution;
  isDominated: boolean;
  dominates: string[]; // IDs of solutions this dominates
  tradeoffs: {
    objectiveId: string;
    value: number;
    comparison: string;
}

interface FeasibleRegion {
id: string;
  description: string;
  isEmpty: boolean;
  isConvex?: boolean;
  vertices?: Record<string, number>[]; // For LP problems
  volume?: number;
  boundaryConstraints: string[]; // Constraint IDs
}

interface SensitivityAnalysis {
id: string;
  parameters: ParameterSensitivity[];
  robustness: number; // 0-1, how robust is the solution
  criticalConstraints: string[]; // Constraint IDs that are binding
  shadowPrices?: Record<string, number>; // Constraint ID -> shadow price
  recommendations: string[];
}

```

## Worked Example (from source doc)

```typescript
// Problem formulation
const problem = await deepthinking_strategic({
  mode: 'optimization',
  thought: 'Formulate the production planning optimization problem',
  thoughtNumber: 1,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'problem_formulation',
  problem: {
    id: 'prod_plan_01',
    name: 'Production Planning',
    description: 'Maximize profit subject to resource constraints',
    type: 'linear',
    approach: 'exact',
    complexity: 'P (linear programming)'
  }
});

// Variable definition
const variables = await deepthinking_strategic({
  mode: 'optimization',
  thought: 'Define decision variables for production quantities',
  thoughtNumber: 2,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'variable_definition',
  variables: [
    {
      id: 'x1',
      name: 'Product A quantity',
      description: 'Units of Product A to produce',
      type: 'continuous',
      domain: { type: 'continuous', lowerBound: 0, upperBound: 1000 },
      unit: 'units',
      semantics: 'Weekly production of Product A'
    },
    {
      id: 'x2',
      name: 'Product B quantity',
      description: 'Units of Product B to produce',
      type: 'continuous',
      domain: { type: 'continuous', lowerBound: 0, upperBound: 800 },
      unit: 'units',
      semantics: 'Weekly production of Product B'
    }
  ]
});

// Constraint identification
const constraints = await deepthinking_strategic({
  mode: 'optimization',
  thought: 'Identify resource constraints',
  thoughtNumber: 3,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'constraint_identification',
  optimizationConstraints: [
    {
      id: 'c1',
      name: 'Machine time constraint',
      description: 'Limited machine hours available',
      type: 'hard',
      formula: '2*x1 + 3*x2 <= 120',
      latex: '2x_1 + 3x_2 \\leq 120',
      variables: ['x1', 'x2'],
      rationale: '120 machine hours available per week'
    },
    {
      id: 'c2',
      name: 'Labor constraint',
      description: 'Limited labor hours available',
      type: 'hard',
      formula: '4*x1 + 2*x2 <= 100',
      latex: '4x_1 + 2x_2 \\leq 100',
      variables: ['x1', 'x2'],
      rationale: '100 labor hours available per week'
    }
  ]
});

// Objective setting
const objective = await deepthinking_strategic({
  mode: 'optimization',
  thought: 'Define profit maximization objective',
  thoughtNumber: 4,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'obj

---

*Generated by RLM extraction pass on 2026-04-12*
