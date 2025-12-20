/**
 * ConstraintHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Constraint reasoning mode with:
 * - Constraint Satisfaction Problem (CSP) formulation
 * - Variable domain tracking
 * - Constraint propagation support
 * - Feasibility analysis
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, Thought } from '../../types/core.js';
import type {
  ConstraintThought,
  CSPVariable,
  CSPConstraint,
  Arc,
} from '../../types/modes/constraint.js';

/**
 * Assignment history entry (local type for handler)
 */
interface Assignment {
  variableId: string;
  value: string | number;
  step: number;
  backtracked: boolean;
}
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

// Re-export for backwards compatibility
export type { ConstraintThought };

/**
 * Valid thought types for constraint mode
 */
const VALID_THOUGHT_TYPES = [
  'problem_formulation',
  'variable_definition',
  'constraint_definition',
  'domain_reduction',
  'arc_consistency',
  'propagation',
  'solution_search',
  'backtracking',
  'feasibility_check',
] as const;

type ConstraintThoughtType = (typeof VALID_THOUGHT_TYPES)[number];

/**
 * Valid constraint types
 */
const VALID_CONSTRAINT_TYPES = ['unary', 'binary', 'n_ary', 'global'] as const;

/**
 * Valid constraint priorities
 */
const VALID_PRIORITIES = ['required', 'soft', 'preference'] as const;

/**
 * ConstraintHandler - Specialized handler for constraint reasoning
 *
 * Provides:
 * - CSP problem formulation
 * - Domain tracking and reduction
 * - Constraint propagation support
 * - Solution search with backtracking
 */
export class ConstraintHandler implements ModeHandler {
  readonly mode = ThinkingMode.CONSTRAINT;
  readonly modeName = 'Constraint Reasoning';
  readonly description =
    'Constraint satisfaction, domain reduction, propagation, and feasibility analysis';

  /**
   * Supported thought types for constraint mode
   */
  private readonly supportedThoughtTypes = [...VALID_THOUGHT_TYPES];

  /**
   * Create a constraint thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): ConstraintThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process variables
    const variables = (inputAny.variables || []).map((v: any) => this.normalizeVariable(v));

    // Process constraints
    const constraints = (inputAny.constraints || inputAny.cspConstraints || []).map((c: any) =>
      this.normalizeConstraint(c)
    );

    // Process arcs
    const arcs = inputAny.arcs
      ? inputAny.arcs.map((a: any) => this.normalizeArc(a))
      : this.generateArcs(variables, constraints);

    // Process assignments
    const currentAssignments = inputAny.currentAssignments || {};
    const assignmentHistory = (inputAny.assignmentHistory || []).map((a: any) =>
      this.normalizeAssignment(a)
    );

    // Check arc consistency
    const isArcConsistent = inputAny.isArcConsistent ?? this.checkArcConsistency(variables, constraints);

    // Determine solution status
    const solutionStatus = this.determineSolutionStatus(
      inputAny.solutionStatus,
      variables,
      constraints,
      currentAssignments
    );

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.CONSTRAINT,

      // Core constraint fields
      thoughtType,
      variables,
      constraints,
      currentAssignments,
      assignmentHistory,
      searchStep: inputAny.searchStep ?? assignmentHistory.length,
      backtracks: inputAny.backtracks ?? assignmentHistory.filter((a: Assignment) => a.backtracked).length,
      arcs,
      isArcConsistent,
      solutionStatus,
      solutionCount: inputAny.solutionCount ?? 0,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate constraint-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: { field: string; message: string; code: string }[] = [];
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate thought type
    if (inputAny.thoughtType && !VALID_THOUGHT_TYPES.includes(inputAny.thoughtType)) {
      warnings.push(
        createValidationWarning(
          'thoughtType',
          `Unknown thought type: ${inputAny.thoughtType}`,
          `Valid types: ${VALID_THOUGHT_TYPES.join(', ')}`
        )
      );
    }

    // Validate variables have domains
    if (inputAny.variables) {
      for (let i = 0; i < inputAny.variables.length; i++) {
        const v = inputAny.variables[i];
        if (!v.domain || v.domain.length === 0) {
          warnings.push(
            createValidationWarning(
              `variables[${i}].domain`,
              `Variable "${v.name || v.id}" has empty domain`,
              'Empty domains indicate infeasibility'
            )
          );
        }
      }
    }

    // Validate constraints reference valid variables
    const varIds = new Set((inputAny.variables || []).map((v: any) => v.id || v.name));
    const cspConstraints = inputAny.constraints || inputAny.cspConstraints || [];

    for (let i = 0; i < cspConstraints.length; i++) {
      const c = cspConstraints[i];
      if (c.variables) {
        for (const varRef of c.variables) {
          if (!varIds.has(varRef)) {
            warnings.push(
              createValidationWarning(
                `constraints[${i}].variables`,
                `Constraint references unknown variable: ${varRef}`,
                'Ensure all constraint variables are defined'
              )
            );
          }
        }
      }

      // Validate constraint type
      if (c.type && !VALID_CONSTRAINT_TYPES.includes(c.type)) {
        warnings.push(
          createValidationWarning(
            `constraints[${i}].type`,
            `Unknown constraint type: ${c.type}`,
            `Valid types: ${VALID_CONSTRAINT_TYPES.join(', ')}`
          )
        );
      }

      // Validate priority
      if (c.priority && !VALID_PRIORITIES.includes(c.priority)) {
        warnings.push(
          createValidationWarning(
            `constraints[${i}].priority`,
            `Unknown priority: ${c.priority}`,
            `Valid priorities: ${VALID_PRIORITIES.join(', ')}`
          )
        );
      }

      // Warn about missing expression
      if (!c.expression) {
        warnings.push(
          createValidationWarning(
            `constraints[${i}].expression`,
            'Constraint lacks expression',
            'Define the constraint condition'
          )
        );
      }
    }

    // Check for conflicting assignments
    if (inputAny.currentAssignments && inputAny.variables) {
      for (const [varId, value] of Object.entries(inputAny.currentAssignments)) {
        const variable = inputAny.variables.find((v: any) => (v.id || v.name) === varId);
        if (variable && variable.domain && !variable.domain.includes(value)) {
          warnings.push(
            createValidationWarning(
              `currentAssignments[${varId}]`,
              `Assigned value ${value} not in domain`,
              'Assignment violates domain constraint'
            )
          );
        }
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get constraint-specific enhancements
   */
  getEnhancements(thought: Thought): ModeEnhancements {
    const cspThought = thought as ConstraintThought;
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.OPTIMIZATION, ThinkingMode.ALGORITHMIC, ThinkingMode.FORMALLOGIC],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        variableCount: cspThought.variables.length,
        constraintCount: cspThought.constraints.length,
        assignedCount: Object.keys(cspThought.currentAssignments).length,
        backtrackCount: cspThought.backtracks,
        searchStep: cspThought.searchStep || 0,
        solutionCount: cspThought.solutionCount || 0,
      },
      mentalModels: [
        'Constraint Propagation',
        'Arc Consistency',
        'Backtracking Search',
        'Domain Reduction',
        'Conflict-Directed Backjumping',
      ],
    };

    // Solution status
    enhancements.suggestions!.push(`Status: ${cspThought.solutionStatus || 'unknown'}`);

    // Arc consistency info
    if (cspThought.isArcConsistent) {
      enhancements.suggestions!.push('Problem is arc-consistent');
    } else {
      enhancements.warnings!.push('Problem is not arc-consistent - consider propagation');
    }

    // Thought type-specific guidance
    switch (cspThought.thoughtType) {
      case 'problem_formulation':
        enhancements.guidingQuestions!.push(
          'What are the decision variables?',
          'What constraints must be satisfied?',
          'Are there any global constraints?'
        );
        break;

      case 'variable_definition':
        enhancements.guidingQuestions!.push(
          'What is the domain of each variable?',
          'Are domains finite and discrete?',
          'Can domains be reduced initially?'
        );
        const avgDomainSize =
          cspThought.variables.length > 0
            ? cspThought.variables.reduce((sum, v) => sum + v.domain.length, 0) / cspThought.variables.length
            : 0;
        enhancements.suggestions!.push(`Average domain size: ${avgDomainSize.toFixed(1)}`);
        break;

      case 'constraint_definition':
        enhancements.guidingQuestions!.push(
          'Are all constraints necessary?',
          'Are there redundant constraints?',
          'Can constraints be tightened?'
        );
        const requiredCount = cspThought.constraints.filter((c) => c.priority === 'required').length;
        const softCount = cspThought.constraints.length - requiredCount;
        enhancements.suggestions!.push(`Constraints: ${requiredCount} required, ${softCount} soft`);
        break;

      case 'domain_reduction':
        enhancements.guidingQuestions!.push(
          'Which values can be pruned?',
          'Are there singleton domains?',
          'Has propagation been exhausted?'
        );
        const reducedCount = cspThought.variables.filter((v) => v.domainReduced).length;
        enhancements.suggestions!.push(`Variables with reduced domains: ${reducedCount}`);
        break;

      case 'arc_consistency':
        enhancements.guidingQuestions!.push(
          'Are all arcs consistent?',
          'Which arcs need revision?',
          'Has a fixpoint been reached?'
        );
        if (cspThought.arcs) {
          enhancements.suggestions!.push(`Arcs: ${cspThought.arcs.length}`);
        }
        break;

      case 'propagation':
        enhancements.guidingQuestions!.push(
          'What can be inferred from current assignments?',
          'Are there forced assignments?',
          'Can we detect early failure?'
        );
        break;

      case 'solution_search':
        enhancements.guidingQuestions!.push(
          'Which variable should be assigned next?',
          'What value should be tried first?',
          'Is the current partial solution extensible?'
        );
        const progress = cspThought.variables.length > 0
          ? (Object.keys(cspThought.currentAssignments).length / cspThought.variables.length) * 100
          : 0;
        enhancements.suggestions!.push(`Search progress: ${progress.toFixed(1)}%`);
        break;

      case 'backtracking':
        enhancements.guidingQuestions!.push(
          'Why did the current assignment fail?',
          'What is the most recent decision point?',
          'Can we learn from this failure (nogood)?'
        );
        enhancements.suggestions!.push(`Backtracks so far: ${cspThought.backtracks}`);
        break;

      case 'feasibility_check':
        enhancements.guidingQuestions!.push(
          'Is the problem satisfiable?',
          'Are there inconsistent constraints?',
          'What is the minimal unsatisfiable subset?'
        );
        break;
    }

    // Check for empty domains
    const emptyDomainVars = cspThought.variables.filter((v) => v.domain.length === 0);
    if (emptyDomainVars.length > 0) {
      enhancements.warnings!.push(
        `${emptyDomainVars.length} variable(s) have empty domains - problem is infeasible`
      );
    }

    // Check for high backtrack rate
    const searchStep = cspThought.searchStep || 0;
    if (searchStep > 0 && cspThought.backtracks / searchStep > 0.5) {
      enhancements.warnings!.push(
        'High backtrack rate - consider better variable/value ordering'
      );
    }

    // Suggest heuristics
    if (cspThought.thoughtType === 'solution_search') {
      enhancements.mentalModels!.push(
        'MRV (Minimum Remaining Values)',
        'Degree Heuristic',
        'LCV (Least Constraining Value)'
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as ConstraintThoughtType);
  }

  /**
   * Resolve thought type from input
   */
  private resolveThoughtType(inputType: string | undefined): ConstraintThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as ConstraintThoughtType)) {
      return inputType as ConstraintThoughtType;
    }
    return 'problem_formulation';
  }

  /**
   * Normalize variable
   */
  private normalizeVariable(variable: any): CSPVariable {
    return {
      id: variable.id || randomUUID(),
      name: variable.name || '',
      domain: variable.domain || [],
      currentValue: variable.currentValue,
      domainReduced: variable.domainReduced ?? false,
      assignedAt: variable.assignedAt,
    };
  }

  /**
   * Normalize constraint
   */
  private normalizeConstraint(constraint: any): CSPConstraint {
    // Determine constraint type from arity if not specified
    let type = constraint.type;
    if (!type && constraint.variables) {
      const arity = constraint.variables.length;
      if (arity === 1) type = 'unary';
      else if (arity === 2) type = 'binary';
      else type = 'n_ary';
    }

    return {
      id: constraint.id || randomUUID(),
      name: constraint.name || '',
      type: VALID_CONSTRAINT_TYPES.includes(type) ? type : 'binary',
      variables: constraint.variables || [],
      expression: constraint.expression || '',
      satisfied: constraint.satisfied,
      priority: VALID_PRIORITIES.includes(constraint.priority) ? constraint.priority : 'required',
      weight: constraint.weight,
    };
  }

  /**
   * Normalize arc
   */
  private normalizeArc(arc: any): Arc {
    return {
      from: arc.from || '',
      to: arc.to || '',
      constraintId: arc.constraintId || '',
    };
  }

  /**
   * Normalize assignment
   */
  private normalizeAssignment(assignment: any): Assignment {
    return {
      variableId: assignment.variableId || '',
      value: assignment.value,
      step: assignment.step || 0,
      backtracked: assignment.backtracked ?? false,
    };
  }

  /**
   * Generate arcs from binary constraints
   */
  private generateArcs(_variables: CSPVariable[], constraints: CSPConstraint[]): Arc[] {
    const arcs: Arc[] = [];

    for (const constraint of constraints) {
      if (constraint.type === 'binary' && constraint.variables.length === 2) {
        const [v1, v2] = constraint.variables;
        arcs.push({ from: v1, to: v2, constraintId: constraint.id });
        arcs.push({ from: v2, to: v1, constraintId: constraint.id });
      }
    }

    return arcs;
  }

  /**
   * Check basic arc consistency (simplified)
   */
  private checkArcConsistency(variables: CSPVariable[], constraints: CSPConstraint[]): boolean {
    // Simplified check - if any variable has empty domain, not consistent
    for (const v of variables) {
      if (v.domain.length === 0) {
        return false;
      }
    }

    // Check if any constraint is definitely unsatisfied
    for (const c of constraints) {
      if (c.satisfied === false && c.priority === 'required') {
        return false;
      }
    }

    return true;
  }

  /**
   * Determine solution status
   */
  private determineSolutionStatus(
    explicit: string | undefined,
    variables: CSPVariable[],
    constraints: CSPConstraint[],
    assignments: Record<string, string | number>
  ): ConstraintThought['solutionStatus'] {
    // Use explicit status if provided and valid
    const validStatuses = ['searching', 'found', 'infeasible', 'timeout'] as const;
    if (explicit && validStatuses.includes(explicit as any)) {
      return explicit as ConstraintThought['solutionStatus'];
    }

    // Check for empty domains (infeasible)
    if (variables.some((v) => v.domain.length === 0)) {
      return 'infeasible';
    }

    // Check if all variables are assigned
    const allAssigned = variables.every((v) => assignments[v.id] !== undefined || assignments[v.name] !== undefined);
    if (allAssigned && variables.length > 0) {
      // Check if all required constraints are satisfied
      const allSatisfied = constraints
        .filter((c) => c.priority === 'required')
        .every((c) => c.satisfied !== false);
      if (allSatisfied) {
        return 'found';
      }
    }

    return 'searching';
  }
}
