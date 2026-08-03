# Evidential Thought — Output Format

Multi-source evidence aggregation using **Dempster-Shafer theory**. Unlike Bayesian reasoning, evidential reasoning can express explicit ignorance and handle conflicting evidence from sources with different reliabilities. Belief and plausibility form an uncertainty interval [belief, plausibility] around each hypothesis.

## JSON Schema

```json
{
  "mode": "evidential",
  "thoughtType": "<one of: hypothesis_definition | evidence_collection | belief_assignment | evidence_combination | decision_analysis>",
  "frameOfDiscernment": ["<H1>", "<H2>", ...],
  "hypotheses": [
    {
      "id": "<unique id>",
      "name": "<short name>",
      "description": "<description>",
      "mutuallyExclusive": <boolean>,
      "subsets": ["<related hypothesis ids>", ...]
    }
  ],
  "evidence": [
    {
      "id": "<evidence id>",
      "description": "<what was observed>",
      "source": "<source name>",
      "reliability": <number 0-1>,
      "timestamp": <Unix timestamp as number>,
      "supports": ["<hypothesis id>", ...],
      "contradicts": ["<hypothesis id>", ...]
    }
  ],
  "beliefFunctions": [
    {
      "id": "<belief function id>",
      "source": "<evidence id>",
      "massAssignments": [
        {
          "hypothesisSet": ["<hypothesis id>"],
          "mass": <number 0-1>,
          "justification": "<why this mass assignment>"
        }
      ],
      "conflictMass": <number 0-1, optional>
    }
  ],
  "combinedBelief": {
    "id": "combined",
    "source": "combined",
    "massAssignments": [
      {
        "hypothesisSet": ["<hypothesis id>"],
        "mass": <number 0-1>,
        "justification": "Dempster's rule combining all sources"
      }
    ],
    "conflictMass": <number 0-1, optional>
  },
  "plausibility": {
    "id": "<id>",
    "assignments": [
      {
        "hypothesisSet": ["<hypothesis id>"],
        "plausibility": <number 0-1>,
        "belief": <number 0-1>,
        "uncertaintyInterval": [<belief>, <plausibility>]
      }
    ]
  },
  "decisions": [
    {
      "id": "<decision id>",
      "name": "<decision name>",
      "selectedHypothesis": ["<hypothesis id>"],
      "confidence": <number 0-1>,
      "reasoning": "<justification for selection>",
      "alternatives": [
        {
          "hypothesis": ["<hypothesis id>"],
          "expectedUtility": <number>,
          "risk": <number 0-1>
        }
      ]
    }
  ]
}
```

## Required Fields

- `mode` — always `"evidential"`
- `thoughtType` — the phase of evidential analysis: `hypothesis_definition`, `evidence_collection`, `belief_assignment`, `evidence_combination`, or `decision_analysis`

## Optional but Recommended Fields

All other fields depend on `thoughtType`:
- `hypothesis_definition`: populate `frameOfDiscernment` and `hypotheses`
- `evidence_collection`: populate `evidence`
- `belief_assignment`: populate `beliefFunctions`
- `evidence_combination`: populate `combinedBelief` and `plausibility`
- `decision_analysis`: populate `decisions`

## Key Concepts

**Frame of Discernment**: The exhaustive set of mutually exclusive hypotheses. All evidence and mass assignments operate within this frame.

**Mass Assignment**: How much evidential support a source contributes to each hypothesis (or subset of hypotheses). All mass assignments for a single source must sum to 1.0.

**Ignorance Mass**: Mass assigned to the full frame (all hypotheses) — represents uncertainty that cannot be resolved by the evidence.

**Belief**: Lower bound on probability. The sum of masses of all sets that are subsets of the hypothesis.

**Plausibility**: Upper bound. Equal to 1 minus the sum of masses of all sets that are disjoint from the hypothesis.

**Uncertainty Interval [belief, plausibility]**: The narrower this interval, the more the evidence has resolved the hypothesis.

**Conflict Mass (K)**: High conflict mass (approaching 1) means sources strongly disagree. When K is high, Dempster's rule still normalizes, but the result should be treated cautiously.

## Worked Example

Input: "Radar says Vehicle. Camera says Cyclist or Pedestrian. What does the object most likely be?"

```json
{
  "mode": "evidential",
  "thoughtType": "evidence_combination",
  "frameOfDiscernment": ["Vehicle", "Pedestrian", "Cyclist"],
  "hypotheses": [
    {"id": "h1", "name": "Vehicle", "description": "Motorized vehicle", "mutuallyExclusive": true},
    {"id": "h2", "name": "Pedestrian", "description": "Person on foot", "mutuallyExclusive": true},
    {"id": "h3", "name": "Cyclist", "description": "Person on bicycle", "mutuallyExclusive": true}
  ],
  "evidence": [
    {
      "id": "e1",
      "description": "Radar signature consistent with large metallic object",
      "source": "radar",
      "reliability": 0.85,
      "timestamp": 1744358400,
      "supports": ["h1"],
      "contradicts": ["h2", "h3"]
    },
    {
      "id": "e2",
      "description": "Camera detects two-wheeled silhouette with upright rider posture",
      "source": "camera",
      "reliability": 0.7,
      "timestamp": 1744358401,
      "supports": ["h2", "h3"],
      "contradicts": []
    }
  ],
  "beliefFunctions": [
    {
      "id": "bf1",
      "source": "e1",
      "massAssignments": [
        {"hypothesisSet": ["h1"], "mass": 0.72, "justification": "Radar reliability × signal confidence"},
        {"hypothesisSet": ["h1", "h2", "h3"], "mass": 0.28, "justification": "Residual ignorance"}
      ]
    },
    {
      "id": "bf2",
      "source": "e2",
      "massAssignments": [
        {"hypothesisSet": ["h2", "h3"], "mass": 0.56, "justification": "Camera reliability × detection confidence"},
        {"hypothesisSet": ["h1", "h2", "h3"], "mass": 0.44, "justification": "Residual ignorance"}
      ]
    }
  ],
  "plausibility": {
    "id": "pl1",
    "assignments": [
      {"hypothesisSet": ["h1"], "plausibility": 0.72, "belief": 0.42, "uncertaintyInterval": [0.42, 0.72]},
      {"hypothesisSet": ["h2"], "plausibility": 0.40, "belief": 0.15, "uncertaintyInterval": [0.15, 0.40]},
      {"hypothesisSet": ["h3"], "plausibility": 0.40, "belief": 0.15, "uncertaintyInterval": [0.15, 0.40]}
    ]
  },
  "decisions": [
    {
      "id": "d1",
      "name": "Object classification",
      "selectedHypothesis": ["h1"],
      "confidence": 0.57,
      "reasoning": "Vehicle has highest belief (0.42) and plausibility (0.72). Radar's higher reliability dominates despite camera conflict.",
      "alternatives": [
        {"hypothesis": ["h2", "h3"], "expectedUtility": 0.3, "risk": 0.6}
      ]
    }
  ]
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"evidential"`
- `thoughtType` is one of the five valid enum values
- All `reliability` values are in [0, 1]
- All `mass` values per belief function sum to 1.0 (including ignorance mass)
- All `mass`, `belief`, and `plausibility` values are in [0, 1]
- Each `uncertaintyInterval[0]` (belief) ≤ `uncertaintyInterval[1]` (plausibility)
- `combinedBelief` (if present) reflects Dempster's rule of combination, not a simple average
- If `conflictMass` is high (> 0.5), flag this in the natural-language summary — high conflict means the sources fundamentally disagree
