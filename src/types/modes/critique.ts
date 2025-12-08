/**
 * Critique Mode - Type Definitions (Phase 13 v7.4.0)
 * Critical analysis and evaluation of academic work, methodologies, and arguments
 * Designed for peer review, literature critique, and scholarly evaluation
 */

import { BaseThought, ThinkingMode } from '../core.js';

// ===== CRITIQUE THOUGHT TYPES =====

/**
 * Types of critique reasoning steps
 */
export type CritiqueThoughtType =
  | 'work_characterization'      // Characterize the work being critiqued
  | 'methodology_evaluation'     // Evaluate research methodology
  | 'argument_analysis'          // Analyze logical structure of arguments
  | 'evidence_assessment'        // Assess quality and use of evidence
  | 'contribution_evaluation'    // Evaluate scholarly contribution
  | 'limitation_identification'  // Identify limitations and weaknesses
  | 'strength_recognition'       // Recognize strengths and merits
  | 'improvement_suggestion';    // Suggest improvements

// ===== WORK CHARACTERIZATION =====

/**
 * Type of academic work being critiqued
 */
export type WorkType =
  | 'empirical_study'
  | 'theoretical_paper'
  | 'review_article'
  | 'meta_analysis'
  | 'case_study'
  | 'methodology_paper'
  | 'position_paper'
  | 'commentary'
  | 'replication_study'
  | 'mixed_methods'
  | 'book'
  | 'thesis';

/**
 * Work being critiqued
 */
export interface CritiquedWork {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: WorkType;
  venue?: string;
  field: string;
  subfield?: string;
  claimedContribution: string;
  researchQuestion?: string;
  abstract?: string;
}

// ===== METHODOLOGY EVALUATION =====

/**
 * Research design assessment
 */
export interface DesignAssessment {
  designType: string;            // e.g., "randomized controlled trial", "case study"
  appropriateness: 'appropriate' | 'somewhat_appropriate' | 'inappropriate';
  justification: string;
  alternatives?: string[];
  rating: number;                // 0-1
}

/**
 * Sample/data assessment
 */
export interface SampleAssessment {
  sampleSize?: number;
  sampleType: string;
  representativeness: 'representative' | 'limited' | 'biased' | 'unclear';
  selectionMethod?: string;
  adequacy: 'adequate' | 'marginal' | 'inadequate';
  concerns: string[];
  rating: number;                // 0-1
}

/**
 * Analysis method assessment
 */
export interface AnalysisAssessment {
  methods: string[];
  appropriateness: 'appropriate' | 'somewhat_appropriate' | 'inappropriate';
  rigor: 'rigorous' | 'adequate' | 'inadequate';
  transparency: 'transparent' | 'partial' | 'opaque';
  reproducibility: 'reproducible' | 'partially' | 'not_reproducible';
  concerns: string[];
  rating: number;                // 0-1
}

/**
 * Complete methodology evaluation
 */
export interface MethodologyEvaluation {
  id: string;
  design: DesignAssessment;
  sample: SampleAssessment;
  analysis: AnalysisAssessment;
  validity: ValidityAssessment;
  overallRating: number;         // 0-1
  majorConcerns: string[];
  minorConcerns: string[];
}

// ===== VALIDITY ASSESSMENT =====

/**
 * Types of validity
 */
export interface ValidityAssessment {
  internal: {
    rating: number;              // 0-1
    threats: string[];
    mitigations: string[];
  };
  external: {
    rating: number;
    generalizability: string;
    limitations: string[];
  };
  construct: {
    rating: number;
    operationalization: string;
    concerns: string[];
  };
  statistical?: {
    rating: number;
    powerAnalysis: boolean;
    effectSizes: boolean;
    concerns: string[];
  };
}

// ===== ARGUMENT CRITIQUE =====

/**
 * Logical structure assessment
 */
export interface LogicalStructure {
  premises: {
    stated: string[];
    unstated: string[];
    questionable: string[];
  };
  conclusions: {
    main: string;
    supporting: string[];
    overreaching?: string[];
  };
  inferentialGaps: string[];
  circularReasoning: boolean;
  overallCoherence: number;      // 0-1
}

/**
 * Argument critique
 */
export interface ArgumentCritique {
  id: string;
  logicalStructure: LogicalStructure;
  fallaciesIdentified: {
    name: string;
    location: string;
    severity: 'critical' | 'significant' | 'minor';
  }[];
  unsupportedClaims: string[];
  overinterpretations: string[];
  strengths: string[];
  rating: number;                // 0-1
}

// ===== EVIDENCE CRITIQUE =====

/**
 * Evidence quality assessment
 */
export interface EvidenceQuality {
  type: 'primary' | 'secondary' | 'tertiary';
  reliability: number;           // 0-1
  validity: number;              // 0-1
  relevance: number;             // 0-1
  sufficiency: number;           // 0-1
  concerns: string[];
}

/**
 * Evidence use assessment
 */
export interface EvidenceUseCritique {
  id: string;
  evidenceProvided: {
    description: string;
    quality: EvidenceQuality;
  }[];
  evidenceMissing: string[];
  cherryPicking: boolean;
  misrepresentation: string[];
  appropriateCitations: boolean;
  overallRating: number;         // 0-1
}

// ===== CONTRIBUTION ASSESSMENT =====

/**
 * Novelty assessment
 */
export interface NoveltyAssessment {
  theoreticalNovelty: number;    // 0-1
  methodologicalNovelty: number;
  empiricalNovelty: number;
  overallNovelty: number;
  comparisonToExisting: string;
  incrementalOrTransformative: 'incremental' | 'significant' | 'transformative';
}

/**
 * Impact assessment
 */
export interface ImpactAssessment {
  potentialImpact: 'high' | 'moderate' | 'low';
  targetAudience: string[];
  practicalImplications: string[];
  theoreticalImplications: string[];
  limitations: string[];
}

/**
 * Complete contribution evaluation
 */
export interface ContributionEvaluation {
  id: string;
  novelty: NoveltyAssessment;
  impact: ImpactAssessment;
  clarity: number;               // 0-1 how clearly contribution is stated
  significance: 'major' | 'moderate' | 'minor' | 'unclear';
  positionInLiterature: string;
}

// ===== CRITIQUE RESULTS =====

/**
 * Individual critique point
 */
export interface CritiquePoint {
  id: string;
  type: 'strength' | 'weakness' | 'concern' | 'suggestion';
  category: 'methodology' | 'argument' | 'evidence' | 'contribution' | 'writing' | 'ethics';
  severity: 'critical' | 'major' | 'minor' | 'neutral';
  description: string;
  location?: string;             // Where in the work
  recommendation?: string;
  evidence?: string;
}

/**
 * Improvement suggestion
 */
export interface ImprovementSuggestion {
  id: string;
  area: string;
  current: string;
  suggested: string;
  rationale: string;
  priority: 'essential' | 'recommended' | 'optional';
  feasibility: 'easy' | 'moderate' | 'difficult';
}

/**
 * Overall critique verdict
 */
export interface CritiqueVerdict {
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  confidence: number;            // 0-1
  summary: string;
  majorStrengths: string[];
  majorWeaknesses: string[];
  keyImprovements: string[];
}

// ===== MAIN THOUGHT INTERFACE =====

/**
 * Critique reasoning thought
 */
export interface CritiqueThought extends BaseThought {
  mode: ThinkingMode.CRITIQUE;
  thoughtType: CritiqueThoughtType;

  // Work being critiqued
  work: CritiquedWork;

  // Evaluation components
  methodologyEvaluation?: MethodologyEvaluation;
  argumentCritique?: ArgumentCritique;
  evidenceCritique?: EvidenceUseCritique;
  contributionEvaluation?: ContributionEvaluation;

  // Critique results
  critiquePoints: CritiquePoint[];
  improvements?: ImprovementSuggestion[];
  verdict?: CritiqueVerdict;

  // Balance indicators
  strengthsIdentified: number;
  weaknessesIdentified: number;
  balanceRatio: number;          // Aim for balanced critique

  // Standard fields
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}

// ===== TYPE GUARD =====

/**
 * Type guard for CritiqueThought
 */
export function isCritiqueThought(thought: BaseThought): thought is CritiqueThought {
  return thought.mode === 'critique';
}
