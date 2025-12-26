/**
 * Critique Mode Validator (v7.4.0)
 * Phase 13: Validates critical analysis and peer review thoughts
 *
 * Validates:
 * - Work characterization completeness
 * - Methodology evaluation structure
 * - Critique point validity
 * - Balance between strengths and weaknesses
 */

import { ValidationIssue } from '../../../types/index.js';
import type { CritiqueThought } from '../../../types/modes/critique.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class CritiqueValidator extends BaseValidator<CritiqueThought> {
  getMode(): string {
    return 'critique';
  }

  validate(thought: CritiqueThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate thought type if specified
    const validThoughtTypes = [
      'work_characterization', 'methodology_evaluation', 'argument_analysis',
      'evidence_assessment', 'contribution_evaluation', 'limitation_identification',
      'strength_recognition', 'improvement_suggestion'
    ];

    if (thought.thoughtType && !validThoughtTypes.includes(thought.thoughtType)) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown critique thought type: ${thought.thoughtType}`,
        suggestion: `Use one of: ${validThoughtTypes.join(', ')}`,
        category: 'structural',
      });
    }

    // Validate work being critiqued
    if (thought.work) {
      const validWorkTypes = [
        'empirical_study', 'theoretical_paper', 'review_article', 'meta_analysis',
        'case_study', 'methodology_paper', 'position_paper', 'commentary',
        'replication_study', 'mixed_methods', 'book', 'thesis'
      ];
      if (thought.work.type && !validWorkTypes.includes(thought.work.type)) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: `Invalid work type: ${thought.work.type}`,
          suggestion: `Use one of: ${validWorkTypes.join(', ')}`,
          category: 'structural',
        });
      }
    }

    // Validate methodology evaluation if present
    if (thought.methodologyEvaluation) {
      const evaluation = thought.methodologyEvaluation;

      // Validate overall rating is 0-1
      if (evaluation.overallRating !== undefined) {
        issues.push(...this.validateProbability(thought, evaluation.overallRating, 'methodology overall rating'));
      }

      // Validate design assessment rating
      if (evaluation.design?.rating !== undefined) {
        issues.push(...this.validateProbability(thought, evaluation.design.rating, 'design assessment rating'));
      }

      // Validate sample assessment rating
      if (evaluation.sample?.rating !== undefined) {
        issues.push(...this.validateProbability(thought, evaluation.sample.rating, 'sample assessment rating'));
      }

      // Validate analysis assessment rating
      if (evaluation.analysis?.rating !== undefined) {
        issues.push(...this.validateProbability(thought, evaluation.analysis.rating, 'analysis assessment rating'));
      }
    }

    // Validate critique points if present
    if (thought.critiquePoints && thought.critiquePoints.length > 0) {
      const validPointTypes = ['strength', 'weakness', 'concern', 'suggestion'];
      const validCategories = ['methodology', 'argument', 'evidence', 'contribution', 'writing', 'ethics'];
      const validSeverities = ['critical', 'major', 'minor', 'neutral'];

      for (const point of thought.critiquePoints) {
        if (point.type && !validPointTypes.includes(point.type)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Invalid critique point type: ${point.type}`,
            suggestion: `Use one of: ${validPointTypes.join(', ')}`,
            category: 'structural',
          });
        }

        if (point.category && !validCategories.includes(point.category)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual critique category: ${point.category}`,
            suggestion: `Consider using: ${validCategories.join(', ')}`,
            category: 'structural',
          });
        }

        if (point.severity && !validSeverities.includes(point.severity)) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Unusual severity level: ${point.severity}`,
            suggestion: `Consider using: ${validSeverities.join(', ')}`,
            category: 'structural',
          });
        }
      }
    }

    // Validate verdict if present
    if (thought.verdict) {
      const validRecommendations = ['accept', 'minor_revision', 'major_revision', 'reject'];
      if (thought.verdict.recommendation && !validRecommendations.includes(thought.verdict.recommendation)) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: `Invalid verdict recommendation: ${thought.verdict.recommendation}`,
          suggestion: `Use one of: ${validRecommendations.join(', ')}`,
          category: 'structural',
        });
      }

      // Validate confidence is 0-1
      if (thought.verdict.confidence !== undefined) {
        issues.push(...this.validateProbability(thought, thought.verdict.confidence, 'verdict confidence'));
      }
    }

    // Validate balance ratio is 0-1
    if (thought.balanceRatio !== undefined) {
      issues.push(...this.validateProbability(thought, thought.balanceRatio, 'balance ratio'));
    }

    // Validate strengths/weaknesses identified are non-negative
    if (thought.strengthsIdentified !== undefined && thought.strengthsIdentified < 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Strengths identified is negative: ${thought.strengthsIdentified}`,
        suggestion: 'Use a non-negative integer',
        category: 'logical',
      });
    }

    if (thought.weaknessesIdentified !== undefined && thought.weaknessesIdentified < 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Weaknesses identified is negative: ${thought.weaknessesIdentified}`,
        suggestion: 'Use a non-negative integer',
        category: 'logical',
      });
    }

    return issues;
  }
}
