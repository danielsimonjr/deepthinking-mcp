/**
 * Mathematical Fallacy and Warning Patterns - Phase 8 Sprint 3
 *
 * Catalog of common mathematical fallacies and reasoning errors, scanned per
 * proof statement by `src/proof/extended-advisory.ts`.
 *
 * ## Every pattern must match its own `examples` (2026-08-07)
 *
 * Until this module was wired into the live request path, nothing checked
 * whether these regexes matched anything. **Six of the twelve did not match
 * their own documented examples** — measured by running `checkStatement` over
 * each pattern's `examples` array. The existing unit tests asserted only
 * `severity` and `category` for four of the six, so they stayed green
 * throughout.
 *
 * `tests/unit/proof/warning-patterns.test.ts` now asserts the invariant
 * mechanically: for every pattern, every entry in `examples` must produce a
 * hit for that pattern's own id. Add an example only if the regex detects it.
 */

/**
 * Warning pattern definition
 */
export interface WarningPattern {
  id: string;
  name: string;
  category: WarningCategory;
  description: string;
  pattern: RegExp;
  severity: "info" | "warning" | "error" | "critical";
  suggestion: string;
  examples: string[];
}

/**
 * Warning categories
 */
export type WarningCategory =
  | "division_error"
  | "logical_fallacy"
  | "scope_error"
  | "infinity_error"
  | "assumption_error"
  | "quantifier_error"
  | "type_error"
  | "limit_error";

/**
 * Division by Hidden Zero
 *
 * Occurs when a division is performed without checking if the divisor can be zero.
 * Often leads to proving false statements like 1 = 2.
 */
export const DIVISION_BY_HIDDEN_ZERO: WarningPattern = {
  id: "division_by_hidden_zero",
  name: "Division by Hidden Zero",
  category: "division_error",
  description:
    "Division by an expression that could equal zero without explicit check",
  pattern:
    /(?:divid(?:e|ing)|\/)\s*(?:by\s+)?(?:\(\s*)?([a-zA-Z](?:\s*[-+]\s*[a-zA-Z])?)(?:\s*\))?/i,
  severity: "error",
  suggestion: "Verify that the divisor is non-zero before dividing",
  examples: ["dividing by (a - b) when a = b", "x/y where y could be 0"],
};

/**
 * Assuming What's to be Proved (Petitio Principii)
 *
 * Using the conclusion as a premise in its own proof.
 */
export const ASSUMING_CONCLUSION: WarningPattern = {
  id: "assuming_conclusion",
  name: "Assuming What Is to Be Proved",
  category: "logical_fallacy",
  description: "The conclusion appears as an assumption in the proof",
  // The old `(.{10,50})` could not capture a one-symbol proposition, so
  // "Assume P. ... Therefore P." — its own first example — never matched.
  // Requiring sentence-ending punctuation after the capture keeps it a whole
  // clause, which is what stops the shorter minimum from over-matching:
  // "Let n be a natural number. ... Therefore n is even." does not fire,
  // because the repeated text would have to be the entire clause.
  // The `[\s\S]{0,400}?` gap (rather than `.*` under `/s`) matches the bound
  // the two implication patterns below needed for ReDoS safety.
  pattern:
    /(?:assume|suppose|let)\s+(?:that\s+)?([^.!?]{1,60})[.!?][\s\S]{0,400}?(?:therefore|thus|hence)\s+\1\b/i,
  severity: "critical",
  suggestion: "Derive the conclusion from independent premises",
  examples: [
    "Assume P. Therefore P.",
    "Suppose the result holds. Hence the result holds.",
  ],
};

/**
 * Affirming the Consequent
 *
 * Invalid reasoning: "If P then Q. Q. Therefore P."
 */
export const AFFIRMING_CONSEQUENT: WarningPattern = {
  id: "affirming_consequent",
  name: "Affirming the Consequent",
  category: "logical_fallacy",
  description: 'Invalid inference: concluding P from "P implies Q" and Q',
  // Three defects fixed together.
  //
  // 1. The antecedent capture used to run up to `\s+then`, so on
  //    "If x > 0, then ..." it swallowed the comma and the closing
  //    backreference then looked for "therefore x > 0," — a comma the
  //    conclusion never has.
  // 2. The comma-only form ("If P, Q") had no branch at all.
  // 3. ReDoS. The old `(.+?)` pairs were unbounded and `/s` let them span
  //    sentences, so two lazy captures plus two free `.*` spans backtracked
  //    catastrophically: a 2,000-character statement of the form
  //    "if a, then b." repeated, ending in "therefore", took **7.67 seconds**
  //    on this machine. Measured, not theorised. Capping each capture to one
  //    clause (`[^.!?]`) and each gap to 400 characters brings the same input
  //    under a millisecond.
  //
  // The tense change in the old first example ("it rains" → "it rained") is
  // not expressible with a backreference, so that example now uses the tense
  // the detector can actually match.
  pattern:
    /if\s+([^.!?]{1,80})(?:\s*,\s*then|\s+then|\s*,)\s*([^.!?]{1,80})[.!?][\s\S]{0,400}?\2[\s\S]{0,400}?therefore\s+\1\b/i,
  severity: "error",
  suggestion: "This inference is invalid. P→Q and Q does not entail P.",
  examples: [
    "If it rains, the ground is wet. The ground is wet. Therefore it rains.",
    "If x > 0, then x² > 0. x² > 0. Therefore x > 0.",
  ],
};

/**
 * Denying the Antecedent
 *
 * Invalid reasoning: "If P then Q. Not P. Therefore not Q."
 */
export const DENYING_ANTECEDENT: WarningPattern = {
  id: "denying_antecedent",
  name: "Denying the Antecedent",
  category: "logical_fallacy",
  description:
    'Invalid inference: concluding not-Q from "P implies Q" and not-P',
  // Same three fixes as AFFIRMING_CONSEQUENT, including the ReDoS bound (this
  // one measured 387 ms on the same 2,000-character input). The old example
  // ("It did not rain … Therefore the ground is not wet") negates by rewording
  // rather than by prefixing the captured clause, which a backreference cannot
  // follow; the prose form now lives in `description` and the example uses the
  // literal ¬P / ¬Q form the detector matches.
  pattern:
    /if\s+([^.!?]{1,80})(?:\s*,\s*then|\s+then|\s*,)\s*([^.!?]{1,80})[.!?][\s\S]{0,400}?\bnot\s+\1\b[\s\S]{0,400}?therefore\s+not\s+\2\b/i,
  severity: "error",
  suggestion: "This inference is invalid. P→Q and ¬P does not entail ¬Q.",
  examples: ["If x > 0, then x² > 0. We know not x > 0. Therefore not x² > 0."],
};

/**
 * Hasty Generalization
 *
 * Generalizing from too few cases.
 */
export const HASTY_GENERALIZATION: WarningPattern = {
  id: "hasty_generalization",
  name: "Hasty Generalization",
  category: "logical_fallacy",
  description: "Generalizing to all cases from only a few examples",
  // The old pattern required the small-case list to be immediately followed by
  // "therefore for all", so its own example — which puts "the formula works."
  // in between — never matched. Intervening clause text is now allowed, but
  // the two halves must still be at most one sentence apart.
  pattern:
    /[123]\s*(?:,|and)\s*[123][^.!?]*[.!?]\s*[^.!?]*\b(?:therefore|thus|hence|so)\b[^.!?]*(?:for\s+all|for\s+every|∀)/i,
  severity: "warning",
  suggestion: "Provide a general proof or use mathematical induction",
  examples: [
    "For n = 1, 2, 3, the formula works. Therefore it works for all n.",
  ],
};

/**
 * Ambiguous Middle Term
 *
 * Using a term with different meanings in the same argument.
 *
 * **Excluded from {@link ALL_WARNING_PATTERNS} (2026-08-07).** The regex tests
 * "does any word of 3+ letters appear three times", which is neither necessary
 * nor sufficient for the fallacy, and measurement showed it failing in both
 * directions at once: it does not match its own example (`continuous` vs
 * `continuity` are different words), and it fires on ordinary proof prose
 * containing "the" three times. Detecting a genuinely ambiguous middle term
 * needs word senses, not a repetition count.
 *
 * The constant stays exported so an existing import keeps compiling, but it is
 * no longer scanned. A permanently-firing advisory finding trains a reader to
 * skim past the whole list, which costs more than the pattern was worth.
 */
export const AMBIGUOUS_MIDDLE: WarningPattern = {
  id: "ambiguous_middle",
  name: "Ambiguous Middle Term",
  category: "logical_fallacy",
  description: "A term is used with different meanings in the same argument",
  pattern: /(\b\w{3,}\b).*\1.*\1/i, // Same word appearing 3+ times - needs manual review
  severity: "info",
  suggestion: "Ensure each term has a consistent meaning throughout the proof",
  examples: [
    'Using "continuous" to mean both pointwise and uniform continuity.',
  ],
};

/**
 * Illegal Cancellation
 *
 * Cancelling terms incorrectly.
 */
export const ILLEGAL_CANCELLATION: WarningPattern = {
  id: "illegal_cancellation",
  name: "Illegal Cancellation",
  category: "division_error",
  description: "Cancelling terms without verifying they are non-zero",
  // The old pattern demanded the literal word "term" or "factor", so
  // "Cancelling x from both sides" — its own example, and the way the error is
  // actually written — never matched. A single-letter variable is now
  // accepted; a multi-letter word still is not, so "cancel the noise" stays
  // quiet.
  pattern:
    /cancel(?:l?ing|l?ed|s)?\s+(?:the\s+)?(?:common\s+)?(?:term|factor|[a-zA-Z](?:\W|$))/i,
  severity: "warning",
  suggestion: "Verify the cancelled term is non-zero",
  examples: ["Cancelling x from both sides when x = 0 is possible."],
};

/**
 * Infinity Arithmetic Error
 *
 * Treating infinity as a regular number.
 */
export const INFINITY_ARITHMETIC: WarningPattern = {
  id: "infinity_arithmetic",
  name: "Infinity Arithmetic Error",
  category: "infinity_error",
  description: "Performing undefined arithmetic operations with infinity",
  // `×` (U+00D7) and `·` were missing from the operator class, so the example
  // "0 × ∞" — written the way a mathematician writes it — never matched while
  // the ASCII "0 * ∞" did.
  pattern: /∞\s*[-+*/×·]\s*∞|∞\s*[*/×·]\s*0|0\s*[*/×·]\s*∞/,
  severity: "critical",
  suggestion: "Use proper limit analysis instead of infinity arithmetic",
  examples: ["∞ - ∞ = 0", "∞ / ∞ = 1", "0 × ∞"],
};

/**
 * Confusing Necessary and Sufficient
 *
 * Mixing up necessary and sufficient conditions.
 */
export const NECESSARY_SUFFICIENT_CONFUSION: WarningPattern = {
  id: "necessary_sufficient_confusion",
  name: "Necessary/Sufficient Condition Confusion",
  category: "logical_fallacy",
  description: "Confusing necessary conditions with sufficient conditions",
  // The old pattern required the two words to be adjacent, so it matched only
  // the phrase "necessary and sufficient" and missed its own example, where
  // they sit at opposite ends of the sentence. Both words in one sentence is
  // the signal worth surfacing.
  pattern: /\b(?:necessary|sufficient)\b[^.!?]*\b(?:necessary|sufficient)\b/i,
  severity: "warning",
  suggestion: "Clarify whether the condition is necessary, sufficient, or both",
  examples: [
    "Being a square is sufficient for being a rectangle, but not necessary.",
  ],
};

/**
 * Existential Instantiation Error
 *
 * Using an existentially quantified variable as if it were universal.
 */
export const EXISTENTIAL_INSTANTIATION_ERROR: WarningPattern = {
  id: "existential_instantiation_error",
  name: "Existential Instantiation Error",
  category: "quantifier_error",
  description: "Treating an existentially quantified variable as universal",
  pattern: /(?:there\s+exists?|∃)\s+(\w+).*(?:for\s+all|∀|any|every)\s+\1/is,
  severity: "error",
  suggestion: "The existential variable cannot be used universally",
  examples: ["There exists x such that P(x). For all x, Q(x)."],
};

/**
 * Square Root Sign Error
 *
 * Ignoring the positive root convention.
 */
export const SQRT_SIGN_ERROR: WarningPattern = {
  id: "sqrt_sign_error",
  name: "Square Root Sign Error",
  category: "type_error",
  description:
    "Ignoring that √x denotes the principal (non-negative) square root",
  // The old pattern demanded an ASCII hyphen after the `=`, so the canonical
  // error "√4 = ±2" — its own example — never matched. `±` now counts.
  pattern: /√\s*\(?[^)=]*\)?\s*=\s*[^.!?]*[-±]/,
  severity: "warning",
  suggestion: "Remember that √x ≥ 0 by convention",
  examples: ["√4 = ±2 (incorrect: √4 = 2)"],
};

/**
 * Limit Exchange Error
 *
 * Incorrectly exchanging limits.
 */
export const LIMIT_EXCHANGE_ERROR: WarningPattern = {
  id: "limit_exchange_error",
  name: "Limit Exchange Error",
  category: "limit_error",
  description: "Exchanging limits without justification",
  // The old pattern needed the two `lim`s to be adjacent, so the standard
  // notation "lim(n→∞) lim(m→∞)" — its own example — never matched. The gap
  // now allows the index expression but excludes `=`, which keeps an ordinary
  // "lim a_n = lim b_n" from firing.
  pattern:
    /\blim\b[^.!?=]{0,40}?\blim\b|\blimit\s+(?:of\s+)?(?:the\s+)?limit\b/i,
  severity: "warning",
  suggestion:
    "Verify conditions for exchanging limits (uniform convergence, etc.)",
  examples: ["lim(n→∞) lim(m→∞) ≠ lim(m→∞) lim(n→∞) in general"],
};

/**
 * All warning patterns that are actually scanned.
 *
 * {@link AMBIGUOUS_MIDDLE} is deliberately absent — see its doc comment. It is
 * still exported individually.
 */
export const ALL_WARNING_PATTERNS: WarningPattern[] = [
  DIVISION_BY_HIDDEN_ZERO,
  ASSUMING_CONCLUSION,
  AFFIRMING_CONSEQUENT,
  DENYING_ANTECEDENT,
  HASTY_GENERALIZATION,
  ILLEGAL_CANCELLATION,
  INFINITY_ARITHMETIC,
  NECESSARY_SUFFICIENT_CONFUSION,
  EXISTENTIAL_INSTANTIATION_ERROR,
  SQRT_SIGN_ERROR,
  LIMIT_EXCHANGE_ERROR,
];

/**
 * Get patterns by category
 */
export function getPatternsByCategory(
  category: WarningCategory,
): WarningPattern[] {
  return ALL_WARNING_PATTERNS.filter((p) => p.category === category);
}

/**
 * Get patterns by severity
 */
export function getPatternsBySeverity(
  severity: WarningPattern["severity"],
): WarningPattern[] {
  return ALL_WARNING_PATTERNS.filter((p) => p.severity === severity);
}

/**
 * Check a statement against all warning patterns
 */
export function checkStatement(
  statement: string,
): { pattern: WarningPattern; match: RegExpMatchArray }[] {
  const warnings: { pattern: WarningPattern; match: RegExpMatchArray }[] = [];

  for (const pattern of ALL_WARNING_PATTERNS) {
    const match = statement.match(pattern.pattern);
    if (match) {
      warnings.push({ pattern, match });
    }
  }

  return warnings;
}

/**
 * Check all statements in a proof
 */
export function checkProof(
  statements: string[],
): Map<number, { pattern: WarningPattern; match: RegExpMatchArray }[]> {
  const results = new Map<
    number,
    { pattern: WarningPattern; match: RegExpMatchArray }[]
  >();

  for (let i = 0; i < statements.length; i++) {
    const warnings = checkStatement(statements[i]);
    if (warnings.length > 0) {
      results.set(i, warnings);
    }
  }

  return results;
}
