# Bayesian Reasoning Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized - Auto Posteriors)
**Tool**: `deepthinking_probabilistic`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/bayesian.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `BayesianHypothesis`, `PriorProbability`, `Likelihood`, `BayesianEvidence`, `PosteriorProbability`, `SensitivityAnalysis`, `BayesianThought`
- **Functions**: `isBayesianThought`

---

## Overview

Bayesian mode provides **probabilistic reasoning** using Bayes' theorem for updating beliefs based on evidence. It supports hypothesis testing, prior/posterior probability tracking, likelihood computation, and sensitivity analysis.

**Bayes' Theorem**: P(H|E) = P(E|H) × P(H) / P(E)

This mode captures the structure of Bayesian reasoning - from hypothesis formation through evidence accumulation to posterior belief updates.

## When to Use Bayesian Mode

Use Bayesian mode when you need to:

- **Update beliefs with evidence** - Incorporate new information
- **Test hypotheses** - Evaluate competing explanations
- **Handle uncertainty** - Probabilistic reasoning under uncertainty
- **Accumulate evidence** - Build confidence over multiple observations
- **Assess sensitivity** - How conclusions depend on priors

### Problem Types Well-Suited for Bayesian Mode

- **Diagnostic reasoning** - Medical diagnosis, fault detection
- **Hypothesis testing** - Scientific inference
- **Risk assessment** - Probabilistic risk analysis
- **Decision under uncertainty** - Optimal decisions with incomplete info
- **Learning from data** - Updating models with observations

## Core Concepts

### Hypothesis

```typescript
interface BayesianHypothesis {
  id: string;
  statement: string;
  alternatives?: string[];  // Alternative hypotheses
}
```

### Prior Probability

The initial belief before observing evidence:

```typescript
interface PriorProbability {
  probability: number;      // 0-1
  justification: string;    // Why this prior
}
```

### Likelihood

Probability of evidence given hypothesis:

```typescript
interface Likelihood {
  probability: number;      // P(E|H)
  description: string;
}
```

### Evidence

```typescript
interface BayesianEvidence {
  id: string;
  description: string;
  likelihoodGivenHypothesis: number;     // P(E|H)
  likelihoodGivenNotHypothesis: number;  // P(E|¬H)
  timestamp?: string;
}
```

### Posterior Probability

Updated belief after observing evidence:

```typescript
interface PosteriorProbability {
  probability: number;      // 0-1
  calculation: string;      // How it was computed
  confidence: number;       // 0-1
}
```

### Sensitivity Analysis

```typescript
interface SensitivityAnalysis {
  priorRange: [number, number];
  posteriorRange: [number, number];
}
```

## Bayes' Theorem

$$P(H|E) = \frac{P(E|H) \times P(H)}{P(E)}$$

Where:
- **P(H|E)** = Posterior probability (belief after evidence)
- **P(E|H)** = Likelihood (probability of evidence if H is true)
- **P(H)** = Prior probability (initial belief)
- **P(E)** = Evidence probability = P(E|H)×P(H) + P(E|¬H)×P(¬H)

### Bayes Factor

The **Bayes factor** measures the strength of evidence:

$$BF = \frac{P(E|H)}{P(E|¬H)}$$

Interpretation:
- BF > 10: Strong evidence for H
- BF 3-10: Moderate evidence
- BF 1-3: Weak evidence
- BF < 1: Evidence against H

## Usage Example

```typescript
// Form hypothesis
const hypothesis = await deepthinking_probabilistic({
  mode: 'bayesian',
  thought: 'Form hypothesis about system failure cause',
  thoughtNumber: 1,
  totalThoughts: 4,
  nextThoughtNeeded: true,

  hypothesis: {
    id: 'h1',
    statement: 'The memory leak is caused by the caching layer',
    alternatives: ['connection pool exhaustion', 'log file accumulation']
  },
  prior: {
    probability: 0.3,
    justification: 'Based on historical incidents, 30% of memory issues are cache-related'
  },
  likelihood: {
    probability: 0.85,
    description: 'If cache is the cause, we expect high heap usage'
  },
  evidence: [],
  posterior: {
    probability: 0.3,
    calculation: 'No evidence yet, posterior equals prior',
    confidence: 0.3
  }
});

// Add first evidence
const evidence1 = await deepthinking_probabilistic({
  mode: 'bayesian',
  thought: 'Incorporate heap dump analysis evidence',
  thoughtNumber: 2,
  totalThoughts: 4,
  nextThoughtNeeded: true,

  hypothesis: {
    id: 'h1',
    statement: 'The memory leak is caused by the caching layer'
  },
  prior: {
    probability: 0.3,
    justification: 'Initial prior'
  },
  likelihood: {
    probability: 0.85,
    description: 'Cache issues typically show in heap'
  },
  evidence: [{
    id: 'e1',
    description: 'Heap dump shows 40% of memory in cache objects',
    likelihoodGivenHypothesis: 0.9,     // P(E|H) - very likely if cache is cause
    likelihoodGivenNotHypothesis: 0.2,  // P(E|¬H) - unlikely otherwise
    timestamp: '2024-01-15T10:30:00Z'
  }],
  posterior: {
    probability: 0.66,
    calculation: 'P(H|E) = (0.9 × 0.3) / ((0.9 × 0.3) + (0.2 × 0.7)) = 0.66',
    confidence: 0.7
  },
  bayesFactor: 4.5  // 0.9 / 0.2 - moderate evidence
});

// Add second evidence
const evidence2 = await deepthinking_probabilistic({
  mode: 'bayesian',
  thought: 'Incorporate memory profiler evidence',
  thoughtNumber: 3,
  totalThoughts: 4,
  nextThoughtNeeded: true,

  hypothesis: {
    id: 'h1',
    statement: 'The memory leak is caused by the caching layer'
  },
  prior: {
    probability: 0.66,  // Previous posterior becomes new prior
    justification: 'Updated from first evidence'
  },
  likelihood: {
    probability: 0.95,
    description: 'Profiler shows cache allocation pattern'
  },
  evidence: [
    { id: 'e1', description: 'Heap dump evidence', likelihoodGivenHypothesis: 0.9, likelihoodGivenNotHypothesis: 0.2 },
    {
      id: 'e2',
      description: 'Profiler shows unbounded cache growth over time',
      likelihoodGivenHypothesis: 0.95,
      likelihoodGivenNotHypothesis: 0.1,
      timestamp: '2024-01-15T11:00:00Z'
    }
  ],
  posterior: {
    probability: 0.95,
    calculation: 'P(H|E₁,E₂) = (0.95 × 0.66) / ((0.95 × 0.66) + (0.1 × 0.34)) = 0.95',
    confidence: 0.9
  },
  bayesFactor: 9.5  // Strong evidence
});

// Sensitivity analysis
const sensitivity = await deepthinking_probabilistic({
  mode: 'bayesian',
  thought: 'Analyze sensitivity to prior assumptions',
  thoughtNumber: 4,
  totalThoughts: 4,
  nextThoughtNeeded: false,

  hypothesis: {
    id: 'h1',
    statement: 'The memory leak is caused by the caching layer'
  },
  prior: {
    probability: 0.3,
    justification: 'Initial prior'
  },
  likelihood: {
    probability: 0.95,
    description: 'Combined likelihood'
  },
  evidence: [
    { id: 'e1', description: 'Heap dump', likelihoodGivenHypothesis: 0.9, likelihoodGivenNotHypothesis: 0.2 },
    { id: 'e2', description: 'Profiler', likelihoodGivenHypothesis: 0.95, likelihoodGivenNotHypothesis: 0.1 }
  ],
  posterior: {
    probability: 0.95,
    calculation: 'Final posterior',
    confidence: 0.9
  },
  sensitivity: {
    priorRange: [0.1, 0.5],      // Even with skeptical to generous prior
    posteriorRange: [0.89, 0.97]  // Posterior remains high
  }
});
```

## Best Practices

### Prior Selection

✅ **Do:**
- Base priors on domain knowledge
- Document prior justification
- Consider informative vs uninformative priors

❌ **Don't:**
- Use arbitrary priors
- Ignore prior sensitivity
- Set extreme priors (0 or 1)

### Evidence Evaluation

✅ **Do:**
- Estimate likelihoods carefully
- Consider P(E|¬H) not just P(E|H)
- Accumulate evidence sequentially

❌ **Don't:**
- Confuse P(E|H) with P(H|E)
- Ignore evidence against hypothesis
- Double-count evidence

### Posterior Interpretation

✅ **Do:**
- Track confidence alongside probability
- Perform sensitivity analysis
- Consider alternative hypotheses

❌ **Don't:**
- Over-interpret weak posteriors
- Ignore uncertainty
- Stop updating with new evidence

## BayesianThought Interface

```typescript
interface BayesianThought extends BaseThought {
  mode: ThinkingMode.BAYESIAN;
  hypothesis: BayesianHypothesis;
  prior: PriorProbability;
  likelihood: Likelihood;
  evidence: BayesianEvidence[];
  posterior: PosteriorProbability;
  bayesFactor?: number;
  sensitivity?: SensitivityAnalysis;
}
```

## Integration with Other Modes

Bayesian mode integrates with:

- **Causal Mode** - Bayesian networks for causation
- **Game Theory Mode** - Games with incomplete information
- **Cryptanalytic Mode** - Deciban evidence accumulation
- **Scientific Method** - Hypothesis testing

## Related Modes

- [Causal Mode](./CAUSAL.md) - Causal Bayesian networks
- [Game Theory Mode](./GAMETHEORY.md) - Bayesian games
- [Cryptanalytic Mode](./CRYPTANALYTIC.md) - Evidence-based analysis
- [Scientific Method Mode](./SCIENTIFICMETHOD.md) - Hypothesis testing

## Limitations

- **No network support** - Single hypothesis focus
- **Manual computation** - No automated inference
- **Subjective priors** - Prior selection requires expertise

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
