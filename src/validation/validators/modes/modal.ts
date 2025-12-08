/**
 * Modal Logic Mode Validator (v3.4.0)
 * Phase 4E Task 8.8: Validator for modal logic mode
 *
 * Modal logic deals with modalities: necessity, possibility,
 * impossibility, contingency
 */

import { Thought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class ModalValidator extends BaseValidator<Thought> {
  getMode(): string {
    return 'modal';
  }

  validate(thought: Thought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Modal reasoning should use modal operators
    const modalOperators = [
      'necessarily', 'necessary', 'must',
      'possibly', 'possible', 'might', 'could',
      'impossible', 'cannot',
      'contingent', 'may or may not'
    ];

    const hasModalOperator = modalOperators.some(operator =>
      thought.content.toLowerCase().includes(operator)
    );

    if (!hasModalOperator) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Modal logic should use modal operators (necessary, possible, impossible)',
        suggestion: 'Express claims using modalities: □ (necessity), ◇ (possibility)',
        category: 'structural',
      });
    }

    // Check for world/scenario references (modal logic works across possible worlds)
    const worldKeywords = ['world', 'scenario', 'case', 'situation', 'circumstance'];
    const hasWorldReference = worldKeywords.some(keyword =>
      thought.content.toLowerCase().includes(keyword)
    );

    if (!hasWorldReference && thought.thoughtNumber > 1) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Modal reasoning often considers different possible worlds or scenarios',
        suggestion: 'Consider making explicit references to alternative scenarios or states',
        category: 'structural',
      });
    }

    return issues;
  }
}
