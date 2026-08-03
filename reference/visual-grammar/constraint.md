# Visual Grammar: Constraint

How to render a `constraint` (CSP) thought as a diagram.

## Node Structure

Constraint Satisfaction Problem (CSP) diagrams show variables, their domains, constraints, and assigned values. Structure:
- **Variable nodes** (rectangles): One per variable, labeled with name and initial domain (e.g., "Role ∈ {A, B, C}")
- **Constraint hyperedges** (labeled lines/boxes): Connect variables that must satisfy a relation; label shows constraint type
- **Domain values** (small circles or bubbles around variable): Possible values; grayed out or struck through when removed by propagation
- **Assignment highlights** (filled circles with value inside): Mark assignments found during search
- **Propagation steps** (dashed arrows): Show reduced domain after arc-consistency or forward-checking
- **Backtrack indicators** (diagonal lines or "↶"): Mark failed search nodes

Node colors:
- **Blue**: Variable node
- **Green**: Assigned variable (value locked in)
- **Orange**: Domain with remaining values
- **Red**: Empty domain (infeasible)
- **Gray**: Pruned value (removed by constraint propagation)

## Edge Semantics

- **Solid line** (`—`) — Hard constraint: must be satisfied
- **Dashed line** (`- - -`) — Soft constraint: violation has penalty (optional)
- **Thick solid line** (`═`) — Constraint being propagated or checked currently
- **Hyperedge box** — Multi-variable constraint (e.g., AllDifferent affecting 3+ variables)

## Mermaid Template

```mermaid
graph LR
    Role["Role<br/>∈ {Backend, Frontend,<br/>DevOps}"]
    Exp["Experience<br/>∈ {Junior, Mid,<br/>Senior}"]
    Team["Team<br/>∈ {A, B, C}"]
    
    Const1["not_equal<br/>(Role, Role)<br/>no two same"]
    Const2["requires<br/>Backend → Senior"]
    Const3["allDiff<br/>Team assignments"]
    
    Assigned["✓ Assignments:<br/>Role=Backend<br/>Exp=Senior<br/>Team=A"]
    
    Role -->|constraint| Const1
    Exp -->|constraint| Const2
    Role -->|constraint| Const2
    Team -->|constraint| Const3
    
    Role -.->|propagation| Assigned
    Exp -.->|propagation| Assigned
    Team -.->|propagation| Assigned
    
    style Role fill:#3b82f6,stroke:#1e40af,color:#fff
    style Exp fill:#3b82f6,stroke:#1e40af,color:#fff
    style Team fill:#3b82f6,stroke:#1e40af,color:#fff
    style Const1 fill:#f97316,stroke:#c2410c,color:#fff
    style Const2 fill:#f97316,stroke:#c2410c,color:#fff
    style Const3 fill:#f97316,stroke:#c2410c,color:#fff
    style Assigned fill:#10b981,stroke:#047857,color:#fff,stroke-width:3px
```

## DOT Template

```dot
digraph CSP {
    rankdir=LR;
    
    node [shape=box, style="filled"];
    Role [label="Role\n∈ {Backend, Frontend, DevOps}", 
          fillcolor="#3b82f6", fontcolor="white"];
    Exp [label="Experience\n∈ {Junior, Mid, Senior}", 
         fillcolor="#3b82f6", fontcolor="white"];
    Team [label="Team\n∈ {A, B, C}", 
          fillcolor="#3b82f6", fontcolor="white"];
    
    node [shape=diamond, style="filled"];
    Const1 [label="not_equal\n(no duplicate roles)", 
            fillcolor="#f97316", fontcolor="white"];
    Const2 [label="Backend\n⟹ Senior", 
            fillcolor="#f97316", fontcolor="white"];
    Const3 [label="allDiff\n(distinct teams)", 
            fillcolor="#f97316", fontcolor="white"];
    
    node [shape=box, style="filled"];
    Assigned [label="✓ SOLUTION\nRole=Backend\nExp=Senior\nTeam=A\n\nBacktracks: 2", 
              fillcolor="#10b981", fontcolor="white", penwidth=3];
    
    Role -> Const1 [color="#1e40af", penwidth=2];
    Exp -> Const2 [color="#1e40af", penwidth=2];
    Role -> Const2 [color="#1e40af", penwidth=2];
    Team -> Const3 [color="#1e40af", penwidth=2];
    
    Const1 -> Assigned [style=dashed, color="#047857", penwidth=2, label="propagation"];
    Const2 -> Assigned [style=dashed, color="#047857", penwidth=2];
    Const3 -> Assigned [style=dashed, color="#047857", penwidth=2];
}
```

## Worked Example

Based on the engineer role assignment CSP from `reference/output-formats/constraint.md`:

### Mermaid

```mermaid
graph LR
    subgraph Vars["Variables & Domains"]
        E1["Engineer 1<br/>∈ {Backend,<br/>Frontend,<br/>DevOps}"]
        E2["Engineer 2<br/>∈ {Backend,<br/>Frontend,<br/>DevOps}"]
        E3["Engineer 3<br/>∈ {Backend,<br/>Frontend,<br/>DevOps}"]
    end
    
    subgraph Cons["Constraints"]
        C1["AllDifferent<br/>(no role duplicates)"]
        C2["Backend ⟹ Senior<br/>(if Backend, must<br/>have senior experience)"]
        C3["Frontend ∧ E1<br/>(E1 prefers<br/>Frontend role)"]
    end
    
    E1 -->|constraint| C1
    E2 -->|constraint| C1
    E3 -->|constraint| C1
    E1 -->|constraint| C2
    E1 -->|constraint| C3
    
    Search["Search with<br/>MRV heuristic<br/>Backtracks: 2"]
    
    Solution["<b>SOLUTION ✓</b><br/>E1=Frontend<br/>E2=Backend<br/>E3=DevOps<br/>Status: found"]
    
    C1 -.-> Search
    C2 -.-> Search
    C3 -.-> Search
    Search --> Solution
    
    style E1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style E2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style E3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style C1 fill:#f97316,stroke:#c2410c,color:#fff
    style C2 fill:#f97316,stroke:#c2410c,color:#fff
    style C3 fill:#f97316,stroke:#c2410c,color:#fff
    style Search fill:#fbbf24,stroke:#d97706,color:#000
    style Solution fill:#10b981,stroke:#047857,color:#fff,stroke-width:3px
```

### DOT

```dot
digraph EngineerCSP {
    rankdir=TB;
    
    node [shape=box, style="filled"];
    E1 [label="Engineer 1\n∈ {Backend,\nFrontend,\nDevOps}", 
        fillcolor="#3b82f6", fontcolor="white"];
    E2 [label="Engineer 2\n∈ {Backend,\nFrontend,\nDevOps}", 
        fillcolor="#3b82f6", fontcolor="white"];
    E3 [label="Engineer 3\n∈ {Backend,\nFrontend,\nDevOps}", 
        fillcolor="#3b82f6", fontcolor="white"];
    
    node [shape=diamond, style="filled"];
    C1 [label="AllDifferent\n(no duplicates)", 
        fillcolor="#f97316", fontcolor="white"];
    C2 [label="Backend\n⟹ Senior", 
        fillcolor="#f97316", fontcolor="white"];
    C3 [label="E1 prefers\nFrontend", 
        fillcolor="#f97316", fontcolor="white"];
    
    node [shape=box, style="filled"];
    Search [label="Search\nMRV heuristic\nBacktracks: 2", 
            fillcolor="#fbbf24", fontcolor="#000"];
    
    Solution [label="SOLUTION ✓\nE1=Frontend\nE2=Backend\nE3=DevOps\nStatus: found", 
              fillcolor="#10b981", fontcolor="white", penwidth=3];
    
    E1 -> C1 [color="#1e40af", penwidth=2];
    E2 -> C1 [color="#1e40af", penwidth=2];
    E3 -> C1 [color="#1e40af", penwidth=2];
    E1 -> C2 [color="#1e40af", penwidth=2];
    E1 -> C3 [color="#1e40af", penwidth=2];
    
    C1 -> Search [style=dashed, color="#c2410c", penwidth=2];
    C2 -> Search [style=dashed, color="#c2410c", penwidth=2];
    C3 -> Search [style=dashed, color="#c2410c", penwidth=2];
    
    Search -> Solution [color="#047857", penwidth=3];
}
```

## Special Cases

- **Arc consistency (AC-3) propagation**: Show domain reductions with struck-through or grayed-out values; label edges with "AC-3 reduces to {...}".
- **Forward checking**: Mark variables with reduced domains as "FC-pruned" after an assignment; show the propagation as a dashed arrow.
- **Backtracking nodes**: For failed branches, render with a red X or "✗" and label with the constraint that failed (e.g., "C1 violated: AllDifferent").
- **Search tree representation** (optional): For deeper insight, show the search tree with nodes for each partial assignment and edges labeled with the next variable choice (using MRV heuristic or first-fail ordering).
- **Soft constraints**: Distinguish soft constraints (violations have penalties) with a dotted border and show the penalty value in the label.
- **Solution uniqueness**: If the solution is unique, mark the solution node with "Unique ✓"; if multiple solutions exist, note "Found 1 of N solutions" and optionally show backtrack count.
