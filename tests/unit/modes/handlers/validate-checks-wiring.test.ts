/**
 * Wiring of the shared validation checks.
 *
 * `checkThoughtType` and `checkUncertaintyRange` are tested on their own in ModeHandler.test.ts.
 * These tests show that each handler that uses them passes its own list of valid thought types
 * and puts the result in the answer, so a handler cannot drop or mis-wire a check unseen.
 */

import { describe, it, expect } from 'vitest';
import { AlgorithmicHandler } from '../../../../src/modes/handlers/AlgorithmicHandler.js';
import { ComputabilityHandler } from '../../../../src/modes/handlers/ComputabilityHandler.js';
import { ConstraintHandler } from '../../../../src/modes/handlers/ConstraintHandler.js';
import { CryptanalyticHandler } from '../../../../src/modes/handlers/CryptanalyticHandler.js';
import { HybridHandler } from '../../../../src/modes/handlers/HybridHandler.js';
import { MathematicsHandler } from '../../../../src/modes/handlers/MathematicsHandler.js';
import { ModalHandler } from '../../../../src/modes/handlers/ModalHandler.js';
import { OptimizationHandler } from '../../../../src/modes/handlers/OptimizationHandler.js';
import { PhysicsHandler } from '../../../../src/modes/handlers/PhysicsHandler.js';
import { ShannonHandler } from '../../../../src/modes/handlers/ShannonHandler.js';
import { StochasticHandler } from '../../../../src/modes/handlers/StochasticHandler.js';
import type { ModeHandler } from '../../../../src/modes/handlers/ModeHandler.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

type Named = [string, () => ModeHandler];

const THOUGHT_TYPE_HANDLERS: Named[] = [
  ['ComputabilityHandler', () => new ComputabilityHandler() as never],
  ['ConstraintHandler', () => new ConstraintHandler() as never],
  ['CryptanalyticHandler', () => new CryptanalyticHandler() as never],
  ['HybridHandler', () => new HybridHandler() as never],
  ['MathematicsHandler', () => new MathematicsHandler() as never],
  ['ModalHandler', () => new ModalHandler() as never],
  ['OptimizationHandler', () => new OptimizationHandler() as never],
  ['PhysicsHandler', () => new PhysicsHandler() as never],
  ['StochasticHandler', () => new StochasticHandler() as never],
];

const UNCERTAINTY_HANDLERS: Named[] = [
  ['AlgorithmicHandler', () => new AlgorithmicHandler() as never],
  ['ComputabilityHandler', () => new ComputabilityHandler() as never],
  ['CryptanalyticHandler', () => new CryptanalyticHandler() as never],
  ['MathematicsHandler', () => new MathematicsHandler() as never],
  ['PhysicsHandler', () => new PhysicsHandler() as never],
  ['ShannonHandler', () => new ShannonHandler() as never],
];

const input = (handler: ModeHandler, over: Record<string, unknown>) =>
  ({
    mode: handler.mode,
    thought: 'a real thought',
    thoughtNumber: 1,
    totalThoughts: 2,
    nextThoughtNeeded: true,
    ...over,
  }) as unknown as ThinkingToolInput;

const typeWarnings = (handler: ModeHandler, thoughtType: string) =>
  handler
    .validate(input(handler, { thoughtType }))
    .warnings.filter((w) => w.field === 'thoughtType');

// A handler keeps its list of valid types private, so the test reads it from the warning the
// handler gives for an unknown type: "Valid types: a, b, c".
const listedTypes = (handler: ModeHandler): string[] =>
  (typeWarnings(handler, 'not_a_thought_type')[0]?.suggestion ?? '')
    .replace('Valid types: ', '')
    .split(', ')
    .filter(Boolean);

describe('handlers that use checkThoughtType', () => {
  describe.each(THOUGHT_TYPE_HANDLERS)('%s', (_name, make) => {
    it('warns about an unknown thought type and stays valid', () => {
      const handler = make();
      const result = handler.validate(
        input(handler, { thoughtType: 'not_a_thought_type' }),
      );
      const warnings = result.warnings.filter((w) => w.field === 'thoughtType');

      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toBe(
        'Unknown thought type: not_a_thought_type',
      );
      expect(warnings[0].suggestion).toMatch(/^Valid types: \S/);
      expect(result.errors.filter((e) => e.field === 'thoughtType')).toEqual(
        [],
      );
    });

    it('accepts each type it lists without a thoughtType warning', () => {
      const handler = make();
      const types = listedTypes(handler);

      expect(types.length).toBeGreaterThan(0);
      for (const thoughtType of types) {
        expect(typeWarnings(handler, thoughtType), thoughtType).toEqual([]);
      }
    });

    it('does not warn when the input has no thought type', () => {
      const handler = make();
      const result = handler.validate(input(handler, {}));
      expect(result.warnings.filter((w) => w.field === 'thoughtType')).toEqual(
        [],
      );
    });
  });
});

describe('handlers that use checkUncertaintyRange', () => {
  describe.each(UNCERTAINTY_HANDLERS)('%s', (_name, make) => {
    it.each([-0.5, 1.5])(
      'fails with UNCERTAINTY_OUT_OF_RANGE for %s',
      (uncertainty) => {
        const handler = make();
        const result = handler.validate(input(handler, { uncertainty }));

        expect(result.valid).toBe(false);
        expect(result.errors.filter((e) => e.field === 'uncertainty')).toEqual([
          {
            field: 'uncertainty',
            message: `Uncertainty (${uncertainty}) must be between 0 and 1`,
            code: 'UNCERTAINTY_OUT_OF_RANGE',
          },
        ]);
      },
    );

    it.each([0, 0.5, 1])('accepts the uncertainty %s', (uncertainty) => {
      const handler = make();
      const result = handler.validate(input(handler, { uncertainty }));
      expect(result.errors.filter((e) => e.field === 'uncertainty')).toEqual(
        [],
      );
    });
  });
});
