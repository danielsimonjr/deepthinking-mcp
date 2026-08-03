# Fold reasoning-skill + algorithm-skill into deepthinking as first-class /think modes — Design

## Goal

Absorb the two standalone skills `reasoning-skill` and `algorithm-skill` into the
deepthinking-plugin. reasoning-skill's 12 analytical frameworks become **12 new
schema-validated `/think` modes** (mode count **34 → 46**); algorithm-skill's unique
content **enriches the EXISTING `algorithmic` mode** rather than adding a new one. After
this, everything reasoning/analytical/algorithmic is reachable through the one `/think`
system, and the two standalone local-marketplace plugins are retired.

## Motivation

`reasoning-skill` (12 analytical frameworks + a 110-type reasoning taxonomy + a
cognitive-bias system) and `algorithm-skill` (CLRS selection + a Shinka evolutionary-
optimization workflow) overlap and sit beside the deepthinking `/think` modes.
Consolidating removes the overlap, gives the frameworks one uniform schema-validated
output contract, and leaves a single home for reasoning knowledge.

## What already exists (verified — do NOT duplicate)

- deepthinking already ships the **reasoning modes** reasoning-skill lists: `inductive`,
  `deductive`, `abductive` (`think-core`); `causal`, `counterfactual` (`think-causal`);
  `bayesian`, `evidential` (`think-probabilistic`); `gametheory`, `optimization`,
  `constraint` (`think-strategic`); `systemsthinking`, `formallogic`, `scientificmethod`
  (`think-scientific`); `firstprinciples`, `metareasoning` (`think-analytical`). These are
  NOT re-created.
- deepthinking already ships a comprehensive **`algorithmic`** mode under `think-engineering`
  (`test/schemas/algorithmic.json`): a CLRS-grounded schema with a `thoughtType` enum
  (`algorithm_definition`, `algorithm_selection`, `complexity_analysis`, `recurrence_solving`,
  `correctness_proof`, `data_structure_selection`, `comparison`), master-theorem structure,
  loop invariants, DP/greedy proofs, amortized analysis, and data-structure operations.
  **No new algorithmic mode/category is created** — algorithm-skill's unique content
  enriches this existing mode.

## Net-new work = 12 framework modes (+ an algorithmic enrichment)

### New category `think-frameworks` — 12 modes
`5w1h`, `swot`, `fivewhys`, `fishbone`, `pestle`, `forcefield`, `decisionmatrix`,
`pareto`, `stakeholder`, `costbenefit`, `riskassessment`, `gapanalysis`
(none collide with the existing 34 mode names). **34 + 12 = 46.**

### Absorb algorithm-skill into the existing `algorithmic` mode (NO new mode/schema)
- Migrate algorithm-skill's `references/clrs-full-extraction.json` and its algorithm/
  data-structure selection tables into `skills/think-engineering/references/` so the
  existing `algorithmic` mode can cite them.
- Add algorithm-skill's **Shinka evolutionary-optimization workflow** (analyze → scaffold →
  evolve → inspect → deliver) as **guidance** inside `skills/think-engineering/SKILL.md`
  plus a `references/shinka-evolution.md`, triggered when the user says "optimize / make
  faster / find a better algorithm". It is an action loop that shells out to `shinka-*`, so
  it is guidance, NOT a schema'd thought.
- The existing `algorithmic` schema is already sufficient; only extend it if a concrete gap
  surfaces during implementation (default: leave it unchanged).

## Cognitive-bias system → reference, NOT a mode

reasoning-skill's cognitive-bias system (50+ biases, detection, debiasing) is a cross-cutting
checker, not a single "thought." It ships as reference material under `think-frameworks`
(`skills/think-frameworks/references/cognitive-biases/…`) — a "run the bias check before
committing" step the decision modes (`decisionmatrix`, `riskassessment`, etc.) point to. It
is NOT a mode.

## Per-mode schema shapes for the 12 framework modes (authoritative field intent; exact Draft-7 JSON is a plan task)

Every schema is **top-level `additionalProperties: false`, nested permissive** (the plugin's
established rule); every thought carries `"mode": "<name>"`.

- **5w1h** — `who, what, when, where, why, how` (string or string[]), `summary`.
- **swot** — `subject`, `strengths[]`, `weaknesses[]`, `opportunities[]`, `threats[]`, `recommendation`.
- **fivewhys** — `problem`, `whys[{question, answer}]` (chain), `rootCause`, `correctiveAction`.
- **fishbone** — `effect`, `categories[{name, causes[]}]` (6Ms/8Ps), `primaryCauses[]`.
- **pestle** — `subject`, `political[]`, `economic[]`, `social[]`, `technological[]`, `legal[]`, `environmental[]`, `keyFactors[]`.
- **forcefield** — `change`, `drivingForces[{force, strength(1-5)}]`, `restrainingForces[{force, strength(1-5)}]`, `netAssessment`, `recommendation`.
- **decisionmatrix** — `options[]`, `criteria[{name, weight}]`, `scores[{option, perCriterion[], total}]`, `recommendation` (scoring math shown).
- **pareto** — `items[{name, value}]`, `cumulativePercent[]`, `vitalFew[]`, `recommendation`.
- **stakeholder** — `stakeholders[{name, power, interest, quadrant, strategy}]`, `recommendation`.
- **costbenefit** — `option`, `costs[{item, amount}]`, `benefits[{item, amount}]`, optional `npv/roi/paybackPeriod`, `recommendation`.
- **riskassessment** — `risks[{risk, probability, impact, score, mitigation}]`, `topRisks[]`, `recommendation`.
- **gapanalysis** — `currentState`, `desiredState`, `gaps[{dimension, current, desired, gap, action}]`, `actionPlan[]`.

Constraints JSON Schema can't express live in the `think-frameworks` SKILL prose (the
plugin's pattern): e.g. `decisionmatrix` requires ≥2 options and ≥2 criteria; `fivewhys`
requires ≥1 why and a terminal `rootCause`; `swot` requires ≥1 item in at least two quadrants.

## The 10 artifacts each of the 12 new modes must land (the invariant)

Per the plugin's CLAUDE.md "34-mode invariant", every mode appears in 10 places, enforced by
`test/test_artifact_consistency.py` (items 1–5, 9) plus manual items 6–8 and item 10:

1. `test/schemas/<mode>.json` — Draft-7 schema
2. `test/samples/<mode>-valid.json` — realistic worked example that validates
3. `reference/visual-grammar/<mode>.md` — Mermaid + DOT templates
4. `reference/output-formats/<mode>.md` — schema doc + example
5. `skills/think-frameworks/SKILL.md` — teaches the mode
6. `skills/think/SKILL.md` — router table row + category read-mapping
7. `skills/think/mode-index.md` — auto-recommend decision-tree entry
8. `reference/taxonomy.md` — canonical taxonomy entry
9. `test/smoke/prompts.json` — smoke prompt
10. `scripts/render-html-dashboard.py` — `MODE_DISPLAY_NAMES` entry (e.g. `swot → "SWOT Analysis"`, `5w1h → "5W1H"`, `fivewhys → "5 Whys"`)

Plus: `commands/think.md` gains the 12 mode rows in its mode list and Schema-References
table, and its "Method Instructions" category-read mapping gains `think-frameworks`.

## Migrated reference material (progressive disclosure)

- reasoning-skill's `references/01-5w1h.md … 12-gap-analysis.md`, `analytical-methodology-examples.md`,
  `reasoning-types-reference.md`, `reasoning_patterns.md`, `quick_reference.md`, `domain_mappings.md`
  → `skills/think-frameworks/references/` (per-framework deep-dives, loaded on demand).
- reasoning-skill's `cognitive-biases/*` → `skills/think-frameworks/references/cognitive-biases/`.
- algorithm-skill's `references/clrs-full-extraction.json` + `shinka-evolution.md`
  → `skills/think-engineering/references/`.

## Invariant + docs update

- `CLAUDE.md`: the "34-mode invariant" becomes the **46-mode invariant**; note the new
  `think-frameworks` category, the algorithmic-enrichment (no new mode), and the
  bias-as-reference / Shinka-as-guidance decisions.
- `test/test_artifact_consistency.py`: the authoritative set is the 46 `test/schemas/*.json`
  filenames; it enforces set-equality across items 1–5 and 9 automatically.
- `ARCHITECTURE.md` + `README.md`: document the new category and the 34→46 mode-count change.

## Retire the standalone plugins

- Remove `reasoning-skill` and `algorithm-skill` from
  `~/Github/skills/.claude-plugin/marketplace.json` (local-marketplace manifest) and their
  `"<name>@local-marketplace": true` keys from `~/.claude/settings.json` (no double-load).
- The `~/Github/skills/reasoning-skill/` and `~/Github/skills/algorithm-skill/` folders remain
  as authoring source but stop being delivered as plugins. (User runs `/reload-plugins` after.)

## Release

Version-bump `.claude-plugin/plugin.json` (0.5.4 → next), add a `CHANGELOG.md` entry, and cut
a git tag / GitHub release per the plugin's release sequence.

## Non-goals

- No duplication of the reasoning modes deepthinking already ships.
- **No new `algorithmic` mode or `think-algorithmic` category** — enrich the existing mode.
- No forcing the bias system or the Shinka workflow into schema'd modes.
- No Node.js runtime, no MCP server, no third-party test framework (standing constraints).
- No change to the existing 34 modes' schemas (except an optional, gap-driven `algorithmic` tweak).

## Testing

Documentation/artifact work — the gate is the plugin's **fast suite**, which must stay green
after every task:
`test/test_plugin_json.py`, `test/test_skill_frontmatter.py`,
`test/test_artifact_consistency.py` (46-way set-equality), `test/test_format_grammars.py`,
`test/harness.py` (schema validations: 46 valid samples + the existing invalid cases),
`test/visual/validate-mermaid.py`, `test/visual/validate-dot.py`,
`test/visual/test-dashboard.py`. Each new mode's `-valid.json` sample must validate against
its schema, and its Mermaid/DOT grammars must parse. The expensive smoke suite (`test/smoke/`)
is out of scope for the automated gate but recommended before the release tag.

## Success criteria

1. 12 new framework modes exist, each landing all 10 artifacts; `test_artifact_consistency.py`
   passes with a **46-mode** set (no missing/extra).
2. The full fast suite is green.
3. `/think swot "…"`, `/think decisionmatrix "…"`, `/think fivewhys "…"` (etc.) route to
   `think-frameworks` and emit schema-valid JSON + summary; `/think-render` renders them.
4. The existing `algorithmic` mode gains algorithm-skill's CLRS references + Shinka guidance
   (as reference/guidance, not a new mode); `/think algorithmic` still works unchanged.
5. The cognitive-bias reference is present under `think-frameworks` (not a mode).
6. `reasoning-skill` and `algorithm-skill` no longer load as standalone plugins; no double-load.
7. deepthinking-plugin version bumped, CHANGELOG updated, release cut.
