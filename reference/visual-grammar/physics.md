# Visual Grammar: Physics

How to render a `physics` thought as a diagram.

## Node Structure

- **Tensor objects** → Rectangles with rank label `[m,n]` suffix (blue)
- **Field quantities** → Rounded rectangles with units label (green)
- **Conservation laws** → Hexagons or bold rectangles (purple)
- **Symmetry groups** → Diamond nodes (orange)
- **Equations of motion** → Large nodes with LaTeX labels (center, red border)

## Edge Semantics

- **Derivation** → Solid arrow with "derives from" label
- **Conservation law application** → Thick bold arrow labeled with ∂, ∇, or the law name
- **Field coupling** → Dashed arrow labeled "couples to" or the coupling constant
- **Gauge transformation** → Double-headed arrow with "gauge: <transformation>"
- **Lorentz covariance** → Arrow labeled "covariant"

## Mermaid Template

```mermaid
graph TD
  SG["Symmetry Group<br/>U(1), SU(2), Poincaré"]
  F1["Field: A_μ<br/>[1,0]"]
  T1["Tensor: F_μν<br/>[0,2]"]
  CL["Conservation Law<br/>∂_μ J^μ = 0"]
  EOM["Equation of Motion<br/>∂_μ F^μν = J^ν"]
  
  SG -->|gauge| F1
  F1 -->|derives| T1
  T1 -->|implies| CL
  CL -->|constraint| EOM
  
  style SG fill:#fff0e8,stroke:#ff9900
  style F1 fill:#e8f8e8,stroke:#00cc00
  style T1 fill:#e8f4f8,stroke:#0066cc
  style CL fill:#f0e8f8,stroke:#6600cc,stroke-width:2px
  style EOM fill:#fff0f0,stroke:#cc0000,stroke-width:2px
```

## DOT Template

```dot
digraph Physics {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fontname="Arial"];

  SG [label="Symmetry Group\nU(1)", shape=diamond, fillcolor="#fff0e8", color="#ff9900"];
  F [label="Vector Potential\nA_μ  [1,0]", fillcolor="#e8f8e8", color="#00cc00"];
  T [label="Field Tensor\nF_μν = ∂_μA_ν - ∂_νA_μ\n[0,2] antisymmetric", fillcolor="#e8f4f8", color="#0066cc", penwidth=2];
  CL [label="Maxwell Equations\n∂_μF^μν = μ₀J^ν", shape=hexagon, fillcolor="#f0e8f8", color="#6600cc"];
  OBS [label="Observable\nE = F^0i, B^i = ½ε^ijkF_jk", fillcolor="#fffacd"];

  SG -> F [label="gauge"];
  F -> T [label="derive"];
  T -> CL [label="implies", penwidth=2];
  CL -> OBS [label="measurement"];
}
```

## Worked Example

Input: "Analyze the electromagnetic field tensor" (from physics.md)

**Mermaid:**
```mermaid
graph TD
  POT["Vector Potential<br/>A_μ<br/>rank [1,0]"]
  TENSOR["Field Tensor<br/>F_μν = ∂_μA_ν - ∂_νA_μ<br/>rank [0,2]<br/>antisymmetric"]
  INV1["Lorentz Invariant<br/>I₁ = F_μν F^μν<br/>∝ B² - E²/c²"]
  INV2["Lorentz Invariant<br/>I₂ = F_μν *F^μν<br/>∝ E·B"]
  MAXWELL["Maxwell Equations<br/>∂_μF^μν = μ₀J^ν"]
  E_FIELD["Observable: E^i<br/>= F^0i"]
  B_FIELD["Observable: B^i<br/>= -½ε^ijk F_jk"]
  
  POT -->|definition| TENSOR
  TENSOR -->|contract indices| INV1
  TENSOR -->|dual contract| INV2
  TENSOR -->|field equations| MAXWELL
  TENSOR -->|projection| E_FIELD
  TENSOR -->|dual projection| B_FIELD
  
  style POT fill:#e8f8e8,stroke:#00cc00
  style TENSOR fill:#e8f4f8,stroke:#0066cc,stroke-width:3px
  style INV1 fill:#fffacd,stroke:#ff9900
  style INV2 fill:#fffacd,stroke:#ff9900
  style MAXWELL fill:#f0e8f8,stroke:#6600cc,stroke-width:2px
  style E_FIELD fill:#ffe8e8,stroke:#cc0000
  style B_FIELD fill:#ffe8e8,stroke:#cc0000
```

**DOT:**
```dot
digraph EMFieldTensor {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fontname="Arial"];

  AP [label="Vector Potential\nA_μ [1,0] covariant", fillcolor="#e8f8e8", color="#00cc00"];
  FT [label="Electromagnetic Field\nF_μν = ∂_μA_ν - ∂_νA_μ\n[0,2] antisymmetric\nMinkowski coords", fillcolor="#e8f4f8", color="#0066cc", penwidth=3];
  INV1 [label="Invariant 1\nF_μν F^μν = 2(B² - E²/c²)", fillcolor="#fffacd", color="#ff9900"];
  INV2 [label="Invariant 2\nF_μν *F^μν ∝ E·B", fillcolor="#fffacd", color="#ff9900"];
  MAXWELL [label="Conservation Law\n∂_μF^μν = μ₀J^ν", shape=hexagon, fillcolor="#f0e8f8", color="#6600cc", penwidth=2];
  ELEC [label="Electric Field\nE^i = F^0i", fillcolor="#ffe8e8"];
  MAG [label="Magnetic Field\nB^i = -½ε^ijkF_jk", fillcolor="#ffe8e8"];

  AP -> FT [label="define"];
  FT -> INV1 [label="contract"];
  FT -> INV2 [label="dual contract"];
  FT -> MAXWELL [label="equations"];
  FT -> ELEC [label="project"];
  FT -> MAG [label="dual"];
}
```

## Special Cases

- **Multi-component tensors** → Show rank as `[contravariant, covariant]` suffix; use subscripts and superscripts in labels
- **Gauge-invariant combinations** → Draw as separate nodes below the field tensor; circle the invariant nodes or shade them distinctly
- **Symmetry breaking** → Show symmetry group node at top; draw broken arrow (wavy line) when symmetry is broken, with "breaking mechanism" label
- **Hub-and-spoke layout** → Place main tensor in center; radiate derivations, conservation laws, and observables outward; use `rankdir=LR` if space is tight
