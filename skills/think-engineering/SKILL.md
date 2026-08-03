---
name: think-engineering
description: Engineering and algorithmic reasoning methods — Engineering (design trade-offs, constraint-driven decisions, reliability/performance/cost trade-offs) and Algorithmic (CLRS algorithm categories, complexity analysis, data structure selection, problem-to-algorithm matching). Use when the user invokes `/think engineering` or `/think algorithmic`, or asks about design trade-offs, algorithm selection, complexity analysis, or data structure choices.
argument-hint: "[engineering|algorithmic] <problem>"
---

# think-engineering — Engineering and Algorithmic Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `engineering` or `algorithmic`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains two structured reasoning methods: **Engineering** (systematic design analysis with trade-off matrices, FMEA, and ADR) and **Algorithmic** (CLRS-grounded algorithm design, complexity analysis, and data structure selection).

---

## Engineering Reasoning

Engineering reasoning provides structured design analysis. It forces explicit trade-off evaluation across competing objectives (correctness, simplicity, performance, cost, reliability) rather than converging prematurely on a single option.

### When to Use

- Choosing between architectures, tools, or technologies where multiple constraints conflict
- Analyzing failure modes before committing to a design
- Documenting design decisions so future engineers understand the rationale
- Evaluating whether a requirement is achievable given cost and schedule constraints
- Any "should we use X or Y?" question that involves real engineering consequences

**Do not use Engineering** when:
- The choice is purely aesthetic or has no meaningful consequences
- Only one option exists → document the constraint instead
- You need algorithmic correctness or complexity analysis → use Algorithmic

### The Core Move: Explicit Trade-Off Analysis

Engineering reasoning is not a list of requirements. It is a comparison of alternatives across weighted criteria. The key discipline:

1. **Name the design challenge** — What is actually being decided?
2. **Identify the constraints** — Budget, latency, team skill, regulatory requirements, uptime SLA. Constraints eliminate alternatives before scoring begins.
3. **Generate at least two alternatives** — Never evaluate a single option. The point is comparison.
4. **Define evaluation criteria with weights** — Common criteria: correctness, simplicity, performance, cost, operational burden, reliability, security. Weights must sum to 1.0.
5. **Score each alternative per criterion** — Use a 1–10 scale. Write a rationale for every score, not just the winner.
6. **Compute weighted scores** — `weightedScore = score × weight`. Sum per alternative.
7. **Identify failure modes** — For the leading alternative, what can go wrong? Use FMEA: Severity × Occurrence × Detection = Risk Priority Number (RPN). High-RPN failures require mitigation before acceptance.
8. **Document the decision** — Capture the winning alternative, the runner-up score, and why the difference justifies the choice. Future engineers need the second-place rationale.
9. **State open issues** — What assumptions require validation? What risks are accepted rather than mitigated?

### Trade-Off Dimensions (Engineering Compass)

| Dimension | What It Measures |
|-----------|-----------------|
| Correctness | Does it reliably produce the right result? |
| Simplicity | How understandable and maintainable is it? |
| Performance | Latency, throughput, resource consumption |
| Cost | Licensing, infrastructure, development time |
| Reliability | MTBF, failure isolation, graceful degradation |
| Operability | Deployability, observability, runbook complexity |
| Security | Attack surface, credential exposure, audit trails |

Not all dimensions apply to every decision. Omit irrelevant criteria — including them with zero weight wastes cognitive effort.

### Output Format

See `reference/output-formats/engineering.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "engineering",
  "analysisType": "trade-study",
  "designChallenge": "<what is being decided>",
  "tradeStudy": {
    "title": "<study name>",
    "objective": "<decision objective>",
    "alternatives": [
      { "id": "a1", "name": "<option A>", "description": "<brief>", "pros": [], "cons": [], "riskLevel": "low" }
    ],
    "criteria": [
      { "id": "c1", "name": "<criterion>", "weight": 0.3, "description": "<what it measures>", "higherIsBetter": true }
    ],
    "scores": [
      { "alternativeId": "a1", "criteriaId": "c1", "score": 7, "weightedScore": 2.1, "rationale": "<why 7>" }
    ],
    "recommendation": "a1",
    "justification": "<why a1 wins>"
  },
  "assessment": {
    "confidence": 0.8,
    "keyRisks": ["<risk 1>"],
    "nextSteps": ["<next step 1>"],
    "openIssues": ["<unresolved assumption>"]
  }
}
```

### Verification Before Emitting

- `mode` is exactly `"engineering"`
- `analysisType` is one of: `"requirements"`, `"trade-study"`, `"fmea"`, `"decision"`
- At least **two** alternatives in any trade study — a single-alternative analysis is not a trade study
- Criteria weights sum to 1.0 (within ±0.01 rounding)
- Every score has an explicit `rationale` — bare numbers are not engineering analysis
- `recommendation` points to an `id` that actually exists in `alternatives`
- `assessment.confidence` is in [0, 1]
- High-RPN failure modes (RPN ≥ 100) in any FMEA have a non-empty `mitigation`

### Worked Example

Input: "Should we use a database or a message queue for order processing? What are the trade-offs?"

Analysis:

The design challenge is order processing durability and decoupling. Three alternatives are in scope: (1) synchronous relational DB writes, (2) message queue (Kafka/SQS) with async DB consumer, (3) event sourcing with append-only log.

Criteria and weights:
- Operational simplicity (0.30) — fewer moving parts, easier to debug
- Reliability / at-least-once delivery (0.30) — orders must not be lost
- Throughput scalability (0.20) — handles Black Friday spikes
- Cost / infrastructure burden (0.20) — team size is 4 engineers

Scores (1–10):

| Alternative | Simplicity | Reliability | Throughput | Cost | Weighted Total |
|-------------|-----------|-------------|------------|------|---------------|
| Direct DB | 9 | 6 | 5 | 9 | 7.2 |
| Message Queue | 6 | 9 | 9 | 6 | 7.5 |
| Event Sourcing | 3 | 9 | 9 | 3 | 6.0 |

Output:

```json
{
  "mode": "engineering",
  "analysisType": "trade-study",
  "designChallenge": "Select order processing mechanism: direct DB write vs. message queue vs. event sourcing",
  "tradeStudy": {
    "title": "Order Processing Architecture Selection",
    "objective": "Choose a durable, scalable mechanism for capturing customer orders with at-least-once delivery guarantee",
    "alternatives": [
      {
        "id": "db",
        "name": "Direct DB Write",
        "description": "Synchronous INSERT to PostgreSQL orders table within the HTTP request",
        "pros": ["Simple — no new infrastructure", "Transactions give ACID guarantees", "Easy to query for reporting"],
        "cons": ["DB becomes bottleneck under spike load", "No natural backpressure mechanism", "Tight coupling: if DB is slow, API is slow"],
        "riskLevel": "low"
      },
      {
        "id": "mq",
        "name": "Message Queue (SQS/Kafka)",
        "description": "HTTP handler publishes order event to queue; separate consumer writes to DB",
        "pros": ["Decouples ingestion from processing", "Natural backpressure and replay", "Scales ingestion independently"],
        "cons": ["Two new components to operate (queue + consumer)", "Eventually consistent — order not immediately in DB", "At-least-once delivery requires idempotent consumer"],
        "riskLevel": "medium"
      },
      {
        "id": "es",
        "name": "Event Sourcing",
        "description": "Append-only event log as source of truth; projections rebuild read models",
        "pros": ["Full audit trail", "Temporal queries possible", "Highly scalable"],
        "cons": ["High complexity — requires CQRS expertise", "Projection rebuilds are slow on large datasets", "Overkill for a 4-person team"],
        "riskLevel": "high"
      }
    ],
    "criteria": [
      { "id": "simplicity", "name": "Operational Simplicity", "weight": 0.30, "description": "Fewer moving parts, easier incident response", "higherIsBetter": true },
      { "id": "reliability", "name": "Reliability / At-Least-Once Delivery", "weight": 0.30, "description": "Orders must never be silently lost", "higherIsBetter": true },
      { "id": "throughput", "name": "Throughput Scalability", "weight": 0.20, "description": "Handles 10× normal load during peak events", "higherIsBetter": true },
      { "id": "cost", "name": "Cost / Infrastructure Burden", "weight": 0.20, "description": "Licensing + ops effort for a 4-engineer team", "higherIsBetter": true }
    ],
    "scores": [
      { "alternativeId": "db", "criteriaId": "simplicity", "score": 9, "weightedScore": 2.7, "rationale": "Single service, single database — every engineer already understands it" },
      { "alternativeId": "db", "criteriaId": "reliability", "score": 6, "weightedScore": 1.8, "rationale": "ACID transactions prevent corruption but DB saturation under spike can cause timeouts and data loss if retries are not implemented" },
      { "alternativeId": "db", "criteriaId": "throughput", "score": 5, "weightedScore": 1.0, "rationale": "DB write path serializes under load; read-write contention degrades throughput above ~2000 TPS on typical hardware" },
      { "alternativeId": "db", "criteriaId": "cost", "score": 9, "weightedScore": 1.8, "rationale": "No additional infrastructure — RDS instance already paid for" },
      { "alternativeId": "mq", "criteriaId": "simplicity", "score": 6, "weightedScore": 1.8, "rationale": "Two additional components (queue + consumer) increase runbook complexity and debugging surface" },
      { "alternativeId": "mq", "criteriaId": "reliability", "score": 9, "weightedScore": 2.7, "rationale": "SQS guaranteed at-least-once delivery; consumer idempotency key on order_id prevents duplicates" },
      { "alternativeId": "mq", "criteriaId": "throughput", "score": 9, "weightedScore": 1.8, "rationale": "Queue absorbs burst traffic; consumer scales horizontally; ingestion path never blocks on DB" },
      { "alternativeId": "mq", "criteriaId": "cost", "score": 6, "weightedScore": 1.2, "rationale": "SQS pricing is negligible at our volume; consumer ECS task adds ~$40/month plus oncall burden" },
      { "alternativeId": "es", "criteriaId": "simplicity", "score": 3, "weightedScore": 0.9, "rationale": "CQRS + event sourcing requires specialized knowledge; projection rebuilds add operational complexity" },
      { "alternativeId": "es", "criteriaId": "reliability", "score": 9, "weightedScore": 2.7, "rationale": "Append-only log is highly durable; replay capability is best-in-class" },
      { "alternativeId": "es", "criteriaId": "throughput", "score": 9, "weightedScore": 1.8, "rationale": "Log appends are extremely fast; read models scale independently" },
      { "alternativeId": "es", "criteriaId": "cost", "score": 3, "weightedScore": 0.6, "rationale": "Requires dedicated event store infrastructure and significant team training investment" }
    ],
    "recommendation": "mq",
    "justification": "Message queue scores 7.5 vs. 7.2 for direct DB. The 0.3-point margin is not decisive on its own, but the failure mode analysis drives the decision: under spike load the direct DB path has no backpressure, meaning a Black Friday surge would cause cascading timeouts. The queue provides natural load leveling at modest operational cost. Event sourcing is ruled out by complexity — a 4-person team cannot absorb the operational burden.",
    "sensitivityNotes": "If the team scales beyond 12 engineers and audit trail requirements increase, re-evaluate event sourcing. If operational simplicity is re-weighted to 0.45, direct DB edges back to 7.65 vs. 7.35 — revisit if the team shrinks further."
  },
  "assessment": {
    "confidence": 0.82,
    "keyRisks": [
      "Consumer idempotency must be implemented correctly — duplicate orders are a business risk",
      "Message visibility timeout must exceed max processing time to prevent re-delivery of in-flight messages"
    ],
    "nextSteps": [
      "Prototype SQS consumer with idempotency key on order_id",
      "Load test consumer at 5× peak order rate",
      "Define dead-letter queue alert threshold and runbook"
    ],
    "openIssues": [
      "Exact peak TPS estimate not yet measured — current assumption is 2000 TPS based on last Black Friday",
      "SQS vs. Kafka decision deferred pending data retention requirements review"
    ]
  }
}
```

Natural-language summary: "The message queue wins on reliability and throughput while remaining tractable for a small team. The score difference is small, so the decision is sensitive to team size and simplicity weighting — document this sensitivity so the decision can be revisited if constraints change. The most important next step is proving out consumer idempotency, not the queue selection itself."

---

## Algorithmic Reasoning

Algorithmic reasoning provides systematic algorithm design and analysis grounded in CLRS (Cormen, Leiserson, Rivest, Stein — *Introduction to Algorithms*). It covers problem-to-algorithm matching, complexity analysis (Big-O, Big-Theta, Big-Omega, amortized), recurrence solving, correctness proofs, and data structure selection.

### When to Use

- Selecting an algorithm for a well-defined problem (sorting, searching, shortest path, scheduling)
- Analyzing time and space complexity of existing code
- Proving or disproving that an algorithm is correct
- Choosing a data structure for specific access patterns
- Solving recurrences (Master Theorem, substitution method, recursion tree)
- Recognizing whether a problem has optimal substructure (DP) or a greedy-choice property

**Do not use Algorithmic** when:
- The problem is architectural or involves operational trade-offs → use Engineering
- The analysis is empirical/benchmarking rather than asymptotic → note that distinction explicitly
- No well-defined problem structure exists — brainstorm first, then apply Algorithmic once the problem is characterized

### CLRS Algorithm Categories

The CLRS taxonomy covers every major algorithm design paradigm:

| Category | Key Algorithms | CLRS Chapters |
|----------|---------------|---------------|
| **Divide and Conquer** | Merge Sort, Quick Sort, Strassen's matrix multiply, binary search | 2, 4, 7 |
| **Dynamic Programming** | Rod cutting, LCS, matrix chain, 0/1 knapsack, Floyd-Warshall, Bellman-Ford | 15, 25 |
| **Greedy Algorithms** | Activity selection, Huffman codes, Prim's, Kruskal's, Dijkstra's | 16, 23, 24 |
| **Graph Algorithms** | BFS, DFS, topological sort, SCC (Kosaraju/Tarjan), MST, SSSP, APSP | 22–25 |
| **Sorting and Order Statistics** | Insertion sort, Heapsort, Quicksort, Counting sort, Radix sort, Bucket sort, Randomized select | 2, 6, 7, 8, 9 |
| **Data Structures** | Binary heaps, hash tables, BSTs, Red-Black trees, B-trees, Fibonacci heaps, disjoint sets | 10–14, 19, 21 |
| **String Algorithms** | Naive matching, Rabin-Karp, KMP, Boyer-Moore, suffix arrays | 32 |
| **NP and Approximation** | P vs. NP, Cook's theorem, vertex cover, TSP approximation, set cover | 34–35 |
| **Randomized Algorithms** | Randomized Quicksort, skip lists, hashing with chaining | 5, 7, 11 |
| **Amortized Analysis** | Aggregate, accounting, potential methods; applied to dynamic arrays, splay trees | 17 |
| **Number-Theoretic** | Euclid's GCD, modular exponentiation, Miller-Rabin primality, RSA | 31 |
| **Geometric Algorithms** | Convex hull (Graham scan, Jarvis march), segment intersection, closest pair | 33 |

### How to Reason Algorithmically

1. **Characterize the problem** — Input/output specification, constraints (n size, key type, ordering), and which CLRS category applies.
2. **Identify design pattern** — Divide and conquer? Greedy? DP? Recognition heuristics:
   - *Optimal substructure + overlapping subproblems* → Dynamic Programming
   - *Greedy-choice property: local optimum leads to global optimum* → Greedy
   - *Problem splits into independent subproblems of equal size* → Divide and Conquer
   - *Connectivity, reachability, ordering* → Graph algorithms
3. **Select algorithm** — Name the specific algorithm, cite CLRS chapter/section if applicable.
4. **Analyze complexity** — State worst-case O, average-case Θ, and best-case Ω for both time and space. If recursive, solve the recurrence.
5. **Solve recurrences** — Use Master Theorem when applicable (T(n) = aT(n/b) + f(n)). Fall back to substitution or recursion-tree methods.
6. **Prove correctness** (when rigor is required) — Loop invariant for iterative algorithms (initialization, maintenance, termination). Induction or exchange argument for greedy. Optimal substructure for DP.
7. **Select data structures** — Match access pattern to structure: random access → array; ordered traversal → BST/sorted array; priority queue → binary heap / Fibonacci heap; amortized O(1) insert+lookup → hash table; union-find → disjoint-set forest.
8. **Compare alternatives** — State runner-up algorithms and why the selected one wins for this problem's constraints.

### Complexity Reference

| Notation | Meaning | Use For |
|----------|---------|---------|
| O(f(n)) | Upper bound | Worst-case guarantees |
| Θ(f(n)) | Tight bound | Average-case when distribution is known |
| Ω(f(n)) | Lower bound | Best-case or impossibility proofs |
| Amortized | Average over sequence of operations | Dynamic arrays, splay trees, union-find |

Common complexity landmarks: O(1) < O(log n) < O(√n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)

### Data Structure Selection Guide

| Access Pattern | Best Structure | Time Complexity |
|---------------|----------------|-----------------|
| Random access by index | Array | O(1) read/write |
| Ordered traversal, range queries | Balanced BST (Red-Black) | O(log n) insert/delete/search |
| Frequent min/max extraction | Binary Heap | O(log n) insert, O(1) peek |
| Fast insert + lookup, no order | Hash Table | O(1) amortized |
| Decreasing-key for Dijkstra | Fibonacci Heap | O(1) amortized decrease-key |
| Connectivity queries (union-find) | Disjoint-Set Forest | O(α(n)) amortized |
| Top-K with streaming updates | Min-Heap of size K | O(log K) per update |

### CLRS Reference Extraction

For per-algorithm complexity tables, correctness-proof sketches, and known pitfalls beyond the summary tables above, consult `references/clrs-full-extraction.json` — a structured extraction of CLRS covering every algorithm named in the categories table (time/space complexity, prerequisites, and common failure modes per algorithm). Use it to ground `timeComplexity`/`spaceComplexity` fields and the `keyInsight` field with CLRS-accurate detail rather than recalling complexity bounds from memory.

### Evolutionary Optimization (Shinka) — Guidance, Not a `/think` Mode

This is **guidance for the agent, not a schema'd `/think algorithmic` output**. It does not produce a JSON thought and is not validated against `reference/output-formats/algorithmic.md` — it describes a semi-autonomous workflow that shells out to external `shinka-*` CLI tools (ShinkaEvolve) to evolve a working code implementation once an algorithm has already been reasoned about.

**Trigger:** the user says "optimize this function," "make this faster," "find a better algorithm for this," or asks "can we do better?" after an algorithm is already implemented. Do not trigger for simple bug fixes, style/formatting, or when the user explicitly wants a manual rewrite. Requires ShinkaEvolve installed (`pip install shinka-evolve`); prompt the user to install it if missing.

**Workflow (analyze → scaffold → evolve → inspect → deliver):**

1. **Analyze** — Classify the algorithmic core (sorting, searching, graph, DP, etc.), current time/space complexity, the hot path, and correctness invariants that must be preserved.
2. **Scaffold** — Auto-generate a `./shinka_task/` sidecar directory: `initial.py` (current implementation with `EVOLVE-BLOCK` markers tight around only the algorithmic core, preserving the function signature/I-O contract), `evaluate.py` (correctness gate + performance score, e.g. 70% speed / 30% correctness coverage), and diverse test inputs (best/worst/average case, edge cases, domain-specific stress tests).
3. **Evolve** — Run `shinka-run`, first batch `--num_generations 20 --set db.num_islands=3`, with a `task_sys_msg` naming the algorithm class, current complexity, and optimization target. Use multiple islands for diverse pressure (pure speed, algorithmic novelty, worst-case robustness) so the run doesn't converge on one local optimum.
4. **Inspect** — After each batch, use `shinka-inspect` to review the top 3 variants with before/after benchmarks; explain what changed (better algorithm, constant-factor win, or hybrid approach); ask the user to continue evolving or adopt a winner.
5. **Deliver** — On selection, replace the original code, document what changed and why as a code comment, and report original vs. new complexity plus the benchmark improvement.

Full scoring guidelines by algorithm class, the island-strategy rationale, and scaffold file templates are in `references/shinka-evolution.md`.

### Output Format

See `reference/output-formats/algorithmic.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "algorithmic",
  "thoughtType": "algorithm_selection",
  "designPattern": "divide_and_conquer",
  "clrsCategory": "sorting",
  "algorithm": {
    "id": "<algo_id>",
    "name": "<Algorithm Name>",
    "description": "<what it does>",
    "category": "<CLRS category>",
    "designPattern": "<pattern>",
    "input": { "description": "<>", "constraints": [], "dataStructure": "<>" },
    "output": { "description": "<>", "properties": [] }
  },
  "timeComplexity": {
    "bestCase": "Ω(...)",
    "averageCase": "Θ(...)",
    "worstCase": "O(...)"
  },
  "spaceComplexity": {
    "auxiliary": "O(...)",
    "total": "O(...)",
    "inPlace": false
  },
  "dependencies": [],
  "assumptions": [],
  "uncertainty": 0.05,
  "keyInsight": "<the key observation that makes this algorithm work>"
}
```

### Verification Before Emitting

- `mode` is exactly `"algorithmic"`
- `thoughtType` is a valid type: `algorithm_definition`, `algorithm_selection`, `complexity_analysis`, `recurrence_solving`, `correctness_proof`, `data_structure_selection`, `comparison`
- `timeComplexity` uses correct asymptotic notation — O for worst case, Θ for tight/average, Ω for best case
- `designPattern` matches one of: `divide_and_conquer`, `dynamic_programming`, `greedy`, `graph_traversal`, `branch_and_bound`, `backtracking`, `randomized`
- If `clrsCategory` is present, verify the algorithm actually belongs to that CLRS chapter
- If a recurrence is solved via Master Theorem, state a, b, f(n), and which case applies
- `uncertainty` is in [0, 1]; lower for well-established algorithms, higher for approximate or domain-specific reasoning
- `keyInsight` is the single most important observation — not a summary of all steps

### Worked Example

Input: "Given N=1M items and we need to find the top-K most recent, which algorithm and data structure?"

Analysis:

Problem: streaming N items, extract top-K by recency (timestamp). N=1,000,000, K is typically small (K << N).

Pattern recognition: this is an order-statistic / priority queue problem. We do not need to sort all N items — we need the K largest timestamps. Classic application: maintain a min-heap of size K. For each incoming item, if its timestamp exceeds the heap minimum, replace the minimum. After all N items, the heap contains the top-K.

Time complexity: O(N log K). Naive full sort would be O(N log N) — for K=100 and N=1M, log K ≈ 7 vs. log N ≈ 20, roughly 3× faster in asymptotic terms.

Space complexity: O(K) auxiliary — we only store K items at any time, not all N.

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
    "description": "Maintain a min-heap of exactly K elements. For each of N items, push if heap size < K; otherwise push and pop if new item beats heap minimum. Final heap contains top-K.",
    "category": "Order Statistics",
    "designPattern": "greedy",
    "input": {
      "description": "Stream of N items, each with a timestamp",
      "constraints": ["N = 1,000,000", "K << N", "Items arrive in arbitrary order"],
      "dataStructure": "Array (stream)"
    },
    "output": {
      "description": "K items with the largest timestamps",
      "properties": ["Exactly K items returned", "Items are globally top-K by timestamp"]
    }
  },
  "dataStructure": {
    "name": "Binary Min-Heap",
    "description": "Fixed-capacity heap of size K tracking the K largest timestamps seen so far",
    "operations": [
      { "name": "peek-min", "complexity": "O(1)", "description": "Inspect smallest timestamp in current top-K" },
      { "name": "push", "complexity": "O(log K)", "description": "Insert new item and sift up" },
      { "name": "pop-min", "complexity": "O(log K)", "description": "Remove smallest item and sift down" }
    ]
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
        "reason": "Sorts all N items; correct but wasteful — sorts elements that will never appear in the output"
      },
      {
        "name": "Quickselect (randomized)",
        "timeComplexity": "O(N) expected, O(N²) worst",
        "spaceComplexity": "O(log N) stack",
        "reason": "Finds the K-th largest in expected O(N) time, but does not return sorted top-K and has poor worst-case without median-of-medians"
      },
      {
        "name": "Max-Heap over all N items",
        "timeComplexity": "O(N + K log N)",
        "spaceComplexity": "O(N)",
        "reason": "Heapify in O(N), extract-max K times. Better when K is large (K > N/log N), but uses O(N) space"
      }
    ],
    "winner": "top_k_heap",
    "justification": "For K << N (K=100, N=1M), the min-heap approach runs in O(N log 100) ≈ O(7N) vs. O(N log N) ≈ O(20N) for full sort. It also uses O(K)=O(100) space vs. O(N) for full sort — critical if items are large objects. Quickselect would need modification to return all K items in sorted order."
  },
  "dependencies": [],
  "assumptions": ["K is known in advance", "Timestamps are comparable with < operator", "Items fit in memory one at a time (streaming acceptable)"],
  "uncertainty": 0.05,
  "keyInsight": "A min-heap lets you evict the smallest of your current top-K candidates in O(log K) per item — you never need to see the full dataset at once, and you never sort more elements than necessary."
}
```

Natural-language summary: "Use a min-heap of size K. Scan all N items once: for each item, if the heap is not full, push it; otherwise push-and-pop only if the new item beats the current minimum. This is O(N log K) time and O(K) space — asymptotically and practically better than sorting when K is small. For N=1M, K=100: roughly 7 million heap operations vs. 20 million comparisons for merge sort. If K approaches N/2, switch to max-heapify over all N in O(N) and extract K times."
