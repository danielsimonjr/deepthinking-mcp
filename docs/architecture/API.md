# DeepThinking MCP — API Reference

Complete reference for the DeepThinking MCP tool surface. For architecture and module layout see
the sibling architecture docs; for environment variables see `CLAUDE.md`. This document describes
the *current* tool surface only.

---

## Table of Contents

1. [Overview](#overview)
2. [Shared thought fields](#shared-thought-fields)
3. [deepthinking_core](#deepthinking_core)
4. [deepthinking_standard](#deepthinking_standard)
5. [deepthinking_mathematics](#deepthinking_mathematics)
6. [deepthinking_temporal](#deepthinking_temporal)
7. [deepthinking_probabilistic](#deepthinking_probabilistic)
8. [deepthinking_causal](#deepthinking_causal)
9. [deepthinking_strategic](#deepthinking_strategic)
10. [deepthinking_analytical](#deepthinking_analytical)
11. [deepthinking_scientific](#deepthinking_scientific)
12. [deepthinking_engineering](#deepthinking_engineering)
13. [deepthinking_academic](#deepthinking_academic)
14. [deepthinking_session](#deepthinking_session)
15. [deepthinking_analyze](#deepthinking_analyze)
16. [Export formats](#export-formats)
17. [The legacy `deepthinking` tool](#the-legacy-deepthinking-tool)
18. [Input limits](#input-limits)
19. [npm package surface](#npm-package-surface)
20. [Verification](#verification)

---

## Overview

DeepThinking MCP exposes its reasoning modes through the Model Context Protocol (MCP). A client
connects over stdio, completes the MCP `initialize` handshake, then calls tools by name through
`CallToolRequest`. `tools/list` returns 13 tools. A 14th tool, the legacy `deepthinking` tool, is
still callable but hidden from `tools/list` (see
[The legacy `deepthinking` tool](#the-legacy-deepthinking-tool)).

### Request envelope

Every call is a JSON object matching one tool's input schema:

```json
{
  "name": "deepthinking_core",
  "arguments": {
    "mode": "deductive",
    "thought": "All humans are mortal. Socrates is human.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false
  }
}
```

The server validates `arguments` against a Zod schema before running any logic
(`src/tools/definitions.ts` maps each tool name to its Zod schema in `toolSchemas`). The JSON
Schema advertised by `tools/list` (`src/tools/json-schemas.ts`) and the Zod schema used for runtime
validation (`src/tools/schemas/`) describe the same shape; the JSON Schema is hand-written for
client-side display, the Zod schema is the actual gate.

**All inputs are bounded.** Every free-text string, every array, and every record (object with
dynamic keys) carries a maximum size. There is no unbounded field anywhere in the tool surface. See
[Input limits](#input-limits) for the concrete numbers.

### Response shape

A successful call returns:

```json
{
  "content": [
    { "type": "text", "text": "<JSON-encoded result, pretty-printed>" }
  ]
}
```

`content` is an array of MCP content blocks; this server only ever returns one block, of type
`text`, whose `text` is a JSON string (`JSON.stringify(response, null, 2)`). Callers must parse
`content[0].text` to get the structured result. The exact shape of the parsed JSON differs per tool
and is documented in each section below.

### Error shape

On failure, the server returns:

```json
{
  "content": [
    { "type": "text", "text": "Error: <message>" }
  ],
  "isError": true
}
```

`isError: true` is set on every caught exception — Zod validation failures, unknown tool names, and
runtime errors all take this path (`src/index.ts`, the `CallToolRequestSchema` handler's `catch`
block). There is no structured error code; the message is the only detail. A client should treat
any response with `isError: true` as a failure regardless of what `content[0].text` says.

---

## Shared thought fields

Every "add a thought" tool (all tools in this document except `deepthinking_session` and
`deepthinking_analyze`) extends the same base schema (`BaseThoughtSchema` in
`src/tools/schemas/base.ts`, mirrored as `baseThoughtProperties` in `src/tools/json-schemas.ts`).
These fields are documented once here; each per-tool section below states only its
**mode-specific** fields on top of this base.

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | string | No | Session to add this thought to. Omit to create a new session automatically. Bounded by `IdSchema` (≤ 1,000 chars). |
| `thought` | string | **Yes** | The current thought or reasoning step. Non-empty. Bounded by `ThoughtTextSchema` (≤ 100,000 chars). |
| `thoughtNumber` | integer | **Yes** | Current thought number in sequence. Minimum 1. |
| `totalThoughts` | integer | **Yes** | Estimated total number of thoughts needed. Minimum 1. |
| `nextThoughtNeeded` | boolean | **Yes** | Whether another thought step is needed after this one. |
| `isRevision` | boolean | No | Whether this thought revises previous thinking. |
| `revisesThought` | string | No | ID of the thought being revised. Bounded by `IdSchema` (≤ 1,000 chars). |
| `revisionReason` | string | No | Explanation for why revision is needed. Bounded by `TextSchema` (≤ 10,000 chars). |
| `branchFrom` | string | No | ID of thought to branch from, for an alternative reasoning path. Bounded by `IdSchema`. |
| `branchId` | string | No | Identifier for this reasoning branch. Bounded by `IdSchema`. |
| `uncertainty` | number | No | Confidence level, 0–1 (1 = highest confidence). |
| `dependencies` | string[] | No | IDs of thoughts this one depends on. Array of `IdSchema`, ≤ 1,000 items. |
| `assumptions` | string[] | No | Key assumptions made in this thought. Array of `IdSchema`, ≤ 1,000 items. |

`thoughtNumber`, `totalThoughts`, and `nextThoughtNeeded` together let a client stream a multi-step
reasoning chain: call the tool repeatedly with the same `sessionId`, incrementing `thoughtNumber`
each time, until `nextThoughtNeeded` is `false`. `isRevision` + `revisesThought` let a later thought
correct an earlier one in the same session without starting over. `branchFrom` + `branchId` let a
client explore an alternative continuation from a specific prior thought while keeping the original
line intact.

Every "add a thought" tool also accepts a `mode` field, whose enum values differ per tool (documented
per section below), and adds tool-specific fields on top of the base set.

### Response shape for add-thought tools

Every tool that adds a thought (all tools except `deepthinking_session` and `deepthinking_analyze`)
returns the same response shape, parsed from `content[0].text`:

```jsonc
{
  "sessionId": "string",
  "thoughtId": "string",
  "thoughtNumber": 1,
  "mode": "deductive",
  "nextThoughtNeeded": false,
  "sessionComplete": false,
  "totalThoughts": 1,
  "modeStatus": {
    "mode": "deductive",
    "isFullyImplemented": true,
    "hasSpecializedHandler": true,
    "note": "" // present only when the mode lacks a specialized handler, or is experimental
  },
  "decomposition": null,      // present only for modes that run proof decomposition
  "consistencyReport": null,  // present only for modes that run consistency checking
  "gapAnalysis": null         // present only for modes that run gap analysis
}
```

`sessionId` is either the ID you passed in, or a freshly created session ID when you omitted it.
`modeStatus.note` explains when a mode is experimental or falls back to the generic handler; it is
absent when the mode is fully implemented with a specialized handler. `decomposition`,
`consistencyReport`, and `gapAnalysis` are only populated for modes whose handler runs proof
analysis (mathematics-family modes); other modes omit them or return `undefined`, which
`JSON.stringify` drops from the output entirely.

Per-tool sections below only describe deviations from this shape (there are none among the 11
add-thought tools — the shape is identical across all of them; only the `mode` value and which
optional fields populate differ).

---

## deepthinking_core

Fundamental reasoning modes: `inductive`, `deductive`, `abductive`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus:

| Field | Type | Required | Applies to | Description |
|---|---|---|---|---|
| `mode` | `"inductive" \| "deductive" \| "abductive"` | No | all | Core reasoning mode. |
| `observations` | string[] | No | inductive, abductive | Specific cases observed. Array of `TextSchema` (≤ 10,000 chars each), ≤ 1,000 items. |
| `pattern` | string | No | inductive | Identified pattern. `TextSchema`. |
| `generalization` | string | No | inductive | General principle formed. `TextSchema`. |
| `confidence` | number | No | inductive | Strength of inference, 0–1. |
| `counterexamples` | string[] | No | inductive | Known exceptions. Array of `TextSchema`, ≤ 1,000 items. |
| `sampleSize` | integer | No | inductive | Number of observations. Minimum 1. |
| `premises` | string[] | No | deductive | General principles. Array of `TextSchema`, ≤ 1,000 items. |
| `conclusion` | string | No | deductive | Specific conclusion. `TextSchema`. |
| `logicForm` | string | No | deductive | Logic form, e.g. modus ponens, modus tollens. `TextSchema`. |
| `validityCheck` | boolean | No | deductive | Is the deduction logically valid? |
| `soundnessCheck` | boolean | No | deductive | Are the premises true? |
| `hypotheses` | object[] | No | abductive | Candidate explanations. Each item: `{ id: string, explanation: string, score?: number }`. `id` bounded by `IdSchema`, `explanation` by `TextSchema`. Array ≤ 500 items (`NESTED_ARRAY_ITEMS`). |
| `bestExplanation` | object | No | abductive | Best explanation chosen. Same shape as one `hypotheses` item. |

`inputSchema.additionalProperties` is `false` — a client cannot pass fields outside this list.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — deductive

Request:

```json
{
  "name": "deepthinking_core",
  "arguments": {
    "mode": "deductive",
    "thought": "All humans are mortal. Socrates is human. Therefore Socrates is mortal.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "premises": ["All humans are mortal.", "Socrates is human."],
    "conclusion": "Socrates is mortal.",
    "logicForm": "modus ponens",
    "validityCheck": true,
    "soundnessCheck": true
  }
}
```

Response (`content[0].text`, parsed):

```json
{
  "sessionId": "a1b2c3d4-...",
  "thoughtId": "t-0001",
  "thoughtNumber": 1,
  "mode": "deductive",
  "nextThoughtNeeded": false,
  "sessionComplete": false,
  "totalThoughts": 1,
  "modeStatus": {
    "mode": "deductive",
    "isFullyImplemented": true,
    "hasSpecializedHandler": true
  }
}
```

### Example — abductive

```json
{
  "name": "deepthinking_core",
  "arguments": {
    "mode": "abductive",
    "thought": "The lawn is wet. Best explanation: it rained overnight.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "observations": ["The lawn is wet.", "The sky is clear now.", "The car windshield is dry."],
    "hypotheses": [
      { "id": "h1", "explanation": "It rained overnight.", "score": 0.7 },
      { "id": "h2", "explanation": "The sprinkler ran.", "score": 0.3 }
    ],
    "bestExplanation": { "id": "h1", "explanation": "It rained overnight.", "score": 0.7 }
  }
}
```

---

## deepthinking_standard

Standard workflows: `sequential`, `shannon` (5-stage), `hybrid`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus:

| Field | Type | Required | Applies to | Description |
|---|---|---|---|---|
| `mode` | `"sequential" \| "shannon" \| "hybrid"` | No | all | Thinking mode to use. |
| `stage` | `"problem_definition" \| "constraints" \| "model" \| "proof" \| "implementation"` | No | shannon only | Shannon methodology stage. |
| `activeModes` | string[] | No | hybrid only | Active sub-modes for hybrid mode. Array of `IdSchema`, ≤ 1,000 items. |

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — shannon

Request:

```json
{
  "name": "deepthinking_standard",
  "arguments": {
    "mode": "shannon",
    "stage": "constraints",
    "thought": "The system must operate within a 4GB memory budget and respond in under 200ms.",
    "thoughtNumber": 2,
    "totalThoughts": 5,
    "nextThoughtNeeded": true,
    "sessionId": "a1b2c3d4-..."
  }
}
```

Response shape is the [standard add-thought response](#response-shape-for-add-thought-tools), with
`"mode": "shannon"`.

---

## deepthinking_mathematics

Math/physics/computability reasoning: proofs, Turing machines, decidability, tensors, LaTeX,
conservation laws. Modes: `mathematics`, `physics`, `computability`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus:

| Field | Type | Required | Description |
|---|---|---|---|
| `mode` | `"mathematics" \| "physics" \| "computability"` | No | Mathematical reasoning mode. |
| `thoughtType` | string | No | Specific thought type for mathematics mode. Use `proof_decomposition`, `dependency_analysis`, `consistency_check`, `gap_identification`, or `assumption_trace` for proof analysis. `IdSchema` (≤ 1,000 chars). |
| `mathematicalModel` | object | No | `{ latex: string, symbolic: string, ascii?: string }`. `latex` and `symbolic` required; each `TextSchema` (≤ 10,000 chars). |
| `proofStrategy` | object | No | `{ type: ProofType, steps: string[] }`. `type` is one of `direct`, `contradiction`, `induction`, `construction`, `contrapositive`. `steps` is an array of `IdSchema` (≤ 1,000 items). Both fields required if the object is present. |
| `tensorProperties` | object | No | `{ rank: [number, number], components: string, latex: string, symmetries: string[], invariants: string[], transformation: "covariant" \| "contravariant" \| "mixed" }`. `rank`, `components`, `latex`, `transformation` required. |
| `physicalInterpretation` | object | No | `{ quantity: string, units: string, conservationLaws: string[] }`, all required. `quantity`/`units` are `IdSchema`; `conservationLaws` an `IdSchema[]` (≤ 1,000 items). |
| `proofSteps` | object[] | No | Structured proof steps for decomposition analysis. Each: `{ stepNumber: integer ≥ 1, statement: string, justification?: string, latex?: string, referencesSteps?: integer[] }`. `statement`/`justification`/`latex` are `TextSchema`; `referencesSteps` ≤ 1,000 items. Array ≤ 500 items (`NESTED_ARRAY_ITEMS`). |
| `theorem` | string | No | The theorem being proved, for proof decomposition. `TextSchema`. |
| `hypotheses` | string[] | No | Starting hypotheses for the proof. Array of `IdSchema`, ≤ 1,000 items. |
| `analysisDepth` | `"shallow" \| "standard" \| "deep"` | No | Depth of proof analysis. |
| `includeConsistencyCheck` | boolean | No | Whether to run inconsistency detection. |
| `traceAssumptions` | boolean | No | Whether to include assumption chain analysis. |

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools). When `proofSteps` is
supplied and `thoughtType` requests proof analysis, `decomposition`, `consistencyReport`, and/or
`gapAnalysis` populate in the response depending on which flags were set.

### Example — proof decomposition

Request:

```json
{
  "name": "deepthinking_mathematics",
  "arguments": {
    "mode": "mathematics",
    "thoughtType": "proof_decomposition",
    "thought": "Proving that sqrt(2) is irrational by contradiction.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "theorem": "sqrt(2) is irrational",
    "proofStrategy": {
      "type": "contradiction",
      "steps": [
        "Assume sqrt(2) = a/b in lowest terms",
        "Then 2b^2 = a^2, so a is even",
        "Write a = 2k, giving 2b^2 = 4k^2, so b is even",
        "Contradiction: a/b was not in lowest terms"
      ]
    },
    "proofSteps": [
      { "stepNumber": 1, "statement": "Assume sqrt(2) = a/b in lowest terms", "justification": "Proof by contradiction setup" },
      { "stepNumber": 2, "statement": "2b^2 = a^2", "justification": "Squaring both sides", "referencesSteps": [1] },
      { "stepNumber": 3, "statement": "a is even", "justification": "2 divides a^2 implies 2 divides a", "referencesSteps": [2] }
    ],
    "includeConsistencyCheck": true,
    "traceAssumptions": true,
    "analysisDepth": "standard"
  }
}
```

Response (`content[0].text`, parsed) follows the standard shape, with `decomposition`,
`consistencyReport`, and `gapAnalysis` populated because `proofSteps` was supplied and both check
flags were set:

```jsonc
{
  "sessionId": "a1b2c3d4-...",
  "thoughtId": "t-0001",
  "thoughtNumber": 1,
  "mode": "mathematics",
  "nextThoughtNeeded": false,
  "sessionComplete": false,
  "totalThoughts": 1,
  "modeStatus": { "mode": "mathematics", "isFullyImplemented": true, "hasSpecializedHandler": true },
  "decomposition": { /* structured proof-step graph */ },
  "consistencyReport": { /* inconsistency findings, if any */ },
  "gapAnalysis": { /* unjustified steps, if any */ }
}
```

### Example — physics (tensor)

```json
{
  "name": "deepthinking_mathematics",
  "arguments": {
    "mode": "physics",
    "thought": "The stress-energy tensor is symmetric and its divergence vanishes (conservation of energy-momentum).",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "tensorProperties": {
      "rank": [0, 2],
      "components": "T_{mu nu}",
      "latex": "T_{\\mu\\nu}",
      "symmetries": ["T_{mu nu} = T_{nu mu}"],
      "invariants": ["trace"],
      "transformation": "covariant"
    },
    "physicalInterpretation": {
      "quantity": "stress-energy tensor",
      "units": "J/m^3",
      "conservationLaws": ["conservation of energy-momentum"]
    }
  }
}
```

---

## deepthinking_temporal

Timelines, Allen's interval algebra, event sequencing, and historical analysis. Modes: `temporal`,
`historical`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus a `mode` field and two
mode-specific groups of fields. All top-level object arrays below are bounded at 500 items
(`NESTED_ARRAY_ITEMS`); scalar string fields inside them use `IdSchema` (≤ 1,000 chars),
`NameSchema` (≤ 500 chars), or `TextSchema` (≤ 10,000 chars) as noted.

| Field | Type | Required | Description |
|---|---|---|---|
| `mode` | `"temporal" \| "historical"` | No | Temporal or historical reasoning mode. |

**Temporal-mode fields:**

| Field | Type | Description |
|---|---|---|
| `timeline` | object | `{ id, name, timeUnit, events: string[], startTime?: number, endTime?: number }`. `timeUnit` is one of `milliseconds, seconds, minutes, hours, days, months, years`. `id`/`name`/`events` required. |
| `events` | object[] | Temporal events. Each: `{ id, name, description, timestamp: number, type: "instant" \| "interval", duration?: number, properties?: record }`. `id`/`name`/`description`/`timestamp`/`type` required. `properties` is a bounded record (key `IdSchema`, ≤ 1,000 entries) of arbitrary values. |
| `constraints` | object[] | Temporal constraints. Each: `{ id, type: "before" \| "after" \| "during" \| "simultaneous", subject: string, object: string, confidence: number 0–1 }`, all required. |
| `intervals` | object[] | Temporal intervals. Each: `{ id, name, start: number, end: number, contains?: string[], overlaps?: string[] }`, `id`/`name`/`start`/`end` required. |
| `relations` | object[] | Temporal relations, Allen's interval algebra. Each: `{ id, from, to, relationType, strength: number 0–1, delay?: number }`, all but `delay` required. `relationType` is one of `before, after, during, overlaps, meets, starts, finishes, equals, causes`. |

**Historical-mode fields:**

| Field | Type | Description |
|---|---|---|
| `thoughtType` | string | Type of historical analysis: `event_analysis`, `source_evaluation`, `pattern_identification`, `causal_chain`, or `periodization`. |
| `historicalEvents` | object[] | Each: `{ id, name, date: string \| { start, end, precision? }, location?, description?, actors?: string[], causes?: string[], effects?: string[], significance: "minor" \| "moderate" \| "major" \| "transformative", sources?: string[], tags?: string[] }`. `id`/`name`/`date`/`significance` required. `date.precision` is one of `exact, approximate, century, decade, year, month, day`. |
| `historicalSources` | object[] | Each: `{ id, title, type: "primary" \| "secondary" \| "tertiary", subtype?, author?, date?, reliability: number 0–1, bias?: { type, direction?, severity? }, corroboratedBy?: string[], contradictedBy?: string[] }`. `id`/`title`/`type`/`reliability` required. `subtype` is one of `document, artifact, oral, visual, archaeological, statistical`. `bias.type` is one of `political, religious, cultural, economic, nationalistic, ideological, personal`. |
| `periods` | object[] | Each: `{ id, name, startDate, endDate, characteristics: string[], keyEvents?, keyActors?, themes? }`. `id`/`name`/`startDate`/`endDate`/`characteristics` required. |
| `causalChains` | object[] | Each: `{ id, name, links: { cause, effect, mechanism?, confidence: number, evidence?: string[] }[], confidence: number 0–1, alternativeExplanations?: string[] }`. `id`/`name`/`links`/`confidence` required; each link's `cause`/`effect`/`confidence` required, `links` array ≤ 500 items. |
| `actors` | object[] | Each: `{ id, name, type: "individual" \| "group" \| "institution" \| "nation" \| "movement" \| "class", period?, roles?, motivations?, relationships?: { actorId, type, description? }[], significance? }`. `id`/`name`/`type` required. `relationships[].type` is one of `ally, rival, subordinate, superior, colleague, influenced_by, mentor, successor`, `relationships` array ≤ 500 items. |
| `historiographicalSchool` | string | Historiographical school of thought, e.g. Annales, Marxist, Postmodern. `IdSchema`. |

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — temporal

```json
{
  "name": "deepthinking_temporal",
  "arguments": {
    "mode": "temporal",
    "thought": "Event B must occur before event C, and C overlaps with D.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "events": [
      { "id": "evt-b", "name": "Deploy", "description": "Deploy the service", "timestamp": 1000, "type": "instant" },
      { "id": "evt-c", "name": "Migration", "description": "Run data migration", "timestamp": 1100, "type": "interval", "duration": 300 },
      { "id": "evt-d", "name": "Cutover", "description": "Traffic cutover", "timestamp": 1300, "type": "instant" }
    ],
    "relations": [
      { "id": "r1", "from": "evt-b", "to": "evt-c", "relationType": "before", "strength": 1.0 },
      { "id": "r2", "from": "evt-c", "to": "evt-d", "relationType": "overlaps", "strength": 0.8 }
    ]
  }
}
```

### Example — historical

```json
{
  "name": "deepthinking_temporal",
  "arguments": {
    "mode": "historical",
    "thoughtType": "source_evaluation",
    "thought": "Evaluating primary vs. secondary sources for the 1969 moon landing.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "historicalSources": [
      { "id": "s1", "title": "NASA mission transcript", "type": "primary", "subtype": "document", "reliability": 0.95 },
      { "id": "s2", "title": "Retrospective documentary", "type": "secondary", "subtype": "visual", "reliability": 0.7 }
    ]
  }
}
```

---

## deepthinking_probabilistic

Bayesian updates and Dempster-Shafer belief reasoning. Modes: `bayesian`, `evidential`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus:

| Field | Type | Required | Applies to | Description |
|---|---|---|---|---|
| `mode` | `"bayesian" \| "evidential"` | No | all | Probabilistic reasoning mode. |
| `priorProbability` | number 0–1 | No | bayesian | Prior probability before evidence. |
| `likelihood` | number 0–1 | No | bayesian | Likelihood of evidence given hypothesis. |
| `posteriorProbability` | number 0–1 | No | bayesian | Posterior probability after evidence. |
| `evidence` | string[] | No | bayesian | Evidence considered. Array of `IdSchema`, ≤ 1,000 items. |
| `hypotheses` | object[] | No | bayesian | `{ id, description, probability?: number 0–1 }`. `id`/`description` required. `id` is `IdSchema`, `description` is `TextSchema`. Array ≤ 500 items. |
| `frameOfDiscernment` | string[] | No | evidential | Frame of discernment for Dempster-Shafer theory. Array of `IdSchema`, ≤ 1,000 items. |
| `massFunction` | record | No | evidential | Mass function assignments: keys are `IdSchema`, values are numbers 0–1. Bounded record, ≤ 1,000 entries. |
| `beliefFunction` | record | No | evidential | Belief function values, same shape as `massFunction`. |
| `plausibilityFunction` | record | No | evidential | Plausibility function values, same shape as `massFunction`. |

The Zod validator also accepts an optional `beliefMasses` array (`{ hypothesisSet: string[], mass:
number 0–1, justification: string }`, ≤ 500 items) for Dempster-Shafer belief-mass assignment. This
field is present in the runtime schema but not in the advertised JSON Schema — it validates if sent
but a client relying only on `tools/list` will not discover it.

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — bayesian

```json
{
  "name": "deepthinking_probabilistic",
  "arguments": {
    "mode": "bayesian",
    "thought": "Updating belief that the service is down given a spike in error-rate alerts.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "priorProbability": 0.05,
    "likelihood": 0.9,
    "posteriorProbability": 0.32,
    "evidence": ["error-rate alert fired", "3 dependent services also alerting"],
    "hypotheses": [
      { "id": "h1", "description": "Service is down", "probability": 0.32 },
      { "id": "h2", "description": "Transient network blip", "probability": 0.68 }
    ]
  }
}
```

### Example — evidential

```json
{
  "name": "deepthinking_probabilistic",
  "arguments": {
    "mode": "evidential",
    "thought": "Combining sensor readings with Dempster-Shafer belief combination.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "frameOfDiscernment": ["intruder", "animal", "wind"],
    "massFunction": { "intruder": 0.4, "animal": 0.3, "wind": 0.1, "intruder,animal": 0.2 },
    "beliefFunction": { "intruder": 0.4, "animal": 0.3 },
    "plausibilityFunction": { "intruder": 0.6, "animal": 0.5 }
  }
}
```

---

## deepthinking_causal

Causal graphs and counterfactual reasoning. Modes: `causal`, `counterfactual`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus:

| Field | Type | Required | Description |
|---|---|---|---|
| `mode` | `"causal" \| "counterfactual"` | No | Causal reasoning mode. |
| `nodes` | object[] | No | Nodes in the causal graph. Each: `{ id, name, description? }`. `id`/`name` required. Array ≤ 500 items. |
| `edges` | object[] | No | Causal edges. Each: `{ from, to, strength?: number 0–1, type?: string }`. `from`/`to` required. Array ≤ 500 items. |
| `interventions` | object[] | No | Interventions applied to the causal graph. Each: `{ node, value?, effect? }`. `node` required. Array ≤ 500 items. |
| `counterfactual` | object | No | `{ actual?, hypothetical?, consequence? }` — all fields optional strings, `TextSchema`. |
| `observations` | string[] | No | Observed phenomena for abductive-style reasoning within causal mode. Array of `IdSchema`, ≤ 1,000 items. |
| `explanations` | object[] | No | Candidate explanations. Each: `{ hypothesis, plausibility?: number 0–1 }`. `hypothesis` required, `TextSchema`. Array ≤ 500 items. |

The Zod validator additionally accepts a legacy nested `causalGraph: { nodes, edges }` object (same
item shapes as `nodes`/`edges` above) for backward compatibility, and an `"abductive"` value in
`mode`'s enum. Neither is present in the advertised JSON Schema; prefer the top-level `nodes` /
`edges` fields and `deepthinking_core`'s dedicated abductive mode instead.

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — causal graph

```json
{
  "name": "deepthinking_causal",
  "arguments": {
    "mode": "causal",
    "thought": "Modeling the causal chain from a slow query to a customer-facing timeout.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "nodes": [
      { "id": "n1", "name": "Slow query" },
      { "id": "n2", "name": "Connection pool exhaustion" },
      { "id": "n3", "name": "Customer-facing timeout" }
    ],
    "edges": [
      { "from": "n1", "to": "n2", "strength": 0.9 },
      { "from": "n2", "to": "n3", "strength": 0.95 }
    ],
    "interventions": [
      { "node": "n1", "value": "add index", "effect": "query time drops 10x" }
    ]
  }
}
```

### Example — counterfactual

```json
{
  "name": "deepthinking_causal",
  "arguments": {
    "mode": "counterfactual",
    "thought": "Had the index existed, the outage would not have occurred.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "counterfactual": {
      "actual": "No index on orders.customer_id; query scanned the full table.",
      "hypothetical": "Index existed on orders.customer_id.",
      "consequence": "Query completes in 5ms; no connection pool exhaustion; no outage."
    }
  }
}
```

---

## deepthinking_strategic

Game theory, Nash equilibria, and optimization. Modes: `gametheory`, `optimization`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus:

| Field | Type | Required | Applies to | Description |
|---|---|---|---|---|
| `mode` | `"gametheory" \| "optimization"` | No | all | Strategic reasoning mode. |
| `players` | object[] | No | gametheory | Players in the game. Each: `{ id, name, isRational: boolean, availableStrategies: string[], role?: string }`. `id`/`name`/`isRational`/`availableStrategies` required. Array ≤ 500 items. |
| `strategies` | object[] | No | gametheory | Available strategies. Each: `{ id, playerId, name, description, isPure: boolean, probability?: number 0–1 }`. All but `probability` required. Array ≤ 500 items. |
| `payoffMatrix` | object | No | gametheory | `{ players: string[], dimensions: number[], payoffs: { strategyProfile: string[], payoffs: number[] }[] }`, all required. `payoffs[].payoffs` ≤ 1,000 items; `payoffs` array ≤ 500 entries. |
| `objectiveFunction` | string | No | optimization | Function to optimize. `TextSchema`. |
| `constraints` | string[] | No | optimization | Optimization constraints. Array of `IdSchema`, ≤ 1,000 items. |
| `optimizationMethod` | string | No | optimization | Method used for optimization. `IdSchema`. |
| `solution` | object | No | optimization | `{ value: string, variables?: record<string, number> }`. `value` required, `TextSchema`. `variables` is a bounded record (key `IdSchema`, ≤ 1,000 entries). |

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — game theory

```json
{
  "name": "deepthinking_strategic",
  "arguments": {
    "mode": "gametheory",
    "thought": "Two competing services deciding whether to cache aggressively or not — classic prisoner's dilemma structure.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "players": [
      { "id": "p1", "name": "Service A", "isRational": true, "availableStrategies": ["cache", "no-cache"] },
      { "id": "p2", "name": "Service B", "isRational": true, "availableStrategies": ["cache", "no-cache"] }
    ],
    "payoffMatrix": {
      "players": ["p1", "p2"],
      "dimensions": [2, 2],
      "payoffs": [
        { "strategyProfile": ["cache", "cache"], "payoffs": [3, 3] },
        { "strategyProfile": ["cache", "no-cache"], "payoffs": [0, 5] },
        { "strategyProfile": ["no-cache", "cache"], "payoffs": [5, 0] },
        { "strategyProfile": ["no-cache", "no-cache"], "payoffs": [1, 1] }
      ]
    }
  }
}
```

### Example — optimization

```json
{
  "name": "deepthinking_strategic",
  "arguments": {
    "mode": "optimization",
    "thought": "Minimizing p99 latency subject to a fixed instance-count budget.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "objectiveFunction": "minimize p99_latency(instance_count, cache_size)",
    "constraints": ["instance_count <= 10", "cache_size <= 8GB"],
    "optimizationMethod": "grid search",
    "solution": { "value": "instance_count=6, cache_size=4GB", "variables": { "instance_count": 6, "cache_size": 4 } }
  }
}
```

---

## deepthinking_analytical

Analogical mapping, first principles decomposition, meta-reasoning, and cryptanalytic reasoning
(decibans). Modes: `analogical`, `firstprinciples`, `metareasoning`, `cryptanalytic`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus:

| Field | Type | Required | Applies to | Description |
|---|---|---|---|---|
| `mode` | `"analogical" \| "firstprinciples" \| "metareasoning" \| "cryptanalytic"` | No | all | Analytical reasoning mode. |
| `sourceAnalogy` | object | No | analogical | Source domain for analogy. `{ domain: string, elements?: string[], relations?: string[] }`. |
| `targetAnalogy` | object | No | analogical | Target domain for analogy. Same shape as `sourceAnalogy`. |
| `mappings` | object[] | No | analogical | Mappings between domains. Each: `{ source, target, confidence?: number 0–1 }`. `source`/`target` required. Array ≤ 500 items. |
| `fundamentals` | string[] | No | firstprinciples | Fundamental truths or axioms. Array of `IdSchema`, ≤ 1,000 items. |
| `derivedInsights` | string[] | No | firstprinciples | Insights derived from first principles. Array of `IdSchema`, ≤ 1,000 items. |

`metareasoning` and `cryptanalytic` carry no dedicated structured fields beyond the shared thought
fields — express their content through `thought`, `uncertainty`, `dependencies`, and `assumptions`.

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — analogical

```json
{
  "name": "deepthinking_analytical",
  "arguments": {
    "mode": "analogical",
    "thought": "Mapping a circuit breaker in software to an electrical circuit breaker.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "sourceAnalogy": { "domain": "electrical circuits", "elements": ["fuse", "current", "overload"] },
    "targetAnalogy": { "domain": "distributed systems", "elements": ["circuit breaker", "request rate", "failure threshold"] },
    "mappings": [
      { "source": "fuse", "target": "circuit breaker", "confidence": 0.9 },
      { "source": "overload", "target": "failure threshold exceeded", "confidence": 0.85 }
    ]
  }
}
```

### Example — first principles

```json
{
  "name": "deepthinking_analytical",
  "arguments": {
    "mode": "firstprinciples",
    "thought": "Rebuilding the caching strategy from first principles rather than copying a competitor.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "fundamentals": ["reads outnumber writes 20:1", "staleness under 5s is acceptable", "memory is the scarce resource"],
    "derivedInsights": ["an LRU cache sized to the hot working set beats a write-through cache here"]
  }
}
```

---

## deepthinking_scientific

Hypothesis testing, systems thinking, and formal logic. Modes: `scientificmethod`,
`systemsthinking`, `formallogic`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus:

| Field | Type | Required | Applies to | Description |
|---|---|---|---|---|
| `mode` | `"scientificmethod" \| "systemsthinking" \| "formallogic"` | No | all | Scientific reasoning mode. |
| `hypothesis` | string | No | scientificmethod | Scientific hypothesis. `TextSchema`. |
| `predictions` | string[] | No | scientificmethod | Testable predictions. Array of `IdSchema`, ≤ 1,000 items. |
| `experiments` | object[] | No | scientificmethod | Experiments conducted. Each: `{ id, description, result? }`. `id`/`description` required. Array ≤ 500 items. |
| `systemComponents` | object[] | No | systemsthinking | Components of the system. Each: `{ id, name, role? }`. `id`/`name` required. Array ≤ 500 items. |
| `interactions` | object[] | No | systemsthinking | Interactions between components. Each: `{ from, to, type }`, all required. Array ≤ 500 items. |
| `feedbackLoops` | object[] | No | systemsthinking | Feedback loops in the system. Each: `{ type: "positive" \| "negative" \| "neutral", components: string[] }`. Array ≤ 500 items. |
| `premises` | string[] | No | formallogic | Logical premises. Array of `IdSchema`, ≤ 1,000 items. |
| `conclusion` | string | No | formallogic | Logical conclusion. `TextSchema`. |
| `inference` | string | No | formallogic | Type of logical inference used. `TextSchema`. |

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — scientific method

```json
{
  "name": "deepthinking_scientific",
  "arguments": {
    "mode": "scientificmethod",
    "thought": "Testing whether the new cache eviction policy reduces p99 latency.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "hypothesis": "Switching from LRU to LFU eviction reduces p99 read latency by at least 15%.",
    "predictions": ["p99 latency drops below 40ms", "cache hit rate rises above 92%"],
    "experiments": [
      { "id": "e1", "description": "A/B test LFU vs LRU on 10% of traffic for 48h", "result": "p99 dropped from 47ms to 38ms" }
    ]
  }
}
```

### Example — systems thinking

```json
{
  "name": "deepthinking_scientific",
  "arguments": {
    "mode": "systemsthinking",
    "thought": "Mapping the reinforcing loop between alert fatigue and missed incidents.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "systemComponents": [
      { "id": "c1", "name": "Alert volume" },
      { "id": "c2", "name": "On-call fatigue" },
      { "id": "c3", "name": "Missed incidents" }
    ],
    "interactions": [
      { "from": "c1", "to": "c2", "type": "increases" },
      { "from": "c2", "to": "c3", "type": "increases" }
    ],
    "feedbackLoops": [
      { "type": "positive", "components": ["c1", "c2", "c3"] }
    ]
  }
}
```

---

## deepthinking_engineering

Requirements analysis, trade studies, FMEA, ADRs, and algorithm design (CLRS coverage). Modes:
`engineering`, `algorithmic`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus:

| Field | Type | Required | Applies to | Description |
|---|---|---|---|---|
| `mode` | `"engineering" \| "algorithmic"` | No | all | Engineering reasoning mode. |
| `requirementId` | string | No | engineering | Requirement ID being analyzed. `IdSchema`. |
| `tradeStudy` | object | No | engineering | `{ options: string[], criteria: string[], weights?: record<string, number> }`. The Zod validator requires `options` and `criteria`; the advertised JSON Schema marks the whole object's properties optional, so omitting them passes `tools/list`'s schema but fails the actual call. `weights` is a bounded record (key `IdSchema`, ≤ 1,000 entries). |
| `fmeaEntry` | object | No | engineering | `{ failureMode: string, severity: integer 1–10, occurrence: integer 1–10, detection: integer 1–10, rpn?: integer }`. `rpn` is the Risk Priority Number (Severity × Occurrence × Detection); the server does not compute it, the caller supplies it. Same discrepancy as `tradeStudy`: Zod requires `failureMode`/`severity`/`occurrence`/`detection`, the JSON Schema does not mark them required. |
| `algorithmName` | string | No | algorithmic | Name of the algorithm being analyzed. `NameSchema` (≤ 500 chars). |
| `designPattern` | string | No | algorithmic | One of `divide-and-conquer`, `dynamic-programming`, `greedy`, `backtracking`, `branch-and-bound`, `randomized`, `approximation`. |
| `complexityAnalysis` | object | No | algorithmic | `{ timeComplexity: string, spaceComplexity?, bestCase?, averageCase?, worstCase? }`, e.g. `"O(n log n)"`. Zod requires `timeComplexity`; the JSON Schema marks it optional. |
| `correctnessProof` | object | No | algorithmic | `{ invariant: string, termination: string, correctness: string }` — loop invariant, termination argument, correctness proof. Zod requires all three; the JSON Schema marks them optional. |

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — engineering trade study

```json
{
  "name": "deepthinking_engineering",
  "arguments": {
    "mode": "engineering",
    "thought": "Comparing message queue options against latency, cost, and operability.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "requirementId": "REQ-114",
    "tradeStudy": {
      "options": ["SQS", "Kafka", "RabbitMQ"],
      "criteria": ["latency", "operational overhead", "cost"],
      "weights": { "latency": 0.4, "operational overhead": 0.35, "cost": 0.25 }
    },
    "fmeaEntry": {
      "failureMode": "Queue backlog exceeds consumer capacity",
      "severity": 7,
      "occurrence": 3,
      "detection": 5,
      "rpn": 105
    }
  }
}
```

### Example — algorithmic

```json
{
  "name": "deepthinking_engineering",
  "arguments": {
    "mode": "algorithmic",
    "thought": "Designing a divide-and-conquer solution for closest-pair-of-points.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "algorithmName": "Closest Pair of Points",
    "designPattern": "divide-and-conquer",
    "complexityAnalysis": { "timeComplexity": "O(n log n)", "spaceComplexity": "O(n)" },
    "correctnessProof": {
      "invariant": "The strip check only needs to compare points within delta of the dividing line",
      "termination": "Recursion terminates when the point set has 3 or fewer points",
      "correctness": "Any closer pair must lie within delta of the dividing line by the pigeonhole argument"
    }
  }
}
```

---

## deepthinking_academic

Academic research reasoning: synthesis (literature review), argumentation (Toulmin model), critique
(peer review), and analysis (qualitative research). Modes: `synthesis`, `argumentation`, `critique`,
`analysis`.

### Input schema

Carries all [shared thought fields](#shared-thought-fields) plus a `mode` field, an optional
`thoughtType` (`IdSchema`), and per-submode fields below. All structured object arrays are bounded
at 500 items (`NESTED_ARRAY_ITEMS`); plain string arrays at 1,000 items. `title`/`name`/`label` use
`NameSchema` (≤ 500 chars); free text uses `TextSchema` (≤ 10,000 chars); short strings use
`IdSchema` (≤ 1,000 chars).

**`mode: "synthesis"` fields:**

| Field | Type | Description |
|---|---|---|
| `sources` | object[] | Literature sources being synthesized. Each: `{ id, title, type?, authors?: string[], year?: integer, venue?, doi?, relevance?: number 0–1 }`. `id`/`title` required. |
| `themes` | object[] | Identified themes across sources. Each: `{ id, name, description?, sourceIds?: string[], strength?: number 0–1, consensus?: "strong" \| "moderate" \| "weak" \| "contested" }`. `id`/`name` required. |
| `gaps` | object[] | Identified gaps in the literature (structured). Each: `{ id, description, type?, importance? }`. `id`/`description` required. `type` is one of `empirical, theoretical, methodological, population, contextual`; `importance` is one of `critical, significant, moderate, minor`. |
| `researchGaps` | string[] | Advertised in the JSON Schema (`tools/list`) as a plain string array of literature gaps, but the Zod validator that actually gates the call has no `researchGaps` field. Zod's default parse mode strips unrecognized keys silently — sending this field has **no effect** on the created thought. Use the structured `gaps` field instead. |

**`mode: "argumentation"` fields** (Toulmin model):

| Field | Type | Description |
|---|---|---|
| `claims` | object[] | Each: `{ id, statement, type?, strength? }`. `id`/`statement` required. `type` is one of `fact, value, policy, definition, cause`; `strength` is one of `strong, moderate, tentative`. |
| `grounds` | object[] | Evidence supporting claims. Each: `{ id, content, type?, source?, reliability?: number 0–1 }`. `id`/`content` required. `type` is one of `empirical, statistical, testimonial, analogical, logical, textual`. |
| `warrants` | object[] | Connect grounds to claims. Each: `{ id, statement, type?, groundsIds?: string[], claimId? }`. `id`/`statement` required. `type` is one of `generalization, analogy, causal, authority, principle, definition`. |
| `rebuttals` | object[] | Potential counter-arguments. Each: `{ id, objection, type?, strength?, response? }`. `id`/`objection` required. `type` is one of `factual, logical, ethical, practical, definitional`; `strength` is one of `strong, moderate, weak`. |
| `argumentStrength` | number | Overall argument strength, 0–1. |

**`mode: "critique"` fields:**

| Field | Type | Description |
|---|---|---|
| `critiquedWork` | object | `{ title, id?, authors?: string[], year?: integer, type?, field? }`. `title` required. |
| `strengths` | string[] | Identified strengths. |
| `weaknesses` | string[] | Identified weaknesses. |
| `suggestions` | string[] | Improvement suggestions. |

**`mode: "analysis"` fields** (qualitative research):

| Field | Type | Description |
|---|---|---|
| `methodology` | string | Qualitative analysis methodology: one of `thematic_analysis, grounded_theory, discourse_analysis, content_analysis, phenomenological, narrative_analysis, framework_analysis, template_analysis, mixed_qualitative`. |
| `analysisMethod` | string | Advertised in the JSON Schema as a simplified 6-value enum (`thematic, grounded-theory, discourse, content, narrative, phenomenological`), but — like `researchGaps` above — the Zod validator has no `analysisMethod` field. Sending it has **no effect**; use `methodology` instead. |
| `dataSources` | object[] | Each: `{ id, type, description?, participantId? }`. `id`/`type` required. |
| `codes` | object[] | Coding scheme. Each: `{ id, label, definition?, type?, frequency?: integer, examples?: string[] }`. `id`/`label` required. `type` is one of `descriptive, in_vivo, process, initial, focused, axial, theoretical, emotion, value`. |
| `memos` | object[] | Analytical memos. Each: `{ id, content, type?, relatedCodes?: string[] }`. `id`/`content` required. `type` is one of `analytical, theoretical, methodological, reflexive, code, operational`. |
| `categories` | string[] | Categories derived from codes. |
| `saturationReached` | boolean | Whether theoretical saturation has been reached. |

**Shared across all four submodes:**

| Field | Type | Description |
|---|---|---|
| `keyInsight` | string | Key insight from the analysis. `TextSchema`. |

`additionalProperties` is `false`.

### Returns

The [standard add-thought response](#response-shape-for-add-thought-tools).

### Example — synthesis

```json
{
  "name": "deepthinking_academic",
  "arguments": {
    "mode": "synthesis",
    "thought": "Synthesizing three papers on cache eviction policies under skewed access patterns.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "sources": [
      { "id": "s1", "title": "LFU under Zipfian workloads", "authors": ["Chen"], "year": 2019, "relevance": 0.9 },
      { "id": "s2", "title": "Adaptive replacement cache", "authors": ["Megiddo", "Modha"], "year": 2003, "relevance": 0.8 }
    ],
    "themes": [
      { "id": "t1", "name": "Access-pattern awareness", "sourceIds": ["s1", "s2"], "strength": 0.85, "consensus": "strong" }
    ],
    "gaps": [
      { "id": "g1", "description": "No study covers mixed read/write skew under multi-tenant load", "type": "empirical", "importance": "significant" }
    ]
  }
}
```

### Example — argumentation

```json
{
  "name": "deepthinking_academic",
  "arguments": {
    "mode": "argumentation",
    "thought": "Arguing that the migration should proceed despite short-term risk.",
    "thoughtNumber": 1,
    "totalThoughts": 1,
    "nextThoughtNeeded": false,
    "claims": [{ "id": "c1", "statement": "The migration should proceed this quarter.", "type": "policy", "strength": "moderate" }],
    "grounds": [{ "id": "gr1", "content": "Current system fails under load 3x/month.", "type": "empirical", "reliability": 0.9 }],
    "warrants": [{ "id": "w1", "statement": "Repeated production failures justify near-term remediation.", "type": "causal", "groundsIds": ["gr1"], "claimId": "c1" }],
    "rebuttals": [{ "id": "r1", "objection": "Migration itself risks an outage.", "strength": "moderate", "response": "Mitigated by a staged rollout with rollback." }],
    "argumentStrength": 0.72
  }
}
```

---

## deepthinking_session

Session lifecycle and export management. Unlike the reasoning-mode tools above, this tool does not
carry the [shared thought fields](#shared-thought-fields) — it operates on an existing session by
ID.

### Input schema

| Field | Type | Required | Description |
|---|---|---|---|
| `action` | `"summarize" \| "export" \| "export_all" \| "get_session" \| "switch_mode" \| "recommend_mode" \| "delete_session"` | **Yes** | Session action to perform. |
| `sessionId` | string | Depends on action | Required for every action except `recommend_mode`. |
| `exportFormat` | string | No | Export format for `export` action. One of the [export formats](#export-formats). |
| `exportProfile` | string | No | Pre-configured export bundle for `export`/`export_all`: `academic`, `presentation`, `documentation`, `archive`, `minimal`. See [Export formats](#export-formats). |
| `includeContent` | boolean | No | For `export_all`: include full export content in the response instead of just a summary. |
| `outputDir` | string | No | Output directory for file export (`export`/`export_all`). When provided, exports write to files instead of returning content inline; a session subdirectory is created automatically. Server-side sandboxed against `MCP_EXPORT_PATH` — a path that escapes the sandbox is rejected. |
| `overwrite` | boolean | No | Overwrite existing files when exporting to `outputDir`. Default `false`. |
| `newMode` | string | No | New thinking mode, for `switch_mode`. |
| `problemType` | string | No | Quick problem type for `recommend_mode`'s fast path. |
| `problemCharacteristics` | object | No | Detailed problem characteristics for `recommend_mode`'s comprehensive path. All 10 sub-fields required if the object is present: `domain: string`, `complexity`/`uncertainty: "low" \| "medium" \| "high"`, and seven booleans — `timeDependent`, `multiAgent`, `requiresProof`, `requiresQuantification`, `hasIncompleteInfo`, `requiresExplanation`, `hasAlternatives`. |
| `includeCombinations` | boolean | No | For `recommend_mode`: also include recommended mode *combinations*, not just single modes. |

`additionalProperties` is `false`.

### Actions

#### `summarize`

Requires `sessionId`. Returns a plain-text summary as `content[0].text` (not JSON — this is the one
session action whose response is human-readable prose, not a JSON-encoded object).

#### `export`

Requires `sessionId`. Exports the session in one format (`exportFormat`, default `json`) or, if
`exportProfile` is given, in the profile's bundle of formats. See [Export
formats](#export-formats) for the full behavior matrix, including the `outputDir` file-writing path.

Return shape (single format, content mode — the default):

```jsonc
{ "type": "text", "text": "<the exported content in the requested format>" }
```

With `exportProfile` set (content mode), `content[0].text` is JSON:

```jsonc
{
  "profile": { "id": "academic", "name": "...", "description": "...", "options": { /* ... */ } },
  "summary": { "totalFormats": 3, "successful": 3, "failed": 0 },
  "exports": [
    { "format": "latex", "success": true, "content": "..." },
    { "format": "mermaid", "success": true, "content": "..." },
    { "format": "json", "success": true, "content": "..." }
  ]
}
```

With `outputDir` set (file mode), `content[0].text` is JSON describing what was written to disk
instead of content:

```jsonc
{
  "mode": "file",
  "format": "markdown",          // single-format export
  "path": "/exports/<sessionId>/session.md",
  "success": true,
  "size": 4213,
  "error": null
}
```

(a profile export in file mode nests the same per-format result objects under `files: []`,
alongside `outputDir`, `successCount`, `failureCount`, `totalSize`).

#### `export_all`

Requires `sessionId`. Exports the session in all 8 base formats, or the formats in `exportProfile`
if given. Returns a summary by default:

```jsonc
{
  "sessionId": "a1b2c3d4-...",
  "totalFormats": 8,
  "successCount": 8,
  "failureCount": 0,
  "results": [
    { "format": "markdown", "success": true, "size": 2048, "error": null },
    { "format": "latex", "success": true, "size": 3102, "error": null }
    // ... one entry per format
  ]
}
```

Set `includeContent: true` to also get every export's full content inline, added as an `exports`
object keyed by format name. Set `outputDir` to write files instead — the response then reports
`outputDir`, `successCount`, `failureCount`, `totalSize`, `exportedAt`, and a `files[]` array of
per-format write results, the same shape used by `export`'s file mode.

#### `get_session`

Requires `sessionId`. Returns session metadata:

```jsonc
{
  "id": "a1b2c3d4-...",
  "title": "Thinking Session 2026-08-05T12:00:00.000Z",
  "mode": "hybrid",
  "thoughtCount": 7,
  "isComplete": false,
  "metrics": { /* session metrics, including a customMetrics object */ }
}
```

#### `switch_mode`

Requires `sessionId` and `newMode`. Returns a plain-text confirmation as `content[0].text`, e.g.
`"Switched session a1b2c3d4-... to bayesian mode"` — also not JSON.

#### `recommend_mode`

Requires either `problemType` (fast path) or `problemCharacteristics` (comprehensive path); neither
requires `sessionId`. Returns Markdown-formatted text (not JSON) as `content[0].text`: the fast path
returns a one-line recommendation, the comprehensive path returns a `# Mode Recommendations` section
per candidate mode (score, reasoning, strengths, limitations, examples), plus a `## Recommended Mode
Combinations` section when `includeCombinations: true`.

#### `delete_session`

Requires `sessionId`. Deletes the session; throws if it does not exist. Returns a plain-text
confirmation as `content[0].text`, e.g. `"Session a1b2c3d4-... deleted successfully"`.

### Example — export with a profile

```json
{
  "name": "deepthinking_session",
  "arguments": {
    "action": "export",
    "sessionId": "a1b2c3d4-...",
    "exportProfile": "documentation"
  }
}
```

### Example — recommend_mode

```json
{
  "name": "deepthinking_session",
  "arguments": {
    "action": "recommend_mode",
    "problemCharacteristics": {
      "domain": "distributed systems debugging",
      "complexity": "high",
      "uncertainty": "medium",
      "timeDependent": true,
      "multiAgent": false,
      "requiresProof": false,
      "requiresQuantification": true,
      "hasIncompleteInfo": true,
      "requiresExplanation": true,
      "hasAlternatives": true
    },
    "includeCombinations": true
  }
}
```

---

## deepthinking_analyze

Multi-mode reasoning analysis: runs 2–10 reasoning modes on the same thought in parallel, merges
their insights with a chosen strategy, and returns a synthesized conclusion. Unlike the other
add-thought tools, it does not accept `thoughtNumber` / `totalThoughts` / `nextThoughtNeeded` — one
call runs a complete analysis.

### Input schema

| Field | Type | Required | Description |
|---|---|---|---|
| `thought` | string | **Yes** | The thought, problem, or question to analyze. Non-empty, `ThoughtTextSchema` (≤ 100,000 chars). |
| `preset` | string | No | Pre-defined mode combination. One of `comprehensive_analysis`, `hypothesis_testing`, `decision_making`, `root_cause`, `future_planning`. See [Presets](#presets) below. |
| `customModes` | string[] | No | Custom mode selection, overrides `preset` when present. 2–10 items, each one of the 29 mode names listed in the [mode enum](#custommodes-enum-values) below. |
| `mergeStrategy` | string | No | `union` (combine all, dedupe), `intersection` (only insights agreed by all modes), `weighted` (weight by confidence/importance), `hierarchical` (primary mode + supporting evidence), or `dialectical` (thesis–antithesis–synthesis). Default `union`. |
| `sessionId` | string | No | Existing session to associate the analysis with. `IdSchema`-bounded (≤ 1,000 chars) in the Zod validator (the JSON Schema does not state a bound). |
| `context` | string | No | Additional context or background for the analysis. `TextSchema` (≤ 10,000 chars). |
| `timeoutPerMode` | integer | No | Maximum milliseconds per mode. 1,000–120,000, default 30,000. |

`additionalProperties` is `false`. Neither `preset` nor `customModes` is required — if both are
omitted, the analyzer's own default mode set applies (not documented in the schema; supply one of
the two explicitly for predictable behavior).

#### `customModes` enum values

`sequential`, `shannon`, `mathematics`, `physics`, `hybrid`, `inductive`, `deductive`, `abductive`,
`causal`, `bayesian`, `counterfactual`, `temporal`, `gametheory`, `evidential`, `analogical`,
`firstprinciples`, `systemsthinking`, `scientificmethod`, `formallogic`, `optimization`,
`engineering`, `computability`, `cryptanalytic`, `algorithmic`, `synthesis`, `argumentation`,
`critique`, `analysis`, `metareasoning`.

### Presets

Preset mode lists and default merge strategies live in `PRESETS` (the analyzer's preset table), not
in the tool schema itself — a client cannot introspect them via `tools/list`; they are reproduced
here from source.

| Preset | Modes run (in order) | Default `mergeStrategy` | Purpose |
|---|---|---|---|
| `comprehensive_analysis` | deductive, inductive, abductive, systemsthinking, firstprinciples | `weighted` | Thorough multi-perspective analysis. |
| `hypothesis_testing` | scientificmethod, bayesian, evidential, deductive | `hierarchical` (primary: scientificmethod) | Evidence-based hypothesis evaluation; updating beliefs from new data. |
| `decision_making` | gametheory, optimization, counterfactual, bayesian | `weighted` | Strategic decision analysis with competing considerations. |
| `root_cause` | causal, systemsthinking, firstprinciples, abductive | `hierarchical` (primary: causal) | Diagnosing problems; understanding causal chains. |
| `future_planning` | temporal, counterfactual, bayesian, optimization | `dialectical` (thesis: temporal, antithesis: counterfactual) | Scenario analysis and forecasting. |

A `mergeStrategy` passed explicitly in the request overrides the preset's default.

### Returns

```jsonc
{
  "success": true,
  "sessionId": "a1b2c3d4-...",          // a new session created to hold the analysis
  "analysisId": "analysis-...",
  "modesUsed": 5,
  "contributingModes": ["deductive", "inductive", "abductive", "systemsthinking", "firstprinciples"],
  "synthesizedConclusion": "...",
  "confidenceScore": 0.78,
  "primaryInsights": [
    { "id": "i1", "content": "...", "sourceMode": "deductive", "confidence": 0.8, "category": "...", "priority": 1 }
  ],
  "conflictsDetected": 1,
  "conflictsResolved": 1,
  "mergeStrategy": "union",
  "executionTime": 842,
  "errors": [],                          // present only if a mode errored; { mode, message, recoverable }[]
  "statistics": {
    "totalInsightsBefore": 12,
    "totalInsightsAfter": 9,
    "duplicatesRemoved": 3,
    "averageConfidence": 0.74,
    "mergeTime": 15
  },
  "exportable": true,
  "exportHint": "Use deepthinking_session with action: 'export', sessionId: 'a1b2c3d4-...' to export results"
}
```

`deepthinking_analyze` always creates a new session (mode `hybrid`) to hold a single summarizing
thought, even when `sessionId` was supplied to associate the run with an existing session — the
returned `sessionId` is this new session, exportable via `deepthinking_session`'s `export` action as
`exportHint` states.

### Example

```json
{
  "name": "deepthinking_analyze",
  "arguments": {
    "thought": "Our checkout conversion rate dropped 8% after last week's deploy. What's the root cause and what should we do?",
    "preset": "root_cause",
    "mergeStrategy": "weighted",
    "context": "Deploy included a payment-provider SDK bump and a new address-autocomplete widget.",
    "timeoutPerMode": 20000
  }
}
```

---

## Export formats

`deepthinking_session`'s `export` and `export_all` actions accept a single `exportFormat` value
from `ExportFormatEnum` (the 8 base formats), or an `exportProfile` bundle of several formats at
once.

### Base formats (`exportFormat`)

`markdown`, `latex`, `json`, `html`, `jupyter`, `mermaid`, `dot`, `ascii`.

By default a single-format export returns content inline as `content[0].text` (a plain string in
that format, not further JSON-wrapped). Set `outputDir` on the request to write the export to a
file instead — the response then reports `{ mode: "file", format, path, success, size, error }`
rather than the raw content.

### Export profiles (`exportProfile`)

A profile bundles several formats into one call, verified against `src/export/profiles.ts`:

| Profile | Formats | Notes |
|---|---|---|
| `academic` | `latex`, `markdown`, `json` | Optimized for papers and publications. |
| `presentation` | `mermaid`, `svg`, `markdown` | `svg` is unconditionally filtered out before export runs (see below) — the formats actually produced are `mermaid` and `markdown`. |
| `documentation` | `markdown`, `mermaid`, `ascii` | |
| `archive` | `json`, `markdown`, `latex`, `jupyter` | Despite the name, this is **not** all 8 base formats — `html`, `mermaid`, `dot`, and `ascii` are absent. |
| `minimal` | `json`, `markdown` | |

The tool's own `tools/list` description text (`"academic: LaTeX+Mermaid+JSON, presentation:
Mermaid+HTML+ASCII, documentation: Markdown+HTML+JSON, archive: all formats, minimal:
Markdown+JSON"`) does not match the formats each profile actually exports in
`src/export/profiles.ts`; trust the table above, sourced from the profile definitions, over the
advertised description.

**`svg` is never actually produced by a profile export.** Every code path that expands a profile to
its format list (`handleExport` and `handleExportAll` in content mode, and both in file mode)
explicitly filters out or skips `"svg"` before exporting, regardless of whether the chosen profile
lists it. `svg` also does not appear in `ExportFormatEnum`, so it cannot be requested via a plain
`exportFormat` either — there is no way to get an SVG out of `deepthinking_session`'s export
actions.

Profile export in content mode returns:

```jsonc
{
  "profile": { "id": "academic", "name": "Academic", "description": "...", "options": { /* ... */ } },
  "summary": { "totalFormats": 3, "successful": 3, "failed": 0 },
  "exports": [
    { "format": "latex", "success": true, "content": "..." },
    { "format": "markdown", "success": true, "content": "..." },
    { "format": "json", "success": true, "content": "..." }
  ]
}
```

Profile export with `outputDir` set writes one file per format under a session subdirectory and
returns `{ mode: "file", profile, outputDir, successCount, failureCount, totalSize, files: [...] }`.

---

## The legacy `deepthinking` tool

`deepthinking` is a single monolithic tool that predates the 13 focused tools. It is **hidden from
`tools/list`** — a client that only discovers tools by listing will never see it — but its
`CallToolRequest` handler is still registered, so a client that already hardcodes the tool name
continues to work.

Every call through the legacy tool prepends a deprecation warning to the response text:

```
⚠️ DEPRECATED: The "deepthinking" tool is deprecated. Use the focused tools instead:
deepthinking_core, deepthinking_mathematics, deepthinking_temporal, deepthinking_probabilistic,
deepthinking_causal, deepthinking_strategic, deepthinking_analytical, deepthinking_scientific,
deepthinking_session. See docs/migration/v4.0-tool-splitting.md for details.
```

(the warning's own list of tool names is itself stale — it predates `deepthinking_engineering`,
`deepthinking_academic`, and `deepthinking_analyze`; migrate to whichever of the 13 focused tools
matches your mode per `modeToToolMap` below, not just the tools the warning happens to name.)

### Input shape

The legacy tool takes an `action` field (`add_thought`, `summarize`, `export`, `switch_mode`,
`get_session`, `recommend_mode`) plus a `mode` field (any of the 29 reasoning modes) and the union
of every mode-specific field across all 13 focused tools, validated by `ThinkingToolSchema` in
`src/tools/thinking.ts`. That schema is bounded to the same string/array/record limits described in
[Input limits](#input-limits) — arrays were the last gap closed here, so the legacy tool cannot be
used to bypass the caps that apply to the focused tools.

### Migrating off the legacy tool

For `action: "add_thought"`, the server dispatches internally via `modeToToolMap[mode]` to resolve
which of the 13 focused tools owns that mode — the same mapping documented in each tool's mode list
above (`deepthinking_core` owns inductive/deductive/abductive, `deepthinking_mathematics` owns
mathematics/physics/computability, and so on). Call that focused tool directly instead: same field
names, same validation, no deprecation warning, and it appears in `tools/list`.

For `action: "summarize" | "export" | "switch_mode" | "get_session" | "recommend_mode"`, call
`deepthinking_session` with the matching `action` value directly.

---

## Input limits

Every free-text string, array, and record across all 13 tools is bounded. The concrete numbers
(`MAX_LENGTHS` in `src/utils/sanitization.ts`, referenced from `src/tools/schemas/shared.ts`):

| Constant | Value | Used for |
|---|---|---|
| `THOUGHT_CONTENT` | 100,000 chars | The `thought` field itself (`ThoughtTextSchema`), and `deepthinking_analyze`'s `thought`. |
| `DESCRIPTION` | 10,000 chars | Free-text content — descriptions, explanations, justifications, statements (`TextSchema`). |
| `TITLE` | 500 chars | Names/titles/labels (`NameSchema`). |
| `STRING_FIELD` | 1,000 chars | Short identifiers/enum-like strings — ids, `from`/`to`, node refs (`IdSchema`). Session IDs use the narrower `SESSION_ID` below. |
| `DOMAIN` | 200 chars | Bounds `SessionManager.createSession()`'s internal `domain` option, not any MCP tool field — no tool's input schema exposes a `domain` argument that reaches it. |
| `AUTHOR` | 300 chars | Bounds `SessionManager.createSession()`'s internal `author` option, same as `DOMAIN` above — not reachable from any tool input. Author-name fields exposed via tools (e.g. `deepthinking_academic`'s `SourceSchema.authors`) use `IdArraySchema` instead. |
| `SESSION_ID` | 100 chars | The `sessionId` request field on every tool — the 13 focused tools (`SessionIdSchema`), `deepthinking_analyze`, and the legacy `deepthinking` tool. A session ID is always a UUID v4 (36 chars); `validateSessionId()` rejects any other shape once the value reaches `SessionManager`. |
| `ARRAY_ITEMS` | 1,000 items | Default cap for arrays of primitive strings (evidence, tags, dependencies, and similar). |
| `NESTED_ARRAY_ITEMS` | 500 items | Cap for arrays of structured objects (hypotheses, sources, proof steps, and similar) — heavier per element, so capped lower. |

Records (objects with caller-controlled keys, e.g. `massFunction`, `weights`, `variables`,
`properties`) are capped at entry count via `boundedRecord()`, defaulting to `ARRAY_ITEMS` (1,000
entries) unless a schema passes a different cap explicitly. No schema in `src/tools/schemas/**`
currently passes a non-default cap to `boundedRecord()` (verified by grep) — every bounded record in
this document is capped at 1,000 entries.

A request that exceeds any of these bounds fails Zod validation before any handler logic runs, and
the call returns the [standard error shape](#error-shape) with a Zod-generated message describing
which field and limit were violated.

---

## npm package surface

The published package is `deepthinking-mcp`. Its `package.json` declares `"main": "./dist/index.js"`
and no `exports` map — Node resolves any `import`/`require` of the package to that single file.

`dist/index.js` is the compiled form of `src/index.ts`: it starts the MCP server over stdio (calls
`server.connect(transport)` and registers the `CallToolRequestSchema` handler) as its top-level
side effect. **It is not designed to be imported as a library.** `src/index.ts` exports no public
functions, classes, or types intended for a consumer to import and call — it is a runnable entry
point, not an API module. `npm install deepthinking-mcp` gets you a package whose only meaningful
use is running it as a server process (directly with `node`, or via `npx deepthinking-mcp`), not
importing individual pieces of it into another Node program.

A consumer who wants programmatic access to a specific reasoning capability (a mode handler, an
exporter, a builder class) would need to import from the package's internal module paths under
`dist/` directly — unsupported by the `main`-only `package.json`, since there is no `exports` map
declaring which subpaths are public, and those internal modules are not designed or documented as a
stable import surface.

The one genuinely public surface is the **MCP tool protocol itself** — the 13 tools documented
above, reachable by any MCP client that spawns the package's binary and speaks the protocol over
stdio. That is the API this document describes.

---

## Source-verified facts

This document is **source-verified, not graph-derived**. Tool count, field names, required/optional
status, enum values and numeric bounds all come from reading the schema files directly. Every field
and bound cited above traces to a specific source file, named at the claim and listed under
[Source of truth](#source-of-truth).

| Fact | Value | Verified against |
|---|---|---|
| MCP tools listed via `tools/list` | 13 | `src/tools/json-schemas.ts` — `jsonSchemas` array |
| Legacy tools callable but hidden | 1 (`deepthinking`) | `src/index.ts` — `CallToolRequestSchema` handler |
| `deepthinking_analyze` presets | 5 | `src/modes/combinations/presets.ts` — `PRESETS` |
| `deepthinking_analyze` merge strategies | 5 | `src/tools/schemas/shared.ts` |
| `deepthinking_session` actions | 7 | `src/tools/schemas/shared.ts` — `SessionActionEnum` |
| Export formats accepted by the API | 8 | `src/tools/schemas/shared.ts` — `ExportFormatEnum` |
| Export profiles | 5 | `src/export/profiles.ts` |

These are **not** in the Verification block below, and that is deliberate: the drift gate checks
graph metrics only. A claim it cannot check must not be dressed up as one it can. Re-verify these
by reading the named file — no automated check will catch it for you when a schema changes.

## Verification

Generated 2026-08-05 by `repo_map.py map`.
Check: `python repo_map.py check <repo> --docs docs/Architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 457 | dependency-graph.json |
