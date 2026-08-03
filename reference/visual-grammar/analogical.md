# Visual Grammar: Analogical

How to render an `analogical` thought as a diagram.

## Node Structure

Analogical reasoning diagrams show two domains side-by-side with entity mappings and insights. Structure:
- **Source domain** (left subgraph): Well-understood domain with entities and relations
- **Target domain** (right subgraph): Domain to understand; mirrors source structure
- **Entity nodes** (circles or boxes): One per domain entity, labeled with name and role
- **Mapping arrows** (bidirectional or thick directional): Connect corresponding entities between domains, labeled with confidence and justification
- **Failed mapping indicators** (red X, dashed line with strikethrough): Show entities that do not map cleanly
- **Relation edges** (within domain): Show structural relationships within each domain
- **Insights box** (below): List transferred insights and their novelty scores

Node colors:
- **Blue**: Source domain entities
- **Green**: Target domain entities
- **Gold**: High-confidence mapping
- **Orange**: Medium-confidence mapping
- **Red**: Failed or no mapping

## Edge Semantics

- **Solid arrow** (`→`) — Relation within domain (source or target)
- **Bidirectional thick arrow** (`↔`) — Entity mapping between domains; thickness indicates confidence (0-1)
- **Dashed arrow** (`⇢`) — Weak or partial mapping
- **Red X or crossed-out arrow** (`✗`) — Failed mapping or limitation of analogy

## Mermaid Template

```mermaid
graph LR
    subgraph Source["<b>SOURCE: CPU Cache</b>"]
        S1["Cache Miss<br/>(event)"]
        S2["LRU Eviction<br/>(policy)"]
        S3["Hit Rate<br/>(metric)"]
    end
    
    subgraph Target["<b>TARGET: Redis Cache</b>"]
        T1["Cache Miss<br/>(event)"]
        T2["allkeys-lru<br/>(policy)"]
        T3["Hit Rate<br/>(metric)"]
    end
    
    subgraph Insights["<b>Insights Transferred</b>"]
        I1["Warm-up after restart<br/>↔ Cold-start penalty<br/>Novelty: 0.65"]
        I2["Hit rate dominates<br/>performance<br/>Novelty: 0.40"]
    end
    
    S1 <-->|0.97| T1
    S2 <-->|0.90| T2
    S3 <-->|0.95| T3
    
    S1 -.->|relation| S3
    T1 -.->|relation| T3
    
    Insights -.-> Source
    Insights -.-> Target
    
    style Source fill:#dbeafe,stroke:#1e40af,color:#000
    style Target fill:#dcfce7,stroke:#047857,color:#000
    style S1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style S2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style S3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T1 fill:#10b981,stroke:#047857,color:#fff
    style T2 fill:#10b981,stroke:#047857,color:#fff
    style T3 fill:#10b981,stroke:#047857,color:#fff
    style Insights fill:#fef3c7,stroke:#d97706,color:#000
```

## DOT Template

```dot
digraph Analogical {
    rankdir=LR;
    
    subgraph cluster_source {
        label="SOURCE: CPU Cache";
        labelloc=top;
        style=filled;
        fillcolor="#dbeafe";
        
        node [shape=circle, style="filled"];
        S1 [label="Cache\nMiss", fillcolor="#3b82f6", fontcolor="white"];
        S2 [label="LRU\nEviction", fillcolor="#3b82f6", fontcolor="white"];
        S3 [label="Hit\nRate", fillcolor="#3b82f6", fontcolor="white"];
        
        S1 -> S3 [color="#1e40af", label="impacts"];
        S2 -> S3 [color="#1e40af", label="affects"];
    }
    
    subgraph cluster_target {
        label="TARGET: Redis Cache";
        labelloc=top;
        style=filled;
        fillcolor="#dcfce7";
        
        node [shape=circle, style="filled"];
        T1 [label="Cache\nMiss", fillcolor="#10b981", fontcolor="white"];
        T2 [label="allkeys-lru\nEviction", fillcolor="#10b981", fontcolor="white"];
        T3 [label="Hit\nRate", fillcolor="#10b981", fontcolor="white"];
        
        T1 -> T3 [color="#047857", label="impacts"];
        T2 -> T3 [color="#047857", label="affects"];
    }
    
    subgraph cluster_insights {
        label="Insights & Limitations";
        labelloc=top;
        style=filled;
        fillcolor="#fef3c7";
        
        node [shape=box, style="filled"];
        Insight [label="Warm-up after restart ↔ cold-start\nNovelty: 0.65\n\nHit rate dominates performance\nNovelty: 0.40", fillcolor="#fbbf24", fontcolor="#000"];
        Limits [label="Limitation 1:\nCPU caches are hardware-managed\nRedis is approximate\n\nLimitation 2:\nCPU cache size fixed\nRedis can scale horizontally", fillcolor="#fed7aa", fontcolor="#000"];
    }
    
    S1 -> T1 [label="0.97", penwidth=3, color="#d97706"];
    S2 -> T2 [label="0.90", penwidth=2, color="#d97706"];
    S3 -> T3 [label="0.95", penwidth=3, color="#d97706"];
    
    {rank=same; Insight Limits}
}
```

## Worked Example

Based on CPU cache ↔ Redis analogy from `reference/output-formats/analogical.md`:

### Mermaid

```mermaid
graph LR
    subgraph Source["<b>SOURCE: CPU L1/L2/L3 Cache</b>"]
        direction TB
        SM["Cache Miss<br/>(data not found)"]
        SL["LRU Eviction<br/>(least-recently-used)"]
        SH["Hit Rate<br/>(% served from cache)"]
        SM -.->|determines| SH
        SL -.->|drives| SM
    end
    
    subgraph Target["<b>TARGET: Redis Cache Layer</b>"]
        direction TB
        TM["Cache Miss<br/>(key not in Redis)"]
        TL["allkeys-lru Eviction<br/>(LRU under mem pressure)"]
        TH["Hit Rate<br/>(% without DB hit)"]
        TM -.->|determines| TH
        TL -.->|drives| TM
    end
    
    SM <-->|conf:0.97<br/>both = miss| TM
    SL <-->|conf:0.90<br/>both = LRU| TL
    SH <-->|conf:0.95<br/>primary metric| TH
    
    Insights["<b>Key Insights</b><br/>1. Warm-up is critical (novelty: 0.65)<br/>2. Hit rate dominates perf (novelty: 0.40)"]
    
    Limits["<b>Limitations</b><br/>✗ CPU caches: hardware-managed<br/>Redis: approximate<br/>✗ CPU cache: fixed size<br/>Redis: scales horizontally"]
    
    style Source fill:#dbeafe,stroke:#1e40af,color:#000
    style Target fill:#dcfce7,stroke:#047857,color:#000
    style SM fill:#3b82f6,stroke:#1e40af,color:#fff
    style SL fill:#3b82f6,stroke:#1e40af,color:#fff
    style SH fill:#3b82f6,stroke:#1e40af,color:#fff
    style TM fill:#10b981,stroke:#047857,color:#fff
    style TL fill:#10b981,stroke:#047857,color:#fff
    style TH fill:#10b981,stroke:#047857,color:#fff
    style Insights fill:#fef3c7,stroke:#d97706,color:#000
    style Limits fill:#fee2e2,stroke:#b91c1c,color:#000
```

### DOT

```dot
digraph CPURedisAnalogy {
    rankdir=LR;
    
    subgraph cluster_source {
        label="SOURCE: CPU Cache";
        style=filled;
        fillcolor="#dbeafe";
        
        node [shape=circle, style="filled", fillcolor="#3b82f6", fontcolor="white"];
        SM [label="Cache\nMiss"];
        SL [label="LRU\nEviction"];
        SH [label="Hit\nRate"];
        
        SM -> SH [color="#1e40af", label="determines"];
        SL -> SM [color="#1e40af", label="drives"];
    }
    
    subgraph cluster_target {
        label="TARGET: Redis Cache";
        style=filled;
        fillcolor="#dcfce7";
        
        node [shape=circle, style="filled", fillcolor="#10b981", fontcolor="white"];
        TM [label="Cache\nMiss"];
        TL [label="allkeys-lru\nEviction"];
        TH [label="Hit\nRate"];
        
        TM -> TH [color="#047857", label="determines"];
        TL -> TM [color="#047857", label="drives"];
    }
    
    SM -> TM [penwidth=3, label="0.97 (both=miss)", color="#d97706"];
    SL -> TL [penwidth=2, label="0.90 (both=LRU)", color="#d97706"];
    SH -> TH [penwidth=3, label="0.95 (metric)", color="#d97706"];
    
    subgraph cluster_insights {
        label="Insights & Limitations";
        style=filled;
        fillcolor="#fef3c7";
        
        Insights [shape=box, style="filled", fillcolor="#fbbf24", fontcolor="#000",
                 label="Warm-up critical (novelty: 0.65)\nHit rate dominates (novelty: 0.40)"];
        Limits [shape=box, style="filled", fillcolor="#fee2e2", fontcolor="#000",
               label="Hardware vs. approx\nFixed size vs. scalable"];
    }
}
```

## Special Cases

- **Strength annotation**: Display `analogyStrength` overall (0.88 in the CPU/Redis example) as a subtitle or header; scale background opacity to indicate strength (more opaque = stronger analogy).
- **Failed mappings**: Show unmapped or failed entities with a red "✗" symbol on both sides; optionally draw a dashed red line between them with "No mapping" label.
- **Partial mappings**: For entities that map weakly, use a dashed or thin line and lower confidence value (e.g., "0.55").
- **Multi-domain analogy**: If more than two domains are involved (e.g., CPU cache, Redis, and CDN), arrange them horizontally with pairwise mappings; draw inferences across domains as curved arrows.
- **Limitations section**: Add a separate box or list below the diagram explicitly stating where the analogy breaks down, preventing over-generalization.
- **Novelty scoring**: Annotate insights with their novelty score (0-1); higher scores (0.65+) indicate genuinely non-obvious transfers worth highlighting.
