# Visual Grammar: Shannon

How to render a `shannon` thought as a diagram.

## Node Structure

Shannon's 5-stage reasoning follows a systematic progression of uncertainty reduction. Each stage is rendered as a **rounded rectangle** with:
- **Stage label**: Abbreviated stage name (e.g., "PD", "C", "M", "P", "I") in bold in the top-left
- **Content excerpt**: First 50 characters of the thought content
- **Uncertainty value**: Displayed inside or on the right edge (e.g., "Unc: 0.75")
- **Assumptions**: Rendered as smaller leaf nodes hanging below the stage

Related concepts:
- **Assumptions** → Rendered as small `[...]` rectangles hanging below each stage
- **Stage progression** → Solid downward arrows connecting stages sequentially
- **Uncertainty decay** → Arrow labels or node border color intensity should reflect decreasing uncertainty

## Edge Semantics

- **Solid arrow** (`→`) — Stage dependency: stage N+1 depends on stage N's output; labeled with `"→ reduces uncertainty from X to Y"` showing the decrease
- **Thin gray edge** — Assumption reference: from stage to each of its assumption nodes
- **Bold edge** — High-confidence dependency: when `confidenceFactors.methodologyRobustness > 0.8`

## Mermaid Template

```mermaid
graph TD
    PD["<b>PD</b><br/>Problem Definition<br/>Uncertainty: 0.75"]
    C["<b>C</b><br/>Constraints<br/>Uncertainty: 0.55"]
    M["<b>M</b><br/>Model<br/>Uncertainty: 0.35"]
    P["<b>P</b><br/>Proof<br/>Uncertainty: 0.15"]
    I["<b>I</b><br/>Implementation<br/>Uncertainty: 0.30"]
    
    A1["[Assumption 1]"]
    A2["[Assumption 2]"]
    A3["[Assumption 3]"]
    
    PD -->|reduces: 0.75→0.55| C
    C -->|reduces: 0.55→0.35| M
    M -->|reduces: 0.35→0.15| P
    P -->|increases: 0.15→0.30| I
    
    PD -.-> A1
    C -.-> A2
    M -.-> A3
    
    style PD fill:#3b82f6,stroke:#1e40af,color:#fff
    style C fill:#3b82f6,stroke:#1e40af,color:#fff
    style M fill:#3b82f6,stroke:#1e40af,color:#fff
    style P fill:#3b82f6,stroke:#1e40af,color:#fff
    style I fill:#a855f7,stroke:#7c3aed,color:#fff
    style A1 fill:#e5e7eb,stroke:#6b7280,color:#000
    style A2 fill:#e5e7eb,stroke:#6b7280,color:#000
    style A3 fill:#e5e7eb,stroke:#6b7280,color:#000
```

## DOT Template

```dot
digraph Shannon {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];
    
    PD [label="PD\nProblem Definition\nUncertainty: 0.75", 
        fillcolor="#3b82f6", fontcolor="white"];
    C [label="C\nConstraints\nUncertainty: 0.55", 
       fillcolor="#3b82f6", fontcolor="white"];
    M [label="M\nModel\nUncertainty: 0.35", 
       fillcolor="#3b82f6", fontcolor="white"];
    P [label="P\nProof\nUncertainty: 0.15", 
       fillcolor="#3b82f6", fontcolor="white"];
    I [label="I\nImplementation\nUncertainty: 0.30", 
       fillcolor="#a855f7", fontcolor="white"];
    
    A1 [label="[Assumption 1]", fillcolor="#e5e7eb", fontcolor="black"];
    A2 [label="[Assumption 2]", fillcolor="#e5e7eb", fontcolor="black"];
    A3 [label="[Assumption 3]", fillcolor="#e5e7eb", fontcolor="black"];
    
    PD -> C [label="reduces: 0.75→0.55", color="#3b82f6", penwidth=2];
    C -> M [label="reduces: 0.55→0.35", color="#3b82f6", penwidth=2];
    M -> P [label="reduces: 0.35→0.15", color="#3b82f6", penwidth=2];
    P -> I [label="increases: 0.15→0.30", color="#a855f7", penwidth=2];
    
    PD -> A1 [style=dotted, color="#6b7280"];
    C -> A2 [style=dotted, color="#6b7280"];
    M -> A3 [style=dotted, color="#6b7280"];
}
```

## Worked Example

Based on the p99 latency decomposition from `reference/output-formats/shannon.md`:

### Mermaid

```mermaid
graph TD
    PD["<b>PD</b><br/>Problem: p99 latency<br/>reduction\nUnc: 0.75"]
    C["<b>C</b><br/>Constraints:<br/>p99 < 200ms, recall ≥ 0.95\nUnc: 0.55"]
    M["<b>M</b><br/>Model: three-stage<br/>decomposition (parse,<br/>lookup, serialize)\nUnc: 0.35"]
    P["<b>P</b><br/>Proof: validate<br/>independence of stages\nUnc: 0.15"]
    I["<b>I</b><br/>Implementation:<br/>optimize index caching\nUnc: 0.30"]
    
    A1["[p99 measured at LB]"]
    A2["[stages are independent]"]
    A3["[tracing covers all 3]"]
    A4["[sprint = 2 weeks]"]
    A5["[no schema migration]"]
    
    PD -->|reduces: 0.75→0.55| C
    C -->|reduces: 0.55→0.35| M
    M -->|reduces: 0.35→0.15| P
    P -->|increases: 0.15→0.30| I
    
    PD -.-> A1
    PD -.-> A2
    PD -.-> A3
    C -.-> A4
    C -.-> A5
    
    style PD fill:#3b82f6,stroke:#1e40af,color:#fff
    style C fill:#3b82f6,stroke:#1e40af,color:#fff
    style M fill:#3b82f6,stroke:#1e40af,color:#fff
    style P fill:#3b82f6,stroke:#1e40af,color:#fff
    style I fill:#a855f7,stroke:#7c3aed,color:#fff
    style A1 fill:#e5e7eb,stroke:#6b7280,color:#000
    style A2 fill:#e5e7eb,stroke:#6b7280,color:#000
    style A3 fill:#e5e7eb,stroke:#6b7280,color:#000
    style A4 fill:#e5e7eb,stroke:#6b7280,color:#000
    style A5 fill:#e5e7eb,stroke:#6b7280,color:#000
```

### DOT

```dot
digraph ShannonLatency {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];
    
    PD [label="PD\nProblem: p99 latency\nreduction\nUncertainty: 0.75", 
        fillcolor="#3b82f6", fontcolor="white"];
    C [label="C\nConstraints:\np99 < 200ms, recall ≥ 0.95\nUncertainty: 0.55", 
       fillcolor="#3b82f6", fontcolor="white"];
    M [label="M\nModel: three-stage\ndecomposition (parse,\nlookup, serialize)\nUncertainty: 0.35", 
       fillcolor="#3b82f6", fontcolor="white"];
    P [label="P\nProof: validate\nindependence of stages\nUncertainty: 0.15", 
       fillcolor="#3b82f6", fontcolor="white"];
    I [label="I\nImplementation:\noptimize index caching\nUncertainty: 0.30", 
       fillcolor="#a855f7", fontcolor="white"];
    
    A1 [label="[p99 measured at LB]", fillcolor="#e5e7eb", fontcolor="black"];
    A2 [label="[stages are independent]", fillcolor="#e5e7eb", fontcolor="black"];
    A3 [label="[tracing covers all 3]", fillcolor="#e5e7eb", fontcolor="black"];
    A4 [label="[sprint = 2 weeks]", fillcolor="#e5e7eb", fontcolor="black"];
    A5 [label="[no schema migration]", fillcolor="#e5e7eb", fontcolor="black"];
    
    PD -> C [label="reduces\n0.75→0.55", color="#3b82f6", penwidth=2];
    C -> M [label="reduces\n0.55→0.35", color="#3b82f6", penwidth=2];
    M -> P [label="reduces\n0.35→0.15", color="#3b82f6", penwidth=2];
    P -> I [label="increases\n0.15→0.30", color="#a855f7", penwidth=2];
    
    PD -> A1 [style=dotted, color="#6b7280"];
    PD -> A2 [style=dotted, color="#6b7280"];
    PD -> A3 [style=dotted, color="#6b7280"];
    C -> A4 [style=dotted, color="#6b7280"];
    C -> A5 [style=dotted, color="#6b7280"];
}
```

## Special Cases

- **Uncertainty increases**: In the `implementation` stage, uncertainty may increase from the `proof` stage (due to practical deployment unknowns). Show this with an upward-pointing arrow and clearly label the increase.
- **Alternative approaches**: If `alternativeApproaches` is non-empty, render them as dashed branches off the stage that considered them, to show roads not taken.
- **Rechecks**: If `recheckStep` is populated, add a backward dashed arrow from the current stage to the stage being rechecked, labeled with the recheck reason.
- **Confidence factors**: Optionally display `confidenceFactors` as a small badge or sidebar (e.g., "Data: 0.7 | Method: 0.8 | Assume: 0.65") to show degree of confidence per stage.

