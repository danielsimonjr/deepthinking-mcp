# Visual Grammar: Stakeholder Analysis

How to render a `stakeholder` thought as a diagram.

## Node Structure

Stakeholder Analysis is rendered as a **power/interest 2×2 grid** — the classic quadrant map crossing Power (low/high, vertical axis) against Interest (low/high, horizontal axis) into four named quadrants: Manage Closely (high power, high interest), Keep Satisfied (high power, low interest), Keep Informed (low power, high interest), and Monitor (low power, low interest).

- **Quadrant regions** → four subgraphs (Mermaid) / clusters (DOT), one per `quadrant` value, laid out so power increases upward and interest increases rightward
- **Stakeholder nodes** → one per entry in `stakeholders[]`, placed in the subgraph/cluster matching its `quadrant`, labeled with `name` and a short excerpt of `strategy`
- **Recommendation** (optional, bottom) → a **blue box** synthesizing engagement priority across quadrants

## Edge Semantics

Stakeholder Analysis has no causal or sequential edges — like SWOT and PESTLE, it is a static classificatory grid. There are no edges between stakeholder nodes; each stakeholder's only relationship is its placement within a quadrant.

## Mermaid Template

```mermaid
graph TB
    subgraph Grid["Power / Interest Grid"]
        direction TB
        subgraph HighPowerHighInterest["Manage Closely (high power, high interest)"]
            S1["Stakeholder A<br/>strategy excerpt"]
        end
        subgraph HighPowerLowInterest["Keep Satisfied (high power, low interest)"]
            S2["Stakeholder B<br/>strategy excerpt"]
        end
        subgraph LowPowerHighInterest["Keep Informed (low power, high interest)"]
            S3["Stakeholder C<br/>strategy excerpt"]
        end
        subgraph LowPowerLowInterest["Monitor (low power, low interest)"]
            S4["Stakeholder D<br/>strategy excerpt"]
        end
    end

    Rec["✓ Recommendation"]
    Grid --> Rec

    style S1 fill:#ef4444,stroke:#b91c1c,color:#fff
    style S2 fill:#f59e0b,stroke:#d97706,color:#000
    style S3 fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style S4 fill:#9ca3af,stroke:#4b5563,color:#000
```

## DOT Template

```dot
digraph StakeholderAnalysis {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    subgraph cluster_manageClosely {
        label="Manage Closely (high power, high interest)";
        S1 [label="Stakeholder A\nstrategy excerpt", fillcolor="#ef4444", fontcolor="white"];
    }
    subgraph cluster_keepSatisfied {
        label="Keep Satisfied (high power, low interest)";
        S2 [label="Stakeholder B\nstrategy excerpt", fillcolor="#f59e0b", fontcolor="black"];
    }
    subgraph cluster_keepInformed {
        label="Keep Informed (low power, high interest)";
        S3 [label="Stakeholder C\nstrategy excerpt", fillcolor="#3b82f6", fontcolor="white"];
    }
    subgraph cluster_monitor {
        label="Monitor (low power, low interest)";
        S4 [label="Stakeholder D\nstrategy excerpt", fillcolor="#9ca3af", fontcolor="black"];
    }

    Rec [label="Recommendation", fillcolor="#3b82f6", fontcolor="white"];
    S1 -> Rec [style=invis];
}
```

## Worked Example

Based on the CRM-rollout scenario in `test/samples/stakeholder-valid.json`:

### Mermaid

```mermaid
graph TB
    subgraph Grid["Power / Interest Grid — CRM rollout"]
        direction TB
        subgraph HighPowerHighInterest["Manage Closely"]
            S1["VP of Sales (executive sponsor)<br/>Weekly syncs; involve in scope decisions"]
        end
        subgraph HighPowerLowInterest["Keep Satisfied"]
            S2["Finance (budget owner)<br/>Monthly cost/ROI summary"]
        end
        subgraph LowPowerHighInterest["Keep Informed"]
            S3["Sales reps (end users)<br/>Biweekly demos + feedback channel"]
        end
        subgraph LowPowerLowInterest["Monitor"]
            S4["Legal/compliance<br/>Light-touch monitoring"]
        end
    end

    Rec["✓ Prioritize VP of Sales weekly;<br/>keep Finance satisfied monthly;<br/>keep reps informed; monitor Legal"]
    Grid --> Rec

    style S1 fill:#ef4444,stroke:#b91c1c,color:#fff
    style S2 fill:#f59e0b,stroke:#d97706,color:#000
    style S3 fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style S4 fill:#9ca3af,stroke:#4b5563,color:#000
```

### DOT

```dot
digraph StakeholderCRM {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    subgraph cluster_manageClosely {
        label="Manage Closely";
        S1 [label="VP of Sales (executive sponsor)\nWeekly syncs; involve in scope decisions", fillcolor="#ef4444", fontcolor="white"];
    }
    subgraph cluster_keepSatisfied {
        label="Keep Satisfied";
        S2 [label="Finance (budget owner)\nMonthly cost/ROI summary", fillcolor="#f59e0b", fontcolor="black"];
    }
    subgraph cluster_keepInformed {
        label="Keep Informed";
        S3 [label="Sales reps (end users)\nBiweekly demos + feedback channel", fillcolor="#3b82f6", fontcolor="white"];
    }
    subgraph cluster_monitor {
        label="Monitor";
        S4 [label="Legal/compliance\nLight-touch monitoring", fillcolor="#9ca3af", fontcolor="black"];
    }

    Rec [label="Prioritize VP of Sales weekly;\nkeep Finance satisfied monthly;\nkeep reps informed; monitor Legal", fillcolor="#3b82f6", fontcolor="white"];
}
```

## Special Cases

- **Quadrant placement must match the `quadrant` field verbatim** — do not re-derive quadrant placement from `power`/`interest` text if `quadrant` already names it; the field is authoritative even though it is logically derivable from the other two.
- **Four quadrants always render, even if empty**: unlike SWOT's "at least two of four" rule, a stakeholder map with all stakeholders in one or two quadrants should still show all four quadrant regions (possibly empty) so the reader can see where nobody currently sits.
- **Strategy excerpts, not full text**: `strategy` is often a full sentence; truncate to a short excerpt in the node label and let the accompanying prose carry the full strategy text, consistent with how `decisionmatrix` truncates arithmetic into cell labels.
