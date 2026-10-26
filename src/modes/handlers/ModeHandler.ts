/**
 * ModeHandler Interface - Phase 10 Sprint 1 (v8.0.0)
 *
 * Defines the contract for mode-specific thought creation handlers.
 * Part of the Strategy Pattern to replace ThoughtFactory's switch statement.
 *
 * Each mode handler encapsulates:
 * - Thought creation logic for a specific mode
 * - Mode-specific validation
 * - Optional enhancements (suggestions, warnings, etc.)
 */

import { randomUUID } from "crypto";
import type { BaseThought, ThinkingMode, Thought } from "../../types/core.js";
import type { ThinkingToolInput } from "../../tools/thinking.js";

/**
 * Result of mode-specific validation
 */
export interface ValidationResult {
  /** Whether the input is valid */
  valid: boolean;
  /** Validation errors if any */
  errors: HandlerValidationError[];
  /** Non-blocking warnings */
  warnings: ValidationWarning[];
}

/**
 * A single blocking problem found by a handler's `validate()`, reported inside
 * a `ValidationResult`. It is plain data and is never thrown — the throwable
 * `ValidationError` class in `src/utils/errors.ts` is a different thing.
 */
export interface HandlerValidationError {
  /** Which field has the error */
  field: string;
  /** Error message */
  message: string;
  /** Error code for programmatic handling */
  code: string;
}

/**
 * Validation warning detail
 */
export interface ValidationWarning {
  /** Which field triggered the warning */
  field: string;
  /** Warning message */
  message: string;
  /** Suggestion for improvement */
  suggestion?: string;
}

/**
 * Detected archetype information for systems thinking
 */
export interface DetectedArchetype {
  name: string;
  confidence: number;
  matchedPatterns: string[];
}

/**
 * Mode-specific enhancements to include in responses
 */
export interface ModeEnhancements {
  /** Suggestions for improving the thought */
  suggestions?: string[];
  /** Related modes that might be useful */
  relatedModes?: ThinkingMode[];
  /** Mode-specific metrics or scores (can be numeric or descriptive) */
  metrics?: Record<string, number | string>;
  /** Guiding questions for the next thought */
  guidingQuestions?: string[];
  /** Warnings about potential issues */
  warnings?: string[];
  /** Mental models relevant to this mode */
  mentalModels?: string[];
  /** Socratic questions for critique mode (by category) */
  socraticQuestions?: Record<string, string[]>;
  /** Detected archetypes for systems thinking mode */
  detectedArchetypes?: DetectedArchetype[];
}

/**
 * ModeHandler Interface
 *
 * Implement this interface to create a specialized handler for a thinking mode.
 * Handlers are registered with ModeHandlerRegistry for use by ThoughtFactory.
 *
 * @example
 * ```typescript
 * class CausalHandler implements ModeHandler {
 *   readonly mode = ThinkingMode.CAUSAL;
 *
 *   createThought(input: ThinkingToolInput, sessionId: string): CausalThought {
 *     // Mode-specific thought creation
 *   }
 *
 *   validate(input: ThinkingToolInput): ValidationResult {
 *     // Validate causal graph structure, detect cycles, etc.
 *   }
 * }
 * ```
 */
export interface ModeHandler {
  /**
   * The thinking mode this handler processes
   */
  readonly mode: ThinkingMode;

  /**
   * Human-readable name for the mode
   */
  readonly modeName: string;

  /**
   * Brief description of what this mode does
   */
  readonly description: string;

  /**
   * Create a thought object from input
   *
   * @param input - Validated input from MCP tool
   * @param sessionId - Session this thought belongs to
   * @returns Typed thought object for the mode
   */
  createThought(input: ThinkingToolInput, sessionId: string): Thought;

  /**
   * Validate mode-specific input
   *
   * Performs semantic validation beyond schema validation.
   * For example: checking causal graph for cycles, validating
   * probability values sum to 1, etc.
   *
   * @param input - Input to validate
   * @returns Validation result with errors and warnings
   */
  validate(input: ThinkingToolInput): ValidationResult;

  /**
   * Get mode-specific enhancements for a thought
   *
   * Optional method to provide additional context, suggestions,
   * or guidance based on the created thought.
   *
   * @param thought - The created thought
   * @returns Enhancements to include in response
   */
  getEnhancements?(thought: Thought): ModeEnhancements;

  /**
   * Check if this handler supports a specific thought type
   *
   * Some modes have sub-types (e.g., mathematics has proof_decomposition,
   * dependency_analysis, etc.). This method checks if a specific
   * thought type is supported.
   *
   * @param thoughtType - The thought type to check
   * @returns true if supported
   */
  supportsThoughtType?(thoughtType: string): boolean;
}

/**
 * Mode status information for API transparency
 *
 * Included in API responses to inform users about the
 * implementation status of the mode they're using.
 */
export interface ModeStatus {
  /** The mode being used */
  mode: ThinkingMode;
  /** Whether this mode has full implementation */
  isFullyImplemented: boolean;
  /** Whether this mode has a specialized handler */
  hasSpecializedHandler: boolean;
  /** Note about the mode's status */
  note?: string;
  /** List of supported thought types */
  supportedThoughtTypes?: string[];
}

/**
 * Create a successful validation result
 */
export function validationSuccess(
  warnings: ValidationWarning[] = [],
): ValidationResult {
  return {
    valid: true,
    errors: [],
    warnings,
  };
}

/**
 * Create a failed validation result
 */
export function validationFailure(
  errors: HandlerValidationError[],
  warnings: ValidationWarning[] = [],
): ValidationResult {
  return {
    valid: false,
    errors,
    warnings,
  };
}

/**
 * Create one entry for a `ValidationResult.errors` list. Returns data; throws
 * nothing.
 */
export function createValidationError(
  field: string,
  message: string,
  code: string,
): HandlerValidationError {
  return { field, message, code };
}

/**
 * Check the two fields that every handler requires: a `thought` with text and a
 * `thoughtNumber` that does not exceed `totalThoughts`.
 *
 * Returns the failure for the first check that fails (the empty thought is
 * checked first), or `undefined` when both pass. A handler calls this at the
 * start of `validate` and returns the failure when there is one.
 */
export function checkThoughtBasics(
  input: ThinkingToolInput,
): ValidationResult | undefined {
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

  return undefined;
}

/**
 * Check the `thoughtType` of the input against the types a handler accepts.
 *
 * Returns the warning for a `thoughtType` that is set but is not in
 * `validTypes`, or `undefined` when the field is empty or valid. The match is
 * exact, so the case matters. A handler calls this in `validate` after
 * `checkThoughtBasics` and adds the warning to its list when there is one.
 */
export function checkThoughtType(
  input: ThinkingToolInput,
  validTypes: readonly string[],
): ValidationWarning | undefined {
  const { thoughtType } = input as { thoughtType?: unknown };
  if (thoughtType && !validTypes.includes(thoughtType as string)) {
    return createValidationWarning(
      "thoughtType",
      `Unknown thought type: ${thoughtType}`,
      `Valid types: ${validTypes.join(", ")}`,
    );
  }
  return undefined;
}

/**
 * Pick the thought type of a new thought from the `thoughtType` of the input.
 *
 * Returns `inputType` when it is one of `supported`, and `fallback` for any other
 * value, including a missing or empty one. The match is exact, so the case
 * matters. A handler calls this in `createThought` with its own list of types
 * and its default type.
 */
export function resolveThoughtType<T extends string>(
  inputType: string | undefined,
  supported: readonly T[],
  fallback: T,
): T {
  return inputType && supported.includes(inputType as T)
    ? (inputType as T)
    : fallback;
}

/**
 * Check that the `uncertainty` of the input, when it is set, lies from 0 to 1.
 *
 * Returns the error for a value outside that range, or `undefined`. A value
 * that no comparison can order, such as `NaN`, is not an error. A handler adds
 * the error to its list when there is one.
 */
export function checkUncertaintyRange(
  input: ThinkingToolInput,
): HandlerValidationError | undefined {
  if (
    input.uncertainty !== undefined &&
    (input.uncertainty < 0 || input.uncertainty > 1)
  ) {
    return createValidationError(
      "uncertainty",
      `Uncertainty (${input.uncertainty}) must be between 0 and 1`,
      "UNCERTAINTY_OUT_OF_RANGE",
    );
  }
  return undefined;
}

/**
 * The fields that every handler copies from the input into a new thought.
 */
type ThoughtBase = Pick<
  BaseThought,
  | "id"
  | "sessionId"
  | "thoughtNumber"
  | "totalThoughts"
  | "content"
  | "timestamp"
  | "nextThoughtNeeded"
>;

/**
 * Build the seven fields that start every thought: a new `id`, the session,
 * the thought numbers, the content, the time and `nextThoughtNeeded`.
 *
 * A handler spreads the result first in the thought it returns, then adds the
 * revision fields, `mode` and its own fields in the order it needs.
 */
export function createThoughtBase(
  input: ThinkingToolInput,
  sessionId: string,
): ThoughtBase {
  return {
    id: randomUUID(),
    sessionId,
    thoughtNumber: input.thoughtNumber,
    totalThoughts: input.totalThoughts,
    content: input.thought,
    timestamp: new Date(),
    nextThoughtNeeded: input.nextThoughtNeeded,
  };
}

/**
 * The five fields that close a thought in several handlers.
 */
type ThoughtTail = Required<
  Pick<BaseThought, "dependencies" | "assumptions" | "uncertainty">
> &
  Pick<BaseThought, "isRevision" | "revisesThought">;

/**
 * Build the five fields that close a thought: the dependencies, the
 * assumptions, the uncertainty and the two revision fields, in that order.
 * The lists default to an empty list. The uncertainty defaults to 0.5, and an
 * uncertainty of 0 stays 0.
 *
 * A handler spreads the result where its own five lines stood, so the key
 * order of the thought does not change.
 */
export function createThoughtTail(input: ThinkingToolInput): ThoughtTail {
  return {
    dependencies: input.dependencies || [],
    assumptions: input.assumptions || [],
    uncertainty: input.uncertainty ?? 0.5,
    isRevision: input.isRevision,
    revisesThought: input.revisesThought,
  };
}

/**
 * Create a validation warning
 */
export function createValidationWarning(
  field: string,
  message: string,
  suggestion?: string,
): ValidationWarning {
  return { field, message, suggestion };
}
