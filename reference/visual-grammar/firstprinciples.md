# Visual Grammar: First Principles

How to render a `firstprinciples` thought as a diagram.

## Node Structure

First principles diagrams show a tree of reasoning from foundational axioms and definitions upward to a conclusion. Structure:
- **Principle nodes** (bottom row): Leaf nodes representing axioms, definitions, observations, and assumptions
  - **Axioms** (double-border rectangles): Self-evident, need no justification
  - **Definitions** (rounded rectangles): Agreed meanings
  - **Observations** (plain rectangles): Empirical facts; labeled with confidence (0-1)
  - **Assumptions** (dashed rectangles): Contextual claims; labeled with confidence (0-1)
- **Derivation nodes** (middle rows): Intermediate inference steps building upward
- **Conclusion node** (top): Final derived statement with certainty score and limitations
- **Dependency edges** (labeled arrows): Show logical flow and inference type

Node colors:
- **Blue**: Principle nodes (foundational)
- **Green**: Derivation nodes (intermediate inferences)
- **Gold/Yellow**: Conclusion node (final derived statement)
- **Red**: Assumptions or low-confidence observations requiring caution

## Edge Semantics

- **Solid arrow** (`→`) — Direct logical inference from principle(s)
- **Thick solid arrow** (`⟹`) — Strong inference (high confidence)
- **Dashed arrow** (`⇢`) — Weak inference (requires assumption or has low confidence)
- **Curved arrow** — Indirect reference; principle is cited but not directly applied
- **Edge label** — Inference rule or reasoning type (e.g., "modus ponens", "universal instantiation")

## Mermaid Template

```mermaid
graph BT
    Ax1["<b>Axiom p1</b><br/>A verifier can only<br/>distinguish identities<br/>it has prior knowledge of"]
    Ax2["<b>Axiom p2</b><br/>Proof requires presenting<br/>something the verifier<br/>can check"]
    
    Obs1["<b>Observation p3</b><br/>Artifacts fall into<br/>three categories:<br/>know, have, are<br/>(confidence: 0.95)"]
    
    Def1["<b>Definition p0</b><br/>Authentication = verify<br/>entity is who it claims"]
    
    Step1["<b>Step 1</b><br/>Auth is a binary<br/>match/no-match decision"]
    Step2["<b>Step 2</b><br/>Requires prior enrollment<br/>of reference"]
    Step3["<b>Step 3</b><br/>Prover must present<br/>checkable artifact"]
    Step4["<b>Step 4</b><br/>Artifact is one of<br/>three canonical types"]
    
    Conclusion["<b>CONCLUSION</b><br/>Auth requires: (1) prior enrollment,<br/>(2) checkable artifact,<br/>(3) freshness mechanism<br/>Certainty: 0.92<br/>Limitations: Physical proofs,<br/>ZK proofs, implicit enrollment"]
    
    Def1 --> Step1
    Ax1 --> Step2
    Ax2 --> Step3
    Obs1 --> Step4
    
    Step1 --> Conclusion
    Step2 --> Conclusion
    Step3 --> Conclusion
    Step4 --> Conclusion
    
    style Ax1 fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    style Ax2 fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    style Def1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Obs1 fill:#f97316,stroke:#c2410c,color:#fff
    style Step1 fill:#10b981,stroke:#047857,color:#fff
    style Step2 fill:#10b981,stroke:#047857,color:#fff
    style Step3 fill:#10b981,stroke:#047857,color:#fff
    style Step4 fill:#10b981,stroke:#047857,color:#fff
    style Conclusion fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:3px
```

## DOT Template

```dot
digraph FirstPrinciples {
    rankdir=BT;
    
    node [shape=box, style="filled"];
    Ax1 [label="AXIOM p1\nVerifier can only distinguish\nidentities with prior knowledge", 
         fillcolor="#3b82f6", fontcolor="white", penwidth=3];
    Ax2 [label="AXIOM p2\nProof requires checkable\nartefact", 
         fillcolor="#3b82f6", fontcolor="white", penwidth=3];
    Def1 [label="DEFINITION p0\nAuthentication = verify\nclaim of identity", 
          fillcolor="#3b82f6", fontcolor="white"];
    
    node [shape=box];
    Obs1 [label="OBSERVATION p3\nArtefacts: know, have, are\n(confidence: 0.95)", 
          fillcolor="#f97316", fontcolor="white"];
    
    node [shape=box];
    Step1 [label="Step 1\nAuth is binary decision\n(match / no-match)", 
           fillcolor="#10b981", fontcolor="white"];
    Step2 [label="Step 2\nRequires prior enrollment\nof reference", 
           fillcolor="#10b981", fontcolor="white"];
    Step3 [label="Step 3\nProver presents\ncheckable artefact", 
           fillcolor="#10b981", fontcolor="white"];
    Step4 [label="Step 4\nArtefact is one of\nthree canonical types", 
           fillcolor="#10b981", fontcolor="white"];
    
    node [shape=box];
    Conclusion [label="CONCLUSION\nAuth requires:\n(1) prior enrollment\n(2) checkable artefact\n(3) freshness mechanism\nCertainty: 0.92", 
                fillcolor="#fbbf24", fontcolor="#000", penwidth=3];
    
    Def1 -> Step1 [color="#1e40af", label="definition"];
    Ax1 -> Step2 [color="#1e40af", label="axiom"];
    Ax2 -> Step3 [color="#1e40af", label="axiom"];
    Obs1 -> Step4 [color="#c2410c", label="observation"];
    
    Step1 -> Conclusion [color="#047857", penwidth=2];
    Step2 -> Conclusion [color="#047857", penwidth=2];
    Step3 -> Conclusion [color="#047857", penwidth=2];
    Step4 -> Conclusion [color="#047857", penwidth=2];
}
```

## Worked Example

Based on "What does authentication actually require?" from `reference/output-formats/firstprinciples.md`:

### Mermaid

```mermaid
graph BT
    p0["<b>Def p0</b><br/>Authentication =<br/>verify claim of identity"]
    p1["<b>Ax p1</b><br/>Verifier can only<br/>distinguish what it<br/>has prior knowledge of"]
    p2["<b>Ax p2</b><br/>Proof needs<br/>checkable artefact"]
    p3["<b>Obs p3</b><br/>Artefacts:<br/>know, have, are<br/>confidence: 0.95"]
    
    s1["Step 1<br/>Auth = binary<br/>match/no-match"]
    s2["Step 2<br/>Requires prior<br/>enrollment"]
    s3["Step 3<br/>Must present<br/>artefact"]
    s4["Step 4<br/>One of three<br/>canonical types"]
    
    con["<b>CONCLUSION</b><br/>Auth requires:<br/>1. Prior enrollment<br/>2. Checkable artefact<br/>3. Freshness (replay)<br/>Certainty: 0.92<br/><br/>Limitations:<br/>- Physical presence<br/>- Zero-knowledge proofs"]
    
    p0 --> s1
    p1 --> s2
    p2 --> s3
    p3 --> s4
    
    s1 --> con
    s2 --> con
    s3 --> con
    s4 --> con
    
    style p0 fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
    style p1 fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    style p2 fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    style p3 fill:#f97316,stroke:#c2410c,color:#fff
    style s1 fill:#10b981,stroke:#047857,color:#fff
    style s2 fill:#10b981,stroke:#047857,color:#fff
    style s3 fill:#10b981,stroke:#047857,color:#fff
    style s4 fill:#10b981,stroke:#047857,color:#fff
    style con fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:3px
```

### DOT

```dot
digraph AuthenticationPrinciples {
    rankdir=BT;
    
    node [shape=box, style="filled"];
    p0 [label="Definition p0\nAuthentication = verify identity", 
        fillcolor="#3b82f6", fontcolor="white"];
    p1 [label="Axiom p1\nVerifier can only distinguish\nwhat it has prior knowledge of", 
        fillcolor="#3b82f6", fontcolor="white", penwidth=3];
    p2 [label="Axiom p2\nProof requires\ncheckable artefact", 
        fillcolor="#3b82f6", fontcolor="white", penwidth=3];
    p3 [label="Observation p3\nArtefacts: know, have, are\nconfidence: 0.95", 
        fillcolor="#f97316", fontcolor="white"];
    
    s1 [label="Step 1: Binary match/no-match", fillcolor="#10b981", fontcolor="white"];
    s2 [label="Step 2: Prior enrollment required", fillcolor="#10b981", fontcolor="white"];
    s3 [label="Step 3: Present checkable artefact", fillcolor="#10b981", fontcolor="white"];
    s4 [label="Step 4: One of three types", fillcolor="#10b981", fontcolor="white"];
    
    Conclusion [label="CONCLUSION\nAuth requires:\n(1) Prior enrollment\n(2) Checkable artefact\n(3) Freshness (replay prevention)\nCertainty: 0.92\n\nLimitations:\n- Physical presence proofs\n- Zero-knowledge proofs\n- Implicit/federated enrollment", 
                fillcolor="#fbbf24", fontcolor="#000", penwidth=3];
    
    p0 -> s1 [color="#1e40af"];
    p1 -> s2 [color="#1e40af"];
    p2 -> s3 [color="#1e40af"];
    p3 -> s4 [color="#c2410c"];
    
    s1 -> Conclusion [color="#047857", penwidth=2];
    s2 -> Conclusion [color="#047857", penwidth=2];
    s3 -> Conclusion [color="#047857", penwidth=2];
    s4 -> Conclusion [color="#047857", penwidth=2];
}
```

## Special Cases

- **Axiom indicators**: Render axioms with a double border (`penwidth=3`) or special styling (bold text) to signal unquestionable foundations.
- **Confidence annotations**: For observations and assumptions, include the confidence score (0-1) as a label on the node; color-code low-confidence nodes in red or orange to flag risky foundations.
- **Derivation rule labels**: On edges, annotate the inference rule used (e.g., "modus ponens", "universal instantiation", "definition", "axiom").
- **Certainty propagation**: The conclusion's certainty should not exceed the minimum confidence of any cited principle. Optionally highlight this with color fading if a low-confidence principle is involved.
- **Alternative interpretations**: If multiple valid readings of the same principles exist, show them as separate branches from a shared set of principles, with different conclusions drawn.
- **Limitations box**: Always include a "Limitations" or "Scope" section in the conclusion node, explicitly stating edge cases and conditions under which the derivation may not hold.
