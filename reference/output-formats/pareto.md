# Pareto (80/20) Thought — Output Format

Prioritizing the "vital few" contributors from the "trivial many," ranked by value with a cumulative-percentage cutoff.

## JSON Schema

```json
{
  "mode": "pareto",
  "items": [
    {"name": "<contributor 1>", "value": 0.0}
  ],
  "cumulativePercent": [0.0, ...],
  "vitalFew": ["<name of a vital contributor, copied verbatim from items[].name>"],
  "recommendation": "<optional: prioritization action>"
}
```

## Required Fields

- `mode` — always `"pareto"`
- `items` — the contributors being ranked, each `{name, value}`; should be sorted descending by `value` so the vital-few cutoff reads naturally
- `vitalFew` — the subset of `items[].name` (copied verbatim) judged to be the small number of contributors responsible for the bulk of the total (classically ~20% of items driving ~80% of value, though the exact split varies by dataset)

## Optional Fields

- `cumulativePercent` — the running cumulative percentage of total value as items are added in descending order (e.g., `[40.0, 69.5, 83.8, ...]`); this is what makes the 80% cutoff auditable rather than asserted
- `recommendation` — the prioritization action that follows from the vital-few split — which categories to fix first, and roughly what share of total impact that addresses

## Prose Invariants (not schema-enforced)

- `items` should be sorted descending by `value` — an unsorted item list undermines the entire point of a Pareto analysis, which is to make "which few things matter most" visually and numerically obvious.
- `vitalFew` entries must match `items[].name` verbatim — this is the same cross-reference-by-string-match convention used for `primaryCauses[]` in fishbone.
- If `cumulativePercent` is present, it must be computed correctly from `items[].value`: `cumulativePercent[i] = 100 * sum(items[0..i].value) / sum(all items.value)`, and its length must match `items`'s length — recompute rather than estimate.
- `vitalFew` should stop at (or just past) the point where `cumulativePercent` crosses ~80%, not include every item — including everything defeats the "vital few vs. trivial many" distinction the mode exists to draw.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"pareto"`
- `items` is sorted descending by `value`
- If `cumulativePercent` is present, its values are monotonically non-decreasing, its last value is (approximately) 100, and its length matches `items`
- `vitalFew` entries match `items[].name` exactly and correspond to a prefix of the sorted list (the highest-value items), not a scattered subset
- `recommendation`, if present, states roughly what share of total value the `vitalFew` covers, per the `think-frameworks` "end with an action" rule

## Worked Example

Input: "Our support ticket categories this quarter: Login/password (420), Billing questions (310), Feature how-to (150), Bug reports (80), Integration failures (45), Data export requests (25), Other misc (20). Which categories should we prioritize fixing?"

Output:

```json
{
  "mode": "pareto",
  "items": [
    {"name": "Login/password issues", "value": 420},
    {"name": "Billing questions", "value": 310},
    {"name": "Feature how-to questions", "value": 150},
    {"name": "Bug reports", "value": 80},
    {"name": "Integration failures", "value": 45},
    {"name": "Data export requests", "value": 25},
    {"name": "Other misc", "value": 20}
  ],
  "cumulativePercent": [40.0, 69.52, 83.81, 91.43, 95.71, 98.1, 100.0],
  "vitalFew": [
    "Login/password issues",
    "Billing questions",
    "Feature how-to questions"
  ],
  "recommendation": "Fix login/password reliability and simplify the billing self-service flow first — together with feature how-to questions, these three categories account for roughly 84% of the 1,050 support tickets, so improvements here will move the backlog far more than spreading effort evenly across all seven categories."
}
```

`vitalFew` stops at the third item (feature how-to questions) because that is where `cumulativePercent` first crosses 80% (83.81%) — including a fourth item would dilute the "vital few" signal even though it wouldn't be wrong per se.
