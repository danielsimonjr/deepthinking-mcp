# Visual Grammar: Analysis

How to render an `analysis` thought as a diagram.

## Node Structure

Analysis diagrams display a multi-layer investigation stack:
- **Layer 1 (Bottom): Surface** (rectangles, light blue): observations, symptoms, or surface-level facts
- **Layer 2: Structural** (rectangles, medium blue): component relationships, system architecture, dependencies
- **Layer 3: Patterns** (rounded rectangles, orange): recurring patterns, causal chains, feedback loops
- **Layer 4 (Top): Synthesis** (rounded rectangles, green): higher-level conclusions, root causes, explanations
- **Coverage dial** (side annotation or node): percentage of the analyzed domain covered (e.g., 75% coverage)
- **Layer connector edges** (vertical arrows): progression from surface to synthesis

## Edge Semantics

- **Vertical solid arrows** (`↑`) — Layer progression: surface → structural → patterns → synthesis
- **Horizontal edges within a layer** — Same-level relationships or grouping
- **Coverage percentage** — Labeled on a side node or corner box

## Mermaid Template

```mermaid
graph BT
    subgraph L1["Layer 1: Surface"]
        S1["Symptom A"]
        S2["Symptom B"]
    end
    subgraph L2["Layer 2: Structural"]
        ST1["Component 1"]
    end
    subgraph L3["Layer 3: Patterns"]
        P1["Pattern"]
    end
    subgraph L4["Layer 4: Synthesis"]
        SYN["Root Cause"]
    end
    S1 --> ST1
    ST1 --> P1
    P1 --> SYN
    style S1 fill:#b3d9ff
    style SYN fill:#c8e6c9
```

## DOT Template

```dot
digraph Analysis {
    rankdir=BT;
    S1 [label="Symptom", fillcolor="#b3d9ff"];
    SYN [label="Root Cause", fillcolor="#c8e6c9"];
    S1 -> SYN;
}
```

## Worked Example

Authentication service failure analysis with 4 layers.

### Mermaid

```mermaid
graph BT
    subgraph L1["Layer 1: Surface"]
        S1["500 errors 12%"]
        S2["p99 8 seconds"]
    end
    subgraph L2["Layer 2: Structural"]
        ST["LDAP pool"]
    end
    subgraph L3["Layer 3: Patterns"]
        P["Pool exhaustion"]
    end
    subgraph L4["Layer 4: Synthesis"]
        SYN["No connection reuse"]
    end
    S1 --> ST
    ST --> P
    P --> SYN
    style S1 fill:#b3d9ff
    style ST fill:#66b3ff
    style P fill:#ffe6b3
    style SYN fill:#c8e6c9
```

### DOT

```dot
digraph Auth {
    rankdir=BT;
    S1 [label="500 errors", fillcolor="#b3d9ff"];
    ST [label="LDAP pool", fillcolor="#66b3ff"];
    P [label="Exhaustion", fillcolor="#ffe6b3"];
    SYN [label="No reuse", fillcolor="#c8e6c9"];
    S1 -> ST -> P -> SYN;
}
```

## Special Cases

- **Incomplete analysis**: Mark with dashed borders or lighter colors.
- **Multi-path synthesis**: Multiple arrows converging into root cause.
- **Coverage tracking**: Display percentage in side box.
