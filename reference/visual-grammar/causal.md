# Visual Grammar: Causal

How to render a `causal` thought as a diagram.

## Node Structure

Causal thoughts model cause-effect relationships in a directed acyclic graph (DAG). Node types:
- **Variable nodes** (rectangles): Causes, effects, mediators — labeled with the variable name
- **Confounder nodes** (diamonds): Common causes that create spurious correlation
- **Mechanism labels** (edge annotations): Describe *how* the cause produces the effect (mechanism type: direct, indirect, feedback)
- **Intervention nodes** (boxed with ✂ or red X): Mark intervention points where a cause is manually cut or altered

Node colors:
- **Blue**: Root cause (no incoming edges)
- **Green**: Mediator (intermediate)
- **Red**: Effect (terminal node, final outcome)
- **Orange**: Confounder (creates spurious correlation)
- **Gray**: Intervention point (cut edge)

## Edge Semantics

- **Solid arrow** (`→`) — Direct causal relationship; edge label shows `strength` (±0.1 to ±1.0) and `confidence` (0-1)
- **Dashed arrow** (`⇢`) — Indirect mechanism; passes through mediators
- **Bidirectional arrow with ⊗** (`↔`) — Confounder: arrow points to both affected variables
- **Red X or ✂** on edge — Intervention: causal path is cut or altered by external action
- **Feedback loop** (circular arrow) — If applicable, mark with `feedback` label and dotted style

## Mermaid Template

```mermaid
graph TD
    Cause["Cache Eviction<br/>(LRU→LFU)"]
    HitRate["Hit Rate<br/>(%)"]
    DBQueries["DB Queries<br/>(per sec)"]
    Memory["Memory Limit<br/>(confounder)"]
    Latency["p99 Latency<br/>(ms)"]
    
    Cause -->|strength: -0.6<br/>confidence: 0.85| HitRate
    HitRate -->|strength: -0.9<br/>confidence: 0.95| DBQueries
    DBQueries -->|strength: 0.8<br/>confidence: 0.9| Latency
    Memory -->|strength: -0.5<br/>confidence: 0.8| HitRate
    Memory -->|strength: 0.4<br/>confidence: 0.7| Latency
    
    style Cause fill:#3b82f6,stroke:#1e40af,color:#fff
    style HitRate fill:#10b981,stroke:#047857,color:#fff
    style DBQueries fill:#10b981,stroke:#047857,color:#fff
    style Memory fill:#f97316,stroke:#c2410c,color:#fff
    style Latency fill:#ef4444,stroke:#b91c1c,color:#fff
```

## DOT Template

```dot
digraph Causal {
    rankdir=TB;
    node [shape=box, style="filled"];
    
    Cause [label="Cache Eviction\n(LRU→LFU)", fillcolor="#3b82f6", fontcolor="white"];
    HitRate [label="Hit Rate\n(%)", fillcolor="#10b981", fontcolor="white"];
    DBQueries [label="DB Queries\n(per sec)", fillcolor="#10b981", fontcolor="white"];
    Memory [shape=diamond, label="Memory Limit\n(confounder)", fillcolor="#f97316", fontcolor="white"];
    Latency [label="p99 Latency\n(ms)", fillcolor="#ef4444", fontcolor="white"];
    
    Cause -> HitRate [label="strength: -0.6\nconfidence: 0.85", color="#1e40af", penwidth=2];
    HitRate -> DBQueries [label="strength: -0.9\nconfidence: 0.95", color="#047857", penwidth=2];
    DBQueries -> Latency [label="strength: 0.8\nconfidence: 0.9", color="#b91c1c", penwidth=2];
    Memory -> HitRate [label="strength: -0.5\nconfidence: 0.8", color="#c2410c", penwidth=2, style=dotted];
    Memory -> Latency [label="strength: 0.4\nconfidence: 0.7", color="#c2410c", penwidth=2, style=dotted];
}
```

## Worked Example

Based on the cache eviction scenario from `reference/output-formats/causal.md`:

### Mermaid

```mermaid
graph TD
    Eviction["Eviction Policy<br/>(LRU→LFU)"]
    HitRate["Cache Hit Rate<br/>(%)<br/>mediator"]
    DBQueries["DB Query Count<br/>(per sec)<br/>mediator"]
    MemLimit["Server Memory<br/>(confounder)<br/>16→12 GB"]
    Latency["p99 Latency<br/>(ms)<br/>effect"]
    
    Eviction -->|−0.6| HitRate
    MemLimit -->|−0.5| HitRate
    HitRate -->|−0.9| DBQueries
    DBQueries -->|+0.8| Latency
    MemLimit -->|+0.4| Latency
    
    style Eviction fill:#3b82f6,stroke:#1e40af,color:#fff
    style HitRate fill:#10b981,stroke:#047857,color:#fff
    style DBQueries fill:#10b981,stroke:#047857,color:#fff
    style MemLimit fill:#f97316,stroke:#c2410c,color:#fff
    style Latency fill:#ef4444,stroke:#b91c1c,color:#fff
```

### DOT

```dot
digraph CausalEviction {
    rankdir=TB;
    node [shape=box, style="filled"];
    
    Eviction [label="Eviction Policy\n(LRU→LFU)", fillcolor="#3b82f6", fontcolor="white"];
    HitRate [label="Cache Hit Rate\n(%)\nmediator", fillcolor="#10b981", fontcolor="white"];
    DBQueries [label="DB Query Count\n(per sec)\nmediator", fillcolor="#10b981", fontcolor="white"];
    MemLimit [shape=diamond, label="Server Memory\n(confounder)\n16→12 GB", fillcolor="#f97316", fontcolor="white"];
    Latency [label="p99 Latency\n(ms)\neffect", fillcolor="#ef4444", fontcolor="white"];
    
    Eviction -> HitRate [label="−0.6", color="#1e40af", penwidth=2];
    MemLimit -> HitRate [label="−0.5", color="#c2410c", penwidth=2, style=dotted];
    HitRate -> DBQueries [label="−0.9", color="#047857", penwidth=2];
    DBQueries -> Latency [label="+0.8", color="#b91c1c", penwidth=2];
    MemLimit -> Latency [label="+0.4", color="#c2410c", penwidth=2, style=dotted];
}
```

## Special Cases

- **Confounders**: Draw as diamond nodes with dotted edges pointing to both the affected cause and effect, labeled with the confounder's description.
- **Interventions**: Mark the intervened node with a ✂ symbol or red X. Optionally draw a red dashed line through the cut edge.
- **Feedback loops**: If a causal cycle exists (rare in formal models), use a circular dashed arrow labeled "feedback" to indicate the loop.
- **Strength sign convention**: Positive strength means the cause increases the effect; negative strength means the cause decreases the effect. Always show the sign and magnitude (e.g., "+0.8", "−0.6").
- **Mechanisms**: Each edge *must* have a mechanism label explaining *how* the cause produces the effect; a blank mechanism indicates an unjustified causal claim.
