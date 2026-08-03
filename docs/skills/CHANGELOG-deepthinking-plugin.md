# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2026-07-07

Feature release. Adds a new `think-frameworks` category of 12 analytical-framework reasoning modes, growing the mode set from 34 to 46. Also folds CLRS algorithm-selection extraction and Shinka evolutionary-optimization guidance into the existing `algorithmic` mode, and migrates the cognitive-bias check from the (now-retired) standalone `reasoning-skill` plugin in as a reference, not a mode.

### Added

- **`think-frameworks` category — 12 new analytical-framework modes**, bringing the total mode set from 34 to 46: `5w1h` (Five Ws and How), `swot` (Strengths/Weaknesses/Opportunities/Threats), `fivewhys` (root-cause drill-down), `fishbone` (Ishikawa cause-and-effect), `pestle` (Political/Economic/Social/Technological/Legal/Environmental scan), `forcefield` (Lewin force-field analysis), `decisionmatrix` (weighted-criteria option scoring), `pareto` (80/20 impact prioritization), `stakeholder` (stakeholder power/interest mapping), `costbenefit` (cost-benefit analysis), `riskassessment` (probability x impact risk scoring), `gapanalysis` (current-state vs. desired-state gap mapping). Each mode ships the full 10-artifact set (schema, sample, visual grammar, output-format doc, category skill section, router entry, mode-index entry, taxonomy entry, smoke prompt, dashboard display name) per the mode-set invariant in `CLAUDE.md`.
- **`skills/think-frameworks/SKILL.md`** — the category skill teaching all 12 framework modes, including reasoning-skill's per-framework deep-dive guidance (when to reach for each framework, how to structure the output, common pitfalls) migrated in from the standalone `reasoning-skill` plugin.
- **`skills/think-frameworks/references/cognitive-biases/`** — the cognitive-bias reference migrated from the standalone `reasoning-skill` plugin, applied as a pre-commit bias check on the draft output of the decision modes (`decisionmatrix`, `riskassessment`, `costbenefit`, `swot`). Ships as a **reference, not a mode** — it does not emit its own thought or appear in the 46-mode set.
- **`skills/think-engineering/SKILL.md`** — the `algorithmic` mode enriched with a CLRS full-extraction algorithm-selection reference (`references/clrs-full-extraction.json`) and a Shinka analyze->scaffold->evolve->inspect->deliver evolutionary-optimization workflow (`references/shinka-evolution.md`), triggered by "optimize / make faster / find a better algorithm" language. Guidance layered onto the existing mode; `test/schemas/algorithmic.json` is unchanged and there is no separate `shinka` mode.

### Changed

- **The 34-mode invariant is now the 46-mode invariant.** `CLAUDE.md`, `README.md`, `ARCHITECTURE.md`, `reference/taxonomy.md`, and `docs/SKILL-INVARIANTS.md` all updated to reflect 46 modes across 13 categories (12 original categories + the new `think-frameworks` category). `test/test_artifact_consistency.py` now enforces set-equality across all 46 modes.

### Note

- The standalone `reasoning-skill` and `algorithm-skill` plugins are retired — their content is folded into this plugin's `think-frameworks` category and `algorithmic` mode respectively. Users of the standalone plugins should disable them and run `/reload-plugins` to pick up the merged functionality here.

## [0.5.4] - 2026-04-14

Schema enrichment release. Third and final of three planned core-triad enrichments: the `abductive` mode gains an optional `abductionSteps[]` field for iterative hypothesis generation, eliminative narrowing, hypothetico-deductive cycles, and other multi-round abduction patterns. Backward-compatible — atomic single-shot abductions continue to validate unchanged. The core reasoning triad (`deductive`, `inductive`, `abductive`) now has symmetric multi-step support.

### Added

- **`test/schemas/abductive.json` — optional `abductionSteps[]` array.** Added under a new top-level property (not in `required`). Each step object has 3 required fields (`stepNumber: integer ≥ 1`, `stepSummary: string minLength 1`, `abductionMethod: string minLength 1`) and 4 optional fields: `triggerObservation` (nullable string referencing an `observations[].id`), `hypothesesGenerated` (array of hypothesis id strings), `hypothesesEliminated` (array of hypothesis id strings), `stepsUsed` (array of prior step numbers). Unlike deductive's integer-indexed `premisesUsed[]` and inductive's integer-indexed `observationsUsed[]`, abductive cross-references hypothesis **ids** (strings) because its hypothesis objects already carry first-class ids. Free-text `abductionMethod` in v0.5.4 with the documented vocabulary `retroduction` (backward generation from effect to cause), `hypothetico-deductive` (prediction-checking), `eliminative` (ruling out alternatives), `ibe` (inference to the best explanation — commitment), `other`.
- **`reference/output-formats/abductive.md`** — rewritten to document the new field shape, the required-vs-optional split, two worked examples (atomic single-shot Tuesday 503 scenario and a 3-step iterative version of the same scenario for direct compare/contrast), and the 10 referential-integrity invariants the field must follow. Explains the deliberate step-level-scoring omission as a design decision, not a session-time deferral.
- **`reference/visual-grammar/abductive.md`** — rewritten with conditional rendering dispatch: the classic parallel-hypothesis diagram (ranked purple ellipses with gold-highlighted best, observation blue rectangles on top, evidence diamonds on the side) for atomic abductions, versus a multi-tier iterative flow (blue observations → neutral-gray step nodes with purple "generates" edges and red dashed "eliminated" edges → gold `Best Explanation` node with a thick gold "commit" arrow) for multi-step. Mermaid and DOT templates for both cases plus worked examples for each.
- **`skills/think-core/SKILL.md`** — the abductive section gained a new "Multi-step abductions — when to use `abductionSteps[]`" subsection with the 3-case process-type taxonomy (progressive hypothesis generation, eliminative narrowing, hypothetico-deductive cycles) and a dedicated `abductionMethod` vocabulary block that clarifies the relationship between retroduction (generation) and `ibe` (commitment) — this avoids a philosophy-of-science conflation flagged by the domain reviewer. A second Quick Template and a second Worked Example (both using the Tuesday 503 scenario — the atomic and iterative shapes side-by-side for compare/contrast). Expanded verification checklist reflecting the 10 enforced invariants.
- **`test/test_skill_invariants.py::check_abductive()`** — the existing check (which enforced the ≥2 hypotheses with non-equal scores base rule) was extended with 10 new referential-integrity rules that activate only when `abductionSteps[]` is populated. The rules are: (2a) sequential unique step numbers 1..N, (2b) `stepsUsed[]` references must be in range `[1, stepNumber-1]` (no forward, self, or nonexistent refs), (2c) `triggerObservation` if non-null must match a valid `observations[].id`, (2d) all ids in `hypothesesGenerated[]` must match valid `hypotheses[].id`s, (2e) same for `hypothesesEliminated[]`, (2f) every step must do something (at least one of the three action arrays non-empty), (2g) chain closure — `bestExplanation.id` must have been introduced by some step's `hypothesesGenerated[]`, (2h) commitment coherence — `bestExplanation.id` must NOT appear in any step's `hypothesesEliminated[]` (generating then eliminating then committing is internally inconsistent), (2i) no duplicate generation — each hypothesis id may appear in at most one step's `hypothesesGenerated[]` across the chain, (2j) no re-generation after elimination — once eliminated, a hypothesis may not be re-generated in a later step (blocks silent rehabilitation). Total invariant checks grew from 16 to 16 (the existing abductive slot was extended in place — the sample and captured both still count as one pass each for the abductive mode). Rules 2h/2i/2j were added during the review-team fix pass in response to findings from the architect and adversary reviewers.
- **`docs/SKILL-INVARIANTS.md`** — the "Referential integrity rules (v0.5.2+)" section now has 10 additional rows for `abductive`, completing the core-triad coverage of schema-unenforceable cross-field semantic rules.
- **`test/samples/abductive-valid.json`** — extended with a 3-step iterative chain over the existing Tuesday 503 scenario. Step 1 (`retroduction`) generates h1, h2, h3; step 2 (`hypothetico-deductive`) eliminates h3 after the cache-hit-rate prediction is falsified; step 3 (`ibe`) compares h1 vs h2 using the database CPU evidence and commits to h1. The sample's method labels were corrected during the review-team fix pass — the initial sample labeled step 1 as `ibe` (wrong — nothing is inferred yet, the move is retroductive generation) and step 3 as `eliminative` (wrong — the move is IBE commitment, not elimination of a final alternative).
- **`test/smoke/prompts.json`** — the abductive smoke prompt was rewritten to be both semantically distinct from the sample (an iOS-only mobile crash spike after a release + CDN migration + Firebase config update, NOT the Tuesday 503 dashboard scenario) AND neutral in its framing — the prompt ends with "What is the best explanation?" and does NOT instruct Claude to produce stepwise output. Verified: real `claude -p` organically produced a 4-step iterative abduction — step 1 (`retroduction`) generated 4 candidate hypotheses covering one per change event plus an interaction-effect hypothesis, step 2 (`eliminative`) ruled out the interaction hypothesis by parsimony, step 3 (`hypothetico-deductive`) applied a "sustained not transient" constraint to reorder the survivors, step 4 (`ibe`) committed to h1 while eliminating h3. Claude generated more hypotheses than the 3-hypothesis sample (4 > 3) and applied a genuinely different elimination pattern, satisfying all 10 enforced invariants.

### Internal

- The v0.5.4 release cycle dispatched a 5-specialist Recursive Language Model review team (`.rlm_v054_review.py`, gitignored via the `.rlm_*` pattern established in v0.5.2). The review caught three material issues that were fixed before shipping:
  1. **Chain closure had a semantic gap** (architect + adversary). Rule 2g required that `bestExplanation.id` be introduced by some step's `hypothesesGenerated[]`, but did not require that it was NOT subsequently eliminated. A thought could generate h1 in step 1, eliminate h1 in step 2, and still commit to h1 in `bestExplanation` while passing all invariants. Fixed by adding rule 2h (commitment coherence — no committed hypothesis in any `hypothesesEliminated[]`). The fix was generalized further by adding rules 2i (no duplicate generation across the chain) and 2j (no re-generation after elimination) to close two adjacent rehabilitation loopholes.
  2. **Sample method labels were philosophically incorrect** (domain reviewer). The initial sample labeled step 1 as `ibe` — but IBE is the *commitment* move, not the *generation* move. The domain reviewer pointed out that retroduction (reasoning backward from observed effect to possible cause) is the right classical term for hypothesis generation, and that IBE belongs on the commitment step. The sample was relabeled: step 1 is now `retroduction`, step 3 is now `ibe`. The SKILL.md vocabulary block was expanded to explicitly tell Claude which method label belongs on which kind of step, with a warning not to use `ibe` for a step where nothing has been inferred yet.
  3. **The `abductionMethod` taxonomy conflated process types with reasoning directions** (domain reviewer). The initial SKILL.md listed "retroductive chains" as one of 4 multi-step process types alongside progressive generation, eliminative narrowing, and hypothetico-deductive cycles — but retroduction is not a process shape; it is the classical name for backward-from-effect inference and is the label for generation steps in any multi-step process. The taxonomy was reduced from 4 cases to 3 process types, with retroduction moved into the `abductionMethod` vocabulary block as the label to use on generation steps.
- **Spike methodology honest note.** The adversary reviewer flagged that v0.5.4's spike validation is methodologically weaker than v0.5.3's: the smoke test was run after the sample and SKILL.md were updated to show the new field, so Claude's organic 4-step output cannot be fully distinguished from sample pattern-matching. The evidence remains strong — Claude produced 4 hypotheses when the sample has 3, used a semantically different scenario (iOS crashes vs Tuesday 503 dashboards), applied a genuinely different elimination pattern (h4 eliminated by parsimony in step 2, h3 eliminated in step 4 alongside the commitment), and did all of this on a neutral prompt that contained no stepwise instructions. But the cleanest methodology would have run the smoke test with a dummy sample before updating the canonical one. Future spike releases should consider that stronger test.

## [0.5.3] - 2026-04-14

Schema enrichment release. Second of three planned core-triad enrichments: the `inductive` mode gains an optional `inductionSteps[]` field for progressive-refinement, Mill's methods, and hierarchical generalization chains. Backward-compatible — atomic single-inference inductions continue to validate unchanged. The release also extends `test_skill_invariants.py` with a new `check_inductive()` enforcing 5 referential-integrity rules parallel to `check_deductive()`.

### Added

- **`test/schemas/inductive.json` — optional `inductionSteps[]` array.** Added under a new top-level property (not in `required`). Each step object has 3 required fields (`stepNumber: integer ≥ 1`, `intermediateGeneralization: string minLength 1`, `inductionMethod: string minLength 1`) and 2 optional array fields (`observationsUsed: integer[≥0]`, `stepsUsed: integer[≥1]`). The per-step type label is named `inductionMethod` (not `inductionType`) to avoid confusion with the mode name itself; the parallel deductive field is `inferenceRule`, and `Method`/`Rule` are both unambiguous suffixes where `Type` would not be. Free-text in v0.5.3; a future release may tighten to an enum.
- **`reference/output-formats/inductive.md`** — rewritten to document the new field shape, the required-vs-optional split, two worked examples (atomic 3-observation deploy-timeout and multi-step 4-observation A/B-test Bayesian progressive refinement), and the 5 referential-integrity invariants the field must follow. Expanded the 3-case taxonomy to 5 natural multi-step cases: progressive Bayesian refinement, Mill's methods of causal induction, hierarchical generalization, eliminative induction, and analogical reasoning chains.
- **`reference/visual-grammar/inductive.md`** — rewritten with conditional rendering dispatch: if `inductionSteps` is absent or empty, render the classic 3-tier funnel (observations → pattern → generalization); if populated, render a multi-tier flow (observations → per-step neutral-gray intermediate nodes → green final generalization). Mermaid and DOT templates for both cases plus the full A/B-test worked example.
- **`skills/think-core/SKILL.md`** — the inductive section gained a new "Multi-step inductions — when to use `inductionSteps[]`" subsection with the 5-case taxonomy, a new step #3 in "How to Reason Inductively" ("decide if the induction is atomic or multi-step"), a second Quick Template covering the multi-step shape, a second Worked Example (the A/B-test Bayesian progressive refinement), an "authorship guidance" block covering the non-enforced "meaningfully different intermediate generalizations" and "honest `inductionMethod` labels" rules, and an expanded verification checklist reflecting the 5 enforced invariants.
- **`test/test_skill_invariants.py::check_inductive()`** — new invariant check enforcing 5 rules that JSON Schema cannot express: (1) step numbers must be sequential 1..N with no gaps or duplicates, (2) `stepsUsed[]` may only contain integers in `[1, stepNumber-1]` — no forward references, no self-references, no references to non-existent step 0, (3) `observationsUsed[]` indices must be valid 0-indexed positions into the top-level `observations[]` array, (4) every step must derive from something (at least one of `observationsUsed[]` / `stepsUsed[]` must be non-empty), (5) the final step's `intermediateGeneralization` must match the top-level `generalization` after whitespace/trailing-period normalization. Wired into the `CHECKS` dispatch dict. Total invariant checks grew from 14 to 16 (both the sample and the v0.5.3 captured smoke output pass).
- **`docs/SKILL-INVARIANTS.md`** — the "Referential integrity rules (v0.5.2+)" section now has 5 additional rows for `inductive` mirroring the 5 `deductive` rows, pointing to `check_inductive()` as the enforcement mechanism.
- **`test/samples/inductive-valid.json`** — rewritten as a 4-observation 4-step progressive-Bayesian-refinement chain (A/B test evolution: weeks 1-2 show positive signal, week 3 weakens, week 4 reverses). This scenario is genuinely stepwise rather than an artificial decomposition of one holistic inference — each step represents the reasoner's belief at a distinct point in time given only the data available at that point. The old 3-observation deploy-timeout sample is preserved conceptually as the atomic example in `reference/output-formats/inductive.md`.
- **`test/smoke/prompts.json`** — the inductive smoke prompt was rewritten to be both semantically distinct from the sample (checkout failures across 5 failures + 2 successes with varying browsers, devices, payment methods, amounts, and dates) AND neutral in its framing — the prompt does NOT instruct Claude to "walk through step by step" or "show intermediate generalizations". This is a deliberately stronger test than v0.5.2's deductive spike: it measures whether Claude *organically* chooses to populate `inductionSteps[]` when the field is useful, rather than responding to an explicit instruction. Verified: real `claude -p` produced a 4-step chain (method of agreement → two applications of method of difference → synthesis) on the neutral prompt, with all 5 invariants satisfied.

### Fixed

- None (no bugs fixed in the existing code; this release is purely additive).

### Internal

- The "meaningfully different intermediate generalizations" rule is explicitly documented as **authorship guidance, not an enforced invariant**, in both `skills/think-core/SKILL.md` and `reference/output-formats/inductive.md`. Previously this was stated as a "must" rule in the SKILL.md prose, creating a doc/code mismatch because `check_inductive()` does not (and cannot cleanly) enforce semantic "meaningful difference" between strings. The wording was softened to "should be meaningfully different — not a restatement" and marked as a quality signal ("a chain of near-identical intermediate generalizations is a sign the multi-step shape isn't earning its keep"). Same treatment applies to the "honest `inductionMethod` labels" rule — it is authorship guidance, not a mechanical check.
- The v0.5.3 release cycle dispatched a 5-specialist Recursive Language Model review team (`.rlm_v053_review.py` — gitignored via `.rlm_*` pattern added in v0.5.2). The review caught two material issues that were fixed before shipping: (1) the first smoke prompt contained "Walk through your inductive reasoning step by step", which was methodologically weaker than the deductive spike because it explicitly instructed stepwise output — resolved by rewriting the prompt as a neutral "What's the generalization and how confident are you?"; (2) the first sample was an artificial 3-step decomposition of what is really a single Mill's-method-of-difference inference — resolved by replacing it with the A/B test progressive-Bayesian scenario, which is genuinely stepwise because each step represents a historically distinct belief revised as new weekly data arrived. The adversary's H1 concern was resolved empirically by re-running the smoke test with the neutral prompt: Claude still chose to populate `inductionSteps[]`, with 4 steps instead of the 3 produced under the leading prompt.

## [0.5.2] - 2026-04-12

Schema enrichment release. Introduces the first of three planned core-triad enrichments: an optional `derivationSteps[]` field on the `deductive` mode for multi-step proof chains. Backward-compatible — atomic single-jump deductions continue to validate unchanged. Also promotes `test/test_skill_invariants.py` from "unreleased" to its first shipped release, extending it with a new `check_deductive()` enforcing the 5 schema-unenforceable rules the new field introduces.

### Added

- **`test/schemas/deductive.json` — optional `derivationSteps[]` array.** Added under a new top-level property (not in `required`, so thoughts without it validate as before). Each step object has 3 required fields (`stepNumber: integer ≥ 1`, `intermediateConclusion: string minLength 1`, `inferenceRule: string minLength 1`) and 2 optional array fields (`premisesUsed: integer[≥0]`, `stepsUsed: integer[≥1]`). `inferenceRule` is free-text in v0.5.2 to let authors capture non-classical or informal rules; a future release may tighten to an enum once the usage patterns are observed across samples. Nested step object has `additionalProperties: false` so typos in the per-step field names are caught — the top-level `additionalProperties: false` policy is preserved.
- **`reference/output-formats/deductive.md`** — rewritten to document the new field shape, the required-vs-optional split, two worked examples (atomic single-jump "Alice-admin" example and multi-step "Request R audit-trail" example), and the 5 referential-integrity invariants the field must follow (sequential numbers, no forward refs, valid premise indices, non-empty inputs per step, final-step closure).
- **`reference/visual-grammar/deductive.md`** — rewritten with conditional rendering dispatch: if `derivationSteps` is absent or empty, render the classic 3-tier pyramid (premises → logical connective → conclusion); if populated, render a multi-tier flow (premises → per-step intermediate nodes → final conclusion) where intermediate step nodes are always neutral gray and only the final conclusion carries the validity/soundness color. Mermaid and DOT templates for both cases plus the full worked example.
- **`skills/think-core/SKILL.md`** — the deductive section gained a new "Multi-step derivations — when to use `derivationSteps[]`" subsection, a new step #3 in "How to Reason Deductively" ("decide if the derivation is atomic or multi-step"), a second Quick Template covering the multi-step shape, a second Worked Example (the Request-R audit-trail chain), and an expanded verification checklist reflecting the 5 new invariants (including the enforced "final step must close the chain" rule).
- **`test/test_skill_invariants.py::check_deductive()`** — new invariant check enforcing 5 rules that JSON Schema cannot express: (1) step numbers must be sequential 1..N with no gaps or duplicates, (2) `stepsUsed[]` may only contain integers in `[1, stepNumber-1]` — no forward references, no self-references, no references to non-existent steps, (3) `premisesUsed[]` indices must be valid 0-indexed positions into the top-level `premises[]` array, (4) every step must derive from something (at least one of `premisesUsed[]` / `stepsUsed[]` must be non-empty — a free-standing assertion isn't a derivation), (5) the final step's `intermediateConclusion` must match the top-level `conclusion` after whitespace/trailing-period normalization. Wired into the `CHECKS` dispatch dict so the existing test harness picks it up automatically. Total invariant checks grew from 12 to 14 (both the sample and the v0.5.2 captured smoke output pass).
- **`test/test_skill_invariants.py`** — new fast test enforcing the 6 per-mode semantic rules catalogued in `docs/SKILL-INVARIANTS.md` that JSON Schema cannot express (first shipped in this release; originally developed during the v0.5.1 cycle but not cut as its own release). Complements `test/harness.py` with a layer that catches structural-valid-but-semantically-broken Claude output. Runs against both `test/samples/<mode>-valid.json` and `test/smoke/captured/<mode>-parsed.json` when present. Checks: `abductive` requires ≥2 hypotheses with non-equal scores; `counterfactual` requires exactly one `isIntervention=True` condition per scenario; `historical` requires asserted patterns to have ≥2 distinct episodes; `modal` requires exactly one world with `isActual=True`; `firstprinciples` enforces referential integrity of `conclusion.derivationChain` and `conclusion.certainty ≤ min(step.confidence in chain)`; `bayesian` requires `posterior.calculation` to contain real arithmetic (≥2 numbers, at least one operator). Fast test count: 9 → 10. With the new `check_deductive()`, the test now covers 7 modes.
- **`docs/SKILL-INVARIANTS.md`** — new "Referential integrity rules (v0.5.2+)" section with 5 rows documenting the deductive rules, pointing to `test/test_skill_invariants.py::check_deductive()` as the enforcement mechanism.
- **`test/samples/deductive-valid.json`** — rewritten as a worked 3-premise 2-step chain exercising the new field (the "Request R audit-trail → alert" example used in all documentation). Old hand-crafted single-jump sample preserved conceptually in the "atomic" example in `output-formats/deductive.md` for comparison.
- **`test/smoke/prompts.json`** — the deductive smoke prompt was rewritten to a deliberately different multi-step problem from the sample (the "published blog post / author / registered user" chain). Keeping the prompt and sample structurally parallel but semantically distinct is the methodological guarantee that smoke runs test *generalization*, not sample pattern-matching. Verified: real `claude -p` populated `derivationSteps[]` correctly for the new example with all 5 invariants satisfied.

### Fixed

- **`test/samples/firstprinciples-valid.json`** — dropped `conclusion.certainty` from `0.92` to `0.88` to match the minimum step confidence in the derivation chain. The previous value violated the "conclusion cannot be more certain than its weakest derivation step" invariant, caught on the first run of `test_skill_invariants.py`. Exactly the class of semantic bug the new test was designed to catch.

### Internal

- **`.gitignore`** — added `.rlm_*.py` and `.rlm_*.json` patterns so the 5-specialist Recursive Language Model review artifacts used during the v0.5.2 release cycle (and any future cycle) stay local-only.

## [0.5.1] - 2026-04-13

Patch release fixing a subprocess cleanup bug in the parallel smoke runner introduced by v0.5.0's T6 refactor. No functional changes; single-file targeted fix.

### Fixed

- **`test/smoke/run-all-modes.py`** — prevents orphaned `claude -p` grandchildren when the smoke runner is interrupted. The v0.5.0 refactor from sequential `subprocess.run` to parallel `ThreadPoolExecutor` with `subprocess.run(timeout=N)` inside each worker introduced a cleanup gap: `ThreadPoolExecutor.__exit__` waits for all futures to complete before the Python interpreter exits, so a killed bash wrapper would leave the main Python process stuck on worker threads that were blocked on their own `subprocess.run` calls, which in turn held live `claude -p` grandchildren. The fix replaces each `subprocess.run` with `subprocess.Popen + communicate()`, registers each child in a module-level `_active_procs` set (thread-safe via a `threading.Lock`), and installs `atexit` + `SIGINT` / `SIGTERM` handlers that walk the set and force-kill any still-running children before the interpreter exits. Signal exit uses code 128 + signum (130 for SIGINT, 143 for SIGTERM) per the POSIX convention. Verified: single-mode smoke run exits cleanly with zero orphan `python.exe` processes created, timeout path still works, `SMOKE_WORKERS=1` sequential escape hatch preserved, deterministic alphabetical summary ordering unchanged.

### Internal

- Fixed a pre-existing `SyntaxWarning` on line 147 of `test/smoke/run-all-modes.py` — the `repair_lone_backslashes` docstring contained `"\ "` (backslash-space) as a literal example, which Python 3.12+ flags as an invalid escape sequence. Added an `r` prefix to make it a raw string literal.

## [0.5.0] - 2026-04-13

Format expansion + quality infrastructure release. Grows the effective output format count from 11 to 13 (2 new mode-agnostic grammars), adds cross-file version consistency and MODE_DISPLAY_NAMES sync tests, parallelizes the smoke test runner, and fixes two pre-existing version-drift bugs caught by the new consistency test. No new reasoning modes — the 34 canonical modes are unchanged.

### Added

- **`reference/visual-grammar/formats/latex-math.md`** — new mode-agnostic AMS-math LaTeX format grammar, distinct from the canonical `tikz` format (which is for TikZ vector diagrams). Provides clean math rendering for the 7 math-heavy modes (mathematics, physics, computability, formallogic, firstprinciples, bayesian, evidential) with step-by-step arithmetic preservation, `\tag{<field-path>}` labels for equation traceability, and `\intertext{...}` for prose between equation blocks. Includes a complete bayesian worked example that compiles with `pdflatex` + `amsmath` + `amssymb`.
- **`reference/visual-grammar/formats/csv.md`** — new mode-agnostic RFC 4180 CSV format grammar with per-mode flattening rules covering all 34 canonical modes (9 Excellent, 17 Moderate, 8 Fallback tier). Provides tabular export for the majority of modes whose schemas contain wide array-of-objects fields (e.g., `bayesian.evidence`, `gametheory.payoffMatrix.entries`, `optimization.alternatives`, `engineering.tradeStudy.alternatives`). Multi-table support via `# table: <name>` comment lines; fallback to 2-column `field,value` representation for prose-primary modes.
- **`test/test_version_consistency.py`** — new cross-file version coherence check that reads the authoritative version from `.claude-plugin/plugin.json` and verifies every version mention in the repo agrees (CHANGELOG's first real release heading, README.md Status section, `skills/think/SKILL.md` Available Modes heading, `CLAUDE.md` intro). Prevents the latent-bug class where `plugin.json` can drift from the version mentioned in docs (the v0.4.1 plugin.json-stuck-at-0.1.0 story).
- **`MODE_DISPLAY_NAMES` sync check** added to `test/test_artifact_consistency.py`. Parses the dict from `scripts/render-html-dashboard.py` via `ast` (no import, no side effects) and verifies its keys match the authoritative schemas set from `test/schemas/*.json`. This was the hidden 10th sync location in the 34-mode invariant — drift previously surfaced only as a wrong dashboard title.
- **`examples/personal-command-alias/think-render.md`** — optional personal command alias parallel to the existing `think.md`. Lets users who install the alias type `/think-render <format>` instead of `/deepthinking-plugin:think-render <format>`. Description includes all 15 accepted format values (13 grammar-based + svg + png).
- **`docs/ROADMAP-FUTURE-MODES-AND-FORMATS.md`** — forward-looking inventory of reasoning mode and output format candidates with tier assignments (Strong / Plausible / Rejected) and rationale. 0 Tier 1 modes (the 34 canonical modes are feature-complete); 1 Tier 2 mode (`decisionanalysis`, held pending a design spike); Tier 3 documents rejected candidates with rationale. Includes a "Strategic gaps" section covering mode-count ceiling, smoke test scalability, mode deprecation path, telemetry gap, and hybrid mode evolution.
- **`docs/SKILL-INVARIANTS.md`** — catalog of per-mode validation rules that JSON Schema cannot express: 4 schema-unenforceable cardinality rules (`counterfactual` exactly-one-isIntervention, `modal` exactly-one-isActual, `abductive` ≥2 distinct hypotheses, `historical` ≥2 episodes per pattern), 3 already enforced in schemas (`gametheory`, `synthesis`, `engineering`), and 2 cross-field semantic rules (`firstprinciples` confidence chain, `bayesian` arithmetic display). When editing a SKILL.md file, preserve any "must" / "exactly one" / "at least N" language.
- **`docs/PLAN-v0.5.0.md`** — agent-driven implementation plan for this release. 16 tasks organized in 3 dependency-ordered waves with self-contained subagent briefs. Preserved as a template for future release planning.

### Changed

- **`test/smoke/run-all-modes.py`** — refactored from sequential to parallel execution using `concurrent.futures.ThreadPoolExecutor` with a configurable worker count (`SMOKE_WORKERS` env var, default 4, max 8). Preserves all existing behavior: per-mode timeouts, JSON repair attribution via `repair_lone_backslashes`, stderr capture to `captured/<mode>-stderr.txt`, single-mode mode (`SMOKE_MODE=bayesian`), sequential escape hatch (`SMOKE_WORKERS=1`), and deterministic alphabetical summary ordering. Expected wall-clock: 30–60 min → 10–15 min with 4 workers. Extracted `run_single_mode()` as a pure function for reuse across the executor and single-mode paths.
- **`test/test_format_grammars.py`** — `EXPECTED_FORMATS` grew from 9 to 11, adding `csv` and `latex-math` in alphabetical order.
- **`commands/think-render.md`** — format list expanded from 13 to 15 accepted values (adds `latex-math`, `csv`).
- **`agents/visual-exporter.md`** — frontmatter description updated from "Supports 11 formats" to "Supports 13 formats"; body "Your Inputs" section and direct-emit format list in step 6 both updated.
- **`README.md`** — the "All 11 export formats" table heading becomes "All 13 export formats (v0.5.0+)"; two new table rows for `latex-math` and `csv`; Status-line mention of "11 output formats" → "13 output formats".
- **`CLAUDE.md`** — expanded with: the 34-mode invariant promoted from 9 places to 10 places (`MODE_DISPLAY_NAMES` dict is the 10th sync location, with `grep -n` as the stable locator); a new design principle "Some validation rules live in SKILL.md prose, not in JSON Schema" (full per-mode catalog in `docs/SKILL-INVARIANTS.md`); a new "Out of scope" section documenting deliberate non-goals (no persistent session state, no Node.js runtime, no hard `dot`/`mmdc` dependency, no third-party test framework); a new "Skills vs slash commands" architectural section clarifying that skills are auto-invoked while slash commands are user-typed; a new "Release sequence (don't reorder)" section under Publishing with a warning that hardcoded equality assertions in tests are a smell.

### Fixed

- **`README.md`** and **`skills/think/SKILL.md`** — updated two stale `v0.4.0` references to `v0.4.1`. These were pre-existing version-drift bugs from the v0.4.1 release cycle that were never caught. The new `test_version_consistency.py` flagged them on its first run, which is exactly the class of bug it was designed to catch.

## [0.4.1] - 2026-04-12

### Security
- **Pinned Mermaid CDN to an exact version** (`@11.4.1`) with `crossorigin="anonymous"`. Previously `@11` was a floating major-version tag — a compromised jsdelivr tag would execute JS in every historical dashboard. Now the CDN URL is frozen.
- **Switched Mermaid `securityLevel` from `loose` to `strict`**. Disables click-handlers and HTML embedding in labels — hardens against prompt-injected malicious diagram source.
- **HTML-escape all user-supplied content** in `render-html-dashboard.py`, including the Mermaid source (was previously interpolated raw). The `{{MODE}}` token is now injected via `json.dumps` into a JS string literal instead of `html.escape` into HTML context, which is the correct escape function for JS contexts.
- **Path validation** on `render-html-dashboard.py`'s `--output` and `--thought` flags — refuses paths that escape the current working directory or temp dir.
- **Mode slug sanitization** — validates mode against `^[a-z][a-z0-9_-]{0,40}$` before substituting into the HTML template and download filename.
- **Template token audit** — renderer now scans for unsubstituted `{{TOKEN}}` patterns after substitution and fails loudly if any remain.
- **Mermaid `parseError` callback** + `window.onerror` handler in the dashboard template — replaces the fragile substring-match error surfacing; also handles the case where the CDN fails to load (offline, blocked, or unreachable).
- **`copyJson()` fallback** for `file://` origins where `navigator.clipboard` is undefined — uses Selection API to let the user Ctrl+C the JSON.

### Fixed
- **Optimization worked example in `skills/think-strategic/SKILL.md`** was internally contradictory: structured fields showed `{a:10, b:12, value:260}` but the self-correcting `note` said the optimal was `{a:0, b:20, value:300}`. Rewritten to show the correct optimum directly.
- **`scripts/render-diagram.py` exit codes**: previously returned 0 both when a diagram was rendered AND when the binary was missing. Now uses distinct codes (0 success, 2 with `--allow-skip` for degradation, 127 for missing-binary hard fail, 124 for timeout). Callers can now distinguish "file exists" from "file not written".
- **`scripts/render-diagram.py` timeouts**: `dot` and `mmdc` subprocess calls had no timeout. Added a 60-second default. Both are wrapped in `try/except subprocess.TimeoutExpired`.
- **`test/smoke/run-all-modes.py` silent exception**: narrowed `except Exception: pass` on stdout reconfigure to `(AttributeError, io.UnsupportedOperation, ValueError)` with an explicit warning to stderr.
- **Repair attribution**: when `repair_lone_backslashes` recovers from a LaTeX-in-string JSON escape bug in Claude's output, the runner now prints `PASS (with backslash repair — JSON escape bug in model output)` and totals the repaired count in the summary. No more silent repairs.
- **`test/smoke/run-all-modes.py` prompt escaping**: prompts with literal `"` characters are now escaped before interpolation into the `/think` argument string. Also captures stderr from the subprocess alongside stdout for debugging.
- **`test/harness.py` error reporting**: uses `Draft7Validator.iter_errors` to report ALL validation failures per sample (capped at 5 for readability) with JSON path context, instead of just the first. Also catches `FileNotFoundError`, `JSONDecodeError`, `UnicodeDecodeError`, and `SchemaError` per-sample instead of crashing the whole run.
- **`test_plugin_json.py` version assertion**: was hardcoded to `"0.1.0"` — now uses a semver regex so version bumps don't break the test.
- **`test_skill_frontmatter.py` count assertion**: was hardcoded to `== 13` — now uses a sanity range (`1 <= n <= 100`) so adding a category skill doesn't falsely fail the test.
- **CRLF tolerance** in `test/visual/validate-{mermaid,dot}.py`: normalize `\r\n` → `\n` before regex-extracting code blocks.

### Changed
- **`test/visual/validate-{mermaid,dot}.py`**: missing code blocks are now **FAIL**, not **SKIP**. An explicit `ALLOWED_NO_*` allowlist (empty by default) covers the rare legitimate case. This catches the exact regression the validators exist to catch — a grammar file silently losing its code fence.
- **README.md Status section**: was stuck at "v0.1.0 Prototype, 3 modes" — now reflects v0.4.0 / 34 modes / smoke-tested.
- **`skills/think/SKILL.md` Available Modes heading**: was "(v0.2.0)" — now "(v0.4.0)".
- **`commands/think-render.md`**: was listing 7 formats in the workflow body; now lists all 13 consistently with the frontmatter and README.
- **`examples/personal-command-alias/think.md`**: frontmatter description was stale (claimed 3 modes). Updated to "any of the 34 available modes".
- **`agents/visual-exporter.md`**: removed hardcoded "All 34 modes are covered" — now says "Every mode has a grammar file… fall back to generic conventions if missing" so adding a mode doesn't silently drift the agent's prompt.

### Added
- **`test/test_artifact_consistency.py`** — enforces set-equality across `test/schemas/`, `test/samples/`, `reference/visual-grammar/`, `reference/output-formats/`, and `test/smoke/prompts.json`. Adding a new mode without all artifacts now fails immediately with a clear diff.
- **`test/test_format_grammars.py`** — validates the 9 format grammar files have the expected structure (required sections, minimum byte size). Previously this directory had zero test coverage.
- **`test/samples/{bayesian,inductive,deductive,abductive,causal}-invalid.json`** — 5 new negative sample fixtures exercising schema-validation failure modes (out-of-range probability, empty required array, wrong const mode, missing required field). Previously only 1 negative sample existed (`sequential-invalid.json`).
- **`test/smoke/router-prompts.json`** + **`test/smoke/run-router-tests.py`** — 12 test prompts for the `/think "<problem>"` auto-recommend branch with a list of acceptable modes per prompt. Previously this code path had zero test coverage.
- **`ARCHITECTURE.md`** — contributor-facing map of the three layers (reasoning skills, format grammars, runtime helpers), invocation flow diagrams, step-by-step "adding a new mode" and "adding a new format" recipes, and the five design principles.

### Verified
- **118 automated checks pass**: 1 plugin.json, 13 SKILL.md frontmatters, 34 mode-set consistency, 9 format grammars, 40 schema validations (34 valid + 6 invalid), 34 Mermaid grammars, 34 DOT grammars, 1 dashboard integration.
- Dashboard renders without the `loose` security level; no template tokens leak through; Mermaid CDN is pinned.

## [0.4.0] - 2026-04-12

### Added
- **Automated end-to-end smoke test runner** at `test/smoke/run-all-modes.py` that invokes headless `claude -p` for each of the 34 modes, captures the JSON block from Claude's response, and validates it against the mode's schema. Configurable timeout and single-mode re-run via `SMOKE_MODE=<mode>` env var.
- **34 mode test prompts** at `test/smoke/prompts.json` — one realistic scenario per mode
- **9 format grammar files** at `reference/visual-grammar/formats/`: `ascii.md`, `json.md`, `markdown.md`, `graphml.md`, `html.md`, `tikz.md`, `modelica.md`, `uml.md`, `dashboard.md`. These describe how to encode ANY mode's thought into the format using the shared conventions + per-mode semantic grammar
- **Interactive HTML dashboard template** at `reference/html-dashboard-template.html` — single-file standalone HTML with Mermaid CDN client-side rendering, JSON explorer, dark-mode support, and export buttons (copy/download/print)
- **HTML dashboard renderer** at `scripts/render-html-dashboard.py` — injects thought JSON + Mermaid source into the template, writes standalone HTML file. Pure stdlib Python.
- **Dashboard integration test** at `test/visual/test-dashboard.py` verifying end-to-end render

### Changed
- **`agents/visual-exporter.md`**: updated to route all 11 output formats (mermaid, dot, ascii, json, markdown, graphml, html, tikz, uml, modelica, dashboard) by consulting both the per-mode grammar and the format grammar
- **`commands/think-render.md`**: expanded `argument-hint` and format list to accept all 11 formats
- **All 34 JSON schemas** relaxed in two ways based on real smoke-test findings:
  - Nested detail objects (depth ≥ 1) now allow additional properties — the top-level thought object is still strict, catching typos, but nested structures accept the richer detail Claude naturally produces
  - Optional scalar fields (non-required string/number/integer/boolean) now accept `null` — Claude commonly emits explicit `null` for absent optionals
- **`test/schemas/hybrid.json`**: `primaryMode` enum expanded from 4 to all 34 modes; `thoughtType` relaxed from a restrictive 22-value enum to any non-empty string

### Verified
- **Smoke tests**: all 34 modes captured and validated end-to-end via `python test/smoke/run-all-modes.py` (headless `claude -p` → JSON extraction → schema validation). Re-runnable at any time.
- **Harness tests**: all 35 hand-crafted schema tests still pass
- **Frontmatter**: all 13 skills still have valid YAML
- **Dashboard integration**: single-file HTML renders successfully with all placeholders substituted
- **Visual grammars**: all 34 per-mode grammars still have valid Mermaid + DOT blocks

## [0.3.0] - 2026-04-12

### Added
- **Visual export for all 34 modes** via the new `/think-render [format]` slash command at `commands/think-render.md`
- `agents/visual-exporter.md` — subagent that converts structured thoughts to diagram source by reading per-mode visual grammar
- `reference/visual-grammar.md` — shared conventions (node shapes, color palette, edge semantics, label rules, layout hints) with worked Mermaid and DOT examples
- `reference/visual-grammar/*.md` — **34 per-mode grammar files**, each with a Node Structure section, Edge Semantics, Mermaid template, DOT template, and a worked example using the actual field values from the corresponding reference/output-formats sample
- `scripts/render-diagram.py` — wraps `graphviz` (DOT → SVG/PNG) and `@mermaid-js/mermaid-cli` (Mermaid → SVG/PNG). **Gracefully degrades** to printing source on stdout with install hint when binaries aren't available
- `test/visual/validate-mermaid.py` — syntactic validator that checks every grammar file's Mermaid blocks parse
- `test/visual/validate-dot.py` — syntactic validator that checks every grammar file's DOT blocks parse
- README section documenting `/think-render` usage and optional external binary installation

### Verified
- **68 visual checks pass** (34 grammar files × 2 formats): every mode has ≥2 valid Mermaid blocks and ≥2 valid DOT blocks (template + worked example)
- `render-diagram.py` runs without crashing when binaries are missing (graceful degradation confirmed)
- All 35 schema validations still pass, all 13 SKILL.md frontmatters still valid

## [0.2.0] - 2026-04-12

### Added
- **31 new reasoning modes** across 10 new category skills, bringing total to 34 modes:
  - `think-mathematics`: Mathematics, Physics, Computability
  - `think-temporal`: Temporal, Historical
  - `think-probabilistic`: Bayesian, Evidential
  - `think-causal`: Causal, Counterfactual
  - `think-strategic`: GameTheory, Optimization, Constraint
  - `think-analytical`: Analogical, FirstPrinciples, MetaReasoning, Cryptanalytic
  - `think-scientific`: ScientificMethod, SystemsThinking, FormalLogic
  - `think-engineering`: Engineering, Algorithmic
  - `think-academic`: Synthesis, Argumentation, Critique, Analysis
  - `think-advanced`: Recursive, Modal, Stochastic
- Expanded `think-core` with Abductive reasoning
- Expanded `think-standard` with Shannon and Hybrid reasoning
- 31 new JSON Schemas in `test/schemas/` (all with `additionalProperties: false` and const mode values)
- 31 new sample valid thoughts in `test/samples/`
- 31 new per-mode reference docs in `reference/output-formats/`

### Changed
- `skills/think/SKILL.md`: Available Modes table now lists all 34 modes with category-skill mappings
- `skills/think/mode-index.md`: 12-branch decision tree covering all 34 modes, updated example mappings
- `reference/taxonomy.md`: All 34 modes graduated from "Future" to v0.2.0; "Future Modes" section removed
- `commands/think.md`: Complete mode list grouped by category; 34-row Schema References table; "Unavailable modes" section removed
- `test/harness.py`: **Auto-discovery** of samples replaces the hardcoded SAMPLES list — drop any `<mode>-valid.json` into `test/samples/` and it's tested automatically
- `test/test_skill_frontmatter.py`: now expects 13 SKILL.md files (1 router + 12 categories)

### Verified
- Automated: **35 schema validations pass** (34 valid + 1 invalid), all 13 skills have valid frontmatter, plugin.json manifest validates
- Manual smoke test coverage expansion (v0.2.x task): v0.1.0 already verified sequential/inductive/deductive/auto end-to-end in a real Claude Code session

## [0.1.0] - 2026-04-12

### Added
- Initial plugin scaffold with `.claude-plugin/plugin.json` manifest
- `/think` slash command at `commands/think.md` — the user-facing entry point
- Router skill `think` with auto-recommendation for the 3 prototype modes
- Category skill `think-standard` with Sequential mode
- Category skill `think-core` with Inductive and Deductive modes
- Reference output-format files for Sequential, Inductive, Deductive
- `argument-hint` and `$ARGUMENTS` placeholders in all SKILLs for proper argument passing
- Python test harness (`test/harness.py`) with JSON Schema validation
- Sample thoughts (valid and invalid) for smoke testing
- README and installation instructions

### Verified end-to-end (2026-04-12)
- `/think sequential "..."` → 6 schema-valid thoughts with dependency tracking
- `/think inductive "..."` → schema-valid with calibrated confidence (0.8) and counterexample reasoning
- `/think deductive "..."` → schema-valid with FOL notation and operational soundness caveats
- `/think "..."` (auto-recommend) → correctly defers to sequential when observations are referenced but not supplied, with explicit mode-handoff plan in thought 3

### Install paths (documented in README)
- Canonical plugin command: `/deepthinking-plugin:think [mode] "<problem>"` (available after installing the plugin via `--plugin-dir` or by copying to `~/.claude/plugins/`)
- Optional shorter alias: personal command at `~/.claude/commands/think.md` (provided in `examples/personal-command-alias/`) gives the bare `/think` form
