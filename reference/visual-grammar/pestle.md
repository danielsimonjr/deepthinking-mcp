# Visual Grammar: PESTLE

How to render a `pestle` thought as a diagram.

## Node Structure

PESTLE analysis is rendered as a **6-lane board** — one lane per macro-environment category, all converging on the analyzed `subject`.

- **Subject** (top of board) → a **gray ellipse** naming what is being scanned
- **Political / Economic / Social / Technological / Legal / Environmental** (six parallel lanes) → each lane is its own **subgraph/cluster**, one distinctly colored per category, listing its array items (one per line)
- **Key Factors** (optional synthesis node, bottom of board) → a **gold box** listing `keyFactors[]`, the cross-lane factors judged most consequential

## Edge Semantics

PESTLE has no directional reasoning edges between lanes — like SWOT, it is a static classification board, not a causal chain. The only edges are thin informational edges from `Subject` into each of the six lanes, and from each lane into `Key Factors` when that node is rendered.

## Mermaid Template

```mermaid
graph TB
    Subject["🎯 Subject"]

    subgraph P["🏛️ Political"]
        P1["- item 1<br/>- item 2"]
    end
    subgraph E["💰 Economic"]
        E1["- item 1<br/>- item 2"]
    end
    subgraph S["👥 Social"]
        S1["- item 1<br/>- item 2"]
    end
    subgraph T["🔧 Technological"]
        T1["- item 1<br/>- item 2"]
    end
    subgraph L["⚖️ Legal"]
        L1["- item 1<br/>- item 2"]
    end
    subgraph N["🌱 Environmental"]
        N1["- item 1<br/>- item 2"]
    end

    Key["⭐ Key Factors"]

    Subject --> P
    Subject --> E
    Subject --> S
    Subject --> T
    Subject --> L
    Subject --> N
    P --> Key
    E --> Key
    S --> Key
    T --> Key
    L --> Key
    N --> Key

    style P1 fill:#6366f1,stroke:#4338ca,color:#fff
    style E1 fill:#22c55e,stroke:#16a34a,color:#fff
    style S1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T1 fill:#a855f7,stroke:#6b21a8,color:#fff
    style L1 fill:#ef4444,stroke:#991b1b,color:#fff
    style N1 fill:#059669,stroke:#065f46,color:#fff
```

## DOT Template

```dot
digraph PESTLE {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    Subject [label="Subject", shape=ellipse, fillcolor="#9ca3af", fontcolor="white"];
    Key [label="Key Factors", shape=ellipse, fillcolor="#f59e0b", fontcolor="black"];

    subgraph cluster_political {
        label="Political";
        P1 [label="- item 1\n- item 2", fillcolor="#6366f1", fontcolor="white"];
    }
    subgraph cluster_economic {
        label="Economic";
        E1 [label="- item 1\n- item 2", fillcolor="#22c55e", fontcolor="white"];
    }
    subgraph cluster_social {
        label="Social";
        S1 [label="- item 1\n- item 2", fillcolor="#3b82f6", fontcolor="white"];
    }
    subgraph cluster_technological {
        label="Technological";
        T1 [label="- item 1\n- item 2", fillcolor="#a855f7", fontcolor="white"];
    }
    subgraph cluster_legal {
        label="Legal";
        L1 [label="- item 1\n- item 2", fillcolor="#ef4444", fontcolor="white"];
    }
    subgraph cluster_environmental {
        label="Environmental";
        N1 [label="- item 1\n- item 2", fillcolor="#059669", fontcolor="white"];
    }

    Subject -> P1;
    Subject -> E1;
    Subject -> S1;
    Subject -> T1;
    Subject -> L1;
    Subject -> N1;
    P1 -> Key;
    N1 -> Key;
}
```

## Worked Example

Based on the EU-expansion scenario in `test/samples/pestle-valid.json`:

### Mermaid

```mermaid
graph TB
    Subject["🎯 Grocery delivery<br/>expansion into EU"]

    subgraph P["🏛️ Political"]
        P1["- DSA moderation obligations<br/>- gig-worker union influence"]
    end
    subgraph E["💰 Economic"]
        E1["- EUR/USD volatility<br/>- higher last-mile costs"]
    end
    subgraph S["👥 Social"]
        S1["- loyalty to local incumbents<br/>- sustainability expectations"]
    end
    subgraph T["🔧 Technological"]
        T1["- GDPR infra required<br/>- routing tuned for US grids"]
    end
    subgraph L["⚖️ Legal"]
        L1["- Platform Work Directive<br/>- per-country VAT registration"]
    end
    subgraph N["🌱 Environmental"]
        N1["- low-emission zones<br/>- packaging recyclability rules"]
    end

    Key["⭐ GDPR + VAT + gig-worker<br/>classification + EV fleet"]

    Subject --> P
    Subject --> E
    Subject --> S
    Subject --> T
    Subject --> L
    Subject --> N
    P --> Key
    E --> Key
    S --> Key
    T --> Key
    L --> Key
    N --> Key

    style P1 fill:#6366f1,stroke:#4338ca,color:#fff
    style E1 fill:#22c55e,stroke:#16a34a,color:#fff
    style S1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T1 fill:#a855f7,stroke:#6b21a8,color:#fff
    style L1 fill:#ef4444,stroke:#991b1b,color:#fff
    style N1 fill:#059669,stroke:#065f46,color:#fff
```

### DOT

```dot
digraph PESTLEExpansion {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    Subject [label="Grocery delivery\nexpansion into EU", shape=ellipse, fillcolor="#9ca3af", fontcolor="white"];
    Key [label="GDPR + VAT + gig-worker\nclassification + EV fleet", shape=ellipse, fillcolor="#f59e0b", fontcolor="black"];

    subgraph cluster_political {
        label="Political";
        P1 [label="DSA moderation obligations\ngig-worker union influence", fillcolor="#6366f1", fontcolor="white"];
    }
    subgraph cluster_economic {
        label="Economic";
        E1 [label="EUR/USD volatility\nhigher last-mile costs", fillcolor="#22c55e", fontcolor="white"];
    }
    subgraph cluster_social {
        label="Social";
        S1 [label="loyalty to local incumbents\nsustainability expectations", fillcolor="#3b82f6", fontcolor="white"];
    }
    subgraph cluster_technological {
        label="Technological";
        T1 [label="GDPR infra required\nrouting tuned for US grids", fillcolor="#a855f7", fontcolor="white"];
    }
    subgraph cluster_legal {
        label="Legal";
        L1 [label="Platform Work Directive\nper-country VAT registration", fillcolor="#ef4444", fontcolor="white"];
    }
    subgraph cluster_environmental {
        label="Environmental";
        N1 [label="low-emission zones\npackaging recyclability rules", fillcolor="#059669", fontcolor="white"];
    }

    Subject -> P1;
    Subject -> E1;
    Subject -> S1;
    Subject -> T1;
    Subject -> L1;
    Subject -> N1;
    P1 -> Key;
    N1 -> Key;
}
```

## Special Cases

- **Empty lane**: If a category array is empty, render the lane's node with the text "none identified" rather than omitting the lane — all six lanes must stay visible even when one is thin.
- **`keyFactors[]` cross-references multiple lanes**: A key factor commonly spans more than one PESTLE category (e.g., GDPR touches both Technological and Legal) — render `Key` as a single synthesis node fed from every contributing lane rather than trying to attribute each factor to exactly one lane.
- **Long lane lists**: If a lane has more than ~3-4 items, show the top items and add a "+N more" suffix rather than growing the lane node unboundedly.
