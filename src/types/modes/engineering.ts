/**
 * Engineering Thought Type (v7.1.0)
 * Phase 10: Engineering reasoning mode for structured design analysis
 *
 * Supports four key engineering analysis patterns:
 * - Requirements Traceability: Track requirements from source to verification
 * - Trade Studies: Weighted decision matrices for alternative selection
 * - Failure Mode Analysis (FMEA): Risk assessment and mitigation
 * - Design Decision Records: Document decisions with rationale
 */

import { ThinkingMode, type BaseThought } from '../core.js';

// =============================================================================
// Requirements Traceability
// =============================================================================

/**
 * Requirement priority levels (MoSCoW method)
 */
export type RequirementPriority = 'must' | 'should' | 'could' | 'wont';

/**
 * Requirement source types
 */
export type RequirementSource =
  | 'stakeholder'
  | 'regulatory'
  | 'standard'
  | 'derived'
  | 'assumption'
  | 'constraint';

/**
 * Requirement status
 */
export type RequirementStatus =
  | 'draft'
  | 'approved'
  | 'implemented'
  | 'verified'
  | 'deferred'
  | 'rejected';

/**
 * A single requirement with traceability information
 */
export interface Requirement {
  /** Unique requirement identifier (e.g., REQ-001) */
  id: string;
  /** Short title */
  title: string;
  /** Detailed description */
  description: string;
  /** Source of the requirement */
  source: RequirementSource;
  /** Priority level */
  priority: RequirementPriority;
  /** Current status */
  status: RequirementStatus;
  /** Rationale for the requirement */
  rationale?: string;
  /** How the requirement will be verified */
  verificationMethod?: 'inspection' | 'analysis' | 'demonstration' | 'test';
  /** Specific verification criteria */
  verificationCriteria?: string[];
  /** Parent requirement IDs (traces to) */
  tracesTo?: string[];
  /** Design elements that satisfy this requirement */
  satisfiedBy?: string[];
  /** Related requirements */
  relatedTo?: string[];
}

/**
 * Requirements traceability matrix
 */
export interface RequirementsTraceability {
  /** All requirements in the analysis */
  requirements: Requirement[];
  /** Coverage metrics */
  coverage: {
    /** Total requirements count */
    total: number;
    /** Requirements with verification defined */
    verified: number;
    /** Requirements traced to source */
    tracedToSource: number;
    /** Requirements allocated to design */
    allocatedToDesign: number;
  };
}

// =============================================================================
// Trade Study
// =============================================================================

/**
 * An alternative option in a trade study
 */
export interface TradeAlternative {
  /** Unique identifier */
  id: string;
  /** Name of the alternative */
  name: string;
  /** Description of the alternative */
  description: string;
  /** Pros of this alternative */
  pros?: string[];
  /** Cons of this alternative */
  cons?: string[];
  /** Cost estimate (optional) */
  estimatedCost?: number;
  /** Risk level */
  riskLevel?: 'low' | 'medium' | 'high';
}

/**
 * A criterion for evaluating alternatives
 */
export interface TradeCriterion {
  /** Unique identifier */
  id: string;
  /** Name of the criterion */
  name: string;
  /** Description of what this criterion measures */
  description?: string;
  /** Weight (0-1, sum should equal 1) */
  weight: number;
  /** Unit of measurement (optional) */
  unit?: string;
  /** Whether higher scores are better */
  higherIsBetter?: boolean;
}

/**
 * A score for an alternative against a criterion
 */
export interface TradeScore {
  /** Alternative being scored */
  alternativeId: string;
  /** Criterion being evaluated */
  criteriaId: string;
  /** Raw score (typically 1-10 or 1-5) */
  score: number;
  /** Weighted score (score * weight) */
  weightedScore?: number;
  /** Rationale for this score */
  rationale: string;
}

/**
 * Complete trade study analysis
 */
export interface TradeStudy {
  /** Title of the trade study */
  title: string;
  /** Objective of the study */
  objective: string;
  /** Alternatives being compared */
  alternatives: TradeAlternative[];
  /** Evaluation criteria */
  criteria: TradeCriterion[];
  /** Scores for each alternative-criterion pair */
  scores: TradeScore[];
  /** Recommended alternative ID */
  recommendation: string;
  /** Justification for the recommendation */
  justification: string;
  /** Sensitivity analysis notes */
  sensitivityNotes?: string;
}

// =============================================================================
// Failure Mode Analysis (FMEA)
// =============================================================================

/**
 * Severity rating descriptions (1-10 scale)
 * 1: No effect
 * 2-3: Minor effect
 * 4-6: Moderate effect
 * 7-8: High effect
 * 9-10: Hazardous/Critical
 */
export type SeverityRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Occurrence rating (1-10 scale)
 * 1: Remote (failure unlikely)
 * 2-3: Low (few failures)
 * 4-6: Moderate (occasional failures)
 * 7-8: High (frequent failures)
 * 9-10: Very High (failure almost inevitable)
 */
export type OccurrenceRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Detection rating (1-10 scale)
 * 1: Almost certain detection
 * 2-3: High detection probability
 * 4-6: Moderate detection probability
 * 7-8: Low detection probability
 * 9-10: Almost impossible to detect
 */
export type DetectionRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * A single failure mode entry
 */
export interface FailureMode {
  /** Unique identifier */
  id: string;
  /** Component or subsystem */
  component: string;
  /** Function of the component */
  function?: string;
  /** Description of the failure mode */
  failureMode: string;
  /** Potential cause(s) of failure */
  cause: string;
  /** Effect of the failure */
  effect: string;
  /** Effect on system level */
  systemEffect?: string;
  /** Severity rating (1-10) */
  severity: SeverityRating;
  /** Occurrence rating (1-10) */
  occurrence: OccurrenceRating;
  /** Detection rating (1-10) */
  detection: DetectionRating;
  /** Risk Priority Number (S × O × D) */
  rpn: number;
  /** Current controls in place */
  currentControls?: string;
  /** Recommended mitigation action */
  mitigation?: string;
  /** Responsible party for mitigation */
  responsible?: string;
  /** Target completion date */
  targetDate?: string;
  /** Status of mitigation */
  mitigationStatus?: 'open' | 'in-progress' | 'completed' | 'verified';
}

/**
 * Complete FMEA analysis
 */
export interface FailureModeAnalysis {
  /** Title of the FMEA */
  title: string;
  /** System or product being analyzed */
  system: string;
  /** All failure modes identified */
  failureModes: FailureMode[];
  /** RPN threshold for action required */
  rpnThreshold: number;
  /** Summary statistics */
  summary: {
    /** Total failure modes */
    totalModes: number;
    /** Modes above RPN threshold */
    criticalModes: number;
    /** Average RPN */
    averageRpn: number;
    /** Highest RPN */
    maxRpn: number;
  };
}

// =============================================================================
// Design Decision Records (ADR-style)
// =============================================================================

/**
 * Status of a design decision
 */
export type DecisionStatus =
  | 'proposed'
  | 'accepted'
  | 'rejected'
  | 'deprecated'
  | 'superseded';

/**
 * An alternative considered in the decision
 */
export interface DecisionAlternative {
  /** Name of the option */
  option: string;
  /** Description of the option */
  description?: string;
  /** Pros of this option */
  pros: string[];
  /** Cons of this option */
  cons: string[];
}

/**
 * A design decision record
 */
export interface DesignDecision {
  /** Unique identifier (e.g., ADR-001) */
  id: string;
  /** Decision title */
  title: string;
  /** Date of the decision */
  date?: string;
  /** Current status */
  status: DecisionStatus;
  /** Context and problem statement */
  context: string;
  /** The decision made */
  decision: string;
  /** Alternatives considered */
  alternatives: DecisionAlternative[];
  /** Rationale for the decision */
  rationale: string;
  /** Consequences of the decision */
  consequences: string[];
  /** If superseded, reference to new decision */
  supersededBy?: string;
  /** Related decisions */
  relatedDecisions?: string[];
  /** Stakeholders involved */
  stakeholders?: string[];
}

/**
 * Collection of design decisions
 */
export interface DesignDecisionLog {
  /** All design decisions */
  decisions: DesignDecision[];
  /** Project or system name */
  projectName?: string;
}

// =============================================================================
// Engineering Thought
// =============================================================================

/**
 * Engineering analysis type being performed
 */
export type EngineeringAnalysisType =
  | 'requirements'
  | 'trade-study'
  | 'fmea'
  | 'design-decision'
  | 'comprehensive';

/**
 * Engineering Thought - combines all engineering analysis patterns
 */
export interface EngineeringThought extends BaseThought {
  mode: ThinkingMode.ENGINEERING;

  /** Type of engineering analysis */
  analysisType: EngineeringAnalysisType;

  /** Problem or design challenge being addressed */
  designChallenge: string;

  /** Requirements traceability (optional) */
  requirements?: RequirementsTraceability;

  /** Trade study analysis (optional) */
  tradeStudy?: TradeStudy;

  /** Failure mode analysis (optional) */
  fmea?: FailureModeAnalysis;

  /** Design decisions (optional) */
  designDecisions?: DesignDecisionLog;

  /** Overall engineering assessment */
  assessment?: {
    /** Confidence in the analysis */
    confidence: number;
    /** Key risks identified */
    keyRisks: string[];
    /** Recommended next steps */
    nextSteps: string[];
    /** Open issues */
    openIssues: string[];
  };
}

// =============================================================================
// Type Guard
// =============================================================================

/**
 * Type guard for EngineeringThought
 */
export function isEngineeringThought(thought: unknown): thought is EngineeringThought {
  return (
    typeof thought === 'object' &&
    thought !== null &&
    'mode' in thought &&
    (thought as EngineeringThought).mode === ThinkingMode.ENGINEERING &&
    'analysisType' in thought &&
    'designChallenge' in thought
  );
}
