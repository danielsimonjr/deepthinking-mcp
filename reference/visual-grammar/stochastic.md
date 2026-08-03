# Visual Grammar: Stochastic

How to render a `stochastic` thought as a diagram.

## Node Structure

Stochastic (Markov chain) diagrams model probabilistic state transitions:
- **States** (circles, sized by steady-state probability): nodes representing possible conditions
- **Transition probabilities** (labeled edges): arrows from state i to state j with probability p(i→j)
- **Stationary distribution** (node size or annotation): larger or darker nodes indicate higher long-run probability
- **Node sizing** (by steady-state probability): visual encoding of which states are visited most frequently
- **Monte Carlo samples annotation** (separate box): count or distribution of simulated paths (if applicable)
- **Ergodic indicator**: note whether chain is irreducible and aperiodic

## Edge Semantics

- **Labeled arrow** (`→ 0.8`) — Transition probability: edge label shows probability of moving from source to target
- **Self-loop** (`↻ 0.1`) — Remaining probability: stay in current state
- **Node size** (radius proportional to steady-state probability): visual indicator of long-run occupancy
- **Thickness of edge** (penwidth scales with probability): visual encoding of likelihood

## Mermaid Template

```mermaid
graph LR
    S1["State 1<br/>(π=0.25)"]
    S2["State 2<br/>(π=0.50)"]
    S3["State 3<br/>(π=0.25)"]
    
    S1 -->|0.6| S2
    S1 -->|0.4| S3
    S2 -->|0.5| S1
    S2 -->|0.3| S2
    S2 -->|0.2| S3
    S3 -->|0.7| S2
    S3 -->|0.3| S3
    
    style S1 fill:#b3d9ff,stroke:#0066cc,stroke-width:2px
    style S2 fill:#66b3ff,stroke:#0047b3,stroke-width:4px
    style S3 fill:#b3d9ff,stroke:#0066cc,stroke-width:2px
```

## DOT Template

```dot
digraph Stochastic {
    rankdir=LR;
    node [style="filled"];
    
    S1 [label="State 1\n(π=0.25)", shape=circle, fillcolor="#b3d9ff", penwidth=2];
    S2 [label="State 2\n(π=0.50)", shape=circle, fillcolor="#66b3ff", penwidth=4];
    S3 [label="State 3\n(π=0.25)", shape=circle, fillcolor="#b3d9ff", penwidth=2];
    
    S1 -> S2 [label="0.6", penwidth=3, color="#0066cc"];
    S1 -> S3 [label="0.4", penwidth=2, color="#0066cc"];
    S2 -> S1 [label="0.5", penwidth=2.5, color="#0047b3"];
    S2 -> S2 [label="0.3", penwidth=2, color="#0047b3"];
    S2 -> S3 [label="0.2", penwidth=1.5, color="#0047b3"];
    S3 -> S2 [label="0.7", penwidth=3, color="#0066cc"];
    S3 -> S3 [label="0.3", penwidth=2, color="#0066cc"];
}
```

## Worked Example

M/M/1 ticket queue with steady-state distribution and Monte Carlo sampling.

### Mermaid

```mermaid
graph LR
    S0["Queue=0<br/>(π=0.40)"]
    S1["Queue=1<br/>(π=0.24)"]
    S2["Queue=2<br/>(π=0.14)"]
    S3["Queue=3+<br/>(π=0.22)"]
    
    S0 -->|λ=0.8| S1
    S1 -->|λ=0.8| S2
    S2 -->|λ=0.8| S3
    S1 -->|μ=0.6| S0
    S2 -->|μ=0.6| S1
    S3 -->|μ=0.6| S2
    S0 -->|0.4| S0
    
    MC["Monte Carlo:<br/>100k samples<br/>Mean queue: 1.2<br/>Variance: 2.8"]
    
    style S0 fill:#99ff99,stroke:#00aa00,stroke-width:4px
    style S1 fill:#ccffcc,stroke:#00cc00,stroke-width:3px
    style S2 fill:#e6ffe6,stroke:#66ff66,stroke-width:2px
    style S3 fill:#fff9e6,stroke:#ffff99,stroke-width:2px
    style MC fill:#f0f0f0,stroke:#666666
```

### DOT

```dot
digraph QueueSystem {
    rankdir=LR;
    node [style="filled"];
    
    S0 [label="Queue=0\n(π=0.40)", shape=circle, fillcolor="#99ff99", penwidth=4];
    S1 [label="Queue=1\n(π=0.24)", shape=circle, fillcolor="#ccffcc", penwidth=3];
    S2 [label="Queue=2\n(π=0.14)", shape=circle, fillcolor="#e6ffe6", penwidth=2];
    S3 [label="Queue=3+\n(π=0.22)", shape=circle, fillcolor="#fff9e6", penwidth=2];
    
    S0 -> S1 [label="0.8", penwidth=3];
    S1 -> S2 [label="0.8", penwidth=3];
    S2 -> S3 [label="0.8", penwidth=3];
    S1 -> S0 [label="0.6", penwidth=2.5];
    S2 -> S1 [label="0.6", penwidth=2.5];
    S3 -> S2 [label="0.6", penwidth=2.5];
    S0 -> S0 [label="0.4"];
}
```

## Special Cases

- **Absorbing states**: Use a different color (e.g., black with white border) for states with π=1 self-loop.
- **Transient behavior**: Annotate initial distribution and show time-stepping from t=0 to t=∞.
- **Multiple chains**: If the system has multiple irreducible components, separate them visually or use different subgraph clusters.
- **Simulation results**: Show a histogram or box plot of steady-state metrics (e.g., mean queue length, response time) in an annotation box.
- **Convergence rate**: Optionally annotate with the spectral gap or mixing time (e.g., "mixes in ~50 steps").
