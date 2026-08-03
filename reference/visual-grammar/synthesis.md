# Visual Grammar: Synthesis

How to render a `synthesis` thought as a diagram.

## Node Structure

Synthesis diagrams integrate evidence from multiple sources into unified claims:
- **Source nodes** (rectangles at bottom, left-to-right): individual sources or studies with reliability badges
- **Evidence edges** (arrows with labeled weights): evidence strength (strong, medium, weak) from source to synthesized claim
- **Synthesized claims** (rounded rectangles, top): unified, higher-level statements derived from multiple sources
- **Coverage ratio** (donut chart node or labeled ellipse, corner): percentage of topic coverage achieved
- **Reliability badge** (small star or colored dot): source credibility indicator

## Edge Semantics

- **Strong edge** (bold, thick arrow): high-confidence or peer-reviewed evidence
- **Medium edge** (standard arrow): standard-confidence evidence
- **Weak edge** (thin, dashed arrow): lower-confidence or preliminary evidence
- **Coverage label** (percentage on node): what fraction of the topic domain is covered

## Mermaid Template

```mermaid
graph BT
    S1["📄 Source 1<br/>(Peer-reviewed)<br/>★★★"]
    S2["📄 Source 2<br/>(Industry report)<br/>★★"]
    S3["📄 Source 3<br/>(Expert opinion)<br/>★★★"]
    C1["Synthesized Claim 1<br/>Finding A supports<br/>all sources"]
    C2["Synthesized Claim 2<br/>Consensus on<br/>approach B"]
    COVERAGE["Coverage: 85%<br/>(3/4 aspects)"]
    
    S1 -->|Strong| C1
    S2 -->|Medium| C1
    S3 -->|Strong| C2
    S2 -->|Medium| C2
    C1 --> COVERAGE
    C2 --> COVERAGE
    
    style S1 fill:#b3e5fc,stroke:#0277bd
    style S2 fill:#b3e5fc,stroke:#0277bd
    style S3 fill:#b3e5fc,stroke:#0277bd
    style C1 fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style C2 fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style COVERAGE fill:#ffe0b2,stroke:#f57c00,stroke-width:2px
```

## DOT Template

```dot
digraph Synthesis {
    rankdir=BT;
    node [style="filled"];
    
    S1 [label="Source 1\n(Peer-reviewed)\n★★★", shape=box, fillcolor="#b3e5fc"];
    S2 [label="Source 2\n(Industry report)\n★★", shape=box, fillcolor="#b3e5fc"];
    S3 [label="Source 3\n(Expert opinion)\n★★★", shape=box, fillcolor="#b3e5fc"];
    C1 [label="Synthesized Claim 1\nFinding A supports\nall sources", shape=ellipse, fillcolor="#c8e6c9", penwidth=2];
    C2 [label="Synthesized Claim 2\nConsensus on\napproach B", shape=ellipse, fillcolor="#c8e6c9", penwidth=2];
    COVERAGE [label="Coverage: 85%\n(3/4 aspects)", shape=ellipse, fillcolor="#ffe0b2"];
    
    S1 -> C1 [label="Strong", penwidth=3, color="#00aa00"];
    S2 -> C1 [label="Medium", penwidth=2, color="#ffaa00"];
    S3 -> C2 [label="Strong", penwidth=3, color="#00aa00"];
    S2 -> C2 [label="Medium", penwidth=2, color="#ffaa00"];
    C1 -> COVERAGE [penwidth=2, color="#f57c00"];
    C2 -> COVERAGE [penwidth=2, color="#f57c00"];
}
```

## Worked Example

Based on multi-source literature integration from `reference/output-formats/synthesis.md`:

### Mermaid

```mermaid
graph BT
    P1["📄 Paper: Lee et al.<br/>(2022, peer-reviewed)<br/>★★★"]
    I1["📄 Industry Report<br/>Stripe (2023)<br/>★★"]
    C1["📄 Case Study<br/>Company X<br/>★★★"]
    
    Claim1["Synthesis 1:<br/>Fraud detection ML<br/>reduces FPR by<br/>40-60%"]
    Claim2["Synthesis 2:<br/>Real-time processing<br/>critical for adoption"]
    RootClaim["Root Claim:<br/>ML + real-time<br/>is industry standard"]
    
    COVERAGE["Coverage: 90%<br/>(9/10 aspects)"]
    
    P1 -->|Strong| Claim1
    I1 -->|Strong| Claim1
    C1 -->|Medium| Claim1
    I1 -->|Strong| Claim2
    C1 -->|Strong| Claim2
    Claim1 --> RootClaim
    Claim2 --> RootClaim
    RootClaim --> COVERAGE
    
    style P1 fill:#b3e5fc,stroke:#0277bd
    style I1 fill:#b3e5fc,stroke:#0277bd
    style C1 fill:#b3e5fc,stroke:#0277bd
    style Claim1 fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style Claim2 fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style RootClaim fill:#a5d6a7,stroke:#1b5e20,stroke-width:3px
    style COVERAGE fill:#ffe0b2,stroke:#f57c00,stroke-width:2px
```

### DOT

```dot
digraph LiteratureSynthesis {
    rankdir=BT;
    node [style="filled"];
    
    P1 [label="Paper: Lee et al.\n(2022, peer-reviewed)\n★★★", shape=box, fillcolor="#b3e5fc"];
    I1 [label="Industry Report\nStripe (2023)\n★★", shape=box, fillcolor="#b3e5fc"];
    C1 [label="Case Study\nCompany X\n★★★", shape=box, fillcolor="#b3e5fc"];
    
    Claim1 [label="Synthesis 1:\nFraud detection ML\nreduces FPR 40-60%", shape=ellipse, fillcolor="#c8e6c9", penwidth=2];
    Claim2 [label="Synthesis 2:\nReal-time processing\ncritical for adoption", shape=ellipse, fillcolor="#c8e6c9", penwidth=2];
    RootClaim [label="Root Claim:\nML + real-time\nis industry standard", shape=ellipse, fillcolor="#a5d6a7", penwidth=3];
    
    COVERAGE [label="Coverage: 90%\n(9/10 aspects)", shape=ellipse, fillcolor="#ffe0b2"];
    
    P1 -> Claim1 [label="Strong", penwidth=3, color="#00aa00"];
    I1 -> Claim1 [label="Strong", penwidth=3, color="#00aa00"];
    C1 -> Claim1 [label="Medium", penwidth=2, color="#ffaa00"];
    I1 -> Claim2 [label="Strong", penwidth=3, color="#00aa00"];
    C1 -> Claim2 [label="Strong", penwidth=3, color="#00aa00"];
    Claim1 -> RootClaim [penwidth=2, color="#2e7d32"];
    Claim2 -> RootClaim [penwidth=2, color="#2e7d32"];
    RootClaim -> COVERAGE [penwidth=2, color="#f57c00"];
}
```

## Special Cases

- **Conflicting sources**: If sources disagree, draw two parallel edges with different colors (e.g., green for "supports" and red for "contradicts") to the synthesized claim, labeled with the conflict.
- **Source hierarchies**: If sources can be ranked by reliability, arrange them top-to-bottom in the tree with the most reliable at the bottom.
- **Weighted evidence**: Use edge thickness or penwidth to represent evidence strength quantitatively.
- **Coverage tracking**: Show coverage as a percentage in the corner node, and highlight gaps (e.g., "Gap: culture adoption" in a separate callout).
- **Consensus strength**: On synthesized claim nodes, use border thickness or color saturation to indicate consensus level (e.g., strong consensus = bold border, weak = thin).

