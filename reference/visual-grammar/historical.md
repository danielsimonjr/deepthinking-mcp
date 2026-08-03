# Visual Grammar: Historical

How to render a `historical` thought as a diagram.

## Node Structure

- **Historical episodes** → Boxed subgraphs (clusters in DOT, `subgraph` in Mermaid) spanning left-to-right timeline; label with date and event name
- **Source nodes** → Rectangles below each episode with reliability shown as border thickness (thicker = higher reliability) or a `reliability: 0.XX` label
- **Pattern nodes** → Oval/diamond shapes connecting similar episodes across time
- **Precedent nodes** → Hexagons with `verdictApplies: true/false` label

## Edge Semantics

- **Precedent match** → Green solid arrow labeled "precedent: <feature>" connecting past to present
- **Divergence** → Red dashed arrow labeled "diverges on: <load-bearing difference>"
- **Source corroboration** → Thin solid arrow between sources with "corroborates" label
- **Source contradiction** → Bold red dashed arrow with "contradicts" label
- **Pattern evidence** → Arrow from episode to pattern with "episode <N>" label

## Mermaid Template

```mermaid
graph LR
  subgraph ep1["2024-03-15: DB Migration Failure"]
    E1["Production schema<br/>migration<br/>500 GB table"]
    S1["Postmortem<br/>Reliability: 0.92"]
    S2["Runbook v3<br/>Reliability: 0.85"]
  end
  
  subgraph ep2["2026-04-18: Planned Migration"]
    E2["12 GB table<br/>maintenance window<br/>replica promotion"]
    S3["Migration plan<br/>Reliability: 0.80"]
  end
  
  PAT["Pattern:<br/>Live migration<br/>without lock timeout<br/>causes contention"]
  
  S1 -->|corroborates| S2
  E1 -.->|matches features| PAT
  E2 -.->|diverges on:<br/>maintenance window| PAT
  
  style ep1 fill:#ffe8e8,stroke:#cc0000
  style ep2 fill:#e8f8e8,stroke:#00cc00
  style S1 fill:#fff5f5,stroke:#cc0000,stroke-width:3px
  style S2 fill:#fff5f5,stroke:#cc0000,stroke-width:2px
  style S3 fill:#fff5f5,stroke:#cc0000,stroke-width:1px
  style PAT fill:#fff8e8,stroke:#ff9900
```

## DOT Template

```dot
digraph HistoricalAnalysis {
  rankdir=LR;
  node [shape=box, style="filled", fontname="Arial"];

  subgraph cluster_2024 {
    label="2024-03-15: DB Migration Failure";
    color=red;
    E1 [label="Live migration\n500GB users table\nNo lock timeout", fillcolor="#ffe8e8"];
    S1 [label="Postmortem\nReliability: 0.92", fillcolor="#fff5f5", penwidth=3];
    S2 [label="Runbook v3\nReliability: 0.85", fillcolor="#fff5f5", penwidth=2];
  }

  subgraph cluster_2026 {
    label="2026-04-18: Planned Migration";
    color=green;
    E2 [label="12GB orders table\nMaintenance window\nReplica promotion", fillcolor="#e8f8e8"];
    S3 [label="Migration plan v2\nReliability: 0.80", fillcolor="#fff5f5", penwidth=1];
  }

  PAT [label="Pattern: Live ALTER without\nlock timeout = contention", shape=diamond, fillcolor="#fff8e8", color="#ff9900"];
  VERDICT [label="Verdict:\nDoes precedent apply?\nNO — load-bearing\ndifferences exist", shape=hexagon, fillcolor="#fffacd"];

  S1 -> S2 [label="corroborates"];
  E1 -> PAT [label="episode 1", style=dashed];
  E2 -> PAT [label="episode 2", style=dashed];
  PAT -> VERDICT [label="matches features:\n[schema ALTER]\n[production table]"];
}
```

## Worked Example

Input: "Is our planned production database migration similar to the failed 2024 incident?" (from historical.md)

**Mermaid:**
```mermaid
graph LR
  subgraph ep2024["2024-03-15: Production DB Migration Failure"]
    E1["Schema migration<br/>500 GB users table<br/>Live write traffic<br/>NO lock timeout"]
    EFFECT1["Result:<br/>Table lock contention<br/>47 min downtime"]
    S1["📄 Postmortem<br/>Reliability: 0.92<br/>Primary source"]
    S2["📋 Runbook v3<br/>Reliability: 0.85<br/>Secondary source"]
  end
  
  subgraph ep2026["2026-04-18: Planned DB Migration"]
    E2["12 GB orders table<br/>Maintenance window<br/>NO live writes<br/>Replica promotion"]
    S3["📋 Migration plan v2<br/>Reliability: 0.80<br/>Primary but uncorroborated"]
  end
  
  PATTERN["Pattern: Live ALTER<br/>without lock timeout<br/>causes contention<br/>type: structural"]
  
  VERDICT["Verdict: Precedent applies?<br/>❌ NO<br/>Load-bearing differences:<br/>✓ Maintenance window (no live writes)<br/>✓ 40x smaller table<br/>✓ Replica promotion<br/>Aggregate reliability: 0.85"]
  
  E1 --> EFFECT1
  S1 -->|corroborates| S2
  E1 -.->|matching features| PATTERN
  E2 -.->|diverges on| PATTERN
  PATTERN --> VERDICT
  
  style ep2024 fill:#ffe8e8,stroke:#cc0000,stroke-width:2px
  style ep2026 fill:#e8f8e8,stroke:#00cc00,stroke-width:2px
  style S1 fill:#fff0f0,stroke:#cc0000,stroke-width:3px
  style S2 fill:#fff5f5,stroke:#cc0000,stroke-width:2px
  style S3 fill:#fff5f5,stroke:#cc0000,stroke-width:1px
  style PATTERN fill:#fff8e8,stroke:#ff9900,stroke-width:2px
  style VERDICT fill:#fffacd,stroke:#ff9900,stroke-width:2px
```

**DOT:**
```dot
digraph PrecedentAnalysis {
  rankdir=LR;
  node [shape=box, style="filled", fontname="Arial"];

  subgraph cluster_2024 {
    label="2024-03-15: Failure";
    color="#cc0000";
    style=filled;
    fillcolor="#ffe8e8:white";

    E1 [label="Schema ALTER\n500 GB table\nLive writes\nNo lock timeout", fillcolor="#ffcccc"];
    EFFECT1 [label="Lock contention\n47 min downtime", fillcolor="#ff9999"];
    S1 [label="Postmortem\nReliability: 0.92", fillcolor="#fff5f5", penwidth=3];
    S2 [label="Runbook v3\nReliability: 0.85", fillcolor="#fff5f5", penwidth=2];

    E1 -> EFFECT1;
  }

  subgraph cluster_2026 {
    label="2026-04-18: Planned";
    color="#00cc00";
    style=filled;
    fillcolor="#e8f8e8:white";

    E2 [label="Schema ALTER\n12 GB table\nMaintenance window\nReplica promotion", fillcolor="#ccffcc"];
    S3 [label="Migration plan v2\nReliability: 0.80", fillcolor="#fff5f5", penwidth=1];
  }

  PAT [label="Structural Pattern:\nLive ALTER without lock_timeout\n= table lock contention", 
       shape=diamond, fillcolor="#fff8e8", color="#ff9900", penwidth=2];

  VERDICT [label="Precedent Verdict:\nDoes pattern apply to 2026?\n\nNO — Load-bearing differences:\n• Maintenance window (no live writes)\n• 40x smaller (12 GB vs 500 GB)\n• Replica promotion eliminates writes\n\nAggregate Reliability: 0.85",
           shape=hexagon, fillcolor="#fffacd", color="#ff9900", penwidth=2];

  S1 -> S2 [label="corroborates"];
  E1 -> PAT [label="episode 1", style=dashed, color="#ff9900"];
  E2 -> PAT [label="episode 2", style=dashed, color="#ff9900"];
  PAT -> VERDICT [label="matching features:\nschema ALTER\nproduction table"];
}
```

## Special Cases

- **Multiple precedents** → Show multiple episode subgraphs left-to-right on timeline; draw pattern arrows connecting matching episodes
- **Source contradiction** → Draw thick red dashed arrow between source nodes with "contradicts" label; add conflict note in VERDICT
- **Historiographical debate** → Add an annotation node below the verdict with `historiographicalSchool: "<school>"` label showing contested interpretations
- **Causal chain** → Chain events within an episode with arrows labeled `cause -> effect` with `mechanism: <description>` and `confidence: <score>` labels
