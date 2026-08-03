# Optimization Thought — Output Format

Finding the best solution (minimum cost or maximum value) subject to a defined set of constraints.

## JSON Schema

```json
{
  "mode": "optimization",
  "problem": {
    "name": "<problem name>",
    "type": "linear | nonlinear | integer | mixed_integer | multi_objective",
    "description": "<what is being optimized>"
  },
  "variables": [
    {
      "id": "<variable id>",
      "name": "<human name>",
      "type": "continuous | integer | binary",
      "lowerBound": <number>,
      "upperBound": <number, optional>,
      "description": "<what this variable represents>"
    }
  ],
  "objective": {
    "type": "minimize | maximize",
    "formula": "<f(x) using variable ids>",
    "description": "<what the objective value means>"
  },
  "constraints": [
    {
      "id": "<constraint id>",
      "name": "<constraint name>",
      "formula": "<g(x) <= b or similar, using variable ids>",
      "isHard": true | false,
      "rationale": "<why this constraint exists>",
      "penalty": <number, optional, for soft constraints>
    }
  ],
  "solution": {
    "status": "optimal | feasible | infeasible | unbounded | approximate",
    "variableValues": { "<variable id>": <value> },
    "objectiveValue": <number>,
    "bindingConstraints": ["<constraint id>"],
    "note": "<optional clarification>"
  },
  "analysis": "<interpretation of solution, binding constraints, sensitivity notes>"
}
```

## Required Fields

- `mode` — always `"optimization"`
- `problem` — problem metadata including type
- `variables` — at least one decision variable with id, name, type, and lowerBound
- `objective` — direction (`"minimize"` or `"maximize"`) plus formula
- `constraints` — at least one constraint
- `solution` — solution status and variable assignments
- `analysis` — explains which constraints are binding, what the objective value means, and any sensitivity considerations

## Minimization vs. Maximization

Always state direction explicitly. Equivalent formulations:
- `maximize f(x)` ≡ `minimize -f(x)`

Do not use both in the same objective — for multi-objective problems, use weighted combination or separate the objectives and analyze the Pareto frontier.

## Binding Constraints

A constraint is **binding** (active) at the optimum when it holds with equality (zero slack). Binding constraints are the limiting factors — relaxing them would improve the objective. List their ids in `solution.bindingConstraints`.

## Feasible Region

The feasible region is the intersection of all constraint sets. If it is empty, the problem is infeasible and no solution exists. If it is unbounded, the objective may have no finite optimum (flag as `"unbounded"`).

## Worked Example

See `skills/think-strategic/SKILL.md` — Optimization section, Worked Example: Cloud Instance Allocation.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"optimization"`
- `objective.type` is `"minimize"` or `"maximize"` (not both)
- All constraint `formula` fields reference only declared variable `id`s
- `solution.status` is `"optimal"` only when a global optimum is confirmed
- `solution.bindingConstraints` lists constraints that hold with equality at the solution
- `analysis` explains what the binding constraints mean and notes sensitivity to parameter changes
