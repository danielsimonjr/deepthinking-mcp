/**
 * RefactoredThoughtFactory - Phase 10 Sprint 1 (v8.0.0)
 *
 * A wrapper that delegates to ModeHandlerRegistry for modes with
 * specialized handlers, and falls back to the original ThoughtFactory
 * for modes that haven't been migrated yet.
 *
 * This enables incremental migration from the monolithic switch statement
 * to the Strategy Pattern without breaking existing functionality.
 */

import { ThinkingMode, Thought } from '../types/core.js';
import type { ThinkingToolInput } from '../tools/thinking.js';
import { ThoughtFactory } from './ThoughtFactory.js';
import {
  ModeHandlerRegistry,
  ModeStatus,
  ValidationResult,
} from '../modes/handlers/index.js';
import { ILogger } from '../interfaces/ILogger.js';
import { createLogger, LogLevel } from '../utils/logger.js';

/**
 * Configuration for RefactoredThoughtFactory
 */
export interface RefactoredThoughtFactoryConfig {
  /**
   * Whether to use the registry for all modes (true)
   * or fall back to original factory for non-migrated modes (false)
   *
   * Default: false (incremental migration mode)
   */
  useRegistryForAll?: boolean;

  /**
   * Logger instance
   */
  logger?: ILogger;
}

/**
 * RefactoredThoughtFactory
 *
 * This factory serves as a bridge during the migration from ThoughtFactory
 * to the ModeHandler pattern. It:
 *
 * 1. Checks if a specialized handler exists in the registry
 * 2. If yes, delegates to the registry
 * 3. If no, falls back to the original ThoughtFactory
 *
 * Once all modes are migrated, the fallback can be removed and this
 * becomes the primary factory.
 *
 * @example
 * ```typescript
 * const factory = new RefactoredThoughtFactory();
 *
 * // Register specialized handlers
 * factory.registerHandler(new CausalHandler());
 * factory.registerHandler(new BayesianHandler());
 *
 * // Create thought - uses specialized handler if available
 * const thought = factory.createThought(input, sessionId);
 *
 * // Check if mode has specialized handling
 * if (factory.hasSpecializedHandler(ThinkingMode.CAUSAL)) {
 *   // Use enhanced validation
 *   const validation = factory.validate(input);
 * }
 * ```
 */
export class RefactoredThoughtFactory {
  private registry: ModeHandlerRegistry;
  private legacyFactory: ThoughtFactory;
  private useRegistryForAll: boolean;
  private logger: ILogger;

  constructor(config: RefactoredThoughtFactoryConfig = {}) {
    this.registry = ModeHandlerRegistry.getInstance();
    this.legacyFactory = new ThoughtFactory();
    this.useRegistryForAll = config.useRegistryForAll ?? false;
    this.logger =
      config.logger || createLogger({ minLevel: LogLevel.INFO, enableConsole: true });
  }

  /**
   * Create a thought object from input
   *
   * Routes to appropriate handler based on mode and configuration:
   * - If specialized handler exists, use it
   * - If useRegistryForAll is true, use generic handler from registry
   * - Otherwise, fall back to legacy ThoughtFactory
   *
   * @param input - Tool input
   * @param sessionId - Session ID
   * @returns Created thought
   */
  createThought(input: ThinkingToolInput, sessionId: string): Thought {
    const mode = (input.mode as ThinkingMode) || ThinkingMode.HYBRID;

    this.logger.debug('Creating thought', {
      sessionId,
      mode,
      hasSpecializedHandler: this.registry.hasSpecializedHandler(mode),
      useRegistryForAll: this.useRegistryForAll,
    });

    // Check if we should use the registry
    if (this.shouldUseRegistry(mode)) {
      this.logger.debug('Using registry handler', { mode });
      return this.registry.createThought(input, sessionId);
    }

    // Fall back to legacy factory
    this.logger.debug('Using legacy factory', { mode });
    return this.legacyFactory.createThought(input, sessionId);
  }

  /**
   * Validate input using appropriate handler
   *
   * @param input - Tool input to validate
   * @returns Validation result
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const mode = (input.mode as ThinkingMode) || ThinkingMode.HYBRID;

    if (this.shouldUseRegistry(mode)) {
      return this.registry.validate(input);
    }

    // Legacy factory doesn't have validation, use registry's generic validation
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
   * Check if a specialized handler exists for a mode
   *
   * @param mode - The thinking mode
   * @returns true if specialized handler is registered
   */
  hasSpecializedHandler(mode: ThinkingMode): boolean {
    return this.registry.hasSpecializedHandler(mode);
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
   * Get registry statistics
   */
  getStats() {
    return this.registry.getStats();
  }

  /**
   * Determine if registry should be used for a mode
   */
  private shouldUseRegistry(mode: ThinkingMode): boolean {
    // Always use registry if specialized handler exists
    if (this.registry.hasSpecializedHandler(mode)) {
      return true;
    }

    // Use registry for all modes if configured
    if (this.useRegistryForAll) {
      return true;
    }

    // Otherwise fall back to legacy factory
    return false;
  }
}

/**
 * Create a RefactoredThoughtFactory with default configuration
 */
export function createRefactoredFactory(
  config?: RefactoredThoughtFactoryConfig
): RefactoredThoughtFactory {
  return new RefactoredThoughtFactory(config);
}
