# Visual Grammar: Scientific Method

How to render a `scientificmethod` thought as a diagram.

## Node Structure

Scientific method thoughts are hypothesis-driven experimentation cycles. Each node represents a phase:
- **Hypothesis** (rounded rectangle, light blue): null hypothesis and alternative hypothesis side-by-side in the node
- **Prediction** (hexagon, blue): expected outcome based on the hypothesis
- **Experiment** (diamond, gold): design and procedure
- **Observation** (parallelogram, green for confirmed, red for refuted): measured result
- **Revision** (curved arrow back to hypothesis): falsifiability checkpoint

The cycle loops: hypothesis → prediction → experiment → observation → revise (if falsified) or conclude (if confirmed).

## Edge Semantics

- **Solid arrow** (`→`) — Main cycle progression: hypothesis to prediction to experiment to observation
- **Curved arrow** (`⤵`) — Revision loop: observation back to hypothesis when result contradicts prediction (falsification)
- **Thick solid arrow** (`⟹`) — Confirmed conclusion: observation to final conclusion box when hypothesis is supported

## Mermaid Template

```mermaid
graph TB
    H["<b>Hypothesis</b><br/>H₀: no effect<br/>H₁: expected effect"]
    P["<b>Prediction</b><br/>If H₁ true, then<br/>outcome X occurs"]
    E["<b>Experiment</b><br/>Design:<br/>IV, DV, controls"]
    O["<b>Observation</b><br/>Result: outcome Y<br/>measured"]
    C["<b>Conclusion</b><br/>Accept/Reject H₀<br/>confidence level"]
    
    H --> P
    P --> E
    E --> O
    O --> C
    O -.->|Falsified| H
    
    style H fill:#b3d9ff,stroke:#0066cc,color:#000
    style P fill:#66b3ff,stroke:#0047b3,color:#fff
    style E fill:#ffd699,stroke:#ff9500,color:#000
    style O fill:#99ff99,stroke:#00b300,color:#000
    style C fill:#66ff66,stroke:#009900,color:#000
```

## DOT Template

```dot
digraph ScientificMethod {
    rankdir=TB;
    node [style="filled"];
    
    H [label="Hypothesis\nH₀: no effect\nH₁: expected effect", 
       shape=box, fillcolor="#b3d9ff", fontcolor="#000"];
    P [label="Prediction\nIf H₁ true, then\noutcome X occurs", 
       shape=hexagon, fillcolor="#66b3ff", fontcolor="#fff"];
    E [label="Experiment\nDesign:\nIV, DV, controls", 
       shape=diamond, fillcolor="#ffd699", fontcolor="#000"];
    O [label="Observation\nResult: outcome Y\nmeasured", 
       shape=box, fillcolor="#99ff99", fontcolor="#000"];
    C [label="Conclusion\nAccept/Reject H₀\nconfidence level", 
       shape=ellipse, fillcolor="#66ff66", fontcolor="#000"];
    
    H -> P [color="#0066cc", penwidth=2];
    P -> E [color="#0047b3", penwidth=2];
    E -> O [color="#ff9500", penwidth=2];
    O -> C [color="#009900", penwidth=2];
    O -> H [label="Falsified", style=dashed, color="#ff0000", penwidth=2];
}
```

## Worked Example

Based on the HTTP/2 vs HTTP/1.1 latency A/B test from `reference/output-formats/scientificmethod.md`:

### Mermaid

```mermaid
graph TB
    H["<b>Hypothesis</b><br/>H₀: HTTP/2 latency = HTTP/1.1<br/>H₁: HTTP/2 latency &lt; HTTP/1.1"]
    P["<b>Prediction</b><br/>If multiplexing works,<br/>p99 latency &lt; 45ms"]
    E["<b>Experiment</b><br/>A/B test: 10k requests<br/>IV: HTTP version<br/>DV: p99 latency"]
    O["<b>Observation</b><br/>HTTP/2: p99 42ms ✓<br/>HTTP/1.1: p99 68ms"]
    C["<b>Conclusion</b><br/>Reject H₀ (p=0.001)<br/>Deploy HTTP/2"]
    
    H --> P
    P --> E
    E --> O
    O --> C
    
    style H fill:#b3d9ff,stroke:#0066cc,color:#000
    style P fill:#66b3ff,stroke:#0047b3,color:#fff
    style E fill:#ffd699,stroke:#ff9500,color:#000
    style O fill:#99ff99,stroke:#00b300,color:#000
    style C fill:#66ff66,stroke:#009900,color:#000
```

### DOT

```dot
digraph HTTP2Test {
    rankdir=TB;
    node [style="filled"];
    
    H [label="Hypothesis\nH₀: HTTP/2 latency = HTTP/1.1\nH₁: HTTP/2 latency < HTTP/1.1", 
       shape=box, fillcolor="#b3d9ff", fontcolor="#000"];
    P [label="Prediction\nIf multiplexing works,\np99 latency < 45ms", 
       shape=hexagon, fillcolor="#66b3ff", fontcolor="#fff"];
    E [label="Experiment\nA/B test: 10k requests\nIV: HTTP version\nDV: p99 latency", 
       shape=diamond, fillcolor="#ffd699", fontcolor="#000"];
    O [label="Observation\nHTTP/2: p99 42ms (pass)\nHTTP/1.1: p99 68ms", 
       shape=box, fillcolor="#99ff99", fontcolor="#000"];
    C [label="Conclusion\nReject H₀ (p=0.001)\nDeploy HTTP/2", 
       shape=ellipse, fillcolor="#66ff66", fontcolor="#000"];
    
    H -> P [color="#0066cc", penwidth=2];
    P -> E [color="#0047b3", penwidth=2];
    E -> O [color="#ff9500", penwidth=2];
    O -> C [color="#009900", penwidth=2];
}
```

## Special Cases

- **Falsification**: When observation refutes the hypothesis, draw a dashed red arc from observation back to hypothesis labeled "Falsified" to indicate the cycle must restart with a revised hypothesis.
- **Multiple hypotheses**: If testing multiple H₁ variants, draw parallel experiment → observation paths from the same prediction node.
- **Control variables**: Can be listed in an annotation box attached to the experiment node.
- **Confidence level**: Display as a percentage or 0-1 scale on the conclusion node.
- **Incomplete experiment**: If the experiment is not yet run, show prediction → experiment with a dashed edge to observation, labeled "pending".

