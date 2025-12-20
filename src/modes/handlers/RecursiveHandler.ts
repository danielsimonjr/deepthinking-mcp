/**
 * RecursiveHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Recursive reasoning mode with:
 * - Problem decomposition tracking
 * - Base case identification
 * - Recursion depth monitoring
 * - Subproblem relationship analysis
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, Thought } from '../../types/core.js';
import type { RecursiveThought, Subproblem, BaseCase, RecurrenceRelation } from '../../types/modes/recursive.js';
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
export type { RecursiveThought };

/**
 * Valid thought types for recursive mode
 */
const VALID_THOUGHT_TYPES = [
  'problem_decomposition',
  'base_case_identification',
  'recursive_step',
  'subproblem_solution',
  'solution_combination',
  'termination_analysis',
] as const;

type RecursiveThoughtType = (typeof VALID_THOUGHT_TYPES)[number];

/**
 * Valid decomposition strategies
 */
const VALID_STRATEGIES = [
  'divide_and_conquer',
  'decrease_and_conquer',
  'transform_and_conquer',
  'dynamic_programming',
] as const;

type DecompositionStrategy = (typeof VALID_STRATEGIES)[number];

/**
 * RecursiveHandler - Specialized handler for recursive reasoning
 *
 * Provides:
 * - Problem decomposition into subproblems
 * - Base case identification and verification
 * - Recursion depth tracking
 * - Termination analysis
 */
export class RecursiveHandler implements ModeHandler {
  readonly mode = ThinkingMode.RECURSIVE;
  readonly modeName = 'Recursive Reasoning';
  readonly description =
    'Problem decomposition, base case identification, and recursive solution construction';

  /**
   * Supported thought types for recursive mode
   */
  private readonly supportedThoughtTypes = [...VALID_THOUGHT_TYPES];

  /**
   * Create a recursive thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): RecursiveThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process subproblems
    const subproblems = inputAny.subproblems
      ? inputAny.subproblems.map((s: any) => this.normalizeSubproblem(s, 0))
      : undefined;

    // Process base cases
    const baseCases = inputAny.baseCases
      ? inputAny.baseCases.map((b: any) => this.normalizeBaseCase(b))
      : undefined;

    // Determine if base case is reached
    const baseCaseReached = inputAny.baseCaseReached ?? (baseCases?.some((b: BaseCase) => b.verified) || false);

    // Process recurrence
    const recurrence = inputAny.recurrence
      ? this.normalizeRecurrence(inputAny.recurrence)
      : undefined;

    // Resolve strategy
    const strategy = this.resolveStrategy(inputAny.strategy);

    // Calculate depths
    const currentDepth = inputAny.currentDepth ?? this.calculateCurrentDepth(subproblems);
    const maxDepth = inputAny.maxDepth ?? Math.max(10, currentDepth + 5);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.RECURSIVE,

      // Core recursive fields
      thoughtType,
      subproblems,
      currentDepth,
      maxDepth,
      baseCases,
      baseCaseReached,
      recurrence,
      strategy,
      divisionFactor: inputAny.divisionFactor,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate recursive-specific input
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

    // Validate strategy
    if (inputAny.strategy && !VALID_STRATEGIES.includes(inputAny.strategy)) {
      warnings.push(
        createValidationWarning(
          'strategy',
          `Unknown strategy: ${inputAny.strategy}`,
          `Valid strategies: ${VALID_STRATEGIES.join(', ')}`
        )
      );
    }

    // Validate depth limits
    if (inputAny.currentDepth !== undefined && inputAny.maxDepth !== undefined) {
      if (inputAny.currentDepth > inputAny.maxDepth) {
        warnings.push(
          createValidationWarning(
            'currentDepth',
            `Current depth (${inputAny.currentDepth}) exceeds max depth (${inputAny.maxDepth})`,
            'Recursion may be too deep - check for infinite recursion'
          )
        );
      }
    }

    // Validate base cases for solution combination
    if (inputAny.thoughtType === 'solution_combination') {
      if (!inputAny.baseCases || inputAny.baseCases.length === 0) {
        warnings.push(
          createValidationWarning(
            'baseCases',
            'Solution combination without base cases',
            'Define base cases for proper recursion termination'
          )
        );
      }
    }

    // Warn about missing subproblems for decomposition
    if (inputAny.thoughtType === 'problem_decomposition') {
      if (!inputAny.subproblems || inputAny.subproblems.length === 0) {
        warnings.push(
          createValidationWarning(
            'subproblems',
            'Problem decomposition without subproblems',
            'Identify subproblems for divide-and-conquer approach'
          )
        );
      }
    }

    // Validate division factor
    if (inputAny.divisionFactor !== undefined && inputAny.divisionFactor < 2) {
      warnings.push(
        createValidationWarning(
          'divisionFactor',
          `Division factor (${inputAny.divisionFactor}) should be >= 2`,
          'Typical values are 2 (binary) or 3 (ternary)'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get recursive-specific enhancements
   */
  getEnhancements(thought: Thought): ModeEnhancements {
    const recThought = thought as RecursiveThought;
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.ALGORITHMIC, ThinkingMode.MATHEMATICS, ThinkingMode.OPTIMIZATION],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        currentDepth: recThought.currentDepth,
        maxDepth: recThought.maxDepth,
        subproblemCount: recThought.subproblems?.length || 0,
        baseCaseCount: recThought.baseCases?.length || 0,
        baseCaseReached: recThought.baseCaseReached ? 1 : 0,
      },
      mentalModels: [
        'Divide and Conquer',
        'Mathematical Induction',
        'Tree Traversal',
        'Master Theorem',
        'Recursive Problem Structure',
      ],
    };

    // Strategy-specific guidance
    enhancements.suggestions!.push(`Strategy: ${recThought.strategy.replace(/_/g, ' ')}`);

    // Thought type-specific guidance
    switch (recThought.thoughtType) {
      case 'problem_decomposition':
        enhancements.guidingQuestions!.push(
          'Can this problem be divided into smaller similar problems?',
          'What is the relationship between subproblems?',
          'Is there overlap between subproblems (memoization opportunity)?'
        );
        if (recThought.subproblems) {
          const pendingCount = recThought.subproblems.filter((s) => s.status === 'pending').length;
          const solvedCount = recThought.subproblems.filter((s) => s.status === 'solved').length;
          enhancements.suggestions!.push(
            `Subproblems: ${solvedCount} solved, ${pendingCount} pending`
          );
        }
        break;

      case 'base_case_identification':
        enhancements.guidingQuestions!.push(
          'What are the smallest/simplest instances of the problem?',
          'Can all base cases be solved directly?',
          'Do base cases cover all termination conditions?'
        );
        if (recThought.baseCases) {
          const verifiedCount = recThought.baseCases.filter((b) => b.verified).length;
          enhancements.suggestions!.push(
            `Base cases: ${verifiedCount}/${recThought.baseCases.length} verified`
          );
        }
        break;

      case 'recursive_step':
        enhancements.guidingQuestions!.push(
          'How do we reduce the problem to smaller instances?',
          'Is progress guaranteed toward base case?',
          'What is the recurrence relation?'
        );
        if (recThought.recurrence) {
          enhancements.suggestions!.push(`Recurrence: ${recThought.recurrence.formula}`);
          if (recThought.recurrence.closedForm) {
            enhancements.suggestions!.push(`Closed form: ${recThought.recurrence.closedForm}`);
          }
        }
        break;

      case 'subproblem_solution':
        enhancements.guidingQuestions!.push(
          'Does the subproblem solution satisfy requirements?',
          'Can this solution be reused (memoization)?',
          'What is the time/space cost of this solution?'
        );
        break;

      case 'solution_combination':
        enhancements.guidingQuestions!.push(
          'How are subproblem solutions combined?',
          'Is the combination step efficient?',
          'Does the combined solution maintain correctness?'
        );
        if (recThought.divisionFactor) {
          enhancements.suggestions!.push(`Division factor: ${recThought.divisionFactor}`);
        }
        break;

      case 'termination_analysis':
        enhancements.guidingQuestions!.push(
          'Is termination guaranteed for all inputs?',
          'What is the maximum recursion depth?',
          'Are there potential stack overflow risks?'
        );
        if (recThought.recurrence?.complexity) {
          enhancements.suggestions!.push(`Time complexity: ${recThought.recurrence.complexity}`);
        }
        break;
    }

    // Depth warnings
    if (recThought.currentDepth > recThought.maxDepth * 0.8) {
      enhancements.warnings!.push(
        `High recursion depth (${recThought.currentDepth}/${recThought.maxDepth}) - nearing limit`
      );
    }

    // Base case warning
    if (!recThought.baseCaseReached && recThought.currentDepth > 0) {
      if (!recThought.baseCases || recThought.baseCases.length === 0) {
        enhancements.warnings!.push('No base cases defined - ensure termination condition exists');
      }
    }

    // Strategy-specific suggestions
    if (recThought.strategy === 'dynamic_programming') {
      enhancements.suggestions!.push('Consider memoization to avoid redundant computation');
      enhancements.relatedModes!.push(ThinkingMode.OPTIMIZATION);
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as RecursiveThoughtType);
  }

  /**
   * Resolve thought type from input
   */
  private resolveThoughtType(inputType: string | undefined): RecursiveThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as RecursiveThoughtType)) {
      return inputType as RecursiveThoughtType;
    }
    return 'problem_decomposition';
  }

  /**
   * Resolve strategy from input
   */
  private resolveStrategy(inputStrategy: string | undefined): DecompositionStrategy {
    if (inputStrategy && VALID_STRATEGIES.includes(inputStrategy as DecompositionStrategy)) {
      return inputStrategy as DecompositionStrategy;
    }
    return 'divide_and_conquer';
  }

  /**
   * Normalize subproblem
   */
  private normalizeSubproblem(sub: any, defaultDepth: number): Subproblem {
    return {
      id: sub.id || randomUUID(),
      name: sub.name || '',
      description: sub.description || '',
      size: sub.size ?? 'unknown',
      depth: sub.depth ?? defaultDepth,
      parentId: sub.parentId,
      status: sub.status || 'pending',
      result: sub.result,
    };
  }

  /**
   * Normalize base case
   */
  private normalizeBaseCase(baseCase: any): BaseCase {
    return {
      id: baseCase.id || randomUUID(),
      condition: baseCase.condition || '',
      result: baseCase.result || '',
      verified: baseCase.verified ?? false,
    };
  }

  /**
   * Normalize recurrence relation
   */
  private normalizeRecurrence(rec: any): RecurrenceRelation {
    return {
      formula: rec.formula || '',
      baseCase: rec.baseCase || '',
      closedForm: rec.closedForm,
      complexity: rec.complexity,
    };
  }

  /**
   * Calculate current depth from subproblems
   */
  private calculateCurrentDepth(subproblems?: Subproblem[]): number {
    if (!subproblems || subproblems.length === 0) {
      return 0;
    }
    return Math.max(...subproblems.map((s) => s.depth ?? 0)) + 1;
  }
}
