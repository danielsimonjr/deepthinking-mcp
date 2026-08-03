# Gap Analysis Thought — Output Format

Mapping current state vs. desired state across dimensions, with a per-dimension action and an overall action plan.

## JSON Schema

```json
{
  "mode": "gapanalysis",
  "currentState": "<overall current state>",
  "desiredState": "<overall desired state>",
  "gaps": [
    {
      "dimension": "<dimension name>",
      "current": "<current state of this dimension>",
      "desired": "<desired state of this dimension>",
      "gap": "<the delta between current and desired>",
      "action": "<action that closes this specific gap>"
    }
  ],
  "actionPlan": ["<ordered step 1>", "<ordered step 2>", "..."]
}
```

## Required Fields

- `mode` — always `"gapanalysis"`
- `currentState` — the overall current state (a summary framing all per-dimension gaps)
- `desiredState` — the overall desired state (a summary framing all per-dimension gaps)
- `gaps` — the per-dimension breakdown; **at least 1** (`minItems: 1`); each entry requires `dimension`, `current`, `desired`, `gap`, `action`

`actionPlan` (optional) is a flat, ordered array of strings representing the overall execution sequence across all dimensions — distinct from the per-dimension `gaps[].action`.

## Prose Invariants (not schema-enforced)

- Each `gaps[].current`/`gaps[].desired` should be a specific instantiation of the overall `currentState`/`desiredState` for that one dimension, not a restatement of the overall summary.
- `gap` must name the actual delta, not just juxtapose `current` and `desired` — e.g., "zero written runbooks vs. ten needed" is a gap; "current is X, desired is Y" with no synthesis is not.
- `action` must be specific and closable — "improve documentation" is too generic; name what will actually be produced and roughly when.
- If `actionPlan` is present, it should sequence (and may interleave) the per-dimension `action` items into a realistic execution order — it is not required to be a verbatim copy of `gaps[].action` in list order, since real execution often reprioritizes across dimensions.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"gapanalysis"`
- `currentState` and `desiredState` are both populated with genuine summaries, not placeholders
- `gaps` has at least 1 entry, each with all five required fields populated
- Every `gap` names an actual delta (not just a juxtaposition) and every `action` is specific and closable
- If `actionPlan` is present, it reflects a coherent, ordered execution sequence across dimensions

## Worked Example

Input: "Compare our current ad hoc on-call incident response process to a mature one, dimension by dimension, and give an action plan."

Output:

```json
{
  "mode": "gapanalysis",
  "currentState": "On-call incident response is ad hoc: alerts page whoever is awake via Slack, no written runbooks, and postmortems happen inconsistently with no tracked follow-up.",
  "desiredState": "A mature process: formal on-call rotation with escalation, every recurring incident type has a runbook, every SEV1/SEV2 gets a blameless postmortem within 5 days with tracked action items.",
  "gaps": [
    {"dimension": "Alerting and escalation", "current": "Alerts post to a shared Slack channel with no defined owner", "desired": "Formal on-call rotation with tiered escalation policies", "gap": "No ownership model or escalation tooling exists today", "action": "Adopt a paging tool and define a 2-tier escalation rotation within one quarter"},
    {"dimension": "Runbooks", "current": "Zero written runbooks", "desired": "Top 10 recurring incident types have tested runbooks", "gap": "10 runbooks need to be authored and validated", "action": "Mine the last 6 months of incidents and assign one runbook per engineer per sprint"},
    {"dimension": "Postmortem discipline", "current": "Only ~25% of incidents get a postmortem", "desired": "100% of SEV1/SEV2 incidents get a postmortem with tracked actions", "gap": "No enforced postmortem trigger and no action-item tracking", "action": "Make postmortems mandatory for SEV1/SEV2 closure and track action items in the issue tracker"}
  ],
  "actionPlan": [
    "Quarter 1: stand up the paging tool and on-call rotation",
    "Quarter 1-2: author and validate the top 10 runbooks",
    "Quarter 1: make postmortems mandatory and start tracking action items",
    "Quarter 2: audit postmortem completion and action-item closure rates"
  ]
}
```

The `actionPlan` sequences the three per-dimension actions into a realistic quarter-by-quarter execution order rather than just repeating `gaps[].action` verbatim in list order.
