# Visual Grammar: Inductive

How to render an `inductive` thought as a diagram.

## Rendering Dispatch (v0.5.3+)

Inductive thoughts come in two shapes, and the visual grammar switches based on presence of the optional `inductionSteps[]` field:

- **Atomic** (no `inductionSteps` or `inductionSteps: []`) — classic 3-tier funnel: observations → pattern → generalization
- **Multi-step** (non-empty `inductionSteps[]`) — multi-tier flow: observations → per-step intermediate generalizations → final generalization

The atomic shape is the default; the multi-step shape is used when the induction is progressive refinement, Mill's methods, or hierarchical generalization.

## Node Structure

### Atomic shape

Inductive reasoning moves from specific observations to a general principle. The diagram uses a **top-to-bottom funnel layout**:

- **Observations** (top tier) → Rendered as **blue rectangles**, one per observation in the `observations` array
- **Pattern node** (middle tier) → A single **orange ellipse** labeled with the `pattern` excerpt (or "Pattern Recognition" if pattern is not yet explicit)
- **Generalization node** (bottom tier) → A **green pill/stadium shape** containing the `generalization` text
- **Counterexamples** (side tier) → **Red boxes with dashed edges** to the generalization, showing exceptions that constrain confidence

Border thickness on the generalization node encodes confidence: `confidence ≥ 0.8` → thick border; `confidence < 0.6` → thin dotted border.

### Multi-step shape

When `inductionSteps[]` is populated, the diagram inserts a **step tier** between the observations and the final generalization:

- **Observations** (top tier) → **blue rectangles**, one per observation, indexed `O0`, `O1`, `O2`, ...
- **Step tier** (middle tier) → **neutral gray rectangles**, one per entry in `inductionSteps[]`, labeled `Step N<br/>intermediateGeneralization<br/>(inductionMethod)`. Intermediate steps are always neutral gray — the validity/confidence color is reserved for the final generalization
- **Final generalization** (bottom tier) → **green pill/stadium** with the top-level `generalization` text, border thickness encoding confidence
- **Edges from observations to steps** — each step's `observationsUsed[]` produces a blue edge from that observation to the step node
- **Edges from steps to later steps** — each step's `stepsUsed[]` produces a gray edge from the prior step to the current step
- **Edge from the final step to the final generalization** — a thick green arrow labeled "final"

## Edge Semantics

- **Solid blue arrow** (`→`) — Observation supports the pattern or the step; weight reflects the strength of the observation
- **Solid gray arrow** — A step refines or builds on an earlier step
- **Thick green arrow** — The final step closes the chain by producing the top-level generalization
- **Dashed red arrow** (`⇢`) — Counterexample contradicts the generalization; labeled "contradicts" or "exception"

## Mermaid Template — atomic

```mermaid
graph TD
    O1["🔵 Observation 1"]
    O2["🔵 Observation 2"]
    O3["🔵 Observation 3"]

    Pattern["⭐ Pattern Recognition<br/>Common thread"]

    Gen["✓ Generalization<br/>General principle"]

    O1 --> Pattern
    O2 --> Pattern
    O3 --> Pattern
    Pattern --> Gen

    style O1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Pattern fill:#f59e0b,stroke:#d97706,color:#000
    style Gen fill:#22c55e,stroke:#16a34a,color:#fff
```

## Mermaid Template — multi-step

```mermaid
graph TD
    O0["🔵 O0<br/>observation 0"]
    O1["🔵 O1<br/>observation 1"]
    O2["🔵 O2<br/>observation 2"]
    O3["🔵 O3<br/>observation 3"]

    S1["Step 1<br/>intermediate gen A<br/>(enumerative)"]
    S2["Step 2<br/>intermediate gen B<br/>(causal difference)"]
    S3["Step 3<br/>intermediate gen C<br/>(Mill's synthesis)"]

    Gen["✓ Final Generalization<br/>top-level generalization"]

    O0 --> S1
    O1 --> S1
    O2 --> S2
    S1 --> S2
    O3 --> S2
    S1 --> S3
    S2 --> S3
    S3 --> Gen

    style O0 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style S1 fill:#9ca3af,stroke:#4b5563,color:#fff
    style S2 fill:#9ca3af,stroke:#4b5563,color:#fff
    style S3 fill:#9ca3af,stroke:#4b5563,color:#fff
    style Gen fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:3px
```

## DOT Template — atomic

```dot
digraph Inductive {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    O1 [label="Observation 1", fillcolor="#3b82f6", fontcolor="white"];
    O2 [label="Observation 2", fillcolor="#3b82f6", fontcolor="white"];
    O3 [label="Observation 3", fillcolor="#3b82f6", fontcolor="white"];

    Pattern [label="Pattern Recognition\nCommon thread",
             fillcolor="#f59e0b", fontcolor="black"];

    Gen [label="Generalization\nGeneral principle",
         fillcolor="#22c55e", fontcolor="white", shape=box];

    O1 -> Pattern [color="#3b82f6", penwidth=2];
    O2 -> Pattern [color="#3b82f6", penwidth=2];
    O3 -> Pattern [color="#3b82f6", penwidth=2];
    Pattern -> Gen [color="#f59e0b", penwidth=2];
}
```

## DOT Template — multi-step

```dot
digraph InductiveMultiStep {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    O0 [label="O0\nobservation 0", fillcolor="#3b82f6", fontcolor="white"];
    O1 [label="O1\nobservation 1", fillcolor="#3b82f6", fontcolor="white"];
    O2 [label="O2\nobservation 2", fillcolor="#3b82f6", fontcolor="white"];
    O3 [label="O3\nobservation 3", fillcolor="#3b82f6", fontcolor="white"];

    S1 [label="Step 1\nintermediate gen A\n(enumerative)",
        fillcolor="#9ca3af", fontcolor="white"];
    S2 [label="Step 2\nintermediate gen B\n(causal difference)",
        fillcolor="#9ca3af", fontcolor="white"];
    S3 [label="Step 3\nintermediate gen C\n(Mill's synthesis)",
        fillcolor="#9ca3af", fontcolor="white"];

    Gen [label="Final Generalization\ntop-level generalization",
         fillcolor="#22c55e", fontcolor="white", penwidth=3];

    O0 -> S1 [color="#3b82f6", penwidth=2];
    O1 -> S1 [color="#3b82f6", penwidth=2];
    O2 -> S2 [color="#3b82f6", penwidth=2];
    O3 -> S2 [color="#3b82f6", penwidth=2];
    S1 -> S2 [color="#6b7280", penwidth=2];
    S1 -> S3 [color="#6b7280", penwidth=2];
    S2 -> S3 [color="#6b7280", penwidth=2];
    S3 -> Gen [label="final", color="#16a34a", penwidth=3];
}
```

## Worked Example — atomic

Based on the 3-observation database connection timeout scenario:

### Mermaid

```mermaid
graph TD
    O1["🔵 Monday 2026-04-06<br/>Deploy failed with<br/>DB timeout"]
    O2["🔵 Wednesday 2026-04-08<br/>Deploy failed with<br/>DB timeout"]
    O3["🔵 Friday 2026-04-10<br/>Deploy failed with<br/>DB timeout"]

    Pattern["⭐ Pattern<br/>All recent deploys fail<br/>at DB connection phase"]

    Gen["✓ Generalization<br/>Recent production deploys<br/>consistently fail at DB<br/>connection phase"]

    CEx["⚠️ Counterexample<br/>Tuesday 2026-04-07<br/>deploy succeeded"]

    O1 --> Pattern
    O2 --> Pattern
    O3 --> Pattern
    Pattern --> Gen
    CEx -.->|contradicts| Gen

    style O1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Pattern fill:#f59e0b,stroke:#d97706,color:#000
    style Gen fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:3px
    style CEx fill:#ef4444,stroke:#991b1b,color:#fff
```

### DOT

```dot
digraph InductiveTimeout {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    O1 [label="Monday 2026-04-06\nDeploy failed with\nDB timeout",
        fillcolor="#3b82f6", fontcolor="white"];
    O2 [label="Wednesday 2026-04-08\nDeploy failed with\nDB timeout",
        fillcolor="#3b82f6", fontcolor="white"];
    O3 [label="Friday 2026-04-10\nDeploy failed with\nDB timeout",
        fillcolor="#3b82f6", fontcolor="white"];

    Pattern [label="Pattern\nAll recent deploys fail\nat DB connection phase",
             fillcolor="#f59e0b", fontcolor="black"];

    Gen [label="Generalization\nRecent production deploys\nconsistently fail at DB\nconnection phase",
         fillcolor="#22c55e", fontcolor="white", penwidth=3];

    CEx [label="Counterexample\nTuesday 2026-04-07\ndeploy succeeded",
         fillcolor="#ef4444", fontcolor="white"];

    O1 -> Pattern [color="#3b82f6", penwidth=2];
    O2 -> Pattern [color="#3b82f6", penwidth=2];
    O3 -> Pattern [color="#3b82f6", penwidth=2];
    Pattern -> Gen [color="#f59e0b", penwidth=2];
    CEx -> Gen [label="contradicts", style=dashed, color="#ef4444", penwidth=2];
}
```

## Worked Example — multi-step

Based on the 4-observation progressive-Bayesian-refinement A/B test scenario (the current sample in `test/samples/inductive-valid.json`). Each step represents the reasoner's belief at that point in time, with later steps revising earlier ones as new weekly data arrives:

### Mermaid

```mermaid
graph TD
    O0["🔵 O0<br/>Week 1: +3.2%<br/>n=1000"]
    O1["🔵 O1<br/>Week 2: +4.8%<br/>n=1500"]
    O2["🔵 O2<br/>Week 3: +0.4%<br/>n=2000"]
    O3["🔵 O3<br/>Week 4: -1.7%<br/>n=2500"]

    S1["Step 1<br/>A seems to improve<br/>conv by ~3%<br/>(bayesianUpdate weak)"]
    S2["Step 2<br/>Signal reinforced<br/>to ~4-5%<br/>(bayesianUpdate reinforced)"]
    S3["Step 3<br/>Advantage weakening<br/>effect uncertain<br/>(bayesianUpdate revising)"]
    S4["Step 4<br/>No sustained gain<br/>(bayesianUpdate reversal)"]

    Gen["✓ Variant A showed no<br/>sustained improvement;<br/>early signal was novelty effect"]

    O0 --> S1
    O1 --> S2
    S1 --> S2
    O2 --> S3
    S1 --> S3
    S2 --> S3
    O3 --> S4
    S1 --> S4
    S2 --> S4
    S3 --> S4
    S4 --> Gen

    style O0 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style O3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style S1 fill:#9ca3af,stroke:#4b5563,color:#fff
    style S2 fill:#9ca3af,stroke:#4b5563,color:#fff
    style S3 fill:#9ca3af,stroke:#4b5563,color:#fff
    style S4 fill:#9ca3af,stroke:#4b5563,color:#fff
    style Gen fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:3px
```

### DOT

```dot
digraph InductiveProgressive {
    rankdir=TB;
    node [shape=box, style="filled,rounded"];

    O0 [label="O0\nWeek 1: +3.2%\nn=1000", fillcolor="#3b82f6", fontcolor="white"];
    O1 [label="O1\nWeek 2: +4.8%\nn=1500", fillcolor="#3b82f6", fontcolor="white"];
    O2 [label="O2\nWeek 3: +0.4%\nn=2000", fillcolor="#3b82f6", fontcolor="white"];
    O3 [label="O3\nWeek 4: -1.7%\nn=2500", fillcolor="#3b82f6", fontcolor="white"];

    S1 [label="Step 1\nA seems to improve\nconv by ~3%\n(bayesianUpdate weak)",
        fillcolor="#9ca3af", fontcolor="white"];
    S2 [label="Step 2\nSignal reinforced\nto ~4-5%\n(bayesianUpdate reinforced)",
        fillcolor="#9ca3af", fontcolor="white"];
    S3 [label="Step 3\nAdvantage weakening\neffect uncertain\n(bayesianUpdate revising)",
        fillcolor="#9ca3af", fontcolor="white"];
    S4 [label="Step 4\nNo sustained gain\n(bayesianUpdate reversal)",
        fillcolor="#9ca3af", fontcolor="white"];

    Gen [label="Final Generalization\nNo sustained improvement;\nearly signal was novelty effect",
         fillcolor="#22c55e", fontcolor="white", penwidth=3];

    O0 -> S1 [color="#3b82f6", penwidth=2];
    O1 -> S2 [color="#3b82f6", penwidth=2];
    S1 -> S2 [color="#6b7280", penwidth=2];
    O2 -> S3 [color="#3b82f6", penwidth=2];
    S1 -> S3 [color="#6b7280", penwidth=2];
    S2 -> S3 [color="#6b7280", penwidth=2];
    O3 -> S4 [color="#3b82f6", penwidth=2];
    S1 -> S4 [color="#6b7280", penwidth=2];
    S2 -> S4 [color="#6b7280", penwidth=2];
    S3 -> S4 [color="#6b7280", penwidth=2];
    S4 -> Gen [label="final", color="#16a34a", penwidth=3];
}
```

## Special Cases

- **Confidence encoding**:
  - `confidence ≥ 0.85`: Thick border (penwidth=3) on generalization
  - `0.6 ≤ confidence < 0.85`: Normal border (penwidth=2)
  - `confidence < 0.6`: Dotted border (style=dotted) to show weak confidence

- **Sample size indicator**: If `sampleSize` is small (≤3), add a badge to the pattern node (e.g., "🔍 n=3") to indicate limited sample.

- **Counterexamples**: Render each counterexample as a red rectangle with a dashed edge to the generalization, labeled "contradicts" or "exception: [brief description]". Multiple counterexamples reduce confidence (model this via border style/thickness).

- **Multiple patterns**: If the inductive reasoning identifies more than one pattern (unlikely in the simple format but possible in extended cases), show them as separate orange ellipses, each feeding into the generalization with different arrow weights.

- **Step node with empty observationsUsed**: A synthesis step that combines only prior steps (not observations) still renders — just without incoming blue edges from the observation tier.
