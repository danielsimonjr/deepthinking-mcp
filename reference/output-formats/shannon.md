# Shannon Thought — Output Format

Systematic 5-stage problem-solving with explicit uncertainty tracking and information-theoretic decomposition.

## JSON Schema

```json
{
  "mode": "shannon",
  "thoughtNumber": <integer ≥1>,
  "totalThoughts": <integer ≥1>,
  "content": "<the thought content as natural language>",
  "nextThoughtNeeded": <boolean>,
  "stage": "<one of: problem_definition | constraints | model | proof | implementation>",
  "uncertainty": <number 0–1, where 1 = completely unknown>,
  "dependencies": ["<prior thought or information source this step relies on>", ...],
  "assumptions": ["<explicit assumption being made>", ...],
  "recheckStep": {
    "stepToRecheck": "<id or name of step to revisit>",
    "reason": "<why rechecking is needed>",
    "newInformation": "<what new information triggered the recheck, optional>"
  },
  "confidenceFactors": {
    "dataQuality": <number 0–1>,
    "methodologyRobustness": <number 0–1>,
    "assumptionValidity": <number 0–1>
  },
  "alternativeApproaches": ["<alternative approach not taken>", ...],
  "knownLimitations": ["<known limitation of this step>", ...]
}
```

## Required Fields

- `mode` — always the literal string `"shannon"`
- `thoughtNumber` — 1-indexed position in the chain
- `totalThoughts` — total count (typically 5, one per stage)
- `content` — the actual thought text; must state what uncertainty is being reduced
- `nextThoughtNeeded` — `true` if more stages remain
- `stage` — current Shannon stage (see five stages below)
- `uncertainty` — 0–1 score; should decrease from `problem_definition` to `proof`
- `dependencies` — explicit list of prior steps or information sources; use `[]` at stage 1
- `assumptions` — list of explicit assumptions; never leave empty after stage 1

## The Five Stages

| Stage | Value | Purpose |
|-------|-------|---------|
| Problem Definition | `problem_definition` | Precisely state the problem; identify what is unknown |
| Constraints | `constraints` | Enumerate hard limits (bandwidth, budget, time, correctness) |
| Model | `model` | Build a mathematical or structural representation |
| Proof | `proof` | Verify the model is correct; reduce uncertainty toward zero |
| Implementation | `implementation` | Map the proven model to a concrete, executable solution |

Uncertainty should be tracked across all five stages. A typical trajectory: 0.7 → 0.55 → 0.35 → 0.15 → 0.3 (implementation re-introduces practical uncertainty).

## Worked Example

Input: "Decompose the problem of reducing p99 latency on our user-search API."

Output (stage 1 — problem_definition):

```json
{
  "mode": "shannon",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "content": "Define the problem: our user-search API has unacceptable p99 latency (>800ms observed, target <200ms). The reducible uncertainty here is: we do not know which subsystem contributes most to tail latency. Decompose the problem into three independently measurable sources: (1) query parsing and tokenisation, (2) index lookup and ranking, (3) serialisation and network round-trip.",
  "nextThoughtNeeded": true,
  "stage": "problem_definition",
  "uncertainty": 0.75,
  "dependencies": [],
  "assumptions": [
    "p99 is measured at the load balancer, not inside the service",
    "the three subsystems are approximately independent",
    "existing tracing covers all three stages"
  ],
  "confidenceFactors": {
    "dataQuality": 0.7,
    "methodologyRobustness": 0.8,
    "assumptionValidity": 0.65
  }
}
```

Output (stage 2 — constraints):

```json
{
  "mode": "shannon",
  "thoughtNumber": 2,
  "totalThoughts": 5,
  "content": "Hard constraints: (a) p99 must drop below 200ms end-to-end; (b) index accuracy must not degrade (recall ≥ 0.95); (c) solution must deploy within one sprint without a schema migration. These constraints eliminate solutions that trade recall for speed or require offline index rebuilds.",
  "nextThoughtNeeded": true,
  "stage": "constraints",
  "uncertainty": 0.55,
  "dependencies": ["problem_definition"],
  "assumptions": [
    "recall is measured by existing A/B framework",
    "sprint length is two weeks"
  ],
  "confidenceFactors": {
    "dataQuality": 0.85,
    "methodologyRobustness": 0.8,
    "assumptionValidity": 0.75
  },
  "alternativeApproaches": [
    "relax recall constraint to 0.90 and allow aggressive caching",
    "accept longer deployment timeline to permit schema migration"
  ]
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"shannon"`
- `thoughtNumber` ≤ `totalThoughts`
- `stage` is one of the five valid enum values
- `uncertainty` is a number between 0 and 1 (inclusive)
- `uncertainty` decreases from `problem_definition` through `proof` (may rise at `implementation`)
- `dependencies` is an array (use `[]` at stage 1, non-empty thereafter)
- `assumptions` is a non-empty array by stage 2 at the latest
- `content` explicitly mentions what uncertainty or unknown is being addressed
- `nextThoughtNeeded` is `false` only at stage `implementation`
