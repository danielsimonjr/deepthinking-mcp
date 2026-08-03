# Hybrid Thought — Output Format

Multi-mode reasoning that composes two or more reasoning lenses for problems that span multiple analytical dimensions.

## JSON Schema

```json
{
  "mode": "hybrid",
  "thoughtNumber": <integer ≥1>,
  "totalThoughts": <integer ≥1>,
  "content": "<the thought content as natural language>",
  "nextThoughtNeeded": <boolean>,
  "primaryMode": "<one of: sequential | shannon | mathematics | physics>",
  "secondaryFeatures": ["<secondary mode or reasoning lens>", ...],
  "thoughtType": "<optional extended thought type, e.g. mode_selection | convergence_check>",
  "stage": "<optional Shannon stage if primaryMode is shannon>",
  "uncertainty": <optional number 0–1>,
  "dependencies": ["<prior thought id or information source>", ...],
  "assumptions": ["<explicit assumption>", ...],
  "switchReason": "<why this combination of modes was selected>",
  "revisionReason": "<if revising a prior thought, why>",
  "mathematicalModel": {
    "latex": "<LaTeX representation>",
    "symbolic": "<symbolic form>",
    "ascii": "<ASCII fallback, optional>"
  },
  "physicalInterpretation": {
    "quantity": "<physical quantity being modelled>",
    "units": "<SI or domain units>",
    "conservationLaws": ["<applicable conservation law>", ...]
  }
}
```

## Required Fields

- `mode` — always the literal string `"hybrid"`
- `thoughtNumber` — 1-indexed position in the chain
- `totalThoughts` — total count for this reasoning chain
- `content` — natural language explanation of what each active mode contributes and how insights are being composed
- `nextThoughtNeeded` — `true` if more thoughts are needed
- `primaryMode` — the dominant reasoning frame (`sequential`, `shannon`, `mathematics`, or `physics`)
- `secondaryFeatures` — one or more additional mode names or lenses active in this thought; use `[]` only if no secondary lens is genuinely active

## How Mode Composition Works

Hybrid reasoning is not "use all modes at once." The pattern is:

1. **Select a primary mode** that structures the overall chain (usually `sequential` for decision problems, `shannon` for uncertainty-reduction problems).
2. **Identify secondary lenses** that each address a specific dimension the primary mode cannot handle alone. Name them explicitly in `secondaryFeatures`.
3. **Apply lenses per thought.** In each thought, state explicitly what insight each active lens provides, then synthesise those insights before moving on.
4. **Justify the composition.** Set `switchReason` on the first thought (mode-selection phase) and whenever the active lens changes mid-chain.
5. **Converge.** Use `thoughtType: "convergence_check"` when integrating insights from all lenses into a single recommendation.

Common compositions:

| Problem type | primaryMode | secondaryFeatures |
|---|---|---|
| Strategic decision with uncertainty | `sequential` | `["bayesian", "causal"]` |
| Performance constraint with correctness proof | `shannon` | `["mathematics"]` |
| System design trade-off | `sequential` | `["causal", "shannon"]` |
| Physics simulation with numerical model | `physics` | `["mathematics"]` |

## Worked Example

Input: "Should we rewrite the auth system in Rust? (requires comparing safety, performance, team expertise, and migration cost.)"

Output (thought 1 of 4 — mode selection):

```json
{
  "mode": "hybrid",
  "thoughtNumber": 1,
  "totalThoughts": 4,
  "content": "This decision requires three incommensurable lenses. (1) Causal: will rewriting in Rust actually cause the safety and performance outcomes we expect, or are the failure modes in our auth system elsewhere? (2) Bayesian: given our team's current Rust proficiency, what is the posterior probability of shipping on time without regressions? (3) Shannon/constraints: what are the hard constraints—migration window, zero-downtime requirement, backward compatibility of JWTs—that any solution must satisfy regardless of language? Selecting primaryMode=sequential to frame the overall decision chain; secondaryFeatures draws on causal and bayesian lenses at each step.",
  "nextThoughtNeeded": true,
  "primaryMode": "sequential",
  "secondaryFeatures": ["causal", "bayesian", "shannon"],
  "thoughtType": "mode_selection",
  "uncertainty": 0.65,
  "dependencies": [],
  "assumptions": [
    "team has 2 engineers with production Rust experience",
    "current auth system has documented failure modes",
    "migration must be zero-downtime and backward-compatible"
  ],
  "switchReason": "The rewrite decision spans safety (causal), probability of success (bayesian), and hard constraints (shannon); no single mode is sufficient."
}
```

Output (thought 4 of 4 — convergence):

```json
{
  "mode": "hybrid",
  "thoughtNumber": 4,
  "totalThoughts": 4,
  "content": "Convergence: Causal analysis shows memory-safety bugs account for only ~20% of auth incidents; the dominant failure mode is misconfigured token expiry—a logic problem, not a language problem. Bayesian update: P(on-time delivery | 2 Rust engineers, 6-week window) ≈ 0.35, below our 0.7 threshold. Shannon constraint check confirms the zero-downtime requirement rules out a big-bang rewrite regardless. Recommendation: do not rewrite in Rust now. Instead, harden the expiry-validation logic in the current language and reassess in Q3 when the team has grown Rust expertise.",
  "nextThoughtNeeded": false,
  "primaryMode": "sequential",
  "secondaryFeatures": ["causal", "bayesian", "shannon"],
  "thoughtType": "convergence_check",
  "uncertainty": 0.2,
  "dependencies": ["thought_1", "thought_2", "thought_3"],
  "assumptions": [
    "incident data from the last 12 months is representative",
    "team headcount stays flat through Q2"
  ]
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"hybrid"`
- `primaryMode` is one of: `sequential`, `shannon`, `mathematics`, `physics`
- `secondaryFeatures` is a non-empty array unless the thought is purely a primary-mode step
- `content` explicitly names what each active secondary lens contributes — not just "I used Bayesian reasoning" but what insight it gave
- `switchReason` is set on the first thought and whenever the active lens combination changes
- `thoughtType` is `"mode_selection"` on thought 1 and `"convergence_check"` on the final synthesis thought
- `nextThoughtNeeded` is `false` only when insights from all lenses have been synthesised into a conclusion
- `thoughtNumber` ≤ `totalThoughts`
