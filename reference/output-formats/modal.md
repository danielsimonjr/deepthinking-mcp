# Modal Thought — Output Format

Reasoning about necessity (□) and possibility (◇) using possible-worlds semantics (Kripke frames).

## JSON Schema

```json
{
  "mode": "modal",
  "modalDomain": "<alethic | epistemic | deontic>",
  "logicSystem": "<K | T | B | S4 | S5 | D>",
  "actualWorld": "<world id>",
  "possibleWorlds": [
    {
      "id": "<id>",
      "name": "<scenario name>",
      "description": "<what is true in this world>",
      "isActual": <boolean>,
      "truths": ["<proposition>", ...]
    }
  ],
  "accessibilityRelations": [
    { "from": "<world id>", "to": "<world id>", "type": "<reflexive | symmetric | transitive | euclidean | serial>" }
  ],
  "propositions": [
    {
      "id": "<id>",
      "content": "<proposition text>",
      "operator": "<necessity | possibility | contingency | impossibility>",
      "truthValue": <boolean>,
      "justification": "<why this truth value holds in the Kripke frame>"
    }
  ],
  "inferences": [
    {
      "id": "<id>",
      "premises": ["<premise>", ...],
      "conclusion": "<modal conclusion>",
      "valid": <boolean>,
      "justification": "<modal rule applied>"
    }
  ]
}
```

## Required Fields

- `mode` — always `"modal"`
- `modalDomain` — `alethic` (truth), `epistemic` (knowledge), or `deontic` (obligation)
- `possibleWorlds` — at least one world; exactly one with `isActual: true`
- `propositions` — at least one proposition with `id`, `content`, and `operator`

## Modal Domains

| Domain | □ means | ◇ means | Example |
|--------|---------|---------|---------|
| **Alethic** | necessarily true | possibly true | "Water must boil at 100°C at sea level" |
| **Epistemic** | the agent knows P | the agent considers P possible | "Alice knows the password" |
| **Deontic** | obligatory | permitted | "Admins must enable MFA" |

## Worked Example

Input: "In which cases MUST Alice have admin access vs. COULD she have it?"

Output:

```json
{
  "mode": "modal",
  "modalDomain": "deontic",
  "logicSystem": "S5",
  "actualWorld": "w1",
  "possibleWorlds": [
    {
      "id": "w1",
      "name": "Current state",
      "description": "Alice is a senior engineer on the payments team",
      "isActual": true,
      "truths": ["alice_is_senior_engineer", "alice_on_payments_team", "payments_team_requires_admin"]
    },
    {
      "id": "w2",
      "name": "Role-change scenario",
      "description": "Alice moves to the docs team with no admin requirement",
      "isActual": false,
      "truths": ["alice_is_senior_engineer", "alice_on_docs_team"]
    }
  ],
  "accessibilityRelations": [
    { "from": "w1", "to": "w2", "type": "reflexive" }
  ],
  "propositions": [
    {
      "id": "p1",
      "content": "Alice has admin access",
      "operator": "necessity",
      "truthValue": false,
      "justification": "Admin access is not true in w2 — necessity fails (countermodel exists)."
    },
    {
      "id": "p2",
      "content": "Alice has admin access",
      "operator": "possibility",
      "truthValue": true,
      "justification": "Admin access is true in w1 (actual world). ◇ holds."
    }
  ],
  "inferences": [
    {
      "id": "inf1",
      "premises": ["w2 is accessible from w1", "admin is false in w2"],
      "conclusion": "Admin access is NOT unconditionally necessary for Alice",
      "valid": true,
      "justification": "Countermodel: w2 witnesses ◇¬(admin). Therefore □(admin) is false."
    }
  ]
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"modal"`
- `modalDomain` is one of `alethic`, `epistemic`, `deontic`
- Exactly one world has `isActual: true`
- □P is `truthValue: true` only if P holds in ALL worlds accessible from the actual world
- ◇P is `truthValue: true` if P holds in AT LEAST ONE accessible world
- `inferences` cite the modal rule or axiom applied (K, T, S4, S5, countermodel, etc.)
- Logic system choice is consistent with the accessibility relation properties used
