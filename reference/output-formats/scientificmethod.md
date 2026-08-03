# Scientific Method Thought — Output Format

Hypothesis-driven experimentation: form a falsifiable hypothesis, design a controlled experiment, collect data, and draw evidence-based conclusions.

## JSON Schema

```json
{
  "mode": "scientificmethod",
  "question": "<precise, answerable research question>",
  "nullHypothesis": "<H₀: no effect — the default assumption>",
  "alternativeHypothesis": "<H₁: the predicted effect>",
  "falsifiable": true,
  "experimentType": "experimental | quasi_experimental | observational | correlational",
  "independentVariables": ["<what you manipulate>"],
  "dependentVariables": ["<what you measure>"],
  "controlVariables": ["<what you hold constant>"],
  "procedure": ["<step 1>", "<step 2>", "..."],
  "successCriteria": "<specific measurable outcome that would confirm H₁>",
  "result": "<observed outcome if experiment has been run, or null>",
  "conclusion": "<accept or reject H₀, and reasoning — or null if not yet run>",
  "confidence": <number 0-1>,
  "limitations": ["<known limits of the design or conclusions>"]
}
```

## Required Fields

- `mode` — always `"scientificmethod"`
- `question` — the specific research question being investigated
- `nullHypothesis` — H₀; the default assumption of no effect
- `alternativeHypothesis` — H₁; the predicted effect to be tested
- `falsifiable` — must be `true`; a non-falsifiable hypothesis cannot be tested
- `experimentType` — the type of study design
- `independentVariables` — what the experimenter manipulates (at least one)
- `dependentVariables` — what is measured as the outcome (at least one)
- `controlVariables` — what is held constant to isolate the independent variable
- `procedure` — ordered steps of the experiment
- `successCriteria` — the specific measurable threshold that would confirm H₁

## Optional Fields

- `result` — the observed outcome; `null` if the experiment has not been run
- `conclusion` — accept or reject H₀ based on the result; `null` if not yet run
- `confidence` — confidence in the conclusion, in [0, 1]
- `limitations` — known constraints on the validity or generalizability of the conclusions

## Falsifiability Requirement

A hypothesis must be falsifiable — there must exist a possible observation that would prove it false. If no result could refute the hypothesis, it is a tautology, not a scientific claim. Always set `falsifiable: true` and revise the hypothesis if it cannot be falsified.

## Experiment Types

| Type | When to Use |
|------|-------------|
| `experimental` | Random assignment to conditions; full control over independent variable (e.g., A/B test, RCT) |
| `quasi_experimental` | Non-random assignment; some control over independent variable (e.g., before/after with control group) |
| `observational` | No manipulation; observe and measure naturally occurring variation |
| `correlational` | Measure association between variables without inferring causation |

## Worked Example

Input: "Does enabling connection pooling reduce database query latency?"

```json
{
  "mode": "scientificmethod",
  "question": "Does enabling PgBouncer connection pooling reduce mean database query latency by at least 30% compared to direct connections under 200 concurrent users?",
  "nullHypothesis": "PgBouncer connection pooling has no significant effect on mean query latency compared to direct connections",
  "alternativeHypothesis": "PgBouncer connection pooling reduces mean query latency by at least 30% under 200 concurrent users",
  "falsifiable": true,
  "experimentType": "experimental",
  "independentVariables": ["Connection method (direct vs PgBouncer pooled)"],
  "dependentVariables": ["Mean query latency (ms)", "p99 query latency (ms)", "connection setup time (ms)"],
  "controlVariables": ["PostgreSQL version (15.2)", "Query workload (read-heavy, fixed query set)", "Server hardware", "Concurrent user count (200)"],
  "procedure": [
    "Configure two identical PostgreSQL instances: one with direct connections, one with PgBouncer in transaction mode",
    "Run pgbench workload at 200 concurrent users for 5 minutes on each configuration",
    "Record mean and p99 query latency and connection setup time",
    "Repeat 3 times and compute averages"
  ],
  "successCriteria": "Pooled configuration mean latency is ≥30% lower than direct configuration mean latency with p < 0.05",
  "result": "Direct: mean 87 ms, p99 412 ms. Pooled: mean 52 ms, p99 210 ms. p = 0.001.",
  "conclusion": "Reject H₀. Connection pooling reduces mean latency by 40% and p99 by 49%, exceeding the 30% threshold with high statistical significance. Enable PgBouncer in production.",
  "confidence": 0.93,
  "limitations": [
    "Fixed query set may not reflect production query diversity",
    "PgBouncer in session mode was not tested — transaction mode may not suit all application patterns"
  ]
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"scientificmethod"`
- `falsifiable` is `true` — revise the hypothesis if not
- `nullHypothesis` and `alternativeHypothesis` are both present and distinct
- `successCriteria` is specific enough that a measurement can unambiguously pass or fail it
- `independentVariables` and `dependentVariables` are both populated
- `controlVariables` lists what is held constant to isolate the independent variable
- `confidence` reflects the quality of the evidence and design, not just the desired outcome
- `conclusion` is consistent with the `result` — do not assert conclusions without matching evidence
