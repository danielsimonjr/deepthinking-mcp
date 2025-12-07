/**
 * Mathematics Reasoning Mode - Type Definitions
 * Formal mathematical reasoning with proofs, theorems, and symbolic computation
 *
 * Phase 8 (v7.0.0) - Extended with proof decomposition and inconsistency detection
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Mathematical thought types
 *
 * Original types: axiom_definition through numerical_analysis
 * Phase 8 additions: proof_decomposition through assumption_trace
 */
export type MathematicsThoughtType =
  // Original thought types
  | 'axiom_definition'
  | 'theorem_statement'
  | 'proof_construction'
  | 'lemma_derivation'
  | 'corollary'
  | 'counterexample'
  | 'algebraic_manipulation'
  | 'symbolic_computation'
  | 'numerical_analysis'
  // Phase 8: Proof Decomposition Types
  | 'proof_decomposition' // Breaking proof into atomic components
  | 'dependency_analysis' // Analyzing statement dependencies
  | 'consistency_check' // Checking for contradictions
  | 'gap_identification' // Finding missing steps
  | 'assumption_trace'; // Tracing back to axioms

/**
 * Inference rules for mathematical reasoning
 */
export type InferenceRule =
  | 'modus_ponens' // P, P→Q ⊢ Q
  | 'modus_tollens' // ¬Q, P→Q ⊢ ¬P
  | 'hypothetical_syllogism' // P→Q, Q→R ⊢ P→R
  | 'disjunctive_syllogism' // P∨Q, ¬P ⊢ Q
  | 'universal_instantiation' // ∀x.P(x) ⊢ P(a)
  | 'existential_generalization' // P(a) ⊢ ∃x.P(x)
  | 'mathematical_induction' // P(0), P(n)→P(n+1) ⊢ ∀n.P(n)
  | 'contradiction' // P, ¬P ⊢ ⊥
  | 'direct_implication' // Γ ⊢ Q from Γ ⊢ P, P→Q
  | 'substitution' // P(a), a=b ⊢ P(b)
  | 'algebraic_manipulation' // Algebraic transformation
  | 'definition_expansion'; // Expanding a definition

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
  derivedFrom?: string[]; // IDs of statements this depends on
  usedInferenceRule?: InferenceRule;

  // Metadata
  confidence: number; // 0-1, how certain is this statement
  isExplicit: boolean; // Was this explicitly stated or inferred?
  sourceLocation?: {
    stepNumber?: number;
    section?: string;
  };
}

/**
 * Directed edge in dependency graph
 */
export interface DependencyEdge {
  from: string; // Source statement ID
  to: string; // Target statement ID (depends on source)
  type: 'logical' | 'definitional' | 'computational' | 'implicit';
  strength: number; // 0-1, how strong is the dependency
  inferenceRule?: InferenceRule;
}

/**
 * Dependency graph for proof analysis
 */
export interface DependencyGraph {
  nodes: Map<string, AtomicStatement>;
  edges: DependencyEdge[];

  // Computed properties
  roots: string[]; // Axioms/hypotheses (no incoming edges)
  leaves: string[]; // Final conclusions (no outgoing edges)

  // Graph metrics
  depth: number; // Longest path from root to leaf
  width: number; // Maximum nodes at any level
  hasCycles: boolean; // Indicates circular reasoning

  // Analysis
  stronglyConnectedComponents?: string[][]; // For cycle detection
  topologicalOrder?: string[]; // Valid if acyclic
}

/**
 * Identified gap in a proof
 */
export interface ProofGap {
  id: string;
  type:
    | 'missing_step'
    | 'unjustified_leap'
    | 'implicit_assumption'
    | 'undefined_term'
    | 'scope_error';
  location: {
    from: string; // Statement ID before gap
    to: string; // Statement ID after gap
  };
  description: string;
  severity: 'minor' | 'significant' | 'critical';
  suggestedFix?: string;
}

/**
 * Implicit assumption detected in reasoning
 */
export interface ImplicitAssumption {
  id: string;
  statement: string;
  type:
    | 'domain_assumption'
    | 'existence_assumption'
    | 'uniqueness_assumption'
    | 'continuity_assumption'
    | 'finiteness_assumption'
    | 'well_ordering';
  usedInStep: string; // Where this assumption is needed
  shouldBeExplicit: boolean;
  suggestedFormulation: string;
}

/**
 * Chain of assumptions leading to a conclusion
 */
export interface AssumptionChain {
  conclusion: string; // Statement ID
  assumptions: string[]; // Ordered list of assumption IDs
  path: string[]; // Full derivation path
  allAssumptionsExplicit: boolean;
  implicitAssumptions: ImplicitAssumption[];
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
  completeness: number; // 0-1
  rigorLevel: 'informal' | 'textbook' | 'rigorous' | 'formal';
  atomCount: number;
  maxDependencyDepth: number;
}

/**
 * Types of inconsistencies
 */
export type InconsistencyType =
  | 'direct_contradiction' // P and ¬P both derived
  | 'circular_reasoning' // Conclusion used in own proof
  | 'type_mismatch' // Applying operation to wrong type
  | 'domain_violation' // Using value outside defined domain
  | 'undefined_operation' // Division by zero, sqrt of negative
  | 'axiom_conflict' // Axioms that cannot coexist
  | 'hidden_assumption' // Unstated assumption required
  | 'quantifier_error' // ∀/∃ scope or binding issues
  | 'equivalence_failure'; // Claimed equivalence that doesn't hold

/**
 * Detected inconsistency in reasoning
 */
export interface Inconsistency {
  id: string;
  type: InconsistencyType;
  involvedStatements: string[];
  explanation: string;
  derivationPath?: string[];
  severity: 'warning' | 'error' | 'critical';
  suggestedResolution?: string;
}

/**
 * Circular reasoning path
 */
export interface CircularPath {
  statements: string[]; // IDs forming the cycle
  cycleLength: number;
  explanation: string;
  visualPath: string; // A → B → C → A
  severity: 'minor' | 'significant' | 'critical';
}

/**
 * Consistency report for a proof
 */
export interface ConsistencyReport {
  isConsistent: boolean;
  overallScore: number; // 0-1, 1 = fully consistent
  inconsistencies: Inconsistency[];
  warnings: string[];
  circularReasoning: CircularPath[];
  summary: string;
}

/**
 * Gap analysis result
 */
export interface GapAnalysis {
  completeness: number; // 0-1 score
  gaps: ProofGap[];
  implicitAssumptions: ImplicitAssumption[];
  unjustifiedSteps: string[];
  suggestions: string[];
}

/**
 * Assumption analysis result
 */
export interface AssumptionAnalysis {
  explicitAssumptions: AtomicStatement[];
  implicitAssumptions: ImplicitAssumption[];
  unusedAssumptions: string[];
  conclusionDependencies: Map<string, string[]>; // conclusion → assumptions
  minimalSets: Map<string, string[]>; // conclusion → minimal assumptions
}

/**
 * Mathematical model representation
 */
export interface MathematicalModel {
  latex: string;
  symbolic: string;
  ascii?: string;
  tensorRank?: number;
  dimensions?: number[];
  invariants?: string[];
  symmetries?: string[];
  complexity?: string;
  stabilityNotes?: string;
  validated?: boolean;
  validationMethod?: string;
}

/**
 * Proof strategy for mathematical reasoning
 */
export interface ProofStrategy {
  type: 'direct' | 'contradiction' | 'induction' | 'construction' | 'contrapositive';
  steps: string[];
  baseCase?: string;
  inductiveStep?: string;
  completeness: number; // 0-1
}

/**
 * Theorem definition
 */
export interface Theorem {
  name: string;
  statement: string;
  hypotheses: string[];
  conclusion: string;
  proof?: string;
  references?: Reference[];
}

/**
 * Reference to external sources
 */
export interface Reference {
  type: 'paper' | 'book' | 'arxiv' | 'url' | 'theorem';
  citation: string;
  relevance: string;
  url?: string;
}

/**
 * Logical form representation
 */
export interface LogicalForm {
  premises: string[];
  conclusion: string;
  inferenceRule: string;
  rules: string[];
}

export interface MathematicsThought extends BaseThought {
  mode: ThinkingMode.MATHEMATICS;
  thoughtType: MathematicsThoughtType;
  mathematicalModel?: MathematicalModel;
  proofStrategy?: ProofStrategy;
  theorems?: Theorem[];
  dependencies: string[];
  assumptions: string[];
  uncertainty: number; // 0-1
  logicalForm?: LogicalForm;
  references?: Reference[];

  // Phase 8: Proof Decomposition Fields (populated by MathematicsReasoningEngine)
  decomposition?: ProofDecomposition;
  consistencyReport?: ConsistencyReport;
  gapAnalysis?: GapAnalysis;
  assumptionAnalysis?: AssumptionAnalysis;
}

export function isMathematicsThought(thought: BaseThought): thought is MathematicsThought {
  return thought.mode === 'mathematics';
}
