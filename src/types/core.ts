/**
 * Core type definitions for the DeepThinking MCP server
 * Combines sequential, Shannon, and mathematical reasoning modes
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

/**
 * Union type of all thoughts
 */
export type Thought = SequentialThought | ShannonThought | MathematicsThought | PhysicsThought | HybridThought;

/**
 * Type guards
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
