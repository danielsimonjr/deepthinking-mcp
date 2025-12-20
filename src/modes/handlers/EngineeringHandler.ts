/**
 * EngineeringHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Engineering reasoning mode with:
 * - Requirements traceability validation
 * - Trade study matrix evaluation
 * - FMEA (Failure Mode Effects Analysis) support
 * - Design decision record tracking (ADR-style)
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import type { EngineeringThought, EngineeringAnalysisType } from '../../types/modes/engineering.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * Valid engineering analysis types
 */
const VALID_ANALYSIS_TYPES: EngineeringAnalysisType[] = [
  'requirements',
  'trade-study',
  'fmea',
  'design-decision',
  'comprehensive',
];

/**
 * EngineeringHandler - Specialized handler for engineering reasoning
 *
 * Provides:
 * - Requirements traceability matrix support
 * - Weighted trade study evaluation
 * - Risk Priority Number (RPN) calculation for FMEA
 * - Architecture Decision Record management
 */
export class EngineeringHandler implements ModeHandler {
  readonly mode = ThinkingMode.ENGINEERING;
  readonly modeName = 'Engineering Analysis';
  readonly description = 'Structured engineering analysis with requirements, trade studies, FMEA, and ADRs';

  /**
   * Supported thought types for engineering mode
   */
  private readonly supportedThoughtTypes = [
    'requirements_analysis',
    'trade_study',
    'fmea_analysis',
    'design_decision',
    'risk_assessment',
    'traceability',
    'verification',
  ];

  /**
   * Create an engineering thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): EngineeringThought {
    const inputAny = input as any;

    // Resolve analysis type
    const analysisType = this.resolveAnalysisType(inputAny.analysisType);

    // Process requirements traceability
    const requirements = inputAny.requirements
      ? this.processRequirements(inputAny.requirements)
      : undefined;

    // Process trade study
    const tradeStudy = inputAny.tradeStudy
      ? this.processTradeStudy(inputAny.tradeStudy)
      : undefined;

    // Process FMEA
    const fmea = inputAny.fmea
      ? this.processFMEA(inputAny.fmea)
      : undefined;

    // Process design decisions
    const designDecisions = inputAny.designDecisions
      ? this.processDesignDecisions(inputAny.designDecisions)
      : undefined;

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.ENGINEERING,

      // Core engineering fields
      analysisType,
      designChallenge: inputAny.designChallenge || '',
      requirements,
      tradeStudy,
      fmea,
      designDecisions,
      assessment: inputAny.assessment,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate engineering-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: { field: string; message: string; code: string }[] = [];
    const warnings: ReturnType<typeof createValidationWarning>[] = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate analysis type
    if (inputAny.analysisType && !VALID_ANALYSIS_TYPES.includes(inputAny.analysisType)) {
      warnings.push(
        createValidationWarning(
          'analysisType',
          `Unknown analysis type: ${inputAny.analysisType}`,
          `Valid types: ${VALID_ANALYSIS_TYPES.join(', ')}`
        )
      );
    }

    // Validate design challenge is specified
    if (!inputAny.designChallenge || inputAny.designChallenge.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          'designChallenge',
          'No design challenge specified',
          'Describe the problem or design challenge being addressed'
        )
      );
    }

    // Validate trade study if provided
    if (inputAny.tradeStudy) {
      const tsValidation = this.validateTradeStudy(inputAny.tradeStudy);
      warnings.push(...tsValidation);
    }

    // Validate FMEA if provided
    if (inputAny.fmea) {
      const fmeaValidation = this.validateFMEA(inputAny.fmea);
      warnings.push(...fmeaValidation);
    }

    // Suggest appropriate analysis based on content
    if (!inputAny.tradeStudy && !inputAny.fmea && !inputAny.requirements && !inputAny.designDecisions) {
      warnings.push(
        createValidationWarning(
          'analysis',
          'No structured analysis provided',
          'Include requirements, trade study, FMEA, or design decisions for comprehensive engineering analysis'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get engineering-specific enhancements
   */
  getEnhancements(thought: EngineeringThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.ALGORITHMIC, ThinkingMode.SYSTEMSTHINKING, ThinkingMode.OPTIMIZATION],
      guidingQuestions: [],
      warnings: [],
      metrics: {},
      mentalModels: [
        'Systems Engineering V-Model',
        'Trade Study Matrix',
        'FMEA Risk Priority',
        'Architecture Decision Records',
        'Requirements Traceability',
      ],
    };

    // Analysis type-specific guidance
    switch (thought.analysisType) {
      case 'requirements':
        enhancements.guidingQuestions!.push(
          'Are all requirements traceable to source?',
          'What verification method will be used for each requirement?',
          'Are there any conflicting requirements?'
        );
        if (thought.requirements) {
          enhancements.metrics!.totalRequirements = thought.requirements.requirements.length;
          const coverage = thought.requirements.coverage;
          if (coverage) {
            enhancements.metrics!.coverageTotal = coverage.total;
            enhancements.metrics!.coverageVerified = coverage.verified;
          }
        }
        break;

      case 'trade-study':
        enhancements.guidingQuestions!.push(
          'Do criteria weights sum to 1.0?',
          'Are all alternatives fairly scored?',
          'Is sensitivity analysis needed?'
        );
        if (thought.tradeStudy) {
          enhancements.metrics!.alternativeCount = thought.tradeStudy.alternatives.length;
          enhancements.metrics!.criteriaCount = thought.tradeStudy.criteria.length;
          enhancements.suggestions!.push(
            `Recommendation: ${thought.tradeStudy.recommendation}`
          );
        }
        break;

      case 'fmea':
        enhancements.guidingQuestions!.push(
          'Are all failure modes identified?',
          'Are RPN values accurately calculated?',
          'Do high-RPN items have mitigation plans?'
        );
        if (thought.fmea) {
          const fmea = thought.fmea;
          enhancements.metrics!.totalModes = fmea.summary.totalModes;
          enhancements.metrics!.criticalModes = fmea.summary.criticalModes;
          enhancements.metrics!.maxRPN = fmea.summary.maxRpn;
          enhancements.metrics!.avgRPN = fmea.summary.averageRpn;

          if (fmea.summary.criticalModes > 0) {
            enhancements.warnings!.push(
              `${fmea.summary.criticalModes} failure mode(s) exceed RPN threshold of ${fmea.rpnThreshold}`
            );
          }
        }
        break;

      case 'design-decision':
        enhancements.guidingQuestions!.push(
          'Have all alternatives been considered?',
          'Are consequences documented?',
          'Who are the stakeholders affected?'
        );
        if (thought.designDecisions) {
          enhancements.metrics!.decisionCount = thought.designDecisions.decisions.length;
          const accepted = thought.designDecisions.decisions.filter(d => d.status === 'accepted').length;
          enhancements.metrics!.acceptedDecisions = accepted;
        }
        break;

      case 'comprehensive':
        enhancements.suggestions!.push(
          'Comprehensive analysis covers all engineering artifacts'
        );
        enhancements.guidingQuestions!.push(
          'Are all analysis types appropriately addressed?',
          'Is the design challenge fully characterized?'
        );
        break;
    }

    // Assessment analysis
    if (thought.assessment) {
      enhancements.metrics!.confidence = thought.assessment.confidence;
      enhancements.metrics!.riskCount = thought.assessment.keyRisks.length;
      enhancements.metrics!.openIssues = thought.assessment.openIssues.length;

      if (thought.assessment.confidence < 0.6) {
        enhancements.warnings!.push(
          'Low confidence - consider gathering more data or conducting additional analysis'
        );
      }

      if (thought.assessment.keyRisks.length > 0) {
        enhancements.suggestions!.push(
          `Key risks identified: ${thought.assessment.keyRisks.length}`
        );
      }
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }

  /**
   * Resolve analysis type from input
   */
  private resolveAnalysisType(inputType: string | undefined): EngineeringAnalysisType {
    if (inputType && VALID_ANALYSIS_TYPES.includes(inputType as EngineeringAnalysisType)) {
      return inputType as EngineeringAnalysisType;
    }
    return 'comprehensive';
  }

  /**
   * Process requirements traceability
   */
  private processRequirements(raw: any): any {
    if (!raw.requirements) {
      return { requirements: [], coverage: { total: 0, verified: 0, tracedToSource: 0, allocatedToDesign: 0 } };
    }

    const requirements = raw.requirements.map((req: any) => ({
      id: req.id || `REQ-${randomUUID().slice(0, 8)}`,
      title: req.title || '',
      description: req.description || '',
      source: req.source || 'derived',
      priority: req.priority || 'should',
      status: req.status || 'draft',
      rationale: req.rationale,
      verificationMethod: req.verificationMethod,
      verificationCriteria: req.verificationCriteria || [],
      tracesTo: req.tracesTo || [],
      satisfiedBy: req.satisfiedBy || [],
      relatedTo: req.relatedTo || [],
    }));

    const coverage = raw.coverage || this.calculateCoverage(requirements);

    return { requirements, coverage };
  }

  /**
   * Calculate requirements coverage
   */
  private calculateCoverage(requirements: any[]): any {
    return {
      total: requirements.length,
      verified: requirements.filter((r: any) => r.verificationMethod).length,
      tracedToSource: requirements.filter((r: any) => r.tracesTo && r.tracesTo.length > 0).length,
      allocatedToDesign: requirements.filter((r: any) => r.satisfiedBy && r.satisfiedBy.length > 0).length,
    };
  }

  /**
   * Process trade study
   */
  private processTradeStudy(raw: any): any {
    const scores = raw.scores || [];

    // Calculate weighted scores
    const criteriaWeights: Record<string, number> = {};
    (raw.criteria || []).forEach((c: any) => {
      criteriaWeights[c.id] = c.weight || 0;
    });

    const enhancedScores = scores.map((s: any) => ({
      ...s,
      weightedScore: (s.score || 0) * (criteriaWeights[s.criteriaId] || 0),
    }));

    return {
      title: raw.title || '',
      objective: raw.objective || '',
      alternatives: raw.alternatives || [],
      criteria: raw.criteria || [],
      scores: enhancedScores,
      recommendation: raw.recommendation || '',
      justification: raw.justification || '',
      sensitivityNotes: raw.sensitivityNotes,
    };
  }

  /**
   * Process FMEA
   */
  private processFMEA(raw: any): any {
    const failureModes = (raw.failureModes || []).map((fm: any) => ({
      ...fm,
      rpn: (fm.severity || 1) * (fm.occurrence || 1) * (fm.detection || 1),
    }));

    const rpnThreshold = raw.rpnThreshold || 100;
    const rpnValues = failureModes.map((fm: any) => fm.rpn);

    return {
      title: raw.title || '',
      system: raw.system || '',
      failureModes,
      rpnThreshold,
      summary: {
        totalModes: failureModes.length,
        criticalModes: failureModes.filter((fm: any) => fm.rpn > rpnThreshold).length,
        averageRpn: rpnValues.length > 0 ? rpnValues.reduce((a: number, b: number) => a + b, 0) / rpnValues.length : 0,
        maxRpn: rpnValues.length > 0 ? Math.max(...rpnValues) : 0,
      },
    };
  }

  /**
   * Process design decisions
   */
  private processDesignDecisions(raw: any): any {
    return {
      decisions: (raw.decisions || []).map((d: any) => ({
        id: d.id || `ADR-${randomUUID().slice(0, 8)}`,
        title: d.title || '',
        date: d.date,
        status: d.status || 'proposed',
        context: d.context || '',
        decision: d.decision || '',
        alternatives: d.alternatives || [],
        rationale: d.rationale || '',
        consequences: d.consequences || [],
        supersededBy: d.supersededBy,
        relatedDecisions: d.relatedDecisions || [],
        stakeholders: d.stakeholders || [],
      })),
      projectName: raw.projectName,
    };
  }

  /**
   * Validate trade study
   */
  private validateTradeStudy(tradeStudy: any): any[] {
    const warnings = [];

    // Check criteria weights sum to 1
    const weights = (tradeStudy.criteria || []).map((c: any) => c.weight || 0);
    const totalWeight = weights.reduce((a: number, b: number) => a + b, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      warnings.push(
        createValidationWarning(
          'tradeStudy.criteria',
          `Criteria weights sum to ${totalWeight.toFixed(2)}, should be 1.0`,
          'Adjust weights to sum to 1.0 for proper weighted scoring'
        )
      );
    }

    // Check for missing scores
    const altIds = (tradeStudy.alternatives || []).map((a: any) => a.id);
    const critIds = (tradeStudy.criteria || []).map((c: any) => c.id);
    const scoreKeys = (tradeStudy.scores || []).map(
      (s: any) => `${s.alternativeId}-${s.criteriaId}`
    );

    const expectedScores = altIds.flatMap((altId: string) =>
      critIds.map((critId: string) => `${altId}-${critId}`)
    );

    const missingScores = expectedScores.filter((key: string) => !scoreKeys.includes(key));
    if (missingScores.length > 0) {
      warnings.push(
        createValidationWarning(
          'tradeStudy.scores',
          `${missingScores.length} score(s) missing`,
          'Ensure all alternative-criterion pairs are scored'
        )
      );
    }

    return warnings;
  }

  /**
   * Validate FMEA
   */
  private validateFMEA(fmea: any): any[] {
    const warnings = [];

    const failureModes = fmea.failureModes || [];

    // Check for high-RPN items without mitigation
    const rpnThreshold = fmea.rpnThreshold || 100;
    const highRpnNoMitigation = failureModes.filter(
      (fm: any) => fm.rpn > rpnThreshold && !fm.mitigation
    );

    if (highRpnNoMitigation.length > 0) {
      warnings.push(
        createValidationWarning(
          'fmea.failureModes',
          `${highRpnNoMitigation.length} high-RPN failure mode(s) lack mitigation plans`,
          'Document mitigation actions for all critical failure modes'
        )
      );
    }

    // Check for invalid S/O/D ratings
    const invalidRatings = failureModes.filter(
      (fm: any) =>
        fm.severity < 1 || fm.severity > 10 ||
        fm.occurrence < 1 || fm.occurrence > 10 ||
        fm.detection < 1 || fm.detection > 10
    );

    if (invalidRatings.length > 0) {
      warnings.push(
        createValidationWarning(
          'fmea.failureModes',
          `${invalidRatings.length} failure mode(s) have invalid S/O/D ratings`,
          'Severity, Occurrence, and Detection must be 1-10'
        )
      );
    }

    return warnings;
  }
}
