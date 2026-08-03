# Format Grammar: ASCII

How to encode a deepthinking-plugin thought into pure ASCII text with Unicode box-drawing characters.

## Format Overview

ASCII renders deeply nested and hierarchical structures using pure text with Unicode box-drawing characters (`├──`, `│`, `└──`, `─`, `┌──`, `┐`, `└──`, `┘`, `→`, `=>`) and aligned columns. No external rendering tools required — output renders natively in any terminal, markdown code block, log file, commit message, or AI handoff. Ideal for sequential reasoning, hierarchical proofs, terminal UIs, accessibility contexts, and scenarios where Mermaid or GraphViz renderers are not available.

ASCII excels at showing tree structures (prior → evidence → posterior chains) and cascading logic (if-then-then-then steps). Less effective for dense graphs with many cross-connections, but two visual styles address this: **tree style** for hierarchical reasoning and **box style** for process flows.

## Encoding Rules

### Tree Style (Hierarchical Reasoning)

Use tree style for modes that reason depth-first: **Sequential, Bayesian, Abductive, Recursive, Synthesis, Analysis, Critique**.

- **Root node**: Top-level claim or hypothesis, no indentation
- **Child nodes**: Each level indented by 4 spaces (or 2 for compact); prepend connector:
  - `├──` (branch, not last child)
  - `└──` (branch, last child — "tee" points down-right)
  - `│  ` (continuation line for siblings)
- **Leaf labels**: After the connector, write `[NodeType]` in brackets, then content (max 70 chars per line)
- **Metadata**: On continuation lines below node, indented one level deeper:
  - Probabilities: `   ├── P(H) = 0.XX` or `   └── P(H|E) = 0.XX`
  - Confidence: `   ├── Confidence: 0.XX`
  - Color codes (optional): `   └── [GREEN] supporting`
  - Evidence refs: `   └── Evidence: E1, E2`
- **Multi-line node labels**: If content exceeds 70 chars, split across lines:
  ```
  ├── [Hypothesis] Caching layer is cause of memory leak
  │   └── (Explanation: 30% historical base rate)
  ```

### Box Style (Flow and Process)

Use box style for modes with parallel branches or process steps: **Causal, Counterfactual, ScientificMethod, Engineering, GameTheory, FormalLogic**.

- **Nodes**: Enclosed in `┌─ ─┐` and `└─ ─┘` borders (padding inside)
- **Edges**: Direct arrows `→` (solid flow), `⟹` (strong causal), `┈┈>` (weak/hypothetical), `⚡` (decision)
- **Parallel branches**: Stack horizontally with aligned columns, separated by whitespace
- **Justification/metadata**: Shown below the box as indented lines prefixed with `∘` (bullet)

Example box:
```
┌─────────────────┐
│  [Hypothesis]   │
│ X causes Y      │
└─────────────────┘
  ∘ Prior: 0.30
  ∘ Confidence: High
```

### Numeric and Probabilistic Encoding

- **Probabilities**: Show as decimal `0.85` with optional percentage `(85%)`
- **Ranges**: `[0.1 .. 0.8]` or `0.1–0.8`
- **Bayes factors**: `BF = 4.5` inline or on dedicated line
- **Scores/weights**: `Score: 7/10` or `Weight: 0.65`

### Color Codes (Text Annotations)

For accessibility, annotate semantic color meaning:
- `[GREEN]` or `✓` for supporting/proven/success
- `[RED]` or `✗` for contradicting/failed/invalid
- `[ORANGE]` or `⚠` for uncertain/partial
- `[BLUE]` or `ℹ` for neutral/informational
- `[PURPLE]` or `◆` for meta/reasoning-about-reasoning
- `[GRAY]` or `—` for deferred/skipped

## Template

### Tree Style Template

```
[Mode: Sequential / Bayesian / Abductive / Recursive]
─────────────────────────────────────────────────────

[Root Claim or Hypothesis]
├── [Step/Evidence 1]
│   ├── Supporting detail A
│   ├── Supporting detail B
│   └── [GREEN] ✓ Confidence: 0.85
├── [Step/Evidence 2]
│   ├── Qualifier or caveat
│   └── [ORANGE] ⚠ Confidence: 0.60
└── [Conclusion / Posterior]
    ├── P(H|E) = 0.72
    ├── Bayes Factor: 3.6
    └── [GREEN] ✓ Supported
```

### Box Style Template

```
Mode: Causal / Engineering / GameTheory
═════════════════════════════════════════

┌─────────────────┐         ┌──────────────┐
│  [Input State]  │ ⟹ [Transform] ⟹ │ [Output]      │
│   Condition A   │         │   Logic      │  │ Result   │
└─────────────────┘         └──────────────┘  └──────────┘
  ∘ Prior: P(A)             ∘ Rule: IF A     ∘ Post: P(O)
                              THEN B

[Causal Link] (E1 causes E2 with delay)
  └── Strength: 0.80
  └── Assumptions: [Assumption 1], [Assumption 2]
```

## Worked Example

### Input: Bayesian Memory Leak Scenario

```json
{
  "mode": "bayesian",
  "hypothesis": {
    "claim": "Caching layer is the cause of memory leak",
    "prior": 0.30,
    "justification": "30% of memory issues traced to caching over 18 months"
  },
  "alternatives": [
    {"claim": "Connection pool leak", "prior": 0.35},
    {"claim": "Log accumulation", "prior": 0.35}
  ],
  "evidence": [
    {
      "description": "Heap dump shows 40% memory in cache objects",
      "likelihood_given_h": 0.90,
      "likelihood_given_not_h": 0.20
    }
  ],
  "posterior": {
    "probability": 0.66,
    "confidence": 0.70,
    "bayes_factor": 4.5
  }
}
```

### ASCII Tree Output

```
Memory Leak Root Cause Analysis
═════════════════════════════════════════════════════════════

[HYPOTHESIS] Caching layer is the cause
├── Prior belief: P(H) = 0.30
│   └── Justification: 30% historical rate (18-month baseline)
├── [EVIDENCE] Heap dump analysis
│   ├── Observation: Cache objects occupy 40% of memory
│   ├── Likelihood: P(E|H) = 0.90
│   ├── Alternative likelihood: P(E|¬H) = 0.20
│   └── Bayes Factor: BF = 4.5
├── [ALTERNATIVES]
│   ├── A1: Connection pool leak
│   │   └── Prior: P(A1) = 0.35
│   └── A2: Log accumulation
│       └── Prior: P(A2) = 0.35
└── [POSTERIOR] Updated belief
    ├── Posterior: P(H|E) = 0.66
    ├── Confidence: 0.70
    ├── [GREEN] ✓ Caching layer likely cause
    └── Sensitivity: Prior ∈ [0.1, 0.5] ⟹ Posterior ∈ [0.33, 0.82]
```

### ASCII Box Output (Alternative)

```
Bayesian Reasoning Chain
═════════════════════════

┌──────────────────┐
│  Prior Belief    │
│  P(H) = 0.30     │
│  Cache leak?     │
└──────────────────┘
        ⟹
┌──────────────────┐
│  Evidence        │
│  Heap dump: 40%  │
│  P(E|H) = 0.90   │
│  P(E|¬H) = 0.20  │
└──────────────────┘
        ⟹
┌──────────────────┐
│  Posterior       │
│  P(H|E) = 0.66   │
│  Confidence: 0.7 │
│  BF = 4.5        │
└──────────────────┘
  ∘ [GREEN] ✓ Supported
  ∘ Strong evidence for caching layer
```

## Per-Mode Considerations

### Excellent in ASCII

- **Bayesian**: Tree style shows prior → evidence → posterior flow naturally; probabilities render clearly
- **Sequential/Shannon**: Linear step-by-step reasoning fits tree structure perfectly
- **Abductive**: Multiple hypotheses at same level, evidence evaluated against each
- **Recursive**: Nested structure (call → sub-call → result) maps directly to tree indentation
- **Synthesis**: Thesis ← sources, antithesis ← sources, synthesis as conclusion
- **Critique**: Claim with nested arguments and counter-arguments

### Moderate in ASCII

- **Causal/Counterfactual**: Box style works, but many cross-arrows can clutter. Best with ≤5 nodes
- **Engineering**: Trade studies work in tree (option A, option B, option C) or compact box layout
- **FormalLogic**: Proof steps (line-by-line) fit tree if structured as goal → subgoal → subgoal

### Challenging in ASCII

- **SystemsThinking**: 8 archetypes with many feedback loops; ASCII box style quickly becomes unreadable. Consider Mermaid instead
- **GameTheory**: Payoff matrices don't compress well; use box style only for single equilibrium illustration
- **ScientificMethod**: Works in tree (hypothesis → method → result), but multi-variable designs become cluttered

## Rendering Tools

No tools required. ASCII renders natively in:

- Any terminal (bash, PowerShell, cmd)
- Markdown code blocks (GitHub, GitLab, Obsidian, Discord)
- Text editors (VS Code, Sublime, Notepad)
- Logs and plain-text files
- Email and commit messages
- AI handoff formats (copy-paste friendly)

**Recommendation**: Always use UTF-8 encoding to preserve box-drawing characters (`├`, `│`, `└`, `┌`, `┐`, `→`, `⟹`, etc.). On Windows, ensure terminal font supports Unicode (e.g., Cascadia Code, Consolas with `chcp 65001`).

For accessibility in screen readers, provide a plain-text fallback or Markdown table version alongside ASCII art.

---

**Last Updated**: 2026-04-11  
**Format Stability**: Stable  
**Target Audience**: Developers, terminal users, accessibility-conscious consumers, AI-to-AI handoffs
