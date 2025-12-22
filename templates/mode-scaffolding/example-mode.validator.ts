/**
 * ExampleMode Validator Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file to: src/validation/validators/modes/yourmode.ts
 * 2. Replace "ExampleMode" with your mode name (PascalCase)
 * 3. Replace "examplemode" with your mode name (lowercase)
 * 4. Implement your validation logic
 * 5. Register in src/validation/validator.ts (ValidatorFactory.getValidator)
 * 6. Remove this instruction block
 *
 * REFERENCE: See src/validation/validators/modes/sequential.ts
 */

import { ExampleModeThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

/**
 * Validator for ExampleMode reasoning
 *
 * TODO: Add description of what this validator checks
 */
export class ExampleModeValidator extends BaseValidator<ExampleModeThought> {
  /**
   * Returns the mode identifier (lowercase)
   */
  getMode(): string {
    return 'examplemode';
  }

  /**
   * Validate ExampleMode thought
   *
   * @param thought - The thought to validate
   * @param _context - Validation context (session info, existing thoughts, etc.)
   * @returns Array of validation issues (empty if valid)
   */
  validate(thought: ExampleModeThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // REQUIRED: Always include common validation
    issues.push(...this.validateCommon(thought));

    // ============================================================
    // MODE-SPECIFIC VALIDATION
    // ============================================================
    //
    // Common validation patterns:
    //
    // 1. Required field:
    //    if (!thought.requiredField) {
    //      issues.push({
    //        severity: 'error',
    //        thoughtNumber: thought.thoughtNumber,
    //        description: 'requiredField is required',
    //        suggestion: 'Provide a value for requiredField',
    //        category: 'structural',
    //      });
    //    }
    //
    // 2. Range validation:
    //    if (thought.confidence !== undefined &&
    //        (thought.confidence < 0 || thought.confidence > 1)) {
    //      issues.push({
    //        severity: 'error',
    //        thoughtNumber: thought.thoughtNumber,
    //        description: 'confidence must be between 0 and 1',
    //        suggestion: 'Use decimal values in range [0, 1]',
    //        category: 'structural',
    //      });
    //    }
    //
    // 3. Reference validation (check IDs exist):
    //    if (thought.relationships) {
    //      const entityIds = new Set(thought.entities?.map(e => e.id) || []);
    //      for (const rel of thought.relationships) {
    //        if (!entityIds.has(rel.from)) {
    //          issues.push({
    //            severity: 'error',
    //            thoughtNumber: thought.thoughtNumber,
    //            description: `Invalid reference: entity '${rel.from}' not found`,
    //            suggestion: 'Ensure referenced entities exist',
    //            category: 'reference',
    //          });
    //        }
    //      }
    //    }
    //
    // 4. Logical consistency:
    //    if (thought.startTime !== undefined &&
    //        thought.endTime !== undefined &&
    //        thought.startTime >= thought.endTime) {
    //      issues.push({
    //        severity: 'error',
    //        thoughtNumber: thought.thoughtNumber,
    //        description: 'startTime must be before endTime',
    //        suggestion: 'Ensure chronological order',
    //        category: 'logical',
    //      });
    //    }
    //
    // 5. Empty array warning:
    //    if (thought.items && thought.items.length === 0) {
    //      issues.push({
    //        severity: 'warning',
    //        thoughtNumber: thought.thoughtNumber,
    //        description: 'items array is empty',
    //        suggestion: 'Add items or remove the property',
    //        category: 'semantic',
    //      });
    //    }
    //
    // 6. Cross-session validation (using context):
    //    if (thought.isRevision && _context.existingThoughts) {
    //      const revised = _context.existingThoughts.get(thought.revisesThought || '');
    //      if (!revised) {
    //        issues.push({
    //          severity: 'error',
    //          thoughtNumber: thought.thoughtNumber,
    //          description: `Cannot revise non-existent thought: ${thought.revisesThought}`,
    //          suggestion: 'Verify the thought ID exists',
    //          category: 'reference',
    //        });
    //      }
    //    }
    //
    // VALIDATION CATEGORIES:
    // - 'structural': Missing fields, type issues, invalid structure
    // - 'logical': Logical inconsistencies (A > B when should be A < B)
    // - 'semantic': Meaning issues (empty arrays, nonsensical values)
    // - 'reference': Broken references (ID doesn't exist)
    //
    // SEVERITY LEVELS:
    // - 'error': Critical - prevents proper processing
    // - 'warning': Should fix but doesn't break functionality
    // - 'info': Suggestions for improvement
    //
    // REPLACE THIS COMMENT BLOCK WITH YOUR VALIDATION LOGIC

    return issues;
  }
}
