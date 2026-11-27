# Knowledge Pack: systemsthinking

**Mode**: `systemsthinking`
**Category skill**: `think-scientific`
**Source doc**: `docs/modes/SYSTEMSTHINKING.md`

## Overview

Systems Thinking mode provides **holistic system analysis** with feedback loops, stocks, flows, and leverage points. It enables understanding complex systems as interconnected wholes rather than isolated parts.

This mode captures the structure of systems thinking - from system definition through component analysis to emergent behavior prediction.

## When to Use

Use systems thinking mode when you need to:

- **Understand complex systems** - Interconnected components
- **Identify feedback loops** - Reinforcing and balancing dynamics
- **Find leverage points** - Where interventions are most effective
- **Predict emergent behavior** - System-level outcomes
- **Model stock and flow dynamics** - Accumulations and rates

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

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

## Supporting Interfaces

```typescript
interface SystemDefinition {
id: string;
  name: string;
  description: string;
  boundary: string; // What's included/excluded
  purpose: string;
  timeHorizon?: string;
}

interface SystemComponent {
id: string;
  name: string;
  type: ComponentType;
  description: string;
  unit?: string;
  initialValue?: number;
  formula?: string; // LaTeX formula for calculation
  influencedBy?: string[]; // IDs of components that affect this
}

interface FeedbackLoop {
id: string;
  name: string;
  type: FeedbackType;
  description: string;
  components: string[]; // Ordered list of component IDs in the loop
  polarity: '+' | '-'; // Overall loop polarity
  strength: number; // 0-1, strength of the feedback
  delay?: number; // Time delay in the loop
  dominance?: 'early' | 'middle' | 'late'; // When this loop dominates behavior
}

interface CausalLink {
id: string;
  from: string; // Component ID
  to: string; // Component ID
  polarity: '+' | '-'; // Positive or negative influence
  strength: number; // 0-1
  delay?: number; // Time delay
  description?: string;
}

interface LeveragePoint {
id: string;
  name: string;
  location: string; // Component or loop ID
  description: string;
  effectiveness: number; // 0-1, higher = more effective
  difficulty: number; // 0-1, higher = more difficult
  type: 'parameter' | 'feedback' | 'structure' | 'goal' | 'paradigm';
  interventionExamples: string[];
}

interface EmergentBehavior {
id: string;
  name: string;
  description: string;
  pattern: 'growth' | 'decline' | 'oscillation' | 'equilibrium' | 'chaos' | 'overshoot_collapse';
  causes: string[]; // Component/loop IDs causing this behavior
  timeframe: string;
  unintendedConsequences?: string[];
}

interface StockFlow {
stockId: string;
  inflowIds: string[]; // Flow IDs that increase the stock
  outflowIds: string[]; // Flow IDs that decrease the stock
  equilibriumCondition?: string; // Condition for steady state
}

interface SystemDelay {
id: string;
  name: string;
  from: string; // Component ID
  to: string; // Component ID
  delayTime: number;
  type: 'information' | 'material' | 'perception';
  impact: string;
}

```

## Worked Example (from source doc)

```typescript
// Define the system
const system = await deepthinking_scientific({
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
const components = await deepthinking_scientific({
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
const loops = await deepthinking_scientific({
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
      type: 'bala

---

*Generated by RLM extraction pass on 2026-04-12*
