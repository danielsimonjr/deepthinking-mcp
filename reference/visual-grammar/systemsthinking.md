# Visual Grammar: Systems Thinking

How to render a `systemsthinking` thought as a diagram.

## Node Structure

Systems thinking diagrams model feedback loops and causal relationships:
- **Stock** (rectangle with vertical lines on sides, like a tank): accumulating quantity (e.g., alert fatigue level)
- **Flow** (arrow with a valve gate `|>` or bold label): rate of change in a stock
- **Reinforcing loop** (curved arrow, labeled `(R)` or `R1`, `R2`): positive feedback that amplifies change
- **Balancing loop** (curved arrow, labeled `(B)` or `B1`): negative feedback that stabilizes or dampens
- **Leverage point** (yellow star or callout box): intervention point where small changes have large effects

## Edge Semantics

- **Solid arrow** (`→`) — Causal relationship: variable A influences variable B
- **Curved loop arrow** (↪ with label `(R)`) — Reinforcing loop: amplifies deviation from equilibrium
- **Curved loop arrow** (↪ with label `(B)`) — Balancing loop: acts to restore equilibrium
- **Bold arrow** (`⟹`) — High-impact flow: represents the main causal pathway in a feedback loop

## Mermaid Template

```mermaid
graph TB
    S1["Stock: Alert Queue<br/>(alerts accumulating)"]
    F1["Flow: Alert<br/>Generation<br/>(|> incoming)"]
    S2["Stock: Engineer<br/>Fatigue<br/>(attention span)"]
    F2["Flow: Response<br/>Time<br/>(|> outgoing)"]
    S3["Stock: Unresolved<br/>Alerts<br/>(backlog)"]
    L1["Leverage:<br/>Alert Tuning<br/>(reduce noise)"]
    
    F1 --> S1
    S1 --> S2
    S2 --> F2
    F2 --> S3
    S3 -.->|R1: More alerts<br/>more fatigue| S2
    S1 -.->|B1: Reduce queue<br/>reduce fatigue| S2
    L1 -.->|Target| S1
    
    style S1 fill:#e6f2ff,stroke:#0066cc,color:#000
    style S2 fill:#e6f2ff,stroke:#0066cc,color:#000
    style S3 fill:#e6f2ff,stroke:#0066cc,color:#000
    style F1 fill:#ffcccc,stroke:#ff0000,color:#000
    style F2 fill:#ffcccc,stroke:#ff0000,color:#000
    style L1 fill:#ffff99,stroke:#ffcc00,color:#000
```

## DOT Template

```dot
digraph SystemsThinking {
    rankdir=TB;
    node [style="filled"];
    
    S1 [label="Stock:\nAlert Queue\n(accumulating)", shape=box, fillcolor="#e6f2ff", fontcolor="#000"];
    F1 [label="Flow: Alert\nGeneration\n(incoming)", shape=ellipse, fillcolor="#ffcccc", fontcolor="#000"];
    S2 [label="Stock:\nEngineer Fatigue\n(attention)", shape=box, fillcolor="#e6f2ff", fontcolor="#000"];
    F2 [label="Flow: Response\nTime\n(outgoing)", shape=ellipse, fillcolor="#ffcccc", fontcolor="#000"];
    S3 [label="Stock:\nUnresolved Alerts\n(backlog)", shape=box, fillcolor="#e6f2ff", fontcolor="#000"];
    L1 [label="Leverage:\nAlert Tuning\n(reduce noise)", shape=star, fillcolor="#ffff99", fontcolor="#000"];
    
    F1 -> S1 [color="#ff0000", penwidth=2];
    S1 -> S2 [color="#0066cc", penwidth=2];
    S2 -> F2 [color="#0066cc", penwidth=2];
    F2 -> S3 [color="#ff0000", penwidth=2];
    S3 -> S2 [label="R1: More alerts\nmore fatigue", style=dashed, color="#00aa00", penwidth=2];
    S1 -> S2 [label="B1: Reduce queue\nreduce fatigue", style=dashed, color="#aa0000", penwidth=2];
    L1 -> S1 [label="Target", style=dashed, color="#ffcc00", penwidth=2];
}
```

## Worked Example

Based on the on-call alert fatigue scenario from `reference/output-formats/systemsthinking.md`:

### Mermaid

```mermaid
graph TB
    Q["Stock: Alert Queue"]
    Gen["Flow: Alert Generation"]
    Fatigue["Stock: Engineer Fatigue"]
    Response["Flow: Response Time"]
    Unresolved["Stock: Unresolved Alerts"]
    Suppress["Leverage: Threshold Tuning"]
    
    Gen --> Q
    Q --> Fatigue
    Fatigue --> Response
    Response --> Unresolved
    Unresolved -.->|R1: Faster exhaustion| Fatigue
    Q -.->|R2: Slower response| Unresolved
    Fatigue -.->|B1: More breaks| Q
    Suppress -.->|Target| Gen
    
    style Q fill:#e6f2ff,stroke:#0066cc
    style Fatigue fill:#e6f2ff,stroke:#0066cc
    style Unresolved fill:#e6f2ff,stroke:#0066cc
    style Gen fill:#ffcccc,stroke:#ff0000
    style Response fill:#ffcccc,stroke:#ff0000
    style Suppress fill:#ffff99,stroke:#ffcc00
```

### DOT

```dot
digraph AlertFatigue {
    rankdir=TB;
    node [style="filled"];
    
    Q [label="Stock:\nAlert Queue", shape=box, fillcolor="#e6f2ff"];
    Gen [label="Flow: Alert\nGeneration", shape=ellipse, fillcolor="#ffcccc"];
    Fatigue [label="Stock:\nEngineer Fatigue", shape=box, fillcolor="#e6f2ff"];
    Response [label="Flow: Response\nTime", shape=ellipse, fillcolor="#ffcccc"];
    Unresolved [label="Stock:\nUnresolved Alerts", shape=box, fillcolor="#e6f2ff"];
    Suppress [label="Leverage:\nThreshold Tuning", shape=star, fillcolor="#ffff99"];
    
    Gen -> Q [color="#ff0000", penwidth=2];
    Q -> Fatigue [color="#0066cc", penwidth=2];
    Fatigue -> Response [color="#0066cc", penwidth=2];
    Response -> Unresolved [color="#ff0000", penwidth=2];
    Unresolved -> Fatigue [label="R1: Faster exhaustion", style=dashed, color="#00aa00", penwidth=2];
    Q -> Unresolved [label="R2: Slower response", style=dashed, color="#00aa00", penwidth=2];
    Fatigue -> Q [label="B1: More breaks", style=dashed, color="#aa0000", penwidth=2];
    Suppress -> Gen [label="Target", style=dashed, color="#ffcc00", penwidth=2];
}
```

## Special Cases

- **Reinforcing loops**: Mark with `(R)` notation and curved arrows in green/teal to show amplification.
- **Balancing loops**: Mark with `(B)` notation and curved arrows in red/orange to show dampening or restoration.
- **Multiple loops**: When the same stock participates in multiple loops, draw all loops separately and label them (e.g., R1, R2, B1) to distinguish them.
- **Time delays**: Annotate edges with a delay indicator (e.g., `[⏱ 2 days]`) if the causal effect takes time to manifest.
- **Archetypes**: If the system exhibits a known archetype (e.g., "Balancing Loop with Delay", "Limits to Growth"), label it at the top or as a callout.
- **Intervention points**: Leverage points should be highlighted as stars or special shapes with a dashed line to the stock or flow they target.

