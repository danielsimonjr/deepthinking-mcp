---
name: think
description: Route a reasoning task to the appropriate thinking mode. Use when the user invokes `/think <mode?> "<problem>"` or asks for structured reasoning, critical analysis, Bayesian inference, causal analysis, inductive/deductive reasoning, hypothesis formation, analytical frameworks (5W1H, SWOT, 5 Whys, Fishbone), or any form of disciplined thinking. Supports explicit mode selection (e.g., `/think bayesian ...`) and auto-recommendation (`/think ...`).
argument-hint: "[mode] <problem>"
---

# Think — Reasoning Router

## User Invocation

The user invoked this skill with the following arguments:

```
$ARGUMENTS
```

Parse the arguments above. The first word may be a mode name (any of the 46 recognized modes listed below). Everything else is the problem statement. If the first word is NOT one of the recognized modes, treat the entire argument string as a problem statement and auto-recommend a mode per the decision tree in `mode-index.md`.

---

This skill routes a reasoning task to the appropriate category skill containing the relevant method(s). Your job as the router is:

1. **Parse the invocation.** Look for a mode name in the arguments. If the user wrote `/think bayesian "..."`, the mode is `bayesian`.
2. **Load the right category skill.** Each category skill holds 2-4 reasoning methods. Use the mapping in `mode-index.md`.
3. **Apply the method.** Once the category skill is loaded, follow its instructions to produce structured output matching the mode's JSON schema.
4. **Emit the structured output.** Every reasoning output MUST be a valid JSON object matching the schema in `reference/output-formats/<mode>.md`.

## Available Modes (v9.2.0)

| Mode | Category skill | Use when |
|---|---|---|
| `sequential` | `think-standard` | Breaking a complex problem into ordered steps with revision support |
| `shannon` | `think-standard` | Information-theoretic decomposition tracking uncertainty across 5 stages |
| `hybrid` | `think-standard` | Composing multiple modes for cross-cutting multidimensional problems |
| `inductive` | `think-core` | Forming general principles from specific observed cases |
| `deductive` | `think-core` | Drawing specific conclusions from established premises (formal inference) |
| `abductive` | `think-core` | Finding the best explanation among competing hypotheses |
| `mathematics` | `think-mathematics` | Formal proofs, algebraic reasoning, mathematical modeling |
| `physics` | `think-mathematics` | Physical models, conservation laws, tensor analysis, symmetries |
| `computability` | `think-mathematics` | Decidability, complexity classes, Turing machines, reductions |
| `temporal` | `think-temporal` | Event ordering, time intervals, Allen relations, sequence vs. causation |
| `historical` | `think-temporal` | Source reliability, precedent analysis, patterns across historical episodes |
| `bayesian` | `think-probabilistic` | Updating beliefs with evidence via Bayes' theorem (posterior calculation) |
| `evidential` | `think-probabilistic` | Multi-source evidence evaluation, Dempster-Shafer belief/plausibility |
| `causal` | `think-causal` | Cause-effect mechanisms, confounders, causal graphs |
| `counterfactual` | `think-causal` | What-if reasoning, interventions, alternative histories |
| `gametheory` | `think-strategic` | Multi-agent strategic interaction, Nash equilibria, payoff matrices |
| `optimization` | `think-strategic` | Finding the best allocation given an objective and constraints |
| `constraint` | `think-strategic` | Satisfying a set of hard rules (feasibility, not optimality) |
| `analogical` | `think-analytical` | Mapping structural similarity between source and target domains |
| `firstprinciples` | `think-analytical` | Decomposing to fundamental truths and rebuilding from axioms |
| `metareasoning` | `think-analytical` | Reasoning ABOUT reasoning — monitoring and switching reasoning modes |
| `cryptanalytic` | `think-analytical` | Signal-from-noise extraction, Decibans-weighted evidence, pattern breaking |
| `scientificmethod` | `think-scientific` | Hypothesis → prediction → experiment → observation → revision (falsifiability) |
| `systemsthinking` | `think-scientific` | Feedback loops, systems archetypes, leverage points, emergent behavior |
| `formallogic` | `think-scientific` | Propositional and predicate logic, formal proof structures |
| `engineering` | `think-engineering` | Design trade-offs, FMEA, trade studies, constraint-driven decisions |
| `algorithmic` | `think-engineering` | CLRS algorithm selection, complexity analysis, data structure choice |
| `synthesis` | `think-academic` | Integrating multiple sources with coverage tracking (literature review) |
| `argumentation` | `think-academic` | Building arguments using the Toulmin model (claim/warrant/backing/rebuttal) |
| `critique` | `think-academic` | Peer-review evaluation with Socratic questions and strengths/weaknesses |
| `analysis` | `think-academic` | Layered systematic decomposition (surface → structure → patterns → synthesis) |
| `recursive` | `think-advanced` | Self-referential problem decomposition (base case + recursive case + halting) |
| `modal` | `think-advanced` | Possibility/necessity reasoning (alethic, epistemic, deontic modalities) |
| `stochastic` | `think-advanced` | Probability distributions, random processes, Monte Carlo analysis |
| `5w1h` | `think-frameworks` | Fully scoping/defining a problem across Who/What/When/Where/Why/How before analysis |
| `swot` | `think-frameworks` | Assessing strategic position via internal + external factors (Strengths/Weaknesses/Opportunities/Threats) |
| `fivewhys` | `think-frameworks` | Drilling from a symptom to a single root cause via repeated "why" |
| `fishbone` | `think-frameworks` | Cause analysis needing multiple cause categories (Ishikawa diagram) |
| `pestle` | `think-frameworks` | Scanning the external/macro environment (Political/Economic/Social/Technological/Legal/Environmental) |
| `forcefield` | `think-frameworks` | Weighing driving vs. restraining forces for a proposed change |
| `decisionmatrix` | `think-frameworks` | Comparing options against weighted criteria with a scored recommendation |
| `pareto` | `think-frameworks` | Prioritizing the vital few contributors from the trivial many (80/20) |
| `stakeholder` | `think-frameworks` | Mapping stakeholders by power and interest to plan engagement |
| `costbenefit` | `think-frameworks` | Weighing quantified costs against quantified benefits for one option |
| `riskassessment` | `think-frameworks` | Rating risks by probability × impact to prioritize mitigation |
| `gapanalysis` | `think-frameworks` | Mapping current state vs. desired state with a closing action plan |

## Invocation Patterns

### Explicit mode

    /think sequential "Break down the steps to migrate this database"
    /think inductive "Given these three incidents, what pattern do they share?"
    /think deductive "If all users in admin can edit posts and Alice is in admin, can Alice edit posts?"
    /think bayesian "Update my belief that the service is down given this new error rate"
    /think causal "Why did latency spike after the config change?"

If the user provided an explicit mode name, load the corresponding category skill and apply that method.

### Auto-recommend (no mode specified)

    /think "Why did the last three deployments fail?"

If no mode is specified, read `mode-index.md` for the decision tree and pick the mode whose shape best matches the problem. Explain your choice to the user in one sentence before producing the structured output.

## Output Format Contract

Every reasoning output from this plugin follows a consistent pattern:

1. **One sentence of meta** explaining which mode was chosen (only for auto-recommend cases).
2. **A JSON code block** containing the structured thought matching the mode's schema.
3. **A short natural-language summary** (2-4 sentences) explaining the reasoning for humans.

Example of a well-formed response to `/think inductive "..."`:

    Using inductive reasoning to generalize from the three observed incidents.

    ```json
    {
      "mode": "inductive",
      "observations": ["..."],
      "generalization": "...",
      "confidence": 0.85,
      "sampleSize": 3
    }
    ```

    The three deploy failures all occurred at the same phase with identical symptoms, which supports a strong generalization that the issue is upstream of DB connection handling. Confidence is 0.85 because the sample is small (n=3) and we have not yet ruled out confounders.

## Decision Tree Reference

For auto-recommendation, consult `skills/think/mode-index.md`.

## Output-Format References

For the JSON schema and verification checklist for each mode, see `reference/output-formats/<mode>.md` where `<mode>` is any of the 46 mode slugs listed in the table above.
