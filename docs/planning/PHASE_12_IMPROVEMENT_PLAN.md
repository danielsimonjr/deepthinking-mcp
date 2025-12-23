# Phase 12: Advanced Reasoning Features Improvement Plan

## Overview

This document outlines five major feature enhancements for DeepThinking MCP to expand its reasoning capabilities. These features can be implemented independently or combined with parallel execution infrastructure.

**Status**: In Progress (Sprints 1-3 Complete)
**Priority**: Medium
**Estimated Effort**: ~90 hours across 6 sprints
**Completed**: ~44 hours (Sprints 1-3), ~46 hours remaining (Sprints 4-6)

---

## Feature Summary

| Feature | Priority | Complexity | Estimated Hours |
|---------|----------|------------|-----------------|
| F-1: Advanced Proof Decomposition | High | High | 20-25 |
| F-2: Multi-Mode Analysis & Synthesis | Medium | Medium | 15-20 |
| F-3: Comprehensive Export System | High | Low | 10-12 |
| F-4: Monte Carlo / Stochastic Reasoning | High | High | 20-25 |
| F-5: Enhanced Graph Analysis | Medium | Medium | 15-18 |

---

## F-1: Advanced Proof Decomposition

### Current State

The existing proof decomposition system (`src/proof/`) provides:
- `ProofDecomposer` - Break proofs into steps
- `GapAnalyzer` - Identify logical gaps
- `AssumptionTracker` - Track assumptions through proof
- `InconsistencyDetector` - Find contradictions
- `CircularDetector` - Detect circular reasoning
- `DependencyGraph` - Map step dependencies

### Proposed Enhancements

#### 1.1 Independent Branch Detection

Automatically identify proof branches that don't depend on each other.

**New Files**:
```
src/proof/
├── branch-analyzer.ts          # NEW: Detect independent branches
├── branch-types.ts             # NEW: Branch-related types
└── parallel-coordinator.ts     # NEW: Coordinate branch analysis
```

**Implementation**:
```typescript
// src/proof/branch-analyzer.ts
export interface ProofBranch {
  id: string;
  steps: ProofStep[];
  dependencies: string[];      // IDs of branches this depends on
  dependents: string[];        // IDs of branches that depend on this
  isIndependent: boolean;      // True if no dependencies
  estimatedComplexity: number; // For load balancing
}

export class BranchAnalyzer {
  /**
   * Analyze a proof and identify independent branches
   */
  analyzeBranches(proof: Proof): ProofBranch[] {
    const graph = this.buildDependencyGraph(proof);
    const branches = this.partitionIntoBranches(graph);
    return this.markIndependentBranches(branches);
  }

  /**
   * Find the optimal execution order for branches
   * (topological sort respecting dependencies)
   */
  getExecutionOrder(branches: ProofBranch[]): ProofBranch[][] {
    // Returns array of "levels" - branches at same level can run in parallel
  }

  /**
   * Estimate complexity of a branch for load balancing
   */
  private estimateComplexity(branch: ProofBranch): number {
    // Based on: number of steps, nesting depth, types of operations
  }
}
```

#### 1.2 Hierarchical Proof Structure

Support for nested proofs (lemmas, sub-theorems).

**New Types**:
```typescript
// src/proof/branch-types.ts
export interface HierarchicalProof {
  id: string;
  type: 'theorem' | 'lemma' | 'corollary' | 'claim';
  statement: string;
  proof: ProofStep[];
  subProofs: HierarchicalProof[];  // Nested proofs
  dependencies: string[];          // IDs of lemmas this uses
}

export interface ProofTree {
  root: HierarchicalProof;
  lemmas: Map<string, HierarchicalProof>;
  dependencyOrder: string[];  // Topological order for proving
}
```

#### 1.3 Proof Strategy Recommendations

Suggest optimal proof strategies based on theorem structure.

**New File**:
```typescript
// src/proof/strategy-recommender.ts
export type ProofStrategy =
  | 'direct'
  | 'contradiction'
  | 'induction'
  | 'strong_induction'
  | 'structural_induction'
  | 'case_analysis'
  | 'contrapositive'
  | 'construction'
  | 'pigeonhole'
  | 'diagonalization';

export interface StrategyRecommendation {
  strategy: ProofStrategy;
  confidence: number;
  reasoning: string;
  suggestedStructure: ProofTemplate;
}

export class StrategyRecommender {
  recommend(theorem: Theorem): StrategyRecommendation[] {
    const features = this.extractFeatures(theorem);
    return this.matchStrategies(features);
  }

  private extractFeatures(theorem: Theorem): TheoremFeatures {
    return {
      hasUniversalQuantifier: this.detectUniversal(theorem),
      hasExistentialQuantifier: this.detectExistential(theorem),
      involvesInequality: this.detectInequality(theorem),
      hasRecursiveStructure: this.detectRecursion(theorem),
      domainType: this.identifyDomain(theorem),
      // ... more features
    };
  }
}
```

#### 1.4 Proof Verification

Formal verification of proof correctness.

**New File**:
```typescript
// src/proof/verifier.ts
export interface VerificationResult {
  isValid: boolean;
  errors: VerificationError[];
  warnings: VerificationWarning[];
  coverage: {
    stepsVerified: number;
    totalSteps: number;
    percentage: number;
  };
}

export class ProofVerifier {
  /**
   * Verify that each step follows logically from previous steps
   */
  verify(proof: Proof): VerificationResult {
    const errors: VerificationError[] = [];

    for (const step of proof.steps) {
      const justification = this.checkJustification(step, proof);
      if (!justification.valid) {
        errors.push({
          stepId: step.id,
          type: justification.errorType,
          message: justification.message,
          suggestion: justification.suggestion
        });
      }
    }

    return this.buildResult(errors, proof);
  }
}
```

---

## F-2: Multi-Mode Analysis & Synthesis

### Current State

Currently, modes are executed one at a time via individual tool calls. The LLM must orchestrate multi-mode analysis manually.

### Proposed Enhancements

#### 2.1 Mode Combination Framework

Define which modes work well together and how to merge their outputs.

**New Files**:
```
src/modes/
├── combinations/
│   ├── index.ts                # Mode combination registry
│   ├── combination-types.ts    # Types for mode combinations
│   ├── merger.ts               # Insight merging logic
│   └── presets.ts              # Pre-defined useful combinations
```

**Implementation**:
```typescript
// src/modes/combinations/combination-types.ts
export interface ModeCombination {
  id: string;
  name: string;
  description: string;
  modes: ThinkingMode[];
  mergeStrategy: MergeStrategy;
  useCase: string;
}

export type MergeStrategy =
  | 'union'           // Combine all insights
  | 'intersection'    // Only insights agreed by all modes
  | 'weighted'        // Weight by mode confidence
  | 'hierarchical'    // Primary mode with supporting modes
  | 'dialectical';    // Thesis/antithesis/synthesis

export interface MergedAnalysis {
  primaryInsights: Insight[];
  supportingEvidence: Map<Insight, ThinkingMode[]>;
  conflicts: ConflictingInsight[];
  synthesizedConclusion: string;
  confidenceScore: number;
}
```

**Pre-defined Combinations**:
```typescript
// src/modes/combinations/presets.ts
export const MODE_PRESETS: ModeCombination[] = [
  {
    id: 'comprehensive_analysis',
    name: 'Comprehensive Analysis',
    description: 'Multi-perspective problem analysis',
    modes: ['causal', 'bayesian', 'systemsthinking'],
    mergeStrategy: 'weighted',
    useCase: 'Understanding complex problems with multiple factors'
  },
  {
    id: 'hypothesis_testing',
    name: 'Hypothesis Testing',
    description: 'Rigorous hypothesis evaluation',
    modes: ['deductive', 'inductive', 'abductive'],
    mergeStrategy: 'dialectical',
    useCase: 'Evaluating theories or hypotheses'
  },
  {
    id: 'decision_making',
    name: 'Strategic Decision',
    description: 'Multi-framework decision analysis',
    modes: ['gametheory', 'optimization', 'firstprinciples'],
    mergeStrategy: 'hierarchical',
    useCase: 'Making strategic decisions with multiple stakeholders'
  },
  {
    id: 'root_cause',
    name: 'Root Cause Analysis',
    description: 'Deep causal investigation',
    modes: ['causal', 'counterfactual', 'firstprinciples'],
    mergeStrategy: 'union',
    useCase: 'Finding root causes of problems'
  },
  {
    id: 'future_planning',
    name: 'Future Planning',
    description: 'Scenario planning and forecasting',
    modes: ['temporal', 'bayesian', 'counterfactual'],
    mergeStrategy: 'weighted',
    useCase: 'Planning for uncertain futures'
  }
];
```

#### 2.2 New MCP Tool: `deepthinking_analyze`

```typescript
// Tool definition
{
  name: 'deepthinking_analyze',
  description: 'Run multi-mode analysis with automatic insight synthesis',
  inputSchema: {
    type: 'object',
    properties: {
      thought: {
        type: 'string',
        description: 'The problem or topic to analyze'
      },
      preset: {
        type: 'string',
        enum: ['comprehensive_analysis', 'hypothesis_testing', 'decision_making', 'root_cause', 'future_planning'],
        description: 'Pre-defined mode combination'
      },
      customModes: {
        type: 'array',
        items: { type: 'string' },
        description: 'Custom list of modes (overrides preset)'
      },
      mergeStrategy: {
        type: 'string',
        enum: ['union', 'intersection', 'weighted', 'hierarchical', 'dialectical'],
        default: 'weighted'
      },
      sessionId: { type: 'string' }
    },
    required: ['thought']
  }
}
```

#### 2.3 Conflict Resolution

Handle contradictory insights from different modes.

```typescript
// src/modes/combinations/conflict-resolver.ts
export interface ConflictingInsight {
  insight1: { mode: ThinkingMode; content: string; confidence: number };
  insight2: { mode: ThinkingMode; content: string; confidence: number };
  conflictType: 'direct_contradiction' | 'partial_overlap' | 'scope_difference';
  resolution?: {
    resolvedInsight: string;
    explanation: string;
    preservedFrom: ThinkingMode[];
  };
}

export class ConflictResolver {
  resolve(conflicts: ConflictingInsight[]): ResolvedConflict[] {
    return conflicts.map(conflict => {
      switch (conflict.conflictType) {
        case 'direct_contradiction':
          return this.resolveByConfidence(conflict);
        case 'partial_overlap':
          return this.synthesize(conflict);
        case 'scope_difference':
          return this.preserveBoth(conflict);
      }
    });
  }
}
```

---

## F-3: Comprehensive Export System

### Current State

Export formats: Markdown, LaTeX, Mermaid, DOT, ASCII, SVG, JSON, Jupyter

### Proposed Enhancements

#### 3.1 Export All Action

Single action to export session in all formats.

```typescript
// Add to deepthinking_session tool
case 'export_all': {
  const formats: ExportFormat[] = [
    'markdown', 'latex', 'mermaid', 'dot',
    'ascii', 'svg', 'json', 'jupyter'
  ];

  const results = new Map<ExportFormat, ExportResult>();

  for (const format of formats) {
    try {
      results.set(format, await exportService.export(session, format));
    } catch (error) {
      results.set(format, { error: error.message });
    }
  }

  return {
    sessionId: input.sessionId,
    exports: Object.fromEntries(results),
    successCount: [...results.values()].filter(r => !r.error).length,
    failureCount: [...results.values()].filter(r => r.error).length
  };
}
```

#### 3.2 Export Profiles

Pre-configured export bundles for different use cases.

```typescript
// src/export/profiles.ts
export interface ExportProfile {
  id: string;
  name: string;
  formats: ExportFormat[];
  options: ExportOptions;
  postProcess?: (results: ExportResult[]) => void;
}

export const EXPORT_PROFILES: ExportProfile[] = [
  {
    id: 'academic',
    name: 'Academic Paper',
    formats: ['latex', 'markdown', 'json'],
    options: {
      includeCitations: true,
      formatStyle: 'apa'
    }
  },
  {
    id: 'presentation',
    name: 'Presentation',
    formats: ['mermaid', 'svg', 'markdown'],
    options: {
      simplifyDiagrams: true,
      maxNodes: 20
    }
  },
  {
    id: 'documentation',
    name: 'Technical Documentation',
    formats: ['markdown', 'mermaid', 'ascii'],
    options: {
      includeCodeBlocks: true,
      expandDetails: true
    }
  },
  {
    id: 'archive',
    name: 'Full Archive',
    formats: ['json', 'markdown', 'latex', 'jupyter'],
    options: {
      includeMetadata: true,
      includeTimestamps: true
    }
  }
];
```

#### 3.3 Export to File System

Direct export to files with organized directory structure.

```typescript
// src/export/file-exporter.ts
export interface FileExportOptions {
  outputDir: string;
  createSubdirectories: boolean;
  filenamePattern: string;  // e.g., "{session}_{mode}_{date}"
  overwrite: boolean;
}

export class FileExporter {
  async exportToFiles(
    session: Session,
    profile: ExportProfile,
    options: FileExportOptions
  ): Promise<FileExportResult> {
    const baseDir = path.join(options.outputDir, session.id);

    if (options.createSubdirectories) {
      await fs.mkdir(baseDir, { recursive: true });
    }

    const files: string[] = [];

    for (const format of profile.formats) {
      const content = await this.exportService.export(session, format);
      const filename = this.formatFilename(options.filenamePattern, {
        session: session.id,
        mode: session.mode,
        date: new Date().toISOString().split('T')[0],
        format
      });

      const filepath = path.join(baseDir, filename);
      await fs.writeFile(filepath, content);
      files.push(filepath);
    }

    return { directory: baseDir, files };
  }
}
```

---

## F-4: Monte Carlo / Stochastic Reasoning

### Current State

Stochastic mode exists with a dedicated `StochasticThought` type in `src/types/modes/stochastic.ts` including:
- `StochasticProcessType`, `StochasticState`, `StateTransition`
- `MarkovChain`, `RandomVariable`, `DistributionType`
- `SimulationResult`, `SimulationStatistics`

However, it lacks a dedicated handler and Monte Carlo simulation engine.

### Proposed Enhancements

#### 4.1 Monte Carlo Extensions

Extend the existing stochastic types with Monte Carlo simulation capabilities.

**New Files**:
```
src/modes/stochastic/
├── index.ts                    # Module exports
├── types.ts                    # Stochastic types
├── models/
│   ├── distribution.ts         # Probability distributions
│   ├── markov-chain.ts         # Markov chain models
│   ├── bayesian-network.ts     # Bayesian network integration
│   └── monte-carlo.ts          # Monte Carlo engine
├── sampling/
│   ├── samplers.ts             # Various sampling strategies
│   └── rng.ts                  # Seeded random number generator
└── analysis/
    ├── statistics.ts           # Statistical analysis
    ├── convergence.ts          # Convergence detection
    └── visualization.ts        # Result visualization
```

**New Types** (Monte Carlo extensions - complements existing `src/types/modes/stochastic.ts`):
```typescript
// src/modes/stochastic/types.ts - Monte Carlo specific types
// NOTE: StochasticThought, DistributionType, RandomVariable already exist in src/types/modes/stochastic.ts

export interface StochasticModel {
  type: 'discrete' | 'continuous' | 'mixed';
  variables: StochasticVariable[];
  dependencies: Dependency[];
  constraints?: Constraint[];
}

export interface StochasticVariable {
  name: string;
  distribution: Distribution;
  domain: Domain;
}

// Extended distribution type for Monte Carlo (supplements existing DistributionType)
export type Distribution =
  | { type: 'normal'; mean: number; stdDev: number }
  | { type: 'uniform'; min: number; max: number }
  | { type: 'exponential'; rate: number }
  | { type: 'poisson'; lambda: number }
  | { type: 'binomial'; n: number; p: number }
  | { type: 'categorical'; probabilities: Record<string, number> }
  | { type: 'custom'; sampler: () => number };

export interface MonteCarloConfig {
  iterations: number;
  burnIn?: number;
  thinning?: number;
  convergenceThreshold?: number;
  seed?: number;
}

export interface MonteCarloResult {
  samples: number[][];
  statistics: {
    mean: number[];
    variance: number[];
    percentiles: Record<number, number[]>;
    correlations: number[][];
  };
  convergenceDiagnostics: {
    gewekeStatistic: number;
    effectiveSampleSize: number;
    rHat: number;
  };
  executionTime: number;
}
```

#### 4.2 Monte Carlo Engine

```typescript
// src/modes/stochastic/models/monte-carlo.ts
export class MonteCarloEngine {
  private rng: SeededRNG;

  constructor(seed?: number) {
    this.rng = new SeededRNG(seed ?? Date.now());
  }

  /**
   * Run Monte Carlo simulation
   */
  async simulate(
    model: StochasticModel,
    config: MonteCarloConfig,
    onProgress?: (progress: SimulationProgress) => void
  ): Promise<MonteCarloResult> {
    const samples: number[][] = [];
    const startTime = Date.now();

    for (let i = 0; i < config.iterations; i++) {
      // Sample from model
      const sample = this.sampleFromModel(model);

      // Apply burn-in
      if (i >= (config.burnIn ?? 0)) {
        // Apply thinning
        if ((i - (config.burnIn ?? 0)) % (config.thinning ?? 1) === 0) {
          samples.push(sample);
        }
      }

      // Progress callback
      if (onProgress && i % 1000 === 0) {
        onProgress({
          completed: i,
          total: config.iterations,
          percentage: (i / config.iterations) * 100,
          estimatedRemaining: this.estimateRemaining(startTime, i, config.iterations)
        });
      }

      // Check convergence
      if (config.convergenceThreshold && samples.length > 100) {
        if (this.hasConverged(samples, config.convergenceThreshold)) {
          break;
        }
      }
    }

    return {
      samples,
      statistics: this.computeStatistics(samples),
      convergenceDiagnostics: this.computeDiagnostics(samples),
      executionTime: Date.now() - startTime
    };
  }

  private sampleFromModel(model: StochasticModel): number[] {
    return model.variables.map(v => this.sampleVariable(v));
  }

  private sampleVariable(variable: StochasticVariable): number {
    const { distribution } = variable;

    switch (distribution.type) {
      case 'normal':
        return this.rng.normal(distribution.mean, distribution.stdDev);
      case 'uniform':
        return this.rng.uniform(distribution.min, distribution.max);
      case 'exponential':
        return this.rng.exponential(distribution.rate);
      case 'poisson':
        return this.rng.poisson(distribution.lambda);
      case 'binomial':
        return this.rng.binomial(distribution.n, distribution.p);
      case 'categorical':
        return this.rng.categorical(distribution.probabilities);
      case 'custom':
        return distribution.sampler();
    }
  }
}
```

#### 4.3 Stochastic Mode Handler

```typescript
// src/modes/handlers/StochasticHandler.ts
export class StochasticHandler implements ModeHandler {
  mode = ThinkingMode.STOCHASTIC;

  private engine: MonteCarloEngine;

  validate(input: ThinkingToolInput): ValidationResult {
    // Validate stochastic-specific inputs
    if (input.model && !this.isValidModel(input.model)) {
      return { valid: false, error: 'Invalid stochastic model definition' };
    }
    return { valid: true };
  }

  enhance(thought: Thought, context: SessionContext): Thought {
    const stochasticThought = thought as StochasticThought;

    // Run simulation if model provided
    if (stochasticThought.model && stochasticThought.iterations) {
      const result = this.engine.simulate(
        stochasticThought.model,
        { iterations: stochasticThought.iterations }
      );

      stochasticThought.simulationResult = result;
      stochasticThought.insights = this.extractInsights(result);
    }

    return stochasticThought;
  }

  private extractInsights(result: MonteCarloResult): string[] {
    const insights: string[] = [];

    // Add statistical insights
    insights.push(`Mean outcome: ${result.statistics.mean.join(', ')}`);
    insights.push(`95% CI: [${result.statistics.percentiles[2.5]}, ${result.statistics.percentiles[97.5]}]`);

    // Add convergence info
    if (result.convergenceDiagnostics.rHat < 1.1) {
      insights.push('Simulation has converged (R-hat < 1.1)');
    }

    return insights;
  }
}
```

---

## F-5: Enhanced Graph Analysis

### Current State

Causal mode has basic graph support with nodes, edges, and interventions.

### Proposed Enhancements

#### 5.1 Advanced Graph Algorithms

**New Files**:
```
src/modes/causal/graph/
├── index.ts                    # Graph module exports
├── types.ts                    # Graph types
├── algorithms/
│   ├── cycle-detection.ts      # Cycle detection algorithms
│   ├── path-finding.ts         # Path finding (shortest, all paths)
│   ├── centrality.ts           # Centrality measures
│   ├── clustering.ts           # Graph clustering
│   ├── d-separation.ts         # D-separation for causal inference
│   └── intervention.ts         # Do-calculus interventions
└── visualization/
    ├── layout.ts               # Graph layout algorithms
    └── export.ts               # Graph-specific exports
```

**Algorithms**:
```typescript
// src/modes/causal/graph/algorithms/centrality.ts
export interface CentralityMeasures {
  degree: Map<string, number>;
  betweenness: Map<string, number>;
  closeness: Map<string, number>;
  pageRank: Map<string, number>;
  eigenvector: Map<string, number>;
}

export class CentralityAnalyzer {
  /**
   * Compute all centrality measures for a graph
   */
  analyze(graph: CausalGraph): CentralityMeasures {
    return {
      degree: this.computeDegreeCentrality(graph),
      betweenness: this.computeBetweennessCentrality(graph),
      closeness: this.computeClosenessCentrality(graph),
      pageRank: this.computePageRank(graph),
      eigenvector: this.computeEigenvectorCentrality(graph)
    };
  }

  /**
   * Identify most influential nodes
   */
  getInfluentialNodes(
    graph: CausalGraph,
    measure: keyof CentralityMeasures,
    topN: number = 5
  ): Array<{ nodeId: string; score: number }> {
    const measures = this.analyze(graph);
    const scores = measures[measure];

    return [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([nodeId, score]) => ({ nodeId, score }));
  }
}
```

```typescript
// src/modes/causal/graph/algorithms/d-separation.ts
export interface DSeparationResult {
  separated: boolean;
  blockingPaths: Path[];
  openPaths: Path[];
  conditioningSet: string[];
}

export class DSeparationAnalyzer {
  /**
   * Check if X and Y are d-separated given Z
   */
  isDSeparated(
    graph: CausalGraph,
    x: string[],
    y: string[],
    z: string[]
  ): DSeparationResult {
    const allPaths = this.findAllPaths(graph, x, y);
    const blockingPaths: Path[] = [];
    const openPaths: Path[] = [];

    for (const path of allPaths) {
      if (this.isPathBlocked(path, z, graph)) {
        blockingPaths.push(path);
      } else {
        openPaths.push(path);
      }
    }

    return {
      separated: openPaths.length === 0,
      blockingPaths,
      openPaths,
      conditioningSet: z
    };
  }

  /**
   * Find minimal conditioning set to make X and Y d-separated
   */
  findMinimalSeparator(
    graph: CausalGraph,
    x: string[],
    y: string[]
  ): string[] | null {
    // Implementation using algorithm from Pearl's Causality
  }
}
```

#### 5.2 Do-Calculus Implementation

```typescript
// src/modes/causal/graph/algorithms/intervention.ts
export interface InterventionResult {
  originalDistribution: ProbabilityDistribution;
  interventionDistribution: ProbabilityDistribution;
  identifiable: boolean;
  estimand?: string;  // LaTeX formula
  adjustment?: AdjustmentFormula;
}

export class DoCalculus {
  /**
   * Compute effect of do(X=x) on Y
   */
  computeInterventionalEffect(
    graph: CausalGraph,
    intervention: { variable: string; value: number },
    outcome: string
  ): InterventionResult {
    // Check identifiability
    const identifiable = this.checkIdentifiability(graph, intervention.variable, outcome);

    if (!identifiable) {
      return {
        originalDistribution: this.getObservational(graph, outcome),
        interventionDistribution: null,
        identifiable: false
      };
    }

    // Find adjustment set
    const adjustment = this.findAdjustmentSet(graph, intervention.variable, outcome);

    // Compute interventional distribution
    const interventionDist = this.computeWithAdjustment(
      graph,
      intervention,
      outcome,
      adjustment
    );

    return {
      originalDistribution: this.getObservational(graph, outcome),
      interventionDistribution: interventionDist,
      identifiable: true,
      estimand: this.formatEstimand(intervention, outcome, adjustment),
      adjustment
    };
  }
}
```

#### 5.3 Enhanced Causal Handler

```typescript
// Update src/modes/handlers/CausalHandler.ts
export class CausalHandler implements ModeHandler {
  // ... existing code ...

  enhance(thought: Thought, context: SessionContext): Thought {
    const causalThought = thought as CausalThought;

    // Existing enhancements
    causalThought.cycles = this.detectCycles(causalThought.nodes, causalThought.edges);

    // NEW: Compute centrality
    if (causalThought.nodes.length > 3) {
      const centrality = new CentralityAnalyzer();
      causalThought.centralityMeasures = centrality.analyze(causalThought);
      causalThought.keyNodes = centrality.getInfluentialNodes(
        causalThought,
        'betweenness',
        3
      );
    }

    // NEW: D-separation analysis
    if (causalThought.queryVariables) {
      const dSep = new DSeparationAnalyzer();
      causalThought.dSeparation = dSep.isDSeparated(
        causalThought,
        causalThought.queryVariables.x,
        causalThought.queryVariables.y,
        causalThought.queryVariables.conditioning || []
      );
    }

    // NEW: Do-calculus for interventions
    if (causalThought.interventions?.length > 0) {
      const doCalc = new DoCalculus();
      causalThought.interventionEffects = causalThought.interventions.map(
        intervention => doCalc.computeInterventionalEffect(
          causalThought,
          intervention,
          causalThought.outcomeVariable
        )
      );
    }

    return causalThought;
  }
}
```

---

## Implementation Phases

### Sprint 1: Foundation (12-15 hours)

**Objective**: Set up infrastructure for new features

1. Create directory structure for new modules
2. Define shared types and interfaces
3. Add base classes and utilities
4. Update build configuration

**Deliverables**:
- `src/proof/branch-types.ts`
- `src/modes/combinations/combination-types.ts`
- `src/modes/stochastic/types.ts`
- `src/modes/causal/graph/types.ts`

### Sprint 2: Proof Decomposition (15-18 hours)

**Objective**: Implement advanced proof features

1. Implement `BranchAnalyzer`
2. Implement `StrategyRecommender`
3. Implement `ProofVerifier`
4. Add hierarchical proof support
5. Write tests

**Deliverables**:
- `src/proof/branch-analyzer.ts`
- `src/proof/strategy-recommender.ts`
- `src/proof/verifier.ts`
- Tests in `tests/unit/proof/`

### Sprint 3: Multi-Mode Analysis (12-15 hours)

**Objective**: Implement mode combination framework

1. Create mode combination registry
2. Implement insight merger
3. Implement conflict resolver
4. Add `deepthinking_analyze` tool
5. Create preset combinations
6. Write tests

**Deliverables**:
- `src/modes/combinations/`
- `deepthinking_analyze` tool
- Tests in `tests/unit/modes/combinations/`

### Sprint 4: Export System (8-10 hours)

**Objective**: Enhance export capabilities

1. Implement `export_all` action
2. Create export profiles
3. Implement file exporter
4. Add progress reporting
5. Write tests

**Deliverables**:
- `src/export/profiles.ts`
- `src/export/file-exporter.ts`
- Enhanced `deepthinking_session` tool

### Sprint 5: Stochastic Mode (18-20 hours)

**Objective**: Full stochastic/Monte Carlo implementation

1. Implement probability distributions
2. Implement seeded RNG
3. Implement Monte Carlo engine
4. Create StochasticHandler
5. Add statistical analysis
6. Write tests

**Deliverables**:
- `src/modes/stochastic/` module
- `StochasticHandler`
- Tests in `tests/unit/modes/stochastic/`

### Sprint 6: Graph Analysis (15-18 hours)

**Objective**: Advanced causal graph features

1. Implement centrality algorithms
2. Implement d-separation
3. Implement do-calculus
4. Enhance CausalHandler
5. Add graph visualization improvements
6. Write tests

**Deliverables**:
- `src/modes/causal/graph/` module
- Enhanced `CausalHandler`
- Tests in `tests/unit/modes/causal/`

---

## Testing Strategy

### Unit Tests

Each new module should have comprehensive unit tests:

```
tests/unit/
├── proof/
│   ├── branch-analyzer.test.ts
│   ├── strategy-recommender.test.ts
│   └── verifier.test.ts
├── modes/
│   ├── combinations/
│   │   ├── merger.test.ts
│   │   └── conflict-resolver.test.ts
│   ├── stochastic/
│   │   ├── monte-carlo.test.ts
│   │   ├── distributions.test.ts
│   │   └── rng.test.ts
│   └── causal/
│       ├── centrality.test.ts
│       ├── d-separation.test.ts
│       └── do-calculus.test.ts
└── export/
    ├── profiles.test.ts
    └── file-exporter.test.ts
```

### Integration Tests

```
tests/integration/
├── multi-mode-analysis.test.ts
├── proof-decomposition.test.ts
├── stochastic-simulation.test.ts
└── causal-inference.test.ts
```

---

## Success Criteria

| Feature | Success Metric |
|---------|----------------|
| Proof Decomposition | Correctly identify 90%+ independent branches |
| Multi-Mode Analysis | Merge insights from 3+ modes coherently |
| Export System | Export all 8 formats in <5 seconds |
| Stochastic Mode | Converge within 10% of analytical solution |
| Graph Analysis | D-separation correct for all test cases |

---

## Dependencies

- No new external dependencies for F-1, F-2, F-3, F-5
- F-4 (Stochastic): Consider `@stdlib/random` for distributions (optional)

---

## Future Considerations

- **F-1 Extension**: Automated proof search using tactics
- **F-2 Extension**: Learning optimal mode combinations from usage
- **F-3 Extension**: Export to additional formats (PDF, HTML report)
- **F-4 Extension**: MCMC samplers (Metropolis-Hastings, HMC)
- **F-5 Extension**: Causal discovery algorithms (PC, FCI)

---

## References

- Pearl, J. (2009). Causality: Models, Reasoning, and Inference
- Gelman, A. et al. (2013). Bayesian Data Analysis
- Cormen, T. et al. (2009). Introduction to Algorithms (CLRS)
- Toulmin, S. (2003). The Uses of Argument
