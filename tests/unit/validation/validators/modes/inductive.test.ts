/**
 * Inductive Validator Tests (Phase 14 Sprint 2)
 * Tests for src/validation/validators/modes/inductive.ts
 *
 * Target: >90% branch coverage for 104 lines of validation logic
 * Error paths: 4, Warning paths: 2, Info paths: 1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InductiveValidator } from '../../../../../src/validation/validators/modes/inductive.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { InductiveThought } from '../../../../../src/types/core.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('InductiveValidator', () => {
  let validator: InductiveValidator;
  let context: ValidationContext;

  // Helper to create a minimal valid thought
  const createBaseThought = (overrides?: Partial<InductiveThought>): InductiveThought => ({
    id: 'thought-1',
    mode: ThinkingMode.INDUCTIVE,
    thought: 'Test thought',
    content: 'Inductive reasoning content',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    observations: ['Swan 1 is white', 'Swan 2 is white', 'Swan 3 is white'],
    generalization: 'All swans are white',
    confidence: 0.8,
    ...overrides,
  });

  beforeEach(() => {
    validator = new InductiveValidator();
    context = {
      sessionId: 'test-session',
      existingThoughts: new Map(),
    };
  });

  describe('getMode', () => {
    it('should return inductive', () => {
      expect(validator.getMode()).toBe('inductive');
    });
  });

  describe('validate - main entry point', () => {
    it('should accept valid thought with observations, generalization, and confidence', () => {
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

  describe('observations validation', () => {
    it('should error when observations is undefined', () => {
      const thought = createBaseThought({
        observations: undefined as any,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires at least one observation'))).toBe(true);
    });

    it('should error when observations array is empty', () => {
      const thought = createBaseThought({
        observations: [],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires at least one observation'))).toBe(true);
    });

    it('should accept single observation', () => {
      const thought = createBaseThought({
        observations: ['One observation'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('requires at least one observation'))).toBe(false);
    });

    it('should accept multiple observations', () => {
      const thought = createBaseThought({
        observations: ['Obs 1', 'Obs 2', 'Obs 3'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('requires at least one observation'))).toBe(false);
    });
  });

  describe('generalization validation', () => {
    it('should error when generalization is undefined', () => {
      const thought = createBaseThought({
        generalization: undefined as any,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires a generalization'))).toBe(true);
    });

    it('should error when generalization is empty string', () => {
      const thought = createBaseThought({
        generalization: '',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires a generalization'))).toBe(true);
    });

    it('should error when generalization is whitespace only', () => {
      const thought = createBaseThought({
        generalization: '   ',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('requires a generalization'))).toBe(true);
    });

    it('should accept valid generalization', () => {
      const thought = createBaseThought({
        generalization: 'All X have property Y',
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('requires a generalization'))).toBe(false);
    });
  });

  describe('confidence validation', () => {
    it('should error when confidence is below 0', () => {
      const thought = createBaseThought({
        confidence: -0.1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('Invalid confidence value'))).toBe(true);
    });

    it('should error when confidence is above 1', () => {
      const thought = createBaseThought({
        confidence: 1.1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('Invalid confidence value'))).toBe(true);
    });

    it('should accept confidence = 0', () => {
      const thought = createBaseThought({
        confidence: 0,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid confidence value'))).toBe(false);
    });

    it('should accept confidence = 1', () => {
      const thought = createBaseThought({
        confidence: 1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid confidence value'))).toBe(false);
    });

    it('should accept confidence = 0.5', () => {
      const thought = createBaseThought({
        confidence: 0.5,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid confidence value'))).toBe(false);
    });
  });

  describe('sampleSize validation', () => {
    it('should error when sampleSize is less than 1', () => {
      const thought = createBaseThought({
        sampleSize: 0,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('Invalid sample size'))).toBe(true);
    });

    it('should error when sampleSize is negative', () => {
      const thought = createBaseThought({
        sampleSize: -5,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'error' && i.description.includes('Invalid sample size'))).toBe(true);
    });

    it('should accept sampleSize = 1', () => {
      const thought = createBaseThought({
        sampleSize: 1,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid sample size'))).toBe(false);
    });

    it('should accept large sampleSize', () => {
      const thought = createBaseThought({
        sampleSize: 1000,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid sample size'))).toBe(false);
    });

    it('should not error when sampleSize is undefined', () => {
      const thought = createBaseThought({
        sampleSize: undefined,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid sample size'))).toBe(false);
    });
  });

  describe('small sample size warning', () => {
    it('should warn when sampleSize is 1', () => {
      const thought = createBaseThought({
        sampleSize: 1,
        confidence: 0.5,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Small sample size'))).toBe(true);
    });

    it('should warn when sampleSize is 2', () => {
      const thought = createBaseThought({
        sampleSize: 2,
        confidence: 0.5,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Small sample size'))).toBe(true);
    });

    it('should not warn when sampleSize is 3', () => {
      const thought = createBaseThought({
        sampleSize: 3,
        confidence: 0.5,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Small sample size'))).toBe(false);
    });

    it('should not warn when sampleSize is undefined', () => {
      const thought = createBaseThought({
        sampleSize: undefined,
        confidence: 0.5,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Small sample size'))).toBe(false);
    });
  });

  describe('high confidence with small sample warning', () => {
    it('should warn when high confidence and small sample', () => {
      const thought = createBaseThought({
        confidence: 0.9,
        sampleSize: 5,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('High confidence with small sample size'))).toBe(true);
    });

    it('should not warn when confidence is 0.8 (boundary)', () => {
      const thought = createBaseThought({
        confidence: 0.8,
        sampleSize: 5,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('High confidence with small sample size'))).toBe(false);
    });

    it('should warn when confidence is 0.81 and sample is small', () => {
      const thought = createBaseThought({
        confidence: 0.81,
        sampleSize: 9,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('High confidence with small sample size'))).toBe(true);
    });

    it('should not warn when sample size is 10 (boundary)', () => {
      const thought = createBaseThought({
        confidence: 0.95,
        sampleSize: 10,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('High confidence with small sample size'))).toBe(false);
    });

    it('should not warn when sample size is large', () => {
      const thought = createBaseThought({
        confidence: 0.99,
        sampleSize: 100,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('High confidence with small sample size'))).toBe(false);
    });

    it('should not warn when sampleSize is undefined', () => {
      const thought = createBaseThought({
        confidence: 0.99,
        sampleSize: undefined,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('High confidence with small sample size'))).toBe(false);
    });
  });

  describe('counterexamples info', () => {
    it('should issue info when counterexamples exist', () => {
      const thought = createBaseThought({
        counterexamples: ['Black swan observed in Australia'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('counterexample(s) noted'))).toBe(true);
    });

    it('should show count of counterexamples in info message', () => {
      const thought = createBaseThought({
        counterexamples: ['Exception 1', 'Exception 2', 'Exception 3'],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('3 counterexample(s)'))).toBe(true);
    });

    it('should not issue info when counterexamples array is empty', () => {
      const thought = createBaseThought({
        counterexamples: [],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('counterexample(s) noted'))).toBe(false);
    });

    it('should not issue info when counterexamples is undefined', () => {
      const thought = createBaseThought({
        counterexamples: undefined,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('counterexample(s) noted'))).toBe(false);
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
