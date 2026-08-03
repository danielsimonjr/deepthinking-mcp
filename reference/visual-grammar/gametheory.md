# Visual Grammar: Game Theory

How to render a `gametheory` thought as a diagram.

## Node Structure

Game theory diagrams show players, strategies, payoffs, and equilibria. Structure:
- **Player nodes** (circles): One circle per player, labeled with player name
- **Strategy branches** (from each player): Radiating outward or stacked below player node
- **Payoff matrix** (as a subgraph or grid): Entries showing payoff pairs for each strategy combination
- **Nash equilibrium nodes** (bold border or star): Highlighted entries where no player wants to deviate
- **Dominant strategy highlight** (thick border or special color): Strategy that is strictly or weakly dominant

Node colors:
- **Blue**: Player nodes
- **Green**: Strategy labels
- **Gold/Yellow**: Nash equilibrium cell
- **Red**: Pareto-dominated outcome

## Edge Semantics

- **Solid arrow** (`→`) — Strategy choice from player to strategy label
- **Thin lines** — Payoff matrix cell boundaries
- **Bold border** (`★`) — Nash equilibrium cell; no player can improve by unilateral deviation
- **Dashed arrow** — Dominant strategy pointer

## Mermaid Template

```mermaid
graph TD
    P1["<b>Player 1</b><br/>(Row)"]
    P2["<b>Player 2</b><br/>(Column)"]
    
    P1S1["Cooperate"]
    P1S2["Defect"]
    P2S1["Cooperate"]
    P2S2["Defect"]
    
    Matrix["<b>Payoff Matrix</b><br/><br/>Cooperate | Defect<br/>———————————<br/>Coop: (3,3) | (-1,5)<br/>Def:  (5,-1) | (1,1)"]
    
    Nash["<b>Nash Equilibrium</b><br/>Players: (Defect, Defect)<br/>Payoffs: (1, 1)"]
    
    P1 --> P1S1
    P1 --> P1S2
    P2 --> P2S1
    P2 --> P2S2
    
    P1S2 -.-> Nash
    P2S2 -.-> Nash
    
    style P1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style P2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style P1S1 fill:#10b981,stroke:#047857,color:#fff
    style P1S2 fill:#10b981,stroke:#047857,color:#fff
    style P2S1 fill:#10b981,stroke:#047857,color:#fff
    style P2S2 fill:#10b981,stroke:#047857,color:#fff
    style Matrix fill:#f0f0f0,stroke:#333,color:#000
    style Nash fill:#f97316,stroke:#c2410c,color:#fff,stroke-width:3px
```

## DOT Template

```dot
digraph GameTheory {
    rankdir=TB;
    node [shape=circle, style="filled"];
    
    P1 [label="Player 1\n(Row)", fillcolor="#3b82f6", fontcolor="white", width=1.2];
    P2 [label="Player 2\n(Column)", fillcolor="#3b82f6", fontcolor="white", width=1.2];
    
    node [shape=box, width=1.5];
    P1C [label="Cooperate", fillcolor="#10b981", fontcolor="white"];
    P1D [label="Defect", fillcolor="#10b981", fontcolor="white"];
    P2C [label="Cooperate", fillcolor="#10b981", fontcolor="white"];
    P2D [label="Defect", fillcolor="#10b981", fontcolor="white"];
    
    subgraph cluster_matrix {
        label="Payoff Matrix";
        labelloc=top;
        node [shape=plaintext];
        Matrix [label=<<TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0">
                   <TR><TD></TD><TD><B>Cooperate</B></TD><TD><B>Defect</B></TD></TR>
                   <TR><TD><B>Cooperate</B></TD><TD BGCOLOR="#10b981">3,3</TD><TD BGCOLOR="#ef4444">-1,5</TD></TR>
                   <TR><TD><B>Defect</B></TD><TD BGCOLOR="#ef4444">5,-1</TD><TD BGCOLOR="#f97316"><B>1,1★</B></TD></TR>
                </TABLE>>];
    }
    
    Nash [label="Nash Equilibrium\n(Defect, Defect)\nPayoffs: (1,1)", 
          shape=box, style="filled,bold", fillcolor="#f97316", fontcolor="white"];
    
    P1 -> P1C [color="#1e40af", penwidth=2];
    P1 -> P1D [color="#1e40af", penwidth=2];
    P2 -> P2C [color="#1e40af", penwidth=2];
    P2 -> P2D [color="#1e40af", penwidth=2];
    P1D -> Nash [style=dashed, color="#c2410c", penwidth=2];
    P2D -> Nash [style=dashed, color="#c2410c", penwidth=2];
}
```

## Worked Example

Based on the cache TTL competition scenario (Prisoner's Dilemma) from `reference/output-formats/gametheory.md`:

### Mermaid

```mermaid
graph TD
    P1["<b>Service A</b><br/>(Row Player)"]
    P2["<b>Service B</b><br/>(Column Player)"]
    
    P1C["Conservative TTL<br/>(60 sec)"]
    P1D["Aggressive TTL<br/>(300 sec)"]
    P2C["Conservative<br/>(60 sec)"]
    P2D["Aggressive<br/>(300 sec)"]
    
    Matrix["<b>Cache Payoff Matrix</b><br/><br/>—— Service B ——<br/>Cons | Agg<br/>Cons: (8,8) | (3,10)<br/>Agg:  (10,3) | (5,5)"]
    
    Nash["<b>Nash Equilibrium ★</b><br/>(Aggressive, Aggressive)<br/>Payoffs: (5, 5)<br/>Pareto-dominated!"]
    
    P1 --> P1C
    P1 --> P1D
    P2 --> P2C
    P2 --> P2D
    
    P1D -.->|defect incentive| Nash
    P2D -.->|defect incentive| Nash
    
    style P1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style P2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style P1C fill:#10b981,stroke:#047857,color:#fff
    style P1D fill:#10b981,stroke:#047857,color:#fff
    style P2C fill:#10b981,stroke:#047857,color:#fff
    style P2D fill:#10b981,stroke:#047857,color:#fff
    style Matrix fill:#f0f0f0,stroke:#333,color:#000
    style Nash fill:#f97316,stroke:#c2410c,color:#fff,stroke-width:4px
```

### DOT

```dot
digraph CacheTTLGame {
    rankdir=TB;
    
    node [shape=circle, style="filled", width=1.2];
    P1 [label="Service A\n(Row)", fillcolor="#3b82f6", fontcolor="white"];
    P2 [label="Service B\n(Column)", fillcolor="#3b82f6", fontcolor="white"];
    
    node [shape=box, width=1.5];
    P1C [label="Conservative\n(60 sec)", fillcolor="#10b981", fontcolor="white"];
    P1D [label="Aggressive\n(300 sec)", fillcolor="#10b981", fontcolor="white"];
    P2C [label="Conservative\n(60 sec)", fillcolor="#10b981", fontcolor="white"];
    P2D [label="Aggressive\n(300 sec)", fillcolor="#10b981", fontcolor="white"];
    
    subgraph cluster_matrix {
        label="Payoff Matrix (Cache Efficiency Score)";
        labelloc=top;
        node [shape=plaintext];
        Matrix [label=<<TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" CELLPADDING="8">
                   <TR><TD></TD><TD><B>Conservative</B></TD><TD><B>Aggressive</B></TD></TR>
                   <TR><TD><B>Conservative</B></TD><TD BGCOLOR="#10b981">(8,8)</TD><TD BGCOLOR="#ef4444">(3,10)</TD></TR>
                   <TR><TD><B>Aggressive</B></TD><TD BGCOLOR="#ef4444">(10,3)</TD><TD BGCOLOR="#f97316"><B>★ (5,5)</B></TD></TR>
                </TABLE>>];
    }
    
    Nash [label="Nash Equilibrium\n(Aggressive, Aggressive)\nPayoffs: (5,5)\nPareto-dominated by (8,8)!", 
          shape=box, style="filled,bold", fillcolor="#f97316", fontcolor="white"];
    
    P1 -> P1C [color="#1e40af", penwidth=2];
    P1 -> P1D [color="#1e40af", penwidth=2];
    P2 -> P2C [color="#1e40af", penwidth=2];
    P2 -> P2D [color="#1e40af", penwidth=2];
    
    P1D -> Nash [style=dashed, color="#c2410c", penwidth=2, label="incentive"];
    P2D -> Nash [style=dashed, color="#c2410c", penwidth=2, label="incentive"];
}
```

## Special Cases

- **Dominant strategies**: Highlight with a thick border or special color (bold green box) to show strategies that dominate all others.
- **Multiple Nash equilibria**: If multiple equilibria exist (e.g., mixed-strategy equilibria), render them all with ★ markers and note which are Pareto-efficient.
- **Zero-sum games**: For zero-sum games, show payoffs in the matrix with negatives: player 1 gains what player 2 loses (e.g., "(3, -3)").
- **Cooperative vs. non-cooperative**: For cooperative games, add a dashed box around the payoff matrix labeled "Coalition" or "Agreement" to show that binding agreements exist.
- **Pareto dominance**: Mark Nash equilibria that are Pareto-dominated (worse for both players than an alternative outcome) with a red outline and the label "Pareto-dominated" to highlight tension between individual incentives and collective welfare.
