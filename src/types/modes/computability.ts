/**
 * Computability Theory Mode - Type Definitions
 * Phase 11 (v7.2.0) - Turing machine analysis, decidability proofs, reductions
 *
 * Inspired by Alan Turing's foundational work on computability (1936)
 * Supports reasoning about what can and cannot be computed
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Computability thought types
 */
export type ComputabilityThoughtType =
  | 'machine_definition'      // Define a Turing machine
  | 'computation_trace'       // Trace execution steps
  | 'decidability_proof'      // Prove (un)decidability
  | 'reduction_construction'  // Build a reduction between problems
  | 'complexity_analysis'     // Classify time/space complexity
  | 'oracle_reasoning'        // Relativized computation
  | 'diagonalization';        // Diagonal argument construction

/**
 * Turing machine transition
 */
export interface TuringTransition {
  fromState: string;
  readSymbol: string;
  toState: string;
  writeSymbol: string;
  direction: 'L' | 'R' | 'S';  // Left, Right, Stay
}

/**
 * Turing machine specification
 */
export interface TuringMachine {
  id: string;
  name: string;
  description?: string;

  // Formal components
  states: string[];
  inputAlphabet: string[];      // Σ
  tapeAlphabet: string[];       // Γ (includes blank)
  blankSymbol: string;          // Usually '_' or 'B'
  transitions: TuringTransition[];
  initialState: string;
  acceptStates: string[];
  rejectStates: string[];

  // Classification
  type: 'deterministic' | 'nondeterministic' | 'multi_tape' | 'oracle';

  // For oracle machines
  oracle?: string;              // Problem the oracle solves
}

/**
 * Single step in a computation
 */
export interface ComputationStep {
  stepNumber: number;
  state: string;
  tapeContents: string;
  headPosition: number;
  transitionUsed?: TuringTransition;
}

/**
 * Complete computation trace
 */
export interface ComputationTrace {
  machine: string;              // Machine ID
  input: string;
  steps: ComputationStep[];
  result: 'accept' | 'reject' | 'loop' | 'running';
  totalSteps: number;
  spaceUsed: number;            // Maximum tape cells used

  // For analysis
  isTerminating: boolean;
  terminationReason?: string;
}

/**
 * Decision problem specification
 */
export interface DecisionProblem {
  id: string;
  name: string;
  description: string;

  // Formal specification
  inputFormat: string;          // What inputs look like
  question: string;             // Yes/no question being asked

  // Examples
  yesInstances: string[];
  noInstances: string[];

  // Classification
  decidabilityStatus: 'decidable' | 'semi_decidable' | 'undecidable' | 'unknown';
  complexityClass?: string;     // P, NP, PSPACE, etc.

  // Relations to other problems
  reducesTo?: string[];         // Problems this reduces to
  reducesFrom?: string[];       // Problems that reduce to this
}

/**
 * Reduction between problems
 */
export interface Reduction {
  id: string;
  fromProblem: string;          // Source problem ID
  toProblem: string;            // Target problem ID

  // Reduction type
  type: 'many_one' | 'turing' | 'polynomial_time' | 'log_space';

  // The reduction function
  reductionFunction: {
    description: string;
    inputTransformation: string;   // How to transform input
    outputInterpretation: string;  // How to interpret output
    preserves: string;             // What property is preserved
  };

  // Proof of correctness
  correctnessProof: {
    forwardDirection: string;      // If x ∈ A then f(x) ∈ B
    backwardDirection: string;     // If f(x) ∈ B then x ∈ A
  };

  // Complexity
  reductionComplexity?: string;    // Time/space to compute reduction
}

/**
 * Diagonalization argument structure
 */
export interface DiagonalizationArgument {
  id: string;

  // The enumeration being diagonalized against
  enumeration: {
    description: string;           // What we're enumerating
    indexSet: string;              // Usually natural numbers
    enumeratedObjects: string;     // What type of objects
  };

  // The diagonal construction
  diagonalConstruction: {
    description: string;
    rule: string;                  // How diagonal element differs at each position
    resultingObject: string;       // The constructed diagonal object
  };

  // The contradiction
  contradiction: {
    assumption: string;            // What we assumed
    consequence: string;           // What follows
    impossibility: string;         // Why it's impossible
  };

  // Pattern classification
  pattern: 'cantor' | 'turing' | 'godel' | 'rice' | 'custom';

  // Historical connection
  historicalNote?: string;
}

/**
 * Decidability proof structure
 */
export interface DecidabilityProof {
  id: string;
  problem: string;               // Problem being analyzed
  conclusion: 'decidable' | 'semi_decidable' | 'undecidable';

  // Proof method
  method: 'direct_machine' | 'reduction' | 'diagonalization' | 'rice_theorem' | 'oracle';

  // For direct proofs (showing decidability)
  decidingMachine?: TuringMachine;

  // For reduction proofs (showing undecidability)
  reduction?: Reduction;
  knownUndecidableProblem?: string;

  // For diagonalization proofs
  diagonalization?: DiagonalizationArgument;

  // For Rice's theorem applications
  riceApplication?: {
    property: string;              // The property of languages
    isNontrivial: boolean;         // Some TMs have it, some don't
    isSemantic: boolean;           // About the language, not the machine
  };

  // Proof steps
  proofSteps: string[];

  // Key insights
  keyInsights: string[];
}

/**
 * Complexity analysis
 */
export interface ComplexityAnalysis {
  id: string;
  problem: string;

  // Time complexity
  timeComplexity?: {
    upperBound: string;            // O(...)
    lowerBound?: string;           // Ω(...)
    tightBound?: string;           // Θ(...)
    worstCase: string;
    averageCase?: string;
    bestCase?: string;
  };

  // Space complexity
  spaceComplexity?: {
    upperBound: string;
    lowerBound?: string;
    tightBound?: string;
  };

  // Complexity class membership
  complexityClass: string;         // P, NP, PSPACE, EXPTIME, etc.
  classJustification: string;

  // Hardness/completeness
  hardnessResults?: {
    hardFor: string;               // NP-hard, PSPACE-hard, etc.
    completeFor?: string;          // NP-complete, etc.
    reductionUsed?: string;
  };

  // Open questions
  openQuestions?: string[];
}

/**
 * Oracle computation analysis
 */
export interface OracleAnalysis {
  id: string;
  baseClass: string;              // e.g., "P"
  oracle: string;                 // e.g., "SAT"
  resultingClass: string;         // e.g., "P^SAT"

  // Relativization
  relativizedResults: {
    statement: string;
    holdsRelativeTo: string[];    // Oracles where it holds
    failsRelativeTo: string[];    // Oracles where it fails
  }[];

  // Baker-Gill-Solovay style results
  separationOracles?: string[];   // Oracles that separate classes
  collapseOracles?: string[];     // Oracles that collapse classes
}

/**
 * Famous undecidable problems (for reference/reduction)
 */
export type ClassicUndecidableProblem =
  | 'halting_problem'             // Does M halt on w?
  | 'acceptance_problem'          // Does M accept w?
  | 'emptiness_problem'           // Is L(M) = ∅?
  | 'equivalence_problem'         // Is L(M1) = L(M2)?
  | 'regularity_problem'          // Is L(M) regular?
  | 'ambiguity_problem'           // Is grammar G ambiguous?
  | 'post_correspondence'         // PCP
  | 'hilberts_tenth';             // Diophantine equations

/**
 * Computability thought extends base thought
 */
export interface ComputabilityThought extends BaseThought {
  mode: ThinkingMode.COMPUTABILITY;
  thoughtType: ComputabilityThoughtType;

  // Turing machines
  machines?: TuringMachine[];
  currentMachine?: TuringMachine;

  // Computation traces
  computationTrace?: ComputationTrace;

  // Decision problems
  problems?: DecisionProblem[];
  currentProblem?: DecisionProblem;

  // Reductions
  reductions?: Reduction[];
  reductionChain?: string[];      // Chain of reductions

  // Decidability analysis
  decidabilityProof?: DecidabilityProof;

  // Diagonalization
  diagonalization?: DiagonalizationArgument;

  // Complexity
  complexityAnalysis?: ComplexityAnalysis;

  // Oracle analysis
  oracleAnalysis?: OracleAnalysis;

  // Dependencies and assumptions
  dependencies: string[];
  assumptions: string[];

  // Uncertainty (lower for proven results)
  uncertainty: number;

  // References to classic results
  classicProblems?: ClassicUndecidableProblem[];

  // Key insight for this thought
  keyInsight?: string;
}

/**
 * Type guard for Computability thoughts
 */
export function isComputabilityThought(thought: BaseThought): thought is ComputabilityThought {
  return thought.mode === ThinkingMode.COMPUTABILITY;
}

/**
 * Helper: Create a simple Turing machine
 */
export function createSimpleMachine(
  name: string,
  states: string[],
  transitions: TuringTransition[],
  acceptStates: string[]
): TuringMachine {
  return {
    id: `tm_${Date.now()}`,
    name,
    states,
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    transitions,
    initialState: states[0],
    acceptStates,
    rejectStates: [],
    type: 'deterministic',
  };
}

/**
 * Helper: Check if a reduction preserves decidability
 */
export function reductionPreservesDecidability(reduction: Reduction): boolean {
  return reduction.type === 'many_one' || reduction.type === 'turing';
}

/**
 * Helper: Check if a reduction is polynomial-time
 */
export function isPolynomialReduction(reduction: Reduction): boolean {
  return reduction.type === 'polynomial_time' || reduction.type === 'log_space';
}
