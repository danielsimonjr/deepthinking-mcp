# Fold reasoning + algorithm skills into /think — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reasoning-skill's 12 analytical frameworks to deepthinking-plugin as 12 new schema-validated `/think` modes (34→46), enrich the existing `algorithmic` mode with algorithm-skill's CLRS refs + Shinka guidance, and retire the two standalone plugins.

**Architecture:** Each new mode lands the plugin's full per-mode artifact set. The 5 test-enforced artifacts (schema, `-valid.json` sample, visual-grammar, output-format doc, smoke prompt) must stay set-equal across all modes (`test/test_artifact_consistency.py`); 6 shared files (category SKILL, router `skills/think/SKILL.md`, `mode-index.md`, `reference/taxonomy.md`, dashboard `MODE_DISPLAY_NAMES`, `commands/think.md`) gain per-mode entries. New category skill `think-frameworks` houses the 12. algorithm-skill enriches the existing `think-engineering`/`algorithmic` mode (no new mode).

**Tech Stack:** Markdown + JSON Schema (Draft-7) + Python stdlib tests (no framework). Repo: `C:\Users\danie\Github\deepthinking-plugin` (branch `master`, direct-push).

## Global Constraints

- **Mode count 34 → 46**; the authoritative set is `test/schemas/*.json` filenames. `test_artifact_consistency.py` enforces set-equality across schemas/samples/visual-grammar/output-formats/smoke-prompts — a mode is only valid when ALL 5 exist.
- **12 new mode names (exact):** `5w1h`, `swot`, `fivewhys`, `fishbone`, `pestle`, `forcefield`, `decisionmatrix`, `pareto`, `stakeholder`, `costbenefit`, `riskassessment`, `gapanalysis`. None collide with the existing 34.
- **Every schema:** `"$schema":"http://json-schema.org/draft-07/schema#"`, `type:object`, `"mode":{"const":"<name>"}` in `required`, **top-level `additionalProperties:false`**, nested objects `additionalProperties:true` (established rule). Mirror `test/schemas/inductive.json` structure.
- **NO new `algorithmic` mode or `think-algorithmic` category** — `algorithmic` already exists under `think-engineering`; only enrich it (refs + Shinka guidance). Do not edit the existing 34 schemas.
- **Cognitive-bias system = reference** under `think-frameworks/references/`, not a mode. **Shinka workflow = guidance** in `think-engineering/SKILL.md`, not a mode.
- **Fast-suite gate (must be GREEN at every task end), run from repo root with `python -X utf8`:** `python test/test_plugin_json.py`, `python test/test_skill_frontmatter.py`, `python test/test_artifact_consistency.py`, `python test/test_format_grammars.py`, `python test/harness.py`, `python test/visual/validate-mermaid.py`, `python test/visual/validate-dot.py`, `python test/visual/test-dashboard.py`.
- Source content to migrate lives at `C:\Users\danie\Github\skills\reasoning-skill\` and `C:\Users\danie\Github\skills\algorithm-skill\`.
- No Node runtime, no MCP server, no third-party test framework. Windows: use `python` (not python3), forward slashes, `-X utf8`.

---

## File Structure

- `test/schemas/<mode>.json` (×12 new) — Draft-7 schema
- `test/samples/<mode>-valid.json` (×12) — validating worked example
- `reference/visual-grammar/<mode>.md` (×12) — Mermaid + DOT node structure
- `reference/output-formats/<mode>.md` (×12) — schema doc + example
- `test/smoke/prompts.json` — +12 entries
- `skills/think-frameworks/SKILL.md` (new) — teaches the 12; frontmatter `name: think-frameworks`
- `skills/think-frameworks/references/` (new) — migrated per-framework deep-dives + cognitive-biases/
- `skills/think/SKILL.md` — router table +12 rows
- `skills/think/mode-index.md` — decision-tree +12 entries
- `reference/taxonomy.md` — +12 entries
- `scripts/render-html-dashboard.py` — `MODE_DISPLAY_NAMES` +12 keys
- `commands/think.md` — mode list + Schema-References table +12 rows; category-read mapping +think-frameworks
- `skills/think-engineering/SKILL.md` + `skills/think-engineering/references/` — algorithm-skill enrichment
- `CLAUDE.md`, `ARCHITECTURE.md`, `README.md` — 34→46 invariant + new category
- (other repo) `~/Github/skills/.claude-plugin/marketplace.json`, `~/.claude/settings.json` — retire standalones

**Per-mode artifact recipe (follow existing templates exactly):** copy the shape of `test/schemas/inductive.json`, `test/samples/inductive-valid.json`, `reference/visual-grammar/inductive.md`, `reference/output-formats/inductive.md`. Add a `test/smoke/prompts.json` object `{"mode":"<name>","prompt":"<realistic task>"}`. Add a `skills/think/SKILL.md` router-table row `| \`<mode>\` | \`think-frameworks\` | <desc> |`. Add a `mode-index.md` decision-tree entry. Add a `reference/taxonomy.md` block (`### <Name> (\`<mode>\`)` with Category/Shape/Signals/Anti-signals). Add a `MODE_DISPLAY_NAMES` key. Add a `commands/think.md` mode-list bullet + Schema-References row.

---

### Task 1: Category scaffold + modes `5w1h`, `swot`, `fivewhys`, `fishbone`

**Files:** Create `skills/think-frameworks/SKILL.md`; create per-mode artifacts for the 4 modes across `test/schemas/`, `test/samples/`, `reference/visual-grammar/`, `reference/output-formats/`; edit `test/smoke/prompts.json`, `skills/think/SKILL.md`, `skills/think/mode-index.md`, `reference/taxonomy.md`, `scripts/render-html-dashboard.py`, `commands/think.md`.

**Interfaces — Produces:** the `think-frameworks` category skill (frontmatter `name: think-frameworks`) and the pattern all later mode batches follow.

**Mode cards (schema `required` + `properties`; all property objects nested-permissive):**

- **5w1h** — required: `mode, who, what, when, where, why, how`. properties: `who/what/when/where/why/how` each `{type:["string","array"],items:{type:string}}`; `summary` `{type:string}`. Grammar: 6-spoke hub ("What" center) → mermaid radial + DOT. Taxonomy signals: "who/what/when/where/why/how", "define the problem", "5W1H". mode-index entry: "Need to fully scope/define a problem before analysis? → **5w1h**". Dashboard: `"5w1h": "5W1H"`. Smoke prompt: a "scope this incident" task.
- **swot** — required: `mode, strengths, weaknesses, opportunities, threats`. properties: 4 arrays of strings; `subject` `{type:string}`; `recommendation` `{type:string}`. Prose invariant (in SKILL): ≥1 item in ≥2 quadrants. Grammar: 2×2 quadrant grid (mermaid subgraphs + DOT clusters). Taxonomy signals: "SWOT", "strengths/weaknesses", "strategic position". mode-index: "Assessing strategic position (internal + external factors)? → **swot**". Dashboard: `"swot": "SWOT Analysis"`.
- **fivewhys** — required: `mode, problem, whys, rootCause`. properties: `whys` `{type:array,minItems:1,items:{type:object,required:[question,answer],properties:{question:{type:string},answer:{type:string}}}}`; `correctiveAction` `{type:string}`. Grammar: vertical chain problem→why1→…→rootCause (mermaid TD + DOT). Taxonomy signals: "5 whys", "root cause", "why did this happen". mode-index: "Drilling from a symptom to a single root cause? → **fivewhys** (or **fishbone** for multi-category causes)". Dashboard: `"fivewhys": "5 Whys"`.
- **fishbone** — required: `mode, effect, categories`. properties: `categories` `{type:array,minItems:1,items:{type:object,required:[name,causes],properties:{name:{type:string},causes:{type:array,items:{type:string}}}}}`; `primaryCauses` `{type:array,items:{type:string}}`. Grammar: fishbone/Ishikawa — spine to effect, category ribs (mermaid LR + DOT). Taxonomy signals: "fishbone", "Ishikawa", "categorize causes", "6Ms". mode-index: "Cause analysis needing multiple cause CATEGORIES? → **fishbone**". Dashboard: `"fishbone": "Fishbone (Ishikawa)"`.

- [ ] **Step 1: Category SKILL.** Create `skills/think-frameworks/SKILL.md`. Frontmatter: `name: think-frameworks`; `description:` "Analytical framework reasoning methods — 5W1H, SWOT, 5 Whys, Fishbone, PESTLE, Force Field, Decision Matrix, Pareto, Stakeholder, Cost-Benefit, Risk Assessment, Gap Analysis. Use when the user invokes `/think <framework>` or asks for structured problem definition, strategic analysis, root-cause, prioritization, decision comparison, risk, or gap analysis." `argument-hint: "[framework] <problem>"`. Body: one teaching section per framework (start with the 4 in this task; later tasks append their sections), each stating the mode name, when to use, the schema's required fields, its prose invariants, and a pointer to `references/NN-<name>.md`. Add a top "Output Quality Rules" block (fill every field or say "none identified"; show scoring math for weighted modes; end with an action) and a "Bias check" pointer to `references/cognitive-biases/` (populated in Task 4). Mirror the voice/structure of `skills/think-engineering/SKILL.md`.
- [ ] **Step 2: Per-mode artifacts (×4).** For each of `5w1h, swot, fivewhys, fishbone`: create `test/schemas/<mode>.json` (per its card, mirroring `inductive.json`), `test/samples/<mode>-valid.json` (a realistic worked example populating every required field), `reference/visual-grammar/<mode>.md` (per its card — include both a ` ```mermaid ` and a ` ```dot ` block, following `reference/visual-grammar/inductive.md`), `reference/output-formats/<mode>.md` (title + JSON-Schema block + example, following `reference/output-formats/inductive.md`).
- [ ] **Step 3: Shared-file entries (×4).** Add to `test/smoke/prompts.json` (4 objects), `skills/think/SKILL.md` router table (4 rows, category `think-frameworks`), `skills/think/mode-index.md` (4 decision-tree entries per cards), `reference/taxonomy.md` (4 blocks), `scripts/render-html-dashboard.py` `MODE_DISPLAY_NAMES` (4 keys), `commands/think.md` (4 mode-list bullets under a new "**think-frameworks**" group + 4 Schema-References rows + add `5w1h, swot, fivewhys, fishbone → read skills/think-frameworks/SKILL.md` to Method Instructions).
- [ ] **Step 4: Run the fast suite.** From repo root: run all 8 fast-suite commands (Global Constraints). Expected: all pass; `test_artifact_consistency.py` reports **38 modes**; `harness.py` validates the 4 new samples; mermaid/dot validators parse the 4 new grammars.
- [ ] **Step 5: Fix any failures at root** (schema/sample mismatch, unparsed grammar block, missing shared entry) until green. Do NOT relax a schema to force a bad sample — fix the sample.
- [ ] **Step 6: Commit.** `git add skills/think-frameworks test/schemas test/samples reference/visual-grammar reference/output-formats test/smoke/prompts.json skills/think/SKILL.md skills/think/mode-index.md reference/taxonomy.md scripts/render-html-dashboard.py commands/think.md` then `git commit -m "feat(modes): add think-frameworks category + 5w1h/swot/fivewhys/fishbone (38 modes)"`.

---

### Task 2: Modes `pestle`, `forcefield`, `decisionmatrix`, `pareto`

**Files:** per-mode artifacts (×4) in the 4 artifact dirs; append to the 6 shared files + the category SKILL.

**Mode cards:**
- **pestle** — required: `mode, political, economic, social, technological, legal, environmental`. properties: those 6 as `{type:array,items:{type:string}}`; `subject` string; `keyFactors` `{type:array,items:{type:string}}`. Grammar: 6-lane board (mermaid subgraphs + DOT clusters). Taxonomy signals: "PESTLE", "environmental scan", "macro factors". mode-index: "Scanning the external/macro environment? → **pestle**". Dashboard: `"pestle": "PESTLE Analysis"`.
- **forcefield** — required: `mode, change, drivingForces, restrainingForces`. properties: `drivingForces`/`restrainingForces` `{type:array,items:{type:object,required:[force,strength],properties:{force:{type:string},strength:{type:integer,minimum:1,maximum:5}}}}`; `netAssessment` string; `recommendation` string. Grammar: opposing horizontal arrows toward a center line (mermaid + DOT). Taxonomy signals: "force field", "driving/restraining forces", "change readiness". mode-index: "Weighing forces for/against a change? → **forcefield**". Dashboard: `"forcefield": "Force Field Analysis"`.
- **decisionmatrix** — required: `mode, options, criteria, scores, recommendation`. properties: `options` `{type:array,minItems:2,items:{type:string}}`; `criteria` `{type:array,minItems:2,items:{type:object,required:[name,weight],properties:{name:{type:string},weight:{type:number}}}}`; `scores` `{type:array,items:{type:object,required:[option,perCriterion,total],properties:{option:{type:string},perCriterion:{type:array,items:{type:number}},total:{type:number}}}}`; `recommendation` string. Prose invariant: ≥2 options, ≥2 criteria, show weights×scores. Grammar: scored matrix table rendered as a grid (mermaid + DOT). Taxonomy signals: "decision matrix", "weighted criteria", "compare options". mode-index: "Comparing options against weighted criteria? → **decisionmatrix**". Dashboard: `"decisionmatrix": "Decision Matrix"`.
- **pareto** — required: `mode, items, vitalFew`. properties: `items` `{type:array,items:{type:object,required:[name,value],properties:{name:{type:string},value:{type:number}}}}`; `cumulativePercent` `{type:array,items:{type:number}}`; `vitalFew` `{type:array,items:{type:string}}`; `recommendation` string. Grammar: sorted bars + cumulative line (mermaid + DOT best-effort). Taxonomy signals: "Pareto", "80/20", "vital few", "prioritize". mode-index: "Prioritizing the vital few from the trivial many? → **pareto**". Dashboard: `"pareto": "Pareto (80/20)"`.

- [ ] **Step 1:** Append 4 teaching sections to `skills/think-frameworks/SKILL.md` (one per mode: required fields + invariants + reference pointer).
- [ ] **Step 2:** Create per-mode artifacts (×4) — schema, sample, visual-grammar (mermaid+dot), output-format — per cards, mirroring the Task-1 files.
- [ ] **Step 3:** Append shared-file entries (×4): smoke prompts, router table, mode-index, taxonomy, `MODE_DISPLAY_NAMES`, `commands/think.md` (mode list + Schema-References + Method-Instructions category line already added in Task 1, so only add these 4 modes to the existing `think-frameworks` mapping).
- [ ] **Step 4:** Run the full fast suite. Expected green; `test_artifact_consistency.py` = **42 modes**.
- [ ] **Step 5:** Fix any failures at root until green.
- [ ] **Step 6:** Commit: `git commit -m "feat(modes): add pestle/forcefield/decisionmatrix/pareto (42 modes)"`.

---

### Task 3: Modes `stakeholder`, `costbenefit`, `riskassessment`, `gapanalysis`

**Files:** per-mode artifacts (×4) + append to shared files + category SKILL.

**Mode cards:**
- **stakeholder** — required: `mode, stakeholders`. properties: `stakeholders` `{type:array,minItems:1,items:{type:object,required:[name,power,interest,quadrant,strategy],properties:{name:{type:string},power:{type:string},interest:{type:string},quadrant:{type:string},strategy:{type:string}}}}`; `recommendation` string. Grammar: power/interest 2×2 (mermaid subgraphs + DOT clusters). Taxonomy signals: "stakeholder", "power/interest", "manage stakeholders". mode-index: "Mapping stakeholders by power & interest? → **stakeholder**". Dashboard: `"stakeholder": "Stakeholder Analysis"`.
- **costbenefit** — required: `mode, option, costs, benefits, recommendation`. properties: `option` string; `costs`/`benefits` `{type:array,items:{type:object,required:[item,amount],properties:{item:{type:string},amount:{type:number}}}}`; `npv`/`roi`/`paybackPeriod` each `{type:["number","string","null"]}`; `recommendation` string. Prose invariant: show totals. Grammar: two-column costs-vs-benefits balance (mermaid + DOT). Taxonomy signals: "cost-benefit", "ROI", "NPV", "payback". mode-index: "Weighing quantified costs against benefits? → **costbenefit**". Dashboard: `"costbenefit": "Cost-Benefit Analysis"`.
- **riskassessment** — required: `mode, risks`. properties: `risks` `{type:array,minItems:1,items:{type:object,required:[risk,probability,impact,score,mitigation],properties:{risk:{type:string},probability:{type:["number","string"]},impact:{type:["number","string"]},score:{type:["number","string"]},mitigation:{type:string}}}}`; `topRisks` `{type:array,items:{type:string}}`; `recommendation` string. Prose invariant: score = probability×impact shown. Grammar: probability×impact heat grid (mermaid + DOT). Taxonomy signals: "risk assessment", "probability × impact", "risk matrix". mode-index: "Rating risks by probability × impact? → **riskassessment**". Dashboard: `"riskassessment": "Risk Assessment"`.
- **gapanalysis** — required: `mode, currentState, desiredState, gaps`. properties: `currentState` string; `desiredState` string; `gaps` `{type:array,minItems:1,items:{type:object,required:[dimension,current,desired,gap,action],properties:{dimension:{type:string},current:{type:string},desired:{type:string},gap:{type:string},action:{type:string}}}}`; `actionPlan` `{type:array,items:{type:string}}`. Grammar: current→gap→desired lanes (mermaid + DOT). Taxonomy signals: "gap analysis", "current vs desired", "capability gap". mode-index: "Mapping current vs desired state with an action plan? → **gapanalysis**". Dashboard: `"gapanalysis": "Gap Analysis"`.

- [ ] **Step 1:** Append 4 teaching sections to `skills/think-frameworks/SKILL.md`.
- [ ] **Step 2:** Create per-mode artifacts (×4) per cards.
- [ ] **Step 3:** Append shared-file entries (×4) across smoke/router/mode-index/taxonomy/dashboard/commands.
- [ ] **Step 4:** Run the full fast suite. Expected green; `test_artifact_consistency.py` = **46 modes** (all 12 landed).
- [ ] **Step 5:** Fix any failures at root until green.
- [ ] **Step 6:** Commit: `git commit -m "feat(modes): add stakeholder/costbenefit/riskassessment/gapanalysis (46 modes)"`.

---

### Task 4: Migrate reasoning-skill references + cognitive-bias reference

**Files:** create `skills/think-frameworks/references/` (from `~/Github/skills/reasoning-skill/references/` and `.../cognitive-biases/`); edit `skills/think-frameworks/SKILL.md` (wire pointers).

- [ ] **Step 1:** Copy `C:\Users\danie\Github\skills\reasoning-skill\references\01-5w1h.md … 12-gap-analysis.md`, `analytical-methodology-examples.md`, `reasoning-types-reference.md`, `reasoning_patterns.md`, `quick_reference.md`, `domain_mappings.md` into `skills/think-frameworks/references/`.
- [ ] **Step 2:** Copy `C:\Users\danie\Github\skills\reasoning-skill\cognitive-biases\` into `skills/think-frameworks/references/cognitive-biases/`.
- [ ] **Step 3:** In `skills/think-frameworks/SKILL.md`, ensure each framework's teaching section points to its `references/NN-<name>.md` deep-dive, and the "Bias check" block points to `references/cognitive-biases/COGNITIVE_BIASES_FRAMEWORK.md` + `bias_detection_guide.md`, framed as a pre-commit check for the decision modes (`decisionmatrix`, `riskassessment`, `costbenefit`, `swot`).
- [ ] **Step 4:** Run the fast suite (references don't affect the mode set; confirms nothing broke; frontmatter test still green). Expected: green, still 46 modes.
- [ ] **Step 5:** Commit: `git add skills/think-frameworks && git commit -m "feat(frameworks): migrate reasoning-skill deep-dives + cognitive-bias reference"`.

---

### Task 5: Enrich the existing `algorithmic` mode with algorithm-skill (refs + Shinka guidance)

**Files:** create `skills/think-engineering/references/`; edit `skills/think-engineering/SKILL.md`.

- [ ] **Step 1:** Copy `C:\Users\danie\Github\skills\algorithm-skill\references\clrs-full-extraction.json` and `shinka-evolution.md` into `skills/think-engineering/references/`.
- [ ] **Step 2:** In `skills/think-engineering/SKILL.md`, under the existing "Algorithmic Reasoning" section, add: (a) a pointer to `references/clrs-full-extraction.json` for per-algorithm complexity/pitfalls, and (b) a new "Evolutionary Optimization (Shinka)" guidance subsection — the analyze→scaffold→evolve→inspect→deliver workflow from `~/Github/skills/algorithm-skill/SKILL.md` (lines ~205-292), framed as guidance triggered by "optimize / make faster / find a better algorithm", explicitly NOT a schema'd mode, pointing to `references/shinka-evolution.md`. Do not alter the `algorithmic` schema.
- [ ] **Step 3:** Run the fast suite. Expected: green, 46 modes, `algorithmic` schema unchanged.
- [ ] **Step 4:** Commit: `git add skills/think-engineering && git commit -m "feat(algorithmic): add CLRS extraction + Shinka optimization guidance"`.

---

### Task 6: Update invariant + human docs; final reconciliation

**Files:** `CLAUDE.md`, `ARCHITECTURE.md`, `README.md`.

- [ ] **Step 1:** `CLAUDE.md` — change every "34-mode invariant"/"34 modes" reference to **46**; add the `think-frameworks` category (12 modes) to the category list; note algorithm-skill enrichment (no new mode), bias-as-reference, Shinka-as-guidance. Keep the 10-place invariant description accurate.
- [ ] **Step 2:** `ARCHITECTURE.md` — add `think-frameworks` to the category/mode map; update any mode count.
- [ ] **Step 3:** `README.md` — document the new frameworks category + 34→46; add `/think swot "…"` style examples.
- [ ] **Step 4:** Reconcile — grep the repo for the literal `34` mode-count claims (`grep -rn "34 " CLAUDE.md ARCHITECTURE.md README.md commands/think.md`) and fix any stragglers; verify `MODE_DISPLAY_NAMES` has all 12 new keys (`python -c "..."` or grep). Confirm `commands/think.md` lists all 12 modes and the `think-frameworks` category read-mapping.
- [ ] **Step 5:** Run the FULL fast suite once more. Expected: all green, 46 modes.
- [ ] **Step 6:** Commit: `git commit -am "docs: 34->46 mode invariant + think-frameworks category (CLAUDE/ARCHITECTURE/README)"`.

---

### Task 7: Retire the standalone reasoning-skill + algorithm-skill plugins (other repo)

**Files:** `C:\Users\danie\Github\skills\.claude-plugin\marketplace.json`; `C:\Users\danie\.claude\settings.json`.

- [ ] **Step 1:** In `~/Github/skills/.claude-plugin/marketplace.json`, remove the `reasoning-skill` and `algorithm-skill` plugin entries (parse as JSON, delete the two objects, keep valid JSON). Do NOT touch other entries.
- [ ] **Step 2:** In `~/.claude/settings.json`, remove the keys `"reasoning-skill@local-marketplace"` and `"algorithm-skill@local-marketplace"` from `enabledPlugins` (atomic edit; keep valid JSON; do not alter other keys).
- [ ] **Step 3:** Verify both files still parse (`python -c "import json,io; json.load(open(r'<path>',encoding='utf-8'))"` for each). Leave the `~/Github/skills/reasoning-skill/` and `algorithm-skill/` source folders in place.
- [ ] **Step 4:** Commit in the skills repo: `cd ~/Github/skills && git add .claude-plugin/marketplace.json && git commit -m "chore: retire reasoning-skill + algorithm-skill plugins (folded into deepthinking)"`. (settings.json is not a repo file — no commit.) Note in the report that the user must `/reload-plugins` to drop them.

---

### Task 8: Release deepthinking-plugin

**Files:** `.claude-plugin/plugin.json`, `CHANGELOG.md`.

- [ ] **Step 1:** Bump `.claude-plugin/plugin.json` `"version"` `0.5.4 → 0.6.0` (12 new modes = a feature release).
- [ ] **Step 2:** Add a `CHANGELOG.md` entry above the previous one (Keep-a-Changelog): Added — think-frameworks category with 12 framework modes (list them); algorithmic enriched with CLRS extraction + Shinka guidance; cognitive-bias reference. Changed — 34→46 mode invariant. Removed — none (standalone-plugin retirement is external).
- [ ] **Step 3:** Run the FULL fast suite a final time (release gate). Expected: all green, 46 modes. Also run `python test/test_plugin_json.py` to confirm the version bump parses.
- [ ] **Step 4:** Commit + push + tag: `git add .claude-plugin/plugin.json CHANGELOG.md && git commit -m "release: deepthinking-plugin 0.6.0 — 46 modes (frameworks + algorithmic enrichment)" && git push origin master && git tag -a v0.6.0 -m "v0.6.0 — 12 framework modes + algorithmic enrichment" && git push origin master --tags`.
- [ ] **Step 5:** Verify remote == local: `git rev-parse HEAD` == `git ls-remote origin -h refs/heads/master`. Report the SHA + tag.

---

## Self-Review (plan vs spec)

- **Coverage:** 12 framework modes → Tasks 1-3 (4 each); reasoning-skill refs + bias reference → Task 4; algorithmic enrichment (refs + Shinka guidance) → Task 5; invariant+docs 34→46 → Task 6; retire standalones → Task 7; release → Task 8. All 7 spec success criteria mapped.
- **No new algorithmic mode:** Task 5 only enriches `think-engineering`; no schema/mode/category added. ✓
- **Bias = reference, Shinka = guidance:** Task 4 (bias under think-frameworks/references) + Task 5 (Shinka guidance in think-engineering). ✓
- **Placeholder scan:** each mode card gives concrete `required`+`properties`; steps name exact files/commands; no "TBD". Schemas are specified by field, implementer transcribes into Draft-7 following `inductive.json` (a template, not a placeholder).
- **Consistency:** mode-count checkpoints 38→42→46 match 34+4+4+4; the 12 names are identical across Global Constraints, tasks, and shared-file steps; every mode lands all 5 test-enforced artifacts within its task so `test_artifact_consistency.py` stays green.
