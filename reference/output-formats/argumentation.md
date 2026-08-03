# Argumentation Thought — Output Format

Constructing rigorous arguments using the Toulmin model: claim, grounds, warrant, backing, qualifier, rebuttal.

## JSON Schema

```json
{
  "mode": "argumentation",
  "claim": {
    "id": "<unique id>",
    "statement": "<what you are asserting>",
    "type": "fact|value|policy|definition|cause",
    "scope": "universal|general|particular",
    "strength": "strong|moderate|tentative",
    "contested": true
  },
  "grounds": [
    {
      "id": "<unique id>",
      "type": "empirical|statistical|testimonial|analogical|logical",
      "content": "<the evidence>",
      "source": "<optional: citation or origin>",
      "reliability": 0.0,
      "relevance": 0.0,
      "sufficiency": "sufficient|partial|insufficient"
    }
  ],
  "warrants": [
    {
      "id": "<unique id>",
      "statement": "<the logical bridge from grounds to claim>",
      "type": "generalization|analogy|causal|authority|principle|definition",
      "implicit": false,
      "strength": 0.0,
      "groundsIds": ["<grounds ids this warrant connects>"],
      "claimId": "<claim id this warrant supports>"
    }
  ],
  "backings": [
    {
      "id": "<unique id>",
      "content": "<why the warrant should be accepted>",
      "type": "theoretical|empirical|authoritative|definitional|precedent",
      "warrantId": "<warrant id this backs>",
      "credibility": 0.0
    }
  ],
  "qualifiers": [
    {
      "id": "<unique id>",
      "term": "probably|likely|generally|in most cases|certainly",
      "certainty": 0.0,
      "conditions": ["<conditions under which the claim holds>"]
    }
  ],
  "rebuttals": [
    {
      "id": "<unique id>",
      "objection": "<the counterargument>",
      "type": "factual|logical|ethical|practical|definitional",
      "strength": "strong|moderate|weak",
      "targetElement": "claim|grounds|warrant|backing",
      "targetId": "<id of the targeted element>",
      "response": {
        "strategy": "refute|concede|qualify|reframe|outweigh",
        "content": "<how you respond to the objection>",
        "effectiveness": 0.0
      }
    }
  ],
  "argumentStrength": 0.0,
  "keyInsight": "<optional: the non-obvious insight this argument reveals>"
}
```

## Required Fields

- `mode` — always `"argumentation"`
- `claim` — the thesis with all classification fields
- `grounds` — at least one piece of evidence
- `warrants` — at least one explicit warrant connecting grounds to claim
- `backings` — at least one backing for a warrant
- `qualifiers` — at least one qualifier expressing degree of certainty
- `rebuttals` — at least one anticipated objection with a response
- `argumentStrength` — overall strength of the argument in [0, 1]

## Toulmin Model Summary

| Component | Role |
|-----------|------|
| **Claim** | What you are asserting |
| **Grounds** | The data/evidence supporting the claim |
| **Warrant** | The logical principle connecting grounds to claim |
| **Backing** | Support for the warrant itself |
| **Qualifier** | The degree of certainty (scope limiter) |
| **Rebuttal** | Anticipated objections and your responses |

## Worked Example

Input: "Argue that we should adopt feature flags for all new releases."

Output excerpt:

```json
{
  "mode": "argumentation",
  "claim": {
    "id": "c1",
    "statement": "Engineering teams should gate all new production features behind feature flags",
    "type": "policy",
    "scope": "general",
    "strength": "strong",
    "contested": true
  },
  "grounds": [
    {
      "id": "g1",
      "type": "statistical",
      "content": "Teams using feature flags reduce MTTR by 60% on average (LaunchDarkly 2023)",
      "source": "LaunchDarkly State of Feature Management Report, 2023",
      "reliability": 0.78,
      "relevance": 0.95,
      "sufficiency": "partial"
    }
  ],
  "warrants": [
    {
      "id": "w1",
      "statement": "Practices that reduce MTTR and blast radius should be adopted by teams that value reliability",
      "type": "principle",
      "implicit": false,
      "strength": 0.88,
      "groundsIds": ["g1"],
      "claimId": "c1"
    }
  ],
  "backings": [
    {
      "id": "b1",
      "content": "SRE literature establishes MTTR and blast-radius reduction as canonical reliability objectives",
      "type": "authoritative",
      "warrantId": "w1",
      "credibility": 0.90
    }
  ],
  "qualifiers": [
    {
      "id": "q1",
      "term": "generally",
      "certainty": 0.78,
      "conditions": ["Team has a flag management system", "Flags are cleaned up after full rollout"]
    }
  ],
  "rebuttals": [
    {
      "id": "r1",
      "objection": "Feature flags add code complexity and stale flags become technical debt",
      "type": "practical",
      "strength": "strong",
      "targetElement": "claim",
      "targetId": "c1",
      "response": {
        "strategy": "qualify",
        "content": "Flag debt is real; teams must enforce lifecycle discipline. The complexity cost is lower than a full-traffic incident.",
        "effectiveness": 0.78
      }
    }
  ],
  "argumentStrength": 0.78
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"argumentation"`
- `warrants` is non-empty and each warrant is explicit — implicit warrants must be surfaced and stated
- Every `warrant[*].groundsIds` references real grounds `id` values
- `backings` is non-empty — at least one warrant must be justified
- `qualifiers` is non-empty — an unqualified claim is usually overreach
- `rebuttals` is non-empty — every argument has objections; find them
- Each rebuttal has a `response` with a named strategy
- `argumentStrength` reflects reliability of grounds and coverage of rebuttals
