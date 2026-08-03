# Sequential Thought — Output Format

General-purpose iterative reasoning with revision and branching support.

## JSON Schema

```json
{
  "mode": "sequential",
  "thoughtNumber": <integer ≥1>,
  "totalThoughts": <integer ≥1>,
  "content": "<the thought content as natural language>",
  "nextThoughtNeeded": <boolean>,
  "isRevision": <boolean, optional>,
  "revisesThought": "<id of the thought being revised, optional>",
  "revisionReason": "<why revising, optional>",
  "buildUpon": ["<thought id>", ...],
  "dependencies": ["<thought id>", ...],
  "branchFrom": "<thought id to branch from, optional>",
  "branchId": "<branch identifier, optional>",
  "needsMoreThoughts": <boolean, optional>
}
```

## Required Fields

- `mode` — always the literal string `"sequential"`
- `thoughtNumber` — 1-indexed position in the chain
- `totalThoughts` — total count (may grow as reasoning continues)
- `content` — the actual thought text
- `nextThoughtNeeded` — `true` if more thinking is required

## Worked Example

Input: "Break down the steps to migrate this database."

Output:

```json
{
  "mode": "sequential",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "content": "First, identify the three services involved in the migration: API, workers, and DB.",
  "nextThoughtNeeded": true,
  "dependencies": []
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"sequential"`
- `thoughtNumber` ≤ `totalThoughts`
- `content` is non-empty natural language
- `nextThoughtNeeded` is a boolean, not a string
- If `isRevision` is true, `revisesThought` must be set
