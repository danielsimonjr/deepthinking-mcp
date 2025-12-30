/**
 * Algorithmic Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Validates:
 * - Algorithm design pattern appropriateness
 * - Complexity analysis completeness
 * - Correctness proof structure
 * - CLRS algorithm classification
 */

import type { ValidationIssue } from '../../../types/index.js';
import type { AlgorithmicThought } from '../../../types/modes/algorithmic.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Validator for algorithmic reasoning mode
 */
export class AlgorithmicValidator implements ModeValidator<AlgorithmicThought> {
  getMode(): string {
    return 'algorithmic';
  }

  validate(thought: AlgorithmicThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // Validate thought type if specified
    const validThoughtTypes = [
      'algorithm_definition', 'complexity_analysis', 'recurrence_solving',
      'correctness_proof', 'invariant_identification', 'divide_and_conquer',
      'dynamic_programming', 'greedy_choice', 'backtracking', 'branch_and_bound',
      'randomized_analysis', 'amortized_analysis', 'data_structure_design',
      'data_structure_analysis', 'augmentation', 'graph_traversal',
      'shortest_path', 'minimum_spanning_tree', 'network_flow', 'matching',
      'string_matching', 'computational_geometry', 'number_theoretic',
      'approximation', 'online_algorithm', 'parallel_algorithm'
    ];

    if (thought.thoughtType && !validThoughtTypes.includes(thought.thoughtType)) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown algorithmic thought type: ${thought.thoughtType}`,
        suggestion: `Use one of: ${validThoughtTypes.slice(0, 5).join(', ')}...`,
        category: 'structural',
      });
    }

    // Validate complexity analysis if present
    if (thought.timeComplexity) {
      if (!thought.timeComplexity.worstCase) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Complexity analysis should include worst-case analysis',
          suggestion: 'Add worstCase field to timeComplexity',
          category: 'logical',
        });
      }
    }

    // Validate design pattern if specified
    const validPatterns = [
      'brute_force', 'divide_and_conquer', 'dynamic_programming', 'greedy',
      'backtracking', 'branch_and_bound', 'randomized', 'approximation',
      'online', 'parallel', 'incremental', 'prune_and_search'
    ];

    if (thought.designPattern && !validPatterns.includes(thought.designPattern)) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown design pattern: ${thought.designPattern}`,
        suggestion: `Use one of: ${validPatterns.join(', ')}`,
        category: 'structural',
      });
    }

    // Validate correctness proof has required components
    if (thought.correctnessProof) {
      if (!thought.correctnessProof.method) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Correctness proof should specify a method',
          suggestion: 'Add method (e.g., "induction", "loop_invariant")',
          category: 'logical',
        });
      }
    }

    return issues;
  }
}
