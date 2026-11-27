# Knowledge Pack: algorithmic

**Mode**: `algorithmic`
**Category skill**: `think-engineering`
**Source doc**: `docs/modes/ALGORITHMIC.md`

## Overview

Algorithmic mode provides **comprehensive algorithm design and analysis** covering all topics from "Introduction to Algorithms" (CLRS) and beyond. It supports algorithm design patterns, complexity analysis, correctness proofs, and data structure analysis.

This mode captures the structure of algorithmic reasoning - from problem characterization through design to correctness verification.

## When to Use

Use algorithmic mode when you need to:

- **Design algorithms** - Systematic algorithm development
- **Analyze complexity** - Time and space analysis
- **Prove correctness** - Loop invariants, induction
- **Compare algorithms** - Algorithm selection
- **Solve recurrences** - Master theorem, etc.

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

```typescript
interface AlgorithmicThought extends BaseThought {
mode: ThinkingMode.ALGORITHMIC;
  thoughtType: AlgorithmicThoughtType;

  // Current algorithm being analyzed
  algorithm?: AlgorithmSpec;

  // CLRS categorization
  clrsCategory?: CLRSCategory;
  clrsAlgorithm?: CLRSAlgorithm;

  // Design pattern used
  designPattern?: DesignPattern;

  // Complexity analysis
  timeComplexity?: TimeComplexity;
  spaceComplexity?: SpaceComplexity;
  recurrence?: Recurrence;

  // Correctness
  correctnessProof?: CorrectnessProof;
  loopInvariants?: LoopInvariant[];

  // Dynamic programming
  dpFormulation?: DPFormulation;

  // Greedy
  greedyProof?: GreedyProof;

  // Graph context
  graphContext?: GraphAlgorithmContext;

  // Data structure
  dataStructure?: DataStructureSpec;

  // Amortized analysis
  amortizedAnalysis?: AmortizedAnalysis;

  // Comparison with alternatives
  comparison?: AlgorithmComparison;

  // Dependencies and assumptions
  dependencies: string[];
  assumptions: string[];

  // Uncertainty level
  uncertainty: number;

  // Key insight
  keyInsight?: string;

  // Pseudocode (if relevant)
  pseudocode?: string;

  // Execution trace (for illustration)
  executionTrace?: {
    input: string;
    steps: {
      step: number;
      state: string;
      action: string;
}
```

## Supporting Interfaces

```typescript
interface TimeComplexity {
bestCase: string;          // Ω notation
  averageCase: string;       // Θ notation
  worstCase: string;         // O notation
  amortized?: string;        // Amortized analysis

  // Detailed analysis
  recurrence?: string;       // T(n) = 2T(n/2) + O(n)
  closedForm?: string;       // Closed-form solution
  masterTheorem?: {          // Master theorem application
    a: number;               // Number of subproblems
    b: number;               // Factor by which n is divided
    f: string;               // f(n) term
    case: 1 | 2 | 3;         // Which case applies
}

interface SpaceComplexity {
auxiliary: string;         // Extra space needed
  total: string;            // Total space including input
  inPlace: boolean;          // Is it in-place?

  // Stack space for recursive algorithms
  stackDepth?: string;       // Maximum recursion depth

  // For cache analysis
  cacheEfficiency?: {
    cacheOblivious: boolean;
    cacheComplexity?: string;  // e.g., O(n/B)
}

interface LoopInvariant {
id: string;
  description: string;

  // Three parts of loop invariant proof
  initialization: {
    statement: string;
    proof: string;
}

interface CorrectnessProof {
id: string;
  algorithm: string;

  // Proof method
  method: 'loop_invariant' | 'induction' | 'contradiction' | 'direct' | 'structural';

  // Precondition and postcondition
  preconditions: string[];
  postconditions: string[];

  // The proof
  invariants?: LoopInvariant[];
  inductionBase?: string;
  inductionStep?: string;

  // Termination argument
  terminationArgument: {
    decreasingQuantity: string;   // What decreases
    lowerBound: string;           // Lower bound
    proof: string;                // Why it terminates
}

interface Recurrence {
id: string;

  // The recurrence
  formula: string;              // T(n) = 2T(n/2) + n
  baseCase: string;             // T(1) = 1

  // Solution method
  solutionMethod: 'master_theorem' | 'substitution' | 'recursion_tree' | 'generating_function';

  // Solution
  solution: string;             // Θ(n log n)
  solutionProof?: string;

  // For recursion tree method
  recursionTree?: {
    levelWork: string;          // Work at each level
    levels: string;             // Number of levels
    totalWork: string;          // Sum of all levels
}

interface AlgorithmSpec {
id: string;
  name: string;
  description: string;

  // Classification
  category: string;             // e.g., "Sorting", "Graph", "String"
  designPattern: DesignPattern;

  // Input/Output
  input: {
    description: string;
    constraints: string[];
    dataStructure: string;
}

interface DPFormulation {
id: string;
  problem: string;

  // The four steps of DP
  characterization: {
    optimalSubstructure: string;
    subproblemDefinition: string;
}

interface GreedyProof {
id: string;
  problem: string;

  // Greedy choice property
  greedyChoice: {
    description: string;
    localOptimum: string;
    globalOptimumProof: string;
}

```

## Worked Example (from source doc)

```typescript
// Define algorithm
const algorithm = await deepthinking_engineering({
  mode: 'algorithmic',
  thought: 'Define merge sort algorithm',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'algorithm_definition',
  algorithm: {
    id: 'merge_sort',
    name: 'Merge Sort',
    description: 'Divide-and-conquer sorting algorithm',
    category: 'Sorting',
    designPattern: 'divide_and_conquer',
    input: {
      description: 'Array of comparable elements',
      constraints: ['Elements must be comparable'],
      dataStructure: 'Array'
    },
    output: {
      description: 'Sorted array',
      properties: ['Sorted in non-decreasing order', 'Contains same elements']
    },
    pseudocode: `
      MERGE-SORT(A, p, r):
        if p < r:
          q = ⌊(p + r) / 2⌋
          MERGE-SORT(A, p, q)
          MERGE-SORT(A, q+1, r)
          MERGE(A, p, q, r)
    `,
    timeComplexity: {
      bestCase: 'Θ(n log n)',
      averageCase: 'Θ(n log n)',
      worstCase: 'O(n log n)',
      recurrence: 'T(n) = 2T(n/2) + O(n)'
    },
    spaceComplexity: {
      auxiliary: 'O(n)',
      total: 'O(n)',
      inPlace: false
    },
    practical: {
      cacheEfficient: true,
      parallelizable: true,
      stable: true,
      deterministic: true
    },
    clrsReference: { chapter: 2, section: 3 }
  },
  designPattern: 'divide_and_conquer',
  dependencies: [],
  assumptions: ['Elements are comparable'],
  uncertainty: 0.05
});

// Solve recurrence
const recurrence = await deepthinking_engineering({
  mode: 'algorithmic',
  thought: 'Solve the merge sort recurrence using master theorem',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'recurrence_solving',
  recurrence: {
    id: 'merge_sort_rec',
    formula: 'T(n) = 2T(n/2) + Θ(n)',
    baseCase: 'T(1) = Θ(1)',
    solutionMethod: 'master_theorem',
    solution: 'Θ(n log n)',
    solutionProof: 'Master theorem case 2: a=2, b=2, f(n)=n, log_b(a)=1, f(n)=Θ(n^log_b(a)), so T(n)=Θ(n log n)'
  },
  timeComplexity: {
    bestCase: 'Θ(n log n)',
    averageCase: 'Θ(n log n)',
    worstCase: 'Θ(n log n)',
    recurrence: 'T(n) = 2T(n/2) + Θ(n)',
    masterTheorem: { a: 2, b: 2, f: 'n', case: 2 }
  },
  dependencies: ['algorithm_definition'],
  assumptions: [],
  uncertainty: 0.02
});

// Prove correctness
const correctness = await deepthinking_engineering({
  mode: 'algorithmic',
  thought: 'Prove merge sort correctness using loop invariant',
  thoughtNumbe

---

*Generated by RLM extraction pass on 2026-04-12*
