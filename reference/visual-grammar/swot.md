# Visual Grammar: SWOT

How to render a `swot` thought as a diagram.

## Node Structure

SWOT analysis is rendered as a **2×2 quadrant grid** crossing two axes: Internal vs. External (rows) and Positive vs. Negative (columns).

- **Strengths** (top-left, internal + positive) → **green box**
- **Weaknesses** (top-right, internal + negative) → **red box**
- **Opportunities** (bottom-left, external + positive) → **blue box**
- **Threats** (bottom-right, external + negative) → **orange box**
- Each quadrant node lists its array items (one per line)
- Optional **Subject** node above the grid names what's being assessed; optional **Recommendation** node below the grid captures the synthesis

## Edge Semantics

SWOT has no directional reasoning edges between quadrants — it is a static classification grid, not a causal or inferential chain. The only edges (when `subject`/`recommendation` are rendered) are a thin edge from `Subject` into the grid and from the grid into `Recommendation`, both undirected/informational rather than causal.

## Mermaid Template

```mermaid
graph TB
    Subject["🎯 Subject"]

    subgraph Internal["Internal Factors"]
        S["➕ Strengths<br/>- item 1<br/>- item 2"]
        W["➖ Weaknesses<br/>- item 1<br/>- item 2"]
    end

    subgraph External["External Factors"]
        O["🌱 Opportunities<br/>- item 1<br/>- item 2"]
        T["⚠️ Threats<br/>- item 1<br/>- item 2"]
    end

    Rec["✓ Recommendation"]

    Subject --> Internal
    Subject --> External
    Internal --> Rec
    External --> Rec

    style S fill:#22c55e,stroke:#16a34a,color:#fff
    style W fill:#ef4444,stroke:#991b1b,color:#fff
    style O fill:#3b82f6,stroke:#1e40af,color:#fff
    style T fill:#f59e0b,stroke:#d97706,color:#000
```

## DOT Template

```dot
digraph SWOT {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    Subject [label="Subject", shape=ellipse, fillcolor="#9ca3af", fontcolor="white"];
    Rec [label="Recommendation", shape=ellipse, fillcolor="#9ca3af", fontcolor="white"];

    subgraph cluster_internal {
        label="Internal Factors";
        S [label="Strengths\n- item 1\n- item 2", fillcolor="#22c55e", fontcolor="white"];
        W [label="Weaknesses\n- item 1\n- item 2", fillcolor="#ef4444", fontcolor="white"];
    }
    subgraph cluster_external {
        label="External Factors";
        O [label="Opportunities\n- item 1\n- item 2", fillcolor="#3b82f6", fontcolor="white"];
        T [label="Threats\n- item 1\n- item 2", fillcolor="#f59e0b", fontcolor="black"];
    }

    Subject -> S;
    Subject -> O;
    W -> Rec;
    T -> Rec;
}
```

## Worked Example

Based on the metered-pricing scenario in `test/samples/swot-valid.json`:

### Mermaid

```mermaid
graph TB
    Subject["🎯 Metered usage-based<br/>pricing tier launch"]

    subgraph Internal["Internal Factors"]
        S["➕ Strengths<br/>- metering pipeline exists<br/>- customers already asking<br/>- prior Stripe experience"]
        W["➖ Weaknesses<br/>- no self-serve billing portal<br/>- ASC 606 not validated"]
    end

    subgraph External["External Factors"]
        O["🌱 Opportunities<br/>- competitors lack usage pricing<br/>- unlocks smaller accounts<br/>- organic expansion revenue"]
        T["⚠️ Threats<br/>- revenue unpredictability<br/>- metering unit gaming risk"]
    end

    Rec["✓ Beta with 5-10 design<br/>partners, gated on finance sign-off"]

    Subject --> Internal
    Subject --> External
    Internal --> Rec
    External --> Rec

    style S fill:#22c55e,stroke:#16a34a,color:#fff
    style W fill:#ef4444,stroke:#991b1b,color:#fff
    style O fill:#3b82f6,stroke:#1e40af,color:#fff
    style T fill:#f59e0b,stroke:#d97706,color:#000
```

### DOT

```dot
digraph SWOTPricing {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    Subject [label="Metered usage-based\npricing tier launch", shape=ellipse, fillcolor="#9ca3af", fontcolor="white"];
    Rec [label="Beta with 5-10 design partners,\ngated on finance sign-off", shape=ellipse, fillcolor="#9ca3af", fontcolor="white"];

    subgraph cluster_internal {
        label="Internal Factors";
        S [label="Strengths\n- metering pipeline exists\n- customers already asking\n- prior Stripe experience", fillcolor="#22c55e", fontcolor="white"];
        W [label="Weaknesses\n- no self-serve billing portal\n- ASC 606 not validated", fillcolor="#ef4444", fontcolor="white"];
    }
    subgraph cluster_external {
        label="External Factors";
        O [label="Opportunities\n- competitors lack usage pricing\n- unlocks smaller accounts\n- organic expansion revenue", fillcolor="#3b82f6", fontcolor="white"];
        T [label="Threats\n- revenue unpredictability\n- metering unit gaming risk", fillcolor="#f59e0b", fontcolor="black"];
    }

    Subject -> S;
    Subject -> O;
    W -> Rec;
    T -> Rec;
}
```

## Special Cases

- **Empty quadrant**: If a quadrant array is empty, render the node with the text "none identified" rather than omitting the node — the 2×2 grid shape must stay intact even when a quadrant is thin.
- **Prose invariant**: A well-formed SWOT should have at least one item in at least two quadrants (per `skills/think-frameworks/SKILL.md`) — a SWOT with content in only one quadrant is a sign the analysis is incomplete, not that the other three are legitimately empty.
- **Long item lists**: If a quadrant has more than ~4 items, show the top 3-4 in the node and add a "+N more" suffix rather than growing the node unboundedly.
