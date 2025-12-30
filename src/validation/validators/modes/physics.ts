/**
 * Physics Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 */

import type { PhysicsThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Physics mode validator using composition pattern
 */
export class PhysicsValidator implements ModeValidator<PhysicsThought> {
  getMode(): string {
    return 'physics';
  }

  validate(thought: PhysicsThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation via utility function
    issues.push(...validateCommon(thought));

    // Validate tensor properties
    if (thought.tensorProperties) {
      const [contravariant, covariant] = thought.tensorProperties.rank;

      if (contravariant < 0 || covariant < 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Tensor rank components must be non-negative',
          suggestion: 'Provide valid tensor rank [contravariant, covariant]',
          category: 'physical',
        });
      }

      // Check symmetries are appropriate for rank
      const totalRank = contravariant + covariant;
      if (thought.tensorProperties.symmetries.includes('antisymmetric') && totalRank < 2) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Antisymmetric tensors must have rank ≥ 2',
          suggestion: 'Verify tensor rank and symmetry properties',
          category: 'physical',
        });
      }
    }

    // Validate physical interpretation
    if (thought.physicalInterpretation) {
      if (!thought.physicalInterpretation.units) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Physical quantity should have units specified',
          suggestion: 'Specify physical units (e.g., "m/s²")',
          category: 'physical',
        });
      }

      if (thought.physicalInterpretation.conservationLaws.length === 0) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'No conservation laws specified',
          suggestion: 'Consider noting relevant conservation laws',
          category: 'physical',
        });
      }
    }

    return issues;
  }
}
