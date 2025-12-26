# Recursive Reasoning Mode

**Version**: 8.4.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_analytical`
**Status**: Stable (Advanced Runtime Mode)
**Source**: `src/types/modes/recursive.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `RecursiveStrategy`
- **Interfaces**: `RecursiveThought`, `Subproblem`, `BaseCase`, `RecurrenceRelation`, `RecursiveCall`, `MemoizationState`
- **Functions**: `isRecursiveThought`

---

## Overview

Recursive reasoning provides structured **problem decomposition** using divide-and-conquer, dynamic programming, and other recursive strategies. It tracks recursion depth, base cases, subproblem relationships, and memoization.

This mode captures the structure of recursive thinking - breaking problems into smaller instances, solving base cases, and combining solutions.

## When to Use Recursive Mode

Use recursive reasoning when you need to:

- **Divide and conquer** - Split problems into independent subproblems
- **Dynamic programming** - Solve overlapping subproblems efficiently
- **Tree/graph traversal** - Navigate hierarchical structures
- **Backtracking** - Explore solution spaces systematically
- **Mathematical induction** - Prove properties recursively

## Thought Types

| Type | Description |
|------|-------------|
| `problem_decomposition` | Breaking down the main problem |
| `base_case_identification` | Finding termination conditions |
| `recursive_case_definition` | Defining the recursive step |
| `recurrence_formulation` | Expressing recurrence relations |
| `solution_combination` | Merging subproblem solutions |
| `recursive_step` | Executing one recursive call |
| `subproblem_solution` | Solving a subproblem |
| `termination_analysis` | Proving termination |

## Recursive Strategies

| Strategy | Description |
|----------|-------------|
| `divide_and_conquer` | Split, solve, combine (merge sort) |
| `decrease_and_conquer` | Reduce by constant/factor (binary search) |
| `dynamic_programming` | Optimal substructure + overlapping subproblems |
| `memoization` | Top-down with caching |
| `backtracking` | Systematic search with pruning |

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentDepth` | `number` | Current recursion depth |
| `maxDepth` | `number` | Maximum allowed depth |
| `baseCaseReached` | `boolean` | Has base case been hit? |
| `strategy` | `RecursiveStrategy` | Decomposition approach |
| `divisionFactor` | `number` | Split factor (e.g., 2 for binary) |
| `subproblems` | `Subproblem[]` | Generated subproblems |
| `baseCases` | `BaseCase[]` | Termination conditions |
| `recurrence` | `RecurrenceRelation` | e.g., T(n) = 2T(n/2) + O(n) |
| `callStack` | `RecursiveCall[]` | Call trace for debugging |
| `memoState` | `MemoizationState` | Cache status |

## Example Usage

```json
{
  "tool": "deepthinking_analytical",
  "arguments": {
    "mode": "recursive",
    "thought": "Analyzing merge sort complexity",
    "thoughtNumber": 1,
    "totalThoughts": 4,
    "nextThoughtNeeded": true,
    "thoughtType": "recurrence_formulation",
    "currentDepth": 0,
    "maxDepth": 10,
    "baseCaseReached": false,
    "strategy": "divide_and_conquer",
    "divisionFactor": 2,
    "baseCases": [
      {"condition": "n <= 1", "result": "O(1)", "description": "Single element already sorted"}
    ],
    "recurrence": {
      "formula": "T(n) = 2T(n/2) + O(n)",
      "closedForm": "O(n log n)",
      "method": "master_theorem"
    }
  }
}
```

## Best Practices

1. **Define base cases first** - Ensure termination
2. **Verify subproblem independence** - For divide and conquer
3. **Check overlapping subproblems** - Use memoization if present
4. **Track stack depth** - Prevent overflow
5. **Prove correctness via induction** - Mathematical rigor

## Related Modes

- **Algorithmic** - Algorithm design patterns
- **Mathematics** - Inductive proofs
- **Constraint** - Backtracking search
