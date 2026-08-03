# Systems Thinking Thought — Output Format

Holistic analysis of complex systems through stocks, flows, feedback loops, and leverage points. Reveals why problems recur and where interventions will have lasting effect.

## JSON Schema

```json
{
  "mode": "systemsthinking",
  "systemName": "<name of the system being analyzed>",
  "boundary": "<what is included and what is excluded from the model>",
  "stocks": [
    {
      "id": "<unique identifier>",
      "name": "<human-readable name>",
      "description": "<what accumulates in this stock>"
    }
  ],
  "feedbackLoops": [
    {
      "id": "<unique identifier>",
      "name": "<descriptive name including type>",
      "type": "reinforcing | balancing",
      "components": ["<id or name of variables in the loop, in order>"],
      "description": "<how the loop works and what behavior it produces>"
    }
  ],
  "archetype": "<one of the 8 archetypes, or null if none applies>",
  "leveragePoints": [
    {
      "location": "<where in the system to intervene>",
      "type": "paradigm | structure | information | rules | flows | parameters",
      "intervention": "<what action to take>",
      "rationale": "<why this intervention is effective at this location>"
    }
  ],
  "delays": ["<significant time delays and their impact on system behavior>"],
  "unintendedConsequences": ["<likely side-effects of common or obvious interventions>"]
}
```

## Required Fields

- `mode` — always `"systemsthinking"`
- `systemName` — the name of the system being modeled
- `boundary` — what is in and out of scope; an unbounded model is an incomplete model
- `stocks` — at least one accumulation (the "nouns" of the system)
- `feedbackLoops` — at least one loop; identify type as `reinforcing` or `balancing`

## Optional Fields

- `archetype` — one of the 8 Systems Archetypes if a recognizable pattern applies; `null` otherwise
- `leveragePoints` — where and how to intervene; `type` drawn from Meadows' leverage hierarchy
- `delays` — significant time lags between cause and effect; these are a primary source of instability
- `unintendedConsequences` — what obvious interventions get wrong; the core insight of systems thinking

## The 8 Systems Archetypes

| Archetype | Key Dynamic |
|-----------|------------|
| **Fixes that Fail** | Quick fix relieves symptom, but side-effects worsen the underlying problem |
| **Shifting the Burden** | Symptomatic fix used repeatedly; fundamental solution atrophies |
| **Limits to Growth** | Reinforcing growth engine hits a balancing constraint that activates as growth progresses |
| **Eroding Goals** | Gap between goal and reality addressed by lowering the goal instead of improving performance |
| **Escalation** | Two actors each respond to the other's increase with their own increase — arms race |
| **Success to the Successful** | Two activities compete for shared resources; the winner draws more, the loser starves |
| **Tragedy of the Commons** | Individual optimization over-exploits a shared resource, degrading it for everyone |
| **Accidental Adversaries** | Two allies take actions that inadvertently undermine each other's success |

## Leverage Point Types (Meadows' Hierarchy, Most to Least Powerful)

| Type | Description |
|------|-------------|
| `paradigm` | Change the system's purpose or goal |
| `structure` | Change feedback loop connections |
| `information` | Change who gets what information and when |
| `rules` | Change incentives, constraints, and policies |
| `flows` | Change material stocks and flow rates |
| `parameters` | Change constants (least powerful; most commonly targeted) |

## Worked Example

Input: "Why does the bug count keep rising even though we hire more QA engineers?"

```json
{
  "mode": "systemsthinking",
  "systemName": "Software Quality Assurance System",
  "boundary": "Engineering and QA teams; excludes product scope definition and customer behavior",
  "stocks": [
    { "id": "bug_backlog", "name": "Bug Backlog", "description": "Open defects awaiting fix; grows with new bugs introduced, shrinks with fixes verified" },
    { "id": "tech_debt", "name": "Technical Debt", "description": "Accumulated code complexity that increases the bug introduction rate per feature delivered" }
  ],
  "feedbackLoops": [
    {
      "id": "R1",
      "name": "Debt-Bugs Reinforcing Loop",
      "type": "reinforcing",
      "components": ["tech_debt", "bug_introduction_rate", "bug_backlog", "qa_workload", "deferred_refactoring", "tech_debt"],
      "description": "Technical debt raises the bug introduction rate. A larger bug backlog consumes QA time on triage and regression, leaving less time for refactoring. Deferred refactoring lets debt grow further — a vicious reinforcing cycle."
    },
    {
      "id": "B1",
      "name": "QA Hiring Balancing Loop",
      "type": "balancing",
      "components": ["bug_backlog", "qa_capacity_gap", "new_qa_hires", "qa_throughput", "bug_backlog"],
      "description": "A growing bug backlog triggers QA hiring. New QA capacity increases throughput, reducing the backlog. However, the hiring response has a 3–6 month delay, and new hires initially increase onboarding overhead."
    }
  ],
  "archetype": "Fixes that Fail",
  "leveragePoints": [
    {
      "location": "tech_debt stock",
      "type": "rules",
      "intervention": "Enforce a definition-of-done that includes test coverage thresholds; block merges that increase debt metrics above a defined threshold",
      "rationale": "The R1 loop is driven by the debt stock. Policy changes that prevent debt from accumulating break the reinforcing loop before it accelerates."
    }
  ],
  "delays": [
    "QA hires take 3–6 months to reach full testing throughput — the bug backlog continues to grow during this period",
    "Technical debt effects on bug rate become measurable 2–4 sprints after the debt was incurred, making root-cause diagnosis difficult"
  ],
  "unintendedConsequences": [
    "Hiring more QA engineers without reducing the bug introduction rate increases the total size of the regression suite, slowing each test cycle and reducing the velocity of bug fixes — the B1 balancing loop stalls at a lower equilibrium",
    "Fast-tracking bug fixes under pressure often introduces new bugs in adjacent code, feeding the R1 reinforcing loop"
  ]
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"systemsthinking"`
- `stocks` has at least one entry with `id`, `name`, and `description`
- `feedbackLoops` has at least one entry; each loop is classified as `reinforcing` or `balancing`
- Each loop's `components` lists at least two elements forming a closed causal chain
- If an archetype applies, it is named from the 8 archetypes listed above
- `leveragePoints` has at least one entry when the analysis is actionable
- `leveragePoints[*].type` is drawn from Meadows' hierarchy
- `unintendedConsequences` is populated — if none come to mind, the analysis is likely incomplete
- `delays` are identified for any loop that contains a significant time lag
