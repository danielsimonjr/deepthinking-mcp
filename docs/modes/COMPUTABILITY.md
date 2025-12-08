# Computability Theory Mode

**Version**: 7.3.0
**Tool**: `deepthinking_standard`
**Status**: Stable (Phase 11, v7.2.0)
**Source**: `src/types/modes/computability.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `ComputabilityThoughtType`, `ClassicUndecidableProblem`
- **Interfaces**: `TuringTransition`, `TuringMachine`, `ComputationStep`, `ComputationTrace`, `DecisionProblem`, `Reduction`, `DiagonalizationArgument`, `DecidabilityProof`, `ComplexityAnalysis`, `OracleAnalysis`, `ComputabilityThought`
- **Functions**: `isComputabilityThought`, `createSimpleMachine`, `reductionPreservesDecidability`, `isPolynomialReduction`

---

## Overview

Computability mode provides **Turing machine analysis**, decidability proofs, and reductions. Inspired by **Alan Turing's** foundational 1936 work on computability, it supports reasoning about what can and cannot be computed.

This mode captures the structure of computability theory - from machine definitions through computation traces to decidability proofs.

## Thought Types

| Type | Description |
|------|-------------|
| `machine_definition` | Define a Turing machine |
| `computation_trace` | Trace execution steps |
| `decidability_proof` | Prove (un)decidability |
| `reduction_construction` | Build reductions between problems |
| `complexity_analysis` | Classify time/space complexity |
| `oracle_reasoning` | Relativized computation |
| `diagonalization` | Diagonal argument construction |

## When to Use Computability Mode

Use computability mode when you need to:

- **Define Turing machines** - Formal machine specifications
- **Trace computations** - Step-by-step execution
- **Prove undecidability** - Show problems cannot be decided
- **Construct reductions** - Relate problem difficulty
- **Analyze complexity** - Time/space classification

### Problem Types Well-Suited for Computability Mode

- **Decidability questions** - Can this problem be solved?
- **Complexity classification** - What class is this in?
- **Reduction proofs** - Relating problem difficulty
- **Fundamental limits** - Understanding computational limits
- **Oracle computation** - Relativized complexity

## Core Concepts

### Turing Machine

```typescript
interface TuringMachine {
  id: string;
  name: string;
  description?: string;
  states: string[];
  inputAlphabet: string[];      // Σ
  tapeAlphabet: string[];       // Γ
  blankSymbol: string;
  transitions: TuringTransition[];
  initialState: string;
  acceptStates: string[];
  rejectStates: string[];
  type: 'deterministic' | 'nondeterministic' | 'multi_tape' | 'oracle';
  oracle?: string;              // For oracle machines
}

interface TuringTransition {
  fromState: string;
  readSymbol: string;
  toState: string;
  writeSymbol: string;
  direction: 'L' | 'R' | 'S';   // Left, Right, Stay
}
```

### Computation Trace

```typescript
interface ComputationTrace {
  machine: string;
  input: string;
  steps: ComputationStep[];
  result: 'accept' | 'reject' | 'loop' | 'running';
  totalSteps: number;
  spaceUsed: number;
  isTerminating: boolean;
  terminationReason?: string;
}

interface ComputationStep {
  stepNumber: number;
  state: string;
  tapeContents: string;
  headPosition: number;
  transitionUsed?: TuringTransition;
}
```

### Decision Problems

```typescript
interface DecisionProblem {
  id: string;
  name: string;
  description: string;
  inputFormat: string;
  question: string;
  yesInstances: string[];
  noInstances: string[];
  decidabilityStatus: 'decidable' | 'semi_decidable' | 'undecidable' | 'unknown';
  complexityClass?: string;
  reducesTo?: string[];
  reducesFrom?: string[];
}
```

### Reductions

```typescript
interface Reduction {
  id: string;
  fromProblem: string;
  toProblem: string;
  type: 'many_one' | 'turing' | 'polynomial_time' | 'log_space';
  reductionFunction: {
    description: string;
    inputTransformation: string;
    outputInterpretation: string;
    preserves: string;
  };
  correctnessProof: {
    forwardDirection: string;
    backwardDirection: string;
  };
  reductionComplexity?: string;
}
```

### Diagonalization Arguments

```typescript
interface DiagonalizationArgument {
  id: string;
  enumeration: {
    description: string;
    indexSet: string;
    enumeratedObjects: string;
  };
  diagonalConstruction: {
    description: string;
    rule: string;
    resultingObject: string;
  };
  contradiction: {
    assumption: string;
    consequence: string;
    impossibility: string;
  };
  pattern: 'cantor' | 'turing' | 'godel' | 'rice' | 'custom';
  historicalNote?: string;
}
```

### Classic Undecidable Problems

```typescript
type ClassicUndecidableProblem =
  | 'halting_problem'       // Does M halt on w?
  | 'acceptance_problem'    // Does M accept w?
  | 'emptiness_problem'     // Is L(M) = ∅?
  | 'equivalence_problem'   // Is L(M1) = L(M2)?
  | 'regularity_problem'    // Is L(M) regular?
  | 'ambiguity_problem'     // Is grammar G ambiguous?
  | 'post_correspondence'   // PCP
  | 'hilberts_tenth';       // Diophantine equations
```

## Usage Example

```typescript
// Define a Turing machine
const machine = await deepthinking_standard({
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
const trace = await deepthinking_standard({
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
      { stepNumber: 12, state: 'qaccept', tapeContents: 'XXYY_', headPosition: 4 }
    ],
    result: 'accept',
    totalSteps: 12,
    spaceUsed: 5,
    isTerminating: true,
    terminationReason: 'Reached accept state'
  },
  dependencies: ['machine_definition'],
  assumptions: [],
  uncertainty: 0.05
});

// Prove undecidability via reduction
const reduction = await deepthinking_standard({
  mode: 'computability',
  thought: 'Prove emptiness problem is undecidable by reduction from halting',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'reduction_construction',
  reductions: [{
    id: 'halt_to_empty',
    fromProblem: 'halting_problem',
    toProblem: 'emptiness_problem',
    type: 'many_one',
    reductionFunction: {
      description: 'Transform halting instance to emptiness instance',
      inputTransformation: 'Given <M,w>, construct M\' that ignores input, simulates M on w, and accepts if M halts',
      outputInterpretation: 'L(M\') = ∅ iff M does not halt on w',
      preserves: 'decidability (if emptiness decidable, halting decidable)'
    },
    correctnessProof: {
      forwardDirection: 'If M halts on w, then M\' accepts all inputs, so L(M\') ≠ ∅',
      backwardDirection: 'If M does not halt on w, then M\' loops on all inputs, so L(M\') = ∅'
    }
  }],
  decidabilityProof: {
    id: 'empty_undecidable',
    problem: 'emptiness_problem',
    conclusion: 'undecidable',
    method: 'reduction',
    reduction: { /* above reduction */ },
    knownUndecidableProblem: 'halting_problem',
    proofSteps: [
      'Assume E_TM (emptiness) is decidable',
      'Construct reduction from HALT to E_TM',
      'Use E_TM decider to decide HALT',
      'Contradiction: HALT is undecidable',
      'Therefore E_TM is undecidable'
    ],
    keyInsights: ['Reduction preserves undecidability upward']
  },
  dependencies: [],
  assumptions: ['Halting problem is undecidable'],
  uncertainty: 0.1
});

// Diagonalization argument
const diagonal = await deepthinking_standard({
  mode: 'computability',
  thought: 'Construct Turing diagonal argument for halting problem',
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'diagonalization',
  diagonalization: {
    id: 'halting_diagonal',
    enumeration: {
      description: 'Enumerate all Turing machines',
      indexSet: 'Natural numbers (via Gödel numbering)',
      enumeratedObjects: 'All Turing machines M_0, M_1, M_2, ...'
    },
    diagonalConstruction: {
      description: 'Construct machine D that differs from each M_i on input i',
      rule: 'D(i) = halt iff M_i(i) does not halt',
      resultingObject: 'Machine D that cannot be in the enumeration'
    },
    contradiction: {
      assumption: 'Assume halting problem is decidable',
      consequence: 'Then D is computable, so D = M_k for some k',
      impossibility: 'D(k) halts iff M_k(k) does not halt, but D = M_k, contradiction'
    },
    pattern: 'turing',
    historicalNote: 'Turing proved this in 1936, establishing fundamental limits of computation'
  },
  dependencies: [],
  assumptions: [],
  uncertainty: 0.05,
  classicProblems: ['halting_problem']
});

// Complexity analysis
const complexity = await deepthinking_standard({
  mode: 'computability',
  thought: 'Analyze complexity class of 0^n1^n language',
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false,

  thoughtType: 'complexity_analysis',
  complexityAnalysis: {
    id: 'complexity_0n1n',
    problem: '0^n1^n language',
    timeComplexity: {
      upperBound: 'O(n)',
      lowerBound: 'Ω(n)',
      tightBound: 'Θ(n)',
      worstCase: 'O(n) with two-tape TM'
    },
    spaceComplexity: {
      upperBound: 'O(log n)',
      lowerBound: 'Ω(log n)',
      tightBound: 'Θ(log n)'
    },
    complexityClass: 'DSPACE(log n)',
    classJustification: 'Counter of n values requires log n bits'
  },
  dependencies: ['machine_definition'],
  assumptions: [],
  uncertainty: 0.1
});
```

## Best Practices

### Machine Definition

✅ **Do:**
- Define all states explicitly
- Specify complete transition function
- Handle all input cases

❌ **Don't:**
- Leave transitions undefined
- Forget blank symbol handling
- Mix deterministic/nondeterministic

### Reduction Construction

✅ **Do:**
- Prove both directions
- Show reduction is computable
- Specify reduction type

❌ **Don't:**
- Skip correctness proof
- Use non-computable reductions
- Reduce wrong direction

### Diagonalization

✅ **Do:**
- Define enumeration clearly
- Specify diagonal rule precisely
- Derive contradiction explicitly

❌ **Don't:**
- Leave diagonal construction vague
- Skip the contradiction step
- Ignore self-reference issues

## ComputabilityThought Interface

```typescript
interface ComputabilityThought extends BaseThought {
  mode: ThinkingMode.COMPUTABILITY;
  thoughtType: ComputabilityThoughtType;
  machines?: TuringMachine[];
  currentMachine?: TuringMachine;
  computationTrace?: ComputationTrace;
  problems?: DecisionProblem[];
  currentProblem?: DecisionProblem;
  reductions?: Reduction[];
  reductionChain?: string[];
  decidabilityProof?: DecidabilityProof;
  diagonalization?: DiagonalizationArgument;
  complexityAnalysis?: ComplexityAnalysis;
  oracleAnalysis?: OracleAnalysis;
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  classicProblems?: ClassicUndecidableProblem[];
  keyInsight?: string;
}
```

## Historical Note

**Alan Turing** (1912-1954) proved the undecidability of the halting problem in his 1936 paper "On Computable Numbers," establishing fundamental limits of computation.

## Integration with Other Modes

Computability mode integrates with:

- **Algorithmic Mode** - Complexity analysis
- **Mathematics Mode** - Formal proofs
- **Formal Logic Mode** - Decidability of logical theories
- **Cryptanalytic Mode** - Computational limits of cryptanalysis

## Related Modes

- [Algorithmic Mode](./ALGORITHMIC.md) - Algorithm design
- [Mathematics Mode](./MATHEMATICS.md) - Mathematical proofs
- [Formal Logic Mode](./FORMALLOGIC.md) - Logical decidability
- [Cryptanalytic Mode](./CRYPTANALYTIC.md) - Cryptographic limits

## Limitations

- **No simulation** - Manual computation tracing
- **Theoretical focus** - Not for practical programming
- **Abstract machines** - Not real hardware

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
