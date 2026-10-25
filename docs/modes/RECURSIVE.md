# Recursive Reasoning Mode

**Version**: 8.4.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_engineering`
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

Recursive reasoning provides structured **problem decomposition** with the divide-and-conquer, decrease-and-conquer, transform-and-conquer and dynamic-programming strategies. A thought stores the recursion depth, the base cases, the subproblems and the recurrence relation.

This mode captures the structure of recursive thinking: break a problem into smaller instances, solve the base cases, and combine the solutions.

## When to Use Recursive Mode

Use recursive reasoning when you need to:

- **Divide and conquer** - Split a problem into independent subproblems
- **Dynamic programming** - Solve overlapping subproblems efficiently
- **Tree and graph traversal** - Navigate hierarchical structures
- **Mathematical induction** - Prove a property with a base case and a step

## Thought Types

The mode has eight thought types. The tool accepts any string in `thoughtType`. A value that is not in this table becomes `problem_decomposition`.

| Type | Description |
|------|-------------|
| `problem_decomposition` | Break down the main problem |
| `base_case_identification` | Find the termination conditions |
| `recursive_case_definition` | Define the recursive step |
| `recurrence_formulation` | Express the recurrence relation |
| `recursive_step` | Execute one recursive call |
| `subproblem_solution` | Solve a subproblem |
| `solution_combination` | Merge the subproblem solutions |
| `termination_analysis` | Prove termination |

## Recursive Strategies

The mode has four strategies. The tool accepts any string in `strategy`. A value that is not in this table becomes `divide_and_conquer`.

| Strategy | Description |
|----------|-------------|
| `divide_and_conquer` | Split, solve, combine (merge sort) |
| `decrease_and_conquer` | Reduce by a constant or a factor (binary search) |
| `transform_and_conquer` | Change the problem to an easier form, then solve it |
| `dynamic_programming` | Optimal substructure and overlapping subproblems |

Memoization and backtracking are not strategies of this mode. A request that names one of them gets the default strategy and one sentence.

## Request Fields

The tool `deepthinking_engineering` takes these fields in recursive mode. The advertised JSON Schema of the tool lists all of them. The Zod schema accepts and bounds all of them.

| Field | Type | Description |
|-------|------|-------------|
| `thoughtType` | `string` | One of the 8 thought types |
| `strategy` | `string` | One of the 4 strategies |
| `currentDepth` | `integer`, 0 or more | Current recursion depth |
| `maxDepth` | `integer`, 0 or more | Depth limit. The thought stores it only when the request carries it. |
| `baseCaseReached` | `boolean` | Whether a base case is reached |
| `divisionFactor` | `number` | Split factor (2 for binary) |
| `subproblems` | array | The subproblems of the decomposition |
| `baseCases` | array | The termination conditions |
| `recurrence` | object | The recurrence relation, for example `T(n) = 2T(n/2) + O(n)` |

A subproblem has `id`, `name`, `description`, `size` (a number or a string), `depth`, `parentId`, `status` and `result`. A base case has `id`, `condition`, `result` and `verified`.

The tool does not accept `callStack` or `memoization`. The type `RecursiveThought` names both. The handler never sets them.

### Recurrence

Algorithmic mode reads the same `recurrence` object. Recursive mode reads four members: `formula`, `baseCase`, `closedForm` and `complexity`. Recursive mode ignores the other five: `id`, `solutionMethod`, `solution`, `solutionProof` and `recursionTree`. The thought does not store an ignored member. The answer carries one sentence that names each ignored member that the request sent.

### Subproblem status

A subproblem status is one of `pending`, `in_progress`, `solving` and `solved`. An absent status is `pending`. The handler keeps an unrecognised status as sent. The answer carries one sentence that lists the four values. Two subproblems with the same unrecognised status give one sentence.

## What the Handler Replaces, Keeps and Ignores

A member is stored only when the client sent it, with the exceptions in this table. An absent member is not a choice that the client made.

| Request | Result | Sentence in the answer |
|---------|--------|------------------------|
| `thoughtType` absent | `problem_decomposition` | No |
| `thoughtType` unrecognised | `problem_decomposition` | One, with the 8 values |
| `strategy` absent | `divide_and_conquer` | No |
| `strategy` unrecognised | `divide_and_conquer` | One, with the 4 values |
| `maxDepth` absent | The member stays absent | No |
| `currentDepth` absent | 0 without subproblems, else the greatest subproblem depth plus 1 | No |
| `baseCaseReached` absent | `true` when a base case has `verified: true`, else `false` | No |
| Subproblem `status` absent | `pending` | No |
| Subproblem `status` unrecognised | Kept as sent | One, with the 4 values |
| Subproblem `id` absent | A generated identifier | No |
| Subproblem `name` or `description` absent | The empty string | No |
| Subproblem `size` absent | `"unknown"` | No |
| Subproblem `depth` absent | 0 | No |
| Base case `id` absent | A generated identifier | No |
| Base case `condition` or `result` absent | The empty string | No |
| Base case `verified` absent | `false` | No |
| Recurrence `formula` or `baseCase` absent | The empty string | No |
| One of the 5 ignored recurrence members present | Not stored | One, naming the members |
| `divisionFactor` present | Stored as sent | No |

The sentences are in `validation.issues` of the answer, beside the issues of the general validator for recursive thoughts. That validator reads the text and the number of the thought, and it reports no value of a request field. The thought stores the sentences in `inputWarnings`.

## Handler Output

`RecursiveHandler.getEnhancements` builds guiding questions, suggestions, warnings and metrics for each thought. The add-thought answer does not carry them. A test of the handler reads them.

- **Metrics**: `currentDepth`, `subproblemCount`, `baseCaseCount`, `baseCaseReached`, and `maxDepth` only when the thought stores one.
- **Depth warning**: the handler warns when `currentDepth` is more than 80 percent of a `maxDepth` that the client sent. A thought without `maxDepth` has no depth warning.
- **Base case warning**: the handler warns when no base case is reached and no base case is defined, at a depth above 0.
- **Recurrence suggestions**: `recursive_case_definition`, `recurrence_formulation` and `recursive_step` print `Recurrence:` and, when the request sent one, `Closed form:`.

## Example Usage

```json
{
  "tool": "deepthinking_engineering",
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
      {"condition": "n <= 1", "result": "O(1)", "verified": true}
    ],
    "recurrence": {
      "formula": "T(n) = 2T(n/2) + O(n)",
      "baseCase": "T(1) = O(1)",
      "closedForm": "O(n log n)",
      "complexity": "O(n log n)"
    }
  }
}
```

This request gives no sentence of the kind in the last column above, because every value is recognised and the request sends no ignored member. The thought has no `inputWarnings`.

## Best Practices

1. **Define the base cases first** - Make sure the recursion ends
2. **Verify that the subproblems are independent** - Divide and conquer needs this
3. **Check for overlapping subproblems** - Choose `dynamic_programming` when they overlap
4. **Send `maxDepth` when a limit matters** - The thought stores no limit that the client did not send
5. **Prove correctness by induction** - Use the base case and the recursive step

## RecursiveThought Interface

```typescript
interface RecursiveThought extends BaseThought {
  mode: ThinkingMode.RECURSIVE;
  thoughtType: 'problem_decomposition' | 'base_case_identification'
    | 'recursive_case_definition' | 'recurrence_formulation'
    | 'solution_combination' | 'recursive_step'
    | 'subproblem_solution' | 'termination_analysis';
  currentDepth: number;
  maxDepth?: number;            // Present only when the client sent it
  baseCaseReached: boolean;
  strategy: RecursiveStrategy;
  divisionFactor?: number;
  subproblems?: Subproblem[];
  baseCases?: BaseCase[];
  recurrence?: RecurrenceRelation;
  callStack?: RecursiveCall[];  // Never set by the handler
  memoization?: MemoizationState; // Never set by the handler
  inputWarnings?: string[];     // One sentence per request value that the handler replaced or ignored
}
```

## Related Modes

- [Algorithmic Mode](./ALGORITHMIC.md) - Algorithm design patterns; it reads the same `recurrence` object
- [Mathematics Mode](./MATHEMATICS.md) - Inductive proofs
- [Constraint Mode](./CONSTRAINT.md) - Backtracking search
