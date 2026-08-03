---
description: "Apply a structured reasoning method to a problem. Usage: /think [mode] \"<problem>\" where mode is any of the 46 available modes or omitted for auto-recommend."
argument-hint: "[mode] <problem>"
---

The user invoked `/think` with these arguments:

```
$ARGUMENTS
```

## What to do

Parse the arguments above. The first word may be one of the 46 available modes:

**think-standard**
- **`sequential`** — Iterative step-by-step reasoning. Breaking down a task into ordered thoughts with revision support.
- **`shannon`** — Information-theoretic decomposition tracking uncertainty across 5 stages.
- **`hybrid`** — Composing multiple modes for cross-cutting multidimensional problems.

**think-core**
- **`inductive`** — Reasoning from specific observations to general principles. Pattern recognition across cases.
- **`deductive`** — Reasoning from established premises to specific conclusions. Formal logical inference.
- **`abductive`** — Finding the best explanation among competing hypotheses for a surprising observation.

**think-mathematics**
- **`mathematics`** — Formal proofs, algebraic reasoning, mathematical modeling.
- **`physics`** — Physical models, conservation laws, tensor analysis, symmetries.
- **`computability`** — Decidability, complexity classes, Turing machines, reductions.

**think-temporal**
- **`temporal`** — Event ordering, time intervals, Allen relations, sequence vs. causation.
- **`historical`** — Source reliability, precedent analysis, patterns across historical episodes.

**think-probabilistic**
- **`bayesian`** — Updating beliefs with evidence via Bayes' theorem (posterior calculation).
- **`evidential`** — Multi-source evidence evaluation, Dempster-Shafer belief/plausibility.

**think-causal**
- **`causal`** — Cause-effect mechanisms, confounders, causal graphs.
- **`counterfactual`** — What-if reasoning, interventions, alternative histories.

**think-strategic**
- **`gametheory`** — Multi-agent strategic interaction, Nash equilibria, payoff matrices.
- **`optimization`** — Finding the best allocation given an objective and constraints.
- **`constraint`** — Satisfying a set of hard rules (feasibility, not optimality).

**think-analytical**
- **`analogical`** — Mapping structural similarity between source and target domains.
- **`firstprinciples`** — Decomposing to fundamental truths and rebuilding from axioms.
- **`metareasoning`** — Reasoning ABOUT reasoning — monitoring and switching reasoning modes.
- **`cryptanalytic`** — Signal-from-noise extraction, Decibans-weighted evidence, pattern breaking.

**think-scientific**
- **`scientificmethod`** — Hypothesis → prediction → experiment → observation → revision (falsifiability).
- **`systemsthinking`** — Feedback loops, systems archetypes, leverage points, emergent behavior.
- **`formallogic`** — Propositional and predicate logic, formal proof structures.

**think-engineering**
- **`engineering`** — Design trade-offs, FMEA, trade studies, constraint-driven decisions.
- **`algorithmic`** — CLRS algorithm selection, complexity analysis, data structure choice.

**think-academic**
- **`synthesis`** — Integrating multiple sources with coverage tracking (literature review).
- **`argumentation`** — Building arguments using the Toulmin model (claim/warrant/backing/rebuttal).
- **`critique`** — Peer-review evaluation with Socratic questions and strengths/weaknesses.
- **`analysis`** — Layered systematic decomposition (surface → structure → patterns → synthesis).

**think-advanced**
- **`recursive`** — Self-referential problem decomposition (base case + recursive case + halting).
- **`modal`** — Possibility/necessity reasoning (alethic, epistemic, deontic modalities).
- **`stochastic`** — Probability distributions, random processes, Monte Carlo analysis.

**think-frameworks**
- **`5w1h`** — Fully scoping/defining a problem across Who/What/When/Where/Why/How before analysis.
- **`swot`** — Assessing strategic position via internal + external factors (Strengths/Weaknesses/Opportunities/Threats).
- **`fivewhys`** — Drilling from a symptom to a single root cause via repeated "why" (or `fishbone` for multi-category causes).
- **`fishbone`** — Cause analysis needing multiple cause categories (Ishikawa diagram).
- **`pestle`** — Scanning the external/macro environment (Political/Economic/Social/Technological/Legal/Environmental).
- **`forcefield`** — Weighing driving vs. restraining forces for a proposed change, each strength-rated.
- **`decisionmatrix`** — Comparing 2+ options against 2+ weighted criteria with a scored recommendation.
- **`pareto`** — Prioritizing the vital few contributors from the trivial many (80/20, cumulative percentage).
- **`stakeholder`** — Mapping stakeholders by power and interest, with a per-stakeholder engagement strategy.
- **`costbenefit`** — Weighing quantified costs against quantified benefits for a single option, with ROI/payback.
- **`riskassessment`** — Rating risks by probability × impact and prioritizing mitigation by score.
- **`gapanalysis`** — Mapping current state vs. desired state across dimensions, with a closing action plan.

If the first word is a recognized mode name, apply that method. If the first word is NOT a mode name (or no mode was given), treat the entire `$ARGUMENTS` as the problem and auto-recommend a mode.

## Auto-Recommendation

For auto-recommendation, consult the decision tree in `skills/think/mode-index.md`.

## Method Instructions

Load the relevant category skill for background on the method:

- **sequential, shannon, hybrid** → read `skills/think-standard/SKILL.md`
- **inductive, deductive, abductive** → read `skills/think-core/SKILL.md`
- **mathematics, physics, computability** → read `skills/think-mathematics/SKILL.md`
- **temporal, historical** → read `skills/think-temporal/SKILL.md`
- **bayesian, evidential** → read `skills/think-probabilistic/SKILL.md`
- **causal, counterfactual** → read `skills/think-causal/SKILL.md`
- **gametheory, optimization, constraint** → read `skills/think-strategic/SKILL.md`
- **analogical, firstprinciples, metareasoning, cryptanalytic** → read `skills/think-analytical/SKILL.md`
- **scientificmethod, systemsthinking, formallogic** → read `skills/think-scientific/SKILL.md`
- **engineering, algorithmic** → read `skills/think-engineering/SKILL.md`
- **synthesis, argumentation, critique, analysis** → read `skills/think-academic/SKILL.md`
- **recursive, modal, stochastic** → read `skills/think-advanced/SKILL.md`
- **5w1h, swot, fivewhys, fishbone, pestle, forcefield, decisionmatrix, pareto, stakeholder, costbenefit, riskassessment, gapanalysis** → read `skills/think-frameworks/SKILL.md`

Then read `reference/output-formats/<mode>.md` for the authoritative JSON schema the output must match.

## Output Format

Every response from `/think` MUST follow this structure:

1. **One sentence of meta** — explain which mode was chosen and (if auto-recommend) why.
2. **A JSON code block** containing the structured thought matching the mode's schema.
3. **A short natural-language summary** (2-4 sentences) explaining the reasoning for humans.

### Example response

Using inductive reasoning to generalize from the three observed deployment failures.

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

The three deploy failures all occurred at the same phase with identical symptoms, which supports a strong generalization that the issue is upstream of DB connection handling. Confidence is 0.85 because the sample is small (n=3) and we have not yet ruled out confounders.

## Schema References

| Mode | Output schema |
|---|---|
| sequential | `reference/output-formats/sequential.md` |
| shannon | `reference/output-formats/shannon.md` |
| hybrid | `reference/output-formats/hybrid.md` |
| inductive | `reference/output-formats/inductive.md` |
| deductive | `reference/output-formats/deductive.md` |
| abductive | `reference/output-formats/abductive.md` |
| mathematics | `reference/output-formats/mathematics.md` |
| physics | `reference/output-formats/physics.md` |
| computability | `reference/output-formats/computability.md` |
| temporal | `reference/output-formats/temporal.md` |
| historical | `reference/output-formats/historical.md` |
| bayesian | `reference/output-formats/bayesian.md` |
| evidential | `reference/output-formats/evidential.md` |
| causal | `reference/output-formats/causal.md` |
| counterfactual | `reference/output-formats/counterfactual.md` |
| gametheory | `reference/output-formats/gametheory.md` |
| optimization | `reference/output-formats/optimization.md` |
| constraint | `reference/output-formats/constraint.md` |
| analogical | `reference/output-formats/analogical.md` |
| firstprinciples | `reference/output-formats/firstprinciples.md` |
| metareasoning | `reference/output-formats/metareasoning.md` |
| cryptanalytic | `reference/output-formats/cryptanalytic.md` |
| scientificmethod | `reference/output-formats/scientificmethod.md` |
| systemsthinking | `reference/output-formats/systemsthinking.md` |
| formallogic | `reference/output-formats/formallogic.md` |
| engineering | `reference/output-formats/engineering.md` |
| algorithmic | `reference/output-formats/algorithmic.md` |
| synthesis | `reference/output-formats/synthesis.md` |
| argumentation | `reference/output-formats/argumentation.md` |
| critique | `reference/output-formats/critique.md` |
| analysis | `reference/output-formats/analysis.md` |
| recursive | `reference/output-formats/recursive.md` |
| modal | `reference/output-formats/modal.md` |
| stochastic | `reference/output-formats/stochastic.md` |
| 5w1h | `reference/output-formats/5w1h.md` |
| swot | `reference/output-formats/swot.md` |
| fivewhys | `reference/output-formats/fivewhys.md` |
| fishbone | `reference/output-formats/fishbone.md` |
| pestle | `reference/output-formats/pestle.md` |
| forcefield | `reference/output-formats/forcefield.md` |
| decisionmatrix | `reference/output-formats/decisionmatrix.md` |
| pareto | `reference/output-formats/pareto.md` |
| stakeholder | `reference/output-formats/stakeholder.md` |
| costbenefit | `reference/output-formats/costbenefit.md` |
| riskassessment | `reference/output-formats/riskassessment.md` |
| gapanalysis | `reference/output-formats/gapanalysis.md` |
