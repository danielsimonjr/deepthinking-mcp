/**
 * Core type definitions for the DeepThinking MCP server v2.1+
 * Supports 13 thinking modes: Sequential, Shannon, Mathematics, Physics, Hybrid,
 * Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, GameTheory, Evidential
 */

/**
 * Available thinking modes
 */
export enum ThinkingMode {
  SEQUENTIAL = 'sequential',
  SHANNON = 'shannon',
  MATHEMATICS = 'mathematics',
  PHYSICS = 'physics',
  HYBRID = 'hybrid',
  ABDUCTIVE = 'abductive',
  CAUSAL = 'causal',
  BAYESIAN = 'bayesian',
  COUNTERFACTUAL = 'counterfactual',
  ANALOGICAL = 'analogical',
  TEMPORAL = 'temporal', // Phase 3 (v2.1)
  GAMETHEORY = 'gametheory', // Phase 3 (v2.2)
  EVIDENTIAL = 'evidential', // Phase 3 (v2.3)
  CUSTOM = 'custom'
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
  | 'decomposition' | 'synthesis' | 'abstraction' | 'analogy' | 'metacognition';

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
}

/**
 * Likelihood of evidence
 */
export interface Likelihood {
  probability: number; // 0-1
  description: string;
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
  likelihood?: number; // How plausible is this scenario?
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
  | AbductiveThought
  | CausalThought
  | BayesianThought
  | CounterfactualThought
  | AnalogicalThought;

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
