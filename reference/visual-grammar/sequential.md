# Visual Grammar: Sequential

How to render a `sequential` thought as a diagram.

## Node Structure

Sequential thoughts are chains of iterative reasoning steps. Each thought is rendered as a **rounded rectangle** (stadium shape) with:
- **Badge**: `thoughtNumber` displayed in top-left corner (e.g., "①", "②", "③")
- **Content excerpt**: First 60 characters of the thought content
- **Revision indicator**: If `isRevision` is true, add a small "↺" symbol in the top-right

Related concepts:
- **Dependencies** → Incoming solid arrows from prior thoughts
- **Revisions** → Dashed backward arrows labeled "revises" pointing to the original thought
- **Branches** → Thick parallel arrows labeled "branches" to indicate parallel exploration paths

## Edge Semantics

- **Solid arrow** (`→`) — Direct dependency: `thoughtNumber` N depends on N-1 or is in the `dependencies` array
- **Dashed arrow** (`⇢`) — Revision: thought X revises an earlier thought, labeled with `revisionReason` excerpt
- **Thick solid arrow** (`⟹`) — Branch: thick line to indicate a new exploratory path from the parent thought, labeled with `branchId`

## Mermaid Template

```mermaid
graph TD
    T1["<b>①</b><br/>Identify the three services<br/>involved in the migration:<br/>API, workers, and DB"]
    T2["<b>②</b><br/>Plan the migration strategy<br/>starting with the database,<br/>then replicate data"]
    T3["<b>③</b><br/>Provision new infrastructure<br/>in the staging environment<br/>and test connections"]
    T4["<b>④</b><br/>Perform live cutover<br/>with minimal downtime<br/>using read replicas"]
    T5["<b>⓹</b><br/>Post-validation: verify<br/>data integrity and<br/>performance metrics"]
    
    T1 --> T2
    T2 --> T3
    T3 --> T4
    T4 --> T5
    
    style T1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T4 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T5 fill:#3b82f6,stroke:#1e40af,color:#fff
```

## DOT Template

```dot
digraph Sequential {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];
    
    T1 [label="①\nIdentify the three services\ninvolved in the migration:\nAPI, workers, and DB", 
        fillcolor="#3b82f6", fontcolor="white"];
    T2 [label="②\nPlan the migration strategy\nstarting with the database,\nthen replicate data", 
        fillcolor="#3b82f6", fontcolor="white"];
    T3 [label="③\nProvision new infrastructure\nin the staging environment\nand test connections", 
        fillcolor="#3b82f6", fontcolor="white"];
    T4 [label="④\nPerform live cutover\nwith minimal downtime\nusing read replicas", 
        fillcolor="#3b82f6", fontcolor="white"];
    T5 [label="⓹\nPost-validation: verify\ndata integrity and\nperformance metrics", 
        fillcolor="#3b82f6", fontcolor="white"];
    
    T1 -> T2 [color="#1e40af", penwidth=2];
    T2 -> T3 [color="#1e40af", penwidth=2];
    T3 -> T4 [color="#1e40af", penwidth=2];
    T4 -> T5 [color="#1e40af", penwidth=2];
}
```

## Worked Example

Based on the database migration scenario from `reference/output-formats/sequential.md`:

### Mermaid

```mermaid
graph TD
    T1["<b>①</b><br/>Identify the three services<br/>involved: API, workers, DB"]
    T2["<b>②</b><br/>Assess replication readiness<br/>and connection pooling"]
    T3["<b>③</b><br/>Provision staging infra<br/>and test data replication"]
    T4["<b>④</b><br/>Execute cutover<br/>with zero downtime"]
    T5["<b>⓹</b><br/>Post-validation:<br/>data integrity check"]
    T6["<b>⓹R</b> ↺<br/>Revise strategy:<br/>adjust connection timeouts"]
    
    T1 --> T2
    T2 --> T3
    T3 --> T4
    T4 --> T5
    T5 -.->|revises| T3
    T5 --> T6
    
    style T1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T4 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T5 fill:#3b82f6,stroke:#1e40af,color:#fff
    style T6 fill:#a855f7,stroke:#7c3aed,color:#fff
```

### DOT

```dot
digraph SequentialMigration {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];
    
    T1 [label="①\nIdentify the three services\ninvolved: API, workers, DB", 
        fillcolor="#3b82f6", fontcolor="white"];
    T2 [label="②\nAssess replication readiness\nand connection pooling", 
        fillcolor="#3b82f6", fontcolor="white"];
    T3 [label="③\nProvision staging infra\nand test data replication", 
        fillcolor="#3b82f6", fontcolor="white"];
    T4 [label="④\nExecute cutover\nwith zero downtime", 
        fillcolor="#3b82f6", fontcolor="white"];
    T5 [label="⓹\nPost-validation:\ndata integrity check", 
        fillcolor="#3b82f6", fontcolor="white"];
    T6 [label="⓹R ↺\nRevise strategy:\nadjust connection timeouts", 
        fillcolor="#a855f7", fontcolor="white"];
    
    T1 -> T2 [color="#1e40af", penwidth=2];
    T2 -> T3 [color="#1e40af", penwidth=2];
    T3 -> T4 [color="#1e40af", penwidth=2];
    T4 -> T5 [color="#1e40af", penwidth=2];
    T5 -> T3 [label="revises", style=dashed, color="#a855f7", penwidth=2];
    T5 -> T6 [color="#a855f7", penwidth=2];
}
```

## Special Cases

- **Revisions**: When a thought revises an earlier step (`isRevision=true`), draw a dashed arrow pointing backward to the revised thought, labeled with the revision reason (e.g., "revises: discovered connection pool bug").
- **Branching**: When `branchFrom` is set, draw a thick parallel arrow from the parent to the new branch, labeled with the `branchId` to show exploratory paths.
- **Optional next thought**: If `nextThoughtNeeded` is false, mark the final node with a checkmark (✓) or use a stadium/pill shape for terminal nodes.
- **Multiple dependencies**: When a thought depends on multiple prior thoughts, draw arrows from each, allowing the node to have multiple incoming edges.

