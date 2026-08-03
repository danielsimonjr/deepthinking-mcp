# 5 Whys Thought — Output Format

Drilling from a symptom to a single root cause by repeatedly asking "why."

## JSON Schema

```json
{
  "mode": "fivewhys",
  "problem": "<the observed problem/symptom>",
  "whys": [
    {
      "question": "<why did the previous answer happen?>",
      "answer": "<the answer at this level>"
    }
  ],
  "rootCause": "<the terminal root cause the chain converges on>",
  "correctiveAction": "<optional: the fix that addresses the root cause>"
}
```

## Required Fields

- `mode` — always `"fivewhys"`
- `problem` — the observed symptom that starts the chain
- `whys` — an ordered array of at least one `{question, answer}` pair. Each entry's `answer` should be the thing the *next* entry's `question` asks "why" about. Classically five entries, but the schema only requires `minItems: 1` — use as many as the chain genuinely needs to reach a process-level root cause, not exactly five for its own sake.
- `rootCause` — the terminal cause the chain converges on. Should be a systemic/process-level cause, not just a restatement of the last `answer` in weaker words.

## Optional Fields

- `correctiveAction` — the concrete fix that addresses `rootCause`. Omit if the analysis stops at diagnosis without a proposed fix.

## When to Use 5 Whys (vs. Fishbone)

5 Whys assumes a **single linear causal chain** converging on one root cause. If the investigation reveals multiple independent contributing categories (people, process, tools, environment) rather than one chain, use `fishbone` instead — attempting to force a multi-category cause structure into a single 5-Whys chain produces a chain that jumps between unrelated causes at each step.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"fivewhys"`
- `whys` has at least one entry
- Each `whys[i].answer` is genuinely different from `whys[i].question` — restating the question with different words is not an answer
- Each subsequent `whys[i+1].question` asks "why" about `whys[i].answer`, not about the original `problem` restated — the chain must actually be a chain, not five independent guesses at the same problem
- `rootCause` matches (or closely matches) the `answer` of the final entry in `whys`
- `rootCause` names a process/system-level cause, not a person ("the engineer made a mistake" is not a root cause — "no process caught the mistake before it shipped" is)
- If `correctiveAction` is present, it addresses `rootCause` directly, not an intermediate `why`

## Worked Example

Input: "The nightly ETL job failed to load yesterday's sales data. Find the root cause."

Output:

```json
{
  "mode": "fivewhys",
  "problem": "The nightly ETL job failed to load yesterday's sales data into the reporting warehouse",
  "whys": [
    {
      "question": "Why did the nightly ETL job fail to load yesterday's sales data?",
      "answer": "The load step threw a schema-mismatch error and the pipeline aborted before writing any rows"
    },
    {
      "question": "Why was there a schema mismatch?",
      "answer": "The upstream orders table gained a new nullable column (`discount_code`) that the ETL's strict column-count check did not expect"
    },
    {
      "question": "Why did the ETL have a strict column-count check that breaks on new columns?",
      "answer": "The ETL was written to validate schema by comparing an exact column count instead of validating by column name, as a shortcut during initial development"
    },
    {
      "question": "Why was a column-count check chosen instead of a column-name check?",
      "answer": "The original author prioritized shipping the pipeline quickly for a launch deadline and treated schema validation as a follow-up task that was never scheduled"
    },
    {
      "question": "Why was the schema-validation follow-up task never scheduled?",
      "answer": "There is no team process for tracking and prioritizing 'follow-up' technical debt items created during launch crunches — they are logged informally in Slack and not tracked in the backlog"
    }
  ],
  "rootCause": "The team has no process for converting launch-crunch shortcuts into tracked backlog items, so brittle validation logic (column-count instead of column-name) shipped and was never hardened",
  "correctiveAction": "Replace the ETL's column-count check with a column-name-based schema validation that tolerates additive nullable columns, and add a 'launch debt' label + mandatory backlog entry requirement to the team's post-launch checklist"
}
```

Note how the chain moves from a technical symptom (schema mismatch) through an implementation choice (column-count check) to a genuine process gap (no tracking for launch-crunch shortcuts) — the fifth why reaches a systemic cause, not a restatement of the fourth.
