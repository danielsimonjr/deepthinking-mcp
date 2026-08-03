---
name: think-frameworks
description: Analytical framework reasoning methods — 5W1H, SWOT, 5 Whys, Fishbone, PESTLE, Force Field, Decision Matrix, Pareto, Stakeholder, Cost-Benefit, Risk Assessment, Gap Analysis. Use when the user invokes `/think <framework>` or asks for structured problem definition, strategic analysis, root-cause, prioritization, decision comparison, risk, or gap analysis.
argument-hint: "[framework] <problem>"
---

# think-frameworks — Analytical Framework Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be one of this category's framework modes (`5w1h`, `swot`, `fivewhys`, `fishbone`, `pestle`, `forcefield`, `decisionmatrix`, `pareto`, `stakeholder`, `costbenefit`, `riskassessment`, `gapanalysis`). The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill teaches structured **analytical frameworks** — well-established business, engineering, and quality-management templates for scoping problems, assessing strategic position, finding root causes, and (in later modes) prioritizing and deciding. Unlike the free-form reasoning modes in other categories, each framework here has a fixed, named structure (a grid, a chain, a spine) that the output must fill in completely.

---

## Output Quality Rules

These rules apply to every mode in this category:

1. **Fill every field, or say "none identified."** A framework field left implicitly empty is a sign of an incomplete analysis, not a legitimately empty category. If a quadrant, category, or dimension genuinely has nothing to report, say so explicitly (e.g., `"none identified"`) rather than omitting the field or leaving an empty array with no explanation.
2. **Show scoring math for weighted modes.** Any mode that scores or weights options (future modes in this category, e.g. Decision Matrix, Pareto) must show the arithmetic — weight × score = weighted score — not just the final ranking. A bare number without its derivation cannot be checked or trusted.
3. **End with an action.** Every framework output should conclude with something actionable — a recommendation, a corrective action, a prioritized cause, a next step. A framework that only classifies without pointing toward a decision has done half the job.

### Bias Check

Before finalizing output from any of the **decision modes** (`decisionmatrix`, `riskassessment`, `costbenefit`, `swot`), run a pre-commit bias check against `references/cognitive-biases/COGNITIVE_BIASES_FRAMEWORK.md` (the full bias taxonomy) and `references/cognitive-biases/bias_detection_guide.md` (how to spot them in your own draft output before finalizing). This is a check, not a mode — do not emit a separate bias-check thought; apply it silently to the draft before returning the framework's own JSON. Common biases specific to this category: confirmation bias when populating SWOT opportunities/threats, availability bias when enumerating fishbone causes (favoring recently-seen causes over structurally likely ones), premature convergence in 5 Whys (stopping at a comfortable answer instead of a genuine process-level root cause), anchoring in Decision Matrix scoring (first-scored option or criterion pulling later scores toward it), and optimism bias in Cost-Benefit and Risk Assessment (understating costs/risks or overstating benefits/probabilities). See also `references/cognitive-biases/bias_mitigation_strategies.md` and `references/cognitive-biases/debiasing_examples.md` for concrete mitigation techniques.

---

## 5W1H

5W1H is a **problem-scoping** framework — it forces a complete definition of an event or problem across six dimensions before any analysis (root-cause, strategic, or otherwise) begins.

### When to Use

- Before starting an incident investigation, to make sure the problem is fully scoped
- Briefing someone who wasn't present when the event happened
- Writing an incident summary or postmortem "what happened" section
- Any time the instinct is to jump straight to "why" before the "what/who/when/where" are nailed down

**Do not use 5W1H** when the problem is already fully scoped and the need is root-cause analysis (use `fivewhys` or `fishbone` instead) or strategic assessment (use `swot`).

### Required Fields

`mode, who, what, when, where, why, how` — all six dimensions are required. Each accepts a string or an array of strings.

### Prose Invariants

- Every one of the six dimensions must be populated — a dimension that is genuinely unknown should contain `"unknown"` or `"not yet determined"`, never be silently thin.
- `why` here is the *currently understood* reason, not a drilled-down root cause — if the user needs a root cause, hand off to `fivewhys` after scoping.

See `reference/output-formats/5w1h.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive (background, extended examples, common pitfalls), see `references/01-5w1h.md`.

---

## SWOT

SWOT assesses **strategic position** by crossing two axes — Internal vs. External, and Positive vs. Negative — into a 2×2 grid: Strengths, Weaknesses, Opportunities, Threats.

### When to Use

- Evaluating whether to pursue a strategic initiative (new product, new market, new pricing model)
- Assessing a company, team, or product's competitive position
- Any "should we do this?" question where both internal capability and external environment matter

**Do not use SWOT** when the question is purely about root cause (use `fivewhys`/`fishbone`) or purely about problem scoping with no strategic dimension (use `5w1h`).

### Required Fields

`mode, strengths, weaknesses, opportunities, threats` — the four quadrant arrays.

### Prose Invariants

- **At least one item in at least two quadrants.** A SWOT with content in only one quadrant is incomplete, not legitimately lopsided — this is not schema-enforced because "at least two of four" isn't a clean per-property JSON Schema constraint, so it lives here as a prose rule.
- `strengths`/`weaknesses` must be genuinely internal (about the subject itself); `opportunities`/`threats` must be genuinely external (about the environment). Do not put a competitor's move in `weaknesses` — that's a `threat`.
- `recommendation` (optional but encouraged) should cross quadrants — e.g., use a strength to capture an opportunity, or flag where a weakness blocks an opportunity — not just restate the subject.

See `reference/output-formats/swot.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/02-swot.md`.

---

## 5 Whys

5 Whys drills from a symptom to a **single root cause** by repeatedly asking "why" — a linear chain, not a branching structure.

### When to Use

- Root-causing an incident that appears to have one linear causal chain
- Any "why did this happen" question where a single drill-down (not multiple independent categories) is expected to reach the answer

**Do not use 5 Whys** when the investigation reveals multiple independent contributing categories (people, process, tooling, environment) — use `fishbone` instead. Forcing a multi-category cause structure into a single chain produces a chain that jumps between unrelated causes at each step.

### Required Fields

`mode, problem, whys, rootCause` — `whys` is an array of `{question, answer}` pairs, `minItems: 1` (classically five, but use as many as the chain genuinely needs).

### Prose Invariants

- Each `whys[i+1].question` must ask "why" about `whys[i].answer` — the chain must actually chain, not restate the original `problem` five times with different words.
- `rootCause` must match (or closely match) the final `whys` entry's `answer`.
- `rootCause` should name a process/system-level cause, not a person — "the engineer made a mistake" is not a root cause; "no process caught the mistake before it shipped" is.

See `reference/output-formats/fivewhys.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/03-root-cause-5-whys.md`.

---

## Fishbone (Ishikawa)

Fishbone (Ishikawa) diagrams cause analysis into **multiple independent categories** ("ribs") converging on one effect — used when a problem plausibly has causes spanning different dimensions rather than one linear chain.

### When to Use

- Cause analysis needing multiple cause **categories** (people, process, tooling, environment, etc.) rather than a single linear drill-down
- Enumerating the full landscape of candidate causes before prioritizing which to address first
- Quality/manufacturing-style root-cause analysis using the classic "6Ms" (Manpower, Method, Machine, Material, Measurement, Environment) or a domain-appropriate variant (e.g., People, Process, Technology, Environment for software contexts)

**Do not use Fishbone** when the causation is a single linear chain — use `fivewhys` instead, which drills deeper rather than enumerating breadth.

### Required Fields

`mode, effect, categories` — `categories` is an array of `{name, causes[]}` objects, `minItems: 1`.

### Prose Invariants

- Category names must reflect genuinely distinct dimensions — do not split one cause across two categories, and do not create a category that only restates `effect`.
- `primaryCauses` (optional), if present, must cross-reference causes that also appear verbatim within `categories[].causes[]` — it highlights priority causes, it does not introduce new ones.
- Causes must be specific and evidence-based — "process issues" is too generic; name the actual broken process.

See `reference/output-formats/fishbone.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/04-fishbone-ishikawa.md`.

---

## PESTLE

PESTLE scans the **external macro-environment** across six categories — Political, Economic, Social, Technological, Legal, Environmental — that a SWOT's "external" quadrants only gesture at broadly.

### When to Use

- Assessing macro-level external conditions before a market entry, expansion, or major strategic bet
- The question is bigger than "opportunities/threats" — it needs a structured breakdown of *which kind* of external factor is in play (regulatory vs. economic vs. social, etc.)
- Environmental scanning as an input to a later `swot` or `decisionmatrix` analysis

**Do not use PESTLE** when the assessment is really about internal capability alongside external factors (use `swot`, which crosses both) or when only one or two external categories genuinely matter (a plain list may suffice; PESTLE's value is forcing coverage of all six).

### Required Fields

`mode, political, economic, social, technological, legal, environmental` — all six category arrays are required.

### Prose Invariants

- Each of the six lanes must be populated — a lane that is genuinely inapplicable should contain `"none identified"`, never be silently thin.
- Every factor must be external to the subject — internal capabilities and gaps belong in `swot`, not here.
- `keyFactors` (optional), if present, synthesizes across lanes (a factor commonly spans more than one category, e.g., a regulation that is both Legal and Technological) and should end with something actionable per the category's Output Quality Rules.

See `reference/output-formats/pestle.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/05-pestle.md`.

---

## Force Field Analysis

Force Field Analysis weighs **driving forces** for a proposed change against **restraining forces** resisting it, each individually scored by strength, to assess change readiness.

### When to Use

- Assessing whether a proposed change (process, policy, technical migration) is likely to succeed given the forces currently in play
- Deciding where to focus effort to unblock a stalled initiative — strengthen a driving force, or weaken a restraining one
- Any "why isn't this change happening yet, and what would it take" question

**Do not use Force Field Analysis** for root-cause investigation (use `fivewhys`/`fishbone`) or for a general strategic assessment with no single named change (use `swot`).

### Required Fields

`mode, change, drivingForces, restrainingForces` — `drivingForces`/`restrainingForces` are arrays of `{force, strength}` objects, `strength` an integer 1-5.

### Prose Invariants

- Every `strength` rating must be justified by its `force` text — a 5 should read as obviously more consequential than a 1.
- `recommendation` (optional but encouraged) must target the *specific* highest-strength restraining force(s) to address, or driving force(s) to reinforce — not a vague call to "manage change better," per the category's "end with an action" rule.
- Do not double-count a single underlying issue as both a driving and a restraining force in disguised form.

See `reference/output-formats/forcefield.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/06-force-field.md`.

---

## Decision Matrix

Decision Matrix compares **multiple options** against **multiple weighted criteria** to produce an auditable, scored recommendation — this is this category's dedicated tool for "which option should we pick," as distinct from SWOT's "should we pursue this" or PESTLE's "what's the environment."

### When to Use

- Choosing among 2+ concrete options where more than one dimension of comparison matters (cost, risk, effort, time, etc.)
- The decision needs to be auditable/defensible — someone should be able to check the math, not just trust a gut-feel ranking
- A shortlist has already been produced (by any other framework or by direct enumeration) and now needs scoring

**Do not use Decision Matrix** for open-ended option generation (a matrix needs the options already named) or when there is really only one criterion that matters (a simple ranking suffices; the matrix's value is weighting multiple criteria against each other).

### Required Fields

`mode, options, criteria, scores, recommendation` — `options` needs **≥2 entries**, `criteria` needs **≥2 entries** (both `minItems: 2`); `criteria` is an array of `{name, weight}`; `scores` is an array of `{option, perCriterion, total}`.

### Prose Invariants

- **≥2 options and ≥2 criteria** — schema-enforced, restated here because it is the mode's defining shape.
- **Exactly one `scores` entry per option.** Every option in `options[]` must have exactly one corresponding entry in `scores[]` — no missing option (unscored) and no duplicate (double-scored) option. `scores.length` must equal `options.length`.
- **Show weights × scores.** Per this category's Output Quality Rule #2, `total` must be shown as the derived weighted sum (`perCriterion[i] × criteria[i].weight`, summed), not asserted as a bare number — the recommendation must include this arithmetic so it can be checked.
- `perCriterion` arrays must match `criteria`'s length and order for every option — a silent misalignment corrupts the math even though the schema can't detect it.

See `reference/output-formats/decisionmatrix.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/07-decision-matrix.md`.

---

## Pareto (80/20)

Pareto analysis ranks contributors by value and identifies the **"vital few"** responsible for the bulk of the total, using a cumulative-percentage cutoff — this category's dedicated prioritization tool, distinct from Decision Matrix's option-comparison focus.

### When to Use

- Prioritizing which of many contributors (causes, categories, customers, bugs) to address first, when effort is limited
- The question is "which small subset drives most of the impact," not "which single option is best" (that's `decisionmatrix`) or "why did this happen" (that's `fivewhys`/`fishbone`)
- Following up a `fishbone` cause enumeration by ranking which categories/causes actually carry the most volume

**Do not use Pareto** when there is no meaningful value/volume to rank by (it needs a numeric `value` per item) or when the question is about comparing a small fixed set of options on multiple criteria (use `decisionmatrix`).

### Required Fields

`mode, items, vitalFew` — `items` is an array of `{name, value}` objects; `vitalFew` is a flat array of names copied verbatim from `items[].name`.

### Prose Invariants

- `items` should be sorted descending by `value` — an unsorted list undermines the "vital few vs. trivial many" visualization this mode exists to produce.
- `vitalFew` entries must match `items[].name` verbatim and correspond to a prefix of the sorted list (the highest-value items), not a scattered subset.
- If `cumulativePercent` is present, it must be correctly computed from `items[].value` and monotonically non-decreasing, ending at (approximately) 100.
- `recommendation` (optional but encouraged) should state roughly what share of total value `vitalFew` covers, per the category's "end with an action" rule.

See `reference/output-formats/pareto.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/08-pareto.md`.

---

## Stakeholder Analysis

Stakeholder Analysis maps everyone affected by or influencing a decision onto a **power/interest 2x2 grid**, producing a per-stakeholder engagement strategy — this category's dedicated tool for "who do we need to manage, and how," as distinct from SWOT's "should we do this" or Decision Matrix's "which option should we pick."

### When to Use

- Planning a change (new system, reorg, policy) that affects multiple people or groups with different levels of influence and interest
- Deciding who needs frequent hands-on engagement versus who just needs to be kept informed or monitored
- Any "who do we need to bring along" question before or during a rollout

**Do not use Stakeholder Analysis** for comparing options (use `decisionmatrix`) or for a general strategic assessment with no named stakeholders (use `swot`).

### Required Fields

`mode, stakeholders` — `stakeholders` is an array of `{name, power, interest, quadrant, strategy}` objects, `minItems: 1`.

### Prose Invariants

- `quadrant` must be consistent with `power`/`interest`: high power + high interest → "Manage Closely"; high power + low interest → "Keep Satisfied"; low power + high interest → "Keep Informed"; low power + low interest → "Monitor" — a quadrant that contradicts its own power/interest values is an internal inconsistency.
- `strategy` must be specific to the stakeholder's quadrant, not a generic line copy-pasted across every stakeholder.
- `recommendation` (optional but encouraged) should synthesize across quadrants — who to prioritize, who to deprioritize — per the category's "end with an action" rule.

See `reference/output-formats/stakeholder.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/09-stakeholder.md`.

---

## Cost-Benefit Analysis

Cost-Benefit Analysis weighs **quantified costs against quantified benefits** for a single option, producing an auditable go/no-go recommendation — distinct from Decision Matrix, which compares multiple options against multiple weighted criteria rather than evaluating one option's raw economics in depth.

### When to Use

- Justifying (or rejecting) a single proposed investment, migration, or initiative in dollar terms
- The decision needs an ROI/payback framing, not just a qualitative "is this a good idea"
- A specific option has already been chosen (by `decisionmatrix` or otherwise) and now needs its own financial case made

**Do not use Cost-Benefit Analysis** for comparing multiple options against each other (use `decisionmatrix`) or when costs/benefits cannot be meaningfully quantified (use `swot` or `forcefield` instead).

### Required Fields

`mode, option, costs, benefits, recommendation` — `costs`/`benefits` are arrays of `{item, amount}` objects; `npv`/`roi`/`paybackPeriod` are optional (number, string, or `null`).

### Prose Invariants

- **Show totals.** Per this category's Output Quality Rule #2, the `recommendation` must state the sum of `costs[].amount` and the sum of `benefits[].amount` explicitly — a bare go/no-go call without the underlying totals cannot be audited.
- If `roi` is present, state what period it covers — an ROI percentage without a stated time horizon is ambiguous.
- `recommendation` must make an explicit go/no-go/conditional call, per the category's "end with an action" rule.

See `reference/output-formats/costbenefit.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/10-cost-benefit.md`.

---

## Risk Assessment

Risk Assessment rates risks by **probability × impact**, producing a scored, prioritized mitigation plan — this category's dedicated tool for "what could go wrong, and in what order should we address it," distinct from Force Field's forces-for-a-change framing.

### When to Use

- Assessing the risks of a proposed change, migration, or launch before committing to it
- Prioritizing which risks to mitigate first when time/budget for mitigation is limited
- Any "what could go wrong, and how bad would it be" question that benefits from a probability × impact score rather than a flat list

**Do not use Risk Assessment** for weighing forces for/against a change in general (use `forcefield`) or for root-causing something that already happened (use `fivewhys`/`fishbone`).

### Required Fields

`mode, risks` — `risks` is an array of `{risk, probability, impact, score, mitigation}` objects, `minItems: 1`; `topRisks` (optional) is a flat array of risk strings.

### Prose Invariants

- **`score` = `probability` × `impact`.** This is the mode's defining invariant — recompute `score` from `probability` and `impact` before emitting; a `score` that doesn't match its own inputs is the single most common error in this mode.
- `topRisks[]` entries must match `risks[].risk` verbatim and correspond to the highest-`score` entries.
- `mitigation` must name a specific, actionable step, not a vague "monitor the situation."

See `reference/output-formats/riskassessment.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/11-risk-assessment.md`.

---

## Gap Analysis

Gap Analysis maps **current state vs. desired state** across named dimensions, each with an explicit delta and closing action, then rolls up into an overall action plan — this category's dedicated tool for "where are we now vs. where do we want to be, and how do we close the distance."

### When to Use

- Assessing organizational, process, or capability maturity against a target state
- Planning a transformation initiative that needs to be broken into dimension-by-dimension deltas rather than one big undifferentiated change
- Following up a `swot`/`pestle` assessment by turning identified weaknesses/gaps into a structured current-vs-desired breakdown with actions

**Do not use Gap Analysis** when there is no meaningful "current vs. desired" framing (use `swot` for general strategic assessment) or when the question is about comparing discrete options (use `decisionmatrix`).

### Required Fields

`mode, currentState, desiredState, gaps` — `gaps` is an array of `{dimension, current, desired, gap, action}` objects, `minItems: 1`; `actionPlan` (optional) is a flat array of ordered strings.

### Prose Invariants

- Each `gaps[].current`/`gaps[].desired` must be a specific instantiation of the overall `currentState`/`desiredState` for that dimension, not a restatement of the summary.
- `gap` must name the actual delta, not just juxtapose current and desired with no synthesis.
- `action` must be specific and closable; if `actionPlan` is present, it sequences the per-dimension actions into a realistic execution order across dimensions.

See `reference/output-formats/gapanalysis.md` for the authoritative schema, worked example, and verification checklist. For a fuller teaching deep-dive, see `references/12-gap-analysis.md`.

---

## Choosing Among These Twelve

- Problem not yet fully scoped? → **5w1h** first, always.
- Scoped, and the question is strategic position (should we do this, given internal + external factors)? → **swot**.
- Scoped, and the question is root cause with one expected linear chain? → **fivewhys**.
- Scoped, and the question is root cause with multiple expected independent categories? → **fishbone**.
- Scanning the external/macro environment across political/economic/social/technological/legal/environmental factors? → **pestle**.
- Weighing forces for/against a specific proposed change? → **forcefield**.
- Comparing 2+ named options against 2+ weighted criteria? → **decisionmatrix**.
- Prioritizing the vital few contributors from the trivial many, by value? → **pareto**.
- Mapping stakeholders by power and interest to plan engagement? → **stakeholder**.
- Weighing quantified costs against quantified benefits for one option? → **costbenefit**.
- Rating risks by probability × impact to prioritize mitigation? → **riskassessment**.
- Mapping current state vs. desired state with a closing action plan? → **gapanalysis**.

These twelve often chain together in a real investigation: `5w1h` to scope an incident, then `fivewhys`/`fishbone` to find the cause (optionally followed by `pareto` to rank which causes carry the most volume), with `swot`/`pestle`/`stakeholder` reserved for strategic/environmental/people assessment, `forcefield`/`decisionmatrix`/`costbenefit`/`riskassessment` reserved for deciding how or what to change once the cause and context are known, and `gapanalysis` for framing the distance between current and target state before any of the above.
