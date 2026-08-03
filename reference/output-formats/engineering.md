# Engineering Thought — Output Format

Structured design analysis using trade-off matrices, failure mode analysis, and design decision records.

## JSON Schema

```json
{
  "mode": "engineering",
  "analysisType": "<requirements | trade-study | fmea | decision>",
  "designChallenge": "<problem or design decision being addressed>",
  "tradeStudy": {
    "title": "<study name>",
    "objective": "<what decision this study resolves>",
    "alternatives": [
      {
        "id": "<unique id>",
        "name": "<option name>",
        "description": "<brief characterization>",
        "pros": ["<advantage 1>"],
        "cons": ["<disadvantage 1>"],
        "riskLevel": "<low | medium | high>"
      }
    ],
    "criteria": [
      {
        "id": "<unique id>",
        "name": "<criterion name>",
        "weight": <0.0 to 1.0>,
        "description": "<what this criterion measures>",
        "higherIsBetter": <true | false>
      }
    ],
    "scores": [
      {
        "alternativeId": "<ref to alternative.id>",
        "criteriaId": "<ref to criterion.id>",
        "score": <1 to 10>,
        "weightedScore": <score * weight>,
        "rationale": "<why this score>"
      }
    ],
    "recommendation": "<winning alternative id>",
    "justification": "<why this alternative wins>",
    "sensitivityNotes": "<optional: what changes would flip the recommendation>"
  },
  "fmea": {
    "title": "<FMEA name>",
    "system": "<system being analyzed>",
    "failureModes": [
      {
        "id": "<unique id>",
        "component": "<component name>",
        "failureMode": "<how it fails>",
        "cause": "<root cause>",
        "effect": "<local effect>",
        "severity": <1-10>,
        "occurrence": <1-10>,
        "detection": <1-10>,
        "rpn": <severity * occurrence * detection>,
        "mitigation": "<recommended action if RPN is high>"
      }
    ],
    "rpnThreshold": <integer>,
    "summary": {
      "totalModes": <integer>,
      "criticalModes": <integer above threshold>,
      "averageRpn": <number>,
      "maxRpn": <integer>
    }
  },
  "assessment": {
    "confidence": <0.0 to 1.0>,
    "keyRisks": ["<risk 1>"],
    "nextSteps": ["<action 1>"],
    "openIssues": ["<unresolved assumption>"]
  }
}
```

## Required Fields

- `mode` — always `"engineering"`
- `analysisType` — one of: `"requirements"`, `"trade-study"`, `"fmea"`, `"decision"`
- `designChallenge` — the specific design question being answered

## Trade Study Rules

- At least **two** alternatives — a single-alternative analysis is a description, not a trade study
- Criteria weights should sum to 1.0 (±0.01 rounding tolerance)
- Every score must have an explicit `rationale` — bare numbers without explanation are not engineering analysis
- `recommendation` must reference an `id` that exists in `alternatives`

## FMEA Rules

- RPN = Severity × Occurrence × Detection (each rated 1–10)
- Failure modes with RPN ≥ `rpnThreshold` require a non-empty `mitigation`
- `summary.criticalModes` = count of failure modes where RPN ≥ rpnThreshold

## Worked Example

Input: "Should we use a database or a message queue for order processing?"

Output:

```json
{
  "mode": "engineering",
  "analysisType": "trade-study",
  "designChallenge": "Select order processing mechanism: direct DB write vs. message queue",
  "tradeStudy": {
    "title": "Order Processing Architecture Selection",
    "objective": "Choose a durable, scalable mechanism for capturing customer orders",
    "alternatives": [
      {
        "id": "db",
        "name": "Direct DB Write",
        "description": "Synchronous INSERT within the HTTP request",
        "pros": ["Simple — no new infrastructure", "ACID transactions"],
        "cons": ["DB bottleneck under spike load", "No backpressure"],
        "riskLevel": "low"
      },
      {
        "id": "mq",
        "name": "Message Queue (SQS)",
        "description": "HTTP handler publishes event; async consumer writes to DB",
        "pros": ["Decouples ingestion from processing", "Natural backpressure"],
        "cons": ["Two components to operate", "Eventually consistent"],
        "riskLevel": "medium"
      }
    ],
    "criteria": [
      { "id": "simplicity", "name": "Operational Simplicity", "weight": 0.35, "description": "Fewer moving parts", "higherIsBetter": true },
      { "id": "reliability", "name": "Reliability", "weight": 0.35, "description": "At-least-once delivery guarantee", "higherIsBetter": true },
      { "id": "cost", "name": "Cost", "weight": 0.30, "description": "Infrastructure plus ops burden", "higherIsBetter": true }
    ],
    "scores": [
      { "alternativeId": "db", "criteriaId": "simplicity", "score": 9, "weightedScore": 3.15, "rationale": "Single service every engineer understands" },
      { "alternativeId": "db", "criteriaId": "reliability", "score": 6, "weightedScore": 2.10, "rationale": "No backpressure — spike load causes timeouts" },
      { "alternativeId": "db", "criteriaId": "cost", "score": 9, "weightedScore": 2.70, "rationale": "No additional infrastructure" },
      { "alternativeId": "mq", "criteriaId": "simplicity", "score": 6, "weightedScore": 2.10, "rationale": "Queue plus consumer adds runbook complexity" },
      { "alternativeId": "mq", "criteriaId": "reliability", "score": 9, "weightedScore": 3.15, "rationale": "SQS at-least-once with idempotency key" },
      { "alternativeId": "mq", "criteriaId": "cost", "score": 6, "weightedScore": 1.80, "rationale": "Consumer ECS task adds ~$40/month" }
    ],
    "recommendation": "mq",
    "justification": "Message queue (7.05) slightly edges direct DB (7.95) on paper, but the failure mode analysis is decisive: the DB path has no backpressure for spike events."
  },
  "assessment": {
    "confidence": 0.82,
    "keyRisks": ["Consumer idempotency must be correct to prevent duplicate orders"],
    "nextSteps": ["Prototype SQS consumer with idempotency key on order_id"],
    "openIssues": ["Peak TPS estimate unconfirmed — based on prior Black Friday data"]
  }
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"engineering"`
- `analysisType` is one of the four valid values
- Trade study has at least two alternatives
- Criteria weights sum to 1.0 (±0.01)
- Every score has a non-empty `rationale`
- `recommendation` id exists in `alternatives`
- `assessment.confidence` is in [0, 1]
- Any FMEA failure mode with RPN ≥ rpnThreshold has a non-empty `mitigation`
