# Mathematics Reasoning Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_mathematics`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/mathematics.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `MathematicsThoughtType`, `InferenceRule`, `InconsistencyType`
- **Interfaces**: `AtomicStatement`, `DependencyEdge`, `DependencyGraph`, `ProofGap`, `ImplicitAssumption`, `AssumptionChain`, `ProofDecomposition`, `Inconsistency`, `CircularPath`, `ConsistencyReport`, `GapAnalysis`, `AssumptionAnalysis`, `MathematicalModel`, `ProofStrategy`, `Theorem`, `Reference`, `LogicalForm`, `MathematicsThought`
- **Functions**: `isMathematicsThought`

---

## Overview

Mathematics mode provides **formal mathematical reasoning** with support for proofs, theorems, symbolic computation, and rigorous logical deduction. It's designed for problems requiring mathematical precision, including **proof decomposition** and **inconsistency detection** (Phase 8 extensions).

This mode captures the structure of mathematical reasoning - from axiom definitions through proof construction to final conclusions.

## Thought Types

### Original Types
| Type | Description |
|------|-------------|
| `axiom_definition` | Define foundational axioms |
| `theorem_statement` | State theorems to be proved |
| `proof_construction` | Build proofs step by step |
| `lemma_derivation` | Derive supporting lemmas |
| `corollary` | Derive corollaries from theorems |
| `counterexample` | Construct counterexamples |
| `algebraic_manipulation` | Perform algebraic transformations |
| `symbolic_computation` | Symbolic mathematical operations |
| `numerical_analysis` | Numerical methods and analysis |

### Phase 8 Extensions (v7.0.0)
| Type | Description |
|------|-------------|
| `proof_decomposition` | Break proofs into atomic components |
| `dependency_analysis` | Analyze statement dependencies |
| `consistency_check` | Check for contradictions |
| `gap_identification` | Find missing proof steps |
| `assumption_trace` | Trace back to axioms |

## When to Use Mathematics Mode

Use mathematics mode when you need to:

- **Construct formal proofs** - Rigorous mathematical arguments
- **Define and verify theorems** - State and prove mathematical claims
- **Perform symbolic computation** - Algebraic manipulations, simplifications
- **Analyze proof structure** - Find gaps, check consistency
- **Work with mathematical models** - Create and manipulate models

### Problem Types Well-Suited for Mathematics Mode

- **Theorem proving** - Mathematical proofs of all kinds
- **Algebraic problems** - Symbolic manipulation, solving equations
- **Numerical analysis** - Approximation, convergence, error analysis
- **Logic problems** - Formal logical reasoning
- **Model verification** - Checking mathematical models

## Core Concepts

### Mathematical Model

```typescript
interface MathematicalModel {
  latex: string;           // LaTeX representation
  symbolic: string;        // Symbolic notation
  ascii?: string;          // ASCII fallback
  tensorRank?: number;     // For tensor expressions
  dimensions?: number[];   // Dimensional information
  invariants?: string[];   // Mathematical invariants
  symmetries?: string[];   // Symmetry properties
  complexity?: string;     // Complexity notes
  stabilityNotes?: string; // Stability analysis
  validated?: boolean;     // Has the model been validated?
  validationMethod?: string;
}
```

### Proof Strategy

```typescript
interface ProofStrategy {
  type: 'direct' | 'contradiction' | 'induction' | 'construction' | 'contrapositive';
  steps: string[];
  baseCase?: string;       // For induction
  inductiveStep?: string;  // For induction
  completeness: number;    // 0-1
}
```

### Inference Rules

Supported inference rules for formal reasoning:
- `modus_ponens` - P, P→Q ⊢ Q
- `modus_tollens` - ¬Q, P→Q ⊢ ¬P
- `hypothetical_syllogism` - P→Q, Q→R ⊢ P→R
- `disjunctive_syllogism` - P∨Q, ¬P ⊢ Q
- `universal_instantiation` - ∀x.P(x) ⊢ P(a)
- `existential_generalization` - P(a) ⊢ ∃x.P(x)
- `mathematical_induction` - P(0), P(n)→P(n+1) ⊢ ∀n.P(n)
- `contradiction` - P, ¬P ⊢ ⊥
- `direct_implication` - Γ ⊢ Q from Γ ⊢ P, P→Q
- `substitution` - P(a), a=b ⊢ P(b)
- `algebraic_manipulation` - Algebraic transformation
- `definition_expansion` - Expanding definitions

### Proof Decomposition (Phase 8)

Break proofs into atomic statements with dependency tracking:

```typescript
interface ProofDecomposition {
  id: string;
  originalProof: string;
  theorem?: string;
  atoms: AtomicStatement[];
  dependencies: DependencyGraph;
  assumptionChains: AssumptionChain[];
  gaps: ProofGap[];
  implicitAssumptions: ImplicitAssumption[];
  completeness: number;
  rigorLevel: 'informal' | 'textbook' | 'rigorous' | 'formal';
  atomCount: number;
  maxDependencyDepth: number;
}
```

### Consistency Checking

Detect inconsistencies in reasoning:
- `direct_contradiction` - P and ¬P both derived
- `circular_reasoning` - Conclusion used in own proof
- `type_mismatch` - Applying operation to wrong type
- `domain_violation` - Using value outside defined domain
- `undefined_operation` - Division by zero, etc.
- `axiom_conflict` - Conflicting axioms
- `hidden_assumption` - Unstated required assumptions
- `quantifier_error` - Scope or binding issues
- `equivalence_failure` - Claimed equivalence that doesn't hold

## Usage Example

```typescript
// Define a theorem
const theorem = await deepthinking_mathematics({
  mode: 'mathematics',
  thought: 'State the fundamental theorem of calculus',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'theorem_statement',
  theorems: [{
    name: 'Fundamental Theorem of Calculus (Part 1)',
    statement: 'If f is continuous on [a,b] and F(x) = ∫ₐˣ f(t)dt, then F is differentiable and F\'(x) = f(x)',
    hypotheses: ['f continuous on [a,b]', 'F(x) = ∫ₐˣ f(t)dt'],
    conclusion: 'F\'(x) = f(x)'
  }],
  dependencies: ['continuity definition', 'integral definition'],
  assumptions: ['f is integrable'],
  uncertainty: 0.1
});

// Construct a proof
const proof = await deepthinking_mathematics({
  mode: 'mathematics',
  thought: 'Prove using definition of derivative and properties of integrals',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'proof_construction',
  proofStrategy: {
    type: 'direct',
    steps: [
      'Consider (F(x+h) - F(x))/h',
      'Express as (1/h)∫ₓˣ⁺ʰ f(t)dt',
      'Apply mean value theorem for integrals',
      'Take limit as h → 0'
    ],
    completeness: 0.85
  },
  dependencies: ['theorem_statement'],
  assumptions: ['mean value theorem applies'],
  uncertainty: 0.15,

  logicalForm: {
    premises: ['f continuous', 'integral well-defined'],
    conclusion: 'F differentiable with F\' = f',
    inferenceRule: 'direct_implication',
    rules: ['limit definition', 'integral properties']
  }
});

// Analyze proof for gaps (Phase 8)
const analysis = await deepthinking_mathematics({
  mode: 'mathematics',
  thought: 'Check proof for gaps and implicit assumptions',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'gap_identification',
  gapAnalysis: {
    completeness: 0.85,
    gaps: [{
      id: 'gap_1',
      type: 'unjustified_leap',
      location: { from: 'step_2', to: 'step_3' },
      description: 'Mean value theorem application needs justification',
      severity: 'minor',
      suggestedFix: 'Cite integral MVT explicitly'
    }],
    implicitAssumptions: [{
      id: 'impl_1',
      statement: 'h can be either positive or negative',
      type: 'domain_assumption',
      usedInStep: 'step_1',
      shouldBeExplicit: true,
      suggestedFormulation: 'Consider limits from both sides'
    }],
    unjustifiedSteps: [],
    suggestions: ['Make two-sided limit explicit']
  },
  dependencies: ['proof_construction'],
  assumptions: [],
  uncertainty: 0.2
});
```

## Best Practices

### Theorem Construction

✅ **Do:**
- State hypotheses clearly and completely
- Make conclusions precise and unambiguous
- Include references to supporting theorems

❌ **Don't:**
- Leave hypotheses implicit
- Make vague or ambiguous claims
- Skip important conditions

### Proof Construction

✅ **Do:**
- Choose appropriate proof strategy
- Make each step explicit
- Cite inference rules used
- Track dependencies carefully

❌ **Don't:**
- Skip steps assuming they're "obvious"
- Use undefined terms
- Make unjustified leaps

### Using Phase 8 Features

✅ **Do:**
- Decompose complex proofs into atoms
- Analyze dependency structure
- Check for consistency issues
- Identify and address gaps

❌ **Don't:**
- Skip consistency checking
- Ignore implicit assumptions
- Leave gaps unaddressed

## MathematicsThought Interface

```typescript
interface MathematicsThought extends BaseThought {
  mode: ThinkingMode.MATHEMATICS;
  thoughtType: MathematicsThoughtType;
  mathematicalModel?: MathematicalModel;
  proofStrategy?: ProofStrategy;
  theorems?: Theorem[];
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  logicalForm?: LogicalForm;
  references?: Reference[];

  // Phase 8: Proof Decomposition Fields
  decomposition?: ProofDecomposition;
  consistencyReport?: ConsistencyReport;
  gapAnalysis?: GapAnalysis;
  assumptionAnalysis?: AssumptionAnalysis;
}
```

## Integration with Other Modes

Mathematics mode integrates with:

- **Physics Mode** - Mathematical physics, field equations
- **Formal Logic Mode** - Logical foundations of mathematics
- **Shannon Mode** - Mathematical modeling in the model stage
- **Algorithmic Mode** - Complexity analysis, correctness proofs
- **Optimization Mode** - Mathematical optimization

## Related Modes

- [Physics Mode](./PHYSICS.md) - Physical mathematics
- [Formal Logic Mode](./FORMALLOGIC.md) - Logical reasoning
- [Algorithmic Mode](./ALGORITHMIC.md) - Algorithm analysis
- [Optimization Mode](./OPTIMIZATION.md) - Mathematical optimization

## Limitations

- **Requires mathematical expertise** - Best results with mathematical knowledge
- **Symbolic only** - Numerical computation limited
- **No automated proving** - Proofs require human guidance

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
