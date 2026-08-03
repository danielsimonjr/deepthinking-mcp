# First Principles Thought — Output Format

Reasoning built from foundational truths upward — decomposing to axioms and deriving conclusions without inherited assumptions.

## JSON Schema

```json
{
  "mode": "firstprinciples",
  "question": "<the fundamental question being asked>",
  "principles": [
    {
      "id": "p1",
      "type": "axiom|observation|definition|assumption",
      "statement": "<the principle itself>",
      "justification": "<why this is a valid foundation>",
      "dependsOn": ["<id of another principle, optional>"],
      "confidence": <number 0-1, for observations and assumptions>,
      "latex": "<optional LaTeX representation>"
    }
  ],
  "derivationSteps": [
    {
      "stepNumber": 1,
      "principle": "<id of principle applied>",
      "inference": "<what is derived by applying this principle>",
      "logicalForm": "<optional formal logic, e.g., 'A → B, A ∴ B'>",
      "confidence": <number 0-1>,
      "latex": "<optional LaTeX>"
    }
  ],
  "conclusion": {
    "statement": "<the final derived conclusion>",
    "derivationChain": [1, 2, 3],
    "certainty": <number 0-1>,
    "limitations": ["<known edge cases or scope restrictions>"],
    "latex": "<optional LaTeX>"
  },
  "alternativeInterpretations": ["<other valid readings of the same principles, optional>"]
}
```

## Required Fields

- `mode` — always `"firstprinciples"`
- `question` — the foundational question; should be phrased to invite decomposition, not just description
- `principles` — at least one foundational principle; mix of axioms, definitions, observations, and assumptions
- `derivationSteps` — the logical chain from principles to conclusion; each step cites a principle ID
- `conclusion` — the final derived statement with `derivationChain` listing the step numbers that lead to it

## Principle Types

| Type | Meaning | Confidence |
|------|---------|-----------|
| `axiom` | Self-evident truth requiring no justification | Omit — always 1.0 |
| `definition` | Agreed meaning of a term | Omit — definitional |
| `observation` | Empirically observed fact | Required — reflects measurement uncertainty |
| `assumption` | Contextual claim being taken as true for this derivation | Required — reflects how likely the assumption holds |

## Derivation Quality

A first-principles derivation fails if:
- Any step makes an inferential leap not supported by cited principles
- An "axiom" is actually a received convention that could be challenged
- The conclusion is restated from the question rather than derived from the steps
- Confidence in the conclusion is higher than the lowest-confidence principle in the derivation chain

## Worked Example

Input: "From first principles, what does 'authentication' actually require?"

```json
{
  "mode": "firstprinciples",
  "question": "From first principles, what does 'authentication' actually require?",
  "principles": [
    { "id": "p1", "type": "definition", "statement": "Authentication is the process of verifying that an entity is who it claims to be", "justification": "Standard definitional baseline" },
    { "id": "p2", "type": "axiom", "statement": "A verifier can only distinguish identities it has prior knowledge of", "justification": "Without prior record, confirmation is impossible" },
    { "id": "p3", "type": "axiom", "statement": "Proof of identity requires presenting something the verifier can check against stored knowledge", "justification": "Without a checkable artifact, the claim is unfalsifiable" },
    { "id": "p4", "type": "observation", "statement": "Verifiable artifacts fall into three categories: something you know, have, or are", "justification": "Exhaustive classification from identity literature", "confidence": 0.95 }
  ],
  "derivationSteps": [
    { "stepNumber": 1, "principle": "p1", "inference": "Authentication is a binary match/no-match decision", "confidence": 1.0 },
    { "stepNumber": 2, "principle": "p2", "inference": "Authentication requires prior enrollment — the verifier must hold a reference before the attempt", "confidence": 1.0 },
    { "stepNumber": 3, "principle": "p3", "inference": "The prover must present a checkable artifact", "logicalForm": "verify(claim) requires present(artifact) ∧ check(artifact, stored_reference)", "confidence": 1.0 },
    { "stepNumber": 4, "principle": "p4", "inference": "The artifact must be a secret, token, or biometric — any scheme is a combination of these", "confidence": 0.95 }
  ],
  "conclusion": {
    "statement": "Authentication minimally requires: (1) prior enrollment of a reference, (2) presentation of a checkable artifact in one of the three canonical categories, and (3) a freshness mechanism to prevent replay. Anything omitting these is accepting a claim on trust.",
    "derivationChain": [1, 2, 3, 4],
    "certainty": 0.92,
    "limitations": [
      "Physical presence proofs bypass the replay concern but are outside network protocol scope",
      "Zero-knowledge proofs satisfy these requirements without revealing identity"
    ]
  }
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"firstprinciples"`
- `question` is framed to invite decomposition, not just description
- Every principle has an `id` referenced in at least one `derivationSteps[*].principle`
- Every `derivationSteps[*].principle` references a real principle `id`
- `conclusion.derivationChain` lists step numbers that actually chain to the conclusion
- `conclusion.certainty` does not exceed the lowest `confidence` in the cited principles
- Any principle labeled `axiom` is genuinely self-evident, not a convention that could be questioned
- `limitations` is present in the conclusion — first-principles conclusions always have scope boundaries
