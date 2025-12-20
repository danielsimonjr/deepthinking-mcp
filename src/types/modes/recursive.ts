/**
 * Recursive Reasoning Mode - Type Definitions
 * Phase 10 Sprint 3 (v8.4.0) - Problem decomposition, base cases, recurrence relations
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Recursive thought extends base thought with decomposition structures
 */
export interface RecursiveThought extends BaseThought {
  mode: ThinkingMode.RECURSIVE;
  thoughtType:
    | 'problem_decomposition'
    | 'base_case_identification'
    | 'recursive_case_definition'
    | 'recurrence_formulation'
    | 'solution_combination'
    | 'recursive_step'
    | 'subproblem_solution'
    | 'termination_analysis';

  /** Current recursion depth */
  currentDepth: number;

  /** Maximum allowed recursion depth */
  maxDepth: number;

  /** Whether a base case has been reached */
  baseCaseReached: boolean;

  /** Decomposition strategy being used */
  strategy: RecursiveStrategy;

  /** Division factor for divide and conquer */
  divisionFactor?: number;

  /** Subproblems identified */
  subproblems?: Subproblem[];

  /** Base cases defined */
  baseCases?: BaseCase[];

  /** Recurrence relation if applicable */
  recurrence?: RecurrenceRelation;

  /** Current call stack for tracing */
  callStack?: RecursiveCall[];

  /** Memoization cache state */
  memoization?: MemoizationState;
}

/**
 * Decomposition strategy types
 */
export type RecursiveStrategy =
  | 'divide_and_conquer'
  | 'decrease_and_conquer'
  | 'transform_and_conquer'
  | 'dynamic_programming';

/**
 * A subproblem in the decomposition
 */
export interface Subproblem {
  id: string;
  name?: string;
  description: string;
  size: number | string;
  depth?: number;
  parent?: string;
  parentId?: string;
  status: 'pending' | 'in_progress' | 'solving' | 'solved';
  solution?: unknown;
  result?: string;
}

/**
 * Base case definition
 */
export interface BaseCase {
  id: string;
  condition: string;
  result: unknown;
  reachedCount?: number;
  verified?: boolean;
}

/**
 * Recurrence relation definition
 */
export interface RecurrenceRelation {
  formula: string;
  latex?: string;
  baseCase?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  closedForm?: string;
  complexity?: string;
}

/**
 * A call in the recursive call stack
 */
export interface RecursiveCall {
  depth: number;
  input: string;
  timestamp: Date;
  completed: boolean;
  result?: unknown;
}

/**
 * Memoization cache state
 */
export interface MemoizationState {
  enabled: boolean;
  hits: number;
  misses: number;
  cacheSize: number;
}

/**
 * Type guard for Recursive thoughts
 */
export function isRecursiveThought(thought: BaseThought): thought is RecursiveThought {
  return thought.mode === ThinkingMode.RECURSIVE;
}
