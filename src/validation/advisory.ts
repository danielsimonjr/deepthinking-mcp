/**
 * Advisory validation wrapper
 *
 * The mode validators are rich but strict: there are 156 error-severity issue
 * sites across them, and `ValidationResult.isValid` is `errors.length === 0`.
 * Gating requests on that verdict would break every existing client, so the
 * live path treats validation as FEEDBACK, never as a gate.
 *
 * This wrapper is the only entry point the request path uses. It guarantees:
 * - it never throws (a broken validator degrades to `available: false`)
 * - the payload it returns is bounded
 * - the verdict is passed through unmodified
 */

import type { Thought } from "../types/core.js";
import type {
  AdvisoryValidation,
  ValidationIssue,
  ValidationResult,
} from "../types/session.js";
import type { ValidationContext } from "./constants.js";
import { ThoughtValidator } from "./validator.js";

/** Maximum issues returned to a client for one thought. */
export const MAX_ADVISORY_ISSUES = 20;

/** Maximum suggestions returned to a client for one thought. */
export const MAX_ADVISORY_SUGGESTIONS = 10;

/** Ordering used when the issue list has to be truncated. */
const SEVERITY_RANK: Record<ValidationIssue["severity"], number> = {
  error: 0,
  warning: 1,
  info: 2,
};

/**
 * The part of `ThoughtValidator` this wrapper depends on. Narrow on purpose so
 * tests can substitute a validator without constructing the real registry.
 */
export interface AdvisoryValidatorLike {
  validate(
    thought: Thought,
    context?: ValidationContext,
  ): Promise<ValidationResult>;
}

const defaultValidator = new ThoughtValidator();

/**
 * Sort by severity without disturbing the order within a severity band.
 */
function bySeverity(issues: ValidationIssue[]): ValidationIssue[] {
  return issues
    .map((issue, index) => ({ issue, index }))
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.issue.severity] - SEVERITY_RANK[b.issue.severity] ||
        a.index - b.index,
    )
    .map((entry) => entry.issue);
}

/**
 * Validate a thought and return bounded, non-throwing feedback.
 *
 * @param thought - The thought to validate
 * @param context - Optional validation context
 * @param validator - Validator to use (defaults to the shared `ThoughtValidator`)
 * @returns Advisory validation; `available: false` if validation failed
 */
export async function validateAdvisory(
  thought: Thought,
  context: ValidationContext = {},
  validator: AdvisoryValidatorLike = defaultValidator,
): Promise<AdvisoryValidation> {
  let result: ValidationResult;

  try {
    result = await validator.validate(thought, context);
  } catch (error) {
    return {
      available: false,
      reason: `Validation unavailable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  const ranked = bySeverity(result.issues ?? []);
  const issues = ranked.slice(0, MAX_ADVISORY_ISSUES);

  const suggestions = Array.from(new Set(result.suggestions ?? [])).slice(
    0,
    MAX_ADVISORY_SUGGESTIONS,
  );

  return {
    ...result,
    available: true,
    issues,
    suggestions,
    totalIssues: ranked.length,
    issuesTruncated: ranked.length > issues.length,
  };
}
