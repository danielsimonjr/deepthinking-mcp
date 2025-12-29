/**
 * Deductive Validator Tests (Phase 14 Sprint 2)
 * Tests for src/validation/validators/modes/deductive.ts
 *
 * Target: >90% branch coverage for 118 lines of validation logic
 * Error paths: 3, Warning paths: 3, Info paths: 1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DeductiveValidator } from '../../../../../src/validation/validators/modes/deductive.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { DeductiveThought } from '../../../../../src/types/core.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('DeductiveValidator', () => {
  let validator: DeductiveValidator;
  let context: ValidationContext;

  // Helper to create a minimal valid thought
  const createBaseThought = (overrides?: Partial<DeductiveThought>): DeductiveThought => ({
    id: 'thought-1',
    mode: ThinkingMode.DEDUCTIVE,
    thought: 'Test thought',
    content: 'Deductive reasoning content',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    premises: ['All men are mortal', 'Socrates is a man'],
    conclusion: 'Therefore, Socrates is mortal',
    validityCheck: true,
    ...overrides,
  });

  beforeEach(() => {
    validator = new DeductiveValidator();
    context = {
      sessionId: 'test-session',
      existingThoughts: new Map(),
    };
  });

  describe('getMode', () => {
    it('should return deductive', () => {
      expect(validator.getMode()).toBe('deductive');
    });
  });

  describe('validate - main entry point', () => {
    it('should accept valid thought with premises, conclusion, and validityCheck', () => {
      const thought = createBaseThought();
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

  describe('premises validation', () => {
    it('should error when premises is undefined', () => {
      const thought = createBaseThought({
        premises: undefined as any,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires at least one premise'))).toBe(true);
    });

    it('should error when premises array is empty', () => {
      const thought = createBaseThought({
        premises: [],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires at least one premise'))).toBe(true);
    });

    it('should accept single premise', () => {
      const thought = createBaseThought({
        premises: ['All things are one'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('requires at least one premise'))).toBe(false);
    });

    it('should accept multiple premises', () => {
      const thought = createBaseThought({
        premises: ['P1', 'P2', 'P3'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('requires at least one premise'))).toBe(false);
    });
  });

  describe('conclusion validation', () => {
    it('should error when conclusion is undefined', () => {
      const thought = createBaseThought({
        conclusion: undefined as any,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires a conclusion'))).toBe(true);
    });

    it('should error when conclusion is empty string', () => {
      const thought = createBaseThought({
        conclusion: '',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires a conclusion'))).toBe(true);
    });

    it('should error when conclusion is whitespace only', () => {
      const thought = createBaseThought({
        conclusion: '   ',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires a conclusion'))).toBe(true);
    });

    it('should accept valid conclusion', () => {
      const thought = createBaseThought({
        conclusion: 'Therefore, X is true',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('requires a conclusion'))).toBe(false);
    });
  });

  describe('validityCheck validation', () => {
    it('should error when validityCheck is undefined', () => {
      const thought = createBaseThought({
        validityCheck: undefined as any,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('Validity check is required'))).toBe(true);
    });

    it('should error when validityCheck is null', () => {
      const thought = createBaseThought({
        validityCheck: null as any,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('Validity check is required'))).toBe(true);
    });

    it('should accept validityCheck = true', () => {
      const thought = createBaseThought({
        validityCheck: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Validity check is required'))).toBe(false);
    });

    it('should accept validityCheck = false', () => {
      const thought = createBaseThought({
        validityCheck: false,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Validity check is required'))).toBe(false);
    });
  });

  describe('invalid deduction warning', () => {
    it('should warn when validityCheck is false', () => {
      const thought = createBaseThought({
        validityCheck: false,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Deduction marked as invalid'))).toBe(true);
    });

    it('should not warn when validityCheck is true', () => {
      const thought = createBaseThought({
        validityCheck: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Deduction marked as invalid'))).toBe(false);
    });
  });

  describe('valid but unsound warning', () => {
    it('should warn when valid but unsound', () => {
      const thought = createBaseThought({
        validityCheck: true,
        soundnessCheck: false,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('valid but unsound'))).toBe(true);
    });

    it('should not warn when valid and sound', () => {
      const thought = createBaseThought({
        validityCheck: true,
        soundnessCheck: true,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('valid but unsound'))).toBe(false);
    });

    it('should not warn when invalid regardless of soundness', () => {
      const thought = createBaseThought({
        validityCheck: false,
        soundnessCheck: false,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('valid but unsound'))).toBe(false);
    });

    it('should not warn when soundnessCheck is undefined', () => {
      const thought = createBaseThought({
        validityCheck: true,
        soundnessCheck: undefined,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('valid but unsound'))).toBe(false);
    });
  });

  describe('logic form validation', () => {
    it.each([
      'modus ponens',
      'modus tollens',
      'hypothetical syllogism',
      'disjunctive syllogism',
      'constructive dilemma',
      'destructive dilemma',
    ])('should issue info for known logic form: %s', (form) => {
      const thought = createBaseThought({
        logicForm: form,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('Using recognized logic form'))).toBe(true);
    });

    it('should not issue info for unknown logic form', () => {
      const thought = createBaseThought({
        logicForm: 'some custom form',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Using recognized logic form'))).toBe(false);
    });

    it('should not issue info when logicForm is undefined', () => {
      const thought = createBaseThought({
        logicForm: undefined,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Using recognized logic form'))).toBe(false);
    });

    it('should be case-insensitive for logic forms', () => {
      const thought = createBaseThought({
        logicForm: 'MODUS PONENS',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Using recognized logic form'))).toBe(true);
    });

    it('should match partial logic form names', () => {
      const thought = createBaseThought({
        logicForm: 'Using modus ponens inference rule',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Using recognized logic form'))).toBe(true);
    });
  });

  describe('premise count warning', () => {
    it('should warn when more than 5 premises', () => {
      const thought = createBaseThought({
        premises: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Large number of premises'))).toBe(true);
    });

    it('should not warn when exactly 5 premises', () => {
      const thought = createBaseThought({
        premises: ['P1', 'P2', 'P3', 'P4', 'P5'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Large number of premises'))).toBe(false);
    });

    it('should not warn when fewer than 5 premises', () => {
      const thought = createBaseThought({
        premises: ['P1', 'P2'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Large number of premises'))).toBe(false);
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
