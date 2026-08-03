---
name: think-causal
description: Causal reasoning methods — Causal analysis (cause-effect mechanisms, causal graphs, confounders) and Counterfactual reasoning (what-if scenarios, alternative histories, intervention analysis). Use when the user invokes `/think causal` or `/think counterfactual`, or asks about cause-and-effect relationships, confounders, or "what would have happened if..." questions.
argument-hint: "[causal|counterfactual] <problem>"
---

# think-causal — Causal Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `causal` or `counterfactual`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains two closely related but distinct methods: **Causal Analysis** (building causal graphs, identifying mechanisms and confounders) and **Counterfactual Reasoning** (what-if scenarios, alternative histories, intervention analysis).

---

## Causal Analysis

Causal analysis builds an explicit model of cause-effect relationships between variables. It goes beyond identifying correlations to explaining the _mechanism_ by which one variable produces changes in another. Central concerns are (1) distinguishing correlation from causation, (2) identifying confounders that create spurious associations, and (3) tracing the causal chain — or chains — from a root cause to an observed effect.

### When to Use

- You need to explain _why_ something happened, not just _what_ happened
- You suspect a measured correlation may be spurious (driven by a shared cause rather than a direct link)
- You want to map the full causal structure — direct causes, indirect paths through mediators, feedback loops
- You are planning an intervention and need to predict downstream effects
- You need to identify the root cause among several interacting variables

**Do not use Causal** when:
- The question is "what would have happened if we had NOT done X?" → that is Counterfactual
- You have no observable data and are purely speculating → use Sequential or Abductive
- You only need to describe a sequence of events, not explain mechanisms → use Temporal or Historical

### Correlation vs. Causation — Core Distinction

Correlation means two variables move together. Causation means one variable _produces_ a change in the other through a mechanism. The key tests:

- **Mechanism**: Can you name the physical, chemical, informational, or logical process by which A changes B?
- **Directionality**: Does A precede B in time? Does intervening on A change B, even when nothing else changes?
- **Confounder check**: Is there a third variable C that independently causes both A and B? If so, A→B may be spurious.

**Confounders** are the most common source of misleading correlations. A confounder C affects two or more nodes in the causal graph, making them appear causally linked when the real arrows both run _from_ C, not between A and B. Identifying and adjusting for confounders is essential before concluding that A causes B.

**Causal chains vs. common causes**:
- **Causal chain**: A → B → C. A causes B, which causes C. Blocking B would break the A→C relationship.
- **Common cause**: C → A, C → B. A and B are correlated because both are caused by C. Blocking B would not prevent A, and vice versa. Intervening on A would not change B.

### How to Reason Causally

1. **List the variables.** Name every variable relevant to the problem. Classify each as cause, effect, mediator, or confounder.
2. **Draw the causal graph (DAG).** For each pair of variables, decide: is there a direct causal arrow? In which direction? A Directed Acyclic Graph (DAG) makes the structure explicit and prevents hidden circular reasoning.
3. **Name the mechanism for each edge.** Each arrow in the graph should have a description of _how_ the cause produces the effect — not just "A increases B" but "A increases B because...".
4. **Check for confounders.** For any two correlated variables, ask: is there a third variable that independently drives both? If yes, add it as a confounder node with arrows to both.
5. **Identify indirect paths.** Some effects travel through mediator nodes. Document these indirect mechanisms.
6. **Assess edge strength and confidence.** Rate each causal edge on strength (−1 to 1, where negative = inhibitory) and confidence (0 to 1).
7. **State the key causal conclusion.** What is the primary cause, and through what mechanism does it produce the observed effect?

### Output Format

See `reference/output-formats/causal.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "causal",
  "causalGraph": {
    "nodes": [
      { "id": "<id>", "name": "<name>", "type": "cause|effect|mediator|confounder", "description": "<description>" }
    ],
    "edges": [
      { "from": "<id>", "to": "<id>", "strength": 0.0, "confidence": 0.0, "mechanism": "<how A produces B>" }
    ]
  },
  "mechanisms": [
    { "from": "<id>", "to": "<id>", "description": "<full path description>", "type": "direct|indirect|feedback" }
  ],
  "confounders": [
    { "nodeId": "<id>", "affects": ["<nodeId>", "<nodeId>"], "description": "<how this confounder creates spurious correlation>" }
  ],
  "interventions": [
    {
      "nodeId": "<id>",
      "action": "<what we would do>",
      "expectedEffects": [{ "nodeId": "<id>", "expectedChange": "<description>", "confidence": 0.0 }]
    }
  ]
}
```

### Verification Before Emitting

- `mode` is exactly `"causal"`
- `causalGraph.nodes` has at least two entries
- `causalGraph.edges` has at least one entry
- Every edge `from` and `to` references a valid node `id`
- Every edge has a `mechanism` — a blank mechanism is a sign the causal claim is not yet justified
- `confounders` is present whenever two variables are correlated but the direct arrow is uncertain
- Each `strength` is in [−1, 1]; each `confidence` is in [0, 1]
- `mechanisms` array documents at least the primary causal path

### Worked Example

Input: "Did the cache eviction policy change cause the p99 latency spike last week? Database query counts and server memory also changed at the same time."

Analysis: Server memory is a confounder — the same deployment that changed the eviction policy also changed memory limits, and both independently affect latency. Simply correlating eviction policy change with latency spike would conflate the two causes.

Output:

```json
{
  "mode": "causal",
  "causalGraph": {
    "nodes": [
      { "id": "eviction", "name": "Cache Eviction Policy", "type": "cause", "description": "Changed from LRU to LFU in deployment v4.2.1" },
      { "id": "hitrate", "name": "Cache Hit Rate", "type": "mediator", "description": "Percentage of requests served from cache" },
      { "id": "dbqueries", "name": "Database Query Count", "type": "mediator", "description": "Number of queries reaching the database per second" },
      { "id": "memlimit", "name": "Server Memory Limit", "type": "confounder", "description": "Reduced from 16 GB to 12 GB in same deployment v4.2.1" },
      { "id": "latency", "name": "p99 Latency", "type": "effect", "description": "99th-percentile response time in ms" }
    ],
    "edges": [
      { "from": "eviction", "to": "hitrate", "strength": -0.6, "confidence": 0.85, "mechanism": "LFU evicts recently-added but infrequent keys; for bursty workloads this reduces hit rate vs LRU" },
      { "from": "hitrate", "to": "dbqueries", "strength": -0.9, "confidence": 0.95, "mechanism": "Each cache miss results in exactly one additional database query" },
      { "from": "dbqueries", "to": "latency", "strength": 0.8, "confidence": 0.9, "mechanism": "Each additional DB query adds ~40 ms median; under load, connection pool contention amplifies tail latency" },
      { "from": "memlimit", "to": "hitrate", "strength": -0.5, "confidence": 0.8, "mechanism": "Smaller memory limit reduces cache capacity, directly increasing eviction rate regardless of policy" },
      { "from": "memlimit", "to": "latency", "strength": 0.4, "confidence": 0.7, "mechanism": "Reduced memory triggers OS-level swapping under high load, adding I/O wait to request processing" }
    ]
  },
  "mechanisms": [
    {
      "from": "eviction",
      "to": "latency",
      "description": "Eviction policy change → lower cache hit rate → more DB queries → higher p99 latency (indirect, through hitrate and dbqueries)",
      "type": "indirect"
    },
    {
      "from": "memlimit",
      "to": "latency",
      "description": "Memory limit reduction independently raises latency through two paths: reduced cache capacity and OS swapping",
      "type": "indirect"
    }
  ],
  "confounders": [
    {
      "nodeId": "memlimit",
      "affects": ["hitrate", "latency"],
      "description": "The same deployment v4.2.1 changed both eviction policy and memory limits. Without controlling for memory, naive correlation overstates the causal effect of the eviction policy alone."
    }
  ]
}
```

Natural-language summary: "The eviction policy change does causally contribute to the latency spike — through the hitrate → dbqueries path — but it is not the sole cause. The memory limit reduction is a confounder: it was changed in the same deployment and independently raises latency through two mechanisms. Attributing the entire spike to the eviction policy would be incorrect. To isolate the policy's effect, run a controlled experiment: revert the policy with the new memory limit held fixed."

---

## Counterfactual Reasoning

Counterfactual reasoning asks: "What would have happened if some past condition had been different?" It is distinct from causal analysis in direction and purpose — causal analysis explains what _did_ happen and why; counterfactual reasoning imagines an alternative history by varying one or more conditions while holding others fixed, then traces through consequences.

### When to Use

- Post-mortem analysis: "Would we have avoided the outage if we had rolled back earlier?"
- Decision retrospectives: "Was this the right call given what we knew at the time?"
- Learning from incidents: identifying the specific intervention point that would have changed the outcome
- Planning forward: anticipating the consequences of decisions not yet taken
- Evaluating policies: comparing the actual outcome to what a different policy would have produced

**Do not use Counterfactual** when:
- The question is "what causes Y in general?" → that is Causal
- You are extrapolating from data to a general law → use Inductive
- The question is about a future decision not yet made → use Bayesian or Engineering
- You are generating creative scenarios with no grounding in an actual event → use Sequential

### Counterfactual vs. Causal — Core Distinction

- **Causal**: "What mechanism connects A to B?" Looks at the actual world and explains existing relationships.
- **Counterfactual**: "If A had been different, what would B have been?" Imagines a modified world. Requires a causal model in the background — you cannot reason counterfactually without some implicit understanding of which variables drive which.

The critical technique in counterfactual reasoning is **holding other variables fixed** while varying only the counterfactual condition. This prevents confabulation — if you vary multiple conditions simultaneously, you cannot isolate which change would have mattered.

**Intervention analysis**: A counterfactual introduces a hypothetical do-operator: "what if we had _done_ X?" This is not the same as observing that X occurred. Intervening on X severs its incoming causal arrows and asks downstream effects to propagate from the new value.

### How to Reason Counterfactually

1. **Define the actual scenario.** State the real conditions and the real outcome, as precisely as possible.
2. **Identify the single counterfactual change.** What specific condition would be different? Be precise: not "we deployed differently" but "we rolled back version 4.2.1 before 02:00 on Tuesday."
3. **Hold all other conditions fixed.** Explicitly list the conditions that remain the same in the counterfactual world. This prevents the analysis from becoming unfalsifiable.
4. **Trace the causal consequences.** Starting from the modified condition, work forward through the causal model: what downstream variables would have changed?
5. **State the counterfactual outcome.** What would the final outcome have been in this alternative world?
6. **Assess feasibility and timing.** Was the counterfactual intervention actually possible at the time? What was the window of opportunity?
7. **Extract lessons.** What does this counterfactual analysis imply for future decisions or policies?

### Output Format

See `reference/output-formats/counterfactual.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "counterfactual",
  "actual": {
    "id": "actual",
    "name": "<name of actual scenario>",
    "description": "<what actually happened>",
    "conditions": [
      { "factor": "<condition name>", "value": "<actual value>" }
    ],
    "outcomes": [
      { "description": "<what resulted>", "impact": "positive|negative|neutral", "magnitude": 0.0 }
    ]
  },
  "counterfactuals": [
    {
      "id": "cf1",
      "name": "<name of alternative scenario>",
      "description": "<the hypothetical>",
      "conditions": [
        { "factor": "<same condition>", "value": "<changed value>", "isIntervention": true },
        { "factor": "<fixed condition>", "value": "<same as actual>" }
      ],
      "outcomes": [
        { "description": "<what would have resulted>", "impact": "positive|negative|neutral", "magnitude": 0.0 }
      ],
      "likelihood": 0.0
    }
  ],
  "comparison": {
    "differences": [
      { "aspect": "<what differs>", "actual": "<actual value>", "counterfactual": "<hypothetical value>" }
    ],
    "insights": ["<insight 1>"],
    "lessons": ["<lesson for future decisions>"]
  },
  "interventionPoint": {
    "description": "<what action would have needed to be taken>",
    "timing": "<when it would have been needed>",
    "feasibility": 0.0,
    "expectedImpact": 0.0
  }
}
```

### Verification Before Emitting

- `mode` is exactly `"counterfactual"`
- `actual` is fully populated with at least one condition and one outcome
- `counterfactuals` has at least one entry
- Each counterfactual entry has exactly one condition with `isIntervention: true` — if multiple conditions are intervened on simultaneously, the analysis is no longer isolating a single counterfactual
- `comparison.lessons` is non-empty — counterfactual analysis that produces no lessons has not been completed
- `interventionPoint.feasibility` is in [0, 1]; a value near 0 indicates the counterfactual was practically impossible even if logically sound
- `likelihood` in each counterfactual is in [0, 1]

### Worked Example

Input: "Would we have avoided the outage if we had rolled back before 2 AM? The outage started at 2:47 AM after a bad deployment at midnight. We had alerts at 1:30 AM but waited."

Key technique: only the rollback timing is varied. All other conditions — the bad deployment, the system architecture, the alert threshold — remain fixed. This isolates the causal effect of the rollback decision.

Output:

```json
{
  "mode": "counterfactual",
  "actual": {
    "id": "actual",
    "name": "Midnight Deployment Outage",
    "description": "Bad deployment at 00:00; first alerts at 01:30 AM; team waited; full outage began at 02:47 AM and lasted 3.5 hours",
    "conditions": [
      { "factor": "Deployment version", "value": "v4.3.0 (bad)" },
      { "factor": "First alert time", "value": "01:30 AM" },
      { "factor": "Rollback decision", "value": "Not taken; team chose to investigate" },
      { "factor": "Outage start", "value": "02:47 AM" }
    ],
    "outcomes": [
      { "description": "Full service outage lasting 3.5 hours, affecting all users", "impact": "negative", "magnitude": 0.9 }
    ]
  },
  "counterfactuals": [
    {
      "id": "cf1",
      "name": "Rollback at 01:45 AM",
      "description": "Team initiates rollback to v4.2.0 at 01:45 AM, 15 minutes after first alert and before the cascade failure threshold",
      "conditions": [
        { "factor": "Deployment version", "value": "v4.3.0 (bad)" },
        { "factor": "First alert time", "value": "01:30 AM" },
        { "factor": "Rollback decision", "value": "Rollback initiated at 01:45 AM", "isIntervention": true },
        { "factor": "Outage start", "value": "N/A — rollback completes at 02:10 AM before cascade" }
      ],
      "outcomes": [
        { "description": "15-minute service degradation during rollback; no full outage; cascade failure never reached", "impact": "negative", "magnitude": 0.15 }
      ],
      "likelihood": 0.9
    }
  ],
  "comparison": {
    "differences": [
      { "aspect": "Rollback timing", "actual": "Never initiated", "counterfactual": "01:45 AM (before cascade threshold)" },
      { "aspect": "Outage duration", "actual": "3.5 hours full outage", "counterfactual": "~25 minutes degraded, no full outage" },
      { "aspect": "User impact", "actual": "100% of users affected for 3.5 hours", "counterfactual": "Partial degradation, no complete service loss" }
    ],
    "insights": [
      "The rollback was available and technically feasible at 01:45 AM — the window existed",
      "The cascade failure that caused full outage did not trigger until 02:47 AM, leaving a 77-minute decision window after first alert",
      "The degradation cost of an early rollback (25 min) is an order of magnitude smaller than the actual outage cost (3.5 hours)"
    ],
    "lessons": [
      "Establish a pre-agreed rollback trigger: if alerts fire within 90 minutes of a deployment and root cause is not identified in 15 minutes, initiate rollback by default",
      "The bias toward investigation over rollback is rational when rollback is costly; reduce rollback cost (faster procedure, better automation) to lower the threshold",
      "Document the cascade failure threshold — knowing at what error rate full outage becomes inevitable turns a judgment call into a measurable tripwire"
    ]
  },
  "interventionPoint": {
    "description": "Initiate rollback to v4.2.0 immediately after first alert confirmation at 01:30–01:45 AM",
    "timing": "01:30–02:00 AM window (before cascade failure threshold at ~02:30 AM)",
    "feasibility": 0.9,
    "expectedImpact": 0.85
  }
}
```

Natural-language summary: "Yes — a rollback before 2 AM would very likely have avoided the full outage. The counterfactual holds everything else fixed (same bad deployment, same alert timing, same architecture) and varies only the rollback decision. With a 77-minute window between the first alert and the cascade failure, the intervention was technically feasible (feasibility 0.9). The key lesson is structural: when rollback cost is low relative to outage cost, the default should be rollback-on-alert rather than investigate-first."
