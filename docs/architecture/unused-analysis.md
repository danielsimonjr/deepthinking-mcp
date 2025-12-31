# Unused Files and Exports Analysis

**Generated**: 2025-12-31

## Summary

- **Potentially unused files**: 16
- **Potentially unused exports**: 478

## Potentially Unused Files

These files are not imported by any other file in the codebase:

- `src/modes/stochastic/analysis/statistics.ts`
- `src/modes/stochastic/models/distribution.ts`
- `src/modes/stochastic/sampling/rng.ts`
- `src/search/index.ts`
- `src/taxonomy/multi-modal-analyzer.ts`
- `src/taxonomy/suggestion-engine.ts`
- `src/validation/validators/modes/algorithmic.ts`
- `src/validation/validators/modes/analysis.ts`
- `src/validation/validators/modes/argumentation.ts`
- `src/validation/validators/modes/critique.ts`
- `src/validation/validators/modes/engineering.ts`
- `src/validation/validators/modes/firstprinciples.ts`
- `src/validation/validators/modes/formallogic.ts`
- `src/validation/validators/modes/scientificmethod.ts`
- `src/validation/validators/modes/synthesis.ts`
- `src/validation/validators/modes/systemsthinking.ts`

## Potentially Unused Exports

These exports are not imported by any other file in the codebase:

### `src/cache/types.ts`

- `CacheStrategy` (type)

### `src/config/index.ts`

- `updateConfig` (function)
- `resetConfig` (function)
- `validateConfig` (function)
- `ServerConfig` (interface)
- `CONFIG` (constant)

### `src/export/file-exporter.ts`

- `FileExportConfig` (interface)
- `FileExportResult` (interface)
- `BatchExportResult` (interface)
- `ExportProgress` (interface)
- `ExportProgressCallback` (type)

### `src/export/profiles.ts`

- `ProfileExportOptions` (interface)
- `ExportProfile` (interface)
- `ExportProfileMetadata` (interface)

### `src/export/visual/modes/engineering.ts`

- `for` (function)

### `src/export/visual/types.ts`

- `VisualFormat` (type)

### `src/modes/causal/graph/algorithms/centrality.ts`

- `computeBetweennessCentrality` (function)
- `computeClosenessCentrality` (function)
- `computePageRank` (function)
- `computeEigenvectorCentrality` (function)
- `computeKatzCentrality` (function)
- `computeAllCentrality` (function)

### `src/modes/causal/graph/algorithms/d-separation.ts`

- `getAncestors` (function)
- `findAllPaths` (function)
- `isPathBlocked` (function)
- `findMinimalSeparator` (function)
- `computeMarkovBlanket` (function)
- `getImpliedIndependencies` (function)

### `src/modes/causal/graph/algorithms/intervention.ts`

- `createMutilatedGraph` (function)
- `createMarginalizedGraph` (function)
- `generateBackdoorFormula` (function)
- `checkFrontdoorCriterion` (function)
- `generateFrontdoorFormula` (function)
- `findInstrumentalVariable` (function)
- `generateIVFormula` (function)
- `applyRule1` (function)
- `applyRule2` (function)
- `applyRule3` (function)
- `analyzeIntervention` (function)

### `src/modes/causal/graph/types.ts`

- `GraphNode` (interface)
- `ProbabilityDistribution` (interface)
- `CycleDetectionResult` (interface)
- `ShortestPathResult` (interface)
- `ConnectivityResult` (interface)
- `QueryVariables` (interface)
- `CausalQuery` (interface)

### `src/modes/combinations/analyzer.ts`

- `MultiModeAnalyzerConfig` (interface)
- `AnalysisProgress` (interface)
- `ProgressCallback` (type)

### `src/modes/combinations/conflict-resolver.ts`

- `ConflictResolverConfig` (interface)
- `ResolutionResult` (interface)

### `src/modes/combinations/merger.ts`

- `InsightMergerConfig` (interface)

### `src/modes/handlers/CustomHandler.ts`

- `CustomThought` (interface)

### `src/modes/handlers/HybridHandler.ts`

- `HybridThought` (interface)

### `src/modes/stochastic/types.ts`

- `StochasticVariable` (interface)
- `Dependency` (interface)
- `Constraint` (interface)
- `StochasticModel` (interface)
- `MonteCarloConfig` (interface)
- `SimulationProgress` (interface)
- `ConvergenceDiagnostics` (interface)
- `MonteCarloResult` (interface)
- `SamplerConfig` (interface)
- `Domain` (type)

### `src/proof/branch-analyzer.ts`

- `BranchAnalyzerOptions` (interface)

### `src/proof/branch-types.ts`

- `ProofTemplateSection` (interface)
- `VerificationSeverity` (type)
- `VerificationErrorType` (type)
- `JustificationType` (type)

### `src/proof/circular-detector.ts`

- `CircularReasoningResult` (interface)

### `src/proof/gap-analyzer.ts`

- `GapAnalyzerConfig` (interface)

### `src/proof/hierarchical-proof.ts`

- `HierarchicalProofOptions` (interface)
- `ProofElementInput` (interface)

### `src/proof/inconsistency-detector.ts`

- `InconsistencyDetectorConfig` (interface)

### `src/proof/patterns/warnings.ts`

- `WarningPattern` (interface)
- `WarningCategory` (type)
- `DIVISION_BY_HIDDEN_ZERO` (constant)
- `ASSUMING_CONCLUSION` (constant)
- `AFFIRMING_CONSEQUENT` (constant)
- `DENYING_ANTECEDENT` (constant)
- `HASTY_GENERALIZATION` (constant)
- `AMBIGUOUS_MIDDLE` (constant)
- `ILLEGAL_CANCELLATION` (constant)
- `INFINITY_ARITHMETIC` (constant)
- `NECESSARY_SUFFICIENT_CONFUSION` (constant)
- `EXISTENTIAL_INSTANTIATION_ERROR` (constant)
- `SQRT_SIGN_ERROR` (constant)
- `LIMIT_EXCHANGE_ERROR` (constant)

### `src/proof/strategy-recommender.ts`

- `StrategyRecommenderConfig` (interface)

### `src/proof/verifier.ts`

- `ProofVerifierConfig` (interface)

### `src/search/tokenizer.ts`

- `TokenizerOptions` (interface)
- `DEFAULT_TOKENIZER_OPTIONS` (constant)

### `src/search/types.ts`

- `SearchQuery` (interface)
- `SortOptions` (interface)
- `PaginationOptions` (interface)
- `SearchResult` (interface)
- `SearchHighlight` (interface)
- `SearchResults` (interface)
- `AdvancedQuery` (interface)
- `FacetedResults` (interface)
- `SearchField` (type)
- `SortField` (type)

### `src/services/ThoughtFactory.ts`

- `ThoughtFactoryConfig` (interface)

### `src/taxonomy/classifier.ts`

- `ThoughtClassification` (interface)

### `src/taxonomy/navigator.ts`

- `TaxonomyQuery` (interface)
- `QueryResult` (interface)
- `NavigationPath` (interface)
- `NavigationStep` (interface)
- `TaxonomyExploration` (interface)

### `src/taxonomy/reasoning-types.ts`

- `getRelatedTypes` (function)

### `src/tools/definitions.ts`

- `getToolForMode` (function)
- `getSchemaForTool` (function)
- `tools` (constant)

### `src/tools/json-schemas.ts`

- `deepthinking_core_schema` (constant)
- `deepthinking_standard_schema` (constant)
- `deepthinking_mathematics_schema` (constant)
- `deepthinking_temporal_schema` (constant)
- `deepthinking_probabilistic_schema` (constant)
- `deepthinking_causal_schema` (constant)
- `deepthinking_strategic_schema` (constant)
- `deepthinking_analytical_schema` (constant)
- `deepthinking_scientific_schema` (constant)
- `deepthinking_engineering_schema` (constant)
- `deepthinking_academic_schema` (constant)
- `deepthinking_session_schema` (constant)
- `deepthinking_analyze_schema` (constant)

### `src/tools/schemas/analyze.ts`

- `mapModeStringToEnum` (function)
- `AnalyzeOutput` (type)
- `analyzeOutputSchema` (constant)
- `analyzeToolDefinition` (constant)

### `src/tools/schemas/base.ts`

- `BaseThoughtInput` (type)

### `src/tools/schemas/modes/academic.ts`

- `AcademicInput` (type)
- `AcademicModeEnum` (constant)

### `src/tools/schemas/modes/analytical.ts`

- `AnalyticalInput` (type)

### `src/tools/schemas/modes/causal.ts`

- `CausalInput` (type)

### `src/tools/schemas/modes/core.ts`

- `StandardInput` (type)
- `CoreModeInput` (type)
- `CoreInput` (type)

### `src/tools/schemas/modes/engineering.ts`

- `EngineeringInput` (type)

### `src/tools/schemas/modes/mathematics.ts`

- `MathInput` (type)

### `src/tools/schemas/modes/probabilistic.ts`

- `ProbabilisticInput` (type)

### `src/tools/schemas/modes/scientific.ts`

- `ScientificInput` (type)

### `src/tools/schemas/modes/strategic.ts`

- `StrategicInput` (type)

### `src/tools/schemas/modes/temporal.ts`

- `TemporalInput` (type)
- `HistoricalInput` (type)

### `src/tools/schemas/shared.ts`

- `Confidence` (type)
- `Level` (type)
- `Impact` (type)
- `ExportFormat` (type)
- `SessionAction` (type)
- `ProofType` (type)
- `TimeUnit` (type)
- `TemporalConstraint` (type)
- `TemporalRelation` (type)
- `EventType` (type)
- `Transformation` (type)
- `ShannonStage` (type)
- `ImpactEnum` (constant)
- `EntitySchema` (constant)
- `DescribedEntitySchema` (constant)

### `src/tools/thinking.ts`

- `ThinkingToolSchema` (constant)

### `src/types/handlers.ts`

- `MCPTextContent` (interface)
- `MCPResponse` (interface)
- `AddThoughtInput` (interface)
- `SummarizeInput` (interface)
- `ExportInput` (interface)
- `ExportAllInput` (interface)
- `SwitchModeInput` (interface)
- `GetSessionInput` (interface)
- `RecommendModeInput` (interface)
- `DeleteSessionInput` (interface)
- `ModeStatus` (interface)
- `AddThoughtResponse` (interface)
- `AnalyzeResponse` (interface)

### `src/types/modes/algorithmic.ts`

- `isAlgorithmicThought` (function)
- `suggestDesignPattern` (function)
- `applyMasterTheorem` (function)
- `LoopInvariant` (interface)
- `Recurrence` (interface)
- `AlgorithmSpec` (interface)
- `GraphAlgorithmContext` (interface)
- `DataStructureSpec` (interface)
- `AmortizedAnalysis` (interface)
- `AlgorithmComparison` (interface)
- `ComplexityClass` (type)
- `CLRSCategory` (type)
- `CLRSAlgorithm` (type)
- `COMMON_RECURRENCES` (constant)

### `src/types/modes/analogical.ts`

- `isAnalogicalThought` (function)

### `src/types/modes/analysis.ts`

- `DataSource` (interface)
- `DataSegment` (interface)
- `Code` (interface)
- `CodeCooccurrence` (interface)
- `ThematicMap` (interface)
- `AnalyticalMemo` (interface)
- `GTCategory` (interface)
- `TheoreticalSampling` (interface)
- `DiscoursePattern` (interface)
- `CodeType` (type)
- `ThemeLevel` (type)
- `MemoType` (type)

### `src/types/modes/argumentation.ts`

- `Claim` (interface)
- `Grounds` (interface)
- `Backing` (interface)
- `Qualifier` (interface)
- `Rebuttal` (interface)
- `RebuttalResponse` (interface)
- `ArgumentChain` (interface)
- `DialecticPosition` (interface)
- `RhetoricalStrategy` (interface)
- `AudienceConsideration` (interface)
- `RhetoricalAppeal` (type)

### `src/types/modes/bayesian.ts`

- `isBayesianThought` (function)
- `SensitivityAnalysis` (interface)

### `src/types/modes/causal.ts`

- `isCausalThought` (function)
- `CausalNode` (interface)
- `CausalEdge` (interface)
- `CausalMechanism` (interface)
- `Confounder` (interface)
- `CounterfactualScenario` (interface)

### `src/types/modes/computability.ts`

- `TuringTransition` (interface)
- `ComputationStep` (interface)
- `ComputationTrace` (interface)
- `DecisionProblem` (interface)
- `ComplexityAnalysis` (interface)
- `OracleAnalysis` (interface)
- `ClassicUndecidableProblem` (type)

### `src/types/modes/constraint.ts`

- `AssignmentHistoryEntry` (interface)
- `Assignment` (interface)
- `ConstraintType` (type)
- `PropagationMethod` (type)
- `SearchStrategy` (type)
- `ConsistencyLevel` (type)

### `src/types/modes/counterfactual.ts`

- `isCounterfactualThought` (function)
- `Outcome` (interface)

### `src/types/modes/critique.ts`

- `DesignAssessment` (interface)
- `SampleAssessment` (interface)
- `AnalysisAssessment` (interface)
- `ValidityAssessment` (interface)
- `LogicalStructure` (interface)
- `EvidenceQuality` (interface)
- `EvidenceUseCritique` (interface)
- `NoveltyAssessment` (interface)
- `ImpactAssessment` (interface)
- `ContributionEvaluation` (interface)
- `ImprovementSuggestion` (interface)
- `WorkType` (type)

### `src/types/modes/cryptanalytic.ts`

- `KeySpaceAnalysis` (interface)
- `FrequencyAnalysis` (interface)
- `BanburismusAnalysis` (interface)
- `CribAnalysis` (interface)
- `IsomorphismPattern` (interface)

### `src/types/modes/custom.ts`

- `CustomField` (interface)
- `CustomStage` (interface)
- `CustomValidationRule` (interface)
- `CustomFieldType` (type)

### `src/types/modes/engineering.ts`

- `Requirement` (interface)
- `RequirementsTraceability` (interface)
- `TradeAlternative` (interface)
- `TradeCriterion` (interface)
- `TradeScore` (interface)
- `TradeStudy` (interface)
- `FailureMode` (interface)
- `FailureModeAnalysis` (interface)
- `DecisionAlternative` (interface)
- `DesignDecision` (interface)
- `DesignDecisionLog` (interface)
- `RequirementPriority` (type)
- `RequirementSource` (type)
- `RequirementStatus` (type)
- `SeverityRating` (type)
- `OccurrenceRating` (type)
- `DetectionRating` (type)
- `DecisionStatus` (type)

### `src/types/modes/evidential.ts`

- `isEvidentialThought` (function)
- `Hypothesis` (interface)
- `Evidence` (interface)
- `BeliefFunction` (interface)
- `MassAssignment` (interface)
- `PlausibilityFunction` (interface)
- `PlausibilityAssignment` (interface)
- `Decision` (interface)
- `Alternative` (interface)

### `src/types/modes/firstprinciples.ts`

- `isFirstPrinciplesThought` (function)
- `FoundationalPrinciple` (interface)
- `DerivationStep` (interface)
- `Conclusion` (interface)
- `PrincipleType` (type)

### `src/types/modes/formallogic.ts`

- `isFormalLogicThought` (function)
- `Proposition` (interface)
- `LogicalFormula` (interface)
- `Inference` (interface)
- `LogicalProof` (interface)
- `ProofStep` (interface)
- `TruthTable` (interface)
- `TruthTableRow` (interface)
- `SatisfiabilityResult` (interface)
- `ValidityResult` (interface)
- `LogicalArgument` (interface)
- `Contradiction` (interface)
- `LogicalEquivalence` (interface)
- `NormalForm` (interface)
- `LogicalOperator` (type)
- `InferenceRule` (type)
- `ProofTechnique` (type)

### `src/types/modes/gametheory.ts`

- `isGameTheoryThought` (function)
- `GameTree` (interface)
- `GameNode` (interface)
- `InformationSet` (interface)
- `BackwardInduction` (interface)
- `MinimaxAnalysis` (interface)
- `CooperativeGame` (interface)
- `CoalitionValue` (interface)
- `CoreAllocation` (interface)
- `CoalitionAnalysis` (interface)
- `ShapleyValueDetails` (interface)

### `src/types/modes/historical.ts`

- `isHistoricalThought` (function)
- `DateRange` (interface)
- `SourceBias` (interface)
- `PeriodTransition` (interface)
- `HistoricalPeriod` (interface)
- `CausalLink` (interface)
- `CausalChain` (interface)
- `ActorRelationship` (interface)
- `HistoricalActor` (interface)
- `HistoricalInterpretation` (interface)
- `HistoricalMethodology` (interface)

### `src/types/modes/hybrid.ts`

- `isHybridThought` (function)
- `MathematicalModel` (interface)
- `TensorProperties` (interface)
- `PhysicalInterpretation` (interface)

### `src/types/modes/mathematics.ts`

- `isMathematicsThought` (function)
- `ConsistencyReport` (interface)
- `Theorem` (interface)
- `Reference` (interface)
- `LogicalForm` (interface)
- `InconsistencyType` (type)

### `src/types/modes/metareasoning.ts`

- `isMetaReasoningThought` (function)

### `src/types/modes/modal.ts`

- `KripkeFrame` (interface)
- `ModalLogicSystem` (type)
- `ModalLogicType` (type)
- `ModalDomain` (type)
- `ModalOperator` (type)
- `KripkeProperty` (type)

### `src/types/modes/optimization.ts`

- `isOptimizationThought` (function)
- `ParetoSolution` (interface)
- `FeasibleRegion` (interface)
- `ParameterSensitivity` (interface)
- `ConstraintRelaxation` (interface)
- `TradeoffAnalysis` (interface)
- `Domain` (type)
- `ConstraintType` (type)

### `src/types/modes/physics.ts`

- `isPhysicsThought` (function)

### `src/types/modes/recursive.ts`

- `RecursiveCall` (interface)
- `MemoizationState` (interface)
- `RecursiveStrategy` (type)

### `src/types/modes/scientificmethod.ts`

- `isScientificMethodThought` (function)
- `ResearchQuestion` (interface)
- `Hypothesis` (interface)
- `ExperimentDesign` (interface)
- `Variable` (interface)
- `DataCollection` (interface)
- `Observation` (interface)
- `Measurement` (interface)
- `StatisticalAnalysis` (interface)
- `StatisticalTest` (interface)
- `ScientificConclusion` (interface)

### `src/types/modes/sequential.ts`

- `isSequentialThought` (function)

### `src/types/modes/shannon.ts`

- `isShannonThought` (function)

### `src/types/modes/stochastic.ts`

- `StochasticState` (interface)
- `StateTransition` (interface)
- `MarkovChain` (interface)
- `RandomVariable` (interface)
- `SimulationResult` (interface)
- `SimulationStatistics` (interface)
- `StochasticProcessType` (type)
- `DistributionType` (type)

### `src/types/modes/synthesis.ts`

- `SourceQuality` (interface)
- `Concept` (interface)
- `Finding` (interface)
- `Pattern` (interface)
- `ConceptRelation` (interface)
- `ConceptualFramework` (interface)
- `SynthesisConclusion` (interface)
- `ReviewMetadata` (interface)
- `SourceType` (type)

### `src/types/modes/systemsthinking.ts`

- `isSystemsThinkingThought` (function)
- `CausalLink` (interface)
- `EmergentBehavior` (interface)
- `StockFlow` (interface)
- `SystemDelay` (interface)
- `ComponentType` (type)
- `FeedbackType` (type)

### `src/types/modes/temporal.ts`

- `isTemporalThought` (function)
- `Timeline` (interface)
- `TemporalEvent` (interface)
- `TimeInterval` (interface)
- `TemporalConstraint` (interface)
- `TemporalRelation` (interface)

### `src/utils/errors.ts`

- `DeepThinkingError` (class)
- `SessionError` (class)
- `SessionAlreadyExistsError` (class)
- `ValidationError` (class)
- `InputValidationError` (class)
- `ConfigurationError` (class)
- `InvalidModeError` (class)
- `ThoughtProcessingError` (class)
- `ExportError` (class)
- `ResourceLimitError` (class)
- `ErrorFactory` (class)
- `RateLimitError` (class)
- `SecurityError` (class)
- `PathTraversalError` (class)
- `StorageError` (class)
- `BackupError` (class)

### `src/utils/file-lock.ts`

- `acquireLock` (function)
- `isLocked` (function)
- `forceUnlock` (function)

### `src/utils/logger.ts`

- `Logger` (class)

### `src/utils/sanitization.ts`

- `sanitizeOptionalString` (function)
- `sanitizeNumber` (function)
- `sanitizeStringArray` (function)
- `sanitizeTitle` (function)
- `sanitizeDomain` (function)
- `sanitizeAuthor` (function)

### `src/utils/type-guards.ts`

- `isExtendedThoughtType` (function)
- `isNumber` (function)
- `isNonEmptyString` (function)
- `isArray` (function)
- `isPlainObject` (function)
- `safeCast` (function)

### `src/validation/cache.ts`

- `ValidationCache` (class)
- `ValidationCacheEntry` (interface)

### `src/validation/schema-utils.ts`

- `createNodeSchema` (function)
- `createRangeSchema` (function)
- `HypothesisInput` (type)
- `ProbabilityWithJustification` (type)
- `ProbabilityWithCalculation` (type)
- `EvidenceInput` (type)
- `EvidenceWithSupport` (type)
- `NodeInput` (type)
- `WeightedNodeInput` (type)
- `EdgeInput` (type)
- `WeightedEdgeInput` (type)
- `CausalEdgeInput` (type)
- `TimePointInput` (type)
- `TimeIntervalInput` (type)
- `TemporalEventInput` (type)
- `MathExpressionInput` (type)
- `ValueWithUnitInput` (type)
- `MeasurementInput` (type)
- `PlayerInput` (type)
- `StrategyInput` (type)
- `PayoffInput` (type)
- `ReasoningStepInput` (type)
- `PropositionInput` (type)
- `InferenceRuleInput` (type)
- `ConstraintInput` (type)
- `ObjectiveInput` (type)
- `SolutionInput` (type)
- `BaseThoughtInput` (type)
- `probabilitySchema` (constant)
- `hypothesisSchema` (constant)
- `timePointSchema` (constant)
- `mathExpressionSchema` (constant)
- `playerSchema` (constant)
- `reasoningStepSchema` (constant)
- `constraintSchema` (constant)
- `baseThoughtSchema` (constant)
- `SchemaUtils` (constant)

### `src/validation/schemas.ts`

- `CreateSessionInput` (type)
- `AddThoughtInput` (type)
- `CompleteSessionInput` (type)
- `GetSessionInput` (type)
- `ListSessionsInput` (type)
- `ExportSessionInput` (type)
- `SearchSessionsInput` (type)
- `BatchOperationInput` (type)

