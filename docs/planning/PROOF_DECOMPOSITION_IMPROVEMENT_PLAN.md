# Phase 8: Mathematical Proof Decomposition & Inconsistency Detection (v7.0.0)

## Executive Summary

**Goal**: Enhance the Mathematics reasoning mode with proof decomposition capabilities and inconsistency detection, transforming it from a documentation-only mode into an analytical reasoning engine.

**What is Proof Decomposition?**
Proof decomposition is the systematic breakdown of mathematical proofs into atomic components (statements, dependencies, assumptions) with analysis capabilities to detect logical inconsistencies, circular reasoning, and proof gaps—without requiring an automated theorem prover or equation solver.

**Value Proposition**:
1. **Analytical Power**: Transform Mathematics mode from passive documentation to active analysis
2. **Inconsistency Detection**: Identify contradictions, circular reasoning, and hidden assumptions
3. **Proof Transparency**: Trace any conclusion back to its foundational axioms
4. **Educational Value**: Understand proof structure and identify gaps
5. **Quality Assurance**: Validate mathematical reasoning before accepting conclusions

**Approach**: Four-sprint implementation
- **Sprint 1**: Core type system and dependency graph infrastructure
- **Sprint 2**: Proof decomposition engine and new thought types
- **Sprint 3**: Inconsistency detection and analysis services
- **Sprint 4**: MCP tools, visual exports, and integration

**Total Effort**: 60-80 developer hours across 4 sprints

---

## Current State Analysis

### Existing Mathematics Mode (v6.1.2)

**Location**: `src/types/modes/mathematics.ts`

**Current Thought Types**:
```typescript
type MathematicsThoughtType =
  | 'axiom_definition'
  | 'theorem_statement'
  | 'proof_construction'
  | 'lemma_derivation'
  | 'corollary'
  | 'counterexample'
  | 'algebraic_manipulation'
  | 'symbolic_computation'
  | 'numerical_analysis';
```

**Current Interfaces**:
- `MathematicalModel` - LaTeX/symbolic representation
- `ProofStrategy` - Proof technique (direct, contradiction, induction, etc.)
- `Theorem` - Statement, hypotheses, conclusion
- `LogicalForm` - Premises, conclusion, inference rule
- `Reference` - External citations

**What's Missing**:
| Gap | Impact |
|-----|--------|
| No dependency graph | Cannot trace statement relationships |
| No decomposition engine | Cannot break proofs into atoms |
| No inconsistency detection | Cannot find contradictions |
| No circular reasoning check | Cannot detect self-referential proofs |
| No gap analysis | Cannot find missing steps |
| No assumption tracking | Cannot trace conclusions to axioms |
| No dedicated mode handler | Falls through to generic ThoughtFactory |

### Related Infrastructure

**Formal Logic Mode** (`src/types/modes/formallogic.ts`):
- Has `Contradiction` interface (unused)
- Has `InferenceRule` type with 10 rules
- Has `ProofStep` with step references
- **Status**: Experimental, no runtime engine

**Meta-Reasoning Mode** (`src/modes/meta-reasoning.ts`):
- Quality assessment framework
- Bias detection patterns
- **Reusable**: Quality criteria can inform proof quality analysis

---

## Target Architecture

### New Type Hierarchy

```
MathematicsThought (enhanced)
├── thoughtType: MathematicsThoughtType (expanded)
├── decomposition?: ProofDecomposition      [NEW]
├── dependencyGraph?: DependencyGraph       [NEW]
├── consistencyReport?: ConsistencyReport   [NEW]
├── assumptionChain?: AssumptionChain       [NEW]
└── gapAnalysis?: GapAnalysis               [NEW]
```

### New Directory Structure

```
src/
├── modes/
│   └── mathematics-reasoning.ts    [NEW] Mathematics engine
├── proof/                          [NEW] Proof analysis subsystem
│   ├── decomposer.ts              [NEW] Proof decomposition
│   ├── dependency-graph.ts        [NEW] Statement dependencies
│   ├── inconsistency-detector.ts  [NEW] Contradiction detection
│   ├── circular-detector.ts       [NEW] Circular reasoning detection
│   ├── gap-analyzer.ts            [NEW] Missing step detection
│   ├── assumption-tracker.ts      [NEW] Assumption chain analysis
│   └── index.ts                   [NEW] Barrel export
├── types/
│   └── modes/
│       └── mathematics.ts          [MODIFY] Add decomposition types
└── export/
    └── visual/
        └── proof-decomposition.ts  [NEW] Proof visualization
```

---

## Sprint Structure

### Sprint 1: Core Type System & Dependency Graph (Week 1)
**Effort**: 14-18 hours | **Result**: Foundation types and dependency graph builder

**Overview**: Establish the type system for proof decomposition and build the dependency graph infrastructure that all other features depend on.

**Key Deliverables**:
1. Extended `MathematicsThoughtType` with 5 new thought types
2. Core decomposition interfaces (`AtomicStatement`, `DependencyGraph`, etc.)
3. Dependency graph builder with cycle detection
4. Unit tests for all new types

**Tasks**:

#### Task 1.1: Extend MathematicsThoughtType (1 hour)
**File**: `src/types/modes/mathematics.ts`

Add new thought types for proof analysis:
```typescript
export type MathematicsThoughtType =
  // Existing types
  | 'axiom_definition'
  | 'theorem_statement'
  | 'proof_construction'
  | 'lemma_derivation'
  | 'corollary'
  | 'counterexample'
  | 'algebraic_manipulation'
  | 'symbolic_computation'
  | 'numerical_analysis'
  // NEW: Proof Decomposition Types
  | 'proof_decomposition'      // Breaking proof into atoms
  | 'dependency_analysis'      // Analyzing statement dependencies
  | 'consistency_check'        // Checking for contradictions
  | 'gap_identification'       // Finding missing steps
  | 'assumption_trace';        // Tracing back to axioms
```

#### Task 1.2: Create AtomicStatement Interface (1.5 hours)
**File**: `src/types/modes/mathematics.ts`

```typescript
/**
 * Atomic statement - the smallest unit of a proof
 */
export interface AtomicStatement {
  id: string;
  statement: string;
  latex?: string;
  type: 'axiom' | 'definition' | 'hypothesis' | 'lemma' | 'derived' | 'conclusion';

  // Provenance
  justification?: string;
  derivedFrom?: string[];           // IDs of statements this depends on
  usedInferenceRule?: InferenceRule;

  // Metadata
  confidence: number;               // 0-1, how certain is this statement
  isExplicit: boolean;              // Was this explicitly stated or inferred?
  sourceLocation?: {                // Where in the proof this appears
    stepNumber?: number;
    section?: string;
  };
}

/**
 * Inference rules for mathematical reasoning
 */
export type InferenceRule =
  | 'modus_ponens'
  | 'modus_tollens'
  | 'hypothetical_syllogism'
  | 'disjunctive_syllogism'
  | 'universal_instantiation'
  | 'existential_generalization'
  | 'mathematical_induction'
  | 'contradiction'
  | 'direct_implication'
  | 'substitution'
  | 'algebraic_manipulation'
  | 'definition_expansion';
```

#### Task 1.3: Create DependencyGraph Interface (2 hours)
**File**: `src/types/modes/mathematics.ts`

```typescript
/**
 * Directed edge in dependency graph
 */
export interface DependencyEdge {
  from: string;                     // Source statement ID
  to: string;                       // Target statement ID (depends on source)
  type: 'logical' | 'definitional' | 'computational' | 'implicit';
  strength: number;                 // 0-1, how strong is the dependency
  inferenceRule?: InferenceRule;
}

/**
 * Dependency graph for proof analysis
 */
export interface DependencyGraph {
  nodes: Map<string, AtomicStatement>;
  edges: DependencyEdge[];

  // Computed properties
  roots: string[];                  // Axioms/hypotheses (no incoming edges)
  leaves: string[];                 // Final conclusions (no outgoing edges)

  // Graph metrics
  depth: number;                    // Longest path from root to leaf
  width: number;                    // Maximum nodes at any level
  hasCycles: boolean;               // Indicates circular reasoning

  // Analysis
  stronglyConnectedComponents?: string[][]; // For cycle detection
  topologicalOrder?: string[];      // Valid if acyclic
}
```

#### Task 1.4: Create Proof Decomposition Types (2 hours)
**File**: `src/types/modes/mathematics.ts`

```typescript
/**
 * Identified gap in a proof
 */
export interface ProofGap {
  id: string;
  type: 'missing_step' | 'unjustified_leap' | 'implicit_assumption' | 'undefined_term' | 'scope_error';
  location: {
    from: string;                   // Statement ID before gap
    to: string;                     // Statement ID after gap
  };
  description: string;
  severity: 'minor' | 'significant' | 'critical';
  suggestedFix?: string;
}

/**
 * Chain of assumptions leading to a conclusion
 */
export interface AssumptionChain {
  conclusion: string;               // Statement ID
  assumptions: string[];            // Ordered list of assumption IDs
  path: string[];                   // Full derivation path
  allAssumptionsExplicit: boolean;
  implicitAssumptions: ImplicitAssumption[];
}

/**
 * Implicit assumption detected in reasoning
 */
export interface ImplicitAssumption {
  id: string;
  statement: string;
  type: 'domain_assumption' | 'existence_assumption' | 'uniqueness_assumption'
      | 'continuity_assumption' | 'finiteness_assumption' | 'well_ordering';
  usedInStep: string;               // Where this assumption is needed
  shouldBeExplicit: boolean;
  suggestedFormulation: string;
}

/**
 * Complete proof decomposition result
 */
export interface ProofDecomposition {
  id: string;
  originalProof: string;
  theorem?: string;

  // Decomposed elements
  atoms: AtomicStatement[];
  dependencies: DependencyGraph;

  // Analysis results
  assumptionChains: AssumptionChain[];
  gaps: ProofGap[];
  implicitAssumptions: ImplicitAssumption[];

  // Metrics
  completeness: number;             // 0-1
  rigorLevel: 'informal' | 'textbook' | 'rigorous' | 'formal';
  atomCount: number;
  maxDependencyDepth: number;
}
```

#### Task 1.5: Build DependencyGraphBuilder Class (3 hours)
**File**: `src/proof/dependency-graph.ts`

```typescript
/**
 * Builds and analyzes dependency graphs for mathematical proofs
 */
export class DependencyGraphBuilder {
  private nodes: Map<string, AtomicStatement>;
  private edges: DependencyEdge[];

  constructor();

  // Building
  addStatement(statement: AtomicStatement): void;
  addDependency(from: string, to: string, type: DependencyEdge['type']): void;

  // Analysis
  build(): DependencyGraph;
  findRoots(): string[];
  findLeaves(): string[];
  computeDepth(): number;

  // Cycle detection (Tarjan's algorithm)
  detectCycles(): string[][];
  hasCycles(): boolean;

  // Traversal
  getAncestors(nodeId: string): string[];
  getDescendants(nodeId: string): string[];
  getTopologicalOrder(): string[] | null;  // null if cycles exist

  // Path finding
  findPath(from: string, to: string): string[] | null;
  findAllPaths(from: string, to: string): string[][];
}
```

#### Task 1.6: Implement Cycle Detection (Tarjan's Algorithm) (2 hours)
**File**: `src/proof/dependency-graph.ts`

Implement strongly connected components detection to identify circular reasoning:
- Tarjan's algorithm for SCC detection
- Report cycles with full paths
- Provide human-readable cycle descriptions

#### Task 1.7: Create Unit Tests for Types (2 hours)
**File**: `tests/unit/proof/types.test.ts`

Test cases:
- AtomicStatement creation and validation
- DependencyGraph building
- Edge type validation
- Cycle detection (positive and negative cases)
- Topological sort

#### Task 1.8: Create Unit Tests for DependencyGraphBuilder (2 hours)
**File**: `tests/unit/proof/dependency-graph.test.ts`

Test cases:
- Simple linear proof (A → B → C)
- Branching proof (A → B, A → C, B+C → D)
- Circular proof detection (A → B → C → A)
- Multiple root handling
- Deep proof analysis

**Sprint 1 Success Criteria**:
- All new types compile without errors
- DependencyGraphBuilder passes 20+ unit tests
- Cycle detection correctly identifies circular proofs
- Topological sort produces valid orderings
- Zero breaking changes to existing functionality

**Files Created**:
- `src/proof/dependency-graph.ts`
- `src/proof/index.ts`
- `tests/unit/proof/types.test.ts`
- `tests/unit/proof/dependency-graph.test.ts`

**Files Modified**:
- `src/types/modes/mathematics.ts`
- `src/types/index.ts` (barrel export)

---

### Sprint 2: Proof Decomposition Engine (Week 2)
**Effort**: 16-20 hours | **Result**: Working proof decomposer with gap detection

**Overview**: Build the core proof decomposition engine that breaks proofs into atomic statements and identifies structural gaps.

**Key Deliverables**:
1. `ProofDecomposer` class with statement extraction
2. `GapAnalyzer` class for missing step detection
3. `AssumptionTracker` for assumption chain analysis
4. Integration with MathematicsThought

**Tasks**:

#### Task 2.1: Create ProofDecomposer Class (4 hours)
**File**: `src/proof/decomposer.ts`

```typescript
/**
 * Decomposes mathematical proofs into atomic components
 */
export class ProofDecomposer {
  private graphBuilder: DependencyGraphBuilder;

  constructor();

  /**
   * Decompose a proof into atomic statements and dependencies
   */
  decompose(input: ProofDecompositionInput): ProofDecomposition;

  /**
   * Extract atomic statements from proof text/steps
   */
  extractStatements(proofSteps: ProofStep[]): AtomicStatement[];

  /**
   * Infer dependencies between statements
   */
  inferDependencies(statements: AtomicStatement[]): DependencyEdge[];

  /**
   * Classify statement types (axiom, lemma, derived, etc.)
   */
  classifyStatement(statement: AtomicStatement, context: DecompositionContext): AtomicStatement['type'];

  /**
   * Compute decomposition metrics
   */
  computeMetrics(decomposition: ProofDecomposition): DecompositionMetrics;
}

interface ProofDecompositionInput {
  proof: string | ProofStep[];
  theorem?: string;
  hypotheses?: string[];
  rigorLevel?: 'informal' | 'textbook' | 'rigorous' | 'formal';
}

interface DecompositionContext {
  knownAxioms: string[];
  knownDefinitions: string[];
  hypotheses: string[];
}

interface DecompositionMetrics {
  atomCount: number;
  dependencyCount: number;
  maxDepth: number;
  avgBranchingFactor: number;
  completeness: number;
}
```

#### Task 2.2: Implement Statement Extraction Logic (3 hours)
**File**: `src/proof/decomposer.ts`

Pattern matching for common mathematical structures:
- "Let X be..." → definition/hypothesis
- "By [theorem/axiom]..." → reference with dependency
- "Therefore..." → derived conclusion
- "Since X, we have Y" → implication
- "Assume..." → temporary hypothesis

#### Task 2.3: Create GapAnalyzer Class (3 hours)
**File**: `src/proof/gap-analyzer.ts`

```typescript
/**
 * Analyzes proofs for gaps and unjustified leaps
 */
export class GapAnalyzer {
  /**
   * Find all gaps in a proof decomposition
   */
  analyzeGaps(decomposition: ProofDecomposition): GapAnalysis;

  /**
   * Check if step B validly follows from step A
   */
  isValidTransition(from: AtomicStatement, to: AtomicStatement): TransitionValidity;

  /**
   * Identify unjustified leaps
   */
  findUnjustifiedLeaps(decomposition: ProofDecomposition): UnjustifiedStep[];

  /**
   * Detect implicit assumptions
   */
  findImplicitAssumptions(decomposition: ProofDecomposition): ImplicitAssumption[];

  /**
   * Compute overall completeness score
   */
  computeCompleteness(decomposition: ProofDecomposition): number;
}

interface GapAnalysis {
  completeness: number;             // 0-1 score
  gaps: ProofGap[];
  implicitAssumptions: ImplicitAssumption[];
  unjustifiedSteps: UnjustifiedStep[];
  suggestions: string[];
}

interface UnjustifiedStep {
  stepId: string;
  claim: string;
  problem: 'no_justification' | 'invalid_rule' | 'missing_lemma' | 'hand_waving';
  requiredJustification: string;
  severity: 'minor' | 'significant' | 'critical';
}

interface TransitionValidity {
  valid: boolean;
  confidence: number;
  reason: string;
  missingPremises?: string[];
}
```

#### Task 2.4: Create AssumptionTracker Class (3 hours)
**File**: `src/proof/assumption-tracker.ts`

```typescript
/**
 * Tracks assumptions through proof chains
 */
export class AssumptionTracker {
  /**
   * Trace a conclusion back to its foundational assumptions
   */
  traceToAssumptions(
    conclusion: string,
    graph: DependencyGraph
  ): AssumptionChain;

  /**
   * Analyze all assumptions in a decomposition
   */
  analyzeAssumptions(decomposition: ProofDecomposition): AssumptionAnalysis;

  /**
   * Find the minimal set of assumptions needed for a conclusion
   */
  findMinimalAssumptions(
    conclusion: string,
    graph: DependencyGraph
  ): string[];

  /**
   * Check if any assumptions are unused
   */
  findUnusedAssumptions(decomposition: ProofDecomposition): string[];

  /**
   * Check if assumptions are discharged properly (for proof by cases, etc.)
   */
  checkAssumptionDischarge(decomposition: ProofDecomposition): DischargeReport;
}

interface AssumptionAnalysis {
  explicitAssumptions: AtomicStatement[];
  implicitAssumptions: ImplicitAssumption[];
  unusedAssumptions: string[];
  conclusionDependencies: Map<string, string[]>;  // conclusion → assumptions
  minimalSets: Map<string, string[]>;             // conclusion → minimal assumptions
}

interface DischargeReport {
  allDischarged: boolean;
  undischarged: string[];
  orphanedAssumptions: string[];
}
```

#### Task 2.5: Update MathematicsThought Interface (1 hour)
**File**: `src/types/modes/mathematics.ts`

Add optional decomposition fields to MathematicsThought:
```typescript
export interface MathematicsThought extends BaseThought {
  mode: ThinkingMode.MATHEMATICS;
  thoughtType: MathematicsThoughtType;

  // Existing fields...

  // NEW: Proof decomposition fields
  decomposition?: ProofDecomposition;
  dependencyGraph?: DependencyGraph;
  gapAnalysis?: GapAnalysis;
  assumptionAnalysis?: AssumptionAnalysis;
}
```

#### Task 2.6: Update ThoughtFactory for New Thought Types (1.5 hours)
**File**: `src/services/ThoughtFactory.ts`

Handle new mathematics thought types:
- `proof_decomposition`
- `dependency_analysis`
- `consistency_check`
- `gap_identification`
- `assumption_trace`

#### Task 2.7: Create Integration Tests (2 hours)
**File**: `tests/integration/proof/decomposition.test.ts`

Test complete decomposition workflows:
- Simple direct proof decomposition
- Proof by contradiction decomposition
- Induction proof decomposition
- Gap detection in incomplete proofs
- Assumption chain tracing

#### Task 2.8: Create Proof Decomposition Examples (1.5 hours)
**File**: `examples/proof-decomposition.ts`

Documented examples:
- Decomposing "√2 is irrational" proof
- Decomposing a simple number theory proof
- Analyzing an incomplete proof

**Sprint 2 Success Criteria**:
- ProofDecomposer correctly extracts statements from proof steps
- GapAnalyzer identifies missing steps with >80% accuracy on test cases
- AssumptionTracker correctly traces conclusions to assumptions
- ThoughtFactory handles all new thought types
- 30+ tests passing

**Files Created**:
- `src/proof/decomposer.ts`
- `src/proof/gap-analyzer.ts`
- `src/proof/assumption-tracker.ts`
- `tests/integration/proof/decomposition.test.ts`
- `examples/proof-decomposition.ts`

**Files Modified**:
- `src/types/modes/mathematics.ts`
- `src/services/ThoughtFactory.ts`
- `src/proof/index.ts`

---

### Sprint 3: Inconsistency Detection Engine (Week 3)
**Effort**: 16-20 hours | **Result**: Comprehensive inconsistency and circular reasoning detection

**Overview**: Build the analysis engines that detect logical inconsistencies, contradictions, and circular reasoning in mathematical proofs.

**Key Deliverables**:
1. `InconsistencyDetector` class for contradiction detection
2. `CircularReasoningDetector` class
3. `ConsistencyReport` generation
4. Quality assessment integration

**Tasks**:

#### Task 3.1: Create InconsistencyDetector Class (4 hours)
**File**: `src/proof/inconsistency-detector.ts`

```typescript
/**
 * Detects logical inconsistencies in mathematical proofs
 */
export class InconsistencyDetector {
  /**
   * Run all inconsistency checks on a decomposition
   */
  analyze(decomposition: ProofDecomposition): ConsistencyReport;

  /**
   * Detect direct contradictions (P and ¬P)
   */
  detectContradictions(statements: AtomicStatement[]): Contradiction[];

  /**
   * Detect type mismatches (applying operation to wrong type)
   */
  detectTypeMismatches(statements: AtomicStatement[]): TypeMismatch[];

  /**
   * Detect domain violations (using value outside defined domain)
   */
  detectDomainViolations(statements: AtomicStatement[]): DomainViolation[];

  /**
   * Detect undefined operations (e.g., division by zero)
   */
  detectUndefinedOperations(statements: AtomicStatement[]): UndefinedOperation[];

  /**
   * Detect axiom conflicts (axioms that cannot coexist)
   */
  detectAxiomConflicts(axioms: AtomicStatement[]): AxiomConflict[];

  /**
   * Detect quantifier scope errors
   */
  detectQuantifierErrors(statements: AtomicStatement[]): QuantifierError[];
}

/**
 * Types of inconsistencies
 */
export type InconsistencyType =
  | 'direct_contradiction'      // P and ¬P both derived
  | 'circular_reasoning'        // Conclusion used in own proof
  | 'type_mismatch'            // Applying operation to wrong type
  | 'domain_violation'         // Using value outside defined domain
  | 'undefined_operation'      // Division by zero, sqrt of negative
  | 'axiom_conflict'           // Axioms that cannot coexist
  | 'hidden_assumption'        // Unstated assumption required
  | 'quantifier_error'         // ∀/∃ scope or binding issues
  | 'equivalence_failure';     // Claimed equivalence that doesn't hold

export interface Inconsistency {
  id: string;
  type: InconsistencyType;
  involvedStatements: string[];
  explanation: string;
  derivationPath?: string[];
  severity: 'warning' | 'error' | 'critical';
  suggestedResolution?: string;
}

export interface ConsistencyReport {
  isConsistent: boolean;
  overallScore: number;           // 0-1, 1 = fully consistent
  inconsistencies: Inconsistency[];
  warnings: ConsistencyWarning[];
  circularReasoning: CircularPath[];
  summary: string;
}
```

#### Task 3.2: Implement Contradiction Detection Logic (3 hours)
**File**: `src/proof/inconsistency-detector.ts`

Detection strategies:
- Syntactic negation matching (P and ¬P)
- Semantic contradiction (e.g., "x > 0" and "x ≤ 0")
- Derived contradiction (following implications to contradiction)
- Type-based contradiction (e.g., "x ∈ ℕ" and "x = -1")

Pattern library for common mathematical contradictions.

#### Task 3.3: Create CircularReasoningDetector Class (3 hours)
**File**: `src/proof/circular-detector.ts`

```typescript
/**
 * Detects circular reasoning patterns in proofs
 */
export class CircularReasoningDetector {
  /**
   * Find all circular reasoning patterns
   */
  detectCircularReasoning(decomposition: ProofDecomposition): CircularReasoningReport;

  /**
   * Check if a conclusion is used in its own derivation
   */
  isSelfReferential(conclusionId: string, graph: DependencyGraph): boolean;

  /**
   * Find cycles in reasoning chain
   */
  findReasoningCycles(graph: DependencyGraph): CircularPath[];

  /**
   * Detect begging the question (petitio principii)
   */
  detectBeggingTheQuestion(decomposition: ProofDecomposition): BeggingTheQuestion[];

  /**
   * Detect tautological reasoning (proving P from P)
   */
  detectTautologies(decomposition: ProofDecomposition): TautologyIssue[];
}

export interface CircularReasoningReport {
  hasCircularReasoning: boolean;
  cycles: CircularPath[];
  beggingTheQuestion: BeggingTheQuestion[];
  tautologies: TautologyIssue[];
  suspiciousPaths: SuspiciousPath[];
}

export interface CircularPath {
  statements: string[];           // IDs forming the cycle
  cycleLength: number;
  explanation: string;
  visualPath: string;             // A → B → C → A
  severity: 'minor' | 'significant' | 'critical';
}

export interface BeggingTheQuestion {
  conclusion: string;
  assumedAs: string;              // Where the conclusion appears as assumption
  explanation: string;
}

export interface TautologyIssue {
  statement: string;
  reason: string;
  isProblematic: boolean;
}

export interface SuspiciousPath {
  type: 'near_tautology' | 'definition_as_proof' | 'assumption_reuse';
  path: string[];
  explanation: string;
  confidence: number;
}
```

#### Task 3.4: Create MathematicsReasoningEngine Class (3 hours)
**File**: `src/modes/mathematics-reasoning.ts`

```typescript
/**
 * Mathematics Reasoning Engine
 * Orchestrates proof decomposition and consistency analysis
 */
export class MathematicsReasoningEngine {
  private decomposer: ProofDecomposer;
  private gapAnalyzer: GapAnalyzer;
  private assumptionTracker: AssumptionTracker;
  private inconsistencyDetector: InconsistencyDetector;
  private circularDetector: CircularReasoningDetector;

  constructor();

  /**
   * Full analysis of a mathematical proof
   */
  analyzeProof(input: ProofAnalysisInput): ProofAnalysisResult;

  /**
   * Quick consistency check
   */
  checkConsistency(statements: AtomicStatement[]): ConsistencyReport;

  /**
   * Decompose and analyze a proof
   */
  decomposeAndAnalyze(proof: string | ProofStep[]): ProofDecomposition;

  /**
   * Trace a conclusion to its assumptions
   */
  traceConclusion(conclusion: string, proof: ProofDecomposition): AssumptionChain;

  /**
   * Generate improvement suggestions
   */
  suggestImprovements(decomposition: ProofDecomposition): ProofImprovement[];

  /**
   * Generate a human-readable analysis report
   */
  generateReport(analysis: ProofAnalysisResult): string;
}

export interface ProofAnalysisInput {
  proof: string | ProofStep[];
  theorem?: string;
  hypotheses?: string[];
  axiomSystem?: string;
  rigorLevel?: 'informal' | 'textbook' | 'rigorous' | 'formal';
}

export interface ProofAnalysisResult {
  decomposition: ProofDecomposition;
  consistencyReport: ConsistencyReport;
  gapAnalysis: GapAnalysis;
  assumptionAnalysis: AssumptionAnalysis;
  circularReasoningReport: CircularReasoningReport;
  overallQuality: number;
  suggestions: ProofImprovement[];
}

export interface ProofImprovement {
  type: 'fix_gap' | 'explicit_assumption' | 'add_justification' | 'restructure';
  target: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
}
```

#### Task 3.5: Integrate with MetaMonitor (1.5 hours)
**File**: `src/services/MetaMonitor.ts`

Add proof quality tracking to meta-monitoring:
- Track proof decomposition metrics over session
- Detect when proof quality drops
- Suggest mode switches when stuck on proofs

#### Task 3.6: Create ConsistencyWarning Patterns (1.5 hours)
**File**: `src/proof/patterns/warnings.ts`

Catalog of common mathematical fallacies and mistakes:
- Division by hidden zero
- Assuming what's to be proved
- Affirming the consequent
- Denying the antecedent
- Hasty generalization
- Ambiguous middle term

#### Task 3.7: Create Unit Tests for Inconsistency Detection (2 hours)
**File**: `tests/unit/proof/inconsistency-detector.test.ts`

Test cases:
- Direct contradiction detection (P and ¬P)
- Division by zero detection
- Circular reasoning detection
- Hidden assumption detection
- Quantifier scope errors

#### Task 3.8: Create Integration Tests (2 hours)
**File**: `tests/integration/proof/consistency.test.ts`

Test full consistency analysis workflows:
- Consistent proof passes checks
- Inconsistent proof flagged correctly
- Circular reasoning detected and reported
- Multiple issues in same proof

**Sprint 3 Success Criteria**:
- InconsistencyDetector finds contradictions with >90% accuracy
- CircularReasoningDetector identifies cycles correctly
- MathematicsReasoningEngine produces complete analysis
- Integration with MetaMonitor working
- 40+ tests passing

**Files Created**:
- `src/proof/inconsistency-detector.ts`
- `src/proof/circular-detector.ts`
- `src/modes/mathematics-reasoning.ts`
- `src/proof/patterns/warnings.ts`
- `tests/unit/proof/inconsistency-detector.test.ts`
- `tests/integration/proof/consistency.test.ts`

**Files Modified**:
- `src/services/MetaMonitor.ts`
- `src/proof/index.ts`

---

### Sprint 4: MCP Tools, Visual Exports & Release (Week 4)
**Effort**: 14-18 hours | **Result**: Production-ready v7.0.0 with full integration

**Overview**: Create MCP tools for proof analysis, visual exports for proof decomposition, documentation, and v7.0.0 release.

**Key Deliverables**:
1. Three new MCP tools for proof analysis
2. Visual export for proof decomposition (Mermaid, DOT, ASCII)
3. Zod validators for new types
4. Comprehensive documentation
5. v7.0.0 release

**Tasks**:

#### Task 4.1: Create MCP Tool: decompose_proof (2 hours)
**File**: `src/tools/proof-tools.ts`

```typescript
export const decomposeProofSchema = {
  name: "decompose_proof",
  description: "Decompose a mathematical proof into atomic components and analyze its structure",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: { type: "string", description: "Session ID" },
      proof: { type: "string", description: "The proof text or LaTeX" },
      theorem: { type: "string", description: "The theorem being proved" },
      hypotheses: { type: "array", items: { type: "string" } },
      analysisDepth: {
        type: "string",
        enum: ["shallow", "standard", "deep"],
        default: "standard"
      },
      includeVisualization: { type: "boolean", default: true }
    },
    required: ["sessionId", "proof"]
  }
};
```

#### Task 4.2: Create MCP Tool: check_consistency (2 hours)
**File**: `src/tools/proof-tools.ts`

```typescript
export const checkConsistencySchema = {
  name: "check_consistency",
  description: "Check a set of mathematical statements for logical consistency and contradictions",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: { type: "string" },
      statements: { type: "array", items: { type: "string" } },
      checkTypes: {
        type: "array",
        items: {
          type: "string",
          enum: ["contradiction", "circular", "gaps", "assumptions", "all"]
        },
        default: ["all"]
      },
      generateReport: { type: "boolean", default: true }
    },
    required: ["sessionId", "statements"]
  }
};
```

#### Task 4.3: Create MCP Tool: trace_assumptions (1.5 hours)
**File**: `src/tools/proof-tools.ts`

```typescript
export const traceAssumptionsSchema = {
  name: "trace_assumptions",
  description: "Trace a mathematical conclusion back to its foundational assumptions",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: { type: "string" },
      conclusion: { type: "string" },
      showFullChain: { type: "boolean", default: true },
      findMinimal: { type: "boolean", default: false }
    },
    required: ["sessionId", "conclusion"]
  }
};
```

#### Task 4.4: Register Tools in index.ts (1.5 hours)
**File**: `src/index.ts`

Add handlers for new proof analysis tools:
- `decompose_proof` handler
- `check_consistency` handler
- `trace_assumptions` handler

#### Task 4.5: Create Visual Export for Proof Decomposition (3 hours)
**File**: `src/export/visual/proof-decomposition.ts`

```typescript
/**
 * Visual export for proof decomposition
 */
export function exportProofDecomposition(
  decomposition: ProofDecomposition,
  options: VisualExportOptions
): string {
  switch (options.format) {
    case 'mermaid':
      return proofToMermaid(decomposition, options);
    case 'dot':
      return proofToDOT(decomposition, options);
    case 'ascii':
      return proofToASCII(decomposition);
  }
}

// Mermaid: Dependency graph with statement types as node styles
// DOT: Full graph with assumption chains highlighted
// ASCII: Tree view of proof structure
```

Visual elements:
- Axioms: Rounded rectangles (green)
- Hypotheses: Rectangles (blue)
- Derived statements: Regular nodes (gray)
- Conclusions: Diamonds (purple)
- Gaps: Dashed edges (red)
- Circular paths: Red highlighted cycles

#### Task 4.6: Create Zod Validators for Proof Types (2 hours)
**File**: `src/validation/validators/modes/mathematics-extended.ts`

Validators for:
- `AtomicStatement`
- `DependencyGraph`
- `ProofDecomposition`
- `ConsistencyReport`
- `ProofAnalysisInput`

#### Task 4.7: Update Documentation (2 hours)

**Files**:
- `docs/modes/MATHEMATICS.md` - Update with decomposition features
- `docs/tools/PROOF_ANALYSIS.md` - New tools documentation
- `README.md` - Update feature list
- `CHANGELOG.md` - Add v7.0.0 entry

#### Task 4.8: Integration Tests for MCP Tools (1.5 hours)
**File**: `tests/integration/tools/proof-tools.test.ts`

Test complete tool workflows:
- decompose_proof with valid input
- check_consistency finding issues
- trace_assumptions producing chains

#### Task 4.9: Release Preparation (1.5 hours)

- Run full test suite
- Run typecheck
- Build dist/
- Update package.json to v7.0.0
- Create release notes

**Sprint 4 Success Criteria**:
- All 3 MCP tools working correctly
- Visual exports generating valid Mermaid/DOT/ASCII
- Zod validators passing all test cases
- Documentation complete and accurate
- v7.0.0 ready for npm publish
- 50+ new tests passing

**Files Created**:
- `src/tools/proof-tools.ts`
- `src/export/visual/proof-decomposition.ts`
- `src/validation/validators/modes/mathematics-extended.ts`
- `docs/tools/PROOF_ANALYSIS.md`
- `tests/integration/tools/proof-tools.test.ts`

**Files Modified**:
- `src/index.ts`
- `src/services/ExportService.ts`
- `src/export/visual/index.ts`
- `docs/modes/MATHEMATICS.md`
- `README.md`
- `CHANGELOG.md`
- `package.json`

---

## Timeline Summary

| Sprint | Week | Effort | Key Deliverable | Tests Added |
|--------|------|--------|----------------|-------------|
| 1 | 1 | 14-18h | Type system + DependencyGraphBuilder | 12 test files |
| 2 | 2 | 16-20h | ProofDecomposer + GapAnalyzer | 10 test files |
| 3 | 3 | 16-20h | InconsistencyDetector + MathematicsReasoningEngine | 12 test files |
| 4 | 4 | 14-18h | MCP Tools + Visual Exports + v7.0.0 | 8 test files |
| **Total** | **4 weeks** | **60-76h** | **v7.0.0 production** | **42 test files** |

---

## Technical Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Tools Layer                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ decompose_proof │ │check_consistency│ │trace_assumptions│    │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘    │
└───────────┼────────────────────┼────────────────────┼────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              MathematicsReasoningEngine                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   analyzeProof()                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ ProofDecomposer │ │InconsistencyDet │ │ CircularDetect  │
│                 │ │     ector       │ │      or         │
│ extractStatements│ │detectContradictns│ │findReasoningCycles│
│ inferDependencies│ │detectTypeErrors │ │detectTautologies│
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  GapAnalyzer    │ │AssumptionTracker│ │DependencyGraph  │
│                 │ │                 │ │    Builder      │
│ findGaps()      │ │ traceToAxioms() │ │ detectCycles()  │
│ findImplicit()  │ │ findMinimal()   │ │ topologicalSort │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Data Flow

```
Input: Proof Text / ProofStep[]
          │
          ▼
    ┌───────────────┐
    │ ProofDecomposer│
    │               │
    │ Extract atoms │
    │ Build deps    │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │DependencyGraph│◄──────┐
    │               │       │
    │ Nodes + Edges │       │
    │ Cycles check  │       │
    └───────┬───────┘       │
            │               │
    ┌───────┴───────┐       │
    ▼               ▼       │
┌─────────┐   ┌─────────┐   │
│GapAnalyz│   │Inconsist│   │
│   er    │   │Detector │   │
└────┬────┘   └────┬────┘   │
     │             │        │
     └──────┬──────┘        │
            ▼               │
    ┌───────────────┐       │
    │ AssumptionTrk │───────┘
    │               │
    │ Trace chains  │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ProofAnalysis  │
    │    Result     │
    │               │
    │ • Decomposition│
    │ • Consistency │
    │ • Gaps        │
    │ • Assumptions │
    │ • Suggestions │
    └───────────────┘
```

---

## Example Output

### Input

```
Theorem: √2 is irrational

Proof:
1. Assume √2 is rational
2. Then √2 = p/q for coprime integers p, q
3. Squaring: 2 = p²/q²
4. Therefore: 2q² = p²
5. So p² is even, thus p is even
6. Let p = 2k for some integer k
7. Then 2q² = 4k², so q² = 2k²
8. So q² is even, thus q is even
9. But p and q both even contradicts coprimality
10. Therefore √2 is irrational
```

### Output: Proof Decomposition Report

```markdown
# Proof Decomposition Report

## Theorem
√2 is irrational

## Structure Analysis
- **Proof Type**: Proof by contradiction
- **Atoms**: 10 statements
- **Dependency Depth**: 5
- **Completeness**: 0.95

## Dependency Graph
```
[1:HYP] √2 is rational
    ↓
[2:DEF] √2 = p/q, gcd(p,q)=1
    ↓
[3:ALG] 2 = p²/q²
    ↓
[4:ALG] 2q² = p²
    ├───────────────┐
    ↓               ↓
[5:DER] p² even  [7:ALG] q² = 2k²
    ↓               ↓
[6:DER] p even   [8:DER] q even
    └───────┬───────┘
            ↓
[9:CONTR] Contradicts gcd(p,q)=1
            ↓
[10:CONCL] √2 is irrational
```

## Consistency Report
✅ **Consistent**: No contradictions in reasoning (contradiction is intentional)
✅ **No circular reasoning detected**
✅ **All steps justified**

## Gap Analysis
⚠️ **Minor gap at Step 5→6**:
   - Claim: "p² is even, thus p is even"
   - Missing: Explicit lemma that square of odd is odd
   - Severity: Minor (commonly assumed in textbook proofs)

## Assumption Chain
**Conclusion**: √2 is irrational
**Traces to**:
1. [HYP] √2 is rational (discharged by contradiction)
2. [IMPLICIT] Definition of rationality
3. [IMPLICIT] Properties of even/odd integers
4. [AXIOM] Well-ordering of integers (for coprimality)

## Suggestions
1. Add lemma: "If n² is even, then n is even" before Step 5
2. Explicitly state the definition of coprime
```

---

## Breaking Changes (v7.0.0)

**Minor Breaking Changes**:

### MathematicsThought Interface Extended
New optional fields added. Existing code using `MathematicsThought` will continue to work.

```typescript
// Before (v6.x)
interface MathematicsThought {
  mode: ThinkingMode.MATHEMATICS;
  thoughtType: MathematicsThoughtType;
  // ... existing fields
}

// After (v7.0)
interface MathematicsThought {
  mode: ThinkingMode.MATHEMATICS;
  thoughtType: MathematicsThoughtType;  // Extended with 5 new types
  // ... existing fields
  decomposition?: ProofDecomposition;   // NEW (optional)
  consistencyReport?: ConsistencyReport; // NEW (optional)
}
```

### Migration Guide
1. No action required for existing code
2. New thought types available: `proof_decomposition`, `dependency_analysis`, `consistency_check`, `gap_identification`, `assumption_trace`
3. New MCP tools available: `decompose_proof`, `check_consistency`, `trace_assumptions`

---

## Success Metrics

### Quantitative
- All 800+ existing tests still passing
- 150+ new tests for proof analysis features
- Proof decomposition completes in < 2 seconds for 20-step proofs
- Inconsistency detection > 90% accuracy on test suite
- Circular reasoning detection 100% accurate (no false negatives)

### Qualitative
- Proof decompositions are human-readable and useful
- Consistency reports clearly explain issues found
- Visual exports provide meaningful proof visualizations
- Documentation is clear and comprehensive
- API is intuitive and matches existing patterns

---

## Risk Mitigation

### High Risk: Statement Extraction Accuracy
**Impact**: Poor extraction leads to incorrect analysis
**Mitigation**:
- Start with structured `ProofStep[]` input (reliable)
- Add patterns incrementally for natural language proofs
- Provide confidence scores for extracted statements
- Allow user correction of extracted statements

### Medium Risk: False Positive Inconsistencies
**Impact**: User loses trust in analysis
**Mitigation**:
- Conservative detection (prefer false negatives)
- Clear explanations for each finding
- Confidence scores on all detections
- Manual review option

### Medium Risk: Performance on Large Proofs
**Impact**: Slow analysis frustrates users
**Mitigation**:
- Lazy evaluation of expensive analyses
- Configurable analysis depth
- Caching of intermediate results
- Performance benchmarks in CI

### Low Risk: Type System Complexity
**Impact**: Hard to maintain and extend
**Mitigation**:
- Clear interface boundaries
- Comprehensive JSDoc documentation
- Example code for each type
- Unit tests as living documentation

---

## Future Enhancements (Post-v7.0)

### v7.1: Enhanced Pattern Library
- Common proof patterns (induction, cases, etc.)
- Proof template suggestions
- Pattern-based gap detection

### v7.2: LaTeX Integration
- Direct LaTeX proof parsing
- LaTeX output with proof annotations
- BibTeX reference integration

### v7.3: Proof Comparison
- Compare two proofs of same theorem
- Identify structural differences
- Suggest proof simplifications

### v8.0: External Prover Integration
- Optional Z3/SMT solver integration
- Automated consistency checking
- Proof obligation generation

---

## Critical Files Reference

### Sprint 1 Must-Read
1. `src/types/modes/mathematics.ts` - Current type definitions
2. `src/types/modes/formallogic.ts` - Existing proof/inference types
3. `src/services/ThoughtFactory.ts` - Thought creation patterns

### Sprint 2 Must-Read
4. `src/modes/meta-reasoning.ts` - Engine pattern reference
5. `src/modes/recursive-reasoning.ts` - Complex mode implementation

### Sprint 3 Must-Read
6. `src/services/MetaMonitor.ts` - Quality monitoring patterns
7. `src/taxonomy/reasoning-types.ts` - Reasoning type catalog

### Sprint 4 Must-Read
8. `src/index.ts` - MCP tool registration
9. `src/export/visual/causal.ts` - Visual export template
10. `src/validation/validators/modes/` - Zod validator patterns

---

## References

- Phase 6 Implementation (Meta-reasoning) - Engine pattern reference
- Phase 7 Implementation (Visual Exports) - Export integration reference
- Formal Logic Mode types - Proof structure inspiration
- Tarjan's Algorithm - Cycle detection reference
- Mathematical proof theory - Domain knowledge

---

## Appendix A: Inference Rules Reference

| Rule | Pattern | Description |
|------|---------|-------------|
| `modus_ponens` | P, P→Q ⊢ Q | If P and P implies Q, then Q |
| `modus_tollens` | ¬Q, P→Q ⊢ ¬P | If not Q and P implies Q, then not P |
| `hypothetical_syllogism` | P→Q, Q→R ⊢ P→R | Chain implications |
| `disjunctive_syllogism` | P∨Q, ¬P ⊢ Q | Eliminate disjunction |
| `universal_instantiation` | ∀x.P(x) ⊢ P(a) | Instantiate universal |
| `existential_generalization` | P(a) ⊢ ∃x.P(x) | Generalize to existential |
| `mathematical_induction` | P(0), P(n)→P(n+1) ⊢ ∀n.P(n) | Induction principle |
| `contradiction` | P, ¬P ⊢ ⊥ | Derive falsum |
| `direct_implication` | Γ ⊢ Q from Γ ⊢ P, P→Q | Apply implication |
| `substitution` | P(a), a=b ⊢ P(b) | Substitute equals |

---

## Appendix B: Inconsistency Patterns

### Direct Contradiction
```
Statement A: x > 0
Statement B: x ≤ 0
→ CONTRADICTION: A and B cannot both be true
```

### Circular Reasoning
```
Step 1: Assume P
Step 2: Therefore Q (using P)
Step 3: Therefore P (using Q)
→ CIRCULAR: P used to prove itself
```

### Hidden Division by Zero
```
Step 1: a = b
Step 2: a² = ab
Step 3: a² - b² = ab - b²
Step 4: (a-b)(a+b) = b(a-b)
Step 5: a + b = b  ← Division by (a-b) = 0!
Step 6: 2b = b
Step 7: 2 = 1
→ UNDEFINED_OPERATION: Division by zero at step 5
```

### Quantifier Scope Error
```
Statement: ∀x ∃y. P(x,y)  (for all x, there exists y)
Misuse: Using specific y across multiple x values
→ QUANTIFIER_ERROR: y depends on x, cannot be reused
```
