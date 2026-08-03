# Deductive Thought — Output Format

Reasoning from general principles to specific conclusions. Classic logical inference (modus ponens, modus tollens, syllogisms).

## JSON Schema

```json
{
  "mode": "deductive",
  "premises": ["<general principle 1>", "<general principle 2>", ...],
  "conclusion": "<the specific conclusion>",
  "logicForm": "<e.g., 'modus ponens', 'modus tollens', 'syllogism', optional>",
  "derivationSteps": [
    {
      "stepNumber": 1,
      "premisesUsed": [0, 1],
      "stepsUsed": [],
      "intermediateConclusion": "<fact derived at this step>",
      "inferenceRule": "<name of the inference rule applied>"
    }
  ],
  "validityCheck": <boolean>,
  "soundnessCheck": <boolean, optional>
}
```

## Required Fields

- `mode` — always `"deductive"`
- `premises` — at least one premise
- `conclusion` — the derived conclusion
- `validityCheck` — does the conclusion logically follow from the premises (true/false)?

## Optional Fields

- `logicForm` — the high-level name of the deduction's overall shape (e.g., `"modus ponens"`, `"hypothetical syllogism"`, `"repeated modus ponens"`). This is a one-line summary, not the full per-step breakdown.
- `soundnessCheck` — valid AND premises are actually true. Omit or set to `null` if the real-world truth of the premises cannot be verified.
- `derivationSteps` — multi-step derivation chain. Omit for single-jump conclusions; present for multi-step proofs. See "Multi-step derivations" below.

## Key Distinction: Validity vs Soundness

- **Valid** means: IF the premises are true, the conclusion must be true. Validity is about logical form.
- **Sound** means: valid AND the premises are actually true. Soundness is about real-world truth.

## Multi-step derivations (`derivationSteps[]`)

For deductions that require multiple intermediate inferences, populate `derivationSteps[]` with one entry per step in the chain. Each step has:

- **`stepNumber`** — 1-indexed position in the chain. Sequential and unique within the array (1, 2, 3, ...).
- **`premisesUsed`** — 0-indexed integer references into the top-level `premises[]` array (e.g., `[0, 2]` means "this step uses `premises[0]` and `premises[2]`"). May be empty if the step uses only prior steps.
- **`stepsUsed`** — references to prior `stepNumber` values (e.g., `[1, 2]` means "this step uses the `intermediateConclusion` from step 1 and step 2"). No forward references — step 3 can reference 1 or 2, never 4 or 5.
- **`intermediateConclusion`** — the fact derived at this step. For the final step, this should match (or very closely match) the top-level `conclusion`.
- **`inferenceRule`** — name of the classical inference rule applied (free-text: `"modus ponens"`, `"modus tollens"`, `"hypothetical syllogism"`, `"disjunctive syllogism"`, `"universal instantiation"`, `"reductio ad absurdum"`, etc.). The field is free-text in v0.5.2; a future release may tighten it to an enum.

**When to use `derivationSteps[]`:**

- The deduction requires ≥2 distinct inferences to get from premises to conclusion
- The chain would be opaque or error-prone as a single premises-to-conclusion jump
- A reader auditing the proof would benefit from seeing the intermediate claims
- You want to explicitly label which inference rule is applied at each step

**When to omit `derivationSteps[]`:**

- The deduction is a single inference step (e.g., one modus ponens, one syllogism)
- The intermediate conclusions are trivial or self-evident from the premises
- Adding the array would be boilerplate without adding audit value

## Worked Example — single-step deduction (no `derivationSteps`)

Input: "If all users in the admin group can edit posts, and Alice is in the admin group, can Alice edit posts?"

Output:

```json
{
  "mode": "deductive",
  "premises": [
    "All users in the admin group can edit posts",
    "Alice is in the admin group"
  ],
  "conclusion": "Alice can edit posts",
  "logicForm": "modus ponens",
  "validityCheck": true,
  "soundnessCheck": true
}
```

This is a single modus ponens — one inference step. `derivationSteps` is omitted because the derivation is atomic.

## Worked Example — multi-step deduction (with `derivationSteps`)

Input: "If any request that fails authentication must be logged to the audit trail, and any audit-trail entry must trigger an alert, and request R failed authentication — must request R trigger an alert?"

Output:

```json
{
  "mode": "deductive",
  "premises": [
    "Any request that fails authentication must be logged to the audit trail",
    "Any audit-trail entry must trigger an alert",
    "Request R failed authentication"
  ],
  "conclusion": "Request R must trigger an alert",
  "logicForm": "repeated modus ponens",
  "derivationSteps": [
    {
      "stepNumber": 1,
      "premisesUsed": [0, 2],
      "stepsUsed": [],
      "intermediateConclusion": "Request R must be logged to the audit trail",
      "inferenceRule": "modus ponens"
    },
    {
      "stepNumber": 2,
      "premisesUsed": [1],
      "stepsUsed": [1],
      "intermediateConclusion": "Request R must trigger an alert",
      "inferenceRule": "modus ponens"
    }
  ],
  "validityCheck": true,
  "soundnessCheck": true
}
```

The chain shows two applications of modus ponens. Step 1 combines premises 0 and 2 to derive the intermediate fact "R must be logged." Step 2 then combines premise 1 with the step-1 result to derive the final conclusion. The final step's `intermediateConclusion` matches the top-level `conclusion` — that is the convention.

## Verification Checklist

Before emitting, verify:

- `mode` is exactly `"deductive"`
- `premises` has at least 1 entry
- `validityCheck` reflects whether the conclusion *necessarily* follows (not whether it's plausible)
- If you cannot verify premises are true in the real world, omit `soundnessCheck` or set it to the user's stated assumption
- If you include `derivationSteps[]`:
  - Step numbers are sequential and unique (1, 2, 3, ...)
  - `stepsUsed[]` on step N only references step numbers < N (no forward references)
  - `premisesUsed[]` indices are all valid (< length of `premises[]`)
  - The final step's `intermediateConclusion` matches (or closely matches) the top-level `conclusion`
