# Formal Logic Thought — Output Format

Rigorous logical reasoning using explicit proof steps, each justified by a named inference rule. Produces proofs that can be mechanically checked — not just persuasive arguments.

## JSON Schema

```json
{
  "mode": "formallogic",
  "theorem": "<the statement to be proved>",
  "propositions": [
    {
      "id": "<unique identifier>",
      "symbol": "<logical symbol, e.g., P, Q, P→Q>",
      "statement": "<natural-language meaning>",
      "type": "atomic | compound",
      "formula": "<symbolic formula for compound propositions, optional>",
      "latex": "<LaTeX rendering, optional>"
    }
  ],
  "proof": {
    "technique": "direct | conditional | contradiction | induction",
    "steps": [
      {
        "step": <integer starting at 1>,
        "statement": "<logical statement in natural language>",
        "formula": "<symbolic formula, optional>",
        "justification": "Premise | Assumption | <inference rule name>",
        "refs": [<prior step numbers used>]
      }
    ],
    "conclusion": "<the final proved statement>",
    "valid": true
  },
  "validityCheck": true,
  "soundnessCheck": true | false | null
}
```

## Required Fields

- `mode` — always `"formallogic"`
- `theorem` — the statement being proved
- `propositions` — at least one; defines the atomic and compound propositions used in the proof
- `proof` — the proof object with `technique`, `steps`, `conclusion`, and `valid`
- `proof.steps` — at least one step; each step requires `step`, `statement`, `justification`, and `refs`
- `validityCheck` — `true` if every step follows from prior steps by a valid inference rule

## Optional Fields

- `proof.steps[*].formula` — symbolic formula for precision; strongly recommended
- `proof.steps[*].formula` using standard notation: ¬ (not), ∧ (and), ∨ (or), → (implies), ↔ (iff), ∀ (for all), ∃ (there exists)
- `soundnessCheck` — `true` if valid AND all premises are actually true; `false` if a premise is false; `null` if premise truth cannot be determined

## Validity vs. Soundness

**Validity** is structural: does the conclusion follow from the premises by correct inference rules?

**Soundness** requires validity PLUS true premises. Only sound arguments guarantee true conclusions.

A proof can be valid but unsound — the logical form is correct but a premise is false. Always distinguish the two.

## Key Inference Rules

| Rule | Notation | Description |
|------|----------|-------------|
| Modus Ponens | P, P→Q ⊢ Q | From P and P→Q, derive Q |
| Modus Tollens | ¬Q, P→Q ⊢ ¬P | From ¬Q and P→Q, derive ¬P |
| Hypothetical Syllogism | P→Q, Q→R ⊢ P→R | Chain two conditionals |
| Simplification | P∧Q ⊢ P | Extract from conjunction |
| Conjunction Introduction | P, Q ⊢ P∧Q | Combine into conjunction |
| Addition | P ⊢ P∨Q | Extend to disjunction |
| Disjunctive Syllogism | P∨Q, ¬P ⊢ Q | Eliminate one disjunct |
| Conditional Proof | [Assume P … Q] ⊢ P→Q | Introduce a conditional |
| Reductio ad Absurdum | [Assume ¬P … ⊥] ⊢ P | Proof by contradiction |

## Proof Techniques

| Technique | When to Use |
|-----------|------------|
| `direct` | Apply inference rules directly from premises to conclusion |
| `conditional` | Assume antecedent P, derive consequent Q, conclude P→Q |
| `contradiction` | Assume ¬P, derive a contradiction, conclude P |
| `induction` | Prove base case + inductive step; for propositions over integers |

## Worked Example

Input: "Prove Modus Tollens: given P→Q and ¬Q, derive ¬P."

```json
{
  "mode": "formallogic",
  "theorem": "¬P  (given P→Q and ¬Q)",
  "propositions": [
    { "id": "P", "symbol": "P", "statement": "The service is running", "type": "atomic" },
    { "id": "Q", "symbol": "Q", "statement": "The health check endpoint returns 200", "type": "atomic" },
    {
      "id": "PQ",
      "symbol": "P→Q",
      "statement": "If the service is running, the health check returns 200",
      "type": "compound",
      "formula": "P → Q",
      "latex": "P \\rightarrow Q"
    },
    {
      "id": "notQ",
      "symbol": "¬Q",
      "statement": "The health check does NOT return 200",
      "type": "compound",
      "formula": "¬Q",
      "latex": "\\neg Q"
    }
  ],
  "proof": {
    "technique": "direct",
    "steps": [
      {
        "step": 1,
        "statement": "P → Q",
        "formula": "P → Q",
        "justification": "Premise",
        "refs": []
      },
      {
        "step": 2,
        "statement": "¬Q",
        "formula": "¬Q",
        "justification": "Premise",
        "refs": []
      },
      {
        "step": 3,
        "statement": "¬P",
        "formula": "¬P",
        "justification": "Modus Tollens",
        "refs": [1, 2]
      }
    ],
    "conclusion": "¬P — The service is NOT running",
    "valid": true
  },
  "validityCheck": true,
  "soundnessCheck": null
}
```

Natural-language summary: "This is a direct three-step proof. Step 3 applies Modus Tollens: given P→Q and ¬Q, we derive ¬P by contrapositive. The proof is valid. Soundness depends on whether the premises hold in reality — specifically whether our health check contract (P→Q) is reliable. If the service can run while the health check fails for other reasons, the premise P→Q is false and the argument is unsound."

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"formallogic"`
- Every proof step has a `justification` naming a recognized inference rule, "Premise", or "Assumption"
- Every `refs` array contains only integers ≤ the current step number
- All assumptions introduced in the proof are discharged before the final step
- `validityCheck` is `true` only if every step follows from prior steps by a correct rule
- `soundnessCheck` is `true` only if all premises are verifiably true; `null` if unknown; `false` if a premise is false
- The `theorem` statement matches the `conclusion` of the proof
- No step claims to derive a statement that does not follow from the listed `refs` and `justification`
