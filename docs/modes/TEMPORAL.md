# Temporal Reasoning Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_temporal`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/temporal.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `TemporalThought`, `Timeline`, `TemporalEvent`, `TimeInterval`, `TemporalConstraint`, `TemporalRelation`
- **Functions**: `isTemporalThought`

---

## Overview

Temporal mode provides **time-dependent reasoning** using events, intervals, constraints, and causal relations over time. It supports Allen's interval algebra for temporal relationships and timeline construction.

This mode captures the structure of temporal reasoning - from event definition through interval analysis to causality timelines.

## Thought Types

| Type | Description |
|------|-------------|
| `event_definition` | Define temporal events |
| `interval_analysis` | Analyze time intervals |
| `temporal_constraint` | Define temporal constraints |
| `sequence_construction` | Build event sequences |
| `causality_timeline` | Analyze causal relationships over time |

## When to Use Temporal Mode

Use temporal mode when you need to:

- **Reason about time** - Events, durations, sequences
- **Analyze temporal relationships** - Before, after, during, overlaps
- **Build timelines** - Construct event sequences
- **Apply temporal constraints** - Scheduling, planning
- **Trace causality over time** - Cause and effect with timing

### Problem Types Well-Suited for Temporal Mode

- **Scheduling** - Task and event scheduling
- **Planning** - Sequential planning with time constraints
- **Historical analysis** - Analyzing sequences of events
- **Process modeling** - Business process timing
- **Causal analysis** - Time-dependent causality

## Core Concepts

### Timeline

```typescript
interface Timeline {
  id: string;
  name: string;
  timeUnit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';
  startTime?: number;
  endTime?: number;
  events: string[];  // Event IDs
}
```

### Temporal Events

```typescript
interface TemporalEvent {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  duration?: number;      // For interval events
  type: 'instant' | 'interval';
  properties: Record<string, any>;
}
```

### Time Intervals (Allen's Algebra)

```typescript
interface TimeInterval {
  id: string;
  name: string;
  start: number;
  end: number;
  overlaps?: string[];    // IDs of overlapping intervals
  contains?: string[];    // IDs of contained intervals
}
```

### Temporal Constraints

Allen's interval algebra relationships:

```typescript
interface TemporalConstraint {
  id: string;
  type: 'before' | 'after' | 'during' | 'overlaps' | 'meets' | 'starts' | 'finishes' | 'equals';
  subject: string;        // Event/Interval ID
  object: string;         // Event/Interval ID
  confidence: number;     // 0-1
  formula?: string;       // LaTeX formula
}
```

### Temporal Relations

```typescript
interface TemporalRelation {
  id: string;
  from: string;           // Event ID
  to: string;             // Event ID
  relationType: 'causes' | 'enables' | 'prevents' | 'precedes' | 'follows';
  strength: number;       // 0-1
  delay?: number;         // Time delay between events
  formula?: string;       // LaTeX formula
}
```

## Allen's Interval Algebra

The 13 basic relations between time intervals:

| Relation | Symbol | Meaning |
|----------|--------|---------|
| `before` | < | X ends before Y starts |
| `after` | > | X starts after Y ends |
| `meets` | m | X ends exactly when Y starts |
| `met-by` | mi | X starts exactly when Y ends |
| `overlaps` | o | X starts before Y, ends during Y |
| `overlapped-by` | oi | X starts during Y, ends after Y |
| `during` | d | X is completely within Y |
| `contains` | di | X completely contains Y |
| `starts` | s | X starts with Y, ends during Y |
| `started-by` | si | Y starts with X, ends during X |
| `finishes` | f | X ends with Y, starts during Y |
| `finished-by` | fi | Y ends with X, starts during X |
| `equals` | = | X and Y are identical |

## Usage Example

```typescript
// Define timeline
const timeline = await deepthinking_temporal({
  mode: 'temporal',
  thought: 'Define project timeline for software release',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'event_definition',
  timeline: {
    id: 'project_timeline',
    name: 'Release v2.0 Timeline',
    timeUnit: 'days',
    startTime: 0,
    endTime: 90,
    events: ['design', 'development', 'testing', 'release']
  },
  events: [
    {
      id: 'design',
      name: 'Design Phase',
      description: 'Complete system design',
      timestamp: 0,
      duration: 14,
      type: 'interval',
      properties: { team: 'architecture', deliverables: ['design doc'] }
    },
    {
      id: 'development',
      name: 'Development Phase',
      description: 'Implement features',
      timestamp: 10,
      duration: 45,
      type: 'interval',
      properties: { team: 'engineering' }
    },
    {
      id: 'testing',
      name: 'Testing Phase',
      description: 'QA and testing',
      timestamp: 40,
      duration: 30,
      type: 'interval',
      properties: { team: 'qa' }
    },
    {
      id: 'release',
      name: 'Release Event',
      description: 'Production release',
      timestamp: 90,
      type: 'instant',
      properties: { milestone: true }
    }
  ]
});

// Define intervals
const intervals = await deepthinking_temporal({
  mode: 'temporal',
  thought: 'Analyze interval relationships',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'interval_analysis',
  intervals: [
    {
      id: 'design_interval',
      name: 'Design Phase',
      start: 0,
      end: 14
    },
    {
      id: 'dev_interval',
      name: 'Development Phase',
      start: 10,
      end: 55,
      overlaps: ['design_interval', 'test_interval']
    },
    {
      id: 'test_interval',
      name: 'Testing Phase',
      start: 40,
      end: 70,
      overlaps: ['dev_interval']
    }
  ]
});

// Define temporal constraints
const constraints = await deepthinking_temporal({
  mode: 'temporal',
  thought: 'Define temporal constraints between phases',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'temporal_constraint',
  constraints: [
    {
      id: 'tc_1',
      type: 'overlaps',
      subject: 'design_interval',
      object: 'dev_interval',
      confidence: 1.0,
      formula: 'design.end > dev.start ∧ design.end < dev.end'
    },
    {
      id: 'tc_2',
      type: 'before',
      subject: 'design_interval',
      object: 'test_interval',
      confidence: 1.0
    },
    {
      id: 'tc_3',
      type: 'meets',
      subject: 'test_interval',
      object: 'release',
      confidence: 0.9
    }
  ]
});

// Define causal relations
const relations = await deepthinking_temporal({
  mode: 'temporal',
  thought: 'Identify causal relationships in the timeline',
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'causality_timeline',
  relations: [
    {
      id: 'rel_1',
      from: 'design',
      to: 'development',
      relationType: 'enables',
      strength: 0.95,
      delay: 10,
      formula: 'design \\rightarrow_{enables} development'
    },
    {
      id: 'rel_2',
      from: 'development',
      to: 'testing',
      relationType: 'enables',
      strength: 0.9,
      delay: 30
    },
    {
      id: 'rel_3',
      from: 'testing',
      to: 'release',
      relationType: 'enables',
      strength: 0.85,
      delay: 20
    }
  ]
});

// Build sequence
const sequence = await deepthinking_temporal({
  mode: 'temporal',
  thought: 'Construct the complete event sequence',
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false,

  thoughtType: 'sequence_construction',
  timeline: {
    id: 'final_sequence',
    name: 'Complete Project Sequence',
    timeUnit: 'days',
    startTime: 0,
    endTime: 90,
    events: ['design', 'development', 'testing', 'release']
  }
});
```

## Best Practices

### Timeline Construction

✅ **Do:**
- Choose appropriate time units
- Define clear start/end boundaries
- Include all relevant events

❌ **Don't:**
- Mix time units inconsistently
- Leave timeline boundaries vague
- Omit important events

### Event Definition

✅ **Do:**
- Distinguish instant vs interval events
- Include meaningful properties
- Use consistent timestamps

❌ **Don't:**
- Confuse points with intervals
- Skip important event properties
- Use inconsistent time references

### Constraint Definition

✅ **Do:**
- Use Allen's algebra correctly
- Verify constraint consistency
- Include confidence levels

❌ **Don't:**
- Define contradictory constraints
- Ignore constraint propagation
- Skip consistency checking

### Causal Relations

✅ **Do:**
- Identify enabling relationships
- Include delays where relevant
- Assess relationship strength

❌ **Don't:**
- Assume causation from sequence
- Ignore time delays
- Skip strength assessment

## TemporalThought Interface

```typescript
interface TemporalThought extends BaseThought {
  mode: ThinkingMode.TEMPORAL;
  thoughtType:
    | 'event_definition'
    | 'interval_analysis'
    | 'temporal_constraint'
    | 'sequence_construction'
    | 'causality_timeline';

  timeline?: Timeline;
  events?: TemporalEvent[];
  intervals?: TimeInterval[];
  constraints?: TemporalConstraint[];
  relations?: TemporalRelation[];
}
```

## Integration with Other Modes

Temporal mode integrates with:

- **Causal Mode** - Causal reasoning with time
- **Sequential Mode** - Sequential reasoning foundation
- **Systems Thinking** - Dynamic system behavior
- **Counterfactual Mode** - "What if" with time changes

## Related Modes

- [Causal Mode](./CAUSAL.md) - Causal reasoning
- [Sequential Mode](./SEQUENTIAL.md) - Sequential reasoning
- [Systems Thinking Mode](./SYSTEMSTHINKING.md) - Dynamic systems
- [Counterfactual Mode](./COUNTERFACTUAL.md) - What-if analysis

## Limitations

- **No simulation** - Manual temporal reasoning
- **Constraint propagation** - Manual consistency checking
- **Limited automation** - No temporal planning solver

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
