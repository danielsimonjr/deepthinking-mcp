/**
 * Mode Validators Integration Tests (Phase 14 Sprint 3)
 * Tests for all 10 Phase 14 validators working together
 *
 * Validates:
 * - Cross-validator consistency
 * - Error message quality
 * - ValidationIssue format compliance
 * - Real-world input scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ThinkingMode } from '../../../src/types/core.js';
import type { Thought } from '../../../src/types/core.js';
import type { ValidationContext, ValidationIssue } from '../../../src/validation/validator.js';

// Import all 10 Phase 14 validators
import { ComputabilityValidator } from '../../../src/validation/validators/modes/computability.js';
import { MetaReasoningValidator } from '../../../src/validation/validators/modes/metareasoning.js';
import { OptimizationValidator } from '../../../src/validation/validators/modes/optimization.js';
import { CryptanalyticValidator } from '../../../src/validation/validators/modes/cryptanalytic.js';
import { ConstraintValidator } from '../../../src/validation/validators/modes/constraint.js';
import { DeductiveValidator } from '../../../src/validation/validators/modes/deductive.js';
import { InductiveValidator } from '../../../src/validation/validators/modes/inductive.js';
import { RecursiveValidator } from '../../../src/validation/validators/modes/recursive.js';
import { StochasticValidator } from '../../../src/validation/validators/modes/stochastic.js';
import { ModalValidator } from '../../../src/validation/validators/modes/modal.js';

describe('Mode Validators Integration', () => {
  let context: ValidationContext;

  // All 10 Phase 14 validators
  const validators = [
    { name: 'computability', validator: new ComputabilityValidator(), mode: ThinkingMode.COMPUTABILITY },
    { name: 'metareasoning', validator: new MetaReasoningValidator(), mode: ThinkingMode.METAREASONING },
    { name: 'optimization', validator: new OptimizationValidator(), mode: ThinkingMode.OPTIMIZATION },
    { name: 'cryptanalytic', validator: new CryptanalyticValidator(), mode: ThinkingMode.CRYPTANALYTIC },
    { name: 'constraint', validator: new ConstraintValidator(), mode: ThinkingMode.CONSTRAINT },
    { name: 'deductive', validator: new DeductiveValidator(), mode: ThinkingMode.DEDUCTIVE },
    { name: 'inductive', validator: new InductiveValidator(), mode: ThinkingMode.INDUCTIVE },
    { name: 'recursive', validator: new RecursiveValidator(), mode: ThinkingMode.RECURSIVE },
    { name: 'stochastic', validator: new StochasticValidator(), mode: ThinkingMode.STOCHASTIC },
    { name: 'modal', validator: new ModalValidator(), mode: ThinkingMode.MODAL },
  ];

  // Helper to create a minimal thought for a given mode
  const createThought = (mode: ThinkingMode, overrides?: Partial<Thought>): Thought =>
    ({
      id: 'thought-1',
      mode,
      thought: 'Test thought',
      content: 'Test content for validation',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      ...overrides,
    }) as Thought;

  beforeEach(() => {
    context = {
      sessionId: 'integration-test-session',
      existingThoughts: new Map(),
    };
  });

  describe('Cross-Validator Consistency', () => {
    it('all validators should return correct mode from getMode()', () => {
      for (const { name, validator } of validators) {
        expect(validator.getMode()).toBe(name);
      }
    });

    it('all validators should return ValidationIssue[] format', () => {
      for (const { validator, mode } of validators) {
        const thought = createThought(mode);
        const issues = validator.validate(thought, context);

        expect(Array.isArray(issues)).toBe(true);
        for (const issue of issues) {
          expect(issue).toHaveProperty('severity');
          expect(issue).toHaveProperty('thoughtNumber');
          expect(issue).toHaveProperty('description');
          expect(['error', 'warning', 'info']).toContain(issue.severity);
        }
      }
    });

    it('all validators should reject negative thoughtNumber via validateCommon', () => {
      for (const { validator, mode, name } of validators) {
        const thought = createThought(mode, { thoughtNumber: -1 });
        const issues = validator.validate(thought, context);

        expect(
          issues.some((i) => i.description.includes('Thought number must be positive')),
          `${name} validator should reject negative thoughtNumber`
        ).toBe(true);
      }
    });

    it('all validators should reject thoughtNumber exceeding totalThoughts', () => {
      for (const { validator, mode, name } of validators) {
        const thought = createThought(mode, { thoughtNumber: 10, totalThoughts: 5 });
        const issues = validator.validate(thought, context);

        expect(
          issues.some((i) => i.description.includes('exceeds total')),
          `${name} validator should reject thoughtNumber > totalThoughts`
        ).toBe(true);
      }
    });

    it('all validators should process valid base thought without throwing', () => {
      for (const { validator, mode, name } of validators) {
        const thought = createThought(mode, {
          content: 'Valid content with relevant keywords for this mode',
        });

        // Validators should run without throwing
        expect(() => {
          const issues = validator.validate(thought, context);
          // Should return valid array format
          expect(Array.isArray(issues)).toBe(true);
        }).not.toThrow();
      }
    });
  });

  describe('Error Message Quality', () => {
    it('all ValidationIssues should have non-empty description', () => {
      for (const { validator, mode } of validators) {
        // Force some issues by using invalid input
        const thought = createThought(mode, { thoughtNumber: -1 });
        const issues = validator.validate(thought, context);

        for (const issue of issues) {
          expect(issue.description.length).toBeGreaterThan(0);
        }
      }
    });

    it('all ValidationIssues should have category property', () => {
      for (const { validator, mode } of validators) {
        const thought = createThought(mode, { thoughtNumber: -1 });
        const issues = validator.validate(thought, context);

        for (const issue of issues) {
          expect(issue).toHaveProperty('category');
          expect(['structural', 'logical', 'semantic']).toContain(issue.category);
        }
      }
    });

    it('error issues should be clearly distinguishable from warnings', () => {
      for (const { validator, mode } of validators) {
        const thought = createThought(mode, { thoughtNumber: -1 });
        const issues = validator.validate(thought, context);

        const errors = issues.filter((i) => i.severity === 'error');
        const warnings = issues.filter((i) => i.severity === 'warning');

        // Each error and warning should have unique description
        const errorDescriptions = errors.map((e) => e.description);
        const warningDescriptions = warnings.map((w) => w.description);

        for (const errDesc of errorDescriptions) {
          expect(warningDescriptions).not.toContain(errDesc);
        }
      }
    });

    it('issues should include suggestion when applicable', () => {
      // Test with validators known to provide suggestions
      const modalValidator = new ModalValidator();
      const thought = createThought(ThinkingMode.MODAL, {
        content: 'Generic content without modal operators',
      });
      const issues = modalValidator.validate(thought, context);
      const modalWarning = issues.find((i) =>
        i.description.includes('Modal logic should use modal operators')
      );

      expect(modalWarning).toBeDefined();
      expect(modalWarning?.suggestion).toBeDefined();
      expect(modalWarning?.suggestion?.length).toBeGreaterThan(0);
    });
  });

  describe('Real-World Input Scenarios', () => {
    // Note: Sprint 1 validators (computability, optimization, cryptanalytic) have
    // strict structural requirements (typed objects). These tests verify validation
    // runs correctly and returns proper format, not that content alone satisfies structure.

    it('computability validator processes Turing machine content without throwing', () => {
      const validator = new ComputabilityValidator();
      const thought = createThought(ThinkingMode.COMPUTABILITY, {
        content: 'Analyzing the halting problem for this Turing machine',
      });
      const issues = validator.validate(thought, context);

      // Validator runs and returns valid issues array
      expect(Array.isArray(issues)).toBe(true);
      issues.forEach((i) => expect(['error', 'warning', 'info']).toContain(i.severity));
    });

    it('metareasoning validator processes self-reflection content without throwing', () => {
      const validator = new MetaReasoningValidator();
      const thought = createThought(ThinkingMode.METAREASONING, {
        content: 'Reflecting on my reasoning strategy and evaluating its effectiveness',
      });
      const issues = validator.validate(thought, context);

      // Validator runs and returns valid issues array
      expect(Array.isArray(issues)).toBe(true);
      issues.forEach((i) => expect(['error', 'warning', 'info']).toContain(i.severity));
    });

    it('optimization validator processes constraint content without throwing', () => {
      const validator = new OptimizationValidator();
      const thought = createThought(ThinkingMode.OPTIMIZATION, {
        content: 'Maximizing the objective function subject to linear constraints',
      });
      const issues = validator.validate(thought, context);

      // Validator runs and returns valid issues array
      expect(Array.isArray(issues)).toBe(true);
      issues.forEach((i) => expect(['error', 'warning', 'info']).toContain(i.severity));
    });

    it('cryptanalytic validator processes evidence analysis without throwing', () => {
      const validator = new CryptanalyticValidator();
      const thought = createThought(ThinkingMode.CRYPTANALYTIC, {
        content: 'Analyzing the evidence using statistical cryptanalysis techniques',
      });
      const issues = validator.validate(thought, context);

      // Validator runs and returns valid issues array
      expect(Array.isArray(issues)).toBe(true);
      issues.forEach((i) => expect(['error', 'warning', 'info']).toContain(i.severity));
    });

    it('deductive validator processes logical syllogism without throwing', () => {
      const validator = new DeductiveValidator();
      const thought = createThought(ThinkingMode.DEDUCTIVE, {
        content: 'Given the premises, we can deduce the logical conclusion',
      });
      const issues = validator.validate(thought, context);

      // Validator runs and returns valid issues array
      expect(Array.isArray(issues)).toBe(true);
      issues.forEach((i) => expect(['error', 'warning', 'info']).toContain(i.severity));
    });

    it('inductive validator processes pattern observation without throwing', () => {
      const validator = new InductiveValidator();
      const thought = createThought(ThinkingMode.INDUCTIVE, {
        content: 'Observing the pattern in the data, we generalize that all cases follow this rule',
      });
      const issues = validator.validate(thought, context);

      // Validator runs and returns valid issues array
      expect(Array.isArray(issues)).toBe(true);
      issues.forEach((i) => expect(['error', 'warning', 'info']).toContain(i.severity));
    });

    it('recursive validator handles base case content', () => {
      const validator = new RecursiveValidator();
      const thought = createThought(ThinkingMode.RECURSIVE, {
        content: 'Base case: when n=0, return 1. Recursive step: solve subproblem n-1',
      });
      const issues = validator.validate(thought, context);

      expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    });

    it('stochastic validator handles probability distribution content', () => {
      const validator = new StochasticValidator();
      const thought = createThought(ThinkingMode.STOCHASTIC, {
        content: 'Using random sampling from a probability distribution',
      });
      const issues = validator.validate(thought, context);

      expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    });

    it('modal validator handles necessity/possibility content', () => {
      const validator = new ModalValidator();
      const thought = createThought(ThinkingMode.MODAL, {
        content: 'It is necessarily true in all possible worlds that 2+2=4',
      });
      const issues = validator.validate(thought, context);

      expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
      expect(issues.filter((i) => i.severity === 'warning')).toHaveLength(0);
    });

    it('constraint validator handles satisfaction keywords', () => {
      const validator = new ConstraintValidator();
      const thought = createThought(ThinkingMode.CONSTRAINT, {
        content: 'Checking if the constraint is satisfiable with these variable assignments',
      });
      const issues = validator.validate(thought, context);

      expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    });
  });

  describe('Boundary Value Analysis', () => {
    it('thoughtNumber = 1 should be valid for all validators', () => {
      for (const { validator, mode, name } of validators) {
        const thought = createThought(mode, { thoughtNumber: 1, totalThoughts: 5 });
        const issues = validator.validate(thought, context);

        expect(
          issues.some(
            (i) =>
              i.severity === 'error' &&
              (i.description.includes('Thought number') || i.description.includes('exceeds'))
          ),
          `${name} should accept thoughtNumber=1`
        ).toBe(false);
      }
    });

    it('thoughtNumber = totalThoughts should be valid', () => {
      for (const { validator, mode, name } of validators) {
        const thought = createThought(mode, { thoughtNumber: 5, totalThoughts: 5 });
        const issues = validator.validate(thought, context);

        expect(
          issues.some((i) => i.description.includes('exceeds total')),
          `${name} should accept thoughtNumber=totalThoughts`
        ).toBe(false);
      }
    });

    it('thoughtNumber = 0 should be invalid for all validators', () => {
      for (const { validator, mode, name } of validators) {
        const thought = createThought(mode, { thoughtNumber: 0, totalThoughts: 5 });
        const issues = validator.validate(thought, context);

        expect(
          issues.some((i) => i.description.includes('Thought number must be positive')),
          `${name} should reject thoughtNumber=0`
        ).toBe(true);
      }
    });
  });

  describe('State Isolation', () => {
    it('rapid successive validations should not leak state', () => {
      for (const { validator, mode } of validators) {
        const thought1 = createThought(mode, { id: 'thought-1', thoughtNumber: 1 });
        const thought2 = createThought(mode, { id: 'thought-2', thoughtNumber: 2 });
        const thought3 = createThought(mode, { id: 'thought-3', thoughtNumber: 3 });

        // Validate in rapid succession
        const issues1 = validator.validate(thought1, context);
        const issues2 = validator.validate(thought2, context);
        const issues3 = validator.validate(thought3, context);

        // Results should be independent
        expect(issues1).not.toBe(issues2);
        expect(issues2).not.toBe(issues3);

        // Each should report correct thoughtNumber in issues
        for (const issue of issues1) {
          expect(issue.thoughtNumber).toBe(1);
        }
        for (const issue of issues2) {
          expect(issue.thoughtNumber).toBe(2);
        }
        for (const issue of issues3) {
          expect(issue.thoughtNumber).toBe(3);
        }
      }
    });

    it('different contexts should not affect each other', () => {
      const context1: ValidationContext = {
        sessionId: 'session-1',
        existingThoughts: new Map(),
      };
      const context2: ValidationContext = {
        sessionId: 'session-2',
        existingThoughts: new Map(),
      };

      for (const { validator, mode } of validators) {
        const thought = createThought(mode);

        const issues1 = validator.validate(thought, context1);
        const issues2 = validator.validate(thought, context2);

        // Results should be equal (validators are stateless)
        expect(issues1.length).toBe(issues2.length);
      }
    });
  });

  describe('All 10 Validators Present', () => {
    it('should have exactly 10 validators', () => {
      expect(validators).toHaveLength(10);
    });

    it('should cover all Sprint 1 validators (HIGH-risk)', () => {
      const sprint1Modes = ['computability', 'metareasoning', 'optimization', 'cryptanalytic'];
      for (const modeName of sprint1Modes) {
        expect(
          validators.some((v) => v.name === modeName),
          `Missing Sprint 1 validator: ${modeName}`
        ).toBe(true);
      }
    });

    it('should cover all Sprint 2 validators (MEDIUM-risk)', () => {
      const sprint2Modes = ['constraint', 'deductive', 'inductive', 'recursive'];
      for (const modeName of sprint2Modes) {
        expect(
          validators.some((v) => v.name === modeName),
          `Missing Sprint 2 validator: ${modeName}`
        ).toBe(true);
      }
    });

    it('should cover all Sprint 3 validators (LOW-risk)', () => {
      const sprint3Modes = ['stochastic', 'modal'];
      for (const modeName of sprint3Modes) {
        expect(
          validators.some((v) => v.name === modeName),
          `Missing Sprint 3 validator: ${modeName}`
        ).toBe(true);
      }
    });
  });
});
