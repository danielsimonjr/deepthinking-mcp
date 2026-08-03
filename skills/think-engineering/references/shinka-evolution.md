# Evolutionary Optimization via ShinkaEvolve

Optional workflow for using LLM-driven evolutionary search to discover
optimized algorithm variants. This is a **semi-autonomous** workflow that
scaffolds and runs automatically, pausing between batches for user feedback.

## Prerequisites

- **ShinkaEvolve must be installed and working:** `pip install shinka-evolve`
- The `shinka-convert`, `shinka-run`, and `shinka-inspect` CLI tools must be
  on the user's PATH. Verify with `shinka-run --help` before starting.
- If any of the above fails, **do not scaffold the task directory**. Tell
  the user what's missing and offer a manual optimization review instead.

Shinka is a **third-party tool** with no guarantee of stability across
versions. The CLI surface and scoring APIs below reflect the version known
to work at the time of writing; check the current Shinka docs if anything
fails unexpectedly.

## When to Trigger

- "optimize this function" / "make this faster" / "improve this code"
- "find a better algorithm for this"
- After implementing an algorithm, user asks "can we do better?"
- Performance profiling reveals a bottleneck in algorithmic code

Do NOT trigger for: simple bug fixes, style/formatting, or when the user
explicitly wants a manual rewrite.

## Workflow

### Step 1 — Analyze

Read the code and classify the algorithmic core:
- What does it do? (sorting, searching, graph traversal, numeric
  computation, etc.)
- What is the current complexity? (time and space)
- Where is the hot path? (the inner loop or recursive core that dominates
  runtime)
- What are the correctness invariants? (what must remain true for any
  optimized version)

### Step 2 — Scaffold

Auto-generate a Shinka task directory using the `shinka-convert` pattern.
Create a sidecar directory (default: `./shinka_task/`):

```
shinka_task/
  initial.py      # Current implementation with EVOLVE-BLOCK markers on the hot path
  evaluate.py     # Benchmarks + correctness checks
  run_evo.py      # (optional) Launcher
  shinka.yaml     # (optional) Config
```

**Scaffolding rules:**
- Keep `EVOLVE-BLOCK` markers tight around only the algorithmic core
- Preserve the function signature and I/O contract exactly
- `evaluate.py` must test correctness AND performance:

```python
def aggregate_fn(results):
    scores, texts = zip(*results)
    # Correctness gate: if any run fails, score is 0
    if not all(s > 0 for s in scores):
        return {"combined_score": 0.0, ...}
    # Score = weighted: 70% speed, 30% correctness coverage
    return {"combined_score": float(np.mean(scores)), ...}
```

- Generate diverse test inputs that stress different cases:
  - Best case, worst case, average case for the algorithm class
  - Edge cases: empty input, single element, duplicates, large n
  - Domain-specific stress tests based on the algorithm type

### Step 3 — Evolve

Run `shinka-run` with these defaults:
- First batch: `--num_generations 20 --set db.num_islands=3`
- `task_sys_msg`: include the algorithm class, current complexity, and
  what to optimize for

Example `task_sys_msg`:

> Optimize this sorting function. Current: O(n²) insertion sort. Target:
> better average-case performance. Preserve correctness on all input
> types. Consider hybrid approaches, better data structures, and
> cache-friendly access patterns.

### Step 4 — Inspect

After each batch, use `shinka-inspect` to review top performers:
- Present the top 3 variants with before/after benchmarks
- Analyze what changed: did it find a better algorithm? A constant-factor
  optimization? A hybrid approach?
- Ask the user: "Continue evolving, or adopt one of these?"

### Step 5 — Deliver

When the user selects a winner:
- Replace the original code with the optimized version
- Document what changed and why (as a code comment)
- Report: original complexity vs new complexity, benchmark improvement

## Scoring Guidelines by Algorithm Class

| Class | Correctness Tests | Performance Metric |
|---|---|---|
| Sorting | Output matches `sorted()` for all inputs | Wall-clock on n=10K, 100K, 1M |
| Searching | Finds correct element/index | Queries per second |
| Graph | Correct shortest path / MST weight | Time on sparse + dense graphs |
| DP | Optimal value matches brute-force on small n | Time on large n |
| String matching | All occurrences found, no false positives | Throughput (MB/s) |
| Numeric | Result within epsilon of reference | FLOPS or wall-clock |

## Island Strategy for Exploration

Use multiple islands with different evolutionary pressures to explore
diverse optimization directions:

- **Island 1:** Pure speed optimization — minimize wall-clock time
- **Island 2:** Algorithmic novelty — encourage different data structures
  and approaches
- **Island 3:** Robustness — weight worst-case performance heavily

This naturally produces diverse candidates rather than converging on a
single local optimum.
