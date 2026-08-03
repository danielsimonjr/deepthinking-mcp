# Risk Assessment Thought — Output Format

Rating risks by probability × impact and prioritizing mitigation by score.

## JSON Schema

```json
{
  "mode": "riskassessment",
  "risks": [
    {
      "risk": "<risk description>",
      "probability": 0.0,
      "impact": 0,
      "score": 0.0,
      "mitigation": "<mitigation action>"
    }
  ],
  "topRisks": ["<risk text copied verbatim from risks[].risk>"],
  "recommendation": "<optional prioritization call>"
}
```

## Required Fields

- `mode` — always `"riskassessment"`
- `risks` — the identified risks; **at least 1** (`minItems: 1`); each entry requires `risk`, `probability`, `impact`, `score`, `mitigation`. `probability`, `impact`, and `score` each accept a number or a string (e.g., a qualitative scale like `"high"`, or a numeric string), to accommodate both quantitative and qualitative risk registers.

`topRisks` (optional) is a flat array of risk descriptions copied verbatim from `risks[].risk`, naming the highest-priority risks. `recommendation` (optional) states the prioritized mitigation order.

## Prose Invariants (not schema-enforced)

- **`score` = `probability` × `impact`.** When both are numeric, `score` must equal their arithmetic product — this is the mode's defining invariant and the single most common error if not recomputed before emitting. When either is qualitative (e.g., "high"/"medium"/"low"), `score` should still reflect a consistent combination (e.g., mapping to a numeric scale internally) rather than an arbitrary number.
- `topRisks[]` entries must match `risks[].risk` verbatim and should be the highest-`score` entries — not an arbitrary subset.
- `mitigation` must be a specific, actionable step — "monitor the situation" is not a mitigation for a scored risk; name what will actually reduce probability or impact.
- `recommendation` (optional but encouraged) should state which risks to address first (highest score) and may note which lower-scored risks can be mitigated in parallel, per this category's "end with an action" rule.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"riskassessment"`
- `risks` has at least 1 entry, each with all five required fields populated
- Recompute every `score` as `probability × impact` (or the qualitative equivalent) before emitting — a `score` that doesn't match its own `probability`/`impact` values is the single most common error in this mode
- If `topRisks` is present, every entry matches a `risks[].risk` string verbatim and corresponds to a high-`score` entry
- Every `mitigation` names a specific action, not a vague monitoring statement

## Worked Example

Input: "Assess the risks of migrating our payment processing to a new gateway vendor. Rate each by probability × impact and give mitigations."

Output:

```json
{
  "mode": "riskassessment",
  "risks": [
    {"risk": "New payment gateway API has undocumented rate limits", "probability": 0.4, "impact": 4, "score": 1.6, "mitigation": "Load test against the gateway's sandbox at 3x expected peak volume; get documented rate limits in writing."},
    {"risk": "Engineering team is unfamiliar with the new gateway's SDK", "probability": 0.6, "impact": 3, "score": 1.8, "mitigation": "Run a two-week SDK familiarization spike; pair certified engineers with the rest of the team."},
    {"risk": "Historical transaction records are corrupted during migration", "probability": 0.2, "impact": 5, "score": 1.0, "mitigation": "Take a verified full backup; dry-run the migration against a staging copy and diff checksums first."},
    {"risk": "Vendor's SLA does not cover our seasonal peak traffic windows", "probability": 0.3, "impact": 4, "score": 1.2, "mitigation": "Escalate to the vendor account team; keep the old gateway as manual failover for the first peak season."}
  ],
  "topRisks": ["Engineering team is unfamiliar with the new gateway's SDK", "New payment gateway API has undocumented rate limits"],
  "recommendation": "Address the top two risks by score first (0.6×3=1.8 SDK gap, 0.4×4=1.6 rate limits) before cutover; the lower-scored corruption (0.2×5=1.0) and SLA (0.3×4=1.2) risks can be mitigated in parallel."
}
```

Every `score` is recomputed from `probability × impact` and the recommendation restates the arithmetic for the top two risks — this is what makes the priority ranking auditable rather than asserted.
