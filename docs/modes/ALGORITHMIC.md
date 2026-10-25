# Algorithmic Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_engineering`
**Status**: Stable (Phase 12, v7.3.0)
**Source**: `src/types/modes/algorithmic.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `AlgorithmicThoughtType`, `DesignPattern`, `ComplexityClass`, `CLRSCategory`, `CLRSAlgorithm`, `AlgorithmDescription`
- **Interfaces**: `TimeComplexity`, `SpaceComplexity`, `LoopInvariant`, `CorrectnessProof`, `Recurrence`, `AlgorithmSpec`, `DPFormulation`, `GreedyProof`, `GraphAlgorithmContext`, `DataStructureSpec`, `AmortizedAnalysis`, `AlgorithmComparison`, `AlgorithmicThought`
- **Functions**: `isAlgorithmicThought`, `suggestDesignPattern`, `applyMasterTheorem`
- **Constants**: `COMMON_RECURRENCES`

---

## Overview

Algorithmic mode provides **comprehensive algorithm design and analysis** covering all topics from "Introduction to Algorithms" (CLRS) and beyond. It supports algorithm design patterns, complexity analysis, correctness proofs, and data structure analysis.

This mode captures the structure of algorithmic reasoning - from problem characterization through design to correctness verification.

## Thought Types

### Foundations
| Type | Description |
|------|-------------|
| `algorithm_definition` | Define an algorithm formally |
| `complexity_analysis` | Analyze time/space complexity |
| `recurrence_solving` | Solve recurrence relations |
| `correctness_proof` | Prove algorithm correctness |
| `invariant_identification` | Identify loop/recursion invariants |

### Design Patterns
| Type | Description |
|------|-------------|
| `divide_and_conquer` | Divide-and-conquer design |
| `dynamic_programming` | DP problem formulation |
| `greedy_choice` | Greedy algorithm design |
| `backtracking` | Backtracking exploration |
| `branch_and_bound` | Branch-and-bound optimization |
| `randomized_analysis` | Randomized algorithm analysis |
| `amortized_analysis` | Amortized cost analysis |

### Data Structures & Graphs
| Type | Description |
|------|-------------|
| `data_structure_design` | Design custom data structure |
| `data_structure_analysis` | Analyze DS operations |
| `graph_traversal` | BFS/DFS analysis |
| `shortest_path` | Shortest path algorithms |
| `minimum_spanning_tree` | MST algorithms |
| `network_flow` | Max flow/min cut |

### Advanced Topics
| Type | Description |
|------|-------------|
| `string_matching` | Pattern matching |
| `computational_geometry` | Geometric algorithms |
| `number_theoretic` | Number theory algorithms |
| `approximation` | Approximation algorithms |

## When to Use Algorithmic Mode

Use algorithmic mode when you need to:

- **Design algorithms** - Systematic algorithm development
- **Analyze complexity** - Time and space analysis
- **Prove correctness** - Loop invariants, induction
- **Compare algorithms** - Algorithm selection
- **Solve recurrences** - Master theorem, etc.

### Problem Types Well-Suited for Algorithmic Mode

- **Algorithm design** - Creating new algorithms
- **Optimization** - Improving algorithm efficiency
- **Data structure selection** - Choosing the right DS
- **Interview preparation** - Technical interview problems
- **Competitive programming** - Contest problems

## Core Concepts

### Design Patterns

```typescript
type DesignPattern =
  | 'brute_force'
  | 'divide_and_conquer'
  | 'dynamic_programming'
  | 'greedy'
  | 'backtracking'
  | 'branch_and_bound'
  | 'randomized'
  | 'approximation'
  | 'online'
  | 'parallel'
  | 'incremental'
  | 'prune_and_search';
```

### Time Complexity

```typescript
interface TimeComplexity {
  bestCase: string;        // Ω notation
  averageCase: string;     // Θ notation
  worstCase: string;       // O notation
  amortized?: string;
  recurrence?: string;     // T(n) = 2T(n/2) + O(n)
  closedForm?: string;
  masterTheorem?: {
    a: number;             // Subproblems
    b: number;             // Division factor
    f: string;             // f(n) term
    case: 1 | 2 | 3;       // Which case
  };
}
```

### Space Complexity

```typescript
interface SpaceComplexity {
  auxiliary: string;       // Extra space
  total: string;           // Including input
  inPlace: boolean;
  stackDepth?: string;     // Recursion depth
  cacheEfficiency?: {
    cacheOblivious: boolean;
    cacheComplexity?: string;
  };
}
```

### Loop Invariant

```typescript
interface LoopInvariant {
  id: string;
  description: string;
  initialization: { statement: string; proof: string };
  maintenance: { statement: string; proof: string };
  termination: { statement: string; proof: string; conclusionFollows: string };
  loopVariable: string;
  loopBounds: string;
}
```

### Correctness Proof

```typescript
interface CorrectnessProof {
  id: string;
  algorithm: string;
  method: 'loop_invariant' | 'induction' | 'contradiction' | 'direct' | 'structural';
  preconditions: string[];
  postconditions: string[];
  invariants?: LoopInvariant[];
  terminationArgument: {
    decreasingQuantity: string;
    lowerBound: string;
    proof: string;
  };
  proofSteps: string[];
  keyInsights: string[];
}
```

### Dynamic Programming Formulation

```typescript
interface DPFormulation {
  id: string;
  problem: string;
  characterization: {
    optimalSubstructure: string;
    subproblemDefinition: string;
  };
  recursiveDefinition: {
    stateSpace: string;           // What dp[i][j] represents
    recurrence: string;
    baseCases: string[];
  };
  computationOrder: {
    direction: 'bottom_up' | 'top_down' | 'bidirectional';
    fillOrder: string;
  };
  reconstruction: {
    method: string;
    traceback: string;
  };
  complexity: {
    states: string;
    transitionCost: string;
    total: string;
  };
}
```

### Greedy Proof

```typescript
interface GreedyProof {
  id: string;
  problem: string;
  greedyChoice: {
    description: string;
    localOptimum: string;
    globalOptimumProof: string;
  };
  optimalSubstructure: {
    description: string;
    proof: string;
  };
  exchangeArgument?: {
    assumption: string;
    modification: string;
    noWorse: string;
    conclusion: string;
  };
}
```

## Request Fields

The tool `deepthinking_engineering` takes these fields in algorithmic mode. The Zod schema accepts
and bounds every field that `AlgorithmicHandler` reads. The advertised JSON Schema lists a subset,
because the definition of one tool must stay under 16,000 bytes.

### Fields that the tool lists

| Field | Content |
|-------|---------|
| `thoughtType` | One of the 26 thought types in this document |
| `designPattern` | One of the 12 design patterns |
| `algorithm` | `name`, `description`, `category` |
| `clrsCategory`, `clrsAlgorithm` | The CLRS classification, as strings |
| `pseudocode`, `keyInsight` | Strings |
| `timeComplexity` | All members of Time Complexity |
| `spaceComplexity` | All members of Space Complexity |
| `recurrence` | `id`, `formula`, `baseCase`, `closedForm`, `complexity`, `solutionMethod`, `solution`, `solutionProof`, `recursionTree`. Recursive mode uses the same object. It reads `formula`, `baseCase`, `closedForm` and `complexity`, and it ignores the other members. |
| `correctnessProof` | All members of Correctness Proof except `invariants` |

### Fields that the tool accepts and does not list

- `dpFormulation`, `greedyProof`, `loopInvariants`, `graphContext`, `dataStructure`,
  `amortizedAnalysis`, `comparison` and `executionTrace`
- `correctnessProof.invariants`
- The members of `algorithm` other than `name`, `description` and `category`: `id`, `input`,
  `output`, `pseudocode`, `practical`, `alternatives`, `advantages`, `disadvantages` and
  `clrsReference`

The description of the tool names these fields and ends with a link to this page on the `master`
branch. The list is a constant in
`tests/unit/tools/schemas/advertised-omissions.ts`, with the reason "tool size cap". A test fails
in each of these cases:

- A listed field is not accepted.
- An accepted field is neither listed nor in the list above.
- The list and the schemas disagree.

The advertised schema of the tool has no `additionalProperties: false` at three levels: the
top level, `algorithm` and `correctnessProof`. A client that checks a request against the
advertised schema would reject the unlisted fields if the key were present. The server removes a
key that no schema declares, at every depth, and it never rejects one. A block that uses member
names other than the names in this document is stored with empty members. The answer carries no
sentence for it.

An algorithm that carries `designPattern`, `timeComplexity`, `spaceComplexity` or
`correctnessProof` inside `algorithm` loses them. Send them as top-level fields.

### Spelling of design patterns

A design pattern is spelled with underscores: `divide_and_conquer`. Three cases exist.

- A known value is stored as sent.
- A known value with hyphens, such as `divide-and-conquer`, is read as the underscore value and
  stored with underscores. The answer carries one sentence in `validation.issues` that names both
  spellings.
- An unknown value is not stored. The answer carries one sentence that lists the 12 values.

### What the handler fills in

The thought type requires some members. The handler gives each missing member a value, so that
no export prints `undefined`.

| Case | Result |
|------|--------|
| `thoughtType` absent | `algorithm_definition`, with no sentence |
| `thoughtType` unknown | `algorithm_definition`, with one sentence |
| A required text member is absent | The empty string |
| A required list member is absent | The empty list |
| An `id` is absent | A generated identifier |
| `inPlace` or `weighted` is absent | `false` |
| `algorithm.pseudocode` absent | The top-level `pseudocode` |
| A member that is a choice from a list is absent | The member stays absent (two exceptions: see below) |
| An optional member is absent | The member stays absent |

The flag objects `practical`, `clrsReference`, `masterTheorem`, `inputSensitive` and
`cacheEfficiency` are stored as sent.

### Members with a fixed vocabulary

A member is stored only when the client sent it, because an absent member is not a choice that
the client made. Two members are the exception. They take the first value of their list when
absent: `correctnessProof.method` and `dpFormulation.computationOrder.direction`. An unrecognised
value is kept as sent, and the answer carries one sentence that lists the recognised values.

| Member | Values | When absent |
|--------|--------|-------------|
| `correctnessProof.method` | `loop_invariant`, `induction`, `contradiction`, `direct`, `structural` | `loop_invariant` |
| `recurrence.solutionMethod` | `master_theorem`, `substitution`, `recursion_tree`, `generating_function` | Stays absent |
| `amortizedAnalysis.method` | `aggregate`, `accounting`, `potential` | Stays absent |
| `dpFormulation.computationOrder.direction` | `bottom_up`, `top_down`, `bidirectional` | `bottom_up` |
| `graphContext.graphType` | `directed`, `undirected`, `mixed` | Stays absent |
| `graphContext.representation` | `adjacency_list`, `adjacency_matrix`, `edge_list`, `implicit` | Stays absent |
| `graphContext.weightProperty` | `non_negative`, `positive`, `arbitrary`, `unit` | Stays absent |

The suggestions of a thought print `Method:` for an amortized analysis, and the graph type in
`Graph:`, only when the thought holds the member.

`clrsCategory` and `clrsAlgorithm` are stored as sent, with no sentence.

## Usage Example

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
    input: {
      description: 'Array of comparable elements',
      constraints: ['Elements must be comparable'],
      dataStructure: 'Array'
    },
    output: {
      description: 'Sorted array',
      properties: ['Sorted in non-decreasing order', 'Contains same elements']
    },
    practical: {
      cacheEfficient: true,
      parallelizable: true,
      stable: true,
      deterministic: true
    },
    clrsReference: { chapter: 2, section: 3 }
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
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'correctness_proof',
  correctnessProof: {
    id: 'merge_sort_proof',
    algorithm: 'merge_sort',
    method: 'loop_invariant',
    preconditions: ['A is an array of comparable elements'],
    postconditions: ['A[p..r] is sorted', 'A[p..r] contains original elements'],
    invariants: [{
      id: 'merge_invariant',
      description: 'At the start of each iteration of the merge loop, A[p..k-1] contains the k-p smallest elements of L and R, in sorted order',
      initialization: {
        statement: 'Before the loop, k=p, so A[p..p-1] is empty (sorted trivially)',
        proof: 'Empty subarray is sorted'
      },
      maintenance: {
        statement: 'Each iteration places the next smallest element at position k',
        proof: 'We compare L[i] and R[j], placing the smaller at A[k]. This extends the sorted sequence.'
      },
      termination: {
        statement: 'Loop terminates when all elements of L and R are copied',
        proof: 'Each iteration increments k, eventually k > r',
        conclusionFollows: 'All elements copied, A[p..r] is sorted'
      },
      loopVariable: 'k',
      loopBounds: 'p to r'
    }],
    terminationArgument: {
      decreasingQuantity: 'r - p + 1 (problem size)',
      lowerBound: '1',
      proof: 'Each recursive call halves the problem size, eventually reaching base case'
    },
    proofSteps: [
      '1. Base case: Array of size 1 is sorted',
      '2. Inductive hypothesis: MERGE-SORT correctly sorts subarrays',
      '3. MERGE correctly combines two sorted subarrays',
      '4. By induction, MERGE-SORT correctly sorts any array'
    ],
    keyInsights: ['Divide phase is trivial', 'Merge is the core operation']
  },
  loopInvariants: [{/* same as above */}],
  dependencies: ['recurrence_solving'],
  assumptions: [],
  uncertainty: 0.05
});

// Dynamic programming example
const dp = await deepthinking_engineering({
  mode: 'algorithmic',
  thought: 'Formulate longest common subsequence as DP',
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'dynamic_programming',
  dpFormulation: {
    id: 'lcs_dp',
    problem: 'Longest Common Subsequence',
    characterization: {
      optimalSubstructure: 'LCS of X[1..m] and Y[1..n] can be computed from LCS of prefixes',
      subproblemDefinition: 'L[i,j] = length of LCS of X[1..i] and Y[1..j]'
    },
    recursiveDefinition: {
      stateSpace: 'L[i][j] = length of LCS of X[1..i] and Y[1..j]',
      recurrence: `
        L[i,j] = 0                        if i=0 or j=0
        L[i,j] = L[i-1,j-1] + 1           if X[i] = Y[j]
        L[i,j] = max(L[i-1,j], L[i,j-1])  otherwise
      `,
      baseCases: ['L[0,j] = 0 for all j', 'L[i,0] = 0 for all i']
    },
    computationOrder: {
      direction: 'bottom_up',
      fillOrder: 'Row by row, left to right'
    },
    reconstruction: {
      method: 'Backtrack from L[m,n]',
      traceback: 'Follow the path that led to each value'
    },
    complexity: {
      states: 'O(mn)',
      transitionCost: 'O(1)',
      total: 'O(mn) time and space'
    }
  },
  clrsCategory: 'design_dynamic_programming',
  clrsAlgorithm: 'lcs',
  dependencies: [],
  assumptions: [],
  uncertainty: 0.05
});

// Compare algorithms
const comparison = await deepthinking_engineering({
  mode: 'algorithmic',
  thought: 'Compare sorting algorithms',
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false,

  thoughtType: 'complexity_analysis',
  comparison: {
    algorithms: ['merge_sort', 'quicksort', 'heapsort'],
    criteria: [
      { criterion: 'Worst-case time', values: { merge_sort: 'O(n log n)', quicksort: 'O(n²)', heapsort: 'O(n log n)' }, winner: 'merge_sort' },
      { criterion: 'Average-case time', values: { merge_sort: 'Θ(n log n)', quicksort: 'Θ(n log n)', heapsort: 'Θ(n log n)' } },
      { criterion: 'Space', values: { merge_sort: 'O(n)', quicksort: 'O(log n)', heapsort: 'O(1)' }, winner: 'heapsort' },
      { criterion: 'Stable', values: { merge_sort: 'Yes', quicksort: 'No', heapsort: 'No' }, winner: 'merge_sort' },
      { criterion: 'Cache-friendly', values: { merge_sort: 'Good', quicksort: 'Best', heapsort: 'Poor' }, winner: 'quicksort' }
    ],
    recommendation: [
      { useCase: 'General purpose', bestAlgorithm: 'quicksort', reasoning: 'Best average performance, cache-friendly' },
      { useCase: 'Stability required', bestAlgorithm: 'merge_sort', reasoning: 'Only stable O(n log n) option' },
      { useCase: 'Memory constrained', bestAlgorithm: 'heapsort', reasoning: 'O(1) auxiliary space' }
    ]
  },
  dependencies: [],
  assumptions: [],
  uncertainty: 0.1
});
```

## Common Recurrences

| Pattern | Recurrence | Solution | Example |
|---------|------------|----------|---------|
| Binary search | T(n) = T(n/2) + O(1) | Θ(log n) | Binary search |
| Merge sort | T(n) = 2T(n/2) + O(n) | Θ(n log n) | Merge sort |
| Tree traversal | T(n) = 2T(n/2) + O(1) | Θ(n) | Binary tree traversal |
| Strassen | T(n) = 7T(n/2) + O(n²) | Θ(n^2.807) | Matrix multiplication |
| Karatsuba | T(n) = 3T(n/2) + O(n) | Θ(n^1.585) | Integer multiplication |

## Best Practices

### Algorithm Design

✅ **Do:**
- Identify the design pattern first
- Consider edge cases
- Analyze complexity before implementation

❌ **Don't:**
- Jump to coding without design
- Ignore worst-case complexity
- Skip correctness reasoning

### Correctness Proofs

✅ **Do:**
- Identify loop invariants
- Prove all three parts (init, maint, term)
- Show termination explicitly

❌ **Don't:**
- Skip termination arguments
- Use hand-wavy proofs
- Ignore edge cases

### DP Formulation

✅ **Do:**
- Identify optimal substructure
- Define state space clearly
- Consider reconstruction

❌ **Don't:**
- Skip base cases
- Ignore space optimization
- Forget to reconstruct solution

## AlgorithmicThought Interface

```typescript
interface AlgorithmicThought extends BaseThought {
  mode: ThinkingMode.ALGORITHMIC;
  thoughtType: AlgorithmicThoughtType;
  algorithm?: AlgorithmDescription;
  clrsCategory?: CLRSCategory;
  clrsAlgorithm?: CLRSAlgorithm;
  designPattern?: DesignPattern;
  timeComplexity?: TimeComplexity;
  spaceComplexity?: SpaceComplexity;
  recurrence?: Recurrence;
  correctnessProof?: CorrectnessProof;
  loopInvariants?: LoopInvariant[];
  dpFormulation?: DPFormulation;
  greedyProof?: GreedyProof;
  graphContext?: GraphAlgorithmContext;
  dataStructure?: DataStructureSpec;
  amortizedAnalysis?: AmortizedAnalysis;
  comparison?: AlgorithmComparison;
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
  pseudocode?: string;
  executionTrace?: {
    input: string;
    steps: { step: number; state: string; action: string }[];
    output: string;
  };
  inputWarnings?: string[];   // One sentence per request value that the handler replaced or ignored
}
```

`AlgorithmDescription` is `AlgorithmSpec` without `designPattern`, `timeComplexity`,
`spaceComplexity` and `correctnessProof`. A thought carries those four as its own fields.

## Integration with Other Modes

Algorithmic mode integrates with:

- **Computability Mode** - Decidability and complexity
- **Mathematics Mode** - Proof techniques
- **Optimization Mode** - Algorithm optimization
- **Engineering Mode** - Algorithm selection

## Related Modes

- [Computability Mode](./COMPUTABILITY.md) - Complexity theory
- [Mathematics Mode](./MATHEMATICS.md) - Mathematical proofs
- [Optimization Mode](./OPTIMIZATION.md) - Optimization
- [Engineering Mode](./ENGINEERING.md) - Design decisions

## Limitations

- **No execution** - Reasoning only, no actual computation
- **Pseudocode focus** - Not tied to specific languages
- **Theoretical** - Practical constants not considered

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
