# Analysis Thought — Output Format

Layered systematic decomposition: surface observation → structural analysis → pattern identification → synthesis of insights. Distinguished from Sequential (ordered steps) by four examination layers with coverage tracking.

## JSON Schema

```json
{
  "mode": "analysis",
  "subject": "<what is being analyzed>",
  "scope": {
    "inScope": ["<aspects included>"],
    "outOfScope": ["<aspects explicitly excluded>"],
    "justification": "<why this scope was chosen>"
  },
  "layers": {
    "surface": {
      "observations": ["<directly observable fact or behavior>"],
      "coverage": 0.0
    },
    "structural": {
      "components": [
        {
          "id": "<unique id>",
          "name": "<component name>",
          "role": "<what it does>",
          "dependencies": ["<id of components it depends on>"]
        }
      ],
      "relationships": [
        {
          "from": "<component id>",
          "to": "<component id>",
          "type": "depends_on|calls|owns|produces|consumes|controls",
          "description": "<nature of the relationship>"
        }
      ],
      "coverage": 0.0
    },
    "patterns": [
      {
        "id": "<unique id>",
        "name": "<pattern name>",
        "description": "<what the pattern is>",
        "type": "trend|failure_mode|design_choice|anomaly|absence",
        "evidence": ["<component or observation ids>"],
        "significance": "high|medium|low"
      }
    ],
    "synthesis": {
      "insights": [
        {
          "id": "<unique id>",
          "insight": "<actionable conclusion>",
          "basis": ["<pattern ids this is based on>"],
          "confidence": 0.0
        }
      ],
      "recommendations": ["<concrete action or next step>"]
    }
  },
  "coverage": {
    "layersCovered": ["surface", "structural", "patterns", "synthesis"],
    "estimatedCompleteness": 0.0,
    "blindSpots": ["<what is missing from this analysis>"],
    "wouldChangeAnalysisIf": ["<what unknown information would materially alter conclusions>"]
  }
}
```

## Required Fields

- `mode` — always `"analysis"`
- `subject` — what is being analyzed
- `scope` — explicit in/out scope with justification
- `layers` — all four layers: `surface`, `structural`, `patterns`, `synthesis`
- `coverage` — completeness tracking with blind spots

## The Four Examination Layers

| Layer | Question | What It Reveals |
|-------|----------|-----------------|
| **Surface** | What is observable? | Symptoms, behaviors, outputs |
| **Structural** | What components and relationships underlie this? | Architecture, dependencies, interfaces |
| **Patterns** | What regularities or anomalies emerge? | Trends, failure modes, design decisions |
| **Synthesis** | What do the patterns collectively imply? | Root causes, systemic insights, recommendations |

## How Analysis Differs from Sequential

Sequential produces **ordered steps** (do step 1, then step 2). Analysis produces **layered examination** — each layer reveals what the previous layer missed. You may move between layers as the analysis demands, but you must cover all four before the analysis is complete.

## Worked Example

Input: "Analyze the failure mode of our authentication service."

Output excerpt:

```json
{
  "mode": "analysis",
  "subject": "Authentication service failure modes",
  "scope": {
    "inScope": ["Login and token-issuance flow", "Session validation middleware"],
    "outOfScope": ["Authorization", "User registration"],
    "justification": "Scoping to authentication (identity verification) only"
  },
  "layers": {
    "surface": {
      "observations": [
        "Login endpoint returns 200 with a valid JWT on success",
        "No observable rate limiting on the login endpoint in staging"
      ],
      "coverage": 0.75
    },
    "structural": {
      "components": [
        { "id": "c1", "name": "Login Handler", "role": "Validates credentials, issues JWT", "dependencies": ["c2", "c3"] },
        { "id": "c2", "name": "User Store", "role": "Stores hashed passwords", "dependencies": [] },
        { "id": "c3", "name": "Token Service", "role": "Signs JWTs using RS256", "dependencies": ["c4"] },
        { "id": "c4", "name": "Key (env var)", "role": "Holds RSA private key", "dependencies": [] }
      ],
      "relationships": [
        { "from": "c1", "to": "c2", "type": "calls", "description": "Reads hashed password" },
        { "from": "c3", "to": "c4", "type": "depends_on", "description": "Token signing requires private key" }
      ],
      "coverage": 0.80
    },
    "patterns": [
      {
        "id": "p1",
        "name": "Key stored as environment variable",
        "description": "RSA private key in env var — potentially logged, visible in process listings, hard to rotate",
        "type": "failure_mode",
        "evidence": ["c4"],
        "significance": "high"
      },
      {
        "id": "p2",
        "name": "No rate limiting on login",
        "description": "Credential stuffing can proceed unimpeded",
        "type": "absence",
        "evidence": ["c1"],
        "significance": "high"
      }
    ],
    "synthesis": {
      "insights": [
        {
          "id": "i1",
          "insight": "Two high-severity patterns (key exposure + no rate limiting) represent independent attack vectors that could be exploited simultaneously",
          "basis": ["p1", "p2"],
          "confidence": 0.85
        }
      ],
      "recommendations": [
        "Migrate RSA key to AWS Secrets Manager with automatic rotation",
        "Implement rate limiting: 5 failed attempts per account per 15 minutes"
      ]
    }
  },
  "coverage": {
    "layersCovered": ["surface", "structural", "patterns", "synthesis"],
    "estimatedCompleteness": 0.65,
    "blindSpots": ["Session invalidation logic", "Audit logging completeness"],
    "wouldChangeAnalysisIf": [
      "Confirmation that rate limiting exists at the WAF layer would lower p2 severity"
    ]
  }
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"analysis"`
- All four layers are present: `surface`, `structural`, `patterns`, `synthesis`
- `layers.structural.components` has at least 2 entries
- `layers.patterns` is non-empty — no patterns found must be stated as a pattern-absence finding
- `layers.synthesis.insights` is non-empty, each citing `basis` pattern ids
- `coverage.blindSpots` is non-empty — acknowledge what you did not examine
- `coverage.wouldChangeAnalysisIf` is non-empty — identifies high-value unknown information
- `coverage.estimatedCompleteness` is honest — do not claim 0.9 if only surface was covered
- This is layered examination, not a list of steps — do not confuse with Sequential mode
