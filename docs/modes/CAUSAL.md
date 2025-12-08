# Causal Reasoning Mode

**Version**: 7.3.0
**Tool**: `deepthinking_causal`
**Status**: Experimental
**Source**: `src/types/modes/causal.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `CausalNode`, `CausalEdge`, `CausalGraph`, `Intervention`, `CausalMechanism`, `Confounder`, `CounterfactualScenario`, `CausalThought`
- **Functions**: `isCausalThought`

---

## Overview

Causal mode provides **causal graph modeling** with interventions, mechanisms, confounders, and counterfactual analysis. It supports building directed acyclic graphs (DAGs) representing causal relationships and reasoning about interventions.

This mode captures the structure of causal reasoning - from identifying causes and effects to analyzing interventions and counterfactuals.

## When to Use Causal Mode

Use causal mode when you need to:

- **Model cause-effect relationships** - Build causal graphs
- **Analyze interventions** - What happens if we change X?
- **Identify confounders** - Find spurious correlations
- **Reason about mechanisms** - Understand how causes produce effects
- **Evaluate counterfactuals** - What would have happened if...?

### Problem Types Well-Suited for Causal Mode

- **Root cause analysis** - Finding the cause of problems
- **Impact analysis** - Predicting effects of changes
- **Scientific reasoning** - Understanding mechanisms
- **Policy analysis** - Evaluating intervention effects
- **Debugging** - Tracing causal chains in systems

## Core Concepts

### Causal Nodes

```typescript
interface CausalNode {
  id: string;
  name: string;
  type: 'cause' | 'effect' | 'mediator' | 'confounder';
  description: string;
}
```

Node types:
- **cause** - Direct cause of outcomes
- **effect** - Outcome or dependent variable
- **mediator** - Intermediate variable in causal chain
- **confounder** - Variable affecting both cause and effect

### Causal Edges

```typescript
interface CausalEdge {
  from: string;       // Node ID
  to: string;         // Node ID
  strength: number;   // -1 to 1 (negative = inhibitory)
  confidence: number; // 0-1
  mechanism?: string; // How the cause produces the effect
}
```

### Causal Graph

```typescript
interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}
```

### Interventions

```typescript
interface Intervention {
  nodeId: string;
  action: string;
  expectedEffects: {
    nodeId: string;
    expectedChange: string;
    confidence: number;
  }[];
}
```

### Causal Mechanisms

```typescript
interface CausalMechanism {
  from: string;
  to: string;
  description: string;
  type: 'direct' | 'indirect' | 'feedback';
}
```

### Confounders

```typescript
interface Confounder {
  nodeId: string;
  affects: string[];   // Node IDs affected
  description: string;
}
```

### Counterfactuals

```typescript
interface CounterfactualScenario {
  description: string;
  modifiedNodes: { nodeId: string; newValue: string }[];
  predictedOutcome: string;
}
```

## Usage Example

```typescript
// Build causal graph
const causalGraph = await deepthinking_causal({
  mode: 'causal',
  thought: 'Model the causal structure of system performance issues',
  thoughtNumber: 1,
  totalThoughts: 4,
  nextThoughtNeeded: true,

  causalGraph: {
    nodes: [
      { id: 'load', name: 'System Load', type: 'cause', description: 'Number of concurrent users' },
      { id: 'memory', name: 'Memory Usage', type: 'mediator', description: 'RAM consumption' },
      { id: 'cache', name: 'Cache Hit Rate', type: 'mediator', description: 'Cache effectiveness' },
      { id: 'latency', name: 'Response Latency', type: 'effect', description: 'End-user response time' },
      { id: 'deployment', name: 'Recent Deployment', type: 'confounder', description: 'Code changes affecting multiple factors' }
    ],
    edges: [
      { from: 'load', to: 'memory', strength: 0.8, confidence: 0.9, mechanism: 'More users require more memory' },
      { from: 'load', to: 'cache', strength: -0.3, confidence: 0.7, mechanism: 'High load reduces cache effectiveness' },
      { from: 'memory', to: 'latency', strength: 0.6, confidence: 0.85, mechanism: 'Memory pressure causes swapping' },
      { from: 'cache', to: 'latency', strength: -0.7, confidence: 0.9, mechanism: 'Better cache reduces latency' },
      { from: 'deployment', to: 'memory', strength: 0.4, confidence: 0.6, mechanism: 'New code may have memory leak' },
      { from: 'deployment', to: 'cache', strength: -0.3, confidence: 0.5, mechanism: 'Cache invalidation from deployment' }
    ]
  },
  mechanisms: [
    {
      from: 'load',
      to: 'latency',
      description: 'High load increases latency through memory and cache paths',
      type: 'indirect'
    }
  ]
});

// Identify confounders
const confounders = await deepthinking_causal({
  mode: 'causal',
  thought: 'Identify confounding variables',
  thoughtNumber: 2,
  totalThoughts: 4,
  nextThoughtNeeded: true,

  causalGraph: { /* same as above */ },
  confounders: [{
    nodeId: 'deployment',
    affects: ['memory', 'cache', 'latency'],
    description: 'Recent deployment affects multiple variables, creating spurious correlations'
  }],
  mechanisms: [
    {
      from: 'deployment',
      to: 'latency',
      description: 'Deployment affects latency through both memory and cache paths',
      type: 'indirect'
    }
  ]
});

// Analyze intervention
const intervention = await deepthinking_causal({
  mode: 'causal',
  thought: 'Analyze the effect of increasing cache size',
  thoughtNumber: 3,
  totalThoughts: 4,
  nextThoughtNeeded: true,

  causalGraph: { /* same structure */ },
  interventions: [{
    nodeId: 'cache',
    action: 'Increase cache size by 2x',
    expectedEffects: [
      { nodeId: 'latency', expectedChange: 'Decrease by 20-30%', confidence: 0.75 },
      { nodeId: 'memory', expectedChange: 'Increase by cache size', confidence: 0.95 }
    ]
  }],
  mechanisms: []
});

// Counterfactual analysis
const counterfactual = await deepthinking_causal({
  mode: 'causal',
  thought: 'Consider what would have happened without the deployment',
  thoughtNumber: 4,
  totalThoughts: 4,
  nextThoughtNeeded: false,

  causalGraph: { /* same structure */ },
  counterfactuals: [{
    description: 'What if the deployment had not occurred?',
    modifiedNodes: [{ nodeId: 'deployment', newValue: 'no change' }],
    predictedOutcome: 'Memory usage would be 15% lower, cache hit rate 10% higher, latency 25% lower'
  }],
  mechanisms: []
});
```

## Causal Inference Principles

### Pearl's Ladder of Causation

1. **Association** (seeing): P(Y|X) - Correlation
2. **Intervention** (doing): P(Y|do(X)) - Causal effect
3. **Counterfactual** (imagining): P(Y_x|X', Y') - What if?

### do-Calculus

Intervention differs from observation:
- **P(Y|X)** = Probability of Y given we *observed* X
- **P(Y|do(X))** = Probability of Y given we *set* X

### Confounding

A variable C is a confounder if:
- C affects both X and Y
- Creates spurious correlation between X and Y
- Must be controlled for to estimate causal effect

## Best Practices

### Graph Construction

✅ **Do:**
- Identify all relevant variables
- Distinguish causes from effects
- Include confounders explicitly
- Specify edge directions carefully

❌ **Don't:**
- Confuse correlation with causation
- Omit important confounders
- Create cycles in causal DAGs
- Assume direction without evidence

### Mechanism Specification

✅ **Do:**
- Describe how causes produce effects
- Distinguish direct from indirect effects
- Note feedback loops separately

❌ **Don't:**
- Leave mechanisms unspecified
- Assume mechanisms without evidence
- Ignore mediating variables

### Intervention Analysis

✅ **Do:**
- Consider all downstream effects
- Account for confounders
- Estimate effect confidence

❌ **Don't:**
- Ignore indirect effects
- Assume linearity
- Overlook unintended consequences

## CausalThought Interface

```typescript
interface CausalThought extends BaseThought {
  mode: ThinkingMode.CAUSAL;
  causalGraph: CausalGraph;
  interventions?: Intervention[];
  counterfactuals?: CounterfactualScenario[];
  mechanisms: CausalMechanism[];
  confounders?: Confounder[];
}
```

## Integration with Other Modes

Causal mode integrates with:

- **Bayesian Mode** - Causal Bayesian networks
- **Counterfactual Mode** - What-if analysis
- **Temporal Mode** - Causal chains over time
- **Systems Thinking** - System dynamics

## Related Modes

- [Bayesian Mode](./BAYESIAN.md) - Probabilistic causal inference
- [Counterfactual Mode](./COUNTERFACTUAL.md) - Alternative scenarios
- [Temporal Mode](./TEMPORAL.md) - Time-based causation
- [Systems Thinking Mode](./SYSTEMSTHINKING.md) - System dynamics

## Limitations

- **No inference engine** - Manual causal analysis
- **DAG assumption** - No cyclic causation
- **No data integration** - No statistical estimation

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
