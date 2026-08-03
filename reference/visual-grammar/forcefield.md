# Visual Grammar: Force Field Analysis

How to render a `forcefield` thought as a diagram.

## Node Structure

Force Field Analysis is rendered as **opposing horizontal arrows pushing toward a center line** representing the proposed `change` — driving forces push from the left, restraining forces push from the right.

- **Change** (center line/node) → a **gray vertical bar or box**, the fulcrum both force sets push against
- **Driving forces** (left side, pushing right toward the change) → **green arrows**, one per entry in `drivingForces[]`, each labeled with `force` text and sized/annotated by `strength` (1-5)
- **Restraining forces** (right side, pushing left against the change) → **red arrows**, one per entry in `restrainingForces[]`, each labeled with `force` text and sized/annotated by `strength` (1-5)
- **Net Assessment** (optional, below the diagram) → a **gold box** summarizing which side currently dominates
- **Recommendation** (optional, bottom) → a **blue box** with the action to shift the balance

## Edge Semantics

- **Thick green arrow pointing right** — a driving force; arrow thickness/weight should scale with `strength` (1 = thin, 5 = thick) so the diagram visually communicates which forces matter most, not just which exist
- **Thick red arrow pointing left** — a restraining force; same strength-to-thickness scaling
- Both arrow sets terminate at the central `Change` node — this is the one place the grammar deviates from a typical top-down/left-right flow graph, since the visual point of Force Field Analysis is the head-on opposition, not a directed pipeline

## Mermaid Template

```mermaid
graph LR
    subgraph Driving["Driving Forces"]
        D1["➡️ force 1 (strength N)"]
        D2["➡️ force 2 (strength N)"]
    end

    Change["⚖️ Change"]

    subgraph Restraining["Restraining Forces"]
        R1["⬅️ force 1 (strength N)"]
        R2["⬅️ force 2 (strength N)"]
    end

    D1 --> Change
    D2 --> Change
    R1 --> Change
    R2 --> Change

    Net["📊 Net Assessment"]
    Rec["✓ Recommendation"]
    Change --> Net --> Rec

    style D1 fill:#22c55e,stroke:#16a34a,color:#fff
    style D2 fill:#22c55e,stroke:#16a34a,color:#fff
    style R1 fill:#ef4444,stroke:#991b1b,color:#fff
    style R2 fill:#ef4444,stroke:#991b1b,color:#fff
    style Change fill:#9ca3af,stroke:#4b5563,color:#000
```

## DOT Template

```dot
digraph ForceField {
    rankdir=LR;
    node [shape=box, style="filled,rounded"];

    Change [label="Change", shape=diamond, fillcolor="#9ca3af", fontcolor="black"];
    Net [label="Net Assessment", fillcolor="#f59e0b", fontcolor="black"];
    Rec [label="Recommendation", fillcolor="#3b82f6", fontcolor="white"];

    subgraph cluster_driving {
        label="Driving Forces";
        D1 [label="force 1 (strength N)", fillcolor="#22c55e", fontcolor="white"];
        D2 [label="force 2 (strength N)", fillcolor="#22c55e", fontcolor="white"];
    }
    subgraph cluster_restraining {
        label="Restraining Forces";
        R1 [label="force 1 (strength N)", fillcolor="#ef4444", fontcolor="white"];
        R2 [label="force 2 (strength N)", fillcolor="#ef4444", fontcolor="white"];
    }

    D1 -> Change [penwidth=3, color="#16a34a"];
    D2 -> Change [penwidth=2, color="#16a34a"];
    R1 -> Change [penwidth=3, color="#991b1b"];
    R2 -> Change [penwidth=2, color="#991b1b"];
    Change -> Net;
    Net -> Rec;
}
```

## Worked Example

Based on the continuous-deployment scenario in `test/samples/forcefield-valid.json`:

### Mermaid

```mermaid
graph LR
    subgraph Driving["Driving Forces"]
        D1["➡️ Competitors ship fixes<br/>in days vs. our quarter (5)"]
        D2["➡️ CI/CD pipeline with<br/>canary deploys exists (4)"]
        D3["➡️ Leadership publicly<br/>committed (3)"]
    end

    Change["⚖️ Weekly continuous<br/>deployment"]

    subgraph Restraining["Restraining Forces"]
        R1["⬅️ 2-week manual billing<br/>regression pass (5)"]
        R2["⬅️ Skepticism after prior<br/>rushed-release outage (4)"]
        R3["⬅️ Contracts require quarterly<br/>notification window (3)"]
    end

    D1 --> Change
    D2 --> Change
    D3 --> Change
    R1 --> Change
    R2 --> Change
    R3 --> Change

    Net["📊 12 vs. 12 — blocked<br/>at parity by fixable gaps"]
    Rec["✓ Automate billing regression<br/>+ renegotiate notice clause"]
    Change --> Net --> Rec

    style D1 fill:#22c55e,stroke:#16a34a,color:#fff
    style D2 fill:#22c55e,stroke:#16a34a,color:#fff
    style D3 fill:#22c55e,stroke:#16a34a,color:#fff
    style R1 fill:#ef4444,stroke:#991b1b,color:#fff
    style R2 fill:#ef4444,stroke:#991b1b,color:#fff
    style R3 fill:#ef4444,stroke:#991b1b,color:#fff
    style Change fill:#9ca3af,stroke:#4b5563,color:#000
```

### DOT

```dot
digraph ForceFieldDeploy {
    rankdir=LR;
    node [shape=box, style="filled,rounded"];

    Change [label="Weekly continuous\ndeployment", shape=diamond, fillcolor="#9ca3af", fontcolor="black"];
    Net [label="12 vs. 12 - blocked\nat parity by fixable gaps", fillcolor="#f59e0b", fontcolor="black"];
    Rec [label="Automate billing regression\n+ renegotiate notice clause", fillcolor="#3b82f6", fontcolor="white"];

    subgraph cluster_driving {
        label="Driving Forces";
        D1 [label="Competitors ship fixes\nin days vs. our quarter (5)", fillcolor="#22c55e", fontcolor="white"];
        D2 [label="CI/CD pipeline with\ncanary deploys exists (4)", fillcolor="#22c55e", fontcolor="white"];
        D3 [label="Leadership publicly\ncommitted (3)", fillcolor="#22c55e", fontcolor="white"];
    }
    subgraph cluster_restraining {
        label="Restraining Forces";
        R1 [label="2-week manual billing\nregression pass (5)", fillcolor="#ef4444", fontcolor="white"];
        R2 [label="Skepticism after prior\nrushed-release outage (4)", fillcolor="#ef4444", fontcolor="white"];
        R3 [label="Contracts require quarterly\nnotification window (3)", fillcolor="#ef4444", fontcolor="white"];
    }

    D1 -> Change [penwidth=5, color="#16a34a"];
    D2 -> Change [penwidth=4, color="#16a34a"];
    D3 -> Change [penwidth=3, color="#16a34a"];
    R1 -> Change [penwidth=5, color="#991b1b"];
    R2 -> Change [penwidth=4, color="#991b1b"];
    R3 -> Change [penwidth=3, color="#991b1b"];
    Change -> Net;
    Net -> Rec;
}
```

## Special Cases

- **Strength-to-thickness mapping**: Use `penwidth` (DOT) or a visual weight cue in the node label (Mermaid, which lacks per-edge thickness styling in the plain flowchart syntax) equal to the `strength` integer (1-5) so viewers can see which forces dominate at a glance, not just count them.
- **Tied totals**: When the sum of driving strengths equals the sum of restraining strengths (as in the worked example: 12 vs. 12), the diagram should still render both sides fully — a tie is a legitimate, informative outcome ("blocked by addressable gaps," not "no forces exist") and must not be visually collapsed or hidden.
- **Missing `netAssessment`/`recommendation`**: Both are optional in the schema; omit the `Net`/`Rec` nodes entirely rather than rendering them empty if absent from the thought.
