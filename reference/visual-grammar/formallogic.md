# Visual Grammar: Formal Logic

How to render a `formallogic` thought as a diagram.

## Node Structure

Formal logic proofs are rendered as natural deduction trees:
- **Assumptions** (rounded rectangles, top of inverted tree): premises or hypothesis that are assumed
- **Inference step** (rounded rectangle, middle): application of a logical rule (modus ponens, conjunction elimination, etc.)
- **Discharged assumption** (grayed or crossed-out node, connected with dashed line): an assumption that has been discharged (no longer needed)
- **Conclusion** (bold rounded rectangle, bottom or top depending on rankdir): the derived statement

Each node is labeled with the statement and the inference rule applied.

## Edge Semantics

- **Solid arrow** (`→`) — Logical dependency: the child node follows from the parent(s) via a named inference rule
- **Dashed arrow** (`⇢`) — Discharged assumption: an assumption that was used but is no longer active in the proof
- **Double arrow** (`⟹`) — Conclusion path: highlights the final step leading to the conclusion

## Mermaid Template

```mermaid
graph BT
    A1["Assumption 1<br/>(premise)"]
    A2["Assumption 2<br/>(premise)"]
    S1["Step 1<br/>(Modus Ponens)<br/>from A1, A2"]
    S2["Step 2<br/>(Conjunction Elim)<br/>from S1"]
    C["Conclusion<br/>(derived statement)"]
    
    A1 --> S1
    A2 --> S1
    S1 --> S2
    S2 --> C
    
    style A1 fill:#b3e5fc,stroke:#0277bd,color:#000
    style A2 fill:#b3e5fc,stroke:#0277bd,color:#000
    style S1 fill:#ffe0b2,stroke:#f57c00,color:#000
    style S2 fill:#ffe0b2,stroke:#f57c00,color:#000
    style C fill:#c8e6c9,stroke:#2e7d32,color:#000
```

## DOT Template

```dot
digraph FormalLogic {
    rankdir=BT;
    node [shape=box, style="filled,rounded"];
    
    A1 [label="Assumption 1\n(premise)", fillcolor="#b3e5fc", fontcolor="#000"];
    A2 [label="Assumption 2\n(premise)", fillcolor="#b3e5fc", fontcolor="#000"];
    S1 [label="Step 1\n(Modus Ponens)\nfrom A1, A2", fillcolor="#ffe0b2", fontcolor="#000"];
    S2 [label="Step 2\n(Conjunction Elim)\nfrom S1", fillcolor="#ffe0b2", fontcolor="#000"];
    C [label="Conclusion\n(derived statement)", fillcolor="#c8e6c9", fontcolor="#000"];
    
    A1 -> S1 [color="#0277bd", penwidth=2];
    A2 -> S1 [color="#0277bd", penwidth=2];
    S1 -> S2 [color="#f57c00", penwidth=2];
    S2 -> C [color="#2e7d32", penwidth=2];
}
```

## Worked Example

Based on the Modus Tollens proof (deployment health check) from `reference/output-formats/formallogic.md`:

### Mermaid

```mermaid
graph BT
    A1["Assumption 1<br/>(P → Q)<br/>If deploys succeed,<br/>health check passes"]
    A2["Assumption 2<br/>(¬Q)<br/>Health check failed"]
    S1["Step 1<br/>(Modus Tollens)<br/>¬P from A1, A2"]
    C["Conclusion<br/>(¬P)<br/>Deploy failed"]
    
    A1 --> S1
    A2 --> S1
    S1 --> C
    
    style A1 fill:#b3e5fc,stroke:#0277bd,color:#000
    style A2 fill:#b3e5fc,stroke:#0277bd,color:#000
    style S1 fill:#ffe0b2,stroke:#f57c00,color:#000
    style C fill:#c8e6c9,stroke:#2e7d32,color:#000
```

### DOT

```dot
digraph ModusTollens {
    rankdir=BT;
    node [shape=box, style="filled,rounded"];
    
    A1 [label="Assumption 1\n(P → Q)\nIf deploys succeed,\nhealth check passes", fillcolor="#b3e5fc"];
    A2 [label="Assumption 2\n(¬Q)\nHealth check failed", fillcolor="#b3e5fc"];
    S1 [label="Step 1\n(Modus Tollens)\n¬P from (P → Q), ¬Q", fillcolor="#ffe0b2"];
    C [label="Conclusion\n(¬P)\nDeploy failed", fillcolor="#c8e6c9"];
    
    A1 -> S1 [color="#0277bd", penwidth=2];
    A2 -> S1 [color="#0277bd", penwidth=2];
    S1 -> C [color="#2e7d32", penwidth=2];
}
```

## Special Cases

- **Discharged assumptions**: When an assumption is used in a subproof and then discharged, show a dashed line from the assumption to the step where it is discharged, and cross out or gray the assumption node.
- **Conditionals (→ introduction)**: When proving an implication, show the assumption being introduced and then discharged at the end of the subproof.
- **Subproofs**: Nested proofs can be shown as indented or boxed subtrees within the main tree.
- **Multiple inference steps**: Label each edge with the rule name (Modus Ponens, Conjunction Introduction, Existential Instantiation, etc.).
- **Contradiction**: If the proof derives a contradiction (⊥), highlight it in red as the conclusion to show the original assumption is false (proof by contradiction).

