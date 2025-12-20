/**
 * ModeHandlerRegistry - Phase 10 Sprint 1 (v8.0.0)
 *
 * Central registry for mode handlers. Manages registration, lookup,
 * and delegation to appropriate handlers.
 *
 * Part of the Strategy Pattern implementation to replace the
 * monolithic ThoughtFactory switch statement.
 */

import { ThinkingMode, Thought, isFullyImplemented } from '../types/core.js';
import type { ThinkingToolInput } from '../tools/thinking.js';
import {
  ModeHandler,
  ModeStatus,
  ValidationResult,
  validationFailure,
  createValidationError,
} from './handlers/ModeHandler.js';
import { GenericModeHandler } from './handlers/GenericModeHandler.js';

/**
 * Registry statistics
 */
export interface RegistryStats {
  /** Total number of registered handlers */
  totalHandlers: number;
  /** Number of specialized (non-generic) handlers */
  specializedHandlers: number;
  /** List of modes with specialized handlers */
  modesWithHandlers: ThinkingMode[];
  /** List of modes using generic handler */
  modesWithGenericHandler: ThinkingMode[];
}

/**
 * ModeHandlerRegistry
 *
 * Singleton registry that manages mode handlers. Provides:
 * - Handler registration and lookup
 * - Fallback to GenericModeHandler for unregistered modes
 * - Validation delegation
 * - Statistics and introspection
 *
 * @example
 * ```typescript
 * const registry = ModeHandlerRegistry.getInstance();
 *
 * // Register a specialized handler
 * registry.register(new CausalHandler());
 *
 * // Create a thought (delegates to appropriate handler)
 * const thought = registry.createThought(input, sessionId);
 *
 * // Check if mode has specialized handler
 * if (registry.hasSpecializedHandler(ThinkingMode.CAUSAL)) {
 *   // Use specialized features
 * }
 * ```
 */
export class ModeHandlerRegistry {
  private static instance: ModeHandlerRegistry | null = null;
  private handlers: Map<ThinkingMode, ModeHandler> = new Map();

  private constructor() {
    // Singleton constructor - handlers are registered externally
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): ModeHandlerRegistry {
    if (!ModeHandlerRegistry.instance) {
      ModeHandlerRegistry.instance = new ModeHandlerRegistry();
    }
    return ModeHandlerRegistry.instance;
  }

  /**
   * Reset the singleton (for testing)
   */
  static resetInstance(): void {
    ModeHandlerRegistry.instance = null;
  }

  /**
   * Register a mode handler
   *
   * @param handler - The handler to register
   * @throws Error if handler for mode is already registered
   */
  register(handler: ModeHandler): void {
    if (this.handlers.has(handler.mode)) {
      throw new Error(
        `Handler for mode '${handler.mode}' is already registered. ` +
          'Use replace() to override an existing handler.'
      );
    }
    this.handlers.set(handler.mode, handler);
  }

  /**
   * Replace an existing handler or register a new one
   *
   * @param handler - The handler to register/replace
   */
  replace(handler: ModeHandler): void {
    this.handlers.set(handler.mode, handler);
  }

  /**
   * Unregister a handler
   *
   * @param mode - The mode to unregister
   * @returns true if handler was removed, false if not found
   */
  unregister(mode: ThinkingMode): boolean {
    return this.handlers.delete(mode);
  }

  /**
   * Get handler for a mode
   *
   * Returns the specialized handler if registered,
   * otherwise returns the generic handler.
   *
   * @param mode - The thinking mode
   * @returns The handler for the mode
   */
  getHandler(mode: ThinkingMode): ModeHandler {
    return this.handlers.get(mode) || this.createGenericHandlerForMode(mode);
  }

  /**
   * Check if a specialized handler is registered for a mode
   *
   * @param mode - The thinking mode
   * @returns true if a specialized handler exists
   */
  hasSpecializedHandler(mode: ThinkingMode): boolean {
    return this.handlers.has(mode);
  }

  /**
   * Get all registered modes
   *
   * @returns Array of modes with specialized handlers
   */
  getRegisteredModes(): ThinkingMode[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Create a thought using the appropriate handler
   *
   * This is the main entry point for thought creation.
   * Delegates to specialized handler if registered,
   * otherwise uses generic handler.
   *
   * @param input - The tool input
   * @param sessionId - The session ID
   * @returns Created thought
   */
  createThought(input: ThinkingToolInput, sessionId: string): Thought {
    const mode = (input.mode as ThinkingMode) || ThinkingMode.HYBRID;
    const handler = this.getHandler(mode);
    return handler.createThought(input, sessionId);
  }

  /**
   * Validate input using the appropriate handler
   *
   * @param input - The tool input
   * @returns Validation result
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const mode = (input.mode as ThinkingMode) || ThinkingMode.HYBRID;

    // Basic validation first
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    const handler = this.getHandler(mode);
    return handler.validate(input);
  }

  /**
   * Get mode status information
   *
   * @param mode - The thinking mode
   * @returns Mode status for API response
   */
  getModeStatus(mode: ThinkingMode): ModeStatus {
    const hasSpecialized = this.hasSpecializedHandler(mode);
    const handler = this.getHandler(mode);

    return {
      mode,
      isFullyImplemented: isFullyImplemented(mode),
      hasSpecializedHandler: hasSpecialized,
      note: this.getModeNote(mode, hasSpecialized),
      supportedThoughtTypes: this.getSupportedThoughtTypes(handler, mode),
    };
  }

  /**
   * Get registry statistics
   *
   * @returns Statistics about registered handlers
   */
  getStats(): RegistryStats {
    const allModes = Object.values(ThinkingMode).filter(
      (v) => typeof v === 'string'
    ) as ThinkingMode[];

    const modesWithHandlers = this.getRegisteredModes();
    const modesWithGenericHandler = allModes.filter(
      (mode) => !this.handlers.has(mode)
    );

    return {
      totalHandlers: this.handlers.size,
      specializedHandlers: this.handlers.size,
      modesWithHandlers,
      modesWithGenericHandler,
    };
  }

  /**
   * Create a generic handler configured for a specific mode
   */
  private createGenericHandlerForMode(mode: ThinkingMode): GenericModeHandler {
    return new GenericModeHandler(mode);
  }

  /**
   * Get appropriate note for mode status
   */
  private getModeNote(mode: ThinkingMode, hasSpecialized: boolean): string | undefined {
    if (!isFullyImplemented(mode)) {
      return 'This mode is experimental with limited runtime implementation';
    }
    if (!hasSpecialized) {
      return 'Using generic handler - specialized validation not available';
    }
    return undefined;
  }

  /**
   * Get supported thought types for a mode
   */
  private getSupportedThoughtTypes(_handler: ModeHandler, mode: ThinkingMode): string[] {
    // Default thought types by mode category
    const thoughtTypes: Record<string, string[]> = {
      mathematics: [
        'problem_definition',
        'constraints',
        'model',
        'proof',
        'implementation',
        'proof_decomposition',
        'dependency_analysis',
        'consistency_check',
        'gap_identification',
        'assumption_trace',
      ],
      physics: [
        'problem_definition',
        'model',
        'tensor_formulation',
        'conservation_law',
        'dimensional_analysis',
      ],
      causal: ['problem_definition', 'graph_construction', 'intervention_analysis', 'mechanism_identification'],
      bayesian: ['prior_definition', 'likelihood_assessment', 'posterior_calculation', 'sensitivity_analysis'],
      temporal: ['event_definition', 'interval_analysis', 'constraint_checking', 'timeline_construction'],
      gametheory: ['game_definition', 'strategy_analysis', 'equilibrium_finding', 'payoff_calculation'],
      synthesis: ['source_identification', 'theme_extraction', 'gap_analysis', 'framework_construction'],
      argumentation: ['claim_formulation', 'grounds_development', 'warrant_construction', 'rebuttal_analysis'],
      critique: ['work_characterization', 'methodology_evaluation', 'argument_critique', 'contribution_assessment'],
      analysis: ['data_familiarization', 'coding', 'theme_development', 'pattern_analysis'],
    };

    const modeKey = mode.toLowerCase();
    return thoughtTypes[modeKey] || ['general'];
  }

  /**
   * Clear all registered handlers (for testing)
   */
  clear(): void {
    this.handlers.clear();
  }
}

/**
 * Get the global registry instance
 */
export function getRegistry(): ModeHandlerRegistry {
  return ModeHandlerRegistry.getInstance();
}

/**
 * Register a handler with the global registry
 */
export function registerHandler(handler: ModeHandler): void {
  getRegistry().register(handler);
}

/**
 * Create a thought using the global registry
 */
export function createThought(input: ThinkingToolInput, sessionId: string): Thought {
  return getRegistry().createThought(input, sessionId);
}
