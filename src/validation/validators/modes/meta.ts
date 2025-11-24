/**
 * Meta-Reasoning Mode Validator (v3.4.0)
 * Phase 4E Task 8.8: Validator for meta-reasoning mode
 *
 * Meta-reasoning involves thinking about thinking - analyzing and
 * monitoring one's own reasoning processes
 */

import { Thought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class MetaValidator extends BaseValidator<Thought> {
  getMode(): string {
    return 'meta';
  }

  validate(thought: Thought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Meta-reasoning should reference other thoughts or reasoning processes
    if ('dependencies' in thought && Array.isArray(thought.dependencies)) {
      if (thought.dependencies.length === 0) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Meta-reasoning should reference thoughts being analyzed',
          suggestion: 'Add dependencies to thoughts being reflected upon',
          category: 'structural',
        });
      }
    }

    // Check for meta-level indicators in thought content
    const metaKeywords = ['reasoning', 'thinking', 'approach', 'strategy', 'method', 'process'];
    const hasMetaContent = metaKeywords.some(keyword =>
      thought.content.toLowerCase().includes(keyword)
    );

    if (!hasMetaContent) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Meta-reasoning typically discusses reasoning processes',
        suggestion: 'Consider making explicit references to reasoning strategies or thought processes',
        category: 'structural',
      });
    }

    return issues;
  }
}
