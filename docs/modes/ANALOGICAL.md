# Analogical Reasoning Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_analytical`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/analogical.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `AnalogicalThought`, `Entity`, `Relation`, `Property`, `Domain`, `Mapping`, `AnalogicalInference`, `TransferCandidate`
- **Functions**: `isAnalogicalThought`

---

## Overview

Analogical reasoning enables **cross-domain knowledge transfer** by identifying structural similarities between a familiar source domain and a novel target domain. It's the cognitive basis for metaphor, learning by example, and innovative problem-solving.

This mode captures the structure of analogical reasoning - defining domains, mapping relationships, and transferring insights.

## When to Use Analogical Mode

Use analogical reasoning when you need to:

- **Transfer solutions** - Apply known solutions to new problems
- **Explain concepts** - Use familiar domains to clarify unfamiliar ones
- **Generate innovations** - Combine ideas from different fields
- **Build mental models** - Understand new systems via comparison
- **Learn from examples** - Generalize from specific cases

## Thought Types

| Type | Description |
|------|-------------|
| `source_definition` | Defining the familiar domain |
| `target_definition` | Defining the novel domain |
| `mapping` | Establishing correspondences |
| `inference` | Deriving new knowledge in target |
| `validation` | Checking analogy validity |

## Key Interfaces

### Domain
```typescript
{
  name: string;
  entities: Entity[];
  relations: Relation[];
  properties: Property[];
}
```

### Mapping
```typescript
{
  sourceEntity: string;
  targetEntity: string;
  confidence: number;
  justification: string;
}
```

## Example Usage

```json
{
  "tool": "deepthinking_analytical",
  "arguments": {
    "mode": "analogical",
    "thought": "Understanding electrical circuits via water flow analogy",
    "thoughtNumber": 1,
    "totalThoughts": 4,
    "nextThoughtNeeded": true,
    "thoughtType": "mapping",
    "sourceDomain": {
      "name": "Water Flow",
      "entities": [
        {"id": "e1", "name": "Pump", "type": "source", "description": "Creates pressure"},
        {"id": "e2", "name": "Pipe", "type": "conductor", "description": "Carries water"},
        {"id": "e3", "name": "Valve", "type": "regulator", "description": "Controls flow"}
      ],
      "relations": [
        {"id": "r1", "type": "drives", "from": "e1", "to": "e2", "description": "Pump drives flow through pipe"}
      ]
    },
    "targetDomain": {
      "name": "Electrical Circuit",
      "entities": [
        {"id": "e1", "name": "Battery", "type": "source", "description": "Creates voltage"},
        {"id": "e2", "name": "Wire", "type": "conductor", "description": "Carries current"},
        {"id": "e3", "name": "Resistor", "type": "regulator", "description": "Controls current"}
      ]
    },
    "mappings": [
      {"sourceEntity": "Pump", "targetEntity": "Battery", "confidence": 0.9, "justification": "Both create driving force"},
      {"sourceEntity": "Pipe", "targetEntity": "Wire", "confidence": 0.95, "justification": "Both conduct flow"},
      {"sourceEntity": "Valve", "targetEntity": "Resistor", "confidence": 0.85, "justification": "Both restrict flow"}
    ]
  }
}
```

## Best Practices

1. **Choose structural similarities** - Focus on relational structure, not surface features
2. **Assess mapping quality** - Not all analogies are equally valid
3. **Identify limitations** - Where does the analogy break down?
4. **Transfer cautiously** - Validate inferences in the target domain

## Related Modes

- **First Principles** - Decompose before comparing
- **Inductive** - Generalize from analogical patterns
- **Synthesis** - Combine insights from multiple analogies
