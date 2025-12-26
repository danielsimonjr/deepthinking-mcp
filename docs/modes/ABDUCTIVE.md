# Abductive Reasoning Mode

**Version**: 1.0.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_core`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/core.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `AbductiveThought`, `Observation`, `Hypothesis`, `Evidence`, `EvaluationCriteria`
- **Functions**: `isAbductiveThought`

---

## Overview

Abductive reasoning is one of the **fundamental reasoning triad** (inductive, deductive, abductive). It involves **inference to the best explanation** - generating hypotheses that would explain observed phenomena and selecting the most plausible one.

This mode captures the structure of abductive reasoning - observing phenomena, generating hypotheses, evaluating evidence, and selecting the best explanation.

## When to Use Abductive Mode

Use abductive reasoning when you need to:

- **Diagnose problems** - Find root causes of issues
- **Generate hypotheses** - Create explanatory theories
- **Debug software** - Identify causes of bugs
- **Medical diagnosis** - Explain symptoms
- **Detective work** - Solve mysteries

## Thought Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `observations` | `Observation[]` | Yes | Things requiring explanation |
| `hypotheses` | `Hypothesis[]` | Yes | Possible explanations |
| `currentHypothesis` | `Hypothesis` | No | Hypothesis being explored |
| `evaluationCriteria` | `EvaluationCriteria` | Yes | How to evaluate hypotheses |
| `evidence` | `Evidence[]` | Yes | Supporting/contradicting evidence |
| `bestExplanation` | `Hypothesis` | No | Most plausible hypothesis |

## Supporting Interfaces

### Observation
```typescript
{
  id: string;
  description: string;
  timestamp?: string;
  confidence: number; // 0-1
}
```

### Hypothesis
```typescript
{
  id: string;
  explanation: string;
  assumptions: string[];
  predictions: string[];
  score: number; // Overall ranking
}
```

### EvaluationCriteria
```typescript
{
  parsimony: number;       // Simplicity (0-1)
  explanatoryPower: number; // Coverage (0-1)
  plausibility: number;    // Prior probability (0-1)
  testability: boolean;    // Can it be tested?
}
```

## Example Usage

```json
{
  "tool": "deepthinking_core",
  "arguments": {
    "mode": "abductive",
    "thought": "Diagnosing intermittent server crashes",
    "thoughtNumber": 1,
    "totalThoughts": 4,
    "nextThoughtNeeded": true,
    "observations": [
      {"id": "o1", "description": "Server crashes during high traffic", "confidence": 0.95},
      {"id": "o2", "description": "Memory usage spikes before crash", "confidence": 0.9}
    ],
    "hypotheses": [
      {
        "id": "h1",
        "explanation": "Memory leak in connection pool",
        "assumptions": ["Fixed pool size", "No connection recycling"],
        "predictions": ["Crash correlates with connection count"],
        "score": 0.8
      },
      {
        "id": "h2",
        "explanation": "Inefficient query causing memory bloat",
        "assumptions": ["Large result sets cached in memory"],
        "predictions": ["Crash correlates with specific query patterns"],
        "score": 0.6
      }
    ],
    "evaluationCriteria": {
      "parsimony": 0.7,
      "explanatoryPower": 0.9,
      "plausibility": 0.8,
      "testability": true
    },
    "evidence": []
  }
}
```

## Best Practices

1. **Generate multiple hypotheses** - Don't settle on the first explanation
2. **Rank by explanatory power** - Prefer hypotheses that explain more observations
3. **Apply Occam's Razor** - Simpler explanations are often better
4. **Test predictions** - Verify hypotheses through their predictions
5. **Seek disconfirming evidence** - Actively try to refute hypotheses

## Related Modes

- **Inductive** - Pattern recognition feeds hypothesis generation
- **Deductive** - Derive predictions from hypotheses
- **Scientific Method** - Formal hypothesis testing
