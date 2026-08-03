# Per-Mode Skill Invariants — Validation Rules JSON Schema Cannot Enforce

This document catalogs the validation rules that live in `skills/think-<category>/SKILL.md` prose because JSON Schema lacks the expressive power to encode them. They are enforced **only by the model following the skill prompt** — there is no test harness that catches violations.

When editing a SKILL.md file, preserve any "must" / "exactly one" / "at least N" language — those are load-bearing invariants the schema cannot catch.

## Why JSON Schema can't express these

JSON Schema is the source of truth for what *shape* a thought must have, but it cannot express:

- **Exactly N of something** — e.g., "exactly one element of `possibleWorlds` has `isActual: true`"
- **Distinctness across array elements** — e.g., "at least two hypotheses with non-equal scores"
- **Cross-field semantic constraints** — e.g., "the conclusion's confidence must not exceed the lowest premise confidence"
- **Domain-specific minimums** — e.g., "synthesis of one source is summary, not synthesis"

These rules live as written instructions in the relevant `skills/think-<category>/SKILL.md` files. They exist as English prose in the skill body, not as JSON Schema constraints.

## The invariants (per mode)

### Cardinality and distinctness rules

| Mode | Invariant | Skill file | Schema status |
|---|---|---|---|
| `abductive` | ≥2 distinct hypotheses with non-equal scores; a single hypothesis is not abduction | `skills/think-core/SKILL.md` | Schema has only `minItems: 1` on hypotheses (under-constrained) |
| `counterfactual` | Exactly one condition marked `isIntervention: true`; multiple simultaneous interventions break isolation and make the analysis unfalsifiable | `skills/think-causal/SKILL.md` | Not expressible in JSON Schema |
| `historical` | ≥2 distinct episodes per pattern; one episode is anecdote, not pattern | `skills/think-temporal/SKILL.md` | Schema has `patterns.items.episodes.minItems: 1` (under-constrained) |
| `modal` | Exactly one world in `possibleWorlds` has `isActual: true`, enforcing a single ground truth | `skills/think-advanced/SKILL.md` | Not expressible in JSON Schema |
| `gametheory` | ≥2 players (single-agent decision problems must use `optimization` instead) | `skills/think-strategic/SKILL.md` | Schema enforces `players.minItems: 2` (already covered) |
| `synthesis` | ≥2 sources (synthesis of one source is summary, not synthesis) | `skills/think-academic/SKILL.md` | Schema enforces `sources.minItems: 2` (already covered) |
| `engineering` | Trade studies require ≥2 alternatives | `skills/think-engineering/SKILL.md` | Schema enforces `tradeStudy.alternatives.minItems: 2` (already covered) |

The first four rows (`abductive`, `counterfactual`, `historical`, `modal`) are **schema-unenforceable** — only the model following the SKILL.md prose keeps them honest. The last three rows (`gametheory`, `synthesis`, `engineering`) are listed for completeness; they happen to be enforced by `minItems` in their schemas.

### `think-frameworks` category rules (12 modes)

All twelve rows below live in `skills/think-frameworks/SKILL.md`. None of these are expressible as top-level JSON Schema constraints — they are cross-field, cross-array, or "at least N of M optional groups" rules that Draft-7 `additionalProperties`/`minItems` cannot encode.

| Mode | Invariant | Schema status |
|---|---|---|
| `5w1h` | All six of `who`/`what`/`when`/`where`/`why`/`how` must be populated — a genuinely unknown dimension must contain `"unknown"`/`"not yet determined"`, never be silently omitted. | All six fields are `required`, but the schema cannot forbid a technically-present-but-empty-feeling value — the "don't leave it thin" rule is prose-only. |
| `swot` | **≥1 item in ≥2 of the 4 quadrants** (`strengths`/`weaknesses`/`opportunities`/`threats`). A SWOT with content in only one quadrant is incomplete. | None of the four quadrant arrays has `minItems` — "at least two of four populated" isn't a clean per-property constraint, so it is schema-unenforceable. |
| `fivewhys` | `whys[]` has **≥1** `{question, answer}` pair and a terminal `rootCause`; each `whys[i+1].question` must chain from `whys[i].answer` (ask "why" about the prior answer, not restate the original `problem`); `rootCause` must match the final `whys` entry's `answer`. | Schema enforces `whys.minItems: 1` and `rootCause` as required; the chaining relationship between consecutive `whys` entries and the `rootCause`/final-answer match are not expressible. |
| `fishbone` | `primaryCauses[]` (optional) must cross-reference causes that also appear verbatim within `categories[].causes[]` — it highlights, it does not introduce new causes. | Schema enforces `categories.minItems: 1`; the verbatim-cross-reference constraint between `primaryCauses` and `categories[].causes[]` is not expressible. |
| `pestle` | All six of `political`/`economic`/`social`/`technological`/`legal`/`environmental` must be populated — a genuinely inapplicable lane must contain `"none identified"`, never be silently thin. | All six fields are `required`, but (as with `5w1h`) the schema cannot forbid a thin-but-present value. |
| `forcefield` | Every `strength` rating (1-5) must be justified by its `force` text; a single underlying issue must not be double-counted as both a driving and a restraining force in disguised form. | Schema constrains `strength` to an integer 1-5 range but cannot validate that the rating is *justified* by the paired text, nor detect semantic double-counting across the two force arrays. |
| `decisionmatrix` | **≥2 options and ≥2 criteria**; **exactly one `scores` entry per option** (no missing or duplicate option in `scores[]`); each `scores[].perCriterion` array's order must match `criteria[]`'s order; `total` must be shown as the derived weighted sum (`perCriterion[i] × criteria[i].weight`, summed) — not asserted as a bare number. | Schema enforces `options.minItems: 2` and `criteria.minItems: 2`, but `scores` itself has no `minItems`/count constraint tying it to `options.length`, and cross-array order-alignment plus the weighted-sum arithmetic are both unenforceable. |
| `pareto` | `items[]` should be sorted descending by `value`; if `cumulativePercent` is present it must be correctly computed from `items[].value` and **monotonically non-decreasing, ending at (approximately) 100**; `vitalFew[]` must be a prefix of the sorted list (the highest-value items, not a scattered subset) and stop at roughly the 80% cumulative mark. | Schema has no `minItems`/ordering constraint on `items`, `cumulativePercent`, or `vitalFew`; sort order, monotonicity, the ~100 endpoint, and the ~80% "vital few" cutoff are all prose-only rules. |
| `stakeholder` | `quadrant` must be consistent with `power`/`interest`: high power + high interest → "Manage Closely"; high power + low interest → "Keep Satisfied"; low power + high interest → "Keep Informed"; low power + low interest → "Monitor". | Schema enforces `stakeholders.minItems: 1`; the power/interest → quadrant mapping is a cross-field derivation the schema cannot check. |
| `costbenefit` | The `recommendation` must state the sum of `costs[].amount` and the sum of `benefits[].amount` explicitly, and make an explicit go/no-go/conditional call — a bare recommendation without the underlying totals cannot be audited. | Schema has no `minItems` on `costs`/`benefits` and cannot validate that `recommendation`'s prose actually restates the computed totals. |
| `riskassessment` | **`score` = `probability` × `impact`.** This is the mode's defining invariant — `score` must be recomputed from its own `probability`/`impact` inputs before emitting, not asserted independently. `topRisks[]` entries (if present) must match `risks[].risk` verbatim and correspond to the highest-`score` entries. | Schema enforces `risks.minItems: 1`, but `probability`/`impact`/`score` are typed as `number` OR `string` (to accommodate qualitative registers) specifically because a strict numeric-product constraint would reject legitimate qualitative risk entries — the arithmetic relationship is entirely prose-enforced. |
| `gapanalysis` | Every `gaps[]` entry must have a specific, closable `action` (not a restatement of `current`/`desired`); if `actionPlan[]` is present, it must sequence the per-dimension actions into a realistic execution order. | Schema enforces `gaps.minItems: 1` and `action` as a required string field, but cannot validate that the action text is *specific* rather than generic, nor that `actionPlan`'s ordering is coherent. |

### Cross-field semantic rules

| Mode | Invariant | Skill file |
|---|---|---|
| `firstprinciples` | The conclusion's confidence must not exceed the lowest confidence value of any principle cited in the derivation chain | `skills/think-analytical/SKILL.md` |
| `bayesian` | The `posterior.calculation` field must show full arithmetic (e.g. `0.6 × 0.8 / (0.6 × 0.8 + 0.4 × 0.2) = 0.857`), not just the final result — readers and verifiers need to check the math | `skills/think-probabilistic/SKILL.md` |

These are correctness rules that depend on values across multiple fields, which JSON Schema cannot validate without custom keyword extensions.

### Referential integrity rules (v0.5.2+)

| Mode | Invariant | Skill file |
|---|---|---|
| `deductive` | **`derivationSteps[]` step numbers must be sequential and unique.** If `derivationSteps[]` is populated, the `stepNumber` values must form the sequence 1, 2, 3, ... with no gaps and no duplicates. | `skills/think-core/SKILL.md` |
| `deductive` | **No forward references in `stepsUsed[]`.** A step with `stepNumber: N` may only reference prior step numbers (values strictly less than N) in its `stepsUsed[]` array. Step 3 can reference 1 or 2; step 3 cannot reference 4 or itself. | `skills/think-core/SKILL.md` |
| `deductive` | **Valid `premisesUsed[]` indices.** Every integer in a step's `premisesUsed[]` must be a valid 0-indexed position into the top-level `premises[]` array (i.e., `0 ≤ index < len(premises)`). | `skills/think-core/SKILL.md` |
| `deductive` | **Every step must derive from something.** At least one of `premisesUsed[]` or `stepsUsed[]` on each step must be non-empty. A step with no inputs is a free-standing assertion, not a derivation — it has nothing to apply its `inferenceRule` to. | `skills/think-core/SKILL.md` |
| `deductive` | **Final step closes the chain.** The final step's `intermediateConclusion` must match the top-level `conclusion` (modulo whitespace and a trailing period). Otherwise the chain does not actually derive what the thought claims. | `skills/think-core/SKILL.md` |
| `inductive` | **`inductionSteps[]` step numbers must be sequential and unique** (v0.5.3+). If `inductionSteps[]` is populated, the `stepNumber` values must form the sequence 1, 2, 3, ... with no gaps and no duplicates. | `skills/think-core/SKILL.md` |
| `inductive` | **No forward references in `stepsUsed[]`** (v0.5.3+). A step with `stepNumber: N` may only reference prior, existing step numbers (values in the range `[1, N-1]`). No forward references, no self-references, no references to nonexistent step 0. | `skills/think-core/SKILL.md` |
| `inductive` | **Valid `observationsUsed[]` indices** (v0.5.3+). Every integer in a step's `observationsUsed[]` must be a valid 0-indexed position into the top-level `observations[]` array. | `skills/think-core/SKILL.md` |
| `inductive` | **Every step must derive from something** (v0.5.3+). At least one of `observationsUsed[]` or `stepsUsed[]` on each step must be non-empty. A step with no inputs is a free-standing assertion, not a refinement. | `skills/think-core/SKILL.md` |
| `inductive` | **Final step closes the chain** (v0.5.3+). The final step's `intermediateGeneralization` must match the top-level `generalization` (modulo whitespace and a trailing period). | `skills/think-core/SKILL.md` |
| `abductive` | **`abductionSteps[]` step numbers must be sequential and unique** (v0.5.4+). If `abductionSteps[]` is populated, the `stepNumber` values must form the sequence 1, 2, 3, ... with no gaps and no duplicates. | `skills/think-core/SKILL.md` |
| `abductive` | **No forward references in `stepsUsed[]`** (v0.5.4+). A step with `stepNumber: N` may only reference prior, existing step numbers (values in `[1, N-1]`). | `skills/think-core/SKILL.md` |
| `abductive` | **Valid `triggerObservation` id** (v0.5.4+). If `triggerObservation` is non-null, it must match an `id` in the top-level `observations[]` array. | `skills/think-core/SKILL.md` |
| `abductive` | **Valid `hypothesesGenerated[]` ids** (v0.5.4+). Every id in a step's `hypothesesGenerated[]` must match an `id` in the top-level `hypotheses[]` array. | `skills/think-core/SKILL.md` |
| `abductive` | **Valid `hypothesesEliminated[]` ids** (v0.5.4+). Every id in a step's `hypothesesEliminated[]` must match an `id` in the top-level `hypotheses[]` array. | `skills/think-core/SKILL.md` |
| `abductive` | **Every step must do something** (v0.5.4+). At least one of `hypothesesGenerated[]`, `hypothesesEliminated[]`, or `stepsUsed[]` on each step must be non-empty. | `skills/think-core/SKILL.md` |
| `abductive` | **Chain closure — `bestExplanation` was introduced** (v0.5.4+). If `bestExplanation` is present, its `id` must appear in at least one step's `hypothesesGenerated[]`. The committed hypothesis must have been explicitly generated during the stepwise process, not pulled from nowhere. | `skills/think-core/SKILL.md` |
| `abductive` | **Commitment coherence — `bestExplanation` was not eliminated** (v0.5.4+). The committed `bestExplanation.id` must NOT appear in any step's `hypothesesEliminated[]`. Generating a hypothesis, eliminating it, and then committing to it is internally inconsistent. | `skills/think-core/SKILL.md` |
| `abductive` | **No duplicate generation** (v0.5.4+). Each hypothesis id may appear in at most one step's `hypothesesGenerated[]` across the chain. "Generating" an already-introduced hypothesis is semantically empty. | `skills/think-core/SKILL.md` |
| `abductive` | **No re-generation after elimination** (v0.5.4+). Once a hypothesis is listed in some step's `hypothesesEliminated[]`, no later step may list it in `hypothesesGenerated[]`. This blocks silent rehabilitation. | `skills/think-core/SKILL.md` |

The `deductive` rules are enforced by `test/test_skill_invariants.py::check_deductive()` when a captured or sample thought populates the optional `derivationSteps[]` field. The `inductive` rules are enforced by `check_inductive()` when `inductionSteps[]` is populated. The `abductive` rules are enforced by `check_abductive()` when `abductionSteps[]` is populated (in addition to the base "≥2 hypotheses with non-equal scores" rule which applies to all abductive thoughts). Thoughts that omit the respective optional field entirely are exempt from the referential-integrity class of rules.

These rules cannot be expressed in JSON Schema because they reference values across multiple levels of the thought tree (step numbers, indices into sibling arrays, cross-comparisons between final step / commitment fields and the main thought, cross-step temporal ordering of generate/eliminate actions).

## How to apply this list

### When editing a SKILL.md file

- Search for the words `must`, `exactly one`, `at least`, `distinct`, `non-equal`, and `≥` in the existing text before making changes
- Each occurrence is likely a load-bearing invariant — preserve the wording even if rewriting the surrounding prose
- If intentionally rewriting an invariant, add a corresponding test sample to `test/samples/<mode>-invalid.json` that exercises the rule, so a future regression is caught at the smoke-test layer

### When adding a new mode

- Decide whether the mode has cardinality or distinctness invariants
- Encode whatever can be encoded in the JSON Schema (`minItems`, `const`, `enum`)
- Document the rest as explicit `must` clauses in the SKILL.md template
- Add a row to this document so the rule is not lost

### When debugging a smoke-test failure that "looks valid but feels wrong"

- Check this list — the failure may be a violation of an unenforceable invariant that the schema accepted
- Example: a `counterfactual` thought with two interventions will pass schema validation but is semantically broken; only the SKILL.md "exactly one `isIntervention`" rule catches it

## Distinction from schema bugs

Schema bugs (relaxed nested `additionalProperties: false`, `null` on optional scalars, expanded enums) are cases where the schema is **wrong** and rejects legitimate Claude output. The invariants in this document are different: they are cases where the schema is **correct but under-constrained** — it accepts output that is structurally valid but semantically broken.

Different problem, different fix:

- **Schema bugs** → relax the schema
- **Schema-unenforceable invariants** → tighten the SKILL.md prose, accept that automated tests cannot catch all of them, document the rules here so future contributors preserve them

## See also

- `CLAUDE.md` design principle: "Some validation rules live in SKILL.md prose, not in JSON Schema"
- `docs/ROADMAP-FUTURE-MODES-AND-FORMATS.md` "Strategic gaps" section for the related "no automated check for cross-field semantic rules" gap
- The schema files at `test/schemas/<mode>.json` are the source of truth for what *shape* a thought must have; this document is the source of truth for what *additional rules* the SKILL.md prose enforces beyond the schema
