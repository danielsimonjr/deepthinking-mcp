# Analogical Thought — Output Format

Cross-domain reasoning by mapping structural similarities from a source domain to a target domain.

## JSON Schema

```json
{
  "mode": "analogical",
  "sourceDomain": {
    "id": "<optional string>",
    "name": "<source domain name>",
    "description": "<what this domain is>",
    "entities": [
      { "id": "e1", "name": "<entity name>", "type": "<role in domain>", "description": "<what it does>" }
    ],
    "relations": [
      { "id": "r1", "type": "<relation type>", "from": "<entity id>", "to": "<entity id>", "description": "<nature of relation>" }
    ],
    "properties": []
  },
  "targetDomain": {
    "id": "<optional string>",
    "name": "<target domain name>",
    "description": "<what this domain is>",
    "entities": [
      { "id": "t1", "name": "<entity name>", "type": "<role in domain>", "description": "<what it does>" }
    ],
    "relations": [],
    "properties": []
  },
  "mappings": [
    {
      "sourceEntityId": "<source entity id>",
      "targetEntityId": "<target entity id>",
      "justification": "<why these two correspond>",
      "confidence": <number 0-1>
    }
  ],
  "insights": [
    {
      "description": "<the transferred insight>",
      "sourceEvidence": "<what in source domain supports this>",
      "targetApplication": "<how to apply it in target domain>",
      "novelty": <number 0-1>
    }
  ],
  "inferences": [
    {
      "sourcePattern": "<pattern observed in source>",
      "targetPrediction": "<prediction for target domain>",
      "confidence": <number 0-1>,
      "needsVerification": <true or false>
    }
  ],
  "limitations": ["<where the analogy breaks down>"],
  "analogyStrength": <number 0-1>
}
```

## Required Fields

- `mode` — always `"analogical"`
- `sourceDomain` — the well-understood domain you are mapping from; must have at least one entity
- `targetDomain` — the domain you are trying to understand or solve; must have at least one entity
- `mappings` — at least one source→target entity correspondence with confidence and justification
- `analogyStrength` — overall quality of the analogy in [0, 1]

## Optional Fields

- `insights` — new understanding transferred from source to target; include `novelty` to flag genuinely non-obvious transfers
- `inferences` — testable predictions derived from the source domain's patterns; always set `needsVerification: true` unless already confirmed
- `limitations` — explicitly state where the analogy fails; strong analogies always have limitations

## Analogical Strength Calibration

| analogyStrength | Meaning |
|----------------|---------|
| 0.90 – 1.00 | Near-isomorphic: structural relations map almost exactly |
| 0.70 – 0.89 | Strong: most entities and relations map with minor breaks |
| 0.50 – 0.69 | Moderate: useful for generating ideas, but conclusions need independent validation |
| 0.30 – 0.49 | Weak: only surface similarity; do not rely for engineering decisions |
| < 0.30 | Superficial: analogical reasoning not appropriate |

## Worked Example

Input: "Is our caching layer more like a CPU cache (LRU) or a CDN (geographic distribution)?"

```json
{
  "mode": "analogical",
  "sourceDomain": {
    "name": "CPU Cache",
    "description": "Hardware L1/L2/L3 cache sitting between CPU registers and RAM",
    "entities": [
      { "id": "e1", "name": "Cache Miss", "type": "event", "description": "Data not found — fetch from slower tier" },
      { "id": "e2", "name": "LRU Eviction", "type": "policy", "description": "Least-recently-used entry evicted when full" },
      { "id": "e3", "name": "Hit Rate", "type": "metric", "description": "Fraction served from cache; high = low latency" }
    ],
    "relations": [],
    "properties": []
  },
  "targetDomain": {
    "name": "Application Cache (Redis)",
    "description": "Redis layer between app servers and primary database",
    "entities": [
      { "id": "t1", "name": "Cache Miss", "type": "event", "description": "Key not in Redis — falls through to DB" },
      { "id": "t2", "name": "allkeys-lru Eviction", "type": "policy", "description": "LRU eviction under memory pressure" },
      { "id": "t3", "name": "Hit Rate", "type": "metric", "description": "Percentage of requests answered without DB hit" }
    ],
    "relations": [],
    "properties": []
  },
  "mappings": [
    { "sourceEntityId": "e1", "targetEntityId": "t1", "justification": "Both represent failure to find data in fast tier, requiring fallback to slow tier", "confidence": 0.97 },
    { "sourceEntityId": "e2", "targetEntityId": "t2", "justification": "Both use LRU to determine which entry to discard under capacity pressure", "confidence": 0.90 },
    { "sourceEntityId": "e3", "targetEntityId": "t3", "justification": "Hit rate is the primary performance indicator in both systems", "confidence": 0.95 }
  ],
  "insights": [
    {
      "description": "Cache warm-up after restart is the app-cache equivalent of CPU cold-start",
      "sourceEvidence": "CPUs pay full memory-access penalty on first access after power-on",
      "targetApplication": "Route a pre-heat script before live traffic after Redis restarts",
      "novelty": 0.65
    }
  ],
  "limitations": [
    "CPU caches are hardware-managed and deterministic; Redis eviction is approximate",
    "CPU cache size is fixed; Redis can scale horizontally — analogy breaks for capacity planning"
  ],
  "analogyStrength": 0.88
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"analogical"`
- `sourceDomain` and `targetDomain` each have at least one entity
- `mappings` has at least one entry and all `sourceEntityId`/`targetEntityId` values reference real entity `id` values
- `confidence` values in mappings are in [0, 1]
- `analogyStrength` reflects the average mapping quality — do not set high if most mappings are below 0.7
- `limitations` is present and non-empty — every analogy has limits; omitting them is a reasoning failure
- If `needsVerification: true` in any inference, note in the natural-language summary what would confirm or refute it
