# Game Theory Thought — Output Format

Strategic analysis of multi-agent interactions, Nash equilibria, and payoff structures.

## JSON Schema

```json
{
  "mode": "gametheory",
  "game": {
    "name": "<game name>",
    "type": "non_cooperative | cooperative | normal_form | extensive_form",
    "isZeroSum": true | false,
    "description": "<optional context>"
  },
  "players": [
    { "id": "<player id>", "name": "<player name>", "strategies": ["<s1>", "<s2>"] }
  ],
  "payoffMatrix": {
    "description": "<what the payoffs represent>",
    "entries": [
      { "strategies": ["<p1_strategy>", "<p2_strategy>"], "payoffs": [<p1_payoff>, <p2_payoff>] }
    ]
  },
  "nashEquilibria": [
    {
      "strategyProfile": ["<p1_strategy>", "<p2_strategy>"],
      "payoffs": [<p1_payoff>, <p2_payoff>],
      "type": "pure | mixed",
      "isStrict": true | false
    }
  ],
  "dominantStrategies": [
    {
      "playerId": "<player id>",
      "strategy": "<strategy name>",
      "type": "strictly_dominant | weakly_dominant",
      "justification": "<why this strategy dominates>"
    }
  ],
  "analysis": "<strategic interpretation of equilibria and implications>"
}
```

## Required Fields

- `mode` — always `"gametheory"`
- `game` — game metadata including type and zero-sum flag
- `players` — at least two players, each with a non-empty strategies list
- `payoffMatrix` — complete entries covering every strategy combination
- `nashEquilibria` — list of equilibria (may be empty if none exist in pure strategies)
- `analysis` — natural-language interpretation connecting equilibria to the real-world scenario

## Cooperative vs. Non-Cooperative

- `"non_cooperative"` — agents choose independently; no binding agreements; analyze via Nash equilibria and dominant strategies
- `"cooperative"` — agents can form coalitions; focus on coalition stability, Shapley values, and fair division

## Nash Equilibrium Verification

A strategy profile is a Nash equilibrium if and only if: for every player `i`, their payoff under the equilibrium strategy is at least as high as any alternative strategy, given all other players hold their equilibrium strategies fixed. Check by scanning each row/column in the payoff matrix.

## Worked Example

See `skills/think-strategic/SKILL.md` — Game Theory section, Worked Example: Cache TTL Competition.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"gametheory"`
- `players` has at least two entries
- `payoffMatrix.entries` has exactly (product of all players' strategy counts) entries for a normal-form game
- Each Nash equilibrium is verified by the no-deviation condition
- `analysis` distinguishes whether the equilibrium is Pareto-efficient or Pareto-dominated
- `type` is `"cooperative"` only when coalition formation and fair division are the focus
