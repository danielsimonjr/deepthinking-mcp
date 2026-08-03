# Meta-Reasoning Thought — Output Format

Strategic oversight of the reasoning process itself — monitoring effectiveness, detecting when to switch modes, and managing cognitive resources.

## JSON Schema

```json
{
  "mode": "metareasoning",
  "currentStrategy": {
    "mode": "<ThinkingMode being evaluated>",
    "approach": "<description of current approach>",
    "startedAt": "<ISO timestamp, optional>",
    "thoughtsSpent": <integer>,
    "progressIndicators": ["<evidence of progress or lack thereof>"]
  },
  "strategyEvaluation": {
    "effectiveness": <number 0-1>,
    "efficiency": <number 0-1>,
    "confidence": <number 0-1>,
    "progressRate": <number 0-1>,
    "qualityScore": <number 0-1>,
    "issues": ["<problems with current strategy>"],
    "strengths": ["<what is working well>"]
  },
  "alternativeStrategies": [
    {
      "mode": "<candidate mode>",
      "reasoning": "<why this mode would help>",
      "expectedBenefit": "<concrete improvement expected>",
      "switchingCost": <number 0-1>,
      "recommendationScore": <number 0-1>
    }
  ],
  "recommendation": {
    "action": "CONTINUE|SWITCH|REFINE|ABANDON|COMBINE",
    "targetMode": "<mode to switch to, if action=SWITCH>",
    "justification": "<reasoning for this recommendation>",
    "confidence": <number 0-1>,
    "expectedImprovement": "<what will improve>"
  },
  "resourceAllocation": {
    "timeSpent": <milliseconds, optional>,
    "thoughtsRemaining": <integer>,
    "complexityLevel": "low|medium|high",
    "urgency": "low|medium|high",
    "recommendation": "<how to allocate remaining cognitive effort>"
  },
  "qualityMetrics": {
    "logicalConsistency": <number 0-1>,
    "evidenceQuality": <number 0-1>,
    "completeness": <number 0-1>,
    "originality": <number 0-1>,
    "clarity": <number 0-1>,
    "overallQuality": <number 0-1>
  },
  "sessionContext": {
    "sessionId": "<session identifier>",
    "totalThoughts": <integer>,
    "modesUsed": ["<list of modes used so far>"],
    "modeSwitches": <integer>,
    "problemType": "<classification of the problem>",
    "historicalEffectiveness": <number 0-1, optional>
  }
}
```

## Required Fields

- `mode` — always `"metareasoning"`
- `currentStrategy` — description of the mode and approach being evaluated
- `strategyEvaluation` — scored assessment of the current strategy; all 7 fields required
- `alternativeStrategies` — at least one alternative if the recommendation is SWITCH or REFINE
- `recommendation` — the concrete action to take; `action` must be one of the five defined values
- `resourceAllocation` — required fields: `thoughtsRemaining`, `complexityLevel`, `urgency`, `recommendation`
- `qualityMetrics` — all six metrics required
- `sessionContext` — required fields: `sessionId`, `totalThoughts`, `modesUsed`, `modeSwitches`, `problemType`

## Recommendation Actions

| Action | Meaning |
|--------|---------|
| `CONTINUE` | Current strategy is working — keep going |
| `SWITCH` | Current strategy is wrong for this problem — change mode now |
| `REFINE` | Current strategy has the right shape but needs adjustment (different framing, more data) |
| `ABANDON` | The problem cannot be solved with available information; stop and surface the gap |
| `COMBINE` | Run two modes in parallel or sequence — neither alone is sufficient |

## When to Trigger Meta-Reasoning

Meta-reasoning should be triggered when:
- N thoughts have been spent without convergence (rule of thumb: N ≥ 4 for simple problems, N ≥ 6 for complex)
- The problem type does not match the current mode's strengths
- Confidence is declining rather than increasing with more thoughts
- Two competing hypotheses have been open for ≥ 3 thoughts without resolution

## Worked Example

Input: "Am I using the right reasoning approach? I've been in sequential mode for 6 thoughts and haven't converged."

```json
{
  "mode": "metareasoning",
  "currentStrategy": {
    "mode": "sequential",
    "approach": "Step-by-step decomposition of microservice latency issue",
    "thoughtsSpent": 6,
    "progressIndicators": [
      "Eliminated GC pause as cause",
      "Two live hypotheses remain: DB saturation vs. network degradation"
    ]
  },
  "strategyEvaluation": {
    "effectiveness": 0.45,
    "efficiency": 0.40,
    "confidence": 0.55,
    "progressRate": 0.35,
    "qualityScore": 0.50,
    "issues": ["6 thoughts without convergence", "Two hypotheses need direct comparison, not more enumeration"],
    "strengths": ["GC correctly eliminated early", "Comprehensive cause inventory"]
  },
  "alternativeStrategies": [
    {
      "mode": "abductive",
      "reasoning": "Two live competing hypotheses are the exact setup abductive mode is designed for",
      "expectedBenefit": "Forces discriminating predictions and explicit scoring — should converge in 3-4 thoughts",
      "switchingCost": 0.25,
      "recommendationScore": 0.88
    }
  ],
  "recommendation": {
    "action": "SWITCH",
    "targetMode": "abductive",
    "justification": "Six sequential thoughts without convergence is the canonical signal that the mode is wrong. Two competing hypotheses need abductive comparison, not sequential enumeration.",
    "confidence": 0.82,
    "expectedImprovement": "Root cause identified within 3-4 abductive thoughts"
  },
  "resourceAllocation": {
    "thoughtsRemaining": 6,
    "complexityLevel": "medium",
    "urgency": "high",
    "recommendation": "Switch to abductive immediately; do not spend more thoughts on sequential enumeration"
  },
  "qualityMetrics": {
    "logicalConsistency": 0.75,
    "evidenceQuality": 0.60,
    "completeness": 0.45,
    "originality": 0.40,
    "clarity": 0.70,
    "overallQuality": 0.58
  },
  "sessionContext": {
    "sessionId": "sess-latency-debug-2026-04-11",
    "totalThoughts": 6,
    "modesUsed": ["sequential"],
    "modeSwitches": 0,
    "problemType": "incident-root-cause-analysis"
  }
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"metareasoning"`
- `recommendation.action` is one of the five valid enum values
- If `action` is `SWITCH`, `targetMode` is present and names a valid reasoning mode
- `strategyEvaluation` has all 7 fields and all numeric values are in [0, 1]
- `qualityMetrics` has all 6 fields and all values are in [0, 1]
- `alternativeStrategies` is non-empty if `action` is `SWITCH` or `COMBINE`
- `progressIndicators` in `currentStrategy` contains concrete evidence, not vague statements
- The natural-language summary explicitly answers: "why is the current mode failing?" and "what will the new mode do better?"
