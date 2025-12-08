/**
 * Temporal Mode Validator (v7.1.0)
 * Refactored to use BaseValidator shared methods
 */

import { TemporalThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class TemporalValidator extends BaseValidator<TemporalThought> {
  getMode(): string {
    return 'temporal';
  }

  validate(thought: TemporalThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate timeline
    if (thought.timeline) {
      if (!thought.timeline.timeUnit) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: 'Timeline must specify timeUnit',
          suggestion: 'Add timeUnit property (milliseconds, seconds, minutes, hours, days, months, years)',
          category: IssueCategory.STRUCTURAL,
        });
      }

      if (
        thought.timeline.startTime !== undefined &&
        thought.timeline.endTime !== undefined &&
        thought.timeline.startTime >= thought.timeline.endTime
      ) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: 'Timeline startTime must be before endTime',
          suggestion: 'Ensure chronological order: startTime < endTime',
          category: IssueCategory.LOGICAL,
        });
      }
    }

    // Validate events
    if (thought.events) {
      for (const event of thought.events) {
        if (event.type === 'interval' && !event.duration) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Interval event ${event.id} must have duration`,
            suggestion: 'Add duration property for interval events',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate timestamp is non-negative using shared method
        issues.push(
          ...this.validateNumberRange(
            thought,
            event.timestamp,
            `Event ${event.id} timestamp`,
            0,
            Infinity,
            IssueSeverity.ERROR,
            IssueCategory.STRUCTURAL
          )
        );
      }
    }

    // Validate intervals
    if (thought.intervals) {
      for (const interval of thought.intervals) {
        if (interval.start >= interval.end) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Interval ${interval.id} start must be before end`,
            suggestion: 'Ensure start < end for all intervals',
            category: IssueCategory.LOGICAL,
          });
        }
      }
    }

    // Validate temporal constraints
    if (thought.constraints) {
      const eventIds = new Set(thought.events?.map((e) => e.id) || []);
      const intervalIds = new Set(thought.intervals?.map((i) => i.id) || []);

      for (const constraint of thought.constraints) {
        if (!eventIds.has(constraint.subject) && !intervalIds.has(constraint.subject)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Constraint subject ${constraint.subject} not found in events or intervals`,
            suggestion: 'Ensure constraint references exist',
            category: IssueCategory.STRUCTURAL,
          });
        }

        if (!eventIds.has(constraint.object) && !intervalIds.has(constraint.object)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Constraint object ${constraint.object} not found in events or intervals`,
            suggestion: 'Ensure constraint references exist',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate confidence using shared method
        issues.push(...this.validateConfidence(thought, constraint.confidence, `Constraint ${constraint.id} confidence`));
      }
    }

    // Validate temporal relations
    if (thought.relations) {
      const eventIds = new Set(thought.events?.map((e) => e.id) || []);

      for (const relation of thought.relations) {
        // Validate relation references existing events
        if (!eventIds.has(relation.from)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Temporal relation ${relation.id} 'from' event ${relation.from} not found`,
            suggestion: 'Ensure relation references existing events',
            category: IssueCategory.STRUCTURAL,
          });
        }

        if (!eventIds.has(relation.to)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Temporal relation ${relation.id} 'to' event ${relation.to} not found`,
            suggestion: 'Ensure relation references existing events',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate relation strength range
        if (relation.strength < 0 || relation.strength > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Temporal relation ${relation.id} strength must be 0-1`,
            suggestion: 'Provide strength as decimal',
            category: 'structural',
          });
        }

        // Validate relation delay is non-negative
        if (relation.delay !== undefined && relation.delay < 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Temporal relation ${relation.id} delay cannot be negative`,
            suggestion: 'Use non-negative delay values',
            category: 'structural',
          });
        }
      }
    }

    return issues;
  }
}
