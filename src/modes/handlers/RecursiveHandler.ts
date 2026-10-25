/**
 * RecursiveHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Recursive reasoning mode with:
 * - Problem decomposition tracking
 * - Base case identification
 * - Recursion depth monitoring
 * - Subproblem relationship analysis
 */

import { randomUUID } from "crypto";
import { ThinkingMode, Thought } from "../../types/core.js";
import type {
  RecursiveThought,
  Subproblem,
  BaseCase,
  RecurrenceRelation,
} from "../../types/modes/recursive.js";
import type { ThinkingToolInput } from "../../tools/thinking.js";
import type { EngineeringInput } from "../../tools/schemas/modes/engineering.js";
import {
  ModeHandler,
  ValidationResult,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from "./ModeHandler.js";
import {
  ignoredMembersWarning,
  inputWarningsField,
  unrecognisedValueWarning,
} from "./input-warnings.js";

// Re-export for backwards compatibility
export type { RecursiveThought };

/**
 * Valid thought types for recursive mode
 */
const VALID_THOUGHT_TYPES = [
  "problem_decomposition",
  "base_case_identification",
  "recursive_step",
  "subproblem_solution",
  "solution_combination",
  "termination_analysis",
] as const;

type RecursiveThoughtType = (typeof VALID_THOUGHT_TYPES)[number];

/**
 * Valid decomposition strategies
 */
const VALID_STRATEGIES = [
  "divide_and_conquer",
  "decrease_and_conquer",
  "transform_and_conquer",
  "dynamic_programming",
] as const;

type DecompositionStrategy = (typeof VALID_STRATEGIES)[number];

/** The thought type that an absent or unrecognised value becomes */
const DEFAULT_THOUGHT_TYPE: RecursiveThoughtType = "problem_decomposition";

/** The strategy that an absent or unrecognised value becomes */
const DEFAULT_STRATEGY: DecompositionStrategy = "divide_and_conquer";

/** Subproblem statuses; an absent status is the first one */
const SUBPROBLEM_STATUSES: readonly Subproblem["status"][] = [
  "pending",
  "in_progress",
  "solving",
  "solved",
];

/**
 * Members of `recurrence` that recursive mode does not read. The Zod schema
 * accepts them because algorithmic mode reads the same object.
 */
const IGNORED_RECURRENCE_MEMBERS = [
  "id",
  "solutionMethod",
  "solution",
  "solutionProof",
  "recursionTree",
] as const;

/** What a request carries in one field, as the Zod schema of the tool types it. */
type Sent<K extends keyof EngineeringInput> = NonNullable<EngineeringInput[K]>;

/** The request fields that this handler reads, typed by the Zod schema that lets them through. */
type RecursiveRequest = Pick<
  EngineeringInput,
  | "thoughtType"
  | "subproblems"
  | "baseCases"
  | "baseCaseReached"
  | "currentDepth"
  | "maxDepth"
  | "recurrence"
  | "strategy"
  | "divisionFactor"
>;

/** Whether a value is one of the thought types that this handler recognises. */
const isThoughtType = (value: unknown): value is RecursiveThoughtType =>
  typeof value === "string" &&
  (VALID_THOUGHT_TYPES as readonly string[]).includes(value);

/** Whether a value is one of the strategies that this handler recognises. */
const isStrategy = (value: unknown): value is DecompositionStrategy =>
  typeof value === "string" &&
  (VALID_STRATEGIES as readonly string[]).includes(value);

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
  readonly modeName = "Recursive Reasoning";
  readonly description =
    "Problem decomposition, base case identification, and recursive solution construction";

  /**
   * Supported thought types for recursive mode
   */
  private readonly supportedThoughtTypes = [...VALID_THOUGHT_TYPES];

  /**
   * Create a recursive thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): RecursiveThought {
    const req = input as unknown as RecursiveRequest;

    // Sentences for the values replaced, kept as sent or ignored below;
    // validateCommon() reports each one in the `validation` field of the answer.
    // A sentence that repeats (the same status on two subproblems) counts once.
    const notes = new Set<string | undefined>();

    // Resolve thought type
    notes.add(
      unrecognisedValueWarning(
        "thoughtType",
        req.thoughtType,
        VALID_THOUGHT_TYPES,
        DEFAULT_THOUGHT_TYPE,
      ),
    );
    const thoughtType = this.resolveThoughtType(req.thoughtType);

    // Resolve strategy
    notes.add(
      unrecognisedValueWarning(
        "strategy",
        req.strategy,
        VALID_STRATEGIES,
        DEFAULT_STRATEGY,
      ),
    );
    const strategy = this.resolveStrategy(req.strategy);

    // Process subproblems
    const subproblems = req.subproblems?.map((s) =>
      this.normalizeSubproblem(s, 0, notes),
    );

    // Process base cases
    const baseCases = req.baseCases?.map((b) => this.normalizeBaseCase(b));

    // Determine if base case is reached
    const baseCaseReached =
      req.baseCaseReached ??
      (baseCases?.some((b: BaseCase) => b.verified) || false);

    // Process recurrence
    const recurrence = req.recurrence
      ? this.normalizeRecurrence(req.recurrence, notes)
      : undefined;

    // Calculate depths
    const currentDepth =
      req.currentDepth ?? this.calculateCurrentDepth(subproblems);
    const maxDepth = req.maxDepth ?? Math.max(10, currentDepth + 5);

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
      divisionFactor: req.divisionFactor,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,

      ...inputWarningsField([...notes]),
    };
  }

  /**
   * Validate recursive-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: { field: string; message: string; code: string }[] = [];
    const warnings: ValidationWarning[] = [];
    const req = input as unknown as RecursiveRequest;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError(
          "thought",
          "Thought content is required",
          "EMPTY_THOUGHT",
        ),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          "thoughtNumber",
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          "INVALID_THOUGHT_NUMBER",
        ),
      ]);
    }

    // Validate thought type
    if (req.thoughtType && !isThoughtType(req.thoughtType)) {
      warnings.push(
        createValidationWarning(
          "thoughtType",
          `Unknown thought type: ${req.thoughtType}`,
          `Valid types: ${VALID_THOUGHT_TYPES.join(", ")}`,
        ),
      );
    }

    // Validate strategy
    if (req.strategy && !isStrategy(req.strategy)) {
      warnings.push(
        createValidationWarning(
          "strategy",
          `Unknown strategy: ${req.strategy}`,
          `Valid strategies: ${VALID_STRATEGIES.join(", ")}`,
        ),
      );
    }

    // Validate depth limits
    if (req.currentDepth !== undefined && req.maxDepth !== undefined) {
      if (req.currentDepth > req.maxDepth) {
        warnings.push(
          createValidationWarning(
            "currentDepth",
            `Current depth (${req.currentDepth}) exceeds max depth (${req.maxDepth})`,
            "Recursion may be too deep - check for infinite recursion",
          ),
        );
      }
    }

    // Validate base cases for solution combination
    if (req.thoughtType === "solution_combination") {
      if (!req.baseCases || req.baseCases.length === 0) {
        warnings.push(
          createValidationWarning(
            "baseCases",
            "Solution combination without base cases",
            "Define base cases for proper recursion termination",
          ),
        );
      }
    }

    // Warn about missing subproblems for decomposition
    if (req.thoughtType === "problem_decomposition") {
      if (!req.subproblems || req.subproblems.length === 0) {
        warnings.push(
          createValidationWarning(
            "subproblems",
            "Problem decomposition without subproblems",
            "Identify subproblems for divide-and-conquer approach",
          ),
        );
      }
    }

    // Validate division factor
    if (req.divisionFactor !== undefined && req.divisionFactor < 2) {
      warnings.push(
        createValidationWarning(
          "divisionFactor",
          `Division factor (${req.divisionFactor}) should be >= 2`,
          "Typical values are 2 (binary) or 3 (ternary)",
        ),
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
      relatedModes: [
        ThinkingMode.ALGORITHMIC,
        ThinkingMode.MATHEMATICS,
        ThinkingMode.OPTIMIZATION,
      ],
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
        "Divide and Conquer",
        "Mathematical Induction",
        "Tree Traversal",
        "Master Theorem",
        "Recursive Problem Structure",
      ],
    };

    // Strategy-specific guidance
    enhancements.suggestions!.push(
      `Strategy: ${recThought.strategy.replace(/_/g, " ")}`,
    );

    // Thought type-specific guidance
    switch (recThought.thoughtType) {
      case "problem_decomposition":
        enhancements.guidingQuestions!.push(
          "Can this problem be divided into smaller similar problems?",
          "What is the relationship between subproblems?",
          "Is there overlap between subproblems (memoization opportunity)?",
        );
        if (recThought.subproblems) {
          const pendingCount = recThought.subproblems.filter(
            (s) => s.status === "pending",
          ).length;
          const solvedCount = recThought.subproblems.filter(
            (s) => s.status === "solved",
          ).length;
          enhancements.suggestions!.push(
            `Subproblems: ${solvedCount} solved, ${pendingCount} pending`,
          );
        }
        break;

      case "base_case_identification":
        enhancements.guidingQuestions!.push(
          "What are the smallest/simplest instances of the problem?",
          "Can all base cases be solved directly?",
          "Do base cases cover all termination conditions?",
        );
        if (recThought.baseCases) {
          const verifiedCount = recThought.baseCases.filter(
            (b) => b.verified,
          ).length;
          enhancements.suggestions!.push(
            `Base cases: ${verifiedCount}/${recThought.baseCases.length} verified`,
          );
        }
        break;

      case "recursive_step":
        enhancements.guidingQuestions!.push(
          "How do we reduce the problem to smaller instances?",
          "Is progress guaranteed toward base case?",
          "What is the recurrence relation?",
        );
        if (recThought.recurrence) {
          enhancements.suggestions!.push(
            `Recurrence: ${recThought.recurrence.formula}`,
          );
          if (recThought.recurrence.closedForm) {
            enhancements.suggestions!.push(
              `Closed form: ${recThought.recurrence.closedForm}`,
            );
          }
        }
        break;

      case "subproblem_solution":
        enhancements.guidingQuestions!.push(
          "Does the subproblem solution satisfy requirements?",
          "Can this solution be reused (memoization)?",
          "What is the time/space cost of this solution?",
        );
        break;

      case "solution_combination":
        enhancements.guidingQuestions!.push(
          "How are subproblem solutions combined?",
          "Is the combination step efficient?",
          "Does the combined solution maintain correctness?",
        );
        if (recThought.divisionFactor) {
          enhancements.suggestions!.push(
            `Division factor: ${recThought.divisionFactor}`,
          );
        }
        break;

      case "termination_analysis":
        enhancements.guidingQuestions!.push(
          "Is termination guaranteed for all inputs?",
          "What is the maximum recursion depth?",
          "Are there potential stack overflow risks?",
        );
        if (recThought.recurrence?.complexity) {
          enhancements.suggestions!.push(
            `Time complexity: ${recThought.recurrence.complexity}`,
          );
        }
        break;
    }

    // Depth warnings
    if (recThought.currentDepth > recThought.maxDepth * 0.8) {
      enhancements.warnings!.push(
        `High recursion depth (${recThought.currentDepth}/${recThought.maxDepth}) - nearing limit`,
      );
    }

    // Base case warning
    if (!recThought.baseCaseReached && recThought.currentDepth > 0) {
      if (!recThought.baseCases || recThought.baseCases.length === 0) {
        enhancements.warnings!.push(
          "No base cases defined - ensure termination condition exists",
        );
      }
    }

    // Strategy-specific suggestions
    if (recThought.strategy === "dynamic_programming") {
      enhancements.suggestions!.push(
        "Consider memoization to avoid redundant computation",
      );
      enhancements.relatedModes!.push(ThinkingMode.OPTIMIZATION);
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(
      thoughtType as RecursiveThoughtType,
    );
  }

  /**
   * Resolve thought type from input
   */
  private resolveThoughtType(
    inputType: string | undefined,
  ): RecursiveThoughtType {
    return isThoughtType(inputType) ? inputType : DEFAULT_THOUGHT_TYPE;
  }

  /**
   * Resolve strategy from input
   */
  private resolveStrategy(
    inputStrategy: string | undefined,
  ): DecompositionStrategy {
    return isStrategy(inputStrategy) ? inputStrategy : DEFAULT_STRATEGY;
  }

  /**
   * Normalize subproblem. An absent status is `pending`; an unrecognised one is
   * kept as sent and recorded in `notes`.
   */
  private normalizeSubproblem(
    sub: Sent<"subproblems">[number],
    defaultDepth: number,
    notes: Set<string | undefined>,
  ): Subproblem {
    notes.add(
      unrecognisedValueWarning(
        "subproblems[].status",
        sub.status,
        SUBPROBLEM_STATUSES,
      ),
    );
    return {
      id: sub.id || randomUUID(),
      name: sub.name || "",
      description: sub.description || "",
      size: sub.size ?? "unknown",
      depth: sub.depth ?? defaultDepth,
      parentId: sub.parentId,
      status: (sub.status || SUBPROBLEM_STATUSES[0]) as Subproblem["status"],
      result: sub.result,
    };
  }

  /**
   * Normalize base case
   */
  private normalizeBaseCase(baseCase: Sent<"baseCases">[number]): BaseCase {
    return {
      id: baseCase.id || randomUUID(),
      condition: baseCase.condition || "",
      result: baseCase.result || "",
      verified: baseCase.verified ?? false,
    };
  }

  /**
   * Normalize recurrence relation. Recursive mode reads four members; a sentence
   * in `notes` names each of the others that the client sent.
   */
  private normalizeRecurrence(
    rec: Sent<"recurrence">,
    notes: Set<string | undefined>,
  ): RecurrenceRelation {
    notes.add(
      ignoredMembersWarning(
        "recursive",
        "recurrence",
        IGNORED_RECURRENCE_MEMBERS.filter(
          (member) => rec[member] !== undefined,
        ),
        "algorithmic",
      ),
    );
    return {
      formula: rec.formula || "",
      baseCase: rec.baseCase || "",
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
