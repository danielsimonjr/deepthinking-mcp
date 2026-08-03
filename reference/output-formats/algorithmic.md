# Algorithmic Thought — Output Format

CLRS-grounded algorithm design, complexity analysis (Big-O/Theta/Omega), recurrence solving, correctness proofs, and data structure selection.

## JSON Schema

```json
{
  "mode": "algorithmic",
  "thoughtType": "<algorithm_definition | algorithm_selection | complexity_analysis | recurrence_solving | correctness_proof | data_structure_selection | comparison>",
  "designPattern": "<divide_and_conquer | dynamic_programming | greedy | graph_traversal | branch_and_bound | backtracking | randomized | brute_force | transform_and_conquer>",
  "clrsCategory": "<optional CLRS category string>",
  "algorithm": {
    "id": "<unique identifier>",
    "name": "<Algorithm Name>",
    "description": "<what it computes>",
    "category": "<e.g., Sorting, Graph, Order Statistics>",
    "designPattern": "<same enum as above>",
    "input": {
      "description": "<input specification>",
      "constraints": ["<constraint 1>"],
      "dataStructure": "<primary data structure>"
    },
    "output": {
      "description": "<output specification>",
      "properties": ["<correctness property 1>"]
    },
    "pseudocode": "<optional pseudocode>",
    "timeComplexity": {
      "bestCase": "Ω(...)",
      "averageCase": "Θ(...)",
      "worstCase": "O(...)",
      "recurrence": "<T(n) = ... optional>"
    },
    "spaceComplexity": {
      "auxiliary": "O(...)",
      "total": "O(...)",
      "inPlace": <true | false>
    },
    "clrsReference": { "chapter": <int>, "section": <number> }
  },
  "timeComplexity": {
    "bestCase": "Ω(...)",
    "averageCase": "Θ(...)",
    "worstCase": "O(...)",
    "amortized": "<optional or null>",
    "masterTheorem": {
      "a": <subproblems>,
      "b": <division factor>,
      "f": "<f(n) term>",
      "case": <1 | 2 | 3>
    }
  },
  "spaceComplexity": {
    "auxiliary": "O(...)",
    "total": "O(...)",
    "inPlace": <true | false>
  },
  "recurrence": {
    "id": "<unique id>",
    "formula": "T(n) = aT(n/b) + f(n)",
    "baseCase": "T(1) = Θ(1)",
    "solutionMethod": "<master_theorem | substitution | recursion_tree | generating_function>",
    "solution": "Θ(...)",
    "solutionProof": "<proof sketch>"
  },
  "comparison": {
    "alternatives": [
      {
        "name": "<algorithm name>",
        "timeComplexity": "O(...)",
        "spaceComplexity": "O(...)",
        "reason": "<why it loses to the winner>"
      }
    ],
    "winner": "<algorithm id or name>",
    "justification": "<why the winner is selected for this problem>"
  },
  "dependencies": ["<prior thought id>"],
  "assumptions": ["<assumption 1>"],
  "uncertainty": <0.0 to 1.0>,
  "keyInsight": "<the single most important observation>"
}
```

## Required Fields

- `mode` — always `"algorithmic"`
- `thoughtType` — specifies the primary analytical act
- `dependencies` — array of prior thought IDs this thought depends on (empty array if none)
- `assumptions` — explicit assumptions; empty array if none
- `uncertainty` — confidence in the analysis, in [0, 1]; lower for established CLRS algorithms

## Complexity Notation Rules

| Field | Correct Notation | Meaning |
|-------|-----------------|---------|
| `bestCase` | Ω(f(n)) | Lower bound |
| `averageCase` | Θ(f(n)) | Tight bound |
| `worstCase` | O(f(n)) | Upper bound |
| `amortized` | Amortized O(f(n)) | Average over operation sequence |

## Master Theorem Application

For T(n) = aT(n/b) + f(n):
- **Case 1**: f(n) = O(n^(log_b(a) - ε)) for some ε > 0 → T(n) = Θ(n^log_b(a))
- **Case 2**: f(n) = Θ(n^log_b(a)) → T(n) = Θ(n^log_b(a) · log n)
- **Case 3**: f(n) = Ω(n^(log_b(a) + ε)) and regularity condition → T(n) = Θ(f(n))

## CLRS Algorithm Categories

| Category | CLRS Chapters | Key Algorithms |
|----------|--------------|----------------|
| Divide and Conquer | 2, 4, 7 | Merge Sort, Quicksort, Strassen |
| Dynamic Programming | 15, 25 | LCS, matrix chain, Floyd-Warshall |
| Greedy | 16, 23, 24 | Huffman, Prim, Kruskal, Dijkstra |
| Graph Algorithms | 22–25 | BFS, DFS, SCC, SSSP, APSP |
| Sorting / Order Statistics | 2, 6–9 | Heapsort, Counting Sort, Select |
| Data Structures | 10–14, 19, 21 | Red-Black Tree, Fibonacci Heap |
| Amortized Analysis | 17 | Dynamic arrays, Splay trees |
| String Algorithms | 32 | KMP, Rabin-Karp |
| NP / Approximation | 34–35 | Vertex Cover, TSP approx |

## Worked Example

Input: "Given N=1M items, find the top-K most recent (K=100). Which algorithm and data structure?"

Output:

```json
{
  "mode": "algorithmic",
  "thoughtType": "algorithm_selection",
  "designPattern": "greedy",
  "clrsCategory": "sorting_order_statistics",
  "algorithm": {
    "id": "top_k_heap",
    "name": "Top-K with Min-Heap",
    "description": "Maintain a min-heap of K elements. Per item: push if heap not full; else push-and-pop if item beats heap minimum.",
    "category": "Order Statistics",
    "designPattern": "greedy",
    "input": {
      "description": "Stream of N items with comparable timestamps",
      "constraints": ["N = 1,000,000", "K = 100"],
      "dataStructure": "Array (streaming)"
    },
    "output": {
      "description": "K items with largest timestamps",
      "properties": ["Exactly K items", "Globally top-K by timestamp"]
    }
  },
  "timeComplexity": {
    "bestCase": "Ω(N)",
    "averageCase": "Θ(N log K)",
    "worstCase": "O(N log K)",
    "amortized": null
  },
  "spaceComplexity": {
    "auxiliary": "O(K)",
    "total": "O(N + K)",
    "inPlace": false
  },
  "comparison": {
    "alternatives": [
      {
        "name": "Full Sort then slice",
        "timeComplexity": "O(N log N)",
        "spaceComplexity": "O(N)",
        "reason": "Sorts all N items including those outside top-K"
      }
    ],
    "winner": "top_k_heap",
    "justification": "O(N log K) = O(7N) vs. O(N log N) = O(20N) for N=1M, K=100. Also uses O(K)=O(100) space vs. O(N)."
  },
  "dependencies": [],
  "assumptions": ["K known in advance", "Timestamps comparable with <"],
  "uncertainty": 0.05,
  "keyInsight": "A min-heap evicts the smallest of the current top-K candidates in O(log K) per item — you never sort more elements than necessary."
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"algorithmic"`
- `thoughtType` is one of the seven valid values
- `timeComplexity.worstCase` uses O notation; `bestCase` uses Ω; `averageCase` uses Θ
- `designPattern` matches one of the nine valid values
- `dependencies` and `assumptions` are arrays (empty arrays are valid)
- `uncertainty` is in [0, 1]
- If Master Theorem is applied, a, b, f, and case are all specified
- `keyInsight` is present and is the single most important observation — not a summary
- Any recurrence solution citing Master Theorem identifies which case applies
