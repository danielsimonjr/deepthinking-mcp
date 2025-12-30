/**
 * Modal Logic Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Modal logic deals with modalities: necessity, possibility,
 * impossibility, contingency
 */

import type { Thought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Validator for modal logic reasoning mode
 */
export class ModalValidator implements ModeValidator<Thought> {
  getMode(): string {
    return 'modal';
  }

  validate(thought: Thought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

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
