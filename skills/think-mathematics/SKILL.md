---
name: think-mathematics
description: Mathematical, physical, and computational reasoning methods — Mathematics (proofs, algebra, calculus), Physics (tensors, conservation laws, symmetries), and Computability (Turing machines, decidability, complexity classes). Use when the user invokes `/think mathematics`, `/think physics`, or `/think computability`, or asks about formal proofs, physical models, or computability/complexity questions.
argument-hint: "[mathematics|physics|computability] <problem>"
---

# think-mathematics — Mathematical and Computational Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `mathematics`, `physics`, or `computability`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains three formal reasoning methods: **Mathematical** (proof construction, theorem verification, symbolic computation), **Physical** (tensor mathematics, conservation laws, field theory, symmetry analysis), and **Computability** (Turing machines, decidability proofs, complexity classification).

---

## Mathematical Reasoning

Mathematical reasoning constructs rigorous logical arguments from axioms and definitions to conclusions via explicit proof strategies. It tracks the dependency structure of each step — what it relies on and whether any gaps or implicit assumptions remain.

### When to Use

- Constructing or verifying a formal proof (direct, contradiction, induction, contrapositive)
- Stating and checking theorems: hypotheses, conclusions, and completeness
- Symbolic computation: algebraic manipulations, simplifications, limit analysis
- Analyzing proof structure: finding gaps, unjustified leaps, or implicit assumptions
- Building or evaluating mathematical models

**Do not use Mathematical** when:
- The problem is a physical model with units and conservation laws → use Physical
- The question is about what can or cannot be computed → use Computability
- You need probabilistic inference rather than deductive proof → use Bayesian or Evidential

### How to Reason Mathematically

1. **Define the theorem.** State hypotheses and the conclusion clearly. Identify dependencies (prior results, definitions).
2. **Choose a proof strategy.** Common strategies:
   - **Direct** — Chain of logical implications from hypotheses to conclusion
   - **Contradiction** — Assume the negation, derive a contradiction
   - **Induction** — Base case + inductive step for statements about integers or recursive structures
   - **Contrapositive** — Prove ¬Q → ¬P instead of P → Q
   - **Construction** — Exhibit an object satisfying the required properties
3. **State each step explicitly.** Each step should name the inference rule or theorem it relies on.
4. **Record dependencies.** List which prior results each step depends on.
5. **Identify gaps.** Are any steps unjustified leaps? Are there implicit assumptions (existence, uniqueness, well-ordering) that should be explicit?
6. **Assign uncertainty.** A number in [0, 1] — lower for fully rigorous proofs, higher when steps are informal or gaps remain.

### Output Format

See `reference/output-formats/mathematics.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "mathematics",
  "thoughtType": "proof_construction",
  "theorems": [
    {
      "name": "<theorem name>",
      "statement": "<full statement>",
      "hypotheses": ["<hyp 1>", "<hyp 2>"],
      "conclusion": "<conclusion>"
    }
  ],
  "proofStrategy": {
    "type": "<direct|contradiction|induction|contrapositive|construction>",
    "steps": ["<step 1>", "<step 2>", "<step 3>"],
    "completeness": <0.0 to 1.0>
  },
  "dependencies": ["<prior result or definition>"],
  "assumptions": ["<explicit assumption>"],
  "uncertainty": <0.0 to 1.0>
}
```

### Verification Before Emitting

- `mode` is exactly `"mathematics"`
- `theorems` states both `hypotheses` and `conclusion`
- `proofStrategy.type` is one of the named strategies
- `proofStrategy.steps` is non-empty
- `dependencies` lists every named theorem or definition used
- `assumptions` makes implicit assumptions explicit
- `uncertainty` is lower when the proof is complete and every step is justified
- If gaps exist, surface them in `gapAnalysis` or note them in the natural-language summary

### Worked Example

Input: "Prove that √2 is irrational."

Output:

```json
{
  "mode": "mathematics",
  "thoughtType": "proof_construction",
  "theorems": [
    {
      "name": "Irrationality of √2",
      "statement": "√2 is not a rational number",
      "hypotheses": ["√2 is expressible as p/q with p, q ∈ ℤ and gcd(p, q) = 1"],
      "conclusion": "The assumption leads to a contradiction; therefore √2 ∉ ℚ"
    }
  ],
  "proofStrategy": {
    "type": "contradiction",
    "steps": [
      "Assume √2 = p/q with p, q integers and gcd(p, q) = 1 (lowest terms)",
      "Then 2 = p²/q², so p² = 2q²",
      "Therefore p² is even, which means p is even (if p² is even then p is even)",
      "Write p = 2k; substitute: (2k)² = 2q², so 4k² = 2q², so q² = 2k²",
      "Therefore q² is even, so q is even",
      "But p and q both even contradicts gcd(p, q) = 1"
    ],
    "completeness": 0.98
  },
  "dependencies": ["definition of rational number", "even integer divisibility", "gcd definition"],
  "assumptions": ["integers are well-ordered", "gcd is well-defined for non-zero integers"],
  "uncertainty": 0.05
}
```

Natural-language summary: "Classic proof by contradiction. The key move is the parity cascade: p² even forces p even, which when substituted forces q² even, which forces q even — contradicting the reduced-form assumption. Every step relies only on divisibility properties of integers. Completeness is 0.98 rather than 1.0 because the step 'p² even implies p even' deserves an explicit justification (the contrapositive of 'p odd implies p² odd')."

---

## Physical Reasoning

Physical reasoning models systems using tensor mathematics, field theory, conservation laws, and symmetry analysis. It moves from physical quantities through mathematical formulation to physical interpretation, maintaining rigorous tracking of units, symmetry groups, and dimensional consistency.

### When to Use

- Modeling physical phenomena mathematically (mechanics, electromagnetism, quantum, relativity)
- Tensor analysis: specifying rank, index structure, symmetries, invariants, coordinate system
- Applying conservation laws (energy, momentum, charge, angular momentum)
- Deriving consequences of gauge symmetries via Noether's theorem
- Dimensional analysis: checking that equations are dimensionally consistent

**Do not use Physical** when:
- The problem is a pure mathematical proof with no physical quantities → use Mathematical
- You need probabilistic or statistical inference about physical measurements → use Bayesian
- The question concerns only what can be computed → use Computability

### How to Reason Physically

1. **Formulate the physical quantity.** Name it, state its units, and classify its tensor rank (scalar = rank 0, vector = rank 1, 2-tensor = rank 2, etc.).
2. **Specify tensor properties.** For each tensor: `rank` as [contravariant, covariant], `components` (index notation), `symmetries` (symmetric/antisymmetric), `invariants`, and `coordinateSystem`.
3. **Identify symmetries.** What symmetry group governs the system? What are the gauge symmetries? Apply Noether's theorem: each continuous symmetry → a conserved quantity.
4. **Apply conservation laws.** State which laws apply (energy, momentum, charge) and their mathematical form (continuity equation ∂_μJ^μ = 0, etc.).
5. **Check dimensional consistency.** Verify that each term in an equation shares the same physical dimensions. Catch errors before interpretation.
6. **Interpret physically.** Connect the mathematics back to observables, constraints, and physical meaning.

### Output Format

See `reference/output-formats/physics.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "physics",
  "thoughtType": "<tensor_formulation|gauge_theory|conservation_law|dimensional_analysis|symmetry_analysis>",
  "tensorProperties": {
    "rank": [<contravariant>, <covariant>],
    "components": "<index notation>",
    "latex": "<LaTeX>",
    "symmetries": ["<symmetry>"],
    "invariants": ["<invariant expression>"],
    "transformation": "<covariant|contravariant|mixed>",
    "indexStructure": "<description>",
    "coordinateSystem": "<Minkowski|Euclidean|...>"
  },
  "physicalInterpretation": {
    "quantity": "<physical quantity name>",
    "units": "<SI units>",
    "conservationLaws": ["<law in mathematical form>"],
    "constraints": ["<physical constraint>"],
    "observables": ["<measurable quantity>"]
  },
  "fieldTheoryContext": {
    "fields": ["<field 1>"],
    "interactions": ["<interaction>"],
    "symmetryGroup": "<group>",
    "gaugeSymmetries": ["<transformation>"]
  },
  "dependencies": ["<prior result>"],
  "assumptions": ["<physical assumption>"],
  "uncertainty": <0.0 to 1.0>
}
```

### Verification Before Emitting

- `mode` is exactly `"physics"`
- `thoughtType` matches the reasoning step being performed
- `tensorProperties.rank` is a two-element array [contravariant_count, covariant_count]
- `tensorProperties.symmetries` describes antisymmetry, symmetry, or trace conditions
- `physicalInterpretation.conservationLaws` is in mathematical form (not just "energy is conserved")
- `fieldTheoryContext.symmetryGroup` names the Lie group (U(1), SU(2), SU(3), Poincaré, etc.)
- Units are in SI or stated explicitly; dimensions are consistent across each equation
- `assumptions` lists physical idealizations (flat spacetime, no sources, weak field, etc.)

### Worked Example

Input: "Analyze the electromagnetic field tensor and derive charge conservation from gauge symmetry."

Output (step 1 — tensor formulation):

```json
{
  "mode": "physics",
  "thoughtType": "tensor_formulation",
  "tensorProperties": {
    "rank": [0, 2],
    "components": "F_{μν} = ∂_μA_ν - ∂_νA_μ",
    "latex": "F_{\\mu\\nu} = \\partial_\\mu A_\\nu - \\partial_\\nu A_\\mu",
    "symmetries": ["antisymmetric: F_{μν} = -F_{νμ}", "6 independent components in 4D"],
    "invariants": ["F_{μν}F^{μν} = 2(B² - E²/c²)", "F_{μν}*F^{μν} ∝ E·B"],
    "transformation": "covariant",
    "indexStructure": "(0,2) antisymmetric tensor",
    "coordinateSystem": "Minkowski"
  },
  "dependencies": ["Maxwell equations", "vector potential definition A_μ"],
  "assumptions": ["flat spacetime", "no sources in vacuum"],
  "uncertainty": 0.05
}
```

Output (step 2 — conservation from gauge symmetry):

```json
{
  "mode": "physics",
  "thoughtType": "conservation_law",
  "fieldTheoryContext": {
    "fields": ["A_μ (gauge potential)", "J^μ (4-current)"],
    "interactions": ["minimal coupling: ∂_μ → D_μ = ∂_μ + ieA_μ"],
    "symmetryGroup": "U(1)",
    "gaugeSymmetries": ["A_μ → A_μ + ∂_μλ", "ψ → e^{ieλ}ψ"]
  },
  "physicalInterpretation": {
    "quantity": "electric charge",
    "units": "C (coulombs)",
    "conservationLaws": ["∂_μJ^μ = 0 (4-divergence of current vanishes)"],
    "constraints": ["local U(1) gauge invariance"],
    "observables": ["total charge Q = ∫d³x J⁰"]
  },
  "dependencies": ["Noether's theorem", "U(1) gauge symmetry", "tensor_formulation step"],
  "assumptions": ["Noether's theorem applies", "action is gauge-invariant"],
  "uncertainty": 0.05
}
```

Natural-language summary: "The antisymmetry of F_{μν} encodes that the electromagnetic field has 6 independent components (3 for E, 3 for B) and that the Bianchi identity ∂_{[μ}F_{νρ]} = 0 is automatic. U(1) gauge invariance via Noether's theorem directly implies ∂_μJ^μ = 0 — charge is conserved as a consequence of the symmetry, not as a separate postulate."

---

## Computability and Complexity

Computability reasoning analyzes what can and cannot be computed, distinguishing **decidability** (does a Turing machine always halt with yes/no?) from **tractability** (is a decidable problem solvable efficiently?). It uses Turing machine definitions, computation traces, reductions, diagonalization, and complexity class classification.

### When to Use

- Defining Turing machines formally: states, tape alphabet, transitions
- Tracing computation step-by-step on a specific input
- Proving a problem is undecidable (via reduction from Halting Problem, Rice's theorem, diagonalization)
- Proving a problem is decidable by exhibiting a deciding machine
- Classifying problems into complexity classes: P, NP, PSPACE, EXP, co-NP, NP-complete, etc.
- Analyzing the structure of reductions: many-one, polynomial-time, log-space

**Do not use Computability** when:
- You need to implement an algorithm efficiently — that is engineering, not computability theory
- You want to prove a mathematical theorem without computational content → use Mathematical
- You are modeling a physical system → use Physical

**Key distinction — decidability vs. tractability:**
- **Decidability** asks: does any Turing machine halt on all inputs with the correct answer? An undecidable problem has no such machine, regardless of time or space.
- **Tractability** asks: can a decidable problem be solved within polynomial time (P) or verified in polynomial time (NP)? A problem can be decidable but completely intractable (EXPTIME or higher).

### How to Reason About Computability

1. **Specify the decision problem.** State the input format, the yes/no question, yes-instances, and no-instances.
2. **Classify the decidability status.** Is it decidable, semi-decidable (recognizable), or undecidable?
   - *Decidable*: exhibit a Turing machine that halts on all inputs.
   - *Semi-decidable*: the machine halts and accepts on yes-instances but may loop on no-instances.
   - *Undecidable*: prove via reduction, diagonalization, or Rice's theorem.
3. **For undecidability proofs — choose a method:**
   - **Reduction from ATM/Halting Problem** — Assume your problem P is decidable; use it to decide ATM; contradiction.
   - **Rice's Theorem** — Any non-trivial semantic property of the language recognized by a TM is undecidable.
   - **Diagonalization** — Self-referential argument (Turing's original 1936 technique).
4. **For decidability proofs — construct the machine.** Give states, alphabet, transitions, and argue termination.
5. **For complexity classification.** State the complexity class and justify:
   - **P**: polynomial-time deterministic algorithm exists
   - **NP**: polynomial-time nondeterministic algorithm, or polynomial-time verifier for witnesses
   - **PSPACE**: polynomial space; includes NP and co-NP
   - **NP-complete**: in NP and every NP problem reduces to it in polynomial time
6. **Construct the reduction** (if applicable). Specify: source problem, target problem, reduction type (many-one, polynomial-time), the transformation function, and what property it preserves.

### Output Format

See `reference/output-formats/computability.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "computability",
  "thoughtType": "<machine_definition|computation_trace|decidability_proof|reduction|complexity_analysis>",
  "currentProblem": {
    "id": "<problem_id>",
    "name": "<problem name>",
    "description": "<description>",
    "inputFormat": "<what inputs look like>",
    "question": "<yes/no question>",
    "yesInstances": ["<example>"],
    "noInstances": ["<example>"],
    "decidabilityStatus": "<decidable|semi_decidable|undecidable>",
    "complexityClass": "<P|NP|PSPACE|NP-complete|...>"
  },
  "decidabilityProof": {
    "id": "<proof_id>",
    "problem": "<problem name>",
    "conclusion": "<decidable|semi_decidable|undecidable>",
    "method": "<direct_machine|reduction|diagonalization|rice_theorem>",
    "knownUndecidableProblem": "<ATM|Halting Problem|...>"
  },
  "dependencies": ["<prior result>"],
  "assumptions": ["<assumption>"],
  "uncertainty": <0.0 to 1.0>,
  "keyInsight": "<the crucial insight of this reasoning step>"
}
```

### Verification Before Emitting

- `mode` is exactly `"computability"`
- `currentProblem.decidabilityStatus` is one of `"decidable"`, `"semi_decidable"`, `"undecidable"`
- For undecidability proofs: `decidabilityProof.method` is set and the reduction/diagonalization is described
- For decidability proofs: a deciding machine (`decidingMachine`) or explicit algorithm is provided
- Complexity class assignments (if present) name a standard class: P, NP, co-NP, PSPACE, EXPTIME, NP-complete, etc.
- `keyInsight` captures the essential logical move (e.g., "assuming decidability lets us solve ATM")
- `uncertainty` is near 0 for established results (Halting Problem undecidability), higher for open questions (P vs NP)
- The distinction between decidable and semi-decidable (recognizable) is preserved — do not conflate them

### Worked Example

Input: "Is the Halting Problem decidable? Prove it."

Output:

```json
{
  "mode": "computability",
  "thoughtType": "decidability_proof",
  "currentProblem": {
    "id": "halting_problem",
    "name": "The Halting Problem",
    "description": "Given a Turing machine M and input w, does M halt on w?",
    "inputFormat": "Encoding ⟨M, w⟩ of a Turing machine M and string w",
    "question": "Does M halt on input w?",
    "yesInstances": ["⟨M_trivial, ε⟩ where M_trivial immediately accepts"],
    "noInstances": ["⟨M_loop, ε⟩ where M_loop loops forever on all inputs"],
    "decidabilityStatus": "semi_decidable",
    "complexityClass": null
  },
  "decidabilityProof": {
    "id": "halt_undecidability",
    "problem": "The Halting Problem",
    "conclusion": "undecidable",
    "method": "diagonalization",
    "knownUndecidableProblem": null
  },
  "dependencies": ["definition of Turing machine", "Church-Turing thesis", "universal Turing machine"],
  "assumptions": ["Turing machine model captures all effective computation"],
  "uncertainty": 0.01,
  "keyInsight": "Assume a decider H exists for HALT. Construct D that runs H on ⟨D, D⟩ and does the opposite of what H predicts. D halts iff D does not halt — a contradiction. Therefore H cannot exist."
}
```

Natural-language summary: "The Halting Problem is semi-decidable (a universal TM accepts whenever M halts) but undecidable overall. Turing's 1936 diagonalization argument is the proof: any hypothetical decider H can be weaponized into a self-contradicting machine D. The Halting Problem is the canonical undecidable problem from which most other undecidability results follow by reduction. Note the distinction: 'undecidable' means no TM decides it in finite time; it does not mean we can never determine the answer for specific instances."
