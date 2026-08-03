# Visual Grammar: Mathematics

How to render a `mathematics` thought as a diagram.

## Node Structure

- **Theorems** → Rounded rectangles (blue)
- **Axioms/Definitions** → Double-bordered rectangles (green, `[[...]]` in Mermaid)
- **Proof steps** → Rounded rectangles (light gray)
- **Gaps** → Red dashed outlines (warning color)
- **Implicit assumptions** → Dashed rectangles (orange)

## Edge Semantics

- **Logical derivation** → Solid black arrow with step label
- **Gap/missing step** → Dashed red arrow with "GAP: <description>"
- **Assumption dependency** → Orange dashed arrow with "ASSUMES: <assumption>"
- **Contradiction** → Red arrow with "⊥" (contradiction symbol)
- **Proof complete** → Bold arrow with "✓"

## Mermaid Template

```mermaid
graph TD
  Ax["<axiom or definition<br/>(blue border for axioms)"]
  T1["Theorem: <statement>"]
  S1["Step 1: <derivation>"]
  S2["Step 2: <next step>"]
  GAP["❌ GAP: <gap type>"]
  ASSUME["⚠ Assumption: <assumption>"]

  Ax -->|definition| T1
  T1 -->|proof starts| S1
  S1 -->|modus ponens| S2
  S2 -.->|missing step| GAP
  S1 -.->|implicit| ASSUME

  style Ax fill:#e8f4f8,stroke:#0066cc,stroke-width:3px
  style T1 fill:#e8f8e8,stroke:#00cc00
  style S1 fill:#f5f5f5,stroke:#333
  style S2 fill:#f5f5f5,stroke:#333
  style GAP fill:#fff0f0,stroke:#cc0000,stroke-width:2px,stroke-dasharray: 5 5
  style ASSUME fill:#fff8e8,stroke:#ff9900,stroke-dasharray: 5 5
```

## DOT Template

```dot
digraph Mathematics {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fillcolor="#f5f5f5", fontname="Arial"];

  Ax [label="Axiom: Euclidean Postulate", shape=box, style="rounded,filled", fillcolor="#e8f4f8", color="#0066cc", penwidth=2];
  T1 [label="Theorem:\nSquare Root of 2", fillcolor="#e8f8e8", color="#00cc00"];
  S1 [label="Step 1: Assume √2 = p/q"];
  S2 [label="Step 2: Square both sides"];
  S3 [label="Step 3: p is even"];
  CONTRA [label="Contradiction!\np and q both even", fillcolor="#fff0f0", color="#cc0000"];

  Ax -> T1 [label="def"];
  T1 -> S1 [label="proof"];
  S1 -> S2 [label="algebra"];
  S2 -> S3 [label="parity"];
  S3 -> CONTRA [label="contradiction", color="#cc0000", penwidth=2];
}
```

## Worked Example

Input: "Prove that √2 is irrational" (from mathematics.md)

**Mermaid:**
```mermaid
graph TD
  AX["<b>Axiom</b><br/>Integers well-ordered<br/>gcd(p,q)=1 in lowest terms"]
  T["<b>Theorem</b><br/>√2 is irrational"]
  H["Hypothesis:<br/>√2 = p/q, gcd(p,q)=1"]
  S1["Step 1: Square both sides<br/>2 = p²/q²"]
  S2["Step 2: p² even → p even<br/>(parity lemma)"]
  S3["Step 3: p = 2k, substitute<br/>q² = 2k²"]
  S4["Step 4: q is also even"]
  CONTRA["<b>⊥ Contradiction</b><br/>Both p,q even<br/>but gcd(p,q)=1"]
  
  AX -->|definition| T
  T -->|proof by contradiction| H
  H -->|algebra| S1
  S1 -->|apply lemma| S2
  S2 -->|algebra| S3
  S3 -->|apply lemma| S4
  S4 -->|logical| CONTRA
  
  style AX fill:#e8f4f8,stroke:#0066cc,stroke-width:3px
  style T fill:#e8f8e8,stroke:#00cc00,stroke-width:2px
  style CONTRA fill:#ffe8e8,stroke:#cc0000,stroke-width:2px
  style H fill:#f9f9f9,stroke:#666
```

**DOT:**
```dot
digraph IrrationalitySqrt2 {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fontname="Arial"];

  Ax [label="Axiom: GCD property\nEvery rational has\nlowest-terms form", fillcolor="#e8f4f8", color="#0066cc", penwidth=2];
  T [label="Theorem:\n√2 is irrational", fillcolor="#e8f8e8", color="#00cc00", penwidth=2];
  H [label="Hypothesis:\n√2 = p/q (gcd=1)", fillcolor="#fffacd"];
  S1 [label="Step 1:\n2 = p²/q²"];
  S2 [label="Step 2:\np² even ⟹ p even"];
  S3 [label="Step 3:\np=2k, q²=2k²"];
  S4 [label="Step 4:\nq is also even"];
  C [label="⊥ Contradiction!\nBoth p, q even", fillcolor="#ffe8e8", color="#cc0000", penwidth=2];

  Ax -> T [label="define"];
  T -> H [label="contradiction proof"];
  H -> S1 [label="algebra"];
  S1 -> S2 [label="parity"];
  S2 -> S3 [label="substitute"];
  S3 -> S4 [label="parity"];
  S4 -> C [label="contradiction", color="#cc0000", penwidth=2];
}
```

## Special Cases

- **Gaps in proof** → Show as dashed red nodes with "GAP: <gap type>" label; use `stroke-dasharray` in DOT or dashed red outline in Mermaid
- **Circular dependencies** → Draw a loop with arrows; add "⚠ Circular" label
- **Incomplete induction** → Show base case and inductive step separately; if either is missing, add "GAP: missing base case" or "GAP: missing inductive step"
- **Case exhaustion** → Use a fan layout from the statement to multiple case boxes, each ending at a conclusion box
- **Proof by contradiction** → Assumption leads to contradictory node marked with "⊥"; conclusion is the negation of the assumption
