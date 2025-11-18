/**
 * Causal Mode Validator
 */

import { CausalThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class CausalValidator extends BaseValidator<CausalThought> {
  getMode(): string {
    return 'causal';
  }

  validate(thought: CausalThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate causal graph structure
    if (thought.causalGraph) {
      const { nodes, edges } = thought.causalGraph;

      // Create node ID set for validation
      const nodeIds = new Set(nodes.map((n) => n.id));

      // Validate edges reference existing nodes
      for (const edge of edges) {
        if (!nodeIds.has(edge.from)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Edge references non-existent node: ${edge.from}`,
            suggestion: 'Ensure all edge endpoints reference existing nodes',
            category: 'structural',
          });
        }
        if (!nodeIds.has(edge.to)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Edge references non-existent node: ${edge.to}`,
            suggestion: 'Ensure all edge endpoints reference existing nodes',
            category: 'structural',
          });
        }

        // Validate strength is in range
        if (edge.strength < 0 || edge.strength > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Edge strength must be between 0 and 1: ${edge.from} -> ${edge.to}`,
            suggestion: 'Provide edge strength as decimal',
            category: 'structural',
          });
        }
      }

      // Check for isolated nodes
      const connectedNodes = new Set<string>();
      for (const edge of edges) {
        connectedNodes.add(edge.from);
        connectedNodes.add(edge.to);
      }

      for (const node of nodes) {
        if (!connectedNodes.has(node.id) && nodes.length > 1) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Node "${node.label}" is isolated (no connections)`,
            suggestion: 'Consider adding causal relationships or removing isolated nodes',
            category: 'structural',
          });
        }
      }
    }

    return issues;
  }
}
