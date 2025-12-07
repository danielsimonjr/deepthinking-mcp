/**
 * Core type definitions for the DeepThinking MCP server v7.1.0
 * Supports 19 thinking modes: Sequential, Shannon, Mathematics, Physics, Hybrid, Engineering,
 * Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, GameTheory, Evidential, FirstPrinciples,
 * SystemsThinking, ScientificMethod, Optimization, FormalLogic
 */

// Import Phase 3 mode types
import type { TemporalThought } from './modes/temporal.js';
import type { GameTheoryThought } from './modes/gametheory.js';
import type { EvidentialThought } from './modes/evidential.js';
import type { FirstPrinciplesThought } from './modes/firstprinciples.js';

// Import Phase 4 mode types (v3.2.0)
import type { SystemsThinkingThought } from './modes/systemsthinking.js';
import type { ScientificMethodThought } from './modes/scientificmethod.js';
import type { OptimizationThought } from './modes/optimization.js';
import type { FormalLogicThought } from './modes/formallogic.js';

// Import Phase 6 mode types (v6.0.0)
import type { MetaReasoningThought } from './modes/metareasoning.js';

// Import Phase 10 mode types (v7.1.0)
import type { EngineeringThought } from './modes/engineering.js';

/**
 * Available thinking modes
 */
export enum ThinkingMode {
  // ===== Fully Implemented Modes =====
  SEQUENTIAL = 'sequential',
  SHANNON = 'shannon',
  MATHEMATICS = 'mathematics',
  PHYSICS = 'physics',
  HYBRID = 'hybrid',
  ENGINEERING = 'engineering', // Phase 10 (v7.1.0) - Engineering analysis

  // ===== Implemented - Advanced Modes (Phase 4) =====
  METAREASONING = 'metareasoning', // Phase 4 (v3.3.0) - Self-reflection and strategy selection
  RECURSIVE = 'recursive', // Phase 4 (v3.3.0) - Recursive problem decomposition
  MODAL = 'modal', // Phase 4 (v3.3.0) - Possibility and necessity reasoning
  STOCHASTIC = 'stochastic', // Phase 4 (v3.3.0) - Probabilistic state transitions
  CONSTRAINT = 'constraint', // Phase 4 (v3.3.0) - Constraint satisfaction
  OPTIMIZATION = 'optimization', // Phase 4 (v3.2.0) - Optimization strategies

  // ===== Experimental - Limited Implementation =====
  // These modes have validators and type definitions but limited runtime logic
  INDUCTIVE = 'inductive', // ⚠️ Experimental (Phase 5 v5.0.0) - Inductive reasoning
  DEDUCTIVE = 'deductive', // ⚠️ Experimental (Phase 5 v5.0.0) - Deductive reasoning
  ABDUCTIVE = 'abductive', // ⚠️ Experimental - Inference to best explanation
  CAUSAL = 'causal', // ⚠️ Experimental - Causal reasoning
  BAYESIAN = 'bayesian', // ⚠️ Experimental - Bayesian inference
  COUNTERFACTUAL = 'counterfactual', // ⚠️ Experimental - What-if scenarios
  ANALOGICAL = 'analogical', // ⚠️ Experimental - Reasoning by analogy
  TEMPORAL = 'temporal', // ⚠️ Experimental (Phase 3 v2.1) - Temporal logic
  GAMETHEORY = 'gametheory', // ⚠️ Experimental (Phase 3 v2.2) - Game theory analysis
  EVIDENTIAL = 'evidential', // ⚠️ Experimental (Phase 3 v2.3) - Evidence-based reasoning
  FIRSTPRINCIPLES = 'firstprinciples', // ⚠️ Experimental (Phase 3 v3.1.0) - First principles thinking
  SYSTEMSTHINKING = 'systemsthinking', // ⚠️ Experimental (Phase 4 v3.2.0) - Systems thinking
  SCIENTIFICMETHOD = 'scientificmethod', // ⚠️ Experimental (Phase 4 v3.2.0) - Scientific method
  FORMALLOGIC = 'formallogic', // ⚠️ Experimental (Phase 4 v3.2.0) - Formal logic

  CUSTOM = 'custom'
}

/**
 * Modes with full implementation including specialized thought creation logic
 */
export const FULLY_IMPLEMENTED_MODES: ReadonlyArray<ThinkingMode> = [
  ThinkingMode.SEQUENTIAL,
  ThinkingMode.SHANNON,
  ThinkingMode.MATHEMATICS,
  ThinkingMode.PHYSICS,
  ThinkingMode.HYBRID,
  ThinkingMode.ENGINEERING, // Phase 10 v7.1.0
  ThinkingMode.METAREASONING,
  ThinkingMode.RECURSIVE,
  ThinkingMode.MODAL,
  ThinkingMode.STOCHASTIC,
  ThinkingMode.CONSTRAINT,
  ThinkingMode.OPTIMIZATION,
  ThinkingMode.INDUCTIVE, // Phase 5 v5.0.0
  ThinkingMode.DEDUCTIVE, // Phase 5 v5.0.0
];

/**
 * Experimental modes - have validators but limited runtime implementation
 * These modes will create base thoughts without specialized logic
 */
export const EXPERIMENTAL_MODES: ReadonlyArray<ThinkingMode> = [
  ThinkingMode.ABDUCTIVE,
  ThinkingMode.CAUSAL,
  ThinkingMode.BAYESIAN,
  ThinkingMode.COUNTERFACTUAL,
  ThinkingMode.ANALOGICAL,
  ThinkingMode.TEMPORAL,
  ThinkingMode.GAMETHEORY,
  ThinkingMode.EVIDENTIAL,
  ThinkingMode.FIRSTPRINCIPLES,
  ThinkingMode.SYSTEMSTHINKING,
  ThinkingMode.SCIENTIFICMETHOD,
  ThinkingMode.FORMALLOGIC,
];

/**
 * Check if a mode is fully implemented
 */
export function isFullyImplemented(mode: ThinkingMode): boolean {
  return FULLY_IMPLEMENTED_MODES.includes(mode);
}

/**
 * Shannon methodology stages
 */
export enum ShannonStage {
  PROBLEM_DEFINITION = 'problem_definition',
  CONSTRAINTS = 'constraints',
  MODEL = 'model',
  PROOF = 'proof',
  IMPLEMENTATION = 'implementation'
}

/**
 * Base thought interface
 */
export interface BaseThought {
  id: string;
  sessionId: string;
  thoughtNumber: number;
  totalThoughts: number;
  content: string;
  timestamp: Date;
  mode: ThinkingMode;
  nextThoughtNeeded: boolean;
  isRevision?: boolean;
  revisesThought?: string;
  tags?: string[];
  importance?: number;
}

/**
 * Extended thought types for mathematical and physics reasoning
 */
export type ExtendedThoughtType =
  | 'problem_definition' | 'constraints' | 'model' | 'proof' | 'implementation'
  | 'axiom_definition' | 'theorem_statement' | 'proof_construction'
  | 'lemma_derivation' | 'corollary' | 'counterexample'
  | 'algebraic_manipulation' | 'symbolic_computation' | 'numerical_analysis'
  | 'symmetry_analysis' | 'gauge_theory' | 'field_equations'
  | 'lagrangian' | 'hamiltonian' | 'conservation_law'
  | 'dimensional_analysis' | 'tensor_formulation' | 'differential_geometry'
  | 'decomposition' | 'synthesis' | 'abstraction' | 'analogy' | 'metacognition'
  // Phase 8: Proof Decomposition Types
  | 'proof_decomposition' | 'dependency_analysis' | 'consistency_check'
  | 'gap_identification' | 'assumption_trace';

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
 * Tensor properties for physics modeling
 */
export interface TensorProperties {
  rank: [number, number];
  components: string;
  latex: string;
  symmetries: string[];
  invariants: string[];
  transformation: 'covariant' | 'contravariant' | 'mixed';
  indexStructure?: string;
  coordinateSystem?: string;
}

/**
 * Physical interpretation
 */
export interface PhysicalInterpretation {
  quantity: string;
  units: string;
  conservationLaws: string[];
  constraints?: string[];
  observables?: string[];
}

/**
 * Proof strategy for mathematical reasoning
 */
export interface ProofStrategy {
  type: 'direct' | 'contradiction' | 'induction' | 'construction' | 'contrapositive';
  steps: string[];
  baseCase?: string;
  inductiveStep?: string;
  completeness: number;
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

// ========== EXISTING MODES ==========

/**
 * Sequential-mode thought
 */
export interface SequentialThought extends BaseThought {
  mode: ThinkingMode.SEQUENTIAL;
  revisionReason?: string;
  buildUpon?: string[];
  branchFrom?: string;
  branchId?: string;
  needsMoreThoughts?: boolean;
}

/**
 * Shannon-mode thought
 */
export interface ShannonThought extends BaseThought {
  mode: ThinkingMode.SHANNON;
  stage: ShannonStage;
  uncertainty: number;
  dependencies: string[];
  assumptions: string[];
  recheckStep?: {
    stepToRecheck: string;
    reason: string;
    newInformation?: string;
  };
  confidenceFactors?: {
    dataQuality: number;
    methodologyRobustness: number;
    assumptionValidity: number;
  };
  alternativeApproaches?: string[];
  knownLimitations?: string[];
}

/**
 * Mathematical thought
 */
export interface MathematicsThought extends BaseThought {
  mode: ThinkingMode.MATHEMATICS;
  thoughtType: ExtendedThoughtType;
  mathematicalModel?: MathematicalModel;
  proofStrategy?: ProofStrategy;
  theorems?: Theorem[];
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  logicalForm?: {
    premises: string[];
    conclusion: string;
    rules: string[];
  };
  references?: Reference[];
}

/**
 * Physics thought
 */
export interface PhysicsThought extends BaseThought {
  mode: ThinkingMode.PHYSICS;
  thoughtType: ExtendedThoughtType;
  tensorProperties?: TensorProperties;
  physicalInterpretation?: PhysicalInterpretation;
  conservationLaws?: string[];
  dimensionalAnalysis?: {
    isConsistent: boolean;
    dimensions: Record<string, string>;
    issues?: string[];
  };
  mathematicalModel?: MathematicalModel;
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  fieldTheoryContext?: {
    fields: string[];
    interactions: string[];
    symmetryGroup: string;
    gaugeSymmetries?: string[];
  };
}

/**
 * Hybrid-mode thought
 */
export interface HybridThought extends BaseThought {
  mode: ThinkingMode.HYBRID;
  thoughtType?: ExtendedThoughtType;
  stage?: ShannonStage;
  uncertainty?: number;
  dependencies?: string[];
  assumptions?: string[];
  revisionReason?: string;
  mathematicalModel?: MathematicalModel;
  tensorProperties?: TensorProperties;
  physicalInterpretation?: PhysicalInterpretation;
  primaryMode: 'sequential' | 'shannon' | 'mathematics' | 'physics';
  secondaryFeatures: string[];
  switchReason?: string;
}

// ========== NEW MODES (v2.0) ==========

// ===== ABDUCTIVE REASONING =====

/**
 * Observation requiring explanation
 */
export interface Observation {
  id: string;
  description: string;
  timestamp?: string;
  confidence: number; // 0-1
}

/**
 * Hypothesis explaining observations
 */
export interface Hypothesis {
  id: string;
  explanation: string;
  assumptions: string[];
  predictions: string[];
  score: number; // Overall ranking score
}

/**
 * Evidence supporting or refuting hypotheses
 */
export interface Evidence {
  hypothesisId: string;
  type: 'supporting' | 'contradicting' | 'neutral';
  description: string;
  strength: number; // 0-1
}

/**
 * Criteria for evaluating hypotheses
 */
export interface EvaluationCriteria {
  parsimony: number;      // Simplicity score (0-1)
  explanatoryPower: number; // How well it explains observations (0-1)
  plausibility: number;   // Prior probability (0-1)
  testability: boolean;   // Can it be tested?
}

/**
 * Abductive reasoning thought
 */
export interface AbductiveThought extends BaseThought {
  mode: ThinkingMode.ABDUCTIVE;
  observations: Observation[];
  hypotheses: Hypothesis[];
  currentHypothesis?: Hypothesis;
  evaluationCriteria: EvaluationCriteria;
  evidence: Evidence[];
  bestExplanation?: Hypothesis;
}

// ===== INDUCTIVE REASONING =====

/**
 * Inductive reasoning thought
 * Reasoning from specific observations to general principles
 */
export interface InductiveThought extends BaseThought {
  mode: ThinkingMode.INDUCTIVE;
  observations: string[];        // Specific cases observed
  pattern?: string;              // Identified pattern
  generalization: string;        // General principle formed
  confidence: number;            // 0-1: Strength of inference
  counterexamples?: string[];    // Known exceptions
  sampleSize?: number;           // Number of observations
}

// ===== DEDUCTIVE REASONING =====

/**
 * Deductive reasoning thought
 * Reasoning from general principles to specific conclusions
 */
export interface DeductiveThought extends BaseThought {
  mode: ThinkingMode.DEDUCTIVE;
  premises: string[];            // General principles
  conclusion: string;            // Specific conclusion
  logicForm?: string;            // e.g., "modus ponens", "modus tollens"
  validityCheck: boolean;        // Is the deduction logically valid?
  soundnessCheck?: boolean;      // Are the premises true?
}

// ===== CAUSAL REASONING =====

/**
 * Node in causal graph
 */
export interface CausalNode {
  id: string;
  name: string;
  type: 'cause' | 'effect' | 'mediator' | 'confounder';
  description: string;
}

/**
 * Edge in causal graph (causal relationship)
 */
export interface CausalEdge {
  from: string; // node id
  to: string;   // node id
  strength: number; // -1 to 1 (negative = inhibitory)
  confidence: number; // 0-1
  mechanism?: string;
  formula?: string; // LaTeX formula for mathematical relationship
}

/**
 * Causal graph structure
 */
export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

/**
 * Intervention on causal system
 */
export interface Intervention {
  nodeId: string;
  action: string;
  expectedEffects: {
    nodeId: string;
    expectedChange: string;
    confidence: number;
  }[];
}

/**
 * Causal mechanism description
 */
export interface CausalMechanism {
  from: string;
  to: string;
  description: string;
  type: 'direct' | 'indirect' | 'feedback';
  formula?: string; // LaTeX formula describing the mechanism
}

/**
 * Confounding variable
 */
export interface Confounder {
  nodeId: string;
  affects: string[]; // node ids
  description: string;
}

/**
 * Counterfactual scenario for causal analysis
 */
export interface CounterfactualScenario {
  description: string;
  modifiedNodes: { nodeId: string; newValue: string }[];
  predictedOutcome: string;
}

/**
 * Causal reasoning thought
 */
export interface CausalThought extends BaseThought {
  mode: ThinkingMode.CAUSAL;
  causalGraph: CausalGraph;
  interventions?: Intervention[];
  counterfactuals?: CounterfactualScenario[];
  mechanisms: CausalMechanism[];
  confounders?: Confounder[];
}

// ===== BAYESIAN REASONING =====

/**
 * Hypothesis for Bayesian analysis
 */
export interface BayesianHypothesis {
  id: string;
  statement: string;
  alternatives?: string[];
}

/**
 * Prior probability
 */
export interface PriorProbability {
  probability: number; // 0-1
  justification: string;
  latex?: string; // LaTeX formula for prior distribution
}

/**
 * Likelihood of evidence
 */
export interface Likelihood {
  probability: number; // 0-1
  description: string;
  latex?: string; // LaTeX formula for likelihood function
}

/**
 * Evidence for Bayesian update
 */
export interface BayesianEvidence {
  id: string;
  description: string;
  likelihoodGivenHypothesis: number;    // P(E|H)
  likelihoodGivenNotHypothesis: number; // P(E|¬H)
  timestamp?: string;
}

/**
 * Posterior probability (updated belief)
 */
export interface PosteriorProbability {
  probability: number; // 0-1
  calculation: string; // Show the math
  latex?: string; // LaTeX formula for Bayesian update calculation
}

/**
 * Sensitivity analysis for Bayesian reasoning
 */
export interface SensitivityAnalysis {
  priorRange: [number, number];
  posteriorRange: [number, number];
}

/**
 * Bayesian reasoning thought
 */
export interface BayesianThought extends BaseThought {
  mode: ThinkingMode.BAYESIAN;
  hypothesis: BayesianHypothesis;
  prior: PriorProbability;
  likelihood: Likelihood;
  evidence: BayesianEvidence[];
  posterior: PosteriorProbability;
  bayesFactor?: number; // Strength of evidence
  sensitivity?: SensitivityAnalysis;
}

// ===== COUNTERFACTUAL REASONING =====

/**
 * Condition in a scenario
 */
export interface Condition {
  factor: string;
  value: string;
  isIntervention?: boolean; // Was this changed from actual?
}

/**
 * Outcome of a scenario
 */
export interface Outcome {
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude?: number; // 0-1
}

/**
 * Scenario (actual or counterfactual)
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  conditions: Condition[];
  outcomes: Outcome[];
  likelihood?: number; // 0-1
}

/**
 * Difference between actual and counterfactual
 */
export interface Difference {
  aspect: string;
  actual: string;
  counterfactual: string;
  significance: 'high' | 'medium' | 'low';
}

/**
 * Causal chain from intervention to outcome
 */
export interface CausalChain {
  intervention: string;
  steps: string[];
  finalOutcome: string;
}

/**
 * Point of intervention in timeline
 */
export interface InterventionPoint {
  description: string;
  timestamp?: string;
  timing: string;
  feasibility: number; // 0-1
  expectedImpact: number; // 0-1
  alternatives: string[];
}

/**
 * Comparison between scenarios
 */
export interface CounterfactualComparison {
  differences: Difference[];
  insights: string[];
  lessons: string[];
}

/**
 * Counterfactual reasoning thought
 */
export interface CounterfactualThought extends BaseThought {
  mode: ThinkingMode.COUNTERFACTUAL;
  actual: Scenario;
  counterfactuals: Scenario[];
  comparison: CounterfactualComparison;
  interventionPoint: InterventionPoint;
  causalChains?: CausalChain[];
}

// ===== ANALOGICAL REASONING =====

/**
 * Entity in a domain
 */
export interface Entity {
  id: string;
  name: string;
  type: string;
  description: string;
}

/**
 * Relation between entities
 */
export interface Relation {
  id: string;
  type: string;
  from: string; // entity id
  to: string;   // entity id
  description: string;
}

/**
 * Property of an entity
 */
export interface Property {
  entityId: string;
  name: string;
  value: string;
}

/**
 * Domain (source or target)
 */
export interface Domain {
  id: string;
  name: string;
  description: string;
  entities: Entity[];
  relations: Relation[];
  properties: Property[];
}

/**
 * Mapping between source and target domains
 */
export interface Mapping {
  sourceEntityId: string;
  targetEntityId: string;
  justification: string;
  confidence: number; // 0-1
}

/**
 * Insight from analogy
 */
export interface Insight {
  description: string;
  sourceEvidence: string;
  targetApplication: string;
  novelty: number; // 0-1
}

/**
 * Inference based on analogy
 */
export interface Inference {
  sourcePattern: string;
  targetPrediction: string;
  confidence: number; // 0-1
  needsVerification: boolean;
}

/**
 * Analogical reasoning thought
 */
export interface AnalogicalThought extends BaseThought {
  mode: ThinkingMode.ANALOGICAL;
  sourceDomain: Domain;
  targetDomain: Domain;
  mapping: Mapping[];
  insights: Insight[];
  inferences: Inference[];
  limitations: string[];
  analogyStrength: number; // 0-1
}

// ========== UNION TYPES ==========

/**
 * Union type of all thoughts
 */
export type Thought =
  | SequentialThought
  | ShannonThought
  | MathematicsThought
  | PhysicsThought
  | HybridThought
  | EngineeringThought
  | InductiveThought
  | DeductiveThought
  | AbductiveThought
  | CausalThought
  | BayesianThought
  | CounterfactualThought
  | AnalogicalThought
  | TemporalThought
  | GameTheoryThought
  | EvidentialThought
  | FirstPrinciplesThought
  | SystemsThinkingThought
  | ScientificMethodThought
  | OptimizationThought
  | FormalLogicThought
  | MetaReasoningThought;

// ========== TYPE GUARDS ==========

/**
 * Type guards for existing modes
 */
export function isSequentialThought(thought: Thought): thought is SequentialThought {
  return thought.mode === ThinkingMode.SEQUENTIAL;
}

export function isShannonThought(thought: Thought): thought is ShannonThought {
  return thought.mode === ThinkingMode.SHANNON;
}

export function isMathematicsThought(thought: Thought): thought is MathematicsThought {
  return thought.mode === ThinkingMode.MATHEMATICS;
}

export function isPhysicsThought(thought: Thought): thought is PhysicsThought {
  return thought.mode === ThinkingMode.PHYSICS;
}

export function isHybridThought(thought: Thought): thought is HybridThought {
  return thought.mode === ThinkingMode.HYBRID;
}

/**
 * Type guards for new modes (v2.0)
 */
export function isInductiveThought(thought: Thought): thought is InductiveThought {
  return thought.mode === ThinkingMode.INDUCTIVE;
}

export function isDeductiveThought(thought: Thought): thought is DeductiveThought {
  return thought.mode === ThinkingMode.DEDUCTIVE;
}

export function isAbductiveThought(thought: Thought): thought is AbductiveThought {
  return thought.mode === ThinkingMode.ABDUCTIVE;
}

export function isCausalThought(thought: Thought): thought is CausalThought {
  return thought.mode === ThinkingMode.CAUSAL;
}

export function isBayesianThought(thought: Thought): thought is BayesianThought {
  return thought.mode === ThinkingMode.BAYESIAN;
}

export function isCounterfactualThought(thought: Thought): thought is CounterfactualThought {
  return thought.mode === ThinkingMode.COUNTERFACTUAL;
}

export function isAnalogicalThought(thought: Thought): thought is AnalogicalThought {
  return thought.mode === ThinkingMode.ANALOGICAL;
}

/**
 * Type guards for Phase 3 modes (v2.1+)
 */
export function isTemporalThought(thought: Thought): thought is TemporalThought {
  return thought.mode === ThinkingMode.TEMPORAL;
}

export function isGameTheoryThought(thought: Thought): thought is GameTheoryThought {
  return thought.mode === ThinkingMode.GAMETHEORY;
}

export function isEvidentialThought(thought: Thought): thought is EvidentialThought {
  return thought.mode === ThinkingMode.EVIDENTIAL;
}

export function isFirstPrinciplesThought(thought: Thought): thought is FirstPrinciplesThought {
  return thought.mode === ThinkingMode.FIRSTPRINCIPLES;
}

/**
 * Type guards for Phase 4 modes (v3.2.0)
 */
export function isSystemsThinkingThought(thought: Thought): thought is SystemsThinkingThought {
  return thought.mode === ThinkingMode.SYSTEMSTHINKING;
}

export function isScientificMethodThought(thought: Thought): thought is ScientificMethodThought {
  return thought.mode === ThinkingMode.SCIENTIFICMETHOD;
}

export function isOptimizationThought(thought: Thought): thought is OptimizationThought {
  return thought.mode === ThinkingMode.OPTIMIZATION;
}

export function isFormalLogicThought(thought: Thought): thought is FormalLogicThought {
  return thought.mode === ThinkingMode.FORMALLOGIC;
}

/**
 * Type guards for Phase 6 modes (v6.0.0)
 */
export function isMetaReasoningThought(thought: Thought): thought is MetaReasoningThought {
  return thought.mode === ThinkingMode.METAREASONING;
}

/**
 * Type guards for Phase 10 modes (v7.1.0)
 */
export function isEngineeringThought(thought: Thought): thought is EngineeringThought {
  return thought.mode === ThinkingMode.ENGINEERING;
}

// Re-export Phase 3 types
export type { TemporalThought, GameTheoryThought, EvidentialThought, FirstPrinciplesThought };

// Re-export Phase 4 types
export type { SystemsThinkingThought, ScientificMethodThought, OptimizationThought, FormalLogicThought };

// Re-export Phase 6 types
export type { MetaReasoningThought };

// Re-export Phase 10 types
export type { EngineeringThought };
