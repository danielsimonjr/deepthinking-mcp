/**
 * Assertion Helpers - Test Utilities for Phase 11
 *
 * Custom Vitest assertions and matchers for deepthinking-mcp testing.
 * Provides domain-specific assertions for thoughts, sessions, and modes.
 */

import { expect } from 'vitest';
import { ThinkingMode } from '../../src/types/core.js';
import type { Thought, InductiveThought, DeductiveThought, AbductiveThought } from '../../src/types/core.js';
import type { ThinkingSession } from '../../src/types/index.js';

// ============================================================================
// THOUGHT ASSERTIONS
// ============================================================================

/**
 * Assert that a thought has the expected mode
 */
export function assertThoughtMode(thought: Thought, expectedMode: ThinkingMode): void {
  expect(thought.mode).toBe(expectedMode);
}

/**
 * Assert that a thought has valid base properties
 */
export function assertValidBaseThought(thought: Thought): void {
  expect(thought.id).toBeDefined();
  expect(typeof thought.id).toBe('string');
  expect(thought.sessionId).toBeDefined();
  expect(thought.thoughtNumber).toBeGreaterThan(0);
  expect(thought.totalThoughts).toBeGreaterThan(0);
  expect(thought.content).toBeDefined();
  expect(thought.timestamp).toBeInstanceOf(Date);
  expect(typeof thought.nextThoughtNeeded).toBe('boolean');
}

/**
 * Assert that a thought is marked as a revision
 */
export function assertIsRevision(thought: Thought): void {
  expect(thought.isRevision).toBe(true);
  expect(thought.revisesThought).toBeDefined();
}

/**
 * Assert that a thought is a branch
 */
export function assertIsBranch(thought: Thought): void {
  expect((thought as any).branchFrom).toBeDefined();
  expect((thought as any).branchId).toBeDefined();
}

// ============================================================================
// INDUCTIVE THOUGHT ASSERTIONS
// ============================================================================

/**
 * Assert that a thought is a valid inductive thought
 */
export function assertValidInductiveThought(thought: Thought): asserts thought is InductiveThought {
  assertValidBaseThought(thought);
  assertThoughtMode(thought, ThinkingMode.INDUCTIVE);

  const inductive = thought as InductiveThought;
  expect(Array.isArray(inductive.observations)).toBe(true);
  expect(typeof inductive.generalization).toBe('string');
  expect(typeof inductive.confidence).toBe('number');
  expect(inductive.confidence).toBeGreaterThanOrEqual(0);
  expect(inductive.confidence).toBeLessThanOrEqual(1);
}

/**
 * Assert that an inductive thought has observations
 */
export function assertHasObservations(thought: InductiveThought, minCount: number = 1): void {
  expect(thought.observations).toBeDefined();
  expect(thought.observations.length).toBeGreaterThanOrEqual(minCount);
}

/**
 * Assert that an inductive thought has a pattern
 */
export function assertHasPattern(thought: InductiveThought): void {
  expect(thought.pattern).toBeDefined();
  expect(typeof thought.pattern).toBe('string');
  expect(thought.pattern!.length).toBeGreaterThan(0);
}

/**
 * Assert that an inductive thought has a generalization
 */
export function assertHasGeneralization(thought: InductiveThought): void {
  expect(thought.generalization).toBeDefined();
  expect(typeof thought.generalization).toBe('string');
  expect(thought.generalization.length).toBeGreaterThan(0);
}

/**
 * Assert confidence is within range
 */
export function assertConfidenceInRange(thought: InductiveThought, min: number, max: number): void {
  expect(thought.confidence).toBeGreaterThanOrEqual(min);
  expect(thought.confidence).toBeLessThanOrEqual(max);
}

/**
 * Assert that an inductive thought has counterexamples
 */
export function assertHasCounterexamples(thought: InductiveThought, minCount: number = 1): void {
  expect(thought.counterexamples).toBeDefined();
  expect(thought.counterexamples!.length).toBeGreaterThanOrEqual(minCount);
}

// ============================================================================
// DEDUCTIVE THOUGHT ASSERTIONS
// ============================================================================

/**
 * Assert that a thought is a valid deductive thought
 */
export function assertValidDeductiveThought(thought: Thought): asserts thought is DeductiveThought {
  assertValidBaseThought(thought);
  assertThoughtMode(thought, ThinkingMode.DEDUCTIVE);

  const deductive = thought as DeductiveThought;
  expect(Array.isArray(deductive.premises)).toBe(true);
  expect(typeof deductive.conclusion).toBe('string');
  expect(typeof deductive.validityCheck).toBe('boolean');
}

/**
 * Assert that a deductive thought has premises
 */
export function assertHasPremises(thought: DeductiveThought, minCount: number = 1): void {
  expect(thought.premises).toBeDefined();
  expect(thought.premises.length).toBeGreaterThanOrEqual(minCount);
}

/**
 * Assert that a deductive thought has a conclusion
 */
export function assertHasConclusion(thought: DeductiveThought): void {
  expect(thought.conclusion).toBeDefined();
  expect(typeof thought.conclusion).toBe('string');
  expect(thought.conclusion.length).toBeGreaterThan(0);
}

/**
 * Assert that a deductive thought has a logic form
 */
export function assertHasLogicForm(thought: DeductiveThought, expectedForm?: string): void {
  expect(thought.logicForm).toBeDefined();
  expect(typeof thought.logicForm).toBe('string');
  if (expectedForm) {
    expect(thought.logicForm).toBe(expectedForm);
  }
}

/**
 * Assert that a deductive thought is valid
 */
export function assertDeductionIsValid(thought: DeductiveThought): void {
  expect(thought.validityCheck).toBe(true);
}

/**
 * Assert that a deductive thought is sound
 */
export function assertDeductionIsSound(thought: DeductiveThought): void {
  expect(thought.soundnessCheck).toBe(true);
}

// ============================================================================
// ABDUCTIVE THOUGHT ASSERTIONS
// ============================================================================

/**
 * Assert that a thought is a valid abductive thought
 */
export function assertValidAbductiveThought(thought: Thought): asserts thought is AbductiveThought {
  assertValidBaseThought(thought);
  assertThoughtMode(thought, ThinkingMode.ABDUCTIVE);

  const abductive = thought as AbductiveThought;
  expect(Array.isArray(abductive.observations)).toBe(true);
  expect(Array.isArray(abductive.hypotheses)).toBe(true);
}

/**
 * Assert that an abductive thought has hypotheses
 */
export function assertHasHypotheses(thought: AbductiveThought, minCount: number = 1): void {
  expect(thought.hypotheses).toBeDefined();
  expect(thought.hypotheses.length).toBeGreaterThanOrEqual(minCount);
}

/**
 * Assert that an abductive thought has a best explanation
 */
export function assertHasBestExplanation(thought: AbductiveThought): void {
  expect(thought.bestExplanation).toBeDefined();
  expect(thought.bestExplanation!.id).toBeDefined();
  expect(thought.bestExplanation!.explanation).toBeDefined();
}

/**
 * Assert that the best explanation is from the hypotheses list
 */
export function assertBestExplanationIsFromHypotheses(thought: AbductiveThought): void {
  assertHasBestExplanation(thought);
  const hypothesisIds = thought.hypotheses.map(h => h.id);
  expect(hypothesisIds).toContain(thought.bestExplanation!.id);
}

/**
 * Assert that hypotheses have scores
 */
export function assertHypothesesHaveScores(thought: AbductiveThought): void {
  for (const hypothesis of thought.hypotheses) {
    expect(hypothesis.score).toBeDefined();
    expect(typeof hypothesis.score).toBe('number');
    expect(hypothesis.score).toBeGreaterThanOrEqual(0);
  }
}

// ============================================================================
// SESSION ASSERTIONS
// ============================================================================

/**
 * Assert that a session is valid
 */
export function assertValidSession(session: ThinkingSession): void {
  expect(session.id).toBeDefined();
  expect(typeof session.id).toBe('string');
  expect(session.mode).toBeDefined();
  expect(Object.values(ThinkingMode)).toContain(session.mode);
  expect(Array.isArray(session.thoughts)).toBe(true);
  expect(session.metrics).toBeDefined();
}

/**
 * Assert that a session has thoughts
 */
export function assertSessionHasThoughts(session: ThinkingSession, minCount: number = 1): void {
  expect(session.thoughts.length).toBeGreaterThanOrEqual(minCount);
}

/**
 * Assert that a session has the expected mode
 */
export function assertSessionMode(session: ThinkingSession, expectedMode: ThinkingMode): void {
  expect(session.mode).toBe(expectedMode);
}

// ============================================================================
// VALIDATION RESULT ASSERTIONS
// ============================================================================

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{ code: string; message: string; field?: string }>;
  warnings: Array<{ code?: string; message: string; field?: string }>;
}

/**
 * Assert that validation passed
 */
export function assertValidationPassed(result: ValidationResult): void {
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
}

/**
 * Assert that validation failed
 */
export function assertValidationFailed(result: ValidationResult): void {
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
}

/**
 * Assert that validation has specific error code
 */
export function assertHasErrorCode(result: ValidationResult, errorCode: string): void {
  const hasError = result.errors.some(e => e.code === errorCode);
  expect(hasError).toBe(true);
}

/**
 * Assert that validation has specific warning
 */
export function assertHasWarning(result: ValidationResult, field: string): void {
  const hasWarning = result.warnings.some(w => w.field === field);
  expect(hasWarning).toBe(true);
}

// ============================================================================
// GENERIC HELPER ASSERTIONS
// ============================================================================

/**
 * Assert that a value is a valid probability (0-1)
 */
export function assertValidProbability(value: number): void {
  expect(value).toBeGreaterThanOrEqual(0);
  expect(value).toBeLessThanOrEqual(1);
}

/**
 * Assert that an array has unique items
 */
export function assertUniqueItems<T>(array: T[], keyFn?: (item: T) => unknown): void {
  const keys = keyFn ? array.map(keyFn) : array;
  const uniqueKeys = new Set(keys);
  expect(uniqueKeys.size).toBe(array.length);
}

/**
 * Assert that a number is within a range
 */
export function assertInRange(value: number, min: number, max: number): void {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}
