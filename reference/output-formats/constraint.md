# Constraint Satisfaction Thought — Output Format

Finding any feasible assignment of values to variables that satisfies all constraints simultaneously (CSP formulation).

## JSON Schema

```json
{
  "mode": "constraint",
  "problem": "<description of what must be assigned and what rules apply>",
  "variables": [
    {
      "id": "<variable id>",
      "name": "<human name>",
      "domain": ["<value1>", "<value2>"]
    }
  ],
  "constraints": [
    {
      "id": "<constraint id>",
      "type": "not_equal | equals | alldiff | before | not_in | capacity | custom",
      "variables": ["<variable id>"],
      "expression": "<formal expression>",
      "description": "<human-readable rule>"
    }
  ],
  "propagation": {
    "method": "arc_consistency | forward_checking | full_lookahead | none",
    "reducedDomains": { "<variable id>": ["<remaining values>"] },
    "steps": ["<step 1>", "<step 2>"]
  },
  "solution": {
    "status": "found | infeasible | searching | timeout",
    "assignments": { "<variable id>": "<assigned value>" },
    "backtracks": <integer>
  },
  "analysis": "<explanation of how constraints interacted, any near-infeasibility, uniqueness>"
}
```

## Required Fields

- `mode` — always `"constraint"`
- `problem` — plain-language description of the CSP
- `variables` — at least two variables, each with a non-empty domain
- `constraints` — at least one constraint referencing declared variable ids
- `solution` — status, assignments (empty if infeasible), and backtrack count
- `analysis` — explains propagation steps, uniqueness of the solution, and how CSP differs from Optimization

## CSP vs. Optimization

This is the critical distinction:
- **CSP (this mode)**: "Does a valid assignment exist? What is one such assignment?" — No objective function. All feasible solutions are equally valid.
- **Optimization**: "What is the *best* assignment?" — Has an objective function; ranks solutions by quality.

If you find yourself preferring one feasible solution over another, switch to Optimization with a soft constraint or objective function.

## Propagation Methods

| Method | Description |
|--------|-------------|
| `arc_consistency` | AC-3: removes domain values that have no support in neighbor domains. Most thorough propagation. |
| `forward_checking` | When a value is assigned, check only adjacent unassigned variables. Faster but less thorough. |
| `full_lookahead` | Maintains arc consistency throughout search. Maximum pruning, higher overhead. |
| `none` | No propagation — pure backtracking search. |

## Backtracking

When propagation fails to determine a unique solution, backtracking extends a partial assignment one variable at a time:
1. Choose variable with smallest remaining domain (MRV heuristic)
2. Try each domain value
3. Check consistency; recurse if consistent
4. If all values fail, backtrack and try the next value for the parent variable

Report the total number of backtracks performed in `solution.backtracks`.

## Worked Example

See `skills/think-strategic/SKILL.md` — Constraint Satisfaction section, Worked Example: Engineer Role Assignment.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"constraint"`
- `variables` has at least two entries
- Every constraint `variables` array references valid `id`s from the variables list
- If `solution.status` is `"found"`, substitute each assignment into every constraint and confirm satisfaction
- If `solution.status` is `"infeasible"`, identify which constraint caused the domain to empty
- `analysis` does not claim the solution is "optimal" — CSP finds feasibility, not optimality
