# Implementation Plan — v0.5.0 Format Expansion + Quality Infrastructure

> Agent-driven execution plan derived from the prioritized items in `docs/ROADMAP-FUTURE-MODES-AND-FORMATS.md`. Each task is a self-contained subagent brief that can be dispatched via the `superpowers:subagent-driven-development` pattern with no conversation context.

## Executive summary

v0.5.0 is a **format + quality** release, not a modes release. After the roadmap's three review rounds concluded that no new reasoning modes merit Tier 1 status, the credible v0.5.0 scope is:

- **2 new format grammars** (`latex-math`, `csv`) — growing the effective format count from 11 to 13
- **3 quality-infrastructure improvements** (version consistency test, `MODE_DISPLAY_NAMES` automated sync check, smoke test parallelization)
- **1 ergonomic fix** (`think-render` personal command alias)

No source code changes to schemas, skills, or the router. The 34-mode invariant is untouched. The plugin ships with **120 automated checks** instead of 118 (two new test files contribute one check each: `test_version_consistency.py` contributes 1, and the new `MODE_DISPLAY_NAMES` block inside `test_artifact_consistency.py` contributes 1).

### Format-count glossary (resolves a terminology ambiguity)

The plugin has three overlapping format counts that this plan uses in different contexts:

- **Mode-agnostic format grammars** — files at `reference/visual-grammar/formats/*.md`. Currently **9** (ascii, dashboard, graphml, html, json, markdown, modelica, tikz, uml). v0.5.0 adds 2 → **11**.
- **Per-mode format grammars** — the `mermaid` and `dot` templates embedded in each `reference/visual-grammar/<mode>.md` file. These are per-mode-specific, not mode-agnostic, so they live in a different directory. Count: **2**. Unchanged by v0.5.0.
- **Effective total formats** — mode-agnostic + per-mode. Currently **11** (9 + 2); v0.5.0 takes this to **13** (11 + 2). This is the count the README's "All 11 export formats" table shows. v0.5.0 updates the table heading to "All 13 export formats".

When this plan says "format count 11 → 13" or "ships 2 new formats", it refers to the effective total. When it says "EXPECTED_FORMATS goes from 9 to 11", it refers to the mode-agnostic subset tested by `test/test_format_grammars.py`.

### Task count and effort

**Total unique task count: 16.** With the wave structure below, the full release can be executed in **3 sequential waves**:

- Wave 1: **60–90 minutes** (T6 smoke parallelization is the dominant task; T4 and T5 are Opus-model content authoring)
- Wave 2: **5–10 minutes** (6 cascade tasks, mostly haiku-model mechanical edits)
- Wave 3: **30–40 minutes** (sequential release gate, most of this is the T15 smoke run)

**Total agent-driven wall-clock: ~95–140 minutes.** Compared to sequential single-engineer execution (~6–8 hours), the wave structure compresses the release to roughly 1.5–2.5 hours.

## Priority ranking

This section is the **complete one-table view** of every roadmap candidate (reasoning modes + output formats + quality infrastructure), with an explicit priority tier for each including rejected items. v0.5.0 only ships items in tiers P0 and P1. P2 is included in this plan as Wave 3 but can slip to v0.5.1. P3 is held pending evidence. "Reject" items are out of scope for the foreseeable future and are listed here only so the plan is a comprehensive view — they are NOT scheduled for any release.

**First: the 34 canonical reasoning modes that already shipped (v0.1.0 → v0.4.1).** These are the source of truth for what is implemented and should NOT be re-implemented:

```
abductive, algorithmic, analogical, analysis, argumentation, bayesian, causal,
computability, constraint, counterfactual, critique, cryptanalytic, deductive,
engineering, evidential, firstprinciples, formallogic, gametheory, historical,
hybrid, inductive, mathematics, metareasoning, modal, optimization, physics,
recursive, scientificmethod, sequential, shannon, stochastic, synthesis,
systemsthinking, temporal
```

Any proposed new mode must NOT duplicate any of these. This is the test the roadmap's three review rounds applied to catch `toulmin`, `socratic`, `dialectical`, etc. below as already-canonical.

### Comprehensive priority table — every roadmap candidate

**Legend:** P0 = ship-gate for v0.5.0. P1 = should-ship for v0.5.0. P2 = nice-to-have in v0.5.0, may slip to v0.5.1. P3 = deferred (held pending evidence; may land in v0.6.0+). **Reject** = out of scope; will NOT be implemented (documented here for completeness).

| Priority | Category | Item | Impact | Effort | Rationale |
|---|---|---|---|---|---|
| **P0** | Quality | `MODE_DISPLAY_NAMES` automated sync check | High | Trivial | Prevents silent drift at the 10th sync location; ~15 LOC extension to `test_artifact_consistency.py`. Zero regret. |
| **P0** | Quality | `test_version_consistency.py` | High | Small | Prevents the v0.4.1 latent-bug class (plugin.json stuck at 0.1.0 for 4 releases). ~80 LOC new test file. |
| **P0** | Ergonomics | `examples/personal-command-alias/think-render.md` | Medium | Trivial | Ships the missing parallel to the existing `think.md` alias. 12-line file. |
| **P1** | Format | `latex-math` format grammar | Medium-High | Small-Medium | The only Tier 1 mode-agnostic format to survive all three review rounds. Rendering convenience for 7 math-heavy modes. |
| **P1** | Format | `csv` format grammar | Medium | Small-Medium | Second Tier 1 format. Tabular export for 27 of 34 modes. |
| **P2** | Quality | Smoke test parallelization (T6) | High (long-term) | Medium-Large | 30–60 min → 10–15 min with 4 parallel workers. Architect flagged as High severity for scaling beyond 40 modes. |
| **P3** | Mode | `decisionanalysis` — individual choice under uncertainty | Medium | Medium-Large | **Held, not rejected.** Architect said "fills a real gap" (individual choice vs strategic interaction); adversary said schema is a union of bayesian+gametheory+optimization. Requires a design spike producing a worked example that proves distinctness before any implementation. If the spike succeeds, this could land in v0.6.0. |
| **P3** | Mode | `bayesiannetworks` — graphical probabilistic models | Low-Medium | Medium | **Contested rejection.** Adversary reviewer argued this is a structurally distinct approach (d-separation, conditional independence graphs) from the canonical `bayesian` single-hypothesis-with-evidence mode. Held in Tier 3 pending either a real smoke-test failure showing the `bayesian` schema cannot fit a multi-variable Bayesian network thought, or a specific user request. If re-evaluated and accepted, the architecturally correct path is likely extending the existing `bayesian` schema with optional `network` fields, not a new mode. |
| **P3** | Format | `pdf` format grammar | Low | Medium | Tier 2 held. Requires HTML/LaTeX conversion pipeline. Only revisit if there's a concrete consumer request. |
| **P3** | Format | `gexf` format grammar | Low | Small | Tier 2 held. More feature-rich than the canonical `graphml` for dynamic networks. Revisit only if Gephi/NetworkX users ask. |
| **P3** | Format | `plantuml` format grammar | Low | Medium | Tier 2 held. Simpler UML syntax than canonical `uml`. Requires a Java-based renderer. Revisit only if enterprise-documentation users ask. |
| **Reject** | Mode | `dialectical` (thesis/antithesis/synthesis) | — | — | Already covered by combining canonical `synthesis` + `argumentation` + `critique`. Rejection documented in `docs/ROADMAP-FUTURE-MODES-AND-FORMATS.md` Tier 3. |
| **Reject** | Mode | `structuralcausalmodel` (Pearl do-calculus) | — | — | Pearl's 3-rung causal hierarchy is already covered by canonical `causal` + `counterfactual`, and `skills/think-causal/SKILL.md` already teaches `do-operator` reasoning. If Pearl's lineage needs attribution, the right fix is a prose addition to `think-causal/SKILL.md`, not a new mode. |
| **Reject** | Mode | `dynamicalsystems`, `controltheory`, `networkanalysis`, `probabilistic`, `reliabilityengineering` (computational cluster) | — | — | All 5 require **computation** (eigenvalues, PID tuning, centrality calculations, p-values, FMEA). The plugin teaches reasoning patterns expressed as structured JSON; it does not run computation. This is the dividing line between the plugin and the deprecated MCP (which had TypeScript handlers for exactly these). Out of scope per the "no Node runtime" principle in `CLAUDE.md`. `reliabilityengineering` is additionally redundant with canonical `engineering` (which explicitly includes failure analysis, same reason `fmea` was already rejected). |
| **Reject** | Mode | `toulmin` (Argumentation Model) | — | — | IS the canonical `argumentation` mode. Verified against `skills/think-academic/SKILL.md` which explicitly defines argumentation as "Argumentation (Toulmin model with claim/warrant/backing/qualifier/rebuttal)" with a worked example using Toulmin structure verbatim. Any future mention of "Toulmin" in documentation is confirming the existing implementation, not requesting a new one. |
| **Reject** | Mode | `socratic` (Socratic Questioning) | — | — | IS already part of canonical `critique`. The skill description explicitly says "Critique (peer-review style evaluation, strengths/weaknesses, **Socratic questions**)". Adding a separate mode would duplicate functionality. |
| **Reject** | Mode | `dempstershafer` | — | — | IS the theoretical foundation of canonical `evidential`. The belief-functions / plausibility-functions framework lives inside the evidential mode, not as a separate reasoning paradigm. |
| **Reject** | Mode | `allentemporal` (Allen Interval Relations) | — | — | Already covered by canonical `temporal` mode. Allen's interval algebra (before/after/during/overlaps/meets) is a specific formalism within temporal reasoning, not a distinct mode. |
| **Reject** | Mode | `fmea` (Failure Mode and Effects Analysis) | — | — | Already covered by canonical `engineering` mode. FMEA is explicitly mentioned as a technique within engineering reasoning. |
| **Reject** | Mode | `epistemiclogic` | — | — | Too narrow for standalone mode. Reasoning about knowledge states is a specialized modal logic system already covered by the generic `modal` mode's treatment of possibility and necessity. |
| **Reject** | Mode | `deonticlogic` | — | — | Same as `epistemiclogic` — a specialized modal logic (obligations and permissions) with limited practical applications outside legal/ethical domains. Covered by `modal`. |
| **Reject** | Mode | `modusponens` | — | — | Not a reasoning method; a specific inference rule within `formallogic`. Classical logical forms like modus ponens and modus tollens are components, not standalone paradigms. |
| **Reject** | Mode | `syllogism` | — | — | Same as `modusponens` — a classical three-part argument form within `formallogic`, not a complete reasoning methodology. |
| **Reject** | Format | `mermaid` | — | — | ALREADY canonical. Mermaid templates live at `reference/visual-grammar/<mode>.md` (one per mode) because each mode needs its own diagram structure. Rendered by `scripts/render-diagram.py` → `mmdc`. The README correctly counts it as one of the effective 11 formats. Future work should NOT collapse the per-mode structure into a single `formats/mermaid.md`. |
| **Reject** | Format | `dot` (Graphviz) | — | — | Same as `mermaid` — already canonical, per-mode templates at `reference/visual-grammar/<mode>.md`, rendered via `dot`. |
| **Reject** | Format | `svg`, `png` | — | — | Already supported as derived outputs from `mermaid` + `dot` via `scripts/render-diagram.py --render-as svg|png`. These are rendering targets, not source formats for reasoning visualization. |
| **Reject** | Format | `confluence` markup | — | — | Platform-specific. Confluence already accepts markdown, and the canonical `markdown` format grammar covers this use case without a dedicated format. |
| **Reject** | Format | `docx` | — | — | Binary format requiring a complex conversion pipeline. Pandoc conversion from `markdown` (canonical) already provides this capability. The marginal benefit of a native docx grammar does not justify the conversion-pipeline complexity. |
| **Reject** | Format | `beamer` (LaTeX Beamer slides) | — | — | A specific LaTeX document class, not a distinct reasoning output format. Users needing presentation format can embed canonical `tikz` output in Beamer manually. |

**Summary by tier:**

| Tier | Modes | Formats | Quality/Ergonomics | Total |
|---|---|---|---|---|
| P0 (ship v0.5.0) | 0 | 0 | 3 | 3 |
| P1 (should ship v0.5.0) | 0 | 2 | 0 | 2 |
| P2 (nice-to-have v0.5.0) | 0 | 0 | 1 | 1 |
| P3 (held, may land v0.6.0+) | 2 | 3 | 0 | 5 |
| Reject (out of scope) | 14 | 7 | 0 | 21 |
| **Candidates total** | **16** | **12** | **4** | **32** |
| Already shipped (canonical) | 34 | 11 | n/a | — |

**v0.5.0 commits to P0 + P1 only** (5 items = 3 P0 quality/ergonomics + 2 P1 formats). P2 (smoke parallelization) is included in this plan as Wave 3 because it's independent of the release content and has no risk of interfering with the format work, but it can slip to v0.5.1 without blocking v0.5.0.

**Why the rejected modes are listed here:** so the plan is a self-contained reference for what is in and out of scope. A future contributor reading only this plan should be able to see the full picture without cross-referencing the ROADMAP. If any rejection is re-opened, update this table directly AND the corresponding Tier 3 entry in `docs/ROADMAP-FUTURE-MODES-AND-FORMATS.md`.

**If you want any rejected item reconsidered:** the weakest rejection is `bayesiannetworks` — see the ROADMAP's bayesiannetworks Tier 3 entry for the "structural reasoning approach distinct from belief updating" argument and why a schema extension to the canonical `bayesian` mode is a more defensible path than a new mode. The second-weakest is `decisionanalysis`, which is held in P3 (not rejected) pending a design spike. All other rejections should not be reopened without new evidence.

## Dependency graph

```
Wave 1 (5 tasks, fully parallel — no shared files, no dependencies on unwritten files):
  T1  MODE_DISPLAY_NAMES sync check   → test/test_artifact_consistency.py
  T2  test_version_consistency.py      → test/test_version_consistency.py (new)
  T4  latex-math format grammar        → reference/visual-grammar/formats/latex-math.md (new)
  T5  csv format grammar               → reference/visual-grammar/formats/csv.md (new)
  T6  smoke parallelization            → test/smoke/run-all-modes.py

Wave 2 (6 tasks, parallel AFTER wave 1; T3+T7-T11 all reference the new formats):
  T3  think-render alias               → examples/personal-command-alias/think-render.md (new, references latex-math + csv)
  T7  test_format_grammars EXPECTED_FORMATS      → test/test_format_grammars.py
  T8  commands/think-render.md format list       → commands/think-render.md
  T9  agents/visual-exporter.md format list      → agents/visual-exporter.md
  T10 README "11 export formats" → "13"          → README.md
  T11 CLAUDE.md format count update              → CLAUDE.md

Wave 3 (sequential release gate — T13 MUST run before T12):
  T13 CHANGELOG [Unreleased] → [0.5.0]            → CHANGELOG.md  (must precede T12 so T2's version consistency test passes on T12)
  T12 Bump plugin.json 0.4.1 → 0.5.0              → .claude-plugin/plugin.json
  T14 Run full fast test suite (verify Waves 1+2)
  T15 Run smoke suite (all 34 modes, ~15 min parallel)
  T16 Git tag v0.5.0 + gh release create
```

### Why these dependencies

- **Wave 1** (5 tasks) touches **disjoint files** and none of them reference formats that don't yet exist. Parallel execution is safe because no two tasks write to the same file. This is the `subagent-driven-development` parallel-wave pattern: non-overlapping writes across agents in a wave.
- **Wave 2** (6 tasks) all depend on Wave 1 tasks T4 and T5: the new format grammar files must exist before they can be referenced anywhere else. T3 (the `think-render` alias) was moved here from Wave 1 because its frontmatter description lists all 15 accepted format values including the new `latex-math` and `csv` — writing that list before T4/T5 create the actual grammar files would create a time window where the alias references vapor. Within Wave 2, all 6 tasks touch disjoint files — they can run in parallel with each other.
- **Wave 3** is sequential. **T13 runs before T12** (not the other way around): T13 promotes the `[Unreleased]` CHANGELOG section to `[0.5.0]` and adds the release date, and T12 bumps `plugin.json` to `0.5.0`. The order matters because T2's `test_version_consistency.py` (created in Wave 1) verifies that the version in `plugin.json` matches the latest CHANGELOG heading — if T12 runs first, the consistency test would fail because CHANGELOG still says `[Unreleased]`. T14 runs the fast test suite after both T13 and T12 are done. T15 runs smoke tests after T14 passes. T16 tags only after all previous steps are green.

## Wave composition for agent-driven execution

### Wave 1 — Parallel, 5 independent tasks

Dispatch all 5 via `Agent` tool (subagent_type: general-purpose) or the skill-invocation dispatcher. Each agent gets ONE task with its full brief inlined. Expected wall-clock: **60–90 minutes** (bounded by T6 smoke parallelization, which is the largest task, plus T4 and T5 which are Opus-model content-authoring tasks).

**Synchronization mechanism (how the controller knows Wave 1 is done):** the controller blocks on all 5 `Agent` tool results in a single message. When every agent returns a result (success or failure), Wave 1 is complete. No polling, no timeouts needed beyond the Agent tool's own timeout.

**Crash recovery protocol:** if any Wave 1 agent returns a failure or error status:

1. **Halt the wave.** Do NOT proceed to Wave 2 even if other agents succeeded.
2. **Inspect the failed agent's output.** Read the error message; check whether the file it was supposed to create/modify exists and in what state.
3. **Debug the root cause.** Is the task brief missing context? Did the subagent hit a rate limit? Was the acceptance criteria unfalsifiable?
4. **Re-dispatch the single failed task** as a standalone Agent call with the original brief plus any disambiguation the first attempt surfaced. Do NOT re-dispatch the already-successful Wave 1 tasks.
5. **Resume Wave 1 barrier.** Once the re-dispatch returns successfully, treat Wave 1 as complete and proceed to Wave 2.

Reviewer assignment (post-task review): each Wave 1 task gets a **light review** via a single `llm_query` call (Sonnet) before merge — see "Review gates" below. Run all 5 reviewers in parallel after the wave barrier.

### Wave 2 — Parallel, 6 cascade tasks

Wait for Wave 1 to fully complete (all 5 tasks committed successfully). Then dispatch Wave 2 as 6 parallel agents, each modifying one downstream file to reference the new `latex-math` and `csv` formats. Wave 2 now includes T3 (the `think-render` personal command alias) which was moved from Wave 1 because its format list references the new grammars.

**Pre-flight check before dispatching Wave 2** — the controller MUST verify:

```bash
test -f reference/visual-grammar/formats/latex-math.md && wc -c < reference/visual-grammar/formats/latex-math.md  # must be >= 400
test -f reference/visual-grammar/formats/csv.md         && wc -c < reference/visual-grammar/formats/csv.md          # must be >= 400
```

If either file is missing or under 400 bytes, Wave 2 dispatch aborts and returns to Wave 1 crash recovery.

Expected wall-clock: **5–10 minutes** (6 haiku-model cascade tasks, each a mechanical edit).

### Wave 3 — Sequential release gate

Executed by the **controller** (the main session orchestrating the release), not subagents. Wall-clock: **~30 minutes wall, mostly smoke suite**.

## Per-task specifications

Each task below is a self-contained brief suitable for a subagent dispatch. The subagent has no conversation history; everything it needs is in the task description.

---

### T1 — Extend `test_artifact_consistency.py` with `MODE_DISPLAY_NAMES` sync check

**Wave:** 1
**Model:** sonnet (light refactor + new function + call site)
**Files modified:** `test/test_artifact_consistency.py`
**Files read:** `scripts/render-html-dashboard.py`

**Current state:**

`test/test_artifact_consistency.py` (102 lines) enforces set-equality across 5 directories (schemas, samples, visual-grammar, output-formats, smoke prompts). It uses 5 helper functions: `schemas_set()`, `samples_valid_set()`, `grammar_set()`, `output_formats_set()`, `prompts_set()`. The authoritative mode set is the filenames in `test/schemas/*.json`.

The `MODE_DISPLAY_NAMES` dict in `scripts/render-html-dashboard.py` is a hidden **10th sync location** per `CLAUDE.md`. Currently no test verifies that its keys match the canonical mode set. Drift surfaces only as a wrong dashboard title (the fallback `mode.capitalize() + " Reasoning"` produces "Gametheory Reasoning" instead of "Game Theory" for compound names).

**Goal:**

Add a 6th check that parses `MODE_DISPLAY_NAMES` from `scripts/render-html-dashboard.py` (without importing the script — parse as text to avoid side effects) and verifies its keys match the authoritative schemas set exactly.

**Implementation guidance:**

Use regex parsing, not import. The script has this structure starting around the top of the file:

```python
MODE_DISPLAY_NAMES = {
    "sequential": "Sequential Reasoning",
    "shannon": "Shannon-Style Decomposition",
    ...
}
```

Parse with a regex like `MODE_DISPLAY_NAMES\s*=\s*\{([^}]+)\}` followed by `"(\w+)":` to extract keys. The robust approach: use `ast.parse` on the script file, then walk the module for an `Assign` node targeting a `Name("MODE_DISPLAY_NAMES")` and extract the dict keys from the `Dict` node's `keys`. This is safer than regex because it doesn't break if formatting changes.

Add a new helper function `mode_display_names_set()` that returns the set of keys. Add a new comparison block in `main()` that diffs this against `schemas_set()` and prints `PASS: scripts/render-html-dashboard.py MODE_DISPLAY_NAMES matches (34 modes)` on success or `FAIL: MODE_DISPLAY_NAMES missing: [...], extra: [...]` on failure.

**Acceptance criteria:**

1. `python test/test_artifact_consistency.py` exits 0 on the current repo (34-mode match).
2. If you temporarily delete one entry from `MODE_DISPLAY_NAMES` in `scripts/render-html-dashboard.py`, the test exits non-zero and prints a clear diff showing which mode is missing. **Test this manually** before declaring the task done, then restore the deleted entry.
3. The test does NOT import `render-html-dashboard.py` (no side effects, no new dependencies).
4. Total LOC added: ~25 (one new helper function + one new comparison block).

**Deliverable:**

Modified `test/test_artifact_consistency.py` with the new check. Commit message: `test(consistency): add MODE_DISPLAY_NAMES sync check — the hidden 10th sync location`.

---

### T2 — Create `test/test_version_consistency.py`

**Wave:** 1
**Model:** sonnet (new test file, moderate logic)
**Files modified:** none
**Files created:** `test/test_version_consistency.py`

**Current state:**

There is no cross-file version coherence check. The v0.4.1 release cycle surfaced that `.claude-plugin/plugin.json` had been stuck at `"version": "0.1.0"` for four releases (v0.2.0, v0.3.0, v0.4.0) because the only check on it was a hardcoded `assert version == "0.1.0"` in `test_plugin_json.py` (since fixed to use a semver regex). Multiple other files reference the version independently: `README.md` Status line, `skills/think/SKILL.md` "Available Modes (vX.Y.Z)" heading, the latest CHANGELOG entry heading, `ARCHITECTURE.md` in a "Current version" note.

**Goal:**

Write a new test that reads the authoritative version from `.claude-plugin/plugin.json`, then verifies every other known version-mention in the repo agrees. Fail loudly with a clear diff showing each file's claimed version vs the authoritative value.

**Implementation guidance:**

1. Read `.claude-plugin/plugin.json` → extract `data["version"]` → this is the source of truth.
2. For each of the following files, extract the version string and compare:
   - `CHANGELOG.md` — the first `## [X.Y.Z] - YYYY-MM-DD` header (the latest release). Note: `[Unreleased]` is valid and should NOT match; only check the first real version heading.
   - `README.md` — look for "v0.X.Y" or "**vX.Y.Z**" in the Status section (within first 20 lines).
   - `skills/think/SKILL.md` — look for `Available Modes (v`X.Y.Z)`or similar.
   - `CLAUDE.md` — look for "**Current version:** v0.X.Y" in the intro.
   - `ARCHITECTURE.md` — optional; look for any "v0.X.Y" mention if present.
3. For each mismatch, print `FAIL: <file> claims v<found> but plugin.json says v<authoritative>`.
4. Pass if all files agree with plugin.json (or genuinely don't mention the version at all — absence is OK).
5. Return exit 0 or non-zero accordingly.

**Edge cases to handle:**

- A file not mentioning the version at all → PASS (absence is not a failure; it just means there's nothing to check)
- A file mentioning multiple versions (e.g., CHANGELOG has [0.4.1], [0.4.0], [0.3.0]) → only the FIRST real-version heading matters; earlier ones are history and should not be checked
- `[Unreleased]` heading in CHANGELOG → skip it, look for the first non-Unreleased heading
- Version patterns like `v0.4.1`, `0.4.1`, `v0.4.1+`, `v0.4.1-dev` — be flexible on prefixes but strict on the numeric part

**Acceptance criteria:**

1. `python test/test_version_consistency.py` exits 0 against the current repo at v0.4.1.
2. Temporarily edit `README.md` to say `v0.3.0` instead of `v0.4.1` (or any wrong version) — rerun the test — it should FAIL with a clear diff. Restore the file.
3. The test uses only Python stdlib (no new dependencies).
4. Docstring at the top explains the v0.4.1 latent-bug story so future contributors understand why this test exists.
5. File size: ~80–120 LOC including docstring.

**Deliverable:**

New file `test/test_version_consistency.py`. Commit message: `test(version): add cross-file version coherence check — prevents plugin.json drift`.

---

### T3 — Ship `examples/personal-command-alias/think-render.md`

**Wave:** 2 (moved from Wave 1 because the alias description lists format values including `latex-math` and `csv`, which are created in Wave 1 by T4 and T5 — writing T3 before T4/T5 would reference vapor)
**Model:** haiku (trivial file creation)
**Files modified:** none
**Files created:** `examples/personal-command-alias/think-render.md`

**Current state:**

The plugin ships one personal-command alias at `examples/personal-command-alias/think.md`, which lets users type `/think <mode> "<problem>"` instead of `/deepthinking-plugin:think <mode> "<problem>"`. There is NO corresponding alias for `/think-render`. The canonical `/deepthinking-plugin:think-render <format>` form works, but the short `/think-render <format>` form doesn't.

The existing `think.md` file is 12 lines. Its structure (verbatim):

```markdown
---
description: "Apply a structured reasoning method to a problem. Shortcut alias for /deepthinking-plugin:think. Usage: /think [mode] \"<problem>\" where mode is any of the 34 available reasoning modes (sequential, inductive, deductive, abductive, bayesian, causal, gametheory, systemsthinking, ...), or omitted for auto-recommend."
argument-hint: "[mode] <problem>"
---

The user invoked `/think` with these arguments:

```
$ARGUMENTS
```

This is a top-level alias for the `deepthinking-plugin:think` plugin skill. Invoke that skill via the Skill tool now, passing the arguments above verbatim as the skill's input. Do not attempt to answer the reasoning question directly — let the plugin skill route to the correct reasoning mode and produce its structured output.
```

**Goal:**

Create the parallel `think-render.md` alias that delegates to `deepthinking-plugin:think-render`. Mirror the existing `think.md` structure exactly, but swap the command name, argument hint, and description.

**Implementation guidance:**

Use this exact template (substitute into the new file):

```markdown
---
description: "Render the most recent structured thought output (from /think) as a diagram or document. Shortcut alias for /deepthinking-plugin:think-render. Usage: /think-render [format] where format is mermaid, dot, ascii, json, markdown, graphml, html, tikz, uml, modelica, dashboard, latex-math, csv, svg, or png (defaults to mermaid)."
argument-hint: "[format]"
---

The user invoked `/think-render` with these arguments:

```
$ARGUMENTS
```

This is a top-level alias for the `deepthinking-plugin:think-render` plugin command. Invoke that command via the Skill tool now, passing the arguments above verbatim as the command's input. Do not attempt to render the diagram directly — let the plugin command route to the visual-exporter agent and produce the diagram source.
```

Note the format list includes `latex-math` and `csv` — these are the v0.5.0 additions and must be referenced here.

**Acceptance criteria:**

1. File exists at `examples/personal-command-alias/think-render.md`.
2. File has valid YAML frontmatter with `description` and `argument-hint` fields.
3. File structure mirrors `examples/personal-command-alias/think.md`.
4. Format list includes all 15 values: `mermaid, dot, ascii, json, markdown, graphml, html, tikz, uml, modelica, dashboard, latex-math, csv, svg, png`.
5. File is 12–15 lines (same order of magnitude as `think.md`).

**Deliverable:**

New file `examples/personal-command-alias/think-render.md`. Commit message: `feat(alias): ship think-render personal command alias`.

---

### T4 — Create `reference/visual-grammar/formats/latex-math.md`

**Wave:** 1
**Model:** opus (content-heavy grammar authoring + domain knowledge of AMS-math)
**Files modified:** none
**Files created:** `reference/visual-grammar/formats/latex-math.md`

**Current state:**

The 9 existing mode-agnostic format grammars at `reference/visual-grammar/formats/<format>.md` follow a standard structure enforced by `test/test_format_grammars.py`: every file must contain the sections `## Format Overview`, `## Encoding Rules`, `## Template`, `## Worked Example`, and the file must be at least 400 bytes. The existing 9 are `ascii`, `dashboard`, `graphml`, `html`, `json`, `markdown`, `modelica`, `tikz`, `uml`.

The `tikz` grammar already covers vector diagrams using the TikZ LaTeX package. **`latex-math` is distinct from `tikz`** — it's for general AMS-math equation rendering (align*, matrices, proofs), not diagrams. The two are complementary.

The roadmap (`docs/ROADMAP-FUTURE-MODES-AND-FORMATS.md`, Format Tier 1 section) specifies this format is for math-heavy modes: mathematics, physics, computability, formallogic, firstprinciples, bayesian, evidential. It should produce a clean math-only artifact that can be pasted into a paper, `\input` into a LaTeX document, or rendered by KaTeX/MathJax in a browser.

**Goal:**

Write a complete `latex-math` format grammar file following the 4-section standard. The file teaches Claude (and the visual-exporter agent) how to extract math-bearing fields from any of the 34 mode thoughts and render them as an AMS-math LaTeX block.

**Implementation guidance:**

**Section 1: `## Format Overview`** (~10 lines)

Explain what latex-math is, how it differs from tikz (math vs diagrams), and what consumers it serves (academic papers, Overleaf, MathJax/KaTeX). Mention the required preamble packages: `\usepackage{amsmath}`, `\usepackage{amssymb}`.

**Section 2: `## Encoding Rules`** (~15 lines)

Rules for translating thought content to LaTeX math:

1. **Extract only math-bearing fields.** Look for fields named `calculation`, `formula`, `equation`, `derivation`, `proof`, `posterior`, `likelihood`, `premise`, `axiom`, or any string field whose content starts with `$` or contains `=`, `\\`, `\frac`, `\sum`, `\int`, `\prod`.
2. **Wrap each equation in `\begin{align*} ... \end{align*}`** for display math. Use `&` alignment at `=` signs when multiple steps are shown.
3. **Preserve step-by-step arithmetic.** If a bayesian `posterior.calculation` field shows full arithmetic (e.g., `0.6 × 0.8 / (0.6 × 0.8 + 0.4 × 0.2) = 0.857`), render each step on its own line with alignment.
4. **Escape special characters.** Underscores in variable names become `\_`. Percent signs become `\%`. Ampersands in text become `\&`.
5. **Label equations** with `\tag{<thought-field-path>}` so the reader can trace each equation back to its source in the thought JSON.
6. **Non-math prose fields** (descriptions, justifications) go in `\intertext{...}` blocks between equations, not as equation body.
7. **Fall back gracefully** if the thought has no math-bearing fields: emit a one-line comment `% latex-math: no math fields found in this thought; see tikz for diagram rendering` and exit with an empty document body.

**Section 3: `## Template`** (~15 lines)

A complete LaTeX document skeleton:

```latex
\documentclass{article}
\usepackage{amsmath}
\usepackage{amssymb}
\begin{document}

% <mode> thought, extracted <YYYY-MM-DD>
% Source: <thought-id or timestamp>

\begin{align*}
<equation-lines>
\end{align*}

\intertext{<optional-prose>}

\begin{align*}
<more-equations>
\end{align*}

\end{document}
```

Explain that each `\begin{align*}` block corresponds to a distinct math-bearing field in the thought.

**Section 4: `## Worked Example`** (~25 lines)

Use this concrete `bayesian` thought as the input (inlined here so the subagent does not need to read external files):

```json
{
  "mode": "bayesian",
  "thoughtType": "inference",
  "hypothesis": {
    "statement": "The failing deploy is caused by a config drift in service X",
    "prior": 0.30
  },
  "alternatives": [
    {"statement": "Network partition", "prior": 0.35},
    {"statement": "Upstream dependency outage", "prior": 0.35}
  ],
  "evidence": [
    {
      "id": "E1",
      "description": "Config file diff shows 3 edited fields in service X",
      "likelihood": {"givenH": 0.9, "givenNotH": 0.2}
    },
    {
      "id": "E2",
      "description": "Only service X is affected; upstream services healthy",
      "likelihood": {"givenH": 0.8, "givenNotH": 0.4}
    }
  ],
  "posterior": {
    "value": 0.857,
    "calculation": "P(H|E1,E2) = (0.9 * 0.8 * 0.3) / ((0.9 * 0.8 * 0.3) + (0.2 * 0.4 * 0.7)) = 0.216 / 0.272 = 0.794"
  },
  "confidence": 0.7
}
```

Show the expected `latex-math` output produced from this input — a single `\begin{align*}` block rendering the full Bayes arithmetic with equation-by-equation `\\\\` line breaks, and an `\intertext{...}` line showing the human-readable hypothesis statement as caption. The worked example should be a **complete `.tex` document** that would compile with `pdflatex`. Use `\tag{bayesian.posterior.calculation}` at the end of the align block so the reader can trace back to the source field.

Note on `givenH` vs `given_h`: the schema uses camelCase per plugin convention, not snake_case. Use `givenH` in both the JSON input and the corresponding LaTeX subscripts if referenced.

**Per-mode considerations section (~10 lines)** — optional 5th section:

Brief notes on which modes produce the richest latex-math output:

- **Excellent** (most of the artifact is math): mathematics, physics, bayesian, formallogic, firstprinciples
- **Moderate** (some math, mostly prose): computability, evidential, gametheory
- **Poor fit** (rarely math-heavy): historical, synthesis, analogical — these should usually render as tikz or markdown instead

**Section: `## Rendering Tools`** (~10 lines)

- **Local**: `pdflatex <file>.tex` requires a TeX distribution (TeX Live, MiKTeX).
- **Web**: MathJax or KaTeX can render `\begin{align*}...\end{align*}` blocks embedded in HTML.
- **Overleaf**: paste into an Overleaf document with `\usepackage{amsmath}` and compile.
- **Markdown integration**: GitHub-flavored markdown supports `$$\begin{align*}...\end{align*}$$` inline for MathJax-enabled renderers (README rendering, Jupyter, some docs sites).

**Acceptance criteria:**

1. File exists at `reference/visual-grammar/formats/latex-math.md`.
2. File contains all 4 required sections (`Format Overview`, `Encoding Rules`, `Template`, `Worked Example`) with the exact section headings.
3. File size is ≥ 400 bytes (the `MIN_BYTES` threshold in `test_format_grammars.py`).
4. Worked example includes a realistic `bayesian` thought with full Bayes arithmetic rendered as AMS-math.
5. File does NOT duplicate content from `tikz.md` — the two are complementary, not competing.
6. No LaTeX syntax errors in the worked example (specifically: `\begin{align*}` must be paired with `\end{align*}`, all braces balanced).

**Deliverable:**

New file `reference/visual-grammar/formats/latex-math.md`. Commit message: `feat(format): add latex-math grammar for math-heavy modes`.

---

### T5 — Create `reference/visual-grammar/formats/csv.md`

**Wave:** 1
**Model:** opus (content-heavy grammar authoring with 34-mode iteration; spec is Medium-Large effort, 60-90 minutes)
**Files modified:** none
**Files created:** `reference/visual-grammar/formats/csv.md`

**Current state:**

No CSV format grammar exists. A heuristic check of `test/schemas/*.json` shows **27 of 34 modes have at least one wide array-of-objects field** (≥3 properties) that would flatten cleanly to CSV rows. The top candidates whose tabular content is the *primary* artifact (not incidental):

- `gametheory.payoffMatrix.entries` — strategic profiles with payoffs
- `bayesian.evidence` — rows with likelihood and posterior impact
- `optimization.alternatives` — alternatives with criteria scores
- `engineering.tradeStudy.alternatives` — alternatives with weighted scores
- `evidential.belief` — source masses

**Goal:**

Write a complete `csv` format grammar that defines per-mode flattening rules. The grammar must specify, for each of the 34 modes, which field becomes the row source and which sub-fields become columns. Modes with multiple candidate tabular fields need a priority order. Modes without any tabular content need a graceful-fallback rule.

**Implementation guidance:**

**Section 1: `## Format Overview`** (~10 lines)

CSV per RFC 4180 (Shafranovich 2005, IETF). Explain: simple row-oriented text format for tabular data, universal consumption by Excel, R, pandas, databases. Note that CSV is **lossy for graph-structured thoughts** — it only captures tabular subsections, not the full nested thought.

**Section 2: `## Encoding Rules`** (~25 lines — the largest section)

1. **Header row first.** Always start with a header row naming each column.
2. **RFC 4180 quoting.** Wrap any cell containing a comma, double-quote, or newline in double-quotes. Double-quotes inside quoted cells are escaped as `""`.
3. **Unicode safe.** UTF-8 encoding with no BOM. Preserve non-ASCII characters verbatim.
4. **Flattening strategy — primary tabular field.** For each mode, identify the "primary tabular field" (the field whose rows are the main content). Use that field's array-of-objects as the CSV row source. Each object becomes one row; each property becomes one column.
5. **Nested objects inside rows.** Flatten one level deep with `parent.child` column names. E.g., `bayesian.evidence[].likelihood.given_h` → column `likelihood.given_h`.
6. **Arrays inside rows.** Serialize as semicolon-separated values in a single cell. E.g., a `tags` array becomes `"tag1;tag2;tag3"` in one cell.
7. **Null handling.** Empty string for null values (not `"null"` or `NULL`).
8. **Fallback for non-tabular modes.** If a mode has no primary tabular field (e.g., `firstprinciples`, `metareasoning`), emit a 2-column `field,value` representation of the top-level thought fields. Document this as a degraded fallback.
9. **Multi-table support.** For modes with multiple distinct tabular subsections (e.g., `gametheory` has `players` AND `payoffMatrix.entries`), emit them as separate CSV documents with a comment line `# table: players` or `# table: payoffs` preceding each header row.

**Section 3: `## Template`** (~10 lines)

```csv
# table: <primary_field_name>
<col1>,<col2>,<col3>
<val1a>,<val1b>,<val1c>
<val2a>,<val2b>,<val2c>
```

**Section 4: `## Worked Example`** (~25 lines)

Show a `bayesian` thought with 3 evidence items flattened to CSV:

Input thought (abbreviated):
```json
{
  "mode": "bayesian",
  "hypothesis": {"prior": 0.3, ...},
  "evidence": [
    {"id": "E1", "description": "observed pattern X", "likelihood": {"given_h": 0.9, "given_not_h": 0.2}},
    {"id": "E2", "description": "test result Y", "likelihood": {"given_h": 0.7, "given_not_h": 0.3}},
    {"id": "E3", "description": "report Z", "likelihood": {"given_h": 0.6, "given_not_h": 0.4}}
  ],
  "posterior": {"value": 0.857, "calculation": "..."}
}
```

Output CSV:
```csv
# table: evidence
id,description,likelihood.given_h,likelihood.given_not_h
E1,observed pattern X,0.9,0.2
E2,test result Y,0.7,0.3
E3,report Z,0.6,0.4
```

**Section 5: `## Per-Mode Flattening Rules`** (~30 lines — unique to this format)

Document the primary tabular field (if any) for each of the 34 canonical modes. The 34 modes (from `test/schemas/*.json`, authoritative) are:

```
abductive, algorithmic, analogical, analysis, argumentation, bayesian, causal,
computability, constraint, counterfactual, critique, cryptanalytic, deductive,
engineering, evidential, firstprinciples, formallogic, gametheory, historical,
hybrid, inductive, mathematics, metareasoning, modal, optimization, physics,
recursive, scientificmethod, sequential, shannon, stochastic, synthesis,
systemsthinking, temporal
```

The subagent MUST list all 34 of these in the Per-Mode Flattening Rules section, with a tier for each. Do not invent additional modes; do not omit any. Use this initial tier assignment as a starting point (based on the Roadmap's analysis) and refine by reading the actual schema only if uncertain:

- **Excellent** (tabular content IS the primary artifact; CSV export is a clean one-table view): `abductive` (hypotheses), `bayesian` (evidence), `constraint` (variables), `engineering` (tradeStudy.alternatives), `evidential` (belief masses), `gametheory` (payoffMatrix.entries), `historical` (episodes), `optimization` (alternatives), `stochastic` (samples)
- **Moderate** (tabular subsection exists but prose is the main artifact; CSV captures a secondary view): `analogical` (mappings), `analysis` (layers), `argumentation` (warrants, grounds, backings, qualifiers, rebuttals — five tables per thought), `causal` (causalChain), `counterfactual` (outcomes), `critique` (strengths/weaknesses/socraticQuestions — three tables), `cryptanalytic` (patterns), `formallogic` (premises), `inductive` (observations), `mathematics` (proofSteps), `modal` (possibleWorlds), `recursive` (cases), `scientificmethod` (experiments, predictions), `synthesis` (sources, convergence, divergence), `systemsthinking` (feedbackLoops, archetypes), `temporal` (events, intervals), `computability` (decisionSteps)
- **Fallback** (no primary tabular field — emit 2-column `field,value` representation of top-level fields): `algorithmic`, `deductive`, `firstprinciples`, `hybrid`, `metareasoning`, `physics`, `sequential`, `shannon`

**Verification step for the subagent:** before committing the tier assignment for a specific mode, open `test/schemas/<mode>.json` and scan for array-valued fields at the top level. If there's a wide array of objects (≥3 properties per object), the mode is Excellent or Moderate. If only prose / scalar fields exist, it's Fallback. The initial tier assignment above is the best-effort baseline; correct any misplacements discovered during verification.

**Coverage assertion:** after writing this section, count the mode slugs mentioned. The count MUST equal 34 exactly. If it doesn't, add any missing modes to the Fallback tier.

**Section 6: `## Rendering Tools`** (~5 lines)

- **Excel / LibreOffice Calc** — open directly
- **Python pandas** — `pd.read_csv('<file>.csv')`
- **R** — `read.csv('<file>.csv')`
- **Database import** — MySQL `LOAD DATA INFILE`, PostgreSQL `COPY`, SQLite `.import`
- **jq preprocessing** — if you want to convert a thought JSON to CSV via jq instead of using this grammar, see `jq '.evidence | (.[0] | keys_unsorted) as $cols | $cols, map([.[ $cols[] ]])[] | @csv'`

**Acceptance criteria:**

1. File exists at `reference/visual-grammar/formats/csv.md`.
2. File contains all 4 required sections plus the two new sections (`Per-Mode Flattening Rules`, `Rendering Tools`).
3. File size is ≥ 400 bytes (likely closer to 3000-4000 bytes given the per-mode rules table).
4. Worked example is a syntactically valid RFC 4180 CSV.
5. Per-mode rules cover all 34 canonical modes (verify by listing them against `test/schemas/*.json`).

**Deliverable:**

New file `reference/visual-grammar/formats/csv.md`. Commit message: `feat(format): add csv grammar with per-mode flattening rules`.

---

### T6 — Parallelize `test/smoke/run-all-modes.py`

**Wave:** 1
**Model:** opus (complex refactor with concurrency, error handling, and preservation of behavior)
**Files modified:** `test/smoke/run-all-modes.py`
**Files read:** `test/smoke/run-all-modes.py` (current version, ~219 lines — verify with `wc -l` before editing in case of drift)

**Current state:**

`test/smoke/run-all-modes.py` (219 lines as of v0.4.1) runs 34 modes **sequentially**, each invoking `claude --bare -p "/deepthinking-plugin:think <mode> '<prompt>'"` in a subprocess with a configurable timeout (default 180s, override via `SMOKE_TIMEOUT`). Total wall-clock for all 34 modes: **30–60 minutes** (longer because 9 complex modes need 300–420s).

The current loop structure (around line 148–210):

```python
if SINGLE_MODE:
    prompts = [p for p in prompts if p["mode"] == SINGLE_MODE]
    if not prompts:
        print(f"ERROR: no prompt for mode '{SINGLE_MODE}'")
        ...

results = []
for entry in prompts:
    # run single mode, append (mode, ok, reason) to results
    ...

# Summary and exit
for mode, ok, reason in results:
    print(...)
```

**Goal:**

Refactor the main loop to use `concurrent.futures.ThreadPoolExecutor` with a configurable worker count (default 4, override via `SMOKE_WORKERS=N`). Preserve all existing behavior: per-mode timeouts, JSON repair attribution, stderr capture, captured-output file writing, single-mode mode (`SMOKE_MODE=bayesian`), and deterministic summary output (results should print in mode-name order, not completion order).

**Implementation guidance:**

1. **Extract the per-mode execution into a function.** Currently the loop body is ~40 lines of subprocess + JSON extraction + schema validation + file writing. Pull this into `run_single_mode(entry: dict) -> tuple[str, bool, str]` returning `(mode, ok, reason)`.

2. **Add `SMOKE_WORKERS` env var.** Default to 4. Cap at 8 (running more than 8 concurrent `claude -p` subprocesses is likely to hit API rate limits or local CPU saturation).

3. **Dispatch via `ThreadPoolExecutor`.** Each mode is an independent subprocess, so threads (not processes) are sufficient — the GIL doesn't matter here because all the work is subprocess-bound. Use `futures.as_completed` to get results as they finish, but collect into a dict keyed by mode so the final printout can be sorted.

4. **Preserve live progress output.** Print a progress line each time a mode completes (e.g., `[ 3/34] bayesian: PASS`). Include a worker count in the startup banner (`Running 34 modes with 4 parallel workers (SMOKE_WORKERS=4)...`).

5. **Handle single-mode mode correctly.** If `SMOKE_MODE=bayesian`, skip the executor entirely and call `run_single_mode` directly (no point in a 1-worker pool).

6. **Preserve deterministic summary ordering.** After all futures complete, iterate `sorted(results.keys())` and print results in alphabetical mode order, not completion order. This keeps CI logs diffable.

7. **Graceful shutdown on Ctrl+C.** `ThreadPoolExecutor` does NOT interrupt running futures on exception — document this in a comment. If the user Ctrl+Cs, in-flight subprocesses will finish before the process exits. This is acceptable behavior but should be called out.

8. **Don't break the `repair_lone_backslashes` attribution.** The current code reports `PASS (with backslash repair — JSON escape bug in model output)` when the repair fires. Preserve this in `run_single_mode`'s returned `reason` string.

9. **Don't break `captured/` file writes.** Each mode writes three files (`<mode>-raw.txt`, `<mode>-parsed.json`, `<mode>-stderr.txt`). Make sure the function still writes them; verify after the refactor by running `SMOKE_MODE=bayesian python test/smoke/run-all-modes.py` and confirming the captured files exist.

10. **Wall-clock improvement is advisory, not a gate.** The expected improvement is 25-50% of baseline, but wall-clock depends on network/API latency and local CPU conditions. **Do NOT run the full sequential baseline as part of the task** — that would double the task's wall-clock. Instead: spot-check by running `SMOKE_MODE=bayesian python test/smoke/run-all-modes.py` (which exercises the single-mode path) and `SMOKE_WORKERS=1 SMOKE_MODE=bayesian python test/smoke/run-all-modes.py` (which exercises the sequential escape hatch). Neither of these runs the full 34-mode suite. The actual wall-clock improvement will be measured during T15 (the release-gate smoke run), which runs once anyway.

**Acceptance criteria (mechanical — all can be verified without running the full suite):**

1. `SMOKE_MODE=bayesian python test/smoke/run-all-modes.py` (default workers) still works — exits 0 and produces `captured/bayesian-*.txt` files.
2. `SMOKE_MODE=bayesian SMOKE_WORKERS=1 python test/smoke/run-all-modes.py` still works — the escape hatch degrades cleanly to sequential.
3. `SMOKE_TIMEOUT=420 SMOKE_MODE=physics python test/smoke/run-all-modes.py` still works — per-mode timeout override is preserved.
4. Reading the final summary output of the single-mode run shows `Running 1 mode with N parallel workers (SMOKE_WORKERS=N)...` (confirms the banner displays worker count).
5. `test/smoke/captured/` contains `<mode>-raw.txt`, `<mode>-parsed.json`, and `<mode>-stderr.txt` for the mode that ran.
6. Total LOC delta: ~+60-80 LOC (imports for `concurrent.futures`, `SMOKE_WORKERS` env var, `run_single_mode` extraction, executor block, ordered summary, inline comments on concurrency control flow).
7. No test in the fast suite (`python test/test_*.py` files) regresses after the change — the smoke runner is not tested by those files, but they should not break in any indirect way.

**Advisory (not a gate):** when T15 runs the full smoke suite during the release gate, record the wall-clock in the commit message so future releases can compare. If T15's wall-clock is NOT materially faster than v0.4.1's 30-60 min baseline, file a post-release issue for investigation but do NOT block the release.

**Rollback:**

If T6 introduces a bug that breaks smoke tests, revert with:
```bash
git revert <commit-hash-for-T6>
git commit --amend -m "revert: smoke parallelization — preserving sequential path until fix"
```
After revert, `test/smoke/run-all-modes.py` returns to its pre-T6 sequential form and smoke tests should pass. Then re-run T15 with the sequential version. File a follow-up issue with the failure details captured from `test/smoke/captured/` at the time of the bug.

**Deliverable:**

Modified `test/smoke/run-all-modes.py` with parallel execution. Commit message: `perf(smoke): parallelize run-all-modes.py with ThreadPoolExecutor (4 workers default)`.

**Note to the subagent:** this is the highest-risk task in Wave 1. Take extra care not to break the existing single-mode path or the JSON repair attribution. If in doubt, add more inline comments explaining the concurrent control flow. **Wall-clock is T6's dominant cost in Wave 1**: effort is Medium-Large (~60-90 minutes of focused work for refactor + smoke mode verification, not full suite). If Wave 1 takes longer than expected, T6 is almost certainly the reason.

---

### T7 — Update `test_format_grammars.py` `EXPECTED_FORMATS`

**Wave:** 2 (depends on T4 and T5)
**Model:** haiku (mechanical set addition)
**Files modified:** `test/test_format_grammars.py`

**Current state:**

`test/test_format_grammars.py` line 27–37 defines `EXPECTED_FORMATS` as a set of 9 string literals. The test verifies the filesystem's `reference/visual-grammar/formats/` directory matches this set exactly.

**Goal:**

Add `"csv"` and `"latex-math"` to the set. Nothing else changes.

**Implementation guidance:**

```python
EXPECTED_FORMATS = {
    "ascii",
    "csv",           # NEW in v0.5.0
    "dashboard",
    "graphml",
    "html",
    "json",
    "latex-math",    # NEW in v0.5.0
    "markdown",
    "modelica",
    "tikz",
    "uml",
}
```

Keep alphabetical order. The comment `# NEW in v0.5.0` is optional but helpful for future audit.

**Acceptance criteria:**

1. `python test/test_format_grammars.py` exits 0.
2. The summary line prints `All 11 mode-agnostic format grammars have required structure` (the count was 9 before v0.5.0; v0.5.0 adds 2 grammar files → 11 mode-agnostic grammars; the effective total including per-mode mermaid+dot is 13, but `test_format_grammars.py` only tests the mode-agnostic subset, so the summary reports 11, not 13).
3. Both new format files (`csv.md` and `latex-math.md`) from T4 and T5 must exist before this test passes — this task belongs to Wave 2 specifically because of that ordering constraint.

**Deliverable:**

Modified `test/test_format_grammars.py`. Commit message: `test(formats): add csv and latex-math to EXPECTED_FORMATS`.

---

### T8 — Update `commands/think-render.md` format list

**Wave:** 2 (depends on T4 and T5)
**Model:** haiku (mechanical string list update)
**Files modified:** `commands/think-render.md`

**Current state:**

`commands/think-render.md` lists accepted format values in two places:

1. The `description` field in frontmatter: `"... where format is mermaid, dot, ascii, json, markdown, graphml, html, tikz, uml, modelica, dashboard, svg, or png (defaults to mermaid)."`
2. The `argument-hint` field: `"[mermaid|dot|ascii|json|markdown|graphml|html|tikz|uml|modelica|dashboard|svg|png]"`
3. The body step 3 listing `Accepted values (all 13):` with a categorized breakdown by rendering path.

**Goal:**

Add `latex-math` and `csv` everywhere the current 13 formats are listed. Update the `(all 13)` count to `(all 15)`.

**Implementation guidance:**

1. In the `description`: insert `latex-math, csv, ` before `svg` so the reading order is: direct-generation formats → script-rendered → interactive.
2. In the `argument-hint`: insert `|latex-math|csv` before `|svg`.
3. In the body's "Accepted values" list: add `latex-math` and `csv` to the "Direct Claude generation" bullet (the first category). Change "all 13" to "all 15".

**Acceptance criteria:**

1. Frontmatter `description` contains `latex-math` and `csv` substrings.
2. Frontmatter `argument-hint` contains `latex-math` and `csv`.
3. Body says `all 15` not `all 13`.
4. Alphabetical order is NOT required — the existing ordering is chosen for reading flow; preserve it.

**Deliverable:**

Modified `commands/think-render.md`. Commit message: `docs(think-render): add latex-math and csv to format list`.

---

### T9 — Update `agents/visual-exporter.md` format list

**Wave:** 2 (depends on T4 and T5)
**Model:** haiku (mechanical string list update)
**Files modified:** `agents/visual-exporter.md`

**Current state:**

`agents/visual-exporter.md` frontmatter `description` field mentions "Supports 11 formats: mermaid, dot, ascii, json, markdown, graphml, html, tikz, uml, modelica, and dashboard (interactive HTML).". The body's "Your Inputs" section has the same list.

**Goal:**

Update the description and body to list 13 formats, adding `latex-math` and `csv`.

**Implementation guidance:**

1. In `description`: change `Supports 11 formats:` to `Supports 13 formats:` and add `latex-math, csv,` before `dashboard`.
2. In the body's "Your Inputs" section (step 2): same update.
3. In the body's step 6 "For X formats emit source directly" list: add `latex-math` and `csv` to the list of direct-emit formats.

**Acceptance criteria:**

1. `description` says `Supports 13 formats`.
2. Body step 2 lists 13 formats.
3. Body step 6 includes `latex-math` and `csv` in the direct-emit list.

**Deliverable:**

Modified `agents/visual-exporter.md`. Commit message: `docs(visual-exporter): expand format list to 13 (add latex-math, csv)`.

---

### T10 — Update `README.md` format table

**Wave:** 2 (depends on T4 and T5)
**Model:** haiku (mechanical table update)
**Files modified:** `README.md`

**Current state:**

`README.md` has a section heading `### All 11 export formats (v0.4.0+)` with a table that lists 11 formats, one per row, with columns `| Format | Source | Consumers |`.

**Goal:**

Update the heading to `### All 13 export formats (v0.5.0+)`. Add two new table rows for `latex-math` and `csv` in the right positions.

**Implementation guidance:**

Insert two new rows after the existing `dashboard` row. Use this content:

```markdown
| `latex-math` | format grammar | Overleaf, pdflatex, MathJax/KaTeX, academic papers |
| `csv` | format grammar | Excel, R, pandas, databases, jq |
```

Also update the Status line at the top of the README if it mentions "11 output formats": change to "13 output formats" (or whichever phrasing currently exists — spot-check the first 20 lines of the README).

**Acceptance criteria:**

1. Heading reads `All 13 export formats`.
2. Table has 13 data rows (one per format).
3. Status line at the top also reflects the new count if it mentions formats.

**Deliverable:**

Modified `README.md`. Commit message: `docs(readme): update format table to 13 formats`.

---

### T11 — Update `CLAUDE.md` format count

**Wave:** 2 (depends on T4 and T5)
**Model:** haiku (mechanical count updates)
**Files modified:** `CLAUDE.md`

**Current state:**

`CLAUDE.md` mentions format counts in a few places. Grep for `11 format` and `9 mode-agnostic` to find them. The canonical sentences to update:

- "9 mode-agnostic format grammars (v0.4.1)" → `11 mode-agnostic format grammars (v0.5.0)`
- Any "11 export formats" mentions → "13 export formats"
- Any "(v0.4.1)" stamps adjacent to format counts → "(v0.5.0)"

**Goal:**

Update CLAUDE.md's format-count references to reflect the v0.5.0 state. Do NOT change mode-count references (still 34).

**Implementation guidance:**

```bash
# Before editing, grep to find all format-count mentions:
grep -n "11 format\|9 mode-agnostic\|11 export format" CLAUDE.md
```

Apply targeted edits to each match. Keep the existing section structure; do not reorganize.

**Acceptance criteria:**

1. No mention of "11 format" or "9 mode-agnostic format grammars" remains.
2. New format count mentions show 13 (or 11 mode-agnostic + 2 per-mode).
3. Version stamp where applicable is updated to v0.5.0.
4. Mode count (34) is NOT changed.

**Deliverable:**

Modified `CLAUDE.md`. Commit message: `docs(claude-md): update format count to 13 for v0.5.0`.

---

### T13 — CHANGELOG `[Unreleased]` → `[0.5.0]` (runs BEFORE T12)

**Wave:** 3 (release gate, sequential — this is the FIRST release-gate task, not the second)
**Model:** sonnet (prose synthesis)
**Files modified:** `CHANGELOG.md`

**Why this runs before T12:** T2's `test_version_consistency.py` (created in Wave 1) verifies that `plugin.json.version` matches the first real (non-Unreleased) CHANGELOG heading. If T12 runs first, the consistency test would fail on T12's completion because CHANGELOG would still say `[Unreleased]` at the top. Running T13 first avoids this race.

**Goal:**

Promote the `[Unreleased]` section to a proper `[0.5.0] - 2026-04-XX` release entry. Add a summary paragraph at the top explaining what v0.5.0 ships (format expansion + quality infrastructure, no mode changes). Start a new empty `[Unreleased]` section above it.

**Acceptance criteria:**

1. `CHANGELOG.md` has both `## [Unreleased]` (empty or containing deferred items from the Gate 2 budget cap) AND `## [0.5.0] - 2026-04-XX` sections, in that order (Unreleased is above 0.5.0).
2. The v0.5.0 section documents all T1-T11 changes with concrete file references.
3. Release date is today's actual date (the date T13 executes on, not the date the plan was written).
4. The summary paragraph is 2-4 sentences.

**Deliverable:** Modified `CHANGELOG.md`. Commit message: `chore: finalize CHANGELOG for v0.5.0 release`.

---

### T12 — Bump `.claude-plugin/plugin.json` to 0.5.0 (runs AFTER T13)

**Wave:** 3 (release gate, sequential — runs second, after T13 promotes the CHANGELOG heading)
**Model:** haiku (one-line JSON edit)
**Files modified:** `.claude-plugin/plugin.json`

**Goal:**

Change `"version": "0.4.1"` to `"version": "0.5.0"`. Nothing else.

**Acceptance criteria:**

1. `python test/test_plugin_json.py` passes.
2. `python test/test_version_consistency.py` (created in T2) passes — this verifies that the version bump is coherent with the CHANGELOG heading just promoted by T13, plus any README / SKILL.md version stamps.

**Deliverable:** Modified `.claude-plugin/plugin.json`. Commit message: `chore: bump version to 0.5.0`.

---

### T14 — Run full fast test suite

**Wave:** 3 (sequential, controller-run)
**Tool:** Bash
**Files:** none (read-only verification)

**Goal:**

Run every fast test and confirm they all pass.

**Commands:**

```bash
python test/test_plugin_json.py
python test/test_skill_frontmatter.py
python test/test_artifact_consistency.py
python test/test_format_grammars.py
python test/test_version_consistency.py   # NEW from T2
python test/harness.py
python test/visual/validate-mermaid.py
python test/visual/validate-dot.py
python test/visual/test-dashboard.py
```

**Acceptance criteria:**

1. All 9 tests exit 0.
2. Total wall-clock < 30 seconds.
3. `test_format_grammars.py` summary says `All 11 format grammars have required structure`.
4. `test_artifact_consistency.py` includes the new `MODE_DISPLAY_NAMES` check in its output.

**If any test fails:** Do NOT proceed to T15. Return to the failing task (T1-T11) and fix the root cause. Re-run T14 after fixing.

---

### T15 — Run full smoke suite

**Wave:** 3 (sequential, controller-run)
**Tool:** Bash
**Files:** none (read-only verification)

**Goal:**

Run `python test/smoke/run-all-modes.py` with 4 parallel workers (default, after T6 parallelization) and verify all 34 modes pass schema validation.

**Commands:**

```bash
python test/smoke/run-all-modes.py                # default SMOKE_WORKERS=4
# Expected wall-clock: 10-15 minutes (was 30-60 sequential)
```

**Acceptance criteria:**

1. All 34 modes return PASS.
2. Total wall-clock is materially less than the v0.4.1 30-60 min baseline (confirms T6 worked).
3. Zero "repair with backslash repair" incidents OR, if there are any, they are on the known math-heavy modes (physics, mathematics, formallogic) and the passed count is still 34.

**If any mode fails:** Debug the individual mode with `SMOKE_MODE=<mode> python test/smoke/run-all-modes.py`. Check captured output at `test/smoke/captured/<mode>-raw.txt` for the actual Claude response. If the failure is a schema drift caused by a v0.5.0 change, fix the schema; if it's a flake, re-run; if it's a genuine bug, debug the relevant skill's SKILL.md.

---

### T16 — Git tag + GitHub release

**Wave:** 3 (sequential, controller-run)
**Tool:** Bash + gh
**Files:** none (tag creation)

**Goal:**

Create the `v0.5.0` git tag and GitHub release with release notes sourced from the new CHANGELOG `[0.5.0]` section.

**Commands:**

```bash
# Verify master is clean and all commits from Waves 1+2+3 are pushed
git status -s  # should be empty
git log --oneline -20  # visually verify commits land in expected order

# Create the annotated tag
git tag -a v0.5.0 -m "v0.5.0 — Format expansion (latex-math, csv) + quality infrastructure"

# Push the tag
git push origin master --tags

# Create the GitHub release (pull release notes from CHANGELOG [0.5.0] section)
gh release create v0.5.0 \
    --title "v0.5.0 — Format expansion + quality infrastructure" \
    --notes "$(awk '/^## \[0.5.0\]/,/^## \[/' CHANGELOG.md | head -n -1)" \
    --latest
```

**Acceptance criteria:**

1. `git tag -l v0.5.0` returns a tag.
2. `gh release list` shows v0.5.0 marked as Latest.
3. The GitHub release page body contains the full v0.5.0 CHANGELOG section.
4. Tag and release are published to `https://github.com/danielsimonjr/deepthinking-plugin/releases/tag/v0.5.0`.

## Parallel execution model

### How to dispatch Wave 1

Use the `Agent` tool with `subagent_type: general-purpose` (or a dedicated specialist if one exists for the task type). Dispatch all **5** tasks (T1, T2, T4, T5, T6) in a **single message** with 5 parallel tool calls. The harness executes them concurrently.

Note the model selection per task: T1 → sonnet, T2 → sonnet, T4 → opus, T5 → opus, T6 → opus. The three Opus tasks are the ones carrying the Wave 1 wall-clock budget.

For each task, the subagent prompt must include the full task specification from this document (verbatim, copy-paste the relevant T1/T2/T4/T5/T6 section) plus this preamble:

```
You are working on the deepthinking-plugin repo at C:/Users/danie/Dropbox/Github/deepthinking-plugin/. Your task is ONE of the 16 tasks in docs/PLAN-v0.5.0.md. Do ONLY your assigned task. Do NOT touch any file not explicitly mentioned in your task description. When done, commit your change with the specified commit message and return a summary of what you did in under 200 words.

Your task is: <paste the relevant T1/T2/T4/T5/T6 section verbatim here>
```

After Wave 1 dispatch, **wait for all 5 agents to return** (success OR failure) before proceeding. The controller blocks synchronously on the Agent tool results — this is Python's `as_completed` pattern. Do not start Wave 2 while Wave 1 is still in flight.

**If any Wave 1 agent returns failure**, apply the crash recovery protocol documented in "Wave 1 — Parallel, 5 independent tasks" above.

### How to dispatch Wave 2

Pre-flight check first (controller runs these commands before dispatching):

```bash
test -f reference/visual-grammar/formats/latex-math.md && test $(wc -c < reference/visual-grammar/formats/latex-math.md) -ge 400 || echo "FAIL: latex-math missing or too small"
test -f reference/visual-grammar/formats/csv.md         && test $(wc -c < reference/visual-grammar/formats/csv.md)         -ge 400 || echo "FAIL: csv missing or too small"
```

If either check prints FAIL, abort Wave 2 and return to Wave 1 crash recovery.

Otherwise, dispatch all **6** tasks (T3, T7, T8, T9, T10, T11) in a **single message** with 6 parallel tool calls. All 6 are haiku-model mechanical edits. Each Wave 2 agent should also verify at the start of its task that `latex-math.md` and `csv.md` exist — defense in depth.

### Wave 3 — Controller-executed, sequential

Wave 3 is NOT dispatched to subagents. The controller executes T12-T16 directly. This is because the release gate involves cross-task verification (T14 depends on Wave 1+2, T15 depends on T14, etc.) and giving each step its own subagent context would be wasteful.

### Total wall-clock estimate

| Wave | Parallelism | Dominant task | Est. wall-clock |
|---|---|---|---|
| Wave 1 | 5-way parallel | T6 (smoke parallelization refactor, Opus), with T4 and T5 (Opus content authoring) running alongside | 60–90 min |
| Wait for Wave 1 | — | Synchronous barrier (controller blocks on all 5 Agent results) | 0 min |
| Pre-flight check | — | `wc -c` on new format files | ~1 min |
| Wave 2 | 6-way parallel | T3 + 5 cascade tasks, all haiku-model mechanical edits | 5–10 min |
| Wait for Wave 2 | — | Synchronous barrier | 0 min |
| Wave 3 | Sequential | T15 (smoke suite, wall-bound) | 30–40 min (the parallelized smoke run is 10–15 min; 15–20 min buffer for fix cycles if any tests fail) |
| **Total** | — | — | **95–140 minutes** |

Compared to executing all 16 tasks sequentially by a single engineer (~6–8 hours), the agent-driven wave structure compresses to roughly **1.5–2.5 hours** wall-clock.

## Review gates

Per the milestone-review workflow in `memory/feedback_milestone_review_workflow.md` (maintainer-private), every change goes through a review team pass before merge. For this v0.5.0 plan, the review gates are:

### Gate 1 — After Wave 1 dispatch completes

Run a **light review** on each Wave 1 task's commit. For T1, T2, T6 (the higher-risk tasks), dispatch a single `llm_query` Sonnet reviewer per task with a targeted prompt: "Did the subagent follow the spec? Are there any obvious errors?" For T3, T4, T5 (content authoring), spot-check by reading the file.

### Gate 2 — After Wave 2 dispatch completes

Run the **full 5-specialist review team** on the cumulative diff (everything from Waves 1+2). Use the standard team: Opus architect + Opus adversary + Sonnet technical + Sonnet domain + Sonnet editorial. Dispatch via `llm_query` with the current `CHANGELOG.md`, the full diff from `git diff master~11..master`, and the final state of each modified file.

**Budget cap (prevents scope explosion):**

The workflow rule says "fix all issues regardless of scale", but scale without a budget can cascade. Apply this triage rule:

- **Critical findings** (broken execution, factually wrong, would make the release fail) → **fix immediately** before Wave 3.
- **High findings** → fix immediately before Wave 3, but if the high-severity count exceeds **5**, stop and escalate to the user. 5 High findings usually means something is structurally wrong with the diff and needs a human decision about scope.
- **Medium findings** → fix during Wave 3 if time permits, otherwise defer to a `v0.5.1` patch release. Document each deferred finding in the v0.5.1 section of CHANGELOG `[Unreleased]` so nothing is lost.
- **Low findings** → defer to `v0.5.1` unless trivially fixable (single-line edits).

**Escalation criterion:** if the review team produces **more than 10 High-or-Critical findings total**, or if any finding says "the release should not ship", pause Wave 3 and return control to the user with a summary of the findings. The user decides whether to fix-and-proceed, roll back, or re-scope.

This budget cap respects both the "fix everything" rule AND the reality that a high-finding review (e.g., 90+ findings) cannot be addressed in the same release cycle without pushing out the schedule indefinitely.

### Gate 3 — After Wave 3 (release gate)

Run the **HonestClaude verification pass** on the final v0.5.0 state. Verify:

1. All numeric claims in CHANGELOG match reality (118 → 120+ checks, 11 → 13 formats, etc.)
2. All file path references resolve
3. The new format grammar files have the required sections
4. `test_version_consistency.py` passes (catching any missed version refs)

Apply any real findings, then proceed to T16 (tag + release).

## Release gate — definition of done

v0.5.0 is done when:

1. All 16 tasks have been executed and committed.
2. Wave 1 + Wave 2 + Wave 3 commits are pushed to `origin/master`.
3. The fast test suite passes (T14).
4. The smoke test suite passes with all 34 modes green (T15).
5. Review team Gate 2 findings have been applied.
6. HonestClaude Gate 3 findings have been applied.
7. The `v0.5.0` git tag exists and is pushed.
8. The GitHub release at `https://github.com/danielsimonjr/deepthinking-plugin/releases/tag/v0.5.0` is marked as Latest.
9. The CHANGELOG has a new empty `[Unreleased]` section above the finalized `[0.5.0]` section.

## Rollback plan

**Per-task rollback:**

- **T1 (consistency check)** — revert the commit that added the `MODE_DISPLAY_NAMES` check. Leaves the existing 5 checks intact.
- **T2 (version consistency)** — delete `test/test_version_consistency.py`. No other file depends on it.
- **T3 (think-render alias)** — delete `examples/personal-command-alias/think-render.md`. No other file references it.
- **T4 (latex-math grammar)** — delete `reference/visual-grammar/formats/latex-math.md` AND revert T7 (`EXPECTED_FORMATS`), T8, T9, T10, T11 to restore consistency.
- **T5 (csv grammar)** — same as T4 but for `csv.md`.
- **T6 (smoke parallelization)** — revert the commit. The previous sequential version is preserved in git history. Single-mode and timeout env vars must continue to work after revert.
- **T12-T16 (release)** — if release needs to be rolled back AFTER tagging: delete the tag with `git tag -d v0.5.0 && git push origin :refs/tags/v0.5.0`, delete the GitHub release with `gh release delete v0.5.0`, revert the version bump commit. This is destructive — confirm with the user before doing it.

**Full-revert** (nuclear option):

```bash
# Find the last commit before v0.5.0 work started
git log --oneline --all | grep -B1 "first v0.5.0 task"
# Hard-reset to that commit (DESTROYS unpushed work)
git reset --hard <hash>
# Force-push (requires explicit user approval)
git push origin master --force-with-lease
```

**Never force-push master without explicit user approval.** The full-revert is listed for completeness but should be a last resort.

## Appendix: Why this plan rejected alternatives

### Why not add `decisionanalysis` mode to v0.5.0?

The roadmap's 3-round review concluded that `decisionanalysis` is in Tier 2 (held), not Tier 1. The Opus adversary argued its schema sketch is a union of fields from `bayesian` + `gametheory` + `optimization`, and that the "is this actually distinct?" test (which caught `toulmin` and `socratic`) also applies here. The architect disagreed but agreed that a **design spike** should precede any implementation. This plan defers to the stricter interpretation: no new mode without a worked example that proves distinctness.

### Why not also add `pdf` or `plantuml` formats?

Both are Tier 2 in the roadmap, meaning they're plausible but lack a concrete consumer request. Adding them without a user asking for them violates the "fix all issues regardless of scale" workflow rule in the opposite direction — it ships speculative work. The plan restricts v0.5.0 to the two Tier 1 formats that survived all three review rounds with concrete rationale.

### Why do quality-infrastructure items (T1, T2, T6) belong in a "format release"?

Strictly, they don't. They are quality debt paydown that could ship as a separate v0.4.2 patch release. But: they are independent of the format work, they have no risk of interfering with it (touch different files), and bundling them avoids the cost of running two separate release cycles. This is the same bundling rationale as the v0.4.1 release (security fixes + test coverage + stale docs all shipped together because they were independent).

### Why is Wave 2 separate from Wave 1?

Wave 2 tasks modify files that reference the new format grammars. They CANNOT start until the grammar files exist (the `test_format_grammars.py` check would fail, the README update would look wrong if the files don't yet exist, etc.). Running Wave 1 and Wave 2 simultaneously would not be faster — Wave 2 tasks would block waiting for T4 and T5 anyway. The two-wave structure is a **synchronization barrier**, not a missed parallelism opportunity.
