# Mathematics Thought — Output Format

Formal mathematical reasoning: proof construction, theorem verification, and symbolic computation.

## JSON Schema

```json
{
  "mode": "mathematics",
  "thoughtType": "<theorem_statement|proof_construction|gap_identification|symbolic_computation|model_definition|assumption_analysis|consistency_check>",
  "theorems": [
    {
      "name": "<theorem name>",
      "statement": "<full formal statement>",
      "hypotheses": ["<hypothesis 1>", "<hypothesis 2>"],
      "conclusion": "<what is to be proved>"
    }
  ],
  "proofStrategy": {
    "type": "<direct|contradiction|induction|contrapositive|construction|exhaustion>",
    "steps": ["<step 1>", "<step 2>", "..."],
    "completeness": <number 0-1>
  },
  "logicalForm": {
    "premises": ["<premise 1>"],
    "conclusion": "<derived conclusion>",
    "inferenceRule": "<proof_by_contradiction|modus_ponens|induction|...>",
    "rules": ["<rule or theorem applied>"]
  },
  "gapAnalysis": {
    "completeness": <number 0-1>,
    "gaps": [
      {
        "id": "<gap_id>",
        "type": "<missing_step|unjustified_leap|implicit_assumption|undefined_term|scope_error>",
        "location": { "from": "<step id>", "to": "<step id>" },
        "description": "<description of the gap>",
        "severity": "<minor|major|critical>",
        "suggestedFix": "<how to address the gap>"
      }
    ],
    "implicitAssumptions": [
      {
        "id": "<assumption_id>",
        "statement": "<the implicit assumption>",
        "type": "<domain_assumption|existence_assumption|uniqueness_assumption|continuity_assumption|finiteness_assumption|well_ordering>",
        "usedInStep": "<where it is needed>",
        "shouldBeExplicit": <true|false>,
        "suggestedFormulation": "<how to state it explicitly>"
      }
    ],
    "unjustifiedSteps": ["<step description>"],
    "suggestions": ["<suggestion to improve rigor>"]
  },
  "dependencies": ["<named theorem, definition, or prior result>"],
  "assumptions": ["<explicit assumption>"],
  "uncertainty": <number 0-1>,
  "references": ["<optional citation>"]
}
```

## Required Fields

- `mode` — always `"mathematics"`
- `thoughtType` — the type of reasoning step
- `dependencies` — every theorem, definition, or lemma the argument relies on
- `assumptions` — explicit assumptions (do not leave them implicit)
- `uncertainty` — strength of proof in [0, 1]; near 0 for fully rigorous, higher when informal

## Proof Strategy Types

| Type | When to use |
|------|-------------|
| `direct` | Chain of implications from hypotheses to conclusion |
| `contradiction` | Assume negation, derive logical impossibility |
| `induction` | Base case + inductive step for integer-indexed claims |
| `contrapositive` | Prove ¬Q → ¬P instead of P → Q |
| `construction` | Exhibit an object satisfying the required properties |
| `exhaustion` | Check all cases when the case set is finite |

## Worked Example

Input: "Prove that √2 is irrational."

Output:

```json
{
  "mode": "mathematics",
  "thoughtType": "proof_construction",
  "theorems": [
    {
      "name": "Irrationality of √2",
      "statement": "The square root of 2 is not a rational number",
      "hypotheses": ["√2 = p/q with gcd(p, q) = 1 for integers p, q, q ≠ 0"],
      "conclusion": "The hypothesis leads to a contradiction; therefore √2 ∉ ℚ"
    }
  ],
  "proofStrategy": {
    "type": "contradiction",
    "steps": [
      "Assume √2 = p/q in lowest terms (gcd(p,q) = 1)",
      "Square both sides: 2 = p²/q², so p² = 2q²",
      "p² is even; therefore p is even (parity lemma)",
      "Write p = 2k; substitute: 4k² = 2q², so q² = 2k²",
      "q² is even; therefore q is even",
      "Both p and q are even, contradicting gcd(p,q) = 1"
    ],
    "completeness": 0.97
  },
  "dependencies": [
    "definition of rational number",
    "parity lemma: n² even implies n even"
  ],
  "assumptions": [
    "integers are well-ordered",
    "every rational has a representation in lowest terms"
  ],
  "uncertainty": 0.03
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"mathematics"`
- `theorems` contains both `hypotheses` and `conclusion`
- `proofStrategy.type` is one of the six named types
- `proofStrategy.steps` is non-empty and each step is explicit
- `dependencies` names every theorem or definition relied upon
- `assumptions` makes all implicit assumptions explicit
- `uncertainty` is near 0 for fully rigorous proofs; increase when steps are informal or gaps remain
- If gaps exist, populate `gapAnalysis` or note them in the natural-language summary
