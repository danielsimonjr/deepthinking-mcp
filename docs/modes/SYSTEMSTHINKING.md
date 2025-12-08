# Systems Thinking Mode

**Version**: 7.3.0
**Tool**: `deepthinking_analytical`
**Status**: Experimental
**Source**: `src/types/modes/systemsthinking.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `ComponentType`, `FeedbackType`
- **Interfaces**: `SystemDefinition`, `SystemComponent`, `FeedbackLoop`, `CausalLink`, `LeveragePoint`, `EmergentBehavior`, `StockFlow`, `SystemDelay`, `SystemsThinkingThought`
- **Functions**: `isSystemsThinkingThought`

---

## Overview

Systems Thinking mode provides **holistic system analysis** with feedback loops, stocks, flows, and leverage points. It enables understanding complex systems as interconnected wholes rather than isolated parts.

This mode captures the structure of systems thinking - from system definition through component analysis to emergent behavior prediction.

## Thought Types

| Type | Description |
|------|-------------|
| `system_definition` | Define the system and its boundaries |
| `component_analysis` | Analyze system components |
| `feedback_identification` | Identify feedback loops |
| `leverage_analysis` | Find leverage points for intervention |
| `behavior_prediction` | Predict emergent behaviors |

## When to Use Systems Thinking Mode

Use systems thinking mode when you need to:

- **Understand complex systems** - Interconnected components
- **Identify feedback loops** - Reinforcing and balancing dynamics
- **Find leverage points** - Where interventions are most effective
- **Predict emergent behavior** - System-level outcomes
- **Model stock and flow dynamics** - Accumulations and rates

### Problem Types Well-Suited for Systems Thinking Mode

- **Organizational change** - Understanding organizational dynamics
- **Market analysis** - Complex market interactions
- **Environmental systems** - Ecological and climate systems
- **Software architecture** - Complex system interactions
- **Policy analysis** - Unintended consequences of policies

## Core Concepts

### System Definition

```typescript
interface SystemDefinition {
  id: string;
  name: string;
  description: string;
  boundary: string;      // What's included/excluded
  purpose: string;
  timeHorizon?: string;
}
```

### System Components

```typescript
type ComponentType = 'stock' | 'flow' | 'variable' | 'parameter' | 'delay';

interface SystemComponent {
  id: string;
  name: string;
  type: ComponentType;
  description: string;
  unit?: string;
  initialValue?: number;
  formula?: string;      // LaTeX formula
  influencedBy?: string[]; // Component IDs
}
```

Component types:
- **stock** - Accumulations (can be measured at a point in time)
- **flow** - Rates (change over time)
- **variable** - Calculated values
- **parameter** - Constants or settings
- **delay** - Time delays in information or material

### Feedback Loops

```typescript
type FeedbackType = 'reinforcing' | 'balancing';

interface FeedbackLoop {
  id: string;
  name: string;
  type: FeedbackType;
  description: string;
  components: string[];  // Ordered component IDs
  polarity: '+' | '-';   // Overall loop polarity
  strength: number;      // 0-1
  delay?: number;        // Time delay
  dominance?: 'early' | 'middle' | 'late'; // When this loop dominates
}
```

Feedback types:
- **reinforcing (R)** - Amplifies change (exponential growth/decline)
- **balancing (B)** - Resists change (seeks equilibrium)

### Leverage Points

Donella Meadows' 12 leverage points (in increasing effectiveness):

```typescript
interface LeveragePoint {
  id: string;
  name: string;
  location: string;      // Component or loop ID
  description: string;
  effectiveness: number; // 0-1
  difficulty: number;    // 0-1
  type: 'parameter' | 'feedback' | 'structure' | 'goal' | 'paradigm';
  interventionExamples: string[];
}
```

### Emergent Behavior

```typescript
interface EmergentBehavior {
  id: string;
  name: string;
  description: string;
  pattern: 'growth' | 'decline' | 'oscillation' | 'equilibrium' | 'chaos' | 'overshoot_collapse';
  causes: string[];      // Component/loop IDs
  timeframe: string;
  unintendedConsequences?: string[];
}
```

### Stock-Flow Relationships

```typescript
interface StockFlow {
  stockId: string;
  inflowIds: string[];   // Flows that increase stock
  outflowIds: string[];  // Flows that decrease stock
  equilibriumCondition?: string;
}
```

## Usage Example

```typescript
// Define the system
const system = await deepthinking_analytical({
  mode: 'systemsthinking',
  thought: 'Define the software development team system',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'system_definition',
  system: {
    id: 'dev_team_system',
    name: 'Software Development Team Dynamics',
    description: 'Model of how team productivity, quality, and workload interact',
    boundary: 'Single development team, excluding external dependencies',
    purpose: 'Understand why quality degrades under pressure',
    timeHorizon: '6-12 months'
  }
});

// Identify components
const components = await deepthinking_analytical({
  mode: 'systemsthinking',
  thought: 'Identify key system components',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'component_analysis',
  components: [
    { id: 'backlog', name: 'Feature Backlog', type: 'stock', description: 'Pending features', unit: 'stories' },
    { id: 'velocity', name: 'Team Velocity', type: 'variable', description: 'Stories completed per sprint', unit: 'stories/sprint' },
    { id: 'tech_debt', name: 'Technical Debt', type: 'stock', description: 'Accumulated shortcuts', unit: 'debt points' },
    { id: 'quality', name: 'Code Quality', type: 'variable', description: 'Quality level', unit: 'quality score' },
    { id: 'defect_rate', name: 'Defect Rate', type: 'flow', description: 'New defects created', unit: 'defects/sprint' },
    { id: 'pressure', name: 'Schedule Pressure', type: 'variable', description: 'Urgency to deliver', unit: 'pressure index' },
    { id: 'rework', name: 'Rework Effort', type: 'flow', description: 'Time spent fixing', unit: 'hours/sprint' }
  ]
});

// Identify feedback loops
const loops = await deepthinking_analytical({
  mode: 'systemsthinking',
  thought: 'Identify the feedback loops',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'feedback_identification',
  feedbackLoops: [
    {
      id: 'R1',
      name: 'Pressure-Shortcuts Loop (Reinforcing)',
      type: 'reinforcing',
      description: 'High pressure leads to shortcuts, creating tech debt, which slows velocity, increasing pressure',
      components: ['pressure', 'tech_debt', 'velocity', 'backlog', 'pressure'],
      polarity: '+',
      strength: 0.8,
      delay: 30, // days
      dominance: 'late'
    },
    {
      id: 'B1',
      name: 'Quality-Defects Loop (Balancing)',
      type: 'balancing',
      description: 'Lower quality increases defects, forcing rework, which eventually improves quality',
      components: ['quality', 'defect_rate', 'rework', 'quality'],
      polarity: '-',
      strength: 0.6,
      delay: 14
    },
    {
      id: 'R2',
      name: 'Defect Explosion Loop (Reinforcing)',
      type: 'reinforcing',
      description: 'Defects create more defects when fixes introduce new bugs',
      components: ['defect_rate', 'rework', 'pressure', 'quality', 'defect_rate'],
      polarity: '+',
      strength: 0.5,
      dominance: 'middle'
    }
  ]
});

// Identify leverage points
const leverage = await deepthinking_analytical({
  mode: 'systemsthinking',
  thought: 'Find high-leverage intervention points',
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'leverage_analysis',
  leveragePoints: [
    {
      id: 'lp1',
      name: 'Buffer Time',
      location: 'pressure',
      description: 'Adding slack time breaks the pressure-shortcuts loop',
      effectiveness: 0.8,
      difficulty: 0.7, // Hard to get buy-in
      type: 'parameter',
      interventionExamples: ['20% innovation time', 'Reduced sprint commitments']
    },
    {
      id: 'lp2',
      name: 'Quality Gate',
      location: 'R1', // The reinforcing loop
      description: 'Mandatory quality checks prevent shortcuts from accumulating',
      effectiveness: 0.7,
      difficulty: 0.4,
      type: 'feedback',
      interventionExamples: ['Code review requirements', 'Automated quality gates']
    },
    {
      id: 'lp3',
      name: 'Debt Retirement',
      location: 'tech_debt',
      description: 'Regular tech debt sprints reduce accumulated debt',
      effectiveness: 0.6,
      difficulty: 0.3,
      type: 'structure',
      interventionExamples: ['Tech debt sprints', 'Refactoring Fridays']
    }
  ]
});

// Predict behavior
const behavior = await deepthinking_analytical({
  mode: 'systemsthinking',
  thought: 'Predict system behavior over time',
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false,

  thoughtType: 'behavior_prediction',
  behaviors: [
    {
      id: 'b1',
      name: 'Death Spiral',
      description: 'Without intervention, R1 dominates: pressure → shortcuts → debt → slower velocity → more pressure',
      pattern: 'decline',
      causes: ['R1', 'R2'],
      timeframe: '6-12 months',
      unintendedConsequences: ['Team burnout', 'Key person dependencies', 'Customer churn']
    },
    {
      id: 'b2',
      name: 'Stable with Intervention',
      description: 'With leverage point interventions, B1 can dominate and maintain equilibrium',
      pattern: 'equilibrium',
      causes: ['B1', 'lp1', 'lp2'],
      timeframe: 'Ongoing maintenance'
    }
  ]
});
```

## Meadows' Leverage Points (Increasing Effectiveness)

1. Constants, parameters, numbers
2. Sizes of buffers and stocks
3. Structure of material stocks and flows
4. Lengths of delays
5. Strength of negative feedback loops
6. Gain around driving positive loops
7. Structure of information flows
8. Rules of the system
9. Power to add, change, or self-organize
10. Goals of the system
11. Mindset or paradigm
12. Power to transcend paradigms

## Best Practices

### System Boundaries

✅ **Do:**
- Define clear boundaries
- Include all relevant components
- Note what's excluded and why

❌ **Don't:**
- Make boundaries too broad
- Ignore boundary effects
- Exclude important interactions

### Feedback Identification

✅ **Do:**
- Identify all major loops
- Classify as reinforcing or balancing
- Note delays in loops

❌ **Don't:**
- Miss hidden feedback loops
- Confuse loop polarity
- Ignore time delays

### Leverage Points

✅ **Do:**
- Rank by effectiveness
- Consider implementation difficulty
- Look for structural changes

❌ **Don't:**
- Focus only on parameters
- Ignore systemic resistance
- Expect quick fixes

## SystemsThinkingThought Interface

```typescript
interface SystemsThinkingThought extends BaseThought {
  mode: ThinkingMode.SYSTEMSTHINKING;
  thoughtType:
    | 'system_definition'
    | 'component_analysis'
    | 'feedback_identification'
    | 'leverage_analysis'
    | 'behavior_prediction';

  system?: SystemDefinition;
  components?: SystemComponent[];
  feedbackLoops?: FeedbackLoop[];
  leveragePoints?: LeveragePoint[];
  behaviors?: EmergentBehavior[];
}
```

## Integration with Other Modes

Systems Thinking mode integrates with:

- **Causal Mode** - Causal structure within systems
- **Temporal Mode** - Dynamic behavior over time
- **Optimization Mode** - Optimizing system parameters
- **Engineering Mode** - Engineering complex systems

## Related Modes

- [Causal Mode](./CAUSAL.md) - Causal reasoning
- [Temporal Mode](./TEMPORAL.md) - Time-based dynamics
- [Optimization Mode](./OPTIMIZATION.md) - System optimization
- [Engineering Mode](./ENGINEERING.md) - System engineering

## Limitations

- **No simulation** - Manual behavior prediction
- **Qualitative focus** - Limited quantitative modeling
- **Complexity limits** - Very large systems hard to model

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
