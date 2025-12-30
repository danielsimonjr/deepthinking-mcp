/**
 * Meta-Reasoning Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Meta-reasoning involves thinking about thinking - analyzing and
 * monitoring one's own reasoning processes
 */

import type { Thought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Validator for meta reasoning mode
 */
export class MetaValidator implements ModeValidator<Thought> {
  getMode(): string {
    return 'meta';
  }

  validate(thought: Thought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

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
