# Synthesis Thought — Output Format

Integrating multiple sources into a coherent position with coverage tracking and divergence acknowledgment.

## JSON Schema

```json
{
  "mode": "synthesis",
  "topic": "<the question being synthesized across sources>",
  "sources": [
    {
      "id": "<unique id>",
      "title": "<source title>",
      "type": "empirical|theoretical|review|expert|case_study",
      "year": 0,
      "keyPosition": "<what this source claims about the topic>",
      "quality": 0.0
    }
  ],
  "themes": [
    {
      "id": "<theme id>",
      "name": "<theme name>",
      "sourceIds": ["<source ids contributing to this theme>"],
      "consensus": "strong|moderate|weak|contested",
      "description": "<what this theme asserts>"
    }
  ],
  "convergence": [
    {
      "claim": "<claim supported by multiple sources>",
      "sourceIds": ["<two or more source ids>"],
      "strength": "strong|moderate|weak"
    }
  ],
  "divergence": [
    {
      "dimension": "<what sources disagree about>",
      "positions": [
        { "sourceIds": ["<source ids>"], "position": "<what these sources say>" },
        { "sourceIds": ["<source ids>"], "position": "<what these sources say>" }
      ],
      "nature": "methodological|theoretical|population|temporal|definitional"
    }
  ],
  "gaps": [
    {
      "description": "<what is unknown or unaddressed by the sources>",
      "type": "empirical|theoretical|methodological|contextual",
      "importance": "critical|significant|moderate|minor"
    }
  ],
  "coverage": {
    "sourcesExamined": 0,
    "estimatedRelevantTotal": 0,
    "coverageRatio": 0.0,
    "missingPerspectives": ["<perspective not yet examined>"]
  },
  "synthesisStatement": "<the integrated conclusion across all sources>",
  "confidence": 0.0
}
```

## Required Fields

- `mode` — always `"synthesis"`
- `topic` — the question being synthesized
- `sources` — at least two sources (synthesis of one source is summary)
- `synthesisStatement` — the integrated conclusion; not a restatement of the strongest source
- `confidence` — strength of the synthesis in [0, 1]

## Optional Fields

- `themes` — cross-source thematic clusters
- `convergence` — claims supported by multiple sources
- `divergence` — where sources conflict, with nature of conflict
- `gaps` — what the sources collectively do not address
- `coverage` — how much of the relevant space has been examined

## Worked Example

Input: "Synthesizing three conflicting studies on remote work productivity into a coherent position."

Output:

```json
{
  "mode": "synthesis",
  "topic": "Does remote work improve or harm employee productivity?",
  "sources": [
    {
      "id": "s1",
      "title": "Does Working from Home Work? Evidence from a Chinese Experiment",
      "type": "empirical",
      "year": 2015,
      "keyPosition": "Remote work increases individual productivity by ~13% for structured tasks",
      "quality": 0.92
    },
    {
      "id": "s2",
      "title": "The Effects of Remote Work on Collaboration Among Information Workers",
      "type": "empirical",
      "year": 2021,
      "keyPosition": "Fully remote work narrows collaboration networks",
      "quality": 0.88
    },
    {
      "id": "s3",
      "title": "How Well-Designed Hybrid Work Benefits Employees and Companies",
      "type": "empirical",
      "year": 2022,
      "keyPosition": "Hybrid arrangements maximize both individual output and collaborative quality",
      "quality": 0.85
    }
  ],
  "convergence": [
    {
      "claim": "Remote work effect depends on task type, not on remote work per se",
      "sourceIds": ["s1", "s2", "s3"],
      "strength": "strong"
    }
  ],
  "divergence": [
    {
      "dimension": "Whether fully remote is net positive or negative",
      "positions": [
        { "sourceIds": ["s1"], "position": "Fully remote increases productivity in structured-task roles" },
        { "sourceIds": ["s2"], "position": "Fully remote weakens collaborative networks in knowledge-worker roles" }
      ],
      "nature": "population"
    }
  ],
  "gaps": [
    {
      "description": "Long-run career development and promotion equity for remote workers",
      "type": "empirical",
      "importance": "significant"
    }
  ],
  "coverage": {
    "sourcesExamined": 3,
    "estimatedRelevantTotal": 40,
    "coverageRatio": 0.08,
    "missingPerspectives": ["Non-knowledge-worker populations", "Managerial effectiveness remotely"]
  },
  "synthesisStatement": "Remote work increases individual productivity for structured tasks but reduces spontaneous collaboration in knowledge-work contexts. Hybrid arrangements (2-3 remote days) reconcile these findings. The debate is not 'remote vs. in-office' but 'which tasks belong where.'",
  "confidence": 0.72
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"synthesis"`
- `sources` has at least 2 entries
- `synthesisStatement` integrates convergence and divergence — not a restatement of the strongest source
- `confidence` is lower when `coverage.coverageRatio` is low or divergence is unresolved
- If `divergence` is present, `nature` is explicitly stated for each conflict
- `gaps` is non-empty — if no gaps exist, state that as a coverage claim, not silence
