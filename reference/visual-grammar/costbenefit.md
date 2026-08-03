# Visual Grammar: Cost-Benefit Analysis

How to render a `costbenefit` thought as a diagram.

## Node Structure

Cost-Benefit Analysis is rendered as a **two-column balance** — costs on the left, benefits on the right, each itemized, with a bottom summary node showing the totals and derived metrics (`npv`/`roi`/`paybackPeriod`) and a final recommendation.

- **Cost column** (left) → one node per entry in `costs[]`, labeled with `item` and `amount`; a bottom node in this column sums to the cost total
- **Benefit column** (right) → one node per entry in `benefits[]`, labeled with `item` and `amount`; a bottom node in this column sums to the benefit total
- **Balance node** (center, bottom) → shows cost total vs. benefit total side by side, plus `npv`/`roi`/`paybackPeriod` when present
- **Recommendation** (bottom) → a **blue box** with the go/no-go call and the arithmetic that supports it

## Edge Semantics

- Each cost/benefit line item connects downward into its column's total node — an aggregation edge, not a causal one
- Both column totals connect into the central **Balance** node, which connects into **Recommendation** — this chain visually represents "itemized → totaled → compared → decided"

## Mermaid Template

```mermaid
graph TB
    subgraph Costs["Costs"]
        direction TB
        C1["cost item 1: $N"]
        C2["cost item 2: $N"]
        CTotal["Total costs: $N"]
        C1 --> CTotal
        C2 --> CTotal
    end

    subgraph Benefits["Benefits"]
        direction TB
        B1["benefit item 1: $N"]
        B2["benefit item 2: $N"]
        BTotal["Total benefits: $N"]
        B1 --> BTotal
        B2 --> BTotal
    end

    Balance["Costs $N vs. Benefits $N<br/>ROI / payback"]
    CTotal --> Balance
    BTotal --> Balance

    Rec["✓ Recommendation"]
    Balance --> Rec

    style CTotal fill:#ef4444,stroke:#b91c1c,color:#fff
    style BTotal fill:#22c55e,stroke:#16a34a,color:#fff
```

## DOT Template

```dot
digraph CostBenefit {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    subgraph cluster_costs {
        label="Costs";
        C1 [label="cost item 1: $N", fillcolor="#fecaca"];
        C2 [label="cost item 2: $N", fillcolor="#fecaca"];
        CTotal [label="Total costs: $N", fillcolor="#ef4444", fontcolor="white"];
        C1 -> CTotal;
        C2 -> CTotal;
    }

    subgraph cluster_benefits {
        label="Benefits";
        B1 [label="benefit item 1: $N", fillcolor="#bbf7d0"];
        B2 [label="benefit item 2: $N", fillcolor="#bbf7d0"];
        BTotal [label="Total benefits: $N", fillcolor="#22c55e", fontcolor="white"];
        B1 -> BTotal;
        B2 -> BTotal;
    }

    Balance [label="Costs $N vs Benefits $N\nROI / payback", fillcolor="#e5e7eb"];
    Rec [label="Recommendation", fillcolor="#3b82f6", fontcolor="white"];

    CTotal -> Balance;
    BTotal -> Balance;
    Balance -> Rec;
}
```

## Worked Example

Based on the RDS/Aurora migration scenario in `test/samples/costbenefit-valid.json` (costs $165,000; benefits $80,000/year):

### Mermaid

```mermaid
graph TB
    subgraph Costs["Costs"]
        direction TB
        C1["Migration engineering effort: $108,000"]
        C2["Managed service premium (yr 1): $42,000"]
        C3["Training and runbook rewrite: $15,000"]
        CTotal["Total costs: $165,000"]
        C1 --> CTotal
        C2 --> CTotal
        C3 --> CTotal
    end

    subgraph Benefits["Benefits"]
        direction TB
        B1["Reduced on-call incident hours: $18,000"]
        B2["Eliminated cluster maintenance: $25,000"]
        B3["Autoscaling infra savings: $37,000"]
        BTotal["Total benefits: $80,000/yr"]
        B1 --> BTotal
        B2 --> BTotal
        B3 --> BTotal
    end

    Balance["$165,000 costs vs. $80,000/yr benefits<br/>Payback ~2.1yr, 3yr ROI ~45.5%"]
    CTotal --> Balance
    BTotal --> Balance

    Rec["✓ Proceed — payback within ~2.1 years,<br/>then $80,000/yr net savings"]
    Balance --> Rec

    style CTotal fill:#ef4444,stroke:#b91c1c,color:#fff
    style BTotal fill:#22c55e,stroke:#16a34a,color:#fff
```

### DOT

```dot
digraph CostBenefitRDS {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    subgraph cluster_costs {
        label="Costs";
        C1 [label="Migration engineering effort: $108,000", fillcolor="#fecaca"];
        C2 [label="Managed service premium (yr 1): $42,000", fillcolor="#fecaca"];
        C3 [label="Training and runbook rewrite: $15,000", fillcolor="#fecaca"];
        CTotal [label="Total costs: $165,000", fillcolor="#ef4444", fontcolor="white"];
        C1 -> CTotal;
        C2 -> CTotal;
        C3 -> CTotal;
    }

    subgraph cluster_benefits {
        label="Benefits";
        B1 [label="Reduced on-call incident hours: $18,000", fillcolor="#bbf7d0"];
        B2 [label="Eliminated cluster maintenance: $25,000", fillcolor="#bbf7d0"];
        B3 [label="Autoscaling infra savings: $37,000", fillcolor="#bbf7d0"];
        BTotal [label="Total benefits: $80,000/yr", fillcolor="#22c55e", fontcolor="white"];
        B1 -> BTotal;
        B2 -> BTotal;
        B3 -> BTotal;
    }

    Balance [label="$165,000 costs vs $80,000/yr benefits\nPayback ~2.1yr, 3yr ROI ~45.5%", fillcolor="#e5e7eb"];
    Rec [label="Proceed - payback within ~2.1 years,\nthen $80,000/yr net savings", fillcolor="#3b82f6", fontcolor="white"];

    CTotal -> Balance;
    BTotal -> Balance;
    Balance -> Rec;
}
```

## Special Cases

- **Always show both totals, not just the delta**: per the `think-frameworks` Output Quality Rule and this mode's prose invariant, the rendered balance must show the cost total and benefit total explicitly (not just a single "net benefit" number) so the reader can audit the underlying arithmetic.
- **`npv`/`roi`/`paybackPeriod` may be `null`**: the schema allows `null` for any of these derived metrics when they were not computed or are not meaningful for the option (e.g., a one-time cost with no recurring benefit stream); omit that line from the Balance node rather than rendering "null".
- **Column count is not fixed**: unlike `decisionmatrix`'s minimum 2×2 grid, `costbenefit` has no minimum item count per column — a single cost or single benefit line is valid and should render as a one-node column.
