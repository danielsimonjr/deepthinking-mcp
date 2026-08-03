# Recursive Thought — Output Format

Self-referential problem decomposition: base case + recursive case + halting condition.

## JSON Schema

```json
{
  "mode": "recursive",
  "strategy": "<divide_and_conquer | dynamic_programming | backtracking | tree_traversal | mathematical_induction>",
  "currentDepth": <integer >= 0>,
  "maxDepth": <integer >= 1>,
  "baseCaseReached": <boolean>,
  "baseCases": [
    { "id": "<id>", "condition": "<stopping condition>", "result": "<direct result>" }
  ],
  "recurrence": {
    "formula": "<explicit recurrence relation, e.g. T(n) = 2T(n/2) + O(n)>",
    "closedForm": "<O(...) final complexity>",
    "timeComplexity": "<O(...)>",
    "spaceComplexity": "<O(...)>"
  },
  "subproblems": [
    { "id": "<id>", "description": "<smaller instance>", "size": "<n/2, n-1, ...>", "status": "pending" }
  ],
  "memoization": {
    "enabled": <boolean>,
    "hits": <integer>,
    "misses": <integer>,
    "cacheSize": <integer>
  }
}
```

## Required Fields

- `mode` — always `"recursive"`
- `strategy` — the recursive decomposition strategy
- `currentDepth` — depth of the current recursive call (0 = initial call)
- `maxDepth` — maximum allowed depth before termination
- `baseCaseReached` — whether this call is a base case
- `baseCases` — at least one entry with `id`, `condition`, and `result`
- `recurrence.formula` — the recurrence relation stated explicitly

## Key Distinction from Sequential

Sequential reasoning breaks a problem into *different* steps A → B → C. Recursive reasoning breaks a problem into *smaller instances of itself*: `solve(n)` depends on `solve(n-1)` or `solve(n/2)`. The self-similarity is the defining feature.

## Worked Example

Input: "Design a recursive solution for deeply nested config validation where each nested config follows the same rules as the parent."

Output:

```json
{
  "mode": "recursive",
  "strategy": "divide_and_conquer",
  "currentDepth": 0,
  "maxDepth": 20,
  "baseCaseReached": false,
  "baseCases": [
    {
      "id": "bc1",
      "condition": "config has no nested sub-configs (leaf node)",
      "result": "validate primitive fields directly; return list of field-level errors"
    },
    {
      "id": "bc2",
      "condition": "config is null or empty",
      "result": "return empty error list"
    }
  ],
  "recurrence": {
    "formula": "validate(config) = validateFields(config) ++ flatMap(validate, config.subConfigs)",
    "closedForm": "O(n) where n = total number of config nodes",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(d) where d = maximum nesting depth"
  },
  "subproblems": [
    {
      "id": "sp1",
      "description": "validate each sub-config block using the same validation rules",
      "size": "number of nodes in the sub-config subtree",
      "status": "pending"
    }
  ],
  "memoization": {
    "enabled": false,
    "hits": 0,
    "misses": 0,
    "cacheSize": 0
  }
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"recursive"`
- `strategy` is one of the five valid enum values
- `baseCases` has at least one entry with `id`, `condition`, and `result`
- `recurrence.formula` is a concrete recurrence, not "recurse into sub-items"
- The subproblem `size` strictly decreases at each step (guarantees halting)
- `baseCaseReached` is `true` only when actually at a base case
- `memoization.enabled` is `true` only when subproblems overlap (dynamic programming)
