# Reasoning Types Gap Analysis

**Author:** Daniel Simon Jr.
**Co-Author:** Claude
**Date:** 2025-12-27
**Version:** 1.0.0

---

## Executive Summary

This document analyzes the gap between the **110 documented reasoning types** in our comprehensive taxonomy and the **33 reasoning modes** currently implemented in DeepThinking MCP.

| Metric | Count |
|--------|-------|
| Documented Reasoning Types | 110 |
| Current Implemented Modes | 33 |
| Types with Full Implementation | 22 |
| Types Partially Mapped | 12 |
| Types Missing Implementation | 73 |
| Unique Modes Not in Document | 11 |

**Expansion Potential:** Implementing all documented types would grow the system from 33 to ~106 modes (some types can be consolidated).

---

## Table of Contents

1. [Current Implementation Status](#current-implementation-status)
2. [Fully Implemented Types](#fully-implemented-types)
3. [Partially Mapped Types](#partially-mapped-types)
4. [Missing Types by Category](#missing-types-by-category)
5. [Existing Modes Not in Document](#existing-modes-not-in-document)
6. [Implementation Priorities](#implementation-priorities)
7. [Suggested Implementation Phases](#suggested-implementation-phases)
8. [Appendix: Full Type Mapping](#appendix-full-type-mapping)

---

## Current Implementation Status

### Type Definition Files (32 files in `src/types/modes/`)

```
algorithmic    analysis       analogical     argumentation  bayesian
causal         computability  constraint     counterfactual critique
cryptanalytic  custom         engineering    evidential     firstprinciples
formallogic    gametheory     hybrid         mathematics    metareasoning
modal          optimization   physics        recommendations recursive
scientificmethod sequential   shannon        stochastic     synthesis
systemsthinking temporal
```

### Handler Files (36 files in `src/modes/handlers/`)

```
AbductiveHandler      AlgorithmicHandler    AnalogicalHandler
AnalysisHandler       ArgumentationHandler  BayesianHandler
CausalHandler         ComputabilityHandler  ConstraintHandler
CounterfactualHandler CritiqueHandler       CryptanalyticHandler
CustomHandler         DeductiveHandler      EngineeringHandler
EvidentialHandler     FirstPrinciplesHandler FormalLogicHandler
GameTheoryHandler     GenericModeHandler    HybridHandler
InductiveHandler      MathematicsHandler    MetaReasoningHandler
ModalHandler          ModeHandler (base)    OptimizationHandler
PhysicsHandler        RecursiveHandler      ScientificMethodHandler
SequentialHandler     ShannonHandler        StochasticHandler
SynthesisHandler      SystemsThinkingHandler TemporalHandler
```

---

## Fully Implemented Types

These 22 documented reasoning types have complete implementations (type + handler):

| Doc ID | Reasoning Type | Mode Name | Category |
|--------|---------------|-----------|----------|
| 1.1 | Deductive Reasoning | `deductive` | Fundamental Forms |
| 1.2 | Inductive Reasoning | `inductive` | Fundamental Forms |
| 1.3 | Abductive Reasoning | `abductive` | Fundamental Forms |
| 2.4 | Modal Reasoning | `modal` | Logical and Formal |
| 3.1 | Mathematical Reasoning | `mathematics` | Mathematical |
| 3.7 | Bayesian Reasoning | `bayesian` | Mathematical |
| 4.3 | Temporal Reasoning | `temporal` | Temporal and Spatial |
| 4.4 | Sequential Reasoning | `sequential` | Temporal and Spatial |
| 5.1 | Causal Reasoning | `causal` | Causal and Explanatory |
| 5.4 | Counterfactual Reasoning | `counterfactual` | Causal and Explanatory |
| 6.1 | Analogical Reasoning | `analogical` | Analogical and Comparative |
| 7.2 | Analytical Reasoning | `analysis` | Analytical and Critical |
| 7.5 | Evidential Reasoning | `evidential` | Analytical and Critical |
| 8.3 | Algorithmic Reasoning | `algorithmic` | Problem-Solving |
| 8.7 | Game-Theoretic Reasoning | `gametheory` | Problem-Solving |
| 10.4 | Argumentative Reasoning | `argumentation` | Dialectical |
| 12.1 | Meta-Reasoning | `metareasoning` | Specialized |
| 15.4 | Systems Reasoning | `systemsthinking` | Combined and Hybrid |
| 17.7 | Constraint-Based Reasoning | `constraint` | Emerging |
| 17.8 | Optimization Reasoning | `optimization` | Emerging |
| 17.9 | Stochastic Reasoning | `stochastic` | Emerging |
| 17.10 | Recursive Reasoning | `recursive` | Emerging |

---

## Partially Mapped Types

These 12 types have related implementations but may need dedicated modes or extensions:

| Doc ID | Reasoning Type | Related Mode | Notes |
|--------|---------------|--------------|-------|
| 2.1 | Symbolic Reasoning | `formallogic` | Could be subsumed or needs dedicated mode |
| 2.2 | Propositional Reasoning | `formallogic` | Subset; may need propositional calculus features |
| 2.3 | Predicate Logic Reasoning | `formallogic` | May need first-order logic extensions |
| 2.8 | Formal Reasoning | `formallogic` | Direct match |
| 3.6 | Probabilistic Reasoning | `bayesian` | Bayesian is subset; broader mode needed |
| 7.1 | Critical Reasoning | `critique` | Critique focuses on peer review; critical is broader |
| 7.3 | Logical Reasoning | `formallogic` | Overlaps with formal logic |
| 8.4 | Computational Reasoning | `computability` | Computability is narrow; broader thinking needed |
| 12.2 | Metacognitive Reasoning | `metareasoning` | Closely related; may be subsumed |
| 15.3 | Holistic Reasoning | `systemsthinking` | Systems thinking includes holistic aspects |
| 15.5 | Integrative Reasoning | `hybrid` | Hybrid does integration |
| 15.6 | Multi-Modal Reasoning | `hybrid` | Hybrid handles multi-mode |

---

## Missing Types by Category

### 1. Logical and Formal Reasoning (4 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 2.5 | Monotonic Reasoning | Medium | Medium |
| 2.6 | Transitive Reasoning | Low | Low |
| 2.7 | Syllogistic Reasoning | Medium | Medium |
| 2.9 | Paraconsistent Reasoning | Low | High |

### 2. Mathematical and Quantitative (4 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 3.2 | Arithmetic Reasoning | Medium | Low |
| 3.3 | Algebraic Reasoning | Medium | Medium |
| 3.4 | Geometric Reasoning | Medium | Medium |
| 3.5 | **Statistical Reasoning** | **High** | Medium |
| 3.8 | Quantitative Reasoning | Medium | Low |

### 3. Temporal and Spatial (2 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 4.1 | **Spatial Reasoning** | **High** | Medium |
| 4.2 | **Visual Reasoning** | **High** | High |
| 4.5 | Topological Reasoning | Low | High |

### 4. Causal and Explanatory (3 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 5.2 | Mechanistic Reasoning | Medium | Medium |
| 5.3 | Teleological Reasoning | Low | Medium |
| 5.5 | **Hypothetical Reasoning** | **High** | Low |

### 5. Analogical and Comparative (3 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 6.2 | Metaphorical Reasoning | Medium | Medium |
| 6.3 | Comparative Reasoning | Medium | Low |
| 6.4 | Relational Reasoning | Medium | Medium |

### 6. Analytical and Critical (1 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 7.4 | Evaluative Reasoning | Medium | Low |

### 7. Problem-Solving and Strategic (6 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 8.1 | **Decompositional Reasoning** | **High** | Low |
| 8.2 | Systematic Reasoning | Medium | Low |
| 8.5 | **Heuristic Reasoning** | **High** | Medium |
| 8.6 | **Strategic Reasoning** | **High** | Medium |
| 8.8 | Backwards Reasoning | Medium | Low |
| 8.9 | Forward Reasoning | Medium | Low |
| 8.10 | Means-End Reasoning | Medium | Medium |

### 8. Creative and Divergent (6 missing) - **ENTIRE CATEGORY MISSING**

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 9.1 | **Creative Reasoning** | **High** | High |
| 9.2 | **Lateral Reasoning** | **High** | High |
| 9.3 | **Divergent Reasoning** | **High** | Medium |
| 9.4 | **Convergent Reasoning** | **High** | Medium |
| 9.5 | Associative Reasoning | Medium | Medium |
| 9.6 | Intuitive Reasoning | Medium | High |

### 9. Dialectical and Argumentative (3 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 10.1 | **Dialectical Reasoning** | **High** | Medium |
| 10.2 | Adversarial Reasoning | Medium | Medium |
| 10.3 | Rhetorical Reasoning | Medium | Medium |

### 10. Social and Practical (8 missing) - **ENTIRE CATEGORY MISSING**

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 11.1 | Social Reasoning | Medium | High |
| 11.2 | Pragmatic Reasoning | Medium | Medium |
| 11.3 | **Commonsense Reasoning** | **High** | High |
| 11.4 | Practical Reasoning | Medium | Medium |
| 11.5 | **Moral/Ethical Reasoning** | **High** | High |
| 11.6 | Legal Reasoning | Medium | High |
| 11.7 | Political Reasoning | Low | High |
| 11.8 | Economic Reasoning | Medium | Medium |

### 11. Specialized and Advanced (8 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 12.3 | Reflexive Reasoning | Low | Medium |
| 12.4 | Categorical Reasoning | Medium | Low |
| 12.5 | Conceptual Reasoning | Medium | Medium |
| 12.6 | Taxonomic Reasoning | Medium | Low |
| 12.7 | **Case-Based Reasoning** | **High** | Medium |
| 12.8 | Narrative Reasoning | Medium | Medium |
| 12.9 | **Diagnostic Reasoning** | **High** | Medium |
| 12.10 | Prognostic Reasoning | Medium | Medium |

### 12. Epistemic and Normative (5 missing) - **ENTIRE CATEGORY MISSING**

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 13.1 | Epistemic Reasoning | Medium | Medium |
| 13.2 | Deontic Reasoning | Medium | Medium |
| 13.3 | Autoepistemic Reasoning | Low | High |
| 13.4 | Normative Reasoning | Medium | Medium |
| 13.5 | Descriptive Reasoning | Low | Low |

### 13. Uncertainty and Adaptability (5 missing) - **ENTIRE CATEGORY MISSING**

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 14.1 | Fuzzy Logic Reasoning | Medium | Medium |
| 14.2 | Non-Monotonic Reasoning | Medium | High |
| 14.3 | Defeasible Reasoning | Medium | Medium |
| 14.4 | Provisional Reasoning | Low | Low |
| 14.5 | Adaptive Reasoning | Medium | Medium |

### 14. Combined and Hybrid (4 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 15.1 | Abductive-Deductive Reasoning | Medium | Low |
| 15.2 | Inductive-Deductive Reasoning | Medium | Low |
| (15.3) | Holistic Reasoning | - | Mapped to systemsthinking |
| (15.5) | Integrative Reasoning | - | Mapped to hybrid |
| (15.6) | Multi-Modal Reasoning | - | Mapped to hybrid |

### 15. Contextual and Situated (4 missing) - **ENTIRE CATEGORY MISSING**

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 16.1 | Contextual Reasoning | Medium | Medium |
| 16.2 | Situated Reasoning | Medium | Medium |
| 16.3 | Cultural Reasoning | Low | High |
| 16.4 | Domain-Specific Reasoning | Medium | Medium |

### 16. Emerging and Specialized (6 missing)

| Doc ID | Type | Priority | Complexity |
|--------|------|----------|------------|
| 17.1 | Subsymbolic Reasoning | Low | High |
| 17.2 | Dual-Process Reasoning | Medium | High |
| 17.3 | Perceptual Reasoning | Medium | High |
| 17.4 | Counterfeit Detection Reasoning | Low | Medium |
| 17.5 | Reductive Reasoning | Low | Medium |
| 17.6 | Emergent Reasoning | Low | High |
| 17.11 | Parallel Reasoning | Medium | Medium |
| 17.12 | Distributed Reasoning | Low | High |
| 17.13 | Embodied Reasoning | Low | High |

---

## Existing Modes Not in Document

These 11 modes are DeepThinking MCP originals not in the standard taxonomy:

| Mode | Description | Notes |
|------|-------------|-------|
| `shannon` | Shannon methodology - 5-stage engineering approach | Unique engineering methodology |
| `physics` | Physics reasoning with tensors and conservation laws | Domain-specific |
| `hybrid` | Multi-mode combination reasoning | Meta-mode |
| `engineering` | Requirements, FMEA, trade studies, ADRs | Domain-specific |
| `computability` | Turing machines, decidability, complexity | Specialized |
| `cryptanalytic` | Deciban evidence system | Specialized |
| `firstprinciples` | Breaking down to fundamental truths | Could map to Decompositional |
| `scientificmethod` | Hypothesis testing workflow | Could map to Abductive-Deductive |
| `synthesis` | Literature synthesis | Academic specialized |
| `critique` | Peer review analysis | Academic specialized |
| `custom` | User-defined modes | Meta-mode for extensibility |

---

## Implementation Priorities

### High Priority (16 types)
Critical reasoning types with high demand and practical value:

1. Statistical Reasoning
2. Spatial Reasoning
3. Visual Reasoning
4. Hypothetical Reasoning
5. Decompositional Reasoning
6. Heuristic Reasoning
7. Strategic Reasoning
8. Creative Reasoning
9. Lateral Reasoning
10. Divergent Reasoning
11. Convergent Reasoning
12. Dialectical Reasoning
13. Commonsense Reasoning
14. Moral/Ethical Reasoning
15. Case-Based Reasoning
16. Diagnostic Reasoning

### Medium Priority (42 types)
Important but less urgent types.

### Low Priority (18 types)
Specialized or niche types.

---

## Suggested Implementation Phases

### Phase 1: Core Reasoning Extensions (5 modes)
**Rationale:** High priority, lower complexity modes that extend existing foundations

- Statistical Reasoning
- Spatial Reasoning
- Hypothetical Reasoning
- Decompositional Reasoning
- Heuristic Reasoning

### Phase 2: Creative & Divergent Suite (5 modes)
**Rationale:** Complete creative reasoning category - high demand for innovation support

- Creative Reasoning
- Lateral Reasoning
- Divergent Reasoning
- Convergent Reasoning
- Associative Reasoning

### Phase 3: Strategic & Dialectical (4 modes)
**Rationale:** Strategic planning and argumentation enhancement

- Strategic Reasoning
- Dialectical Reasoning
- Adversarial Reasoning
- Rhetorical Reasoning

### Phase 4: Practical & Social Reasoning (5 modes)
**Rationale:** Real-world reasoning and ethical considerations

- Commonsense Reasoning
- Moral/Ethical Reasoning
- Practical Reasoning
- Pragmatic Reasoning
- Social Reasoning

### Phase 5: Specialized Analytical (5 modes)
**Rationale:** Domain-specific analytical capabilities

- Case-Based Reasoning
- Diagnostic Reasoning
- Prognostic Reasoning
- Narrative Reasoning
- Categorical Reasoning

### Phase 6: Mathematical Extensions (4 modes)
**Rationale:** Complete mathematical reasoning suite

- Arithmetic Reasoning
- Algebraic Reasoning
- Geometric Reasoning
- Quantitative Reasoning

### Phase 7: Logic Extensions (5 modes)
**Rationale:** Complete formal logic suite

- Symbolic Reasoning
- Propositional Reasoning
- Predicate Reasoning
- Syllogistic Reasoning
- Monotonic Reasoning

### Phase 8: Uncertainty & Adaptation (4 modes)
**Rationale:** Handle uncertainty and dynamic reasoning

- Fuzzy Logic Reasoning
- Non-Monotonic Reasoning
- Defeasible Reasoning
- Adaptive Reasoning

### Phase 9: Combined & Hybrid Patterns (4 modes)
**Rationale:** Explicit hybrid reasoning patterns

- Abductive-Deductive Reasoning
- Inductive-Deductive Reasoning
- Integrative Reasoning
- Multi-Modal Reasoning

### Phase 10: Contextual & Situated (4 modes)
**Rationale:** Context-aware reasoning

- Contextual Reasoning
- Situated Reasoning
- Cultural Reasoning
- Domain-Specific Reasoning

### Phase 11: Epistemic & Normative (4 modes)
**Rationale:** Knowledge and obligation reasoning

- Epistemic Reasoning
- Deontic Reasoning
- Normative Reasoning
- Descriptive Reasoning

### Phase 12: Advanced & Emerging (4 modes)
**Rationale:** Cutting-edge reasoning approaches

- Visual Reasoning
- Perceptual Reasoning
- Dual-Process Reasoning
- Parallel Reasoning

### Phase 13: Remaining Types (~20 modes)
**Rationale:** Complete coverage of all 110 types

- All remaining low-priority types

---

## Appendix: Full Type Mapping

| # | Doc ID | Reasoning Type | Status | Mode |
|---|--------|---------------|--------|------|
| 1 | 1.1 | Deductive Reasoning | ✅ Full | deductive |
| 2 | 1.2 | Inductive Reasoning | ✅ Full | inductive |
| 3 | 1.3 | Abductive Reasoning | ✅ Full | abductive |
| 4 | 2.1 | Symbolic Reasoning | ⚠️ Partial | formallogic |
| 5 | 2.2 | Propositional Reasoning | ⚠️ Partial | formallogic |
| 6 | 2.3 | Predicate Logic Reasoning | ⚠️ Partial | formallogic |
| 7 | 2.4 | Modal Reasoning | ✅ Full | modal |
| 8 | 2.5 | Monotonic Reasoning | ❌ Missing | - |
| 9 | 2.6 | Transitive Reasoning | ❌ Missing | - |
| 10 | 2.7 | Syllogistic Reasoning | ❌ Missing | - |
| 11 | 2.8 | Formal Reasoning | ⚠️ Partial | formallogic |
| 12 | 2.9 | Paraconsistent Reasoning | ❌ Missing | - |
| 13 | 3.1 | Mathematical Reasoning | ✅ Full | mathematics |
| 14 | 3.2 | Arithmetic Reasoning | ❌ Missing | - |
| 15 | 3.3 | Algebraic Reasoning | ❌ Missing | - |
| 16 | 3.4 | Geometric Reasoning | ❌ Missing | - |
| 17 | 3.5 | Statistical Reasoning | ❌ Missing | - |
| 18 | 3.6 | Probabilistic Reasoning | ⚠️ Partial | bayesian |
| 19 | 3.7 | Bayesian Reasoning | ✅ Full | bayesian |
| 20 | 3.8 | Quantitative Reasoning | ❌ Missing | - |
| 21 | 4.1 | Spatial Reasoning | ❌ Missing | - |
| 22 | 4.2 | Visual Reasoning | ❌ Missing | - |
| 23 | 4.3 | Temporal Reasoning | ✅ Full | temporal |
| 24 | 4.4 | Sequential Reasoning | ✅ Full | sequential |
| 25 | 4.5 | Topological Reasoning | ❌ Missing | - |
| 26 | 5.1 | Causal Reasoning | ✅ Full | causal |
| 27 | 5.2 | Mechanistic Reasoning | ❌ Missing | - |
| 28 | 5.3 | Teleological Reasoning | ❌ Missing | - |
| 29 | 5.4 | Counterfactual Reasoning | ✅ Full | counterfactual |
| 30 | 5.5 | Hypothetical Reasoning | ❌ Missing | - |
| 31 | 6.1 | Analogical Reasoning | ✅ Full | analogical |
| 32 | 6.2 | Metaphorical Reasoning | ❌ Missing | - |
| 33 | 6.3 | Comparative Reasoning | ❌ Missing | - |
| 34 | 6.4 | Relational Reasoning | ❌ Missing | - |
| 35 | 7.1 | Critical Reasoning | ⚠️ Partial | critique |
| 36 | 7.2 | Analytical Reasoning | ✅ Full | analysis |
| 37 | 7.3 | Logical Reasoning | ⚠️ Partial | formallogic |
| 38 | 7.4 | Evaluative Reasoning | ❌ Missing | - |
| 39 | 7.5 | Evidential Reasoning | ✅ Full | evidential |
| 40 | 8.1 | Decompositional Reasoning | ❌ Missing | - |
| 41 | 8.2 | Systematic Reasoning | ❌ Missing | - |
| 42 | 8.3 | Algorithmic Reasoning | ✅ Full | algorithmic |
| 43 | 8.4 | Computational Reasoning | ⚠️ Partial | computability |
| 44 | 8.5 | Heuristic Reasoning | ❌ Missing | - |
| 45 | 8.6 | Strategic Reasoning | ❌ Missing | - |
| 46 | 8.7 | Game-Theoretic Reasoning | ✅ Full | gametheory |
| 47 | 8.8 | Backwards Reasoning | ❌ Missing | - |
| 48 | 8.9 | Forward Reasoning | ❌ Missing | - |
| 49 | 8.10 | Means-End Reasoning | ❌ Missing | - |
| 50 | 9.1 | Creative Reasoning | ❌ Missing | - |
| 51 | 9.2 | Lateral Reasoning | ❌ Missing | - |
| 52 | 9.3 | Divergent Reasoning | ❌ Missing | - |
| 53 | 9.4 | Convergent Reasoning | ❌ Missing | - |
| 54 | 9.5 | Associative Reasoning | ❌ Missing | - |
| 55 | 9.6 | Intuitive Reasoning | ❌ Missing | - |
| 56 | 10.1 | Dialectical Reasoning | ❌ Missing | - |
| 57 | 10.2 | Adversarial Reasoning | ❌ Missing | - |
| 58 | 10.3 | Rhetorical Reasoning | ❌ Missing | - |
| 59 | 10.4 | Argumentative Reasoning | ✅ Full | argumentation |
| 60 | 11.1 | Social Reasoning | ❌ Missing | - |
| 61 | 11.2 | Pragmatic Reasoning | ❌ Missing | - |
| 62 | 11.3 | Commonsense Reasoning | ❌ Missing | - |
| 63 | 11.4 | Practical Reasoning | ❌ Missing | - |
| 64 | 11.5 | Moral/Ethical Reasoning | ❌ Missing | - |
| 65 | 11.6 | Legal Reasoning | ❌ Missing | - |
| 66 | 11.7 | Political Reasoning | ❌ Missing | - |
| 67 | 11.8 | Economic Reasoning | ❌ Missing | - |
| 68 | 12.1 | Meta-Reasoning | ✅ Full | metareasoning |
| 69 | 12.2 | Metacognitive Reasoning | ⚠️ Partial | metareasoning |
| 70 | 12.3 | Reflexive Reasoning | ❌ Missing | - |
| 71 | 12.4 | Categorical Reasoning | ❌ Missing | - |
| 72 | 12.5 | Conceptual Reasoning | ❌ Missing | - |
| 73 | 12.6 | Taxonomic Reasoning | ❌ Missing | - |
| 74 | 12.7 | Case-Based Reasoning | ❌ Missing | - |
| 75 | 12.8 | Narrative Reasoning | ❌ Missing | - |
| 76 | 12.9 | Diagnostic Reasoning | ❌ Missing | - |
| 77 | 12.10 | Prognostic Reasoning | ❌ Missing | - |
| 78 | 13.1 | Epistemic Reasoning | ❌ Missing | - |
| 79 | 13.2 | Deontic Reasoning | ❌ Missing | - |
| 80 | 13.3 | Autoepistemic Reasoning | ❌ Missing | - |
| 81 | 13.4 | Normative Reasoning | ❌ Missing | - |
| 82 | 13.5 | Descriptive Reasoning | ❌ Missing | - |
| 83 | 14.1 | Fuzzy Logic Reasoning | ❌ Missing | - |
| 84 | 14.2 | Non-Monotonic Reasoning | ❌ Missing | - |
| 85 | 14.3 | Defeasible Reasoning | ❌ Missing | - |
| 86 | 14.4 | Provisional Reasoning | ❌ Missing | - |
| 87 | 14.5 | Adaptive Reasoning | ❌ Missing | - |
| 88 | 15.1 | Abductive-Deductive Reasoning | ❌ Missing | - |
| 89 | 15.2 | Inductive-Deductive Reasoning | ❌ Missing | - |
| 90 | 15.3 | Holistic Reasoning | ⚠️ Partial | systemsthinking |
| 91 | 15.4 | Systems Reasoning | ✅ Full | systemsthinking |
| 92 | 15.5 | Integrative Reasoning | ⚠️ Partial | hybrid |
| 93 | 15.6 | Multi-Modal Reasoning | ⚠️ Partial | hybrid |
| 94 | 16.1 | Contextual Reasoning | ❌ Missing | - |
| 95 | 16.2 | Situated Reasoning | ❌ Missing | - |
| 96 | 16.3 | Cultural Reasoning | ❌ Missing | - |
| 97 | 16.4 | Domain-Specific Reasoning | ❌ Missing | - |
| 98 | 17.1 | Subsymbolic Reasoning | ❌ Missing | - |
| 99 | 17.2 | Dual-Process Reasoning | ❌ Missing | - |
| 100 | 17.3 | Perceptual Reasoning | ❌ Missing | - |
| 101 | 17.4 | Counterfeit Detection Reasoning | ❌ Missing | - |
| 102 | 17.5 | Reductive Reasoning | ❌ Missing | - |
| 103 | 17.6 | Emergent Reasoning | ❌ Missing | - |
| 104 | 17.7 | Constraint-Based Reasoning | ✅ Full | constraint |
| 105 | 17.8 | Optimization Reasoning | ✅ Full | optimization |
| 106 | 17.9 | Stochastic Reasoning | ✅ Full | stochastic |
| 107 | 17.10 | Recursive Reasoning | ✅ Full | recursive |
| 108 | 17.11 | Parallel Reasoning | ❌ Missing | - |
| 109 | 17.12 | Distributed Reasoning | ❌ Missing | - |
| 110 | 17.13 | Embodied Reasoning | ❌ Missing | - |

---

**Legend:**
- ✅ Full = Complete implementation (type + handler)
- ⚠️ Partial = Related mode exists but may need extension
- ❌ Missing = No implementation

---

*Generated: 2025-12-27*
*Authors: Daniel Simon Jr. & Claude*
