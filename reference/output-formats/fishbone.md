# Fishbone (Ishikawa) Thought — Output Format

Cause analysis organized into multiple independent cause categories converging on one effect.

## JSON Schema

```json
{
  "mode": "fishbone",
  "effect": "<the observed effect/problem being analyzed>",
  "categories": [
    {
      "name": "<category name, e.g. Manpower, Method, Machine, Material, Measurement, Environment>",
      "causes": ["<candidate cause 1>", "<candidate cause 2>"]
    }
  ],
  "primaryCauses": ["<the cause(s), copied verbatim from categories[].causes[], judged most responsible>"]
}
```

## Required Fields

- `mode` — always `"fishbone"`
- `effect` — the problem/outcome being analyzed (the fish's head)
- `categories` — an array of at least one `{name, causes[]}` object. Each category is a cause "rib." The classic manufacturing set is the "6Ms" (Manpower, Method, Machine, Material, Measurement, Environment), but software/service contexts commonly use a smaller or renamed set (e.g., People, Process, Technology, Environment) — pick whatever categories genuinely partition the candidate causes for this problem.

## Optional Fields

- `primaryCauses` — a flat array of the specific causes (copied verbatim from within `categories[].causes[]`) judged most likely responsible or highest-priority to address. Used to highlight which of the many enumerated causes to act on first.

## When to Use Fishbone (vs. 5 Whys)

Fishbone is for **categorize causes** — use it when a problem plausibly has multiple independent contributing factors spanning different categories (people, process, tooling, environment), and you want to enumerate the full landscape before prioritizing. If instead there is a single linear chain of causation converging on one root cause, use `fivewhys` — forcing a single chain into fishbone's category structure loses the "drill deeper" quality that makes 5 Whys useful, and forcing multiple independent categories into a 5-Whys chain produces a chain that awkwardly jumps between unrelated causes.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"fishbone"`
- `categories` has at least one entry, and each entry has at least one item in `causes[]` (a category with zero causes should either be omitted or explicitly say `"none identified"` inside `causes[]`, per the Output Quality Rules)
- Category names reflect genuinely distinct dimensions of the problem — do not split one cause across two categories, and do not create a category that only restates `effect`
- If `primaryCauses` is present, every entry's text matches (verbatim or near-verbatim) an entry that also appears somewhere in `categories[].causes[]` — `primaryCauses` is a cross-reference/highlight, not a new source of causes
- Causes are specific and evidence-based, not generic ("process issues" is weak; "no triage tiering — every ticket worked in raw FIFO order" is specific)

## Worked Example

Input: "Why has our customer support ticket backlog grown from ~200 to ~950 open tickets over the last quarter? Categorize the causes."

Output:

```json
{
  "mode": "fishbone",
  "effect": "Customer support ticket backlog grew from ~200 to ~950 open tickets over the last quarter",
  "categories": [
    {
      "name": "Manpower",
      "causes": [
        "Two senior support engineers left in the same month without backfill",
        "New hires require 6 weeks of ramp-up before handling tickets independently"
      ]
    },
    {
      "name": "Method",
      "causes": [
        "No triage tiering — every ticket is worked in raw first-in-first-out order regardless of severity",
        "Escalation path to engineering requires a manual Slack ping instead of a defined SLA-backed process"
      ]
    },
    {
      "name": "Machine",
      "causes": [
        "Ticketing system search is slow, adding ~2 minutes per ticket to find related past cases",
        "No automated canned-response suggestions for the top 20 recurring issue types"
      ]
    },
    {
      "name": "Material",
      "causes": [
        "Internal knowledge-base articles are outdated, sending agents back to engineering for basic questions"
      ]
    },
    {
      "name": "Measurement",
      "causes": [
        "No per-agent throughput dashboard, so overload on individual agents goes unnoticed until backlog is already large"
      ]
    },
    {
      "name": "Environment",
      "causes": [
        "A major product release six weeks ago introduced a UI change that generated a sustained spike in confusion-related tickets"
      ]
    }
  ],
  "primaryCauses": [
    "Two senior support engineers left in the same month without backfill",
    "No triage tiering — every ticket is worked in raw first-in-first-out order regardless of severity",
    "A major product release six weeks ago introduced a UI change that generated a sustained spike in confusion-related tickets"
  ]
}
```

`primaryCauses` here selects three causes (one from Manpower, one from Method, one from Environment) that reinforce each other — the analysis's job is not just to enumerate but to identify which combination is actually driving the backlog growth.
