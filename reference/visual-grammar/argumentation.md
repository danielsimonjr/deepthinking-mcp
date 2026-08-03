# Visual Grammar: Argumentation

How to render an `argumentation` thought as a diagram.

## Node Structure

Toulmin argumentation diagrams are rendered as horizontal chains:
- **Claim** (rectangle or rounded rectangle, center): the thesis or main assertion
- **Grounds** (rectangles, left): evidence or facts supporting the claim
- **Warrant** (rounded rectangle, below grounds): the logical bridge connecting grounds to claim
- **Backing** (box, below warrant): authority or deeper justification for the warrant
- **Qualifier** (annotation on claim): reservation or confidence level (e.g., "likely", "in most cases")
- **Rebuttal** (rectangle with dashed red edge, branching off): counterargument or exception to the claim

## Edge Semantics

- **Solid arrow** (`→`) — Support path: grounds → warrant → backing → claim
- **Dashed red arrow** (`⇢ ⊗`) — Rebuttal: counterargument pointing to the claim
- **Qualifier label** (on claim node) — Hedging: e.g., "Likely", "Probably", "Unless..."

## Mermaid Template

```mermaid
graph LR
    G["Grounds:<br/>Fact or evidence"]
    W["Warrant:<br/>Logical bridge<br/>Why grounds imply claim"]
    B["Backing:<br/>Authority or deep<br/>justification"]
    C["<b>Claim</b><br/>(Likely)<br/>The thesis"]
    R["Rebuttal:<br/>Exception or<br/>counterargument"]
    
    G --> W
    W --> B
    B --> C
    R -.->|Undermines| C
    
    style G fill:#b3d9ff,stroke:#0066cc
    style W fill:#ffe6b3,stroke:#ff9900
    style B fill:#fff9c4,stroke:#f9a825
    style C fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style R fill:#ffcccc,stroke:#cc0000
```

## DOT Template

```dot
digraph Toulmin {
    rankdir=LR;
    node [style="filled"];
    
    G [label="Grounds:\nFact or evidence", shape=box, fillcolor="#b3d9ff"];
    W [label="Warrant:\nLogical bridge\nWhy grounds imply claim", shape=box, fillcolor="#ffe6b3"];
    B [label="Backing:\nAuthority or deep\njustification", shape=box, fillcolor="#fff9c4"];
    C [label="Claim\n(Likely)\nThe thesis", shape=ellipse, fillcolor="#c8e6c9", penwidth=2];
    R [label="Rebuttal:\nException or\ncounterargument", shape=box, fillcolor="#ffcccc"];
    
    G -> W [penwidth=2, color="#0066cc"];
    W -> B [penwidth=2, color="#ff9900"];
    B -> C [penwidth=2, color="#2e7d32"];
    R -> C [label="Undermines", style=dashed, penwidth=2, color="#cc0000"];
}
```

## Worked Example

Based on the "adopt feature flags for all releases" argument from `reference/output-formats/argumentation.md`:

### Mermaid

```mermaid
graph LR
    G["Grounds:<br/>Feature flags reduce<br/>rollback time from<br/>2 hours to 2 minutes<br/>(measured data)"]
    W["Warrant:<br/>Faster rollback<br/>reduces customer impact<br/>and operational stress"]
    B["Backing:<br/>Industry practice<br/>(Netflix, Google)<br/>AWS best practices"]
    C["<b>Claim</b><br/>(Strongly)<br/>Adopt feature flags<br/>for all releases"]
    R["Rebuttal:<br/>Feature flag management<br/>complexity may offset<br/>gains for small teams"]
    
    G --> W
    W --> B
    B --> C
    R -.->|Caveat| C
    
    style G fill:#b3d9ff,stroke:#0066cc
    style W fill:#ffe6b3,stroke:#ff9900
    style B fill:#fff9c4,stroke:#f9a825
    style C fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
    style R fill:#ffcccc,stroke:#cc0000
```

### DOT

```dot
digraph FeatureFlagsArg {
    rankdir=LR;
    node [style="filled"];
    
    G [label="Grounds:\nFeature flags reduce\nrollback time: 2h → 2m\n(measured data)", shape=box, fillcolor="#b3d9ff"];
    W [label="Warrant:\nFaster rollback\nreduces customer impact\nand operational stress", shape=box, fillcolor="#ffe6b3"];
    B [label="Backing:\nIndustry standard\n(Netflix, Google)\nAWS best practices", shape=box, fillcolor="#fff9c4"];
    C [label="Claim\n(Strongly)\nAdopt feature flags\nfor all releases", shape=ellipse, fillcolor="#c8e6c9", penwidth=3];
    R [label="Rebuttal:\nFeature flag management\ncomplexity may offset\ngains for small teams", shape=box, fillcolor="#ffcccc"];
    
    G -> W [penwidth=2, color="#0066cc"];
    W -> B [penwidth=2, color="#ff9900"];
    B -> C [penwidth=3, color="#2e7d32"];
    R -> C [label="Caveat", style=dashed, penwidth=2, color="#cc0000"];
}
```

## Special Cases

- **Multiple grounds**: If the argument has several pieces of evidence, draw multiple ground nodes on the left, all pointing to the warrant.
- **Qualifier strength**: Use stronger/weaker qualifiers (e.g., "Certainly", "Likely", "Possibly", "Probably not") to indicate confidence level.
- **Multiple warrants**: If there are multiple logical pathways from grounds to claim, draw separate warrant nodes in parallel.
- **Nested arguments**: For complex arguments, a single node can be expanded into its own Toulmin diagram (e.g., the backing itself could have grounds, warrant, etc.).
- **Rebuttal resolution**: If the rebuttal is addressed or mitigated, show an edge from the rebuttal to a "Mitigation" or "Response" node that points back to the claim, showing the argument survives the objection.

