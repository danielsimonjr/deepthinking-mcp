# Hybrid Reasoning Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_standard`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/hybrid.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode`, `ShannonStage`, `ExtendedThoughtType` |

## Exports

- **Interfaces**: `HybridThought`, `MathematicalModel`, `TensorProperties`, `PhysicalInterpretation`, `ModeContribution`, `ParallelAnalysis`
- **Functions**: `isHybridThought`

---

## Overview

Hybrid mode intelligently **combines multiple reasoning modes** based on problem characteristics. It provides dynamic mode switching, parallel analysis, and synthesis of insights from different reasoning approaches.

This mode is ideal for complex problems that don't fit neatly into a single reasoning paradigm.

## When to Use Hybrid Mode

Use hybrid reasoning when you need to:

- **Multi-faceted analysis** - Problems requiring multiple perspectives
- **Cross-domain reasoning** - Combining physics with mathematics, etc.
- **Dynamic adaptation** - Switching approaches as understanding deepens
- **Synthesis** - Integrating insights from different modes

## Thought Types

| Type | Description |
|------|-------------|
| `mode_selection` | Choosing appropriate reasoning modes |
| `parallel_analysis` | Running multiple modes simultaneously |
| `sequential_analysis` | Chain of mode applications |
| `convergence_check` | Verifying consistency across modes |

## Key Features

### Mode Combination
Hybrid mode can combine:
- Mathematics + Physics (tensor analysis)
- Causal + Counterfactual (impact analysis)
- Inductive + Deductive (theory building)
- Game Theory + Optimization (strategic decisions)

### Tensor and Physics Support
Includes interfaces for:
- `MathematicalModel` - LaTeX, symbolic, and tensor representations
- `TensorProperties` - Rank, symmetries, invariants, transformations
- `PhysicalInterpretation` - Physical meaning of mathematical objects

## Example Usage

```json
{
  "tool": "deepthinking_standard",
  "arguments": {
    "mode": "hybrid",
    "thought": "Analyzing system dynamics using multiple perspectives",
    "thoughtNumber": 1,
    "totalThoughts": 5,
    "nextThoughtNeeded": true,
    "thoughtType": "mode_selection",
    "activeModes": ["causal", "systemsthinking", "optimization"],
    "modeContributions": [
      {"mode": "causal", "insight": "Identified feedback loop", "weight": 0.4},
      {"mode": "systemsthinking", "insight": "Detected limits to growth archetype", "weight": 0.4},
      {"mode": "optimization", "insight": "Found constrained maximum", "weight": 0.2}
    ]
  }
}
```

## Best Practices

1. **Start with mode selection** - Identify which modes are relevant
2. **Track mode contributions** - Note what each mode adds
3. **Check for convergence** - Ensure modes reach consistent conclusions
4. **Synthesize insights** - Combine findings into coherent understanding

## Related Modes

- **Meta-Reasoning** - Oversees mode selection
- **All other modes** - Hybrid can invoke any mode
