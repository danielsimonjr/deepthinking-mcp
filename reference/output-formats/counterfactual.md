# Counterfactual Thought — Output Format

Counterfactual reasoning asks "what would have happened if a specific past condition had been different?" It defines an actual scenario, introduces one hypothetical intervention, holds all other conditions fixed, and traces the consequences to a different outcome. The goal is to identify the exact decision or condition that would have changed history, and to extract actionable lessons.

## JSON Schema

```json
{
  "mode": "counterfactual",
  "actual": {
    "id": "<identifier, usually 'actual'>",
    "name": "<name of the real-world event>",
    "description": "<what actually happened>",
    "conditions": [
      {
        "factor": "<condition name>",
        "value": "<actual value>",
        "isIntervention": false
      }
    ],
    "outcomes": [
      {
        "description": "<what resulted>",
        "impact": "positive | negative | neutral",
        "magnitude": <number 0-1>
      }
    ],
    "likelihood": <number 0-1, optional>
  },
  "counterfactuals": [
    {
      "id": "<identifier, e.g. 'cf1'>",
      "name": "<name of the hypothetical scenario>",
      "description": "<the what-if>",
      "conditions": [
        {
          "factor": "<condition name — must mirror actual conditions>",
          "value": "<hypothetical value for intervened condition, or same as actual>",
          "isIntervention": true
        }
      ],
      "outcomes": [
        {
          "description": "<what would have resulted>",
          "impact": "positive | negative | neutral",
          "magnitude": <number 0-1>
        }
      ],
      "likelihood": <number 0-1, probability this counterfactual outcome would have occurred>
    }
  ],
  "comparison": {
    "differences": [
      {
        "aspect": "<what changed between actual and counterfactual>",
        "actual": "<actual value or description>",
        "counterfactual": "<hypothetical value or description>"
      }
    ],
    "insights": ["<observation about what the comparison reveals>"],
    "lessons": ["<actionable conclusion for future decisions>"]
  },
  "interventionPoint": {
    "description": "<the specific action that would have changed the outcome>",
    "timing": "<when the intervention would have needed to occur>",
    "feasibility": <number 0-1>,
    "expectedImpact": <number 0-1>
  },
  "causalChains": [
    {
      "id": "<chain identifier>",
      "events": ["<event 1>", "<event 2>", "<event 3>"],
      "branchingPoint": "<the event at which actual and counterfactual diverge>",
      "divergence": "<description of how the two histories differ from the branching point>"
    }
  ]
}
```

## Required Fields

- `mode` — always `"counterfactual"`
- `actual` — fully populated with `id`, `name`, `description`, `conditions` (at least 1), and `outcomes` (at least 1)
- `counterfactuals` — array with at least one entry, each with `id`, `name`, `description`, `conditions`, and `outcomes`
- `comparison` — object with `differences`, `insights`, and `lessons` arrays
- `interventionPoint` — object with `description`, `timing`, `feasibility`, and `expectedImpact`

## Optional Fields

- `actual.likelihood` — rarely used for the actual scenario; more relevant for counterfactuals
- `causalChains` — add when the causal sequence leading from the intervention to the alternative outcome needs to be made explicit

## The Isolation Principle

Each counterfactual scenario should vary **exactly one condition** — the one marked `"isIntervention": true`. All other conditions remain identical to the actual scenario. This is the key constraint that makes counterfactual reasoning informative: if you change multiple conditions simultaneously, you cannot determine which change drove the different outcome.

If you need to explore multiple interventions, create multiple counterfactual entries — one per intervention — rather than combining them.

## Worked Example

Input: "Would we have avoided the outage if we had rolled back before 2 AM?"

```json
{
  "mode": "counterfactual",
  "actual": {
    "id": "actual",
    "name": "Midnight Deployment Outage",
    "description": "Bad deployment at 00:00; first degradation alerts at 01:30 AM; team investigated rather than rolling back; cascade failure at 02:47 AM lasted 3.5 hours",
    "conditions": [
      { "factor": "Deployment version", "value": "v4.3.0 (bad)" },
      { "factor": "First alert time", "value": "01:30 AM" },
      { "factor": "Rollback decision", "value": "Not taken; team chose to investigate" },
      { "factor": "Cascade failure threshold", "value": "Reached at 02:47 AM" }
    ],
    "outcomes": [
      { "description": "Full service outage lasting 3.5 hours, affecting 100% of users", "impact": "negative", "magnitude": 0.9 }
    ]
  },
  "counterfactuals": [
    {
      "id": "cf1",
      "name": "Rollback at 01:45 AM",
      "description": "Team initiates rollback to v4.2.0 at 01:45 AM, before the cascade failure threshold",
      "conditions": [
        { "factor": "Deployment version", "value": "v4.3.0 (bad)" },
        { "factor": "First alert time", "value": "01:30 AM" },
        { "factor": "Rollback decision", "value": "Rollback to v4.2.0 initiated at 01:45 AM", "isIntervention": true },
        { "factor": "Cascade failure threshold", "value": "Never reached — rollback completes at 02:10 AM" }
      ],
      "outcomes": [
        { "description": "~25 minutes of service degradation during rollback; no full outage", "impact": "negative", "magnitude": 0.15 }
      ],
      "likelihood": 0.9
    }
  ],
  "comparison": {
    "differences": [
      { "aspect": "Rollback timing", "actual": "Never initiated", "counterfactual": "01:45 AM — before cascade failure threshold" },
      { "aspect": "Outage duration", "actual": "3.5 hours full outage", "counterfactual": "~25 minutes degradation, no full outage" },
      { "aspect": "User impact", "actual": "100% of users fully blocked for 3.5 hours", "counterfactual": "Partial degradation; no complete service loss" }
    ],
    "insights": [
      "A 77-minute window existed between first alert (01:30 AM) and cascade failure (02:47 AM) — the rollback opportunity was real",
      "The cost of early rollback (25 min degradation) is an order of magnitude lower than the actual outage (3.5 hours)"
    ],
    "lessons": [
      "Establish a pre-agreed rollback trigger: if alerts fire within 90 minutes of a deployment and root cause is unidentified within 15 minutes, roll back by default",
      "Instrument the cascade failure threshold explicitly so engineers have a measurable tripwire rather than a judgment call under pressure"
    ]
  },
  "interventionPoint": {
    "description": "Initiate rollback to v4.2.0 immediately after first alert confirmation without waiting for root cause identification",
    "timing": "01:30–02:00 AM window (77 minutes before cascade failure threshold)",
    "feasibility": 0.9,
    "expectedImpact": 0.85
  }
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"counterfactual"`
- `actual` has at least one `conditions` entry and at least one `outcomes` entry
- `counterfactuals` has at least one entry
- Each counterfactual has exactly **one** condition with `"isIntervention": true` — multiple simultaneous interventions break the isolation principle
- All other conditions in the counterfactual mirror the actual scenario values
- `comparison.lessons` is non-empty — counterfactual analysis without lessons is incomplete
- `interventionPoint.feasibility` and `expectedImpact` are in [0, 1]
- Each `likelihood` value is in [0, 1]
- `magnitude` in each outcome is in [0, 1]
