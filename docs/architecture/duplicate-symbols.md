<!-- repo-map:no-verification -->
<!-- GENERATED FILE -- do not edit by hand.
     Regenerate with `npm run docs:deps`
     (npx tsx tools/create-dependency-graph/create-dependency-graph.ts). -->

# Duplicate Symbols

**65** symbol names are defined in more than one file: **61** drift-risk, **4** name collisions. Re-exports are excluded — a barrel re-exporting a symbol has not defined a second one.

> **Do not collapse a duplicate before proving the copies behave identically.** Two functions differing by one escaped character are not duplicates; pin the difference with a test so a later 'unification' fails loudly. Conversely, `DRIFT_RISK` is where real bugs hide: this repo shipped three copies of `escapeLatex`, two of which re-escaped their own braces so every backslash rendered as `\{}`, and no test compared them.

## Drift risk — same name, same kind, more than one definition

| Symbol | Kind | Defined in |
|---|---|---|
| `CausalChain` | interface | `src/types/modes/counterfactual.ts`<br>`src/types/modes/historical.ts` |
| `CausalGraph` | interface | `src/modes/causal/graph/types.ts`<br>`src/types/modes/causal.ts` |
| `CausalLink` | interface | `src/types/modes/historical.ts`<br>`src/types/modes/systemsthinking.ts` |
| `Constraint` | interface | `src/modes/stochastic/types.ts`<br>`src/types/modes/optimization.ts` |
| `ConstraintType` | type | `src/types/modes/constraint.ts`<br>`src/types/modes/optimization.ts` |
| `Contradiction` | interface | `src/types/modes/formallogic.ts`<br>`src/types/modes/synthesis.ts` |
| `CustomThought` | interface | `src/modes/handlers/CustomHandler.ts`<br>`src/types/modes/custom.ts` |
| `Evidence` | interface | `src/types/core.ts`<br>`src/types/modes/evidential.ts` |
| `ExportFormat` | type | `src/tools/schemas/shared.ts`<br>`src/types/session.ts` |
| `HybridThought` | interface | `src/modes/handlers/HybridHandler.ts`<br>`src/types/modes/hybrid.ts` |
| `Hypothesis` | interface | `src/types/core.ts`<br>`src/types/modes/evidential.ts`<br>`src/types/modes/scientificmethod.ts` |
| `Inference` | interface | `src/types/modes/analogical.ts`<br>`src/types/modes/formallogic.ts` |
| `InferenceRule` | type | `src/types/modes/formallogic.ts`<br>`src/types/modes/mathematics.ts` |
| `Insight` | interface | `src/modes/combinations/combination-types.ts`<br>`src/types/modes/analogical.ts` |
| `Intervention` | interface | `src/modes/causal/graph/types.ts`<br>`src/types/modes/causal.ts` |
| `isAlgorithmicThought` | function | `src/types/core.ts`<br>`src/types/modes/algorithmic.ts` |
| `isAnalogicalThought` | function | `src/types/core.ts`<br>`src/types/modes/analogical.ts` |
| `isAnalysisThought` | function | `src/types/core.ts`<br>`src/types/modes/analysis.ts` |
| `isArgumentationThought` | function | `src/types/core.ts`<br>`src/types/modes/argumentation.ts` |
| `isBayesianThought` | function | `src/types/core.ts`<br>`src/types/modes/bayesian.ts` |
| `isCausalThought` | function | `src/types/core.ts`<br>`src/types/modes/causal.ts` |
| `isComputabilityThought` | function | `src/types/core.ts`<br>`src/types/modes/computability.ts` |
| `isConstraintThought` | function | `src/types/core.ts`<br>`src/types/modes/constraint.ts` |
| `isCounterfactualThought` | function | `src/types/core.ts`<br>`src/types/modes/counterfactual.ts` |
| `isCritiqueThought` | function | `src/types/core.ts`<br>`src/types/modes/critique.ts` |
| `isCryptanalyticThought` | function | `src/types/core.ts`<br>`src/types/modes/cryptanalytic.ts` |
| `isCustomThought` | function | `src/types/core.ts`<br>`src/types/modes/custom.ts` |
| `isEngineeringThought` | function | `src/types/core.ts`<br>`src/types/modes/engineering.ts` |
| `isEvidentialThought` | function | `src/types/core.ts`<br>`src/types/modes/evidential.ts` |
| `isFirstPrinciplesThought` | function | `src/types/core.ts`<br>`src/types/modes/firstprinciples.ts` |
| `isFormalLogicThought` | function | `src/types/core.ts`<br>`src/types/modes/formallogic.ts` |
| `isGameTheoryThought` | function | `src/types/core.ts`<br>`src/types/modes/gametheory.ts` |
| `isHistoricalThought` | function | `src/types/core.ts`<br>`src/types/modes/historical.ts` |
| `isHybridThought` | function | `src/types/core.ts`<br>`src/types/modes/hybrid.ts` |
| `isMathematicsThought` | function | `src/types/core.ts`<br>`src/types/modes/mathematics.ts` |
| `isMetaReasoningThought` | function | `src/types/core.ts`<br>`src/types/modes/metareasoning.ts` |
| `isModalThought` | function | `src/types/core.ts`<br>`src/types/modes/modal.ts` |
| `isOptimizationThought` | function | `src/types/core.ts`<br>`src/types/modes/optimization.ts` |
| `isPhysicsThought` | function | `src/types/core.ts`<br>`src/types/modes/physics.ts` |
| `isRecursiveThought` | function | `src/types/core.ts`<br>`src/types/modes/recursive.ts` |
| `isScientificMethodThought` | function | `src/types/core.ts`<br>`src/types/modes/scientificmethod.ts` |
| `isSequentialThought` | function | `src/types/core.ts`<br>`src/types/modes/sequential.ts` |
| `isShannonThought` | function | `src/types/core.ts`<br>`src/types/modes/shannon.ts` |
| `isStochasticThought` | function | `src/types/core.ts`<br>`src/types/modes/stochastic.ts` |
| `isSynthesisThought` | function | `src/types/core.ts`<br>`src/types/modes/synthesis.ts` |
| `isSystemsThinkingThought` | function | `src/types/core.ts`<br>`src/types/modes/systemsthinking.ts` |
| `isTemporalThought` | function | `src/types/core.ts`<br>`src/types/modes/temporal.ts` |
| `MathematicalModel` | interface | `src/types/modes/hybrid.ts`<br>`src/types/modes/mathematics.ts` |
| `ModeCombination` | interface | `src/modes/combinations/combination-types.ts`<br>`src/taxonomy/multi-modal-analyzer.ts` |
| `ModeStatus` | interface | `src/modes/handlers/ModeHandler.ts`<br>`src/types/handlers.ts` |
| `Observation` | interface | `src/types/core.ts`<br>`src/types/modes/scientificmethod.ts` |
| `PhysicalInterpretation` | interface | `src/types/modes/hybrid.ts`<br>`src/types/modes/physics.ts` |
| `ProblemCharacteristics` | interface | `src/taxonomy/suggestion-engine.ts`<br>`src/types/modes/recommendations.ts` |
| `ProofStep` | interface | `src/proof/decomposer.ts`<br>`src/types/modes/formallogic.ts` |
| `QualityMetrics` | interface | `src/taxonomy/suggestion-engine.ts`<br>`src/types/modes/metareasoning.ts` |
| `RecommendModeInput` | interface | `src/services/RecommendationService.ts`<br>`src/types/handlers.ts` |
| `SensitivityAnalysis` | interface | `src/types/modes/bayesian.ts`<br>`src/types/modes/optimization.ts` |
| `StateTransition` | interface | `src/export/visual/utils/mermaid.ts`<br>`src/types/modes/stochastic.ts` |
| `StrategyRecommendation` | interface | `src/proof/branch-types.ts`<br>`src/types/modes/metareasoning.ts` |
| `TensorProperties` | interface | `src/types/modes/hybrid.ts`<br>`src/types/modes/physics.ts` |
| `ValidationResult` | interface | `src/modes/handlers/ModeHandler.ts`<br>`src/types/session.ts` |

## Name collisions — same name, different kinds

| Symbol | Defined in |
|---|---|
| `Domain` | `src/modes/stochastic/types.ts` (type)<br>`src/types/modes/analogical.ts` (interface)<br>`src/types/modes/optimization.ts` (type) |
| `ShannonStage` | `src/tools/schemas/shared.ts` (type)<br>`src/types/core.ts` (enum) |
| `TemporalConstraint` | `src/tools/schemas/shared.ts` (type)<br>`src/types/modes/temporal.ts` (interface) |
| `TemporalRelation` | `src/tools/schemas/shared.ts` (type)<br>`src/types/modes/temporal.ts` (interface) |
