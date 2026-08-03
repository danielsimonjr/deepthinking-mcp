# Visual Grammar: Risk Assessment

How to render a `riskassessment` thought as a diagram.

## Node Structure

Risk Assessment is rendered as a **probability × impact heat grid** — a 2D scatter/grid where each risk is placed by its `probability` (vertical axis) and `impact` (horizontal axis), colored by its `score`, since `score` is the product of the two axes.

- **Grid cells** → a 5×5 (or continuous, if probability/impact are fractional) background grid from low to high on both axes, with warmer colors (red) toward the high/high corner and cooler colors (green) toward the low/low corner
- **Risk nodes** → one per entry in `risks[]`, placed at its `(probability, impact)` coordinate, labeled with `risk` (short excerpt) and `score`; risks listed in `topRisks[]` get a bold border
- **Mitigation callouts** (optional, attached to each risk node) → a small linked node or annotation showing `mitigation`
- **Recommendation** (bottom) → a **blue box** naming the priority order for addressing risks

## Edge Semantics

Risk Assessment has no causal or sequential edges between risks — like Decision Matrix, it is a static scored grid. The only edges are informational: a dotted edge from each risk node to its mitigation callout (if rendered separately), and a solid edge from the grid into the Recommendation node.

## Mermaid Template

```mermaid
graph TB
    subgraph Grid["Probability x Impact Heat Grid"]
        direction LR
        R1["Risk A<br/>P=0.x I=n<br/>Score: s"]
        R2["Risk B<br/>P=0.x I=n<br/>Score: s"]
        R3["Risk C<br/>P=0.x I=n<br/>Score: s"]
    end

    Rec["✓ Recommendation"]
    Grid --> Rec

    style R1 fill:#ef4444,stroke:#b91c1c,color:#fff
    style R2 fill:#f59e0b,stroke:#d97706,color:#000
    style R3 fill:#22c55e,stroke:#16a34a,color:#fff
```

## DOT Template

```dot
digraph RiskAssessment {
    rankdir=TB;
    node [shape=none];

    Grid [label=<
<table border="1" cellborder="1" cellspacing="0">
<tr><td>Risk</td><td>Probability</td><td>Impact</td><td>Score</td><td>Mitigation</td></tr>
<tr><td bgcolor="#fca5a5">Risk A (top)</td><td>0.x</td><td>n</td><td bgcolor="#fca5a5">s (highest)</td><td>mitigation text</td></tr>
<tr><td>Risk B</td><td>0.x</td><td>n</td><td>s</td><td>mitigation text</td></tr>
<tr><td bgcolor="#bbf7d0">Risk C</td><td>0.x</td><td>n</td><td bgcolor="#bbf7d0">s (lowest)</td><td>mitigation text</td></tr>
</table>>];

    Rec [shape=box, label="Recommendation", style=filled, fillcolor="#3b82f6", fontcolor="white"];
    Grid -> Rec;
}
```

## Worked Example

Based on the payment-gateway migration scenario in `test/samples/riskassessment-valid.json`:

### Mermaid

```mermaid
graph TB
    subgraph Grid["Probability x Impact Heat Grid — Payment gateway migration"]
        direction LR
        R1["SDK unfamiliarity<br/>P=0.6 I=3<br/>Score: 1.8"]
        R2["Undocumented rate limits<br/>P=0.4 I=4<br/>Score: 1.6"]
        R3["SLA gap for peak windows<br/>P=0.3 I=4<br/>Score: 1.2"]
        R4["Data migration corruption<br/>P=0.2 I=5<br/>Score: 1.0"]
    end

    Rec["✓ Fix SDK-familiarity gap and rate-limit<br/>unknown first (scores 1.8, 1.6);<br/>run corruption/SLA mitigations in parallel"]
    Grid --> Rec

    style R1 fill:#ef4444,stroke:#b91c1c,color:#fff
    style R2 fill:#f59e0b,stroke:#d97706,color:#000
    style R3 fill:#fde68a,stroke:#d97706,color:#000
    style R4 fill:#22c55e,stroke:#16a34a,color:#fff
```

### DOT

```dot
digraph RiskAssessmentPaymentGateway {
    rankdir=TB;
    node [shape=none];

    Grid [label=<
<table border="1" cellborder="1" cellspacing="0">
<tr><td>Risk</td><td>Probability</td><td>Impact</td><td>Score</td><td>Mitigation</td></tr>
<tr><td bgcolor="#fca5a5">SDK unfamiliarity (top)</td><td>0.6</td><td>3</td><td bgcolor="#fca5a5">1.8</td><td>Two-week SDK spike, pair certified engineers</td></tr>
<tr><td bgcolor="#fde68a">Undocumented rate limits</td><td>0.4</td><td>4</td><td bgcolor="#fde68a">1.6</td><td>Sandbox load test at 3x peak, written vendor commitment</td></tr>
<tr><td>SLA gap for peak windows</td><td>0.3</td><td>4</td><td>1.2</td><td>Escalate to vendor account team, keep old gateway as failover</td></tr>
<tr><td bgcolor="#bbf7d0">Data migration corruption</td><td>0.2</td><td>5</td><td bgcolor="#bbf7d0">1.0</td><td>Verified backup, dry-run migration with checksum diff</td></tr>
</table>>];

    Rec [shape=box, label="Fix SDK-familiarity gap and rate-limit\nunknown first (scores 1.8, 1.6);\nrun corruption/SLA mitigations in parallel", style=filled, fillcolor="#3b82f6", fontcolor="white"];
    Grid -> Rec;
}
```

## Special Cases

- **`score` must always equal `probability × impact`**: per this mode's prose invariant, the rendered label must show the arithmetic (`P=0.4 I=4 → Score: 1.6`), not just the bare score — a bare score defeats the purpose of a probability × impact matrix, which is to make the priority ranking auditable.
- **Color by score, not by raw probability or impact alone**: a risk with high probability but low impact (or vice versa) should not render as dramatically as one with both high — color intensity tracks the product (`score`), matching how the Mermaid/DOT templates above grade from red (highest score) to green (lowest).
- **`topRisks[]` highlight matches by name**: a risk node gets a bold border / warmer color tier if its `risk` text appears (verbatim) in `topRisks[]` — the same cross-reference-by-string-match pattern used for `vitalFew[]` in the pareto grammar and `primaryCauses[]` in fishbone.
