/**
 * Formal Logic Mode - Type Definitions
 * Phase 4 (v3.2.0) - Formal logical reasoning with propositions, inference, and proofs
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Formal Logic thought extends base thought with logical reasoning
 */
export interface FormalLogicThought extends BaseThought {
  mode: ThinkingMode.FORMALLOGIC;
  thoughtType:
    | 'proposition_definition'
    | 'inference_derivation'
    | 'proof_construction'
    | 'satisfiability_check'
    | 'validity_verification';

  propositions?: Proposition[];
  logicalInferences?: Inference[];
  proof?: LogicalProof;
  truthTable?: TruthTable;
  satisfiability?: SatisfiabilityResult;
}

/**
 * Logical proposition
 */
export interface Proposition {
  id: string;
  symbol: string; // e.g., "P", "Q", "R"
  statement: string;
  truthValue?: boolean;
  type: 'atomic' | 'compound';
  formula?: string; // Logical formula if compound
  latex?: string;
}

/**
 * Logical operator
 */
export type LogicalOperator =
  | 'AND' // ∧
  | 'OR' // ∨
  | 'NOT' // ¬
  | 'IMPLIES' // →
  | 'IFF' // ↔
  | 'XOR' // ⊕
  | 'NAND' // ⊼
  | 'NOR'; // ⊽

/**
 * Compound logical formula
 */
export interface LogicalFormula {
  id: string;
  expression: string;
  latex: string;
  operator?: LogicalOperator;
  operands: string[]; // Proposition or formula IDs
  normalized?: string; // CNF or DNF
}

/**
 * Inference rule
 */
export type InferenceRule =
  | 'modus_ponens' // P, P→Q ⊢ Q
  | 'modus_tollens' // ¬Q, P→Q ⊢ ¬P
  | 'hypothetical_syllogism' // P→Q, Q→R ⊢ P→R
  | 'disjunctive_syllogism' // P∨Q, ¬P ⊢ Q
  | 'conjunction' // P, Q ⊢ P∧Q
  | 'simplification' // P∧Q ⊢ P
  | 'addition' // P ⊢ P∨Q
  | 'resolution' // P∨Q, ¬P∨R ⊢ Q∨R
  | 'contradiction' // P, ¬P ⊢ ⊥
  | 'excluded_middle'; // ⊢ P∨¬P

/**
 * Logical inference step
 */
export interface Inference {
  id: string;
  rule: InferenceRule;
  premises: string[]; // Proposition/formula IDs
  conclusion: string; // Proposition/formula ID
  justification: string;
  valid: boolean;
  latex?: string;
}

/**
 * Proof technique
 */
export type ProofTechnique =
  | 'direct' // Direct proof
  | 'contradiction' // Proof by contradiction
  | 'contrapositive' // Proof by contrapositive
  | 'cases' // Proof by cases
  | 'induction' // Mathematical induction
  | 'natural_deduction' // Natural deduction
  | 'resolution' // Resolution refutation
  | 'semantic_tableaux'; // Tableau method

/**
 * Logical proof
 */
export interface LogicalProof {
  id: string;
  theorem: string; // Statement being proved
  technique: ProofTechnique;
  steps: ProofStep[];
  conclusion: string;
  valid: boolean;
  completeness: number; // 0-1
  assumptions?: string[];
}

/**
 * Step in a logical proof
 */
export interface ProofStep {
  stepNumber: number;
  statement: string;
  formula?: string;
  latex?: string;
  justification: string;
  rule?: InferenceRule;
  referencesSteps?: number[]; // Which previous steps this uses
  isAssumption?: boolean;
  dischargesAssumption?: number; // Step number of assumption being discharged
}

/**
 * Truth table for propositions
 */
export interface TruthTable {
  id: string;
  propositions: string[]; // Proposition IDs
  formula?: string; // Formula being evaluated
  rows: TruthTableRow[];
  isTautology: boolean;
  isContradiction: boolean;
  isContingent: boolean;
}

/**
 * Row in truth table
 */
export interface TruthTableRow {
  rowNumber: number;
  assignments: Record<string, boolean>; // Proposition ID -> truth value
  result: boolean; // Result of evaluating the formula
}

/**
 * Satisfiability result
 */
export interface SatisfiabilityResult {
  id: string;
  formula: string;
  latex?: string;
  satisfiable: boolean;
  model?: Record<string, boolean>; // Satisfying assignment if SAT
  method: 'dpll' | 'cdcl' | 'resolution' | 'truth_table' | 'other';
  complexity?: string;
  explanation: string;
}

/**
 * Validity check result
 */
export interface ValidityResult {
  id: string;
  argument: LogicalArgument;
  valid: boolean;
  method: string;
  counterexample?: Record<string, boolean>; // If invalid
  explanation: string;
}

/**
 * Logical argument
 */
export interface LogicalArgument {
  id: string;
  premises: string[]; // Formula IDs
  conclusion: string; // Formula ID
  form?: string; // e.g., "modus ponens", "disjunctive syllogism"
  latex?: string;
}

/**
 * Contradiction detection
 */
export interface Contradiction {
  id: string;
  contradictingStatements: string[]; // Proposition/formula IDs
  explanation: string;
  derivation?: ProofStep[];
}

/**
 * Logical equivalence
 */
export interface LogicalEquivalence {
  id: string;
  formula1: string;
  formula2: string;
  equivalent: boolean;
  proof?: string;
  transformations?: string[]; // Equivalence laws applied
}

/**
 * Normal form representation
 */
export interface NormalForm {
  id: string;
  original: string;
  cnf?: string; // Conjunctive Normal Form
  dnf?: string; // Disjunctive Normal Form
  nnf?: string; // Negation Normal Form
  latex?: {
    original: string;
    cnf?: string;
    dnf?: string;
    nnf?: string;
  };
}

/**
 * Type guard for Formal Logic thoughts
 */
export function isFormalLogicThought(thought: BaseThought): thought is FormalLogicThought {
  return thought.mode === 'formallogic';
}
