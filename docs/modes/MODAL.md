# Modal Logic Mode

**Version**: 8.4.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_analytical`
**Status**: Stable (Advanced Runtime Mode)
**Source**: `src/types/modes/modal.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `ModalLogicSystem`, `ModalLogicType`, `ModalDomain`
- **Interfaces**: `ModalThought`, `PossibleWorld`, `AccessibilityRelation`, `ModalProposition`, `KripkeFrame`
- **Functions**: `isModalThought`

---

## Overview

Modal logic reasoning extends classical logic with operators for **necessity** (□) and **possibility** (◇). It uses **possible worlds semantics** (Kripke frames) to reason about what must be true, what could be true, and what is contingently true.

This mode captures the structure of modal reasoning - defining possible worlds, establishing accessibility relations, and evaluating modal propositions.

## When to Use Modal Mode

Use modal reasoning when you need to:

- **Analyze necessity** - What must be true in all possible worlds?
- **Explore possibility** - What could be true in some world?
- **Reason about knowledge** - Epistemic logic (what agents know)
- **Reason about obligation** - Deontic logic (what agents should do)
- **Temporal reasoning** - What will/must happen?

## Thought Types

| Type | Description |
|------|-------------|
| `world_definition` | Defining possible worlds |
| `proposition_analysis` | Evaluating propositions |
| `accessibility_relation` | Defining world connections |
| `accessibility_analysis` | Analyzing relation properties |
| `necessity_check` | Checking □φ (necessary) |
| `necessity_proof` | Proving necessity |
| `possibility_check` | Checking ◇φ (possible) |
| `possibility_proof` | Proving possibility |
| `kripke_frame_construction` | Building the semantic model |
| `modal_inference` | Drawing modal conclusions |
| `countermodel` | Finding counterexamples |

## Modal Domains

| Domain | Operators | Description |
|--------|-----------|-------------|
| `alethic` | □ (necessarily), ◇ (possibly) | Metaphysical truth |
| `epistemic` | K (knows), B (believes) | Knowledge and belief |
| `deontic` | O (obligatory), P (permitted) | Obligation and permission |
| `temporal` | G (always), F (eventually) | Time-based necessity |

## Logic Systems

| System | Axioms | Properties |
|--------|--------|------------|
| K | □(φ→ψ) → (□φ→□ψ) | Basic modal logic |
| T | □φ → φ | Reflexive (knowledge) |
| S4 | □φ → □□φ | Transitive (necessary truths) |
| S5 | ◇φ → □◇φ | Equivalence (metaphysics) |

## Example Usage

```json
{
  "tool": "deepthinking_analytical",
  "arguments": {
    "mode": "modal",
    "thought": "Analyzing whether proposition is necessarily true",
    "thoughtNumber": 1,
    "totalThoughts": 3,
    "nextThoughtNeeded": true,
    "thoughtType": "necessity_check",
    "logicSystem": "S5",
    "modalDomain": "alethic",
    "actualWorld": "w1",
    "possibleWorlds": [
      {"id": "w1", "name": "Actual", "truths": ["P", "Q"]},
      {"id": "w2", "name": "Alternative1", "truths": ["P", "~Q"]},
      {"id": "w3", "name": "Alternative2", "truths": ["P", "Q"]}
    ],
    "accessibilityRelations": [
      {"from": "w1", "to": "w2"},
      {"from": "w1", "to": "w3"},
      {"from": "w2", "to": "w1"},
      {"from": "w2", "to": "w3"}
    ],
    "propositions": [
      {"formula": "□P", "type": "necessity", "innerFormula": "P", "evaluation": true, "justification": "P true in all accessible worlds"}
    ]
  }
}
```

## Best Practices

1. **Choose appropriate logic system** - K for basic, S5 for metaphysics
2. **Define accessibility carefully** - Properties determine valid inferences
3. **Construct Kripke frames** - Visualize possible worlds
4. **Use countermodels** - Disprove invalid claims

## Related Modes

- **Formal Logic** - Classical propositional/predicate logic
- **Temporal** - Time-based modal logic
- **Counterfactual** - Closest possible worlds
