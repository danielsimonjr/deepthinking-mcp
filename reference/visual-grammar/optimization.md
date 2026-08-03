# Visual Grammar: Optimization

How to render an `optimization` thought as a diagram.

## Node Structure

Optimization diagrams show the objective function, decision variables, constraints, and the optimal solution. Structure:
- **Objective diamond** (at top or center): Labeled "Maximize f(x)" or "Minimize f(x)"
- **Variable nodes** (rectangles): Decision variables with domain bounds (e.g., "X ∈ [0, 100]")
- **Constraint nodes** (hexagons or boxes): Hard constraints with expressions (e.g., "X + Y ≤ 50")
- **Feasible region** (optional subgraph): Boundary showing the constraint intersection
- **Optimal solution node** (gold/yellow star): The point that maximizes/minimizes the objective within the feasible region
- **Binding constraint highlight** (thick border, bolded): Constraints that hold with equality at the optimum

Node colors:
- **Purple**: Objective function
- **Blue**: Decision variables
- **Orange**: Constraints
- **Gold**: Optimal solution
- **Red**: Binding constraints (active at optimum)

## Edge Semantics

- **Solid arrow** (`→`) — Dependency: variable influences objective or constraint
- **Dashed arrow** (`⇢`) — Weak binding: constraint is nearly active but has slack
- **Thick solid arrow** (`⟹`) — Binding constraint: tight at optimum, limiting the objective

## Mermaid Template

```mermaid
graph TD
    Objective["<b>MAXIMIZE</b><br/>Throughput<br/>f(x) = 2a + 3b"]
    
    VarA["Instance Count<br/>a ∈ [0, 100]"]
    VarB["Cache Size<br/>b ∈ [0, 50]"]
    VarC["Replica Factor<br/>c ∈ [1, 5]"]
    
    Con1["<b>Budget</b><br/>50a + 200b ≤ 5000"]
    Con2["<b>Latency SLA</b><br/>50/a + 10/b ≤ 100ms"]
    Con3["<b>Replication</b><br/>a*c ≤ 150"]
    
    Solution["<b>OPTIMAL SOLUTION ★</b><br/>a=50, b=20, c=3<br/>Throughput = 160 req/s"]
    
    Objective --> VarA
    Objective --> VarB
    Objective --> VarC
    VarA --> Con1
    VarB --> Con1
    VarA --> Con2
    VarB --> Con2
    VarA --> Con3
    VarC --> Con3
    
    Con1 -->|binding| Solution
    Con2 -->|binding| Solution
    Con3 -.->|slack| Solution
    
    style Objective fill:#a855f7,stroke:#7c3aed,color:#fff
    style VarA fill:#3b82f6,stroke:#1e40af,color:#fff
    style VarB fill:#3b82f6,stroke:#1e40af,color:#fff
    style VarC fill:#3b82f6,stroke:#1e40af,color:#fff
    style Con1 fill:#f97316,stroke:#c2410c,color:#fff,stroke-width:3px
    style Con2 fill:#f97316,stroke:#c2410c,color:#fff,stroke-width:3px
    style Con3 fill:#f97316,stroke:#c2410c,color:#fff
    style Solution fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:4px
```

## DOT Template

```dot
digraph Optimization {
    rankdir=TB;
    
    Objective [label="MAXIMIZE\nThroughput\nf(x) = 2a + 3b", 
               shape=diamond, style="filled", fillcolor="#a855f7", fontcolor="white"];
    
    node [shape=box, style="filled"];
    VarA [label="Instance Count\na ∈ [0, 100]", fillcolor="#3b82f6", fontcolor="white"];
    VarB [label="Cache Size\nb ∈ [0, 50]", fillcolor="#3b82f6", fontcolor="white"];
    VarC [label="Replica Factor\nc ∈ [1, 5]", fillcolor="#3b82f6", fontcolor="white"];
    
    node [shape=hexagon, style="filled"];
    Con1 [label="BUDGET\n50a + 200b ≤ 5000", fillcolor="#f97316", fontcolor="white", penwidth=3];
    Con2 [label="LATENCY SLA\n50/a + 10/b ≤ 100ms", fillcolor="#f97316", fontcolor="white", penwidth=3];
    Con3 [label="REPLICATION\na*c ≤ 150", fillcolor="#f97316", fontcolor="white"];
    
    node [shape=star, style="filled"];
    Solution [label="OPTIMAL SOLUTION ★\na=50, b=20, c=3\nThroughput = 160 req/s", 
              fillcolor="#fbbf24", fontcolor="#000", penwidth=4];
    
    Objective -> VarA [color="#7c3aed", penwidth=2];
    Objective -> VarB [color="#7c3aed", penwidth=2];
    Objective -> VarC [color="#7c3aed", penwidth=2];
    
    VarA -> Con1 [color="#1e40af", penwidth=2];
    VarB -> Con1 [color="#1e40af", penwidth=2];
    VarA -> Con2 [color="#1e40af", penwidth=2];
    VarB -> Con2 [color="#1e40af", penwidth=2];
    VarA -> Con3 [color="#1e40af", penwidth=2];
    VarC -> Con3 [color="#1e40af", penwidth=2];
    
    Con1 -> Solution [color="#c2410c", penwidth=3, label="binding"];
    Con2 -> Solution [color="#c2410c", penwidth=3, label="binding"];
    Con3 -> Solution [style=dashed, color="#c2410c", penwidth=2, label="slack=20"];
}
```

## Worked Example

Based on the cloud instance allocation scenario from `reference/output-formats/optimization.md`:

### Mermaid

```mermaid
graph TD
    Obj["<b>MAXIMIZE</b><br/>Total Throughput<br/>f(x) = 2A + 3B"]
    
    A["Instance Pool A<br/>A ∈ [0, 100]<br/>(2 req/s each)"]
    B["Instance Pool B<br/>B ∈ [0, 50]<br/>(3 req/s each)"]
    
    BudgetCon["<b>Budget Constraint</b><br/>50A + 200B ≤ 5000"]
    LatencyCon["<b>Latency SLA</b><br/>tail_latency ≤ 100ms<br/>requires A ≥ 25"]
    
    Optimal["<b>OPTIMAL ★</b><br/>A=50, B=20<br/>Throughput=160 req/s"]
    
    Obj --> A
    Obj --> B
    A --> BudgetCon
    B --> BudgetCon
    A --> LatencyCon
    
    BudgetCon -->|binding| Optimal
    LatencyCon -.->|slack| Optimal
    
    style Obj fill:#a855f7,stroke:#7c3aed,color:#fff
    style A fill:#3b82f6,stroke:#1e40af,color:#fff
    style B fill:#3b82f6,stroke:#1e40af,color:#fff
    style BudgetCon fill:#f97316,stroke:#c2410c,color:#fff,stroke-width:3px
    style LatencyCon fill:#f97316,stroke:#c2410c,color:#fff
    style Optimal fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:4px
```

### DOT

```dot
digraph CloudAllocation {
    rankdir=TB;
    
    Obj [label="MAXIMIZE\nTotal Throughput\nf(x) = 2A + 3B", 
         shape=diamond, style="filled", fillcolor="#a855f7", fontcolor="white", width=1.5];
    
    node [shape=box, style="filled"];
    A [label="Instance Pool A\nA ∈ [0, 100]\n(2 req/s each)", fillcolor="#3b82f6", fontcolor="white"];
    B [label="Instance Pool B\nB ∈ [0, 50]\n(3 req/s each)", fillcolor="#3b82f6", fontcolor="white"];
    
    node [shape=hexagon, style="filled"];
    BudgetCon [label="BUDGET\n50A + 200B ≤ 5000", 
               fillcolor="#f97316", fontcolor="white", penwidth=3];
    LatencyCon [label="LATENCY SLA\nA ≥ 25", 
                fillcolor="#f97316", fontcolor="white"];
    
    node [shape=star, style="filled"];
    Optimal [label="OPTIMAL ★\nA=50, B=20\nThroughput=160 req/s\nBudget binding", 
             fillcolor="#fbbf24", fontcolor="#000", penwidth=4];
    
    Obj -> A [color="#7c3aed", penwidth=2];
    Obj -> B [color="#7c3aed", penwidth=2];
    
    A -> BudgetCon [color="#1e40af", penwidth=2];
    B -> BudgetCon [color="#1e40af", penwidth=2];
    A -> LatencyCon [color="#1e40af", penwidth=2];
    
    BudgetCon -> Optimal [color="#c2410c", penwidth=3, label="binding"];
    LatencyCon -> Optimal [style=dashed, color="#c2410c", penwidth=2, label="slack"];
}
```

## Special Cases

- **Binding constraints**: Draw with thick red borders and bold labels; these are the limiting factors at the optimum.
- **Non-binding constraints**: Draw with thinner borders; they have slack (unused capacity) and do not affect the optimal solution.
- **Sensitivity annotations**: For binding constraints, optionally add a label showing how much the objective would improve if the constraint were relaxed (shadow price or dual value).
- **Infeasibility**: If the problem is infeasible, shade the feasible region in red and label the constraint intersection as "∅ (empty)".
- **Integer solutions**: If variables are restricted to integers, mark them with a "Z" or "ℤ" superscript to distinguish from continuous variables.
- **Multi-objective trade-off**: For problems with competing objectives, render the Pareto frontier as a thick curved or stepped line, with the solution choice marked on the frontier.
