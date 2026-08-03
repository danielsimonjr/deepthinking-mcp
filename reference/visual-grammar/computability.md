# Visual Grammar: Computability

How to render a `computability` thought as a diagram.

## Node Structure

- **Turing machine states** → Circles (blue for initial, green for accept, red for reject)
- **Problems** → Rectangles with complexity-class color fill:
  - `P` → Green fill
  - `NP` → Yellow fill
  - `NP-complete` → Orange fill
  - `Undecidable` → Red fill
  - `Unknown` → Gray fill
- **Reductions** → Directed labeled arrows between problems
- **Diagonalization arguments** → Double-boxed "paradox" node

## Edge Semantics

- **State transition** → Arrow labeled with `readSymbol/writeSymbol, direction` (e.g., `a/b, R`)
- **Reduction** → Arrow with `type: polynomial_time` or `many_one` label
- **Decidability proof** → Arrow to central problem with proof method label
- **Circular diagonalization** → Self-loop arrow with "self-reference" label

## Mermaid Template

```mermaid
graph LR
  S0((q0<br/>start))
  S1((q1<br/>read))
  SAcc((qacc<br/>accept))
  SRej((qrej<br/>reject))
  
  PROB1["Problem A<br/>Decidable"]
  PROB2["Problem B<br/>NP-complete"]
  
  S0 -->|a/b,R| S1
  S1 -->|#/b,L| SAcc
  S1 -->|invalid| SRej
  
  PROB1 -->|reduction<br/>poly-time| PROB2
  
  style S0 fill:#e8f4f8,stroke:#0066cc
  style SAcc fill:#e8f8e8,stroke:#00cc00
  style SRej fill:#ffe8e8,stroke:#cc0000
  style PROB1 fill:#e8f8e8,stroke:#00cc00,stroke-width:2px
  style PROB2 fill:#fff8e8,stroke:#ff9900,stroke-width:2px
```

## DOT Template

```dot
digraph ComputabilityAnalysis {
  rankdir=LR;
  node [shape=box, style="filled", fontname="Arial"];

  Q0 [label="q₀\nstart", shape=circle, fillcolor="#e8f4f8", color="#0066cc", penwidth=2];
  Q1 [label="q₁\nread", shape=circle, fillcolor="#f5f5f5"];
  Qacc [label="qacc\naccept", shape=circle, fillcolor="#e8f8e8", color="#00cc00", penwidth=2];
  Qrej [label="qrej\nreject", shape=circle, fillcolor="#ffe8e8", color="#cc0000", penwidth=2];

  ProbA [label="Problem A\nHalting Decidable?", fillcolor="#ffffcc", color="#000000"];
  ProbB [label="Problem B\nATM Undecidable", fillcolor="#ffcccc", color="#cc0000", penwidth=2];
  ProbC [label="Problem C\nETM Undecidable", fillcolor="#ffcccc", color="#cc0000", penwidth=2];

  Q0 -> Q1 [label="a/b,R"];
  Q1 -> Qacc [label="accept"];
  Q1 -> Qrej [label="reject"];

  ProbA -> ProbB [label="reduction"];
  ProbB -> ProbC [label="similar proof"];
}
```

## Worked Example

Input: "Is the Halting Problem decidable?" (from computability.md)

**Mermaid:**
```mermaid
graph TD
  ASSUME["Assume: HALT decider H<br/>exists for HALT_TM"]
  BUILD["Build diagonalizer D<br/>on input ⟨M⟩:<br/>run H(⟨M,⟨M⟩⟩)"]
  LOGIC["If H says HALT<br/>→ D loops<br/>If H says LOOP<br/>→ D accepts"]
  PARADOX["⊥ PARADOX<br/>What does D do on D?"]
  CONCLUSION["Result: HALT is<br/>UNDECIDABLE"]
  
  ASSUME --> BUILD
  BUILD --> LOGIC
  LOGIC --> PARADOX
  PARADOX --> CONCLUSION
  
  style ASSUME fill:#fffacd,stroke:#ff9900
  style BUILD fill:#f5f5f5,stroke:#333
  style LOGIC fill:#f5f5f5,stroke:#333
  style PARADOX fill:#ffe8e8,stroke:#cc0000,stroke-width:3px
  style CONCLUSION fill:#ffcccc,stroke:#cc0000,stroke-width:2px
```

**DOT:**
```dot
digraph HaltingProblem {
  rankdir=TB;
  node [shape=box, style="filled", fontname="Arial"];

  ASSUME [label="Assume: Decider H\nfor HALT_TM exists", fillcolor="#fffacd", color="#ff9900"];
  BUILD [label="Construct: Diagonalizer D\nOn input ⟨M⟩:\n  result := H(⟨M,⟨M⟩⟩)\n  if result='halts' loop forever\n  if result='loops' accept", fillcolor="#f5f5f5"];
  APPLY [label="Apply: D(⟨D⟩)\nWhat does D do?"];
  PARADOX [label="Paradox!\nIf H says D halts\n→ D loops forever\nIf H says D loops\n→ D halts", fillcolor="#ffe8e8", color="#cc0000", penwidth=2];
  CONCLUSION [label="Conclusion:\nNo such H exists\nHALT is UNDECIDABLE", fillcolor="#ffcccc", color="#cc0000", penwidth=3];

  ASSUME -> BUILD;
  BUILD -> APPLY [label="apply to D"];
  APPLY -> PARADOX;
  PARADOX -> CONCLUSION [label="contradiction"];
}
```

## Special Cases

- **Turing machine computation trace** → Show as vertical timeline of states; each row represents one step with `state | tapeContents | headPos`
- **Multi-problem reductions** → Chain problems left-to-right; show reduction arrows; highlight NP-complete problems with orange fill
- **Complexity class ladder** → Vertical hierarchy with P at bottom (green), NP above (yellow), PSPACE above (light blue), EXPTIME at top (orange); show P vs NP with a question mark edge
- **Oracle separation** → Use double-border rectangles for oracle TMs; show separation with "Oracle: X" label on node
