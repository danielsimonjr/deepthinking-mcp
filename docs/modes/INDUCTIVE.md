# Inductive Reasoning Mode

**Version**: 1.0.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_core`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/core.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `InductiveThought`
- **Functions**: `isInductiveThought`

---

## Overview

Inductive reasoning is one of the **fundamental reasoning triad** (inductive, deductive, abductive). It involves reasoning from specific observations to general principles - moving from particular instances to broader generalizations.

This mode captures the structure of inductive reasoning - observing patterns, forming generalizations, and assessing confidence levels.

## When to Use Inductive Mode

Use inductive reasoning when you need to:

- **Generalize from examples** - Form rules from specific cases
- **Identify patterns** - Discover regularities in data
- **Build theories** - Develop explanatory frameworks from observations
- **Empirical reasoning** - Draw conclusions from experimental data

## Thought Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `observations` | `string[]` | Yes | Specific cases observed |
| `pattern` | `string` | No | Identified pattern |
| `generalization` | `string` | Yes | General principle formed |
| `confidence` | `number` | Yes | Strength of inference (0-1) |
| `counterexamples` | `string[]` | No | Known exceptions |
| `sampleSize` | `number` | No | Number of observations |

## Example Usage

```json
{
  "tool": "deepthinking_core",
  "arguments": {
    "mode": "inductive",
    "thought": "Analyzing patterns in customer behavior",
    "thoughtNumber": 1,
    "totalThoughts": 3,
    "nextThoughtNeeded": true,
    "observations": [
      "Customer A purchased after viewing 5+ products",
      "Customer B purchased after viewing 7 products",
      "Customer C purchased after viewing 6 products"
    ],
    "pattern": "Purchase likelihood increases after viewing 5+ products",
    "generalization": "Customers who view 5 or more products are likely to make a purchase",
    "confidence": 0.75,
    "sampleSize": 3
  }
}
```

## Best Practices

1. **Gather sufficient observations** - More data points increase confidence
2. **Look for counterexamples** - Actively seek cases that contradict the pattern
3. **Qualify generalizations** - Use appropriate hedging ("tends to", "often")
4. **Track confidence levels** - Be honest about the strength of inferences

## Related Modes

- **Deductive** - Reasoning from general to specific (complementary)
- **Abductive** - Inference to best explanation (related)
- **Scientific Method** - Uses inductive reasoning in hypothesis formation
