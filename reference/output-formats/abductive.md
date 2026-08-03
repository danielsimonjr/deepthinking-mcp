# Abductive Thought — Output Format

Reasoning from surprising observations to the best available explanation — generating and ranking candidate hypotheses.

## JSON Schema

```json
{
  "mode": "abductive",
  "observations": [
    { "id": "<string>", "description": "<what was observed>", "confidence": <0-1> }
  ],
  "hypotheses": [
    {
      "id": "<string>",
      "explanation": "<what would explain the observations>",
      "assumptions": ["<assumption 1>", "..."],
      "predictions": ["<testable prediction 1>", "..."],
      "score": <0-1>
    }
  ],
  "currentHypothesis": { "...same shape as a hypothesis object, optional..." },
  "evaluationCriteria": {
    "parsimony": <0-1>,
    "explanatoryPower": <0-1>,
    "plausibility": <0-1>,
    "testability": <boolean>
  },
  "evidence": [
    {
      "hypothesisId": "<id from hypotheses>",
      "type": "supporting | contradicting | neutral",
      "description": "<what the evidence shows>",
      "strength": <0-1>
    }
  ],
  "bestExplanation": { "...same shape as a hypothesis object, optional..." },
  "abductionSteps": [
    {
      "stepNumber": <int ≥ 1>,
      "stepSummary": "<what the reasoner did at this step>",
      "abductionMethod": "<ibe | hypothetico-deductive | eliminative | retroduction | other>",
      "triggerObservation": "<observation id that prompted this step, optional>",
      "hypothesesGenerated": ["<hypothesis id newly introduced>", "..."],
      "hypothesesEliminated": ["<hypothesis id ruled out>", "..."],
      "stepsUsed": [<prior stepNumbers>]
    }
  ]
}
```

## Required Fields

- `mode` — always `"abductive"`
- `observations` — at least one observation object with `id`, `description`, and `confidence`
- `hypotheses` — at least one hypothesis object with `id`, `explanation`, `assumptions`, `predictions`, and `score` (SKILL.md additionally requires ≥2 hypotheses with non-equal scores — a single hypothesis is not abduction)
- `evaluationCriteria` — all four sub-fields: `parsimony`, `explanatoryPower`, `plausibility`, `testability`
- `evidence` — array of evidence objects (may be empty at the start of reasoning; should be populated as evidence accumulates)

## Optional Fields

- `currentHypothesis` — the hypothesis being actively considered right now, before commitment
- `bestExplanation` — the committed final choice; should be consistent with the highest-scoring entry in `hypotheses[]`
- `abductionSteps` — iterative abduction chain. Omit for single-shot abductions where all hypotheses are generated and scored in one pass; present when progressive hypothesis generation, eliminative narrowing, hypothetico-deductive cycles, or retroductive chains are being shown. See "Multi-step abductions" below.

## Multi-step abductions (`abductionSteps[]`)

For abductions that genuinely unfolded as an iterative process — generate candidates, check predictions, eliminate some, introduce more, commit — populate `abductionSteps[]` with one entry per step. Each step has:

- **`stepNumber`** — 1-indexed position in the chain. Sequential and unique within the array (1, 2, 3, ...).
- **`stepSummary`** — a short narrative (one or two sentences) of what the reasoner did at this step: generated candidates, checked a prediction, gathered evidence, ruled out a hypothesis, committed to the best.
- **`abductionMethod`** — name of the abduction style applied at this step. Common values: `"ibe"` (inference to the best explanation — covers both the classical Peircean form and the modern best-explanation framing), `"hypothetico-deductive"` (generate a hypothesis, derive testable predictions, check them empirically), `"eliminative"` (rule out alternatives until one remains), `"retroduction"` (reason backward from observed effect to possible cause), `"other"`. Free-text in v0.5.4; a future release may tighten to an enum.
- **`triggerObservation`** — optional id reference into the top-level `observations[]` array, naming the observation that prompted this step. Null or omitted for refinement or commit steps that are not prompted by a new observation.
- **`hypothesesGenerated`** — optional array of ids naming hypotheses newly introduced at this step. Each id must match an id in the top-level `hypotheses[]` array. May be empty for steps that only refine, score, or commit without adding candidates.
- **`hypothesesEliminated`** — optional array of ids naming hypotheses ruled out at this step. Each id must match an id in the top-level `hypotheses[]` array. Eliminated hypotheses remain in the top-level `hypotheses[]` array (preserving the audit trail) — they are simply no longer viable candidates for `bestExplanation`.
- **`stepsUsed`** — optional array of prior `stepNumber` values this step builds on. No forward references — step 3 can reference 1 or 2, never 4 or itself.

**When to use `abductionSteps[]`:**

- **Progressive hypothesis generation** — the initial observation prompts a first set of candidates; new evidence prompts additional candidates at a later step; you want to show the order and motivation behind each addition.
- **Eliminative narrowing** — you want to show which hypothesis was ruled out at which step and by what evidence, rather than just presenting the final survivors.
- **Hypothetico-deductive cycles** — each step follows a generate-predict-test pattern, and you want the structure of that cycle visible.
- **Retroductive chains** — you reason backward from effect to cause through multiple layers (e.g., symptom → proximate cause → root cause), with each layer being its own step.

**When to omit `abductionSteps[]`:**

- The abduction was a single-shot parallel analysis — all hypotheses were generated at once, all evidence was weighed in one pass, and the best was chosen.
- The chain would just mirror the flat structure without adding information about sequence.

## Step-level scoring vs top-level scoring

The top-level `hypotheses[].score` is the **final committed ranking** after all steps are complete. Step-level scoring — a per-step snapshot of how competitor hypotheses were ranked at that intermediate point — is deliberately **not** in v0.5.4's schema. It was considered and deferred: the flat top-level scoring is sufficient for most abductions, and per-step scoring adds schema complexity without corresponding expressive power in the step flow. A future release may add it as a further optional per-step field if use cases emerge.

## Key Distinction: Atomic vs Iterative

Many abductions are genuinely **single-shot** — you see an anomaly, enumerate plausible explanations, weigh them against evidence, and pick the best, all in one pass. For those, keep the flat shape with no `abductionSteps[]`. The stepwise shape is reserved for cases where the reasoning genuinely unfolded over multiple rounds of generate-test-refine — most commonly in debugging, root-cause analysis, and hypothetico-deductive scientific reasoning.

## Worked Example — single-shot abduction (no `abductionSteps`)

Input: "Users on the analytics dashboard are seeing 503 errors, but ONLY on Tuesday mornings between 9–10 AM. What's the best explanation?"

Output:

```json
{
  "mode": "abductive",
  "observations": [
    { "id": "o1", "description": "Analytics dashboard returns 503 errors exclusively on Tuesday mornings between 9:00 AM and 10:00 AM", "confidence": 0.97 },
    { "id": "o2", "description": "Error rate returns to zero by 10:05 AM with no manual intervention", "confidence": 0.95 },
    { "id": "o3", "description": "Affected endpoint is /api/reports/dashboard — other API endpoints remain healthy during the same window", "confidence": 0.92 },
    { "id": "o4", "description": "Database CPU spikes to 95% during the 9–10 AM Tuesday window; normal the rest of the week", "confidence": 0.88 }
  ],
  "hypotheses": [
    {
      "id": "h1",
      "explanation": "A weekly scheduled ETL job runs at 9 AM every Tuesday and saturates the database, crowding out dashboard queries",
      "assumptions": ["A cron job or scheduler fires at 09:00 on Tuesdays specifically", "The job issues heavy read/write queries that compete with dashboard query traffic"],
      "predictions": ["Cron job logs show a Tuesday 09:00 entry", "Disabling the job would eliminate the 503 window"],
      "score": 0.82
    },
    {
      "id": "h2",
      "explanation": "The weekly BI report pipeline materializes results at Tuesday 9 AM, causing write-heavy lock contention on the reports table",
      "assumptions": ["BI pipeline writes to the same reports table the dashboard reads from"],
      "predictions": ["Lock-wait logs show contention on the reports table on Tuesdays 09:00-10:00"],
      "score": 0.71
    },
    {
      "id": "h3",
      "explanation": "Application cache is flushed every Monday night, causing a cache cold-start stampede on Tuesday morning",
      "assumptions": ["The dashboard relies on a cache layer that is cleared on Monday nights"],
      "predictions": ["Cache hit-rate metrics show near-zero Tuesday 9-9:30 AM"],
      "score": 0.54
    }
  ],
  "evaluationCriteria": { "parsimony": 0.75, "explanatoryPower": 0.88, "plausibility": 0.82, "testability": true },
  "evidence": [
    { "hypothesisId": "h1", "type": "supporting", "description": "Application logs show a weekly_etl_job entry starting at 09:00:02 every Tuesday for the past six weeks", "strength": 0.85 },
    { "hypothesisId": "h2", "type": "supporting", "description": "Database slow-query log shows a 47-minute INSERT…SELECT on report_snapshots starting at 09:00 every Tuesday", "strength": 0.78 },
    { "hypothesisId": "h3", "type": "contradicting", "description": "Cache monitoring shows hit rates normal (>90%) at 9 AM Tuesday", "strength": 0.72 }
  ],
  "bestExplanation": {
    "id": "h1",
    "explanation": "A weekly scheduled ETL job runs at 9 AM every Tuesday and saturates the database, crowding out dashboard queries",
    "assumptions": ["A cron job or scheduler fires at 09:00 on Tuesdays specifically", "The job issues heavy read/write queries that compete with dashboard query traffic"],
    "predictions": ["Cron job logs show a Tuesday 09:00 entry", "Disabling the job would eliminate the 503 window"],
    "score": 0.82
  }
}
```

This is a single-shot abduction. All 3 hypotheses were generated at once, evidence was weighed in one pass, the best was chosen. No `abductionSteps` — the reasoning did not genuinely unfold in iterations.

## Worked Example — iterative abduction (with `abductionSteps`)

Same scenario, but the reasoning is shown as it actually unfolded: generate → test → eliminate → commit.

```json
{
  "mode": "abductive",
  "observations": [
    { "id": "o1", "description": "Analytics dashboard returns 503 errors exclusively on Tuesday mornings between 9:00 AM and 10:00 AM", "confidence": 0.97 },
    { "id": "o2", "description": "Error rate returns to zero by 10:05 AM with no manual intervention", "confidence": 0.95 },
    { "id": "o3", "description": "Affected endpoint is /api/reports/dashboard — other API endpoints remain healthy during the same window", "confidence": 0.92 },
    { "id": "o4", "description": "Database CPU spikes to 95% during the 9–10 AM Tuesday window; normal the rest of the week", "confidence": 0.88 }
  ],
  "hypotheses": [
    { "id": "h1", "explanation": "A weekly scheduled ETL job runs at 9 AM every Tuesday and saturates the database", "assumptions": ["..."], "predictions": ["..."], "score": 0.82 },
    { "id": "h2", "explanation": "The weekly BI report pipeline causes lock contention on the reports table", "assumptions": ["..."], "predictions": ["..."], "score": 0.71 },
    { "id": "h3", "explanation": "Application cache is flushed Monday night, causing a Tuesday cold-start stampede", "assumptions": ["..."], "predictions": ["..."], "score": 0.34 }
  ],
  "evaluationCriteria": { "parsimony": 0.75, "explanatoryPower": 0.88, "plausibility": 0.82, "testability": true },
  "evidence": [
    { "hypothesisId": "h1", "type": "supporting", "description": "weekly_etl_job log entries at 09:00:02 every Tuesday", "strength": 0.85 },
    { "hypothesisId": "h2", "type": "supporting", "description": "Slow-query log shows 47-minute INSERT…SELECT on report_snapshots starting 09:00 Tuesdays", "strength": 0.78 },
    { "hypothesisId": "h3", "type": "contradicting", "description": "Cache hit rates normal (>90%) at 9 AM Tuesday", "strength": 0.72 }
  ],
  "bestExplanation": {
    "id": "h1",
    "explanation": "A weekly scheduled ETL job runs at 9 AM every Tuesday and saturates the database",
    "assumptions": ["..."],
    "predictions": ["..."],
    "score": 0.82
  },
  "abductionSteps": [
    {
      "stepNumber": 1,
      "stepSummary": "Triggered by the Tuesday-only 503 window (o1) and the narrow temporal pattern (o2). Reasoned backward from the observed pattern to enumerate the plausible root-cause classes: compute contention (ETL saturation), lock contention (BI materialization), and cold-start (cache flush).",
      "abductionMethod": "retroduction",
      "triggerObservation": "o1",
      "hypothesesGenerated": ["h1", "h2", "h3"],
      "hypothesesEliminated": [],
      "stepsUsed": []
    },
    {
      "stepNumber": 2,
      "stepSummary": "Checked the cache hit-rate prediction from h3 against Tuesday morning cache monitoring. Hit rates were normal (>90%) — the h3 prediction is falsified, so h3 is ruled out as the primary cause.",
      "abductionMethod": "hypothetico-deductive",
      "triggerObservation": null,
      "hypothesesGenerated": [],
      "hypothesesEliminated": ["h3"],
      "stepsUsed": [1]
    },
    {
      "stepNumber": 3,
      "stepSummary": "With h3 eliminated, compared h1 against h2 using the database CPU spike evidence (o4). h1's ETL job aligns precisely with the 09:00:02 start time and the CPU spike timing; h2's lock-wait signature would produce a different metric profile. h1 is the best explanation — commit.",
      "abductionMethod": "ibe",
      "triggerObservation": "o4",
      "hypothesesGenerated": [],
      "hypothesesEliminated": [],
      "stepsUsed": [1, 2]
    }
  ]
}
```

This is a 3-step iterative abduction. Step 1 generates the initial hypothesis set (h1, h2, h3). Step 2 falsifies h3 by checking a specific prediction against cache monitoring data. Step 3 compares h1 and h2 using the database CPU evidence and commits. The commitment in `bestExplanation` points to h1, which was introduced in step 1 — so the chain closes honestly.

## Verification Checklist

Before emitting, verify:

- `mode` is exactly `"abductive"`
- `observations` has at least 1 entry; each has `id`, `description`, and `confidence` in [0, 1]
- `hypotheses` has at least 2 entries — a single hypothesis is not abductive reasoning, it is assumption
- All hypothesis `score` values are distinct — identical scores indicate the evaluation is incomplete
- The highest-scoring hypothesis is meaningfully better than the second-best (score gap ≥ 0.05); if scores are nearly equal, note this uncertainty explicitly
- `evaluationCriteria` is fully populated: all four sub-fields present, numeric values in [0, 1], `testability` is boolean
- At least one `evidence` item exists once any concrete data is available; each item references a valid `hypothesisId`
- `bestExplanation` is consistent with the highest `score` in `hypotheses` — do not point to a lower-scoring hypothesis without an explicit override reason
- Assumptions in `bestExplanation` are the specific claims that could be falsified to overturn the conclusion
- `parsimony` should be lower (closer to 0) when the winning hypothesis requires many assumptions; `explanatoryPower` should reflect how much of the observation set the hypothesis actually covers
- If `abductionSteps[]` is present (enforced by `test/test_skill_invariants.py::check_abductive`):
  - Step numbers are sequential and unique (1, 2, 3, ...)
  - Each step's `stepsUsed[]` only references earlier steps (no forward or self references)
  - Each step's `triggerObservation` (if non-null) matches an id in `observations[]`
  - Each step's `hypothesesGenerated[]` and `hypothesesEliminated[]` entries all match ids in `hypotheses[]`
  - Every step does something — `hypothesesGenerated[]`, `hypothesesEliminated[]`, and `stepsUsed[]` must not all be empty
  - `bestExplanation.id` was introduced by at least one step's `hypothesesGenerated[]` — the commitment must trace back to the stepwise process
