# Historical Thought — Output Format

Systematic historical analysis with source criticism, precedent matching, pattern detection, and causal chain reasoning.

## JSON Schema

```json
{
  "mode": "historical",
  "thoughtType": "<event_analysis|source_evaluation|pattern_identification|causal_chain_analysis|periodization|pattern_analysis>",
  "events": [
    {
      "id": "<string>",
      "name": "<string>",
      "date": "<YYYY-MM-DD or date range object>",
      "significance": "<minor|moderate|major|transformative>",
      "description": "<optional>",
      "actors": ["<actor_id>"],
      "causes": ["<event_id or factor>"],
      "effects": ["<event_id or factor>"],
      "sources": ["<source_id>"],
      "tags": ["<tag>"],
      "context": "<optional background>"
    }
  ],
  "sources": [
    {
      "id": "<string>",
      "title": "<string>",
      "type": "<primary|secondary|tertiary>",
      "subtype": "<document|artifact|oral|visual|archaeological|statistical, optional>",
      "author": "<optional>",
      "date": "<optional>",
      "reliability": <number 0-1>,
      "bias": {
        "type": "<political|religious|cultural|economic|nationalistic|ideological|personal>",
        "direction": "<optional description>",
        "severity": <number 0-1>,
        "evidence": ["<supporting evidence>"]
      },
      "corroboratedBy": ["<source_id>"],
      "contradictedBy": ["<source_id>"],
      "provenance": "<optional>",
      "limitations": ["<limitation>"]
    }
  ],
  "patterns": [
    {
      "id": "<string>",
      "name": "<string>",
      "type": "<cyclical|structural|contingent>",
      "episodes": ["<event_id>"],
      "matchingFeatures": ["<feature>"],
      "loadBearingDifferences": ["<difference>"],
      "verdictApplies": <boolean>,
      "verdictRationale": "<string>"
    }
  ],
  "causalChains": [
    {
      "id": "<string>",
      "name": "<string>",
      "links": [
        {
          "cause": "<event_id or factor>",
          "effect": "<event_id or factor>",
          "mechanism": "<how A caused B>",
          "confidence": <number 0-1>,
          "timelag": "<optional duration string>",
          "evidence": ["<source_id>"]
        }
      ],
      "confidence": <number 0-1>,
      "alternativeExplanations": ["<alternative>"],
      "historiographicalDebate": "<optional>"
    }
  ],
  "aggregateReliability": <number 0-1>,
  "temporalSpan": {
    "start": "<date string>",
    "end": "<date string>",
    "precision": "<exact|approximate|century|decade|year|month|day>"
  },
  "historiographicalSchool": "<optional>",
  "methodology": "<optional>"
}
```

## Required Fields

- `mode` — always `"historical"`

## Source Reliability Guide

| Situation | Effect on Reliability |
|-----------|----------------------|
| Primary source, contemporary, no bias | 0.85–0.95 |
| Primary source, high bias, uncorroborated | 0.30–0.50 |
| Secondary source, well-corroborated | 0.70–0.85 |
| Single source, no corroboration | Cap at 0.60 |
| Contradicted by corroborated source | 0.20–0.40 |

`aggregateReliability` reflects the minimum reliability of any load-bearing source in the chain — not a naive average. If the key fact rests on a 0.4-reliability source, the chain's aggregate cannot exceed 0.4.

## Precedent Analysis

A valid precedent match requires:
1. **Matching features** — structural similarities between past and present situations
2. **Load-bearing differences** — differences that would change the likely outcome
3. **Verdict** — `verdictApplies: true` only when no load-bearing differences exist

Surface resemblance without structural equivalence is not a valid precedent. Explicitly list load-bearing differences even when recommending the precedent applies.

## Worked Example

Input: "Is our planned production database migration similar to the failed 2024 incident?"

Output:

```json
{
  "mode": "historical",
  "thoughtType": "pattern_analysis",
  "events": [
    {
      "id": "incident_2024",
      "name": "Production DB migration failure 2024",
      "date": "2024-03-15",
      "significance": "major",
      "description": "Live schema migration on 500 GB users table caused 47 min downtime due to table lock contention",
      "causes": ["no_maintenance_window", "missing_lock_timeout"],
      "effects": ["table_lock_contention", "service_outage_47min"],
      "sources": ["postmortem_2024", "runbook_v3"],
      "tags": ["database", "migration", "outage"]
    },
    {
      "id": "migration_2026",
      "name": "Planned 2026 DB migration",
      "date": "2026-04-18",
      "significance": "moderate",
      "description": "Migration of 12 GB orders table with replica promotion during maintenance window",
      "causes": [],
      "effects": [],
      "sources": ["migration_plan_v2"],
      "tags": ["database", "migration", "planned"]
    }
  ],
  "sources": [
    {
      "id": "postmortem_2024",
      "title": "Postmortem: DB Migration Outage 2024-03-15",
      "type": "primary",
      "reliability": 0.92,
      "corroboratedBy": ["runbook_v3"]
    },
    {
      "id": "runbook_v3",
      "title": "DB Migration Runbook v3",
      "type": "secondary",
      "reliability": 0.85,
      "corroboratedBy": ["postmortem_2024"]
    },
    {
      "id": "migration_plan_v2",
      "title": "2026 Migration Plan v2",
      "type": "primary",
      "reliability": 0.80,
      "corroboratedBy": []
    }
  ],
  "patterns": [
    {
      "id": "p1",
      "name": "Live schema migration without lock timeout causes lock contention",
      "type": "structural",
      "episodes": ["incident_2024"],
      "matchingFeatures": ["schema ALTER on production table", "live write traffic present"],
      "loadBearingDifferences": [
        "2026 uses maintenance window (no live writes during ALTER)",
        "table is 12 GB vs 500 GB — 40x smaller",
        "read replica promotion eliminates write contention"
      ],
      "verdictApplies": false,
      "verdictRationale": "Load-bearing differences eliminate the known 2024 failure mechanism. Precedent is useful as a checklist, not a prediction."
    }
  ],
  "causalChains": [
    {
      "id": "cc1",
      "name": "2024 failure causal chain",
      "links": [
        {
          "cause": "no_maintenance_window",
          "effect": "table_lock_contention",
          "mechanism": "ALTER TABLE acquires exclusive lock; concurrent writes queue indefinitely without lock_timeout",
          "confidence": 0.93,
          "timelag": "immediate",
          "evidence": ["postmortem_2024"]
        }
      ],
      "confidence": 0.93,
      "alternativeExplanations": ["Disk I/O saturation may have prolonged lock hold time"]
    }
  ],
  "aggregateReliability": 0.85
}
```

The precedent does not apply for prediction because the load-bearing failure factors are absent in 2026. Residual risk: `migration_plan_v2` is uncorroborated — verify staging test results before production.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"historical"`
- Every `source_id` referenced in `event.sources` has a matching entry in `sources`
- `reliability` values are in [0, 1]; degrade for high bias + no corroboration
- `aggregateReliability` is bounded by the minimum reliability of load-bearing sources
- `patterns` only asserted when at least one historical episode is cited in `episodes`
- `verdictApplies: true` only when no load-bearing differences exist
- `causalChain.confidence` reflects the weakest link, not the average
- `significance` is one of: `minor`, `moderate`, `major`, `transformative`
