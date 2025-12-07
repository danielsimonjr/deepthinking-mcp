/**
 * Causal Mode Validator (v7.1.0)
 * Refactored to use BaseValidator shared methods
 */

import { CausalThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';

export class CausalValidator extends BaseValidator<CausalThought> {
  getMode(): string {
    return 'causal';
  }

  validate(thought: CausalThought, _context: ValidationContext): ValidationIssue[] {
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
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Edge references non-existent source node: ${edge.from}`,
            suggestion: 'Ensure all edge endpoints reference existing nodes',
            category: IssueCategory.STRUCTURAL,
          });
        }
        if (!nodeIds.has(edge.to)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Edge references non-existent target node: ${edge.to}`,
            suggestion: 'Ensure all edge endpoints reference existing nodes',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate strength is in range (-1 to 1) using shared method
        issues.push(
          ...this.validateNumberRange(
            thought,
            edge.strength,
            `Edge strength (${edge.from} -> ${edge.to})`,
            -1,
            1,
            IssueSeverity.ERROR,
            IssueCategory.STRUCTURAL
          )
        );

        // Validate confidence is in range (0 to 1) using shared method
        issues.push(
          ...this.validateConfidence(thought, edge.confidence, `Edge confidence (${edge.from} -> ${edge.to})`)
        );
      }

      // Detect cycles in causal graph
      const hasCycle = this.detectCycle(edges, nodeIds);
      // Only warn about cycles if no feedback mechanisms are explicitly marked
      const hasFeedbackMechanism = thought.mechanisms?.some(m => m.type === 'feedback');
      if (hasCycle && !hasFeedbackMechanism) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Causal graph contains cycles (feedback loops)',
          suggestion: 'Verify that cyclical relationships are intentional',
          category: 'structural',
        });
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
            description: `Node "${node.name}" is isolated (no connections)`,
            suggestion: 'Consider adding causal relationships or removing isolated nodes',
            category: 'structural',
          });
        }
      }
    }

    // Validate interventions
    if (thought.interventions) {
      const nodeIds = new Set(thought.causalGraph?.nodes.map(n => n.id) || []);

      for (const intervention of thought.interventions) {
        // Validate intervention references existing node
        if (!nodeIds.has(intervention.nodeId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Intervention references non-existent node: ${intervention.nodeId}`,
            suggestion: 'Ensure intervention references existing nodes',
            category: 'structural',
          });
        }

        // Validate expected effects reference existing nodes
        for (const effect of intervention.expectedEffects) {
          if (!nodeIds.has(effect.nodeId)) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Intervention effect references non-existent node: ${effect.nodeId}`,
              suggestion: 'Ensure expected effects reference existing nodes',
              category: 'structural',
            });
          }

          // Validate confidence range using shared method
          issues.push(
            ...this.validateConfidence(thought, effect.confidence, 'Intervention effect confidence')
          );
        }
      }
    }

    return issues;
  }

  /**
   * Detect cycles in directed graph using DFS
   */
  private detectCycle(edges: { from: string; to: string }[], nodeIds: Set<string>): boolean {
    const graph = new Map<string, string[]>();

    // Build adjacency list
    for (const nodeId of nodeIds) {
      graph.set(nodeId, []);
    }
    for (const edge of edges) {
      const neighbors = graph.get(edge.from) || [];
      neighbors.push(edge.to);
      graph.set(edge.from, neighbors);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of nodeIds) {
      if (!visited.has(node)) {
        if (dfs(node)) {
          return true;
        }
      }
    }

    return false;
  }
}
