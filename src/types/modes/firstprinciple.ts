/**
 * First-Principles Reasoning Mode - Type Definitions
 * Deductive reasoning from foundational axioms and principles
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Type of first principle being applied
 */
export type PrincipleType =
  | 'axiom' // Self-evident truth
  | 'definition' // Foundational definition
  | 'observation' // Empirical observation
  | 'logical_inference' // Logical deduction
  | 'assumption' // Stated assumption;

/**
 * A foundational principle used in reasoning
 */
export interface FirstPrinciple {
  id: string;
  type: PrincipleType;
  statement: string;
  justification: string;
  dependsOn?: string[]; // IDs of other principles this depends on
}

/**
 * A step in the derivation chain
 */
export interface DerivationStep {
  stepNumber: number;
  principle: FirstPrinciple;
  inference: string; // What is inferred from this principle
  logicalForm?: string; // Optional formal logic representation
  confidence: number; // 0-1, confidence in this step
}

/**
 * The conclusion reached from first principles
 */
export interface Conclusion {
  statement: string;
  derivationChain: number[]; // Step numbers that lead to this conclusion
  certainty: number; // 0-1, overall certainty
  limitations?: string[]; // Known limitations or assumptions
}

/**
 * First-principles thought structure
 */
export interface FirstPrincipleThought extends BaseThought {
  mode: ThinkingMode.FIRSTPRINCIPLE;
  question: string; // The question being answered
  principles: FirstPrinciple[]; // All principles used
  derivationSteps: DerivationStep[]; // Chain of reasoning
  conclusion: Conclusion; // Final conclusion
  alternativeInterpretations?: string[]; // Other possible interpretations
}

/**
 * Type guard for FirstPrincipleThought
 */
export function isFirstPrincipleThought(thought: BaseThought): thought is FirstPrincipleThought {
  return thought.mode === 'firstprinciple';
}
