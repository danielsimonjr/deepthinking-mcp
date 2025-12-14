/**
 * ModeHandler Interface Tests - Phase 10 Sprint 1
 *
 * Tests for the ModeHandler interface contracts and helper functions.
 */

import { describe, it, expect } from 'vitest';
import {
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ModeStatus,
} from '../../../../src/modes/handlers/ModeHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';

describe('ModeHandler Interface', () => {
  describe('Helper Functions', () => {
    describe('validationSuccess', () => {
      it('should create a successful validation result with no warnings', () => {
        const result = validationSuccess();

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it('should create a successful validation result with warnings', () => {
        const warnings: ValidationWarning[] = [
          {
            field: 'mode',
            message: 'Experimental mode',
            suggestion: 'Consider using a stable mode',
          },
        ];

        const result = validationSuccess(warnings);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].field).toBe('mode');
      });
    });

    describe('validationFailure', () => {
      it('should create a failed validation result with errors', () => {
        const errors: ValidationError[] = [
          {
            field: 'thought',
            message: 'Thought content is required',
            code: 'EMPTY_THOUGHT',
          },
        ];

        const result = validationFailure(errors);

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('EMPTY_THOUGHT');
        expect(result.warnings).toHaveLength(0);
      });

      it('should create a failed validation result with errors and warnings', () => {
        const errors: ValidationError[] = [
          createValidationError('field1', 'Error message', 'ERR_CODE'),
        ];
        const warnings: ValidationWarning[] = [
          createValidationWarning('field2', 'Warning message'),
        ];

        const result = validationFailure(errors, warnings);

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.warnings).toHaveLength(1);
      });
    });

    describe('createValidationError', () => {
      it('should create a validation error with all fields', () => {
        const error = createValidationError(
          'thoughtNumber',
          'Must be positive',
          'INVALID_NUMBER'
        );

        expect(error.field).toBe('thoughtNumber');
        expect(error.message).toBe('Must be positive');
        expect(error.code).toBe('INVALID_NUMBER');
      });
    });

    describe('createValidationWarning', () => {
      it('should create a validation warning without suggestion', () => {
        const warning = createValidationWarning('mode', 'Experimental mode');

        expect(warning.field).toBe('mode');
        expect(warning.message).toBe('Experimental mode');
        expect(warning.suggestion).toBeUndefined();
      });

      it('should create a validation warning with suggestion', () => {
        const warning = createValidationWarning(
          'mode',
          'Experimental mode',
          'Use sequential mode instead'
        );

        expect(warning.field).toBe('mode');
        expect(warning.suggestion).toBe('Use sequential mode instead');
      });
    });
  });

  describe('Type Contracts', () => {
    it('should have ModeStatus type with required fields', () => {
      const status: ModeStatus = {
        mode: ThinkingMode.CAUSAL,
        isFullyImplemented: false,
        hasSpecializedHandler: true,
        note: 'Test note',
        supportedThoughtTypes: ['problem_definition', 'graph_construction'],
      };

      expect(status.mode).toBe(ThinkingMode.CAUSAL);
      expect(status.isFullyImplemented).toBe(false);
      expect(status.hasSpecializedHandler).toBe(true);
      expect(status.note).toBe('Test note');
      expect(status.supportedThoughtTypes).toContain('problem_definition');
    });

    it('should allow ModeStatus without optional fields', () => {
      const status: ModeStatus = {
        mode: ThinkingMode.SEQUENTIAL,
        isFullyImplemented: true,
        hasSpecializedHandler: false,
      };

      expect(status.note).toBeUndefined();
      expect(status.supportedThoughtTypes).toBeUndefined();
    });
  });
});
