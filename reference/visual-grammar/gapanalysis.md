# Visual Grammar: Gap Analysis

How to render a `gapanalysis` thought as a diagram.

## Node Structure

Gap Analysis is rendered as **current → gap → desired lanes** — one horizontal lane per dimension, showing the current state on the left, the gap in the middle, and the desired state on the right, converging into an action plan.

- **Current-state column** (left) → one node per entry in `gaps[]`, labeled with `dimension` and `current`
- **Gap column** (middle) → one node per entry in `gaps[]`, labeled with `gap`; visually distinct (amber/warning color) since this is the delta being closed
- **Desired-state column** (right) → one node per entry in `gaps[]`, labeled with `desired`
- **Action nodes** (below each lane, or aggregated) → one per `gaps[].action`, or the aggregated `actionPlan[]` sequence if present
- **Overall current/desired** (top banner, optional) → two summary nodes for the top-level `currentState`/`desiredState` strings, framing all per-dimension lanes

## Edge Semantics

- Each lane flows **current → gap → desired** (solid directed edges) — this is a "closing the gap" narrative, not a causal claim
- Each **gap** node also connects down to its **action** node — the action is what closes that specific gap
- If `actionPlan[]` is present, its entries chain in sequence (dashed edges) below all lanes, representing the ordered execution plan across dimensions

## Mermaid Template

```mermaid
graph LR
    subgraph Dim1["Dimension 1"]
        direction LR
        Cur1["Current"] --> Gap1["Gap"] --> Des1["Desired"]
        Gap1 -.-> Act1["Action"]
    end

    subgraph Dim2["Dimension 2"]
        direction LR
        Cur2["Current"] --> Gap2["Gap"] --> Des2["Desired"]
        Gap2 -.-> Act2["Action"]
    end

    Act1 --> Plan["Action Plan (ordered)"]
    Act2 --> Plan

    style Gap1 fill:#f59e0b,stroke:#d97706,color:#000
    style Gap2 fill:#f59e0b,stroke:#d97706,color:#000
    style Plan fill:#3b82f6,stroke:#1d4ed8,color:#fff
```

## DOT Template

```dot
digraph GapAnalysis {
    rankdir=LR;
    node [shape=box, style="filled,rounded"];

    subgraph cluster_dim1 {
        label="Dimension 1";
        Cur1 [label="Current", fillcolor="#e5e7eb"];
        Gap1 [label="Gap", fillcolor="#f59e0b", fontcolor="black"];
        Des1 [label="Desired", fillcolor="#bbf7d0"];
        Act1 [label="Action", fillcolor="#dbeafe"];
        Cur1 -> Gap1 -> Des1;
        Gap1 -> Act1 [style=dashed];
    }

    subgraph cluster_dim2 {
        label="Dimension 2";
        Cur2 [label="Current", fillcolor="#e5e7eb"];
        Gap2 [label="Gap", fillcolor="#f59e0b", fontcolor="black"];
        Des2 [label="Desired", fillcolor="#bbf7d0"];
        Act2 [label="Action", fillcolor="#dbeafe"];
        Cur2 -> Gap2 -> Des2;
        Gap2 -> Act2 [style=dashed];
    }

    Plan [label="Action Plan (ordered)", fillcolor="#3b82f6", fontcolor="white"];
    Act1 -> Plan;
    Act2 -> Plan;
}
```

## Worked Example

Based on the incident-response maturity scenario in `test/samples/gapanalysis-valid.json`:

### Mermaid

```mermaid
graph LR
    subgraph Dim1["Alerting and escalation"]
        direction LR
        Cur1["Shared Slack channel,<br/>no owner"] --> Gap1["No ownership model<br/>or escalation tooling"] --> Des1["Formal on-call rotation<br/>with tiered escalation"]
        Gap1 -.-> Act1["Adopt paging tool,<br/>define 2-tier escalation (Q1)"]
    end

    subgraph Dim2["Runbooks"]
        direction LR
        Cur2["Zero written runbooks"] --> Gap2["10 runbooks need<br/>authoring + validation"] --> Des2["Top 10 recurring types<br/>have tested runbooks"]
        Gap2 -.-> Act2["1 runbook/engineer/sprint<br/>from top-10 incident mining"]
    end

    subgraph Dim3["Postmortem discipline"]
        direction LR
        Cur3["~25% of incidents<br/>get a postmortem"] --> Gap3["No enforced trigger,<br/>no action tracking"] --> Des3["100% SEV1/2 postmortems,<br/>tracked action items"]
        Gap3 -.-> Act3["Mandatory postmortem for<br/>SEV1/2 closure + tracking"]
    end

    Act1 --> Plan["Action Plan: rotation +<br/>runbooks (Q1-Q2) + postmortem<br/>discipline, audited Q2"]
    Act2 --> Plan
    Act3 --> Plan

    style Gap1 fill:#f59e0b,stroke:#d97706,color:#000
    style Gap2 fill:#f59e0b,stroke:#d97706,color:#000
    style Gap3 fill:#f59e0b,stroke:#d97706,color:#000
    style Plan fill:#3b82f6,stroke:#1d4ed8,color:#fff
```

### DOT

```dot
digraph GapAnalysisIncidentResponse {
    rankdir=LR;
    node [shape=box, style="filled,rounded"];

    subgraph cluster_alerting {
        label="Alerting and escalation";
        Cur1 [label="Shared Slack channel, no owner", fillcolor="#e5e7eb"];
        Gap1 [label="No ownership model or escalation tooling", fillcolor="#f59e0b", fontcolor="black"];
        Des1 [label="Formal on-call rotation with tiered escalation", fillcolor="#bbf7d0"];
        Act1 [label="Adopt paging tool, define 2-tier escalation (Q1)", fillcolor="#dbeafe"];
        Cur1 -> Gap1 -> Des1;
        Gap1 -> Act1 [style=dashed];
    }

    subgraph cluster_runbooks {
        label="Runbooks";
        Cur2 [label="Zero written runbooks", fillcolor="#e5e7eb"];
        Gap2 [label="10 runbooks need authoring + validation", fillcolor="#f59e0b", fontcolor="black"];
        Des2 [label="Top 10 recurring types have tested runbooks", fillcolor="#bbf7d0"];
        Act2 [label="1 runbook/engineer/sprint from top-10 mining", fillcolor="#dbeafe"];
        Cur2 -> Gap2 -> Des2;
        Gap2 -> Act2 [style=dashed];
    }

    subgraph cluster_postmortems {
        label="Postmortem discipline";
        Cur3 [label="~25% of incidents get a postmortem", fillcolor="#e5e7eb"];
        Gap3 [label="No enforced trigger, no action tracking", fillcolor="#f59e0b", fontcolor="black"];
        Des3 [label="100% SEV1/2 postmortems, tracked actions", fillcolor="#bbf7d0"];
        Act3 [label="Mandatory postmortem for SEV1/2 closure", fillcolor="#dbeafe"];
        Cur3 -> Gap3 -> Des3;
        Gap3 -> Act3 [style=dashed];
    }

    Plan [label="Action Plan: rotation + runbooks (Q1-Q2)\n+ postmortem discipline, audited Q2", fillcolor="#3b82f6", fontcolor="white"];
    Act1 -> Plan;
    Act2 -> Plan;
    Act3 -> Plan;
}
```

## Special Cases

- **One lane per `gaps[]` entry, always**: unlike PESTLE's fixed six lanes, `gapanalysis` has as many lanes as `gaps[]` has entries (`minItems: 1`) — do not force a fixed number of dimensions.
- **`actionPlan[]` is optional and sequence-level, not per-gap**: if present, it represents the *ordered execution plan* across all dimensions (which may interleave or reorder individual `gaps[].action` items) and renders as a separate dashed chain below the lanes, distinct from the direct `gap → action` edge within each lane.
- **Overall `currentState`/`desiredState` frame the lanes**: these two top-level strings are not another dimension — render them (if at all) as a banner above the lanes, not as a fifth lane, to avoid double-counting against the per-dimension `current`/`desired` pairs.
