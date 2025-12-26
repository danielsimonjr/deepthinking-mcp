# Deductive Reasoning Mode

**Version**: 1.0.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_core`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/core.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `DeductiveThought`
- **Functions**: `isDeductiveThought`

---

## Overview

Deductive reasoning is one of the **fundamental reasoning triad** (inductive, deductive, abductive). It involves reasoning from general principles to specific conclusions - if the premises are true and the logic is valid, the conclusion must be true.

This mode captures the structure of deductive reasoning - stating premises, applying logical rules, and deriving conclusions.

## When to Use Deductive Mode

Use deductive reasoning when you need to:

- **Apply rules** - Derive specific cases from general principles
- **Verify correctness** - Check if conclusions follow from premises
- **Mathematical proofs** - Chain logical steps to conclusions
- **Enforce policies** - Apply general rules to specific situations

## Thought Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `premises` | `string[]` | Yes | General principles |
| `conclusion` | `string` | Yes | Specific conclusion derived |
| `logicForm` | `string` | No | e.g., "modus ponens", "modus tollens" |
| `validityCheck` | `boolean` | Yes | Is the deduction logically valid? |
| `soundnessCheck` | `boolean` | No | Are the premises true? |

## Example Usage

```json
{
  "tool": "deepthinking_core",
  "arguments": {
    "mode": "deductive",
    "thought": "Applying syllogistic reasoning",
    "thoughtNumber": 1,
    "totalThoughts": 2,
    "nextThoughtNeeded": true,
    "premises": [
      "All mammals are warm-blooded",
      "A whale is a mammal"
    ],
    "conclusion": "A whale is warm-blooded",
    "logicForm": "modus ponens",
    "validityCheck": true,
    "soundnessCheck": true
  }
}
```

## Logical Forms

| Form | Pattern | Description |
|------|---------|-------------|
| **Modus Ponens** | If P then Q; P; Therefore Q | Affirming the antecedent |
| **Modus Tollens** | If P then Q; Not Q; Therefore Not P | Denying the consequent |
| **Hypothetical Syllogism** | If P then Q; If Q then R; Therefore If P then R | Chain reasoning |
| **Disjunctive Syllogism** | P or Q; Not P; Therefore Q | Elimination |

## Best Practices

1. **State premises clearly** - Ensure premises are unambiguous
2. **Check validity** - Ensure the logical form is correct
3. **Verify soundness** - Confirm premises are actually true
4. **Identify hidden assumptions** - Make implicit premises explicit

## Related Modes

- **Inductive** - Reasoning from specific to general (complementary)
- **Formal Logic** - Rigorous logical proofs
- **Mathematics** - Uses deductive reasoning extensively
