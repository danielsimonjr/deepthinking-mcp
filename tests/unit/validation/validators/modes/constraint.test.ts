/**
 * Constraint Validator Tests (Phase 14 Sprint 2)
 * Tests for src/validation/validators/modes/constraint.ts
 *
 * Target: >90% branch coverage for 84 lines of validation logic
 * Error paths: 1, Warning paths: 1, Info paths: 2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConstraintValidator } from '../../../../../src/validation/validators/modes/constraint.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { Thought } from '../../../../../src/types/core.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('ConstraintValidator', () => {
  let validator: ConstraintValidator;
  let context: ValidationContext;

  // Helper to create a minimal valid thought
  const createBaseThought = (overrides?: Partial<Thought>): Thought => ({
    id: 'thought-1',
    mode: ThinkingMode.CONSTRAINT,
    thought: 'Test thought',
    content: 'This constraint must satisfy the requirements',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    ...overrides,
  } as Thought);

  beforeEach(() => {
    validator = new ConstraintValidator();
    context = {
      sessionId: 'test-session',
      existingThoughts: new Map(),
    };
  });

  describe('getMode', () => {
    it('should return constraint', () => {
      expect(validator.getMode()).toBe('constraint');
    });
  });

  describe('validate - main entry point', () => {
    it('should accept valid thought with constraints and keywords', () => {
      const thought = createBaseThought({
        constraints: [
          { description: 'Must be non-negative', type: 'inequality' },
        ],
        content: 'The constraint must be satisfied by the solution',
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

  describe('constraints array validation', () => {
    it('should warn on empty constraints array', () => {
      const thought = createBaseThought({
        constraints: [],
        content: 'This constraint must be satisfied',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('should define constraints'))).toBe(true);
    });

    it('should not warn when constraints array has items', () => {
      const thought = createBaseThought({
        constraints: [{ description: 'x >= 0', type: 'inequality' }],
        content: 'This constraint must be satisfied',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should define constraints'))).toBe(false);
    });

    it('should error when constraint has no description and no type', () => {
      const thought = createBaseThought({
        constraints: [{ name: 'c1' }], // Missing description and type
        content: 'This constraint must be satisfied',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('should have a description or type'))).toBe(true);
    });

    it('should accept constraint with only description', () => {
      const thought = createBaseThought({
        constraints: [{ description: 'x must be positive' }],
        content: 'This constraint must be satisfied',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should have a description or type'))).toBe(false);
    });

    it('should accept constraint with only type', () => {
      const thought = createBaseThought({
        constraints: [{ type: 'equality' }],
        content: 'This constraint must be satisfied',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should have a description or type'))).toBe(false);
    });

    it('should validate multiple constraints', () => {
      const thought = createBaseThought({
        constraints: [
          { description: 'valid constraint' },
          { name: 'invalid' }, // Missing description and type
          { type: 'boundary' },
        ],
        content: 'This constraint must be satisfied',
      });
      const issues = validator.validate(thought, context);
      const constraintErrors = issues.filter(i => i.description.includes('should have a description or type'));
      expect(constraintErrors).toHaveLength(1);
    });
  });

  describe('constraint keywords validation', () => {
    it('should not issue info when content has constraint keyword', () => {
      const thought = createBaseThought({
        content: 'The constraint must be satisfied by our solution',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('typically discusses constraints explicitly'))).toBe(false);
    });

    it('should issue info when content lacks constraint keywords', () => {
      const thought = createBaseThought({
        content: 'Just some random text without relevant keywords',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('typically discusses constraints explicitly'))).toBe(true);
    });

    it.each([
      'constraint',
      'satisfy',
      'violate',
      'requirement',
      'condition',
      'limit',
    ])('should recognize keyword: %s', (keyword) => {
      const thought = createBaseThought({
        content: `This involves a ${keyword} in the problem`,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('typically discusses constraints explicitly'))).toBe(false);
    });
  });

  describe('solution validation', () => {
    it('should issue info when solution lacks satisfaction language', () => {
      const thought = createBaseThought({
        solution: { value: 42 },
        thoughtNumber: 2,
        content: 'Here is the answer to the problem',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('should be validated against constraints'))).toBe(true);
    });

    it('should not issue info when solution has satisfaction language: satisfies', () => {
      const thought = createBaseThought({
        solution: { value: 42 },
        thoughtNumber: 2,
        content: 'The solution satisfies all constraints',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should be validated against constraints'))).toBe(false);
    });

    it('should not issue info when solution has satisfaction language: meets', () => {
      const thought = createBaseThought({
        solution: { value: 42 },
        thoughtNumber: 2,
        content: 'This solution meets the requirements',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should be validated against constraints'))).toBe(false);
    });

    it('should not issue info when solution has satisfaction language: valid', () => {
      const thought = createBaseThought({
        solution: { value: 42 },
        thoughtNumber: 2,
        content: 'The solution is valid',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should be validated against constraints'))).toBe(false);
    });

    it('should not check satisfaction language for thoughtNumber 1', () => {
      const thought = createBaseThought({
        solution: { value: 42 },
        thoughtNumber: 1,
        content: 'Starting the problem',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should be validated against constraints'))).toBe(false);
    });

    it('should not check when there is no solution', () => {
      const thought = createBaseThought({
        thoughtNumber: 2,
        content: 'Just some text without solution',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('should be validated against constraints'))).toBe(false);
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
