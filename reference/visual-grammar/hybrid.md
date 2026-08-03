# Visual Grammar: Hybrid

How to render a `hybrid` thought as a diagram.

## Node Structure

Hybrid reasoning composes a primary mode with one or more secondary lenses. The diagram uses a **hub-and-spoke layout**:

- **Center diamond**: The primary mode (e.g., "Sequential", "Shannon") positioned at the center
- **Satellite ellipses**: Each secondary feature/lens positioned around the center (e.g., "Causal", "Bayesian", "Shannon")
- **Phase boxes**: Vertical sections labeled "Mode Selection", "Per-Lens Analysis", "Convergence Check" to organize the thought chain
- **Content excerpt**: In each node, show the mode name and a 40-character excerpt of the key insight

Related concepts:
- **Primary mode** → Center diamond in blue
- **Secondary lenses** → Surrounding ellipses in purple
- **Convergence node** → Pill/stadium shape at the bottom, typically green or gold

## Edge Semantics

- **Solid arrow** (`→`) — Data/insight flows from secondary lens back to primary mode
- **Dashed arrow** (`⇢`) — Conditional or probabilistic relationship (for Bayesian lenses)
- **Thick solid arrow** (`⟹`) — Strong consensus from multiple lenses; labeled "converges to"

Edge labels show the relationship type:
- "informs"
- "refines estimate"
- "eliminates option"
- "adds constraint"
- "strengthens confidence"

## Mermaid Template

```mermaid
graph TD
    MS["<b>Mode Selection</b><br/>Choose primary + lenses"]
    
    Primary["<b>Sequential</b><br/>(Primary)"]
    Causal["<b>Causal</b><br/>(Secondary)"]
    Bayesian["<b>Bayesian</b><br/>(Secondary)"]
    Shannon["<b>Shannon</b><br/>(Secondary)"]
    
    Analysis["<b>Per-Lens Analysis</b><br/>Apply each lens"]
    
    Conv["<b>Convergence</b><br/>Synthesize insights<br/>→ Recommendation"]
    
    MS --> Primary
    MS --> Causal
    MS --> Bayesian
    MS --> Shannon
    
    Primary -->|informs| Analysis
    Causal -->|refines| Analysis
    Bayesian -->|adds constraint| Analysis
    Shannon -->|eliminates option| Analysis
    
    Analysis --> Conv
    
    style MS fill:#f59e0b,stroke:#d97706,color:#000
    style Primary fill:#3b82f6,stroke:#1e40af,color:#fff
    style Causal fill:#a855f7,stroke:#7c3aed,color:#fff
    style Bayesian fill:#a855f7,stroke:#7c3aed,color:#fff
    style Shannon fill:#a855f7,stroke:#7c3aed,color:#fff
    style Analysis fill:#f59e0b,stroke:#d97706,color:#000
    style Conv fill:#22c55e,stroke:#16a34a,color:#fff
```

## DOT Template

```dot
digraph Hybrid {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];
    
    MS [label="Mode Selection\nChoose primary + lenses", 
        fillcolor="#f59e0b", fontcolor="black"];
    
    Primary [label="Sequential\n(Primary)", 
             fillcolor="#3b82f6", fontcolor="white", shape=diamond];
    Causal [label="Causal\n(Secondary)", 
            fillcolor="#a855f7", fontcolor="white"];
    Bayesian [label="Bayesian\n(Secondary)", 
              fillcolor="#a855f7", fontcolor="white"];
    Shannon [label="Shannon\n(Secondary)", 
             fillcolor="#a855f7", fontcolor="white"];
    
    Analysis [label="Per-Lens Analysis\nApply each lens", 
              fillcolor="#f59e0b", fontcolor="black"];
    
    Conv [label="Convergence\nSynthesize insights\n→ Recommendation", 
          fillcolor="#22c55e", fontcolor="white"];
    
    MS -> Primary [color="#f59e0b"];
    MS -> Causal [color="#f59e0b"];
    MS -> Bayesian [color="#f59e0b"];
    MS -> Shannon [color="#f59e0b"];
    
    Primary -> Analysis [label="informs", color="#3b82f6", penwidth=2];
    Causal -> Analysis [label="refines", color="#a855f7", penwidth=2];
    Bayesian -> Analysis [label="adds\nconstraint", color="#a855f7", penwidth=2];
    Shannon -> Analysis [label="eliminates\noption", color="#a855f7", penwidth=2];
    
    Analysis -> Conv [color="#22c55e", penwidth=3];
}
```

## Worked Example

Based on the Rust auth rewrite decision from `reference/output-formats/hybrid.md`:

### Mermaid

```mermaid
graph TD
    MS["<b>Mode Selection</b><br/>Rust rewrite decision"]
    
    Primary["<b>Sequential</b><br/>(Primary frame)<br/>Decision chain: safety<br/>→ viability → timing"]
    Causal["<b>Causal</b><br/>(Lens 1)<br/>Does Rust fix actual<br/>failure mode?"]
    Bayesian["<b>Bayesian</b><br/>(Lens 2)<br/>P(on-time | 2 engineers,<br/>6 weeks)?"]
    Shannon["<b>Shannon</b><br/>(Lens 3)<br/>Constraints: zero-DT,<br/>backward-compat"]
    
    Analysis["<b>Per-Lens Analysis</b><br/>1. Memory safety → 20%<br/>2. P ≈ 0.35 (below 0.7)<br/>3. Constraints rule out<br/>big-bang rewrite"]
    
    Conv["<b>Convergence</b><br/>Do not rewrite now.<br/>Harden expiry-validation,<br/>reassess Q3"]
    
    MS --> Primary
    MS --> Causal
    MS --> Bayesian
    MS --> Shannon
    
    Primary -->|frames decision| Analysis
    Causal -->|narrows failure mode| Analysis
    Bayesian -->|adds threshold| Analysis
    Shannon -->|eliminates option| Analysis
    
    Analysis --> Conv
    
    style MS fill:#f59e0b,stroke:#d97706,color:#000
    style Primary fill:#3b82f6,stroke:#1e40af,color:#fff
    style Causal fill:#a855f7,stroke:#7c3aed,color:#fff
    style Bayesian fill:#a855f7,stroke:#7c3aed,color:#fff
    style Shannon fill:#a855f7,stroke:#7c3aed,color:#fff
    style Analysis fill:#f59e0b,stroke:#d97706,color:#000
    style Conv fill:#22c55e,stroke:#16a34a,color:#fff
```

### DOT

```dot
digraph HybridAuth {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];
    
    MS [label="Mode Selection\nRust rewrite decision", 
        fillcolor="#f59e0b", fontcolor="black"];
    
    Primary [label="Sequential\n(Primary frame)\nDecision chain: safety\n→ viability → timing", 
             fillcolor="#3b82f6", fontcolor="white", shape=diamond];
    Causal [label="Causal (Lens 1)\nDoes Rust fix actual\nfailure mode?", 
            fillcolor="#a855f7", fontcolor="white"];
    Bayesian [label="Bayesian (Lens 2)\nP(on-time | 2 eng,\n6 weeks)?", 
              fillcolor="#a855f7", fontcolor="white"];
    Shannon [label="Shannon (Lens 3)\nConstraints: zero-DT,\nbackward-compat", 
             fillcolor="#a855f7", fontcolor="white"];
    
    Analysis [label="Per-Lens Analysis\n1. Memory safety → 20%\n2. P ≈ 0.35 (below 0.7)\n3. Constraints rule out\nbig-bang rewrite", 
              fillcolor="#f59e0b", fontcolor="black"];
    
    Conv [label="Convergence\nDo not rewrite now.\nHarden expiry-validation,\nreassess Q3", 
          fillcolor="#22c55e", fontcolor="white"];
    
    MS -> Primary [color="#f59e0b"];
    MS -> Causal [color="#f59e0b"];
    MS -> Bayesian [color="#f59e0b"];
    MS -> Shannon [color="#f59e0b"];
    
    Primary -> Analysis [label="frames\ndecision", color="#3b82f6", penwidth=2];
    Causal -> Analysis [label="narrows\nfailure mode", color="#a855f7", penwidth=2];
    Bayesian -> Analysis [label="adds\nthreshold", color="#a855f7", penwidth=2];
    Shannon -> Analysis [label="eliminates\noption", color="#a855f7", penwidth=2];
    
    Analysis -> Conv [color="#22c55e", penwidth=3];
}
```

## Special Cases

- **Mode switching**: If the hybrid thought spans multiple distinct analysis phases (each with its own primary mode), render them as vertically stacked sections with clear phase labels ("Phase 1: Sequential", "Phase 2: Causal", etc.).
- **Per-lens thoughts**: When `thoughtType == "per_lens"`, highlight the active lens with a thicker border and show its specific contribution (e.g., "Bayesian narrows confidence to 0.35").
- **Convergence check**: When `thoughtType == "convergence_check"`, use a green pill/stadium shape for the final synthesis node and draw bold convergence arrows from all secondary lenses.
- **Mathematical model**: If `mathematicalModel` is present, render a small code block or node showing the LaTeX or symbolic form as a supplementary detail.

