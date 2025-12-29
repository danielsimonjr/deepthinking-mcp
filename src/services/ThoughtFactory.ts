/**
 * Thought Factory Service (v9.0.0)
 * Phase 15A Sprint 1: Remove Unnecessary Abstractions
 *
 * Centralizes thought creation logic for all thinking modes.
 * Provides type-safe thought construction based on mode-specific requirements.
 *
 * RESPONSIBILITY:
 * - Delegate to specialized ModeHandlers via registry
 * - Ensure thought structure consistency across modes
 *
 * ARCHITECTURE:
 * - Uses ModeHandlerRegistry for all mode handling
 * - All 33 modes have dedicated handlers
 * - Phase 15A: Removed 600+ lines of dead legacy switch statement
 */

import { ThinkingMode, Thought } from '../types/index.js';
import { ThinkingToolInput } from '../tools/thinking.js';
import { ILogger } from '../interfaces/ILogger.js';
import { createLogger, LogLevel } from '../utils/logger.js';
import {
  ModeHandlerRegistry,
  ModeStatus,
  ValidationResult,
  registerAllHandlers,
} from '../modes/index.js';

/**
 * Configuration for ThoughtFactory
 * Phase 15A: Simplified - removed useRegistryForAll (always true now)
 */
export interface ThoughtFactoryConfig {
  /**
   * Whether to automatically register specialized handlers on construction
   * Default: true
   */
  autoRegisterHandlers?: boolean;

  /**
   * Logger instance for dependency injection
   */
  logger?: ILogger;
}

/**
 * Thought Factory - Creates mode-specific thought objects
 *
 * Handles the complexity of creating properly structured thought objects
 * for all 33 thinking modes via the ModeHandler registry.
 *
 * As of v8.4.0, all modes have dedicated handlers:
 * - Core (5): Sequential, Shannon, Mathematics, Physics, Hybrid
 * - Fundamental Triad (3): Inductive, Deductive, Abductive
 * - Causal/Probabilistic (6): Causal, Bayesian, Counterfactual, Temporal, GameTheory, Evidential
 * - Analogical/First Principles (2): Analogical, FirstPrinciples
 * - Systems/Scientific (3): SystemsThinking, ScientificMethod, FormalLogic
 * - Academic (4): Synthesis, Argumentation, Critique, Analysis
 * - Engineering (4): Engineering, Computability, Cryptanalytic, Algorithmic
 * - Advanced Runtime (6): MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization
 * - User-Defined (1): Custom
 *
 * @example
 * ```typescript
 * const factory = new ThoughtFactory();
 * const thought = factory.createThought(input, sessionId);
 * await sessionManager.addThought(sessionId, thought);
 * ```
 */
export class ThoughtFactory {
  private logger: ILogger;
  private registry: ModeHandlerRegistry;

  constructor(config: ThoughtFactoryConfig = {}) {
    this.logger = config.logger || createLogger({ minLevel: LogLevel.INFO, enableConsole: true });
    this.registry = ModeHandlerRegistry.getInstance();
    // Phase 15A: Removed useRegistryForAll - always use registry (legacy switch removed)

    // Auto-register all 33 handlers (Phase 10 Sprint 3)
    if (config.autoRegisterHandlers !== false) {
      this.registerAllModeHandlers();
    }
  }

  /**
   * Register all 33 mode handlers (Phase 10 Sprint 3 v8.4.0)
   *
   * Uses the centralized registerAllHandlers() function from modes/index.ts
   * which registers handlers for all ThinkingModes:
   * - Core (5): Sequential, Shannon, Mathematics, Physics, Hybrid
   * - Fundamental Triad (3): Inductive, Deductive, Abductive
   * - Causal/Probabilistic (6): Causal, Bayesian, Counterfactual, Temporal, GameTheory, Evidential
   * - Analogical/First Principles (2): Analogical, FirstPrinciples
   * - Systems/Scientific (3): SystemsThinking, ScientificMethod, FormalLogic
   * - Academic (4): Synthesis, Argumentation, Critique, Analysis
   * - Engineering (4): Engineering, Computability, Cryptanalytic, Algorithmic
   * - Advanced Runtime (6): MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization
   * - User-Defined (1): Custom
   */
  private registerAllModeHandlers(): void {
    registerAllHandlers();

    const stats = this.registry.getStats();
    this.logger.debug('All mode handlers registered', {
      count: stats.specializedHandlers,
      categories: [
        'Core (5)',
        'Fundamental Triad (3)',
        'Causal/Probabilistic (6)',
        'Analogical/First Principles (2)',
        'Systems/Scientific (3)',
        'Academic (4)',
        'Engineering (4)',
        'Advanced Runtime (6)',
        'User-Defined (1)',
      ],
    });
  }

  // @deprecated registerSpecializedHandlers() - use registerAllModeHandlers() instead

  /**
   * Check if a mode has a specialized handler
   */
  hasSpecializedHandler(mode: ThinkingMode): boolean {
    return this.registry.hasSpecializedHandler(mode);
  }

  /**
   * Get stats about registered handlers
   */
  getStats(): { specializedHandlers: number; modesWithHandlers: ThinkingMode[] } {
    const stats = this.registry.getStats();
    return {
      specializedHandlers: stats.specializedHandlers,
      modesWithHandlers: stats.modesWithHandlers,
    };
  }

  /**
   * Validate input using appropriate handler
   *
   * @param input - Tool input to validate
   * @returns Validation result
   */
  validate(input: ThinkingToolInput): ValidationResult {
    return this.registry.validate(input);
  }

  /**
   * Get mode status for API response
   *
   * @param mode - The thinking mode
   * @returns Mode status information
   */
  getModeStatus(mode: ThinkingMode): ModeStatus {
    return this.registry.getModeStatus(mode);
  }

  /**
   * Get the underlying registry for direct access
   *
   * Use this to register new handlers or access registry stats.
   *
   * @returns The ModeHandlerRegistry instance
   */
  getRegistry(): ModeHandlerRegistry {
    return this.registry;
  }

  /**
   * Determine if registry should be used for a mode
   * Phase 15A: Always returns true - legacy switch removed
   */
  private shouldUseRegistry(_mode: ThinkingMode): boolean {
    // Phase 15A: Always use registry - all 33 modes have handlers
    return true;
  }

  /**
   * Create a thought object based on input and mode
   *
   * Generates a properly typed thought object with mode-specific fields
   * and default values. Each mode has unique required and optional fields.
   *
   * @param input - Thought input from MCP tool
   * @param sessionId - Session ID this thought belongs to
   * @returns Typed thought object ready for session storage
   *
   * @example
   * ```typescript
   * const thought = factory.createThought({
   *   mode: 'mathematics',
   *   thought: 'Analyzing the problem...',
   *   thoughtNumber: 1,
   *   totalThoughts: 5,
   *   nextThoughtNeeded: true,
   *   mathematicalModel: { equations: ['E = mc^2'] }
   * }, 'session-123');
   * ```
   */
  createThought(input: ThinkingToolInput, sessionId: string): Thought {
    const mode = (input.mode as ThinkingMode) || ThinkingMode.HYBRID;

    this.logger.debug('Creating thought', {
      sessionId,
      mode,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      isRevision: input.isRevision,
      hasSpecializedHandler: this.registry.hasSpecializedHandler(mode),
    });

    // Use registry handler if appropriate (Phase 10 Sprint 2/2B)
    if (this.shouldUseRegistry(mode)) {
      this.logger.debug('Using registry handler', { mode });
      return this.registry.createThought(input, sessionId);
    }

    // Phase 15A: Legacy switch statement removed - all 33 modes have handlers
    // If we reach here, it means shouldUseRegistry() returned false unexpectedly
    throw new Error(
      `No handler available for mode "${mode}". This should never happen - ` +
      `all 33 modes have specialized handlers. Check registry initialization.`
    );
  }
}

