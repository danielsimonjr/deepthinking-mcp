# Temporal Thought — Output Format

Reasoning about event sequences, time intervals, and causation across time.

## JSON Schema

```json
{
  "mode": "temporal",
  "thoughtType": "<event_definition|interval_analysis|temporal_constraint|sequence_construction|causality_timeline>",
  "timeline": {
    "id": "<string>",
    "name": "<string>",
    "timeUnit": "<milliseconds|seconds|minutes|hours|days|months|years>",
    "startTime": <number, optional>,
    "endTime": <number|null, optional>,
    "events": ["<event_id>", ...]
  },
  "events": [
    {
      "id": "<string>",
      "name": "<short label>",
      "description": "<what happened>",
      "timestamp": <number>,
      "duration": <number|null, optional>,
      "type": "<instant|interval>",
      "properties": { "<key>": "<value>" }
    }
  ],
  "intervals": [
    {
      "id": "<string>",
      "name": "<string>",
      "start": <number>,
      "end": <number>,
      "overlaps": ["<interval_id>"],
      "contains": ["<interval_id>"]
    }
  ],
  "constraints": [
    {
      "id": "<string>",
      "type": "<before|after|during|overlaps|meets|starts|finishes|equals>",
      "subject": "<event_or_interval_id>",
      "object": "<event_or_interval_id>",
      "confidence": <number 0-1>,
      "formula": "<optional LaTeX>"
    }
  ],
  "relations": [
    {
      "id": "<string>",
      "from": "<event_id>",
      "to": "<event_id>",
      "relationType": "<causes|enables|prevents|precedes|follows>",
      "strength": <number 0-1>,
      "delay": <number|null, optional>,
      "formula": "<optional LaTeX>"
    }
  ]
}
```

## Required Fields

- `mode` — always `"temporal"`
- `thoughtType` — one of the five enumerated thought types

## Allen's Interval Relations (constraint.type)

Allen's interval algebra provides 13 mutually exclusive relations between two intervals. The constraint `type` field uses these names:

| Relation | Meaning |
|----------|---------|
| `before` | A ends before B starts (gap between them) |
| `meets` | A ends exactly when B starts (no gap, no overlap) |
| `overlaps` | A starts before B, ends during B |
| `starts` | A and B start at the same time; A ends first |
| `during` | A is fully contained within B |
| `finishes` | A ends when B ends; B started first |
| `equals` | A and B start and end at the same time |
| `after` / `met-by` / `overlapped-by` / etc. | Inverse relations |

**Choosing the right relation matters:** `overlaps` and `meets` are distinct. A precedes B with no gap is `meets`, not `before`.

## Worked Example

Input: "The 502 error first appeared 4 minutes before the CPU alert. The upstream deployment completed at T+0. What does the ordering tell us?"

Output:

```json
{
  "mode": "temporal",
  "thoughtType": "causality_timeline",
  "timeline": {
    "id": "incident_timeline",
    "name": "502 Error Incident",
    "timeUnit": "minutes",
    "startTime": 0,
    "endTime": 10,
    "events": ["dep_complete", "errors_502", "cpu_alert"]
  },
  "events": [
    {
      "id": "dep_complete",
      "name": "Upstream deployment completes",
      "description": "Upstream dependency v2.3.1 deployment finishes at T+0",
      "timestamp": 0,
      "duration": null,
      "type": "instant",
      "properties": { "service": "upstream-api", "version": "v2.3.1" }
    },
    {
      "id": "errors_502",
      "name": "502 errors begin",
      "description": "Service starts returning 502 Bad Gateway responses",
      "timestamp": 4,
      "duration": null,
      "type": "instant",
      "properties": { "statusCode": 502 }
    },
    {
      "id": "cpu_alert",
      "name": "CPU alert fires",
      "description": "Monitoring alert triggers on CPU threshold breach",
      "timestamp": 8,
      "duration": null,
      "type": "instant",
      "properties": { "threshold": "80%" }
    }
  ],
  "relations": [
    {
      "id": "r1",
      "from": "dep_complete",
      "to": "errors_502",
      "relationType": "causes",
      "strength": 0.82,
      "delay": 4
    },
    {
      "id": "r2",
      "from": "errors_502",
      "to": "cpu_alert",
      "relationType": "enables",
      "strength": 0.6,
      "delay": 4
    }
  ],
  "constraints": [
    {
      "id": "tc1",
      "type": "before",
      "subject": "dep_complete",
      "object": "errors_502",
      "confidence": 1.0
    },
    {
      "id": "tc2",
      "type": "before",
      "subject": "errors_502",
      "object": "cpu_alert",
      "confidence": 1.0
    }
  ]
}
```

The CPU alert fires 4 minutes after the 502s begin, ruling it out as the cause. The deployment at T+0 is the only event preceding the error onset.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"temporal"`
- `thoughtType` is one of the five enumerated values
- Every event ID in `timeline.events` has a matching entry in `events`
- Constraint `type` values are valid Allen relations
- Relation `relationType` is one of: `causes`, `enables`, `prevents`, `precedes`, `follows`
- Causal `relationType` is not asserted on sequence alone — a delay or mechanism is stated
- `strength` and `confidence` values are in [0, 1]
- Effects that precede their purported causes are flagged as temporal paradoxes, not silently resolved
