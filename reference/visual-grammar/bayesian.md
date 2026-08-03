# Visual Grammar: Bayesian

How to render a `bayesian` thought as a diagram.

## Node Structure

- **Hypothesis** → Rounded rectangle (blue, center) with prior probability badge `P(H) = 0.XX` shown inline or as label
- **Alternative hypotheses** → Sibling rectangles (gray) with same sizing
- **Evidence items** → Diamond nodes (orange) with labels `P(E|H)` and `P(E|¬H)`
- **Posterior** → Updated hypothesis node (blue, bold border) below with posterior probability badge `P(H|E) = 0.XX`
- **Bayes factor** → Edge label between evidence and hypothesis

## Edge Semantics

- **Evidence supports hypothesis** → Solid arrow labeled `"P(E|H)=0.9, P(E|¬H)=0.2"`
- **Weak evidence** → Thinner arrow or lighter color
- **Posterior flow** → Bold arrow pointing downward from evidence to posterior
- **Bayes factor** → Edge label showing `BF = P(E|H) / P(E|¬H)`

## Mermaid Template

```mermaid
graph TD
  H["<b>Hypothesis</b><br/>P(H) = 0.30"]
  H_ALT1["Alternative 1<br/>P(A₁) = 0.35"]
  H_ALT2["Alternative 2<br/>P(A₂) = 0.35"]
  
  E1["Evidence 1<br/>P(E|H)=0.9<br/>P(E|¬H)=0.2"]
  
  POST["<b>Posterior</b><br/>P(H|E) = 0.66<br/>Confidence: 0.7"]
  
  E1 -->|BF=4.5| H
  E1 -->|BF=1.8| H_ALT1
  E1 -->|BF=1.8| H_ALT2
  
  H -->|update| POST
  H_ALT1 -->|posterior| POST
  H_ALT2 -->|posterior| POST
  
  style H fill:#e8f4f8,stroke:#0066cc,stroke-width:2px
  style H_ALT1 fill:#f5f5f5,stroke:#999
  style H_ALT2 fill:#f5f5f5,stroke:#999
  style E1 fill:#fff8e8,stroke:#ff9900,stroke-width:2px
  style POST fill:#e8f4f8,stroke:#0066cc,stroke-width:3px
```

## DOT Template

```dot
digraph BayesianReasoning {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fontname="Arial"];

  H [label="Hypothesis H\nP(H) = 0.30\nCaching layer leak", fillcolor="#e8f4f8", color="#0066cc", penwidth=2];
  A1 [label="Alternative A1\nConnection pool", fillcolor="#f5f5f5"];
  A2 [label="Alternative A2\nLog accumulation", fillcolor="#f5f5f5"];
  
  E1 [label="Evidence E1\nHeap dump: cache dominates\nP(E|H) = 0.90\nP(E|¬H) = 0.20", shape=diamond, fillcolor="#fff8e8", color="#ff9900", penwidth=2];
  
  POST [label="Posterior P(H|E)\n= 0.66\nConfidence: 0.70", fillcolor="#e8f4f8", color="#0066cc", penwidth=3];

  H -> E1 [label="P(E|H)=0.9"];
  A1 -> E1 [label="P(E|A1)=0.4"];
  A2 -> E1 [label="P(E|A2)=0.3"];
  
  E1 -> POST [label="BF = 4.5", penwidth=2];
}
```

## Worked Example

Input: "Is the memory leak caused by the caching layer? 30% historical base rate; heap dump shows cache objects dominating." (from bayesian.md)

**Mermaid:**
```mermaid
graph TD
  PRIOR["<b>Prior Belief</b><br/>Cache leak?<br/>P(H) = 0.30<br/>Justification:<br/>30% historical rate"]
  ALT1["Alternative A1<br/>Connection pool<br/>P(A1) = 0.35"]
  ALT2["Alternative A2<br/>Log accumulation<br/>P(A2) = 0.35"]
  
  EV1["Evidence<br/>Heap dump analysis<br/>40% in cache objects<br/>P(E|H) = 0.90<br/>P(E|¬H) = 0.20"]
  
  CALC["Calculation<br/>P(H|E) = (0.9 × 0.3) / ((0.9 × 0.3) + (0.2 × 0.7))<br/>= 0.27 / 0.41<br/>= 0.66"]
  
  POST["<b>Posterior Belief</b><br/>Cache leak<br/>P(H|E) = 0.66<br/>Confidence: 0.70<br/>BF = 4.5"]
  
  SENS["Sensitivity<br/>Prior range: [0.1, 0.5]<br/>Posterior range: [0.33, 0.82]"]
  
  PRIOR --> EV1
  ALT1 --> EV1
  ALT2 --> EV1
  
  EV1 --> CALC
  CALC --> POST
  POST --> SENS
  
  style PRIOR fill:#e8f4f8,stroke:#0066cc,stroke-width:2px
  style ALT1 fill:#f5f5f5,stroke:#999
  style ALT2 fill:#f5f5f5,stroke:#999
  style EV1 fill:#fff8e8,stroke:#ff9900,stroke-width:2px
  style CALC fill:#fffacd,stroke:#ff9900
  style POST fill:#e8f4f8,stroke:#0066cc,stroke-width:3px
  style SENS fill:#fffacd,stroke:#ff9900,stroke-width:2px
```

**DOT:**
```dot
digraph MemoryLeakAnalysis {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fontname="Arial"];

  PRIOR [label="Prior: Cache leak?\nP(H) = 0.30\n\nJustification:\n30% of memory issues\ntraced to caching\nover 18 months", fillcolor="#e8f4f8", color="#0066cc", penwidth=2];

  ALT1 [label="Alternative:\nConnection pool\nP(A1) = 0.35", fillcolor="#f5f5f5"];
  ALT2 [label="Alternative:\nLog accumulation\nP(A2) = 0.35", fillcolor="#f5f5f5"];

  EV1 [label="Evidence:\nHeap dump\nCache: 40% memory\n\nP(E|H) = 0.90\nP(E|¬H) = 0.20", shape=diamond, fillcolor="#fff8e8", color="#ff9900", penwidth=2];

  CALC [label="Calculation:\nP(H|E) = (P(E|H) × P(H)) / (P(E|H)×P(H) + P(E|¬H)×(1-P(H)))\n= (0.9 × 0.3) / ((0.9 × 0.3) + (0.2 × 0.7))\n= 0.27 / 0.41\n= 0.66", fillcolor="#fffacd"];

  POST [label="Posterior: Cache leak?\nP(H|E) = 0.66\nConfidence: 0.70\nBayes Factor: 4.5\n(moderate evidence)", fillcolor="#e8f4f8", color="#0066cc", penwidth=3];

  SENS [label="Sensitivity Analysis:\nIf prior ∈ [0.1, 0.5]\nThen posterior ∈ [0.33, 0.82]", fillcolor="#fffacd", color="#ff9900"];

  PRIOR -> EV1 [label="prior", penwidth=1.5];
  ALT1 -> EV1 [label="alternatives"];
  ALT2 -> EV1 [label="alternatives"];
  EV1 -> CALC [label="apply Bayes"];
  CALC -> POST [label="result"];
  POST -> SENS [label="robustness"];
}
```

## Special Cases

- **Multiple sequential evidence** → Chain evidence nodes vertically; each evidence updates the posterior from the previous step; show intermediate posterior at each stage
- **Weak likelihood ratio** → Show BF close to 1 with lighter edge; add "weak evidence" annotation
- **High sensitivity to prior** → Show sensitivity range with wide spread (e.g., posterior range much wider than prior range); flag with "⚠ Prior sensitive" label
- **Competing hypotheses** → Fan layout with multiple alternative hypotheses at same level; all receive evidence edges; show posterior comparison with highest-posterior hypothesis highlighted
