# Knowledge Pack: formallogic

**Mode**: `formallogic`
**Category skill**: `think-scientific`
**Source doc**: `docs/modes/FORMALLOGIC.md`

## Overview

Formal Logic mode provides **rigorous logical reasoning** with propositions, inference rules, and formal proofs. It supports propositional and predicate logic, truth tables, satisfiability checking, and validity verification.

This mode captures the structure of formal logical reasoning - from propositions through inference to proofs.

## When to Use

Use formal logic mode when you need to:

- **Reason with propositions** - True/false statements
- **Apply inference rules** - Modus ponens, etc.
- **Construct proofs** - Formal logical proofs
- **Check satisfiability** - Can a formula be true?
- **Verify validity** - Is an argument logically valid?

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

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

## Supporting Interfaces

```typescript
interface Proposition {
id: string;
  symbol: string; // e.g., "P", "Q", "R"
  statement: string;
  truthValue?: boolean;
  type: 'atomic' | 'compound';
  formula?: string; // Logical formula if compound
  latex?: string;
}

interface LogicalFormula {
id: string;
  expression: string;
  latex: string;
  operator?: LogicalOperator;
  operands: string[]; // Proposition or formula IDs
  normalized?: string; // CNF or DNF
}

interface Inference {
id: string;
  rule: InferenceRule;
  premises: string[]; // Proposition/formula IDs
  conclusion: string; // Proposition/formula ID
  justification: string;
  valid: boolean;
  latex?: string;
}

interface LogicalProof {
id: string;
  theorem: string; // Statement being proved
  technique: ProofTechnique;
  steps: ProofStep[];
  conclusion: string;
  valid: boolean;
  completeness: number; // 0-1
  assumptions?: string[];
}

interface ProofStep {
stepNumber: number;
  statement: string;
  formula?: string;
  latex?: string;
  justification: string;
  rule?: InferenceRule;
  referencesSteps?: number[]; // Which previous steps this uses
  isAssumption?: boolean;
  dischargesAssumption?: number; // Step number of assumption being discharged
}

interface TruthTable {
id: string;
  propositions: string[]; // Proposition IDs
  formula?: string; // Formula being evaluated
  rows: TruthTableRow[];
  isTautology: boolean;
  isContradiction: boolean;
  isContingent: boolean;
}

interface TruthTableRow {
rowNumber: number;
  assignments: Record<string, boolean>; // Proposition ID -> truth value
  result: boolean; // Result of evaluating the formula
}

interface SatisfiabilityResult {
id: string;
  formula: string;
  latex?: string;
  satisfiable: boolean;
  model?: Record<string, boolean>; // Satisfying assignment if SAT
  method: 'dpll' | 'cdcl' | 'resolution' | 'truth_table' | 'other';
  complexity?: string;
  explanation: string;
}

```

## Worked Example (from source doc)

```typescript
// Define propositions
const propositions = await deepthinking_scientific({
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
const inference = await deepthinking_scientific({
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
const proof = await deepthinking_scientific({
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
      { stepNumber: 6, statement: 'R', justification: 'Modu

---

*Generated by RLM extraction pass on 2026-04-12*
