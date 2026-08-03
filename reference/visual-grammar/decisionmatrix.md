# Visual Grammar: Decision Matrix

How to render a `decisionmatrix` thought as a diagram.

## Node Structure

A Decision Matrix is rendered as a **scored grid table** — rows are `options[]`, columns are `criteria[]` (each weighted), cells are the `perCriterion` scores, and a final column shows each option's weighted `total`.

- **Header row** → one node per entry in `criteria[]`, each labeled with `name` and `weight` (e.g., "Risk of downtime (0.4)")
- **Option rows** → one row per entry in `options[]`/`scores[]`, each cell showing the raw `perCriterion[i]` score
- **Total column** → the rightmost cell of each row, showing `scores[].total` — the winning option (highest total) is highlighted
- **Recommendation** (bottom) → a **blue box** naming the chosen option and the arithmetic that supports it

## Edge Semantics

A Decision Matrix has no causal or sequential edges — it is a static scored grid, like SWOT and PESTLE. The only "edge" in the rendered diagram is an informational link from the grid into the `Recommendation` node, and (in Mermaid, which cannot natively render an HTML table inside `graph` syntax) synthetic edges connecting each option node to its total-score node to preserve the row grouping visually.

## Mermaid Template

```mermaid
graph TB
    subgraph Matrix["Decision Matrix (weight × score)"]
        direction LR
        O1["Option 1<br/>crit1: s×w<br/>crit2: s×w<br/>Total: N"]
        O2["Option 2<br/>crit1: s×w<br/>crit2: s×w<br/>Total: N"]
    end

    Rec["✓ Recommendation"]
    Matrix --> Rec

    style O1 fill:#e5e7eb,stroke:#6b7280,color:#000
    style O2 fill:#22c55e,stroke:#16a34a,color:#fff
```

## DOT Template

```dot
digraph DecisionMatrix {
    rankdir=TB;
    node [shape=none];

    Matrix [label=<
<table border="1" cellborder="1" cellspacing="0">
<tr><td>Option</td><td>Criterion 1 (w)</td><td>Criterion 2 (w)</td><td>Total</td></tr>
<tr><td>Option 1</td><td>score</td><td>score</td><td>N</td></tr>
<tr><td bgcolor="#22c55e">Option 2</td><td>score</td><td>score</td><td bgcolor="#22c55e">N (winner)</td></tr>
</table>>];

    Rec [shape=box, label="Recommendation", style=filled, fillcolor="#3b82f6", fontcolor="white"];
    Matrix -> Rec;
}
```

## Worked Example

Based on the database-migration scenario in `test/samples/decisionmatrix-valid.json` (criteria weights 0.4 / 0.35 / 0.25):

### Mermaid

```mermaid
graph TB
    subgraph Matrix["Decision Matrix — Downtime risk (0.4) × Effort (0.35) × Time (0.25)"]
        direction LR
        O1["Big-bang cutover<br/>2×0.4 + 4×0.35 + 5×0.25<br/>Total: 3.45"]
        O2["Dual-write phased<br/>4×0.4 + 2×0.35 + 2×0.25<br/>Total: 2.80"]
        O3["Strangler-fig incremental<br/>5×0.4 + 3×0.35 + 3×0.25<br/>Total: 3.80"]
    end

    Rec["✓ Strangler-fig wins:<br/>highest weighted total (3.80)"]
    Matrix --> Rec

    style O1 fill:#e5e7eb,stroke:#6b7280,color:#000
    style O2 fill:#e5e7eb,stroke:#6b7280,color:#000
    style O3 fill:#22c55e,stroke:#16a34a,color:#fff
```

### DOT

```dot
digraph DecisionMatrixMigration {
    rankdir=TB;
    node [shape=none];

    Matrix [label=<
<table border="1" cellborder="1" cellspacing="0">
<tr><td>Option</td><td>Downtime risk (0.4)</td><td>Effort (0.35)</td><td>Time (0.25)</td><td>Total</td></tr>
<tr><td>Big-bang cutover</td><td>2</td><td>4</td><td>5</td><td>3.45</td></tr>
<tr><td>Dual-write phased</td><td>4</td><td>2</td><td>2</td><td>2.80</td></tr>
<tr><td bgcolor="#22c55e">Strangler-fig incremental</td><td>5</td><td>3</td><td>3</td><td bgcolor="#22c55e">3.80 (winner)</td></tr>
</table>>];

    Rec [shape=box, label="Strangler-fig wins:\nhighest weighted total (3.80)", style=filled, fillcolor="#3b82f6", fontcolor="white"];
    Matrix -> Rec;
}
```

## Special Cases

- **Always show the arithmetic, not just the total**: Per the `think-frameworks` Output Quality Rule ("show scoring math for weighted modes"), each cell or row annotation should make `perCriterion[i] × criteria[i].weight` visible somewhere in the render — a bare `total` number without its derivation defeats the purpose of a decision matrix, which is to make the tradeoff auditable.
- **Highlighting the winner**: The option with the highest `total` gets the green highlight (`fill:#22c55e` / `bgcolor="#22c55e"`); all other options render in neutral gray — this is a ranking visualization, not a categorical one like SWOT's quadrants.
- **Minimum shape**: The schema requires `minItems: 2` on both `options` and `criteria` — the grid must always have at least a 2×2 body even in the smallest legitimate decision matrix.
