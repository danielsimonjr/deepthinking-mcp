/**
 * Mode Handlers Index - Phase 10 Sprint 1 (v8.0.0)
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

// Registry
export {
  ModeHandlerRegistry,
  RegistryStats,
  getRegistry,
  registerHandler,
  createThought,
} from './registry.js';
