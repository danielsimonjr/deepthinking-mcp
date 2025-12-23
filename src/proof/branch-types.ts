/**
 * Branch Analysis Types for Proof Decomposition
 * Phase 12 Sprint 1 - Foundation & Infrastructure
 *
 * Provides types for independent branch detection, hierarchical proofs,
 * strategy recommendations, and proof verification.
 */

import type { ProofStep } from './decomposer.js';

// ============================================================================
// PROOF BRANCH TYPES
// ============================================================================

/**
 * Represents a branch within a proof that can potentially be analyzed independently
 */
export interface ProofBranch {
  /** Unique identifier for this branch */
  id: string;

  /** Name or label for this branch */
  name: string;

  /** Steps contained in this branch */
  steps: ProofStep[];

  /** IDs of branches this branch depends on */
  dependencies: string[];

  /** IDs of branches that depend on this branch */
  dependents: string[];

  /** True if this branch has no dependencies and can be analyzed first */
  isIndependent: boolean;

  /** Estimated complexity for load balancing (higher = more complex) */
  estimatedComplexity: number;

  /** Optional metadata about the branch */
  metadata?: {
    /** Type of reasoning used in this branch */
    reasoningType?: string;
    /** Key assumptions made in this branch */
    assumptions?: string[];
    /** Depth in the proof tree */
    depth?: number;
  };
}

/**
 * Result of branch analysis on a proof
 */
export interface BranchAnalysisResult {
  /** All identified branches */
  branches: ProofBranch[];

  /** Branches grouped by execution level (same level can run in parallel) */
  executionLevels: ProofBranch[][];

  /** Total number of independent branches */
  independentCount: number;

  /** Total estimated complexity across all branches */
  totalComplexity: number;

  /** Whether the proof can benefit from parallel analysis */
  canParallelize: boolean;
}

// ============================================================================
// HIERARCHICAL PROOF TYPES
// ============================================================================

/**
 * Type of hierarchical proof element
 */
export type HierarchicalProofType = 'theorem' | 'lemma' | 'corollary' | 'claim' | 'proposition';

/**
 * Represents a hierarchical proof structure supporting nested proofs
 */
export interface HierarchicalProof {
  /** Unique identifier */
  id: string;

  /** Type of this proof element */
  type: HierarchicalProofType;

  /** The statement being proved */
  statement: string;

  /** Optional name/label for this proof */
  name?: string;

  /** The proof steps for this element */
  proof: ProofStep[];

  /** Nested sub-proofs (lemmas, claims, etc.) */
  subProofs: HierarchicalProof[];

  /** IDs of other proofs this one depends on */
  dependencies: string[];

  /** Whether this proof is complete */
  isComplete: boolean;

  /** Optional metadata */
  metadata?: {
    /** Author or source */
    author?: string;
    /** Date created */
    createdAt?: Date;
    /** Tags for categorization */
    tags?: string[];
  };
}

/**
 * A tree structure for organizing hierarchical proofs
 */
export interface ProofTree {
  /** The root theorem/proof */
  root: HierarchicalProof;

  /** Map of lemma ID to lemma proof */
  lemmas: Map<string, HierarchicalProof>;

  /** Topological order for proving (dependencies first) */
  dependencyOrder: string[];

  /** Statistics about the proof tree */
  statistics: {
    /** Total number of proof elements */
    totalElements: number;
    /** Maximum depth of nesting */
    maxDepth: number;
    /** Total number of steps across all proofs */
    totalSteps: number;
  };
}

// ============================================================================
// PROOF STRATEGY TYPES
// ============================================================================

/**
 * Available proof strategies
 */
export type ProofStrategyType =
  | 'direct'
  | 'contradiction'
  | 'induction'
  | 'strong_induction'
  | 'structural_induction'
  | 'case_analysis'
  | 'contrapositive'
  | 'construction'
  | 'pigeonhole'
  | 'diagonalization'
  | 'well_ordering'
  | 'infinite_descent';

/**
 * Template for structuring a proof using a specific strategy
 */
export interface ProofTemplate {
  /** The strategy this template is for */
  strategy: ProofStrategyType;

  /** Description of the template */
  description: string;

  /** Ordered sections of the proof */
  sections: ProofTemplateSection[];

  /** Example skeleton for this strategy */
  skeleton: string;
}

/**
 * A section within a proof template
 */
export interface ProofTemplateSection {
  /** Name of this section */
  name: string;

  /** Description of what goes in this section */
  description: string;

  /** Whether this section is required */
  required: boolean;

  /** Placeholder text */
  placeholder: string;
}

/**
 * A recommendation for which proof strategy to use
 */
export interface StrategyRecommendation {
  /** The recommended strategy */
  strategy: ProofStrategyType;

  /** Confidence in this recommendation (0-1) */
  confidence: number;

  /** Reasoning for why this strategy is recommended */
  reasoning: string;

  /** Template for implementing this strategy */
  suggestedStructure: ProofTemplate;

  /** Features of the theorem that led to this recommendation */
  matchedFeatures: string[];
}

/**
 * Features extracted from a theorem for strategy matching
 */
export interface TheoremFeatures {
  /** Contains universal quantifier (for all) */
  hasUniversalQuantifier: boolean;

  /** Contains existential quantifier (there exists) */
  hasExistentialQuantifier: boolean;

  /** Involves inequality or ordering */
  involvesInequality: boolean;

  /** Has recursive or inductive structure */
  hasRecursiveStructure: boolean;

  /** Domain type (natural numbers, reals, sets, etc.) */
  domainType: string;

  /** Involves negation */
  involvesNegation: boolean;

  /** Statement is conditional (if-then) */
  isConditional: boolean;

  /** Statement is biconditional (if and only if) */
  isBiconditional: boolean;

  /** Involves finite sets or counting */
  involvesFiniteSets: boolean;

  /** Additional detected features */
  additionalFeatures: string[];
}

// ============================================================================
// PROOF VERIFICATION TYPES
// ============================================================================

/**
 * Severity level for verification issues
 */
export type VerificationSeverity = 'error' | 'warning' | 'info';

/**
 * Types of verification errors
 */
export type VerificationErrorType =
  | 'invalid_justification'
  | 'missing_step'
  | 'circular_reference'
  | 'undefined_term'
  | 'type_mismatch'
  | 'invalid_inference'
  | 'unsupported_rule';

/**
 * An error found during proof verification
 */
export interface VerificationError {
  /** ID of the step with the error */
  stepId: string;

  /** Type of error */
  type: VerificationErrorType;

  /** Human-readable error message */
  message: string;

  /** Suggested fix for the error */
  suggestion?: string;

  /** Severity of the error */
  severity: VerificationSeverity;

  /** Line number if applicable */
  line?: number;
}

/**
 * A warning found during proof verification
 */
export interface VerificationWarning {
  /** ID of the step with the warning */
  stepId: string;

  /** Warning message */
  message: string;

  /** Category of warning */
  category: string;

  /** Severity */
  severity: VerificationSeverity;
}

/**
 * Coverage statistics for verification
 */
export interface VerificationCoverage {
  /** Number of steps successfully verified */
  stepsVerified: number;

  /** Total number of steps */
  totalSteps: number;

  /** Percentage of steps verified */
  percentage: number;

  /** Steps that could not be verified */
  unverifiedSteps: string[];
}

/**
 * Result of verifying a proof
 */
export interface VerificationResult {
  /** Whether the proof is valid (no errors) */
  isValid: boolean;

  /** Errors found during verification */
  errors: VerificationError[];

  /** Warnings found during verification */
  warnings: VerificationWarning[];

  /** Coverage statistics */
  coverage: VerificationCoverage;

  /** Time taken to verify (ms) */
  verificationTime: number;

  /** Verified justification types used */
  justificationTypes: string[];
}

// ============================================================================
// JUSTIFICATION TYPES
// ============================================================================

/**
 * Types of justifications for proof steps
 */
export type JustificationType =
  | 'axiom'
  | 'definition'
  | 'hypothesis'
  | 'previous_step'
  | 'lemma'
  | 'theorem'
  | 'modus_ponens'
  | 'modus_tollens'
  | 'universal_instantiation'
  | 'existential_instantiation'
  | 'universal_generalization'
  | 'existential_generalization'
  | 'conjunction'
  | 'disjunction'
  | 'substitution'
  | 'algebraic'
  | 'by_cases'
  | 'contradiction'
  | 'induction_base'
  | 'induction_step';

/**
 * A justification for a proof step
 */
export interface StepJustification {
  /** Type of justification */
  type: JustificationType;

  /** References to other steps or external sources */
  references: string[];

  /** The rule or theorem applied */
  rule?: string;

  /** Additional explanation */
  explanation?: string;
}
