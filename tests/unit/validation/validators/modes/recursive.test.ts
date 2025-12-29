/**
 * Recursive Validator Tests (Phase 14 Sprint 2)
 * Tests for src/validation/validators/modes/recursive.ts
 *
 * Target: >90% branch coverage for 110 lines of validation logic
 * Error paths: 0, Warning paths: 3, Info paths: 2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RecursiveValidator } from '../../../../../src/validation/validators/modes/recursive.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { Thought } from '../../../../../src/types/core.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('RecursiveValidator', () => {
  let validator: RecursiveValidator;
  let context: ValidationContext;

  // Helper to create a minimal valid thought
  const createBaseThought = (overrides?: Partial<Thought>): Thought => ({
    id: 'thought-1',
    mode: ThinkingMode.RECURSIVE,
    thought: 'Test thought',
    content: 'Using recursive decomposition to solve the subproblem',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    ...overrides,
  } as Thought);

  beforeEach(() => {
    validator = new RecursiveValidator();
    context = {
      sessionId: 'test-session',
      existingThoughts: new Map(),
    };
  });

  describe('getMode', () => {
    it('should return recursive', () => {
      expect(validator.getMode()).toBe('recursive');
    });
  });

  describe('validate - main entry point', () => {
    it('should accept valid thought with recursive content and base case', () => {
      const thought = createBaseThought({
        content: 'Base case: n = 0 returns 1. Recursive step: subproblem n-1',
        thoughtNumber: 1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should validate common fields via base class', () => {
      const thought = createBaseThought({
        thoughtNumber: -1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Thought number must be positive'))).toBe(true);
    });
  });

  describe('base case validation (early thoughts)', () => {
    it('should warn when thoughtNumber=1 lacks base case keywords', () => {
      const thought = createBaseThought({
        content: 'Just some random content without the special keywords',
        thoughtNumber: 1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('should define base cases early'))).toBe(true);
    });

    it('should warn when thoughtNumber=2 lacks base case keywords', () => {
      const thought = createBaseThought({
        content: 'Random content still',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('should define base cases early'))).toBe(true);
    });

    it('should not warn when thoughtNumber=3 (not early)', () => {
      const thought = createBaseThought({
        content: 'Random content',
        thoughtNumber: 3,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should define base cases early'))).toBe(false);
    });

    it('should not warn when content includes "base case"', () => {
      const thought = createBaseThought({
        content: 'The base case is when n equals zero',
        thoughtNumber: 1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should define base cases early'))).toBe(false);
    });

    it('should not warn when content includes "base condition"', () => {
      const thought = createBaseThought({
        content: 'The base condition handles empty list',
        thoughtNumber: 1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should define base cases early'))).toBe(false);
    });

    it('should not warn when content includes "termination"', () => {
      const thought = createBaseThought({
        content: 'Termination occurs at n=0',
        thoughtNumber: 1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should define base cases early'))).toBe(false);
    });

    it('should be case-insensitive for base case detection', () => {
      const thought = createBaseThought({
        content: 'BASE CASE: when input is empty',
        thoughtNumber: 1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should define base cases early'))).toBe(false);
    });
  });

  describe('recursive keywords validation', () => {
    it('should issue info when content lacks recursive keywords', () => {
      const thought = createBaseThought({
        content: 'Just solving the problem step by step',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('should make recursive structure explicit'))).toBe(true);
    });

    it.each([
      'recursive',
      'recursion',
      'self-similar',
      'subproblem',
      'divide',
      'conquer',
      'smaller instance',
    ])('should not issue info when content contains keyword: %s', (keyword) => {
      const thought = createBaseThought({
        content: `Using ${keyword} approach to solve this`,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should make recursive structure explicit'))).toBe(false);
    });

    it('should be case-insensitive for recursive keywords', () => {
      const thought = createBaseThought({
        content: 'Using RECURSION to break this down',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should make recursive structure explicit'))).toBe(false);
    });
  });

  describe('dependencies validation (later thoughts)', () => {
    it('should warn when thoughtNumber>2 has empty dependencies array', () => {
      const thought = createBaseThought({
        content: 'Working on the recursive solution',
        thoughtNumber: 3,
        dependencies: [],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('should depend on previous subproblems'))).toBe(true);
    });

    it('should not warn when thoughtNumber=2 has empty dependencies', () => {
      const thought = createBaseThought({
        content: 'Working on the recursive solution',
        thoughtNumber: 2,
        dependencies: [],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should depend on previous subproblems'))).toBe(false);
    });

    it('should not warn when thoughtNumber>2 has dependencies', () => {
      const thought = createBaseThought({
        content: 'Working on the recursive solution',
        thoughtNumber: 3,
        dependencies: ['thought-1', 'thought-2'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should depend on previous subproblems'))).toBe(false);
    });

    it('should not warn when thought has no dependencies property', () => {
      const thought = createBaseThought({
        content: 'Working on the recursive solution',
        thoughtNumber: 3,
      });
      // Remove dependencies property
      delete (thought as any).dependencies;
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should depend on previous subproblems'))).toBe(false);
    });
  });

  describe('combination logic validation (later thoughts)', () => {
    it('should issue info when thoughtNumber>2, no combination keywords, and nextThoughtNeeded', () => {
      const thought = createBaseThought({
        content: 'Processing the subproblems',
        thoughtNumber: 3,
        nextThoughtNeeded: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('explaining how subproblem solutions combine'))).toBe(true);
    });

    it('should not issue info when thoughtNumber<=2', () => {
      const thought = createBaseThought({
        content: 'Processing the subproblems',
        thoughtNumber: 2,
        nextThoughtNeeded: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('explaining how subproblem solutions combine'))).toBe(false);
    });

    it('should not issue info when nextThoughtNeeded is false', () => {
      const thought = createBaseThought({
        content: 'Processing the subproblems',
        thoughtNumber: 3,
        nextThoughtNeeded: false,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('explaining how subproblem solutions combine'))).toBe(false);
    });

    it.each([
      'combine',
      'merge',
      'build up',
    ])('should not issue info when content contains: %s', (keyword) => {
      const thought = createBaseThought({
        content: `We ${keyword} the results from the subproblems`,
        thoughtNumber: 3,
        nextThoughtNeeded: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('explaining how subproblem solutions combine'))).toBe(false);
    });
  });

  describe('deep recursion warning', () => {
    it('should warn when near end without termination keywords and nextThoughtNeeded', () => {
      const thought = createBaseThought({
        content: 'Still processing',
        thoughtNumber: 9, // 9 > 10 * 0.8 = 8
        totalThoughts: 10,
        nextThoughtNeeded: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Deep recursion detected'))).toBe(true);
    });

    it('should not warn when thoughtNumber is not past 80%', () => {
      const thought = createBaseThought({
        content: 'Still processing',
        thoughtNumber: 8, // 8 = 10 * 0.8 (boundary)
        totalThoughts: 10,
        nextThoughtNeeded: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Deep recursion detected'))).toBe(false);
    });

    it('should not warn when nextThoughtNeeded is false', () => {
      const thought = createBaseThought({
        content: 'Still processing',
        thoughtNumber: 9,
        totalThoughts: 10,
        nextThoughtNeeded: false,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Deep recursion detected'))).toBe(false);
    });

    it.each([
      'terminate',
      'termination',
      'base',
      'stop',
    ])('should not warn when content contains termination keyword: %s', (keyword) => {
      const thought = createBaseThought({
        content: `Checking for ${keyword} condition`,
        thoughtNumber: 9,
        totalThoughts: 10,
        nextThoughtNeeded: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Deep recursion detected'))).toBe(false);
    });

    it('should be case-insensitive for termination detection', () => {
      const thought = createBaseThought({
        content: 'TERMINATION reached',
        thoughtNumber: 9,
        totalThoughts: 10,
        nextThoughtNeeded: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Deep recursion detected'))).toBe(false);
    });
  });

  describe('validateCommon (inherited)', () => {
    it('should reject negative thoughtNumber', () => {
      const thought = createBaseThought({ thoughtNumber: -1 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Thought number must be positive'))).toBe(true);
    });

    it('should reject thoughtNumber exceeding totalThoughts', () => {
      const thought = createBaseThought({ thoughtNumber: 10, totalThoughts: 5 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('exceeds total'))).toBe(true);
    });
  });
});
