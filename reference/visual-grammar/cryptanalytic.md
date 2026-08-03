# Visual Grammar: Cryptanalytic

How to render a `cryptanalytic` thought as a diagram.

## Node Structure

Cryptanalytic diagrams use Alan Turing's deciban system to visualize hypothesis testing and evidence accumulation. Structure:
- **Hypothesis columns** (vertically stacked): One column per candidate hypothesis
- **Hypothesis header** (at top of column): Hypothesis name with prior probability
- **Cumulative deciban bars** (stacked/annotated on column): Each observation adds decibans; bar grows/shrinks as evidence accumulates
- **Evidence blocks** (horizontal rows): Each row represents one observation; label shows decibans and likelihood ratio
- **Confirmation threshold** (horizontal reference line): Typically at +20 decibans (odds 100:1 for); -20 decibans (odds 100:1 against)
- **Winner highlight** (gold/star): The hypothesis with highest cumulative decibans
- **Likelihood ratio labels** (on edges): P(evidence|hypothesis) / P(evidence|¬hypothesis)

Node colors:
- **Green**: Positive decibans (supports hypothesis)
- **Red**: Negative decibans (refutes hypothesis)
- **Blue**: Neutral decibans (0 or near-zero)
- **Gold**: Winner / confirmed hypothesis
- **Gray**: Refuted hypothesis

## Edge Semantics

- **Vertical bar/column** — Evidence accumulation for one hypothesis
- **Horizontal bar** — Evidence observation applicable to multiple hypotheses
- **Arrow label** — Decibans value (positive = supports, negative = refutes)
- **Thick border** — Binding constraint: this evidence is decisive

## Mermaid Template

```mermaid
graph TD
    subgraph H1["<b>H1: Credential Stuffing</b><br/>Prior: 0.70"]
        E1["47/50 from /24 subnet<br/>+8.0 db (LR=6.3)"]
        E2["38 distinct accounts<br/>1-2 hits each<br/>+6.5 db (LR=4.5)"]
        E3["Timing 1.2s ± 0.08s<br/>+5.0 db (LR=3.2)"]
        E4["Running total:<br/>+19.5 db (89:1 odds)"]
    end
    
    subgraph H2["<b>H2: User Error</b><br/>Prior: 0.25"]
        E5["No deployment 24h<br/>-5.0 db (LR=0.32)"]
        E6["Pattern too regular<br/>-8.0 db (LR=0.13)"]
        E7["Running total:<br/>-13.0 db (20:1 against)"]
    end
    
    subgraph H3["<b>H3: Network Issue</b><br/>Prior: 0.05"]
        E8["Geolocation shows US<br/>-6.0 db (no match)"]
        E9["Timing matches<br/>business hours<br/>-10.0 db"]
        E10["Running total:<br/>-16.0 db (39:1 against)"]
    end
    
    Threshold["<b>THRESHOLDS</b><br/>+20 db = Confirmed<br/>-20 db = Refuted"]
    
    Winner["<b>WINNER ★</b><br/>Credential Stuffing<br/>Score: +19.5 db<br/>Status: Inconclusive<br/>(1 more observation<br/>to confirm)"]
    
    E1 --> E4
    E2 --> E4
    E3 --> E4
    E5 --> E7
    E6 --> E7
    E8 --> E10
    E9 --> E10
    
    E4 -.-> Winner
    E7 -.-> Winner
    E10 -.-> Winner
    
    style E1 fill:#10b981,stroke:#047857,color:#fff
    style E2 fill:#10b981,stroke:#047857,color:#fff
    style E3 fill:#10b981,stroke:#047857,color:#fff
    style E4 fill:#10b981,stroke:#047857,color:#fff,stroke-width:3px
    style E5 fill:#ef4444,stroke:#b91c1c,color:#fff
    style E6 fill:#ef4444,stroke:#b91c1c,color:#fff
    style E7 fill:#ef4444,stroke:#b91c1c,color:#fff,stroke-width:3px
    style E8 fill:#ef4444,stroke:#b91c1c,color:#fff
    style E9 fill:#ef4444,stroke:#b91c1c,color:#fff
    style E10 fill:#ef4444,stroke:#b91c1c,color:#fff,stroke-width:3px
    style Threshold fill:#f0f0f0,stroke:#333,color:#000
    style Winner fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:3px
```

## DOT Template

```dot
digraph Cryptanalytic {
    rankdir=LR;
    node [shape=box, style="filled"];
    
    subgraph cluster_h1 {
        label="H1: Credential Stuffing\nPrior: 0.70\nCumulative: +19.5 db (89:1 odds)";
        labelloc=top;
        style=filled;
        fillcolor="#dcfce7";
        
        H1E1 [label="47/50 from /24\n+8.0 db\nLR=6.3", fillcolor="#10b981", fontcolor="white"];
        H1E2 [label="38 distinct accts\n1-2 hits each\n+6.5 db\nLR=4.5", fillcolor="#10b981", fontcolor="white"];
        H1E3 [label="Timing regular\n1.2s ± 0.08s\n+5.0 db\nLR=3.2", fillcolor="#10b981", fontcolor="white"];
        H1Total [label="TOTAL\n+19.5 db\n(inconclusive)", 
                 fillcolor="#fbbf24", fontcolor="#000", penwidth=3];
        
        H1E1 -> H1E2 -> H1E3 -> H1Total;
    }
    
    subgraph cluster_h2 {
        label="H2: User Error\nPrior: 0.25\nCumulative: -13.0 db (20:1 against)";
        labelloc=top;
        style=filled;
        fillcolor="#fee2e2";
        
        H2E1 [label="No deployment 24h\n-5.0 db\nLR=0.32", fillcolor="#ef4444", fontcolor="white"];
        H2E2 [label="Pattern too regular\n-8.0 db\nLR=0.13", fillcolor="#ef4444", fontcolor="white"];
        H2Total [label="TOTAL\n-13.0 db\n(likely false)", 
                 fillcolor="#fca5a5", fontcolor="#000", penwidth=2];
        
        H2E1 -> H2E2 -> H2Total;
    }
    
    subgraph cluster_h3 {
        label="H3: Network Issue\nPrior: 0.05\nCumulative: -16.0 db (39:1 against)";
        labelloc=top;
        style=filled;
        fillcolor="#fee2e2";
        
        H3E1 [label="Geo shows US\n-6.0 db", fillcolor="#ef4444", fontcolor="white"];
        H3E2 [label="Timing matches\nbusiness hours\n-10.0 db", fillcolor="#ef4444", fontcolor="white"];
        H3Total [label="TOTAL\n-16.0 db\n(likely false)", 
                 fillcolor="#fca5a5", fontcolor="#000", penwidth=2];
        
        H3E1 -> H3E2 -> H3Total;
    }
    
    Threshold [label="CONFIRMATION THRESHOLDS\n+20 db = Confirmed (100:1)\n-20 db = Refuted (100:1 against)", 
               shape=plaintext];
    
    Winner [label="WINNER ★\nCredential Stuffing\n+19.5 db\nStatus: Inconclusive\n(needs 1 more evidence)", 
            fillcolor="#fbbf24", fontcolor="#000", penwidth=4];
    
    H1Total -> Winner;
    H2Total -> Winner;
    H3Total -> Winner;
}
```

## Worked Example

Based on credential-stuffing vs. user-error detection from `reference/output-formats/cryptanalytic.md`:

### Mermaid

```mermaid
graph TD
    subgraph Hyp1["<b>H1: Credential Stuffing</b><br/>Prior: 70%"]
        E1["47/50 from /24 subnet<br/>+8.0 db (LR=6.3)<br/>Network concentration"]
        E2["38 accts, 1-2 hits each<br/>+6.5 db (LR=4.5)<br/>Sweep pattern"]
        E3["Timing: 1.2s ± 0.08s<br/>+5.0 db (LR=3.2)<br/>Scripted behavior"]
        Tot1["<b>TOTAL +19.5 db</b><br/>Odds: 89:1<br/>Status: INCONCLUSIVE<br/>(1 more observation = confirm)"]
    end
    
    subgraph Hyp2["<b>H2: User Error</b><br/>Prior: 25%"]
        E4["No deploy in 24h<br/>-5.0 db (LR=0.32)<br/>Rules out code change"]
        E5["Timing too regular<br/>-8.0 db (LR=0.13)<br/>Humans aren't this precise"]
        Tot2["<b>TOTAL -13.0 db</b><br/>Odds: 20:1 against<br/>Status: UNLIKELY"]
    end
    
    subgraph Hyp3["<b>H3: Network Issue</b><br/>Prior: 5%"]
        E6["Geo shows US<br/>-6.0 db (LR=0.24)"]
        E7["Timing matches<br/>business hours<br/>-10.0 db (LR=0.10)"]
        Tot3["<b>TOTAL -16.0 db</b><br/>Odds: 39:1 against<br/>Status: UNLIKELY"]
    end
    
    Thresh["<b>Thresholds</b><br/>+20 db = Confirmed<br/>-20 db = Refuted"]
    
    Action["<b>ACTION</b><br/>★ Rate-limit /24<br/>★ Require MFA<br/>★ Monitor for +1 more signal"]
    
    E1 --> Tot1
    E2 --> Tot1
    E3 --> Tot1
    E4 --> Tot2
    E5 --> Tot2
    E6 --> Tot3
    E7 --> Tot3
    
    Tot1 --> Action
    Tot2 --> Action
    Tot3 --> Action
    
    style E1 fill:#10b981,stroke:#047857,color:#fff
    style E2 fill:#10b981,stroke:#047857,color:#fff
    style E3 fill:#10b981,stroke:#047857,color:#fff
    style Tot1 fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:3px
    style E4 fill:#ef4444,stroke:#b91c1c,color:#fff
    style E5 fill:#ef4444,stroke:#b91c1c,color:#fff
    style Tot2 fill:#fca5a5,stroke:#b91c1c,color:#000
    style E6 fill:#ef4444,stroke:#b91c1c,color:#fff
    style E7 fill:#ef4444,stroke:#b91c1c,color:#fff
    style Tot3 fill:#fca5a5,stroke:#b91c1c,color:#000
    style Thresh fill:#f0f0f0,stroke:#333,color:#000
    style Action fill:#10b981,stroke:#047857,color:#fff,stroke-width:3px
```

### DOT

```dot
digraph CredentialStuffingDetection {
    rankdir=LR;
    
    subgraph cluster_h1 {
        label="H1: Credential Stuffing | Prior: 70%";
        labelloc=top;
        style=filled;
        fillcolor="#dcfce7";
        
        node [shape=box, style="filled"];
        H1E1 [label="47/50 from /24 subnet\n+8.0 db | LR=6.3", 
              fillcolor="#10b981", fontcolor="white"];
        H1E2 [label="38 accounts, 1-2 hits each\n+6.5 db | LR=4.5", 
              fillcolor="#10b981", fontcolor="white"];
        H1E3 [label="Timing: 1.2s ± 0.08s\n+5.0 db | LR=3.2", 
              fillcolor="#10b981", fontcolor="white"];
        H1Total [label="TOTAL: +19.5 db\nOdds: 89:1\nINCONCLUSIVE", 
                 fillcolor="#fbbf24", fontcolor="#000", penwidth=3];
        
        H1E1 -> H1E2 -> H1E3 -> H1Total;
    }
    
    subgraph cluster_h2 {
        label="H2: User Error | Prior: 25%";
        labelloc=top;
        style=filled;
        fillcolor="#fee2e2";
        
        node [shape=box, style="filled"];
        H2E1 [label="No deployment 24h\n-5.0 db | LR=0.32", 
              fillcolor="#ef4444", fontcolor="white"];
        H2E2 [label="Timing too regular\n-8.0 db | LR=0.13", 
              fillcolor="#ef4444", fontcolor="white"];
        H2Total [label="TOTAL: -13.0 db\nOdds: 20:1 against\nUNLIKELY", 
                 fillcolor="#fca5a5", fontcolor="#000", penwidth=2];
        
        H2E1 -> H2E2 -> H2Total;
    }
    
    subgraph cluster_h3 {
        label="H3: Network Issue | Prior: 5%";
        labelloc=top;
        style=filled;
        fillcolor="#fee2e2";
        
        node [shape=box, style="filled"];
        H3E1 [label="Geographic: US only\n-6.0 db | LR=0.24", 
              fillcolor="#ef4444", fontcolor="white"];
        H3E2 [label="Timing: business hours\n-10.0 db | LR=0.10", 
              fillcolor="#ef4444", fontcolor="white"];
        H3Total [label="TOTAL: -16.0 db\nOdds: 39:1 against\nUNLIKELY", 
                 fillcolor="#fca5a5", fontcolor="#000", penwidth=2];
        
        H3E1 -> H3E2 -> H3Total;
    }
    
    node [shape=box, style="filled"];
    Action [label="RECOMMENDED ACTIONS\n★ Rate-limit the /24 subnet\n★ Require MFA for affected accounts\n★ Monitor for 1 more independent signal\n   (e.g., username matches breached DB)", 
            fillcolor="#10b981", fontcolor="white", penwidth=3];
    
    H1Total -> Action;
    H2Total -> Action;
    H3Total -> Action;
}
```

## Special Cases

- **Deciban bar chart** (alternative visualization): Render cumulative decibans as horizontal bars for each hypothesis; bar length extends left (negative) or right (positive) from the zero-line; easier to compare totals at a glance.
- **Evidence independence**: If an observation depends on prior evidence (not independent), annotate the edge with "⚠ conditional" to signal violation of the additive assumption.
- **Likelihood ratio validation**: For complex observations, show the likelihood ratio derivation step (e.g., "P(timing|scripted) = 0.96, P(timing|human) = 0.30, LR = 3.2").
- **Prior vs. posterior**: Optionally show both the prior probability (before evidence) and posterior probability (after all evidence) for each hypothesis, displayed as pie slices or as a ratio.
- **Sensitivity analysis**: If one piece of evidence is weighted heavily, annotate it with "Critical" or show what happens if that evidence is discounted (e.g., "Without this observation, total = +11.5 db → inconclusive").
- **Multiple thought types**: Connect this diagram to prior `frequency_analysis` or `pattern_recognition` thoughts using dashed edges labeled "builds on" to show the progression of evidence gathering.
