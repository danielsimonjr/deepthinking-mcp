# Knowledge Pack: computability

**Mode**: `computability`
**Category skill**: `think-mathematics`
**Source doc**: `docs/modes/COMPUTABILITY.md`

## Overview

Computability mode provides **Turing machine analysis**, decidability proofs, and reductions. Inspired by **Alan Turing's** foundational 1936 work on computability, it supports reasoning about what can and cannot be computed.

This mode captures the structure of computability theory - from machine definitions through computation traces to decidability proofs.

## When to Use

Use computability mode when you need to:

- **Define Turing machines** - Formal machine specifications
- **Trace computations** - Step-by-step execution
- **Prove undecidability** - Show problems cannot be decided
- **Construct reductions** - Relate problem difficulty
- **Analyze complexity** - Time/space classification

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

```typescript
interface ComputabilityThought extends BaseThought {
mode: ThinkingMode.COMPUTABILITY;
  thoughtType: ComputabilityThoughtType;

  // Turing machines
  machines?: TuringMachine[];
  currentMachine?: TuringMachine;

  // Computation traces
  computationTrace?: ComputationTrace;

  // Decision problems
  problems?: DecisionProblem[];
  currentProblem?: DecisionProblem;

  // Reductions
  reductions?: Reduction[];
  reductionChain?: string[];      // Chain of reductions

  // Decidability analysis
  decidabilityProof?: DecidabilityProof;

  // Diagonalization
  diagonalization?: DiagonalizationArgument;

  // Complexity
  complexityAnalysis?: ComplexityAnalysis;

  // Oracle analysis
  oracleAnalysis?: OracleAnalysis;

  // Dependencies and assumptions
  dependencies: string[];
  assumptions: string[];

  // Uncertainty (lower for proven results)
  uncertainty: number;

  // References to classic results
  classicProblems?: ClassicUndecidableProblem[];

  // Key insight for this thought
  keyInsight?: string;
}
```

## Supporting Interfaces

```typescript
interface TuringTransition {
fromState: string;
  readSymbol: string;
  toState: string;
  writeSymbol: string;
  direction: 'L' | 'R' | 'S';  // Left, Right, Stay
}

interface TuringMachine {
id: string;
  name: string;
  description?: string;

  // Formal components
  states: string[];
  inputAlphabet: string[];      // Σ
  tapeAlphabet: string[];       // Γ (includes blank)
  blankSymbol: string;          // Usually '_' or 'B'
  transitions: TuringTransition[];
  initialState: string;
  acceptStates: string[];
  rejectStates: string[];

  // Classification
  type: 'deterministic' | 'nondeterministic' | 'multi_tape' | 'oracle';

  // For oracle machines
  oracle?: string;              // Problem the oracle solves
}

interface ComputationStep {
stepNumber: number;
  state: string;
  tapeContents: string;
  headPosition: number;
  transitionUsed?: TuringTransition;
}

interface ComputationTrace {
machine: string;              // Machine ID
  input: string;
  steps: ComputationStep[];
  result: 'accept' | 'reject' | 'loop' | 'running';
  totalSteps: number;
  spaceUsed: number;            // Maximum tape cells used

  // For analysis
  isTerminating: boolean;
  terminationReason?: string;
}

interface DecisionProblem {
id: string;
  name: string;
  description: string;

  // Formal specification
  inputFormat: string;          // What inputs look like
  question: string;             // Yes/no question being asked

  // Examples
  yesInstances: string[];
  noInstances: string[];

  // Classification
  decidabilityStatus: 'decidable' | 'semi_decidable' | 'undecidable' | 'unknown';
  complexityClass?: string;     // P, NP, PSPACE, etc.

  // Relations to other problems
  reducesTo?: string[];         // Problems this reduces to
  reducesFrom?: string[];       // Problems that reduce to this
}

interface Reduction {
id: string;
  fromProblem: string;          // Source problem ID
  toProblem: string;            // Target problem ID

  // Reduction type
  type: 'many_one' | 'turing' | 'polynomial_time' | 'log_space';

  // The reduction function
  reductionFunction: {
    description: string;
    inputTransformation: string;   // How to transform input
    outputInterpretation: string;  // How to interpret output
    preserves: string;             // What property is preserved
}

interface DiagonalizationArgument {
id: string;

  // The enumeration being diagonalized against
  enumeration: {
    description: string;           // What we're enumerating
    indexSet: string;              // Usually natural numbers
    enumeratedObjects: string;     // What type of objects
}

interface DecidabilityProof {
id: string;
  problem: string;               // Problem being analyzed
  conclusion: 'decidable' | 'semi_decidable' | 'undecidable';

  // Proof method
  method: 'direct_machine' | 'reduction' | 'diagonalization' | 'rice_theorem' | 'oracle';

  // For direct proofs (showing decidability)
  decidingMachine?: TuringMachine;

  // For reduction proofs (showing undecidability)
  reduction?: Reduction;
  knownUndecidableProblem?: string;

  // For diagonalization proofs
  diagonalization?: DiagonalizationArgument;

  // For Rice's theorem applications
  riceApplication?: {
    property: string;              // The property of languages
    isNontrivial: boolean;         // Some TMs have it, some don't
    isSemantic: boolean;           // About the language, not the machine
}

```

## Worked Example (from source doc)

```typescript
// Define a Turing machine
const machine = await deepthinking_mathematics({
  mode: 'computability',
  thought: 'Define a Turing machine that accepts strings of the form 0^n1^n',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'machine_definition',
  currentMachine: {
    id: 'tm_0n1n',
    name: 'Equal 0s and 1s Acceptor',
    description: 'Accepts strings with equal number of 0s and 1s',
    states: ['q0', 'q1', 'q2', 'q3', 'qaccept', 'qreject'],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', 'X', 'Y', '_'],
    blankSymbol: '_',
    transitions: [
      { fromState: 'q0', readSymbol: '0', toState: 'q1', writeSymbol: 'X', direction: 'R' },
      { fromState: 'q1', readSymbol: '0', toState: 'q1', writeSymbol: '0', direction: 'R' },
      { fromState: 'q1', readSymbol: 'Y', toState: 'q1', writeSymbol: 'Y', direction: 'R' },
      { fromState: 'q1', readSymbol: '1', toState: 'q2', writeSymbol: 'Y', direction: 'L' },
      { fromState: 'q2', readSymbol: '0', toState: 'q2', writeSymbol: '0', direction: 'L' },
      { fromState: 'q2', readSymbol: 'Y', toState: 'q2', writeSymbol: 'Y', direction: 'L' },
      { fromState: 'q2', readSymbol: 'X', toState: 'q0', writeSymbol: 'X', direction: 'R' },
      { fromState: 'q0', readSymbol: 'Y', toState: 'q3', writeSymbol: 'Y', direction: 'R' },
      { fromState: 'q3', readSymbol: 'Y', toState: 'q3', writeSymbol: 'Y', direction: 'R' },
      { fromState: 'q3', readSymbol: '_', toState: 'qaccept', writeSymbol: '_', direction: 'S' }
    ],
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    type: 'deterministic'
  },
  dependencies: [],
  assumptions: ['input is over {0,1}*'],
  uncertainty: 0.1
});

// Trace computation
const trace = await deepthinking_mathematics({
  mode: 'computability',
  thought: 'Trace computation on input 0011',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'computation_trace',
  computationTrace: {
    machine: 'tm_0n1n',
    input: '0011',
    steps: [
      { stepNumber: 0, state: 'q0', tapeContents: '0011_', headPosition: 0 },
      { stepNumber: 1, state: 'q1', tapeContents: 'X011_', headPosition: 1 },
      { stepNumber: 2, state: 'q1', tapeContents: 'X011_', headPosition: 2 },
      { stepNumber: 3, state: 'q2', tapeContents: 'X0Y1_', headPosition: 1 },
      { stepNumber: 4, state: 'q2', tapeContents: 'X0Y1_', headPosition: 0 },
      // ... more steps
      { s

---

*Generated by RLM extraction pass on 2026-04-12*
