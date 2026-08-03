# Visual Grammar: Critique

How to render a `critique` thought as a diagram.

## Node Structure

Critique diagrams display analysis across parallel columns:
- **Strengths column** (left, green boxes): positive attributes, well-executed aspects
- **Weaknesses column** (center-left, red boxes): limitations, deficiencies, risks
- **Socratic questions column** (center-right, yellow boxes): thought-provoking questions (5 types: clarification, probing, assumption-testing, implication-exploring, perspective-taking)
- **Actionable suggestions column** (right, blue boxes): concrete improvements or next steps
- **Severity indicators** (node border color saturation): darker borders = higher impact

## Edge Semantics

- **No direct edges** between columns; instead, each finding stands independently
- **Layout via subgraphs**: Organize nodes into columnar subgraphs for visual clarity
- **Border thickness/color**: Darker or thicker borders indicate higher severity or importance

## Mermaid Template

```mermaid
graph LR
    subgraph Strengths["Strengths ✓"]
        S1["Clear API design<br/>(intuitive)"]
        S2["Good error handling<br/>(informative)"]
    end
    
    subgraph Weaknesses["Weaknesses ✗"]
        W1["Incomplete documentation<br/>(high severity)"]
        W2["Inconsistent naming<br/>(medium severity)"]
    end
    
    subgraph SocraticQ["Socratic Questions"]
        Q1["Clarification:<br/>What does 'reliable'<br/>mean in context?"]
        Q2["Assumption:<br/>Are we assuming<br/>all users are technical?"]
    end
    
    subgraph Actions["Actionable Suggestions"]
        A1["Add API examples<br/>to docs (2 days)"]
        A2["Standardize naming<br/>conventions (3 days)"]
    end
    
    style S1 fill:#99ff99,stroke:#00aa00,stroke-width:2px
    style S2 fill:#99ff99,stroke:#00aa00,stroke-width:2px
    style W1 fill:#ff9999,stroke:#cc0000,stroke-width:3px
    style W2 fill:#ffcccc,stroke:#ff6666,stroke-width:2px
    style Q1 fill:#ffff99,stroke:#ffcc00,stroke-width:2px
    style Q2 fill:#ffff99,stroke:#ffcc00,stroke-width:2px
    style A1 fill:#99ccff,stroke:#0066cc,stroke-width:2px
    style A2 fill:#99ccff,stroke:#0066cc,stroke-width:2px
```

## DOT Template

```dot
digraph Critique {
    rankdir=LR;
    node [style="filled"];
    
    subgraph cluster_strengths { label="Strengths ✓"; color="#00aa00";
        S1 [label="Clear API design\n(intuitive)", shape=box, fillcolor="#99ff99"];
        S2 [label="Good error handling\n(informative)", shape=box, fillcolor="#99ff99"];
    }
    
    subgraph cluster_weaknesses { label="Weaknesses ✗"; color="#cc0000";
        W1 [label="Incomplete documentation\n(HIGH severity)", shape=box, fillcolor="#ff9999", penwidth=3];
        W2 [label="Inconsistent naming\n(medium severity)", shape=box, fillcolor="#ffcccc"];
    }
    
    subgraph cluster_questions { label="Socratic Questions"; color="#ffcc00";
        Q1 [label="Clarification:\nWhat does 'reliable'\nmean in context?", shape=box, fillcolor="#ffff99"];
        Q2 [label="Assumption:\nAre we assuming\nall users are technical?", shape=box, fillcolor="#ffff99"];
    }
    
    subgraph cluster_actions { label="Actionable Suggestions"; color="#0066cc";
        A1 [label="Add API examples\nto docs (2 days)", shape=box, fillcolor="#99ccff"];
        A2 [label="Standardize naming\nconventions (3 days)", shape=box, fillcolor="#99ccff"];
    }
}
```

## Worked Example

Based on architecture critique from `reference/output-formats/critique.md`:

### Mermaid

```mermaid
graph LR
    subgraph Strengths["✓ Strengths"]
        S1["Layered architecture<br/>(clear separation)"]
        S2["Async/await throughout<br/>(responsive)"]
        S3["Good monitoring setup<br/>(production-ready)"]
    end
    
    subgraph Weaknesses["✗ Weaknesses"]
        W1["Circular dependency<br/>between Auth & DB<br/>(HIGH RISK)"]
        W2["No circuit breaker<br/>on external APIs<br/>(medium risk)"]
        W3["Hard-coded secrets<br/>in config (CRITICAL)"]
    end
    
    subgraph Socratic["? Socratic Questions"]
        Q1["Clarification: How do you<br/>currently handle auth<br/>during DB migrations?"]
        Q2["Probing: What happens<br/>when the payment API<br/>times out?"]
        Q3["Assumption: Are we<br/>assuming horizontal scaling<br/>with shared state?"]
        Q4["Implication: If we add<br/>caching, what about<br/>invalidation?"]
    end
    
    subgraph Actions["→ Actions"]
        A1["Break circular dep<br/>via event bus (5d)"]
        A2["Add Hystrix<br/>circuit breaker (2d)"]
        A3["Move secrets to<br/>env vars (1d)"]
        A4["Add cache invalidation<br/>strategy (3d)"]
    end
    
    style S1 fill:#99ff99,stroke:#00aa00
    style S2 fill:#99ff99,stroke:#00aa00
    style S3 fill:#99ff99,stroke:#00aa00
    style W1 fill:#ff9999,stroke:#cc0000,stroke-width:3px
    style W2 fill:#ffcccc,stroke:#ff6666
    style W3 fill:#ff6666,stroke:#990000,stroke-width:3px
    style Q1 fill:#ffff99,stroke:#ffcc00
    style Q2 fill:#ffff99,stroke:#ffcc00
    style Q3 fill:#ffff99,stroke:#ffcc00
    style Q4 fill:#ffff99,stroke:#ffcc00
    style A1 fill:#99ccff,stroke:#0066cc
    style A2 fill:#99ccff,stroke:#0066cc
    style A3 fill:#99ccff,stroke:#0066cc
    style A4 fill:#99ccff,stroke:#0066cc
```

### DOT

```dot
digraph ArchitectureCritique {
    rankdir=LR;
    node [style="filled"];
    
    subgraph cluster_strengths { label="Strengths ✓"; color="#00aa00";
        S1 [label="Layered architecture\n(clear separation)", shape=box, fillcolor="#99ff99"];
        S2 [label="Async/await\nthroughout", shape=box, fillcolor="#99ff99"];
        S3 [label="Good monitoring\nsetup", shape=box, fillcolor="#99ff99"];
    }
    
    subgraph cluster_weaknesses { label="Weaknesses ✗"; color="#cc0000";
        W1 [label="Circular dependency:\nAuth & DB\n(HIGH RISK)", shape=box, fillcolor="#ff9999", penwidth=3];
        W2 [label="No circuit breaker\non external APIs\n(medium risk)", shape=box, fillcolor="#ffcccc"];
        W3 [label="Hard-coded secrets\nin config\n(CRITICAL)", shape=box, fillcolor="#ff6666", penwidth=3];
    }
    
    subgraph cluster_socratic { label="Socratic Questions"; color="#ffcc00";
        Q1 [label="Clarification: How do you\nhandle auth during\nDB migrations?", shape=box, fillcolor="#ffff99"];
        Q2 [label="Probing: What happens\nwhen payment API\ntimes out?", shape=box, fillcolor="#ffff99"];
        Q3 [label="Assumption: Are we\nassuming horizontal\nscaling?", shape=box, fillcolor="#ffff99"];
        Q4 [label="Implication: If we cache,\nwhat about\ninvalidation?", shape=box, fillcolor="#ffff99"];
    }
    
    subgraph cluster_actions { label="Actionable Suggestions"; color="#0066cc";
        A1 [label="Break circular dep\nvia event bus (5d)", shape=box, fillcolor="#99ccff"];
        A2 [label="Add Hystrix\ncircuit breaker (2d)", shape=box, fillcolor="#99ccff"];
        A3 [label="Move secrets to\nenv vars (1d)", shape=box, fillcolor="#99ccff"];
        A4 [label="Add cache invalidation\nstrategy (3d)", shape=box, fillcolor="#99ccff"];
    }
}
```

## Special Cases

- **Severity color coding**: Use deeper red for critical findings, medium red/orange for medium-severity, light red for low-severity weaknesses. Apply similar scaling to suggestions (darker blue = higher priority).
- **Linking findings to suggestions**: Though not shown as explicit edges in the base template, you can add dashed edges connecting weaknesses to their corresponding actionable suggestions for clarity.
- **Grouping by theme**: If there are many items, group them hierarchically (e.g., "Performance Weaknesses", "Security Weaknesses", "UX Strengths").
- **Confidence/priority labels**: On each finding, optionally show priority (P0/P1/P2) or confidence (high/medium/low) as a badge.
- **Timeline integration**: Actionable suggestions can include effort estimates (e.g., "2d", "1 week") to help prioritize and scope remediation.

