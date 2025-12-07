/**
 * Mathematical Fallacy and Warning Patterns - Phase 8 Sprint 3
 *
 * Catalog of common mathematical fallacies and reasoning errors
 * for detection by the InconsistencyDetector.
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
  severity: 'info' | 'warning' | 'error' | 'critical';
  suggestion: string;
  examples: string[];
}

/**
 * Warning categories
 */
export type WarningCategory =
  | 'division_error'
  | 'logical_fallacy'
  | 'scope_error'
  | 'infinity_error'
  | 'assumption_error'
  | 'quantifier_error'
  | 'type_error'
  | 'limit_error';

/**
 * Division by Hidden Zero
 *
 * Occurs when a division is performed without checking if the divisor can be zero.
 * Often leads to proving false statements like 1 = 2.
 */
export const DIVISION_BY_HIDDEN_ZERO: WarningPattern = {
  id: 'division_by_hidden_zero',
  name: 'Division by Hidden Zero',
  category: 'division_error',
  description: 'Division by an expression that could equal zero without explicit check',
  pattern: /(?:divid(?:e|ing)|\/)\s*(?:by\s+)?(?:\(\s*)?([a-zA-Z](?:\s*[-+]\s*[a-zA-Z])?)(?:\s*\))?/i,
  severity: 'error',
  suggestion: 'Verify that the divisor is non-zero before dividing',
  examples: [
    'dividing by (a - b) when a = b',
    'x/y where y could be 0',
  ],
};

/**
 * Assuming What's to be Proved (Petitio Principii)
 *
 * Using the conclusion as a premise in its own proof.
 */
export const ASSUMING_CONCLUSION: WarningPattern = {
  id: 'assuming_conclusion',
  name: 'Assuming What Is to Be Proved',
  category: 'logical_fallacy',
  description: 'The conclusion appears as an assumption in the proof',
  pattern: /(?:assume|suppose|let)\s+(?:that\s+)?(.{10,50}).*(?:therefore|thus|hence)\s+\1/is,
  severity: 'critical',
  suggestion: 'Derive the conclusion from independent premises',
  examples: [
    'Assume P. ... Therefore P.',
    'Suppose the result holds. ... Hence the result holds.',
  ],
};

/**
 * Affirming the Consequent
 *
 * Invalid reasoning: "If P then Q. Q. Therefore P."
 */
export const AFFIRMING_CONSEQUENT: WarningPattern = {
  id: 'affirming_consequent',
  name: 'Affirming the Consequent',
  category: 'logical_fallacy',
  description: 'Invalid inference: concluding P from "P implies Q" and Q',
  pattern: /if\s+(.+?)\s+then\s+(.+?)[\.\,].*\2.*therefore\s+\1/is,
  severity: 'error',
  suggestion: 'This inference is invalid. P→Q and Q does not entail P.',
  examples: [
    'If it rains, the ground is wet. The ground is wet. Therefore it rained.',
    'If x > 0, then x² > 0. x² > 0. Therefore x > 0.',
  ],
};

/**
 * Denying the Antecedent
 *
 * Invalid reasoning: "If P then Q. Not P. Therefore not Q."
 */
export const DENYING_ANTECEDENT: WarningPattern = {
  id: 'denying_antecedent',
  name: 'Denying the Antecedent',
  category: 'logical_fallacy',
  description: 'Invalid inference: concluding not-Q from "P implies Q" and not-P',
  pattern: /if\s+(.+?)\s+then\s+(.+?)[\.\,].*not\s+\1.*therefore\s+not\s+\2/is,
  severity: 'error',
  suggestion: 'This inference is invalid. P→Q and ¬P does not entail ¬Q.',
  examples: [
    'If it rains, the ground is wet. It did not rain. Therefore the ground is not wet.',
  ],
};

/**
 * Hasty Generalization
 *
 * Generalizing from too few cases.
 */
export const HASTY_GENERALIZATION: WarningPattern = {
  id: 'hasty_generalization',
  name: 'Hasty Generalization',
  category: 'logical_fallacy',
  description: 'Generalizing to all cases from only a few examples',
  pattern: /(?:for\s+)?(?:n\s*=\s*)?[123](?:\s*(?:,|and)\s*[123])*\s*(?:,|\.)\s*(?:therefore|thus|hence|so)\s+(?:for\s+all|∀)/i,
  severity: 'warning',
  suggestion: 'Provide a general proof or use mathematical induction',
  examples: [
    'For n = 1, 2, 3, the formula works. Therefore it works for all n.',
  ],
};

/**
 * Ambiguous Middle Term
 *
 * Using a term with different meanings in the same argument.
 */
export const AMBIGUOUS_MIDDLE: WarningPattern = {
  id: 'ambiguous_middle',
  name: 'Ambiguous Middle Term',
  category: 'logical_fallacy',
  description: 'A term is used with different meanings in the same argument',
  pattern: /(\b\w{3,}\b).*\1.*\1/i, // Same word appearing 3+ times - needs manual review
  severity: 'info',
  suggestion: 'Ensure each term has a consistent meaning throughout the proof',
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
  id: 'illegal_cancellation',
  name: 'Illegal Cancellation',
  category: 'division_error',
  description: 'Cancelling terms without verifying they are non-zero',
  pattern: /cancel(?:l?ing|l?ed)?\s+(?:the\s+)?(?:common\s+)?(?:term|factor)/i,
  severity: 'warning',
  suggestion: 'Verify the cancelled term is non-zero',
  examples: [
    'Cancelling x from both sides when x = 0 is possible.',
  ],
};

/**
 * Infinity Arithmetic Error
 *
 * Treating infinity as a regular number.
 */
export const INFINITY_ARITHMETIC: WarningPattern = {
  id: 'infinity_arithmetic',
  name: 'Infinity Arithmetic Error',
  category: 'infinity_error',
  description: 'Performing undefined arithmetic operations with infinity',
  pattern: /∞\s*[-+*/]\s*∞|∞\s*[*/]\s*0|0\s*[*/]\s*∞/,
  severity: 'critical',
  suggestion: 'Use proper limit analysis instead of infinity arithmetic',
  examples: [
    '∞ - ∞ = 0',
    '∞ / ∞ = 1',
    '0 × ∞',
  ],
};

/**
 * Confusing Necessary and Sufficient
 *
 * Mixing up necessary and sufficient conditions.
 */
export const NECESSARY_SUFFICIENT_CONFUSION: WarningPattern = {
  id: 'necessary_sufficient_confusion',
  name: 'Necessary/Sufficient Condition Confusion',
  category: 'logical_fallacy',
  description: 'Confusing necessary conditions with sufficient conditions',
  pattern: /(?:necessary|sufficient)\s+(?:and\s+)?(?:necessary|sufficient)/i,
  severity: 'warning',
  suggestion: 'Clarify whether the condition is necessary, sufficient, or both',
  examples: [
    'Being a square is sufficient for being a rectangle, but not necessary.',
  ],
};

/**
 * Existential Instantiation Error
 *
 * Using an existentially quantified variable as if it were universal.
 */
export const EXISTENTIAL_INSTANTIATION_ERROR: WarningPattern = {
  id: 'existential_instantiation_error',
  name: 'Existential Instantiation Error',
  category: 'quantifier_error',
  description: 'Treating an existentially quantified variable as universal',
  pattern: /(?:there\s+exists?|∃)\s+(\w+).*(?:for\s+all|∀|any|every)\s+\1/is,
  severity: 'error',
  suggestion: 'The existential variable cannot be used universally',
  examples: [
    'There exists x such that P(x). For all x, Q(x).',
  ],
};

/**
 * Square Root Sign Error
 *
 * Ignoring the positive root convention.
 */
export const SQRT_SIGN_ERROR: WarningPattern = {
  id: 'sqrt_sign_error',
  name: 'Square Root Sign Error',
  category: 'type_error',
  description: 'Ignoring that √x denotes the principal (non-negative) square root',
  pattern: /√\s*\(?([^)]+)\)?.*=.*-/,
  severity: 'warning',
  suggestion: 'Remember that √x ≥ 0 by convention',
  examples: [
    '√4 = ±2 (incorrect: √4 = 2)',
  ],
};

/**
 * Limit Exchange Error
 *
 * Incorrectly exchanging limits.
 */
export const LIMIT_EXCHANGE_ERROR: WarningPattern = {
  id: 'limit_exchange_error',
  name: 'Limit Exchange Error',
  category: 'limit_error',
  description: 'Exchanging limits without justification',
  pattern: /lim\s*lim|limit\s+(?:of\s+)?(?:the\s+)?limit/i,
  severity: 'warning',
  suggestion: 'Verify conditions for exchanging limits (uniform convergence, etc.)',
  examples: [
    'lim(n→∞) lim(m→∞) ≠ lim(m→∞) lim(n→∞) in general',
  ],
};

/**
 * All warning patterns
 */
export const ALL_WARNING_PATTERNS: WarningPattern[] = [
  DIVISION_BY_HIDDEN_ZERO,
  ASSUMING_CONCLUSION,
  AFFIRMING_CONSEQUENT,
  DENYING_ANTECEDENT,
  HASTY_GENERALIZATION,
  AMBIGUOUS_MIDDLE,
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
export function getPatternsByCategory(category: WarningCategory): WarningPattern[] {
  return ALL_WARNING_PATTERNS.filter((p) => p.category === category);
}

/**
 * Get patterns by severity
 */
export function getPatternsBySeverity(severity: WarningPattern['severity']): WarningPattern[] {
  return ALL_WARNING_PATTERNS.filter((p) => p.severity === severity);
}

/**
 * Check a statement against all warning patterns
 */
export function checkStatement(
  statement: string
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
  statements: string[]
): Map<number, { pattern: WarningPattern; match: RegExpMatchArray }[]> {
  const results = new Map<number, { pattern: WarningPattern; match: RegExpMatchArray }[]>();

  for (let i = 0; i < statements.length; i++) {
    const warnings = checkStatement(statements[i]);
    if (warnings.length > 0) {
      results.set(i, warnings);
    }
  }

  return results;
}
