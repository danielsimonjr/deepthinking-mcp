# Visual Grammar: Meta Reasoning

How to render a `metareasoning` thought as a diagram.

## Node Structure

Meta-reasoning diagrams show the current reasoning mode and alternative modes with evaluation scores, mode-switch recommendations, and evaluation dimensions. Structure:
- **Current mode node** (large circle at center): The reasoning mode currently in use, labeled with mode name
- **Alternative mode satellites** (circles around center): Other modes with evaluation scores on edges
- **Recommendation arrow** (thick arrow to best alternative): Points to the mode that should be adopted
- **Evaluation dimensions** (optional radar/spider labels): Show scores on dimensions like `clarity`, `completeness`, `efficiency`, `confidence`
- **Score labels** (on edges): Numerical scores (0-1 or percentages) indicating how well each alternative mode fits the current task

Node colors:
- **Blue**: Current mode
- **Green**: Recommended alternative mode
- **Orange**: Other candidate modes
- **Gray**: Modes with low scores / not recommended
- **Red**: Mode with critical gaps

## Edge Semantics

- **Solid arrow** (`→`) — Mode transition; edge thickness indicates score
- **Thick arrow** (`⟹`) — Recommended switch to this mode; strongest signal
- **Dashed arrow** (`⇢`) — Alternative mode, lower priority
- **Edge label** — Score or evaluation metric (e.g., "0.87", "87%")

## Mermaid Template

```mermaid
graph LR
    Current["<b>CURRENT MODE</b><br/>Sequential<br/>(step-by-step)"]
    
    Alt1["<b>Recommended ✓</b><br/>Causal<br/>Score: 0.92"]
    Alt2["Probabilistic<br/>Score: 0.65"]
    Alt3["Analogical<br/>Score: 0.58"]
    Alt4["Constraint<br/>Score: 0.41"]
    
    Eval["<b>Evaluation</b><br/>Clarity: 0.85<br/>Completeness: 0.92<br/>Efficiency: 0.78<br/>Confidence: 0.90"]
    
    Current -->|0.92| Alt1
    Current -->|0.65| Alt2
    Current -->|0.58| Alt3
    Current -->|0.41| Alt4
    
    Alt1 -.-> Eval
    
    style Current fill:#3b82f6,stroke:#1e40af,color:#fff,stroke-width:3px
    style Alt1 fill:#10b981,stroke:#047857,color:#fff,stroke-width:3px
    style Alt2 fill:#f97316,stroke:#c2410c,color:#fff
    style Alt3 fill:#f97316,stroke:#c2410c,color:#fff
    style Alt4 fill:#9ca3af,stroke:#6b7280,color:#fff
    style Eval fill:#fef3c7,stroke:#d97706,color:#000
```

## DOT Template

```dot
digraph MetaReasoning {
    rankdir=LR;
    
    node [shape=circle, style="filled"];
    Current [label="CURRENT\nSequential\n(step-by-step)", 
             fillcolor="#3b82f6", fontcolor="white", width=1.2, penwidth=3];
    
    Alt1 [label="RECOMMENDED ✓\nCausal\nScore: 0.92", 
          fillcolor="#10b981", fontcolor="white", width=1.2, penwidth=3];
    Alt2 [label="Probabilistic\nScore: 0.65", 
          fillcolor="#f97316", fontcolor="white", width=1.2];
    Alt3 [label="Analogical\nScore: 0.58", 
          fillcolor="#f97316", fontcolor="white", width=1.2];
    Alt4 [label="Constraint\nScore: 0.41", 
          fillcolor="#9ca3af", fontcolor="white", width=1.2];
    
    node [shape=box, style="filled"];
    Eval [label="Evaluation Dimensions\nClarity: 0.85\nCompleteness: 0.92\nEfficiency: 0.78\nConfidence: 0.90", 
          fillcolor="#fef3c7", fontcolor="#000"];
    
    Current -> Alt1 [color="#047857", penwidth=4, label="0.92"];
    Current -> Alt2 [color="#c2410c", penwidth=2, label="0.65"];
    Current -> Alt3 [color="#c2410c", penwidth=2, label="0.58"];
    Current -> Alt4 [color="#9ca3af", penwidth=1, label="0.41"];
    
    Alt1 -> Eval [style=dashed, color="#047857", penwidth=2];
}
```

## Worked Example

Based on a session evaluation recommending a mode switch:

### Mermaid

```mermaid
graph LR
    Current["<b>CURRENT</b><br/>Sequential<br/>Step-by-step"]
    
    Alt1["<b>SWITCH TO ✓</b><br/>Causal<br/>Identify causes<br/>Score: 0.92"]
    Alt2["Analogical<br/>Compare domains<br/>Score: 0.68"]
    Alt3["FirstPrinciples<br/>Decompose axioms<br/>Score: 0.54"]
    Alt4["Probabilistic<br/>Bayesian inference<br/>Score: 0.41"]
    
    Reason["<b>Why Causal?</b><br/>• Root cause ID is critical (0.92)<br/>• Mechanism understanding (0.88)<br/>• Intervention planning (0.85)<br/>• Sequential won't capture<br/>confounder dynamics"]
    
    Current -->|0.92| Alt1
    Current -->|0.68| Alt2
    Current -->|0.54| Alt3
    Current -->|0.41| Alt4
    
    Alt1 -.-> Reason
    
    style Current fill:#3b82f6,stroke:#1e40af,color:#fff,stroke-width:2px
    style Alt1 fill:#10b981,stroke:#047857,color:#fff,stroke-width:4px
    style Alt2 fill:#f97316,stroke:#c2410c,color:#fff
    style Alt3 fill:#f97316,stroke:#c2410c,color:#fff
    style Alt4 fill:#9ca3af,stroke:#6b7280,color:#fff
    style Reason fill:#fef3c7,stroke:#d97706,color:#000
```

### DOT

```dot
digraph SessionModeSwitch {
    rankdir=LR;
    
    node [shape=circle, style="filled", width=1.3];
    Current [label="CURRENT\nSequential\nStep-by-step", 
             fillcolor="#3b82f6", fontcolor="white", penwidth=2];
    
    Alt1 [label="SWITCH TO ✓\nCausal\nScore: 0.92", 
          fillcolor="#10b981", fontcolor="white", penwidth=4];
    Alt2 [label="Analogical\nScore: 0.68", 
          fillcolor="#f97316", fontcolor="white"];
    Alt3 [label="FirstPrinciples\nScore: 0.54", 
          fillcolor="#f97316", fontcolor="white"];
    Alt4 [label="Probabilistic\nScore: 0.41", 
          fillcolor="#9ca3af", fontcolor="white"];
    
    node [shape=box, style="filled"];
    Reason [label="Why Causal?\n• Root cause (0.92)\n• Mechanism (0.88)\n• Intervention (0.85)\n• Sequential misses confounders", 
            fillcolor="#fef3c7", fontcolor="#000"];
    
    Current -> Alt1 [color="#047857", penwidth=4, label="0.92"];
    Current -> Alt2 [color="#c2410c", penwidth=2, label="0.68"];
    Current -> Alt3 [color="#c2410c", penwidth=2, label="0.54"];
    Current -> Alt4 [color="#9ca3af", penwidth=1, label="0.41"];
    
    Alt1 -> Reason [style=dashed, color="#047857", penwidth=2];
}
```

## Special Cases

- **Radar/spider plot** (optional): Show evaluation dimensions as a multi-axis radar plot with current mode and recommended mode overlaid for visual comparison of relative strengths.
- **Critical gaps**: If the current mode has a critical gap on a key dimension, highlight it with a red arrow and label "CRITICAL: <dimension>".
- **Confidence bars**: Below each mode score, optionally show a confidence bar (0-1) indicating how certain the recommendation is.
- **Multiple recommendations**: If two or more modes are equally strong, show them with equal thickness arrows and label "Co-optimal: Mode A, Mode B".
- **Explanation box**: Add a text box explaining *why* the recommended mode is better (e.g., "Causal thinking is essential for root-cause analysis; Sequential is too linear for confounder dynamics").
- **Dimension sensitivity**: If switching modes because one dimension improved significantly, annotate that dimension with a "↑" arrow or highlight the improvement.
