/**
 * Validation module exports (v4.3.0)
 * Sprint 9.2: Explicit exports for tree-shaking
 * Sprint 10: Added validation constants
 */

// Constants (Sprint 10)
export {
  IssueSeverity,
  IssueCategory,
  ValidationThresholds,
  ValidationMessages,
  isInRange,
  isValidProbability,
  isValidConfidence,
} from './constants.js';

// Validator exports
export { ThoughtValidator, type ValidationContext } from './validator.js';

// Schema exports
export {
  SessionIdSchema,
  ThinkingModeSchema,
  CreateSessionSchema,
  type CreateSessionInput,
  AddThoughtSchema,
  type AddThoughtInput,
  CompleteSessionSchema,
  type CompleteSessionInput,
  GetSessionSchema,
  type GetSessionInput,
  ListSessionsSchema,
  type ListSessionsInput,
  ExportSessionSchema,
  type ExportSessionInput,
  SearchSessionsSchema,
  type SearchSessionsInput,
  BatchOperationSchema,
  type BatchOperationInput,
  validateInput,
  safeValidateInput,
} from './schemas.js';
