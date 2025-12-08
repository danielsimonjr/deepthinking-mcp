# Physics Reasoning Mode

**Version**: 7.3.0
**Tool**: `deepthinking_math`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/physics.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `PhysicsThoughtType`
- **Interfaces**: `TensorProperties`, `PhysicalInterpretation`, `FieldTheoryContext`, `PhysicsThought`
- **Functions**: `isPhysicsThought`

---

## Overview

Physics mode provides **physical modeling** with tensor mathematics, field theory, and physical interpretation. It's designed for problems requiring rigorous physical reasoning, including symmetry analysis, gauge theory, conservation laws, and dimensional analysis.

This mode captures the structure of theoretical physics reasoning - from physical quantities through mathematical formulation to physical interpretation.

## Thought Types

| Type | Description |
|------|-------------|
| `symmetry_analysis` | Analyze symmetries of physical systems |
| `gauge_theory` | Gauge symmetry and gauge transformations |
| `field_equations` | Derive and analyze field equations |
| `lagrangian` | Lagrangian mechanics and variational principles |
| `hamiltonian` | Hamiltonian mechanics and phase space |
| `conservation_law` | Conservation laws and Noether's theorem |
| `dimensional_analysis` | Dimensional consistency and analysis |
| `tensor_formulation` | Tensor calculus and formulation |
| `differential_geometry` | Geometric methods in physics |

## When to Use Physics Mode

Use physics mode when you need to:

- **Model physical systems** - Mathematically describe physical phenomena
- **Analyze symmetries** - Find and exploit symmetries
- **Work with tensors** - Tensor mathematics and index notation
- **Apply conservation laws** - Energy, momentum, charge conservation
- **Perform dimensional analysis** - Check dimensional consistency

### Problem Types Well-Suited for Physics Mode

- **Classical mechanics** - Lagrangian/Hamiltonian formulations
- **Field theory** - Electromagnetic, gravitational, quantum fields
- **Relativity** - Special and general relativistic problems
- **Quantum mechanics** - Operator methods, symmetries
- **Statistical mechanics** - Ensemble theory, thermodynamics

## Core Concepts

### Tensor Properties

```typescript
interface TensorProperties {
  rank: [number, number];    // [contravariant, covariant] indices
  components: string;        // Component expression
  latex: string;             // LaTeX representation
  symmetries: string[];      // Symmetry properties
  invariants: string[];      // Scalar invariants
  transformation: 'covariant' | 'contravariant' | 'mixed';
  indexStructure?: string;   // Index pattern
  coordinateSystem?: string; // Coordinate system
}
```

### Physical Interpretation

```typescript
interface PhysicalInterpretation {
  quantity: string;          // Physical quantity name
  units: string;             // SI units
  conservationLaws: string[]; // Related conservation laws
  constraints?: string[];    // Physical constraints
  observables?: string[];    // Observable quantities
}
```

### Field Theory Context

```typescript
interface FieldTheoryContext {
  fields: string[];          // Field names
  interactions: string[];    // Interaction terms
  symmetryGroup: string;     // Symmetry group (e.g., "SU(3) × SU(2) × U(1)")
  gaugeSymmetries?: string[]; // Gauge symmetries
}
```

## Usage Example

```typescript
// Define a physics problem with tensor formulation
const tensorAnalysis = await deepthinking_math({
  mode: 'physics',
  thought: 'Analyze the electromagnetic field tensor',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'tensor_formulation',
  tensorProperties: {
    rank: [0, 2],
    components: 'F_{μν} = ∂_μA_ν - ∂_νA_μ',
    latex: 'F_{\\mu\\nu} = \\partial_\\mu A_\\nu - \\partial_\\nu A_\\mu',
    symmetries: ['antisymmetric: F_{μν} = -F_{νμ}'],
    invariants: ['F_{μν}F^{μν}', 'F_{μν}*F^{μν}'],
    transformation: 'covariant',
    indexStructure: '(0,2) antisymmetric',
    coordinateSystem: 'Minkowski'
  },
  dependencies: ['Maxwell equations', 'vector potential'],
  assumptions: ['flat spacetime', 'no sources'],
  uncertainty: 0.1
});

// Symmetry analysis
const symmetry = await deepthinking_math({
  mode: 'physics',
  thought: 'Analyze gauge symmetry of electromagnetism',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'gauge_theory',
  fieldTheoryContext: {
    fields: ['A_μ (gauge potential)', 'ψ (matter field)'],
    interactions: ['minimal coupling: ∂_μ → D_μ = ∂_μ + ieA_μ'],
    symmetryGroup: 'U(1)',
    gaugeSymmetries: ['A_μ → A_μ + ∂_μλ', 'ψ → e^{ieλ}ψ']
  },
  dependencies: ['tensor_formulation'],
  assumptions: ['local gauge invariance'],
  uncertainty: 0.15
});

// Conservation law derivation
const conservation = await deepthinking_math({
  mode: 'physics',
  thought: 'Derive charge conservation from gauge symmetry',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'conservation_law',
  physicalInterpretation: {
    quantity: 'electric charge',
    units: 'C (coulombs)',
    conservationLaws: ['∂_μJ^μ = 0 (continuity equation)'],
    constraints: ['gauge invariance'],
    observables: ['total charge Q = ∫d³x J⁰']
  },
  dependencies: ['gauge_theory'],
  assumptions: ['Noether theorem applies'],
  uncertainty: 0.1
});

// Dimensional analysis
const dimensions = await deepthinking_math({
  mode: 'physics',
  thought: 'Verify dimensional consistency of field equations',
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'dimensional_analysis',
  physicalInterpretation: {
    quantity: 'Maxwell equations',
    units: 'SI',
    conservationLaws: ['energy-momentum'],
    constraints: ['[F_{μν}] = V/m = kg/(A·s³)']
  },
  dependencies: ['conservation_law'],
  assumptions: ['SI units throughout'],
  uncertainty: 0.05
});

// Lagrangian formulation
const lagrangian = await deepthinking_math({
  mode: 'physics',
  thought: 'Write electromagnetic Lagrangian density',
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false,

  thoughtType: 'lagrangian',
  tensorProperties: {
    rank: [0, 0],
    components: 'ℒ = -¼F_{μν}F^{μν} + A_μJ^μ',
    latex: '\\mathcal{L} = -\\frac{1}{4}F_{\\mu\\nu}F^{\\mu\\nu} + A_\\mu J^\\mu',
    symmetries: ['Lorentz invariant', 'gauge invariant'],
    invariants: ['action S = ∫d⁴x ℒ'],
    transformation: 'covariant'
  },
  physicalInterpretation: {
    quantity: 'Lagrangian density',
    units: 'J/m³',
    conservationLaws: ['energy-momentum via Noether'],
    observables: ['field equations via Euler-Lagrange']
  },
  dependencies: ['dimensional_analysis'],
  assumptions: ['minimal coupling'],
  uncertainty: 0.1
});
```

## Best Practices

### Tensor Formulation

✅ **Do:**
- Specify index structure clearly
- Note symmetry properties
- Identify invariants
- State coordinate system

❌ **Don't:**
- Mix index conventions
- Ignore transformation properties
- Forget dimensional analysis

### Symmetry Analysis

✅ **Do:**
- Identify all relevant symmetries
- Connect to conservation laws (Noether)
- Note broken vs. exact symmetries

❌ **Don't:**
- Overlook hidden symmetries
- Assume symmetries without checking
- Ignore spontaneous breaking

### Conservation Laws

✅ **Do:**
- Derive from symmetry principles
- Verify dimensional consistency
- Connect to physical observables

❌ **Don't:**
- Assert without derivation
- Ignore boundary conditions
- Forget quantum corrections

### Dimensional Analysis

✅ **Do:**
- Check all equations for dimensional consistency
- Use standard unit systems consistently
- Identify dimensionless quantities

❌ **Don't:**
- Mix unit systems
- Skip consistency checks
- Ignore factors of c, ℏ, etc.

## PhysicsThought Interface

```typescript
interface PhysicsThought extends BaseThought {
  mode: ThinkingMode.PHYSICS;
  thoughtType: PhysicsThoughtType;
  tensorProperties?: TensorProperties;
  physicalInterpretation?: PhysicalInterpretation;
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  fieldTheoryContext?: FieldTheoryContext;
}
```

## Integration with Other Modes

Physics mode integrates with:

- **Mathematics Mode** - Mathematical foundations of physics
- **Engineering Mode** - Applied physics problems
- **Shannon Mode** - Physical system modeling
- **Optimization Mode** - Variational principles, extremization

## Related Modes

- [Mathematics Mode](./MATHEMATICS.md) - Mathematical foundations
- [Engineering Mode](./ENGINEERING.md) - Applied physics
- [Shannon Mode](./SHANNON.md) - System modeling
- [Optimization Mode](./OPTIMIZATION.md) - Variational methods

## Limitations

- **Theoretical focus** - Numerical simulation limited
- **Requires physics knowledge** - Best results with physics background
- **Classical emphasis** - Quantum effects require careful handling

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
