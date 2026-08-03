# Computability Thought — Output Format

Turing machine analysis, decidability proofs, reductions, and complexity classification.

## JSON Schema

```json
{
  "mode": "computability",
  "thoughtType": "<machine_definition|computation_trace|decidability_proof|reduction|complexity_analysis|diagonalization|oracle_analysis>",
  "currentProblem": {
    "id": "<problem_id>",
    "name": "<problem name>",
    "description": "<informal description>",
    "inputFormat": "<what inputs look like>",
    "question": "<yes/no question being asked>",
    "yesInstances": ["<concrete yes-instance>"],
    "noInstances": ["<concrete no-instance>"],
    "decidabilityStatus": "<decidable|semi_decidable|undecidable|unknown>",
    "complexityClass": "<P|NP|PSPACE|NP-complete|EXPTIME|co-NP|...>",
    "reducesTo": ["<problem id>"],
    "reducesFrom": ["<problem id>"]
  },
  "currentMachine": {
    "id": "<machine_id>",
    "name": "<human name>",
    "description": "<what it computes>",
    "states": ["<state>"],
    "inputAlphabet": ["<symbol>"],
    "tapeAlphabet": ["<symbol>"],
    "blankSymbol": "<blank>",
    "transitions": [
      {
        "fromState": "<state>",
        "readSymbol": "<symbol>",
        "toState": "<state>",
        "writeSymbol": "<symbol>",
        "direction": "<L|R|S>"
      }
    ],
    "initialState": "<state>",
    "acceptStates": ["<state>"],
    "rejectStates": ["<state>"],
    "type": "<deterministic|nondeterministic|multi_tape|oracle>"
  },
  "computationTrace": {
    "machine": "<machine id>",
    "input": "<input string>",
    "steps": [
      {
        "stepNumber": <integer>,
        "state": "<state>",
        "tapeContents": "<tape string>",
        "headPosition": <integer>
      }
    ],
    "result": "<accept|reject|loop|running>",
    "totalSteps": <integer>,
    "spaceUsed": <integer>,
    "isTerminating": <true|false>,
    "terminationReason": "<optional explanation>"
  },
  "decidabilityProof": {
    "id": "<proof_id>",
    "problem": "<problem name>",
    "conclusion": "<decidable|semi_decidable|undecidable>",
    "method": "<direct_machine|reduction|diagonalization|rice_theorem|oracle>",
    "knownUndecidableProblem": "<ATM|Halting Problem|...>"
  },
  "complexityAnalysis": {
    "complexityClass": "<complexity class>",
    "justification": "<why this class applies>",
    "timeComplexity": "<big-O expression>",
    "spaceComplexity": "<big-O expression>",
    "isComplete": <true|false>,
    "reductionFrom": "<problem used to show completeness>"
  },
  "diagonalization": {
    "id": "<argument id>",
    "enumeration": {
      "description": "<what is being enumerated>",
      "indexSet": "<usually ℕ>",
      "enumeratedObjects": "<type of objects>"
    }
  },
  "reductions": [
    {
      "id": "<reduction_id>",
      "fromProblem": "<source problem>",
      "toProblem": "<target problem>",
      "type": "<many_one|turing|polynomial_time|log_space>",
      "reductionFunction": {
        "description": "<informal description>",
        "inputTransformation": "<how input is transformed>",
        "outputInterpretation": "<how target output is interpreted>",
        "preserves": "<yes/no answers|membership|...>"
      }
    }
  ],
  "reductionChain": ["<problem 1>", "<problem 2>", "..."],
  "classicProblems": ["<ATM|HALT_TM|ETM|EQTM|...>"],
  "dependencies": ["<Turing's 1936 paper|Church-Turing thesis|...>"],
  "assumptions": ["<Turing machine model captures effective computation>"],
  "uncertainty": <number 0-1>,
  "keyInsight": "<the crucial logical move of this reasoning step>"
}
```

## Required Fields

- `mode` — always `"computability"`
- `thoughtType` — the type of computability reasoning step
- `dependencies` — foundational results this reasoning relies on
- `assumptions` — including Church-Turing thesis when applicable
- `uncertainty` — near 0 for established results (Halting Problem undecidable), near 0.5 for open questions (P vs NP)

## Decidability Status Reference

| Status | Meaning |
|--------|---------|
| `decidable` | A TM halts on all inputs and always gives the correct yes/no answer |
| `semi_decidable` | A TM accepts all yes-instances but may loop forever on no-instances |
| `undecidable` | No TM can decide the problem; proven via reduction, diagonalization, or Rice's theorem |
| `unknown` | Current state of knowledge cannot classify the problem |

## Proof Methods

| Method | When to use |
|--------|-------------|
| `direct_machine` | Show decidability by constructing an explicit deciding TM |
| `reduction` | Show undecidability: assume your problem P is decidable; use it to decide ATM; contradiction |
| `diagonalization` | Self-referential argument (Turing 1936 original technique for HALT) |
| `rice_theorem` | Any non-trivial semantic property of TM languages is undecidable |
| `oracle` | Use oracle relative computability to separate complexity classes |

## Complexity Class Reference

| Class | Informal definition |
|-------|---------------------|
| P | Solvable in polynomial time by a deterministic TM |
| NP | Solvable in polynomial time by a nondeterministic TM; witnesses verifiable in polynomial time |
| co-NP | Complement is in NP |
| PSPACE | Solvable in polynomial space |
| NP-complete | In NP and every NP problem polynomial-time reduces to it |
| EXPTIME | Solvable in exponential time |

## Worked Example

Input: "Is the Halting Problem decidable?"

Output:

```json
{
  "mode": "computability",
  "thoughtType": "decidability_proof",
  "currentProblem": {
    "id": "halting_problem",
    "name": "The Halting Problem (HALT_TM)",
    "description": "Given ⟨M, w⟩, does Turing machine M halt on input w?",
    "inputFormat": "Encoding ⟨M, w⟩ of TM M and string w",
    "question": "Does M halt on input w?",
    "yesInstances": ["⟨M_accept_all, ε⟩"],
    "noInstances": ["⟨M_loop, ε⟩ where M_loop never halts"],
    "decidabilityStatus": "semi_decidable",
    "complexityClass": null
  },
  "decidabilityProof": {
    "id": "halt_proof",
    "problem": "The Halting Problem",
    "conclusion": "undecidable",
    "method": "diagonalization",
    "knownUndecidableProblem": null
  },
  "dependencies": ["universal Turing machine", "Church-Turing thesis"],
  "assumptions": ["Turing machines capture all effective computation"],
  "uncertainty": 0.01,
  "keyInsight": "Assume decider H for HALT exists. Build D: on ⟨M⟩, run H on ⟨M,⟨M⟩⟩; loop if H says halts, accept if H says loops. Running D on ⟨D⟩ yields contradiction. Therefore H cannot exist."
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"computability"`
- `currentProblem.decidabilityStatus` is one of the four named values
- `decidabilityProof.method` is specified for all undecidability proofs
- For Rice's theorem: `riceApplication.isNontrivial` and `riceApplication.isSemantic` are both verified
- Complexity class assignments name a standard class (P, NP, co-NP, PSPACE, NP-complete, EXPTIME, etc.)
- `keyInsight` captures the logical core — do not leave it empty
- `uncertainty` is near 0 for classical results, use higher values only for open problems
- Decidable vs. semi-decidable distinction is preserved — do not conflate them
- Reduction direction is correct: to prove P undecidable, reduce FROM a known undecidable problem TO P
