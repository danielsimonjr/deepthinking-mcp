/**
 * ModeHandler Interface Tests - Phase 10 Sprint 1
 *
 * Tests for the ModeHandler interface contracts and helper functions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkThoughtBasics,
  checkThoughtType,
  checkUncertaintyRange,
  createThoughtBase,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
  type ValidationResult,
  type HandlerValidationError,
  type ValidationWarning,
  type ModeStatus,
} from '../../../../src/modes/handlers/ModeHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

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
        const errors: HandlerValidationError[] = [
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
        const errors: HandlerValidationError[] = [
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

    describe('checkThoughtBasics', () => {
      const input = (over: Record<string, unknown> = {}) =>
        ({
          thought: 'a real thought',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          ...over,
        }) as ThinkingToolInput;

      it('returns undefined when the thought has text and the number fits', () => {
        expect(checkThoughtBasics(input())).toBeUndefined();
      });

      it('accepts a thought number equal to the total', () => {
        expect(checkThoughtBasics(input({ thoughtNumber: 3 }))).toBeUndefined();
      });

      it.each([
        ['an empty string', ''],
        ['spaces only', '   '],
        ['tabs and newlines only', '\n\t'],
        ['undefined', undefined],
        ['null', null],
      ])('fails with EMPTY_THOUGHT for %s', (_label, thought) => {
        const result = checkThoughtBasics(input({ thought }));

        expect(result).toEqual({
          valid: false,
          errors: [
            {
              field: 'thought',
              message: 'Thought content is required',
              code: 'EMPTY_THOUGHT',
            },
          ],
          warnings: [],
        });
      });

      it('fails with INVALID_THOUGHT_NUMBER when the number exceeds the total', () => {
        const result = checkThoughtBasics(input({ thoughtNumber: 4, totalThoughts: 3 }));

        expect(result).toEqual({
          valid: false,
          errors: [
            {
              field: 'thoughtNumber',
              message: 'Thought number (4) exceeds total thoughts (3)',
              code: 'INVALID_THOUGHT_NUMBER',
            },
          ],
          warnings: [],
        });
      });

      it('reports the empty thought first when both checks fail', () => {
        const result = checkThoughtBasics(input({ thought: '', thoughtNumber: 9, totalThoughts: 1 }));

        expect(result?.errors.map((e) => e.code)).toEqual(['EMPTY_THOUGHT']);
      });

      it('returns a new result on every call', () => {
        const a = checkThoughtBasics(input({ thought: '' }));
        const b = checkThoughtBasics(input({ thought: '' }));

        expect(a).not.toBe(b);
        expect(a?.errors).not.toBe(b?.errors);
      });
    });

    describe('checkThoughtType', () => {
      const input = (over: Record<string, unknown> = {}) =>
        ({
          thought: 'a real thought',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          ...over,
        }) as ThinkingToolInput;
      const valid = ['alpha', 'beta', 'gamma'];

      it('returns undefined when the input has no thought type', () => {
        expect(checkThoughtType(input(), valid)).toBeUndefined();
      });

      it.each([
        ['an empty string', ''],
        ['zero', 0],
        ['null', null],
        ['false', false],
      ])('returns undefined for %s, which is not a thought type', (_label, thoughtType) => {
        expect(checkThoughtType(input({ thoughtType }), valid)).toBeUndefined();
      });

      it.each(valid)('returns undefined for the valid type %s', (thoughtType) => {
        expect(checkThoughtType(input({ thoughtType }), valid)).toBeUndefined();
      });

      it('warns about an unknown type and lists the valid types in order', () => {
        expect(checkThoughtType(input({ thoughtType: 'bogus' }), valid)).toEqual({
          field: 'thoughtType',
          message: 'Unknown thought type: bogus',
          suggestion: 'Valid types: alpha, beta, gamma',
        });
      });

      it('compares the type with the valid types exactly, so the case matters', () => {
        expect(checkThoughtType(input({ thoughtType: 'ALPHA' }), valid)?.message).toBe(
          'Unknown thought type: ALPHA'
        );
      });

      it.each([
        ['a number', 5, 'Unknown thought type: 5'],
        ['true', true, 'Unknown thought type: true'],
        ['an object', {}, 'Unknown thought type: [object Object]'],
      ])('warns about %s that is not a type name', (_label, thoughtType, message) => {
        expect(checkThoughtType(input({ thoughtType }), valid)?.message).toBe(message);
      });

      it.each(['toString', '__proto__', 'constructor'])(
        'warns about %s, a name that exists on every object but is not a valid type',
        (thoughtType) => {
          expect(checkThoughtType(input({ thoughtType }), valid)?.message).toBe(
            `Unknown thought type: ${thoughtType}`
          );
        }
      );

      it('warns for every type when the list of valid types is empty', () => {
        expect(checkThoughtType(input({ thoughtType: 'alpha' }), [])?.suggestion).toBe('Valid types: ');
      });

      it('returns a new warning on every call', () => {
        const a = checkThoughtType(input({ thoughtType: 'bogus' }), valid);
        const b = checkThoughtType(input({ thoughtType: 'bogus' }), valid);

        expect(a).toEqual(b);
        expect(a).not.toBe(b);
      });
    });

    describe('checkUncertaintyRange', () => {
      const input = (over: Record<string, unknown> = {}) =>
        ({
          thought: 'a real thought',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          ...over,
        }) as ThinkingToolInput;

      it('returns undefined when the input has no uncertainty', () => {
        expect(checkUncertaintyRange(input())).toBeUndefined();
        expect(checkUncertaintyRange(input({ uncertainty: undefined }))).toBeUndefined();
      });

      it.each([0, 0.25, 0.5, 1])('returns undefined for the uncertainty %s, which is in range', (uncertainty) => {
        expect(checkUncertaintyRange(input({ uncertainty }))).toBeUndefined();
      });

      it.each([-1, -0.0001, 1.0001, 2, Infinity, -Infinity])(
        'fails with UNCERTAINTY_OUT_OF_RANGE for %s',
        (uncertainty) => {
          expect(checkUncertaintyRange(input({ uncertainty }))).toEqual({
            field: 'uncertainty',
            message: `Uncertainty (${uncertainty}) must be between 0 and 1`,
            code: 'UNCERTAINTY_OUT_OF_RANGE',
          });
        }
      );

      it('keeps the rule of the handlers: a value that no comparison can order is not an error', () => {
        expect(checkUncertaintyRange(input({ uncertainty: NaN }))).toBeUndefined();
        expect(checkUncertaintyRange(input({ uncertainty: null }))).toBeUndefined();
      });

      it('returns a new error on every call', () => {
        const a = checkUncertaintyRange(input({ uncertainty: 2 }));
        const b = checkUncertaintyRange(input({ uncertainty: 2 }));

        expect(a).toEqual(b);
        expect(a).not.toBe(b);
      });
    });

    describe('createThoughtBase', () => {
      const input = (over: Record<string, unknown> = {}) =>
        ({
          thought: 'a real thought',
          thoughtNumber: 2,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          isRevision: true,
          revisesThought: '1',
          ...over,
        }) as ThinkingToolInput;

      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('copies the seven shared fields from the input', () => {
        expect(createThoughtBase(input(), 'sess-1')).toEqual({
          id: expect.any(String),
          sessionId: 'sess-1',
          thoughtNumber: 2,
          totalThoughts: 5,
          content: 'a real thought',
          timestamp: new Date('2026-01-02T03:04:05.000Z'),
          nextThoughtNeeded: true,
        });
      });

      it('gives the fields in the order that the thoughts have always had', () => {
        expect(Object.keys(createThoughtBase(input(), 's'))).toEqual([
          'id',
          'sessionId',
          'thoughtNumber',
          'totalThoughts',
          'content',
          'timestamp',
          'nextThoughtNeeded',
        ]);
      });

      it('leaves the revision fields and the mode to the handler', () => {
        const keys = Object.keys(createThoughtBase(input(), 's'));

        expect(keys).not.toContain('isRevision');
        expect(keys).not.toContain('revisesThought');
        expect(keys).not.toContain('mode');
      });

      it('keeps a nextThoughtNeeded of false', () => {
        expect(createThoughtBase(input({ nextThoughtNeeded: false }), 's').nextThoughtNeeded).toBe(
          false
        );
      });

      it('gives a new UUID on every call', () => {
        const a = createThoughtBase(input(), 's');
        const b = createThoughtBase(input(), 's');

        expect(a.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(a.id).not.toBe(b.id);
      });

      it('sets the timestamp to the time of the call and gives each call its own Date', () => {
        const a = createThoughtBase(input(), 's');
        vi.setSystemTime(new Date('2026-01-02T03:04:06.000Z'));
        const b = createThoughtBase(input(), 's');

        expect(a.timestamp.toISOString()).toBe('2026-01-02T03:04:05.000Z');
        expect(b.timestamp.toISOString()).toBe('2026-01-02T03:04:06.000Z');
        expect(a.timestamp).not.toBe(b.timestamp);
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
