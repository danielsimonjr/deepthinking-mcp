---
name: think-probabilistic
description: Probabilistic reasoning methods — Bayesian inference and Evidential reasoning. Use when the user invokes `/think bayesian` or `/think evidential`, or asks about updating beliefs with evidence, computing posterior probabilities, weighing multi-source evidence, or probabilistic inference under uncertainty.
argument-hint: "[bayesian|evidential] <problem>"
---

# think-probabilistic — Probabilistic Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `bayesian` or `evidential`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains two probabilistic reasoning methods: **Bayesian** (belief updating via Bayes' theorem) and **Evidential** (Dempster-Shafer theory for multi-source evidence with explicit uncertainty).

---

## Bayesian Inference

Bayesian reasoning updates a prior belief about a hypothesis using new evidence, producing a posterior probability. The core engine is Bayes' theorem:

**P(H|E) = P(E|H) × P(H) / P(E)**

Where P(E) = P(E|H) × P(H) + P(E|¬H) × P(¬H). Each piece of evidence shifts the probability; the posterior of one update becomes the prior for the next.

### When to Use

- You have a hypothesis and want to update your belief in it using observed evidence
- You need to compare competing explanations with explicit probability tracking
- You have a prior estimate (from historical data, base rates, or expert judgment) that can be stated as a number
- Accumulating evidence across multiple steps, where each posterior feeds the next prior
- Sensitivity analysis — how much does the conclusion change if the prior shifts?

**Do not use Bayesian** when:
- You cannot assign any numerical prior (even approximate) — use Evidential instead
- You have multiple mutually exclusive hypotheses and conflicting evidence from different sources with varying reliability — use Evidential instead
- Evidence sources are themselves uncertain or unreliable in ways that are hard to quantify
- The problem is purely logical with no uncertainty — use Deductive

### How to Reason

1. **Define the hypothesis.** A single falsifiable claim. Identify plausible alternatives.
2. **Set the prior P(H).** What is the base-rate probability before seeing this evidence? Justify it explicitly (historical data, domain knowledge, base rates).
3. **Collect evidence items.** For each piece of evidence, estimate:
   - P(E|H): How likely is this evidence if the hypothesis is true?
   - P(E|¬H): How likely is this evidence if the hypothesis is false?
4. **Compute the posterior.** Apply Bayes' theorem:
   - Numerator: P(E|H) × P(H)
   - Denominator: P(E|H) × P(H) + P(E|¬H) × P(¬H)
   - Show the arithmetic in the `calculation` field.
5. **Iterate.** Use the posterior as the new prior for the next evidence item.
6. **Compute the Bayes Factor** (optional): BF = P(E|H) / P(E|¬H). BF > 3 = moderate evidence; BF > 10 = strong evidence.
7. **Run sensitivity analysis** (optional): Vary the prior across a plausible range and observe how much the posterior moves.

### Output Format

See `reference/output-formats/bayesian.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "bayesian",
  "hypothesis": {
    "id": "<unique id>",
    "statement": "<the hypothesis being tested>",
    "alternatives": ["<alternative explanation 1>"]
  },
  "prior": {
    "probability": <0.0 to 1.0>,
    "justification": "<why this prior>"
  },
  "likelihood": {
    "probability": <0.0 to 1.0>,
    "description": "<what we expect to observe if H is true>"
  },
  "evidence": [
    {
      "id": "<e1>",
      "description": "<what was observed>",
      "likelihoodGivenHypothesis": <P(E|H), 0-1>,
      "likelihoodGivenNotHypothesis": <P(E|¬H), 0-1>,
      "timestamp": "<ISO timestamp, optional>"
    }
  ],
  "posterior": {
    "probability": <computed result, 0-1>,
    "calculation": "P(H|E) = (<P(E|H)> × <prior>) / ((<P(E|H)> × <prior>) + (<P(E|¬H)> × <1-prior>)) = <result>",
    "confidence": <0.0 to 1.0>
  },
  "bayesFactor": <P(E|H) / P(E|¬H), optional>,
  "sensitivity": {
    "priorRange": [<low>, <high>],
    "posteriorRange": [<resulting low>, <resulting high>]
  }
}
```

### Verification Before Emitting

- `mode` is exactly `"bayesian"`
- `prior.probability` and `posterior.probability` are in [0, 1]
- All `likelihoodGivenHypothesis` and `likelihoodGivenNotHypothesis` values are in [0, 1]
- `posterior.calculation` shows the actual arithmetic, not just the result
- If `evidence` is empty, `posterior.probability` should equal `prior.probability`
- `bayesFactor` (if included) equals `likelihoodGivenHypothesis / likelihoodGivenNotHypothesis` for the evidence

### Worked Example

Input: "Is the memory leak caused by the caching layer? Historical data: 30% of memory issues are cache-related. Heap dump shows 40% of memory in cache objects."

Step 1 — Set prior and hypothesis:

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
    "justification": "Historical incidents: 30% of memory issues are cache-related"
  },
  "likelihood": {
    "probability": 0.85,
    "description": "If cache is the cause, we expect elevated heap usage in cache objects"
  },
  "evidence": [],
  "posterior": {
    "probability": 0.3,
    "calculation": "No evidence yet — posterior equals prior",
    "confidence": 0.3
  }
}
```

Step 2 — Incorporate heap dump evidence:

```json
{
  "mode": "bayesian",
  "hypothesis": {
    "id": "h1",
    "statement": "The memory leak is caused by the caching layer"
  },
  "prior": {
    "probability": 0.3,
    "justification": "Initial prior from historical incidents"
  },
  "likelihood": {
    "probability": 0.85,
    "description": "Cache issues typically show elevated cache objects in heap"
  },
  "evidence": [
    {
      "id": "e1",
      "description": "Heap dump shows 40% of memory in cache objects",
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
  "bayesFactor": 4.5
}
```

Natural-language summary: "Prior belief of 30% (historical base rate) updates to 66% after the heap dump evidence. The Bayes Factor of 4.5 (= 0.9 / 0.2) indicates moderate-to-strong evidence. The caching layer is now the leading suspect, but not conclusive — additional evidence (profiler traces, cache flush test) would push confidence higher."

---

## Evidential Reasoning

Evidential reasoning uses **Dempster-Shafer theory** to aggregate evidence from multiple sources while explicitly representing ignorance and conflict. Unlike Bayesian reasoning, it does not require assigning precise prior probabilities — instead it assigns mass to sets of hypotheses, and combines those masses using Dempster's rule.

Key concepts:
- **Frame of Discernment**: The complete set of mutually exclusive hypotheses
- **Basic Probability Assignment (mass)**: How much support each piece of evidence gives to each hypothesis or subset
- **Belief**: Lower bound — the evidence that directly supports a hypothesis
- **Plausibility**: Upper bound — what remains after subtracting evidence that contradicts
- **Uncertainty Interval [belief, plausibility]**: The range within which the true probability lies

### When to Use

- You have evidence from multiple sources with different reliabilities
- You cannot assign a single numerical prior with confidence
- You need to express ignorance separately from disbelief (unlike Bayesian, which conflates them)
- Sensor fusion, intelligence analysis, or multi-source aggregation problems
- Evidence directly conflicts and you want to quantify the conflict mass

**Do not use Evidential** when:
- You have a single hypothesis and can assign a precise prior — use Bayesian instead
- The problem requires sequential belief updating with clean iterations — Bayesian is cleaner
- All evidence comes from a single source — use Bayesian
- The hypotheses are not mutually exclusive

### How to Reason

1. **Define the frame of discernment.** List all mutually exclusive hypotheses that partition the possibility space.
2. **Define each hypothesis.** Give each an id, name, description, and note whether it is mutually exclusive.
3. **Collect evidence items.** For each source, record: id, description, source name, reliability (0-1), which hypotheses it supports, and which it contradicts.
4. **Assign belief functions (mass assignments).** For each evidence source, distribute mass across hypothesis subsets (including the "ignorance" mass that goes to the full frame). All masses for a source must sum to 1.
5. **Combine belief functions.** Apply Dempster's rule of combination to merge evidence from multiple sources. Note the conflict mass (K) — high K means the sources strongly disagree.
6. **Compute plausibility.** For each hypothesis, plausibility = 1 − belief in all hypotheses that exclude it.
7. **Make decisions.** Select the hypothesis with the highest belief (or plausibility if beliefs are low), justify confidence using the uncertainty interval [belief, plausibility].

### Output Format

See `reference/output-formats/evidential.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "evidential",
  "thoughtType": "evidence_combination",
  "frameOfDiscernment": ["<H1>", "<H2>", "<H3>"],
  "hypotheses": [
    {
      "id": "<h1>",
      "name": "<name>",
      "description": "<description>",
      "mutuallyExclusive": true
    }
  ],
  "evidence": [
    {
      "id": "<e1>",
      "description": "<what was observed>",
      "source": "<source name>",
      "reliability": <0-1>,
      "timestamp": <unix timestamp>,
      "supports": ["<hypothesis id>"],
      "contradicts": ["<hypothesis id>"]
    }
  ],
  "beliefFunctions": [
    {
      "id": "<bf1>",
      "source": "<evidence id or 'combined'>",
      "massAssignments": [
        {
          "hypothesisSet": ["<h1>"],
          "mass": <0-1>,
          "justification": "<why this mass>"
        }
      ],
      "conflictMass": <0-1, optional>
    }
  ],
  "combinedBelief": {
    "id": "combined",
    "source": "combined",
    "massAssignments": [
      {
        "hypothesisSet": ["<h1>"],
        "mass": <0-1>,
        "justification": "Dempster's rule combining all sources"
      }
    ]
  },
  "plausibility": {
    "id": "pl1",
    "assignments": [
      {
        "hypothesisSet": ["<h1>"],
        "plausibility": <0-1>,
        "belief": <0-1>,
        "uncertaintyInterval": [<belief>, <plausibility>]
      }
    ]
  },
  "decisions": [
    {
      "id": "d1",
      "name": "<decision name>",
      "selectedHypothesis": ["<h1>"],
      "confidence": <0-1>,
      "reasoning": "<why this hypothesis was selected>",
      "alternatives": [
        {
          "hypothesis": ["<h2>"],
          "expectedUtility": <number>,
          "risk": <0-1>
        }
      ]
    }
  ]
}
```

### Verification Before Emitting

- `mode` is exactly `"evidential"`
- `thoughtType` is one of: `hypothesis_definition`, `evidence_collection`, `belief_assignment`, `evidence_combination`, `decision_analysis`
- `frameOfDiscernment` lists all hypotheses
- Mass assignments for each belief function sum to 1.0 (including ignorance mass if any)
- All `reliability` values are in [0, 1]
- All `mass`, `belief`, `plausibility` values are in [0, 1]
- `uncertaintyInterval[0]` (belief) ≤ `uncertaintyInterval[1]` (plausibility)
- If `combinedBelief` is present, it reflects Dempster's rule, not a simple average

### Worked Example

Input: "We have radar and camera sensors trying to classify an object as Vehicle, Pedestrian, or Cyclist. Radar strongly suggests Vehicle; camera suggests Cyclist or Pedestrian. Which is most likely?"

```json
{
  "mode": "evidential",
  "thoughtType": "evidence_combination",
  "frameOfDiscernment": ["Vehicle", "Pedestrian", "Cyclist"],
  "hypotheses": [
    {"id": "h1", "name": "Vehicle", "description": "Motorized vehicle", "mutuallyExclusive": true},
    {"id": "h2", "name": "Pedestrian", "description": "Person on foot", "mutuallyExclusive": true},
    {"id": "h3", "name": "Cyclist", "description": "Person on bicycle", "mutuallyExclusive": true}
  ],
  "evidence": [
    {
      "id": "e1",
      "description": "Radar signature consistent with large metallic object",
      "source": "radar",
      "reliability": 0.85,
      "timestamp": 1744358400,
      "supports": ["h1"],
      "contradicts": ["h2", "h3"]
    },
    {
      "id": "e2",
      "description": "Camera detects two-wheeled profile",
      "source": "camera",
      "reliability": 0.7,
      "timestamp": 1744358401,
      "supports": ["h2", "h3"],
      "contradicts": []
    }
  ],
  "beliefFunctions": [
    {
      "id": "bf1",
      "source": "e1",
      "massAssignments": [
        {"hypothesisSet": ["h1"], "mass": 0.72, "justification": "Radar strongly supports Vehicle (reliability 0.85 × signal strength)"},
        {"hypothesisSet": ["h1", "h2", "h3"], "mass": 0.28, "justification": "Residual ignorance mass"}
      ]
    },
    {
      "id": "bf2",
      "source": "e2",
      "massAssignments": [
        {"hypothesisSet": ["h2", "h3"], "mass": 0.56, "justification": "Camera supports Cyclist/Pedestrian (reliability 0.7 × detection confidence 0.8)"},
        {"hypothesisSet": ["h1", "h2", "h3"], "mass": 0.44, "justification": "Residual ignorance mass"}
      ]
    }
  ],
  "plausibility": {
    "id": "pl1",
    "assignments": [
      {"hypothesisSet": ["h1"], "plausibility": 0.72, "belief": 0.42, "uncertaintyInterval": [0.42, 0.72]},
      {"hypothesisSet": ["h2"], "plausibility": 0.40, "belief": 0.15, "uncertaintyInterval": [0.15, 0.40]},
      {"hypothesisSet": ["h3"], "plausibility": 0.40, "belief": 0.15, "uncertaintyInterval": [0.15, 0.40]}
    ]
  },
  "decisions": [
    {
      "id": "d1",
      "name": "Object classification decision",
      "selectedHypothesis": ["h1"],
      "confidence": 0.57,
      "reasoning": "Vehicle has the highest belief (0.42) and plausibility (0.72). Despite camera conflicting evidence, radar reliability dominates. Uncertainty interval [0.42, 0.72] indicates meaningful but not conclusive support.",
      "alternatives": [
        {"hypothesis": ["h2", "h3"], "expectedUtility": 0.3, "risk": 0.6}
      ]
    }
  ]
}
```

Natural-language summary: "The two sensors conflict: radar says Vehicle, camera says Cyclist/Pedestrian. Dempster-Shafer handles this conflict explicitly rather than averaging. Vehicle holds the highest belief (0.42) because radar's reliability advantage (0.85 vs 0.70) dominates. The wide uncertainty interval [0.42, 0.72] signals that additional sensor data would be valuable before acting."
