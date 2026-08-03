# Bayesian Thought — Output Format

Probabilistic belief updating using Bayes' theorem: **P(H|E) = P(E|H) × P(H) / P(E)**

Each thought captures a hypothesis, prior belief, evidence collected, and the resulting posterior probability. The posterior of one step becomes the prior of the next.

## JSON Schema

```json
{
  "mode": "bayesian",
  "hypothesis": {
    "id": "<unique identifier>",
    "statement": "<the hypothesis being tested>",
    "alternatives": ["<competing explanation 1>", ...]
  },
  "prior": {
    "probability": <number 0-1>,
    "justification": "<why this prior — cite historical data, base rates, or domain knowledge>"
  },
  "likelihood": {
    "probability": <number 0-1>,
    "description": "<what we expect to observe if the hypothesis is true>"
  },
  "evidence": [
    {
      "id": "<evidence identifier>",
      "description": "<what was observed>",
      "likelihoodGivenHypothesis": <P(E|H), number 0-1>,
      "likelihoodGivenNotHypothesis": <P(E|¬H), number 0-1>,
      "timestamp": "<ISO 8601 timestamp, optional>"
    }
  ],
  "posterior": {
    "probability": <computed result, number 0-1>,
    "calculation": "P(H|E) = (P(E|H) × prior) / ((P(E|H) × prior) + (P(E|¬H) × (1-prior))) = <arithmetic>",
    "confidence": <number 0-1>
  },
  "bayesFactor": <P(E|H) / P(E|¬H), number, optional>,
  "sensitivity": {
    "priorRange": [<low prior>, <high prior>],
    "posteriorRange": [<resulting low posterior>, <resulting high posterior>]
  }
}
```

## Required Fields

- `mode` — always `"bayesian"`
- `hypothesis` — object with `id` and `statement`; `alternatives` optional
- `prior` — `probability` in [0, 1] plus `justification`
- `likelihood` — `probability` in [0, 1] plus `description`
- `evidence` — array (may be empty); each item requires `id`, `description`, `likelihoodGivenHypothesis`, `likelihoodGivenNotHypothesis`
- `posterior` — `probability` in [0, 1], `calculation` (must show arithmetic), `confidence` in [0, 1]

## Optional Fields

- `bayesFactor` — ratio P(E|H) / P(E|¬H); values > 3 = moderate evidence, > 10 = strong evidence
- `sensitivity` — vary the prior across a range and report how much the posterior shifts

## Bayes' Theorem Arithmetic

```
posterior = (P(E|H) × prior) / ((P(E|H) × prior) + (P(E|¬H) × (1 - prior)))
```

Example: prior = 0.3, P(E|H) = 0.9, P(E|¬H) = 0.2

```
posterior = (0.9 × 0.3) / ((0.9 × 0.3) + (0.2 × 0.7))
          = 0.27 / (0.27 + 0.14)
          = 0.27 / 0.41
          = 0.66
```

Always show this arithmetic in the `calculation` field — do not just state the result.

## Worked Example

Input: "Is the memory leak caused by the caching layer? 30% historical base rate; heap dump shows cache objects dominating."

```json
{
  "mode": "bayesian",
  "hypothesis": {
    "id": "h1",
    "statement": "The memory leak is caused by the caching layer",
    "alternatives": ["connection pool exhaustion", "log file accumulation"]
  },
  "prior": {
    "probability": 0.3,
    "justification": "Historical incidents: 30% of memory issues traced to caching layer over 18 months"
  },
  "likelihood": {
    "probability": 0.85,
    "description": "If cache is the cause, we expect elevated heap usage concentrated in cache objects"
  },
  "evidence": [
    {
      "id": "e1",
      "description": "Heap dump shows 40% of memory occupied by cache objects",
      "likelihoodGivenHypothesis": 0.9,
      "likelihoodGivenNotHypothesis": 0.2,
      "timestamp": "2026-04-11T10:30:00Z"
    }
  ],
  "posterior": {
    "probability": 0.66,
    "calculation": "P(H|E) = (0.9 × 0.3) / ((0.9 × 0.3) + (0.2 × 0.7)) = 0.27 / (0.27 + 0.14) = 0.27 / 0.41 = 0.66",
    "confidence": 0.7
  },
  "bayesFactor": 4.5,
  "sensitivity": {
    "priorRange": [0.1, 0.5],
    "posteriorRange": [0.33, 0.82]
  }
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"bayesian"`
- `prior.probability` and `posterior.probability` are in [0, 1]
- All `likelihoodGivenHypothesis` and `likelihoodGivenNotHypothesis` values are in [0, 1]
- `posterior.calculation` contains actual arithmetic, not just the final number
- If `evidence` is empty, `posterior.probability` equals `prior.probability`
- `bayesFactor` (if present) equals the ratio of the likelihoods
- `sensitivity.priorRange` and `posteriorRange` each contain exactly 2 numbers in [0, 1]
