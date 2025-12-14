/**
 * Mode Handlers Index - Phase 10 Sprint 2 (v8.1.0)
 *
 * Exports for the ModeHandler pattern implementation.
 * Part of the Strategy Pattern to replace ThoughtFactory's switch statement.
 */

// Core interface and types
export {
  ModeHandler,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ModeEnhancements,
  ModeStatus,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

// Generic handler (fallback implementation)
export { GenericModeHandler } from './GenericModeHandler.js';

// Specialized handlers (Phase 10 Sprint 2)
export { CausalHandler } from './CausalHandler.js';
export { BayesianHandler } from './BayesianHandler.js';
export { GameTheoryHandler } from './GameTheoryHandler.js';

// Registry
export {
  ModeHandlerRegistry,
  RegistryStats,
  getRegistry,
  registerHandler,
  createThought,
} from './registry.js';

/**
 * Register all specialized handlers with the registry
 *
 * Call this function to initialize the registry with all
 * specialized handlers. This should be called once at startup.
 */
export function registerAllHandlers(): void {
  const registry = getRegistry();

  // Register specialized handlers
  // Uses replace() to allow re-initialization
  registry.replace(new CausalHandler());
  registry.replace(new BayesianHandler());
  registry.replace(new GameTheoryHandler());
}

// Import handlers for registerAllHandlers
import { CausalHandler } from './CausalHandler.js';
import { BayesianHandler } from './BayesianHandler.js';
import { GameTheoryHandler } from './GameTheoryHandler.js';
import { getRegistry } from './registry.js';
