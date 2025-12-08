# Optimization Mode

**Version**: 7.3.0
**Tool**: `deepthinking_analytical`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/optimization.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `Domain`, `ConstraintType`
- **Interfaces**: `OptimizationThought`, `OptimizationProblem`, `DecisionVariable`, `Constraint`, `Objective`, `Solution`, `ParetoSolution`, `FeasibleRegion`, `SensitivityAnalysis`, `ParameterSensitivity`, `ConstraintRelaxation`, `TradeoffAnalysis`
- **Functions**: `isOptimizationThought`

---

## Overview

Optimization mode provides **constraint satisfaction and optimization** problem modeling. It supports linear, nonlinear, integer, and multi-objective optimization with sensitivity analysis and solution quality assessment.

This mode captures the structure of optimization reasoning - from problem formulation through solution finding to sensitivity analysis.

## Thought Types

| Type | Description |
|------|-------------|
| `problem_formulation` | Define the optimization problem |
| `variable_definition` | Define decision variables |
| `constraint_identification` | Identify constraints |
| `objective_setting` | Define objective function(s) |
| `solution_search` | Find optimal/feasible solutions |
| `sensitivity_analysis` | Analyze solution sensitivity |

## When to Use Optimization Mode

Use optimization mode when you need to:

- **Formulate optimization problems** - Define variables, constraints, objectives
- **Find optimal solutions** - Linear programming, integer programming, etc.
- **Analyze tradeoffs** - Multi-objective optimization, Pareto fronts
- **Assess sensitivity** - How solutions change with parameters
- **Constraint satisfaction** - Find feasible solutions

### Problem Types Well-Suited for Optimization Mode

- **Resource allocation** - Optimal distribution of resources
- **Scheduling** - Time and task optimization
- **Design optimization** - Parameter optimization
- **Portfolio optimization** - Financial optimization
- **Logistics** - Routing, supply chain optimization

## Core Concepts

### Optimization Problem

```typescript
interface OptimizationProblem {
  id: string;
  name: string;
  description: string;
  type: 'linear' | 'nonlinear' | 'integer' | 'mixed_integer' | 'constraint_satisfaction' | 'multi_objective';
  approach?: 'exact' | 'heuristic' | 'metaheuristic' | 'approximation';
  complexity?: string;  // "NP-hard", "P", etc.
}
```

### Decision Variables

```typescript
interface DecisionVariable {
  id: string;
  name: string;
  description: string;
  type: 'continuous' | 'integer' | 'binary' | 'categorical';
  domain: Domain;
  unit?: string;
  semantics: string;  // What this variable represents
}

type Domain =
  | { type: 'continuous'; lowerBound: number; upperBound: number }
  | { type: 'discrete'; values: number[] }
  | { type: 'integer'; lowerBound: number; upperBound: number }
  | { type: 'binary' }
  | { type: 'categorical'; categories: string[] };
```

### Constraints

```typescript
interface Constraint {
  id: string;
  name: string;
  description: string;
  type: 'hard' | 'soft';
  formula: string;       // Mathematical expression
  latex?: string;
  variables: string[];   // Variable IDs involved
  penalty?: number;      // For soft constraints
  rationale: string;
  priority?: number;     // For constraint relaxation
}
```

### Objectives

```typescript
interface Objective {
  id: string;
  name: string;
  description: string;
  type: 'minimize' | 'maximize';
  formula: string;
  latex?: string;
  variables: string[];
  weight?: number;       // For multi-objective (0-1)
  units?: string;
  idealValue?: number;
  acceptableRange?: [number, number];
}
```

### Solution

```typescript
interface Solution {
  id: string;
  type: 'optimal' | 'feasible' | 'infeasible' | 'unbounded' | 'approximate';
  variableValues: Record<string, number | string>;
  objectiveValues: Record<string, number>;
  constraintSatisfaction: {
    constraintId: string;
    satisfied: boolean;
    violation?: number;
  }[];
  quality: number;       // 0-1
  computationTime?: number;
  iterations?: number;
  method?: string;       // Algorithm used
  guarantees?: string[]; // "proven optimal", "within 5% of optimal"
}
```

## Usage Example

```typescript
// Problem formulation
const problem = await deepthinking_analytical({
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
const variables = await deepthinking_analytical({
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
const constraints = await deepthinking_analytical({
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
const objective = await deepthinking_analytical({
  mode: 'optimization',
  thought: 'Define profit maximization objective',
  thoughtNumber: 4,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'objective_setting',
  objectives: [{
    id: 'profit',
    name: 'Total Profit',
    description: 'Maximize weekly profit',
    type: 'maximize',
    formula: '40*x1 + 30*x2',
    latex: '\\max Z = 40x_1 + 30x_2',
    variables: ['x1', 'x2'],
    units: 'dollars',
    idealValue: 2000
  }]
});

// Solution
const solution = await deepthinking_analytical({
  mode: 'optimization',
  thought: 'Find optimal production quantities',
  thoughtNumber: 5,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'solution_search',
  solution: {
    id: 'sol_01',
    type: 'optimal',
    variableValues: { x1: 15, x2: 30 },
    objectiveValues: { profit: 1500 },
    constraintSatisfaction: [
      { constraintId: 'c1', satisfied: true },
      { constraintId: 'c2', satisfied: true }
    ],
    quality: 1.0,
    method: 'simplex',
    guarantees: ['proven optimal']
  }
});

// Sensitivity analysis
const sensitivity = await deepthinking_analytical({
  mode: 'optimization',
  thought: 'Analyze solution sensitivity to parameter changes',
  thoughtNumber: 6,
  totalThoughts: 6,
  nextThoughtNeeded: false,

  thoughtType: 'sensitivity_analysis',
  analysis: {
    id: 'sens_01',
    parameters: [
      {
        parameterId: 'c1',
        type: 'constraint',
        currentValue: 120,
        allowableIncrease: 20,
        allowableDecrease: 10,
        impact: 'high',
        analysis: 'Binding constraint - additional machine hours valuable'
      }
    ],
    robustness: 0.75,
    criticalConstraints: ['c1'],
    shadowPrices: { c1: 10, c2: 5 },
    recommendations: ['Consider adding machine capacity']
  }
});
```

## Best Practices

### Problem Formulation

✅ **Do:**
- Clearly define problem type and approach
- State complexity class if known
- Document problem assumptions

❌ **Don't:**
- Skip problem classification
- Ignore computational complexity
- Leave assumptions implicit

### Variable Definition

✅ **Do:**
- Define clear semantics for each variable
- Specify domains precisely
- Use meaningful variable names

❌ **Don't:**
- Use arbitrary bounds
- Ignore variable integrality
- Skip semantic description

### Constraint Definition

✅ **Do:**
- Distinguish hard vs soft constraints
- Provide rationale for each constraint
- Use LaTeX for clarity

❌ **Don't:**
- Omit important constraints
- Leave rationale unclear
- Mix constraint priorities

### Solution Analysis

✅ **Do:**
- Verify constraint satisfaction
- Assess solution quality
- Analyze sensitivity

❌ **Don't:**
- Accept solutions without verification
- Ignore infeasibility
- Skip sensitivity analysis

## OptimizationThought Interface

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

## Integration with Other Modes

Optimization mode integrates with:

- **Mathematics Mode** - Mathematical formulation
- **Engineering Mode** - Design optimization
- **Game Theory Mode** - Strategic optimization
- **Algorithmic Mode** - Algorithm complexity analysis

## Related Modes

- [Mathematics Mode](./MATHEMATICS.md) - Mathematical foundations
- [Engineering Mode](./ENGINEERING.md) - Design optimization
- [Game Theory Mode](./GAMETHEORY.md) - Strategic problems
- [Algorithmic Mode](./ALGORITHMIC.md) - Algorithm analysis

## Limitations

- **No solver integration** - Manual solution required
- **Limited to modeling** - No automatic optimization
- **Complexity limitations** - Large problems need external tools

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
