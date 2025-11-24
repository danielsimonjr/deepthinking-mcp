/**
 * Constraint-Based Reasoning Mode (v3.4.0)
 * Phase 4E Task 8.3 (File Task 26): Reasoning with constraints and CSPs
 */
// @ts-nocheck - Type definitions need refactoring

import type { Thought } from '../types/index.js';

/**
 * Constraint type
 */
export type ConstraintType =
  | 'equality' // x = y
  | 'inequality' // x ≠ y
  | 'less_than' // x < y
  | 'less_equal' // x ≤ y
  | 'greater_than' // x > y
  | 'greater_equal' // x ≥ y
  | 'in_set' // x ∈ S
  | 'not_in_set' // x ∉ S
  | 'all_different' // All variables must have different values
  | 'sum_equals' // Σx_i = c
  | 'linear' // a₁x₁ + a₂x₂ + ... + aₙxₙ = b
  | 'custom'; // Custom constraint function

/**
 * Variable in CSP
 */
export interface Variable {
  id: string;
  name: string;
  domain: any[]; // Possible values
  currentValue?: any;
  type: 'integer' | 'real' | 'boolean' | 'categorical' | 'set';
  constraints: string[]; // Constraint IDs involving this variable
}

/**
 * Constraint in CSP
 */
export interface Constraint {
  id: string;
  type: ConstraintType;
  variables: string[]; // Variable IDs
  description: string;
  predicate: (values: Map<string, any>) => boolean; // Satisfaction function
  weight: number; // For soft constraints (0-1, 1 = hard constraint)
  priority: number; // For constraint ordering
}

/**
 * Constraint Satisfaction Problem
 */
export interface CSP {
  variables: Map<string, Variable>;
  constraints: Constraint[];
  objective?: ObjectiveFunction; // For optimization
}

/**
 * Objective function for optimization
 */
export interface ObjectiveFunction {
  type: 'minimize' | 'maximize';
  expression: string;
  evaluate: (assignment: Map<string, any>) => number;
}

/**
 * Assignment of values to variables
 */
export interface Assignment {
  values: Map<string, any>;
  isComplete: boolean;
  isConsistent: boolean;
  violatedConstraints: string[];
  satisfiedConstraints: string[];
}

/**
 * Solution to CSP
 */
export interface Solution {
  assignment: Assignment;
  isSolution: boolean;
  objectiveValue?: number;
  searchSteps: number;
  timeElapsed: number;
  method: string;
}

/**
 * Search strategy for CSP
 */
export type SearchStrategy =
  | 'backtracking' // Simple backtracking
  | 'forward_checking' // Backtracking with forward checking
  | 'arc_consistency' // Maintain arc consistency (AC-3)
  | 'min_conflicts' // Local search with min-conflicts heuristic
  | 'constraint_propagation' // Propagate constraints
  | 'branch_and_bound'; // For optimization

/**
 * Variable ordering heuristic
 */
export type VariableOrdering =
  | 'lexicographic' // Alphabetical order
  | 'min_remaining_values' // MRV - choose variable with smallest domain
  | 'degree_heuristic' // Choose variable involved in most constraints
  | 'max_degree' // Maximum degree in constraint graph
  | 'random'; // Random selection

/**
 * Value ordering heuristic
 */
export type ValueOrdering =
  | 'natural' // Domain order
  | 'least_constraining' // Choose value that rules out fewest values for neighbors
  | 'min_conflicts' // Choose value with minimum conflicts
  | 'random'; // Random selection

/**
 * Constraint reasoning thought
 */
export interface ConstraintReasoningThought extends Thought {
  mode: 'constraint';
  csp: CSP;
  assignments: Assignment[];
  solutions: Solution[];
  propagations: ConstraintPropagation[];
  analysis: ConstraintAnalysis;
}

/**
 * Constraint propagation step
 */
export interface ConstraintPropagation {
  variable: string;
  originalDomain: any[];
  reducedDomain: any[];
  reason: string;
  constraintId: string;
}

/**
 * Constraint analysis
 */
export interface ConstraintAnalysis {
  totalVariables: number;
  totalConstraints: number;
  constraintDensity: number; // Constraints per variable
  hardConstraints: number;
  softConstraints: number;
  domainSizes: Map<string, number>;
  tightness: number; // Proportion of incompatible value pairs
  isSatisfiable: boolean | 'unknown';
  estimatedComplexity: string;
}

/**
 * Constraint-based reasoning engine
 */
export class ConstraintReasoningEngine {
  /**
   * Create CSP
   */
  createCSP(): CSP {
    return {
      variables: new Map(),
      constraints: [],
    };
  }

  /**
   * Add variable to CSP
   */
  addVariable(csp: CSP, variable: Variable): void {
    csp.variables.set(variable.id, variable);
  }

  /**
   * Add constraint to CSP
   */
  addConstraint(csp: CSP, constraint: Constraint): void {
    csp.constraints.push(constraint);

    // Update variable constraint references
    for (const varId of constraint.variables) {
      const variable = csp.variables.get(varId);
      if (variable) {
        variable.constraints.push(constraint.id);
      }
    }
  }

  /**
   * Check if assignment satisfies constraint
   */
  satisfiesConstraint(constraint: Constraint, assignment: Map<string, any>): boolean {
    // Check if all variables in constraint are assigned
    for (const varId of constraint.variables) {
      if (!assignment.has(varId)) {
        return true; // Incomplete assignment, consider satisfied for now
      }
    }

    return constraint.predicate(assignment);
  }

  /**
   * Check if assignment is consistent
   */
  isConsistent(csp: CSP, assignment: Map<string, any>): boolean {
    for (const constraint of csp.constraints) {
      if (constraint.weight === 1 && !this.satisfiesConstraint(constraint, assignment)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get violated constraints
   */
  getViolatedConstraints(csp: CSP, assignment: Map<string, any>): string[] {
    const violated: string[] = [];

    for (const constraint of csp.constraints) {
      if (!this.satisfiesConstraint(constraint, assignment)) {
        violated.push(constraint.id);
      }
    }

    return violated;
  }

  /**
   * Solve CSP using backtracking
   */
  solveBacktracking(
    csp: CSP,
    varOrdering: VariableOrdering = 'min_remaining_values',
    valOrdering: ValueOrdering = 'least_constraining'
  ): Solution {
    const startTime = Date.now();
    let steps = 0;
    const assignment = new Map<string, any>();

    const result = this.backtrack(csp, assignment, varOrdering, valOrdering, () => {
      steps++;
    });

    const timeElapsed = Date.now() - startTime;

    if (result) {
      return {
        assignment: {
          values: result,
          isComplete: result.size === csp.variables.size,
          isConsistent: this.isConsistent(csp, result),
          violatedConstraints: [],
          satisfiedConstraints: csp.constraints.map(c => c.id),
        },
        isSolution: true,
        searchSteps: steps,
        timeElapsed,
        method: 'backtracking',
      };
    }

    return {
      assignment: {
        values: new Map(),
        isComplete: false,
        isConsistent: false,
        violatedConstraints: csp.constraints.map(c => c.id),
        satisfiedConstraints: [],
      },
      isSolution: false,
      searchSteps: steps,
      timeElapsed,
      method: 'backtracking',
    };
  }

  /**
   * Backtracking algorithm
   */
  private backtrack(
    csp: CSP,
    assignment: Map<string, any>,
    varOrdering: VariableOrdering,
    valOrdering: ValueOrdering,
    onStep: () => void
  ): Map<string, any> | null {
    onStep();

    // Check if assignment is complete
    if (assignment.size === csp.variables.size) {
      return assignment;
    }

    // Select unassigned variable
    const variable = this.selectVariable(csp, assignment, varOrdering);
    if (!variable) return null;

    // Order domain values
    const values = this.orderValues(csp, variable, assignment, valOrdering);

    for (const value of values) {
      // Try assigning value
      const newAssignment = new Map(assignment);
      newAssignment.set(variable.id, value);

      // Check consistency
      if (this.isConsistent(csp, newAssignment)) {
        const result = this.backtrack(csp, newAssignment, varOrdering, valOrdering, onStep);
        if (result) return result;
      }
    }

    return null; // Backtrack
  }

  /**
   * Select next variable to assign
   */
  private selectVariable(csp: CSP, assignment: Map<string, any>, ordering: VariableOrdering): Variable | null {
    const unassigned = Array.from(csp.variables.values()).filter(v => !assignment.has(v.id));

    if (unassigned.length === 0) return null;

    switch (ordering) {
      case 'lexicographic':
        return unassigned.sort((a, b) => a.name.localeCompare(b.name))[0];

      case 'min_remaining_values':
        // MRV: Choose variable with smallest domain
        return unassigned.reduce((min, v) => (v.domain.length < min.domain.length ? v : min));

      case 'degree_heuristic':
        // Choose variable involved in most constraints with unassigned variables
        return unassigned.reduce((max, v) => {
          const degree = v.constraints.length;
          return degree > (max.constraints?.length || 0) ? v : max;
        });

      case 'random':
        return unassigned[Math.floor(Math.random() * unassigned.length)];

      default:
        return unassigned[0];
    }
  }

  /**
   * Order values for variable
   */
  private orderValues(
    csp: CSP,
    variable: Variable,
    assignment: Map<string, any>,
    ordering: ValueOrdering
  ): any[] {
    const values = [...variable.domain];

    switch (ordering) {
      case 'natural':
        return values;

      case 'least_constraining':
        // Order values by how many values they rule out for neighboring variables
        return values.sort((a, b) => {
          const ruledOutA = this.countRuledOut(csp, variable, a, assignment);
          const ruledOutB = this.countRuledOut(csp, variable, b, assignment);
          return ruledOutA - ruledOutB;
        });

      case 'min_conflicts':
        // Order by number of conflicts
        return values.sort((a, b) => {
          const testAssignmentA = new Map(assignment);
          testAssignmentA.set(variable.id, a);
          const conflictsA = this.getViolatedConstraints(csp, testAssignmentA).length;

          const testAssignmentB = new Map(assignment);
          testAssignmentB.set(variable.id, b);
          const conflictsB = this.getViolatedConstraints(csp, testAssignmentB).length;

          return conflictsA - conflictsB;
        });

      case 'random':
        return values.sort(() => Math.random() - 0.5);

      default:
        return values;
    }
  }

  /**
   * Count how many values are ruled out for neighbors
   */
  private countRuledOut(csp: CSP, variable: Variable, value: any, assignment: Map<string, any>): number {
    let count = 0;

    const testAssignment = new Map(assignment);
    testAssignment.set(variable.id, value);

    // For each constraint involving this variable
    for (const constraintId of variable.constraints) {
      const constraint = csp.constraints.find(c => c.id === constraintId);
      if (!constraint) continue;

      // Check neighboring variables
      for (const neighborId of constraint.variables) {
        if (neighborId === variable.id || testAssignment.has(neighborId)) continue;

        const neighbor = csp.variables.get(neighborId);
        if (!neighbor) continue;

        // Count values in neighbor's domain that are now inconsistent
        for (const neighborValue of neighbor.domain) {
          const fullAssignment = new Map(testAssignment);
          fullAssignment.set(neighborId, neighborValue);

          if (!this.satisfiesConstraint(constraint, fullAssignment)) {
            count++;
          }
        }
      }
    }

    return count;
  }

  /**
   * Apply AC-3 (Arc Consistency 3) algorithm
   */
  applyAC3(csp: CSP): ConstraintPropagation[] {
    const propagations: ConstraintPropagation[] = [];
    const queue: Array<[string, string]> = []; // Arcs (variable pairs)

    // Initialize queue with all arcs
    for (const constraint of csp.constraints) {
      if (constraint.variables.length === 2) {
        const [v1, v2] = constraint.variables;
        queue.push([v1, v2]);
        queue.push([v2, v1]);
      }
    }

    while (queue.length > 0) {
      const [xi, xj] = queue.shift()!;
      const variable = csp.variables.get(xi);
      if (!variable) continue;

      const originalDomain = [...variable.domain];
      let revised = false;

      // Remove inconsistent values from xi's domain
      variable.domain = variable.domain.filter(vi => {
        // Check if there exists a value vj in xj's domain that satisfies constraints
        const variableJ = csp.variables.get(xj);
        if (!variableJ) return true;

        const hasConsistentValue = variableJ.domain.some(vj => {
          const testAssignment = new Map<string, any>();
          testAssignment.set(xi, vi);
          testAssignment.set(xj, vj);

          // Check all constraints involving both variables
          return csp.constraints
            .filter(c => c.variables.includes(xi) && c.variables.includes(xj))
            .every(c => this.satisfiesConstraint(c, testAssignment));
        });

        if (!hasConsistentValue) {
          revised = true;
          return false;
        }
        return true;
      });

      if (revised) {
        propagations.push({
          variable: xi,
          originalDomain,
          reducedDomain: [...variable.domain],
          reason: `Arc consistency with ${xj}`,
          constraintId: 'ac3',
        });

        if (variable.domain.length === 0) {
          // Inconsistency detected
          break;
        }

        // Add all arcs (xk, xi) to queue where xk is a neighbor of xi
        for (const constraint of csp.constraints) {
          if (constraint.variables.includes(xi)) {
            for (const xk of constraint.variables) {
              if (xk !== xi) {
                queue.push([xk, xi]);
              }
            }
          }
        }
      }
    }

    return propagations;
  }

  /**
   * Analyze CSP
   */
  analyzeCSP(csp: CSP): ConstraintAnalysis {
    const totalVariables = csp.variables.size;
    const totalConstraints = csp.constraints.length;
    const constraintDensity = totalVariables > 0 ? totalConstraints / totalVariables : 0;

    const hardConstraints = csp.constraints.filter(c => c.weight === 1).length;
    const softConstraints = csp.constraints.filter(c => c.weight < 1).length;

    const domainSizes = new Map<string, number>();
    for (const [id, variable] of csp.variables) {
      domainSizes.set(id, variable.domain.length);
    }

    // Estimate tightness (simplified: assume 50% incompatible pairs)
    const tightness = 0.5;

    // Estimate complexity
    const maxDomainSize = Math.max(...Array.from(domainSizes.values()), 0);
    const estimatedComplexity = `O(${maxDomainSize}^${totalVariables})`;

    return {
      totalVariables,
      totalConstraints,
      constraintDensity,
      hardConstraints,
      softConstraints,
      domainSizes,
      tightness,
      isSatisfiable: 'unknown',
      estimatedComplexity,
    };
  }

  /**
   * Generate constraint graph in DOT format
   */
  generateConstraintGraph(csp: CSP): string {
    let dot = 'graph ConstraintGraph {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=circle];\n\n';

    // Add nodes for variables
    for (const [id, variable] of csp.variables) {
      const label = `${variable.name}\\n|D|=${variable.domain.length}`;
      dot += `  ${id} [label="${label}"];\n`;
    }

    dot += '\n';

    // Add edges for constraints
    const addedEdges = new Set<string>();
    for (const constraint of csp.constraints) {
      if (constraint.variables.length === 2) {
        const [v1, v2] = constraint.variables.sort();
        const edgeKey = `${v1}-${v2}`;

        if (!addedEdges.has(edgeKey)) {
          const style = constraint.weight === 1 ? 'solid' : 'dashed';
          dot += `  ${v1} -- ${v2} [style="${style}", label="${constraint.type}"];\n`;
          addedEdges.add(edgeKey);
        }
      }
    }

    dot += '}\n';
    return dot;
  }

  /**
   * Generate reasoning summary
   */
  generateSummary(csp: CSP, solution: Solution, analysis: ConstraintAnalysis): string {
    const report: string[] = [];

    report.push('# Constraint-Based Reasoning Summary');
    report.push('');

    report.push('## Problem Definition');
    report.push(`- **Variables:** ${analysis.totalVariables}`);
    report.push(`- **Constraints:** ${analysis.totalConstraints} (${analysis.hardConstraints} hard, ${analysis.softConstraints} soft)`);
    report.push(`- **Constraint Density:** ${analysis.constraintDensity.toFixed(2)}`);
    report.push(`- **Estimated Complexity:** ${analysis.estimatedComplexity}`);
    report.push('');

    report.push('## Solution');
    if (solution.isSolution) {
      report.push('✓ **Solution Found**');
      report.push(`- Method: ${solution.method}`);
      report.push(`- Search Steps: ${solution.searchSteps}`);
      report.push(`- Time Elapsed: ${solution.timeElapsed}ms`);
      report.push('');

      report.push('### Assignment');
      for (const [varId, value] of solution.assignment.values) {
        const variable = csp.variables.get(varId);
        report.push(`- ${variable?.name || varId} = ${value}`);
      }

      if (solution.objectiveValue !== undefined) {
        report.push(`**Objective Value:** ${solution.objectiveValue}`);
      }
    } else {
      report.push('✗ **No Solution Found**');
      report.push(`- Search Steps: ${solution.searchSteps}`);
      report.push(`- Time Elapsed: ${solution.timeElapsed}ms`);
      report.push(`- Violated Constraints: ${solution.assignment.violatedConstraints.join(', ')}`);
    }

    return report.join('\n');
  }
}
