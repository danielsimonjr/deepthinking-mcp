# Causal Thought — Output Format

Causal reasoning builds an explicit directed acyclic graph (DAG) of cause-effect relationships, identifying mechanisms by which causes produce effects, confounders that create spurious correlations, and the expected downstream impact of interventions.

## JSON Schema

```json
{
  "mode": "causal",
  "causalGraph": {
    "nodes": [
      {
        "id": "<unique identifier>",
        "name": "<human-readable name>",
        "type": "cause | effect | mediator | confounder",
        "description": "<role in the causal model>"
      }
    ],
    "edges": [
      {
        "from": "<node id>",
        "to": "<node id>",
        "strength": <number -1 to 1>,
        "confidence": <number 0-1>,
        "mechanism": "<how the cause produces the effect>"
      }
    ]
  },
  "mechanisms": [
    {
      "from": "<node id>",
      "to": "<node id>",
      "description": "<description of the full causal path>",
      "type": "direct | indirect | feedback"
    }
  ],
  "confounders": [
    {
      "nodeId": "<node id>",
      "affects": ["<node id>", "<node id>"],
      "description": "<how this confounder creates a spurious correlation between the affected nodes>"
    }
  ],
  "interventions": [
    {
      "nodeId": "<node id>",
      "action": "<what action would be taken>",
      "expectedEffects": [
        {
          "nodeId": "<node id>",
          "expectedChange": "<description of predicted change>",
          "confidence": <number 0-1>
        }
      ]
    }
  ],
  "counterfactuals": [
    {
      "description": "<the what-if scenario>",
      "modifiedNodes": [
        { "nodeId": "<node id>", "newValue": "<hypothetical value>" }
      ]
    }
  ]
}
```

## Required Fields

- `mode` — always `"causal"`
- `causalGraph` — object with `nodes` (at least 2) and `edges` (at least 1)
- `causalGraph.nodes[*]` — each node needs `id`, `name`, `type`, `description`
- `causalGraph.edges[*]` — each edge needs `from`, `to`, `strength`, `confidence`
- `mechanisms` — array (may be empty but should document primary causal paths)

## Optional Fields

- `causalGraph.edges[*].mechanism` — strongly recommended; a blank mechanism signals an unjustified causal claim
- `confounders` — required whenever two correlated variables are not in a direct cause-effect relationship
- `interventions` — include when the analysis is being used to plan an action
- `counterfactuals` — include when exploring what would have happened under different values (prefer the full counterfactual mode for detailed what-if analysis)

## Node Types

| Type | Meaning |
|------|---------|
| `cause` | Root driver; no incoming causal arrows from other modeled variables |
| `effect` | Terminal outcome; no outgoing causal arrows |
| `mediator` | Intermediate node on a causal path; receives from one node and transmits to another |
| `confounder` | Common cause of two or more other nodes; creates spurious correlation between them |

## Edge Strength

- Positive (+): Cause increases the effect
- Negative (−): Cause decreases the effect (inhibitory)
- Magnitude: 0 = no effect, 1 = complete determinism
- Example: `"strength": -0.7` = the cause reduces the effect moderately

## Worked Example

Input: "Did the cache eviction policy change cause the p99 latency spike last week?"

```json
{
  "mode": "causal",
  "causalGraph": {
    "nodes": [
      { "id": "eviction", "name": "Cache Eviction Policy", "type": "cause", "description": "Changed from LRU to LFU in deployment v4.2.1" },
      { "id": "hitrate", "name": "Cache Hit Rate", "type": "mediator", "description": "Percentage of requests served from cache" },
      { "id": "dbqueries", "name": "Database Query Count", "type": "mediator", "description": "Number of queries reaching the database per second" },
      { "id": "memlimit", "name": "Server Memory Limit", "type": "confounder", "description": "Reduced from 16 GB to 12 GB in same deployment v4.2.1" },
      { "id": "latency", "name": "p99 Latency", "type": "effect", "description": "99th-percentile response time in ms" }
    ],
    "edges": [
      { "from": "eviction", "to": "hitrate", "strength": -0.6, "confidence": 0.85, "mechanism": "LFU evicts recently-added but infrequent keys; reduces hit rate for bursty workloads compared to LRU" },
      { "from": "hitrate", "to": "dbqueries", "strength": -0.9, "confidence": 0.95, "mechanism": "Each cache miss results in exactly one additional database query" },
      { "from": "dbqueries", "to": "latency", "strength": 0.8, "confidence": 0.9, "mechanism": "Additional DB queries add ~40 ms; connection pool contention amplifies tail latency under load" },
      { "from": "memlimit", "to": "hitrate", "strength": -0.5, "confidence": 0.8, "mechanism": "Smaller memory limit reduces cache capacity, increasing eviction rate regardless of policy" },
      { "from": "memlimit", "to": "latency", "strength": 0.4, "confidence": 0.7, "mechanism": "Reduced memory triggers OS swapping under high load, adding I/O wait to request processing" }
    ]
  },
  "mechanisms": [
    {
      "from": "eviction",
      "to": "latency",
      "description": "Eviction policy change → lower cache hit rate → more DB queries → higher p99 latency",
      "type": "indirect"
    }
  ],
  "confounders": [
    {
      "nodeId": "memlimit",
      "affects": ["hitrate", "latency"],
      "description": "Deployment v4.2.1 changed both eviction policy and memory limits. Without controlling for memory, the eviction policy's causal effect is overstated."
    }
  ]
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"causal"`
- `causalGraph.nodes` has at least 2 entries
- `causalGraph.edges` has at least 1 entry
- Every edge `from` and `to` value matches a valid node `id`
- Every edge has a `mechanism` — blank mechanisms signal unjustified causal claims
- `confounders` is populated when any two correlated variables share a common cause
- Each `strength` is in [−1, 1]; each `confidence` is in [0, 1]
- `mechanisms` documents at least the primary causal path from root cause to observed effect
