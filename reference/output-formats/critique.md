# Critique Thought — Output Format

Peer-review style evaluation with balanced strengths, weaknesses, and all five Socratic question types.

## JSON Schema

```json
{
  "mode": "critique",
  "work": {
    "id": "<unique id>",
    "title": "<title of the work being critiqued>",
    "type": "paper|proposal|design|plan|code|argument|other",
    "claimedContribution": "<what the work claims to achieve>",
    "audience": "<intended audience>"
  },
  "strengths": [
    {
      "id": "<unique id>",
      "description": "<specific strength with concrete evidence>",
      "significance": "high|medium|low",
      "evidence": "<where in the work this strength appears>"
    }
  ],
  "weaknesses": [
    {
      "id": "<unique id>",
      "description": "<specific weakness with concrete evidence>",
      "severity": "critical|significant|minor",
      "evidence": "<where in the work this weakness appears>",
      "improvement": "<concrete actionable suggestion>"
    }
  ],
  "socraticQuestions": [
    {
      "type": "clarification|assumptions|evidence|alternative_viewpoints|implications",
      "question": "<the probing question>",
      "target": "<what aspect of the work this questions>"
    }
  ],
  "verdict": {
    "overallAssessment": "<one-sentence overall judgment>",
    "strongestClaim": "<what the work most convincingly establishes>",
    "criticalLimitation": "<the single most important limitation>",
    "recommendation": "accept|accept_with_revisions|major_revisions|reject|not_applicable"
  },
  "strengthsIdentified": 0,
  "weaknessesIdentified": 0,
  "balanceRatio": 0.0
}
```

## Required Fields

- `mode` — always `"critique"`
- `work` — characterization of what is being critiqued
- `strengths` — at least one identified strength
- `weaknesses` — at least one identified weakness with improvement suggestion
- `socraticQuestions` — at least five questions, one from each type
- `verdict` — overall assessment with recommendation
- `strengthsIdentified`, `weaknessesIdentified`, `balanceRatio` — balance accounting

## The Five Socratic Question Types

| Type | Purpose | Trigger Question |
|------|---------|-----------------|
| `clarification` | Expose ambiguity in claims or terms | "What exactly do you mean by X?" |
| `assumptions` | Surface unstated premises | "What are you assuming that may not hold?" |
| `evidence` | Challenge the basis for claims | "What is the basis for this claim?" |
| `alternative_viewpoints` | Consider competing interpretations | "Could this be interpreted differently?" |
| `implications` | Trace consequences of the argument | "If this is true, what follows?" |

## Worked Example

Input: "Critique this microservices migration proposal — what would a skeptical senior engineer ask?"

Output excerpt:

```json
{
  "mode": "critique",
  "work": {
    "id": "w1",
    "title": "Microservices Migration Proposal v1.2",
    "type": "proposal",
    "claimedContribution": "Decompose the legacy monolith into 47 microservices by Q3 2026",
    "audience": "Engineering leadership and the 5-person migration team"
  },
  "strengths": [
    {
      "id": "s1",
      "description": "The proposal correctly identifies shared-state coupling as the root cause of deployment bottlenecks, evidenced by incident data",
      "significance": "high",
      "evidence": "Section 2.1 cites 14 deployment incidents from shared-state race conditions in Q1 2026"
    }
  ],
  "weaknesses": [
    {
      "id": "wk1",
      "description": "Shared PostgreSQL database negates decoupling — services with shared tables are not truly independent",
      "severity": "critical",
      "evidence": "Architecture diagram in §4.1 shows all 47 services pointing to one database cluster",
      "improvement": "Introduce per-service databases or reduce scope to services that can have their own data stores"
    }
  ],
  "socraticQuestions": [
    {
      "type": "clarification",
      "question": "What exactly do you mean by '47 microservices'? Are these all independently deployable or do some share a release cycle?",
      "target": "Service count and independence claim in §1"
    },
    {
      "type": "assumptions",
      "question": "You assume a 5-person team can operate 47 services — have you modeled the steady-state on-call load?",
      "target": "Team capacity assumption in §3"
    },
    {
      "type": "evidence",
      "question": "What is the current measured velocity that justifies completing 47 services in 6 months?",
      "target": "Velocity improvement claim in §1"
    },
    {
      "type": "alternative_viewpoints",
      "question": "Have you considered the Strangler Fig pattern — extract one domain at a time over 18 months rather than 47 simultaneously?",
      "target": "Migration strategy in §3"
    },
    {
      "type": "implications",
      "question": "If the shared database remains, what happens when Service A's schema migration breaks Service B's read queries?",
      "target": "Shared database assumption in §4"
    }
  ],
  "verdict": {
    "overallAssessment": "Correct diagnosis, two critical structural flaws that must be resolved before the plan is actionable",
    "strongestClaim": "The DDD-based domain decomposition provides a defensible service boundary model",
    "criticalLimitation": "Shared database reproduces the coupling problem in data-layer form",
    "recommendation": "major_revisions"
  },
  "strengthsIdentified": 1,
  "weaknessesIdentified": 1,
  "balanceRatio": 0.5
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"critique"`
- `strengths` is non-empty — zero strengths means instant rejection, which must be stated explicitly
- `weaknesses` is non-empty with a concrete `improvement` for each
- `socraticQuestions` has at least 5 entries covering all 5 types: `clarification`, `assumptions`, `evidence`, `alternative_viewpoints`, `implications`
- `strengthsIdentified` and `weaknessesIdentified` match actual array lengths
- `balanceRatio` = `strengthsIdentified / (strengthsIdentified + weaknessesIdentified)`, aim 0.35–0.65
- `verdict.recommendation` is one of the five valid enum values
- Every `weakness.improvement` is concrete and actionable, not generic
