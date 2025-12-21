/**
 * Core type definitions for the DeepThinking MCP server v8.5.0
 *
 * This file contains ONLY:
 * - ThinkingMode enum (all 33 mode identifiers)
 * - Base types shared by all modes (BaseThought, ShannonStage, ExtendedThoughtType)
 * - The fundamental reasoning triad: Inductive, Deductive, Abductive
 * - Thought union type (importing from mode-specific files)
 * - Type guards
 *
 * All other mode-specific types are defined in src/types/modes/*.ts
 */

// ============================================================================
// IMPORTS FROM MODE-SPECIFIC FILES
// ============================================================================

// Core modes
import type { SequentialThought } from './modes/sequential.js';
import type { ShannonThought } from './modes/shannon.js';
import type { MathematicsThought } from './modes/mathematics.js';
import type { PhysicsThought } from './modes/physics.js';
import type { HybridThought } from './modes/hybrid.js';

// Engineering and theory modes
import type { EngineeringThought } from './modes/engineering.js';
import type { ComputabilityThought } from './modes/computability.js';
import type { CryptanalyticThought } from './modes/cryptanalytic.js';
import type { AlgorithmicThought } from './modes/algorithmic.js';

// Advanced modes
import type { MetaReasoningThought } from './modes/metareasoning.js';
import type { OptimizationThought } from './modes/optimization.js';

// Causal and probabilistic modes
import type { CausalThought } from './modes/causal.js';
import type { BayesianThought } from './modes/bayesian.js';
import type { CounterfactualThought } from './modes/counterfactual.js';
import type { TemporalThought } from './modes/temporal.js';
import type { GameTheoryThought } from './modes/gametheory.js';
import type { EvidentialThought } from './modes/evidential.js';

// Analytical modes
import type { AnalogicalThought } from './modes/analogical.js';
import type { FirstPrinciplesThought } from './modes/firstprinciples.js';

// Scientific modes
import type { SystemsThinkingThought } from './modes/systemsthinking.js';
import type { ScientificMethodThought } from './modes/scientificmethod.js';
import type { FormalLogicThought } from './modes/formallogic.js';

// Academic research modes
import type { SynthesisThought } from './modes/synthesis.js';
import type { ArgumentationThought } from './modes/argumentation.js';
import type { CritiqueThought } from './modes/critique.js';
import type { AnalysisThought } from './modes/analysis.js';

// Advanced runtime modes (Phase 10 Sprint 3 v8.4.0)
import type { RecursiveThought } from './modes/recursive.js';
import type { ModalThought } from './modes/modal.js';
import type { StochasticThought } from './modes/stochastic.js';
import type { ConstraintThought } from './modes/constraint.js';

// User-defined modes (Phase 10 Sprint 3 v8.4.0)
import type { CustomThought } from './modes/custom.js';

// ============================================================================
// THINKING MODE ENUM
// ============================================================================

/**
 * Available thinking modes (33 total)
 */
export enum ThinkingMode {
  // ===== Core Modes =====
  SEQUENTIAL = 'sequential',
  SHANNON = 'shannon',
  MATHEMATICS = 'mathematics',
  PHYSICS = 'physics',
  HYBRID = 'hybrid',

  // ===== Engineering & Theory Modes =====
  ENGINEERING = 'engineering',
  COMPUTABILITY = 'computability',
  CRYPTANALYTIC = 'cryptanalytic',
  ALGORITHMIC = 'algorithmic',

  // ===== Advanced Runtime Modes =====
  METAREASONING = 'metareasoning',
  RECURSIVE = 'recursive',
  MODAL = 'modal',
  STOCHASTIC = 'stochastic',
  CONSTRAINT = 'constraint',
  OPTIMIZATION = 'optimization',

  // ===== Fundamental Reasoning Triad =====
  INDUCTIVE = 'inductive',
  DEDUCTIVE = 'deductive',
  ABDUCTIVE = 'abductive',

  // ===== Causal & Probabilistic Modes =====
  CAUSAL = 'causal',
  BAYESIAN = 'bayesian',
  COUNTERFACTUAL = 'counterfactual',
  TEMPORAL = 'temporal',
  GAMETHEORY = 'gametheory',
  EVIDENTIAL = 'evidential',

  // ===== Analytical Modes =====
  ANALOGICAL = 'analogical',
  FIRSTPRINCIPLES = 'firstprinciples',

  // ===== Scientific Modes =====
  SYSTEMSTHINKING = 'systemsthinking',
  SCIENTIFICMETHOD = 'scientificmethod',
  FORMALLOGIC = 'formallogic',

  // ===== Academic Research Modes =====
  SYNTHESIS = 'synthesis',
  ARGUMENTATION = 'argumentation',
  CRITIQUE = 'critique',
  ANALYSIS = 'analysis',

  CUSTOM = 'custom',
}

// ============================================================================
// MODE CLASSIFICATION
// ============================================================================

/**
 * All modes are fully implemented with specialized handlers (v8.4.0+)
 */
export const FULLY_IMPLEMENTED_MODES: ReadonlyArray<ThinkingMode> = [
  // Core modes
  ThinkingMode.SEQUENTIAL,
  ThinkingMode.SHANNON,
  ThinkingMode.MATHEMATICS,
  ThinkingMode.PHYSICS,
  ThinkingMode.HYBRID,
  // Engineering modes
  ThinkingMode.ENGINEERING,
  ThinkingMode.COMPUTABILITY,
  ThinkingMode.CRYPTANALYTIC,
  ThinkingMode.ALGORITHMIC,
  // Advanced runtime modes
  ThinkingMode.METAREASONING,
  ThinkingMode.RECURSIVE,
  ThinkingMode.MODAL,
  ThinkingMode.STOCHASTIC,
  ThinkingMode.CONSTRAINT,
  ThinkingMode.OPTIMIZATION,
  // Fundamental reasoning modes
  ThinkingMode.INDUCTIVE,
  ThinkingMode.DEDUCTIVE,
  ThinkingMode.ABDUCTIVE,
  // Causal/Temporal modes
  ThinkingMode.CAUSAL,
  ThinkingMode.COUNTERFACTUAL,
  ThinkingMode.TEMPORAL,
  // Probabilistic modes
  ThinkingMode.BAYESIAN,
  ThinkingMode.EVIDENTIAL,
  // Strategic modes
  ThinkingMode.GAMETHEORY,
  // Analytical modes
  ThinkingMode.ANALOGICAL,
  ThinkingMode.FIRSTPRINCIPLES,
  // Scientific modes
  ThinkingMode.SYSTEMSTHINKING,
  ThinkingMode.SCIENTIFICMETHOD,
  ThinkingMode.FORMALLOGIC,
  // Academic research modes
  ThinkingMode.SYNTHESIS,
  ThinkingMode.ARGUMENTATION,
  ThinkingMode.CRITIQUE,
  ThinkingMode.ANALYSIS,
];

/**
 * @deprecated All modes are now fully implemented. Kept for backward compatibility.
 */
export const EXPERIMENTAL_MODES: ReadonlyArray<ThinkingMode> = [];

/**
 * Check if a mode is fully implemented
 */
export function isFullyImplemented(mode: ThinkingMode): boolean {
  return FULLY_IMPLEMENTED_MODES.includes(mode);
}

// ============================================================================
// SHARED ENUMS AND TYPES
// ============================================================================

/**
 * Shannon methodology stages (used by Shannon and Hybrid modes)
 */
export enum ShannonStage {
  PROBLEM_DEFINITION = 'problem_definition',
  CONSTRAINTS = 'constraints',
  MODEL = 'model',
  PROOF = 'proof',
  IMPLEMENTATION = 'implementation',
}

/**
 * Extended thought types for mathematical and physics reasoning
 */
export type ExtendedThoughtType =
  | 'problem_definition'
  | 'constraints'
  | 'model'
  | 'proof'
  | 'implementation'
  | 'axiom_definition'
  | 'theorem_statement'
  | 'proof_construction'
  | 'lemma_derivation'
  | 'corollary'
  | 'counterexample'
  | 'algebraic_manipulation'
  | 'symbolic_computation'
  | 'numerical_analysis'
  | 'symmetry_analysis'
  | 'gauge_theory'
  | 'field_equations'
  | 'lagrangian'
  | 'hamiltonian'
  | 'conservation_law'
  | 'dimensional_analysis'
  | 'tensor_formulation'
  | 'differential_geometry'
  | 'decomposition'
  | 'synthesis'
  | 'abstraction'
  | 'analogy'
  | 'metacognition'
  // Phase 8: Proof Decomposition Types
  | 'proof_decomposition'
  | 'dependency_analysis'
  | 'consistency_check'
  | 'gap_identification'
  | 'assumption_trace'
  // Phase 10: Hybrid Mode Types
  | 'mode_selection'
  | 'parallel_analysis'
  | 'sequential_analysis'
  | 'convergence_check'
  | 'confidence_assessment'
  | 'mode_switching';

// ============================================================================
// BASE THOUGHT INTERFACE
// ============================================================================

/**
 * Base thought interface - all mode-specific thoughts extend this
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
  revisionReason?: string;
  branchFrom?: string;
  branchId?: string;
  uncertainty?: number;
  dependencies?: string[];
  assumptions?: string[];
  tags?: string[];
  importance?: number;
}

// ============================================================================
// FUNDAMENTAL REASONING TRIAD
// These are the three foundational reasoning modes that other modes build upon
// ============================================================================

// ----- INDUCTIVE REASONING -----

/**
 * Inductive reasoning thought
 * Reasoning from specific observations to general principles
 */
export interface InductiveThought extends BaseThought {
  mode: ThinkingMode.INDUCTIVE;
  observations: string[]; // Specific cases observed
  pattern?: string; // Identified pattern
  generalization: string; // General principle formed
  confidence: number; // 0-1: Strength of inference
  counterexamples?: string[]; // Known exceptions
  sampleSize?: number; // Number of observations
}

// ----- DEDUCTIVE REASONING -----

/**
 * Deductive reasoning thought
 * Reasoning from general principles to specific conclusions
 */
export interface DeductiveThought extends BaseThought {
  mode: ThinkingMode.DEDUCTIVE;
  premises: string[]; // General principles
  conclusion: string; // Specific conclusion
  logicForm?: string; // e.g., "modus ponens", "modus tollens"
  validityCheck: boolean; // Is the deduction logically valid?
  soundnessCheck?: boolean; // Are the premises true?
}

// ----- ABDUCTIVE REASONING -----

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
  parsimony: number; // Simplicity score (0-1)
  explanatoryPower: number; // How well it explains observations (0-1)
  plausibility: number; // Prior probability (0-1)
  testability: boolean; // Can it be tested?
}

/**
 * Abductive reasoning thought
 * Inference to the best explanation
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

// ============================================================================
// THOUGHT UNION TYPE
// ============================================================================

/**
 * Union type of all thought types
 */
export type Thought =
  // Core modes
  | SequentialThought
  | ShannonThought
  | MathematicsThought
  | PhysicsThought
  | HybridThought
  // Engineering and theory
  | EngineeringThought
  | ComputabilityThought
  | CryptanalyticThought
  | AlgorithmicThought
  // Fundamental triad (defined in this file)
  | InductiveThought
  | DeductiveThought
  | AbductiveThought
  // Causal and probabilistic
  | CausalThought
  | BayesianThought
  | CounterfactualThought
  | TemporalThought
  | GameTheoryThought
  | EvidentialThought
  // Analytical
  | AnalogicalThought
  | FirstPrinciplesThought
  // Scientific
  | SystemsThinkingThought
  | ScientificMethodThought
  | OptimizationThought
  | FormalLogicThought
  // Academic research
  | SynthesisThought
  | ArgumentationThought
  | CritiqueThought
  | AnalysisThought
  // Meta
  | MetaReasoningThought
  // Advanced runtime (Phase 10 Sprint 3 v8.4.0)
  | RecursiveThought
  | ModalThought
  | StochasticThought
  | ConstraintThought
  // User-defined
  | CustomThought;

// ============================================================================
// TYPE GUARDS
// ============================================================================

// ----- Fundamental Triad -----

export function isInductiveThought(thought: Thought): thought is InductiveThought {
  return thought.mode === ThinkingMode.INDUCTIVE;
}

export function isDeductiveThought(thought: Thought): thought is DeductiveThought {
  return thought.mode === ThinkingMode.DEDUCTIVE;
}

export function isAbductiveThought(thought: Thought): thought is AbductiveThought {
  return thought.mode === ThinkingMode.ABDUCTIVE;
}

// ----- Core Modes -----

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

// ----- Engineering & Theory -----

export function isEngineeringThought(thought: Thought): thought is EngineeringThought {
  return thought.mode === ThinkingMode.ENGINEERING;
}

export function isComputabilityThought(thought: Thought): thought is ComputabilityThought {
  return thought.mode === ThinkingMode.COMPUTABILITY;
}

export function isCryptanalyticThought(thought: Thought): thought is CryptanalyticThought {
  return thought.mode === ThinkingMode.CRYPTANALYTIC;
}

export function isAlgorithmicThought(thought: Thought): thought is AlgorithmicThought {
  return thought.mode === ThinkingMode.ALGORITHMIC;
}

// ----- Advanced Modes -----

export function isMetaReasoningThought(thought: Thought): thought is MetaReasoningThought {
  return thought.mode === ThinkingMode.METAREASONING;
}

export function isOptimizationThought(thought: Thought): thought is OptimizationThought {
  return thought.mode === ThinkingMode.OPTIMIZATION;
}

// ----- Causal & Probabilistic -----

export function isCausalThought(thought: Thought): thought is CausalThought {
  return thought.mode === ThinkingMode.CAUSAL;
}

export function isBayesianThought(thought: Thought): thought is BayesianThought {
  return thought.mode === ThinkingMode.BAYESIAN;
}

export function isCounterfactualThought(thought: Thought): thought is CounterfactualThought {
  return thought.mode === ThinkingMode.COUNTERFACTUAL;
}

export function isTemporalThought(thought: Thought): thought is TemporalThought {
  return thought.mode === ThinkingMode.TEMPORAL;
}

export function isGameTheoryThought(thought: Thought): thought is GameTheoryThought {
  return thought.mode === ThinkingMode.GAMETHEORY;
}

export function isEvidentialThought(thought: Thought): thought is EvidentialThought {
  return thought.mode === ThinkingMode.EVIDENTIAL;
}

// ----- Analytical -----

export function isAnalogicalThought(thought: Thought): thought is AnalogicalThought {
  return thought.mode === ThinkingMode.ANALOGICAL;
}

export function isFirstPrinciplesThought(thought: Thought): thought is FirstPrinciplesThought {
  return thought.mode === ThinkingMode.FIRSTPRINCIPLES;
}

// ----- Scientific -----

export function isSystemsThinkingThought(thought: Thought): thought is SystemsThinkingThought {
  return thought.mode === ThinkingMode.SYSTEMSTHINKING;
}

export function isScientificMethodThought(thought: Thought): thought is ScientificMethodThought {
  return thought.mode === ThinkingMode.SCIENTIFICMETHOD;
}

export function isFormalLogicThought(thought: Thought): thought is FormalLogicThought {
  return thought.mode === ThinkingMode.FORMALLOGIC;
}

// ----- Academic Research -----

export function isSynthesisThought(thought: Thought): thought is SynthesisThought {
  return thought.mode === ThinkingMode.SYNTHESIS;
}

export function isArgumentationThought(thought: Thought): thought is ArgumentationThought {
  return thought.mode === ThinkingMode.ARGUMENTATION;
}

export function isCritiqueThought(thought: Thought): thought is CritiqueThought {
  return thought.mode === ThinkingMode.CRITIQUE;
}

export function isAnalysisThought(thought: Thought): thought is AnalysisThought {
  return thought.mode === ThinkingMode.ANALYSIS;
}

// ----- Advanced Runtime (Phase 10 Sprint 3 v8.4.0) -----

export function isRecursiveThought(thought: Thought): thought is RecursiveThought {
  return thought.mode === ThinkingMode.RECURSIVE;
}

export function isModalThought(thought: Thought): thought is ModalThought {
  return thought.mode === ThinkingMode.MODAL;
}

export function isStochasticThought(thought: Thought): thought is StochasticThought {
  return thought.mode === ThinkingMode.STOCHASTIC;
}

export function isConstraintThought(thought: Thought): thought is ConstraintThought {
  return thought.mode === ThinkingMode.CONSTRAINT;
}

// ----- User-Defined -----

export function isCustomThought(thought: Thought): thought is CustomThought {
  return thought.mode === ThinkingMode.CUSTOM;
}

// ============================================================================
// RE-EXPORTS FROM MODE FILES
// This allows importing everything from core.ts for backwards compatibility
// ============================================================================

// Re-export thought types
export type {
  SequentialThought,
  ShannonThought,
  MathematicsThought,
  PhysicsThought,
  HybridThought,
  EngineeringThought,
  ComputabilityThought,
  CryptanalyticThought,
  AlgorithmicThought,
  MetaReasoningThought,
  OptimizationThought,
  CausalThought,
  BayesianThought,
  CounterfactualThought,
  TemporalThought,
  GameTheoryThought,
  EvidentialThought,
  AnalogicalThought,
  FirstPrinciplesThought,
  SystemsThinkingThought,
  ScientificMethodThought,
  FormalLogicThought,
  SynthesisThought,
  ArgumentationThought,
  CritiqueThought,
  AnalysisThought,
  // Advanced runtime (Phase 10 Sprint 3 v8.4.0)
  RecursiveThought,
  ModalThought,
  StochasticThought,
  ConstraintThought,
  // User-defined
  CustomThought,
};
