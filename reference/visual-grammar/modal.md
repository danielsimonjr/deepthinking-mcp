# Visual Grammar: Modal

How to render a `modal` thought as a diagram.

## Node Structure

Modal logic diagrams show possible worlds and accessibility relations:
- **Possible worlds** (circles or ellipses, labeled w0, w1, w2...): alternative states or scenarios
- **Current world** (highlighted in gold or with thick border): the actual world w0
- **Accessibility relation** (directed arrow between worlds): if world w1 is accessible from w0, draw an edge w0 → w1
- **Propositions within worlds** (text inside world node): statements true in that world (e.g., "p=true, q=false")
- **Necessity/Possibility labels** (on edges or in world nodes): □p (necessarily p) or ◇p (possibly p)
- **Logic system label** (top annotation): K, T, S4, S5 indicating the modal logic system

## Edge Semantics

- **Directed arrow** (`→`) — Accessibility: w1 is accessible from w0 (if p at w0, then p possible at w1)
- **Reflexive loop** (self-edge on w0): in T, S4, S5 (every world is accessible to itself)
- **Transitive path** (chain of arrows): in S4, S5 (if w0→w1→w2, then w0→w2)
- **Edge label** (e.g., "R for □p"): indicates which accessibility relation is relevant

## Mermaid Template

```mermaid
graph TB
    W0["w0 (Current World)<br/>p = true<br/>q = false"]
    W1["w1<br/>p = true<br/>q = true"]
    W2["w2<br/>p = false<br/>q = true"]
    
    W0 -->|Access| W1
    W0 -->|Access| W2
    W0 -->|Reflexive| W0
    
    Logic["Modal Logic: S5<br/>(Equivalence relation)"]
    
    style W0 fill:#ffff99,stroke:#ffcc00,stroke-width:3px
    style W1 fill:#b3e5fc,stroke:#0277bd
    style W2 fill:#b3e5fc,stroke:#0277bd
    style Logic fill:#f0f0f0,stroke:#666666
```

## DOT Template

```dot
digraph Modal {
    rankdir=TB;
    node [style="filled"];
    
    W0 [label="w0 (Current)\np=true, q=false", shape=circle, fillcolor="#ffff99", penwidth=3];
    W1 [label="w1\np=true, q=true", shape=circle, fillcolor="#b3e5fc"];
    W2 [label="w2\np=false, q=true", shape=circle, fillcolor="#b3e5fc"];
    
    W0 -> W1 [label="Access", color="#0066cc", penwidth=2];
    W0 -> W2 [label="Access", color="#0066cc", penwidth=2];
    W0 -> W0 [label="Reflexive", color="#0066cc"];
}
```

## Worked Example

Alice admin access deontic/S5 scenario with 3 worlds.

### Mermaid

```mermaid
graph TB
    W0["w0 (Current)<br/>Alice=user<br/>can_admin=false"]
    W1["w1 (Permitted)<br/>Alice=admin<br/>can_admin=true"]
    W2["w2 (Forbidden)<br/>Alice=user<br/>can_admin=false"]
    
    W0 -->|Permitted| W1
    W0 -->|Forbidden| W2
    W0 -->|Reflexive| W0
    W1 -->|Reflexive| W1
    W2 -->|Reflexive| W2
    
    Claim["Claim: ◇(can_admin)<br/>(possibly admin)<br/>Necessity: □(denied)<br/>(necessarily denied)"]
    
    style W0 fill:#ffff99,stroke:#ffcc00,stroke-width:3px
    style W1 fill:#99ff99,stroke:#00aa00
    style W2 fill:#ff9999,stroke:#cc0000
    style Claim fill:#f0f0f0,stroke:#666666
```

### DOT

```dot
digraph AdminAccess {
    rankdir=TB;
    node [style="filled"];
    
    W0 [label="w0 (Current)\nAlice=user", shape=circle, fillcolor="#ffff99", penwidth=3];
    W1 [label="w1 (Permitted)\nAlice=admin", shape=circle, fillcolor="#99ff99"];
    W2 [label="w2 (Forbidden)\nAlice=user", shape=circle, fillcolor="#ff9999"];
    
    W0 -> W1 [label="Permitted"];
    W0 -> W2 [label="Forbidden"];
    W0 -> W0 [label="Reflexive"];
}
```

## Special Cases

- **Multi-relation accessibility**: Use different edge colors or styles (solid vs dashed) for different accessibility relations (e.g., doxastic, epistemic, deontic).
- **Frame properties**: Annotate diagram title with logic system (K, T, S4, S5) to indicate whether relation is reflexive, transitive, or symmetric.
- **Counterexample world**: Highlight worlds in red that violate a property or constraint.
- **Necessity and possibility tracking**: Use annotations like □p (true in all accessible worlds) or ◇p (true in some accessible world).
- **Equivalence classes**: In S5, worlds can be grouped into equivalence classes with bidirectional arrows between all pairs.
