# Format Grammar: JSON

How to encode a deepthinking-plugin thought into JSON for machine-to-machine exchange and programmatic consumption.

## Format Overview

The thought object itself is JSON — this grammar covers three subformat variants optimized for different consumers:

1. **Native JSON**: The thought object as-is, pretty-printed with standard indentation. For API responses, file storage, in-memory representation, and direct programmatic consumption.
2. **Flattened (Dot-Path)**: A key-value flat map where nested paths are joined with dots (e.g. `hypothesis.prior.probability = 0.3`). For log aggregation, flat config files, grep-friendly search, and consumers that expect tabular data.
3. **JSON Lines (JSONL)**: One JSON object per line, with no commas between lines. For streaming, line-oriented processing, log appending, and multi-thought sequences (e.g. a sequential chain of reasoning steps).

Each subformat preserves semantic meaning but trades readability and nesting depth for different consumption patterns.

## Encoding Rules

### Native JSON (Standard)

- **Top-level object**: Always a single root object with keys `mode`, `timestamp`, `content`, `metadata`, and mode-specific fields
- **Field mapping**:
  - `mode` (string): Mode identifier (e.g. `"bayesian"`, `"sequential"`)
  - `timestamp` (ISO 8601): When the thought was created
  - `content` (string): Main reasoning narrative (can be multiline with `\n`)
  - `metadata` (object): Tags, references, related modes, session info
  - Mode-specific fields: `hypothesis`, `evidence`, `posterior` (Bayesian); `steps` (Sequential); etc.
- **Numbers**: Always JSON numbers (not quoted strings): `0.85` not `"0.85"`
- **Arrays**: For multi-element fields like evidence list, alternatives, proof steps
- **Nested objects**: Use object nesting, not flattened keys (e.g. `hypothesis.prior.probability`, not `hypothesis_prior_probability`)
- **Multiline content**: Use `\n` for line breaks, not actual newlines (valid JSON)
- **Null vs absent**: Use `null` for explicitly missing values; omit keys that are structurally absent
- **Pretty-print**: Use 2-space indentation for readability

### Flattened (Dot-Path)

- **No nesting**: Every path becomes a flat key with dots as separators
- **Key generation**:
  - `mode` → `mode`
  - `hypothesis.prior.probability` → `hypothesis.prior.probability`
  - `evidence[0].description` → `evidence.0.description`
  - `evidence[0].likelihood_given_h` → `evidence.0.likelihood_given_h`
- **Arrays**: Index by position (0-based): `evidence.0.*`, `evidence.1.*`, `steps.0.action`
- **Values**: All values are simple scalars (strings, numbers, booleans); no nested objects or arrays
- **Line format**: One key-value pair per line: `key = value` or `key: value` (either separator is acceptable)
- **Order**: Sorted by key name for consistency and grepping

### JSON Lines (JSONL)

- **One object per line**: No commas between lines; each line is a standalone valid JSON object
- **Use case**: Multi-thought sequences (e.g. sequential reasoning with 5 steps, each as a separate thought)
- **Line structure**: `{thought_object_1}\n{thought_object_2}\n{thought_object_3}\n`
- **Metadata header** (optional): First line can be `{"type": "deepthinking-sequence", "mode": "sequential", "thought_count": 3}\n`
- **Each line native**: Each line uses native JSON encoding rules (nested objects allowed)
- **Streaming**: Lines can be produced and consumed one at a time without parsing entire file

## Template

### Native JSON Template

```json
{
  "mode": "<mode_name>",
  "timestamp": "2026-04-11T15:30:00Z",
  "content": "Main reasoning narrative\nwith line breaks if needed",
  "metadata": {
    "sessionId": "<session_id>",
    "tags": ["tag1", "tag2"],
    "confidence": 0.85,
    "relatedModes": ["mode_a", "mode_b"]
  },
  "modeSpecificField1": {
    "key": "value",
    "nestedKey": 0.75
  },
  "modeSpecificField2": [
    {"item": 1, "probability": 0.9},
    {"item": 2, "probability": 0.1}
  ]
}
```

### Flattened (Dot-Path) Template

```
metadata.confidence = 0.85
metadata.relatedModes.0 = mode_a
metadata.relatedModes.1 = mode_b
metadata.sessionId = <session_id>
metadata.tags.0 = tag1
metadata.tags.1 = tag2
mode = <mode_name>
modeSpecificField1.key = value
modeSpecificField1.nestedKey = 0.75
modeSpecificField2.0.item = 1
modeSpecificField2.0.probability = 0.9
modeSpecificField2.1.item = 2
modeSpecificField2.1.probability = 0.1
timestamp = 2026-04-11T15:30:00Z
content = Main reasoning narrative...
```

### JSONL Template (Multi-Thought Sequence)

```jsonl
{"type": "deepthinking-sequence", "mode": "sequential", "thought_count": 3, "timestamp": "2026-04-11T15:30:00Z"}
{"mode": "sequential", "step": 1, "content": "First step...", "result": "...", "confidence": 0.9}
{"mode": "sequential", "step": 2, "content": "Second step...", "result": "...", "confidence": 0.85}
{"mode": "sequential", "step": 3, "content": "Final step...", "result": "...", "confidence": 0.88}
```

## Worked Example

### Input: Bayesian Memory Leak Scenario

```json
{
  "mode": "bayesian",
  "hypothesis": {
    "claim": "Caching layer is the cause of memory leak",
    "prior": 0.30,
    "justification": "30% of memory issues traced to caching over 18 months"
  },
  "alternatives": [
    {"claim": "Connection pool leak", "prior": 0.35},
    {"claim": "Log accumulation", "prior": 0.35}
  ],
  "evidence": [
    {
      "description": "Heap dump shows 40% memory in cache objects",
      "likelihood_given_h": 0.90,
      "likelihood_given_not_h": 0.20
    }
  ],
  "posterior": {
    "probability": 0.66,
    "confidence": 0.70,
    "bayes_factor": 4.5
  }
}
```

### Native JSON Output

```json
{
  "mode": "bayesian",
  "timestamp": "2026-04-11T15:30:00Z",
  "content": "A caching layer is suspected as the root cause of a memory leak. Historical data shows 30% of memory issues are traced to caching. A heap dump analysis reveals that cache objects occupy 40% of heap memory, which is consistent with the hypothesis.",
  "metadata": {
    "sessionId": "session-12345",
    "tags": ["memory-leak", "production-issue", "high-priority"],
    "confidence": 0.70,
    "relatedModes": ["causal", "scientificMethod"]
  },
  "hypothesis": {
    "claim": "Caching layer is the cause of memory leak",
    "prior": 0.30,
    "justification": "30% of memory issues traced to caching over 18 months"
  },
  "alternatives": [
    {
      "claim": "Connection pool leak",
      "prior": 0.35
    },
    {
      "claim": "Log accumulation",
      "prior": 0.35
    }
  ],
  "evidence": [
    {
      "description": "Heap dump shows 40% memory in cache objects",
      "likelihood_given_h": 0.90,
      "likelihood_given_not_h": 0.20
    }
  ],
  "posterior": {
    "probability": 0.66,
    "confidence": 0.70,
    "bayes_factor": 4.5,
    "sensitivity": {
      "prior_range": [0.1, 0.5],
      "posterior_range": [0.33, 0.82]
    }
  }
}
```

### Flattened (Dot-Path) Output

```
alternatives.0.claim = Connection pool leak
alternatives.0.prior = 0.35
alternatives.1.claim = Log accumulation
alternatives.1.prior = 0.35
content = A caching layer is suspected as the root cause...
evidence.0.description = Heap dump shows 40% memory in cache objects
evidence.0.likelihood_given_h = 0.90
evidence.0.likelihood_given_not_h = 0.20
hypothesis.claim = Caching layer is the cause of memory leak
hypothesis.justification = 30% of memory issues traced to caching over 18 months
hypothesis.prior = 0.30
metadata.confidence = 0.70
metadata.relatedModes.0 = causal
metadata.relatedModes.1 = scientificMethod
metadata.sessionId = session-12345
metadata.tags.0 = memory-leak
metadata.tags.1 = production-issue
metadata.tags.2 = high-priority
mode = bayesian
posterior.bayes_factor = 4.5
posterior.confidence = 0.70
posterior.probability = 0.66
posterior.sensitivity.posterior_range.0 = 0.33
posterior.sensitivity.posterior_range.1 = 0.82
posterior.sensitivity.prior_range.0 = 0.1
posterior.sensitivity.prior_range.1 = 0.5
timestamp = 2026-04-11T15:30:00Z
```

### JSONL Output (Hypothetical Sequential Chain)

```jsonl
{"type": "deepthinking-sequence", "mode": "sequential", "thought_count": 2, "timestamp": "2026-04-11T15:30:00Z"}
{"mode": "bayesian", "step": 1, "description": "Prior belief assessment", "hypothesis": "Cache leak", "prior": 0.30, "justification": "30% historical rate"}
{"mode": "bayesian", "step": 2, "description": "Evidence evaluation and posterior update", "evidence": "Heap dump 40% cache objects", "likelihood_given_h": 0.90, "posterior": 0.66, "confidence": 0.70}
```

## Per-Mode Considerations

### Native and Flattened
- **All modes**: Both native and flattened work for all reasoning modes
- **Native JSON** is preferred for:
  - API responses where structure matters
  - Programmatic consumption (JSON parsers)
  - Storage in databases with JSON column support
  - Visual tools that consume JSON directly
- **Flattened** is preferred for:
  - Log aggregation and searching (grep-friendly)
  - Spreadsheet imports (CSV conversion)
  - Configuration file generation
  - Audit trails with simple key-value pairs

### JSONL (Multi-Thought Sequences Only)

- **Sequential**: Use JSONL when reasoning involves multiple steps; each step is one line
- **Shannon**: Multi-entropy evaluation → JSONL with one entropy assessment per line
- **Hybrid**: Combined modes in sequence → JSONL with mode-switch on each line
- **Recursive**: Recursive decomposition → JSONL with one level per line (call stack style)
- **Single-thought modes** (Bayesian, Causal, etc.): Only use native or flattened; JSONL does not apply

## Rendering Tools

### Native JSON
- **jq**: Command-line JSON processor for filtering and transformation
  ```bash
  cat thought.json | jq '.posterior.probability'
  cat thought.json | jq 'keys'
  ```
- **Any JSON parser**: Python `json`, Node.js `JSON.parse()`, Go `json.Unmarshal()`, etc.
- **REST APIs**: POST/GET with `Content-Type: application/json`
- **Text editors**: VS Code, Sublime, most support JSON syntax highlighting and formatting

### Flattened
- **grep/ack**: Search for specific paths
  ```bash
  grep "posterior.probability" thought.flat
  grep "evidence\." thought.flat
  ```
- **awk/sed**: Transform or extract columns
- **CSV converters**: Can convert flattened to spreadsheet format
- **Log aggregation**: ELK Stack, Splunk, DataDog parse flattened key-value formats natively

### JSONL
- **Line-oriented tools**: `cat`, `tail`, `head`, `wc -l`
- **jq with slurp**: `jq -s '.' thoughts.jsonl` to parse as array
- **Streaming JSON processors**: `ndjson-cli`, `jl` (JSON Lines tools)
- **Append-only logs**: Native JSONL format supports concurrent appends without rewrites
- **Stream processors**: Apache Kafka, Apache Beam, Python generator functions

---

**Last Updated**: 2026-04-11  
**Format Stability**: Stable  
**Target Audience**: API consumers, backend engineers, data pipeline builders, machine-to-machine integration
