# Inductive Thought — Output Format

Reasoning from specific observations to general principles.

## JSON Schema

```json
{
  "mode": "inductive",
  "observations": ["<specific case 1>", "<specific case 2>", ...],
  "pattern": "<identified pattern across observations, optional>",
  "generalization": "<the general principle derived>",
  "confidence": <number 0-1>,
  "counterexamples": ["<known exception 1>", ...],
  "sampleSize": <integer, optional>,
  "inductionSteps": [
    {
      "stepNumber": <int ≥ 1>,
      "observationsUsed": [<int indices into observations[]>],
      "stepsUsed": [<int references to prior stepNumbers>],
      "intermediateGeneralization": "<generalization formed at this step>",
      "inductionMethod": "<method applied: enumerative, statistical, analogical, causal, ...>"
    }
  ]
}
```

## Required Fields

- `mode` — always `"inductive"`
- `observations` — at least one specific observation
- `generalization` — the inferred general principle
- `confidence` — strength of the inference in [0, 1]

## Optional Fields

- `pattern` — short phrase naming the invariant across the observations, when the invariant is simple enough to state in one line
- `counterexamples` — known exceptions that lower confidence or narrow scope
- `sampleSize` — the count of underlying cases behind `observations` (may be larger than the array if observations are summarized)
- `inductionSteps` — multi-step induction chain. Omit for atomic single-inference inductions; present when progressive Bayesian refinement, Mill's methods of causal induction, hierarchical generalization, eliminative induction, or analogical reasoning chains are being shown. See "Multi-step inductions" below.

## Multi-step inductions (`inductionSteps[]`)

For inductions that require multiple distinct refinements to get from observations to the final generalization, populate `inductionSteps[]` with one entry per step in the chain. Each step has:

- **`stepNumber`** — 1-indexed position in the chain. Sequential and unique within the array (1, 2, 3, ...).
- **`observationsUsed`** — 0-indexed integer references into the top-level `observations[]` array (e.g., `[0, 2]` means "this step uses `observations[0]` and `observations[2]`"). May be empty if the step synthesizes only from prior steps.
- **`stepsUsed`** — references to prior `stepNumber` values (e.g., `[1, 2]` means "this step combines or refines the intermediate generalizations from step 1 and step 2"). No forward references — step 3 can reference 1 or 2, never 4 or 5.
- **`intermediateGeneralization`** — the generalization formed at this step. Each step's generalization should be meaningfully different from the previous step (narrower, broader, or more refined). The final step's generalization should match (or very closely match) the top-level `generalization`.
- **`inductionMethod`** — name of the induction method applied at this step (free-text: `"enumerative"`, `"statistical"`, `"analogical"`, `"causal"`, `"causal (method of agreement)"`, `"causal (method of difference)"`, `"causal (Mill's methods synthesis)"`, `"eliminative"`, `"bayesianUpdate"`, `"mixed"`, etc.). The field is free-text in v0.5.3; a future release may tighten it to an enum once usage patterns are observed.

**When to use `inductionSteps[]`:**

- **Progressive Bayesian refinement** — an initial weak generalization is reinforced, revised, or reversed as new observations arrive. Each step represents the reasoner's belief at a point in time, given only the data available then (A/B test evolution, sequential hypothesis testing, incremental sensor fusion).
- **Mill's methods of causal induction** — method of agreement, method of difference, joint method, concomitant variation, residues — applied as separate steps that build up to a causal claim. The final step synthesizes. If you label a step "method of difference," it must genuinely compare a positive case against a negative case with other factors held constant — not just restate an enumerative observation.
- **Hierarchical generalization** — first generalize within sub-groups (one step per group), then generalize across the sub-group generalizations in a synthesis step. Useful when the observation set has natural strata.
- **Eliminative induction** — each step rules out a competing hypothesis based on the observations, narrowing the hypothesis space until only the surviving explanation remains.
- **Analogical reasoning chains** — each step extends or refines a structural mapping from a source domain to a target domain, potentially introducing additional source analogs. The final step commits to an analogical conclusion with its limits made explicit.

**When to omit `inductionSteps[]`:**

- The induction is a single holistic inference (observe → pattern → generalize in one pass)
- All observations are weighted equally and the generalization is one enumerative jump
- Adding the array would just restate the observations and the top-level generalization without intermediate content

## Key Distinction: Holistic vs Stepwise

Real inductive reasoning is often **holistic** — you see the pattern all at once, not by grinding through observations one at a time. Most simple enumerative inductions (e.g., "3 deploys failed with timeout, therefore production is broken") are holistic and should use the flat shape with no `inductionSteps[]`. The stepwise shape is reserved for cases where the reasoner genuinely forms an intermediate claim, tests it against more data, and revises — as in progressive refinement or Mill's methods.

## Worked Example — single-step induction (no `inductionSteps`)

Input: "Given these three incidents, what pattern do they share?"

Context observed:
- Deploy on Monday 2026-04-06 failed with DB connection timeout
- Deploy on Wednesday 2026-04-08 failed with DB connection timeout
- Deploy on Friday 2026-04-10 failed with DB connection timeout

Output:

```json
{
  "mode": "inductive",
  "observations": [
    "Deploy on Monday 2026-04-06 failed with DB connection timeout",
    "Deploy on Wednesday 2026-04-08 failed with DB connection timeout",
    "Deploy on Friday 2026-04-10 failed with DB connection timeout"
  ],
  "pattern": "All recent deploys fail at the DB connection phase",
  "generalization": "Recent production deploys consistently fail at the DB connection phase, suggesting a configuration or network issue introduced prior to 2026-04-06",
  "confidence": 0.85,
  "sampleSize": 3
}
```

This is a single holistic enumerative induction. `inductionSteps` is omitted because the reasoning is a single jump — no intermediate generalizations are formed.

## Worked Example — multi-step induction (with `inductionSteps`)

Input: "Here are 4 weeks of A/B test results. Variant A vs control. Week 1: variant A +3.2%, n=1000/arm. Week 2: variant A +4.8%, n=1500/arm. Week 3: variant A +0.4%, n=2000/arm. Week 4: variant A -1.7%, n=2500/arm. What does this actually tell us?"

Output:

```json
{
  "mode": "inductive",
  "observations": [
    "Week 1 A/B test: variant A +3.2% conversion vs control, n=1000 per arm",
    "Week 2 A/B test: variant A +4.8% conversion vs control, n=1500 per arm",
    "Week 3 A/B test: variant A +0.4% conversion vs control, n=2000 per arm",
    "Week 4 A/B test: variant A -1.7% conversion vs control, n=2500 per arm"
  ],
  "pattern": "Early positive signal in weeks 1-2 decayed to zero by week 3 and reversed by week 4, with each week's sample larger than the last",
  "generalization": "Variant A showed no sustained improvement over control; the early positive signal in weeks 1-2 was a novelty effect that decayed as user adaptation set in over weeks 3-4",
  "confidence": 0.82,
  "sampleSize": 7000,
  "inductionSteps": [
    {
      "stepNumber": 1,
      "observationsUsed": [0],
      "stepsUsed": [],
      "intermediateGeneralization": "Variant A appears to improve conversion by roughly 3% relative to control, based on one week of data",
      "inductionMethod": "bayesianUpdate (weak prior)"
    },
    {
      "stepNumber": 2,
      "observationsUsed": [1],
      "stepsUsed": [1],
      "intermediateGeneralization": "Variant A's advantage is reinforced by week 2 and is now around 4-5% relative to control; the signal is strengthening with a larger sample",
      "inductionMethod": "bayesianUpdate (reinforced)"
    },
    {
      "stepNumber": 3,
      "observationsUsed": [2],
      "stepsUsed": [1, 2],
      "intermediateGeneralization": "Variant A's advantage is weakening — week 3 shows effectively no difference at the largest sample size so far; either the effect is noisy or it is beginning to reverse",
      "inductionMethod": "bayesianUpdate (revising)"
    },
    {
      "stepNumber": 4,
      "observationsUsed": [3],
      "stepsUsed": [1, 2, 3],
      "intermediateGeneralization": "Variant A showed no sustained improvement over control; the early positive signal in weeks 1-2 was a novelty effect that decayed as user adaptation set in over weeks 3-4",
      "inductionMethod": "bayesianUpdate (reversal)"
    }
  ]
}
```

This is a genuine four-step progressive Bayesian-update induction. Each step represents what the reasoner's belief literally was at a specific point in time, given the observations available at that point. The intermediate generalizations are not decompositions of a single analysis — they are historically distinct beliefs that were revised as new data arrived. Step 4's intermediate generalization is the final one and matches the top-level `generalization`. This is the archetypal case where the multi-step shape earns its keep: the flat `generalization` field alone cannot capture that the final belief required reversing an earlier one.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"inductive"`
- `observations` has at least one entry (ideally ≥3)
- `confidence` is in [0, 1]
- `confidence` is lower when `sampleSize` is small or `counterexamples` are present
- `generalization` is logically supported by the observations (not a leap)
- `pattern` (if included) actually appears in every observation
- If `inductionSteps[]` is present:
  - Step numbers are sequential and unique (1, 2, 3, ...)
  - Each step's `stepsUsed[]` only references earlier steps (step 3 may reference 1 or 2, never 4)
  - Each step's `observationsUsed[]` indices are all valid (< length of `observations[]`)
  - Every step has at least one non-empty input — `observationsUsed[]` or `stepsUsed[]` must not both be empty
  - The final step's `intermediateGeneralization` matches the top-level `generalization` (the chain must close)
  - Each step's `intermediateGeneralization` should be meaningfully different from the previous step — narrower, broader, or revised, not a restatement. This is an authorship guideline (not enforced by `check_inductive` because "meaningfully different" is inherently fuzzy), but a chain of near-identical intermediate generalizations is a sign the multi-step shape is not earning its keep and the flat shape would be clearer.
