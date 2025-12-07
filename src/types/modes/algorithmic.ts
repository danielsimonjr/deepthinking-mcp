/**
 * Algorithmic Mode - Type Definitions
 * Phase 12 (v7.3.0) - Comprehensive algorithm design and analysis
 *
 * Covers all algorithms from "Introduction to Algorithms" (CLRS) and beyond:
 * - Algorithm design patterns (divide-and-conquer, dynamic programming, greedy, backtracking)
 * - Complexity analysis (time, space, amortized)
 * - Correctness proofs (loop invariants, induction)
 * - Data structure analysis
 * - Graph algorithms
 * - Optimization algorithms
 * - String algorithms
 * - Computational geometry
 * - Number-theoretic algorithms
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Algorithmic thought types - covering all CLRS chapters
 */
export type AlgorithmicThoughtType =
  // Foundations
  | 'algorithm_definition'        // Define an algorithm formally
  | 'complexity_analysis'         // Analyze time/space complexity
  | 'recurrence_solving'          // Solve recurrence relations
  | 'correctness_proof'           // Prove algorithm correctness
  | 'invariant_identification'    // Identify loop/recursion invariants

  // Design Patterns
  | 'divide_and_conquer'          // Divide-and-conquer design
  | 'dynamic_programming'         // DP problem formulation
  | 'greedy_choice'               // Greedy algorithm design
  | 'backtracking'                // Backtracking exploration
  | 'branch_and_bound'            // Branch-and-bound optimization
  | 'randomized_analysis'         // Randomized algorithm analysis
  | 'amortized_analysis'          // Amortized cost analysis

  // Data Structure Operations
  | 'data_structure_design'       // Design custom data structure
  | 'data_structure_analysis'     // Analyze DS operations
  | 'augmentation'                // Augment existing data structure

  // Graph Operations
  | 'graph_traversal'             // BFS/DFS analysis
  | 'shortest_path'               // Shortest path algorithms
  | 'minimum_spanning_tree'       // MST algorithms
  | 'network_flow'                // Max flow/min cut
  | 'matching'                    // Bipartite matching

  // Advanced Topics
  | 'string_matching'             // Pattern matching algorithms
  | 'computational_geometry'      // Geometric algorithms
  | 'number_theoretic'            // Number theory algorithms
  | 'approximation'               // Approximation algorithms
  | 'online_algorithm'            // Online/streaming algorithms
  | 'parallel_algorithm';         // Parallel/concurrent algorithms

/**
 * Algorithm design pattern classification
 */
export type DesignPattern =
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

/**
 * Complexity class for classification
 */
export type ComplexityClass =
  | 'O(1)'           // Constant
  | 'O(log n)'       // Logarithmic
  | 'O(n)'           // Linear
  | 'O(n log n)'     // Linearithmic
  | 'O(n²)'          // Quadratic
  | 'O(n³)'          // Cubic
  | 'O(2^n)'         // Exponential
  | 'O(n!)'          // Factorial
  | 'custom';        // Custom expression

/**
 * Time complexity analysis
 */
export interface TimeComplexity {
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
  };

  // For input-sensitive analysis
  inputSensitive?: {
    parameter: string;       // e.g., "number of inversions"
    complexity: string;      // e.g., "O(n + k)"
  };
}

/**
 * Space complexity analysis
 */
export interface SpaceComplexity {
  auxiliary: string;         // Extra space needed
  total: string;            // Total space including input
  inPlace: boolean;          // Is it in-place?

  // Stack space for recursive algorithms
  stackDepth?: string;       // Maximum recursion depth

  // For cache analysis
  cacheEfficiency?: {
    cacheOblivious: boolean;
    cacheComplexity?: string;  // e.g., O(n/B)
  };
}

/**
 * Loop invariant for correctness proofs
 */
export interface LoopInvariant {
  id: string;
  description: string;

  // Three parts of loop invariant proof
  initialization: {
    statement: string;
    proof: string;
  };
  maintenance: {
    statement: string;
    proof: string;
  };
  termination: {
    statement: string;
    proof: string;
    conclusionFollows: string;
  };

  // Location in algorithm
  loopVariable: string;
  loopBounds: string;
}

/**
 * Correctness proof structure
 */
export interface CorrectnessProof {
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
  };

  proofSteps: string[];
  keyInsights: string[];
}

/**
 * Recurrence relation
 */
export interface Recurrence {
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
  };
}

/**
 * Algorithm specification
 */
export interface AlgorithmSpec {
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
  };
  output: {
    description: string;
    properties: string[];       // Properties guaranteed
  };

  // Pseudocode
  pseudocode: string;

  // Complexity
  timeComplexity: TimeComplexity;
  spaceComplexity: SpaceComplexity;

  // Correctness
  correctnessProof?: CorrectnessProof;

  // Practical considerations
  practical?: {
    cacheEfficient: boolean;
    parallelizable: boolean;
    stable?: boolean;           // For sorting
    online?: boolean;           // Can process streaming input
    deterministic: boolean;
    adaptive?: boolean;         // Adapts to input characteristics
  };

  // Comparisons
  alternatives?: string[];
  advantages?: string[];
  disadvantages?: string[];

  // CLRS reference
  clrsReference?: {
    chapter: number;
    section?: number;
    page?: number;
  };
}

/**
 * Dynamic programming formulation
 */
export interface DPFormulation {
  id: string;
  problem: string;

  // The four steps of DP
  characterization: {
    optimalSubstructure: string;
    subproblemDefinition: string;
  };

  recursiveDefinition: {
    stateSpace: string;           // What dp[i][j] represents
    recurrence: string;           // The recurrence relation
    baseCases: string[];
  };

  computationOrder: {
    direction: 'bottom_up' | 'top_down' | 'bidirectional';
    fillOrder: string;            // How table is filled
  };

  reconstruction: {
    method: string;               // How to reconstruct solution
    traceback: string;
  };

  // Analysis
  complexity: {
    states: string;               // Number of subproblems
    transitionCost: string;       // Cost per transition
    total: string;                // Total complexity
  };

  // Optimizations
  optimizations?: {
    spaceOptimization?: string;   // e.g., "Only keep last row"
    memoization?: boolean;
    monotonicity?: string;        // For optimization tricks
  };
}

/**
 * Greedy choice property proof
 */
export interface GreedyProof {
  id: string;
  problem: string;

  // Greedy choice property
  greedyChoice: {
    description: string;
    localOptimum: string;
    globalOptimumProof: string;
  };

  // Optimal substructure
  optimalSubstructure: {
    description: string;
    proof: string;
  };

  // Exchange argument (common proof technique)
  exchangeArgument?: {
    assumption: string;           // Assume optimal solution differs
    modification: string;         // How to modify it
    noWorse: string;              // Why modified is no worse
    conclusion: string;
  };

  // Matroid structure (if applicable)
  matroid?: {
    groundSet: string;
    independentSets: string;
    proof: string;
  };
}

/**
 * Graph algorithm context
 */
export interface GraphAlgorithmContext {
  graphType: 'directed' | 'undirected' | 'mixed';
  weighted: boolean;

  // Properties assumed
  properties?: {
    connected?: boolean;
    acyclic?: boolean;
    bipartite?: boolean;
    planar?: boolean;
    sparse?: boolean;             // |E| = O(|V|)
    dense?: boolean;              // |E| = O(|V|²)
  };

  // Representation used
  representation: 'adjacency_list' | 'adjacency_matrix' | 'edge_list' | 'implicit';

  // Special vertices
  source?: string;
  sink?: string;

  // Edge weights
  weightProperty?: 'non_negative' | 'positive' | 'arbitrary' | 'unit';
}

/**
 * Data structure specification
 */
export interface DataStructureSpec {
  id: string;
  name: string;
  description: string;

  // Operations and their complexities
  operations: {
    name: string;
    description: string;
    worstCase: string;
    amortized?: string;
    averageCase?: string;
  }[];

  // Space usage
  spaceUsage: string;

  // Implementation details
  representation: string;
  invariants: string[];

  // Augmentation
  augmentation?: {
    additionalData: string;
    purpose: string;
    maintenanceCost: string;
  };

  // Comparison with alternatives
  tradeoffs?: {
    versus: string;
    advantages: string[];
    disadvantages: string[];
  }[];
}

/**
 * Amortized analysis
 */
export interface AmortizedAnalysis {
  id: string;
  dataStructure: string;
  operation: string;

  // Method used
  method: 'aggregate' | 'accounting' | 'potential';

  // For aggregate method
  aggregate?: {
    totalCost: string;           // Total cost of n operations
    perOperation: string;        // Amortized cost
  };

  // For accounting method
  accounting?: {
    actualCost: string;
    amortizedCost: string;
    credit: string;              // Where credit is stored
    creditInvariant: string;     // Credit is always non-negative
  };

  // For potential method
  potential?: {
    potentialFunction: string;   // Φ(D)
    initialPotential: string;    // Φ(D₀)
    amortizedCost: string;       // ĉᵢ = cᵢ + Φ(Dᵢ) - Φ(Dᵢ₋₁)
    proof: string;
  };

  result: string;                // Final amortized bound
}

/**
 * CLRS algorithm categories
 */
export type CLRSCategory =
  // Part I: Foundations
  | 'foundations_growth_of_functions'
  | 'foundations_recurrences'
  | 'foundations_probabilistic_analysis'

  // Part II: Sorting and Order Statistics
  | 'sorting_comparison'           // Comparison-based sorting
  | 'sorting_linear_time'          // Counting, radix, bucket
  | 'order_statistics'             // Selection algorithms

  // Part III: Data Structures
  | 'ds_elementary'                // Stacks, queues, lists
  | 'ds_hash_tables'
  | 'ds_binary_search_trees'
  | 'ds_red_black_trees'
  | 'ds_augmenting'
  | 'ds_b_trees'
  | 'ds_fibonacci_heaps'
  | 'ds_van_emde_boas'
  | 'ds_disjoint_sets'

  // Part IV: Advanced Design and Analysis
  | 'design_dynamic_programming'
  | 'design_greedy'
  | 'analysis_amortized'

  // Part V: Advanced Data Structures
  | 'advanced_ds'

  // Part VI: Graph Algorithms
  | 'graph_elementary'             // BFS, DFS
  | 'graph_mst'                    // Minimum spanning trees
  | 'graph_shortest_paths_single'  // Dijkstra, Bellman-Ford
  | 'graph_shortest_paths_all'     // Floyd-Warshall, Johnson
  | 'graph_max_flow'
  | 'graph_matching'

  // Part VII: Selected Topics
  | 'topics_multithreaded'
  | 'topics_matrix'
  | 'topics_linear_programming'
  | 'topics_fft'
  | 'topics_number_theoretic'
  | 'topics_string_matching'
  | 'topics_computational_geometry'
  | 'topics_np_completeness'
  | 'topics_approximation'

/**
 * Famous algorithms covered
 */
export type CLRSAlgorithm =
  // Sorting
  | 'insertion_sort' | 'merge_sort' | 'heapsort' | 'quicksort'
  | 'counting_sort' | 'radix_sort' | 'bucket_sort'
  | 'randomized_select' | 'deterministic_select'

  // Data Structures
  | 'binary_heap_operations' | 'binomial_heap' | 'fibonacci_heap'
  | 'red_black_insert' | 'red_black_delete'
  | 'b_tree_insert' | 'b_tree_delete'
  | 'hash_chaining' | 'open_addressing' | 'perfect_hashing'
  | 'union_find' | 'path_compression' | 'union_by_rank'

  // Graph Algorithms
  | 'bfs' | 'dfs' | 'topological_sort' | 'strongly_connected_components'
  | 'kruskal' | 'prim'
  | 'dijkstra' | 'bellman_ford' | 'dag_shortest_paths'
  | 'floyd_warshall' | 'johnson'
  | 'ford_fulkerson' | 'edmonds_karp' | 'push_relabel'
  | 'hopcroft_karp' | 'hungarian'

  // Dynamic Programming
  | 'matrix_chain' | 'lcs' | 'optimal_bst' | 'knapsack'
  | 'edit_distance' | 'coin_change' | 'rod_cutting'

  // Greedy
  | 'activity_selection' | 'huffman_coding' | 'task_scheduling'

  // String Matching
  | 'naive_string_match' | 'rabin_karp' | 'kmp' | 'boyer_moore'
  | 'suffix_array' | 'suffix_tree' | 'aho_corasick'

  // Computational Geometry
  | 'convex_hull_graham' | 'convex_hull_jarvis'
  | 'closest_pair' | 'line_segment_intersection'

  // Number Theory
  | 'gcd_euclid' | 'extended_euclid' | 'modular_exponentiation'
  | 'miller_rabin' | 'rsa'

  // Matrix
  | 'strassen' | 'matrix_multiply'

  // FFT
  | 'fft' | 'polynomial_multiplication'

  // Linear Programming
  | 'simplex'

  // Approximation
  | 'vertex_cover_approx' | 'tsp_approx' | 'set_cover_approx';

/**
 * Algorithm comparison for analysis
 */
export interface AlgorithmComparison {
  algorithms: string[];
  criteria: {
    criterion: string;
    values: Record<string, string>;
    winner?: string;
  }[];
  recommendation: {
    useCase: string;
    bestAlgorithm: string;
    reasoning: string;
  }[];
}

/**
 * Algorithmic thought extends base thought
 */
export interface AlgorithmicThought extends BaseThought {
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
    }[];
    output: string;
  };
}

/**
 * Type guard for Algorithmic thoughts
 */
export function isAlgorithmicThought(thought: BaseThought): thought is AlgorithmicThought {
  return thought.mode === ThinkingMode.ALGORITHMIC;
}

/**
 * Helper: Determine design pattern from problem characteristics
 */
export function suggestDesignPattern(characteristics: {
  hasOptimalSubstructure: boolean;
  overlappingSubproblems: boolean;
  greedyChoiceProperty: boolean;
  allSolutionsNeeded: boolean;
  onlineInput: boolean;
}): DesignPattern {
  if (characteristics.hasOptimalSubstructure && characteristics.overlappingSubproblems) {
    return 'dynamic_programming';
  }
  if (characteristics.hasOptimalSubstructure && characteristics.greedyChoiceProperty) {
    return 'greedy';
  }
  if (characteristics.allSolutionsNeeded) {
    return 'backtracking';
  }
  if (characteristics.onlineInput) {
    return 'online';
  }
  return 'divide_and_conquer';
}

/**
 * Helper: Apply Master Theorem
 */
export function applyMasterTheorem(
  a: number,
  b: number,
  _fComplexity: string
): { case: 1 | 2 | 3; result: string } | null {
  // This is a simplified version - real implementation would parse _fComplexity
  const logba = Math.log(a) / Math.log(b);

  // Compare f(n) with n^(log_b(a))
  // Case 1: f(n) = O(n^(log_b(a) - ε)) => Θ(n^(log_b(a)))
  // Case 2: f(n) = Θ(n^(log_b(a))) => Θ(n^(log_b(a)) * log n)
  // Case 3: f(n) = Ω(n^(log_b(a) + ε)) and af(n/b) ≤ cf(n) => Θ(f(n))

  return {
    case: 2,
    result: `Θ(n^${logba.toFixed(2)} log n)`,
  };
}

/**
 * Helper: Common recurrence patterns
 */
export const COMMON_RECURRENCES: Record<string, { recurrence: string; solution: string; example: string }> = {
  binary_search: {
    recurrence: 'T(n) = T(n/2) + O(1)',
    solution: 'Θ(log n)',
    example: 'Binary search',
  },
  merge_sort: {
    recurrence: 'T(n) = 2T(n/2) + O(n)',
    solution: 'Θ(n log n)',
    example: 'Merge sort',
  },
  binary_tree_traversal: {
    recurrence: 'T(n) = 2T(n/2) + O(1)',
    solution: 'Θ(n)',
    example: 'Binary tree traversal',
  },
  strassen: {
    recurrence: 'T(n) = 7T(n/2) + O(n²)',
    solution: 'Θ(n^2.807)',
    example: "Strassen's matrix multiplication",
  },
  karatsuba: {
    recurrence: 'T(n) = 3T(n/2) + O(n)',
    solution: 'Θ(n^1.585)',
    example: 'Karatsuba multiplication',
  },
};
