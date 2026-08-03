# Visual Grammar: 5 Whys

How to render a `fivewhys` thought as a diagram.

## Node Structure

5 Whys is a **vertical drill-down chain** from a symptom to a single root cause:

- **Problem** (top) → A **red rectangle** stating the observed problem
- **Why 1 … Why N** (middle tiers) → **neutral gray rectangles**, one per entry in `whys[]`, each labeled with its `question` (short form) and `answer`
- **Root Cause** (bottom) → A **green pill/stadium shape** containing `rootCause`
- **Corrective Action** (optional side node) → A **teal box** connected to Root Cause with a dashed edge, present only if `correctiveAction` is populated

The chain length equals `whys.length` — classically 5, but the schema allows any `minItems: 1` count; render exactly as many why-tiers as are present in the sample.

## Edge Semantics

- **Solid gray arrow** (`→`) chains Problem → Why 1 → Why 2 → ... → Why N → Root Cause — each arrow represents "which led to asking"
- **Dashed teal arrow** from Root Cause to Corrective Action — the action addresses the cause, it doesn't cause it

## Mermaid Template

```mermaid
graph TD
    P["Problem"]
    W1["Why 1"]
    W2["Why 2"]
    W3["Why 3"]
    W4["Why 4"]
    W5["Why 5"]
    RC["✓ Root Cause"]
    CA["🔧 Corrective Action"]

    P --> W1 --> W2 --> W3 --> W4 --> W5 --> RC
    RC -.-> CA

    style P fill:#ef4444,stroke:#991b1b,color:#fff
    style W1 fill:#9ca3af,stroke:#4b5563,color:#fff
    style W2 fill:#9ca3af,stroke:#4b5563,color:#fff
    style W3 fill:#9ca3af,stroke:#4b5563,color:#fff
    style W4 fill:#9ca3af,stroke:#4b5563,color:#fff
    style W5 fill:#9ca3af,stroke:#4b5563,color:#fff
    style RC fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:3px
    style CA fill:#14b8a6,stroke:#0f766e,color:#fff
```

## DOT Template

```dot
digraph FiveWhys {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    P [label="Problem", fillcolor="#ef4444", fontcolor="white"];
    W1 [label="Why 1", fillcolor="#9ca3af", fontcolor="white"];
    W2 [label="Why 2", fillcolor="#9ca3af", fontcolor="white"];
    W3 [label="Why 3", fillcolor="#9ca3af", fontcolor="white"];
    W4 [label="Why 4", fillcolor="#9ca3af", fontcolor="white"];
    W5 [label="Why 5", fillcolor="#9ca3af", fontcolor="white"];
    RC [label="Root Cause", fillcolor="#22c55e", fontcolor="white", penwidth=3];
    CA [label="Corrective Action", fillcolor="#14b8a6", fontcolor="white"];

    P -> W1 -> W2 -> W3 -> W4 -> W5 -> RC;
    RC -> CA [style=dashed, color="#14b8a6"];
}
```

## Worked Example

Based on the ETL-failure scenario in `test/samples/fivewhys-valid.json`:

### Mermaid

```mermaid
graph TD
    P["Problem<br/>Nightly ETL failed to load<br/>yesterday's sales data"]
    W1["Why 1<br/>Schema-mismatch error<br/>aborted the load step"]
    W2["Why 2<br/>New nullable column broke<br/>strict column-count check"]
    W3["Why 3<br/>Validation used column-count<br/>instead of column-name"]
    W4["Why 4<br/>Shortcut taken to hit a<br/>launch deadline"]
    W5["Why 5<br/>No process tracks launch-crunch<br/>shortcuts as backlog debt"]
    RC["✓ Root Cause<br/>No process converts launch<br/>shortcuts into tracked debt"]
    CA["🔧 Corrective Action<br/>Column-name validation +<br/>mandatory debt-backlog entry"]

    P --> W1 --> W2 --> W3 --> W4 --> W5 --> RC
    RC -.-> CA

    style P fill:#ef4444,stroke:#991b1b,color:#fff
    style W1 fill:#9ca3af,stroke:#4b5563,color:#fff
    style W2 fill:#9ca3af,stroke:#4b5563,color:#fff
    style W3 fill:#9ca3af,stroke:#4b5563,color:#fff
    style W4 fill:#9ca3af,stroke:#4b5563,color:#fff
    style W5 fill:#9ca3af,stroke:#4b5563,color:#fff
    style RC fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:3px
    style CA fill:#14b8a6,stroke:#0f766e,color:#fff
```

### DOT

```dot
digraph FiveWhysETL {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    P [label="Problem\nNightly ETL failed to load\nyesterday's sales data", fillcolor="#ef4444", fontcolor="white"];
    W1 [label="Why 1\nSchema-mismatch error\naborted the load step", fillcolor="#9ca3af", fontcolor="white"];
    W2 [label="Why 2\nNew nullable column broke\nstrict column-count check", fillcolor="#9ca3af", fontcolor="white"];
    W3 [label="Why 3\nValidation used column-count\ninstead of column-name", fillcolor="#9ca3af", fontcolor="white"];
    W4 [label="Why 4\nShortcut taken to hit a\nlaunch deadline", fillcolor="#9ca3af", fontcolor="white"];
    W5 [label="Why 5\nNo process tracks launch-crunch\nshortcuts as backlog debt", fillcolor="#9ca3af", fontcolor="white"];
    RC [label="Root Cause\nNo process converts launch\nshortcuts into tracked debt", fillcolor="#22c55e", fontcolor="white", penwidth=3];
    CA [label="Corrective Action\nColumn-name validation +\nmandatory debt-backlog entry", fillcolor="#14b8a6", fontcolor="white"];

    P -> W1 -> W2 -> W3 -> W4 -> W5 -> RC;
    RC -> CA [style=dashed, color="#14b8a6"];
}
```

## Special Cases

- **Fewer or more than 5 whys**: The schema only requires `minItems: 1`. Render exactly `whys.length` tiers — do not pad to 5 or truncate beyond 5.
- **When to use `fishbone` instead**: If the drill-down reveals multiple independent contributing categories rather than one linear chain, prefer `fishbone` — 5 Whys assumes a single linear causal chain to one root cause.
- **Missing `correctiveAction`**: Omit the `CA` node entirely rather than rendering an empty box.
