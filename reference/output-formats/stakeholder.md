# Stakeholder Analysis Thought — Output Format

Mapping stakeholders by power and interest to determine engagement strategy for each.

## JSON Schema

```json
{
  "mode": "stakeholder",
  "stakeholders": [
    {
      "name": "<stakeholder>",
      "power": "<low|high (or a finer scale)>",
      "interest": "<low|high (or a finer scale)>",
      "quadrant": "<Manage Closely|Keep Satisfied|Keep Informed|Monitor>",
      "strategy": "<how to engage this stakeholder>"
    }
  ],
  "recommendation": "<optional overall engagement priority>"
}
```

## Required Fields

- `mode` — always `"stakeholder"`
- `stakeholders` — the people/groups affected by or influencing the decision; **at least 1** (`minItems: 1`); each entry requires `name`, `power`, `interest`, `quadrant`, `strategy`

## Prose Invariants (not schema-enforced)

- `quadrant` must be consistent with `power`/`interest`: high power + high interest → "Manage Closely"; high power + low interest → "Keep Satisfied"; low power + high interest → "Keep Informed"; low power + low interest → "Monitor". A quadrant that contradicts its own power/interest values is an internal inconsistency even though the schema treats all three as independent strings.
- `strategy` must be specific to the stakeholder's quadrant — a "Manage Closely" stakeholder needs active, frequent engagement; a "Monitor" stakeholder needs passive, low-effort tracking. Do not give every stakeholder the same generic strategy.
- Aim for at least one stakeholder per quadrant where plausible — a stakeholder map that is entirely "Manage Closely" or entirely "Monitor" usually signals incomplete stakeholder identification, not a genuinely lopsided landscape.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"stakeholder"`
- `stakeholders` has at least 1 entry, each with all five required fields populated
- Every `quadrant` value is consistent with its `power`/`interest` pair
- Every `strategy` is specific to that stakeholder's quadrant and role, not a copy-pasted generic line
- If `recommendation` is present, it synthesizes across quadrants (who to prioritize, who to deprioritize) rather than restating the stakeholder list

## Worked Example

Input: "Map the stakeholders for our CRM rollout by power and interest, and give an engagement strategy for each."

Output:

```json
{
  "mode": "stakeholder",
  "stakeholders": [
    {"name": "VP of Sales (executive sponsor)", "power": "high", "interest": "high", "quadrant": "Manage Closely", "strategy": "Weekly status syncs; involve directly in scope decisions."},
    {"name": "Finance (budget owner)", "power": "high", "interest": "low", "quadrant": "Keep Satisfied", "strategy": "Monthly cost/ROI summary; avoid over-communicating day-to-day details."},
    {"name": "Sales reps (end users)", "power": "low", "interest": "high", "quadrant": "Keep Informed", "strategy": "Biweekly demos and a feedback channel."},
    {"name": "Legal/compliance", "power": "low", "interest": "low", "quadrant": "Monitor", "strategy": "Light-touch monitoring via the existing data-handling checklist."}
  ],
  "recommendation": "Prioritize the VP of Sales for weekly alignment; keep Finance satisfied with monthly summaries; keep reps informed and engaged since they drive adoption; monitor Legal passively unless the data model changes."
}
```

The recommendation synthesizes across all four quadrants rather than repeating the per-stakeholder strategies verbatim — this is what distinguishes a useful overall recommendation from a redundant summary.
