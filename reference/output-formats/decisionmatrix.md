# Decision Matrix Thought — Output Format

Comparing multiple options against multiple weighted criteria, with a scored, auditable recommendation.

## JSON Schema

```json
{
  "mode": "decisionmatrix",
  "options": ["<option 1>", "<option 2>", ...],
  "criteria": [
    {"name": "<criterion 1>", "weight": 0.0}
  ],
  "scores": [
    {"option": "<option 1>", "perCriterion": [0, 0], "total": 0.0}
  ],
  "recommendation": "<chosen option and the arithmetic that supports it>"
}
```

## Required Fields

- `mode` — always `"decisionmatrix"`
- `options` — the candidates being compared; **at least 2** (`minItems: 2`) — a decision matrix with only one option isn't a comparison
- `criteria` — the weighted dimensions of comparison, each `{name, weight}`; **at least 2** (`minItems: 2`) — a single criterion doesn't need a matrix, it needs a simple ranking
- `scores` — one entry per option: `{option, perCriterion, total}`, where `perCriterion[i]` is the raw score for `criteria[i]` and `total` is the weighted sum
- `recommendation` — names the chosen option and shows the arithmetic that supports it

## Prose Invariants (not schema-enforced)

- **≥2 options and ≥2 criteria** — schema-enforced via `minItems: 2` on both arrays, restated here because it is the defining shape of this mode: fewer than two of either collapses the matrix into a non-comparison.
- **Show weights × scores.** Per the `think-frameworks` Output Quality Rule, `total` must be derivable from `perCriterion[i] × criteria[i].weight` summed across criteria — the `recommendation` (or accompanying prose) must show this arithmetic explicitly, not just state the winning total. A bare ranking without the weighted math cannot be audited or challenged.
- `perCriterion` arrays must be the same length as `criteria`, and in the same order, for every entry in `scores` — a mismatched order silently corrupts the weighted-sum arithmetic even though the schema cannot detect the misalignment.
- `recommendation` should name the option with the highest `total` unless there's a stated reason (e.g., a hard constraint outside the matrix) to override the numeric winner — and if overriding, the override reason must be explicit, not silent.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"decisionmatrix"`
- `options` has at least 2 entries, `criteria` has at least 2 entries
- Every entry in `scores` has a `perCriterion` array the same length as `criteria`, in matching order
- Every `total` equals the weighted sum: `sum(perCriterion[i] * criteria[i].weight for i in range(len(criteria)))` — recompute this before emitting; a `total` that doesn't match its own `perCriterion` values is the single most common error in this mode
- `recommendation` shows the weighted-sum arithmetic for at least the top options, not just the final ranking

## Worked Example

Input: "Compare big-bang cutover, dual-write phased migration, and strangler-fig incremental migration for our database migration, weighted by downtime risk, engineering effort, and time to completion."

Output:

```json
{
  "mode": "decisionmatrix",
  "options": [
    "Big-bang cutover",
    "Dual-write phased migration",
    "Strangler-fig incremental migration"
  ],
  "criteria": [
    {"name": "Risk of downtime (higher score = lower risk)", "weight": 0.4},
    {"name": "Engineering effort (higher score = less effort)", "weight": 0.35},
    {"name": "Time to completion (higher score = faster)", "weight": 0.25}
  ],
  "scores": [
    {"option": "Big-bang cutover", "perCriterion": [2, 4, 5], "total": 3.45},
    {"option": "Dual-write phased migration", "perCriterion": [4, 2, 2], "total": 2.80},
    {"option": "Strangler-fig incremental migration", "perCriterion": [5, 3, 3], "total": 3.80}
  ],
  "recommendation": "Choose the strangler-fig incremental migration: 2*0.4+4*0.35+5*0.25=3.45 for big-bang, 4*0.4+2*0.35+2*0.25=2.80 for dual-write, and 5*0.4+3*0.35+3*0.25=3.80 for strangler-fig — the highest weighted total, driven by its low downtime risk without sacrificing much on effort or time."
}
```

The recommendation restates all three weighted-sum computations inline rather than just naming the winner — this is what "show weights × scores" means in practice: the reader can verify 3.80 > 3.45 > 2.80 without recomputing anything themselves.
