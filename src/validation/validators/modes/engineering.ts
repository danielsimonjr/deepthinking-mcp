/**
 * Engineering Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Validates:
 * - Requirements traceability completeness
 * - Trade study criteria weights sum to 1
 * - FMEA RPN calculations
 * - Design decision completeness
 */

import type { ValidationIssue } from '../../../types/index.js';
import type { EngineeringThought } from '../../../types/modes/engineering.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Validator for Engineering reasoning mode
 */
export class EngineeringValidator implements ModeValidator<EngineeringThought> {
  getMode(): string {
    return 'engineering';
  }

  validate(thought: EngineeringThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // Validate design challenge is specified
    if (!thought.designChallenge || thought.designChallenge.trim() === '') {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Engineering thought must specify a design challenge',
        suggestion: 'Provide a clear description of the engineering problem',
        category: 'structural',
      });
    }

    // Validate analysis type
    const validTypes = ['requirements', 'trade-study', 'fmea', 'design-decision', 'comprehensive'];
    if (!validTypes.includes(thought.analysisType)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid analysis type: ${thought.analysisType}`,
        suggestion: `Use one of: ${validTypes.join(', ')}`,
        category: 'structural',
      });
    }

    // Validate requirements traceability
    if (thought.requirements) {
      issues.push(...validateRequirements(thought));
    }

    // Validate trade study
    if (thought.tradeStudy) {
      issues.push(...validateTradeStudy(thought));
    }

    // Validate FMEA
    if (thought.fmea) {
      issues.push(...validateFMEA(thought));
    }

    // Validate design decisions
    if (thought.designDecisions) {
      issues.push(...validateDesignDecisions(thought));
    }

    // Check that at least one analysis type is present for comprehensive mode
    if (thought.analysisType === 'comprehensive') {
      const hasAny = thought.requirements || thought.tradeStudy || thought.fmea || thought.designDecisions;
      if (!hasAny) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Comprehensive analysis should include at least one analysis section',
          suggestion: 'Add requirements, trade study, FMEA, or design decisions',
          category: 'structural',
        });
      }
    }

    return issues;
  }
}

function validateRequirements(thought: EngineeringThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const reqs = thought.requirements!;

    // Check for duplicate requirement IDs
    const ids = reqs.requirements.map(r => r.id);
    const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Duplicate requirement IDs: ${[...new Set(duplicates)].join(', ')}`,
        suggestion: 'Ensure each requirement has a unique ID',
        category: 'structural',
      });
    }

    // Check traceability links are valid
    for (const req of reqs.requirements) {
      if (req.tracesTo) {
        for (const parentId of req.tracesTo) {
          if (!ids.includes(parentId)) {
            issues.push({
              severity: 'warning',
              thoughtNumber: thought.thoughtNumber,
              description: `Requirement ${req.id} traces to unknown requirement: ${parentId}`,
              suggestion: 'Verify traceability links point to valid requirement IDs',
              category: 'structural',
            });
          }
        }
      }
    }

    // Check coverage metrics consistency
    if (reqs.coverage.total !== reqs.requirements.length) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Coverage total does not match requirements count',
        suggestion: 'Update coverage metrics to reflect actual requirements',
        category: 'logical',
      });
    }

    // Warn if no requirements have verification defined
    const reqsWithVerification = reqs.requirements.filter(r => r.verificationMethod);
    if (reqsWithVerification.length === 0 && reqs.requirements.length > 0) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'No requirements have verification methods defined',
        suggestion: 'Consider adding verification methods for requirements',
        category: 'structural',
      });
    }

    return issues;
}

function validateTradeStudy(thought: EngineeringThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const study = thought.tradeStudy!;

    // Check criteria weights sum to 1 (with tolerance)
    const weightSum = study.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(weightSum - 1.0) > 0.01) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Trade study criteria weights sum to ${weightSum.toFixed(2)}, should sum to 1.0`,
        suggestion: 'Adjust criteria weights to sum to 1.0',
        category: 'mathematical',
      });
    }

    // Check all alternatives have all scores
    const altIds = study.alternatives.map(a => a.id);
    const critIds = study.criteria.map(c => c.id);

    for (const altId of altIds) {
      for (const critId of critIds) {
        const score = study.scores.find(s => s.alternativeId === altId && s.criteriaId === critId);
        if (!score) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Missing score for alternative ${altId} on criterion ${critId}`,
            suggestion: 'Provide scores for all alternative-criterion combinations',
            category: 'structural',
          });
        }
      }
    }

    // Check recommendation is valid alternative
    if (!altIds.includes(study.recommendation)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Trade study recommendation "${study.recommendation}" is not a valid alternative`,
        suggestion: 'Recommendation must be one of the evaluated alternatives',
        category: 'structural',
      });
    }

    // Warn if less than 2 alternatives
    if (study.alternatives.length < 2) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Trade study has fewer than 2 alternatives',
        suggestion: 'Consider evaluating multiple alternatives for a meaningful trade study',
        category: 'structural',
      });
    }

    return issues;
}

function validateFMEA(thought: EngineeringThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const fmea = thought.fmea!;

    // Check RPN calculations
    for (const fm of fmea.failureModes) {
      const expectedRPN = fm.severity * fm.occurrence * fm.detection;
      if (fm.rpn !== expectedRPN) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Failure mode ${fm.id} has incorrect RPN: ${fm.rpn} (expected ${expectedRPN})`,
          suggestion: 'RPN should equal Severity × Occurrence × Detection',
          category: 'mathematical',
        });
      }

      // Check ratings are in valid range (1-10)
      if (fm.severity < 1 || fm.severity > 10) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Failure mode ${fm.id} has invalid severity: ${fm.severity}`,
          suggestion: 'Severity must be between 1 and 10',
          category: 'structural',
        });
      }

      if (fm.occurrence < 1 || fm.occurrence > 10) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Failure mode ${fm.id} has invalid occurrence: ${fm.occurrence}`,
          suggestion: 'Occurrence must be between 1 and 10',
          category: 'structural',
        });
      }

      if (fm.detection < 1 || fm.detection > 10) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Failure mode ${fm.id} has invalid detection: ${fm.detection}`,
          suggestion: 'Detection must be between 1 and 10',
          category: 'structural',
        });
      }
    }

    // Check summary statistics consistency
    if (fmea.summary.totalModes !== fmea.failureModes.length) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'FMEA summary totalModes does not match actual count',
        suggestion: 'Update summary statistics',
        category: 'logical',
      });
    }

    const criticalCount = fmea.failureModes.filter(fm => fm.rpn >= fmea.rpnThreshold).length;
    if (fmea.summary.criticalModes !== criticalCount) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'FMEA summary criticalModes does not match calculated count',
        suggestion: 'Update critical modes count based on RPN threshold',
        category: 'logical',
      });
    }

    // Warn about high RPN modes without mitigation
    const highRiskNoMitigation = fmea.failureModes.filter(
      fm => fm.rpn >= fmea.rpnThreshold && !fm.mitigation
    );
    if (highRiskNoMitigation.length > 0) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `${highRiskNoMitigation.length} failure mode(s) above RPN threshold without mitigation`,
        suggestion: 'Define mitigation actions for high-risk failure modes',
        category: 'structural',
      });
    }

    return issues;
}

function validateDesignDecisions(thought: EngineeringThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const log = thought.designDecisions!;

    // Check for duplicate decision IDs
    const ids = log.decisions.map(d => d.id);
    const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Duplicate decision IDs: ${[...new Set(duplicates)].join(', ')}`,
        suggestion: 'Ensure each decision has a unique ID',
        category: 'structural',
      });
    }

    // Validate each decision
    for (const decision of log.decisions) {
      // Check superseded decisions reference valid IDs
      if (decision.supersededBy && !ids.includes(decision.supersededBy)) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: `Decision ${decision.id} superseded by unknown decision: ${decision.supersededBy}`,
          suggestion: 'Verify supersededBy references a valid decision ID',
          category: 'structural',
        });
      }

      // Warn about accepted decisions without alternatives
      if (decision.status === 'accepted' && decision.alternatives.length === 0) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: `Decision ${decision.id} has no documented alternatives`,
          suggestion: 'Document alternatives considered for important decisions',
          category: 'structural',
        });
      }

      // Check rationale is provided
      if (!decision.rationale || decision.rationale.trim() === '') {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: `Decision ${decision.id} lacks rationale`,
          suggestion: 'Provide rationale for design decisions',
          category: 'structural',
        });
      }
    }

    return issues;
}
