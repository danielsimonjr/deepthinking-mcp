/**
 * Mathematics Reasoning Mode - Type Definitions
 * Formal mathematical reasoning with proofs, theorems, and symbolic computation
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Mathematical thought types
 */
export type MathematicsThoughtType =
  | 'axiom_definition'
  | 'theorem_statement'
  | 'proof_construction'
  | 'lemma_derivation'
  | 'corollary'
  | 'counterexample'
  | 'algebraic_manipulation'
  | 'symbolic_computation'
  | 'numerical_analysis';

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
}

export function isMathematicsThought(thought: BaseThought): thought is MathematicsThought {
  return thought.mode === 'mathematics';
}
