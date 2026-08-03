# Visual Grammar: Fishbone (Ishikawa)

How to render a `fishbone` thought as a diagram.

## Node Structure

Fishbone (Ishikawa) diagrams render cause analysis as a **fish skeleton**: a horizontal spine leading to the effect (the fish head), with category "ribs" branching off the spine.

- **Effect** (right end of spine) → A **red rectangle**, the fish's head, containing the `effect` text
- **Category ribs** (branching off the spine) → **purple rectangles**, one per entry in `categories[]`, labeled with `name` (e.g., Manpower, Method, Machine, Material, Measurement, Environment — the "6Ms" — or any domain-specific category set)
- **Cause leaves** (attached to each rib) → **gray small boxes**, one per entry in that category's `causes[]` array, listed under/beside their rib
- **Primary causes** (optional highlight) → Any cause node whose text also appears in the top-level `primaryCauses[]` array is rendered with a **thick red border** to flag it as a priority driver, regardless of which category rib it hangs from

## Edge Semantics

- **Solid purple arrow** — each category rib points toward the spine/effect, mirroring the classic fishbone diagonal-rib layout
- **Thin gray line** — connects each cause leaf to its parent category rib (not a directional arrow — causes are enumerated members of a category, not a causal sequence)
- **Thick red border** (not an edge — a node style) — flags a cause that also appears in `primaryCauses[]`

## Mermaid Template

```mermaid
graph LR
    E["🎯 Effect"]
    C1["Manpower"]
    C2["Method"]
    C3["Machine"]
    C4["Material"]
    C5["Measurement"]
    C6["Environment"]

    C1 --> E
    C2 --> E
    C3 --> E
    C4 --> E
    C5 --> E
    C6 --> E

    C1 --- C1a["cause 1a"]
    C2 --- C2a["cause 2a"]

    style E fill:#ef4444,stroke:#991b1b,color:#fff,stroke-width:3px
    style C1 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C2 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C3 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C4 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C5 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C6 fill:#a855f7,stroke:#6b21a8,color:#fff
```

## DOT Template

```dot
digraph Fishbone {
    rankdir=LR;
    node [shape=box, style="filled,rounded"];

    E [label="Effect", fillcolor="#ef4444", fontcolor="white", penwidth=3];
    C1 [label="Manpower", fillcolor="#a855f7", fontcolor="white"];
    C2 [label="Method", fillcolor="#a855f7", fontcolor="white"];
    C3 [label="Machine", fillcolor="#a855f7", fontcolor="white"];
    C4 [label="Material", fillcolor="#a855f7", fontcolor="white"];
    C5 [label="Measurement", fillcolor="#a855f7", fontcolor="white"];
    C6 [label="Environment", fillcolor="#a855f7", fontcolor="white"];
    C1a [label="cause 1a", fillcolor="#e5e7eb", fontcolor="black"];

    C1 -> E;
    C2 -> E;
    C3 -> E;
    C4 -> E;
    C5 -> E;
    C6 -> E;
    C1a -> C1 [dir=none, color="#6b7280"];
}
```

## Worked Example

Based on the support-backlog scenario in `test/samples/fishbone-valid.json`:

### Mermaid

```mermaid
graph LR
    E["🎯 Ticket backlog<br/>200 to 950 open"]
    C1["Manpower"]
    C2["Method"]
    C3["Machine"]
    C4["Material"]
    C5["Measurement"]
    C6["Environment"]

    C1 --> E
    C2 --> E
    C3 --> E
    C4 --> E
    C5 --> E
    C6 --> E

    C1 --- C1a["⚠️ 2 senior engineers<br/>left, no backfill"]
    C2 --- C2a["⚠️ No triage tiering,<br/>raw FIFO order"]
    C6 --- C6a["⚠️ UI change spiked<br/>confusion tickets"]

    style E fill:#ef4444,stroke:#991b1b,color:#fff,stroke-width:3px
    style C1 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C2 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C3 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C4 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C5 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C6 fill:#a855f7,stroke:#6b21a8,color:#fff
    style C1a fill:#ef4444,stroke:#991b1b,color:#fff,stroke-width:3px
    style C2a fill:#ef4444,stroke:#991b1b,color:#fff,stroke-width:3px
    style C6a fill:#ef4444,stroke:#991b1b,color:#fff,stroke-width:3px
```

### DOT

```dot
digraph FishboneBacklog {
    rankdir=LR;
    node [shape=box, style="filled,rounded"];

    E [label="Ticket backlog\n200 to 950 open", fillcolor="#ef4444", fontcolor="white", penwidth=3];
    C1 [label="Manpower", fillcolor="#a855f7", fontcolor="white"];
    C2 [label="Method", fillcolor="#a855f7", fontcolor="white"];
    C3 [label="Machine", fillcolor="#a855f7", fontcolor="white"];
    C4 [label="Material", fillcolor="#a855f7", fontcolor="white"];
    C5 [label="Measurement", fillcolor="#a855f7", fontcolor="white"];
    C6 [label="Environment", fillcolor="#a855f7", fontcolor="white"];
    C1a [label="2 senior engineers\nleft, no backfill", fillcolor="#ef4444", fontcolor="white", penwidth=3];
    C2a [label="No triage tiering,\nraw FIFO order", fillcolor="#ef4444", fontcolor="white", penwidth=3];
    C6a [label="UI change spiked\nconfusion tickets", fillcolor="#ef4444", fontcolor="white", penwidth=3];

    C1 -> E;
    C2 -> E;
    C3 -> E;
    C4 -> E;
    C5 -> E;
    C6 -> E;
    C1a -> C1 [dir=none, color="#6b7280"];
    C2a -> C2 [dir=none, color="#6b7280"];
    C6a -> C6 [dir=none, color="#6b7280"];
}
```

## Special Cases

- **Fewer than 6 categories**: The schema requires `minItems: 1` on `categories[]`. Render only the ribs actually present — do not pad to the classic 6Ms if the analysis legitimately used fewer categories (e.g., a 4M software-focused variant: Method, Machine, Material, Manpower).
- **`primaryCauses[]` cross-reference**: Match by exact string equality against entries in each category's `causes[]`. A cause that appears in `primaryCauses[]` gets the thick red border regardless of which rib it hangs from — this is the primary visual signal for "where to focus first."
- **When to use `fivewhys` instead**: If there is really only one linear chain of causation rather than independent categories, prefer `fivewhys` — fishbone is for cause analysis that genuinely branches across multiple categories.
