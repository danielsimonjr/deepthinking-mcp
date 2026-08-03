# Force Field Analysis Thought — Output Format

Weighing driving forces for a proposed change against restraining forces resisting it, each rated by strength.

## JSON Schema

```json
{
  "mode": "forcefield",
  "change": "<the proposed change being assessed>",
  "drivingForces": [
    {"force": "<factor pushing toward the change>", "strength": 1-5}
  ],
  "restrainingForces": [
    {"force": "<factor resisting the change>", "strength": 1-5}
  ],
  "netAssessment": "<optional: which side currently dominates, and why>",
  "recommendation": "<optional: action to shift the balance>"
}
```

## Required Fields

- `mode` — always `"forcefield"`
- `change` — names the specific change being assessed (a process shift, a policy, a technical migration)
- `drivingForces` — factors pushing toward the change happening; each entry is `{force, strength}` where `strength` is an integer 1-5 (1 = weak, 5 = overwhelming)
- `restrainingForces` — factors resisting the change; same `{force, strength}` shape

## Optional Fields

- `netAssessment` — states which side currently dominates (compare the sum or profile of driving vs. restraining strengths) and why — this is the analytical payoff of scoring each force individually rather than just listing them
- `recommendation` — the action to take to shift the balance, typically by weakening a specific restraining force or strengthening a specific driving force, not a generic "push harder"

## Prose Invariants (not schema-enforced)

- Every `strength` rating must be justified by the `force` text itself, not assigned arbitrarily — a 5-strength force should read as obviously more consequential than a 1-strength force.
- `recommendation`, when present, should target the *specific* restraining force(s) most worth addressing (typically the highest-strength ones), per the `think-frameworks` "end with an action" rule — not a vague call to "manage change better."
- Do not double-count: a single underlying issue should not appear as both a driving force (in disguised form) and a restraining force.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"forcefield"`
- `drivingForces` and `restrainingForces` are both present, each entry has integer `strength` in `[1, 5]`
- Forces are specific and evidence-based, not generic ("people resist change" is weak; "senior engineers are skeptical after a prior rushed-release outage" is specific)
- If `netAssessment` is present, it references the actual strength totals or profile, not just a qualitative impression
- If `recommendation` is present, it names which restraining force(s) to address or which driving force(s) to reinforce

## Worked Example

Input: "Assess the forces for and against moving the engineering org from quarterly releases to weekly continuous deployment."

Output:

```json
{
  "mode": "forcefield",
  "change": "Moving the engineering organization from quarterly releases to weekly continuous deployment",
  "drivingForces": [
    {
      "force": "Competitors are shipping customer-requested fixes in days while we take up to a quarter, costing us renewal conversations",
      "strength": 5
    },
    {
      "force": "The platform team has already built a CI/CD pipeline capable of automated canary deploys, removing most of the tooling gap",
      "strength": 4
    },
    {
      "force": "Engineering leadership has publicly committed to the change in the last two all-hands",
      "strength": 3
    }
  ],
  "restrainingForces": [
    {
      "force": "QA still relies on a 2-week manual regression pass for the billing module, which is incompatible with weekly releases",
      "strength": 5
    },
    {
      "force": "Several senior engineers are skeptical after a previous rushed-release incident caused a payment outage",
      "strength": 4
    },
    {
      "force": "Enterprise contracts with three large customers specify a fixed quarterly change-notification window",
      "strength": 3
    }
  ],
  "netAssessment": "Driving forces total 12 against restraining forces total 12 — the change is currently blocked at parity, not because the goal is wrong but because the billing QA bottleneck and contractual notice windows are unresolved dependencies, not attitude problems.",
  "recommendation": "Before increasing deploy frequency org-wide, automate the billing regression suite and renegotiate the quarterly notification clause with the three affected enterprise contracts — those two restraining forces are addressable and, once removed, the driving forces dominate."
}
```

The recommendation targets the two highest-strength restraining forces specifically (the QA bottleneck and the contract clause) rather than proposing a generic "communicate the benefits more" response — that specificity is what distinguishes a useful force-field recommendation from a platitude.
