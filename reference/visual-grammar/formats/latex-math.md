# Format Grammar: LaTeX Math (AMS-math)

How to encode a deepthinking-plugin thought into a LaTeX AMS-math artifact —
equations, derivations, proofs, and matrices rendered with `amsmath` and
`amssymb`. This grammar is for **mathematical typesetting**, not for vector
diagrams.

## Format Overview

`latex-math` produces a mode-agnostic, math-only LaTeX document whose body is
composed of `align*`, `gather*`, `cases`, and `intertext` blocks taken from the
math-bearing fields of a thought. It is **distinct from and complementary to
`tikz`**:

| Format       | Purpose                                   | Typical consumer                               |
|--------------|-------------------------------------------|------------------------------------------------|
| `tikz`       | Vector diagrams (graphs, trees, matrices) | Figure environments inside papers              |
| `latex-math` | Typeset equations, proofs, derivations    | Equation blocks in papers, KaTeX/MathJax pages |

The two may appear together in the same paper — `tikz` for a causal DAG
figure, `latex-math` for the Bayes posterior derivation underneath it — but
they are never interchangeable and this grammar never emits `\begin{tikzpicture}`.

**Consumers served:**

- **Academic papers** — `\input{posterior.tex}` into a section body
- **Overleaf / ShareLaTeX** — paste directly into a document
- **MathJax / KaTeX** — render the `align*` block inside HTML via `$$ ... $$`
- **GitHub-flavored markdown** — the `$$\begin{align*} ... \end{align*}$$`
  wrapper renders in README, Jupyter, and most docs sites with MathJax enabled
- **Lecture notes & textbooks** — drop into any `amsmath`-aware LaTeX workflow

**Required preamble packages:**

```latex
\usepackage{amsmath}   % align*, gather*, cases, intertext, \text, \tag
\usepackage{amssymb}   % \mathbb, \mathcal, \geq, \leq, \approx, \sim
```

Optional: `\usepackage{mathtools}` for `\mathclap`, `\coloneqq`, and starred
`\cases*`; `\usepackage{bm}` for bold math symbols.

## Encoding Rules

### 1. Extract only math-bearing fields

Scan the thought object and collect only fields that carry mathematical
content. A field is math-bearing if any of the following is true:

- The field name matches one of: `calculation`, `formula`, `equation`,
  `equations`, `derivation`, `proof`, `proofSteps`, `posterior`, `prior`,
  `likelihood`, `premise`, `premises`, `axiom`, `axioms`, `lagrangian`,
  `hamiltonian`, `objectiveFunction`, `constraint`, `constraints`,
  `invariant`, `invariants`, `haltingCondition`.
- The string value starts with `$` (e.g. `"$\int_0^1 f(x)\,dx$"`).
- The string value contains any of `=`, `\\`, `\frac`, `\sum`, `\int`,
  `\prod`, `\partial`, `\nabla`, `\otimes`, `\mathbb`, `\mathcal`, `\forall`,
  `\exists`.

Non-math fields (descriptive prose, justifications, source citations) are
**not** extracted into equation bodies. They may appear as `\intertext`
captions between equations — see rule 6.

### 2. Wrap each equation in `\begin{align*} ... \end{align*}`

Display math uses the starred AMS `align*` environment (no automatic equation
numbering; we tag manually in rule 5). When a derivation shows multiple
aligned steps, place the `&` alignment character immediately before the `=`
sign of each step so equals-signs stack vertically:

```latex
\begin{align*}
P(H \mid E) &= \frac{P(E \mid H)\,P(H)}{P(E)} \\
            &= \frac{0.9 \cdot 0.3}{0.9 \cdot 0.3 + 0.2 \cdot 0.7} \\
            &= \frac{0.27}{0.41} \\
            &\approx 0.659
\end{align*}
```

Use `gather*` instead of `align*` when equations should **not** be aligned —
e.g., a list of independent axioms.

Use `cases` (inside `align*`) when the field expresses a piecewise definition,
e.g. `recursive.haltingCondition`:

```latex
f(n) = \begin{cases}
  1               & \text{if } n = 0 \\
  n \cdot f(n-1)  & \text{if } n > 0
\end{cases}
```

### 3. Preserve step-by-step arithmetic

When a `calculation` or `derivation` field shows full arithmetic (common in
`bayesian.posterior.calculation`, `physics.derivation`, `mathematics.proofSteps`),
render **each substitution as its own line** with `\\` line breaks. Never
collapse a multi-step derivation into a single-line equation — the pedagogical
value is lost.

For example, a Bayes posterior string
`"P(H|E) = (0.9 * 0.3) / ((0.9 * 0.3) + (0.2 * 0.7)) = 0.27 / 0.41 = 0.659"`
expands into 4 aligned lines, not 1.

### 4. Escape special characters

LaTeX treats several ASCII characters specially. When a variable name or label
from the thought JSON contains any of these, escape them before inserting:

| Raw char | Escaped form | Notes                                                    |
|----------|--------------|----------------------------------------------------------|
| `_`      | `\_`         | Underscores in variable names like `given_h` → `given\_h` |
| `%`      | `\%`         | Percent signs in values like `95% CI` → `95\% CI`        |
| `&`      | `\&`         | Ampersands in text like `R\&D cost`                      |
| `#`      | `\#`         | Hash marks in labels                                     |
| `$`      | `\$`         | Literal dollar signs in prose (not math delimiters)      |
| `{` `}`  | `\{` `\}`    | Literal braces in prose                                  |
| `~`      | `\sim` or `\textasciitilde` | Tilde (math or text context)                |
| `^`      | `\hat{}` or `\textasciicircum` | Caret (math or text context)             |

**Do NOT escape characters inside math mode that are already valid LaTeX
commands** (e.g. `\frac`, `\sum` — leave as-is).

The deepthinking-plugin convention is **camelCase for JSON field names**
(`givenH`, not `given_h`). If a schema does use snake_case, escape the
underscores as shown above.

### 5. Label equations with `\tag{<field-path>}`

Use `\tag{<thought-field-path>}` on the final line of each `align*` block so
the reader can trace each equation back to its source field in the thought
JSON. The tag is placed inline before the `\end{align*}`:

```latex
\begin{align*}
P(H \mid E) &\approx 0.659 \tag{bayesian.posterior.calculation}
\end{align*}
```

This makes the grammar **round-trippable** — given a rendered paper, a reader
can open the source thought and find the exact field that produced each
equation. Use dotted field paths for nested fields and `[i]` for array
indices: `bayesian.evidence[0].likelihood.givenH`.

### 6. Non-math prose goes in `\intertext{...}`

Descriptive fields (`hypothesis.statement`, `justification`, `interpretation`)
are rendered as `\intertext{...}` blocks **inside** the `align*` environment,
placed between the equations they describe. This keeps prose and math in the
same display block without breaking alignment:

```latex
\begin{align*}
\intertext{Hypothesis: config drift in service X}
P(H) &= 0.30
\end{align*}
```

Longer prose (more than one sentence) goes **between** blocks as a plain
paragraph, not inside `\intertext`.

### 7. Fall back gracefully on math-free thoughts

If scanning the thought produces no math-bearing fields (common for
`historical`, `synthesis`, `analogical`), emit a one-line comment and exit
with an empty document body:

```latex
\documentclass{article}
\usepackage{amsmath}
\usepackage{amssymb}
\begin{document}
% latex-math: no math fields found in this thought; see tikz for diagram rendering
\end{document}
```

Do not silently produce an empty `align*` block — the comment is the contract
that tells downstream tooling "this mode is the wrong choice for latex-math".

## Template

A complete `latex-math` document skeleton. Each `\begin{align*}` block
corresponds to one distinct math-bearing field in the source thought:

```latex
\documentclass{article}
\usepackage{amsmath}
\usepackage{amssymb}
\begin{document}

% <mode> thought, extracted <YYYY-MM-DD>
% Source: <thought-id or timestamp>

\begin{align*}
\intertext{<optional caption from a prose field>}
<lhs> &= <rhs-step-1> \\
      &= <rhs-step-2> \\
      &= <rhs-final> \tag{<mode>.<field-path>}
\end{align*}

\intertext{<optional paragraph-length prose between blocks>}

\begin{align*}
<another-equation-from-another-field> \tag{<mode>.<other-field-path>}
\end{align*}

\end{document}
```

One `align*` block per math-bearing field keeps the structure mechanical — a
reviewer can diff the extracted equations against the source thought by
counting blocks.

## Worked Example

### Input thought (bayesian)

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

### Extracted math-bearing fields

1. `hypothesis.prior` — scalar (`0.30`)
2. `evidence[0].likelihood` — `givenH = 0.9`, `givenNotH = 0.2`
3. `evidence[1].likelihood` — `givenH = 0.8`, `givenNotH = 0.4`
4. `posterior.calculation` — full Bayes arithmetic string

The `hypothesis.statement` and per-evidence `description` fields are prose;
they render as `\intertext{...}` captions, not equation bodies.

### Output `.tex` document

```latex
\documentclass{article}
\usepackage{amsmath}
\usepackage{amssymb}
\begin{document}

% bayesian thought, extracted 2026-04-12
% Source: bayesian-inference-deploy-failure

\begin{align*}
\intertext{Hypothesis: the failing deploy is caused by a config drift in service X}
P(H)       &= 0.30 \tag{bayesian.hypothesis.prior} \\
P(\lnot H) &= 0.70
\end{align*}

\intertext{Likelihoods for the two observed evidence items:}

\begin{align*}
P(E_1 \mid H)       &= 0.9 & P(E_1 \mid \lnot H) &= 0.2 \tag{bayesian.evidence[0].likelihood} \\
P(E_2 \mid H)       &= 0.8 & P(E_2 \mid \lnot H) &= 0.4 \tag{bayesian.evidence[1].likelihood}
\end{align*}

\intertext{Applying Bayes' theorem with independent evidence:}

\begin{align*}
P(H \mid E_1, E_2)
  &= \frac{P(E_1 \mid H)\,P(E_2 \mid H)\,P(H)}
          {P(E_1 \mid H)\,P(E_2 \mid H)\,P(H) + P(E_1 \mid \lnot H)\,P(E_2 \mid \lnot H)\,P(\lnot H)} \\
  &= \frac{0.9 \cdot 0.8 \cdot 0.30}
          {(0.9 \cdot 0.8 \cdot 0.30) + (0.2 \cdot 0.4 \cdot 0.70)} \\
  &= \frac{0.216}{0.216 + 0.056} \\
  &= \frac{0.216}{0.272} \\
  &\approx 0.794 \tag{bayesian.posterior.calculation}
\end{align*}

\end{document}
```

### Notes on the rendering

- Every `\begin{align*}` is balanced with an `\end{align*}`.
- Every brace `{` is balanced with a matching `}`.
- The arithmetic matches the `posterior.calculation` string byte-for-byte in
  substance — the numerator (`0.216`) and denominator (`0.272`) are shown
  explicitly rather than collapsed, preserving the pedagogical value.
- The final `\tag{bayesian.posterior.calculation}` points a reader at the
  exact JSON field that produced this block.
- `\lnot` (from `amssymb`) is used for logical negation; `\approx` indicates
  the rounded final value.
- `H` is not escaped: it's a math-mode identifier, not prose.

Compile with `pdflatex worked-example.tex` (or `lualatex`) to produce a
single-page PDF containing three equation blocks separated by two prose
captions.

## Per-Mode Considerations

Not every mode produces rich `latex-math` output. This grammar is most useful
for the **7 math-heavy modes** named in the roadmap. Tier assignments:

### Excellent fit (math is the primary artifact)

- **mathematics** — proofs, theorem statements, algebraic derivations,
  calculus; nearly 100% of the artifact is equation content.
- **physics** — Lagrangians, Hamiltonians, tensor equations, conservation
  laws; `\nabla`, `\partial`, `\mathcal{L}` abound.
- **bayesian** — priors, likelihoods, posteriors, odds-ratio updates; the
  canonical example above.
- **formallogic** — propositional/predicate logic formulas, proof trees as
  `cases`, inference rules via `gather*`.
- **firstprinciples** — axiom derivations and decomposition chains; each
  principle becomes one equation.

### Moderate fit (math + prose blend)

- **computability** — decidability proofs, diagonal arguments, complexity
  classes; mix of equations and `intertext` prose.
- **evidential** — Dempster-Shafer belief masses and combination rules;
  tabular when there are many sources, equational when focused on the
  combination rule.
- **gametheory** — payoff matrices render better as `tikz` or `csv`, but
  utility functions and best-response equations are a reasonable
  `latex-math` artifact.

### Poor fit (prose-dominated — prefer another format)

- **historical**, **synthesis**, **analogical**, **critique**, **narrative** —
  these thoughts rarely contain equations. For these, the grammar emits the
  graceful-fallback comment from Encoding Rule 7 and the caller should
  request `markdown` or `tikz` instead.

When `think-render` is invoked without an explicit mode hint and the mode is
in the "Poor fit" tier, the visual-exporter agent should route to `markdown`
by default and only fall through to `latex-math` if the user explicitly asks.

## Rendering Tools

### Local compilation

- **TeX Live** (Linux, macOS, Windows) — `tlmgr install amsmath amssymb`;
  compile with `pdflatex file.tex` or `lualatex file.tex`.
- **MiKTeX** (Windows, macOS) — installs `amsmath`/`amssymb` on-demand on
  first compile; no setup beyond `winget install MiKTeX.MiKTeX`.
- **MacTeX** (macOS) — bundles a full TeX Live.

### Web rendering (no TeX toolchain needed)

- **MathJax** — include `<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>`
  and wrap the `align*` block in `$$ ... $$` to render in any HTML page.
- **KaTeX** — faster than MathJax but supports a smaller subset of AMS-math.
  `align*`, `cases`, `intertext`, `\tag`, `\lnot`, `\approx`, `\frac`, and
  `\cdot` are all supported.
- **Overleaf** — paste directly into an Overleaf project; the preamble
  packages `amsmath` and `amssymb` are included in the default template.

### Markdown integration

GitHub-flavored markdown, Jupyter, and most docs sites render
`$$\begin{align*} ... \end{align*}$$` when MathJax is enabled. Wrap the body
of the `.tex` file (everything between `\begin{document}` and
`\end{document}`) in `$$ ... $$` and paste into a markdown cell.

### Python integration

Render from a Python script via `subprocess`:

```python
import subprocess
subprocess.run(
    ["pdflatex", "-interaction=nonstopmode", "worked-example.tex"],
    check=True,
    encoding="utf-8",
)
```

For headless batch rendering (no interactive prompts on errors), always pass
`-interaction=nonstopmode` and check the return code rather than relying on
stdout.

### Validation without compiling

Quick syntactic check without a full TeX install: count `\begin{align*}` /
`\end{align*}` pairs and brace balance with a short Python snippet. This
catches the most common subagent errors (unbalanced environments, stray
braces) before invoking `pdflatex`.

---

**Last Updated:** 2026-04-12
**Status:** Stable
**Audience:** deepthinking-plugin developers, academic users, visual grammar maintainers
