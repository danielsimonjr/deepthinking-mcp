---
name: think-strategic
description: Strategic reasoning methods — Game Theory (Nash equilibria, payoff matrices, cooperative/non-cooperative games), Optimization (objective functions, constraints, feasible regions), and Constraint Satisfaction (CSP formulation, arc consistency, backtracking). Use when the user invokes `/think gametheory`, `/think optimization`, or `/think constraint`, or asks about strategic multi-agent interaction, resource allocation, or satisfying a set of rules simultaneously.
argument-hint: "[gametheory|optimization|constraint] <problem>"
---

# think-strategic — Strategic Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `gametheory`, `optimization`, or `constraint`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains three strategic reasoning methods: **Game Theory** (multi-agent strategic interaction and equilibria), **Optimization** (finding the best solution subject to constraints), and **Constraint Satisfaction** (finding any feasible assignment that satisfies all hard rules).

---

## Game Theory

Game Theory models situations where multiple rational agents make decisions that affect each other's outcomes. The central question is not "what is best for me in isolation?" but "what is best for me given what others will rationally do?" This interdependence is the core distinction from single-agent decision-making.

### When to Use

- Multiple agents with potentially conflicting interests must choose strategies simultaneously or sequentially
- You want to identify stable outcomes where no agent has incentive to deviate unilaterally (Nash equilibria)
- Analyzing whether cooperation is stable or whether self-interest drives agents to suboptimal outcomes
- Computing fair allocations or stable coalition structures (cooperative games, Shapley values)
- Zero-sum scenarios where one agent's gain is another's loss (minimax strategies)

**Do not use Game Theory** when:
- There is only one decision-maker — use Optimization instead
- Agents do not respond strategically to each other (no interdependence) — use Inductive or Bayesian
- You want to find the globally best outcome without modeling strategic behavior — use Optimization

### Cooperative vs. Non-Cooperative Games

The most important structural distinction:

- **Non-cooperative games**: Players choose strategies independently. Binding agreements are not enforceable. Analysis centers on Nash equilibria and dominant strategies. The Prisoner's Dilemma is the canonical example — mutual defection is the Nash equilibrium even though mutual cooperation would be better for both.
- **Cooperative games**: Players can form coalitions and make binding agreements. Analysis centers on what coalitions form and how to fairly divide the cooperative surplus. Shapley values assign each player a fair share based on their marginal contribution across all possible coalitions.

### Nash Equilibrium

A **Nash equilibrium** is a strategy profile where no single player can improve their payoff by unilaterally changing their strategy, holding all others fixed. Key properties:

- A Nash equilibrium can be in **pure strategies** (each player plays one strategy with certainty) or **mixed strategies** (players randomize over strategies with specified probabilities)
- Every finite game has at least one Nash equilibrium (possibly in mixed strategies) — Nash's theorem
- A Nash equilibrium is **strict** if every player strictly prefers their equilibrium strategy over all alternatives; no player is indifferent
- Nash equilibria can be **Pareto-dominated** — all players could be better off at a different outcome (the Prisoner's Dilemma illustrates this)

### Payoff Matrices

A **payoff matrix** represents a two-player normal-form game by listing each player's payoff for every combination of strategies:

```
                  Player 2: Cooperate   Player 2: Defect
Player 1: Cooperate    (-1, -1)            (-3, 0)
Player 1: Defect        (0, -3)            (-2, -2)
```

Each cell is (Player 1's payoff, Player 2's payoff). To find Nash equilibria, look for cells where neither player can improve by switching rows or columns. In the Prisoner's Dilemma above, (Defect, Defect) is the unique Nash equilibrium.

### Output Format

See `reference/output-formats/gametheory.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "gametheory",
  "game": {
    "name": "<game name>",
    "type": "non_cooperative",
    "isZeroSum": false
  },
  "players": [
    { "id": "p1", "name": "<Player 1>", "strategies": ["<s1>", "<s2>"] },
    { "id": "p2", "name": "<Player 2>", "strategies": ["<s1>", "<s2>"] }
  ],
  "payoffMatrix": {
    "description": "<what each payoff means>",
    "entries": [
      { "strategies": ["<p1_strategy>", "<p2_strategy>"], "payoffs": [0, 0] }
    ]
  },
  "nashEquilibria": [
    {
      "strategyProfile": ["<p1_strategy>", "<p2_strategy>"],
      "payoffs": [0, 0],
      "type": "pure",
      "isStrict": true
    }
  ],
  "dominantStrategies": [],
  "analysis": "<natural-language interpretation>"
}
```

### Verification Before Emitting

- `mode` is exactly `"gametheory"`
- `players` has at least two entries — game theory requires multiple agents
- `payoffMatrix.entries` covers every strategy combination (n × m entries for a 2-player game with n and m strategies)
- Every `nashEquilibria` entry genuinely satisfies the no-unilateral-deviation condition — verify by checking each player's payoff against alternatives in the matrix
- `type` is `"cooperative"` only when binding coalitions and fair division are the focus; otherwise use `"non_cooperative"`
- `analysis` explains the strategic implication, not just restates the payoffs

### Worked Example

Input: "Two competing streaming services (Alpha and Beta) are both considering whether to set their cache TTL to short (2 min) or long (30 min). Short TTL is more expensive but delivers fresher content. If both go short, users notice no difference and both pay high costs. If both go long, users notice no difference and both save costs. But if one goes short and the other long, the short-TTL service wins users and earns more revenue."

```json
{
  "mode": "gametheory",
  "game": {
    "name": "Cache TTL Competition",
    "type": "non_cooperative",
    "isZeroSum": false
  },
  "players": [
    { "id": "alpha", "name": "Alpha Streaming", "strategies": ["short_ttl", "long_ttl"] },
    { "id": "beta", "name": "Beta Streaming", "strategies": ["short_ttl", "long_ttl"] }
  ],
  "payoffMatrix": {
    "description": "Net profit index (higher = better). Short TTL costs 3 units; competitive win on differentiation earns 5 units.",
    "entries": [
      { "strategies": ["short_ttl", "short_ttl"], "payoffs": [-2, -2] },
      { "strategies": ["short_ttl", "long_ttl"], "payoffs": [3, -5] },
      { "strategies": ["long_ttl", "short_ttl"], "payoffs": [-5, 3] },
      { "strategies": ["long_ttl", "long_ttl"], "payoffs": [1, 1] }
    ]
  },
  "nashEquilibria": [
    {
      "strategyProfile": ["short_ttl", "short_ttl"],
      "payoffs": [-2, -2],
      "type": "pure",
      "isStrict": false
    }
  ],
  "dominantStrategies": [
    {
      "playerId": "alpha",
      "strategy": "short_ttl",
      "type": "strictly_dominant",
      "justification": "If Beta plays short_ttl: -2 > -5. If Beta plays long_ttl: 3 > 1. Short dominates regardless."
    },
    {
      "playerId": "beta",
      "strategy": "short_ttl",
      "type": "strictly_dominant",
      "justification": "Symmetric payoffs — short_ttl strictly dominates for Beta as well."
    }
  ],
  "analysis": "This is a Prisoner's Dilemma structure. Short TTL strictly dominates for both players, so (short, short) is the unique Nash equilibrium — but it yields (-2, -2) versus the mutually beneficial (long, long) at (1, 1). The competitive pressure to differentiate drives both services to the costly equilibrium. Resolution requires either a binding agreement (cooperative game) or a platform-level commitment device."
}
```

---

## Optimization

Optimization formalizes problems where you seek the best possible outcome — maximum profit, minimum cost, shortest path — subject to a set of constraints that bound the feasible region. The key distinction from Constraint Satisfaction is directionality: Optimization has a ranked preference over solutions; Constraint Satisfaction merely asks whether a valid assignment exists.

### When to Use

- You have a measurable objective and want to maximize or minimize it
- Resources are scarce and must be allocated across competing uses
- You can express the problem as: "find values of variables that minimize/maximize `f(x)` subject to `g(x) ≤ b`"
- Tradeoffs exist between multiple objectives (Pareto frontier analysis)

**Do not use Optimization** when:
- There is no objective function — you just need to satisfy rules → use Constraint Satisfaction
- Multiple competing agents are each maximizing their own payoff → use Game Theory
- The problem is about explaining observations → use Abductive or Bayesian

### Key Concepts

- **Objective function** `f(x)`: the quantity to minimize or maximize. There must be exactly one primary objective, or multiple objectives combined into a weighted sum or analyzed via Pareto dominance.
- **Decision variables** `x`: the quantities you control. Each has a domain (continuous, integer, binary) and represents a meaningful choice.
- **Constraints** `g(x) ≤ b`: conditions the solution must satisfy. Hard constraints define the **feasible region** — any solution outside it is inadmissible. Soft constraints carry penalty weights.
- **Feasible region**: the set of all variable assignments satisfying all constraints. If empty, the problem is infeasible. If unbounded, the objective may have no finite optimum.
- **Problem types**: linear (LP, solvable in polynomial time), integer (IP, NP-hard in general), nonlinear (NLP, may have local optima), multi-objective (Pareto-optimal fronts).

### Minimization vs. Maximization

Both are equivalent: `maximize f(x)` ≡ `minimize -f(x)`. Always state which direction is intended. When optimizing cost, latency, or error — minimize. When optimizing revenue, accuracy, or throughput — maximize.

### Output Format

See `reference/output-formats/optimization.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "optimization",
  "problem": {
    "name": "<problem name>",
    "type": "linear",
    "description": "<what is being optimized>"
  },
  "variables": [
    { "id": "x1", "name": "<variable>", "type": "continuous", "lowerBound": 0 }
  ],
  "objective": {
    "type": "maximize",
    "formula": "<f(x)>",
    "description": "<what the objective represents>"
  },
  "constraints": [
    {
      "id": "c1",
      "name": "<constraint name>",
      "formula": "<g(x) <= b>",
      "isHard": true,
      "rationale": "<why this limit exists>"
    }
  ],
  "solution": {
    "status": "optimal",
    "variableValues": {},
    "objectiveValue": 0,
    "bindingConstraints": []
  },
  "analysis": "<interpretation of results, sensitivity notes>"
}
```

### Verification Before Emitting

- `mode` is exactly `"optimization"`
- `objective.type` is either `"minimize"` or `"maximize"` — never both simultaneously
- All constraint `formula` fields use the declared variable `id`s — no undeclared variables
- `solution.status` reflects actual feasibility: `"optimal"` only if a global optimum is confirmed
- If the problem is integer-valued, note that LP relaxation may give a fractional solution
- `analysis` addresses which constraints are binding (active at the optimum) — these have zero slack and are the limiting factors

### Worked Example

Input: "A cloud team has a weekly budget of $10,000. They need to provision CPU-heavy (type A) and memory-heavy (type B) instances. Type A costs $200/instance and delivers 8 performance units; Type B costs $500/instance and delivers 15 performance units. They need at least 10 instances total for redundancy. How many of each to maximize total performance?"

```json
{
  "mode": "optimization",
  "problem": {
    "name": "Cloud Instance Allocation",
    "type": "integer",
    "description": "Maximize total performance units subject to budget and minimum instance count"
  },
  "variables": [
    {
      "id": "a",
      "name": "Type A instances",
      "type": "integer",
      "lowerBound": 0,
      "description": "CPU-heavy instances at $200 each, 8 perf units"
    },
    {
      "id": "b",
      "name": "Type B instances",
      "type": "integer",
      "lowerBound": 0,
      "description": "Memory-heavy instances at $500 each, 15 perf units"
    }
  ],
  "objective": {
    "type": "maximize",
    "formula": "8*a + 15*b",
    "description": "Total performance units across all provisioned instances"
  },
  "constraints": [
    {
      "id": "c1",
      "name": "Budget limit",
      "formula": "200*a + 500*b <= 10000",
      "isHard": true,
      "rationale": "Weekly cloud spend ceiling is $10,000"
    },
    {
      "id": "c2",
      "name": "Minimum redundancy",
      "formula": "a + b >= 10",
      "isHard": true,
      "rationale": "Minimum 10 instances required for HA redundancy"
    }
  ],
  "solution": {
    "status": "optimal",
    "variableValues": { "a": 0, "b": 20 },
    "objectiveValue": 300,
    "bindingConstraints": ["c1"]
  },
  "analysis": "Setting a=0 and b=20 maximizes performance at 300 units while exactly exhausting the $10,000 budget (c1 binding). The redundancy constraint (c2) is satisfied with 20 instances. Type A instances are never worth provisioning given the superior performance-per-dollar ratio of Type B (0.03 units/$ vs. 0.04 units/$). If the budget were reduced below $5,000, we would need to provision some Type A to satisfy the redundancy floor — the shadow price of c2 would become relevant there."
}
```

---

## Constraint Satisfaction

Constraint Satisfaction (CSP) asks a fundamentally different question than Optimization: not "what is the best solution?" but "does a solution exist, and what is it?" A CSP has no objective function. All solutions that satisfy all constraints are equally valid.

### When to Use

- You have hard rules that must all be satisfied simultaneously and want to know if a valid assignment exists
- Scheduling: assign tasks to time slots without conflicts
- Configuration: find a product configuration that satisfies all compatibility rules
- Resource assignment: allocate people or machines to jobs respecting capacity and preference constraints
- Logic puzzles: Sudoku, N-Queens, graph coloring, cryptarithmetic

**Do not use Constraint Satisfaction** when:
- You need the best solution among feasible ones → use Optimization
- Agents are choosing strategically against each other → use Game Theory
- The rules are uncertain or probabilistic → use Bayesian

### CSP Formulation: Variables, Domains, Constraints

Every CSP has three components:
- **Variables** `X = {x₁, x₂, ..., xₙ}`: the unknowns to assign values to
- **Domains** `D = {D₁, D₂, ..., Dₙ}`: the set of legal values each variable may take
- **Constraints** `C = {c₁, c₂, ..., cₘ}`: relations that must hold between variable values

A **solution** is a complete assignment of values from each variable's domain such that all constraints are satisfied simultaneously.

### Arc Consistency and Propagation

Before (and during) search, **constraint propagation** prunes domains to eliminate values that cannot participate in any solution:

- **Arc consistency (AC-3)**: For each arc (xᵢ, xⱼ) under constraint cᵢⱼ, remove any value from Dᵢ that has no supporting value in Dⱼ. Repeat until stable or a domain empties (infeasible).
- Domain reduction reduces the search space dramatically and often detects infeasibility early.

### Backtracking Search

When propagation alone doesn't solve the CSP, **backtracking** extends a partial assignment one variable at a time:
1. Pick an unassigned variable (heuristic: choose the one with the **smallest remaining domain** — MRV)
2. Try each value in its domain
3. Check consistency with existing assignments
4. If consistent, recurse; if not, try the next value; if all fail, backtrack to the previous variable

### Output Format

See `reference/output-formats/constraint.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "constraint",
  "problem": "<description of the CSP>",
  "variables": [
    { "id": "x1", "name": "<variable>", "domain": ["<v1>", "<v2>"] }
  ],
  "constraints": [
    {
      "id": "c1",
      "type": "<not_equal|before|alldiff|capacity|custom>",
      "variables": ["x1", "x2"],
      "expression": "<formal expression>",
      "description": "<human-readable rule>"
    }
  ],
  "propagation": {
    "method": "arc_consistency",
    "reducedDomains": {}
  },
  "solution": {
    "status": "found",
    "assignments": {},
    "backtracks": 0
  },
  "analysis": "<explanation of how constraints interacted, any near-infeasibility>"
}
```

### Verification Before Emitting

- `mode` is exactly `"constraint"`
- `variables` has at least two entries — a single-variable problem is trivially just domain filtering
- Every constraint `variables` array references valid variable `id`s from the `variables` list
- If `solution.status` is `"found"`, verify each assignment satisfies every constraint by substitution
- If `solution.status` is `"infeasible"`, identify which constraint(s) caused the empty domain
- `analysis` distinguishes CSP (feasibility only) from Optimization — do not claim this is the "best" solution

### Worked Example

Input: "Assign three engineers — Alice, Bob, and Carol — to three project roles: Frontend, Backend, and DevOps. Rules: (1) Alice cannot do DevOps (lacking cert). (2) Bob must do Backend (only one with the database specialization). (3) Each person gets exactly one role."

```json
{
  "mode": "constraint",
  "problem": "Assign three engineers to three project roles with hard eligibility constraints",
  "variables": [
    { "id": "alice", "name": "Alice's role", "domain": ["frontend", "backend", "devops"] },
    { "id": "bob",   "name": "Bob's role",   "domain": ["frontend", "backend", "devops"] },
    { "id": "carol", "name": "Carol's role", "domain": ["frontend", "backend", "devops"] }
  ],
  "constraints": [
    {
      "id": "c1",
      "type": "not_in",
      "variables": ["alice"],
      "expression": "alice != devops",
      "description": "Alice lacks DevOps certification"
    },
    {
      "id": "c2",
      "type": "equals",
      "variables": ["bob"],
      "expression": "bob == backend",
      "description": "Bob is the only engineer with database specialization"
    },
    {
      "id": "c3",
      "type": "alldiff",
      "variables": ["alice", "bob", "carol"],
      "expression": "alldiff(alice, bob, carol)",
      "description": "Each person gets exactly one distinct role"
    }
  ],
  "propagation": {
    "method": "arc_consistency",
    "reducedDomains": {
      "alice": ["frontend", "backend"],
      "bob": ["backend"],
      "carol": ["frontend", "backend", "devops"]
    },
    "steps": [
      "c2 fixes bob=backend; bob's domain reduced to [backend]",
      "c3 (alldiff) removes backend from alice and carol's domains via arc consistency",
      "c1 removes devops from alice's domain",
      "alice's domain: [frontend]; carol's domain: [devops]"
    ]
  },
  "solution": {
    "status": "found",
    "assignments": {
      "alice": "frontend",
      "bob": "backend",
      "carol": "devops"
    },
    "backtracks": 0
  },
  "analysis": "Arc consistency alone fully solved this CSP without backtracking. The hard constraint on Bob (c2) propagated immediately to eliminate backend from all other domains via alldiff. This left alice with only frontend and carol with only devops. The solution is unique — no alternative satisfies all three constraints simultaneously. Note: this is a feasibility result, not an optimality claim. If preferences existed (e.g., Carol prefers Frontend), Optimization with soft constraints would be the appropriate tool."
}
```
