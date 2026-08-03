---
name: think-advanced
description: Advanced runtime reasoning methods — Recursive (self-referential decomposition, base case + recursive case, halting), Modal (possibility, necessity, alethic/epistemic/deontic modalities, possible-worlds semantics), and Stochastic (probability distributions, Monte Carlo sampling, random processes). Use when the user invokes `/think recursive`, `/think modal`, or `/think stochastic`, or asks about self-referential problems, possibility/necessity reasoning, or probabilistic processes.
argument-hint: "[recursive|modal|stochastic] <problem>"
---

# think-advanced — Advanced Runtime Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `recursive`, `modal`, or `stochastic`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains three advanced runtime reasoning patterns: **Recursive** (self-referential decomposition into smaller instances of the same problem), **Modal** (reasoning about possibility, necessity, and obligation using possible-worlds semantics), and **Stochastic** (modeling probabilistic processes via distributions, sampling, and expected values).

---

## Recursive Reasoning

Recursive reasoning decomposes a problem into **smaller instances of itself** — not just ordered steps. It identifies a base case (where recursion terminates), a recursive case (how the problem reduces to a smaller instance), and a halting condition (why the recursion must terminate). This is structurally distinct from Sequential reasoning: Sequential breaks a problem into sequential steps A → B → C; Recursive breaks a problem into a smaller version of the same problem, solved by the same rule, until a base case is reached.

### When to Use

- The problem has **self-similar structure** — solving it requires solving smaller versions of the same problem
- Divide-and-conquer algorithms, tree/graph traversal, dynamic programming
- Mathematical induction proofs
- Nested or hierarchical data where each level follows the same rules as the top level
- Backtracking search over a recursive solution space

**Do not use Recursive** when:
- The problem is a sequence of different steps (A then B then C) → use Sequential
- There is no self-similar structure — you're iterating, not recursing
- You need causal or temporal ordering, not decomposition

### How to Reason Recursively

1. **Identify the problem structure.** Can this problem be solved by solving a smaller instance of itself? What makes it self-similar?
2. **Define the base case(s).** What is the smallest instance that can be solved directly (no further recursion)? List every base case.
3. **Define the recursive case.** How does the solution to the full problem depend on the solution to the smaller instance? Write the recurrence relation explicitly.
4. **State the halting condition.** Why must the recursion terminate? What parameter strictly decreases at each recursive step?
5. **Analyze complexity.** Apply the master theorem or expand the recurrence to find time and space complexity.
6. **Consider memoization.** If subproblems overlap (dynamic programming), note which subproblems repeat and what memoization saves.

### Output Format

See `reference/output-formats/recursive.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "recursive",
  "strategy": "<divide_and_conquer | dynamic_programming | backtracking | tree_traversal | mathematical_induction>",
  "currentDepth": 0,
  "maxDepth": <integer>,
  "baseCaseReached": false,
  "baseCases": [
    { "id": "bc1", "condition": "<stopping condition>", "result": "<direct result>" }
  ],
  "recurrence": {
    "formula": "<T(n) = ... recurrence relation>",
    "closedForm": "<O(...) final complexity>",
    "timeComplexity": "<O(...)>",
    "spaceComplexity": "<O(...)>"
  },
  "subproblems": [
    { "id": "sp1", "description": "<smaller instance>", "size": "<n/2, n-1, ...>", "status": "pending" }
  ],
  "memoization": {
    "enabled": <true|false>,
    "hits": 0,
    "misses": 0,
    "cacheSize": 0
  }
}
```

### Verification Before Emitting

- `mode` is exactly `"recursive"`
- `strategy` is one of the valid enum values
- `baseCases` has at least one entry with `id`, `condition`, and `result`
- `recurrence.formula` is stated explicitly (not just "recurse")
- `maxDepth` is a positive integer bounding the recursion
- `baseCaseReached` is `false` for the initial call; set `true` only when actually at a base case
- Halting is guaranteed: the subproblem `size` strictly decreases at each recursive step

### Worked Example

Input: "Design a recursive solution for deeply nested config validation where each nested config follows the same rules as the parent."

Output:

```json
{
  "mode": "recursive",
  "strategy": "divide_and_conquer",
  "currentDepth": 0,
  "maxDepth": 20,
  "baseCaseReached": false,
  "baseCases": [
    {
      "id": "bc1",
      "condition": "config has no nested sub-configs (leaf node)",
      "result": "validate primitive fields directly; return list of field-level errors"
    },
    {
      "id": "bc2",
      "condition": "config is null or empty",
      "result": "return empty error list (nothing to validate)"
    }
  ],
  "recurrence": {
    "formula": "validate(config) = validateFields(config) ++ flatMap(validate, config.subConfigs)",
    "closedForm": "O(n) where n = total number of config nodes across all nesting levels",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(d) where d = maximum nesting depth (call stack)"
  },
  "subproblems": [
    {
      "id": "sp1",
      "description": "validate each sub-config block using the same validation rules",
      "size": "number of nodes in the sub-config subtree",
      "status": "pending"
    }
  ],
  "memoization": {
    "enabled": false,
    "hits": 0,
    "misses": 0,
    "cacheSize": 0
  }
}
```

Natural-language summary: "The recursive structure here is natural: a config is either a leaf (base case — validate its fields directly) or a composite (recursive case — validate its own fields, then recurse into each sub-config). The halting condition is guaranteed because each recursive call operates on a strictly smaller subtree. No memoization is needed because config nodes are unique — there are no overlapping subproblems. Depth is bounded at 20 to prevent stack overflow from maliciously nested configs."

---

## Modal Reasoning

Modal reasoning extends classical logic with operators for **necessity** (□ — must be true) and **possibility** (◇ — could be true). It uses **possible-worlds semantics** (Kripke frames): a proposition is *necessarily* true if it holds in all worlds accessible from the current world; *possibly* true if it holds in at least one accessible world.

Three primary modal domains:
- **Alethic** — metaphysical necessity/possibility ("It must rain" / "It could rain")
- **Epistemic** — knowledge/belief ("The agent knows P" / "The agent believes P might be true")
- **Deontic** — obligation/permission ("You must report violations" / "You may request access")

This is distinct from Bayesian reasoning: Bayesian assigns probabilities to uncertain beliefs and updates them with evidence. Modal reasoning is about the *logical structure* of possibility and necessity — whether a proposition is *logically forced* or merely *consistent* with a set of accessible worlds.

### When to Use

- Analyzing what **must** be true vs. what **could** be true in a policy, design, or argument
- Access control analysis: necessary vs. sufficient conditions for permissions
- Knowledge representation: what does agent A *know* vs. what does agent A *believe*?
- Obligation/permission analysis in legal, compliance, or protocol contexts
- Checking whether a system property holds in all reachable states or only some

**Do not use Modal** when:
- You need numerical probabilities → use Bayesian or Stochastic
- You are reasoning about causal chains → use Causal
- The necessity is empirical (based on observed data) rather than logical → use Inductive or Evidential

### How to Reason Modally

1. **Identify the modal domain.** Alethic (truth), Epistemic (knowledge), or Deontic (obligation)?
2. **Define the possible worlds.** List the distinct scenarios you are reasoning over. Mark one as the actual world.
3. **Define accessibility relations.** Which worlds are accessible from which? (Reflexive for S4/S5 systems, symmetric for B, etc.)
4. **State the propositions.** For each claim, apply □ (necessary) or ◇ (possible) operators.
5. **Evaluate in the Kripke frame.** □P is true in world w iff P is true in all worlds accessible from w. ◇P is true iff P is true in at least one accessible world.
6. **Draw modal inferences.** State what follows: countermodels (worlds where the proposition fails) rule out necessity.

### Output Format

See `reference/output-formats/modal.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "modal",
  "modalDomain": "<alethic | epistemic | deontic>",
  "logicSystem": "<K | T | S4 | S5 | D>",
  "actualWorld": "<world id>",
  "possibleWorlds": [
    { "id": "w1", "name": "<name>", "description": "<scenario>", "isActual": true, "truths": ["<proposition>"] }
  ],
  "accessibilityRelations": [
    { "from": "<world id>", "to": "<world id>", "type": "reflexive" }
  ],
  "propositions": [
    { "id": "p1", "content": "<proposition>", "operator": "<necessity | possibility>", "truthValue": true, "justification": "<why>" }
  ],
  "inferences": [
    { "id": "inf1", "premises": ["<premise>"], "conclusion": "<conclusion>", "valid": true, "justification": "<modal rule used>" }
  ]
}
```

### Verification Before Emitting

- `mode` is exactly `"modal"`
- `modalDomain` is one of `alethic`, `epistemic`, `deontic`
- `possibleWorlds` has at least one entry; exactly one has `isActual: true`
- Each proposition's `truthValue` is consistent with the Kripke frame evaluation
- □P claims `truthValue: true` only if P holds in ALL accessible worlds
- ◇P claims `truthValue: true` if P holds in AT LEAST ONE accessible world
- `inferences` cite the modal rule (e.g., necessitation, K axiom, T axiom)

### Worked Example

Input: "In which cases MUST Alice have admin access vs. COULD she have it?"

Output:

```json
{
  "mode": "modal",
  "modalDomain": "deontic",
  "logicSystem": "S5",
  "actualWorld": "w1",
  "possibleWorlds": [
    {
      "id": "w1",
      "name": "Current state",
      "description": "Alice is a senior engineer assigned to the payments team",
      "isActual": true,
      "truths": ["alice_is_senior_engineer", "alice_on_payments_team", "payments_team_requires_admin"]
    },
    {
      "id": "w2",
      "name": "Role-change scenario",
      "description": "Alice moves to the docs team, which has no admin requirement",
      "isActual": false,
      "truths": ["alice_is_senior_engineer", "alice_on_docs_team"]
    },
    {
      "id": "w3",
      "name": "Contractor scenario",
      "description": "Alice's employment changes to contractor; contractor policy forbids admin",
      "isActual": false,
      "truths": ["alice_is_contractor", "contractor_no_admin_allowed"]
    }
  ],
  "accessibilityRelations": [
    { "from": "w1", "to": "w2", "type": "reflexive" },
    { "from": "w1", "to": "w3", "type": "reflexive" }
  ],
  "propositions": [
    {
      "id": "p1",
      "content": "Alice has admin access",
      "operator": "necessity",
      "truthValue": false,
      "justification": "Admin access is NOT true in w2 and w3 — role-change and contractor scenarios both revoke it. Necessity fails."
    },
    {
      "id": "p2",
      "content": "Alice has admin access",
      "operator": "possibility",
      "truthValue": true,
      "justification": "Admin access IS true in w1 (actual world). Possibility holds."
    },
    {
      "id": "p3",
      "content": "Alice MUST have admin access when on payments team with senior engineer role",
      "operator": "necessity",
      "truthValue": true,
      "justification": "In every world where alice_is_senior_engineer AND alice_on_payments_team, payments_team_requires_admin entails admin access. Holds in all accessible worlds satisfying these conditions."
    }
  ],
  "inferences": [
    {
      "id": "inf1",
      "premises": ["alice_is_senior_engineer", "alice_on_payments_team", "payments_team_requires_admin"],
      "conclusion": "Alice MUST have admin access (conditional necessity under current role)",
      "valid": true,
      "justification": "Necessitation: if P is provable from the axioms of the frame, □P holds. Given the role policy, admin access is obligatory in w1."
    },
    {
      "id": "inf2",
      "premises": ["w2 and w3 exist and are accessible from w1"],
      "conclusion": "Alice's admin access is NOT unconditionally necessary — it depends on her role and employment type",
      "valid": true,
      "justification": "Countermodel: w2 and w3 falsify the unconditional necessity claim. ◇¬(admin) holds."
    }
  ]
}
```

Natural-language summary: "Alice's admin access is *conditionally necessary* — she MUST have it when she is a senior engineer on the payments team (the current world). But unconditional necessity fails: there exist accessible worlds (role change, contractor) where she does not have admin. The deontic reading is: the obligation to grant admin access is role-relative, not universal. Practically: access control should be tied to current role and employment type, not granted permanently."

---

## Stochastic Reasoning

Stochastic reasoning models **probabilistic processes** — situations where outcomes are governed by probability distributions, transitions between states have known probabilities, and long-run behavior can be analyzed. It covers Markov chains, random variables, Monte Carlo simulation, and queueing theory.

This is distinct from Bayesian reasoning: **Bayesian** updates *beliefs about fixed but unknown parameters* using Bayes' theorem (prior → posterior). **Stochastic** models *the underlying random process itself* — how a system evolves over time through probabilistic state transitions, and what its distribution of outcomes looks like. Bayesian asks "what is the true value of θ?" Stochastic asks "how does this random process behave over time?"

### When to Use

- Modeling a system with random state transitions (queues, customer journeys, inventory)
- Estimating expected values or distributions via Monte Carlo simulation when closed-form analysis is intractable
- Analyzing Markov chain stationary distributions (long-run proportions of time in each state)
- Queueing theory: arrival rates, service rates, wait time distributions
- Random walk, diffusion, or financial price models

**Do not use Stochastic** when:
- You are updating beliefs about a parameter from data → use Bayesian
- The randomness is about uncertainty in what to believe, not how the system transitions → use Evidential or Bayesian
- You want point estimates without modeling the process → use mathematical or quantitative Sequential

### How to Reason Stochastically

1. **Define the process type.** Discrete or continuous Markov chain? Random walk? Monte Carlo simulation? Queueing model?
2. **Define the states.** List every possible state the system can be in. Note absorbing states (once entered, cannot leave).
3. **Specify transitions.** For each state pair (from, to), give the transition probability. Probabilities from each state must sum to 1.0.
4. **Analyze long-run behavior.** Compute or reason about the stationary distribution: the fraction of time the process spends in each state in the long run.
5. **Set up random variables.** Name distributions (Exponential, Poisson, Normal, Uniform) and their parameters.
6. **Simulate or compute.** For complex processes, describe a Monte Carlo simulation: number of runs, summary statistics (mean, variance, 95% confidence interval).

### Output Format

See `reference/output-formats/stochastic.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "stochastic",
  "processType": "<discrete_markov_chain | continuous_markov_chain | random_walk | monte_carlo | queueing>",
  "stepCount": 0,
  "states": [
    { "id": "<id>", "name": "<name>", "description": "<desc>", "isAbsorbing": false, "isTransient": false }
  ],
  "transitions": [
    { "from": "<state id>", "to": "<state id>", "probability": <0-1> }
  ],
  "markovChain": {
    "id": "mc1",
    "states": ["<state ids>"],
    "transitionMatrix": [[<row>]],
    "initialDistribution": [<values summing to 1>],
    "stationaryDistribution": [<values summing to 1>],
    "isIrreducible": <true|false>,
    "isAperiodic": <true|false>,
    "isErgodic": <true|false>
  },
  "randomVariables": [
    { "id": "rv1", "name": "<name>", "distribution": "<Exponential | Poisson | Normal | Uniform>", "parameters": { "<param>": <value> }, "mean": <number>, "variance": <number> }
  ]
}
```

### Verification Before Emitting

- `mode` is exactly `"stochastic"`
- `processType` is one of the valid enum values
- `transitions` from each state sum to 1.0 (or explain if not normalized)
- `stationaryDistribution` values sum to 1.0 when present
- `isErgodic` is `true` only if both `isIrreducible` and `isAperiodic` are `true`
- Random variable `distribution` names match the actual distributions used
- Mean and variance are consistent with the stated distribution and parameters

### Worked Example

Input: "Model the distribution of queue wait times for our ticket system."

Output:

```json
{
  "mode": "stochastic",
  "processType": "queueing",
  "stepCount": 0,
  "states": [
    { "id": "empty", "name": "Empty Queue", "description": "No tickets waiting; server idle", "isAbsorbing": false, "isTransient": false },
    { "id": "busy_1", "name": "1 Ticket Being Processed", "description": "One ticket in service, none waiting", "isAbsorbing": false, "isTransient": false },
    { "id": "busy_2plus", "name": "Queue Building", "description": "One in service, one or more waiting", "isAbsorbing": false, "isTransient": false }
  ],
  "transitions": [
    { "from": "empty", "to": "empty", "probability": 0.30 },
    { "from": "empty", "to": "busy_1", "probability": 0.70 },
    { "from": "busy_1", "to": "empty", "probability": 0.55 },
    { "from": "busy_1", "to": "busy_2plus", "probability": 0.45 },
    { "from": "busy_2plus", "to": "busy_1", "probability": 0.60 },
    { "from": "busy_2plus", "to": "busy_2plus", "probability": 0.40 }
  ],
  "markovChain": {
    "id": "mc_ticket_queue",
    "states": ["empty", "busy_1", "busy_2plus"],
    "transitionMatrix": [
      [0.30, 0.70, 0.00],
      [0.55, 0.00, 0.45],
      [0.00, 0.60, 0.40]
    ],
    "initialDistribution": [1.0, 0.0, 0.0],
    "stationaryDistribution": [0.32, 0.39, 0.29],
    "isIrreducible": true,
    "isAperiodic": true,
    "isErgodic": true
  },
  "randomVariables": [
    {
      "id": "rv_arrival",
      "name": "Ticket inter-arrival time",
      "distribution": "Exponential",
      "parameters": { "rate": 5.0 },
      "mean": 0.20,
      "variance": 0.04
    },
    {
      "id": "rv_service",
      "name": "Ticket service time",
      "distribution": "Exponential",
      "parameters": { "rate": 8.0 },
      "mean": 0.125,
      "variance": 0.016
    },
    {
      "id": "rv_wait",
      "name": "Customer wait time (M/M/1 formula)",
      "distribution": "Exponential",
      "parameters": { "rate": 3.0 },
      "mean": 0.333,
      "variance": 0.111
    }
  ]
}
```

Natural-language summary: "This is an M/M/1 queue model: Poisson arrivals at rate λ=5 tickets/min, Exponential service at rate μ=8 tickets/min. Traffic intensity ρ = λ/μ = 0.625 — the queue is stable (ρ < 1). The stationary distribution shows the server is idle about 32% of the time. The expected wait time (including service) is 1/(μ-λ) = 1/3 minute ≈ 20 seconds. In the busy_2plus state (~29% of the time), tickets queue up; improving service rate to μ=10 would drop expected wait to 20 seconds and reduce busy_2plus to ~15% of the time."
