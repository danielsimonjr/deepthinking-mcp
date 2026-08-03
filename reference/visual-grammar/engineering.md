# Visual Grammar: Engineering

How to render an `engineering` thought as a diagram.

## Node Structure

Engineering decision matrices are rendered as grids or tables with colored cells:
- **Criteria row headers** (left column): evaluation dimensions (cost, latency, reliability, etc.)
- **Alternative columns** (top row): options being compared (Database A, Message Queue B, etc.)
- **Score cells** (grid interior): numerical or categorical scores, shaded by intensity
  - **Green** (dark green to light green): high scores, favorable
  - **Red** (dark red to light red): low scores, unfavorable
  - **Yellow/Orange**: medium scores
- **Winner column** (highlighted with gold/bold border): the selected alternative
- **FMEA failure modes** (separate section as hexagons): high-risk failure scenarios with RPN (Risk Priority Number)

## Edge Semantics

- **Cell shading intensity** — Score magnitude: darker = more extreme (very good or very bad)
- **Border highlight** (gold, thick) — Decision winner: the chosen alternative
- **Hexagon with RPN label** — Failure mode severity: hexagon size can scale with RPN value

## Mermaid Template

```mermaid
graph TB
    subgraph Criteria["Decision Matrix"]
        C1["Cost"]
        C2["Latency"]
        C3["Reliability"]
        C4["Maintenance"]
    end
    
    subgraph AltA["Option A"]
        A1["$150k<br/>(High)"]
        A2["45ms<br/>(Med)"]
        A3["99.9%<br/>(High)"]
        A4["Low"]
    end
    
    subgraph AltB["Option B (Selected)"]
        B1["$80k<br/>(Low)"]
        B2["20ms<br/>(Low)"]
        B3["99.95%<br/>(High)"]
        B4["High"]
    end
    
    FMEA["Failure Mode: Data Loss<br/>RPN: 24<br/>(Sev 4 × Occ 6)"]
    
    style A1 fill:#ffcccc
    style A2 fill:#ffff99
    style A3 fill:#99ff99
    style A4 fill:#99ff99
    
    style B1 fill:#99ff99
    style B2 fill:#99ff99
    style B3 fill:#99ff99
    style B4 fill:#ffff99
    
    style AltB stroke:#ffcc00,stroke-width:4px
    style FMEA fill:#ff9999,stroke:#cc0000
```

## DOT Template

```dot
digraph Engineering {
    rankdir=TB;
    node [shape=box, style="filled"];
    
    C1 [label="Cost", fillcolor="#e6e6e6"];
    C2 [label="Latency", fillcolor="#e6e6e6"];
    C3 [label="Reliability", fillcolor="#e6e6e6"];
    C4 [label="Maintenance", fillcolor="#e6e6e6"];
    
    A1 [label="$150k\n(High)", fillcolor="#ffcccc"];
    A2 [label="45ms\n(Med)", fillcolor="#ffff99"];
    A3 [label="99.9%\n(High)", fillcolor="#99ff99"];
    A4 [label="Low", fillcolor="#99ff99"];
    
    B1 [label="$80k\n(Low)", fillcolor="#99ff99"];
    B2 [label="20ms\n(Low)", fillcolor="#99ff99"];
    B3 [label="99.95%\n(High)", fillcolor="#99ff99"];
    B4 [label="High", fillcolor="#ffff99"];
    
    FMEA [label="Failure: Data Loss\nRPN: 24", shape=hexagon, fillcolor="#ff9999"];
    
    Winner [label="Selected:\nOption B", shape=ellipse, fillcolor="#ffff99", penwidth=3];
    
    C1 -> A1;
    C2 -> A2;
    C3 -> A3;
    C4 -> A4;
    
    C1 -> B1;
    C2 -> B2;
    C3 -> B3;
    C4 -> B4;
    
    B1 -> Winner;
    B2 -> Winner;
    B3 -> Winner;
    B4 -> Winner;
    
    FMEA -> Winner [style=dashed, label="Risk consideration"];
}
```

## Worked Example

Based on the Database vs Message Queue trade study from `reference/output-formats/engineering.md`:

### Mermaid

```mermaid
graph TB
    subgraph Matrix["Decision Matrix"]
        Cost["Cost"]
        Latency["Latency (p99)"]
        Reliability["Reliability"]
        Scaling["Horizontal Scaling"]
    end
    
    subgraph DB["PostgreSQL"]
        D1["$4k/mo"]
        D2["8ms"]
        D3["99.95%"]
        D4["Difficult"]
    end
    
    subgraph MQ["RabbitMQ (Selected)"]
        M1["$2k/mo"]
        M2["12ms"]
        M3["99.9%"]
        M4["Easy"]
    end
    
    FMEA1["Failure: Message Loss<br/>RPN: 15"]
    FMEA2["Failure: Network Partition<br/>RPN: 20"]
    
    Decision["Selected: RabbitMQ<br/>Better cost + scaling"]
    
    style D1 fill:#ffcccc
    style D2 fill:#99ff99
    style D3 fill:#99ff99
    style D4 fill:#ffcccc
    
    style M1 fill:#99ff99
    style M2 fill:#ffff99
    style M3 fill:#ffff99
    style M4 fill:#99ff99
    
    style MQ stroke:#ffcc00,stroke-width:4px
    style FMEA1 fill:#ff9999,stroke:#cc0000
    style FMEA2 fill:#ff9999,stroke:#cc0000
    style Decision fill:#ffff99,stroke:#ffcc00,stroke-width:3px
```

### DOT

```dot
digraph DBvsMQ {
    rankdir=TB;
    node [shape=box, style="filled"];
    
    Cost [label="Cost", fillcolor="#cccccc"];
    Latency [label="Latency (p99)", fillcolor="#cccccc"];
    Reliability [label="Reliability", fillcolor="#cccccc"];
    Scaling [label="Scaling", fillcolor="#cccccc"];
    
    D1 [label="$4k/mo", fillcolor="#ffcccc"];
    D2 [label="8ms", fillcolor="#99ff99"];
    D3 [label="99.95%", fillcolor="#99ff99"];
    D4 [label="Difficult", fillcolor="#ffcccc"];
    
    M1 [label="$2k/mo", fillcolor="#99ff99"];
    M2 [label="12ms", fillcolor="#ffff99"];
    M3 [label="99.9%", fillcolor="#ffff99"];
    M4 [label="Easy", fillcolor="#99ff99"];
    
    FMEA1 [label="Failure: Message Loss\nRPN: 15", shape=hexagon, fillcolor="#ff9999"];
    FMEA2 [label="Failure: Network Partition\nRPN: 20", shape=hexagon, fillcolor="#ff9999"];
    
    Decision [label="Selected:\nRabbitMQ\n(Cost + Scaling)", fillcolor="#ffff99", penwidth=3];
    
    Cost -> D1;
    Latency -> D2;
    Reliability -> D3;
    Scaling -> D4;
    
    Cost -> M1;
    Latency -> M2;
    Reliability -> M3;
    Scaling -> M4;
    
    M1 -> Decision;
    M2 -> Decision;
    M3 -> Decision;
    M4 -> Decision;
    
    FMEA1 -> Decision [style=dashed, label="Risk"];
    FMEA2 -> Decision [style=dashed, label="Risk"];
}
```

## Special Cases

- **Weighted criteria**: If some criteria are more important, annotate the row header with a weight factor (e.g., "Cost (weight 2x)").
- **FMEA table**: Draw a separate section below the decision matrix with failure modes as hexagons, labeled with severity (1-10), occurrence (1-10), and RPN = S × O.
- **Tiebreaker**: When scores are equal, highlight the decision criteria that broke the tie.
- **Trade-off annotations**: Use callout boxes to note key trade-offs (e.g., "chose Option B for 50% cost savings at 10% latency increase").
- **Risk mitigation**: Dashed lines from FMEA failure modes to the selected alternative, labeled with mitigation strategies.

