/**
 * Argumentation Mode - Type Definitions (Phase 13 v7.4.0)
 * Academic argumentation using Toulmin model, dialectics, and rhetorical structures
 * Designed for constructing and analyzing scholarly arguments
 */

import { BaseThought, ThinkingMode } from '../core.js';

// ===== ARGUMENTATION THOUGHT TYPES =====

/**
 * Types of argumentation reasoning steps
 */
export type ArgumentationThoughtType =
  | 'claim_formulation'         // Formulate the central claim/thesis
  | 'grounds_identification'    // Identify supporting evidence/data
  | 'warrant_construction'      // Construct warrants linking grounds to claim
  | 'backing_provision'         // Provide backing for warrants
  | 'rebuttal_anticipation'     // Anticipate counterarguments
  | 'qualifier_specification'   // Specify qualifications/limitations
  | 'argument_assembly'         // Assemble complete argument structure
  | 'dialectic_analysis';       // Analyze thesis-antithesis-synthesis

// ===== TOULMIN MODEL INTERFACES =====

/**
 * Claim/Thesis - the conclusion being argued for
 */
export interface Claim {
  id: string;
  statement: string;
  type: 'fact' | 'value' | 'policy' | 'definition' | 'cause';
  scope: 'universal' | 'general' | 'particular';
  strength: 'strong' | 'moderate' | 'tentative';
  contested: boolean;
  latex?: string;
}

/**
 * Grounds/Data - evidence supporting the claim
 */
export interface Grounds {
  id: string;
  type: 'empirical' | 'statistical' | 'testimonial' | 'analogical' | 'logical' | 'textual';
  content: string;
  source?: string;
  reliability: number;           // 0-1
  relevance: number;             // 0-1
  sufficiency: 'sufficient' | 'partial' | 'insufficient';
  verifiable: boolean;
}

/**
 * Warrant - reasoning that connects grounds to claim
 */
export interface Warrant {
  id: string;
  statement: string;
  type: 'generalization' | 'analogy' | 'causal' | 'authority' | 'principle' | 'definition';
  implicit: boolean;             // Was it unstated?
  strength: number;              // 0-1
  assumptions: string[];
  groundsIds: string[];          // Which grounds this warrant connects
  claimId: string;               // Which claim this warrant supports
}

/**
 * Backing - support for the warrant itself
 */
export interface Backing {
  id: string;
  content: string;
  type: 'theoretical' | 'empirical' | 'authoritative' | 'definitional' | 'precedent';
  source?: string;
  warrantId: string;             // Which warrant this backs
  credibility: number;           // 0-1
}

/**
 * Qualifier - indicates degree of certainty
 */
export interface Qualifier {
  id: string;
  term: string;                  // "probably", "likely", "certainly", etc.
  certainty: number;             // 0-1 (0 = possible, 1 = certain)
  conditions?: string[];         // Conditions under which claim holds
  scope?: string;                // Scope of applicability
}

/**
 * Rebuttal - potential counterargument or exception
 */
export interface Rebuttal {
  id: string;
  objection: string;
  type: 'factual' | 'logical' | 'ethical' | 'practical' | 'definitional';
  strength: 'strong' | 'moderate' | 'weak';
  targetElement: 'claim' | 'grounds' | 'warrant' | 'backing';
  targetId: string;
  response?: RebuttalResponse;
}

/**
 * Response to a rebuttal
 */
export interface RebuttalResponse {
  strategy: 'refute' | 'concede' | 'qualify' | 'reframe' | 'outweigh';
  content: string;
  effectiveness: number;         // 0-1
}

// ===== ARGUMENT STRUCTURE INTERFACES =====

/**
 * Complete Toulmin argument structure
 */
export interface ToulminArgument {
  id: string;
  name?: string;
  claim: Claim;
  grounds: Grounds[];
  warrants: Warrant[];
  backings: Backing[];
  qualifiers: Qualifier[];
  rebuttals: Rebuttal[];
  overallStrength: number;       // 0-1
  validity: 'valid' | 'invalid' | 'questionable';
  soundness: 'sound' | 'unsound' | 'questionable';
}

/**
 * Argument chain - linked arguments building to conclusion
 */
export interface ArgumentChain {
  id: string;
  arguments: ToulminArgument[];  // Ordered sequence
  finalClaim: Claim;
  chainStrength: number;         // 0-1
  weakestLink?: string;          // ID of weakest argument
}

// ===== DIALECTIC INTERFACES =====

/**
 * Dialectic position in thesis-antithesis-synthesis
 */
export interface DialecticPosition {
  id: string;
  role: 'thesis' | 'antithesis' | 'synthesis';
  statement: string;
  proponents?: string[];         // Scholars/sources advocating this
  arguments: ToulminArgument[];
  strengths: string[];
  weaknesses: string[];
}

/**
 * Dialectic analysis structure
 */
export interface DialecticAnalysis {
  id: string;
  topic: string;
  thesis: DialecticPosition;
  antithesis: DialecticPosition;
  synthesis?: DialecticPosition;
  resolution: 'thesis_prevails' | 'antithesis_prevails' | 'synthesis_achieved' | 'unresolved';
  resolutionReasoning: string;
}

// ===== RHETORICAL INTERFACES =====

/**
 * Rhetorical appeal types (Aristotelian)
 */
export type RhetoricalAppeal = 'ethos' | 'pathos' | 'logos';

/**
 * Rhetorical strategy employed
 */
export interface RhetoricalStrategy {
  id: string;
  appeal: RhetoricalAppeal;
  technique: string;             // e.g., "appeal to authority", "emotional narrative"
  content: string;
  effectiveness: number;         // 0-1
  appropriateness: 'appropriate' | 'questionable' | 'inappropriate';
  context: string;
}

/**
 * Audience consideration for argument
 */
export interface AudienceConsideration {
  targetAudience: string;
  sharedAssumptions: string[];
  potentialResistance: string[];
  persuasionStrategy: string;
}

// ===== FALLACY DETECTION =====

/**
 * Logical fallacy identified
 */
export interface LogicalFallacy {
  id: string;
  name: string;                  // e.g., "ad hominem", "straw man"
  category: 'formal' | 'informal';
  description: string;
  location: string;              // Where in the argument
  severity: 'critical' | 'significant' | 'minor';
  correction?: string;
}

// ===== MAIN THOUGHT INTERFACE =====

/**
 * Argumentation reasoning thought
 */
export interface ArgumentationThought extends BaseThought {
  mode: ThinkingMode.ARGUMENTATION;
  thoughtType: ArgumentationThoughtType;

  // Toulmin model elements
  claims?: Claim[];
  currentClaim?: Claim;
  grounds?: Grounds[];
  warrants?: Warrant[];
  backings?: Backing[];
  qualifiers?: Qualifier[];
  rebuttals?: Rebuttal[];

  // Complete arguments
  arguments?: ToulminArgument[];
  currentArgument?: ToulminArgument;
  argumentChain?: ArgumentChain;

  // Dialectic analysis
  dialectic?: DialecticAnalysis;

  // Rhetorical elements
  rhetoricalStrategies?: RhetoricalStrategy[];
  audienceConsideration?: AudienceConsideration;

  // Quality checks
  fallacies?: LogicalFallacy[];
  argumentStrength: number;      // 0-1

  // Standard fields
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}

// ===== TYPE GUARD =====

/**
 * Type guard for ArgumentationThought
 */
export function isArgumentationThought(thought: BaseThought): thought is ArgumentationThought {
  return thought.mode === 'argumentation';
}
