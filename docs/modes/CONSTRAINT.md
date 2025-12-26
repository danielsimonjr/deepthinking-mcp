# Constraint Satisfaction Mode

**Version**: 8.4.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_strategic`
**Status**: Stable (Advanced Runtime Mode)
**Source**: `src/types/modes/constraint.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `PropagationMethod`, `SearchStrategy`
- **Interfaces**: `ConstraintThought`, `CSPVariable`, `CSPConstraint`, `AssignmentHistoryEntry`, `Arc`, `DomainWipeout`
- **Functions**: `isConstraintThought`

---

## Overview

Constraint satisfaction reasoning provides structured **CSP formulation and solving**. It models problems as variables with domains, constraints between variables, and uses propagation and search to find solutions.

This mode captures the structure of constraint reasoning - defining variables, specifying constraints, propagating domain reductions, and searching for feasible assignments.

## When to Use Constraint Mode

Use constraint reasoning when you need to:

- **Scheduling** - Assign resources subject to constraints
- **Configuration** - Find valid product configurations
- **Puzzles** - Sudoku, N-queens, cryptarithmetic
- **Planning** - Satisfy temporal/resource constraints
- **Design validation** - Check feasibility of designs

## Thought Types

| Type | Description |
|------|-------------|
| `problem_formulation` | Defining the CSP |
| `variable_definition` | Specifying variables and domains |
| `constraint_definition` | Defining constraints |
| `domain_reduction` | Reducing variable domains |
| `arc_consistency` | Enforcing AC-3 |
| `propagation` | Constraint propagation |
| `solution_search` | Backtracking search |
| `backtracking` | Undoing bad choices |
| `feasibility_check` | Checking if solution exists |
| `consistency_check` | Verifying assignments |

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `variables` | `CSPVariable[]` | Variables with domains |
| `constraints` | `CSPConstraint[]` | Constraints on variables |
| `currentAssignments` | `Record<string, value>` | Current partial solution |
| `assignmentHistory` | `AssignmentHistoryEntry[]` | Assignment trace |
| `backtracks` | `number` | Number of backtracks |
| `searchStep` | `number` | Current search step |
| `propagationMethod` | `PropagationMethod` | AC-3, forward checking, etc. |
| `searchStrategy` | `SearchStrategy` | Variable/value ordering |
| `arcs` | `Arc[]` | Arcs for consistency |

## Propagation Methods

| Method | Description |
|--------|-------------|
| `arc_consistency` | AC-3 algorithm |
| `forward_checking` | Check unassigned neighbors |
| `path_consistency` | 3-consistency |
| `node_consistency` | Unary constraint satisfaction |
| `generalized_arc_consistency` | For n-ary constraints |

## Search Strategies

| Strategy | Description |
|----------|-------------|
| `backtracking` | Basic depth-first search |
| `backjumping` | Jump to conflict source |
| `conflict_directed` | Learn from conflicts |
| `min_remaining_values` | MRV heuristic |
| `degree_heuristic` | Most constrained variable |
| `least_constraining_value` | LCV for value ordering |

## Example Usage

```json
{
  "tool": "deepthinking_strategic",
  "arguments": {
    "mode": "constraint",
    "thought": "Solving meeting scheduling problem",
    "thoughtNumber": 1,
    "totalThoughts": 5,
    "nextThoughtNeeded": true,
    "thoughtType": "problem_formulation",
    "variables": [
      {"name": "meeting_A", "domain": ["9am", "10am", "11am", "2pm", "3pm"]},
      {"name": "meeting_B", "domain": ["9am", "10am", "11am", "2pm", "3pm"]},
      {"name": "meeting_C", "domain": ["10am", "11am", "2pm"]}
    ],
    "constraints": [
      {"type": "not_equal", "scope": ["meeting_A", "meeting_B"], "description": "A and B cannot overlap"},
      {"type": "not_equal", "scope": ["meeting_B", "meeting_C"], "description": "B and C cannot overlap"},
      {"type": "before", "scope": ["meeting_A", "meeting_C"], "description": "A must be before C"}
    ],
    "currentAssignments": {},
    "backtracks": 0,
    "propagationMethod": "arc_consistency",
    "searchStrategy": "min_remaining_values"
  }
}
```

## Best Practices

1. **Apply node consistency first** - Simplest preprocessing
2. **Enforce arc consistency before search** - Reduce domains early
3. **Use MRV heuristic** - Fail-first principle
4. **Track backtracks** - Measure search difficulty
5. **Learn from conflicts** - For repeated solving

## Related Modes

- **Optimization** - CSP with objective function
- **Algorithmic** - Search algorithms
- **Game Theory** - Strategic constraints
