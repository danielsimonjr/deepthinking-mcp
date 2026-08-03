# Visual Grammar: Temporal

How to render a `temporal` thought as a diagram.

## Node Structure

- **Events** → Stadium/pill-shaped nodes on the timeline (timestamp label inside or above)
- **Intervals** → Rectangles spanning the timeline with duration label
- **Timeline axis** → Horizontal line with time unit tick marks
- **Allen relations** → Bracket annotations between events/intervals showing the relation type

## Edge Semantics

- **Causation** → Solid arrow with `causes` label and delay `(+Δt)` annotation
- **Enablement** → Dashed arrow with `enables` label
- **Prevention** → Dashed red arrow with `prevents` label
- **Temporal constraint** → Bracket showing Allen relation (before, meets, overlaps, during, etc.) with confidence score

## Mermaid Template

```mermaid
graph LR
  subgraph timeline["T0 -------- T1 -------- T2 -------- T3"]
    E1["Event A<br/>T=0"]
    E2["Event B<br/>T=4"]
    E3["Event C<br/>T=8"]
  end
  
  E1 -->|causes +4min| E2
  E2 -->|enables +4min| E3
  
  style timeline fill:none,stroke:#999
  style E1 fill:#e8f4f8,stroke:#0066cc
  style E2 fill:#fffacd,stroke:#ff9900
  style E3 fill:#e8f8e8,stroke:#00cc00
```

## DOT Template

```dot
digraph TemporalAnalysis {
  rankdir=LR;
  node [shape=box, style="filled", fontname="Arial"];

  T0 [label="T=0", shape=plaintext];
  T4 [label="T=4", shape=plaintext];
  T8 [label="T=8", shape=plaintext];

  E1 [label="Event A", fillcolor="#e8f4f8", color="#0066cc"];
  I1 [label="Interval [0,8]", fillcolor="#fffacd"];
  E2 [label="Event B", fillcolor="#fffacd", color="#ff9900"];
  E3 [label="Event C", fillcolor="#e8f8e8", color="#00cc00"];

  T0 -> E1 [style=invis];
  E1 -> E2 [label="causes\ndelay=4"];
  E2 -> E3 [label="enables\ndelay=4"];
  T4 -> E2 [style=invis];
  T8 -> E3 [style=invis];
}
```

## Worked Example

Input: "The 502 error first appeared 4 minutes before the CPU alert. The upstream deployment completed at T+0." (from temporal.md)

**Mermaid:**
```mermaid
graph LR
  T0["<b>T=0</b>"]
  T4["<b>T=4</b>"]
  T8["<b>T=8</b>"]
  
  DEP["⭐ Upstream deploy<br/>completes<br/>v2.3.1"]
  ERR["🔴 502 errors begin<br/>Bad Gateway"]
  ALERT["⚠️ CPU alert fires<br/>80% threshold"]
  
  T0 --> DEP
  T4 --> ERR
  T8 --> ALERT
  
  DEP -->|causes<br/>delay=4min<br/>strength=0.82| ERR
  ERR -->|enables<br/>delay=4min<br/>strength=0.6| ALERT
  
  NOTE["⏱️ Allen relation:<br/>DEP before ERR before ALERT<br/>Temporal paradox check: ✓ None"]
  
  style DEP fill:#e8f8e8,stroke:#00cc00,stroke-width:2px
  style ERR fill:#ffe8e8,stroke:#cc0000,stroke-width:2px
  style ALERT fill:#fff8e8,stroke:#ff9900,stroke-width:2px
  style NOTE fill:#f0f0f0,stroke:#666
```

**DOT:**
```dot
digraph IncidentTimeline {
  rankdir=LR;
  node [shape=box, style="filled", fontname="Arial"];

  TLINE [label="Incident Timeline (minutes)", shape=plaintext, fontsize=14];

  T0 [label="T = 0", shape=plaintext];
  T4 [label="T = 4", shape=plaintext];
  T8 [label="T = 8", shape=plaintext];
  T10 [label="T = 10", shape=plaintext];

  DEP [label="Upstream\nDeployment\nCompletes", fillcolor="#e8f8e8", color="#00cc00", penwidth=2];
  ERR [label="502 Errors\nStart", fillcolor="#ffe8e8", color="#cc0000", penwidth=2];
  ALERT [label="CPU Alert\nFires", fillcolor="#fff8e8", color="#ff9900", penwidth=2];

  TLINE -> T0 [style=invis];
  T0 -> DEP [label="instant"];
  T0 -> T4 [style=invis];
  T4 -> ERR [label="instant"];
  T4 -> T8 [style=invis];
  T8 -> ALERT [label="instant"];
  T8 -> T10 [style=invis];

  DEP -> ERR [label="causes\ndelay=+4min\nstrength=0.82", penwidth=2];
  ERR -> ALERT [label="enables\ndelay=+4min\nstrength=0.6"];
}
```

## Special Cases

- **Allen's interval algebra** → For each pair of events/intervals, show the relation in a bracket annotation: `[before]`, `[meets]`, `[overlaps]`, `[during]`, `[equals]`, etc.; use Unicode bracket characters or text labels
- **Circular temporal dependencies** → Show with a loop arrow marked "⚠ Temporal loop"; flag as a potential paradox
- **Unknown timing** → Use dashed edges with "unknown delay" label; confidence value on edge
- **Dense timelines** → Use horizontal stacking with multiple time axes or grid layout; show events as vertical lines crossing the timeline
