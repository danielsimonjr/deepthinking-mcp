# Visual Grammar: Pareto (80/20)

How to render a `pareto` thought as a diagram.

## Node Structure

Pareto analysis is rendered as **sorted bars with a cumulative percentage line** — items ordered descending by `value`, with a running `cumulativePercent` overlay showing where the "vital few" cutoff falls. Neither Mermaid's plain `graph` syntax nor DOT natively support dual-axis bar+line charts, so this grammar is a **best-effort approximation**: bars are represented as proportionally-labeled boxes and the cumulative line as a directed chain of percentage nodes.

- **Item bars** (one per entry in `items[]`, sorted descending by `value`) → a **box** per item, labeled with `name`, `value`, and a text-block bar (`█` repeated proportional to `value`); items also present in `vitalFew[]` render in **gold**, the rest in **gray**
- **Cumulative chain** (parallel track) → one node per entry in `cumulativePercent[]`, chained in sequence, each labeled with its running percentage; a visually marked node at/just past 80% flags the vital-few cutoff
- **Recommendation** (optional, bottom) → a **blue box** with the prioritization action

## Edge Semantics

- **Thin directed arrow** connects each item bar to the next in descending-value order — this is a rank/sequence edge, not a causal one; it exists only so the sort order is visually explicit
- **Dashed directed arrow** chains the cumulative-percent nodes in the same order, approximating the cumulative line's trajectory
- A **dotted edge** from the last vital-few item to the 80%-cutoff node highlights where the vital-few boundary falls

## Mermaid Template

```mermaid
graph TB
    subgraph Bars["Items (sorted by value, descending)"]
        I1["item 1: value1 ████████"]
        I2["item 2: value2 █████"]
        I3["item 3: value3 ██"]
    end

    subgraph Cumulative["Cumulative %"]
        C1["cum% 1"]
        C2["cum% 2"]
        C3["cum% 3 (~80% cutoff)"]
    end

    I1 --> I2 --> I3
    C1 -.-> C2 -.-> C3
    I3 -.->|vital few cutoff| C3

    Rec["✓ Recommendation"]
    Cumulative --> Rec

    style I1 fill:#f59e0b,stroke:#d97706,color:#000
    style I2 fill:#f59e0b,stroke:#d97706,color:#000
    style I3 fill:#9ca3af,stroke:#4b5563,color:#000
```

## DOT Template

```dot
digraph Pareto {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    I1 [label="item 1: value1 ||||||||", fillcolor="#f59e0b", fontcolor="black"];
    I2 [label="item 2: value2 |||||", fillcolor="#f59e0b", fontcolor="black"];
    I3 [label="item 3: value3 ||", fillcolor="#9ca3af", fontcolor="black"];
    C1 [label="cum% 1", shape=ellipse, fillcolor="#e5e7eb"];
    C2 [label="cum% 2", shape=ellipse, fillcolor="#e5e7eb"];
    C3 [label="cum% 3 (~80% cutoff)", shape=ellipse, fillcolor="#fde68a"];
    Rec [label="Recommendation", fillcolor="#3b82f6", fontcolor="white"];

    I1 -> I2 -> I3;
    C1 -> C2 -> C3 [style=dashed];
    I3 -> C3 [style=dotted, label="vital few cutoff"];
    C3 -> Rec;
}
```

## Worked Example

Based on the support-ticket scenario in `test/samples/pareto-valid.json` (7 categories, 1,050 total tickets):

### Mermaid

```mermaid
graph TB
    subgraph Bars["Support ticket categories (sorted by volume)"]
        I1["Login/password: 420 ████████████████████"]
        I2["Billing questions: 310 ███████████████"]
        I3["Feature how-to: 150 ███████"]
        I4["Bug reports: 80 ████"]
        I5["Integration failures: 45 ██"]
        I6["Data export requests: 25 █"]
        I7["Other misc: 20 █"]
    end

    subgraph Cumulative["Cumulative %"]
        C1["40.0%"]
        C2["69.5%"]
        C3["83.8% (vital-few cutoff)"]
        C4["91.4%"]
        C5["95.7%"]
        C6["98.1%"]
        C7["100%"]
    end

    I1 --> I2 --> I3 --> I4 --> I5 --> I6 --> I7
    C1 -.-> C2 -.-> C3 -.-> C4 -.-> C5 -.-> C6 -.-> C7
    I3 -.->|vital few cutoff| C3

    Rec["✓ Fix login/password and billing<br/>flows first — ~84% of ticket volume"]
    Cumulative --> Rec

    style I1 fill:#f59e0b,stroke:#d97706,color:#000
    style I2 fill:#f59e0b,stroke:#d97706,color:#000
    style I3 fill:#f59e0b,stroke:#d97706,color:#000
    style I4 fill:#9ca3af,stroke:#4b5563,color:#000
    style I5 fill:#9ca3af,stroke:#4b5563,color:#000
    style I6 fill:#9ca3af,stroke:#4b5563,color:#000
    style I7 fill:#9ca3af,stroke:#4b5563,color:#000
```

### DOT

```dot
digraph ParetoTickets {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    I1 [label="Login/password: 420", fillcolor="#f59e0b", fontcolor="black"];
    I2 [label="Billing questions: 310", fillcolor="#f59e0b", fontcolor="black"];
    I3 [label="Feature how-to: 150", fillcolor="#f59e0b", fontcolor="black"];
    I4 [label="Bug reports: 80", fillcolor="#9ca3af", fontcolor="black"];
    I5 [label="Integration failures: 45", fillcolor="#9ca3af", fontcolor="black"];
    I6 [label="Data export requests: 25", fillcolor="#9ca3af", fontcolor="black"];
    I7 [label="Other misc: 20", fillcolor="#9ca3af", fontcolor="black"];

    C1 [label="40.0%", shape=ellipse, fillcolor="#e5e7eb"];
    C2 [label="69.5%", shape=ellipse, fillcolor="#e5e7eb"];
    C3 [label="83.8% (cutoff)", shape=ellipse, fillcolor="#fde68a"];
    C4 [label="91.4%", shape=ellipse, fillcolor="#e5e7eb"];
    C5 [label="95.7%", shape=ellipse, fillcolor="#e5e7eb"];
    C6 [label="98.1%", shape=ellipse, fillcolor="#e5e7eb"];
    C7 [label="100%", shape=ellipse, fillcolor="#e5e7eb"];

    Rec [label="Fix login/password and billing\nflows first - ~84% of ticket volume", fillcolor="#3b82f6", fontcolor="white"];

    I1 -> I2 -> I3 -> I4 -> I5 -> I6 -> I7;
    C1 -> C2 -> C3 -> C4 -> C5 -> C6 -> C7 [style=dashed];
    I3 -> C3 [style=dotted, label="vital few cutoff"];
    C7 -> Rec;
}
```

## Special Cases

- **Best-effort chart, not a native chart**: Neither Mermaid's `graph` grammar nor DOT support true dual-axis bar+line rendering. If the `visual-exporter` agent is asked for a format with native chart support (e.g., an HTML dashboard using Chart.js, or a CSV export for spreadsheet charting), prefer that format over straining the Mermaid/DOT approximation.
- **Sort order is load-bearing**: `items[]` must already be sorted descending by `value` for this grammar to make sense — if the underlying thought's array isn't sorted, sort before rendering rather than rendering in input order.
- **`vitalFew[]` highlight matches by name**: An item bar renders gold if its `name` appears (verbatim) in `vitalFew[]`, gray otherwise — this is the same cross-reference-by-string-match pattern used for `primaryCauses[]` in the fishbone grammar.
