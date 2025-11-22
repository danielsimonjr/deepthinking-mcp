/**
 * First-Principles Reasoning Mode - Type Definitions
 * Phase 3 (v3.1.0) - Building understanding from foundational principles
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * First-Principles thought extends base thought with foundational reasoning
 */
export interface FirstPrinciplesThought extends BaseThought {
  mode: ThinkingMode.FIRSTPRINCIPLES;
  question: string;
  principles: FoundationalPrinciple[];
  derivationSteps: DerivationStep[];
  conclusion: Conclusion;
  alternativeInterpretations?: string[];
}

/**
 * Type of foundational principle
 */
export type PrincipleType =
  | 'axiom'              // Self-evident truth
  | 'definition'         // Definition of a concept
  | 'observation'        // Empirical observation
  | 'logical_inference'  // Derived through logic
  | 'assumption';        // Stated assumption

/**
 * Foundational principle - the building blocks of reasoning
 */
export interface FoundationalPrinciple {
  id: string;
  type: PrincipleType;
  statement: string;
  justification: string;
  dependsOn?: string[]; // IDs of other principles this depends on
  confidence?: number; // 0-1, for observations and assumptions
  latex?: string; // LaTeX representation for mathematical principles
}

/**
 * Step in the derivation chain
 */
export interface DerivationStep {
  stepNumber: number;
  principle: string; // ID of the principle being applied
  inference: string; // What is inferred from this principle
  logicalForm?: string; // Formal logic representation (e.g., "A → B, A ∴ B")
  confidence: number; // 0-1, confidence in this step
  latex?: string; // LaTeX representation for mathematical derivations
}

/**
 * Final conclusion with derivation chain
 */
export interface Conclusion {
  statement: string;
  derivationChain: number[]; // Array of step numbers leading to conclusion
  certainty: number; // 0-1, overall certainty level
  limitations?: string[]; // Known limitations or assumptions
  latex?: string; // LaTeX representation for mathematical conclusions
}

/**
 * Type guard for First-Principles thoughts
 */
export function isFirstPrinciplesThought(thought: BaseThought): thought is FirstPrinciplesThought {
  return thought.mode === 'firstprinciples';
}
