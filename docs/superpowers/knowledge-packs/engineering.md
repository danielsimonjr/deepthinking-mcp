# Knowledge Pack: engineering

**Mode**: `engineering`
**Category skill**: `think-engineering`
**Source doc**: `docs/modes/ENGINEERING.md`

## Overview

Engineering mode provides **structured design analysis** using four key engineering patterns:

1. **Requirements Traceability** - Track requirements from source to verification
2. **Trade Studies** - Weighted decision matrices for alternative selection
3. **Failure Mode Analysis (FMEA)** - Risk assessment and mitigation
4. **Design Decision Records (ADR)** - Document decisions with rationale

This mode captures systematic engineering practices for rigorous design and analysis.

## When to Use

Use engineering mode when you need to:

- **Track requirements** - Ensure all requirements are addressed
- **Compare alternatives** - Systematic decision-making
- **Analyze failure modes** - Risk identification and mitigation
- **Document decisions** - Capture rationale for design choices

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

```typescript
interface EngineeringThought extends BaseThought {
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
}
```

## Supporting Interfaces

```typescript
interface Requirement {
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

interface RequirementsTraceability {
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
}

interface TradeAlternative {
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

interface TradeCriterion {
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

interface TradeScore {
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

interface TradeStudy {
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

interface FailureMode {
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

interface FailureModeAnalysis {
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
}

```

## Worked Example (from source doc)

```typescript
// Requirements analysis
const requirements = await deepthinking_engineering({
  mode: 'engineering',
  thought: 'Define system requirements for the authentication module',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  analysisType: 'requirements',
  designChallenge: 'Secure user authentication system',
  requirements: {
    requirements: [
      {
        id: 'REQ-001',
        title: 'Multi-factor authentication',
        description: 'System shall support MFA with at least 2 factors',
        source: 'regulatory',
        priority: 'must',
        status: 'approved',
        verificationMethod: 'test',
        verificationCriteria: ['TOTP supported', 'SMS fallback available']
      },
      {
        id: 'REQ-002',
        title: 'Session timeout',
        description: 'Sessions shall expire after 30 minutes of inactivity',
        source: 'stakeholder',
        priority: 'should',
        status: 'approved',
        verificationMethod: 'test'
      }
    ],
    coverage: {
      total: 10,
      verified: 6,
      tracedToSource: 9,
      allocatedToDesign: 8
    }
  }
});

// Trade study
const tradeStudy = await deepthinking_engineering({
  mode: 'engineering',
  thought: 'Compare authentication providers',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  analysisType: 'trade-study',
  designChallenge: 'Select authentication provider',
  tradeStudy: {
    title: 'Authentication Provider Selection',
    objective: 'Choose the best authentication provider for our needs',
    alternatives: [
      { id: 'auth0', name: 'Auth0', description: 'Managed identity platform', pros: ['Easy integration', 'Rich features'], cons: ['Cost at scale'] },
      { id: 'keycloak', name: 'Keycloak', description: 'Open source IAM', pros: ['Free', 'Self-hosted'], cons: ['Maintenance burden'] },
      { id: 'custom', name: 'Custom', description: 'Build in-house', pros: ['Full control'], cons: ['Development time', 'Security risk'] }
    ],
    criteria: [
      { id: 'security', name: 'Security', weight: 0.35, description: 'Security posture' },
      { id: 'cost', name: 'Cost', weight: 0.25, description: 'Total cost of ownership' },
      { id: 'integration', name: 'Integration', weight: 0.25, description: 'Ease of integration' },
      { id: 'support', name: 'Support', weight: 0.15, description: 'Vendor support' }
    ],
    scores: [
      { alternativeId: 'auth0', criteriaId: 'security', score: 9, rationale: 'SOC2, ext

---

*Generated by RLM extraction pass on 2026-04-12*
