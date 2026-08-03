# Visual Grammar: Abductive

How to render an `abductive` thought as a diagram.

## Rendering Dispatch (v0.5.4+)

Abductive thoughts come in two shapes, and the visual grammar switches based on presence of the optional `abductionSteps[]` field:

- **Atomic** (no `abductionSteps` or `abductionSteps: []`) — classic parallel diagram: observations on top, ranked hypotheses in the middle, evidence diamonds on the side, with the gold-highlighted `bestExplanation`
- **Multi-step** (non-empty `abductionSteps[]`) — iterative flow: observations → per-step nodes that show what was generated and eliminated at each step → final gold-highlighted `bestExplanation` at the bottom

The atomic shape is the default; the multi-step shape is used when the reasoning unfolded as generate-test-refine-commit.

## Node Structure

### Atomic shape

Abductive reasoning generates and ranks candidate hypotheses to explain surprising observations. The diagram uses a **tiered top-to-bottom layout** with hypotheses ranked by score:

- **Observations** (top tier) → **Blue rectangles**, one per observation; each includes confidence level as a label (e.g., "0.97")
- **Hypotheses** (middle tier) → **Ranked ellipses** positioned vertically by score (highest at top); the `bestExplanation` hypothesis is highlighted with **gold fill** (`#fbbf24`)
- **Evidence nodes** (right side) → **Diamond shapes**, colored by type:
  - **Green diamonds** for supporting evidence
  - **Red diamonds** for contradicting evidence
  - **Gray diamonds** for neutral evidence
- **Evaluation criteria** (left side) → An optional labeled node showing the radar/criteria (parsimony, explanatoryPower, plausibility, testability)

### Multi-step shape

When `abductionSteps[]` is populated, the diagram inserts a **step tier** between the observations and the final committed explanation:

- **Observations** (top tier) → **blue rectangles**, indexed by id (`O0`, `O1`, ...)
- **Step tier** (middle tier) → **neutral gray rectangles**, one per entry in `abductionSteps[]`, labeled with the step number, short summary, and `abductionMethod`. Intermediate step nodes are always neutral gray — the gold color is reserved for the final committed explanation
- **Hypothesis satellites** — hypotheses introduced at a step are attached as purple ellipses next to the step node; hypotheses eliminated at a step are attached with a **red dashed "eliminated" edge**
- **Final commitment** (bottom tier) → **gold ellipse** with the `bestExplanation` text, connected from the final step with a thick gold arrow labeled "commit"
- **Edges**: blue from `triggerObservation` to the step that used it; gray between steps referenced via `stepsUsed[]`; purple from step to newly generated hypotheses; dashed red from step to eliminated hypotheses

## Edge Semantics

- **Solid blue arrow** (`→`) — Observation feeds into a hypothesis (atomic) or triggers a step (multi-step)
- **Solid purple arrow** — Step generates a new hypothesis
- **Dashed red arrow** — Step eliminates a hypothesis (labeled "eliminated")
- **Solid gray arrow** — A step builds on a prior step
- **Thick gold arrow** — Final step commits to the `bestExplanation`
- **Dashed green arrow** (`⇢`) — Supporting evidence; labeled "supports"
- **Dashed red arrow** (`⇢`) — Contradicting evidence; labeled "contradicts"
- **Dotted gray arrow** (`⇢`) — Neutral evidence; labeled "neutral"

## Mermaid Template — atomic

```mermaid
graph TD
    Crit["📊 Evaluation<br/>Parsimony: 0.75<br/>Power: 0.88<br/>Plausibility: 0.82<br/>Testable: yes"]

    O1["🔵 Observation 1<br/>(confidence: 0.97)"]
    O2["🔵 Observation 2<br/>(confidence: 0.95)"]
    O3["🔵 Observation 3<br/>(confidence: 0.92)"]

    H1["⭐ Hypothesis 1<br/>Best explanation<br/>score: 0.82"]
    H2["◯ Hypothesis 2<br/>score: 0.71"]
    H3["◯ Hypothesis 3<br/>score: 0.54"]

    E1["✓ Supporting<br/>Evidence 1"]
    E2["✗ Contradicting<br/>Evidence 1"]
    E3["～ Neutral<br/>Evidence 1"]

    O1 --> H1
    O2 --> H2
    O3 --> H3

    E1 -->|supports| H1
    E2 -->|contradicts| H2
    E3 -->|neutral| H3

    style Crit fill:#e5e7eb,stroke:#6b7280,color:#000
    style O1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style H1 fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:3px
    style H2 fill:#a855f7,stroke:#7c3aed,color:#fff
    style H3 fill:#a855f7,stroke:#7c3aed,color:#fff
    style E1 fill:#22c55e,stroke:#16a34a,color:#fff
    style E2 fill:#ef4444,stroke:#991b1b,color:#fff
    style E3 fill:#6b7280,stroke:#4b5563,color:#fff
```

## Mermaid Template — multi-step

```mermaid
graph TD
    O1["🔵 O1<br/>(conf: 0.97)"]
    O2["🔵 O2<br/>(conf: 0.88)"]

    S1["Step 1<br/>Generate candidates<br/>(ibe)"]
    S2["Step 2<br/>Falsify h3<br/>(hypothetico-deductive)"]
    S3["Step 3<br/>Compare h1 vs h2, commit<br/>(eliminative)"]

    H1["◯ h1"]
    H2["◯ h2"]
    H3["◯ h3"]

    Best["⭐ Best Explanation<br/>h1: ETL saturates DB"]

    O1 --> S1
    O2 --> S3
    S1 --> S2
    S1 --> S3
    S2 --> S3
    S1 -->|generates| H1
    S1 -->|generates| H2
    S1 -->|generates| H3
    S2 -.->|eliminated| H3
    S3 ==>|commit| Best

    style O1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style S1 fill:#9ca3af,stroke:#4b5563,color:#fff
    style S2 fill:#9ca3af,stroke:#4b5563,color:#fff
    style S3 fill:#9ca3af,stroke:#4b5563,color:#fff
    style H1 fill:#a855f7,stroke:#7c3aed,color:#fff
    style H2 fill:#a855f7,stroke:#7c3aed,color:#fff
    style H3 fill:#a855f7,stroke:#7c3aed,color:#fff
    style Best fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:3px
```

## DOT Template — atomic

```dot
digraph Abductive {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    Crit [label="Evaluation\nParsimony: 0.75\nPower: 0.88\nPlausibility: 0.82\nTestable: yes",
          fillcolor="#e5e7eb", fontcolor="black"];

    O1 [label="Observation 1\n(confidence: 0.97)",
        fillcolor="#3b82f6", fontcolor="white"];
    O2 [label="Observation 2\n(confidence: 0.95)",
        fillcolor="#3b82f6", fontcolor="white"];
    O3 [label="Observation 3\n(confidence: 0.92)",
        fillcolor="#3b82f6", fontcolor="white"];

    H1 [label="Hypothesis 1\nBest explanation\nscore: 0.82",
        fillcolor="#fbbf24", fontcolor="black", penwidth=3];
    H2 [label="Hypothesis 2\nscore: 0.71",
        fillcolor="#a855f7", fontcolor="white"];
    H3 [label="Hypothesis 3\nscore: 0.54",
        fillcolor="#a855f7", fontcolor="white"];

    E1 [label="Supporting\nEvidence 1",
        fillcolor="#22c55e", fontcolor="white", shape=diamond];
    E2 [label="Contradicting\nEvidence 1",
        fillcolor="#ef4444", fontcolor="white", shape=diamond];
    E3 [label="Neutral\nEvidence 1",
        fillcolor="#6b7280", fontcolor="white", shape=diamond];

    O1 -> H1 [color="#3b82f6"];
    O2 -> H2 [color="#3b82f6"];
    O3 -> H3 [color="#3b82f6"];

    E1 -> H1 [label="supports", color="#22c55e", penwidth=3, style=dashed];
    E2 -> H2 [label="contradicts", color="#ef4444", penwidth=3, style=dashed];
    E3 -> H3 [label="neutral", color="#6b7280", penwidth=1, style=dotted];
}
```

## DOT Template — multi-step

```dot
digraph AbductiveMultiStep {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    O1 [label="O1\n(conf: 0.97)", fillcolor="#3b82f6", fontcolor="white"];
    O2 [label="O2\n(conf: 0.88)", fillcolor="#3b82f6", fontcolor="white"];

    S1 [label="Step 1\nGenerate candidates\n(ibe)",
        fillcolor="#9ca3af", fontcolor="white"];
    S2 [label="Step 2\nFalsify h3\n(hypothetico-deductive)",
        fillcolor="#9ca3af", fontcolor="white"];
    S3 [label="Step 3\nCompare h1 vs h2, commit\n(eliminative)",
        fillcolor="#9ca3af", fontcolor="white"];

    H1 [label="h1", fillcolor="#a855f7", fontcolor="white"];
    H2 [label="h2", fillcolor="#a855f7", fontcolor="white"];
    H3 [label="h3", fillcolor="#a855f7", fontcolor="white"];

    Best [label="Best Explanation\nh1: ETL saturates DB",
          fillcolor="#fbbf24", fontcolor="black", penwidth=3];

    O1 -> S1 [color="#3b82f6"];
    O2 -> S3 [color="#3b82f6"];
    S1 -> S2 [color="#6b7280"];
    S1 -> S3 [color="#6b7280"];
    S2 -> S3 [color="#6b7280"];
    S1 -> H1 [label="generates", color="#a855f7"];
    S1 -> H2 [label="generates", color="#a855f7"];
    S1 -> H3 [label="generates", color="#a855f7"];
    S2 -> H3 [label="eliminated", color="#ef4444", style=dashed];
    S3 -> Best [label="commit", color="#d97706", penwidth=3];
}
```

## Worked Example — atomic

Based on the Tuesday 503 errors scenario:

### Mermaid

```mermaid
graph TD
    Crit["📊 Evaluation<br/>Parsimony: 0.75<br/>Power: 0.88<br/>Plausibility: 0.82<br/>Testable: yes"]

    O1["🔵 503 errors Tue 9–10 AM<br/>(conf: 0.97)"]
    O2["🔵 Error recovers by 10:05 AM<br/>(conf: 0.95)"]
    O3["🔵 DB CPU spikes to 95%<br/>Tue 9–10 AM only<br/>(conf: 0.88)"]

    H1["⭐ Weekly ETL saturates DB<br/>score: 0.82<br/>(Best)"]
    H2["◯ BI pipeline lock contention<br/>score: 0.71"]
    H3["◯ Cache cold-start stampede<br/>score: 0.54"]

    E1["✓ Cron job log shows<br/>09:00:02 every Tue<br/>strength: 0.85"]
    E2["✓ Slow-query log shows<br/>47-min INSERT every Tue<br/>strength: 0.78"]
    E3["✗ Cache hit-rate is normal<br/>at 9 AM Tue (>90%)<br/>strength: 0.72"]

    O1 --> H1
    O2 --> H2
    O3 --> H3

    E1 -->|strongly supports| H1
    E2 -->|supports| H2
    E3 -->|contradicts| H3

    style Crit fill:#e5e7eb,stroke:#6b7280,color:#000
    style O1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style H1 fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:3px
    style H2 fill:#a855f7,stroke:#7c3aed,color:#fff
    style H3 fill:#a855f7,stroke:#7c3aed,color:#fff
    style E1 fill:#22c55e,stroke:#16a34a,color:#fff
    style E2 fill:#22c55e,stroke:#16a34a,color:#fff
    style E3 fill:#ef4444,stroke:#991b1b,color:#fff
```

### DOT

```dot
digraph AbductiveErrors {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    Crit [label="Evaluation\nParsimony: 0.75\nPower: 0.88\nPlausibility: 0.82\nTestable: yes",
          fillcolor="#e5e7eb", fontcolor="black"];

    O1 [label="503 errors Tue 9–10 AM\n(confidence: 0.97)",
        fillcolor="#3b82f6", fontcolor="white"];
    O2 [label="Error recovers by 10:05 AM\n(confidence: 0.95)",
        fillcolor="#3b82f6", fontcolor="white"];
    O3 [label="DB CPU spikes to 95%\nTue 9–10 AM only\n(confidence: 0.88)",
        fillcolor="#3b82f6", fontcolor="white"];

    H1 [label="Weekly ETL saturates DB\nscore: 0.82\n(Best Explanation)",
        fillcolor="#fbbf24", fontcolor="black", penwidth=3];
    H2 [label="BI pipeline lock\ncontention\nscore: 0.71",
        fillcolor="#a855f7", fontcolor="white"];
    H3 [label="Cache cold-start\nstampede\nscore: 0.54",
        fillcolor="#a855f7", fontcolor="white"];

    E1 [label="Cron job log:\n09:00:02 every Tue\nstrength: 0.85",
        fillcolor="#22c55e", fontcolor="white", shape=diamond];
    E2 [label="Slow-query log:\n47-min INSERT Tue\nstrength: 0.78",
        fillcolor="#22c55e", fontcolor="white", shape=diamond];
    E3 [label="Cache hit-rate normal\nat 9 AM Tue (>90%)\nstrength: 0.72",
        fillcolor="#ef4444", fontcolor="white", shape=diamond];

    O1 -> H1 [color="#3b82f6"];
    O2 -> H2 [color="#3b82f6"];
    O3 -> H3 [color="#3b82f6"];

    E1 -> H1 [label="strongly\nsupports", color="#22c55e", penwidth=3, style=dashed];
    E2 -> H2 [label="supports", color="#22c55e", penwidth=2, style=dashed];
    E3 -> H3 [label="contradicts", color="#ef4444", penwidth=2, style=dashed];
}
```

## Worked Example — multi-step

Based on the 3-step iterative version of the Tuesday 503 errors scenario (the current sample in `test/samples/abductive-valid.json`). Step 1 generates all three candidates, step 2 falsifies h3 via a prediction check, step 3 compares h1 vs h2 and commits to h1:

### Mermaid

```mermaid
graph TD
    O1["🔵 o1: 503 errors<br/>Tue 9-10 AM<br/>(conf: 0.97)"]
    O4["🔵 o4: DB CPU spike<br/>to 95% Tue 9-10 AM<br/>(conf: 0.88)"]

    S1["Step 1<br/>Generate h1 h2 h3<br/>(ibe)"]
    S2["Step 2<br/>Falsify h3 via<br/>cache hit-rate check<br/>(hypothetico-deductive)"]
    S3["Step 3<br/>Compare h1 vs h2<br/>commit to h1<br/>(eliminative)"]

    H1["◯ h1<br/>Weekly ETL saturates DB"]
    H2["◯ h2<br/>BI lock contention"]
    H3["◯ h3<br/>Cache cold-start"]

    Best["⭐ Best Explanation<br/>h1: Weekly ETL job runs<br/>at 9 AM Tuesday and<br/>saturates the database"]

    O1 --> S1
    O4 --> S3
    S1 --> S2
    S1 --> S3
    S2 --> S3
    S1 -->|generates| H1
    S1 -->|generates| H2
    S1 -->|generates| H3
    S2 -.->|eliminated| H3
    S3 ==>|commit| Best

    style O1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O4 fill:#3b82f6,stroke:#1e40af,color:#fff
    style S1 fill:#9ca3af,stroke:#4b5563,color:#fff
    style S2 fill:#9ca3af,stroke:#4b5563,color:#fff
    style S3 fill:#9ca3af,stroke:#4b5563,color:#fff
    style H1 fill:#a855f7,stroke:#7c3aed,color:#fff
    style H2 fill:#a855f7,stroke:#7c3aed,color:#fff
    style H3 fill:#a855f7,stroke:#7c3aed,color:#fff
    style Best fill:#fbbf24,stroke:#d97706,color:#000,stroke-width:3px
```

### DOT

```dot
digraph AbductiveIterative {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    O1 [label="o1: 503 errors\nTue 9-10 AM\n(conf: 0.97)",
        fillcolor="#3b82f6", fontcolor="white"];
    O4 [label="o4: DB CPU spike\nto 95% Tue 9-10 AM\n(conf: 0.88)",
        fillcolor="#3b82f6", fontcolor="white"];

    S1 [label="Step 1\nGenerate h1 h2 h3\n(ibe)",
        fillcolor="#9ca3af", fontcolor="white"];
    S2 [label="Step 2\nFalsify h3 via\ncache hit-rate check\n(hypothetico-deductive)",
        fillcolor="#9ca3af", fontcolor="white"];
    S3 [label="Step 3\nCompare h1 vs h2\ncommit to h1\n(eliminative)",
        fillcolor="#9ca3af", fontcolor="white"];

    H1 [label="h1\nETL saturates DB", fillcolor="#a855f7", fontcolor="white"];
    H2 [label="h2\nBI lock contention", fillcolor="#a855f7", fontcolor="white"];
    H3 [label="h3\nCache cold-start", fillcolor="#a855f7", fontcolor="white"];

    Best [label="Best Explanation\nh1: Weekly ETL job runs\nat 9 AM Tuesday and\nsaturates the database",
          fillcolor="#fbbf24", fontcolor="black", penwidth=3];

    O1 -> S1 [color="#3b82f6"];
    O4 -> S3 [color="#3b82f6"];
    S1 -> S2 [color="#6b7280"];
    S1 -> S3 [color="#6b7280"];
    S2 -> S3 [color="#6b7280"];
    S1 -> H1 [label="generates", color="#a855f7"];
    S1 -> H2 [label="generates", color="#a855f7"];
    S1 -> H3 [label="generates", color="#a855f7"];
    S2 -> H3 [label="eliminated", color="#ef4444", style=dashed];
    S3 -> Best [label="commit", color="#d97706", penwidth=3];
}
```

## Special Cases

- **Best explanation highlighting**: The hypothesis in `bestExplanation` is rendered with **gold fill** (`#fbbf24`) and a **thick border** (penwidth=3) to visually distinguish it. In the multi-step shape, intermediate hypothesis nodes stay purple; only the final committed `Best Explanation` node is gold.

- **Evidence strength encoding**:
  - **Green supporting diamonds** with thick edges (penwidth=3) for strength ≥ 0.75
  - **Green supporting diamonds** with normal edges (penwidth=2) for 0.6 ≤ strength < 0.75
  - **Red contradicting diamonds** with thick edges for strength ≥ 0.75
  - **Red contradicting diamonds** with normal edges for weaker contradicting evidence

- **Hypothesis ranking by score**: In the atomic shape, display hypotheses in vertical order (h1 at top, h3 at bottom) with y-position proportional to score. The multi-step shape does not rank hypotheses by score at all — ranking information lives in the top-level `hypotheses[].score` field and is auxiliary to the step flow.

- **Eliminated hypotheses are preserved**: A hypothesis that appears in some step's `hypothesesEliminated[]` is still shown as a node; it just has an incoming red dashed "eliminated" edge from the eliminating step. The flat `hypotheses[]` array also keeps it (this is an audit trail, not a prune operation).

- **Prediction nodes** (optional): If predictions are important, they can be rendered as smaller gray diamonds hanging below each hypothesis, labeled with the prediction text. This enriches the diagram but may add clutter; include only if the downstream task requires visibility into testable predictions.
