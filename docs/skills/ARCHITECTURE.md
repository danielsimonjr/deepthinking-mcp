# deepthinking-plugin — Architecture

A map for contributors. The plugin has three layers: **reasoning skills**, **output-format grammars**, and **runtime helpers**. They are deliberately decoupled — you can add a mode, a format, or a test without touching the others.

## High-level layout

```
deepthinking-plugin/
├── .claude-plugin/plugin.json        # manifest
├── commands/                         # user-facing slash commands
│   ├── think.md                      #   /think [mode] "<problem>"
│   └── think-render.md               #   /think-render [format]
├── agents/
│   └── visual-exporter.md            # subagent: thought JSON → diagram source
├── skills/
│   ├── think/
│   │   ├── SKILL.md                  # the router (all 46 modes listed)
│   │   └── mode-index.md             # auto-recommend decision tree
│   ├── think-core/SKILL.md           # inductive, deductive, abductive
│   ├── think-standard/SKILL.md       # sequential, shannon, hybrid
│   ├── think-mathematics/SKILL.md    # mathematics, physics, computability
│   ├── think-temporal/SKILL.md       # temporal, historical
│   ├── think-probabilistic/SKILL.md  # bayesian, evidential
│   ├── think-causal/SKILL.md         # causal, counterfactual
│   ├── think-strategic/SKILL.md      # gametheory, optimization, constraint
│   ├── think-analytical/SKILL.md     # analogical, firstprinciples, metareasoning, cryptanalytic
│   ├── think-scientific/SKILL.md     # scientificmethod, systemsthinking, formallogic
│   ├── think-engineering/SKILL.md    # engineering, algorithmic
│   ├── think-academic/SKILL.md       # synthesis, argumentation, critique, analysis
│   ├── think-advanced/SKILL.md       # recursive, modal, stochastic
│   └── think-frameworks/SKILL.md     # 5w1h, swot, fivewhys, fishbone, pestle, forcefield,
│                                      #   decisionmatrix, pareto, stakeholder, costbenefit,
│                                      #   riskassessment, gapanalysis
├── reference/
│   ├── taxonomy.md                   # canonical mode taxonomy (signals, anti-signals)
│   ├── visual-grammar.md             # shared visual conventions (shapes, colors, edges)
│   ├── visual-grammar/
│   │   ├── <mode>.md × 46            # per-mode semantic grammar (Mermaid + DOT)
│   │   └── formats/
│   │       └── <format>.md × 9       # per-format surface syntax (ascii, json, …)
│   ├── output-formats/
│   │   └── <mode>.md × 46            # authoritative JSON schema + worked example per mode
│   └── html-dashboard-template.html  # interactive dashboard template
├── scripts/
│   ├── render-diagram.py             # wraps graphviz `dot` + mermaid `mmdc`
│   └── render-html-dashboard.py      # renders thought → standalone HTML file
├── test/
│   ├── schemas/<mode>.json × 46      # JSON Schema per mode
│   ├── samples/<mode>-valid.json × 46
│   ├── samples/<mode>-invalid.json × 6+  # negative tests for key schemas
│   ├── harness.py                    # schema validation
│   ├── test_plugin_json.py           # manifest validation
│   ├── test_skill_frontmatter.py     # SKILL.md frontmatter
│   ├── test_artifact_consistency.py  # set-equality across mode-scoped dirs
│   ├── test_format_grammars.py       # per-format grammar structure
│   ├── visual/
│   │   ├── validate-mermaid.py
│   │   ├── validate-dot.py
│   │   └── test-dashboard.py
│   └── smoke/
│       ├── prompts.json              # one realistic prompt per mode
│       ├── run-all-modes.py          # headless claude -p smoke test
│       ├── router-prompts.json       # auto-recommend test prompts
│       └── run-router-tests.py       # auto-recommend smoke test
├── examples/
│   └── personal-command-alias/       # optional /think → /deepthinking-plugin:think alias
├── README.md
├── CHANGELOG.md
└── ARCHITECTURE.md                   # this file
```

## The three layers

### 1. Reasoning skills (what a mode *means*)

`skills/<category>/SKILL.md` files teach Claude how to reason in each mode. They are authored prose plus YAML frontmatter. They contain:

- **When to use / When NOT to use** — actionable triggers and anti-triggers
- **How to reason** — a numbered procedure the model follows
- **Quick template** — a JSON skeleton showing required and optional fields
- **Verification checklist** — pre-output sanity checks specific to the mode
- **Worked example** — realistic input → full structured output

Category skills group 2-4 closely related modes (the `think-frameworks` category groups all 12 of its analytical-framework modes). The **router skill** (`skills/think/SKILL.md`) owns the full 46-mode table and decides which category skill to load.

### 2. Output-format grammars (what a mode's output *looks like*)

Reasoning is decoupled from visualization via two kinds of grammar:

- **Per-mode semantic grammar** at `reference/visual-grammar/<mode>.md` — defines the node/edge structure specific to each mode (e.g., Bayesian: hypothesis is root, evidence nodes point to it with likelihood ratios on edges). Contains one Mermaid template and one DOT template with worked examples.
- **Per-format surface syntax** at `reference/visual-grammar/formats/<format>.md` — defines how to encode ANY mode's semantic structure into that format (e.g., GraphML: use `<node>`/`<edge>` with `<data>` children for attributes). Contains shared encoding rules applicable across all 46 modes.

The `visual-exporter` agent combines both: it reads the mode's semantic grammar to know WHAT to encode, and the format's surface grammar to know HOW.

### 3. Runtime helpers

- `scripts/render-diagram.py` wraps `dot` (graphviz) and `mmdc` (mermaid-cli) for SVG/PNG rendering. Exits 127 if the binary is missing, or 2 with `--allow-skip` for graceful degradation.
- `scripts/render-html-dashboard.py` injects thought JSON and Mermaid source into `reference/html-dashboard-template.html`. HTML-escapes all user-supplied content; validates output paths stay under cwd or tempdir.

## Invocation flow

### `/think [mode] "<problem>"`

```
1. User → /think bayesian "Is X caused by Y?"
2. Claude Code loads commands/think.md → expands $ARGUMENTS
3. The command body instructs Claude to load skills/think/SKILL.md (router)
4. Router looks up mode in the 46-row table → delegates to skills/think-probabilistic/SKILL.md
5. Category skill teaches the method → Claude produces a structured JSON thought
6. Output: meta sentence + JSON code block + natural-language summary
```

### `/think "<problem>"` (auto-recommend)

Same flow as above, but step 4 consults `skills/think/mode-index.md`'s decision tree to pick a mode based on problem signals (e.g., "multiple observations provided" → `inductive`; "references observations but does not provide them" → `sequential` with data-gathering first).

### `/think-render [format]`

```
1. User → /think-render dashboard
2. Claude Code loads commands/think-render.md
3. Command instructs Claude to find the most recent /think JSON block
4. Claude delegates to agents/visual-exporter.md
5. The agent reads reference/visual-grammar/<mode>.md (semantic) +
       reference/visual-grammar/formats/<format>.md (surface)
6. For Mermaid/DOT/ASCII/etc.: agent emits source directly
   For SVG/PNG: agent pipes source through scripts/render-diagram.py
   For dashboard: agent calls scripts/render-html-dashboard.py
```

## Adding a new mode

1. Create `test/schemas/<mode>.json` (the authoritative mode set is defined by this directory)
2. Create `test/samples/<mode>-valid.json` with a realistic thought
3. Create `reference/visual-grammar/<mode>.md` with Mermaid + DOT templates
4. Create `reference/output-formats/<mode>.md` with schema doc + worked example
5. Add a prompt entry to `test/smoke/prompts.json`
6. Add the mode to an existing category in `skills/think-<category>/SKILL.md` (or create a new category)
7. Add the mode to the router table in `skills/think/SKILL.md`
8. Add the mode to `skills/think/mode-index.md` (decision tree)
9. Add the mode to `reference/taxonomy.md`
10. Run `python test/test_artifact_consistency.py` — it will enforce set-equality across steps 1-5 and tell you if you missed anything.

## Adding a new export format

1. Create `reference/visual-grammar/formats/<format>.md` following the shared structure (Format Overview, Encoding Rules, Template, Worked Example, Per-Mode Considerations, Rendering Tools)
2. Add the format name to `EXPECTED_FORMATS` in `test/test_format_grammars.py`
3. Update `agents/visual-exporter.md` to list the new format
4. Update `commands/think-render.md` to accept the new format
5. Update README.md's "All 11 export formats" table

Formats are mode-agnostic. You do NOT need to create per-mode grammar files when adding a format — the visual-exporter agent combines the existing per-mode semantic grammars with the new surface-syntax grammar at runtime.

## Testing

```bash
# Fast automated (no external calls — ~5 seconds):
python test/test_plugin_json.py
python test/test_skill_frontmatter.py
python test/test_artifact_consistency.py
python test/test_format_grammars.py
python test/harness.py
python test/visual/validate-mermaid.py
python test/visual/validate-dot.py
python test/visual/test-dashboard.py

# End-to-end smoke (invokes claude -p — ~30-60 minutes full, or single-mode):
python test/smoke/run-all-modes.py          # all 46 modes
SMOKE_MODE=bayesian python test/smoke/run-all-modes.py  # just one

# Router auto-recommend tests (~20-40 minutes full):
python test/smoke/run-router-tests.py
```

## Design principles

1. **Schema is truth.** If the JSON Schema at `test/schemas/<mode>.json` rejects a thought, that's the source of truth. Skill templates, grammars, and docs all defer to the schema.
2. **Reasoning and visualization are decoupled.** Skills teach reasoning. Grammars teach rendering. Changing one does not touch the other.
3. **Auto-discovery where possible; explicit enforcement where needed.** `harness.py` auto-discovers samples; `test_artifact_consistency.py` explicitly verifies the full set. Both matter.
4. **Fail loudly.** Silent SKIPs, default fallbacks, and swallowed exceptions are avoided. When they must exist (e.g., graceful degradation in `render-diagram.py`), the contract is documented in exit codes.
5. **One reasoning model, many output formats.** Each mode produces a single JSON shape; 11 output formats (Mermaid, DOT, ASCII, JSON, Markdown, GraphML, HTML, TikZ, UML, Modelica, Dashboard) are views over that shape.

## See also

- `README.md` — user-facing install + usage
- `CHANGELOG.md` — version history
- `CONTRIBUTING.md` — contribution workflow (if present)
