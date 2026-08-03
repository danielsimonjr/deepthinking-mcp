# Format Grammar: TikZ

How to encode a deepthinking-plugin thought into LaTeX TikZ graphics.

## Format Overview

TikZ is a LaTeX graphics library that produces publication-quality vector graphics suitable for:

- **Academic papers** — IEEE, ACM, SIGGRAPH-style figures with precise typography
- **Textbooks and theses** — Integrated seamlessly with LaTeX document flow
- **Technical presentations** — Beamer slides with native LaTeX rendering
- **Print media** — PDF output at arbitrary resolution without quality loss
- **Formal proofs** — Logical diagrams, proof trees, formal syntax trees

TikZ excels at producing **precise, mathematically-sound visualizations** with tight integration into academic publishing workflows. Output is compiled with `pdflatex`, `xelatex`, or `lualatex` into PDF.

## Encoding Rules

### Document Preamble

All TikZ figures require a LaTeX preamble with necessary packages:

```latex
\documentclass{article}
\usepackage{tikz}
\usetikzlibrary{arrows.meta, positioning, shapes.geometric, shapes.symbols, calc, decorations.pathreplacing}
\begin{document}
```

Include additional libraries depending on figure complexity:

| Library | Purpose | Use Case |
|---------|---------|----------|
| `arrows.meta` | Modern arrow styles (→, ⇒, ⇐, custom) | All directed graphs |
| `positioning` | Node positioning (above, below, right, left of) | Layout without explicit coordinates |
| `shapes.geometric` | Diamond, hexagon, ellipse shapes | Decision nodes, confounders, system components |
| `shapes.symbols` | Cloud, star, lightning shapes | External systems, special nodes |
| `calc` | Coordinate calculations | Computed node positions, scaled layouts |
| `decorations.pathreplacing` | Braces, parentheses on edges | Grouping, highlighting subgraphs |
| `matrix` | Matrix node arrangement | Game theory payoff tables, truth tables |
| `graphs` | Graph drawing algorithms | Large networks with auto-layout |

### TikZ Picture Environment

All figures are wrapped in `tikzpicture`:

```latex
\begin{tikzpicture}[node distance=2cm, every node/.style={font=\small}]
  % Nodes and edges go here
\end{tikzpicture}
```

**Options:**
- `node distance` — default spacing between nodes (in cm)
- `every node/.style` — default style applied to all nodes
- `scale` — scale entire figure by factor
- `thick` / `thin` — default line weight

### Node Styles

Define named styles at the top using `\tikzset`:

```latex
\tikzset{
  hypothesis/.style={
    draw=blue,
    fill=blue!20,
    rectangle,
    rounded corners=0.3cm,
    minimum width=3cm,
    minimum height=1.5cm,
    font=\sffamily\small,
    thick
  },
  evidence/.style={
    draw=green,
    fill=green!20,
    rectangle,
    minimum width=2cm,
    font=\sffamily\small
  },
  confounder/.style={
    draw=orange,
    fill=orange!20,
    diamond,
    minimum width=2cm,
    font=\sffamily\small
  }
}
```

**Common style properties:**
- `draw=<color>` — border color (HTML or named: blue, red, green, orange, purple, gray)
- `fill=<color>` — fill color (can use tints: `blue!20` = 20% blue)
- `rectangle` / `ellipse` / `diamond` — node shape
- `rounded corners` — corner radius
- `minimum width` / `minimum height` — size constraints
- `font=\tiny / \small / \large` — text size
- `thick` / `thin` — border weight

### Nodes

Define nodes with `\node`:

```latex
\node[hypothesis] (h1) at (0,0) {Hypothesis A};
\node[evidence] (e1) at (-2,-2) {Supporting\nEvidence};
\node[confounder] (c1) at (2,-2) {Confounder};
```

**Syntax:**
- `[style]` — apply named style
- `(identifier)` — unique node ID for referencing in edges
- `at (x,y)` — explicit coordinate (optional; use with positioning library for alternatives)
- `{text}` — node label (use `\n` for line breaks)

Alternatively, use the positioning library for relative positioning:

```latex
\node[hypothesis] (h1) {Hypothesis A};
\node[evidence] (e1) [below left=of h1] {Supporting Evidence};
\node[evidence] (e2) [below right=of h1] {Contradicting Evidence};
```

### Edges

Define edges with `\draw`:

```latex
\draw[->, thick] (e1) -- (h1);
\draw[->, dashed, thick] (c1) -- (h1) node[midway, above] {confounder};
\draw[->, dotted] (h1) -- (conclusion);
```

**Syntax:**
- `[options]` — styling
- `(source) -- (target)` — straight-line edge
- `(source) to[curve right] (target)` — curved edge (Bezier curve)
- `->`/ `<-` / `<->` — arrowhead direction
- `thick` / `thin` — line weight
- `solid` / `dashed` / `dotted` — line style
- `node[position] {label}` — edge label with placement options

**Arrow styles:**
- `->` — standard arrow (simple single-line)
- `=>` — double-headed arrow
- `*->` — filled circle to arrow
- `-|>` — right angle arrow

### Edge Labels

Label edges with inline node positioning:

```latex
\draw[->] (n1) -- node[above, font=\small] {supports} (n2);
\draw[->, dashed] (n3) -- node[below right] {strength: -0.5} (n2);
```

**Position options:** `above`, `below`, `left`, `right`, `above left`, `midway`, `near start`, `near end`

### Colors

Use semantic colors from the visual grammar:

| Semantic | LaTeX Color | RGB Hex | TikZ Usage |
|----------|-----------|---------|-----------|
| Supporting | Green | `#22c55e` | `fill=green!40` or `RGB=34,197,94` |
| Contradicting | Red | `#ef4444` | `fill=red!40` or `RGB=239,68,68` |
| Neutral | Blue | `#3b82f6` | `fill=blue!30` or `RGB=59,130,246` |
| Uncertain | Orange | `#f59e0b` | `fill=orange!40` or `RGB=245,158,11` |
| Meta | Purple | `#a855f7` | `fill=purple!30` or `RGB=168,85,247` |
| Background | Gray | `#6b7280` | `fill=gray!20` or `RGB=107,114,128` |

**Define custom colors:**

```latex
\definecolor{dt-green}{RGB}{34,197,94}
\definecolor{dt-red}{RGB}{239,68,68}
\definecolor{dt-blue}{RGB}{59,130,246}
\definecolor{dt-orange}{RGB}{245,158,11}
\definecolor{dt-purple}{RGB}{168,85,247}
```

Then use: `fill=dt-green`, `draw=dt-blue`, etc.

### Coordinate Systems

#### Explicit Coordinates

```latex
\node (n1) at (0,0) {Origin};
\node (n2) at (3,2) {Point};
```

#### Relative Positioning (requires positioning library)

```latex
\node (n1) {Hypothesis};
\node (e1) [below left=1cm of n1] {Evidence};
\node (e2) [below right=1cm of n1] {Evidence};
```

#### Grid Layout

```latex
\begin{scope}[every node/.style={draw, minimum size=1cm}]
  \node at (0,0) {1};
  \node at (1,0) {2};
  \node at (2,0) {3};
\end{scope}
```

## Template

```latex
\documentclass{article}
\usepackage{tikz}
\usetikzlibrary{arrows.meta, positioning, shapes.geometric}

\definecolor{dt-green}{RGB}{34,197,94}
\definecolor{dt-red}{RGB}{239,68,68}
\definecolor{dt-blue}{RGB}{59,130,246}
\definecolor{dt-orange}{RGB}{245,158,11}

\tikzset{
  cause/.style={
    draw=dt-blue,
    fill=dt-blue!20,
    rectangle,
    minimum width=3cm,
    minimum height=1cm,
    font=\sffamily\small,
    thick
  },
  effect/.style={
    draw=dt-red,
    fill=dt-red!20,
    rectangle,
    minimum width=3cm,
    minimum height=1cm,
    font=\sffamily\small,
    thick
  }
}

\begin{document}

\begin{tikzpicture}[node distance=3cm]
  \node[cause] (cause) {Cause};
  \node[effect] (effect) [right=of cause] {Effect};
  
  \draw[->, thick] (cause) -- node[above] {causes} (effect);
\end{tikzpicture}

\end{document}
```

## Worked Example

A causal thought with three nodes (cause, mediator, effect) and one confounder:

```latex
\documentclass{article}
\usepackage{tikz}
\usetikzlibrary{arrows.meta, positioning, shapes.geometric, calc}

\definecolor{dt-green}{RGB}{34,197,94}
\definecolor{dt-red}{RGB}{239,68,68}
\definecolor{dt-blue}{RGB}{59,130,246}
\definecolor{dt-orange}{RGB}{245,158,11}

\tikzset{
  rootcause/.style={
    draw=dt-blue,
    fill=dt-blue!20,
    rectangle,
    rounded corners=0.2cm,
    minimum width=3cm,
    minimum height=1.2cm,
    font=\sffamily\small,
    thick
  },
  mediator/.style={
    draw=dt-green,
    fill=dt-green!20,
    rectangle,
    rounded corners=0.2cm,
    minimum width=3cm,
    minimum height=1.2cm,
    font=\sffamily\small,
    thick
  },
  effect/.style={
    draw=dt-red,
    fill=dt-red!20,
    rectangle,
    rounded corners=0.2cm,
    minimum width=3cm,
    minimum height=1.2cm,
    font=\sffamily\small,
    thick
  },
  confounder/.style={
    draw=dt-orange,
    fill=dt-orange!20,
    diamond,
    minimum width=2.5cm,
    minimum height=1.2cm,
    font=\sffamily\small,
    thick
  }
}

\begin{document}

\section*{Cache Eviction Causal Model}

\begin{tikzpicture}[node distance=3cm]
  % Nodes
  \node[rootcause] (cause) {Cache Eviction\\Policy (LRU→LFU)};
  \node[mediator] (mediator) [below=of cause] {Cache Hit\\Rate (\%)};
  \node[effect] (effect) [below=of mediator] {p99 Latency\\(ms)};
  \node[confounder] (confounder) [right=of mediator] {Server\\Memory};
  
  % Direct causal edges
  \draw[->, thick] (cause) -- node[right, font=\tiny] {−0.6} (mediator);
  \draw[->, thick] (mediator) -- node[right, font=\tiny] {−0.9} (effect);
  
  % Confounder edges (dashed)
  \draw[->, thick, dashed] (confounder) -- node[above, font=\tiny] {−0.5} (mediator);
  \draw[->, thick, dashed] (confounder) -- node[right, font=\tiny] {+0.4} (effect);
  
  % Annotation
  \draw[decorate, decoration={brace, amplitude=0.3cm}] (1.5, -4.5) -- (1.5, 0.5);
  \node[right=0.3cm of {(1.5, -2)}] {\small Direct path};
  
  \draw[decorate, decoration={brace, amplitude=0.3cm}] (3.8, -4.5) -- (3.8, 0.5);
  \node[right=0.3cm of {(3.8, -2)}] {\small Confounder};
\end{tikzpicture}

\end{document}
```

**Key features:**
- Colored node styles using semantic palette
- Relative positioning with `[below=of node]`
- Dashed edges for confounders
- Edge labels with strength values
- Braces for grouping causal paths

## Per-Mode Considerations

### Causal & Counterfactual Modes

Use distinct node colors: blue (causes), green (mediators), red (effects), orange (confounders). Dashed edges indicate confounder paths. Include strength values on edge labels.

```latex
\draw[->, dashed, dt-orange] (confounder) -- (effect);
```

### Mathematics & Physics Modes

Include mathematical notation in node labels and edge labels:

```latex
\node (eq1) {$\frac{\partial f}{\partial x} = 0$};
\draw[->] (eq1) -- node[above] {$\Rightarrow$ critical point} (eq2);
```

Use `calc` library to position nodes based on equation dimensions.

### Game Theory Mode

Represent players and strategies using matrix layout. Payoff matrices fit naturally in TikZ:

```latex
\matrix (game) [matrix of nodes, ampersand replacement=\&] {
  |[fill=blue!20]| (3,1) \& |[fill=blue!20]| (0,3) \\
  |[fill=red!20]| (0,3) \& |[fill=red!20]| (1,1) \\
};
```

### Proof & Formal Logic Modes

Use `shapes.symbols` for logical gates, diamonds for decision points:

```latex
\node[diamond, draw, fill=yellow!20] (decision) {Prove?};
\draw[->] (axiom) -- (decision);
\draw[->] (decision.south) -- node[right] {Yes} (proven);
```

### System Thinking Mode

Use subgraphs or `scope` environments to highlight feedback loops and system archetypes. Add curved arrows for feedback:

```latex
\draw[->, out=45, in=-45, looseness=2] (effect) to (cause);
\node[font=\tiny, right] at (2, 0) {Positive feedback loop};
```

### Sequential & Analysis Modes

Chain nodes vertically with `[below=of]` and use simple arrows with descriptive edge labels:

```latex
\node (p1) {Premise 1};
\node (p2) [below=2cm of p1] {Premise 2};
\node (c) [below=2cm of p2] {Conclusion};

\draw[->] (p1) -- (c);
\draw[->] (p2) -- (c);
\node[font=\tiny] at (1, -0.5) {both support};
```

## Rendering Tools

### LaTeX Distribution

- **TeX Live** (Linux, macOS, Windows) — `tlmgr install tikz`
- **MiKTeX** (Windows, macOS) — `mpm install tikz`
- **MacTeX** (macOS) — Includes full TeX Live

### Compiling TikZ Figures

```bash
# Compile standalone figure
pdflatex figure.tex

# Compile with document
pdflatex document.tex

# Use LuaTeX for complex graphics (faster)
lualatex figure.tex
```

### Online Editors

- **Overleaf** — Cloud-based LaTeX editor with real-time preview
- **ShareLaTeX** — Collaborative LaTeX (merged with Overleaf)
- **TikZ Online Editor** — Specialized TikZ preview tool

### Extracting Standalone Graphics

Use `standalone` document class to create reusable figure files:

```latex
\documentclass[border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  % Figure content
\end{tikzpicture}
\end{document}
```

Then include in documents:

```latex
\includegraphics{figure.pdf}
```

### Python Integration

Use `pdflatex` subprocess to generate figures from Python:

```python
import subprocess

tikz_code = r"""
\documentclass[border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}[node distance=3cm]
  \node (n1) {Node 1};
  \node (n2) [right=of n1] {Node 2};
  \draw[->] (n1) -- (n2);
\end{tikzpicture}
\end{document}
"""

with open("temp_figure.tex", "w") as f:
    f.write(tikz_code)

subprocess.run(["pdflatex", "-interaction=nonstopmode", "temp_figure.tex"])
```

### Accessibility

For PDF accessibility, include node descriptions:

```latex
\node (n1) [
  draw=blue,
  fill=blue!20,
  rectangle
] {%
  \pdftooltip{Hypothesis A}{This is the primary hypothesis being tested}
};
```

---

**Last Updated:** 2026-04-11  
**Status:** Stable  
**Audience:** deepthinking-plugin developers, academic users, visual grammar maintainers
