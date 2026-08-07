/**
 * Validation module exports (v7.1.0)
 * Sprint 9.2: Explicit exports for tree-shaking
 * Sprint 10: Added validation constants
 *
 * ## Status: not on the live request path (verified 2026-08-07)
 *
 * No file under `src/` imports this barrel, and no test does either. That is
 * not a defect — the live path imports `./advisory.js` and `./validator.js`
 * directly, and the published package exposes no library API at all
 * (`tsup` builds the single entry `src/index.ts`, which has zero exports; the
 * shipped `dist/index.d.ts` is one shebang line). The barrel is kept as the
 * conventional import surface for the directory, and because deleting it
 * would not make one line of code reachable.
 *
 * What it must NOT do is re-export dead code and make it look live. Two
 * modules were removed on 2026-08-07 for exactly that reason:
 *
 * - **`schemas.ts`** validated six MCP tools that no longer exist
 *   (`create_session`, `add_thought`, `complete_session`, `get_session`,
 *   `list_sessions`, `export_session`, `search_sessions`). The current surface
 *   is 13 `deepthinking_*` tools whose schemas live in `src/tools/schemas/`.
 *   It also exported a second `SessionIdSchema` — `z.string().uuid()` — that
 *   contradicted the live one in `src/tools/schemas/shared.ts`
 *   (`z.string().max(MAX_LENGTHS.SESSION_ID)`), so the same symbol name
 *   carried two different rules depending on which module you imported.
 * - **`schema-utils.ts`** was 677 lines of Zod primitives reachable only
 *   through this barrel. No consumer, no test. `src/tools/schemas/shared.ts`
 *   already owns the live tier system.
 *
 * Both are recoverable from git history. Keeping them "in case something
 * needs them" is the reasoning that left 28% of `src/` unreachable.
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
} from "./constants.js";

// Validator exports
export { ThoughtValidator, type ValidationContext } from "./validator.js";

// Advisory wrapper - the entry point used by the live request path
export {
  validateAdvisory,
  MAX_ADVISORY_ISSUES,
  MAX_ADVISORY_SUGGESTIONS,
  type AdvisoryValidatorLike,
} from "./advisory.js";
