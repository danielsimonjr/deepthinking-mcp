/**
 * Modal Validator Tests (Phase 14 Sprint 3)
 * Tests for src/validation/validators/modes/modal.ts
 *
 * Target: >90% branch coverage for 47 lines of validation logic
 * Actual paths: 0 errors, 1 warning, 1 info
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModalValidator } from '../../../../../src/validation/validators/modes/modal.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { Thought } from '../../../../../src/types/core.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('ModalValidator', () => {
  let validator: ModalValidator;
  let context: ValidationContext;

  // Helper to create a minimal valid thought
  const createBaseThought = (overrides?: Partial<Thought>): Thought =>
    ({
      id: 'thought-1',
      mode: ThinkingMode.MODAL,
      thought: 'Test thought',
      content: 'It is necessarily true that P',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      ...overrides,
    }) as Thought;

  beforeEach(() => {
    validator = new ModalValidator();
    context = {
      sessionId: 'test-session',
      existingThoughts: new Map(),
    };
  });

  describe('getMode', () => {
    it('should return modal', () => {
      expect(validator.getMode()).toBe('modal');
    });
  });

  describe('validate - main entry point', () => {
    it('should accept valid thought with modal operators', () => {
      const thought = createBaseThought({
        content: 'It is necessarily true that all bachelors are unmarried',
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    });

    it('should validate common fields via base class', () => {
      const thought = createBaseThought({
        thoughtNumber: -1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some((i) => i.description.includes('Thought number must be positive'))).toBe(
        true
      );
    });
  });

  describe('modal operators validation', () => {
    it('should pass when content contains "necessarily"', () => {
      const thought = createBaseThought({
        content: 'It is necessarily the case that 2+2=4',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "necessary"', () => {
      const thought = createBaseThought({
        content: 'A necessary condition for X is Y',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "must"', () => {
      const thought = createBaseThought({
        content: 'The conclusion must follow from the premises',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "possibly"', () => {
      const thought = createBaseThought({
        content: 'It is possibly true that aliens exist',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "possible"', () => {
      const thought = createBaseThought({
        content: 'It is possible that the hypothesis is correct',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "might"', () => {
      const thought = createBaseThought({
        content: 'The system might fail under load',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "could"', () => {
      const thought = createBaseThought({
        content: 'The experiment could yield different results',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "impossible"', () => {
      const thought = createBaseThought({
        content: 'It is impossible for a circle to be square',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "cannot"', () => {
      const thought = createBaseThought({
        content: 'A married bachelor cannot exist',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "contingent"', () => {
      const thought = createBaseThought({
        content: 'The outcome is contingent on initial conditions',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should pass when content contains "may or may not"', () => {
      const thought = createBaseThought({
        content: 'The proposition may or may not be true',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should be case-insensitive for modal operators', () => {
      const thought = createBaseThought({
        content: 'It is NECESSARILY TRUE that POSSIBLY something exists',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(false);
    });

    it('should warn when content lacks modal operators', () => {
      const thought = createBaseThought({
        content: 'Some generic statement without modal terms',
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some(
          (i) =>
            i.severity === 'warning' &&
            i.description.includes('Modal logic should use modal operators')
        )
      ).toBe(true);
    });

    it('should include suggestion about box and diamond symbols', () => {
      const thought = createBaseThought({
        content: 'Generic content',
      });
      const issues = validator.validate(thought, context);
      const modalWarning = issues.find((i) =>
        i.description.includes('Modal logic should use modal operators')
      );
      expect(modalWarning?.suggestion).toContain('□');
      expect(modalWarning?.suggestion).toContain('◇');
    });
  });

  describe('world/scenario references validation', () => {
    it('should pass when content contains "world"', () => {
      const thought = createBaseThought({
        content: 'In this possible world, P holds',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal reasoning often considers'))
      ).toBe(false);
    });

    it('should pass when content contains "scenario"', () => {
      const thought = createBaseThought({
        content: 'In the alternative scenario, Q is true',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal reasoning often considers'))
      ).toBe(false);
    });

    it('should pass when content contains "case"', () => {
      const thought = createBaseThought({
        content: 'In the base case, the property holds',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal reasoning often considers'))
      ).toBe(false);
    });

    it('should pass when content contains "situation"', () => {
      const thought = createBaseThought({
        content: 'In this situation, necessity applies',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal reasoning often considers'))
      ).toBe(false);
    });

    it('should pass when content contains "circumstance"', () => {
      const thought = createBaseThought({
        content: 'Under these circumstances, possibility holds',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal reasoning often considers'))
      ).toBe(false);
    });

    it('should be case-insensitive for world keywords', () => {
      const thought = createBaseThought({
        content: 'In this POSSIBLE WORLD, the SCENARIO unfolds',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal reasoning often considers'))
      ).toBe(false);
    });

    it('should issue info when thoughtNumber > 1 and no world references', () => {
      const thought = createBaseThought({
        content: 'Necessarily P implies Q',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some(
          (i) =>
            i.severity === 'info' &&
            i.description.includes('Modal reasoning often considers different possible worlds')
        )
      ).toBe(true);
    });

    it('should not issue info when thoughtNumber is 1', () => {
      const thought = createBaseThought({
        content: 'Necessarily P implies Q',
        thoughtNumber: 1,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal reasoning often considers'))
      ).toBe(false);
    });

    it('should not issue info when thoughtNumber is 1 even without world keywords', () => {
      const thought = createBaseThought({
        content: 'Generic content without worlds',
        thoughtNumber: 1,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal reasoning often considers'))
      ).toBe(false);
    });

    it('should issue info for thoughtNumber 3 without world references', () => {
      const thought = createBaseThought({
        content: 'Possibly true statement',
        thoughtNumber: 3,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some(
          (i) =>
            i.severity === 'info' &&
            i.description.includes('Modal reasoning often considers')
        )
      ).toBe(true);
    });
  });

  describe('validateCommon (inherited)', () => {
    it('should reject negative thoughtNumber', () => {
      const thought = createBaseThought({ thoughtNumber: -1 });
      const issues = validator.validate(thought, context);
      expect(issues.some((i) => i.description.includes('Thought number must be positive'))).toBe(
        true
      );
    });

    it('should reject thoughtNumber exceeding totalThoughts', () => {
      const thought = createBaseThought({ thoughtNumber: 10, totalThoughts: 5 });
      const issues = validator.validate(thought, context);
      expect(issues.some((i) => i.description.includes('exceeds total'))).toBe(true);
    });

    it('should pass with valid thoughtNumber and totalThoughts', () => {
      const thought = createBaseThought({ thoughtNumber: 3, totalThoughts: 10 });
      const issues = validator.validate(thought, context);
      expect(issues.some((i) => i.description.includes('exceeds total'))).toBe(false);
      expect(issues.some((i) => i.description.includes('must be positive'))).toBe(false);
    });
  });

  describe('combined scenarios', () => {
    it('should have no warnings or info with ideal modal content', () => {
      const thought = createBaseThought({
        content: 'In this possible world, P is necessarily true',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
      expect(issues.filter((i) => i.severity === 'warning')).toHaveLength(0);
      expect(issues.filter((i) => i.severity === 'info')).toHaveLength(0);
    });

    it('should accumulate warning and info for poor modal content in later thought', () => {
      const thought = createBaseThought({
        content: 'Some unrelated statement',
        thoughtNumber: 2,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some(
          (i) =>
            i.severity === 'warning' &&
            i.description.includes('Modal logic should use modal operators')
        )
      ).toBe(true);
      expect(
        issues.some(
          (i) =>
            i.severity === 'info' && i.description.includes('Modal reasoning often considers')
        )
      ).toBe(true);
    });

    it('should only warn (not info) for poor modal content in first thought', () => {
      const thought = createBaseThought({
        content: 'Some unrelated statement',
        thoughtNumber: 1,
      });
      const issues = validator.validate(thought, context);
      expect(
        issues.some((i) => i.description.includes('Modal logic should use modal operators'))
      ).toBe(true);
      expect(
        issues.some((i) => i.description.includes('Modal reasoning often considers'))
      ).toBe(false);
    });
  });
});
