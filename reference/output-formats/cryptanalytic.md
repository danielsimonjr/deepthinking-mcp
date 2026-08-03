# Cryptanalytic Thought — Output Format

Bayesian hypothesis testing using Alan Turing's deciban system — accumulating weighted evidence to confirm or refute hypotheses about hidden patterns.

## JSON Schema

```json
{
  "mode": "cryptanalytic",
  "thoughtType": "hypothesis_formation|frequency_analysis|evidence_accumulation|key_space_reduction|crib_analysis|banburismus|pattern_recognition|conclusion",
  "ciphertext": "<data or signal being analyzed, optional>",
  "plaintext": "<known or suspected plaintext, optional>",
  "hypotheses": [
    {
      "id": "h1",
      "description": "<what this hypothesis claims>",
      "cipherType": "<type of cipher or pattern, optional>",
      "parameters": { "<hypothesis-specific parameters, optional>" },
      "priorProbability": <number 0-1>,
      "posteriorProbability": <number 0-1>,
      "decibanScore": <number>,
      "evidence": [
        {
          "observation": "<what was observed>",
          "decibans": <number, positive supports, negative refutes>,
          "likelihoodRatio": <number, P(E|H) / P(E|¬H)>,
          "source": "frequency|pattern|crib|statistical|structural",
          "confidence": <number 0-1>,
          "explanation": "<why this observation has this deciban value>"
        }
      ],
      "status": "active|confirmed|refuted|superseded"
    }
  ],
  "currentHypothesis": { "<same structure as hypotheses item>" },
  "evidenceChains": [
    {
      "hypothesis": "<hypothesis description>",
      "observations": [ "<list of DecibanEvidence items>" ],
      "totalDecibans": <number>,
      "oddsRatio": <number>,
      "conclusion": "confirmed|refuted|inconclusive",
      "confirmationThreshold": <number, typically 20>,
      "refutationThreshold": <number, typically -20>
    }
  ],
  "frequencyAnalysis": {
    "observed": { "<character or feature>": <count or frequency> },
    "expected": { "<character or feature>": <expected frequency> },
    "chiSquared": <number>,
    "degreesOfFreedom": <integer>,
    "pValue": <number, optional>,
    "indexOfCoincidence": <number, optional>,
    "significantDeviations": [
      { "character": "<char>", "observed": <number>, "expected": <number>, "deviation": <number>, "isSignificant": <boolean> }
    ]
  },
  "patterns": [
    {
      "pattern": "<pattern identifier>",
      "positions": [<integer positions>],
      "suggestion": "<what the pattern implies>",
      "decibanContribution": <number>
    }
  ],
  "cipherType": "<determined cipher type, optional>",
  "keyInsight": "<the most actionable finding from this thought>",
  "dependencies": ["<prior thought types this builds on>"],
  "assumptions": ["<what is assumed to be true>"],
  "uncertainty": <number 0-1>
}
```

## Required Fields

- `mode` — always `"cryptanalytic"`
- `thoughtType` — the phase of analysis (use in sequence across thoughts)
- `dependencies` — prior analysis steps this thought builds on (empty array if first)
- `assumptions` — explicit list of what is assumed; leaving this empty is a reasoning error
- `uncertainty` — current uncertainty level; should decrease as evidence accumulates

## The Deciban System

The deciban is Alan Turing's unit for weighing evidence, developed at Bletchley Park. It is a log-odds unit:

```
decibans = 10 × log₁₀(likelihood_ratio)
where likelihood_ratio = P(evidence | hypothesis) / P(evidence | ¬hypothesis)
```

| Deciban Score | Interpretation |
|--------------|----------------|
| +20 or more | Confirmed (odds ~100:1 in favor) |
| +10 | Strong support (odds ~10:1) |
| +5 | Moderate support (odds ~3:1) |
| 0 | Neutral (no information) |
| -5 | Moderate against (odds ~3:1 against) |
| -10 | Strong against (odds ~10:1 against) |
| -20 or less | Refuted (odds ~100:1 against) |

Decibans are additive across independent observations. The confirmation threshold is typically +20 decibans; refutation is typically -20. Between these bounds, the chain is `inconclusive`.

## Thought Type Progression

A complete cryptanalytic analysis typically follows this sequence:
1. `hypothesis_formation` — propose candidate hypotheses with prior probabilities
2. `frequency_analysis` — compute observed vs. expected character/feature frequencies
3. `pattern_recognition` — identify structural regularities (isomorphisms, repetitions)
4. `evidence_accumulation` — assign decibans to each observation; update posteriors
5. `key_space_reduction` — if applicable, use evidence to eliminate candidate keys
6. `crib_analysis` — if known plaintext is available, derive constraints
7. `conclusion` — synthesize evidence chains; state confirmed/refuted/inconclusive

## Beyond Cipher-Breaking

The deciban framework applies to any hypothesis-testing problem where evidence should be accumulated systematically:

- Security: credential-stuffing vs. user-error analysis
- Observability: distinguishing a memory leak from a traffic spike from metrics
- Medical diagnosis: weighing symptoms toward differential diagnoses
- Fraud detection: scoring transaction patterns against fraud models

The key invariant: **each piece of evidence is assigned a likelihood ratio, converted to decibans, and summed.** This forces explicit reasoning about how much each observation actually moves the needle.

## Worked Example

Input: "Given 50 authentication failures over 24 hours, is this credential-stuffing or user error?"

Key evidence chain:
- 47/50 failures from a /24 subnet: +8.0 decibans (LR = 6.3)
- 38 distinct accounts hit 1-2 times each: +6.5 decibans (LR = 4.5)
- Request timing 1.2s ± 0.08s (highly regular): +5.0 decibans (LR = 3.2)
- No deployment in prior 24h (refutes user-error): -5.0 decibans for h2

Total for credential-stuffing hypothesis: **+19.5 decibans** (odds ~89:1)

```json
{
  "mode": "cryptanalytic",
  "thoughtType": "evidence_accumulation",
  "assumptions": ["Sample is representative", "Attacker uses scripted tooling with consistent behavior"],
  "dependencies": ["hypothesis_formation", "frequency_analysis"],
  "uncertainty": 0.25,
  "evidenceChains": [
    {
      "hypothesis": "Credential-stuffing attack",
      "observations": [
        { "observation": "47/50 failures from a /24 subnet", "decibans": 8.0, "likelihoodRatio": 6.3, "source": "pattern", "confidence": 0.95 },
        { "observation": "38 distinct accounts hit 1-2 times each", "decibans": 6.5, "likelihoodRatio": 4.5, "source": "statistical", "confidence": 0.90 },
        { "observation": "Inter-request timing 1.2s ± 0.08s (highly regular)", "decibans": 5.0, "likelihoodRatio": 3.2, "source": "pattern", "confidence": 0.88 }
      ],
      "totalDecibans": 19.5,
      "oddsRatio": 89.1,
      "conclusion": "inconclusive",
      "confirmationThreshold": 20,
      "refutationThreshold": -20
    }
  ],
  "keyInsight": "19.5 decibans approaches but has not crossed the 20-deciban confirmation threshold. One more independent signal — e.g., username list matches a known breached credential dataset — would confirm. Immediate mitigation: rate-limit the source /24 and require MFA for affected accounts."
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"cryptanalytic"`
- `thoughtType` is one of the eight valid values
- `dependencies` is an array (empty array is valid for the first thought)
- `assumptions` is non-empty — cryptanalytic reasoning always rests on assumptions; listing none is an error
- `uncertainty` decreases as evidence accumulates across thoughts
- All `decibans` values in evidence have a corresponding `likelihoodRatio` (the two are linked: decibans = 10 × log₁₀(LR))
- `evidenceChains[*].conclusion` is `"confirmed"` only if `totalDecibans ≥ confirmationThreshold`
- `evidenceChains[*].conclusion` is `"refuted"` only if `totalDecibans ≤ refutationThreshold`
- `keyInsight` is present and actionable — it should answer "so what?" not just describe what was computed
