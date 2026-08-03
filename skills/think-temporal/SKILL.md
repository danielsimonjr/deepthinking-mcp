---
name: think-temporal
description: Time-aware reasoning methods — Temporal (event sequences, time intervals, causation across time) and Historical (source evaluation, pattern detection across historical episodes, precedent analysis). Use when the user invokes `/think temporal` or `/think historical`, or asks about event ordering, time-based causation, historical precedent, or source reliability.
argument-hint: "[temporal|historical] <problem>"
---

# think-temporal — Time-Aware Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `temporal` or `historical`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains two time-aware reasoning methods: **Temporal** (event ordering, interval relationships, causation across time) and **Historical** (source criticism, precedent analysis, pattern detection across historical episodes).

---

## Temporal Reasoning

Temporal reasoning makes explicit the ordering, duration, and causal relationships of events in time. The core discipline is distinguishing between **sequence** (A happened before B) and **causation** (A caused B), and using interval algebra to characterize how event windows relate — because whether two events overlap, meet, or are separated by a gap changes what conclusions are available.

### When to Use

- You need to reconstruct what happened in what order — incident timelines, deployment sequences, process traces
- You are asked whether one event caused another, or merely preceded it
- You need to identify temporal gaps, lags, or suspicious coincidences in a sequence
- You are reasoning about scheduling, concurrency, or race conditions where interval overlap matters
- You want to build a structured timeline that supports downstream causal analysis

**Do not use Temporal** when:
- The sequence is established and you want to evaluate sources or draw historical precedents → use Historical
- You want probabilistic forward prediction without explicit event structure → use Bayesian
- The problem is purely logical with no time dimension → use Deductive

### How to Reason Temporally

1. **Define the timeline.** Name the time unit (seconds, minutes, days) and anchor the start. Without a common clock, event ordering is ambiguous.
2. **List all known events.** For each: a unique ID, a timestamp (or timestamp range), whether it is instantaneous or has duration, and what is known about it.
3. **Map interval relationships.** For any two overlapping events, state their Allen relation: `before`, `meets`, `overlaps`, `starts`, `during`, `finishes`, `equals`, and their inverses. Allen relations are mutually exclusive — picking one commits you to a specific structural claim.
4. **State temporal constraints explicitly.** Which events *must* precede which? Are any constraints violated by the observed data?
5. **Separate sequence from causation.** A precedes B is necessary but not sufficient for A causes B. For each causal claim, state:
   - The delay between A and B (is it consistent with the proposed mechanism?)
   - Whether B could have occurred without A (counterfactual test)
   - Whether there is a confound C that caused both A and B
6. **Identify temporal paradoxes or anomalies.** A symptom that appears *before* its purported cause, an effect with zero lag, a constraint that is violated — these are diagnostic signals, not noise.

### Output Format

See `reference/output-formats/temporal.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "temporal",
  "thoughtType": "causality_timeline",
  "timeline": {
    "id": "<timeline_id>",
    "name": "<descriptive name>",
    "timeUnit": "<seconds|minutes|hours|days>",
    "startTime": 0,
    "endTime": null,
    "events": ["<event_id_1>", "<event_id_2>"]
  },
  "events": [
    {
      "id": "<event_id>",
      "name": "<short label>",
      "description": "<what happened>",
      "timestamp": 0,
      "duration": null,
      "type": "instant",
      "properties": {}
    }
  ],
  "relations": [
    {
      "id": "<relation_id>",
      "from": "<event_id>",
      "to": "<event_id>",
      "relationType": "causes",
      "strength": 0.0,
      "delay": null
    }
  ],
  "constraints": []
}
```

### Verification Before Emitting

- `mode` is exactly `"temporal"`
- `thoughtType` is one of: `event_definition`, `interval_analysis`, `temporal_constraint`, `sequence_construction`, `causality_timeline`
- Every event referenced in `timeline.events` has a corresponding entry in `events`
- Every `relationType` is one of: `causes`, `enables`, `prevents`, `precedes`, `follows`
- Every `constraint.type` is a valid Allen relation: `before`, `after`, `during`, `overlaps`, `meets`, `starts`, `finishes`, `equals`
- Causal `relationType` is not asserted on sequence alone — a mechanism or delay is stated
- `strength` and `confidence` values are in [0, 1]
- Temporal paradoxes (effect precedes cause) are explicitly flagged rather than silently resolved

### Worked Example

Input: "Our service started returning 502 errors at T+4 min. The CPU alert fired at T+8 min. The upstream dependency deployment completed at T+0. What does the ordering tell us?"

Analysis: The 502 errors appeared 4 minutes before the CPU alert. If CPU saturation caused the 502s, effects would not precede their cause. The upstream deployment at T+0 is the only event that precedes the 502 onset.

Output:

```json
{
  "mode": "temporal",
  "thoughtType": "causality_timeline",
  "timeline": {
    "id": "incident_timeline",
    "name": "502 Error Incident — 2026-04-11",
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
      "type": "instant",
      "properties": { "service": "upstream-api", "version": "v2.3.1" }
    },
    {
      "id": "errors_502",
      "name": "502 errors begin",
      "description": "Our service starts returning 502 Bad Gateway responses",
      "timestamp": 4,
      "type": "instant",
      "properties": { "errorRate": "high", "statusCode": 502 }
    },
    {
      "id": "cpu_alert",
      "name": "CPU alert fires",
      "description": "Monitoring alert triggers on CPU threshold breach",
      "timestamp": 8,
      "type": "instant",
      "properties": { "threshold": "80%", "alerting": "pagerduty" }
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

Natural-language summary: "The ordering rules out CPU saturation as the root cause of the 502s — the CPU alert fires 4 minutes after errors begin, so saturation is a downstream consequence, not the trigger. The upstream deployment at T+0 is the only event that precedes the error onset (4-minute lag is consistent with a connection pool or health-check propagation delay). The CPU spike is most likely load generated by retry storms after the 502s started. Primary hypothesis: the upstream v2.3.1 deployment introduced a breaking change."

---

## Historical Reasoning

Historical reasoning applies systematic source criticism and precedent analysis to understand past events and draw defensible analogies to current situations. Unlike Temporal mode (which traces event mechanics), Historical mode asks: which sources can we trust, what patterns recur across episodes, and does this situation genuinely match a past precedent — or are the surface similarities misleading?

### When to Use

- You are evaluating sources with different reliability levels, biases, or temporal vantage points
- You want to determine whether a current situation matches a documented historical precedent
- You are tracing a causal chain across a long time span with multiple actors and contingent factors
- You need to identify recurring patterns — cyclical, structural, or contingent — across multiple historical episodes
- You are doing periodization: deciding where meaningful boundaries between phases lie

**Do not use Historical** when:
- You are reasoning about a real-time event sequence with precise timestamps → use Temporal
- You only have one source and no corroboration — flag the limitation, do not fabricate corroboration
- The pattern claim is based on fewer than two distinct episodes — that is an anecdote, not a pattern

### How to Reason Historically

1. **Identify the historical events.** For each: a date or date range, the actors involved, significance rating (`minor`, `moderate`, `major`, `transformative`), and known causes and effects.
2. **Evaluate your sources.** For each source:
   - **Type**: primary (direct/contemporary), secondary (later analysis), tertiary (synthesis)
   - **Reliability** [0, 1]: proximity to the event, corroboration, author expertise
   - **Bias**: type (political, nationalistic, economic, etc.), direction, severity
   - **Corroboration**: which other sources confirm or contradict it
   Degrade reliability when bias is high and corroboration is absent. A single uncorroborated primary source with high bias has lower effective reliability than a corroborated secondary.
3. **Compute aggregate reliability.** The aggregate is bounded by your weakest critical source: if a key fact rests on a single low-reliability source, the whole chain inherits that uncertainty.
4. **Identify patterns.** Patterns require at least two distinct episodes. Classify: `cyclical` (recurs with regularity), `structural` (driven by stable structural forces), `contingent` (depends on specific actors or conditions).
5. **Test precedent claims rigorously.** "This is like X" requires:
   - List the structural features of both the current situation and the precedent
   - Identify features that match, features that differ, and which differences are load-bearing
   - A load-bearing difference (one that changes the likely outcome) disqualifies the precedent for prediction even if many surface features match
6. **Build causal chains with confidence.** Each causal link has a mechanism, a confidence score, and an acknowledgment of alternative explanations.

### Output Format

See `reference/output-formats/historical.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "historical",
  "thoughtType": "pattern_analysis",
  "events": [
    {
      "id": "<event_id>",
      "name": "<short label>",
      "date": "<YYYY or YYYY-MM-DD>",
      "significance": "major",
      "description": "<what happened>",
      "causes": [],
      "effects": [],
      "sources": []
    }
  ],
  "sources": [
    {
      "id": "<source_id>",
      "title": "<source title>",
      "type": "primary",
      "reliability": 0.0,
      "bias": null,
      "corroboratedBy": []
    }
  ],
  "patterns": [],
  "causalChains": [],
  "aggregateReliability": 0.0
}
```

### Verification Before Emitting

- `mode` is exactly `"historical"`
- Every source referenced in `event.sources` has a corresponding entry in `sources`
- `reliability` values are in [0, 1]; degrade reliability when bias is present and corroboration is absent
- `aggregateReliability` reflects the minimum reliability of load-bearing sources, not a naive average
- `patterns` are only asserted when at least two distinct historical episodes are cited
- Precedent claims list both matching features and load-bearing differences
- `significance` is one of: `minor`, `moderate`, `major`, `transformative`
- `causalChain.confidence` is in [0, 1] and reflects the strength of the weakest causal link

### Worked Example

Input: "Is our planned production database migration similar to the failed 2024 incident? Should we be worried about the same failure mode?"

Analysis: The 2024 incident involved a live schema migration on a 500 GB table without a maintenance window, causing 47 minutes of downtime. Current plan: migrate a 12 GB table with a read replica promoted during maintenance window.

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
      "description": "Planned migration of 12 GB orders table with read replica promotion during maintenance window",
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
      "title": "DB Migration Runbook v3 (updated post-incident)",
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
      "name": "Live schema migration without lock timeout causes table-level lock contention",
      "type": "structural",
      "episodes": ["incident_2024"],
      "matchingFeatures": ["schema ALTER on live table", "no explicit lock_timeout set"],
      "loadBearingDifferences": ["2026 plan uses maintenance window", "table is 12 GB vs 500 GB", "read replica promotion strategy eliminates write traffic during ALTER"],
      "verdictApplies": false,
      "verdictRationale": "The structural failure mode (live migration without timeout) is not present in the 2026 plan. The load-bearing differences eliminate the known failure mechanism."
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
          "timelag": "immediate"
        }
      ],
      "confidence": 0.93,
      "alternativeExplanations": ["Underlying disk I/O saturation may have prolonged lock hold time"]
    }
  ],
  "aggregateReliability": 0.85
}
```

Natural-language summary: "The surface resemblance is real — both involve a production DB migration — but the 2024 failure mode does not apply. The 2024 outage was caused by a live ALTER TABLE without lock_timeout on a very large table during peak traffic; all three load-bearing factors are absent in 2026 (maintenance window, 40x smaller table, write traffic eliminated via replica promotion). The precedent is useful as a checklist of what not to do, but it does not predict failure for the current plan. Residual risk: the migration_plan_v2 source is uncorroborated — verify the maintenance window and replica promotion steps are tested in staging before committing."
