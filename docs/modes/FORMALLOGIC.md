# Formal Logic Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_scientific`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/formallogic.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `LogicalOperator`, `InferenceRule`, `ProofTechnique`
- **Interfaces**: `Proposition`, `LogicalFormula`, `Inference`, `LogicalProof`, `ProofStep`, `TruthTable`, `TruthTableRow`, `SatisfiabilityResult`, `ValidityResult`, `LogicalArgument`, `Contradiction`, `LogicalEquivalence`, `NormalForm`, `FormalLogicThought`
- **Functions**: `isFormalLogicThought`

---

## Overview

Formal Logic mode provides **rigorous logical reasoning** with propositions, inference rules, and formal proofs. It supports propositional and predicate logic, truth tables, satisfiability checking, and validity verification.

This mode captures the structure of formal logical reasoning - from propositions through inference to proofs.

## Thought Types

| Type | Description |
|------|-------------|
| `proposition_definition` | Define logical propositions |
| `inference_derivation` | Apply inference rules |
| `proof_construction` | Build formal proofs |
| `satisfiability_check` | Check if formula is satisfiable |
| `validity_verification` | Verify argument validity |

## When to Use Formal Logic Mode

Use formal logic mode when you need to:

- **Reason with propositions** - True/false statements
- **Apply inference rules** - Modus ponens, etc.
- **Construct proofs** - Formal logical proofs
- **Check satisfiability** - Can a formula be true?
- **Verify validity** - Is an argument logically valid?

### Problem Types Well-Suited for Formal Logic Mode

- **Logical puzzles** - Knights and knaves, logic games
- **Argument analysis** - Evaluating argument validity
- **Specification verification** - Verifying logical specs
- **Constraint reasoning** - Boolean satisfiability
- **Foundations of mathematics** - Logical foundations

## Core Concepts

### Propositions

```typescript
interface Proposition {
  id: string;
  symbol: string;      // "P", "Q", "R"
  statement: string;
  truthValue?: boolean;
  type: 'atomic' | 'compound';
  formula?: string;    // For compound propositions
  latex?: string;
}
```

### Logical Operators

```typescript
type LogicalOperator =
  | 'AND'     // ∧ (conjunction)
  | 'OR'      // ∨ (disjunction)
  | 'NOT'     // ¬ (negation)
  | 'IMPLIES' // → (implication)
  | 'IFF'     // ↔ (biconditional)
  | 'XOR'     // ⊕ (exclusive or)
  | 'NAND'    // ⊼
  | 'NOR';    // ⊽
```

### Inference Rules

```typescript
type InferenceRule =
  | 'modus_ponens'           // P, P→Q ⊢ Q
  | 'modus_tollens'          // ¬Q, P→Q ⊢ ¬P
  | 'hypothetical_syllogism' // P→Q, Q→R ⊢ P→R
  | 'disjunctive_syllogism'  // P∨Q, ¬P ⊢ Q
  | 'conjunction'            // P, Q ⊢ P∧Q
  | 'simplification'         // P∧Q ⊢ P
  | 'addition'               // P ⊢ P∨Q
  | 'resolution'             // P∨Q, ¬P∨R ⊢ Q∨R
  | 'contradiction'          // P, ¬P ⊢ ⊥
  | 'excluded_middle';       // ⊢ P∨¬P
```

### Proof Techniques

```typescript
type ProofTechnique =
  | 'direct'            // Direct proof
  | 'contradiction'     // Proof by contradiction
  | 'contrapositive'    // Proof by contrapositive
  | 'cases'             // Proof by cases
  | 'induction'         // Mathematical induction
  | 'natural_deduction' // Natural deduction
  | 'resolution'        // Resolution refutation
  | 'semantic_tableaux'; // Tableau method
```

### Logical Proof

```typescript
interface LogicalProof {
  id: string;
  theorem: string;
  technique: ProofTechnique;
  steps: ProofStep[];
  conclusion: string;
  valid: boolean;
  completeness: number;  // 0-1
  assumptions?: string[];
}

interface ProofStep {
  stepNumber: number;
  statement: string;
  formula?: string;
  latex?: string;
  justification: string;
  rule?: InferenceRule;
  referencesSteps?: number[];
  isAssumption?: boolean;
  dischargesAssumption?: number;
}
```

### Truth Tables

```typescript
interface TruthTable {
  id: string;
  propositions: string[];  // Proposition IDs
  formula?: string;
  rows: TruthTableRow[];
  isTautology: boolean;
  isContradiction: boolean;
  isContingent: boolean;
}

interface TruthTableRow {
  rowNumber: number;
  assignments: Record<string, boolean>;
  result: boolean;
}
```

### Satisfiability

```typescript
interface SatisfiabilityResult {
  id: string;
  formula: string;
  latex?: string;
  satisfiable: boolean;
  model?: Record<string, boolean>;  // Satisfying assignment
  method: 'dpll' | 'cdcl' | 'resolution' | 'truth_table' | 'other';
  complexity?: string;
  explanation: string;
}
```

## Usage Example

```typescript
// Define propositions
const propositions = await deepthinking_analytical({
  mode: 'formallogic',
  thought: 'Define the propositions for the argument',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'proposition_definition',
  propositions: [
    { id: 'p', symbol: 'P', statement: 'It is raining', type: 'atomic' },
    { id: 'q', symbol: 'Q', statement: 'The ground is wet', type: 'atomic' },
    { id: 'r', symbol: 'R', statement: 'The sprinkler is on', type: 'atomic' },
    {
      id: 'impl1',
      symbol: 'P→Q',
      statement: 'If it rains, the ground is wet',
      type: 'compound',
      formula: 'P → Q',
      latex: 'P \\rightarrow Q'
    },
    {
      id: 'impl2',
      symbol: 'R→Q',
      statement: 'If sprinkler is on, the ground is wet',
      type: 'compound',
      formula: 'R → Q',
      latex: 'R \\rightarrow Q'
    }
  ]
});

// Apply inference rules
const inference = await deepthinking_analytical({
  mode: 'formallogic',
  thought: 'Apply modus ponens to derive conclusion',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'inference_derivation',
  logicalInferences: [{
    id: 'inf1',
    rule: 'modus_ponens',
    premises: ['p', 'impl1'],
    conclusion: 'q',
    justification: 'Given P and P→Q, we can derive Q',
    valid: true,
    latex: 'P, P \\rightarrow Q \\vdash Q'
  }]
});

// Construct a proof
const proof = await deepthinking_analytical({
  mode: 'formallogic',
  thought: 'Prove that (P→Q) ∧ (Q→R) → (P→R)',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'proof_construction',
  proof: {
    id: 'proof1',
    theorem: 'Hypothetical Syllogism: (P→Q) ∧ (Q→R) → (P→R)',
    technique: 'direct',
    steps: [
      { stepNumber: 1, statement: 'Assume (P→Q) ∧ (Q→R)', justification: 'Assumption', isAssumption: true, latex: '(P \\rightarrow Q) \\land (Q \\rightarrow R)' },
      { stepNumber: 2, statement: 'P→Q', justification: 'Simplification from 1', rule: 'simplification', referencesSteps: [1] },
      { stepNumber: 3, statement: 'Q→R', justification: 'Simplification from 1', rule: 'simplification', referencesSteps: [1] },
      { stepNumber: 4, statement: 'Assume P', justification: 'Assumption for subproof', isAssumption: true },
      { stepNumber: 5, statement: 'Q', justification: 'Modus ponens: P, P→Q', rule: 'modus_ponens', referencesSteps: [4, 2] },
      { stepNumber: 6, statement: 'R', justification: 'Modus ponens: Q, Q→R', rule: 'modus_ponens', referencesSteps: [5, 3] },
      { stepNumber: 7, statement: 'P→R', justification: 'Conditional proof: 4-6', referencesSteps: [4, 6], dischargesAssumption: 4 },
      { stepNumber: 8, statement: '(P→Q) ∧ (Q→R) → (P→R)', justification: 'Conditional proof: 1-7', referencesSteps: [1, 7], dischargesAssumption: 1 }
    ],
    conclusion: '(P→Q) ∧ (Q→R) → (P→R)',
    valid: true,
    completeness: 1.0
  }
});

// Create truth table
const truthTable = await deepthinking_analytical({
  mode: 'formallogic',
  thought: 'Build truth table for P→Q',
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'validity_verification',
  truthTable: {
    id: 'tt1',
    propositions: ['p', 'q'],
    formula: 'P → Q',
    rows: [
      { rowNumber: 1, assignments: { P: true, Q: true }, result: true },
      { rowNumber: 2, assignments: { P: true, Q: false }, result: false },
      { rowNumber: 3, assignments: { P: false, Q: true }, result: true },
      { rowNumber: 4, assignments: { P: false, Q: false }, result: true }
    ],
    isTautology: false,
    isContradiction: false,
    isContingent: true
  }
});

// Check satisfiability
const sat = await deepthinking_analytical({
  mode: 'formallogic',
  thought: 'Check if (P ∧ ¬P) is satisfiable',
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false,

  thoughtType: 'satisfiability_check',
  satisfiability: {
    id: 'sat1',
    formula: 'P ∧ ¬P',
    latex: 'P \\land \\neg P',
    satisfiable: false,
    method: 'truth_table',
    explanation: 'No assignment can make both P and ¬P true simultaneously. This is a contradiction.'
  }
});
```

## Common Inference Rules

| Rule | Form | Description |
|------|------|-------------|
| Modus Ponens | P, P→Q ⊢ Q | If P and P implies Q, then Q |
| Modus Tollens | ¬Q, P→Q ⊢ ¬P | If not Q and P implies Q, then not P |
| Hypothetical Syllogism | P→Q, Q→R ⊢ P→R | Chain implication |
| Disjunctive Syllogism | P∨Q, ¬P ⊢ Q | Eliminate disjunct |
| Conjunction | P, Q ⊢ P∧Q | Combine propositions |
| Simplification | P∧Q ⊢ P | Extract conjunct |
| Addition | P ⊢ P∨Q | Add disjunct |
| Resolution | P∨Q, ¬P∨R ⊢ Q∨R | Resolve complementary literals |

## Best Practices

### Proposition Definition

✅ **Do:**
- Use clear atomic propositions
- Define compound propositions explicitly
- Use standard notation

❌ **Don't:**
- Use ambiguous statements
- Mix natural language and symbols
- Skip defining terms

### Proof Construction

✅ **Do:**
- Cite inference rules for each step
- Reference previous steps
- Mark and discharge assumptions

❌ **Don't:**
- Skip steps
- Use undeclared rules
- Leave assumptions open

### Satisfiability Checking

✅ **Do:**
- Choose appropriate method
- Provide satisfying model if SAT
- Explain why if UNSAT

❌ **Don't:**
- Skip explanation
- Use inefficient methods for large formulas
- Confuse SAT with validity

## FormalLogicThought Interface

```typescript
interface FormalLogicThought extends BaseThought {
  mode: ThinkingMode.FORMALLOGIC;
  thoughtType:
    | 'proposition_definition'
    | 'inference_derivation'
    | 'proof_construction'
    | 'satisfiability_check'
    | 'validity_verification';

  propositions?: Proposition[];
  logicalInferences?: Inference[];
  proof?: LogicalProof;
  truthTable?: TruthTable;
  satisfiability?: SatisfiabilityResult;
}
```

## Integration with Other Modes

Formal Logic mode integrates with:

- **Mathematics Mode** - Foundations of mathematics
- **First Principles** - Axiomatic reasoning
- **Algorithmic Mode** - Correctness proofs
- **Computability Mode** - Decidability

## Related Modes

- [Mathematics Mode](./MATHEMATICS.md) - Mathematical logic
- [First Principles Mode](./FIRSTPRINCIPLES.md) - Axiomatic reasoning
- [Algorithmic Mode](./ALGORITHMIC.md) - Algorithm proofs
- [Computability Mode](./COMPUTABILITY.md) - Decidability theory

## Limitations

- **No automated proving** - Manual proof construction
- **Propositional focus** - Limited predicate logic support
- **No SAT solver** - Manual satisfiability checking

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
