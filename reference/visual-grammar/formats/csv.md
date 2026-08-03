# Format Grammar: CSV

How to encode a deepthinking-plugin thought into RFC 4180 CSV for tabular
consumption by Excel, R, pandas, databases, and BI tools.

## Format Overview

CSV (Comma-Separated Values, per RFC 4180, Shafranovich 2005, IETF) is a
simple row-oriented plain-text format for tabular data. It is the most
universally consumed structured format in existence: Excel, LibreOffice
Calc, Google Sheets, Python pandas, R, every SQL database, every BI tool,
and most data-analysis notebooks accept it natively without any
adapter.

CSV is **lossy for graph-structured thoughts.** Unlike JSON, GraphML, or
Mermaid, it cannot round-trip a deeply nested thought. It only captures
tabular *subsections* of a thought — typically the array-of-objects fields
where each element is a row (evidence items, alternatives, payoff-matrix
entries, feedback loops). Modes whose content is primarily narrative prose,
or whose structure is primarily a tree or graph, fall back to a
degraded `field,value` two-column representation of top-level scalar
fields.

Use CSV when you need to hand a structured subsection of a thought to a
spreadsheet user, a statistician, or a database import tool. For anything
else (full fidelity, rendering, diffing), prefer `json` or `markdown`.

## Encoding Rules

### 1. Header row first

Every CSV document starts with a header row naming each column. Column
names come from the JSON property names of the source array's objects,
flattened as described below. No units or type annotations in the
header — keep headers machine-parseable.

### 2. RFC 4180 quoting

Any cell containing one of these characters MUST be wrapped in double
quotes:

- comma (`,`) — the field delimiter
- double quote (`"`) — the quote character itself
- newline (`\n`) or carriage return (`\r`) — the record delimiter

A double quote appearing inside a quoted cell is escaped by doubling
it: `she said "hi"` becomes `"she said ""hi"""`. Cells that don't
contain any of these characters are emitted unquoted.

### 3. Unicode safe

Files are UTF-8 encoded **without** a BOM. Non-ASCII characters are
preserved verbatim — no escape sequences, no transliteration. Callers
that hand the file to Excel on Windows may need to prepend a BOM in a
separate export step; do **not** bake the BOM into the grammar-level
output.

### 4. Flattening strategy — primary tabular field

For each mode, one field is designated the "primary tabular field":
the array-of-objects whose rows are the mode's main tabular content.
The rule is: use that field's array as the CSV row source. Each
object becomes one row; each property becomes one column. The
Per-Mode Flattening Rules section below lists the primary field for
every canonical mode.

### 5. Nested objects inside rows

Flatten one level deep using dot notation. For example, a
`bayesian.evidence[].likelihood.given_h` field becomes a column named
`likelihood.given_h`. Do not go deeper than one level — two levels of
nesting signals that the thought should probably be exported as JSON
or as a separate child table.

### 6. Arrays inside rows

Serialize as semicolon-separated values in a single cell. A `tags`
array of `["cache", "production", "p1"]` becomes the cell
`"cache;production;p1"` (quoted because it would otherwise be
ambiguous with any embedded commas). If the nested array contains
objects rather than scalars, fall back to a JSON string in the cell:
`"[{""id"":""E1""},{""id"":""E2""}]"`.

### 7. Null handling

Missing or null values are emitted as empty strings, not the literal
`null` or `NULL`. This matches pandas' default `na_values` behavior
and avoids false-positive string matches in downstream filters.

### 8. Fallback for non-tabular modes

Modes with no primary tabular field (pure narrative-reasoning modes
like `firstprinciples`, `metareasoning`, `hybrid`) degrade to a
two-column `field,value` representation of the top-level thought
object. Scalar fields become one row each. Array and object fields
are serialized as JSON strings in the value column. This fallback is
explicitly degraded — use `markdown` or `json` for these modes in
production.

```csv
field,value
mode,firstprinciples
question,"Why does our cache invalidation fail under load?"
axioms,"[""a1"",""a2"",""a3""]"
derivation,"See prose in full thought"
```

### 9. Multi-table support

Modes with multiple distinct tabular subsections (e.g., `gametheory`
has both `players` and `payoffMatrix.entries`; `argumentation` has
five Toulmin tables) emit them as separate CSV documents with a
comment line preceding each header row:

```csv
# table: players
id,name,type,rationality
P1,Alice,human,bounded
P2,Bob,agent,unbounded

# table: payoffs
profile,alice_payoff,bob_payoff,is_equilibrium
AA,3,3,false
AB,0,5,false
BA,5,0,false
BB,1,1,true
```

The `# table: <name>` line is a non-standard extension to RFC 4180;
strict CSV consumers will skip it as a malformed row or reject it.
When that matters (direct database import), split the document into
separate files named `<mode>-<table>.csv`.

## Template

```csv
# table: <primary_field_name>
<col1>,<col2>,<col3>,<col4>
<row1_val1>,<row1_val2>,<row1_val3>,<row1_val4>
<row2_val1>,<row2_val2>,<row2_val3>,<row2_val4>
<row3_val1>,<row3_val2>,<row3_val3>,<row3_val4>
```

The header row names the columns (flattened with dot notation for
nested objects, one column per scalar property). Each subsequent row
is one element from the primary tabular field's array. Rows are
ordered as they appear in the source JSON — do not re-sort unless the
downstream tool requires it.

## Worked Example

### Input: Bayesian thought with three evidence items

```json
{
  "mode": "bayesian",
  "hypothesis": {
    "claim": "Caching layer causes the memory leak",
    "prior": 0.30
  },
  "evidence": [
    {
      "id": "E1",
      "description": "observed pattern X",
      "likelihood": {"given_h": 0.9, "given_not_h": 0.2}
    },
    {
      "id": "E2",
      "description": "test result Y",
      "likelihood": {"given_h": 0.7, "given_not_h": 0.3}
    },
    {
      "id": "E3",
      "description": "report Z",
      "likelihood": {"given_h": 0.6, "given_not_h": 0.4}
    }
  ],
  "posterior": {"value": 0.857, "calculation": "..."}
}
```

### Output: CSV flattening of `evidence` (the primary tabular field)

```csv
# table: evidence
id,description,likelihood.given_h,likelihood.given_not_h
E1,observed pattern X,0.9,0.2
E2,test result Y,0.7,0.3
E3,report Z,0.6,0.4
```

Notes on the example:

- The header row was derived from the first object's keys, with
  `likelihood.given_h` and `likelihood.given_not_h` flattened one
  level deep per Rule 5.
- No cell contained a comma, quote, or newline, so no RFC 4180
  quoting was needed.
- The `hypothesis` and `posterior` objects are NOT included — they
  are scalar/nested top-level fields, not array-of-objects, and
  therefore not part of the primary tabular field. A caller that
  wants them would use `markdown` or `json`, or would emit a second
  `# table: posterior` section.
- A strict RFC 4180 consumer will ignore or reject the `# table:`
  line; for direct database import, the caller should split the
  output into one file per table.

## Per-Mode Flattening Rules

Every one of the 34 canonical modes has an assigned tier. The
primary tabular field is named where one exists. Modes in the
Fallback tier do not have a primary tabular field and use the
`field,value` two-column representation from Rule 8.

### Excellent (primary tabular field is the main artifact of the thought)

CSV export is a clean, high-fidelity one-table view. These are the
modes you reach for CSV first.

- **abductive** — primary field: `hypotheses[]` (one row per candidate
  explanation, columns for `id`, `claim`, `prior`, `explanatoryPower`,
  `parsimony`, `rank`)
- **bayesian** — primary field: `evidence[]` (one row per evidence
  item, columns for `id`, `description`, `likelihood.given_h`,
  `likelihood.given_not_h`, `bayesFactor`, `posteriorImpact`)
- **constraint** — primary field: `variables[]` (one row per CSP
  variable, columns for `name`, `domain`, `currentValue`,
  `constraints`, `consistent`)
- **engineering** — primary field: `tradeStudy.alternatives[]` (one
  row per design alternative, columns for `name`, `cost`,
  `performance`, `reliability`, `risk`, `weightedScore`)
- **evidential** — primary field: `belief[]` (one row per
  Dempster-Shafer belief mass assignment, columns for `source`,
  `focalSet`, `mass`, `beliefDegree`, `plausibility`)
- **gametheory** — primary field: `payoffMatrix.entries[]` (one row
  per strategic profile, columns for `profile`, `player1Payoff`,
  `player2Payoff`, `isEquilibrium`, `equilibriumType`). Multi-table
  mode: also emits `players[]` as a second table.
- **historical** — primary field: `episodes[]` (one row per historical
  episode, columns for `id`, `period`, `event`, `outcome`, `pattern`,
  `relevance`)
- **optimization** — primary field: `alternatives[]` (one row per
  candidate solution, columns for `id`, `description`,
  `objectiveValue`, `feasible`, `constraintViolations`)
- **stochastic** — primary field: `samples[]` (one row per Monte
  Carlo sample or distribution point, columns for `index`, `value`,
  `probability`, `cumulative`)

### Moderate (primary tabular field exists but prose is the main artifact)

CSV captures a useful secondary view; the reader still needs the
narrative for context.

- **analogical** — primary field: `mapping.correspondences[]` (source
  ↔ target element pairs). Accepts plural `sourceDomains[]` when
  multiple sources are mapped.
- **analysis** — primary field: `layers[]` (one row per analytical
  layer, columns for `name`, `focus`, `findings`, `confidence`)
- **argumentation** — multi-table mode: emits `grounds[]`,
  `warrants[]`, `backings[]`, `qualifiers[]`, and `rebuttals[]` as
  five separate Toulmin-model tables
- **causal** — primary field: `causalChain[]` (one row per cause-effect
  link, columns for `cause`, `effect`, `mechanism`, `strength`,
  `confounders`)
- **computability** — primary field: `decisionSteps[]` (one row per
  Turing-machine or reduction step, columns for `step`, `state`,
  `tape`, `action`, `halted`)
- **counterfactual** — primary field: `outcomes[]` (one row per
  counterfactual scenario, columns for `intervention`, `outcome`,
  `probability`, `divergenceFromActual`)
- **critique** — multi-table mode: emits `strengths[]`, `weaknesses[]`,
  and `socraticQuestions[]` as three separate tables
- **cryptanalytic** — primary field: `patterns[]` (one row per
  detected pattern, columns for `id`, `type`, `confidence`,
  `indicators`, `nextStep`)
- **formallogic** — primary field: `premises[]` (one row per
  propositional/predicate premise, columns for `id`, `statement`,
  `type`, `justification`)
- **inductive** — primary field: `observations[]` (one row per
  supporting observation, columns for `id`, `description`, `source`,
  `weight`)
- **mathematics** — primary field: `proofSteps[]` (one row per
  proof step, columns for `step`, `statement`, `justification`,
  `referencedAxioms`)
- **modal** — primary field: `possibleWorlds[]` (one row per world,
  columns for `id`, `description`, `accessible`, `truthValue`,
  `necessity`)
- **recursive** — primary field: `cases[]` (one row per base case
  or recursive case, columns for `id`, `type`, `condition`,
  `decomposition`, `haltingCondition`)
- **scientificmethod** — multi-table mode: emits `experiments[]`
  and `predictions[]` as two separate tables; each experiment row
  has columns for `id`, `hypothesis`, `design`, `variables`,
  `expectedResult`
- **synthesis** — multi-table mode: emits `sources[]`, `convergence[]`,
  and `divergence[]` as three separate tables
- **systemsthinking** — multi-table mode: emits `feedbackLoops[]`
  and `archetypes[]` as two separate tables; feedback-loop rows
  have columns for `id`, `type` (reinforcing/balancing), `elements`,
  `strength`, `delay`
- **temporal** — multi-table mode: emits `events[]` and `intervals[]`
  as two separate tables; event rows have columns for `id`,
  `timestamp`, `description`, `duration`, `causalPredecessors`

### Fallback (no primary tabular field — use two-column `field,value`)

These modes are primarily prose, tree-structured, or equation-based.
Rule 8's degraded fallback applies. Strongly prefer `markdown` or
`json` for these in production; CSV is only a last-resort export.

- **algorithmic** — pseudocode, complexity bounds, and data-structure
  rationale are prose/code, not tabular
- **deductive** — single conclusion from a chain of premises; there
  is no natural array-of-objects row source
- **firstprinciples** — axiomatic derivation is a tree of reasoning,
  not a flat table
- **hybrid** — composes multiple sub-modes; flattening rule depends
  on the composition and cannot be defined statically
- **metareasoning** — reasoning-about-reasoning is recursive prose,
  not tabular
- **physics** — tensor equations, symmetries, and conservation laws
  don't flatten to rows cleanly
- **sequential** — ordered steps can be tabulated but the schema
  stores them as a narrative chain, not a structured array with
  consistent columns
- **shannon** — information-theoretic decomposition (entropy,
  channel capacity, mutual information) is scalar and equation-based

### Coverage assertion

This section must cover all 34 canonical modes. Count:
Excellent = 9, Moderate = 17, Fallback = 8. Total = **34**. If you
add a new mode to the plugin, append it to one of the three tiers
above and update this count.

## Rendering Tools

- **Excel / LibreOffice Calc** — open `.csv` directly; use Data →
  Import Text and select comma delimiter with double-quote
  qualifier for correct RFC 4180 handling.
- **Python pandas** — `pd.read_csv('<file>.csv')` with default
  arguments handles RFC 4180 quoting automatically.
- **R** — `read.csv('<file>.csv', stringsAsFactors = FALSE)` for
  analysis or `readr::read_csv('<file>.csv')` for strict RFC 4180
  parsing.
- **Database import** — MySQL `LOAD DATA INFILE ... FIELDS
  TERMINATED BY ',' ENCLOSED BY '"'`, PostgreSQL `COPY <table> FROM
  '<file>' WITH (FORMAT csv, HEADER true)`, SQLite `.import
  --csv <file> <table>`. Strip any `# table:` comment lines first
  or split into per-table files.
- **jq preprocessing** — if you want to convert a thought JSON to
  CSV via jq directly (bypassing this grammar):
  ```bash
  jq -r '.evidence | (.[0] | keys_unsorted) as $cols | $cols, (map([.[ $cols[] ]])[]) | @csv' thought.json
  ```
- **Validation** — `python -c "import csv; list(csv.reader(open('<file>.csv')))"`
  will raise on malformed quoting; `csvkit`'s `csvclean` command
  provides a structured diagnostic report.

---

**Last Updated**: 2026-04-12  
**Format Stability**: Stable  
**Target Audience**: Data analysts, spreadsheet users, statisticians, BI engineers, database operators  
**Fidelity**: Lossy — captures tabular subsections only; use `json` or `markdown` for full-fidelity export
