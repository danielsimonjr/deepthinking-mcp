/**
 * Constraint Satisfaction Mode - Type Definitions
 * Phase 10 Sprint 3 (v8.4.0) - CSP formulation, constraint propagation, search
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Constraint thought extends base thought with CSP structures
 */
export interface ConstraintThought extends BaseThought {
  mode: ThinkingMode.CONSTRAINT;
  thoughtType:
    | 'problem_formulation'
    | 'variable_definition'
    | 'constraint_definition'
    | 'domain_reduction'
    | 'arc_consistency'
    | 'propagation'
    | 'solution_search'
    | 'backtracking'
    | 'feasibility_check'
    | 'consistency_check';

  /** Variables in the CSP */
  variables: CSPVariable[];

  /** Constraints between variables */
  constraints: CSPConstraint[];

  /** Current variable assignments */
  currentAssignments: Record<string, string | number>;

  /** Assignment history */
  assignmentHistory?: AssignmentHistoryEntry[];

  /** Number of backtracks performed */
  backtracks: number;

  /** Current search step */
  searchStep?: number;

  /** Constraint propagation method used */
  propagationMethod?: PropagationMethod;

  /** Search strategy being used */
  searchStrategy?: SearchStrategy;

  /** Arcs for arc consistency */
  arcs?: Arc[];

  /** Whether the problem is arc consistent */
  isArcConsistent?: boolean;

  /** Current consistency level */
  consistencyLevel?: ConsistencyLevel;

  /** Solution status */
  solutionStatus?: 'searching' | 'found' | 'infeasible' | 'timeout';

  /** Number of solutions found */
  solutionCount?: number;

  /** Solutions found */
  solutions?: Assignment[];
}

/**
 * A variable in the CSP
 */
export interface CSPVariable {
  id: string;
  name: string;
  domain: (string | number)[];
  currentDomain?: (string | number)[];
  currentValue?: string | number;
  assigned?: unknown;
  domainReduced?: boolean;
  assignedAt?: number;
}

/**
 * A constraint in the CSP
 */
export interface CSPConstraint {
  id: string;
  name: string;
  type: ConstraintType;
  variables: string[];
  expression: string;
  isSatisfied?: boolean;
  satisfied?: boolean;
  priority?: 'required' | 'soft' | 'preference';
  weight?: number;
}

/**
 * Constraint types
 */
export type ConstraintType =
  | 'unary'
  | 'binary'
  | 'n_ary'
  | 'global'
  | 'alldifferent'
  | 'sum'
  | 'element';

/**
 * An arc in the constraint graph
 */
export interface Arc {
  from: string;
  to: string;
  constraint?: string;
  constraintId?: string;
  isConsistent?: boolean;
}

/**
 * Propagation methods
 */
export type PropagationMethod =
  | 'none'
  | 'forward_checking'
  | 'arc_consistency'
  | 'path_consistency'
  | 'generalized_arc_consistency';

/**
 * Search strategies
 */
export type SearchStrategy =
  | 'backtracking'
  | 'backjumping'
  | 'conflict_directed'
  | 'dynamic_backtracking'
  | 'local_search';

/**
 * Consistency levels
 */
export type ConsistencyLevel =
  | 'node_consistent'
  | 'arc_consistent'
  | 'path_consistent'
  | 'k_consistent'
  | 'globally_consistent';

/**
 * Assignment history entry
 */
export interface AssignmentHistoryEntry {
  variableId: string;
  value: string | number;
  step: number;
  backtracked: boolean;
}

/**
 * A complete or partial assignment
 */
export interface Assignment {
  id: string;
  values: Record<string, unknown>;
  isComplete: boolean;
  isConsistent: boolean;
  violatedConstraints: string[];
}

/**
 * Type guard for Constraint thoughts
 */
export function isConstraintThought(thought: BaseThought): thought is ConstraintThought {
  return thought.mode === ThinkingMode.CONSTRAINT;
}
