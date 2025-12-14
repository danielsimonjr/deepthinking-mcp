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

import type { ThinkingMode, Thought } from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';

/**
 * Result of mode-specific validation
 */
export interface ValidationResult {
  /** Whether the input is valid */
  valid: boolean;
  /** Validation errors if any */
  errors: ValidationError[];
  /** Non-blocking warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation error detail
 */
export interface ValidationError {
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
  /** Mode-specific metrics or scores */
  metrics?: Record<string, number>;
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
 * Handlers are registered with ModeHandlerRegistry for use by RefactoredThoughtFactory.
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
export function validationSuccess(warnings: ValidationWarning[] = []): ValidationResult {
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
  errors: ValidationError[],
  warnings: ValidationWarning[] = []
): ValidationResult {
  return {
    valid: false,
    errors,
    warnings,
  };
}

/**
 * Create a validation error
 */
export function createValidationError(
  field: string,
  message: string,
  code: string
): ValidationError {
  return { field, message, code };
}

/**
 * Create a validation warning
 */
export function createValidationWarning(
  field: string,
  message: string,
  suggestion?: string
): ValidationWarning {
  return { field, message, suggestion };
}
