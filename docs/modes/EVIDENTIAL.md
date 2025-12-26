# Evidential Reasoning Mode

**Version**: 2.3.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_probabilistic`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/evidential.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `EvidentialThought`, `Hypothesis`, `Evidence`, `BeliefFunction`, `PlausibilityFunction`, `Decision`
- **Functions**: `isEvidentialThought`

---

## Overview

Evidential reasoning uses **Dempster-Shafer theory** to handle uncertainty and incomplete information. Unlike Bayesian reasoning which requires precise probabilities, evidential reasoning can express **degrees of belief and ignorance** separately.

This mode captures the structure of evidential reasoning - defining frames of discernment, assigning belief functions, and combining evidence.

## When to Use Evidential Mode

Use evidential reasoning when you need to:

- **Handle incomplete information** - When you can't assign precise probabilities
- **Combine conflicting evidence** - From multiple sources
- **Express ignorance explicitly** - Distinguish between disbelief and uncertainty
- **Sensor fusion** - Combine readings from multiple sensors
- **Intelligence analysis** - Aggregate uncertain intelligence

## Thought Types

| Type | Description |
|------|-------------|
| `hypothesis_definition` | Defining the frame of discernment |
| `evidence_collection` | Gathering evidence |
| `belief_assignment` | Assigning belief masses |
| `evidence_combination` | Using Dempster's rule |
| `decision_analysis` | Making decisions under uncertainty |

## Key Concepts

### Frame of Discernment
The set of all mutually exclusive hypotheses: Θ = {H1, H2, ..., Hn}

### Belief Function (Bel)
Minimum evidence support for a hypothesis: Bel(A) ≤ P(A)

### Plausibility Function (Pl)
Maximum possible support: Pl(A) = 1 - Bel(¬A) ≥ P(A)

### Uncertainty
The gap between belief and plausibility represents uncertainty: U(A) = Pl(A) - Bel(A)

## Example Usage

```json
{
  "tool": "deepthinking_probabilistic",
  "arguments": {
    "mode": "evidential",
    "thought": "Combining sensor readings for object classification",
    "thoughtNumber": 1,
    "totalThoughts": 3,
    "nextThoughtNeeded": true,
    "thoughtType": "evidence_combination",
    "frameOfDiscernment": ["Vehicle", "Pedestrian", "Cyclist"],
    "hypotheses": [
      {"id": "h1", "name": "Vehicle", "description": "Motorized vehicle", "mutuallyExclusive": true},
      {"id": "h2", "name": "Pedestrian", "description": "Person on foot", "mutuallyExclusive": true},
      {"id": "h3", "name": "Cyclist", "description": "Person on bicycle", "mutuallyExclusive": true}
    ],
    "evidence": [
      {"id": "e1", "description": "Radar signature", "source": "radar", "reliability": 0.85, "supports": ["Vehicle"]},
      {"id": "e2", "description": "Camera detection", "source": "camera", "reliability": 0.7, "supports": ["Cyclist", "Pedestrian"]}
    ],
    "beliefFunctions": [
      {"hypothesis": "Vehicle", "belief": 0.6, "plausibility": 0.75},
      {"hypothesis": "Cyclist", "belief": 0.15, "plausibility": 0.4},
      {"hypothesis": "Pedestrian", "belief": 0.1, "plausibility": 0.4}
    ]
  }
}
```

## Best Practices

1. **Define complete frame** - Ensure hypotheses are mutually exclusive and exhaustive
2. **Track source reliability** - Weight evidence by source quality
3. **Monitor conflict** - High conflict suggests flawed assumptions
4. **Distinguish belief from plausibility** - Report both values

## Related Modes

- **Bayesian** - Precise probabilistic reasoning
- **Abductive** - Hypothesis generation
- **Cryptanalytic** - Evidence quantification with decibans
