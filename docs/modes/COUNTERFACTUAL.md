# Counterfactual Reasoning Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized - World State Tracking)
**Tool**: `deepthinking_causal`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/counterfactual.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `Condition`, `Outcome`, `Scenario`, `ScenarioDifference`, `CounterfactualComparison`, `InterventionPoint`, `CausalChain`, `CounterfactualThought`
- **Functions**: `isCounterfactualThought`

---

## Overview

Counterfactual mode provides **what-if analysis** and alternative scenario exploration. It enables reasoning about "what would have happened if..." by comparing actual scenarios with hypothetical alternatives.

This mode captures the structure of counterfactual reasoning - from defining actual outcomes through imagining alternatives to extracting insights.

## When to Use Counterfactual Mode

Use counterfactual mode when you need to:

- **Explore alternative scenarios** - What if we had done X instead?
- **Learn from outcomes** - What could we have done differently?
- **Identify intervention points** - Where could we have changed the outcome?
- **Extract lessons** - What insights can we gain from alternatives?
- **Plan for the future** - How to achieve different outcomes next time?

### Problem Types Well-Suited for Counterfactual Mode

- **Post-mortems** - Analyzing what went wrong
- **Decision analysis** - Evaluating past decisions
- **Strategic planning** - Learning from alternatives
- **Risk assessment** - What could go wrong?
- **Process improvement** - Finding better approaches

## Core Concepts

### Scenarios

```typescript
interface Scenario {
  id?: string;
  name: string;
  description?: string;
  conditions: Condition[];
  outcome?: Outcome;
  outcomes?: Outcome[];
  probability?: number;    // 0-1
  likelihood?: number;     // 0-1 (alternative)
}
```

### Conditions

```typescript
interface Condition {
  factor: string;
  value: string;
  isIntervention?: boolean;  // Was this changed from actual?
}
```

### Outcomes

```typescript
interface Outcome {
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude?: number;  // 0-1
}
```

### Comparison

```typescript
interface CounterfactualComparison {
  differences: string[] | ScenarioDifference[];
  insights: string[];
  lessons: string[];
}

interface ScenarioDifference {
  aspect: string;
  actual?: string;
  counterfactual?: string;
}
```

### Intervention Points

```typescript
interface InterventionPoint {
  description: string;
  timing: string;
  feasibility: number;     // 0-1
  expectedImpact: number;  // 0-1
}
```

### Causal Chains

```typescript
interface CausalChain {
  id: string;
  events: string[];
  branchingPoint: string;
  divergence: string;
}
```

## Usage Example

```typescript
// Define actual scenario
const actual = await deepthinking_causal({
  mode: 'counterfactual',
  thought: 'Analyze the production incident that occurred',
  thoughtNumber: 1,
  totalThoughts: 4,
  nextThoughtNeeded: true,

  actual: {
    name: 'Production Database Outage',
    description: 'Database became unavailable during peak hours',
    conditions: [
      { factor: 'Load Balancer', value: 'Single point of failure' },
      { factor: 'Monitoring', value: 'Alert threshold too high' },
      { factor: 'Runbook', value: 'Outdated procedures' },
      { factor: 'On-call', value: 'Junior engineer only' }
    ],
    outcome: {
      description: '4-hour outage affecting 50,000 users',
      impact: 'negative',
      magnitude: 0.8
    }
  },
  counterfactuals: [],
  comparison: { differences: [], insights: [], lessons: [] },
  interventionPoint: { description: '', timing: '', feasibility: 0, expectedImpact: 0 }
});

// Explore counterfactual scenarios
const counterfactuals = await deepthinking_causal({
  mode: 'counterfactual',
  thought: 'Consider alternative scenarios that could have prevented or reduced impact',
  thoughtNumber: 2,
  totalThoughts: 4,
  nextThoughtNeeded: true,

  actual: {
    name: 'Production Database Outage',
    conditions: [
      { factor: 'Load Balancer', value: 'Single point of failure' },
      { factor: 'Monitoring', value: 'Alert threshold too high' },
      { factor: 'Runbook', value: 'Outdated procedures' },
      { factor: 'On-call', value: 'Junior engineer only' }
    ],
    outcome: { description: '4-hour outage', impact: 'negative', magnitude: 0.8 }
  },
  counterfactuals: [
    {
      name: 'With Redundant Load Balancer',
      conditions: [
        { factor: 'Load Balancer', value: 'Active-passive failover', isIntervention: true },
        { factor: 'Monitoring', value: 'Alert threshold too high' },
        { factor: 'Runbook', value: 'Outdated procedures' },
        { factor: 'On-call', value: 'Junior engineer only' }
      ],
      outcome: { description: '30-minute degradation, automatic failover', impact: 'negative', magnitude: 0.2 },
      probability: 0.85
    },
    {
      name: 'With Better Monitoring',
      conditions: [
        { factor: 'Load Balancer', value: 'Single point of failure' },
        { factor: 'Monitoring', value: 'Proactive alerts at 70% threshold', isIntervention: true },
        { factor: 'Runbook', value: 'Outdated procedures' },
        { factor: 'On-call', value: 'Junior engineer only' }
      ],
      outcome: { description: '1-hour outage, early warning allowed preparation', impact: 'negative', magnitude: 0.4 },
      probability: 0.75
    },
    {
      name: 'With Senior On-Call',
      conditions: [
        { factor: 'Load Balancer', value: 'Single point of failure' },
        { factor: 'Monitoring', value: 'Alert threshold too high' },
        { factor: 'Runbook', value: 'Outdated procedures' },
        { factor: 'On-call', value: 'Senior SRE with experience', isIntervention: true }
      ],
      outcome: { description: '2-hour outage, faster diagnosis and resolution', impact: 'negative', magnitude: 0.5 },
      probability: 0.8
    }
  ],
  comparison: { differences: [], insights: [], lessons: [] },
  interventionPoint: { description: '', timing: '', feasibility: 0, expectedImpact: 0 }
});

// Compare and extract insights
const comparison = await deepthinking_causal({
  mode: 'counterfactual',
  thought: 'Compare scenarios and extract lessons',
  thoughtNumber: 3,
  totalThoughts: 4,
  nextThoughtNeeded: true,

  actual: { /* same as before */ },
  counterfactuals: [ /* same as before */ ],
  comparison: {
    differences: [
      { aspect: 'Infrastructure Redundancy', actual: 'None', counterfactual: 'Active-passive failover' },
      { aspect: 'Alert Sensitivity', actual: '95% threshold', counterfactual: '70% threshold' },
      { aspect: 'On-Call Experience', actual: 'Junior (1 year)', counterfactual: 'Senior (5+ years)' }
    ],
    insights: [
      'Redundancy would have reduced impact by 75%',
      'Earlier alerting would have provided 30 minutes advance warning',
      'Experience level significantly affects MTTR',
      'Multiple interventions compound - best outcome with all changes'
    ],
    lessons: [
      'Prioritize load balancer redundancy in Q1',
      'Review and lower alert thresholds across services',
      'Implement shadow on-call for junior engineers',
      'Update runbooks monthly with recent incident learnings'
    ]
  },
  interventionPoint: { description: '', timing: '', feasibility: 0, expectedImpact: 0 }
});

// Identify best intervention point
const intervention = await deepthinking_causal({
  mode: 'counterfactual',
  thought: 'Determine the highest-value intervention point',
  thoughtNumber: 4,
  totalThoughts: 4,
  nextThoughtNeeded: false,

  actual: { /* same */ },
  counterfactuals: [ /* same */ ],
  comparison: { /* same */ },
  interventionPoint: {
    description: 'Add load balancer failover capability',
    timing: 'Before next peak traffic period (within 2 weeks)',
    feasibility: 0.8,  // Cloud provider supports this
    expectedImpact: 0.9  // Would prevent most outages
  },
  causalChains: [{
    id: 'outage_chain',
    events: ['Traffic spike', 'LB overload', 'LB failure', 'Full outage', 'User impact'],
    branchingPoint: 'LB failure',
    divergence: 'With failover: Automatic switch to standby, minimal disruption'
  }]
});
```

## Best Practices

### Scenario Definition

✅ **Do:**
- Define actual scenario precisely
- Include all relevant conditions
- Quantify outcomes where possible

❌ **Don't:**
- Leave conditions vague
- Omit important factors
- Ignore negative outcomes

### Counterfactual Generation

✅ **Do:**
- Vary one factor at a time for clarity
- Consider multiple alternatives
- Estimate probabilities realistically

❌ **Don't:**
- Change too many factors at once
- Only consider positive alternatives
- Assume perfect interventions

### Comparison and Learning

✅ **Do:**
- Extract actionable lessons
- Prioritize by feasibility and impact
- Consider compound effects

❌ **Don't:**
- Stop at identification
- Ignore implementation difficulty
- Miss systemic improvements

## CounterfactualThought Interface

```typescript
interface CounterfactualThought extends BaseThought {
  mode: ThinkingMode.COUNTERFACTUAL;
  actual: Scenario;
  counterfactuals: Scenario[];
  comparison: CounterfactualComparison;
  interventionPoint: InterventionPoint;
  causalChains?: CausalChain[];
}
```

## Integration with Other Modes

Counterfactual mode integrates with:

- **Causal Mode** - Causal graphs for counterfactuals
- **Temporal Mode** - Timeline-based alternatives
- **Bayesian Mode** - Probability estimation
- **Systems Thinking** - Systemic alternatives

## Related Modes

- [Causal Mode](./CAUSAL.md) - Causal reasoning
- [Temporal Mode](./TEMPORAL.md) - Time-based analysis
- [Bayesian Mode](./BAYESIAN.md) - Probability reasoning
- [Systems Thinking Mode](./SYSTEMSTHINKING.md) - System dynamics

## Limitations

- **Hindsight bias** - Easy to see "obvious" interventions after the fact
- **Probability estimation** - Counterfactual probabilities are uncertain
- **Complexity** - Many factors interact in unpredictable ways

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
