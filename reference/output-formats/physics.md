# Physics Thought — Output Format

Physical modeling with tensor mathematics, field theory, conservation laws, and symmetry analysis.

## JSON Schema

```json
{
  "mode": "physics",
  "thoughtType": "<tensor_formulation|symmetry_analysis|gauge_theory|conservation_law|dimensional_analysis|physical_interpretation|field_equation>",
  "tensorProperties": {
    "rank": [<contravariant_count>, <covariant_count>],
    "components": "<index notation, e.g. F_{μν} = ∂_μA_ν - ∂_νA_μ>",
    "latex": "<LaTeX source>",
    "symmetries": ["<e.g., antisymmetric: F_{μν} = -F_{νμ}>"],
    "invariants": ["<Lorentz scalar expressions>"],
    "transformation": "<covariant|contravariant|mixed>",
    "indexStructure": "<human-readable description>",
    "coordinateSystem": "<Minkowski|Euclidean|Riemannian|...>"
  },
  "physicalInterpretation": {
    "quantity": "<physical quantity name>",
    "units": "<SI units with dimensions>",
    "conservationLaws": ["<law in mathematical form, e.g. ∂_μJ^μ = 0>"],
    "constraints": ["<physical constraint>"],
    "observables": ["<measurable quantity and expression>"]
  },
  "fieldTheoryContext": {
    "fields": ["<field symbol and description>"],
    "interactions": ["<coupling or minimal substitution>"],
    "symmetryGroup": "<Lie group, e.g. U(1), SU(2), Poincaré>",
    "gaugeSymmetries": ["<transformation rule>"]
  },
  "dependencies": ["<prior result, theorem, or physical law>"],
  "assumptions": ["<physical idealization, e.g. flat spacetime>"],
  "uncertainty": <number 0-1>
}
```

## Required Fields

- `mode` — always `"physics"`
- `thoughtType` — the type of physical reasoning step
- `dependencies` — prior physical laws, theorems, or earlier steps this builds on
- `assumptions` — physical idealizations (flat spacetime, non-relativistic, weak field, etc.)
- `uncertainty` — confidence in the model in [0, 1]; near 0 for established results

## Thought Type Reference

| thoughtType | Use when |
|-------------|----------|
| `tensor_formulation` | Defining a tensor quantity with rank, index structure, and symmetries |
| `symmetry_analysis` | Identifying symmetries and their generators |
| `gauge_theory` | Specifying gauge group, fields, and gauge transformations |
| `conservation_law` | Deriving or applying a conservation law from symmetry (Noether) or equations of motion |
| `dimensional_analysis` | Verifying dimensional consistency of equations |
| `physical_interpretation` | Connecting mathematical results back to observable physical quantities |
| `field_equation` | Writing down and analyzing equations of motion for fields |

## Tensor Rank Convention

`rank` is a two-element array: `[contravariant_indices, covariant_indices]`

| Rank | Example | Description |
|------|---------|-------------|
| `[0, 0]` | T (scalar) | Rank-0 tensor |
| `[1, 0]` | V^μ | Contravariant vector |
| `[0, 1]` | V_μ | Covariant vector (1-form) |
| `[1, 1]` | T^μ_ν | Mixed (1,1) tensor |
| `[0, 2]` | F_{μν} | Covariant 2-tensor |
| `[2, 0]` | g^{μν} | Contravariant 2-tensor (inverse metric) |

## Worked Example

Input: "Analyze the electromagnetic field tensor."

Output:

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
  "physicalInterpretation": {
    "quantity": "electromagnetic field tensor",
    "units": "V/m = kg·m·A⁻¹·s⁻³ (SI)",
    "conservationLaws": ["∂_μF^{μν} = μ₀J^ν"],
    "constraints": ["gauge freedom: A_μ → A_μ + ∂_μλ"],
    "observables": ["electric field E^i = F^{0i}", "magnetic field B^i = -½ε^{ijk}F_{jk}"]
  },
  "dependencies": ["Maxwell equations", "vector potential A_μ", "Minkowski metric"],
  "assumptions": ["flat spacetime", "SI units"],
  "uncertainty": 0.02
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"physics"`
- `tensorProperties.rank` is a two-element integer array `[contravariant, covariant]`
- `tensorProperties.symmetries` describes antisymmetry, symmetry, or trace conditions explicitly
- `physicalInterpretation.conservationLaws` are in mathematical form (equations, not prose)
- `fieldTheoryContext.symmetryGroup` names the Lie group explicitly
- Units are in SI or another consistent system stated explicitly
- Dimensional consistency is checked when `thoughtType` is `"dimensional_analysis"`
- `assumptions` lists all physical idealizations (flat spacetime, weak field, non-relativistic, etc.)
