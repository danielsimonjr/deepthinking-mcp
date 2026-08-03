---
name: think-scientific
description: Scientific and structural reasoning methods — Scientific Method (hypothesis formation, experiment design, falsifiability), Systems Thinking (feedback loops, 8 systems archetypes, leverage points), and Formal Logic (propositional/predicate logic, formal proofs, soundness). Use when the user invokes `/think scientificmethod`, `/think systemsthinking`, or `/think formallogic`, or asks about experiment design, systemic behavior, or formal logical proofs.
argument-hint: "[scientificmethod|systemsthinking|formallogic] <problem>"
---

# think-scientific — Scientific and Structural Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `scientificmethod`, `systemsthinking`, or `formallogic`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains three structural reasoning patterns: **Scientific Method** (hypothesis-driven experimentation), **Systems Thinking** (feedback loops, archetypes, leverage), and **Formal Logic** (proof construction, validity, soundness).

---

## Scientific Method

Scientific Method reasoning structures inquiry as a reproducible cycle: form a question, generate falsifiable hypotheses, design a controlled experiment, collect data, analyze results, and revise. It is especially valuable when the root cause of a problem is unknown and competing explanations must be differentiated through empirical evidence.

### When to Use

- You need to test a hypothesis rigorously rather than assume it is true
- Diagnosing a performance, reliability, or correctness problem with multiple candidate causes
- Designing a controlled experiment (A/B test, canary deploy, load test, bench test)
- Drawing defensible, evidence-based conclusions from data
- The problem requires distinguishing correlation from causation

**Do not use Scientific Method** when:
- The answer can be derived from existing rules alone → use Deductive
- You are generalizing from a pattern in past observations without designing a new test → use Inductive
- A formal proof is required, not empirical validation → use Formal Logic

### The Scientific Cycle

1. **Question formulation.** State a precise, answerable question. Identify independent variables (what you manipulate), dependent variables (what you measure), and control variables (what you hold constant).
2. **Hypothesis generation.** Produce at least a null hypothesis (H₀: no effect) and an alternative hypothesis (H₁: the predicted effect). Each hypothesis must be **testable** and **falsifiable** — if no possible observation could refute it, it is not a scientific hypothesis.
3. **Experiment design.** Choose an experiment type (experimental, quasi-experimental, observational). Specify sample size, randomization, blinding (if applicable), and the exact procedure. State what would count as a positive result and what would count as a refutation.
4. **Data collection.** Record observations and measurements systematically. Note any deviations from the planned procedure.
5. **Analysis.** Apply appropriate statistical tests. Check whether assumptions are met. Compute effect size, not just p-value.
6. **Conclusion.** Accept or reject H₀ based on pre-defined criteria. State confidence in the result, limitations, and what further experiments are needed.

### Falsifiability Requirement

A hypothesis is falsifiable if there exists a possible observation that would prove it false. "The system sometimes slows down" is not falsifiable — it can never be disproved. "Increasing the thread pool from 4 to 16 reduces p99 latency by ≥20% under 1,000 concurrent users" is falsifiable — a specific measurement can refute it.

Falsifiability is not just good epistemics; it is a design constraint. If your hypothesis cannot be falsified, your experiment cannot test it.

### Output Format

See `reference/output-formats/scientificmethod.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "scientificmethod",
  "question": "<precise, answerable research question>",
  "nullHypothesis": "<H₀: no effect statement>",
  "alternativeHypothesis": "<H₁: predicted effect statement>",
  "falsifiable": true,
  "experimentType": "experimental | quasi_experimental | observational",
  "independentVariables": ["<what you manipulate>"],
  "dependentVariables": ["<what you measure>"],
  "controlVariables": ["<what you hold constant>"],
  "procedure": ["<step 1>", "<step 2>"],
  "successCriteria": "<what result would confirm H₁>",
  "result": "<observed outcome, if available>",
  "conclusion": "<accept or reject H₀, and why>",
  "confidence": <0.0 to 1.0>,
  "limitations": ["<known limits of this experiment>"]
}
```

### Verification Before Emitting

- `mode` is exactly `"scientificmethod"`
- `nullHypothesis` and `alternativeHypothesis` are both present
- `falsifiable` is `true` — if not, revise the hypothesis before proceeding
- `independentVariables`, `dependentVariables`, and `controlVariables` are all populated
- `successCriteria` is specific enough that a measurement could either meet or fail it
- `confidence` reflects the quality of the experimental design and available evidence

### Worked Example

Input: "Is the latency spike caused by GC pauses? Design an experiment to test this."

Output:

```json
{
  "mode": "scientificmethod",
  "question": "Do GC pauses in the JVM service account for the observed p99 latency spikes above 500 ms?",
  "nullHypothesis": "GC pause duration is not correlated with p99 latency spikes; removing GC pauses will not reduce p99 latency below 500 ms",
  "alternativeHypothesis": "GC pauses ≥50 ms directly cause p99 latency spikes above 500 ms; switching to ZGC will reduce p99 latency by ≥40%",
  "falsifiable": true,
  "experimentType": "experimental",
  "independentVariables": ["GC algorithm (G1GC vs ZGC)"],
  "dependentVariables": ["p99 response latency (ms)", "GC pause frequency (pauses/min)", "GC pause duration (ms)"],
  "controlVariables": ["JVM heap size", "traffic load (requests/sec)", "application version", "server hardware"],
  "procedure": [
    "Enable JVM GC logging with -Xlog:gc* to baseline G1GC pause data for 24 hours",
    "Correlate GC pause timestamps with p99 latency spikes using a 100 ms window",
    "Deploy canary instance with ZGC under identical load for 24 hours",
    "Compare p99 distributions: G1GC baseline vs ZGC canary using Welch's t-test"
  ],
  "successCriteria": "ZGC canary shows ≥40% reduction in p99 latency AND GC pause frequency in baseline correlates with spike events at r ≥ 0.7",
  "result": null,
  "conclusion": null,
  "confidence": 0.0,
  "limitations": [
    "Single 24-hour window may not capture weekly traffic patterns",
    "ZGC trades pause frequency for higher concurrent GC CPU overhead — must monitor CPU utilization"
  ]
}
```

Natural-language summary: "The hypothesis is falsifiable and testable: we can measure whether GC pauses co-occur with latency spikes (correlational arm) and whether eliminating long pauses via ZGC removes the spikes (experimental arm). If both arms confirm H₁, GC is the cause. If the ZGC canary still spikes, a different mechanism is responsible."

---

## Systems Thinking

Systems Thinking reasons about complex, interconnected systems — teams, organizations, infrastructure, ecosystems — by modeling stocks (accumulations), flows (rates of change), feedback loops, and delays. It reveals why simple interventions often fail: you are pushing against a system that has its own dynamics.

### When to Use

- A problem keeps returning after apparent fixes — you are likely treating symptoms, not the system structure
- Adding resources (people, servers, budget) makes things worse, not better
- An intervention worked short-term but produced harmful long-term consequences
- You want to identify where an intervention would have the most leverage
- The problem involves multiple interacting variables with delays between cause and effect

**Do not use Systems Thinking** when:
- The system has fewer than three interacting variables with no feedback → use Causal
- You need a point-in-time causal explanation, not ongoing dynamic behavior → use Causal
- The problem is a one-time logical inference → use Deductive or Formal Logic

### Key Concepts

**Stocks** are accumulations that change over time: technical debt, team morale, backlog size, user trust, server memory usage.

**Flows** are rates that change stocks: new bugs introduced per sprint (inflow to technical debt), bugs fixed per sprint (outflow from technical debt).

**Feedback Loops** are closed causal chains:
- **Reinforcing loop (R)** — amplifies change in one direction. More pressure → more shortcuts → more technical debt → slower velocity → more pressure. Also called a "vicious cycle" when the amplification is harmful, or a "virtuous cycle" when beneficial.
- **Balancing loop (B)** — counteracts change and seeks equilibrium. Higher bug count → more time on fixes → fewer features shipped → pressure to reduce bugs addressed. Balancing loops produce goal-seeking behavior.

**Delays** between cause and effect are a primary source of system instability. When a loop contains a long delay, actors often over-correct because they do not see the effect of their prior actions yet.

### The 8 Systems Archetypes

Systems Thinking identifies recurring causal structures — archetypes — that appear across domains. Recognizing the archetype names the dynamic and suggests the leverage point.

| Archetype | Structure | Symptom | Leverage |
|-----------|-----------|---------|----------|
| **Fixes that Fail** | Quick fix → symptom relief → unintended side-effect → symptom worsens | Problem returns after every fix | Address the fundamental solution, not just the symptom |
| **Shifting the Burden** | Symptomatic fix used repeatedly; fundamental solution atrophied or never developed | Dependency on the fix grows; underlying capability degrades | Reduce reliance on symptomatic fix; invest in fundamental solution |
| **Limits to Growth** | Reinforcing growth engine + balancing constraint that activates as growth progresses | Growth slows and stalls unexpectedly | Identify and address the limiting constraint before it activates |
| **Eroding Goals** | Gap between goal and reality addressed by lowering the goal rather than improving performance | Standards drift downward over time | Hold or raise the goal; treat goal-lowering as the problem |
| **Escalation** | Two actors, each responding to the other's increase with their own increase | Arms race, bidding war, retaliation cycle | Unilateral de-escalation or negotiated cap |
| **Success to the Successful** | Two activities compete for the same limited resource; one gets more resources and performs better, drawing yet more resources | Winner-take-all dynamic; the losing activity starves | Decouple the resource allocation from prior performance |
| **Tragedy of the Commons** | Multiple actors share a common resource; each actor's individual optimum over-exploits the common resource | Shared resource degrades; collective outcome is worse than individual optima | Regulate usage, privatize the resource, or cultivate shared norms |
| **Accidental Adversaries** | Two parties start as allies; each takes actions that, as a side-effect, undermine the other's success | Alliance deteriorates into apparent competition | Make side-effects explicit; redesign actions to avoid harming the partner |

### Leverage Points

Donella Meadows' hierarchy of leverage points (most to least powerful):
1. **Paradigm / Goal** — Change what the system is trying to achieve
2. **System structure** — Change feedback loop connections
3. **Information flows** — Who gets what data, and when
4. **Rules** — Change incentives, constraints, and policies
5. **Material stocks and flows** — Change the accumulations or rates
6. **Parameters** — Change constants (buffer sizes, rates) — least powerful, but most commonly targeted

### Output Format

See `reference/output-formats/systemsthinking.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "systemsthinking",
  "systemName": "<name of the system being analyzed>",
  "boundary": "<what is included and excluded>",
  "stocks": [
    { "id": "<id>", "name": "<name>", "description": "<what accumulates>" }
  ],
  "feedbackLoops": [
    {
      "id": "<id>",
      "name": "<name>",
      "type": "reinforcing | balancing",
      "components": ["<stock/variable ids in order>"],
      "description": "<how the loop works>"
    }
  ],
  "archetype": "<name of the archetype if one applies, or null>",
  "leveragePoints": [
    {
      "location": "<where in the system>",
      "type": "paradigm | structure | information | rules | flows | parameters",
      "intervention": "<what to do>",
      "rationale": "<why this is effective>"
    }
  ],
  "delays": ["<significant delays and their impact>"],
  "unintendedConsequences": ["<likely side-effects of common interventions>"]
}
```

### Verification Before Emitting

- `mode` is exactly `"systemsthinking"`
- `stocks` has at least one entry
- `feedbackLoops` has at least one entry; each loop is classified as `reinforcing` or `balancing`
- If an archetype applies, it is named explicitly from the 8 archetypes above
- `leveragePoints` includes at least one entry, and the type is drawn from Meadows' hierarchy
- `unintendedConsequences` captures at least one likely side-effect — if none come to mind, the analysis is incomplete

### Worked Example

Input: "Why does adding more developers to the team keep slowing down delivery?"

Output:

```json
{
  "mode": "systemsthinking",
  "systemName": "Software Development Team Productivity",
  "boundary": "Single development team; excludes external dependencies and product scope changes",
  "stocks": [
    { "id": "knowledge", "name": "Shared Knowledge Base", "description": "How much of the codebase each developer understands; accumulated over time through code review and pairing" },
    { "id": "tech_debt", "name": "Technical Debt", "description": "Accumulated shortcuts, missing tests, and deferred refactors" },
    { "id": "coordination", "name": "Coordination Overhead", "description": "Meeting hours + communication cost per sprint; increases with team size" }
  ],
  "feedbackLoops": [
    {
      "id": "R1",
      "name": "Deadline Pressure → Shortcuts Loop (Reinforcing)",
      "type": "reinforcing",
      "components": ["deadline_pressure", "shortcuts", "tech_debt", "velocity_loss", "deadline_pressure"],
      "description": "Schedule pressure causes developers to take shortcuts, growing technical debt, reducing future velocity, which increases pressure — a vicious reinforcing cycle"
    },
    {
      "id": "B1",
      "name": "Hiring Balancing Loop",
      "type": "balancing",
      "components": ["capacity_gap", "new_hires", "onboarding_load", "senior_dev_time", "capacity_gap"],
      "description": "Hiring reduces the capacity gap, but onboarding consumes senior developer time, temporarily reducing productivity until new hires become productive (3–6 month delay)"
    }
  ],
  "archetype": "Limits to Growth",
  "leveragePoints": [
    {
      "location": "tech_debt stock",
      "type": "structure",
      "intervention": "Dedicate 20% of each sprint to debt reduction before adding new developers",
      "rationale": "Growing technical debt is the binding constraint. Adding developers to a debt-laden system amplifies the constraint rather than relieving it — the limiting factor must be addressed before scaling."
    },
    {
      "location": "onboarding process",
      "type": "information",
      "intervention": "Build automated runbooks and architecture decision records so new hires can self-onboard with less senior developer time",
      "rationale": "Reduces the delay in B1, making each hire net-positive faster and reducing the temporary productivity dip after each hire"
    }
  ],
  "delays": [
    "New hires reach full productivity after 3–6 months; hiring decisions made today affect throughput in Q2/Q3, not next sprint",
    "Technical debt accumulates silently — the cost becomes visible only when velocity starts declining, typically 2–4 sprints after the debt was incurred"
  ],
  "unintendedConsequences": [
    "Adding developers without addressing technical debt accelerates the reinforcing R1 loop: more developers produce more shortcuts under the same schedule pressure",
    "Mandating overtime to hit deadlines depletes the knowledge stock (turnover) and accelerates technical debt, making the system worse after the deadline passes"
  ]
}
```

Natural-language summary: "This is a classic **Limits to Growth** archetype. The growth engine (hiring) is being constrained by technical debt — the more developers added, the more the coordination overhead and debt-driven slowdowns absorb their capacity. The leverage point is addressing the constraint (debt) before scaling. Adding developers without reducing debt is the 'fix that fails' inside the larger Limits to Growth structure."

---

## Formal Logic

Formal Logic reasoning applies the rules of symbolic logic — propositional and predicate logic — to construct proofs that are not merely persuasive but rigorously valid. The key distinction: unlike Deductive reasoning (which uses natural language syllogisms), Formal Logic uses explicit proof steps, each justified by a named inference rule, creating a chain of derivations that can be mechanically checked.

### When to Use

- You need to verify that a conclusion is necessarily entailed by premises (not just plausible)
- Constructing or checking a formal proof for a logical theorem
- Evaluating whether a complex multi-step argument is valid
- Checking whether a logical formula is satisfiable (can it be true at all?) or a tautology (is it always true?)
- Discovering what follows from a set of constraints or axioms

**Do not use Formal Logic** when:
- Premises are uncertain or probabilistic → use Bayesian
- You want a natural-language syllogism for reasoning about a real-world decision → use Deductive
- The problem requires empirical validation, not logical derivation → use Scientific Method

### Propositional vs. Predicate Logic

**Propositional logic** deals with atomic statements (P, Q, R…) connected by operators: ¬ (not), ∧ (and), ∨ (or), → (implies), ↔ (if and only if). Every statement is either true or false.

**Predicate logic** extends propositional logic with:
- **Predicates**: `Human(Socrates)`, `Mortal(x)`
- **Quantifiers**: ∀x ("for all x"), ∃x ("there exists an x")
- This allows statements like "All humans are mortal" to be expressed as ∀x(Human(x) → Mortal(x))

### Validity vs. Soundness

- **Validity** — The argument form is correct: if the premises were true, the conclusion would necessarily follow. Validity is purely structural.
- **Soundness** — The argument is valid AND all premises are actually true. Only sound arguments guarantee true conclusions.

A valid-but-unsound argument: "All even numbers are prime. 4 is even. Therefore 4 is prime." — Valid form, false premise, false conclusion.

### Key Inference Rules

| Rule | Form | Description |
|------|------|-------------|
| Modus Ponens | P, P→Q ⊢ Q | From P and "if P then Q", derive Q |
| Modus Tollens | ¬Q, P→Q ⊢ ¬P | From "not Q" and "if P then Q", derive "not P" |
| Hypothetical Syllogism | P→Q, Q→R ⊢ P→R | Chain of conditionals |
| Conjunction Introduction | P, Q ⊢ P∧Q | Combine two truths into a conjunction |
| Simplification | P∧Q ⊢ P | Extract from a conjunction |
| Addition | P ⊢ P∨Q | Extend to a disjunction |
| Disjunctive Syllogism | P∨Q, ¬P ⊢ Q | Eliminate one disjunct |
| Conditional Proof | Assume P, derive Q → prove P→Q | Introduce a conditional via assumption |
| Reductio ad Absurdum | Assume ¬P, derive contradiction → prove P | Proof by contradiction |

### Proof Structure

A formal proof is a numbered sequence of steps. Each step is either:
1. A **premise** (given, no justification needed)
2. An **assumption** (introduced for a subproof; must be discharged)
3. A **derived statement** (requires a justification rule + step references)

The proof is **complete** when the target theorem appears on a step with no undischarged assumptions.

### Output Format

See `reference/output-formats/formallogic.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "formallogic",
  "theorem": "<statement to be proved>",
  "propositions": [
    { "id": "<id>", "symbol": "<P>", "statement": "<natural language>", "type": "atomic | compound" }
  ],
  "proof": {
    "technique": "direct | conditional | contradiction | induction",
    "steps": [
      {
        "step": 1,
        "statement": "<logical statement>",
        "formula": "<symbolic formula>",
        "justification": "Premise | Assumption | <rule name>",
        "refs": []
      }
    ],
    "conclusion": "<final proved statement>",
    "valid": true
  },
  "validityCheck": true,
  "soundnessCheck": true
}
```

### Verification Before Emitting

- `mode` is exactly `"formallogic"`
- Every proof step has a `justification` that names a recognized inference rule or flags it as "Premise" or "Assumption"
- Every `refs` array points to valid prior step numbers
- All assumptions are discharged before the proof concludes
- `validityCheck` is `true` only if every step follows from prior steps by a valid rule
- `soundnessCheck` is `true` only if additionally all premises are actually true
- The `theorem` statement matches the final proof step's statement

### Worked Example

Input: "Prove that if it is raining, the ground is wet — and it is raining — therefore the ground is wet."

More interesting: prove Hypothetical Syllogism — if P→Q and Q→R, then P→R.

Output:

```json
{
  "mode": "formallogic",
  "theorem": "(P→Q) ∧ (Q→R) → (P→R)",
  "propositions": [
    { "id": "P", "symbol": "P", "statement": "It is raining", "type": "atomic" },
    { "id": "Q", "symbol": "Q", "statement": "The road is wet", "type": "atomic" },
    { "id": "R", "symbol": "R", "statement": "There is a risk of skidding", "type": "atomic" }
  ],
  "proof": {
    "technique": "conditional",
    "steps": [
      {
        "step": 1,
        "statement": "Assume (P→Q) ∧ (Q→R)",
        "formula": "(P→Q) ∧ (Q→R)",
        "justification": "Assumption",
        "refs": []
      },
      {
        "step": 2,
        "statement": "P→Q",
        "formula": "P→Q",
        "justification": "Simplification",
        "refs": [1]
      },
      {
        "step": 3,
        "statement": "Q→R",
        "formula": "Q→R",
        "justification": "Simplification",
        "refs": [1]
      },
      {
        "step": 4,
        "statement": "Assume P",
        "formula": "P",
        "justification": "Assumption",
        "refs": []
      },
      {
        "step": 5,
        "statement": "Q",
        "formula": "Q",
        "justification": "Modus Ponens",
        "refs": [4, 2]
      },
      {
        "step": 6,
        "statement": "R",
        "formula": "R",
        "justification": "Modus Ponens",
        "refs": [5, 3]
      },
      {
        "step": 7,
        "statement": "P→R",
        "formula": "P→R",
        "justification": "Conditional Proof (discharge assumption at step 4)",
        "refs": [4, 6]
      },
      {
        "step": 8,
        "statement": "(P→Q) ∧ (Q→R) → (P→R)",
        "formula": "(P→Q) ∧ (Q→R) → (P→R)",
        "justification": "Conditional Proof (discharge assumption at step 1)",
        "refs": [1, 7]
      }
    ],
    "conclusion": "(P→Q) ∧ (Q→R) → (P→R)",
    "valid": true
  },
  "validityCheck": true,
  "soundnessCheck": null
}
```

Natural-language summary: "The proof has 8 steps using only Simplification, Modus Ponens, and Conditional Proof (conditional introduction). Both assumptions are properly discharged at steps 7 and 8. The theorem is valid: Hypothetical Syllogism is a tautology — it holds for all truth-value assignments to P, Q, and R. Soundness cannot be determined without knowing whether the premises hold in the actual world, so `soundnessCheck` is null."
