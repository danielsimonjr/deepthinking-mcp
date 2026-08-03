---
name: think-standard
description: Standard sequential, information-theoretic, and hybrid reasoning methods. Use when the user invokes `/think sequential`, `/think shannon`, or `/think hybrid`, or asks to break down a complex task into ordered steps, decompose uncertainty systematically, or compose multiple reasoning modes for a cross-cutting problem.
argument-hint: "[sequential|shannon|hybrid] <problem>"
---

# think-standard — Standard Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `sequential`, `shannon`, or `hybrid` (or omitted if invoked via the `think` router). The rest is the problem to reason about.

This category skill contains three reasoning methods: **Sequential**, **Shannon**, and **Hybrid**.

---

## Sequential Reasoning

Sequential reasoning is general-purpose iterative thinking: break a problem into a chain of thoughts, each building on the previous, with the ability to revise or branch as understanding deepens.

### When to Use

- Breaking a complex task into ordered steps
- Planning a multi-step workflow (refactor, migration, investigation)
- Iterating on an approach where earlier thoughts may need revision
- Situations that benefit from explicit step-tracking

**Do not use Sequential** when:
- The user wants a pattern from multiple observations → use Inductive
- The user wants formal logical inference from premises → use Deductive
- The user wants a probabilistic belief update → (use Bayesian in a future version)

### How to Think Sequentially

1. **Assess total scope.** Estimate `totalThoughts` — how many steps you expect this will take. It's fine to adjust later.
2. **Produce thought N.** Each thought is a single logical step. Keep it focused on one idea or action.
3. **Track dependencies.** If thought N builds on an earlier thought, reference its id in `dependencies`.
4. **Revise if needed.** If a later thought invalidates an earlier one, set `isRevision: true`, set `revisesThought` to the earlier thought's id, and explain in `revisionReason`.
5. **Branch if exploring alternatives.** Use `branchFrom` and `branchId` to explore a parallel line of thinking without abandoning the main chain.
6. **Emit the structured output.** Follow the schema in `reference/output-formats/sequential.md`.
7. **Continue if more is needed.** Set `nextThoughtNeeded: true` when the reasoning is not complete. Set it to `false` only when the chain has reached a conclusion.

### Output Format

See `reference/output-formats/sequential.md` for the authoritative JSON schema, worked example, and verification checklist.

### Quick Template

```json
{
  "mode": "sequential",
  "thoughtNumber": 1,
  "totalThoughts": <your estimate>,
  "content": "<this thought as natural language>",
  "nextThoughtNeeded": <true if more steps remain>,
  "dependencies": [<ids of earlier thoughts this builds on>]
}
```

### Verification Before Emitting

- `mode` is exactly `"sequential"`
- `thoughtNumber` ≤ `totalThoughts`
- `content` is a complete sentence, not a stub
- `nextThoughtNeeded` is a boolean
- If `isRevision: true`, then `revisesThought` is set

### Worked Example

Input: "Break down the steps to migrate our Postgres database to a new region."

Output (thought 1 of a chain):

```json
{
  "mode": "sequential",
  "thoughtNumber": 1,
  "totalThoughts": 4,
  "content": "First, inventory the services that touch the database. We need to know everything that will need its connection string updated: API, workers, cron jobs, and any dashboards.",
  "nextThoughtNeeded": true,
  "dependencies": []
}
```

Natural-language summary: "I'm treating this as a four-step migration plan. Step 1 is service inventory — without knowing what connects to the DB, any migration plan is incomplete."

---

## Shannon-Style Decomposition

Shannon methodology is a **systematic 5-stage problem-solving approach** inspired by Claude Shannon. Rather than generic decomposition, it treats a problem as an information-theoretic object: you begin by quantifying what is unknown, then progressively reduce that uncertainty through constraint identification, mathematical modelling, proof, and implementation. Tracking `uncertainty` as a 0–1 score across all five stages is what distinguishes Shannon from sequential reasoning.

### When to Use

- You need to **define a complex problem precisely** before attempting to solve it
- You want to **identify hidden constraints** (limits not immediately obvious from the problem statement)
- The problem calls for **building a rigorous model** and then verifying it
- You need to **bridge theory and practice** — moving from an abstract characterisation to a concrete implementation
- You want an explicit record of **assumptions** and **confidence factors** at each stage

**Do not use Shannon** when:
- The problem has no modelling or proof phase → use Sequential
- You need to combine multiple reasoning styles in one chain → use Hybrid

### How to Decompose Information-Theoretically

1. **Stage 1 — Problem Definition.** State precisely what is unknown. Assign `uncertainty` a high starting value (0.6–0.85) reflecting how much you do not yet know. Name the subsystems or variables whose behaviour is uncertain.
2. **Stage 2 — Constraints.** Enumerate hard limits: correctness bounds, resource caps, time windows, compatibility requirements. Uncertainty should drop as constraints eliminate large solution spaces.
3. **Stage 3 — Model.** Build a structural or mathematical representation of the problem. State which alternative approaches you considered and why you chose this model.
4. **Stage 4 — Proof.** Verify the model. Reduce uncertainty toward 0.1–0.2. Document `knownLimitations` that the proof does not cover.
5. **Stage 5 — Implementation.** Map the proven model to a concrete, executable solution. Uncertainty may rise slightly here (practical considerations re-introduce uncertainty).

At every stage: list explicit `assumptions` and, where helpful, score `confidenceFactors` (dataQuality, methodologyRobustness, assumptionValidity).

### Output Format

See `reference/output-formats/shannon.md` for the authoritative JSON schema, field descriptions, worked example, and verification checklist.

### Quick Template

```json
{
  "mode": "shannon",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "content": "<what is unknown and how this stage reduces that uncertainty>",
  "nextThoughtNeeded": true,
  "stage": "problem_definition",
  "uncertainty": 0.75,
  "dependencies": [],
  "assumptions": ["<explicit assumption>"]
}
```

### Verification Before Emitting

- `mode` is exactly `"shannon"`
- `stage` is one of: `problem_definition`, `constraints`, `model`, `proof`, `implementation`
- `uncertainty` is a number between 0 and 1
- `uncertainty` decreases from `problem_definition` through `proof`
- `dependencies` is `[]` at stage 1; non-empty thereafter
- `assumptions` is explicitly stated by stage 2 at the latest
- `content` mentions what unknown or uncertainty this stage addresses
- `nextThoughtNeeded` is `false` only at `implementation`

### Worked Example

Input: "Decompose the problem of reducing p99 latency on our user-search API."

Output (thought 1 of 5 — problem_definition):

```json
{
  "mode": "shannon",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "content": "Define the problem: our user-search API has unacceptable p99 latency (>800ms observed, target <200ms). The reducible uncertainty is: we do not know which subsystem contributes most to tail latency. Decompose into three independently measurable sources: (1) query parsing and tokenisation, (2) index lookup and ranking, (3) serialisation and network round-trip.",
  "nextThoughtNeeded": true,
  "stage": "problem_definition",
  "uncertainty": 0.75,
  "dependencies": [],
  "assumptions": [
    "p99 is measured at the load balancer, not inside the service",
    "the three subsystems are approximately independent",
    "existing tracing covers all three stages"
  ],
  "confidenceFactors": {
    "dataQuality": 0.7,
    "methodologyRobustness": 0.8,
    "assumptionValidity": 0.65
  }
}
```

Natural-language summary: "I'm treating the latency problem as having three independently quantifiable uncertainty sources. Stage 1 names them; subsequent stages will constrain and model each one until uncertainty is near zero."

---

## Hybrid Reasoning

Hybrid mode **composes two or more reasoning modes** for problems that span multiple analytical dimensions. The key insight is that different modes excel at different sub-problems: Sequential is good at ordered chains, Shannon is good at uncertainty reduction, Bayesian is good at updating beliefs, Causal is good at identifying mechanisms. Hybrid lets you pick the right lens for each part of the problem and then synthesise the insights.

### When to Use

- The problem requires **multiple incommensurable perspectives** (e.g., safety + probability of success + hard constraints)
- You are making a **cross-domain decision** where no single reasoning style is sufficient
- You need to **dynamically adapt** your reasoning style as understanding deepens
- You need a final **synthesis** that integrates insights from at least two distinct modes

**Do not use Hybrid** when a single mode genuinely suffices — unnecessarily invoking Hybrid adds overhead without benefit.

### How to Compose Modes

Hybrid reasoning follows a three-phase structure within a thought chain:

**Phase 1 — Mode Selection (thought 1):** Identify the primary mode that structures the overall chain and the secondary lenses that address specific dimensions. Set `thoughtType: "mode_selection"`. State explicitly in `content` what each active lens will contribute. Set `switchReason` to justify the composition.

**Phase 2 — Per-lens analysis (thoughts 2..N-1):** Work through the problem. In each thought, name which secondary lens is active and what insight it provides. Use `switchReason` when changing the dominant lens mid-chain.

**Phase 3 — Convergence (thought N):** Set `thoughtType: "convergence_check"`. In `content`, explicitly state what each lens concluded and integrate those conclusions into a single recommendation. `uncertainty` should be at its lowest here.

#### Choosing `primaryMode`

| Situation | primaryMode |
|---|---|
| Decision or investigation with multiple steps | `sequential` |
| Uncertainty reduction with a formal model | `shannon` |
| Problem with mathematical structure | `mathematics` |
| Problem involving physical quantities | `physics` |

#### Choosing `secondaryFeatures`

List the additional mode names as strings (e.g., `["causal", "bayesian"]`). These are not formal mode identifiers — they are reasoning lenses. Common secondary features: `causal`, `bayesian`, `optimization`, `shannon`, `inductive`, `deductive`.

### Output Format

See `reference/output-formats/hybrid.md` for the authoritative JSON schema, worked example, and verification checklist.

### Quick Template

```json
{
  "mode": "hybrid",
  "thoughtNumber": 1,
  "totalThoughts": <estimate>,
  "content": "<what each active lens contributes and how they will be composed>",
  "nextThoughtNeeded": true,
  "primaryMode": "sequential",
  "secondaryFeatures": ["<lens1>", "<lens2>"],
  "thoughtType": "mode_selection",
  "switchReason": "<why this combination is needed>"
}
```

### Verification Before Emitting

- `mode` is exactly `"hybrid"`
- `primaryMode` is one of: `sequential`, `shannon`, `mathematics`, `physics`
- `secondaryFeatures` is a non-empty array (Hybrid with no secondary features is just Sequential)
- `content` names what each secondary lens contributes — not just "I used Bayesian" but what specific insight it produced
- Thought 1 has `thoughtType: "mode_selection"` and `switchReason` set
- Final thought has `thoughtType: "convergence_check"` and `nextThoughtNeeded: false`
- `thoughtNumber` ≤ `totalThoughts`

### Worked Example

Input: "Should we rewrite the auth system in Rust? (requires comparing safety, performance, team expertise, and migration cost.)"

Output (thought 1 of 4 — mode selection):

```json
{
  "mode": "hybrid",
  "thoughtNumber": 1,
  "totalThoughts": 4,
  "content": "This decision requires three incommensurable lenses. (1) Causal: will rewriting in Rust actually cause the safety and performance outcomes we expect, or are the failure modes in our auth system elsewhere? (2) Bayesian: given our team's current Rust proficiency, what is the posterior probability of shipping on time without regressions? (3) Shannon/constraints: what are the hard constraints—migration window, zero-downtime requirement, backward compatibility of JWTs—that any solution must satisfy regardless of language? Selecting primaryMode=sequential to frame the overall decision chain; secondaryFeatures draws on causal and bayesian lenses at each step.",
  "nextThoughtNeeded": true,
  "primaryMode": "sequential",
  "secondaryFeatures": ["causal", "bayesian", "shannon"],
  "thoughtType": "mode_selection",
  "uncertainty": 0.65,
  "dependencies": [],
  "assumptions": [
    "team has 2 engineers with production Rust experience",
    "current auth system has documented failure modes",
    "migration must be zero-downtime and backward-compatible"
  ],
  "switchReason": "The rewrite decision spans safety (causal), probability of success (bayesian), and hard constraints (shannon); no single mode is sufficient."
}
```

Natural-language summary: "I'm treating this as a four-step hybrid chain. Step 1 selects the modes and justifies the composition. Steps 2-3 apply each lens. Step 4 converges on a recommendation."
